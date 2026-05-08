# Handoff — D-4s office → D-4t (2026-05-08, Session 21 종결)

## 1. 현재 상태

- origin/main HEAD: 8b2957b
- D-4r home (c8f2c0e) 이후 commits 4건:
  * d726385 docs: handoff d4r-home-to-d4s
  * dd7fc8e chore(web): remove D-4o Phase 5.1 leftover (T2 cleanup)
  * bbc7248 feat(db): storage photos bucket migration (private + RLS path-shape defense)
  * 8b2957b feat(web): photo upload form on login page (Phase 5.4 sub-5.4.2)
- working tree: clean (untracked apps/web/.env.local.bak.d4s 만 — KI-24)

## 2. D-4s 진행 내역

- 정찰 (domain-model.md 위치 정정: docs/agent-shared/ → .claude/rules/ = KI-25)
- T2 cleanup (lib/supabase.ts + app/supabase-check/page.tsx 통삭)
- 회사 PC .env.local 변수명 rename (NEXT_PUBLIC_SUPABASE_ANON_KEY → PUBLISHABLE_KEY, 값 = JWT anon key 유지) → KI-23 인지
- Phase 5.4 sub-5.4.1 (Codex v2 반영 v3):
  * 0003_storage_photos_bucket.sql (39줄)
  * bucket photos (private, on conflict do update set public=false)
  * revoke truncate, references, trigger from authenticated (효과 미발동 = KI-26)
  * RLS policy "photos_own_files" (bucket-scoped 이름, path-shape 4중 방어: foldername[1] = (select auth.uid())::text + array_length=2 + position(chr(92))=0 + not '..' segment)
  * V0/V1/V2/V3/V4 Dashboard 검증 PASS (V4 에서 KI-26/27 발견)
  * Codex v1 High-1c / v2 Medium-2 (segment UUID regex) 미채택 → backlog B-5.4-01
- Phase 5.4 sub-5.4.2:
  * 시나리오 A 진입 (login page = async server component)
  * PhotoUploadForm.tsx 113줄 신규 (client component, crypto.randomUUID + supabase.storage.from('photos').upload + createSignedUrl(60))
  * page.tsx 수정 (+5/-1: import + ul UUID monospace 표시 + <hr /> + 마운트)
  * Gate 2: 본인 upload + signed URL preview PASS + V5 SQL 다중 user 폴더 분리 검증 (test4 + test5)
- 5.4.3 미진입 결정 (V1 thin slice + client user_id 강제 + photos table 영역 외)

## 3. 환경 전제 (다음 PC 진입 시)

- 회사 PC .env.local: JWT anon key (eyJh...) → PUBLISHABLE_KEY 변수명. 동작 OK
- 집 PC .env.local: 신형 publishable key (sb_publishable_*)
- KI-16 의무: 새 대화창 시작 시 git pull + pnpm install
- 회사 PC preamble: NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"
- 집 PC: NODE_EXTRA_CA_CERTS 제거

## 4. 신규 KI 후보 (V1 후반 known-issues.md 일괄 등재 대기)

- KI-23: 회사 PC ↔ 집 PC Supabase key 형식 불일치 (JWT anon vs sb_publishable_). 동작 영향 0, 일관성 필요
- KI-24: .gitignore 의 .bak/.env.local.bak.* 패턴 부재. .env.local.bak.d4s 보호 미발동 (현재 untracked, git add . 시 위험)
- KI-25: domain-model.md 위치 표기 오류 (handoff/메모리 = docs/agent-shared/, 실제 = .claude/rules/). handoff 정정 필요
- KI-26: Supabase storage.objects revoke 미발동. SQL 문법 OK + COMMIT 성공이나 V4 에서 7권한 잔존. 추정: storage owner = supabase_storage_admin superuser. V1 검증 시나리오 무영향 (TRUNCATE/REFERENCES/TRIGGER 는 storage REST 노출 없음)
- KI-27: anon role 도 storage.objects 7권한 직접 grant. V1 photos bucket 은 RLS to authenticated 로 anon 차단, V2 다중 bucket 시 RLS 의무 명시 필수

## 5. 방법론 교훈

- Codex false positive ~50% 비판적 수용: 동일 항목 2회 권고 (v1 High-1c → v2 Medium-2 segment regex) 에도 thin slice 원칙으로 미채택. V1 검증 시나리오 무영향 + client/edge function 영역 위임 근거
- sub-chunk 분해: 정찰 (5.4.0) → migration + Dashboard (5.4.1) → upload form (5.4.2). 각 chunk 사전 정찰 SQL → Codex 평가 → Gate 2 검증
- 자연 시나리오 검증 우선: 5.4.3 의도적 위반 미진입. V5 SQL 2 row 가 다중 user 폴더 분리를 자연 시나리오로 검증 = RLS 첫 segment 검증 PASS
- 가이드의 예시 UUID 위험: placeholder UUID 를 명확 표시했더니 사용자 복붙 시도 발생. 향후 placeholder 는 <YOUR_UUID_HERE> 형식으로
- diff stat ≠ Read line count: 사전 명기는 git diff --stat 시뮬 또는 wc -l 보수적 추정

## 6. D-4t 다음 턴 스펙

- V1 진도: 약 92%
- 다음 진입: Phase 5.5 (CRUD) — photos table 도입 + 정식 분리

### 5.5 핵심

1. photos table migration (0004_photos_table.sql) — domain-model.md §1.5 (id/user_id/project_id/location_id/trade_id/vendor_id/storage_path/gallery_album/taken_at)
2. photos table RLS + GRANT (KI-22 + KI-26 교훈 적용)
3. login page 의 임시 PhotoUploadForm 을 별 페이지 (/photos 등) 로 정식 분리
4. photo INSERT (DB row) + storage upload 트랜잭션 결합
5. Edge Function 삭제 트랜잭션 (§6) — V1 vs V2 결정 필요

### 병행 정리

- V1 후반 backlog 일괄 등재 (KI-23~27 + B-5.4-01)
- .gitignore 에 .env.local.bak.* 또는 *.bak 패턴 추가 (KI-24)
- apps/web/.env.local.bak.d4s 정리 (rename 검증 종결 후 삭제)

## 7. 잠재 위험

- photos table FK 폭증: location_id/trade_id/vendor_id 도 FK. V1 에서 이 테이블들도 같이 만들지 (5.5 chunk 비대) vs photos 만 우선 (FK nullable + 후속) 결정 필요
- Edge Function 도입: domain-model.md §6 photo 삭제 = Edge Function 트랜잭션. V1 scope 확장 위험. 권장: V1 보류 (수동/cleanup script), V2 Edge Function
- 5.5 chunk 비대: photos table + RLS + GRANT + upload form 분리 + INSERT 결합. sub-chunk 미세 분해 필수
- storage_path 와 photos.storage_path 일치성: client 생성 vs server action 검증. V1 결정 필요
- 회사망 Edge Function 배포: Supabase Edge Function = Deno. 회사망 deploy CLI 동작 검증 필요

## 8. 새 대화창 시작 가이드

복사 붙여넣을 첫 PROMPT:

---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

D-4s office 종결 (T2 cleanup + Phase 5.4 sub-5.4.1 + sub-5.4.2 + 4 commits push). 다음 PC (D-4t) 환경 진입.

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4s office 에서 Phase 5.4 (Storage) 종결. bucket 생성 + RLS path-shape 방어 + login page 임시 upload form. Gate 2 PASS (본인 upload + signed URL + 다중 user 폴더 분리). 다음 = Phase 5.5 (CRUD: photos table + 정식 분리).

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4s-office-to-d4t.md

D-4t 즉시 액션:
1. KI-16 의무 (pull + pnpm install)
2. (회사 PC 시) .env.local 변수명 PUBLISHABLE_KEY 확인. (집 PC 시) NODE_EXTRA_CA_CERTS 제거
3. V1 후반 backlog 일괄 등재 검토 (KI-23~27 + B-5.4-01)
4. Phase 5.5 (CRUD) Planner 분해 진입 — photos table 우선 vs FK 테이블 일괄 결정 필요

D-4 시리즈 방법론 (KI-12~27 누적) + KI-26 (storage.objects revoke 미발동) + KI-27 (anon 7권한) 인지.

handoff 요약 보고 후 "D-4t Planner 본 턴 시작" 대기.
---
