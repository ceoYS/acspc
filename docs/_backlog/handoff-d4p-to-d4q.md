# Handoff — D-4p → D-4q (2026-05-07, Session 17 end)

## 1. D-4p 종결 요약

D-4p = Phase 5.3 (Auth thin slice) 진입 + SSR 클라이언트 토대 정착. 100% 종결.

2 작업 chunk + 2 Gate 2 chunk → 2 git commit:

### Chunk 2-A (의존성 추가, 7dee082)
- `apps/web/package.json` 에 `@supabase/ssr@0.10.2` (exact pin, 베타 status)
- 회사 PC `pnpm install` (timeout 600s) 정상 (9.2s, +58 packages)
- Codex Evaluator 1회 (Critical 1 + High 3 + Medium 8 → v2 모두 반영)

### Chunk 2-B (SSR 클라이언트 분리 + middleware, d3824b8)
- 신규 4 파일 / 88 lines:
  - `apps/web/lib/supabase/client.ts` (createBrowserClient)
  - `apps/web/lib/supabase/server.ts` (createServerClient + Next.js 15 cookies async)
  - `apps/web/lib/supabase/middleware.ts` (session refresh helper, getUser)
  - `apps/web/middleware.ts` (helper 호출 + matcher)
- check-types exit=0 (2.059s) ✓
- next build exit=0 (5.8s) ✓ — ƒ Middleware 90.6 kB 인식
- Codex Evaluator 1회 (Critical 1 + High 5 + Medium 9 → v2 모두 반영)

### 환경 특이사항
- 본 D-4p 전부 회사 PC (`founder_ys@HG2501034N03`)
- D-4q 진입 = 집 PC (`sinabro@DESKTOP-CTPJ4S5`) 예정 (사용자 명시)

## 2. 환경 가정 + 검증

### 회사 PC (founder_ys@HG2501034N03)
```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
cd ~/work/acspc
pwd ; git remote -v | head -1 ; node --version ; ls ~/.certs/corp-root.pem ; git log --oneline -1
```
기대 HEAD: `d3824b8` 또는 그 이후 (handoff push 포함).

### 집 PC (sinabro@DESKTOP-CTPJ4S5) — cert 라인 제거 + KI-16 의무
```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
cd ~/work/acspc
git pull origin main
pnpm install
git log --oneline -1
```

## 3. D-4p 핵심 결정

### 3.1 @supabase/ssr 0.10.2 exact pin
- Supabase 공식 후속 패키지 (deprecated `@supabase/auth-helpers-*` 통합본)
- 베타 status 명시 — 사용자 도입 승인
- tech-stack §3 3-질문 통과 + scope-cut 패턴 C 미발동

### 3.2 SSR 클라이언트 분리 (Supabase 공식 패턴)
- `createBrowserClient` → `lib/supabase/client.ts` (Client Component)
- `createServerClient` → `lib/supabase/server.ts` (Server Component / Route Handler, Next.js 15 `await cookies()`)
- `createServerClient` → `lib/supabase/middleware.ts` (session refresh helper)
- `apps/web/middleware.ts` (root, helper 호출 + matcher)

### 3.3 기존 `apps/web/lib/supabase.ts` 유지
- D-4n hello-supabase 검증 페이지 1건 호출 (`apps/web/app/supabase-check/page.tsx`)
- Chunk 2-B scope 외 — D-4q Chunk 4 (RLS 검증) 또는 D-4r 시점 정리 결정
- module resolution 충돌 0건 (파일 vs 폴더, 별도 import 경로)

### 3.4 보안 의무 (D-4q Chunk 3 / 4 적용)
- 인증 결정 시 `supabase.auth.getUser()` 사용 (Auth 서버 검증)
- `getSession()` 의 user 객체는 미검증 — 인증 결정 사용 금지
- middleware 가 navigation 마다 `getUser()` 호출 = expired token refresh + single-use refresh token mitigation

### 3.5 middleware matcher (Next.js 15 표준)
```
/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```
robots.txt / sitemap.xml 등 public asset 추가 제외는 V1 후반 또는 D-4q Chunk 4 결정.

### 3.6 환경 변수 신규 (D-4p 도입)
- `NEXT_TELEMETRY_DISABLED=1` (회사 망 영향 최소화)

## 4. KI 후보 누적 (D-4o + D-4p, known-issues.md 정식 등재는 V1 후반 일괄)

### D-4o 후보 (D-4o handoff §4.1 보존)
- **KI-12**: Claude.ai 응답 메시지 길이 제한 → 큰 PROMPT 분할 의무
- **KI-13**: Claude Code stdout 자동 압축 (`+N lines (ctrl+o to expand)`) → expand 후 본문 paste 의무
- **KI-14**: Supabase API URL (`{ref}.supabase.co`) ≠ Dashboard URL (`supabase.com/dashboard/project/{ref}`)
- **KI-15**: 하루 세션 종료 시 handoff = 작업 chunk 와 별도 chunk 명시 의무
- **KI-16**: 새 환경 첫 진입 시 `pnpm install` 의무 (pre-commit hook 가 docs-only 도 차단)

### D-4p 신규
- **KI-17**: pnpm `nodeLinker: hoisted` 모드 검증 패턴. `apps/<workspace>/node_modules/<pkg>` 가 비어있고 root `node_modules/<pkg>` 에 flat 배치. 검증 시 두 경로 양쪽 점검 의무
- **KI-18**: 회사 PC WSL bash 환경에서 `turbo` binary PATH 미해결 (exit=127). 해결 = `./node_modules/.bin/turbo` 또는 `pnpm exec turbo` 또는 root `pnpm run check-types`. pre-commit hook 은 영향 없음

### minor-fixes
- **MF-33** (D-4o): gh CLI 양 환경 미설치. CI 결과 자동 확인 어려움. V1 후반

## 5. D-4q 다음 턴 스펙 — Phase 5.3 잔여

### 5.1 잔여 thin slice
| Chunk | 내용 | Evaluator |
|---|---|---|
| 3 | minimal login UI (web) — magic link 또는 password | 발동 |
| 4 | authenticated session 으로 RLS 동작 실증 | 발동 |
| 5 | mobile Supabase 통합 (또는 D-4r 분리) | 발동 |

**Phase 5 잔여**: 5.4 Storage / 5.5 CRUD = D-4r 이후

### 5.2 D-4q Chunk 3 사전 결정 (사용자 영역, 진입 전 확정)

#### 5.2.1 Supabase Cloud Auth 정책 (Dashboard 직접 결정)
- **Email signup**: 활성 권장 (V1 단일 사용자)
- **Confirm email**: OFF 권장 (즉시 RLS 검증, V1 thin slice)
- Dashboard URL (KI-14): `https://supabase.com/dashboard/project/ikeapcahcikxqkaclgas/auth/providers`

#### 5.2.2 login flow 패턴
- **옵션 A**: password (signup + signin form) — 즉시 RLS 검증 가능
- **옵션 B**: magic link (email link) — 단순, callback route 필요
- **옵션 C**: 둘 다 (V1 후반)
- → 사용자 결정

### 5.3 잠재 위험
- **집 PC pnpm install (KI-16)**: lockfile 변경 (Chunk 2-A 결과) 반영. 첫 install 시 `@supabase/ssr` + transient deps 다운로드 시간 소요
- **Cloud Auth 정책 미결정 시 Chunk 3 진입 보류**
- **callback route 신규 가능성**: signup confirm 또는 magic link callback = `apps/web/app/auth/callback/route.ts`

### 5.4 진입 전 확증
- HEAD = `d3824b8` 또는 그 이후 (handoff push 포함)
- 집 PC: pull + pnpm install + check-types 통과
- Cloud Auth 정책 + login flow 패턴 사용자 결정

## 6. 잔여 백로그 (V1 후반)

D-4o + D-4p 누적:
- MF-06 H3, H4 (Vendor sanitize, unique 제약)
- MF-11, MF-02, MF-27, MF-28~32, MF-33
- KI-12~18 정식 등재 (known-issues.md 신설)
- 기존 `apps/web/lib/supabase.ts` deprecate (D-4q Chunk 4 또는 D-4r)

## 7. 전체 진도

| Phase | 내용 | 상태 |
|---|---|---|
| 0 ~ 4.6 | 인프라 / 도메인 / 부채 / 검수 | 완료 |
| 5.1 | 클라이언트 셋업 | 완료 (D-4n) |
| 5.2 | DB 스키마 + RLS | 완료 (D-4o, c33d125) |
| 5.3 | Auth — prep + SSR 토대 | **D-4p 부분 완료 (d3824b8)** |
| 5.3 | Auth — login UI + RLS 검증 | D-4q 진입 |
| 5.4 | Storage | 대기 |
| 5.5 | CRUD | 대기 |
| 6 | V1 실기능 | 대기 |

V1 약 **80%**.

## 8. 새 대화창 시작 가이드 (D-4q)

### 복사 붙여넣을 첫 PROMPT

아래 (`--- CUT ---` 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4p 완료 (Phase 5.3 prep — @supabase/ssr 0.10.2 + SSR 클라이언트 4 파일 + middleware, HEAD=d3824b8 + handoff push).

오늘 진입 = D-4q (Phase 5.3 잔여 = login UI + RLS 검증, thin slice).

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4p 2 작업 chunk + 2 Gate 2 chunk → @supabase/ssr 0.10.2 (베타, exact pin) 도입 + SSR 클라이언트 분리 (Browser / Server / Middleware) + Next.js middleware 추가.
KI-17 (pnpm hoisted 검증 패턴) + KI-18 (회사 PC turbo PATH) 신규.
사용자 결정: 환경 전환 (회사 PC → 집 PC).

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4p-to-d4q.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- D-4q 목표 = Phase 5.3 잔여 (Chunk 3 login UI + Chunk 4 RLS 검증)
- 5.4 (Storage), 5.5 (CRUD) 는 D-4r 이후
- mobile 통합 = D-4q Chunk 5 또는 D-4r 분리
- Codex CLI 외부 Evaluator (KI-04/05 회피)
- bash preamble (회사 PC = corp-root.pem 포함, 집 PC = cert 제거)
- NEXT_TELEMETRY_DISABLED=1 (D-4p 도입)
- 범위 확장 = scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수. 속도보다 안정.
- Gate 2 승인 전 push 금지 (docs-only 묵시적)
- explicit add list, no git add .
- CI 자동 검증

D-4 시리즈 방법론 — 필수 준수:
[D-4o + D-4p 진입 메시지 1~22번 그대로 +]
+ KI-12 (Claude.ai 메시지 길이 제한 → PROMPT 분할)
+ KI-13 (Claude Code stdout 압축 → expand 후 paste)
+ KI-14 (Supabase API URL ≠ Dashboard URL)
+ KI-15 (Session Transition handoff 별도 chunk 의무)
+ KI-16 (새 환경 첫 진입 시 pnpm install)
+ KI-17 (pnpm hoisted nodeLinker 검증 = root + apps/<workspace> 양쪽)
+ KI-18 (회사 PC WSL turbo PATH 미해결 → ./node_modules/.bin/turbo 또는 pnpm run check-types)

D-4q 진입 즉시 정찰 (Planner):
- 환경 분기 (집 PC = pull + pnpm install 의무 / 회사 PC = pre-existing)
- HEAD 정합성 (d3824b8 + handoff push 또는 그 이후)
- apps/web/lib/supabase/{client,server,middleware}.ts 본문 정합 (handoff §3.2 기준)
- apps/web/middleware.ts 본문 정합
- 기존 apps/web/lib/supabase.ts + apps/web/app/supabase-check/page.tsx 보존
- Supabase Cloud Auth 정책 사용자 사전 결정 (handoff §5.2.1)
- login flow 패턴 사용자 사전 결정 (handoff §5.2.2)

handoff 요약 보고 후 "D-4q Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 체크리스트
- [ ] 본 handoff GitHub push 완료 (raw URL 접근 가능)
- [ ] 새 대화창에서 HEAD 인지 (d3824b8 + handoff push commit)
- [ ] preamble 회사/집 분기 (cert 라인 + NEXT_TELEMETRY_DISABLED)
- [ ] D-4p 핵심 결정 (ssr 도입 / SSR 분리 / lib/supabase.ts 유지 / 보안 의무) 인식
- [ ] KI-17 + KI-18 인식
- [ ] Cloud Auth 정책 사용자 결정 완료
- [ ] login flow 패턴 사용자 결정 완료
- [ ] mobile 통합 = D-4q Chunk 5 또는 D-4r 분리 가능성 인식
