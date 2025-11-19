import { Calendar, Clock, CheckCircle, Search } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';



// Mock data
const MOCK_STATS = {
  upcomingAppointments: 4,
  pastAppointments: 8
};

export function PatientDashboard({ navigate, user }) {
  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome back, {user?.fullName?.split(' ')[0] || 'Patient'}!</h1>
          <p className="text-gray-600">Manage your appointments and healthcare</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Upcoming Appointments</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.upcomingAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Past Appointments</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.pastAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Appointments</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.upcomingAppointments + MOCK_STATS.pastAppointments}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('find-doctors')}
                className="bg-[#667eea] hover:bg-[#5568d3] h-auto py-6 justify-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div>Find Doctors</div>
                    <div className="text-sm opacity-90">Search by specialty or location</div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('patient-appointments')}
                variant="outline"
                className="h-auto py-6 justify-start"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-gray-900">My Appointments</div>
                    <div className="text-sm text-gray-600">View past and upcoming</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}