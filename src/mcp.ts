import { createMcpServer, getHolidayToolMetadata } from './lib/mcp';
import { holidayService } from './services/holiday.service';

export const mcpServer = createMcpServer();

mcpServer.registerTool(...getHolidayToolMetadata(), async (args) => {
  const { day, month, year } = args as { day?: number; month?: number; year: number };

  const data = await holidayService.getHoliday(year, month, day);

  if (!data) {
    return {
      content: [{ text: '휴일을 찾을 수 없습니다.', type: 'text' }],
    };
  }

  return {
    content: [{ text: JSON.stringify(data), type: 'text' }],
  };
});
