# Handoff D-5h → D-5i

작성 세션: D-5h (집 PC)
작성일: 2026-05-16
대상 세션: D-5i

---

## § 1. 현재 상태

- HEAD: TBD (D-5h commit 후 결정, 본 handoff push 시점 확정)
- 직전 3개 commit (D-5h 진입 시점):
  - 3948f8f docs(backlog): handoff d5g-to-d5h
  - cce3fd5 feat(web): replace project_id UUID input with project_name + auto-upsert (D-5g chunk 1-A)
  - 555ab9a docs(backlog): handoff d5f-to-d5g
- working tree: clean (D-5h commit 후 기준)

**V1 신 정의 (D-5g 결정, D-5h 검증 통과)**:

V1 Core:
- 인증 + 권한 (✅)
- 사진 업로드 + 메타 6칸 (공사명/공종/위치/업체/내용/일자) (✅ chunk 1-A 완료 + 집 PC 검증 통과)
- 엑셀 출력 (✅ vendor 별 분리 출력 사양 확인)
- 업체(vendor) 유지 (사용자 결정 A — 동삼보드판 5칸 + V1-5 호환용 vendor 1칸)

V1.5+ 명시 이월:
- /projects 별도 관리 화면
- V1-4 웹 갤러리 (위치/날짜/공종 그룹핑)
- V1-6 동기화 트리거 (수동 버튼)
- 빨간색 마킹 (모바일 그리기)
- 음성 입력 (a 칸별 / b 자유발화)
- autocomplete (드롭다운 ▽ 이전 입력 자동 제안) — **chunk 1-B 우선순위 high 상향 (D-5h)** **(D-5h 재분류 안건, §4 참조)**

V1 제거 (영구):
- V1-3 연속 촬영

---

## § 2. D-5h 변동 사항

### 2.1 집 PC 환경 동기화

- git pull: cb64274 (D-4z) → 3948f8f (D-5g) FF, +20 files / +3309 / -88 lines
- 의존성 install: `pnpm install --frozen-lockfile` 3.5초, +101 / -146 packages, exceljs 4.4.0 추가 확인
- `.env.local` 정합 통과: carryover-16 의 회사 PC ↔ 집 PC publishable key 일치 사전 점검. 추가 이전 작업 불필요 확인.

### 2.2 chunk 1-A 집 PC 동작 검증 통과

- PhotoUploadForm 공사명 자유 입력 + projects 자동 upsert 정상
- 사진 1장 업로드 성공 (photo_id 75f499b6...)
- Excel 출력 정상 동작 (현대건설 vendor 기준 어제 사진 출력 확인)

### 2.3 이슈 ②③ 가양성 진단

- 이슈 ① (Excel 사진 세로 구겨짐): V1.5+ 이월 (carryover-9 확장, EXIF 회전 + 종횡비 왜곡)
- 이슈 ② (Excel 누락): **사양상 정상**. vendor 별로 별도 Excel 파일이 분리 출력되는 구조. 사용자 인지 부재로 가양성. (→ carryover-22)
- 이슈 ③ (드롭다운 제한): **사양상 정상**. vendors 테이블 row 와 1:1 일치. 사용자 기억상 "업체1/2" 는 DB 사실과 불일치 (5/13 test7 의 "업체A" 와 혼동으로 추정).

### 2.4 신규 발견 — trade/location 입력 혼동 (이슈 ④)

- photo 75f499b6 의 메타: `trade="B1"` / `location="철근"` (보통 반대로 입력하는 패턴)
- 5칸 자유 입력의 인식 신뢰성 한계 확인 (사용자 본인조차 칸 위치 혼동)
- → carryover-21 신규, chunk 1-B autocomplete 우선순위 상향 근거 → carryover-19 상향, -21 신규

### 2.5 정찰 부산물 — KI-34 신규

- `upsertMasterId` (uploadPhoto.ts:55~84) 에러 처리 불투명 — select / insert / RLS / unique 충돌 구분 불가, 로그 없음 (호출부 line 151~152)
- known-issues.md 등재 (DEFERRED → V2)

---

## § 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: ~/work/acspc
- Node: v22.22.2 (nvm)
- preamble: NODE_EXTRA_CA_CERTS=~/.certs/corp-root.pem + PATH (.bashrc 등록 → 생략 가능)

### 3.2 집 PC

- preamble: PATH 만 (cert 라인 없음)
- `.env.local` 별도 관리 (carryover-16: NODE_TLS_REJECT_UNAUTHORIZED=0 회사 PC 전용)
- **D-5h 검증 통과**: chunk 1-A 동작 + Excel 출력 정상 동작 확인 (집 PC 별도 셋업 마무리)

### 3.3 공통 제약

- bash 체인 `;` (KI-11)
- registry 명령 금지 (KI-16)
- `git add .` 금지, explicit add only
- pre-commit hook: turbo check-types (3 packages)

### 3.4 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15.5.15 + Turbopack / React 19.1.0 / Tailwind CSS 4.x
- Expo SDK 54 (mobile 트랙 V1.5+)
- exceljs 4.4.0 / Supabase / zod v4

---

## § 4. D-5i 다음 턴 스펙

### 4.1 외부 트리거

- **인터뷰 자료 도착 예정 (월요일, PO 직접)** — D-5g 부터 대기, D-5i 진입 시 도착 여부 확인 우선

### 4.2 후보 chunk

| chunk | 우선순위 | 근거 |
|---|---|---|
| 인터뷰 자료 흡수 | external | V1.5+ 우선순위 재조정 트리거 |
| chunk 1-B autocomplete (5칸 드롭다운 ▽) | **high (D-5h 상향)** | D-5h 본인 검증에서 입력 인식 불일치 + 칸 혼동 사례 발생 |
| 5칸 UI 라벨 / 순서 검토 (carryover-21) | medium-high | trade/location 혼동 대응. 라벨 강화 / placeholder 예시 |
| Excel 분리 사양 명확성 (carryover-22) | medium | 본인 검증에서 사양 인지 어려움 — UI 그룹핑 시각화 |
| KI-34 (upsertMasterId 로깅) | low | 디버깅 편의, V1.5+ |
| V1.5+ chunk (마킹/음성/갤러리) | low | V1 검증 결과 보고 결정 |

### 4.3 권장 진입

1. 인터뷰 도착 여부 확인
2. 도착 시 → 인터뷰 자료 흡수 우선 (V1.5+ 우선순위 재조정)
3. 미도착 시 → chunk 1-B autocomplete 의 V1 / V1.5+ 분류 결정 (D-5h 상향 근거 검토)

### 4.4 잠재 위험

- autocomplete 5칸 일관성 (모든 칸 동일 패턴)
- HTML datalist vs React combobox 선택 (모바일 UX) — carryover-19
- 인터뷰 자료 흡수 시 V1 scope 재확장 압력 (scope-cut 발동 사전 준비)

---

## § 5. 미해결 carryover

- carryover-5: 보조 출처 정찰 5건 — 미해결
- carryover-6: 시나리오 B 실 사용자 검증 — 일정 미정, 인터뷰 후 결정
- carryover-7: (이전 handoff 정리 시 흡수, 미사용 번호)
- carryover-8: 엑셀 fine-tuning M 4건 잔존
- **carryover-9 확장 (D-5h)**: 사진 EXIF 회전 + **종횡비 왜곡** → V1.5
- carryover-10: W2 nullsLast 실 동작 검증 → V1.5
- carryover-14: photo 중복 6초 차이 → V1.5
- carryover-15: KI-33 → operating-principles.md 흡수 후보
- **carryover-16 (D-5h 마크)**: .env.local NODE_TLS_REJECT_UNAUTHORIZED=0 (회사 PC 전용) — 집 PC 검증 통과
- carryover-18: 레이아웃 M 항목 (제목 자간, 폰트, 시트명, numFmt)
- **carryover-19 상향 (D-5h)**: chunk 1-B autocomplete UI 패턴 결정 (datalist / combobox / custom) — medium-high → **high** (본인 입력 혼동 사례 근거)
- carryover-20: 사용자 인터뷰 자료 도착 (월요일) → V1.5+ 우선순위 재조정 — 변동 없음
- **carryover-21 신규 (D-5h)**: 5칸 라벨/순서가 사용자 멘탈 모델과 어긋남 (trade/location 혼동 사례 발생). UI 라벨 강화 또는 placeholder 예시 추가 검토. → V1.5+
- **carryover-22 신규 (D-5h)**: vendor 별 Excel 분리 출력 사양이 사용자에게 명확하지 않음. 사진 폼/목록 vendor 그룹핑 시각화 검토. → V1.5+

---

## § 6. 새 대화창 시작 가이드

본 chat HEAD: handoff push 완료 시점 확정 (Step 2 commit hash)
직전 handoff raw URL:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d5h-to-d5i.md

환경:
- 회사 PC: preamble cert 포함 (.bashrc 등록 시 생략 가능)
- 집 PC: cert 라인 제거, .env.local 별도 (carryover-16). D-5h 검증 통과 — 두 PC 모두 정상 동작.

V1 진행도:
- chunk 1-A 통과 + 집 PC 검증 통과
- 이슈 ②③ 가양성 (사양상 정상으로 확인)
- 이슈 ① 은 carryover-9 확장 (V1.5+ 이월)
- 이슈 ④ 신규 (trade/location 혼동) → carryover-21 + chunk 1-B 우선순위 상향
- 인터뷰 자료 도착 대기 (월요일)
- 다음 후보: 인터뷰 흡수 또는 chunk 1-B autocomplete V1/V1.5+ 결정

D-5i 진입 시 첫 사용자 발화 후보:
- "D-5i 시작. 인터뷰 자료 도착"
- "D-5i 시작. chunk 1-B autocomplete V1/V1.5+ 결정"
- "D-5i 시작. carryover-21 5칸 라벨 검토"
