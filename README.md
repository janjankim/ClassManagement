# 2026 배구 대회 경기 현황

학생용 대진 현황·경기 표와 관리자용 경기 기록 화면을 제공하는 React 웹앱입니다. Google Apps Script를 API로, Google Sheets를 데이터 저장소로 사용합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

Google API 연결 전에는 샘플 데이터로 실행됩니다. 관리자 비밀번호는 `600`입니다.

## Google Sheets API 연결

1. 새 Google Sheets를 만든다.
2. `확장 프로그램 → Apps Script`를 연다.
3. [apps-script/Code.gs](./apps-script/Code.gs)를 Apps Script의 `Code.gs`에 붙여 넣는다.
4. `setupDatabase` 함수를 한 번 실행한다.
5. 샘플 일정이 필요하면 `seedSampleMatches` 함수를 한 번 실행한다.
6. Apps Script를 웹 앱으로 배포한다.
7. 프로젝트 루트에 `.env.local` 파일을 만든다.

```env
VITE_GAS_API_URL=https://script.google.com/macros/s/배포_ID/exec
```

8. 개발 서버를 다시 실행한다.

자세한 배포 과정은 [Apps Script 연결 안내](./apps-script/README.md)를 참고합니다.

## clasp로 Apps Script 관리

이 프로젝트는 `@google/clasp`를 개발 의존성으로 사용합니다. Google 계정에서 Apps Script API를 활성화한 뒤 로그인합니다.

```bash
npm run clasp:login
```

`.clasp.json.example`을 `.clasp.json`으로 복사하고 Apps Script 편집기 URL의 Script ID를 입력합니다.

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

## 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다.
