import { useState } from 'react';
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
import { mockDoctors } from '../../lib/mockData';



// Mock available slots for any given date
const getAvailableSlotsForDate = (date)=> {
  if (!date) return [];
  
  // Mock logic: different slots for different days of week
  const dayOfWeek = date.getDay();
  const baseSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
  ];
  
  // Weekends have fewer slots
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return baseSlots.slice(0, 3);
  }
  
  return baseSlots;
};

export function CalendarBookDialog({
  open,
  onOpenChange,
  preSelectedDoctorId,
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState(preSelectedDoctorId || '');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');

  const availableSlots = getAvailableSlotsForDate(selectedDate);
  const selectedDoctor = mockDoctors.find(d => d.id === selectedDoctorId);

  const handleConfirmBooking = () => {
    if (!selectedDoctorId) {
      toast.error('❌ Please select a doctor');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      toast.error('❌ Please select a date and time slot');
      return;
    }

    const doctor = mockDoctors.find(d => d.id === selectedDoctorId);
    toast.success(`✅ Appointment booked with ${doctor?.name} on ${selectedDate.toLocaleDateString()} at ${selectedSlot}!`);
    
    // Reset form
    setSelectedDoctorId(preSelectedDoctorId || '');
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setNotes('');
    onOpenChange(false);
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
                  {mockDoctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
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
                    className="rounded-md"
                  />
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && availableSlots.length > 0 && (
                <div>
                  <Label className="mb-3 block">
                    Available Slots for {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Label>
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
