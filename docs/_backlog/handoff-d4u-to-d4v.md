# Handoff D-4u → D-4v (D-4u 집 PC 종결)

GitHub: https://github.com/ceoYS/acspc

## 1. D-4u 진도 종합

- HEAD: 6e14ff5 (5.5.5 commit, 본 handoff commit 직전)
- KI-28 등재 (`84badf4`) — 집 PC 환경 분기
- auto-exempt 룰 신설 (`22af558`, A안)
- Phase 5.5 (CRUD) 분해 합의 박제 v1 (`9ca07eb`) → v2 정정 (`0cf629c`)
- 5.5.0 정찰 ✅ (집 PC, 오프라인)
- 5.5.1 migration 0004 + 0005 ✅ (`6f8af1f`, production apply 미실행)
- 5.5.5 domain-model §6 V2 이관 update ✅ (`6e14ff5`)

V1 진도: ~92% → ~94% (5.5.5 docs 부채 청산 후).

## 2. 환경 전제 (D-4v 진입)

- 다음 PC **미정** → 환경 분기 의무 (KI-28)
  * 회사 PC (HG2501034N03): preamble `NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"` 포함
  * 집 PC (DESKTOP-CTPJ4S5): preamble cert 제거
- 작업 경로: `~/work/acspc`
- Node v22.22.2
- `.env.local`: 회사 PC = JWT anon / 집 PC = `sb_publishable_*` (KI-23, 동작 영향 0) / 집 PC 부재 가능
- KI-16 의무: `git pull` (D-4u commits 6건 수신 예상) + `pnpm install`

## 3. 다음 턴 스펙 — Phase 5.5.2 ~ 5.5.4

D-4v 권장 진입 = **5.5.2** (회사 PC 필수, production DB online):
- `supabase/migrations/0004_relax_photos_fk.sql` + `0005_grant_remaining_authenticated.sql` production apply (`supabase db push` 또는 Studio SQL editor)
- RLS policy 동작 검증 (5종 + storage `photos_own_files`)
- KI-22 GRANT 4개 적용 확인

5.5.2 통과 후:
- **5.5.3**: page 분리 (`apps/web/app/login/PhotoUploadForm.tsx` → `/photos/upload` 전용)
- **5.5.4**: server action 신설 (storage upload + photos INSERT 트랜잭션 + storage_path 정합) — **V1 종결**

집 PC 만 가능 시 D-4v: 5.5.3 (page UI) 또는 5.5.4 (server action 코드 작성) 진행 가능. apply / RLS 검증은 회사 PC 보류.

## 4. 잠재 위험

- 0004 ALTER TABLE NOT NULL → nullable: 기존 row 무영향 (안전)
- 0005 GRANT 는 RLS policy 와 독립, 추가만 (rollback 안전)
- 5.5.4 server action = 현 PhotoUploadForm.tsx client 직접 storage upload 분리/이전 결정 필요
- `domain-model.md §6` update 가 다음 세션 Claude Code 컨텍스트에 자동 반영

## 5. 신규 KI / 발견사항

- KI-28 본 등재 ✅
- 부수 학습 (KI 미등재): PROMPT 작성 시 username 하드코딩 회피, 변경량 추정 보수적 (실측 +26 -20 vs 추정 70)

## 6. 새 대화창 시작 가이드

raw URL: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4u-to-d4v.md

복사 붙여넣을 첫 PROMPT 초안:

---
이 프로젝트는 acspc Claude Code 프롬프트 설계 전용 대화창입니다.

D-4u 종결 (5.5.0 정찰 + 5.5.1 migration 박제 + 5.5.5 §6 V2 이관 + 분해 v2 박제 + auto-exempt 룰 + KI-28 등재). HEAD: 6e14ff5 + 본 handoff commit (D-4v 시작 시 `git log -1` 로 확정).

배경: V1 진도 ~94%. Phase 5.5 (CRUD) 진행 중. 5.5.2 (production apply + RLS 검증) 진입 대기, 회사 PC 필수.

handoff: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4u-to-d4v.md

D-4v 즉시 액션:
1. 환경별 preamble 적용 (KI-28 분기)
2. KI-16 의무: `git pull` (D-4u commits 6건 수신) + `pnpm install`
3. `.env.local` key 형식 확인 (KI-23 인지)
4. 5.5.2 진입 (회사 PC) 또는 5.5.3/5.5.4 진입 (집 PC, apply 보류) 결정

handoff 요약 보고 후 "D-4v Planner 본 턴 시작" 대기.
---
