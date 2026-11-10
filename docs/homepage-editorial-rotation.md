# Earth to Ear · Homepage Editorial Rotation

## Purpose
The homepage “What's New in the Listening Community” is a founder-curated discovery rail, **not** the latest eight catalog rows. New approved recordings enter their continental collection immediately; only selected recordings appear in the homepage rail.

## Editorial policy
- Maximum: **8 current features**.
- Scheduled check: **1st and 15th of each month at 16:00 UTC** (Supabase `pg_cron` job `e2e-home-editorial-1st-15th`).
- Scheduled additions: **up to 2 queued recordings per check**, sorted by priority (highest first), then queue date.
- Minimum visibility: **30 days from first featuring**. The scheduled job can retire only past-due features.
- If no slots are free and no features have served 30 days, it does nothing. The queue remains intact.
- Founder overrides can publish immediately or retire early; the dashboard asks for explicit confirmation on actions bypassing the 30-day minimum.
- The homepage card links to the recording's **own continental collection**, where the individual Listen and My Journal buttons remain accessible.
- Archive collection pages are not journaling subjects: only individual cataloged recordings get journal IDs.

## Current initial release (November 10, 2026)
Eight current features include:
- `NAM-0001` — Fisk Jubilee Singers, *Swing Low, Sweet Chariot*.
- `AFR-0027` — *Drumming and Singing in Northern Ghana*.
- Six previously cataloged African recordings (`AFR-0023`, `AFR-0024`, `AFR-0025`, `AFR-0026`, `AFR-0028`, `AFR-0029`).

They are protected through December 10, 2026; the next scheduled date after eligibility is **December 15, 2026**. The first queue contains `NAM-0002` and `AFR-0021`, subject to later founder edits.

## Founder workflow
1. Sign in to the Founder Research Dashboard and locate **What's New — Editorial Rotation**.
2. Select an approved catalog recording and choose **Add to queue**.
3. Review the queued candidates and priorities; the scheduled job selects at most two each rotation.
4. **Feature now** publishes immediately if a slot is available or an existing feature has completed 30 days.
5. **Replace early (override)** is exceptional and requires confirmation; it replaces the oldest feature even if it has not completed 30 days.
6. **Remove** a live feature after 30 days; **Remove early (override)** bypasses the minimum with confirmation.
7. **Refresh** reloads the queue, current lineup and retired-feature history.

## Architecture and access controls
- Public table: `public.e2e_home_features`. Anonymous and authenticated readers have SELECT permission, limited by RLS to current, started features. They have no INSERT, UPDATE or DELETE permission.
- Private queue: `e2e_private.home_feature_queue`. Not directly available via the public Data API.
- Internal rotation function: `e2e_private.rotate_home_features(timestamptz)`, invoked by `pg_cron`.
- Founder-only RPC: `public.e2e_founder_feature_editor(text,text,text,integer)`, executable only by `service_role`.
- Edge Function `e2e-contributor` handles `home-editorial`: it verifies the bearer token with Supabase Auth, verifies founder authorization against the private administrator registry, and invokes the RPC with the verified email.
- Public homepage loads RLS-filtered features separately from the active music catalog, so a feature-data error does not block the library.

## Validation performed
- Anonymous SELECT returns the eight active features; anonymous UPDATE and authenticated INSERT are disallowed.
- Cron job registered and active; safe check before 30 days changed nothing.
- A rolled-back simulation for December 15 retired two eligible records, published two queued selections, and retained eight features.
- A rolled-back founder test queued a new track and successfully overrode the lineup; transaction rollback left live data unchanged.
- Script syntax and continent-aware featured-card routing were checked.

## Notes
- All source recordings stay with their original providers; Earth to Ear stores catalog metadata and contributor reflections.
- Do not automatically publish newly imported recordings without the founder's editorial approval.
- Do not silently reset existing 30-day protections when editing or rotating a feature.
