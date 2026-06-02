"use client";

import CampaignNav from "@/app/components/ui/CampaignNav";
import SponsorBadge from "@/app/components/ui/SponsorBadge";
import { useLanguage } from "@/app/context/LanguageContext";
import { animateHeroNav, animateHeroSection } from "@/app/lib/animations";
import { gsap } from "@/app/lib/gsap";
import { useGsapScope } from "@/app/hooks/useGsapScope";
import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";
import { useEffect } from "react";

const HERO_HEADLINE_EN = "/assets/imgs/lays-img-2-new-1.svg";
const HERO_HEADLINE_AR = "/assets/imgs/lays-img-arabic-2-new-1.svg";
const HERO_PRODUCT_EN = "/assets/imgs/lays-img-1.png";
const HERO_PRODUCT_AR = "/assets/imgs/lays-img-arabic.png";

export default function LaysHero() {
  const { hasCompletedOnboarding, isReady } = useLanguage();
  const { isRtl, dir, t, textClass, fontFamily } = useTranslations();

  const showHeroNav = isReady && hasCompletedOnboarding;

  const sectionRef = useGsapScope<HTMLElement>(
    (root) => animateHeroSection(root, isRtl),
    [isRtl],
  );

  useEffect(() => {
    const root = sectionRef.current;
    if (!root || !showHeroNav) return;

    const nav = root.querySelector<HTMLElement>("[data-gsap-hero-nav]");
    if (!nav) return;

    const buttons = nav.querySelectorAll("button");

    const ctx = gsap.context(() => {
      animateHeroNav(nav);
    }, nav);

    return () => {
      ctx.revert();
      if (buttons.length) {
        gsap.set(buttons, { autoAlpha: 1, visibility: "visible" });
      }
    };
  }, [showHeroNav, sectionRef]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#f5c400] max-lg:h-dvh max-lg:max-h-dvh lg:h-dvh lg:min-h-[640px]"
      aria-label="Lay's campaign hero"
    >
      <Image
        src="/assets/imgs/background-main.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        data-gsap-hero-product-desktop
        className={`pointer-events-none absolute inset-y-0 z-[5] hidden h-full overflow-hidden lg:flex lg:items-end lg:max-[1599px]:items-end min-[1600px]:items-stretch ${
          isRtl
            ? "right-0 left-auto justify-end"
            : "left-0 justify-start"
        }`}
      >
        <Image
          src={isRtl ? HERO_PRODUCT_AR : HERO_PRODUCT_EN}
          alt="Hand holding a bag of Lay's chili chips"
          width={914}
          height={900}
          sizes="58vw"
          className={`block max-w-none object-contain lg:max-[1599px]:h-auto lg:max-[1599px]:w-[57.125vw] lg:max-[1599px]:max-h-full min-[1600px]:h-full min-[1600px]:w-auto ${
            isRtl ? "object-right" : "object-left"
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] flex-col max-lg:max-h-dvh max-lg:px-0 max-lg:pb-0 min-[1601px]:max-w-none lg:p-[clamp(16px,2.5vw,40px)]">
        <div className="relative flex min-h-0 flex-1 flex-col max-lg:h-full max-lg:overflow-hidden max-md:pb-[min(52dvh,520px)] max-lg:gap-0 lg:gap-6 lg:pt-[clamp(40px,6vw,72px)]">
          <div
            className={`relative z-20 flex w-full shrink-0 flex-col justify-center max-lg:order-1 max-lg:px-3 max-md:px-[clamp(16px,2.5vw,40px)] max-md:pt-[clamp(64px,15vh,84px)] max-md:pb-[clamp(10px,2.5vh,20px)] md:max-lg:pt-14 md:max-lg:pb-2 lg:absolute lg:top-1/2 lg:w-auto lg:max-w-none lg:-translate-y-1/2 lg:px-2 lg:pt-0 ${
              isRtl
                ? "items-center lg:left-[64px] lg:right-auto"
                : "items-center lg:right-[64px] lg:left-auto"
            }`}
          >
            <Image
              data-gsap-hero-headline
              src={isRtl ? HERO_HEADLINE_AR : HERO_HEADLINE_EN}
              alt={t.hero.headlineAlt}
              width={isRtl ? 556 : 767}
              height={isRtl ? 309 : 322}
              priority
              sizes="(max-width: 1023px) 90vw, 48vw"
              className={`h-auto w-full max-w-none object-contain max-md:max-h-[17vh] max-md:max-w-[86vw] md:max-lg:max-h-[20vh] md:max-lg:max-w-[92vw] lg:h-[20.133vw] lg:max-h-none lg:max-w-none lg:w-auto ${
                isRtl ? "lg:origin-left" : "lg:w-[47.892vw] lg:origin-right"
              }`}
            />

            <p
              data-gsap-hero-description
              dir={dir}
              className={`${textClass} mx-auto mt-[clamp(10px,1.4vw,20px)] w-full max-w-[min(92vw,36rem)] text-center tracking-normal text-black lg:max-w-[min(47.892vw,36rem)]`}
              style={{
                fontFamily,
                fontSize: "26.28px",
                fontWeight: 800,
                lineHeight: "36.49px",
              }}
            >
              <span className="block">{t.hero.descriptionLine1}</span>
              <span className="block">{t.hero.descriptionLine2}</span>
            </p>

            {showHeroNav ? (
              <CampaignNav
                variant="hero"
                data-gsap-hero-nav=""
                className="pointer-events-auto mt-[clamp(8px,1.2vw,24px)] flex w-full max-w-full items-center justify-center px-[clamp(16px,4vw,0px)] lg:mt-[clamp(12px,1.8vw,28px)] lg:max-w-[652px] lg:px-0"
              />
            ) : null}
          </div>

          <div
            data-gsap-hero-product-mobile
            className={`z-10 flex w-full min-h-0 items-end overflow-hidden max-lg:order-2 max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[min(52dvh,520px)] md:max-lg:relative md:max-lg:flex-1 md:max-lg:max-h-none md:max-lg:justify-center lg:hidden ${
              isRtl ? "justify-end" : "justify-start"
            }`}
          >
            <Image
              src={isRtl ? HERO_PRODUCT_AR : HERO_PRODUCT_EN}
              alt="Hand holding a bag of Lay's chili chips"
              width={914}
              height={900}
              sizes="100vw"
              className={`max-h-full max-w-full object-contain max-md:h-auto max-md:max-h-[min(52dvh,520px)] max-md:w-full md:max-lg:h-full md:max-lg:w-full md:max-lg:max-h-full md:max-lg:object-cover ${
                isRtl ? "object-right-bottom" : "object-left-bottom"
              }`}
            />
          </div>
        </div>

        <SponsorBadge variant="hero" />
      </div>
    </section>
  );
}
