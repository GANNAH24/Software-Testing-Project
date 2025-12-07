import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import appointmentService from '../../shared/services/appointment.service';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ todaySlots: 0, upcomingAppointments: 0 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch doctor's appointments
        const response = await appointmentService.byDoctor(user.id);
        const appointments = response?.data || response?.appointments || response || [];
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayAppts = appointments.filter(apt => apt.date === today);
        const upcoming = appointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed');
        
        setStats({
          todaySlots: todayAppts.length,
          upcomingAppointments: upcoming.length
        });
        
        setTodaySchedule(todayAppts);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome, {(user?.fullName || user?.full_name || 'Doctor').split(' ')[0]}!</h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Today's Slots</p><p className="text-3xl text-gray-900">{stats.todaySlots}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Upcoming Appointments</p><p className="text-3xl text-gray-900">{stats.upcomingAppointments}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Today's Patients</p><p className="text-3xl text-gray-900">{todaySchedule.filter(s => s.status === 'confirmed' || s.status === 'pending').length}</p></div><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
            </div>

            <Card className="mb-6"><CardContent className="p-6"><h2 className="text-gray-900 mb-4">Today's Schedule</h2>
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">😊 No appointments scheduled for today. Enjoy your free time!</div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((appointment) => (
                    <div key={appointment.id} className={`flex items-center justify-between p-4 rounded-lg border ${appointment.status === 'confirmed' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <Clock className={`w-5 h-5 ${appointment.status === 'confirmed' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-gray-900">{appointment.time_slot || 'Not specified'}</div>
                          <div className={`text-sm ${appointment.status === 'confirmed' ? 'text-blue-700' : 'text-gray-500'}`}>
                            {appointment.patient_name || `Patient #${appointment.patient_id}`}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs capitalize ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          </>
        )}

        <Card><CardContent className="p-6"><h2 className="text-gray-900 mb-4">Quick Actions</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={() => navigate('/doctor/schedule')} className="bg-[#667eea] hover:bg-[#5568d3] h-auto py-6 justify-start">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6" /></div><div className="text-left"><div>Manage Schedule</div><div className="text-sm opacity-90">Set availability & block time</div></div></div>
          </Button>
          <Button onClick={() => navigate('/doctor/appointments')} variant="outline" className="h-auto py-6 justify-start">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-gray-600" /></div><div className="text-left"><div className="text-gray-900">My Bookings</div><div className="text-sm text-gray-600">View and manage bookings</div></div></div>
          </Button>
        </div></CardContent></Card>
      </div>
    </div>
  );
}
