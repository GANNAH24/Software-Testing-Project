# End-to-End (E2E) Test Scenarios for Se7ety Healthcare Platform

## Overview
This document outlines comprehensive E2E test scenarios covering critical user workflows. These tests validate the entire system from user interaction through frontend, API, database, and back to the UI.

**Testing Framework Recommendation:** Playwright or Cypress  
**Test Environment:** Staging environment with test database

---

## E2E Test Suite 1: Patient Registration and Login Journey

### User Story Coverage
- **US-001:** As a Patient, I want to register with my personal details
- **US-003:** As a User, I want to log in with my email and password
- **US-004:** As a User, I want to receive clear error messages when my password doesn't meet requirements

### Test Scenario E2E-001: Complete Patient Registration Happy Path

**Preconditions:**
- Application is accessible at the base URL
- Test database is clean (no existing user with test email)

**Test Steps:**
1. Navigate to the registration page (`/register`)
2. Verify registration form is displayed with all fields
3. Select role as "Patient"
4. Fill in valid patient details:
   - Email: `e2e-patient-{timestamp}@test.com`
   - Password: `SecurePass123!`
   - Full Name: `E2E Test Patient`
   - Phone: `+1234567890`
   - Date of Birth: `1990-01-01`
   - Gender: `Male`
5. Observe password strength indicator shows all requirements met
6. Click "Register" button
7. Wait for registration to complete
8. Verify redirect to patient dashboard (`/patient/dashboard`)
9. Verify dashboard displays welcome message with patient name
10. Verify navigation menu shows patient-specific options

**Expected Results:**
- All form fields accept valid input
- Password requirements are validated in real-time
- Registration succeeds without errors
- User is automatically logged in after registration
- Dashboard displays correctly with patient role
- Session is established (auth token stored)

**Validation Points:**
- HTTP Status: 201 Created for registration API
- Database: User record created in `users` table
- Database: Patient record created in `patients` table
- UI: Success toast notification displayed
- UI: User profile shows correct role and data

---

### Test Scenario E2E-002: Patient Login Happy Path

**Preconditions:**
- Test patient account exists in database
- User is on the home page

**Test Steps:**
1. Navigate to login page (`/login`)
2. Enter valid credentials:
   - Email: `existing-patient@test.com`
   - Password: `SecurePass123!`
3. Click "Login" button
4. Wait for authentication
5. Verify redirect to patient dashboard
6. Verify user is logged in (check for logout button)

**Expected Results:**
- Login completes successfully
- Redirect to `/patient/dashboard`
- Dashboard displays user-specific data
- Session persists across page refresh

**Validation Points:**
- HTTP Status: 200 OK for login API
- Session token stored in cookies/localStorage
- User profile data retrieved from backend
- UI reflects authenticated state

---

### Test Scenario E2E-003: Registration Error Handling

**Test Steps:**
1. Navigate to registration page
2. Attempt to register with weak password: `weak`
3. Verify error messages displayed for each unmet requirement:
   - "At least 8 characters"
   - "One uppercase letter"
   - "One lowercase letter"
   - "One number"
   - "One special character"
4. Correct the password to `SecurePass123!`
5. Attempt to register with invalid email: `invalid-email`
6. Verify error: "Invalid email format"
7. Correct email to valid format
8. Attempt to register without required field (e.g., Full Name)
9. Verify error: "Full name is required"

**Expected Results:**
- Validation errors displayed in real-time
- Form submission blocked until all validations pass
- Error messages are clear and actionable
- No API calls made for client-side validation errors

---

## E2E Test Suite 2: Doctor Search and Appointment Booking Journey

### User Story Coverage
- **US-006:** As a Patient, I want to browse all available doctors
- **US-007:** As a Patient, I want to search doctors by name or specialty
- **US-008:** As a Patient, I want to filter doctors by specialty and location
- **US-011:** As a Patient, I want to book an appointment with a doctor

### Test Scenario E2E-004: Browse and Search Doctors

**Preconditions:**
- User is logged in as patient
- Test doctors exist in database

**Test Steps:**
1. From patient dashboard, navigate to "Find Doctors" page
2. Verify all doctors are displayed in cards
3. Verify each doctor card shows:
   - Name
   - Specialty
   - Location
   - Years of experience
   - Photo (if available)
4. Use search box to search for "Cardiology"
5. Verify only cardiologists are displayed
6. Clear search
7. Use specialty filter to select "Pediatrics"
8. Verify only pediatricians are displayed
9. Use location filter to select "New York"
10. Verify only doctors in New York are displayed
11. Combine filters: Specialty = "Cardiology", Location = "New York"
12. Verify filtered results match both criteria

**Expected Results:**
- All doctors load without errors
- Search filtering works correctly
- Multiple filters can be combined
- Results update dynamically without page reload
- No doctors found message appears when filters match nothing

**Validation Points:**
- HTTP Status: 200 OK for doctors API
- Response contains array of doctor objects
- Frontend correctly filters displayed results
- UI updates reflect search/filter state

---

### Test Scenario E2E-005: Complete Appointment Booking Happy Path

**Preconditions:**
- User is logged in as patient
- Test doctor has available schedule for future date

**Test Steps:**
1. Navigate to "Book Appointment" page
2. Search for doctor: "Dr. John Smith"
3. Click "Select" on Dr. John Smith's card
4. Verify Step 2: Date selection screen appears
5. Select a date 7 days in the future
6. Verify Step 3: Time slot selection appears
7. Verify available time slots are displayed (e.g., 10:00-11:00, 14:00-15:00)
8. Select time slot: "10:00-11:00"
9. Verify appointment summary displays:
   - Doctor: Dr. John Smith
   - Date: Selected date
   - Time: 10:00-11:00
10. Enter optional notes: "Regular checkup"
11. Click "Confirm Appointment"
12. Wait for booking confirmation
13. Verify success message: "Appointment booked successfully"
14. Verify redirect to "My Appointments" page
15. Verify new appointment appears in upcoming appointments list

**Expected Results:**
- Multi-step booking flow works smoothly
- Only available time slots are shown
- Summary displays all booking details correctly
- Booking API call succeeds
- Appointment is saved to database
- User is redirected to view their appointments
- New appointment appears immediately

**Validation Points:**
- HTTP Status: 201 Created for appointment booking API
- Database: Appointment record created with status "booked"
- Database: Doctor schedule marked as unavailable
- UI: Appointment details match user selection
- UI: Toast notification shows success

---

### Test Scenario E2E-006: Appointment Booking Error Handling

**Test Steps:**
1. Navigate to "Book Appointment" page
2. Select a doctor
3. Attempt to select a past date
4. Verify error: "Please select a future date"
5. Select a future date with no available time slots
6. Verify message: "No available time slots for this date"
7. Select a date and time slot
8. Before confirming, another user books the same slot (simulate race condition)
9. Attempt to confirm booking
10. Verify error: "This time slot is no longer available"

**Expected Results:**
- Past dates are disabled/not selectable
- Dates without schedules show appropriate message
- Race conditions are handled gracefully
- User is informed of conflicts

---

## E2E Test Suite 3: Appointment Management Journey

### User Story Coverage
- **US-012:** As a Patient, I want to view my upcoming appointments
- **US-013:** As a Patient, I want to view my past appointments
- **US-014:** As a Patient, I want to cancel an upcoming appointment
- **US-016:** As a Doctor, I want to view all my appointments

### Test Scenario E2E-007: View and Cancel Appointments

**Preconditions:**
- Patient is logged in
- Patient has at least one upcoming appointment

**Test Steps:**
1. Navigate to "My Appointments" page
2. Verify appointments are displayed in two sections:
   - Upcoming Appointments
   - Past Appointments
3. Locate the upcoming appointment
4. Verify appointment card shows:
   - Doctor name
   - Date
   - Time
   - Status: "Booked"
   - Cancel button
5. Click "Cancel" button on an appointment
6. Verify confirmation dialog appears: "Are you sure you want to cancel this appointment?"
7. Click "Confirm"
8. Wait for cancellation to complete
9. Verify success message: "Appointment cancelled successfully"
10. Verify appointment status changes to "Cancelled"
11. Verify cancelled appointment moves to past appointments section
12. Attempt to cancel the same appointment again
13. Verify error: "This appointment is already cancelled"

**Expected Results:**
- Appointments are correctly categorized
- Cancellation requires confirmation
- Status updates immediately in UI
- Database reflects cancellation
- Cannot cancel already cancelled appointments
- Cannot cancel past appointments

**Validation Points:**
- HTTP Status: 200 OK for cancellation API
- Database: Appointment status updated to "cancelled"
- UI: Appointment list refreshes automatically
- UI: Cancel button disabled for cancelled appointments

---

### Test Scenario E2E-008: Doctor View Appointments

**Preconditions:**
- User is logged in as doctor
- Doctor has appointments (upcoming and past)

**Test Steps:**
1. Navigate to doctor dashboard
2. Verify "My Appointments" section displays appointment count
3. Click "View All Appointments"
4. Verify appointments are listed with patient details:
   - Patient name
   - Date
   - Time
   - Status
5. Use date filter to view today's appointments
6. Verify only today's appointments are shown
7. Use status filter to view "Booked" appointments
8. Verify only booked appointments are shown
9. Clear filters
10. Verify all appointments are shown again

**Expected Results:**
- Doctor sees all their appointments
- Filters work correctly
- Patient information is visible
- Appointments are sorted by date
- Doctor can distinguish between upcoming and past

---

## E2E Test Suite 4: Doctor Schedule Management Journey

### User Story Coverage
- **US-018:** As a Doctor, I want to create my availability schedule
- **US-019:** As a Doctor, I want to set recurring weekly schedules
- **US-020:** As a Doctor, I want to be prevented from creating conflicting time slots

### Test Scenario E2E-009: Create Doctor Schedule

**Preconditions:**
- User is logged in as doctor

**Test Steps:**
1. Navigate to doctor dashboard
2. Click "Manage Schedule"
3. Click "Add New Schedule"
4. Select date: 7 days in the future
5. Select time slot: "10:00-11:00"
6. Check "Repeat Weekly" checkbox
7. Click "Create Schedule"
8. Verify success message: "Schedule created for 12 weeks"
9. Navigate to schedule view
10. Verify 12 weekly schedules are created
11. Attempt to create overlapping schedule (same date and time)
12. Verify error: "Schedule conflicts with existing time slot"

**Expected Results:**
- Schedule creation works smoothly
- Recurring schedules generate multiple entries
- Conflict detection prevents double-booking
- UI displays all created schedules

---

## E2E Test Suite 5: Cross-Role Integration Journey

### Test Scenario E2E-010: Complete Healthcare Workflow

**Description:** This scenario tests the complete flow from doctor creating schedule to patient booking and doctor viewing the booking.

**Preconditions:**
- Test doctor account exists
- Test patient account exists

**Test Steps:**

**Part 1: Doctor Creates Schedule**
1. Login as doctor
2. Navigate to schedule management
3. Create schedule for tomorrow at 10:00-11:00
4. Verify schedule is created
5. Logout

**Part 2: Patient Books Appointment**
6. Login as patient
7. Navigate to "Book Appointment"
8. Search and select the test doctor
9. Select tomorrow's date
10. Select 10:00-11:00 time slot
11. Complete booking
12. Verify confirmation
13. Logout

**Part 3: Doctor Views Appointment**
14. Login as doctor
15. Navigate to "My Appointments"
16. Verify the new appointment appears
17. Verify patient name is visible
18. Verify appointment details are correct

**Expected Results:**
- End-to-end workflow completes without errors
- Data consistency across roles
- Real-time updates reflect in both interfaces
- All validation rules are enforced

**Validation Points:**
- Schedule correctly created in database
- Appointment correctly links patient and doctor
- Both user interfaces display accurate information
- Database maintains referential integrity

---

## Test Execution Guidelines

### Setup Instructions
1. Deploy application to test environment
2. Reset test database to known state
3. Seed test data (doctors, schedules)
4. Configure test user credentials

### Test Data Requirements
- At least 5 test doctors with different specialties
- At least 10 available schedule slots
- Test patient and doctor accounts with known credentials

### Cleanup Procedures
- After each test suite, clean up created appointments
- Reset test user data between major test runs
- Verify database constraints remain intact

### Reporting
- Capture screenshots on failure
- Record network activity for debugging
- Log all API requests and responses
- Generate HTML test report with pass/fail status

---

## Performance Considerations

### Expected Response Times
- Page load: < 2 seconds
- API responses: < 500ms
- Search/filter operations: < 300ms
- Booking confirmation: < 1 second

### Concurrent User Testing
- Simulate 10 concurrent users booking appointments
- Verify no race conditions occur
- Verify all bookings are processed correctly
- Measure system performance under load

---

## Accessibility Testing (WCAG 2.1)

### Keyboard Navigation
- All forms navigable via Tab key
- Submit buttons activatable via Enter
- Dropdowns accessible via arrow keys

### Screen Reader Compatibility
- Form labels properly associated
- Error messages announced
- Success confirmations announced
- Dynamic content changes announced

### Visual Accessibility
- Color contrast meets AA standards
- Text remains readable at 200% zoom
- Focus indicators visible
- Forms usable without color alone

---

## Security Testing Scenarios

### Authentication Security
- Verify JWT tokens expire appropriately
- Test session timeout after inactivity
- Verify logout clears session completely
- Test CSRF protection on state-changing operations

### Authorization Security
- Patient cannot access doctor-only endpoints
- Patient cannot view other patients' appointments
- Patient cannot modify other users' data
- Doctor cannot access admin functions

### Input Validation
- SQL injection attempts blocked
- XSS attempts sanitized
- File upload restrictions enforced
- Rate limiting on API endpoints

---

## Browser Compatibility Matrix

Test all scenarios on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Test Automation Structure

```
tests/e2e/
├── fixtures/
│   ├── users.json          # Test user data
│   └── doctors.json        # Test doctor data
├── pages/
│   ├── LoginPage.js        # Page Object Model
│   ├── RegisterPage.js
│   ├── DashboardPage.js
│   └── BookAppointmentPage.js
├── scenarios/
│   ├── patient-journey.spec.js
│   ├── doctor-journey.spec.js
│   └── booking-workflow.spec.js
├── helpers/
│   ├── auth.js            # Authentication helpers
│   └── api.js             # API interaction helpers
└── playwright.config.js   # Test configuration
```

---

## Continuous Integration

### CI Pipeline Steps
1. Deploy to test environment
2. Run database migrations
3. Seed test data
4. Execute E2E test suite
5. Generate test report
6. Cleanup test data
7. Notify team of results

### Test Execution Schedule
- Run full E2E suite on every PR to main
- Run smoke tests on every commit
- Run extended tests nightly
- Run performance tests weekly

---

**Document Version:** 1.0  
**Last Updated:** December 10, 2025  
**Owner:** QA Team
