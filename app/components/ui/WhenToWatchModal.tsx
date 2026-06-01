"use client";

import { useCampaignSelection } from "@/app/context/CampaignSelectionContext";
import { encodeDateParam } from "@/app/data/matches";
import WhenToWatchDatePicker from "@/app/components/ui/WhenToWatchDatePicker";
import { useAdminCampaignDraft } from "@/app/lib/adminCampaignDraft";
import { useTranslations } from "@/app/i18n/useTranslations";
import { useRouter } from "next/navigation";
import { useGsapModal } from "@/app/hooks/useGsapModal";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const BRAND_RED = "#E31837";
const SCHEDULE_RED = "#DF2027";
const DISABLED_BTN_BG = "#F4B4B8";
const DESIGN_WIDTH = 1600;
const MODAL_WIDTH_PX = 555.77;
const FIELD_HEIGHT_PX = 56.08;
const BTN_HEIGHT_PX = 56.08;

function scale(px: number, minRatio = 0.5) {
  const vw = ((px / DESIGN_WIDTH) * 100).toFixed(4);
  return `clamp(${Math.round(px * minRatio)}px, ${vw}vw, ${px}px)`;
}

const MODAL_WIDTH = scale(MODAL_WIDTH_PX);
const FIELD_HEIGHT = scale(FIELD_HEIGHT_PX);
const BTN_HEIGHT = scale(BTN_HEIGHT_PX);
const TITLE_SIZE = scale(22, 0.7);
const FIELD_FONT_SIZE = scale(16, 0.75);
const BTN_FONT_SIZE = scale(16, 0.75);

export default function WhenToWatchModal() {
  const router = useRouter();
  const {
    whenToWatchModalOpen,
    closeWhenToWatchModal,
    setSelectedDate,
    selectedDate,
  } = useCampaignSelection();
  const { t, textClass, fontFamily, isRtl } = useTranslations();
  const campaignDraft = useAdminCampaignDraft();
  const [mounted, setMounted] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const { backdropRef, dialogRef } = useGsapModal(whenToWatchModalOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!whenToWatchModalOpen) return;
    setDraftDate(selectedDate ?? "");
  }, [whenToWatchModalOpen, selectedDate]);

  useEffect(() => {
    if (!whenToWatchModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeWhenToWatchModal();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [whenToWatchModalOpen, closeWhenToWatchModal]);

  const canProceed = draftDate.length > 0;

  const goToWhereToWatch = useCallback(() => {
    if (!draftDate) return;
    setSelectedDate(draftDate);
    closeWhenToWatchModal();
    router.push(`/where-to-watch?date=${encodeDateParam(draftDate)}`);
  }, [draftDate, setSelectedDate, closeWhenToWatchModal, router]);

  if (!mounted || !whenToWatchModalOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/25"
        aria-hidden
        onClick={closeWhenToWatchModal}
        onKeyDown={() => {}}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="when-to-watch-title"
        className={`${textClass} relative z-[111] box-border w-full max-w-[min(92vw,556px)] rounded-2xl bg-white shadow-xl`}
        style={{ width: MODAL_WIDTH, padding: scale(36, 0.65) }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={`absolute top-3 flex h-8 w-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-xl text-black hover:opacity-60 ${isRtl ? "left-3 right-auto" : "right-3 left-auto"}`}
          aria-label={t.a11y.close}
          onClick={closeWhenToWatchModal}
        >
          ×
        </button>

        <h2
          id="when-to-watch-title"
          className={`pb-6 text-center font-extrabold ${isRtl ? "" : "uppercase"}`}
          style={{
            color: BRAND_RED,
            fontFamily,
            fontSize: TITLE_SIZE,
          }}
        >
          {t.whenToWatchModal.title}
        </h2>

        <WhenToWatchDatePicker
          value={draftDate}
          onChange={setDraftDate}
          placeholder={t.whenToWatchModal.selectDate}
          fieldHeight={FIELD_HEIGHT}
          fieldFontSize={FIELD_FONT_SIZE}
          matches={campaignDraft?.matches}
        />

        <button
          type="button"
          disabled={!canProceed}
          onClick={goToWhereToWatch}
          className={`${textClass} w-full cursor-pointer rounded-md border-0 font-extrabold text-white transition-opacity disabled:cursor-not-allowed ${isRtl ? "" : "uppercase"}`}
          style={{
            height: BTN_HEIGHT,
            fontSize: BTN_FONT_SIZE,
            fontFamily,
            backgroundColor: canProceed ? SCHEDULE_RED : DISABLED_BTN_BG,
            letterSpacing: isRtl ? undefined : "0.12em",
          }}
        >
          {t.whenToWatchModal.whereToWatch}
        </button>
      </div>
    </div>,
    document.body,
  );
}
