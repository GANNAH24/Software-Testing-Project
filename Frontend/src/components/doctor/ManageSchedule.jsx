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
      const today = new Date().toISOString().split('T')[0];
      const response = await scheduleService.list({ startDate: today });
      const data = response?.data || response?.schedules || response || [];
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
      if (!user?.id) return;
      const response = await doctorService.profile(user.id);
      const doctorData = response?.data || response;

      if (doctorData?.working_hours_start && doctorData?.working_hours_end) {
        setWorkingHours({
          start: doctorData.working_hours_start,
          end: doctorData.working_hours_end
        });
      }
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
      toast.info('Using default working hours (9 AM - 5 PM)');
    }
  }

  async function handleBlockSlot(slotId) {
    try {
      setBlockingSlot(slotId);
      const schedule = schedules.find(s => (s.schedule_id === slotId || s.id === slotId));
      await scheduleService.update(slotId, {
        is_available: !schedule.is_available
      });
      toast.success(schedule.is_available ? 'Time slot blocked' : 'Time slot unblocked');
      await fetchSchedules();
    } catch (error) {
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
    if (!slotToDelete) return;
    try {
      setDeletingSlot(slotToDelete.id || 'multiple');
      if (slotToDelete.isMultiple) {
        const deletePromises = slotToDelete.slots.map(slot => scheduleService.remove(slot.id));
        await Promise.all(deletePromises);
        toast.success(`Deleted ${slotToDelete.slots.length} time slot(s)`);
      } else {
        await scheduleService.remove(slotToDelete.id);
        toast.success('Time slot deleted successfully');
      }
      await fetchSchedules();
      setShowDeleteConfirm(false);
      setSlotToDelete(null);
    } catch (error) {
      toast.error('Failed to delete time slot');
    } finally {
      setDeletingSlot(null);
    }
  }

  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const getTimeSlotsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules
      .filter(s => s.date === dateStr)
      .map(s => ({
        timeSlot: s.time_slot || s.timeSlot,
        isAvailable: s.is_available ?? s.isAvailable ?? true,
        id: s.schedule_id || s.id
      }))
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  };

  const isDayAvailable = (date) => getTimeSlotsForDate(date).some(slot => slot.isAvailable);
  const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const formatDateLong = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <Button variant="outline" onClick={() => setShowBlockModal(true)}>
                <Lock className="w-4 h-4 mr-2" /> Block Time
              </Button>
              <Button onClick={() => setShowScheduleModal(true)} className="bg-[#667eea] hover:bg-[#5568d3] text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Schedule
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant={view === 'weekly' ? 'default' : 'outline'} onClick={() => setView('weekly')}>Weekly View</Button>
            <Button variant={view === 'daily' ? 'default' : 'outline'} onClick={() => setView('daily')}>Daily View</Button>
          </div>
        </div>

        {/* Weekly View Content */}
        {view === 'weekly' && (
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <Card><CardContent className="p-12 text-center">No Schedule Set</CardContent></Card>
            ) : (
              weekDates.map((date, index) => {
                const timeSlots = getTimeSlotsForDate(date);
                return (
                  <Card key={index} className="bg-white shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{DAY_NAMES[date.getDay()]}</h3>
                          <div className="text-sm text-gray-500">{formatDate(date)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button aria-label="Edit Day" variant="outline" size="sm" onClick={() => handleEditClick(date)}>
                            <Edit2 className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button aria-label="Delete All Slots" variant="outline" size="sm" onClick={() => handleDeleteAllForDayClick(date)} className="text-red-600 border-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((slot, idx) => (
                          <div key={idx} className={`px-4 py-2 rounded-lg text-sm border ${slot.isAvailable ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {slot.timeSlot}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Daily View Content */}
        {view === 'daily' && (
          <div className="space-y-4">
            <Card className="p-6">
              <label htmlFor="date-picker-input" className="block text-sm font-medium mb-2">Select Date</label>
              <input 
                id="date-picker-input" 
                type="date" 
                className="w-full p-2 border rounded"
                value={selectedDate.toISOString().split('T')[0]} 
                onChange={(e) => setSelectedDate(new Date(e.target.value))} 
              />
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Schedule for {formatDateLong(selectedDate)}</h3>
              <div className="space-y-3">
                {getTimeSlotsForDate(selectedDate).length === 0 ? (
                  <p className="text-center text-gray-500">No time slots available for this date</p>
                ) : (
                  getTimeSlotsForDate(selectedDate).map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">{slot.timeSlot}</span>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleBlockSlot(slot.id)}
                          disabled={blockingSlot === slot.id}
                        >
                          {slot.isAvailable ? 'Block' : 'Unblock'}
                        </Button>
                        <Button 
                          aria-label="Delete Slot" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteSlotClick(slot.id, selectedDate)} 
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleModal open={showScheduleModal} onOpenChange={setShowScheduleModal} onSuccess={fetchSchedules} workingHours={workingHours} />
      <BlockTimeModal open={showBlockModal} onOpenChange={setShowBlockModal} onSuccess={fetchSchedules} />
      <DeleteConfirmationModal 
        open={showDeleteConfirm} 
        onOpenChange={setShowDeleteConfirm} 
        onConfirm={confirmDelete} 
        loading={deletingSlot !== null}
        message={slotToDelete?.isMultiple ? "Delete all slots for this day?" : "Are you sure you want to remove this slot?"}
      />
    </div>
  );
}