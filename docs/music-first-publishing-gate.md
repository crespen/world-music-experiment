# Music-first publishing gate · operational policy

**Effective:** November 12, 2026
**Goal:** No visitor should have to wade through a series of educational documentaries in order to encounter a musical performance.

## The single source of truth
`public.music_catalog.listening_role` has three values:

- `primary`: published into the main Listening Library, discovery searches, homepage selections, and browsable continent collections. This is a **curatorial classification**, NOT a certification of end-to-end playback or rights verification.
- `review`: retained in the catalog but withheld from routine public music discovery until the source is assessed for music-first suitability.
- `context`: valued documentary/educational reference rather than a primary listening selection. Preserved under the original ID and available at its existing direct page, while excluded from routine listening discovery.

**Default for every newly added catalog row is `review`**, even when `active=true`. Editors must explicitly classify an individual performance `primary` before it can be shown in the Listening Library.

The existing `active` field remains separate from this editorial classification. Do not set `active=false` simply because an item belongs in cultural context: journal history and source references must be preserved.

## Starting snapshot

162 active catalog records were assessed with metadata screening and founder feedback, producing:

| Lane | Count | Rationale |
|---|---:|---|
| `primary` | 97 | 95 previously cataloged music/performance candidates without the documentary flag, plus two founder-confirmed performances |
| `review` | 55 | Documentary-leaning or uncertain metadata; listening format not yet confirmed |
| `context` | 10 | All seven recently reviewed Africa documentary links and three reviewed Asia documentaries |

**Founder-confirmed primary exceptions:** ASI-0005 (*Allah Hoo*, Nusrat Fateh Ali Khan), OCE-0005 (Leweton Women's Water Music).
**Founder-confirmed context:** AFR-0047 through AFR-0053 (seven Africa documentary selections) and ASI-0006 through ASI-0008 (gagaku, morin khuur, guqin).

The 95 other primary entries are **provisional music-first candidates**, not 95 independently played-and-verified recordings. Real listening QA must continue; this safeguard reduces the documentary problem without claiming a perfect catalog.

## Implementation

- `assets/site.js` downloads active catalog rows with `listening_role`, then makes only `primary` entries available for public discovery, searches, homepage random play, and the introductory carousel.
- `scripts/generate-recording-pages.mjs` builds direct static pages for every active source (including references already tied to journals) but only primary entries are included in the public sitemap. Held entries are clearly labeled and given `noindex,follow`.
- New sources start in review by database default; they cannot appear by merely being added to the table.
- Existing visitor journals and recording IDs are not modified by classification.

## How to curate without making the founder the bottleneck

The curation team/assistant should do the work before submitting a new source: find a real **specific performance**, establish the artist and piece, check whether the link is direct, note its first continuous music segment, and reject obvious narration-first documentary formats from the primary lane. Use authorized original sources where possible.

Required editorial evidence for a promotion to primary:
1. Identifiable song/performance and performer, with attribution and context
2. Video or audio is substantially musical; spoken introduction and narration burden assessed
3. The source opens to the intended performance promptly (or to a verified deep-linked start)
4. The specific source URL and metadata are accurately recorded
5. Real playback result and rights/community caveats are **separate fields** and never inferred from successful HTTP response

If the reviewer cannot establish the musical format, leave the recording in `review`, not `primary`. A UNESCO heritage film may be a useful context source but is not automatically a listening item. Do **not** disqualify an actual musical performance merely because it was filmed or documented.

## Next rounds
Review the 55 remaining held entries as editorial work. Replace documentary-first sources with identified standalone performances using **new recording IDs**, and keep original documentaries as cultural references. The founder need only adjudicate borderline or strategically important selections, not every catalog item.
