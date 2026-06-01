"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { migrateLegacyDateLabel } from "@/app/data/matches";

const DATE_STORAGE_KEY = "lays-selected-date";
const VENUE_STORAGE_KEY = "lays-selected-venue";

type CampaignSelectionContextValue = {
  selectedDate: string | null;
  selectedVenueId: string | null;
  whenToWatchModalOpen: boolean;
  isReady: boolean;
  setSelectedDate: (date: string | null) => void;
  setSelectedVenueId: (venueId: string | null) => void;
  openWhenToWatchModal: () => void;
  closeWhenToWatchModal: () => void;
  resetCampaignSelection: () => void;
};

const CampaignSelectionContext =
  createContext<CampaignSelectionContextValue | null>(null);

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem(key, value);
  else window.sessionStorage.removeItem(key);
}

export function CampaignSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDateState] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueIdState] = useState<string | null>(null);
  const [whenToWatchModalOpen, setWhenToWatchModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSelectedDateState(migrateLegacyDateLabel(readStorage(DATE_STORAGE_KEY)));
    setSelectedVenueIdState(readStorage(VENUE_STORAGE_KEY));
    setIsReady(true);
  }, []);

  const setSelectedDate = useCallback((date: string | null) => {
    setSelectedDateState(date);
    writeStorage(DATE_STORAGE_KEY, date);
  }, []);

  const setSelectedVenueId = useCallback((venueId: string | null) => {
    setSelectedVenueIdState(venueId);
    writeStorage(VENUE_STORAGE_KEY, venueId);
  }, []);

  const openWhenToWatchModal = useCallback(() => {
    setWhenToWatchModalOpen(true);
  }, []);

  const closeWhenToWatchModal = useCallback(() => {
    setWhenToWatchModalOpen(false);
  }, []);

  const resetCampaignSelection = useCallback(() => {
    setSelectedDateState(null);
    setSelectedVenueIdState(null);
    writeStorage(DATE_STORAGE_KEY, null);
    writeStorage(VENUE_STORAGE_KEY, null);
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      selectedVenueId,
      whenToWatchModalOpen,
      isReady,
      setSelectedDate,
      setSelectedVenueId,
      openWhenToWatchModal,
      closeWhenToWatchModal,
      resetCampaignSelection,
    }),
    [
      selectedDate,
      selectedVenueId,
      whenToWatchModalOpen,
      isReady,
      setSelectedDate,
      setSelectedVenueId,
      openWhenToWatchModal,
      closeWhenToWatchModal,
      resetCampaignSelection,
    ],
  );

  return (
    <CampaignSelectionContext.Provider value={value}>
      {children}
    </CampaignSelectionContext.Provider>
  );
}

export function useCampaignSelection() {
  const context = useContext(CampaignSelectionContext);
  if (!context) {
    throw new Error(
      "useCampaignSelection must be used within CampaignSelectionProvider",
    );
  }
  return context;
}
