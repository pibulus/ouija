import { type PageProps } from "$fresh/server.ts";

const SITE_URL = "https://ghostnote.rip";
const SITE_NAME = "Ghost Note";
const TITLE = "Ghost Note - One Message From The Board";
const DESCRIPTION =
  "A one-message spirit board that opens directly into a tiny occult omen spelled by the planchette.";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": SITE_NAME,
  "url": SITE_URL,
  "description": DESCRIPTION,
  "image": OG_IMAGE,
  "applicationCategory": "EntertainmentApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "creator": {
    "@type": "Person",
    "name": "Pablo Alvarado",
    "url": "https://pibul.us",
  },
};

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="ghost note, ouija, spirit board, oracle, omen, planchette, digital divination"
        />
        <meta name="author" content="Pablo Alvarado" />
        <meta name="creator" content="Pablo Alvarado" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#0f0c15" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="A dark spirit board with the words Ghost Note"
        />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta
          name="twitter:image:alt"
          content="A dark spirit board with the words Ghost Note"
        />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preload" href="/ghostboard.png" as="image" />
        <link rel="preload" href="/planchette.png" as="image" />
        <link rel="stylesheet" href="/styles.css" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
