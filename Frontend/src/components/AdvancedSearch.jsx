import { useState } from 'react';
import { Search, Filter, MapPin, Star, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';

// Converted from TSX: removed interfaces & type annotations
export function AdvancedSearch({ navigate }) {
  const DOCTORS = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', qualifications: 'MD, FACC, 15 years experience', location: 'New York, NY', phone: '+1 (555) 123-4567', reviewsCount: 127 },
    { id: '2', name: 'Dr. Michael Chen', specialty: 'Pediatrics', qualifications: 'MD, FAAP, 12 years experience', location: 'Los Angeles, CA', phone: '+1 (555) 234-5678', reviewsCount: 203 },
    { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Dermatology', qualifications: 'MD, FAAD, 10 years experience', location: 'Miami, FL', phone: '+1 (555) 345-6789', reviewsCount: 156 },
    { id: '4', name: 'Dr. James Williams', specialty: 'Orthopedics', qualifications: 'MD, FAAOS, 18 years experience', location: 'Chicago, IL', phone: '+1 (555) 456-7890', reviewsCount: 189 },
    { id: '5', name: 'Dr. Lisa Thompson', specialty: 'Neurology', qualifications: 'MD, PhD, 14 years experience', location: 'Boston, MA', phone: '+1 (555) 567-8901', reviewsCount: 142 },
    { id: '6', name: 'Dr. David Park', specialty: 'Internal Medicine', qualifications: 'MD, FACP, 16 years experience', location: 'San Francisco, CA', phone: '+1 (555) 678-9012', reviewsCount: 178 }
  ];

  const SPECIALTIES = ['All Specialties','Cardiology','Pediatrics','Dermatology','Orthopedics','Neurology','Internal Medicine'];
  const LOCATIONS = ['All Locations','New York, NY','Los Angeles, CA','Miami, FL','Chicago, IL','Boston, MA','San Francisco, CA'];

  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [minReviews, setMinReviews] = useState('');
  const [sortBy, setSortBy] = useState('reviews');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      let filtered = [...DOCTORS];
      if (searchTerm) filtered = filtered.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) || d.qualifications.toLowerCase().includes(searchTerm.toLowerCase()));
      if (specialty && specialty !== 'All Specialties') filtered = filtered.filter(d => d.specialty === specialty);
      if (location && location !== 'All Locations') filtered = filtered.filter(d => d.location === location);
      if (minReviews) filtered = filtered.filter(d => d.reviewsCount >= parseInt(minReviews));
      if (sortBy === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name)); else filtered.sort((a,b) => b.reviewsCount - a.reviewsCount);
      setSearchResults(filtered); setSearching(false);
    }, 500);
  };

  const handleReset = () => { setSearchTerm(''); setSpecialty(''); setLocation(''); setMinReviews(''); setSortBy('reviews'); setSearchResults(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('home')} className="mb-4">← Back to Find Doctors</Button>
          <h1 className="text-gray-900">Advanced Doctor Search</h1>
          <p className="text-gray-600 mt-2">Use advanced filters to find the perfect healthcare provider</p>
        </div>
        <Card className="mb-8"><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><Label htmlFor="searchTerm">Search Term</Label><div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input id="searchTerm" placeholder="Doctor name, specialty, or qualifications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
            <div><Label>Specialty</Label><Select value={specialty} onValueChange={setSpecialty}><SelectTrigger className="mt-2"><SelectValue placeholder="Select specialty" /></SelectTrigger><SelectContent>{SPECIALTIES.map(spec => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}</SelectContent></Select></div>
            <div><Label>Location</Label><Select value={location} onValueChange={setLocation}><SelectTrigger className="mt-2"><SelectValue placeholder="Select location" /></SelectTrigger><SelectContent>{LOCATIONS.map(loc => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}</SelectContent></Select></div>
            <div><Label htmlFor="minReviews">Minimum Reviews</Label><Input id="minReviews" type="number" placeholder="e.g., 100" value={minReviews} onChange={(e) => setMinReviews(e.target.value)} className="mt-2" min="0" /></div>
            <div><Label>Sort By</Label><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="reviews">Most Reviews</SelectItem><SelectItem value="name">Name (A-Z)</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex gap-4 mt-6"><Button onClick={handleSearch} className="bg-[#667eea] hover:bg-[#5568d3] gap-2" disabled={searching}><Filter className="w-4 h-4" />{searching ? 'Searching...' : 'Search'}</Button><Button variant="outline" onClick={handleReset}>Reset Filters</Button></div>
        </CardContent></Card>
        {searchResults !== null && (<div><div className="mb-6"><h2 className="text-gray-900">{searchResults.length} {searchResults.length === 1 ? 'doctor' : 'doctors'} found</h2></div>{searchResults.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center"><div className="max-w-md mx-auto"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gray-400" /></div><h3 className="text-gray-900 mb-2">No doctors found</h3><p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p><Button onClick={handleReset} variant="outline">Clear All Filters</Button></div></div>
        ) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{searchResults.map(doctor => (
          <Card key={doctor.id} className="hover:shadow-md transition-shadow"><CardContent className="p-6"><div className="flex items-start justify-between mb-4"><div className="flex-1"><h3 className="text-gray-900 mb-1">{doctor.name}</h3><p className="text-[#667eea]">{doctor.specialty}</p></div><div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /><span className="text-sm text-gray-900">{doctor.reviewsCount}</span></div></div><div className="space-y-2 mb-4"><p className="text-sm text-gray-600">{doctor.qualifications}</p><div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4" /><span>{doctor.location}</span></div></div><Button onClick={() => navigate('doctor-profile', { doctorId: doctor.id })} className="w-full bg-[#667eea] hover:bg-[#5568d3] gap-2">View Profile<ChevronRight className="w-4 h-4" /></Button></CardContent></Card>
        ))}</div>)}</div>)}
      </div>
    </div>
  );
}
