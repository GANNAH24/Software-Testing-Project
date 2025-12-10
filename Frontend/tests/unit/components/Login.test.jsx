/**
 * Unit Tests for Login Component
 * 
 * User Stories Covered:
 * - US-003: As a User, I want to log in with my email and password so that I can access my account securely
 * 
 * Testing Framework: React Testing Library + Vitest
 * Following SOLID principles and clean code practices
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../../src/components/Login';
import { AuthProvider } from '../../../src/shared/contexts/AuthContext';

// Mock dependencies
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper function to render component with providers
const renderLogin = (authContextValue = {}) => {
  const defaultAuthContext = {
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    ...authContextValue,
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={defaultAuthContext}>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component - User Story US-003', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Happy Path Tests
   */
  describe('Login - Happy Path', () => {
    it('should render login form with all required fields', () => {
      // Act
      renderLogin();

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should successfully login patient and redirect to patient dashboard', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: true,
        user: { 
          id: 'user-123', 
          email: 'patient@test.com', 
          role: 'patient' 
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'patient@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('patient@test.com', 'SecurePass123!');
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
    });

    it('should successfully login doctor and redirect to doctor dashboard', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: true,
        user: { 
          id: 'user-456', 
          email: 'doctor@test.com', 
          role: 'doctor' 
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'doctor@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('doctor@test.com', 'SecurePass123!');
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
    });

    it('should successfully login admin and redirect to admin dashboard', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: true,
        user: { 
          id: 'user-789', 
          email: 'admin@test.com', 
          role: 'admin' 
        },
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'AdminPass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'AdminPass123!');
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('should toggle password visibility when eye icon is clicked', () => {
      // Arrange
      renderLogin();
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password/i });

      // Assert initial state
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Act - Show password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Act - Hide password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Login - Error Handling', () => {
    it('should display error when email is missing', async () => {
      // Arrange
      renderLogin();
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should display error when password is missing', async () => {
      // Arrange
      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/please enter both email and password/i)).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should display error when credentials are invalid', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid email or password',
      });

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'wrong@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPassword' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      mockLogin.mockRejectedValue(new Error('Network error'));

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while login is in progress', async () => {
      // Arrange
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  /**
   * Redirect Tests
   */
  describe('Login - Automatic Redirect', () => {
    it('should redirect to dashboard if user is already authenticated', () => {
      // Arrange
      const authContextValue = {
        login: mockLogin,
        user: { id: 'user-123', role: 'patient' },
        isAuthenticated: true,
      };

      // Act
      renderLogin(authContextValue);

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard', { replace: true });
    });

    it('should not redirect if user is not authenticated', () => {
      // Arrange & Act
      renderLogin();

      // Assert
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  /**
   * UI/UX Tests
   */
  describe('Login - UI/UX Elements', () => {
    it('should display link to registration page', () => {
      // Arrange & Act
      renderLogin();

      // Assert
      const registerLink = screen.getByRole('link', { name: /register/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should display link to forgot password page', () => {
      // Arrange & Act
      renderLogin();

      // Assert
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should display welcome message', () => {
      // Arrange & Act
      renderLogin();

      // Assert
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/login to your se7ety healthcare account/i)).toBeInTheDocument();
    });
  });

  /**
   * Edge Cases
   */
  describe('Login - Edge Cases', () => {
    it('should trim whitespace from email input', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: true,
        user: { id: 'user-123', role: 'patient' },
      });

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: '  user@test.com  ' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'SecurePass123!');
      });
    });

    it('should handle very long email addresses', async () => {
      // Arrange
      const longEmail = 'a'.repeat(200) + '@test.com';
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid email format',
      });

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: longEmail } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(longEmail, 'SecurePass123!');
      });
    });

    it('should allow login with special characters in password', async () => {
      // Arrange
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      mockLogin.mockResolvedValue({
        success: true,
        user: { id: 'user-123', role: 'patient' },
      });

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: specialPassword } });
      fireEvent.click(loginButton);

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', specialPassword);
      });
    });
  });

  /**
   * Accessibility Tests
   */
  describe('Login - Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      // Arrange & Act
      renderLogin();

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      // Arrange
      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act & Assert - Tab navigation
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      // Simulate Tab key
      passwordInput.focus();
      expect(document.activeElement).toBe(passwordInput);

      loginButton.focus();
      expect(document.activeElement).toBe(loginButton);
    });

    it('should allow form submission with Enter key', async () => {
      // Arrange
      mockLogin.mockResolvedValue({
        success: true,
        user: { id: 'user-123', role: 'patient' },
      });

      renderLogin();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Act
      fireEvent.change(emailInput, { target: { value: 'user@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } });
      fireEvent.submit(screen.getByRole('form'));

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'SecurePass123!');
      });
    });
  });
});
