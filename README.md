# 2026 배구 대회 경기 현황

## 접속 주소

| 구분 | 주소 |
|---|---|
| 학생용 | https://script.google.com/macros/s/AKfycbw4pnPi9DUvtTYng-wTg3hAARER9GJlU5Et8VFiiPFxczmpqoB8LBk08fSAEd1aVaw/exec |
| 교사(관리자)용 | https://script.google.com/macros/s/AKfycbw4pnPi9DUvtTYng-wTg3hAARER9GJlU5Et8VFiiPFxczmpqoB8LBk08fSAEd1aVaw/exec#/admin |

주소는 배포할 때마다 바뀌지 않는다. 배포 ID를 바꾸면 이 표, `.env.production`, `package.json`의 `deploy:gas`를 함께 고쳐야 한다.

학생용 대진 현황·경기 표·순위와 관리자용 경기 기록 화면을 제공하는 웹앱입니다. React로 화면을 만들고, Google Apps Script 하나로 API 서버 역할과 화면 호스팅을 모두 처리합니다. 데이터 저장소는 Google Sheets입니다. 별도의 프론트엔드 호스팅(Vercel 등)이나 서버가 필요 없습니다.

```text
학생/관리자 브라우저
        ↓
Google Apps Script Web App (/exec)
   ├─ 화면 요청(action 파라미터 없음) → 빌드된 React 앱(HTML) 반환
   └─ API 요청(action=bootstrap 등)  → Google Sheets 데이터 JSON 반환
        ↓
Google Sheets
```

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local`에 `VITE_GAS_API_URL`을 설정하지 않으면 브라우저 메모리에만 있는 샘플 데이터로 동작합니다(새로고침하면 초기화됩니다). 관리자 비밀번호는 로컬 샘플 모드에서 `600`입니다.

실제 Google Sheets 데이터로 로컬에서 개발하려면 `.env.local`을 만듭니다.

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/배포_ID/exec
```

## Google Sheets · Apps Script 최초 설정

1. 새 Google Sheets를 만든다.
2. `확장 프로그램 → Apps Script`를 연다.
3. 이 저장소를 clasp로 연결한다 (`npm run clasp:login` → `.clasp.json` 준비, 아래 "clasp로 Apps Script 관리" 참고).
4. `npm run clasp:push`로 [apps-script/Code.js](./apps-script/Code.js)를 업로드한다.
5. Apps Script 편집기에서 `setupDatabase` 함수를 한 번 실행한다 (관리자 비밀번호 초기값 `600`이 Script Properties에 저장됨).
6. 샘플 일정이 필요하면 `seedSampleMatches` 함수를 한 번 실행한다.
7. `npm run deploy:gas`로 화면(HTML)까지 포함해 웹 앱으로 배포한다 (아래 "배포" 참고).
8. 배포된 `.../exec` 주소가 학생·관리자가 접속하는 최종 URL이다.

## 배포 (화면 + API를 Apps Script 하나로)

```bash
npm run deploy:gas
```

이 명령은 순서대로 다음을 수행합니다.

1. `npm run build` — Vite가 React 앱을 **JS/CSS까지 전부 인라인된 단일 HTML 파일**(`dist/index.html`)로 빌드합니다 (`vite-plugin-singlefile`). Apps Script는 정적 파일을 여러 개 서빙하지 못하기 때문에 하나의 파일로 합칩니다.
2. 빌드 결과를 `apps-script/Index.html`로 복사합니다.
3. `clasp push`로 `apps-script/` 전체(Code.js, appsscript.json, Index.html)를 Apps Script 프로젝트에 업로드합니다.
4. `clasp deploy -i <배포ID>`로 **기존 배포를 새 버전으로 갱신**합니다. `-i`로 배포 ID를 고정했기 때문에 배포할 때마다 URL이 바뀌지 않습니다.

Apps Script의 `doGet`은 요청에 `action` 파라미터가 없으면 이 HTML 화면을 반환하고, `action=bootstrap` 등 API 요청이면 Google Sheets 데이터를 JSON으로 반환합니다. 프론트엔드는 [React Router의 HashRouter](./src/main.tsx)를 사용하므로 `.../exec#/table`처럼 화면 전환이 모두 클라이언트 쪽 해시 라우팅으로 처리되고 서버 라우팅이 필요 없습니다.

배포 ID를 바꾸고 싶다면(새 배포를 만들고 싶다면) `package.json`의 `deploy:gas` 스크립트와 이 문서의 배포 ID를 함께 갱신하세요.

## clasp로 Apps Script 관리

이 프로젝트는 `@google/clasp`를 개발 의존성으로 사용합니다. Google 계정에서 Apps Script API를 활성화한 뒤 로그인합니다.

```bash
npm run clasp:login
```

`.clasp.json.example`을 `.clasp.json`으로 복사하고 Apps Script 편집기 URL의 Script ID를 입력합니다. `.clasp.json`은 개인 설정이라 git에 커밋되지 않습니다.

```json
{
  "scriptId": "실제_SCRIPT_ID",
  "rootDir": "apps-script"
}
```

주요 명령:

```bash
npm run clasp:status
npm run clasp:push
npm run clasp:pull
npm run clasp:open
npm run clasp:deploy
```

`clasp push`는 원격 Apps Script 코드를 로컬 `apps-script` 내용으로 갱신하므로, 처음 연결할 때는 Script ID를 반드시 확인합니다.

## 빌드만 따로 하기

```bash
npm run build
```

빌드 결과(`dist/index.html`, 단일 파일)는 `dist` 폴더에 생성됩니다. Apps Script에 반영하려면 `npm run deploy:gas`를 사용하세요.
