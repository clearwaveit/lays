"use client";

import { gsap } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

type GsapRouteAnimatorProps = {
  children: ReactNode;
  className?: string;
};

/** Subtle fade-in when navigating between campaign routes. */
export default function GsapRouteAnimator({
  children,
  className = "",
}: GsapRouteAnimatorProps) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shouldAnimate()) return;

    gsap.fromTo(
      el,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.45, ease: "power2.out" },
    );
  }, [pathname]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
