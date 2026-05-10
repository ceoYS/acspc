# Handoff — D-4t home → D-4u (2026-05-10, Session 23 종결)

## 1. 현재 상태

- origin/main HEAD: `73dda86`
- D-4t office (`96415a9`) 이후 commits 2건:
  * `4b5c972` docs(backlog): add KI-23~27 to known-issues.md (D-4s office 정찰분 등재)
  * `73dda86` chore(gitignore): add .env*.bak* pattern (KI-10 + KI-24 회피)
- working tree: clean

## 2. D-4t home 진행 내역

- 환경 전환 검증 (회사 PC → 집 PC): preamble `NODE_EXTRA_CA_CERTS` 의도적 제거, `.env.local` key 형식 = `sb_publishable_*` 확인 (KI-23 인지대로)
- KI-16 의무: `git pull` no-op (D-4t office 종결 commit `96415a9` 선행 정합 흡수 확인), `pnpm install` 4s, lockfile 무변동
- B.1.c (KI-23~27 5건 등재): `known-issues.md` 789→980 (+191줄), KI-22 형식 5-section, KI-26 본문에 KI-22 cross-reference 1문장 명시 → commit `4b5c972`, push 정상
- B.2 (`.gitignore` +1줄 `.env*.bak*` 라인 10): blind spot 검증 통과 (`.env.local` root 라인 8 기존 매칭, 라인 10 미매칭 ✓ / `.env.local.bak[.d4s]` 라인 10 매칭 ✓), KI-10 + KI-24 동시 cover → commit `73dda86`, push 정상
- 두 chunk 별 commit 분리 (KI-15 의무 적용)
- C (Phase 5.5 분해 합의) 미진입 → D-4u 로 이관

## 3. 환경 전제 (D-4u 진입 시)

- 다음 세션 PC **미정** → 환경 분기 의무
  * 회사 PC (HG2501034N03): preamble `NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"` 포함
  * 집 PC (DESKTOP-CTPJ4S5): preamble `NODE_EXTRA_CA_CERTS` **제거** (KI-28 인지)
- 작업 경로: `~/work/acspc` (양 PC 공통)
- Node 버전: v22.22.2 (KI-16 의무 시 확인)
- `.env.local` key 형식: 회사 PC = JWT anon / 집 PC = `sb_publishable_*` (KI-23 인지, 동작 영향 0)
- KI-16 의무: `git pull` (2 commits 수신 예상 = `4b5c972` + `73dda86`) + `pnpm install` (lockfile 무변동, 빠름 예상)

## 4. 신규 KI / 발견사항

**KI-28 후보 (D-4t home 신설)**: Claude Code 가 회사 PC preamble (`NODE_EXTRA_CA_CERTS`) 매 명령 자동 포함 → 집 PC cert 부재 시 노이즈 경고 노출

- 증상: 집 PC bash 실행 시 `Warning: Ignoring extra certs from \`/home/sinabro/.certs/corp-root.pem\`, load failed: error:80000002:system library::No such file or directory` 출력
- 원인 (추정): Claude Code 환경 인지 부재로 회사 PC preamble 패턴 자동 적용
- 영향: 0 (후속 명령 정상 실행, 노이즈만)
- 회피: 환경별 preamble 분기. 집 PC = `NODE_EXTRA_CA_CERTS` 제거. Claude Code 메모리 (CLAUDE.md / 세션 메모리) 에 PC 식별 추가 검토.
- 분류: KI-23 동급 (동작 무영향, 진단 비용 절감용 인지 등재)

**부수 인지** (KI 후보 X): `apps/web/.gitignore` 라인 34 `.env*` 가 `.env.local` 자체도 매칭 (광범위, comment "opt-in for committing if needed" = 의도된 패턴, 재확인 결과).

## 5. 방법론 교훈

- KI-12 (메시지 길이) 적용: B.1.c = 정찰→등재 분리 / B.2 = 정찰+추가+검증 결합→commit 분리. chunk 별 적정 분할 = sub-task 성격에 맞춤
- glob 분석 + `git check-ignore -v` 실측 이중 검증 = `.gitignore` 류 변경 표준 (Gate 2 본질, blind spot 사전 차단)
- Evaluator 체크리스트 (a~l) 셀프 점검 형식으로 발동 판단 가속 = `.gitignore` 류 단순 변경 시 Evaluator 면제 정당화 표준화
- KI-28 식별: 동작 무영향 노이즈도 환경 전환 진단 비용 절감 위해 KI 후보 인지 (KI-23 동급, "동작 영향 0 + 인지 가치 충분" 기준)
- KI-15 (handoff 별 chunk) 적용: 작업 commit 2건 (`4b5c972` + `73dda86`) + handoff commit (다음 chunk) 분리

## 6. D-4u 다음 턴 스펙

### 즉시 액션

1. 환경별 preamble 적용 (회사 PC = `NODE_EXTRA_CA_CERTS` 포함 / 집 PC = 제거, KI-28 인지)
2. KI-16 의무 (`git pull` + `pnpm install`): 2 commits 수신 (`4b5c972` + `73dda86`)
3. PC 별 `.env.local` key 형식 확인 (KI-23 인지)
4. **KI-28 본 등재** 또는 **C (Phase 5.5) 진입** 결정

### 본 턴 잔여 작업 인계

**KI-28 본 등재 (1건)**
- 형식: 5-section, 인지 단계 KI-23 동급
- 본문: §4 데이터 그대로
- docs append-only → Evaluator/Gate 2 면제 가능 (KI-23~27 등재 선례)
- 출처 handoff: 본 파일 §4

**C — Phase 5.5 (CRUD) Planner 분해 합의** (V1 진도 ~92%)
- 미해결 결정 3건:
  1. **photos table FK 폭증 결정**: `location_id` / `trade_id` / `vendor_id` 도 FK. V1 에서 이 테이블들 동시 도입 vs photos 만 우선 (FK nullable + 후속 chunk)
  2. **Edge Function (photo 삭제 트랜잭션) V1 보류 vs V2**: 회사망 Supabase Deno runtime 배포 검증 미확인 → 보류 권장
  3. **storage_path 일치성 검증 위치**: client 생성 vs server action
- sub-chunk 가안: 5.5.0 정찰 → 5.5.1 photos table → 5.5.2 RLS/GRANT → 5.5.3 page 분리 → 5.5.4 INSERT/upload 트랜잭션
- thin slice 우선 = photos nullable FK 단독, locations/trades/vendors 후속 chunk 권장

## 7. 잠재 위험

- cross-PC 환경 차이 점검 항목 (KI-23 key 형식 + KI-28 cert 패턴) 통합 정책 필요할 수 있음 — handoff template 에 PC 식별 명시 (회사 PC / 집 PC) 권장
- Phase 5.5 photos FK 폭증 결정이 5.5 chunk 분량 결정 → thin slice 우선 (photos nullable FK + locations/trades/vendors 후속 chunk) 강력 권장
- 회사망 Edge Function 배포 (Supabase Edge Function = Deno runtime) 동작 검증 미확인 → V1 보류 결정 권장 (domain-model.md §6 photo 삭제 트랜잭션은 V2 이관)
- KI-22 본문 "후속 테이블 (locations / trades / vendors / photos) GRANT 보충 필요" 명시 — Phase 5.5 진입 시 자동 적용 의무
- KI-28 등재 vs C 진입 우선순위 결정 필요 (등재 = 부채 청산, C = V1 진도 가치). 등재 1건은 5분 이내 → 등재 후 C 권장

## 8. 새 대화창 시작 가이드

복사 붙여넣을 첫 PROMPT:

---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

D-4t home 종결 (B.1.c KI-23~27 5건 등재 commit `4b5c972` push 완료 + B.2 `.gitignore` `.env*.bak*` 추가 commit `73dda86` push 완료 + KI-28 후보 신규 발견). 다음 세션 (D-4u) 환경 진입.

GitHub public: https://github.com/ceoYS/acspc

배경:
D-4t home 에서 D-4s office 정찰분 (KI-23~27) 5건 본 등재 + `.gitignore` 의 `.env*.bak*` 패턴 추가 (KI-10 CI 시뮬 + KI-24 시점 백업 동시 cover) 2 chunk 분리 commit/push 완료. 부수로 회사 PC preamble (`NODE_EXTRA_CA_CERTS`) 가 집 PC 에서 노이즈 경고 출력 = KI-28 후보 인지. 본 턴 잔여 (KI-28 등재 + C Phase 5.5 분해 합의) 는 D-4u 로 이관.

아래 handoff 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4t-home-to-d4u.md

D-4u 즉시 액션:
1. 환경별 preamble 적용 (회사 PC = `NODE_EXTRA_CA_CERTS` 포함 / 집 PC = 제거, KI-28 인지)
2. KI-16 의무 (`git pull` + `pnpm install`) — 2 commits 수신 (`4b5c972` + `73dda86`)
3. PC 별 `.env.local` key 형식 확인 (KI-23 인지)
4. KI-28 본 등재 (1건, append-only) 또는 C (Phase 5.5 CRUD) Planner 진입 결정

D-4 시리즈 방법론 (KI-01~27 본 등재, KI-28 후보 인지) + V1 진도 92% + Phase 5.5 (CRUD) 결정 보류.

handoff 요약 보고 후 "D-4u Planner 본 턴 시작" 대기.
---
