import { useState, useEffect } from 'react';
import { MapPin, Phone, Star, Award, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';





const MOCK_PROFILES = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    location: 'New York, NY',
    phone: '+1 (555) 123-4567',
    reviewsCount: 128,
    yearsExperience: 15,
    education: 'Harvard Medical School, Johns Hopkins Cardiology Fellowship',
    languages: ['English', 'Spanish'],
    about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating complex cardiovascular conditions. She specializes in preventive cardiology and advanced heart failure management. Dr. Johnson is committed to providing personalized, compassionate care to all her patients.'
  },
  '2': {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    qualifications: 'MD, FAAP',
    location: 'Los Angeles, CA',
    phone: '+1 (555) 234-5678',
    reviewsCount: 96,
    yearsExperience: 12,
    education: 'Stanford Medical School, UCSF Pediatrics Residency',
    languages: ['English', 'Mandarin'],
    about: 'Dr. Michael Chen is a dedicated pediatrician who believes in building lasting relationships with families. With expertise in developmental pediatrics and childhood wellness, he provides comprehensive care from infancy through adolescence.'
  }
};

export function DoctorProfile({ doctorId, navigate, user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (doctorId && MOCK_PROFILES[doctorId]) {
        setProfile(MOCK_PROFILES[doctorId]);
      }
      setLoading(false);
    }, 500);
  }, [doctorId]);

  const handleBookAppointment = () => {
    if (!user) {
      navigate('login');
    } else if (user.role === 'patient') {
      navigate('book-appointment', { doctorId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" className="mb-4">
            ← Back to Search
          </Button>
          <Card>
            <CardContent className="p-8">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-6 w-1/4 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate('home')} className="mb-4">
            ← Back to Search
          </Button>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-gray-900 mb-2">Doctor not found</h3>
            <p className="text-gray-600 mb-6">
              The doctor profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('home')}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('home')} className="mb-4">
          ← Back to Search
        </Button>

        {/* Main Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Avatar & Quick Info */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-32 h-32 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center text-white text-4xl mb-4">
                  {profile.name.split(' ')[1][0]}
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-900">{profile.reviewsCount} reviews</span>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="flex-1">
                <h1 className="text-gray-900 mb-2">{profile.name}</h1>
                <p className="text-xl text-[#667eea] mb-4">{profile.specialty}</p>
                <p className="text-gray-700 mb-6">{profile.qualifications}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="text-gray-900">{profile.location}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="text-gray-900">{profile.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Experience</div>
                      <div className="text-gray-900">{profile.yearsExperience} years</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-gray-400 mt-0.5">🗣️</div>
                    <div>
                      <div className="text-sm text-gray-500">Languages</div>
                      <div className="text-gray-900">{profile.languages.join(', ')}</div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleBookAppointment}
                  className="w-full sm:w-auto bg-[#667eea] hover:bg-[#5568d3] gap-2"
                  size="lg"
                >
                  <Calendar className="w-5 h-5" />
                  {!user ? 'Login to Book Appointment' : user.role === 'patient' ? 'Book Appointment' : 'View Appointments'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{profile.about}</p>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">Education & Training</h2>
            <p className="text-gray-700">{profile.education}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
