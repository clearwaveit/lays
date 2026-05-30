"use client";

import { animateModalOpen } from "@/app/lib/animations";
import { gsap } from "@/app/lib/gsap";
import { shouldAnimate } from "@/app/lib/motion";
import { useEffect, useRef } from "react";

/** Animate modal backdrop + dialog when `open` becomes true. */
export function useGsapModal(open: boolean) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !shouldAnimate()) return;
    const tl = animateModalOpen(backdropRef.current, dialogRef.current);
    return () => {
      tl?.kill();
      const dialog = dialogRef.current;
      if (!dialog) return;
      gsap.set(dialog, { autoAlpha: 1, visibility: "visible" });
      gsap.set(
        dialog.querySelectorAll("img, a, button, [data-gsap-modal-item]"),
        { autoAlpha: 1, visibility: "visible", clearProps: "transform" },
      );
    };
  }, [open]);

  useEffect(() => {
    if (open || !shouldAnimate()) return;
    const backdrop = backdropRef.current;
    const dialog = dialogRef.current;
    if (backdrop) gsap.set(backdrop, { clearProps: "opacity,visibility" });
    if (dialog) gsap.set(dialog, { clearProps: "all" });
  }, [open]);

  return { backdropRef, dialogRef };
}
