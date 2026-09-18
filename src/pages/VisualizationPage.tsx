import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BracketView } from "@/components/BracketView";
import { MatchCard } from "@/components/MatchCard";
import { NavTabs } from "@/components/NavTabs";
import { useBootstrap } from "@/hooks/useBootstrap";

export function VisualizationPage() {
  const { data, isLoading, isError } = useBootstrap();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const matches = data?.matches ?? [];
  const teams = data?.teams ?? [];

  const visibleMatches = useMemo(() => {
    const sorted = [...matches].sort((a, b) =>
      `${a.date}${String(a.period).padStart(2, "0")}`.localeCompare(`${b.date}${String(b.period).padStart(2, "0")}`),
    );
    if (!selectedTeam) return sorted;
    return sorted.filter((match) => match.a === selectedTeam || match.b === selectedTeam);
  }, [matches, selectedTeam]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <AppHeader tournament={data?.tournament ?? {}} updatedAt={data?.updatedAt ?? ""} />
      <NavTabs />

      {isLoading ? <p className="py-12 text-center text-slate-400">불러오는 중...</p> : null}
      {isError ? <p className="py-12 text-center text-red-500">경기 정보를 불러오지 못했습니다.</p> : null}

      {!isLoading && !isError ? (
        <>
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <BracketView
              teams={teams}
              matches={matches}
              selectedTeam={selectedTeam}
              onSelectTeam={setSelectedTeam}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
          {visibleMatches.length === 0 ? (
            <p className="py-8 text-center text-slate-400">표시할 경기가 없습니다.</p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
