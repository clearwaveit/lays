import LaysHero from "@/app/components/sections/LaysHero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lays",
  description: "Home page",
};

export default function Home() {
  return <LaysHero />;
}
