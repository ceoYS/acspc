# Handoff — D-4b → D-4c (2026-04-23, Session 3 end)

새 대화창 전환용. D-4c 진입 시 이 파일만 읽으면 맥락 확보 가능.
이전 handoff (handoff-d4a-to-d4b.md) 는 이력으로 남음.

## 1. 현재 상태 (D-4b 완료)

- HEAD: c3744fe (feat(mobile): add color verification screen with nativewind (d-4b-2))
- 총 16개 커밋, origin/main 동기화 완료
- Working tree clean
- GitHub: https://github.com/ceoYS/acspc (public)

### 1.1 D-4b 에서 변경된 것

D-4b-1 (4666541): NativeWind v4.2.3 + Tailwind 3.4.17 통합
- apps/mobile/package.json (nativewind, tailwindcss devDep)
- apps/mobile/tailwind.config.js (신규)
- apps/mobile/babel.config.js (신규)
- apps/mobile/metro.config.js (신규)
- apps/mobile/global.css (신규)
- apps/mobile/nativewind-env.d.ts (신규)
- apps/mobile/app/_layout.tsx (import "../global.css" 추가)
- apps/mobile/tsconfig.json (NativeWind 자동 수정, nativewind-env.d.ts include)
- apps/mobile/.gitignore (package-lock.json 추가)
- pnpm-lock.yaml

D-4b-2 (c3744fe): 색상 검증 화면
- apps/mobile/app/(tabs)/index.tsx (Expo scaffold → 색상 검증 화면, 82줄)
- ScrollView + View + Text + className 전용, StyleSheet 미사용
- 섹션: Primary / Accent / Surface / Semantic / Text / Tag Chip

### 1.2 최근 커밋 (top 5)

```
c3744fe feat(mobile): add color verification screen with nativewind (d-4b-2)
4666541 chore(mobile): integrate nativewind v4 + tailwind 3 (d-4b-1)
d118aaa docs(backlog): handoff from d-4a to d-4b (session transition 2)
bb63796 feat(web): add design token verification page and align system font (d-4a)
8a2ed66 docs(backlog): handoff from d-3d to d-4a (session transition)
```

## 2. 환경 전제 (중요 — 이전 handoff 와 차이 있음)

### 2.1 CA 파일명 확정

**corp-root.pem** 사용. (이전 handoff 는 `corp-ca.pem` 으로 틀림.)

- 경로: `$HOME/.certs/corp-root.pem`
- 확인: `echo $NODE_EXTRA_CA_CERTS` 로 실체 검증 필수
- `.bashrc` 에 이미 export 되어 있어 Claude Code preamble 과 일치해야 함

### 2.2 bash_tool preamble (매 명령 앞 필수)

```
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" &&
```

### 2.3 WSL 경로 주의

Claude Code 가 기본적으로 Windows 경로(`C:\Users\HDEC`)에서 실행되어 `cd ~/work/acspc` 가 실패할 수 있음.
해결: `wsl -d Ubuntu -e bash -c "..."` 로 감싸서 실행.

### 2.4 pnpm install vs npm install (corp 망)

- pnpm 은 **기존 store 에 있는 패키지** 는 2초 reuse (정상)
- pnpm 은 **신규 대용량 패키지 fetch 시 corp 망에서 hang 가능성** 있음
  (D-4b-1 에서 tailwindcss 3.4.17 설치 시 attempt 4/10 이상에서 진행 정지 관측)
- 회피: `npm install --save-dev <pkg> --legacy-peer-deps` 로 우회 가능
  - 단 `package-lock.json` 이 생성되므로 `.gitignore` 추가 필요
  - 이미 `apps/mobile/.gitignore` 에 추가됨

## 3. 기술 스택 (D-4b 에서 추가된 것)

apps/mobile:
- nativewind ^4.2.3
- tailwindcss ^3.4.17 (devDep)
- babel preset: babel-preset-expo { jsxImportSource: "nativewind" } + nativewind/babel
- metro: withNativeWind + input: "./global.css"

apps/web 과의 정합성:
- web = Tailwind 4.x, mobile = Tailwind 3.4.17 (major 다름)
- **기본 팔레트만 사용** 원칙으로 회피 (D-4a 에서 확정)
- 클래스 화이트리스트: `bg-{color}-{shade}`, `text-{color}-{shade}`, `flex-*`, `w-*`, `h-*`, `rounded`, `p-*`, `m-*`, `gap-*`, `text-xs/sm/base`, `font-bold`
- TW4 전용 금지: `@theme`, `@import "tailwindcss"`, `size-*` shorthand

## 4. 프로젝트 원칙 (변동 없음)

이전 handoff §4 참조. 3단계 역할 분리, V1 scope cut, thin slice 우선, Gate 2 승인 전 push 금지, explicit add only.

## 5. Backlog

- MF-01 (low): plan-review-gate.md Gate 1 우회 범위 (미처리)
- MF-02 (new): apps/web/tailwind 메이저 버전과 apps/mobile 일치 여부 — V1 후반 재검토
- MF-03 (new): WSL2 ↔ iPhone (외부망) Expo Go 접속 — `npx expo start --tunnel` 또는 포트포워딩 필요. 실제 디바이스 테스트 시점에 해결

## 6. D-4b 에서 발견된 실전 이슈 4개 (중요)

### 이슈 1: CA 파일명 불일치
- handoff 에는 `corp-ca.pem` 기재, 실제 `.bashrc` 는 `corp-root.pem`
- 두 파일 모두 존재하고 내용 동일 (크기 1282 bytes)
- 사용자가 4/22 13:04 에 이름 변경 후 env 갱신, handoff 미반영
- **교훈**: 세션 시작 시 `echo $NODE_EXTRA_CA_CERTS` 로 실체 확인 선행

### 이슈 2: pnpm 신규 패키지 hang
- `pnpm add --save-dev tailwindcss@3.4.17` 가 10분 timeout 도중 attempt 4/10 에서 진행 정지
- `npm install --save-dev tailwindcss@3.4.17 --legacy-peer-deps` 로 우회, 51초 완료
- **교훈**: pnpm 이 10분 이상 downloaded 0 에서 안 움직이면 npm 우회 허용

### 이슈 3: 검증 경로 실수 (hoisted linker)
- 초기 검증: `apps/mobile/node_modules/nativewind/package.json` → 없음 (잘못된 경로)
- 올바른 경로: `~/work/acspc/node_modules/nativewind/package.json` (루트 hoist)
- 또는 `require.resolve('nativewind/package.json')` 로 Node 해석 경로 확인
- **교훈**: hoisted linker 환경에서는 루트 node_modules 가 진실, 또는 `require.resolve` 사용

### 이슈 4: index.tsx 실제 경로
- handoff / 프롬프트: `apps/mobile/app/index.tsx` 기재
- 실제 Expo scaffold: `apps/mobile/app/(tabs)/index.tsx`
- **교훈**: 수정 전 `ls app/` 로 구조 확인

## 7. 다음 턴 (D-4c) 스펙 초안

### 목표 후보 (사용자 결정 필요)
1. **packages/domain 스캐폴딩 (zod 스키마)**: V1 데이터 모델 thin slice
2. **Supabase 클라이언트 설정**: apps/web + apps/mobile 양쪽 연결 테스트 화면
3. **Expo dev build 환경 확정**: WSL2 터널 / 포트포워딩 해결, 실제 iPhone 검증

현재 가장 시급: 1번 또는 2번 (Expo dev build 는 실제 구현 시점에 붙이면 됨).

### 범위 외 (D-4c 이후)
- 실제 V1 화면 구현
- 인증 플로우
- 이미지 업로드

## 8. 새 대화창 시작 가이드

### 복사 붙여넣을 첫 프롬프트

```
이 프로젝트는 acspc 의 Claude Code 프롬프트 설계 전용 대화창입니다.

이전 대화창 컨텍스트 포화로 전환. D-4b 까지 완료 상태.
HEAD: c3744fe, 총 16 커밋, origin/main 동기화 완료.
GitHub public: https://github.com/ceoYS/acspc

아래 handoff 를 먼저 읽고 맥락 파악:
https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d4b-to-d4c.md

원칙:
- Planner → Generator → Editor 3단계 분리
- bash_tool preamble 필수 (CA 파일명 corp-root.pem 주의)
- D-4c 범위는 handoff §7 에서 사용자 결정 후 진행
- 범위 확장 요청은 scope-cut
- Gate 2 승인 전 push 금지
- explicit add list, no `git add .`

준비되면 handoff 요약 후 "D-4c Planner 시작해" 대기.
```

### 전환 시 체크리스트
- [ ] 이 handoff 파일이 GitHub 에 push 되어 있는지 (raw URL 접근 가능)
- [ ] 새 대화창에서 Claude 가 c3744fe 를 HEAD 로 인지
- [ ] bash_tool preamble 누락 방지 리마인더 전달
- [ ] CA 파일명 `corp-root.pem` 확인 리마인더
