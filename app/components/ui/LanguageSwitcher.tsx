"use client";

import { useLanguage, type Language } from "@/app/context/LanguageContext";
import { cairoTextClass, laysTextClass } from "@/app/fonts";
import { useTranslations } from "@/app/i18n/useTranslations";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({
  className = "",
}: LanguageSwitcherProps) {
  const { language, setLanguage, hasCompletedOnboarding } = useLanguage();
  const { t, isRtl, dir } = useTranslations();

  if (!hasCompletedOnboarding) return null;

  const select = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
  };

  const buttonClass = (lang: Language, sizeClass: string) => {
    const active = language === lang;
    const fontClass = lang === "ar" ? cairoTextClass : laysTextClass;
    return `${fontClass} border-none bg-transparent p-0 leading-tight transition-opacity ${sizeClass} ${
      active
        ? "cursor-default font-[800] text-black !opacity-100"
        : "cursor-pointer font-normal text-black opacity-75 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    }`;
  };

  const englishButton = (
    <button
      type="button"
      className={buttonClass("en", "text-[13.51px]")}
      onClick={() => select("en")}
      aria-pressed={language === "en"}
      aria-label={
        language === "en" ? "English selected" : "Switch language to English"
      }
      dir="ltr"
    >
      {t.language.english}
    </button>
  );

  const arabicButton = (
    <button
      type="button"
      className={buttonClass("ar", "text-[20px]")}
      onClick={() => select("ar")}
      aria-pressed={language === "ar"}
      aria-label={
        language === "ar" ? "Arabic selected" : "Switch language to Arabic"
      }
      dir="rtl"
    >
      {t.language.arabic}
    </button>
  );

  const separator = (
    <span className="opacity-50" aria-hidden="true">
      |
    </span>
  );

  return (
    <div
      dir={dir}
      className={`flex items-center gap-[clamp(6px,1vw,12px)] text-[clamp(11px,2.8vw,14px)] leading-tight font-normal text-black !opacity-100 lg:text-[clamp(13px,1.125vw,18px)] ${className}`}
      role="group"
      aria-label={t.a11y.languageSelection}
    >
      {isRtl ? (
        <>
          {arabicButton}
          {separator}
          {englishButton}
        </>
      ) : (
        <>
          {englishButton}
          {separator}
          {arabicButton}
        </>
      )}
    </div>
  );
}
