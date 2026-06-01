"use client";

import SubpageTopBar from "@/app/components/ui/SubpageTopBar";
import SubpagePageTitle from "@/app/components/ui/SubpagePageTitle";
import SponsorBadge from "@/app/components/ui/SponsorBadge";
import TournamentBracket from "@/app/components/sections/TournamentBracket";
import { laysFontFamily, laysTextClass } from "@/app/fonts";
import { useTranslations } from "@/app/i18n/useTranslations";
import { useGsapScope } from "@/app/hooks/useGsapScope";
import { animateFullScheduleSection } from "@/app/lib/animations";
import { useAdminCampaignDraft } from "@/app/lib/adminCampaignDraft";
import Image from "next/image";

const HEADLINE_RED = "#DF2027";
const DESIGN_WIDTH = 1600;
const PAGE_MAX_WIDTH = 1600;
const pageMaxWidth = `min(100%, ${((PAGE_MAX_WIDTH / DESIGN_WIDTH) * 100).toFixed(4)}vw)`;

function scale(px: number, minRatio = 0.45) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const TITLE_OVERLAP_INTO_CONTENT_PX = 24;

function titleOverlapIntoContent() {
  return scale(-TITLE_OVERLAP_INTO_CONTENT_PX);
}

const OVERLAY_INSET = scale(76);
const HEADLINE_MARGIN_TOP = scale(100);
const HEADLINE_WIDTH = scale(558);
const HEADLINE_LINE1_FONT_SIZE = scale(53.77);
const HEADLINE_LINE2_FONT_SIZE = scale(89.87);
const HEADLINE_ROTATE_DEG = -9.87;
const TROPHY_IMG = "/assets/imgs/trophy.svg";
const TROPHY_WIDTH_PX = 78.65;
const TROPHY_HEIGHT_PX = 206.44;
const TROPHY_TOP = scale(367);

export default function FullSchedule() {
  const { t, textClass, isRtl } = useTranslations();
  const adminDraft = useAdminCampaignDraft();

  const sectionRef = useGsapScope<HTMLElement>(
    (root) => animateFullScheduleSection(root),
    [isRtl],
  );

  return (
    <section
      ref={sectionRef}
      className={`${textClass} relative isolate flex min-h-dvh w-full max-w-full flex-1 flex-col overflow-x-visible overflow-y-visible bg-[#f5c400]`}
      aria-label={t.fullSchedule.pageAria}
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
        className="pointer-events-none absolute z-[1]"
        style={{
          top: OVERLAY_INSET,
          right: OVERLAY_INSET,
          bottom: OVERLAY_INSET,
          left: OVERLAY_INSET,
        }}
      >
        <Image
          src="/assets/imgs/overlay-bg-vector-new-1.svg"
          alt=""
          width={1411}
          height={1301}
          sizes="100vw"
          className="absolute inset-x-0 top-0 mx-auto h-auto w-full object-contain object-top"
        />
      </div>

      <div
        data-gsap-trophy
        className="pointer-events-none absolute left-1/2 z-[8] -translate-x-1/2 max-[1599px]:top-[clamp(178px,32vw,248px)] max-[1599px]:h-[clamp(54px,13vw,80px)] max-[1599px]:w-[clamp(21px,5vw,30px)] min-[1600px]:z-[15]"
        style={{
          top: TROPHY_TOP,
          width: TROPHY_WIDTH_PX,
          height: TROPHY_HEIGHT_PX,
        }}
      >
        <Image
          src={TROPHY_IMG}
          alt="FIFA World Cup trophy"
          width={TROPHY_WIDTH_PX}
          height={TROPHY_HEIGHT_PX}
          className="h-full w-full object-contain object-bottom"
          sizes="(max-width: 1599px) 30px, 79px"
        />
      </div>

      <div className="relative z-10 flex w-full max-w-full flex-col overflow-x-visible overflow-y-visible">
        <div
          className="mx-auto flex w-full min-w-0 max-w-full flex-col overflow-x-visible"
          style={{ maxWidth: pageMaxWidth, width: "100%" }}
        >
          <div className="px-[clamp(16px,2.5vw,40px)]">
            <SubpageTopBar brandOnEnd>
              <div className={`${textClass} flex min-w-0 shrink-0 flex-row items-center`}>
                <SubpagePageTitle
                  title={t.fullSchedule.pageTitle}
                  isRtl={isRtl}
                  overlapMargin={titleOverlapIntoContent()}
                />
              </div>
            </SubpageTopBar>
          </div>

          <div className="flex w-full flex-1 flex-col items-center overflow-x-visible overflow-y-visible pb-[clamp(100px,12vh,140px)] pt-0">
            <div
              className="flex w-full flex-col items-center px-[clamp(16px,2.5vw,40px)]"
              style={{ marginTop: titleOverlapIntoContent() }}
            >
              <h2
                data-gsap-headline
                className={`${laysTextClass} shrink-0 text-center font-extrabold uppercase leading-none max-[1599px]:!mt-[clamp(48px,12vw,80px)]`}
                aria-label={`${t.fullSchedule.headlineLine1} ${t.fullSchedule.headlineLine2}`}
                style={{
                  marginTop: HEADLINE_MARGIN_TOP,
                  marginBottom: scale(8),
                  width: HEADLINE_WIDTH,
                  maxWidth: "100%",
                  fontWeight: 800,
                  fontFamily: laysFontFamily,
                  color: HEADLINE_RED,
                  transform: `rotate(${HEADLINE_ROTATE_DEG}deg)`,
                }}
              >
                <span
                  className="block"
                  style={{ fontSize: HEADLINE_LINE1_FONT_SIZE }}
                >
                  {t.fullSchedule.headlineLine1}
                </span>
                <span
                  className="block"
                  style={{ fontSize: HEADLINE_LINE2_FONT_SIZE }}
                >
                  {t.fullSchedule.headlineLine2}
                </span>
              </h2>

            </div>

            <div
              data-gsap-bracket
              className="full-schedule-bracket-slot mb-[clamp(80px,10vh,120px)] flex w-full min-w-0 justify-center self-stretch overflow-visible max-[1599px]:px-0 min-[1600px]:px-[clamp(16px,2.5vw,40px)]"
            >
              <TournamentBracket matches={adminDraft?.matches} />
            </div>

            <div className="px-[clamp(16px,2.5vw,40px)]">
              <SponsorBadge variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
