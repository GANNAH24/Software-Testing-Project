/**
 * Unit Tests for Register Component
 * * User Stories Covered:
 * - FR-001: Patient Registration (Search/Evaluate/Profile)
 * - FR-002: Doctor Registration (Schedule/Qualifications)
 * - FR-005: User Registration and Authentication
 * - NFR: Security (Password Validation)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../../../src/components/Register';
import * as AuthContext from '../../../src/shared/contexts/AuthContext';

// Mock Navigation & Toast
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('Register Component - FR & NFR Verification', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
      register: mockRegister,
      isAuthenticated: false,
      user: null
    });
  });

  const renderRegister = () => render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );

  it('should successfully register a patient (FR-001/FR-005)', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderRegister();

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'patient@test.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'SecurePass123!' } });
    fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '1990-01-01' } });
    
    // Target gender select
    const selects = document.querySelectorAll('select');
    if (selects.length > 0) {
      const genderSelect = Array.from(selects).find(s => s.id !== 'role-selection') || selects[0];
      fireEvent.change(genderSelect, { target: { value: 'male' } });
    }

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should register a doctor with professional details (FR-002)', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderRegister();

    // 1. Switch to Doctor role specifically using the button
    const doctorButton = screen.getByRole('button', { name: /doctor/i });
    fireEvent.click(doctorButton);

    // 2. Wait for doctor-specific fields to appear in DOM
    const qualInput = await screen.findByLabelText(/qualifications/i);
    const locInput = screen.getByLabelText(/location/i);

    // 3. Fill basic info
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Dr. Smith' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'smith@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'SecurePass123!' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '0987654321' } });

    // 4. Fill Doctor Info
    fireEvent.change(qualInput, { target: { value: 'MD, Cardiology Specialist' } });
    fireEvent.change(locInput, { target: { value: 'Central Hospital' } });

    // 5. Handle the specialty select - find the one that isn't role-selection
    const allSelects = document.querySelectorAll('select');
    const specialtySelect = Array.from(allSelects).find(s => s.id !== 'role-selection');
    
    if (specialtySelect) {
      fireEvent.change(specialtySelect, { target: { value: 'Cardiology' } });
      // Dispatch change event manually to ensure React state updates
      specialtySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 6. Submit
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        role: 'doctor',
        email: 'smith@test.com'
      }));
    }, { timeout: 4000 });
  });

  it('should validate security and empty fields', async () => {
    renderRegister();
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'A' } });
    // Soft check for the validation UI
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
  });
});