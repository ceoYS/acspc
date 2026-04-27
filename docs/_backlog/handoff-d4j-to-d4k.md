# Handoff — D-4j → D-4k (2026-04-27, Session 11 end)

## 1. Session 11 (D-4j) 종결 요약

D-4j Phase 4.4 (전 코드 검수, MF-25) 완료. 4 chunk 검수 분할 후 결함 수정.

- Chunk A: packages/domain (HEAD=6185a46) — MF-06 부분 완료 (zod schema 검증 보강)
- Chunk B: apps/web (HEAD=3174220) — 접근성 fix (button → div, design token page)
- Chunk C: apps/mobile (HEAD=386d55a) — 미사용 React import 제거 (tabs/index)
- Chunk D: 설정 파일 (HEAD=02ea380) — domain tsconfig dead outDir + exclude.dist 제거

검수 결과: Critical 0건, High 0건 (수정 후 잔여 0). Medium/Low 잔여는 별도 backlog (MF-06 H1/H3, MF-11, MF-02).

## 2. 환경 가정 + 검증

본 turn 진입 시 다음 명령으로 환경 확증:

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
- HEAD: D-4j 종결 정리 commit hash (또는 그 이후)
- git status clean

## 3. D-4j 이슈 기록 (minor-fixes.md 참조)

- 이슈 23: Codex 외부 Evaluator 의 부분 착오 + 환각 file 인용 (Chunk A, hard rule mitigation 적용)
- 이슈 24: Claude Code WSL bash 경로 해석 (Chunk A, 단일 재발)
- 이슈 25: Generator 프롬프트 메타 섹션 혼동 (Chunk C 후반, mitigation 적용)
- 이슈 26: 묵시적 Gate 2 — 사용자 직접 push 패턴 (Chunk B/C/D, 운영 스타일로 인정)

상세는 `docs/_backlog/minor-fixes.md` §"이슈 로그 (메타, D-4j Chunk A)" + §"이슈 로그 (메타, D-4j Chunk B/C/D)" 참조.

## 4. D-4k 다음 턴 스펙 — Phase 4.5 진입

### 4.1 Phase 4.5 = CI + pre-commit + smoke test (D-4i 결정)

D-4i handoff §4.4 + 사용자 결정으로 Phase 4.5 신설. D-4j 검수 완료 후 진입.

3대 구성 요소:
- **MF-21 (high)**: CI (GitHub Actions) — pnpm install + check-types + lint + test pipeline 자동화
- **MF-22 (medium)**: pre-commit hook — husky + lint-staged 또는 simple-git-hooks 로 commit 전 자동 검증
- **MF-23 (high)**: smoke test — 양 앱 (web/mobile) 의 import path + 기본 build 가 깨지지 않는지 자동 확인

### 4.2 D-4k 진입 후 즉시 결정 필요 사항

- 3 구성요소 진입 순서 (MF-21 CI 먼저 / MF-23 smoke test 먼저 / 동시)
- CI 도입 시 Node version pinning (v22.22.2 고정 vs LTS range)
- pre-commit hook 도구 선택 (husky vs simple-git-hooks vs lefthook)
- corp 망 GitHub Actions 호환성 (NPM registry 접근, secret 관리)

### 4.3 잠재 위험

- 회사 GitHub Actions 환경 = 일반 Actions runner 와 다를 수 있음 (자체 호스팅 runner / corp registry / VPN 제약)
- pre-commit hook 도입 시 사용자 로컬 환경 (WSL Ubuntu) 호환성 필수
- smoke test 가 next build / expo export 를 실제 실행 시 시간 소요 + 안정성 우려
- D-4j 잔여 backlog (MF-06 H1/H3) Phase 5 전 처리 권장 = D-4k 또는 그 이후 turn 에서 별도 처리

### 4.4 D-4j 잔여 backlog 처리 권장 시점

- **MF-06 잔여**: Photo.storage_path regex / Vendor.name 특수문자 sanitize. Phase 5 (Supabase) 진입 전 처리 권장
- **MF-11**: apps/web tsconfig 재구성 (extends @repo/typescript-config). V1 후반
- **MF-02**: tailwind v3/v4 통합. V1 후반
- **이슈 25/26**: 운영 패턴 mitigation 완료. 별도 처리 불요

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — 완료 (D-4d-1)
- MF-05: vitest 도입 — 완료 (D-4f, HEAD=97ef126)
- **MF-06**: domain schema 고급 제약 — **부분 완료 (D-4g + D-4j Chunk A, HEAD=6185a46)**. 잔여: Photo.storage_path regex / Vendor.name 특수문자 sanitize / Photo.unique
- MF-07~10: 완료 (D-4e)
- MF-11: apps/web tsconfig extends 재구성 — V1 기능 중반 이후
- MF-12: 실측 영향 없음 확인됨
- MF-13: Claude Code tee+장시간 exit 버그 — 우회 원칙 확립
- MF-14: Planner 정찰 파일 3상태 확증 — 실적용 완료
- MF-15: §3.3 체크리스트 m~u 보강 — 완료 (D-4h, HEAD=8f164ad)
- MF-16: apps/mobile @types/react peer dep mismatch — resolved (D-4i 정찰 기반 종결)
- MF-17/18/19: 완료/편입
- MF-20 (high): Claude Code bash stdout truncation — 우회 원칙 확립
- **MF-21 (high, Phase 4.5)**: CI (GitHub Actions) 구축 — pending, D-4k 착수
- **MF-22 (medium, Phase 4.5)**: pre-commit hook 도입 — pending
- **MF-23 (high, Phase 4.5)**: smoke test 구축 — pending
- MF-24 (medium): WSL 정찰 명령에서 rg 의존 금지 — 원칙 확립
- **MF-25 (high)**: 전 코드 검수 — **완료 (D-4j, HEAD=02ea380)**

### 5.1 차기 세션 후보

- MF-26 후보 (Phase 4.5 후): minor-fixes.md 재정렬 + 이슈 로그 분리 (session-issues.md). 유지보수 관점 가독성 개선. 지금은 기록만.

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | 완료 |
| 4.4 코드 검수 | 전 코드 검수 — 2026-04-23 Anthropic 발표 대응 (MF-25) | **완료 (D-4j, HEAD=02ea380)** |
| **4.5 자동 검증** | **CI + pre-commit + smoke test (MF-21/22/23)** | **대기, D-4k 진입** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기, Phase 4.5 완료 후 진입 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 50% 지점 (Phase 4.4 완료 + Phase 4.5 직전).

## 7. 새 대화창 시작 가이드 (D-4k)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화 전 전환.
D-4j 완료 (MF-25 전 코드 검수 종결, MF-06 부분 완료, 이슈 23/24/25/26 기록, HEAD=02ea380 + 종결 정리 commit).

오늘 진입 = D-4k (Phase 4.5: CI/pre-commit/smoke test, MF-21/22/23).

GitHub public: https://github.com/ceoYS/acspc

배경 (인지):
D-4j 4 chunk 검수 완료. Codex 외부 Evaluator hard rule 효과 입증 (이슈 23 mitigation).
잔여 backlog: MF-06 H1/H3 (Phase 5 전 처리 권장), MF-11 (V1 후반), MF-02 (V1 후반).
사용자 결정: Phase 4.5 진입.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4j-to-d4k.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Phase 4.5 = CI (MF-21) + pre-commit (MF-22) + smoke test (MF-23)
- Codex CLI 외부 Evaluator 활용 가능 (단일 분야 + file:line 근거 + docs 인용 hard rule). Planner 재확증 의무
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지 (단 docs-only / 작은 변경은 묵시적 승인 패턴 인정 — D-4j 운영 사례)
- explicit add list, no git add .

이전 턴 (D-4e~D-4j) 방법론 — 필수 준수:
1. MF-13 우회: pnpm install/test 사용자 직접 실행, Claude Code 는 로그 grep
2. MF-14 정찰: git ls-files + git check-ignore -v
3. Chunk 분할, 선행 조건 명시, 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep
5. 120초 STOP 조항
6. vitest 판정은 "Tests N passed (N)" 요약만
7. turbo grep 시 ^ anchor 금지
8. Codex CLI 활용 가능 (단일 분야, file:line 근거, **docs 인용 hard rule** — 인용 시 docs file:line 필수). Planner 첫 정찰 재확증 의무
9. MF-20: Claude Code stdout 20 라인 제한
10. MF-24: rg 금지, grep -n 사용
11. **이슈 25 (D-4j 신규)**: Generator 프롬프트 = 수행 명령만. Planner/Evaluator 메타는 사용자 메시지에만

D-4k 진입 즉시 결정 필요:
- 3 구성요소 진입 순서 (MF-21 / MF-22 / MF-23)
- CI corp 망 호환성 사전 정찰
- Node version pinning 정책

handoff 요약 보고 후 "D-4k Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4j 종결 정리 commit hash 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] D-4j 이슈 23/24/25/26 인식 확인
- [ ] Phase 4.5 의 의의 (사용자 원칙과의 연결) 인식 확인
- [ ] Codex CLI hard rule (docs 인용 file:line) 인식 확인
