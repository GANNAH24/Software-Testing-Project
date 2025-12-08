import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleWizard({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate time slots from 8 AM to 5 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push(`${startTime}-${endTime}`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const amSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour < 12;
  });
  const pmSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.split(':')[0]);
    return hour >= 12;
  });

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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayName = DAYS_OF_WEEK[dayOfWeek];
    
    const newSelected = new Set(selectedDaysOfWeek);
    if (newSelected.has(dayName)) {
      newSelected.delete(dayName);
    } else {
      newSelected.add(dayName);
    }
    setSelectedDaysOfWeek(newSelected);
  };

  const isDayOfWeekSelected = (date) => {
    if (!date) return false;
    const dayOfWeek = date.getDay();
    const dayName = DAYS_OF_WEEK[dayOfWeek];
    return selectedDaysOfWeek.has(dayName);
  };

  const toggleTimeSlot = (slot) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleContinueToStep2 = () => {
    if (selectedDaysOfWeek.size === 0) {
      toast.error('Please select at least one day');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (selectedTimeSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      // Create recurring schedules for the next 12 weeks
      const promises = [];
      const today = new Date();
      
      // For each selected day of week
      selectedDaysOfWeek.forEach(dayOfWeekEnum => {
        const dayIndex = DAYS_OF_WEEK.indexOf(dayOfWeekEnum);
        
        // Generate dates for the next 12 weeks
        for (let week = 0; week < 12; week++) {
          // Calculate the date for this day in this week
          const targetDate = new Date(today);
          const daysUntilTarget = (dayIndex - today.getDay() + 7) % 7;
          targetDate.setDate(today.getDate() + daysUntilTarget + (week * 7));
          
          // Skip if date is in the past
          if (targetDate < today) continue;
          
          const dateStr = targetDate.toISOString().split('T')[0];
          
          // Create schedule for each time slot
          selectedTimeSlots.forEach(timeSlot => {
            promises.push(
              scheduleService.create({
                date: dateStr,
                time_slot: timeSlot,
                is_available: true,
                day_of_week: dayOfWeekEnum // Backend can use this for recurring logic
              })
            );
          });
        }
      });

      await Promise.all(promises);
      
      toast.success(`Created recurring schedule for ${selectedDaysOfWeek.size} day(s) with ${selectedTimeSlots.length} time slot(s)!`);
      
      // Reset wizard
      setStep(1);
      setSelectedDaysOfWeek(new Set());
      setSelectedTimeSlots([]);
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create recurring schedule:', error);
      toast.error(error.message || 'Failed to create schedule');
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleCancel = () => {
    setStep(1);
    setSelectedDaysOfWeek(new Set());
    setSelectedTimeSlots([]);
    onOpenChange(false);
  };

  const getSelectedDayNames = () => {
    return Array.from(selectedDaysOfWeek)
      .map(day => DAY_NAMES[DAYS_OF_WEEK.indexOf(day)])
      .join(', ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Step 1: Select Days of the Week' : 'Step 2: Select Time Slots'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Click on dates in the calendar. The system will use the day of the week for recurring schedules.' 
              : `Setting recurring schedule for: ${getSelectedDayNames()}`}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div>
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() - 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMonth = new Date(currentMonth);
                  newMonth.setMonth(newMonth.getMonth() + 1);
                  setCurrentMonth(newMonth);
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentMonth).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }
                
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                const isSelected = isDayOfWeekSelected(date);
                const dayOfWeek = date.getDay();
                const dayName = DAY_NAMES[dayOfWeek];
                
                return (
                  <button
                    key={index}
                    disabled={isPast}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative aspect-square rounded-lg p-2 text-sm font-medium transition-all
                      ${isPast ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:border-blue-500'}
                      ${isSelected 
                        ? 'bg-blue-500 text-white border-2 border-blue-500 shadow-md' 
                        : 'border-2 border-gray-200 text-gray-700 hover:bg-blue-50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-base">{date.getDate()}</span>
                      {isSelected && (
                        <span className="text-[10px] mt-1 opacity-90">{dayName}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Days Summary */}
            {selectedDaysOfWeek.size > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900">
                    Selected Days: {selectedDaysOfWeek.size}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDaysOfWeek(new Set())}
                    className="h-7 text-blue-700 hover:text-blue-900"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedDaysOfWeek).map((dayEnum) => {
                    const dayName = DAY_NAMES[DAYS_OF_WEEK.indexOf(dayEnum)];
                    return (
                      <div
                        key={dayEnum}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-300 text-sm font-medium text-blue-900"
                      >
                        <Calendar className="w-3 h-3" />
                        {dayName}
                        <button
                          onClick={() => {
                            const newSelected = new Set(selectedDaysOfWeek);
                            newSelected.delete(dayEnum);
                            setSelectedDaysOfWeek(newSelected);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  💡 The schedule will repeat every week on these days for the next 12 weeks
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* AM Time Slots */}
            <div>
              <h4 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">AM</span>
                Morning (8:00 AM - 11:00 AM)
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {amSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedTimeSlots.includes(slot)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Checkbox
                      checked={selectedTimeSlots.includes(slot)}
                      onCheckedChange={() => toggleTimeSlot(slot)}
                    />
                    <span className="text-sm font-medium">{formatTime(slot)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PM Time Slots */}
            <div>
              <h4 className="text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">PM</span>
                Afternoon (12:00 PM - 5:00 PM)
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {pmSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${selectedTimeSlots.includes(slot)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Checkbox
                      checked={selectedTimeSlots.includes(slot)}
                      onCheckedChange={() => toggleTimeSlot(slot)}
                    />
                    <span className="text-sm font-medium">{formatTime(slot)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedTimeSlots.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  📅 {selectedTimeSlots.length} time slot(s) will be applied to {selectedDaysOfWeek.size} day(s)
                  <br />
                  <span className="text-xs text-green-700 mt-1 block">
                    Total schedules to be created: {selectedTimeSlots.length * selectedDaysOfWeek.size * 12} (for next 12 weeks)
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-6">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleContinueToStep2}
                disabled={selectedDaysOfWeek.size === 0}
                className="bg-[#667eea] hover:bg-[#5568d3]"
              >
                Continue to Time Slots
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedTimeSlots.length === 0}
                className="bg-[#667eea] hover:bg-[#5568d3]"
              >
                Confirm & Create Schedule
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
