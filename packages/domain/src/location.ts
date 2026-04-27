import { z } from "zod";

export const LocationSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  project_id: z.uuid(),
  name: z
    .string()
    .min(1)
    .max(100)
    .refine((s) => s.trim().length > 0, "name cannot be blank"),
  created_at: z.iso.datetime(),
});

export type Location = z.infer<typeof LocationSchema>;
