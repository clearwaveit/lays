import {
  MATCHES,
  normalizeMatchDateLabel,
  type MatchFixture,
} from "@/app/data/matches";
import { getTeamFlagSrc, resolveTeamFlag } from "@/app/data/team-flags";
import { VENUES } from "@/app/data/venues";
import { hasMatchScore, normalizeMatchScore } from "@/app/lib/matchResult";
import { isKnockoutPlaceholderTeamName } from "@/app/lib/matchTeamAdmin";
import { sanitizeStoredImageSrc } from "@/app/lib/sanitizeImageSrc";
import type { VenueModalData } from "@/app/components/ui/VenueModal";

export type AdminTeam = {
  name: string;
  flag: string;
};

export type AdminVenue = VenueModalData & {
  enabled: boolean;
  city: string;
};

export type TrackingSettings = {
  googleTagManagerId: string;
  googleAnalyticsId: string;
  microsoftClarityId: string;
};

export type AdminDraft = {
  matches: MatchFixture[];
  teams: AdminTeam[];
  restaurants: AdminVenue[];
  tracking: TrackingSettings;
};

export const ADMIN_DRAFT_STORAGE_KEY = "lays-admin-draft-v1";
export const CAMPAIGN_DRAFT_UPDATED_EVENT = "lays-campaign-updated";

export const DEFAULT_TRACKING: TrackingSettings = {
  googleTagManagerId: "",
  googleAnalyticsId: "G-PQDKX0GZQJ",
  microsoftClarityId: "x15621wldl",
};

export function allVenueIds() {
  return Object.keys(VENUES);
}

export function matchVenueIds(match: MatchFixture) {
  return match.venueIds && match.venueIds.length > 0
    ? match.venueIds
    : allVenueIds();
}

export function isMatchAssignedToVenue(match: MatchFixture, venueId: string) {
  return matchVenueIds(match).includes(venueId);
}

export function isVenueEnabled(
  venueId: string,
  restaurants: AdminVenue[] | undefined,
): boolean {
  if (!restaurants) return true;
  const restaurant = restaurants.find((entry) => entry.id === venueId);
  return restaurant?.enabled ?? true;
}

export function getEnabledRestaurants(restaurants: AdminVenue[]): AdminVenue[] {
  return restaurants.filter((restaurant) => restaurant.enabled);
}

export function uniqueTeamsFromMatches(matches: MatchFixture[]): AdminTeam[] {
  const teams = new Map<string, AdminTeam>();
  for (const match of matches) {
    teams.set(match.home.name, { name: match.home.name, flag: match.home.flag });
    teams.set(match.away.name, { name: match.away.name, flag: match.away.flag });
  }
  return [...teams.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function cityFromVenueId(id: string) {
  if (id.includes("abu-dhabi")) return "Abu Dhabi";
  if (id.includes("dubai")) return "Dubai";
  return "";
}

/** Legacy admin/match venue IDs → current roster. */
const VENUE_ID_MIGRATIONS: Record<string, string> = {
  "bla-bla-dubai": "amanos-dubai",
  "luoi-dubai": "loui-dubai",
};

const REMOVED_VENUE_IDS = new Set<string>();

export function migrateVenueId(id: string): string | null {
  if (REMOVED_VENUE_IDS.has(id)) return null;
  return VENUE_ID_MIGRATIONS[id] ?? id;
}

export function migrateVenueIds(ids: string[]): string[] {
  const migrated = ids
    .map(migrateVenueId)
    .filter((id): id is string => Boolean(id));
  return [...new Set(migrated)];
}

/** Add enabled venues for cities already assigned to a match (e.g. new Dubai restaurant). */
function augmentMatchVenueIds(
  venueIds: string[],
  restaurants: AdminVenue[],
): string[] {
  const merged = new Set(migrateVenueIds(venueIds));
  const citiesPresent = new Set<string>(
    [...merged]
      .map((id) => cityFromVenueId(id))
      .filter((city) => city.length > 0),
  );

  for (const restaurant of restaurants) {
    if (!restaurant.enabled) continue;
    const city = restaurant.city || cityFromVenueId(restaurant.id);
    if (!city.length || !citiesPresent.has(city)) continue;
    merged.add(restaurant.id);
  }

  return [...merged];
}

function buildRestaurantsFromDraft(
  draftRestaurants: AdminVenue[] | undefined,
): AdminVenue[] {
  const draftById = new Map(
    (draftRestaurants ?? []).map((restaurant) => [restaurant.id, restaurant]),
  );

  return Object.values(VENUES).map((venue) => {
    const existing = draftById.get(venue.id);
    return {
      ...venue,
      enabled: existing?.enabled ?? true,
      city: existing?.city || cityFromVenueId(venue.id),
      alt: venue.alt,
      locationUrl: venue.locationUrl,
      src: sanitizeStoredImageSrc(existing?.src ?? venue.src, venue.src),
      logoWidth: venue.logoWidth,
      logoHeight: venue.logoHeight,
      subtitleImage: existing?.subtitleImage ?? venue.subtitleImage,
    };
  });
}

function matchIdentityKey(match: MatchFixture): string {
  const home = match.home.name.trim().toLowerCase();
  const away = match.away.name.trim().toLowerCase();
  return home < away ? `${home}|${away}` : `${away}|${home}`;
}

function findDraftMatchForSource(
  source: MatchFixture,
  draftByMatchNo: Map<number, MatchFixture>,
): MatchFixture | undefined {
  const sourceNo = Number(source.matchNo);
  if (Number.isFinite(sourceNo) && sourceNo > 0) {
    const byMatchNo = draftByMatchNo.get(sourceNo);
    if (byMatchNo) return byMatchNo;
  }

  const sourceKey = matchIdentityKey(source);
  return [...draftByMatchNo.values()].find(
    (match) => matchIdentityKey(match) === sourceKey,
  );
}

function indexDraftMatchesByNo(draftMatches: MatchFixture[]): Map<number, MatchFixture> {
  const byNo = new Map<number, MatchFixture>();
  for (const match of draftMatches) {
    const matchNo = Number(match.matchNo);
    if (!Number.isFinite(matchNo) || matchNo <= 0) continue;
    const existing = byNo.get(matchNo);
    if (!existing) {
      byNo.set(matchNo, match);
      continue;
    }
    if (hasMatchScore(match) && !hasMatchScore(existing)) {
      byNo.set(matchNo, match);
    }
  }
  return byNo;
}

function resolveDraftMatchTeam(team: AdminTeam): AdminTeam {
  const name = team.name.trim();
  const defaultFlag = getTeamFlagSrc(name);
  if (name === "TBD" || isKnockoutPlaceholderTeamName(name)) {
    return { name, flag: defaultFlag };
  }
  return {
    name,
    flag: resolveTeamFlag(
      sanitizeStoredImageSrc(team.flag, defaultFlag),
      defaultFlag,
    ),
  };
}

/** Merge admin-edited match fields onto the current MATCHES roster. */
export function applySourceScheduleToDraftMatches(
  draftMatches: MatchFixture[],
): MatchFixture[] {
  const draftByMatchNo = indexDraftMatchesByNo(draftMatches);
  return MATCHES.map((source) => {
    const draft = findDraftMatchForSource(source, draftByMatchNo);
    if (!draft) {
      return {
        ...source,
        venueIds: matchVenueIds(source),
      };
    }
    const winnerSide =
      draft.winnerSide === "home" || draft.winnerSide === "away"
        ? draft.winnerSide
        : undefined;
    const homeScore = normalizeMatchScore(draft.homeScore);
    const awayScore = normalizeMatchScore(draft.awayScore);
    return {
      ...source,
      dateLabel: normalizeMatchDateLabel(draft.dateLabel),
      time: draft.time,
      timeSuffix: draft.timeSuffix || source.timeSuffix,
      home: resolveDraftMatchTeam(draft.home),
      away: resolveDraftMatchTeam(draft.away),
      venueIds: matchVenueIds(draft),
      winnerSide,
      homeScore,
      awayScore,
    };
  });
}

export function initialAdminDraft(): AdminDraft {
  return {
    matches: MATCHES.map((match) => ({
      ...match,
      venueIds: matchVenueIds(match),
    })),
    teams: uniqueTeamsFromMatches(MATCHES),
    restaurants: Object.values(VENUES).map((venue) => ({
      ...venue,
      enabled: true,
      city: cityFromVenueId(venue.id),
    })),
    tracking: DEFAULT_TRACKING,
  };
}

export function normalizeAdminDraft(draft: Partial<AdminDraft>): AdminDraft {
  const fallback = initialAdminDraft();
  const restaurants = buildRestaurantsFromDraft(draft.restaurants);
  const allowedVenueIds = new Set(restaurants.map((restaurant) => restaurant.id));
  const enabledVenueIds = new Set(
    restaurants.filter((restaurant) => restaurant.enabled).map((restaurant) => restaurant.id),
  );
  const syncedMatches = applySourceScheduleToDraftMatches(
    draft.matches ?? fallback.matches,
  );
  const matches = syncedMatches.map((match) => {
    const venueIds = augmentMatchVenueIds(matchVenueIds(match), restaurants).filter(
      (id) => allowedVenueIds.has(id) && enabledVenueIds.has(id),
    );
    const winnerSide =
      match.winnerSide === "home" || match.winnerSide === "away"
        ? match.winnerSide
        : undefined;
    const homeScore = normalizeMatchScore(match.homeScore);
    const awayScore = normalizeMatchScore(match.awayScore);
    return {
      ...match,
      dateLabel: normalizeMatchDateLabel(match.dateLabel),
      venueIds:
        venueIds.length > 0
          ? venueIds
          : getEnabledRestaurants(restaurants).map((restaurant) => restaurant.id),
      winnerSide,
      homeScore,
      awayScore,
    };
  });
  const teams = (draft.teams ?? uniqueTeamsFromMatches(matches)).map((team) => ({
    ...team,
    flag: resolveTeamFlag(
      sanitizeStoredImageSrc(team.flag, getTeamFlagSrc(team.name) ?? team.flag),
      getTeamFlagSrc(team.name),
    ),
  }));

  return {
    matches,
    teams,
    restaurants,
    tracking: { ...DEFAULT_TRACKING, ...(draft.tracking ?? {}) },
  };
}
