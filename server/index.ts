import { createServer } from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { ensureWebsiteTemplateCatalog } from './templates/catalog.js';

const server = createServer(app);
let shuttingDown = false;

server.on('error', (error) => {
  console.error('API server failed:', error);
  process.exitCode = 1;
});

server.listen(env.apiPort, () => {
  console.info(`YBGP Websites server listening on port ${env.apiPort}`);
  void ensureWebsiteTemplateCatalog().catch((error: unknown) => {
    console.error('Failed to initialize the website template catalog:', error);
  });
});

const shutdown = (signal: NodeJS.Signals) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`Received ${signal}; shutting down API server`);

  server.close((serverError) => {
    if (serverError) {
      console.error('Failed to close API server cleanly:', serverError);
      process.exitCode = 1;
    }

    void pool.end().catch((databaseError: unknown) => {
      console.error('Failed to close MySQL connection pool:', databaseError);
      process.exitCode = 1;
    });
  });
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
