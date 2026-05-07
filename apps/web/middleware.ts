import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // _next 정적 자원 / 이미지 / favicon 제외
  // (robots.txt / sitemap.xml 등 추가 제외는 V1 후반 또는 Chunk 4 결정)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
