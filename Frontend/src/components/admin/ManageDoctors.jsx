import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import adminService from '../../shared/services/admin.service';

import { get, post, put, del } from '../../shared/services/api.service';

import { API_ENDPOINTS } from '../../config/api.config';


// Converted from TSX: removed interfaces and type annotations
export function ManageDoctors({ navigate, user }) {
  const SPECIALTIES = [
    'Cardiology',
    'Pediatrics',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Internal Medicine'
  ];

  // State Management
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    qualifications: '',
    location: '',
    phone: ''
  });

  // formData includes email & password for creation
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    qualifications: '',
    location: '',
    phone: '',
    email: '',
    password: ''
  });

  // Load Doctors (API Fetch)
  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Passing searchQuery to backend for server-side filtering
      const response = await adminService.getAllDoctors({ search: searchQuery });
      // Assuming response.data is the array of doctors
      setDoctors(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & Search Listener
  useEffect(() => {
    // specific debounce to prevent API spam while typing
    const timer = setTimeout(() => {
      loadDoctors();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleCreate = async () => {
    const { name, specialty, qualifications, location, phone } = formData;
    if (!name || !specialty || !qualifications || !location || !phone) {
      toast.error('❌ Please fill in all fields');
      return;
    }

    try {
      const response = await adminService.createDoctor(formData);
      const doctor = response?.data || response;

      // Show credentials in a success message
      if (doctor.generatedEmail && doctor.generatedPassword) {
        toast.success(
          <div className="space-y-2">
            <p className="font-bold">✅ Doctor created successfully!</p>
            <div className="text-sm">
              <p><strong>Email:</strong> {doctor.generatedEmail}</p>
              <p><strong>Password:</strong> {doctor.generatedPassword}</p>
              <p className="text-xs text-gray-600 mt-1">Please save these credentials and share them with the doctor.</p>
            </div>
          </div>,
          { duration: 10000 } // Show for 10 seconds
        );

        // Also log to console for easy copying
        console.log('=== New Doctor Credentials ===');
        console.log('Email:', doctor.generatedEmail);
        console.log('Password:', doctor.generatedPassword);
        console.log('==============================');
      } else {
        toast.success('✅ Doctor created successfully!');
      }

      loadDoctors(); // Refresh list
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleUpdate = async () => {
    const { name, specialty, qualifications, location, phone } = formData;
    if (!name || !specialty || !qualifications || !location || !phone) {
      toast.error('❌ Please fill in all fields');
      return;
    }

    try {
      // Using doctor_id based on your snippet requirements
      await adminService.updateDoctor(selectedDoctor.doctor_id, formData);
      toast.success('✅ Doctor updated successfully!');
      loadDoctors(); // Refresh list
      setUpdateDialogOpen(false);
      setSelectedDoctor(null);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDelete = async () => {
    try {
      // Using doctor_id based on your snippet requirements
      await adminService.deleteDoctor(selectedDoctor.doctor_id);
      toast.success('🗑️ Doctor deleted successfully');
      loadDoctors(); // Refresh list
      setDeleteDialogOpen(false);
      setSelectedDoctor(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const openUpdateDialog = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      specialty: doctor.specialty,
      qualifications: doctor.qualifications,
      location: doctor.location,
      phone: doctor.phone
    });
    setUpdateDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-gray-900 flex items-center gap-2">👨‍⚕️ Manage Doctors</h1>
            <p className="text-gray-600 mt-1">Create, update, and manage doctor profiles</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} className="bg-[#667eea] hover:bg-[#5568d3] shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Add Doctor
            </Button>
          </motion.div>
        </motion.div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search doctors by name, specialty, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#667eea]" />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Card><CardContent className="p-0"><table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm text-gray-600">Name</th>
                    <th className="text-left p-4 text-sm text-gray-600">Specialty</th>
                    <th className="text-left p-4 text-sm text-gray-600">Location</th>
                    <th className="text-left p-4 text-sm text-gray-600">Phone</th>
                    <th className="text-left p-4 text-sm text-gray-600">Reviews</th>
                    <th className="text-left p-4 text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map(doctor => (
                    <tr key={doctor.doctor_id || doctor.id} className="border-b border-gray-200 last:border-0">
                      <td className="p-4">
                        <div>
                          <div className="text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-600">{doctor.qualifications}</div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-900">{doctor.specialty}</td>
                      <td className="p-4 text-gray-900">{doctor.location}</td>
                      <td className="p-4 text-gray-900">{doctor.phone}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-gray-900">{doctor.reviewsCount || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openUpdateDialog(doctor)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setSelectedDoctor(doctor); setDeleteDialogOpen(true); }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></CardContent></Card>
            </div>

            <div className="md:hidden space-y-4">
              {doctors.map(doctor => (
                <Card key={doctor.doctor_id || doctor.id}><CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-gray-900">{doctor.name}</div>
                      <div className="text-sm text-[#667eea]">{doctor.specialty}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-gray-900">{doctor.reviewsCount || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4" />{doctor.location}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{doctor.phone}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openUpdateDialog(doctor)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelectedDoctor(doctor); setDeleteDialogOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent></Card>
              ))}
            </div>

            {doctors.length === 0 && (
              <Card><CardContent className="p-12 text-center"><p className="text-gray-600">No doctors found matching your search.</p></CardContent></Card>
            )}
          </>
        )}

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Doctor</DialogTitle><DialogDescription>Create a new doctor profile</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. John Doe" className="mt-2" /></div>
              <div><Label htmlFor="specialty">Specialty</Label><Select value={formData.specialty} onValueChange={(val) => setFormData({ ...formData, specialty: val })}><SelectTrigger className="mt-2"><SelectValue placeholder="Select specialty" /></SelectTrigger><SelectContent>{SPECIALTIES.map(spec => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="qualifications">Qualifications</Label><Input id="qualifications" value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} placeholder="MD, FACC" className="mt-2" /></div>
              <div><Label htmlFor="location">Location</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="New York, NY" className="mt-2" /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 123-4567" className="mt-2" /></div>

              {/* NEW: email & password fields */}
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="doctor@example.com" className="mt-2" /></div>
              <div><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Choose a strong password" className="mt-2" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreate} className="bg-[#667eea] hover:bg-[#5568d3]">Create Doctor</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Update Doctor</DialogTitle><DialogDescription>Edit doctor information</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="updateName">Full Name</Label><Input id="updateName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updateSpecialty">Specialty</Label><Select value={formData.specialty} onValueChange={(val) => setFormData({ ...formData, specialty: val })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{SPECIALTIES.map(spec => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="updateQualifications">Qualifications</Label><Input id="updateQualifications" value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updateLocation">Location</Label><Input id="updateLocation" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updatePhone">Phone</Label><Input id="updatePhone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-2" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdate} className="bg-[#667eea] hover:bg-[#5568d3]">Update Doctor</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Doctor</DialogTitle><DialogDescription>Are you sure you want to delete {selectedDoctor?.name}? This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button onClick={handleDelete} variant="destructive">Delete</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}