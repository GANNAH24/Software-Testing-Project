import { Users, Stethoscope, Calendar, Activity } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

// Converted from TSX: removed AdminDashboardProps interface and type annotations
// Props: { navigate, user }
const MOCK_STATS = {
  totalDoctors: 24,
  activeDoctors: 18,
  pendingDoctors: 6
};

export function AdminDashboard({ navigate, user }) {
  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage healthcare providers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Doctors</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.totalDoctors}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Active Doctors</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.activeDoctors}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Pending Approval</p>
                  <p className="text-3xl text-gray-900">{MOCK_STATS.pendingDoctors}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-gray-900 mb-4">Doctor Profile Management</h2>
            <p className="text-gray-600 mb-6">
              Create, update, and manage doctor profiles to keep the provider list current and accurate.
            </p>
            <Button
              onClick={() => navigate('manage-doctors')}
              className="bg-[#667eea] hover:bg-[#5568d3]"
              size="lg"
            >
              <Stethoscope className="w-5 h-5 mr-2" />
              Manage Doctor Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
