import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  ArrowLeft,
  Filter,
  Download,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminService from '../../shared/services/admin.service';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

export function Analytics({ onBack }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [specialtyData, setSpecialtyData] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  
  // Use backend data where available, fallback to mock for missing pieces to maintain UI structure


  const [appointmentStats, setAppointmentStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Helper to format appointment stats for chart
  const formatAppointmentStats = (statsObj) => {
    if (!statsObj) return [];
    // Only show relevant statuses
    const relevantStatuses = ['completed', 'cancelled', 'scheduled', 'no-show', 'confirmed', 'booked', 'checked-in'];
    return Object.entries(statsObj)
      .filter(([status]) => relevantStatuses.includes(status.toLowerCase()))
      .map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
      }));
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch Overview which includes all we need
      const response = await adminService.getAnalyticsOverview();
      
      // NOTE: apiClient interceptor returns response.data directly!
      // So 'response' here IS the body: { success: true, data: { ... } }
      if (response?.success) {
        console.log('Analytics Data:', response.data);
        const { specialtyDistribution, topDoctors, appointmentStats } = response.data;
        setSpecialtyData(specialtyDistribution || []);
        setTopDoctors(topDoctors || []);
        setAppointmentStats(formatAppointmentStats(appointmentStats));
      } else {
        // Fallback to individual calls
         const [specialtyRes, topDoctorsRes] = await Promise.all([
             adminService.getSpecialtyAnalytics(),
             adminService.getTopDoctors(10)
         ]);
         
         // Similarly, these responses are the bodies
         setSpecialtyData(specialtyRes?.data || []);
         setTopDoctors(topDoctorsRes?.data || []);
      }

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
     return (
        <div className="p-4 sm:p-8 flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-12 h-12 animate-spin text-[#667eea]" />
        </div>
     );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Button onClick={() => navigate('/admin/dashboard')} variant="ghost" className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-purple-600">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Button>
            
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
                <p className="text-gray-600">Real-time insights on system performance and usage</p>
             </div>
             <div className="flex gap-2">
                <Select defaultValue="30days">
                    <SelectTrigger className="w-[150px] bg-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2 bg-white">
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>
          </div>
        </div>


        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Specialty Distribution */}
          <div>
            <Card className="p-6">
              <h3 className="mb-6">Doctor Specialties</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={specialtyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${(percentage)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {specialtyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Appointment Status */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="mb-6">Appointment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                {appointmentStats.length > 0 ? (
                  <BarChart data={appointmentStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#66BB6A" name="Appointments" />
                  </BarChart>
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <p>No appointment data available</p>
                   </div>
                )}
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Top Performing Doctors */}
        <div>
          <Card className="p-6">
            <h3 className="mb-6">Top Performing Doctors</h3>
            <div className="space-y-4">
              {topDoctors.map((doctor, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A90E2] to-[#66BB6A] flex items-center justify-center text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4>{doctor.name}</h4>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Appointments</p>
                        <p>{doctor.completedAppointments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#FFA726] fill-[#FFA726]" />
                          <span>{doctor.rating ? Number(doctor.rating).toFixed(1) : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-center">
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
