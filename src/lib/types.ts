export type MatchStatus = "scheduled" | "live" | "completed";

export interface Match {
  id: string;
  date: string;
  period: number;
  a: string;
  b: string;
  scoreA: number | null;
  scoreB: number | null;
  winner: string;
  status: MatchStatus;
  note: string;
  updatedAt: string;
}

export interface MatchInput {
  id?: string;
  date: string;
  period: number;
  a: string;
  b: string;
  scoreA: number | null;
  scoreB: number | null;
  note?: string;
}

export interface TournamentSettings {
  tournamentName?: string;
  schoolGrade?: string;
  year?: string;
}

export interface BootstrapData {
  matches: Match[];
  teams: string[];
  tournament: TournamentSettings;
  updatedAt: string;
}
