# Handoff — D-4q office → home (2026-05-07, Session 18 pause)

## 1. 회사 PC 측 진행 종결

D-4q = Phase 5.3 잔여 (Chunk 3 login UI + Chunk 4 RLS 검증). 회사 PC 에서 Chunk 3 v2 commit 완료, Chunk 4 미진입, 환경 트러블슈팅 진행 중.

### Chunk 3 진행
- v1 (작성 + 검증): 신규 2 파일 138 lines, check-types ✓ / next build ✓ / `/login` ƒ 인식
- Codex Evaluator (외부 검토): 🔴 0 / 🟠 0 / 🟡 4 / 🟢 2
- v2 (Codex 권고 흡수, commit `56bb40e`): Med 4 + Low 1 흡수, Low 2 (hover/focus-visible) deferred
  - actions.ts 42 → 48 lines: typeof 검증 + signUp `data.session` 검증 + signOut error 분기
  - page.tsx 96 → 100 lines: error div `role="alert"` + 4 input `aria-label`
  - check-types exit=0 (4.348s), next build exit=0 (6.2s), `/login` ƒ 유지

### 환경 트러블슈팅 (집 PC 에서 마무리)
- Cloud Auth 정책 mismatch 발견: `mailer_autoconfirm: false` (= Confirm email **ON**), handoff §5.2.1 결정 (OFF) 미적용 상태
- Supabase publishable key 401 → `.env.local` 갱신 후 200 OK (해결됨, KI-19 후보)
- Dashboard UI 의 "Confirm email" 토글이 Sign In / Providers → Email provider 영역에 부재. 다른 sub-page 또는 Management API 로 이동 추정 (KI-20 후보)
- Gate 2 시나리오 D 미완 = Cloud 정책 적용 후 집 PC 에서 마무리

### 환경
- 회사 PC (founder_ys@HG2501034N03) 에서 D-4q office 종결
- 집 PC (sinabro@DESKTOP-CTPJ4S5) 진입 = D-4q home

## 2. 환경 가정 + 검증 (집 PC, KI-16 의무)

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
cd ~/work/acspc
git pull origin main
pnpm install
git log --oneline -3
```

기대 HEAD: `<HANDOFF_HASH>` (handoff push) → `56bb40e` (Chunk 3 v2) → d603e6e (D-4p handoff).

## 3. D-4q home 다음 턴 스펙

### 3.1 즉시 액션
1. 집 PC 환경 진입 + `pnpm install` (KI-16)
2. Cloud Auth 정책 적용:
   - 옵션 A: Dashboard 다른 sub-page 재탐색
   - 옵션 B (권장): Management API
 export SUPABASE_ACCESS_TOKEN="<temp token>"
 curl -X PATCH "https://api.supabase.com/v1/projects/ikeapcahcikxqkaclgas/config/auth" \
   -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{"mailer_autoconfirm": true}'
3. `/auth/v1/settings` curl 검증 (`mailer_autoconfirm: true` 확인)
4. token revoke

### 3.2 Gate 2 시나리오 D 마무리
- `cd ~/work/acspc/apps/web && pnpm dev`
- 브라우저: `http://localhost:3000/login` → ceo@nitual.com (또는 다른 email) + 6+자 password → Sign up → `Logged in as ...` 확인 = Chunk 3 Gate 2 완전 PASS
- 추가 시나리오 E (signout) / F (signin 재시도)

### 3.3 Chunk 4 (RLS 검증, Phase 5.3 종결)
- 인증 session 으로 단일 protected resource 1건 호출 (thin slice)
- 기존 `apps/web/lib/supabase.ts` deprecate 결정 가능 시점

### 3.4 잠재 위험
- 집 PC 첫 install 시 lockfile 변경분 반영 (Chunk 3 v2 의 의존성 추가 0이므로 영향 없음)
- Cloud 정책 변경 후 propagation 1-2분 지연 가능
- 시나리오 D 에서 "Sign up succeeded but session missing — check Supabase Confirm email policy" 메시지 = 정책 적용 미완 신호 (Med-2 흡수 효과 검증)

## 4. KI 신규 후보 (V1 후반 known-issues.md 일괄 등재)

- **KI-19**: Supabase 신규 publishable key (`sb_publishable_*`) 첫 호출 시 HTTP 401 "Invalid API key" 가능. 원인 추정 = key migration / propagation. 우회 = `.env.local` 키 갱신 + dev server 재기동, 또는 project 재시작
- **KI-20**: Supabase Dashboard UI 의 "Confirm email" 토글이 Authentication → Sign In / Providers → Email provider 영역에 부재 (UI 변경 추정). 우회 = Management API `PATCH /v1/projects/{ref}/config/auth` 의 `mailer_autoconfirm: true` 직접 설정

기존 KI-12~18 은 D-4o + D-4p handoff 에서 보존. V1 종료 시 일괄 정리.

## 5. 전체 진도

| Phase | 내용 | 상태 |
|---|---|---|
| 0 ~ 5.2 | 인프라 / DB / RLS | 완료 |
| 5.3 | Auth — prep + SSR 토대 | 완료 (D-4p) |
| 5.3 | Auth — login UI v2 | **D-4q office 부분 완료 (`56bb40e`)** |
| 5.3 | Auth — Cloud 정책 + 시나리오 D | D-4q home 진입 |
| 5.3 | Auth — Chunk 4 RLS 검증 | D-4q home |
| 5.4 | Storage | D-4r |
| 5.5 | CRUD | D-4r 이후 |

V1 약 **82%**.

## 6. 새 대화창 시작 가이드 (D-4q home)

### 복사 붙여넣을 첫 PROMPT

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
D-4q office 종결 (Chunk 3 v2 commit `56bb40e` + handoff push). 집 PC 진입 = D-4q home.
환경 = 집 PC (sinabro@DESKTOP-CTPJ4S5), pull + pnpm install 의무 (KI-16).

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4q office 에서 Chunk 3 (login UI + password thin slice) v2 commit 완료. Codex Evaluator Med 4 + Low 1 흡수, Low 2 deferred. 환경 트러블슈팅 (Cloud Auth Confirm email 정책 mismatch + Supabase publishable key 첫 호출 401 + Dashboard UI 변경) 진행 중. 집 PC 에서 마무리 + Chunk 4 진입.

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4q-office-to-home.md

D-4q home 즉시 액션:
1. pnpm install (KI-16)
2. Cloud Auth 정책 적용 (Management API 권장)
3. /auth/v1/settings 검증
4. dev server 재기동 + Gate 2 시나리오 D 마무리
5. Chunk 4 (RLS 검증) 진입

D-4 시리즈 방법론 (KI-12~20 누적) 그대로 + 신규 KI-19, KI-20 인지.

handoff 요약 보고 후 "D-4q home Planner 본 턴 시작" 대기.
--- CUT ---

### 전환 체크리스트
- [ ] 본 handoff push 완료
- [ ] 새 대화창에서 HEAD 인지 (`<HANDOFF_HASH>` + `56bb40e`)
- [ ] 집 PC preamble (cert 라인 제거 + NEXT_TELEMETRY_DISABLED=1)
- [ ] pnpm install (KI-16)
- [ ] Cloud Auth 정책 적용 (Management API or Dashboard)
- [ ] mailer_autoconfirm: true 검증
- [ ] 시나리오 D PASS 도달
- [ ] Chunk 4 (RLS 검증) 진입
