/**
 * @file BookAppointment.test.jsx
 * @description Integration tests for the Appointment Booking flow.
 * * Verified User Stories:
 * - US-007: Search Doctors by Name - Validates that the doctor list filters based on name input.
 * - US-008: Filter Doctors by Specialty - Validates that the specialty dropdown correctly filters results.
 * - US-011: Book Appointment - Validates the 3-step wizard flow, including date/time selection
 * and successful API submission.
 * * Technical Coverage:
 * - Component State Transitions (Step 1 -> Step 2 -> Step 3).
 * - Integration with DoctorService and AppointmentService.
 * - Error Handling: Validates UI feedback (Toasts) on API failure.
 * - Deep Linking: Validates automatic state hydration via URL search parameters.
 * * Tools: Vitest, React Testing Library, JSDOM.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookAppointment } from '../../../src/pages/BookAppointment';
import doctorService from '../../../src/shared/services/doctor.service';
import appointmentService from '../../../src/shared/services/appointment.service';
import { toast } from 'sonner';

/**
 * 1. Define Explicit Spies
 */
const mockNavigate = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

/**
 * 2. Mock Services and Data
 */
vi.mock('../../../src/shared/services/doctor.service');
vi.mock('../../../src/shared/services/appointment.service');

vi.mock('../../../src/lib/mockData', () => ({
  specialties: ['Cardiology', 'Pediatrics', 'Neurology'],
  locations: ['New York', 'Los Angeles', 'Chicago'],
  timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM']
}));

vi.mock('../../../src/App', () => ({
  useAuth: () => ({ 
    user: { id: 'patient-123', name: 'Test Patient', role: 'patient' } 
  }),
}));

const mockDoctors = [
  { id: 'doctor-1', doctor_id: 'doctor-1', name: 'Dr. John Smith', specialty: 'Cardiology', location: 'New York' },
  { id: 'doctor-2', doctor_id: 'doctor-2', name: 'Dr. Jane Doe', specialty: 'Pediatrics', location: 'Los Angeles' }
];

describe('BookAppointment Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    doctorService.list.mockResolvedValue({ data: mockDoctors });
  });

  const renderPage = () => render(
    <BrowserRouter>
      <BookAppointment navigate={mockNavigate} />
    </BrowserRouter>
  );

  describe('Step 1: Doctor Selection & Filtering', () => {
    it('should display the search interface and results', async () => {
      renderPage();
      expect(screen.getByText(/Book Appointment/i)).toBeInTheDocument();
      await waitFor(() => expect(screen.getByText('Dr. John Smith')).toBeInTheDocument());
    });

    it('should filter doctors by name search (US-007)', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Dr. John Smith')).toBeInTheDocument());

      const searchInput = screen.getByPlaceholderText(/name or specialty/i);
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
      });
    });

    it('should filter doctors by specialty dropdown (US-008)', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('Dr. John Smith')).toBeInTheDocument());

      const specialtySelect = document.getElementById('specialty');
      fireEvent.change(specialtySelect, { target: { value: 'Pediatrics' } });

      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('Step 2 & 3: Appointment Booking Flow (US-011)', () => {
    it('should complete the full booking wizard successfully', async () => {
      appointmentService.create.mockResolvedValue({ success: true });
      renderPage();

      // Step 1: Select Doctor
      await waitFor(() => expect(screen.getByText('Dr. John Smith')).toBeInTheDocument());
      fireEvent.click(screen.getByText('Dr. John Smith'));

      // Step 2: Select Date
      await waitFor(() => expect(screen.getByText(/Choose Date/i)).toBeInTheDocument());
      // Select the first button that isn't a navigation button
      const buttons = screen.getAllByRole('button');
      const dateBtn = buttons.find(b => !b.textContent.includes('Change') && !b.textContent.includes('Back'));
      fireEvent.click(dateBtn);

      // Step 3: Select Time & Confirm
      await waitFor(() => expect(screen.getByText(/Select Time Slot/i)).toBeInTheDocument());
      fireEvent.click(screen.getByText('09:00 AM'));
      
      const confirmBtn = screen.getByRole('button', { name: /Confirm Appointment/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(appointmentService.create).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/successfully/i));
        expect(mockNavigate).toHaveBeenCalledWith('/patient/appointments');
      });
    });

    it('should handle booking errors gracefully', async () => {
      const errorMessage = 'This slot is no longer available';
      appointmentService.create.mockRejectedValue({ 
        response: { data: { message: errorMessage } } 
      });
      
      renderPage();
      
      // Fast forward to step 3
      await waitFor(() => fireEvent.click(screen.getByText('Dr. John Smith')));
      await waitFor(() => {
        const dateBtn = screen.getAllByRole('button').find(b => !b.textContent.includes('Change'));
        fireEvent.click(dateBtn);
      });
      await waitFor(() => fireEvent.click(screen.getByText('09:00 AM')));
      
      fireEvent.click(screen.getByRole('button', { name: /Confirm Appointment/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(errorMessage);
      });
    });
  });

  describe('Direct Deep Linking', () => {
    it('should skip to Step 2 if doctor ID is in URL', async () => {
      delete window.location;
      window.location = new URL('http://localhost:3000/book?doctor=doctor-2');

      renderPage();

      await waitFor(() => {
        expect(screen.getByText(/Choose Date/i)).toBeInTheDocument();
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
      });
    });
  });
});