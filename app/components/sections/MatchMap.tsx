"use client";

import SubpageTopBar from "@/app/components/ui/SubpageTopBar";
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
import { useLanguage } from "@/app/context/LanguageContext";
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
/** Small cards: white (50% opacity) + 50px backdrop blur */
const SMALL_CARD_BG = "rgba(255, 255, 255, 0.5)";
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
  "bla-bla-dubai": 46,
  "mist-dubai": 36,
  "loui-dubai": 36,
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
    gap: ${scaleMobileTablet(10, 0.5)};
  }
  .match-map .venue-grid > .venue-card--large {
    grid-column: 1 / -1;
  }
  .match-map .venue-stack {
    width: 100%;
    gap: ${scaleMobileTablet(16)};
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
    gap: ${scaleFluid(10, 0.5)};
  }
  .match-map .venue-stack {
    gap: ${scaleFluid(16)};
  }
  .match-map .map-image-layer {
    width: ${MAP_IMAGE_WIDTH};
    height: ${MAP_IMAGE_HEIGHT};
    max-width: 100%;
  }
}
`;

const SUBTITLE_FONT_WEIGHT = 700;

const TITLE_BLOCK_WIDTH = scale(625);
const MATCH_MAP_LOGO_EN_SRC = "/assets/imgs/match-map-logo.svg";
const MATCH_MAP_LOGO_AR_SRC = "/assets/imgs/match-map-logo-arabic.svg";
const MATCH_MAP_LOGO_EN_WIDTH_PX = 312;
const MATCH_MAP_LOGO_EN_HEIGHT_PX = 116;
const MATCH_MAP_LOGO_AR_WIDTH_PX = 347;
const MATCH_MAP_LOGO_AR_HEIGHT_PX = 118;
const SUBTITLE_FONT_SIZE = scale(16);
const CITY_FONT_SIZE = scale(57.44);
const CITY_COLUMNS_MARGIN_TOP = scale(80);
const DUBAI_CARD_GAP_PX = 12;
type Venue = VenueModalData & {
  logoWidth: number;
  logoHeight: number;
  large?: boolean;
};

const DUBAI_FEATURED: Venue = {
  id: "mcgettigans-dubai",
  src: "/assets/imgs/company-logo-1-1.svg",
  alt: "McGettigan's",
  logoWidth: 299.14,
  logoHeight: 38,
  locationUrl: "https://www.google.com/maps/search/?api=1&query=McGettigan's+Dubai",
};

const DUBAI_VENUES: Venue[] = [
  {
    id: "bla-bla-dubai",
    src: "/assets/imgs/company-logo-2.svg",
    alt: "Bla Bla",
    logoWidth: 105.07,
    logoHeight: 92.21,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=Bla+Bla+Dubai",
  },
  {
    id: "mist-dubai",
    src: "/assets/imgs/company-logo-3.svg",
    alt: "mist",
    logoWidth: 133.54,
    logoHeight: 85.63,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=mist+Dubai",
  },
  {
    id: "loui-dubai",
    src: "/assets/imgs/company-logo-4.svg",
    alt: "Loui Restaurant & Cafe",
    logoWidth: 137.06,
    logoHeight: 64.21,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Loui+Restaurant+Cafe+Dubai",
  },
  {
    id: "anzeera-dubai",
    src: "/assets/imgs/company-logo-5.svg",
    alt: "Anzeera",
    logoWidth: 189.13,
    logoHeight: 34.32,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=Anzeera+Dubai",
  },
];

const ABU_DHABI_FEATURED: Venue = {
  id: "mcgettigans-abu-dhabi",
  src: "/assets/imgs/company-logo-1-1.svg",
  alt: "McGettigan's",
  logoWidth: 299.14,
  logoHeight: 38,
  locationUrl:
    "https://www.google.com/maps/search/?api=1&query=McGettigan's+Reem+Mall+Abu+Dhabi",
};

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

function MatchMapLogo({
  className = "",
  alt,
}: {
  className?: string;
  alt: string;
}) {
  const { language, isReady } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isArabic = language === "ar";
  const logoWidthPx = isArabic
    ? MATCH_MAP_LOGO_AR_WIDTH_PX
    : MATCH_MAP_LOGO_EN_WIDTH_PX;
  const logoSrc = isArabic ? MATCH_MAP_LOGO_AR_SRC : MATCH_MAP_LOGO_EN_SRC;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isReady) {
    return (
      <span
        aria-hidden
        className={`inline-block shrink-0 ${className}`}
        style={{
          width: scale(
            isArabic ? MATCH_MAP_LOGO_AR_WIDTH_PX : MATCH_MAP_LOGO_EN_WIDTH_PX,
          ),
          height: scale(
            isArabic
              ? MATCH_MAP_LOGO_AR_HEIGHT_PX
              : MATCH_MAP_LOGO_EN_HEIGHT_PX,
          ),
        }}
      />
    );
  }

  return (
    <img
      src={logoSrc}
      alt={alt}
      width={logoWidthPx}
      height={isArabic ? MATCH_MAP_LOGO_AR_HEIGHT_PX : MATCH_MAP_LOGO_EN_HEIGHT_PX}
      decoding="async"
      className={`relative z-10 block max-w-full shrink-0 object-contain ${isArabic ? "object-right" : "object-left"} ${className}`}
      style={{
        width: scale(logoWidthPx),
        height: "auto",
      }}
    />
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
  /** Abu Dhabi: featured only (no small-venue grid) */
  const compact = !hasVenueGrid;
  const cardGapStyle = cardGapPx !== undefined ? { gap: cardGapPx } : undefined;

  const venueGrid = hasVenueGrid ? (
    <div
      className="venue-grid grid w-full grid-cols-2 justify-items-stretch"
      style={cardGapStyle}
    >
      {venues!.map((venue) => (
        <VenueCard
          key={venue.id}
          {...venue}
          onClick={() => onVenueClick(venue)}
        />
      ))}
    </div>
  ) : null;

  return (
    <div
      data-gsap-city
      className="relative flex min-w-0 w-full max-w-full flex-col items-stretch"
      style={{ paddingTop: scale(28, 0.45) }}
    >
      <h2
        className={`${textClass} absolute left-1/2 md:top-6 z-10 -translate-x-1/2 -translate-y-1/2 border border-solid text-center font-extrabold leading-none whitespace-nowrap ${isRtl ? "" : "uppercase"}`}
        style={{
          color: BRAND_RED,
          fontSize: CITY_FONT_SIZE,
          fontFamily,
          borderColor: BORDER_RED,
          borderWidth: BORDER_WIDTH,
          borderRadius: scale(6, 0.5),
          backgroundColor: PANEL_BG,
          padding: "clamp(4px, 0.375vw, 6px) clamp(12px, 1.5vw, 24px)",
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
        }}
      >
        <div
          className={
            compact
              ? "venue-grid grid w-full grid-cols-1 justify-items-stretch lg:hidden"
              : "venue-grid grid w-full grid-cols-2 justify-items-stretch lg:hidden"
          }
          style={cardGapStyle}
        >
          <VenueCard
            {...featured}
            large
            sizedToContent={compact}
            className={compact ? "w-full" : "col-span-2 w-full"}
            onClick={() => onVenueClick(featured)}
          />
          {hasVenueGrid
            ? venues!.map((venue) => (
                <VenueCard
                  key={venue.id}
                  {...venue}
                  onClick={() => onVenueClick(venue)}
                />
              ))
            : null}
        </div>

        <div
          className="venue-stack mt-[clamp(12px,2vw,20px)] hidden w-full flex-col items-stretch md:mt-[clamp(20px,2vw,30px)] lg:flex"
          style={cardGapStyle}
        >
          <VenueCard
            {...featured}
            large
            sizedToContent={compact}
            onClick={() => onVenueClick(featured)}
          />
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
  const dubaiFeatured = useMemo(
    () =>
      visibleRestaurants?.find((restaurant) => restaurant.id === "mcgettigans-dubai") ??
      DUBAI_FEATURED,
    [visibleRestaurants],
  );
  const dubaiVenues = useMemo(
    () =>
      visibleRestaurants
        ?.filter((restaurant) => restaurant.city === "Dubai" && restaurant.id !== dubaiFeatured.id)
        .map((restaurant) => ({ ...restaurant, logoWidth: restaurant.logoWidth, logoHeight: restaurant.logoHeight })) ??
      DUBAI_VENUES,
    [dubaiFeatured.id, visibleRestaurants],
  );
  const abuDhabiFeatured = useMemo(
    () =>
      visibleRestaurants?.find((restaurant) => restaurant.city === "Abu Dhabi") ??
      ABU_DHABI_FEATURED,
    [visibleRestaurants],
  );

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
    setSelectedVenue(venue);
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
                className={`${textClass} flex w-full max-w-full shrink-0 flex-row items-center ${
                  isRtl
                    ? "justify-between gap-[clamp(16px,3vw,48px)]"
                    : "w-fit gap-[clamp(8px,1.5vw,12px)]"
                }`}
                style={{ maxWidth: TITLE_BLOCK_WIDTH }}
              >
                {isRtl ? (
                  <>
                    <MatchMapLogo alt={t.matchMap.logoAlt} />
                    <p
                      className={`${textClass} min-w-0 shrink text-right font-normal leading-snug tracking-normal text-black`}
                      style={{
                        fontSize: SUBTITLE_FONT_SIZE,
                        fontFamily,
                        fontWeight: 400,
                        letterSpacing: 0,
                      }}
                    >
                      <span className="block">{t.matchMap.subtitleLine1}</span>
                      <span className="block">{t.matchMap.subtitleLine2}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <MatchMapLogo alt={t.matchMap.logoAlt} />
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
              style={{ marginTop: CITY_COLUMNS_MARGIN_TOP }}
            >
              <CityColumn
                city={t.matchMap.dubai}
                featured={dubaiFeatured}
                venues={dubaiVenues}
                cardGapPx={DUBAI_CARD_GAP_PX}
                onVenueClick={handleVenueClick}
              />
              <CityColumn
                city={t.matchMap.abuDhabi}
                featured={abuDhabiFeatured}
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
