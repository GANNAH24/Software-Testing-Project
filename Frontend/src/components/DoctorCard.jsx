import { MapPin, Star, Phone } from 'lucide-react';
import { Doctor } from '../lib/mockData';
import { Card } from './ui/card';



export function DoctorCard({ doctor, onClick }) {
  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 mb-1 truncate">{doctor.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{doctor.specialty}</p>
          
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{doctor.reviewsCount} reviews</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="truncate">{doctor.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 flex-shrink-0" />
            <span>{doctor.phone}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-700">{doctor.qualifications}</p>
      </div>
    </Card>
  );
}
