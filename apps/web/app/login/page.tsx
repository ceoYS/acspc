import { createClient } from '@/lib/supabase/server'
import { signUp, signIn, signOut, createProject } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">Login</h1>

      {error && (
        <div role="alert" className="rounded border border-red-700 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {user ? (
        <section className="space-y-4">
          <p>Logged in as {user.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded border border-slate-700 px-4 py-2"
            >
              Sign out
            </button>
          </form>

          <hr className="border-slate-300" />

          <form action={createProject} className="space-y-3">
            <input
              type="text"
              name="name"
              aria-label="Project name"
              placeholder="Project name"
              className="w-full rounded border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              className="rounded bg-slate-900 px-4 py-2 text-slate-50"
            >
              Create project
            </button>
          </form>

          {projects && projects.length > 0 ? (
            <ul className="space-y-1">
              {projects.map((p) => (
                <li key={p.id}>
                  <span className="font-mono text-xs text-slate-500">{p.id}</span> {p.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No projects yet</p>
          )}

          <hr className="border-slate-300" />

          <Link
            href="/photos/upload"
            className="inline-block rounded border border-slate-700 px-4 py-2"
          >
            Photo upload
          </Link>
        </section>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Sign up</h2>
            <form action={signUp} className="space-y-3">
              <input
                type="email"
                name="email"
                aria-label="Sign up email"
                placeholder="Email"
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              <input
                type="password"
                name="password"
                aria-label="Sign up password"
                placeholder="Password"
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              <button
                type="submit"
                className="rounded bg-slate-900 px-4 py-2 text-slate-50"
              >
                Sign up
              </button>
            </form>
          </section>

          <hr className="border-slate-300" />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Sign in</h2>
            <form action={signIn} className="space-y-3">
              <input
                type="email"
                name="email"
                aria-label="Sign in email"
                placeholder="Email"
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              <input
                type="password"
                name="password"
                aria-label="Sign in password"
                placeholder="Password"
                required
                className="w-full rounded border border-slate-300 px-3 py-2"
              />
              <button
                type="submit"
                className="rounded bg-slate-900 px-4 py-2 text-slate-50"
              >
                Sign in
              </button>
            </form>
          </section>
        </>
      )}
    </main>
  )
}
