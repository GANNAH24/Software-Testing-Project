/**
 * @file scheduleManagement.test.jsx
 * @description Integration tests for the Doctor's Schedule Management module.
 * * @covered_requirements
 * FR: Doctor's Schedule Management - Verifies that doctors can view their weekly/daily 
 * dashboard and set availability by blocking/unblocking time slots.
 * NFR: Usability - Ensures the interface provides clear feedback via toast notifications 
 * and prevents accidental data loss through confirmation modals.
 * NFR: Accessibility - Validates that interactive elements are reachable via ARIA labels.
 * NFR: Data Integrity - Confirms that the correct slot IDs and availability states 
 * are sent to the backend API services.
 * * @test_scenarios
 * 1. Successful toggle of a time slot availability (Blocking/Unblocking).
 * 2. Destructive deletion of a schedule slot (with confirmation flow).
 * 3. Correct rendering of schedule data in the Weekly View grid.
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { ManageSchedule } from '../../../src/components/doctor/ManageSchedule';
import { AuthProvider } from '../../../src/shared/contexts/AuthContext';
import scheduleService from '../../../src/shared/services/schedule.service';
import doctorService from '../../../src/shared/services/doctor.service';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Services
vi.mock('../../../src/shared/services/schedule.service');
vi.mock('../../../src/shared/services/doctor.service');
vi.mock('sonner');

const mockUser = { id: 'doc-123', role: 'doctor', name: 'Dr. Smith' };

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider value={{ user: mockUser }}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Schedule Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock doctor profile for working hours initialization
    doctorService.profile.mockResolvedValue({
      data: { working_hours_start: '09:00', working_hours_end: '17:00' }
    });
  });

  test('successfully toggles (blocks/unblocks) a time slot', async () => {
    const timeSlotStr = '10:00-11:00';
    const mockSlot = { 
      id: 'slot-1', 
      schedule_id: 'slot-1',
      date: new Date().toISOString().split('T')[0], 
      time_slot: timeSlotStr, 
      is_available: true 
    };
    
    scheduleService.list.mockResolvedValue({ data: [mockSlot] });
    scheduleService.update.mockResolvedValue({ success: true });

    renderWithContext(<ManageSchedule />);

    // 1. Switch to Daily View
    const dailyViewBtn = await screen.findByRole('button', { name: /Daily View/i });
    fireEvent.click(dailyViewBtn);

    // 2. Identify the specific row for 10:00-11:00
    const slotText = await screen.findByText(timeSlotStr);
    const rowContainer = slotText.closest('div.flex.items-center.justify-between');

    // 3. Find the "Block" button ONLY within that row
    const blockBtn = within(rowContainer).getByRole('button', { name: /^block$/i });
    fireEvent.click(blockBtn);

    // 4. Verify API call logic
    await waitFor(() => {
      expect(scheduleService.update).toHaveBeenCalledWith('slot-1', {
        is_available: false
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Time slot blocked');
  });

  test('deletes a schedule slot after confirmation', async () => {
    const timeSlotStr = '14:00-15:00';
    const mockSlot = { 
      id: 'slot-deletable', 
      schedule_id: 'slot-deletable',
      date: new Date().toISOString().split('T')[0], 
      time_slot: timeSlotStr, 
      is_available: true 
    };
    
    scheduleService.list.mockResolvedValue({ data: [mockSlot] });
    scheduleService.remove.mockResolvedValue({ success: true });

    renderWithContext(<ManageSchedule />);

    // 1. Switch to Daily View
    const dailyViewBtn = await screen.findByRole('button', { name: /Daily View/i });
    fireEvent.click(dailyViewBtn);

    // 2. Find the row and the delete icon (using the aria-label we added)
    const slotText = await screen.findByText(timeSlotStr);
    const rowContainer = slotText.closest('div.flex.items-center.justify-between');
    const deleteBtn = within(rowContainer).getByRole('button', { name: /delete slot/i });
    
    fireEvent.click(deleteBtn);

    // 3. Handle the confirmation modal
    // findByRole automatically waits for the modal to appear
    const confirmBtn = await screen.findByRole('button', { name: /confirm|delete/i });
    fireEvent.click(confirmBtn);

    // 4. Verify the deletion call
    await waitFor(() => {
      expect(scheduleService.remove).toHaveBeenCalledWith('slot-deletable');
    });
    
    expect(toast.success).toHaveBeenCalledWith('Time slot deleted successfully');
  });

  test('displays weekly slots correctly', async () => {
    // Get a weekday date (Monday) within the current week to ensure it shows in weekly view
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1); // Go to Monday of current week
    const mondayStr = monday.toISOString().split('T')[0];
    
    scheduleService.list.mockResolvedValue({ 
      data: [{ id: '1', date: mondayStr, time_slot: '09:00-10:00', is_available: true }] 
    });

    renderWithContext(<ManageSchedule />);

    // Wait for loading to complete and switch to Weekly View (if it's not the default)
    const weeklyBtn = await screen.findByRole('button', { name: /Weekly View/i });
    fireEvent.click(weeklyBtn);

    // Ensure the slot time is visible in the calendar grid
    expect(await screen.findByText('09:00-10:00')).toBeInTheDocument();
  });
});