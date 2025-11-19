import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

// Converted from TSX: removed DoctorDashboardProps interface and type annotations
export function DoctorDashboard({ navigate, user }) {
  const STATS = { todaySlots: 6, upcomingAppointments: 12 };
  const TODAY_SCHEDULE = [
    { time: '09:00-10:00', patient: 'John Doe', status: 'scheduled' },
    { time: '10:00-11:00', patient: 'Jane Smith', status: 'scheduled' },
    { time: '11:00-12:00', patient: 'Available', status: 'available' },
    { time: '14:00-15:00', patient: 'Mike Johnson', status: 'scheduled' },
    { time: '15:00-16:00', patient: 'Available', status: 'available' },
    { time: '16:00-17:00', patient: 'Sarah Williams', status: 'scheduled' }
  ];

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome, {user?.fullName?.split(' ')[0] || 'Doctor'}!</h1>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Today's Slots</p><p className="text-3xl text-gray-900">{STATS.todaySlots}</p></div><div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Upcoming Appointments</p><p className="text-3xl text-gray-900">{STATS.upcomingAppointments}</p></div><div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-600 mb-2">Today's Patients</p><p className="text-3xl text-gray-900">{TODAY_SCHEDULE.filter(s => s.status === 'scheduled').length}</p></div><div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
        </div>

        <Card className="mb-6"><CardContent className="p-6"><h2 className="text-gray-900 mb-4">Today's Schedule</h2><div className="space-y-3">
          {TODAY_SCHEDULE.map((slot, i) => (
            <div key={i} className={`flex items-center justify-between p-4 rounded-lg border ${slot.status === 'scheduled' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <Clock className={`w-5 h-5 ${slot.status === 'scheduled' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div><div className="text-gray-900">{slot.time}</div><div className={`text-sm ${slot.status === 'scheduled' ? 'text-blue-700' : 'text-gray-500'}`}>{slot.patient}</div></div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs capitalize ${slot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>{slot.status}</span>
            </div>
          ))}
        </div></CardContent></Card>

        <Card><CardContent className="p-6"><h2 className="text-gray-900 mb-4">Quick Actions</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={() => navigate('manage-schedule')} className="bg-[#667eea] hover:bg-[#5568d3] h-auto py-6 justify-start">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6" /></div><div className="text-left"><div>Manage Schedule</div><div className="text-sm opacity-90">Set availability & block time</div></div></div>
          </Button>
          <Button onClick={() => navigate('doctor-appointments')} variant="outline" className="h-auto py-6 justify-start">
            <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-gray-600" /></div><div className="text-left"><div className="text-gray-900">View Appointments</div><div className="text-sm text-gray-600">Manage patient appointments</div></div></div>
          </Button>
        </div></CardContent></Card>
      </div>
    </div>
  );
}
