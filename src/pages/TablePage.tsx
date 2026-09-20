import { useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NavTabs } from "@/components/NavTabs";
import { Badge } from "@/components/ui/Badge";
import { useBootstrap } from "@/hooks/useBootstrap";
import { STATUS_LABEL } from "@/lib/status";
import { formatMatchDate } from "@/lib/utils";

export function TablePage() {
  const { data, isLoading, isError } = useBootstrap();
  const matches = data?.matches ?? [];

  const sorted = useMemo(
    () =>
      [...matches].sort((a, b) =>
        `${a.date}${String(a.period).padStart(2, "0")}`.localeCompare(`${b.date}${String(b.period).padStart(2, "0")}`),
      ),
    [matches],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <AppHeader tournament={data?.tournament ?? {}} />
      <NavTabs />

      {isLoading ? <p className="py-12 text-center text-slate-400">불러오는 중...</p> : null}
      {isError ? <p className="py-12 text-center text-red-500">경기 정보를 불러오지 못했습니다.</p> : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-brand-800 text-left text-white">
                <th className="px-4 py-3 font-semibold">날짜</th>
                <th className="px-4 py-3 font-semibold">교시</th>
                <th className="px-4 py-3 font-semibold">대진</th>
                <th className="px-4 py-3 font-semibold">결과</th>
                <th className="px-4 py-3 font-semibold">승리</th>
                <th className="px-4 py-3 font-semibold">상태</th>
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
                    <td className="px-4 py-3 font-semibold text-brand-700">{match.winner || "미정"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={match.status}>{STATUS_LABEL[match.status]}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 ? <p className="py-8 text-center text-slate-400">등록된 경기가 없습니다.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
