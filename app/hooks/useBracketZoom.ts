"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const MAX_ZOOM = 1;
const ZOOM_STEP = 0.08;
const FIT_PADDING_PX = 8;
const ABSOLUTE_MIN_ZOOM = 0.12;
const FIT_RETRY_FRAMES = 8;

function getBracketSlotEl(scrollEl: HTMLElement) {
  return scrollEl.closest(".full-schedule-bracket-slot");
}

function getScrollContentWidth(scrollEl: HTMLElement, pageScroll: boolean) {
  const style = getComputedStyle(scrollEl);
  const padX =
    (parseFloat(style.paddingLeft) || 0) +
    (parseFloat(style.paddingRight) || 0);

  let width = scrollEl.clientWidth - padX - FIT_PADDING_PX;
  const slot = getBracketSlotEl(scrollEl);
  if (slot instanceof HTMLElement && slot.clientWidth > 0) {
    width = slot.clientWidth - FIT_PADDING_PX;
  } else if (pageScroll && typeof window !== "undefined") {
    width = window.innerWidth - FIT_PADDING_PX;
  }

  return Math.max(0, width);
}

function computeWidthFitZoom(viewportWidth: number, layoutWidth: number) {
  const layoutW = layoutWidth > 0 ? layoutWidth : 1600;
  const widthFit =
    viewportWidth >= layoutW - 16 ? 1 : viewportWidth / layoutW;
  return Math.min(MAX_ZOOM, Math.max(ABSOLUTE_MIN_ZOOM, widthFit));
}

function touchDistance(touches: TouchList) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

type UseBracketZoomOptions = {
  enabled: boolean;
  designWidth: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  pageScroll?: boolean;
};

export function useBracketZoom({
  enabled,
  designWidth,
  scrollRef,
  contentRef,
  pageScroll = false,
}: UseBracketZoomOptions) {
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const zoomRef = useRef(1);
  const fitZoomRef = useRef(1);
  const fitAppliedRef = useRef(false);
  const scrollWidthRef = useRef(0);
  const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1 });

  zoomRef.current = zoom;
  fitZoomRef.current = fitZoom;

  const clampUserZoom = useCallback((value: number) => {
    return Math.min(MAX_ZOOM, Math.max(fitZoomRef.current, value));
  }, []);

  const applyFitZoom = useCallback((): boolean => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || scrollEl.clientWidth <= 0) return false;
    if (!pageScroll && scrollEl.clientHeight < 80) return false;

    if (!contentEl) return false;
    if (contentEl.offsetHeight <= 0) return false;

    const viewportWidth = getScrollContentWidth(scrollEl, pageScroll);
    if (viewportWidth <= 0) return false;

    const fit = computeWidthFitZoom(viewportWidth, designWidth);
    setFitZoom(fit);
    setZoom(fit);
    fitZoomRef.current = fit;
    zoomRef.current = fit;
    scrollEl.scrollLeft = 0;
    scrollEl.scrollTop = 0;
    fitAppliedRef.current = true;
    return true;
  }, [designWidth, scrollRef, contentRef, pageScroll]);

  useLayoutEffect(() => {
    if (!enabled) {
      setZoom(1);
      setFitZoom(1);
      fitAppliedRef.current = false;
      return;
    }

    fitAppliedRef.current = false;
    let frame = 0;
    let rafId = 0;

    const tryFit = () => {
      if (applyFitZoom()) return;
      frame += 1;
      if (frame < FIT_RETRY_FRAMES) {
        rafId = requestAnimationFrame(tryFit);
      }
    };

    rafId = requestAnimationFrame(tryFit);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled, applyFitZoom]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl) return;

    const refitIfViewportChanged = () => {
      const w = scrollEl.clientWidth;
      if (w <= 0) return;
      if (
        fitAppliedRef.current &&
        Math.abs(w - scrollWidthRef.current) < 2
      ) {
        return;
      }
      scrollWidthRef.current = w;
      fitAppliedRef.current = false;
      applyFitZoom();
    };

    const observer = new ResizeObserver(() => {
      if (!fitAppliedRef.current) {
        applyFitZoom();
        scrollWidthRef.current = scrollEl.clientWidth;
        return;
      }
      refitIfViewportChanged();
    });
    observer.observe(scrollEl);

    window.addEventListener("resize", refitIfViewportChanged);
    window.visualViewport?.addEventListener("resize", refitIfViewportChanged);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", refitIfViewportChanged);
      window.visualViewport?.removeEventListener(
        "resize",
        refitIfViewportChanged,
      );
    };
  }, [enabled, applyFitZoom, scrollRef]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          active: true,
          startDistance: touchDistance(e.touches),
          startZoom: zoomRef.current,
        };
        setIsPinching(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pinchRef.current.active || e.touches.length < 2) return;
      const distance = touchDistance(e.touches);
      if (pinchRef.current.startDistance <= 0) return;
      e.preventDefault();
      const ratio = distance / pinchRef.current.startDistance;
      setZoom(clampUserZoom(pinchRef.current.startZoom * ratio));
    };

    const endPinch = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        pinchRef.current.active = false;
        setIsPinching(false);
      }
    };

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
    scrollEl.addEventListener("touchend", endPinch);
    scrollEl.addEventListener("touchcancel", endPinch);

    return () => {
      scrollEl.removeEventListener("touchstart", onTouchStart);
      scrollEl.removeEventListener("touchmove", onTouchMove);
      scrollEl.removeEventListener("touchend", endPinch);
      scrollEl.removeEventListener("touchcancel", endPinch);
    };
  }, [enabled, scrollRef, clampUserZoom]);

  const zoomIn = useCallback(() => {
    setZoom((z) => clampUserZoom(z + ZOOM_STEP));
  }, [clampUserZoom]);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const floor = fitZoomRef.current;
      const stepped = z - ZOOM_STEP;
      const next =
        stepped <= floor + ZOOM_STEP * 0.5
          ? floor
          : clampUserZoom(stepped);
      if (next <= floor + 0.001) {
        scrollRef.current?.scrollTo({ left: 0, top: 0 });
      }
      return next;
    });
  }, [clampUserZoom, scrollRef]);

  const resetZoom = useCallback(() => {
    fitAppliedRef.current = false;
    applyFitZoom();
  }, [applyFitZoom]);

  const allowsPan = zoom > fitZoom + 0.002;

  const centerPanScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const maxLeft = scrollEl.scrollWidth - scrollEl.clientWidth;
    const maxTop = scrollEl.scrollHeight - scrollEl.clientHeight;
    scrollEl.scrollLeft = maxLeft > 0 ? maxLeft / 2 : 0;
    scrollEl.scrollTop = maxTop > 0 ? maxTop / 2 : 0;
  }, [scrollRef]);

  useLayoutEffect(() => {
    if (!enabled || !allowsPan) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    let rafId = requestAnimationFrame(() => {
      centerPanScroll();
      rafId = requestAnimationFrame(centerPanScroll);
    });
    return () => cancelAnimationFrame(rafId);
  }, [enabled, allowsPan, zoom, centerPanScroll, scrollRef]);

  return {
    zoom,
    fitZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    isPinching,
    allowsPan,
    allowsHorizontalScroll: allowsPan,
    pageScroll,
    canZoomIn: zoom < MAX_ZOOM - 0.001,
    canZoomOut: zoom > fitZoom + 0.001,
  };
}
