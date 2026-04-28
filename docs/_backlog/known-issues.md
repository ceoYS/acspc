# Known Issues — acspc

세션을 거치며 학습한 환경/도구/정책 이슈 누적. handoff §11 ("새 이슈 발견 시 known-issues.md 에 기록 후 minor-fixes.md 의 이전 이슈 패턴 목록에도 반영") 정책에 따라 운영.

D-4l 시점 기준 신규 항목부터 시작 (이전 이슈 패턴은 minor-fixes.md 본문 + handoff §11 에 누적되어 있음).

## KI-01 (D-4l 신설): GitHub PAT workflow scope 정책

### 증상
`.github/workflows/*.yml` 신규 또는 수정 commit 을 HTTPS git push 시 다음 에러로 거부:
```
! [remote rejected] main -> main
(refusing to allow a Personal Access Token to create or update workflow
.github/workflows/ci.yml without `workflow` scope)
```

### 원인
GitHub 보안 정책: workflow 파일을 변경하는 push 는 PAT 의 `workflow` scope (classic) 또는 `Workflows: Read and write` permission (fine-grained) 명시 필요. classic PAT 의 default scope (`repo` 만) 으로는 거부.

### 해결책 (D-4l 채택 = 권장)
**Fine-grained PAT 발급** (https://github.com/settings/personal-access-tokens/new):
- Token name: 명확한 이름 (예: `acspc-ci-workflow`)
- Repository access: **Only select repositories** + 해당 repo 만 선택 (최소 권한)
- Permissions:
  * Contents: **Read and write** (기본 git push)
  * Metadata: **Read-only** (자동 추가)
  * Workflows: **Read and write** (workflow 파일 변경 허용)
- Expiration: 90 days 권장 (만료 알림 + 보안 우수)

### WSL git credential 설정
```bash
git config --global credential.helper store
rm -f ~/.git-credentials
git push origin main  # interactive prompt 에서 username + PAT 입력
```
첫 push 후 ~/.git-credentials 에 PAT 영구 저장. 다음 push 부터 자동 인증.

### 만료 시 처리 (90일마다)
1. GitHub Settings → Personal access tokens → fine-grained → 해당 토큰 → **Regenerate**
2. WSL: `rm ~/.git-credentials` → 다음 push 시 새 PAT 입력

### 회피 패턴
- workflow 파일 변경 없는 일반 push 는 PAT scope 무관 (Contents: Write 만 있어도 OK)
- workflow 파일 변경 push 만 본 정책 적용

### 관련 commit
- D-4l Chunk 2 (HEAD=694135a) push 시 1차 STOP → fine-grained PAT 발급 후 재 push 성공
- 본 정책은 GitHub 측 영구 정책 (회피 불가, 우회 불필요)
