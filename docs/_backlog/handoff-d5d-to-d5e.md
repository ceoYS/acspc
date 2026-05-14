# Handoff D-5d → D-5e

작성 세션: D-5d (회사 PC)
작성일: 2026-05-14
대상 세션: D-5e (회사 PC 또는 집 PC — V1 §5 본 PASS 확정 후 사용자
검증 chunk B 권장, 또는 KI 정리 chunk D / Medium 4 + A2 chunk E3' /
Mobile 트랙 F / 보조 출처 G / V2 사양서 H / V1.5 UX chunk I 중 택1)

---

### § 1. 현재 상태

- HEAD: `<handoff push 후 hash>` (본 handoff push 후 = handoff commit
  hash 로 갱신)
- 직전 3개 commit (handoff push 전 기준):
  - `1adc74b` feat(excel): V1 §5 본 PASS — chunk A' (옵션 B BX) 시트
    분리 + 시트명 그룹 기준
  - `717e60a` docs(backlog): handoff d5c-to-d5d (V1 §5 2차 PASS +
    chunk A' 정의 + KI-33)
  - `c0aa375` feat(excel): V1 §5 2차 PASS — 정렬 라디오 (chunk A
    옵션 A + F-1 client-side sort)
- working tree: handoff push 후 clean (supabase/.temp/ 만 untracked)
- 본 chat 시작 HEAD: `1adc74b` → handoff push 후 = 1 commit 진행
  (handoff)

**V1 실 동작 진행도 표 갱신:**

| V1 기능 | 실 동작 |
|---|---|
| V1-1 마스터 화면 (web) | ❌ V1.5 |
| V1-2 촬영 전 태그 (mobile) | ❓ V1.5+ |
| V1-3 연속 촬영 (mobile) | ❓ V1.5+ |
| V1-4 갤러리 화면 (web) | ❌ V1.5 |
| **V1-5 엑셀 출력 (web)** | ✅ **본 PASS 확정** (옵션 B BX: 시트 분리 + A3 셀 그룹 기준 + 시트명 그룹 기준) |
| V1-6 동기화 트리거 | ❓ 미확인 |
| 부수: 로그인 + 사진 업로드 메타 4칸 | ✅ |

V1 §5 deliverable **본 PASS 확정 도달** (chunk A' 옵션 B BX 완성).
다음 핵심 단계 = 실 사용자 검증 (chunk B).

### § 2. D-5d 변동 사항

#### 2.1 commit `1adc74b` — V1 §5 본 PASS 확정 (chunk A' 옵션 B BX)

- 수정: `apps/web/app/api/excel/route.ts` — 시트 분리 (groups Map) +
  A3 동적 텍스트 + 시트명 그룹 기준 + sanitize/suffix helper
- 신규: `toSeoulDate` (Intl.DateTimeFormat formatToParts 결정적,
  Asia/Seoul YYYY-MM-DD)
- 신규: `imageBuffers` Map<photo.id, Buffer> — 그룹별 시트 loop 에서
  동일 image 재참조 시 buffer 재사용
- 결정 세트 Q1-Q7 + P1-P3 (Planner 정찰 + 사용자 결정 7+3 = 10건)
- Gate 2 b-2 PASS:
  - test7 (위치 3종) → 4 시트, sanitize + " (2)" suffix 정합
  - 504c33d9 (날짜 5종) → 6 시트, multi-sheet 시트명 그룹 기준 정합
- pre-commit hook: `turbo check-types` 3 packages PASS

#### 2.2 D-5d 결정 정정 (KI-33 재발)

- P3 초기 결정 (D-5c handoff §4.3.3) = "시트 이름 = String(seq)
  시퀀스, '1', '2', '3'"
- b-2 사용자 실 xlsx 결과 본 후 정정: 시트 이름 = 그룹 기준 (위치명
  / YYYY-MM-DD)
- 추가 사용자 결정 (Planner Q5-Q7 반영):
  - Q5: 그룹 sheet 명 중복 시 ` (2)` suffix 패턴 (a)
  - Q6: A3 셀 텍스트 유지 (시트명 = 그룹 기준이어도 A3 동적 텍스트 유지)
  - Q7: ExcelJS sheet 이름 제약 (31자 / 특수문자 5종) sanitize

#### 2.3 D-5d 부수 발견

##### V1.5 UX 신규 — ExcelGenerateForm vendor dropdown 필터링 부재

ExcelGenerateForm 의 vendor dropdown 이 project 선택과 무관하게
전체 vendor list 노출. 사용자가 다른 project 의 vendor 혼합 선택 시
0건 404 발생. 회피 = project 선택 시 해당 project 의 vendor 만
필터링. V1.5 UX 백로그 (chunk I 신설).

##### photo 중복 6초 차이

test7 검증 데이터 = photo6 = 같은 위치/공종 + taken_at 6초 차이 = 2 row
등록. taken_at 자동 채움 흐름 (PhotoUploadForm) 영향 가능성. V1.5
별 chunk (carryover-10 의 W2 와 연관).

#### 2.4 KI-33 보강 (회피 패턴 4 추가)

- KI-33 § 회피 패턴 항목 4 추가: "mockup 표 시각화 ≠ 의도 확정 —
  시각 UI 의 실 결과는 b-2 단계 실 산출물 본 후에 사용자 의도 정정
  가능. D-5d P3 정정 (시트 이름 시퀀스 → 그룹 기준) 사례"
- 큰 결정일수록 b-2 사용자 검증에서 의도 정정 발생 가능성 인지, 정정
  시 thin slice chunk 로 회복 (rollback 회피)

### § 3. 환경 전제

#### 3.1 회사 PC (본 chat D-5d)

- 작업 경로: `~/work/acspc` (founder_ys home)
- Node: v22.22.2 (nvm)
- preamble: `export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ;
  export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`

#### 3.2 집 PC (D-5e 진입 가능 환경)

- 작업 경로: `~/work/acspc` (sinabro home)
- Node: v22.22.2 (nvm)
- preamble: `export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`
  (cert 라인 제거)
- 그 외 동일 (KI-16 회피, `;` 체인)

#### 3.3 공통 제약

- bash 체인: `;` 권장 (exit 전파 회피, KI 11-class)
- registry 명령 금지: `pnpm list/why/outdated` (KI-16 회피)
- git add . 금지, explicit add list 만
- pre-commit hook: `turbo check-types` (3 packages tsc --noEmit)

#### 3.4 도구

- pnpm 10.33.0 (hoisted), Turborepo 2.9.6
- Next 15.5.15 + Turbopack / React 19.1.0 / Tailwind CSS 4.x
- Expo SDK 54 (scaffold 단계)
- **exceljs 4.4.0** (D-5a 추가, exact pin) — Next.js 서버 측 실행,
  multi-sheet API 활용 (D-5d)
- Supabase (production DB + Storage + RLS 5종 + GRANT 28 rows)
- zod v4 (packages/domain), `z.uuid()` top-level, `z.enum([...])`
- vitest (단위 테스트)

#### 3.5 운영 원칙

- 단일 진실 원본: CLAUDE.md → .claude/rules/* →
  docs/agent-shared/operating-principles.md → docs/*
- Planner / Generator / Evaluator 분리
- Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
- 사용자 승인 언어 엄수 (단독 "승인" 보다 동사 명시 권장. "권장대로"
  = 묵시 동사 동등)
- 단계 전환 시 명시 승인 발화 엄수 — D-4y~D-5d carryover
- **사용자 발화 의도 다의성 감지 시 mockup / 예시 데이터 표로 결과
  차이 시각화 후 명시 결정 (KI-33)**
- **mockup 표 시각화 ≠ 의도 확정 — 시각 UI 실 결과는 b-2 단계에서
  정정 가능. 큰 결정일수록 b-2 정정 가능성 인지 (KI-33 회피 패턴 4)**

### § 4. D-5e 다음 턴 스펙

#### 4.1 후보 진입 chunks

| 후보 chunk | 우선순위 | 근거 |
|---|---|---|
| **B. 사용자 검증 (김민성 / 김은수)** | **high** | V1 §5 본 PASS 확정 후 실 사용자 첫 검증. V2 진입 전 필수 |
| D. KI 누적 정리 (KI-23 ~ KI-33) | medium | V1 후반 정리 chunk. 짧은 chunk, handoff 와 묶기 가능 |
| E3'. Medium 4 (본문 폰트 name) + A2 페이지 번호 | low | D-5b carryover-8 잔존 |
| F. Mobile 트랙 결정 (V1.5 vs V2 vs V3 분리) | high (V1.5 진입 시) | v2-priorities §8 명시 |
| G. 보조 출처 정찰 (docs/00, docs/01 §4, docs/02, minor-fixes, phase-5.5-decomposition) | low-medium | v2-priorities §8 명시 |
| H. V2 사양서 진입 (v2-priorities 활용) | high (V2 진입 시) | V2 진입 핵심. 매우 큰 다발 |
| **I. V1.5 UX — ExcelGenerateForm vendor dropdown project 필터링** | low (V1.5 본격 진입 시) | D-5d 신규 carryover |

#### 4.2 권장 진입 순서

D-5e 권장 = **chunk B (사용자 검증)**.

근거:

- V1 §5 본 PASS 확정 (D-5d 완료) → 실 사용자 첫 검증 단계 도달
- V2 진입 전 필수 — 사용자 검증 없이 V2 사양서 진입 시 가설 누적 위험
- 김민성 / 김은수 = 건축 현장 PM (V1 페르소나)

후속 권장 순서: B → D (KI 정리) → E3' → F (Mobile 트랙) → I (V1.5
UX) → G (보조 출처) → H (V2 사양서).

#### 4.3 chunk B 정찰 가이드

##### 4.3.1 검증 절차 (정찰 turn 에서 구체화)

- dev server 기동 → test 계정 셋업 → 사진 업로드 시나리오 → 엑셀
  다운로드 → 만족도/개선점 수집
- 검증 데이터: 실 사용자가 직접 사진 업로드 (taken_at, location,
  trade, vendor 메타 4칸 채움) — 또는 기존 demo 데이터 (test7,
  504c33d9) 사용
- 산출물: 검증 노트 (`docs/_backlog/user-validation-d5e.md`) + 개선
  후보 list

##### 4.3.2 잠재 위험 (RW-D5e-B)

- **W7**: 사용자 화면 = 회사 PC 또는 집 PC dev server (localhost).
  외부 노출 시 ngrok / Vercel 임시 deploy 필요. 사용자 결정 사항.
- **W8**: ExcelGenerateForm UUID 텍스트 입력 = V1 임시 UI. 실 사용자가
  UUID 직접 입력 어려움 → vendor dropdown V1.5 UX (chunk I) 와 직결.
  사용자 검증 시 임시 dropdown / 사전 셋업 데이터 필요.
- **W9**: 사용자 검증 시간 = chunk 길이 가변. Gate 2 = 사용자 만족도
  발화 (정량 지표 없음, 정성 평가).

#### 4.4 범위 외 (D-5e 일반)

- V1 본문 (docs/01) 변경
- v1-closure-report.md 본문 정정 (별 chunk)
- handoff 수정
- 새 인터뷰 / 새 KI 추가 (필요 시 신설 별 chunk)
- chunk B 외 chunk 동시 진입

#### 4.5 권장 진행 순서 (chunk B)

1. 정찰 turn: 검증 절차 구체화 + W7 (외부 노출 결정) + W8 (임시 UI
   회피) + 검증 데이터 결정 (기존 demo vs 신규 업로드)
2. Planner turn: Gate 1 체크리스트 (검증 절차 정의 = 문서 변경) 제출
3. Gate 1 사용자 승인 → Generator turn (검증 노트 작성)
4. 사용자 실 검증 수행 (외부 사용자 발화 단계)
5. Evaluator turn (검증 결과 검토)
6. Gate 2 사용자 승인 → 검증 노트 commit + push + 개선 후보 우선순위
   분류 (V1.5 vs V2)

### § 5. 새 대화창 시작 가이드 (D-5e 복붙용 프롬프트 초안)

(아래 내용은 D-5e 새 대화창에 사용자가 그대로 복붙할 텍스트)

---

본 chat 끝까지 다음 운영 원칙 엄수:

1. 단일 진실 원본 (CLAUDE.md → .claude/rules/* →
   docs/agent-shared/operating-principles.md → docs/*)
2. Planner / Generator / Evaluator 분리 (한 turn 한 역할)
3. Gate 2 기본 필수, docs-only 면제 시 Planner 근거 + 사용자 명시 승인
4. git add . 금지, explicit add list 만
5. 사용자 승인 언어 엄수 — 단독 "승인" 보다 동사 명시 권장 ("Gate 2
   승인" / "본 작성 진입 승인" 등). "권장대로" = 묵시 동사 동등
6. 단계 전환 시 사용자 명시 승인 발화 엄수 — Planner 가 prompt 끝마다
   명시 승인 발화 형식 명시 + 사용자 발화 후에만 Claude Code 투입
7. 환경 분기 —
   - **회사 PC**: preamble = `export
     NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ; export
     PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"`, 작업 경로
     = `~/work/acspc`, Node v22.22.2
   - **집 PC**: preamble = `export
     PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH"` (cert 라인
     제거), 작업 경로 = `~/work/acspc`, Node v22.22.2
8. bash `;` 체인 + KI-16 회피 (registry 명령 금지)
9. 신규 KI 발견 시 즉시 known-issues.md 등재 후보 (Planner 판단).
   KI-23 ~ KI-33 잔존 / V2 회피 패턴 명시
10. **사용자 발화 의도 다의성 감지 시 mockup / 예시 데이터 표로 결과
    차이 시각화 후 명시 결정 (KI-33)**. **mockup 시각화 ≠ 의도 확정
    — 큰 결정일수록 b-2 사용자 검증에서 의도 정정 가능성 인지 (KI-33
    회피 패턴 4)**

본 chat HEAD: **`<handoff push 후 hash>`** (D-5d 종결 = handoff commit)
직전 commit: `1adc74b` feat(excel): V1 §5 본 PASS — chunk A' (옵션 B
BX) 시트 분리 + 시트명 그룹 기준
직전 handoff: `docs/_backlog/handoff-d5d-to-d5e.md` (본 commit)

handoff raw URL (집 PC / 다른 PC 진입 시 fetch):
`https://raw.githubusercontent.com/ceoYS/acspc/main/docs/_backlog/handoff-d5d-to-d5e.md`

V1 진행도: **V1 §5 본 PASS 확정** (chunk A' 옵션 B BX: 시트 분리 +
A3 셀 그룹 기준 + 시트명 그룹 기준). 다음 chunk = **B (사용자 검증)
권장**:

- 근거: V1 §5 본 PASS 확정 후 실 사용자 첫 검증. V2 진입 전 필수
- 후속 권장 순서: B → D (KI 정리) → E3' (Medium 4 + A2) → F (Mobile
  트랙) → I (V1.5 UX) → G (보조 출처) → H (V2 사양서)

D-5e 진입 시 첫 사용자 발화 후보:

- "D-5e 시작. chunk B (사용자 검증) 정찰부터" (권장)
- "다른 chunk 진입 (D / E3' / F / G / H / I)"
- "집 PC 환경 점검 먼저" (집 PC 첫 진입 시)

#### 집 PC 첫 진입 시 환경 점검 명령

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" && cd ~/work/acspc && pwd && git remote -v | head -1 && node --version && git pull origin main && git log --oneline -3
```

기대:

- `/home/<user>/work/acspc`
- `origin https://github.com/ceoYS/acspc.git (fetch)`
- `v22.22.2`
- 최신 main 동기화 = `1adc74b feat(excel): V1 §5 본 PASS` 가 직전
  commit
- `git log --oneline -3` = handoff d5d-to-d5e + `1adc74b` + `717e60a`

불일치 시 Planner 복귀.

집 PC 별도 셋업 확인:

- `.env.local` 의 Supabase publishable key (집 PC = `sb_publishable_*`
  형식, KI-791 정합)
- corp cert 미설정 (`NODE_EXTRA_CA_CERTS` 변수 미설정 정상)

만약 chunk B 진입 시 첫 정찰 turn:

- 읽을 파일: `apps/web/app/excel/ExcelGenerateForm.tsx` (현 UUID
  텍스트 입력 = 임시 UI, W8 회피 결정), `apps/web/app/api/excel/route.ts`
  (현 multi-sheet 출력 정합), docs/01 §5 (V1 정의 출력),
  .claude/rules/ui-constraints.md §5 (엑셀 UX 제약), `docs/00_strategy.md`
  §사용자 페르소나 (김민성 / 김은수)
- 잠재 위험 W7 ~ W9 (§4.3.2) 점검
- 사용자 결정 사항 (외부 노출 방식, 임시 UI 회피, 검증 데이터 선택)
  재확인

### § 6. 미해결 carryover (D-5c → D-5d → D-5e)

- **carryover-1**: 단계 전환 명시 승인 발화 — 정착 (D-5c~D-5d).
  잔여 = Planner prompt 끝 명시 발화 형식 완전 정착.
- **carryover-2**: "권장대로" 묵시 동사 동등 — 정착 (D-5c~D-5d 빈번
  사용).
- **carryover-3 (D-5c 잔존, D-5d 해소)**: chunk A' (옵션 B BX) 진입
  → 완료 (commit `1adc74b`).
- **carryover-4**: 잔존 KI (KI-23 ~ KI-33) 정리 chunk = D chunk.
- **carryover-5**: 보조 출처 5건 (docs/00, docs/01 §4, docs/02,
  minor-fixes.md, phase-5.5-decomposition.md) 정찰 미수행 (G chunk).
- **carryover-6**: V2 사양서 진입 전 사용자 검증 (chunk B) — **D-5e
  핵심**.
- **carryover-7 (D-5b~D-5c 잔존, D-5d 해소)**: V1 §5 본 PASS 확정 =
  chunk A' 옵션 B BX 도달 → 완료 (commit `1adc74b`).
- **carryover-8 (D-5b 잔존)**: 엑셀 양식 fine-tuning Medium 4 (본문
  폰트 name) + A2 페이지 번호 = chunk E3'.
- **carryover-9 (D-5a 잔존)**: 사진 회전 메타데이터 (EXIF
  orientation) 서버 측 자동 회전 미적용 → V1.5
  expo-image-manipulator 또는 서버 측 sharp 도입 검토.
- **carryover-10 (D-5c 잔존)**: W2 nullsLast 실 동작 검증 = V1.5 별
  chunk (taken_at 자동 채움 PhotoUploadForm 흐름).
- **carryover-11 (D-5c 잔존, D-5d 해소)**: chunk A' (옵션 B BX) 진입
  결정 → 완료. KI-33 회피 = mockup / 예시 데이터 표로 결과 차이 시각화
  의무는 정착, b-2 의도 정정 가능성 인지는 회피 패턴 4 로 보강.
- **carryover-12 (D-5c 신규, D-5d 정착)**: KI-33 의 mockup 제시 의무
  패턴 정착 → 회피 패턴 4 추가로 보강 (operating-principles.md §사용자
  발화 다의성 처리 패턴 신설 후보, Evaluator 체크리스트 §p 신설 후보
  잔존).
- **carryover-13 (D-5d 신규)**: V1.5 UX = ExcelGenerateForm vendor
  dropdown project 필터링 (chunk I).
- **carryover-14 (D-5d 신규)**: photo 중복 6초 차이 (taken_at 자동
  채움 흐름 영향) — V1.5 별 chunk (carryover-10 W2 와 연관).
- **carryover-15 (D-5d 신규)**: KI-33 보강 — mockup 시각화 + 실 결과
  b-2 검증 양쪽 필수 (정착 후 operating-principles.md 흡수 후보).
