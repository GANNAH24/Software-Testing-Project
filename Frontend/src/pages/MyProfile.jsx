import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { User, Mail, Phone, Calendar, MapPin, Award, Stethoscope, Edit, Briefcase, DollarSign, FileText, Camera, Upload } from 'lucide-react';
import { authService } from '../shared/services/auth.service';
import { toast } from 'sonner';
import { useAuthContext } from '../shared/contexts/AuthContext';

export function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      setProfileData(response.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return null;
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!profileData) return <div className="p-8 text-center">No profile data available</div>;

  const profile = profileData.profile;
  const roleData = profileData.roleData;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">View your account information</p>
        </div>
        <Button 
          onClick={() => navigate(`/${user.role}/edit-profile`)}
          className="bg-[#667eea] hover:bg-[#5568d3] gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>
      
      <Card className="p-6 md:p-8 border border-gray-200">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="relative group">
            {profilePicture ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center text-white text-3xl border-4 border-white shadow-lg">
                {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
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
            <h2 className="text-gray-900 mb-1">{profile.full_name}</h2>
            <p className="text-gray-600 capitalize mb-3">{profile.role}</p>
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

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <p className="text-gray-900">{user.email}</p>
            </div>

            {profile.phone_number && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Phone</span>
                </div>
                <p className="text-gray-900">{profile.phone_number}</p>
              </div>
            )}

            {profile.date_of_birth && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Date of Birth</span>
                </div>
                <p className="text-gray-900">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
              </div>
            )}

            {profile.gender && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Gender</span>
                </div>
                <p className="text-gray-900 capitalize">{profile.gender}</p>
              </div>
            )}

            {profile.address && (
              <div>
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Address</span>
                </div>
                <p className="text-gray-900">{profile.address}</p>
              </div>
            )}
          </div>

          {/* Right Column - Role-specific fields */}
          <div className="space-y-4">
            {profile.role === 'doctor' && roleData && (
              <>
                {roleData.specialty && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Stethoscope className="w-4 h-4" />
                      <span className="text-sm">Specialty</span>
                    </div>
                    <p className="text-gray-900">{roleData.specialty}</p>
                  </div>
                )}

                {roleData.years_of_experience !== null && roleData.years_of_experience !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Years of Experience</span>
                    </div>
                    <p className="text-gray-900">{roleData.years_of_experience} years</p>
                  </div>
                )}

                {roleData.consultation_fee !== null && roleData.consultation_fee !== undefined && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Consultation Fee</span>
                    </div>
                    <p className="text-gray-900">${roleData.consultation_fee}</p>
                  </div>
                )}

                {roleData.bio && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Bio</span>
                    </div>
                    <p className="text-gray-900">{roleData.bio}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
