# API Testing Guide - Se7ety Healthcare API

Complete testing guide for all API endpoints with Thunder Client / Postman / cURL examples.

---

## Prerequisites

- Server running on `http://localhost:3000`
- Valid test accounts (or create new ones)
- API Base URL: `http://localhost:3000/api/v1`

---

## Table of Contents

1. [Health & Info Endpoints](#1-health--info-endpoints)
2. [Authentication Endpoints](#2-authentication-endpoints)
3. [Doctors Endpoints](#3-doctors-endpoints)
4. [Appointments Endpoints](#4-appointments-endpoints)
5. [Patients Endpoints](#5-patients-endpoints)
6. [Schedules Endpoints](#6-schedules-endpoints)

---

## 1. Health & Info Endpoints

### 1.1 Health Check

**Endpoint:** `GET /health`

**Description:** Check if the API is running

**Request:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Se7ety Healthcare API is running",
  "timestamp": "2025-11-29T17:00:00.000Z",
  "environment": "development",
  "version": "v1"
}
```

**Status Code:** `200 OK`

---

### 1.2 API Root

**Endpoint:** `GET /api/v1`

**Description:** Get API information and available endpoints

**Request:**
```bash
curl http://localhost:3000/api/v1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome to Se7ety Healthcare API",
  "version": "v1",
  "endpoints": {
    "auth": "/api/v1/auth",
    "appointments": "/api/v1/appointments",
    "doctors": "/api/v1/doctors",
    "schedules": "/api/v1/schedules"
  },
  "documentation": {
    "health": "/health",
    "apiDocs": "/api/v1"
  }
}
```

**Status Code:** `200 OK`

---

## 2. Authentication Endpoints

### 2.1 Get Password Requirements

**Endpoint:** `GET /api/v1/auth/password-requirements`

**Description:** Get password validation requirements

**Request:**
```bash
curl http://localhost:3000/api/v1/auth/password-requirements
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "minLength": 8,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true,
    "specialChars": "!@#$%^&*()_+-=[]{}|;:,.<>?",
    "description": [
      "At least 8 characters",
      "At least one uppercase letter (A-Z)",
      "At least one lowercase letter (a-z)",
      "At least one number (0-9)",
      "At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    ]
  }
}
```

**Status Code:** `200 OK`

---

### 2.2 Register Patient

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new patient account

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "Patient@123",
    "fullName": "John Doe",
    "role": "patient",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "phone": "+1234567890"
  }'
```

**Required Fields:**
- `email` (string): Valid email address
- `password` (string): Must meet password requirements
- `fullName` (string): User's full name
- `role` (string): Must be "patient" (admin role blocked via API)
- `dateOfBirth` (string): Format YYYY-MM-DD (patients only)
- `gender` (string): male/female/other (patients only)
- `phone` (string): Phone number (patients only)

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "patient@example.com",
      "role": "patient",
      "fullName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Code:** `201 Created`

---

### 2.3 Register Doctor

**Endpoint:** `POST /api/v1/auth/register`

**Description:** Register a new doctor account

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@example.com",
    "password": "Doctor@123",
    "fullName": "Dr. Sarah Smith",
    "role": "doctor",
    "specialty": "Cardiology",
    "location": "New York",
    "qualifications": "MD, FACC"
  }'
```

**Required Fields (Doctor):**
- `email`, `password`, `fullName`, `role` (same as patient)
- `specialty` (string): Doctor's specialty
- `location` (string): Practice location

**Optional Fields:**
- `qualifications` (string): Medical qualifications

**Status Code:** `201 Created`

---

### 2.4 Login

**Endpoint:** `POST /api/v1/auth/login`

**Description:** Login to get authentication token

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com",
    "password": "Patient@123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "patient@example.com",
      "role": "patient",
      "fullName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "roleData": {
      "patient_id": "uuid-here",
      "date_of_birth": "1990-01-15",
      "gender": "male",
      "phone": "+1234567890"
    }
  }
}
```

**Status Code:** `200 OK`

---

### 2.5 Get Current User (Protected)

**Endpoint:** `GET /api/v1/auth/me`

**Description:** Get authenticated user's profile

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "uuid-here",
    "email": "patient@example.com",
    "role": "patient",
    "fullName": "John Doe",
    "profile": {
      "id": "uuid-here",
      "full_name": "John Doe",
      "role": "patient",
      "created_at": "2025-11-29T12:00:00.000Z",
      "updated_at": "2025-11-29T12:00:00.000Z"
    },
    "roleData": { /* patient/doctor specific data */ }
  }
}
```

**Status Code:** `200 OK`

---

### 2.6 Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout current user

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Code:** `200 OK`

---

### 2.7 Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Description:** Request password reset email

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@example.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Status Code:** `200 OK`

**Note:** Check Supabase email confirmation settings if issues occur.

---

## 3. Doctors Endpoints

### 3.1 Get All Doctors

**Endpoint:** `GET /api/v1/doctors`

**Description:** Get list of all doctors (with optional filters)

**Query Parameters:**
- `search` (optional): Search by name
- `specialty` (optional): Filter by specialty
- `location` (optional): Filter by location
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Request:**
```bash
# Get all doctors
curl http://localhost:3000/api/v1/doctors

# Search by name
curl "http://localhost:3000/api/v1/doctors?search=Smith"

# Filter by specialty
curl "http://localhost:3000/api/v1/doctors?specialty=Cardiology"

# Combined filters
curl "http://localhost:3000/api/v1/doctors?specialty=Cardiology&location=New%20York"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 7 doctors",
  "data": [
    {
      "doctor_id": "uuid-here",
      "user_id": "uuid-here",
      "name": "Dr. Sarah Smith",
      "specialty": "Cardiology",
      "qualifications": "MD, FACC",
      "reviews": 4.8,
      "location": "New York",
      "created_at": "2025-11-10T18:33:45.099Z",
      "updated_at": "2025-11-10T18:33:45.337016Z",
      "deleted_at": null
    }
  ]
}
```

**Status Code:** `200 OK`

---

### 3.2 Get Doctor by ID

**Endpoint:** `GET /api/v1/doctors/:id`

**Description:** Get detailed information about a specific doctor

**Request:**
```bash
curl http://localhost:3000/api/v1/doctors/DOCTOR_UUID_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "doctor_id": "uuid-here",
    "user_id": "uuid-here",
    "name": "Dr. Sarah Smith",
    "specialty": "Cardiology",
    "qualifications": "MD, FACC",
    "reviews": 4.8,
    "location": "New York",
    "created_at": "2025-11-10T18:33:45.099Z",
    "updated_at": "2025-11-10T18:33:45.337016Z"
  }
}
```

**Status Code:** `200 OK`

**Error Response (Not Found):**
```json
{
  "success": false,
  "message": "Doctor not found"
}
```

**Status Code:** `404 Not Found`

---

### 3.3 Get Doctor's Schedules

**Endpoint:** `GET /api/v1/doctors/:id/schedules`

**Description:** Get all schedules for a specific doctor

**Query Parameters:**
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Request:**
```bash
# Get all schedules
curl http://localhost:3000/api/v1/doctors/DOCTOR_UUID_HERE/schedules

# Get schedules for specific date
curl "http://localhost:3000/api/v1/doctors/DOCTOR_UUID_HERE/schedules?date=2025-12-01"

# Get schedules for date range
curl "http://localhost:3000/api/v1/doctors/DOCTOR_UUID_HERE/schedules?startDate=2025-12-01&endDate=2025-12-07"
```

**Status Code:** `200 OK`

---

### 3.4 Get Doctor's Appointments

**Endpoint:** `GET /api/v1/doctors/:id/appointments`

**Description:** Get all appointments for a specific doctor

**Authentication:** Required (Bearer Token - Doctor only)

**Request:**
```bash
curl http://localhost:3000/api/v1/doctors/DOCTOR_UUID_HERE/appointments \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

## 4. Appointments Endpoints

### 4.1 Get User Appointments

**Endpoint:** `GET /api/v1/appointments`

**Description:** Get appointments for authenticated user (patient or doctor)

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, completed, cancelled)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Request:**
```bash
# Get all appointments
curl http://localhost:3000/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by status
curl "http://localhost:3000/api/v1/appointments?status=scheduled" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by date range
curl "http://localhost:3000/api/v1/appointments?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "appointment_id": "uuid-here",
      "patient_id": "uuid-here",
      "doctor_id": "uuid-here",
      "date": "2025-12-15",
      "time_slot": "10:00-10:30",
      "status": "scheduled",
      "notes": "Regular checkup",
      "reason": "Annual physical examination",
      "created_at": "2025-11-29T12:00:00.000Z",
      "updated_at": "2025-11-29T12:00:00.000Z",
      "reminder_24h_sent_at": null,
      "reminder_2h_sent_at": null
    }
  ]
}
```

**Status Code:** `200 OK`

---

### 4.2 Get Appointment by ID

**Endpoint:** `GET /api/v1/appointments/:id`

**Description:** Get specific appointment details

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/appointments/APPOINTMENT_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

### 4.3 Create Appointment

**Endpoint:** `POST /api/v1/appointments`

**Description:** Create a new appointment

**Authentication:** Required (Bearer Token - Patient only)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PATIENT_TOKEN_HERE" \
  -d '{
    "doctor_id": "DOCTOR_UUID_HERE",
    "date": "2025-12-15",
    "time_slot": "10:00-10:30",
    "reason": "Annual checkup",
    "notes": "First visit"
  }'
```

**Required Fields:**
- `doctor_id` (string): Doctor's UUID
- `date` (string): Appointment date (YYYY-MM-DD)
- `time_slot` (string): Time slot (e.g., "10:00-10:30")
- `reason` (string): Reason for appointment

**Optional Fields:**
- `notes` (string): Additional notes

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointment_id": "uuid-here",
    "patient_id": "uuid-here",
    "doctor_id": "uuid-here",
    "date": "2025-12-15",
    "time_slot": "10:00-10:30",
    "status": "scheduled",
    "reason": "Annual checkup",
    "notes": "First visit"
  }
}
```

**Status Code:** `201 Created`

**Error Responses:**
- `400 Bad Request`: Invalid date, time slot, or doctor not available
- `401 Unauthorized`: Not authenticated or not a patient
- `404 Not Found`: Doctor not found

---

### 4.4 Update Appointment

**Endpoint:** `PUT /api/v1/appointments/:id`

**Description:** Update an existing appointment

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/appointments/APPOINTMENT_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "date": "2025-12-16",
    "time_slot": "11:00-11:30",
    "notes": "Rescheduled appointment"
  }'
```

**Status Code:** `200 OK`

---

### 4.5 Cancel Appointment

**Endpoint:** `DELETE /api/v1/appointments/:id`

**Description:** Cancel an appointment (soft delete)

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/appointments/APPOINTMENT_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

**Status Code:** `200 OK`

---

### 4.6 Get Upcoming Appointments

**Endpoint:** `GET /api/v1/appointments/upcoming`

**Description:** Get user's upcoming appointments

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/appointments/upcoming \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

### 4.7 Get Past Appointments

**Endpoint:** `GET /api/v1/appointments/past`

**Description:** Get user's past appointments

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/appointments/past \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

## 5. Patients Endpoints

### 5.1 Get All Patients

**Endpoint:** `GET /api/v1/patients`

**Description:** Get list of all patients

**Authentication:** Required (Bearer Token - Admin/Doctor only)

**Request:**
```bash
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

### 5.2 Get Patient by ID

**Endpoint:** `GET /api/v1/patients/:id`

**Description:** Get specific patient details

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/patients/PATIENT_UUID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

### 5.3 Update Patient

**Endpoint:** `PUT /api/v1/patients/:id`

**Description:** Update patient information

**Authentication:** Required (Bearer Token - Patient owner or Admin)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/patients/PATIENT_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "phone": "+1234567899",
    "date_of_birth": "1990-01-15"
  }'
```

**Status Code:** `200 OK`

---

### 5.4 Get Patient Appointments

**Endpoint:** `GET /api/v1/patients/:id/appointments`

**Description:** Get all appointments for a specific patient

**Authentication:** Required (Bearer Token)

**Request:**
```bash
curl http://localhost:3000/api/v1/patients/PATIENT_UUID_HERE/appointments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

## 6. Schedules Endpoints

### 6.1 Get All Schedules

**Endpoint:** `GET /api/v1/schedules`

**Description:** Get all schedules

**Query Parameters:**
- `doctorId` (optional): Filter by doctor
- `date` (optional): Filter by date
- `isAvailable` (optional): Filter by availability (true/false)

**Request:**
```bash
# Get all schedules
curl http://localhost:3000/api/v1/schedules

# Filter by doctor
curl "http://localhost:3000/api/v1/schedules?doctorId=DOCTOR_UUID_HERE"

# Filter by date
curl "http://localhost:3000/api/v1/schedules?date=2025-12-15"

# Filter available slots
curl "http://localhost:3000/api/v1/schedules?isAvailable=true"
```

**Status Code:** `200 OK`

---

### 6.2 Create Schedule

**Endpoint:** `POST /api/v1/schedules`

**Description:** Create a new schedule slot

**Authentication:** Required (Bearer Token - Doctor/Admin only)

**Request:**
```bash
curl -X POST http://localhost:3000/api/v1/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE" \
  -d '{
    "doctor_id": "DOCTOR_UUID_HERE",
    "date": "2025-12-15",
    "time_slot": "10:00-10:30",
    "is_available": true
  }'
```

**Status Code:** `201 Created`

---

### 6.3 Update Schedule

**Endpoint:** `PUT /api/v1/schedules/:id`

**Description:** Update a schedule slot

**Authentication:** Required (Bearer Token - Doctor/Admin only)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/v1/schedules/SCHEDULE_UUID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE" \
  -d '{
    "is_available": false
  }'
```

**Status Code:** `200 OK`

---

### 6.4 Delete Schedule

**Endpoint:** `DELETE /api/v1/schedules/:id`

**Description:** Delete a schedule slot

**Authentication:** Required (Bearer Token - Doctor/Admin only)

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/v1/schedules/SCHEDULE_UUID_HERE \
  -H "Authorization: Bearer DOCTOR_TOKEN_HERE"
```

**Status Code:** `200 OK`

---

## Testing Workflows

### Complete Patient Journey

```bash
# 1. Register as patient
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@example.com",
    "password": "Test@12345",
    "fullName": "Test Patient",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "phone": "+1234567890"
  }')

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. View all doctors
curl http://localhost:3000/api/v1/doctors

# 3. Get specific doctor's schedules
curl "http://localhost:3000/api/v1/doctors/DOCTOR_UUID/schedules?date=2025-12-15"

# 4. Create appointment
curl -X POST http://localhost:3000/api/v1/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "doctor_id": "DOCTOR_UUID",
    "date": "2025-12-15",
    "time_slot": "10:00-10:30",
    "reason": "Annual checkup"
  }'

# 5. View my appointments
curl http://localhost:3000/api/v1/appointments \
  -H "Authorization: Bearer $TOKEN"

# 6. Get profile
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": ["Specific error details"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - No token provided" 
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied - Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## Testing Tips

1. **Use Variables**: Save tokens and IDs to variables for easier testing
2. **Test in Order**: Some endpoints depend on data from previous calls
3. **Check Logs**: Server logs show detailed request/response info
4. **Validate Data**: Ensure dates are in future, IDs exist, etc.
5. **Test Errors**: Try invalid data to test validation
6. **Use Tools**: Thunder Client, Postman, or Insomnia make testing easier

---

## Automated Testing Script

Save this as `test-all-endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/v1"

echo "================================"
echo "API Endpoints Testing"
echo "================================"
echo ""

# Test 1: Health Check
echo "✓ Testing Health Endpoint..."
curl -s $BASE_URL/health | jq '.success'

# Test 2: API Root
echo "✓ Testing API Root..."
curl -s $API_URL | jq '.success'

# Test 3: Password Requirements
echo "✓ Testing Password Requirements..."
curl -s $API_URL/auth/password-requirements | jq '.success'

# Test 4: Get Doctors
echo "✓ Testing Get All Doctors..."
curl -s $API_URL/doctors | jq '.success'

# Test 5: Register Patient
echo "✓ Testing Patient Registration..."
REGISTER=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "autotest@example.com",
    "password": "Test@12345",
    "fullName": "Auto Test",
    "role": "patient",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "phone": "+1234567890"
  }')
echo $REGISTER | jq '.success'
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Test 6: Login
echo "✓ Testing Login..."
curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"autotest@example.com\",\"password\":\"Test@12345\"}" | jq '.success'

# Test 7: Get Current User
echo "✓ Testing Get Current User..."
curl -s $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

# Test 8: Get Appointments
echo "✓ Testing Get Appointments..."
curl -s $API_URL/appointments \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

echo ""
echo "================================"
echo "All Tests Completed!"
echo "================================"
```

Run with: `chmod +x test-all-endpoints.sh && ./test-all-endpoints.sh`

---

## Summary

This guide covers all available API endpoints with:
- ✅ Complete request examples
- ✅ Expected responses
- ✅ Status codes
- ✅ Authentication requirements
- ✅ Query parameters
- ✅ Error handling
- ✅ Testing workflows
- ✅ Automated test script

For Thunder Client testing, import the `thunder-collection.json` file in the Backend directory.
