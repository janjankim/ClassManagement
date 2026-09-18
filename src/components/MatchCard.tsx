import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { STATUS_LABEL } from "@/lib/status";
import type { Match } from "@/lib/types";
import { cn, formatMatchDate } from "@/lib/utils";

const BADGE_TONE = {
  scheduled: "scheduled",
  live: "live",
  completed: "completed",
} as const;

function TeamLabel({ name, isWinner, isLoser }: { name: string; isWinner: boolean; isLoser: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-base font-extrabold",
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
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          {formatMatchDate(match.date)} · {match.period}교시
        </span>
        <Badge tone={BADGE_TONE[match.status]}>{STATUS_LABEL[match.status]}</Badge>
      </div>
      <div className="flex items-center justify-center gap-3">
        <TeamLabel name={match.a} isWinner={match.winner === match.a} isLoser={Boolean(match.winner) && match.winner !== match.a} />
        <span className="text-sm font-semibold text-slate-400">
          {hasScore ? `${match.scoreA} : ${match.scoreB}` : "vs"}
        </span>
        <TeamLabel name={match.b} isWinner={match.winner === match.b} isLoser={Boolean(match.winner) && match.winner !== match.b} />
      </div>
      {match.winner ? (
        <p className="mt-2 text-center text-xs font-semibold text-brand-600">{match.winner} 승리</p>
      ) : null}
      {match.note ? <p className="mt-2 text-center text-xs text-slate-400">{match.note}</p> : null}
    </Card>
  );
}
