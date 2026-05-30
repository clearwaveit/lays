/**
 * FIFA World Cup 2026 fixtures (GST).
 * Group stage: fifa_world_cup_2026_fixtures_teams_date_time_gst_corrected.xlsx
 * Knockout: fifa_world_cup_2026_calendar_import_gst_knockout_only.xlsx
 */

import { getTeamFlagSrc } from "@/app/data/team-flags";

export type Team = {
  name: string;
  flag: string;
};

export type MatchFixture = {
  dateLabel: string;
  time: string;
  timeSuffix: string;
  home: Team;
  away: Team;
  venueIds?: string[];
};

export const MATCH_CALENDAR_YEAR = 2026;

function team(name: string): Team {
  return {
    name,
    flag: getTeamFlagSrc(name),
  };
}

export const MATCHES: MatchFixture[] = [
  {
    dateLabel: "JUN 11",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Korea Republic"),
    away: team("Czechia"),
  },
  {
    dateLabel: "JUN 11",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Mexico"),
    away: team("South Africa"),
  },
  {
    dateLabel: "JUN 12",
    time: "05:00",
    timeSuffix: "GST",
    home: team("USA"),
    away: team("Paraguay"),
  },
  {
    dateLabel: "JUN 12",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Canada"),
    away: team("Bosnia and Herzegovina"),
  },
  {
    dateLabel: "JUN 13",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Brazil"),
    away: team("Morocco"),
  },
  {
    dateLabel: "JUN 13",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Haiti"),
    away: team("Scotland"),
  },
  {
    dateLabel: "JUN 13",
    time: "08:00",
    timeSuffix: "GST",
    home: team("Australia"),
    away: team("Türkiye"),
  },
  {
    dateLabel: "JUN 13",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Qatar"),
    away: team("Switzerland"),
  },
  {
    dateLabel: "JUN 14",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Netherlands"),
    away: team("Japan"),
  },
  {
    dateLabel: "JUN 14",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Côte d\'Ivoire"),
    away: team("Ecuador"),
  },
  {
    dateLabel: "JUN 14",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Sweden"),
    away: team("Tunisia"),
  },
  {
    dateLabel: "JUN 14",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Germany"),
    away: team("Curaçao"),
  },
  {
    dateLabel: "JUN 15",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Saudi Arabia"),
    away: team("Uruguay"),
  },
  {
    dateLabel: "JUN 15",
    time: "05:00",
    timeSuffix: "GST",
    home: team("IR Iran"),
    away: team("New Zealand"),
  },
  {
    dateLabel: "JUN 15",
    time: "20:00",
    timeSuffix: "GST",
    home: team("Spain"),
    away: team("Cabo Verde"),
  },
  {
    dateLabel: "JUN 15",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Belgium"),
    away: team("Egypt"),
  },
  {
    dateLabel: "JUN 16",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Iraq"),
    away: team("Norway"),
  },
  {
    dateLabel: "JUN 16",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Argentina"),
    away: team("Algeria"),
  },
  {
    dateLabel: "JUN 16",
    time: "08:00",
    timeSuffix: "GST",
    home: team("Austria"),
    away: team("Jordan"),
  },
  {
    dateLabel: "JUN 16",
    time: "23:00",
    timeSuffix: "GST",
    home: team("France"),
    away: team("Senegal"),
  },
  {
    dateLabel: "JUN 17",
    time: "00:00",
    timeSuffix: "GST",
    home: team("England"),
    away: team("Croatia"),
  },
  {
    dateLabel: "JUN 17",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Ghana"),
    away: team("Panama"),
  },
  {
    dateLabel: "JUN 17",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Uzbekistan"),
    away: team("Colombia"),
  },
  {
    dateLabel: "JUN 17",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Portugal"),
    away: team("Congo DR"),
  },
  {
    dateLabel: "JUN 18",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Canada"),
    away: team("Qatar"),
  },
  {
    dateLabel: "JUN 18",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Mexico"),
    away: team("Korea Republic"),
  },
  {
    dateLabel: "JUN 18",
    time: "20:00",
    timeSuffix: "GST",
    home: team("Czechia"),
    away: team("South Africa"),
  },
  {
    dateLabel: "JUN 18",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Switzerland"),
    away: team("Bosnia and Herzegovina"),
  },
  {
    dateLabel: "JUN 19",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Scotland"),
    away: team("Morocco"),
  },
  {
    dateLabel: "JUN 19",
    time: "04:30",
    timeSuffix: "GST",
    home: team("Brazil"),
    away: team("Haiti"),
  },
  {
    dateLabel: "JUN 19",
    time: "07:00",
    timeSuffix: "GST",
    home: team("Türkiye"),
    away: team("Paraguay"),
  },
  {
    dateLabel: "JUN 19",
    time: "23:00",
    timeSuffix: "GST",
    home: team("USA"),
    away: team("Australia"),
  },
  {
    dateLabel: "JUN 20",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Germany"),
    away: team("Côte d\'Ivoire"),
  },
  {
    dateLabel: "JUN 20",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Ecuador"),
    away: team("Curaçao"),
  },
  {
    dateLabel: "JUN 20",
    time: "08:00",
    timeSuffix: "GST",
    home: team("Tunisia"),
    away: team("Japan"),
  },
  {
    dateLabel: "JUN 20",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Netherlands"),
    away: team("Sweden"),
  },
  {
    dateLabel: "JUN 21",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Uruguay"),
    away: team("Cabo Verde"),
  },
  {
    dateLabel: "JUN 21",
    time: "05:00",
    timeSuffix: "GST",
    home: team("New Zealand"),
    away: team("Egypt"),
  },
  {
    dateLabel: "JUN 21",
    time: "20:00",
    timeSuffix: "GST",
    home: team("Spain"),
    away: team("Saudi Arabia"),
  },
  {
    dateLabel: "JUN 21",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Belgium"),
    away: team("IR Iran"),
  },
  {
    dateLabel: "JUN 22",
    time: "01:00",
    timeSuffix: "GST",
    home: team("France"),
    away: team("Iraq"),
  },
  {
    dateLabel: "JUN 22",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Norway"),
    away: team("Senegal"),
  },
  {
    dateLabel: "JUN 22",
    time: "07:00",
    timeSuffix: "GST",
    home: team("Jordan"),
    away: team("Algeria"),
  },
  {
    dateLabel: "JUN 22",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Argentina"),
    away: team("Austria"),
  },
  {
    dateLabel: "JUN 23",
    time: "00:00",
    timeSuffix: "GST",
    home: team("England"),
    away: team("Ghana"),
  },
  {
    dateLabel: "JUN 23",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Panama"),
    away: team("Croatia"),
  },
  {
    dateLabel: "JUN 23",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Colombia"),
    away: team("Congo DR"),
  },
  {
    dateLabel: "JUN 23",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Portugal"),
    away: team("Uzbekistan"),
  },
  {
    dateLabel: "JUN 24",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Scotland"),
    away: team("Brazil"),
  },
  {
    dateLabel: "JUN 24",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Morocco"),
    away: team("Haiti"),
  },
  {
    dateLabel: "JUN 24",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Czechia"),
    away: team("Mexico"),
  },
  {
    dateLabel: "JUN 24",
    time: "05:00",
    timeSuffix: "GST",
    home: team("South Africa"),
    away: team("Korea Republic"),
  },
  {
    dateLabel: "JUN 24",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Switzerland"),
    away: team("Canada"),
  },
  {
    dateLabel: "JUN 24",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Bosnia and Herzegovina"),
    away: team("Qatar"),
  },
  {
    dateLabel: "JUN 25",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Curaçao"),
    away: team("Côte d\'Ivoire"),
  },
  {
    dateLabel: "JUN 25",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Ecuador"),
    away: team("Germany"),
  },
  {
    dateLabel: "JUN 25",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Japan"),
    away: team("Sweden"),
  },
  {
    dateLabel: "JUN 25",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Tunisia"),
    away: team("Netherlands"),
  },
  {
    dateLabel: "JUN 25",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Türkiye"),
    away: team("USA"),
  },
  {
    dateLabel: "JUN 25",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Paraguay"),
    away: team("Australia"),
  },
  {
    dateLabel: "JUN 26",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Cabo Verde"),
    away: team("Saudi Arabia"),
  },
  {
    dateLabel: "JUN 26",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Uruguay"),
    away: team("Spain"),
  },
  {
    dateLabel: "JUN 26",
    time: "07:00",
    timeSuffix: "GST",
    home: team("Egypt"),
    away: team("IR Iran"),
  },
  {
    dateLabel: "JUN 26",
    time: "07:00",
    timeSuffix: "GST",
    home: team("New Zealand"),
    away: team("Belgium"),
  },
  {
    dateLabel: "JUN 26",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Norway"),
    away: team("France"),
  },
  {
    dateLabel: "JUN 26",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Senegal"),
    away: team("Iraq"),
  },
  {
    dateLabel: "JUN 27",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Panama"),
    away: team("England"),
  },
  {
    dateLabel: "JUN 27",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Croatia"),
    away: team("Ghana"),
  },
  {
    dateLabel: "JUN 27",
    time: "03:30",
    timeSuffix: "GST",
    home: team("Colombia"),
    away: team("Portugal"),
  },
  {
    dateLabel: "JUN 27",
    time: "03:30",
    timeSuffix: "GST",
    home: team("Congo DR"),
    away: team("Uzbekistan"),
  },
  {
    dateLabel: "JUN 27",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Algeria"),
    away: team("Austria"),
  },
  {
    dateLabel: "JUN 27",
    time: "06:00",
    timeSuffix: "GST",
    home: team("Jordan"),
    away: team("Argentina"),
  },
  {
    dateLabel: "JUN 28",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Group A runners-up"),
    away: team("Group B runners-up"),
  },
  {
    dateLabel: "JUN 29",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Group C winners"),
    away: team("Group F runners-up"),
  },
  {
    dateLabel: "JUN 30",
    time: "00:30",
    timeSuffix: "GST",
    home: team("Group E winners"),
    away: team("Group A/B/C/D/F third place"),
  },
  {
    dateLabel: "JUN 30",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Group F winners"),
    away: team("Group C runners-up"),
  },
  {
    dateLabel: "JUN 30",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Group E runners-up"),
    away: team("Group I runners-up"),
  },
  {
    dateLabel: "JUL 1",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Group I winners"),
    away: team("Group C/D/F/G/H third place"),
  },
  {
    dateLabel: "JUL 1",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Group A winners"),
    away: team("Group C/E/F/H/I third place"),
  },
  {
    dateLabel: "JUL 1",
    time: "20:00",
    timeSuffix: "GST",
    home: team("Group L winners"),
    away: team("Group E/H/I/J/K third place"),
  },
  {
    dateLabel: "JUL 2",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Group G winners"),
    away: team("Group A/E/H/I/J third place"),
  },
  {
    dateLabel: "JUL 2",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Group D winners"),
    away: team("Group B/E/F/I/J third place"),
  },
  {
    dateLabel: "JUL 2",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Group H winners"),
    away: team("Group J runners-up"),
  },
  {
    dateLabel: "JUL 3",
    time: "03:00",
    timeSuffix: "GST",
    home: team("Group K runners-up"),
    away: team("Group L runners-up"),
  },
  {
    dateLabel: "JUL 3",
    time: "07:00",
    timeSuffix: "GST",
    home: team("Group B winners"),
    away: team("Group E/F/G/I/J third place"),
  },
  {
    dateLabel: "JUL 3",
    time: "22:00",
    timeSuffix: "GST",
    home: team("Group D runners-up"),
    away: team("Group G runners-up"),
  },
  {
    dateLabel: "JUL 4",
    time: "02:00",
    timeSuffix: "GST",
    home: team("Group J winners"),
    away: team("Group H runners-up"),
  },
  {
    dateLabel: "JUL 4",
    time: "05:30",
    timeSuffix: "GST",
    home: team("Group K winners"),
    away: team("Group D/E/I/J/L third place"),
  },
  {
    dateLabel: "JUL 4",
    time: "21:00",
    timeSuffix: "GST",
    home: team("Winner Match 73"),
    away: team("Winner Match 75"),
  },
  {
    dateLabel: "JUL 5",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Winner Match 74"),
    away: team("Winner Match 77"),
  },
  {
    dateLabel: "JUL 6",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Winner Match 76"),
    away: team("Winner Match 78"),
  },
  {
    dateLabel: "JUL 6",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Winner Match 79"),
    away: team("Winner Match 80"),
  },
  {
    dateLabel: "JUL 6",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Winner Match 83"),
    away: team("Winner Match 84"),
  },
  {
    dateLabel: "JUL 7",
    time: "04:00",
    timeSuffix: "GST",
    home: team("Winner Match 81"),
    away: team("Winner Match 82"),
  },
  {
    dateLabel: "JUL 7",
    time: "20:00",
    timeSuffix: "GST",
    home: team("Winner Match 86"),
    away: team("Winner Match 88"),
  },
  {
    dateLabel: "JUL 8",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Winner Match 85"),
    away: team("Winner Match 87"),
  },
  {
    dateLabel: "JUL 10",
    time: "00:00",
    timeSuffix: "GST",
    home: team("Winner Match 89"),
    away: team("Winner Match 90"),
  },
  {
    dateLabel: "JUL 10",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Winner Match 93"),
    away: team("Winner Match 94"),
  },
  {
    dateLabel: "JUL 12",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Winner Match 91"),
    away: team("Winner Match 92"),
  },
  {
    dateLabel: "JUL 12",
    time: "05:00",
    timeSuffix: "GST",
    home: team("Winner Match 95"),
    away: team("Winner Match 96"),
  },
  {
    dateLabel: "JUL 14",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Winner Match 97"),
    away: team("Winner Match 98"),
  },
  {
    dateLabel: "JUL 15",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Winner Match 99"),
    away: team("Winner Match 100"),
  },
  {
    dateLabel: "JUL 19",
    time: "01:00",
    timeSuffix: "GST",
    home: team("Runner-up Match 101"),
    away: team("Runner-up Match 102"),
  },
  {
    dateLabel: "JUL 19",
    time: "23:00",
    timeSuffix: "GST",
    home: team("Winner Match 101"),
    away: team("Winner Match 102"),
  },
];

const MONTH_ABBREV_TO_INDEX: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

export type MatchCalendarDate = {
  dateLabel: string;
  year: number;
  month: number;
  day: number;
};

export function parseMatchDateLabel(dateLabel: string): { month: number; day: number } {
  const parts = dateLabel.trim().split(/\s+/);
  const month = MONTH_ABBREV_TO_INDEX[parts[0]?.toUpperCase() ?? ""];
  const day = Number.parseInt(parts[1] ?? "", 10);
  if (month === undefined || Number.isNaN(day)) {
    throw new Error(`Invalid match date label: ${dateLabel}`);
  }
  return { month, day };
}

export function getUniqueMatchDates(): string[] {
  const seen = new Set<string>();
  const dates: string[] = [];
  for (const match of MATCHES) {
    if (seen.has(match.dateLabel)) continue;
    seen.add(match.dateLabel);
    dates.push(match.dateLabel);
  }
  return dates;
}

/** Unique match dates with calendar coordinates for the date picker. */
export function getMatchCalendarDates(): MatchCalendarDate[] {
  return getUniqueMatchDates()
    .map((dateLabel) => {
      const { month, day } = parseMatchDateLabel(dateLabel);
      return { dateLabel, year: MATCH_CALENDAR_YEAR, month, day };
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

export function resolveDateLabelFromParam(param: string | null): string | null {
  if (!param) return null;
  let decoded = param.replace(/\+/g, " ");
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    decoded = param;
  }
  const normalized = decoded.trim().replace(/\s+/g, " ");
  const upper = normalized.toUpperCase();
  for (const label of getUniqueMatchDates()) {
    if (label.toUpperCase() === upper) return label;
  }
  const parts = upper.match(/^([A-Z]{3})\s+(\d{1,2})$/);
  if (!parts) return null;
  const candidate = `${parts[1]} ${Number.parseInt(parts[2] ?? "", 10)}`;
  return (
    getUniqueMatchDates().find((label) => label.toUpperCase() === candidate) ?? null
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
  return dateLabel;
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
