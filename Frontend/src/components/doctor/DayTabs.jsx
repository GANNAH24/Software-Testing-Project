import { useState } from 'react';
import { Clock, Trash2, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function DayTabs({ schedules, onScheduleDeleted }) {
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [deletingId, setDeletingId] = useState(null);

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

  // Group schedules by day of week
  const getSchedulesForDay = (dayEnum) => {
    return schedules.filter(schedule => {
      // Get day of week from schedule date
      const date = new Date(schedule.date);
      const dayIndex = date.getDay();
      const scheduleDayEnum = DAYS_OF_WEEK[dayIndex];
      return scheduleDayEnum === dayEnum;
    });
  };

  // Get unique time slots for a day (recurring pattern)
  const getUniqueTimeSlotsForDay = (dayEnum) => {
    const daySchedules = getSchedulesForDay(dayEnum);
    const uniqueSlots = new Set();
    const slotMap = new Map();

    daySchedules.forEach(schedule => {
      const slot = schedule.time_slot || schedule.timeSlot;
      if (!uniqueSlots.has(slot)) {
        uniqueSlots.add(slot);
        slotMap.set(slot, {
          timeSlot: slot,
          scheduleIds: [schedule.id],
          dates: [schedule.date],
          isAvailable: schedule.is_available || schedule.isAvailable
        });
      } else {
        const existing = slotMap.get(slot);
        existing.scheduleIds.push(schedule.id);
        existing.dates.push(schedule.date);
      }
    });

    return Array.from(slotMap.values()).sort((a, b) => {
      const hourA = parseInt(a.timeSlot.split(':')[0]);
      const hourB = parseInt(b.timeSlot.split(':')[0]);
      return hourA - hourB;
    });
  };

  const handleDeleteRecurringSlot = async (slotData) => {
    const dayName = DAY_NAMES[DAYS_OF_WEEK.indexOf(selectedDay)];
    
    if (!confirm(`Are you sure you want to delete the ${formatTime(slotData.timeSlot)} slot from all ${dayName}s? This will delete ${slotData.scheduleIds.length} schedule(s).`)) {
      return;
    }

    try {
      setDeletingId(slotData.timeSlot);
      
      // Delete all schedules for this recurring time slot
      await Promise.all(slotData.scheduleIds.map(id => scheduleService.remove(id)));
      
      toast.success(`Deleted ${slotData.scheduleIds.length} recurring schedule(s)`);
      onScheduleDeleted();
    } catch (error) {
      console.error('Failed to delete recurring schedule:', error);
      toast.error('Failed to delete schedule');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
        <TabsList className="grid w-full grid-cols-7 mb-6">
          {DAYS_OF_WEEK.map((day, index) => (
            <TabsTrigger 
              key={day} 
              value={day}
              className="data-[state=active]:bg-[#667eea] data-[state=active]:text-white"
            >
              {DAY_NAMES[index]}
            </TabsTrigger>
          ))}
        </TabsList>

        {DAYS_OF_WEEK.map((day, dayIndex) => {
          const uniqueSlots = getUniqueTimeSlotsForDay(day);
          
          return (
            <TabsContent key={day} value={day} className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#667eea]" />
                      {DAY_NAMES[dayIndex]} Schedule
                    </h3>
                    <span className="text-sm text-gray-600">
                      {uniqueSlots.length} recurring time slot(s)
                    </span>
                  </div>

                  {uniqueSlots.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-gray-900 font-medium mb-2">No Schedule Set</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        You haven't set any recurring time slots for {DAY_NAMES[dayIndex]}s yet.
                      </p>
                      <p className="text-xs text-gray-500">
                        Click "Add Recurring Schedule" to get started
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {uniqueSlots.map((slotData) => (
                        <div
                          key={slotData.timeSlot}
                          className="group relative p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {formatTime(slotData.timeSlot)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Repeats every {DAY_NAMES[dayIndex]}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {slotData.scheduleIds.length} occurrence(s)
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteRecurringSlot(slotData)}
                              disabled={deletingId === slotData.timeSlot}
                            >
                              {deletingId === slotData.timeSlot ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          {slotData.isAvailable ? (
                            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                              Available
                            </div>
                          ) : (
                            <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                              Unavailable
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
