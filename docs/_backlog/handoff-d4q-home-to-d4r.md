# Handoff — D-4q home → D-4r (2026-05-07, Session 19 종결)

## 1. D-4q home 종결 상태

D-4q office (회사 PC, Chunk 3 v2 commit `56bb40e` + handoff push `1b20a26`) 이어 집 PC 에서 D-4q home 진입. Cloud Auth 정책 마무리 + Chunk 3 시나리오 D/E/F + Chunk 4 코드 작성 + push 완료.

### Chunk 3 Gate 2 후속 (시나리오 D/E/F)

- 시나리오 D (signUp + session 즉시): PASS — `Logged in as test-d4q-home@nitual.com` 도달, `mailer_autoconfirm:true` 효과 검증
- 시나리오 E (signOut): PASS — signed-out state 복귀, `error` query 제거
- 시나리오 F (signIn 재시도): PASS — 같은 email + password 재로그인 후 logged-in 복귀
- → Chunk 3 v2 (`56bb40e`) Gate 2 100% 통과

### Cloud Auth 정책 적용 (D-4q office 미완 마무리)

- Management API `PATCH /v1/projects/{ref}/config/auth` `{"mailer_autoconfirm": true}` 적용
- `/auth/v1/settings` GET 200 + `mailer_autoconfirm:true` 검증
- 집 PC `.env.local` anon key 가 cloud sync 상태 (KEY_SET LEN=46), KI-19 재현 안 됨
- Token 발급/revoke 사용자 본인 수동 (보안 격리)

### Chunk 4 (RLS 검증 thin slice, option F-1) — commit `e937ed5d57d5bf20890c58fdcf7d94e865b88e7d`

- design: `apps/web/app/login/actions.ts` 에 `createProject` 추가 + `apps/web/app/login/page.tsx` logged-in section 에 form + ul
- INSERT/SELECT 시 `user_id` 는 server-side `getUser()` 추출 (client payload 무시, RLS with check 가 2차 방어)
- 별도 `/projects` route 미생성 (login page 내 임시 검증 UI, Chunk 5+ 정식 분리 예정)
- 변경: `actions.ts` +21, `page.tsx` +34 net (2 파일)
- check-types EXIT=0, next build EXIT=0, `/login` ƒ 유지, lockfile diff 0
- Gate 2 시나리오 G (브라우저 form + INSERT + ul) 사용자 측 PASS 인지 후 push 승인 — 결과 회신 컨텍스트 포화로 생략

## 2. 환경 전제 (집 PC, sinabro@DESKTOP-CTPJ4S5)

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
cd ~/work/acspc
```

회사 PC preamble (`NODE_EXTRA_CA_CERTS=...`) 는 집 PC 에서 미사용. corp-root.pem 미존재 경고는 무시 가능. KI-16 (대화창 시작 시 pull + install) 의무 유지.

## 3. KI 신규 등재 후보 (V1 후반 known-issues.md 일괄)

- **KI-19**: Supabase 신규 publishable key (`sb_publishable_*`) 첫 호출 시 HTTP 401 가능. 우회 = `.env.local` 갱신 + dev server 재기동, 또는 project 재시작.
- **KI-20**: Supabase Dashboard "Confirm email" 토글이 Authentication → Sign In/Providers → Email provider 영역에 부재 (UI 변경). 우회 = Management API `PATCH /v1/projects/{ref}/config/auth` 의 `mailer_autoconfirm: true` 직접 설정.
- **KI-21 후보**: `apps/web/.env.local` 의 publishable key 를 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 변수명으로 보유 중 (값 prefix 는 `sb_publishable_*` 신형). 동작 OK 이나 변수명/값 형식 mismatch — Chunk 5+ 진입 시 표준화 결정 (또는 그대로 유지) 판단 필요. D-4q office 합의 여부는 사용자 확인 필요 (D-4q home 정찰 단계 환각 가능성 있음).

기존 KI-12~18 은 D-4o + D-4p + D-4q office handoff 에서 보존.

## 4. D-4r 다음 턴 스펙

### 4.1 진도표

| Phase | 내용 | 상태 |
|---|---|---|
| 0 ~ 5.2 | 인프라 / DB / RLS | 완료 |
| 5.3 | Auth (SSR + UI + RLS 검증) | 완료 (D-4q home 종결) |
| 5.4 | Storage | D-4r 진입 |
| 5.5 | CRUD | D-4r 이후 |

V1 약 86%.

### 4.2 D-4r 첫 작업 후보

**A. Phase 5.4 Storage 진입 (Chunk 5) — 권장**
- Supabase Storage bucket 생성 + `storage.objects` RLS policy
- thin slice: 단일 파일 업로드 + 본인만 다운로드 검증
- D-4o Chunk 5 (Phase 5.2 DB) 와 같은 패턴 (migration + RLS + thin slice 검증)

**B. (옵션) `apps/web/lib/supabase.ts` deprecate**
- Chunk 3 의 새 client 패턴 (`@/lib/supabase/{client,server,middleware}`) 으로 완전 대체됐는지 grep 후 deprecate
- thin slice = grep + delete + 재 build 검증

**C. (옵션) Chunk 4 임시 UI 정리**
- login page 의 projects form/ul 을 Chunk 5/6 에서 정식 분리할지 또는 유지할지

권장 진입 = **A** (B 는 진입 직전 1회 grep 확인 정도). C 는 Chunk 6 (CRUD) 에서 자연스럽게 처리.

### 4.3 잠재 위험

- Storage RLS 의 policy 패턴이 DB RLS 와 미세히 다름 (`storage.objects` 테이블 + `bucket_id` 조건 추가 + path 기반 검증)
- 첫 file upload 의 `multipart/form-data` 처리 패턴 결정 (server action + Buffer 또는 client 직접 upload)
- Storage bucket 의 public/private 정책 + thin slice 단순성 trade-off
- KI-21 후보 (publishable key 변수명) 가 Chunk 5 중 영향 줄 가능성 (Storage SDK 도 같은 client 사용)

## 5. 새 대화창 시작 가이드

복사 붙여넣을 첫 PROMPT

```
--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

D-4q home 종결 (Chunk 3 시나리오 D/E/F PASS + Cloud Auth mailer_autoconfirm:true + Chunk 4 RLS 검증 push). 집 PC (sinabro@DESKTOP-CTPJ4S5) 환경 유지.

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4q home 에서 Chunk 3 Gate 2 100% + Chunk 4 (projects RLS thin slice) push 완료. Phase 5.3 (Auth) 종결. 다음 = Phase 5.4 (Storage) 진입.

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4q-home-to-d4r.md

D-4r 즉시 액션:
1. KI-16 의무 (pull + pnpm install)
2. Phase 5.4 Storage 진입 (Chunk 5)
3. (옵션) supabase.ts deprecate 1회 grep 확인

D-4 시리즈 방법론 (KI-12~20 누적) + 신규 KI-19/20 + KI-21 후보 인지.

handoff 요약 보고 후 "D-4r Planner 본 턴 시작" 대기.
--- CUT ---
```

### 전환 체크리스트

- [x] Chunk 4 commit + push 완료
- [x] 본 handoff push 완료 (이 commit)
- [ ] D-4r 새 대화창에서 환경 검증 (preamble + git pull + pnpm install)
- [ ] handoff 요약 후 본 턴 시작
