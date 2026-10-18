import type { NextFunction, Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2';
import { getSessionId, getSessionUser } from './session.js';
import { pool } from '../db/pool.js';

export type UserRole = 'SUPER_ADMIN' | 'BUSINESS_OWNER';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const isAuthenticatedRole = (role: string): role is UserRole =>
  role === 'SUPER_ADMIN' || role === 'BUSINESS_OWNER';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

interface BusinessIdRow extends RowDataPacket {
  id: string;
}

export const requireAuth = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  const sessionIds = [
    getSessionId(request, 'SUPER_ADMIN'),
    getSessionId(request, 'BUSINESS_OWNER'),
  ].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
  let row = null;
  for (const sessionId of sessionIds) {
    row = await getSessionUser(sessionId);
    if (row) break;
  }
  if (!row || !isAuthenticatedRole(row.role)) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  request.user = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
  next();
};

export const requireRoleAuth = (...roles: UserRole[]) => async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  for (const role of roles) {
    const sessionId = getSessionId(request, role);
    if (!sessionId) continue;
    const row = await getSessionUser(sessionId);
    if (!row || row.role !== role) continue;
    request.user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role,
    };
    next();
    return;
  }
  response.status(401).json({ error: 'Authentication required' });
};

export const requireRole = (...roles: UserRole[]) => (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  if (!request.user) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!roles.includes(request.user.role)) {
    response.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
};

export const requireBusinessAccess = (parameterName = 'id') => async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  if (!request.user) {
    response.status(401).json({ error: 'Authentication required' });
    return;
  }

  const businessId = request.params[parameterName];
  if (typeof businessId !== 'string' || !/^[1-9]\d{0,19}$/.test(businessId)) {
    response.status(404).json({ error: 'Business not found' });
    return;
  }

  if (request.user.role === 'SUPER_ADMIN') {
    const [rows] = await pool.execute<BusinessIdRow[]>(
      'SELECT id FROM businesses WHERE id = ? LIMIT 1',
      [businessId]
    );
    if (!rows[0]) {
      response.status(404).json({ error: 'Business not found' });
      return;
    }

    next();
    return;
  }

  const [rows] = await pool.execute<BusinessIdRow[]>(
    `SELECT b.id
     FROM business_users bu
     INNER JOIN businesses b ON b.id = bu.business_id
     WHERE bu.business_id = ? AND bu.user_id = ?
     LIMIT 1`,
    [businessId, request.user.id]
  );

  if (!rows[0]) {
    const [businessRows] = await pool.execute<BusinessIdRow[]>(
      'SELECT id FROM businesses WHERE id = ? LIMIT 1',
      [businessId]
    );
    response.status(businessRows[0] ? 403 : 404).json({
      error: businessRows[0] ? 'Forbidden' : 'Business not found',
    });
    return;
  }

  next();
};
