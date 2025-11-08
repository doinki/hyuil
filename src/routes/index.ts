import { Hono } from 'hono';

import { holidayController } from '../controllers/holiday.controller';

export const routes = new Hono();

routes.get('/:year/:month?/:day?', (c) => holidayController.getHoliday(c));
