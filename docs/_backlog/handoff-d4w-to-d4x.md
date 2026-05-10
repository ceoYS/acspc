# Handoff D-4w → D-4x (D-4w 집 PC 종결)

GitHub: https://github.com/ceoYS/acspc

## 1. D-4w 진도

HEAD: f297896 (5.5.4 design-notes 등재). V1 ~96% 유지 (docs-only).

- 5.5.4 V1 종결 카드 사전 설계 완료 ✅
- 산출물: `docs/_backlog/5.5.4-design-notes.md` (Claude Code 본 작업 PROMPT §7 포함)
- Gate 2 면제 근거: docs-only 단일 파일

## 2. 환경 전제 (D-4x)

- PC: **회사 PC 필수** (5.5.2 = production DB apply 의존)
- preamble (KI-28): `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
- 경로 `~/work/acspc`, Node v22.22.2
- KI-16: `git pull` (1건 = f297896 가져오기). lockfile 변동 없을 가능성 높음 → `pnpm install` 생략 가능

## 3. 다음 스펙 — 5.5.2 → 5.5.4 (V1 종결)

5.5.2 (회사 PC, production DB):
- migration 0004/0005 apply
- RLS 5종 검증
- KI-22 GRANT 4개 적용
- storage 검증

5.5.4 (5.5.2 직후):
- design-notes §7 PROMPT 그대로 Claude Code 투입
- Step 1~3 + Gate 2 검증 5종
- commit 1개 + push (Gate 2 통과 후)

## 4. 잠재 위험

- D-4v→D-4w handoff 와 동일 항목 + design-notes §6 RW-1~RW-8 참조
- RW-2 (5.5.2 미적용 상태에서 5.5.4 진입 시 INSERT runtime 실패) — 순서 절대 준수
- 5.5.4 = PhotoUploadForm rename 후 첫 props 변경 — 회귀 주의

## 5. 시작 가이드

handoff raw: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4w-to-d4x.md
design-notes raw: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/5.5.4-design-notes.md

첫 PROMPT 초안:

---
이 프로젝트는 acspc Claude Code 프롬프트 설계 전용 대화창입니다.
D-4w 종결 (5.5.4 design-notes 등재). HEAD = D-4x 시작 시 `git log -3` 확정. V1 ~96%. 회사 PC 필수, 5.5.2 → 5.5.4 = V1 종결.

handoff: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4w-to-d4x.md
design-notes: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/5.5.4-design-notes.md

즉시 액션:
1. KI-28 preamble (회사 PC cert 포함)
2. KI-16 git pull (1건) + pnpm install (lockfile 변동 시만)
3. KI-23 .env.local 확인
4. 5.5.2 진입 (production DB 0004/0005 apply + RLS 5종 + KI-22 GRANT 4개)
5. 5.5.2 완료 후 design-notes §7 PROMPT 로 5.5.4 진입 (Step 1~3 + Gate 2)

handoff + design-notes 요약 보고 후 "D-4x Planner 본 턴 시작" 대기.
---
