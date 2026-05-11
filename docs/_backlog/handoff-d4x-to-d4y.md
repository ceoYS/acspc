# Handoff D-4x → D-4y

작성 세션: D-4x (회사 PC)
작성일: 2026-05-11
대상 세션: D-4y (V1 마감 + V2 백로그 정리)

---

## 1. 현재 상태

- HEAD: `4841a61`
- 직전 3개 commit:
  - `4841a61` feat(web): 5.5.4 server action 신설 + PhotoUploadForm props 전환 (V1 종결)
  - `8415a78` docs(01): §6.1.1 정렬 순서 (감리 제출 시 시간순 강제, N-2 반영)
  - `eda5ca0` docs(interview): 03 김은수 분류축 재확인 + PP 표본 확장 메모
- working tree: clean
- 본 chat 시작 시 HEAD: `d3aee0c` → 종료 시 `4841a61` = **5개 commit 진행** (5.5.2 production DB apply 포함하면 사실상 6단계)
- V1 진행: ~96% → **~98%+**

## 2. D-4x 변동 사항

### 2.1 5.5.2 production DB apply (사용자 직접 수행, commit 없음)

- migration 0004 `relax_photos_fk` apply: photos FK 3개 (location_id / trade_id / vendor_id) nullable
- migration 0005 `grant_remaining_authenticated` apply: KI-22 GRANT 보충 (locations / trades / vendors / photos)
- 검증:
  - photos NOT NULL 상태 4 rows (project_id NO, 나머지 YES) ✅
  - GRANT 28 rows (4 tables × 7 default privileges, KI-22 필수 4종 포함) ✅
  - RLS 5종 (photos / locations / trades / vendors / projects, ALL cmd, authenticated role) ✅
  - RLS 활성 5 tables 전부 true ✅
  - storage.buckets photos (private = false, file_size_limit NULL, allowed_mime_types NULL) ✅
  - storage.objects "photos_own_files" 정책 (ALL, authenticated, path-shape 4중 방어) ✅

### 2.2 commit `eda5ca0` — 인터뷰 03 + PP 표본 확장

- 신설: `docs/interviews/03_김은수_분류축_재확인.md` (193 lines, 카카오톡 원문 + 핵심 발견 4개)
- 수정: `docs/02_pain_points_analysis.md` (+60, "표본 확장 메모" 섹션 append)
- 발견 4개 분류:
  - N-1. 감리 점검 트리거 (엑셀 강제) → V2
  - N-2. 엑셀 출력 시 사진 시간순 정렬 → V1 보강 (commit `8415a78` 에서 처리)
  - N-3. 평상시 분류 축 = 위치 > 공종 → V2
  - N-4. 출력 채널 다양화 (HTML 포스터 / 앱 내 뷰) → V2

### 2.3 commit `8415a78` — docs/01 §6.1.1 신설

- 수정: `docs/01_v1_product_definition.md` (+7, sub-section "6.1.1 정렬 순서" 신설)
- 내용: 엑셀 출력 시 사진 created_at 오름차순 정렬 명문화
- 근거: N-2 (김은수 인터뷰 03)

### 2.4 commit `4841a61` — 5.5.4 V1 종결 카드

- 신설: `apps/web/app/photos/upload/_actions/uploadPhoto.ts` (74 lines, server action)
- 수정: `apps/web/app/photos/upload/PhotoUploadForm.tsx` (+32 -33, props 전환 + client.ts import 제거)
- 수정: `apps/web/app/photos/upload/page.tsx` (+2 -1, action import + 주입)
- 총 3 files, +108 / -34
- Gate 2 6/6 PASS:
  - 4-1 미로그인 redirect ✅ (logout 후 검증)
  - 4-2 정상 업로드 ✅ (storage + INSERT + signed URL 발급)
  - 4-3 storage 파일 존재 ✅ (618.94 KB PNG)
  - 4-4 photos row ✅ (10개 컬럼 전부 정확 일치)
  - 4-5 signed URL 이미지 ✅
  - 4-6 비-UUID reject ✅ (zod validation 차단)

### 2.5 부수 발견 (D-4x 신규)

- **KI-22 검증 시 28 rows = 정상**: 4 tables × 7 default privileges (SELECT/INSERT/UPDATE/DELETE/REFERENCES/TRIGGER/TRUNCATE). 기대값 16 ≠ 정상.
- **storage.buckets PK 컬럼명은 `id`** (bucket_id 아님). 검증 쿼리 작성 시 주의.
- **design-notes §3 가정 vs 실제 schema 차이**: design-notes 의 photos INSERT 컬럼이 `uploader_id` 라 표기됐으나 실제는 `user_id`. 추가 NOT NULL 컬럼 `content_text` / `taken_at` 누락 가정. → 정찰 단계에서 사전 발견 (Evaluator selbst 점검 효과 확인).
- **zod v4 패턴 일관성**: packages/domain 9개 파일 전부 `z.uuid()` top-level. server action 도 동일 패턴 적용.
- **client.ts 사용처 0 도달**: 5.5.4 후 PhotoUploadForm 의 `lib/supabase/client` import 제거 → RW-6 자동 해소. V2 에서 client.ts 자체 제거 결정 가능.

## 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: `~/work/acspc`
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
- bash 체인 방어: `;` 또는 `|| true` (`&&` exit 전파 회피)
- registry 의존 명령 금지: `pnpm list/why/outdated` corp 망 retry 루프 회피

### 3.2 도구

- pnpm 10.33.0 (hoisted)
- Turborepo / Next 15 + Turbopack / Expo SDK 54
- Supabase (production DB + Storage)
- zod v4 (packages/domain)

### 3.3 제약 (운영원칙)

- 단일 진실 원본: CLAUDE.md → .claude/rules/* → docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 역할 분리
- Gate 2 (실 디바이스/브라우저 동작 검증 후 push) 기본 필수
- docs-only 면제 가능 (Planner 근거 + 사용자 명시 승인)
- git add . 금지, explicit add list 만
- 사용자 승인 언어 규칙 명시 ("Gate 2 승인" 등)

## 4. D-4y 다음 턴 스펙

### 4.1 목표

V1 마감 보고 + V2 백로그 정리.

### 4.2 범위 (in)

다음 chunk 들 후보 (D-4y Planner 가 우선순위 결정):

#### A. V1 마감 보고 (필수)

- 신설 또는 갱신: `docs/_backlog/v1-closure-report.md` (가칭)
- 내용:
  - V1 6개 기능 (docs/01 §2) 의 phase 매핑 + 완료 현황
  - 5.5.x 5단계 결과 요약
  - V1 의 known gaps (mobile, content_text 자동완성, 엑셀 생성 chunk 미수행 등)
  - Design Partner 온보딩 준비도 평가

#### B. V2 백로그 정리

- 신설 또는 갱신: `docs/_backlog/v2-priorities.md` (가칭)
- 내용:
  - V2 후보 통합 정렬:
    - 김민성 인터뷰 01/02 발견사항
    - 김은수 인터뷰 03 발견사항 (N-1, N-3, N-4)
    - 운영 메모리에 누적된 V2 후보 (3-party role, 작업 템플릿, 알람 등)
    - design-notes §6 RW-7/8 (signed URL 60s, middleware stale)
  - 우선순위 차원: 가치 × 난이도 × 사용자 표본 검증 강도
  - V2 진입 시 메인 카드 후보 결정 자료

#### C. 노란봉투법 마케팅 각도 재검토 (선택)

- 운영 메모리: "노란봉투법 context: 구조적 instruction routing 이 V2 보조 마케팅 각도. 핵심 가치 제안 아님."
- 김은수 인터뷰 03 의 "현장 다양성 수용" 각도와 함께 V1 출시 마케팅 메시지 재검토 자료
- 별도 chunk 또는 V2 백로그 sub-section

#### D. KI 누적 정리 (선택)

- known-issues.md 갱신:
  - KI-22 검증 28 rows (4×7 default privileges)
  - storage.buckets PK = id (bucket_id 아님)
  - 그 외 D-4x 진행 중 누적된 1~2건

### 4.3 범위 외 (V2 또는 V1.1)

- V1 mobile (Expo) 기능 구현 (V1 mobile 진입은 별 트랙)
- V1 의 content_text 자동완성 / 최근 10개 UX
- 엑셀 생성 chunk (Phase 5.6+, V1 의 본 deliverable 이지만 별 chunk)
- middleware session refresh
- signed URL 재발급 액션
- client.ts 제거 결정

### 4.4 잠재 위험

- **RW-D4y-1**: V1 마감 보고와 V2 백로그 정리를 한 chunk 에 묶으면 컨텍스트 비대. 두 chunk 분리 권장.
- **RW-D4y-2**: 인터뷰 03 의 N-3 (분류 축 다양화) 가 V1 docs/01 의 출력 1축 (업체별) 가정과 충돌 가능. V1 마감 보고에서 "V1 = 업체별 단축, 분류 축 다양화는 V2" 로 명시화 권장.
- **RW-D4y-3**: V1 마감 시 Design Partner 온보딩 시점 결정 필요. 1차 사용자 (김민성) 와 2차 사용자 (김은수) 모두 같은 회사 사용자 → 다른 회사 표본 추가 인터뷰 우선순위 결정 필요.

## 5. 새 대화창 시작 가이드 (복사 붙여넣기용 프롬프트 초안)
이 프로젝트는 acspc 제품의 전략 검토 및 Claude Code용 프롬프트 설계 전용 대화창입니다.
D-4x 종결 (5.5.4 V1 종결 카드 commit + push).
HEAD = 4841a61.
V1 ~98%+ 도달.
handoff: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4x-to-d4y.md
즉시 액션:

KI-28 preamble (회사 PC 또는 집 PC 환경에 따라 cert 라인 포함/제거)
KI-16 git pull (1건 또는 보유) + lockfile 변동 시만 pnpm install
D-4y 작업 우선순위 결정:
A. V1 마감 보고 (docs/_backlog/v1-closure-report.md)
B. V2 백로그 정리 (docs/_backlog/v2-priorities.md)
C. 노란봉투법 / 다양성 마케팅 각도 (선택)
D. KI 누적 정리 (선택)
handoff 요약 보고 후 "D-4y Planner 본 턴 시작" 대기.


## 6. 이력 보존 메모

- 본 handoff 는 D-4x → D-4y 전환용. 이전 handoff (d3aee0c 의 handoff-d4w-to-d4x.md) 도 보존.
- V1 종결 시 일괄 정리 chunk 계획 유지.
