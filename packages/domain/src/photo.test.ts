import { describe, expect, it } from "vitest";
import { PhotoSchema } from "./photo";

const VALID_BASE = {
  id: "00000000-0000-4000-8000-000000000000",
  user_id: "11111111-1111-4111-8111-111111111111",
  project_id: "22222222-2222-4222-8222-222222222222",
  location_id: "00000000-0000-4000-8000-000000000003",
  trade_id: "00000000-0000-4000-8000-000000000004",
  vendor_id: "00000000-0000-4000-8000-000000000005",
  content_text: "Sample photo note",
  taken_at: "2026-04-24T00:00:00.000Z",
  storage_path:
    "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/00000000-0000-4000-8000-000000000000.jpg",
  gallery_album: null,
  created_at: "2026-04-24T00:00:00.000Z",
};

describe("PhotoSchema", () => {
  it("valid: parses a well-formed Photo", () => {
    expect(PhotoSchema.safeParse(VALID_BASE).success).toBe(true);
  });

  it("invalid: rejects empty content_text", () => {
    expect(
      PhotoSchema.safeParse({ ...VALID_BASE, content_text: "" }).success
    ).toBe(false);
  });

  it("invalid: rejects storage_path with wrong format (legacy plain path)", () => {
    expect(
      PhotoSchema.safeParse({
        ...VALID_BASE,
        storage_path: "user/project/photo.jpg",
      }).success
    ).toBe(false);
  });

  it("invalid: rejects storage_path with disallowed extension", () => {
    expect(
      PhotoSchema.safeParse({
        ...VALID_BASE,
        storage_path:
          "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/00000000-0000-4000-8000-000000000000.gif",
      }).success
    ).toBe(false);
  });

  it("invalid: rejects storage_path missing extension", () => {
    expect(
      PhotoSchema.safeParse({
        ...VALID_BASE,
        storage_path:
          "11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222/00000000-0000-4000-8000-000000000000",
      }).success
    ).toBe(false);
  });

  it("valid: accepts uppercase extension and uppercase hex", () => {
    expect(
      PhotoSchema.safeParse({
        ...VALID_BASE,
        storage_path:
          "AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA/BBBBBBBB-BBBB-4BBB-8BBB-BBBBBBBBBBBB/CCCCCCCC-CCCC-4CCC-8CCC-CCCCCCCCCCCC.JPG",
      }).success
    ).toBe(true);
  });
});
