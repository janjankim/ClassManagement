import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "scheduled" | "live" | "completed" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  scheduled: "bg-slate-100 text-slate-600",
  live: "bg-amber-100 text-amber-700",
  completed: "bg-brand-100 text-brand-700",
  neutral: "bg-slate-100 text-slate-600",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
