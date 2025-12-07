import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import doctorService from '../../shared/services/doctor.service';
import appointmentService from '../../shared/services/appointment.service';
import scheduleService from '../../shared/services/schedule.service';
import { useAuthContext } from '../../shared/contexts/AuthContext';

export function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  // Check if doctor ID was passed from Find Doctors page
  useEffect(() => {
    if (location.state?.doctorId) {
      setSelectedDoctor(location.state.doctorId);
    }
  }, [location.state]);
  
  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorService.list();
        const list = response?.data || response?.doctors || response || [];
        setDoctors(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        toast.error('Failed to load doctors');
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);
  
  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);
  
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await scheduleService.availableSlots(selectedDoctor, selectedDate);
      const slots = response?.data || response?.slots || response || [];
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast.error('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const validateStep = (currentStep) => {
    /** @type {{[key: string]: string}} */
    const newErrors = {};

    if (currentStep === 1 && !selectedDoctor) {
      newErrors.doctor = 'Please select a doctor';
    }
    if (currentStep === 2 && !selectedDate) {
      newErrors.date = 'Please select a date';
    }
    if (currentStep === 3 && !selectedTimeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      const appointmentData = {
        doctor_id: selectedDoctor,
        patient_id: user?.id,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        notes: notes || '',
        status: 'pending'
      };
      
      await appointmentService.create(appointmentData);
      setSuccess(true);
      toast.success('Appointment booked successfully!');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-gray-900 mb-4">Appointment Confirmed!</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="text-gray-900">{doctor?.name || doctor?.full_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900">{selectedTimeSlot}</span>
                </div>
                {notes && (
                  <div>
                    <span className="text-gray-600">Notes:</span>
                    <p className="text-gray-900 mt-1">{notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/patient/appointments')} className="flex-1 bg-[#667eea] hover:bg-[#5568d3]">
                View My Appointments
              </Button>
              <Button onClick={() => navigate('/patient/book-appointment')} variant="outline" className="flex-1">
                Book Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-gray-900 mb-6">Book Appointment</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    s <= step
                      ? 'bg-[#667eea] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-[#667eea]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm text-gray-600">
            <span>Doctor</span>
            <span>Date</span>
            <span>Time</span>
            <span>Confirm</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Select Doctor */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Select a Doctor
                  </h2>
                  <div className="space-y-3">
                    {MOCK_DOCTORS.map((doctor) => (
                      <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctor(doctor.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                          selectedDoctor === doctor.id
                            ? 'border-[#667eea] bg-[#667eea]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-600">{doctor.specialty}</div>
                      </button>
                    ))}
                  </div>
                  {errors.doctor && (
                    <p className="text-sm text-red-600 mt-2">{errors.doctor}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select Date */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Select Date
                  </h2>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600 mt-2">{errors.date}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Select Time Slot */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Select Time Slot
                  </h2>
                  <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    <SelectTrigger className={errors.timeSlot ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.timeSlot && (
                    <p className="text-sm text-red-600 mt-2">{errors.timeSlot}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Notes and Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Notes (Optional)
                  </h2>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific concerns or notes for the doctor..."
                    rows={4}
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-900 mb-3">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="text-gray-900">{MOCK_DOCTORS.find(d => d.id === selectedDoctor)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{selectedDate ? new Date(selectedDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="text-gray-900">{selectedTimeSlot || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button onClick={handleNext} className="flex-1 bg-[#667eea] hover:bg-[#5568d3]">
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#667eea] hover:bg-[#5568d3]"
                >
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
