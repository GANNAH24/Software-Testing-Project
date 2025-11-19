import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { passwordRequirements } from '../lib/mockData';
import { toast } from 'sonner';

export function ResetPassword({ navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = (pwd) => {
    if (pwd.length < passwordRequirements.minLength) return false;
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(pwd)) return false;
    if (passwordRequirements.requireLowercase && !/[a-z]/.test(pwd)) return false;
    if (passwordRequirements.requireNumber && !/\d/.test(pwd)) return false;
    if (passwordRequirements.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!newPassword || !confirmPassword) { setError('All fields are required'); return; }
    if (!validatePassword(newPassword)) { setError('Password does not meet requirements'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); toast.success('Password reset successfully!'); setTimeout(() => navigate('/login'), 2000); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-8 border border-gray-200">
        <div className="text-center mb-8"><h1 className="text-3xl text-gray-900 mb-2">Reset Password</h1><p className="text-gray-600">Enter your new password</p></div>
        {error && (<Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        {success && (<Alert className="mb-6 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Password reset successfully! Redirecting to login...</AlertDescription></Alert>)}
        {!success && (<form onSubmit={handleSubmit} className="space-y-4"><div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus /><div className="mt-2 text-sm text-gray-600 space-y-1"><p>Password must contain:</p><ul className="list-disc list-inside space-y-0.5 text-xs"><li>At least {passwordRequirements.minLength} characters</li>{passwordRequirements.requireUppercase && <li>One uppercase letter</li>}{passwordRequirements.requireLowercase && <li>One lowercase letter</li>}{passwordRequirements.requireNumber && <li>One number</li>}{passwordRequirements.requireSpecial && <li>One special character</li>}</ul></div></div><div><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div><Button type="submit" className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Resetting Password...' : 'Reset Password'}</Button></form>)}
      </Card>
    </div>
  );
}
