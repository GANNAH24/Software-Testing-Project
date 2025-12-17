// tests/integration/admin/ManageDoctors.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { ManageDoctors } from '../../../src/components/admin/ManageDoctors';
import adminService from '../../../src/shared/services/admin.service';

// Mock the adminService API calls
vi.mock('../../../src/shared/services/admin.service');

describe('Integration: ManageDoctors Component', () => {
  const mockDoctor = {
    doctor_id: 1,
    name: 'Dr. Test',
    qualifications: 'MD',
    specialty: 'Cardiology',
    location: 'New York',
    phone: '+1 111 222 3333',
    reviewsCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows admin to add and delete doctor profiles', async () => {
    // Mock getAllDoctors to return empty list first
    adminService.getAllDoctors.mockResolvedValueOnce({ data: [] });

    render(<ManageDoctors navigate={vi.fn()} user={{ role: 'admin' }} />);

    // Wait for initial loading to finish
    await waitFor(() => expect(screen.queryByText('No doctors found matching your search.')).toBeInTheDocument());

    // ---- Add Doctor ----
    // Mock createDoctor response
    adminService.createDoctor.mockResolvedValueOnce(mockDoctor);
    // Mock getAllDoctors to return doctor after creation
    adminService.getAllDoctors.mockResolvedValueOnce({ data: [mockDoctor] });

    // Open Create Dialog
    fireEvent.click(screen.getByRole('button', { name: /add doctor/i }));

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Dr. John Doe'), { target: { value: mockDoctor.name } });
    fireEvent.change(screen.getByPlaceholderText('MD, FACC'), { target: { value: mockDoctor.qualifications } });
    fireEvent.change(screen.getByPlaceholderText('New York, NY'), { target: { value: mockDoctor.location } });
    fireEvent.change(screen.getByPlaceholderText('+1 (555) 123-4567'), { target: { value: mockDoctor.phone } });
    // Select specialty (simulate value change)
    const specialtySelect = screen.getByText('Select specialty');
    fireEvent.click(specialtySelect);
    fireEvent.click(screen.getByText(mockDoctor.specialty));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /create doctor/i }));

    // Wait for doctor row to appear
    await waitFor(() => expect(screen.getByText(mockDoctor.name)).toBeInTheDocument());

    // ---- Delete Doctor ----
    // Mock deleteDoctor response
    adminService.deleteDoctor.mockResolvedValueOnce({});
    // Mock getAllDoctors to return empty list after deletion
    adminService.getAllDoctors.mockResolvedValueOnce({ data: [] });

    // Click Trash icon button (delete)
    const trashButtons = screen.getAllByRole('button', { name: '' }); // icon-only buttons have empty name
    fireEvent.click(trashButtons[trashButtons.length - 1]); // assume last row

    // Click dialog Delete button
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Wait for doctor to be removed
    await waitFor(() => expect(screen.queryByText(mockDoctor.name)).not.toBeInTheDocument());
  });
});
