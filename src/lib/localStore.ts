import { SAMPLE_MATCHES, buildSampleBootstrap } from "./sampleData";
import type { BootstrapData, Match, MatchInput } from "./types";

const LOCAL_ADMIN_PASSWORD = "600";

let matches: Match[] = SAMPLE_MATCHES.map((match) => ({ ...match }));

function validate(input: MatchInput, requireId: boolean): Omit<Match, "id" | "updatedAt"> & { id: string } {
  if (requireId && !input.id) throw new Error("경기 ID가 없습니다.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("날짜 형식을 확인해 주세요.");
  if (!Number.isInteger(input.period) || input.period < 1 || input.period > 8) {
    throw new Error("교시는 1~8 사이여야 합니다.");
  }
  if (!input.a || !input.b || input.a === input.b) throw new Error("서로 다른 두 반을 선택해 주세요.");

  const scoreA = input.scoreA === null ? null : Number(input.scoreA);
  const scoreB = input.scoreB === null ? null : Number(input.scoreB);
  if ((scoreA === null) !== (scoreB === null)) throw new Error("양 팀 점수를 모두 입력해 주세요.");
  if (
    (scoreA !== null && (!Number.isInteger(scoreA) || scoreA < 0)) ||
    (scoreB !== null && (!Number.isInteger(scoreB) || scoreB < 0))
  ) {
    throw new Error("점수는 0 이상의 정수여야 합니다.");
  }

  return {
    id: input.id || "",
    date: input.date,
    period: input.period,
    a: input.a,
    b: input.b,
    scoreA,
    scoreB,
    winner: scoreA === null || scoreB === null || scoreA === scoreB ? "" : scoreA > scoreB ? input.a : input.b,
    status: scoreA === null ? "scheduled" : "completed",
    note: input.note ?? "",
  };
}

export async function localBootstrap(): Promise<BootstrapData> {
  return buildSampleBootstrap(matches);
}

export async function localLogin(password: string): Promise<{ token: string; expiresIn: number }> {
  if (password !== LOCAL_ADMIN_PASSWORD) throw new Error("비밀번호가 올바르지 않습니다.");
  return { token: "local-token", expiresIn: 21600 };
}

export async function localCreateMatch(input: MatchInput): Promise<Match> {
  const validated = validate(input, false);
  const match: Match = { ...validated, id: `match-${crypto.randomUUID()}`, updatedAt: new Date().toISOString() };
  matches = [...matches, match];
  return match;
}

export async function localUpdateMatch(input: MatchInput): Promise<Match> {
  const validated = validate(input, true);
  const index = matches.findIndex((item) => item.id === input.id);
  if (index === -1) throw new Error("경기를 찾을 수 없습니다.");
  const match: Match = { ...validated, id: input.id!, updatedAt: new Date().toISOString() };
  matches = matches.map((item, i) => (i === index ? match : item));
  return match;
}

export async function localDeleteMatch(id: string): Promise<{ id: string }> {
  if (!matches.some((item) => item.id === id)) throw new Error("경기를 찾을 수 없습니다.");
  matches = matches.filter((item) => item.id !== id);
  return { id };
}
