"use client";

import { BracketMatchTooltip } from "@/app/components/sections/TournamentBracket";
import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import {
  encodeDateParam,
  getMatchesSortedChronologically,
  isKnockoutMatch,
  MATCH_CALENDAR_YEAR,
  parseMatchDateLabel,
  type DisplayLanguage,
  type MatchFixture,
  type Team,
} from "@/app/data/matches";
import { isRemoteTeamFlag } from "@/app/data/team-flags";
import { getTeamDisplayName } from "@/app/data/team-names";
import { UAE_SCHEDULE } from "@/app/data/uae-schedule";
import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

const KNOCKOUT_PLACEHOLDER_FLAG = "/assets/imgs/football.png";
const ISO_DATE_LABEL_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

const ROUND_BY_MATCH_NO = new Map(
  UAE_SCHEDULE.map((entry) => [entry.matchNo, entry.round]),
);

const TEAM_TO_GROUP: Record<string, string> = {
  Mexico: "A",
  "South Africa": "A",
  "Korea Republic": "A",
  Czechia: "A",
  Canada: "B",
  "Bosnia and Herzegovina": "B",
  Qatar: "B",
  Switzerland: "B",
  Brazil: "C",
  Morocco: "C",
  Haiti: "C",
  Scotland: "C",
  USA: "D",
  Paraguay: "D",
  Australia: "D",
  Türkiye: "D",
  Germany: "E",
  Ecuador: "E",
  "Côte d'Ivoire": "E",
  "Côte d\\'Ivoire": "E",
  Curaçao: "E",
  Netherlands: "F",
  Japan: "F",
  Tunisia: "F",
  Sweden: "F",
  Belgium: "G",
  "IR Iran": "G",
  Egypt: "G",
  "New Zealand": "G",
  Spain: "H",
  Uruguay: "H",
  "Saudi Arabia": "H",
  "Cabo Verde": "H",
  France: "I",
  Senegal: "I",
  Norway: "I",
  Iraq: "I",
  Argentina: "J",
  Austria: "J",
  Algeria: "J",
  Jordan: "J",
  Portugal: "K",
  Colombia: "K",
  Uzbekistan: "K",
  "Congo DR": "K",
  England: "L",
  Croatia: "L",
  Panama: "L",
  Ghana: "L",
};

type TooltipState = {
  match: MatchFixture;
  rect: DOMRect;
};

function isPlaceholderTeam(name: string) {
  return (
    name.startsWith("Group ") ||
    name.startsWith("Winner ") ||
    name.startsWith("Runner-up ")
  );
}

function shouldUsePlaceholderFlag(teamName: string) {
  return isPlaceholderTeam(teamName);
}

function getMatchGroupLabel(match: MatchFixture): string {
  const groupFromName = match.home.name.match(/^Group ([A-L])\b/i);
  if (groupFromName) return `Group ${groupFromName[1]?.toUpperCase()}`;

  if (!isKnockoutMatch(match)) {
    const group =
      TEAM_TO_GROUP[match.home.name] ?? TEAM_TO_GROUP[match.away.name];
    if (group) return `Group ${group}`;
    return "Group Stage";
  }

  return ROUND_BY_MATCH_NO.get(match.matchNo) ?? "Knockout";
}

function formatScheduleGridDate(
  dateLabel: string,
  language: DisplayLanguage,
): string {
  const { month, day } = parseMatchDateLabel(dateLabel);
  const year = ISO_DATE_LABEL_RE.test(dateLabel.trim())
    ? Number.parseInt(dateLabel.slice(0, 4), 10)
    : MATCH_CALENDAR_YEAR;
  const date = new Date(year, month, day);
  const locale = language === "ar" ? "ar-AE" : "en-US";
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function ScheduleFlag({
  team,
  usePlaceholder,
  className,
}: {
  team: Team;
  usePlaceholder: boolean;
  className?: string;
}) {
  const flagSrc = usePlaceholder ? KNOCKOUT_PLACEHOLDER_FLAG : team.flag;

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-[2px] bg-transparent ${className ?? ""}`}
      aria-hidden
    >
      <Image
        src={flagSrc}
        alt=""
        width={28}
        height={18}
        draggable={false}
        unoptimized={!usePlaceholder && isRemoteTeamFlag(team.flag)}
        className={
          usePlaceholder
            ? "h-full w-full object-contain object-center p-0.5"
            : "h-full w-full object-cover"
        }
      />
    </span>
  );
}

const GRID_COLUMNS_MD = 3;

function getGridColumnClass(index: number, total: number) {
  const remainder = total % GRID_COLUMNS_MD;
  if (remainder === 0 || index < total - remainder) {
    return "md:col-span-2";
  }
  if (remainder === 1) {
    return "md:col-span-6";
  }
  return "md:col-span-3";
}

function ScheduleMatchCard({
  match,
  columnClass,
  onFlagSelect,
}: {
  match: MatchFixture;
  columnClass: string;
  onFlagSelect: (match: MatchFixture, rect: DOMRect) => void;
}) {
  const { language, textClass } = useTranslations();
  const homeName = getTeamDisplayName(match.home.name, language);
  const awayName = getTeamDisplayName(match.away.name, language);
  const groupLabel = getMatchGroupLabel(match);
  const dateLine = formatScheduleGridDate(match.dateLabel, language);
  const homePlaceholder = shouldUsePlaceholderFlag(match.home.name);
  const awayPlaceholder = shouldUsePlaceholderFlag(match.away.name);

  const handleTeamClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onFlagSelect(match, rect);
  };

  return (
    <article
      data-bracket-slot
      data-match-date={match.dateLabel}
      className={`flex min-h-[108px] min-w-0 flex-col bg-transparent ${columnClass}`}
    >
      <p
        className={`${textClass} border-b border-[#DF2027] px-4 py-2 text-[11px] font-medium text-black`}
      >
        {groupLabel}
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,max-content)]">
        <div className="flex min-w-0 flex-col justify-center gap-3 px-4 py-3">
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF2027]"
            onClick={handleTeamClick}
            aria-label={`${homeName}, ${match.dateLabel}`}
          >
            <ScheduleFlag
              team={match.home}
              usePlaceholder={homePlaceholder}
              className="h-[18px] w-[28px]"
            />
            <span className="min-w-0 truncate text-[14px] font-medium text-black">
              {homeName}
            </span>
          </button>
          <button
            type="button"
            className="flex min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF2027]"
            onClick={handleTeamClick}
            aria-label={`${awayName}, ${match.dateLabel}`}
          >
            <ScheduleFlag
              team={match.away}
              usePlaceholder={awayPlaceholder}
              className="h-[18px] w-[28px]"
            />
            <span className="min-w-0 truncate text-[14px] font-medium text-black">
              {awayName}
            </span>
          </button>
        </div>

        <div className="w-px shrink-0 self-stretch bg-[#DF2027]" aria-hidden />

        <div className="flex flex-col items-center justify-center px-4 py-3">
          <div className={`${textClass} text-center text-[13px] leading-snug text-black`}>
            <p>{dateLine}</p>
            <p className="font-medium">
              {match.time} {match.timeSuffix}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FullScheduleMatchGrid({
  matches,
}: {
  matches?: MatchFixture[];
}) {
  const router = useRouter();
  const { setSelectedDate } = useCampaignSelection();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedMatches = useMemo(
    () => getMatchesSortedChronologically(matches),
    [matches],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollTop = 0;

    if (el.scrollHeight <= el.clientHeight) return;

    el.scrollTop = 1;
    requestAnimationFrame(() => {
      el.scrollTop = 0;
    });
  }, [sortedMatches]);

  const handleFlagSelect = useCallback((match: MatchFixture, rect: DOMRect) => {
    setTooltip({ match, rect });
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleWhereToWatch = useCallback(
    (dateLabel: string) => {
      setSelectedDate(dateLabel);
      setTooltip(null);
      router.push(`/where-to-watch?date=${encodeDateParam(dateLabel)}`);
    },
    [router, setSelectedDate],
  );

  return (
    <div
      dir="ltr"
      className="full-schedule-match-grid mx-auto flex h-full min-h-0 w-full max-w-[min(100%,1400px)] flex-col overflow-hidden bg-transparent"
    >
      <div
        className="full-schedule-match-grid-frame flex min-h-0 min-w-0 flex-1 flex-col"
        aria-label="Match schedule"
      >
        <div ref={scrollRef} className="full-schedule-match-grid-scroll min-h-0 flex-1">
          <div className="full-schedule-match-grid-inner grid-cols-1 md:grid-cols-6">
            {sortedMatches.map((match, index) => (
              <ScheduleMatchCard
                key={`${match.matchNo}-${match.dateLabel}-${match.time}-${match.home.name}-${match.away.name}`}
                match={match}
                columnClass={getGridColumnClass(index, sortedMatches.length)}
                onFlagSelect={handleFlagSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {tooltip ? (
        <BracketMatchTooltip
          state={tooltip}
          onClose={handleCloseTooltip}
          onWhereToWatch={handleWhereToWatch}
        />
      ) : null}
    </div>
  );
}
