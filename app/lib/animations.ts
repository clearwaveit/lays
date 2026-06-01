"use client";

import { gsap, ScrollTrigger } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";

const EASE_OUT = "power3.out";
const EASE_BACK = "back.out(1.35)";
const DURATION = 0.75;
const STAGGER = 0.1;

function query<T extends Element = Element>(
  root: HTMLElement,
  selector: string,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function fadeUp(
  targets: gsap.TweenTarget,
  vars?: gsap.TweenVars,
): gsap.core.Tween | gsap.core.Timeline | null {
  if (!shouldAnimate()) return null;
  const items = gsap.utils.toArray(targets);
  if (!items.length) return null;
  return gsap.from(items, {
    autoAlpha: 0,
    y: 28,
    duration: DURATION,
    ease: EASE_OUT,
    ...vars,
  });
}

/** Hero home page entrance. */
export function animateHeroSection(root: HTMLElement, isRtl: boolean) {
  if (!shouldAnimate()) return;

  const headline = root.querySelector("[data-gsap-hero-headline]");
  const productMobile = root.querySelector("[data-gsap-hero-product-mobile]");
  const productDesktop = root.querySelector("[data-gsap-hero-product-desktop]");
  const sponsor = root.querySelector("[data-gsap-sponsor]");

  const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

  if (headline) {
    tl.from(headline, {
      autoAlpha: 0,
      y: 36,
      scale: 0.94,
      duration: 0.85,
    });
  }

  const productX = isRtl ? 48 : -48;
  [productMobile, productDesktop].forEach((el, i) => {
    if (!el) return;
    tl.from(
      el,
      {
        autoAlpha: 0,
        x: productX,
        duration: 0.9,
      },
      i === 0 ? "-=0.45" : "-=0.75",
    );
  });

  if (sponsor) {
    tl.from(
      sponsor,
      { autoAlpha: 0, y: 16, duration: 0.5 },
      "-=0.2",
    );
  }
}

/** Hero nav — runs when nav mounts after language onboarding. */
export function animateHeroNav(nav: HTMLElement) {
  const buttons = nav.querySelectorAll("button");
  if (!buttons.length) return null;

  if (!shouldAnimate()) {
    gsap.set(buttons, { autoAlpha: 1, y: 0, clearProps: "transform" });
    return null;
  }

  return gsap.fromTo(
    buttons,
    { autoAlpha: 0, y: 20 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: EASE_BACK,
      clearProps: "transform",
    },
  );
}

/** Where to watch — city panels and venue cards. */
export function animateMatchMapSection(root: HTMLElement) {
  if (!shouldAnimate()) return;

  const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

  const topBar = root.querySelector("[data-gsap-top-bar]");
  if (topBar) {
    tl.from(topBar.children, {
      autoAlpha: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.08,
    });
  }

  const cities = query<HTMLElement>(root, "[data-gsap-city]");
  if (cities.length) {
    tl.from(
      cities,
      {
        autoAlpha: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.18,
      },
      "-=0.25",
    );
  }

  cities.forEach((city, cityIndex) => {
    const cards = city.querySelectorAll(".venue-card");
    if (!cards.length) return;
    tl.from(
      cards,
      {
        autoAlpha: 0,
        scale: 0.92,
        duration: 0.5,
        stagger: 0.06,
        ease: EASE_BACK,
      },
      cityIndex === 0 ? "-=0.35" : "-=0.5",
    );
  });

  const map = root.querySelector("[data-gsap-map]");
  if (map) {
    tl.from(map, { autoAlpha: 0, y: 24, duration: 0.8 }, "-=0.6");
  }

  const sponsor = root.querySelector("[data-gsap-sponsor]");
  if (sponsor) {
    tl.from(sponsor, { autoAlpha: 0, y: 12, duration: 0.45 }, "-=0.35");
  }
}

/** Match timings — unified entrance; returns timeline for onComplete. */
export function animateMatchTimingsSection(root: HTMLElement) {
  if (!shouldAnimate()) return null;

  const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

  const topBar = root.querySelector("[data-gsap-top-bar]");
  if (topBar) {
    tl.fromTo(
      topBar.children,
      { autoAlpha: 0, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.05,
        clearProps: "transform",
      },
    );
  }

  const panelBg = root.querySelector("[data-gsap-panel-bg]");
  if (panelBg) {
    tl.fromTo(
      panelBg,
      { autoAlpha: 0, scale: 0.98 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: EASE_BACK,
        clearProps: "transform",
      },
      "-=0.15",
    );
  }

  const panelParts = [
    root.querySelector("[data-gsap-venue-logo]"),
    root.querySelector("[data-gsap-match-row]"),
    root.querySelector("[data-gsap-actions]"),
  ].filter((el): el is Element => el != null);

  if (panelParts.length) {
    tl.fromTo(
      panelParts,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: EASE_OUT,
        clearProps: "transform",
      },
      "-=0.35",
    );
  }

  const football = root.querySelector("[data-gsap-football]");
  if (football) {
    tl.fromTo(
      football,
      { autoAlpha: 0, scale: 0.85, rotation: 0 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.45,
        ease: EASE_BACK,
      },
      "-=0.4",
    );
    tl.to(
      football,
      {
        rotation: 360,
        duration: 14,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      },
      "<0.15",
    );
  }

  const sponsor = root.querySelector("[data-gsap-sponsor]");
  if (sponsor) {
    tl.fromTo(
      sponsor,
      { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.4, clearProps: "transform" },
      "-=0.2",
    );
  }

  return tl;
}

/** Full schedule — headline, trophy, bracket reveal on scroll. */
export function animateFullScheduleSection(root: HTMLElement) {
  if (!shouldAnimate()) return;

  const tl = gsap.timeline({ defaults: { ease: EASE_OUT } });

  const topBar = root.querySelector("[data-gsap-top-bar]");
  if (topBar) {
    tl.from(topBar.children, {
      autoAlpha: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.08,
    });
  }

  const headline = root.querySelector("[data-gsap-headline]");
  if (headline) {
    tl.fromTo(
      headline,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: EASE_BACK,
        clearProps: "opacity,visibility",
      },
      "-=0.2",
    );
  }

  const trophy = root.querySelector("[data-gsap-trophy]");
  if (trophy) {
    tl.fromTo(
      trophy,
      { autoAlpha: 0, y: 30, scale: 0.9 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        clearProps: "transform",
      },
      "-=0.5",
    );
  }

  const bracket = root.querySelector("[data-gsap-bracket]");
  if (bracket) {
    tl.fromTo(
      bracket,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.6, clearProps: "transform" },
      "-=0.4",
    );
    animateBracketScrollReveal(bracket as HTMLElement);
  }

  const sponsor = root.querySelector("[data-gsap-sponsor]");
  if (sponsor) {
    fadeUp(sponsor, { delay: 0.15 });
  }
}

/** Tournament bracket pills — staggered scroll reveal (desktop); visible immediately on mobile. */
export function animateBracketScrollReveal(bracketRoot: HTMLElement) {
  if (!shouldAnimate()) return;

  const slots = bracketRoot.querySelectorAll("[data-bracket-slot]");
  if (!slots.length) return;

  const useImmediateReveal =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1600px)").matches;

  if (useImmediateReveal) {
    gsap.set(slots, { autoAlpha: 1, scale: 1 });
    return;
  }

  gsap.set(slots, { autoAlpha: 0, scale: 0.88 });

  const scroller =
    bracketRoot.querySelector<HTMLElement>(".full-schedule-match-grid-scroll") ??
    undefined;

  ScrollTrigger.batch(slots, {
    scroller: scroller ?? window,
    start: "top 92%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.55,
        stagger: 0.04,
        ease: EASE_BACK,
        overwrite: true,
      });
    },
  });
}

/** Modal open — backdrop + dialog. */
export function animateModalOpen(
  backdrop: HTMLElement | null,
  dialog: HTMLElement | null,
) {
  if (!shouldAnimate()) return null;

  const tl = gsap.timeline();

  if (backdrop) {
    gsap.set(backdrop, { autoAlpha: 0 });
    tl.to(backdrop, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
  }

  if (dialog) {
    tl.fromTo(
      dialog,
      { autoAlpha: 0, scale: 0.9, y: 24 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: EASE_BACK,
        clearProps: "transform",
      },
      "-=0.12",
    );

    const content = dialog.querySelectorAll(
      "img, a, button, [data-gsap-modal-item]",
    );
    if (content.length) {
      tl.fromTo(
        content,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: EASE_OUT,
          clearProps: "transform",
        },
        "-=0.25",
      );
    }
  }

  return tl;
}

/** Subpage top bar — logo block + nav links. */
export function animateSubpageTopBar(root: HTMLElement) {
  if (!shouldAnimate()) return;
  fadeUp(Array.from(root.children), { stagger: 0.1, duration: 0.65 });
}
