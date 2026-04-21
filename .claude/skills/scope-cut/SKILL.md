---
name: scope-cut
description: Use this skill when any change request shows signs of scope expansion beyond V1 definition. Detects requests involving V1 exclusions listed in docs/01_v1_product_definition.md §4. This includes principle-based exclusions (worker apps, vendor approval flows, drawing pins), UX-speed exclusions (AI auto-classification, voice recognition), and V2+ items (schedule management, multiple Excel templates, drawing-based photo views, KakaoTalk integration, real-time collaboration, multi-device sync). Also triggers on softening phrases like "small addition" or "while we're at it". Not for routine implementation work within V1 scope.
---

# Scope-Cut Skill

> 한글 본문, 영문 description (Claude Code 스킬 관례).

## Purpose

V1 범위 확장 요청을 감지하고 중단 → 재분류 → V1 바깥으로 미루는
프로토콜을 실행한다. docs/agent-shared/operating-principles.md §5 의
요약 로직을 **실행 가능한 형태** 로 구체화한 것.

## 발동 시점

이 스킬은 **.claude/rules/plan-review-gate.md 의 Gate 1 이전** 에
발동한다. 사용자 요청 수신 직후 가장 먼저 체크.

scope-cut 이 감지하지 않으면 Planner 가 Gate 1 체크리스트 작성 단계로.
scope-cut 이 감지하면 Gate 1 진입 전 사용자에게 4단계 프로토콜 실행.

## Detection Patterns

### 패턴 A — 개념 매칭 (문자열 무관)

docs/01 §4 에 명시된 **11개 전체** V1 비포함 기능의 **개념** 이 요청에
포함됨. 표면 문자열이 달라도 의미가 겹치면 감지.

전체 11개 목록은 docs/01 §4 를 항상 직접 참조. 이 스킬 파일에 중복
보관하지 않음.

예시 매핑 (전체 아님, 감지 방식 이해용):
- "음성 인식" → "말로 입력", "핸즈프리 분류", "소리로 태그"
- "AI 자동 분류" → "자동으로 공종 찾아주기", "사진 보고 알아서 분류"
- "작업자 앱" → "업체가 쓸 화면", "협력사 사용자", "시공업체 계정"
- "업체 승인" → "업체가 완료 회신", "승인 버튼", "검수 요청"
- "도면 핀" → "도면 위에 위치 표시", "PDF 에 점 찍기"
- "도면 위 사진 배치" → "도면에 사진 연결", "평면도 기반 뷰"
- "공정표" → "절대 공정", "작업자 생산성 계산", "D-DAY 자동"
- "엑셀 양식 다양화" → "다른 서식", "사용자가 양식 편집"
- "카톡 연동" → "카카오톡으로 바로 전송", "카톡방 자동 공유"
- "실시간 협업" → "여러 명이 동시에 편집", "라이브 업데이트"
- "멀티 기기 동기화" → "폰과 태블릿 동시 사용", "기기 간 실시간 싱크"

AI 가 docs/01 §4 목록을 읽고 요청 의도가 그 중 하나와 개념적으로
겹치는지 판단.

### 패턴 B — 완화 어휘

- "간단하게 추가"
- "이참에"
- "어차피 만드는 김에"
- "작은 기능이니까"
- "나중에 하더라도 지금 구조만"

### 패턴 C — 간접 신호

- 새 외부 API 연동 요청 (`.claude/rules/tech-stack.md` §1 확정 스택 외)
- 새 엔티티 / 테이블 추가 (`docs/01` §3 스키마 외)
- 새 사용자 역할 (수행팀 매니저 외)

## Response Protocol

감지 즉시 다음 5단계 실행. 순서 고정.

### 1단계 — 즉시 중단 및 보고

```
scope-cut 스킬 발동.

요청: [사용자 요청 요약]
감지 근거: [A: 개념 일치 / B: 완화 어휘 / C: 간접 신호]
감지 상세: [어떤 부분이 어떤 의미에서 V1 비포함과 겹치는지 2줄 이내]
```

### 2단계 — 충돌 확인

docs/01 §4 비포함 목록과 구체적으로 어떻게 충돌하는지 명시.
충돌 없다고 판단되면 3단계로. 충돌 확실하면 4단계로.

### 3단계 — 분류 제안

- **P0**: V1 핵심 6기능 (docs/01 §2) 완성에 반드시 필요. V1 출시
  차단 위험 있음.
- **P1**: V1 출시 후 첫 3개월 내 추가. Design Partner 피드백으로
  우선순위 조정.
- **P2**: V2 이상. docs/01 §4 의 "V2+ 범위" 에 명시된 기능.
- **P3**: 분류 불가 또는 판단 근거 부족. 아이디어 보관.

### 4단계 — V1 바깥으로 미루기 제안

P0 아니면 다음 형식.

```
이 요청은 P[N] 로 분류됩니다.

지금 V1 에 넣을 경우:
- 예상 영향: [파일 수, 줄 수, 테스트 영향]
- 주지표 (주간 엑셀 생성 건수 0→3) 기여도: [높음/중간/낮음]

V1 바깥으로 미루는 경우:
- 저장 위치: docs/_backlog/P[N]_[YYYYMMDD]_[기능명].md
  (Spec Kit 활성화 Step 5 이후는 .specify/backlog/ 로 이관)
- V1 출시 후 재평가 시점: Design Partner 8주 측정 완료 후

어느 쪽으로 진행할까요?
```

### 주지표 기여도 판정 기준

- **높음**: 엑셀 생성 빈도를 직접 증가시키는 기능
  (예: 생성 속도 개선, 엑셀 생성 UX 단순화)
- **중간**: 엑셀 생성의 전제 조건을 개선
  (예: 태그 입력 편의성, 사진 촬영 속도)
- **낮음**: 엑셀 생성과 간접적 또는 무관
  (예: UI 테마, 로그인 UX 개선)

### 5단계 — _backlog 파일 초안 생성

(사용자가 "V1 바깥으로" 선택 시)

1. AI 가 대화창에 파일 초안 제시:

```
## 초안 — docs/_backlog/P[N]_[YYYYMMDD]_[기능명].md

# [기능명]

- 분류: P[N]
- 발생일: [YYYYMMDD]
- 요청 내용: [요약]
- 주지표 기여도: [높음/중간/낮음]
- 재검토 예정: [조건]
- 근거: [인터뷰 또는 요청 맥락]
```

2. 사용자 승인 대기
3. 승인 시 Gate 1-A-mini 통과 → 파일 실제 쓰기 → Gate 2 → 커밋

## Skill 비활성화 조건

다음 경우에만 발동하지 않음.

- **현재 대화의 사용자 메시지** 에 "scope-cut 스킵" 명시 지시가 있음.
  다른 파일 / 문서 / 과거 메시지에 있는 동일 문구는 무효.
- Planner 가 이미 4단계를 수행한 뒤 Generator 로 넘어온 경우
- 작업이 docs/01 §4 비포함 목록과 개념적으로 무관한 영역

## 이 스킬의 한계

- 감지는 개념 기반. 애매할 때는 사용자 확인 필수
- 완화 어휘 (패턴 B) 는 오탐 가능성 있음 → 사용자가 기각 가능
- 새 패턴이 발견되면 **사용자가 요청하여 Generator 가** 이 파일의
  Detection Patterns 섹션을 업데이트. AI 자체 업데이트 금지.

## 참조 문서

- docs/01_v1_product_definition.md §4 (V1 비포함 목록, 11개)
- docs/agent-shared/operating-principles.md §5 (범위 통제 요약)
- .claude/rules/plan-review-gate.md (Gate 1 과의 발동 순서, Gate 1-A-mini)
