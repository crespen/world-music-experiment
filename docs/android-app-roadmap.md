# Earth to Ear — Android App & Mobile Platform Roadmap

**Exploratory platform plan · November 11, 2026**  
**Decision status:** Assessment only; no Android app built, Google Play account created, mobile app published or new permissions granted. Do not market a Play Store app before it exists.

## Product principle

**Keep one authoritative listening platform**, not a forked app and website. The shared Earth to Ear catalog, public listening journeys, private invited-contributor journal and founder curation are already served from a mobile-responsive website at https://earthtoear.com (GitHub Pages + Supabase). An Android app is attractive because it can make thoughtful listening a repeat destination, but distribution is less important than a good *returning listener experience*.

The music is typically played at **third-party original sources** (YouTube, Folkways, Library of Congress etc.). Neither PWA nor native packaging grants rights to stream, cache, reproduce, download or play that copyrighted audio inside our own app. Do not market offline listening or a unified built-in music player that does not exist.

## Technical baseline audit (November 11)

- The website has responsive layouts and a central public music catalog via Supabase.
- Contributor accounts and private reflections use Supabase authentication and an invitation-only model.
- No web app manifest at `/manifest.webmanifest` or `/manifest.json` is present in the root repository.
- No root `/sw.js` or `/service-worker.js` is present.
- The public site pages do not yet link to a manifest; there is no deliberate install-as-app onboarding.
- Existing approved brand graphics can inform app icons; **dedicated 192×192 and 512×512 raster icons** and a safe maskable icon remain to be made and verified against approved visual identity.
- Public page deep links and external source links exist, but Android installed-context navigation, contributor authentication return paths, and back-to-listening behavior need device tests.
- No current Android application package or Play Console submission has been verified.

## Path choices

| Path | Experience | Publishing | Cost / engineering tradeoff | Fit |
| --- | --- | --- | --- | --- |
| **A · Installable PWA** | Home-screen icon, standalone app-like window, existing web content and updates, potential offline *shell* | Through browser, no Play listing required | Lowest development overhead; one codebase | **First step** |
| **B · PWA packaged as Trusted Web Activity (TWA)** | Android package launching verified owned website fullscreen | Google Play, after account and policy review | More build/release/QA work; website remains primary; requires Digital Asset Links | **Second step**, if mobile experience proves engaging |
| **C · Native Android app (e.g., Kotlin/Compose)** | Deeper platform integrations, native controls, advanced audio handling if properly licensed | Google Play | Distinct codebase, ongoing native maintenance; permissions/audio rights do not disappear | Only with an evidenced native-only need |

**Recommended route: A, then optionally B.** Avoid full native rewrite merely to obtain an icon or store listing. Android official Trusted Web Activity/Bubblewrap instructions: https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2  
PWA installability requirements and cross-browser caveats: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

## What the first installed experience should do

1. **Open to Earth to Ear, not a developer splash screen**, and offer “Begin Listening,” “Explore Music,” and “Musical Journeys.”
2. **Make the first-visit guide optional**, with Encounter / Connection / Journey as inviting doorways. Do not re-run a pop-up on every launch.
3. **Support thoughtful return visits:** optionally save favorite tracks or a “Listen Later” list. Keep anonymous public listening free of mandatory registration. Specify whether data stays only on the device or syncs to an account before implementation.
4. **Let listeners find their way back from original sources**, which may open in browser or another app. Test source-link handling, back navigation and return to same recording (and fallback when the provider app is not installed).
5. **For registered contributors**, allow secure journal access from an installed icon; test Supabase login, logout, consent, refresh/session recovery and the separate invitation gate.
6. **Show clear status when offline:** if cached, permit navigation of previously visited non-sensitive shell pages; do not pretend unavailable source audio can play. No offline caching of private journals, authentication tokens or personal reflections.
7. **Continue to respect open continents and source-first listening.** Do not duplicate the catalog in a packaged app or require an app release whenever a recording is added.
8. Design responsive accessible tap targets, readable labels, and screen-reader-friendly navigation.

## Implementation gates

### Phase 1 — Mobile experience audit (before app packaging)

- Test on real Android Chrome and Samsung Internet. Evaluate home, Explore, all six continent pages, recording cards, original-source click/return, reading articles, sign-in and private journal on a phone.
- Check touch controls, vertical rhythm, menu persistence, caching, load time and interruption recovery.
- Fix actual pain points first. Don't claim readiness from desktop inspection.

### Phase 2 — PWA install baseline

- Create and validate `manifest.webmanifest` with `id`, `start_url`, `scope`, `name`, `short_name`, `display: standalone`, `theme_color`, `background_color`, properly sized icon entries and accessible shortcuts.
- Derive **approved** app icon art in 192px / 512px PNG and maskable variant. Add manifest link to each relevant public page, journal page and relevant navigation (keeping admin noindex and private).
- Add a **conservative service worker** only where it improves reliability. Network-first for navigations, or no caching at first; *never cache* personalized private journal, Supabase / auth API responses, bearer tokens or third-party audio. Avoid stale catalog/script releases on GitHub Pages.
- Add a human, nonintrusive "Install Earth to Ear" explanation on mobile (or document browser menu steps); don't gate site access.
- Test app installation, launch icon and offline/error state on supported Android browsers. Distinguish WebAPK install from basic home-screen shortcut.
- Do not declare a PWA installable solely because a manifest was committed: verify it on a real device and with browser diagnostics.

### Phase 3 — Real user pilot

- Invite a small, consented test group to install and use the PWA without pretending that it is available in the Play Store.
- Observe where people leave the app to hear a source recording and whether they can return.
- Determine if the installation actually improves repeat listening or journal submissions; don't over-interpret tiny samples.
- Build *Musical Journeys* and saved listening into the web experience first if those are the features that make app installation valuable.

### Phase 4 — Optional Google Play launch as TWA

- Create a Google Play Developer account only when founder approves distribution; Google's published fee is **US$25 one time** (subject to policy updates): https://support.google.com/googleplay/android-developer/answer/6112435
- Use Bubblewrap / Android Browser Helper to package the PWA for Play. Publish `/.well-known/assetlinks.json` with the **real signed-app certificate fingerprint**; do not fabricate one.
- Design proper app icon, screenshots, app listing and functional test paths; meet Play Console declarations and review rules.
- New **personal** developer accounts created after November 13, 2023 currently require **12 continuous opted-in testers for at least 14 days** before applying for production: https://support.google.com/googleplay/android-developer/answer/14151465
- Play Console also requires accurate **Data safety** declarations and a public, accurate privacy policy; an app with account creation must provide a usable account-deletion method. Compare that requirement to the project's current retained journal archive/withdrawal policy **before** submission: https://support.google.com/googleplay/android-developer/answer/10144311
- A Play listing or Android package is not guaranteed to be approved. Google disallows broken, nonfunctional and low-value apps: https://support.google.com/googleplay/android-developer/answer/9898783
- After packaging, test signed build, install, back/forward navigation, source app exit/return, first-visit onboarding and secure journal. One shared website should remain the source of truth.

## Product decisions to test—not yet features promised

- Is a **personal listening shelf** (favorites, continue listening, saved journeys) valuable enough to justify installing the app?
- Should the public site permit optional accounts for a shelf, while retaining the invitation-only **research journal** separately? Do not silently open participation when introducing login.
- Should there be a brief, optional reminder of new journeys? Avoid unsolicited push notifications; secure explicit opt-in if ever implemented.
- Can existing source links return visitors to the exact recording card/journey position after opening another app?
- Is iOS installation a near-term goal too? A well-built PWA can later support iPhone home-screen installation, even though exact features differ.
- What privacy/deletion policy is appropriate for research submissions, consent and participant withdrawal, and how will it satisfy eventual app-store requirements?

## Next recommended platform sprint

**First:** improve the mobile site and optional listening onboarding, then build a **PWA install prototype** under the same domain.  
**Second:** pilot on Android.  
**Third:** decide if Google Play distribution changes discovery and return behavior enough to be worth the release and compliance work.

This stays aligned with the founder's current priority: **build Earth to Ear's platform before committing to social video production or a podcast launch**.
