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

## KI-12 (D-4o 신설): Claude.ai 응답 메시지 길이 제한 → 큰 PROMPT 분할 의무

### 증상

Claude.ai (채팅 UI) 에서 큰 PROMPT 응답 작성 시 메시지 길이 한도에 도달 → 응답 본문 단절 또는 일부 내용 미출력. Planner 가 단일 응답에 정찰 + 평가 + 다음 PROMPT 본문을 모두 담으려 할 경우 빈번 발생.

### 원인

Claude.ai 채팅 UI 의 응답 메시지 출력 길이 상한 (UI 차원 제약). PROMPT 본문이 길수록 그 안에 임베딩하는 코드 / SQL / 검증 명령 블록이 누적되어 한도 초과 가능.

### 해결책

큰 PROMPT 는 의미 단위로 분할:
1. PROMPT 본문 + 검증 명령 블록을 별도 응답으로 분리
2. 사용자가 PROMPT A 실행 → 결과 회신 → Planner 가 후속 PROMPT B 작성 (이전 응답 종결 후 신규 응답)
3. 단일 응답에 다중 chunk 의 PROMPT 임베딩 금지

D-4n 진입 메시지 작성 시 이 패턴 명시. D-4o 부터 PROMPT 분할 정합.

### 회피 패턴

Planner 응답 작성 시 길이 자체 모니터링. 한 응답에 PROMPT 본문 1개 + 메타 설명 최소화. 정찰 / 평가 / PROMPT 작성은 분리된 응답.

### 관련 commit

D-4o 시리즈 통합 (handoff §4.1 KI-12 후보 명시).

## KI-13 (D-4o 신설): Claude Code stdout 자동 압축 → expand 후 본문 paste 의무

### 증상

Claude Code 가 bash 명령 실행 후 stdout 출력이 일정 라인 수 초과 시 자동 압축 표기:

```
... (앞쪽 라인)
+N lines (ctrl+o to expand)
... (뒤쪽 라인)
```

압축된 N 라인 본문이 응답 stdout 에 즉시 노출 안 됨. Planner 가 정찰 결과 paste 회신 시 압축된 부분 누락 → 검증 실패 또는 false negative.

### 원인

Claude Code UI 의 stdout 길이 자동 압축 동작. expand 액션 (ctrl+o) 으로 수동 펼치지 않으면 본문 일부 미노출.

### 해결책

정찰 PROMPT 작성 시 다음 명시:
1. stdout 가 압축 표기로 잘리면 ctrl+o expand 후 본문 전체 paste
2. 또는 명령 출력을 head/tail/wc 등으로 사전 압축 (압축 발생 자체 회피)
3. 큰 결과 (정찰 산출 50+ 라인 등) 는 분할 명령 (예: 처음 30라인 + 마지막 30라인)

### 회피 패턴

정찰 stdout 회신 paste 시 expand 확인 의무. 압축 표기가 그대로 paste 되면 Planner 가 expand 재요청.

### 관련 commit

D-4o 시리즈 통합 (handoff §4.1 KI-13 후보, D-4o 신규).

## KI-14 (D-4o 신설): Supabase API URL ≠ Dashboard URL 구분 의무

### 증상

Supabase 의 두 URL 종류:
- API URL: `https://{ref}.supabase.co` (앱 코드의 createClient 인자)
- Dashboard URL: `https://supabase.com/dashboard/project/{ref}/...` (관리 UI)

Planner 가 사용자에게 Dashboard 작업 (예: SQL Editor, Auth 정책) 안내 시 두 URL 혼동 위험. 사용자가 API URL 을 브라우저로 직접 열어도 Dashboard 진입 불가.

### 원인

Supabase 의 도메인 구조: API endpoint (`{ref}.supabase.co`) 와 Dashboard (`supabase.com/dashboard`) 가 별개. project ref 는 양쪽에 공통 등장하지만 도메인이 다름.

### 해결책

사용자 안내 시 다음 패턴:
- API URL 은 코드 / .env / curl 호출 맥락에서만
- Dashboard 작업 안내 시 정확 URL 명시: `https://supabase.com/dashboard/project/{ref}/{section}` (예: `/auth/providers`, `/sql/new`)
- 두 URL 혼용 금지

### 회피 패턴

PROMPT 또는 사용자 안내에 URL 적시할 때 용도 (API vs Dashboard) 명시 + 정확 URL.

### 관련 commit

D-4o Chunk 4 (Cloud SQL Editor 적용) 시점 발견 (handoff §4.1 KI-14 후보).

## KI-15 (D-4o 신설): 하루 세션 종료 시 handoff 작성 = 작업 chunk 와 별도 chunk 의무

### 증상

작업 chunk N 의 commit + push 종료 후 Planner 가 "오늘 종결" 인식 → handoff 작성 누락 또는 작업 chunk N 의 응답에 handoff 본문 끼워넣기 시도. 다음 세션 진입 시 컨텍스트 손실 위험.

### 원인

"Chunk 5 push 후 마무리" 표현이 종료 인식으로 이어짐 → 다음 세션 진입자 (자기 자신 또는 사용자) 를 위한 handoff 작성을 별도 작업으로 인식하지 못함.

### 해결책

하루 세션 종료 절차:
1. 작업 chunk N (코드/문서 commit + push) = 정상 종료
2. **별도 chunk N+1 = handoff 작성** (handoff-d4X-to-d4Y.md 신설 또는 갱신, commit + push)
3. 두 chunk 사이 사용자 승인 분리

handoff 본문 = 다음 세션 진입자가 컨텍스트 0 에서 진입 가능한 수준 (환경 검증 / 진입 PROMPT / 핵심 결정 / 잠재 위험 / 진도표).

### 회피 패턴

세션 종료 시 Planner 자체 체크: "handoff 작성 chunk 가 별도 chunk 로 분리되었는가". 작업 chunk 응답에 handoff 본문 임베딩 금지.

### 관련 commit

D-4o Chunk 6 (handoff 작성) 패턴 정합 (handoff §4.1 KI-15 후보).

## KI-16 (D-4o 종결 신설): 새 환경 첫 진입 시 pnpm install 의무 (pre-commit hook 가 docs-only 도 차단)

### 증상

새 환경 (집 PC ↔ 회사 PC) 첫 진입 후 git pull 만 수행하고 docs-only commit 시도 → pre-commit hook (turbo run check-types) 가 node_modules 미설치 / 신규 의존성 미반영 상태에서 실행 불가 → commit 차단.

D-4o Chunk 6 진입 시 회사 PC 측 turbo PATH 미해결 + 의존성 미반영 정합 → STOP 패턴 발생.

### 원인

- pre-commit hook 가 docs-only commit 도 검증 단계 (turbo run check-types) 통과 강제
- node_modules 미설치 또는 lockfile 변경 미반영 = check-types 실행 자체 불가 또는 type 에러 표면화
- pnpm `nodeLinker: hoisted` 모드 = root + workspace 양쪽 install 필요 (KI-17 정합)

### 해결책

새 환경 첫 진입 시 표준 절차:
1. git pull origin main
2. pnpm install (root)
3. (선택) pnpm --filter <workspace> install
4. 이후 commit / push 진입

세션 시작 PROMPT 의 환경 검증 명령에 pnpm install 단계 명시.

### 회피 패턴

handoff §2 환경 가정 + 검증 절에 환경 분기별 (회사 PC / 집 PC) pnpm install 명시. 새 환경 첫 진입 commit 시도 전 의무.

### 관련 commit

D-4o Chunk 6 STOP 패턴 (handoff §4.1 KI-16 후보, D-4o 종결 시 신규).

## KI-17 (D-4p 신설): pnpm nodeLinker: hoisted 모드 검증 패턴 (root + workspace 양쪽)

### 증상

pnpm `nodeLinker: hoisted` 모드에서 의존성 install 후 검증 시:
- `apps/<workspace>/node_modules/<pkg>` = **비어있음** (또는 디렉토리 자체 부재)
- root `node_modules/<pkg>` = flat 배치 (실제 install 위치)

검증자가 workspace 측 node_modules 만 확인 → "install 안 됨" 오판 위험. 추정 false negative.

### 원인

pnpm `nodeLinker: hoisted` 모드 = npm 호환 평면 구조. 모든 의존성을 root node_modules 에 flat 배치, workspace 별 node_modules 는 빈 상태 (또는 일부 internal symlink 만).

기본 pnpm 모드 (`nodeLinker: isolated`) 와 다름. KI-03 (root node_modules 검증) 은 hoisted 의 root 측만 명시한 정합.

### 해결책

pnpm 의존성 검증 시:
1. root `node_modules/<pkg>` 존재 + 버전 확인 (1차)
2. (참고) `apps/<workspace>/node_modules/<pkg>` 부재 = 정상 (hoisted 정합)
3. pnpm-lock.yaml 의 importer 측 (`apps/<workspace>` 항목) 의존성 명시 확인 (3차)

세 단계 중 (1) + (3) 통과 시 install 성공 판정.

### 회피 패턴

KI-03 의 hoisted 검증 패턴 + workspace 측 빈 디렉토리 정합 명시. 추측 (apps/<workspace>/node_modules/<pkg> 부재 = install 실패) 금지.

### 관련 commit

D-4p Chunk 2-A (`7dee082`, @supabase/ssr 0.10.2 install) 검증 시 패턴 확립 (handoff §4 D-4p 신규).

## KI-18 (D-4p 신설): 회사 PC WSL bash 환경에서 turbo binary PATH 미해결 (exit=127)

### 증상

회사 PC WSL Ubuntu bash 환경에서 `turbo run check-types` 직접 호출 시:

```
turbo: command not found
exit=127
```

`pnpm install` 정상 + node_modules/.bin/turbo 존재 + package.json scripts 에 정의됨에도 PATH 미해결.

집 PC (sinabro@DESKTOP-CTPJ4S5) 에서는 동일 패턴 정상 동작 (환경 차이).

### 원인

회사 PC WSL bash 의 PATH 구성 차이로 추정 (workspace 의 node_modules/.bin 자동 미포함). 집 PC 와 비교 시 회사 PC 측 PATH 만의 문제.

명시 추정: pnpm 자체는 정상, turbo binary 는 root `node_modules/.bin/turbo` 에 존재 (KI-17 hoisted 정합), 다만 bash PATH 에서 해석 안 됨.

### 해결책

다음 3 패턴 중 하나 사용:
1. `./node_modules/.bin/turbo run check-types` (root 에서 직접 경로)
2. `pnpm exec turbo run check-types` (pnpm 의 exec 가 PATH 해석)
3. `pnpm run check-types` (root package.json scripts 의 turbo 호출 — pnpm 가 PATH 해결)

pre-commit hook 자체는 영향 없음 (hook 내부에서 pnpm 또는 적절 경로로 호출됨).

### 회피 패턴

회사 PC PROMPT 작성 시 turbo 직접 호출 금지. 위 3 패턴 중 root `pnpm run check-types` 권장 (가장 단순 + 양 환경 호환).

### 관련 commit

D-4p Chunk 2-B (`d3824b8`, SSR 클라이언트 분리 + middleware) 진행 중 회사 PC 측 발견 (handoff §4 D-4p 신규).

## KI-19 (D-4q home 신설): Supabase 신규 publishable key 첫 호출 HTTP 401

### 증상

Supabase 의 신규 publishable key (값 prefix `sb_publishable_*`) 를 `.env.local` 에 적용 후 첫 클라이언트 호출 (`/auth/v1/...` 등) 시 HTTP 401 "Invalid API key" 반환. 키 값 자체는 Dashboard 에서 정상 발급됐고 변조 흔적 없음.

D-4q office 에서 첫 시도 시 발생, `.env.local` 갱신 + dev server 재기동 후 200 OK 도달.

### 원인

명시 추정: Supabase 의 신구 key 종류 전환 (legacy anon JWT → 신형 publishable key, prefix `sb_publishable_*`) 시점에 key migration / propagation 지연 또는 key 캐싱 불일치가 첫 호출에서 401 표면화.

D-4q home 시점에는 재현 안 됨 (`.env.local` 가 cloud sync 상태 정합).

### 해결책

다음 순서로 우회:
1. `apps/web/.env.local` 의 publishable key 값 재확인 (Dashboard → API settings 최신 값 paste)
2. dev server 재기동 (Next.js env 캐시 갱신)
3. (1)+(2) 미해결 시 Supabase project 재시작 (Dashboard 의 project pause/resume)

### 회피 패턴

신규 publishable key 도입 chunk 진입 시 첫 호출 401 가능성 사전 인식. 401 표면화 시 즉시 위 3단계 시도 (RLS / GRANT / 코드 의심 전).

### 관련 commit

D-4q office 진행 중 발견 (handoff §1 환경 트러블슈팅 + §4 KI-19 후보 명시). 별도 fix commit 없음 (`.env.local` gitignored 갱신만).

## KI-20 (D-4q home 신설): Supabase Dashboard "Confirm email" 토글 UI 부재 → Management API 우회

### 증상

Supabase Dashboard 의 Authentication → Sign In / Providers → Email provider 영역에서 "Confirm email" 토글이 부재. handoff (D-4p §5.2.1) 결정 (Confirm email OFF, 즉시 RLS 검증 가능) 적용 경로가 UI 에서 노출 안 됨.

D-4q office Cloud Auth 정책 mismatch 발견 시 Dashboard sub-page 재탐색 시도했으나 토글 위치 미확인.

### 원인

명시 추정: Supabase Dashboard UI 변경 — Confirm email 설정이 Email provider 카드 영역에서 다른 sub-page 또는 Management API 전용으로 이전. UI 위치 변동은 handoff §1 명시 추정 사항.

### 해결책

Management API 직접 호출 (D-4q home 적용 정합):

```bash
export SUPABASE_ACCESS_TOKEN="<temp token>"
curl -X PATCH "https://api.supabase.com/v1/projects/{ref}/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mailer_autoconfirm": true}'
```

검증: `/auth/v1/settings` GET 200 + `mailer_autoconfirm:true` 응답.

토큰은 1회용 (사용 후 revoke). 사용자 본인 수동 발급/revoke (보안 격리).

### 회피 패턴

Supabase Auth 정책 변경 시 Dashboard UI 우선 시도, 미발견 시 Management API 즉시 전환. UI 위치 변동 가능성 사전 인지.

### 관련 commit

D-4q home 적용 (handoff §1 Cloud Auth 정책 적용 + §3 KI-20 후보). 코드 commit 없음 (Cloud-side 설정 변경).

## KI-21 (D-4q home 후보 → D-4r home 해결): publishable key 변수명 mismatch (Supabase 신구 key 명명 혼동)

### 증상

`apps/web/.env.local` 의 publishable key (값 prefix `sb_publishable_*` = 신형) 가 변수명 `NEXT_PUBLIC_SUPABASE_ANON_KEY` (구형 anon JWT 명명) 에 담긴 mismatch. 동작 자체는 OK (Supabase SDK 가 값으로만 인증) 이나 변수명/값 형식 불일치는 향후 혼동 위험.

D-4q home 정찰 단계에서 후보로 인식, D-4r home 에서 확정 + 표준화.

### 원인

Supabase 가 legacy anon JWT 에서 신형 publishable key (`sb_publishable_*`) 로 key 종류 전환하면서, .env 변수명 마이그레이션 가이드가 명시 안 됨. 도입 시점에 기존 변수명을 그대로 유지 → 값 형식만 신형으로 갱신.

### 해결책

D-4r home T1 (commit `28de2c3`) 적용:
- 변수명 일괄 rename: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- 5 파일 변경: `apps/web/.env.local` (gitignored, 수동) + 4 코드 파일 (`apps/web/lib/supabase.ts`, `apps/web/lib/supabase/{client,server,middleware}.ts`)
- 값은 동일 (`sb_publishable_*` 형식) — 변수명만 변경

다른 환경 (회사 PC) 진입 시점에 `.env.local` 수동 rename 의무 (gitignored 라 push 미포함). 누락 시 `next build` env 누락 실패 또는 런타임 401.

### 회피 패턴

Supabase key 도입 시 값 형식 (`sb_publishable_*` vs JWT) 과 변수명 (`PUBLISHABLE_KEY` vs `ANON_KEY`) 정합 사전 확인. 신구 key 명명 혼동 패턴은 KI 로 보존 — 후속 chunk 에서 같은 mismatch 재발 시 즉시 식별.

### 관련 commit

- D-4q home 후보 인식 (handoff §3 KI-21 후보 명시, 정찰 단계 환각 가능성 명시)
- D-4r home T1 해결: commit `28de2c3` — refactor(web): rename SUPABASE_ANON_KEY → SUPABASE_PUBLISHABLE_KEY (KI-21)

## KI-22 (D-4r home 신설): RLS + policy 만으로는 부족, table-level GRANT 동시 필수

### 증상

Supabase 테이블 생성 시 다음 3 단계만 적용:
1. `create table public.X (...)`
2. `alter table public.X enable row level security`
3. `create policy ... on public.X for all to authenticated using (...) with check (...)`

위 상태에서 authenticated session 의 INSERT/SELECT 시도 → `permission denied for table X` 에러. RLS policy 도달 전 차단.

D-4r home 시나리오 3 (createProject INSERT) 첫 시도 시 발생.

### 원인

Postgres RLS 의 동작 모델: "**이미 GRANT 된 권한 위에서 row 단위 필터**". 즉 GRANT 가 선행 조건, RLS policy 는 그 다음.

`enable row level security` + policy 만 정의하고 `authenticated` role 의 table-level GRANT (SELECT/INSERT/UPDATE/DELETE) 부재 시 → Postgres 가 GRANT 부재로 거부 → RLS 도달 전 `permission denied for table` 차단.

`0001_init.sql` (D-4o Phase 5.2) 가 GRANT 단계 누락. Supabase 기본값이 `authenticated` 에 자동 GRANT 를 주지 않음.

### 해결책

forward-only migration 으로 보충 (D-4r home T1A, commit `c8f2c0e`):

```sql
-- 0002_grant_projects_authenticated.sql
grant select, insert, update, delete on table public.projects to authenticated;
```

검증: `information_schema.role_table_grants` 7 row (REFERENCES, TRIGGER, TRUNCATE 기본 + SELECT/INSERT/UPDATE/DELETE 추가).

기존 `0001_init.sql` 미수정 (forward-only 일관). 후속 테이블 (locations / trades / vendors / photos) 도 동일 GRANT 보충 필요 — 추후 별도 migration 또는 신규 테이블 마이그레이션 작성 시 GRANT 단계 포함.

### 진단 메시지 구분 (handoff §4 교훈)

- `permission denied for table X` = table-level GRANT 부재 (KI-22)
- `new row violates row-level security policy` = GRANT 는 있으나 RLS 거부 (user_id mismatch 등)

두 메시지 구별 못 하면 RLS policy 만 의심하다 시간 낭비. Phase 5.4 Storage / `storage.objects` 진입 시 동일 패턴 사전 검증.

### 회피 패턴

신규 테이블 migration 작성 시 GRANT 단계 의무 포함:
1. `create table`
2. `alter table ... enable row level security`
3. `create policy ...`
4. **`grant select, insert, update, delete on table ... to authenticated`** ← KI-22 회피

KI-26 (storage.objects revoke 미발동, 후속 chunk 등재 예정) 의 선행 패턴.

### 관련 commit

- D-4r home T1A: commit `c8f2c0e` — fix(db): grant CRUD on projects to authenticated (Phase 5.2 누락 보충)
- 신규 migration: `supabase/migrations/0002_grant_projects_authenticated.sql`

## KI-23 (D-4s office 신설): 회사 PC ↔ 집 PC Supabase publishable key 형식 불일치 (JWT anon vs sb_publishable_)

### 증상

회사 PC 와 집 PC 의 `apps/web/.env.local` 에 저장된 Supabase publishable key 형식이 다름:

- 회사 PC: `eyJ...` 형식 (JWT 기반 anon key, 구 발급분)
- 집 PC: `sb_publishable_...` 형식 (Supabase 신규 publishable key, D-4q home 시점 발급)

두 환경 모두 변수명은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (KI-21 D-4r home 통일 이후) 로 동일.

### 원인

D-4q home 시점 Supabase 가 publishable key 신규 형식 (`sb_publishable_`) 도입. 회사 PC 는 그 이전 (D-4o 이전) 에 발급된 JWT anon key 그대로 사용. 집 PC 는 D-4q home 신설 시점에 신규 형식으로 신규 발급.

`@supabase/supabase-js` 클라이언트가 두 형식 모두 지원 (KI-19 D-4q home 의 첫 호출 401 = unconfirmed user 별건, key 형식 무관).

### 영향

**0**. 두 형식 모두 동등 동작:
- 회사 PC `eyJ...` → 정상 인증, RLS 통과
- 집 PC `sb_publishable_...` → 정상 인증, RLS 통과 (D-4s office Phase 5.4.2 사진 업로드 form 검증 완료)

일관성 부재만 잔존. 디버깅 시 환경 차이 변수가 1개 추가되는 비용.

### 회피 패턴

V1 후반 또는 V1 출시 직전에 양 환경 통일. 권장 방향: **신규 형식 (`sb_publishable_`) 으로 일치**.

- 회사 PC `.env.local` 의 PUBLISHABLE_KEY 값을 Supabase Dashboard 에서 발급한 신규 publishable key 로 교체
- 양 환경 동일 key 사용 시 디버깅 일관성 확보 (key 형식 차이 변수 제거)

V2 multi-developer 진입 시 환경 동기화 정책 (.env.example 갱신, key rotate 가이드) 필수.

### 관련 commit

(없음, 인지 단계)

## KI-24 (D-4s office 신설): .gitignore 의 .bak/.env.local.bak.* 패턴 부재 (보호 미발동, git add . 시 노출 위험)

### 증상

D-4s office 시점 `.env.local.bak.d4s` 백업 파일이 `apps/web/` 디렉터리에 untracked 상태로 잔존. `.gitignore` 가 `.env*` 만 매치하고 `*.bak`, `.env.local.bak.*` 명시 패턴 부재.

`git status` 에서 untracked 표시:

```
Untracked files:
  apps/web/.env.local.bak.d4s
```

`git add .` 또는 `git add apps/web/` 실행 시 .env 백업 파일이 stage 되어 commit 직전까지 노출 위험.

### 원인

D-4o Phase 5.2 repo 초기화 시 `.gitignore` 작성 시 `.env*` 패턴은 포함했으나 `.bak`, `.bak.*`, `.env.*.bak` 등 백업 파일 패턴 누락. Next.js 기본 `.gitignore` template 도 .bak 패턴 미포함.

D-4s office 진입 시 `.env.local` 형식 변경 (KI-21 변수명 통일 후속 정리) 직전 안전망으로 .bak 생성하면서 노출됨.

### 회피 패턴

`.gitignore` 에 백업 패턴 추가:

```
# Backups (env / config)
*.bak
*.bak.*
.env.*.bak
.env.local.bak.*
```

V1 후반 차기 chunk 에서 `.gitignore` 보강 + 기존 .bak 파일 정리 (rm 또는 archive 디렉터리 이동).

### 관련 commit

(없음, 인지 단계)

## KI-25 (D-4s office 신설): domain-model.md 위치 표기 오류 (handoff/메모리 = docs/agent-shared/, 실제 = .claude/rules/)

### 증상

복수 handoff 문서 + 일부 메모리 항목에서 도메인 모델 명세 경로를 `docs/agent-shared/domain-model.md` 로 표기. 실제 파일은 `.claude/rules/domain-model.md` 위치.

`docs/agent-shared/` 디렉터리에는 `operating-principles.md` 만 존재 (역할 분리 / Gate 정의). domain-model 은 AI 기계 친화적 규칙으로 `.claude/rules/` 분류.

### 원인

D-4o 이전 초기 디렉터리 설계 단계에서 `docs/agent-shared/` 통합 안과 `.claude/rules/` 분리 안 사이 결정 변동. 최종은 `.claude/rules/` 로 분리됐으나 일부 handoff/메모리 텍스트에 옛 경로 잔존.

### 영향

- 신규 세션에서 domain-model 참조 시 옛 경로 검색 실패 → 재탐색 비용
- AI 가 옛 경로로 신규 작업 진행 시도 시 파일 미존재 에러

### 회피 패턴

handoff/메모리 정정 (D-4t 또는 V1 후반 정리 chunk):

- handoff 본문 grep `docs/agent-shared/domain-model` → `.claude/rules/domain-model` 로 일괄 정정
- 메모리 (`~/.claude/projects/-home-sinabro-work-acspc/memory/`) 동일 정정

`CLAUDE.md` / `AGENTS.md` 본문에는 이미 정확 경로 (`.claude/rules/domain-model.md`) 명시되어 있어 정정 불필요.

### 관련 commit

(없음, 인지 단계)

## KI-26 (D-4s office 신설): Supabase storage.objects REVOKE 미발동 (V4 잔존 7권한, superuser owner 추정)

### 증상

D-4s office Phase 5.4.x storage 보안 강화 작업 중 `storage.objects` 의 anon role 7권한 (SELECT / INSERT / UPDATE / DELETE / REFERENCES / TRIGGER / TRUNCATE) REVOKE 시도. SQL 문법 정상, COMMIT 성공 응답. 그러나 V4 시점 (다음 검증) 에서 7권한 그대로 잔존 — REVOKE 미발동.

```sql
-- 시도
revoke select, insert, update, delete, references, trigger, truncate
  on table storage.objects from anon;
-- COMMIT 성공
```

검증 (`information_schema.role_table_grants` query) → anon role 의 7권한 변동 없음.

### 원인 (추정)

`storage.objects` 의 owner 가 `supabase_storage_admin` superuser. Supabase 가 storage 영역을 Postgres role 권한과 별도의 superuser 격리 레이어로 운용. 일반 SQL session 의 REVOKE 가 superuser 소유 테이블에 도달 불가 — 그러나 에러 없이 silent fail (COMMIT 만 성공).

KI-22 (RLS + table-level GRANT) 의 후속 패턴 — storage 영역 RLS+REVOKE 제어가 일반 public 테이블과 동일 모델 아님.

### 영향

V1 검증 시나리오 무영향:
- TRUNCATE / REFERENCES / TRIGGER → storage REST API 노출 없음 (Postgres 직접 접근 시에만 의미)
- SELECT / INSERT / UPDATE / DELETE → RLS `to authenticated` policy 가 anon 차단 (KI-27 참조)

V2 다중 bucket 또는 storage 직접 SQL 접근 케이스 진입 시 재평가 필수.

### 회피 패턴

- V1: storage.objects 권한 정리는 RLS policy 의무화로 대체. anon 차단 = `for all to authenticated` policy 명시 (KI-27)
- V2: storage admin role 위임 또는 Supabase Storage Management API 경유 권한 제어 검토

### 관련 commit

(없음, V1 RLS 우회 패턴으로 대체)

## KI-27 (D-4s office 신설): anon role 도 storage.objects 7권한 직접 grant (V2 다중 bucket 진입 시 RLS 의무 명시 필수)

### 증상

`storage.objects` 의 role grant 상태 확인 시 `anon` 도 7권한 (SELECT / INSERT / UPDATE / DELETE / REFERENCES / TRIGGER / TRUNCATE) 직접 보유:

```
role  | privilege_type
------+----------------
anon  | SELECT
anon  | INSERT
anon  | UPDATE
anon  | DELETE
anon  | REFERENCES
anon  | TRIGGER
anon  | TRUNCATE
```

KI-26 의 REVOKE 시도가 발동되지 않은 결과로 anon 도 권한 잔존.

### 원인

Supabase storage 기본 grant 가 anon + authenticated 양쪽에 7권한 부여. RLS policy 가 차단을 담당하는 설계 — GRANT 는 광범위, RLS 가 row 단위 필터.

### 영향 (V1 photos bucket 한정)

V1 photos bucket 의 RLS policy 가 `for all to authenticated` 로 anon 차단:
- anon 의 GRANT 잔존 = Postgres 권한 수준 통과
- RLS `to authenticated` = anon 차단 (RLS 단계에서 거부)

결과: anon 의 storage.objects 접근 시도 → RLS 거부 (`new row violates row-level security policy` 또는 SELECT 0 rows).

### 회피 패턴 (V2)

V2 다중 bucket 진입 시 RLS policy 작성 의무 명시 필수:

- 각 bucket 별 RLS policy 작성 시 `to authenticated` (또는 더 좁은 role) 명시
- `to public` / role 명시 누락 시 anon 도 row 통과 가능 → 데이터 유출 위험
- bucket 신설 migration template 에 RLS policy 단계 포함 (KI-22 회피 패턴의 storage 판)

V1 단일 bucket (photos) 은 현재 RLS 명시되어 있어 안전 (D-4s office Phase 5.4 검증 완료).

### 관련 commit

(없음, V2 회피 패턴 명시 단계)

## KI-28 (D-4t home 후보 → D-4u 등재): 집 PC 환경 분기 (cert / .env.local / username)

관련: KI-10, KI-24.

### 증상

- 집 PC (`sinabro@DESKTOP-CTPJ4S5`) 에서 회사 PC 용 preamble 그대로 사용 시 외부망에서 corp cert 무관 / 인증 실패 가능
- 집 PC 에 `.env.local` 미존재 (gitignore 정책). 회사 PC 전용
- username 상이: 집 `sinabro` / 회사 `founder_ys`. 절대 경로 비교 시 false fail

### 원인

- corp root CA = 사내망 전용. 외부망 무관
- `.env.local` = PC 별 로컬 작성, git 추적 외
- PROMPT 작성이 회사 PC 1대 가정 → 환경 분기 누락

### 영향

- 환경 검증 PROMPT false fail (D-4u Step 1 / Step 4)
- Claude Code STOP 오작동 → Planner 재정정 turn

### 회피 패턴

1. **bash preamble 분기**
   - 회사 PC: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" && export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
   - 집 PC: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"` (cert 제거)
2. **PROMPT 작성 규약**
   - username 하드코딩 금지. `~/work/acspc` / `$HOME` 사용
   - 절대 경로 비교 시 `/home/*/work/acspc` 또는 `realpath ~/work/acspc` 동적 비교
3. **`.env.local` 의존 검증**
   - PC 분기 명시: 회사 PC 필수 / 집 PC 선택
   - 부재는 ⚠️ N/A, ❌ 아님
4. **향후 Supabase 런타임 in 집 PC**
   - 별도 `.env.local` 수동 작성 또는 회사 PC 전용 작업. 시점 결정

### 검증

D-4u 환경 검증 turn 에서 본 KI 적용 후 Step1~3 ✅, Step4 ⚠️ N/A. 후속 PROMPT 는 규약 적용.

### 후속

Evaluator 체크리스트에 "환경 분기 누락 (PC 별 username/cert/env)" 항목 추가 후보.

### 관련 commit

(없음, 인지 + 회피 규약 단계)

## KI-29 (D-4v): git mv 후 commit 시 explicit add 대상 산정

관련: KI-26, KI-28.

### 증상
5.5.3 commit + push PROMPT Step 2 의 4-path explicit add → pathspec 실패:
`fatal: pathspec 'apps/web/app/login/PhotoUploadForm.tsx' did not match any files`

git status --short 표기:
- ` M apps/web/app/login/page.tsx` (unstaged 수정)
- `R  ...login/PhotoUploadForm.tsx -> ...photos/upload/PhotoUploadForm.tsx` (staged rename)
- `?? apps/web/app/photos/upload/page.tsx` (untracked)

### 원인
`git mv` 가 working tree mv + index stage 동시 수행 → source path 는 working tree 부재. explicit add 시 source 포함하면 pathspec 실패. PROMPT 작성 시 status 첫 칸 (index) `R ` 인지 부재.

### 영향
V1/V2: rename 포함 commit PROMPT 작성 시 STOP 발동. 이중 commit 위험은 없으나 turn 손실.

### 회피 패턴
1. `git status --short` 첫 칸 (index) vs 둘째 칸 (working tree) 표기 인지.
2. `R ` (staged rename) 발견 시 add 대상에서 source/target 제외.
3. add 대상 = ` M` / `??` path 만.
4. PROMPT 헤더에 기대 사전 status entry 분류 명시.

### 검증
D-4v 5.5.3 commit + push 재시도 통과 ✅ (Step 2' 수정안, add 대상 unstaged 2 path 축소 → commit 3873e5d).

### 후속
- Evaluator 체크리스트 §m (rename 포함 PROMPT 작성 시 git status 표기 분석) 신설 후보.
- 부수: 동일 PROMPT 재발송 시 working tree clean 확인 → 이중 commit STOP 정상 발동 (Claude Code 자체 판단 모범 사례, 별도 등재 불요).

### 관련 commit
- 사고 발생 + 회피: 3873e5d
- KI-29 등재: (본 commit)

## KI-31 (D-5b): openpyxl AnchorMarker col 해석 오류 (정찰 1A 사후 발견)

### 증상
D-5b E3 정찰 1A 에서 240223_사진대지.xlsx 의 이미지 anchor 를 openpyxl 로 읽어 `from(col=1,row=4) to(col=9,row=5)` 로 추출 후 "to col=9 = J 컬럼 포함" 으로 해석. 이를 ExcelJS string range `'B5:J6'` 로 변환 (변경 4 후보) → 240223 원본 대비 우측 1 컬럼 + 하단 1 행 초과.

### 원인
openpyxl `AnchorMarker.col` 은 **0-based column index** (좌측 경계). 즉:
- `from(col=1,row=4)` = ExcelJS `B5` 좌상단 (B 컬럼 = index 1)
- `to(col=9,row=5)` = ExcelJS `I5` 의 우하단 (I 컬럼 = index 8 의 우측 경계 = col 9 의 좌측 경계)

정찰 1A 는 "to col=9 = 9 번째 column (J)" 으로 1-based 해석 오류.

### 매핑 정합 표

| openpyxl AnchorMarker | ExcelJS string range |
|---|---|
| from(col=1,row=4) to(col=9,row=5) | `'B5:I5'` (single row B~I) |
| from(col=1,row=4) to(col=10,row=6) | `'B5:J6'` (two row B~J) |

### 영향
- V1: 240223 양식 재현 정확도. 변경 4 적용 시 우측 J 컬럼까지 침범 + 메타 박스 (row 7~8) 와 이미지 영역 (row 5~6) 사이 row 6 침범.
- V1.5+: 차후 openpyxl 기반 다른 양식 정찰 시 동일 패턴 반복 위험.

### 회피 패턴
1. openpyxl `AnchorMarker.col=N` → ExcelJS string range 우하단 = `colLetter(N-1)` + same row.
2. 변환 시 row 도 동일 처리: `AnchorMarker.row=R` → ExcelJS row = `R+1` 좌상단 / row = `R` 우하단.
3. 차후 양식 정찰 PROMPT 작성 시 "AnchorMarker = 좌측 경계 기준 0-based" 명시.

### 검증
D-5b 정찰 1A 사후 발견 → E3 변경 4 (`B5:J6` / `B11:J12`) revert. 240223 원본 = `B5:I5` / `B11:I11` 와 정확히 일치 확인.

### 후속
- Evaluator 체크리스트 §n (openpyxl 기반 양식 정찰 결과 ExcelJS 변환 시 col index 1-off 점검) 신설 후보.

### 관련 commit
- 변경 4 revert: 553d0db
- KI-31 등재: (본 commit)

## KI-32 (D-5c): PostgREST 의 nested column 으로 parent 정렬 미지원

### 증상
chunk A (V1 §5 2차 PASS) 위치 순 다운로드 시 PostgrestFilterBuilder.order 의 column 인자에 `'locations(name)'` 사용 → PostgREST 가 500 에러 반환 ("photos query failed", Gate 2 b-2 발견).

```typescript
// 거부되는 패턴
.order('locations(name)', { ascending: true, nullsFirst: false })
```

### 원인
PostgREST 의 nested column ordering 규칙:
- `?order=name.asc` → parent rows 정렬 (parent column 만)
- `?locations.order=name.asc` → embedded resource 자체 정렬 (parent 순서 영향 X, `referencedTable` 옵션 대응)
- `?order=locations(name).asc` → **PostgREST 가 거부**

정찰 2B B-2 의 `node_modules/@supabase/postgrest-js/src/PostgrestTransformBuilder.ts` impl L275 example 해석은 embedded resource 정렬 syntax 일 가능성. parent rows 를 nested column 기준 정렬은 PostgREST 가 직접 지원하지 않음.

### 영향
- V1 §5 위치 순 정렬 = client-side sort 또는 RPC 필요
- 차후 nested join 으로 parent 정렬 시도 시 동일 패턴 재발 위험
- 정찰 시 node_modules impl example 만으로 판단 = 위험 (실 query 검증 필수)

### 회피 패턴
1. **client-side sort** (V1 채택):
```typescript
   const sorted = [...rows].sort((a, b) => {
     const aName = pickName(a.location) ?? ''
     const bName = pickName(b.location) ?? ''
     return aName.localeCompare(bName, 'ko')
   })
```
   ES2019+ 안정 정렬 보장 → secondary key (fetch 시 created_at asc) 보존. 한글 시 `'ko'` locale 필수.

2. RPC 함수 정의 (V2 검토): Supabase 측 SQL `ORDER BY locations.name` + INNER JOIN

3. 정찰 시 PostgREST nested column ordering 은 embedded resource limitation 명시 + 실 query 검증 필수

### 검증
D-5c Gate 2 b-2 발견 → F-1 (client-side sort) 적용. Gate 2 b-2 재검증 PASS 후 KI 확정.

### 후속
- Evaluator 체크리스트 §o (PostgREST nested column parent 정렬 시도 시 client-side sort 권장) 신설 후보
- 정찰 시 node_modules impl example 만으로 판단 금지, 실 query smoke test 1회 추가 검토

### 관련 commit
- 사고 발생 + F-1 fix + KI-32 등재: (본 commit)

## KI-33 (D-5c): 사용자 발화 모호 해석 — disambiguation 오류 회피 패턴 부재

### 증상
D-5b 사용자 발화 "정렬기준을 위치순과 날짜 순으로 가져가되, 촬영순으로 날짜 순 및 위치 순으로 **분류한 각각의 셀안에서** 정렬기준을 가져가게 해달라" → Planner (Claude.ai) 가 옵션 A (단순 다중 키 정렬, 양식 변경 없음) 로 해석.

chunk A Gate 2 b-2 결과 사용자 정정: "날짜별로 분류가 안되었다" + "엑셀 셀 구분 칸에 기준점이 되는 날짜와 위치의 정보가 있으면 좋겠다" → 실 의도 = 옵션 B (시트 분리 + 셀 기준 표시). chunk A 의 옵션 A scope = 오해 결과.

### 원인
"분류" 표현의 다의성:
- A: 다중 키 정렬 (행 분류 = 정렬 순서 의미)
- B: 그룹 단위 시각 분리 (시트/헤더 단위 분리)

Planner 가 정찰 turn 에서 옵션 A/B/C 비교 표 제시했으나, **사용자에게 mockup 또는 예시 데이터 표로 결과 차이를 시각화 안 함** → "권장대로" 발화 (옵션 A) 가 모호 동의로 진행. b-2 검증 시 정정.

### 영향
- D-5c chunk A scope 결정 오류 → chunk A' (옵션 B BX) 별 chunk 신설로 회복
- 차후 사용자 발화 다의성 시 동일 패턴 재발 위험
- Gate 2 b-2 1회 추가 시도 발생 (cost 작음)

### 회피 패턴
1. **사용자 발화 의도 다의성 감지 시 → mockup / 예시 데이터 표로 결과 차이 시각화 후 명시 결정**:
   - 예: "옵션 A 결과: [시트 1: 위치 다른 사진 함께], 옵션 B 결과: [시트 1: 같은 위치만]" 비교 표
2. 단순 옵션 비교 표만 제시 시 "권장대로" 묵시 동의 위험 인지
3. Planner 권장 옵션 선택 전 = "이 옵션 시 결과 X 입니다, 의도 부합하나요?" 명시 발화 요청
4. **mockup 표 시각화 ≠ 의도 확정** — 표/예시 데이터로 결과 차이 비교했어도, 시각 UI (시트 탭 이름, 인쇄 미리보기, 색상/레이아웃) 의 실 결과는 b-2 단계 실 산출물 본 후에 사용자 의도 정정 가능. D-5d P3 정정 (시트 이름 = "1","2","3" 시퀀스 → 그룹 기준) 이 사례. → 큰 결정일수록 b-2 사용자 검증에서 의도 정정 발생 가능성 인지, 정정 시 thin slice chunk 로 회복 (rollback 회피).

### 검증
D-5c b-2 사용자 차이 인지 → 옵션 B 진입 결정 (chunk A' 신설). chunk A 의 옵션 A 부분 보존 (history c0aa375).

### 후속
- Evaluator 체크리스트 §p (사용자 발화 다의성 감지 시 mockup 제시 의무) 신설 후보
- operating-principles.md §사용자 발화 다의성 처리 패턴 신설 후보

### 관련 commit
- 옵션 A 진입 (오해 결과): c0aa375
- 옵션 B (chunk A') 별 chunk 신설 결정: (D-5d 진입 예정)
- KI-33 등재: (본 commit)
