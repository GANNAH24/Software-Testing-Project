import { useAuth } from '../App';
import { Card } from '../components/ui/card';
import { User, Mail, Phone, Calendar, MapPin, Award, Stethoscope } from 'lucide-react';

export function MyProfile({ navigate }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8"><h1 className="text-3xl text-gray-900 mb-2">My Profile</h1><p className="text-gray-600">View your account information</p></div>
      <Card className="p-6 md:p-8 border border-gray-200">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center"><User className="w-10 h-10 text-white" /></div><div><h2 className="text-2xl text-gray-900 mb-1">{user.fullName}</h2><p className="text-gray-600 capitalize">{user.role}</p></div></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><div className="flex items-center gap-2 text-gray-500 mb-2"><Mail className="w-4 h-4" /><span className="text-sm">Email</span></div><p className="text-gray-900">{user.email}</p></div>
            {user.phone && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><Phone className="w-4 h-4" /><span className="text-sm">Phone</span></div><p className="text-gray-900">{user.phone}</p></div>)}
            {user.dateOfBirth && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><Calendar className="w-4 h-4" /><span className="text-sm">Date of Birth</span></div><p className="text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString()}</p></div>)}
            {user.gender && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><User className="w-4 h-4" /><span className="text-sm">Gender</span></div><p className="text-gray-900">{user.gender}</p></div>)}
          </div>
          <div className="space-y-4">
            {user.specialty && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><Stethoscope className="w-4 h-4" /><span className="text-sm">Specialty</span></div><p className="text-gray-900">{user.specialty}</p></div>)}
            {user.qualifications && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><Award className="w-4 h-4" /><span className="text-sm">Qualifications</span></div><p className="text-gray-900">{user.qualifications}</p></div>)}
            {user.location && (<div><div className="flex items-center gap-2 text-gray-500 mb-2"><MapPin className="w-4 h-4" /><span className="text-sm">Location</span></div><p className="text-gray-900">{user.location}</p></div>)}
          </div>
        </div>
      </Card>
    </div>
  );
}
