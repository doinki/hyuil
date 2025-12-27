import type { Context } from 'hono';
import { cacheHeader } from 'pretty-cache-header';

import { holidayParamsSchema } from '../schemas/holiday.schema';
import { holidayService } from '../services/holiday.service';

export class HolidayController {
  health(c: Context) {
    c.header('Cache-Control', cacheHeader({ noStore: true }));
    return c.text('OK');
  }

  async getHoliday(c: Context) {
    const result = holidayParamsSchema.safeParse(c.req.param());
    if (!result.success) {
      c.status(400);
      return c.body(null);
    }

    const { day, month, year } = result.data;

    const holiday = await holidayService.getHoliday(year, month, day);

    if (!holiday) {
      c.status(500);
      return c.body(null);
    }

    return c.json(holiday, 200, {
      'Cache-Control': cacheHeader({
        maxAge: '1d',
        public: true,
        staleIfError: '1w',
        staleWhileRevalidate: '1d',
      }),
      'Content-Type': 'application/json; charset=utf-8',
    });
  }
}

export const holidayController = new HolidayController();
