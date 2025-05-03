import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { LRUCache } from 'lru-cache';
import { gracefulShutdown } from 'server.close';

import { z } from 'zod';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

const HOST = process.env.HOST || '0.0.0.0';
const KEEPALIVE_TIMEOUT = Number(process.env.KEEPALIVE_TIMEOUT) || 65000;
const PORT = Number(process.env.PORT) || 3000;

const cache = new LRUCache<
  number,
  {
    dateKind: string;
    dateName: string;
    isHoliday: 'Y' | 'N';
    locdate: number;
    seq: number;
  }[]
>({ allowStale: true, max: 10, ttl: 1000 * 60 * 60 * 24 });

const envSchema = z.object({
  SERVICE_KEY: z.string(),
  HOST: z.string().optional(),
  PORT: z.string().optional(),
  KEEPALIVE_TIMEOUT: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

const app = new Hono();

app.use(timing());
app.get('/health', (c) => {
  c.header('Cache-Control', 'no-store');

  return c.text('OK');
});
app.use(logger());

const schema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2004)
    .refine((value) => value <= new Date().getFullYear() + 1),
  month: z.coerce.number().int().min(1).max(12).optional(),
  day: z.coerce.number().int().min(1).max(31).optional(),
});

app.get('/:year/:month?/:day?', async (c) => {
  const result = schema.safeParse(c.req.param());
  if (!result.success) {
    c.status(400);

    return c.body(null);
  }

  const { year, month, day } = result.data;

  if (!cache.has(year)) {
    const data = await fetch(
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?serviceKey=${process.env.SERVICE_KEY}&solYear=${year}&numOfRows=100&_type=json`,
    ).then((res) => {
      if (!res.ok) {
        throw new Error([res.status, res.statusText].join(' '));
      }

      return res.json() as Promise<{
        response: {
          body: {
            items: {
              item: {
                dateKind: string;
                dateName: string;
                isHoliday: 'Y' | 'N';
                /**
                 * @example 20250101
                 */
                locdate: number;
                seq: number;
              }[];
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
    console.log({ year, month, day });

    c.status(500);

    return c.body(null);
  }

  if (day) {
    const date = Number(`${year}${month!.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`);
    const isHoliday = holidays.findIndex((holiday) => holiday.locdate === date) !== -1;

    return c.json({
      year,
      month,
      day,
      isHoliday,
    });
  } else if (month) {
    const date = `${year}${month.toString().padStart(2, '0')}`;

    return c.json({
      year,
      month,
      data: holidays.filter((holiday) => holiday.locdate.toString().startsWith(date)),
    });
  } else {
    return c.json({
      year,
      data: holidays,
    });
  }
});

const server = serve(
  {
    fetch: app.fetch,
    hostname: HOST,
    port: PORT,
  },
  async () => {
    console.log('⬆️');

    process.send?.('ready');
  },
);

// @ts-expect-error
server.keepAliveTimeout = KEEPALIVE_TIMEOUT;

gracefulShutdown(server, {
  onShutdown: () => {
    console.log('⬇️');
  },
});
