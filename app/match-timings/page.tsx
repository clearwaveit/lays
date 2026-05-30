import MatchTimings from "@/app/components/sections/MatchTimings";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Match Timings | Lay's",
  description: "View match schedule at this venue",
};

export default function MatchTimingsPage() {
  return (
    <Suspense fallback={null}>
      <MatchTimings />
    </Suspense>
  );
}
