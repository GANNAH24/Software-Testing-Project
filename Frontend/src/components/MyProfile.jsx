import { User, Mail, Phone, Calendar, MapPin, Award, Camera, Upload } from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '../shared/contexts/AuthContext';

export function MyProfile() {
  const navigate = useNavigate();
  const { user, loading } = useAuthContext();
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);
  
  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Unable to load profile information.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
        toast.success('Profile picture updated successfully! 📸');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-gray-900 mb-6">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200">
            <div className="relative group">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center text-white text-3xl border-4 border-white shadow-lg">
                  {(user.fullName || user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={handleUploadClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#667eea] hover:bg-[#5568d3] rounded-full flex items-center justify-center text-white shadow-lg transition-all group-hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-gray-900 mb-1">{user.fullName || user.full_name || 'User'}</h2>
              <p className="text-gray-600 capitalize mb-3">{user.role || 'user'}</p>
              <Button
                onClick={handleUploadClick}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF (max. 5MB)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="text-gray-900">{user.email}</div>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{user.phone}</div>
                </div>
              </div>
            )}

            {user.role === 'patient' && user.dateOfBirth && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Date of Birth</div>
                  <div className="text-gray-900">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {user.role === 'patient' && user.gender && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Gender</div>
                  <div className="text-gray-900 capitalize">{user.gender}</div>
                </div>
              </div>
            )}

            {user.role === 'doctor' && user.specialty && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Specialty</div>
                  <div className="text-gray-900">{user.specialty}</div>
                </div>
              </div>
            )}

            {user.role === 'doctor' && user.qualifications && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Qualifications</div>
                  <div className="text-gray-900">{user.qualifications}</div>
                </div>
              </div>
            )}

            {user.role === 'doctor' && user.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-gray-900">{user.location}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}