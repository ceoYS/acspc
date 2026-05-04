# Tech Stack — acspc

AI (Claude Code, Codex CLI) 가 코드 생성·수정·의존성 추가 시 이 파일을
참조한다. 이 목록 외 도구 도입은 금지. 추가 필요 시 사용자 승인 + 이
파일 개정이 선행되어야 한다.

## 0. 버전 정책

구체 버전 숫자는 **Step 4 repo 초기화 시점** 에 `create-next-app`,
`create-expo-app` 등이 설치하는 실제 버전으로 최종 확정한다.
§1 에 기록된 숫자는 Step 4 (2026-04-22) 실제 설치 버전. 이후 의존성
업데이트 시 이 파일도 함께 갱신.

재검토 주기: 6개월. Claude Code 또는 사용자가 "tech-stack 재검토" 로
발동. 메이저 업그레이드는 Gate 1 통과 필수.

**미래 재검토 대상 (잠재 위험)**:
엑셀 양식 다양화 (docs/01 §4 V2+ 범위) 진입 시 exceljs 서버 측
구조 유지 여부 재판정. 클라이언트 측 양식 에디터 요구 발생 시
번들 크기 재계산.

## 1. 확정 스택

### 1.1 모노레포
- **Turborepo 2.9.6** + **pnpm workspace**
- 구조:
````
  acspc/
  ├── apps/
  │   ├── web/      (Next.js)
  │   └── mobile/   (Expo)
  ├── packages/
  │   ├── domain/   (zod 스키마, 타입)
  │   └── api/      (Supabase 클라이언트 래퍼)
  └── supabase/
      ├── migrations/
      └── functions/  (Edge Functions, Deno 런타임)
````

### 1.2 언어 · 런타임
- **TypeScript** (strict mode, noUncheckedIndexedAccess)
- **Node.js** 22 LTS (Active LTS)
- **pnpm** 10

### 1.3 웹 프론트
- **Next.js 15.5.15**, App Router
- **React 19.1.0**
- **Tailwind CSS 4.x**
- **TanStack Query** v5 이상

### 1.4 모바일
- **Expo SDK 54 (54.0.33)**, managed workflow
- **expo-router 6.0.23**
- **React Native 0.81.5**
- **expo-camera** (연속 촬영)
- **expo-media-library** (갤러리 앨범 저장)
- **expo-file-system**
- **expo-image-manipulator** (엑셀 embed 전 해상도 처리)
- **NativeWind** (Tailwind on RN)

**갤러리 앨범 제약**: expo-media-library 의 앨범은 **평면 구조**.
iOS 는 중첩 앨범 미지원. V1 은 평면 앨범 1단계만 사용.
기본값은 Location 이름이 앨범 이름이 되며, 사용자가 앨범 생성 시
다른 이름 지정 가능.

### 1.5 백엔드 / 데이터
- **Supabase** (Postgres 최신 안정, Auth, Storage, RLS, Edge Functions)
- **`@supabase/supabase-js` 2.105.1** (클라이언트, packages/api 래퍼 경유)
- **zod** v4 이상 (스키마 검증, packages/domain 중심)
- Auth: 매직링크 이메일 (V1 기본)

**Edge Functions 담당 영역**:
- 엑셀 생성 (exceljs 실행, §1.6 참조)
- 파일명 sanitization
- 사진 embed 전 전처리

### 1.6 엑셀 생성
- **exceljs** 최신 메이저
- **실행 위치**: Supabase Edge Function (서버 측 전용)
- 모바일/웹 클라이언트는 엑셀 생성 트리거 + 결과 다운로드만 담당
- 사유: 모바일 번들 크기 절감 (exceljs ~900KB), 양식 수정 시 앱 재배포
  불필요, 엑셀 생성은 사무실 복귀 후 실행되므로 오프라인 불필요
- 240223_사진대지.xlsx 레이아웃 재현 용도 (docs/01 §6)

### 1.7 테스트
- **Vitest** (unit, packages/*)
- **Playwright** (E2E, apps/web)
- **Maestro** — V1.5 부터 도입. V1 은 수동 QA (별도 체크리스트 문서는
  V1 출시 준비 단계에 생성)

### 1.8 린트 · 포맷
- **ESLint** (Next · Expo 공식 config)
- **Prettier**
- **TypeScript** strict + noUncheckedIndexedAccess

### 1.9 개발 환경
- **WSL Ubuntu** (회사 PC, ~/work/acspc)
- **VS Code** 또는 Cursor (에디터)
- AI 에이전트: CLAUDE.md, AGENTS.md 참조

### 1.10 CLI 실행 경로
- Supabase CLI: repo 루트 (`~/work/acspc`) 에서 실행
  (`supabase init`, `supabase functions ...`, `supabase migration ...`)
- pnpm CLI: repo 루트 또는 워크스페이스 (`apps/web`, `apps/mobile`) 에서
- Turbo CLI: repo 루트 전용

## 2. 명시적 금지 목록

다음 도구는 V1 에서 사용 금지. 제안 시 사용자 승인 없이 거부.

| 금지 | 대체 | 사유 |
|---|---|---|
| Redux / Zustand / MobX | TanStack Query + useState | V1 상태 복잡도 낮음 |
| styled-components / Emotion | Tailwind CSS | 스타일링 통일 |
| axios | fetch (브라우저 · RN 네이티브) | 의존성 축소 |
| Moment.js | date-fns 또는 네이티브 Date | 번들 크기 |
| SWR | TanStack Query | 데이터 페칭 통일 |
| RN Paper / NativeBase / Tamagui | 커스텀 Tailwind (NativeWind) | 디자인 자유도 |
| Redux Toolkit | TanStack Query + useState | 위와 동일 |
| Prisma | Supabase 클라이언트 직접 | ORM 중복 |
| tRPC | Supabase RPC 또는 Edge Functions | 백엔드 추상화 중복 |

## 3. 허용 판단 기준 (신규 의존성 제안 시)

AI 가 새 라이브러리를 제안하기 전 다음 3 질문을 스스로 점검.

1. 기존 스택으로 해결 가능한가 (§1 목록 + Node 표준)
2. V1 주지표 (주간 엑셀 생성 건수 0→3) 달성에 직접 기여하는가
3. 번들 크기 · 유지보수 비용이 기능 가치를 넘지 않는가

3 질문 중 하나라도 부정이면 제안 중단. 긍정 3개여도 사용자에게
"의존성 추가 제안" 으로 명시 보고 → 사용자 승인 후 이 파일 §1 에 추가.

§3 을 통과한 제안이라도 `.claude/skills/scope-cut` 패턴 C (V1 스택
외 API 연동) 에 해당하면 scope-cut 이 우선 발동하여 범위 재분류.

## 4. 버전 고정 정책

- `package.json` 에서 **exact pin** (정확 버전 명시, caret/tilde 금지) — 재현성 + 디버깅 안정성 우선
- 실제 install 버전은 `pnpm-lock.yaml` 가 lockfile 차원 보장
- 마이너/메이저 업그레이드 모두 명시적 의도 (별도 Gate 1 통과 또는 명시 commit)
- `.nvmrc` 로 Node 버전 고정
- `pnpm-lock.yaml` 커밋 필수

## 5. Supabase RLS 규칙 (간략)

V1 은 단일 사용자 단독 사용 가정. RLS 는 `user_id = auth.uid()` 패턴
고정. 팀 공유 / 멀티 사용자 RLS 는 V2 이후.

상세 스키마는 docs/01 §3 + `.claude/rules/domain-model.md` 참조.

## 6. 이 문서의 역할

- AI 참조용 기계 친화적 규칙. 인간용 설명은 README.md 또는 docs/ 에 분리.
- 변경 시 Gate 1 → Gate 2 → 커밋 순서 준수.
- 금지 목록에 항목 추가 시 반드시 "사유" 컬럼 채움.
- §1 구체 버전은 Step 4 완료 직후 실제 설치된 버전으로 업데이트.

## 7. 시크릿 및 환경 변수 관리

### 7.1 Supabase 키 유형과 허용 위치

- **anon key**: 클라이언트 앱에 노출 가능. RLS 가 보호막.
- **service role key**: **절대 클라이언트 노출 금지**. RLS 우회 권한.

service role key **허용 위치**:
- Supabase Edge Function 런타임 (production)
- 로컬 개발 중 Edge Function 테스트 (`supabase functions serve`)
- 마이그레이션 실행 스크립트 (CI 포함)

service role key **금지 위치**:
- `apps/web` (Next.js) 의 서버 컴포넌트·Route Handler·middleware
- `apps/mobile` 의 모든 코드
- `packages/*` 공유 코드

Next.js 서버 측 DB 쓰기도 **anon key + 사용자 세션 JWT** 로만 수행.
service role 이 필요한 로직은 Edge Function 으로 분리.

### 7.2 파일 분리

- `.env.local` — 로컬 개발용. **커밋 금지**.
- `.env.example` — 키 이름만 샘플. 값은 공란. 커밋 대상.
- Supabase Edge Function 환경변수는 `supabase secrets` 로 관리.

### 7.3 금지 행위

- service role key 를 클라이언트 코드 또는 Next.js 서버 코드에서 import
- Git 커밋 메시지·로그·주석에 실제 키 값 기록
- Supabase 대시보드 키를 Slack·이메일로 평문 전송
- `.env*` 파일을 `.gitignore` 에 넣지 않은 상태로 커밋

### 7.4 Edge Function 내부 주의

JWT user_id 재추출 표준 패턴:

```typescript
const authHeader = req.headers.get('Authorization')!;
const token = authHeader.replace('Bearer ', '');
const { data: { user } } = await supabase.auth.getUser(token);
const userId = user!.id;
```

구현 시 이 패턴을 변형하지 말 것. 클라이언트 payload 의 user_id 는
무시하고 위에서 추출한 userId 사용.

Storage 접근 시 검증 순서:
1. storage_path 첫 경로 segment 추출 (user_id 부분)
2. JWT userId 와 string 정확 일치 확인
3. 불일치 시 403 반환. DB 조회 전 차단.

### 7.5 실수 방지 장치 (권장)

- `.gitignore` 에 `.env*` 패턴 명시 (Step 4 repo 초기화)
- GitHub native secret scanning 활성화 (무료)
- Supabase 대시보드에서 노출 의심 시 즉시 키 rotate

실수로 키 커밋 시 절차:
1. 즉시 Supabase 대시보드에서 해당 키 rotate
2. 모든 `.env*` 파일 갱신
3. Edge Function 환경변수 갱신 (`supabase secrets set`)
4. 필요 시 git history rebase
