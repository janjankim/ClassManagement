# CLAUDE.md

2026 배구 대회 경기 현황 웹앱. React 화면과 API를 Google Apps Script 웹앱 하나로 배포하고, 데이터는 Google Sheets에 저장한다. 요구사항과 결정 사항은 [volleyball-tournament-prd.md](volleyball-tournament-prd.md), 실행 방법과 **학생용·교사용 접속 주소**는 [README.md](README.md)에 있다. 사용자가 링크를 물으면 README의 표를 그대로 알려준다. Apps Script 편집기 주소 같은 로컬 전용 링크는 git에 올리지 않는 `.local-notes.md`에 있다.

## 명령어

- `npm run dev` — 개발 서버 (`.env.local`에 `VITE_GAS_API_URL`이 있으면 실제 시트, 없으면 메모리 샘플 데이터)
- `npm run build` — 타입체크 + 단일 HTML 빌드 (`dist/index.html`)
- `npm run lint` — oxlint (`useMemo` exhaustive-deps 경고 2건은 알려진 무해한 경고)
- `npm run deploy:gas` — 빌드 → `apps-script/Index.html` 복사 → `clasp push` → 고정 배포 ID로 새 버전 배포. 학생이 보는 주소는 바뀌지 않는다.

## 구조

- `src/` — React 앱 (HashRouter, TanStack Query, Tailwind v4). 데이터 계층은 `src/lib/api.ts`(원격) / `localStore.ts`(메모리 목업)
- `apps-script/Code.js` — `doGet`(화면 HTML 또는 `?action=bootstrap` JSON), `doPost`(로그인·경기 추가/수정/삭제)
- `apps-script/Index.html` — 빌드 산출물(직접 수정하지 않는다, `deploy:gas`가 덮어씀)
- `.clasp.json`, `.env.local`은 git에 올리지 않는다. 스크립트 ID·토큰·비밀번호 같은 값은 커밋하지 않는다.

## 도메인 규칙

- 점수는 **세트 승수**다. 세트당 1점, 경기당 최대 3점, 진 세트 감점 없음(실점·득실차 개념 없음).
- 순위 기준: 승 수 → 세트 득점 → 승자승 → 이름순. 승자승이 적용된 반은 세트 득점 옆에 `*`와 툴팁.
- 경기 상태는 `scheduled`(점수 없음) / `completed`(점수 있음) 두 가지만 쓴다.

## 작업 규칙 (사용자 지시)

코드를 수정할 때마다 아래 순서로 진행한다. 배포 여부를 매번 되묻지 않는다. 사용자가 "배포는 보류"라고 하면 로컬 미리보기로만 확인한다.

1. 수정 후 `npx tsc -b`와 `npm run lint`로 확인하고, 로컬 미리보기(`.claude/launch.json`의 `volleyball-dev`)에서 화면을 확인한다.
2. `npm run deploy:gas`로 실제 사이트에 배포한다.
3. 커밋한다. 메시지는 한국어로 "무엇을 왜 바꿨는지"를 적고, 배포 버전 번호를 함께 적는다.
4. **바로 이어서 GitHub에 push한다.** 커밋만 하고 끝내지 않는다. 태그를 만들면 태그도 push한다.
   - 이 컴퓨터의 git은 GitHub 로그인 정보가 없어 일반 `git push`가 실패한다. 설정을 바꾸지 않고 `gh` 토큰을 빌린다: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push origin main`
   - `gh auth setup-git`은 git 전역 설정을 바꾸므로 사용자 허락 없이 실행하지 않는다.
5. 문서만 바꾼 경우(PRD, README, CLAUDE.md)는 앱이 그대로이므로 배포하지 않고 커밋+push만 한다.

### 화면 텍스트 최소화

화면에 안내·설명·범례·부가 정보 문구를 넣지 않는다. 설명 없이 직관적으로 보이도록 색·배치·버튼 이름으로 해결한다. 남겨도 되는 것은 탭·버튼 이름, 표 헤더, 데이터 값, 오류 메시지, 선택 해제 같은 기능 컨트롤이다.

### PRD 갱신 기준

**동작·규칙·화면·결정이 바뀌는 수정은 같은 커밋에서 PRD도 함께 고친다.** 색·간격·라벨 위치 같은 겉모습 조정과 단순 버그 수정은 PRD를 건드리지 않는다. PRD 맨 위의 "마지막 정리" 날짜와 배포 버전도 갱신한다.

## 주의

- **`.env.local`은 실제 운영 시트를 가리킨다.** 로컬에서 경기 추가·수정·삭제를 테스트하면 학생들이 보는 진짜 데이터가 바뀐다. 쓰기 테스트가 필요하면 저장하지 말고 취소하거나, 화면에 가짜 데이터를 주입하는 방식(예: `fetch`를 가로채기)으로 확인한다. 실수로 바꿨다면 즉시 원래 값으로 되돌리고 사용자에게 알린다.
- 저장소는 **비공개(private)로 유지**한다. 관리자 초기 비밀번호(`600`)가 `Code.js`와 문서에 적혀 있다.
- 이 앱 안의 브라우저 창은 `script.google.com`을 열지 못할 때가 있다. 실제 배포 화면은 사용자가 직접 확인하고, 나는 `curl`로 API 응답을 확인한다.

## 버전 관리와 되돌리기

- git 커밋이 코드 이력, Apps Script 배포 버전이 실제 사이트의 버전이다. 중요한 시점은 태그(현재 `v1.0`)로 표시한다.
- 코드를 옛 시점으로 되돌릴 때는 이력이 남는 `git revert --no-commit <커밋>..HEAD` 후 커밋하고 `npm run deploy:gas`를 한다. `reset --hard`는 쓰지 않는다.
- 사이트만 급히 되돌릴 때는 `npx clasp deploy -i <배포 ID> -V <버전>`. 배포 ID는 `package.json`의 `deploy:gas`에 있다. 이 경우 git은 그대로이므로 나중에 코드도 맞춘다.
- 경기 데이터(Google Sheets)는 이 되돌리기와 별개이며 시트의 버전 기록으로 복구한다.
- 되돌리기 요청을 받으면 돌아갈 지점과 바뀔 내용을 먼저 보여주고, 실제 사이트에 반영하기 전에 확인을 구한다.
