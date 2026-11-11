# Earth to Ear — Listener Link Reports and Founder Contributor Directory

**Implemented:** November 11, 2026  
**Deployment state:** Supabase functions and database changes deployed; GitHub Pages source changes committed to `main`. Live browser/device verification remains outstanding.

## 1. Report link issue (public)

Listeners can choose **⚑ Report link issue** on:
- Explore recording rows
- regional recording cards
- recording detail pages
- 18 musical-journey listening stops
- the optional homepage listening carousel (tracks current selection)

No login or email is required. A native dialog asks for one reason:
- Does not lead directly to the music (default)
- Broken / unavailable recording
- Wrong music or performer
- Paywall or no usable preview
- Other

A description of the problem is optional (maximum 700 characters).

Submission uses the dedicated `e2e-link-report` Edge Function. It validates the recording ID and permitted issue reasons, retrieves the source URL from the active public catalog (instead of trusting an arbitrary supplied URL), rejects oversized input, and limits repeated reports. The storage table is `e2e_private.listening_link_reports`; its contents are not public. A one-way fingerprint is used for basic abuse controls; no visitor name or email is stored. There is no automated alteration or removal of source recordings after a report.

## 2. Founder Link Reports queue

The Founder Dashboard has a **Listening link reports** panel that displays the pending count, selected recording and original source, issue reason, optional listener note, submission date, and review status. The founder can open the reported source and mark a report **Reviewing**, **Resolved**, or **Dismiss**.

The existing `e2e-contributor` API now supports `admin-link-reports` and `admin-review-link-report`, with verified user JWT and founder authorization on each request. It does not expose private data to anonymous users.

## 3. Click-through Active Contributors

The **Active contributors** metric card is now a button that reveals a founder-only directory. The authenticated API `admin-contributors` returns only active records from `e2e_private.contributors`: display name, email address, participant ID, registration and consent dates, and the count of saved journal entries. The interface displays name, email, participant ID, join date and journal count. It does not expose all journal content in this panel; existing founder journal review remains unchanged.

The directory is hidden until the founder opens it and access is independently verified. No public contributor directory was created.

## Security and verification

- Added private `listening_link_reports` table with RLS enabled, no anonymous policies and no anonymous/authenticated table grants.
- New service functions are callable only through `service_role`; execute grants for `anon` and `authenticated` were explicitly revoked.
- Direct anonymous execute privilege on the contributor directory and report queue was verified **false**; service-role execute verified **true**.
- Database dry-run submission returned a stored row inside a transaction, then rollback was verified to leave **zero** reports.
- The direct contributor directory function returned **4** records, matching the active contributor count of **4** when checked.
- New public reporting and site JavaScript passed source syntax checks.
- Existing contributor invitation, journal, founder editorial, and music catalog ownership boundaries were preserved.

## Browser checks still needed

1. Signed-out user: open a recording, select **Report link issue**, choose "does not lead directly to the music," submit, and confirm a successful notice. The founder queue should then show the report.
2. Founder: select the Active contributors card and verify four named member records display, with no member identities visible when signed out.
3. Founder: review the newly submitted link issue, open its source, change its status, refresh, and confirm the status persists.
4. Test narrow mobile layouts, keyboard navigation, focus restoration and screen-reader labels.
5. Verify final GitHub Pages deployment and external source playback manually. Code commits and SQL-level tests do not prove a real browser workflow works.

## UX principle

Broken links and links that lead to browsing pages rather than the promised music are actionable defects. Listener reports should be easy to submit, but remain evidence for human review—not automatic decisions about a recording or artist.
