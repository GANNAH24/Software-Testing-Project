import { useState, useEffect } from 'react';
import {
  X,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * ScheduleModal Component
 */
export function ScheduleModal({ open, onOpenChange, onSuccess, workingHours }) {
  const [step, setStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedDates([]);
      setSelectedTimeSlots([]);
    }
  }, [open]);

  // Generate time slots filtered by working hours
  const generateTimeSlots = () => {
    if (!workingHours || !workingHours.start || !workingHours.end) {
      return generateSlotsInRange(8, 17);
    }
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    return generateSlotsInRange(startHour, endHour);
  };

  const generateSlotsInRange = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push(`${startTime}-${endTime}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const splitSlotsByPeriod = () => {
    const am = timeSlots.filter(slot => parseInt(slot.split(':')[0]) < 12);
    const pm = timeSlots.filter(slot => parseInt(slot.split(':')[0]) >= 12);
    return { am, pm };
  };

  const { am: amSlots, pm: pmSlots } = splitSlotsByPeriod();

  const formatTime = (slot) => {
    const [start, end] = slot.split('-');
    const formatHour = (time) => {
      const [hour, min] = time.split(':');
      const h = parseInt(hour);
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:${min} ${period}`;
    };
    return `${formatHour(start)} - ${formatHour(end)}`;
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    const dateStr = date.toISOString().split('T')[0];
    const index = selectedDates.findIndex(d => d.toISOString().split('T')[0] === dateStr);

    if (index > -1) {
      // Remove if already selected
      setSelectedDates(selectedDates.filter((_, i) => i !== index));
    } else {
      // Add to selection
      setSelectedDates([...selectedDates, date]);
    }
  };

  const isDateSelected = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };

  const toggleTimeSlot = (slot) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleContinueToStep2 = () => {
    if (selectedDates.length === 0) {
      toast.error('Please select at least one date');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = async () => {
    if (selectedTimeSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      setLoading(true);

      // Helper function to format date in local timezone (avoid UTC conversion)
      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Fetch existing schedules for all selected dates to check for duplicates
      const existingSchedulesMap = new Map();
      for (const date of selectedDates) {
        const dateStr = formatLocalDate(date);
        try {
          const response = await scheduleService.list({ date: dateStr });
          const existing = response?.data || response?.schedules || response || [];
          existingSchedulesMap.set(dateStr, existing);
        } catch (err) {
          // If we can't fetch existing, continue anyway
          existingSchedulesMap.set(dateStr, []);
        }
      }

      // Create only schedules that don't already exist
      const schedulePromises = [];
      const duplicates = [];

      selectedDates.forEach(date => {
        const dateStr = formatLocalDate(date);
        const existingForDate = existingSchedulesMap.get(dateStr) || [];

        selectedTimeSlots.forEach(timeSlot => {
          // Check if this exact time slot already exists
          const isDuplicate = existingForDate.some(existing => {
            const existingSlot = existing.time_slot || existing.timeSlot;
            return existingSlot === timeSlot;
          });

          if (isDuplicate) {
            duplicates.push({ date: dateStr, slot: timeSlot });
          } else {
            const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
            schedulePromises.push(
              scheduleService.create({
                date: dateStr,
                time_slot: timeSlot,
                is_available: true,
                day_of_week: dayOfWeek
              })
            );
          }
        });
      });

      // Execute all creation promises
      if (schedulePromises.length > 0) {
        await Promise.all(schedulePromises);
        const successCount = schedulePromises.length;
        const skippedCount = duplicates.length;

        if (skippedCount > 0) {
          toast.success(`Created ${successCount} new slot(s). Skipped ${skippedCount} duplicate(s).`);
        } else {
          toast.success(`Created ${successCount} schedule slot(s) successfully!`);
        }

        onSuccess();
        onOpenChange(false);
      } else {
        toast.warning('All selected time slots already exist. No new schedules created.');
      }
    } catch (error) {
      console.error('Failed to create schedules:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create schedules. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 1 ? 'Select Dates' : 'Select Time Slots'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Click multiple dates to apply the same schedule to all of them'
              : `Choose time slots within your working hours (${workingHours?.start || '08:00'} - ${workingHours?.end || '17:00'})`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Calendar Date Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates || [])}
                disabled={(date) =>
                  date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className="rounded-md border"
              />
            </div>

            {selectedDates.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-[#667eea] text-center">
                  ✓ {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Time Slot Selection (Kept as provided) */}
        {step === 2 && (
          <div className="py-4">
            {timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No working hours configured</p>
                <p className="text-sm text-gray-500">
                  Please set your working hours in your profile first
                </p>
              </div>
            ) : (
              <>
                {/* AM Slots */}
                {amSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Morning (AM)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {amSlots.map((slot) => {
                        const isSelected = selectedTimeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleTimeSlot(slot)}
                            className={`
                              p-3 rounded-lg border-2 text-sm font-medium
                              transition-all duration-200
                              ${isSelected
                                ? 'bg-[#667eea] border-[#667eea] text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[#667eea] hover:bg-blue-50'
                              }
                            `}
                          >
                            {formatTime(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PM Slots */}
                {pmSlots.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Afternoon (PM)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {pmSlots.map((slot) => {
                        const isSelected = selectedTimeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleTimeSlot(slot)}
                            className={`
                              p-3 rounded-lg border-2 text-sm font-medium
                              transition-all duration-200
                              ${isSelected
                                ? 'bg-[#667eea] border-[#667eea] text-white shadow-md'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-[#667eea] hover:bg-blue-50'
                              }
                            `}
                          >
                            {formatTime(slot)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedTimeSlots.length > 0 && (
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      {selectedTimeSlots.length} time slot(s) selected for {selectedDates.length} date(s) =
                      <span className="ml-1 font-bold">
                        {selectedTimeSlots.length * selectedDates.length} total schedule(s)
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinueToStep2}
                disabled={selectedDates.length === 0}
                className="bg-[#667eea] hover:bg-[#5568d3]"
              >
                Continue to Time Slots
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedTimeSlots.length === 0 || loading}
                className="bg-[#667eea] hover:bg-[#5568d3]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating...
                  </>
                ) : (
                  'Confirm & Create'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}