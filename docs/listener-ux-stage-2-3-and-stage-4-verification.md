# Earth to Ear — Listener UX Release and Stage 4 Verification

**Date:** November 11, 2026
**Status:** Stage 2/3 source changes staged, deployment and live-device validation must be checked separately.

## Product decision: Homepage earns its space

The former Equal Earth map was a passive illustration and occupied a very large area without helping visitors begin listening. It has been removed from the homepage, along with an overlapping four-link pathway strip. The map concept may return only if it provides an actual, accessible exploratory function; a noninteractive image does not justify priority placement.

The homepage now offers:
1. **Surprise Me** — choose a randomly selected active source-linked recording (not autoplay).
2. **Follow a Journey** — open historically contextualized jazz, reggae and Ghanaian highlife arcs.
3. **Explore by Place** — enter searchable Explore, or pick one of six continent collections directly.
4. **Return to listening** — Saved Listening shelf and optional Resume Journey when the local browser remembers a previous position.
5. **Featured editorial music, a brief how-it-works explanation, and a clear invitation-only contributor path** remain distinct from public listening.

Editorial language no longer implies the catalog accepts 30-second paywalled previews as full listening. The homepage's optional 30-second introduction strip is an intentional sample of otherwise independently linked recordings, **not a 30-second restriction on the original source**.

## Stage 2: What was completed

- Focused listening arcs with source links, previous/next stop navigation, explicit *last-opened* position and Resume Journey link.
- Each arc's progress is **navigation state**, not an assertion that the person actually listened to or completed the performance.
- Existing recording detail pages retain correct source links, cultural context, source-credit notices, copyable URLs, return-to-browsing links, and invited-contributor journal links.
- Individual recording pages now offer Save for later and small, context-based additional listening paths. These paths do not claim a verified historical influence.

## Stage 3: What was completed

- No-account Save for later actions across Explore, recording details and regional collections.
- Separate /saved/ listening shelf; remove a recording, reopen source, return to browsing.
- Local browser-only state stores **recording IDs** and **journey stop numbers**; no email, name, sign-in token, reflection, or research record is stored by this feature.
- All six continent links remain usable without the large map; the catalogue remains discoverable through filters and featured selections.
- Existing listener link-reporting controls remain available.

**Deliberately not included:** cross-device synchronization, general-public login, true player-driven listening history, autoplay, recommendation ranking, app installation, or false claims of completion. General listener features remain separate from invitation-only research participation.

## Stage 4: Acceptance gates and severity

### Critical (do not approve a release if failing)
- Public visitors can browse music without signing in; journal and founder data require correct authorization server-side.
- Guest cannot retrieve another contributor's reflection or founder contributor identities.
- Registered contributors can sign in, submit journal reflections, view only appropriate entries, and sign out.
- Founder dashboard and contributor directory show data only to authorized founder accounts.
- Catalog records and journal associations remain intact, including archived recordings with previous entries.
- A deployment failure must not replace a functioning public site or expose internal keys.

### High-priority usability (fix before widespread promotion)
- Phone widths **360 and 390 px**: menu, listening paths, saved shelf, Explore facets, and journey controls are reachable with no horizontal overflow.
- Tablet **768/820 px** and desktop **1024/1440 px**: legible typography, controls not overlapped, and no sticky-header focus obstruction.
- Keyboard-only: skip link; Tab through menu, Save buttons, source links and journey controls; Escape out of menus/first-visit dialog; visible focus always.
- NVDA + Chrome on Windows and TalkBack + Chrome on Android: semantic headings, meaningful button names, landmark navigation, saved state via `aria-pressed`, and clear progress updates.
- Source link tests: a visitor can open a genuine full performance on original provider and return to the exact recording or filtered results; report unexpected paywalls/short previews.
- Catalog API failure simulation: informational pages and navigation remain usable; music panes display retry state.
- Saved Listening: add/remove, refresh, continue on same browser; explain that browser-clearing or switching device loses this state.
- Journey: open stop 3, leave for provider, return, resume at stop 3, clear position; don't claim playback was tracked.
- No broken navigation when there are zero saved items or an empty/offline catalog.

### Performance and discoverability (measure after functional gates pass)
- Run mobile/desktop Lighthouse/PageSpeed checks: aim for **LCP ≤2.5 seconds, INP ≤200 ms, CLS ≤0.1** at the field-data 75th percentile. Do not assert these without measurement.
- Verify no excessive CLS in the hero, fonts, intro media, or featured cards; test reduced-motion preferences and 200% zoom.
- Share one recording and one focused journey using social messaging. Confirm that the title and description are accurate; per-record rich previews remain an open SEO task.
- The static map image was embedded in the original script; removing it reduced the uncompressed main JS source by approximately **65 KB**.

## Direct practical user test (5 listeners; no assumption about their experience)

Ask 2 first-time visitors, 2 returning public listeners, and 1 invited contributor to perform tasks without a tutorial:
1. Find and open an unfamiliar recording in **30 seconds** without needing an account.
2. Find a recording from a named country, open the source, return, and save it.
3. Start a journey, navigate to stop 3, and return to the same stop after visiting the source.
4. Locate Saved Listening and remove an item.
5. For the invited contributor only, write and later find a private journal reflection.

Record task success, failures, confusing labels, and approximate completion times—not personal musical judgments. A single serious privacy or task-completion defect is grounds to fix before broad promotion. Five usability observations reveal problems; they do **not** establish formal accessibility compliance or statistical confidence.

## Validation status for this source release

- Staged JS parsed successfully in V8; browser-local storage contract and homepage/recording markup were exercised with synthetic catalogs.
- Shared shell retains the public five-link top navigation and adds Saved Listening to the footer (not a sixth primary navigation item).
- Source files and HTML wrappers include new asset versions; one coordinated deployment is required.
- **Real-device/browser, network, third-party playback, screen-reader, OAuth/Supabase permissions, and live field performance testing have NOT yet been completed in this check.** Do not mark those as passed on the strength of syntax or deployment alone.
