# Handoff — D-4c → D-4d (2026-04-23/24, Session 4 end)

새 대화창 전환용. D-4d 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4b-to-d4c.md, handoff-d4a-to-d4b.md, handoff-d3d-to-d4a.md) 는 이력으로 남음.

## 1. 현재 상태 (D-4c + §3.3 Evaluator 공식화 완료)

- HEAD: 685b936 (docs(shared): add Evaluator 점검 체크리스트 and 면제 근거 제시 의무 (§3.3))
- 총 24개 커밋, origin/main 동기화 완료
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4c 에서 변경된 것

**D-4c-1 (21e2764)**: packages/domain 스캐폴딩 + zod v4 스키마 5개
- packages/domain/package.json (신규, @repo/domain, zod ^4)
- packages/domain/tsconfig.json (신규, extends base)
- packages/domain/src/{index,project,location,trade,vendor,photo}.ts (신규, core 필드만)
- docs/_backlog/minor-fixes.md (append MF-04/05/06)
- pnpm-lock.yaml

**D-4c-1 fixup (7929c75)**: bundler resolution 전환
- packages/domain/src/index.ts (.js 확장자 제거)
- packages/domain/tsconfig.json (module: esnext, moduleResolution: bundler 추가)
- 배경: D-4c-1 때 NodeNext 로 tsc --noEmit 은 통과했으나 Next turbopack 번들링에서 "Module not found: Can't resolve './trade.js'" 실패. bundler resolution 으로 전환해서 Next + Metro 양쪽 호환 확보.

**D-4c-2 (4b0a978)**: apps/web 에서 @repo/domain import 검증
- apps/web/package.json (@repo/domain: workspace:* 추가)
- apps/web/next.config.ts (transpilePackages: ["@repo/domain"] 추가)
- apps/web/app/domain-check/page.tsx (신규, ProjectSchema.safeParse valid + invalid 2회 + 결과 렌더)
- docs/_backlog/minor-fixes.md (append MF-07/08)
- pnpm-lock.yaml

**§3.3 Evaluator 공식화 (685b936)**: 점검 체크리스트 + 면제 근거 제시 의무
- docs/agent-shared/operating-principles.md (§3.3 내 5개 블록 구조: 발동 조건 / 면제 / 면제 근거 제시 의무 / 점검 체크리스트 / 심각도)

### 1.2 최근 커밋 (top 6)

```
685b936 docs(shared): add Evaluator 점검 체크리스트 and 면제 근거 제시 의무 (§3.3)
4b0a978 feat(web): verify @repo/domain import with safeParse page (d-4c-2)
7929c75 fix(domain): switch to bundler resolution for web/metro compat (d-4c-1 fixup)
21e2764 chore(domain): scaffold @repo/domain with zod v4 schemas (d-4c-1)
94ec528 docs: align CA filename to corp-root.pem (CLAUDE.md)
036cffb docs(shared): add Evaluator 발동 조건 (§3.3) and renumber subsections
```

## 2. 환경 전제 (변동 없음)

handoff-d4b-to-d4c §2 와 동일. 요약:

- CA 파일명: `corp-root.pem` (corp-ca.pem 은 symlink fallback)
- preamble 필수: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&`
- Windows 경로 시작 시 `wsl -d Ubuntu -e bash -c "..."` 감싸기
- pnpm 은 기존 store reuse 시 빠름. 신규 대용량 패키지 fetch 는 corp 망 hang 가능 (npm 우회 fallback)

## 3. 기술 스택 (D-4c 에서 추가된 것)

packages/domain:
- zod ^4 (실설치 4.3.6)
- TS base.json 의 NodeNext 를 domain 에서만 bundler 로 override
- source-first (main/types = ./src/index.ts, noEmit: true)
- turbo pipeline 의 check-types 로 typecheck 가능

apps/web:
- @repo/domain workspace 의존성
- next.config.ts 에 transpilePackages: ["@repo/domain"]
- 검증 페이지 /domain-check (ProjectSchema.safeParse valid + invalid)

apps/mobile 측은 D-4c 에서 미터치. MF-04 로 후속 턴 대상.

## 4. 프로세스 원칙 (D-4c 에서 변동 — 중요)

### 4.1 3역할 확정

**Planner / Generator / Evaluator.** "Editor" 용어 폐기 완료 (operating-principles.md §3 + CLAUDE.md + AGENTS.md 전반 정리됨). Generator 가 Claude Code 실행까지 포함.

### 4.2 Evaluator 발동 조건 (§3.3 7개)

1. 환경 명령 포함 (install/build/network)
2. 외부 의존성 추가
3. 복수 파일 동시 수정
4. 설정 파일 생성/수정
5. 이전 세션 이슈 패턴과 유사
6. 수치 검증 조건 사전 명기

1개라도 해당 시 Evaluator 필수.

### 4.3 Evaluator 면제 조건 + 근거 제시 의무 (§3.3 신규)

면제 가능 (사용자 명시 승인 + Planner 근거 제시 시):
- docs-only 단일 파일 추가/편집
- 기존 파일 20줄 이하 수정
- backlog / handoff 기록

면제 근거 제시 의무 (신규):
- Planner 가 "왜 blind spot 을 유발하지 않는지" 구체적 근거 제시
- blind spot 예시: tsc 통과 ≠ bundler 성공, registry retry 루프, bash 체인 exit 전파
- 사용자가 근거 불충분하다고 판단하면 면제 거부 후 Evaluator 필수 적용

### 4.4 Evaluator 점검 체크리스트 (§3.3 12개 a~l)

Evaluator 가 Generator 산출물 검토 시 점검:
- a. 명령어 shell 구문 오류
- b. 검증 수치 재계산
- c. 이전 이슈 재발 리스크
- d. 범위 제한 정합
- e. Gate 2 trigger 명확성
- f. 금지사항 누락
- g. 롤백 경로
- h. 외부 API 실체 검증
- i. 설정 파일 extends 내용
- **j. 번들러 실동작 검증 (D-4c-1 fixup 교훈)**
- **k. registry 접근 명령 금지 (D-4c-2 pnpm list retry 루프 교훈)**
- **l. bash 체인 exit 전파 방어 (D-4c-2 ls exit 2 meta-loop 교훈)**

## 5. Backlog 현황

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02: apps/web/tailwind major vs apps/mobile 일치 — V1 후반
- MF-03: WSL2 ↔ iPhone Expo Go 접속 — dev build 시점
- MF-04 (신규 D-4c-1): mobile 측 @repo/domain import 검증
- MF-05 (신규 D-4c-1): vitest 테스트 프레임워크 도입
- MF-06 (신규 D-4c-1): domain schema 고급 제약 반영 (특수문자 치환, taken_at 미래 금지, storage_path regex, unique)
- MF-07 (신규 D-4c-2): apps/web tsconfig noUncheckedIndexedAccess 미설정 (tech-stack.md §1.8 권장)
- MF-08 (신규 D-4c-2): apps/web check-types 스크립트 미정의

## 6. D-4c 에서 발견된 실전 이슈 + Evaluator 교훈

### 6a. 환경/도구 실전 이슈

#### 이슈 5: packages/domain `.js` 확장자 + NodeNext + Next 번들러 충돌

- D-4c-1 에서 base.json 의 `module: NodeNext` 때문에 `.js` 확장자 붙임
- `tsc --noEmit` 은 통과 (NodeNext 가 `.js` 를 `.ts` 로 resolve)
- 하지만 Next turbopack 번들링 시 `Module not found: Can't resolve './trade.js'` 실패
- **해결**: packages/domain/tsconfig 에 `moduleResolution: "bundler"` override + index.ts 의 `.js` 확장자 제거 (커밋 7929c75)
- **교훈**: monorepo 의 packages/* 가 apps/* 에서 번들러로 소비되면 bundler resolution 이 적합. tsc 통과 ≠ 번들러 성공 → §3.3 체크 j 로 공식화

#### 이슈 6: pnpm -r list 의 corp 망 registry retry 루프

- D-4c-2 Step 4 검증 중 `pnpm -r list --depth 0` 이 registry 접속 시도 → retry 1/10 에서 멈춤
- Claude Code 가 몇 분간 대기 상태 ("Sketching… 4m 49s")
- **해결**: 명령 중단 + lockfile grep / readlink 로 검증 대체
- **교훈**: pnpm list/why/outdated 는 registry 타므로 corp 망에서 금지. 검증은 로컬 파일시스템 조회만 → §3.3 체크 k 로 공식화

#### 이슈 7: bash 체인 `&&` 의 exit 전파 → Claude Code meta-loop

- D-4c-2 Step 4 중 `ls -la node_modules/@repo/` 가 디렉토리 부재로 exit 2
- 뒤따르는 검증 명령 skip + Claude Code 가 "Exit code 2" 에서 판단 중지
- 이후 `/clear` 도 안 통하는 상태로 meta-loop 진입
- **해결**: Claude Code 세션 완전 종료 + 새 세션에서 복구 프롬프트로 재개
- **교훈**: 검증 체인은 `|| true` 또는 `;` 로 방어. Hashing/Sketching 60초+ 지속 시 세션 reset 권장 → §3.3 체크 l 로 공식화

### 6b. Evaluator 구조적 결손 실증

- **D-4c-1 Generator v1 Evaluator 1차**: Critical 2 / High 3 / Medium 4 발견 → v2 로 수정
- **사용자의 "Evaluator 누락" 지적이 정확**: 이전 D-3a (Next 16 사고), D-3b (hoisted linker 논쟁) 모두 동일 패턴
- **결론**: Evaluator 는 구조적으로 필요. 공식 3역할로 승격 완료 (685b936 커밋)

### 6c. Evaluator 의 메타 한계

- D-4c-1 Evaluator v2 도 "tsc 통과" 만 검증 → 번들러 실동작 실패를 놓침
- fixup 커밋 (7929c75) 으로 소급 수정 필요했음
- **교훈**: Evaluator 체크리스트 자체가 진화해야 함. §3.3 점검 체크리스트에 j/k/l 신규 3항목 추가로 반영 완료

## 7. 다음 턴 (D-4d) 스펙 초안

### 목표 후보 4개 (사용자 "목표=N" 회신 대기)

1. **MF-04 처리**: mobile 측 @repo/domain import 검증
   - apps/mobile/package.json 에 @repo/domain 추가
   - 검증 페이지 생성 (apps/mobile/app/(tabs)/ 계열 또는 별도 route)
   - Metro 가 source-first TS 해석 가능한지 실증
   - 실패 시 transpilePackages 유사 설정 또는 tsup 빌드 도입
   - packages/domain 이 bundler resolution 이니 Metro 도 호환 가능성 높음 (D-4c-1 fixup 의 효과 검증)

2. **Supabase 클라이언트 설정**: packages/api 스캐폴딩 + web/mobile 연결
   - V1 실제 데이터 흐름 시작점
   - domain 스키마와 Supabase row 타입 정합 검증
   - 인증 플로우는 이번 범위 외

3. **MF-05 처리**: vitest 테스트 프레임워크 도입
   - packages/domain zod 스키마 parse 성공/실패 단위 테스트
   - 향후 모든 패키지 테스트 기반
   - 짧은 턴으로 완료 가능

4. **MF-06 처리**: domain schema 고급 제약 완전 반영
   - Vendor.name 특수문자 치환 (transform)
   - Photo.taken_at 미래 금지 (refine)
   - Photo.storage_path 형식 검증 (regex)
   - MF-05 (vitest) 있으면 테스트 보강 용이

### Planner 사전 추천

**1번 (MF-04) 먼저 권장.**
- D-4c-2 web 검증과 대칭. mobile 도 같은 domain 소비 가능한지 확증
- Metro 가 source-first 에서 실패하면 일찍 발견해서 tsup 전환 판단
- 2번 (Supabase) 은 domain 이 양쪽에서 import 가능한 게 전제라 1번 선행 필요
- 3번 (vitest) 은 짧은 턴이라 언제든 끼워넣기 가능
- 4번 (MF-06) 은 3번 (vitest) 선행이 이상적 (테스트 없이 refine/transform 검증은 눈으로만)

순서 제안: 1 → 3 → 4 → 2 (또는 1 → 2 병행, 3/4 는 간격 채우기)

### 범위 외 (D-4d 이후)

- 실제 V1 화면 구현
- 인증 플로우 실구현
- 이미지 업로드
- MF-01~03, MF-07/08 (별도 정리 턴)

## 8. 새 대화창 시작 가이드

### 복사 붙여넣을 첫 프롬프트

```
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

이전 대화창 컨텍스트 포화로 전환. D-4c 전체 + §3.3 Evaluator 공식화 완료 상태.
HEAD: 685b936, 총 24 커밋 + handoff 1개, origin/main 동기화 완료.
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4c-to-d4d.md

원칙:
- Planner / Generator / Evaluator 3역할 분리 (Editor 폐기 완료)
- Evaluator 발동 조건 §3.3 (7개 트리거 / 3개 면제 조건 + 근거 제시 의무 / 12개 점검 체크리스트 a~l)
- bash_tool preamble 필수 (CA 파일명 corp-root.pem)
- D-4d 범위는 handoff §7 에서 사용자 결정 후 진행
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no `git add .`

handoff 요약 보고 후 "D-4d Planner 시작해, 목표=N" 대기.
```

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 685b936 + handoff 커밋을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더
- [ ] CA 파일명 `corp-root.pem` 확인 리마인더
- [ ] Evaluator 3역할 (not 4) 인식 확인
- [ ] 프로젝트 메모리 (Claude.ai Project 설정) 가 repo 문서와 동기화됐는지 — 2026-04-23 전체판으로 갱신됨 (확인)
