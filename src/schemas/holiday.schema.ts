import { z } from 'zod';

export const holidayParamsSchema = z.object({
  day: z.coerce.number().int().min(1).max(31).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce
    .number()
    .int()
    .min(2004)
    .refine((value) => value <= new Date().getFullYear() + 1),
});

export type HolidayParams = z.infer<typeof holidayParamsSchema>;
