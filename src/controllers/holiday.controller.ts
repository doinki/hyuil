import type { Context } from 'hono';
import { cacheHeader } from 'pretty-cache-header';

import { holidayParamsSchema } from '../schemas/holiday.schema';
import {
  DateHolidayResponse,
  holidayService,
  MonthHolidaysResponse,
  YearHolidaysResponse,
} from '../services/holiday.service';

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

    const { year, month, day } = result.data;

    let holiday: YearHolidaysResponse | MonthHolidaysResponse | DateHolidayResponse | null = null;
    if (day && month) {
      holiday = await holidayService.getDateHoliday(year, month, day);
    } else if (month) {
      holiday = await holidayService.getMonthHolidays(year, month);
    } else {
      holiday = await holidayService.getYearHolidays(year);
    }

    if (!holiday) {
      c.status(500);
      return c.body(null);
    }

    c.header(
      'Cache-Control',
      cacheHeader({
        maxAge: '1d',
        public: true,
        staleIfError: '1w',
        staleWhileRevalidate: '1d',
      }),
    );

    return c.json(holiday);
  }
}

export const holidayController = new HolidayController();
