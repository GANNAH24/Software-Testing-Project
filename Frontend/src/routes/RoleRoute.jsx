import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../shared/contexts/AuthContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return children;
};

export default RoleRoute;
