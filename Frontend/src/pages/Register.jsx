import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { User, Stethoscope, AlertCircle } from 'lucide-react';
import { passwordRequirements, specialties, locations } from '../lib/mockData';
import { toast } from 'sonner';

export function Register({ navigate }) {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [location, setLocation] = useState('');
  const [requirements, setRequirements] = useState(passwordRequirements);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => { setRequirements(passwordRequirements); }, []);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < requirements.minLength) errors.push(`At least ${requirements.minLength} characters`);
    if (requirements.requireUppercase && !/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (requirements.requireLowercase && !/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (requirements.requireNumber && !/\d/.test(pwd)) errors.push('One number');
    if (requirements.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('One special character');
    return errors.length === 0;
  };

  const validate = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required';
    if (!email.trim()) errors.email = 'Email is required'; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required'; else if (!validatePassword(password)) errors.password = 'Password does not meet requirements';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (role === 'patient') { if (!phone.trim()) errors.phone = 'Phone number is required'; if (!dateOfBirth) errors.dateOfBirth = 'Date of birth is required'; if (!gender) errors.gender = 'Gender is required'; }
    if (role === 'doctor') { if (!specialty) errors.specialty = 'Specialty is required'; if (!phone.trim()) errors.phone = 'Phone number is required'; if (!qualifications.trim()) errors.qualifications = 'Qualifications are required'; if (!location) errors.location = 'Location is required'; }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) { setError('Please fix the errors below'); return; }
    setLoading(true);
    try {
      const data = { role, email, password, fullName };
      if (role === 'patient') { data.phone = phone; data.dateOfBirth = dateOfBirth; data.gender = gender; } else { data.specialty = specialty; data.phone = phone; data.qualifications = qualifications; data.location = location; }
      await register(data);
      toast.success('Account created successfully!');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl p-8 border border-gray-200">
        <div className="text-center mb-8"><h1 className="text-3xl text-gray-900 mb-2">Create an Account</h1><p className="text-gray-600">Join Se7ety Healthcare today</p></div>
        {error && (<Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        <form onSubmit={handleSubmit}>
          <div className="mb-6"><Label className="mb-3 block">I am a:</Label><div className="grid grid-cols-2 gap-4"><button type="button" onClick={() => setRole('patient')} className={`p-4 rounded-lg border-2 transition-all ${role === 'patient' ? 'border-[#667eea] bg-[#667eea]/5' : 'border-gray-200 hover:border-gray-300'}`}><User className={`w-8 h-8 mx-auto mb-2 ${role === 'patient' ? 'text-[#667eea]' : 'text-gray-400'}`} /><p className={`${role === 'patient' ? 'text-[#667eea]' : 'text-gray-700'}`}>Patient</p></button><button type="button" onClick={() => setRole('doctor')} className={`p-4 rounded-lg border-2 transition-all ${role === 'doctor' ? 'border-[#667eea] bg-[#667eea]/5' : 'border-gray-200 hover:border-gray-300'}`}><Stethoscope className={`w-8 h-8 mx-auto mb-2 ${role === 'doctor' ? 'text-[#667eea]' : 'text-gray-400'}`} /><p className={`${role === 'doctor' ? 'text-[#667eea]' : 'text-gray-700'}`}>Doctor</p></button></div></div>
          <div className="space-y-4 mb-4">
            <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={validationErrors.fullName ? 'border-red-500' : ''} />{validationErrors.fullName && (<p className="text-red-600 text-sm mt-1">{validationErrors.fullName}</p>)}</div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={validationErrors.email ? 'border-red-500' : ''} />{validationErrors.email && (<p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>)}</div>
            <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={validationErrors.password ? 'border-red-500' : ''} />{validationErrors.password && (<p className="text-red-600 text-sm mt-1">{validationErrors.password}</p>)}<div className="mt-2 text-sm text-gray-600 space-y-1"><p>Password must contain:</p><ul className="list-disc list-inside space-y-0.5 text-xs"><li>At least {requirements.minLength} characters</li>{requirements.requireUppercase && <li>One uppercase letter</li>}{requirements.requireLowercase && <li>One lowercase letter</li>}{requirements.requireNumber && <li>One number</li>}{requirements.requireSpecial && <li>One special character</li>}</ul></div></div>
            <div><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={validationErrors.confirmPassword ? 'border-red-500' : ''} />{validationErrors.confirmPassword && (<p className="text-red-600 text-sm mt-1">{validationErrors.confirmPassword}</p>)}</div>
            <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" className={validationErrors.phone ? 'border-red-500' : ''} />{validationErrors.phone && (<p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>)}</div>
          </div>
          {role === 'patient' && (<div className="space-y-4 mb-6"><div><Label htmlFor="dateOfBirth">Date of Birth</Label><Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={validationErrors.dateOfBirth ? 'border-red-500' : ''} />{validationErrors.dateOfBirth && (<p className="text-red-600 text-sm mt-1">{validationErrors.dateOfBirth}</p>)}</div><div><Label htmlFor="gender">Gender</Label><select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] ${validationErrors.gender ? 'border-red-500' : 'border-gray-300'}`}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>{validationErrors.gender && (<p className="text-red-600 text-sm mt-1">{validationErrors.gender}</p>)}</div></div>)}
          {role === 'doctor' && (<div className="space-y-4 mb-6"><div><Label htmlFor="specialty">Specialty</Label><select id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] ${validationErrors.specialty ? 'border-red-500' : 'border-gray-300'}`}><option value="">Select specialty</option>{specialties.map(spec => (<option key={spec} value={spec}>{spec}</option>))}</select>{validationErrors.specialty && (<p className="text-red-600 text-sm mt-1">{validationErrors.specialty}</p>)}</div><div><Label htmlFor="qualifications">Qualifications</Label><Input id="qualifications" type="text" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g., MD, FACC" className={validationErrors.qualifications ? 'border-red-500' : ''} />{validationErrors.qualifications && (<p className="text-red-600 text-sm mt-1">{validationErrors.qualifications}</p>)}</div><div><Label htmlFor="location">Location</Label><select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] ${validationErrors.location ? 'border-red-500' : 'border-gray-300'}`}><option value="">Select location</option>{locations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}</select>{validationErrors.location && (<p className="text-red-600 text-sm mt-1">{validationErrors.location}</p>)}</div></div>)}
          <Button type="submit" className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
        </form>
        <div className="mt-6 text-center text-gray-600">Already have an account? <button onClick={() => navigate('/login')} className="text-[#667eea] hover:underline">Login</button></div>
      </Card>
    </div>
  );
}
