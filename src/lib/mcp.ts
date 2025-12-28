import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import packageJson from '../../package.json';

export function createMcpServer() {
  return new McpServer({
    description: '한국의 공휴일을 조회할 수 있는 MCP 서버입니다. `hyuil`은 한국어 `휴일`을 영어로 표현한 이름입니다.',
    name: 'hyuil',
    version: packageJson.version,
  });
}

export function getHolidayToolMetadata() {
  return [
    'get_holiday',
    {
      description: `한국의 공휴일을 조회합니다:
- year만 제공: 해당 연도의 모든 공휴일 목록을 반환합니다.
- year와 month 제공: 해당 연도와 월의 공휴일 목록을 반환합니다.
- year, month, day 모두 제공: 해당 날짜가 공휴일인지 확인하고, 공휴일인 경우 휴일 정보를 반환합니다.`,
      inputSchema: z.object({ day: z.number().optional(), month: z.number().optional(), year: z.number() }),
    },
  ] as const;
}
