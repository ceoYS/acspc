import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 보안: 인증 결정 시 supabase.auth.getUser() 사용. getSession() 의 user 객체는 Auth 서버 미검증.
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing')
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // setAll 이 Server Component 에서 호출된 정상 케이스. middleware 가 session refresh 처리.
        }
      },
    },
  })
}
