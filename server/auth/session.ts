import { createHash, randomBytes } from 'node:crypto';
import type { RowDataPacket } from 'mysql2';
import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';

export const SESSION_COOKIE_NAME = 'ybgp_session';
export const ADMIN_SESSION_COOKIE_NAME = 'ybgp_admin_session';
export const OWNER_SESSION_COOKIE_NAME = 'ybgp_owner_session';
export const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

interface SessionRow extends RowDataPacket {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
}

const hashSessionId = (sessionId: string): string =>
  createHash('sha256').update(sessionId, 'utf8').digest('hex');

const readCookie = (request: Request, cookieName: string): string | null => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === cookieName) {
      const value = part.slice(separator + 1).trim();
      return /^[a-f\d]{64}$/i.test(value) ? value : null;
    }
  }

  return null;
};

const sessionCookieName = (role: 'SUPER_ADMIN' | 'BUSINESS_OWNER'): string =>
  role === 'SUPER_ADMIN' ? ADMIN_SESSION_COOKIE_NAME : OWNER_SESSION_COOKIE_NAME;

export const getRoleSessionId = (
  request: Request,
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER'
): string | null => readCookie(request, sessionCookieName(role));

export const getLegacySessionId = (request: Request): string | null =>
  readCookie(request, SESSION_COOKIE_NAME);

export const getSessionId = (
  request: Request,
  role?: 'SUPER_ADMIN' | 'BUSINESS_OWNER'
): string | null => {
  if (role) {
    return getRoleSessionId(request, role) ?? readCookie(request, SESSION_COOKIE_NAME);
  }
  return readCookie(request, ADMIN_SESSION_COOKIE_NAME) ??
    readCookie(request, OWNER_SESSION_COOKIE_NAME) ??
    readCookie(request, SESSION_COOKIE_NAME);
};

export const createSession = async (
  userId: string,
  previousSessionId: string | null,
  legacySessionId: string | null = null
): Promise<{ sessionId: string; expiresAt: Date }> => {
  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (previousSessionId) {
      await connection.execute(
        'DELETE FROM sessions WHERE id = ?',
        [hashSessionId(previousSessionId)]
      );
    }
    if (legacySessionId && legacySessionId !== previousSessionId) {
      await connection.execute(
        'DELETE FROM sessions WHERE id = ?',
        [hashSessionId(legacySessionId)]
      );
    }

    await connection.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [hashSessionId(sessionId), userId, expiresAt]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return { sessionId, expiresAt };
};

export const getSessionUser = async (sessionId: string): Promise<SessionRow | null> => {
  const [rows] = await pool.execute<SessionRow[]>(
    `SELECT u.id, u.name, u.email, u.role
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > UTC_TIMESTAMP(3)
     LIMIT 1`,
    [hashSessionId(sessionId)]
  );

  return rows[0] ?? null;
};

export const invalidateSession = async (sessionId: string | null): Promise<void> => {
  if (!sessionId) return;
  await pool.execute('DELETE FROM sessions WHERE id = ?', [hashSessionId(sessionId)]);
};

export const setSessionCookie = (
  response: Response,
  sessionId: string,
  expiresAt: Date,
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER'
): void => {
  response.cookie(sessionCookieName(role), sessionId, {
    ...cookieOptions,
    expires: expiresAt,
  });
  clearLegacySessionCookie(response);
};

export const clearSessionCookie = (
  response: Response,
  role: 'SUPER_ADMIN' | 'BUSINESS_OWNER'
): void => {
  response.clearCookie(sessionCookieName(role), cookieOptions);
};

export const clearLegacySessionCookie = (response: Response): void => {
  response.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
};

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
