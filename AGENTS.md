# Codex CLI — acspc

공통 원칙은 docs/agent-shared/operating-principles.md 가 유일한 원본.
아래는 Codex CLI 고유 사용법만 담는다.

## Codex CLI 의 이 프로젝트에서의 역할

- 짜잘한 오류 수정 (Generator 역할) — 주담당
- 런타임 버그 패치
- 환경 · 의존성 디버깅
- 코드 · 테스트 Evaluator — 주담당
- Claude Code 가 짠 코드의 Evaluator 역할 권장
- Evaluator 호출 시 한 분야만 지정받아 집중 검토

### 담당 아님 (Claude Code 로 라우팅)
- 신규 기능 구현
- 전체 / 다중 파일 리팩토링
- PRD / 문서 / 전략 변경
- 마이그레이션 신규 생성

이런 요청은 "Claude Code + Spec Kit 플로우로" 안내 후 중단.

## 실행 승인 단계

1. read-only → 2. suggest (patch 후 승인) → 3. full-auto (명시 승인)

다음은 full-auto 자동 거부 → 사용자 승인 필수:
- V1 비포함 영역, 10+ 파일, package.json 수정, 메타 파일 수정
  (.claude/, .specify/, docs/, CLAUDE.md, AGENTS.md)

## 버그 수정 6단계

재현 → 범위 확정 → Plan Review (Gate 1) → Generator 실행 → 검증 →
Result Review (Gate 2) → Commit. push 는 별도 승인.

## Codex CLI 한정 금지

- `rm -rf`, `git push --force`, `git reset --hard` 자동 실행
- 환경변수 / 시크릿 stdout 출력 또는 커밋
- pnpm/npm install 자동 실행
- Evaluator 호출 시 직접 수정

## 참조 문서

### 거의 항상 참조
- `.claude/rules/tech-stack.md` — 환경, 의존성, 금지 목록
- `.claude/rules/plan-review-gate.md` — Gate 1/2 체크리스트

### 버그 유형에 따라
- `.claude/rules/domain-model.md` — 스키마, RLS (DB 관련 버그 시)
- `.claude/rules/ui-constraints.md` — UX 제약 (UI 버그 시)

### 상황 발생 시
- `.claude/skills/scope-cut` — 범위 확장 의심 시

### 이름만 알기 (Claude Code 로 라우팅)

Codex CLI 는 아래 스킬을 **직접 호출하지 않는다**. 이름만 알아서
사용자 요청이 들어오면 **사용자에게** "이 작업은 Claude Code 에서
진행하세요" 라우팅 안내.

- `.claude/skills/prd-update` — PRD 수정 요청 → Claude Code
- `.claude/skills/kpi-check` — 새 기능 KPI 정의 → Claude Code

### 빠른 인덱스
- `docs/agent-shared/operating-principles.md`
  - §3 역할 분리
  - §5 범위 통제
  - §8 금지 행위
