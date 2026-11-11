# Earth to Ear — Stage 2: Listener-First Explore and Source Continuity

**Implementation date:** November 11, 2026  
**Status:** Changes committed to `main`. Code-level smoke tests passed. **Live-domain, mobile-device, assistive-technology, and actual third-party source tests are not independently verified.**

## Listener problem

The previous Explore page displayed every matching recording in large, visually similar three-column cards. With approximately 70 recordings, long scrolling obscured the collection's diversity and made it laborious to compare music across places.

## What changed

### 1. Explore: from catalog wall to navigable listening library

- **Place-first filtering:** persistent continent selector with live counts; selection updates results in place. On narrow screens, the continent control becomes a horizontal scrollable chooser.
- **Faceted discovery:** text search against public title, artist, tradition, region, country, continent, recording ID and description. Period/approach and country selectors use actual catalog metadata, rather than invented genre labels.
- **Compact editorial results:** small, metadata-rich rows with continent-specific visual accents replace the repeated full-bleed cover cards. Results include performer, tradition, period and a short contextual description.
- **Bounded browsing:** **nine recordings per page**, with Previous/Next controls, count, current range, and page indicator.
- **Mixed discovery:** the cross-continent default view interleaves available continents rather than placing an entire region's recordings in one uninterrupted block.
- **Three starting points:** recordings from up to three distinct continents provide an optional editorial entry above the filters; there is no ranked "best" list.
- **Persistent URLs:** text, continent, country, period and page are encoded in `/explore/?q=...&continent=...&country=...&period=...&page=...`. Reloading or returning to that URL restores the browse view.
- **Existing deep links:** `/explore/?recording=ID` still locates that recording; links from How to Listen, the homepage and musical journeys remain usable.
- **Outage behavior:** an unavailable catalog produces a retry panel rather than an empty collection.

### 2. A destination for each recording

Reusable `/recording/?id=RECORDING_ID` detail view shows existing catalog title, artist, country, tradition, period, description, source-credit information when provided, and link to the original audio/video provider.

The source opens in a new browser tab. Earth to Ear remains open and the listener can return to the prior filtered results by using a sanitized return path carried in the detail link. Invite-only contributors can reach the existing journal for that recording. A Copy recording link control shares the recording's canonical navigational identity, not the private journal.

The existing continent collection cards remain intact; their titles now link to the detail view.

**Privacy and music rights:** No source audio is hosted, copied, or downloaded. No participant permissions, Supabase schema, role checks, private responses or invitation controls were changed.

### 3. Focused, individually shareable musical journeys

The original three historical listening arcs and 18 source-linked stops remain unchanged. The existing `/journeys/` shows all three arcs. Focused listening URLs show only the chosen arc while preserving its artist blurbs, linked source recordings, and historical notes:

- `/journeys/?arc=jazz-voice`
- `/journeys/?arc=reggae`
- `/journeys/?arc=ghana-highlife`

Each arc provides an Open/View All control and a Copy journey link control. Existing old-style `#jazz-voice`, `#reggae` and `#ghana-highlife` anchors remain valid.

## Files changed

- `assets/site.js`: Explore UI, facets, paging, recording details, source/return flow and regional title links
- `assets/explore-stage2.css` **new**: editorial Explore and recording-detail styling
- `assets/site.css`: consistent clickable titles on regional catalog cards
- `explore/index.html`: Stage 2 style and script assets
- `recording/index.html` **new**: reusable recording detail entry
- `assets/site-shell.js`: active Explore navigation on the recording route
- `assets/journeys-stage2.js` **new**: focus/share logic for the existing historical arcs
- `journeys/index.html`: focused journey controls and styling
- Dynamic public HTML wrappers: versioned scripts/styles to avoid old cached assets

## Deterministic smoke tests

- Combined `assets/site.js` and journey JavaScript parsed in V8.
- Synthetic 70-record test across six continents produced **9** first-page results and **8** pages.
- Next-button paging moved to Page 2 of 8 and updated the URL.
- All six continent selectors appeared, with recording details linked correctly.
- Recording detail contained the correct external source, a return link carrying filters, and an existing journal destination.
- All 16 HTML entry points checked for appropriate shared shell, Stage 2 dynamic scripts, and Stage 2 CSS where needed.
- No source audio was embedded or copied.

## Deliberately deferred / unverified

1. **Real-device QA:** Desktop/mobile visual design, cross-browser behaviors, accessibility screen-reader walkthrough, 200% zoom, keyboard ergonomics and Core Web Vitals need actual browser testing.
2. **Real source checking:** A valid link in the database does not prove the third-party audio still plays or permits streaming in every location.
3. **Share preview/SEO:** Recording URLs are individually navigable but use a client-rendered reusable route. They are currently marked `noindex,follow` until per-record static metadata / preview generation can be done properly; social previews may display generic page text. Focused journeys likewise share one static HTML shell.
4. **Persistence across devices:** Saved Listening/bookmarks, authenticated resume and personalized activity history have not been introduced. The same-tab return URL and the user's browser history are the present continuity features.
5. **No changes to the founder-only curation dashboard** or participant data.

## Live QA checklist

1. Open `/explore/` in a fresh or incognito tab. Check that the first page has at most nine result rows and the three first-stop highlights represent different continents.
2. Choose a continent, narrow by country and period, search for a known performer. Confirm the count, results and URL change appropriately; reload and confirm filters are restored.
3. Use Next/Previous, then open a recording. Listen at its original source in a second tab; return to Earth to Ear and choose Back to browsing. Confirm the same filtered page is restored.
4. Visit `/explore/?recording=AFR-0037` and verify it locates the recording rather than returning an unfiltered wall.
5. Check each focused journey, source links, artist context, navigation between journeys, and copy-link behavior.
6. Repeat on a phone or tablet, including keyboard focus/assistive technology. Ensure no horizontal overflow or inaccessible controls.
7. Verify the signed-in journal and founder dashboard still work for their authorized roles and expose no private data to public visitors.

**Product rule:** Listeners can browse, discover and hear original-source audio without an account. Only invited registered contributors can submit private journal reflections.
