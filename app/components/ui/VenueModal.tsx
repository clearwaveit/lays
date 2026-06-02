"use client";

import { encodeDateParam } from "@/app/data/matches";
import { laysFontFamily } from "@/app/fonts";
import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";
import Link from "next/link";
import { useGsapModal } from "@/app/hooks/useGsapModal";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DESIGN_WIDTH = 1600;
const MODAL_WIDTH_PX = 555.77;
const MODAL_HEIGHT_PX = 303.11;
const MODAL_RADIUS_PX = 16;
const BTN_WIDTH_PX = 482;
const BTN_HEIGHT_PX = 56.08;
const BTN_RADIUS_PX = 6;
const BTN_FONT_SIZE_PX = 16;
const BTN_LETTER_SPACING_PX = BTN_FONT_SIZE_PX * 0.03;
const BTN_ICON_SIZE_PX = 12.58;
const MODAL_LOGO_WIDTH_PX = 392.73;
const MODAL_LOGO_HEIGHT_PX = 48.9;
/** Company logos 2–4 (Bla Bla, mist, Loui) — taller mark in modal */
const MODAL_LOGO_ALT_HEIGHT_PX = 148;

const LOCATION_BG = "#FEE401";
const SCHEDULE_BG = "#DF2027";

function scale(px: number, minRatio = 0.5) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const MODAL_WIDTH = scale(MODAL_WIDTH_PX);
const MODAL_HEIGHT = scale(MODAL_HEIGHT_PX);
/** Taller popup when logos 2–4 use a larger mark (delta vs logo 1 strip height) */
const MODAL_HEIGHT_ALT_PX =
  MODAL_HEIGHT_PX + (MODAL_LOGO_ALT_HEIGHT_PX - MODAL_LOGO_HEIGHT_PX);
const MODAL_HEIGHT_ALT = scale(MODAL_HEIGHT_ALT_PX);
const MODAL_RADIUS = scale(MODAL_RADIUS_PX, 0.65);
const BTN_WIDTH = scale(BTN_WIDTH_PX);
const BTN_HEIGHT = scale(BTN_HEIGHT_PX);
const BTN_RADIUS = scale(BTN_RADIUS_PX, 0.65);
const BTN_FONT_SIZE = scale(BTN_FONT_SIZE_PX, 0.75);
const MODAL_LOGO_WIDTH = scale(MODAL_LOGO_WIDTH_PX);
const MODAL_LOGO_HEIGHT = scale(MODAL_LOGO_HEIGHT_PX);

const VENUE_LOGO_ALT_IDS = new Set([
  "amanos-dubai",
  "mist-dubai",
  "lock-stock-jbr-dubai",
  "lock-stock-business-bay-dubai",
  "lock-stock-barsha-heights-dubai",
  "lock-stock-yas-bay-abu-dhabi",
]);

function isAltVenueModalLogo(venueId: string) {
  return VENUE_LOGO_ALT_IDS.has(venueId);
}

function getModalShellStyle(venue: VenueModalData) {
  const isAlt = isAltVenueModalLogo(venue.id);
  return {
    width: MODAL_WIDTH,
    height: isAlt ? MODAL_HEIGHT_ALT : MODAL_HEIGHT,
    maxWidth: "calc(100vw - 32px)",
    borderRadius: MODAL_RADIUS,
    padding: scale(36),
  };
}

function getModalLogoStyle(venue: VenueModalData) {
  if (isAltVenueModalLogo(venue.id)) {
    const aspect = venue.logoWidth / venue.logoHeight;
    const heightPx = MODAL_LOGO_ALT_HEIGHT_PX;
    const widthPx = heightPx * aspect;
    return {
      width: scale(widthPx, 0.58),
      height: scale(heightPx, 0.58),
      maxWidth: "92%",
    };
  }

  return {
    width: MODAL_LOGO_WIDTH,
    height: MODAL_LOGO_HEIGHT,
    maxWidth: "100%",
  };
}

export type VenueSubtitleImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

export type VenueModalData = {
  id: string;
  src: string;
  alt: string;
  subtitleImage?: VenueSubtitleImage;
  logoWidth: number;
  logoHeight: number;
  locationUrl: string;
};

type VenueModalProps = {
  venue: VenueModalData | null;
  selectedDate?: string | null;
  onClose: () => void;
};

function CalendarIcon() {
  return (
    <svg
      width={BTN_ICON_SIZE_PX}
      height={BTN_ICON_SIZE_PX}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 3v4M16 3v4M3 11h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function VenueModal({
  venue,
  selectedDate,
  onClose,
}: VenueModalProps) {
  const { t, textClass, fontFamily, isRtl } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const lastCloseRef = useRef(0);
  const open = venue !== null;
  const { backdropRef, dialogRef } = useGsapModal(open);

  const btnTextStyle = {
    fontSize: BTN_FONT_SIZE,
    fontWeight: 800 as const,
    fontFamily,
    letterSpacing: isRtl ? undefined : `${BTN_LETTER_SPACING_PX}px`,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const closeSafely = useCallback(() => {
    const now = Date.now();
    if (now - lastCloseRef.current < 350) return;
    lastCloseRef.current = now;
    onClose();
  }, [onClose]);

  if (!mounted || !venue) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex touch-manipulation items-center justify-center p-4"
      role="presentation"
      onClick={closeSafely}
    >
      <div ref={backdropRef} className="absolute inset-0 bg-black/45" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="venue-modal-title"
        className={`${textClass} venue-modal relative box-border flex flex-col items-center justify-center bg-white shadow-2xl ${
          isAltVenueModalLogo(venue.id) ? "venue-modal--alt" : ""
        }`}
        style={getModalShellStyle(venue)}
        onClick={(event) => event.stopPropagation()}
        onPointerUp={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeSafely}
          className={`absolute top-3 flex h-8 w-8 touch-manipulation items-center justify-center text-black [-webkit-tap-highlight-color:transparent] ${isRtl ? "left-3 right-auto" : "right-3 left-auto"}`}
          style={{ touchAction: "manipulation" }}
          aria-label={t.a11y.close}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 id="venue-modal-title" className="sr-only">
          {venue.alt}
        </h2>

        <div className="venue-modal-content flex w-full flex-col items-center">
          <div className="venue-modal-logo-wrap flex w-full flex-col items-center">
            <Image
              src={venue.src}
              alt={venue.alt}
              width={Math.round(
                isAltVenueModalLogo(venue.id)
                  ? MODAL_LOGO_ALT_HEIGHT_PX * (venue.logoWidth / venue.logoHeight)
                  : MODAL_LOGO_WIDTH_PX,
              )}
              height={Math.round(
                isAltVenueModalLogo(venue.id)
                  ? MODAL_LOGO_ALT_HEIGHT_PX
                  : MODAL_LOGO_HEIGHT_PX,
              )}
              unoptimized={venue.src.startsWith("data:")}
              draggable={false}
              data-venue-id={venue.id}
              className={`pointer-events-none h-auto w-auto object-contain ${
                isAltVenueModalLogo(venue.id)
                  ? "venue-modal-logo venue-modal-logo--alt max-w-[92%]"
                  : "venue-modal-logo max-w-full"
              }`}
              style={getModalLogoStyle(venue)}
            />
            {/* {venue.subtitleImage ? (
              <Image
                src={venue.subtitleImage.src}
                alt={venue.subtitleImage.alt ?? ""}
                width={Math.round(venue.subtitleImage.width)}
                height={Math.round(venue.subtitleImage.height)}
                draggable={false}
                className="pointer-events-none mt-1.5 h-auto w-auto max-w-full object-contain object-left"
                style={{
                  width: scale(venue.subtitleImage.width, 0.4),
                  height: scale(venue.subtitleImage.height, 0.4),
                }}
              />
            ) : null} */}
          </div>

          <div className="venue-modal-actions flex w-full flex-col items-center">
          <a
            href={venue.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textClass} flex w-full touch-manipulation items-center justify-center gap-2 text-black no-underline [-webkit-tap-highlight-color:transparent] ${isRtl ? "" : "uppercase"}`}
            style={{
              ...btnTextStyle,
              width: BTN_WIDTH,
              maxWidth: "100%",
              height: BTN_HEIGHT,
              borderRadius: BTN_RADIUS,
              backgroundColor: LOCATION_BG,
              touchAction: "manipulation",
            }}
          >
            {t.venueModal.openLocation}
            {/* <Image
              src="/assets/imgs/location-icon.png"
              alt=""
              width={Math.round(BTN_ICON_SIZE_PX)}
              height={Math.round(BTN_ICON_SIZE_PX)}
              className="shrink-0 object-contain"
              style={{
                width: `${BTN_ICON_SIZE_PX}px`,
                height: `${BTN_ICON_SIZE_PX}px`,
              }}
              aria-hidden
            /> */}
          </a>

          <Link
            href={
              selectedDate
                ? `/match-timings?venue=${encodeURIComponent(venue.id)}&date=${encodeDateParam(selectedDate)}`
                : `/match-timings?venue=${encodeURIComponent(venue.id)}`
            }
            onClick={closeSafely}
            className={`${textClass} flex w-full touch-manipulation items-center justify-center gap-2 text-white no-underline [-webkit-tap-highlight-color:transparent] ${isRtl ? "" : "uppercase"}`}
            style={{
              ...btnTextStyle,
              width: BTN_WIDTH,
              maxWidth: "100%",
              height: BTN_HEIGHT,
              borderRadius: BTN_RADIUS,
              backgroundColor: SCHEDULE_BG,
              touchAction: "manipulation",
            }}
          >
            {t.venueModal.viewMatchSchedule}
            {/* <CalendarIcon /> */}
          </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
