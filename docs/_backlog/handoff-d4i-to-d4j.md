# Handoff — D-4i → D-4j (2026-04-24, Session 10 end)

D-4j 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4g-to-d4h.md, handoff-d4h-to-d4i.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4i 완료)

- HEAD: D-4i 진입 시 `git log --oneline -1` 로 실측 (예상 = D-4i 종결 commit hash)
- 총 commit 수: 35 (D-4h 종료 34 + D-4i 종결 commit 1)
- origin/main 동기화: 종결 commit push 후 완료 예정
- Working tree: clean (push 후)
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4i 에서 변경된 것 (1개 commit 예정)

**(D-4i 종결 commit hash)** — 2 files:
- docs/_backlog/minor-fixes.md: MF-16 종결 요약 + MF-20~24 신설 + D-4i 이슈 로그 섹션 (+108 lines, -2 lines)
- docs/_backlog/handoff-d4i-to-d4j.md: 신규 파일 (이 파일)

### 1.2 D-4i 핵심 실증

- **MF-16 종결 (resolved — no action required)**: 정찰 기반 판정. mobile importer 에 `@types/react-dom` 직접 선언 없음 확증, web importer 에서 `@types/react-dom@19.2.3` 이 이미 `@types/react@19.2.14` 와 peer 일치. 원 진단은 transitive peer 를 direct 로 혼동한 결과로 추정.
- **Phase 4.5 신설 결정**: Phase 5 (Supabase) 진입 전 CI + pre-commit + smoke test 구축을 필수 선행으로 승격. 사용자 원칙 "오류 최소화 + 유지보수 수월함" 반영.
- **MF-20/21/22/23/24 신설**: Claude Code retry 루프 (MF-20), Phase 4.5 3대 구성요소 (MF-21/22/23), WSL rg 의존 금지 원칙 (MF-24).
- **Codex 외부 Evaluator 부분 착오 실증**: 이슈 20. 신뢰도 가정 금지, Planner 첫 정찰로 반드시 재확증.

### 1.3 D-4i 방법론 교훈

- **이슈 20 (Codex 부분 착오)**: 외부 Evaluator 도 `file:line` 근거 제시하지만 해석 단계에서 실수 가능. "파일에 있음" ≠ "mobile importer 가 소유". 향후 모든 Codex 검토 결과에 Planner 첫 정찰 재확증 원칙 적용.
- **이슈 21 (Claude Code retry 루프, MF-20)**: bash stdout truncation (`+N lines (ctrl+o to expand)`) 시 assistant API 응답 실패. 우회: stdout 20 라인 이하 + 리다이렉트 + cat 범위 제한, 또는 사용자 직접 실행 경로 선택.
- **이슈 22 (rg silent failure, MF-24)**: WSL 환경 전제 취약. 모든 정찰에서 `rg` 금지, `grep -n` 사용.
- **경로 C' 채택**: "정찰 완수 + 증거 기반 결단". "Phase 5 중 문제 나면 해결" 식 deferring 은 유지보수 부채로 간주, 증거 기반 종결 우선.

### 1.4 최근 commit (top 5)

run 시점 `git log --oneline -5` 로 재확인 권장.

상단 1개 예상:
- (D-4i 종결 hash) docs(backlog): close mf-16 + add mf-20~24 + d-4i issue log + handoff d-4i→d-4j

그 아래 D-4h 메타 commit (077c9b0) 부터 이어짐.

## 2. 환경 전제 (변동 없음)

handoff-d4h-to-d4i.md §2 와 동일. 요약:
- CA 파일명: corp-root.pem (corp-ca.pem 은 symlink fallback)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&`
- pnpm 10 hoisted linker, Node v22.22.2
- Windows 경로 시작 시 `wsl -d Ubuntu -e bash -c "..."` 감싸기
- WSL 에 `rg` 미설치 확증 (MF-24) → 모든 정찰에서 `grep -n` 사용

### 2.1 환경 검증 템플릿 (첫 명령 필수)

```
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" && cd ~/work/acspc && pwd && git remote -v | head -1 && node --version && ls ~/.certs/corp-root.pem && git log --oneline -1 && git status --short
```

기대 출력:
- /home/founder_ys/work/acspc
- origin https://github.com/ceoYS/acspc.git (fetch)
- v22.22.2
- cert 존재
- HEAD: D-4i 종결 commit hash (또는 그 이후)
- git status clean

## 3. D-4i 이슈 기록 (minor-fixes.md 참조)

- 이슈 20: Codex 외부 Evaluator 의 부분 착오 (정찰 결과로 기각)
- 이슈 21: Claude Code bash stdout truncation 시 assistant API retry 루프 (MF-20 본체)
- 이슈 22: WSL 에 rg (ripgrep) 미설치 — silent failure 야기 (MF-24 본체)

상세는 `docs/_backlog/minor-fixes.md` §"이슈 로그 (메타, D-4i)" (line 334~357 부근) 참조.

## 4. D-4j 다음 턴 스펙 — 코드 검수 우선

### 4.1 배경 — Anthropic Claude Code 품질 저하 발표

2026-04-23 Anthropic 공식 postmortem 발표.

출처: https://www.anthropic.com/engineering/april-23-postmortem

영향 기간: 2026-03-04 ~ 2026-04-20
영향 도구: Claude Code, Claude Agent SDK, Claude Cowork (사용자 사용 도구)
미영향: Claude API, Claude.ai 채팅창

세 가지 별도 변경:
1. (2026-03-04 ~ 2026-04-07) Claude Code 기본 reasoning effort `high` → `medium` 강제 — Sonnet 4.6, Opus 4.6
2. (2026-03-26 ~ 2026-04-10) 캐시 최적화 버그 — 매 turn 마다 reasoning history 삭제 → forgetful/repetitive — Sonnet 4.6, Opus 4.6
3. (2026-04-16 ~ 2026-04-20) 시스템 프롬프트 verbosity 제한 (≤25 words between tool calls, ≤100 words final) → 코딩 품질 3% 하락 — Sonnet 4.6, Opus 4.6, Opus 4.7

외부 검증:
- Veracode: Opus 4.7 코드의 52% 가 보안 취약점 도입 (vs Opus 4.1 51%, Sonnet 4.5 50%)
- TrustedSec CEO: Claude 코드 품질 47% 하락 측정
- BridgeMind: Opus 4.6 정확도 83.3% → 68.3%

### 4.2 사용자 결정 — 검수 우선

- D-4j = **전 코드 검수 (C1)**
- 범위: 전 코드 읽고 결함 식별. 결함 있으면 수정.
- 리팩토링 (재구조화) 은 이번 범위 아님 — 결함 있을 때만 수정
- 순서: 검수 먼저 → 검수 완료 후 Phase 4.5 (CI/pre-commit/smoke test) → Phase 5
- 근거: 사용자 원칙 "오류 최대한 안 나고 유지보수 수월". Anthropic 공식 인정 + 외부 검증 결과를 무시할 수 없음.

### 4.3 Phase 4.5 (CI/pre-commit/smoke test) 일정 변경

- D-4i handoff 원안: D-4j = Phase 4.5 진입
- 변경: D-4j = 검수, Phase 4.5 = 검수 완료 후 (D-4k 또는 그 이후)
- 이유: 검수 결과로 발견된 결함을 자동 검증 도구 (Phase 4.5) 부재 상태에서 수정해야 하는 부담은 있으나, 사용자가 "검수 먼저" 명시 결정
- Phase 4.5 의 의의 (오류 자동 감지, MF-16 resolved 보증) 는 변동 없음, 단지 시점만 뒤로

### 4.4 D-4j 첫 턴 정찰 범위

D-4j Planner 가 첫 정찰에서 실측:

1. 영향 기간 commit 매핑
   `git log --since="2026-03-04" --until="2026-04-20" --oneline`
   docs-only commit 제외, 코드 변경 commit 만 추출

2. 코드량 실측
   `find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" | xargs wc -l`
   전체 TypeScript 라인 수 확인. 검수 범위 산정용.

3. 현재 vitest 통과 상태 재확증
   `pnpm test` 또는 `pnpm -w turbo test` (사용자 직접 실행, MF-13 우회 원칙)

4. 검수 대상 파일 목록 확정
   - `packages/domain/src/*.ts` (zod schema)
   - `apps/web/` (Next 15.5.15 + 도메인 import)
   - `apps/mobile/` (Expo 54 + 도메인 import)
   - 설정 파일: `tsconfig.*`, `package.json`, `turbo.json`, `vitest.config.ts`, `metro.config.*`, `tailwind.config.*`

### 4.5 검수 방법 — Phase 1 (변경 0)

**원칙: 검수 단계는 읽기만, 수정 0**

검수 도구:
- 1차: Codex CLI 외부 Evaluator (단일 분야 = 코드 로직, file:line 근거 의무)
- 2차: Claude Planner 의 재확증 (D-4i 이슈 20 교훈 — Codex 보고는 반드시 Planner 첫 정찰로 재확증)

검수 결과 등급 분류:
- 🔴 Critical — 동작 오류, 빌드 실패, 보안 결함
- 🟠 High — 명백한 논리 오류, 미사용 코드, 잘못된 타입 추론
- 🟡 Medium — 개선 권장 (네이밍, 중복, 모호 타입)
- 🟢 Low — 스타일/주석/문서

검수 대상 chunk 분할:
- Chunk A: packages/domain/src/* (가장 핵심, 양 앱이 import)
- Chunk B: apps/web 코드
- Chunk C: apps/mobile 코드
- Chunk D: 설정 파일 (tsconfig, package.json, turbo.json 등)

각 Chunk 마다:
- Codex 검수 → Planner 재확증 → 결과 보고
- 사용자 승인 대기 (수정 진행 여부)

### 4.6 검수 결과 수정 정책 — Phase 2

수정은 Phase 1 (검수) 완료 후 별도 turn 에 진행.

수정 우선순위:
- 🔴 Critical → 즉시 수정 (각 1 commit, Gate 2 절차)
- 🟠 High → 검토 후 수정 (사용자 승인 후)
- 🟡 Medium → backlog 등록, 우선순위 재검토
- 🟢 Low → backlog 등록, 후속 처리

수정 turn 마다:
- thin slice (1 결함 = 1 commit)
- vitest 재실행 통과 확증 (MF-13 우회 원칙)
- explicit add list

### 4.7 검수 완료 후 = Phase 4.5 진입

- 검수 결과 모든 Critical/High 처리 완료 = Phase 1+2 완료
- Phase 4.5 (CI, pre-commit, smoke test) 진입 = D-4? (검수 진행 turn 수에 따라)

### 4.8 잠재 위험

- 검수 turn 수가 많아질 경우 세션 컨텍스트 포화 → 중간 handoff 필요 가능성
- Codex 외부 Evaluator 의 부분 착오 (D-4i 이슈 20 선례) → Planner 재확증 의무 유지
- 영향 기간 외 commit 도 검수 범위에 포함되므로 (사용자 결정 = 전 코드 검수), 단순 시간 매핑 만으로 우선순위 결정 X
- 검수 단계에서 발견된 결함이 Phase 4.5 자동 검증 도구로 잡힐 만한 것일 경우 — 그래도 수동 검수의 가치는 보조적 (자동이 100% 커버 X)
- vitest 통과 상태 = 단위 테스트 수준 검증. 통합/런타임 결함은 별도

### 4.9 D-4j 진입 후 즉시 결정 필요 사항

- 검수 chunk 순서 (A→B→C→D 권장, packages/domain 가장 핵심)
- 각 Chunk 검수 결과 보고 후 즉시 수정 vs Phase 1 전체 완료 후 일괄 수정 (사용자 선택)
- Codex 활용 빈도 (Chunk 마다 매번 vs 핵심 Chunk 만)

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — 완료 (D-4d-1)
- MF-05: vitest 도입 — 완료 (D-4f, HEAD=97ef126)
- MF-06: domain schema 고급 제약 — 완료 (D-4g, HEAD=8f3218e)
- MF-07~10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 — V1 기능 중반 이후
- MF-12: 실측 영향 없음 확인됨
- MF-13: Claude Code tee+장시간 exit 버그 — 우회 원칙 확립
- MF-14: Planner 정찰 파일 3상태 확증 — 실적용 완료
- MF-15: §3.3 체크리스트 m~u 보강 — 완료 (D-4h, HEAD=8f164ad)
- **MF-16**: apps/mobile @types/react peer dep mismatch — **resolved (D-4i 정찰 기반 종결, no action required)**
- MF-17/18/19: 완료/편입
- **MF-20 (신규, high)**: Claude Code bash stdout truncation 시 assistant API retry 루프 — 우회 원칙 확립
- **MF-21 (신규, high, Phase 4.5)**: CI (GitHub Actions) 구축 — pending, D-4j 착수
- **MF-22 (신규, medium, Phase 4.5)**: pre-commit hook 도입 — pending
- **MF-23 (신규, high, Phase 4.5)**: smoke test 구축 — pending
- **MF-24 (신규, medium)**: WSL 정찰 명령에서 rg 의존 금지 — 원칙 확립
- **MF-25 (신규, high)**: 전 코드 검수 (D-4j 안건) — 2026-04-23 Anthropic 발표 (Claude Code 품질 저하) 대응. 검수만, 결함 있을 때만 수정.

### 5.1 차기 세션 후보

- MF-26 후보 (Phase 4.5 후): minor-fixes.md 재정렬 + 이슈 로그 분리 (session-issues.md). 유지보수 관점 가독성 개선. 지금은 기록만.

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | **완료** |
| **4.4 코드 검수 (신설, D-4i 후속 결정)** | **전 코드 검수 — 2026-04-23 Anthropic 발표 대응 (MF-25)** | **대기, D-4j 진입** |
| **4.5 자동 검증** | **CI + pre-commit + smoke test (MF-21/22/23)** | **대기, 검수 완료 후 진입** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기, Phase 4.5 완료 후 진입 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 45% 지점 (Phase 4.5 신설로 총 단계 증가 반영 시 40% 대).

## 7. 새 대화창 시작 가이드 (D-4j)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환.
D-4i 완료 (MF-16 resolved + MF-20~25 신설 + Phase 4.5 신설 결정 + 검수 우선 결정, HEAD f576c28 + 검수 안건 반영 commit).

오늘 진입 = D-4j (전 코드 검수, MF-25, Phase 4.5 보다 선행).

GitHub public: https://github.com/ceoYS/acspc

배경 (반드시 인지):
2026-04-23 Anthropic 공식 postmortem 발표. Claude Code, Claude Agent SDK, Claude Cowork 가 2026-03-04 ~ 2026-04-20 기간 품질 저하. 외부 검증 (Veracode, TrustedSec, BridgeMind) 도 저하 실재 확인.
출처: https://www.anthropic.com/engineering/april-23-postmortem
사용자 결정: 전 코드 검수 (C1 — 검수만, 결함 있으면 수정. 리팩토링 X). 검수 먼저, Phase 4.5 다음.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4i-to-d4j.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- 검수 단계는 읽기만 (Phase 1), 수정 0
- 결함 발견 시 등급 분류 (Critical/High/Medium/Low) 후 사용자 승인 받아 수정 (Phase 2)
- Codex CLI 외부 Evaluator 활용 (단일 분야 + file:line 근거). Planner 재확증 의무 (D-4i 이슈 20 교훈)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4j 범위 = 검수 진입 첫 턴 (영향 기간 commit 매핑 + 코드량 실측 + vitest 통과 재확증)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

이전 턴 (D-4e~D-4i) 방법론 — 필수 준수:
1. MF-13 우회 원칙: pnpm install / pnpm test 사용자 직접 실행, Claude Code 는 로그 grep
2. MF-14 Planner 정찰: git ls-files + git check-ignore -v
3. Chunk 단위 분할, 각 Chunk 선행 조건 명시 (이슈 17), 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep 결과로만
5. 120초 STOP 조항
6. vitest 통과 판정은 "Tests N passed (N)" 요약만 (이슈 18)
7. turbo 로그 grep 시 ^ line-start anchor 금지 (이슈 16)
8. Codex CLI 외부 Evaluator 활용 가능 (단일 분야, 근거 file:line 의무). 단 Planner 첫 정찰로 반드시 재확증 (이슈 20, D-4i 교훈)
9. MF-20: Claude Code stdout 20 라인 제한 — 대규모 조회는 파일 리다이렉트 + 범위 cat. 또는 사용자 직접 실행 경로.
10. MF-24: rg 금지, grep -n 사용 (WSL 미설치 확증됨)

검수 chunk 권장 순서 (D-4j Planner 가 사용자와 확정):
- Chunk A: packages/domain/src/* (zod schema, 양 앱이 import)
- Chunk B: apps/web 코드
- Chunk C: apps/mobile 코드
- Chunk D: 설정 파일 (tsconfig, package.json, turbo.json, vitest.config.ts, metro.config.*, tailwind.config.*)

handoff 요약 보고 후 "D-4j Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4i 종결 commit hash 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] MF-13/14/20/24 교훈 인식 확인
- [ ] Chunk 단위 분할 전략 인식 확인
- [ ] Phase 4.5 의 의의 (사용자 원칙과의 연결) 인식 확인
- [ ] Codex CLI 교차 검증 가용 인식 + Planner 재확증 의무 인식 확인
