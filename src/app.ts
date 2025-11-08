import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { gracefulShutdown } from 'server.close';

import { env } from './env';
import { routes } from './routes';
import { startupLogger } from './startup-logger';

const start = performance.now();

const { HOST, KEEPALIVE_TIMEOUT, PORT } = env;

const app = new Hono();

app.use(logger());

app.route('/', routes);
app.get('/health', (c) => c.text('OK', 200));

const server = serve(
  {
    fetch: app.fetch,
    hostname: HOST,
    port: PORT,
    serverOptions: {
      keepAlive: true,
      keepAliveTimeout: KEEPALIVE_TIMEOUT,
    },
  },
  ({ port }) => {
    startupLogger({ port, start });
    process.send?.('ready');
  },
);

if (process.env.NODE_ENV === 'production') {
  gracefulShutdown(server);
}
