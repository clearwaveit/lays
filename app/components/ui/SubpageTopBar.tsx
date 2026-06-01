"use client";

import CampaignNav from "@/app/components/ui/CampaignNav";
import SubpageBackButton from "@/app/components/ui/SubpageBackButton";
import { useTranslations } from "@/app/i18n/useTranslations";
import type { ReactNode } from "react";

type SubpageTopBarProps = {
  children: ReactNode;
  className?: string;
  /** RTL subpages: logo/text on the right, nav on the left */
  brandOnEnd?: boolean;
};

function TitleRow({
  children,
  isRtl,
}: {
  children: ReactNode;
  isRtl: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-row items-center overflow-visible gap-[clamp(12px,2vw,20px)] ${
        isRtl ? "flex-row-reverse" : ""
      }`}
    >
      <SubpageBackButton />
      {children}
    </div>
  );
}

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
          <TitleRow isRtl={isRtl}>{children}</TitleRow>
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
        <TitleRow isRtl={isRtl}>{children}</TitleRow>
        <CampaignNav
          className={`pointer-events-auto shrink-0 ${
            isRtl ? "justify-start" : "justify-end"
          }`}
        />
      </div>
    </div>
  );
}
