import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, // Added for Year navigation
  ChevronsRight, // Added for Year navigation
  X, 
  Clock 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * ScheduleModal Component
 */
export function ScheduleModal({ open, onOpenChange, onSuccess, workingHours }) {
  const [step, setStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedDates(new Set());
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Adjust starting day so Monday = 0, Sunday = 6 (standard for many calendars)
    // Or keep standard JS where Sunday = 0.
    // Based on your image: MON is first.
    let startingDayOfWeek = firstDay.getDay(); 
    // Convert Sunday(0) to 6, Mon(1) to 0, etc.
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }
    return days;
  };

  const handleDateClick = (dateObj) => {
    if (!dateObj || !dateObj.date || !dateObj.isCurrentMonth) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj.date < today) {
      toast.error('Cannot select past dates');
      return;
    }

    const dateStr = dateObj.date.toISOString().split('T')[0];
    const newSelected = new Set(selectedDates);
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    setSelectedDates(newSelected);
  };

  const isDateSelected = (dateObj) => {
    if (!dateObj || !dateObj.date) return false;
    const dateStr = dateObj.date.toISOString().split('T')[0];
    return selectedDates.has(dateStr);
  };

  const isPastDate = (dateObj) => {
    if (!dateObj || !dateObj.date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj.date < today;
  };

  const toggleTimeSlot = (slot) => {
    if (selectedTimeSlots.includes(slot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slot]);
    }
  };

  const handleContinueToStep2 = () => {
    if (selectedDates.size === 0) {
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
      const schedulePromises = [];
      selectedDates.forEach(dateStr => {
        selectedTimeSlots.forEach(timeSlot => {
          const date = new Date(dateStr);
          const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
          schedulePromises.push(
            scheduleService.create({
              date: dateStr,
              time_slot: timeSlot,
              is_available: true,
              day_of_week: dayOfWeek
            })
          );
        });
      });
      await Promise.all(schedulePromises);
      toast.success(`Created ${selectedDates.size * selectedTimeSlots.length} schedule slot(s) successfully!`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create schedules:', error);
      toast.error('Failed to create schedules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prevYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(currentMonth.getFullYear() - 1);
    setCurrentMonth(newDate);
  };

  const nextYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(currentMonth.getFullYear() + 1);
    setCurrentMonth(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);

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
          <div className="py-6 px-4">
            
            {/* --- UPDATED HEADER LAYOUT --- */}
            <div className="flex items-center justify-between mb-8 px-2 text-[#667eea]">
              {/* Left Controls (Prev Year / Prev Month) */}
              <div className="flex items-center gap-4">
                 <button 
                  onClick={prevYear} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Previous Year"
                 >
                   <ChevronsLeft className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={previousMonth} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Previous Month"
                 >
                   <ChevronLeft className="w-5 h-5" />
                 </button>
              </div>

              {/* Center Title */}
              <h3 className="text-xl md:text-2xl font-bold">
                {monthName}
              </h3>

              {/* Right Controls (Next Month / Next Year) */}
              <div className="flex items-center gap-4">
                 <button 
                  onClick={nextMonth} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Next Month"
                 >
                   <ChevronRight className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={nextYear} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Next Year"
                 >
                   <ChevronsRight className="w-5 h-5" />
                 </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl p-4 md:p-8">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-4">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                  <div key={day} className="text-center">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      {day}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 md:gap-3">
                {days.map((dateObj, index) => {
                  const isPast = isPastDate(dateObj);
                  const isSelected = isDateSelected(dateObj);
                  const isCurrentMonth = dateObj.isCurrentMonth;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(dateObj)}
                      disabled={!isCurrentMonth || isPast}
                      className={`
                        relative h-12 md:h-16 flex items-center justify-center
                        rounded-lg md:rounded-xl text-lg font-semibold
                        transition-all duration-200
                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                        ${isPast && isCurrentMonth ? 'text-gray-400 cursor-not-allowed' : ''}
                        ${isSelected 
                          ? 'bg-[#667eea] text-white shadow-md' 
                          : isCurrentMonth && !isPast 
                            ? 'hover:bg-gray-100 hover:text-[#667eea]' 
                            : ''
                        }
                      `}
                    >
                      {dateObj.date?.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDates.size > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-[#667eea] text-center">
                  ✓ {selectedDates.size} date{selectedDates.size > 1 ? 's' : ''} selected
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
                      {selectedTimeSlots.length} time slot(s) selected for {selectedDates.size} date(s) = 
                      <span className="ml-1 font-bold">
                        {selectedTimeSlots.length * selectedDates.size} total schedule(s)
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
                disabled={selectedDates.size === 0}
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