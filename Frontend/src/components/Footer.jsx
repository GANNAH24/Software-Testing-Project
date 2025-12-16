import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeartbeatLogo } from './HeartbeatLogo';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center">
                <HeartbeatLogo className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-white">Se7ety</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your trusted healthcare platform connecting patients with quality medical professionals.
            </p>
            <div className="flex gap-3">
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#667eea] transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#667eea] transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#667eea] transition-colors">
                <Instagram className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#667eea] transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-white mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/register"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-[#667eea] transition-colors text-sm"
                >
                  Login
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-400">Book Appointments</span>
              </li>
              <li>
                <span className="text-sm text-gray-400">View Medical History</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-[#667eea]" />
                <span>support@se7ety.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-[#667eea]" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-[#667eea]" />
                <span>German International University<br />Cairo, Egypt</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 Se7ety. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <button className="hover:text-[#667eea] transition-colors">
              Privacy Policy
            </button>
            <button className="hover:text-[#667eea] transition-colors">
              Terms of Service
            </button>
            <button className="hover:text-[#667eea] transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}