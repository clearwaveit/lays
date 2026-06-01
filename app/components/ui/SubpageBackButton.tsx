"use client";

import { useTranslations } from "@/app/i18n/useTranslations";
import { useRouter } from "next/navigation";

type SubpageBackButtonProps = {
  className?: string;
};

function BackArrowIcon({ isRtl }: { isRtl: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="block shrink-0"
      style={{ transform: isRtl ? "scaleX(-1)" : undefined }}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export default function SubpageBackButton({ className = "" }: SubpageBackButtonProps) {
  const router = useRouter();
  const { isRtl, t } = useTranslations();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label={t.a11y.goBack}
      className={`subpage-back-btn inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-solid border-[#DF202740] bg-[#FEE401] text-[#E31837] shadow-sm transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DF2027] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5c400] ${className}`}
    >
      <BackArrowIcon isRtl={isRtl} />
    </button>
  );
}
