import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Match, MatchInput } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MatchFormProps {
  teams: string[];
  initial?: Match | null;
  onSubmit: (input: MatchInput) => Promise<void>;
  onCancel: () => void;
}

type SetWinner = "a" | "b" | null;

function buildInitialSets(scoreA: number | null, scoreB: number | null): SetWinner[] {
  const sets: SetWinner[] = [null, null, null];
  let index = 0;
  for (let i = 0; i < (scoreA ?? 0) && index < 3; i += 1) sets[index++] = "a";
  for (let i = 0; i < (scoreB ?? 0) && index < 3; i += 1) sets[index++] = "b";
  return sets;
}

export function MatchForm({ teams, initial, onSubmit, onCancel }: MatchFormProps) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [period, setPeriod] = useState(initial ? String(initial.period) : "");
  const [teamA, setTeamA] = useState(initial?.a ?? teams[0] ?? "");
  const [teamB, setTeamB] = useState(initial?.b ?? teams[1] ?? "");
  const [sets, setSets] = useState<SetWinner[]>(() => buildInitialSets(initial?.scoreA ?? null, initial?.scoreB ?? null));
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scoreA = sets.filter((winner) => winner === "a").length;
  const scoreB = sets.filter((winner) => winner === "b").length;
  const decidedSets = scoreA + scoreB;

  function toggleSet(index: number, side: "a" | "b") {
    setSets((prev) => prev.map((winner, i) => (i === index ? (winner === side ? null : side) : winner)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: initial?.id,
        date,
        period: Number(period),
        a: teamA,
        b: teamB,
        scoreA: decidedSets === 0 ? null : scoreA,
        scoreB: decidedSets === 0 ? null : scoreB,
        note,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-bold text-brand-900">{initial ? "경기 수정" : "경기 추가"}</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          날짜
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          교시
          <input
            type="number"
            min={1}
            max={8}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          팀 A
          <select
            value={teamA}
            onChange={(event) => setTeamA(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          팀 B
          <select
            value={teamB}
            onChange={(event) => setTeamB(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-2 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500">세트 결과 (이긴 팀을 선택하세요)</span>
          {sets.map((winner, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-xs font-semibold text-slate-400">{index + 1}세트</span>
              <button
                type="button"
                onClick={() => toggleSet(index, "a")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  winner === "a"
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 text-slate-600 hover:bg-brand-50",
                )}
              >
                {teamA}
              </button>
              <button
                type="button"
                onClick={() => toggleSet(index, "b")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
                  winner === "b"
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-slate-300 text-slate-600 hover:bg-brand-50",
                )}
              >
                {teamB}
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-400">
            {decidedSets === 0 ? "세트를 선택하지 않으면 예정 경기로 저장돼요." : `현재 스코어 ${scoreA} : ${scoreB}`}
          </p>
        </div>
        <label className="col-span-2 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          메모 (선택)
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        {error ? <p className="col-span-2 text-xs text-red-500">{error}</p> : null}

        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
