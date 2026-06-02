"use client";

import { useLanguage, type Language } from "@/app/context/LanguageContext";
import {
  cairoFontFamily,
  cairoTextClass,
  laysFontFamily,
  laysTextClass,
} from "@/app/fonts";
import { useMemo } from "react";
import { getTranslations } from "./translations";

export function useTranslations() {
  const { language } = useLanguage();

  return useMemo(() => {
    const isRtl = language === "ar";
    const dir = isRtl ? "rtl" : "ltr";

    return {
      language,
      isRtl,
      dir,
      t: getTranslations(language),
      textClass: isRtl ? cairoTextClass : laysTextClass,
      fontFamily: isRtl ? cairoFontFamily : laysFontFamily,
    };
  }, [language]);
}

export type { Language };
