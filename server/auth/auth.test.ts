import '../db/testDatabaseGuard.js';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { RowDataPacket } from 'mysql2';
import app from '../app.js';
import { hashPassword, verifyPassword } from './password.js';
import { ADMIN_SESSION_COOKIE_NAME, OWNER_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from './session.js';
import { pool } from '../db/pool.js';

const demoPassword = 'Ybgp-Dev-Only-6cV9-Qm2X!Local';
const invalidCredentialsResponse = { error: 'Invalid email or password' };
const createdSessionHashes = new Set<string>();
let server: Server;
let baseUrl: string;
let ownerABusinessId: string;
let ownerBBusinessId: string;
let adminCookie: string;
let ownerACookie: string;
let ownerBCookie: string;
let credentialAdminId: string;
let credentialAdminEmail: string;
const credentialAdminPassword = 'Initial-test-admin-password-27!';

interface IdRow extends RowDataPacket {
  id: string;
}

const hashSession = (sessionId: string): string =>
  createHash('sha256').update(sessionId).digest('hex');

const request = (
  path: string,
  options: { method?: string; cookie?: string; body?: unknown; headers?: Record<string, string> } = {}
): Promise<Response> => fetch(`${baseUrl}${path}`, {
  method: options.method ?? 'GET',
  headers: {
    ...(options.cookie ? { cookie: options.cookie } : {}),
    ...(options.body !== undefined ? { 'content-type': 'application/json' } : {}),
    ...options.headers,
  },
  ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
});

test('admin and owner sessions coexist and remain isolated on protected routes', async () => {
  const adminLogin = await login('admin@ybgp.local', demoPassword);
  const ownerLogin = await login('owner@aroma-crumb.demo.test', demoPassword);
  const combinedCookies = `${adminLogin.cookie}; ${ownerLogin.cookie}`;
  const [adminResponse, ownerResponse, wrongRoleResponse, adminMe, ownerMe] = await Promise.all([
    request('/api/admin/businesses', { cookie: combinedCookies }),
    request('/api/business/me', { cookie: combinedCookies }),
    request('/api/admin/businesses', { cookie: ownerLogin.cookie }),
    request('/api/auth/admin/me', { cookie: combinedCookies }),
    request('/api/auth/business/me', { cookie: combinedCookies }),
  ]);

  assert.equal(adminResponse.status, 200);
  assert.equal(ownerResponse.status, 200);
  assert.equal(wrongRoleResponse.status, 401);
  assert.equal(((await adminMe.json()) as { user: { role: string } }).user.role, 'SUPER_ADMIN');
  assert.equal(((await ownerMe.json()) as { user: { role: string } }).user.role, 'BUSINESS_OWNER');

  const ownerLogout = await request('/api/auth/business/logout', {
    method: 'POST',
    cookie: combinedCookies,
  });
  assert.equal(ownerLogout.status, 200);
  assert.equal((await request('/api/business/me', { cookie: combinedCookies })).status, 401);
  assert.equal((await request('/api/admin/businesses', { cookie: combinedCookies })).status, 200);

  const refreshedOwnerLogin = await login('owner@aroma-crumb.demo.test', demoPassword);
  const refreshedCombinedCookies = `${adminLogin.cookie}; ${refreshedOwnerLogin.cookie}`;
  const adminLogout = await request('/api/auth/admin/logout', {
    method: 'POST',
    cookie: refreshedCombinedCookies,
  });
  assert.equal(adminLogout.status, 200);
  assert.equal((await request('/api/admin/businesses', { cookie: refreshedCombinedCookies })).status, 401);
  assert.equal((await request('/api/business/me', { cookie: refreshedCombinedCookies })).status, 200);
});

const login = async (email: string, password: string): Promise<{
  response: Response;
  body: Record<string, unknown>;
  cookie: string;
  sessionId: string;
}> => {
  const expectedRole = email.includes('owner@') || email.includes('demo.test')
    ? 'BUSINESS_OWNER'
    : 'SUPER_ADMIN';
  const response = await request(expectedRole === 'SUPER_ADMIN'
    ? '/api/auth/admin/login'
    : '/api/auth/business/login', {
    method: 'POST',
    body: { email, password },
  });
  const body = await response.json() as Record<string, unknown>;
  const setCookie = response.headers.get('set-cookie') ?? '';
  const cookieName = expectedRole === 'BUSINESS_OWNER'
    ? OWNER_SESSION_COOKIE_NAME
    : ADMIN_SESSION_COOKIE_NAME;
  const cookie = setCookie.match(new RegExp(`${cookieName}=[a-f\\d]{64}`))?.[0] ?? '';
  const prefix = `${cookieName}=`;
  assert.ok(cookie.startsWith(prefix), 'Successful login should set the role-specific session cookie');
  const sessionId = cookie.slice(prefix.length);
  createdSessionHashes.add(hashSession(sessionId));
  return { response, body, cookie, sessionId };
};

before(async () => {
  const [businessRows] = await pool.execute<IdRow[]>(
    `SELECT id FROM businesses
     WHERE slug IN ('aroma-and-crumb', 'maison-gloss')
     ORDER BY slug`
  );
  assert.equal(businessRows.length, 2, 'Run db:migrate and db:seed before the auth tests');

  const [[adminBusiness]] = await pool.execute<IdRow[]>(
    `SELECT id FROM businesses WHERE slug = 'aroma-and-crumb' LIMIT 1`
  );
  const [[ownerBBusiness]] = await pool.execute<IdRow[]>(
    `SELECT id FROM businesses WHERE slug = 'maison-gloss' LIMIT 1`
  );
  assert.ok(adminBusiness && ownerBBusiness);

  ownerABusinessId = adminBusiness.id;
  ownerBBusinessId = ownerBBusiness.id;

  credentialAdminEmail = `credential-test-${randomBytes(8).toString('hex')}@example.test`;
  const [credentialAdminInsert] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "SUPER_ADMIN")',
    ['Credential test admin', credentialAdminEmail, await hashPassword(credentialAdminPassword)]
  );
  credentialAdminId = String((credentialAdminInsert as { insertId: number }).insertId);

  server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await Promise.all(
    [...createdSessionHashes].map((sessionHash) =>
      pool.execute('DELETE FROM sessions WHERE id = ?', [sessionHash])
    )
  );
  await pool.execute('DELETE FROM users WHERE id = ?', [credentialAdminId]);
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  await pool.end();
});

test('hashPassword uses a unique salted scrypt hash and verifyPassword checks it', async () => {
  const firstHash = await hashPassword(demoPassword);
  const secondHash = await hashPassword(demoPassword);

  assert.notEqual(firstHash, secondHash);
  assert.match(firstHash, /^\$scrypt\$/);
  assert.equal(await verifyPassword(demoPassword, firstHash), true);
  assert.equal(await verifyPassword('incorrect-password', firstHash), false);
  assert.equal(await verifyPassword(demoPassword, 'malformed-hash'), false);
});

test('unauthenticated current-user and protected requests return 401', async () => {
  const [me, admin, credentials] = await Promise.all([
    request('/api/auth/me'),
    request('/api/auth/test/admin'),
    request('/api/auth/credentials', {
      method: 'POST',
      body: { current_password: 'current', new_email: 'admin@example.test', new_password: 'new-password-long-enough' },
    }),
  ]);
  assert.equal(me.status, 401);
  assert.equal(admin.status, 401);
  assert.equal(credentials.status, 401);
});

test('valid SUPER_ADMIN login sets a secure HttpOnly session and returns a safe user object', async () => {
  const result = await login(' ADMIN@YBGP.LOCAL ', demoPassword);
  adminCookie = result.cookie;

  assert.equal(result.response.status, 200);
  assert.deepEqual(Object.keys(result.body).sort(), ['user']);
  const user = result.body.user as Record<string, unknown>;
  assert.equal(user.email, 'admin@ybgp.local');
  assert.equal(user.role, 'SUPER_ADMIN');
  assert.ok(user.id);
  assert.ok(user.name);
  assert.equal('password_hash' in user, false);
  assert.equal(JSON.stringify(result.body).includes(result.sessionId), false);

  const setCookie = result.response.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Path=\//i);
  assert.match(setCookie, /Expires=/i);
  assert.equal(/;\s*Secure(?:;|$)/i.test(setCookie), process.env.NODE_ENV === 'production');

  const [rows] = await pool.execute<IdRow[]>(
    'SELECT id FROM sessions WHERE id = ? LIMIT 1',
    [hashSession(result.sessionId)]
  );
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].id, result.sessionId);
});

test('valid BUSINESS_OWNER login succeeds without granting an admin role', async () => {
  const result = await login('owner@aroma-crumb.demo.test', demoPassword);
  ownerACookie = result.cookie;

  assert.equal(result.response.status, 200);
  assert.equal((result.body.user as Record<string, unknown>).role, 'BUSINESS_OWNER');
  assert.equal((await request('/api/auth/test/admin?role=SUPER_ADMIN&user_id=1', {
    cookie: ownerACookie,
  })).status, 403);
  assert.equal((await request('/api/auth/credentials', {
    method: 'POST',
    cookie: ownerACookie,
    body: { current_password: demoPassword, new_email: 'new-admin@example.test', new_password: 'new-admin-password-27!' },
  })).status, 401);
});

test('wrong password and unknown email return the same generic 401 response', async () => {
  const wrongPassword = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@ybgp.local', password: 'not-the-password' },
  });
  const unknownEmail = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'unknown@example.test', password: 'not-the-password' },
  });

  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownEmail.status, 401);
  assert.deepEqual(await wrongPassword.json(), invalidCredentialsResponse);
  assert.deepEqual(await unknownEmail.json(), invalidCredentialsResponse);
  assert.equal(wrongPassword.headers.has('set-cookie'), false);
  assert.equal(unknownEmail.headers.has('set-cookie'), false);
});

test('login validates email and password lengths', async () => {
  const malformedEmail = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'invalid', password: 'sample-password' },
  });
  const oversizedPassword = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@ybgp.local', password: 'x'.repeat(1025) },
  });
  assert.equal(malformedEmail.status, 400);
  assert.equal(oversizedPassword.status, 400);
  const wrongRole = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'owner@aroma-crumb.demo.test', password: demoPassword, role: 'SUPER_ADMIN' },
  });
  assert.equal(wrongRole.status, 401);
  const wrongAdminEndpoint = await request('/api/auth/admin/login', {
    method: 'POST',
    body: { email: 'owner@aroma-crumb.demo.test', password: demoPassword },
  });
  assert.equal(wrongAdminEndpoint.status, 401);
});

test('authenticated /me returns only the server-loaded user fields', async () => {
  const response = await request('/api/auth/me', { cookie: adminCookie });
  const body = await response.json() as Record<string, unknown>;
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys(body.user as object).sort(), ['email', 'id', 'name', 'role']);
  assert.equal(JSON.stringify(body).includes(adminCookie.split('=')[1]), false);
});

test('credential changes reject invalid passwords, incorrect current password, and duplicate email', async () => {
  const credentialLogin = await login(credentialAdminEmail, credentialAdminPassword);
  const invalidPassword = await request('/api/auth/credentials', {
    method: 'POST',
    cookie: credentialLogin.cookie,
    body: {
      current_password: credentialAdminPassword,
      new_email: 'new-admin@example.test',
      new_password: 'too-short',
    },
  });
  const wrongCurrentPassword = await request('/api/auth/credentials', {
    method: 'POST',
    cookie: credentialLogin.cookie,
    body: {
      current_password: 'incorrect-current-password',
      new_email: 'new-admin@example.test',
      new_password: 'Updated-test-admin-password-39!',
    },
  });
  const duplicateEmail = await request('/api/auth/credentials', {
    method: 'POST',
    cookie: credentialLogin.cookie,
    body: {
      current_password: credentialAdminPassword,
      new_email: 'admin@ybgp.local',
      new_password: 'Updated-test-admin-password-39!',
    },
  });

  assert.equal(invalidPassword.status, 400);
  assert.equal(wrongCurrentPassword.status, 401);
  assert.deepEqual(await wrongCurrentPassword.json(), { error: 'Current password is incorrect' });
  assert.equal(duplicateEmail.status, 409);
  assert.deepEqual(await duplicateEmail.json(), { error: 'That email address is already in use' });
  assert.equal((await request('/api/auth/me', { cookie: credentialLogin.cookie })).status, 200);
});

test('SUPER_ADMIN can change credentials after current-password verification and all sessions are revoked', async () => {
  const initialLogin = await login(credentialAdminEmail, credentialAdminPassword);
  const otherSession = await login(credentialAdminEmail, credentialAdminPassword);
  const newEmail = `updated-${randomBytes(8).toString('hex')}@example.test`;
  const newPassword = 'Updated-test-admin-password-39!';
  const update = await request('/api/auth/credentials', {
    method: 'POST',
    cookie: initialLogin.cookie,
    body: {
      current_password: credentialAdminPassword,
      new_email: newEmail,
      new_password: newPassword,
    },
  });

  assert.equal(update.status, 200);
  assert.deepEqual(await update.json(), {
    success: true,
    message: 'Credentials updated. Sign in again with your new email and password.',
  });
  assert.match(update.headers.get('set-cookie') ?? '', /(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/i);
  assert.equal((await request('/api/auth/me', { cookie: initialLogin.cookie })).status, 401);
  assert.equal((await request('/api/auth/me', { cookie: otherSession.cookie })).status, 401);
  assert.equal((await login(credentialAdminEmail, credentialAdminPassword)).response.status, 401);

  const updatedLogin = await login(newEmail, newPassword);
  assert.equal(updatedLogin.response.status, 200);
  assert.equal((updatedLogin.body.user as Record<string, unknown>).email, newEmail);
});

test('SUPER_ADMIN passes admin authorization', async () => {
  const response = await request('/api/auth/test/admin?role=BUSINESS_OWNER', {
    cookie: adminCookie,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { authorized: true });
});

test('business owners can access only their linked businesses', async () => {
  const ownerALogin = await login('owner@aroma-crumb.demo.test', demoPassword);
  const ownerACookieForCheck = ownerALogin.cookie;
  const ownerBLogin = await login('owner@maison-gloss.demo.test', demoPassword);
  ownerBCookie = ownerBLogin.cookie;

  const [aAccess, aDenied, bAccess, bDenied] = await Promise.all([
    request(`/api/auth/test/business/${ownerABusinessId}`, { cookie: ownerACookieForCheck }),
    request(`/api/auth/test/business/${ownerBBusinessId}`, { cookie: ownerACookieForCheck }),
    request(`/api/auth/test/business/${ownerBBusinessId}`, { cookie: ownerBCookie }),
    request(`/api/auth/test/business/${ownerABusinessId}`, { cookie: ownerBCookie }),
  ]);

  assert.equal(aAccess.status, 200);
  assert.equal(aDenied.status, 403);
  assert.equal(bAccess.status, 200);
  assert.equal(bDenied.status, 403);
});

test('SUPER_ADMIN can access both demo businesses', async () => {
  const [businessA, businessB] = await Promise.all([
    request(`/api/auth/test/business/${ownerABusinessId}`, { cookie: adminCookie }),
    request(`/api/auth/test/business/${ownerBBusinessId}`, { cookie: adminCookie }),
  ]);
  assert.equal(businessA.status, 200);
  assert.equal(businessB.status, 200);
});

test('business access rejects malformed and nonexistent identifiers', async () => {
  const malformed = await request('/api/auth/test/business/0', { cookie: adminCookie });
  const nonexistent = await request('/api/auth/test/business/99999999999999999999', { cookie: adminCookie });
  assert.equal(malformed.status, 404);
  assert.equal(nonexistent.status, 404);
});

test('login regenerates and invalidates a presented old session', async () => {
  const previousCookie = adminCookie;
  const previousSessionId = previousCookie.split('=')[1];
  const refreshed = await request('/api/auth/login', {
    method: 'POST',
    cookie: previousCookie,
    body: { email: 'admin@ybgp.local', password: demoPassword },
  });
  const newCookie = (refreshed.headers.get('set-cookie') ?? '').split(';', 1)[0];
  const newSessionId = newCookie.split('=')[1];
  assert.equal(refreshed.status, 200);
  assert.ok(newSessionId);
  assert.notEqual(newSessionId, previousSessionId);
  const oldSessionMe = await request('/api/auth/me', { cookie: previousCookie });
  assert.equal(oldSessionMe.status, 401);
  adminCookie = newCookie;
  createdSessionHashes.add(hashSession(newSessionId));
});

test('role-specific login invalidates both existing role and legacy sessions', async () => {
  const previousLogin = await login('admin@ybgp.local', demoPassword);
  const legacySessionId = randomBytes(32).toString('hex');
  const legacySessionHash = hashSession(legacySessionId);
  createdSessionHashes.add(legacySessionHash);
  const user = previousLogin.body.user as Record<string, unknown>;
  const userId = user.id;
  assert.ok(typeof userId === 'string');
  await pool.execute(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP(3) + INTERVAL 1 DAY)',
    [legacySessionHash, userId]
  );

  const refreshed = await request('/api/auth/admin/login', {
    method: 'POST',
    cookie: `${previousLogin.cookie}; ${SESSION_COOKIE_NAME}=${legacySessionId}`,
    body: { email: 'admin@ybgp.local', password: demoPassword },
  });
  const roleCookie = refreshed.headers.get('set-cookie')?.match(
    new RegExp(`${ADMIN_SESSION_COOKIE_NAME}=[a-f\\d]{64}`)
  )?.[0] ?? '';
  const newSessionId = roleCookie.slice(`${ADMIN_SESSION_COOKIE_NAME}=`.length);
  assert.equal(refreshed.status, 200);
  assert.ok(newSessionId);
  createdSessionHashes.add(hashSession(newSessionId));

  assert.equal((await request('/api/auth/admin/me', { cookie: previousLogin.cookie })).status, 401);
  assert.equal((await request('/api/auth/me', {
    cookie: `${SESSION_COOKIE_NAME}=${legacySessionId}`,
  })).status, 401);
  assert.equal((await request('/api/auth/admin/me', { cookie: roleCookie })).status, 200);
});

test('owner logout invalidates only the owner session and clears its cookie', async () => {
  const loggedIn = await login('owner@maison-gloss.demo.test', demoPassword);
  const logout = await request('/api/auth/business/logout', {
    method: 'POST',
    cookie: loggedIn.cookie,
  });
  assert.equal(logout.status, 200);
  assert.deepEqual(await logout.json(), { success: true });
  assert.match(logout.headers.get('set-cookie') ?? '', /(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/i);

  const oldSession = await request('/api/auth/me', { cookie: loggedIn.cookie });
  assert.equal(oldSession.status, 401);
});

test('role-specific logout is idempotent without a session', async () => {
  const response = await request('/api/auth/business/logout', {
    method: 'POST',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
});

test('expired sessions return 401', async () => {
  const sessionId = randomBytes(32).toString('hex');
  const sessionHash = hashSession(sessionId);
  createdSessionHashes.add(sessionHash);
  const [[user]] = await pool.execute<IdRow[]>(
    `SELECT id FROM users WHERE email = 'owner@aroma-crumb.demo.test' LIMIT 1`
  );
  await pool.execute(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP(3) - INTERVAL 1 SECOND)',
    [sessionHash, user.id]
  );

  const response = await request('/api/auth/me', {
    cookie: `${SESSION_COOKIE_NAME}=${sessionId}`,
  });
  assert.equal(response.status, 401);
});

test('session primary key rejects duplicate sessions and foreign key rejects unknown users', async () => {
  const loggedIn = await login('admin@ybgp.local', demoPassword);
  const sessionHash = hashSession(loggedIn.sessionId);
  const loggedInUser = loggedIn.body.user as Record<string, unknown>;
  assert.equal(typeof loggedInUser.id, 'string');
  let duplicateRejected = false;
  try {
    await pool.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP(3) + INTERVAL 1 DAY)',
      [sessionHash, loggedInUser.id as string]
    );
  } catch (error) {
    duplicateRejected = typeof error === 'object' && error !== null && 'code' in error &&
      error.code === 'ER_DUP_ENTRY';
  }
  assert.equal(duplicateRejected, true);

  let unknownUserRejected = false;
  try {
    await pool.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, UTC_TIMESTAMP(3) + INTERVAL 1 DAY)',
      [randomBytes(32).toString('hex'), '18446744073709551615']
    );
  } catch (error) {
    unknownUserRejected = typeof error === 'object' && error !== null && 'code' in error &&
      error.code === 'ER_NO_REFERENCED_ROW_2';
  }
  assert.equal(unknownUserRejected, true);
});
