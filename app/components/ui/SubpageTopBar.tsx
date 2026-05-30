"use client";

import CampaignNav from "@/app/components/ui/CampaignNav";
import { useTranslations } from "@/app/i18n/useTranslations";
import type { ReactNode } from "react";

type SubpageTopBarProps = {
  children: ReactNode;
  className?: string;
  /** RTL subpages: logo/text on the right, nav on the left */
  brandOnEnd?: boolean;
};

export default function SubpageTopBar({
  children,
  className = "",
  brandOnEnd = false,
}: SubpageTopBarProps) {
  const { isRtl, dir } = useTranslations();
  const brandEndLayout = brandOnEnd && isRtl;

  if (brandEndLayout) {
    return (
      <div
        dir={dir}
        data-gsap-top-bar
        className={`pointer-events-auto relative z-30 w-full pt-[clamp(16px,2.5vw,40px)] ${className}`}
      >
        <div className="flex flex-row flex-wrap items-start justify-between gap-[clamp(12px,2vw,32px)]">
          <div className="min-w-0 shrink-0 overflow-visible">{children}</div>
          <CampaignNav className="pointer-events-auto shrink-0 justify-end" />
        </div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      data-gsap-top-bar
      className={`pointer-events-auto relative z-30 w-full pt-[clamp(16px,2.5vw,40px)] ${className}`}
    >
      <div
        className={`flex flex-row items-start justify-between gap-[clamp(12px,2vw,32px)] ${
          isRtl ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`flex min-w-0 flex-1 flex-row items-center overflow-visible gap-[clamp(8px,1.5vw,12px)] ${
            isRtl ? "flex-row-reverse text-right" : ""
          }`}
        >
          {children}
        </div>
        <CampaignNav
          className={`pointer-events-auto shrink-0 ${
            isRtl ? "justify-start" : "justify-end"
          }`}
        />
      </div>
    </div>
  );
}
