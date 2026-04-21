# Plan Review Gate — 운영 체크리스트

원칙 정의는 docs/agent-shared/operating-principles.md §3.1 참조.
이 파일은 Gate 1 과 Gate 2 의 **운영 체크리스트** 만 담는다.

## 발동 순서

1. 사용자 요청 수신
2. **.claude/skills/scope-cut 선행 체크** (V1 비포함 영역 판정)
3. scope-cut 미발동 시 Planner 가 Gate 1 체크리스트 작성
4. Gate 1 사용자 승인 → Generator 실행
5. Generator 완료 → Evaluator 검토
6. Gate 2 사용자 승인 → 커밋

scope-cut 은 **Gate 1 이전** 에 발동 가능. Gate 1 체크리스트 5번 항목
은 최종 확인용.

## Gate 1 — Plan Review (Generator 실행 직전)

Planner 는 변경 성격에 맞는 체크리스트를 모두 명시 응답해야 한다.
하나라도 빠지면 사용자는 Gate 1 미통과로 간주.

### Gate 1-A vs 1-B 선택 기준

- **A (문서)**: `.md` / `.txt` / 주석만 있는 파일 변경
- **B (코드)**: 실행 가능 파일 (`.ts` / `.tsx` / `.sql` / 설정 파일
  인 `.json` / `.yaml` / `package.json` 등)
- 경계 애매 (예: `tech-stack.md` 는 문서 + 규칙): A 와 B **모두 제출**
  (항목 합집합)

### Gate 1-A: 문서 변경 체크리스트 (6개)

1. 작업 목표 1~3줄
2. 변경 대상 파일 목록 (경로 전체)
3. 각 파일에서 변경될 섹션명
4. 변경 이유 (관련 docs/0X 섹션 번호 또는 인터뷰 근거)
5. V1 비포함 목록 (docs/01 §4) 과 충돌 없음 확인
6. 검증 방법 (수동 리뷰 / 상위 문서 정합성 체크 중 무엇)

### Gate 1-B: 코드 변경 체크리스트 (7개)

1. 작업 목표 1~3줄
2. 변경 대상 파일 목록 (경로 전체)
3. 각 파일에서 변경될 함수명 또는 블록
4. 변경 이유
5. V1 비포함 목록과 충돌 없음 확인
6. 예상 줄 수 증감 (+X / -Y).
   의존성 추가 시: package.json 변경분만 셈 (node_modules 제외).
   별도로 tech-stack.md §3 3-질문 통과 필요.
7. 검증 방법 (단위 테스트 / 통합 테스트 / 수동 확인 중 무엇)

### Gate 1-A-mini: 간소 문서 변경 체크리스트 (3개)

`docs/_backlog/` 내 **파일 신규 생성** 시 scope-cut / kpi-check 스킬
흐름에서 호출. 기존 파일 수정에는 사용하지 않음.

1. 작업 목표 1줄
2. 파일 경로
3. 내용 요약 (3줄 이내)

### Gate 1-A-mini 사용 조건

다음 4개 **모두 만족** 시에만 간소 버전. 하나라도 벗어나면 전체
Gate 1-A 사용.

- `docs/_backlog/` 하위 경로
- **파일 신규 생성** (기존 파일 수정 아님)
- 50줄 이하 (대부분은 30줄 이내, scope-cut 초안 기준)
- scope-cut 또는 kpi-check 스킬 흐름의 일부

기존 `_backlog/` 파일 수정은:
- 10줄 이하 오타 수정 → 상위 Gate 1 우회 조건 적용
- 10줄 초과 또는 의미 변경 → 전체 Gate 1-A 사용

### Gate 1-A-mini 확장 검토 (현재 미적용)

향후 다음 경우 확장 검토:
- `docs/_reference/` 외부 자료 추가 (PDF / 이미지)
- `docs/interviews/` 새 인터뷰 원문 추가 (50줄 초과 가능)

확장 시 별도 Gate 1 통과 필요. 현재는 `_backlog/` 전용.

### Gate 1 우회 조건 (변경 작업 한정)

다음 변경은 Gate 1 없이 Generator 바로 실행 가능:
- 타입 에러 / 린트 경고 / 오타 수정 (10줄 이하)
- 한 함수 내부 국소 수정 (10줄 이하)

read-only 조사는 변경 작업이 아니므로 Gate 대상 외.

우회 조건에 해당해도 **Gate 2 는 반드시 거친다.**

## Gate 2 — Result Review (커밋 직전)

Generator + Evaluator 루프 종료 후 사용자 승인.

### 역할 분담 (테스트 실행 포함)

- **Generator 가 테스트 실행**: 단위/통합/수동 검증 실제 수행 + 결과 제시
- **Evaluator 는 검토만**: Generator 가 낸 결과를 읽고 평가.
  직접 테스트 실행 금지
- Gate 2 제출물에는 **두 결과 모두** 포함

### Gate 2 제출 항목 (6개)

1. 변경된 파일 경로 전체 목록
2. diff 요약 (추가/삭제/수정 줄 수)
3. 핵심 변경 3줄 이내 설명
4. Generator 가 실행한 검증 결과 (테스트 통과/실패 또는 리뷰 결과)
5. Evaluator 피드백 중 반영한 것과 거부한 것 구분
6. 커밋 메시지 제안 (conventional commits 형식)

### push 는 Gate 2 대상 외

Gate 2 승인은 git commit 까지만 의미.
git push 는 사용자가 "push 해라" 명시 지시 시에만 실행.

### Gate 2 실패 시 대응 (우선순위 순)

1. 사용자 거부 → 최우선. 변경 롤백 후 Planner 부터 다시
2. 테스트/검증 실패 → Generator 재실행
3. Evaluator 피드백 수용 여부 불명확 → Evaluator 재호출

여러 케이스 동시 발생 시 위 순서로 처리.

## 공통 금지

- Gate 1 승인 전 파일 수정 (우회 조건 외)
- Gate 2 승인 전 git commit 실행
- 사용자 명시 지시 없이 git push 실행
- Gate 우회 사유를 사용자에게 알리지 않은 채 진행
- Evaluator 가 테스트 직접 실행

## 이 문서의 위치

- 이 문서는 **운영 체크리스트** 만 담는다
- 원칙·루프·역할 정의는 docs/agent-shared/operating-principles.md §3 참조
