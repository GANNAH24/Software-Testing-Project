/**
 * Unit Tests for Appointment History
 *
 * User Stories Covered:
 * - As a patient, I want to view past and upcoming appointments
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientAppointments } from '../../../src/components/patient/PatientAppointments';

vi.mock('../../../src/shared/services/appointment.service', () => ({
  default: {
    byPatient: vi.fn(() => Promise.resolve([
      { id: '1', date: '2024-12-01', doctor: { fullName: 'Dr. Smith', specialty: 'Cardiology' }, status: 'completed', time_slot: '09:00-10:00' },
      { id: '2', date: '2024-12-20', doctor: { fullName: 'Dr. Sarah', specialty: 'Dermatology' }, status: 'pending', time_slot: '10:00-11:00' },
    ])),
    cancel: vi.fn(() => Promise.resolve({})),
    remove: vi.fn(() => Promise.resolve({})),
  }
}));
vi.mock('../../../src/shared/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'patient1', name: 'Patient Test' } })
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

describe('Appointment History', () => {
  it('should display past and upcoming appointments', async () => {
    render(
      <MemoryRouter>
        <PatientAppointments />
      </MemoryRouter>
    );
    // Wait for loading spinner to disappear
    await screen.findByText(/my appointments/i);
    expect(screen.getAllByText(/dr. smith/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dr. sarah/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
  });
});
