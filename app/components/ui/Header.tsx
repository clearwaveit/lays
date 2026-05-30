"use client";

import CampaignNav from "@/app/components/ui/CampaignNav";
import LanguageSwitcher from "@/app/components/ui/LanguageSwitcher";
import { useLanguage } from "@/app/context/LanguageContext";
import { useTranslations } from "@/app/i18n/useTranslations";
import { gsap } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Header() {
  const pathname = usePathname();
  const { hasCompletedOnboarding, isReady } = useLanguage();
  const { dir, isRtl } = useTranslations();
  const isHome = pathname === "/";
  const isCampaignSubPage =
    pathname === "/where-to-watch" ||
    pathname === "/match-timings" ||
    pathname === "/full-schedule";
  const hideHeaderOnPage =
    pathname === "/where-to-watch" ||
    pathname === "/match-timings" ||
    pathname === "/full-schedule";

  const showHomeLanguage = isHome && isReady && hasCompletedOnboarding;
  const showSubpageNav = !isHome;
  const hiddenOnHomeOnboarding = isHome && isReady && !hasCompletedOnboarding;
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hiddenOnHomeOnboarding) return;
    const el = headerRef.current;
    if (!el || !shouldAnimate()) return;
    gsap.from(el, {
      autoAlpha: 0,
      y: -12,
      duration: 0.5,
      ease: "power3.out",
      clearProps: "opacity,visibility,transform",
    });
  }, [hiddenOnHomeOnboarding, showHomeLanguage, showSubpageNav]);

  if (hiddenOnHomeOnboarding) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      dir={dir}
      className={`pointer-events-none z-50 w-full ${
        hideHeaderOnPage
          ? "hidden"
          : isCampaignSubPage
            ? "relative shrink-0 bg-transparent lg:absolute lg:inset-x-0 lg:top-0 lg:hidden"
            : "absolute inset-x-0 top-0"
      }`}
    >
      <div
        className={`mx-auto w-full p-[clamp(16px,2.5vw,40px)] ${
          isCampaignSubPage ? "max-w-none" : "max-w-[1600px] min-[1601px]:max-w-none"
        }`}
      >
        {showHomeLanguage ? (
          <LanguageSwitcher className="pointer-events-auto w-full justify-end" />
        ) : null}
        {showSubpageNav ? (
          <CampaignNav
            className={`pointer-events-auto ${
              isCampaignSubPage ? "justify-center" : isRtl ? "justify-start" : "justify-end"
            }`}
          />
        ) : null}
      </div>
    </header>
  );
}
