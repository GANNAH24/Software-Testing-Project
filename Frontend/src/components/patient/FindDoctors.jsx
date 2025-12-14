import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Stethoscope, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import doctorService from '../../shared/services/doctor.service';
import { QuickBookDialog } from './QuickBookDialog';
import { useAuthContext } from '../../shared/contexts/AuthContext';

const SPECIALTIES = [
  'All Specialties',
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'General Practice'
];

const LOCATIONS = [
  'All Locations',
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'Phoenix, AZ',
  'Philadelphia, PA'
];

export function FindDoctors() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [loading, setLoading] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await doctorService.list();
        console.log("Fetched doctors:", res?.data); 
        setDoctors(res?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);


  useEffect(() => {
  const fetchDoctorsWithSlots = async () => {
    try {
      setLoading(true);
      const res = await doctorService.list();
      const doctorsData = res?.data || [];

      // fetch slots for each doctor (for today as example)
      const today = new Date().toISOString().split("T")[0];
      const doctorsWithSlots = await Promise.all(
        doctorsData.map(async (doc) => {
          try {
            const slotsRes = await scheduleService.availableSlots(doc.doctor_id, today);
            const slots = slotsRes?.data?.availableSlots || [];
            return { ...doc, availableSlots: slots.length };
          } catch (err) {
            return { ...doc, availableSlots: 0 };
          }
        })
      );

      console.log("Doctors with slots:", doctorsWithSlots);
      setDoctors(doctorsWithSlots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchDoctorsWithSlots();
}, []); 


  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All Specialties' || d.specialty === selectedSpecialty;

    const matchesLocation =
      selectedLocation === 'All Locations' || d.location === selectedLocation;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const handleViewProfile = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const openBookDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setBookDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor or specialty"
              className="pl-10"
            />
          </div>

          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-gray-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Doctor Cards */}
      {loading ? (
        <p className="text-center text-gray-600">Loading doctors...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.doctor_id || doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-full bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-900">{doctor.rating}</span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{doctor.location}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {doctor.availableSlots || 0} slots available
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => openBookDialog(doctor)}
                    className="flex-1 bg-[#667eea] hover:bg-[#5568d3]"
                  >
                    Book Now
                  </Button>
                  <Button
                    onClick={() => handleViewProfile(doctor.doctor_id || doctor.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      {selectedDoctor && (
        <QuickBookDialog
          open={bookDialogOpen}
          onOpenChange={setBookDialogOpen}
          doctorName={selectedDoctor.name}
          doctorId={selectedDoctor?.doctor_id || selectedDoctor?.user_id}
          specialty={selectedDoctor.specialty}
        />
      )}
    </div>
  );
}
