# Operating Principles — Shared Across AI Agents

모든 AI 세션은 이 문서를 먼저 읽는다. CLAUDE.md / AGENTS.md 는 에이전트
고유 사용법만 담고, 공통 원칙은 이 파일이 유일한 원본이다.

## 1. 제품 한 줄

원청사 수행팀 매니저가 촬영 전 위치·공종·내용·업체를 드롭다운 선택하고
연속 촬영하면, 갤러리에 위치별 폴더 저장 + 업체별 사진대지 엑셀 자동
생성. 퇴근 후 야근 0분.

## 2. 문서 우선순위 (충돌 시)

1. 이 문서 (공통 원칙, 유일한 원본)
2. CLAUDE.md / AGENTS.md (에이전트 고유 사용법만)
3. docs/00_strategy.md
4. docs/01_v1_product_definition.md
5. docs/02_pain_points_analysis.md
6. .claude/rules/* (기계 가드레일: tech-stack, plan-review-gate 등)
7. docs/interviews/*.md
8. .specify/memory/constitution.md

.claude/rules/ 는 docs/0X 제품 판단의 하위 구현 규칙. 제품 판단 변경
시 rules 가 따라가며, 그 역은 금지.

## 3. 역할 분리

- Planner: 분해·축소·위험 점검. 코드·문서 작성 금지.
- Generator: 실제 구현 (신규 작성 + 수정 모두). 파일 생성·수정 가능.
- Evaluator: 산출물 검토. 피드백·대안 제시까지만. 직접 수정 금지.

### 3.1 루프 (인간 의사결정 노드 포함)

```
Planner 제안 → [Gate 1: 사용자 승인] → Generator 실행 + 테스트 실행
  → Evaluator {분야} 검토 (테스트 결과도 검토 대상)
  → [사용자: 피드백 수용 여부]
    → 수용: Generator 재실행
    → 거부: Evaluator 피드백 폐기
  → 반복 종료
→ [Gate 2: 사용자 승인] → 커밋
```

Gate 1 = Generator 실행 직전. Gate 2 = 커밋 직전. 둘 다 액션 직전 게이트.

**테스트 실행 역할**: Generator 가 단위/통합/수동 검증 실제 수행.
Evaluator 는 Generator 가 낸 결과를 검토할 뿐 직접 테스트 실행
하지 않음. 운영 세부는 .claude/rules/plan-review-gate.md 참조.

### 3.2 Evaluator 원칙 — 단일 분야 집중

한 호출에 하나의 분야만 지정. 분야 미지정 요청은 Evaluator 가 되물음.

표준 분야 목록: 제품 판단 / 프롬프트 설계 / 문서 구조 / 코드 로직 /
코드 보안 / 테스트 커버리지 / 성능 / UX.

### 3.3 Evaluator 발동 조건

다음 중 하나 이상 해당 시 Evaluator 필수:
- Generator 프롬프트에 install / build / network / deps 명령 포함
- 외부 의존성 추가 (npm / Expo SDK / fonts / Supabase client 등)
- 복수 파일 동시 생성 또는 설정 파일 (tsconfig, package.json, metro, tailwind.config) 수정
- 외부 API 경로 사용 시 실제 API 존재 여부 검증 필요 (예: zod v4 `.uuid()` 경로)
- 파일/설정 상속 (tsconfig extends, package.json devDeps 상속)
- 수치 검증 조건 (파일 수, 라인 수, 커밋 수) 사전 명기
- 이전 세션 이슈 패턴과 유사

Evaluator 면제 (사용자 명시 승인 시):
- docs-only 단일 파일 추가/편집
- 기존 파일 20줄 이하 수정
- backlog / handoff 기록

Evaluator 결과 심각도:
- 🔴 Critical (실행 시 100% 실패) - 수정 후 재투입 필수
- 🟠 High (부분 실패 / 롤백 가능성) - 수정 권장
- 🟡 Medium (Gate 누락 / 혼란 요인) - 검토
- 🟢 Low (스타일) - 선택

### 3.4 Evaluator 출력 경계

- 허용: 문제 위치 지적, 방향 제시, 3~4개 선택지 나열, 5줄 이하 예시 스니펫
- 금지: 완성된 교체본 작성, 5줄 초과 코드, 파일 섹션 전체 재작성, 다수
  파일 교차 수정 코드

"어디가 문제 + 어떤 방향" 까지. "완성된 교체본" 은 Generator 영역.

### 3.5 배분과 교차 검증 (기본값)

- Claude Code 가 Generator 로 쓴 코드 → Codex CLI 가 Evaluator (기본)
- Codex CLI 가 Generator 로 쓴 코드 → Claude Code 가 Evaluator (기본)
- 중요한 제품 판단 → 외부 AI 로 교차 검증 권장

**중요 변경**(교차 검증 필수): 10줄 이상 코드 변경 / 새 파일 생성 /
스키마 변경 / docs/0X_*.md 수정.

단순 변경은 같은 AI 가 Generator + Evaluator 겸할 수 있음.

### 3.6 역할 전환 신호

- "Planner 로" → 계획만.
- "Generator 로" → 실제 구현.
- "Evaluator 로 {분야}" → 해당 분야만 검토.

### 3.7 역할 조합 허용 규칙

기본값: 한 응답 = 한 역할.
예외: 사용자가 명시 요청 시 조합 허용 ("계획하고 바로 구현까지", "다 해줘").
단, 결과는 `## Planner 판단`, `## Generator 결과`, `## Evaluator 검토`
섹션으로 분리. 섹션 없이 뒤섞기는 금지.

## 4. 언제 상위 문서를 읽는가

- 신규 기능 / PRD: docs/00, 01
- 페인 / 범위 판단: docs/02
- 인터뷰 근거 확인: docs/interviews/
- **짜잘한 수정** (10줄 이하 / 한 함수 내부 / 타입·린트·오타): 본 파일과
  에이전트 진입점만으로 충분. 정의 벗어나면 상위 문서 필수.

## 5. 범위 통제

기본 흐름:
1. 요청 감지 시 즉시 중단 및 사용자 보고
2. docs/01 §4 비포함 목록과 충돌 여부 확인
3. P0 / P1 / P2 / P3 분류 제안
4. P0 아니면 V1 바깥으로 밀자 제안

분류 기준:
- P0: V1 핵심 6기능 완성 필수
- P1: V1 출시 후 첫 3개월 내
- P2: V2 이상
- P3: 분류 불가 또는 판단 근거 부족

**상세 감지 패턴·출력 형식·판정 기준은 .claude/skills/scope-cut
참조.** 이 문서는 요약만 보관.

## 6. 단일 진실 원본 우선순위

프로젝트 메모리 / 이전 대화 / 에이전트 기억보다 repo 문서 우선.
의심되면 repo 문서를 읽는다.

## 7. 문서 계층

- docs/interviews/ = 원문. 수정 금지.
- docs/0X_*.md = 전략·정의·해석.
- docs/agent-shared/ = 공통 원칙.
- .claude/rules/ = 구현 가드레일.
- .claude/skills/ = 반복 작업 자동화.
- .specify/ = Spec Kit 공식 구조.
- CLAUDE.md / AGENTS.md = 진입점.

## 8. 금지 행위

- 원문 인터뷰 수정
- 사용자 확인 없는 범위 확장
- 2-Gate 우회
- 이전 repo (ceoYS/site-ops) 파일 참조
- .claude/rules/tech-stack.md 바운더리 밖 도구 도입
- V1 비포함 기능을 "작은 추가" 로 밀어넣기
- 인간 승인 없는 repo 루트 새 최상위 폴더 생성
- Evaluator 호출 상태에서 직접 수정
- 5줄 초과 완성 코드를 Evaluator 가 제시
- 형용사·감상적 표현으로 지표 설명 대체 (예: "편리한 UX" → "입력
  시간 ≤ 2초" 로 작성)
- Evaluator 가 테스트·빌드·스크립트 직접 실행 (Generator 담당)

## 9. 작업 경로

- `~/work/acspc` (WSL 내부)
- Windows 경로 (/mnt/c, /mnt/d) 는 기준 작업본 아님
- git add/commit/push 는 이 경로에서만
