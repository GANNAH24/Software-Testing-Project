import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { useAuthContext } from '../shared/contexts/AuthContext';

export function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const REQUIREMENTS = { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < REQUIREMENTS.minLength) errors.push(`At least ${REQUIREMENTS.minLength} characters`);
    if (REQUIREMENTS.requireUppercase && !/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (REQUIREMENTS.requireLowercase && !/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (REQUIREMENTS.requireNumber && !/\d/.test(pwd)) errors.push('One number');
    if (REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push('One special character');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword) { setError('Please enter your current password'); return; }
    if (passwordErrors.length > 0) { setError('New password does not meet requirements'); return; }
    if (!passwordsMatch) { setError('New passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => { toast.success('Password changed successfully!'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setLoading(false); }, 1000);
  };

  if (!user) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Please login to change your password</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <h1 className="text-gray-900 mb-6">Change Password</h1>
      <Card><CardHeader><CardTitle>Update Your Password</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
          <div><Label htmlFor="currentPassword">Current Password</Label><div className="relative mt-2"><Input id="currentPassword" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pr-10" /><button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div>
          <div><Label htmlFor="newPassword">New Password</Label><div className="relative mt-2"><Input id="newPassword" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" /><button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{newPassword && (<div className="mt-2 space-y-1">{passwordErrors.length === 0 ? (<div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" />Password meets all requirements</div>) : passwordErrors.map((err,i)=>(<div key={i} className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />{err}</div>))}</div>)}</div>
          <div><Label htmlFor="confirmPassword">Confirm New Password</Label><div className="relative mt-2"><Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{confirmPassword && (<div className="mt-2">{passwordsMatch ? (<div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="w-4 h-4" />Passwords match</div>) : (<div className="flex items-center gap-2 text-sm text-red-600"><AlertCircle className="w-4 h-4" />Passwords do not match</div>)}</div>)}</div>
          <div className="flex gap-4"><Button type="submit" className="bg-[#667eea] hover:bg-[#5568d3]" disabled={loading || passwordErrors.length > 0 || !passwordsMatch || !currentPassword}>{loading ? 'Updating...' : 'Update Password'}</Button><Button type="button" variant="outline" onClick={() => { if (user.role === 'patient') navigate('patient-dashboard'); else if (user.role === 'doctor') navigate('doctor-dashboard'); else if (user.role === 'admin') navigate('admin-dashboard'); }}>Cancel</Button></div>
        </form>
      </CardContent></Card>
    </div>
  );
}
