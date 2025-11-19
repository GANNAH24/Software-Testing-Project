import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { authService } from '../shared/auth.service';


const MOCK_PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

const SPECIALTIES = [
  'Cardiology',
  'Pediatrics',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Internal Medicine'
];

export function Register({ navigate, onRegister }) {
  const [role, setRole] = useState('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState(MOCK_PASSWORD_REQUIREMENTS);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Patient fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  // Doctor fields
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [location, setLocation] = useState('');

  // Validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Simulate fetching password requirements
    setPasswordRequirements(MOCK_PASSWORD_REQUIREMENTS);
  }, []);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < passwordRequirements.minLength) {
      errors.push(`At least ${passwordRequirements.minLength} characters`);
    }
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (passwordRequirements.requireLowercase && !/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (passwordRequirements.requireNumber && !/\d/.test(pwd)) {
      errors.push('One number');
    }
    if (passwordRequirements.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('One special character');
    }
    return errors;
  };

  const passwordErrors = validatePassword(password);

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else if (passwordErrors.length > 0) newErrors.password = 'Password does not meet requirements';

    if (!fullName) newErrors.fullName = 'Full name is required';
    if (!phone) newErrors.phone = 'Phone is required';

    if (role === 'patient') {
      if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!gender) newErrors.gender = 'Gender is required';
    }

    if (role === 'doctor') {
      if (!specialty) newErrors.specialty = 'Specialty is required';
      if (!qualifications) newErrors.qualifications = 'Qualifications are required';
      if (!location) newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email,
        password,
        fullName,
        role,
        phone, // Ensure backend expects 'phone' or 'phoneNumber'
        phoneNumber: phone, // Sending both just in case
        ...(role === 'patient' ? { dateOfBirth, gender } : {}),
        ...(role === 'doctor' ? { specialty, qualifications, location } : {}),
      };

      const response = await authService.register(userData);

      if (response.success) {
        toast.success('Registration successful!');
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        onRegister(response.data.user);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join Se7ety Healthcare today</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      role === 'patient'
                        ? 'border-[#667eea] bg-[#667eea]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👤</div>
                      <div className="text-gray-900">Patient</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      role === 'doctor'
                        ? 'border-[#667eea] bg-[#667eea]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍⚕️</div>
                      <div className="text-gray-900">Doctor</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Common Fields */}
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`mt-2 ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-2 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Password meets all requirements
                      </div>
                    ) : (
                      passwordErrors.map((error, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          {error}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Patient-specific Fields */}
              {role === 'patient' && (
                <>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className={`mt-2 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className={`mt-2 ${errors.gender ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                    )}
                  </div>
                </>
              )}

              {/* Doctor-specific Fields */}
              {role === 'doctor' && (
                <>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className={`mt-2 ${errors.specialty ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.specialty && (
                      <p className="text-sm text-red-600 mt-1">{errors.specialty}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      type="text"
                      placeholder="e.g., MD, FACC"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className={`mt-2 ${errors.qualifications ? 'border-red-500' : ''}`}
                    />
                    {errors.qualifications && (
                      <p className="text-sm text-red-600 mt-1">{errors.qualifications}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., New York, NY"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={`mt-2 ${errors.location ? 'border-red-500' : ''}`}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600 mt-1">{errors.location}</p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-[#667eea] hover:bg-[#5568d3]"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('login')}
                  className="text-[#667eea] hover:text-[#5568d3]"
                >
                  Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
