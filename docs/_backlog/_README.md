# docs/_backlog/ — V1 범위 바깥 보관소

## 폴더 목적

V1 에 들어가지 못한 기능 제안과 측정 유예된 KPI 를 한 곳에 보관.
두 스킬이 이 폴더에 파일을 기록한다.

- `.claude/skills/scope-cut` → P1/P2/P3 로 분류된 기능
- `.claude/skills/kpi-check` → baseline "측정 불가" 로 통과된 기능

## 이관 정책

- **Step 5 Spec Kit 초기화 완료 전**: `docs/_backlog/` 사용
- **Step 5 완료 후**: `.specify/backlog/` 사용
- 기존 `docs/_backlog/*` 파일은 Step 5 완료 시 **일괄 수동 이관**
- 이관 후 `docs/_backlog/` 는 삭제 또는 empty 유지
- 이관 작업은 Step 5 체크리스트에 포함

## 파일 명명 규칙

### scope-cut 산출물
`P[N]_[YYYYMMDD]_[기능명].md`

예: `P1_260421_음성인식_태그입력.md`

### kpi-check 산출물
`kpi_pending.md` (단일 파일, append 방식)

항목 형식:
```
## [YYYYMMDD] [기능명]
- KPI: [이름]
- Baseline 측정 불가 이유: [3유형 중 하나]
- 재검토 예정: [측정 가능 조건]
```

**동시성 주의**: V1 은 단독 개발자 환경이나, 여러 AI 세션이 동시
수정 시 git merge conflict 가능. AI 는 수정 전 최신 상태 pull
확인. 충돌 발생 시 수동 병합.

V2 이상에서 파일 per 항목 (`kpi_pending_[YYYYMMDD]_[기능명].md`)
전환 검토.

## 초안 생성 흐름 (AI 가 직접 커밋하지 않는다)

scope-cut 또는 kpi-check 스킬이 _backlog 파일 생성이 필요하다고 판단
하면 다음 6단계 실행:

1. 스킬 발동
2. AI 가 대화창에 **초안 텍스트 제시** (파일 아직 생성 안 함)
3. 사용자가 초안 검토 후 "OK" 또는 수정 요청
4. OK 시 Generator 가 **Gate 1-A-mini** 제출
   (작업 목표 / 파일 경로 / 내용 요약 3개 항목만)
5. Gate 1 승인 → Generator 가 실제 파일 쓰기
6. Gate 2 승인 → 커밋

Gate 1-A-mini 는 plan-review-gate.md 참조.

## 재검토 주기 (사용자 책임)

- **P1 항목**: V1 출시 후 첫 3개월 내 (이벤트 기준)
- **P2 항목**: V2 계획 수립 시 (이벤트 기준)
- **P3 항목**: 12개월마다 (시간 기준)
- **kpi_pending 항목**: 6개월마다 (시간 기준)

기준이 이벤트·시간 혼재: P1/P2 는 제품 단계 의존, P3/kpi_pending
은 시간 경과 의존. 의도 구분.

## AI 의 재검토 알림 역할 (권장, 강제 아님)

AI 는 다음 상황에서 재검토 시점 알림:
- 새 scope-cut / kpi-check 발동 시 `_backlog/` 에 3개월 이상 된 P1
  항목 있으면 언급
- Spec Kit `/speckit-specify` 호출 시 관련 P1/P2 항목 있으면 참조

## 재검토 책임자

**인간 사용자**. AI 는 알림만. 실제 우선순위 판정과 파일 이동/삭제는
사용자 결정.

## 참조

- `.claude/skills/scope-cut/SKILL.md`
- `.claude/skills/kpi-check/SKILL.md`
- `.claude/rules/plan-review-gate.md` (간소 Gate 1-A)
- `docs/01_v1_product_definition.md` §4 (V1 비포함)
