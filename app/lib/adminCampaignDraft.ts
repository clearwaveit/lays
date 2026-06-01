"use client";

import {
  ADMIN_DRAFT_STORAGE_KEY,
  type AdminDraft,
  normalizeAdminDraft,
} from "@/app/lib/campaignDraftCore";
import { useEffect, useState } from "react";

export {
  ADMIN_DRAFT_STORAGE_KEY,
  DEFAULT_TRACKING,
  allVenueIds,
  cityFromVenueId,
  initialAdminDraft,
  isMatchAssignedToVenue,
  matchVenueIds,
  normalizeAdminDraft,
  uniqueTeamsFromMatches,
  type AdminDraft,
  type AdminTeam,
  type AdminVenue,
  type TrackingSettings,
} from "@/app/lib/campaignDraftCore";

export function readAdminDraftFromStorage(): AdminDraft | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(ADMIN_DRAFT_STORAGE_KEY);
  if (!stored) return null;

  try {
    return normalizeAdminDraft(JSON.parse(stored) as Partial<AdminDraft>);
  } catch {
    return null;
  }
}

export type CampaignDraft = Pick<AdminDraft, "matches" | "restaurants">;

export const CAMPAIGN_DRAFT_STORAGE_KEY = "lays-campaign-v1";

function normalizeCampaignDraft(draft: Partial<CampaignDraft>): CampaignDraft {
  const normalized = normalizeAdminDraft(draft);
  return {
    matches: normalized.matches,
    restaurants: normalized.restaurants,
  };
}

export function readCampaignDraftFromStorage(): CampaignDraft | null {
  if (typeof window === "undefined") return null;
  const stored =
    window.localStorage.getItem(CAMPAIGN_DRAFT_STORAGE_KEY) ??
    window.localStorage.getItem(ADMIN_DRAFT_STORAGE_KEY);
  if (!stored) return null;

  try {
    return normalizeCampaignDraft(JSON.parse(stored) as Partial<CampaignDraft>);
  } catch {
    return null;
  }
}

export async function fetchCampaignDraft() {
  const response = await fetch("/api/campaign", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load campaign");
  return normalizeCampaignDraft((await response.json()) as Partial<CampaignDraft>);
}

export function persistCampaignDraftToStorage(
  draft: Pick<AdminDraft, "matches" | "restaurants">,
) {
  if (typeof window === "undefined") return;
  const campaignDraft = normalizeCampaignDraft(draft);
  window.localStorage.setItem(CAMPAIGN_DRAFT_STORAGE_KEY, JSON.stringify(campaignDraft));
}

export async function fetchAdminDraft() {
  const response = await fetch("/api/admin/campaign", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load campaign draft");
  return normalizeAdminDraft((await response.json()) as Partial<AdminDraft>);
}

export async function saveAdminDraft(draft: AdminDraft) {
  const payload = JSON.stringify(draft);
  if (payload.length > 20 * 1024 * 1024) {
    throw new Error(
      "Draft is too large to save. Re-upload restaurant logos or use Reset Draft.",
    );
  }

  const response = await fetch("/api/admin/campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!response.ok) throw new Error("Unable to save campaign draft");
  return normalizeAdminDraft((await response.json()) as Partial<AdminDraft>);
}

export function useAdminCampaignDraft() {
  const [draft, setDraft] = useState<CampaignDraft | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchCampaignDraft()
      .then((apiDraft) => {
        if (cancelled) return;
        setDraft(apiDraft);
        window.localStorage.setItem(CAMPAIGN_DRAFT_STORAGE_KEY, JSON.stringify(apiDraft));
      })
      .catch(() => {
        if (!cancelled) setDraft(readCampaignDraftFromStorage());
      });

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === CAMPAIGN_DRAFT_STORAGE_KEY ||
        event.key === ADMIN_DRAFT_STORAGE_KEY
      ) {
        setDraft(readCampaignDraftFromStorage());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return draft;
}
