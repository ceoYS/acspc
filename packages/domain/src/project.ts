import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  name: z
    .string()
    .min(1)
    .max(200)
    .refine((s) => s.trim().length > 0, "name cannot be blank"),
  created_at: z.iso.datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;
