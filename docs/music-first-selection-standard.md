# Earth to Ear — Music-First Selection and Atlas Editorial Standard

**Adopted:** November 12, 2026. For new catalog recordings, existing source audits, Musical Journeys, and all continental Atlases.

## Live publishing gate

The operational database field `music_catalog.listening_role` now controls publication: `primary` is visible in routine music discovery, `review` is held, and `context` is documentary/reference material. **New catalog rows default to `review`.** The public `primary` lane includes some provisional candidates; it is *not* a claim that playback, rights, and attribution have all been verified. See [publishing gate and current inventory](music-first-publishing-gate.md).

## Listening first

Participants come to hear **music**, not wait through an explanatory documentary for a performance to begin. An institutional film can be a trustworthy source of **context** without being a suitable **primary listening selection**.

### Primary music test

- **Exact identity:** identify the work or performance, actual artist/ensemble, source, and recording or performance date. Never substitute an upload date for a performance date.
- **Quick musical entry:** aim for music within 30 seconds of opening. A verified deep link to a clear musical segment can qualify.
- **Substantive music:** prioritize a complete song or coherent uninterrupted musical performance; normally at least two continuous minutes where culturally appropriate.
- **Narration:** editorial target of 75% or more music within the *selected* listening segment. Human judgment applies to short musical forms, full concerts, and culturally governed performances.
- **Authentic source:** favor artists, authorized labels, broadcasters, archives and community-approved presenters.
- **Playback:** test in a real browser. URL resolution does not verify playback, unrestricted access or the correct music.
- **Community care:** public archival documentation does not override permission restrictions on sacred or sensitive practices.
- **Musical distinctiveness:** choose for what can be heard, not availability, famous names or country quotas.

### Editorial roles

- **Primary — verified:** full identity and a suitable performance, with independently tested playback.
- **Primary — playback unverified:** a clear music-first candidate whose full playback remains untested; visible label required.
- **Context only:** interviews, explainers, documentary film, or mixed-media educational content useful as supporting historical evidence.
- **Needs replacement:** active source would better serve as context; locate distinct performance before archiving.
- **Archive:** wrong, unusable or inappropriate original, preserving its ID and journal connections.

A documentary may qualify exceptionally when it contains a substantial music segment reachable by a **tested direct timestamp** and the rest of its context is clearly disclosed. Do not reject an otherwise complete concert for a short musician introduction.

## Intake and validation

At submission: validate required title, performer, country and community, source credit, URL and possible duplicates. Terms such as *documentary*, *film*, *overview* and *excerpts* should **flag human review, not auto-fail**. Require human review of musical start time, uninterrupted musical passage, narration amount, source authority, cultural context, and rights claims. Playback testing must be documented separately.

Record fields: recording_id, primary_or_context, title, performer, performance_date, source_url, music_starts_at_seconds, uninterrupted_music_seconds, narration_notes, metadata_evidence, source_authority, playback_status, tested_at, rights_status, community_protocols, reviewer, editorial_decision, replacement_recording_id.

**Preservation:** never recycle an existing recording ID for a different performance, and never silently move journal reflections to a replacement. Documentary metadata screening alone is not a reason to deactivate a source.

## Atlas structure across continents

Use the same three research lenses everywhere: (1) living and inherited traditions, (2) historical transformations, (3) contemporary expressions. They overlap; traditions are not a hierarchy of civilization or quality. Include religious/sacred and composed concert music on every continent, and type entries as genre, practice, scene, instrument, technique, work or artist. National borders are search aids, not exclusive ownership. Apply comparable research depth, not numerical quotas.

## Basis

Adopted in response to the supplied *Musical Atlas Review: Africa and North America v0.1*, with v0.2 revisions of both Atlases. See also the existing listening-access and curation standard.
