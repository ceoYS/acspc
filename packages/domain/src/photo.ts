import { z } from "zod";

const STORAGE_PATH_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|heic)$/i;

export const PhotoSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  project_id: z.uuid(),
  location_id: z.uuid(),
  trade_id: z.uuid(),
  vendor_id: z.uuid(),
  content_text: z.string().min(1).max(200),
  taken_at: z.iso.datetime(),
  storage_path: z
    .string()
    .min(1)
    .max(255)
    .regex(STORAGE_PATH_REGEX, "storage_path must be {user_id}/{project_id}/{photo_id}.{ext}"),
  gallery_album: z.string().nullable(),
  created_at: z.iso.datetime(),
});

export type Photo = z.infer<typeof PhotoSchema>;
