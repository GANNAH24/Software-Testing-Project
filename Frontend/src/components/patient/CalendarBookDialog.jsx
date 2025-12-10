import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import doctorService from '../../shared/services/doctor.service';
import appointmentService from '../../shared/services/appointment.service';
import scheduleService from '../../shared/services/schedule.service';

export function CalendarBookDialog({
  open,
  onOpenChange,
  preSelectedDoctorId,
  onSuccess,
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctorId || '');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState([]);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const result = await doctorService.list();
        const list = result?.data || result || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error loading doctors:', err);
      }
    };
    if (open) {
      loadDoctors();
      // Reset dates when dialog opens to force fresh check
      setDatesWithSlots([]);
    }
  }, [open]);

  // Load dates with available slots when doctor is selected
  useEffect(() => {
    if (!selectedDoctorId) {
      setDatesWithSlots([]);
      return;
    }

    const loadDatesWithSlots = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const startDate = `${year}-${month}-${day}`;
        
        // Get schedules for the next 60 days
        const result = await scheduleService.byDoctor(selectedDoctorId, { 
          startDate: startDate
        });
        
        // Extract schedules array from response
        const schedules = result?.data?.data || result?.data || [];
        
        // Filter only schedules marked as available
        const availableSchedules = Array.isArray(schedules) 
          ? schedules.filter(s => s.is_available === true)
          : [];
        
        // Get unique dates
        const uniqueDates = [...new Set(availableSchedules.map(s => s.date))];
        
        // Check each date for actual available slots (not booked)
        const checkPromises = uniqueDates.map(async (date) => {
          try {
            const slotsResult = await scheduleService.availableSlots(selectedDoctorId, date);
            const slots = slotsResult?.data?.availableSlots || [];
            
            if (slots.length === 0) return null;
            
            // Filter out past time slots if this is today
            const [checkYear, checkMonth, checkDay] = date.split('-').map(Number);
            const checkDate = new Date(checkYear, checkMonth - 1, checkDay);
            const isToday = checkDate.toDateString() === today.toDateString();
            
            if (isToday) {
              const now = new Date();
              const futureSlots = slots.filter(slot => {
                const [startTime] = slot.split('-');
                const [hours, minutes] = startTime.split(':');
                const slotDateTime = new Date(checkDate);
                slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                return slotDateTime > now;
              });
              return futureSlots.length > 0 ? date : null;
            }
            
            return date;
          } catch (err) {
            return null;
          }
        });
        
        const results = await Promise.all(checkPromises);
        const datesWithActualSlots = results.filter(date => date !== null);
        
        setDatesWithSlots(datesWithActualSlots);
      } catch (err) {
        console.error('Error loading dates with slots:', err);
        setDatesWithSlots([]);
      }
    };

    loadDatesWithSlots();
  }, [selectedDoctorId]);

  // Load available slots when doctor and date are selected
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDoctorId || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        // Format date in local timezone to avoid UTC conversion issues
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const result = await scheduleService.availableSlots(selectedDoctorId, dateStr);
        let slots = result?.data?.availableSlots || result?.availableSlots || [];
        slots = Array.isArray(slots) ? slots : [];
        
        // Filter out past time slots if selected date is today
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();
        
        if (isToday) {
          const now = new Date();
          slots = slots.filter(slot => {
            // Extract start time from slot (e.g., "09:00-10:00" -> "09:00")
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':');
            
            // Create a date object for the slot time
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Only show slots that are in the future
            return slotDateTime > now;
          });
        }
        
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading available slots:', err);
        // Fallback to default slots if API fails, filtered for today
        let defaultSlots = [
          '09:00-10:00',
          '10:00-11:00',
          '11:00-12:00',
          '14:00-15:00',
          '15:00-16:00',
          '16:00-17:00',
        ];
        
        // Filter out past slots if today
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();
        
        if (isToday) {
          const now = new Date();
          defaultSlots = defaultSlots.filter(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':');
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDateTime > now;
          });
        }
        
        setAvailableSlots(defaultSlots);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find(d => d.doctor_id === selectedDoctorId || d.id === selectedDoctorId);

  const handleConfirmBooking = async () => {
    if (!selectedDoctorId) {
      toast.error('❌ Please select a doctor');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast.error('❌ Please select a date and time slot');
      return;
    }

    setLoading(true);
    try {
      // Format date in local timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const appointmentData = {
        doctor_id: selectedDoctorId,
        date: dateStr,
        time_slot: selectedSlot,
        reason: notes || 'General consultation',
        status: 'scheduled'
      };
      
      await appointmentService.create(appointmentData);
      const doctor = doctors.find(d => d.doctor_id === selectedDoctorId || d.id === selectedDoctorId);
      toast.success(`✅ Appointment booked with ${doctor?.name} on ${selectedDate.toLocaleDateString()} at ${selectedSlot}!`);
      
      // Reset form
      setSelectedDoctorId(preSelectedDoctorId || '');
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setNotes('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (err) {
      console.error('Error booking appointment:', err);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset slot when date changes
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📅 Book New Appointment</DialogTitle>
          <DialogDescription>
            Select a doctor, your preferred date, and available time slot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Selection */}
          {!preSelectedDoctorId && (
            <div>
              <Label htmlFor="doctor" className="mb-3 block">Select Doctor</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Choose a doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.doctor_id || doctor.id} value={doctor.doctor_id || doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDoctorId && selectedDoctor && (
            <>
              {/* Selected Doctor Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                    <span className="text-white">
                      {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{selectedDoctor.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{selectedDoctor.specialty}</p>
                    <p className="text-sm text-gray-500">{selectedDoctor.location}</p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div>
                <Label className="mb-3 block">Select Date</Label>
                <div className="flex justify-center border rounded-lg p-4 bg-white">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => 
                      date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    modifiers={{
                      hasSlots: (date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const dateStr = `${year}-${month}-${day}`;
                        return datesWithSlots.includes(dateStr);
                      }
                    }}
                    modifiersClassNames={{
                      hasSlots: 'bg-green-100 text-green-900 font-semibold hover:bg-green-200'
                    }}
                    className="rounded-md"
                  />
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <Label className="mb-3 block">
                    Available Slots for {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Label>
                  {loadingSlots ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p>Loading available slots...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedSlot === slot
                              ? 'border-[#667eea] bg-[#667eea]/10'
                              : 'border-gray-200 hover:border-[#667eea]/50'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-[#667eea]" />
                            <span className="text-sm text-gray-900">{slot}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <p>No available slots for this date</p>
                      <p className="text-sm mt-1">Please select a different date</p>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && availableSlots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No available slots for this date. Please select another date.
                </div>
              )}

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or information for the doctor..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedSlot && (
                <div className="bg-[#667eea]/10 border border-[#667eea]/20 rounded-lg p-4">
                  <div className="text-sm text-gray-900 mb-2">📋 Booking Summary</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="text-gray-900">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty:</span>
                      <span className="text-gray-900">{selectedDoctor.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">
                        {selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-gray-900">{selectedSlot}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            disabled={!selectedDoctorId || !selectedDate || !selectedSlot}
            className="bg-[#667eea] hover:bg-[#5568d3]"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
