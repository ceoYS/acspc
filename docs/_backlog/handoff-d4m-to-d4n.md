# Handoff — D-4m → D-4n (2026-05-04, Session 14 end)

## 1. Session 14 (D-4m) 종결 요약

D-4m = D-4j 잔여 처리 (MF-06 H1). MF-06 H1 close + H3 재검토 필요 명문화.

- Chunk 1 (코드): packages/domain/src/photo.ts 에 storage_path regex 추가 + photo.test.ts 6 case (HEAD=99a9a74)
- Chunk 2 (docs): minor-fixes.md L61 H1 close 표기 + L63 H3 재검토 필요 강화 + L66 우선순위 갱신 (HEAD=f075462)
- Chunk 3 (handoff): 본 commit

검수 결과: Critical 0, High 0. CI 49초 통과 (`f075462` HEAD). Phase 5 진입 직전 정합.

### 환경 특이사항 (D-4m)
- **집 PC (DESKTOP-CTPJ4S5, sinabro@) 신규 셋업** 후 작업 진행
- WSL Ubuntu 24.04 + nvm + Node v22.22.2 + pnpm 10.33.0 (system) 정합
- 집 PC = corp 망 밖 → corp-root.pem 불필요 (CERT MISSING 정상)
- 집 PC 별도 fine-grained PAT 발급 (90일 만료, repo-specific, Contents R/W + Metadata R + Workflows R/W) — KI-01 정합
- credential.helper store 로 PAT 영구 저장 (`~/.git-credentials`)
- pnpm install 10초 (회사 corp 망 vs 집 일반 인터넷 차이 실증)

## 2. 환경 가정 + 검증

본 turn 진입 시 다음 명령으로 환경 확증.

### 회사 PC (founder_ys@HG2501034N03)

```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" \
&& export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& pwd \
&& git remote -v \
&& node --version \
&& ls ~/.certs/corp-root.pem \
&& git log --oneline -1
```

기대 출력:
- /home/founder_ys/work/acspc
- origin https://github.com/ceoYS/acspc.git (fetch)
- v22.22.2
- cert 존재
- HEAD: D-4m Chunk 3 (본 commit) 또는 그 이후
- git status clean

### 집 PC (sinabro@DESKTOP-CTPJ4S5)

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" \
&& cd ~/work/acspc \
&& pwd \
&& git remote -v | head -1 \
&& node --version \
&& git log --oneline -1
```

cert 라인 제거 (집은 corp 망 밖). 그 외 동일 검증.

## 3. D-4m 핵심 결정 (변경 사항)

- **MF-06 H1 close**: storage_path regex = `{user_id_uuid}/{project_id_uuid}/{photo_id_uuid}.{ext}` 패턴, 5종 확장자 (jpg/jpeg/png/webp/heic — heic 는 iOS 사진 표준 대비), 대소문자 무관 (`/i` flag). photo.test.ts 6 case (uppercase valid + 3종 invalid format).
- **MF-06 H3 보류 명문화**: Vendor.name sanitize 는 **재검토 필요 (V1 후반)**. 근거: Vendor.name 은 파일 시스템 미진입 + 한글/특수기호 정상 입력 차단 위험. 현재는 min(1).max(100) + blank-after-trim refine 으로 기본 안전망 유지.
- **집 PC 작업 환경 표준화**: 회사 PC + 집 PC 양쪽에서 동일 작업 가능. 집 PC 별도 PAT (KI-01 정합). KI-02 후보 (집 PC 셋업 패턴 명문화) 검토.
- **CI 49초 통과**: D-4l 자동 검증 인프라 첫 실전 활용. turbo cache hit (FULL TURBO) 로 docs-only commit 도 빠르게 통과.

## 4. D-4m 신규 백로그 후보

- **KI-02 후보**: 집 PC / 다른 환경 셋업 패턴 (cert 없음 + 별도 PAT + nvm Node + system pnpm). D-4n 진입 시 known-issues.md 명문화 결정.
- 기타 신규 MF 없음. 기존 백로그 (MF-06 H3, MF-11/02/27/28/29/30) 유지.

## 5. D-4n 다음 턴 스펙 — Phase 5 (Supabase) 진입

### 5.1 D-4n = Phase 5.1 Chunk 1 후보 (thin slice)

handoff §7 진도표: Phase 5 = 데이터 레이어 (Supabase, 인증, 스토리지). MF-06 잔여 (H1) close 로 진입 가능 상태.

**D-4n 의 thin slice = Phase 5.1 만**:
- Supabase 프로젝트 생성 + 환경변수 + 클라이언트 셋업 (`@supabase/supabase-js`)
- "hello supabase" 1회 호출 (예: `auth.getSession()` 또는 `from('test').select()`) → 응답 확인
- 5.2~5.5 (DB 스키마, Auth, Storage, CRUD) 는 후속 D-4o, D-4p 등에서 분할

**Phase 5 전체 분할 (참고)**:
- 5.1: 클라이언트 셋업 ← D-4n
- 5.2: DB 스키마 + RLS (테이블 5종)
- 5.3: 인증 (web cookie + mobile AsyncStorage)
- 5.4: 스토리지 (storage_path regex 정합 — D-4m 산출물 활용)
- 5.5: CRUD 연동 (web + mobile)

### 5.2 D-4n 첫 정찰 후보

3답 받기 전 미정. 첫 정찰 안:
1. tech-stack.md §Supabase 기 정의 확인 (버전, 도입 정책)
2. docs/agent-shared/operating-principles.md 의 Phase 5 전제 조건 확인
3. 기존 packages/domain 의 schema 가 Supabase DB 컬럼 (snake_case) 와 정합 확인 (이미 snake_case 임)
4. .env / .env.local 등 환경변수 패턴 기 정의 확인
5. **회사 망 Supabase Cloud (`*.supabase.co`) 접근 가능성 자동 확인** (D-4n 첫 turn 에 `curl -I https://supabase.com` 등으로 정찰)

### 5.3 잠재 위험

- **Supabase 의존성 추가**: pnpm add 신규 패키지 → corp 망 retry 위험 (회사 PC), 집 PC 는 무관
- **회사 망 정책**: Supabase Cloud (`*.supabase.co`) 접근 가능성 미확인. 차단 시 self-hosted 또는 prod 만 회사망 외 환경에서 작업 분기 검토
- **Auth 흐름 분기**: web (cookie) vs mobile (AsyncStorage) → Phase 5.3 의 thin slice 분리 필수
- **storage_path regex 정합**: D-4m 산출물 = `{user_id}/{project_id}/{photo_id}.{ext}`. Supabase Storage bucket policy + signed URL 와 정합되어야 함. Phase 5.4 진입 시 재검증.
- **Phase 5 첫 chunk 의 thin slice**: 5.1 만으로 끝 (스캐폴딩 + 클라이언트 1회 호출 = "hello supabase") → 안전 기준선

### 5.4 Phase 5 진입 전 마지막 확증 (D-4n 첫 turn)

- HEAD = D-4m Chunk 3 (본 commit) 또는 그 이후 정합
- 회사 망 정책 확인: Supabase Cloud 접근 가능성 (정찰 자동 수행)
- tech-stack.md §Supabase 정의 = single source of truth
- 사용자 결정: Supabase Cloud vs self-hosted (회사 망 차단 시)

## 6. D-4j 잔여 백로그 (V1 후반 처리)

- ~~**MF-06 H1**: D-4m close (HEAD=99a9a74)~~
- **MF-06 H3**: V1 후반 (재검토 필요 명문화)
- **MF-06 H4 (unique)**: V1 후반 (Phase 5 Supabase 도입 후 DB 레벨)
- **MF-11**: apps/web tsconfig 재구성. V1 후반
- **MF-02**: tailwind v3/v4 통합. V1 후반
- **MF-27**: lint-staged + prettier. V1 후반
- **MF-28/29/30**: V1 후반 또는 트리거 시점

## 7. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | 완료 |
| 4.4 코드 검수 | 전 코드 검수 (MF-25) | 완료 (D-4j, HEAD=02ea380) |
| 4.5 자동 검증 | Node pinning + MF-22/23/21 종결 | 완료 (D-4l, HEAD=694135a) |
| 4.6 MF-06 H1 close | storage_path regex + test 6 case | **완료 (D-4m, HEAD=f075462)** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | **D-4n 진입** |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 63% 지점 (Phase 5 진입 직전).

## 8. 새 대화창 시작 가이드 (D-4n)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4m 완료 (MF-06 H1 close, H3 재검토 명문화, HEAD=D-4m Chunk 3 본 commit).

오늘 진입 = D-4n (Phase 5.1 = Supabase 클라이언트 셋업, thin slice).

GitHub public: https://github.com/ceoYS/acspc

배경 (인지):
D-4m 3 chunk 완료. MF-06 H1 close (storage_path regex + photo.test.ts 6 case).
MF-06 H3 = V1 후반 (재검토 필요 명문화). 집 PC 작업 환경 표준화 (KI-01 정합 별도 PAT, KI-02 후보).
CI 49초 통과 (D-4l 자동 검증 인프라 첫 실전 활용).
사용자 결정: D-4j 잔여 (MF-06) 처리 완료 → Phase 5 진입.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4m-to-d4n.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- D-4n 목표 = Phase 5.1 (Supabase 클라이언트 셋업, thin slice "hello supabase" 1회 호출)
- 5.2~5.5 (DB schema, Auth, Storage, CRUD) 는 후속 D-4o 이후에서 분할
- Codex CLI 외부 Evaluator 활용 가능 (단일 분야 + file:line 근거 + docs 인용 hard rule). Planner 재확증 의무
- bash_tool preamble 필수 (CA 파일명 corp-root.pem) — 회사 PC 만, 집 PC 는 cert 라인 제거
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지 (단 docs-only / 작은 변경은 묵시적 승인 패턴 인정)
- explicit add list, no git add .
- CI 자동 검증: 매 push 마다 smoke + lint 통과 필수 (현재 평균 ~47초)

D-4 시리즈 방법론 — 필수 준수:
1. MF-13 우회: pnpm install/test 사용자 직접 실행, Claude Code 는 로그 grep
2. MF-14 정찰: git ls-files + git check-ignore -v
3. Chunk 분할, 선행 조건 명시, 단일 응답 당 Claude Code 프롬프트 1개
4. 성공/실패 판정은 명시 문자열 grep
5. 120초 STOP 조항
6. vitest 판정은 "Tests N passed (N)" 요약만
7. turbo grep 시 ^ anchor 금지
8. Codex CLI 활용 가능 (단일 분야, file:line 근거, docs 인용 file:line 의무). Planner 첫 정찰 재확증 의무
9. MF-20: Claude Code stdout 20 라인 제한
10. MF-24: rg 금지, grep -n 사용
11. 이슈 25 (D-4j): Generator 프롬프트 = 수행 명령만. Planner/Evaluator 메타는 사용자 메시지에만
12. KI-01 (D-4l): workflow 파일 변경 push 시 fine-grained PAT 의 Workflows permission 필수
13. (D-4m, KI-02 후보) 집 PC 작업 시 cert 라인 제거 + 별도 PAT 권장 (KI-01 정합)

D-4n 진입 즉시 정찰 (Planner):
- HEAD 정합성 확인 (D-4m Chunk 3 본 commit hash 또는 그 이후)
- .claude/rules/tech-stack.md §Supabase 기 정의 확인 (버전, 도입 정책)
- docs/agent-shared/operating-principles.md 의 Phase 5 전제 조건 확인
- 회사 망 Supabase Cloud (*.supabase.co) 접근 가능성 자동 정찰 (curl -I 등)

handoff 요약 보고 후 "D-4n Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4m Chunk 3 commit hash 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더 (회사 PC = cert 포함, 집 PC = cert 제거)
- [ ] D-4m 핵심 결정 (MF-06 H1 close, H3 V1 후반, 집 PC 표준화) 인식 확인
- [ ] D-4n 목표 (Phase 5.1 Supabase 셋업, thin slice "hello supabase") 인식 확인
- [ ] 회사 망 Supabase Cloud 접근 가능성 정찰 자동 수행 (D-4n 첫 turn)
