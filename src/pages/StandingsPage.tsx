import { useMemo } from "react";
import { AppHeader } from "@/components/AppHeader";
import { HeadToHeadMark } from "@/components/HeadToHeadMark";
import { NavTabs } from "@/components/NavTabs";
import { useBootstrap } from "@/hooks/useBootstrap";
import { computeStandings } from "@/lib/standings";
import { cn } from "@/lib/utils";

export function StandingsPage() {
  const { data, isLoading, isError } = useBootstrap();
  const standings = useMemo(
    () => computeStandings(data?.teams ?? [], data?.matches ?? []),
    [data?.teams, data?.matches],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <AppHeader tournament={data?.tournament ?? {}} />
      <NavTabs />

      {isLoading ? <p className="py-12 text-center text-slate-400">불러오는 중...</p> : null}
      {isError ? <p className="py-12 text-center text-red-500">경기 정보를 불러오지 못했습니다.</p> : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-center text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-brand-800 text-white">
                <th className="px-4 py-3 font-semibold">순위</th>
                <th className="px-4 py-3 font-semibold">반</th>
                <th className="px-4 py-3 font-semibold">경기</th>
                <th className="px-4 py-3 font-semibold">승</th>
                <th className="px-4 py-3 font-semibold">무</th>
                <th className="px-4 py-3 font-semibold">패</th>
                <th className="px-4 py-3 font-semibold">세트 득점</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((entry) => (
                <tr
                  key={entry.team}
                  className={cn(
                    "border-b border-slate-100 last:border-none",
                    entry.rank === 1 && entry.played > 0 ? "bg-brand-50" : undefined,
                  )}
                >
                  <td className="px-4 py-3 font-bold text-brand-700">{entry.rank}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{entry.team}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.played}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.wins}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.draws}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.losses}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <span className="relative inline-block">
                      {entry.setPoints}
                      {entry.headToHead ? <HeadToHeadMark team={entry.team} entries={entry.headToHead} /> : null}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-1 px-4 py-3 text-xs text-slate-400">
            <p>순위 기준: 승 수 → 세트 득점 → 승자승 순. 세트를 이기면 1점이며, 세트를 져도 감점은 없습니다(경기당 최대 3점).</p>
            <p>
              <span className="font-extrabold text-amber-500">*</span> 승 수와 세트 득점이 같아 승자승으로 순위를 정한 반이에요. 표시에 마우스를 올리면 결과를 볼 수 있어요.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
