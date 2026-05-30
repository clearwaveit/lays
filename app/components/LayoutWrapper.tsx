"use client";

import GsapRouteAnimator from "@/app/components/animations/GsapRouteAnimator";
import CampaignSelectionRouteSync from "@/app/components/CampaignSelectionRouteSync";
import LanguageDirection from "@/app/components/LanguageDirection";
import Header from "@/app/components/ui/Header";
import LanguageModal from "@/app/components/ui/LanguageModal";
import WhenToWatchModal from "@/app/components/ui/WhenToWatchModal";
import { CampaignSelectionProvider } from "@/app/context/CampaignSelectionContext";
import {
  LanguageProvider,
  useLanguage,
} from "@/app/context/LanguageContext";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type LayoutWrapperProps = {
  children: ReactNode;
};

function LanguageModalHost() {
  const { showLanguageModal } = useLanguage();
  return <LanguageModal open={showLanguageModal} />;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isScrollablePage =
    pathname === "/where-to-watch" ||
    pathname === "/match-timings" ||
    pathname === "/full-schedule";
  const isFullSchedule = pathname === "/full-schedule";

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <LanguageProvider>
      <LanguageModalHost />
      <CampaignSelectionProvider>
      <CampaignSelectionRouteSync />
      <LanguageDirection />
      <div
        className={`relative flex min-h-dvh max-w-full flex-col text-[#171717] ${
          isFullSchedule ? "overflow-x-visible" : "overflow-x-hidden"
        } ${
          isScrollablePage
            ? ""
            : "max-lg:h-dvh max-lg:max-h-dvh max-lg:overflow-hidden"
        }`}
      >
        <Header />
        <WhenToWatchModal />
        <main
          className={`w-full min-w-0 max-w-full flex-1 ${
            isFullSchedule ? "overflow-x-visible" : "overflow-x-hidden"
          } ${
            isScrollablePage
              ? "flex min-h-dvh flex-col overflow-y-auto"
              : "max-lg:min-h-0 max-lg:overflow-hidden"
          }`}
        >
          <GsapRouteAnimator
            className={
              isScrollablePage
                ? "flex min-h-dvh flex-1 flex-col"
                : "flex min-h-0 flex-1 flex-col max-lg:min-h-0"
            }
          >
            {children}
          </GsapRouteAnimator>
        </main>
      </div>
      </CampaignSelectionProvider>
    </LanguageProvider>
  );
}
