# Handoff — D-4d → D-4e (2026-04-23, Session 5 end)

새 대화창 전환용. D-4e 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4c-to-d4d.md 등) 는 이력으로 남음.

## 1. 현재 상태 (D-4d-1 완료, 정리 턴 정찰까지 끝남)

- HEAD: 27e8869 (feat(mobile): verify @repo/domain import with safeParse page (d-4d-1))
- 총 25개 커밋, origin/main 동기화 완료 (handoff 커밋 후 26개 될 예정)
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4d 에서 변경된 것

**D-4d-1 (27e8869)**: apps/mobile 에서 @repo/domain import 검증
- apps/mobile/package.json (@repo/domain: workspace:* 추가)
- apps/mobile/app/verify-domain.tsx (신규 68줄, expo-router route, safeParse valid+invalid 렌더)
- pnpm-lock.yaml 갱신
- docs/_backlog/minor-fixes.md (MF-09/10 append)
- 4 files changed, +87 insertions

### 1.2 D-4d 핵심 실증

**packages/domain 의 `moduleResolution: "bundler"` 가 Next turbopack + Expo Metro 양쪽 호환 확증.**
- Next (apps/web /domain-check): D-4c-2 에서 확증
- Expo Web (apps/mobile /verify-domain): D-4d-1 에서 확증
- metro.config 수정 없이 동작 → Stage B 불필요 판정
- Expo SDK 54 Metro 가 source-first TS (.ts 확장자 생략, workspace symlink) 해석 성공
- tsup 빌드 불필요. V1 에서 source-first 유지 가능

### 1.3 최근 커밋 (top 6)
27e8869 feat(mobile): verify @repo/domain import with safeParse page (d-4d-1)
3f5f4db docs(backlog): handoff from d-4c to d-4d (session transition 4)
685b936 docs(shared): add Evaluator 점검 체크리스트 and 면제 근거 제시 의무 (§3.3)
4b0a978 feat(web): verify @repo/domain import with safeParse page (d-4c-2)
7929c75 fix(domain): switch to bundler resolution for web/metro compat (d-4c-1 fixup)
21e2764 chore(domain): scaffold @repo/domain with zod v4 schemas (d-4c-1)

## 2. 환경 전제 (변동 없음)

handoff-d4c-to-d4d §2 와 동일. 요약:

- CA 파일명: `corp-root.pem` (corp-ca.pem 은 symlink fallback)
- preamble 필수: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&`
- Windows 경로 시작 시 `wsl -d Ubuntu -e bash -c "..."` 감싸기
- pnpm 은 기존 store reuse 시 빠름 (D-4d-1 실측: 2.5초 완료)

### 2.1 환경 검증 템플릿 (첫 명령 필수)
export NODE_EXTRA_CA_CERTS="HOME/.certs/corp-root.pem" && export PATH="
HOME/.nvm/versions/node/v22.22.2/bin:$PATH" && cd ~/work/acspc && pwd && git remote -v | head -1 && node --version && ls ~/.certs/corp-root.pem && git log --oneline -1 && git status --short

기대:
- cwd `/home/founder_ys/work/acspc`
- origin ceoYS/acspc
- v22.22.2
- cert 존재
- HEAD: 이 handoff 커밋 hash 또는 그 이후 (D-4d-1 에서 얻은 교훈 — handoff §1 body 의 hash 는 handoff 커밋이 얹히므로 본질적 stale. "origin/main tip 과 동기화" 로 해석)
- git status clean

## 3. D-4d 에서 발견된 실전 이슈 + Evaluator 교훈 (신규)

### 이슈 8: Claude Code 자체 판정 "Install 완료" 신뢰 불가

- D-4d-1 Step 5 에서 pnpm install 이 `(timeout 5m)` 로 강제 종료됐는데 Claude Code 가 "Install 완료" 로 오판 후 Step 6~ 진행
- 사용자가 터미널에서 pnpm install 직접 재실행 시 44 packages added → 이전 실제로 미완료였음 확증
- 교훈: pnpm install 완료 판정은 "Done in Xs" 문자열 grep 으로 기계화. `(timeout 5m)` 출력 시 "완료 판정 금지" 를 Generator 프롬프트에 명시 필요
- → §3.3 체크 m (신규 후보): 장시간 실행 명령의 완료 판정은 자체 판단 금지, 성공 문자열 grep 로 기계화

### 이슈 9: 120초+ Noodling = meta-loop 확정 신호

- D-4d-1 중 Claude Code 가 8분 52초 Noodling 상태 지속 → /clear 도 안 통하는 meta-loop
- 세션 강제 종료 + 새 세션 재개로 복구
- 교훈: 각 Step 프롬프트에 "120초 내 미완료 시 STOP + 현재 상태 보고" 조항 내재화
- "accept edits on" 모드 + 긴 Noodling 조합은 자동 실행 범위 확장 위험. Step 단위로 명시적 완료 보고 요구

### 이슈 10: 성공/실패 판정 문자열 enumeration 필수

- D-4d-1 Step 7 에서 "Waiting on http://localhost:8081" 성공 신호를 문자 그대로 grep 으로 판정 → 성공
- 반면 Step 5 의 pnpm install 판정은 기계화 안 됨 → 오판
- 교훈: 모든 Step 의 성공/실패 판정은 문자열 enumeration 으로 기계화. Claude Code 의 자체 판단 여지 제거

### 이슈 11: Claude Code sleep 직접 호출 차단

- D-4d-1 Step 7.2 에서 `sleep 90 ; tail -n 150 ...` 가 Claude Code 에 의해 차단됨 ("Blocked: standalone sleep 90")
- Monitor 툴로 대체해서 진행 성공
- 교훈: 장시간 대기는 Monitor 툴 또는 `run_in_background: true` 로. 단순 sleep 체인 금지

이 4건 전부 §3.3 체크리스트 m~p 후보로 본 턴 이후 공식화 검토.

## 4. D-4e 정리 턴 (MF-07/08/09/10) — 정찰 완료 상태

### 4.1 목표
MF-07, MF-08, MF-09, MF-10 네 건 일괄 정리. Phase 5 (Supabase) 진입 전 기술 부채 청소. 신규 기능 진전 0.

### 4.2 정찰 결과 (D-4d+ Stage 0 완료, 원문 보존)

**A. apps/web/tsconfig.json**
- extends: 없음 (standalone — @repo/typescript-config/nextjs.json 을 extends 하지 않음. create-next-app 기본)
- compilerOptions: strict: true, noUncheckedIndexedAccess: 미설정 (MF-07 대상 확증), target: "ES2017", moduleResolution: "bundler", noEmit: true, jsx: "preserve", isolatedModules: true, skipLibCheck: true
- 전문 27줄, allowJs: true, module: esnext, incremental: true, plugins: [{"name":"next"}], paths: {"@/*":["./*"]}
- include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"], exclude: ["node_modules"]

**B. apps/web/package.json scripts**
- dev, build, start, lint (4개). check-types 미정의 (MF-08 확증)
- 충돌 가능성 없음

**C. apps/mobile/package.json scripts**
- start, reset-project, android, ios, web, lint (6개). check-types 미정의 (MF-10 확증)
- 충돌 가능성 없음

**D. apps/mobile/package-lock.json**
- 존재 (Apr 23 08:53 수정)
- 파일 크기: 510,627 bytes (~500KB, 13,821 lines)
- 최상위: { "name": "mobile", "version": "1.0.0", "lockfileVersion": 3, ... } — npm v7+ 포맷
- MF-09 확증

**E. docs/_backlog/minor-fixes.md MF-07/08 원문**

MF-07:
MF-07: apps/web tsconfig 에 noUncheckedIndexedAccess 미설정 (신규 — D-4c-2)

.claude/rules/tech-stack.md §1.8 에서 권장하는 옵션
create-next-app 기본 tsconfig 그대로라 누락
기존 코드에 영향 있을 수 있으므로 별도 턴에서 일괄 점검 후 적용
apps/mobile 도 동일 누락 가능 (Expo default) — 같이 확인


MF-08:
MF-08: apps/web 에 check-types 스크립트 미정의 (신규 — D-4c-2)

turbo.json 은 check-types pipeline 정의
apps/web/package.json scripts 에 check-types 없음 (현재는 next build 가 typecheck 대리)
apps/mobile 도 동일
turbo run check-types 가 전 패키지에 잘 분산되도록 스크립트 표준화 필요
별도 턴에서 일괄


**F. .claude/rules/tech-stack.md §1.8 TS 관련**
1.8 린트 · 포맷

ESLint (Next · Expo 공식 config)
Prettier
TypeScript strict + noUncheckedIndexedAccess

noUncheckedIndexedAccess 는 전 패키지 공통 요구.

중요 발견: `packages/typescript-config/base.json` L13 에 `noUncheckedIndexedAccess: true` 이미 설정됨. `nextjs.json` 은 `base.json` 을 extends 하므로 상속. → apps/web 이 nextjs.json 을 extends 하도록 바꾸면 자동 적용 가능. 단 이건 경로 B (정석 재구성) 이며 MF-11 로 분리.

**G. packages/domain/package.json scripts**
- `"check-types": "tsc --noEmit"` — MF-08/10 의 참조 원본. 이 문자열 그대로 apps/web/mobile 에 복사 적용

**H. turbo.json check-types task**
"check-types": {
"dependsOn": ["^check-types"]
}
- dependsOn: ^check-types (상류 의존 먼저 실행)
- outputs/inputs/cache 미정의 → 기본값

**I. apps/web TypeScript 소스 규모 (MF-07 영향 상한 추정)**
- 파일 수: 5개 (app/page.tsx 119줄, app/layout.tsx 21줄, app/domain-check/page.tsx 37줄, next.config.ts 7줄, next-env.d.ts 6줄)
- 총 라인 수: 190줄
- 배열 [0] 패턴: 0건
- Object.keys|entries|values: 0건
- 주석: 상한 참고치. 실제 에러 수는 본 턴 tsc --noEmit dry-run 으로 최종 판정

apps/mobile: 22파일 / 797줄 (create-expo-app 템플릿 잔재 다수)

**J. 정찰자 의견 (핵심 7조항)**

1. MF-07 dry-run 예상 에러 규모: low (apps/web 190줄 thin slice, 배열/Record 접근 0건. 예상 0~3건. apps/mobile 은 medium-low — 템플릿 boilerplate 위주)
2. MF-07 해결 방식 2가지:
   - 경로 A (최소 변경, 안전): apps/web + apps/mobile/tsconfig 에 `"noUncheckedIndexedAccess": true` 인라인 추가 → 본 턴 채택
   - 경로 B (정석 재구성): apps/web 을 nextjs.json extends 로 재구성 → MF-11 로 분리
3. MF-09 삭제 후 재검증 범위:
   - `pnpm install --frozen-lockfile` (pnpm-lock.yaml 무변경 확증)
   - apps/mobile/node_modules/@repo/domain symlink 존재 확인
   - expo 기동은 timeout 리스크로 optional (pnpm install 통과만 필수)
4. MF-08/10 동일 표현 문제 없음: apps/web 은 moduleResolution: bundler, apps/mobile 은 expo/tsconfig.base extends — 각각 독립 tsconfig 이므로 `"tsc --noEmit"` 공통 표현 충돌 없음
5. 진행 순서 추천 (Planner 원안 유지): MF-09 → MF-10 → MF-08 → MF-07
   - MF-09 먼저로 lockfile 정리 후 이후 깨끗한 상태
   - MF-07 은 dry-run + 분기 있어서 마지막
6. §3.3 체크 j 경량 적용: expo 기동 생략, pnpm install 성공 grep 으로 대체
7. §3.3 체크 i: apps/web 은 extends 없음 → override 우려 없음. apps/mobile 은 expo/tsconfig.base extends → 해당 base 에 옵션 override 없는지 본 턴 재확인 필요

### 4.3 Planner 갱신 판정 (정찰 흡수 후)

**MF-07 본 턴 포함 확정 (경로 A, 임계값 N=5)**
- apps/web + apps/mobile 양쪽 적용 (MF-07 backlog 원문 근거 + tech-stack.md §1.8 공통 요구)
- dry-run 에러 합산 5건 이하 → 같은 턴 수정, 6건 이상 → MF-07 연기 (MF-08/09/10 은 commit)

**진행 순서 원안 유지**
- MF-09 → MF-10 → MF-08 → MF-07 (dry-run 분기)

**MF-11 신설**
- "apps/web tsconfig 을 @repo/typescript-config/nextjs.json extends 로 재구성 (정석)"
- V1 구현 중 처리. 본 턴 docs/_backlog 에 기록

**MF-09 재검증 경량화**
- pnpm install 성공 + symlink 확인 + pnpm-lock.yaml 무변경
- expo start --web 은 본 턴 범위 외 (timeout 리스크)

### 4.4 본 턴 Generator 설계 방향

**수정 예정 파일 (수치 사전 명기) — 5~7개**

1. apps/web/tsconfig.json — `"noUncheckedIndexedAccess": true` 1줄 추가
2. apps/mobile/tsconfig.json — 동일 1줄 추가
3. apps/web/package.json — `"check-types": "tsc --noEmit"` 추가
4. apps/mobile/package.json — 동일 추가
5. apps/mobile/package-lock.json — 삭제
6. docs/_backlog/minor-fixes.md — MF-07/08/09/10 처리 완료 표시 + MF-11 신설
7. (선택) pnpm-lock.yaml — MF-09 가 lockfile 에 영향 주는지 여부 불확실. 목표는 "무변경" 이지만 실측 필요

**Step 구성**

1. 환경 검증 (HEAD: 이 handoff commit 또는 이후, clean)
2. MF-09: package-lock.json 삭제 → `pnpm install --frozen-lockfile` → symlink 확인 → pnpm-lock.yaml 변동 확인 (git diff)
3. MF-10: apps/mobile/package.json check-types 추가
4. MF-08: apps/web/package.json check-types 추가
5. MF-07 dry-run (핵심 분기점):
   - apps/web + apps/mobile 양쪽 tsconfig 옵션 임시 추가
   - `pnpm turbo check-types` 실행 → 에러 개수 문자열 grep 으로 카운트 (`error TS` 패턴 계수)
   - 5건 이하 → Step 6 (수정)
   - 6건 이상 → tsconfig 원복 + MF-07 만 연기 + MF-08/09/10 유지로 commit
6. MF-07 에러 수정 (dry-run 결과 기반)
7. 최종 전체 `pnpm turbo check-types` 통과 확증
8. docs/_backlog/minor-fixes.md 업데이트
9. git diff 검증 + explicit commit (1개 또는 분기에 따라 2개)
10. Gate 2 대기

**Evaluator 중점 4개 (본 턴 Generator 작성 시 반영 필수)**

- §3.3 체크 j: MF-09 후 번들러 재검증. expo 기동 생략하되 근거 명시 (정찰 J6 근거 인용)
- §3.3 체크 i: MF-07 extends 체인. apps/web 은 extends 없음 (해소). apps/mobile 은 expo/tsconfig.base 내 override 없는지 본 턴 재확인
- dry-run 임계값 N=5 기계 판정: `grep -c "error TS"` 로 정확 카운트. Claude Code 자체 판단 금지
- 이슈 8~11 반영: pnpm install 완료 판정은 "Done in Xs" grep, 120초+ 시 STOP, 성공/실패 문자열 enumeration, sleep 대신 Monitor 툴

## 5. Backlog 현황 (갱신)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04: mobile @repo/domain 검증 — D-4d-1 에서 완료
- MF-05: vitest 테스트 프레임워크 도입
- MF-06: domain schema 고급 제약
- MF-07: apps/web + mobile tsconfig noUncheckedIndexedAccess — D-4e 대상 (경로 A)
- MF-08: apps/web check-types 스크립트 — D-4e 대상
- MF-09: apps/mobile package-lock.json 잔재 — D-4e 대상
- MF-10: apps/mobile check-types 스크립트 — D-4e 대상
- MF-11 (신규): apps/web tsconfig 을 @repo/typescript-config/nextjs.json extends 로 재구성 — V1 구현 중
- MF-12 (후보): pnpm 10 ignored build scripts (sharp, unrs-resolver) 승인 정책 결정 — 필요 시 신설

## 6. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩, 회사망 대응 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 (D-4d-1) |
| 3 부채 정리 1차 | MF-07/08/09/10 | 정찰 완료, 본 턴 직전 |
| 4 테스트/제약 | vitest (MF-05), domain 고급 제약 (MF-06) | 대기 |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 30% 지점. Phase 3~5 가 V1 의 변곡점.

## 7. 새 대화창 시작 가이드 (D-4e)

### 복사 붙여넣을 첫 프롬프트
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 포화로 전환. D-4d-1 완료 + D-4e (MF-07/08/09/10 정리 턴) 정찰 완료 상태.
HEAD: 이 handoff commit 또는 이후, 총 26개 커밋, origin/main 동기화 완료.
GitHub public: https://github.com/ceoYS/acspc
아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4d-to-d4e.md
원칙:

Planner / Generator / Evaluator 3역할 분리
Evaluator 발동 조건 §3.3 (정리 턴은 필수, 면제 고려 안 함)
bash_tool preamble 필수 (CA 파일명 corp-root.pem)
D-4e 범위 = MF-09 → MF-10 → MF-08 → MF-07 순서 (handoff §4.4 참조)
범위 확장 요청은 scope-cut
Gate 2 승인 전 push 금지
explicit add list, no git add .
이번 세션 교훈 (이슈 8~11) 반영 필수:

pnpm install 완료 판정은 "Done in Xs" 문자열 grep 으로 기계화
각 Step 120초 내 미완료 시 STOP
성공/실패 판정 문자열 enumeration
sleep 대신 Monitor 툴 또는 run_in_background



handoff 요약 보고 후 "D-4e Planner 본 턴 Generator 설계 시작" 대기.

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 27e8869 + handoff 커밋을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] 정찰 결과 §4.2 흡수됐는지 확인 (새 대화창 첫 응답에 MF-07 경로 A/B 구분 등 언급 여부)
- [ ] Evaluator 필수 인식 확인
- [ ] 이슈 8~11 반영 인식 확인
