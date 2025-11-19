import { useState } from 'react';
import { Home } from './components/Home';
import { AdvancedSearch } from './components/AdvancedSearch';
import { DoctorProfile } from './components/DoctorProfile';
import { Register } from './components/Register';
import { Login } from './components/Login';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AboutUs } from './components/AboutUs';
import { Contact } from './components/Contact';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { BookAppointment } from './components/patient/BookAppointment';
import { PatientAppointments } from './components/patient/PatientAppointments';
import { AppointmentDetails } from './components/patient/AppointmentDetails';
import { FindDoctors } from './components/patient/FindDoctors';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { ManageSchedule } from './components/doctor/ManageSchedule';
import { DoctorAppointments } from './components/doctor/DoctorAppointments';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManageDoctors } from './components/admin/ManageDoctors';
import { ManagePatients } from './components/admin/ManagePatients';
import { SystemHealth } from './components/admin/SystemHealth';
import { MyProfile } from './components/MyProfile';
import { ChangePassword } from './components/ChangePassword';
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const navigate = (route, params) => {
    if (params?.doctorId) setSelectedDoctorId(params.doctorId);
    if (params?.appointmentId) setSelectedAppointmentId(params.appointmentId);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Navigate to role-specific dashboard
    if (userData.role === 'patient') {
      navigate('patient-dashboard');
    } else if (userData.role === 'doctor') {
      navigate('doctor-dashboard');
    } else if (userData.role === 'admin') {
      navigate('admin-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('home');
  };

  const renderContent = () => {
    switch (currentRoute) {
      case 'home':
        return <Home navigate={navigate} />;
      case 'advanced-search':
        return <AdvancedSearch navigate={navigate} />;
      case 'doctor-profile':
        return <DoctorProfile doctorId={selectedDoctorId} navigate={navigate} user={user} />;
      case 'about-us':
        return <AboutUs navigate={navigate} />;
      case 'contact':
        return <Contact navigate={navigate} />;
      case 'register':
        return <Register navigate={navigate} onRegister={handleLogin} />;
      case 'login':
        return <Login navigate={navigate} onLogin={handleLogin} />;
      case 'forgot-password':
        return <ForgotPassword navigate={navigate} />;
      case 'reset-password':
        return <ResetPassword navigate={navigate} />;
      case 'patient-dashboard':
        return <PatientDashboard navigate={navigate} user={user} />;
      case 'book-appointment':
        return <BookAppointment navigate={navigate} user={user} />;
      case 'patient-appointments':
        return <PatientAppointments navigate={navigate} user={user} />;
      case 'appointment-details':
        return <AppointmentDetails appointmentId={selectedAppointmentId} navigate={navigate} user={user} />;
      case 'find-doctors':
        return <FindDoctors navigate={navigate} user={user} />;
      case 'doctor-dashboard':
        return <DoctorDashboard navigate={navigate} user={user} />;
      case 'manage-schedule':
        return <ManageSchedule navigate={navigate} user={user} />;
      case 'doctor-appointments':
        return <DoctorAppointments navigate={navigate} user={user} />;
      case 'admin-dashboard':
        return <AdminDashboard navigate={navigate} user={user} />;
      case 'manage-doctors':
        return <ManageDoctors navigate={navigate} user={user} />;
      case 'manage-patients':
        return <ManagePatients navigate={navigate} user={user} />;
      case 'system-health':
        return <SystemHealth navigate={navigate} user={user} />;
      case 'my-profile':
        return <MyProfile navigate={navigate} user={user} />;
      case 'change-password':
        return <ChangePassword navigate={navigate} user={user} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  const isPublicRoute = ['home', 'advanced-search', 'doctor-profile', 'about-us', 'contact', 'register', 'login', 'forgot-password', 'reset-password'].includes(currentRoute);

  return (
    <>
      {isPublicRoute ? (
        <PublicLayout user={user} navigate={navigate} onLogout={handleLogout}>
          {renderContent()}
        </PublicLayout>
      ) : (
        <AppLayout user={user} navigate={navigate} onLogout={handleLogout}>
          {renderContent()}
        </AppLayout>
      )}
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
        duration={4000}
      />
    </>
  );
}
