import type { MatchFixture } from "@/app/data/matches";

export type WinnerSide = "home" | "away";

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
