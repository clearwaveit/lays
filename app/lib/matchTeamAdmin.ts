import { getTeamFlagSrc } from "@/app/data/team-flags";
import { UAE_SCHEDULE } from "@/app/data/uae-schedule";
import type { AdminTeam } from "@/app/lib/campaignDraftCore";

const ROUND_BY_MATCH_NO = new Map(
  UAE_SCHEDULE.map((entry) => [entry.matchNo, entry.round]),
);

export function matchRoundLabel(matchNo: number): string {
  return ROUND_BY_MATCH_NO.get(matchNo) ?? "Group Stage";
}

export function isKnockoutMatchNo(matchNo: number): boolean {
  const round = ROUND_BY_MATCH_NO.get(matchNo);
  return Boolean(round && round !== "Group Stage");
}

export function isKnockoutPlaceholderTeamName(name: string): boolean {
  const normalized = name.trim();
  return (
    normalized === "TBD" ||
    normalized.startsWith("Group ") ||
    normalized.startsWith("Winner Match ") ||
    normalized.startsWith("Runner-up Match ")
  );
}

export function knockoutPlaceholderTeamNames(): string[] {
  const names = ["TBD"];
  for (let matchNo = 73; matchNo <= 102; matchNo += 1) {
    names.push(`Winner Match ${matchNo}`);
  }
  names.push("Runner-up Match 101", "Runner-up Match 102");
  return names;
}

export function buildMatchTeamOptions(teams: AdminTeam[]): string[] {
  const names = new Set<string>(knockoutPlaceholderTeamNames());
  for (const team of teams) {
    if (!isKnockoutPlaceholderTeamName(team.name)) {
      names.add(team.name);
    }
  }
  return [...names].sort((a, b) => {
    if (a === "TBD") return -1;
    if (b === "TBD") return 1;
    if (a.startsWith("Winner ") && !b.startsWith("Winner ")) return 1;
    if (b.startsWith("Winner ") && !a.startsWith("Winner ")) return -1;
    return a.localeCompare(b);
  });
}

export function resolveAdminMatchTeam(
  name: string,
  teams: AdminTeam[],
): AdminTeam {
  const trimmed = name.trim();
  if (trimmed === "TBD" || isKnockoutPlaceholderTeamName(trimmed)) {
    return { name: trimmed, flag: getTeamFlagSrc(trimmed) };
  }
  const fromRegistry = teams.find((team) => team.name === trimmed);
  if (fromRegistry) {
    return { name: fromRegistry.name, flag: fromRegistry.flag };
  }
  return {
    name: trimmed,
    flag: getTeamFlagSrc(trimmed),
  };
}

export function ensureTeamInRegistry(
  teams: AdminTeam[],
  team: AdminTeam,
): AdminTeam[] {
  if (isKnockoutPlaceholderTeamName(team.name)) return teams;
  if (teams.some((entry) => entry.name === team.name)) return teams;
  return [...teams, team].sort((a, b) => a.name.localeCompare(b.name));
}
