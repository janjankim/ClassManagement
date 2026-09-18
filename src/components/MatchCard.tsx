import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { STATUS_LABEL } from "@/lib/status";
import type { Match } from "@/lib/types";
import { formatMatchDate } from "@/lib/utils";

const BADGE_TONE = {
  scheduled: "scheduled",
  live: "live",
  completed: "completed",
} as const;

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
      <div className="flex items-center justify-center gap-3 text-lg font-bold">
        <span className={match.winner === match.a ? "text-brand-700" : "text-slate-700"}>{match.a}</span>
        <span className="text-slate-400">
          {hasScore ? `${match.scoreA} : ${match.scoreB}` : "vs"}
        </span>
        <span className={match.winner === match.b ? "text-brand-700" : "text-slate-700"}>{match.b}</span>
      </div>
      {match.winner ? (
        <p className="mt-2 text-center text-xs font-semibold text-brand-600">{match.winner} 승리</p>
      ) : null}
      {match.note ? <p className="mt-2 text-center text-xs text-slate-400">{match.note}</p> : null}
    </Card>
  );
}
