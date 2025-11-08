import { LRUCache } from 'lru-cache';

import { env } from '../env';

interface HolidayApiResponse {
  response: {
    body: {
      items: {
        item: HolidayItemRaw[];
      };
    };
  };
}

interface HolidayItemRaw {
  dateKind: string;
  dateName: string;
  isHoliday: 'Y' | 'N';
  /**
   * @example 20250101
   */
  locdate: number;
  seq: number;
}

export interface HolidayItem {
  /**
   * @example '2025-01-01'
   */
  date: string;
  name: string;
  isHoliday: boolean;
}

export interface YearHolidaysResponse {
  year: number;
  holidays: HolidayItem[];
}

export interface MonthHolidaysResponse {
  year: number;
  month: number;
  holidays: HolidayItem[];
}

export type DateHolidayResponse =
  | {
      year: number;
      month: number;
      day: number;
      isHoliday: true;
      holiday: HolidayItem;
    }
  | {
      year: number;
      month: number;
      day: number;
      isHoliday: false;
      holiday: null;
    };

const { SERVICE_KEY } = env;

const cache = new LRUCache<number, HolidayItem[]>({
  allowStale: true,
  max: new Date().getFullYear() - 2004 + 1,
  ttl: 1000 * 60 * 60 * 24,
});

function formatDate(locdate: number): string {
  const str = locdate.toString();
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function transformHolidayItem(raw: HolidayItemRaw): HolidayItem {
  return {
    date: formatDate(raw.locdate),
    name: raw.dateName,
    isHoliday: raw.isHoliday === 'Y',
  };
}

export class HolidayService {
  async fetchHolidays(year: number): Promise<HolidayItem[] | null> {
    const url = new URL('https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo');
    url.searchParams.set('serviceKey', SERVICE_KEY);
    url.searchParams.set('solYear', year.toString());
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('_type', 'json');

    const data = await fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error([res.status, res.statusText].filter(Boolean).join(' '));
      }

      return res.json() as Promise<HolidayApiResponse>;
    });

    const rawItems = data.response.body.items?.item;
    if (!rawItems) {
      return null;
    }

    return rawItems.map(transformHolidayItem);
  }

  async getHolidaysByYear(year: number): Promise<HolidayItem[] | null> {
    if (!cache.has(year)) {
      const holidays = await this.fetchHolidays(year);
      if (holidays) {
        cache.set(year, holidays);
      }
    }

    return cache.get(year) ?? null;
  }

  async getYearHolidays(year: number): Promise<YearHolidaysResponse | null> {
    const holidays = await this.getHolidaysByYear(year);

    if (!holidays) {
      return null;
    }

    return { year, holidays };
  }

  async getMonthHolidays(year: number, month: number): Promise<MonthHolidaysResponse | null> {
    const holidays = await this.getHolidaysByYear(year);

    if (!holidays) {
      return null;
    }

    const targetYearMonth = `${year}-${month.toString().padStart(2, '0')}`;
    const filteredHolidays = holidays.filter((holiday) => holiday.date.startsWith(targetYearMonth));

    return { year, month, holidays: filteredHolidays };
  }

  async getDateHoliday(year: number, month: number, day: number): Promise<DateHolidayResponse | null> {
    const holidays = await this.getHolidaysByYear(year);

    if (!holidays) {
      return null;
    }

    const targetDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const holiday = holidays.find((h) => h.date === targetDate);

    if (!holiday || !holiday.isHoliday) {
      return {
        year,
        month,
        day,
        isHoliday: false,
        holiday: null,
      };
    }

    return {
      year,
      month,
      day,
      isHoliday: true,
      holiday,
    };
  }
}

export const holidayService = new HolidayService();
