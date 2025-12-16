/**
 * Unit Tests for Admin Doctor Management
 *
 * User Stories Covered:
 * - As an admin, I want to add, edit, and remove doctors
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminDoctors } from '../../../src/components/admin/AdminDoctors';

vi.mock('../../../src/api/adminApi', () => ({
  addDoctor: vi.fn(),
  deleteDoctor: vi.fn(),
}));

describe('Admin Doctor Management', () => {
  it('should allow admin to add a doctor', async () => {
    render(<AdminDoctors />);

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Dr. New' },
    });

    fireEvent.click(screen.getByRole('button', { name: /add doctor/i }));

    expect(await screen.findByText(/doctor added/i)).toBeInTheDocument();
  });

  it('should allow admin to remove a doctor', async () => {
    render(<AdminDoctors />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(await screen.findByText(/doctor removed/i)).toBeInTheDocument();
  });
});
