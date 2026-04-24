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

## MF-15 (신규 — D-4f): §3.3 Evaluator 체크리스트 m~q 보강

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

## MF-16 (신규 — D-4f): apps/mobile @types/react peer dep mismatch

- 상태: 미처리
- 우선순위: medium (다음 mobile 작업 전 해결)
- 발견 맥락: Chunk C (D-4f) `pnpm add -D vitest` 실행 시 경고 관측
- 구체:
  * `@types/react-dom@19.2.3` 의 peer `@types/react@^19.2.0` 필요
  * 실제 설치 버전 `@types/react@19.1.17` → minor 한 단계 낮음
  * vitest 설치와 무관, 기존 apps/mobile 의존성 상태
- 영향: 이번 턴에선 런타임 문제 미관찰. strict typecheck 또는 mobile build 단계에서 표면화 가능
- 조치 후보: `@types/react` 를 ^19.2.0 으로 bump 또는 `@types/react-dom` 을 19.1.x 로 맞춤 (양측 호환 확인 필요)

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
