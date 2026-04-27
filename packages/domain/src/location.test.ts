import { describe, expect, it } from "vitest";
import { LocationSchema } from "./location";

describe("LocationSchema", () => {
  it("valid: parses a well-formed Location", () => {
    const valid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      project_id: "00000000-0000-4000-8000-000000000002",
      name: "Sample location",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(LocationSchema.safeParse(valid).success).toBe(true);
  });

  it("invalid: rejects whitespace-only name", () => {
    const invalid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      project_id: "00000000-0000-4000-8000-000000000002",
      name: " ",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(LocationSchema.safeParse(invalid).success).toBe(false);
  });
});
