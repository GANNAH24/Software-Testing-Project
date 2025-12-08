import { useEffect, useState } from 'react';
import appointmentService from '../../shared/services/appointment.service';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Clock, Users } from 'lucide-react';

export function DoctorDashboard({ navigate, user }) {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointmentsCount, setUpcomingAppointmentsCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    const loadAppointments = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const appointments = await appointmentService.list({ doctor_id: user.id });
        setTodayAppointments(appointments.filter(a => a.date === today));
        setUpcomingAppointmentsCount(
          appointments.filter(a => a.status === 'scheduled' || a.status === 'booked').length
        );
      } catch (err) {
        console.error('Failed to load appointments:', err);
      }
    };

    loadAppointments();
  }, [user]);

  const STATS = {
    todaySlots: todayAppointments.length,
    upcomingAppointments: upcomingAppointmentsCount,
    todayPatients: todayAppointments.filter(a => a.status === 'scheduled').length,
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">
            Welcome, {user?.fullName?.split(' ')[0] || 'Doctor'}!
          </h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Today's Slots</p>
                  <p className="text-3xl text-gray-900">{STATS.todaySlots}</p>
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
                  <p className="text-sm text-gray-600 mb-2">Upcoming Appointments</p>
                  <p className="text-3xl text-gray-900">{STATS.upcomingAppointments}</p>
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
                  <p className="text-sm text-gray-600 mb-2">Today's Patients</p>
                  <p className="text-3xl text-gray-900">{STATS.todayPatients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {todayAppointments.map((slot, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    slot.status === 'scheduled' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Clock
                      className={`w-5 h-5 ${
                        slot.status === 'scheduled' ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div>
                      <div className="text-gray-900">{slot.timeSlot || slot.time}</div>
                      <div className={`text-sm ${slot.status === 'scheduled' ? 'text-blue-700' : 'text-gray-500'}`}>
                        {slot.patientName || slot.patient || '—'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs capitalize ${
                      slot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-gray-600 text-center">No appointments scheduled for today.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('manage-schedule')}
                className="bg-[#667eea] hover:bg-[#5568d3] h-auto py-6 justify-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div>Manage Schedule</div>
                    <div className="text-sm opacity-90">Set availability & block time</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('doctor-appointments')}
                variant="outline"
                className="h-auto py-6 justify-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900">View Appointments</div>
                    <div className="text-sm text-gray-600">Manage patient appointments</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
