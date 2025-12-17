import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '../msw/server';
import AdminDoctors from '../../../src/pages/admin/Doctors';


describe('Integration: Admin Doctor Management', () => {
  it('allows admin to add and delete doctor profiles', async () => {
    server.use(
      rest.post('/api/doctors', (req, res, ctx) =>
        res(ctx.json({ id: 'doc-9', name: 'Dr. New' }))
      ),
      rest.delete('/api/doctors/doc-9', (req, res, ctx) =>
        res(ctx.status(200))
      )
    );

    render(<AdminDoctors />);

    fireEvent.click(screen.getByText(/add doctor/i));
    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: 'Dr. New' },
    });
    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText('Dr. New')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(screen.queryByText('Dr. New')).not.toBeInTheDocument();
    });
  });
});
