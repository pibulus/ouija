import { basename, colors, join, parse, resolve } from "./src/dev/deps.ts";
import { error } from "./src/dev/error.ts";
import { collect, ensureMinDenoVersion, generate } from "./src/dev/mod.ts";
import {
  dotenvImports,
  freshImports,
  tailwindImports,
  twindImports,
} from "./src/dev/imports.ts";
ensureMinDenoVersion();
const help = `fresh-init

Initialize a new Fresh project. This will create all the necessary files for a
new project.

To generate a project in the './foobar' subdirectory:
  fresh-init ./foobar

To generate a project in the current directory:
  fresh-init .

USAGE:
    fresh-init [DIRECTORY]

OPTIONS:
    --force   Overwrite existing files
    --tailwind   Use Tailwind for styling
    --twind   Use Twind for styling
    --vscode  Setup project for VS Code
    --docker  Setup Project to use Docker
`;
const CONFIRM_EMPTY_MESSAGE =
  "The target directory is not empty (files could get overwritten). Do you want to continue anyway?";
const USE_VSCODE_MESSAGE = "Do you use VS Code?";
const flags = parse(Deno.args, {
  boolean: [
    "force",
    "tailwind",
    "twind",
    "vscode",
    "docker",
    "help",
  ],
  default: {
    force: null,
    tailwind: null,
    twind: null,
    vscode: null,
    docker: null,
  },
  alias: {
    help: "h",
  },
});
if (flags.help) {
  console.log(help);
  Deno.exit(0);
}
if (flags.tailwind && flags.twind) {
  error("Cannot use Tailwind and Twind at the same time.");
}
console.log();
console.log(
  colors.bgRgb8(colors.rgb8(" 🍋 Fresh: The next-gen web framework. ", 0), 121),
);
console.log();
let unresolvedDirectory = Deno.args[0];
if (flags._.length !== 1) {
  const userInput = prompt("Project Name:", "fresh-project");
  if (!userInput) {
    error(help);
  }
  unresolvedDirectory = userInput;
}
const resolvedDirectory = resolve(unresolvedDirectory);
try {
  const dir = [
    ...Deno.readDirSync(resolvedDirectory),
  ];
  const isEmpty = dir.length === 0 ||
    dir.length === 1 && dir[0].name === ".git";
  if (
    !isEmpty &&
    !(flags.force === null ? confirm(CONFIRM_EMPTY_MESSAGE) : flags.force)
  ) {
    error("Directory is not empty.");
  }
} catch (err) {
  if (!(err instanceof Deno.errors.NotFound)) {
    throw err;
  }
}
console.log("%cLet's set up your new Fresh project.\n", "font-weight: bold");
let useTailwind = flags.tailwind || false;
let useTwind = flags.twind || false;
if (flags.tailwind == null && flags.twind == null) {
  if (confirm("Do you want to use a styling library?")) {
    console.log();
    console.log(`1. ${colors.cyan("tailwindcss")} (recommended)`);
    console.log(`2. ${colors.cyan("Twind")}`);
    console.log();
    switch (
      (prompt("Which styling library do you want to use? [1]") || "1").trim()
    ) {
      case "2":
        useTwind = true;
        break;
      default:
        useTailwind = true;
    }
  }
}
const useVSCode = flags.vscode === null
  ? confirm(USE_VSCODE_MESSAGE)
  : flags.vscode;
const useDocker = flags.docker;
await Promise.all([
  Deno.mkdir(join(resolvedDirectory, "routes", "api"), {
    recursive: true,
  }),
  Deno.mkdir(join(resolvedDirectory, "islands"), {
    recursive: true,
  }),
  Deno.mkdir(join(resolvedDirectory, "static"), {
    recursive: true,
  }),
  Deno.mkdir(join(resolvedDirectory, "components"), {
    recursive: true,
  }),
]);
if (useVSCode) {
  await Deno.mkdir(join(resolvedDirectory, ".vscode"), {
    recursive: true,
  });
}
const GITIGNORE = `# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# Fresh build directory
_fresh/
# npm dependencies
node_modules/
`;
await Deno.writeTextFile(join(resolvedDirectory, ".gitignore"), GITIGNORE);
if (useDocker) {
  const DENO_VERSION = Deno.version.deno;
  const DOCKERFILE_TEXT = `
FROM denoland/deno:${DENO_VERSION}

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=\${GIT_REVISION}

WORKDIR /app

COPY . .
RUN deno cache main.ts

EXPOSE 8000

CMD ["run", "-A", "main.ts"]

`;
  await Deno.writeTextFile(
    join(resolvedDirectory, "Dockerfile"),
    DOCKERFILE_TEXT,
  );
}
const ROUTES_INDEX_TSX = `import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  const count = useSignal(3);
  return (
    <div class="px-4 py-8 mx-auto bg-[#86efac]">
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/logo.svg"
          width="128"
          height="128"
          alt="the Fresh logo: a sliced lemon dripping with juice"
        />
        <h1 class="text-4xl font-bold">Welcome to Fresh</h1>
        <p class="my-4">
          Try updating this message in the
          <code class="mx-2">./routes/index.tsx</code> file, and refresh.
        </p>
        <Counter count={count} />
      </div>
    </div>
  );
}
`;
const COMPONENTS_BUTTON_TSX = `import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={!IS_BROWSER || props.disabled}
      class="px-2 py-1 border-gray-500 border-2 rounded bg-white hover:bg-gray-200 transition-colors"
    />
  );
}
`;
const ISLANDS_COUNTER_TSX = `import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  return (
    <div class="flex gap-8 py-6">
      <Button onClick={() => props.count.value -= 1}>-1</Button>
      <p class="text-3xl tabular-nums">{props.count}</p>
      <Button onClick={() => props.count.value += 1}>+1</Button>
    </div>
  );
}
`;
// 404 page
const ROUTES_404_PAGE = `import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/logo.svg"
            width="128"
            height="128"
            alt="the Fresh logo: a sliced lemon dripping with juice"
          />
          <h1 class="text-4xl font-bold">404 - Page not found</h1>
          <p class="my-4">
            The page you were looking for doesn't exist.
          </p>
          <a href="/" class="underline">Go back home</a>
        </div>
      </div>
    </>
  );
}
`;
await Promise.all([
  Deno.writeTextFile(
    join(resolvedDirectory, "routes", "index.tsx"),
    ROUTES_INDEX_TSX,
  ),
  Deno.writeTextFile(
    join(resolvedDirectory, "components", "Button.tsx"),
    COMPONENTS_BUTTON_TSX,
  ),
  Deno.writeTextFile(
    join(resolvedDirectory, "islands", "Counter.tsx"),
    ISLANDS_COUNTER_TSX,
  ),
  Deno.writeTextFile(
    join(resolvedDirectory, "routes", "_404.tsx"),
    ROUTES_404_PAGE,
  ),
]);
const ROUTES_GREET_TSX = `import { PageProps } from "$fresh/server.ts";

export default function Greet(props: PageProps) {
  return <div>Hello {props.params.name}</div>;
}
`;
await Deno.mkdir(join(resolvedDirectory, "routes", "greet"), {
  recursive: true,
});
await Deno.writeTextFile(
  join(resolvedDirectory, "routes", "greet", "[name].tsx"),
  ROUTES_GREET_TSX,
);
const ROUTES_API_JOKE_TS = `import { FreshContext } from "$fresh/server.ts";

// Jokes courtesy of https://punsandoneliners.com/randomness/programmer-jokes/
const JOKES = [
  "Why do Java developers often wear glasses? They can't C#.",
  "A SQL query walks into a bar, goes up to two tables and says “can I join you?”",
  "Wasn't hard to crack Forrest Gump's password. 1forrest1.",
  "I love pressing the F5 key. It's refreshing.",
  "Called IT support and a chap from Australia came to fix my network connection.  I asked “Do you come from a LAN down under?”",
  "There are 10 types of people in the world. Those who understand binary and those who don't.",
  "Why are assembly programmers often wet? They work below C level.",
  "My favourite computer based band is the Black IPs.",
  "What programme do you use to predict the music tastes of former US presidential candidates? An Al Gore Rhythm.",
  "An SEO expert walked into a bar, pub, inn, tavern, hostelry, public house.",
];

export const handler = (_req: Request, _ctx: FreshContext): Response => {
  const randomIndex = Math.floor(Math.random() * JOKES.length);
  const body = JOKES[randomIndex];
  return new Response(body);
};
`;
await Deno.writeTextFile(
  join(resolvedDirectory, "routes", "api", "joke.ts"),
  ROUTES_API_JOKE_TS,
);
const TAILWIND_CONFIG_TS = `import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
} satisfies Config;
`;
if (useTailwind) {
  await Deno.writeTextFile(
    join(resolvedDirectory, "tailwind.config.ts"),
    TAILWIND_CONFIG_TS,
  );
}
const TWIND_CONFIG_TS = `import { defineConfig, Preset } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import presetAutoprefix from "@twind/preset-autoprefix";

export default {
  ...defineConfig({
    presets: [presetTailwind() as Preset, presetAutoprefix() as Preset],
  }),
  selfURL: import.meta.url,
};
`;
if (useTwind) {
  await Deno.writeTextFile(
    join(resolvedDirectory, "twind.config.ts"),
    TWIND_CONFIG_TS,
  );
}
const NO_TAILWIND_STYLES = `
*,
*::before,
*::after {
  box-sizing: border-box;
}
* {
  margin: 0;
}
button {
  color: inherit;
}
button, [role="button"] {
  cursor: pointer;
}
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 1em;
}
img,
svg {
  display: block;
}
img,
video {
  max-width: 100%;
  height: auto;
}

html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif,
    "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.my-6 {
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}
.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}
.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
.my-4 {
  margin-bottom: 1rem;
  margin-top: 1rem;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-8 {
  padding-bottom: 2rem;
  padding-top: 2rem;
}
.bg-\\[\\#86efac\\] {
  background-color: #86efac;
}
.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}
.py-6 {
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-1 {
  padding-bottom: 0.25rem;
  padding-top: 0.25rem;
}
.border-gray-500 {
  border-color: #6b7280;
}
.bg-white {
  background-color: #fff;
}
.flex {
  display: flex;
}
.gap-8 {
  grid-gap: 2rem;
  gap: 2rem;
}
.font-bold {
  font-weight: 700;
}
.max-w-screen-md {
  max-width: 768px;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.border-2 {
  border-width: 2px;
}
.rounded {
  border-radius: 0.25rem;
}
.hover\\:bg-gray-200:hover {
  background-color: #e5e7eb;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
`;
const APP_WRAPPER = `import { type PageProps } from "$fresh/server.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${basename(resolvedDirectory)}</title>
        ${useTwind ? "" : `<link rel="stylesheet" href="/styles.css" />`}
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
`;
await Deno.writeTextFile(
  join(resolvedDirectory, "routes", "_app.tsx"),
  APP_WRAPPER,
);
const TAILWIND_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;`;
const cssStyles = useTailwind ? TAILWIND_CSS : NO_TAILWIND_STYLES;
if (!useTwind) {
  await Deno.writeTextFile(
    join(resolvedDirectory, "static", "styles.css"),
    cssStyles,
  );
}
const STATIC_LOGO =
  `<svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M34.092 8.845C38.929 20.652 34.092 27 30 30.5c1 3.5-2.986 4.222-4.5 2.5-4.457 1.537-13.512 1.487-20-5C2 24.5 4.73 16.714 14 11.5c8-4.5 16-7 20.092-2.655Z" fill="#FFDB1E"/>
  <path d="M14 11.5c6.848-4.497 15.025-6.38 18.368-3.47C37.5 12.5 21.5 22.612 15.5 25c-6.5 2.587-3 8.5-6.5 8.5-3 0-2.5-4-5.183-7.75C2.232 23.535 6.16 16.648 14 11.5Z" fill="#fff" stroke="#FFDB1E"/>
  <path d="M28.535 8.772c4.645 1.25-.365 5.695-4.303 8.536-3.732 2.692-6.606 4.21-7.923 4.83-.366.173-1.617-2.252-1.617-1 0 .417-.7 2.238-.934 2.326-1.365.512-4.223 1.29-5.835 1.29-3.491 0-1.923-4.754 3.014-9.122.892-.789 1.478-.645 2.283-.645-.537-.773-.534-.917.403-1.546C17.79 10.64 23 8.77 25.212 8.42c.366.014.82.35.82.629.41-.14 2.095-.388 2.503-.278Z" fill="#FFE600"/>
  <path d="M14.297 16.49c.985-.747 1.644-1.01 2.099-2.526.566.121.841-.08 1.29-.701.324.466 1.657.608 2.453.701-.715.451-1.057.852-1.452 2.106-1.464-.611-3.167-.302-4.39.42Z" fill="#fff"/>
</svg>`;
await Deno.writeTextFile(
  join(resolvedDirectory, "static", "logo.svg"),
  STATIC_LOGO,
);
try {
  const faviconArrayBuffer = await fetch("https://fresh.deno.dev/favicon.ico")
    .then((d) => d.arrayBuffer());
  await Deno.writeFile(
    join(resolvedDirectory, "static", "favicon.ico"),
    new Uint8Array(faviconArrayBuffer),
  );
} catch {
  // Skip this and be silent if there is a network issue.
}
let FRESH_CONFIG_TS = `import { defineConfig } from "$fresh/server.ts";\n`;
if (useTailwind) {
  FRESH_CONFIG_TS += `import tailwind from "$fresh/plugins/tailwind.ts";
`;
}
if (useTwind) {
  FRESH_CONFIG_TS += `import twind from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";
`;
}
FRESH_CONFIG_TS += `
export default defineConfig({${
  useTailwind
    ? `\n  plugins: [tailwind()],\n`
    : useTwind
    ? `\n  plugins: [twind(twindConfig)],\n`
    : ""
}});
`;
const CONFIG_TS_PATH = join(resolvedDirectory, "fresh.config.ts");
await Deno.writeTextFile(CONFIG_TS_PATH, FRESH_CONFIG_TS);
let MAIN_TS = `/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";
`;
MAIN_TS += `
await start(manifest, config);\n`;
const MAIN_TS_PATH = join(resolvedDirectory, "main.ts");
await Deno.writeTextFile(MAIN_TS_PATH, MAIN_TS);
const DEV_TS = `#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";

await dev(import.meta.url, "./main.ts", config);
`;
const DEV_TS_PATH = join(resolvedDirectory, "dev.ts");
await Deno.writeTextFile(DEV_TS_PATH, DEV_TS);
try {
  await Deno.chmod(DEV_TS_PATH, 0o777);
} catch {
  // this throws on windows
}
const config = {
  lock: false,
  tasks: {
    check:
      "deno fmt --check && deno lint && deno check **/*.ts && deno check **/*.tsx",
    cli: "echo \"import '\\$fresh/src/dev/cli.ts'\" | deno run --unstable -A -",
    manifest: "deno task cli manifest $(pwd)",
    start: "deno run -A --watch=static/,routes/ dev.ts",
    build: "deno run -A dev.ts build",
    preview: "deno run -A main.ts",
    update: "deno run -A -r https://fresh.deno.dev/update .",
  },
  lint: {
    rules: {
      tags: [
        "fresh",
        "recommended",
      ],
    },
  },
  exclude: [
    "**/_fresh/*",
  ],
  imports: {},
  compilerOptions: {
    jsx: "react-jsx",
    jsxImportSource: "preact",
  },
};
freshImports(config.imports);
if (useTailwind) {
  tailwindImports(config.imports);
  // Tailwind editor plugin expects the `node_modules` directory
  // to be present, otherwise intellisense doesn't work.
  // TODO: Have a better deno config type
  // deno-lint-ignore no-explicit-any
  config.nodeModulesDir = true;
}
if (useTwind) {
  twindImports(config.imports);
}
dotenvImports(config.imports);
const DENO_CONFIG = JSON.stringify(config, null, 2) + "\n";
await Deno.writeTextFile(join(resolvedDirectory, "deno.json"), DENO_CONFIG);
const README_MD = `# Fresh project

Your new Fresh project is ready to go. You can follow the Fresh "Getting
Started" guide here: https://fresh.deno.dev/docs/getting-started

### Usage

Make sure to install Deno: https://deno.land/manual/getting_started/installation

Then start the project:

\`\`\`
deno task start
\`\`\`

This will watch the project directory and restart as necessary.
`;
await Deno.writeTextFile(join(resolvedDirectory, "README.md"), README_MD);
const vscodeSettings = {
  "deno.enable": true,
  "deno.lint": true,
  "editor.defaultFormatter": "denoland.vscode-deno",
  "[typescriptreact]": {
    "editor.defaultFormatter": "denoland.vscode-deno",
  },
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno",
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "denoland.vscode-deno",
  },
  "[javascript]": {
    "editor.defaultFormatter": "denoland.vscode-deno",
  },
  "css.customData": useTailwind
    ? [
      ".vscode/tailwind.json",
    ]
    : undefined,
};
const VSCODE_SETTINGS = JSON.stringify(vscodeSettings, null, 2) + "\n";
if (useVSCode) {
  await Deno.writeTextFile(
    join(resolvedDirectory, ".vscode", "settings.json"),
    VSCODE_SETTINGS,
  );
}
const vscodeExtensions = {
  recommendations: [
    "denoland.vscode-deno",
  ],
};
if (useTailwind) {
  vscodeExtensions.recommendations.push("bradlc.vscode-tailwindcss");
}
const VSCODE_EXTENSIONS = JSON.stringify(vscodeExtensions, null, 2) + "\n";
if (useVSCode) {
  await Deno.writeTextFile(
    join(resolvedDirectory, ".vscode", "extensions.json"),
    VSCODE_EXTENSIONS,
  );
}
const tailwindCustomData = {
  "version": 1.1,
  "atDirectives": [
    {
      "name": "@tailwind",
      "description":
        "Use the `@tailwind` directive to insert Tailwind's `base`, `components`, `utilities` and `screens` styles into your CSS.",
      "references": [
        {
          "name": "Tailwind Documentation",
          "url":
            "https://tailwindcss.com/docs/functions-and-directives#tailwind",
        },
      ],
    },
    {
      "name": "@apply",
      "description":
        "Use the `@apply` directive to inline any existing utility classes into your own custom CSS. This is useful when you find a common utility pattern in your HTML that you’d like to extract to a new component.",
      "references": [
        {
          "name": "Tailwind Documentation",
          "url": "https://tailwindcss.com/docs/functions-and-directives#apply",
        },
      ],
    },
    {
      "name": "@responsive",
      "description":
        "You can generate responsive variants of your own classes by wrapping their definitions in the `@responsive` directive:\n```css\n@responsive {\n  .alert {\n    background-color: #E53E3E;\n  }\n}\n```\n",
      "references": [
        {
          "name": "Tailwind Documentation",
          "url":
            "https://tailwindcss.com/docs/functions-and-directives#responsive",
        },
      ],
    },
    {
      "name": "@screen",
      "description":
        "The `@screen` directive allows you to create media queries that reference your breakpoints by **name** instead of duplicating their values in your own CSS:\n```css\n@screen sm {\n  /* ... */\n}\n```\n…gets transformed into this:\n```css\n@media (min-width: 640px) {\n  /* ... */\n}\n```\n",
      "references": [
        {
          "name": "Tailwind Documentation",
          "url": "https://tailwindcss.com/docs/functions-and-directives#screen",
        },
      ],
    },
    {
      "name": "@variants",
      "description":
        "Generate `hover`, `focus`, `active` and other **variants** of your own utilities by wrapping their definitions in the `@variants` directive:\n```css\n@variants hover, focus {\n   .btn-brand {\n    background-color: #3182CE;\n  }\n}\n```\n",
      "references": [
        {
          "name": "Tailwind Documentation",
          "url":
            "https://tailwindcss.com/docs/functions-and-directives#variants",
        },
      ],
    },
  ],
};
const TAILWIND_CUSTOMDATA = JSON.stringify(tailwindCustomData, null, 2) + "\n";
if (useVSCode && useTailwind) {
  await Deno.writeTextFile(
    join(resolvedDirectory, ".vscode", "tailwind.json"),
    TAILWIND_CUSTOMDATA,
  );
}
const manifest = await collect(resolvedDirectory);
await generate(resolvedDirectory, manifest);
// Specifically print unresolvedDirectory, rather than resolvedDirectory in order to
// not leak personal info (e.g. `/Users/MyName`)
console.log("\n%cProject initialized!\n", "color: green; font-weight: bold");
if (unresolvedDirectory !== ".") {
  console.log(
    `Enter your project directory using %ccd ${unresolvedDirectory}%c.`,
    "color: cyan",
    "",
  );
}
console.log(
  "Run %cdeno task start%c to start the project. %cCTRL-C%c to stop.",
  "color: cyan",
  "",
  "color: cyan",
  "",
);
console.log();
console.log(
  "Stuck? Join our Discord %chttps://discord.gg/deno",
  "color: cyan",
  "",
);
console.log();
console.log("%cHappy hacking! 🦕", "color: gray");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZnJlc2hAMS43LjMvaW5pdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiYXNlbmFtZSwgY29sb3JzLCBqb2luLCBwYXJzZSwgcmVzb2x2ZSB9IGZyb20gXCIuL3NyYy9kZXYvZGVwcy50c1wiO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tIFwiLi9zcmMvZGV2L2Vycm9yLnRzXCI7XG5pbXBvcnQgeyBjb2xsZWN0LCBlbnN1cmVNaW5EZW5vVmVyc2lvbiwgZ2VuZXJhdGUgfSBmcm9tIFwiLi9zcmMvZGV2L21vZC50c1wiO1xuaW1wb3J0IHtcbiAgZG90ZW52SW1wb3J0cyxcbiAgZnJlc2hJbXBvcnRzLFxuICB0YWlsd2luZEltcG9ydHMsXG4gIHR3aW5kSW1wb3J0cyxcbn0gZnJvbSBcIi4vc3JjL2Rldi9pbXBvcnRzLnRzXCI7XG5cbmVuc3VyZU1pbkRlbm9WZXJzaW9uKCk7XG5cbmNvbnN0IGhlbHAgPSBgZnJlc2gtaW5pdFxuXG5Jbml0aWFsaXplIGEgbmV3IEZyZXNoIHByb2plY3QuIFRoaXMgd2lsbCBjcmVhdGUgYWxsIHRoZSBuZWNlc3NhcnkgZmlsZXMgZm9yIGFcbm5ldyBwcm9qZWN0LlxuXG5UbyBnZW5lcmF0ZSBhIHByb2plY3QgaW4gdGhlICcuL2Zvb2Jhcicgc3ViZGlyZWN0b3J5OlxuICBmcmVzaC1pbml0IC4vZm9vYmFyXG5cblRvIGdlbmVyYXRlIGEgcHJvamVjdCBpbiB0aGUgY3VycmVudCBkaXJlY3Rvcnk6XG4gIGZyZXNoLWluaXQgLlxuXG5VU0FHRTpcbiAgICBmcmVzaC1pbml0IFtESVJFQ1RPUlldXG5cbk9QVElPTlM6XG4gICAgLS1mb3JjZSAgIE92ZXJ3cml0ZSBleGlzdGluZyBmaWxlc1xuICAgIC0tdGFpbHdpbmQgICBVc2UgVGFpbHdpbmQgZm9yIHN0eWxpbmdcbiAgICAtLXR3aW5kICAgVXNlIFR3aW5kIGZvciBzdHlsaW5nXG4gICAgLS12c2NvZGUgIFNldHVwIHByb2plY3QgZm9yIFZTIENvZGVcbiAgICAtLWRvY2tlciAgU2V0dXAgUHJvamVjdCB0byB1c2UgRG9ja2VyXG5gO1xuXG5jb25zdCBDT05GSVJNX0VNUFRZX01FU1NBR0UgPVxuICBcIlRoZSB0YXJnZXQgZGlyZWN0b3J5IGlzIG5vdCBlbXB0eSAoZmlsZXMgY291bGQgZ2V0IG92ZXJ3cml0dGVuKS4gRG8geW91IHdhbnQgdG8gY29udGludWUgYW55d2F5P1wiO1xuXG5jb25zdCBVU0VfVlNDT0RFX01FU1NBR0UgPSBcIkRvIHlvdSB1c2UgVlMgQ29kZT9cIjtcblxuY29uc3QgZmxhZ3MgPSBwYXJzZShEZW5vLmFyZ3MsIHtcbiAgYm9vbGVhbjogW1wiZm9yY2VcIiwgXCJ0YWlsd2luZFwiLCBcInR3aW5kXCIsIFwidnNjb2RlXCIsIFwiZG9ja2VyXCIsIFwiaGVscFwiXSxcbiAgZGVmYXVsdDoge1xuICAgIGZvcmNlOiBudWxsLFxuICAgIHRhaWx3aW5kOiBudWxsLFxuICAgIHR3aW5kOiBudWxsLFxuICAgIHZzY29kZTogbnVsbCxcbiAgICBkb2NrZXI6IG51bGwsXG4gIH0sXG4gIGFsaWFzOiB7XG4gICAgaGVscDogXCJoXCIsXG4gIH0sXG59KTtcblxuaWYgKGZsYWdzLmhlbHApIHtcbiAgY29uc29sZS5sb2coaGVscCk7XG4gIERlbm8uZXhpdCgwKTtcbn1cblxuaWYgKGZsYWdzLnRhaWx3aW5kICYmIGZsYWdzLnR3aW5kKSB7XG4gIGVycm9yKFwiQ2Fubm90IHVzZSBUYWlsd2luZCBhbmQgVHdpbmQgYXQgdGhlIHNhbWUgdGltZS5cIik7XG59XG5cbmNvbnNvbGUubG9nKCk7XG5jb25zb2xlLmxvZyhcbiAgY29sb3JzLmJnUmdiOChcbiAgICBjb2xvcnMucmdiOChcIiDwn42LIEZyZXNoOiBUaGUgbmV4dC1nZW4gd2ViIGZyYW1ld29yay4gXCIsIDApLFxuICAgIDEyMSxcbiAgKSxcbik7XG5jb25zb2xlLmxvZygpO1xuXG5sZXQgdW5yZXNvbHZlZERpcmVjdG9yeSA9IERlbm8uYXJnc1swXTtcbmlmIChmbGFncy5fLmxlbmd0aCAhPT0gMSkge1xuICBjb25zdCB1c2VySW5wdXQgPSBwcm9tcHQoXCJQcm9qZWN0IE5hbWU6XCIsIFwiZnJlc2gtcHJvamVjdFwiKTtcbiAgaWYgKCF1c2VySW5wdXQpIHtcbiAgICBlcnJvcihoZWxwKTtcbiAgfVxuXG4gIHVucmVzb2x2ZWREaXJlY3RvcnkgPSB1c2VySW5wdXQ7XG59XG5cbmNvbnN0IHJlc29sdmVkRGlyZWN0b3J5ID0gcmVzb2x2ZSh1bnJlc29sdmVkRGlyZWN0b3J5KTtcblxudHJ5IHtcbiAgY29uc3QgZGlyID0gWy4uLkRlbm8ucmVhZERpclN5bmMocmVzb2x2ZWREaXJlY3RvcnkpXTtcbiAgY29uc3QgaXNFbXB0eSA9IGRpci5sZW5ndGggPT09IDAgfHxcbiAgICBkaXIubGVuZ3RoID09PSAxICYmIGRpclswXS5uYW1lID09PSBcIi5naXRcIjtcbiAgaWYgKFxuICAgICFpc0VtcHR5ICYmXG4gICAgIShmbGFncy5mb3JjZSA9PT0gbnVsbCA/IGNvbmZpcm0oQ09ORklSTV9FTVBUWV9NRVNTQUdFKSA6IGZsYWdzLmZvcmNlKVxuICApIHtcbiAgICBlcnJvcihcIkRpcmVjdG9yeSBpcyBub3QgZW1wdHkuXCIpO1xuICB9XG59IGNhdGNoIChlcnIpIHtcbiAgaWYgKCEoZXJyIGluc3RhbmNlb2YgRGVuby5lcnJvcnMuTm90Rm91bmQpKSB7XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5jb25zb2xlLmxvZyhcIiVjTGV0J3Mgc2V0IHVwIHlvdXIgbmV3IEZyZXNoIHByb2plY3QuXFxuXCIsIFwiZm9udC13ZWlnaHQ6IGJvbGRcIik7XG5cbmxldCB1c2VUYWlsd2luZCA9IGZsYWdzLnRhaWx3aW5kIHx8IGZhbHNlO1xubGV0IHVzZVR3aW5kID0gZmxhZ3MudHdpbmQgfHwgZmFsc2U7XG5cbmlmIChmbGFncy50YWlsd2luZCA9PSBudWxsICYmIGZsYWdzLnR3aW5kID09IG51bGwpIHtcbiAgaWYgKGNvbmZpcm0oXCJEbyB5b3Ugd2FudCB0byB1c2UgYSBzdHlsaW5nIGxpYnJhcnk/XCIpKSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICBjb25zb2xlLmxvZyhgMS4gJHtjb2xvcnMuY3lhbihcInRhaWx3aW5kY3NzXCIpfSAocmVjb21tZW5kZWQpYCk7XG4gICAgY29uc29sZS5sb2coYDIuICR7Y29sb3JzLmN5YW4oXCJUd2luZFwiKX1gKTtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHN3aXRjaCAoXG4gICAgICAocHJvbXB0KFwiV2hpY2ggc3R5bGluZyBsaWJyYXJ5IGRvIHlvdSB3YW50IHRvIHVzZT8gWzFdXCIpIHx8IFwiMVwiKS50cmltKClcbiAgICApIHtcbiAgICAgIGNhc2UgXCIyXCI6XG4gICAgICAgIHVzZVR3aW5kID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB1c2VUYWlsd2luZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IHVzZVZTQ29kZSA9IGZsYWdzLnZzY29kZSA9PT0gbnVsbFxuICA/IGNvbmZpcm0oVVNFX1ZTQ09ERV9NRVNTQUdFKVxuICA6IGZsYWdzLnZzY29kZTtcblxuY29uc3QgdXNlRG9ja2VyID0gZmxhZ3MuZG9ja2VyO1xuXG5hd2FpdCBQcm9taXNlLmFsbChbXG4gIERlbm8ubWtkaXIoam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJyb3V0ZXNcIiwgXCJhcGlcIiksIHsgcmVjdXJzaXZlOiB0cnVlIH0pLFxuICBEZW5vLm1rZGlyKGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiaXNsYW5kc1wiKSwgeyByZWN1cnNpdmU6IHRydWUgfSksXG4gIERlbm8ubWtkaXIoam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJzdGF0aWNcIiksIHsgcmVjdXJzaXZlOiB0cnVlIH0pLFxuICBEZW5vLm1rZGlyKGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiY29tcG9uZW50c1wiKSwgeyByZWN1cnNpdmU6IHRydWUgfSksXG5dKTtcbmlmICh1c2VWU0NvZGUpIHtcbiAgYXdhaXQgRGVuby5ta2Rpcihqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcIi52c2NvZGVcIiksIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xufVxuXG5jb25zdCBHSVRJR05PUkUgPSBgIyBkb3RlbnYgZW52aXJvbm1lbnQgdmFyaWFibGUgZmlsZXNcbi5lbnZcbi5lbnYuZGV2ZWxvcG1lbnQubG9jYWxcbi5lbnYudGVzdC5sb2NhbFxuLmVudi5wcm9kdWN0aW9uLmxvY2FsXG4uZW52LmxvY2FsXG5cbiMgRnJlc2ggYnVpbGQgZGlyZWN0b3J5XG5fZnJlc2gvXG4jIG5wbSBkZXBlbmRlbmNpZXNcbm5vZGVfbW9kdWxlcy9cbmA7XG5cbmF3YWl0IERlbm8ud3JpdGVUZXh0RmlsZShcbiAgam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCIuZ2l0aWdub3JlXCIpLFxuICBHSVRJR05PUkUsXG4pO1xuXG5pZiAodXNlRG9ja2VyKSB7XG4gIGNvbnN0IERFTk9fVkVSU0lPTiA9IERlbm8udmVyc2lvbi5kZW5vO1xuICBjb25zdCBET0NLRVJGSUxFX1RFWFQgPSBgXG5GUk9NIGRlbm9sYW5kL2Rlbm86JHtERU5PX1ZFUlNJT059XG5cbkFSRyBHSVRfUkVWSVNJT05cbkVOViBERU5PX0RFUExPWU1FTlRfSUQ9XFwke0dJVF9SRVZJU0lPTn1cblxuV09SS0RJUiAvYXBwXG5cbkNPUFkgLiAuXG5SVU4gZGVubyBjYWNoZSBtYWluLnRzXG5cbkVYUE9TRSA4MDAwXG5cbkNNRCBbXCJydW5cIiwgXCItQVwiLCBcIm1haW4udHNcIl1cblxuYDtcblxuICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gICAgam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJEb2NrZXJmaWxlXCIpLFxuICAgIERPQ0tFUkZJTEVfVEVYVCxcbiAgKTtcbn1cblxuY29uc3QgUk9VVEVTX0lOREVYX1RTWCA9IGBpbXBvcnQgeyB1c2VTaWduYWwgfSBmcm9tIFwiQHByZWFjdC9zaWduYWxzXCI7XG5pbXBvcnQgQ291bnRlciBmcm9tIFwiLi4vaXNsYW5kcy9Db3VudGVyLnRzeFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBIb21lKCkge1xuICBjb25zdCBjb3VudCA9IHVzZVNpZ25hbCgzKTtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwicHgtNCBweS04IG14LWF1dG8gYmctWyM4NmVmYWNdXCI+XG4gICAgICA8ZGl2IGNsYXNzPVwibWF4LXctc2NyZWVuLW1kIG14LWF1dG8gZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgPGltZ1xuICAgICAgICAgIGNsYXNzPVwibXktNlwiXG4gICAgICAgICAgc3JjPVwiL2xvZ28uc3ZnXCJcbiAgICAgICAgICB3aWR0aD1cIjEyOFwiXG4gICAgICAgICAgaGVpZ2h0PVwiMTI4XCJcbiAgICAgICAgICBhbHQ9XCJ0aGUgRnJlc2ggbG9nbzogYSBzbGljZWQgbGVtb24gZHJpcHBpbmcgd2l0aCBqdWljZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxoMSBjbGFzcz1cInRleHQtNHhsIGZvbnQtYm9sZFwiPldlbGNvbWUgdG8gRnJlc2g8L2gxPlxuICAgICAgICA8cCBjbGFzcz1cIm15LTRcIj5cbiAgICAgICAgICBUcnkgdXBkYXRpbmcgdGhpcyBtZXNzYWdlIGluIHRoZVxuICAgICAgICAgIDxjb2RlIGNsYXNzPVwibXgtMlwiPi4vcm91dGVzL2luZGV4LnRzeDwvY29kZT4gZmlsZSwgYW5kIHJlZnJlc2guXG4gICAgICAgIDwvcD5cbiAgICAgICAgPENvdW50ZXIgY291bnQ9e2NvdW50fSAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG5gO1xuXG5jb25zdCBDT01QT05FTlRTX0JVVFRPTl9UU1ggPSBgaW1wb3J0IHsgSlNYIH0gZnJvbSBcInByZWFjdFwiO1xuaW1wb3J0IHsgSVNfQlJPV1NFUiB9IGZyb20gXCIkZnJlc2gvcnVudGltZS50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHByb3BzOiBKU1guSFRNTEF0dHJpYnV0ZXM8SFRNTEJ1dHRvbkVsZW1lbnQ+KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgey4uLnByb3BzfVxuICAgICAgZGlzYWJsZWQ9eyFJU19CUk9XU0VSIHx8IHByb3BzLmRpc2FibGVkfVxuICAgICAgY2xhc3M9XCJweC0yIHB5LTEgYm9yZGVyLWdyYXktNTAwIGJvcmRlci0yIHJvdW5kZWQgYmctd2hpdGUgaG92ZXI6YmctZ3JheS0yMDAgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgIC8+XG4gICk7XG59XG5gO1xuXG5jb25zdCBJU0xBTkRTX0NPVU5URVJfVFNYID0gYGltcG9ydCB0eXBlIHsgU2lnbmFsIH0gZnJvbSBcIkBwcmVhY3Qvc2lnbmFsc1wiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uLnRzeFwiO1xuXG5pbnRlcmZhY2UgQ291bnRlclByb3BzIHtcbiAgY291bnQ6IFNpZ25hbDxudW1iZXI+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDb3VudGVyKHByb3BzOiBDb3VudGVyUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBnYXAtOCBweS02XCI+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHByb3BzLmNvdW50LnZhbHVlIC09IDF9Pi0xPC9CdXR0b24+XG4gICAgICA8cCBjbGFzcz1cInRleHQtM3hsIHRhYnVsYXItbnVtc1wiPntwcm9wcy5jb3VudH08L3A+XG4gICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IHByb3BzLmNvdW50LnZhbHVlICs9IDF9PisxPC9CdXR0b24+XG4gICAgPC9kaXY+XG4gICk7XG59XG5gO1xuXG4vLyA0MDQgcGFnZVxuY29uc3QgUk9VVEVTXzQwNF9QQUdFID0gYGltcG9ydCB7IEhlYWQgfSBmcm9tIFwiJGZyZXNoL3J1bnRpbWUudHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRXJyb3I0MDQoKSB7XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxIZWFkPlxuICAgICAgICA8dGl0bGU+NDA0IC0gUGFnZSBub3QgZm91bmQ8L3RpdGxlPlxuICAgICAgPC9IZWFkPlxuICAgICAgPGRpdiBjbGFzcz1cInB4LTQgcHktOCBteC1hdXRvIGJnLVsjODZlZmFjXVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibWF4LXctc2NyZWVuLW1kIG14LWF1dG8gZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICA8aW1nXG4gICAgICAgICAgICBjbGFzcz1cIm15LTZcIlxuICAgICAgICAgICAgc3JjPVwiL2xvZ28uc3ZnXCJcbiAgICAgICAgICAgIHdpZHRoPVwiMTI4XCJcbiAgICAgICAgICAgIGhlaWdodD1cIjEyOFwiXG4gICAgICAgICAgICBhbHQ9XCJ0aGUgRnJlc2ggbG9nbzogYSBzbGljZWQgbGVtb24gZHJpcHBpbmcgd2l0aCBqdWljZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8aDEgY2xhc3M9XCJ0ZXh0LTR4bCBmb250LWJvbGRcIj40MDQgLSBQYWdlIG5vdCBmb3VuZDwvaDE+XG4gICAgICAgICAgPHAgY2xhc3M9XCJteS00XCI+XG4gICAgICAgICAgICBUaGUgcGFnZSB5b3Ugd2VyZSBsb29raW5nIGZvciBkb2Vzbid0IGV4aXN0LlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8YSBocmVmPVwiL1wiIGNsYXNzPVwidW5kZXJsaW5lXCI+R28gYmFjayBob21lPC9hPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvPlxuICApO1xufVxuYDtcbmF3YWl0IFByb21pc2UuYWxsKFtcbiAgRGVuby53cml0ZVRleHRGaWxlKFxuICAgIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwicm91dGVzXCIsIFwiaW5kZXgudHN4XCIpLFxuICAgIFJPVVRFU19JTkRFWF9UU1gsXG4gICksXG4gIERlbm8ud3JpdGVUZXh0RmlsZShcbiAgICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcImNvbXBvbmVudHNcIiwgXCJCdXR0b24udHN4XCIpLFxuICAgIENPTVBPTkVOVFNfQlVUVE9OX1RTWCxcbiAgKSxcbiAgRGVuby53cml0ZVRleHRGaWxlKFxuICAgIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiaXNsYW5kc1wiLCBcIkNvdW50ZXIudHN4XCIpLFxuICAgIElTTEFORFNfQ09VTlRFUl9UU1gsXG4gICksXG4gIERlbm8ud3JpdGVUZXh0RmlsZShcbiAgICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcInJvdXRlc1wiLCBcIl80MDQudHN4XCIpLFxuICAgIFJPVVRFU180MDRfUEFHRSxcbiAgKSxcbl0pO1xuXG5jb25zdCBST1VURVNfR1JFRVRfVFNYID0gYGltcG9ydCB7IFBhZ2VQcm9wcyB9IGZyb20gXCIkZnJlc2gvc2VydmVyLnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdyZWV0KHByb3BzOiBQYWdlUHJvcHMpIHtcbiAgcmV0dXJuIDxkaXY+SGVsbG8ge3Byb3BzLnBhcmFtcy5uYW1lfTwvZGl2Pjtcbn1cbmA7XG5hd2FpdCBEZW5vLm1rZGlyKGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwicm91dGVzXCIsIFwiZ3JlZXRcIiksIHtcbiAgcmVjdXJzaXZlOiB0cnVlLFxufSk7XG5hd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwicm91dGVzXCIsIFwiZ3JlZXRcIiwgXCJbbmFtZV0udHN4XCIpLFxuICBST1VURVNfR1JFRVRfVFNYLFxuKTtcblxuY29uc3QgUk9VVEVTX0FQSV9KT0tFX1RTID0gYGltcG9ydCB7IEZyZXNoQ29udGV4dCB9IGZyb20gXCIkZnJlc2gvc2VydmVyLnRzXCI7XG5cbi8vIEpva2VzIGNvdXJ0ZXN5IG9mIGh0dHBzOi8vcHVuc2FuZG9uZWxpbmVycy5jb20vcmFuZG9tbmVzcy9wcm9ncmFtbWVyLWpva2VzL1xuY29uc3QgSk9LRVMgPSBbXG4gIFwiV2h5IGRvIEphdmEgZGV2ZWxvcGVycyBvZnRlbiB3ZWFyIGdsYXNzZXM/IFRoZXkgY2FuJ3QgQyMuXCIsXG4gIFwiQSBTUUwgcXVlcnkgd2Fsa3MgaW50byBhIGJhciwgZ29lcyB1cCB0byB0d28gdGFibGVzIGFuZCBzYXlzIOKAnGNhbiBJIGpvaW4geW91P+KAnVwiLFxuICBcIldhc24ndCBoYXJkIHRvIGNyYWNrIEZvcnJlc3QgR3VtcCdzIHBhc3N3b3JkLiAxZm9ycmVzdDEuXCIsXG4gIFwiSSBsb3ZlIHByZXNzaW5nIHRoZSBGNSBrZXkuIEl0J3MgcmVmcmVzaGluZy5cIixcbiAgXCJDYWxsZWQgSVQgc3VwcG9ydCBhbmQgYSBjaGFwIGZyb20gQXVzdHJhbGlhIGNhbWUgdG8gZml4IG15IG5ldHdvcmsgY29ubmVjdGlvbi4gIEkgYXNrZWQg4oCcRG8geW91IGNvbWUgZnJvbSBhIExBTiBkb3duIHVuZGVyP+KAnVwiLFxuICBcIlRoZXJlIGFyZSAxMCB0eXBlcyBvZiBwZW9wbGUgaW4gdGhlIHdvcmxkLiBUaG9zZSB3aG8gdW5kZXJzdGFuZCBiaW5hcnkgYW5kIHRob3NlIHdobyBkb24ndC5cIixcbiAgXCJXaHkgYXJlIGFzc2VtYmx5IHByb2dyYW1tZXJzIG9mdGVuIHdldD8gVGhleSB3b3JrIGJlbG93IEMgbGV2ZWwuXCIsXG4gIFwiTXkgZmF2b3VyaXRlIGNvbXB1dGVyIGJhc2VkIGJhbmQgaXMgdGhlIEJsYWNrIElQcy5cIixcbiAgXCJXaGF0IHByb2dyYW1tZSBkbyB5b3UgdXNlIHRvIHByZWRpY3QgdGhlIG11c2ljIHRhc3RlcyBvZiBmb3JtZXIgVVMgcHJlc2lkZW50aWFsIGNhbmRpZGF0ZXM/IEFuIEFsIEdvcmUgUmh5dGhtLlwiLFxuICBcIkFuIFNFTyBleHBlcnQgd2Fsa2VkIGludG8gYSBiYXIsIHB1YiwgaW5uLCB0YXZlcm4sIGhvc3RlbHJ5LCBwdWJsaWMgaG91c2UuXCIsXG5dO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IChfcmVxOiBSZXF1ZXN0LCBfY3R4OiBGcmVzaENvbnRleHQpOiBSZXNwb25zZSA9PiB7XG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogSk9LRVMubGVuZ3RoKTtcbiAgY29uc3QgYm9keSA9IEpPS0VTW3JhbmRvbUluZGV4XTtcbiAgcmV0dXJuIG5ldyBSZXNwb25zZShib2R5KTtcbn07XG5gO1xuYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKFxuICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcInJvdXRlc1wiLCBcImFwaVwiLCBcImpva2UudHNcIiksXG4gIFJPVVRFU19BUElfSk9LRV9UUyxcbik7XG5cbmNvbnN0IFRBSUxXSU5EX0NPTkZJR19UUyA9IGBpbXBvcnQgeyB0eXBlIENvbmZpZyB9IGZyb20gXCJ0YWlsd2luZGNzc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbnRlbnQ6IFtcbiAgICBcIntyb3V0ZXMsaXNsYW5kcyxjb21wb25lbnRzfS8qKi8qLnt0cyx0c3gsanMsanN4fVwiLFxuICBdLFxufSBzYXRpc2ZpZXMgQ29uZmlnO1xuYDtcbmlmICh1c2VUYWlsd2luZCkge1xuICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gICAgam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJ0YWlsd2luZC5jb25maWcudHNcIiksXG4gICAgVEFJTFdJTkRfQ09ORklHX1RTLFxuICApO1xufVxuXG5jb25zdCBUV0lORF9DT05GSUdfVFMgPSBgaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBQcmVzZXQgfSBmcm9tIFwiQHR3aW5kL2NvcmVcIjtcbmltcG9ydCBwcmVzZXRUYWlsd2luZCBmcm9tIFwiQHR3aW5kL3ByZXNldC10YWlsd2luZFwiO1xuaW1wb3J0IHByZXNldEF1dG9wcmVmaXggZnJvbSBcIkB0d2luZC9wcmVzZXQtYXV0b3ByZWZpeFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIC4uLmRlZmluZUNvbmZpZyh7XG4gICAgcHJlc2V0czogW3ByZXNldFRhaWx3aW5kKCkgYXMgUHJlc2V0LCBwcmVzZXRBdXRvcHJlZml4KCkgYXMgUHJlc2V0XSxcbiAgfSksXG4gIHNlbGZVUkw6IGltcG9ydC5tZXRhLnVybCxcbn07XG5gO1xuaWYgKHVzZVR3aW5kKSB7XG4gIGF3YWl0IERlbm8ud3JpdGVUZXh0RmlsZShcbiAgICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcInR3aW5kLmNvbmZpZy50c1wiKSxcbiAgICBUV0lORF9DT05GSUdfVFMsXG4gICk7XG59XG5cbmNvbnN0IE5PX1RBSUxXSU5EX1NUWUxFUyA9IGBcbiosXG4qOjpiZWZvcmUsXG4qOjphZnRlciB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG59XG4qIHtcbiAgbWFyZ2luOiAwO1xufVxuYnV0dG9uIHtcbiAgY29sb3I6IGluaGVyaXQ7XG59XG5idXR0b24sIFtyb2xlPVwiYnV0dG9uXCJdIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuY29kZSB7XG4gIGZvbnQtZmFtaWx5OiB1aS1tb25vc3BhY2UsIFNGTW9uby1SZWd1bGFyLCBNZW5sbywgTW9uYWNvLCBDb25zb2xhcyxcbiAgICBcIkxpYmVyYXRpb24gTW9ub1wiLCBcIkNvdXJpZXIgTmV3XCIsIG1vbm9zcGFjZTtcbiAgZm9udC1zaXplOiAxZW07XG59XG5pbWcsXG5zdmcge1xuICBkaXNwbGF5OiBibG9jaztcbn1cbmltZyxcbnZpZGVvIHtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IGF1dG87XG59XG5cbmh0bWwge1xuICBsaW5lLWhlaWdodDogMS41O1xuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7XG4gIGZvbnQtZmFtaWx5OiB1aS1zYW5zLXNlcmlmLCBzeXN0ZW0tdWksIC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCxcbiAgICBcIlNlZ29lIFVJXCIsIFJvYm90bywgXCJIZWx2ZXRpY2EgTmV1ZVwiLCBBcmlhbCwgXCJOb3RvIFNhbnNcIiwgc2Fucy1zZXJpZixcbiAgICBcIkFwcGxlIENvbG9yIEVtb2ppXCIsIFwiU2Vnb2UgVUkgRW1vamlcIiwgXCJTZWdvZSBVSSBTeW1ib2xcIiwgXCJOb3RvIENvbG9yIEVtb2ppXCI7XG59XG4udHJhbnNpdGlvbi1jb2xvcnMge1xuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBiYWNrZ3JvdW5kLWNvbG9yLCBib3JkZXItY29sb3IsIGNvbG9yLCBmaWxsLCBzdHJva2U7XG4gIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBjdWJpYy1iZXppZXIoMC40LCAwLCAwLjIsIDEpO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAxNTBtcztcbn1cbi5teS02IHtcbiAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xuICBtYXJnaW4tdG9wOiAxLjVyZW07XG59XG4udGV4dC00eGwge1xuICBmb250LXNpemU6IDIuMjVyZW07XG4gIGxpbmUtaGVpZ2h0OiAyLjVyZW07XG59XG4ubXgtMiB7XG4gIG1hcmdpbi1sZWZ0OiAwLjVyZW07XG4gIG1hcmdpbi1yaWdodDogMC41cmVtO1xufVxuLm15LTQge1xuICBtYXJnaW4tYm90dG9tOiAxcmVtO1xuICBtYXJnaW4tdG9wOiAxcmVtO1xufVxuLm14LWF1dG8ge1xuICBtYXJnaW4tbGVmdDogYXV0bztcbiAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xufVxuLnB4LTQge1xuICBwYWRkaW5nLWxlZnQ6IDFyZW07XG4gIHBhZGRpbmctcmlnaHQ6IDFyZW07XG59XG4ucHktOCB7XG4gIHBhZGRpbmctYm90dG9tOiAycmVtO1xuICBwYWRkaW5nLXRvcDogMnJlbTtcbn1cbi5iZy1cXFxcW1xcXFwjODZlZmFjXFxcXF0ge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjODZlZmFjO1xufVxuLnRleHQtM3hsIHtcbiAgZm9udC1zaXplOiAxLjg3NXJlbTtcbiAgbGluZS1oZWlnaHQ6IDIuMjVyZW07XG59XG4ucHktNiB7XG4gIHBhZGRpbmctYm90dG9tOiAxLjVyZW07XG4gIHBhZGRpbmctdG9wOiAxLjVyZW07XG59XG4ucHgtMiB7XG4gIHBhZGRpbmctbGVmdDogMC41cmVtO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjVyZW07XG59XG4ucHktMSB7XG4gIHBhZGRpbmctYm90dG9tOiAwLjI1cmVtO1xuICBwYWRkaW5nLXRvcDogMC4yNXJlbTtcbn1cbi5ib3JkZXItZ3JheS01MDAge1xuICBib3JkZXItY29sb3I6ICM2YjcyODA7XG59XG4uYmctd2hpdGUge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmO1xufVxuLmZsZXgge1xuICBkaXNwbGF5OiBmbGV4O1xufVxuLmdhcC04IHtcbiAgZ3JpZC1nYXA6IDJyZW07XG4gIGdhcDogMnJlbTtcbn1cbi5mb250LWJvbGQge1xuICBmb250LXdlaWdodDogNzAwO1xufVxuLm1heC13LXNjcmVlbi1tZCB7XG4gIG1heC13aWR0aDogNzY4cHg7XG59XG4uZmxleC1jb2wge1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xufVxuLml0ZW1zLWNlbnRlciB7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG4uanVzdGlmeS1jZW50ZXIge1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbn1cbi5ib3JkZXItMiB7XG4gIGJvcmRlci13aWR0aDogMnB4O1xufVxuLnJvdW5kZWQge1xuICBib3JkZXItcmFkaXVzOiAwLjI1cmVtO1xufVxuLmhvdmVyXFxcXDpiZy1ncmF5LTIwMDpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6ICNlNWU3ZWI7XG59XG4udGFidWxhci1udW1zIHtcbiAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbn1cbmA7XG5cbmNvbnN0IEFQUF9XUkFQUEVSID0gYGltcG9ydCB7IHR5cGUgUGFnZVByb3BzIH0gZnJvbSBcIiRmcmVzaC9zZXJ2ZXIudHNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCB9OiBQYWdlUHJvcHMpIHtcbiAgcmV0dXJuIChcbiAgICA8aHRtbD5cbiAgICAgIDxoZWFkPlxuICAgICAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPlxuICAgICAgICA8bWV0YSBuYW1lPVwidmlld3BvcnRcIiBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMFwiIC8+XG4gICAgICAgIDx0aXRsZT4ke2Jhc2VuYW1lKHJlc29sdmVkRGlyZWN0b3J5KX08L3RpdGxlPlxuICAgICAgICAke3VzZVR3aW5kID8gXCJcIiA6IGA8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cIi9zdHlsZXMuY3NzXCIgLz5gfVxuICAgICAgPC9oZWFkPlxuICAgICAgPGJvZHk+XG4gICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgIDwvYm9keT5cbiAgICA8L2h0bWw+XG4gICk7XG59XG5gO1xuXG5hd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwicm91dGVzXCIsIFwiX2FwcC50c3hcIiksXG4gIEFQUF9XUkFQUEVSLFxuKTtcblxuY29uc3QgVEFJTFdJTkRfQ1NTID0gYEB0YWlsd2luZCBiYXNlO1xuQHRhaWx3aW5kIGNvbXBvbmVudHM7XG5AdGFpbHdpbmQgdXRpbGl0aWVzO2A7XG5cbmNvbnN0IGNzc1N0eWxlcyA9IHVzZVRhaWx3aW5kID8gVEFJTFdJTkRfQ1NTIDogTk9fVEFJTFdJTkRfU1RZTEVTO1xuaWYgKCF1c2VUd2luZCkge1xuICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gICAgam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJzdGF0aWNcIiwgXCJzdHlsZXMuY3NzXCIpLFxuICAgIGNzc1N0eWxlcyxcbiAgKTtcbn1cblxuY29uc3QgU1RBVElDX0xPR08gPVxuICBgPHN2ZyB3aWR0aD1cIjQwXCIgaGVpZ2h0PVwiNDBcIiBmaWxsPVwibm9uZVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgPHBhdGggZD1cIk0zNC4wOTIgOC44NDVDMzguOTI5IDIwLjY1MiAzNC4wOTIgMjcgMzAgMzAuNWMxIDMuNS0yLjk4NiA0LjIyMi00LjUgMi41LTQuNDU3IDEuNTM3LTEzLjUxMiAxLjQ4Ny0yMC01QzIgMjQuNSA0LjczIDE2LjcxNCAxNCAxMS41YzgtNC41IDE2LTcgMjAuMDkyLTIuNjU1WlwiIGZpbGw9XCIjRkZEQjFFXCIvPlxuICA8cGF0aCBkPVwiTTE0IDExLjVjNi44NDgtNC40OTcgMTUuMDI1LTYuMzggMTguMzY4LTMuNDdDMzcuNSAxMi41IDIxLjUgMjIuNjEyIDE1LjUgMjVjLTYuNSAyLjU4Ny0zIDguNS02LjUgOC41LTMgMC0yLjUtNC01LjE4My03Ljc1QzIuMjMyIDIzLjUzNSA2LjE2IDE2LjY0OCAxNCAxMS41WlwiIGZpbGw9XCIjZmZmXCIgc3Ryb2tlPVwiI0ZGREIxRVwiLz5cbiAgPHBhdGggZD1cIk0yOC41MzUgOC43NzJjNC42NDUgMS4yNS0uMzY1IDUuNjk1LTQuMzAzIDguNTM2LTMuNzMyIDIuNjkyLTYuNjA2IDQuMjEtNy45MjMgNC44My0uMzY2LjE3My0xLjYxNy0yLjI1Mi0xLjYxNy0xIDAgLjQxNy0uNyAyLjIzOC0uOTM0IDIuMzI2LTEuMzY1LjUxMi00LjIyMyAxLjI5LTUuODM1IDEuMjktMy40OTEgMC0xLjkyMy00Ljc1NCAzLjAxNC05LjEyMi44OTItLjc4OSAxLjQ3OC0uNjQ1IDIuMjgzLS42NDUtLjUzNy0uNzczLS41MzQtLjkxNy40MDMtMS41NDZDMTcuNzkgMTAuNjQgMjMgOC43NyAyNS4yMTIgOC40MmMuMzY2LjAxNC44Mi4zNS44Mi42MjkuNDEtLjE0IDIuMDk1LS4zODggMi41MDMtLjI3OFpcIiBmaWxsPVwiI0ZGRTYwMFwiLz5cbiAgPHBhdGggZD1cIk0xNC4yOTcgMTYuNDljLjk4NS0uNzQ3IDEuNjQ0LTEuMDEgMi4wOTktMi41MjYuNTY2LjEyMS44NDEtLjA4IDEuMjktLjcwMS4zMjQuNDY2IDEuNjU3LjYwOCAyLjQ1My43MDEtLjcxNS40NTEtMS4wNTcuODUyLTEuNDUyIDIuMTA2LTEuNDY0LS42MTEtMy4xNjctLjMwMi00LjM5LjQyWlwiIGZpbGw9XCIjZmZmXCIvPlxuPC9zdmc+YDtcblxuYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKFxuICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcInN0YXRpY1wiLCBcImxvZ28uc3ZnXCIpLFxuICBTVEFUSUNfTE9HTyxcbik7XG5cbnRyeSB7XG4gIGNvbnN0IGZhdmljb25BcnJheUJ1ZmZlciA9IGF3YWl0IGZldGNoKFwiaHR0cHM6Ly9mcmVzaC5kZW5vLmRldi9mYXZpY29uLmljb1wiKVxuICAgIC50aGVuKChkKSA9PiBkLmFycmF5QnVmZmVyKCkpO1xuICBhd2FpdCBEZW5vLndyaXRlRmlsZShcbiAgICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcInN0YXRpY1wiLCBcImZhdmljb24uaWNvXCIpLFxuICAgIG5ldyBVaW50OEFycmF5KGZhdmljb25BcnJheUJ1ZmZlciksXG4gICk7XG59IGNhdGNoIHtcbiAgLy8gU2tpcCB0aGlzIGFuZCBiZSBzaWxlbnQgaWYgdGhlcmUgaXMgYSBuZXR3b3JrIGlzc3VlLlxufVxuXG5sZXQgRlJFU0hfQ09ORklHX1RTID0gYGltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCIkZnJlc2gvc2VydmVyLnRzXCI7XFxuYDtcbmlmICh1c2VUYWlsd2luZCkge1xuICBGUkVTSF9DT05GSUdfVFMgKz0gYGltcG9ydCB0YWlsd2luZCBmcm9tIFwiJGZyZXNoL3BsdWdpbnMvdGFpbHdpbmQudHNcIjtcbmA7XG59XG5pZiAodXNlVHdpbmQpIHtcbiAgRlJFU0hfQ09ORklHX1RTICs9IGBpbXBvcnQgdHdpbmQgZnJvbSBcIiRmcmVzaC9wbHVnaW5zL3R3aW5kdjEudHNcIjtcbmltcG9ydCB0d2luZENvbmZpZyBmcm9tIFwiLi90d2luZC5jb25maWcudHNcIjtcbmA7XG59XG5cbkZSRVNIX0NPTkZJR19UUyArPSBgXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoeyR7XG4gIHVzZVRhaWx3aW5kXG4gICAgPyBgXFxuICBwbHVnaW5zOiBbdGFpbHdpbmQoKV0sXFxuYFxuICAgIDogdXNlVHdpbmRcbiAgICA/IGBcXG4gIHBsdWdpbnM6IFt0d2luZCh0d2luZENvbmZpZyldLFxcbmBcbiAgICA6IFwiXCJcbn19KTtcbmA7XG5jb25zdCBDT05GSUdfVFNfUEFUSCA9IGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiZnJlc2guY29uZmlnLnRzXCIpO1xuYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKENPTkZJR19UU19QQVRILCBGUkVTSF9DT05GSUdfVFMpO1xuXG5sZXQgTUFJTl9UUyA9IGAvLy8gPHJlZmVyZW5jZSBuby1kZWZhdWx0LWxpYj1cInRydWVcIiAvPlxuLy8vIDxyZWZlcmVuY2UgbGliPVwiZG9tXCIgLz5cbi8vLyA8cmVmZXJlbmNlIGxpYj1cImRvbS5pdGVyYWJsZVwiIC8+XG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJkb20uYXN5bmNpdGVyYWJsZVwiIC8+XG4vLy8gPHJlZmVyZW5jZSBsaWI9XCJkZW5vLm5zXCIgLz5cblxuaW1wb3J0IFwiJHN0ZC9kb3RlbnYvbG9hZC50c1wiO1xuXG5pbXBvcnQgeyBzdGFydCB9IGZyb20gXCIkZnJlc2gvc2VydmVyLnRzXCI7XG5pbXBvcnQgbWFuaWZlc3QgZnJvbSBcIi4vZnJlc2guZ2VuLnRzXCI7XG5pbXBvcnQgY29uZmlnIGZyb20gXCIuL2ZyZXNoLmNvbmZpZy50c1wiO1xuYDtcblxuTUFJTl9UUyArPSBgXG5hd2FpdCBzdGFydChtYW5pZmVzdCwgY29uZmlnKTtcXG5gO1xuY29uc3QgTUFJTl9UU19QQVRIID0gam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJtYWluLnRzXCIpO1xuYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKE1BSU5fVFNfUEFUSCwgTUFJTl9UUyk7XG5cbmNvbnN0IERFVl9UUyA9IGAjIS91c3IvYmluL2VudiAtUyBkZW5vIHJ1biAtQSAtLXdhdGNoPXN0YXRpYy8scm91dGVzL1xuXG5pbXBvcnQgZGV2IGZyb20gXCIkZnJlc2gvZGV2LnRzXCI7XG5pbXBvcnQgY29uZmlnIGZyb20gXCIuL2ZyZXNoLmNvbmZpZy50c1wiO1xuXG5pbXBvcnQgXCIkc3RkL2RvdGVudi9sb2FkLnRzXCI7XG5cbmF3YWl0IGRldihpbXBvcnQubWV0YS51cmwsIFwiLi9tYWluLnRzXCIsIGNvbmZpZyk7XG5gO1xuY29uc3QgREVWX1RTX1BBVEggPSBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcImRldi50c1wiKTtcbmF3YWl0IERlbm8ud3JpdGVUZXh0RmlsZShERVZfVFNfUEFUSCwgREVWX1RTKTtcbnRyeSB7XG4gIGF3YWl0IERlbm8uY2htb2QoREVWX1RTX1BBVEgsIDBvNzc3KTtcbn0gY2F0Y2gge1xuICAvLyB0aGlzIHRocm93cyBvbiB3aW5kb3dzXG59XG5cbmNvbnN0IGNvbmZpZyA9IHtcbiAgbG9jazogZmFsc2UsXG4gIHRhc2tzOiB7XG4gICAgY2hlY2s6XG4gICAgICBcImRlbm8gZm10IC0tY2hlY2sgJiYgZGVubyBsaW50ICYmIGRlbm8gY2hlY2sgKiovKi50cyAmJiBkZW5vIGNoZWNrICoqLyoudHN4XCIsXG4gICAgY2xpOiBcImVjaG8gXFxcImltcG9ydCAnXFxcXCRmcmVzaC9zcmMvZGV2L2NsaS50cydcXFwiIHwgZGVubyBydW4gLS11bnN0YWJsZSAtQSAtXCIsXG4gICAgbWFuaWZlc3Q6IFwiZGVubyB0YXNrIGNsaSBtYW5pZmVzdCAkKHB3ZClcIixcbiAgICBzdGFydDogXCJkZW5vIHJ1biAtQSAtLXdhdGNoPXN0YXRpYy8scm91dGVzLyBkZXYudHNcIixcbiAgICBidWlsZDogXCJkZW5vIHJ1biAtQSBkZXYudHMgYnVpbGRcIixcbiAgICBwcmV2aWV3OiBcImRlbm8gcnVuIC1BIG1haW4udHNcIixcbiAgICB1cGRhdGU6IFwiZGVubyBydW4gLUEgLXIgaHR0cHM6Ly9mcmVzaC5kZW5vLmRldi91cGRhdGUgLlwiLFxuICB9LFxuICBsaW50OiB7XG4gICAgcnVsZXM6IHtcbiAgICAgIHRhZ3M6IFtcImZyZXNoXCIsIFwicmVjb21tZW5kZWRcIl0sXG4gICAgfSxcbiAgfSxcbiAgZXhjbHVkZTogW1wiKiovX2ZyZXNoLypcIl0sXG4gIGltcG9ydHM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIGNvbXBpbGVyT3B0aW9uczoge1xuICAgIGpzeDogXCJyZWFjdC1qc3hcIixcbiAgICBqc3hJbXBvcnRTb3VyY2U6IFwicHJlYWN0XCIsXG4gIH0sXG59O1xuZnJlc2hJbXBvcnRzKGNvbmZpZy5pbXBvcnRzKTtcbmlmICh1c2VUYWlsd2luZCkge1xuICB0YWlsd2luZEltcG9ydHMoY29uZmlnLmltcG9ydHMpO1xuICAvLyBUYWlsd2luZCBlZGl0b3IgcGx1Z2luIGV4cGVjdHMgdGhlIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeVxuICAvLyB0byBiZSBwcmVzZW50LCBvdGhlcndpc2UgaW50ZWxsaXNlbnNlIGRvZXNuJ3Qgd29yay5cbiAgLy8gVE9ETzogSGF2ZSBhIGJldHRlciBkZW5vIGNvbmZpZyB0eXBlXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIChjb25maWcgYXMgYW55KS5ub2RlTW9kdWxlc0RpciA9IHRydWU7XG59XG5pZiAodXNlVHdpbmQpIHtcbiAgdHdpbmRJbXBvcnRzKGNvbmZpZy5pbXBvcnRzKTtcbn1cbmRvdGVudkltcG9ydHMoY29uZmlnLmltcG9ydHMpO1xuXG5jb25zdCBERU5PX0NPTkZJRyA9IEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMikgKyBcIlxcblwiO1xuXG5hd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCJkZW5vLmpzb25cIiksIERFTk9fQ09ORklHKTtcblxuY29uc3QgUkVBRE1FX01EID0gYCMgRnJlc2ggcHJvamVjdFxuXG5Zb3VyIG5ldyBGcmVzaCBwcm9qZWN0IGlzIHJlYWR5IHRvIGdvLiBZb3UgY2FuIGZvbGxvdyB0aGUgRnJlc2ggXCJHZXR0aW5nXG5TdGFydGVkXCIgZ3VpZGUgaGVyZTogaHR0cHM6Ly9mcmVzaC5kZW5vLmRldi9kb2NzL2dldHRpbmctc3RhcnRlZFxuXG4jIyMgVXNhZ2VcblxuTWFrZSBzdXJlIHRvIGluc3RhbGwgRGVubzogaHR0cHM6Ly9kZW5vLmxhbmQvbWFudWFsL2dldHRpbmdfc3RhcnRlZC9pbnN0YWxsYXRpb25cblxuVGhlbiBzdGFydCB0aGUgcHJvamVjdDpcblxuXFxgXFxgXFxgXG5kZW5vIHRhc2sgc3RhcnRcblxcYFxcYFxcYFxuXG5UaGlzIHdpbGwgd2F0Y2ggdGhlIHByb2plY3QgZGlyZWN0b3J5IGFuZCByZXN0YXJ0IGFzIG5lY2Vzc2FyeS5cbmA7XG5hd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiUkVBRE1FLm1kXCIpLFxuICBSRUFETUVfTUQsXG4pO1xuXG5jb25zdCB2c2NvZGVTZXR0aW5ncyA9IHtcbiAgXCJkZW5vLmVuYWJsZVwiOiB0cnVlLFxuICBcImRlbm8ubGludFwiOiB0cnVlLFxuICBcImVkaXRvci5kZWZhdWx0Rm9ybWF0dGVyXCI6IFwiZGVub2xhbmQudnNjb2RlLWRlbm9cIixcbiAgXCJbdHlwZXNjcmlwdHJlYWN0XVwiOiB7XG4gICAgXCJlZGl0b3IuZGVmYXVsdEZvcm1hdHRlclwiOiBcImRlbm9sYW5kLnZzY29kZS1kZW5vXCIsXG4gIH0sXG4gIFwiW3R5cGVzY3JpcHRdXCI6IHtcbiAgICBcImVkaXRvci5kZWZhdWx0Rm9ybWF0dGVyXCI6IFwiZGVub2xhbmQudnNjb2RlLWRlbm9cIixcbiAgfSxcbiAgXCJbamF2YXNjcmlwdHJlYWN0XVwiOiB7XG4gICAgXCJlZGl0b3IuZGVmYXVsdEZvcm1hdHRlclwiOiBcImRlbm9sYW5kLnZzY29kZS1kZW5vXCIsXG4gIH0sXG4gIFwiW2phdmFzY3JpcHRdXCI6IHtcbiAgICBcImVkaXRvci5kZWZhdWx0Rm9ybWF0dGVyXCI6IFwiZGVub2xhbmQudnNjb2RlLWRlbm9cIixcbiAgfSxcbiAgXCJjc3MuY3VzdG9tRGF0YVwiOiB1c2VUYWlsd2luZCA/IFtcIi52c2NvZGUvdGFpbHdpbmQuanNvblwiXSA6IHVuZGVmaW5lZCxcbn07XG5cbmNvbnN0IFZTQ09ERV9TRVRUSU5HUyA9IEpTT04uc3RyaW5naWZ5KHZzY29kZVNldHRpbmdzLCBudWxsLCAyKSArIFwiXFxuXCI7XG5cbmlmICh1c2VWU0NvZGUpIHtcbiAgYXdhaXQgRGVuby53cml0ZVRleHRGaWxlKFxuICAgIGpvaW4ocmVzb2x2ZWREaXJlY3RvcnksIFwiLnZzY29kZVwiLCBcInNldHRpbmdzLmpzb25cIiksXG4gICAgVlNDT0RFX1NFVFRJTkdTLFxuICApO1xufVxuXG5jb25zdCB2c2NvZGVFeHRlbnNpb25zID0ge1xuICByZWNvbW1lbmRhdGlvbnM6IFtcImRlbm9sYW5kLnZzY29kZS1kZW5vXCJdLFxufTtcblxuaWYgKHVzZVRhaWx3aW5kKSB7XG4gIHZzY29kZUV4dGVuc2lvbnMucmVjb21tZW5kYXRpb25zLnB1c2goXCJicmFkbGMudnNjb2RlLXRhaWx3aW5kY3NzXCIpO1xufVxuXG5jb25zdCBWU0NPREVfRVhURU5TSU9OUyA9IEpTT04uc3RyaW5naWZ5KHZzY29kZUV4dGVuc2lvbnMsIG51bGwsIDIpICsgXCJcXG5cIjtcblxuaWYgKHVzZVZTQ29kZSkge1xuICBhd2FpdCBEZW5vLndyaXRlVGV4dEZpbGUoXG4gICAgam9pbihyZXNvbHZlZERpcmVjdG9yeSwgXCIudnNjb2RlXCIsIFwiZXh0ZW5zaW9ucy5qc29uXCIpLFxuICAgIFZTQ09ERV9FWFRFTlNJT05TLFxuICApO1xufVxuXG5jb25zdCB0YWlsd2luZEN1c3RvbURhdGEgPSB7XG4gIFwidmVyc2lvblwiOiAxLjEsXG4gIFwiYXREaXJlY3RpdmVzXCI6IFtcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJAdGFpbHdpbmRcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjpcbiAgICAgICAgXCJVc2UgdGhlIGBAdGFpbHdpbmRgIGRpcmVjdGl2ZSB0byBpbnNlcnQgVGFpbHdpbmQncyBgYmFzZWAsIGBjb21wb25lbnRzYCwgYHV0aWxpdGllc2AgYW5kIGBzY3JlZW5zYCBzdHlsZXMgaW50byB5b3VyIENTUy5cIixcbiAgICAgIFwicmVmZXJlbmNlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcIm5hbWVcIjogXCJUYWlsd2luZCBEb2N1bWVudGF0aW9uXCIsXG4gICAgICAgICAgXCJ1cmxcIjpcbiAgICAgICAgICAgIFwiaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mdW5jdGlvbnMtYW5kLWRpcmVjdGl2ZXMjdGFpbHdpbmRcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICB7XG4gICAgICBcIm5hbWVcIjogXCJAYXBwbHlcIixcbiAgICAgIFwiZGVzY3JpcHRpb25cIjpcbiAgICAgICAgXCJVc2UgdGhlIGBAYXBwbHlgIGRpcmVjdGl2ZSB0byBpbmxpbmUgYW55IGV4aXN0aW5nIHV0aWxpdHkgY2xhc3NlcyBpbnRvIHlvdXIgb3duIGN1c3RvbSBDU1MuIFRoaXMgaXMgdXNlZnVsIHdoZW4geW91IGZpbmQgYSBjb21tb24gdXRpbGl0eSBwYXR0ZXJuIGluIHlvdXIgSFRNTCB0aGF0IHlvdeKAmWQgbGlrZSB0byBleHRyYWN0IHRvIGEgbmV3IGNvbXBvbmVudC5cIixcbiAgICAgIFwicmVmZXJlbmNlc1wiOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcIm5hbWVcIjogXCJUYWlsd2luZCBEb2N1bWVudGF0aW9uXCIsXG4gICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2Z1bmN0aW9ucy1hbmQtZGlyZWN0aXZlcyNhcHBseVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIFwibmFtZVwiOiBcIkByZXNwb25zaXZlXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6XG4gICAgICAgIFwiWW91IGNhbiBnZW5lcmF0ZSByZXNwb25zaXZlIHZhcmlhbnRzIG9mIHlvdXIgb3duIGNsYXNzZXMgYnkgd3JhcHBpbmcgdGhlaXIgZGVmaW5pdGlvbnMgaW4gdGhlIGBAcmVzcG9uc2l2ZWAgZGlyZWN0aXZlOlxcbmBgYGNzc1xcbkByZXNwb25zaXZlIHtcXG4gIC5hbGVydCB7XFxuICAgIGJhY2tncm91bmQtY29sb3I6ICNFNTNFM0U7XFxuICB9XFxufVxcbmBgYFxcblwiLFxuICAgICAgXCJyZWZlcmVuY2VzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibmFtZVwiOiBcIlRhaWx3aW5kIERvY3VtZW50YXRpb25cIixcbiAgICAgICAgICBcInVybFwiOlxuICAgICAgICAgICAgXCJodHRwczovL3RhaWx3aW5kY3NzLmNvbS9kb2NzL2Z1bmN0aW9ucy1hbmQtZGlyZWN0aXZlcyNyZXNwb25zaXZlXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQHNjcmVlblwiLFxuICAgICAgXCJkZXNjcmlwdGlvblwiOlxuICAgICAgICBcIlRoZSBgQHNjcmVlbmAgZGlyZWN0aXZlIGFsbG93cyB5b3UgdG8gY3JlYXRlIG1lZGlhIHF1ZXJpZXMgdGhhdCByZWZlcmVuY2UgeW91ciBicmVha3BvaW50cyBieSAqKm5hbWUqKiBpbnN0ZWFkIG9mIGR1cGxpY2F0aW5nIHRoZWlyIHZhbHVlcyBpbiB5b3VyIG93biBDU1M6XFxuYGBgY3NzXFxuQHNjcmVlbiBzbSB7XFxuICAvKiAuLi4gKi9cXG59XFxuYGBgXFxu4oCmZ2V0cyB0cmFuc2Zvcm1lZCBpbnRvIHRoaXM6XFxuYGBgY3NzXFxuQG1lZGlhIChtaW4td2lkdGg6IDY0MHB4KSB7XFxuICAvKiAuLi4gKi9cXG59XFxuYGBgXFxuXCIsXG4gICAgICBcInJlZmVyZW5jZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJuYW1lXCI6IFwiVGFpbHdpbmQgRG9jdW1lbnRhdGlvblwiLFxuICAgICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly90YWlsd2luZGNzcy5jb20vZG9jcy9mdW5jdGlvbnMtYW5kLWRpcmVjdGl2ZXMjc2NyZWVuXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAge1xuICAgICAgXCJuYW1lXCI6IFwiQHZhcmlhbnRzXCIsXG4gICAgICBcImRlc2NyaXB0aW9uXCI6XG4gICAgICAgIFwiR2VuZXJhdGUgYGhvdmVyYCwgYGZvY3VzYCwgYGFjdGl2ZWAgYW5kIG90aGVyICoqdmFyaWFudHMqKiBvZiB5b3VyIG93biB1dGlsaXRpZXMgYnkgd3JhcHBpbmcgdGhlaXIgZGVmaW5pdGlvbnMgaW4gdGhlIGBAdmFyaWFudHNgIGRpcmVjdGl2ZTpcXG5gYGBjc3NcXG5AdmFyaWFudHMgaG92ZXIsIGZvY3VzIHtcXG4gICAuYnRuLWJyYW5kIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzMxODJDRTtcXG4gIH1cXG59XFxuYGBgXFxuXCIsXG4gICAgICBcInJlZmVyZW5jZXNcIjogW1xuICAgICAgICB7XG4gICAgICAgICAgXCJuYW1lXCI6IFwiVGFpbHdpbmQgRG9jdW1lbnRhdGlvblwiLFxuICAgICAgICAgIFwidXJsXCI6XG4gICAgICAgICAgICBcImh0dHBzOi8vdGFpbHdpbmRjc3MuY29tL2RvY3MvZnVuY3Rpb25zLWFuZC1kaXJlY3RpdmVzI3ZhcmlhbnRzXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIF0sXG59O1xuY29uc3QgVEFJTFdJTkRfQ1VTVE9NREFUQSA9IEpTT04uc3RyaW5naWZ5KHRhaWx3aW5kQ3VzdG9tRGF0YSwgbnVsbCwgMikgKyBcIlxcblwiO1xuXG5pZiAodXNlVlNDb2RlICYmIHVzZVRhaWx3aW5kKSB7XG4gIGF3YWl0IERlbm8ud3JpdGVUZXh0RmlsZShcbiAgICBqb2luKHJlc29sdmVkRGlyZWN0b3J5LCBcIi52c2NvZGVcIiwgXCJ0YWlsd2luZC5qc29uXCIpLFxuICAgIFRBSUxXSU5EX0NVU1RPTURBVEEsXG4gICk7XG59XG5cbmNvbnN0IG1hbmlmZXN0ID0gYXdhaXQgY29sbGVjdChyZXNvbHZlZERpcmVjdG9yeSk7XG5hd2FpdCBnZW5lcmF0ZShyZXNvbHZlZERpcmVjdG9yeSwgbWFuaWZlc3QpO1xuXG4vLyBTcGVjaWZpY2FsbHkgcHJpbnQgdW5yZXNvbHZlZERpcmVjdG9yeSwgcmF0aGVyIHRoYW4gcmVzb2x2ZWREaXJlY3RvcnkgaW4gb3JkZXIgdG9cbi8vIG5vdCBsZWFrIHBlcnNvbmFsIGluZm8gKGUuZy4gYC9Vc2Vycy9NeU5hbWVgKVxuY29uc29sZS5sb2coXCJcXG4lY1Byb2plY3QgaW5pdGlhbGl6ZWQhXFxuXCIsIFwiY29sb3I6IGdyZWVuOyBmb250LXdlaWdodDogYm9sZFwiKTtcblxuaWYgKHVucmVzb2x2ZWREaXJlY3RvcnkgIT09IFwiLlwiKSB7XG4gIGNvbnNvbGUubG9nKFxuICAgIGBFbnRlciB5b3VyIHByb2plY3QgZGlyZWN0b3J5IHVzaW5nICVjY2QgJHt1bnJlc29sdmVkRGlyZWN0b3J5fSVjLmAsXG4gICAgXCJjb2xvcjogY3lhblwiLFxuICAgIFwiXCIsXG4gICk7XG59XG5jb25zb2xlLmxvZyhcbiAgXCJSdW4gJWNkZW5vIHRhc2sgc3RhcnQlYyB0byBzdGFydCB0aGUgcHJvamVjdC4gJWNDVFJMLUMlYyB0byBzdG9wLlwiLFxuICBcImNvbG9yOiBjeWFuXCIsXG4gIFwiXCIsXG4gIFwiY29sb3I6IGN5YW5cIixcbiAgXCJcIixcbik7XG5jb25zb2xlLmxvZygpO1xuY29uc29sZS5sb2coXG4gIFwiU3R1Y2s/IEpvaW4gb3VyIERpc2NvcmQgJWNodHRwczovL2Rpc2NvcmQuZ2cvZGVub1wiLFxuICBcImNvbG9yOiBjeWFuXCIsXG4gIFwiXCIsXG4pO1xuY29uc29sZS5sb2coKTtcbmNvbnNvbGUubG9nKFxuICBcIiVjSGFwcHkgaGFja2luZyEg8J+mlVwiLFxuICBcImNvbG9yOiBncmF5XCIsXG4pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sUUFBUSxvQkFBb0I7QUFDM0UsU0FBUyxLQUFLLFFBQVEscUJBQXFCO0FBQzNDLFNBQVMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsUUFBUSxtQkFBbUI7QUFDM0UsU0FDRSxhQUFhLEVBQ2IsWUFBWSxFQUNaLGVBQWUs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
// denoCacheMetadata=13146103641698892402,8646984820412258499
