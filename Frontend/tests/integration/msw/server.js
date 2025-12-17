import { setupServer } from 'msw/node';
import { handlers } from './handlers.js'; // make sure to add .js

export const server = setupServer(...handlers);
