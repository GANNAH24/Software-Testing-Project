import { Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';



const MOCK_APPOINTMENTS = {
  '1': {
    id: '1',
    doctorId: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    doctorPhone: '+1 (555) 123-4567',
    doctorLocation: 'New York, NY',
    patientName: 'John Doe',
    date: '2025-11-15',
    timeSlot: '10:00-11:00',
    status: 'booked',
    notes: 'Annual checkup for heart health monitoring',
    cancelReason: null
  },
  '2': {
    id: '2',
    doctorId: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Pediatrics',
    doctorPhone: '+1 (555) 234-5678',
    doctorLocation: 'Los Angeles, CA',
    patientName: 'John Doe',
    date: '2025-11-20',
    timeSlot: '14:00-15:00',
    status: 'scheduled',
    notes: '',
    cancelReason: null
  }
};

export function AppointmentDetails({ appointmentId, navigate, user }) {
  const appointment = appointmentId ? MOCK_APPOINTMENTS[appointmentId] : null;

  if (!appointment) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-gray-900 mb-2">Appointment Not Found</h3>
            <p className="text-gray-600 mb-6">
              The appointment you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('patient-appointments')}>
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked':
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('patient-appointments')}
          className="mb-6"
        >
          ← Back to Appointments
        </Button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-gray-900 mb-2">Appointment Details</h1>
            <p className="text-gray-600">ID{appointment.id}</p>
          </div>
          <Badge variant={getStatusColor(appointment.status)} className="capitalize">
            {appointment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Doctor</div>
                  <div className="text-gray-900">{appointment.doctorName}</div>
                  <div className="text-sm text-[#667eea]">{appointment.specialty}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{appointment.doctorPhone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="text-gray-900">{appointment.doctorLocation}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="text-gray-900">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="text-gray-900">{appointment.timeSlot}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-gray-400 mt-0.5">
                  <div className={`w-3 h-3 rounded-full ${
                    appointment.status === 'booked' || appointment.status === 'scheduled' ? 'bg-blue-500' :
                    appointment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="text-gray-900 capitalize">{appointment.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {appointment.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Appointment Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{appointment.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Reason */}
          {appointment.cancelReason && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Cancellation Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{appointment.cancelReason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        {(appointment.status === 'booked' || appointment.status === 'scheduled') && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('patient-appointments')}
                >
                  Modify Appointment
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => navigate('patient-appointments')}
                >
                  Cancel Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
