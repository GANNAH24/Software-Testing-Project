import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, vi, afterEach, beforeAll } from 'vitest';
import { ManageDoctors } from '../../../src/components/admin/ManageDoctors';

const doctors = [];

beforeAll(() => {
  vi.stubModule('../../../src/shared/services/admin.service', {
    default: {
      getAllDoctors: vi.fn(() => Promise.resolve({ data: doctors })),
      createDoctor: vi.fn((data) => {
        const newDoctor = { ...data, doctor_id: 'doc-9' };
        doctors.push(newDoctor);
        return Promise.resolve(newDoctor);
      }),
      updateDoctor: vi.fn(() => Promise.resolve()),
      deleteDoctor: vi.fn((id) => {
        const index = doctors.findIndex((d) => d.doctor_id === id);
        if (index > -1) doctors.splice(index, 1);
        return Promise.resolve();
      }),
    },
  });
});

describe('Integration: Admin Doctor Management', () => {
  afterEach(() => {
    vi.resetAllMocks();
    doctors.length = 0;
  });

  it('allows admin to add and delete doctor profiles', async () => {
    render(<ManageDoctors />);

    // Open Create Doctor dialog
    fireEvent.click(screen.getByText(/add doctor/i));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText(/Dr\. John Doe/i), { target: { value: 'Dr. New' } });
    fireEvent.change(screen.getByPlaceholderText(/MD, FACC/i), { target: { value: 'MD' } });
    fireEvent.change(screen.getByPlaceholderText(/New York, NY/i), { target: { value: 'New York' } });
    fireEvent.change(screen.getByPlaceholderText(/\+1 \(555\) 123-4567/i), { target: { value: '+1 111 222 3333' } });

    // Select specialty
    fireEvent.click(screen.getByText('Select specialty'));
    fireEvent.click(screen.getByText('Cardiology'));

    // Submit form
    fireEvent.click(screen.getByText(/create doctor/i));

    // Wait for doctor to appear
    const addedDoctor = await screen.findByText('Dr. New');
    expect(addedDoctor).toBeInTheDocument();

    // Delete doctor
    const row = addedDoctor.closest('tr');
    const actionsCell = row.querySelector('td:last-child');
    const deleteButton = actionsCell.querySelector('button:last-child'); // Delete button
    fireEvent.click(deleteButton);

    // Confirm deletion
    fireEvent.click(screen.getByText(/^delete$/i));

    // Verify deletion
    await screen.findByText(/No doctors found matching/i);
  });
});
