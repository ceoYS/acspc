# Handoff — D-4h → D-4i (2026-04-24, Session 9 end)

D-4i 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4g-to-d4h.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4h 완료)

- HEAD: D-4i 진입 시 `git log --oneline -1` 로 실측 (예상 = 메타 commit hash)
- 총 commit 수: 34 (D-4g 종료 32 + MF-15 본체 1 + D-4h 메타 1)
- origin/main 동기화: 메타 push 후 완료 예정
- Working tree: clean (메타 push 후)
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4h 에서 변경된 것 (2개 commit)

**8f164ad (docs(operating-principles): expand §3.3 checklist with 6 bullets (mf-15, d-4h))** — 1 file:
- docs/agent-shared/operating-principles.md: §3.3 점검 체크리스트에 bullet 6개 append (+6 lines)
  - m: 장시간 실행 명령 완료 판정 (이슈 8/13)
  - o: 성공/실패 판정 문자열 enumeration (이슈 10)
  - q: 파일 tracked/untracked/ignored 3상태 확증 (이슈 14)
  - r: STOP 조건 scope 구분 (이슈 15)
  - t: 복수 Chunk 연속 발행 금지 (이슈 17)
  - u: vitest 통과 판정 패턴 (이슈 18)

**(메타 commit hash)** — 2 files:
- docs/_backlog/minor-fixes.md: MF-15 제목 업데이트 + 완료 요약 섹션 + MF-17/18 상태 업데이트 + D-4h 이슈 로그 신설 (이슈 19)
- docs/_backlog/handoff-d4h-to-d4i.md: 신규 파일 (이 파일)

### 1.2 D-4h 핵심 실증

- MF-15 thin slice 6/9 완료: §3.3 체크리스트 bullet 추가, pnpm turbo 불필요 (docs-only)
- Codex CLI 외부 Evaluator 실전 재확증: 문서 정합성 단일 분야, 근거 file:line 기반 🟡 Medium 판정, 상위 6개 수용
- Gate 2 면제 경로 실전 적용: docs-only 단일 파일 편집 (MF-15 본체) + docs-only 2파일 (메타) 양쪽 모두 blind spot 검토 후 면제 수용

### 1.3 D-4h 방법론 교훈

- 이슈 19 (Planner WC 기대값 오계산): bullet 삽입 수 vs line 순증량 차이 계산 실수, Claude Code 정직 보고로 조기 복구. 단일 사례, 체크리스트 편입 불요
- Codex CLI 교차 검증 실전 확장: 기존 "코드 로직" 뿐 아니라 "문서 정합성" 분야로 사용 확장. 근거 file:line 의무 유지로 주관 개입 최소화
- 형식 일관성 실측 선행 효과: 정찰 Chunk 로 §3.3 체크리스트 형식 실측 (라벨 없음, 1~2줄) 후 편집 설계 → 형식 불일치 리스크 0 건

### 1.4 최근 commit (top 5)

run 시점 git log --oneline -5 로 재확인 권장.

상단 2개 예상:
- (메타 hash) docs: mf-15 완료 반영 + mf-17/18 closing + handoff d-4h→d-4i
- 8f164ad docs(operating-principles): expand §3.3 checklist with 6 bullets (mf-15, d-4h)

## 2. 환경 전제 (변동 없음)

handoff-d4g-to-d4h.md §2 와 동일. 요약:
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
- HEAD: D-4h 메타 commit hash (또는 그 이후)
- git status clean

## 3. D-4h 이슈 기록 (minor-fixes.md 참조)

### 이슈 19: Planner WC 기대값 오계산
minor-fixes.md 이슈 로그 메타 섹션 (D-4h) 참조. 단일 사례, 체크리스트 편입 불요.

## 4. D-4i 다음 턴 스펙 — 후보 비교 및 권장

### 4.1 후보 4개 비교

**후보 A: MF-16 — apps/mobile @types/react peer dep mismatch**
- 성격: mobile 의존성 bump
- 범위: apps/mobile/package.json + pnpm-lock.yaml
- 난이도: 중간 (peer dep 연쇄 + MF-13 대응 필요)
- 장점: D-4 시리즈 잔여 부채 해소, Phase 5 진입 전 mobile 기반 정돈
- 단점: 네트워크 명령 (pnpm install) 동반, MF-13 우회 원칙 적용 필요

**후보 B: §3.3 체크리스트 n/p/s 보강 (MF-15 확장)**
- 성격: docs-only 단일 파일 편집
- 범위: docs/agent-shared/operating-principles.md §3.3 bullet 3개 추가
- 난이도: 매우 낮음
- 장점: D-4h 선례 답습 쉬움, thin slice 완벽
- 단점: 체크리스트 비대화 우려 (Codex D-4h 판정 중 C 항목), 실질 재발 빈도 낮음

**후보 C (권장): V1 Phase 5 진입 — Supabase client 도입**
- 성격: 대규모 Phase 전환
- 범위: packages/db 또는 packages/supabase 신규, 인증 scaffold
- 난이도: 높음 (네트워크 + 환경 변수 + 새 의존성)
- 장점: V1 실기능 기반, D-4 시리즈 부채 정리 완료된 지금이 적절한 진입점
- 단점: MF-13 우회 필요, Evaluator 필수, 장기 세션 예상

**후보 D: MF-11 — apps/web tsconfig extends 재구성**
- 성격: config 리팩터
- 미권장 이유: apps/web 실기능 미구현 → 재구성 실효성 검증 어려움, Phase 5 이후 재판단

### 4.2 권장 진행 순서

- D-4i: 후보 A (MF-16) — 네트워크 명령 1회, thin slice, Phase 5 진입 전 정돈
- D-4j: 후보 C (Phase 5 Supabase) 진입
- V1 기능 구현 중반 이후: MF-11, MF-15 n/p/s 재판단

### 4.3 MF-16 정찰 필요 (D-4i Planner 첫 작업)

아래는 정찰 전 추정. D-4i Planner 가 실측으로 대체.

**추정 1: 현재 peer dep 충돌**
- handoff-d4g-to-d4h.md §5 에서 MF-16 "medium, D-4i 후보" 로 남김
- 구체 버전 mismatch 경로 미파악. apps/mobile/package.json + pnpm-lock.yaml grep 으로 실측

**추정 2: 처치 방향**
- @types/react 버전을 mobile 쪽 react 버전과 일치시키는 bump
- pnpm install 1회 (MF-13: 사용자 직접 실행 + 로그 파일 grep)
- expo export 번들러 실동작 검증 1회 (MF-15 점검 체크리스트 `번들러 실동작` 조항)

### 4.4 MF-13 대응 설계 (D-4i 프롬프트 작성 원칙)

- pnpm install 사용자 직접 실행, Claude Code 는 로그 grep
- `> log 2>&1` 리다이렉트 (tee 금지)
- 성공 문자열 "Progress: resolved" / "Done in" / "dependencies: +N" 등 enumerate
- expo export 실행도 동일 원칙

### 4.5 thin slice 제안

1. apps/mobile/package.json 의 @types/react 단일 필드 bump
2. pnpm install 1회
3. expo export 번들러 실동작 검증 1회
4. commit 1개
5. Gate 2 (실동작 검증 통과 기반 push 승인)

### 4.6 잠재 위험

- @types/react bump 이 @types/react-native peer 에 연쇄 충돌 가능성
- pnpm install 네트워크 시간 (회사망 retry 루프 리스크)
- expo export 실행 시간 (1~3분 추정)
- MF-09 재발 주의: apps/mobile 에 package-lock.json 이 재생성되지 않는지 확인

### 4.7 진행 순서 추천

1. 정찰 turn: apps/mobile/package.json + pnpm-lock.yaml 에서 react/@types/react 현재 버전 실측
2. Generator 프롬프트 작성 (Chunk 단위)
3. Evaluator 필수 (의존성 추가·변경 + 설정 파일 수정 + 외부 번들링 검증)
4. Chunk 투입 순서:
   - Chunk A: 정찰
   - Chunk B: package.json bump (Claude Code)
   - Chunk C: (수동) pnpm install + expo export, 로그 저장
   - Chunk D: 로그 grep 판정 (Claude Code)
   - Chunk E: explicit add + commit (Claude Code)
   - Gate 2 → push

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — 완료 (D-4d-1)
- MF-05: vitest 도입 — 완료 (D-4f, HEAD=97ef126)
- MF-06: domain schema 고급 제약 — 완료 (D-4g, HEAD=8f3218e)
- MF-07~10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 — V1 기능 중반 이후
- MF-12 (후보): handoff HOME 변수 훼손 — 실측 영향 없음 확인됨
- MF-13: Claude Code tee+장시간 exit 버그 — 우회 원칙 확립
- MF-14: Planner 정찰 파일 3상태 확증 — 실적용 완료 (D-4f/D-4g/D-4h)
- MF-15: §3.3 체크리스트 m~u 보강 — **완료 (D-4h, thin slice 6/9, HEAD=8f164ad)**
- MF-16: apps/mobile @types/react peer dep mismatch — medium, **D-4i 권장 대상**
- MF-17: 복수 Chunk 연속 발행 시 선행 조건 명시 누락 — MF-15 후보 t 로 편입 완료 (D-4h)
- MF-18: vitest passed 로그 reporter 가정 오류 — MF-15 후보 u 로 편입 완료 (D-4h)
- MF-19: repo 루트 .codex 우발 생성 — 완료 (D-4g)

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h) | **완료** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | **대기, D-4j 이후 진입** |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 45% 지점.

## 7. 새 대화창 시작 가이드 (D-4i)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환. D-4h 완료 (MF-15 thin slice 6/9 + 메타 commit, HEAD 메타-hash).
오늘 진입 = D-4i (후보 A: MF-16 apps/mobile @types/react peer dep bump, Phase 5 진입 전 정돈).
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4h-to-d4i.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Evaluator 필수 (의존성 변경 + pnpm install + bundler 검증)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4i 범위 = MF-16 (@types/react bump, thin slice, pnpm install + expo export 1회 검증)
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

이전 턴 (D-4e~D-4h) 방법론 — 필수 준수:
1. MF-13 우회 원칙: pnpm install 사용자 직접 실행, Claude Code 는 로그 grep. tee 금지, > log 2>&1
2. MF-14 Planner 정찰 보강: git ls-files + git check-ignore -v
3. Chunk 단위 분할, 각 Chunk 선행 조건 명시 (D-4g 이슈 17), 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep 결과로만
5. 120초 STOP 조항
6. vitest 통과 판정은 "Tests N passed (N)" 요약만 (D-4g 이슈 18)
7. turbo 로그 grep 시 ^ line-start anchor 금지 (D-4f 이슈 16)
8. Codex CLI 외부 Evaluator 활용 가능 (단일 분야, 근거 file:line 의무)

handoff 요약 보고 후 "D-4i Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 메타 commit hash 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] MF-13/14 + D-4f 이슈 15/16 + D-4g 이슈 17/18 + D-4h 이슈 19 교훈 인식 확인
- [ ] Chunk 단위 분할 전략 인식 확인
- [ ] MF-16 thin slice 원칙 (apps/mobile/package.json 단일 필드 bump + 1회 검증) 인식 확인
- [ ] Codex CLI 교차 검증 가용 인식 확인
