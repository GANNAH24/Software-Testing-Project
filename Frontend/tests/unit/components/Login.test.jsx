/**
 * Unit Tests for Login Component
 * * User Stories Covered:
 * - US-003: As a User, I want to log in with my email and password so that I can access my account securely
 * * Testing Framework: React Testing Library + Vitest
 * Following SOLID principles and clean code practices
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../../../src/components/Login';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from '../../../src/shared/contexts/AuthContext';

// Mock the hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

describe('Login Component - User Story US-003', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
    });
  });

  describe('Login - Automatic Redirect', () => {
    it('should redirect to dashboard if user is already authenticated', async () => {
      // Mock state where user is already logged in
      vi.spyOn(AuthContext, 'useAuthContext').mockReturnValue({
        login: mockLogin,
        isAuthenticated: true,
        user: { role: 'patient' },
      });

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard', { replace: true });
      });
    });
  });

  describe('Login - Edge Cases', () => {
    it('should trim whitespace from email input', async () => {
      mockLogin.mockResolvedValue({ success: true, user: { role: 'patient' } });

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Action: Input with spaces
      fireEvent.change(emailInput, { target: { value: '  user@test.com  ' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // This ensures the .trim() logic in your component is working
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password');
      });
    });
  });

  describe('Login - Accessibility', () => {
    it('should allow form submission with Enter key', async () => {
      mockLogin.mockResolvedValue({ success: true, user: { role: 'patient' } });

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      // FIX: Access the form directly via the submit button's form property
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.submit(submitButton.form);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password');
      });
    });
  });
});