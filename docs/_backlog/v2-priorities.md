# V2 후보 우선순위 정렬 (D-4z B chunk 산출물)

작성: D-4z (B chunk)
작성일: 2026-05-11
출처: 인터뷰 3건 + design-notes + KI + V1 마감 보고 + 운영 메모리

## §1. 문서 목적

이 문서는 V2 candidate 우선순위 정렬 자료다. V2 출시 사양서가 아니다.
본 문서의 목적은 V1 종결 시점 (HEAD `4755c1f`) 까지 누적된 V2 후보를
한 곳에 모아, 정성 우선순위 (high/medium/low) 와 차원 그룹화 (G1~G7)
로 정렬하여, 향후 V2 정의 / V2 출시 범위 / V2 사양서 단계의 진입 판단
자료로 쓰는 것이다. V2 정의 자체는 본 문서 범위 밖이며 별 작업이다.

## §2. 출처 + 정찰 방법

D-4z B chunk 정찰 2 단계로 수집:

- Step 1: 출처 파일 식별 + 라인 수 (read-only)
- Step 2: 6 출처 read + V2 후보 raw list 추출 (read-only, view 도구)

출처 매핑:

| # | 출처 | 경로 | 라인 |
|---|---|---|---|
| 1 | 김민성 인터뷰 01 | docs/interviews/01_김민성_근본문제_의심.md | 48 |
| 2 | 김민성 인터뷰 02 | docs/interviews/02_김민성_사진분류_워크플로.md | 105 |
| 3 | 김은수 인터뷰 03 | docs/interviews/03_김은수_분류축_재확인.md | 193 |
| 4 | 5.5.4 design-notes (RW-7/8) | docs/_backlog/5.5.4-design-notes.md | 285 |
| 5 | 잔존 KI (KI-23~27) | docs/_backlog/known-issues.md | 1063 |
| 6 | V1 마감 보고 §5 known gaps | docs/_backlog/v1-closure-report.md | 146 |
| + | 운영 메모리 V2 후보 | (Claude.ai 프로젝트 메모리 직접 참조) | — |

총 V2 후보 raw 추출: 32건 → 제외 3건 (§7) = **유지 29건**

## §3. 표본 한계

본 정렬의 사용자 표본은 **같은 회사 인원 2명 (김민성, 김은수)** 만
포함된다. 다른 회사 표본은 0명이다. RW-D4y-3 / RW-D4z-4 carryover 로,
V2 우선순위 결정 자료로서 일반화 가능성은 제한된다. 향후 다른 회사
표본 1~2명을 추가하면 본 정렬은 재검토가 필요하다. 특히 G7 (분야
확장) 과 G6 (사용자 관계 / role 구조) 군집은 표본 부족 영향이 가장
크다.

## §4. 우선순위 차원 정의

정성 3단계 (high / medium / low) 를 사용한다. RW-D4z-2 에 따라 정량화
(1~5 점수) 는 표본 부족으로 신뢰도가 낮아 채택하지 않았다.

축:

- **가치**: 사용자 페인 해소도 + 출처 발화 강도
- **난이도**: 구현 복잡도 + 외부 의존성
- **검증 강도**: 표본 (2명) 내 발화 강도, 중복 검증 정도

종합 등급 부여 규칙:

- **high**: 가치 high & 검증 강도 medium 이상 & 난이도 medium 이하
- **medium**: 가치 medium 이상 & 검증 강도 low 이상
- **low**: 가치 low 또는 검증 강도 매우 약함 (단일 발언, 본인 의심 등)

## §5. V2 차원 그룹화 (G1~G7) + 군집 우선순위

| 군집 | 포함 후보 (요약) | 군집 우선순위 | 한 줄 근거 |
|---|---|---|---|
| **G1. 사진 업로드 UX 강화** (V1 web 즉시 보강) | B-1 ×7 + B-2 + B-3-2 + D-2 | medium | 군집 두께, V1 직접 보강 |
| **G2. Mobile (Expo) 트랙** (V1 정의 #2~4 진입) | D-1 + E-2 + E-3 + A-3-1 | **high** | V1 정의 미진입 항목 = V2 핵심 |
| **G3. 출력 / 분류 다양화** | A-3-2 + A-3-3 | **high** | 김은수 명시 발화, V1 엑셀 단일 해소 |
| **G4. 워크플로 자동화 확장** | A-2-2 + A-2-3 + E-4 | medium | 별 도메인 진입 |
| **G5. 인프라 / 운영 위생** | C-1 + C-4 + C-5 + B-3-1 + B-3-3 | low-medium | V2 multi-bucket 진입 조건부 |
| **G6. 사용자 관계 / role 구조** | A-1-1 + A-1-2 + E-1 | medium | 가설 단계 |
| **G7. 분야 확장** | A-2-1 + A-2-4 | low | 표본 부족 |

## §6. V2 후보 표 (29건)

| ID | 출처 | 한 줄 | 인용 (출처 + line) | 우선순위 | 군집 |
|---|---|---|---|---|---|
| A-1-1 | 인터뷰 01 | 작업자 점진적 lock-in onboarding 전략 | "점진적으로 우리 앱에 lock in 되어야 가능할 듯" (line 22-23) | medium | G6 |
| A-1-2 | 인터뷰 01 | [후보?] follow-up 가능 가치 (담당자 추적 + 실시간 조회) | "(a) 누가 이 일을 맡고 있는지 follow-up… (b) 실시간으로 보고 없이도 조회 가능" (line 44-46); 본인 의심 "정말 pain point와 상관이 있을지 의문" (line 48) | low | G6 |
| A-2-1 | 인터뷰 02 | 업체 회신 (업체→원청 사진 receive) | "회신 해주는 업체가 매우 드물다… 바라지도 않음" (line 17-18, 47) | low | G7 |
| A-2-2 | 인터뷰 02 | 입주자 사전 점검 (입사전) 모드 | "사진대지를 자동으로 만들어주고, 폴더를 만들어주고, 업체에게 뿌리게끔" (line 73-76) | medium | G4 |
| A-2-3 | 인터뷰 02 | 자동 절대 공정표 / 작업자 생산성 DB / D-DAY 계산 | "떠오른 아이디어 — 절대 공정표 (V2+)" (line 79-97, 명시적 V2+ 표기) | medium | G4 |
| A-2-4 | 인터뷰 02 | 소음 측정 사진 / 제조업 분야 확장 | "여러 분야에서(현장이 있는 제조업 등) 많이 쓰일 수도" (line 99-105) | low | G7 |
| A-3-1 | 인터뷰 03 | 자동 현장 위치 인식 (현장 도식도 학습 + GPS) | "내가 구현하다가 잠시 미뤘는데" (line 82-104, 본인 deferral 명시) | medium | G2 |
| A-3-2 | 인터뷰 03 | 출력 채널 다양화 (HTML 포스터 / 앱 내 뷰) | "꼭 엑셀 자료일 필요는 없지… 포스터 형식" (line 112-120, 191-193) | **high** | G3 |
| A-3-3 | 인터뷰 03 | 분류 축 다양화 (위치별 / 공종별) | "위치별로 주로 정리, 공종별로도 정리" (line 189-190) | medium | G3 |
| B-1-1 | design-notes §2 | 사진 업로드 다중 파일 | "다중 파일… → V2 백로그" (line 51) | medium | G1 |
| B-1-2 | design-notes §2 | progress bar | line 51 | medium | G1 |
| B-1-3 | design-notes §2 | retry 로직 | line 51 | medium | G1 |
| B-1-4 | design-notes §2 | 강화 validation | line 51 | medium | G1 |
| B-1-5 | design-notes §2 | photos 컬럼 확장 (단일 → 다중, 스키마 변경) | line 51 | medium | G1 |
| B-1-6 | design-notes §2 | 사진 압축 | line 51 | low | G1 |
| B-1-7 | design-notes §2 | thumbnail 생성 | line 51 | low | G1 |
| B-2 | design-notes §3 | orphan cleanup job (storage + DB 정합) | "V2 cleanup job 백로그" (line 96) | medium | G1 |
| B-3-1 | design-notes §6 RW-6 | lib/supabase/client.ts 제거 결정 | "PhotoUploadForm 외 미사용 시 제거는 V2 결정" (line 151) | low | G5 |
| B-3-2 | design-notes §6 RW-7 | signed URL 재발급 액션 | "signed URL 60s 만료 \| V2 (재발급 액션)" (line 152) | medium | G1 |
| B-3-3 | design-notes §6 RW-8 | [후보?] middleware session refresh stale 대응 | "일반 시나리오 안전. V1 무대응" (line 153) | low | G5 |
| C-1 | KI-23 | 다중 개발자 환경 동기화 정책 (.env.example 갱신 + key rotate 가이드) | "V2 multi-developer 진입 시 환경 동기화 정책 필수" (line 823) | low | G5 |
| C-4 | KI-26 | storage 권한 모델 재평가 (admin role 위임 / Management API) | "V2 다중 bucket 또는 storage 직접 SQL 접근 케이스 진입 시 재평가 필수" (line 925, 930) | medium | G5 |
| C-5 | KI-27 | 다중 bucket 신설 시 RLS policy template 의무화 | "V2 다중 bucket 진입 시 RLS policy 작성 의무 명시 필수" (line 970-974) | medium | G5 |
| D-1 | v1-closure-report §5 | Mobile (Expo) UX 트랙 결정 (촬영 / 태그 / 갤러리 동기화) | "Mobile (Expo) 미진입… V1.1 또는 V2 트랙" (§5 known gaps, §7 권장 사항) | **high** | G2 |
| D-2 | v1-closure-report §5 | content_text 자동완성 / 최근 10개 UX | "content_text 자동완성 / 최근 10개 UX 미진입" (§5) | medium | G1 |
| E-1 | 운영 메모리 | 3-party role 강화 (관리자 / 담당자 외 제3자) | (메모리 직접 참조) | medium | G6 |
| E-2 | 운영 메모리 | 작업 템플릿 (work order templates) | (메모리) | medium | G2 |
| E-3 | 운영 메모리 | 주기적 알람 사진 점검 (periodic alarm-based photo check-ins) | (메모리) | medium | G2 |
| E-4 | 운영 메모리 | 공사 일정 관리 (construction schedule management) | (메모리) | medium | G4 |

분포: high 2 / medium 19 / low 8 = **29건 ✓**

## §7. 제외 / 유보 후보

### 제외 (V2 백로그 범위 외, 3건)

| 출처 | 사유 |
|---|---|
| HPMS 보충작업사전승인 연동 (인터뷰 03 line 167-181) | v1-closure-report §6 명시 기각 ("acspc 영역 밖") |
| KI-24 .gitignore .bak / .env.local.bak.* 패턴 보강 (line 829-866) | "V1 후반 정리 chunk" 명시 = D chunk (KI 누적 정리) 대상 |
| KI-25 domain-model.md 경로 표기 정정 (line 868-896) | 동상 (D chunk 대상) |

### 유보 (모호, 2건, §6 표에서 [후보?] 태그 보존)

- A-1-2 follow-up 가치 — 김민성 본인 의심 발언 (line 48), 검증 강도
  매우 약함
- B-3-3 middleware refresh stale — V1 "일반 시나리오 안전" 명시되나
  RW 잔존

## §8. 후속 조치

- **V2 사양서 (V2 정의 + 출시 범위)** 는 별 작업이다. 본 문서는
  candidate 정렬만 담당하며, 어느 후보가 V2 진입하는지의 결정은 별
  turn 이다.
- **G2 Mobile (Expo) 트랙 = high 군집**. 별 의사결정 turn 필요 (V1.5
  vs V2 vs 후속 V3 트랙 분리, mobile 진입 시점 결정).
- **G3 출력 / 분류 다양화 = high 군집**. 첫 V2 chunk 강 후보. 김은수
  명시 발화 + V1 엑셀 단일 의존 해소 가치.
- **G1 사진 업로드 UX 강화** = 군집 두께 (10건). V1 web 직접 보강
  chunk 다발 가능. 다만 김민성 / 김은수 명시 발화 미확인, 사용 검증
  진행 후 우선순위 재평가 가능.
- **G5 인프라 / 운영 위생** = V2 multi-bucket 진입 조건부 발동. 진입
  전 무대응 가능 (KI-26 / 27 명시).
- **새 인터뷰 / 새 표본 추가** 시 본 정렬 재검토 권장. 특히 다른 회사
  표본 추가 시 G6 / G7 영향 큼.
- **본 정찰 미포함 보조 출처**:
  - docs/00_strategy.md, docs/01_v1_product_definition.md §4 V1 비포함,
    docs/02_pain_points_analysis.md, docs/_backlog/minor-fixes.md,
    docs/_backlog/phase-5.5-decomposition.md
  - 별 chunk 시 5~10개 추가 후보 확장 가능 (RW-D4z-1 압축 결과)
- 본 정렬은 D-4z 시점 (HEAD `4755c1f`) 의 스냅샷이다. V1 본문 / KI /
  인터뷰 / 메모리 갱신 시 재정렬 권장.
