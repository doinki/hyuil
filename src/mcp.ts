import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { holidayService } from './services/holiday.service';

export const mcpServer = new McpServer({
  description: '한국의 공휴일을 조회할 수 있는 MCP 서버입니다. `hyuil`은 한국어 `휴일`을 영어로 표현한 이름입니다.',
  name: 'hyuil',
  version: '0.1.0',
});

mcpServer.registerTool(
  'get_holiday',
  {
    description: `한국의 공휴일을 조회합니다.
- year만 제공: 해당 연도의 모든 공휴일 목록을 반환합니다.
- year와 month 제공: 해당 연도와 월의 공휴일 목록을 반환합니다.
- year, month, day 모두 제공: 해당 날짜가 공휴일인지 확인하고, 공휴일인 경우 휴일 정보를 반환합니다.`,
    inputSchema: z.object({
      day: z.number().optional(),
      month: z.number().optional(),
      year: z.number(),
    }),
  },
  async ({ day, month, year }) => {
    const holiday = await holidayService.getHoliday(year, month, day);

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
