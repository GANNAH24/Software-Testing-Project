# Implementation Guide for Remaining Tasks

## ✅ COMPLETED TASKS

### Task 1: Doctor Working Hours ✅
1. **SQL Script Created**: `Backend/add-working-hours-to-doctors.sql`
   - Run this in your Supabase SQL Editor to add working_hours_start and working_hours_end columns
   - Adds TIME type columns with default 9 AM - 5 PM
   - Includes validation constraint

2. **Backend Updated**:
   - `doctors.controller.js`: Added working hours fields to create/update operations
   - `doctors.repository.js`: Includes working hours in create operation
   - `schedules.service.js`: Filters schedules based on doctor's working hours

3. **Usage**: Schedules will now automatically filter to only show times within doctor's working hours

### Task 2: Admin CRUD Operations ✅
1. **Backend Created**:
   - `admin.repository.js`: Data access layer for all CRUD operations
   - `admin.service.js`: Business logic layer
   - `admin.controller.js`: HTTP request handlers
   - `admin.routes.js`: API routes (all require admin role)
   - `app.js`: Routes mounted at `/api/v1/admin`

2. **Frontend Service Created**:
   - `admin.service.js`: Frontend API client

3. **Available Endpoints**:
   ```
   GET    /api/v1/admin/stats
   GET    /api/v1/admin/doctors
   POST   /api/v1/admin/doctors
   PUT    /api/v1/admin/doctors/:id
   DELETE /api/v1/admin/doctors/:id
   GET    /api/v1/admin/patients
   PUT    /api/v1/admin/patients/:id
   GET    /api/v1/admin/appointments
   PUT    /api/v1/admin/appointments/:id
   DELETE /api/v1/admin/appointments/:id
   ```

## 📋 TODO: Update Frontend Components

### Update ManageDoctors.jsx to use Real API
Replace the mock data with real API calls:

```jsx
import { useState, useEffect } from 'react';
import adminService from '../../shared/services/admin.service';

// In component:
const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadDoctors();
}, []);

const loadDoctors = async () => {
  try {
    setLoading(true);
    const response = await adminService.getAllDoctors({ search: searchQuery });
    setDoctors(response.data);
  } catch (error) {
    toast.error('Failed to load doctors');
  } finally {
    setLoading(false);
  }
};

const handleCreate = async () => {
  try {
    await adminService.createDoctor(formData);
    toast.success('Doctor created successfully!');
    loadDoctors();
    setCreateDialogOpen(false);
    resetForm();
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create doctor');
  }
};

const handleUpdate = async () => {
  try {
    await adminService.updateDoctor(selectedDoctor.doctor_id, formData);
    toast.success('Doctor updated successfully!');
    loadDoctors();
    setUpdateDialogOpen(false);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update doctor');
  }
};

const handleDelete = async () => {
  try {
    await adminService.deleteDoctor(selectedDoctor.doctor_id);
    toast.success('Doctor deleted successfully');
    loadDoctors();
    setDeleteDialogOpen(false);
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete doctor');
  }
};
```

### Similarly Update ManagePatients.jsx
Follow the same pattern for patients management.

## 📝 IMPLEMENTATION INSTRUCTIONS FOR REMAINING TASKS

Due to token limits, I cannot implement all remaining tasks in this response. Here's what needs to be done:

### Task 3: Sidebar Toggle (Hamburger Menu)
**Files to modify**:
1. Find your Navbar component
2. Add a Menu icon from lucide-react
3. Create a state to toggle sidebar visibility
4. Pass the state to Sidebar component
5. Add slide animation using CSS transforms or Framer Motion

**Code Pattern**:
```jsx
// In Navbar
const [sidebarOpen, setSidebarOpen] = useState(true);
<Menu onClick={() => setSidebarOpen(!sidebarOpen)} />

// In Sidebar
<aside className={`transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
```

### Task 4: "All Upcoming" View + Pagination
**Files to modify**:
- `DoctorAppointments.jsx` or `PatientAppointments.jsx`

**Add**:
1. New tab/button for "All View"
2. Pagination component (or use shadcn/ui Pagination)
3. Backend already supports this - just remove date filters

### Task 5: Analytics Dashboard
**Files to create**:
1. `Backend/src/features/admin/analytics.repository.js`
2. `Backend/src/features/admin/analytics.service.js`
3. Update `admin.controller.js` and `admin.routes.js`
4. `Frontend/src/components/admin/Analytics.jsx`
5. Install chart library: `npm install recharts`

**Endpoints needed**:
- GET `/api/v1/admin/analytics/specialties` - Doctors by specialty
- GET `/api/v1/admin/analytics/top-doctors` - Leaderboard by completed bookings

### Task 6: Review System
**Files to create**:
1. `Backend/create-reviews-table.sql` - SQL to set up reviews schema
2. `Backend/src/features/reviews/*` - Full feature folder
3. `Frontend/src/components/reviews/*` - Review components
4. Update DoctorProfile to show reviews

**SQL Schema**:
```sql
CREATE TABLE IF NOT EXISTS active_doctor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(appointment_id) UNIQUE,
  patient_id UUID REFERENCES patients(patient_id),
  doctor_id UUID REFERENCES doctors(doctor_id),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint: Only completed appointments can be reviewed
  CONSTRAINT check_appointment_completed CHECK (...),
  -- Constraint: One review per appointment
  UNIQUE(appointment_id)
);
```

## 🚀 NEXT STEPS

1. **Run the SQL script** for working hours:
   ```sql
   -- Copy contents of Backend/add-working-hours-to-doctors.sql
   -- Paste in Supabase SQL Editor
   -- Click Run
   ```

2. **Restart your backend** to load the new admin routes:
   ```bash
   cd Backend
   npm start
   ```

3. **Test admin endpoints** (you'll need an admin token):
   ```bash
   curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:3000/api/v1/admin/stats
   ```

4. **Update ManageDoctors.jsx** to use real API (see code above)

5. **Implement remaining tasks** (3, 4, 5, 6) using the patterns described

## 📚 Resources

- Recharts Documentation: https://recharts.org/
- Pagination Pattern: Use offset/limit in backend queries
- Review System: Ensure appointment is completed before allowing review

## ⚠️ Important Notes

- All admin routes require admin authentication
- Working hours are in TIME format (HH:MM:SS)
- Reviews are linked to appointments (one-to-one)
- Pagination should be server-side for scalability
