import Timetable from "@/app/components/sections/Timetable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timetable | Lay's",
  description: "FIFA World Cup 2026 match timetable",
};

export default function TimetablePage() {
  return <Timetable />;
}
