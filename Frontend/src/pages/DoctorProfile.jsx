import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Award, Clock, Languages, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { CalendarBookDialog } from '../components/patient/CalendarBookDialog';
import { useAuth } from '../App';
import doctorService from '../shared/services/doctor.service';

export function DoctorProfile({ navigate, params }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const result = await doctorService.byId(params.id);
        const doctorData = result?.data || result;
        setDoctor(doctorData || null);
      } catch (err) {
        console.error('Error loading doctor:', err);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    loadDoctor();
  }, [params.id]);

  const handleBookAppointment = () => {
    if (!user) { navigate('/login'); } else if (user.role === 'patient') { setBookDialogOpen(true); }
  };

  if (loading) {
    return (<div className="p-4 md:p-8 max-w-5xl mx-auto"><LoadingSkeleton variant="card" /><div className="mt-6 space-y-4"><LoadingSkeleton variant="form" count={3} /></div></div>);
  }
  if (!doctor) {
    return (<div className="p-4 md:p-8 max-w-5xl mx-auto"><div className="text-center py-16 bg-white rounded-lg border border-gray-200"><h3 className="text-xl text-gray-900 mb-2">Doctor not found</h3><p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist</p><Button onClick={() => navigate('/')}>Back to Home</Button></div></div>);
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <Card className="p-6 md:p-8 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0"><span className="text-white text-3xl md:text-4xl">{doctor.name.split(' ').map(n => n[0]).join('')}</span></div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">{doctor.name}</h1>
                <p className="text-xl text-gray-600 mb-3">{doctor.specialty}</p>
                <div className="flex items-center gap-2 mb-2"><div className="flex items-center gap-1"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /><span className="text-gray-700">{doctor.reviewsCount} reviews</span></div></div>
              </div>
              {user?.role === 'patient' && (<Button onClick={handleBookAppointment} size="lg" className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 whitespace-nowrap"><Calendar className="w-4 h-4 mr-2" />Book Appointment</Button>)}
              {!user && (<Button onClick={handleBookAppointment} size="lg" className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 whitespace-nowrap"><Calendar className="w-4 h-4 mr-2" />Book Appointment</Button>)}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-gray-700"><MapPin className="w-5 h-5 text-gray-400" /><span>{doctor.location}</span></div>
              <div className="flex items-center gap-3 text-gray-700"><Phone className="w-5 h-5 text-gray-400" /><span>{doctor.phone}</span></div>
              {doctor.experience && (<div className="flex items-center gap-3 text-gray-700"><Clock className="w-5 h-5 text-gray-400" /><span>{doctor.experience} of experience</span></div>)}
              {doctor.languages && (<div className="flex items-center gap-3 text-gray-700"><Languages className="w-5 h-5 text-gray-400" /><span>{doctor.languages.join(', ')}</span></div>)}
            </div>
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border border-gray-200"><h2 className="text-xl text-gray-900 mb-4">About</h2><p className="text-gray-700 leading-relaxed">{doctor.bio || 'No additional information available.'}</p></Card>
          <Card className="p-6 border border-gray-200"><h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-[#667eea]" />Qualifications</h2><p className="text-gray-700">{doctor.qualifications}</p></Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 border border-gray-200"><h2 className="text-xl text-gray-900 mb-4">Quick Info</h2><div className="space-y-4"><div><p className="text-gray-500 text-sm mb-1">Specialty</p><p className="text-gray-900">{doctor.specialty}</p></div><div><p className="text-gray-500 text-sm mb-1">Location</p><p className="text-gray-900">{doctor.location}</p></div>{doctor.experience && (<div><p className="text-gray-500 text-sm mb-1">Experience</p><p className="text-gray-900">{doctor.experience}</p></div>)}<div><p className="text-gray-500 text-sm mb-1">Patient Reviews</p><div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><p className="text-gray-900">{doctor.reviewsCount} reviews</p></div></div></div></Card>
          <Card className="p-6 border border-gray-200"><h2 className="text-xl text-gray-900 mb-4">Contact</h2><div className="space-y-3"><div className="flex items-center gap-3 text-gray-700"><Phone className="w-5 h-5 text-[#667eea]" /><div><p className="text-gray-500 text-sm">Phone</p><p className="text-gray-900">{doctor.phone}</p></div></div><div className="flex items-center gap-3 text-gray-700"><MapPin className="w-5 h-5 text-[#667eea]" /><div><p className="text-gray-500 text-sm">Location</p><p className="text-gray-900">{doctor.location}</p></div></div></div></Card>
        </div>
      </div>
      {(user?.role === 'patient' || !user) && (<Card className="p-6 md:p-8 mt-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] border-0"><div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white"><div><h3 className="text-xl md:text-2xl mb-2">Ready to book an appointment?</h3><p className="text-white/90">Schedule your visit with {doctor.name.split(' ')[1]}</p></div><Button onClick={handleBookAppointment} size="lg" className="bg-white text-[#667eea] hover:bg-gray-100 whitespace-nowrap">Book Appointment</Button></div></Card>)}
      <CalendarBookDialog open={bookDialogOpen} onOpenChange={setBookDialogOpen} preSelectedDoctorId={doctor.id} />
    </div>
  );
}
