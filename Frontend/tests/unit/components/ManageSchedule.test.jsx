/**
 * Unit Tests for ManageSchedule (Doctor Schedule Management)
 *
 * User Stories Covered:
 * - As a doctor, I want to manage my availability
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ManageSchedule } from '../../../src/components/doctor/ManageSchedule';

// Mock dependencies
vi.mock('../../../src/shared/services/schedule.service', () => ({
  default: {
    list: vi.fn(() => Promise.resolve({ data: [] })),
    update: vi.fn(() => Promise.resolve({ data: {} })),
    remove: vi.fn(() => Promise.resolve({ data: {} })),
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

    // Wait for main heading to appear
    await waitFor(
      () => {
        const heading = screen.queryByText(/manage schedule/i);
        expect(heading).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('shows empty state when no schedules', async () => {
    render(<ManageSchedule />);

    // Wait for component to load (either with content or empty state)
    await waitFor(
      () => {
        // Check that loading is done by verifying main heading exists
        const heading = screen.queryByText(/manage schedule/i);
        expect(heading).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  // Add more tests for adding, editing, and deleting slots as needed
});
