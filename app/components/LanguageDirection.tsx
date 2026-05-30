"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { useEffect } from "react";

export default function LanguageDirection() {
  const { language, isReady } = useLanguage();

  useEffect(() => {
    if (!isReady) return;

    const html = document.documentElement;
    const isRtl = language === "ar";

    html.lang = language;
    html.dir = isRtl ? "rtl" : "ltr";
    document.body.classList.toggle("site-rtl", isRtl);
    document.body.classList.toggle("site-ltr", !isRtl);
  }, [language, isReady]);

  return null;
}
