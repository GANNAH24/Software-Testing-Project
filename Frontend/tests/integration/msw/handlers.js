import { rest } from 'msw';

export const handlers = [
  rest.get('/api/patients/:id/appointments', (req, res, ctx) => {
    const { id } = req.params;
    if (id === '123') {
      return res(
        ctx.status(200),
        ctx.json([
          { id: '1', date: '2024-12-20', doctor: { fullName: 'Dr. John' }, status: 'pending', time_slot: '10:00-11:00' },
          { id: '2', date: '2024-12-01', doctor: { fullName: 'Dr. Jane' }, status: 'completed', time_slot: '09:00-10:00' },
        ])
      );
    }
    return res(ctx.status(404));
  }),
];
