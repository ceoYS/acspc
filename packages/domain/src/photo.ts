import { z } from "zod";

export const PhotoSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  project_id: z.uuid(),
  location_id: z.uuid(),
  trade_id: z.uuid(),
  vendor_id: z.uuid(),
  content_text: z.string().min(1).max(200),
  taken_at: z.iso.datetime(),
  storage_path: z.string(),
  gallery_album: z.string().nullable(),
  created_at: z.iso.datetime(),
});

export type Photo = z.infer<typeof PhotoSchema>;
