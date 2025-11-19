import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { passwordRequirements } from '../lib/mockData';
import { toast } from 'sonner';

export function ChangePassword({ navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
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
    if (!currentPassword || !newPassword || !confirmPassword) { setError('All fields are required'); return; }
    if (!validatePassword(newPassword)) { setError('New password does not meet requirements'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (currentPassword === newPassword) { setError('New password must be different from current password'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); toast.success('Password changed successfully!'); }, 1000);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl text-gray-900 mb-2">Change Password</h1><p className="text-gray-600">Update your account password</p></div>
      <Card className="p-6 md:p-8 border border-gray-200">
        {error && (<Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        {success && (<Alert className="mb-6 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Password changed successfully!</AlertDescription></Alert>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
          <div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="mt-2 text-sm text-gray-600 space-y-1"><p>Password must contain:</p><ul className="list-disc list-inside space-y-0.5 text-xs"><li>At least {passwordRequirements.minLength} characters</li>{passwordRequirements.requireUppercase && <li>One uppercase letter</li>}{passwordRequirements.requireLowercase && <li>One lowercase letter</li>}{passwordRequirements.requireNumber && <li>One number</li>}{passwordRequirements.requireSpecial && <li>One special character</li>}</ul></div>
          </div>
          <div><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
          <div className="flex gap-3 pt-4"><Button type="submit" className="flex-1 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Changing Password...' : 'Change Password'}</Button><Button type="button" variant="outline" onClick={() => navigate('/my-profile')}>Cancel</Button></div>
        </form>
      </Card>
    </div>
  );
}
