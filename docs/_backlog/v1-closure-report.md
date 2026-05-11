# V1 마감 보고

작성 세션: D-4y
작성일: 2026-05-11
HEAD 기준: 8f83a78
V1 진행도: ~98%+

본 보고서는 Design Partner 온보딩 의사결정을 위한 자료다. GO/NO-GO 결정은 본 보고서를 입력으로 사용자가 판단한다.

---

## 1. 본 보고서 범위

### in
- V1 정의 (docs/01 §2) 6 기능 충족도 매핑
- 5.5.4 V1 종결 카드 결과 (commit 4841a61)
- 누적 KI 29건 분포
- V1 known gaps
- 사용자 표본 / 인터뷰 결과 요약
- Design Partner 온보딩 권장 사항 (의사결정 자료)

### out (별 chunk 또는 별 보고서)
- 5.5.0~5.5.3 단계별 진도 (이전 handoff 들에 분산)
- V2 백로그 우선순위 정리 (D-4y B chunk)
- 기능 구현 (mobile, content_text 자동완성, 엑셀 생성 chunk 미수행)
- 새 인터뷰 / 새 정책 / 새 KI 추가

---

## 2. V1 정의 (docs/01 §2) 충족도 매핑

| # | 기능 | 상태 | 출처 / 비고 |
|---|-----|-----|----------|
| 1 | 프로젝트 단위 마스터 설정 (위치/공종/업체) | 부분 완료 (스키마·검증 완비 / UI CRUD 미진입) | packages/domain/src/ 5 엔티티 zod 스키마 + 테스트 (project/location/trade/vendor/photo). apps/web/app/domain-check route 존재. 마스터 CRUD UI 미구현 |
| 2 | 촬영 전 태그 선택 | mobile 미진입 (V1 web 범위 외) | apps/mobile = Expo SDK 54 scaffold 단계 (app/components/hooks/constants 디렉터리만, 본 기능 미구현) |
| 3 | 연속 촬영 | mobile 미진입 (V1 web 범위 외) | 동상 |
| 4 | 갤러리 동기화 (iOS 평면 앨범) | mobile 미진입 (V1 web 범위 외) | 동상. expo-media-library 적용 chunk 미수행 |
| 5 | 업체별 사진대지 엑셀 자동 생성 | 미수행 | 별 chunk 예정 (Phase 5.6+, V1 본 deliverable) |
| 6 | 동기화 수동/자동 트리거 | 부분 완료 (web 단일 업로드 PASS) | 5.5.4 commit 4841a61: apps/web/app/photos/upload server action 신설 + Gate 2 6/6 PASS. 연속 동기화 트리거 / Wi-Fi 자동 옵션 미구현 |

### 분류 축 1축 가정 명시
docs/01 §2 #5 + §6.3 에서 "업체별로 엑셀 개별 생성" 명시. V1 = 업체별 단축. **분류 축 다양화 (위치별/공종별/HTML 포스터/앱 내 뷰) 는 V2 이월** (docs/02 N-3, N-4 / docs/01 §4).

---

## 3. 5.5.4 V1 종결 카드 (commit 4841a61)

handoff-d4x-to-d4y §2.4 그대로 인용:

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

부수 발견 (handoff §2.5):
- client.ts 사용처 0 도달 → V2 에서 제거 결정 가능
- design-notes §3 가정 vs 실제 schema 차이 (uploader_id → user_id) 사전 발견 효과
- zod v4 z.uuid() top-level 패턴 일관성 확인

---

## 4. 누적 KI 분포 (29건)

known-issues.md 정찰 결과 그대로:

| 상태 | KI 번호 | 건수 |
|---|---|---|
| 해결 (코드 fix commit 있음) | KI-10, KI-21, KI-22, KI-29 | 4 |
| 회피 패턴 정착 (운영 중) | KI-01, KI-02, KI-03, KI-04, KI-05, KI-06, KI-07, KI-08, KI-09, KI-11, KI-12, KI-13, KI-14, KI-15, KI-16, KI-17, KI-18, KI-19, KI-20, KI-28 | 20 |
| 인지 단계 (commit 없음, 잔존) | KI-23, KI-24, KI-25 | 3 |
| V2 회피 패턴 명시 (V1 무영향) | KI-26, KI-27 | 2 |

### V1 영향 KI
- 해결 완료: KI-10, KI-21, KI-22, KI-29
- 환경/Auth 회피 패턴 운영 중: KI-16, KI-17, KI-18, KI-19, KI-20
- 잔존 (인지 단계): KI-23 (회사/집 PC key 형식 불일치), KI-24 (.gitignore .bak 패턴)

### V2 이월 KI
- KI-25 (handoff/메모리 경로 정정, V1 후반 정리 chunk 후보)
- KI-26, KI-27 (storage 다중 bucket 진입 시 재평가 필수)

---

## 5. V1 known gaps

- **엑셀 생성 chunk 미수행** (V1 의 본 deliverable). 별 chunk 필요.
- **Mobile (Expo) 미진입**. V1 정의 #1~#4 의 mobile UX (촬영/태그/갤러리 동기화) 미구현. V1.1 또는 V2 트랙 결정 필요.
- **content_text 자동완성 / 최근 10개 UX 미진입**.
- **Middleware session refresh / signed URL 재발급 액션 미구현** (design-notes §6 RW-7/8).
- **클라이언트 client.ts 사용처 0 도달했으나 파일 자체 제거 미수행** (V2 결정 후보).
- **5.5.0~5.5.3 단계별 결과 보고 본 보고서 범위 외** (SC-1).

---

## 6. 사용자 표본 / 인터뷰 결과 요약

### 표본 (현재 시점)
- 김민성 (인터뷰 01/02): 1차 사용자, 현장 운영 관리자
- 김은수 (인터뷰 03): 2차 사용자, 분류 축 / 시간순 정렬 신호 제공
- **양 사용자가 같은 회사 소속** → 다른 회사 표본 부재

### 인터뷰 03 발견사항 (N-1~N-4)
- N-1: 감리 점검 트리거 → V1 영향 한정 가정 유지, 평상시 출력 채널은 V2 다양화 후보
- N-2: 엑셀 출력 시 사진 시간순 정렬 → V1 보강 완료 (docs/01 §6.1.1)
- N-3: 평상시 분류 축 = 위치 > 공종 → V2 이월
- N-4: 출력 채널 다양화 (HTML 포스터 / 앱 내 뷰) → V2 이월

### 기각 후보
- HPMS 보충작업사전승인 연동 (acspc 영역 밖)

---

## 7. Design Partner 온보딩 권장 사항 (의사결정 자료)

**본 권장 사항은 GO/NO-GO 결정을 사용자에게 위임한다. 본 보고서는 의사결정 자료에 한정한다.**

### 권장 1. V1 = 업체별 단축 출력으로 1차 검증
docs/01 §2 #5 + §6.3 의 업체별 단축 가정으로 1차 사용자 검증. 분류 축 다양화 (N-3, N-4) 는 V2 이월.

### 권장 2. 다른 회사 표본 1~2명 추가 인터뷰 후 온보딩 (RW-D4y-3)
현재 표본 2명 (김민성/김은수) 이 같은 회사 소속. 다른 회사 표본 부재가 1차 검증 결과의 일반화 가능성을 제한할 수 있음.

### 권장 3. 엑셀 생성 chunk (V1 본 deliverable) 미수행
온보딩 전 별 chunk 로 완성 필요. docs/01 §6 출력 사양에 따라 작성.

### 권장 4. Mobile (Expo) 트랙 결정
docs/01 §2 #1~#4 (촬영/태그/갤러리 동기화) 의 mobile UX 미구현. V1.1 (마감 직후) 또는 V2 트랙 중 선택.

### 권장 5. 잔존 KI (KI-23, KI-24) 정리 chunk
온보딩 전 또는 직후 정리. V1 영향은 환경 안정성 수준.

---

## 8. 본 보고서 후속 작업

- D-4y B chunk: V2 백로그 우선순위 정리 (docs/_backlog/v2-priorities.md)
- D-4y C chunk (선택): 노란봉투법 / 다양성 마케팅 각도 재검토
- D-4y D chunk (선택): KI 누적 정리 (D-4x 부수 발견 반영)
- 별 chunk: 엑셀 생성 chunk (V1 본 deliverable)
