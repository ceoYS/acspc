# Handoff D-4v → D-4w (D-4v 집 PC 종결)

GitHub: https://github.com/ceoYS/acspc

## 1. D-4v 진도
HEAD: 3873e5d (5.5.3) + 09569ad (KI-29) + 본 handoff. V1 ~94% → ~96%.
- 5.5.3 page 분리 + auth gate, Gate 2 통과 ✅
- KI-29 등재 ✅ (git mv 후 explicit add 대상 산정)
- 부수: pre-commit hook = turbo check-types 자동 실행

## 2. 환경 전제 (D-4w)
- PC: **회사 PC 권장** (5.5.2 + 5.5.4 일괄)
- preamble (KI-28): 회사 PC = `NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"`
- 경로 `~/work/acspc`, Node v22.22.2
- KI-16: `git pull` (3건) + `pnpm install` (lockfile 변동 시)

## 3. 다음 스펙 — 5.5.2 → 5.5.4 (V1 종결)
5.5.2 (회사 PC, production DB):
- 0004/0005 migration apply + RLS 5종 + storage 검증 + KI-22 GRANT 4개 적용

5.5.4 (V1 종결 카드):
- server action 신설 (storage upload + photos INSERT + storage_path 정합)
- PhotoUploadForm client → server action 전환 (props 도입)

## 4. 잠재 위험
- 0004/0005 rollback 안전 (nullable + GRANT 추가만)
- 5.5.4 = PhotoUploadForm rename 후 첫 props 변경
- RLS read 격리 5.5.3 부수 통과 → INSERT/storage 별도 검증

## 5. 시작 가이드
raw: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4v-to-d4w.md

첫 PROMPT 초안:

---
이 프로젝트는 acspc Claude Code 프롬프트 설계 전용 대화창입니다.
D-4v 종결 (5.5.3 + KI-29). HEAD = D-4w 시작 시 `git log -3` 확정. V1 ~96%. 5.5.2 회사 PC 필수, 5.5.4 = V1 종결.
handoff: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4v-to-d4w.md
즉시 액션:
1. KI-28 preamble (회사 PC cert 포함)
2. KI-16 git pull (3건) + pnpm install
3. KI-23 .env.local 확인
4. 5.5.2 진입
handoff 요약 보고 후 "D-4w Planner 본 턴 시작" 대기.
---
