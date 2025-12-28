import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createMcpServer, getHolidayToolMetadata } from '../src/lib/mcp';
import type { DateHolidayResponse, MonthHolidaysResponse, YearHolidaysResponse } from '../src/services/holiday.service';

const server = createMcpServer();

server.registerTool(...getHolidayToolMetadata(), async (args) => {
  const url = new URL('https://hyuil.dongin.kim');
  const { day, month, year } = args as { day?: number; month?: number; year: number };
  if (year && month && day) {
    url.pathname = `/${year}/${month}/${day}`;
  } else if (year && month) {
    url.pathname = `/${year}/${month}`;
  } else if (year) {
    url.pathname = `/${year}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ` + [response.status, response.statusText].filter(Boolean).join(' '));
  }

  const data = (await response.json()) as YearHolidaysResponse | MonthHolidaysResponse | DateHolidayResponse;

  return {
    content: [{ text: JSON.stringify(data), type: 'text' }],
  };
});

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('Hyuil MCP Server started successfully and is listening on stdio');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
