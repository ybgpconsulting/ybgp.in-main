import { env } from '../config/env.js';

const loopbackHosts = new Set(['localhost', '127.0.0.1', '::1']);

if (!loopbackHosts.has(env.database.host.toLowerCase()) || env.database.name !== 'ybgp_websites_test') {
  throw new Error('Refusing database integration tests: configure loopback MySQL and DB_NAME=ybgp_websites_test.');
}
