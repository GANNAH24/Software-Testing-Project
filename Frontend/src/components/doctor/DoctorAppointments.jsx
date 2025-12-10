import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, X, MessageCircle, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import appointmentService from '../../shared/services/appointment.service';
import { messagesService } from '../../shared/services/messages.service';

export function DoctorAppointments() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchAppointments = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await appointmentService.byDoctor(user.id);
      console.log('Doctor appointments response:', response);
      
      let data = response?.data || response?.appointments || response;
      
      // Ensure data is always an array
      if (!Array.isArray(data)) {
        console.warn('Appointments data is not an array:', data);
        data = [];
      }
      
      console.log('Setting appointments:', data);
      console.log('Sample appointment data:', data[0]); // Log first appointment to see structure
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
      setAppointments([]); // Ensure it's always an array even on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  // Auto-refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchAppointments();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const filterAppointments = (status) => {
    // Extra safety check
    if (!Array.isArray(appointments)) {
      console.error('Appointments is not an array:', appointments);
      return [];
    }
    
    if (status === 'all') return appointments;
    
    const now = new Date();
    
    if (status === 'upcoming') {
      return appointments.filter(a => {
        // Parse the date and time_slot to create a full datetime
        const appointmentDate = new Date(a.date);
        
        // Extract hour from time_slot (e.g., "09:00-10:00" -> 9)
        if (a.time_slot) {
          const [startTime] = a.time_slot.split('-');
          const [hours, minutes] = startTime.split(':');
          appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        return appointmentDate > now && (a.status === 'pending' || a.status === 'confirmed' || a.status === 'scheduled');
      });
    }
    if (status === 'past') {
      return appointments.filter(a => {
        // Parse the date and time_slot to create a full datetime
        const appointmentDate = new Date(a.date);
        
        // Extract hour from time_slot (e.g., "09:00-10:00" -> 9)
        if (a.time_slot) {
          const [startTime] = a.time_slot.split('-');
          const [hours, minutes] = startTime.split(':');
          appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        
        return appointmentDate <= now || a.status === 'completed' || a.status === 'canceled' || a.status === 'cancelled';
      });
    }
    return appointments;
  };

  const handleComplete = async () => {
    const appointmentId = selectedAppointment?.appointment_id || selectedAppointment?.id;
    if (!appointmentId) return;

    try {
      await appointmentService.complete(appointmentId);
      setAppointments(appointments.map(apt => (apt.appointment_id || apt.id) === appointmentId ? { ...apt, status: 'completed' } : apt));
      toast.success('Appointment marked as completed');
      setCompleteDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      toast.error('Failed to complete appointment');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return; }
    const appointmentId = selectedAppointment?.appointment_id || selectedAppointment?.id;
    if (!appointmentId) return;

    try {
      await appointmentService.cancel(appointmentId);
      setAppointments(appointments.map(apt => (apt.appointment_id || apt.id) === appointmentId ? { ...apt, status: 'canceled', cancelReason } : apt));
      toast.success('Appointment canceled successfully');
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleMessagePatient = async (patientUserId) => {
    if (!user?.id || !patientUserId) {
      console.error('Missing user ID or patient user ID', { userId: user?.id, patientUserId });
      toast.error('Cannot start conversation - missing IDs');
      return;
    }

    try {
      console.log('Creating conversation:', { patientId: patientUserId, doctorId: user.id });
      // Create or get existing conversation
      const response = await messagesService.createConversation(patientUserId, user.id);
      console.log('API Response:', response);
      
      const conversation = response?.data || response;
      console.log('Conversation:', conversation);
      
      if (!conversation || !conversation.id) {
        console.error('Invalid conversation response:', conversation);
        toast.error('Failed to create conversation - invalid response');
        return;
      }
      
      // Navigate to chat window
      navigate(`/doctor/messages/${conversation.id}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to open chat: ${error.response?.data?.message || error.message}`);
      // If conversation already exists, navigate to messages list
      navigate('/doctor/messages');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'canceled':
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = filterAppointments(selectedTab);

  if (loading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-gray-900 mb-6">My Bookings</h1>
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
                <h3 className="text-gray-900 mb-2">😊 No bookings yet!</h3>
                <p className="text-gray-600">{selectedTab === 'upcoming' ? "You don't have any upcoming bookings. Take a well-deserved break!" : 'No bookings to display at the moment.'}</p>
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
                      <tr key={apt.appointment_id || apt.id} className="border-b border-gray-200 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-gray-900">{apt.patient_name || 'Unknown Patient'}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {apt.patient_phone || apt.patient?.phone || 'N/A'}
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleMessagePatient(apt.patient_id)}
                              className="text-[#667eea] hover:text-[#667eea] hover:bg-[#667eea]/10"
                              title="Message Patient"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 text-gray-900">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-900">{apt.timeSlot || apt.time_slot}</td>
                        <td className="p-4"><span className={`inline-flex px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span></td>
                        <td className="p-4"><div className="flex gap-2">
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (<>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCompleteDialogOpen(true); }}><CheckCircle className="w-4 h-4 mr-1" />Complete</Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(apt); setCancelDialogOpen(true); }}><X className="w-4 h-4" /></Button>
                          </>)}
                          {apt.status === 'completed' && (<span className="text-sm text-green-600">Completed</span>)}
                        </div></td>
                      </tr>))}</tbody>
                  </table>
                </CardContent></Card></div>
                <div className="md:hidden space-y-4">{filteredAppointments.map(apt => (
                  <Card key={apt.appointment_id || apt.id}><CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-gray-900">{apt.patient_name || 'Unknown Patient'}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.patient_phone || apt.patient?.phone || 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleMessagePatient(apt.patient_id)}
                          className="text-[#667eea] hover:text-[#667eea] hover:bg-[#667eea]/10 p-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4"><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" />{new Date(apt.date).toLocaleDateString()}</div><div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4" />{apt.time_slot || apt.timeSlot}</div>{apt.notes && (<div className="text-sm text-gray-600"><strong>Notes:</strong> {apt.notes}</div>)}</div>
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
              <div className="flex justify-between"><span className="text-gray-600">Patient:</span><span className="text-gray-900">{selectedAppointment.patient_name || 'Unknown Patient'}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="text-gray-900">{new Date(selectedAppointment.date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="text-gray-900">{selectedAppointment.time_slot || selectedAppointment.timeSlot}</span></div>
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
