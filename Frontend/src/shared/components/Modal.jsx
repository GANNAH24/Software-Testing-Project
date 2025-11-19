import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50' onClick={onClose}>
      <div className='bg-white rounded-lg shadow-xl max-w-md w-full mx-4' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded'><X size={20} /></button>
        </div>
        <div className='p-4'>{children}</div>
      </div>
    </div>
  );
};
export default Modal;
