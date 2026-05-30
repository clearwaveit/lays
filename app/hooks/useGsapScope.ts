"use client";

import { gsap } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";
import { useEffect, useRef, type DependencyList, type RefObject } from "react";

/**
 * Run GSAP animations scoped to a container; reverts on unmount / deps change.
 */
export function useGsapScope<T extends HTMLElement = HTMLElement>(
  setup: (root: T) => void,
  deps: DependencyList = [],
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !shouldAnimate()) return;

    const ctx = gsap.context(() => setup(root), root);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setup is stable per call site
  }, deps);

  return ref;
}
