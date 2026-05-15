# Handoff D-5f → D-5g

작성 세션: D-5f (회사 PC)
작성일: 2026-05-15
대상 세션: D-5g

---

## § 1. 현재 상태

- HEAD: 89d4f91 (push 완료)
- 직전 3개 commit:
  - `89d4f91` docs(backlog): KI-23~33 ACTIVE/DEFERRED/RESOLVED 분류 + hash 보정 (chunk D)
  - `bbb7549` fix(excel): A2 시트 순번 + A3 프로젝트명 단독 (레이아웃 정합성)
  - `ea8aa2f` docs(backlog): handoff d5e-to-d5f
- working tree: clean

**V1 실 동작 진행도:**

| V1 기능 | 실 동작 |
|---|---|
| V1-1 마스터 화면 (web) | ❌ V1.5 |
| V1-2 촬영 전 태그 (mobile) | ❓ V1.5+ |
| V1-3 연속 촬영 (mobile) | ❓ V1.5+ |
| V1-4 갤러리 화면 (web) | ❌ V1.5 |
| **V1-5 엑셀 출력 (web)** | ✅ 본 PASS + 시나리오 A + chunk I UX + 레이아웃 정합성 H 완료 |
| V1-6 동기화 트리거 | ❓ 미확인 |
| 로그인 + 사진 업로드 메타 4칸 | ✅ |

**진도 평가 (D-5f 회고):**
- 공식 V1 사양(6기능) 기준: 약 35~40%
- 축소 V1 (엑셀 코어 경로) 기준: 약 85~90%
- D-5g에서 V1 범위 공식 축소 여부 결정 필요

---

## § 2. D-5f 변동 사항

### 2.1 chunk — 레이아웃 정합성 분석 + H 항목 fix

- 240223_사진대지_3.xlsx (실 양식) 14행 구조 분석 완료
- `bbb7549`: A3 프로젝트명 단독 + A2 시트 순번 자동 삽입
  - 실 양식 정합: A2=페이지번호, A3=프로젝트명만
  - Gate 2 PASS (날짜별·위치별 파일 직접 검증)
- M 항목 (제목 자간 spot check, 레이블 폰트, 시트명 규칙) carryover-18로 이월

### 2.2 chunk D — KI-23~33 분류 정리

- `89d4f91`: known-issues.md 재배치
  - ACTIVE (5): KI-23, 24, 25, 28, 33
  - DEFERRED→V2 (2): KI-26, 27
  - RESOLVED (3): KI-29(09569ad), KI-31(06f49fc), KI-32(c0aa375)
  - KI-30 결번 명시, KI-33 hash 보정(717e60a)
  - L1~L790 보존, L791 이후 +21줄 (1187→1208)

### 2.3 D-5f 부수 발견

- `(본 commit)` 자기 참조 표기 4건 → 실 hash로 일괄 보정
- KI 정리 시 sed -i 글로벌 치환 risk → KI별 격리 파일 후 치환으로 회피 (Evaluator catch)

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

## § 4. D-5g 다음 턴 스펙

### 4.1 후보 chunk

| chunk | 우선순위 | 근거 |
|---|---|---|
| **의사결정. V1 범위 공식 축소** | **highest** | 35~40% vs 85~90% 진도 차이. 정의 필요 |
| **B'. 시나리오 B** (김민성/김은수) | high (일정 확정 시) | 실 사용자 검증 |
| **carryover-15. KI-33 → operating-principles 흡수** | medium | 별도 chunk로 분리됨 |
| **레이아웃 M 항목 (carryover-18)** | low | 시나리오 B 결과 보고 결정 |
| F. Mobile 트랙 결정 | high (V1.5 진입 시) | |
| G. 보조 출처 정찰 | low-medium | |
| H. V2 사양서 진입 | high (V2 준비 시) | |

### 4.2 권장 진입

**V1 범위 공식 축소 의사결정 우선.**

근거:
- 진도 차이 (35~40% vs 85~90%) 가 V1 정의에 따라 달라짐
- 시나리오 B 일정 미정 → 다른 작업 결정 어려움
- V1.5 진입 시 chunk F (Mobile 트랙) 등 줄줄이 결정 필요

이후: 결정 결과에 따라 시나리오 B 또는 V1-1/V1-4 진입 또는 V1.5 진입.

### 4.3 의사결정 frame

옵션 A: V1 = 엑셀 코어로 공식 축소 (현 ~85% 인정)
  - 시나리오 B → 8주 KPI 검증 → V1.5 진입
옵션 B: 원 V1 유지 (6기능)
  - V1-1, V1-4 web 작업 진입 → 큰 작업 (여러 세션)
옵션 C: 하이브리드 — 엑셀 코어로 검증하면서 V1-1만 보강

---

## § 5. 미해결 carryover

- carryover-4: ✅ D-5f chunk D 완료 (89d4f91)
- carryover-5: 보조 출처 정찰 5건 (chunk G) — 미해결
- carryover-6: 시나리오 B 실 사용자 검증 — 일정 미정
- carryover-8: 엑셀 fine-tuning — A2 D-5f 완료, Medium 4 잔존
- carryover-9: 사진 EXIF 회전 미적용 → V1.5
- carryover-10: W2 nullsLast 실 동작 검증 → V1.5
- carryover-14: photo 중복 6초 차이 → V1.5
- carryover-15: KI-33 보강 → operating-principles.md 흡수 후보 (D-5f 별도 chunk로 분리)
- carryover-16: .env.local NODE_TLS_REJECT_UNAUTHORIZED=0 (회사 PC 전용)
- carryover-17: ✅ D-5f 완료 (H 부분), M 부분 carryover-18로 이월
- carryover-18 (D-5f 신규): 레이아웃 M 항목 — 제목 자간 spot check, 레이블/값 폰트 명시,
  시트명 규칙, numFmt 대조

---

## § 6. 새 대화창 시작 가이드

본 chat 끝까지 운영 원칙 엄수 (CLAUDE.md 기준).

본 chat HEAD: 89d4f91 + handoff commit (push 완료)
직전 handoff raw URL:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d5f-to-d5g.md

환경:
- 회사 PC: preamble cert 포함 (.bashrc 등록 시 생략 가능)
- 집 PC: cert 라인 제거

V1 진행도:
- 공식 사양 기준 35~40% / 축소 범위 기준 85~90%
- D-5g 첫 의사결정: V1 범위 공식 축소 여부

D-5g 진입 시 첫 사용자 발화 후보:
- "D-5g 시작. V1 범위 공식 축소 논의부터"
- "D-5g 시작. 시나리오 B 일정 잡혔다, chunk B' 진행"
- "D-5g 시작. carryover-15 (KI-33 → operating-principles 흡수) 진행"
