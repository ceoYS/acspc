# Handoff — D-4a → D-4b (2026-04-22, Session 2 end)

새 대화창 전환용. D-4b 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d3d-to-d4a.md) 는 이력으로 남아 있음. 필요 시 참조.

## 1. 현재 상태 (D-4a 완료)

- HEAD: bb63796 (feat(web): add design token verification page and align system font (d-4a))
- 총 13개 커밋, origin/main 동기화 완료 (push 완료 가정)
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4a 에서 변경된 파일 (2개만)

- apps/web/app/globals.css
  - font-family: Arial → system-ui
  - @media (prefers-color-scheme: dark) 블록 주석 처리 (V1 범위 외)
- apps/web/app/page.tsx
  - 기본 Next.js 홈 → 색상 팔레트 검증 페이지 (119 lines)
  - 섹션: Primary / Accent / Surface / Semantic / Text / Tag Chip
  - 모든 색상은 Tailwind 4 기본 팔레트 (커스텀 토큰 추가 없음)

### 1.2 최근 커밋 (top 5)

```
bb63796 feat(web): add design token verification page and align system font (d-4a)
8a2ed66 docs(backlog): handoff from d-3d to d-4a (session transition)
9e2ae85 docs(step4): add 05_design_reference.md (benchmarks: companycam, airtable, toss) (d-3d)
efb1994 docs(step4): pin installed versions in tech-stack.md (d-3c)
3426be0 chore(step4): scaffold apps/mobile (expo sdk 54 + expo-router, workspace-wide hoisted linker) (d-3b)
```

## 2. 환경 전제 (변동 없음)

이전 handoff (handoff-d3d-to-d4a.md §2) 참조. 주요 내용:

- bash_tool preamble 필수:
  `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-ca.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&`
- HDEC 기업망 TLS MITM + corp CA 설치됨
- pnpm-workspace.yaml 의 nodeLinker: hoisted 유지

## 3. 기술 스택 (변동 없음)

이전 handoff §3 참조. D-4a 에서 새 의존성 추가 없음.

## 4. 프로젝트 원칙 (변동 없음)

이전 handoff §4 참조. 3단계 역할 분리, V1 scope cut, thin slice 우선.

## 5. Backlog (변동 없음)

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위. 미처리.

## 6. D-4a 에서 확인된 것 (scope cut 근거)

- design reference §3.1 의 모든 색상이 Tailwind 4 기본 팔레트 내
- globals.css 의 @theme inline 커스텀 토큰 추가 **불필요** 확인
- 따라서 D-4b 에서 mobile 측도 NativeWind 만 정상 설정되면 **동일하게 기본 팔레트로 해결 가능**

## 7. 다음 턴 (D-4b) 스펙 초안

### 목표
apps/mobile 에 NativeWind 통합 + 모바일 측 색상 검증 페이지.

### 범위 (thin slice — 단일 커밋 목표, 상황 따라 2 커밋 분리 가능)

1. NativeWind 설치
   - Expo SDK 54 호환 버전 확인 필요 (NativeWind 4.x vs v4 호환성)
   - apps/mobile/package.json 에 nativewind 추가
   - Tailwind 설치 (웹 이미 있지만 mobile workspace 에는 없을 수 있음)

2. apps/mobile/tailwind.config.js 생성
   - content: `./app/**/*.{js,jsx,ts,tsx}`
   - preset: nativewind preset

3. apps/mobile/metro.config.js 수정
   - NativeWind 플러그인 적용

4. apps/mobile/global.css 또는 동등 파일 생성
   - `@tailwind base; @tailwind components; @tailwind utilities;` (Tailwind 3 계열 기준)
   - 또는 Tailwind 4 계열이면 `@import "tailwindcss"`

5. apps/mobile/app/_layout.tsx 상단에 global.css import

6. apps/mobile/app/index.tsx 를 색상 검증 화면으로 교체
   - 웹 apps/web/app/page.tsx 와 유사한 구조
   - 단, RN 컴포넌트 (View, Text, Pressable) 사용
   - `className` 으로 Tailwind 클래스 적용

### 범위 외 (D-4c 이후)
- 실제 V1 화면 구현
- Supabase 연결
- packages/domain (zod), packages/api

### 읽을 파일 (D-4b 시작 시)
- apps/mobile/app/_layout.tsx (현재 상태)
- apps/mobile/app/index.tsx (현재 상태)
- apps/mobile/package.json
- apps/mobile/metro.config.js (있는지 확인)
- docs/05_design_reference.md §3.1, §3.3

### 주요 위험 (중요)

1. **NativeWind + Expo SDK 54 + Tailwind 4 호환성**
   - NativeWind 는 2026-04 기준으로 Tailwind 3 기반이 stable, Tailwind 4 는 beta 또는 제한적 지원일 가능성
   - 확인 방법: NativeWind 공식 문서에서 Expo SDK 54 + Tailwind 4 지원 여부 검증
   - 만약 Tailwind 4 미지원: mobile 만 Tailwind 3 사용하고 web 은 Tailwind 4 유지 (설정 분리) 가능

2. **apps/web 의 Tailwind 버전 (4.x) 과의 정합성**
   - web 과 mobile 이 다른 Tailwind 메이저 쓰면 **클래스 해석 차이** 가능성
   - 디자인 레퍼런스 클래스 중 `size-16`, `min-h-12` 등이 양쪽 동일하게 48/56/64 로 맵핑되는지 검증

3. **Metro bundler + NativeWind 의 잠재 이슈**
   - pnpm hoisted linker 와 NativeWind symlink 처리 충돌 가능성
   - 만약 에러 발생 시 `pnpm-workspace.yaml` 수정 금지 (D-3b 에서 이미 확정됨)

4. **커밋 단위**
   - 단일 커밋 시도, 설정 중 에러 반복되면 "설치 + 설정" / "화면 교체" 2 커밋으로 분리

### D-4b 성공 기준
- Expo 개발 서버 시작 시 에러 없음
- iOS/Android 시뮬레이터 또는 Expo Go 앱에서 검증 페이지 표시
- Tailwind 클래스가 RN 컴포넌트에 정상 적용

## 8. 새 대화창 시작 가이드

### 복사 붙여넣을 첫 프롬프트

```
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

이전 대화창 컨텍스트 포화로 전환. D-4a 까지 완료 상태.
HEAD: bb63796, 총 13 커밋, origin/main 동기화 완료.
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4a-to-d4b.md

(또는 WSL 직접 cat: ~/work/acspc/docs/_backlog/handoff-d4a-to-d4b.md)

원칙:
- Planner → Generator → Editor 3단계 분리
- bash_tool preamble 필수
- D-4b 는 NativeWind + mobile 검증 화면 (단일 또는 2커밋)
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지

준비되면 handoff 요약 후 "D-4b Planner 시작해" 대기.
```

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 bb63796 을 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더 전달

