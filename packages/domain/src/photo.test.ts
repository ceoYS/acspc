import { describe, expect, it } from "vitest";
import { PhotoSchema } from "./photo";

describe("PhotoSchema", () => {
  it("valid: parses a well-formed Photo", () => {
    const valid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      project_id: "00000000-0000-4000-8000-000000000002",
      location_id: "00000000-0000-4000-8000-000000000003",
      trade_id: "00000000-0000-4000-8000-000000000004",
      vendor_id: "00000000-0000-4000-8000-000000000005",
      content_text: "Sample photo note",
      taken_at: "2026-04-24T00:00:00.000Z",
      storage_path: "user/project/photo.jpg",
      gallery_album: null,
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(PhotoSchema.safeParse(valid).success).toBe(true);
  });

  it("invalid: rejects empty content_text", () => {
    const invalid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      project_id: "00000000-0000-4000-8000-000000000002",
      location_id: "00000000-0000-4000-8000-000000000003",
      trade_id: "00000000-0000-4000-8000-000000000004",
      vendor_id: "00000000-0000-4000-8000-000000000005",
      content_text: "",
      taken_at: "2026-04-24T00:00:00.000Z",
      storage_path: "user/project/photo.jpg",
      gallery_album: null,
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(PhotoSchema.safeParse(invalid).success).toBe(false);
  });
});
