import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { DoctorCard } from '../components/DoctorCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { specialties, locations } from '../lib/mockData';
import doctorService from '../shared/services/doctor.service';

export function DoctorSearch({ navigate }) {
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minReviews, setMinReviews] = useState('');
  const [sortBy, setSortBy] = useState('reviews');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const specialty = params.get('specialty');
    if (q) setSearchTerm(q);
    if (specialty) setSelectedSpecialty(specialty);
    
    const loadDoctors = async () => {
      try {
        const result = await doctorService.list();
        const list = result?.data || result || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error loading doctors:', err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const handleSearch = () => { setLoading(true); setTimeout(() => { setLoading(false); }, 500); };
  const handleClearFilters = () => { setSearchTerm(''); setSelectedSpecialty(''); setSelectedLocation(''); setMinReviews(''); setSortBy('reviews'); };

  let filteredDoctors = doctors.filter(doc => {
    const matchesSearch = !searchTerm || doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doc.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || doc.location === selectedLocation;
    const matchesReviews = !minReviews || doc.reviewsCount >= parseInt(minReviews);
    return matchesSearch && matchesSpecialty && matchesLocation && matchesReviews;
  });
  filteredDoctors = filteredDoctors.sort((a, b) => { if (sortBy === 'name') return a.name.localeCompare(b.name); return b.reviewsCount - a.reviewsCount; });
  const activeFiltersCount = [selectedSpecialty, selectedLocation, minReviews].filter(Boolean).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl text-gray-900 mb-2">Find a Doctor</h1><p className="text-gray-600">Search and filter healthcare professionals by specialty, location, and more</p></div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex gap-4 flex-col md:flex-row">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><Input type="text" placeholder="Search by name, specialty, or keyword" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11" /></div>
          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" />Advanced Filters{activeFiltersCount > 0 && (<span className="ml-1 px-2 py-0.5 bg-[#667eea] text-white rounded-full text-xs">{activeFiltersCount}</span>)}</Button>
          <Button onClick={handleSearch} className="bg-gradient-to-r from-[#667eea] to-[#764ba2]">Search</Button>
        </div>
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label htmlFor="specialty">Specialty</Label><select id="specialty" value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"><option value="">All Specialties</option>{specialties.map(spec => (<option key={spec} value={spec}>{spec}</option>))}</select></div>
              <div><Label htmlFor="location">Location</Label><select id="location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"><option value="">All Locations</option>{locations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select></div>
              <div><Label htmlFor="minReviews">Minimum Reviews</Label><Input id="minReviews" type="number" min="0" placeholder="e.g., 50" value={minReviews} onChange={(e) => setMinReviews(e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="sortBy">Sort By</Label><select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]"><option value="reviews">Most Reviewed</option><option value="name">Name (A-Z)</option></select></div>
            </div>
            <div className="flex items-center justify-between mt-4"><Button variant="ghost" onClick={handleClearFilters} className="text-gray-600"><X className="w-4 h-4 mr-2" />Clear All Filters</Button></div>
          </div>
        )}
      </div>
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedSpecialty && (<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#667eea]/10 text-[#667eea] rounded-full text-sm">Specialty: {selectedSpecialty}<button onClick={() => setSelectedSpecialty('')}><X className="w-3 h-3" /></button></div>)}
          {selectedLocation && (<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#667eea]/10 text-[#667eea] rounded-full text-sm">Location: {selectedLocation}<button onClick={() => setSelectedLocation('')}><X className="w-3 h-3" /></button></div>)}
          {minReviews && (<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#667eea]/10 text-[#667eea] rounded-full text-sm">Min Reviews: {minReviews}<button onClick={() => setMinReviews('')}><X className="w-3 h-3" /></button></div>)}
        </div>
      )}
      <div className="mb-6"><p className="text-gray-600">Found <span className="text-gray-900">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''}</p></div>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => (<LoadingSkeleton key={i} variant="card" />))}</div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredDoctors.map(doctor => (<DoctorCard key={doctor.id} doctor={doctor} onClick={() => navigate(`/doctor/${doctor.id}`)} />))}</div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200"><Search className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-900 mb-2">No doctors found</h3><p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p><Button onClick={handleClearFilters}>Clear All Filters</Button></div>
      )}
    </div>
  );
}
