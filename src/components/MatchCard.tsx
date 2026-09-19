import { Card } from "@/components/ui/Card";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

function TeamLabel({ name, isWinner, isLoser }: { name: string; isWinner: boolean; isLoser: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-lg font-extrabold",
        isWinner && "bg-brand-100 text-brand-700",
        isLoser && "text-slate-400",
        !isWinner && !isLoser && "text-slate-800",
      )}
    >
      {name}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const hasScore = match.scoreA !== null && match.scoreB !== null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-center gap-4">
        <TeamLabel name={match.a} isWinner={match.winner === match.a} isLoser={Boolean(match.winner) && match.winner !== match.a} />
        <span className="text-xl font-extrabold text-slate-300">
          {hasScore ? `${match.scoreA} : ${match.scoreB}` : "vs"}
        </span>
        <TeamLabel name={match.b} isWinner={match.winner === match.b} isLoser={Boolean(match.winner) && match.winner !== match.b} />
      </div>
      {match.winner ? (
        <p className="mt-3 text-center text-sm font-bold text-brand-600">{match.winner} 승리</p>
      ) : (
        <p className="mt-3 text-center text-sm font-semibold text-slate-400">경기 예정</p>
      )}
      {match.note ? <p className="mt-2 text-center text-xs text-slate-400">{match.note}</p> : null}
    </Card>
  );
}
