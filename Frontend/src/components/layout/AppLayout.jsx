import { Menu, X, User, LogOut, LayoutDashboard, Calendar, Users, Stethoscope, Settings, Activity, Search, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { HeartbeatLogo } from '../HeartbeatLogo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { messagesService } from '../../shared/services/messages.service';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getNavigationItems = () => {
    if (!user) return [];
    if (user.role === 'patient') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/patient/dashboard' },
      { icon: Search, label: 'Find Doctors', route: '/patient/find-doctors' },
      { icon: Calendar, label: 'My Appointments', route: '/patient/appointments' },
      { icon: MessageCircle, label: 'Messages', route: '/patient/messages', badge: unreadCount }
    ];
    if (user.role === 'doctor') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/doctor/dashboard' },
      { icon: Calendar, label: 'Manage Schedule', route: '/doctor/schedule' },
      { icon: Users, label: 'My Bookings', route: '/doctor/appointments' },
      { icon: MessageCircle, label: 'Messages', route: '/doctor/messages', badge: unreadCount }
    ];
    if (user.role === 'admin') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: '/admin/dashboard' },
      { icon: Stethoscope, label: 'Manage Doctors', route: '/admin/doctors' },
      { icon: Users, label: 'Manage Patients', route: '/admin/patients' },
      { icon: Activity, label: 'Analytics', route: '/admin/analytics' }
    ];
    return [];
  };

  const navItems = getNavigationItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {navItems.map(item => (
            <Link key={item.route} to={item.route} onClick={() => setMobileSidebarOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#667eea]/10 hover:text-[#667eea] rounded-lg transition-colors">
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {sidebarOpen || mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                  <HeartbeatLogo className="w-6 h-6 text-white" />
                </div>
                <span className="hidden sm:inline text-gray-900">Se7ety</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.fullName || user.full_name || 'User'}</span>
                      <span className="text-xs text-gray-500 capitalize hidden md:inline">({user.role})</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(`/${user.role}/profile`)}><User className="w-4 h-4 mr-2" />My Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${user.role}/change-password`)}><Settings className="w-4 h-4 mr-2" />Change Password</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="flex">
        <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          <SidebarContent />
        </aside>
        {mobileSidebarOpen && (
          <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40"><SidebarContent /></aside>
        )}
        {mobileSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16" onClick={() => setMobileSidebarOpen(false)} />}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}><Outlet /></main>
      </div>
    </div>
  );
}
