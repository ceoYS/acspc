# Phase 5.5 (CRUD) — 분해 합의 v2

**상태**: 진입 대기 (5.5.1). **합의 세션**: D-4u. **V1 진도**: ~92% (5.5.4 통과 = V1 종결).
**원전**: handoff-d4t-home-to-d4u.md §6. **v2 사유**: 5.5.0 정찰로 충돌 3건 해소.

## 결정 3건 (v2)

| # | 결정 | 채택안 v2 | 비고 |
|---|---|---|---|
| a | photos FK | photos table 이미 존재 (NOT NULL FK 4개). migration `0004` 로 location/trade/vendor → nullable. project_id 만 NOT NULL 유지 | 0001 에 5종 테이블 모두 정의됨 |
| b | Edge Function (photo 삭제) | V1 보류 → V2. `domain-model.md §6` V2 이관 update 의무 (5.5.5 신규) | §6 V1 전제 미반영 발견 |
| c | storage_path 검증 | server action 단일. 현 PhotoUploadForm = client storage upload only, DB INSERT 부재 → 5.5.4 신설 | 작업 범위 v1 추정보다 큼 |

## Sub-chunk v2

- **5.5.0** 정찰 ✅ 완료 (집 PC, 오프라인)
- **5.5.1** migration `0004` (photos FK 3개 nullable + locations/trades/vendors/photos GRANT 보충, KI-22 의무) [정식]
- **5.5.2** RLS 검증 (이미 0001 적용, 동작 확인) [정식, 회사 PC online 권장]
- **5.5.3** page 분리 (login → `/photos/upload` 전용) [정식]
- **5.5.4** server action 신설 (storage upload + photos INSERT 트랜잭션 + storage_path 정합) [정식, V1 종결]
- **5.5.5** `domain-model.md §6` V2 이관 update [auto-exempt]

## 정찰 확정 사항 (5.5.0)

- schema: `supabase/migrations/0001_init.sql` (5종 + RLS 6개), `0002_grant_projects_authenticated.sql`, `0003_storage_photos_bucket.sql`
- storage bucket = `photos` (private)
- storage_path = `${userId}/${projectId}/${photoUuid}.jpg` (Phase 5.4 박제, `apps/web/app/login/PhotoUploadForm.tsx:36`)
- KI-22 GRANT 미적용 4개: locations / trades / vendors / photos
- RLS pattern (5종 + storage): `for all to authenticated using (user_id = auth.uid())`

## 잠재 위험 (잔존)

- 5.5.2 RLS 검증 = production DB online → 회사 PC 세션 권장 (집 PC 에서는 SQL 작성까지)
- 5.5.4 server action = 현 PhotoUploadForm.tsx client 직접 storage upload 코드 분리/이전 결정 필요
- v1 박제 (`9ca07eb`) 와 v2 차이 — 본 update 가 정정 commit

## 범위 외 (V2 또는 후속 chunk)

- locations / trades / vendors CRUD
- photo 삭제 (Edge Function)
- mobile 앱 photos
- UPDATE 시나리오
