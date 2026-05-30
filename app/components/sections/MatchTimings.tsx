"use client";

import SubpageTopBar from "@/app/components/ui/SubpageTopBar";
import SponsorBadge from "@/app/components/ui/SponsorBadge";
import type { VenueModalData } from "@/app/components/ui/VenueModal";
import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import {
  getMatchesForDate,
  getMatchesSortedChronologically,
  formatMatchDateDisplay,
  MATCH_CALENDAR_YEAR,
  parseMatchDateLabel,
  resolveDateLabelFromParam,
  type MatchFixture,
  type Team,
} from "@/app/data/matches";
import { isRemoteTeamFlag } from "@/app/data/team-flags";
import { getTeamDisplayName } from "@/app/data/team-names";
import { getVenueById } from "@/app/data/venues";
import { useSmoothHorizontalScroll } from "@/app/hooks/useSmoothHorizontalScroll";
import { animateMatchTimingsSection } from "@/app/lib/animations";
import {
  isMatchAssignedToVenue,
  useAdminCampaignDraft,
} from "@/app/lib/adminCampaignDraft";
import { gsap } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";
import { useLanguage } from "@/app/context/LanguageContext";
import { laysFontFamily, laysTextClass } from "@/app/fonts";
import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const PANEL_RED = "#DE1F27";
const SCHEDULE_RED = "#DF2027";
const LOCATION_YELLOW = "#FEE401";
const DESIGN_WIDTH = 1600;
const PAGE_MAX_WIDTH = 1600;
const pageMaxWidth = `min(100%, ${((PAGE_MAX_WIDTH / DESIGN_WIDTH) * 100).toFixed(4)}vw)`;

const MATCH_TIMING_LOGO_EN_SRC = "/assets/imgs/match-timing-logo.svg";
const MATCH_TIMING_LOGO_AR_SRC = "/assets/imgs/match-timing-logo-arabic.svg";
const MATCH_TIMING_LOGO_EN_WIDTH_PX = 393.4;
const MATCH_TIMING_LOGO_EN_HEIGHT_PX = 120;
const MATCH_TIMING_LOGO_AR_WIDTH_PX = 404;
const MATCH_TIMING_LOGO_AR_HEIGHT_PX = 194;
const TIMING_CARD_BG = "/assets/imgs/timing-card-bg.svg";

const PANEL_HEIGHT_PX = 661;
const CARD_WIDTH_PX = 562;
const CARD_HEIGHT_PX = 281;
const VENUE_ONLY_MATCH_LIMIT = 6;

function scale(px: number, minRatio = 0.45) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

function getMatchStartDate(match: MatchFixture) {
  const { month, day } = parseMatchDateLabel(match.dateLabel);
  const [hours = 0, minutes = 0] = match.time
    .split(":")
    .map((part) => Number.parseInt(part, 10));

  return new Date(
    Date.UTC(
      MATCH_CALENDAR_YEAR,
      month,
      day,
      Number.isNaN(hours) ? 0 : hours - 4,
      Number.isNaN(minutes) ? 0 : minutes,
    ),
  );
}

function getNextVenueMatches(limit: number, matches: MatchFixture[]) {
  const now = new Date();
  const sortedMatches = getMatchesSortedChronologically(matches);
  const upcomingMatches = sortedMatches.filter(
    (match) => getMatchStartDate(match).getTime() >= now.getTime(),
  );

  return (upcomingMatches.length > 0 ? upcomingMatches : sortedMatches).slice(
    0,
    limit,
  );
}

/** Red panel: grows with viewport above 1600px (no max cap at design px). */
function scaleFluid(px: number, minRatio = 0.45) {
  const minPx = Math.round(px * minRatio);
  return `max(${minPx}px, calc(${px} / ${DESIGN_WIDTH} * 100vw))`;
}

/** Logo extends below the header row and overlaps the red panel in front. */
const LOGO_OVERLAP_INTO_PANEL_EN_PX = 56;

function logoOverlapIntoPanel(isArabic: boolean) {
  const overlapPx = isArabic
    ? LOGO_OVERLAP_INTO_PANEL_EN_PX +
      (MATCH_TIMING_LOGO_AR_HEIGHT_PX - MATCH_TIMING_LOGO_EN_HEIGHT_PX)
    : LOGO_OVERLAP_INTO_PANEL_EN_PX;
  return scale(-overlapPx);
}
const PANEL_HEIGHT = scaleFluid(PANEL_HEIGHT_PX);
const CARD_WIDTH = scale(CARD_WIDTH_PX);
const CARD_HEIGHT = scale(CARD_HEIGHT_PX);
const CARD_ROW_PADDING_LEFT = scale(40);
const CARD_GAP = scale(20);
const VENUE_WHITE_LOGO_HEIGHT = scale(51);
const FLAG_SIZE = scale(99);
const TEAM_NAME_MAX_WIDTH = scale(118);
const ACTION_BTN_WIDTH = scale(210);
const ACTION_BTN_HEIGHT = scale(56.08);
const ACTION_BTN_ROW_GAP = scale(16);
/** Larger gap below 1600px; fixed 64px at design width and above (no vw growth). */
const PANEL_SECTION_GAP = scale(96);
const PANEL_SECTION_GAP_LG = scale(64);
const ACTION_BTN_FONT_SIZE = scale(16);
const TIME_BADGE_BG = "#FFE71F7A";
const TIME_BADGE_WIDTH = scale(78);
const TIME_BADGE_HEIGHT = scale(68);
const TIME_BADGE_FONT_SIZE = scale(20);
const TEAM_NAME_FONT_SIZE = scale(20);

/** White logo variants for the red panel (filename typo: comapny). */
const VENUE_LOGO_ALT_IDS = new Set(["bla-bla-dubai", "mist-dubai", "loui-dubai"]);

function venueWhiteLogoSrc(venue: VenueModalData) {
  if (venue.src.startsWith("data:")) return venue.src;
  const logoNum = venue.src.match(/company-logo-(\d+)/)?.[1];
  if (logoNum) return `/assets/imgs/comapny-logo-${logoNum}-white.svg`;
  return "/assets/imgs/comapny-logo-1-white.svg";
}

function isAltVenueWhiteLogo(venueId: string) {
  return VENUE_LOGO_ALT_IDS.has(venueId);
}

function TeamColumn({
  team,
  displayName,
  isRtl,
  textClass,
  fontFamily,
}: {
  team: Team;
  displayName: string;
  isRtl: boolean;
  textClass: string;
  fontFamily: string;
}) {
  return (
    <div
      className="mt-team-column flex min-w-0 max-w-[var(--mt-team-name-max-width)] shrink-0 flex-col items-center overflow-hidden"
      style={{
        width: "var(--mt-team-name-max-width)",
      }}
    >
      <div
        className="mt-team-flag relative shrink-0"
        style={{
          width: "var(--mt-flag-size)",
          height: "var(--mt-flag-size)",
        }}
      >
        <div
          aria-hidden
          className="mt-team-flag-shadow pointer-events-none absolute inset-0 rounded-full bg-white"
          style={{
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
          }}
        />
        <div
          className="mt-team-flag-ring relative z-[1] box-border size-full overflow-hidden rounded-full border-[3px] border-solid border-white"
          style={{ borderRadius: "50%" }}
        >
          <Image
            src={team.flag}
            alt={`${displayName} flag`}
            fill
            loading="eager"
            quality={100}
            draggable={false}
            unoptimized={isRemoteTeamFlag(team.flag)}
            className="mt-team-flag-img pointer-events-none object-cover select-none"
            style={{ borderRadius: "50%" }}
            sizes="(max-width: 1023px) 80px, 120px"
          />
        </div>
      </div>
      <div
        className="group/team-name relative w-full min-w-0"
        style={{ marginTop: "var(--mt-team-flag-name-gap)" }}
        title={displayName}
      >
        <span
          className={`${isRtl ? textClass : laysTextClass} block w-full min-w-0 text-center leading-tight text-black ${isRtl ? "" : "uppercase"}`}
          style={{
            fontSize: "var(--mt-team-name-font-size)",
            fontWeight: 800,
            fontFamily: isRtl ? fontFamily : laysFontFamily,
            // multiline clamp to 2 lines with ellipsis
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            // Firefox / other fallback: limit height to ~2 lines using the
            // CSS variable font size so the name is clipped even without
            // -webkit-line-clamp support.
            lineHeight: 1.05,
            maxHeight: "calc(var(--mt-team-name-font-size) * 2.2)",
          }}
        >
          {displayName}
        </span>
        <span
          role="tooltip"
          className={`${isRtl ? textClass : laysTextClass} pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 hidden w-max max-w-[min(240px,70vw)] -translate-x-1/2 rounded-md bg-black px-2 py-1.5 text-center text-[10px] font-normal normal-case leading-snug text-white shadow-lg group-hover/team-name:block`}
        >
          {displayName}
        </span>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  matchIndex,
}: {
  match: MatchFixture;
  matchIndex: number;
}) {
  const { language, textClass, fontFamily, isRtl } = useTranslations();
  const homeName = getTeamDisplayName(match.home.name, language);
  const awayName = getTeamDisplayName(match.away.name, language);
  const dateDisplay = formatMatchDateDisplay(match.dateLabel, language);
  const versusLabel = isRtl
    ? `${homeName} ضد ${awayName}`
    : `${homeName} vs ${awayName}`;

  return (
    <article
      className="relative shrink-0 snap-center snap-always overflow-hidden touch-manipulation"
      style={{ width: "var(--mt-card-width)" }}
      data-date={match.dateLabel}
      data-match-index={matchIndex}
      data-match-time={match.time}
      aria-label={`${versusLabel}, ${match.time} ${match.timeSuffix}`}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "var(--mt-card-width)",
          height: "var(--mt-card-height)",
        }}
      >
        <Image
          src={TIMING_CARD_BG}
          alt=""
          fill
          draggable={false}
          className="pointer-events-none object-contain object-center select-none"
          sizes="562px"
          aria-hidden
        />

        <div className="mt-match-card-content absolute inset-0 z-10 overflow-hidden">
          <p
            className={`${isRtl ? textClass : laysTextClass} absolute left-1/2 z-20 -translate-x-1/2 text-center font-extrabold leading-none text-black ${isRtl ? "" : "uppercase"}`}
            style={{
              top: "var(--mt-date-top)",
              fontSize: "var(--mt-date-font-size)",
              fontFamily: isRtl ? fontFamily : laysFontFamily,
            }}
          >
            {dateDisplay}
          </p>

          <div
            className="mt-match-card-row absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[var(--mt-match-item-gap)]"
            style={{
              width: "calc(100% - 2 * var(--mt-card-pad))",
              maxWidth: "100%",
            }}
          >
          <TeamColumn
            team={match.home}
            displayName={homeName}
            isRtl={isRtl}
            textClass={textClass}
            fontFamily={fontFamily}
          />

          <div
            className={`${laysTextClass} mt-match-time-badge z-20 flex shrink-0 flex-col items-center justify-center text-center uppercase leading-none text-black`}
            style={{
              width: "var(--mt-time-badge-width)",
              height: "var(--mt-time-badge-height)",
              backgroundColor: TIME_BADGE_BG,
              borderRadius: scale(6),
              fontSize: "var(--mt-time-badge-font-size)",
              fontWeight: 800,
              fontFamily: laysFontFamily,
              lineHeight: 1.1,
            }}
          >
            <span>{match.time}</span>
            <span>{match.timeSuffix}</span>
          </div>

          <TeamColumn
            team={match.away}
            displayName={awayName}
            isRtl={isRtl}
            textClass={textClass}
            fontFamily={fontFamily}
          />
          </div>
        </div>
      </div>
    </article>
  );
}

function HorizontalMatchScroller({
  matches,
  scrollToDate,
  isRtl,
  entranceDone,
}: {
  matches: MatchFixture[];
  scrollToDate?: string | null;
  isRtl: boolean;
  entranceDone: boolean;
}) {
  const { setScrollRef, scrollToIndex, isDragging, canScroll } =
    useSmoothHorizontalScroll(isRtl);
  const isVenueOnly = !scrollToDate;
  const shouldCenterCards = matches.length <= 2;
  const matchesKey = useMemo(
    () => matches.map((m) => `${m.dateLabel}-${m.time}`).join("|"),
    [matches],
  );

  useEffect(() => {
    if (!entranceDone || matches.length === 0 || !scrollToDate) return;

    const index = matches.findIndex((match) => match.dateLabel === scrollToDate);
    if (index < 0) return;

    const frame = requestAnimationFrame(() => {
      scrollToIndex(index, { smooth: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [entranceDone, scrollToDate, matchesKey, scrollToIndex, matches.length]);

  useEffect(() => {
    if (!entranceDone || matches.length === 0 || scrollToDate) return;

    const frame = requestAnimationFrame(() => {
      scrollToIndex(0, { smooth: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [entranceDone, scrollToDate, matchesKey, scrollToIndex, matches.length]);

  const scrollBleedStyle = shouldCenterCards
    ? { width: "100%" }
    : isRtl
      ? {
          width: "calc(100% + max(0px, 50vw - 50%))",
          marginLeft: "calc(50% - 50vw)",
          maxWidth: "100vw",
        }
      : {
          width: "calc(100% + max(0px, 50vw - 50%))",
          marginRight: "calc(50% - 50vw)",
          maxWidth: "100vw",
        };

  return (
    <div
      ref={setScrollRef}
      dir={isRtl ? "rtl" : "ltr"}
      className={`match-timings-scroll match-timings-scroll--two-rows ${isVenueOnly ? "match-timings-scroll--venue-only" : ""} pointer-events-auto w-full overflow-y-visible select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        shouldCenterCards
          ? `flex justify-center overflow-x-auto scroll-smooth [touch-action:pan-x] [-webkit-overflow-scrolling:touch] ${
              canScroll ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
            }`
          : `overflow-x-auto scroll-smooth [touch-action:pan-x] [-webkit-overflow-scrolling:touch] ${
              canScroll
                ? isDragging
                  ? "cursor-grabbing snap-none"
                  : "cursor-grab snap-x snap-proximity"
                : "cursor-default"
            }`
      }`}
      style={scrollBleedStyle}
    >
      <div
        className="match-timings-card-track flex w-max shrink-0 items-end"
        style={{
          gap: "var(--mt-card-gap)",
          paddingLeft:
            shouldCenterCards || isRtl ? 0 : "var(--mt-card-row-padding)",
          paddingRight:
            shouldCenterCards || !isRtl
              ? 0
              : "max(var(--mt-card-row-padding), calc(50vw - 50%))",
        }}
      >
        {matches.map((match, index) => (
          <MatchCard
            key={`${match.dateLabel}-${match.time}-${match.home.name}-${match.away.name}`}
            match={match}
            matchIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

function MatchTimingLogo({
  alt,
  isRtl,
}: {
  alt: string;
  isRtl: boolean;
}) {
  const { language, isReady } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isArabic = language === "ar";
  const logoWidthPx = isArabic
    ? MATCH_TIMING_LOGO_AR_WIDTH_PX
    : MATCH_TIMING_LOGO_EN_WIDTH_PX;
  const logoHeightPx = isArabic
    ? MATCH_TIMING_LOGO_AR_HEIGHT_PX
    : MATCH_TIMING_LOGO_EN_HEIGHT_PX;
  const logoSrc = isArabic ? MATCH_TIMING_LOGO_AR_SRC : MATCH_TIMING_LOGO_EN_SRC;
  const logoOverlap = logoOverlapIntoPanel(isArabic);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReady) {
    return (
      <span
        aria-hidden
        className="inline-block shrink-0"
        style={{
          width: scale(logoWidthPx),
          height: scale(logoHeightPx),
          marginBottom: logoOverlap,
        }}
      />
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={logoWidthPx}
      height={logoHeightPx}
      decoding="async"
      className={`relative z-20 shrink-0 object-contain ${isRtl ? "object-right" : "object-left"}`}
      style={{
        width: scale(logoWidthPx),
        height: "auto",
        marginBottom: logoOverlap,
      }}
    />
  );
}

export default function MatchTimings() {
  const { t, textClass, fontFamily, isRtl } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueId = searchParams.get("venue");
  const dateParam = searchParams.get("date");
  const adminDraft = useAdminCampaignDraft();
  const activeDateLabel = resolveDateLabelFromParam(dateParam, adminDraft?.matches);
  const fallbackVenue = getVenueById(venueId);
  const venue =
    adminDraft?.restaurants.find((restaurant) => restaurant.id === fallbackVenue.id) ??
    fallbackVenue;
  const { setSelectedDate, setSelectedVenueId } = useCampaignSelection();
  const venueMatches = useMemo(() => {
    const sourceMatches = adminDraft?.matches ?? getMatchesSortedChronologically();
    return sourceMatches.filter((match) => isMatchAssignedToVenue(match, venue.id));
  }, [adminDraft?.matches, venue.id]);

  const displayMatches = useMemo(
    () =>
      activeDateLabel
        ? getMatchesForDate(activeDateLabel, venueMatches)
        : getNextVenueMatches(VENUE_ONLY_MATCH_LIMIT, venueMatches),
    [activeDateLabel, venueMatches],
  );

  useEffect(() => {
    if (activeDateLabel) setSelectedDate(activeDateLabel);
    if (venueId) setSelectedVenueId(venueId);
  }, [activeDateLabel, venueId, setSelectedDate, setSelectedVenueId]);

  const actionBtnTextStyle = {
    fontSize: "var(--mt-action-btn-font-size)",
    fontWeight: 800 as const,
    fontFamily,
    letterSpacing: isRtl ? undefined : "0.12em",
  };

  const actionBtnStyle = {
    ...actionBtnTextStyle,
    width: "var(--mt-action-btn-width)",
    maxWidth: "100%",
    height: "var(--mt-action-btn-height)",
    borderRadius: scale(8),
  };

  const [isMobileLayout, setIsMobileLayout] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobileLayout(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const matchTimingsCssVars = useMemo(() => {
    if (isMobileLayout) return undefined;

    return {
      "--mt-card-width": CARD_WIDTH,
      "--mt-card-height": CARD_HEIGHT,
      "--mt-card-gap": CARD_GAP,
      "--mt-card-row-padding": CARD_ROW_PADDING_LEFT,
      "--mt-flag-size": FLAG_SIZE,
      "--mt-team-name-max-width": TEAM_NAME_MAX_WIDTH,
      "--mt-date-top": scale(16),
      "--mt-date-font-size": scale(20),
      "--mt-card-pad": scale(60),
      "--mt-match-item-gap": scale(24),
      "--mt-team-name-font-size": TEAM_NAME_FONT_SIZE,
      "--mt-time-badge-width": TIME_BADGE_WIDTH,
      "--mt-time-badge-height": TIME_BADGE_HEIGHT,
      "--mt-time-badge-font-size": TIME_BADGE_FONT_SIZE,
      "--mt-venue-logo-height": VENUE_WHITE_LOGO_HEIGHT,
      "--mt-panel-section-gap": PANEL_SECTION_GAP,
      "--mt-panel-section-gap-lg": PANEL_SECTION_GAP_LG,
      "--mt-panel-inset": scale(48, 0.65),
    } as React.CSSProperties;
  }, [isMobileLayout]);

  const showOtherMatchesButton = activeDateLabel !== null;

  const handleViewOtherMatches = () => {
    setSelectedDate(null);
    router.push(`/match-timings?venue=${encodeURIComponent(venue.id)}`);
  };

  const sectionRef = useRef<HTMLElement>(null);
  const [entranceDone, setEntranceDone] = useState(() => !shouldAnimate());

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    if (!shouldAnimate()) {
      setEntranceDone(true);
      return;
    }

    setEntranceDone(false);
    const ctx = gsap.context(() => {
      const tl = animateMatchTimingsSection(root);
      if (tl) {
        tl.eventCallback("onComplete", () => setEntranceDone(true));
      } else {
        setEntranceDone(true);
      }
    }, root);

    return () => {
      ctx.revert();
      setEntranceDone(false);
    };
  }, [venue.id, isRtl]);

  return (
    <section
      ref={sectionRef}
      className={`match-timings-section ${textClass} relative isolate flex min-h-dvh w-full max-w-full flex-col overflow-x-visible overflow-y-visible bg-[#f5c400]`}
      style={matchTimingsCssVars}
      aria-label="Match timings"
    >
      <Image
        src="/assets/imgs/background-main.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="pointer-events-none absolute inset-0 z-[1] min-h-dvh">
        <Image
          src="/assets/imgs/overlay-bg-vector-new-1.svg"
          alt=""
          fill
          sizes="100vw"
          className="h-full min-h-dvh w-full object-cover object-center"
        />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full max-w-full flex-col overflow-y-visible">
        <div
          className="mx-auto flex w-full min-w-0 max-w-full flex-1 flex-col overflow-y-visible px-[clamp(16px,2.5vw,40px)]"
          style={{ maxWidth: pageMaxWidth, width: "100%" }}
        >
          <SubpageTopBar brandOnEnd>
            <div
              className={`${textClass} flex min-w-0 shrink-0 flex-row items-center`}
              style={{
                maxWidth: scale(
                  isRtl
                    ? MATCH_TIMING_LOGO_AR_WIDTH_PX
                    : MATCH_TIMING_LOGO_EN_WIDTH_PX,
                ),
              }}
            >
              <MatchTimingLogo alt={t.matchTimings.logoAlt} isRtl={isRtl} />
            </div>
          </SubpageTopBar>

          <div className="flex w-full flex-1 flex-col items-center overflow-x-visible pb-[clamp(100px,12vh,140px)] pt-0 lg:justify-start">
            <div
              className="flex w-full min-h-0 flex-1 flex-col items-center justify-center overflow-x-visible max-lg:flex-1 lg:flex-none lg:justify-start"
            >
            <div
              className="match-timings-panel-outer relative mx-auto w-full max-w-full overflow-visible max-[1600px]:!mt-0 min-[1024px]:w-[var(--mt-panel-width)]"
              style={{
                marginTop: logoOverlapIntoPanel(isRtl),
              }}
            >
              <div className="match-timings-panel-wrap relative overflow-visible">
              <div
                className="match-timings-panel relative z-10 w-full overflow-visible max-[1600px]:h-auto min-[1024px]:w-[var(--mt-panel-width)] min-[1601px]:h-[var(--mt-panel-height)] min-[1601px]:min-h-[var(--mt-panel-height)]"
                style={{
                  maxWidth: "100%",
                }}
              >
                <div
                  aria-hidden
                  data-gsap-panel-bg
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                  style={{
                    backgroundColor: PANEL_RED,
                    borderRadius: "20px",
                  }}
                />
                {/* Red-box overlay graphic at 15% opacity */}
                <Image
                  aria-hidden
                  src="/assets/imgs/overlay-bg-vector-red-box.svg"
                  alt=""
                  fill
                  className="pointer-events-none object-cover"
                  style={{
                    // make overlay fully opaque (no translucency)
                    opacity: 1,
                    borderRadius: "20px",
                    zIndex: 5,
                  }}
                />
                <div className="match-timings-panel-inner relative z-10 flex w-full flex-col items-center overflow-visible max-[1600px]:h-auto max-[1600px]:justify-start max-[1600px]:gap-[var(--mt-panel-inset)] min-[1601px]:h-full min-[1601px]:justify-center min-[1601px]:gap-[var(--mt-panel-section-gap-lg)]">
                <Image
                  data-gsap-venue-logo
                  data-venue-id={venue.id}
                  src={venueWhiteLogoSrc(venue)}
                  alt={venue.alt}
                  width={venue.logoWidth}
                  height={venue.logoHeight}
                  unoptimized={venueWhiteLogoSrc(venue).startsWith("data:")}
                  className="h-auto w-auto shrink-0 object-contain"
                  style={{
                    height: isAltVenueWhiteLogo(venue.id)
                      ? "var(--mt-venue-logo-height-alt)"
                      : "var(--mt-venue-logo-height)",
                    width: "auto",
                  }}
                />

                <div
                  data-gsap-match-row
                  className="match-timings-match-row-bleed pointer-events-auto flex w-full min-w-0 shrink-0 items-center justify-center overflow-x-visible overflow-y-visible"
                >
                  <HorizontalMatchScroller
                    matches={displayMatches}
                    scrollToDate={activeDateLabel}
                    isRtl={isRtl}
                    entranceDone={entranceDone}
                  />
                </div>

                <div
                  data-gsap-actions
                  className="flex shrink-0 flex-row flex-wrap items-center justify-center"
                  style={{ gap: "var(--mt-action-btn-gap)" }}
                >
                  <a
                    href={venue.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${laysTextClass} inline-flex shrink-0 items-center justify-center uppercase text-[#E31837] no-underline transition-opacity hover:opacity-90`}
                    style={{
                      ...actionBtnStyle,
                      backgroundColor: LOCATION_YELLOW,
                    }}
                  >
                    {t.matchTimings.openLocation}
                  </a>
                  {showOtherMatchesButton ? (
                    <button
                      type="button"
                      onClick={handleViewOtherMatches}
                      className={`${textClass} inline-flex shrink-0 cursor-pointer items-center justify-center border-0 px-3 text-center uppercase leading-tight text-[#E31837] transition-opacity hover:opacity-90`}
                      style={{
                        ...actionBtnStyle,
                        width: "var(--mt-other-matches-btn-width)",
                        backgroundColor: LOCATION_YELLOW,
                        letterSpacing: isRtl ? undefined : "0.08em",
                      }}
                    >
                      {t.matchTimings.viewOtherMatchesAtLocation}
                    </button>
                  ) : null}
                </div>
                </div>
              </div>

              <div
                className={`pointer-events-none absolute z-20 bottom-0 lg:bottom-[10px] lg:translate-y-1/2 ${
                  isRtl
                    ? "-right-[30px] lg:right-[42px] lg:translate-x-1/2"
                    : "-left-[30px] lg:left-[42px] lg:-translate-x-1/2"
                }`}
                style={{
                  width: "var(--mt-football-size)",
                  height: "var(--mt-football-size)",
                }}
              >
                <div
                  data-gsap-football
                  className="relative size-full will-change-transform"
                >
                  <Image
                    src="/assets/imgs/football.png"
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="210px"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
            </div>

            <div
              data-gsap-full-schedule
              className="match-timings-full-schedule flex w-full shrink-0 justify-center max-lg:mt-[clamp(16px,3vw,24px)]"
              style={{ marginTop: scale(24) }}
            >
              <Link
                href="/full-schedule"
                className={`${laysTextClass} inline-flex shrink-0 items-center justify-center gap-2 uppercase text-white no-underline transition-opacity hover:opacity-90`}
                style={{
                  ...actionBtnTextStyle,
                  width: "var(--mt-action-btn-width)",
                  maxWidth: "100%",
                  height: "var(--mt-action-btn-height)",
                  backgroundColor: SCHEDULE_RED,
                  borderRadius: scale(8),
                }}
              >
                {t.matchTimings.viewFullSchedule}
              </Link>
            </div>
            </div>

            <SponsorBadge variant="hero" />
          </div>
        </div>
      </div>
    </section>
  );
}
