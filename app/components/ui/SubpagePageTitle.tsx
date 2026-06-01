"use client";

import { laysFontFamily, laysTextClass } from "@/app/fonts";

const DESIGN_WIDTH = 1600;
const TITLE_COLOR = "#DF2027";

function scale(px: number, minRatio = 0.45) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const TITLE_FONT_SIZE = scale(56);

type SubpagePageTitleProps = {
  title: string;
  isRtl: boolean;
  /** Negative margin to overlap content below (e.g. red panel). */
  overlapMargin?: string;
  className?: string;
};

export default function SubpagePageTitle({
  title,
  isRtl,
  overlapMargin,
  className = "",
}: SubpagePageTitleProps) {
  return (
    <h1
      className={`${laysTextClass} relative z-20 m-0 shrink-0 font-extrabold leading-[0.95] ${isRtl ? "text-right" : "text-left uppercase"} ${className}`}
      style={{
        fontSize: TITLE_FONT_SIZE,
        fontFamily: laysFontFamily,
        fontWeight: 800,
        color: TITLE_COLOR,
        ...(overlapMargin ? { marginBottom: overlapMargin } : undefined),
      }}
    >
      {title}
    </h1>
  );
}
