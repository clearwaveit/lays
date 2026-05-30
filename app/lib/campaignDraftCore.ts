import { MATCHES, type MatchFixture } from "@/app/data/matches";
import { VENUES } from "@/app/data/venues";
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
  const restaurants = draft.restaurants ?? fallback.restaurants;
  const allowedVenueIds = new Set(restaurants.map((restaurant) => restaurant.id));
  const matches = (draft.matches ?? fallback.matches).map((match) => {
    const venueIds = matchVenueIds(match).filter((id) => allowedVenueIds.has(id));
    return {
      ...match,
      venueIds: venueIds.length > 0 ? venueIds : restaurants.map((restaurant) => restaurant.id),
    };
  });

  return {
    matches,
    teams: draft.teams ?? uniqueTeamsFromMatches(matches),
    restaurants,
    tracking: { ...DEFAULT_TRACKING, ...(draft.tracking ?? {}) },
  };
}
