"use client";

import { useLanguage, type Language } from "@/app/context/LanguageContext";
import { useTranslations } from "@/app/i18n/useTranslations";
import {
  cairoFontFamily,
  cairoTextClass,
  laysFontFamily,
  laysTextClass,
  mPlus1FontFamily,
  mPlus1TextClass,
} from "@/app/fonts";
import { useGsapModal } from "@/app/hooks/useGsapModal";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const BRAND_RED = "#E31837";
const DESIGN_WIDTH = 1600;
const MODAL_WIDTH_PX = 555.77;
const MODAL_HEIGHT_PX = 297.29;
const BTN_WIDTH_PX = 251.5;
const BTN_HEIGHT_PX = 66.08;
const BTN_RADIUS_PX = 6;
const TITLE_FONT_SIZE_PX = 42;
const ENGLISH_FONT_SIZE_PX = 16;
const ARABIC_BTN_FONT_SIZE_PX = 20;
const SECTION_GAP_PX = 20;

function scale(px: number, minRatio = 0.5) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const MODAL_WIDTH = scale(MODAL_WIDTH_PX);
const MODAL_HEIGHT = scale(MODAL_HEIGHT_PX);
const BTN_WIDTH = scale(BTN_WIDTH_PX);
const BTN_HEIGHT = scale(BTN_HEIGHT_PX);
const BTN_RADIUS = scale(BTN_RADIUS_PX, 0.65);
const TITLE_FONT_SIZE = scale(TITLE_FONT_SIZE_PX, 0.55);
const ENGLISH_FONT_SIZE = scale(ENGLISH_FONT_SIZE_PX, 0.75);
const ARABIC_BTN_FONT_SIZE = scale(ARABIC_BTN_FONT_SIZE_PX, 0.75);
const SECTION_GAP = scale(SECTION_GAP_PX, 0.6);
const BTN_GAP = scale(12, 0.5);

type LanguageModalProps = {
  open: boolean;
};

export default function LanguageModal({ open }: LanguageModalProps) {
  const { completeOnboarding } = useLanguage();
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const { backdropRef, dialogRef } = useGsapModal(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const selectLanguage = useCallback(
    (lang: Language) => {
      completeOnboarding(lang);
    },
    [completeOnboarding],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative z-[101] box-border flex flex-col items-center justify-center rounded-2xl bg-white shadow-xl"
        style={{
          width: MODAL_WIDTH,
          height: MODAL_HEIGHT,
          maxWidth: "min(92vw, 555.77px)",
          maxHeight: "min(90vh, 297.29px)",
          padding: scale(28, 0.55),
          gap: SECTION_GAP,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
      >
        <p
          id="language-modal-title"
          className={`${laysTextClass} m-0 text-center uppercase leading-none`}
          style={{
            color: BRAND_RED,
            fontFamily: laysFontFamily,
            fontSize: TITLE_FONT_SIZE,
            fontWeight: 800,
          }}
        >
          SELECT LANGUAGE
        </p>

        <p
          className={`${cairoTextClass} m-0 text-center leading-none`}
          style={{
            color: BRAND_RED,
            fontFamily: cairoFontFamily,
            fontSize: TITLE_FONT_SIZE,
            fontWeight: 800,
          }}
          dir="rtl"
        >
          اختر اللغة
        </p>

        <div
          className="flex w-full items-center justify-center"
          style={{ gap: BTN_GAP }}
          role="group"
          aria-label={t.a11y.chooseLanguage}
        >
          <button
            type="button"
            className={`${laysTextClass} box-border flex cursor-pointer items-center justify-center border border-solid border-black bg-white uppercase text-black transition-opacity hover:opacity-80`}
            style={{
              width: BTN_WIDTH,
              height: BTN_HEIGHT,
              borderRadius: BTN_RADIUS,
              borderWidth: 1,
              borderColor: "#000000",
              fontFamily: laysFontFamily,
              fontSize: ENGLISH_FONT_SIZE,
              fontWeight: 800,
            }}
            onClick={() => selectLanguage("en")}
          >
            ENGLISH
          </button>
          <button
            type="button"
            className={`${mPlus1TextClass} box-border flex cursor-pointer items-center justify-center border border-solid border-black bg-white text-black transition-opacity hover:opacity-80`}
            style={{
              width: BTN_WIDTH,
              height: BTN_HEIGHT,
              borderRadius: BTN_RADIUS,
              borderWidth: 1,
              borderColor: "#000000",
              fontFamily: mPlus1FontFamily,
              fontSize: ARABIC_BTN_FONT_SIZE,
              fontWeight: 400,
            }}
            onClick={() => selectLanguage("ar")}
          >
            العربية
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
