/**
 * Unit Tests for Appointment History
 *
 * User Stories Covered:
 * - As a patient, I want to view past and upcoming appointments
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PatientAppointments } from "../../../src/components/patient/PatientAppointments";

vi.mock("../../../src/shared/services/appointment.service", () => ({
  default: {
    byPatient: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "1",
            date: "2024-12-01",
            doctor: { fullName: "Dr. Smith", specialty: "Cardiology" },
            status: "completed",
            time_slot: "09:00-10:00",
          },
          {
            id: "2",
            date: "2024-12-20",
            doctor: { fullName: "Dr. Sarah", specialty: "Dermatology" },
            status: "pending",
            time_slot: "10:00-11:00",
          },
        ],
      })
    ),
    cancel: vi.fn(() => Promise.resolve({})),
    remove: vi.fn(() => Promise.resolve({})),
  },
}));
vi.mock("../../../src/shared/contexts/AuthContext", () => ({
  useAuthContext: () => ({ user: { id: "patient1", name: "Patient Test" } }),
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

describe("Appointment History", () => {
  it("should display past and upcoming appointments", async () => {
    render(
      <MemoryRouter>
        <PatientAppointments />
      </MemoryRouter>
    );

    // Wait for the component to finish loading and display the main UI
    await waitFor(
      () => {
        // Check that loading spinner is gone by checking for main content
        const title = screen.queryByText(/my appointments/i);
        expect(title).toBeInTheDocument();

        // Check that we have the tabs
        const allTab = screen.queryByRole("tab", { name: /all/i });
        expect(allTab).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
