import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../App';
import { mockAppointments, mockDoctors } from '../lib/mockData';

export function PatientDashboard({ navigate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, past: 0, total: 0 });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      const userAppointments = mockAppointments.filter(apt => apt.patient_id === user?.id);
      const today = new Date().toISOString().split('T')[0];
      const upcoming = userAppointments.filter(apt => apt.date >= today && (apt.status === 'scheduled' || apt.status === 'booked'));
      const past = userAppointments.filter(apt => apt.date < today || apt.status === 'completed');
      setStats({ upcoming: upcoming.length, past: past.length, total: userAppointments.length });
      const upcomingWithDoctors = upcoming.slice(0, 3).map(apt => ({ ...apt, doctor: mockDoctors.find(d => d.id === apt.doctor_id) }));
      setUpcomingAppointments(upcomingWithDoctors);
      setLoading(false);
    }, 800);
  }, [user?.id]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl text-gray-900 mb-2">Dashboard</h1><p className="text-gray-600">Welcome back, {user?.fullName}</p></div>
        {loading ? (<div className="grid md:grid-cols-3 gap-6 mb-8">{[...Array(3)].map((_, i) => (<LoadingSkeleton key={i} variant="card" />))}</div>) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border border-gray-200"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600" /></div></div><p className="text-gray-600 text-sm mb-1">Upcoming Appointments</p><p className="text-3xl text-gray-900">{stats.upcoming}</p></Card>
            <Card className="p-6 border border-gray-200"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center"><Clock className="w-6 h-6 text-green-600" /></div></div><p className="text-gray-600 text-sm mb-1">Past Appointments</p><p className="text-3xl text-gray-900">{stats.past}</p></Card>
            <Card className="p-6 border border-gray-200"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center"><FileText className="w-6 h-6 text-purple-600" /></div></div><p className="text-gray-600 text-sm mb-1">Total Appointments</p><p className="text-3xl text-gray-900">{stats.total}</p></Card>
          </div>
        )}
        <div className="mb-8"><h2 className="text-xl text-gray-900 mb-4">Quick Actions</h2><div className="grid md:grid-cols-2 gap-4"><Card className="p-6 border border-gray-200 hover:border-[#667eea] transition-colors cursor-pointer" onClick={() => navigate('/patient/book')}><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center"><Plus className="w-6 h-6 text-white" /></div><div><h3 className="text-gray-900 mb-1">Book Appointment</h3><p className="text-gray-600 text-sm">Schedule a visit with a doctor</p></div></div></Card><Card className="p-6 border border-gray-200 hover:border-[#667eea] transition-colors cursor-pointer" onClick={() => navigate('/patient/appointments')}><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center"><Calendar className="w-6 h-6 text-white" /></div><div><h3 className="text-gray-900 mb-1">My Appointments</h3><p className="text-gray-600 text-sm">View and manage your appointments</p></div></div></Card></div></div>
        <div><div className="flex items-center justify-between mb-4"><h2 className="text-xl text-gray-900">Upcoming Appointments</h2><Button variant="ghost" onClick={() => navigate('/patient/appointments')} className="text-[#667eea]">View All</Button></div>{loading ? (<LoadingSkeleton variant="list" count={3} />) : upcomingAppointments.length > 0 ? (<div className="space-y-4">{upcomingAppointments.map((apt) => (<Card key={apt.id} className="p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/patient/appointments/${apt.id}`)}><div className="flex items-start justify-between"><div className="flex gap-4 flex-1"><div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0"><span className="text-white">{apt.doctor?.name.split(' ').map(n => n[0]).join('')}</span></div><div className="flex-1 min-w-0"><h3 className="text-gray-900 mb-1">{apt.doctor?.name}</h3><p className="text-gray-600 text-sm mb-2">{apt.doctor?.specialty}</p><div className="flex flex-wrap gap-4 text-sm text-gray-500"><div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{new Date(apt.date).toLocaleDateString()}</span></div><div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{apt.time_slot}</span></div></div></div></div><span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">{apt.status}</span></div>{apt.notes && (<p className="mt-4 pt-4 border-t border-gray-100 text-gray-600 text-sm">{apt.notes}</p>)}</Card>))}</div>) : (<Card className="p-12 border border-gray-200 text-center"><Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-900 mb-2">No upcoming appointments</h3><p className="text-gray-600 mb-6">Book your first appointment to get started</p><Button onClick={() => navigate('/patient/book')} className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">Book Appointment</Button></Card>)}</div>
 </div>
 </div>
 );
}
