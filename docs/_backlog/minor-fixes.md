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

## MF-08: apps/web 에 check-types 스크립트 미정의 (신규 — D-4c-2)

- turbo.json 은 check-types pipeline 정의
- apps/web/package.json scripts 에 check-types 없음 (현재는 next build 가 typecheck 대리)
- apps/mobile 도 동일
- turbo run check-types 가 전 패키지에 잘 분산되도록 스크립트 표준화 필요
- 별도 턴에서 일괄

## MF-09: apps/mobile 에 package-lock.json 이 pnpm-lock.yaml 과 공존 (신규 — D-4d-1)

- create-expo-app 자동 생성 잔재로 `apps/mobile/package-lock.json` 존재
- 현재는 pnpm 이 루트 `pnpm-lock.yaml` 우선 사용해 무해
- 향후 혼동 방지 위해 `apps/mobile/package-lock.json` 삭제 + pnpm install 재검증 필요
- 별도 턴 대상

## MF-10: apps/mobile 에 check-types 스크립트 미정의 (신규 — D-4d-1)

- apps/mobile/package.json scripts 에 check-types 없음
- turbo check-types --filter=mobile 시 mobile 태스크 자체는 스킵 (의존성인 @repo/domain 만 실행)
- MF-08 (apps/web) 과 대칭 이슈
- 양측 동시 보정 권장 (`"check-types": "tsc --noEmit"` 추가)
- 별도 턴에서 일괄
