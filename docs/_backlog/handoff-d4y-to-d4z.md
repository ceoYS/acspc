# Handoff D-4y → D-4z

작성 세션: D-4y (회사 PC)
작성일: 2026-05-11
대상 세션: D-4z (B chunk = V2 백로그 정리 중심)

---

## 1. 현재 상태

- HEAD: `87aff37`
- 직전 3개 commit:
  - `87aff37` docs(backlog): V1 마감 보고 신설 (D-4y A, 7 섹션 + 후속 작업, 146 lines)
  - `8f83a78` docs(backlog): handoff d4x-to-d4y (D-4x 종결, V1 ~98%+, 5건 push)
  - `4841a61` feat(web): 5.5.4 server action 신설 + PhotoUploadForm props 전환 (V1 종결)
- working tree: clean
- 본 chat 시작 시 HEAD: `8f83a78` → 종료 시 `87aff37` = 1개 commit 진행
- V1 진행도: ~98%+ 유지 (D-4y 는 docs-only)

## 2. D-4y 변동 사항

### 2.1 commit `87aff37` — V1 마감 보고 신설 (D-4y A)

- 신설: `docs/_backlog/v1-closure-report.md` (146 lines, 6,937 bytes)
- 양식: 7 섹션 + §8 후속 작업
- §2 V1 정의 (docs/01 §2) 충족도 매핑:
  - #1 프로젝트 단위 마스터 설정 — 부분 완료 (packages/domain 5 엔티티 zod 완비 + apps/web/app/domain-check route / UI CRUD 미진입)
  - #2 촬영 전 태그 선택 — mobile 미진입 (V1 web 범위 외, Expo SDK 54 scaffold 단계)
  - #3 연속 촬영 — mobile 미진입
  - #4 갤러리 동기화 — mobile 미진입
  - #5 업체별 사진대지 엑셀 자동 생성 — 미수행 (별 chunk 예정)
  - #6 동기화 수동/자동 트리거 — 부분 완료 (5.5.4 web 단일 업로드 PASS, 연속 트리거/Wi-Fi 자동 옵션 미구현)
- §3 5.5.4 종결 카드 (commit `4841a61`) 그대로 인용
- §4 누적 KI 분포 (29건, 4분류) — 새 KI 추가 없음
- §5 known gaps: 엑셀 chunk / mobile / content_text 자동완성 / middleware refresh / signed URL 재발급 / client.ts 제거 결정 / 5.5.0~5.5.3 단계별 보고는 범위 외
- §6 표본 = 같은 회사 사용자 2명 (김민성/김은수), 다른 회사 표본 부재 (RW-D4y-3 carryover)
- §7 권장 사항 5건: V1 = 업체별 단축 1차 검증 / 다른 회사 표본 1~2명 추가 / 엑셀 chunk 온보딩 전 완성 필요 / mobile V1.1 or V2 트랙 결정 / 잔존 KI (KI-23, KI-24) 정리
- §8 후속 작업: D-4z B / D-4y? C / D-4y? D / 별 chunk 엑셀 생성
- Gate 2: docs-only 면제 (Planner 근거 + 사용자 명시 승인)
- Evaluator: 면제 (blind spot 없음)
- pre-commit hook (turbo check-types) 3/3 cached 통과

### 2.2 D-4y 부수 발견

- **pre-commit hook = `turbo check-types`** (5 packages tsc --noEmit). cache hit 시 instant (수 ms). docs-only commit 에도 동작. 향후 commit 시간 예측 시 cache miss 가능성만 주의. 신규 KI 미신설 (사실관계 메모만).
- **D-4y A 본 작성 진입 시 사용자 명시 승인 발화 누락**: 본 chat 흐름에서 Evaluator 면제 / Gate 2 면제 요청에 대해 "Evaluator 면제, 진행" 같은 명시 승인 언어 없이 Claude Code 가 본 작성 진입. 결과는 PASS 였으나 운영원칙 §사용자 승인 언어 규칙 위반. **D-4z 부터는 prompt → 사용자 명시 승인 → Claude Code 투입 순서 엄수**.

### 2.3 D-4y A 작성 시 SC (scope-cut) 정리

- SC-1: 5.5.0~5.5.3 단계별 진도 보고 → V1 마감 보고 범위 외 (이전 handoff 들에 분산, 추가 정찰 비용 큼)
- SC-2: V1 6개 기능 매핑 → best-effort, apps + packages ls 1회로 확정
- SC-3: 보고서 양식 = 7 섹션 + §8 후속 작업 고정 (operating-principles 양식 가이드 부재)

## 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: `~/work/acspc`
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ; export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"` (`;` 체인 권장 — exit 전파 회피)
- bash 체인 방어: `;` 또는 `|| true`
- registry 의존 명령 금지: `pnpm list/why/outdated` (corp 망 retry 루프)
- 집 PC 환경 시: cert 라인 제거

### 3.2 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15 + Turbopack / Expo SDK 54 (scaffold 단계)
- Supabase (production DB + Storage + RLS 5종 + GRANT 28 rows)
- zod v4 (packages/domain)
- pre-commit hook: `turbo check-types` (5 packages tsc --noEmit, cache hit 시 instant)

### 3.3 제약 (운영원칙)

- 단일 진실 원본: CLAUDE.md → .claude/rules/* → docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 분리
- Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
- git add . 금지, explicit add list 만
- 사용자 승인 언어 규칙 엄수 ("Gate 2 면제, 진행" / "Evaluator 면제, 진행" 등 명시 발화)

## 4. D-4z 다음 턴 스펙

### 4.1 목표

**B chunk (V2 백로그 정리) 본격 진행**. `docs/_backlog/v2-priorities.md` (가칭) 신설.

### 4.2 범위 (in)

V2 후보 통합 정렬 (출처 6+ 위치):

- 김민성 인터뷰 01/02 발견사항
- 김은수 인터뷰 03 발견사항 (N-1, N-3, N-4)
- 운영 메모리 V2 후보 (3-party role 강화, 작업 템플릿, 주기적 알람 사진 점검, 공사 일정 관리 등)
- design-notes §6 RW-7/8 (signed URL 60s, middleware stale)
- 잔존 KI (KI-23, KI-24, KI-25, KI-26, KI-27)
- v1-closure-report §5 known gaps 중 V2 후보 (mobile 트랙, content_text 자동완성, middleware refresh, client.ts 제거, 출력 채널 다양화 등)

우선순위 차원: 가치 × 난이도 × 사용자 표본 검증 강도.

### 4.3 범위 외

- V1 본문 (docs/01 등) 변경 — 별 chunk
- v1-closure-report.md 수정 — D-4y A 완료
- C (노란봉투법 / 마케팅 각도) — V2 백로그 sub-section 편입 가능, 단독 chunk 시 별 turn
- D (KI 누적 정리) — 별 chunk
- 엑셀 생성 chunk (V1 본 deliverable) — 별 chunk
- 새 인터뷰 / 새 정책 / 새 KI 추가

### 4.4 잠재 위험

- **RW-D4z-1**: V2 후보 출처 6+ 위치 분산 → 정찰 turn 무거움. **정찰 필수, 한 turn 으로 압축**.
- **RW-D4z-2**: 우선순위 차원 정량화 (1~5 점수) vs 정성화 (high/medium/low) 결정. 표본 부족으로 정량화 신뢰도 낮음 → **정성 3단계 권장**.
- **RW-D4z-3**: V2 백로그가 "candidate 우선순위 정렬 자료" 인지 "V2 출시 사양서" 인지 모호 가능 → **"candidate 우선순위 정렬" 톤 한정**. V2 정의 자체는 별 작업.
- **RW-D4z-4**: 같은 회사 사용자 2명 표본 한정 (RW-D4y-3 carryover) → V2 우선순위 결정 자료가 일반화 가능성 제한. 보고서에 명시.

### 4.5 권장 진행 순서

1. 정찰 turn: 인터뷰 01/02/03 + design-notes §6 + 잔존 KI + 운영 메모리 V2 후보 read → V2 후보 raw list 추출
2. Planner turn: 우선순위 차원 (정성 high/medium/low) + 차원별 그룹화 + RW-D4z 적용
3. 본 작성 turn: `docs/_backlog/v2-priorities.md` 신설
4. Push: docs-only 면제 + 사용자 명시 승인 후

## 5. 새 대화창 시작 가이드 (복사 붙여넣기용 프롬프트 초안)

이 프로젝트는 acspc 제품의 전략 검토 및 Claude Code용 프롬프트 설계 전용 대화창입니다.
D-4y 종결 (V1 마감 보고 commit + push, D-4y A 완료).
HEAD = 87aff37.
V1 진행도 ~98%+ 유지 (docs-only chunk).
handoff: https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4y-to-d4z.md
즉시 액션:
1. KI-28 preamble (회사 PC 또는 집 PC 환경에 따라 cert 라인 포함/제거)
2. KI-16 git pull (1건 보유 = handoff commit 자체, lockfile 변동 없을 시 install 생략)
3. D-4z 작업: B (V2 백로그 정리) 본격 진행
   - 정찰 turn → Planner 우선순위 결정 → 본 작성 → push
   - 정성 high/medium/low 3단계 권장 (RW-D4z-2)
4. handoff 요약 보고 후 "D-4z Planner 본 턴 시작" 대기.

## 6. 이력 보존 메모

본 handoff 는 D-4y → D-4z 전환용. 이전 handoff (`docs/_backlog/handoff-d4x-to-d4y.md` 등) 도 보존. V1 종결 시 일괄 정리 chunk 계획 유지.
