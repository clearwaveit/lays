import localFont from "next/font/local";
import { Cairo, M_PLUS_1 } from "next/font/google";

const laysFont = localFont({
  src: [
    {
      path: "../public/assets/fonts/Lays.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/Lays_ExtraBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-lays",
  display: "swap",
  adjustFontFallback: false,
});

/** Lay's brand font */
export const lays = laysFont;

export const mPlus1 = M_PLUS_1({
  variable: "--font-m-plus-1",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
});

/** Tailwind + inline style helper */
export const laysTextClass = `${lays.className} font-lays`;

export const laysFontFamily = "var(--font-lays)";

export const mPlus1TextClass = `${mPlus1.className} font-m-plus-1`;
export const mPlus1FontFamily = 'var(--font-m-plus-1), "M PLUS 1", sans-serif';

export const cairoTextClass = `${cairo.className} font-cairo`;
export const cairoFontFamily = 'var(--font-cairo), "Cairo", sans-serif';

/** Same weights as Lay's UI — extrabold 800, bold 700. */
export const BRAND_FONT_WEIGHT = {
  extrabold: 800,
  bold: 700,
  regular: 400,
} as const;
