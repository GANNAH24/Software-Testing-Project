import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '../msw/server';
import DoctorDashboard from '../../../src/pages/doctor/Dashboard';

describe('Integration: Doctor Schedule Management', () => {
  it('allows doctor to set availability and view bookings', async () => {
    server.use(
      rest.post('/api/schedule', (req, res, ctx) =>
        res(ctx.status(200))
      ),
      rest.get('/api/doctor/appointments', (req, res, ctx) =>
        res(ctx.json([{ patient: 'Patient A', time: '10:00' }]))
      )
    );

    render(<DoctorDashboard />);

    fireEvent.click(screen.getByText(/add availability/i));
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText('Patient A')).toBeInTheDocument();
    });
  });
});
