# Earth to Ear — November 11 site-review closure

Review source: *Earth to Ear: Site Review (November 11)*, supplied by founder. Reviewer observed the site while signed in as founder.

## Review observations and actions

| Review observation | Decision/action | Release status |
|---|---|---|
| 1. Recording pages are `noindex` with `?id=` links | **Intentional deferral**, not a defect or completed SEO feature. See below. | Documented; URL structure unchanged |
| 2. Access lines are lengthy | Show a short provider/duration/access summary in cards and on recording pages. Full provider, licensing and verification notes are available in an expandable details block on recording pages. Do not discard source restrictions or copyright caveats. | Implemented in site JS/CSS |
| 3. `NAM-0001` context reads as an editor's classification note | Replace it with listener-centered historical context and observations. Retain accurate performer and provenance. | Updated in live Supabase catalog |
| 4. Small continent collections imply comprehensive coverage | Show **Starter collection** for collections with three or fewer active records, and **Growing collection** for larger ones; preserve visible recording counts. | Implemented in homepage cards and regional intros |
| 5. Surprise Me spoils the selection | Keep the destination randomized among active music records, but hide the title and country until the person chooses the card. | Implemented in homepage |
| 6. Founder Dashboard versus My Account differs by page | Put one role-aware hydration routine into the shared website shell, including static Journeys, contributor and founder pages. All role decisions continue to come from the authenticated backend. Navigation labels are cosmetic and are never an authorization control. | Implemented in shared site shell |

## Decision on individual-record search indexing

The current canonical listener URL format is `/recording/?id=AFR-0028`, rendered after browser JavaScript loads an active Supabase record. The generic HTML is deliberately `<meta name="robots" content="noindex,follow">`. Individual recording URLs are absent from `sitemap.xml`.

**Keep `noindex,follow` for now.** Removing the tag would invite indexing of essentially identical generic HTML shells for every `?id=` parameter, with unreliable social previews and no server-rendered recording metadata. Indexing those pages now would create discoverability debt rather than solve it. The existing browsable public library and the unique, crawlable region and journey pages remain open to search engines.

**Criteria to revisit and implement real recording indexing:**
1. Build stable, crawlable routes such as `/recording/afr-0028/` with unique title, artist, description, meaningful content and server-visible metadata at build time.
2. Produce canonical tags, proper Open Graph preview metadata, and structured provenance without overstating licensing or source verification.
3. Automatically generate/update or retire these static pages when the catalog changes; exclude inactive/archived records.
4. Include only active record routes in a generated sitemap; keep old `?id=` URLs working as legacy sharing links (prefer canonical redirect when feasible).
5. Check browser render, mobile layout, screen-reader navigation, and Search Console indexing before removing `noindex`.

The URL migration is a **separate SEO construction task**, not part of this small UX correction release.

## Verification required

- Home `Surprise Me` never displays selected performer/title before activation.
- Small regions show “Starter collection” and actual live counts; no false claim of complete geographic coverage.
- Wikimedia examples such as `AFR-0028` display “Audio · 1:20 · Free on Wikimedia Commons”, with license and unconfirmed performer attribution available upon expanding source details.
- `NAM-0001` reads as listener-facing context in both Explore and its detail page.
- Founder account on home, Journeys, Explore, and contributor pages should consistently say “Founder Dashboard” once role verification completes. An Incognito browser should retain “My Account” with no private data.
- Existing contributor and founder data are gated server-side. Test authenticated roles separately; a navigation label is not a permission test.
- Confirm a single latest-commit GitHub Pages release succeeds. Older stuck workflow #418 remains independent.

**QA limits:** Source-level syntax and controlled rendering checks are not a replacement for an authenticated multi-device browser pass or automated live security test.
