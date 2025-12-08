import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Star, Award, Calendar, ArrowLeft, Clock, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { CalendarBookDialog } from './patient/CalendarBookDialog';
import { useAuthContext } from '../shared/contexts/AuthContext';
import doctorService from '../shared/services/doctor.service';
import { toast } from 'sonner';

export function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await doctorService.byId(id);
        const doctorData = response?.data || response;
        console.log('Loaded doctor:', doctorData);
        setDoctor(doctorData);
      } catch (error) {
        console.error('Error loading doctor:', error);
        toast.error('Failed to load doctor profile');
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadDoctor();
  }, [id]);

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'patient') {
      setBookDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex gap-6">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor not found</h3>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const doctorName = doctor.first_name && doctor.last_name 
    ? `Dr. ${doctor.first_name} ${doctor.last_name}`
    : doctor.name || 'Doctor';


  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Profile Card */}
      <Card className="p-6 md:p-8 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-3xl md:text-4xl font-bold">
              {doctor.first_name?.[0]}{doctor.last_name?.[0]}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{doctorName}</h1>
                <p className="text-xl text-gray-600 mb-3">{doctor.specialty || 'General Practice'}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-700">
                      {doctor.reviews_count || 0} reviews
                    </span>
                  </div>
                </div>
              </div>

              {(user?.role === 'patient' || !user) && (
                <Button
                  onClick={handleBookAppointment}
                  size="lg"
                  className="bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{doctor.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{doctor.phone || 'Not specified'}</span>
              </div>
              {doctor.working_hours_start && doctor.working_hours_end && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>
                    {doctor.working_hours_start} - {doctor.working_hours_end}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Details Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">
              {doctor.bio || `${doctorName} is a dedicated healthcare professional specializing in ${doctor.specialty || 'general practice'}.`}
            </p>
          </Card>

          {doctor.qualifications && (
            <Card className="p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#667eea]" />
                Qualifications
              </h2>
              <p className="text-gray-700">{doctor.qualifications}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">Specialty</p>
                <p className="font-medium text-gray-900">{doctor.specialty || 'General Practice'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Location</p>
                <p className="font-medium text-gray-900">{doctor.location || 'Not specified'}</p>
              </div>
              {doctor.working_hours_start && doctor.working_hours_end && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Working Hours</p>
                  <p className="font-medium text-gray-900">
                    {doctor.working_hours_start} - {doctor.working_hours_end}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-sm mb-1">Patient Reviews</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <p className="font-medium text-gray-900">{doctor.reviews_count || 0} reviews</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-[#667eea]" />
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p className="font-medium text-gray-900">{doctor.phone || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-[#667eea]" />
                <div>
                  <p className="text-gray-500 text-sm">Location</p>
                  <p className="font-medium text-gray-900">{doctor.location || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Card */}
      {(user?.role === 'patient' || !user) && (
        <Card className="p-6 md:p-8 mt-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] border-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to book an appointment?</h3>
              <p className="text-white/90">
                Schedule your visit with {doctor.first_name || 'the doctor'}
              </p>
            </div>
            <Button
              onClick={handleBookAppointment}
              size="lg"
              className="bg-white text-[#667eea] hover:bg-gray-100 whitespace-nowrap font-semibold"
            >
              Book Appointment
            </Button>
          </div>
        </Card>
      )}

      <CalendarBookDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        preSelectedDoctorId={doctor.doctor_id || doctor.id}
      />
    </div>
  );
}
