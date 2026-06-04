import type { MatchFixture } from "@/app/data/matches";

export type WinnerSide = "home" | "away";

export function normalizeMatchScore(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99) return undefined;
  return Math.floor(parsed);
}

export function getMatchScores(
  match: MatchFixture,
): { home: number; away: number } | null {
  const home = normalizeMatchScore(match.homeScore);
  const away = normalizeMatchScore(match.awayScore);
  if (home === undefined || away === undefined) return null;
  return { home, away };
}

export function hasMatchScore(match: MatchFixture): boolean {
  return getMatchScores(match) !== null;
}

export function inferWinnerSideFromScores(
  homeScore: number | undefined,
  awayScore: number | undefined,
): WinnerSide | undefined {
  if (homeScore === undefined || awayScore === undefined) return undefined;
  if (homeScore === awayScore) return undefined;
  return homeScore > awayScore ? "home" : "away";
}

export function getMatchWinnerSide(match: MatchFixture): WinnerSide | null {
  const side = match.winnerSide;
  return side === "home" || side === "away" ? side : null;
}

export function isMatchSideLoser(match: MatchFixture, side: WinnerSide): boolean {
  const winner = getMatchWinnerSide(match);
  if (!winner) return false;
  return winner !== side;
}

/** Applied to flag images when admin marked this side as the loser. */
export const LOSER_FLAG_CLASS =
  "grayscale contrast-[0.85] brightness-[0.92] opacity-70";

/** Applied to team names on schedule cards for the losing side. */
export const LOSER_TEAM_NAME_CLASS = "text-black/40";
