import { useState } from 'react';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Login({ navigate }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md p-8 border border-gray-200">
        <div className="text-center mb-8"><h1 className="text-3xl text-gray-900 mb-2">Welcome Back</h1><p className="text-gray-600">Login to your Se7ety Healthcare account</p></div>
        {error && (<Alert variant="destructive" className="mb-6"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>)}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" autoFocus /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /></div>
          <div className="flex items-center justify-end"><button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-[#667eea] hover:underline">Forgot password?</button></div>
          <Button type="submit" className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        </form>
        <div className="mt-6 text-center"><p className="text-gray-600 mb-4">Demo accounts:</p><div className="space-y-2 text-sm"><div className="p-2 bg-gray-50 rounded"><p className="text-gray-700">Patient: patient@demo.com</p></div><div className="p-2 bg-gray-50 rounded"><p className="text-gray-700">Doctor: doctor@demo.com</p></div><div className="p-2 bg-gray-50 rounded"><p className="text-gray-700">Admin: admin@demo.com</p></div><p className="text-gray-500 text-xs mt-2">Password: any password</p></div></div>
        <div className="mt-6 text-center text-gray-600">Don't have an account? <button onClick={() => navigate('/register')} className="text-[#667eea] hover:underline">Sign up</button></div>
      </Card>
    </div>
  );
}
