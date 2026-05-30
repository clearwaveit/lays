import type { VenueModalData, VenueSubtitleImage } from "@/app/components/ui/VenueModal";

export const REEM_MALL_SUBTITLE: VenueSubtitleImage = {
  src: "/assets/imgs/reem-mall-abu-dhabi.png",
  width: 272.68,
  height: 14.45,
  alt: "Reem Mall – Abu Dhabi",
};

export const VENUES: Record<string, VenueModalData> = {
  "mcgettigans-dubai": {
    id: "mcgettigans-dubai",
    src: "/assets/imgs/company-logo-1-1.svg",
    alt: "McGettigan's",
    logoWidth: 299.14,
    logoHeight: 38,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=McGettigan's+Dubai",
  },
  "mcgettigans-abu-dhabi": {
    id: "mcgettigans-abu-dhabi",
    src: "/assets/imgs/company-logo-1-1.svg",
    alt: "McGettigan's",
    subtitleImage: REEM_MALL_SUBTITLE,
    logoWidth: 299.14,
    logoHeight: 38,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=McGettigan's+Reem+Mall+Abu+Dhabi",
  },
  "bla-bla-dubai": {
    id: "bla-bla-dubai",
    src: "/assets/imgs/company-logo-2.svg",
    alt: "Bla Bla",
    logoWidth: 105.07,
    logoHeight: 92.21,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Bla+Bla+Dubai",
  },
  "mist-dubai": {
    id: "mist-dubai",
    src: "/assets/imgs/company-logo-3.svg",
    alt: "mist",
    logoWidth: 133.54,
    logoHeight: 85.63,
    locationUrl: "https://www.google.com/maps/search/?api=1&query=mist+Dubai",
  },
  "loui-dubai": {
    id: "loui-dubai",
    src: "/assets/imgs/company-logo-4.svg",
    alt: "Loui Restaurant & Cafe",
    logoWidth: 137.06,
    logoHeight: 64.21,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Loui+Restaurant+Cafe+Dubai",
  },
  "anzeera-dubai": {
    id: "anzeera-dubai",
    src: "/assets/imgs/company-logo-5.svg",
    alt: "Anzeera",
    logoWidth: 189.13,
    logoHeight: 34.32,
    locationUrl:
      "https://www.google.com/maps/search/?api=1&query=Anzeera+Dubai",
  },
};

export function getVenueById(id: string | null): VenueModalData {
  if (id && VENUES[id]) return VENUES[id];
  return VENUES["mcgettigans-dubai"];
}
