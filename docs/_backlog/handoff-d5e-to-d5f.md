# Handoff D-5e → D-5f

작성 세션: D-5e (회사 PC)
작성일: 2026-05-15
대상 세션: D-5f

---

## § 1. 현재 상태

- HEAD: 407a230 (push 완료)
- 직전 3개 commit:
  - `407a230` feat(excel): ExcelGenerateForm project/vendor dropdown + 라벨 개선 (chunk I)
  - `33eee06` docs(backlog): user-validation-d5e 시나리오 A PASS 결과 기록
  - `234b70e` docs(backlog): user-validation-d5e 검증 절차 문서 신규
- working tree: clean

**V1 실 동작 진행도:**

| V1 기능 | 실 동작 |
|---|---|
| V1-1 마스터 화면 (web) | ❌ V1.5 |
| V1-2 촬영 전 태그 (mobile) | ❓ V1.5+ |
| V1-3 연속 촬영 (mobile) | ❓ V1.5+ |
| V1-4 갤러리 화면 (web) | ❌ V1.5 |
| **V1-5 엑셀 출력 (web)** | ✅ 본 PASS + 시나리오 A 검증 + chunk I UX 완료 |
| V1-6 동기화 트리거 | ❓ 미확인 |
| 로그인 + 사진 업로드 메타 4칸 | ✅ |

---

## § 2. D-5e 변동 사항

### 2.1 chunk B — 사용자 검증 문서 + 시나리오 A PASS

- `234b70e`: docs/_backlog/user-validation-d5e.md 신규 (검증 절차 문서)
- `33eee06`: 시나리오 A PASS 결과 기록
  - 날짜순 6시트 / 위치별 4시트 모두 시트명·A3·사진 정합
  - 중복 suffix `(2)` 정상 동작
- 시나리오 B (김민성/김은수 실 사용자): 일정 미정

### 2.2 chunk I — ExcelGenerateForm UX 개선

- `407a230`: UUID 텍스트 입력 → project/vendor dropdown 교체
  - project dropdown: 본인 project 목록 자동 로드
  - vendor dropdown: project 선택 시 해당 project vendor만 필터링
  - "정렬 기준" → "엑셀 시트 분류 기준"
  - "위치 순" → "위치별" / "날짜 순" → "날짜순"
  - vendors.project_id FK 확인 (0001_init.sql) → 분기 A 사용
- Gate 2 PASS: dropdown → 엑셀 생성 → 파일 다운로드 정합

### 2.3 D-5e 부수 발견

- NODE_TLS_REJECT_UNAUTHORIZED=0 → apps/web/.env.local 추가
  (회사 망 cert 회피용, gitignore 대상)
- .bashrc 에 NODE_EXTRA_CA_CERTS 영구 등록 완료

---

## § 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: ~/work/acspc
- Node: v22.22.2 (nvm)
- preamble: export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ;
  export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
  (.bashrc 등록 완료 → 새 터미널에서는 생략 가능)

### 3.2 집 PC

- preamble: export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"
  (cert 라인 없음)

### 3.3 공통 제약

- bash 체인: ; 권장 (KI-11 class)
- registry 명령 금지: pnpm list/why/outdated (KI-16)
- git add . 금지
- pre-commit hook: turbo check-types (3 packages)

### 3.4 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15.5.15 + Turbopack / React 19.1.0 / Tailwind CSS 4.x
- Expo SDK 54 / exceljs 4.4.0 / Supabase / zod v4

---

## § 4. D-5f 다음 턴 스펙

### 4.1 후보 chunk

| chunk | 우선순위 | 근거 |
|---|---|---|
| **D. KI-23~33 누적 정리** | medium | 문서 정리, 짧은 chunk |
| **B'. 시나리오 B** (김민성/김은수) | high (일정 확정 시) | 실 사용자 검증 |
| **레이아웃 정합성 검증** | medium | 240223_사진대지_3.xlsx 대비 acspc 출력 비교 |
| E3'. Medium 4 + A2 | low | 엑셀 fine-tuning 잔존 |
| F. Mobile 트랙 결정 | high (V1.5 진입 시) | |
| G. 보조 출처 정찰 | low-medium | |
| H. V2 사양서 진입 | high (V2 준비 시) | |

### 4.2 권장 진입

240223_사진대지_3.xlsx (실 사용 양식) 업로드된 상태 →
**레이아웃 정합성 비교 분석** 권장.
acspc 출력 시트 구조 vs 실 양식 Row/Col 매핑 차이 파악 → 개선 후보 도출.

이후: D (KI 정리) → B' (일정 확정 시) → F → H.

### 4.3 레이아웃 정합성 비교 범위

- 읽을 파일:
  - 240223_사진대지_3.xlsx (실 양식, 업로드 보유)
  - apps/web/app/api/excel/route.ts (현 생성 로직)
  - docs/01 §5 (V1 정의)
- 비교 항목: Row 배치, 셀 병합, 폰트, 사진 삽입 위치, 메타 4칸 위치

---

## § 5. 미해결 carryover

- carryover-4: KI-23~33 정리 (chunk D)
- carryover-5: 보조 출처 정찰 5건 (chunk G)
- carryover-6: 시나리오 B 실 사용자 검증 — 일정 미정
- carryover-8: 엑셀 fine-tuning Medium 4 + A2 (chunk E3')
- carryover-9: 사진 EXIF 회전 미적용 → V1.5
- carryover-10: W2 nullsLast 실 동작 검증 → V1.5
- carryover-13: vendor dropdown project 필터링 → D-5e 완료 ✅
- carryover-14: photo 중복 6초 차이 → V1.5
- carryover-15: KI-33 보강 → operating-principles.md 흡수 후보
- carryover-16: .env.local NODE_TLS_REJECT_UNAUTHORIZED=0 (회사 PC 전용)
- carryover-17 (D-5e 신규): 240223_사진대지_3.xlsx 레이아웃 정합성
  비교 미수행 → D-5f 권장

---

## § 6. 새 대화창 시작 가이드

본 chat 끝까지 운영 원칙 엄수 (CLAUDE.md 기준).

본 chat HEAD: 407a230 + handoff commit (push 완료)
직전 handoff raw URL:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d5e-to-d5f.md

환경:
- 회사 PC: preamble cert 포함 (.bashrc 등록 시 생략 가능)
- 집 PC: cert 라인 제거

V1 진행도: V1-5 엑셀 출력 본 PASS + 시나리오 A 검증 + chunk I UX 완료.
다음 권장 chunk: 레이아웃 정합성 비교 (240223_사진대지_3.xlsx 보유 시)
또는 chunk D (KI 정리).

D-5f 진입 시 첫 사용자 발화 후보:
- "D-5f 시작. 레이아웃 정합성 비교 분석부터"
- "D-5f 시작. chunk D (KI 정리)부터"
- "D-5f 시작. 시나리오 B 일정 잡혔다, chunk B' 진행"
