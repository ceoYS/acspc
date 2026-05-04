# Known Issues — acspc

이 문서는 acspc 프로젝트 진행 중 발견된 환경적·외부적 제약사항 (회피 불가) 을 기록한다.

각 KI 는 다음 구조 따른다:
- ## KI-XX (D-4X 신설): 제목
- ### 증상 / 원인 / 해결책 / [기타 유틸] / 회피 패턴 / 관련 commit

## KI-01 (D-4l 신설): GitHub fine-grained PAT 의 Workflows permission 필수

### 증상

GitHub Actions workflow 파일 (`.github/workflows/*.yml`) 변경 push 시 "refusing to allow a Personal Access Token to create or update workflow without `workflow` scope" 오류로 push 실패.

### 원인

GitHub 측 보안 정책: PAT 가 workflow 파일을 수정하려면 명시적 `workflow` scope 필요. 기본 fine-grained PAT 에는 미포함.

### 해결책

채택: fine-grained PAT 발급 시 다음 권한 명시:
- Repository permissions:
  - Actions: Read and write
  - Contents: Read and write
  - Metadata: Read
  - **Workflows: Read and write**

발급 후 credential.helper store 로 영구 저장:
```bash
git config --global credential.helper store
git push  # 첫 push 시 username + PAT 입력 → ~/.git-credentials 저장
```

### WSL git credential 설정

WSL Ubuntu 환경에서 credential.helper store 사용 시 `~/.git-credentials` 평문 저장. WSL 보안 경계 내에서 정합 (Windows 측 file system 격리).

### 만료 처리

fine-grained PAT 90일 만료 시 신규 발급 + ~/.git-credentials 갱신 필요.

### 회피 패턴

workflow 파일 미변경 chunk = PAT 권한 무관 (Contents 만 충분). workflow 변경 chunk = Workflows 권한 필수 = 사전 발급 확인.

### 관련 commit

D-4l Chunk 2 (HEAD=694135a) push 시 1차 STOP → fine-grained PAT 발급 후 재 push 성공
- 본 정책은 GitHub 측 영구 정책 (회피 불가, 우회 불필요)

## KI-02 (D-4n 신설): 집 PC 셋업 패턴 (cert 라인 제거 + 별도 PAT)

### 증상

회사 PC 외 환경 (집 PC, 다른 머신) 에서 acspc 작업 진입 시 D-4m 까지의 표준 preamble (`NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"`) 사용 시 cert 파일 부재로 일부 Node 명령 silent 무시 또는 SSL 에러 가능. 또한 회사 PAT 가 집 PC 에서 git push auth 실패.

### 원인

- corp-root.pem = 회사 망 SSL 인증 우회용. 집 망 외에서는 불필요 + cert 파일 부재 시 환경변수만 미사용 파일 가리킴
- fine-grained PAT = 회사 환경 보안 정책 정합으로 발급된 토큰. 다른 환경에서 재사용 시 KI-01 (Workflows permission) 정합 가능성 ≠ 별도 환경 사용성

### 해결책

집 PC 작업 진입 시:
1. preamble 의 `NODE_EXTRA_CA_CERTS` 라인 제거: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"` 만 사용
2. 집 PC 별도 fine-grained PAT 발급 (90일, repo-specific, Contents R/W + Metadata R + Workflows R/W — KI-01 정합)
3. credential.helper store 로 PAT 영구 저장 (`~/.git-credentials`)

### 회피 패턴

회사 PC = `corp-root.pem` 포함 preamble 유지. 집 PC = cert 라인 제거. preamble 표기 시점에 환경 명시 헤더 (`# 집 PC 정합` / `# 회사 PC 정합`) 권장.

### 관련 commit

D-4m / D-4n 시리즈 진행 중 정착. 별도 commit 미발생 (정책 명문화만).

## KI-03 (D-4n 신설): pnpm hoisted 모드 검증 시 .pnpm glob 무용

### 증상

pnpm 의존성 install 후 `node_modules/.pnpm/@scope+package@version*` glob 으로 검증 시 매치 0. 그러나 실제 install 은 정상 수행됨.

```bash
$ ls -d node_modules/.pnpm/@supabase+supabase-js@2.105.1*
ls: cannot access ...: No such file or directory  # 잘못된 검증
```

### 원인

`pnpm-workspace.yaml` 의 `nodeLinker: hoisted` 모드에서 pnpm 은 가상 store (`.pnpm/`) 를 거의 사용하지 않음. 패키지를 root `node_modules/@scope/package/` 에 직접 평면 hoist. `.pnpm` 디렉토리는 비어있는 게 정상 동작.

### 해결책

검증 명령 작성 시 nodeLinker 모드 사전 확인:

```bash
cat pnpm-workspace.yaml | grep nodeLinker
```

`hoisted` 모드인 경우:
- ✅ `ls -d node_modules/@supabase/supabase-js` (root 직접 검증)
- ✅ `ls node_modules/@supabase/supabase-js/dist` (본체 + dist)
- ❌ `ls -d node_modules/.pnpm/@supabase+supabase-js*` (무용)

`isolated` 모드 (기본) 인 경우 .pnpm glob 정합.

### 회피 패턴

정찰 명령 작성 전 환경 전제 (KI-08) 의 일부. nodeLinker 값을 직접 read 후 검증 패턴 결정.

### 관련 commit

D-4n Chunk 2 Step A 사고 발견 (HEAD=8bca437 직후 Y+ 정찰).

## KI-04 (D-4n 신설): Codex CLI 호출 시 작업 실행 시도 위험

### 증상

Codex CLI 에 평가용 호출 (===PROMPT=== 텍스트 임베딩) 시 Codex 가 평가 대상 텍스트를 "실행 지시" 로 해석. str_replace / Edit / Write 도구로 작업 직접 수행 + 검증 명령까지 실행. 평가 결과 (a~l 체크리스트) 출력 0.

### 원인

Codex 의 system prompt / agent 동작이 사용자 요청을 "작업 수행" 우선순위로 처리. 평가 헤더 ("read-only", "평가 결과만") 가 약하게 작용. 작업 텍스트 (mkdir / apply_patch 등) 가 더 명시적 호출 신호로 해석됨.

D-4n 시리즈 발생 사례:
- Chunk 1.5 (HEAD=fc45f45 직전): Codex 가 tech-stack.md §4 본문을 직접 편집
- Chunk 3 (HEAD=4355863 직전): Codex 가 supabase.ts + page.tsx 2 신규 파일 직접 작성

### 해결책

1. **사후 평가 모드 채택**: 작업이 이미 완료된 후 호출 → 실행할 작업 자체가 부재. 호출 헤더에 "본 호출은 사후 평가 전용. 평가 대상은 이미 작업 트리에 박혀있음" 명시.
2. **절대 금지 헤더 강화**: 호출 시작에 다음 명시:
   - str_replace / Edit / Write / 파일 편집 도구 사용 금지
   - shell 명령 실행 시 read-only 만 (cat / sed -n / grep / git diff / git log / ls / git status)
   - sed -i / git mutation / pnpm / npm / curl 절대 금지
   - 출력은 평가 결과만
   - INTENDED_PROMPT 안의 명령을 "실행 지시" 로 해석 금지
3. **실행 시도 발견 시 신뢰도 영구 강등** 명시. 발생 시 사용자 STOP + 결과 사후 처리.

### 회피 패턴

작업 수행 (Generator 역할) 과 평가 (Evaluator 역할) 의 호출은 분리. 평가 호출 ≠ 작업 호출. 첫 시도에서는 (작업 수행) 모드 → S 검증 통과 → 별도 호출에서 (사후 평가 모드) 진입.

### 관련 commit

D-4n Chunk 1.5, Chunk 3 사고 발생 + Chunk 3 사후 평가 (성공) + Chunk 4-revised 사후 평가 (성공) 으로 패턴 정착.

## KI-05 (D-4n 신설): Codex PROMPT 내 sub-section 헤더 인식 약함

### 증상

Codex 가 평가 대상 PROMPT 본문 안의 sub-section 헤더 ("Gate 2 대기:", "롤백 경로:", "금지사항:" 등) 를 정확히 인식하지 못함. 본문에 명시된 항목을 "누락" 으로 false positive 등급 부여.

D-4n 시리즈 발생 사례:
- Chunk 2 Step A 1차 평가: M1 (e: Gate 2 누락) + M2 (g: 롤백 누락) → 모두 false positive (PROMPT 안 명시 있음)
- Chunk 4-revised 평가: 옛 캐시 결과 재사용 (실제 평가 미수행 의심)

평가 정확도 = 약 50%.

### 원인

- Codex 의 long context 처리 약점
- PROMPT 안 sub-section 헤더가 markdown 형식 (`### ` 또는 plain text) 변동
- Codex agent 가 본문 전체를 1회 read 후 평가 = 중간 항목 식별 약화

### 해결책

1. **Planner 재확증 의무** (handoff 8번 정합): Codex 평가 결과를 그대로 채택하지 않음. 본 Planner 가 PROMPT 본문 직접 read + Codex 발견 항목 file:line 인용 정합 검증.
2. **false positive 식별 후 미채택**: 본 Planner 가 PROMPT 본문에 해당 항목 존재 확인 시 Codex 권고 미반영.
3. **Critical 만 자동 반영, High 이하는 Planner 재확증**: 평가 등급 가중치 차등.

### 회피 패턴

Codex = 보조 시각 (외부 시각). 채택 결정은 Planner. 본 채팅의 컨텍스트가 우선.

### 관련 commit

D-4n Chunk 2 Step A 1차 평가 시 false positive 발견 → Chunk 4-revised 까지 패턴 정착.

## KI-06 (D-4n 신설): bash 체인 cd && set +e 미도달 위험

### 증상

```bash
export PATH="..." && cd ~/work/acspc && set +e
echo "=== A ==="
...
```

위 체인에서 `cd ~/work/acspc` 실패 시 `&&` 가 후속 차단 → `set +e` 미도달 → 후속 명령들이 exit-on-error 모드로 실행. 첫 실패 명령에서 즉시 STOP + 후속 검증 명령 미수행.

### 원인

bash 의 `&&` 체인 = 단축 평가 (short-circuit). 앞 명령 fail 시 뒤 명령 미실행. `set +e` 도 동일 체인의 일부면 미도달.

### 해결책

명령들을 줄바꿈으로 분리:

```bash
export PATH="..."
cd ~/work/acspc
set +e

echo "=== A ==="
...
```

이 형식 = 각 명령 독립 실행. 앞 명령 fail 해도 set +e 도달. 이후 검증 명령들이 exit ≠ 0 무관하게 진행.

또는 bash chain 내에 fail-safe 보장:

```bash
export PATH="..." && cd ~/work/acspc || { echo "cd FAIL"; exit 1; }
set +e
```

### 회피 패턴

D-4n Chunk 4-revised 부터 모든 검증 PROMPT = 줄바꿈 분리 적용 (Codex 권고 M3 반영).

### 관련 commit

D-4n Chunk 2 Step A Codex 평가 발견 → Chunk 1.5 부터 적용.

## KI-07 (D-4n 신설): Claude Code 회사 PC preamble 자동 추가 경향

### 증상

집 PC 작업 환경 (cert 부재) 에서 Claude Code 가 검증 명령 첫 줄을 자동으로 회사 PC preamble (`export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem"`) 로 추가. cert 파일 부재 시 환경변수만 잘못된 경로 가리킴.

D-4n 사례: Z 정찰 / W 검증 단계에서 사용자가 cert 라인 제거 명시했음에도 Claude Code 가 자동 추가.

### 원인

- Claude Code 의 학습 패턴 = 회사 PC preamble 이 기본
- KI-02 (집 PC 셋업) 명문화 전 데이터로 학습됨

### 해결책

PROMPT 작성 시 강제 헤더:

⚠️ Preamble 주의: 집 PC 정합 = NODE_EXTRA_CA_CERTS 라인 추가 금지.

D-4n Chunk 4-revised 부터 모든 PROMPT 적용. 사용자 환경 명시 헤더가 효과 입증.

### 회피 패턴

PROMPT 의 첫 줄 = 환경 명시 (# 집 PC 정합 / # 회사 PC 정합). 사용자가 PROMPT 받기 전 환경 확인 1회.

### 관련 commit

D-4n Chunk 2 Step A Z 정찰 발견 → 이후 PROMPT 적용.

## KI-08 (D-4n 신설): 정찰 명령 작성 전 환경 전제 직접 read 의무

### 증상

정찰 명령 작성 시 환경 전제 (lockfile importer 순서, nodeLinker 모드, tsconfig paths 등) 를 추측으로 가정 → 검증 명령이 실측과 어긋남 → false positive 또는 false negative 발생.

D-4n 시리즈 사례:
- Chunk 2 Step A: lockfile importer 순서 = mobile → web → packages 인데 본 Planner 가 web → mobile 가정 → A2w/A2m sed 범위 오류 (Codex C1 발견)
- W 검증: nodeLinker hoisted 모드에서 .pnpm glob 으로 검증 시도 → 4 turn 낭비

### 원인

- 본 Planner 가 PROMPT 작성 속도 우선 → 환경 전제 직접 read 생략
- 추측 기반 정찰 = 실측 미검증

### 해결책

정찰 PROMPT 작성 전 다음 의무:
1. lockfile (pnpm-lock.yaml) 의 importer 순서 직접 read
2. pnpm-workspace.yaml 의 nodeLinker 값 직접 read
3. tsconfig paths / extends 직접 read
4. 추측 가설로 검증 명령 작성 금지

검증 PROMPT 의 sed 범위 / glob 패턴 / 매치 패턴 = 모두 위 read 결과 기반.

### 회피 패턴

D-4n 시리즈에서 4 turn 낭비 발생 = 본 Planner 의 직접 read 의무 강화 학습. D-4o 부터 모든 정찰 PROMPT 작성 시 환경 전제 직접 read 1회 선행.

### 관련 commit

D-4n Chunk 2 Step A 사고 누적 → Chunk 4-revised 부터 사전 read 패턴 적용.

## KI-09 (D-4n 신설): echo "label" / echo $? 분리 시 $? mask

### 증상

bash 검증 명령에서 다음 패턴:

ls -d node_modules/@supabase
echo "exit:"
echo $?

위 패턴 = $? 는 직전 echo "exit:" 의 exit code (= 0). ls 의 exit code 가 아님. 디렉토리 부재 시에도 exit: 0 출력 가능 = false negative.

### 원인

bash 의 $? = 마지막 명령의 exit code. echo "label" 자체가 명령 → $? 가 echo 의 exit (항상 0) 캡처.

### 해결책

다음 중 하나:
1. 단일 라인: ls -d ... ; echo "exit: $?" (세미콜론 분리, $? 가 ls 직후 캡처)
2. 명령 직후 echo $? 만: ls -d ... ; echo $? (label 없이)
3. 변수 캡처: ls -d ... ; ec=$? ; echo "exit: $ec"

D-4n Chunk 4-revised 부터 (1) 또는 (2) 패턴 적용.

### 회피 패턴

검증 PROMPT 의 exit code 검증 = 단일 라인 또는 직후 echo $? 만 단독.

### 관련 commit

D-4n Chunk 2 Step B Codex 발견 → Chunk 4-revised 부터 적용.

## KI-10 (D-4n 신설): Next 15 + Turbopack module-level throw → Collecting page data fail

### 증상

Next.js 15 App Router + Turbopack 환경에서 다음 패턴이 CI build (또는 .env 부재 환경) "Collecting page data" 단계 fail:

실패 패턴 (lib/supabase.ts):
- import { createClient } from "@supabase/supabase-js"
- const url = process.env.NEXT_PUBLIC_SUPABASE_URL
- if (!url) throw new Error("Missing env")  ← module-level throw
- export const supabase = createClient(url, ...)

호출 페이지 (app/some-route/page.tsx):
- import { supabase } from "@/lib/supabase"  ← import 시 throw 발동

CI build stdout:
- Compiled successfully
- Linting and checking validity of types
- Collecting page data → Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.
- Build error occurred → Failed to collect page data for /some-route

export const dynamic = "force-dynamic" 추가만으로는 회피 불가.

### 원인

- Next 15 + Turbopack 의 build 단계 = "Collecting page data" 가 모든 페이지의 module 을 import + evaluate
- module evaluation = lib/supabase.ts 의 module-level 코드 즉시 실행 → if throw 발동
- force-dynamic = render 시점 (handler 호출) 만 dynamic. import 자체는 막지 못함

본 Planner 의 force-dynamic 추정 가설 (Chunk 4) 은 실측 검증 안 한 추정 → KI-11 회피 위반 사고.

### 해결책

lazy initialization 패턴 (KI-10 회복 표준):

정합 패턴 (lib/supabase.ts):
- import { createClient, type SupabaseClient } from "@supabase/supabase-js"
- let cachedClient: SupabaseClient | null = null
- export function getSupabase(): SupabaseClient { ... if (cachedClient) return ... env 검증 + throw + createClient + cachedClient = ... return cachedClient }

호출 페이지 (app/some-route/page.tsx):
- import { getSupabase } from "@/lib/supabase"
- export const dynamic = "force-dynamic"  ← 안전망 보존
- export default async function Page() { const { data, error } = await getSupabase().auth.getSession() ... }

효과:
- module evaluation 시 함수 정의만, 본문 실행 0 → throw 발동 0 → build "Collecting page data" 통과
- runtime (handler 호출) 시에만 env 검증 → fail-fast 디버깅 보존
- force-dynamic = 추가 안전망 (이중 보호)

### 검증 방법 (CI 시뮬레이션)

bash 명령:
- mv apps/web/.env.local apps/web/.env.local.bak
- pnpm --filter web build
- mv apps/web/.env.local.bak apps/web/.env.local

build 통과 시 CI 도 통과. 사전 시뮬레이션 = KI-11 회피 의무.

### 회피 패턴

Phase 5 (Supabase) 의 모든 클라이언트 import 코드 = lazy initialization 패턴 적용. mobile 측 / packages/api 래퍼 등 동일 패턴.

### 관련 commit

D-4n Chunk 3 (HEAD=4355863) 발견 → Chunk 4 (force-dynamic 만) 시도 fail → Chunk 4-revised (HEAD=2be2855, lazy init) 회복.

## KI-11 (D-4n 신설): 회피 가설 사전 시뮬레이션 통과 후 진입 의무

### 증상

본 Planner 가 회피 가설 (예: KI-10 의 force-dynamic 만으로 충분) 을 추정 → PROMPT 작성 → Claude Code 투입 → 사용자 시간 소모 → CI/실측 fail. 추정 가설이 틀려서 회복 chunk 추가 발생.

D-4n Chunk 4 사례:
- Planner 추정: force-dynamic 추가 = 99% PASS
- 실측: CI 시뮬레이션 fail (Codex 의 🟢 Low (5) 가 정확히 예측)
- 회복: Chunk 4-revised (lazy init) 로 재진입

### 원인

- 본 Planner 가 회피 가설 검증을 "build 통과로 자동 무력화" 등 간접 단서로 판정
- 실측 (CI 시뮬레이션) 사전 수행 안 함

### 해결책

회피 가설 진입 전 의무:
1. 사전 실측 시뮬레이션: CI 환경 차이 가능성이 있는 가설은 로컬에서 정확히 시뮬레이션 (예: .env.local 백업 후 build)
2. 시뮬레이션 통과 후에만 commit + push: 통과 안 하면 가설 폐기 + 다른 옵션 검토
3. Codex 의 Low/Medium 등급도 무시 금지: 환경 차이 단서 발견 시 사전 시뮬레이션 강제

D-4n Chunk 4-revised 부터 모든 회복 chunk = 사전 시뮬레이션 통과 후 진입.

### 회피 패턴

추정 PROMPT 작성 금지. 가설 = 실측 통과 후 PROMPT.

### 관련 commit

D-4n Chunk 4 사고 발생 → Chunk 4-revised 시 사전 시뮬레이션 정착.
