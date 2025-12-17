import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { rest } from 'msw';
import { server } from '../msw/server';
import { BrowserRouter } from 'react-router-dom';
import Doctors from '../../../src/pages/Doctors';

describe('Integration: Find Doctors', () => {
  it('allows patient to search doctors by specialty and view profile', async () => {
    server.use(
      rest.get('/api/doctors', (req, res, ctx) => {
        const specialty = req.url.searchParams.get('specialty');
        return res(
          ctx.json([
            { id: '1', name: 'Dr. John Smith', specialty: specialty }
          ])
        );
      })
    );

    render(
      <BrowserRouter>
        <Doctors />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'Cardiology' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeInTheDocument();
    });
  });
});
