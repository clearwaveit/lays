// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "flagcdn.com",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   async redirects() {
//     return [
//       { source: "/business-voip", destination: "/services", permanent: true },
//     ];
//   },
// };

const nextConfig: NextConfig = {
  /** Hides `X-Powered-By: Next.js` in production (cosmetic / minor hardening). */
  poweredByHeader: false,

  /**
   * Avoid repeated browser warnings from <Image quality={100}> usages.
   * Next 16 defaults to [75], so explicitly allow both project qualities.
   */
  images: {
    qualities: [75, 100],
  },

  /**
   * **Development only** (`next dev`). Does not affect `next build` or `next start`.
   * LAN testing: without this, opening `http://<local-IP>:3000` can 403 `/_next/*` and break hydration.
   * Production deploys (VPS, static host, etc.) are unaffected.
   */
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "127.0.0.1",
  ],
};

export default nextConfig;
