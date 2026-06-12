import { z } from "zod";

export const CreateLinkSchema = z.object({
  originalUrl: z.string().url(),
  alias: z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/).optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  clickCap: z.number().int().positive().optional(),
});

export type CreateLinkInput =
  z.infer<typeof CreateLinkSchema>;