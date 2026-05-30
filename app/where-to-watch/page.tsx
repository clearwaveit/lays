import MatchMap from "@/app/components/sections/MatchMap";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Where to Watch | Lay's",
  description: "Find venues showing the match near you",
};

export default function WhereToWatchPage() {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Suspense fallback={null}>
        <MatchMap />
      </Suspense>
    </div>
  );
}
