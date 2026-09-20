import type { Match } from "./types";

export interface TeamStanding {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  setPoints: number;
}

export function computeStandings(teams: string[], matches: Match[]): TeamStanding[] {
  const stats = new Map<string, Omit<TeamStanding, "rank" | "team">>(
    teams.map((team) => [team, { played: 0, wins: 0, draws: 0, losses: 0, setPoints: 0 }]),
  );

  matches
    .filter((match) => match.status === "completed" && match.scoreA !== null && match.scoreB !== null)
    .forEach((match) => {
      const statA = stats.get(match.a);
      const statB = stats.get(match.b);
      if (!statA || !statB) return;

      const scoreA = match.scoreA as number;
      const scoreB = match.scoreB as number;

      statA.played += 1;
      statB.played += 1;
      statA.setPoints += scoreA;
      statB.setPoints += scoreB;

      if (scoreA > scoreB) {
        statA.wins += 1;
        statB.losses += 1;
      } else if (scoreB > scoreA) {
        statB.wins += 1;
        statA.losses += 1;
      } else {
        statA.draws += 1;
        statB.draws += 1;
      }
    });

  const ranked = teams.map((team) => ({ team, ...stats.get(team)! }));

  ranked.sort((a, b) => b.wins - a.wins || b.setPoints - a.setPoints || a.team.localeCompare(b.team));

  return ranked.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
