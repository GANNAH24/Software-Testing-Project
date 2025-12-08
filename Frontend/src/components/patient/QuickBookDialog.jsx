import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import appointmentService from "../../shared/services/appointment.service";

export function QuickBookDialog({
  open,
  onOpenChange,
  doctorName,
  doctorId,
  specialty,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const res = await appointmentService.getAvailableSlots(
          doctorId,
          dateStr
        );
        console.log("Available slots for", dateStr, res?.data);
        setAvailableSlots(res?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch available slots");
      }
    };
    if (selectedDate) fetchSlots();
  }, [selectedDate, doctorId]);

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("❌ Please select a date and time slot");
      return;
    }
    setLoading(true);
    try {
      await appointmentService.create({
        doctor_id: doctorId,
        date: selectedDate.toISOString().split("T")[0],
        time_slot: selectedSlot,
        reason: notes || "General consultation",
        status: "scheduled",
      });

      toast.success(
        `✅ Appointment booked with ${doctorName} on ${selectedDate.toLocaleDateString()} at ${selectedSlot}!`
      );

      // Reset form
      setSelectedDate(null);
      setSelectedSlot(null);
      setNotes("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment");
    } finally {
      setLoading(false);
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
          {/* Date selection */}
          <div>
            <Label className="mb-3 block">Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              disabled={(date) => date < new Date()}
              className="rounded-md border p-2"
            />
          </div>

          {/* Time slot selection */}
          {selectedDate && (
            <div>
              <Label className="mb-3 block">Select Time Slot</Label>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedSlot === slot
                          ? "border-[#667eea] bg-[#667eea]/10"
                          : "border-gray-200 hover:border-[#667eea]/50"
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
                <div className="text-gray-500 py-4">
                  No available slots for this date
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
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedSlot && (
            <div className="bg-[#667eea]/10 border border-[#667eea]/20 rounded-lg p-4">
              <div className="text-sm text-gray-900 mb-2">
                📋 Booking Summary
              </div>
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
                    {selectedDate.toLocaleDateString()}
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
            disabled={!selectedDate || !selectedSlot || loading}
            className="bg-[#667eea] hover:bg-[#5568d3]"
          >
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
