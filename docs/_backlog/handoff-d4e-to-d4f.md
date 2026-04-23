# Handoff — D-4e → D-4f (2026-04-24, Session 6 end)

D-4f 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4d-to-d4e.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4e 완료)

- HEAD: 874952e (chore: batch MF-07/08/09/10 (d-4e))
- 총 27개 commit, origin/main 동기화 완료
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4e 에서 변경된 것

**874952e (chore: batch MF-07/08/09/10)** — 5 files changed, 44 insertions(+), 4 deletions(-):

- apps/mobile/package.json — scripts.check-types 추가
- apps/mobile/tsconfig.json — compilerOptions.noUncheckedIndexedAccess: true
- apps/web/package.json — scripts.check-types 추가
- apps/web/tsconfig.json — compilerOptions.noUncheckedIndexedAccess: true
- docs/_backlog/minor-fixes.md — MF-07~10 완료 표시 + MF-11/12/13/14 신규 append

apps/mobile/package-lock.json 은 실파일 삭제됐으나 gitignore line 44 로 원래부터 untracked → git 변경 없음 (MF-09 정찰 부산물).

### 1.2 D-4e 핵심 실증

**apps/web + apps/mobile 양쪽에 noUncheckedIndexedAccess: true 추가 후 check-types 통과 (에러 0건).** 즉 현재 소스 규모 (web 190줄, mobile 797줄) 에서 strict 한 index access 규칙을 도입해도 회귀 없음 확증. Phase 4 테스트 도입 기반 정비됨.

### 1.3 D-4e 방법론적 변곡점 (다음 턴 필수 전달)

**MF-13 우회 원칙 (핵심)**:
Claude Code bash 도구는 `tee` 파이프 + 장시간 프로세스 조합에서 exit 신호 인지 실패. 재현 증거:
- Chunk 2 Sub-step 2.2: `pnpm install --frozen-lockfile 2>&1 | tee /tmp/log` → 실제 3.9s 완료했으나 Claude Code 는 (timeout 2m) 판정
- 사용자 수동 재실행 시 2.6s 완료 (동일 명령)
- 회피 사례: Chunk 5.3 `pnpm turbo check-types` 를 사용자 수동 실행으로 분리 → 3.105s 정상 완료

**원칙 (D-4f 이후 모든 턴 적용)**:
- pnpm install, pnpm turbo, expo start, next build 등 네트워크/장시간 명령은 Claude Code 내부 실행 금지
- 사용자가 생 bash 에서 직접 실행, Claude Code 는 로그 파일 grep/판정만 담당
- Claude Code 내부 검증 영역에서도 tee 대신 `> log 2>&1` 리다이렉트 권장
- Generator 프롬프트에 "수동 분리 sub-step" 패턴 적용

**MF-14 Planner 정찰 보강**:
Generator 판정 기준 작성 시 대상 파일의 tracked/untracked/ignored 3상태 선행 확증 의무. Chunk 2 Sub-step 2.1 에서 `git status --short <file>` 빈 출력을 "실패" 로 오판한 사례 (실제로는 gitignore untracked 라 정상). 체크리스트 추가:
- `git ls-files <path>` — tracked 여부
- `git check-ignore -v <path>` — gitignore 매칭 여부
- 삭제 검증 시 물리적 부재 (`ls` 에러) + git status 이원 판정

**Chunk 단위 분할 효과 확증**:
이번 턴 8개 chunk 로 분할. 이전 턴 (D-4d-1 등) 장문 프롬프트 stuck 재현 방지 성공. 각 chunk 5~60초 완료, 실시간 판정 가능. D-4f 이후도 같은 패턴 유지.

### 1.4 최근 commit (top 7)

commit 번호는 run 시점 git log --oneline -7 로 재확인 권장.

- 874952e chore: batch MF-07/08/09/10 (d-4e)
- 5aa03af docs(backlog): handoff from d-4d to d-4e (session transition 5)
- 27e8869 feat(mobile): verify @repo/domain import with safeParse page (d-4d-1)
- 3f5f4db docs(backlog): handoff from d-4c to d-4d (session transition 4)
- 685b936 docs(shared): add Evaluator 점검 체크리스트 and 면제 근거 제시 의무 (§3.3)
- 4b0a978 feat(web): verify @repo/domain import with safeParse page (d-4c-2)
- 7929c75 fix(domain): switch to bundler resolution for web/metro compat (d-4c-1 fixup)

## 2. 환경 전제 (변동 없음)

handoff-d4d-to-d4e §2 와 동일. 요약:

- CA 파일명: `corp-root.pem` (corp-ca.pem 은 symlink fallback)
- preamble 필수 (코드 fence 블록 참조):

````
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&
````

- Windows 경로 시작 시 wsl -d Ubuntu -e bash -c "..." 감싸기
- pnpm store reuse 시 빠름 (D-4e 실측: 2.6~3.9s)

### 2.1 환경 검증 템플릿 (첫 명령 필수)

다음을 1줄로 복사해서 실행:

```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" && cd ~/work/acspc && pwd && git remote -v | head -1 && node --version && ls ~/.certs/corp-root.pem && git log --oneline -1 && git status --short
```

기대 출력:
- cwd /home/founder_ys/work/acspc
- origin ceoYS/acspc
- v22.22.2
- cert 존재
- HEAD: 874952e 또는 origin/main 이후 commit (handoff commit 얹힐 예정이라 본질적으로 stale. "origin/main tip 이상" 으로 해석)
- git status clean

## 3. D-4e 이슈 기록 (minor-fixes.md MF-13/14 과 이중 기록 — handoff 로는 핵심 요약만)

### 이슈 13: Claude Code tee 파이프 exit 인지 실패
minor-fixes.md MF-13 참조. 상세 원칙은 §1.3 위에 기록.

### 이슈 14: Generator 판정 기준 파일 상태 선행 정찰 누락
minor-fixes.md MF-14 참조. Planner 정찰 체크리스트에 추가됨.

### §3.3 체크리스트 보강 후보 (D-4f 이후 논의)
- m. 장시간 실행 명령 완료 판정은 자체 판단 금지, 성공 문자열 grep 로 기계화 (이슈 8/13)
- n. 120초 STOP 조항은 모든 Step 에 재명시 (이슈 9)
- o. 성공/실패 판정 문자열 enumeration (이슈 10)
- p. sleep 체인 금지, Monitor 툴 또는 run_in_background (이슈 11)
- q. 파일 tracked/untracked/ignored 3상태 선행 확증 (이슈 14)

이 5개는 D-4f 에서 operating-principles.md 편집 턴 고려. 우선순위는 MF-05 이후.

## 4. D-4f 다음 턴 스펙 — MF-05 (vitest 도입)

### 4.1 목표
monorepo 에 vitest 도입. 1개 이상 패키지에 실제 테스트 1개 작성 → `pnpm turbo test` 실행 통과. Phase 4 진입.

### 4.2 진입 후보 정찰 필요 (D-4f Planner 첫 작업)

아래는 정찰 전 추정. D-4f Planner 가 실측으로 대체.

**추정 1: 도입 대상 패키지**
- packages/domain — 이미 typecheck 통과, zod schema 테스트 가능 (safeParse valid/invalid)
- 확률 높음: 가장 thin slice 적합

**추정 2: vitest 버전**
- vitest v3+ 최신. pnpm 10, turbo, TypeScript, zod v4 와의 호환 확증 필요 (특히 vitest + zod v4 + bundler resolution 조합)
- 회사망 registry 에서 설치 가능 여부 (이전 이슈 10분+ hang 사례 있음 — install 수동 분리 필수)

**추정 3: turbo.json pipeline 추가**
- `test` task 신규 정의. dependsOn: ^test 유사 패턴
- cache 전략 (inputs/outputs) 결정 필요

**추정 4: tsconfig 영향 가능성**
- vitest 가 vite-node + esbuild 기반. bundler resolution 과 호환 예상 (packages/domain 의 moduleResolution: bundler 활용)
- 단 types/vitest 가 globals 주입 시 tsconfig.types 또는 include 에 추가 필요 가능

### 4.3 MF-13 대응 설계 (D-4f 프롬프트 작성 원칙)

**Claude Code 내부 금지**:
- pnpm install (vitest 설치)
- pnpm turbo test (첫 실행)
- vitest watch mode

**사용자 수동 영역 (생 bash)**:
- pnpm add -D vitest @vitest/ui ... (의존성 추가)
- pnpm turbo test 또는 pnpm -F @repo/domain test (첫 실행)
- 로그는 `> /tmp/vitest-initial.log 2>&1` 로 리다이렉트

**Claude Code 안전 영역**:
- package.json scripts 추가
- vitest.config.ts 생성
- 테스트 파일 작성 (*.test.ts)
- 로그 파일 grep (Tasks: successful, 테스트 통과 문자열)
- git add explicit + commit

### 4.4 thin slice 제안

1. packages/domain 에만 vitest 도입 (apps 는 제외)
2. 1개 테스트만 작성 (예: UUID schema safeParse valid/invalid 각 1 케이스)
3. turbo.json test task 추가
4. `pnpm turbo test` 통과 확증
5. commit 1개

확장 요청 (apps 에도 vitest, coverage, watch mode 등) 은 scope-cut, 별도 MF 로 분리.

### 4.5 잠재 위험

- vitest + zod v4 + TypeScript strict 조합에서 import 경로 이슈 가능성 (domain 이 "@repo/domain" 으로 export 되는지, 아니면 source 직접 접근인지)
- turbo test task cache 키 설계 실수 시 첫 실행만 통과하고 재실행에서 false positive
- Expo SDK 54 + vitest 호환 미확증 (apps/mobile 은 이번 슬라이스 제외하므로 무관)

### 4.6 진행 순서 추천 (D-4f Planner 원안)

1. 정찰 turn: packages/domain 현황, package.json/tsconfig 재확인, vitest 버전 결정
2. Generator 프롬프트 작성 (Chunk 단위, MF-13 수동 분리 반영)
3. Evaluator (정리 턴/도구 추가/설정 파일 생성 다수 해당 → 필수)
4. Chunk 투입 순서:
   - Chunk A: 환경 검증
   - Chunk B: (수동) pnpm add -D vitest 실행
   - Chunk C: vitest.config.ts + 테스트 파일 작성 (Claude Code)
   - Chunk D: package.json scripts + turbo.json test task (Claude Code)
   - Chunk E: (수동) pnpm turbo test 실행
   - Chunk F: 로그 grep + 판정 (Claude Code)
   - Chunk G: commit + Gate 2
5. Gate 2 (실제 테스트 통과 확증 후 push 승인)

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — D-4d-1 완료
- MF-05: vitest 테스트 프레임워크 도입 — **D-4f 대상**
- MF-06: domain schema 고급 제약 — MF-05 후속
- MF-07: 완료 (D-4e, dry-run N=0)
- MF-08: 완료 (D-4e)
- MF-09: 완료 (D-4e)
- MF-10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 (경로 B) — V1 구현 중
- MF-12 (후보): handoff HOME 변수 훼손 — 이번 handoff 에서 single-quote 블록 실험 적용 중
- MF-13: Claude Code tee+장시간 exit 버그 — D-4e 기록, 우회 원칙 확립
- MF-14: Planner 정찰 파일 3상태 확증 — D-4e 기록
- MF-15 (후보): §3.3 체크리스트 m~q 보강 — D-4f 이후 operating-principles 편집 턴에서 처리

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (MF-05), domain 고급 제약 (MF-06) | **진입 (D-4f)** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 35% 지점. Phase 4 가 회귀 탐지 기반 확립 변곡점.

## 7. 새 대화창 시작 가이드 (D-4f)

### 복사 붙여넣을 첫 프롬프트

아래 블록을 새 대화창에 그대로 붙여넣기:

````
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환. D-4e 완료 (MF-07/08/09/10 일괄 처리, HEAD 874952e).
오늘 진입 = D-4f (MF-05 vitest 도입, Phase 4 변곡점).
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4e-to-d4f.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Evaluator 발동 조건 §3.3 (MF-05 는 신규 도구 추가 + 설정 파일 생성 다수 → 필수)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4f 범위 = MF-05 (vitest 도입, packages/domain 우선, thin slice)
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

**이전 턴 (D-4e) 방법론적 변곡점 전달 — 필수 준수**:
1. MF-13 우회 원칙: pnpm install, pnpm turbo 등 네트워크/장시간 명령은 사용자가 생 bash 직접 실행. Claude Code 는 로그 파일 grep/판정만. tee 파이프 금지, > log 2>&1 리다이렉트 사용
2. MF-14 Planner 정찰 보강: 파일 대상 작업 시 git ls-files + git check-ignore -v 로 tracked/untracked/ignored 3상태 선행 확증
3. Chunk 단위 분할: 단일 장문 프롬프트 stuck 방지. 각 chunk 5~60초 목표, 사용자 판정 후 다음 chunk 발행
4. 성공/실패 판정: 명시된 문자열 grep 결과로만. Claude Code 자체 판단 금지
5. 120초 STOP 조항: 각 Step 미완료 시 상태 보고

handoff 요약 보고 후 "D-4f Planner 본 턴 정찰 시작" 대기.
````

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 874952e + handoff commit 을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] MF-13/14 원칙 인식 확인 (첫 응답에 언급 여부)
- [ ] Chunk 단위 분할 전략 인식 확인
- [ ] Evaluator 필수 인식 확인
