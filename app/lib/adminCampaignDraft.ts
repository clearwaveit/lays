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

export async function fetchAdminDraft() {
  const response = await fetch("/api/admin/campaign", { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load campaign draft");
  return normalizeAdminDraft((await response.json()) as Partial<AdminDraft>);
}

export async function saveAdminDraft(draft: AdminDraft) {
  const response = await fetch("/api/admin/campaign", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!response.ok) throw new Error("Unable to save campaign draft");
  return normalizeAdminDraft((await response.json()) as Partial<AdminDraft>);
}

export function useAdminCampaignDraft() {
  const [draft, setDraft] = useState<AdminDraft | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAdminDraft()
      .then((apiDraft) => {
        if (cancelled) return;
        setDraft(apiDraft);
        window.localStorage.setItem(ADMIN_DRAFT_STORAGE_KEY, JSON.stringify(apiDraft));
      })
      .catch(() => {
        if (!cancelled) setDraft(readAdminDraftFromStorage());
      });

    const onStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_DRAFT_STORAGE_KEY) {
        setDraft(readAdminDraftFromStorage());
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
