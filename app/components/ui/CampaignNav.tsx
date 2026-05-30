"use client";

import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import { useTranslations } from "@/app/i18n/useTranslations";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";

const BRAND_RED = "#E31837";
const DESIGN_WIDTH = 1600;
const NAV_FONT_SIZE = 12.98;

type NavAction = "when-to-watch" | "where-to-watch" | "full-schedule";

function scale(px: number, minRatio = 0.5) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const HERO_BTN_WIDTH_PX = 652;
const HERO_BTN_HEIGHT_PX = 56.08;
const HERO_BTN_FONT_SIZE_PX = 16;
/** Full width on mobile; caps at design width on large screens */
const HERO_BTN_WIDTH = `min(100%, ${scale(HERO_BTN_WIDTH_PX)})`;
const HERO_BTN_HEIGHT = `clamp(36px, 3.2vw, ${HERO_BTN_HEIGHT_PX}px)`;
const HERO_BTN_FONT_SIZE = `clamp(10px, 3.2vw, ${HERO_BTN_FONT_SIZE_PX}px)`;
const HERO_BTN_PADDING_X = "clamp(8px, 2vw, 16px)";
const HERO_BTN_PADDING_Y = "clamp(5px, 1.2vw, 12px)";
const HERO_BTN_GAP = "clamp(6px, 1vw, 12px)";
const HERO_BTN_BG = "#FFED22";
const HERO_BTN_BORDER = "rgba(0, 0, 0, 0.15)";

const navFontSize = `clamp(10px, ${((NAV_FONT_SIZE / DESIGN_WIDTH) * 100).toFixed(4)}vw, ${NAV_FONT_SIZE}px)`;

function NavLinkLabel({ label }: { label: string }) {
  const spaceIndex = label.indexOf(" ");
  if (spaceIndex === -1) {
    return <span className="font-bold">{label}</span>;
  }

  return (
    <>
      <span className="font-bold">{label.slice(0, spaceIndex)}</span>
      <span className="font-normal">{label.slice(spaceIndex)}</span>
    </>
  );
}

function NavLinks({
  onNavigate,
  linkClassName = "",
  heroButtonStyles,
}: {
  onNavigate?: () => void;
  linkClassName?: string;
  heroButtonStyles?: CSSProperties;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { openWhenToWatchModal } = useCampaignSelection();
  const { t, isRtl, textClass, fontFamily } = useTranslations();
  const isHero = Boolean(heroButtonStyles);

  const navItems: { action: NavAction; label: string }[] = [
    { action: "where-to-watch", label: t.nav.whereToWatch },
    { action: "when-to-watch", label: t.nav.whenToWatch },
    { action: "full-schedule", label: t.nav.seeFullSchedule },
  ];

  const handleAction = (action: NavAction) => {
    onNavigate?.();

    if (action === "when-to-watch") {
      openWhenToWatchModal();
      return;
    }

    if (action === "where-to-watch") {
      router.push("/where-to-watch");
      return;
    }

    if (action === "full-schedule") {
      router.push("/full-schedule");
    }
  };

  const prefetchAction = (action: NavAction) => {
    if (action === "where-to-watch") {
      router.prefetch("/where-to-watch");
      return;
    }

    if (action === "full-schedule") {
      router.prefetch("/full-schedule");
    }
  };

  return (
    <>
      {navItems.map((link) => {
        const isWhereActive = pathname === "/where-to-watch";
        const isWhenActive = pathname === "/match-timings";
        const isScheduleActive = pathname === "/full-schedule";
        const active =
          (link.action === "where-to-watch" && isWhereActive) ||
          (link.action === "when-to-watch" && isWhenActive) ||
          (link.action === "full-schedule" && isScheduleActive);

        const baseLinkClassName = `${textClass} cursor-pointer border-none text-center leading-tight no-underline transition-opacity hover:opacity-80 ${isHero ? "font-extrabold tracking-normal" : `${isRtl ? "tracking-normal" : "uppercase tracking-[0.25em]"} hover:opacity-70`} ${linkClassName} ${
          active ? "" : "text-black"
        }`;

        const style: CSSProperties = {
          ...(isHero
            ? {
                ...heroButtonStyles,
                fontFamily,
              }
            : {
                fontSize: navFontSize,
                fontFamily,
              }),
          ...(active ? { color: BRAND_RED } : {}),
        };

        const labelContent = isHero ? (
          <span>{link.label}</span>
        ) : isRtl ? (
          link.label
        ) : (
          <NavLinkLabel label={link.label} />
        );

        return (
          <button
            key={link.action}
            type="button"
            className={baseLinkClassName}
            style={style}
            aria-current={active ? "page" : undefined}
            onMouseEnter={() => prefetchAction(link.action)}
            onFocus={() => prefetchAction(link.action)}
            onClick={() => handleAction(link.action)}
          >
            {labelContent}
          </button>
        );
      })}
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

type CampaignNavProps = {
  className?: string;
  variant?: "header" | "hero";
  "data-gsap-hero-nav"?: string;
};

export default function CampaignNav({
  className = "",
  variant = "header",
  ...rest
}: CampaignNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isRtl, dir, textClass, fontFamily, t } = useTranslations();

  const heroButtonStyle: CSSProperties = {
    width: "100%",
    maxWidth: HERO_BTN_WIDTH,
    height: HERO_BTN_HEIGHT,
    minHeight: HERO_BTN_HEIGHT,
    fontSize: HERO_BTN_FONT_SIZE,
    lineHeight: 1.2,
    fontWeight: 800,
    fontFamily,
    backgroundColor: HERO_BTN_BG,
    borderColor: HERO_BTN_BORDER,
    paddingLeft: HERO_BTN_PADDING_X,
    paddingRight: HERO_BTN_PADDING_X,
    paddingTop: HERO_BTN_PADDING_Y,
    paddingBottom: HERO_BTN_PADDING_Y,
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (variant === "hero") {
    return (
      <nav
        dir={dir}
        {...rest}
        className={`flex w-full flex-col ${className}`}
        style={{ gap: HERO_BTN_GAP }}
        aria-label={t.a11y.campaignNav}
      >
        <NavLinks
          linkClassName="box-border flex w-full max-w-full items-center justify-center rounded-md border border-solid whitespace-normal"
          heroButtonStyles={heroButtonStyle}
        />
      </nav>
    );
  }

  return (
    <>
      <nav
        dir={dir}
        className={`hidden flex-row flex-wrap items-start justify-end gap-[clamp(16px,4vw,64px)] lg:flex ${className}`}
        aria-label={t.a11y.campaignNav}
      >
        <NavLinks
          linkClassName={`whitespace-nowrap bg-transparent ${isRtl ? "text-right" : "text-left"}`}
        />
      </nav>

      <div dir={dir} className={`relative shrink-0 lg:hidden ${className}`}>
        <button
          type="button"
          className={`${textClass} pointer-events-auto flex cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1 text-black transition-opacity hover:opacity-70`}
          aria-expanded={menuOpen}
          aria-controls="campaign-mobile-menu"
          aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <HamburgerIcon open={menuOpen} />
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[60] cursor-default bg-black/40"
              aria-label={t.a11y.closeMenu}
              onClick={() => setMenuOpen(false)}
            />
            <nav
              id="campaign-mobile-menu"
              dir={dir}
              className={`${textClass} fixed top-[clamp(56px,14vw,72px)] z-[70] flex min-w-[min(100vw-24px,280px)] flex-col gap-5 rounded-lg border border-solid bg-[#FEE401] p-5 shadow-lg ${
                isRtl
                  ? "left-[clamp(12px,3vw,24px)] right-auto"
                  : "right-[clamp(12px,3vw,24px)] left-auto"
              }`}
              style={{ borderColor: BRAND_RED }}
              aria-label={t.a11y.campaignNav}
            >
              <NavLinks
                linkClassName={`whitespace-normal bg-transparent tracking-[0.2em] ${isRtl ? "text-right" : "text-left"}`}
                onNavigate={() => setMenuOpen(false)}
              />
            </nav>
          </>
        ) : null}
      </div>
    </>
  );
}
