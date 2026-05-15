# Handoff D-5g → D-5h

작성 세션: D-5g (회사 PC)
작성일: 2026-05-15
대상 세션: D-5h

---

## § 1. 현재 상태

- HEAD: cce3fd5 (push 완료)
- 직전 3개 commit:
  - cce3fd5 feat(web): replace project_id UUID input with project_name + auto-upsert (D-5g chunk 1-A)
  - 555ab9a docs(backlog): handoff d5f-to-d5g
  - 89d4f91 docs(backlog): KI-23~33 ACTIVE/DEFERRED/RESOLVED 분류 + hash 보정
- working tree: clean (supabase/.temp/ untracked 만)

**V1 신 정의 (D-5g 결정)**:

V1 Core:
- 인증 + 권한 (✅)
- 사진 업로드 + 메타 6칸 (공사명/공종/위치/업체/내용/일자) (✅ chunk 1-A 완료)
- 엑셀 출력 (✅)
- 업체(vendor) 유지 (사용자 결정 A — 동삼보드판 5칸 + V1-5 호환용 vendor 1칸)

V1.5+ 명시 이월:
- /projects 별도 관리 화면 (사용자 결정: 사진 폼 자체 upsert 가 자연스러움)
- V1-4 웹 갤러리 (위치/날짜/공종 그룹핑)
- V1-6 동기화 트리거 (수동 버튼)
- 빨간색 마킹 (모바일 그리기)
- 음성 입력 (a 칸별 / b 자유발화)
- autocomplete (드롭다운 ▽ 이전 입력 자동 제안) — chunk 1-B 후보

V1 제거 (영구):
- V1-3 연속 촬영 (사용자 결정)

---

## § 2. D-5g 변동 사항

### 2.1 V1 범위 공식 축소 (의사결정)

- handoff d5f-to-d5g §4.3 옵션 C 진입 → 사용자 발화 누적으로 변형
- 동삼보드판 스크린샷 (5칸 통일 UI + 드롭다운 ▽) 기반 사진 폼 신 사양 확정
- /projects 별도 화면 V1.5+ 이월, 사진 폼 자체에서 공사명 자유 입력 + 자동 upsert

### 2.2 chunk 1-A 완료 (cce3fd5)

- PhotoUploadForm: projectId UUID text → projectName 자유 입력 (1~200자)
- uploadPhoto server action: upsertProjectId 헬퍼 추가 (locations/trades/vendors 패턴 재사용)
- takenAt 클라이언트 초기값 = 오늘 ISO 날짜
- 검증: tsc Step1 PASS, tsc Step2 PASS, next build PASS, Gate 2 PASS (브라우저 실 동작 + projects 자동 upsert "개포1동 주공아파트" id 6df3e58a 확인)
- 변경 통계: 2 files / +54 / -18

### 2.3 D-5g 부수 발견

- 정찰 1: apps/web 라우트 5개, ProjectSchema (packages/domain) 존재, photos 테이블 FK 4개, PhotoUploadForm UUID 직접 입력 임시 구현
- 정찰 2: photos 컬럼 전부 0001 init 부터 존재 (content_text, taken_at, location_id, trade_id, vendor_id), 0004 에서 location/trade/vendor nullable 완화
- 음성 입력 비용 추정: (a) 칸별 무료 / (b) 자유발화 시나리오 B 2명x2개월 ≈ $2~8 총

---

## § 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: ~/work/acspc
- Node: v22.22.2 (nvm)
- preamble: NODE_EXTRA_CA_CERTS=~/.certs/corp-root.pem + PATH (.bashrc 등록 → 생략 가능)

### 3.2 집 PC

- preamble: PATH 만 (cert 라인 없음)
- .env.local 별도 관리 (carryover-16: NODE_TLS_REJECT_UNAUTHORIZED=0 회사 PC 전용)
- 첫 진입 시 dev 서버 동작 별도 검증 필요 (chunk 1-A 동작 회사 PC 기준)

### 3.3 공통 제약

- bash 체인 ; (KI-11)
- registry 명령 금지 (KI-16)
- git add . 금지, explicit add only
- pre-commit hook: turbo check-types (3 packages)

### 3.4 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15.5.15 + Turbopack / React 19.1.0 / Tailwind CSS 4.x
- Expo SDK 54 (mobile 트랙 V1.5+)
- exceljs 4.4.0 / Supabase / zod v4

---

## § 4. D-5h 다음 턴 스펙

### 4.1 후보 chunk

| chunk | 우선순위 | 근거 |
|---|---|---|
| 인터뷰 자료 도착 (월요일 PO 직접) | external | V1.5+ 우선순위 재조정 트리거 |
| chunk 1-B autocomplete (5칸 드롭다운 ▽) | medium-high | 동삼보드판 정합 + 입력 효율 |
| 사진 폼 폴리시 (vendor 기본값, takenAt UI 명확화) | low | 시나리오 B 진입 전 polish |
| 시나리오 B 일정 확정 | external | PO 영역 |
| V1.5+ chunk (마킹/음성/갤러리) | low | V1 검증 결과 보고 결정 |

### 4.2 권장 진입 (집 PC 첫 turn)

집 PC 환경 검증 (Step 0) 우선:
- cd ~/work/acspc ; pwd ; git remote -v ; git log --oneline -3 ; node --version
- .env.local 존재 여부 (집 PC 별도 셋업 필요할 수 있음)

환경 OK 시 옵션:
- (i) chunk 1-B autocomplete 진행 (HTML datalist 추천, 작업량 ~80~150줄)
- (ii) 인터뷰 도착 대기 + carryover 처리 (15 / 18)
- (iii) chunk 1-A 의 집 PC 동작 검증만 (테스트)

### 4.3 잠재 위험

- 집 PC dev 서버 supabase 연결 (.env.local 동기화)
- autocomplete 5칸 일관성 (모든 칸 동일 패턴)
- HTML datalist vs React combobox 선택 (모바일 UX)
- 카이저 carryover-19 (UI 패턴 결정) 가 사용자/Planner 결정 영역

---

## § 5. 미해결 carryover

- carryover-5: 보조 출처 정찰 5건 — 미해결
- carryover-6: 시나리오 B 실 사용자 검증 — 일정 미정, 인터뷰 후 결정
- carryover-8: 엑셀 fine-tuning M 4건 잔존
- carryover-9: 사진 EXIF 회전 → V1.5
- carryover-10: W2 nullsLast 실 동작 검증 → V1.5
- carryover-14: photo 중복 6초 차이 → V1.5
- carryover-15: KI-33 → operating-principles.md 흡수 후보
- carryover-16: .env.local NODE_TLS_REJECT_UNAUTHORIZED=0 (회사 PC 전용)
- carryover-18: 레이아웃 M 항목 (제목 자간, 폰트, 시트명, numFmt)
- **carryover-19 (D-5g 신규)**: chunk 1-B autocomplete UI 패턴 결정 (datalist / combobox / custom)
- **carryover-20 (D-5g 신규)**: 사용자 인터뷰 자료 도착 (월요일) → V1.5+ 우선순위 재조정

---

## § 6. 새 대화창 시작 가이드

본 chat HEAD: handoff push 완료 시점 확정 (Step 2 commit hash)
직전 handoff raw URL:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d5g-to-d5h.md

환경:
- 회사 PC: preamble cert 포함 (.bashrc 등록 시 생략 가능)
- 집 PC: cert 라인 제거, .env.local 별도 (carryover-16)

V1 진행도:
- chunk 1-A 완료 (사진 폼 공사명 자유 입력 + projects 자동 upsert + 일자 today default)
- 인터뷰 도착 대기 (월요일)
- 다음 후보: chunk 1-B autocomplete (5칸 드롭다운 ▽) / V1.5+ carryover

D-5h 진입 시 첫 사용자 발화 후보:
- "D-5h 시작. chunk 1-B autocomplete 진행"
- "D-5h 시작. 인터뷰 도착 전 carryover-15 진행"
- "D-5h 시작. 집 PC 환경 검증부터"
