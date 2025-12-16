# 🏥 Se7ety Healthcare API - Layered Monolith Architecture

A healthcare management system built with a layered monolith architecture, featuring authentication, appointment management, and doctor profiles.

## 📋 Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Testing](#testing)

---

## 🏗️ Architecture

This project follows a **Feature-Based Layered Monolith** architecture:

### Architecture Principles:
1. **Feature-Based Organization**: Code organized by business features (auth, appointments, doctors)
2. **Three-Layer Pattern**: Each feature has Presentation → Business → Data layers
3. **Single Monolith**: All features run in one application on one port
4. **Versioned API**: `/api/v1/` prefix for all endpoints
5. **Shared Utilities**: Common middleware, utils, and validators

### Layer Responsibilities:

```
┌─────────────────────────────────────┐
│     PRESENTATION LAYER              │
│   (Controllers + Routes)            │
│   - HTTP request/response handling  │
│   - Input validation                │
│   - Response formatting             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     BUSINESS LOGIC LAYER            │
│   (Services)                        │
│   - Business rules                  │
│   - Data transformation             │
│   - Error handling                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     DATA ACCESS LAYER               │
│   (Repositories)                    │
│   - Database queries                │
│   - Data mapping                    │
│   - CRUD operations                 │
└─────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication
- User registration (Patient/Doctor)
- JWT-based authentication
- Role-based access control (Patient, Doctor, Admin)
- Password requirements enforcement
- Password reset functionality

### 📅 Appointments
- Create, read, update, delete appointments
- Appointment scheduling with conflict detection
- Filter by patient, doctor, date, status
- Upcoming and past appointments
- Appointment cancellation
- Soft delete support

### 👨‍⚕️ Doctors
- Public doctor browsing (no auth required)
- Search doctors by name or specialty
- Doctor profile management
- Admin-only doctor creation/deletion

---

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── database.js              # Supabase connection
│   │   └── environment.js           # Environment variables
│   │
│   ├── features/                    # Business features
│   │   ├── auth/                    # Authentication feature
│   │   │   ├── auth.repository.js   # Data layer
│   │   │   ├── auth.service.js      # Business logic
│   │   │   ├── auth.controller.js   # HTTP handlers
│   │   │   └── auth.routes.js       # Route definitions
│   │   │
│   │   ├── appointments/            # Appointments feature
│   │   │   ├── appointments.repository.js
│   │   │   ├── appointments.service.js
│   │   │   ├── appointments.controller.js
│   │   │   └── appointments.routes.js
│   │   │
│   │   └── doctors/                 # Doctors feature
│   │       ├── doctors.repository.js
│   │       ├── doctors.service.js
│   │       ├── doctors.controller.js
│   │       └── doctors.routes.js
│   │
│   ├── shared/                      # Shared utilities
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.js   # Authentication & authorization
│   │   │   ├── error.middleware.js  # Error handling
│   │   │   └── validation.middleware.js
│   │   └── utils/                   # Utility functions
│   │       ├── response.util.js     # Standardized responses
│   │       ├── password.util.js     # Password validation
│   │       └── logger.util.js       # Logging utility
│   │
│   └── app.js                       # Express app setup
│
├── index.js                         # Entry point
├── package.json                     # Dependencies
├── .env                             # Environment variables
└── database-enhancements.sql        # Database setup script
```

---

## 🚀 Setup

### Prerequisites
- Node.js (v14+)
- Supabase account
- PostgreSQL database (via Supabase)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the Backend directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT (optional - has defaults)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Logging
LOG_LEVEL=info
```

### 4. Database Setup

#### Step 1: Run Database Enhancements
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database-enhancements.sql`
4. Paste and run the SQL script

This will:
- Add performance indexes
- Add `updated_at` and `deleted_at` columns
- Create automatic update triggers
- Create views for active records

#### Step 2: Create Database Trigger for User Registration
Run this SQL in Supabase SQL Editor:

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown User'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

You should see:
```
============================================================
🏥 Se7ety Healthcare API - Layered Monolith
============================================================
✅ Server running on http://localhost:3000
📋 Environment: development
🔗 API Base: /api/v1
============================================================
📍 Health Check: http://localhost:3000/health
📍 API Root: http://localhost:3000/api/v1
============================================================
🔐 Auth: /api/v1/auth
📅 Appointments: /api/v1/appointments
👨‍⚕️ Doctors: /api/v1/doctors
============================================================
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Pass@123!",
  "role": "patient",
  "fullName": "John Doe",
  // For doctors only:
  "specialty": "Cardiology",
  "phoneNumber": "+1234567890"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Pass@123!"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### Get Password Requirements
```http
GET /api/v1/auth/password-requirements
```

### Appointments Endpoints

#### Create Appointment (Patient Only)
```http
POST /api/v1/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": "doctor-uuid",
  "appointment_date": "2025-10-20T10:00:00Z",
  "reason": "Checkup"
}
```

#### Get My Appointments
```http
GET /api/v1/appointments/upcoming
Authorization: Bearer <token>

GET /api/v1/appointments/past
Authorization: Bearer <token>
```

#### Get Patient Appointments
```http
GET /api/v1/appointments/patient/:patientId
Authorization: Bearer <token>
```

#### Cancel Appointment
```http
PATCH /api/v1/appointments/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancel_reason": "Not available"
}
```

### Doctors Endpoints

#### Get All Doctors (Public)
```http
GET /api/v1/doctors
```

#### Search Doctors
```http
GET /api/v1/doctors/search?q=john&specialty=Cardiology
```

#### Get Doctors by Specialty
```http
GET /api/v1/doctors/specialty/Cardiology
```

#### Get Doctor by ID
```http
GET /api/v1/doctors/:id
```

#### Create Doctor (Admin Only)
```http
POST /api/v1/doctors
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "user_id": "user-uuid",
  "full_name": "Dr. Sarah Smith",
  "specialty": "Cardiology",
  "phone_number": "+1234567890"
}
```

---

## 🔒 Authorization

### Role-Based Access Control

| Endpoint | Public | Patient | Doctor | Admin |
|----------|--------|---------|--------|-------|
| **Auth** |
| Register | ✅ | ✅ | ✅ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| Get Profile | ❌ | ✅ | ✅ | ✅ |
| **Appointments** |
| Create | ❌ | ✅ | ❌ | ❌ |
| View Own | ❌ | ✅ | ✅ | ✅ |
| Update | ❌ | ✅ | ✅ | ✅ |
| Cancel | ❌ | ✅ | ✅ | ❌ |
| Delete | ❌ | ✅ | ✅ | ✅ |
| **Doctors** |
| Browse All | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Create | ❌ | ❌ | ❌ | ✅ |
| Update | ❌ | ❌ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 Testing

### Manual Testing with test-api.html
1. Open `test-api.html` in your browser
2. Click "Login / Register"
3. Register or login with test credentials
4. Test all endpoints through the UI

### Using Postman/Insomnia
Import the API endpoints and test with:
- Base URL: `http://localhost:3000/api/v1`
- Add Authorization header: `Bearer <your-token>`

---

## 🐛 Troubleshooting

### Database Connection Failed
- Check `.env` file has correct `SUPABASE_URL` and keys
- Verify Supabase project is active

### Authentication Errors
- Ensure database trigger is created (see Database Setup)
- Check that profiles table exists
- Verify JWT token in Authorization header

### Appointment Conflicts
- System prevents double-booking (same doctor within 1-hour window)
- Check appointment date is in the future

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)

---

## 👥 Team

Software Testing Project - Semester 5

---

## 📝 License

ISC

---

**🎉 Your layered monolith is ready to use!**
