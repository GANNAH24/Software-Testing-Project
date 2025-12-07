import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import scheduleService from '../../shared/services/schedule.service';
import { ScheduleWizard } from './ScheduleWizard';
import { DayTabs } from './DayTabs';

export function ManageSchedule() {
  const { user } = useAuthContext();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  async function fetchSchedules() {
    try {
      setLoading(true);
      const response = await scheduleService.list();
      const data = response?.data || response?.schedules || response || [];
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Schedule Management</h1>
            <p className="text-gray-600">Set your recurring weekly availability pattern</p>
          </div>
          <Button 
            onClick={() => setShowWizard(true)} 
            className="bg-[#667eea] hover:bg-[#5568d3]"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Recurring Schedule
          </Button>
        </div>

        {/* Main Content - Day Tabs */}
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Recurring Schedule Set</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your weekly recurring schedule to let patients know when you're available. 
                You can set different time slots for different days of the week.
              </p>
              <Button 
                onClick={() => setShowWizard(true)} 
                className="bg-[#667eea] hover:bg-[#5568d3]"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DayTabs 
            schedules={schedules} 
            onScheduleDeleted={fetchSchedules}
          />
        )}

        {/* Schedule Wizard */}
        <ScheduleWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          onSuccess={fetchSchedules}
        />
      </div>
    </div>
  );
}
