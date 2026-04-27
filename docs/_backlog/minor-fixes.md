# Minor Fixes Backlog

Turn D-1 Evaluator 재검증 (2026-04-22) 에서 Codex FAIL/MINOR 처리되었으나
Planner 감수 결과 PASS 다수. 아래 1건은 실제 MINOR 로 확정, D-2~D-6 중
자연스러운 터치 기회에 소화.

## MF-01: plan-review-gate.md Gate 1 우회 조건 범위

- **파일**: `.claude/rules/plan-review-gate.md` L87
- **현재**: Gate 1 우회 허용에 "한 함수 내부 국소 수정 (10줄 이하)" 포함
- **문제**: handoff 원칙은 "타입·린트·오타 (10줄 이하)" 만 명시.
  함수 국소 수정은 스펙 외 확장.
- **조치**: 해당 줄 삭제 또는 우회 불가로 변경
- **처리 시점**: D-2~D-6 중 plan-review-gate.md 를 다른 사유로 터치하게
  될 때 함께 반영
- **우회 위험도**: 낮음 (10줄 제약 + Gate 2 필수 유지)

## Evaluator 판정 드리프트 기록

Codex CLI 동일 프롬프트 2회 실행 시 FAIL 항목이 매번 다르게 나옴.
향후 Evaluator 판정은 반드시 Planner 감수 후 최종 결정.

## 처리 원칙

- MF 항목은 D-2~D-6 진행 중 해당 파일을 다른 사유로 터치할 때 함께 반영.
- 단독 fix 커밋은 생성하지 않음 (scope-cut).
- 8주 후에도 미처리 항목이 있으면 V1.5 또는 V2 로 이월 검토.

## MF-04: mobile 측 @repo/domain import 검증 (신규 — D-4c-1)

- Metro 가 workspace TS 소스 직접 해석하는지 확인 필요
- apps/mobile 에 @repo/domain 의존성 추가 + 간단한 parse 호출로 검증
- 실패 시 transpilePackages 유사 설정 또는 tsup 빌드 스텝 도입 검토
- D-4c-2 이후 별도 턴

## MF-05: vitest 테스트 프레임워크 도입 (신규 — D-4c-1)

- packages/domain zod 스키마 parse 성공/실패 테스트
- 루트 또는 패키지별 vitest 설정 결정
- 현재 thin slice 로 제외
- V1 기능 구현 중반~후반 재검토
- → 완료 (D-4f, HEAD=97ef126, packages/domain 에 vitest 도입, ProjectSchema 테스트 2 case 통과. turbo pipeline `test` task 통합, `pnpm turbo test` green)

## MF-06: domain schema 제약 완전 반영 (신규 — D-4c-1)

- Vendor.name 특수문자 (/ \ : * ? " < > |) → _ 치환 (transform)
- Photo.taken_at 미래 금지 (refine, now()+1시간 기준)
- Photo.storage_path 형식 검증 (regex)
- unique(project_id, name) 제약 — DB 레벨에서 강제, 스키마 외부
- D-4c-1 은 core 필드 + 기본 길이 제약만 반영
- → 부분 완료 (D-4g + D-4j Chunk A, HEAD=6185a46): ProjectSchema/Location/Trade/Vendor.name blank-after-trim refine + 4 schema test coverage. Photo.storage_path / taken_at / Vendor 특수문자 / unique 잔여.

### 진행 — D-4j Chunk A (HEAD=6185a46)

**부분 완료 (D-4g + D-4j Chunk A)**:
- D-4g: ProjectSchema.name `.refine((s) => s.trim().length > 0)` 추가 (HEAD=8f3218e)
- D-4j Chunk A commit 1 (HEAD=e5722c2): Location/Trade/Vendor.name 동일 패턴 일관 적용 (3 파일 +15 -3)
- D-4j Chunk A commit 2 (HEAD=6185a46): Location/Trade/Vendor/Photo schema 별 valid + invalid 테스트 추가 (4 신규 파일 +116, vitest 4→12 passed)

**잔여 (MF-06 미완)**:
- Photo.storage_path 형식 검증 (regex {user_id}/{project_id}/{id}.jpg) — D-4j Codex H1, Medium 으로 강등
- Photo.taken_at future cutoff (now()+1h) — D-4j Codex H2, **기각** (handoff-d4f-to-d4g.md:149 "동적 refinement 는 deterministic 테스트 어려움 → 정적 제약 선호" 정책)
- Vendor.name 특수문자 sanitize (`/\:*?"<>|`) — D-4j Codex H3, 근거 약함 (storage_path 맥락 ≠ vendor 인적 표기), Medium 으로 강등 + 재검토 필요
- Photo.unique(project_id, name) — DB 레벨, V1 후반 (Phase 5 Supabase 도입 후)

**우선순위**: Phase 5 진입 전 Photo.storage_path regex 정도는 처리 권장. 나머지는 V1 후반.

## MF-07: apps/web tsconfig 에 noUncheckedIndexedAccess 미설정 (신규 — D-4c-2)

- .claude/rules/tech-stack.md §1.8 에서 권장하는 옵션
- create-next-app 기본 tsconfig 그대로라 누락
- 기존 코드에 영향 있을 수 있으므로 별도 턴에서 일괄 점검 후 적용
- apps/mobile 도 동일 누락 가능 (Expo default) — 같이 확인
- → 완료 (D-4e, dry-run N=0, 에러 0건, apps/web + apps/mobile 양쪽 noUncheckedIndexedAccess: true 추가)

## MF-08: apps/web 에 check-types 스크립트 미정의 (신규 — D-4c-2)

- turbo.json 은 check-types pipeline 정의
- apps/web/package.json scripts 에 check-types 없음 (현재는 next build 가 typecheck 대리)
- apps/mobile 도 동일
- turbo run check-types 가 전 패키지에 잘 분산되도록 스크립트 표준화 필요
- 별도 턴에서 일괄
- → 완료 (D-4e, apps/web/package.json scripts.check-types: "tsc --noEmit" 추가)

## MF-09: apps/mobile 에 package-lock.json 이 pnpm-lock.yaml 과 공존 (신규 — D-4d-1)

- create-expo-app 자동 생성 잔재로 `apps/mobile/package-lock.json` 존재
- 현재는 pnpm 이 루트 `pnpm-lock.yaml` 우선 사용해 무해
- 향후 혼동 방지 위해 `apps/mobile/package-lock.json` 삭제 + pnpm install 재검증 필요
- 별도 턴 대상
- → 완료 (D-4e, apps/mobile/package-lock.json 삭제. gitignore line 44 로 원래부터 untracked. pnpm install --frozen-lockfile 3.9s 통과, @repo/domain symlink 유지, pnpm-lock.yaml 무변경)

## MF-10: apps/mobile 에 check-types 스크립트 미정의 (신규 — D-4d-1)

- apps/mobile/package.json scripts 에 check-types 없음
- turbo check-types --filter=mobile 시 mobile 태스크 자체는 스킵 (의존성인 @repo/domain 만 실행)
- MF-08 (apps/web) 과 대칭 이슈
- 양측 동시 보정 권장 (`"check-types": "tsc --noEmit"` 추가)
- 별도 턴에서 일괄
- → 완료 (D-4e, apps/mobile/package.json scripts.check-types: "tsc --noEmit" 추가)

## MF-11: apps/web tsconfig 을 @repo/typescript-config/nextjs.json extends 로 재구성 (경로 B 정석)

- 현재 apps/web/tsconfig.json 은 standalone (create-next-app 기본)
- packages/typescript-config/base.json 에 noUncheckedIndexedAccess 이미 설정, nextjs.json 이 상속
- extends 로 재구성 시 monorepo 공통 TS 옵션 중앙화
- V1 구현 중 처리 (D-4e 에서는 경로 A 로 회피)

## MF-12 (후보): handoff 본문에 $ 포함 시 훼손 관측

- handoff-d4d-to-d4e.md §2.1 환경 검증 템플릿에서 $HOME 이 HOME 으로 저장됨 (2곳)
- 원인 미확정 (shell expansion 가설 불일치, 단일 샘플)
- 다음 handoff 작성 시 실험적 조치: \$ escape, single-quote 블록, 또는 base64 우회
- 재현 시 docs/_backlog/known-issues.md 신설 검토

## MF-13 (신규 — D-4e): Claude Code bash 도구의 tee 파이프 + 장시간 프로세스 exit 인지 실패

- 재현: `pnpm install --frozen-lockfile 2>&1 | tee /tmp/log` 명령이 실제로는 3.9s 완료했으나 Claude Code 는 (timeout 2m) 판정
- 사용자 수동 재실행 시 2.6s 완료 (동일 명령, tee 포함)
- 원인 가설: Claude Code 내부 bash wrapper 가 tee 파이프라인 exit 신호 놓침. 단일 비교 샘플로 tee 단독인지 pnpm install 조합인지 미분리
- 우회 원칙 (D-4e 이후 적용):
  * 네트워크/장시간 명령 (pnpm install, turbo, expo start, next build 등) 은 Claude Code 내부 실행 금지
  * 사용자가 생 bash 에서 직접 실행, Claude Code 는 로그 파일 grep/판정만 담당
  * Claude Code 내부 편집·검증 영역에서도 tee 대신 `> log 2>&1` 리다이렉트 권장
- Generator 프롬프트 작성 시 "수동 분리 sub-step" 패턴 적용 (D-4e Chunk 5.3 예시)

## MF-14 (신규 — D-4e): Generator 판정 기준 작성 시 파일 tracked/untracked/ignored 상태 선행 정찰 누락

- 재현: Chunk 2 Sub-step 2.1 에서 `git status --short <file>` 빈 출력을 "실패" 로 분류. 실제로는 대상 파일이 gitignore 로 untracked 라 rm 후 status 영향 없음 = 정상 성공
- 원인: Planner 정찰 단계에서 `git ls-files` + `git check-ignore -v` 누락
- Planner 체크리스트 보강: 정찰 대상 파일에 대해 "tracked / untracked / ignored" 3상태 확증 후 Generator 판정 기준 작성
- Generator 프롬프트에 file deletion 검증 로직 포함 시 물리적 부재 (`ls` 에러 확인) + git status 이원 판정

## MF-15 (신규 — D-4f): §3.3 Evaluator 체크리스트 m~u 보강 — 완료 (D-4h, HEAD 8f164ad)

- 상태: 제안 (미구현). 다음 세션 operating-principles.md 편집 턴에서 반영
- 우선순위: low (MF-06 이후)
- 배경: D-4e/D-4f 운영 중 반복 관측된 패턴을 §3.3 체크리스트로 승격
- 후보 항목:
  * m. 장시간 실행 명령 완료 판정은 자체 판단 금지, 성공 문자열 grep 로 기계화 (이슈 8/13)
  * n. 120초 STOP 조항을 모든 Step 에 재명시 (이슈 9)
  * o. 성공/실패 판정 문자열 enumeration 의무 (이슈 10)
  * p. sleep 체인 금지, run_in_background 권장 (이슈 11)
  * q. 파일 tracked/untracked/ignored 3상태 선행 확증 (이슈 14)
- 추가 편입 후보 (D-4f 이슈 15/16 승격):
  * r. STOP 조건 작성 시 "이번 Chunk 산출물" vs "누적 상태" 구분 명시
  * s. turbo 로그 grep 시 `^` line-start anchor 금지, prefix 포함 패턴 사용
- 추가 편입 후보 (D-4g 이슈 17/18 승격):
  * t. 복수 Chunk 연속 발행 시 각 Chunk 선행 조건 명시 (이전 Chunk 산출물 상태 선행 확증)
  * u. vitest passed 로그 grep 시 개별 test 이름 anchor 금지, "Tests N passed (N)" 요약 패턴만 신뢰

### 완료 요약 (D-4h)

- thin slice 6/9 체크리스트 bullet 실적용: m, o, q, r, t, u
- D-4i deferral: n, p, s (재발 빈도 · 실패 크기 낮음)
- 외부 Evaluator (Codex CLI): 🟡 Medium, 중복·비대화 방지 관점에서 9개 일괄 대신 thin slice 권장 수용
- 반영 방식: `m.`/`n.` 등 문자 라벨 제거, 기존 체크리스트 bullet 형식 ("원칙 — 설명") 일관성 유지
- commit: 8f164ad
- 후보 문구 보관: n (120초 STOP 재명시), p (sleep 체인 금지, run_in_background), s (turbo grep `^` anchor 금지) → D-4i 재판단

## MF-16 (D-4f → D-4i 종결): apps/mobile @types/react peer dep — resolved (no action required)

- 상태: resolved (D-4i 정찰 기반 종결, HEAD TBD)
- 우선순위: medium (다음 mobile 작업 전 해결)
- 발견 맥락: Chunk C (D-4f) `pnpm add -D vitest` 실행 시 경고 관측
- 구체:
  * `@types/react-dom@19.2.3` 의 peer `@types/react@^19.2.0` 필요
  * 실제 설치 버전 `@types/react@19.1.17` → minor 한 단계 낮음
  * vitest 설치와 무관, 기존 apps/mobile 의존성 상태
- 영향: 이번 턴에선 런타임 문제 미관찰. strict typecheck 또는 mobile build 단계에서 표면화 가능
- 조치 후보: `@types/react` 를 ^19.2.0 으로 bump 또는 `@types/react-dom` 을 19.1.x 로 맞춤 (양측 호환 확인 필요)

### 종결 요약 (D-4i)

정찰 실측 기반 판정 (Codex 외부 Evaluator 보고 + Claude Planner 실측 재확증):

- mobile package.json: `@types/react: ~19.1.0` 단일 선언, `@types/react-dom` 직접 선언 없음
- lock mobile importer: `@types/react@19.1.17` 만 해석, `@types/react-dom` 미존재
- lock web importer: `@types/react@19.2.14` + `@types/react-dom@19.2.3(@types/react@19.2.14)` → peer 일치
- 각 importer 의 devDependency 스코프 분리 유지 (hoisted linker 하에서도)
- 결론: peer mismatch 의 실체가 repo 현 상태에 부재. 원 진단은 transitive peer 를 direct 로 혼동한 결과로 추정.
- bump 미실행 근거: React Native 0.81.5 / React 19.1.0 tuple 과 일관된 mobile `~19.1.0` 유지가 유지보수 안정. @types 19.2 강제 주입은 예측 불가 변동 리스크.
- 판정 안전성: Phase 4.5 (MF-21/22/23) 의 smoke test 가 CI 에서 이 판정을 자동 보증.

## MF-20 (신규 — D-4i): Claude Code bash stdout truncation 시 assistant API retry 루프
- 상태: 우회 원칙 확립
- 우선순위: high (재발 시 세션 시간 대량 소모)
- 발견 맥락: D-4i Chunk A Step 4-2 에서 `sed -n '121,171p' pnpm-lock.yaml` 실행 후 bash stdout 일부 표시 (+39 lines truncation) → assistant step 에서 "Retrying in 0s · attempt 1/10" 3분 35초 Cooking
- 구체:
  * bash 자체는 정상 종료 (쉘 복귀 확증)
  * truncation 표시 (`+N lines (ctrl+o to expand)`) 이후 assistant API 호출이 response 를 못 받음
  * esc interrupt 로 복구, 파일시스템 무손상
- 영향: 정찰/편집 Chunk 의 예측 불가 지연. 사용자 시간 소모.
- 조치 후보:
  * Claude Code 경유 명령의 stdout 을 20 라인 이하로 사전 제한
  * 대규모 조회는 `> /tmp/xxx.txt` 리다이렉트 + cat 범위 제한
  * 또는 사용자 직접 bash 실행 + 결과 복붙 (스크린샷/텍스트) 경로 선택
  * D-4c-2 bullet `l` (bash 체인 exit 전파) 의 assistant API 버전 변형으로 해석, §3.3 체크리스트 후보 편입 검토 (차기 세션)

## MF-21 (신규 — D-4i, Phase 4.5 구성요소): CI (GitHub Actions) 구축
- 상태: pending (Phase 4.5 진입 시 착수)
- 우선순위: high (Phase 5 진입 전 필수 선행)
- 발견 맥락: D-4i 사용자 원칙 "오류 최소화 + 유지보수 수월함" 및 "기능 추가 시 오류 방지" 를 실효화하려면 push 마다 자동 검증 필요
- 구체:
  * trigger: push / pull_request to main
  * jobs: install (pnpm install) / typecheck (turbo typecheck) / lint (설정 유무 확증 후) / test (turbo test = vitest) / build-web (next build) / build-mobile (expo export)
  * 환경: GitHub 호스티드 러너, 회사망 CA 불필요
- 영향: 없을 시 기능 추가마다 수동 검증 → 오류 누락 리스크, 유지보수 부채 누적
- 조치 후보:
  * `.github/workflows/ci.yml` 1파일 thin slice 로 시작
  * pnpm install 네트워크 시간, expo export 빌드 시간 측정 후 jobs 분할 여부 결정
  * Phase 4.5 내 Chunk 로 분할 (install/typecheck → test → build)

## MF-22 (신규 — D-4i, Phase 4.5 구성요소): pre-commit hook 도입
- 상태: pending (Phase 4.5 진입 시 착수)
- 우선순위: medium (local 피드백 루프 개선)
- 발견 맥락: Phase 4.5 결정 시 CI 단독으로는 local 에서 실수 commit 후에야 실패 감지 → pre-commit 단에서 최소 검증 필요
- 구체:
  * 도구: husky + lint-staged (또는 simple-git-hooks)
  * 범위: staged 파일에 대해 typecheck (해당 패키지만) + lint
  * 원칙: 전체 체크는 CI 담당, local 은 빠른 피드백 우선
- 영향: 없을 시 local 실수 감지 지연, CI retry 비용
- 조치 후보:
  * MF-21 (CI) 먼저 확립 후 도입
  * hook 실행 시간이 5초 초과하면 bypass 현상 발생 → 범위 엄격 통제

## MF-23 (신규 — D-4i, Phase 4.5 구성요소): smoke test 구축 (web + mobile 부팅 확증)
- 상태: pending (Phase 4.5 진입 시 착수)
- 우선순위: high (MF-16 resolved 판정의 검증 도구)
- 발견 맥락: D-4i MF-16 종결 판정이 "실체 mismatch 부재" 이나, 이를 CI 에서 매번 자동 보증할 도구가 현재 없음
- 구체:
  * web: Playwright 로 `next dev` 또는 `next build && next start` 기동 → `/` 렌더 확증
  * mobile: `expo export` 성공 + 번들 바이트 확인 (device 테스트는 V1 후반)
  * 원칙: 실기능 아닌 "부팅 자체" 확인
- 영향: MF-16 재판정 트리거 역할. Phase 5 기능 추가 시 regression 조기 감지.
- 조치 후보:
  * MF-21 (CI) 에 smoke test job 1개 추가하는 형태로 통합 vs 별도 workflow 분리
  * Playwright browser 다운로드 크기 (수백 MB) → CI 시간 영향 평가 필요

---

### 진행 상황 (D-4k Chunk 2, 2026-04-27)

상태: 진행 중 → smoke script 정의 단계 완료.

**smoke 명령어**:
pnpm run smoke = turbo run check-types test build

**turbo 매칭 (현재 패키지 구조 기준)**:
- domain: check-types ✅, test (vitest) ✅, build (없음, skip)
- web: check-types ✅, test (없음, skip), build (next build) ✅
- mobile: check-types ✅, test (없음, skip), build (없음, skip)

**out of scope (Phase 4.5 제외, 별도 처리)**:
- mobile expo export 검증 — 시간/안정성 우려, dev build 시점에 별도 (MF-03 인접)
- domain lint script 부재 — V1 후반 별도 (web=eslint, mobile=expo lint 만 보유)

**다음 단계**: 사용자 직접 `pnpm run smoke` 실행 → Tasks 성공 출력 확인 → Gate 2 통과 → push.

---

## MF-24 (신규 — D-4i): WSL 정찰 명령에서 rg (ripgrep) 의존 금지
- 상태: 원칙 확립 (이후 반영은 §3.3 체크리스트 편입 검토)
- 우선순위: medium (재발 시 정찰 Chunk 실패)
- 발견 맥락: D-4i Chunk A 수동 bash 에서 `rg` 미설치 상태 확증 ("Command 'rg' not found, but can be installed with: sudo snap install ripgrep"). 사용자의 WSL Ubuntu 환경 기본에 ripgrep 부재.
- 구체:
  * rg 명령이 없어 Step 4-1, Step 5a, Step 5b 가 빈 출력 생성
  * 리다이렉트는 빈 파일 생성, cat 결과도 빈 줄 → silent failure
  * 사후 검증에서만 드러남 (이미지 첫 줄 에러 메시지)
- 영향: 정찰 신뢰도 저하, silent failure 로 판정 오도 가능
- 조치 후보:
  * 모든 Claude Code 정찰 프롬프트에서 rg 금지, `grep -n` / `grep -E` 사용
  * Claude 자체 생성 프롬프트 원칙에 "rg 사용 금지" 명시 (§3.3 체크리스트 후보)
  * 설치 강요 대신 grep 전제 — POSIX 호환성 우선

## MF-25 (신규 — D-4i 후속, D-4j 진입 안건): 전 코드 검수 (Anthropic Claude Code 품질 저하 대응)
- 상태: pending (D-4j 착수)
- 우선순위: high (Phase 4.5 보다 선행 — 사용자 결정)
- 발견 맥락: 2026-04-23 Anthropic 공식 postmortem 발표 (https://www.anthropic.com/engineering/april-23-postmortem). 영향 기간 2026-03-04 ~ 2026-04-20, 영향 도구 Claude Code / Claude Agent SDK / Claude Cowork. 외부 검증 (Veracode, TrustedSec, BridgeMind) 도 저하 실재 확인. 사용자 결정: 전 코드 검수 (C1, 검수만 — 결함 있을 때만 수정. 리팩토링 X).
- 구체:
  * Phase 1: 검수만 (변경 0). Codex CLI 외부 Evaluator (단일 분야 + file:line 근거) → Planner 재확증 (이슈 20 교훈)
  * 검수 chunk 분할: A=packages/domain, B=apps/web, C=apps/mobile, D=설정 파일
  * 결과 등급 분류: Critical / High / Medium / Low
  * Phase 2: 수정. Critical 즉시, High 사용자 승인 후, Medium/Low backlog
  * 수정 turn 마다 thin slice (1 결함 = 1 commit), vitest 재실행, explicit add list
- 영향: 검수 turn 수 누적 시 세션 컨텍스트 포화 → 중간 handoff 필요 가능성. 자동 검증 도구 (Phase 4.5) 부재 상태에서 수정해야 하는 부담 (vitest 외 통합/런타임 결함은 별도)
- 조치 후보:
  * 검수 진행 후 Phase 4.5 (CI/pre-commit/smoke test, MF-21/22/23) 진입
  * 검수 결과 의외로 결함 적으면 Phase 4.5 와 병합 진행 가능
- 결과: → 완료 (D-4j, HEAD=02ea380). MF-06 H1/H3 잔여는 Phase 5 전 별도 처리 권장

## 이슈 로그 (메타, D-4f)

세션 운영 중 발견한 프로세스/도구 이슈. MF-15 후보 r/s 로 편입 예정.

### 이슈 15: STOP 조건 "누적 상태 vs 당해 Chunk 산출물" 구분 누락

- 발생: D-4f Chunk D. "2파일 외 다른 파일이 git status 에 나타나면 STOP" 이 이전 Chunk C 잔여 `M packages/domain/package.json` 을 trigger
- 실제 상태는 정상 (Chunk C 의 pnpm add 가 만든 기대된 modification)
- 교훈: STOP 조건 작성 시 "이번 Chunk 가 생성한 변경만" 기준으로 서술하거나 "누적 상태 예상값" 을 선행 기재
- 적용: MF-15 의 체크리스트 후보 r 로 편입

### 이슈 16: turbo output grep line-start anchor false negative

- 발생: D-4f Chunk F. `grep -E "^ *Tests +"` 가 turbo prefix `@repo/domain:test: ` 앞쪽에 가려서 매칭 실패
- 원인: turbo 는 병렬 실행 task 구분 위해 각 라인에 `<pkg>:<task>: ` prefix 삽입. `^` anchor 는 prefix 까지 포함해야 매칭
- 교훈: turbo 로그 grep 시 `^` 금지, prefix 포함 또는 무관 패턴 사용 (예: `Test Files +1 passed` 로 전체 매칭)
- 적용: MF-15 의 체크리스트 후보 s 로 편입

## MF-17 (신규 — D-4g): 복수 Chunk 연속 발행 시 선행 조건 명시 누락

- 상태: 편입 완료 (MF-15 후보 t → D-4h 실적용, HEAD 8f164ad)
- 우선순위: medium
- 발견 맥락: D-4g Phase 1 에서 Chunk B (project.ts refine) / Chunk C (test 추가) 2개 프롬프트를 단일 응답에 연속 배치. 사용자가 Chunk C 먼저 투입하여 schema 수정 없이 test 가 먼저 추가됨. Chunk C 실행 후 git status 에 project.ts 가 M 아님을 사용자가 감지하여 순서 복구.
- 구체:
  * Chunk B 가 Chunk C 의 선행 조건임에도 프롬프트 내 명시 없음
  * 단일 응답에 다중 프롬프트 배치 시 시각적 무게감이 뒤쪽 프롬프트에 몰림 (코드 로직 반영은 Prompt 2 였음)
  * 순서 복구 비용은 낮았으나 (Chunk C 산출물 그대로 두고 Chunk B 삽입) 운영 리스크 상존
- 영향: Chunk 순서 뒤바뀜 발생 시 불필요한 rollback 또는 정합성 재확증 필요
- 조치 후보:
  * Generator 프롬프트에 "선행 조건 (Step 0)" 섹션 추가, 이전 Chunk 산출물의 M/A 상태를 git status 로 선행 확증
  * 단일 응답 당 Claude Code 투입용 프롬프트 1개 원칙 (Codex Evaluator 프롬프트 병행은 예외)
  * 복수 Chunk 가 의존 관계면 응답 분리 후 순차 발행

## MF-18 (신규 — D-4g): vitest 기본 reporter 의 passed 출력 grep 가정 오류

- 상태: 편입 완료 (MF-15 후보 u → D-4h 실적용, HEAD 8f164ad)
- 우선순위: low
- 발견 맥락: D-4g Phase 1 Chunk E (turbo test 로그 grep 판정). Step 3 에서 "valid: / invalid: 개별 test 이름 grep" 로 4개 case 확증 시도. 실제 매치 0건으로 STOP 트리거.
- 구체:
  * vitest run 기본 reporter 는 통과 시 파일 단위 요약만 출력 (예: `✓ src/project.test.ts (4 tests) 5ms`)
  * 개별 test 이름 출력은 실패 케이스에 한정
  * Step 3 STOP 은 false positive (실질 통과). `Tests N passed (N)` 및 `Test Files 1 passed (1)` 요약 패턴으로 확증 가능
  * Step 2 에서 이미 "Tests  4 passed (4)" 매치됐으므로 Step 3 를 대체 가능했음
- 영향: 통과한 로직도 STOP 유발하는 false positive → 사용자 추가 판정 라운드 소요
- 조치 후보:
  * Chunk E 류 프롬프트 재사용 시 Step 3 를 "개별 이름 grep" 대신 "Tests N passed (N) 에서 N ≥ 기대치" 패턴으로 교체
  * reporter 를 verbose 로 바꾸는 방식은 비권장 (turbo 로그 크기 증가, grep 부담 증가)

## MF-19 (신규 — D-4g): repo 루트 .codex 우발 생성, .gitignore 패턴 (디렉토리 전용) 불완전

- 상태: 완료 (D-4g, Phase 2 에서 파일 삭제 + .gitignore 파일/디렉토리 2줄 패턴)
- 우선순위: medium
- 발견 맥락: D-4g Phase 2 P2-2a 에서 git check-ignore 확증 중 발견. .gitignore 에 `.codex/` (디렉토리 전용) 만 추가 → 실제 `.codex` 는 0 byte regular file 로 ignore 미적용
- 구체:
  * repo 루트 `.codex` 파일 (0 byte, 0444 권한, 2026-04-24 13:55 생성)
  * git history 에 한 번도 tracked 되지 않음
  * 유래 불명 (Codex CLI 호출 부작용 가설, 확증 없음)
  * `~/.codex/` (홈 디렉토리) 는 Codex CLI 정식 설치 위치 (auth.json, config.toml 등 별개)
- 조치 적용 (D-4g):
  * `.codex` 파일 삭제 (git 영향 없음, untracked)
  * `.gitignore` 에 `.codex` + `.codex/` 2줄 패턴 (파일/디렉토리 양쪽 대응, defense in depth)
  * `git check-ignore --stdin` 으로 양쪽 패턴 매치 확증

## 이슈 로그 (메타, D-4g)

세션 운영 중 발견한 프로세스/도구 이슈. MF-15 후보 t/u 로 편입 예정.

### 이슈 17: 복수 Chunk 연속 발행 시 선행 조건 명시 누락

- 발생: D-4g Phase 1 단일 응답에 Chunk B/C 프롬프트 연속 배치
- Chunk B (schema refine 추가) → Chunk C (test 추가) 의존 관계임에도 Chunk C 프롬프트에 선행 조건 부재
- 사용자가 Chunk C 먼저 투입 → schema 미수정 상태에서 test 추가 → git status 관측으로 복구
- 교훈: 복수 Chunk 는 응답 분리 원칙, Claude Code 투입 프롬프트는 단일 응답 당 1개
- 적용: MF-15 체크리스트 후보 t 로 편입 + MF-17 로 backlog 승격

### 이슈 18: vitest passed 로그 reporter 기본 동작 가정 오류

- 발생: D-4g Phase 1 Chunk E 로그 grep 판정
- vitest run 기본 reporter 는 통과 시 개별 test 이름 미출력, 파일 단위 요약만
- Step 3 STOP 조건 "valid:/invalid: 매치 4개 이상" 은 failed 케이스 전용
- 실제 매치 0건은 통과 신호 (false positive STOP)
- 교훈: 통과 확증은 "Tests N passed (N)" 요약 패턴만 신뢰
- 적용: MF-15 체크리스트 후보 u 로 편입 + MF-18 로 backlog 승격

## 이슈 로그 (메타, D-4h)

세션 운영 중 발견한 프로세스 이슈. D-4i 이후 추가 체크리스트 후보 편입 여부 판단.

### 이슈 19: Planner 가 편집 결과 WC 기대값을 오계산

- 발생: D-4h Chunk B (§3.3 bullet 6개 삽입) 프롬프트 작성 시 "기대 WC = 189 + 7 = 196" 명시
- 실제: bullet 6개만 삽입 (기존 빈 줄 유지, 새 빈 줄 추가 불필요) → 정확히 +6 line, WC = 195
- Claude Code 가 195 관측 후 "기대 196, 실측 195 불일치" 로 사용자 판정 대기 (정직 보고)
- 교훈: Planner 프롬프트 작성 시 "insertion 만" 과 "insertion + surrounding blank line" 차이를 명시 계산
- 적용: 이번 Turn Planner 자체 정정으로 종결. 단일 사례, 체크리스트 편입 불요

## 이슈 로그 (메타, D-4i)

세션 운영 중 발견한 프로세스 이슈. D-4j 이후 추가 체크리스트 후보 편입 여부 판단.

### 이슈 20: Codex 외부 Evaluator 의 부분 착오 (정찰 결과로 기각)
- 발생: D-4i 초반 Codex 검토에서 mobile `@types/react-dom` direct 선언 전제 + `@types/react@^19.2.0` peer mismatch 실체 보고
- 실제: 정찰 실측 결과 mobile `@types/react-dom` direct 선언 없음, transitive peer 경로를 direct 로 혼동한 것으로 추정
- 관측: Codex 도 file:line 근거를 제시하지만 해석 단계에서 실수 가능. "파일에 있음" ≠ "mobile importer 가 소유"
- 교훈: Codex 보고도 Claude Planner 의 첫 정찰로 반드시 재확증. 외부 Evaluator 신뢰도 가정 금지
- 적용: D-4i Step 2 에서 STOP 조항 작동 (Codex 보고값 불일치 시 Planner 복귀). 향후 모든 Codex 검토 결과에 동일 원칙 적용

### 이슈 21: Claude Code bash stdout truncation 시 assistant API retry 루프 (MF-20 본체)
- 발생: Chunk A Step 4-2, `sed -n '121,171p' pnpm-lock.yaml` 실행 후 "+39 lines (ctrl+o to expand)" 표시 → "Retrying in 0s · attempt 1/10" 3분 35초 Cooking
- 실제: bash 정상 종료, assistant API 응답 수신 실패
- 관측: esc interrupt 로 복구, 파일시스템 무손상. 사용자 쉘 조회로 git status clean 확증
- 교훈: Claude Code 경유 명령은 stdout 20 라인 이하 + truncation 회피. 대규모 조회는 파일 리다이렉트 + 범위 제한 cat
- 적용: MF-20 신설, 이후 모든 Claude Code 정찰/편집 Chunk 에 출력 범위 제한 명시

### 이슈 22: WSL 에 rg (ripgrep) 미설치 — silent failure 야기 (MF-24 본체)
- 발생: Chunk A 수동 bash 수집 시 `rg` 명령 not found, Step 4-1/5a/5b 빈 파일 생성
- 실제: 리다이렉트가 에러를 stderr 로 분리하고 stdout 만 cat 표시 → 빈 줄로 보임
- 관측: 사후 이미지 첫 줄 에러 메시지 확인으로 원인 판별. 환경 전제 취약.
- 교훈: 모든 정찰에서 `rg` 금지, `grep -n` 사용. 환경 전제 사전 확증 필요.
- 적용: MF-24 신설, §3.3 체크리스트 편입 후보 (차기 세션)

## 이슈 로그 (메타, D-4j Chunk A)

세션 운영 중 발견한 프로세스 이슈. Phase 4.5 / Chunk B 이후 추가 체크리스트 후보 편입 여부 판단.

### 이슈 23: Codex 외부 Evaluator 의 부분 착오 + 환각 file 인용 (D-4i 이슈 20 패턴 재현)
- 발생: D-4j Chunk A Codex 검수 보고 7건 중 H1/H2/H3 모두 "domain rule" 인용
- 실제: Codex 가 인용한 `docs/domain-model.md` 미존재 (실제 출처 = `docs/_backlog/minor-fixes.md` MF-06)
- 결함 사실관계 자체는 일부 유효 (H1/H3 = MF-06 잔여), 일부 정책상 기각 (H2 = handoff-d4f-to-d4g.md:149)
- 등급 재산정: Codex H 3건 → Planner M 2건 + 기각 1건
- 관측: D-4i 이슈 20 (Codex 부분 착오) 와 동일 패턴. 외부 Evaluator 도 file:line 인용하지만 해석 + 출처 식별에서 환각 가능
- 교훈: Codex 가 인용한 docs 파일은 반드시 `ls`/`grep` 으로 실재 확증 + Planner 첫 정찰로 등급 재산정
- 적용: D-4i 이슈 20 원칙 강화. 향후 Codex 결과의 docs 인용은 환각 가능성 전제로 처리

### 이슈 24: Claude Code WSL bash 경로 해석 (Windows MINGW context 시 /c/Users/ 로 오해)
- 발생: D-4j Chunk A commit 1 검증 시 `cd ~/work/acspc` 가 `/c/Users/HDEC/work/acspc: No such file or directory` 출력
- 실제: Claude Code 가 결국 WSL 경로에서 재실행하여 정상 STEP 출력 회복
- 관측: Windows MINGW 와 WSL Ubuntu 간 컨텍스트 혼동 가능. 첫 명령 실패 시 사일런트 회복은 fragile
- 교훈: Claude Code 명령 발행 시 `wsl -d Ubuntu -e bash -c "..."` 감싸기 또는 절대 경로 사용 권고
- 적용: 단일 사례, 체크리스트 편입 보류. 재발 시 §3.3 추가 검토.

## 이슈 로그 (메타, D-4j Chunk B/C/D)

세션 운영 중 발견한 프로세스 이슈. Phase 4.5 진입 전 운영 패턴 정합성 점검.

### 이슈 25: Generator 프롬프트 메타 섹션 혼동 (Chunk C 후반)
- 발생: Generator 프롬프트 내 Planner 메타 섹션 (배경 / 판단 근거) 을 Generator 가 수행 명령으로 오인
- 실제: Planner 의도와 무관한 부수 작업 시도 (mobile React import 외 추가 변경 시도)
- 관측: Generator 의 프롬프트 파싱은 수행 명령 / 메타 정보 구분 능력이 약함
- 교훈: Generator 프롬프트 = 수행 명령만. Planner 메타·판단 근거는 사용자 메시지에만 작성
- 적용: D-4j Chunk D 부터 Generator 프롬프트 본문은 명령만 — mitigation 적용 완료

### 이슈 26: 묵시적 Gate 2 — 사용자 직접 push 패턴 (Chunk B/C/D)
- 발생: 사용자가 Generator 결과 검토 후 직접 git commit + push 실행 (명시적 Gate 2 응답 우회)
- 실제: docs-only / 작은 변경에서 반복 패턴 — 사용자 의도 = Gate 2 묵시적 승인
- 관측: 명시적 Gate 2 거치는 것이 항상 효율적이지 않음 (작은 변경 / docs 위주에서 운영 마찰)
- 교훈: 작은 변경 + 사용자 직접 push = Gate 2 운영 스타일로 인정. plan-review-gate.md 명문화는 별도 turn
- 적용: D-4k 이후 운영 원칙에 반영. MF-26 후보 (minor-fixes 재정렬과 함께)
