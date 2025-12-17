/**
 * Unit Tests for Doctor Schedule Management
 *
 * User Stories Covered:
 * - As a doctor, I want to manage my availability
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DoctorSchedule } from '../../../src/components/DoctorSchedule';

vi.mock('../../../src/api/scheduleApi', () => ({
  saveAvailability: vi.fn(() => Promise.resolve(true)),
}));

describe('Doctor Schedule Management', () => {
  it('should allow doctor to add available time slots', async () => {
    render(<DoctorSchedule />);

    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: '10:00' },
    });

    fireEvent.change(screen.getByLabelText(/end time/i), {
      target: { value: '12:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/availability saved/i)).toBeInTheDocument();
  });
});
