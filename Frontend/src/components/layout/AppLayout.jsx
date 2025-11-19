import { Menu, X, User, LogOut, LayoutDashboard, Calendar, Users, Stethoscope, Settings, Activity, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { HeartbeatLogo } from '../HeartbeatLogo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

// Converted from TSX: removed AppLayoutProps interface and type annotations
export function AppLayout({ children, user, navigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const getNavigationItems = () => {
    if (!user) return [];
    if (user.role === 'patient') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: 'patient-dashboard' },
      { icon: Search, label: 'Find Doctors', route: 'find-doctors' },
      { icon: Calendar, label: 'My Appointments', route: 'patient-appointments' }
    ];
    if (user.role === 'doctor') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: 'doctor-dashboard' },
      { icon: Calendar, label: 'Manage Schedule', route: 'manage-schedule' },
      { icon: Users, label: 'My Appointments', route: 'doctor-appointments' }
    ];
    if (user.role === 'admin') return [
      { icon: LayoutDashboard, label: 'Dashboard', route: 'admin-dashboard' },
      { icon: Stethoscope, label: 'Manage Doctors', route: 'manage-doctors' }
    ];
    return [];
  };

  const navItems = getNavigationItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-6">
        <nav className="space-y-1 px-3">
          {navItems.map(item => (
            <button key={item.route} onClick={() => { navigate(item.route); setMobileSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-[#667eea]/10 hover:text-[#667eea] rounded-lg transition-colors">
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
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
              <button onClick={() => navigate('home')} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                  <HeartbeatLogo className="w-6 h-6 text-white" />
                </div>
                <span className="hidden sm:inline text-gray-900">Se7ety</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{user.fullName}</span>
                      <span className="text-xs text-gray-500 capitalize hidden md:inline">({user.role})</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('my-profile')}><User className="w-4 h-4 mr-2" />My Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('change-password')}><Settings className="w-4 h-4 mr-2" />Change Password</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout}><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
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
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>{children}</main>
      </div>
    </div>
  );
}
