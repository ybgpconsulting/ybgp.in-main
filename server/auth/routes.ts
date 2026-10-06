import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  clearSessionCookie,
  createSession,
  getSessionId,
  invalidateSession,
  isProduction,
  setSessionCookie,
} from './session.js';
import {
  requireAuth,
  requireBusinessAccess,
  requireRole,
  type AuthenticatedUser,
  type UserRole,
} from './middleware.js';

const router = Router();

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const userResponse = (user: AuthenticatedUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

router.post('/login', async (request, response) => {
  const body: unknown = request.body;
  if (
    !isRecord(body) ||
    typeof body.email !== 'string' ||
    typeof body.password !== 'string' ||
    body.email.length > 254 ||
    body.password.length === 0 ||
    body.password.length > 1024
  ) {
    response.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const email = body.email.trim().toLowerCase();
  const password = body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  const user = rows[0];
  const passwordIsValid = user
    ? await verifyPassword(password, user.password_hash)
    : (await hashPassword(password), false);

  if (!user || !passwordIsValid) {
    response.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const session = await createSession(user.id, getSessionId(request));
  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  setSessionCookie(response, session.sessionId, session.expiresAt);
  response.status(200).json({ user: userResponse(authenticatedUser) });
});

router.get('/me', requireAuth, (request, response) => {
  response.json({ user: userResponse(request.user!) });
});

router.post('/logout', async (request, response) => {
  await invalidateSession(getSessionId(request));
  clearSessionCookie(response);
  response.json({ success: true });
});

if (!isProduction()) {
  router.get('/test/admin', requireAuth, requireRole('SUPER_ADMIN'), (_request, response) => {
    response.json({ authorized: true });
  });

  router.get(
    '/test/business/:id',
    requireAuth,
    requireBusinessAccess(),
    (_request, response) => {
      response.json({ authorized: true });
    }
  );
}

export default router;
