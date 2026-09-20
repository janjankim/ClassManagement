import type { Match } from "./types";

export interface HeadToHeadEntry {
  opponent: string;
  result: "win" | "loss" | "draw" | "none";
  scores: string[];
}

export interface TeamStanding {
  rank: number;
  team: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  setPoints: number;
  headToHead: HeadToHeadEntry[] | null;
}

export function computeStandings(teams: string[], matches: Match[]): TeamStanding[] {
  const completed = matches.filter(
    (match) => match.status === "completed" && match.scoreA !== null && match.scoreB !== null,
  );

  const stats = new Map<string, Omit<TeamStanding, "rank" | "team" | "headToHead">>(
    teams.map((team) => [team, { played: 0, wins: 0, draws: 0, losses: 0, setPoints: 0 }]),
  );

  completed.forEach((match) => {
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

  function headToHead(team: string, opponent: string): HeadToHeadEntry {
    const games = completed.filter(
      (match) => (match.a === team && match.b === opponent) || (match.a === opponent && match.b === team),
    );
    let wins = 0;
    let losses = 0;
    const scores = games.map((match) => {
      const mine = (match.a === team ? match.scoreA : match.scoreB) as number;
      const theirs = (match.a === team ? match.scoreB : match.scoreA) as number;
      if (mine > theirs) wins += 1;
      else if (theirs > mine) losses += 1;
      return `${mine}:${theirs}`;
    });
    const result = games.length === 0 ? "none" : wins > losses ? "win" : losses > wins ? "loss" : "draw";
    return { opponent, result, scores };
  }

  const ranked = teams.map((team) => ({ team, ...stats.get(team)!, headToHead: null as HeadToHeadEntry[] | null }));
  ranked.sort((a, b) => b.wins - a.wins || b.setPoints - a.setPoints || a.team.localeCompare(b.team));

  const headToHeadWins = (entry: (typeof ranked)[number]) =>
    entry.headToHead?.filter((item) => item.result === "win").length ?? 0;

  const ordered: typeof ranked = [];
  for (let start = 0; start < ranked.length; ) {
    let end = start + 1;
    while (
      end < ranked.length &&
      ranked[end].wins === ranked[start].wins &&
      ranked[end].setPoints === ranked[start].setPoints
    ) {
      end += 1;
    }

    const group = ranked.slice(start, end);
    const contested = group.filter((entry) => entry.played > 0);
    if (contested.length > 1) {
      contested.forEach((entry) => {
        entry.headToHead = contested
          .filter((other) => other !== entry)
          .map((other) => headToHead(entry.team, other.team));
      });
      group.sort((a, b) => headToHeadWins(b) - headToHeadWins(a) || a.team.localeCompare(b.team));
    }

    ordered.push(...group);
    start = end;
  }

  return ordered.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
