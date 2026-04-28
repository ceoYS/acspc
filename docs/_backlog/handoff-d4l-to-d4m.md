# Handoff — D-4l → D-4m (2026-04-28, Session 13 end)

## 1. Session 13 (D-4l) 종결 요약

D-4l Phase 4.5 마무리. MF-21 (CI workflow) 종결. **Phase 4.5 = 3/3 완료**.

- Chunk 1 (사전 설계 + 실행): 시나리오 A 확정 + `.github/workflows/ci.yml` 신규 (HEAD=694135a)
- Chunk 2 (push): PAT workflow scope 부재 STOP → fine-grained PAT 신규 발급 → push 성공 → CI 첫 run ✅ 성공 (50초)
- Chunk 3 (docs): 본 commit (handoff + known-issues + MF-21 close + MF-28/29/30 신설)

검수 결과: Critical 0, High 0. CI 첫 run 50초 통과 실증. Phase 4.5 자동 검증 인프라 완성.

## 2. 환경 가정 + 검증

본 turn 진입 시 다음 명령으로 환경 확증:

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
- HEAD: <D-4l Chunk 3 commit hash> (또는 그 이후, D-4m 진입 시 재확인)
- git status clean

## 3. D-4l 핵심 결정 (변경 사항)

- **Fine-grained PAT 도입**: classic PAT 가 아닌 fine-grained PAT 표준화. repo-specific (ceoYS/acspc only) + 최소 권한 (Contents/Metadata/Workflows). 90일 만료. WSL credential.helper = store 로 영구 저장. → 90일 후 재발급 패턴 known-issues.md KI-01 에 명문화
- **actions 메이저 = v4 트리오 (보수)**: pnpm.io 공식 docs 권장 패턴. v6 마이그는 MF-28 백로그 (Node24 default 전환 시점)
- **trigger 정책**: push to main + PR to main. push.branches:[main] 과 pull_request.branches:[main] 동시 활성화에서 동일 PR 이중 트리거 미발생 (Codex 검증)
- **CI 시간 = 50초**: 당초 추정 (4~9분) 대비 매우 빠름. corp 망 무관. 모노레포 thin slice + 부채 정리 누적 효과
- **PAT workflow scope 정책 학습**: known-issues.md KI-01 신설. 향후 동일 사고 방지

## 4. D-4l 신규 백로그 후보

- **MF-28**: actions 메이저 v4 → v6 마이그 (Node24 default 전환 시점 또는 V1 후반)
- **MF-29**: branch protection rules + status check 의무화 (협업/V2 진입 시)
- **MF-30**: dependabot.yml (MF-29 후)
- **KI-01 (known-issues.md 신규 신설)**: GitHub PAT workflow scope 정책

## 5. D-4m 다음 턴 스펙 — D-4j 잔여 (MF-06 H1/H3) 우선

### 5.1 D-4m = MF-06 H1 + H3 처리

handoff §6 (D-4k handoff 인용) 명시: "MF-06 H1/H3 잔여는 Phase 5 (Supabase) 진입 전 처리 권장".

- **MF-06 H1**: Photo.storage_path regex 검증 추가
- **MF-06 H3**: Vendor.name 특수문자 sanitize

### 5.2 D-4m 첫 정찰 후보

3답 받기 전 미정. 첫 정찰 안:
1. packages/domain 의 Photo / Vendor schema 현재 정의 확인 (zod v4 기준)
2. apps/web / apps/mobile 에서 해당 schema 소비 위치 grep
3. 기존 sanitize / regex 처리 유무 검토 (이미 부분 처리되어 있을 가능성)

### 5.3 잠재 위험

- regex / sanitize 처리 = packages/domain 변경 → 양측 (apps/web, apps/mobile) 번들 영향 가능 → CI smoke 자동 검증으로 안전망 확보 (D-4l Chunk 1 도입 효과)
- D-4j 종결 시점 (HEAD=02ea380) 이후 D-4k/D-4l 동안 packages/domain 변경 없음 (자동 검증 인프라만 도입) → MF-06 처리 환경 동일

## 6. D-4j 잔여 백로그 (Phase 5 전 처리 권장)

- **MF-06 H1/H3**: D-4m 진입 (본 handoff 다음 turn)
- **MF-11**: apps/web tsconfig 재구성 (extends @repo/typescript-config). V1 후반
- **MF-02**: tailwind v3/v4 통합. V1 후반
- **MF-27 후보 (D-4k 신설)**: lint-staged + prettier. V1 후반
- **MF-28/29/30 (D-4l 신설)**: V1 후반 또는 트리거 시점

## 7. 전체 진도 체크포인트

| Phase | 내용 | 상태 |
|---|---|---|
| 0 프로세스 | 역할 분리, Gate 2, handoff, 이슈 축적 | 완료 |
| 1 인프라 | monorepo, pnpm, turbo, Next/Expo 스캐폴딩 | 완료 |
| 2 도메인 | packages/domain + zod v4 + 양측 import 실증 | 완료 |
| 3 부채 정리 1차 | MF-07/08/09/10 | 완료 (D-4e) |
| 4 테스트/제약 | vitest (D-4f), domain refine (D-4g), §3.3 체크리스트 확장 (D-4h), MF-16 resolved (D-4i) | 완료 |
| 4.4 코드 검수 | 전 코드 검수 (MF-25) | 완료 (D-4j, HEAD=02ea380) |
| **4.5 자동 검증** | **Node pinning + MF-22/23/21 종결** | **3/3 완료 (D-4l, HEAD=694135a)** |
| 5 데이터 레이어 | Supabase, 인증, 스토리지 | 대기, D-4m (MF-06 잔여) 후 진입 |
| 6 V1 실기능 | 실제 화면, CRUD, 업로드 | 대기 |

V1 완성 기준 대비 약 60% 지점 (Phase 4.5 = 완료, Phase 5 진입 직전).

## 8. 새 대화창 시작 가이드 (D-4m)

### 복사 붙여넣을 첫 프롬프트

아래 텍스트 (--- CUT --- 사이) 를 새 대화창에 복붙:

--- CUT ---
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.
이전 대화창 컨텍스트 부담 누적 전 전환.
D-4l 완료 (Phase 4.5 = 3/3 완전 종결, MF-21 close, HEAD=694135a + handoff push).

오늘 진입 = D-4m (D-4j 잔여: MF-06 H1/H3 처리, Phase 5 전 마무리).

GitHub public: https://github.com/ceoYS/acspc

배경 (인지):
D-4l 3 chunk 완료. Phase 4.5 자동 검증 인프라 완성 (Node pinning + smoke + simple-git-hooks pre-commit + GitHub Actions CI).
신규 이슈: PAT workflow scope 정책 (KI-01, known-issues.md).
사용자 결정: D-4j 잔여 (MF-06 H1/H3) 우선 처리 후 Phase 5 진입.

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4l-to-d4m.md

원칙:
- Planner / Generator / Evaluator 3역할 분리
- D-4m 목표 = MF-06 H1/H3 처리 (packages/domain Photo.storage_path regex + Vendor.name sanitize)
- Codex CLI 외부 Evaluator 활용 가능 (단일 분야 + file:line 근거 + docs 인용 hard rule). Planner 재확증 의무
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- 범위 확장 요청은 scope-cut
- 사용자 원칙: 오류 최소화 + 유지보수 수월함. 속도보다 안정.
- Gate 2 승인 전 push 금지 (단 docs-only / 작은 변경은 묵시적 승인 패턴 인정)
- explicit add list, no git add .
- CI 자동 검증: 매 push 마다 smoke + lint 통과 필수 (50초)

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
12. KI-01 (D-4l 신규): workflow 파일 변경 push 시 fine-grained PAT 의 Workflows permission 필수

D-4m 진입 즉시 정찰 (Planner):
- HEAD 정합성 확인 (handoff push 후 새 hash)
- packages/domain Photo / Vendor schema 위치 + 현재 정의 (zod v4)
- 양측 (apps/web, apps/mobile) 의 schema 소비 위치 grep
- 기존 sanitize / regex 처리 유무

handoff 요약 보고 후 "D-4m Planner 본 턴 정찰 시작" 대기.
--- CUT ---

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 D-4l 종결 commit hash (Chunk 3 push hash) 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] D-4l 핵심 결정 (fine-grained PAT, actions v4 트리오, CI 50초) 인식 확인
- [ ] D-4m 목표 (MF-06 H1/H3) 인식 확인
- [ ] KI-01 (PAT workflow scope) 인식 확인
