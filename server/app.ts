import express from 'express';
import { pool } from './db/pool.js';
import authRouter from './auth/routes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'ybgp-websites-api' });
});

app.get('/api/health/db', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed');
    response.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError) {
    response.status(400).json({ error: 'Invalid JSON request body' });
    return;
  }
  console.error('Unhandled API error');
  response.status(500).json({ error: 'Internal server error' });
});

export default app;
