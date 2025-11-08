import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { LRUCache } from 'lru-cache';
import { cacheHeader } from 'pretty-cache-header';
import { gracefulShutdown } from 'server.close';
import { z } from 'zod';

import { validateEnv } from './env';
import { startupLogger } from './startup-logger';

const start = performance.now();

const { HOST, KEEPALIVE_TIMEOUT, PORT, SERVICE_KEY } = validateEnv();

const cache = new LRUCache<
  number,
  Array<{
    dateKind: string;
    dateName: string;
    isHoliday: 'Y' | 'N';
    locdate: number;
    seq: number;
  }>
>({ allowStale: true, max: 365, ttl: 1000 * 60 * 60 * 24 });

const app = new Hono();

app.get('/health', (c) => {
  c.header('Cache-Control', cacheHeader({ noStore: true }));

  return c.text('OK');
});
app.use(logger());

const schema = z.object({
  day: z.coerce.number().int().min(1).max(31).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce
    .number()
    .int()
    .min(2004)
    .refine((value) => value <= new Date().getFullYear() + 1),
});

app.get('/:year/:month?/:day?', async (c) => {
  const result = schema.safeParse(c.req.param());
  if (!result.success) {
    c.status(400);

    return c.body(null);
  }

  const { day, month, year } = result.data;

  if (!cache.has(year)) {
    const data = await fetch(
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${SERVICE_KEY}&solYear=${year}&numOfRows=100&_type=json`,
    ).then((res) => {
      if (!res.ok) {
        throw new Error([res.status, res.statusText].join(' '));
      }

      return res.json() as Promise<{
        response: {
          body: {
            items: {
              item: Array<{
                dateKind: string;
                dateName: string;
                isHoliday: 'Y' | 'N';
                /**
                 * @example 20250101
                 */
                locdate: number;
                seq: number;
              }>;
            };
          };
        };
      }>;
    });

    const holidays = data.response.body.items?.item;
    if (holidays) {
      cache.set(year, holidays);
    }
  }

  const holidays = cache.get(year);
  if (!holidays) {
    console.log({ day, month, year });

    c.status(500);

    return c.body(null);
  }

  c.header('Cache-Control', cacheHeader({ maxAge: '5m', public: true, staleWhileRevalidate: '25m' }));

  if (day) {
    const date = Number(`${year}${month!.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`);
    const isHoliday = holidays.some((holiday) => holiday.locdate === date);

    return c.json({ day, isHoliday, month, year });
  } else if (month) {
    const date = `${year}${month.toString().padStart(2, '0')}`;

    return c.json({ data: holidays.filter((holiday) => holiday.locdate.toString().startsWith(date)), month, year });
  } else {
    return c.json({ data: holidays, year });
  }
});

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
