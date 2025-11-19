import { useState } from 'react';
import { Calendar, Clock, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';

// Converted from TSX: removed DoctorAppointmentsProps interface and type annotations
export function DoctorAppointments({ navigate, user }) {
  const INITIAL_APPOINTMENTS = [
    { id: '1', patientName: 'John Doe', patientPhone: '+1 (555) 111-2222', date: '2025-11-15', timeSlot: '10:00-11:00', status: 'booked', notes: 'Annual checkup' },
    { id: '2', patientName: 'Jane Smith', patientPhone: '+1 (555) 222-3333', date: '2025-11-16', timeSlot: '14:00-15:00', status: 'scheduled', notes: 'Follow-up consultation' },
    { id: '3', patientName: 'Mike Johnson', patientPhone: '+1 (555) 333-4444', date: '2025-10-20', timeSlot: '09:00-10:00', status: 'completed', notes: 'Routine examination' }
  ];

  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [selectedTab, setSelectedTab] = useState('all');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const filterAppointments = (status) => {
    if (status === 'all') return appointments;
    if (status === 'upcoming') return appointments.filter(a => a.status === 'booked' || a.status === 'scheduled');
    if (status === 'past') return appointments.filter(a => a.status === 'completed' || a.status === 'canceled');
    return appointments;
  };

  const handleComplete = () => {
    setAppointments(appointments.map(apt => apt.id === selectedAppointment?.id ? { ...apt, status: 'completed' } : apt));
    toast.success('Appointment marked as completed');
    setCompleteDialogOpen(false); setSelectedAppointment(null);
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return; }
    setAppointments(appointments.map(apt => apt.id === selectedAppointment?.id ? { ...apt, status: 'canceled', cancelReason } : apt));
    toast.success('Appointment canceled successfully');
    setCancelDialogOpen(false); setCancelReason(''); setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = filterAppointments(selectedTab);

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-gray-900 mb-6">My Appointments</h1>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedTab}>
            {filteredAppointments.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar className="w-8 h-8 text-gray-400" /></div>
                <h3 className="text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">{selectedTab === 'upcoming' ? "You don't have any upcoming appointments." : 'No appointments to display.'}</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                <div className="hidden md:block"><Card><CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200"><tr>
                      <th className="text-left p-4 text-sm text-gray-600">Patient</th>
                      <th className="text-left p-4 text-sm text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm text-gray-600">Time</th>
                      <th className="text-left p-4 text-sm text-gray-600">Status</th>
                      <th className="text-left p-4 text-sm text-gray-600">Actions</th></tr></thead>
                    <tbody>{filteredAppointments.map(apt => (
                      <tr key={apt.id} className="border-b border-gray-200 last:border-0">
                        <td className="p-4"><div><div className="text-gray-900">{apt.patientName}</div><div className="text-sm text-gray-600">{apt.patientPhone}</div></div></td>
                        <td className="p-4 text-gray-900">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-900">{apt.timeSlot}</td>
                        <td className="p-4"><span className={`inline-flex px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span></td>
                        <td className="p-4"><div className="flex gap-2">
                          {(apt.status === 'booked' || apt.status === 'scheduled') && (<>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCompleteDialogOpen(true); }}><CheckCircle className="w-4 h-4 mr-1" />Complete</Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCancelDialogOpen(true); }}><X className="w-4 h-4" /></Button>
                          </>)}
                          {apt.status === 'completed' && (<span className="text-sm text-green-600">Completed</span>)}
                        </div></td>
                      </tr>))}</tbody>
                  </table>
                </CardContent></Card></div>
                <div className="md:hidden space-y-4">{filteredAppointments.map(apt => (
                  <Card key={apt.id}><CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div><div className="text-gray-900">{apt.patientName}</div><div className="text-sm text-gray-600">{apt.patientPhone}</div></div>
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </div>
                    <div className="space-y-2 mb-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" />{new Date(apt.date).toLocaleDateString()}</div><div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4" />{apt.timeSlot}</div>{apt.notes && (<div className="text-sm text-gray-600"><strong>Notes:</strong> {apt.notes}</div>)}</div>
                    {(apt.status === 'booked' || apt.status === 'scheduled') && (<div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCompleteDialogOpen(true); }} className="flex-1"><CheckCircle className="w-4 h-4 mr-1" />Complete</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCancelDialogOpen(true); }}><X className="w-4 h-4" /></Button>
                    </div>)}
                  </CardContent></Card>
                ))}</div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent><DialogHeader><DialogTitle>Complete Appointment</DialogTitle><DialogDescription>Mark this appointment as completed?</DialogDescription></DialogHeader>
            {selectedAppointment && (<div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Patient:</span><span className="text-gray-900">{selectedAppointment.patientName}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="text-gray-900">{new Date(selectedAppointment.date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="text-gray-900">{selectedAppointment.timeSlot}</span></div>
            </div>)}
            <DialogFooter><Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>Cancel</Button><Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">Mark as Completed</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent><DialogHeader><DialogTitle>Cancel Appointment</DialogTitle><DialogDescription>Please provide a reason for canceling this appointment.</DialogDescription></DialogHeader>
            <div><Label htmlFor="cancelReason">Cancellation Reason</Label><Textarea id="cancelReason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Please explain why this appointment is being canceled..." rows={4} className="mt-2" /></div>
            <DialogFooter><Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button><Button onClick={handleCancel} variant="destructive">Cancel Appointment</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
