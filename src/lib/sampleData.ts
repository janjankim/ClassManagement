import type { BootstrapData, Match } from "./types";

export const SAMPLE_TEAMS = ["1반", "2반", "3반", "4반", "5반"];

const now = new Date().toISOString();

export const SAMPLE_MATCHES: Match[] = [
  { id: "match-1", date: "2026-09-15", period: 5, a: "1반", b: "2반", scoreA: 0, scoreB: 3, winner: "2반", status: "completed", note: "", updatedAt: now },
  { id: "match-2", date: "2026-09-18", period: 1, a: "3반", b: "4반", scoreA: 2, scoreB: 0, winner: "3반", status: "completed", note: "", updatedAt: now },
  { id: "match-3", date: "2026-09-18", period: 2, a: "5반", b: "1반", scoreA: 2, scoreB: 1, winner: "5반", status: "completed", note: "", updatedAt: now },
  { id: "match-4", date: "2026-09-18", period: 3, a: "2반", b: "3반", scoreA: 2, scoreB: 1, winner: "2반", status: "completed", note: "", updatedAt: now },
  { id: "match-5", date: "2026-09-18", period: 4, a: "4반", b: "5반", scoreA: 1, scoreB: 2, winner: "5반", status: "completed", note: "", updatedAt: now },
  { id: "match-6", date: "2026-09-28", period: 6, a: "1반", b: "3반", scoreA: null, scoreB: null, winner: "", status: "scheduled", note: "", updatedAt: now },
  { id: "match-7", date: "2026-09-29", period: 5, a: "2반", b: "4반", scoreA: null, scoreB: null, winner: "", status: "scheduled", note: "", updatedAt: now },
  { id: "match-8", date: "2026-09-29", period: 1, a: "3반", b: "5반", scoreA: null, scoreB: null, winner: "", status: "scheduled", note: "", updatedAt: now },
  { id: "match-9", date: "2026-10-02", period: 2, a: "1반", b: "4반", scoreA: null, scoreB: null, winner: "", status: "scheduled", note: "", updatedAt: now },
  { id: "match-10", date: "2026-10-02", period: 3, a: "2반", b: "5반", scoreA: null, scoreB: null, winner: "", status: "scheduled", note: "", updatedAt: now },
];

export function buildSampleBootstrap(matches: Match[]): BootstrapData {
  return {
    matches,
    teams: SAMPLE_TEAMS,
    tournament: {
      tournamentName: "2026 배구 대회",
      schoolGrade: "선학초 6학년",
      year: "2026",
    },
    updatedAt: matches.reduce((latest, match) => (match.updatedAt > latest ? match.updatedAt : latest), ""),
  };
}
