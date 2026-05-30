"use client";

import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CampaignSelectionRouteSyncInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isReady, resetCampaignSelection, closeWhenToWatchModal } =
    useCampaignSelection();

  useEffect(() => {
    if (!isReady) return;

    if (pathname === "/") {
      resetCampaignSelection();
      closeWhenToWatchModal();
      return;
    }

    if (pathname === "/where-to-watch" && !searchParams.get("date")) {
      resetCampaignSelection();
    }
  }, [
    pathname,
    searchParams,
    isReady,
    resetCampaignSelection,
    closeWhenToWatchModal,
  ]);

  return null;
}

/** Clears stored date/venue on home, and on where-to-watch when opened without ?date=. */
export default function CampaignSelectionRouteSync() {
  return (
    <Suspense fallback={null}>
      <CampaignSelectionRouteSyncInner />
    </Suspense>
  );
}
