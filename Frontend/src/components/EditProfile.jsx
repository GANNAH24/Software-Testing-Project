import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, Award, Stethoscope, DollarSign, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useAuthContext } from '../shared/contexts/AuthContext';
import { authService } from '../shared/services/auth.service';

export function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    // Doctor-specific fields (actual fields in doctors table)
    specialty: '',
    qualifications: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.fullName || user.profile?.full_name || '',
        phone_number: user.profile?.phone_number || '',
        date_of_birth: user.profile?.date_of_birth || '',
        gender: user.profile?.gender || '',
        address: user.profile?.address || '',
        specialty: user.profile?.specialty || user.roleData?.specialty || '',
        qualifications: user.roleData?.qualifications || '',
        location: user.roleData?.location || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty values
      const updates = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== '') {
          updates[key] = formData[key];
        }
      });

      const response = await authService.updateProfile(updates);
      
      // Update user context with the latest data
      if (response?.data) {
        const updatedUserData = {
          ...user,
          fullName: response.data.profile?.full_name || user.fullName,
          profile: {
            ...user.profile,
            ...response.data.profile
          },
          roleData: {
            ...user.roleData,
            ...response.data.roleData
          }
        };
        
        updateUser(updatedUserData);
        
        toast.success('Profile updated successfully!');
        // Navigate back to profile page
        navigate(`/${user.role}/profile`);
      } else {
        toast.error('Unexpected response format');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      console.error('Error response:', err.response);
      toast.error(err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 mb-4">Please login to edit your profile</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  value={user.email}
                  className="pl-10 bg-gray-50"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 min-h-[80px]"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Doctor-specific fields */}
            {user.role === 'doctor' && (
              <>
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                </div>

                {/* Specialty */}
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <div className="relative mt-2">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., Cardiology, Pediatrics"
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="mt-2 min-h-[100px]"
                    placeholder="Enter your qualifications, degrees, certifications"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location / Clinic Address</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Textarea
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10 min-h-[80px]"
                      placeholder="Enter your clinic or practice location"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-[#667eea] hover:bg-[#5568d3]"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${user.role}/dashboard`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
