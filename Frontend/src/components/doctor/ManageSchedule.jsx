import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit2, Clock, Lock, Trash2, X, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import scheduleService from '../../shared/services/schedule.service';
import doctorService from '../../shared/services/doctor.service';
import { ScheduleModal } from './ScheduleModal';
import { BlockTimeModal } from './BlockTimeModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ManageSchedule() {
  const { user } = useAuthContext();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '17:00' });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [view, setView] = useState('weekly'); // 'weekly' or 'daily'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockingSlot, setBlockingSlot] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editForm, setEditForm] = useState({ time_slot: '', is_available: true });
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  useEffect(() => {
    initializeData();
  }, [user]);

  async function initializeData() {
    await Promise.all([fetchSchedules(), fetchDoctorProfile()]);
  }

  async function fetchSchedules() {
    try {
      setLoading(true);
      // Only fetch schedules from today onwards by default
      const today = new Date().toISOString().split('T')[0];
      const response = await scheduleService.list({ startDate: today });
      const data = response?.data || response?.schedules || response || [];
      console.log('Fetched schedules response:', response);
      console.log('Processed schedules data:', data);
      if (data.length > 0) {
        console.log('First schedule example:', data[0]);
      }
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDoctorProfile() {
    try {
      if (!user || !user.id) return;
      
      // Fetch doctor profile to get working hours
      const response = await doctorService.profile(user.id);
      const doctorData = response?.data || response;
      
      // Check if doctor has working hours set
      if (doctorData?.working_hours_start && doctorData?.working_hours_end) {
        setWorkingHours({
          start: doctorData.working_hours_start,
          end: doctorData.working_hours_end
        });
      } else if (doctorData?.workingHours) {
        // Alternative field names
        setWorkingHours(doctorData.workingHours);
      }
      
      console.log('Doctor working hours:', workingHours);
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
      // Use default working hours if fetch fails
      toast.info('Using default working hours (9 AM - 5 PM)');
    }
  }

  async function handleBlockSlot(slotId) {
    try {
      setBlockingSlot(slotId);
      // Toggle availability
      const schedule = schedules.find(s => s.schedule_id === slotId || s.id === slotId);
      await scheduleService.update(slotId, {
        is_available: !schedule.is_available
      });
      toast.success(schedule.is_available ? 'Time slot blocked' : 'Time slot unblocked');
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to block slot:', error);
      toast.error('Failed to update slot');
    } finally {
      setBlockingSlot(null);
    }
  }

  function handleEditClick(date) {
    setEditingDate(date);
    setShowEditDialog(true);
  }

  function handleEditSlot(slot) {
    setEditingSlot(slot.id);
    setEditForm({
      time_slot: slot.timeSlot,
      is_available: slot.isAvailable
    });
  }

  async function handleSaveEdit(slotId) {
    try {
      await scheduleService.update(slotId, editForm);
      toast.success('Time slot updated successfully');
      setEditingSlot(null);
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to update slot:', error);
      toast.error('Failed to update time slot');
    }
  }

  function handleCancelEdit() {
    setEditingSlot(null);
    setEditForm({ time_slot: '', is_available: true });
  }

  function handleDeleteSlotClick(slotId, date) {
    setSlotToDelete({ id: slotId, date, isMultiple: false });
    setShowDeleteConfirm(true);
  }

  function handleDeleteAllForDayClick(date) {
    const slots = getTimeSlotsForDate(date);
    setSlotToDelete({ slots, date, isMultiple: true });
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    if (!slotToDelete) {
      console.error('No slot to delete');
      return;
    }

    try {
      setDeletingSlot(slotToDelete.id || 'multiple');
      
      if (slotToDelete.isMultiple) {
        // Delete all slots for the day
        console.log('Deleting multiple slots:', slotToDelete.slots);
        const deletePromises = slotToDelete.slots.map(slot => {
          console.log('Deleting slot ID:', slot.id);
          return scheduleService.remove(slot.id);
        });
        await Promise.all(deletePromises);
        toast.success(`Deleted ${slotToDelete.slots.length} time slot(s)`);
      } else {
        // Delete single slot
        console.log('Deleting single slot ID:', slotToDelete.id);
        const response = await scheduleService.remove(slotToDelete.id);
        console.log('Delete response:', response);
        toast.success('Time slot deleted successfully');
      }
      
      await fetchSchedules();
      setShowDeleteConfirm(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Failed to delete slot:', error);
      console.error('Error details:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete time slot';
      toast.error(errorMessage);
    } finally {
      setDeletingSlot(null);
    }
  }

  // Get current week dates starting from today
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1); // Get Monday of current week
    
    const weekDates = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  // Group schedules by day of week
  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  // Get unique time slots for a day (sorted)
  const getTimeSlotsForDate = (date) => {
    const daySchedules = getSchedulesForDate(date);
    return daySchedules
      .map(s => ({
        timeSlot: s.time_slot || s.timeSlot,
        isAvailable: s.is_available ?? s.isAvailable ?? true,
        id: s.schedule_id || s.id
      }))
      .sort((a, b) => {
        const hourA = parseInt(a.timeSlot.split(':')[0]);
        const hourB = parseInt(b.timeSlot.split(':')[0]);
        return hourA - hourB;
      });
  };

  // Check if day has available slots
  const isDayAvailable = (date) => {
    const slots = getTimeSlotsForDate(date);
    return slots.some(slot => slot.isAvailable);
  };

  const formatTime = (slot) => {
    const [start, end] = slot.split('-');
    return `${start}-${end}`;
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateInput = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateLong = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const weekDates = getCurrentWeekDates();

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Schedule</h1>
              <p className="text-gray-600">Set your availability and manage time slots</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowBlockModal(true)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Lock className="w-4 h-4 mr-2" />
                Block Time
              </Button>
              <Button 
                onClick={() => setShowScheduleModal(true)} 
                className="bg-[#667eea] hover:bg-[#5568d3] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === 'weekly' ? 'default' : 'outline'}
              onClick={() => setView('weekly')}
              className={view === 'weekly' ? 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-50' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
            >
              Weekly View
            </Button>
            <Button
              variant={view === 'daily' ? 'default' : 'outline'}
              onClick={() => setView('daily')}
              className={view === 'daily' ? 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-50' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}
            >
              Daily View
            </Button>
          </div>
        </div>

        {/* Weekly View */}
        {view === 'weekly' && (
          <>
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Schedule Set</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create your weekly schedule to let patients know when you're available.
                  </p>
                  <Button 
                    onClick={() => setShowScheduleModal(true)} 
                    className="bg-[#667eea] hover:bg-[#5568d3]"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {weekDates.map((date, index) => {
                  const dayName = DAY_NAMES[date.getDay()];
                  const timeSlots = getTimeSlotsForDate(date);
                  const isAvailable = isDayAvailable(date);
                  
                  return (
                    <Card key={index} className="bg-white shadow-sm">
                      <CardContent className="p-6">
                        {/* Day Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{dayName}</h3>
                            <div className="text-sm text-gray-500 mt-1">
                              {formatDate(date)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                                Unavailable
                              </span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(date)}
                              className="text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAllForDayClick(date)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.length === 0 ? (
                            <div className="text-center py-6 w-full">
                              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-400">No time slots set for this day</p>
                            </div>
                          ) : (
                            timeSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                                  slot.isAvailable 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'bg-gray-100 text-gray-500 border border-gray-300'
                                }`}
                              >
                                <Clock className="w-4 h-4" />
                                {formatTime(slot.timeSlot)}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Daily View */}
        {view === 'daily' && (
          <div className="space-y-6">
            {/* Date Picker */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                />
              </CardContent>
            </Card>

            {/* Daily Schedule */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Schedule for {formatDateLong(selectedDate)}
                </h3>

                <div className="space-y-3">
                  {getTimeSlotsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No time slots available for this date</p>
                      <Button
                        onClick={() => setShowScheduleModal(true)}
                        className="mt-4 bg-[#667eea] hover:bg-[#5568d3]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Schedule
                      </Button>
                    </div>
                  ) : (
                    getTimeSlotsForDate(selectedDate).map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatTime(slot.timeSlot)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium ${
                            slot.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {slot.isAvailable ? 'Available' : 'Blocked'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlockSlot(slot.id)}
                            disabled={blockingSlot === slot.id}
                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            {blockingSlot === slot.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent" />
                            ) : (
                              slot.isAvailable ? 'Block' : 'Unblock'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Schedule Modal - with working hours filtering */}
        <ScheduleModal
          open={showScheduleModal}
          onOpenChange={setShowScheduleModal}
          onSuccess={fetchSchedules}
          workingHours={workingHours}
        />

        {/* Block Time Modal */}
        <BlockTimeModal
          open={showBlockModal}
          onOpenChange={setShowBlockModal}
          onSuccess={fetchSchedules}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          message={
            slotToDelete?.isMultiple
              ? `Are you sure you want to delete all ${slotToDelete.slots?.length} time slot(s) for ${formatDate(slotToDelete.date)}? This action cannot be undone.`
              : "Are you sure you want to remove this slot? This action cannot be undone."
          }
          loading={deletingSlot !== null}
        />

        {/* Edit Dialog for Weekly View */}
        {showEditDialog && editingDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Edit Schedule for {formatDate(editingDate)}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingDate(null);
                      setEditingSlot(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {getTimeSlotsForDate(editingDate).length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No time slots for this day</p>
                    </div>
                  ) : (
                    getTimeSlotsForDate(editingDate).map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        {editingSlot === slot.id ? (
                          <>
                            <div className="flex items-center gap-3 flex-1">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={editForm.time_slot}
                                onChange={(e) => setEditForm({ ...editForm, time_slot: e.target.value })}
                                placeholder="HH:mm-HH:mm"
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
                              />
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editForm.is_available}
                                  onChange={(e) => setEditForm({ ...editForm, is_available: e.target.checked })}
                                  className="rounded border-gray-300 text-[#667eea] focus:ring-[#667eea]"
                                />
                                Available
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveEdit(slot.id)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="text-gray-600 border-gray-300 hover:bg-gray-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {formatTime(slot.timeSlot)}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                                slot.isAvailable
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {slot.isAvailable ? 'Available' : 'Blocked'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSlot(slot)}
                                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSlotClick(slot.id, selectedDate)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingDate(null);
                      setEditingSlot(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
