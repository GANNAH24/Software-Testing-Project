import { useState } from 'react';
import { Calendar, Clock, User, Eye, X, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CalendarBookDialog } from './CalendarBookDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';



const MOCK_APPOINTMENTS = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: '2025-11-15',
    timeSlot: '10:00-11:00',
    status: 'booked',
    notes: 'Annual checkup'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    date: '2025-11-20',
    timeSlot: '14:00-15:00',
    status: 'scheduled',
    notes: ''
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    date: '2025-10-05',
    timeSlot: '09:00-10:00',
    status: 'completed',
    notes: 'Skin consultation',
    cancelReason: null
  },
  {
    id: '4',
    doctorName: 'Dr. James Williams',
    specialty: 'Orthopedics',
    date: '2025-09-20',
    timeSlot: '15:00-16:00',
    status: 'canceled',
    notes: 'Knee pain',
    cancelReason: 'Patient requested reschedule'
  }
];

export function PatientAppointments({ navigate, user }) {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [selectedTab, setSelectedTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const filterAppointments = (status) => {
    if (status === 'all') return appointments;
    if (status === 'upcoming') {
      return appointments.filter(a => a.status === 'booked' || a.status === 'scheduled');
    }
    if (status === 'past') {
      return appointments.filter(a => a.status === 'completed' || a.status === 'canceled');
    }
    return appointments;
  };

  const handleCancel = () => {
    setAppointments(appointments.map(apt =>
      apt.id === selectedAppointment?.id
        ? { ...apt, status: 'canceled', cancelReason: 'Canceled by patient' }
        : apt
    ));

    toast.success('✅ Appointment canceled successfully');
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleDelete = () => {
    setAppointments(appointments.filter(apt => apt.id !== selectedAppointment?.id));
    toast.success('Appointment deleted successfully');
    setDeleteDialogOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = filterAppointments(selectedTab);

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-gray-900">My Appointments</h1>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600">
                    {selectedTab === 'upcoming' ? 'You don\'t have any upcoming appointments.' : 'No appointments to display.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left p-4 text-sm text-gray-600">Doctor</th>
                            <th className="text-left p-4 text-sm text-gray-600">Date</th>
                            <th className="text-left p-4 text-sm text-gray-600">Time</th>
                            <th className="text-left p-4 text-sm text-gray-600">Status</th>
                            <th className="text-left p-4 text-sm text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppointments.map((apt) => (
                            <tr key={apt.id} className="border-b border-gray-200 last:border-0">
                              <td className="p-4">
                                <div>
                                  <div className="text-gray-900">{apt.doctorName}</div>
                                  <div className="text-sm text-gray-600">{apt.specialty}</div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-900">
                                {new Date(apt.date).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-gray-900">{apt.timeSlot}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>
                                  {apt.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate('appointment-details', { appointmentId: apt.id })}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {(apt.status === 'booked' || apt.status === 'scheduled') && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedAppointment(apt);
                                        setCancelDialogOpen(true);
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAppointment(apt);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredAppointments.map((apt) => (
                    <Card key={apt.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-gray-900">{apt.doctorName}</div>
                            <div className="text-sm text-gray-600">{apt.specialty}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(apt.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {apt.timeSlot}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('appointment-details', { appointmentId: apt.id })}
                            className="flex-1"
                          >
                            View Details
                          </Button>
                          {(apt.status === 'booked' || apt.status === 'scheduled') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(apt);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment with {selectedAppointment?.doctorName}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                No, Keep It
              </Button>
              <Button onClick={handleCancel} variant="destructive">
                Yes, Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Book Appointment Dialog */}
        <CalendarBookDialog 
          open={bookDialogOpen} 
          onOpenChange={setBookDialogOpen} 
        />
      </div>
    </div>
  );
}