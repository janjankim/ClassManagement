import { useState } from "react";
import type { HeadToHeadEntry } from "@/lib/standings";
import { cn } from "@/lib/utils";

const RESULT_LABEL: Record<HeadToHeadEntry["result"], string> = {
  win: "승리",
  loss: "패배",
  draw: "무승부",
  none: "경기 없음",
};

const RESULT_CLASS: Record<HeadToHeadEntry["result"], string> = {
  win: "text-amber-300",
  loss: "text-slate-400",
  draw: "text-slate-200",
  none: "text-slate-500",
};

interface TooltipPosition {
  x: number;
  y: number;
  below: boolean;
  alignRight: boolean;
}

const VIEWPORT_MARGIN = 8;

export function HeadToHeadMark({ team, entries }: { team: string; entries: HeadToHeadEntry[] }) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  function show(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const below = rect.top < 170;
    // The mark sits in the last table column, so anchor the tooltip's edge to the
    // mark and grow toward the page centre; otherwise it overflows the viewport.
    const alignRight = rect.left > window.innerWidth / 2;
    setPosition({
      x: alignRight
        ? Math.min(rect.right + 4, window.innerWidth - VIEWPORT_MARGIN)
        : Math.max(rect.left - 4, VIEWPORT_MARGIN),
      y: below ? rect.bottom + 8 : rect.top - 8,
      below,
      alignRight,
    });
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={`${team} 세트 득점 동률, 승자승 결과 보기`}
        className="absolute left-full top-0 ml-0.5 cursor-help px-1 font-extrabold text-amber-500"
        onMouseEnter={(event) => show(event.currentTarget)}
        onMouseLeave={() => setPosition(null)}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setPosition(null)}
      >
        *
      </span>
      {position ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-left text-xs font-medium text-white shadow-lg"
          style={{
            left: position.x,
            top: position.y,
            transform: `translate(${position.alignRight ? "-100%" : "0"}, ${position.below ? "0" : "-100%"})`,
          }}
        >
          <p className="mb-1 font-bold text-white">{team} · 세트 득점 동률 → 승자승</p>
          {entries.map((entry) => (
            <p key={entry.opponent} className="leading-5">
              <span className="text-slate-300">vs {entry.opponent}</span>
              {"  "}
              <span className={cn("font-bold", RESULT_CLASS[entry.result])}>{RESULT_LABEL[entry.result]}</span>
              {entry.scores.length > 0 ? <span className="text-slate-400"> ({entry.scores.join(", ")})</span> : null}
            </p>
          ))}
        </div>
      ) : null}
    </>
  );
}
