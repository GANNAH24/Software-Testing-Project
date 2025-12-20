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
  doctorName,
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

        const result = await scheduleService.byDoctor(doctorId, {
          startDate,
        });

        const schedules = result?.data?.data || result?.data || [];
        const availableSchedules = Array.isArray(schedules)
          ? schedules.filter(s => s.is_available === true)
          : [];

        const uniqueDates = [...new Set(availableSchedules.map(s => s.date))];

        const checkPromises = uniqueDates.map(async date => {
          try {
            const slotsResult = await scheduleService.availableSlots(
              doctorId,
              date
            );
            const slots = slotsResult?.data?.availableSlots || [];
            if (slots.length === 0) return null;

            const [y, m, d] = date.split('-').map(Number);
            const checkDate = new Date(y, m - 1, d);
            const isToday =
              checkDate.toDateString() === today.toDateString();

            if (isToday) {
              const now = new Date();
              const futureSlots = slots.filter(slot => {
                const [startTime] = slot.split('-');
                const [h, min] = startTime.split(':');
                const slotDateTime = new Date(checkDate);
                slotDateTime.setHours(parseInt(h), parseInt(min), 0, 0);
                return slotDateTime > now;
              });
              return futureSlots.length > 0 ? date : null;
            }

            return date;
          } catch {
            return null;
          }
        });

        const results = await Promise.all(checkPromises);
        setDatesWithSlots(results.filter(Boolean));
      } catch (err) {
        console.error('Error loading dates with slots:', err);
        setDatesWithSlots([]);
      }
    };

    loadDatesWithSlots();
  }, [doctorId, open]);

  // Load available slots when date is selected
  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const loadAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const result = await scheduleService.availableSlots(
          doctorId,
          dateStr
        );

        let slots =
          result?.data?.availableSlots || result?.availableSlots || [];

        const today = new Date();
        const isToday =
          selectedDate.toDateString() === today.toDateString();

        if (isToday) {
          const now = new Date();
          slots = slots.filter(slot => {
            const [startTime] = slot.split('-');
            const [h, min] = startTime.split(':');
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(parseInt(h), parseInt(min), 0, 0);
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
      // Format date as local date string (YYYY-MM-DD) to avoid timezone issues
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      await appointmentService.create({
        doctor_id: doctorId,
        date: dateStr,
        time_slot: selectedSlot,
        reason: notes || 'General consultation',
        status: 'scheduled',
      });

      toast.success(
        `✅ Appointment booked with ${doctorName} on ${selectedDate.toLocaleDateString()} at ${selectedSlot}!`
      );

      setSelectedDate(undefined);
      setSelectedSlot(null);
      setNotes('');
      setAvailableSlots([]);
      onOpenChange(false);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error booking appointment:', err);
      toast.error(
        err.response?.data?.error ||
          'Failed to book appointment. Please try again.'
      );
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
            {specialty} • Select a date and time slot
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">Select Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                disabled={date => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                modifiers={{
                  hasSlots: date => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    return datesWithSlots.includes(`${y}-${m}-${d}`);
                  },
                }}
                modifiersClassNames={{
                  hasSlots:
                    'bg-green-100 text-green-900 font-semibold hover:bg-green-200',
                }}
                className="rounded-md border"
              />
            </div>
          </div>

          {selectedDate && (
            <div>
              <Label className="mb-3 block">Available Time Slots</Label>

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
                  {availableSlots.map(slot => (
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
                        <span className="text-sm">{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
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
