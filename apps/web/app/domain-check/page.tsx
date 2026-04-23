import { ProjectSchema } from "@repo/domain";

export default function DomainCheckPage() {
  const validResult = ProjectSchema.safeParse({
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Sample project",
    created_at: "2026-04-23T10:00:00Z",
  });

  const invalidResult = ProjectSchema.safeParse({
    id: "not-a-uuid",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "",
    created_at: "2026-04-23T10:00:00Z",
  });

  return (
    <main className="p-8 font-mono text-sm">
      <h1 className="text-lg font-bold mb-4">@repo/domain import check</h1>
      <section className="mb-6">
        <h2 className="font-bold">Valid input</h2>
        <pre className="bg-gray-100 p-2">
          success: {String(validResult.success)}
        </pre>
      </section>
      <section>
        <h2 className="font-bold">Invalid input</h2>
        <pre className="bg-gray-100 p-2">
          success: {String(invalidResult.success)}
          {"\n"}
          {!invalidResult.success && `errors: ${invalidResult.error.issues.length}`}
        </pre>
      </section>
    </main>
  );
}
