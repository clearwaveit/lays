"use client";

import FullScheduleMatchGrid from "@/app/components/sections/FullScheduleMatchGrid";
import SubpageTopBar from "@/app/components/ui/SubpageTopBar";
import SubpagePageTitle from "@/app/components/ui/SubpagePageTitle";
import SponsorBadge from "@/app/components/ui/SponsorBadge";
import { useGsapScope } from "@/app/hooks/useGsapScope";
import { useTranslations } from "@/app/i18n/useTranslations";
import { animateFullScheduleSection } from "@/app/lib/animations";
import { useAdminCampaignDraft } from "@/app/lib/adminCampaignDraft";
import Image from "next/image";

const DESIGN_WIDTH = 1600;
const PAGE_MAX_WIDTH = 1600;
const pageMaxWidth = `min(100%, ${((PAGE_MAX_WIDTH / DESIGN_WIDTH) * 100).toFixed(4)}vw)`;

function scale(px: number, minRatio = 0.45) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const TITLE_OVERLAP_INTO_CONTENT_PX = 24;
const GRID_MARGIN_PX = 96;

function titleOverlapIntoContent() {
  return scale(-TITLE_OVERLAP_INTO_CONTENT_PX);
}

function gridMargin() {
  return scale(GRID_MARGIN_PX);
}

export default function Timetable() {
  const { t, textClass, isRtl } = useTranslations();
  const adminDraft = useAdminCampaignDraft();

  const sectionRef = useGsapScope<HTMLElement>(
    (root) => animateFullScheduleSection(root),
    [isRtl],
  );

  return (
    <section
      ref={sectionRef}
      className={`${textClass} relative isolate flex h-full min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden bg-[#f5c400]`}
      aria-label={t.timetable.pageAria}
    >
      <Image
        src="/assets/imgs/background-main.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="pointer-events-none absolute inset-0 z-[1] min-h-dvh min-h-full">
        <Image
          src="/assets/imgs/overlay-bg-vector-new-1.png"
          alt=""
          fill
          sizes="100vw"
          className="h-full w-full object-contain object-center"
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="mx-auto flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col overflow-hidden"
          style={{ maxWidth: pageMaxWidth, width: "100%" }}
        >
          <div className="shrink-0 px-[clamp(16px,2.5vw,40px)]">
            <SubpageTopBar brandOnEnd>
              <div className={`${textClass} flex min-w-0 shrink-0 flex-row items-center`}>
                <SubpagePageTitle
                  title={t.timetable.pageTitle}
                  isRtl={isRtl}
                  overlapMargin={titleOverlapIntoContent()}
                />
              </div>
            </SubpageTopBar>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-0">
            <div
              data-gsap-bracket
              className="timetable-match-grid-slot flex min-h-0 flex-1 flex-col overflow-hidden px-[clamp(16px,2.5vw,40px)]"
              style={{ marginTop: gridMargin(), marginBottom: gridMargin() }}
            >
              <FullScheduleMatchGrid matches={adminDraft?.matches} />
            </div>

            <div className="shrink-0 px-[clamp(16px,2.5vw,40px)] pb-[clamp(16px,2.5vh,32px)] pt-[clamp(12px,2vh,24px)]">
              <SponsorBadge variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
