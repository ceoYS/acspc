# Handoff D-5a → D-5b

작성 세션: D-5a (회사 PC)
작성일: 2026-05-12
대상 세션: D-5b (E chunk 후속 = 실데이터 검증 / 양식 fine-tuning /
필터·UX 보강 중 권장)

---

## 1. 현재 상태

- HEAD: `6e87553` (본 handoff push 전 시점, push 후 = handoff commit
  hash 로 갱신)
- 직전 3개 commit (handoff push 전 기준):
  - `6e87553` feat(excel): V1 §5 1차 PASS — API Route + UI + 240223
    양식 재현 (created_at asc, 단일 vendor)
  - `7dbfb99` feat(excel): exceljs Node smoke test + tech-stack
    §1.5/§1.6 갱신 (Edge Function 우회, V1.5+ 재검토)
  - `540e0e3` feat(photos): 업로드 폼에 위치/공종/업체/일자 입력 +
    upsert 흐름 (V1-5 입력 데이터 준비)
- working tree: handoff push 후 clean (supabase/.temp/ 제외)
- 본 chat 시작 HEAD: `cb64274` → handoff push 후 = 4 commit 진행 (3
  feat + handoff)
- **V1 진행도 정정**: ~98%+ → **V1 §5 deliverable 1차 PASS 반영**.
  V1 정의 6개 항목 중 §5 (업체별 사진대지 자동 생성) 1차 PASS.
  잔여 = 실데이터 검증 + 양식 fine-tuning (D-5b 권장).

## 2. D-5a 변동 사항

### 2.1 commit `540e0e3` — photos 업로드 폼 입력 보강 (D-5a 1st)

- 수정: `apps/web/app/photos/upload/PhotoUploadForm.tsx` (+95 / -29)
- 수정: `apps/web/app/photos/upload/_actions/uploadPhoto.ts` (+85 / -9)
- 변경 의도: V1 §5 엑셀 입력 데이터 준비 — 사진 업로드 시 위치 /
  공종 / 업체 / 일자 4개 태그 입력 + upsert 흐름 추가
- 양식: 4개 텍스트 입력 (location_name / trade_name / vendor_name) +
  일자 (taken_at) + content_text. 서버 액션에서 마스터 테이블
  (locations / trades / vendors) upsert 후 photos insert.
- 사유: V1 §5 엑셀 생성 시 photos 가 4개 FK 를 모두 보유해야 함.
  D-5a 진입 직후 입력 path 부재 → 즉시 보강.

### 2.2 commit `7dbfb99` — exceljs smoke test + tech-stack 갱신 (D-5a 2nd)

- 수정: `.claude/rules/tech-stack.md` (§1.5 Edge Functions 담당 영역
  / §1.6 엑셀 생성 실행 위치) — V1 = Next.js 서버 측, V1.5+ 모바일
  진입 시 Edge Function 재검토
- 신설: `apps/web/app/api/excel/smoke/route.ts` (+20) — exceljs Node
  런타임 동작 확인 smoke endpoint
- 수정: `apps/web/package.json` — `exceljs` 4.4.0 추가 (exact pin)
- 수정: `pnpm-lock.yaml` (+485) — exceljs + transitive deps
- 사유: §6 (잠재 위험 RW-D5a-1) 해소. exceljs 단일 선정 + 서버 측
  실행 결정.

### 2.3 commit `6e87553` — V1 §5 1차 PASS (D-5a 3rd, 본 chat 핵심)

- 신설: `apps/web/app/api/excel/route.ts` (247 lines) — POST API
  Route, zod 검증, photos 조회 (user_id + project_id + vendor_id,
  created_at asc), Storage 다운로드, ExcelJS workbook 생성, 파일명
  sanitize + YYMMDD/-YYMMDD 패턴, Content-Disposition 응답
- 신설: `apps/web/app/excel/page.tsx` (19 lines) — 서버 컴포넌트, auth
  gate, force-dynamic
- 신설: `apps/web/app/excel/ExcelGenerateForm.tsx` (91 lines) —
  클라이언트 폼, project_id / vendor_id UUID 입력, fetch + blob
  다운로드, filename 추출
- 신설: `packages/domain/src/excel/schema.ts` (8 lines) —
  `GenerateExcelInputSchema` (z.uuid project_id / vendor_id)
- 수정: `packages/domain/src/index.ts` — excel/schema barrel 추가
- 양식 재현 디테일: 시트당 사진 2장, 16개 cell merge, 14개 row
  height, 10개 column width, 16pt 제목 / 12pt 프로젝트명 / 일자 셀
  excel serial + numFmt `yyyy-mm-dd`, 이미지 `B5:I5` / `B11:I11`
- 파일명: `${sanitize(project.name)}_${sanitize(vendor.name)}_YYMMDD[-YYMMDD].xlsx`
- 정렬: photos `order('created_at', { ascending: true })`
- 단일 vendor: 1차 PASS 범위 한정 (multi-vendor 는 D-5b 후보)
- pre-commit hook: check-types 3 packages PASS (16.541s)

### 2.4 D-5a 부수 발견 (가벼움, KI 신설 보류)

#### 부수 발견 1: zod v4 `z.uuid()` top-level API

zod v4 부터 `z.string().uuid()` → `z.uuid()` top-level 함수 도입. V1
domain 패키지 일관 사용. KI 신설 보류 (사실관계 메모만).

#### 부수 발견 2: Supabase nested join return type union

`location:locations(name)` 형식의 nested join 은 TypeScript 측에서
`{ name: string } | { name: string }[] | null` union 반환 가능.
`pickName()` 헬퍼로 정규화. KI 신설 보류 (도메인 패턴).

#### 부수 발견 3: ExcelJS image buffer 타입 캐스팅

`buffer: buf1.buffer as ArrayBuffer` — Uint8Array.buffer 는
ArrayBufferLike 이나 ExcelJS 시그니처는 ArrayBuffer 요구. 캐스팅
필요. KI 신설 보류 (라이브러리 마찰).

### 2.5 D-5a 작성 시 SC (Scope-Cut) 정리

- SC-1: V1 §5 1차 = **단일 vendor 필터**. multi-vendor batch / 업체별
  배포 자동화는 D-5b 또는 V1.5
- SC-2: 양식 fine-tuning (폰트 / 테두리 / 정렬 미세 조정) → D-5b
  실데이터 검증 후 1패스로 처리
- SC-3: 사진 자동 회전 / 비율 보정 (expo-image-manipulator 동등
  서버 측 처리) → V1.5
- SC-4: 엑셀 재생성 파일명 `(1)`, `(2)` 접미 (ui-constraints §5) →
  D-5b 후보
- SC-5: 진행률 표시 / 오프라인 가드 UI (ui-constraints §5) → D-5b
  후보
- SC-6: 사진 단독 삭제 (domain-model §6 V2 검토) → V2

## 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: `~/work/acspc` (founder_ys home)
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ;
  export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
- bash 체인: `;` 권장 (exit 전파 회피, KI 11-class)
- registry 명령 금지: `pnpm list/why/outdated` (KI-16 회피)

### 3.2 집 PC

- 작업 경로: `~/work/acspc` (sinabro home)
- Node: v22.22.2 (nvm)
- preamble: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
  (cert 라인 제거)
- 그 외 동일 (KI-16, `;` 체인)

### 3.3 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15 + Turbopack / Expo SDK 54 (scaffold 단계)
- **exceljs 4.4.0** (D-5a 추가, exact pin) — Next.js 서버 측 실행
- Supabase (production DB + Storage + RLS 5종 + GRANT 28 rows)
- zod v4 (packages/domain), `z.uuid()` top-level
- pre-commit hook: `turbo check-types` (3 packages tsc --noEmit, D-5a
  대규모 소스 추가로 cache miss 16.541s)

### 3.4 제약 (운영원칙)

- 단일 진실 원본: CLAUDE.md → .claude/rules/* →
  docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 분리
- Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
- git add . 금지, explicit add list 만
- 사용자 승인 언어 엄수 (단독 "승인" 보다 동사 명시 권장. "권장대로"
  = 묵시 동사 동등)
- 단계 전환 시 명시 승인 발화 엄수 — D-4y~D-4z carryover

## 4. D-5b 다음 턴 스펙

### 4.1 후보 진입 chunks (총 7건)

| 후보 chunk | 우선순위 | 근거 |
|---|---|---|
| **E2. 엑셀 실데이터 검증** (실제 photos + Storage 이미지로 e2e 다운로드) | **high** | V1 §5 본 PASS 확정 위해 실데이터 1회 이상 검증 필수. UX 미세 조정 1패스 동반 |
| E3. 엑셀 양식 fine-tuning (폰트 / 테두리 / 정렬 미세 조정) | medium | E2 결과 직후 1패스. 사용자 실측 후 결정 |
| E4. 엑셀 재생성 파일명 `(1)`, `(2)` 접미 + 진행률 UI + 오프라인 가드 (ui-constraints §5) | medium | UI/UX 보강. D-5b 또는 D-5c |
| F. Mobile 트랙 결정 (V1.5 vs V2 vs V3 분리) | high | v2-priorities §8 명시. V2 진입 사전 의사결정 |
| H. V2 사양서 진입 (v2-priorities 활용) | high | V2 진입 핵심. 매우 큰 다발 |
| D. KI 누적 정리 (KI-24 / 25 + 잔존) | medium | V1 후반 정리 chunk 명시. 짧은 chunk |
| G. 보조 출처 정찰 (docs/00, docs/01 §4, docs/02, minor-fixes, phase-5.5-decomposition) | low-medium | v2-priorities §8 명시. 5~10개 추가 후보 확장 |

### 4.2 권장 진입 순서

D-5b 권장 = **E2 (엑셀 실데이터 검증)**.

근거:

- V1 §5 1차 PASS 는 구조 / 양식 / 다운로드 path 까지 PASS. 실데이터
  e2e 미검증 (테스트 photos 데이터 없이 코드만 PASS)
- 실데이터 1회 검증 후 양식 미세 차이 발견 시 E3 fine-tuning 으로
  바로 이어 1패스 처리 가능
- V1 정의 §5 deliverable 의 **본 PASS** 확정 = V1 진행도 100% 도달
  공식 선언 가능

후속 권장 순서: E2 → E3 (fine-tuning, 차이 발견 시) → E4 (UX 보강)
→ F (Mobile 트랙) → D (KI 정리) → G (보조 출처) → H (V2 사양서).

### 4.3 범위 외 (D-5b 일반)

- V1 본문 (docs/01) 변경
- v1-closure-report.md 본문 정정 (E2 PASS 후 별 chunk)
- handoff 수정
- 새 인터뷰 / 새 KI 추가 (필요 시 신설 별 chunk)

### 4.4 잠재 위험 (RW-D5b, E2 진입 시)

- **RW-D5b-1**: 실데이터 photos 가 없으면 e2e 검증 불가 → 사용자가
  업로드 폼으로 photos 1~4 장 사전 입력 필요
- **RW-D5b-2**: Storage 이미지 다운로드 실패 시 `imageBuffers[i] =
  null` → 시트는 생성되지만 이미지 누락. 검증 시 누락 케이스 확인
- **RW-D5b-3**: 240223 양식 재현 정확도 — 폰트 (실제는 굴림체?
  맑은고딕?), 테두리 (현재 미적용), 셀 정렬 미세 차이 가능
- **RW-D5b-4**: 사진 회전 메타데이터 (EXIF orientation) → 서버 측
  자동 회전 미적용. iOS 사진 세로 → 가로 회전 가능성
- **RW-D5b-5**: 큰 이미지 (≥ 5MB) 다수 처리 시 메모리 부담. V1.5
  expo-image-manipulator 또는 서버 측 sharp 도입 검토
- **RW-D5b-6**: vendor.name 특수문자 sanitize 가 파일명에만 적용
  (DB 저장 시점 sanitize 미적용) → domain-model §4 invariant 차이

### 4.5 권장 진행 순서 (E2 chunk)

1. 정찰 turn: 현재 V1 §5 코드 (apps/web/app/api/excel/route.ts) +
   업로드 폼 (apps/web/app/photos/upload/) + 실제 240223 사진대지
   (docs/_reference/) + RW-D5b-1~6 점검
2. 사용자 측 사전 준비: photos 1~4 장 업로드 (위치/공종/업체/일자
   입력 완료)
3. Generator turn: e2e 다운로드 검증 + 결과 엑셀 첨부 (사용자 측
   실측)
4. 차이 발견 시 E3 fine-tuning 진입 (별 turn 또는 1패스 동반)
5. PASS 확정 시 v1-closure-report.md 정정 별 chunk

## 5. 새 대화창 시작 가이드 (D-5b 복붙용 프롬프트 초안)

(아래 내용은 D-5b 새 대화창에 사용자가 그대로 복붙할 텍스트)

---

본 chat 끝까지 다음 운영 원칙 엄수:

1. 단일 진실 원본 (CLAUDE.md → .claude/rules/* →
   docs/agent-shared/operating-principles.md → docs/*)
2. Planner / Generator / Evaluator 분리 (한 turn 한 역할)
3. Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
4. git add . 금지, explicit add list 만
5. 사용자 승인 언어 엄수 — 단독 "승인" 보다 동사 명시 권장 ("Gate 2
   승인" / "본 작성 진입 승인" 등). "권장대로" = 묵시 동사 동등
6. 단계 전환 시 사용자 명시 승인 발화 엄수 — Planner 가 prompt 끝마다
   명시 승인 발화 형식 명시 + 사용자 발화 후에만 Claude Code 투입
7. 환경 분기 (회사 PC: corp cert / 집 PC: cert 라인 제거) + Node
   v22.22.2 + bash `;` 체인 + KI-16 회피 (registry 명령 금지)
8. 신규 KI 발견 시 즉시 known-issues.md 등재 후보 (Planner 판단).
   KI-23 ~ KI-29 잔존 / V2 회피 패턴 명시

본 chat HEAD: **`<handoff push 후 hash>`** (D-5a 종결 = handoff commit)
직전 commit: `6e87553` feat(excel): V1 §5 1차 PASS — API Route + UI
+ 240223 양식 재현 (created_at asc, 단일 vendor)
직전 handoff: `docs/_backlog/handoff-d5a-to-d5b.md` (본 commit)

V1 진행도: **V1 §5 1차 PASS** 반영. V1 정의 6개 항목 중 §5 1차 PASS.
잔여 = 실데이터 e2e 검증 + 양식 fine-tuning. 다음 chunk = **E2
(엑셀 실데이터 검증) 권장**:

- 근거: V1 §5 본 PASS 확정 위해 실데이터 1회 검증 필수
- 후속 권장 순서: E2 → E3 (fine-tuning) → E4 (UX 보강) → F (Mobile
  트랙) → D (KI 정리) → G (보조 출처) → H (V2 사양서)

D-5b 진입 시 첫 사용자 발화 후보:

- "D-5b 시작. 다음 chunk 권장은?"
- "E2 chunk 진입 정찰부터"
- "사전 photos 업로드 후 e2e 검증 진행"
- "다른 chunk 진입 (E3 / E4 / F / D / G / H)"

만약 E2 chunk 진입 시 첫 정찰 turn:

- 읽을 파일: apps/web/app/api/excel/route.ts (현 양식 코드),
  apps/web/app/photos/upload/PhotoUploadForm.tsx (사전 데이터 입력
  path), docs/01 §5 (V1 정의 출력), docs/_reference/240223_사진대지.xlsx
  (양식 원본), .claude/rules/ui-constraints.md §5 (엑셀 UX 제약)
- 잠재 위험 RW-D5b-1~6 (§4.4) 점검

## 6. 미해결 carryover (D-5a → D-5b)

- **carryover-1**: 단계 전환 명시 승인 발화 — D-4y~D-4z 부수 발견
  carryover. D-5a 에서도 일부 명시 승인 발화 누락 가능성. D-5b 부터
  Planner 가 prompt 끝마다 명시 승인 발화 형식 명시 + 사용자 발화 후
  투입 권장.
- **carryover-2**: 단독 "승인" 발화의 모호성 — 사용자 측 발화 시 동사
  명시 권장. "권장대로" = 묵시 동사 동등 (변경 없음).
- **carryover-3**: 보조 출처 5건 (docs/00, docs/01 §4, docs/02,
  minor-fixes.md, phase-5.5-decomposition.md) 정찰 미수행 (G chunk).
- **carryover-4**: 새 인터뷰 / 새 표본 추가 → 별 chunk (RW-D4y-3,
  RW-D4z-4 carryover. V2 사양서 진입 전 권장).
- **carryover-5**: 잔존 KI (KI-24, KI-25) 정리 chunk = D chunk
  (v2-priorities §7 명시).
- **carryover-6**: pre-commit hook docs-only cache miss 가능성 (D-4z
  부수 발견 3). 사실관계 메모만, KI 신설 보류.
- **carryover-7 (D-5a 신규)**: V1 §5 본 PASS 확정 = 실데이터 e2e
  검증 (E2 chunk) 필수. 검증 PASS 후 v1-closure-report.md 본문 정정
  별 chunk.
- **carryover-8 (D-5a 신규)**: 엑셀 양식 fine-tuning (폰트 / 테두리
  / 정렬) 미세 차이 발생 시 E3 chunk 진입. E2 결과 의존.
- **carryover-9 (D-5a 신규)**: 사진 회전 메타데이터 (EXIF
  orientation) 서버 측 자동 회전 미적용 → V1.5 expo-image-manipulator
  또는 서버 측 sharp 도입 검토 (RW-D5b-4).
