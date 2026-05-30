import FullSchedule from "@/app/components/sections/FullSchedule";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Full Schedule | Lay's",
  description: "FIFA World Cup 2026 knockout bracket — who's still in the game",
};

export default function FullSchedulePage() {
  return <FullSchedule />;
}
