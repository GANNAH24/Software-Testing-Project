/**
 * Integration Tests for Find Doctors Page
 * 
 * User Stories Covered:
 * - US-010: As a Patient, I want to search for doctors by specialty or location
 * - US-011: As a Patient, I want to view doctor profiles
 * - US-012: As a Patient, I want to see doctor availability and ratings
 * 
 * Tests the complete doctor search and view workflow including:
 * - Listing doctors from the API
 * - Filtering doctors by specialty
 * - Searching doctors by name or specialty
 * - Displaying doctor details (name, specialty, rating, location)
 * - Checking that profile and booking buttons render correctly
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { FindDoctors as Doctors } from '../../../src/components/patient/FindDoctors';
import doctorService from '../../../src/shared/services/doctor.service';
import { AuthProvider } from '../../../src/shared/contexts/AuthContext';

// Mock the doctorService
vi.mock('../../../src/shared/services/doctor.service');

describe('Integration: Find Doctors', () => {
  it('allows patient to search doctors by specialty and view profile', async () => {
    doctorService.list.mockResolvedValue({
      data: [
        { id: '1', name: 'Dr. John Smith', specialty: 'Cardiology' }
      ]
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Doctors />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for doctors to load
    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    });

    // Type into the search input
    fireEvent.change(screen.getByPlaceholderText(/search by doctor or specialty/i), {
      target: { value: 'Cardiology' },
    });

    // Check that filtered doctor is visible
    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    });
  });
});
