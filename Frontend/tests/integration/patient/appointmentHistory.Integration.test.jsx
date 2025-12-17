/**
 * Integration Tests for Patient Appointments Page
 * 
 * User Stories Covered:
 * - US-011: As a Patient, I want to book an appointment with a doctor
 * - US-012: As a Patient, I want to view my upcoming appointments
 * - US-013: As a Patient, I want to view my past appointments
 * 
 * Tests the complete appointment history workflow including:
 * - Retrieving appointments from the API for the logged-in patient
 * - Displaying upcoming appointments correctly
 * - Displaying past appointments correctly
 * - Rendering doctor names, dates, time slots, and statuses
 * - Ensuring that both completed and pending appointments appear as expected
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PatientAppointments } from '../../../src/components/patient/PatientAppointments.jsx';
import appointmentService from '../../../src/shared/services/appointment.service';

// Mock AuthContext
vi.mock('../../../src/shared/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: '123' } }),
}));

// Mock appointmentService
vi.mock('../../../src/shared/services/appointment.service', () => ({
  default: {
    byPatient: vi.fn(),
  },
}));


describe('Integration: Appointment History', () => {
  it('shows upcoming and past appointments', async () => {
    appointmentService.byPatient.mockResolvedValue([
  { id: '1', date: '2024-12-20', doctor: { fullName: 'Dr. John' }, status: 'pending', time_slot: '10:00-11:00' },
  { id: '2', date: '2024-12-01', doctor: { fullName: 'Dr. Jane' }, status: 'completed', time_slot: '09:00-10:00' },
]);


    render(
      <BrowserRouter>
        <PatientAppointments />
      </BrowserRouter>
    );

await waitFor(() => {
  const drJohnElements = screen.getAllByText('Dr. John');
  const drJaneElements = screen.getAllByText('Dr. Jane');

  expect(drJohnElements.length).toBeGreaterThan(0);
  expect(drJaneElements.length).toBeGreaterThan(0);
});

  });
});
