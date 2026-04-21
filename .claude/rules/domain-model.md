# Domain Model — acspc

AI (Claude Code, Codex CLI) 가 마이그레이션·zod 스키마·쿼리 작성 시
참조하는 기계 친화적 도메인 명세. docs/01 §3 는 산문 설명, 이 파일은
표·규칙·제약 중심.

## 0. 변경 정책

스키마 변경은 operating-principles §3.4 "중요 변경" 에 해당. 교차
검증 필수 (Claude Code → Codex CLI 또는 반대).

표의 제약 표기는 개념. 실제 SQL 은 Supabase 관례로 Claude Code 가
작성. 예: `create table projects ( id uuid primary key default
gen_random_uuid(), ... );`

## 1. 엔티티 정의

모든 테이블은 `user_id` 컬럼을 직접 보유 (RLS 성능 최적화).

### 1.1 Project

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | V1 이후 변경·재생성 금지 |
| user_id | uuid | FK auth.users, not null | RLS 키 |
| name | text | not null, ≤ 200자 | 프로젝트명 = 공종명 (docs/01 §6.2) |
| created_at | timestamptz | not null, default now() | DB 레코드 생성 시각 |

### 1.2 Location (위치 태그)

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK auth.users, not null | RLS 키 (중복 저장) |
| project_id | uuid | FK projects, not null, on delete cascade | |
| name | text | not null, ≤ 100자 | 예: "101동_503호_주방" |
| created_at | timestamptz | not null, default now() | |

unique: (project_id, name)

### 1.3 Trade (공종 세부)

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK auth.users, not null | RLS 키 |
| project_id | uuid | FK projects, not null, on delete cascade | |
| name | text | not null, ≤ 100자 | |
| created_at | timestamptz | not null, default now() | |

unique: (project_id, name)

### 1.4 Vendor (업체)

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK auth.users, not null | RLS 키 |
| project_id | uuid | FK projects, not null, on delete cascade | |
| name | text | not null, ≤ 100자 | 특수문자 치환 후 저장 (§4 참조) |
| created_at | timestamptz | not null, default now() | |

unique: (project_id, name) — 프로젝트 내 동일 이름 Vendor 중복 금지

### 1.5 Photo

| 필드 | 타입 | 제약 | 비고 |
|---|---|---|---|
| id | uuid | PK | V1 이후 변경·재생성 금지 (V2 photo_annotations FK 대비) |
| user_id | uuid | FK auth.users, not null | RLS 키 |
| project_id | uuid | FK projects, not null, on delete cascade | |
| location_id | uuid | FK locations, **not null** | |
| trade_id | uuid | FK trades, **not null** | |
| vendor_id | uuid | FK vendors, **not null** | |
| content_text | text | not null, length ≥ 1, ≤ 200자 | 엑셀 셀 크기상 권장 상한 |
| taken_at | timestamptz | not null | 기기 시계 기준 촬영 시각 (오프라인 가능) |
| storage_path | text | not null | `{user_id}/{project_id}/{id}.jpg` 형식 |
| gallery_album | text | nullable | 촬영 시점 스냅샷. Location.name 변경 시 갱신 안 함 |
| created_at | timestamptz | not null, default now() | DB 레코드 생성 시각 (동기화 시점) |

**taken_at vs created_at**: 오프라인 촬영 후 동기화 지연 시 두 값 차이
발생. 엑셀 일자 표기는 taken_at 사용.

**Storage 버킷**: `photos` (private, RLS 동일 user_id 패턴).

## 2. 관계 (ER)

````
auth.users (1) ── (N) Project
Project (1) ── (N) Location / Trade / Vendor / Photo
Location (1) ── (N) Photo
Trade (1) ── (N) Photo
Vendor (1) ── (N) Photo
````

모든 `on delete` 는 **cascade**. 프로젝트 삭제 시 하위 전부 삭제.

## 3. RLS 규칙

모든 테이블 RLS policy 동일 패턴 (user_id 직접 비교):

```sql
create policy "own rows" on <table>
  for all using (user_id = auth.uid());
```

V1 은 단일 사용자 단독 사용. 팀 공유 / 멀티 사용자는 V2 이후 재설계.

## 4. 불변 규칙 (Invariants)

- Photo 의 location_id / trade_id / vendor_id 가 모두 같은 project_id
  및 user_id 에 속해야 함. **앱 레벨 (zod + Supabase RPC) 검증** 으로
  강제. DB 레벨 trigger 는 V1 사용 안 함.
- Photo.user_id / Location.user_id / Trade.user_id / Vendor.user_id 는
  모두 해당 project.user_id 와 동일. 앱 레벨 검증.
- content_text 는 빈 문자열 금지 (length ≥ 1)
- Vendor.name 의 특수문자 (`/ \ : * ? " < > |`) 는 저장 전 `_` 로 치환
  (엑셀 파일명 규칙, docs/01 §6.2)
- Photo.taken_at 은 미래 시각 불가 (now() + 1시간 초과 거부)
- Photo.id 는 V1 이후 변경·재생성 금지 (V2 확장 FK 기준)

## 5. 자동 생성 필드

- id: `gen_random_uuid()` 또는 클라이언트 uuid v4 (오프라인 선생성)
- created_at: `now()` 기본값
- updated_at: V1 에선 사용 안 함 (수정 유스케이스 최소)

## 6. 삭제 정책

- V1: **전체 hard delete**. soft delete 컬럼 없음.
- 프로젝트 삭제 시 cascade 로 하위 전부 삭제.
- Photo 삭제 시 Supabase Storage 파일도 동시 삭제. 구현: **Edge
  Function** (DB trigger 는 Storage 접근 복잡). 삭제 요청을 Edge
  Function 이 받아 DB row + Storage 파일 트랜잭션.
- V2 이후 팀 공유 도입 시 soft delete 재검토.

## 7. 인덱스

### 7.1 Photo

- `photos (project_id, taken_at desc)` — 프로젝트 내 시간순 조회.
  유스케이스: 전체 사진 리스트 (관리·확인).
- `photos (project_id, vendor_id, taken_at desc)` — 업체별 필터링.
  유스케이스: 엑셀 생성 (docs/01 §2 기능 5).
- `photos (project_id, taken_at)` (범위) — 파일명 규칙 YYMMDD-YYMMDD
  기반 기간 쿼리 (docs/01 §6.2).

### 7.2 마스터 테이블

- `locations / trades / vendors (project_id, name)` — 드롭다운 조회.
  unique 제약이 자동 인덱스 생성. 추가 불필요.

## 8. 확장 예고 (V1 범위 아님)

다음은 V2+ 에서 추가 예상. 현재는 **추가 금지**:

- `photo_annotations` (도면 핀 대체, V2) — Photo.id 를 FK 로 참조
- `vendor_responses` (업체 회신 기능, V2)
- `excel_templates` (엑셀 양식 다양화, V2+)
- `team_members` (팀 공유, V2+)

이 확장을 V1 에서 요청 시 scope-cut 스킬 발동.

## 9. Security Notes

### 9.1 변조 방어 — 모든 서버 측 DB write 경로에 적용

user_id 재추출은 다음 모든 위치에서 수행:
- Supabase Edge Function
- Next.js 서버 컴포넌트, Route Handler, middleware
- 마이그레이션 스크립트 (고정 user_id 사용 시 주석 명시)

클라이언트 (apps/web 브라우저, apps/mobile) 는 user_id 를 payload 에
포함시키지 않고, 서버가 JWT 기반으로 주입.

### 9.2 ID 필드 검증 정책

- user_id: 서버가 JWT 에서 재추출. 클라이언트 값 무시.
- project_id / location_id / trade_id / vendor_id: 클라이언트가 전송
  (서버가 재추출 불가). 단 의미적 일관성은 서버가 검증.
- 검증 위치: Edge Function 또는 Next.js 서버 코드
- 검증 내용: 받은 FK 들이 모두 같은 user_id·project_id 소속인지
- 검증 실패 시 400 반환. DB 쓰기 시도 전 차단.
- 클라이언트 검증 (zod) 은 UX 편의용 1차 검증. 서버 검증이 정답.

### 9.3 Storage 접근

- `storage_path` 형식: `{user_id}/{project_id}/{id}.jpg` 고정 (§1.5).
- Storage 버킷 `photos` 는 private. RLS 활성화.
- Photo 삭제 → Storage 파일 삭제는 Edge Function 트랜잭션 (§6).
  직접 클라이언트가 Storage DELETE 호출 금지.

#### Storage RLS 실제 문법

Supabase Storage RLS 는 `storage.objects` 테이블에 policy 설정:

```sql
create policy "own files" on storage.objects
  for all using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

**중요**: `storage.foldername()` 함수의 시그니처는 Supabase 버전에
따라 달라져왔다. 마이그레이션 작성 **직전에** Supabase 공식 문서
(https://supabase.com/docs/guides/storage/security/access-control) 에서
최신 문법 확인 후 사용할 것. 위 예시는 **개념 예시**이며 copy-paste
금지.

**타입 캐스팅 방향 고정**:
- `auth.uid()::text` — uuid 반환값을 text 로 캐스팅 후 비교
- 반대 방향 (`(storage.foldername(name))[1]::uuid`) 금지:
  storage path 가 유효 UUID 가 아니면 런타임 에러 발생

#### Path Traversal 방어

storage_path 파싱 시 검증:
- `../` 또는 `..\\` 패턴 거부
- 경로 첫 segment 가 UUID 형식 (36자, 하이픈 4개) 확인
- JWT userId 와 string 정확 일치 (대소문자 구분)

### 9.4 service role key 허용 시나리오

service role key 로 DB 접근은 다음 3가지 경우만:
- 마이그레이션 스크립트 (DDL 변경)
- 관리자 배치 작업 (V2 이후, 사용자 전체 집계 등)
- 크로스 유저 알림 (V2 팀 공유 기능)

위 3개 외는 모두 anon key + RLS 사용. service role 사용 시도:
- 쿼리 내 `user_id` 조건 **명시적으로 붙이기**. 예:
  `where user_id = $jwt_user_id`
- 이를 생략하면 다른 user 데이터 유출 가능

### 9.5 RLS 우회 금지

service role 로 쿼리 작성 시에도 user_id 조건 명시. 실수로 전체 row
반환하는 쿼리 작성 금지.

## 10. 참조

- docs/01 §3 (스키마 산문 설명)
- docs/01 §6.2 (엑셀 파일명 규칙)
- docs/agent-shared/operating-principles.md §3 (역할 분리)
- .claude/rules/tech-stack.md §1.5 (Supabase)
- .claude/rules/tech-stack.md §5 (RLS 간략)
- .claude/rules/tech-stack.md §7 (시크릿 관리)
