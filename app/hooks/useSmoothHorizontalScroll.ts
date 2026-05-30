"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

type DragState = {
  active: boolean;
  startX: number;
  scrollLeft: number;
};

function maxScrollLeft(el: HTMLElement) {
  return Math.max(0, el.scrollWidth - el.clientWidth);
}

function canScrollHorizontally(el: HTMLElement) {
  return el.scrollWidth - el.clientWidth > 2;
}

/** Visual position — works in LTR and RTL. */
function scrollLeftForChild(container: HTMLElement, child: HTMLElement) {
  const containerRect = container.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const target = container.scrollLeft + (childRect.left - containerRect.left);
  return Math.min(maxScrollLeft(container), Math.max(0, target));
}

export function useSmoothHorizontalScroll(isRtl: boolean) {
  const scrollElRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const setScrollRef = useCallback((node: HTMLDivElement | null) => {
    scrollElRef.current = node;
    setScrollEl(node);
  }, []);

  const measureScroll = useCallback(() => {
    const el = scrollElRef.current;
    if (!el) return;
    setCanScroll(canScrollHorizontally(el));
  }, []);

  useLayoutEffect(() => {
    const el = scrollEl;
    if (!el) return;

    measureScroll();
    const ro = new ResizeObserver(measureScroll);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);

    return () => ro.disconnect();
  }, [scrollEl, measureScroll]);

  const scrollToChild = useCallback(
    (child: HTMLElement, options?: { smooth?: boolean }) => {
      const el = scrollElRef.current;
      if (!el) return;

      const left = scrollLeftForChild(el, child);
      el.scrollTo({
        left,
        behavior: options?.smooth === false ? "instant" : "smooth",
      });
    },
    [],
  );

  const scrollToIndex = useCallback(
    (index: number, options?: { smooth?: boolean }) => {
      const el = scrollElRef.current;
      if (!el) return false;

      const card = el.querySelector<HTMLElement>(`[data-match-index="${index}"]`);
      if (!card) return false;

      scrollToChild(card, options);
      return true;
    },
    [scrollToChild],
  );

  useLayoutEffect(() => {
    const el = scrollEl;
    if (!el) return;

    const drag = dragRef.current;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.pointerType === "touch") return;
      if (!canScrollHorizontally(el)) return;

      const target = e.target as HTMLElement;
      if (target.closest("a, button")) return;

      drag.active = true;
      drag.startX = e.clientX;
      drag.scrollLeft = el.scrollLeft;
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active) return;
      e.preventDefault();
      el.scrollLeft = drag.scrollLeft - (e.clientX - drag.startX);
    };

    const endDrag = (e: PointerEvent) => {
      if (!drag.active) return;
      drag.active = false;
      setIsDragging(false);
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!canScrollHorizontally(el)) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += isRtl ? -e.deltaY : e.deltaY;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", endDrag);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("lostpointercapture", endDrag);
      el.removeEventListener("wheel", onWheel);
    };
  }, [scrollEl, isRtl]);

  return {
    setScrollRef,
    scrollToChild,
    scrollToIndex,
    isDragging,
    canScroll,
  };
}
