---
name: kpi-check
description: Use this skill when any new feature or scope addition is proposed. Triggers in Korean or English on phrases like "add feature X", "기능 추가", "이거 구현하자", "새로 만들자", "implement Y", "we should also", or when a scope-cut classification of P0 or P1 is made. Also runs when Spec Kit `/speckit-specify` produces a new spec draft (Step 5+), or when the user explicitly requests KPI definition, review, or update. Enforces measurable KPI, baseline, target with timeframe, and connection path to the primary metric (weekly excel generation count 0→3). Not for routine bug fixes, refactoring, or UI polish within existing features.
---

# KPI Check Skill

> 한글 본문, 영문 description (Claude Code 스킬 관례).

## Purpose

새 기능 제안 시 "이 기능의 KPI 는 무엇인가" 를 강제한다. 룰북 V.5 §3
"지표 중심 작성 원칙" 의 실행 가능 형태.

scope-cut 과의 역할 분담:
- **scope-cut**: V1 에 넣을지 말지 판단 (범위)
- **kpi-check**: 넣기로 한 기능의 지표가 제대로 정의됐는지 (품질)

## 발동 시점

다음 중 하나 발생 시:
1. 새 기능 제안 (scope-cut 결과 P0 또는 P1 분류)
2. PRD 개정 중 새 기능 설명 추가 감지 (docs/01 §2 확장 등)
3. Spec Kit `/speckit-specify` 호출 시 spec 초안 검증 (Step 5 이후)
4. 사용자가 KPI 정의·검토·업데이트를 직접 요청
   (예: "이 기능 KPI 설정해줘", "주지표 연결 확인해줘")

## Checklist — 4개 질문 (모두 필수)

### 1. KPI 이름 (측정 가능한 숫자)

- "사용자 만족도", "편의성" 등 감상 표현 거부
- "주당 촬영 사진 수", "엑셀 생성 완료 시간 (분)" 등 구체 수치만 허용

거부 시:

```
KPI 이름이 측정 불가능. 구체 수치 지표로 재정의 필요.
예 거부: "사용자가 더 편하게 느낌"
예 허용: "태그 입력 시간 (초)", "주간 엑셀 생성 건수"
```

### 2. Baseline (현재 수치 또는 측정 불가 이유)

현재 프로세스 또는 앱 도입 전 기준값. 다음 중 하나 답변:

**(가) 구체 숫자**
예: "수동 분류 시 주간 야근 10시간"

**(나) "측정 불가" + 수용 가능한 이유**

수용 가능한 3가지 유형:
- **기존 프로세스 부재**: "이 기능이 대체할 기존 수동 방식이 없음
  (신규 유입 대상)" → V1 출시 후 실측 baseline 설정 필수
- **측정 인프라 부재**: "현재 앱에 측정 이벤트 없음" → 측정 이벤트
  추가 이후 재판정
- **대상 사용자 미확보**: "Design Partner 3곳 미확보" → 파트너 확보
  후 실측

위 세 유형 외의 "측정 불가" 는 거부. 예: "그냥 측정 어려워요" 같은
성의 없는 답변.

"측정 불가" 로 통과된 기능은 `docs/_backlog/kpi_pending.md` 에 기록.
6개월마다 재검토 (선택적 경미 개선).

### 2.1 kpi_pending.md 기록 흐름

"측정 불가" 통과 시:

1. AI 가 대화창에 append 초안 제시:

```
## [YYYYMMDD] [기능명]
- KPI: [이름]
- Baseline 측정 불가 이유: [기존 프로세스 부재 / 측정 인프라 부재 / 대상 사용자 미확보 중 하나]
- 재검토 예정: [측정 가능 조건]
```

2. 사용자 승인 대기
3. 승인 시 Gate 1-A-mini 통과 → kpi_pending.md 에 append → Gate 2 → 커밋

AI 는 직접 파일 수정 금지. 승인 후 Generator 가 쓴다.

### 3. Target (목표 수치 + 시간 기준)

변화의 방향과 크기 + 측정 기간:

- 감소 목표: "주간 야근 10시간 → 5시간 (8주)"
- 증가 목표: "주간 엑셀 생성 0건 → 3건 (8주)"
- 유지 목표: "앱 콜드 스타트 3초 이하 유지 (V1 출시 시)"

**시간 기준 미명시 시 자동 보완**:
- docs/01 §5.1 기본 기준 **8주** 자동 제안
- 사용자가 명시적으로 다른 기간 지정 가능
- "빨리", "곧" 등 모호 표현만 거부

### 4. 주지표 연결 경로 (필수)

현재 주지표 (docs/01 §5.1): **주간 사진대지 엑셀 생성 건수 0 → 3**.

제안 기능이 주지표에 어떻게 기여하는지 한 문장 답변:

**직접 기여 (높음)**: 엑셀 생성 빈도 또는 속도를 직접 증가
  예: "엑셀 생성 시간 단축 → 주 3회 이상 생성 부담 감소"

**간접 기여 (중간)**: 엑셀 생성의 전제 조건 개선
  예: "태그 입력 속도 개선 → 촬영 부담 감소 → 엑셀 원본 데이터 증가"

**무관 (낮음)**: 주지표와 연결 없음 → **즉시 중단 및 사용자 선택**:

```
주지표 연결 없음 감지.
기능: [요약]

V1 범위 부적합 의심. 다음 중 선택:
(a) scope-cut 스킬로 재분류 (P2/P3 로 이동)
(b) 주지표 재정의 (docs/01 §5.1 수정, prd-update 스킬 발동)
(c) 이 제안 폐기
```

답변 받을 때까지 kpi-check 중단. Gate 1 진입 불가.

## 출력 포맷

### 질문 시 (4개 답변 수집 중)

```
kpi-check 스킬 발동.

기능 제안: [요약]

다음 질문에 답변 필요:
- [ ] (1) KPI 이름 (측정 가능한 숫자)
- [ ] (2) Baseline (현재 수치 또는 측정 불가 이유 유형)
- [ ] (3) Target (목표 수치 + 시간 기준)
- [ ] (4) 주지표 연결 경로 (직접·간접·무관)

4개 모두 답변 후 기능 제안 계속 진행 가능.
```

### 통과 시

```
kpi-check PASS.

기능: [요약]
- KPI: [이름]
- Baseline: [값 또는 "측정 불가 - 이유 유형"]
- Target: [값 + 기간]
- 주지표 연결: [직접/간접 + 경로 1문장]

Gate 1 진입 가능.
```

## Skill 비활성화 조건

- 현재 대화의 사용자 메시지에 "kpi-check 스킵" 명시 지시
- 기존 기능의 버그 수정 / 리팩터링 / UI 폴리싱 (기능 변경 없음)
- scope-cut 결과 P2 / P3 로 분류 (V1 범위 외, kpi-check 대상 아님)

## 이 스킬의 한계

- KPI 의 **달성 가능성** 은 검증하지 않음 (가능성은 Planner·인간 판단)
- Baseline 이 측정 가능하게 된 이후의 재검증은 수동 (kpi-check
  재실행 필요). `docs/_backlog/kpi_pending.md` 주기적 점검 권장.

## 참조

- docs/01_v1_product_definition.md §5 (주지표·보조지표·기술 제약)
- docs/00_strategy.md §8 (North Star 정의)
- docs/_reference/planning_rulebook_v5.pdf §3 (지표 중심 작성)
- .claude/skills/scope-cut (P0/P1 분류 후 이 스킬로 넘어감)
- .claude/skills/prd-update (주지표 재정의 시 발동)
