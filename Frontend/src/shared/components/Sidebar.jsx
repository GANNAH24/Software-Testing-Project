import React, { useState, useEffect } from 'react';
import { Home, Calendar, User, Users, Settings, MessageCircle } from 'lucide-react';
import { messagesService } from '../services/messages.service';

export const Sidebar = ({ user, navigate, currentRoute }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user?.id) return;
      try {
        const response = await messagesService.getUnreadCount();
        setUnreadCount(response?.data?.count || response?.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const menuItems = user?.role === 'patient' ? [
    { icon: Home, label: 'Dashboard', route: 'patient-dashboard' },
    { icon: Calendar, label: 'My Appointments', route: 'patient-appointments' },
    { icon: Users, label: 'Find Doctors', route: 'find-doctors' },
    { icon: MessageCircle, label: 'Messages', route: 'patient-messages', badge: unreadCount },
    { icon: User, label: 'Profile', route: 'my-profile' }
  ] : user?.role === 'doctor' ? [
    { icon: Home, label: 'Dashboard', route: 'doctor-dashboard' },
    { icon: Calendar, label: 'Appointments', route: 'doctor-appointments' },
    { icon: Settings, label: 'Schedule', route: 'manage-schedule' },
    { icon: MessageCircle, label: 'Messages', route: 'doctor-messages', badge: unreadCount }
  ] : [];

  return (
    <aside className='w-64 bg-white border-r h-screen sticky top-0'>
      <div className='p-4 space-y-2'>
        {menuItems.map(({ icon: Icon, label, route, badge }) => (
          <button
            key={route}
            onClick={() => navigate(route)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-100 ${currentRoute === route ? 'bg-indigo-50 text-indigo-600' : ''}`}
          >
            <Icon size={20} />
            <span className="flex-1 text-left">{label}</span>
            {badge > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};
export default Sidebar;
