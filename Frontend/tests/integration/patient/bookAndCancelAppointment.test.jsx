import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '../msw/server';
import { BrowserRouter } from 'react-router-dom';
import BookAppointment from '../../../src/pages/BookAppointment';
import MyAppointments from '../../../src/pages/MyAppointments';

describe('Integration: Book & Cancel Appointment', () => {
  it('books then cancels an appointment successfully', async () => {
    server.use(
      rest.post('/api/appointments', (req, res, ctx) =>
        res(ctx.json({ appointment_id: 'apt-1' }))
      ),
      rest.delete('/api/appointments/apt-1', (req, res, ctx) =>
        res(ctx.status(200))
      )
    );

    render(
      <BrowserRouter>
        <BookAppointment />
      </BrowserRouter>
    );

    fireEvent.click(await screen.findByText('Dr. John Smith'));
    fireEvent.click(screen.getByText('10:00 - 11:00'));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() =>
      expect(screen.getByText(/appointment booked/i)).toBeInTheDocument()
    );

    render(
      <BrowserRouter>
        <MyAppointments />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    await waitFor(() =>
      expect(screen.getByText(/appointment cancelled/i)).toBeInTheDocument()
    );
  });
});
