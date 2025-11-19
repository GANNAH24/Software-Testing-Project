import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
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
import { toast } from 'sonner';



const MOCK_AVAILABLE_SLOTS = [
  { date: '2025-11-15', slots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
  { date: '2025-11-16', slots: ['09:00-10:00', '11:00-12:00', '14:00-15:00'] },
  { date: '2025-11-18', slots: ['10:00-11:00', '11:00-12:00', '15:00-16:00', '16:00-17:00'] },
  { date: '2025-11-19', slots: ['09:00-10:00', '13:00-14:00', '14:00-15:00'] },
  { date: '2025-11-20', slots: ['09:00-10:00', '10:00-11:00', '11:00-12:00'] },
];

export function QuickBookDialog({
  open,
  onOpenChange,
  doctorName = 'Dr. Sarah Johnson',
  doctorId,
  specialty = 'Cardiology',
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('❌ Please select a date and time slot');
      return;
    }

    toast.success(`✅ Appointment booked with ${doctorName} on ${new Date(selectedDate).toLocaleDateString()} at ${selectedSlot}!`);
    
    // Reset form
    setSelectedDate(null);
    setSelectedSlot(null);
    setNotes('');
    onOpenChange(false);
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MOCK_AVAILABLE_SLOTS.map((dateSlot) => (
                <button
                  key={dateSlot.date}
                  onClick={() => {
                    setSelectedDate(dateSlot.date);
                    setSelectedSlot(null);
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedDate === dateSlot.date
                      ? 'border-[#667eea] bg-[#667eea]/10'
                      : 'border-gray-200 hover:border-[#667eea]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#667eea]" />
                    <span className="text-sm text-gray-900">
                      {new Date(dateSlot.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {dateSlot.slots.length} slots available
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <Label className="mb-3 block">Select Time Slot</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MOCK_AVAILABLE_SLOTS
                  .find(d => d.date === selectedDate)
                  ?.slots.map((slot) => (
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBooking}
            disabled={!selectedDate || !selectedSlot}
            className="bg-[#667eea] hover:bg-[#5568d3]"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
