# Earth to Ear: A Global Listening Experiment

Public website: https://earthtoear.com

Earth to Ear invites anyone to listen to musical performances from different places and eras, hear them at their original authorized sources, and discover historical and cultural context. Private journal participation is by invitation only.

## Publication

The website uses GitHub Pages and its public catalog lives in Supabase.

**Search and discovery:** Every active recording is represented by a canonical, crawler-readable page at `/recording/<id>/`, with unique source-derived metadata. Legacy `/recording/?id=...` links remain available. The active catalog is rendered into an updated `sitemap.xml`.

See [Automated recording SEO publication](docs/seo-recording-publishing-standard.md) for the publishing workflow, verification tests, and **required one-time switch to GitHub Actions as Pages source**. Scheduled publishing is approximately every six hours, not instantaneous.

## Participation and privacy

- Public visitors can explore the catalog without signing in.
- Journal entries, founder reports, and contributor identities are protected by server-side authentication and authorization.
- Only public active music metadata goes into the generated search pages. No private participant data is included.
- Earth to Ear links to recordings at third-party sources; it does not distribute their audio or claim rights in it.
- Never commit Supabase service keys, participant records, private journal content, or credentials.

## Project references

- [Global Musical Atlas classification standard v1.0](docs/atlas-classification-standard-v1.md) — canonical six entity types, formation-period lenses, alias and cross-volume rules
- [African Musical Atlas v0.3](docs/atlases/african-musical-atlas-v0-3.md) — 701 typed candidate entries across 55 country/territorial sections; provisional sources
- [North American Musical Atlas v0.3](docs/atlases/north-american-musical-atlas-v0-3.md) — 323 typed entries; Caribbean chronology and alias corrections
- [South American Musical Atlas v0.2](docs/atlases/south-american-musical-atlas-v0-2.md) — 387 typed entries, documented review additions and cross-volume pathways
- [Music-first publishing gate](docs/music-first-publishing-gate.md) — recordings handled separately from Atlas research
- [Music-first selection standard](docs/music-first-selection-standard.md) — primary listening versus documentary context; 30-second entry guideline and playback QA
- [Initial music-first catalog triage](docs/music-first-catalog-triage-2026-11-12.md) — metadata-only review list, not playback failures
- [Listening access and curation](docs/listening-access-curation-standard.md)
- [Musical journeys editorial standard](docs/musical-journeys-editorial-standard.md)
- [Listener UX and verification](docs/listener-ux-stage-2-3-and-stage-4-verification.md)
- [SEO publication and automation](docs/seo-recording-publishing-standard.md)
