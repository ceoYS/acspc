import { z } from "zod";

export const VendorSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  project_id: z.uuid(),
  name: z.string().min(1).max(100),
  created_at: z.iso.datetime(),
});

export type Vendor = z.infer<typeof VendorSchema>;
