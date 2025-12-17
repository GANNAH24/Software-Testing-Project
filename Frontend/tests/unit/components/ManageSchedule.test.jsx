/**
 * Unit Tests for ManageSchedule (Doctor Schedule Management)
 *
 * User Stories Covered:
 * - As a doctor, I want to manage my availability
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ManageSchedule } from '../../../src/components/doctor/ManageSchedule';

// Mock dependencies
vi.mock('../../../src/shared/services/schedule.service', () => ({
  default: {
    list: vi.fn(() => Promise.resolve({ data: [] })),
    update: vi.fn(() => Promise.resolve({})),
    remove: vi.fn(() => Promise.resolve({})),
  }
}));
vi.mock('../../../src/shared/services/doctor.service', () => ({
  default: {
    profile: vi.fn(() => Promise.resolve({ data: { working_hours_start: '09:00', working_hours_end: '17:00' } }))
  }
}));
vi.mock('../../../src/shared/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'doctor1', name: 'Dr. Test' } })
}));

// Silence toast notifications
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));

describe('ManageSchedule (Doctor Availability)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders schedule management UI', async () => {
    render(<ManageSchedule />);
    // Wait for loading spinner to disappear
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      // The spinner is a div with class 'animate-spin', so check for its absence
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/manage schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/set your availability/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create schedule/i })).toBeInTheDocument();
  });

  it('shows empty state when no schedules', async () => {
    render(<ManageSchedule />);
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
    expect(screen.getByText(/no schedule set/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first schedule/i })).toBeInTheDocument();
  });

  // Add more tests for adding, editing, and deleting slots as needed
});
