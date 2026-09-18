import type { MatchStatus } from "./types";

export const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "예정",
  live: "진행 중",
  completed: "완료",
};
