<a id="readme-top"></a>

<div align="center">
  <img src="assets/icon.png" alt="Redline logo: a tachometer needle in the red zone on a die-cut sticker" width="96" height="96" />

  <h1>Redline 2.0</h1>

  <p>
    <strong>Snap it. We blur it. You collect it.</strong><br />
    The car-spotting sticker album. Point your phone at a car: Co-Driver names it, your phone blurs every licence plate, and a foil sticker slaps into your album.
  </p>

  <p>
    <a href="https://redline-spotter.vercel.app"><strong>Open the live PWA »</strong></a>
    ·
    <a href="#demo-account">Demo account</a>
    ·
    <a href="#lecturer-demo-path-about-5-minutes">5-minute demo</a>
    ·
    <a href="#getting-started">Run it locally</a>
  </p>
</div>

> UCLL – Mobile Applications (MBI51j) 2026-2027 · Assignment 1: **PWA** · Jasper Degreef · version **2.0.0** (Season 1)

## Demo account

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Live app | **[redline-spotter.vercel.app](https://redline-spotter.vercel.app)** |
| Email    | `demo@redline.test`                                                  |
| Password | `Redline!Demo26`                                                     |

- The demo account is **shared** by everyone who reads this README. It **cannot be deleted**, and its password, email, cars, car nickname and shout-out cannot be changed (the database refuses; spots older than a day cannot be deleted either, spots you add today can). It owns a pre-verified car with the plate **`DEMO-123`**, so the whole owner flow works with this one account.
- Co-Driver (the AI) has a limit of **15 photos per account per day**, and the free provider allowance is shared by all accounts. Please use Co-Driver sparingly on the demo account; the manual path (Co-Driver off) is just as complete.
- **Install it as an app (Android):** open the link in Chrome → menu ⋮ → _Install app_ / _Add to Home screen_.

### Lecturer demo path (about 5 minutes)

1. **Log in** as `demo@redline.test`.
2. **SPOT** (the raised red button in the middle of the tab bar): take a photo of any car (a printed photo works) or pick one from the gallery. The review screen opens at once. Co-Driver fills in the car, generation, years, paint, body style and sticker match in the background, and the city and date come from the photo or the phone. Tap the dashed plate box to accept it (or draw your own), tap **Every plate is blurred**, then **COLLECT**. The reveal plays (packet, stamp, XP, shift lights) and the sticker is stuck into its album page.
3. **Pit Wall**: your level and title, the weekly streak and this week's three pit-board challenges.
4. **Garage**: the verified `DEMO-123` car.
5. **Me → Trust Center**: switch **Co-Driver AI** off. Spot another car: the review opens in manual mode and the app makes zero AI calls. Type `DEMO-123` in the owner-ping plate field and collect. The Garage gets a live sighting (toast and tab badge).
6. **Trust Center**: "What Redline stores" shows **0 licence plates** and **0 GPS points**.

<details>
  <summary>Table of contents</summary>
  <ol>
    <li><a href="#about-the-project">About the project</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#the-album-catalogue-and-collections">The album, catalogue and collections</a></li>
    <li><a href="#co-driver-the-ai">Co-Driver (the AI)</a></li>
    <li><a href="#ethical-gamification">Ethical gamification</a></li>
    <li><a href="#getting-started">Getting started</a></li>
    <li><a href="#backend-setup">Backend setup (database, function, smoke test)</a></li>
    <li><a href="#testing">Testing and test plan</a></li>
    <li><a href="#building-and-deploying">Building and deploying</a></li>
    <li><a href="#privacy-and-security">Privacy and security</a></li>
    <li><a href="#project-structure-and-the-styling-rule">Project structure and the styling rule</a></li>
    <li><a href="#architecture-decisions">Architecture decisions</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#release-notes">Release notes</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About the project

### Problem statement

Car spotters photograph special cars they see on the street: supercars, classics, JDM legends. After a few months their spots are buried between thousands of other pictures in their camera roll. They no longer know which models they have already seen, when or where, and there is no motivating overview of what is still missing. Logging a spot by hand is tedious (brand, model, colour, place, date). And when they share a spot, the licence plate of a stranger's car is usually readable: a plate is personal data under the GDPR and can expose where the owner lives or parks. On the other side, many owners of special cars would love to know when their car is spotted, but they never find out.

**In one sentence:** _Redline helps car spotters collect every car they spot in a real sticker album, filled in automatically, without exposing anyone's licence plate or location._

### Target audience

**Primary users: car spotters**, 14–30 years old, in Belgium and the Netherlands, on Android phones with the installed PWA, often on weak 4G at car meets. They are motivated by collecting and completing (football-sticker albums, Pokédex-style games).

- _Persona – Lars (17, Antwerp):_ takes the tram to car meets every weekend and has 2,000 car photos in his gallery. He wants to see at a glance which supercars he is still missing, without typing for every photo.
- _Persona – Amira (24, Leuven):_ spots classics on her way to work. She does not want strangers' plates visible in her photos.

**Secondary users: owners of special cars.** _Persona – Marc (52, Hasselt)_ owns a red Ferrari with a vanity plate. He loves knowing when his car was spotted, but he does not want anyone to be able to track him.

**Stakeholders who never open the app:** the owners of spotted cars and passers-by in the photos. Their privacy is the core of the design. Other stakeholders are the lecturer, and Supabase, Vercel and Cloudflare as sub-processors (see [Privacy and security](#privacy-and-security)).

**Why a mobile app?** Spotting happens on the street: you need the **camera** at once, the phone is always at hand, the album should open **offline**, and owners want to be **pinged**. As a PWA it installs on the home screen today; the native Android app (assignment 2) follows in December.

### What changed in 2.0, and the lecturer's suggestions

| Ask                                                                                | How Redline 2.0 answers it                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Make sure the license plates are not visible"                                     | The **plate gate**: COLLECT stays disabled until you explicitly confirm **Every plate is blurred** (needs at least one box) or **No licence plate is visible**. AI boxes are only dashed suggestions; any box change resets the confirmation. The preview is exactly what is uploaded. |
| "Some vanity plates might just be wanted to be shown"                              | A verified owner can choose **Vanity plate** (re-typing the plate as consent). Spotters of that car then see it, read live through an RPC, never copied into their spots.                                                                                                              |
| "A portal for special car owners that gets pinged every time their car is spotted" | The **Garage**: owners register up to 3 cars. Once **verified**, they get a privacy-safe **sighting** (car, city, hour, blurred photo) for every spot of their plate, with a realtime toast and tab badge.                                                                             |
| The student's own ask: "fill it in automatically, I just edit it if it's wrong"    | **Co-Driver** pre-fills everything in the background; with a confident answer, COLLECT is the only extra tap after the plates.                                                                                                                                                         |
| "Use only style components" (screens without styling)                              | The **LIVERY** design system: screens in `app/**` contain zero styling, enforced by ESLint as an **error**.                                                                                                                                                                            |

### Competitors

Checked on the App Store / Google Play and on the web (November 2026):

| Competitor                                                                                     | What it does                                 | Strong                         | Falls short for our target group                                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| [Car Spotting App](https://appgoblin.info/apps/app.car.spotting) (Applax)                      | Supercar spots on a world map, community     | Big community, map of spots    | Supercars only, social feed instead of a personal collection, plates visible |
| [CarSpotter – Collect Cars](https://apps.apple.com/us/app/-/id6742125087)                      | Virtual garage of spotted cars               | Collection idea                | No privacy features, no owner involvement                                    |
| [Spottr](https://sites.google.com/view/spottr/home)                                            | Photo → AI car recognition → personal garage | Automatic recognition, sharing | Recognition-first, no completion goal; plates untouched                      |
| [CarCollector: Spotting Game](https://mwm.ai/apps/carcollector-spotting-game/6773265156)       | Spotting game with map and achievements      | Gamification                   | The exact spot location is stored and shown (privacy risk for owners)        |
| [Car Spotting by MotorTrend](https://apps.apple.com/us/app/id1447901560)                       | AR game that recognises cars with the camera | Fun AR                         | A game, not a collection of your own real spots                              |
| AI identifiers (e.g. [Car Identifier: AI Scanner](https://apps.apple.com/us/app/id6746683498)) | Photo → make, model, year                    | Fast identification            | No collection, mostly paywalled                                              |
| Autogespot / Instagram / WhatsApp groups                                                       | Share spots publicly                         | Large audiences                | Public by default, readable plates, no overview of what you collected        |

**Differentiation:** Redline is the only one that combines AI auto-fill and a completable sticker album with **privacy by design** (plates blurred on the device, no GPS stored, no plate stored) and a **verified-only owner portal** that cannot be used to stalk anyone.

### Built with

- [Expo SDK 52](https://expo.dev) + [Expo Router 4](https://docs.expo.dev/router/introduction/), React Native 0.76 + react-native-web, TypeScript (strict): the course boilerplate.
- [Supabase](https://supabase.com) (EU, Frankfurt): Postgres with row level security, Auth, Storage (private bucket), Realtime and an Edge Function.
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) (Mistral Small 3.1, free daily allowance, zero data retention) behind the `identify-car` Edge Function.
- [TanStack Query](https://tanstack.com/query) (server state, persisted for offline use) and [Zustand](https://zustand.docs.pmnd.rs) (client state).
- [i18next](https://www.i18next.com) + react-i18next + expo-localization: English and Dutch, typed per namespace.
- `react-native-svg` (silhouettes, tacho, brand mark), `expo-linear-gradient` (foil), Barlow and Barlow Condensed (`@expo-google-fonts`). Animations use React Native `Animated`.
- [Cypress](https://www.cypress.io) (unit, component and end-to-end), [Storybook](https://storybook.js.org) (every component in light and dark), [Vercel](https://vercel.com) (hosting).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

The app has five tabs: **Album**, **Pit Wall**, **SPOT** (the raised Ignition button), **Garage** and **Me**.

| Area                        | What you get                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pit Stop capture** (SPOT) | Camera shutter or gallery. The review screen opens immediately; EXIF date, the city, the 768 px AI image and Co-Driver run in the background. One scrolling screen: plates → car → sticker match → paint → city → date → owner ping → notes, with a sticky **COLLECT** bar. Every pre-filled field shows its source: **CO-DRIVER**, **AUTO** or **YOU**.                           |
| **Plate gate**              | Dashed AI suggestions you accept with a tap, boxes you can move, resize, add ("Add box") and remove. A live redacted preview (the same function as the upload). Two explicit statements, nothing pre-selected; if Co-Driver saw a plate and you say "no plate", a second tap is required.                                                                                          |
| **Never a dead end**        | Offline, AI off, not configured, daily limit, provider busy, timeout (35 s) or an error: a specific banner and the same manual path. **Fill in myself** is always visible while Co-Driver is analysing. "Not a car" offers Retake or "It is a car, fill in myself". A duplicate photo (perceptual hash) shows "You already added this photo" with View and Save anyway.            |
| **Smarter search**          | Accent-folding search with nicknames and aliases: "huracan", "citroen 2cv", "vw golf", "gtr", "supra mk4", "g-wagon", "lambo", "merc amg gt", "eend", "kever", and "magnum" for the Ferrari 308 GTSi. Free text only appears after **Not in the album**.                                                                                                                           |
| **Reveal**                  | A full-screen ritual: chrome packet → tear → stamp (NEW, ×N, FRESH PAINT, WILDCARD) → XP rows on an odometer → 15 shift lights → SHIFT UP on a level-up → page and set progress ("ITALIAN EXOTICS 3/12") → plaques and challenges → **Stick it** into the mini album page. **Skip** is always visible; reduced motion shows the final state at once. Haptics after a user gesture. |
| **Album**                   | A cover with a tacho gauge (red zone in the last 15 %), the sticker odometer, your level roundel and a pit-board teaser. Contents of 9 pages plus a **Collections** shelf. Swipeable pages with livery headers, silhouette slots and die-cut foil stickers (matte, chrome, holo, gold by rarity). Sticker and spot detail pages.                                                   |
| **Pit Wall**                | Level, title and XP on 15 shift lights, a weekly streak with an 8-week lap chart, three weekly pit-board challenges with live countdowns, and a cabinet of 15 dash plaques (bronze, silver, gold).                                                                                                                                                                                 |
| **Garage**                  | Up to 3 cars. New cars are **Pending verification** and receive nothing. Verified cars get sightings (paged by 20, grouped by day, marked read when opened, "Mark all read"), a realtime toast and a tab badge. Visibility (Hidden, Badge with an 80-character shout-out, Vanity plate), pause pings, remove.                                                                      |
| **Me and Trust Center**     | Driver card, stats, language, haptics, logout, delete account. Trust Center: Co-Driver, Auto-city and "Share my name with owners" switches, the "What Redline stores" ledger, the "What owners see" table and Co-Driver scans left today. A public `/privacy` page in English and Dutch.                                                                                           |
| **PWA**                     | Installable, a per-build service worker (precached shell, every album and collection page, fonts and icons), an update toast, photos cached without their token, the album opens offline with an expired session (read-only), strict security headers with a generated CSP.                                                                                                        |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## The album, catalogue and collections

**The catalogue has 118 real production models**, numbered 1–118, each with a rarity (common, rare, epic, legendary), a body style, the country of origin of the make and, for the 70 newer entries, production years.

- **Season 1 (#1–48)** keeps its ids and numbers (live spots reference them): [`supabase/seed.sql`](supabase/seed.sql).
- **#49–118** were added with the collections: [`supabase/seed_collections.sql`](supabase/seed_collections.sql). The data was reviewed by hand; the judgement calls are listed at the top of that file.

**Album pages** follow the categories: Icons (10), Sports cars (17), Supercars (11), Hypercars (11), Classics (29), JDM (14), Muscle (10) and Electric (16), plus **Wildcards** for every car you spot that is not in the catalogue. A full page earns a FULL PAGE stamp and +300 XP.

**Eight themed collections** cut across the categories; a car can sit in several sets. Completing a set earns a gold-foil **SET COMPLETE** stamp, +250 XP and progress on the `set_collector` plaque (1, 4 and 8 sets).

| Collection                 | Cars | Examples                                                      |
| -------------------------- | ---- | ------------------------------------------------------------- |
| Japanese JDM Legends       | 12   | Supra (A80), Skyline GT-R (R34), RX-7 (FD), AE86, 2000GT, LFA |
| American Muscle & Classics | 12   | Mustang, Corvette Sting Ray (C2), Charger, Viper, Model T     |
| German Autobahn Heroes     | 12   | 911 GT3, 911 Turbo (930), M5 (E39), Quattro, Carrera GT       |
| Italian Exotics            | 12   | **Ferrari 308 GTSi**, F40, Testarossa, Countach, Miura        |
| British Icons              | 12   | Mini Cooper S, DB5, E-Type, McLaren F1, Phantom (VIII)        |
| Hot Hatch Heroes           | 10   | Golf GTI, 205 GTI, Delta HF Integrale, Clio V6, GR Yaris      |
| Electric Era               | 12   | Model 3, Taycan, Ioniq 5, i3, ID. Buzz, Rimac Nevera          |
| Hypercar Hall of Fame      | 12   | Chiron, Veyron, Jesko, Zonda, Enzo, LaFerrari, P1, 918 Spyder |

The **Ferrari 308 GTSi** (#82, Italy, 1980–1982, epic, Classics page) is in Italian Exotics, with its own fun fact about _Magnum, P.I._ in both languages.

Pages and collections are data-driven: a page is any ordered list of models, laid out on a 2-column grid, so new models and sets only need seed rows. Co-Driver's catalogue matching covers all 118 models and therefore every collection, because the `identify-car` function builds its prompt from the `car_models` table.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Co-Driver (the AI)

- **Provider:** [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) with `@cf/mistralai/mistral-small-3.1-24b-instruct`, on the free daily allowance and with **zero data retention**. The Mistral AI API is an optional fallback, used only if its key is configured. There is no paid provider.
- **Where:** the Supabase Edge Function [`supabase/functions/identify-car`](supabase/functions/identify-car/index.ts). The provider keys are Edge Function secrets and never reach the app. A JWT is required, uploads are capped at 4 MB, and each account gets **15 identifications a day** (`consume_identify_quota`).
- **What is sent:** one ≤768 px JPEG, re-encoded on a canvas (so EXIF, including GPS, is stripped). Nothing else.
- **What comes back:** make, model, generation, years, paint, body style, confidence, a catalogue id, plate boxes, plate text and a fun fact. The app validates every field with type guards. Plate boxes are only dashed suggestions; the plate text pre-fills the owner-ping row (shown masked, `••34`) and is sent once, only if the ping toggle is on. The answer is never logged, persisted or put in the query cache.
- **Confidence:** `sure` ≥ 0.85, `likely` 0.60–0.85 ("Check the model"), `guess` < 0.60 ("Is it one of these?" with candidate chips). Shown with 5-LED shift lights plus a word, never by colour alone.
- **Off switch:** with Co-Driver off (Trust Center, or "Fill in myself" in the first-use consent sheet) the app makes **zero** calls to the function; an E2E test counts them. Offline, it makes none either.
- **Never blocks:** identification starts in the background as soon as a photo is chosen (about 12 s on the free tier) while you handle the plates.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Ethical gamification

Progression is designed to reward going out and spotting, not to keep people hooked:

- **Derived on the device** from your own spots (`deriveProgress`), with no progression tables. It works offline, and it stays honest after a delete: remove a spot and its XP, sticker and plaques are recalculated away ("Progress is calculated from your spots").
- **No randomness, no currency, no loot boxes, no paid anything.** The reveal is deterministic: the same spot always gives the same XP. Weekly challenges come from a seeded generator, so everyone gets the same three boards.
- **No leaderboards and no social pressure.** Your progress is only visible to you.
- **Weekly, not daily, streaks**, so a quiet week costs nothing more than a reset of the streak.
- **Owner matches give 0 XP**, so there is no incentive to hunt particular people's cars, and duplicates of the same model score once per 24 h.
- XP table: spot +10; new sticker +40 / +80 / +160 / +400 by rarity; duplicate +5; fresh paint +25; wildcard +15; full page +300; set complete +250; whole album (118/118) +2,000; challenges +75 / +125 / +250 and +150 for a clean sweep; streak +25 × weeks (max 8); plaques +50 / +100 / +250. Level L needs 50 × L × (L − 1) XP.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting started

### Prerequisites

- **Node.js 22 LTS or newer** and npm 10.
- For your own backend: a free **Supabase** account (EU region). Using the existing backend only needs the two public values in `.env`.
- Optional: an Android phone or emulator for the development build. No Mac is needed: the targets are the PWA and Android.

### Installation

```bash
git clone https://github.com/ShadowFlashy/mobile-application.git
cd mobile-application
npm ci
cp .env.example .env   # then fill in the two values
```

`.env` (gitignored, never committed) needs:

| Variable                        | Where to find it                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase dashboard → _Project Settings_ → _API Keys_ (project URL)                                                                          |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same page → _Publishable key_ (`sb_publishable_…`). It is public by design: row level security protects the data. Never use the secret key. |

### Run

```bash
npm run web       # in the browser (http://localhost:8081)
npm start         # Expo dev server for the Android development build
npm run tunnel    # on eduroam (campus Wi-Fi blocks the local connection)
npm run storybook # the component library (http://localhost:6006)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Backend setup

Everything runs in the Supabase **SQL editor** of an EU project. Take a backup first. All files are idempotent: running one twice is safe.

**1. Database, in this order**

| #   | File                                                                                                                | What it does                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | [`migrations/20261109120000_init_redline.sql`](supabase/migrations/20261109120000_init_redline.sql)                 | v1 schema (only for a new project; the live project already has it)                                                                                                                                            |
| 2   | [`migrations/20261110080000_identify_quota.sql`](supabase/migrations/20261110080000_identify_quota.sql)             | Co-Driver's 15/day quota (`consume_identify_quota`)                                                                                                                                                            |
| 3   | [`migrations/20261110090000_redline_v2.sql`](supabase/migrations/20261110090000_redline_v2.sql)                     | v2: spot fields, private plate matches, verified-only snapshot pings, rate limits, owner verification RPCs, showcase RPC, demo guard, collections tables and car years                                         |
| 4   | [`seed.sql`](supabase/seed.sql)                                                                                     | Season 1 catalogue (#1–48) with body style and country                                                                                                                                                         |
| 5   | [`seed_collections.sql`](supabase/seed_collections.sql)                                                             | Catalogue #49–118 with years, the 8 collections and their 94 memberships                                                                                                                                       |
| 6   | [`seed_demo.sql`](supabase/seed_demo.sql)                                                                           | The demo account's verified `DEMO-123` car (visibility Vanity plate). Needs the `demo@redline.test` user to exist.                                                                                             |
| 7   | [`migrations/20261110110000_redline_v2_hardening.sql`](supabase/migrations/20261110110000_redline_v2_hardening.sql) | Hardening: the demo account cannot be taken over or emptied, pending owners read no sighting (also not old v1 pings), sighting photo paths must be the spot's own, owner snapshots only carry gazetteer cities |
| 8   | [`migrations/20261110100000_hide_spotter_key.sql`](supabase/migrations/20261110100000_hide_spotter_key.sql)         | **After the v2 app is deployed:** owners can no longer read a sighting's `spotter_key` (the per-car spotter pseudonym) or `spot_id`. The v1 app still needs `spot_id`.                                         |

The v1 app keeps working after step 3 (it just no longer sees owner matches). Existing v1 owner cars become **Pending verification**.

**2. The `identify-car` function.** It is deployed through the Supabase dashboard (Edge Functions → `identify-car`), with these secrets (Edge Functions → Secrets): `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (a Workers AI token), optionally `CLOUDFLARE_AI_MODEL`, and only if you want the fallback, `MISTRAL_API_KEY`. If the function or its secrets are missing, the app shows "Co-Driver is not set up" and works in manual mode.

**3. SQL smoke test.** Run [`supabase/tests/redline_v2_smoke.sql`](supabase/tests/redline_v2_smoke.sql) in the SQL editor (or `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/redline_v2_smoke.sql`). It runs inside one transaction that is **rolled back**, impersonates temporary `*@redline.test` users and asserts the safety rules (pending cars get no ping, one ping per spotter per 24 h, paused cars, the 30 plate lookups a day, owners cannot read spot rows or self-verify, the 3-car limit, the plate lock, the demo guard, the quota, service-role-only verification). The last row must read **ALL OK**. Before step 8, a NOTICE "KNOWN ISSUE … spotter_key" may appear; it is not a failure. After step 7, also run [`supabase/tests/redline_v2_hardening_smoke.sql`](supabase/tests/redline_v2_hardening_smoke.sql) the same way (demo guard, pending owners, gazetteer cities); its last row must read **ALL OK** too.

**4. Owner verification (beta).** New cars stay Pending: no pings, no stats, no showcase. During the beta the developer verifies an owner out of band (for example a photo of the registration papers next to the car) and then runs:

```sql
update public.owner_cars set verified_at = now() where id = '<car id>';
```

Only one verified owner per plate is possible. The automated flow (a one-time `RL-XXXXXX` code photographed with the plate, checked by a separate `verify-owner` function) is prepared in the database but not switched on yet.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Testing

Everything uses **Cypress**, the course's test framework. Unit and component tests run in Cypress component mode; E2E runs against the **production build** with every Supabase and `identify-car` request stubbed through `cy.intercept`, so no account or network is needed. Animations are switched off with reduced motion, time is frozen with `cy.clock()` where weeks matter, and there are no fixed waits.

| Command                          | What it runs                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`              | TypeScript strict, for the app and for the Cypress project                                                         |
| `npm run lint`                   | ESLint: Expo config, the course rules and the LIVERY zero-styling rules (errors)                                   |
| `npm run test:unit`              | 62 unit and component specs in `cypress/unit/<area>` and `cypress/component/<area>`                                |
| `npm run build:web`              | The static web export plus postbuild (service worker, CSP, header files)                                           |
| `npm run test:e2e`               | Serves `dist/` with its generated `serve.json` (same headers as Vercel) and runs the 11 E2E specs in `cypress/e2e` |
| `npm test`                       | `test:unit`, `build:web` and `test:e2e` in a row                                                                   |
| `npm run build-storybook`        | Builds Storybook; every component has a story, rendered in light and dark side by side                             |
| `node scripts/check-secrets.mjs` | The secret scan (also in the pre-commit hook)                                                                      |
| DB smoke                         | `supabase/tests/redline_v2_smoke.sql` and `redline_v2_hardening_smoke.sql` (see [Backend setup](#backend-setup))   |

A **pre-commit hook** (Husky + lint-staged) runs ESLint, Prettier and the secret scan on the staged files, then the type check and the unit tests.

**What the tests prove, among others:** the uploaded JPEG has no EXIF segment and its pixel variance inside every plate box drops by at least 80 %; with Co-Driver off there are zero `identify-car` calls; no request URL or body contains coordinates; the plate is sent only when the ping toggle is on; every text and background colour pair is at least 4.5:1; English and Dutch have the same keys and placeholders; every catalogue model is on a page or in a set and the Ferrari 308 GTSi row is right; progression is deterministic, including the daylight-saving weeks.

### Test plan

Validation criteria per feature (course ch. 12), used for the automated runs, the manual test on a real Android phone and the user tests.

| #   | Feature                 | Steps → expected result                                                                                                                                                 | Automated                            |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Login and register      | Wrong password → clear error. Demo login → Album. No "Lecturer?" text; link to Privacy; the condensed font is loaded.                                                   | `login.cy.ts`                        |
| 2   | App shell               | 5 tabs in order, SPOT raised; each opens its screen; Dutch labels Album/Pitmuur/SPOT/Garage/Ik and `html[lang=nl]`.                                                     | `tabs.cy.ts`                         |
| 3   | Capture, sure answer    | Camera photo → accept the dashed plate box → Every plate is blurred → COLLECT, no typing → insert has `identified_by: ai`, paint, city Leuven, the plate once → reveal. | `capture.cy.ts`                      |
| 4   | Capture, gallery + EXIF | Photo with EXIF date and GPS near Spa → `spotted_at` is that date, city Spa, the device position is never asked.                                                        | `capture.cy.ts`                      |
| 5   | Capture, fallbacks      | Unsure → candidate pick saves `ai_edited`; not a car → Retake; not configured, network error → manual; AI off → 0 calls; no plate → COLLECT blocked.                    | `capture.cy.ts`, `trust.cy.ts`       |
| 6   | Plate gate              | Confirm needs ≥ 1 box; any box change resets it; second tap when a suggestion was ignored; pixels pixelated and EXIF gone.                                              | component + unit (`capture/`)        |
| 7   | Album and collections   | Cover 2/6 with the fixture; locked slot "Worth +160 XP"; collected sticker shows its sets; Wildcards; SET COMPLETE; showcase only when the RPC returns it.              | `album.cy.ts`                        |
| 8   | Reveal                  | Deep link → NEW stamp, XP total, page and set progress, Stick it → View page; Skip → Spot another; missing spot → Album.                                                | `reveal.cy.ts`                       |
| 9   | Pit Wall                | Frozen week → deterministic boards, level and title from the fixture XP, a 2-week streak.                                                                               | `progress.cy.ts`                     |
| 10  | Garage                  | Register → Pending, plate sent once, no pings; verified car shows Verified; opening a sighting PATCHes `read_at`; Mark all read; pause; Vanity needs the plate.         | `owners.cy.ts` + DB smoke            |
| 11  | Trust and privacy       | Ledger 0 plates / 0 GPS points; `/privacy` is public in en and nl.                                                                                                      | `trust.cy.ts`, `privacy.cy.ts`       |
| 12  | Offline                 | Expired session + no network + reload → Album still shown, read-only.                                                                                                   | `offline.cy.ts` + manual             |
| 13  | PWA                     | Manifest, two theme-color metas, fonts, service worker active, security headers.                                                                                        | `pwa.cy.ts` + `smoke:live`           |
| 14  | Install                 | Chrome on Android → Install app → opens full screen from the new icon.                                                                                                  | manual                               |
| 15  | Accessibility           | TalkBack reads every control; text at 200 % still fits; rarity and confidence also as words; reduced motion respected; dark mode readable.                              | manual + `contrast.cy.ts`            |
| 16  | Delete                  | Delete a spot → sticker may lock again; delete account → login; the demo account refuses.                                                                               | manual                               |
| 17  | Real Co-Driver          | A real photo on the live app → car recognised and pre-filled within ~15 s; the quota counter drops by one.                                                              | manual (needs the deployed function) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Building and deploying

**PWA (assignment 1)**

```bash
npm run build:web               # expo export -p web + postbuild → dist/
npm run serve:web               # serve dist/ on http://localhost:8081 with the generated headers
npm run deploy:web              # build, deploy dist/ to Vercel (production) and run the live smoke test
npm run smoke:live -- <url>     # check a deployment (default: the production URL)
node scripts/generate-icons.mjs # re-render every icon from assets/brand/icon-master.svg (--check verifies)
```

- [`scripts/postbuild-web.mjs`](scripts/postbuild-web.mjs) fills in the service worker template ([`public/sw.js`](public/sw.js): cache `redline-<entry hash>`, precache list), hashes every inline script into the Content-Security-Policy and writes it into `dist/vercel.json` and `dist/serve.json`. It fails the build on an inline script it cannot hash, inline event handlers or missing shell pages.
- [`scripts/smoke-live.mjs`](scripts/smoke-live.mjs) fetches `/`, every `/_expo` and `/assets` URL in the HTML and the entry bundle (`.ttf` must be `font/ttf`), the manifest and its icons (`image/png`), `sw.js` and every precached URL, and checks the security headers. It exits 1 on any failure.
- **Offline session:** if the token cannot be refreshed (no network), the app falls back to the stored session after 5 s and opens read-only from the cached data; it switches back as soon as the token refreshes. Every sign-out clears the query cache, the persisted cache and the photo cache.
- **Icons:** one SVG master, [`assets/brand/icon-master.svg`](assets/brand/icon-master.svg), rendered with `@resvg/resvg-js` into the app icon, Android adaptive foreground and background, splash, favicon, PWA icons, maskable icons and the Apple touch icon.

**Android (assignment 2, December)**

```bash
npm install -g eas-cli && eas login
# add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the EAS "preview" environment
npm run build:android:preview   # signed APK for internal distribution
```

The native build still lacks on-device plate redaction and the AI image (planned with Skia), so the native review shows "not supported" for Co-Driver and cannot upload yet. Versions follow semantic versioning (`app.json` → `version`).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Privacy and security

Redline processes data of people who never use the app (owners of spotted cars, passers-by), so the design starts from the GDPR.

**Invariants (asserted by tests):**

- The raw photo is never uploaded or persisted; only the redacted, canvas-re-encoded JPEG (no EXIF) is.
- Plate text is never stored, logged, cached or put in a URL. It lives in memory and is sent at most once, in `spots.plate_input`; a trigger hashes it (keyed HMAC), matches it against **verified** cars and clears it before the row is written.
- GPS coordinates never leave the device. The city is looked up in a bundled list of 210 places on the phone (rounded position, then discarded); only the city label is stored.
- With Co-Driver off there are zero calls to `identify-car`.

### Threat model

| Threat                                                  | Mitigation                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A stranger wants a plate or a location from a photo     | Plates are pre-blurred and must stay covered. EXIF is stripped. The city is picked from a fixed list (an owner's sighting only ever carries a city from that list); GPS never leaves the device. Photos sit in a private bucket behind 1 h signed URLs.                                           |
| A fake "owner" tracks someone else's car                | Sightings only reach **verified** owners (developer-verified during the beta; one verified owner per plate). Pending claims receive nothing.                                                                                                                                                      |
| An owner wants to identify or harass a spotter          | A sighting has no user-id field (its photo file name does contain the spotter's random account UUID, see below), no notes, no exact time, no other spots: only car, city, hour and the blurred photo. The spotter's name only with their opt-in. 24 h dedupe per spotter. Owners can pause pings. |
| A plate-registration oracle or spam                     | Registration never says "plate taken" for someone else's plate. Spotters never see which car matched; the showcase only appears if the owner opted in. Limits: 30 plate lookups a day, 30 spots an hour, 3 cars.                                                                                  |
| AI budget abuse                                         | JWT required, 15 identifications per account per day, a 4 MB cap and timeouts.                                                                                                                                                                                                                    |
| Prompt injection through text painted on a car          | A strict schema with clamped values, catalogue ids validated, verification decided in SQL. The model's answer is data and never triggers an action.                                                                                                                                               |
| Clickjacking or XSS against the session in localStorage | A CSP with hashed inline scripts, `connect-src` and `img-src` pinned to Redline's own Supabase project, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, COOP `same-origin`. Caches cleared on every sign-out.                                                                                  |
| The shared demo account                                 | It cannot be deleted, its password/email cannot be changed, its cars, nickname and shout-out are locked and its older spots cannot be deleted (database triggers). It has its own AI quota.                                                                                                       |

**Residual risks, said honestly:** beta verification is a manual check, not cryptographic proof. A sighting's photo path contains the spotter's random account UUID, and a blurred photo still shows its surroundings. Until migration step 8 is applied, an owner's client can technically read a sighting's `spotter_key` (a per-car pseudonym, not an identity).

### Data map

| Data                                                                              | Where                                                                                                       | Who sees it                                      | Retention                                 |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------- |
| Account email, username                                                           | Supabase Auth / `profiles` (EU, Frankfurt)                                                                  | the user                                         | until the account is deleted              |
| Redacted spot photo                                                               | Storage `spot-photos/<uid>/<spot>.jpg` (private)                                                            | the spotter; a verified owner of the matched car | until the spot or account is deleted      |
| Spot fields: car, paint, body style, city, date, notes, AI provenance, photo hash | `spots`                                                                                                     | the spotter only                                 | until deletion                            |
| Plate text                                                                        | never stored; a transient trigger input, kept only as a keyed hash for registered cars                      | nobody                                           | 0                                         |
| Owner car (make/model, nickname, plate hash, last 2 characters, visibility)       | `owner_cars`                                                                                                | the owner                                        | until the car or account is deleted       |
| Sighting snapshot (car label, city, hour, photo path, optional spotter name)      | `spot_notifications`                                                                                        | the owner                                        | until the spot, car or account is deleted |
| AI usage counts, plate-lookup counts                                              | `private.*`                                                                                                 | nobody (rate limits only)                        | 2 days / 24 h                             |
| The photo for Co-Driver (≤768 px, EXIF-free)                                      | transient: through our function to Cloudflare Workers AI (zero data retention), or Mistral AI if configured | the processor only                               | not stored by Redline                     |
| Settings, seen plaques, query cache                                               | the device (localStorage / AsyncStorage)                                                                    | the user                                         | until logout or clearing the app          |

**Sub-processors:** Supabase (database, auth, storage, functions; eu-central-1 Frankfurt), Vercel (static hosting, no personal data), Cloudflare (Workers AI) and Mistral AI (EU) only when it is configured as the fallback.

**Consent and controls:** a consent sheet on the first Co-Driver use, with an off switch in the Trust Center; the Auto-city switch (off = no location prompt and no EXIF GPS lookup); "Share my name with owners" (off by default, also per spot); haptics; delete a spot or the whole account (photos are deleted page by page, then the account). The audience is 14+ (Belgium's digital-consent age is 13). No analytics, ads or trackers.

**Secrets:** no keys in the code. Client config only through `EXPO_PUBLIC_*` in the gitignored `.env`; the AI keys only as Edge Function secrets. `scripts/check-secrets.mjs` blocks commits with key-like strings.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project structure and the styling rule

The folder structure of the course boilerplate is kept. New components live in domain folders.

```
app/                         Expo Router screens: they only compose components (zero styling)
  _layout.tsx / .web.tsx     Root providers; the web one adds the PWA head and the service worker
  login.tsx register.tsx privacy.tsx onboarding.tsx (P1 placeholder)
  (app)/_layout.tsx          Auth gate + stack (capture and reveal as full-screen modals)
  (app)/(tabs)/              index (Album) · progress (Pit Wall) · spot · owners (Garage) · profile (Me)
  (app)/capture.tsx  reveal/[spotId]  album/[page]  album/collection/[id]  sticker/[id]  details/[id]
  (app)/garage/new  garage/[carId]/index  garage/[carId]/verify  sighting/[id]  trust  share/[spotId] (P1)
src/
  theme/                     LIVERY tokens: colours (Paddock Paper / Night Session), type, spacing, motion
  components/primitives/     Themed base components (Text, Stack, Grid, Surface, Sheet, …) + stories
  components/{album,capture,garage,progress,reveal,trust,brand}/   Feature components + stories
  hooks/  services/  state/  Data hooks (TanStack Query) · all Supabase calls · Zustand stores
  utils/                     Pure, unit-tested logic (progression engine, capture machine, EXIF, …)
  i18n/locales/{en,nl}/      One JSON file per namespace; Dutch is type-checked against English
  types/  constants/  lib/
supabase/                    migrations/, seeds, tests/ (SQL smoke), functions/identify-car
public/  scripts/            PWA manifest, service-worker template, icons, host config · build scripts
cypress/                     unit/<area>  component/<area>  e2e/  fixtures/  support/
```

**The styling rule (lecturer: "use only style components"):** screens in `app/**` never import `StyleSheet`, `useTheme`, `createThemedStyles` or the raw `View`/`Text`/`Image`/`Pressable`/`ScrollView`/`FlatList`, and never pass `style`, `color`, `backgroundColor` or similar props. They use component variants and tones instead (`<Text variant="title" tone="muted">`). Components style themselves only through `createThemedStyles` and tokens; hex and `rgba(` literals are banned outside `src/theme`. ESLint enforces all of this as **errors** (`.eslintrc.js`), and `npm run lint` is clean.

**Other rules:** everything typed (no `any`, no `!`, no `as` casts except `as const`); no API calls in components (Supabase only in `src/services`); every string through `t()` in both languages; every component has a story and every pure util a unit test; web-only APIs only in `*.web.ts(x)` files with a native counterpart.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Architecture decisions

| Decision                                                  | Why                                                                                             | Consequence                                                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Supabase as backend                                       | Chosen by the course: Postgres + RLS + Auth + Storage + Realtime + Functions in one EU service  | Business and safety rules live in RLS, triggers and RPCs (and are tested by the SQL smoke test) |
| A free AI provider behind a frozen Edge Function          | The keys stay server-side, Cloudflare's free tier keeps no data; the app adapts to the contract | ~12 s latency, so identification runs in the background and every failure falls back to manual  |
| AI plate boxes are suggestions, confirmation is explicit  | The model's boxes are imprecise; a plate must never upload readable                             | At most 3 taps for a confident answer instead of zero, but no auto-confirm                      |
| Owner pings only for verified owners, as snapshots        | Closes the v1 "claim any plate" stalking hole                                                   | New cars wait for verification; owners never read spot rows                                     |
| Progression derived on the device                         | Offline, private, deterministic and honest after a delete                                       | No progression tables; pure TypeScript with unit tests                                          |
| City from a bundled gazetteer                             | Auto-fill without a geocoding sub-processor or a GPS trail                                      | 210 places in BE/NL and nearby; anything else is picked by hand                                 |
| LIVERY: tokens + themed components, lint-enforced         | The lecturer's styling rule, and one consistent motorsport look                                 | Screens are pure composition; new looks become component variants                               |
| Data-driven, variable-size album pages                    | Collections and new models need only seed rows                                                  | Pages range from 10 to 29 slots on a 2-column grid                                              |
| Static web export + generated service worker and CSP      | The lecturer's PWA approach; every build gets its own cache and exact script hashes             | Postbuild must run after every export (`npm run build:web` does it)                             |
| TanStack Query for server state, Zustand for client state | Course ch. 6.7; caching, retries and offline persistence come for free                          | Screens never keep fetched data in `useState`                                                   |
| No CI pipeline                                            | Course: a pre-commit hook and npm scripts are enough for a one-person project                   | Tests run locally before every commit                                                           |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

| Date     | Milestone                             | Result                                                                                  |
| -------- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| 07.10.26 | Idea + pitch by email                 | ✅ Approved; feedback: hide plates, owner portal                                        |
| 10.11.26 | **Assignment 1 – PWA**                | ✅ Redline 2.0: Co-Driver, plate gate, album with collections, reveal, Pit Wall, Garage |
| 17.11.26 | Developing with AI (guest lecture)    | Security review + extra tests with AI                                                   |
| 01.12.26 | User testing (3–5 spotters + 1 owner) | The [test plan](#test-plan) with real users, feedback list                              |
| 15.12.26 | Native Android build with EAS         | Native plate redaction (Skia), native AI image, push notifications                      |
| 31.12.26 | **Assignment 2 – final native app**   | Signed Android APK + release notes                                                      |

**Next (P1), in this order:** Web Push for owners, automated owner verification (`verify-owner`), "Download my data" (the `export_my_data` RPC exists), an offline outbox, onboarding and sharing a sticker as an image (both routes are placeholders today).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Release notes

**2.0.0 – 10 Nov 2026 (PWA, Season 1)**

- **Co-Driver:** AI auto-fill of car, generation, years, paint, body style, sticker match and plate suggestions, in the background, through a free provider with zero data retention. Confidence tiers, candidates, a manual path for every failure, an off switch with zero calls.
- **Auto-fill without tracking:** the EXIF date, and the city from EXIF GPS or the coarse position, resolved on the phone; coordinates never leave it.
- **Plate gate:** dashed suggestions, move/resize/add/remove, a WYSIWYG preview and explicit confirmation; exact block pixelation.
- **Album:** 118 models (70 new, including the Ferrari 308 GTSi), 9 swipeable pages, 8 themed collections with SET COMPLETE, die-cut foil stickers, silhouettes, a tacho cover and a Wildcards page.
- **Reveal and Pit Wall:** the sticker reveal with XP, shift lights and level-ups; levels, weekly streaks, weekly challenges and 15 dash plaques, all derived on the device.
- **Garage:** verified-only, privacy-safe sightings with realtime toasts, paging, read state, visibility and pause.
- **Trust Center and `/privacy`:** switches, a "What Redline stores" ledger and a full privacy policy in English and Dutch.
- **LIVERY design system:** new tokens, fonts, primitives and brand; screens with zero styling (lint error); a new app icon and splash.
- **PWA hardening:** a per-build service worker, an update toast, offline photos, offline sessions, CSP and security headers, a live smoke test.
- **Database v2:** private plate matches, rate limits, the demo-account guard, verification RPCs, collections.

**1.0.0 – 10 Nov 2026 (PWA)**

- Sticker book with 48 cars in 8 categories, on-device plate blurring, owner portal with live pings, installable PWA, English and Dutch, light and dark mode, delete spots or the account.

## Contact

Jasper Degreef – [@ShadowFlashy](https://github.com/ShadowFlashy) – project: [github.com/ShadowFlashy/mobile-application](https://github.com/ShadowFlashy/mobile-application)

**Acknowledgments:** the UCLL Mobile Applications course and boilerplate, the [Best-README-Template](https://github.com/othneildrew/Best-README-Template), [Ionicons](https://ionic.io/ionicons), [Barlow](https://github.com/jpt/barlow) by Jeremy Tribby, and [Supabase](https://supabase.com/docs).

<p align="right">(<a href="#readme-top">back to top</a>)</p>
