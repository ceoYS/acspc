# Phase 5.5 (CRUD) — 분해 합의

**상태**: 진입 대기. **합의 세션**: D-4u. **V1 진도**: ~92% (Phase 5.5 통과 = V1 종결).
**원전**: handoff-d4t-home-to-d4u.md §6.

## 결정 3건

| # | 결정 | 채택안 | 근거 |
|---|---|---|---|
| a | photos FK 폭증 | photos 단독, FK 4개 (project/location/trade/vendor) 모두 nullable. locations/trades/vendors 후속 chunk | thin slice |
| b | Edge Function (photo 삭제 트랜잭션) | V1 보류 → V2 | 회사망 Deno runtime 미확인. V1 = INSERT+SELECT 우선 |
| c | storage_path 일치성 검증 | server action 단일. client 측은 UX hint 만 (선택) | 단일 진실 원본, 보안 마진 |

## Sub-chunk (각 1 PROMPT 단위)

- **5.5.0** 정찰 (Supabase Studio 상태 + KI-22 GRANT 점검 + storage bucket 정책 + storage_path 컨벤션 결정)
- **5.5.1** photos table schema (nullable FK 4개) + KI-22 GRANT 자동 적용
- **5.5.2** RLS policy (`user_id = auth.uid()` thin slice) + 검증
- **5.5.3** page 분리 (login 임시 form → `/photos/upload` 전용)
- **5.5.4** INSERT + storage upload server action (결정 c 적용 지점)

총 5~8 turn 추정. 5.5.4 통과 = V1 종결.

## 잠재 위험

- KI-22 GRANT 보충 의무 — 5.5.1 PROMPT 필수 항목
- Edge Function V1 보류 시 photo 삭제 V2 backlog + domain-model.md §6 V2 이관 명기 의무
- storage_path naming 컨벤션 — 5.5.0 정찰에서 확정
- 본 분해 = web 한정. mobile 측 photos CRUD 는 V2 검토

## 범위 외 (V2 또는 후속 chunk)

- locations / trades / vendors CRUD
- photo 삭제 (Edge Function)
- mobile 앱 photos
- UPDATE 시나리오
