import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { DateHolidayResponse, MonthHolidaysResponse, YearHolidaysResponse } from './services/holiday.service';
import { holidayService } from './services/holiday.service';

export const mcpServer = new McpServer({
  description: '한국의 공휴일을 조회할 수 있는 MCP 서버입니다. `hyuil`은 한국어 `휴일`을 영어로 표현한 이름입니다.',
  name: 'hyuil',
  version: '0.1.0',
});

mcpServer.registerTool(
  'get_holiday',
  {
    description: '한국의 공휴일을 조회합니다.',
    inputSchema: z.object({
      day: z.number().optional(),
      month: z.number().optional(),
      year: z.number(),
    }),
  },
  async ({ day, month, year }) => {
    let holiday: YearHolidaysResponse | MonthHolidaysResponse | DateHolidayResponse | null = null;

    if (day && month) {
      holiday = await holidayService.getDateHoliday(year, month, day);
    } else if (month) {
      holiday = await holidayService.getMonthHolidays(year, month);
    } else {
      holiday = await holidayService.getYearHolidays(year);
    }

    if (!holiday) {
      return {
        content: [{ text: '휴일을 찾을 수 없습니다.', type: 'text' }],
      };
    }

    return {
      content: [{ text: JSON.stringify(holiday), type: 'text' }],
    };
  },
);
