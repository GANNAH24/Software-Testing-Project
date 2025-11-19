import React from 'react';
import { Home, Calendar, User, Users, Settings } from 'lucide-react';

export const Sidebar = ({ user, navigate, currentRoute }) => {
  const menuItems = user?.role === 'patient' ? [
    { icon: Home, label: 'Dashboard', route: 'patient-dashboard' },
    { icon: Calendar, label: 'My Appointments', route: 'patient-appointments' },
    { icon: Users, label: 'Find Doctors', route: 'find-doctors' },
    { icon: User, label: 'Profile', route: 'my-profile' }
  ] : user?.role === 'doctor' ? [
    { icon: Home, label: 'Dashboard', route: 'doctor-dashboard' },
    { icon: Calendar, label: 'Appointments', route: 'doctor-appointments' },
    { icon: Settings, label: 'Schedule', route: 'manage-schedule' }
  ] : [];

  return (
    <aside className='w-64 bg-white border-r h-screen sticky top-0'>
      <div className='p-4 space-y-2'>
        {menuItems.map(({ icon: Icon, label, route }) => (
          <button
            key={route}
            onClick={() => navigate(route)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 ${currentRoute === route ? 'bg-indigo-50 text-indigo-600' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
export default Sidebar;
