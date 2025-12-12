import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../shared/services/admin.service';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

export function Analytics() {
    const [loading, setLoading] = useState(true);
    const [specialtyData, setSpecialtyData] = useState([]);
    const [topDoctors, setTopDoctors] = useState([]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const specialtyResponse = await adminService.getSpecialtyAnalytics();
            setSpecialtyData(specialtyResponse?.data?.data || []);

            const topDoctorsResponse = await adminService.getTopDoctors(10);
            setTopDoctors(topDoctorsResponse?.data?.data || []);

        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin text-[#667eea]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-gray-900 text-2xl font-bold">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">System analytics and insights</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Doctors by Specialty</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {specialtyData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={specialtyData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {specialtyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-500 py-12">No specialty data available</div>
                            )}

                            <div className="mt-4 space-y-2">
                                {specialtyData.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-gray-700">{item.name}</span>
                                        </div>
                                        <span className="text-gray-900 font-semibold">{item.value} doctors ({item.percentage}%)</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Doctors by Completed Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topDoctors.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topDoctors}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completedAppointments" fill="#667eea" name="Completed Appointments" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-gray-500 py-12">No top doctors data available</div>
                            )}

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Leaderboard</h3>
                                <div className="space-y-2">
                                    {topDoctors.map((doctor, index) => (
                                        <div key={doctor.doctor_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#667eea] text-white text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                                    <div className="text-xs text-gray-600">{doctor.specialty}</div>
                                                </div>
                                            </div>
                                            <span className="text-sm font-semibold text-[#667eea]">{doctor.completedAppointments}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
