import type { TournamentSettings } from "@/lib/types";

interface AppHeaderProps {
  tournament: TournamentSettings;
}

export function AppHeader({ tournament }: AppHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-1 py-6 text-center">
      <p className="text-sm font-semibold text-brand-600">{tournament.schoolGrade ?? ""}</p>
      <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
        {tournament.tournamentName ?? "배구 대회 경기 현황"}
      </h1>
    </header>
  );
}
