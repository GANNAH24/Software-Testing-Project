
import { useState, useEffect } from 'react';
import { Calendar, Clock, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { DoctorCard } from '../components/DoctorCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../shared/hooks/useAuth';
import { specialties, locations, timeSlots } from '../lib/mockData';
import { toast } from 'sonner';
import doctorService from '../shared/services/doctor.service';
import appointmentService from '../shared/services/appointment.service';

export function BookAppointment({ navigate }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const doctorId = params.get('doctor');
    
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const result = await doctorService.list();
        const list = result?.data || result || [];
        const doctorList = Array.isArray(list) ? list : [];
        setDoctors(doctorList);
        
        if (doctorId) {
          const doctor = doctorList.find(d => d.doctor_id === doctorId || d.id === doctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error loading doctors:', err);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doc.specialty === selectedSpecialty;
    const matchesLocation = !selectedLocation || doc.location === selectedLocation;
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  }).filter(date => date.getDay() !== 0);

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setErrors({});
    setStep(2);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setErrors({});
    setStep(3);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!selectedDoctor) newErrors.doctor = 'Please select a doctor';
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedTime) newErrors.time = 'Please select a time slot';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: selectedDoctor.doctor_id || selectedDoctor.id,
        date: selectedDate,
        time_slot: selectedTime,
        reason: notes || 'General consultation',
        status: 'scheduled'
      };
      
      await appointmentService.create(appointmentData);
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2">Book Appointment</h1>
        <p className="text-gray-600">Schedule a visit with a healthcare professional</p>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: 'Select Doctor' },
            { num: 2, label: 'Choose Date' },
            { num: 3, label: 'Time & Notes' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s.num ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s.num}
                </div>
                <p className={`text-sm mt-2 ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>{s.label}</p>
              </div>
              {i < 2 && (
                <div className={`h-0.5 flex-1 -mt-7 ${step > s.num ? 'bg-[#667eea]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>
      {step === 1 && (
        <div>
          <Card className="p-6 mb-6 border border-gray-200">
            <h2 className="text-xl text-gray-900 mb-4">Search Doctors</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input id="search" type="text" placeholder="Name or specialty" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <select id="specialty" value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]">
                  <option value="">All Specialties</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <select id="location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea]">
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
          {errors.doctor && (
            <Alert variant="destructive" className="mb-6"><AlertDescription>{errors.doctor}</AlertDescription></Alert>
          )}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(6)].map((_, i) => (<LoadingSkeleton key={i} variant="card" />))}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} onClick={() => handleSelectDoctor(doctor)}>
                  <DoctorCard doctor={doctor} onClick={() => handleSelectDoctor(doctor)} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {step === 2 && selectedDoctor && (
        <div>
          <Card className="p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setStep(1)} size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Change Doctor</Button>
              <div className="flex-1"><p className="text-gray-600 text-sm">Selected Doctor</p><p className="text-gray-900">{selectedDoctor.name}</p></div>
            </div>
          </Card>
          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl text-gray-900 mb-4">Select Date</h2>
            {errors.date && (<Alert variant="destructive" className="mb-6"><AlertDescription>{errors.date}</AlertDescription></Alert>)}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                return (
                  <button key={dateStr} onClick={() => handleSelectDate(dateStr)} className={`p-4 rounded-lg border-2 transition-all text-center ${isSelected ? 'border-[#667eea] bg-[#667eea]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <p className={`text-sm ${isSelected ? 'text-[#667eea]' : 'text-gray-600'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className={`text-xl ${isSelected ? 'text-[#667eea]' : 'text-gray-900'}`}>{date.getDate()}</p>
                    <p className={`text-sm ${isSelected ? 'text-[#667eea]' : 'text-gray-600'}`}>{date.toLocaleDateString('en-US', { month: 'short' })}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
      {step === 3 && selectedDoctor && selectedDate && (
        <div>
          <Card className="p-6 mb-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => setStep(2)} size="sm"><ChevronLeft className="w-4 h-4 mr-1" />Change Date</Button>
              <div className="flex-1"><p className="text-gray-600 text-sm">Selected</p><p className="text-gray-900">{selectedDoctor.name} on {new Date(selectedDate).toLocaleDateString()}</p></div>
            </div>
          </Card>
          <Card className="p-6 border border-gray-200">
            <h2 className="text-xl text-gray-900 mb-4">Select Time Slot</h2>
            {errors.time && (<Alert variant="destructive" className="mb-6"><AlertDescription>{errors.time}</AlertDescription></Alert>)}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button key={slot} onClick={() => { setSelectedTime(slot); setErrors({}); }} className={`p-4 rounded-lg border-2 transition-all ${isSelected ? 'border-[#667eea] bg-[#667eea]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Clock className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-[#667eea]' : 'text-gray-400'}`} />
                    <p className={`${isSelected ? 'text-[#667eea]' : 'text-gray-900'}`}>{slot}</p>
                  </button>
                );
              })}
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any special requirements or notes for your appointment..." rows={4} className="mt-1" />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Booking...' : 'Confirm Appointment'}</Button>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}