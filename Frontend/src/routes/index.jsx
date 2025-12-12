import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Home } from '../components/Home';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { DoctorProfile } from '../components/DoctorProfile';
import { Register } from '../components/Register';
import { Login } from '../components/Login';
import { ForgotPassword } from '../components/ForgotPassword';
import { ResetPassword } from '../components/ResetPassword';
import { AboutUs } from '../components/AboutUs';
import { Contact } from '../components/Contact';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import { BookAppointment } from '../components/patient/BookAppointment';
import { PatientAppointments } from '../components/patient/PatientAppointments';
import { AppointmentDetails } from '../components/patient/AppointmentDetails';
import { FindDoctors } from '../components/patient/FindDoctors';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { ManageSchedule } from '../components/doctor/ManageSchedule';
import { DoctorAppointments } from '../components/doctor/DoctorAppointments';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ManageDoctors } from '../components/admin/ManageDoctors';
import { ManagePatients } from '../components/admin/ManagePatients';
import { SystemHealth } from '../components/admin/SystemHealth';
import { MyProfile } from '../pages/MyProfile';
import { EditProfile } from '../components/EditProfile';
import { ChangePassword } from '../components/ChangePassword';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

export const router = createBrowserRouter([
  // Public routes with PublicLayout
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'search',
        element: <AdvancedSearch />,
      },
      {
        path: 'doctor/:id',
        element: <DoctorProfile />,
      },
      {
        path: 'about',
        element: <AboutUs />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },

  // Protected routes with AppLayout
  {
    path: '/patient',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['patient']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/patient/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <PatientDashboard />,
      },
      {
        path: 'find-doctors',
        element: <FindDoctors />,
      },
      {
        path: 'book-appointment',
        element: <BookAppointment />,
      },
      {
        path: 'appointments',
        element: <PatientAppointments />,
      },
      {
        path: 'appointments/:id',
        element: <AppointmentDetails />,
      },
      {
        path: 'profile',
        element: <MyProfile />,
      },
      {
        path: 'edit-profile',
        element: <EditProfile />,
      },
      {
        path: 'change-password',
        element: <ChangePassword />,
      },
      {
        path: 'messages',
        element: <ChatList />,
      },
      {
        path: 'messages/:conversationId',
        element: <ChatWindow />,
      },
    ],
  },

  // Doctor routes
  {
    path: '/doctor',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['doctor']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/doctor/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DoctorDashboard />,
      },
      {
        path: 'schedule',
        element: <ManageSchedule />,
      },
      {
        path: 'appointments',
        element: <DoctorAppointments />,
      },
      {
        path: 'profile',
        element: <MyProfile />,
      },
      {
        path: 'edit-profile',
        element: <EditProfile />,
      },
      {
        path: 'change-password',
        element: <ChangePassword />,
      },
      {
        path: 'messages',
        element: <ChatList />,
      },
      {
        path: 'messages/:conversationId',
        element: <ChatWindow />,
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleRoute allowedRoles={['admin']}>
          <AppLayout />
        </RoleRoute>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'doctors',
        element: <ManageDoctors />,
      },
      {
        path: 'patients',
        element: <ManagePatients />,
      },
      {
        path: 'system-health',
        element: <SystemHealth />,
      },
      {
        path: 'profile',
        element: <MyProfile />,
      },
      {
        path: 'edit-profile',
        element: <EditProfile />,
      },
      {
        path: 'change-password',
        element: <ChangePassword />,
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
