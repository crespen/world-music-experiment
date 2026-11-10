# Earth to Ear — Catalog Health and Audio Introduction

## Implemented (November 10, 2026)

- 26 music catalog records tracked in private `e2e_private.catalog_health`.
- `e2e_private.catalog_check_events` stores append-only per-check history.
- Supabase Edge Function `e2e-catalog-check` performs provider-page HTTP checks.
- Supabase Cron job `e2e-catalog-health-daily` invokes the checker in five batches per day (04:20, 08:20, 12:20, 16:20, 20:20 UTC). Each batch takes up to eight due items. This supports ~40 checks/day when due.
- A secret authentication token lives in Supabase Vault; never put it in website source, logs, or public responses.
- Catalog insert/reactivation/source-url changes automatically enroll or reset verification records.
- The founder dashboard `/founder.html` exposes page-status results, recheck requests, separate manual playback classifications and licensing evidence review.
- The public homepage's current-collection cards use a manual swipe/scroll carousel with visible controls and direct links to matching recordings in `/africa/?recording=ID`.
- Seven potential welcome-audio sources are stored as `unreviewed` licensing candidates. None have been approved for hosting or editing; no site audio currently plays.

## Critical distinctions

**Automated availability** answers only whether a provider URL responds to a limited HTTP request. HTTP 200 does NOT prove complete playable audio, licensing, embed permission, or availability from all countries. A provider's HTTP 403 to automation does NOT mean the content is unavailable to a real visitor.

**Manual playback classification** must be based on an actual browser test and record full, preview, limited, unavailable, or unverified. Record date, platform, region where relevant, and exact details.

**Reuse rights classification** requires identifying rights in the composition and recording, permitted media, modification permissions, commercial use, attribution, and where relevant performers/cultural provenance. For a public-domain or licensed determination, record an HTTPS evidence link. Do not download or deploy music based solely on a public listening link.

## Founder workflow

1. Sign in as founder via `/contributor.html`.
2. Open `/founder.html` → **Catalog Health**.
3. Search/filter recordings. Review source-page HTTP outcomes; mark 403 results for manual playback review rather than declaring them broken.
4. Open the original recording from the dashboard. Classify playback separately, add notes and save the manual review.
5. Mark rights as public domain or licensed only after evidence is recorded. Keep third-party streaming in `third_party_only` until independently cleared.
6. Use **Queue link recheck** to request a fresh automatic check; it runs on the next scheduled batch.
7. Inspect audio licensing candidates; they are research leads, not a ready-to-play queue.

## Planned audio player

A visible, user-started "Now Listening" strip should present:
- Play/pause, immediately accessible mute and volume, time/progress and source link.
- Recording title, performer, tradition/region, source and copyright/license credit (static, never infinitely scrolling).
- Approximately **30 seconds** per thoughtfully chosen excerpt, or naturally shorter material, where the use is permitted.
- No autoplay, no compulsory sound, no clips from sources whose reuse rights are unverified, and no claim that short clips automatically avoid copyright.
- Consider neutral short fades and optional non-looping progression only after licenses for edits and reuse have been verified.

**Carousel principle:** keep featured discovery collections manual, keyboard-reachable, swipable and non-autoplay; leave the research library searchable and filterable, not concealed in a carousel.

## Operational caveats

- The initial batch recorded 14 responding provider pages and 12 Smithsonian Folkways HTTP 403 responses to automation. Those 403s require human review and now have a 30-day automated retry cadence.
- Link statuses do not automatically change public playback labels; only human review can establish accurate playback.
- Recheck the cron, worker function, permissions and first run after any platform migration.
- Future scale: pagination and provider APIs, monitoring service quotas, contributor issue-report intake, and a more advanced review workflow.
