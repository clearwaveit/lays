/** Country / team name → ISO 3166-1 alpha-2 for flagcdn.com (circular flags in match cards). */
const TEAM_ISO_CODES: Record<string, string> = {
  Algeria: "dz",
  Argentina: "ar",
  Australia: "au",
  Austria: "at",
  Belgium: "be",
  "Bosnia and Herzegovina": "ba",
  Brazil: "br",
  "Cabo Verde": "cv",
  Canada: "ca",
  Colombia: "co",
  "Congo DR": "cd",
  Croatia: "hr",
  Curaçao: "cw",
  Czechia: "cz",
  "Côte d'Ivoire": "ci",
  Ecuador: "ec",
  Egypt: "eg",
  England: "gb-eng",
  France: "fr",
  Germany: "de",
  Ghana: "gh",
  Haiti: "ht",
  "IR Iran": "ir",
  Iraq: "iq",
  Japan: "jp",
  Jordan: "jo",
  "Korea Republic": "kr",
  Mexico: "mx",
  Morocco: "ma",
  Netherlands: "nl",
  "New Zealand": "nz",
  Norway: "no",
  Panama: "pa",
  Paraguay: "py",
  Portugal: "pt",
  Qatar: "qa",
  "Saudi Arabia": "sa",
  Scotland: "gb-sct",
  Senegal: "sn",
  "South Africa": "za",
  Spain: "es",
  Sweden: "se",
  Switzerland: "ch",
  Tunisia: "tn",
  Türkiye: "tr",
  USA: "us",
  Uruguay: "uy",
  Uzbekistan: "uz",
};

const PLACEHOLDER_FLAG = "/assets/imgs/football.png";
/** Width requested from flagcdn (2× max card flag size for retina). */
const FLAG_CDN_SIZE = 320;

function isPlaceholderTeamName(name: string): boolean {
  const normalized = name.trim();
  return (
    normalized.startsWith("Group ") ||
    normalized.startsWith("Winner Match ") ||
    normalized.startsWith("Runner-up Match ")
  );
}

export function getTeamFlagSrc(teamName: string): string {
  if (isPlaceholderTeamName(teamName)) {
    return PLACEHOLDER_FLAG;
  }

  const iso = TEAM_ISO_CODES[teamName];
  if (!iso) {
    return PLACEHOLDER_FLAG;
  }

  return `https://flagcdn.com/w${FLAG_CDN_SIZE}/${iso}.png`;
}

export function isRemoteTeamFlag(flagSrc: string): boolean {
  return flagSrc.startsWith("https://");
}
