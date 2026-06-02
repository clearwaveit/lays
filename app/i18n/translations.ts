import type { Language } from "@/app/context/LanguageContext";

export const translations = {
  en: {
    nav: {
      whenToWatch: "WHEN TO WATCH",
      whereToWatch: "WHERE TO WATCH",
      seeFullSchedule: "SEE FULL SCHEDULE",
    },
    language: {
      english: "ENGLISH",
      arabic: "العربية",
    },
    languageModal: {
      selectLanguage: "SELECT LANGUAGE",
      selectLanguageAr: "اختر اللغة",
    },
    whenToWatchModal: {
      title: "WHEN TO WATCH",
      selectDate: "SELECT DATE",
      whereToWatch: "Timetable",
    },
    venueModal: {
      openLocation: "OPEN LOCATION",
      viewMatchSchedule: "VIEW MATCH SCHEDULE",
    },
    matchMap: {
      pageTitle: "Match Map",
      subtitle: "FIND OUT ALL THE PLACES SHOWING THE MATCH NEAR YOU",
      subtitleLine1: "",
      subtitleLine2: "",
      logoAlt: "Match Map",
      dubai: "DUBAI",
      abuDhabi: "ABU DHABI",
    },
    matchTimings: {
      pageTitle: "Match timings",
      logoAlt: "Match timings",
      openLocation: "OPEN LOCATION",
      viewLocation: "VIEW LOCATION",
      viewOtherMatchesAtLocation: "VIEW OTHER MATCHES AT THIS LOCATION",
      viewFullSchedule: "VIEW FULL SCHEDULE",
    },
    timetable: {
      pageTitle: "Timetable",
      pageAria: "Match timetable",
    },
    fullSchedule: {
      pageTitle: "Full Schedule",
      pageAria: "Full schedule — knockout bracket",
      logoAlt: "Full Schedule",
      headlineLine1: "WHO'S STILL",
      headlineLine2: "IN THE GAME",
      datePrefix: "DATE:",
      whereToWatch: "WHERE TO WATCH?",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      zoomReset: "Reset zoom",
    },
    hero: {
      headlineAlt: "No Lay's No Game",
      descriptionLine1: "Your Ultimate Football Guide",
      descriptionLine2: "Find the match. Find the crowd.",
    },
    a11y: {
      goBack: "Go back",
      close: "Close",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      campaignNav: "Campaign navigation",
      languageSelection: "Language selection",
      chooseLanguage: "Choose a language",
      dismissLanguage: "Dismiss language selection",
    },
  },
  ar: {
    nav: {
      whenToWatch: "مواعيد المشاهدة",
      whereToWatch: "أماكن المشاهدة",
      seeFullSchedule: "عرض الجدول الكامل",
    },
    language: {
      english: "ENGLISH",
      arabic: "العربية",
    },
    languageModal: {
      selectLanguage: "SELECT LANGUAGE",
      selectLanguageAr: "اختر اللغة",
    },
    whenToWatchModal: {
      title: "مواعيد المشاهدة",
      selectDate: "اختر التاريخ",
      whereToWatch: "الجدول الزمني",
    },
    venueModal: {
      openLocation: "فتح الموقع",
      viewMatchSchedule: "عرض جدول المباريات",
    },
    matchMap: {
      pageTitle: "خريطة المباريات",
      subtitle: "اكتشف كل الأماكن القريبة منك التي تعرض المباراة",
      subtitleLine1: "اكتشف كل الأماكن القريبة",
      subtitleLine2: "منك التي تعرض المباراة",
      logoAlt: "خريطة المباريات",
      dubai: "دبي",
      abuDhabi: "أبوظبي",
    },
    matchTimings: {
      pageTitle: "مواعيد المباراة",
      logoAlt: "مواعيد المباراة",
      openLocation: "فتح الموقع",
      viewLocation: "عرض الموقع",
      viewOtherMatchesAtLocation: "عرض مباريات أخرى في هذا الموقع",
      viewFullSchedule: "عرض الجدول الكامل",
    },
    timetable: {
      pageTitle: "الجدول الزمني",
      pageAria: "جدول المباريات",
    },
    fullSchedule: {
      pageTitle: "الجدول الكامل",
      pageAria: "الجدول الكامل — خريطة خروج المغلوب",
      logoAlt: "الجدول الكامل",
      headlineLine1: "من",
      headlineLine2: "لا يزال في المباراة",
      datePrefix: "التاريخ:",
      whereToWatch: "أين تشاهد؟",
      zoomIn: "تكبير",
      zoomOut: "تصغير",
      zoomReset: "إعادة التكبير",
    },
    hero: {
      headlineAlt: "بدون ليز ما في مباراة",
      descriptionLine1: "دليلك الشامل لكرة القدم",
      descriptionLine2: "اعثر على المباراة. اعثر على الحماس.",
    },
    a11y: {
      goBack: "رجوع",
      close: "إغلاق",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      campaignNav: "التنقل في الحملة",
      languageSelection: "اختيار اللغة",
      chooseLanguage: "اختر لغة",
      dismissLanguage: "إغلاق اختيار اللغة",
    },
  },
} as const;

export function getTranslations(language: Language) {
  return translations[language];
}
