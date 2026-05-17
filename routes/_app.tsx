import { type PageProps } from "$fresh/server.ts";

const DESCRIPTION =
  "A digital spirit board that draws one cosmic message and spells it through the planchette.";

export default function App({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <title>Ouija • Ghost Notes</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="application-name" content="Ouija" />
        <meta name="apple-mobile-web-app-title" content="Ouija" />
        <meta name="theme-color" content="#0f0c15" />

        <meta property="og:site_name" content="Ouija" />
        <meta property="og:title" content="Ouija • Ghost Notes" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Ouija • Ghost Notes" />
        <meta name="twitter:description" content={DESCRIPTION} />

        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
