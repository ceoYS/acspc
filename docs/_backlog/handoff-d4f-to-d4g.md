# Handoff — D-4f → D-4g (2026-04-24, Session 7 end)

D-4g 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4e-to-d4f.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4f 완료)

- HEAD: d427662 (docs(backlog): mark MF-05 done, add MF-15/16 and meta issues 15/16)
- 총 29개 commit, origin/main 동기화 완료
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4f 에서 변경된 것

**97ef126 (feat(test): bootstrap vitest with @repo/domain ProjectSchema test)** — 6 files:
- packages/domain/vitest.config.ts (신규, 7 lines)
- packages/domain/src/project.test.ts (신규, 24 lines, 2 test cases)
- packages/domain/package.json (devDep vitest@^3.2.4 + test script 추가)
- package.json (root, test script 추가)
- turbo.json (test task 추가: dependsOn ^test, outputs [])
- pnpm-lock.yaml (vitest 전이 의존성 103개 추가)

**d427662 (docs(backlog): mark MF-05 done, add MF-15/16 and meta issues 15/16)** — 1 file:
- docs/_backlog/minor-fixes.md (46 insertions, 0 deletions)

### 1.2 D-4f 핵심 실증

- vitest@3.2.4 + zod v4 + TypeScript bundler resolution 조합 호환 확증
- packages/domain 은 source 직접 export (main/types/exports 모두 ./src/index.ts) → 테스트 파일이 "./project" import 로 직접 접근 성공
- pnpm 10 hoisted linker 하에서 vitest 설치 8.5s (정상)
- pnpm 10 의 "Ignored build scripts (esbuild, sharp, unrs-resolver)" 경고에도 불구하고 vitest 정상 실행 (vitest 3.x 는 prebuilt esbuild 번들 포함으로 추정)
- turbo test 첫 실행 940ms, cache hit 후 101ms → 회귀 탐지 비용 저렴
- Phase 4 (테스트/제약) 진입 완료

### 1.3 D-4f 방법론 교훈

- MF-13 우회 원칙 실전 재적용 성공: Chunk C (pnpm add) + Chunk F (pnpm turbo test) 를 수동 분리 → 둘 다 exit 판정 명확, tee 파이프 미사용
- Chunk 단위 분할 효과 재확증: 총 9개 chunk, 각 5~60초 완료, 단일 장문 프롬프트 stuck 재현 없음
- 이슈 15 (STOP 조건 누적 판정): Chunk D 에서 이전 Chunk 잔여 변경이 STOP trigger. 교훈 — STOP 조건은 "이번 Chunk 산출물" 기준 명시 or "누적 예상값" 선행 기재
- 이슈 16 (turbo prefix-aware grep): `^` line-start anchor 가 turbo prefix (`@repo/domain:test: `) 에 가려 false negative. 교훈 — turbo 로그 grep 시 `^` 금지
- 두 이슈는 minor-fixes.md MF-15 체크리스트 후보 r, s 로 편입됨

### 1.4 최근 commit (top 7)

run 시점 git log --oneline -7 로 재확인 권장.

- d427662 docs(backlog): mark MF-05 done, add MF-15/16 and meta issues 15/16 (d-4f)
- 97ef126 feat(test): bootstrap vitest with @repo/domain ProjectSchema test (mf-05, d-4f)
- c5b9792 docs(backlog): handoff from d-4e to d-4f (session transition 6)
- 874952e chore: batch MF-07/08/09/10 (d-4e)
- 5aa03af docs(backlog): handoff from d-4d to d-4e (session transition 5)
- 27e8869 feat(mobile): verify @repo/domain import with safeParse page (d-4d-1)
- 3f5f4db docs(backlog): handoff from d-4c to d-4d (session transition 4)

## 2. 환경 전제 (변동 없음)

handoff-d4e-to-d4f §2 와 동일. 요약:
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
- HEAD: d427662 또는 이후 handoff commit
- git status clean

## 3. D-4f 이슈 기록 (minor-fixes.md 참조)

### 이슈 15: STOP 조건 "누적 상태 vs 당해 Chunk 산출물" 구분 누락
minor-fixes.md 이슈 로그 메타 섹션 참조. MF-15 체크리스트 후보 r 로 편입.

### 이슈 16: turbo output grep line-start anchor false negative
minor-fixes.md 이슈 로그 메타 섹션 참조. MF-15 체크리스트 후보 s 로 편입.

## 4. D-4g 다음 턴 스펙 — 후보 비교 및 권장

### 4.1 후보 3개 비교

**후보 A (권장): MF-06 — domain schema 고급 제약 반영**
- 성격: MF-05 (vitest 도입) 직접 연장, 테스트 인프라 활용
- 범위 예상: packages/domain 의 1~2 schema 에 refine/constraint 추가 + 테스트 case 추가
- 난이도: 낮음
- 이유:
  - vitest 도입 직후라 context 재활용 이익
  - thin slice 유지 가능 (1 schema + 1~2 테스트 case 추가)
  - Gate 2 비용 저렴 (테스트 통과 확증이 이미 확립된 패턴)

**후보 B: MF-15 — §3.3 체크리스트 m~q (+r, s) 보강**
- 성격: operating-principles.md 편집, 도구 쪽 변화
- 범위: docs/agent-shared/operating-principles.md 단일 파일, §3.3 섹션 확장
- 난이도: 매우 낮음 (docs-only)
- 미권장 이유: 제품 진전 기여 작음, MF-06 이후로 후순위

**후보 C: MF-11 — apps/web tsconfig extends 재구성 (경로 B)**
- 성격: config 리팩터링
- 범위: apps/web/tsconfig.json + @repo/typescript-config/nextjs.json 관계 조정
- 난이도: 중간 (tsc 통과 + next build 확증 필요)
- 미권장 이유: apps/web 에 실기능 미구현 상태 → tsconfig 재구성 실효성 검증 어려움

### 4.2 권장 진행 순서

- D-4g: MF-06 (thin slice, 1 schema 에 refine 1개 + 테스트 1~2 case)
- D-4h 또는 여유 세션: MF-15 (docs-only)
- V1 기능 구현 중반 이후: MF-11 재판단

### 4.3 MF-06 정찰 필요 (D-4g Planner 첫 작업)

아래는 정찰 전 추정. D-4g Planner 가 실측으로 대체.

**추정 1: refine 대상 schema 선정**
- PhotoSchema: content_text min/max 이미 있음. taken_at < now() 같은 동적 refinement 후보 (단 deterministic 테스트 어려움)
- ProjectSchema: name min/max 이미 있음. name trim 제약 (공백만 거부) 후보
- domain 관련 docs/ 문서 확인해서 비즈니스 규칙 도출 가능 여부 선행 조사

**추정 2: zod v4 refine API 경로**
- z.object({}).refine(fn, message) 또는 .superRefine
- v4 에서 API 경로 그대로인지 확증 필요 (v3 → v4 migration 영향 있으므로 실측 필수)

**추정 3: 테스트 case 증가로 인한 package.json test script 영향**
- vitest run 그대로 작동, glob pattern 이 src/**/*.test.ts 이므로 신규 파일 자동 인식
- 추가 설정 불필요

### 4.4 MF-13 대응 설계 (D-4g 프롬프트 작성 원칙)

- vitest 본체 설치 이미 완료 → 추가 install 불필요
- pnpm turbo test 만 수동 분리 영역 (cache 미스 시 첫 실행 ~1s)
- 나머지는 Claude Code 안전 영역 (파일 편집 + git add + commit)

### 4.5 thin slice 제안

1. 1 schema 만 대상 (ProjectSchema 또는 PhotoSchema)
2. refine 1개만 추가 (정적 제약 선호, 동적 now() 비교 등은 후순위)
3. 테스트 case 1~2개 추가 (refine 거부하는 invalid 입력)
4. pnpm turbo test 통과 확증
5. commit 1개

### 4.6 잠재 위험

- zod v4 refine API 경로 변경 가능성 (v3 → v4 migration 영향)
- 기존 min/max 제약과 충돌 가능성
- 동적 refinement (예: taken_at < now()) 는 테스트 deterministic 보장 어려움 → 정적 제약 선호
- PhotoSchema 의 storage_path 형식 제약 등 도메인 지식 필요 영역 존재

### 4.7 진행 순서 추천

1. 정찰 turn: packages/domain src/* 전수 re-review, docs/ 도메인 문서 확인, zod v4 refine 예제 1건 검증
2. Generator 프롬프트 작성 (Chunk 단위)
3. Evaluator (§3.3 발동: 복수 파일 수정 + 외부 API 불확실성 → 필수)
4. Chunk 투입 순서:
   - Chunk A: 정찰 및 refine 대상 확정
   - Chunk B: schema 파일 수정 (Claude Code)
   - Chunk C: 테스트 case 추가 (Claude Code)
   - Chunk D: (수동) pnpm turbo test
   - Chunk E: 로그 grep + 판정 (Claude Code)
   - Chunk F: commit (Claude Code)
   - Gate 2 → push

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — D-4d-1 완료
- MF-05: vitest 도입 — **완료 (D-4f, HEAD=97ef126)**
- MF-06: domain schema 고급 제약 — **D-4g 대상 (권장)**
- MF-07~10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 — V1 기능 중반 이후
- MF-12 (후보): handoff HOME 변수 훼손 — 실측 영향 없음 확인됨
- MF-13: Claude Code tee+장시간 exit 버그 — 우회 원칙 확립, D-4f 실전 재검증 성공
- MF-14: Planner 정찰 파일 3상태 확증 — D-4f Chunk A 에서 실적용
- MF-15 (신규): §3.3 체크리스트 m~q(+r, s) 보강 제안 — D-4h 이후 고려
- MF-16 (신규): apps/mobile @types/react peer dep mismatch — medium, 다음 mobile 작업 전 해결

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (MF-05 완료), domain 고급 제약 (MF-06 진입 예정) | **진입 완료 (D-4f)** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 40% 지점.

## 7. 새 대화창 시작 가이드 (D-4g)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환. D-4f 완료 (MF-05 vitest 도입 + docs 갱신, HEAD d427662).
오늘 진입 = D-4g (MF-06 domain schema 고급 제약, Phase 4 연장).
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4f-to-d4g.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Evaluator 발동 조건 §3.3 (MF-06 은 schema 수정 + 테스트 추가 + refine API 불확실성 → 필수)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4g 범위 = MF-06 (1 schema 에 refine 1개 + 테스트 1~2 case, thin slice)
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

이전 턴 (D-4e/D-4f) 방법론적 변곡점 전달 — 필수 준수:
1. MF-13 우회 원칙: pnpm install, pnpm turbo 등 네트워크/장시간 명령은 사용자가 생 bash 직접 실행. Claude Code 는 로그 파일 grep/판정만. tee 파이프 금지, > log 2>&1 리다이렉트 사용
2. MF-14 Planner 정찰 보강: 파일 대상 작업 시 git ls-files + git check-ignore -v 로 tracked/untracked/ignored 3상태 선행 확증
3. Chunk 단위 분할: 단일 장문 프롬프트 stuck 방지. 각 chunk 5~60초 목표, 사용자 판정 후 다음 chunk 발행
4. 성공/실패 판정: 명시된 문자열 grep 결과로만. Claude Code 자체 판단 금지
5. 120초 STOP 조항: 각 Step 미완료 시 상태 보고
6. D-4f 이슈 15/16 추가 교훈:
   - STOP 조건은 "이번 Chunk 산출물" 기준 or "누적 예상값" 선행 기재
   - turbo 로그 grep 시 ^ line-start anchor 금지, prefix 포함 패턴 사용

handoff 요약 보고 후 "D-4g Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 d427662 + handoff commit 을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] MF-13/14 원칙 + D-4f 이슈 15/16 교훈 인식 확인 (첫 응답에 언급 여부)
- [ ] Chunk 단위 분할 전략 인식 확인
- [ ] MF-06 thin slice 원칙 (1 schema + 1 refine + 1~2 테스트 case) 인식 확인
