import { describe, expect, it } from "vitest";
import { ProjectSchema } from "./project";

describe("ProjectSchema", () => {
  it("valid: parses a well-formed Project", () => {
    const valid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      name: "Sample project",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(ProjectSchema.safeParse(valid).success).toBe(true);
  });

  it("invalid: rejects non-uuid id", () => {
    const invalid = {
      id: "not-a-uuid",
      user_id: "00000000-0000-4000-8000-000000000001",
      name: "Sample project",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(ProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("invalid: rejects name that is a single space", () => {
    const invalid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      name: " ",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(ProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("invalid: rejects name that is mixed whitespace (tab/newline/space)", () => {
    const invalid = {
      id: "00000000-0000-4000-8000-000000000000",
      user_id: "00000000-0000-4000-8000-000000000001",
      name: "\t\n ",
      created_at: "2026-04-24T00:00:00.000Z",
    };
    expect(ProjectSchema.safeParse(invalid).success).toBe(false);
  });
});
