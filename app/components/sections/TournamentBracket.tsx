"use client";

import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import {
  encodeDateParam,
  formatMatchDateLong,
  getFullScheduleLayout,
  type BracketColumnTier,
  type FullScheduleColumn,
  type MatchFixture,
  type Team,
} from "@/app/data/matches";
import { isRemoteTeamFlag } from "@/app/data/team-flags";
import { isMatchSideLoser, LOSER_FLAG_CLASS } from "@/app/lib/matchResult";
import { useBracketZoom } from "@/app/hooks/useBracketZoom";
import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BRACKET_LINE_COLOR,
  BRACKET_LINE_WIDTH,
  computeFinalConnectorPaths,
  computeSideConnectorPaths,
} from "@/app/components/sections/bracket-connectors";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const FLAGS_BG = "/assets/imgs/flags-bg.png";
const KNOCKOUT_PLACEHOLDER_FLAG = "/assets/imgs/football.png";
const SCHEDULE_RED = "#DF2027";
const DESIGN_WIDTH = 1600;
/** Fluid pill scaling from this width up; compact + zoom below DESIGN_WIDTH. */
const BRACKET_BREAKPOINT = DESIGN_WIDTH;
/** Slightly tighter flag/column gaps between 1600px and this width. */
const COMPACT_DESKTOP_MAX_WIDTH = 1668;
const COMPACT_DESKTOP_GAP_REDUCTION_PX = 30;
/** Column gap uses 18px less reduction than other compact gaps (36px at 1600). */
const COMPACT_DESKTOP_COLUMN_GAP_REDUCTION_PX =
  COMPACT_DESKTOP_GAP_REDUCTION_PX - 18;
/** Figma at 1600px — outer inset inside the 1600 canvas. */
const BRACKET_SIDE_PADDING_PX = 16;
/** Horizontal gap between round columns on each side. */
const BRACKET_COLUMN_GAP_PX = 48;
/** Gap between left bracket, final, and right bracket. */
const FINAL_CENTER_GAP_PX = 36;

function scale(px: number, minRatio = 0.35) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

function fixedPx(px: number) {
  return `${px}px`;
}

type PillTierStyle = {
  width: string;
  height: string;
  flag: string;
  gap: string;
};

type BracketMetrics = {
  isFluid: boolean;
  pillTierStyles: Record<BracketColumnTier | "final", PillTierStyle>;
  bracketSidePadding: string;
  bracketColumnGap: string;
  finalCenterGap: string;
  finalPillWidth: string;
  finalPillHeight: string;
};

const BracketMetricsContext = createContext<BracketMetrics | null>(null);

function useBracketMetrics() {
  const metrics = useContext(BracketMetricsContext);
  if (!metrics) {
    throw new Error("useBracketMetrics must be used within TournamentBracket");
  }
  return metrics;
}

function compactGapPx(
  px: number,
  minPx: number,
  isCompactDesktop: boolean,
  reductionPx = COMPACT_DESKTOP_GAP_REDUCTION_PX,
) {
  if (!isCompactDesktop) return px;
  return Math.max(minPx, px - reductionPx);
}

function buildBracketMetrics(
  isFluid: boolean,
  isCompactDesktop: boolean,
): BracketMetrics {
  const dim = (px: number) => (isFluid ? scale(px) : fixedPx(px));
  const gapDim = (px: number, minPx: number, reductionPx?: number) =>
    dim(compactGapPx(px, minPx, isCompactDesktop, reductionPx));

  return {
    isFluid,
    bracketSidePadding: dim(BRACKET_SIDE_PADDING_PX),
    bracketColumnGap: gapDim(
      BRACKET_COLUMN_GAP_PX,
      16,
      COMPACT_DESKTOP_COLUMN_GAP_REDUCTION_PX,
    ),
    finalCenterGap: gapDim(FINAL_CENTER_GAP_PX, 8),
    finalPillWidth: dim(161.68),
    finalPillHeight: dim(323.36),
    pillTierStyles: {
      1: {
        width: dim(49.35),
        height: dim(98.69),
        flag: dim(37.89),
        gap: gapDim(10, 4),
      },
      2: {
        width: dim(66.12),
        height: dim(132.25),
        flag: dim(50.77),
        gap: gapDim(36, 8),
      },
      3: {
        width: dim(103.01),
        height: dim(206.02),
        flag: dim(79.1),
        gap: gapDim(88, 48),
      },
      final: {
        width: dim(161.68),
        height: dim(323.36),
        flag: dim(124.15),
        gap: "0px",
      },
    },
  };
}

function useBracketLayoutMode() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : DESIGN_WIDTH,
  );

  useLayoutEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const isFluid = viewportWidth >= BRACKET_BREAKPOINT;
  const needsHorizontalScroll = viewportWidth < DESIGN_WIDTH;
  const isCompactDesktop =
    viewportWidth >= BRACKET_BREAKPOINT &&
    viewportWidth <= COMPACT_DESKTOP_MAX_WIDTH;

  return { isFluid, needsHorizontalScroll, isCompactDesktop };
}

function useBracketConnectorPaths(
  containerRef: RefObject<HTMLElement | null>,
  compute: (el: HTMLElement) => string[],
  layoutKey?: number,
) {
  const computeRef = useRef(compute);
  computeRef.current = compute;

  const [paths, setPaths] = useState<string[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lastPathsKeyRef = useRef("");
  const lastSizeRef = useRef({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;

    const update = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const nextWidth = el.offsetWidth;
        const nextHeight = el.offsetHeight;
        const nextPaths = computeRef.current(el);
        const nextPathsKey = nextPaths.join("|");

        const sizeChanged =
          lastSizeRef.current.width !== nextWidth ||
          lastSizeRef.current.height !== nextHeight;
        const pathsChanged = lastPathsKeyRef.current !== nextPathsKey;

        if (!sizeChanged && !pathsChanged) return;

        lastSizeRef.current = { width: nextWidth, height: nextHeight };
        lastPathsKeyRef.current = nextPathsKey;

        if (sizeChanged) {
          setSize({ width: nextWidth, height: nextHeight });
        }
        if (pathsChanged) {
          setPaths(nextPaths);
        }
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.querySelectorAll("[data-bracket-column], [data-bracket-slot]").forEach(
      (node) => observer.observe(node),
    );
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [layoutKey]);

  useLayoutEffect(() => {
    if (layoutKey === undefined) return;
    const el = containerRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const nextWidth = el.offsetWidth;
        const nextHeight = el.offsetHeight;
        const nextPaths = computeRef.current(el);
        setSize({ width: nextWidth, height: nextHeight });
        setPaths(nextPaths);
        lastSizeRef.current = { width: nextWidth, height: nextHeight };
        lastPathsKeyRef.current = nextPaths.join("|");
      });
    });
    return () => cancelAnimationFrame(id);
  }, [layoutKey, containerRef]);

  return { paths, size };
}

function BracketConnectorSvg({
  paths,
  width,
  height,
  strokeScale = 1,
}: {
  paths: string[];
  width: number;
  height: number;
  /** Compensates CSS zoom so stroke matches desktop (~1px on screen). */
  strokeScale?: number;
}) {
  if (width <= 0 || height <= 0 || paths.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 z-[5] overflow-visible"
      width={width}
      height={height}
      aria-hidden
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={BRACKET_LINE_COLOR}
          strokeWidth={BRACKET_LINE_WIDTH * strokeScale}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      ))}
    </svg>
  );
}

type TooltipState = {
  match: MatchFixture;
  rect: DOMRect;
};

function BracketFlag({
  team,
  match,
  side,
  size,
  usePlaceholder = false,
  onSelect,
}: {
  team: Team;
  match: MatchFixture;
  side: "home" | "away";
  size: string;
  usePlaceholder?: boolean;
  onSelect: (match: MatchFixture, rect: DOMRect) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const flagSrc = usePlaceholder ? KNOCKOUT_PLACEHOLDER_FLAG : team.flag;
  const isLoser = !usePlaceholder && isMatchSideLoser(match, side);

  return (
    <button
      ref={btnRef}
      type="button"
      className="relative shrink-0 cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF2027]"
      style={{ width: size, height: size }}
      aria-label={
        usePlaceholder
          ? `Scheduled match slot, ${match.dateLabel}`
          : `${team.name}, ${match.dateLabel}`
      }
      onClick={() => {
        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) onSelect(match, rect);
      }}
    >
      <Image
        src={flagSrc}
        alt=""
        fill
        draggable={false}
        unoptimized={!usePlaceholder && isRemoteTeamFlag(team.flag)}
        className={`pointer-events-none select-none ${
          usePlaceholder ? "object-contain object-center p-[8%]" : "object-cover"
        } ${isLoser ? LOSER_FLAG_CLASS : ""}`}
        sizes="80px"
      />
    </button>
  );
}

function BracketMatchPill({
  match,
  tier,
  onFlagSelect,
}: {
  match: MatchFixture;
  tier: BracketColumnTier | "final";
  onFlagSelect: (match: MatchFixture, rect: DOMRect) => void;
}) {
  const { pillTierStyles } = useBracketMetrics();
  const styles = pillTierStyles[tier];
  const usePlaceholderFlags = tier !== 1;

  return (
    <div
      className="relative shrink-0"
      style={{ width: styles.width, height: styles.height }}
      data-bracket-slot
      data-match-date={match.dateLabel}
    >
      <Image
        src={FLAGS_BG}
        alt=""
        fill
        draggable={false}
        className="pointer-events-none object-contain object-center select-none"
        sizes="162px"
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex h-full flex-col items-center justify-center gap-2.5 py-1">
        <BracketFlag
          team={match.home}
          match={match}
          side="home"
          size={styles.flag}
          usePlaceholder={usePlaceholderFlags}
          onSelect={onFlagSelect}
        />
        <BracketFlag
          team={match.away}
          match={match}
          side="away"
          size={styles.flag}
          usePlaceholder={usePlaceholderFlags}
          onSelect={onFlagSelect}
        />
      </div>
    </div>
  );
}

function BracketColumn({
  column,
  columnIndex,
  onFlagSelect,
}: {
  column: FullScheduleColumn;
  columnIndex: number;
  onFlagSelect: (match: MatchFixture, rect: DOMRect) => void;
}) {
  const { pillTierStyles } = useBracketMetrics();
  const styles = pillTierStyles[column.tier];

  if (column.matches.length === 0) return null;

  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center"
      style={{ gap: styles.gap }}
      data-bracket-column={columnIndex}
    >
      {column.matches.map((match) => (
        <BracketMatchPill
          key={`${match.dateLabel}-${match.time}-${match.home.name}-${match.away.name}`}
          match={match}
          tier={column.tier}
          onFlagSelect={onFlagSelect}
        />
      ))}
    </div>
  );
}

function BracketSide({
  columns,
  side,
  onFlagSelect,
  layoutKey,
  strokeScale,
}: {
  columns: FullScheduleColumn[];
  side: "left" | "right";
  onFlagSelect: (match: MatchFixture, rect: DOMRect) => void;
  layoutKey?: number;
  strokeScale?: number;
}) {
  const { bracketColumnGap } = useBracketMetrics();
  const sideRef = useRef<HTMLDivElement>(null);
  const { paths, size } = useBracketConnectorPaths(
    sideRef,
    (el) => computeSideConnectorPaths(el, side),
    layoutKey,
  );

  return (
    <div ref={sideRef} className="relative shrink-0" data-bracket-side={side}>
      <BracketConnectorSvg
        paths={paths}
        width={size.width}
        height={size.height}
        strokeScale={strokeScale}
      />
      <div
        className={`relative z-10 flex shrink-0 flex-row items-center justify-end ${side === "right" ? "flex-row-reverse" : ""}`}
        style={{ gap: bracketColumnGap }}
      >
        {columns.map((column, columnIndex) => (
          <BracketColumn
            key={`${side}-line-${columnIndex + 1}`}
            column={column}
            columnIndex={columnIndex}
            onFlagSelect={onFlagSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function BracketMatchTooltip({
  state,
  onClose,
  onWhereToWatch,
}: {
  state: TooltipState;
  onClose: () => void;
  onWhereToWatch: (dateLabel: string) => void;
}) {
  const { t, textClass, fontFamily, isRtl, language } = useTranslations();
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { body, documentElement: html } = document;
    const main = document.querySelector("main");
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousMainOverflow =
      main instanceof HTMLElement ? main.style.overflow : "";

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (main instanceof HTMLElement) {
      main.style.overflow = "hidden";
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      if (main instanceof HTMLElement) {
        main.style.overflow = previousMainOverflow;
      }
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const { rect } = state;
  const tooltipWidth = 280;
  const arrowHalfWidth = 8;
  const left = Math.min(
    Math.max(12, rect.left + rect.width / 2 - tooltipWidth / 2),
    window.innerWidth - tooltipWidth - 12,
  );
  const top = Math.max(12, rect.top - 8);
  const flagCenterX = rect.left + rect.width / 2;
  const arrowLeft = Math.min(
    Math.max(12, flagCenterX - left - arrowHalfWidth),
    tooltipWidth - arrowHalfWidth * 2 - 12,
  );

  const btnStyle: CSSProperties = {
    fontFamily,
    fontWeight: 800,
    letterSpacing: isRtl ? undefined : "0.08em",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] overscroll-none"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/25"
        aria-label={t.a11y.close}
        onClick={onClose}
      />
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={formatMatchDateLong(state.match.dateLabel, language)}
        className={`${textClass} pointer-events-auto fixed z-[121] overflow-visible rounded-xl bg-white shadow-lg`}
        style={{
          left,
          top,
          width: tooltipWidth,
          transform: "translateY(-100%)",
          padding: scale(16, 0.65),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="pointer-events-none absolute top-full block size-0 border-x-8 border-t-8 border-x-transparent border-t-white"
          style={{ left: arrowLeft }}
          aria-hidden
        />
        <p
          className={`${textClass} mb-3 text-center font-extrabold uppercase text-black`}
          style={{
            fontSize: scale(14, 0.7),
            fontFamily,
          }}
        >
          {t.fullSchedule.datePrefix}{" "}
          {formatMatchDateLong(state.match.dateLabel, language)}
        </p>
        <button
          type="button"
          className={`${textClass} w-full cursor-pointer rounded-md border-0 uppercase text-white transition-opacity hover:opacity-90`}
          style={{
            ...btnStyle,
            height: scale(48, 0.55),
            fontSize: scale(14, 0.7),
            backgroundColor: SCHEDULE_RED,
          }}
          onClick={() => onWhereToWatch(state.match.dateLabel)}
        >
          {t.fullSchedule.whereToWatch}
        </button>
      </div>
    </div>,
    document.body,
  );
}

function BracketZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}) {
  const { t, textClass } = useTranslations();

  return (
    <div
      className="bracket-zoom-controls pointer-events-auto fixed bottom-[clamp(88px,16vh,108px)] left-1/2 z-30 flex -translate-x-1/2 flex-row items-center justify-center gap-1.5 max-[1599px]:flex min-[1600px]:hidden"
      aria-label={t.fullSchedule.zoomReset}
    >
      <button
        type="button"
        className="bracket-zoom-btn flex size-9 items-center justify-center rounded-full border-0 bg-[#DF2027] text-lg font-bold leading-none text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t.fullSchedule.zoomOut}
        disabled={!canZoomOut}
        onClick={onZoomOut}
      >
        −
      </button>
      <button
        type="button"
        className={`${textClass} bracket-zoom-btn flex h-9 min-w-[2.75rem] items-center justify-center rounded-full border-0 bg-white px-2 text-[10px] font-extrabold uppercase text-[#DF2027] shadow-sm transition-opacity hover:opacity-90`}
        aria-label={t.fullSchedule.zoomReset}
        onClick={onReset}
      >
        Fit
      </button>
      <button
        type="button"
        className="bracket-zoom-btn flex size-9 items-center justify-center rounded-full border-0 bg-[#DF2027] text-lg font-bold leading-none text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t.fullSchedule.zoomIn}
        disabled={!canZoomIn}
        onClick={onZoomIn}
      >
        +
      </button>
    </div>
  );
}

export default function TournamentBracket({
  scrollRef: scrollRefProp,
  matches,
}: {
  scrollRef?: RefObject<HTMLDivElement | null>;
  matches?: MatchFixture[];
}) {
  const router = useRouter();
  const { setSelectedDate } = useCampaignSelection();
  const layout = getFullScheduleLayout(matches);
  const { isFluid, needsHorizontalScroll, isCompactDesktop } =
    useBracketLayoutMode();
  const metrics = buildBracketMetrics(isFluid, isCompactDesktop);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);
  const localScrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const enableZoom = needsHorizontalScroll;
  const {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    isPinching,
    allowsPan,
    canZoomIn,
    canZoomOut,
  } = useBracketZoom({
    enabled: enableZoom,
    designWidth: DESIGN_WIDTH,
    scrollRef: localScrollRef,
    contentRef: innerRef,
    pageScroll: true,
  });
  const connectorStrokeScale = enableZoom && zoom > 0 ? 1 / zoom : 1;
  const connectorLayoutKey = enableZoom ? zoom : undefined;

  const { paths: finalPaths, size: gridSize } = useBracketConnectorPaths(
    innerRef,
    computeFinalConnectorPaths,
    connectorLayoutKey,
  );

  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      localScrollRef.current = node;
      if (scrollRefProp) {
        scrollRefProp.current = node;
      }
    },
    [scrollRefProp],
  );

  useEffect(() => {
    if (!enableZoom || !allowsPan) return;

    const el = localScrollRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (isPinching) return;
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      e.preventDefault();
      el.scrollLeft =
        dragRef.current.scrollLeft - (e.clientX - dragRef.current.startX);
      el.scrollTop =
        dragRef.current.scrollTop - (e.clientY - dragRef.current.startY);
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      setIsDragging(false);
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("lostpointercapture", endDrag);
    };
  }, [enableZoom, allowsPan, isPinching]);

  const handleFlagSelect = useCallback((match: MatchFixture, rect: DOMRect) => {
    setTooltip({ match, rect });
  }, []);

  const handleCloseTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleWhereToWatch = useCallback(
    (dateLabel: string) => {
      setSelectedDate(dateLabel);
      setTooltip(null);
      router.push(`/where-to-watch?date=${encodeDateParam(dateLabel)}`);
    },
    [router, setSelectedDate],
  );

  return (
    <BracketMetricsContext.Provider value={metrics}>
      <div
        dir="ltr"
        className="tournament-bracket-root relative mx-auto w-full min-w-0 max-[1599px]:max-w-full min-[1600px]:max-w-full"
        style={{ maxWidth: enableZoom ? undefined : `${DESIGN_WIDTH}px` }}
      >
        {enableZoom ? (
          <BracketZoomControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
          />
        ) : null}
        <div
          ref={setScrollRef}
          className={`tournament-bracket-scroll relative flex w-full select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            enableZoom
              ? `tournament-bracket-scroll--page max-[1599px]:w-full ${
                  allowsPan
                    ? "max-[1599px]:max-h-[min(72dvh,100%)] max-[1599px]:min-h-0 max-[1599px]:items-start max-[1599px]:justify-start max-[1599px]:overflow-auto"
                    : "max-[1599px]:h-auto max-[1599px]:items-center max-[1599px]:justify-center max-[1599px]:overflow-visible max-[1599px]:overflow-x-hidden"
                }`
              : "min-[1600px]:justify-center min-[1600px]:overflow-x-auto min-[1600px]:overflow-y-visible"
          } ${
            enableZoom && allowsPan
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
          style={{
            touchAction: enableZoom
              ? allowsPan
                ? "none"
                : "manipulation"
              : "pan-x pan-y",
            ...((enableZoom && allowsPan
              ? { WebkitOverflowScrolling: "touch" }
              : {}) as CSSProperties),
          }}
        >
          {enableZoom ? (
            <div
              className="tournament-bracket-zoom-surface relative shrink-0"
              style={{ width: `${DESIGN_WIDTH * zoom}px` }}
            >
              <div
                ref={innerRef}
                className="tournament-bracket-inner relative grid shrink-0 items-center py-4 max-[1599px]:px-1 max-[1599px]:py-6"
                style={{
                  width: `${DESIGN_WIDTH}px`,
                  minWidth: `${DESIGN_WIDTH}px`,
                  paddingLeft: metrics.bracketSidePadding,
                  paddingRight: metrics.bracketSidePadding,
                  boxSizing: "border-box",
                  gridTemplateColumns: "1fr auto 1fr",
                  columnGap: metrics.finalCenterGap,
                  ...( { zoom } as CSSProperties ),
                }}
              >
            <BracketConnectorSvg
              paths={finalPaths}
              width={gridSize.width}
              height={gridSize.height}
              strokeScale={connectorStrokeScale}
            />
            <div className="relative z-10 flex w-full min-w-0 shrink-0 justify-end">
              <BracketSide
                columns={layout.leftColumns}
                side="left"
                onFlagSelect={handleFlagSelect}
                layoutKey={connectorLayoutKey}
                strokeScale={connectorStrokeScale}
              />
            </div>

            <div
              className="relative z-10 flex shrink-0 items-center justify-center"
              style={{
                width: metrics.finalPillWidth,
                minHeight: metrics.finalPillHeight,
              }}
              data-bracket-final={layout.final ? "" : undefined}
            >
              {layout.final ? (
                <BracketMatchPill
                  match={layout.final}
                  tier="final"
                  onFlagSelect={handleFlagSelect}
                />
              ) : null}
            </div>

            <div className="relative z-10 flex w-full min-w-0 shrink-0 justify-start">
              <BracketSide
                columns={layout.rightColumns}
                side="right"
                onFlagSelect={handleFlagSelect}
                layoutKey={connectorLayoutKey}
                strokeScale={connectorStrokeScale}
              />
            </div>
              </div>
            </div>
          ) : (
            <div
              ref={innerRef}
              className="tournament-bracket-inner relative grid shrink-0 items-center py-4 max-[1599px]:px-1 max-[1599px]:py-6"
              style={{
                width: `${DESIGN_WIDTH}px`,
                minWidth: `${DESIGN_WIDTH}px`,
                paddingLeft: metrics.bracketSidePadding,
                paddingRight: metrics.bracketSidePadding,
                boxSizing: "border-box",
                gridTemplateColumns: "1fr auto 1fr",
                columnGap: metrics.finalCenterGap,
              }}
            >
              <BracketConnectorSvg
                paths={finalPaths}
                width={gridSize.width}
                height={gridSize.height}
                strokeScale={connectorStrokeScale}
              />
              <div className="relative z-10 flex w-full min-w-0 shrink-0 justify-end">
                <BracketSide
                  columns={layout.leftColumns}
                  side="left"
                  onFlagSelect={handleFlagSelect}
                  layoutKey={connectorLayoutKey}
                  strokeScale={connectorStrokeScale}
                />
              </div>

              <div
                className="relative z-10 flex shrink-0 items-center justify-center"
                style={{
                  width: metrics.finalPillWidth,
                  minHeight: metrics.finalPillHeight,
                }}
                data-bracket-final={layout.final ? "" : undefined}
              >
                {layout.final ? (
                  <BracketMatchPill
                    match={layout.final}
                    tier="final"
                    onFlagSelect={handleFlagSelect}
                  />
                ) : null}
              </div>

              <div className="relative z-10 flex w-full min-w-0 shrink-0 justify-start">
                <BracketSide
                  columns={layout.rightColumns}
                  side="right"
                  onFlagSelect={handleFlagSelect}
                  layoutKey={connectorLayoutKey}
                  strokeScale={connectorStrokeScale}
                />
              </div>
            </div>
          )}
        </div>

        {tooltip ? (
          <BracketMatchTooltip
            state={tooltip}
            onClose={handleCloseTooltip}
            onWhereToWatch={handleWhereToWatch}
          />
        ) : null}
      </div>
    </BracketMetricsContext.Provider>
  );
}
