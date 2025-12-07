import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Footer } from '../Footer';
import { HeartbeatLogo } from '../HeartbeatLogo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthContext } from '../../shared/contexts/AuthContext';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                  <HeartbeatLogo className="w-6 h-6 text-white" />
                </div>
                <span className="text-gray-900">Se7ety</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/about" className="text-gray-700 hover:text-[#667eea] transition-colors">About Us</Link>
                <Link to="/contact" className="text-gray-700 hover:text-[#667eea] transition-colors">Contact</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2"><User className="w-4 h-4" /><span className="hidden sm:inline">{user.fullName}</span></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(`/${user.role}/profile`)}><User className="w-4 h-4 mr-2" />My Profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/login')} className="hidden sm:inline-flex">Login</Button>
                  <Button onClick={() => navigate('/register')} className="bg-[#667eea] hover:bg-[#5568d3] text-white">Sign Up</Button>
                </>
              )}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">About Us</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Contact</Link>
                {!user && (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="sm:hidden text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">Login</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      <main><Outlet /></main>
      <Footer />
    </div>
  );
}
