"use client";

import SubpageTopBar from "@/app/components/ui/SubpageTopBar";
import SubpagePageTitle from "@/app/components/ui/SubpagePageTitle";
import SponsorBadge from "@/app/components/ui/SponsorBadge";
import VenueModal, {
  type VenueModalData,
  type VenueSubtitleImage,
} from "@/app/components/ui/VenueModal";
import {
  laysFontFamily,
  laysTextClass,
  mPlus1FontFamily,
  mPlus1TextClass,
} from "@/app/fonts";
import { useTranslations } from "@/app/i18n/useTranslations";
import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import { resolveDateLabelFromParam } from "@/app/data/matches";
import { getVenueById } from "@/app/data/venues";
import { useGsapScope } from "@/app/hooks/useGsapScope";
import { useAdminCampaignDraft } from "@/app/lib/adminCampaignDraft";
import { animateMatchMapSection } from "@/app/lib/animations";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const BRAND_RED = "#E31837";
const BORDER_RED = "#DF2027";
const PANEL_BG = "#FEE401";
/** Small cards: solid white + 50px backdrop blur */
const SMALL_CARD_BG = "#ffffff";
const SMALL_CARD_BACKDROP_BLUR = "blur(50px)";
const BORDER_WIDTH = 1;
const CARD_BORDER_RADIUS = 10;
const DESIGN_WIDTH = 1600;
const PAGE_MAX_WIDTH = 1470;

/** 1470px at 1600px viewport; scales proportionally on larger/smaller screens */
const pageMaxWidth = `min(100%, ${((PAGE_MAX_WIDTH / DESIGN_WIDTH) * 100).toFixed(4)}vw)`;

/** Caps at design px (1600 viewport baseline) — logos, type, layout */
function scale(px: number, minRatio = 0.45) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

/** Grows above 1600px and shrinks below — design px at exactly 1600px viewport */
function scaleFluid(px: number, minRatio = 0.45) {
  const minPx = Math.round(px * minRatio);
  return `max(${minPx}px, calc(${px} / ${DESIGN_WIDTH} * 100vw))`;
}

const TABLET_MAX_PX = 1023;
/** Small-card logos 2–4 — fixed height on mobile/tablet */
const SMALL_CARD_LOGO_MOBILE_HEIGHTS: Record<string, number> = {
  "anzeera-dubai": 28,
  "amanos-dubai": 40,
  "mist-dubai": 44,
  "lock-stock-jbr-dubai": 52,
  "lock-stock-business-bay-dubai": 52,
  "lock-stock-barsha-heights-dubai": 52,
  "lock-stock-yas-bay-abu-dhabi": 52,
};
const smallCardLogoMobileRules = Object.entries(SMALL_CARD_LOGO_MOBILE_HEIGHTS)
  .map(
    ([id, height]) => `
  .match-map .venue-card--small[data-venue-id="${id}"] .venue-card-logo {
    height: ${height}px !important;
    max-height: ${height}px !important;
    width: auto !important;
  }`,
  )
  .join("");

/** Mobile & tablet (≤1023px): scales with screen, 1024px-wide design baseline */
function scaleMobileTablet(px: number, minRatio = 0.32) {
  const minPx = Math.round(px * minRatio);
  const vw = ((px / (TABLET_MAX_PX + 1)) * 100).toFixed(4);
  const cap = Math.round(px * ((TABLET_MAX_PX + 1) / DESIGN_WIDTH));
  return `clamp(${minPx}px, ${vw}vw, ${cap}px)`;
}

const MAP_IMAGE_WIDTH_PX = 1167.68;
const MAP_IMAGE_HEIGHT_PX = 657.17;
const MAP_IMAGE_WIDTH = scaleFluid(MAP_IMAGE_WIDTH_PX);
const MAP_IMAGE_HEIGHT = scaleFluid(MAP_IMAGE_HEIGHT_PX);

const MATCH_MAP_RESPONSIVE_CSS = `
@media (max-width: ${TABLET_MAX_PX}px) {
  .match-map .venue-card {
    border-radius: ${CARD_BORDER_RADIUS}px;
  }
  .match-map .venue-card--large,
  .match-map .venue-card--small,
  .match-map .venue-card--sized {
    width: 100%;
    max-width: none;
  }
  .match-map .venue-card--large,
  .match-map .venue-card--sized {
    height: auto;
    min-height: ${scaleMobileTablet(150)};
  }
  .match-map .venue-card--small {
    height: ${scaleMobileTablet(163)};
    background-color: ${SMALL_CARD_BG};
    backdrop-filter: ${SMALL_CARD_BACKDROP_BLUR};
    -webkit-backdrop-filter: ${SMALL_CARD_BACKDROP_BLUR};
  }
  .match-map .venue-panel {
    width: 100%;
    padding: ${scaleMobileTablet(16)};
    border-radius: ${scaleMobileTablet(12.9, 0.6)};
  }
  .match-map .venue-grid {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${scaleMobileTablet(6, 0.5)};
  }
  .match-map .venue-grid > .venue-card--large {
    grid-column: 1 / -1;
  }
  .match-map .venue-stack {
    width: 100%;
    gap: ${scaleMobileTablet(8)};
  }
  .match-map .map-image-layer {
    width: min(100%, ${scaleMobileTablet(MAP_IMAGE_WIDTH_PX)});
    height: ${scaleMobileTablet(MAP_IMAGE_HEIGHT_PX)};
  }
  .match-map .venue-card-logo {
    width: auto !important;
    height: auto !important;
    max-width: 88%;
    max-height: 58%;
  }
  ${smallCardLogoMobileRules}
  .match-map .venue-card[data-venue-id="mcgettigans-dubai"] .venue-card-logo,
  .match-map .venue-card[data-venue-id="mcgettigans-abu-dhabi"] .venue-card-logo {
    width: auto !important;
    max-width: 72% !important;
    max-height: 36px !important;
    height: auto !important;
  }
  .match-map .venue-card-subtitle {
    width: auto !important;
    height: auto !important;
    max-width: 90%;
    max-height: 1.25rem;
    flex-shrink: 0;
  }
  .match-map .venue-card--large,
  .match-map .venue-card--sized {
    gap: clamp(6px, 2vw, 10px);
  }
  .match-map[dir="rtl"] [data-gsap-city] {
    padding-top: ${scaleMobileTablet(44, 0.45)};
  }
  .match-map[dir="rtl"] .match-map-city-label {
    line-height: 1.2;
  }
  .match-map[dir="rtl"] .venue-panel {
    padding-top: ${scaleMobileTablet(32, 0.45)};
  }
  .match-map[dir="rtl"] .venue-grid,
  .match-map[dir="rtl"] .venue-stack {
    margin-top: ${scaleMobileTablet(14, 0.45)};
  }
}
@media (min-width: ${TABLET_MAX_PX + 1}px) {
  .match-map .venue-card {
    border-radius: ${CARD_BORDER_RADIUS}px;
  }
  .match-map .venue-card--large,
  .match-map .venue-card--small {
    width: 100%;
  }
  .match-map .venue-card--large {
    max-width: 100%;
    width: 100%;
    height: ${scaleFluid(150)};
  }
  .match-map .venue-card--small {
    max-width: ${scaleFluid(332)};
    height: ${scaleFluid(163)};
    background-color: ${SMALL_CARD_BG};
    backdrop-filter: ${SMALL_CARD_BACKDROP_BLUR};
    -webkit-backdrop-filter: ${SMALL_CARD_BACKDROP_BLUR};
  }
  .match-map .venue-card--sized {
    width: 100%;
    max-width: 100%;
    height: auto;
    min-height: ${scaleFluid(150)};
  }
  .match-map .venue-panel {
    padding: ${scaleFluid(16)};
    border-radius: ${scaleFluid(12.9, 0.6)};
  }
  .match-map .venue-grid {
    gap: ${scaleFluid(6, 0.5)};
  }
  .match-map .venue-stack {
    gap: ${scaleFluid(8)};
  }
  .match-map .venue-card[data-venue-id="mcgettigans-dubai"] .venue-card-logo,
  .match-map .venue-card[data-venue-id="mcgettigans-abu-dhabi"] .venue-card-logo {
    width: ${scaleFluid(280, 0.45)} !important;
    height: auto !important;
    max-width: 82% !important;
  }
  .match-map .map-image-layer {
    width: ${MAP_IMAGE_WIDTH};
    height: ${MAP_IMAGE_HEIGHT};
    max-width: 100%;
  }
  .match-map[dir="rtl"] [data-gsap-city] {
    padding-top: ${scale(44, 0.45)};
  }
  .match-map[dir="rtl"] .match-map-city-label {
    line-height: 1.2;
  }
  .match-map[dir="rtl"] .venue-panel {
    padding-top: ${scale(38)};
  }
  .match-map[dir="rtl"] .venue-grid,
  .match-map[dir="rtl"] .venue-stack {
    margin-top: ${scale(10)};
  }
}
`;

const SUBTITLE_FONT_WEIGHT = 700;

const TITLE_BLOCK_WIDTH_EN = scale(625);
const TITLE_BLOCK_WIDTH_AR = scale(825);
/** Horizontal space between page title and subtitle (English). */
const TITLE_SUBTITLE_GAP = scale(20);
/** Extra space on both sides of Arabic subtitle lines only. */
const SUBTITLE_INLINE_PADDING_AR = scale(16);
const SUBTITLE_FONT_SIZE = scale(16);
/** Arabic match-map subtitle — matches hero / design reference */
const SUBTITLE_FONT_SIZE_AR = "23px";
const SUBTITLE_LINE_HEIGHT_AR = "32px";
const SUBTITLE_FONT_SIZE_AR_LINE2 = "23px";
const SUBTITLE_LINE_HEIGHT_AR_LINE2 = "32px";
const SUBTITLE_FONT_WEIGHT_AR = 800;
const CITY_FONT_SIZE = scale(57.44);
const CITY_COLUMNS_MARGIN_TOP_EN = scale(80);
const CITY_COLUMNS_MARGIN_TOP_AR = scale(96);
const CITY_COLUMN_PADDING_TOP_EN = scale(28, 0.45);
const CITY_COLUMN_PADDING_TOP_AR = scale(44, 0.45);
const VENUE_PANEL_PADDING_TOP_EN = scale(22);
const VENUE_PANEL_PADDING_TOP_AR = scale(38);
const CITY_LABEL_PADDING_EN = "clamp(4px, 0.375vw, 6px) clamp(12px, 1.5vw, 24px)";
const CITY_LABEL_PADDING_AR = "clamp(8px, 0.65vw, 12px) clamp(22px, 2.75vw, 36px)";
const VENUE_CARD_GAP_PX = 6;
const MCGETTIGANS_CARD_LOGO_WIDTH = 280;
const MCGETTIGANS_CARD_LOGO_HEIGHT = 35;
type Venue = VenueModalData & {
  logoWidth: number;
  logoHeight: number;
  large?: boolean;
};

const DUBAI_FEATURED: Venue = {
  id: "mcgettigans-dubai",
  src: "/assets/imgs/mcgettigans.svg",
  alt: "McGettigan's",
  logoWidth: MCGETTIGANS_CARD_LOGO_WIDTH,
  logoHeight: MCGETTIGANS_CARD_LOGO_HEIGHT,
  locationUrl:
    "https://www.google.com/maps/place/Bla+Bla+By+McGettigan's/@25.0743008,55.1292212,17z/data=!4m6!3m5!1s0x3e5f13c4132ac0c9:0x499ffd04a5bb6fe0!8m2!3d25.0743397!4d55.1292427!16s%2Fg%2F11ll4zzfsk?entry=ttu",
};

/** Grid order: row1 R, row2 L/R, row3 L/R, row4 L (after featured McGettigan's). */
const DUBAI_VENUES: Venue[] = [
  {
    id: "anzeera-dubai",
    src: "/assets/imgs/anzeera.svg",
    alt: "Anzeera",
    logoWidth: 190,
    logoHeight: 35,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=Anzeera+Dubai",
  },
  {
    id: "amanos-dubai",
    src: "/assets/imgs/amanos.svg",
    alt: "Amanos",
    logoWidth: 114,
    logoHeight: 63,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=Amanos+Dubai",
  },
  {
    id: "mist-dubai",
    src: "/assets/imgs/mist.svg",
    alt: "mist",
    logoWidth: 120,
    logoHeight: 77,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=mist+Dubai",
  },
  {
    id: "lock-stock-jbr-dubai",
    src: "/assets/imgs/jbr.svg",
    alt: "Lock Stock & Barrel — JBR",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+JBR+Dubai",
  },
  {
    id: "lock-stock-business-bay-dubai",
    src: "/assets/imgs/the-garden.svg",
    alt: "The Garden Project",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/place/The+Garden+Project/@25.067661,55.1616195,17z/data=!3m1!4b1!4m6!3m5!1s0x3e5f6d9554750e63:0xf9035ead0f86eae6!8m2!3d25.067661!4d55.1616195!16s%2Fg%2F11yq931q81?entry=ttu",
  },
  {
    id: "lock-stock-barsha-heights-dubai",
    src: "/assets/imgs/barsha-heights.svg",
    alt: "Lock Stock & Barrel — Barsha Heights",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+Barsha+Heights+Dubai",
  },
];

const ABU_DHABI_FEATURED: Venue = {
  id: "mcgettigans-abu-dhabi",
  src: "/assets/imgs/mcgettigans.svg",
  alt: "McGettigan's",
  logoWidth: MCGETTIGANS_CARD_LOGO_WIDTH,
  logoHeight: MCGETTIGANS_CARD_LOGO_HEIGHT,
  locationUrl:
    "https://www.google.com/maps/search/?api=1&query=McGettigan's+Reem+Mall+Abu+Dhabi",
};

const ABU_DHABI_VENUES: Venue[] = [
  {
    id: "lock-stock-yas-bay-abu-dhabi",
    src: "/assets/imgs/yas-bay.svg",
    alt: "Lock Stock & Barrel — Yas Bay",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+Yas+Bay+Abu+Dhabi",
  },
];

function VenueCard({
  id,
  src,
  alt,
  subtitleImage,
  large,
  logoWidth,
  logoHeight,
  className = "",
  sizedToContent = false,
  onClick,
}: Venue & {
  className?: string;
  /** Abu Dhabi compact panel: explicit width (parent is w-fit) */
  sizedToContent?: boolean;
  onClick: () => void;
}) {
  const logoMinRatio = large ? 0.55 : 0.45;

  return (
    <button
      type="button"
      data-venue-id={id}
      onClick={onClick}
      className={`venue-card box-border flex min-w-0 cursor-pointer flex-col items-center justify-center overflow-hidden border border-solid px-3 py-4 text-left transition-transform hover:scale-[1.02] active:scale-[0.99] lg:shrink-0 lg:px-0 lg:py-0 w-full max-w-full ${large ? "venue-card--large" : "venue-card--small"} ${sizedToContent ? "venue-card--sized" : ""} ${className}`}
      style={{
        borderRadius: CARD_BORDER_RADIUS,
        borderColor: BORDER_RED,
        borderWidth: BORDER_WIDTH,
        ...(large
          ? { backgroundColor: "#ffffff" }
          : {
              backgroundColor: SMALL_CARD_BG,
              backdropFilter: SMALL_CARD_BACKDROP_BLUR,
              WebkitBackdropFilter: SMALL_CARD_BACKDROP_BLUR,
            }),
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={Math.round(logoWidth)}
        height={Math.round(logoHeight)}
        unoptimized={src.startsWith("data:")}
        className="venue-card-logo pointer-events-none h-auto w-auto max-w-[88%] object-contain lg:max-h-[85%] lg:max-w-[90%]"
        style={{
          width: scaleFluid(logoWidth, logoMinRatio),
          height: scaleFluid(logoHeight, logoMinRatio),
          maxWidth: "100%",
        }}
      />
      {/* {subtitleImage ? (
        <Image
          src={subtitleImage.src}
          alt={subtitleImage.alt ?? ""}
          width={Math.round(subtitleImage.width)}
          height={Math.round(subtitleImage.height)}
          draggable={false}
          className="venue-card-subtitle pointer-events-none mt-2 h-auto w-auto max-w-[90%] object-contain max-lg:max-h-5 lg:mt-4"
          style={{
            width: scaleFluid(subtitleImage.width, 0.35),
            height: scaleFluid(subtitleImage.height, 0.35),
          }}
        />
      ) : null} */}
    </button>
  );
}

function CityColumn({
  city,
  featured,
  venues,
  cardGapPx,
  onVenueClick,
}: {
  city: string;
  featured: Venue;
  venues?: Venue[];
  cardGapPx?: number;
  onVenueClick: (venue: VenueModalData) => void;
}) {
  const { textClass, fontFamily, isRtl } = useTranslations();
  const hasVenueGrid = Boolean(venues && venues.length > 0);
  const cardGapStyle = cardGapPx !== undefined ? { gap: cardGapPx } : undefined;

  const allVenues: Venue[] = hasVenueGrid ? [featured, ...(venues ?? [])] : [featured];

  const venueGrid = (
    <div
      className="venue-grid grid w-full grid-cols-2 justify-items-stretch"
      style={cardGapStyle}
    >
      {allVenues.map((venue) => (
        <VenueCard
          key={venue.id}
          {...venue}
          onClick={() => onVenueClick(venue)}
        />
      ))}
    </div>
  );

  const cityColumnPaddingTop = isRtl
    ? CITY_COLUMN_PADDING_TOP_AR
    : CITY_COLUMN_PADDING_TOP_EN;
  const venuePanelPaddingTop = isRtl
    ? VENUE_PANEL_PADDING_TOP_AR
    : VENUE_PANEL_PADDING_TOP_EN;

  return (
    <div
      data-gsap-city
      className="relative flex min-w-0 w-full max-w-full flex-col items-stretch"
      style={{ paddingTop: cityColumnPaddingTop }}
    >
      <h2
        className={`match-map-city-label ${textClass} absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-solid text-center font-extrabold whitespace-nowrap ${isRtl ? "max-md:top-7 md:top-9 leading-[1.2]" : "max-md:top-5 md:top-6 uppercase leading-none"}`}
        style={{
          color: BRAND_RED,
          fontSize: CITY_FONT_SIZE,
          fontFamily,
          borderColor: BORDER_RED,
          borderWidth: BORDER_WIDTH,
          borderRadius: scale(6, 0.5),
          backgroundColor: PANEL_BG,
          padding: isRtl ? CITY_LABEL_PADDING_AR : CITY_LABEL_PADDING_EN,
          boxSizing: "border-box",
        }}
      >
        {city}
      </h2>

      <div
        className="venue-panel box-border w-full border border-solid"
        style={{
          borderColor: BORDER_RED,
          borderWidth: BORDER_WIDTH,
          backgroundColor: PANEL_BG,
          paddingTop: venuePanelPaddingTop,
        }}
      >
        <div
          className={`lg:hidden ${isRtl ? "mt-[clamp(10px,1.5vw,16px)]" : ""}`}
        >
          {venueGrid}
        </div>

        <div
          className={`venue-stack hidden w-full flex-col items-stretch lg:flex ${isRtl ? "mt-[clamp(18px,2.5vw,28px)] md:mt-[clamp(26px,3vw,36px)]" : "mt-[clamp(12px,2vw,20px)] md:mt-[clamp(20px,2vw,30px)]"}`}
          style={cardGapStyle}
        >
          {venueGrid}
        </div>
      </div>
    </div>
  );
}

export default function MatchMap() {
  const { t, textClass, fontFamily, isRtl } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const activeDateLabel = resolveDateLabelFromParam(dateParam);
  const venueParam = searchParams.get("venue");
  const adminDraft = useAdminCampaignDraft();
  const { setSelectedDate, setSelectedVenueId } = useCampaignSelection();
  const [selectedVenue, setSelectedVenue] = useState<VenueModalData | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const visibleRestaurants = useMemo(
    () => adminDraft?.restaurants.filter((restaurant) => restaurant.enabled) ?? null,
    [adminDraft?.restaurants],
  );
  const dubaiFeatured = DUBAI_FEATURED;
  const dubaiVenues = useMemo(() => {
    if (!visibleRestaurants) return DUBAI_VENUES;
    return DUBAI_VENUES.filter((venue) => {
      const draft = visibleRestaurants.find((r) => r.id === venue.id);
      return !draft || draft.enabled;
    });
  }, [visibleRestaurants]);
  const abuDhabiFeatured = ABU_DHABI_FEATURED;
  const abuDhabiVenues = useMemo(() => {
    if (!visibleRestaurants) return ABU_DHABI_VENUES;
    return ABU_DHABI_VENUES.filter((venue) => {
      const draft = visibleRestaurants.find((r) => r.id === venue.id);
      return !draft || draft.enabled;
    });
  }, [visibleRestaurants]);

  useEffect(() => {
    if (activeDateLabel) {
      setActiveDate(activeDateLabel);
      setSelectedDate(activeDateLabel);
    }
  }, [activeDateLabel, setSelectedDate]);

  useEffect(() => {
    if (!venueParam) return;
    const venue =
      visibleRestaurants?.find((restaurant) => restaurant.id === venueParam) ??
      getVenueById(venueParam);
    setSelectedVenue(venue);
    setSelectedVenueId(venue.id);
  }, [venueParam, visibleRestaurants, setSelectedVenueId]);

  const handleVenueClick = (venue: VenueModalData) => {
    const fromDraft = visibleRestaurants?.find((restaurant) => restaurant.id === venue.id);
    setSelectedVenue(fromDraft ?? venue);
    setSelectedVenueId(venue.id);

    const params = new URLSearchParams();
    const date = activeDate ?? activeDateLabel;
    if (date) params.set("date", date);
    params.set("venue", venue.id);
    router.replace(`/where-to-watch?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    setSelectedVenue(null);
  };

  const sectionRef = useGsapScope<HTMLElement>(
    (root) => animateMatchMapSection(root),
    [],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MATCH_MAP_RESPONSIVE_CSS }} />
      <section
        ref={sectionRef}
        dir={isRtl ? "rtl" : "ltr"}
        className={`match-map ${textClass} relative isolate flex min-h-dvh w-full flex-1 flex-col overflow-x-hidden bg-[#f5c400]`}
        aria-label="Match map — where to watch"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/assets/imgs/background-main.svg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div
          aria-hidden
          data-gsap-map
          className="map-image-layer pointer-events-none absolute bottom-0 left-1/2 z-[1] -translate-x-1/2 opacity-90"
        >
          <Image
            src="/assets/imgs/map-img.svg"
            alt=""
            fill
            sizes={`(max-width: 1023px) 100vw, ${Math.round(MAP_IMAGE_WIDTH_PX)}px`}
            className="object-contain object-bottom"
          />
        </div>

        <div className="relative z-10 flex min-h-dvh w-full flex-1 flex-col">
          <div
            className="mx-auto flex w-full flex-1 flex-col"
            style={{ maxWidth: pageMaxWidth, width: "100%" }}
          >
            <SubpageTopBar brandOnEnd>
              <div
                className={`${textClass} flex w-fit max-w-full shrink-0 flex-row items-center`}
                style={{
                  maxWidth: isRtl ? TITLE_BLOCK_WIDTH_AR : TITLE_BLOCK_WIDTH_EN,
                  gap: TITLE_SUBTITLE_GAP,
                }}
              >
                {isRtl ? (
                  <>
                    <SubpagePageTitle title={t.matchMap.pageTitle} isRtl={isRtl} />
                    <p
                      className={`${textClass} min-w-0 shrink text-right font-extrabold tracking-normal text-black`}
                      style={{
                        fontSize: SUBTITLE_FONT_SIZE_AR,
                        lineHeight: SUBTITLE_LINE_HEIGHT_AR,
                        fontFamily,
                        fontWeight: SUBTITLE_FONT_WEIGHT_AR,
                        letterSpacing: 0,
                        paddingInlineStart: SUBTITLE_INLINE_PADDING_AR,
                        paddingInlineEnd: SUBTITLE_INLINE_PADDING_AR,
                      }}
                    >
                      <span className="block">{t.matchMap.subtitleLine1}</span>
                      <span
                        className="block"
                        style={{
                          fontSize: SUBTITLE_FONT_SIZE_AR_LINE2,
                          lineHeight: SUBTITLE_LINE_HEIGHT_AR_LINE2,
                        }}
                      >
                        {t.matchMap.subtitleLine2}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <SubpagePageTitle title={t.matchMap.pageTitle} isRtl={isRtl} />
                    <p
                      className={`${mPlus1TextClass} min-w-0 font-bold uppercase leading-tight tracking-normal text-black`}
                      style={{
                        fontSize: SUBTITLE_FONT_SIZE,
                        fontFamily: mPlus1FontFamily,
                        fontWeight: SUBTITLE_FONT_WEIGHT,
                        letterSpacing: 0,
                      }}
                    >
                      {t.matchMap.subtitle}
                    </p>
                  </>
                )}
              </div>
            </SubpageTopBar>

            <div className="flex w-full flex-1 flex-col pb-[clamp(100px,12vh,140px)] pt-[clamp(12px,2vw,24px)]">
            <div
              className="grid w-full grid-cols-1 items-start gap-y-[clamp(32px,6vw,48px)] lg:grid-cols-2 lg:items-start lg:gap-x-[40px] lg:gap-y-0"
              style={{
                marginTop: isRtl ? CITY_COLUMNS_MARGIN_TOP_AR : CITY_COLUMNS_MARGIN_TOP_EN,
              }}
            >
              <CityColumn
                city={t.matchMap.dubai}
                featured={dubaiFeatured}
                venues={dubaiVenues}
                cardGapPx={VENUE_CARD_GAP_PX}
                onVenueClick={handleVenueClick}
              />
              <CityColumn
                city={t.matchMap.abuDhabi}
                featured={abuDhabiFeatured}
                venues={abuDhabiVenues}
                cardGapPx={VENUE_CARD_GAP_PX}
                onVenueClick={handleVenueClick}
              />
              </div>

              <SponsorBadge variant="hero" />
            </div>
          </div>
        </div>
      </section>

      <VenueModal
        venue={selectedVenue}
        selectedDate={activeDate ?? activeDateLabel}
        onClose={handleCloseModal}
      />
    </>
  );
}
