import { useState, useEffect } from 'react';
import { Lock, X, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import scheduleService from '../../shared/services/schedule.service';

const DAYS_OF_WEEK = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/**
 * BlockTimeModal Component
 * Modal for blocking specific time slots (marking as unavailable)
 * 
 * @param {boolean} open - Controls modal visibility
 * @param {function} onOpenChange - Callback when modal open state changes
 * @param {function} onSuccess - Callback when time is blocked successfully
 */
export function BlockTimeModal({ open, onOpenChange, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
    }
  }, [open]);

  // Set minimum date to today
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Generate time options (every hour from 00:00 to 23:00)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      times.push(timeStr);
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const validateForm = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return false;
    }

    if (!startTime || !endTime) {
      toast.error('Please select start and end time');
      return false;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return false;
    }

    return true;
  };

  const handleBlock = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Calculate the number of hours to block
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(endTime.split(':')[0]);
      
      // Create blocked time slots for each hour in the range
      const blockPromises = [];
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
        const date = new Date(selectedDate);
        const dayOfWeek = DAYS_OF_WEEK[date.getDay()];

        blockPromises.push(
          scheduleService.create({
            date: selectedDate,
            time_slot: timeSlot,
            is_available: false, // Mark as blocked
            day_of_week: dayOfWeek,
            notes: reason || 'Blocked time'
          })
        );
      }

      await Promise.all(blockPromises);

      const hoursBlocked = endHour - startHour;
      toast.success(
        `Successfully blocked ${hoursBlocked} hour(s) on ${new Date(selectedDate).toLocaleDateString()}`
      );

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to block time:', error);
      toast.error('Failed to block time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-600" />
            Block Time
          </DialogTitle>
          <DialogDescription>
            Mark specific time slots as unavailable for appointments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select Date *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Start Time *
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select</option>
                {timeOptions.map((time) => (
                  <option key={`start-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                End Time *
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Select</option>
                {timeOptions.map((time) => (
                  <option key={`end-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Vacation, Personal emergency, Conference..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Preview */}
          {selectedDate && startTime && endTime && startTime < endTime && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-900 mb-1">Preview:</p>
              <p className="text-sm text-red-800">
                Blocking {parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])} hour(s) on{' '}
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <p className="text-sm text-red-800">
                From {startTime} to {endTime}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlock}
            disabled={loading || !selectedDate || !startTime || !endTime}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Blocking...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Block Time
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
