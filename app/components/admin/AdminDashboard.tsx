"use client";

import type { MatchFixture, MatchWinnerSide } from "@/app/data/matches";
import { parseMatchDateLabel } from "@/app/data/matches";
import {
  ADMIN_DRAFT_STORAGE_KEY,
  type AdminDraft,
  type AdminTeam,
  type AdminVenue,
  allVenueIds,
  matchVenueIds,
  initialAdminDraft,
  normalizeAdminDraft,
  fetchAdminDraft,
  persistCampaignDraftToStorage,
  saveAdminDraft,
} from "@/app/lib/adminCampaignDraft";
import { useEffect, useMemo, useState } from "react";

type AdminTab = "overview" | "matches" | "teams" | "restaurants" | "schedule" | "tracking";

const emptyMatch: MatchFixture = {
  matchNo: 0,
  dateLabel: "2026-06-11",
  time: "20:00",
  timeSuffix: "GST",
  home: { name: "Team A", flag: "/assets/imgs/football.png" },
  away: { name: "Team B", flag: "/assets/imgs/football.png" },
  venueIds: allVenueIds(),
};

function stageForMatch(match: MatchFixture) {
  const { month, day } = parseMatchDateLabel(match.dateLabel);
  if (month === 6) {
    if (day >= 19) return "Final";
    if (day >= 14) return "Semi-final";
    if (day >= 9) return "Quarter-final";
  }
  if (month === 6 || (month === 5 && day >= 28)) return "Knockout";
  return "Group / Round of 32";
}

function statLabel(value: number, label: string) {
  return `${value.toLocaleString()} ${label}`;
}

function downloadJson(filename: string, draft: AdminDraft) {
  const blob = new Blob([JSON.stringify(draft, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function uploadAdminImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/admin/upload", { method: "POST", body: formData }).then(
    async (response) => {
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to upload image");
      }
      return (await response.json()) as { path: string };
    },
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "url";
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      />
    </label>
  );
}

function WinnerField({
  label,
  homeName,
  awayName,
  value,
  onChange,
}: {
  label: string;
  homeName: string;
  awayName: string;
  value: MatchWinnerSide | null | undefined;
  onChange: (value: MatchWinnerSide | null) => void;
}) {
  const selectValue = value === "home" || value === "away" ? value : "";

  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
      {label}
      <select
        value={selectValue}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next === "home" || next === "away" ? next : null);
        }}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
      >
        <option value="">Not played / no result</option>
        <option value="home">{homeName} wins</option>
        <option value="away">{awayName} wins</option>
      </select>
    </label>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [draft, setDraft] = useState<AdminDraft>(() => initialAdminDraft());
  const [savedDraft, setSavedDraft] = useState<AdminDraft>(() => initialAdminDraft());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [matchQuery, setMatchQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedDraft),
    [draft, savedDraft],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      try {
        const apiDraft = await fetchAdminDraft();
        if (cancelled) return;
        setDraft(apiDraft);
        setSavedDraft(apiDraft);
        window.localStorage.setItem(ADMIN_DRAFT_STORAGE_KEY, JSON.stringify(apiDraft));
        persistCampaignDraftToStorage(apiDraft);
        setLastSavedAt("Loaded from API");
      } catch {
        const stored = window.localStorage.getItem(ADMIN_DRAFT_STORAGE_KEY);
        if (!stored) return;
        try {
          const parsed = normalizeAdminDraft(JSON.parse(stored) as Partial<AdminDraft>);
          if (cancelled) return;
          setDraft(parsed);
          setSavedDraft(parsed);
          setLastSavedAt("Loaded browser draft");
        } catch {
          if (!cancelled) setLastSavedAt("Could not load saved draft");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadDraft();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await saveAdminDraft(draft);
      setDraft(saved);
      setSavedDraft(saved);
      window.localStorage.setItem(ADMIN_DRAFT_STORAGE_KEY, JSON.stringify(saved));
      persistCampaignDraftToStorage(saved);
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch {
      setSaveError("Could not save draft. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setDraft(savedDraft);
    setSaveError(null);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const filteredMatches = useMemo(() => {
    const query = matchQuery.trim().toLowerCase();
    if (!query) return draft.matches;
    return draft.matches.filter((match) =>
      `${match.dateLabel} ${match.time} ${match.home.name} ${match.away.name}`
        .includes(query),
    );
  }, [draft.matches, matchQuery]);

  const filteredTeams = useMemo(() => {
    const query = teamQuery.trim().toLowerCase();
    if (!query) return draft.teams;
    return draft.teams.filter((team) => team.name.toLowerCase().includes(query));
  }, [draft.teams, teamQuery]);

  const filteredRestaurants = useMemo(() => {
    const query = restaurantQuery.trim().toLowerCase();
    if (!query) return draft.restaurants;
    return draft.restaurants.filter((restaurant) =>
      `${restaurant.id} ${restaurant.alt} ${restaurant.city}`.toLowerCase().includes(query),
    );
  }, [draft.restaurants, restaurantQuery]);

  const scheduleGroups = useMemo(() => {
    const groups = new Map<string, MatchFixture[]>();
    for (const match of draft.matches) {
      const key = `${stageForMatch(match)} / ${match.dateLabel}`;
      groups.set(key, [...(groups.get(key) ?? []), match]);
    }
    return [...groups.entries()];
  }, [draft.matches]);

  const updateMatch = (index: number, patch: Partial<MatchFixture>) => {
    setDraft((current) => ({
      ...current,
      matches: current.matches.map((match, matchIndex) =>
        matchIndex === index ? { ...match, ...patch } : match,
      ),
    }));
  };

  const updateMatchTeam = (
    index: number,
    side: "home" | "away",
    patch: Partial<AdminTeam>,
  ) => {
    setDraft((current) => ({
      ...current,
      matches: current.matches.map((match, matchIndex) =>
        matchIndex === index
          ? { ...match, [side]: { ...match[side], ...patch } }
          : match,
      ),
    }));
  };

  const updateMatchVenue = (index: number, venueId: string, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      matches: current.matches.map((match, matchIndex) => {
        if (matchIndex !== index) return match;
        const currentVenueIds = matchVenueIds(match);
        const venueIds = checked
          ? [...new Set([...currentVenueIds, venueId])]
          : currentVenueIds.filter((id) => id !== venueId);
        return { ...match, venueIds };
      }),
    }));
  };

  const updateTeam = (index: number, patch: Partial<AdminTeam>) => {
    setDraft((current) => ({
      ...current,
      teams: current.teams.map((team, teamIndex) =>
        teamIndex === index ? { ...team, ...patch } : team,
      ),
    }));
  };

  const updateRestaurant = (index: number, patch: Partial<AdminVenue>) => {
    setDraft((current) => ({
      ...current,
      restaurants: current.restaurants.map((restaurant, restaurantIndex) =>
        restaurantIndex === index ? { ...restaurant, ...patch } : restaurant,
      ),
    }));
  };

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "matches", label: "Matches" },
    { id: "teams", label: "Teams" },
    { id: "restaurants", label: "Restaurants" },
    { id: "schedule", label: "Schedule" },
    { id: "tracking", label: "Tracking" },
  ];

  return (
    <main className="min-h-dvh bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-600">
              Lay's Campaign Admin
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              Campaign Control Room
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              API-backed manager for matches, teams, restaurants, schedule grouping,
              and tracking IDs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={!hasUnsavedChanges || isSaving || isLoading}
              className="h-11 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? "Saving..." : hasUnsavedChanges ? "Save Draft" : "Saved"}
            </button>
            <button
              type="button"
              onClick={handleDiscardChanges}
              disabled={!hasUnsavedChanges || isSaving || isLoading}
              className="h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={() => downloadJson("lays-campaign-admin-draft.json", draft)}
              className="h-11 rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => {
                const reset = initialAdminDraft();
                setDraft(reset);
                setSaveError(null);
              }}
              className="h-11 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-50"
            >
              Reset Draft
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-11 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-4 lg:self-start">
            <nav className="grid gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              <strong className="block text-slate-950">Draft status</strong>
              {isLoading
                ? "Loading..."
                : hasUnsavedChanges
                  ? "Unsaved changes"
                  : lastSavedAt
                    ? `Saved: ${lastSavedAt}`
                    : "Ready"}
              {saveError ? (
                <span className="mt-2 block font-bold text-red-600">{saveError}</span>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {activeTab === "overview" ? (
              <div className="grid gap-6">
                <SectionHeader
                  title="Overview"
                  description="A quick read of the data the campaign currently depends on."
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    statLabel(draft.matches.length, "matches"),
                    statLabel(draft.teams.length, "teams"),
                    statLabel(draft.restaurants.length, "restaurants"),
                    statLabel(scheduleGroups.length, "schedule groups"),
                  ].map((stat) => (
                    <div key={stat} className="rounded-lg border border-slate-200 p-4">
                      <p className="text-2xl font-black">{stat.split(" ")[0]}</p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {stat.replace(stat.split(" ")[0] ?? "", "").trim()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-950">
                  This admin currently stores changes in browser local storage. Once the
                  backend exists, matches should keep a many-to-many relationship with
                  restaurants, restaurant logos should be uploaded to permanent storage,
                  and the frontend should read the same API resources.
                </div>
              </div>
            ) : null}

            {activeTab === "matches" ? (
              <div className="grid gap-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <SectionHeader
                    title="Matches"
                    description="Edit match date, time, teams, winner (for grey loser flags on the site), and restaurants."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        matches: [emptyMatch, ...current.matches],
                      }))
                    }
                    className="h-11 rounded-md bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Add Match
                  </button>
                </div>
                <Field label="Search matches" value={matchQuery} onChange={setMatchQuery} />
                <div className="grid gap-3">
                  {filteredMatches.slice(0, 60).map((match) => {
                    const realIndex = draft.matches.indexOf(match);
                    return (
                      <article
                        key={`${realIndex}-${match.dateLabel}-${match.time}`}
                        className="grid gap-3 rounded-lg border border-slate-200 p-4 xl:grid-cols-[72px_120px_110px_1fr_1fr_84px]"
                      >
                        <Field
                          label="Match #"
                          value={match.matchNo || ""}
                          onChange={(value) =>
                            updateMatch(realIndex, {
                              matchNo: Number.parseInt(value, 10) || 0,
                            })
                          }
                          type="number"
                        />
                        <Field
                          label="Date"
                          value={match.dateLabel}
                          onChange={(value) => updateMatch(realIndex, { dateLabel: value })}
                        />
                        <Field
                          label="Time"
                          value={match.time}
                          onChange={(value) => updateMatch(realIndex, { time: value })}
                        />
                        <Field
                          label="Home"
                          value={match.home.name}
                          onChange={(value) => updateMatchTeam(realIndex, "home", { name: value })}
                        />
                        <Field
                          label="Away"
                          value={match.away.name}
                          onChange={(value) => updateMatchTeam(realIndex, "away", { name: value })}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              matches: current.matches.filter((_, index) => index !== realIndex),
                            }))
                          }
                          className="h-10 self-end rounded-md border border-red-200 bg-red-50 text-sm font-bold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                        <div className="xl:col-span-6">
                          <WinnerField
                            label="Match result (loser flag shows grey on site)"
                            homeName={match.home.name}
                            awayName={match.away.name}
                            value={match.winnerSide}
                            onChange={(winnerSide) =>
                              updateMatch(realIndex, { winnerSide: winnerSide ?? undefined })
                            }
                          />
                        </div>
                        <div className="grid gap-2 xl:col-span-6">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                              Restaurants showing this match
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                updateMatch(realIndex, {
                                  venueIds: draft.restaurants.map((restaurant) => restaurant.id),
                                })
                              }
                              className="text-xs font-bold text-red-600 hover:text-red-700"
                            >
                              Select all
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {draft.restaurants.map((restaurant) => (
                              <label
                                key={`${realIndex}-${restaurant.id}`}
                                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={matchVenueIds(match).includes(restaurant.id)}
                                  onChange={(event) =>
                                    updateMatchVenue(
                                      realIndex,
                                      restaurant.id,
                                      event.target.checked,
                                    )
                                  }
                                />
                                {restaurant.alt}
                                <span className="text-xs font-medium text-slate-400">
                                  {restaurant.city}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === "teams" ? (
              <div className="grid gap-5">
                <SectionHeader
                  title="Teams"
                  description="Manage country/team names and flag image URLs used across match cards and the schedule."
                />
                <Field label="Search teams" value={teamQuery} onChange={setTeamQuery} />
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredTeams.map((team) => {
                    const realIndex = draft.teams.indexOf(team);
                    const appearances = draft.matches.filter(
                      (match) => match.home.name === team.name || match.away.name === team.name,
                    ).length;
                    return (
                      <article
                        key={`${realIndex}-${team.name}`}
                        className="grid gap-3 rounded-lg border border-slate-200 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={team.flag}
                            alt=""
                            className="size-10 rounded-full border border-slate-200 object-cover"
                          />
                          <div>
                            <p className="font-black">{team.name}</p>
                            <p className="text-xs font-bold text-slate-500">
                              {appearances} matches
                            </p>
                          </div>
                        </div>
                        <Field
                          label="Name"
                          value={team.name}
                          onChange={(value) => updateTeam(realIndex, { name: value })}
                        />
                        <Field
                          label="Flag URL"
                          value={team.flag}
                          onChange={(value) => updateTeam(realIndex, { flag: value })}
                          type="url"
                        />
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === "restaurants" ? (
              <div className="grid gap-5">
                <SectionHeader
                  title="Restaurants"
                  description="Manage venue identity, city, uploaded logo, and map/location URL."
                />
                <Field
                  label="Search restaurants"
                  value={restaurantQuery}
                  onChange={setRestaurantQuery}
                />
                <div className="grid gap-3">
                  {filteredRestaurants.map((restaurant) => {
                    const realIndex = draft.restaurants.indexOf(restaurant);
                    return (
                      <article
                        key={restaurant.id}
                        className="grid gap-3 rounded-lg border border-slate-200 p-4 xl:grid-cols-[1fr_1fr_1fr]"
                      >
                        <div className="xl:col-span-3 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={restaurant.src}
                              alt=""
                              className="h-12 w-20 rounded-md border border-slate-200 bg-white object-contain p-2"
                            />
                            <div className="min-w-0">
                            <p className="font-black">{restaurant.alt}</p>
                            <p className="text-xs font-bold text-slate-500">{restaurant.id}</p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm font-bold">
                            <input
                              type="checkbox"
                              checked={restaurant.enabled}
                              onChange={(event) =>
                                updateRestaurant(realIndex, { enabled: event.target.checked })
                              }
                            />
                            Enabled
                          </label>
                        </div>
                        <Field
                          label="Name"
                          value={restaurant.alt}
                          onChange={(value) => updateRestaurant(realIndex, { alt: value })}
                        />
                        <Field
                          label="City"
                          value={restaurant.city}
                          onChange={(value) => updateRestaurant(realIndex, { city: value })}
                        />
                        <Field
                          label="Logo path"
                          value={restaurant.src}
                          onChange={(value) => updateRestaurant(realIndex, { src: value })}
                        />
                        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Upload logo
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml,.svg"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              try {
                                const { path: src } = await uploadAdminImage(file);
                                updateRestaurant(realIndex, { src });
                              } catch (error) {
                                setSaveError(
                                  error instanceof Error
                                    ? error.message
                                    : "Could not upload logo.",
                                );
                              }
                              event.target.value = "";
                            }}
                            className="rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
                          />
                        </label>
                        <div className="xl:col-span-3">
                          <Field
                            label="Location URL"
                            value={restaurant.locationUrl}
                            onChange={(value) =>
                              updateRestaurant(realIndex, { locationUrl: value })
                            }
                            type="url"
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === "schedule" ? (
              <div className="grid gap-5">
                <SectionHeader
                  title="Schedule"
                  description="Grouped by round and date. Set the winner here to grey the losing team's flag on the public site."
                />
                <div className="grid gap-3">
                  {scheduleGroups.map(([group, matches]) => (
                    <details key={group} className="rounded-lg border border-slate-200 p-4" open>
                      <summary className="cursor-pointer text-sm font-black text-slate-950">
                        {group} ({matches.length})
                      </summary>
                      <div className="mt-3 grid gap-2">
                        {matches.map((match) => {
                          const realIndex = draft.matches.indexOf(match);
                          return (
                            <div
                              key={`${group}-${match.matchNo}-${match.time}-${match.home.name}-${match.away.name}`}
                              className="grid gap-2 rounded-md bg-slate-50 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,240px)] sm:items-center"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-xs font-bold text-slate-400">
                                  #{match.matchNo}
                                </span>
                                <span className="font-black">
                                  {match.time} {match.timeSuffix}
                                </span>
                                <span>{match.home.name}</span>
                                <span className="text-slate-400">vs</span>
                                <span>{match.away.name}</span>
                              </div>
                              {realIndex >= 0 ? (
                                <WinnerField
                                  label="Winner"
                                  homeName={match.home.name}
                                  awayName={match.away.name}
                                  value={match.winnerSide}
                                  onChange={(winnerSide) =>
                                    updateMatch(realIndex, {
                                      winnerSide: winnerSide ?? undefined,
                                    })
                                  }
                                />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "tracking" ? (
              <div className="grid gap-5">
                <SectionHeader
                  title="Tracking"
                  description="Tracking IDs for reference. Google Analytics and Microsoft Clarity are loaded site-wide from the root layout."
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <Field
                    label="Google Tag Manager"
                    value={draft.tracking.googleTagManagerId}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        tracking: { ...current.tracking, googleTagManagerId: value },
                      }))
                    }
                  />
                  <Field
                    label="Google Analytics"
                    value={draft.tracking.googleAnalyticsId}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        tracking: { ...current.tracking, googleAnalyticsId: value },
                      }))
                    }
                  />
                  <Field
                    label="Microsoft Clarity"
                    value={draft.tracking.microsoftClarityId}
                    onChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        tracking: { ...current.tracking, microsoftClarityId: value },
                      }))
                    }
                  />
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  Microsoft Clarity can be integrated later with its script ID. It should
                  not be hardcoded until the final domain, consent requirements, and
                  analytics ownership are confirmed.
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
