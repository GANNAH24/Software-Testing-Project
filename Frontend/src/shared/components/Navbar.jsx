import React from 'react';
import { User, LogOut, Menu } from 'lucide-react'; // Added Menu import

// Added toggleSidebar to props
export const Navbar = ({ user, navigate, onLogout, toggleSidebar }) => {
  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            {/* Hamburger Menu Button */}
            <button 
              onClick={toggleSidebar} 
              className="mr-4 p-2 rounded-md hover:bg-gray-100 focus:outline-none lg:hidden" // lg:hidden makes it disappear on large screens if desired
            >
              <Menu size={24} className="text-gray-600" />
            </button>

            <h1 className='text-xl font-bold text-indigo-600 cursor-pointer' onClick={() => navigate('home')}>
              Se7ety Healthcare
            </h1>
          </div>
          {user && (
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-700 hidden sm:block'>{user.full_name || user.email}</span>
              <button onClick={() => navigate('my-profile')} className='p-2 hover:bg-gray-100 rounded'>
                <User size={20} />
              </button>
              <button onClick={onLogout} className='p-2 hover:bg-gray-100 rounded text-red-600'>
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;