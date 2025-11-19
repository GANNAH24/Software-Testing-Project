import { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { QuickBookDialog } from './QuickBookDialog';
import doctorService from '../../shared/services/doctor.service';

const SPECIALTIES = ['All Specialties', 'Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Neurology', 'General Practice'];
const LOCATIONS = ['All Locations', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA'];

export function FindDoctors({ navigate, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [loading, setLoading] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await doctorService.list();
        const list = response?.data || response?.doctors || response || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = searchQuery === '' || 
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || doctor.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === 'All Locations' || doctor.location === selectedLocation;

    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const handleBookAppointment = (doctorId) => {
    navigate('book-appointment', { doctorId });
  };

  const handleViewProfile = (doctorId) => {
    navigate('doctor-profile', { doctorId });
  };

  const openBookDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setBookDialogOpen(true);
  };

  const closeBookDialog = () => {
    setBookDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search and book appointments with healthcare professionals</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by doctor name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Specialty Filter */}
              <div>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialty('All Specialties');
                    setSelectedLocation('All Locations');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} found
          </p>
        </div>

        {/* Doctor Cards */}
        {filteredDoctors.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All Specialties');
                  setSelectedLocation('All Locations');
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Doctor Avatar */}
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

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900">{doctor.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ({doctor.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>

                  {/* Available Slots */}
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      {doctor.availableSlots} slots available
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openBookDialog(doctor)}
                      className="flex-1 bg-[#667eea] hover:bg-[#5568d3]"
                    >
                      Book Now
                    </Button>
                    <Button
                      onClick={() => handleViewProfile(doctor.id)}
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
      </div>
      
      {/* Book Appointment Dialog */}
      {selectedDoctor && (
        <QuickBookDialog
          open={bookDialogOpen}
          onOpenChange={setBookDialogOpen}
          doctorName={selectedDoctor.name}
          doctorId={selectedDoctor.id}
          specialty={selectedDoctor.specialty}
        />
      )}
    </div>
  );
}