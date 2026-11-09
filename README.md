<a id="readme-top"></a>

<div align="center">
  <img src="assets/icon.png" alt="Redline logo" width="96" height="96" />

  <h1>Redline</h1>

  <p>
    <strong>Spot it. Collect it. Complete the grid.</strong><br />
    The car-spotting sticker book: photograph the cars you spot, blur their licence plates on your phone and collect them in your own digital sticker book.
  </p>

  <p>
    <a href="https://redline-spotter.vercel.app"><strong>Open the live PWA »</strong></a>
    ·
    <a href="#demo-account">Demo account</a>
    ·
    <a href="#getting-started">Run it locally</a>
  </p>
</div>

> UCLL – Mobile Applications (MBI51j) 2026-2027 · Assignment 1: **PWA** · Jasper Degreef

## Demo account

The app has a login. Use this account to try everything (it already exists in the hosted database):

|          |                                                                      |
| -------- | -------------------------------------------------------------------- |
| Live app | **[redline-spotter.vercel.app](https://redline-spotter.vercel.app)** |
| Email    | `demo@redline.test`                                                  |
| Password | `Redline!Demo26`                                                     |

**Try the owner portal with one account:** open _Owners_, register a car (e.g. plate `DEMO-123`), then go to _Spot_, add any photo and type `DEMO-123` in the optional plate field. The owner portal immediately receives a ping (live, via Supabase Realtime) and the plate itself is never stored.

**Install it as an app (Android):** open the link in Chrome → menu ⋮ → _Install app_ / _Add to Home screen_.

<details>
  <summary>Table of contents</summary>
  <ol>
    <li><a href="#about-the-project">About the project</a>
      <ul>
        <li><a href="#problem-statement">Problem statement</a></li>
        <li><a href="#target-audience">Target audience</a></li>
        <li><a href="#the-solution">The solution</a></li>
        <li><a href="#competitors">Competitors</a></li>
        <li><a href="#built-with">Built with</a></li>
      </ul>
    </li>
    <li><a href="#features-and-roadmap">Features and roadmap</a></li>
    <li><a href="#getting-started">Getting started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#building-and-deploying">Building and deploying</a></li>
    <li><a href="#privacy-and-security">Privacy and security</a></li>
    <li><a href="#project-structure-and-conventions">Project structure and conventions</a></li>
    <li><a href="#architecture-decisions">Architecture decisions</a></li>
    <li><a href="#release-notes">Release notes</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About the project

### Problem statement

Car spotters photograph special cars they see on the street: supercars, classics, JDM legends. After a few months their spots are buried between thousands of other pictures in their camera roll. They no longer know which models they have already seen, when or where, and there is no motivating overview of what is still missing. When they share a spot (Instagram, WhatsApp groups), the licence plate of a stranger's car is usually fully readable. A plate is personal data under the GDPR and it can expose where the owner lives or parks. On the other side, many owners of special cars actually enjoy seeing their car being spotted, but they never find out.

**In one sentence:** _Redline helps car spotters to collect and keep track of every car they spot, without losing them in their camera roll and without exposing other people's licence plates._

### Target audience

**Primary users: car spotters.** Mostly 14–30 years old, digitally skilled and mobile-first. They spot on the go: on a sidewalk, at a car meet or in a car park, often with one hand free and a weak 4G connection. They are motivated by collecting and completing (think football-sticker albums and Pokédex-style games).

- _Persona – Lars (17, Antwerp):_ takes the tram to car meets every weekend and has 2,000 car photos in his gallery. He wants to see at a glance which supercars he still has not spotted.
- _Persona – Amira (24, Leuven):_ spots classics on her way to work. She posts on Instagram, but she does not like that strangers' plates are visible in her photos.

**Secondary users: owners of special cars.**

- _Persona – Marc (52, Hasselt):_ owns a red Ferrari 296 GTB with a vanity plate. He loves knowing when and where his car was spotted and he is proud to show his plate.

**Stakeholders who never open the app:** the owners of spotted cars and passers-by in the photos. Their privacy is the core of the design: plates are blurred on the device, and a plate is only shown when its owner opts in. Other stakeholders are the lecturer (assignment), and Supabase and Vercel as sub-processors (see [Privacy and security](#privacy-and-security)).

**Why a mobile app and not a website?** Spotting happens on the street: you need the **camera** right away and the phone is always at hand. **Notifications** ping owners when their car is spotted, and the collection should stay viewable **offline**. As a PWA it is installable on the home screen today; the native Android app (assignment 2) adds native camera handling and push notifications.

**What Redline does not solve:** it is not a marketplace, it does not value cars, and it does not identify a car model automatically (yet). It is also not a public social network: spots are private to the spotter (and to the registered owner of the car).

### The solution

A digital **sticker book** with 48 collectible car models in 8 categories (icons, sports cars, supercars, hypercars, classics, JDM, muscle cars, electric). Every model has a rarity, from common to legendary. Spotting a car fills its sticker with your own photo.

**Core scenario:** Lars sees a Porsche 911 GT3 in Leuven. He opens Redline (installed on his home screen) → _Spot_ → _Take a photo_. He drags a box over the licence plate and taps _Blur and continue_: the plate is pixelated on his phone before anything is uploaded. He searches "911", picks the sticker and adds "Leuven". _Save_: the sticker is collected 🎉 and his progress goes to 13/48.

**The lecturer's suggestions are built in:**

- _"Make sure the license plates are not visible"_ → plates are blurred on the device before upload (and the EXIF location data is removed). The app cannot continue until every plate is hidden or the spotter confirms that no plate is visible.
- _"Some vanity plates might just be wanted to be shown"_ → an owner can opt in to show their (vanity) plate. Spots of their car then show the plate as a Belgian-style plate badge, with consent.
- _"A portal for special car owners that gets pinged every time their car is spotted"_ → the **owner portal**: owners register their car. When a spotter (optionally) types the plate, the database matches it against the registrations and the owner gets a live ping. Plates are stored as a keyed hash (HMAC-SHA256 with a server-side secret). A typed plate that matches nobody is thrown away and never stored.

### Competitors

Checked on the App Store / Google Play and on the web (November 2026):

| Competitor                                                                                     | What it does                                 | Strong                         | Falls short for our target group                                             | Rating                                           |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| [Car Spotting App](https://appgoblin.info/apps/app.car.spotting) (Applax)                      | Supercar spots on a world map, community     | Big community, map of spots    | Supercars only, social feed instead of a personal collection, plates visible | 4.7 ★ Google Play (80K+ installs, per AppGoblin) |
| [CarSpotter – Collect Cars](https://apps.apple.com/us/app/-/id6742125087)                      | Virtual garage of spotted cars               | Collection idea                | No privacy features, no owner involvement                                    | 4.5 ★ (1,000+ installs, per AppBrain)            |
| [Spottr](https://sites.google.com/view/spottr/home)                                            | Photo → AI car recognition → personal garage | Automatic recognition, sharing | Recognition-first, not a completion goal; plates untouched                   | New, few reviews                                 |
| [CarCollector: Spotting Game](https://mwm.ai/apps/carcollector-spotting-game/6773265156)       | Spotting game with map and achievements      | Gamification                   | The exact spot location is stored and shown (privacy risk for owners)        | New, few reviews                                 |
| [Car Spotting by MotorTrend](https://apps.apple.com/us/app/id1447901560)                       | AR game that recognises cars with the camera | Fun AR                         | A game, not a collection of your own real spots                              | —                                                |
| AI identifiers (e.g. [Car Identifier: AI Scanner](https://apps.apple.com/us/app/id6746683498)) | Photo → make, model, year                    | Fast identification            | No collection, mostly paywalled                                              | —                                                |
| Autogespot / Instagram / WhatsApp groups                                                       | Share spots publicly                         | Large audiences                | Public by default, readable plates, no overview of what you collected        | —                                                |
| Camera roll + spreadsheet                                                                      | DIY tracking                                 | Free, flexible                 | Manual, no motivation, photos get lost                                       | —                                                |

**Differentiation:** Redline is the only one that combines a _completable sticker book_ with **privacy by design** (on-device plate blurring, hashed plates, no exact locations) and an **opt-in owner portal** that pings owners when their car is spotted.

### Built with

- [Expo SDK 52](https://expo.dev) + [Expo Router 4](https://docs.expo.dev/router/introduction/), React Native 0.76 + react-native-web, TypeScript (strict). This is the course boilerplate.
- [Supabase](https://supabase.com) (EU, Frankfurt): Postgres with row level security, Auth, Storage (private bucket) and Realtime.
- [TanStack Query](https://tanstack.com/query) (server state, persisted for offline use) and [Zustand](https://zustand.docs.pmnd.rs) (session and UI state).
- [i18next](https://www.i18next.com) + react-i18next + expo-localization (English and Dutch).
- [Cypress](https://www.cypress.io) (unit, component and end-to-end tests), [Storybook](https://storybook.js.org) (component library).
- [Vercel](https://vercel.com) (hosting of the PWA).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features and roadmap

### Features as user stories (MoSCoW)

|                     | User story                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Must**            | As a spotter I want to **register and log in** so that my collection is mine and synced.                  |
| **Must**            | As a spotter I want to **photograph a car or pick a photo** so that I can add a spot.                     |
| **Must**            | As a spotter I want the **licence plate blurred before upload** so that I respect other people's privacy. |
| **Must**            | As a spotter I want to **link a spot to a sticker** so that I see my **progress in the sticker book**.    |
| **Must**            | As a spotter I want to **open and delete my spots** so that I stay in control of my data.                 |
| **Must**            | As an owner I want to **register my car** and **get a ping when it is spotted**.                          |
| **Must**            | As a user I want to **install the app on my home screen** and still **see my sticker book offline**.      |
| **Should**          | As an owner I want to **show my vanity plate** on spots of my car (opt-in).                               |
| **Should**          | As a user I want the app in **English or Dutch**, in **light or dark mode**.                              |
| **Should**          | As a user I want to **delete my account and all my data** (GDPR).                                         |
| **Should**          | As a spotter I want to **save cars that are not in the sticker book** as "other finds".                   |
| **Could**           | Automatic plate detection and car model recognition on the device.                                        |
| **Could**           | Badges, streaks and a monthly "car of the month" challenge.                                               |
| **Could**           | Share a sticker as an image (plates stay blurred).                                                        |
| **Won't (for now)** | A public feed, a map of exact spot locations (privacy), a marketplace.                                    |

Every _Must_ is in this PWA version. Easily forgotten parts are included too: an empty state for new users, loading skeletons, error messages, an offline banner, and a way to delete data.

### Roadmap

| Date     | Milestone                                       | Result                                                                                     |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 07.10.26 | Idea + pitch by email                           | ✅ Approved, feedback: hide plates, owner portal                                           |
| 10.11.26 | **Assignment 1 – PWA**                          | ✅ This version: all Musts, hosted on Vercel + Supabase                                    |
| 17.11.26 | Developing with AI (guest lecture)              | Security review + extra tests with AI                                                      |
| 01.12.26 | User testing (cohort of 3–5 spotters + 1 owner) | Validation criteria run (see [Test plan](#test-plan)), feedback list                       |
| 08.12.26 | Apply user feedback (Hemisfeer)                 | UX fixes, Shoulds polished                                                                 |
| 15.12.26 | Native Android build with EAS                   | Development build on a real phone, native plate blurring (Skia), push notifications (Expo) |
| 31.12.26 | **Assignment 2 – final native app**             | Signed Android APK (EAS preview build) + release notes                                     |
| 09.01.27 | Pitch + demo video                              |                                                                                            |
| 01.2027  | Exam                                            | Every Must works on a real device                                                          |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting started

### Prerequisites

- **Node.js 22 LTS or newer** (required by supabase-js) and npm 10.
- For your own backend: a free **Supabase** account. Using the existing demo backend only needs the two public values in `.env`.
- Optional: **Android Studio** (emulator) or an Android phone with a development build (see [Building and deploying](#building-and-deploying)). No Mac is needed: the target platform is Android plus the PWA.

### Installation

```bash
git clone https://github.com/ShadowFlashy/mobile-application.git
cd mobile-application
npm ci
cp .env.example .env   # then fill in the two values
```

`.env` (never committed) needs:

| Variable                        | Where to find it                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Supabase dashboard → _Project Settings_ → _API Keys_ (project URL)                                                                          |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Same page → _Publishable key_ (`sb_publishable_…`). It is public by design: row level security protects the data. Never use the secret key. |

### Database (only for your own Supabase project)

Run [`supabase/migrations/20261109120000_init_redline.sql`](supabase/migrations/20261109120000_init_redline.sql) and then [`supabase/seed.sql`](supabase/seed.sql) in the Supabase SQL editor, or use `supabase db push`. Create the project in an **EU region** (GDPR).

### Run

```bash
npm run web       # in the browser (http://localhost:8081)
npm start         # Expo dev server for the Android development build (Expo Go only runs the newest SDK)
npm run tunnel    # on eduroam (campus Wi-Fi blocks the local connection)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

| Tab          | What you can do                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stickers** | Your sticker book: progress, filter per category, collected stickers show your own photo. Pull down to refresh. Tap a sticker for its details and your spots of it. "Other finds" lists cars that are not in the book. |
| **Spot**     | Three steps: _photo_ (camera or gallery) → _hide plates_ (drag a box over each plate, or confirm none is visible) → _details_ (pick the sticker or type brand/model, optional city, notes and plate).                  |
| **Owners**   | Register your car, show or hide your vanity plate, and read your pings ("your car was spotted in …"). The tab shows a badge with the number of new pings.                                                              |
| **Profile**  | Your stats, language (English/Nederlands), privacy information, log out, delete account.                                                                                                                               |

Light and dark mode follow the phone's setting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Testing

Everything uses **Cypress**, the course's test framework:

| Command                              | What it runs                                                                                                                                                                                                                                                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`                  | Unit tests of the business logic (`cypress/unit`: plate normalisation, sticker book maths, plate-blur geometry, validation, date formatting, translation completeness) and component tests (`cypress/component`).                                                                                              |
| `npm run test:e2e`                   | End-to-end tests (`cypress/e2e`) against the **production build**, served with `npx expo serve`. Supabase is intercepted with fixture data, so no account or network is needed. Smoke test per tab, login/register, the full spot flow (blurring, saving, sticker collected), owner portal and offline banner. |
| `npm test`                           | Both, including the web build.                                                                                                                                                                                                                                                                                 |
| `npm run typecheck` / `npm run lint` | TypeScript (strict) and ESLint (Expo config + course rules).                                                                                                                                                                                                                                                   |

A **pre-commit hook** (Husky + lint-staged) runs ESLint, Prettier, a secret scan, the type check and the unit tests before every commit.

### Test plan

Validation criteria per feature (course ch. 12). They are used for the manual test on a real Android phone and in the user tests:

| #   | Feature            | Steps → expected result                                                                   | Automated                |
| --- | ------------------ | ----------------------------------------------------------------------------------------- | ------------------------ |
| 1   | Login              | Wrong password → clear error, no crash. Demo account → sticker book with the name.        | `login.cy.ts`            |
| 2   | Register           | Empty form → error under every field. Valid → "check your inbox".                         | `login.cy.ts`            |
| 3   | Sticker book       | 48 stickers, progress `x / 48`, category chips filter, a locked sticker opens its detail. | `tabs.cy.ts`             |
| 4   | Spot: privacy gate | Without a box or the "no plate" checkbox, _Blur and continue_ stays disabled.             | `spot-flow.cy.ts`        |
| 5   | Spot: save         | Drag box → blurred preview → pick sticker → save → detail page, sticker collected.        | `spot-flow.cy.ts`        |
| 6   | Owner portal       | Register car → card shows a masked plate. Spot with that plate → ping + badge.            | `owners.cy.ts` + manual  |
| 7   | Offline            | Flight mode → banner "You are offline", the sticker book stays visible.                   | `offline.cy.ts` + manual |
| 8   | Install            | Chrome on Android → _Install app_ → opens full-screen from the home-screen icon.          | manual                   |
| 9   | Accessibility      | TalkBack reads every button and image; text at 200 % still fits; dark mode readable.      | manual                   |
| 10  | Delete data        | Delete a spot (confirmation) → sticker locks again. Delete account → back to login.       | manual                   |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Building and deploying

**PWA (assignment 1)**

```bash
npm run build:web    # npx expo export -p web → static site in dist/
npm run serve:web    # test the production build locally (http://localhost:8081)
npm run deploy:web   # build + deploy dist/ to Vercel (needs `npx vercel login` once)
```

The web build is a static export (one HTML file per route). It is an installable PWA through:

- [`public/manifest.json`](public/manifest.json): name, icons (normal and maskable), theme colour, standalone display.
- [`public/sw.js`](public/sw.js): a hand-written service worker that caches the app shell (offline start) and the hashed bundles, and never caches personal API data.
- [`app/_layout.web.tsx`](app/_layout.web.tsx): manifest link, theme colour, Apple meta tags and the service-worker registration (web-only layout).
- [`public/vercel.json`](public/vercel.json): clean URLs, rewrites for `/details/:id` and `/sticker/:id`, cache and security headers.

**Android (assignment 2, prepared)**

```bash
npm install -g eas-cli && eas login
# add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to the EAS "preview" environment
# (expo.dev → project → Environment variables, or the `eas env` commands)
npm run build:android:preview   # signed APK for internal distribution (EAS-managed keystore)
```

Versions follow semantic versioning (`app.json` → `version`); EAS increments the Android `versionCode` remotely.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Privacy and security

Redline processes data of people who never use the app (the owners of spotted cars), so the design starts from the GDPR (course ch. 18 and 23):

- **Plates never leave the phone readable.** The spotter marks every plate. The app pixelates those areas with a canvas on the device and re-encodes the photo, which also strips EXIF (GPS) metadata. Only then is the photo uploaded.
- **Typed plates are not stored.** The optional plate field is sent once over HTTPS. A database trigger compares its keyed hash (HMAC-SHA256 with a secret that only the database knows) with the owner registrations and then clears the value before the row is written.
- **Owners opt in.** A plate is only shown when its owner turns on "show my vanity plate"; they can turn it off at any time.
- **No exact locations.** Only a free-text place ("Leuven") is stored, never GPS coordinates.
- **Private by default.** Row level security on every table and on the storage bucket: users only read their own spots, and an owner only sees spots of their own registered car. Photos are served through short-lived signed URLs.
- **Your data, your choice.** Delete a spot (photo included) at any time, or delete the account with all data (_Profile → Delete my account_).
- **No tracking.** No analytics, ads or third-party trackers. NetInfo's background connectivity check (a Google URL) is disabled.
- **Secrets.** No keys in the code: `.env` (gitignored) + `EXPO_PUBLIC_*` variables. The publishable key is public by design. The secret key is never used in the app. A pre-commit hook blocks commits that contain key-like strings or `.env` files.
- **Tokens.** The Supabase session is persisted in the Android Keystore (expo-secure-store, chunked) in the native app. In the PWA, browsers have no keychain, so it is persisted in the HTTPS-only, origin-scoped storage through AsyncStorage.

**Data map**

| Data                                                                     | Why                      | Kept                                 | Shared with                           |
| ------------------------------------------------------------------------ | ------------------------ | ------------------------------------ | ------------------------------------- |
| Email, username                                                          | Account and login        | Until the account is deleted         | Supabase (EU)                         |
| Spot photos (plates blurred, no EXIF)                                    | The sticker book         | Until the spot or account is deleted | Supabase Storage (EU, private bucket) |
| Car make/model, place, notes, date                                       | The sticker book         | Until the spot or account is deleted | Supabase (EU)                         |
| Owner plate (keyed hash + last 2 characters; full text only with opt-in) | Matching spots to owners | Until the car or account is deleted  | Supabase (EU)                         |
| Pings                                                                    | Notify owners            | Until the car or account is deleted  | Supabase (EU)                         |

**Sub-processors:** Supabase (database, auth, storage – region eu-central-1 Frankfurt) and Vercel (static hosting of the PWA, no personal data).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project structure and conventions

The folder structure of the course boilerplate is kept. The added folders follow the lecturer's own reference branches (`src/lib`, `src/theme`) and the course text (`src/hooks`, `src/i18n`).

```
app/                      Expo Router screens (file-based navigation)
  _layout.tsx             Root: providers only        _layout.web.tsx  PWA head tags + service worker
  login.tsx register.tsx  Auth screens (shown when signed out)
  (app)/_layout.tsx       Auth guard + native stack   (app)/(tabs)/  Stickers · Spot · Owners · Profile
  (app)/details/[id].tsx  Spot detail                 (app)/sticker/[id].tsx  Sticker detail
src/
  components/primitives/  Base components of the boilerplate (themed) + stories
  components/             App components built from the primitives + stories
  hooks/                  Business logic and data hooks (TanStack Query)
  services/               All communication with the outside world (Supabase, camera, storage)
  lib/                    Supabase client, query client, session storage adapters
  state/                  Zustand stores (session, toasts)
  theme/                  Colours (light/dark), spacing, typography, useTheme
  i18n/                   i18next setup + locales/en.json, nl.json
  types/                  Domain types + typed Supabase schema
  utils/                  Pure helpers (validation, plates, maths, image redaction)
  constants/              Routes, query keys, category icons
supabase/                 Database migration (schema, RLS, triggers) + seed
public/                   PWA manifest, service worker, icons, Vercel config
cypress/                  unit/, component/, e2e/ tests, fixtures and support
```

**Rules (from the course guidelines – please follow them in every change):**

- UI is built from the base components in `src/components/primitives`; new UI is a new component made of those, documented with a Storybook story.
- Everything is typed: no `any`, no `!`, no `as` casts (only `as const`), no `null` in our own types. ESLint enforces this.
- No API calls in components: Supabase is only used in `src/services`; screens use hooks.
- No hardcoded colours (use `useTheme` / `createThemedStyles`) and no hardcoded texts (use `t('namespace.key')`; English is complete, Dutch must have the same keys – a unit test checks this).
- No browser-only APIs (`alert`, `localStorage`, `window.location`) outside `*.web.tsx` files.
- Naming: components `PascalCase.tsx` (one component per file), hooks `useSomething.ts`, services `camelCaseService.ts`, types `PascalCase`.
- Workflow: one feature per branch, a pull request with the test plan rows it affects, and the pre-commit hook must pass. Commit messages are short and in the imperative mood.

## Architecture decisions

| Decision                                                  | Why                                                                                                      | Consequence                                                                                                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Supabase as backend                                       | Chosen by the course; Postgres + RLS + Auth + Storage + Realtime in one EU-hosted service                | Business rules live in RLS policies and triggers ([migration](supabase/migrations/20261109120000_init_redline.sql)) |
| TanStack Query for server state, Zustand for client state | Course ch. 6.7: separate server and client state; caching, retries and offline persistence come for free | Screens never hold fetched data in `useState`                                                                       |
| Static web export + hand-written service worker           | The lecturer's PWA approach (`feature/part-4-pwa` branch); no extra build tooling                        | Bump `CACHE_VERSION` in `sw.js` when the caching strategy changes                                                   |
| Plate redaction on the device (canvas)                    | Privacy by design: readable plates never reach the server                                                | The native app needs its own implementation (Skia), planned for assignment 2                                        |
| Keyed plate hashes + trigger-side matching                | Owners can be pinged without storing anyone's plate                                                      | A typed plate that matches nobody is discarded                                                                      |
| i18n from the first screen                                | Course ch. 20                                                                                            | Every text change touches `en.json` and `nl.json`                                                                   |
| No CI pipeline                                            | Course ch. 11: a pre-commit hook and npm scripts are enough for a one-person course project              | Tests run locally before every commit                                                                               |

## Release notes

**1.0.0 – 10 Nov 2026 (PWA)**

- Sticker book with 48 cars in 8 categories, progress and filters.
- Spot a car: camera or gallery, on-device plate blurring, sticker picker.
- Owner portal: register your car, live pings, optional vanity plate.
- Installable PWA with offline sticker book; English and Dutch; light and dark mode.
- Delete spots or your whole account.

## Contact

Jasper Degreef – [@ShadowFlashy](https://github.com/ShadowFlashy) – project: [github.com/ShadowFlashy/mobile-application](https://github.com/ShadowFlashy/mobile-application)

**Acknowledgments:** the UCLL Mobile Applications course and boilerplate, the [Best-README-Template](https://github.com/othneildrew/Best-README-Template), [Ionicons](https://ionic.io/ionicons) and [Supabase](https://supabase.com/docs).

<p align="right">(<a href="#readme-top">back to top</a>)</p>
