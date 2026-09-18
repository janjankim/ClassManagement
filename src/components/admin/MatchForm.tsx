import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Match, MatchInput } from "@/lib/types";

interface MatchFormProps {
  teams: string[];
  initial?: Match | null;
  onSubmit: (input: MatchInput) => Promise<void>;
  onCancel: () => void;
}

function toScoreInput(value: number | null): string {
  return value === null ? "" : String(value);
}

export function MatchForm({ teams, initial, onSubmit, onCancel }: MatchFormProps) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [period, setPeriod] = useState(initial ? String(initial.period) : "");
  const [teamA, setTeamA] = useState(initial?.a ?? teams[0] ?? "");
  const [teamB, setTeamB] = useState(initial?.b ?? teams[1] ?? "");
  const [scoreA, setScoreA] = useState(toScoreInput(initial?.scoreA ?? null));
  const [scoreB, setScoreB] = useState(toScoreInput(initial?.scoreB ?? null));
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        scoreA: scoreA === "" ? null : Number(scoreA),
        scoreB: scoreB === "" ? null : Number(scoreB),
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
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          팀 A 점수
          <input
            type="number"
            min={0}
            value={scoreA}
            onChange={(event) => setScoreA(event.target.value)}
            placeholder="미정"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="col-span-1 flex flex-col gap-1 text-xs font-semibold text-slate-500">
          팀 B 점수
          <input
            type="number"
            min={0}
            value={scoreB}
            onChange={(event) => setScoreB(event.target.value)}
            placeholder="미정"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
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
