# Handoff — D-4r home → D-4s (2026-05-07, Session 20 종결)

## 1. D-4r home 종결 상태

D-4q home (집 PC, Chunk 4 RLS thin slice + handoff push `d43cc4f`) 이어 같은 집 PC 에서 D-4r home 진입. KI-21 (publishable key 변수명 mismatch) 확정 + 해결, Phase 5.2 GRANT 누락 발견 + 보충, Gate 2 시나리오 1/2/3 모두 PASS, 2 commits push 완료.

### 현재 상태

- origin/main HEAD: `c8f2c0e`
- D-4q home 이후 commits: 2
  - `28de2c3` — refactor(web): rename SUPABASE_ANON_KEY → SUPABASE_PUBLISHABLE_KEY (KI-21)
  - `c8f2c0e` — fix(db): grant CRUD on projects to authenticated (Phase 5.2 누락 보충)
- working tree: clean

### KI-21 확정 + 해결 (T1)

- `apps/web/.env.local` 의 publishable key (`sb_publishable_*` 신형) 가 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 변수명에 담겨 있던 mismatch 를 표준화
- 변수명 일괄 rename: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- 5 파일 변경: `.env.local` (gitignored, 수동) + 4 코드 (`apps/web/lib/supabase.ts`, `apps/web/lib/supabase/client.ts`, `apps/web/lib/supabase/server.ts`, `apps/web/lib/supabase/middleware.ts`)
- KI-21 은 후보 → 해결로 전환. 단 패턴 자체 (Supabase 신구 key 명명 혼동) 는 KI 로 보존.

### Phase 5.2 GRANT 누락 발견 + 보충 (T1A)

- 시나리오 3 (createProject INSERT) 첫 시도 시 `permission denied for table projects` 발생
- 원인: `0001_init.sql` 은 `enable row level security` + policy 만 정의. `authenticated` role 의 table-level GRANT 부재
- 보충: `supabase/migrations/0002_grant_projects_authenticated.sql` 신규 (`grant select, insert, update, delete on table public.projects to authenticated`)
- Supabase Dashboard SQL Editor 에서 동일 SQL 직접 적용 (현재 환경 supabase CLI 미설정)
- `information_schema.role_table_grants` 검증: 7 row (REFERENCES, TRIGGER, TRUNCATE 기본 + SELECT/INSERT/UPDATE/DELETE 추가) 확인
- forward-only migration 패턴 유지 (기존 `0001_init.sql` 미수정)

### Gate 2 시나리오 결과

- 시나리오 1 (signIn): PASS
- 시나리오 2 (signUp): PASS
- 시나리오 3 (createProject INSERT + ul 갱신): PASS — `?error=` 없음 + ul 항목 추가 확인
- → 2 commits 같은 push (T1 + T1A 분리)

## 2. 환경 전제 (회사 PC, D-4s 진입 시)

```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
cd ~/work/acspc
```

### 필수 조치 — `.env.local` 변수명 수동 rename

`apps/web/.env.local` 은 gitignored 라 push 미포함. 회사 PC 에는 여전히 이전 변수명 (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) 으로 존재할 가능성. **회사 PC 진입 시점에 수동으로 다음 rename 필수**:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY  →  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

값은 동일 (`sb_publishable_*` 형식). 누락 시 `next build` 가 env 누락으로 실패 또는 런타임 401.

### KI-16 의무

대화창 시작 시 `git pull` + `pnpm install` 1회.

## 3. KI 신규 등재 후보 (V1 후반 known-issues.md 일괄)

기존 KI-12~18 은 D-4o + D-4p + D-4q office handoff 에서 보존.
D-4q home 에서 KI-19/20 추가, D-4r home 에서 KI-21 해결 + KI-22 추가.

- **KI-19** (D-4q home): Supabase 신규 publishable key (`sb_publishable_*`) 첫 호출 시 HTTP 401 가능. 우회 = `.env.local` 갱신 + dev server 재기동.
- **KI-20** (D-4q home): Supabase Dashboard "Confirm email" 토글이 Authentication → Sign In/Providers → Email provider 영역에 부재 (UI 변경). 우회 = Management API `PATCH /v1/projects/{ref}/config/auth` `{"mailer_autoconfirm": true}`.
- **KI-21** (D-4q home 후보 → D-4r home 해결): publishable key 가 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 변수명에 담긴 mismatch. 해결 = 변수명 일괄 rename. 패턴 (Supabase 신구 key 명명 혼동) 은 KI 로 보존.
- **KI-22** (D-4r home 신규): Supabase 테이블 생성 + `enable row level security` + policy 만으로는 `authenticated` role 접근 불가. **table-level GRANT (SELECT/INSERT/UPDATE/DELETE) 명시 필수**. RLS 는 "이미 GRANT 된 권한 위에서 row 단위 필터" 로 동작하므로 GRANT 부재 시 RLS 도달 전에 `permission denied for table` 으로 차단됨.

## 4. 방법론 교훈

- **handoff 표현 정확화**: 직전 handoff (D-4q home → D-4r) 의 "사용자 측 PASS 인지" 는 부정확. 향후 "검증 완료 (시나리오 N PASS)" / "검증 미실시 (사용자 회신 대기)" 로 명확 구분.
- **진단 메시지 형식이 결정적**:
  - `permission denied for table X` = table-level GRANT 부재 (KI-22)
  - `new row violates row-level security policy` = GRANT 는 있으나 RLS 거부 (user_id mismatch 등)
  - 두 메시지를 구별 못 하면 RLS policy 만 의심하다 시간 낭비. Phase 5.4 Storage 진입 시 동일 패턴 주의.
- **forward-only migration 일관**: 기존 파일 수정 금지, 새 `NNNN_*.sql` 추가만. 0002 가 첫 보충 사례.

## 5. D-4s 다음 턴 스펙

### 5.1 진도표

| Phase | 내용 | 상태 |
|---|---|---|
| 0 ~ 5.2 | 인프라 / DB / RLS / GRANT | 완료 (D-4r home 보충 종결) |
| 5.3 | Auth (SSR + UI + RLS 검증) | 완료 (D-4q home 종결) |
| 5.4 | Storage | D-4s 진입 (Chunk 5) |
| 5.5 | CRUD | D-4s 이후 |

V1 약 87%.

### 5.2 D-4s 첫 작업 후보

**A. Phase 5.4 Storage 진입 (Chunk 5) — 권장**
- Supabase Storage `photos` bucket 생성 + `storage.objects` RLS policy
- **KI-22 교훈 적용**: `storage.objects` 에도 GRANT 필요 여부 사전 확인 (Supabase 가 storage schema 에 기본 GRANT 를 미리 두는지 검증 후 migration 작성)
- thin slice: 단일 파일 업로드 + 본인만 다운로드 검증

**B. (옵션) `apps/web/lib/supabase.ts` deprecate (T2)**
- 사용처 1곳 확인됨: `apps/web/app/supabase-check/page.tsx` (D-4o Phase 5.1 잔재)
- thin slice = 사용처 정리 (또는 페이지 제거) + supabase.ts 삭제 + 재 build 검증
- Storage 진입 전 사전 정리 권장

**C. (옵션) Chunk 4 임시 UI 정리**
- login page 의 createProject form/ul 을 Phase 5.5 (CRUD) 정식 분리 시 자연스럽게 처리. D-4s 단독 작업으론 불필요.

권장 진입 = **A**. B 는 1회 grep 확인 후 단일 chunk 처리 가능.

### 5.3 잠재 위험

- `storage.objects` RLS 패턴 (`bucket_id = 'photos'` + `(storage.foldername(name))[1] = auth.uid()::text`) 이 DB RLS 와 미세히 다름. domain-model.md §9.3 의 "개념 예시" 주석 + 공식 문서 확인 의무.
- **KI-22 적용**: Storage migration 작성 시 `storage.objects` 의 `authenticated` GRANT 도 사전 검증. RLS policy 만으로 부족할 가능성 (Supabase 기본값 의존).
- multipart/form-data 처리 위치 결정: server action + Buffer 또는 client 직접 upload. 첫 시도는 client 직접 (Supabase SDK `storage.from().upload()`) 권장.
- 타입 캐스팅 방향 고정 (domain-model.md §9.3): `auth.uid()::text` 만 사용, 반대 방향 금지.

## 6. 새 대화창 시작 가이드

복사 붙여넣을 첫 PROMPT

```
--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

D-4r home 종결 (KI-21 해결 + Phase 5.2 GRANT 누락 보충 + 시나리오 1/2/3 PASS + 2 commits push). 회사 PC (D-4s) 환경 진입.

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4r home 에서 publishable key 변수명 표준화 + 0002 migration GRANT 보충 + Gate 2 통과. Phase 5.2 (DB + RLS + GRANT) 종결. 다음 = Phase 5.4 (Storage) 진입.

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4r-home-to-d4s.md

D-4s 즉시 액션:
1. apps/web/.env.local 변수명 수동 rename (NEXT_PUBLIC_SUPABASE_ANON_KEY → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) — 누락 시 build 실패
2. KI-16 의무 (pull + pnpm install)
3. Phase 5.4 Storage 진입 (Chunk 5)
4. (옵션) T2 supabase.ts deprecate 1회 grep + 정리

D-4 시리즈 방법론 (KI-12~22 누적) + KI-22 (RLS + GRANT 동시 필요) 인지.

handoff 요약 보고 후 "D-4s Planner 본 턴 시작" 대기.
--- CUT ---
```

### 전환 체크리스트

- [x] T1 (KI-21 rename) commit + push 완료 (`28de2c3`)
- [x] T1A (Phase 5.2 GRANT 보충) commit + push 완료 (`c8f2c0e`)
- [ ] 본 handoff push 완료 (이 commit 이후)
- [ ] D-4s 회사 PC 새 대화창에서 환경 검증 (preamble + .env.local rename + git pull + pnpm install)
- [ ] handoff 요약 후 본 턴 시작
