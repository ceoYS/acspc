import { supabase } from "@/lib/supabase";

export default async function SupabaseCheckPage() {
  const { data, error } = await supabase.auth.getSession();

  return (
    <main style={{ padding: 24, fontFamily: "monospace" }}>
      <h1>Supabase Hello Check</h1>
      <p>Status: {error ? "ERROR" : "OK"}</p>
      <p>Has session: {data?.session ? "yes" : "no (expected for anon)"}</p>
      {error && <p>Error: {error.message}</p>}
    </main>
  );
}
