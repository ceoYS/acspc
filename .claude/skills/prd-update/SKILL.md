---
name: prd-update
description: Use this skill when the user requests modifications to PRD-level documents, specifically docs/00_strategy.md, docs/01_v1_product_definition.md, or docs/02_pain_points_analysis.md. Triggers in Korean or English on phrases like "update the strategy doc", "docs/00 수정", "modify docs/01 §N", "docs/01 고쳐줘", "add to pain points analysis", "revise V1 definition". Also runs when these files are edited as part of a larger change. Not for interview originals (docs/interviews/*) which are immutable, or for reference materials (docs/_reference/*).
---

# PRD Update Skill

> 한글 본문, 영문 description (Claude Code 스킬 관례).

## Purpose

PRD 성격 문서 (docs/00, 01, 02) 개정 시 체크리스트를 자동 실행하여
누락·모순·형용사 혼입·참조 깨짐을 방지한다. 룰북 V.5 §9
"형용사 사용 금지, 반드시 수치로 대체" 의 실행 가능 형태.

## 발동 범위

**적용 대상**:
- docs/00_strategy.md
- docs/01_v1_product_definition.md
- docs/02_pain_points_analysis.md

**적용 제외**:
- docs/interviews/* (원문, 수정 금지)
- docs/_reference/* (외부 참조 자료)
- docs/agent-shared/* (AI 협업 원칙, 별도 체크)

## 발동 시점 및 순서

PRD 수정 요청 감지 시 **Gate 1 에 선행하여 실행**.

```
PRD 수정 요청 → prd-update 체크리스트 실행
  → PASS: Planner 가 Gate 1-A 체크리스트 작성
  → ISSUE: 문제 해결 후 prd-update 재실행
→ Gate 1 승인 → Generator → ...
```

## Checklist

체크 6개. 모두 통과해야 Gate 1 진입 가능.

### 1. 상·하위 문서 정합성

- docs/00 변경 → docs/01, docs/02 에서 관련 섹션 찾아 영향 확인
- docs/01 변경 → docs/02 PP-NN 중 연관 항목 확인, docs/00 차별화 축·
  성공 정의와 충돌 없는지 확인
- docs/02 변경 → docs/01 §4 비포함 목록과 연계 PP 의 정합 확인

**모순 발견 시 사용자 선택 요청**:

```
모순 감지:
- 문서 A: [내용 인용]
- 문서 B: [내용 인용]

어떻게 처리할까요?
(a) 양쪽 이번 턴에 같이 업데이트
(b) 의도된 일시 모순, 다음 턴에서 정리
(c) 이 변경 취소
```

### 2. 인터뷰 근거 확인

새 주장·결정·페인 추가 시 docs/interviews/ 원문에서 근거 문장 인용
가능해야 함.

인용 불가 시 두 선택지:
- (a) 인터뷰 예정: docs/interviews/ 에 추가 예정 인터뷰 있음.
  해당 인터뷰 추가 후 이 변경 재실행.
- (b) 외부 근거: 경쟁사 조사·시장 자료 등 (docs/_reference/ 기반)

**근거 없는 가설 추가는 차단**. 가설이 필요하면 인터뷰 추가 후 근거
획득 필수.

### 3. 형용사·감상 표현 제거 (룰북 V.5 §9)

**판단 기준** (단어 목록이 아니라 개념 기준):
- 측정 불가능한 주관적 평가 표현
- 수치·구체 행동 없이 가치 평가만 하는 단어
- 한국어·영어 무관

**예시 (완전 목록 아님)**:
- 한국어: "편리한", "편한", "직관적인", "간편한", "혁신적인", "매력적인",
  "좋은", "최고의", "탁월한", "자연스러운", "완벽한"
- 영어: "elegant", "seamless", "intuitive", "beautiful", "powerful"
- 수치 없는 비교: "빠른", "느린" (수치 동반 시 허용)

발견 시 수치 대체 요청 (§출력 포맷 참조).

### 4. KPI 포맷 (kpi-check 연동)

KPI 섹션 (docs/00 §8, docs/01 §5) 변경 시 `.claude/skills/kpi-check`
스킬 자동 발동. 4개 질문 (이름·baseline·target·주지표 연결) 통과 필수.

중복 체크 피하기 위해 prd-update 는 kpi-check 결과를 참조만.

### 5. V1 비포함 목록 연동 (docs/01 §4)

docs/01 §4 의 항목이 추가·삭제·이동된 경우:
- prd-update 가 scope-cut 영향 알림 생성
- 사용자에게 "scope-cut 패턴 A 업데이트 필요" 알림
- **별도 Gate 1 로 scope-cut 개정 요청 권장** (prd-update 스킬이
  scope-cut 파일을 직접 수정하지 않음)

### 6. 참조 경로 유효성

섹션 번호 변경 시 다음 경로에서 참조를 스캔:
- `docs/` (자기 자신 외)
- `.claude/rules/`, `.claude/skills/`
- `CLAUDE.md`, `AGENTS.md`
- `docs/agent-shared/`

스캔 도구: grep 으로 `docs/0[0-9]` 또는 `§[0-9]` 패턴 검색.

stable anchor (`{#v1-exclusions}` 등) 가 있는 섹션은 앵커 유지 필수.

## 출력 포맷

체크 완료 후 Planner 에게 요약 전달.

### 통과 시

```
prd-update 스킬 실행 결과: PASS
- [1] 상·하위 정합성: PASS
- [2] 인터뷰 근거: PASS
- [3] 형용사 제거: PASS
- [4] KPI 포맷: PASS (또는 N/A)
- [5] 비포함 목록 연동: N/A
- [6] 참조 유효성: PASS

Gate 1 진입 가능.
```

### 이슈 있을 때

```
prd-update 스킬 실행 결과: ISSUE
- [1] 상·하위 정합성: ISSUE (docs/00 §8 과 docs/01 §5.1 불일치)
- [2] 인터뷰 근거: PASS
- [3] 형용사 제거: ISSUE ("편리한" 2회 감지 - L45, L78)
- [4] KPI 포맷: PASS
- [5] 비포함 목록 연동: ISSUE (scope-cut 업데이트 필요)
- [6] 참조 유효성: PASS

이슈 해결 후 prd-update 재실행 요청.
```

## Skill 비활성화 조건

- 현재 대화의 사용자 메시지에 "prd-update 스킵" 명시 지시
- docs/00, 01, 02 외 파일 변경 (적용 범위 밖)
- 단순 오타·줄바꿈 수정 (의미 변경 없음)

## 참조

- docs/00_strategy.md, docs/01_v1_product_definition.md,
  docs/02_pain_points_analysis.md
- docs/_reference/planning_rulebook_v5.pdf (룰북 V.5)
- docs/agent-shared/operating-principles.md §8 (형용사 금지)
- .claude/rules/plan-review-gate.md (Gate 1 선행)
- .claude/skills/scope-cut (비포함 목록 연동)
- .claude/skills/kpi-check (KPI 포맷 연동)
