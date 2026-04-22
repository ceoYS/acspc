# Handoff — D-3d → D-4a (2026-04-22)

대화창 전환용 1회성 문서. D-4a 완료 후 삭제 가능.

## 1. 현재 repo 상태

- HEAD: 9e2ae85 (D-3d)
- 총 11개 커밋, origin/main 동기화 완료
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 커밋 히스토리

```
9e2ae85 docs(step4): add 05_design_reference.md (benchmarks: companycam, airtable, toss) (d-3d)
efb1994 docs(step4): pin installed versions in tech-stack.md (d-3c)
3426be0 chore(step4): scaffold apps/mobile (expo sdk 54 + expo-router, workspace-wide hoisted linker) (d-3b)
aa92484 chore(step4): scaffold apps/web (next.js 15 + app router, no google fonts) (d-3a)
6e9a2b6 chore(step4): scaffold turborepo + pnpm workspace (d-2)
8ea58b6 docs(backlog): record MF-01 (plan-review-gate bypass scope) for deferred fix
61cfd57 docs(step2-3): fix minor wording for V1 scope clarity and naming consistency
6b6110a docs(step2-3): add rules, skills, backlog readme
66e33be docs(step1): add agent operating principles and entry points
970b492 docs(step0): add strategy, v1 definition, pain points, interviews
1bbf37c chore: init acspc repo with gitignore
```

### 1.2 repo 구조

```
~/work/acspc/
├── apps/
│   ├── web/           (Next.js 15.5.15 + Tailwind 4 + React 19.1.0)
│   └── mobile/        (Expo SDK 54.0.33 + expo-router 6.0.23 + RN 0.81.5)
├── packages/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
│   ├── 00_strategy.md
│   ├── 01_v1_product_definition.md
│   ├── 02_pain_points_analysis.md
│   ├── 05_design_reference.md (NEW D-3d)
│   ├── _backlog/
│   │   ├── _README.md
│   │   ├── minor-fixes.md
│   │   └── handoff-d3d-to-d4a.md (이 파일)
│   ├── agent-shared/operating-principles.md
│   └── interviews/
├── .claude/
│   ├── rules/ (tech-stack, domain-model, ui-constraints, plan-review-gate)
│   └── skills/ (scope-cut, prd-update, kpi-check)
├── AGENTS.md
├── CLAUDE.md
├── package.json (name=acspc, packageManager=pnpm@10.33.0)
├── pnpm-workspace.yaml (nodeLinker: hoisted)
├── pnpm-lock.yaml
├── turbo.json
└── .gitignore
```

## 2. 환경 전제 (Claude Code bash_tool 에서 반드시 적용)

### 2.1 bash_tool preamble

Claude Code 의 `bash_tool` 은 비대화형 shell → ~/.bashrc 의 case-return 이후 구간을 읽지 않음. 따라서 **매 bash 명령 앞에 반드시** 다음 preamble 을 prefix:

```
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-ca.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&
```

이 preamble 이 없으면:
- Node 20.17.0 (시스템 default) 적용 → tech-stack 스펙 위반
- NODE_EXTRA_CA_CERTS 미로드 → 일부 네트워크 요청에서 cert 에러 가능

### 2.2 회사 PC 네트워크 특이사항

- HDEC 기업망은 TLS MITM (HMG Secure ROOT CA) 적용
- `~/.certs/corp-ca.pem` 에 CA 설치되어 있음
- Google Fonts (fonts.googleapis.com) 는 차단 → apps/web 에서 system font 로 대체함
- npm registry, api.expo.dev, github.com 접근 가능

### 2.3 pnpm 설정

- node-linker=hoisted (pnpm-workspace.yaml 에 `nodeLinker: hoisted` 명시)
- 이유: Expo Metro bundler + pnpm symlink 호환성
- network-concurrency=4, fetch-retries=5, fetch-timeout=300000 (회사망 적응)

## 3. 확정 기술 스택 (tech-stack.md 기준)

### 웹
- Next.js 15.5.15 + App Router + Turbopack
- React 19.1.0
- Tailwind CSS 4.x
- TanStack Query v5 (아직 미설치, D-4 예정)

### 모바일
- Expo SDK 54.0.33 (managed workflow)
- expo-router 6.0.23
- React Native 0.81.5
- NativeWind (아직 미설치, D-4 예정)

### 공통
- TypeScript 5.9.2 (strict + noUncheckedIndexedAccess)
- Node 22.22.2 (Active LTS)
- pnpm 10.33.0
- Turborepo 2.9.6

### 백엔드 (D-5 예정)
- Supabase (Postgres, Auth, Storage, RLS, Edge Functions)
- zod v4
- exceljs (서버 측 Edge Function 전용)

### 금지 라이브러리
Redux/Zustand/MobX, styled-components/Emotion, axios, Moment.js, SWR, RN UI 키트, Prisma, tRPC

## 4. acspc 프로젝트 원칙

### 4.1 역할 분리

- **Planner**: 목표 분해, 범위 축소, 읽을 파일 결정, 위험 점검. 코드 작성 금지.
- **Generator**: Claude Code 에 넣을 실행 프롬프트 작성.
- **Editor**: 실제 파일 수정. Claude Code 가 담당.

### 4.2 핵심 원칙

- 범위 확장 요청은 scope-cut 관점으로 검토
- V1 은 요청 → 완료 → 승인 한 루프만 우선
- 기술 스택은 tech-stack.md 밖으로 확장 금지
- 디자인보다 동작, 완성도보다 thin slice 우선
- 모든 Gate 2 승인 전 push 금지 (push 는 별도 승인)

### 4.3 V1 6기능 (docs/01 기준)

1. 프로젝트 단위 마스터 설정 (위치·공종·업체)
2. 촬영 전 태그 드롭다운 선택
3. 연속 촬영 (태그 유지, 내용 중간 변경)
4. 갤러리 동기화 (평면 앨범)
5. 업체별 사진대지 엑셀 자동 생성 (서버 Edge Function)
6. 동기화 수동/자동 트리거

## 5. Backlog (MF 상태)

### docs/_backlog/minor-fixes.md 기록됨
- **MF-01**: plan-review-gate.md Gate 1 우회 범위 (low, D-4~D-6 중 소화)

### 미기록 상태 (참고 메모)
- Google Fonts 차단 우회 (apps/web system font 로 이미 처리됨, backlog 불필요)
- Claude Code 컨텍스트 clear 반복 사건 (운영 주의만, 구조 이슈 아님)

## 6. 다음 턴 (D-4a) 스펙 초안

### 목표
apps/web 에 design reference (docs/05_design_reference.md) 색상 토큰을 Tailwind 4 `@theme` 로 연결.

### 범위 (thin slice)
- apps/web/app/globals.css 의 `@theme inline` 블록에 토큰 추가
  - Primary, Accent, Surface, Semantic 4 종
- layout.tsx 또는 page.tsx 에 **아주 간단한** 색상 확인 화면 1개 (기본 페이지에 버튼 1개 정도)
- **컴포넌트 완성 아님**. 토큰 적용 확인 수준.
- 단일 커밋

### 범위 외 (D-4b 이후)
- apps/mobile NativeWind 설정
- 실제 V1 화면 구현
- Supabase 연결

### 읽을 파일 (D-4a 시작 시)
- docs/05_design_reference.md §3.1 색상 팔레트 (L70~L96)
- apps/web/app/globals.css (현재 상태)
- apps/web/app/layout.tsx
- apps/web/tailwind.config.* (있는지 확인)

### 잠재 위험
- Tailwind 4 의 `@theme inline` 문법이 Tailwind 3 와 다름 (우리는 Tailwind 4)
- design reference 의 Accent 는 `bg-orange-600` — Tailwind 기본 팔레트라 커스텀 정의 불필요
- Primary `bg-slate-900` 도 기본 팔레트
- 즉 실제로 `@theme` 에 추가할 **커스텀 토큰은 많지 않음**
- scope cut: design reference 값이 모두 Tailwind 기본 팔레트 내이면 **커스텀 토큰 생략, 검증 화면만**

## 7. 해결된 환경 이슈 (재발 방지 목록)

이 이슈들은 오늘 세션에서 이미 해결됨. 새 세션에서는 re-debug 불필요.

1. **Node 20 → 22 업그레이드**: nvm 으로 Node 22.22.2 설치, default 설정
2. **HMG Root CA 등록**: ~/.certs/corp-ca.pem 영구 배치, NODE_EXTRA_CA_CERTS 환경변수
3. **.bashrc 구조 정리**: NODE_EXTRA_CA_CERTS + Node 22 PATH 를 case return 이전으로 이동
4. **pnpm 10 hoisted linker**: pnpm-workspace.yaml 에 `nodeLinker: hoisted` (Expo 호환)
5. **Next 16 → 15 rollback**: create-next-app@15 명시, SDK 54 (Expo) 도 stable 수용
6. **Google Fonts 회사망 차단**: apps/web/app/layout.tsx 에서 Geist 제거, system font 사용
7. **create-expo-app pnpm config 오염**: `~/.config/pnpm/rc` 가 아니라 pnpm-workspace.yaml 에 hoisted 단일 출처

## 8. 새 대화창 시작 가이드

### 새 대화창에 붙여넣을 첫 프롬프트 제안

```
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

이전 대화창 컨텍스트 포화로 전환. D-3d 까지 완료 상태.
아래 handoff 파일 읽고 맥락 파악한 뒤 D-4a 진입해주세요.

docs/_backlog/handoff-d3d-to-d4a.md

(GitHub public: https://github.com/ceoYS/acspc)

원칙:
- Planner → Generator → Editor 3단계 분리
- bash_tool preamble 필수
- D-4a 는 thin slice: Tailwind 토큰 확인 수준

제가 준비됐을 때 "D-4a Planner 시작해" 라고 말하겠습니다.
```

### 전환 시 기억할 것

- 오늘 3시 52분 시작 기준 약 1시간 45분 남음 (새 대화창 기준 5시 40분까지)
- D-4a 는 단일 커밋 목표, 30~60분 예상
- 만약 D-4a 도중 오늘 시간 초과되면 **커밋 후 중단**, 내일 D-4b 부터 이어서

