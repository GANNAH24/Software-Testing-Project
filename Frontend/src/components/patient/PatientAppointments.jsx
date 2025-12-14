import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Eye, X, Trash2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { useAuthContext } from '../../shared/contexts/AuthContext';
import appointmentService from '../../shared/services/appointment.service';
import { ReviewForm } from '../reviews/ReviewForm';

export function PatientAppointments() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [appointmentToReview, setAppointmentToReview] = useState(null);

  const fetchAppointments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await appointmentService.byPatient(user.id);
      console.log('Appointments response:', response);
      const data = response?.data || response?.appointments || response || [];
      console.log('Appointments data:', data);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
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
    if (status === 'all') return appointments;

    const now = new Date();

    if (status === 'upcoming') {
      return appointments.filter(a => {
        // Parse the date from the appointment (YYYY-MM-DD format)
        const [year, month, day] = a.date.split('-').map(Number);
        const appointmentDate = new Date(year, month - 1, day);

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
        // Parse the date from the appointment (YYYY-MM-DD format)
        const [year, month, day] = a.date.split('-').map(Number);
        const appointmentDate = new Date(year, month - 1, day);

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

  const handleCancel = async () => {
    const appointmentId = selectedAppointment?.appointment_id || selectedAppointment?.id;
    if (!appointmentId) return;

    try {
      await appointmentService.cancel(appointmentId);

      // Update local state
      setAppointments(appointments.map(apt =>
        (apt.appointment_id || apt.id) === appointmentId
          ? { ...apt, status: 'canceled' }
          : apt
      ));

      toast.success('✅ Appointment canceled successfully');
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleDelete = async () => {
    const appointmentId = selectedAppointment?.appointment_id || selectedAppointment?.id;
    if (!appointmentId) return;

    try {
      await appointmentService.remove(appointmentId);

      // Update local state
      setAppointments(appointments.filter(apt =>
        (apt.appointment_id || apt.id) !== appointmentId
      ));

      toast.success('Appointment deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case "booked":
      case "scheduled":
        return "bg-blue-100 text-blue-800";        
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = filterAppointments(selectedTab);

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  // Reset to page 1 when tab or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab, appointments.length]);

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
            {filteredAppointments.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <Select value={String(itemsPerPage)} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {filteredAppointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600">
                    {selectedTab === "upcoming"
                      ? "You don't have any upcoming appointments."
                      : "No appointments to display."}
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
                            <th className="text-left p-4 text-sm text-gray-600">
                              Doctor
                            </th>
                            <th className="text-left p-4 text-sm text-gray-600">
                              Date
                            </th>
                            <th className="text-left p-4 text-sm text-gray-600">
                              Time
                            </th>
                            <th className="text-left p-4 text-sm text-gray-600">
                              Status
                            </th>
                            <th className="text-left p-4 text-sm text-gray-600">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAppointments.map((apt) => (
                            <tr key={apt.appointment_id || apt.id} className="border-b border-gray-200 last:border-0">
                              <td className="p-4">
                                <div>
                                  <div className="text-gray-900">{apt.doctor_name || apt.doctor?.fullName || apt.doctor?.full_name || 'Dr. Unknown'}</div>
                                  <div className="text-sm text-gray-600">{apt.doctor_specialty || apt.doctor?.specialty || 'General'}</div>
                                </div>
                              </td>
                              <td className="p-4 text-gray-900">
                                {new Date(apt.date).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-gray-900">{apt.time_slot || apt.timeSlot}</td>
                              <td className="p-4">
                                <span
                                  className={`inline-flex px-2 py-1 rounded text-xs capitalize ${getStatusColor(
                                    apt.status
                                  )}`}
                                >
                                  {apt.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/doctor/${apt.doctor_id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {apt.status === 'completed' && (
                                    <Button
                                      size="sm"
                                      className="bg-[#667eea] hover:bg-[#5568d3] text-white"
                                      onClick={() => {
                                        setAppointmentToReview(apt);
                                        setReviewDialogOpen(true);
                                      }}
                                    >
                                      <Star className="w-4 h-4 mr-1" />
                                      Review
                                    </Button>
                                  )}
                                  {(apt.status === 'pending' || apt.status === 'confirmed') && (
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
                  {paginatedAppointments.map((apt) => (
                    <Card key={apt.appointment_id || apt.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-gray-900">{apt.doctor?.fullName || apt.doctor?.full_name || 'Dr. Unknown'}</div>
                            <div className="text-sm text-gray-600">{apt.doctor?.specialty || 'General'}</div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(
                              apt.status
                            )}`}
                          >
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
                            {apt.timeSlot || apt.time_slot}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                            className="flex-1"
                          >
                            View Details
                          </Button>
                          {apt.status === 'completed' && (
                            <Button
                              size="sm"
                              className="bg-[#667eea] hover:bg-[#5568d3] text-white flex-1"
                              onClick={() => {
                                setAppointmentToReview(apt);
                                setReviewDialogOpen(true);
                              }}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
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

            {/* Pagination Controls */}
            {filteredAppointments.length > itemsPerPage && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
                Are you sure you want to cancel this appointment with {selectedAppointment?.doctor?.fullName || selectedAppointment?.doctor?.full_name || 'the doctor'}?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
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
                Are you sure you want to delete this appointment? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
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
          onSuccess={fetchAppointments}
        />

        {/* Review Dialog */}
        {appointmentToReview && (
          <ReviewForm
            open={reviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            appointmentId={appointmentToReview.appointment_id || appointmentToReview.id}
            doctorId={appointmentToReview.doctor_id}
            onSuccess={() => {
              fetchAppointments();
              setAppointmentToReview(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
