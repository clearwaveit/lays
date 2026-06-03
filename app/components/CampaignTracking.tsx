import Script from "next/script";

/** Lay's campaign — Google Analytics (gtag.js) */
export const GOOGLE_ANALYTICS_ID = "G-PQDKX0GZQJ";

/** Lay's campaign — Microsoft Clarity */
export const MICROSOFT_CLARITY_ID = "x15621wldl";

export default function CampaignTracking() {
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ANALYTICS_ID}');
        `}
      </Script>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${MICROSOFT_CLARITY_ID}");
        `}
      </Script>
    </>
  );
}
