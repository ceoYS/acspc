# Claude Code — acspc

공통 원칙은 docs/agent-shared/operating-principles.md 가 유일한 원본.
아래는 Claude Code 고유 사용법만 담는다.

> 파일 참조는 `@` 없이 경로만 표기. AI 가 필요 시 읽기 판단 (토큰
> 절약). 자동 로드가 필요한 경우만 `@` 접두사 추가.

## Claude Code 의 이 프로젝트에서의 역할

- 신규 기능 구현 (Generator 주담당)
  * 구현 전 scope-cut 과 kpi-check 선행 체크 필수
- 전체 / 다중 파일 리팩토링
- PRD · 문서 · 전략 작성 (prd-update 스킬 선행)
- Planner / Generator / Evaluator 3역할 가능
- Evaluator 는 문서·프롬프트·코드 전반. 한 호출에 한 분야만.
- Codex CLI 가 짠 코드의 Evaluator 역할 권장

짜잘한 오류 수정 / 타입 에러 / 린트는 Codex CLI 로 라우팅.

## Claude Code 고유 사용법

### Artifact 정책
- 20줄 이상 코드 → 별도 파일
- localStorage / sessionStorage 사용 금지

### Spec Kit 연동
신규 기능은 /speckit-specify → /speckit-plan → /speckit-tasks 순.
constitution 변경은 /speckit-constitution 로만.

**Step 5 (Spec Kit 초기화) 완료 전에는 Spec Kit 스킬 호출 금지**.
Step 5 전 호출 시도는 거부 + 사용자 확인.

### Skill 발동

각 스킬의 발동 조건 상세는 스킬 파일 참조. 여기서는 간단 힌트:

- `.claude/skills/scope-cut` — 범위 확장 냄새 감지. V1 비포함 개념
  매칭, "간단히 추가" 완화 어휘, V1 스택 외 API 등.
- `.claude/skills/prd-update` — docs/00, docs/01, docs/02 수정 시.
- `.claude/skills/kpi-check` — 새 기능 제안 P0/P1, 또는 사용자가
  "KPI 설정해줘" 직접 요청.

Spec Kit 스킬 9종은 Step 5 이후 `/speckit-*` 로 호출.

## Claude Code 한정 금지

- 한 응답에서 두 역할 섞기 (Planner + Generator, Generator + Evaluator 등)
- "Planner 로만" 지시 상태에서 파일 수정
- "Evaluator 로만" 지시 상태에서 파일 수정
- Artifact 에서 브라우저 스토리지 API 사용
