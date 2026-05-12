# Handoff D-5b → D-5c

작성 세션: D-5b (회사 PC)
작성일: 2026-05-12
대상 세션: D-5c (집 PC 이동 후 — V1 §5 2차 PASS / 정렬 라디오 chunk A
권장, 또는 KI 정리 chunk D / 사용자 검증 chunk B / Medium 4 + A2 별
chunk E3' 중 택1)

---

## 1. 현재 상태

- HEAD: `<handoff push 후 hash>` (본 handoff push 후 = handoff commit
  hash 로 갱신)
- 직전 3개 commit (handoff push 전 기준):
  - `553d0db` feat(excel): V1 §5 E3 fine-tuning — 240223 시각 정합 4
    항목 (제목 폰트 / 일자 numFmt / 테두리 / column 폭. 변경 4 = 이미지
    anchor 미적용, KI-31)
  - `d36be2b` docs(backlog): handoff d5a-to-d5b (D-5a 종결, V1 §5 1차
    PASS + 진행도 정정 + KI-26~30 신규)
  - `6e87553` feat(excel): V1 §5 1차 PASS — API Route + UI + 240223
    양식 재현 (created_at asc, 단일 vendor)
- working tree: handoff push 후 clean (supabase/.temp/ 제외)
- 본 chat 시작 HEAD: `d36be2b` → handoff push 후 = 2 commit 진행 (E3 +
  handoff)
- **V1 진행도**: V1 §5 deliverable **1차 PASS + E3 fine-tuning 4/5
  적용**. 본 PASS 확정은 사용자 측 e2e 다운로드 시각 검증 (Gate 2
  b-1/b-2) 후. 잔여 = V1 §5 2차 PASS (정렬 라디오 + 멀티 페이지) +
  Medium 4 + A2 페이지 번호 의미 확인 + 사용자 검증.

## 2. D-5b 변동 사항

### 2.1 commit `553d0db` — V1 §5 E3 fine-tuning 4 항목 (D-5b 핵심)

- 수정: `apps/web/app/api/excel/route.ts` (+38 / -10)
- 변경 1 (제목 폰트): `title.font = { name: '맑은 고딕', bold: true,
  size: 32 }` (was: default name + 16pt). 240223 원본 제목 폰트 시각
  정합.
- 변경 2 (일자 numFmt): `date1.numFmt = 'yyyy/mm/dd(aaa)'` / `date2`
  동일 (was: `yyyy-mm-dd`). 240223 한글 요일 표기 (예: `2026/05/12(화)`)
  시각 정합.
- 변경 3 (테두리): helper `applyBoxBorder()` 신설 (route.ts:42-63),
  메타 박스 (row 7~8 / 13~14) 외곽 thin + 내부 hair, 이미지 영역
  (row 5 / row 11) 외곽 thin 적용. 4 호출.
- 변경 5 (column 폭): C~I 13 → 9 (route.ts:140-149). 240223 본문 폭
  일치.
- **변경 4 미적용** (이미지 anchor): 정찰 1A 의 openpyxl AnchorMarker
  col 해석 오류 사후 발견 → revert. 240223 원본 = `B5:I5` / `B11:I11`
  와 기존 코드 일치. KI-31 등재.
- Option B scope (5 시도 → 4 적용). Medium 4 (본문 폰트 name) + A2
  페이지 번호 = 별 chunk 후보 (E3' 또는 V1 §5 본 PASS 후).
- Gate 2 b-1/b-2 PASS (사용자 측 e2e 다운로드 시각 검증).
- pre-commit hook: turbo check-types 3 packages PASS (~2.0s, web cache
  miss).

### 2.2 D-5b 부수 발견

#### KI-31 신규 등재 (정찰 1A 사후 발견)

openpyxl AnchorMarker col 해석 오류. col=N 은 0-based **좌측 경계**
column index. ExcelJS string range 의 우하단 = col-1 (=column letter).
변경 4 (`B5:J6` / `B11:J12`) 적용 시 우측 J 컬럼 + 하단 row 6 침범
초과 → revert. 차후 openpyxl → ExcelJS 양식 변환 시 매핑 정합 표
적용. 상세 = known-issues.md KI-31.

### 2.3 D-5b 작성 시 SC (Scope-Cut) 정리

- SC-1 (D-5b 신규): V1 §5 2차 PASS = **정렬 라디오 (위치 순 / 날짜 순,
  2 옵션) + 2차 정렬 = 촬영순 (created_at asc) 고정**. "촬영 순 단독"
  옵션 제거. → chunk A.
- SC-2 (D-5b 신규): 시각 그룹 헤더 (옵션 B, 정렬 키 변경 시점에
  헤더 row 삽입) → chunk A 본 scope 외, **V1.5 또는 V2 결정**. 집 PC
  chunk A 진입 시 사용자 결정 필요.
- SC-3 (D-5b 신규): Medium 4 (본문 셀 폰트 name 맑은 고딕 명시) + A2
  페이지 번호 의미 확인 → 별 chunk E3' (D-5c 또는 그 후).
- SC-4 (D-5a 잔존): 양식 fine-tuning → **D-5b 4/5 적용 완료**, 변경
  4 = revert (KI-31). E3' 별 chunk 잔존.
- SC-5 (D-5a 잔존): 엑셀 재생성 파일명 `(1)`, `(2)` 접미 → D-5c 후보.
- SC-6 (D-5a 잔존): 진행률 표시 / 오프라인 가드 UI → D-5c 후보.
- SC-7 (D-5a 잔존): 사진 자동 회전 / 비율 보정 → V1.5.
- SC-8 (D-5a 잔존): 사진 단독 삭제 → V2.

## 3. 환경 전제

### 3.1 회사 PC (본 chat D-5b)

- 작업 경로: `~/work/acspc` (founder_ys home)
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ;
  export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`

### 3.2 집 PC (D-5c 진입 환경)

- 작업 경로: `~/work/acspc` (sinabro home)
- Node: v22.22.2 (nvm)
- preamble: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
  (cert 라인 제거)
- 그 외 동일 (KI-16 회피, `;` 체인)

### 3.3 공통 제약

- bash 체인: `;` 권장 (exit 전파 회피, KI 11-class)
- registry 명령 금지: `pnpm list/why/outdated` (KI-16 회피)
- git add . 금지, explicit add list 만
- pre-commit hook: `turbo check-types` (3 packages tsc --noEmit)

### 3.4 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15 + Turbopack / Expo SDK 54 (scaffold 단계)
- **exceljs 4.4.0** (D-5a 추가, exact pin) — Next.js 서버 측 실행
- Supabase (production DB + Storage + RLS 5종 + GRANT 28 rows)
- zod v4 (packages/domain), `z.uuid()` top-level

### 3.5 운영 원칙

- 단일 진실 원본: CLAUDE.md → .claude/rules/* →
  docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 분리
- Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
- 사용자 승인 언어 엄수 (단독 "승인" 보다 동사 명시 권장. "권장대로"
  = 묵시 동사 동등)
- 단계 전환 시 명시 승인 발화 엄수 — D-4y~D-5b carryover

## 4. D-5c 다음 턴 스펙

### 4.1 후보 진입 chunks

| 후보 chunk | 우선순위 | 근거 |
|---|---|---|
| **A. V1 §5 2차 PASS — 정렬 라디오 + 멀티 페이지** | **high** | V1 §5 본 PASS 확정 직전. 1차 PASS + E3 fine-tuning 4/5 적용 후 다음 본 chunk |
| D. KI 누적 정리 (KI-24/25/26~31) | medium | V1 후반 정리 chunk 명시. 짧은 chunk |
| B. 사용자 검증 (김민성 / 김은수) — 사진 stretching 미감 (RW-D5b-1) 동시 검토 | medium-high | V1 사용자 검증 트랙. 양식 본 PASS 후 진행 권장 |
| E3'. Medium 4 (본문 폰트 name) + A2 페이지 번호 의미 확인 | low-medium | 별 chunk. V1 §5 2차 PASS 후 또는 사용자 검증 결과 의존 |
| F. Mobile 트랙 결정 (V1.5 vs V2 vs V3 분리) | high | v2-priorities §8 명시. V2 진입 사전 의사결정 |
| G. 보조 출처 정찰 (docs/00, docs/01 §4, docs/02, minor-fixes, phase-5.5-decomposition) | low-medium | v2-priorities §8 명시 |
| H. V2 사양서 진입 (v2-priorities 활용) | high | V2 진입 핵심. 매우 큰 다발 |

### 4.2 권장 진입 순서

D-5c 권장 = **chunk A (V1 §5 2차 PASS — 정렬 라디오)**.

근거:

- V1 §5 1차 PASS + E3 fine-tuning 4/5 완료 → V1 §5 본 PASS 확정 직전
- 정렬 라디오 (위치 순 / 날짜 순) + 2차 정렬 = 촬영순 고정은 V1 §5
  본 PASS 필수 요건 (사용자 결정)
- "촬영 순 단독" 옵션 제거 → 3 옵션 → 2 옵션 단순화

후속 권장 순서: A → D (KI 정리, 짧은 chunk) → B (사용자 검증) → E3'
(Medium 4 + A2) → F (Mobile 트랙) → G (보조 출처) → H (V2 사양서).

### 4.3 chunk A 진입 스펙

#### 4.3.1 수정 대상 파일

- `packages/domain/src/excel/schema.ts` — `sortKey` enum 추가
  (`'location' | 'date'`), `GenerateExcelInputSchema` 확장
- `apps/web/app/api/excel/route.ts` — photos 조회 시 `.order(...)`
  분기. 1차 정렬 = sortKey 값 (`location.name asc` / `taken_at asc`),
  2차 정렬 = `created_at asc` (안정성)
- `apps/web/app/excel/ExcelGenerateForm.tsx` — 라디오 UI 2 옵션 (위치
  순 / 날짜 순), form 상태 + fetch payload 확장

#### 4.3.2 잠재 위험 (RW-D5c-A)

- **W1**: Supabase nested join 정렬 syntax — `location:locations(name)`
  형식의 nested 컬럼 정렬은 PostgREST `order` 파라미터 syntax 확인
  필요. `.order('location(name)', { ... })` 또는 별도 `location_id`
  정렬 후 클라이언트 측 재정렬 후보 검토.
- **W2**: `taken_at` null 처리 — 현재 schema 는 `not null` 이지만
  과거 입력 path 미완 시점 데이터 가능성. null 발생 시 정렬 후순위
  (nullsLast) 명시.
- **W3**: secondary sort 안정성 — Postgres `ORDER BY` 는 동일 값
  시 비결정적. `created_at asc` 2차 정렬 명시로 결정성 확보.

#### 4.3.3 시각 그룹 헤더 (옵션 B)

chunk A 본 scope 외. V1.5 또는 V2 결정 사항. **집 PC chunk A 진입 시
사용자 결정 필요**:

- 옵션 B-1: 정렬 키 변경 시점에 그룹 헤더 row 삽입 (예: 위치 순 정렬
  시 location.name 변경 시점에 헤더 row)
- 옵션 B-2: 그룹 헤더 미사용, 단순 정렬만 적용

권장: 옵션 B-2 (단순 정렬) 로 V1 §5 2차 PASS, 옵션 B-1 은 V2 별 chunk.

### 4.4 범위 외 (D-5c 일반)

- V1 본문 (docs/01) 변경
- v1-closure-report.md 본문 정정 (V1 §5 본 PASS 후 별 chunk)
- handoff 수정
- 새 인터뷰 / 새 KI 추가 (필요 시 신설 별 chunk)
- 변경 4 (`B5:J6` / `B11:J12`) 재시도 (KI-31 회피)

### 4.5 권장 진행 순서 (chunk A)

1. 정찰 turn: 현재 V1 §5 route.ts 의 `.order()` 부분 + schema.ts +
   ExcelGenerateForm.tsx + Supabase nested order syntax 확인 (W1)
2. Planner turn: Gate 1 체크리스트 (B 코드 변경 7개) 제출 + 사용자
   결정 사항 (시각 그룹 헤더 옵션 B-1/B-2) 명시
3. Gate 1 사용자 승인 → Generator turn (3-file 동시 변경)
4. Evaluator turn (코드 검토)
5. Gate 2 사용자 승인 → commit + push
6. PASS 확정 시 V1 §5 본 PASS 선언 + v1-closure-report.md 정정 별
   chunk

## 5. 새 대화창 시작 가이드 (D-5c 복붙용 프롬프트 초안)

(아래 내용은 D-5c 새 대화창에 사용자가 그대로 복붙할 텍스트)

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
7. 환경 분기 — **집 PC**: preamble = `export
   PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"` (cert 라인 제거),
   작업 경로 = `~/work/acspc`, Node v22.22.2
8. bash `;` 체인 + KI-16 회피 (registry 명령 금지)
9. 신규 KI 발견 시 즉시 known-issues.md 등재 후보 (Planner 판단).
   KI-23 ~ KI-31 잔존 / V2 회피 패턴 명시

본 chat HEAD: **`<handoff push 후 hash>`** (D-5b 종결 = handoff commit)
직전 commit: `553d0db` feat(excel): V1 §5 E3 fine-tuning — 240223 시각
정합 4 항목 (제목 폰트 / 일자 numFmt / 테두리 / column 폭. 변경 4 =
미적용, KI-31)
직전 handoff: `docs/_backlog/handoff-d5b-to-d5c.md` (본 commit)

V1 진행도: **V1 §5 1차 PASS + E3 fine-tuning 4/5 적용**. V1 §5 본
PASS 확정 직전. 다음 chunk = **A (V1 §5 2차 PASS — 정렬 라디오)
권장**:

- 근거: 1차 PASS + E3 4/5 완료 → 본 PASS 확정 직전
- 후속 권장 순서: A → D (KI 정리) → B (사용자 검증) → E3' (Medium 4
  + A2) → F (Mobile 트랙) → G (보조 출처) → H (V2 사양서)

D-5c 진입 시 첫 사용자 발화 후보:

- "D-5c 시작. 다음 chunk 권장은?"
- "chunk A 진입 정찰부터"
- "다른 chunk 진입 (D / B / E3' / F / G / H)"

만약 chunk A 진입 시 첫 정찰 turn:

- 읽을 파일: `apps/web/app/api/excel/route.ts` (현 `.order()` 부분),
  `packages/domain/src/excel/schema.ts` (현 zod 스키마),
  `apps/web/app/excel/ExcelGenerateForm.tsx` (현 폼 UI), docs/01 §5
  (V1 정의 출력), .claude/rules/ui-constraints.md §5 (엑셀 UX 제약),
  Supabase nested order syntax (W1)
- 잠재 위험 W1~W3 (§4.3.2) 점검
- 사용자 결정 사항 (시각 그룹 헤더 옵션 B-1/B-2) Planner 측 명시 요청

## 6. 미해결 carryover (D-5b → D-5c)

- **carryover-1**: 단계 전환 명시 승인 발화 — D-4y~D-5a 잔존. D-5b
  에서도 일부 명시 승인 발화 누락 가능성. D-5c 부터 Planner 가 prompt
  끝마다 명시 승인 발화 형식 명시 + 사용자 발화 후 투입 권장.
- **carryover-2**: 단독 "승인" 발화의 모호성 — 사용자 측 발화 시 동사
  명시 권장. "권장대로" = 묵시 동사 동등 (변경 없음).
- **carryover-3**: 보조 출처 5건 (docs/00, docs/01 §4, docs/02,
  minor-fixes.md, phase-5.5-decomposition.md) 정찰 미수행 (G chunk).
- **carryover-4**: 새 인터뷰 / 새 표본 추가 → 별 chunk (RW-D4y-3,
  RW-D4z-4 carryover. V2 사양서 진입 전 권장).
- **carryover-5**: 잔존 KI (KI-24, KI-25) 정리 chunk = D chunk
  (v2-priorities §7 명시). D-5b 신규 KI-31 추가 → KI 정리 chunk 범위
  KI-24 / 25 / 26~31.
- **carryover-6**: pre-commit hook docs-only cache miss 가능성 (D-4z
  부수 발견 3). 사실관계 메모만, KI 신설 보류.
- **carryover-7 (D-5a 잔존)**: V1 §5 본 PASS 확정 = 실데이터 e2e
  검증 + 정렬 라디오 + 사용자 검증. D-5b E3 fine-tuning 4/5 적용
  완료 → 남은 = chunk A (정렬 라디오) + chunk B (사용자 검증).
- **carryover-8 (D-5a 잔존, D-5b 부분 해소)**: 엑셀 양식 fine-tuning
  → D-5b 4/5 적용 (변경 4 = KI-31 revert). 잔여 = Medium 4 (본문
  폰트 name) + A2 페이지 번호 = chunk E3'.
- **carryover-9 (D-5a 잔존)**: 사진 회전 메타데이터 (EXIF
  orientation) 서버 측 자동 회전 미적용 → V1.5
  expo-image-manipulator 또는 서버 측 sharp 도입 검토.
- **carryover-10 (D-5b 신규)**: KI-31 회피 — 차후 openpyxl 기반 양식
  정찰 시 AnchorMarker col 매핑 정합 표 (known-issues.md KI-31)
  참조 의무.
- **carryover-11 (D-5b 신규)**: 사진 stretching 미감 (RW-D5b-1) —
  사용자 검증 chunk B 와 동시 검토. 사진 비율 보정 시점 결정 (V1.5
  서버 측 처리 vs V1 ExcelJS embed 옵션).
- **carryover-12 (D-5b 신규)**: 시각 그룹 헤더 (옵션 B-1/B-2) — chunk
  A 진입 시 사용자 결정 필요. 권장 = B-2 (단순 정렬, V1 §5 본 PASS).
  B-1 (헤더 row 삽입) 은 V2 별 chunk 후보.
