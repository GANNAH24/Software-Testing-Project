import { useState } from 'react';
import { Plus, Edit, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

// Converted from TSX: removed ManagePatientsProps interface and type annotations
export function ManagePatients({ navigate, user }) {
  const INITIAL_PATIENTS = [
    { id: '1', fullName: 'John Doe', email: 'john.doe@email.com', phone: '+1 (555) 111-2222', dateOfBirth: '1990-01-15', gender: 'male' },
    { id: '2', fullName: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 (555) 222-3333', dateOfBirth: '1985-06-20', gender: 'female' },
    { id: '3', fullName: 'Mike Johnson', email: 'mike.j@email.com', phone: '+1 (555) 333-4444', dateOfBirth: '1992-11-30', gender: 'male' }
  ];

  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '' });

  const resetForm = () => setFormData({ fullName: '', email: '', phone: '', dateOfBirth: '', gender: '' });

  const handleCreate = () => {
    const { fullName, email, phone, dateOfBirth, gender } = formData;
    if (!fullName || !email || !phone || !dateOfBirth || !gender) {
      toast.error('Please fill in all fields');
      return;
    }
    const newPatient = { id: String(patients.length + 1), ...formData };
    setPatients([...patients, newPatient]);
    toast.success('Patient created successfully');
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    const { fullName, email, phone, dateOfBirth, gender } = formData;
    if (!fullName || !email || !phone || !dateOfBirth || !gender) {
      toast.error('Please fill in all fields');
      return;
    }
    setPatients(patients.map(pat => pat.id === selectedPatient?.id ? { ...pat, ...formData } : pat));
    toast.success('Patient updated successfully');
    setUpdateDialogOpen(false);
    setSelectedPatient(null);
    resetForm();
  };

  const openUpdateDialog = (patient) => {
    setSelectedPatient(patient);
    setFormData({ fullName: patient.fullName, email: patient.email, phone: patient.phone, dateOfBirth: patient.dateOfBirth, gender: patient.gender });
    setUpdateDialogOpen(true);
  };

  const filteredPatients = patients.filter(pat => pat.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || pat.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-gray-900">Manage Patients</h1>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }} className="bg-[#667eea] hover:bg-[#5568d3]">
            <Plus className="w-4 h-4 mr-2" /> Add Patient
          </Button>
        </div>

        <div className="mb-6">
          <Input type="text" placeholder="Search patients by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-md" />
        </div>

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
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="border-b border-gray-200 last:border-0">
                  <td className="p-4 text-gray-900">{patient.fullName}</td>
                  <td className="p-4 text-gray-900">{patient.email}</td>
                  <td className="p-4 text-gray-900">{patient.phone}</td>
                  <td className="p-4 text-gray-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</td>
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
          {filteredPatients.map(patient => (
            <Card key={patient.id}><CardContent className="p-4">
              <div className="mb-3"><div className="text-gray-900">{patient.fullName}</div><div className="text-sm text-gray-600 capitalize">{patient.gender}</div></div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{patient.email}</div>
                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{patient.phone}</div>
                <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setSelectedPatient(patient); setViewDialogOpen(true); }} className="flex-1"><Eye className="w-4 h-4 mr-2" /> View</Button>
                <Button size="sm" variant="outline" onClick={() => openUpdateDialog(patient)} className="flex-1"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
              </div>
            </CardContent></Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card><CardContent className="p-12 text-center"><p className="text-gray-600">No patients found matching your search.</p></CardContent></Card>
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
                <div><Label>Date of Birth</Label><p className="text-gray-900 mt-1">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p></div>
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
