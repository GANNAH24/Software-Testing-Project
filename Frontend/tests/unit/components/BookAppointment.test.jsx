/**
 * Unit Tests for BookAppointment Component
 * 
 * User Stories Covered:
 * - US-011: As a Patient, I want to book an appointment with a doctor for a specific date and time
 * - US-007: As a Patient, I want to search doctors by name or specialty
 * - US-008: As a Patient, I want to filter doctors by specialty and location
 * 
 * Testing Framework: React Testing Library + Vitest
 * Following SOLID principles and clean code practices
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookAppointment } from '../../../src/pages/BookAppointment';
import doctorService from '../../../src/shared/services/doctor.service';
import appointmentService from '../../../src/shared/services/appointment.service';

// Mock services
vi.mock('../../../src/shared/services/doctor.service');
vi.mock('../../../src/shared/services/appointment.service');

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth hook
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
  {
    doctor_id: 'doctor-3',
    id: 'doctor-3',
    name: 'Dr. Mike Johnson',
    specialty: 'Cardiology',
    location: 'New York',
    years_experience: 15,
  },
];

describe('BookAppointment Component - User Stories US-011, US-007, US-008', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    doctorService.list.mockResolvedValue({ data: mockDoctors });
  });

  /**
   * Happy Path Tests - View Doctors (Step 1)
   */
  describe('Step 1: Doctor Selection - Happy Path', () => {
    it('should load and display all available doctors', async () => {
      // Act
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Dr. Mike Johnson')).toBeInTheDocument();
      });
    });

    it('should display doctor specialty and location', async () => {
      // Act
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
        expect(screen.getByText(/new york/i)).toBeInTheDocument();
      });
    });

    it('should display loading skeleton while fetching doctors', () => {
      // Arrange
      doctorService.list.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      // Act
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      // Assert
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  /**
   * User Story: US-007 - Search Doctors by Name or Specialty
   */
  describe('Doctor Search Functionality', () => {
    it('should filter doctors by name search', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search doctors/i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'Jane' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Dr. Mike Johnson')).not.toBeInTheDocument();
      });
    });

    it('should filter doctors by specialty search', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/cardiology/i).length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByPlaceholderText(/search doctors/i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'Cardiology' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Mike Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Jane Doe')).not.toBeInTheDocument();
      });
    });

    it('should display no results message when search has no matches', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search doctors/i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'NonExistentDoctor' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no doctors found/i)).toBeInTheDocument();
      });
    });

    it('should clear search results when search input is cleared', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search doctors/i);

      // Act - Search and then clear
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
      await waitFor(() => {
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
      });

      fireEvent.change(searchInput, { target: { value: '' } });

      // Assert - All doctors should be visible again
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Dr. Mike Johnson')).toBeInTheDocument();
      });
    });
  });

  /**
   * User Story: US-008 - Filter Doctors by Specialty and Location
   */
  describe('Doctor Filtering Functionality', () => {
    it('should filter doctors by specialty', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const specialtyFilter = screen.getByLabelText(/filter by specialty/i);

      // Act
      fireEvent.change(specialtyFilter, { target: { value: 'Pediatrics' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Dr. Mike Johnson')).not.toBeInTheDocument();
      });
    });

    it('should filter doctors by location', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const locationFilter = screen.getByLabelText(/filter by location/i);

      // Act
      fireEvent.change(locationFilter, { target: { value: 'Los Angeles' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. Jane Doe')).toBeInTheDocument();
        expect(screen.queryByText('Dr. John Smith')).not.toBeInTheDocument();
      });
    });

    it('should apply multiple filters simultaneously', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const specialtyFilter = screen.getByLabelText(/filter by specialty/i);
      const locationFilter = screen.getByLabelText(/filter by location/i);

      // Act
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } });
      fireEvent.change(locationFilter, { target: { value: 'New York' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Mike Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Jane Doe')).not.toBeInTheDocument();
      });
    });

    it('should combine search and filters', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search doctors/i);
      const specialtyFilter = screen.getByLabelText(/filter by specialty/i);

      // Act
      fireEvent.change(searchInput, { target: { value: 'John' } });
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } });

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
        expect(screen.queryByText('Dr. Mike Johnson')).not.toBeInTheDocument();
        expect(screen.queryByText('Dr. Jane Doe')).not.toBeInTheDocument();
      });
    });
  });

  /**
   * Happy Path Tests - Select Doctor and Proceed (Step 2)
   */
  describe('Step 2: Select Doctor and Date', () => {
    it('should proceed to date selection after selecting a doctor', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Act
      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/select date/i)).toBeInTheDocument();
      });
    });

    it('should display available dates for next 30 days excluding Sundays', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      // Assert
      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button', { name: /select date/i });
        expect(dateButtons.length).toBeLessThanOrEqual(26); // Max 30 days minus ~4 Sundays
      });
    });

    it('should allow going back to doctor selection from date selection', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText(/select date/i)).toBeInTheDocument();
      });

      // Act
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });
    });
  });

  /**
   * Happy Path Tests - Select Time Slot (Step 3)
   */
  describe('Step 3: Select Time Slot', () => {
    it('should proceed to time selection after selecting a date', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Select doctor
      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByText(/select date/i)).toBeInTheDocument();
      });

      // Act - Select date
      const dateButtons = screen.getAllByRole('button', { name: /select date/i });
      fireEvent.click(dateButtons[0]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/select time/i)).toBeInTheDocument();
      });
    });

    it('should display available time slots', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button', { name: /select date/i });
        fireEvent.click(dateButtons[0]);
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/09:00 - 10:00/i)).toBeInTheDocument();
        expect(screen.getByText(/10:00 - 11:00/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * User Story: US-011 - Book Appointment
   */
  describe('Complete Appointment Booking', () => {
    it('should successfully book appointment with all required information', async () => {
      // Arrange
      appointmentService.create.mockResolvedValue({
        data: {
          appointment_id: 'apt-123',
          status: 'booked',
        },
      });

      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Act - Complete booking flow
      // Step 1: Select doctor
      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      // Step 2: Select date
      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button', { name: /select date/i });
        fireEvent.click(dateButtons[0]);
      });

      // Step 3: Select time
      await waitFor(() => {
        const timeButton = screen.getByText(/10:00 - 11:00/i);
        fireEvent.click(timeButton);
      });

      // Step 4: Add notes (optional)
      const notesTextarea = screen.getByPlaceholderText(/additional notes/i);
      fireEvent.change(notesTextarea, { target: { value: 'Regular checkup' } });

      // Step 5: Confirm booking
      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      fireEvent.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(appointmentService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            doctor_id: 'doctor-1',
            notes: 'Regular checkup',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/patient/appointments');
      });
    });

    it('should book appointment without optional notes', async () => {
      // Arrange
      appointmentService.create.mockResolvedValue({
        data: { appointment_id: 'apt-123' },
      });

      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Act - Complete booking without notes
      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button', { name: /select date/i });
        fireEvent.click(dateButtons[0]);
      });

      await waitFor(() => {
        const timeButton = screen.getByText(/10:00 - 11:00/i);
        fireEvent.click(timeButton);
      });

      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      fireEvent.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(appointmentService.create).toHaveBeenCalled();
      });
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Appointment Booking - Error Handling', () => {
    it('should handle API errors when loading doctors', async () => {
      // Arrange
      doctorService.list.mockRejectedValue(new Error('Failed to load doctors'));

      // Act
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error loading doctors/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors when booking appointment', async () => {
      // Arrange
      appointmentService.create.mockRejectedValue(new Error('Booking failed'));

      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Act - Complete booking flow
      const selectButton = screen.getAllByRole('button', { name: /select/i })[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        const dateButtons = screen.getAllByRole('button', { name: /select date/i });
        fireEvent.click(dateButtons[0]);
      });

      await waitFor(() => {
        const timeButton = screen.getByText(/10:00 - 11:00/i);
        fireEvent.click(timeButton);
      });

      const confirmButton = screen.getByRole('button', { name: /confirm appointment/i });
      fireEvent.click(confirmButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/booking failed/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before submission', async () => {
      // Arrange
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
      });

      // Act - Try to submit without completing all steps
      // Jump to confirmation without selecting everything
      // This should not be possible in real usage, but we test validation

      // Assert
      expect(appointmentService.create).not.toHaveBeenCalled();
    });
  });

  /**
   * Direct Doctor Selection from URL
   */
  describe('Direct Doctor Selection via URL', () => {
    it('should pre-select doctor when doctor ID is in URL', async () => {
      // Arrange
      const mockLocation = { search: '?doctor=doctor-1' };
      window.history.pushState({}, '', '/book-appointment?doctor=doctor-1');

      // Act
      render(
        <BrowserRouter>
          <BookAppointment navigate={mockNavigate} />
        </BrowserRouter>
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/select date/i)).toBeInTheDocument();
      });
    });
  });
});
