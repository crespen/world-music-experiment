# Earth to Ear — Global Musical Atlas Classification Standard v1.0

**Adopted:** 13 November 2026  
**Applies to:** Africa, North America, South America, and future Asia, Europe and Oceania research inventories.  
**Status:** Internal editorial taxonomy. No Atlas has yet been released as a public site experience.

## 1. The unit being classified

One **candidate entity** is one musical concept: a named style, a specific form, a community performance practice, a scene, a composed-music tradition, or an unresolved lead. A bullet may still group a few closely related variants; **the number of bullet listings is never a count of verified genres**. A specific sound recording is a different entity. A documentary, artist, geographical community, instrument, playing technique or historical influence is not a genre simply because it appears in a musical context.

Every candidate should eventually carry: `canonical_id`, `display_name`, `aliases`, `entity_type`, `primary_historical_lens`, `also_active_today`, `origin_or_formation_note`, `associated_places[]`, `associated_communities[]`, `evidence_urls[]`, `validation_status`, `cross_volume_links[]`, and `editorial_note`. An optional `source_recording_id` links to the separate Listening Library only after its own music-first review.

## 2. Six primary entity types (single primary type)

| Code | Type | Inclusion rule | Not this |
|---|---|---|---|
| **[G]** | Genre or named musical style | A musically identifiable, culturally used genre/style family, even when the family has variations | Entire country's music or a single instrument |
| **[F]** | Musical or song/poetic form | Named structure or repertory form, such as an improvised verse form, set song type or composition form | Generic 'songs' with no named form |
| **[P]** | Performance, ritual, dance, ensemble or transmission practice | A way people perform, organize, teach or use music; including culturally authorized sacred practice | Automatically labeling the practice a genre |
| **[S]** | Scene, movement, industry or umbrella | Network of performers, stylistic movement, institution, commercial scene, cross-style grouping or revival | Counting every scene as a distinct musical genre |
| **[A]** | Composed/concert-music tradition | Composed instrumental, choral, operatic, contemporary art music and concert repertories in any society | Assuming only European-style orchestral music qualifies |
| **[R]** | Unresolved research lead | Evidence not sufficient to decide name, identity, local use, or type | A published or validated genre tag |

**Separately referenced, never counted as genre entries:** instruments; techniques; individual people or ensembles; documents and films; recordings; geographic names. These may link to [P] or [A] entries but remain distinct database entities.

## 3. Historical lens (one primary lens, other associations allowed)

The three sections describe **how a named musical entity emerged or was transformed**, not whether it remains audible today. All three can be living music. Do not classify by list position, age of a performer, recording date, or current popularity.

1. **Living and inherited traditions:** Continuously transmitted community, ceremonial, devotional, vernacular or historical practices whose formative identity predates the modern industrial recording/urban-popular wave, or for which a later exact origin is not established. Does not imply 'ancient,' static, rural, or exclusively Indigenous. Research living status independently.
2. **Historical transformations:** An identifiable new form, institutional change, commercial style or major recorded/staged transformation established primarily from the late nineteenth through twentieth century (boundaries are approximate and region-specific). It can remain active and innovative today. Its primary section reflects **formation**, not decline.
3. **Contemporary expressions:** A newly formed or recognizably differentiated genre, production practice, or movement arising primarily in the twenty-first century, or a specifically described twenty-first-century reinterpretation of an earlier entity. 'Contemporary performances of calypso' are not a new genre merely because the performance is recent; distinguish a new scene/variant if established.

**Decision order:** (a) what is the entity, (b) when/how did this *specific version* develop, (c) does the evidence support that date/context, (d) place it in exactly one primary historical lens, (e) attach cross-era influences as metadata rather than copying the same entity into multiple buckets. If chronology or type is uncertain, retain [R] and an explicit note; avoid invented precision.

## 4. Place, culture and cross-volume relationships

- Use country/territory headings to **navigate**, not to assign exclusive origin. Include multiple places, diasporas and named communities in metadata. Show the same musical family in several geographic volumes through **one canonical relationship**, not several contradictory origin claims.
- Relationship types: **circulation**, **documented influence**, **shared community**, **independent resemblance**, **regional variant**, **diaspora**, and **research hypothesis**. Never equate 'sounds similar' with historical borrowing.
- Establish territorial policy consistently: **Hawaiʻi** is U.S.-governed and Polynesian; **Rapa Nui** is Chilean territory and Polynesian. Both are indexed in political geography and cross-linked to Oceania, with their principal cultural contexts clearly noted. Guianas connect to Caribbean/Atlantic networks while remaining in South America.
- Establish aliases and parent-child relations: calypso/kaiso refer to one tradition where used synonymously; steelpan is an instrument, steelband an ensemble, steelband music a practice/recorded tradition; 'highlife' and its guitar/brass bands are related variants, not automatically three unrelated genres.

## 5. Source evidence and status

- A **country source anchor** is an investigative starting point, **not** evidence that all bullets beneath it have been individually verified. Give specific and diverse sources wherever available: local/community-led, national archives, scholarship, recordings and broadcasters; UNESCO documents cultural heritage but is not a global genre census.
- Record exact source URL and which claim it supports before marking an entity `verified`; otherwise mark it `candidate`, `alias-under-review`, `research-gap`, or `disputed`. Country-wide portals alone leave item verification open.
- Separate **inventory scope** (typed bullets) from **validated distinct genre count**, **live musical recordings**, and **educational/documentary sources**. Report each independently. Missing entries are research tasks, not zero genres.

## 6. Listening research is separate

The Atlas is a knowledge graph, not a playlist. An Atlas entry does not authorize a video for public listening. The Listening Library requires identifiable musical performance, source and rights/permissions checks, music-versus-narration assessment, access confirmation, and status `primary`, `review`, or `context`. Educational documentaries may support cultural research while never automatically becoming listening assignments.

## 7. Release QA for every volume

Before a version advances: (1) check every lens against origins/transformations, especially urban Caribbean and African popular music; (2) resolve exact duplicates and aliases; (3) ensure every section has [G]/[F]/[P]/[S]/[A]/[R] type codes on candidate bullets; (4) audit sacred and composed-music coverage without inventing composers or works; (5) record country source anchors and open gaps; (6) report count tables with **not distinct genres** language; (7) include named cross-volume links; (8) document scope exclusions and sensitive-access caveats; (9) keep legacy editions for comparison; (10) do not update the public listening catalog from an Atlas migration.

## 8. Version rules

Never silently overwrite identifiers associated with participant journals or recordings. Changes to research terms should preserve old labels as aliases, and revised country entries should record their parent or cross-country relations. Version counts can change because deduplication and entity typing are genuine editorial improvements, not research losses.
