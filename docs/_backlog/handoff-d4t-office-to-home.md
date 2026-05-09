# Handoff — D-4t office → D-4t home (2026-05-08, Session 22 종결)

## 1. 현재 상태

- origin/main HEAD: `b0c8ab2`
- D-4s office (`8b2957b`) 이후 commits 2건:
  * `e6efa34` docs(backlog): handoff d4s-office-to-d4t (D-4s office 종결)
  * `b0c8ab2` docs(backlog): backfill KI-12~22 to known-issues.md (D-4o~D-4r 누락 일괄 회복)
- working tree: clean

## 2. D-4t office 진행 내역

- 환경 검증 + KI-16 의무 (git pull / pnpm install) 통과 (회사 PC HG2501034N03)
- 정찰: backlog 폴더 정책 (`_README.md`), KI 헤더 카운트 (KI-01~11), handoff 시리즈 grep
- **결정적 발견**: handoff 본문 명시 "KI-12~18 정식 등재" 약속 vs 실제 known-issues.md = KI-11 까지만 → 11건 (KI-12~22) 일괄 누락 부채 확정
- B.1.a 등재: KI-12~18 (7건, D-4o/D-4p 시리즈, +219줄)
- B.1.b 등재: KI-19~22 (4건, D-4q/D-4r 시리즈, +151줄)
- commit `b0c8ab2`: 1 file, 370 insertions(+). pre-commit hook (check-types) FULL TURBO PASS (3 cached, 79ms)
- push 정상 (회사 PC corp cert)
- B.1.c (KI-23~27, 5건) + B.2 (.gitignore) + C (Phase 5.5 분해) = 본 턴 미진입 → D-4t home 으로 이관

## 3. 환경 전제 (D-4t home = 집 PC 진입 시)

- 집 PC: sinabro@DESKTOP-CTPJ4S5
- 작업 경로: `~/work/acspc`
- preamble: `NODE_EXTRA_CA_CERTS` **제거** (집 PC corp cert 불필요)
- Node 버전: v22.22.2 (KI-16 의무 시 확인)
- `.env.local` key 형식: 집 PC = `sb_publishable_*` (신형) — KI-23 인지 (회사 PC JWT anon 과 형식 차이, 동작 영향 0)
- KI-16 의무: `git pull` (2 commits 수신) + `pnpm install` (lockfile 무변동, 빠름 예상)

## 4. 신규 KI / 발견사항

본 턴 신규 KI 미발견 (등재 작업이 본 턴 핵심).

KI-12~22 등재로 인한 부수 발견:
- handoff 본문 "정식 등재" 약속 vs 실제 commit 누락 = KI-15 (handoff 별도 chunk 의무) 의 변종 (= 등재 chunk 자체 누락). 본 턴이 그 부채 회복.

## 5. 방법론 교훈

- backlog 정찰 시 `_README.md` 정책 우선 확인 (scope-cut/kpi-check 스킬 vs 일반 docs 흐름 구분)
- handoff 본문 약속 ≠ 실제 commit. grep 헤더 카운트로 실측 검증 의무
- 등재 sub-chunk 분할 (B.1.a 7건 + B.1.b 4건) → 한 commit (`b0c8ab2`) 통합. 다음 chunk (B.1.c, 5건) 는 별 commit 권장
- KI-12 (메시지 길이) 적용: PROMPT 분할 + 정찰/평가/PROMPT 응답 분리
- KI-15 (handoff 별 chunk) 적용: 작업 commit (`b0c8ab2`) + handoff commit (다음) 분리
- Evaluator/Gate 2 면제: docs append-only, 코드/번들/환경 영향 0, 사용자 명시 승인 후 진행
- KI-22 본문 작성 시 보너스 섹션 (진단 메시지 구분: `permission denied for table` vs `new row violates RLS`) 추가 = handoff §4 교훈 보존 가치 인정

## 6. D-4t home 다음 턴 스펙

### 즉시 액션

1. KI-16 의무 (pull + install). 본 턴 commits 2건 수신 (`e6efa34` + `b0c8ab2`)
2. 집 PC `.env.local` 의 publishable key 형식 (`sb_publishable_*`) 확인 (KI-23 인지)
3. preamble 의 `NODE_EXTRA_CA_CERTS` 제거 확인 (회사 PC 패턴 잔존 여부 점검)

### 본 턴 잔여 작업 인계

**B.1.c — KI-23~27 등재 (5건, D-4s 시리즈)**
- KI-23: PC간 Supabase key 형식 불일치 (JWT anon vs sb_publishable_*)
- KI-24: `.gitignore` 의 `.bak`/`.env.local.bak.*` 패턴 부재
- KI-25: `domain-model.md` 위치 표기 오류 (handoff 명시 `docs/agent-shared/` vs 실제 `.claude/rules/`)
- KI-26: storage.objects revoke 미발동 (storage owner = supabase_storage_admin 추정)
- KI-27: anon role 도 storage.objects 7권한 보유 (V2 다중 bucket 시 RLS 의무 명시)
- 등재 형식: 5-section, B.1.a/b 와 동일
- 출처 handoff: `handoff-d4s-office-to-d4t.md` §4
- 검증: `wc -l` (예상 ~960~1010), `grep -c "^## KI-"` = 27

**B.2 — `.gitignore` `.env*.bak*` 패턴 추가**
- 위치: `# Environment` 섹션 끝
- 패턴: `.env*.bak*` 1줄 (KI-10 CI 시뮬 패턴 + `.env.local.bak.d4s` 모두 cover)
- Evaluator **필수** (설정 파일 수정)
- Gate 2 **필수** (환경 변경)

**C — Phase 5.5 (CRUD) Planner 분해 합의**
- V1 진도 ~92% → 5.5 가 본 턴의 진짜 가치
- 핵심 결정사항:
  1. **photos table FK 폭증 결정**: location_id/trade_id/vendor_id 도 FK. V1 에서 이 테이블들 동시 도입 vs photos 만 우선 (FK nullable)
  2. **Edge Function 도입**: domain-model.md §6 photo 삭제 = Edge Function 트랜잭션. V1 보류 vs V2 결정
  3. **storage_path 일치성 검증 위치**: client 생성 vs server action
- sub-chunk 분해 (5.5.0 정찰 → 5.5.1 photos table → 5.5.2 RLS/GRANT → 5.5.3 page 분리 → 5.5.4 INSERT/upload 트랜잭션)

## 7. 잠재 위험

- B.1.c 등재 시 KI-22 (RLS + GRANT) 와 KI-26 (storage.objects revoke 미발동) 의 cross-reference 일관성 — 등재 본문에 명시 권장
- B.2 (`.gitignore`) Evaluator 발동 시 blind spot: 패턴 자체는 단순, 다만 기존 `.env.local` 라인과 정합 확인 (`.env*.bak*` 가 `.env.local` 매칭 X 재확인)
- C (Phase 5.5) FK 폭증 결정이 5.5 chunk 분량 결정. thin slice 우선 = photos 만 FK nullable + locations/trades/vendors 후속 chunk 권장
- 회사망 Edge Function 배포 (Supabase Edge Function = Deno) 동작 검증 미확인 → V1 보류 결정 권장
- 본 턴 KI-22 본문의 "후속 테이블 (locations / trades / vendors / photos) GRANT 보충 필요" 명시 — Phase 5.5 진입 시 자동 적용 의무

## 8. 새 대화창 시작 가이드

복사 붙여넣을 첫 PROMPT:

---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

D-4t office 종결 (KI-12~22 backfill 11건 등재 + 1 commit push). 다음 PC (D-4t home, 집 PC) 환경 진입.

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4t office 에서 known-issues.md 의 KI-12~22 누락 부채 11건 일괄 회복 (D-4o~D-4r 시리즈 등재 약속 미이행분). commit `b0c8ab2` push 완료. 본 턴 잔여 (B.1.c + B.2 + C) 는 D-4t home 으로 이관.

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4t-office-to-home.md

D-4t home 즉시 액션:
1. KI-16 의무 (pull + pnpm install) — 2 commits 수신 (e6efa34 + b0c8ab2)
2. 집 PC `.env.local` publishable key 형식 (sb_publishable_*) 확인 (KI-23 인지)
3. preamble 의 NODE_EXTRA_CA_CERTS 제거 확인
4. B.1.c (KI-23~27 등재, 5건) Planner 진입

D-4 시리즈 방법론 (KI-01~22 등재, KI-23~27 인지) + V1 진도 92% + Phase 5.5 (CRUD) 결정 보류.

handoff 요약 보고 후 "D-4t home Planner 본 턴 시작" 대기.
---
