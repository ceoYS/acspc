# Handoff — D-4k → D-4l (2026-04-27, Session 12 end)

## 1. Session 12 (D-4k) 종결 요약

D-4k Phase 4.5 의 2/3 구성요소 완료. MF-21 (CI) 만 남기고 본 턴 종결.

- Chunk 1 (사전): Node pinning — `.nvmrc` (v22.22.2) + `engines >=22.22.2 <23` (HEAD=7816e22)
- Chunk 2 (MF-23): smoke script — `pnpm run smoke = turbo run check-types test build` (HEAD=18b4118)
- Chunk 3a (MF-22): simple-git-hooks 도입 — pre-commit = `pnpm run check-types` (HEAD=a3de823)
- Chunk 3b (MF-22): minor-fixes.md 본문 업데이트 (HEAD=dc85456)

검수 결과: Critical 0, High 0. Phase 4.5 = 2/3 (MF-22 + MF-23 완료, MF-21 미진입).

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
- HEAD: dc85456 (또는 그 이후)
- git status clean

## 3. D-4k 핵심 결정 (변경 사항)

- **lint-staged 제거** (Chunk 1 결정 → Chunk 3 수정): prettier config 부재 + monorepo 분기 복잡도 + domain lint 부재 등 발견 후 simple-git-hooks 단일 도입으로 단순화
- **smoke 범위 확정**: domain check-types/test, web check-types/build, mobile check-types. mobile expo export 제외 (scope-cut)
- **pre-commit hook = check-types only**: smoke 보다 가벼움, build 제외 → commit 흐름에 부담 없음 (FULL TURBO 145ms 실증)
- **simple-git-hooks docs 인용**: github.com/toplenboren/simple-git-hooks README, prepare 스크립트 = `simple-git-hooks` (single token, npx 불필요)

## 4. D-4k 신규 백로그 후보

- **MF-27 후보**: lint-staged + prettier 자동화 (V1 후반, prettier config 정비 후 진입). 본 턴은 minor-fixes.md MF-22 본문에 mention, 신규 항목 미생성.

## 5. D-4l 다음 턴 스펙 — Phase 4.5 마무리 (MF-21 CI)

### 5.1 Phase 4.5 잔여 = MF-21 CI 1건

GitHub Actions workflow 작성 — pnpm install + check-types + lint + test + build pipeline 자동화.

### 5.2 진입 즉시 결정 필요 (Chunk 4 정찰 시 미수령)

corp 망 3답 (D-4l 첫 turn 에 사용자 답변 필수):

1. **Runner 정책**: `runs-on: ubuntu-latest` (GitHub 호스팅 runner) 동작 여부?
2. **CI registry 접근**: CI 잡 안에서 `pnpm install` 시 npm registry 접근 가능? (corp CA 주입 필요 여부)
3. **Secrets 권한**: `https://github.com/ceoYS/acspc` Settings → Secrets 추가 권한 보유 여부?

### 5.3 시나리오 분기

- **A 정상** (Runner OK + registry OK): 표준 GitHub Actions workflow. 1~2 chunk 종결
- **B CA 주입형** (Runner OK + CA 필요 + Secrets 있음): CA secret 등록 + workflow 에서 `NODE_EXTRA_CA_CERTS` 환경변수 주입 step
- **C 보류형** (Runner 불가 / 제약 큼): Phase 4.5 부분 종결 + MF-21 을 Phase 6 이후 / self-hosted runner 검토

### 5.4 D-4l 첫 정찰 후보

3답 받은 뒤:
- (시나리오 A/B) `.github/workflows/` 디렉터리 정찰 (백지 확증 D-4k Chunk 1 완료, 재확인 가능)
- (시나리오 A/B) workflow 안에서 호출할 명령 = `pnpm install --frozen-lockfile && pnpm run smoke + pnpm run lint`
- (시나리오 C) Phase 5 (Supabase) 진입 또는 D-4j 잔여 (MF-06 H1/H3) 처리 의논

### 5.5 잠재 위험

- corp Actions 환경 = 일반 GitHub Actions runner 와 다를 가능성 (자체 호스팅 runner / corp registry / VPN 제약)
- workflow 안의 pnpm install 시간 = 로컬 14.3s 대비 길 수 있음 (cache 미확보 시)
- pre-commit hook 과 CI 가 동일 명령(check-types) 호출 → 이중 검증 부담 검토 (smoke = build 포함, pre-commit = check-types only 로 분리해 둔 상태이므로 OK)

## 6. D-4j 잔여 백로그 (Phase 5 전 처리 권장)

- **MF-06 잔여**: Photo.storage_path regex / Vendor.name 특수문자 sanitize. Phase 5 (Supabase) 진입 전 처리 권장
- **MF-11**: apps/web tsconfig 재구성 (extends @repo/typescript-config). V1 후반
- **MF-02**: tailwind v3/v4 통합. V1 후반
- **MF-27 후보 (D-4k 신설)**: lint-staged + prettier. V1 후반

## 7. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | 완료 |
| 4.4 코드 검수 | 전 코드 검수 (MF-25) | 완료 (D-4j, HEAD=02ea380 + 종결) |
| **4.5 자동 검증** | **Node pinning + MF-22 + MF-23 완료, MF-21 잔여** | **2/3 완료, D-4l 진입 시 MF-21 마무리** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기, Phase 4.5 완료 후 진입 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 55% 지점 (Phase 4.5 = 2/3 완료).

## 8. 새 대화창 시작 가이드 (D-4l)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4k 완료 (Phase 4.5 = 2/3, Node pinning + MF-22 + MF-23 종결, MF-21 잔여, HEAD=dc85456).

오늘 진입 = D-4l (Phase 4.5 마무리: MF-21 CI).

GitHub public: https://github.com/ceoYS/acspc

배경 (인지):
D-4k 3 chunk 완료. simple-git-hooks 단일 도입 (lint-staged 제거 결정).
잔여: MF-21 CI (corp 망 3답 분기 필요).
사용자 결정: Phase 4.5 마무리.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4k-to-d4l.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- Phase 4.5 잔여 = MF-21 CI
- Codex CLI 외부 Evaluator 활용 가능 (단일 분야 + file:line 근거 + docs 인용 hard rule). Planner 재확증 의무
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지 (단 docs-only / 작은 변경은 묵시적 승인 패턴 인정)
- explicit add list, no git add .

D-4k 방법론 — 필수 준수:
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
11. 이슈 25 (D-4j 신규): Generator 프롬프트 = 수행 명령만. Planner/Evaluator 메타는 사용자 메시지에만

D-4l 진입 즉시 답변 필요 (사용자):
- corp 망 GitHub Actions Runner 정책 (`runs-on: ubuntu-latest` 동작 여부)
- CI 잡에서 npm registry 접근 가능 여부 (CA 주입 필요 여부)
- ceoYS/acspc Settings → Secrets 권한 보유 여부

답변에 따라 시나리오 분기:
- A 정상: 표준 GitHub Actions workflow
- B CA 주입형: CA secret + 환경변수 step
- C 보류: MF-21 후순위, Phase 4.5 부분 종결

handoff 요약 보고 후 "D-4l Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4k 종결 commit hash (dc85456) 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] D-4k 핵심 결정 (lint-staged 제거 + simple-git-hooks 단일) 인식 확인
- [ ] corp 망 3답 시나리오 분기 (A/B/C) 인식 확인
- [ ] Codex CLI hard rule (docs 인용 file:line) 인식 확인
