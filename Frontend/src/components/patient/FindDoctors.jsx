import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Search, MapPin, Stethoscope, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import doctorService from '../../shared/services/doctor.service';
import { QuickBookDialog } from './QuickBookDialog';

const SPECIALTIES = ['All Specialties', 'Cardiology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Neurology', 'General Practice'];
const LOCATIONS = ['All Locations', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'];

export function FindDoctors({ navigate }) {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All Specialties');
  const [location, setLocation] = useState('All Locations');
  const [doctors, setDoctors] = useState([]);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.list();
        setDoctors(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(d =>
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())) &&
    (specialty === 'All Specialties' || d.specialty === specialty) &&
    (location === 'All Locations' || d.location === location)
  );

  const openBookDialog = doctor => {
    setSelectedDoctor(doctor);
    setBookDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Search and filters */}
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by doctor or specialty" className="pl-10" />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-gray-400" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><SelectValue /></div>
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100"><img src={doctor.image} alt={doctor.name} className="rounded-full w-full h-full" /></div>
                <div className="flex-1">
                  <h3 className="text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{doctor.rating}</div>
              <div className="flex gap-2">
                <Button onClick={() => openBookDialog(doctor)} className="flex-1 bg-[#667eea] hover:bg-[#5568d3]">Book Now</Button>
                <Button variant="outline" className="flex-1" onClick={() => navigate('doctor-profile', { doctorId: doctor.id })}>View Profile</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking dialog */}
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
