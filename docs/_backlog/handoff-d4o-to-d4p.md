# Handoff — D-4o → D-4p (2026-05-07, Session 16 end)

## 1. Session 16 (D-4o) 종결 요약

D-4o = Phase 5.2 (DB 스키마 + RLS) thin slice 진입 + 정착. 100% 종결.

6 chunk 진행 → 2 git commit + 1 Cloud 적용:
- **Chunk 1+1.5** (docs-only): D-4n handoff §5.1 + §5.3 의 5종 명단 사실 정정 — `users` 제거 + `trades` 추가 (line 160 + line 185, +2/-2)
- **Chunk 2** (commit + push): 위 정정 → HEAD=`7865c9c`
- **Chunk 3-A** (정찰): `.claude/rules/domain-model.md §7` 본문 read (인덱스 정의 = §7.1 Photo 3개 + §7.2 마스터 unique 자동 의존)
- **Chunk 3-B** (코드): `supabase/migrations/0001_init.sql` 신규 (132 lines, 5종 테이블 + FK + RLS + §7.1 인덱스 + begin/commit 래핑)
- **Chunk 4** (Cloud 적용): Supabase Dashboard SQL Editor paste + Run = "Success. No rows returned"
  - 검증 1: 5종 `rowsecurity=true` ✓
  - 검증 2: 5 policy `ALL`/`{authenticated}`/`(user_id = auth.uid())` (using + with_check 동일) ✓
  - 검증 3: `photos_pkey` + 3 §7.1 인덱스 ✓
- **Chunk 5** (commit + push): 0001_init.sql → HEAD=`c33d125`

검수: Critical 0, High 0. Codex 외부 Evaluator 통과 (Medium 4건 + Low 2건 모두 의도된 결정 또는 V1 단일 사용자 시나리오 무관). CI 결과 사용자 GitHub UI 별도 확인 권장.

### 환경 특이사항
- 집 PC (`sinabro@DESKTOP-CTPJ4S5`) 에서 Chunk 1~5 진행
- 회사 PC (`founder_ys@HG2501034N03`) 에서 Chunk 6 (handoff) 진입
- Supabase Cloud `ikeapcahcikxqkaclgas` (D-4n 셋업)
- 양 환경 `apps/web/.env.local` 신설 (회사 PC 측 본 turn 시작 시 추가)

## 2. 환경 가정 + 검증

### 회사 PC (founder_ys@HG2501034N03)
```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" \
&& export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& cd ~/work/acspc \
&& pwd \
&& git remote -v | head -1 \
&& node --version \
&& ls ~/.certs/corp-root.pem \
&& git log --oneline -1
```
기대: `/home/founder_ys/work/acspc` + `ceoYS/acspc` + `v22.22.2` + cert + HEAD `c33d125` 또는 그 이후 (Chunk 6 commit 포함).

### 집 PC (sinabro@DESKTOP-CTPJ4S5) — cert 라인 제거 (KI-02, KI-07)
```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& cd ~/work/acspc \
&& pwd \
&& git remote -v | head -1 \
&& node --version \
&& git log --oneline -1
```

## 3. D-4o 핵심 결정

### 3.1 5종 테이블 명단 정합 (Chunk 1+1.5, 7865c9c)
- 잘못 (D-4n handoff §5.1): `users, projects, locations, vendors, photos`
- 올바름: `projects, locations, trades, vendors, photos`
- `users` 부재 = Supabase `auth.users` 사용 (별도 `public.users` 미신설, V1 단일 사용자)
- `trades` = D-4g (domain refine) 시점 정의

### 3.2 Migration 경로 = SQL Editor 직접 + git tracked
- Supabase CLI 미도입 (registry 의존 우회). V1 후반 재검토.
- `supabase/migrations/0001_init.sql` 수동 명명 + git tracked
- Cloud Dashboard SQL Editor 직접 paste + Run

### 3.3 RLS 단일 패턴
```sql
create policy "{table}_user_full_access"
  on public.{table}
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```
모든 5종 동일. `begin;...commit;` 트랜잭션 래핑.

### 3.4 §7.2 마스터 인덱스 = unique 자동 의존 (V1 후반)
- locations/trades/vendors `(project_id, name)` unique 제약 미적용 (MF-06 H4)
- 따라서 자동 인덱스도 미생성. V1 후반 unique 추가 시점에 함께.
- §7.1 Photo 인덱스 3개만 본 chunk: `photos_project_taken_at_desc_idx`, `photos_project_vendor_taken_at_desc_idx`, `photos_project_taken_at_idx`

### 3.5 Codex Evaluator 활용 패턴 (KI-04/05 재확증)
- 사후 평가 모드 + "절대 금지" 헤더 + 평가 대상 SQL 본문 inline + Planner 재확증
- false positive 패턴 확증: Medium 4건 (DB check constraint = 의도된 V1 후반), Low 2건 (cross-project FK / user_id 일치 미강제 = §4 + V1 단일 사용자 정합)

## 4. 신규 백로그 / KI 후보

### 4.1 known-issues.md 등재 후보 (등재는 D-4p 또는 별도 chunk 결정)
- **KI-12 후보**: Claude.ai 응답 메시지 길이 제한 → 큰 PROMPT 분할 의무 (D-4n 진입 메시지 명시 사항)
- **KI-13 후보** (D-4o 신규): Claude Code stdout 자동 압축 (`+N lines (ctrl+o to expand)`) → 정찰 시 본문 paste 미확보 위험. **expand 후 본문 paste 명시 필수**
- **KI-14 후보** (D-4o 신규): Supabase API URL (`{ref}.supabase.co`) ≠ Dashboard URL (`supabase.com/dashboard/project/{ref}`). 사용자 안내 시 정확 URL 명시
- **KI-15 후보** (D-4o 신규): handoff 작성 누락 위험. "Chunk 5 push 후 마무리" 인식이 Session Transition handoff 미작성으로 이어질 수 있음. **하루 세션 종료 시 handoff = Chunk 5 와 별도 chunk 명시 의무**
- **KI-16 후보** (D-4o 종결 시 신규): 새 환경 (집 PC ↔ 회사 PC) 첫 진입 시 `pnpm install` 의무. pre-commit hook (turbo run check-types) 가 모든 commit-gating → node_modules 미설치 상태에서 docs-only chunk 도 commit 차단 (D-4o Chunk 6 STOP 패턴)

### 4.2 minor-fixes.md 등재 후보
- **MF-33 후보** (D-4o 신규): gh CLI 양 환경 (집 PC + 회사 PC) 미설치. CI 결과 자동 확인 어려움. V1 후반 또는 별도 chunk

## 5. D-4p 다음 턴 스펙 — Phase 5.3 (Auth)

### 5.1 thin slice
- Supabase Auth (signup/signin) — V1 단일 사용자
- web 측 cookie session (Server Components 정합)
- mobile 측 AsyncStorage session (별도 chunk 가능)
- Auth 진입 후 RLS 동작 실증 (authenticated session 으로 본인 row CRUD)

**Phase 5 잔여**: 5.4 Storage / 5.5 CRUD = D-4q 이후

### 5.2 첫 정찰 후보
1. `apps/web/lib/supabase.ts` (D-4n lazy init 패턴) → Server / Client 분리 필요 여부
2. `apps/mobile` 측 Supabase 미통합 정합 (`mobile/.env.local` 미존재)
3. Supabase Cloud Dashboard → Authentication → Providers / Confirm settings (signup 즉시 vs email confirm 사용자 사전 결정)
4. `apps/web/app/layout.tsx` + `middleware.ts` 현 상태
5. `@supabase/ssr` 도입 결정 (Next.js 15 App Router cookie session 정합)

### 5.3 잠정 분할 안

**옵션 A (Planner 권장): web 우선 단계적, mobile 별도 D-4q**
- D-4p Chunk 1 = Cloud Auth 설정 정찰 + 사용자 결정 (signup 활성, confirm 정책)
- D-4p Chunk 2 = `@supabase/ssr` 도입 + `lib/supabase.ts` 분리 (Server / Client / Middleware)
- D-4p Chunk 3 = web 측 minimal login UI (magic link 또는 password)
- D-4p Chunk 4 = authenticated session 으로 RLS 동작 실증 (insert projects + select 본인 row)
- D-4p Chunk 5 = mobile 통합 (또는 별도 D-4q)

**옵션 B**: SQL Editor user 직접 + RLS 검증 우선 (login UI V1 후반/D-4q)

### 5.4 잠재 위험
- Supabase Auth email confirm 설정 → 즉시 RLS 검증 어려움 (사용자 사전 결정 필요)
- `@supabase/ssr` exact pin 도입 (D-4n 정책 정합)
- mobile `/.env.local` 신설 + RN AsyncStorage adapter
- Phase 5.2 RLS = `to authenticated` → 미인증 anon = 0행 정합 (인증 후 정상 동작)

### 5.5 진입 전 확증 (D-4p 첫 turn)
- HEAD = `c33d125` (D-4o Chunk 5) + Chunk 6 (handoff push) 또는 그 이후
- `supabase/migrations/0001_init.sql` 보존
- `apps/web/.env.local` 양 환경 신설 완료
- `apps/mobile/.env.local` 미신설 (Phase 5.3 mobile chunk 시점)
- Supabase Dashboard Authentication 설정 사용자 사전 결정

## 6. 잔여 백로그 (V1 후반)

D-4n 잔여 + D-4o 신규:
- MF-06 H3, H4: V1 후반 (Vendor sanitize, unique 제약)
- MF-11, MF-02, MF-27, MF-28~32: V1 후반
- **MF-33 후보 (D-4o 신규)**: gh CLI 도입
- **KI-12~15 후보 (D-4o)**: known-issues.md 등재

## 7. 전체 진도

| Phase | 내용 | 상태 |
|---|---|---|
| 0 ~ 4.6 | 인프라 / 도메인 / 부채 / 검수 / MF-06 H1 | 완료 |
| 5.1 | 클라이언트 셋업 | 완료 (D-4n, 2be2855) |
| 5.2 | DB 스키마 + RLS | **완료 (D-4o, c33d125)** |
| 5.3 | Auth | **D-4p 진입** |
| 5.4 | Storage | 대기 |
| 5.5 | CRUD | 대기 |
| 6 | V1 실기능 | 대기 |

V1 약 **75%**.

## 8. 새 대화창 시작 가이드 (D-4p)

### 복사 붙여넣을 첫 PROMPT

아래 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4o 완료 (Phase 5.2 종결, 5종 + RLS + §7.1 인덱스 Cloud 적용 + 검증 4건 통과, HEAD=c33d125 + Chunk 6 handoff push commit).

오늘 진입 = D-4p (Phase 5.3 = Auth, thin slice).

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4o 6 chunk → 2 commit + 1 Cloud 적용. KI-12~15 후보 + MF-33 후보 백로그.
사용자 결정: D-4o 종결 → Phase 5.3 진입.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4o-to-d4p.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- D-4p 목표 = Phase 5.3 (Auth, thin slice)
- 5.4 (Storage), 5.5 (CRUD) 는 후속 D-4q 이후
- Codex CLI 외부 Evaluator (KI-04/05 회피)
- bash preamble (회사 PC = corp-root.pem 포함, 집 PC = cert 제거)
- 범위 확장 = scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수. 속도보다 안정.
- Gate 2 승인 전 push 금지 (docs-only 묵시적)
- explicit add list, no git add .
- CI 자동 검증

D-4 시리즈 방법론 — 필수 준수:
[D-4o 진입 메시지의 1~22번 그대로 +]
+ KI-12 (Claude.ai 메시지 길이 제한 → PROMPT 분할)
+ KI-13 (Claude Code stdout 압축 → expand 후 paste)
+ KI-14 (Supabase API URL ≠ Dashboard URL)
+ KI-15 (Session Transition handoff 별도 chunk 의무)

D-4p 진입 즉시 정찰 (Planner):
- HEAD 정합성 (c33d125 + Chunk 6 또는 그 이후)
- apps/web/lib/supabase.ts (lazy init 패턴 보존)
- apps/web/app/layout.tsx + middleware.ts 현 상태
- apps/mobile 측 Supabase 미통합 정합
- Supabase Cloud Dashboard → Authentication 설정 사용자 사전 결정 (signup 활성, confirm 정책)

handoff 요약 보고 후 "D-4p Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 체크리스트
- [ ] 본 handoff GitHub push 완료 (raw URL 접근 가능)
- [ ] 새 대화창에서 HEAD 인지 (c33d125 + Chunk 6 commit)
- [ ] preamble 회사/집 분기
- [ ] D-4o 핵심 결정 (5종 명단 / SQL Editor 직접 / RLS to authenticated / §7.2 후반) 인식
- [ ] Supabase Auth Confirm 정책 사용자 사전 결정
- [ ] mobile = 별도 D-4q 분할 가능성 인식
