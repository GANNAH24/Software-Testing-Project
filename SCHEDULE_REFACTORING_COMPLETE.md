# Schedule Management Refactoring - Complete Implementation

## Overview
The Schedule Management feature has been refactored to implement a Layered Architecture with proper separation of concerns, dynamic working hours filtering, and improved UX patterns.

## ✅ Implemented Requirements

### 1. Dynamic "Working Hours" Constraint ✅

**Implementation:**
- `ManageSchedule.jsx` now fetches doctor profile on mount via `fetchDoctorProfile()`
- Working hours are retrieved from the backend doctor profile API: `doctorService.profile(user.id)`
- Default working hours: 9 AM - 5 PM (if not set in profile)
- Working hours state: `workingHours: { start: "09:00", end: "17:00" }`

**Time Slot Filtering:**
- `ScheduleModal.jsx` receives `workingHours` prop
- `generateTimeSlots()` function dynamically creates slots only within working hours range
- Example: If working hours are 9 AM - 5 PM, only slots from 09:00-10:00 through 16:00-17:00 are shown
- Slots outside working hours are never displayed in the UI

**Profile Integration:**
- The system calls `initializeData()` which fetches both schedules and profile
- If profile updates working hours, the modal will reflect changes on next open
- Falls back to default hours (8 AM - 5 PM) if profile fetch fails

**Code Location:**
```javascript
// ManageSchedule.jsx
async function fetchDoctorProfile() {
  const response = await doctorService.profile(user.id);
  const doctorData = response?.data || response;
  
  if (doctorData?.working_hours_start && doctorData?.working_hours_end) {
    setWorkingHours({
      start: doctorData.working_hours_start,
      end: doctorData.working_hours_end
    });
  }
}

// ScheduleModal.jsx
const generateTimeSlots = () => {
  const startHour = parseInt(workingHours.start.split(':')[0]);
  const endHour = parseInt(workingHours.end.split(':')[0]);
  return generateSlotsInRange(startHour, endHour);
};
```

---

### 2. "Create Schedule" Modal (Wizard Pattern) ✅

**Component:** `ScheduleModal.jsx`

**Features:**
- **Modal Popup:** Uses Dialog component instead of full page navigation
- **Step 1 - Calendar View:**
  - Interactive calendar with month navigation
  - **Multi-Select:** Click multiple dates to apply same schedule to all
  - Visual feedback: Selected dates highlighted in blue with scale effect
  - Prevents past date selection with validation
  - Shows count of selected dates
  
- **Step 2 - Time Slot Selection:**
  - Maintains AM/PM split layout (Morning/Afternoon sections)
  - **Dynamic Filtering:** Only shows slots within working hours
  - Time slots displayed with formatted 12-hour time (e.g., "9:00 AM - 10:00 AM")
  - Multi-select with visual toggle (blue background when selected)
  - Shows preview: "X time slots for Y dates = Z total schedules"

**Backend Integration:**
- On confirm, sends POST requests via `scheduleService.create()` for each date + time slot combination
- Creates `date × time_slots` total schedules
- Includes `day_of_week` enum for each schedule
- All slots created with `is_available: true`

**User Flow:**
1. Click "Create Schedule" button
2. Select multiple dates from calendar → Continue
3. Select time slots (filtered by working hours) → Confirm
4. System creates all schedule combinations asynchronously
5. Success toast shows total schedules created
6. Modal closes and schedule list refreshes

---

### 3. "Block Time" Override Feature ✅

**Component:** `BlockTimeModal.jsx`

**Features:**
- **Dedicated Button:** "Block Time" button in header (Lock icon)
- **Date Selection:** Date picker with minimum date = today
- **Time Range Selection:** 
  - Start time and End time dropdowns (every hour 00:00-23:00)
  - Validation: End time must be after start time
- **Optional Reason:** Textarea for vacation, emergency, conference, etc.
- **Preview:** Shows formatted summary before confirmation

**Backend Action:**
- Creates schedule records with `is_available: false` (BLOCKED status)
- Creates one schedule per hour in the selected range
- Example: Block 09:00-12:00 creates 3 schedules (09:00-10:00, 10:00-11:00, 11:00-12:00)
- Stores optional reason in `notes` field
- **Override Behavior:** These blocked slots take precedence over recurring availability

**Database Structure:**
```javascript
{
  date: "2025-12-10",
  time_slot: "09:00-10:00",
  is_available: false,  // BLOCKED
  day_of_week: "TUESDAY",
  notes: "Vacation"
}
```

**Use Cases:**
- Vacation blocking (multiple days/hours)
- Emergency unavailability
- Conference attendance
- Personal appointments
- Public holidays

---

### 4. Delete Confirmation Dialog ✅

**Component:** `DeleteConfirmationModal.jsx`

**Features:**
- **Centralized Confirmation:** Reusable modal for all delete operations
- **Visual Alert:** Warning triangle icon in red
- **Customizable:**
  - Dynamic title
  - Dynamic message
  - Loading state during deletion
- **Two-Step Protection:** 
  1. Click delete button → Opens modal
  2. Click "Yes, Delete" → Executes deletion

**Integration in ManageSchedule:**

**Single Slot Deletion:**
```javascript
handleDeleteSlotClick(slotId, date) → 
  Opens modal with message: "Are you sure you want to remove this slot?"
```

**Bulk Deletion (All Day Slots):**
```javascript
handleDeleteAllForDayClick(date) → 
  Opens modal with message: "Delete all X slot(s) for MM/DD/YYYY?"
```

**Deletion Flow:**
1. User clicks trash icon
2. `DeleteConfirmationModal` opens centered
3. User reads confirmation message
4. Options:
   - "Cancel" → Closes modal, no action
   - "Yes, Delete" → Calls `confirmDelete()` → API call → Refresh
5. Loading spinner during API call
6. Success toast on completion

**UX Improvements:**
- Prevents accidental deletions
- Provides context (date, count) in message
- Clear visual hierarchy (red for danger)
- Accessible keyboard navigation
- Non-blocking (can cancel anytime)

---

## Architecture & Layered Design

### Service Layer
**Purpose:** Abstract backend API calls

**Files:**
- `scheduleService.js`: All schedule CRUD operations
- `doctorService.js`: Doctor profile and working hours
- `apiClient.js`: HTTP client with interceptors

**Benefits:**
- Single source of truth for API endpoints
- Easy to mock for testing
- Consistent error handling
- Token management in one place

### Component Layer
**Purpose:** UI and user interaction logic

**Components:**
1. **ScheduleModal** - Create schedules with filtering
2. **BlockTimeModal** - Mark time as unavailable
3. **DeleteConfirmationModal** - Confirm destructive actions
4. **ManageSchedule** - Main dashboard coordinator

**Responsibilities:**
- State management (useState, useEffect)
- User input validation
- API calls via service layer
- UI rendering and styling
- Toast notifications

### Data Flow
```
User Interaction
    ↓
Component State Update
    ↓
Service Layer Call
    ↓
Backend API (via apiClient)
    ↓
Response Handling
    ↓
UI Update + Toast Notification
```

---

## Key Design Patterns

### 1. **Prop Drilling for Configuration**
```javascript
<ScheduleModal 
  workingHours={workingHours}  // Dynamic config
  open={showScheduleModal}
  onOpenChange={setShowScheduleModal}
  onSuccess={fetchSchedules}  // Callback pattern
/>
```

### 2. **Callback Pattern**
- Parent passes `onSuccess` callback to children
- Children call callback after successful operation
- Parent refreshes data (single source of truth)

### 3. **Controlled Components**
- Modal visibility controlled by parent state
- Form inputs controlled by local state
- Single direction data flow

### 4. **Progressive Disclosure**
- Step 1: Date selection (simple)
- Step 2: Time slot selection (complex)
- Guided workflow with "Back" navigation

### 5. **Optimistic Updates**
- Toast immediately on action
- Backend call async
- UI refreshes on success
- Error toast if fails

---

## API Endpoints Used

### Schedule Service
```javascript
scheduleService.list()              // GET /schedules
scheduleService.create(data)        // POST /schedules
scheduleService.update(id, data)    // PUT /schedules/:id
scheduleService.remove(id)          // DELETE /schedules/:id
```

### Doctor Service
```javascript
doctorService.profile(userId)       // GET /doctors/:id/profile
```

---

## Database Schema Expectations

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(doctor_id),
  date DATE NOT NULL,
  time_slot VARCHAR(11) NOT NULL,  -- "HH:mm-HH:mm"
  is_available BOOLEAN DEFAULT true,
  day_of_week VARCHAR(10),  -- ENUM
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE doctors (
  doctor_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  working_hours_start TIME,  -- "09:00"
  working_hours_end TIME,    -- "17:00"
  ...
);
```

---

## Testing Scenarios

### Scenario 1: Working Hours Filtering
1. Set doctor working hours to 10 AM - 3 PM in profile
2. Open "Create Schedule" modal
3. **Expected:** Only see time slots 10:00-11:00, 11:00-12:00, 12:00-13:00, 13:00-14:00, 14:00-15:00
4. **Not shown:** 8 AM, 9 AM, 4 PM, 5 PM slots

### Scenario 2: Multi-Date Schedule Creation
1. Open "Create Schedule" modal
2. Select Dec 10, Dec 12, Dec 15 (3 dates)
3. Continue to time slots
4. Select 09:00-10:00 and 14:00-15:00 (2 slots)
5. Confirm
6. **Expected:** 6 schedules created (3 dates × 2 slots)

### Scenario 3: Block Time Override
1. Create schedule for Dec 10 at 09:00-10:00 (Available)
2. Click "Block Time"
3. Select Dec 10, 09:00-10:00
4. Confirm
5. **Expected:** Dec 10 09:00-10:00 now shows as "Blocked" (Unavailable)

### Scenario 4: Delete Confirmation
1. Click delete icon on any time slot
2. **Expected:** Modal appears with confirmation
3. Click "Cancel"
4. **Expected:** Modal closes, slot still exists
5. Click delete again
6. Click "Yes, Delete"
7. **Expected:** Slot deleted, success toast shown

---

## File Structure

```
Frontend/src/components/doctor/
├── ManageSchedule.jsx           # Main dashboard (coordinator)
├── ScheduleModal.jsx            # Create schedules (new)
├── BlockTimeModal.jsx           # Block time feature (new)
├── DeleteConfirmationModal.jsx  # Delete confirmation (new)
├── ScheduleWizard.jsx          # Old component (deprecated)
└── DayTabs.jsx                  # Day view component

Frontend/src/shared/services/
├── schedule.service.js          # Schedule API calls
├── doctor.service.js            # Doctor API calls
└── api.service.js               # HTTP client
```

---

## Migration Notes

### Breaking Changes
- `ScheduleWizard` component replaced by `ScheduleModal`
- Modal-based flow instead of page navigation
- Working hours now required from backend

### Backward Compatibility
- Falls back to default hours (8 AM - 5 PM) if profile fetch fails
- Existing schedules continue to work
- No database migration needed

### Future Enhancements
1. **Recurring Patterns:** Allow "every Monday" instead of date-by-date
2. **Bulk Block:** Block entire weeks/months for vacation
3. **Working Hours Editor:** In-app UI to edit working hours
4. **Conflict Detection:** Warn if creating overlapping schedules
5. **Schedule Templates:** Save common patterns for reuse

---

## Benefits of Refactoring

### For Doctors
- ✅ Faster schedule creation (modal instead of page)
- ✅ Multi-date selection (batch operations)
- ✅ Visual calendar (easier date picking)
- ✅ Filtered time slots (no confusion with invalid hours)
- ✅ Block time for emergencies
- ✅ Safety net (delete confirmation)

### For Developers
- ✅ Layered architecture (testable)
- ✅ Reusable components
- ✅ Single responsibility principle
- ✅ Consistent API patterns
- ✅ Type-safe props (via JSDoc)
- ✅ Easy to extend

### For System
- ✅ Better separation of concerns
- ✅ Reduced API calls (batch creates)
- ✅ Proper state management
- ✅ Error handling at each layer
- ✅ Scalable architecture

---

## Conclusion

The refactored Schedule Management system successfully implements all 4 requirements with a clean, maintainable architecture. The modal-based workflow improves UX, working hours filtering prevents errors, block time provides flexibility, and delete confirmation adds safety. The layered design ensures testability and future extensibility.
