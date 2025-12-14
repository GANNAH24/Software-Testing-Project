import { motion } from 'motion/react';
import { SlidersHorizontal, Calendar, Users, Shield, Star, ArrowRight, Stethoscope, Heart, Clock, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import doctorService from '../shared/services/doctor.service';
import { QuickBookDialog } from './patient/QuickBookDialog';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.15 }
};

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const features = [
    {
      emoji: '🔍',
      title: 'Find Doctors Easily',
      description: 'Search by specialty, location, or name to find the perfect healthcare provider for your needs'
    },
    {
      emoji: '📅',
      title: 'Book Appointments',
      description: 'Schedule appointments online 24/7 with instant confirmation and reminders'
    },
    {
      emoji: '👥',
      title: 'Verified Professionals',
      description: 'All our doctors are verified, certified, and experienced healthcare providers'
    },
    {
      emoji: '🛡️',
      title: 'Secure & Private',
      description: 'Your health information is protected with enterprise-grade security'
    }
  ];

  const stats = [
    { emoji: '👨‍⚕️', number: '500+', label: 'Verified Doctors' },
    { emoji: '😊', number: '50,000+', label: 'Happy Patients' },
    { emoji: '⭐', number: '4.9/5', label: 'Average Rating' },
    { emoji: '🏥', number: '100+', label: 'Specialties' }
  ];

  const specialties = [
    { emoji: '❤️', name: 'Cardiology', count: '45 Doctors' },
    { emoji: '👶', name: 'Pediatrics', count: '62 Doctors' },
    { emoji: '🦴', name: 'Orthopedics', count: '38 Doctors' },
    { emoji: '🧠', name: 'Neurology', count: '29 Doctors' },
    { emoji: '👁️', name: 'Ophthalmology', count: '34 Doctors' },
    { emoji: '🦷', name: 'Dentistry', count: '51 Doctors' }
  ];

  const handleSearch = () => {
    setShowResults(true);
    setSelectedSpecialty(null);
  };

  const handleSpecialtyClick = (specialtyName) => {
    setSelectedSpecialty(specialtyName);
    setShowResults(true);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearResults = () => {
    setShowResults(false);
    setSelectedSpecialty(null);
    setSearchQuery('');
    setLocationFilter('all');
    setSortBy('name');
  };

  const handleBookNow = (doctor) => {
    setSelectedDoctor(doctor);
    setBookDialogOpen(true);
  };

  // Filter and sort doctors
  const getFilteredDoctors = () => {
    let filtered = [...doctors];

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(d => d.specialty === selectedSpecialty);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query) ||
        d.location.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter !== 'all') {
      filtered = filtered.filter(d => d.location.includes(locationFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'reviews') return b.reviewsCount - a.reviewsCount;
      return 0;
    });

    return filtered;
  };

  const filteredDoctors = getFilteredDoctors();
  const locations = Array.from(new Set(doctors.map(d => d.location?.split(',')[1]?.trim() || d.location).filter(Boolean)));

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        console.log('Fetching doctors...');
        const result = await doctorService.list();
        console.log('Doctors API result:', result);
        // Backend successResponse shape: { success, message, data }
        const list = result?.data || result?.doctors || result || [];

        // Normalize IDs and other fields
        const normalizedDoctors = list.map(d => ({
          ...d,
          id: d.doctor_id || d.id,
          reviewsCount: d.reviewsCount || d.reviews_count || 0,
        }));

        setDoctors(Array.isArray(list) ? list : []);
        setLoadError(null);
      } catch (e) {
        console.error('Error loading doctors:', e);
        setLoadError(e.message || 'Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Results Section */}
      {showResults && (
        <section className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl text-gray-900 mb-1">
                  {selectedSpecialty ? `${selectedSpecialty} Specialists` : 'Search Results'}
                </h2>
                <p className="text-gray-600">
                  Found {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={clearResults}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="reviews">Most Reviewed</SelectItem>
                </SelectContent>
              </Select>

              {selectedSpecialty && (
                <Badge variant="secondary" className="px-3 py-2 text-sm">
                  Specialty: {selectedSpecialty}
                </Badge>
              )}
            </div>

            {/* Doctor Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingDoctors && (
                <div className="col-span-full text-center py-12 text-gray-600">Loading doctors...</div>
              )}
              {loadError && !loadingDoctors && (
                <div className="col-span-full text-center py-12 text-red-600">{loadError}</div>
              )}
              {!loadingDoctors && !loadError && filteredDoctors.map((doctor) => (
                <Card key={doctor.doctor_id || doctor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl">
                          {doctor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-gray-900 mb-1 truncate">{doctor.name}</h3>
                        <p className="text-gray-600 text-sm mb-1">{doctor.specialty}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{doctor.reviewsCount} reviews</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{doctor.location}</span>
                      </div>
                      {doctor.experience && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{doctor.experience}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/doctor/${doctor.doctor_id || doctor.id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        className="flex-1 bg-[#667eea] hover:bg-[#5568d3]"
                        onClick={() => handleBookNow(doctor)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={clearResults}>Clear Filters</Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <motion.section 
        className="relative bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div 
                className="inline-block mb-4 px-4 py-2 bg-white/20 rounded-full text-sm backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                ✨ Welcome to Se7ety
              </motion.div>
              <h1 className="text-4xl md:text-6xl mb-6 leading-tight">
                Your Health,
                <br />
                <span className="text-yellow-300">Our Priority</span>
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
                Find and book appointments with verified healthcare professionals in minutes
              </p>

              {/* Search Bar */}
              <motion.div 
                className="bg-white rounded-2xl shadow-2xl p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Advanced search: doctors, specialties, locations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-12 h-14 border-0 text-gray-900 text-lg"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-14 px-8 bg-[#667eea] hover:bg-[#5568d3] text-white"
                    size="lg"
                  >
                    Search
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                className="mt-6 flex gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  onClick={() => navigate('/register')}
                  className="text-white underline underline-offset-4 hover:text-yellow-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  New here? Create an account →
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Hero Benefits Card */}
            <motion.div
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <h3 className="text-2xl text-white mb-6 flex items-center gap-2">
                  ⚡ Quick & Easy Process
                </h3>
                <div className="space-y-4">
                  <motion.div
                    className="bg-white rounded-2xl p-5 shadow-lg"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        1
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-1">Find Your Doctor</h4>
                        <p className="text-sm text-gray-600">Search by specialty or location</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-white rounded-2xl p-5 shadow-lg"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        2
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-1">Book Appointment</h4>
                        <p className="text-sm text-gray-600">Choose your preferred time slot</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-white rounded-2xl p-5 shadow-lg"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center flex-shrink-0 text-white">
                        3
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-1">Get Confirmation</h4>
                        <p className="text-sm text-gray-600">Instant confirmation & reminders</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-5xl mb-3">{stat.emoji}</div>
                <div className="text-3xl md:text-4xl text-[#667eea] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
              Why Choose Se7ety? 🌟
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make healthcare accessible, convenient, and reliable for everyone
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[#667eea]">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{feature.emoji}</div>
                    <h3 className="text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
              Popular Specialties 🏥
            </h2>
            <p className="text-xl text-gray-600">
              Browse doctors by medical specialty
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {specialties.map((specialty, index) => (
              <motion.button
                key={index}
                onClick={() => handleSpecialtyClick(specialty.name)}
                variants={fadeInUp}
                whileHover={{ y: -5, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-[#667eea] hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-3">{specialty.emoji}</div>
                <div className="text-gray-900 mb-1">{specialty.name}</div>
                <div className="text-sm text-gray-500">{specialty.count}</div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white"
        {...fadeInUp}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-3xl md:text-4xl mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of patients who trust Se7ety for their healthcare needs
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="bg-white text-[#667eea] hover:bg-gray-100 h-14 px-8 text-lg"
              >
                Get Started Free
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/patient/find-doctors')}
                size="lg"
                variant="outline"
                className="border-2 border-white bg-white text-[#667eea] hover:bg-white/90 h-14 px-8 text-lg shadow-lg"
              >
                All Doctors
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Book Dialog */}
      {selectedDoctor && (
        <QuickBookDialog
          open={bookDialogOpen}
          onOpenChange={setBookDialogOpen}
          doctorId={selectedDoctor?.doctor_id || selectedDoctor?.id}
          specialty={selectedDoctor.specialty}
        />
      )}
    </div>
  );
}
