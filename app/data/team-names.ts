import type { Language } from "@/app/context/LanguageContext";

/** FIFA team names in Arabic (keys match `matches.ts` / `team-flags.ts`). */
const TEAM_NAMES_AR: Record<string, string> = {
  Algeria: "الجزائر",
  Argentina: "الأرجنتين",
  Australia: "أستراليا",
  Austria: "النمسا",
  Belgium: "بلجيكا",
  "Bosnia and Herzegovina": "البوسنة والهرسك",
  Brazil: "البرازيل",
  "Cabo Verde": "الرأس الأخضر",
  Canada: "كندا",
  Colombia: "كولومبيا",
  "Congo DR": "جمهورية الكونغو الديمقراطية",
  Croatia: "كرواتيا",
  Curaçao: "كوراساو",
  Czechia: "التشيك",
  "Ivory Coast": "كوت ديفوار",
  Ecuador: "الإكوادور",
  Egypt: "مصر",
  England: "إنجلترا",
  France: "فرنسا",
  Germany: "ألمانيا",
  Ghana: "غانا",
  Haiti: "هايتي",
  "IR Iran": "إيران",
  Iraq: "العراق",
  Japan: "اليابان",
  Jordan: "الأردن",
  "Korea Republic": "كوريا الجنوبية",
  Mexico: "المكسيك",
  Morocco: "المغرب",
  Netherlands: "هولندا",
  "New Zealand": "نيوزيلندا",
  Norway: "النرويج",
  Panama: "بنما",
  Paraguay: "باراغواي",
  Portugal: "البرتغال",
  Qatar: "قطر",
  "Saudi Arabia": "السعودية",
  Scotland: "اسكتلندا",
  Senegal: "السنغال",
  "South Africa": "جنوب أفريقيا",
  Spain: "إسبانيا",
  Sweden: "السويد",
  Switzerland: "سويسرا",
  Tunisia: "تونس",
  Türkiye: "تركيا",
  USA: "الولايات المتحدة",
  Uruguay: "أوروغواي",
  Uzbekistan: "أوزبكستان",
};

function translatePlaceholderTeamName(name: string): string {
  const winner = name.match(/^Winner Match (\d+)$/);
  if (winner) return `فائز المباراة ${winner[1]}`;

  const runnerUp = name.match(/^Runner-up Match (\d+)$/);
  if (runnerUp) return `وصيف المباراة ${runnerUp[1]}`;

  const groupWinner = name.match(/^Group ([A-L]) winners$/);
  if (groupWinner) return `فائز المجموعة ${groupWinner[1]}`;

  const groupRunnerUp = name.match(/^Group ([A-L]) runners-up$/);
  if (groupRunnerUp) return `وصيف المجموعة ${groupRunnerUp[1]}`;

  const thirdPlace = name.match(/^Group (.+) third place$/);
  if (thirdPlace) return `ثالث المجموعات ${thirdPlace[1]}`;

  return name;
}

export function getTeamDisplayName(name: string, language: Language): string {
  if (language !== "ar") return name;
  return TEAM_NAMES_AR[name] ?? translatePlaceholderTeamName(name);
}
