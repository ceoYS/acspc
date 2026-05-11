# Handoff D-4z → D-5a

작성 세션: D-4z (회사 PC + 집 PC)
작성일: 2026-05-11
대상 세션: D-5a (E chunk = 엑셀 / V1 정의 §5 미수행 deliverable 권장)

---

## 1. 현재 상태

- HEAD: `ca07b80` (본 handoff push 전 시점, push 후 = handoff commit
  hash 로 갱신)
- 직전 3개 commit (handoff push 전 기준):
  - `ca07b80` docs(backlog): v2-priorities.md 신설 (D-4z B, 29 후보
    정렬, 8 섹션, 149 lines)
  - `4755c1f` docs(backlog): handoff d4y-to-d4z (D-4y 종결, V1 마감
    보고 push, D-4z = B chunk)
  - `87aff37` docs(backlog): V1 마감 보고 신설 (D-4y A, 7 섹션 + 후속
    작업, 146 lines)
- working tree: handoff push 후 clean
- 본 chat 시작 HEAD: `4755c1f` → handoff push 후 = 2 commit 진행 (B
  chunk + handoff)
- V1 진행도: ~98%+ 유지 (D-4z = docs-only chunk)
- 다음 V1 영향 chunk = E (엑셀) 진입 시 V1 진행도 갱신 예정

## 2. D-4z 변동 사항

### 2.1 commit `ca07b80` — v2-priorities.md 신설 (D-4z B)

- 신설: `docs/_backlog/v2-priorities.md` (149 lines)
- 양식: 8 섹션 (§1 목적 / §2 출처 / §3 표본 한계 / §4 우선순위 차원
  정의 / §5 차원 그룹화 G1~G7 / §6 후보 표 29건 / §7 제외·유보 / §8
  후속 조치)
- V2 후보 29건 정렬:
  - **high (2)**: A-3-2 출력 채널 다양화 (HTML 포스터 / 앱 내 뷰) /
    D-1 Mobile (Expo) UX 트랙 결정
  - **medium (19)**: A-1-1, A-2-2~3, A-3-1, A-3-3, B-1-1~5, B-2,
    B-3-2, C-4, C-5, D-2, E-1~4
  - **low (8)**: A-1-2 [후보?], A-2-1, A-2-4, B-1-6~7, B-3-1, B-3-3
    [후보?], C-1
- 차원 그룹화 G1~G7:
  - **G1 사진 업로드 UX 강화** (medium, 10건 묶음): V1 web 즉시 보강
  - **G2 Mobile (Expo) 트랙** (high, 4건): V1 정의 #2~4 미진입 = V2
    핵심
  - **G3 출력 / 분류 다양화** (high, 2건): 김은수 명시 발화, V1 엑셀
    단일 해소
  - **G4 워크플로 자동화 확장** (medium, 3건)
  - **G5 인프라 / 운영 위생** (low-medium, 5건): V2 multi-bucket 진입
    조건부
  - **G6 사용자 관계 / role 구조** (medium, 3건): 가설 단계
  - **G7 분야 확장** (low, 2건): 표본 부족
- 제외 3건: HPMS 기각 (인터뷰 03), KI-24 (.gitignore 정리), KI-25
  (domain-model 경로 정리) — KI-24 / 25 = D chunk 위임
- 유보 2건 [후보?]: A-1-2 follow-up (본인 의심), B-3-3 middleware
  refresh (V1 안전)
- 톤 한정: candidate 정렬 자료 (RW-D4z-3 엄수, V2 사양서는 별 작업 §8
  명시)
- 표본 한계 명시: 같은 회사 2명 (RW-D4y-3, RW-D4z-4 carryover)
- 본 정찰 미포함 보조 출처 5건 (§8 명시): docs/00, docs/01 §4 V1
  비포함, docs/02, minor-fixes.md, phase-5.5-decomposition.md — 별
  chunk 시 5~10개 추가 후보 확장
- Gate 2: docs-only 면제 (Planner 근거 + 사용자 명시 승인)
- Evaluator: 면제 (blind spot 없음, 사용자 명시 승인)
- pre-commit hook: 3/3 tasks (cache hit 2 + web cache miss 1, 모두
  PASS, 4.176s)

### 2.2 D-4z 부수 발견 (3건)

#### 부수 발견 1: Evaluator 면제 명시 승인 발화 누락 (Step 2 진입)

본 chat 흐름에서 Step 1 → Step 2 진입 시 "Evaluator 면제, 진행" 같은
명시 승인 발화 없이 Claude Code 가 Step 2 실행. 사용자가 Step 1 결과
보고 후 Planner 가 Step 2 prompt 제시 → 사용자가 곧장 Step 2 결과
직접 보고 (명시 승인 발화 미경유).

- 운영원칙 §사용자 승인 언어 규칙 위반
- **D-4y A 부수 발견과 동일 패턴 반복** (carryover 미해소 + 재발)
- 산출물은 PASS
- **권장 운영 개선**: Planner 가 prompt 끝마다 명시 승인 발화 형식
  명시 ("'Evaluator 면제, 진행' 명시 승인 대기"), 사용자가 이를 그대로
  또는 동등 명시로 발화한 후에만 Claude Code 투입

#### 부수 발견 2: 단독 "승인" 발화의 모호성 + "권장대로" 의 묵시 동등성

사용자가 §다음 단계의 "본 작성 turn 진입" 옵션에 대해 단독 "승인"
발화. 운영원칙 §사용자 승인 언어 예시 ("Gate 2 승인", "push 진행" 등)
대비 단독 "승인" 은 동사 부재로 다소 모호. 한편 사용자 일관 발화
패턴인 "권장대로" 는 Planner 권장 전체 동의의 묵시 동사 동등 (운영
메모리 명시).

- 본 chat 에서는 Planner 가 "본 작성 turn 진입 승인으로 해석" 명시 후
  진행 → 합의 도달
- **권장**: 사용자 발화 시 동사 명시 ("본 작성 진입 승인" / "commit
  진행 승인" 등) 가 자의적 해석 위험 감소. "권장대로" 는 묵시 동사
  동등으로 유지.

#### 부수 발견 3: pre-commit hook web cache miss (D-4z B commit 시)

docs-only commit (소스 변경 0) 임에도 web 패키지 turbo cache miss
발생. tsc --noEmit 실행 + PASS (4.176s 추가).

- turbo cache key 가 git tree hash 또는 staged 파일 포함 hash 기반인
  듯 — docs 변경도 새 cache key 유발 가능성
- D-4y A commit 때는 3/3 cached (instant). 차이 발생 사유 미상
- **영향**: 환경 이슈 아님. docs-only commit 시간 예측 시 cache miss
  가능성 (수 초 추가) 주의
- 신규 KI 미신설 (사실관계 메모만)

### 2.3 D-4z B 작성 시 SC (Scope-Cut) 정리

- SC-1: 보조 출처 5건 (docs/00, docs/01 §4, docs/02, minor-fixes.md,
  phase-5.5-decomposition.md) 정찰 → 별 chunk 위임 (RW-D4z-1 압축)
- SC-2: 우선순위 정량화 (1~5 점수) → 정성 3단계 (RW-D4z-2)
- SC-3: 본 V2 백로그 = candidate 정렬 톤 한정 (RW-D4z-3)
- SC-4: V2 사양서 작성 → 별 작업 (§8 명시)
- SC-5: 신규 인터뷰 / 새 표본 추가 → 별 chunk (RW-D4z-4 carryover)
- SC-6: Mobile 트랙 결정 (V1.5 / V2 / V3 분리) → 별 의사결정 turn (§8
  명시)

## 3. 환경 전제

### 3.1 회사 PC

- 작업 경로: `~/work/acspc` (founder_ys home)
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ;
  export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
- bash 체인: `;` 권장 (exit 전파 회피, KI 11-class)
- registry 명령 금지: `pnpm list/why/outdated` (KI-16 회피)

### 3.2 집 PC

- 작업 경로: `~/work/acspc` (sinabro home)
- Node: v22.22.2 (nvm)
- preamble: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
  (cert 라인 제거)
- 그 외 동일 (KI-16, `;` 체인)

### 3.3 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15 + Turbopack / Expo SDK 54 (scaffold 단계)
- Supabase (production DB + Storage + RLS 5종 + GRANT 28 rows)
- zod v4 (packages/domain)
- pre-commit hook: `turbo check-types` (5 packages tsc --noEmit, cache
  miss 시 수 초 추가)

### 3.4 제약 (운영원칙)

- 단일 진실 원본: CLAUDE.md → .claude/rules/* →
  docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 분리
- Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
- git add . 금지, explicit add list 만
- 사용자 승인 언어 엄수 — **단독 "승인" 보다 동사 명시 권장. "권장대로"
  는 묵시 동사 동등** (D-4z 부수 발견 2)
- 단계 전환 시 명시 승인 발화 엄수 — **D-4y A → D-4z carryover 미해소.
  D-5a 부터 엄수 권장** (D-4z 부수 발견 1)

## 4. D-5a 다음 턴 스펙

### 4.1 후보 진입 chunks (총 6건)

| 후보 chunk | 우선순위 | 근거 |
|---|---|---|
| **E. 엑셀 chunk** (V1 정의 §5 미수행 deliverable) | **high** | V1 마감 보고 §6 "엑셀 chunk 온보딩 전 완성 필요" 명시. V1 본 deliverable, V2 무관 |
| F. Mobile 트랙 결정 (V1.5 vs V2 vs V3 분리) | high | v2-priorities §8 명시. G2 군집 high. V2 진입 사전 의사결정 |
| H. V2 사양서 진입 (v2-priorities 활용) | high | V2 진입 핵심. 매우 큰 다발 |
| D. KI 누적 정리 (KI-24 / 25 + 잔존) | medium | V1 후반 정리 chunk 명시. 짧은 chunk |
| C. 노란봉투법 / 마케팅 각도 | medium | 운영 메모리 secondary marketing angle |
| G. 보조 출처 정찰 (docs/00, docs/01 §4, docs/02, minor-fixes, phase-5.5-decomposition) | low-medium | v2-priorities §8 명시. 5~10개 추가 후보 확장 |

### 4.2 권장 진입 순서

D-5a 권장 = **E (엑셀 chunk)**.

근거:

- V1 정의 §5 핵심 deliverable 미수행 (V1 마감 보고 §6 명시)
- V2 진입 전 V1 완성 우선 (V1 진행도 ~98%+ → V1 정의 6개 항목 완수 시
  100%)
- V1 사용자 (김민성 / 김은수) 실제 워크플로 핵심 (인터뷰 02 line
  73-76, 인터뷰 03 line 112-120 등)
- Mobile / V2 사양 등 큰 다발과 무관, 단독 chunk 가능

후속 권장 순서: E → D (KI 정리) → F (Mobile 트랙 결정) → G (보조 출처
정찰) → H (V2 사양서). C (노란봉투법) 는 V2 백로그 sub-section 또는
별 chunk 둘 다 가능.

### 4.3 범위 외 (D-5a 일반)

- V1 본문 (docs/01) 변경
- v1-closure-report.md / v2-priorities.md / handoff 수정
- 새 인터뷰 / 새 KI 추가 (필요 시 신설 별 chunk)

### 4.4 잠재 위험 (RW-D5a, E 진입 시)

- **RW-D5a-1**: 엑셀 라이브러리 선정 (xlsx / exceljs / SheetJS 등) —
  `.claude/rules/tech-stack.md` 점검 필수 (single source of truth)
- **RW-D5a-2**: 사진대지 출력 양식 = 인터뷰 02 line 73-76 + 인터뷰 03
  line 112-120 미확정 → 정찰 turn 필수
- **RW-D5a-3**: server action 출력 vs 클라이언트 다운로드 패턴 결정 —
  V1 5.5 server action 일관성
- **RW-D5a-4**: V1 정의 §5 "**업체별** 사진대지 자동 생성" 에서
  "업체별" 의미 (위치 / 작업자 / 공종) 인터뷰 재확인
- **RW-D5a-5**: V1 단일 축 vs V2 다축 (G3 분류 축 다양화 = V2 medium
  후보) — V1 = 단일 축 유지 권장

### 4.5 권장 진행 순서 (E chunk)

1. 정찰 turn: V1 정의 §5 + 김민성 인터뷰 02 + 김은수 인터뷰 03 +
   design-notes (5.5 series) + tech-stack.md 엑셀 라이브러리 후보 점검
2. Planner turn: 엑셀 양식 정의 + 라이브러리 선정 + thin slice 결정
   (단일 위치 / 단일 작업자 / 단일 엑셀 첫 PASS)
3. Generator + Evaluator + Gate 2 (소스 변경 → 발동) → 실제 디바이스
   검증
4. Push: 정상 commit + push 패턴

## 5. 새 대화창 시작 가이드 (D-5a 복붙용 프롬프트 초안)

(아래 내용은 D-5a 새 대화창에 사용자가 그대로 복붙할 텍스트)

---

본 chat 끝까지 다음 운영 원칙 엄수:

1. 단일 진실 원본 (CLAUDE.md → .claude/rules/* →
   docs/agent-shared/operating-principles.md → docs/*)
2. Planner / Generator / Evaluator 분리 (한 turn 한 역할)
3. Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
4. git add . 금지, explicit add list 만
5. 사용자 승인 언어 엄수 — 단독 "승인" 보다 동사 명시 권장 ("Gate 2
   승인" / "본 작성 진입 승인" 등). "권장대로" = 묵시 동사 동등 (운영
   메모리 등재)
6. **단계 전환 시 사용자 명시 승인 발화 엄수 — Planner 가 prompt 끝마다
   명시 승인 발화 형식 명시 + 사용자 발화 후에만 Claude Code 투입**
   (D-4y A → D-4z 부수 발견 1 carryover)
7. 환경 분기 (회사 PC: corp cert / 집 PC: cert 라인 제거) + Node
   v22.22.2 + bash `;` 체인 + KI-16 회피 (registry 명령 금지)
8. 신규 KI 발견 시 즉시 known-issues.md 등재 후보 (Planner 판단). KI-23
   ~ KI-29 잔존 / V2 회피 패턴 명시

본 chat HEAD: **`<handoff push 후 hash>`** (D-4z 종결 = handoff commit)
직전 commit: `ca07b80` docs(backlog): v2-priorities.md 신설 (D-4z B,
29 후보 정렬, 8 섹션, 149 lines)
직전 handoff: `docs/_backlog/handoff-d4z-to-d5a.md` (본 commit)

V1 진행도 ~98%+ (D-4z = docs-only). 다음 chunk = **E (엑셀 chunk)
권장**:

- 근거: V1 정의 §5 미수행 deliverable, V1 마감 보고 §6 명시 ("엑셀
  chunk 온보딩 전 완성 필요")
- 후속 권장 순서: E → D (KI 정리) → F (Mobile 트랙) → G (보조 출처
  정찰) → H (V2 사양서)
- C (노란봉투법) 는 별 chunk 가능

D-5a 진입 시 첫 사용자 발화 후보:

- "D-5a 시작. 다음 chunk 권장은?"
- "E chunk 진입 정찰부터"
- "다른 chunk 진입 (D / F / G / H / C)"

만약 E chunk 진입 시 첫 정찰 turn:

- 읽을 파일: docs/01 §5 (V1 정의 출력), docs/interviews/02 (line 73-76
  입사전 사진대지), docs/interviews/03 (line 112-120 출력 채널),
  .claude/rules/tech-stack.md (엑셀 라이브러리 후보),
  docs/_backlog/5.5.4-design-notes.md (server action 패턴)
- 잠재 위험 RW-D5a-1~5 (§4.4) 점검

## 6. 미해결 carryover (D-4z → D-5a)

- **carryover-1**: 단계 전환 명시 승인 발화 누락 (D-4y A → D-4z 부수
  발견 1 재발). D-5a 부터 Planner 가 prompt 끝마다 명시 승인 발화 형식
  명시 + 사용자 발화 후 투입 권장 (운영원칙 §사용자 승인 언어 후속
  보강).
- **carryover-2**: 단독 "승인" 발화의 모호성 — 사용자 측 발화 시 동사
  명시 권장 (D-4z 부수 발견 2). "권장대로" = 묵시 동사 동등 (변경
  없음).
- **carryover-3**: 보조 출처 5건 (docs/00, docs/01 §4, docs/02,
  minor-fixes.md, phase-5.5-decomposition.md) 정찰 미수행 (G chunk).
- **carryover-4**: 새 인터뷰 / 새 표본 추가 → 별 chunk (RW-D4y-3,
  RW-D4z-4 carryover. V2 사양서 진입 전 권장).
- **carryover-5**: 잔존 KI (KI-24, KI-25) 정리 chunk = D chunk
  (v2-priorities §7 명시).
- **carryover-6**: pre-commit hook docs-only cache miss 가능성 (D-4z
  부수 발견 3). 사실관계 메모만, KI 신설 보류.
