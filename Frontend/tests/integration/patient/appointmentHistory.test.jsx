import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '../msw/server';
import { BrowserRouter } from 'react-router-dom';
import MyAppointments from '../../../src/pages/MyAppointments';

describe('Integration: Appointment History', () => {
  it('shows upcoming and past appointments', async () => {
    server.use(
      rest.get('/api/appointments', (req, res, ctx) =>
        res(
          ctx.json({
            upcoming: [{ id: '1', doctor: 'Dr. John' }],
            past: [{ id: '2', doctor: 'Dr. Jane' }],
          })
        )
      )
    );

    render(
      <BrowserRouter>
        <MyAppointments />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dr. John')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jane')).toBeInTheDocument();
    });
  });
});
