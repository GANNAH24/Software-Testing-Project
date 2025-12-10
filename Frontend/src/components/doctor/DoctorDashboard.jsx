import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import appointmentService from '../../shared/services/appointment.service';
import scheduleService from '../../shared/services/schedule.service';
import doctorService from '../../shared/services/doctor.service';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ todaySlots: 0, upcomingAppointments: 0, todayPatients: 0 });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch doctor profile
        const profileResponse = await doctorService.profile(user.id);
        const profile = profileResponse?.data || profileResponse;
        setDoctorProfile(profile);
        
        // Fetch doctor's schedules
        const scheduleResponse = await scheduleService.list();
        const schedules = scheduleResponse?.data || scheduleResponse?.schedules || scheduleResponse || [];
        
        // Fetch doctor's appointments
        const appointmentResponse = await appointmentService.byDoctor(user.id);
        const appointments = appointmentResponse?.data || appointmentResponse?.appointments || appointmentResponse || [];
        
      // Calculate stats
      const now = new Date();
      // Use local date to avoid timezone issues
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      // Today's available slots from schedules
      const todaySlots = schedules.filter(s => s.date === today && s.is_available);
        
        // Upcoming appointments (confirmed, pending, or scheduled)
        const upcoming = appointments.filter(apt => 
          apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'scheduled'
        );
        
        // Today's appointments
        const todayAppts = appointments.filter(apt => apt.date === today);
        
        const todayPatientsCount = todayAppts.filter(apt => 
          apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'scheduled'
        ).length;
        
        // Sort today's appointments by time slot
        const sortedTodayAppts = todayAppts.sort((a, b) => {
          const timeA = a.time_slot ? a.time_slot.split('-')[0] : '00:00';
          const timeB = b.time_slot ? b.time_slot.split('-')[0] : '00:00';
          return timeA.localeCompare(timeB);
        });
        
        setStats({
          todaySlots: todaySlots.length,
          upcomingAppointments: upcoming.length,
          todayPatients: todayPatientsCount
        });
        
        setTodaySchedule(sortedTodayAppts);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, Dr. {doctorProfile?.first_name || doctorProfile?.firstName || (user?.fullName || user?.full_name || 'Doctor').split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Today's Available Slots</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.todaySlots}</p>
                      <p className="text-xs text-gray-500 mt-1">Open time slots</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Upcoming Appointments</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
                      <p className="text-xs text-gray-500 mt-1">Confirmed & pending</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Today's Patients</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.todayPatients}</p>
                      <p className="text-xs text-gray-500 mt-1">Scheduled for today</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              {todaySchedule.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No appointments today</p>
                  <p className="text-sm text-gray-500">Enjoy your free time! 😊</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((appointment) => (
                    <div 
                      key={appointment.appointment_id || appointment.id} 
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        appointment.status === 'confirmed' 
                          ? 'bg-blue-50 border-blue-200 hover:border-blue-300' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          appointment.status === 'confirmed' ? 'bg-blue-100' : 'bg-gray-200'
                        }`}>
                          <Clock className={`w-5 h-5 ${
                            appointment.status === 'confirmed' ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {appointment.time_slot || 'Time not specified'}
                          </div>
                          <div className={`text-sm ${
                            appointment.status === 'confirmed' ? 'text-blue-700' : 'text-gray-600'
                          }`}>
                            {appointment.patient_name || `Patient #${appointment.patient_id}`}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                        appointment.status === 'confirmed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
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
