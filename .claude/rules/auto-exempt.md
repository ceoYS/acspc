# Auto-exempt — Evaluator / Gate 2 면제 조건

**신설**: D-4u (A안). KI-28 등재 6단계 절차 비대 회수.

## 면제 조건 (AND, 모두 충족)

1. 단일 파일 변경 (수정 또는 신설)
2. 경로: `docs/`, `.claude/rules/`, `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `README*.md` 중 하나
3. 확장자: `.md` 만
4. 변경량: 50 줄 미만 (insertions + deletions)
5. 런타임 무관 (빌드 / dev server / 테스트 영향 없음)
6. 의존성·설정 미변경 (package.json, tsconfig*, *.config.*, pnpm-workspace.yaml 등)

## 면제 효과

- Evaluator 별도 검토 turn 생략
- Gate 2 명시 승인 생략
- PROMPT 헤더에 `Auto-exempt: docs-only single file <50 lines ✅` 1줄 boilerplate
- commit + push 동일 PROMPT 진행 가능

## 의무 사항

- 금지사항 섹션 유지 (auto-exempt 무관, 항상 필수)
- STOP 룰 유지
- 변경량 50 이상 시 즉시 정식 절차 복귀

## 면제 거부 (정식 절차 적용)

복수 파일 / 코드 변경 (.ts/.tsx/.js/.jsx/.json/.yml) / 50줄 이상 / 설정 파일 / 환경 변수·preamble 변경 / 의존성 추가·제거 중 1개라도 해당.

## 자기참조

본 룰 자체 변경도 조건 충족 시 auto-exempt 적용. 사고 발생 시 폐기 또는 조건 강화.
