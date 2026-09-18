import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { STATUS_LABEL } from "@/lib/status";
import type { Match } from "@/lib/types";
import { formatMatchDate } from "@/lib/utils";

interface AdminMatchListProps {
  matches: Match[];
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
  isDeleting: boolean;
}

export function AdminMatchList({ matches, onEdit, onDelete, isDeleting }: AdminMatchListProps) {
  const sorted = [...matches].sort((a, b) =>
    `${a.date}${String(a.period).padStart(2, "0")}`.localeCompare(`${b.date}${String(b.period).padStart(2, "0")}`),
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-brand-800 text-left text-white">
            <th className="px-4 py-3 font-semibold">날짜</th>
            <th className="px-4 py-3 font-semibold">교시</th>
            <th className="px-4 py-3 font-semibold">대진</th>
            <th className="px-4 py-3 font-semibold">결과</th>
            <th className="px-4 py-3 font-semibold">상태</th>
            <th className="px-4 py-3 font-semibold">관리</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((match) => {
            const hasScore = match.scoreA !== null && match.scoreB !== null;
            return (
              <tr key={match.id} className="border-b border-slate-100 last:border-none">
                <td className="px-4 py-3 text-slate-600">{formatMatchDate(match.date)}</td>
                <td className="px-4 py-3 text-slate-600">{match.period}교시</td>
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {match.a} vs {match.b}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {hasScore ? `${match.scoreA} : ${match.scoreB}` : "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={match.status}>{STATUS_LABEL[match.status]}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => onEdit(match)}>
                      수정
                    </Button>
                    <Button
                      variant="danger"
                      className="px-3 py-1 text-xs"
                      disabled={isDeleting}
                      onClick={() => onDelete(match)}
                    >
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 ? <p className="py-8 text-center text-slate-400">등록된 경기가 없습니다.</p> : null}
    </div>
  );
}
