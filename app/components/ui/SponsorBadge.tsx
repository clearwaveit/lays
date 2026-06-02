"use client";

import { useTranslations } from "@/app/i18n/useTranslations";
import Image from "next/image";

const SPONSOR_IMAGE_EN = {
  src: "/assets/imgs/lays-img-3-new-1.png",
  alt: "Official sponsor of FIFA World Cup",
  width: 140,
  height: 97,
} as const;

const SPONSOR_IMAGE_AR = {
  src: "/assets/imgs/lays-img-3-arabic-new.png",
  alt: "Official sponsor of FIFA World Cup",
  width: 140,
  height: 115,
} as const;

const HERO_WRAPPER_LTR =
  "pointer-events-none absolute z-40 max-lg:right-[clamp(12px,3vw,24px)] max-lg:bottom-[clamp(8px,1.5vh,16px)] max-lg:left-auto max-lg:translate-x-0 lg:right-[clamp(16px,2.5vw,40px)] lg:bottom-[clamp(16px,2.5vw,40px)] min-[1601px]:right-[4vw] min-[1601px]:bottom-[2.5vw]";

const HERO_WRAPPER_RTL =
  "pointer-events-none absolute z-40 max-lg:left-[clamp(12px,3vw,24px)] max-lg:bottom-[clamp(8px,1.5vh,16px)] max-lg:right-auto max-lg:translate-x-0 lg:left-[clamp(16px,2.5vw,40px)] lg:bottom-[clamp(16px,2.5vw,40px)] min-[1601px]:left-[4vw] min-[1601px]:bottom-[2.5vw]";

const RESPONSIVE_IMAGE_CLASS =
  "object-contain max-lg:h-[clamp(62px,6.063vw,97px)] max-lg:w-[clamp(89px,8.725vw,139.6px)] lg:max-[1599px]:h-[clamp(62px,6.063vw,97px)] lg:max-[1599px]:w-[clamp(89px,8.725vw,139.6px)] lg:min-[1600px]:max-[1600px]:h-[97px] lg:min-[1600px]:max-[1600px]:w-[139.6px] min-[1601px]:h-[6.063vw] min-[1601px]:w-[8.725vw]";

export type SponsorBadgeProps = {
  variant?: "hero" | "inline";
  className?: string;
  imageClassName?: string;
  src?: string;
  alt?: string;
};

export default function SponsorBadge({
  variant = "hero",
  className = "",
  imageClassName = "",
  src,
  alt,
}: SponsorBadgeProps) {
  const { isRtl } = useTranslations();
  const sponsorImage = isRtl ? SPONSOR_IMAGE_AR : SPONSOR_IMAGE_EN;
  const imageSrc = src ?? sponsorImage.src;
  const imageAlt = alt ?? sponsorImage.alt;

  const wrapperClass =
    variant === "hero"
      ? [isRtl ? HERO_WRAPPER_RTL : HERO_WRAPPER_LTR, className]
          .filter(Boolean)
          .join(" ")
      : className;

  const imgClass = [RESPONSIVE_IMAGE_CLASS, imageClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass} data-gsap-sponsor>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={sponsorImage.width}
        height={sponsorImage.height}
        sizes="(max-width: 1600px) 140px, 9vw"
        className={imgClass}
      />
    </div>
  );
}
