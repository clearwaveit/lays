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

export type Language = "en" | "ar";

const STORAGE_KEY = "lays-language";

type LanguageContextValue = {
  language: Language;
  isRtl: boolean;
  dir: "ltr" | "rtl";
  hasCompletedOnboarding: boolean;
  isReady: boolean;
  showLanguageModal: boolean;
  setLanguage: (lang: Language) => void;
  completeOnboarding: (lang: Language) => void;
  openLanguageModal: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "ar") return stored;
  return null;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    if (stored) {
      setLanguageState(stored);
      setHasCompletedOnboarding(true);
    } else {
      setShowLanguageModal(true);
    }
    setIsReady(true);
  }, []);

  const openLanguageModal = useCallback(() => {
    setShowLanguageModal(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  }, []);

  const completeOnboarding = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      setHasCompletedOnboarding(true);
      setShowLanguageModal(false);
    },
    [setLanguage],
  );

  const isRtl = language === "ar";
  const dir: "ltr" | "rtl" = isRtl ? "rtl" : "ltr";

  const value = useMemo(
    () => ({
      language,
      isRtl,
      dir,
      hasCompletedOnboarding,
      isReady,
      showLanguageModal,
      setLanguage,
      completeOnboarding,
      openLanguageModal,
    }),
    [
      language,
      isRtl,
      dir,
      hasCompletedOnboarding,
      isReady,
      showLanguageModal,
      setLanguage,
      completeOnboarding,
      openLanguageModal,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
