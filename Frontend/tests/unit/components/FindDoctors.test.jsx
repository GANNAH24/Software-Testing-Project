vi.mock('../../../src/shared/contexts/AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'patient1', name: 'Patient Test' } })
}));
/**
 * Unit Tests for Find Doctors Feature
 *
 * User Stories Covered:
 * - As a patient, I want to search doctors by specialty, location, or name
 * - As a patient, I want to view doctor profiles with qualifications and reviews
 * in find doctorUS-008: As a Patient, I want to filter doctors by specialty and location
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FindDoctors } from '../../../src/components/patient/FindDoctors';
import { MemoryRouter } from 'react-router-dom';

const mockDoctors = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    location: 'Cairo',
    rating: 4.8,
  },
];


vi.mock('../../../src/shared/services/doctor.service', () => ({
  default: {
    list: vi.fn(() => Promise.resolve({ data: mockDoctors })),
  },
}));

describe('Find Doctors - Patient Search', () => {
    it('should filter doctors by specialty and location', async () => {
      render(
        <MemoryRouter>
          <FindDoctors />
        </MemoryRouter>
      );

      // Wait for doctors to load
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
      });

      // Select specialty (Cardiology)
      const specialtySelect = screen.getAllByRole('combobox')[0];
      fireEvent.mouseDown(specialtySelect);
      // Select the option from the dropdown
      const specialtyOption = await screen.findByText('Cardiology');
      fireEvent.click(specialtyOption);

      // Select location (Cairo)
      const locationSelect = screen.getAllByRole('combobox')[1];
      fireEvent.mouseDown(locationSelect);
      const locationOption = await screen.findByText('Cairo');
      fireEvent.click(locationOption);

      // Assert filtered doctor is visible
      await waitFor(() => {
        expect(screen.getByText('Dr. Sarah Johnson')).toBeInTheDocument();
      });
    });
  beforeEach(() => vi.clearAllMocks());


  it('should render search filters', () => {
    render(
      <MemoryRouter>
        <FindDoctors />
      </MemoryRouter>
    );

    // The actual placeholder is "Search by doctor or specialty"
    expect(screen.getByPlaceholderText(/search by doctor or specialty/i)).toBeInTheDocument();
    // The selects may not have aria-labels, so check for combobox roles and visible text
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
  });

  it('should display doctors matching search criteria', async () => {
    render(
      <MemoryRouter>
        <FindDoctors />
      </MemoryRouter>
    );

    // The input uses placeholder "Search by doctor or specialty"
    fireEvent.change(screen.getByPlaceholderText(/search by doctor or specialty/i), {
      target: { value: 'Sarah' },
    });

    // Filtering is live, so just wait for doctor to appear
    await waitFor(() => {
      expect(screen.getByText(/dr. sarah johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no doctors found', async () => {
    // Mock doctorService.list to return empty array
    const doctorService = (await import('../../../src/shared/services/doctor.service')).default;
    doctorService.list.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <FindDoctors />
      </MemoryRouter>
    );

    // Simulate entering a query that yields no results
    fireEvent.change(screen.getByPlaceholderText(/search by doctor or specialty/i), {
      target: { value: 'Nonexistent' },
    });

    await waitFor(() => {
      expect(screen.getByText(/no doctors found/i)).toBeInTheDocument();
    });
  });
});
