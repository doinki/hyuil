import { StreamableHTTPTransport } from '@hono/mcp';
import { Hono } from 'hono';
import { logger } from 'hono/logger';

import { env } from './env';
import { mcpServer } from './mcp';
import { routes } from './routes';
import { startupLogger } from './startup-logger';

const start = performance.now();

const app = new Hono();

app.get('/health', (c) => c.text('OK', 200));

app.use(logger());

const transport = new StreamableHTTPTransport();
app.all('/mcp', async (c) => {
  if (!mcpServer.isConnected()) {
    await mcpServer.connect(transport);
  }

  return transport.handleRequest(c);
});

app.route('/', routes);

const server = Bun.serve({
  development: Bun.env.NODE_ENV !== 'production',
  fetch: app.fetch,
  hostname: env.HOST,
  idleTimeout: env.IDLE_TIMEOUT,
  port: env.PORT,
});

startupLogger({ port: env.PORT, start });

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    try {
      await server.stop();

      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
});
