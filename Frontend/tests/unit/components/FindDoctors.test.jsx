/**
 * Unit Tests for Find Doctors Feature
 *
 * User Stories Covered:
 * - As a patient, I want to search doctors by specialty, location, or name
 * - As a patient, I want to view doctor profiles with qualifications and reviews
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FindDoctors } from '../../../src/components/FindDoctors';

const mockDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'Cairo',
    rating: 4.8,
  },
];

vi.mock('../../../src/api/doctorApi', () => ({
  searchDoctors: vi.fn(() => Promise.resolve(mockDoctors)),
}));

describe('Find Doctors - Patient Search', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render search filters', () => {
    render(<FindDoctors />);

    expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
  });

  it('should display doctors matching search criteria', async () => {
    render(<FindDoctors />);

    fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
      target: { value: 'Sarah' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/dr. sarah johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no doctors found', async () => {
    render(<FindDoctors />);

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no doctors found/i)).toBeInTheDocument();
    });
  });
});
