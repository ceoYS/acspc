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

## 4. D-4j 다음 턴 스펙 — Phase 4.5 진입

### 4.1 Phase 4.5 배경

D-4i 에서 사용자 결정: Phase 5 (Supabase, V1 실기능) 진입 **전** CI + pre-commit + smoke test 를 필수 선행 구축.

근거:
- 사용자 원칙 "오류 최소화 + 유지보수 수월함 + 기능 추가 시 오류 방지"
- 현재 repo 에 자동 검증 체계 부재 → 기능 추가마다 수동 검증 → 오류 누락 누적
- MF-16 resolved 판정의 자동 보증 도구로도 필요 (MF-23 smoke test)

### 4.2 Phase 4.5 구성요소 (3개 MF 대응)

- **MF-21 (high)**: CI (GitHub Actions) — typecheck + lint + vitest + next build + expo export
- **MF-22 (medium)**: pre-commit hook — staged 파일 typecheck + lint (husky + lint-staged)
- **MF-23 (high)**: smoke test — web Playwright `/` 렌더, mobile `expo export` 성공

### 4.3 Phase 4.5 진입 권장 순서

**D-4j 첫 턴**: Phase 4.5 설계 + 정찰
- `.github/workflows/` 존재 확인 (전제: 없음)
- 기존 turbo 스크립트 (`turbo typecheck`, `turbo test`, `turbo build`) 작동 확증
- CI thin slice 1 (install + typecheck only) 부터 시작할지 판정

**D-4j~D-4k (예상)**: MF-21 (CI) 단계별 구축
- Chunk A: `.github/workflows/ci.yml` thin slice (install + typecheck)
- Chunk B: lint job 추가 (lint 설정 유무 확증 선행)
- Chunk C: test job 추가 (vitest)
- Chunk D: build-web + build-mobile 추가
- 각 Chunk 마다 PR 1개 + 실제 GitHub Actions run 확증

**D-4l 이후**: MF-23 (smoke test)
- web Playwright 도입
- mobile expo export 번들 검증 스크립트

**D-4m 이후**: MF-22 (pre-commit hook)
- husky + lint-staged 도입
- local 실행 시간 측정 → 5초 초과 시 범위 축소

**Phase 4.5 완료 후**: Phase 5 (Supabase) 진입

### 4.4 D-4j Chunk 단위 설계 원칙 (이전 교훈 반영)

- MF-13 우회: GitHub Actions CI job 은 CI 환경에서 실행되므로 local pnpm install 부담 없음. 단 local 검증 시 MF-13 원칙 유지 (pnpm install 사용자 직접, Claude Code 는 로그 grep)
- MF-20: `.github/workflows/ci.yml` 파일 크기 작게 유지, Claude Code stdout 20 라인 제한
- MF-24: 모든 정찰에서 `rg` 금지, `grep -n` 사용
- Chunk 단위 분할, 각 Chunk 선행 조건 명시 (이슈 17)
- 120초 STOP 조항 유지
- Evaluator 필수 발동 (CI 설정 파일은 새 종류의 설정 파일, 이전 패턴 없음)

### 4.5 D-4j 잠재 위험

- GitHub Actions 의 pnpm install 이 회사망 registry 와 다른 결과 → lockfile 기반 설치가 회사망에서만 작동하면 CI 실패
- expo export CI 시간 (몇 분 단위) → 비용 증가
- pnpm-lock.yaml 의 integrity hash 가 회사망 registry tarball 과 public npm registry 간 일치하는지 확증 필요
- turbo 캐시 remote 설정 (turbo remote caching) 검토 범위 여부

### 4.6 D-4j 진입 전 확정 필요 사항

- Phase 4.5 순서 (CI → smoke → pre-commit) vs (CI → pre-commit → smoke) 선택
- CI 의 첫 thin slice 범위 (install + typecheck만 vs install + typecheck + test)
- pnpm 회사망 registry 를 CI 에서 사용할지 (SSO/토큰 주입 가능성) 또는 public npm 만 사용

이 3개는 D-4j Planner 첫 턴에서 결정.

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

### 5.1 차기 세션 후보

- MF-25 후보 (D-4j 이후): minor-fixes.md 재정렬 + 이슈 로그 분리 (session-issues.md). 유지보수 관점 가독성 개선. 지금은 기록만.

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | **완료** |
| **4.5 자동 검증 (신설)** | **CI + pre-commit + smoke test (MF-21/22/23)** | **대기, D-4j 진입** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기, Phase 4.5 완료 후 진입 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 45% 지점 (Phase 4.5 신설로 총 단계 증가 반영 시 40% 대).

## 7. 새 대화창 시작 가이드 (D-4j)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환. D-4i 완료 (MF-16 resolved + MF-20~24 신설 + Phase 4.5 신설 결정, HEAD D-4i-hash).
오늘 진입 = D-4j (Phase 4.5 진입: MF-21 CI 구축 착수).
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4i-to-d4j.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Evaluator 필수 (CI 설정 파일 신종, 이전 패턴 없음)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4j 범위 = Phase 4.5 진입 첫 턴 (CI thin slice 설계 + 정찰)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지
- explicit add list, no git add .

이전 턴 (D-4e~D-4i) 방법론 — 필수 준수:
1. MF-13 우회 원칙: pnpm install 사용자 직접 실행, Claude Code 는 로그 grep
2. MF-14 Planner 정찰: git ls-files + git check-ignore -v
3. Chunk 단위 분할, 각 Chunk 선행 조건 명시 (이슈 17), 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep 결과로만
5. 120초 STOP 조항
6. vitest 통과 판정은 "Tests N passed (N)" 요약만 (이슈 18)
7. turbo 로그 grep 시 ^ line-start anchor 금지 (이슈 16)
8. Codex CLI 외부 Evaluator 활용 가능 (단일 분야, 근거 file:line 의무). 단 Planner 첫 정찰로 반드시 재확증 (이슈 20, D-4i 교훈)
9. **MF-20: Claude Code stdout 20 라인 제한** — 대규모 조회는 파일 리다이렉트 + 범위 cat. 또는 사용자 직접 실행 경로.
10. **MF-24: rg 금지, grep -n 사용** (WSL 미설치 확증됨)

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
