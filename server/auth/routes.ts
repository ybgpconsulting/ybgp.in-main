import { Router, type Request, type Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  clearLegacySessionCookie,
  clearSessionCookie,
  createSession,
  getLegacySessionId,
  getRoleSessionId,
  getSessionId,
  invalidateSession,
  isProduction,
  setSessionCookie,
} from './session.js';
import {
  requireAuth,
  requireBusinessAccess,
  requireRole,
  requireRoleAuth,
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

const handleLogin = async (
  request: Request,
  response: Response,
  expectedRole?: UserRole
): Promise<void> => {
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
  const requestedRole = expectedRole ?? body.role;
  if (requestedRole !== undefined && requestedRole !== 'SUPER_ADMIN' && requestedRole !== 'BUSINESS_OWNER') {
    response.status(400).json({ error: 'Invalid account type' });
    return;
  }
  if (expectedRole && body.role !== undefined && body.role !== expectedRole) {
    response.status(400).json({ error: 'Invalid account type' });
    return;
  }
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

  if (!user || !passwordIsValid || requestedRole !== undefined && user.role !== requestedRole) {
    response.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const session = await createSession(
    user.id,
    getRoleSessionId(request, user.role),
    getLegacySessionId(request)
  );
  const authenticatedUser: AuthenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  setSessionCookie(response, session.sessionId, session.expiresAt, user.role);
  response.status(200).json({ user: userResponse(authenticatedUser) });
};

router.post('/login', (request, response) => handleLogin(request, response));
router.post('/admin/login', (request, response) => handleLogin(request, response, 'SUPER_ADMIN'));
router.post('/business/login', (request, response) => handleLogin(request, response, 'BUSINESS_OWNER'));

router.get('/me', requireAuth, (request, response) => {
  response.json({ user: userResponse(request.user!) });
});

router.get('/admin/me', requireRoleAuth('SUPER_ADMIN'), (request, response) => {
  response.json({ user: userResponse(request.user!) });
});

router.get('/business/me', requireRoleAuth('BUSINESS_OWNER'), (request, response) => {
  response.json({ user: userResponse(request.user!) });
});

router.post('/credentials', requireRoleAuth('SUPER_ADMIN'), async (request, response) => {
  const body: unknown = request.body;
  if (
    !isRecord(body) ||
    typeof body.current_password !== 'string' ||
    typeof body.new_email !== 'string' ||
    typeof body.new_password !== 'string' ||
    body.current_password.length === 0 ||
    body.current_password.length > 1024 ||
    body.new_password.length < 12 ||
    body.new_password.length > 1024
  ) {
    response.status(400).json({ error: 'Current password, a valid new email, and a new password of at least 12 characters are required' });
    return;
  }

  const newEmail = body.new_email.trim().toLowerCase();
  if (newEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    response.status(400).json({ error: 'Enter a valid email address' });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<Array<RowDataPacket & { password_hash: string }>>(
      'SELECT password_hash FROM users WHERE id = ? AND role = "SUPER_ADMIN" FOR UPDATE',
      [request.user!.id]
    );
    const user = rows[0];
    if (!user || !await verifyPassword(body.current_password, user.password_hash)) {
      await connection.rollback();
      response.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const passwordHash = await hashPassword(body.new_password);
    await connection.execute(
      'UPDATE users SET email = ?, password_hash = ? WHERE id = ? AND role = "SUPER_ADMIN"',
      [newEmail, passwordHash, request.user!.id]
    );
    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [request.user!.id]);
    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('Admin credential transaction rollback failed', rollbackError);
    }
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      response.status(409).json({ error: 'That email address is already in use' });
      return;
    }
    throw error;
  } finally {
    connection.release();
  }

  clearSessionCookie(response, 'SUPER_ADMIN');
  clearLegacySessionCookie(response);
  response.json({ success: true, message: 'Credentials updated. Sign in again with your new email and password.' });
});

const handleLogout = async (
  request: Request,
  response: Response,
  expectedRole?: UserRole
): Promise<void> => {
  const body: unknown = request.body;
  const role = expectedRole ?? (isRecord(body) ? body.role : undefined);
  if (role !== 'SUPER_ADMIN' && role !== 'BUSINESS_OWNER') {
    response.status(400).json({ error: 'A session role is required' });
    return;
  }
  await invalidateSession(getSessionId(request, role));
  clearSessionCookie(response, role);
  clearLegacySessionCookie(response);
  response.json({ success: true });
};

router.post('/logout', (request, response) => handleLogout(request, response));
router.post('/admin/logout', (request, response) => handleLogout(request, response, 'SUPER_ADMIN'));
router.post('/business/logout', (request, response) => handleLogout(request, response, 'BUSINESS_OWNER'));

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
