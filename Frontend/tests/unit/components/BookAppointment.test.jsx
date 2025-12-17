import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookAppointment } from '../../../src/pages/BookAppointment';

import doctorService from '../../../src/shared/services/doctor.service';
import appointmentService from '../../../src/shared/services/appointment.service';
import scheduleService from '../../../src/shared/services/schedule.service';

/* =======================
   MOCKS
======================= */

vi.mock('../../../src/shared/services/doctor.service');
vi.mock('../../../src/shared/services/appointment.service');
vi.mock('../../../src/shared/services/schedule.service');

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUser = { id: 'patient-123', role: 'patient' };

vi.mock('../../../src/App', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* =======================
   MOCK DATA
======================= */

const mockDoctors = [
  {
    doctor_id: 'doctor-1',
    id: 'doctor-1',
    name: 'Dr. John Smith',
    specialty: 'Cardiology',
    location: 'New York',
    years_experience: 10,
  },
  {
    doctor_id: 'doctor-2',
    id: 'doctor-2',
    name: 'Dr. Jane Doe',
    specialty: 'Pediatrics',
    location: 'Los Angeles',
    years_experience: 8,
  },
];

/* =======================
   TEST SUITE
======================= */

describe('BookAppointment Component - Booking Flow Only (US-011)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Doctors list
    doctorService.list.mockResolvedValue({
      data: mockDoctors,
    });

    // Available time slots
    scheduleService.availableSlots.mockResolvedValue({
      availableSlots: ['09:00 - 10:00', '10:00 - 11:00'],
    });
  });

  it('should allow a patient to book an appointment for a specific doctor, date, and time (US-011)', async () => {
    // Appointment creation success
    appointmentService.create.mockResolvedValue({
      data: {
        appointment_id: 'apt-999',
        status: 'booked',
      },
    });

    render(
      <BrowserRouter>
        <BookAppointment navigate={mockNavigate} />
      </BrowserRouter>
    );

    /* =======================
       STEP 1: Doctors Load
    ======================= */
    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    });

    /* =======================
       STEP 2: Select Doctor
    ======================= */
    const selectDoctorButtons = screen.getAllByRole('button', {
      name: /select/i,
    });
    fireEvent.click(selectDoctorButtons[0]);

    /* =======================
       STEP 3: Select Date
    ======================= */
    const selectDateButtons = await screen.findAllByRole('button', {
      name: /select date/i,
    });
    fireEvent.click(selectDateButtons[0]);

    /* =======================
       STEP 4: Time Slot Section Appears
    ======================= */
    await waitFor(() => {
      expect(
        screen.getByText(/select time slot/i)
      ).toBeInTheDocument();
    });

     /* =======================
       STEP 5: Select Time Slot (Select Dropdown)
     ======================= */
     // Open the Select dropdown by clicking the placeholder text
     const selectTrigger = screen.getByText('Choose a time slot');
     fireEvent.click(selectTrigger);
     // Select the time slot option by text
     const slotOption = await screen.findByText('10:00 - 11:00');
     fireEvent.click(slotOption);

    /* =======================
       STEP 6: Confirm Appointment
    ======================= */
    const confirmButton = screen.getByRole('button', {
      name: /confirm appointment/i,
    });
    fireEvent.click(confirmButton);

    /* =======================
       ASSERTIONS
    ======================= */
    await waitFor(() => {
      expect(appointmentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          doctor_id: 'doctor-1',
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/patient/appointments'
      );
    });
  });
});
