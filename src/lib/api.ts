import { localBootstrap, localCreateMatch, localDeleteMatch, localLogin, localUpdateMatch } from "./localStore";
import type { BootstrapData, Match, MatchInput } from "./types";

const API_URL = import.meta.env.VITE_GAS_API_URL as string | undefined;

export const isRemoteConnected = Boolean(API_URL);

async function callRemote<T>(body?: Record<string, unknown>): Promise<T> {
  const response = body
    ? await fetch(API_URL as string, { method: "POST", body: JSON.stringify(body), cache: "no-store" })
    : await fetch(`${API_URL}?action=bootstrap`, { cache: "no-store" });

  if (!response.ok) throw new Error("서버 요청에 실패했습니다.");
  const payload = (await response.json()) as { ok: boolean; data?: T; error?: string };
  if (!payload.ok) throw new Error(payload.error || "요청에 실패했습니다.");
  return payload.data as T;
}

export async function fetchBootstrap(): Promise<BootstrapData> {
  if (!isRemoteConnected) return localBootstrap();
  return callRemote<BootstrapData>();
}

export async function loginAdmin(password: string): Promise<{ token: string; expiresIn: number }> {
  if (!isRemoteConnected) return localLogin(password);
  return callRemote({ action: "login", password });
}

export async function createMatch(token: string, match: MatchInput): Promise<Match> {
  if (!isRemoteConnected) return localCreateMatch(match);
  return callRemote({ action: "createMatch", token, match });
}

export async function updateMatch(token: string, match: MatchInput & { id: string }): Promise<Match> {
  if (!isRemoteConnected) return localUpdateMatch(match);
  return callRemote({ action: "updateMatch", token, match });
}

export async function deleteMatch(token: string, id: string): Promise<{ id: string }> {
  if (!isRemoteConnected) return localDeleteMatch(id);
  return callRemote({ action: "deleteMatch", token, id });
}
