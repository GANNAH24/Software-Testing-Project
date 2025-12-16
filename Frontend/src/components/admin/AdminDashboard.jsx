import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, Calendar, Activity } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import adminService from '../../shared/services/admin.service';


export function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    totalPatients: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        if (response.success) {
          setStats(response.data);
          setError(null);
        } else {
             setError('Failed to load stats');
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setError('Access denied. Please log out and log in as an Admin.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage healthcare providers and patients</p>
          </div>
          <Button 
            onClick={() => navigate('/admin/analytics')} 
            className="bg-[#667eea] hover:bg-[#5568d3] text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Doctors</p>
                  <p className="text-3xl text-gray-900">{loading ? '...' : stats.totalDoctors}</p>
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
                  <p className="text-sm text-gray-600 mb-2">Total Patients</p>
                  <p className="text-3xl text-gray-900">{loading ? '...' : stats.totalPatients}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Active Doctors</p>
                  <p className="text-3xl text-gray-900">{loading ? '...' : stats.activeDoctors}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>




        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
            <CardContent className="p-6">
                <h2 className="text-gray-900 mb-4">Doctor Profile Management</h2>
                <p className="text-gray-600 mb-6">
                Create, update, and manage doctor profiles to keep the provider list current and accurate.
                </p>
                <Button
                onClick={() => navigate('/admin/doctors')}
                className="bg-[#667eea] hover:bg-[#5568d3] text-white"
                size="lg"
                >
                <Stethoscope className="w-5 h-5 mr-2" />
                Manage Doctor Profiles
                </Button>
            </CardContent>
            </Card>

            <Card>
            <CardContent className="p-6">
                <h2 className="text-gray-900 mb-4">Platform Analytics</h2>
                <p className="text-gray-600 mb-6">
                View detailed insights about specialty distribution, top doctors, and appointment statistics.
                </p>
                <Button
                onClick={() => navigate('/admin/analytics')}
                className="bg-[#667eea] hover:bg-[#5568d3] text-white"
                size="lg"
                >
                <Activity className="w-5 h-5 mr-2" />
                View Analytics
                </Button>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
