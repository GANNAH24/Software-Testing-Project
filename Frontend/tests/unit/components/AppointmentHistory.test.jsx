/**
 * Unit Tests for Appointment History
 *
 * User Stories Covered:
 * - As a patient, I want to view past and upcoming appointments
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppointmentHistory } from '../../../src/components/AppointmentHistory';

vi.mock('../../../src/api/appointmentApi', () => ({
  getAppointments: vi.fn(() =>
    Promise.resolve([
      { id: '1', date: '2024-12-01', doctor: 'Dr. Smith', status: 'completed' },
      { id: '2', date: '2024-12-20', doctor: 'Dr. Sarah', status: 'upcoming' },
    ])
  ),
}));

describe('Appointment History', () => {
  it('should display past and upcoming appointments', async () => {
    render(<AppointmentHistory />);

    expect(await screen.findByText(/dr. smith/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
    expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
  });
});
