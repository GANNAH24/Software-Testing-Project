import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPassword({ navigate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); toast.success('Password reset email sent!'); }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-8 border border-gray-200">
        <Button variant="ghost" onClick={() => navigate('/login')} className="mb-6 -ml-2"><ArrowLeft className="w-4 h-4 mr-2" />Back to Login</Button>
        <div className="text-center mb-8"><h1 className="text-3xl text-gray-900 mb-2">Forgot Password?</h1><p className="text-gray-600">Enter your email and we'll send you a reset link</p></div>
        {error && (<Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        {success && (<Alert className="mb-6 border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">Password reset instructions have been sent to your email.</AlertDescription></Alert>)}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" autoFocus /></div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Button>
          </form>
        )}
        {success && (<div className="space-y-4"><p className="text-sm text-gray-600 text-center">Didn't receive the email? Check your spam folder or</p><Button onClick={() => setSuccess(false)} variant="outline" className="w-full">Try Again</Button></div>)}
      </Card>
    </div>
  );
}
