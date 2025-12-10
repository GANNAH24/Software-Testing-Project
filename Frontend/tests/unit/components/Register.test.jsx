/**
 * Unit Tests for Register Component
 * 
 * User Stories Covered:
 * - US-001: As a Patient, I want to register with my personal details so that I can access the healthcare platform
 * - US-002: As a Doctor, I want to register with my professional details so that I can offer my services
 * - US-004: As a User, I want to receive clear error messages when my password doesn't meet requirements
 * 
 * Testing Framework: React Testing Library + Vitest
 * Following SOLID principles and clean code practices
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../../../src/components/Register';
import { AuthProvider } from '../../../src/shared/contexts/AuthContext';

// Mock dependencies
const mockNavigate = vi.fn();
const mockRegister = vi.fn();

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
const renderRegister = (authContextValue = {}) => {
  const defaultAuthContext = {
    register: mockRegister,
    user: null,
    isAuthenticated: false,
    ...authContextValue,
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={defaultAuthContext}>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component - User Stories US-001, US-002, US-004', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Happy Path Tests - Patient Registration (US-001)
   */
  describe('Patient Registration - Happy Path', () => {
    it('should render patient registration form with all required fields', () => {
      // Act
      renderRegister();

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should successfully register a patient with valid data', async () => {
      // Arrange
      mockRegister.mockResolvedValue({
        success: true,
        user: { 
          id: 'user-123', 
          email: 'patient@test.com', 
          role: 'patient' 
        },
      });

      renderRegister();

      // Act - Fill in patient form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'patient@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { 
        target: { value: '1990-01-01' } 
      });
      
      // Select gender
      const genderSelect = screen.getByLabelText(/gender/i);
      fireEvent.change(genderSelect, { target: { value: 'male' } });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'patient@test.com',
            password: 'SecurePass123!',
            role: 'patient',
            fullName: 'John Doe',
            phone: '+1234567890',
            dateOfBirth: '1990-01-01',
            gender: 'male',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard');
      });
    });

    it('should display patient-specific fields when patient role is selected', () => {
      // Arrange & Act
      renderRegister();

      // Assert - Patient fields should be visible by default
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    });
  });

  /**
   * Happy Path Tests - Doctor Registration (US-002)
   */
  describe('Doctor Registration - Happy Path', () => {
    it('should successfully register a doctor with valid data', async () => {
      // Arrange
      mockRegister.mockResolvedValue({
        success: true,
        user: { 
          id: 'user-456', 
          email: 'doctor@test.com', 
          role: 'doctor' 
        },
      });

      renderRegister();

      // Act - Switch to doctor role
      const roleSelect = screen.getByLabelText(/register as/i);
      fireEvent.change(roleSelect, { target: { value: 'doctor' } });

      // Fill in doctor form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'doctor@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'Dr. Jane Smith' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+1234567890' } 
      });
      
      const specialtySelect = screen.getByLabelText(/specialty/i);
      fireEvent.change(specialtySelect, { target: { value: 'Cardiology' } });
      
      fireEvent.change(screen.getByLabelText(/qualifications/i), { 
        target: { value: 'MD, FACC' } 
      });
      fireEvent.change(screen.getByLabelText(/location/i), { 
        target: { value: 'New York' } 
      });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'doctor@test.com',
            role: 'doctor',
            specialty: 'Cardiology',
            qualifications: 'MD, FACC',
            location: 'New York',
          })
        );
        expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard');
      });
    });

    it('should display doctor-specific fields when doctor role is selected', () => {
      // Arrange
      renderRegister();

      // Act - Switch to doctor role
      const roleSelect = screen.getByLabelText(/register as/i);
      fireEvent.change(roleSelect, { target: { value: 'doctor' } });

      // Assert - Doctor fields should be visible
      expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/qualifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();

      // Patient fields should not be visible
      expect(screen.queryByLabelText(/date of birth/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/gender/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Password Validation Tests (US-004)
   */
  describe('Password Validation - Real-time Feedback', () => {
    it('should display password requirements', () => {
      // Arrange & Act
      renderRegister();

      // Assert
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
      expect(screen.getByText(/one special character/i)).toBeInTheDocument();
    });

    it('should show password strength indicator as user types', async () => {
      // Arrange
      renderRegister();
      const passwordInput = screen.getByLabelText(/password/i);

      // Act - Type weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } });

      // Assert - Requirements should be shown
      await waitFor(() => {
        const requirements = screen.getAllByRole('listitem');
        expect(requirements.length).toBeGreaterThan(0);
      });
    });

    it('should mark requirement as met when password contains uppercase', () => {
      // Arrange
      renderRegister();
      const passwordInput = screen.getByLabelText(/password/i);

      // Act
      fireEvent.change(passwordInput, { target: { value: 'A' } });

      // Assert
      const uppercaseRequirement = screen.getByText(/one uppercase letter/i);
      expect(uppercaseRequirement).toHaveClass('text-green-600'); // or appropriate success class
    });

    it('should reject registration with password missing requirements', async () => {
      // Arrange
      renderRegister();

      // Act - Fill form with weak password
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'user@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'weak' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+123456' } 
      });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password does not meet requirements/i)).toBeInTheDocument();
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  /**
   * Error Handling Tests
   */
  describe('Registration - Error Handling', () => {
    it('should display error when email is missing', async () => {
      // Arrange
      renderRegister();

      // Act - Submit without email
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should display error when email format is invalid', async () => {
      // Arrange
      renderRegister();

      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'invalid-email' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should display error when full name is missing', async () => {
      // Arrange
      renderRegister();

      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'user@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
      });
    });

    it('should display error when patient date of birth is missing', async () => {
      // Arrange
      renderRegister();

      // Act - Fill patient form without date of birth
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'patient@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+123456' } 
      });
      
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      });
    });

    it('should display error when doctor specialty is missing', async () => {
      // Arrange
      renderRegister();

      // Act - Switch to doctor and submit without specialty
      const roleSelect = screen.getByLabelText(/register as/i);
      fireEvent.change(roleSelect, { target: { value: 'doctor' } });

      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'doctor@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'Dr. Smith' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+123456' } 
      });
      
      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/specialty is required/i)).toBeInTheDocument();
      });
    });

    it('should handle registration API errors', async () => {
      // Arrange
      mockRegister.mockRejectedValue(new Error('User already exists'));

      renderRegister();

      // Act - Fill valid form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'existing@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });
      fireEvent.change(screen.getByLabelText(/phone/i), { 
        target: { value: '+1234567890' } 
      });
      fireEvent.change(screen.getByLabelText(/date of birth/i), { 
        target: { value: '1990-01-01' } 
      });
      fireEvent.change(screen.getByLabelText(/gender/i), { 
        target: { value: 'male' } 
      });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button while registration is in progress', async () => {
      // Arrange
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderRegister();

      // Act - Fill and submit form
      fireEvent.change(screen.getByLabelText(/email/i), { 
        target: { value: 'user@test.com' } 
      });
      fireEvent.change(screen.getByLabelText(/password/i), { 
        target: { value: 'SecurePass123!' } 
      });
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: 'John Doe' } 
      });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      expect(registerButton).toBeDisabled();
      expect(screen.getByText(/registering/i)).toBeInTheDocument();
    });
  });

  /**
   * UI/UX Tests
   */
  describe('Registration - UI/UX Elements', () => {
    it('should toggle password visibility', () => {
      // Arrange
      renderRegister();
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

    it('should display link to login page', () => {
      // Arrange & Act
      renderRegister();

      // Assert
      const loginLink = screen.getByRole('link', { name: /already have an account/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should switch between patient and doctor forms', () => {
      // Arrange
      renderRegister();
      const roleSelect = screen.getByLabelText(/register as/i);

      // Assert initial state (patient)
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();

      // Act - Switch to doctor
      fireEvent.change(roleSelect, { target: { value: 'doctor' } });

      // Assert - Doctor fields visible
      expect(screen.getByLabelText(/specialty/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/date of birth/i)).not.toBeInTheDocument();

      // Act - Switch back to patient
      fireEvent.change(roleSelect, { target: { value: 'patient' } });

      // Assert - Patient fields visible again
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/specialty/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Edge Cases
   */
  describe('Registration - Edge Cases', () => {
    it('should handle very long names', async () => {
      // Arrange
      const longName = 'A'.repeat(255);
      mockRegister.mockResolvedValue({
        success: true,
        user: { id: 'user-123', role: 'patient' },
      });

      renderRegister();

      // Act
      fireEvent.change(screen.getByLabelText(/full name/i), { 
        target: { value: longName } 
      });

      // Assert
      expect(screen.getByLabelText(/full name/i)).toHaveValue(longName);
    });

    it('should validate future dates in date of birth', async () => {
      // Arrange
      renderRegister();
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      // Act
      fireEvent.change(screen.getByLabelText(/date of birth/i), { 
        target: { value: futureDate.toISOString().split('T')[0] } 
      });

      const registerButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(registerButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid date of birth/i)).toBeInTheDocument();
      });
    });
  });
});
