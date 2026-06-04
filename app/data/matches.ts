/**
 * FIFA World Cup 2026 fixtures (GST).
 * Schedule date/time source: app/data/uae-schedule.ts (FIFA UTC -> UAE/GST).
 */

import { getTeamFlagSrc } from "@/app/data/team-flags";
import { UAE_SCHEDULE_BY_MATCH_NO } from "@/app/data/uae-schedule";

export type Team = {
  name: string;
  flag: string;
};

type MatchFixtureBase = {
  matchNo: number;
  home: Team;
  away: Team;
  venueIds?: string[];
};

export type MatchWinnerSide = "home" | "away";

export type MatchFixture = {
  matchNo: number;
  dateLabel: string;
  time: string;
  timeSuffix: string;
  home: Team;
  away: Team;
  venueIds?: string[];
  /** Set in admin when a match is played; losing side flags render grey on the site. */
  winnerSide?: MatchWinnerSide | null;
  /** Manual full-time score (home). Shown on timetable when both scores are set. */
  homeScore?: number | null;
  /** Manual full-time score (away). Shown on timetable when both scores are set. */
  awayScore?: number | null;
};

export const MATCH_CALENDAR_YEAR = 2026;

function team(name: string): Team {
  return {
    name,
    flag: getTeamFlagSrc(name),
  };
}

function buildMatch(fixture: MatchFixtureBase): MatchFixture {
  const schedule = UAE_SCHEDULE_BY_MATCH_NO[fixture.matchNo];
  if (!schedule) {
    throw new Error(`Missing UAE schedule for match ${fixture.matchNo}`);
  }
  return {
    ...fixture,
    dateLabel: schedule.date,
    time: schedule.time,
    timeSuffix: "GST",
  };
}

const MATCH_FIXTURES: MatchFixtureBase[] = [
  {
    matchNo: 2,
    home: team("Korea Republic"),
    away: team("Czechia"),
  },
  {
    matchNo: 1,
    home: team("Mexico"),
    away: team("South Africa"),
  },
  {
    matchNo: 4,
    home: team("USA"),
    away: team("Paraguay"),
  },
  {
    matchNo: 3,
    home: team("Canada"),
    away: team("Bosnia and Herzegovina"),
  },
  {
    matchNo: 7,
    home: team("Brazil"),
    away: team("Morocco"),
  },
  {
    matchNo: 5,
    home: team("Haiti"),
    away: team("Scotland"),
  },
  {
    matchNo: 6,
    home: team("Australia"),
    away: team("Türkiye"),
  },
  {
    matchNo: 8,
    home: team("Qatar"),
    away: team("Switzerland"),
  },
  {
    matchNo: 11,
    home: team("Netherlands"),
    away: team("Japan"),
  },
  {
    matchNo: 9,
    home: team("Ivory Coast"),
    away: team("Ecuador"),
  },
  {
    matchNo: 12,
    home: team("Sweden"),
    away: team("Tunisia"),
  },
  {
    matchNo: 10,
    home: team("Germany"),
    away: team("Curaçao"),
  },
  {
    matchNo: 13,
    home: team("Saudi Arabia"),
    away: team("Uruguay"),
  },
  {
    matchNo: 15,
    home: team("IR Iran"),
    away: team("New Zealand"),
  },
  {
    matchNo: 14,
    home: team("Spain"),
    away: team("Cabo Verde"),
  },
  {
    matchNo: 16,
    home: team("Belgium"),
    away: team("Egypt"),
  },
  {
    matchNo: 18,
    home: team("Iraq"),
    away: team("Norway"),
  },
  {
    matchNo: 19,
    home: team("Argentina"),
    away: team("Algeria"),
  },
  {
    matchNo: 20,
    home: team("Austria"),
    away: team("Jordan"),
  },
  {
    matchNo: 17,
    home: team("France"),
    away: team("Senegal"),
  },
  {
    matchNo: 22,
    home: team("England"),
    away: team("Croatia"),
  },
  {
    matchNo: 21,
    home: team("Ghana"),
    away: team("Panama"),
  },
  {
    matchNo: 24,
    home: team("Uzbekistan"),
    away: team("Colombia"),
  },
  {
    matchNo: 23,
    home: team("Portugal"),
    away: team("Congo DR"),
  },
  {
    matchNo: 27,
    home: team("Canada"),
    away: team("Qatar"),
  },
  {
    matchNo: 28,
    home: team("Mexico"),
    away: team("Korea Republic"),
  },
  {
    matchNo: 25,
    home: team("Czechia"),
    away: team("South Africa"),
  },
  {
    matchNo: 26,
    home: team("Switzerland"),
    away: team("Bosnia and Herzegovina"),
  },
  {
    matchNo: 30,
    home: team("Scotland"),
    away: team("Morocco"),
  },
  {
    matchNo: 29,
    home: team("Brazil"),
    away: team("Haiti"),
  },
  {
    matchNo: 31,
    home: team("Türkiye"),
    away: team("Paraguay"),
  },
  {
    matchNo: 32,
    home: team("USA"),
    away: team("Australia"),
  },
  {
    matchNo: 33,
    home: team("Germany"),
    away: team("Ivory Coast"),
  },
  {
    matchNo: 34,
    home: team("Ecuador"),
    away: team("Curaçao"),
  },
  {
    matchNo: 36,
    home: team("Tunisia"),
    away: team("Japan"),
  },
  {
    matchNo: 35,
    home: team("Netherlands"),
    away: team("Sweden"),
  },
  {
    matchNo: 37,
    home: team("Uruguay"),
    away: team("Cabo Verde"),
  },
  {
    matchNo: 40,
    home: team("New Zealand"),
    away: team("Egypt"),
  },
  {
    matchNo: 38,
    home: team("Spain"),
    away: team("Saudi Arabia"),
  },
  {
    matchNo: 39,
    home: team("Belgium"),
    away: team("IR Iran"),
  },
  {
    matchNo: 42,
    home: team("France"),
    away: team("Iraq"),
  },
  {
    matchNo: 41,
    home: team("Norway"),
    away: team("Senegal"),
  },
  {
    matchNo: 44,
    home: team("Jordan"),
    away: team("Algeria"),
  },
  {
    matchNo: 43,
    home: team("Argentina"),
    away: team("Austria"),
  },
  {
    matchNo: 45,
    home: team("England"),
    away: team("Ghana"),
  },
  {
    matchNo: 46,
    home: team("Panama"),
    away: team("Croatia"),
  },
  {
    matchNo: 48,
    home: team("Colombia"),
    away: team("Congo DR"),
  },
  {
    matchNo: 47,
    home: team("Portugal"),
    away: team("Uzbekistan"),
  },
  {
    matchNo: 49,
    home: team("Scotland"),
    away: team("Brazil"),
  },
  {
    matchNo: 50,
    home: team("Morocco"),
    away: team("Haiti"),
  },
  {
    matchNo: 53,
    home: team("Czechia"),
    away: team("Mexico"),
  },
  {
    matchNo: 54,
    home: team("South Africa"),
    away: team("Korea Republic"),
  },
  {
    matchNo: 51,
    home: team("Switzerland"),
    away: team("Canada"),
  },
  {
    matchNo: 52,
    home: team("Bosnia and Herzegovina"),
    away: team("Qatar"),
  },
  {
    matchNo: 55,
    home: team("Curaçao"),
    away: team("Ivory Coast"),
  },
  {
    matchNo: 56,
    home: team("Ecuador"),
    away: team("Germany"),
  },
  {
    matchNo: 57,
    home: team("Japan"),
    away: team("Sweden"),
  },
  {
    matchNo: 58,
    home: team("Tunisia"),
    away: team("Netherlands"),
  },
  {
    matchNo: 59,
    home: team("Türkiye"),
    away: team("USA"),
  },
  {
    matchNo: 60,
    home: team("Paraguay"),
    away: team("Australia"),
  },
  {
    matchNo: 65,
    home: team("Cabo Verde"),
    away: team("Saudi Arabia"),
  },
  {
    matchNo: 66,
    home: team("Uruguay"),
    away: team("Spain"),
  },
  {
    matchNo: 63,
    home: team("Egypt"),
    away: team("IR Iran"),
  },
  {
    matchNo: 64,
    home: team("New Zealand"),
    away: team("Belgium"),
  },
  {
    matchNo: 61,
    home: team("Norway"),
    away: team("France"),
  },
  {
    matchNo: 62,
    home: team("Senegal"),
    away: team("Iraq"),
  },
  {
    matchNo: 67,
    home: team("Panama"),
    away: team("England"),
  },
  {
    matchNo: 68,
    home: team("Croatia"),
    away: team("Ghana"),
  },
  {
    matchNo: 71,
    home: team("Colombia"),
    away: team("Portugal"),
  },
  {
    matchNo: 72,
    home: team("Congo DR"),
    away: team("Uzbekistan"),
  },
  {
    matchNo: 69,
    home: team("Algeria"),
    away: team("Austria"),
  },
  {
    matchNo: 70,
    home: team("Jordan"),
    away: team("Argentina"),
  },
  {
    matchNo: 73,
    home: team("Group A runners-up"),
    away: team("Group B runners-up"),
  },
  {
    matchNo: 76,
    home: team("Group C winners"),
    away: team("Group F runners-up"),
  },
  {
    matchNo: 74,
    home: team("Group E winners"),
    away: team("Group A/B/C/D/F third place"),
  },
  {
    matchNo: 75,
    home: team("Group F winners"),
    away: team("Group C runners-up"),
  },
  {
    matchNo: 78,
    home: team("Group E runners-up"),
    away: team("Group I runners-up"),
  },
  {
    matchNo: 77,
    home: team("Group I winners"),
    away: team("Group C/D/F/G/H third place"),
  },
  {
    matchNo: 79,
    home: team("Group A winners"),
    away: team("Group C/E/F/H/I third place"),
  },
  {
    matchNo: 80,
    home: team("Group L winners"),
    away: team("Group E/H/I/J/K third place"),
  },
  {
    matchNo: 82,
    home: team("Group G winners"),
    away: team("Group A/E/H/I/J third place"),
  },
  {
    matchNo: 81,
    home: team("Group D winners"),
    away: team("Group B/E/F/I/J third place"),
  },
  {
    matchNo: 84,
    home: team("Group H winners"),
    away: team("Group J runners-up"),
  },
  {
    matchNo: 83,
    home: team("Group K runners-up"),
    away: team("Group L runners-up"),
  },
  {
    matchNo: 85,
    home: team("Group B winners"),
    away: team("Group E/F/G/I/J third place"),
  },
  {
    matchNo: 88,
    home: team("Group D runners-up"),
    away: team("Group G runners-up"),
  },
  {
    matchNo: 86,
    home: team("Group J winners"),
    away: team("Group H runners-up"),
  },
  {
    matchNo: 87,
    home: team("Group K winners"),
    away: team("Group D/E/I/J/L third place"),
  },
  {
    matchNo: 90,
    home: team("Winner Match 73"),
    away: team("Winner Match 75"),
  },
  {
    matchNo: 89,
    home: team("Winner Match 74"),
    away: team("Winner Match 77"),
  },
  {
    matchNo: 91,
    home: team("Winner Match 76"),
    away: team("Winner Match 78"),
  },
  {
    matchNo: 92,
    home: team("Winner Match 79"),
    away: team("Winner Match 80"),
  },
  {
    matchNo: 93,
    home: team("Winner Match 83"),
    away: team("Winner Match 84"),
  },
  {
    matchNo: 94,
    home: team("Winner Match 81"),
    away: team("Winner Match 82"),
  },
  {
    matchNo: 95,
    home: team("Winner Match 86"),
    away: team("Winner Match 88"),
  },
  {
    matchNo: 96,
    home: team("Winner Match 85"),
    away: team("Winner Match 87"),
  },
  {
    matchNo: 97,
    home: team("Winner Match 89"),
    away: team("Winner Match 90"),
  },
  {
    matchNo: 98,
    home: team("Winner Match 93"),
    away: team("Winner Match 94"),
  },
  {
    matchNo: 99,
    home: team("Winner Match 91"),
    away: team("Winner Match 92"),
  },
  {
    matchNo: 100,
    home: team("Winner Match 95"),
    away: team("Winner Match 96"),
  },
  {
    matchNo: 101,
    home: team("Winner Match 97"),
    away: team("Winner Match 98"),
  },
  {
    matchNo: 102,
    home: team("Winner Match 99"),
    away: team("Winner Match 100"),
  },
  {
    matchNo: 103,
    home: team("Runner-up Match 101"),
    away: team("Runner-up Match 102"),
  },
  {
    matchNo: 104,
    home: team("Winner Match 101"),
    away: team("Winner Match 102"),
  },
];

export const MATCHES: MatchFixture[] = MATCH_FIXTURES.map(buildMatch);

const MONTH_ABBREV_TO_INDEX: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const MONTH_DISPLAY_ABBREVS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
] as const;

export type MatchCalendarDate = {
  dateLabel: string;
  year: number;
  month: number;
  day: number;
};

const ISO_DATE_LABEL_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** Canonical YYYY-MM-DD, or the original label for legacy month abbrev formats. */
export function normalizeMatchDateLabel(dateLabel: string): string {
  const trimmed = dateLabel.trim();
  const iso = trimmed.match(ISO_DATE_LABEL_RE);
  if (!iso) return trimmed;

  const year = iso[1];
  const month = (iso[2] ?? "").padStart(2, "0");
  const day = (iso[3] ?? "").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseMatchDateLabel(dateLabel: string): { month: number; day: number } {
  const trimmed = dateLabel.trim();
  const iso = trimmed.match(ISO_DATE_LABEL_RE);
  if (iso) {
    const month = Number.parseInt(iso[2] ?? "", 10) - 1;
    const day = Number.parseInt(iso[3] ?? "", 10);
    if (
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      month < 0 ||
      month > 11 ||
      day < 1 ||
      day > 31
    ) {
      throw new Error(`Invalid UAE match date: ${dateLabel}`);
    }
    return { month, day };
  }
  const parts = trimmed.split(/\s+/);
  const month = MONTH_ABBREV_TO_INDEX[parts[0]?.toUpperCase() ?? ""];
  const day = Number.parseInt(parts[1] ?? "", 10);
  if (month === undefined || Number.isNaN(day)) {
    throw new Error(`Invalid match date label: ${dateLabel}`);
  }
  return { month, day };
}

export function getUniqueMatchDates(matches: MatchFixture[] = MATCHES): string[] {
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const match of matches) {
    if (seen.has(match.dateLabel)) continue;
    seen.add(match.dateLabel);
    dates.push(match.dateLabel);
  }
  return dates;
}

/** Unique match dates with calendar coordinates for the date picker. */
export function getMatchCalendarDates(matches: MatchFixture[] = MATCHES): MatchCalendarDate[] {
  return getUniqueMatchDates(matches)
    .map((dateLabel) => {
      const { month, day } = parseMatchDateLabel(dateLabel);
      const year = ISO_DATE_LABEL_RE.test(dateLabel.trim())
        ? Number.parseInt(dateLabel.slice(0, 4), 10)
        : MATCH_CALENDAR_YEAR;
      return { dateLabel, year, month, day };
    })
    .sort((a, b) => {
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });
}

function matchTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

export function compareMatchesChronologically(a: MatchFixture, b: MatchFixture): number {
  const { month: monthA, day: dayA } = parseMatchDateLabel(a.dateLabel);
  const { month: monthB, day: dayB } = parseMatchDateLabel(b.dateLabel);
  if (monthA !== monthB) return monthA - monthB;
  if (dayA !== dayB) return dayA - dayB;
  return matchTimeToMinutes(a.time) - matchTimeToMinutes(b.time);
}

export function getMatchesForDate(
  dateLabel: string,
  matches: MatchFixture[] = MATCHES,
): MatchFixture[] {
  return matches.filter((match) => match.dateLabel === dateLabel).sort(
    compareMatchesChronologically,
  );
}

export function getMatchesSortedChronologically(
  matches: MatchFixture[] = MATCHES,
): MatchFixture[] {
  return [...matches].sort(compareMatchesChronologically);
}

export function resolveDateLabelFromParam(
  param: string | null,
  matches: MatchFixture[] = MATCHES,
): string | null {
  if (!param) return null;
  return migrateLegacyDateLabel(decodeDateParam(param), matches);
}

export function decodeDateParam(param: string): string {
  let decoded = param.replace(/\+/g, " ");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = param;
  }
  return decoded.trim();
}

/** Map legacy labels like "JUN 11" to current UAE date keys such as "2026-06-11". */
export function migrateLegacyDateLabel(
  date: string | null,
  matches: MatchFixture[] = MATCHES,
): string | null {
  if (!date) return null;
  const normalized = date.trim();
  if (ISO_DATE_LABEL_RE.test(normalized)) {
    try {
      parseMatchDateLabel(normalized);
      return normalizeMatchDateLabel(normalized);
    } catch {
      return null;
    }
  }

  const spaced = normalized.replace(/\s+/g, " ");
  const upper = spaced.toUpperCase();
  for (const label of getUniqueMatchDates(matches)) {
    if (label.toUpperCase() === upper) return label;
  }

  const parts = upper.match(/^([A-Z]{3})\s+(\d{1,2})$/);
  if (!parts) return null;

  const monthIndex = MONTH_ABBREV_TO_INDEX[parts[1] ?? ""];
  const day = Number.parseInt(parts[2] ?? "", 10);
  if (monthIndex === undefined || Number.isNaN(day)) return null;

  return (
    getUniqueMatchDates(matches).find((label) => {
      const parsed = parseMatchDateLabel(label);
      return parsed.month === monthIndex && parsed.day === day;
    }) ?? null
  );
}

export function encodeDateParam(dateLabel: string) {
  return encodeURIComponent(dateLabel);
}

export type DisplayLanguage = "en" | "ar";

const MONTH_FULL_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

const MONTH_NAMES_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

function ordinalDay(day: number): string {
  if (day >= 11 && day <= 13) return `${day}TH`;
  switch (day % 10) {
    case 1:
      return `${day}ST`;
    case 2:
      return `${day}ND`;
    case 3:
      return `${day}RD`;
    default:
      return `${day}TH`;
  }
}

/** Card/header short date, e.g. "JUN 11" or "11 يونيو". */
export function formatMatchDateDisplay(
  dateLabel: string,
  language: DisplayLanguage = "en",
): string {
  const { month, day } = parseMatchDateLabel(dateLabel);
  if (language === "ar") {
    return `${day} ${MONTH_NAMES_AR[month]}`;
  }
  return `${MONTH_DISPLAY_ABBREVS[month]} ${day}`;
}

/** e.g. "JUN 17" → "17TH JUNE 2026" or "17 يونيو 2026" */
export function formatMatchDateLong(
  dateLabel: string,
  language: DisplayLanguage = "en",
): string {
  const { month, day } = parseMatchDateLabel(dateLabel);
  if (language === "ar") {
    return `${day} ${MONTH_NAMES_AR[month]} ${MATCH_CALENDAR_YEAR}`;
  }
  return `${ordinalDay(day)} ${MONTH_FULL_NAMES[month]} ${MATCH_CALENDAR_YEAR}`;
}

export type BracketColumnTier = 1 | 2 | 3;

export type FullScheduleColumn = {
  tier: BracketColumnTier;
  matches: MatchFixture[];
};

export type FullScheduleLayout = {
  leftColumns: FullScheduleColumn[];
  rightColumns: FullScheduleColumn[];
  final: MatchFixture | null;
};

export function isKnockoutMatch(match: MatchFixture): boolean {
  const { month, day } = parseMatchDateLabel(match.dateLabel);
  return month > 5 || (month === 5 && day >= 28);
}

function splitMatchesIntoColumns(
  matches: MatchFixture[],
  columnCount: number,
): MatchFixture[][] {
  if (matches.length === 0) {
    return Array.from({ length: columnCount }, () => []);
  }

  const columns: MatchFixture[][] = Array.from({ length: columnCount }, () => []);
  const perColumn = Math.ceil(matches.length / columnCount);

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const start = columnIndex * perColumn;
    columns[columnIndex] = matches.slice(start, start + perColumn);
  }

  return columns;
}

function findTournamentFinal(matches: MatchFixture[]): MatchFixture | null {
  return (
    matches.find(
      (match) =>
        match.home.name === "Winner Match 101" &&
        match.away.name === "Winner Match 102",
    ) ??
    matches[matches.length - 1] ??
    null
  );
}

function buildSideColumns(
  groupMatches: MatchFixture[],
  roundOf16: MatchFixture[],
  quarterFinals: MatchFixture[],
  semiFinal: MatchFixture | null,
): FullScheduleColumn[] {
  const groupColumns = splitMatchesIntoColumns(groupMatches, 3);

  return [
    { tier: 1, matches: groupColumns[0] ?? [] },
    { tier: 1, matches: groupColumns[1] ?? [] },
    { tier: 1, matches: groupColumns[2] ?? [] },
    { tier: 2, matches: roundOf16 },
    { tier: 3, matches: quarterFinals },
    { tier: 3, matches: semiFinal ? [semiFinal] : [] },
  ];
}

/** Full schedule bracket: group stage in lines 1–3, knockout in 4–6, final center. */
export function getFullScheduleLayout(matches: MatchFixture[] = MATCHES): FullScheduleLayout {
  const all = getMatchesSortedChronologically(matches);
  const final = findTournamentFinal(all);
  const rest = final
    ? all.filter(
        (match) =>
          !(
            match.dateLabel === final.dateLabel &&
            match.time === final.time &&
            match.home.name === final.home.name &&
            match.away.name === final.away.name
          ),
      )
    : all;

  const groupStage = rest.filter((match) => !isKnockoutMatch(match));
  const knockout = rest.filter((match) => isKnockoutMatch(match));

  const roundOf32 = knockout.slice(0, 16);
  const roundOf16 = knockout.slice(16, 24);
  const quarterFinals = knockout.slice(24, 28);
  const semiFinals = knockout.slice(28, 30);

  const groupMid = Math.ceil(groupStage.length / 2);
  const leftGroup = groupStage.slice(0, groupMid);
  const rightGroup = groupStage.slice(groupMid);
  const leftEarly = [...leftGroup, ...roundOf32.slice(0, 8)];
  const rightEarly = [...rightGroup, ...roundOf32.slice(8, 16)];

  return {
    leftColumns: buildSideColumns(
      leftEarly,
      roundOf16.slice(0, 4),
      quarterFinals.slice(0, 2),
      semiFinals[0] ?? null,
    ),
    rightColumns: buildSideColumns(
      rightEarly,
      roundOf16.slice(4, 8),
      quarterFinals.slice(2, 4),
      semiFinals[1] ?? null,
    ),
    final,
  };
}

export function calendarCellKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}
