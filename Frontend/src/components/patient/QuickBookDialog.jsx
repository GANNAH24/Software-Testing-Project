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
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';
import appointmentService from '../../shared/services/appointment.service';

export function QuickBookDialog({
  open,
  onOpenChange,
  doctorName = 'Dr. Sarah Johnson',
  doctorId,
  specialty = 'Cardiology',
  onSuccess,
}) {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [datesWithSlots, setDatesWithSlots] = useState([]);

  // Load dates with available slots when dialog opens
  useEffect(() => {
    if (!doctorId || !open) {
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
        const result = await scheduleService.byDoctor(doctorId, { 
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
            const slotsResult = await scheduleService.availableSlots(doctorId, date);
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
  }, [doctorId, open]);

  // Load available slots when date is selected
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!doctorId || !selectedDate) {
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
        
        const result = await scheduleService.availableSlots(doctorId, dateStr);
        let slots = result?.data?.availableSlots || result?.availableSlots || [];
        slots = Array.isArray(slots) ? slots : [];
        
        // Filter out past time slots if selected date is today
        const today = new Date();
        const isToday = selectedDate.toDateString() === today.toDateString();
        
        if (isToday) {
          const now = new Date();
          slots = slots.filter(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':');
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return slotDateTime > now;
          });
        }
        
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error loading available slots:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [doctorId, selectedDate]);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    if (!doctorId) {
      toast.error('Doctor information is missing');
      return;
    }

    setBooking(true);
    try {
      const appointmentData = {
        doctor_id: doctorId,
        date: selectedDate.toISOString().split('T')[0],
        time_slot: selectedSlot,
        reason: notes || 'General consultation',
        status: 'scheduled',
      };

      await appointmentService.create(appointmentData);
      
      toast.success(`✅ Appointment booked with ${doctorName} on ${selectedDate.toLocaleDateString()} at ${selectedSlot}!`);
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setNotes('');
      setAvailableSlots([]);
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      toast.error(err.response?.data?.error || 'Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📅 Book Appointment with {doctorName}</DialogTitle>
          <DialogDescription>
            {specialty} • Select an available date and time slot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <Label className="mb-3 block">Select Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
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
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <Label className="mb-3 block">
                Available Time Slots
                {selectedDate && ` - ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}`}
              </Label>
              {loadingSlots ? (
                <div className="text-center py-8 text-gray-500">
                  Loading available slots...
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available slots for this date
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
              )}
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
                  <span className="text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="text-gray-900">{specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
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
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={booking}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedSlot || booking}
            className="bg-[#667eea] hover:bg-[#5568d3]"
          >
            {booking ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
