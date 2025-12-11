import { useState, useEffect } from 'react';
import { motion } from 'motion/react'; // Assuming you want the same animation as doctors
import { Plus, Edit, Eye, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import adminService from '../../shared/services/admin.service';

export function ManagePatients({ navigate, user }) {
  // State Management
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    phone: '', 
    dateOfBirth: '', 
    gender: '' 
  });

  const resetForm = () => setFormData({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '' });

  // Load Patients (API Fetch)
  const loadPatients = async () => {
    try {
      setLoading(true);
      // Passing searchQuery to backend for server-side filtering
      const response = await adminService.getAllPatients({ search: searchQuery });
      setPatients(response.data || []); 
    } catch (error) {
      console.error(error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & Search Listener
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleCreate = async () => {
    const { fullName, email, phone, dateOfBirth, gender } = formData;
    if (!fullName || !email || !phone || !dateOfBirth || !gender) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await adminService.createPatient(formData);
      toast.success('Patient created successfully');
      loadPatients();
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create patient');
    }
  };

  const handleUpdate = async () => {
    const { fullName, email, phone, dateOfBirth, gender } = formData;
    if (!fullName || !email || !phone || !dateOfBirth || !gender) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Assuming 'patient_id' based on the doctor pattern
      await adminService.updatePatient(selectedPatient.patient_id || selectedPatient.id, formData);
      toast.success('Patient updated successfully');
      loadPatients();
      setUpdateDialogOpen(false);
      setSelectedPatient(null);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    }
  };

  const openUpdateDialog = (patient) => {
    setSelectedPatient(patient);
    setFormData({ 
      fullName: patient.fullName, 
      email: patient.email, 
      phone: patient.phone, 
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '', 
      gender: patient.gender 
    });
    setUpdateDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-gray-900 text-2xl font-semibold">Manage Patients</h1>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} className="bg-[#667eea] hover:bg-[#5568d3]">
            <Plus className="w-4 h-4 mr-2" /> Add Patient
          </Button>
        </div>

        <div className="mb-6">
          <Input 
            type="text" 
            placeholder="Search patients by name or email..." 
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
                    <th className="text-left p-4 text-sm text-gray-600">Email</th>
                    <th className="text-left p-4 text-sm text-gray-600">Phone</th>
                    <th className="text-left p-4 text-sm text-gray-600">Date of Birth</th>
                    <th className="text-left p-4 text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient.patient_id || patient.id} className="border-b border-gray-200 last:border-0">
                      <td className="p-4 text-gray-900">{patient.fullName}</td>
                      <td className="p-4 text-gray-900">{patient.email}</td>
                      <td className="p-4 text-gray-900">{patient.phone}</td>
                      <td className="p-4 text-gray-900">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4"><div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(patient); setViewDialogOpen(true); }}><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => openUpdateDialog(patient)}><Edit className="w-4 h-4" /></Button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table></CardContent></Card>
            </div>

            <div className="md:hidden space-y-4">
              {patients.map(patient => (
                <Card key={patient.patient_id || patient.id}><CardContent className="p-4">
                  <div className="mb-3"><div className="text-gray-900">{patient.fullName}</div><div className="text-sm text-gray-600 capitalize">{patient.gender}</div></div>
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{patient.email}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{patient.phone}</div>
                    <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(patient); setViewDialogOpen(true); }} className="flex-1"><Eye className="w-4 h-4 mr-2" /> View</Button>
                    <Button size="sm" variant="outline" onClick={() => openUpdateDialog(patient)} className="flex-1"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                  </div>
                </CardContent></Card>
              ))}
            </div>

            {patients.length === 0 && (
              <Card><CardContent className="p-12 text-center"><p className="text-gray-600">No patients found matching your search.</p></CardContent></Card>
            )}
          </>
        )}

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Patient</DialogTitle><DialogDescription>Create a new patient profile</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="John Doe" className="mt-2" /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@email.com" className="mt-2" /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 123-4567" className="mt-2" /></div>
              <div><Label htmlFor="dateOfBirth">Date of Birth</Label><Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="gender">Gender</Label><Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}><SelectTrigger className="mt-2"><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreate} className="bg-[#667eea] hover:bg-[#5568d3]">Create Patient</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Update Patient</DialogTitle><DialogDescription>Edit patient information</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div><Label htmlFor="updateFullName">Full Name</Label><Input id="updateFullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updateEmail">Email</Label><Input id="updateEmail" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updatePhone">Phone</Label><Input id="updatePhone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updateDateOfBirth">Date of Birth</Label><Input id="updateDateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="mt-2" /></div>
              <div><Label htmlFor="updateGender">Gender</Label><Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>Cancel</Button><Button onClick={handleUpdate} className="bg-[#667eea] hover:bg-[#5568d3]">Update Patient</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Patient Details</DialogTitle></DialogHeader>
            {selectedPatient && (
              <div className="space-y-4">
                <div><Label>Full Name</Label><p className="text-gray-900 mt-1">{selectedPatient.fullName}</p></div>
                <div><Label>Email</Label><p className="text-gray-900 mt-1">{selectedPatient.email}</p></div>
                <div><Label>Phone</Label><p className="text-gray-900 mt-1">{selectedPatient.phone}</p></div>
                <div><Label>Date of Birth</Label><p className="text-gray-900 mt-1">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</p></div>
                <div><Label>Gender</Label><p className="text-gray-900 mt-1 capitalize">{selectedPatient.gender}</p></div>
              </div>
            )}
            <DialogFooter><Button onClick={() => setViewDialogOpen(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}