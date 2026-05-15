# User Validation — D-5e (V1 §5 엑셀 출력)

작성일: 2026-05-15
검증 대상 기능: V1-5 엑셀 출력 (multi-sheet, 시트 분리, 시트명 그룹 기준)
검증 대상 commit: 1adc74b
검증 페르소나: 김민성 / 김은수 (건축 현장 PM)
검증 상태: [x] 미수행 → 수행 후 [x] 로 변경

---

## 1. 사전 셋업 (진행자 YS 전용)

### 1.1 dev server 기동
```bash
export NODE_EXTRA_CA_CERTS="$HOME/.certs/corp-root.pem" ; export PATH="$HOME/.nvm/versions/node/v22.22.2/bin:$PATH" ; cd ~/work/acspc ; pnpm dev
```
- 확인: http://localhost:3000 접근 가능

### 1.2 검증용 project · vendor UUID 확인
Supabase Studio → Table Editor → projects / vendors 테이블에서
검증에 사용할 row 의 id(UUID) 값 복사 후 아래 칸에 기록.

| 항목 | UUID | 비고 |
|---|---|---|
| project_id | (진행자 기입) | |
| vendor_id | (진행자 기입) | |

### 1.3 demo 데이터 확인
- test7 photo set (위치 3종, 4 시트 기대)
- 504c33d9 photo set (날짜 5종, 6 시트 기대)
- Supabase Studio → photos 테이블 → 위 project_id 로 필터 → row 존재 확인

---

## 2. 검증 시나리오

### 시나리오 A — demo 데이터 엑셀 다운로드 (필수)

| 단계 | 행동 | 기대 결과 | 실제 결과 |
|---|---|---|---|
| A-1 | http://localhost:3000/excel 접속 | ExcelGenerateForm 렌더 | |
| A-2 | project_id 입력 (1.2 에서 복사) | 입력 완료 | |
| A-3 | vendor_id 입력 (1.2 에서 복사) | 입력 완료 | |
| A-4 | 그룹 기준 선택 (위치 또는 날짜) | 라디오 선택 반영 | |
| A-5 | "엑셀 생성" 버튼 클릭 | .xlsx 파일 다운로드 시작 | |
| A-6 | 파일 열기 → 시트 수 확인 | 그룹 수만큼 시트 생성 | |
| A-7 | 각 시트 → A3 셀 확인 | 그룹명(위치/날짜) 표시 | |
| A-8 | 각 시트 → 사진 삽입 확인 | 사진 정상 삽입 | |

### 시나리오 B — 실 사진 업로드 후 엑셀 다운로드 (권장, 1~2건)

| 단계 | 행동 | 기대 결과 | 실제 결과 |
|---|---|---|---|
| B-1 | 사진 업로드 화면 접속 | PhotoUploadForm 렌더 | |
| B-2 | 사진 1장 선택 + 메타 4칸 입력 (위치, 공종, vendor, taken_at) | 업로드 완료 | |
| B-3 | 시나리오 A 반복 | 방금 업로드 사진 포함된 시트 확인 | |

---

## 3. 사용자 피드백 수집

검증 후 아래 항목 기록 (진행자 관찰 + 사용자 직접 발화).

### 3.1 정량 체크
- [x] 시트 수 기대치 일치
- [x] 시트명 그룹 기준 정합
- [x] A3 셀 텍스트 정합
- [x] 사진 삽입 정상
- [x] 파일 다운로드 오류 없음

### 3.2 정성 피드백

| 항목 | 내용 |
|---|---|
| 전반적 만족도 (1~5) | |
| 불편한 점 | |
| 빠진 기능 | |
| 기타 발화 | |

---

## 4. 개선 후보 분류 (검증 후 기입)

| 개선 항목 | 우선순위 | V1.5 / V2 | 비고 |
|---|---|---|---|
| ExcelGenerateForm vendor dropdown project 필터링 | high | V1.5 | chunk I |
| (검증 후 추가) | | | |

---

## 5. 검증 결과 요약 (검증 후 기입)

- 검증 일시: 2026-05-15
- 참여자: YS (solo, 시나리오 A)
- 전반 평가: PASS — 날짜순(6시트) / 위치순(4시트) 모두 시트명·A3·사진 정합. 중복 suffix (2) 정상 동작.
- 다음 액션: 시나리오 B (실 사용자 검증) 일정 미정. 개선 후보 = chunk I (vendor dropdown 필터링) V1.5 진입 검토.
