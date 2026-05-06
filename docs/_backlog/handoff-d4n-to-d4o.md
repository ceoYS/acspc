# Handoff — D-4n → D-4o (2026-05-04, Session 15 end)

## 1. Session 15 (D-4n) 종결 요약

D-4n = Phase 5.1 (Supabase 클라이언트 셋업) thin slice 진입 + 정착. handoff §5.1 의 "hello supabase 1회 호출" 종결 기준 100% 달성.

5 chunk 진행 (1 회복 chunk 포함):
- Chunk 1 (docs-only): tech-stack.md §1.5 supabase-js 2.105.1 명시 핀 + 루트 .env.example 신설 (HEAD=072399e)
- Chunk 1.5 (docs-only): tech-stack.md §4 버전 정책 본문 = caret 범위 → exact pin + lockfile 정합 (HEAD=fc45f45)
- Chunk 2 Step A (의존성): apps/web + apps/mobile 양쪽에 @supabase/supabase-js 2.105.1 install (HEAD=8bca437)
- Chunk 2 Step B (env, commit 없음): apps/web/.env.local 사용자 직접 작성 (gitignored)
- Chunk 3 (코드): apps/web/lib/supabase.ts + apps/web/app/supabase-check/page.tsx 신설 (HEAD=4355863) → CI #8 FAIL
- Chunk 4-revised (회복): supabase.ts lazy initialization + force-dynamic 보존 (HEAD=2be2855) → CI #9 PASS

검수 결과: Critical 0 (commit 시점), High 0. CI #9 50초 통과 (`2be2855` HEAD). Phase 5.1 정착 확정.

### 환경 특이사항 (D-4n)
- **집 PC (DESKTOP-CTPJ4S5, sinabro@)** 단독 작업
- pnpm 10.33.0, nodeLinker: hoisted (root node_modules 평면)
- 의존성 install: web 13.1s + mobile 4.2s (store cache 효과)
- CI 시뮬레이션 (.env.local 백업 후 build) 으로 KI-10 회피 검증 정합

## 2. 환경 가정 + 검증

본 turn 진입 시 다음 명령으로 환경 확증.

### 회사 PC (founder_ys@HG2501034N03)

```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" \
&& export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& pwd \
&& git remote -v \
&& node --version \
&& ls ~/.certs/corp-root.pem \
&& git log --oneline -1
```

기대 출력:
- /home/founder_ys/work/acspc
- origin https://github.com/ceoYS/acspc.git (fetch)
- v22.22.2
- cert 존재
- HEAD: D-4n Chunk 4-revised (`2be2855`) 또는 그 이후

### 집 PC (sinabro@DESKTOP-CTPJ4S5)

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& cd ~/work/acspc \
&& pwd \
&& git remote -v | head -1 \
&& node --version \
&& git log --oneline -1
```

cert 라인 제거 (집 망 외). 그 외 동일 검증.

## 3. D-4n 핵심 결정 (변경 사항)

### 3.1 exact pin 정책 (Chunk 1.5)

`.claude/rules/tech-stack.md` §4 버전 고정 정책 본문 = caret 범위 → **exact pin** (정확 버전 명시, caret/tilde 금지) 으로 변경. 근거:
- 실제 운영 (next 15.5.15, expo 54, expo-router 6.0.23 등) 이 이미 exact pin
- lockfile (pnpm-lock.yaml) 가 차원 보장
- 사용자 원칙 "오류 최소화 + 안정 + 재현성" 정합

이후 모든 의존성 추가 = exact pin 표기. 향후 chunk 도 동일 정책 따름.

### 3.2 lazy initialization 클라이언트 패턴 (Chunk 4-revised, KI-10 회복)

`apps/web/lib/supabase.ts` = module-level throw 제거, **lazy initialization 함수** (`getSupabase()`) 로 변경. 본문:

```typescript
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.",
    );
  }

  cachedClient = createClient(url, anonKey);
  return cachedClient;
}
```

호출 측 = `getSupabase().auth.getSession()`. force-dynamic 라인 (Chunk 4 산출) 보존 = 안전망 (이중 보호).

근거: Next 15 + Turbopack 의 build "Collecting page data" 단계가 module evaluation 자체를 트리거 → module-level throw 발동. lazy init = module load 시 함수 정의만, 호출 시 본문 실행 → throw 회피.

향후 Phase 5 의 다른 페이지 / mobile 측 호출 모두 동일 패턴 적용.

### 3.3 양 앱 직접 install 패턴 (D1 결정)

`packages/api` 래퍼는 V1 후반 마이그레이션. 현재는 양 앱 (apps/web, apps/mobile) 직접 install + import. 근거:
- thin slice 정합
- packages/api 신설 = 별도 chunk 가치 (tsconfig + package.json 등 추가)
- pnpm hoisted = root node_modules 단일 인스턴스 (디스크 비용 0)

### 3.4 .env.local 양 앱 분리 (D2 결정)

- `apps/web/.env.local`: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (Next 자동 로드)
- `apps/mobile/.env.local`: EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY (Expo SDK 49+ 자동 로드)

루트 `.env.example` (tracked) = 양 prefix 모두 placeholder (D-4n Chunk 1 산출). 실제 값은 .env.local (gitignored) 에만.

⚠️ 본 D-4n 에서는 **apps/web/.env.local 만 작성**. apps/mobile/.env.local 은 Phase 5.3 (Auth) 또는 mobile 측 호출 검증 시점에 추가.

### 3.5 /supabase-check 페이지 보존 결정

`apps/web/app/supabase-check/page.tsx` = 검증 전용 페이지. force-dynamic 분류. V1 후반 정식 화면 대체 결정 보류.

근거:
- 디버깅 가치 (하루 단위 환경 검증 가능)
- force-dynamic + lazy init = 안전망
- 제거 비용 < 보존 가치 (Phase 5.5 CRUD 진입 시 정식 화면으로 점진 대체)

## 4. D-4n 신규 백로그 후보 (KI-02~11, MF-31)

### 4.1 known-issues.md 신규 등재 후보

D-4n 진행 중 발견된 패턴 10건. handoff §11 (D-4o 진입 시 known-issues.md 업데이트 chunk) 에서 본문 등재.

| KI | 패턴 |
|---|---|
| KI-02 | 집 PC 셋업 패턴 (cert 라인 제거 + 별도 fine-grained PAT 90일 + KI-01 정합) |
| KI-03 | pnpm `nodeLinker: hoisted` 모드 검증 시 `.pnpm` glob 무용. root `node_modules/@scope/package` 검증 |
| KI-04 | Codex CLI 호출 시 ===PROMPT=== 임베딩하면 Codex 가 작업 실행 시도. 사후 평가 모드 + "절대 금지" 헤더로 회피 |
| KI-05 | Codex PROMPT 내 sub-section 헤더 인식 약함 (false positive 다발). 적중률 약 50% |
| KI-06 | bash 체인 `cd ... && set +e` 의 `set +e` 미도달 가능. 줄바꿈 분리 |
| KI-07 | Claude Code 가 회사 PC preamble (NODE_EXTRA_CA_CERTS) 자동 추가 경향. 집 PC 작업 시 cert 라인 제거 명시 헤더 필수 |
| KI-08 | 정찰 명령 작성 전 환경 전제 (lockfile importer 순서, nodeLinker 등) 직접 read 의무 |
| KI-09 | `echo "label" / echo $?` 분리 시 $? 가 echo 의 exit code (항상 0). 단일 라인 `echo "label exit: $?"` 또는 명령 직후 `echo $?` 만 단독 |
| KI-10 | Next 15 + Turbopack module-level throw + Server Component import 시 build "Collecting page data" 단계 fail. force-dynamic 만으로는 회피 불가, lazy init 필요 |
| KI-11 | 회피 가설은 사전 시뮬레이션 통과 후에만 진입. 추정 PROMPT 작성 금지 |

### 4.2 minor-fixes.md 신규 등재 후보

| MF | 패턴 |
|---|---|
| MF-31 후보 | apps/mobile @types/react peer dep mismatch (19.1.17 vs @types/react-dom 19.2.3 요구 19.2.0+). pnpm 의존성 추가 시 warning 노출. 본 chunk 외 부채. V1 후반 또는 별도 chunk |
| MF-32 후보 | pnpm 10 ignored build scripts warning (esbuild, sharp, simple-git-hooks, unrs-resolver). pnpm approve-builds 결정 필요. 현재 빌드 정상 동작 |

## 5. D-4o 다음 턴 스펙 — Phase 5.2 (DB 스키마 + RLS)

### 5.1 D-4o = Phase 5.2 진입

handoff §7 진도표: Phase 5 = 데이터 레이어. Phase 5.1 (D-4n) 완료 → Phase 5.2 진입 가능.

**D-4o 의 thin slice = Phase 5.2 만**:
- DB 스키마 정의 (테이블 5종): projects, locations, trades, vendors, photos
- RLS 정책 (V1 단일 사용자: `user_id = auth.uid()`)
- packages/domain 의 zod 스키마 ↔ Supabase DB 컬럼 (snake_case) 정합 검증

**Phase 5 잔여 단계 (참고)**:
- 5.2: DB 스키마 + RLS ← D-4o
- 5.3: 인증 (web cookie + mobile AsyncStorage)
- 5.4: 스토리지 (storage_path regex 정합 — D-4m 산출물 활용)
- 5.5: CRUD 연동

### 5.2 D-4o 첫 정찰 후보

3답 받기 전 미정. 첫 정찰 안:
1. tech-stack.md §5 RLS 규칙 정합 확인 (`user_id = auth.uid()` 패턴, V1 단일 사용자)
2. .claude/rules/domain-model.md 본문 (테이블 / 컬럼 / 관계 명세, snake_case 정합)
3. packages/domain/src/* 의 zod 스키마와 DB 컬럼 정합 (이미 snake_case 확인됨)
4. supabase 디렉토리 / migration 파일 존재 여부 (D-4n 미생성 정합)
5. Supabase Dashboard SQL Editor 접근 가능성 (Supabase Cloud) — 사용자 확인

### 5.3 잠재 위험

- **DB 스키마 첫 적용**: Supabase migration vs SQL Editor 직접 입력 결정 필요
- **RLS 정책 V1 단일 사용자**: `user_id = auth.uid()` 패턴 정합 검증. auth.uid() 시점 (Auth Phase 5.3 진입 전) 에 RLS 동작 검증 가능 여부 미확인
- **packages/domain 정합 보존**: 이미 박힌 zod 스키마 (storage_path regex 등 D-4m 산출 + 5종 entities) 와 DB 컬럼 정확 일치 필수
- **migration 파일 위치**: `supabase/migrations/` (Supabase CLI 표준) — supabase init 여부 확인 필요
- **Phase 5.2 의 thin slice**: 5종 테이블 한 번에 vs 단계별 분할 (예: projects + locations 먼저, trades + vendors + photos 후속) 결정 필요

### 5.4 Phase 5.2 진입 전 확증 (D-4o 첫 turn)

- HEAD = D-4n Chunk 4-revised (`2be2855`) 또는 그 이후 정합
- known-issues.md = KI-02 ~ KI-11 등재 완료 상태 (D-4n 종결 chunk 6 의 commit 후)
- Phase 5.1 산출물 보존: apps/web/lib/supabase.ts (lazy init), apps/web/.env.local, apps/web/app/supabase-check/page.tsx (force-dynamic)

## 6. D-4n 잔여 백로그 (V1 후반 처리)

D-4j 잔여 (D-4m handoff 보존) + D-4n 신규:
- **MF-06 H3**: V1 후반 (재검토 필요 명문화)
- **MF-06 H4 (unique)**: V1 후반 (Phase 5 Supabase DB 레벨)
- **MF-11**: apps/web tsconfig 재구성. V1 후반
- **MF-02**: tailwind v3/v4 통합. V1 후반
- **MF-27**: lint-staged + prettier. V1 후반
- **MF-28/29/30**: V1 후반 또는 트리거 시점
- **MF-31 후보 (D-4n 신규)**: mobile @types/react peer dep mismatch
- **MF-32 후보 (D-4n 신규)**: pnpm 10 ignored build scripts warning

## 7. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | 완료 |
| 4.4 코드 검수 | 전 코드 검수 (MF-25) | 완료 (D-4j, HEAD=02ea380) |
| 4.5 자동 검증 | Node pinning + MF-22/23/21 종결 | 완료 (D-4l, HEAD=694135a) |
| 4.6 MF-06 H1 close | storage_path regex + test 6 case | 완료 (D-4m, HEAD=f075462) |
| 5.1 데이터 레이어 — 클라이언트 셋업 | Supabase JS 2.105.1, .env.local, lazy init, hello supabase 호출 | **완료 (D-4n, HEAD=2be2855)** |
| 5.2 데이터 레이어 — DB 스키마 + RLS | 5종 테이블, RLS user_id 패턴 | **D-4o 진입** |
| 5.3 데이터 레이어 — Auth | web cookie + mobile AsyncStorage | 대기 |
| 5.4 데이터 레이어 — Storage | storage_path regex 정합 | 대기 |
| 5.5 데이터 레이어 — CRUD | 양 앱 연동 | 대기 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 **70% 지점** (Phase 5.2 진입 직전, 5.1 종결).

## 8. 새 대화창 시작 가이드 (D-4o)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4n 완료 (Phase 5.1 종결, hello supabase 호출 정착, KI-10 회복 완료, HEAD=2be2855 + known-issues 등재 commit).

오늘 진입 = D-4o (Phase 5.2 = DB 스키마 + RLS, thin slice).

GitHub public: https://github.com/ceoYS/acspc

배경 (인지):
D-4n 5 chunk 완료 (Chunk 1, 1.5, 2 Step A, 3, 4-revised). Phase 5.1 thin slice = "hello supabase 1회 호출" 종결 기준 100% 달성.
KI-02 ~ KI-11 known-issues.md 등재 완료. MF-31, MF-32 후보 백로그.
사용자 결정: D-4n 종결 → Phase 5.2 진입.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4n-to-d4o.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- D-4o 목표 = Phase 5.2 (DB 스키마 + RLS, thin slice)
- 5.3~5.5 (Auth, Storage, CRUD) 는 후속 D-4p 이후 분할
- Codex CLI 외부 Evaluator 활용 가능 (KI-04 회피 = 사후 평가 모드 + "절대 금지" 헤더 필수). Planner 재확증 의무
- bash_tool preamble 필수 (CA 파일명 corp-root.pem) — 회사 PC 만, 집 PC 는 cert 라인 제거 (KI-02)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지 (단 docs-only 묵시적 승인 패턴 인정)
- explicit add list, no git add .
- CI 자동 검증: 매 push 마다 smoke + lint 통과 필수 (현재 평균 ~50초)

D-4 시리즈 방법론 — 필수 준수:
1. MF-13 우회: pnpm install/test 사용자 직접 실행, Claude Code 는 로그 grep
2. MF-14 정찰: git ls-files + git check-ignore -v
3. Chunk 분할, 선행 조건 명시, 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep
5. 120초 STOP 조항
6. vitest 판정은 "Tests N passed (N)" 요약만
7. turbo grep 시 ^ anchor 금지
8. Codex CLI 활용 가능 (단일 분야, file:line 근거, KI-04 회피 헤더). Planner 첫 정찰 재확증 의무
9. MF-20: Claude Code stdout 20 라인 제한
10. MF-24: rg 금지, grep -n 사용
11. 이슈 25 (D-4j): Generator 프롬프트 = 수행 명령만. Planner/Evaluator 메타는 사용자 메시지에만
12. KI-01 (D-4l): workflow 파일 변경 push 시 fine-grained PAT 의 Workflows permission 필수
13. KI-02 (D-4n): 집 PC 작업 시 cert 라인 제거 + 별도 PAT
14. KI-03 (D-4n): pnpm hoisted 모드 검증 시 .pnpm glob 무용, root node_modules 검증
15. KI-04 (D-4n): Codex 호출 시 사후 평가 모드 + 절대 금지 헤더 필수
16. KI-05 (D-4n): Codex false positive 다발 → Planner 재확증 의무
17. KI-06 (D-4n): bash 체인 cd && set +e 미도달 위험 → 줄바꿈 분리
18. KI-07 (D-4n): Claude Code 회사 preamble 자동 추가 경향 → 집 PC 명시 헤더
19. KI-08 (D-4n): 정찰 명령 작성 전 환경 전제 직접 read 의무
20. KI-09 (D-4n): echo "label" / echo $? 분리 mask 위험 → 단일 라인
21. KI-10 (D-4n): Next 15 + Turbopack module evaluation throw → lazy init 필수
22. KI-11 (D-4n): 회피 가설 사전 시뮬레이션 통과 후 진입 의무

D-4o 진입 즉시 정찰 (Planner):
- HEAD 정합성 확인 (D-4n Chunk 4-revised `2be2855` 또는 그 이후, KI 등재 commit 포함)
- .claude/rules/domain-model.md 본문 (테이블 / 컬럼 / 관계 명세)
- .claude/rules/tech-stack.md §5 RLS 규칙 (V1 단일 사용자 패턴)
- packages/domain/src/* zod 스키마 (snake_case 정합 재확증)
- supabase 디렉토리 존재 여부 (D-4n 미생성 정합)
- Supabase Cloud SQL Editor 접근 자동 정찰

handoff 요약 보고 후 "D-4o Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4n Chunk 4-revised commit hash (`2be2855`) + KI 등재 commit 을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더 (회사 PC = cert 포함, 집 PC = cert 제거)
- [ ] D-4n 핵심 결정 (exact pin 정책, lazy init 패턴, 양 앱 직접 install, .env.local 분리) 인식 확인
- [ ] D-4o 목표 (Phase 5.2 DB 스키마 + RLS, thin slice) 인식 확인
- [ ] Supabase Cloud SQL Editor 접근 가능성 사용자 확인 (D-4o 첫 turn)
- [ ] KI-10 회복 패턴 (lazy init) 향후 모든 Supabase import 시 적용 의무 인식
