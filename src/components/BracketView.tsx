import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BracketViewProps {
  teams: string[];
  matches: Match[];
  selectedTeam: string | null;
  onSelectTeam: (team: string | null) => void;
  showAll: boolean;
  onToggleAll: () => void;
}

interface Point {
  x: number;
  y: number;
}

const SIZE = 340;
const CENTER: Point = { x: SIZE / 2, y: SIZE / 2 };
const RADIUS = 130;

function nodePosition(index: number, total: number): Point {
  const angle = -90 + (360 / total) * index;
  const radians = (angle * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(radians),
    y: CENTER.y + RADIUS * Math.sin(radians),
  };
}

export function BracketView({ teams, matches, selectedTeam, onSelectTeam, showAll, onToggleAll }: BracketViewProps) {
  const positions = useMemo(
    () => Object.fromEntries(teams.map((team, index) => [team, nodePosition(index, teams.length)])),
    [teams],
  );

  const edges = useMemo(() => {
    const pairs: { a: string; b: string; adjacent: boolean; matches: Match[] }[] = [];
    for (let i = 0; i < teams.length; i += 1) {
      for (let j = i + 1; j < teams.length; j += 1) {
        const teamA = teams[i];
        const teamB = teams[j];
        const pairMatches = matches.filter(
          (match) => (match.a === teamA && match.b === teamB) || (match.a === teamB && match.b === teamA),
        );
        const adjacent = j - i === 1 || j - i === teams.length - 1;
        pairs.push({ a: teamA, b: teamB, adjacent, matches: pairMatches });
      }
    }
    return pairs;
  }, [teams, matches]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[420px]" role="img" aria-label="대진도">
        {edges.map(({ a, b, adjacent, matches: pairMatches }) => {
          const start = positions[a];
          const end = positions[b];
          if (!start || !end) return null;
          const completedMatch = pairMatches.find((match) => match.status === "completed");
          const involvesSelected = selectedTeam !== null && (selectedTeam === a || selectedTeam === b);
          const dimmed = selectedTeam !== null && !involvesSelected;
          const showLabel = completedMatch && (showAll || involvesSelected);
          const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

          // Offset the label perpendicular to the line (not along it) so it never
          // sits on top of the stroke, and push it toward the outside of the
          // pentagon so it doesn't drift onto an unrelated crossing diagonal.
          const lineDx = end.x - start.x;
          const lineDy = end.y - start.y;
          const lineLength = Math.hypot(lineDx, lineDy) || 1;
          let perpX = -lineDy / lineLength;
          let perpY = lineDx / lineLength;
          const outwardX = mid.x - CENTER.x;
          const outwardY = mid.y - CENTER.y;
          if (perpX * outwardX + perpY * outwardY < 0) {
            perpX = -perpX;
            perpY = -perpY;
          }
          const labelOffset = 32;

          // With every result visible, the diagonals form a pentagram and any
          // label beside a diagonal lands on a crossing line. The middle of each
          // diagonal is the one stretch with no crossings, so a small label sits
          // right on the line there instead.
          const onLine = showAll && !adjacent;
          const boxWidth = onLine ? 38 : 46;
          const boxHeight = onLine ? 26 : 32;
          const label = onLine
            ? mid
            : {
                x: mid.x + perpX * labelOffset,
                y: mid.y + perpY * labelOffset,
              };
          const scoreY = onLine ? -3 : -4;
          const winnerY = onLine ? 9 : 10;

          return (
            <g key={`${a}-${b}`} opacity={dimmed ? 0.25 : 1}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={completedMatch ? "var(--color-brand-500)" : "#cbd5e1"}
                strokeWidth={completedMatch ? 3 : 2}
                strokeDasharray={completedMatch ? undefined : "6 5"}
              />
              {showLabel ? (
                <g
                  className="cursor-pointer"
                  onClick={() => onSelectTeam(selectedTeam === a ? null : a)}
                >
                  <rect
                    x={label.x - boxWidth / 2}
                    y={label.y - boxHeight / 2}
                    width={boxWidth}
                    height={boxHeight}
                    rx={9}
                    fill="white"
                  />
                  <text
                    x={label.x}
                    y={label.y + scoreY}
                    textAnchor="middle"
                    className="select-none fill-brand-900 text-[11px] font-extrabold"
                  >
                    {completedMatch.scoreA}:{completedMatch.scoreB}
                  </text>
                  <text
                    x={label.x}
                    y={label.y + winnerY}
                    textAnchor="middle"
                    className="select-none fill-amber-500 text-[10px] font-extrabold"
                  >
                    {completedMatch.winner || "동점"}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        {teams.map((team) => {
          const pos = positions[team];
          const isSelected = selectedTeam === team;
          return (
            <g
              key={team}
              className="cursor-pointer"
              onClick={() => onSelectTeam(isSelected ? null : team)}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={28}
                fill={isSelected ? "var(--color-brand-600)" : "#ffffff"}
                stroke="var(--color-brand-500)"
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn("select-none text-sm font-bold", isSelected ? "fill-white" : "fill-brand-800")}
              >
                {team}
              </text>
            </g>
          );
        })}
      </svg>
      {selectedTeam ? (
        <button
          type="button"
          onClick={() => onSelectTeam(null)}
          className="text-xs font-semibold text-brand-600 underline"
        >
          {selectedTeam} 선택 해제
        </button>
      ) : showAll ? (
        <p className="text-xs text-slate-400">완료된 모든 경기 결과를 보고 있어요.</p>
      ) : (
        <p className="text-xs text-slate-400">반을 눌러 해당 경기 결과를 볼 수 있어요.</p>
      )}
      <Button
        type="button"
        variant={showAll ? "primary" : "secondary"}
        aria-pressed={showAll}
        onClick={onToggleAll}
        className="mt-1"
      >
        {showAll ? "전체 결과 숨기기" : "전체 경기 결과 보기"}
      </Button>
    </div>
  );
}
