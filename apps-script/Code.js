const SHEETS = {
  MATCHES: "matches",
  TEAMS: "teams",
  SETTINGS: "settings",
  LOGS: "logs"
};

const HEADERS = {
  matches: ["id", "date", "period", "teamA", "teamB", "scoreA", "scoreB", "winner", "status", "note", "updatedAt"],
  teams: ["id", "name", "color", "sortOrder"],
  settings: ["key", "value"],
  logs: ["timestamp", "action", "matchId", "detail"]
};

function setupDatabase() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Google Sheets에서 연결된 Apps Script로 실행해 주세요.");

  const properties = PropertiesService.getScriptProperties();
  properties.setProperty("SPREADSHEET_ID", spreadsheet.getId());
  if (!properties.getProperty("ADMIN_PASSWORD")) properties.setProperty("ADMIN_PASSWORD", "600");

  Object.keys(HEADERS).forEach(function (name) {
    ensureSheet_(spreadsheet, name, HEADERS[name]);
  });

  const teamsSheet = spreadsheet.getSheetByName(SHEETS.TEAMS);
  if (teamsSheet.getLastRow() === 1) {
    teamsSheet.getRange(2, 1, 5, 4).setValues([
      ["team-1", "1반", "#2F6FA5", 1],
      ["team-2", "2반", "#2F6FA5", 2],
      ["team-3", "3반", "#2F6FA5", 3],
      ["team-4", "4반", "#2F6FA5", 4],
      ["team-5", "5반", "#2F6FA5", 5]
    ]);
  }

  const settingsSheet = spreadsheet.getSheetByName(SHEETS.SETTINGS);
  if (settingsSheet.getLastRow() === 1) {
    settingsSheet.getRange(2, 1, 3, 2).setValues([
      ["tournamentName", "2026 배구 대회"],
      ["schoolGrade", "선학초 6학년"],
      ["year", "2026"]
    ]);
  }

  formatSheets_(spreadsheet);
  return "데이터베이스 설정이 완료되었습니다.";
}

function seedSampleMatches() {
  const sheet = getSpreadsheet_().getSheetByName(SHEETS.MATCHES);
  if (sheet.getLastRow() > 1) throw new Error("matches 시트에 데이터가 있어 샘플을 추가하지 않았습니다.");
  const now = new Date().toISOString();
  const rows = [
    ["match-1", "2026-09-15", 5, "1반", "2반", 0, 3, "2반", "completed", "", now],
    ["match-2", "2026-09-18", 1, "3반", "4반", 2, 0, "3반", "completed", "", now],
    ["match-3", "2026-09-18", 2, "5반", "1반", 2, 1, "5반", "completed", "", now],
    ["match-4", "2026-09-18", 3, "2반", "3반", 2, 1, "2반", "completed", "", now],
    ["match-5", "2026-09-18", 4, "4반", "5반", 1, 2, "5반", "completed", "", now],
    ["match-6", "2026-09-28", 6, "1반", "3반", "", "", "", "scheduled", "", now],
    ["match-7", "2026-09-29", 5, "2반", "4반", "", "", "", "scheduled", "", now],
    ["match-8", "2026-09-29", 1, "3반", "5반", "", "", "", "scheduled", "", now],
    ["match-9", "2026-10-02", 2, "1반", "4반", "", "", "", "scheduled", "", now],
    ["match-10", "2026-10-02", 3, "2반", "5반", "", "", "", "scheduled", "", now]
  ];
  sheet.getRange(2, 1, rows.length, HEADERS.matches.length).setValues(rows);
  return rows.length + "개 샘플 경기를 추가했습니다.";
}

function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (!action) {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("2026 배구 대회 경기 현황")
      .addMetaTag("viewport", "width=device-width, initial-scale=1")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  try {
    if (action !== "bootstrap") throw new Error("지원하지 않는 조회 요청입니다.");
    return json_({ ok: true, data: getBootstrapData_() });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    let data;

    if (body.action === "login") {
      data = login_(body.password);
    } else {
      requireAdmin_(body.token);
      if (body.action === "createMatch") data = createMatch_(body.match);
      else if (body.action === "updateMatch") data = updateMatch_(body.match);
      else if (body.action === "deleteMatch") data = deleteMatch_(body.id);
      else throw new Error("지원하지 않는 변경 요청입니다.");
    }

    return json_({ ok: true, data: data });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  }
}

function getBootstrapData_() {
  const spreadsheet = getSpreadsheet_();
  const matches = readObjects_(spreadsheet.getSheetByName(SHEETS.MATCHES)).map(normalizeMatch_);
  const teams = readObjects_(spreadsheet.getSheetByName(SHEETS.TEAMS))
    .sort(function (a, b) { return Number(a.sortOrder) - Number(b.sortOrder); })
    .map(function (team) { return team.name; });
  const settingsRows = readObjects_(spreadsheet.getSheetByName(SHEETS.SETTINGS));
  const settings = {};
  settingsRows.forEach(function (row) { settings[row.key] = row.value; });

  matches.sort(function (a, b) {
    return (a.date + String(a.period).padStart(2, "0")).localeCompare(b.date + String(b.period).padStart(2, "0"));
  });

  return {
    matches: matches,
    teams: teams,
    tournament: settings,
    updatedAt: matches.reduce(function (latest, match) { return match.updatedAt > latest ? match.updatedAt : latest; }, "")
  };
}

function login_(password) {
  const expected = PropertiesService.getScriptProperties().getProperty("ADMIN_PASSWORD");
  if (!expected || String(password) !== expected) throw new Error("비밀번호가 올바르지 않습니다.");
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put("admin:" + token, "1", 21600);
  return { token: token, expiresIn: 21600 };
}

function createMatch_(input) {
  const match = validateMatch_(input, false);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(SHEETS.MATCHES);
    match.id = "match-" + Utilities.getUuid();
    match.updatedAt = new Date().toISOString();
    sheet.appendRow(matchToRow_(match));
    appendLog_("create", match.id, match.a + " vs " + match.b);
    return normalizeMatch_(match);
  } finally {
    lock.releaseLock();
  }
}

function updateMatch_(input) {
  const match = validateMatch_(input, true);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(SHEETS.MATCHES);
    const row = findMatchRow_(sheet, match.id);
    match.updatedAt = new Date().toISOString();
    sheet.getRange(row, 1, 1, HEADERS.matches.length).setValues([matchToRow_(match)]);
    appendLog_("update", match.id, match.a + " vs " + match.b);
    return normalizeMatch_(match);
  } finally {
    lock.releaseLock();
  }
}

function deleteMatch_(id) {
  if (!id) throw new Error("삭제할 경기 ID가 없습니다.");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSpreadsheet_().getSheetByName(SHEETS.MATCHES);
    const row = findMatchRow_(sheet, id);
    sheet.deleteRow(row);
    appendLog_("delete", id, "");
    return { id: id };
  } finally {
    lock.releaseLock();
  }
}

function validateMatch_(input, requireId) {
  if (!input) throw new Error("경기 정보가 없습니다.");
  if (requireId && !input.id) throw new Error("경기 ID가 없습니다.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.date || ""))) throw new Error("날짜 형식을 확인해 주세요.");
  const period = Number(input.period);
  if (!Number.isInteger(period) || period < 1 || period > 8) throw new Error("교시는 1~8 사이여야 합니다.");
  if (!input.a || !input.b || input.a === input.b) throw new Error("서로 다른 두 반을 선택해 주세요.");

  const scoreA = input.scoreA === null || input.scoreA === "" ? null : Number(input.scoreA);
  const scoreB = input.scoreB === null || input.scoreB === "" ? null : Number(input.scoreB);
  if ((scoreA === null) !== (scoreB === null)) throw new Error("양 팀 점수를 모두 입력해 주세요.");
  if ((scoreA !== null && (!Number.isInteger(scoreA) || scoreA < 0)) || (scoreB !== null && (!Number.isInteger(scoreB) || scoreB < 0))) {
    throw new Error("점수는 0 이상의 정수여야 합니다.");
  }

  return {
    id: input.id || "",
    date: String(input.date),
    period: period,
    a: String(input.a),
    b: String(input.b),
    scoreA: scoreA,
    scoreB: scoreB,
    winner: scoreA === null || scoreA === scoreB ? "" : scoreA > scoreB ? String(input.a) : String(input.b),
    status: scoreA === null ? "scheduled" : "completed",
    note: String(input.note || ""),
    updatedAt: input.updatedAt || ""
  };
}

function normalizeMatch_(row) {
  return {
    id: String(row.id),
    date: formatDate_(row.date),
    period: Number(row.period),
    a: String(row.a || row.teamA),
    b: String(row.b || row.teamB),
    scoreA: row.scoreA === "" || row.scoreA === null ? null : Number(row.scoreA),
    scoreB: row.scoreB === "" || row.scoreB === null ? null : Number(row.scoreB),
    winner: String(row.winner || ""),
    status: String(row.status || "scheduled"),
    note: String(row.note || ""),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || "")
  };
}

function matchToRow_(match) {
  return [match.id, match.date, match.period, match.a, match.b, match.scoreA === null ? "" : match.scoreA, match.scoreB === null ? "" : match.scoreB, match.winner, match.status, match.note, match.updatedAt];
}

function requireAdmin_(token) {
  if (!token || CacheService.getScriptCache().get("admin:" + token) !== "1") {
    throw new Error("관리자 인증이 만료되었습니다. 다시 로그인해 주세요.");
  }
}

function readObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.filter(function (row) { return row.some(function (cell) { return cell !== ""; }); }).map(function (row) {
    const object = {};
    headers.forEach(function (header, index) { object[header] = row[index]; });
    return object;
  });
}

function findMatchRow_(sheet, id) {
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (let index = 0; index < ids.length; index += 1) {
    if (String(ids[index][0]) === String(id)) return index + 2;
  }
  throw new Error("경기를 찾을 수 없습니다.");
}

function appendLog_(action, matchId, detail) {
  getSpreadsheet_().getSheetByName(SHEETS.LOGS).appendRow([new Date(), action, matchId, detail]);
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function formatSheets_(spreadsheet) {
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = spreadsheet.getSheetByName(name);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS[name].length).setBackground("#163B66").setFontColor("#FFFFFF").setFontWeight("bold");
    sheet.autoResizeColumns(1, HEADERS[name].length);
  });
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("setupDatabase 함수를 먼저 실행해 주세요.");
  return SpreadsheetApp.openById(id);
}

function formatDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, "Asia/Seoul", "yyyy-MM-dd");
  return String(value || "").slice(0, 10);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
