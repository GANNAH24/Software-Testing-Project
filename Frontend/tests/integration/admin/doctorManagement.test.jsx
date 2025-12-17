import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// This line is the fix: Changed from AdminDoctors to ManageDoctors
import { ManageDoctors } from '../../../src/components/admin/ManageDoctors';
import adminService from '../../../src/shared/services/admin.service';

vi.mock('../../../src/shared/services/admin.service', () => ({
  default: {
    getAllDoctors: vi.fn(),
    createDoctor: vi.fn(),
    updateDoctor: vi.fn(),
    deleteDoctor: vi.fn(),
  }
}));

describe('Unit: ManageDoctors Component', () => {
  beforeEach(() => {
    adminService.getAllDoctors.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the Manage Doctors header correctly', async () => {
    render(<ManageDoctors />);
    const header = await screen.findByText(/Manage Doctors/i);
    expect(header).toBeInTheDocument();
  });

  it('shows the "Add Doctor" button', async () => {
    render(<ManageDoctors />);
    const addButton = await screen.findByRole('button', { name: /Add Doctor/i });
    expect(addButton).toBeInTheDocument();
  });
});