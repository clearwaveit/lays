import {
  MATCHES,
  normalizeMatchDateLabel,
  type MatchFixture,
} from "@/app/data/matches";
import { getTeamFlagSrc } from "@/app/data/team-flags";
import { VENUES } from "@/app/data/venues";
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

export const DEFAULT_TRACKING: TrackingSettings = {
  googleTagManagerId: "",
  googleAnalyticsId: "",
  microsoftClarityId: "",
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
};

const REMOVED_VENUE_IDS = new Set(["loui-dubai"]);

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
  draftMatches: MatchFixture[],
): MatchFixture | undefined {
  if (source.matchNo) {
    const byMatchNo = draftMatches.find((match) => match.matchNo === source.matchNo);
    if (byMatchNo) return byMatchNo;
  }

  const sourceKey = matchIdentityKey(source);
  return draftMatches.find((match) => matchIdentityKey(match) === sourceKey);
}

/** Merge admin-edited match fields onto the current MATCHES roster. */
export function applySourceScheduleToDraftMatches(
  draftMatches: MatchFixture[],
): MatchFixture[] {
  return MATCHES.map((source) => {
    const draft = findDraftMatchForSource(source, draftMatches);
    if (!draft) {
      return {
        ...source,
        venueIds: matchVenueIds(source),
      };
    }
    return {
      ...source,
      dateLabel: normalizeMatchDateLabel(draft.dateLabel),
      time: draft.time,
      timeSuffix: draft.timeSuffix || source.timeSuffix,
      home: {
        ...draft.home,
        flag: sanitizeStoredImageSrc(draft.home.flag, source.home.flag),
      },
      away: {
        ...draft.away,
        flag: sanitizeStoredImageSrc(draft.away.flag, source.away.flag),
      },
      venueIds: matchVenueIds(draft),
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
  const syncedMatches = applySourceScheduleToDraftMatches(
    draft.matches ?? fallback.matches,
  );
  const matches = syncedMatches.map((match) => {
    const venueIds = migrateVenueIds(matchVenueIds(match)).filter((id) =>
      allowedVenueIds.has(id),
    );
    return {
      ...match,
      dateLabel: normalizeMatchDateLabel(match.dateLabel),
      venueIds: venueIds.length > 0 ? venueIds : restaurants.map((restaurant) => restaurant.id),
    };
  });
  const teams = (draft.teams ?? uniqueTeamsFromMatches(matches)).map((team) => ({
    ...team,
    flag: sanitizeStoredImageSrc(team.flag, getTeamFlagSrc(team.name) ?? team.flag),
  }));

  return {
    matches,
    teams,
    restaurants,
    tracking: { ...DEFAULT_TRACKING, ...(draft.tracking ?? {}) },
  };
}
