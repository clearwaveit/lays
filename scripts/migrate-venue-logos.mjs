import { readFileSync, writeFileSync } from "node:fs";

const path = "data/campaign-admin-draft.json";
const data = JSON.parse(readFileSync(path, "utf8"));

const VENUE_ID_MIGRATIONS = { "bla-bla-dubai": "amanos-dubai" };
const REMOVED = new Set(["loui-dubai"]);

function migrateVenueId(id) {
  if (REMOVED.has(id)) return null;
  return VENUE_ID_MIGRATIONS[id] ?? id;
}

function migrateVenueIds(ids) {
  return [...new Set(ids.map(migrateVenueId).filter(Boolean))];
}

const restaurants = [
  {
    id: "mcgettigans-dubai",
    src: "/assets/imgs/mcgettigans.svg",
    alt: "McGettigan's",
    logoWidth: 393,
    logoHeight: 49,
    locationUrl:
      "https://www.google.com/maps/place/Bla+Bla+By+McGettigan's/@25.0743008,55.1292212,17z/data=!4m6!3m5!1s0x3e5f13c4132ac0c9:0x499ffd04a5bb6fe0!8m2!3d25.0743397!4d55.1292427!16s%2Fg%2F11ll4zzfsk?entry=ttu",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "mcgettigans-abu-dhabi",
    src: "/assets/imgs/mcgettigans.svg",
    alt: "McGettigan's",
    subtitleImage: {
      src: "/assets/imgs/reem-mall-abu-dhabi.png",
      width: 272.68,
      height: 14.45,
      alt: "Reem Mall – Abu Dhabi",
    },
    logoWidth: 393,
    logoHeight: 49,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=McGettigan's+Reem+Mall+Abu+Dhabi",
    enabled: true,
    city: "Abu Dhabi",
  },
  {
    id: "anzeera-dubai",
    src: "/assets/imgs/anzeera.svg",
    alt: "Anzeera",
    logoWidth: 190,
    logoHeight: 35,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Anzeera+Dubai",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "amanos-dubai",
    src: "/assets/imgs/amanos.svg",
    alt: "Amanos",
    logoWidth: 114,
    logoHeight: 63,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Amanos+Dubai",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "mist-dubai",
    src: "/assets/imgs/mist.svg",
    alt: "mist",
    logoWidth: 120,
    logoHeight: 77,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=mist+Dubai",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "lock-stock-jbr-dubai",
    src: "/assets/imgs/jbr.svg",
    alt: "Lock Stock & Barrel — JBR",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+JBR+Dubai",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "lock-stock-business-bay-dubai",
    src: "/assets/imgs/the-garden.svg",
    alt: "The Garden Project",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/place/The+Garden+Project/@25.067661,55.1616195,17z/data=!3m1!4b1!4m6!3m5!1s0x3e5f6d9554750e63:0xf9035ead0f86eae6!8m2!3d25.067661!4d55.1616195!16s%2Fg%2F11yq931q81?entry=ttu",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "lock-stock-barsha-heights-dubai",
    src: "/assets/imgs/barsha-heights.svg",
    alt: "Lock Stock & Barrel — Barsha Heights",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+Barsha+Heights+Dubai",
    enabled: true,
    city: "Dubai",
  },
  {
    id: "lock-stock-yas-bay-abu-dhabi",
    src: "/assets/imgs/yas-bay.svg",
    alt: "Lock Stock & Barrel — Yas Bay",
    logoWidth: 96,
    logoHeight: 75,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Lock+Stock+%26+Barrel+Yas+Bay+Abu+Dhabi",
    enabled: true,
    city: "Abu Dhabi",
  },
];

const allowed = new Set(restaurants.map((r) => r.id));
data.restaurants = restaurants;

if (Array.isArray(data.matches)) {
  for (const match of data.matches) {
    if (Array.isArray(match.venueIds)) {
      match.venueIds = migrateVenueIds(match.venueIds).filter((id) =>
        allowed.has(id),
      );
    }
  }
}

writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Updated ${restaurants.length} restaurants in ${path}`);
