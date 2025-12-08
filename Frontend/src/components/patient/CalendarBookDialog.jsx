import { useState, useEffect } from 'react';
import { QuickBookDialog } from './QuickBookDialog';
import doctorService from '../../shared/services/doctor.service';

export function CalendarBookDialog({ open, onOpenChange, preSelectedDoctorId }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!open) return;
    const loadDoctors = async () => {
      try {
        const res = await doctorService.list();
        setDoctors(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadDoctors();
  }, [open]);

  const doctor = doctors.find(d => d.id === preSelectedDoctorId) || selectedDoctor;

  return (
    <>
      <QuickBookDialog
        open={open}
        onOpenChange={onOpenChange}
        doctorName={doctor?.name || ''}
        doctorId={doctor?.id || ''}
        specialty={doctor?.specialty || ''}
      />
    </>
  );
}
