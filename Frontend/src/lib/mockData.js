// Basic mock data used by demo pages/components

export const specialties = [
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Internal Medicine',
];

export const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'Chicago, IL',
  'Houston, TX',
  'San Francisco, CA',
];

export const timeSlots = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
];

export const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'New York, NY',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    location: 'Los Angeles, CA',
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    location: 'Chicago, IL',
    rating: 4.6,
  },
];

export const mockAppointments = [
  {
    id: 'a1',
    patient_id: '1',
    doctor_id: '1',
    date: '2025-11-20',
    time_slot: '10:00-11:00',
    status: 'scheduled',
    notes: '',
  },
  {
    id: 'a2',
    patient_id: '1',
    doctor_id: '2',
    date: '2025-10-10',
    time_slot: '09:00-10:00',
    status: 'completed',
    notes: 'Follow-up',
  },
];
