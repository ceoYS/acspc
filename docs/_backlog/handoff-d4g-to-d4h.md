# Handoff — D-4g → D-4h (2026-04-24, Session 8 end)

D-4h 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4f-to-d4g.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4g 완료)

- HEAD: (D-4h 진입 시 `git log --oneline -1` 로 실측)
- 총 commit 수: 31 또는 32 (Phase 1 commit 8f3218e + Phase 2 commit 1개 + 가능한 handoff 갱신)
- origin/main 동기화: Phase 2 push 후 완료 예정
- Working tree: clean (Phase 2 push 후)
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4g 에서 변경된 것 (2개 commit)

**8f3218e (feat(domain): reject whitespace-only name in ProjectSchema (mf-06, d-4g))** — 2 files:
- packages/domain/src/project.ts: ProjectSchema.name 에 `.refine((s) => s.trim().length > 0, "name cannot be blank")` 추가 (+5 lines)
- packages/domain/src/project.test.ts: 2 test case 추가 (single space, mixed whitespace tab/newline/space) (+20 lines)

**(Phase 2 commit hash)** — 3 files:
- .gitignore: `.codex` + `.codex/` 2줄 패턴 (파일/디렉토리 양쪽)
- docs/_backlog/minor-fixes.md: MF-17/18/19 + 이슈 로그 (메타, D-4g) + MF-15 후보 t/u 추가 (+69 lines)
- docs/_backlog/handoff-d4g-to-d4h.md: 신규 파일 (이 파일 자체)

### 1.2 D-4g 핵심 실증

- MF-06 Phase 1 완료: ProjectSchema.name 에 공백-only 거부 refine 추가, pnpm turbo test exit=0 + Tests 4 passed (4)
- zod v4 (4.3.6) refine API 실측 확인: `(check: Ch, params?: string | core.$ZodCustomParams): this`
- 교차 검증 패턴 실전 적용: Codex CLI 가 코드 로직 단일 분야 Evaluator 로 검토 → 🟡 수정 권장 1건 반영 후 투입
- Phase 4 (테스트/제약) 중 domain refine 1건 추가 완료

### 1.3 D-4g 방법론 교훈

- 이슈 17 (복수 Chunk 연속 발행 시 선행 조건 명시 누락): Chunk B/C 2개 프롬프트 단일 응답 배치 → Chunk C 먼저 투입되어 순서 뒤바뀜. MF-15 후보 t 편입
- 이슈 18 (vitest passed 로그 reporter 가정 오류): "valid:/invalid: 개별 이름 grep" 이 vitest 기본 reporter 에서 false positive STOP. "Tests N passed (N)" 요약 패턴만 신뢰. MF-15 후보 u 편입
- Codex CLI 교차 검증 실전 재확증: v4 source 직독으로 refine/trim/regex signature 근거 확보, 단일 분야 집중 원칙 준수

### 1.4 최근 commit (top 7)

run 시점 git log --oneline -7 로 재확인 권장.

상단 2개 예상:
- (Phase 2 hash) chore: gitignore .codex + backlog mf-17/18/19 + handoff d-4g→d-4h
- 8f3218e feat(domain): reject whitespace-only name in ProjectSchema (mf-06, d-4g)

## 2. 환경 전제 (변동 없음)

handoff-d4f-to-d4g.md §2 와 동일. 요약:
- CA 파일명: corp-root.pem (corp-ca.pem 은 symlink fallback)
- preamble: export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&
- pnpm 10 hoisted linker, Node v22.22.2
- Windows 경로 시작 시 wsl -d Ubuntu -e bash -c "..." 감싸기

### 2.1 환경 검증 템플릿 (첫 명령 필수)

export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" && cd ~/work/acspc && pwd && git remote -v | head -1 && node --version && ls ~/.certs/corp-root.pem && git log --oneline -1 && git status --short

기대 출력:
- /home/founder_ys/work/acspc
- origin ceoYS/acspc
- v22.22.2
- cert 존재
- HEAD: D-4g Phase 2 commit hash 또는 그 이후
- git status clean

## 3. D-4g 이슈 기록 (minor-fixes.md 참조)

### 이슈 17: 복수 Chunk 연속 발행 시 선행 조건 명시 누락
minor-fixes.md 이슈 로그 메타 섹션 (D-4g) 참조. MF-17 로 backlog 승격 + MF-15 체크리스트 후보 t 편입.

### 이슈 18: vitest passed 로그 reporter 기본 동작 가정 오류
minor-fixes.md 이슈 로그 메타 섹션 (D-4g) 참조. MF-18 로 backlog 승격 + MF-15 체크리스트 후보 u 편입.

### MF-19: repo 루트 .codex 우발 생성, .gitignore 패턴 (디렉토리 전용) 불완전
D-4g Phase 2 에서 발견 + 완료. .codex 0 byte 파일 삭제 + .gitignore 에 `.codex` (파일) + `.codex/` (디렉토리) 2줄 패턴 (defense in depth).

## 4. D-4h 다음 턴 스펙 — 후보 비교 및 권장

### 4.1 후보 3개 비교

**후보 A (권장): MF-15 — operating-principles.md §3.3 체크리스트 m~u 보강**
- 성격: docs-only, 단일 파일 편집
- 범위: docs/agent-shared/operating-principles.md §3.3 섹션 확장
- 난이도: 매우 낮음
- 이유:
  - MF-06 (D-4g) 에서 후보 t/u 추가한 직후라 연장 자연스러움
  - thin slice 완벽 (단일 파일, 섹션 확장만)
  - Gate 2 면제 경로 적용 가능 (docs-only 단일 파일 편집)
  - 실기능 turn 과 프로세스 turn 교대 배치로 세션 피로도 관리 유리

**후보 B: MF-16 — apps/mobile @types/react peer dep mismatch**
- 성격: mobile 의존성 bump
- 범위: apps/mobile/package.json + pnpm-lock.yaml 갱신
- 난이도: 중간 (peer dep 연쇄 영향 확증 필요)
- 미권장 이유: 현재 런타임 문제 미관찰. 다음 mobile 실기능 turn 직전에 해결이 적절

**후보 C: MF-11 — apps/web tsconfig extends 재구성**
- 성격: config 리팩터
- 범위: apps/web/tsconfig.json + @repo/typescript-config/nextjs.json 관계 조정
- 난이도: 중간 (tsc 통과 + next build 확증 필요)
- 미권장 이유: apps/web 에 실기능 미구현 상태 → tsconfig 재구성 실효성 검증 어려움, V1 기능 중반 이후로 연기

**후보 D: V1 실기능 진입 (Phase 5 Supabase 또는 Phase 6 실기능)**
- 성격: 대규모 Phase 전환
- 난이도: 높음
- 미권장 이유: D-4 시리즈 내 경미한 잔여 작업 (MF-15/16) 을 먼저 정리하는 편이 안정적

### 4.2 권장 진행 순서

- D-4h: MF-15 (docs-only, thin slice)
- D-4i: MF-16 (mobile peer dep bump)
- D-4j 이후: V1 기능 구현 (Phase 5 진입)
- V1 기능 구현 중반 이후: MF-11 재판단

### 4.3 MF-15 정찰 필요 (D-4h Planner 첫 작업)

아래는 정찰 전 추정. D-4h Planner 가 실측으로 대체.

**추정 1: operating-principles.md §3.3 현재 구조**
- handoff-d4d-to-d4e / handoff-d4f-to-d4g 등에서 §3.3 이 Evaluator 발동 조건 + 점검 체크리스트 (a~l) 포함 확인됨
- 후보 m~u (9개) 추가 예정. 각 1~3줄 bullet 형식
- 100~110줄 제약 여부 재확인 필요 (CLAUDE.md / AGENTS.md 에서 현재 길이 확인)

**추정 2: 후보 m~u 세부 내용**
- m: 장시간 실행 명령 완료 판정은 자체 판단 금지, 성공 문자열 grep 으로 기계화 (이슈 8/13)
- n: 120초 STOP 조항 모든 Step 재명시 (이슈 9)
- o: 성공/실패 판정 문자열 enumeration 의무 (이슈 10)
- p: sleep 체인 금지, run_in_background 권장 (이슈 11)
- q: 파일 tracked/untracked/ignored 3상태 선행 확증 (이슈 14)
- r: STOP 조건 "이번 Chunk 산출물" vs "누적 상태" 구분 (이슈 15)
- s: turbo 로그 grep 시 ^ line-start anchor 금지 (이슈 16)
- t: 복수 Chunk 연속 발행 시 선행 조건 명시 (이슈 17, D-4g 신규)
- u: vitest passed 로그 grep 시 "Tests N passed (N)" 패턴만 (이슈 18, D-4g 신규)

**추정 3: thin slice 제안**
- 모두 추가하지 말고 우선순위 상위 5~6개만 첫 turn 에 반영
- 나머지는 D-4i 에서 보강
- 또는 전체 9개를 단일 turn 에 반영하되 체크리스트 형식 엄격히 준수

### 4.4 MF-13 대응 설계 (D-4h 프롬프트 작성 원칙)

- docs-only 편집이므로 네트워크 명령 불필요
- pnpm/turbo 실행 없음
- Claude Code 안전 영역 전부 (파일 편집 + git add + commit)

### 4.5 thin slice 제안

1. operating-principles.md §3.3 만 수정
2. 체크리스트 m~u 추가 (9개 일괄 또는 상위 5~6개)
3. git add 는 docs/agent-shared/operating-principles.md 단일
4. commit 1개
5. Gate 2 면제 경로 적용

### 4.6 잠재 위험

- 100~110줄 제약 위반 가능성 (9개 추가 시 길이 초과 예상)
- 기존 체크리스트 a~l 과 순서/형식 불일치 리스크
- MF-15 이후 §3.3 재사용 시 체크리스트 참조 ID (a, b, ...) 변동

### 4.7 진행 순서 추천

1. 정찰 turn: operating-principles.md 현재 §3.3 구조 re-review, 길이 제약 확인, 후보 m~u 와 기존 a~l 일관성 검토
2. Generator 프롬프트 작성 (Chunk 단위)
3. Evaluator 발동 조건 점검:
   - §3.3 발동 조건 중 "설정 파일 생성·수정" 이 trigger 할지 확인
   - 면제 조항 "docs-only 단일 파일 편집" 해당 여부
4. Chunk 투입 순서:
   - Chunk A: 정찰 (§3.3 현재 내용 + 길이 + 일관성)
   - Chunk B: §3.3 편집 (Claude Code)
   - Chunk C: (수동) 통과 확증 불필요 (docs-only)
   - Chunk D: explicit add + commit (Claude Code)
   - Gate 2 → push

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — 완료 (D-4d-1)
- MF-05: vitest 도입 — 완료 (D-4f, HEAD=97ef126)
- MF-06: domain schema 고급 제약 — 완료 (D-4g, HEAD=8f3218e, ProjectSchema.name whitespace 거부 refine)
- MF-07~10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 — V1 기능 중반 이후
- MF-12 (후보): handoff HOME 변수 훼손 — 실측 영향 없음 확인됨
- MF-13: Claude Code tee+장시간 exit 버그 — 우회 원칙 확립
- MF-14: Planner 정찰 파일 3상태 확증 — 실적용 완료 (D-4f/D-4g)
- MF-15: §3.3 체크리스트 m~u 보강 — **D-4h 대상 (권장)**
- MF-16: apps/mobile @types/react peer dep mismatch — medium, D-4i 후보
- MF-17 (신규): 복수 Chunk 연속 발행 시 선행 조건 명시 누락 — MF-15 후보 t 편입 대기
- MF-18 (신규): vitest passed 로그 reporter 가정 오류 — MF-15 후보 u 편입 대기
- MF-19 (신규): repo 루트 .codex 우발 생성 — **완료 (D-4g)**

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (완료 D-4f), domain refine 1건 (완료 D-4g) | **진행 중** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 42% 지점.

## 7. 새 대화창 시작 가이드 (D-4h)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환. D-4g 완료 (MF-06 domain refine + MF-19 gitignore 정비 + backlog/handoff 갱신, HEAD Phase2-hash).
오늘 진입 = D-4h (MF-15 operating-principles.md §3.3 체크리스트 m~u 보강, Phase 4 연장).
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4g-to-d4h.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Evaluator 발동 조건 §3.3 (MF-15 는 docs-only 단일 파일 편집 → 면제 후보)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4h 범위 = MF-15 (§3.3 체크리스트 m~u, 9개 일괄 또는 상위 5~6개, thin slice)
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

이전 턴 (D-4e/D-4f/D-4g) 방법론적 변곡점 — 필수 준수:
1. MF-13 우회 원칙: pnpm install, pnpm turbo 등 네트워크/장시간 명령은 사용자가 생 bash 직접 실행. Claude Code 는 로그 파일 grep/판정만. tee 파이프 금지, > log 2>&1 리다이렉트
2. MF-14 Planner 정찰 보강: 파일 대상 작업 시 git ls-files + git check-ignore -v 로 tracked/untracked/ignored 3상태 선행 확증
3. Chunk 단위 분할: 단일 장문 프롬프트 stuck 방지. 각 chunk 5~60초 목표, 사용자 판정 후 다음 chunk 발행
4. 성공/실패 판정: 명시된 문자열 grep 결과로만. Claude Code 자체 판단 금지
5. 120초 STOP 조항: 각 Step 미완료 시 상태 보고
6. D-4f 이슈 15/16 교훈:
   - STOP 조건 "이번 Chunk 산출물" vs "누적 상태" 구분
   - turbo 로그 grep 시 ^ line-start anchor 금지, prefix 포함 패턴
7. D-4g 이슈 17/18 교훈:
   - 복수 Chunk 연속 발행 시 각 Chunk 선행 조건 명시 (단일 응답 당 Claude Code 프롬프트 1개 원칙)
   - vitest passed 로그 grep 시 "Tests N passed (N)" 요약 패턴만 신뢰

handoff 요약 보고 후 "D-4h Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 Phase 2 commit hash 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] MF-13/14 원칙 + D-4f 이슈 15/16 + D-4g 이슈 17/18 교훈 인식 확인 (첫 응답에 언급 여부)
- [ ] Chunk 단위 분할 전략 인식 확인
- [ ] MF-15 thin slice 원칙 (§3.3 체크리스트만, 9개 또는 상위 5~6개) 인식 확인
