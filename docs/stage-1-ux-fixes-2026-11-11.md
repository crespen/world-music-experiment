# Earth to Ear — Stage 1 UI/UX Fixes (Navigation, Accessibility, Reliability)

**Implemented November 11, 2026.** Repository implementation complete, but **live-domain visual and real-device testing not verified**.

This is the first implementation stage of [the site-map and UX audit](site-map-and-ux-review-2026-11-11.md). It deliberately does **not** implement Saved Listening, individual recording pages, separate musical-journey articles, a PWA, a native Android app, or podcast/video content.

## Changes made

### 1) One navigation and footer across the platform

Introduced two reusable files:
- `assets/site-shell.js`: central source for header, five public destinations, active link, footer and responsive menu behavior.
- `assets/site-shell.css`: consistent Earth to Ear masthead, spacing, navigation typography, focus indicators, mobile layout and common footer.

**Public nav:** Explore Music · Musical Journeys · How to Listen · About · My Account.

**Role-aware links:** The default My Account destination remains the secure contributor sign-in. On the main site, the existing account-status check may update its label to My Journal, registration or Founder Dashboard only after authorization. The separate About page retains its existing auth-aware account label logic. The journal retains its existing founder shortcut, initially hidden and shown only following an authorized check; the founder page keeps its protected dashboard section. These are **navigation conveniences, not authorization changes**; server-side security is unchanged.

**Contributor-only destinations:** Listening Bulletin and contributor tools are now surfaced in the contributor context navigation, rather than public top-level menu links. For Contributors remains available through the About content, public participation page, homepage CTAs and the common footer.

Applied the shared header/footer to:
- Dynamic homepage, Explore, six continent pages, How to Listen and participation (10 static wrappers all backed by `assets/site.js`).
- Standalone About and Musical Journeys pages (shared header/footer placeholders).
- Separate contributor journal, founder dashboard and Listening Bulletin (same shared shell, plus useful role-specific subnavigation).

### 2) Accessibility foundation

- Added a keyboard-visible **Skip to main content** link and a target `#main-content` on all paths.
- Responsive hamburger navigation has `aria-expanded`, `aria-controls`, descriptive labels, Escape dismissal with focus return, outside-click dismissal and collapse on selection.
- Applied visible focus outlines to shared navigation and contextual controls.
- Shared scroll padding accounts for the sticky header when navigating to anchored listening sections.
- The existing first-visit dialog now explicitly restores focus to its previous element on dismissal.
- Increased mobile menu text and made public navigation manageable at tablet widths.

**No WCAG 2.2 AA certification is claimed.** Color contrast, screen-reader interaction, high zoom, motion behavior and touch targets across the rest of the site still require direct checks.

### 3) Catalog outage no longer hides the public site

Previously, `assets/site.js` aborted the entire public render when `loadCatalog()` rejected, replacing every dynamic route with a generic outage message.

Now:
- Catalog retrieval attempts fail with an explicit 12-second request abort; homepage editorial selection attempts abort after 9 seconds.
- If catalog retrieval fails, the public masthead/footer, About, How to Listen, participation and homepage remain renderable.
- Browse and continent music areas show a **local catalog unavailable panel** with a Retry control instead of presenting empty recordings as a legitimate empty catalog.
- Continent summary counts no longer imply the catalog has zero selections during an outage.
- The first-visit welcome dialog is suppressed during a catalog outage to avoid onboarding visitors into unavailable music.
- Even unexpected rendering failures have a last-resort navigation/information/retry fallback.
- The journal, founder permissions and public music database were not modified.

## Implementation verification

Repository and deterministic JavaScript checks performed:
1. Both shared assets exist and their JS source parses.
2. Shared header generation returns the same **five destinations** across home, continent, journeys, How to Listen, About, For Contributors, journal, bulletin and founder routes, with correct active states.
3. Shared header includes skip link, mobile menu control identifiers and proper initial collapsed state.
4. Simulated clicking Menu, pressing Escape and choosing a link: menu state and focus behavior passed.
5. Simulated Supabase/network failure: Home, Explore, How to Listen, About and Participation rendered with header/footer instead of disappearing; Explore presented the retry panel.
6. The founder dashboard remains initially hidden pending authorization; the contributor page retains its role-based founder shortcut.
7. All **15** HTML entry points load the shared stylesheet and script. Dynamic wrappers reference the final `site.js?v=stage1-v3` and all HTML pages the final shared CSS `site-shell.css?v=stage1-v4`.
8. No Supabase schema, private reflection entries, project roles or invitation workflow was changed.

**Limitations:** The current environment could not independently open `https://earthtoear.com/` in a live browser. The code is committed to GitHub and subject to normal deployment / CDN propagation. Real visual and device QA is still required.

## Short final QA checklist

- In a fresh browser tab, check Home, Explore, How to Listen, About, Musical Journeys and a continent view. Confirm the same masthead/footer and five navigation destinations.
- At phone and tablet widths, open the menu, move focus with Tab, press Escape, ensure focus returns to Menu, and verify no overlap / horizontal overflow.
- On the How to Listen page, choose Encounter / Connection / Journey and ensure the section heading is not hidden under the sticky navigation.
- Sign in as an invited contributor: My Journal, previous reflections, submission, music suggestions and Contributor Updates should function; signed-out visitors should not see any private journal data.
- Sign in as the founder: the original dashboard metrics, curation tools and contributor controls must still function. The founder-only link should not appear for other users.
- Simulate catalog API unavailability in browser DevTools: the public navigation remains usable, recording lists display a retry message and About / How to Listen remain readable.
- Verify screen-reader and WCAG 2.2 AA checks in separate formal testing. Run mobile Lighthouse / Core Web Vitals tests after the visual rollout.

## Next stage

**Stage 2:** coherent recording-detail experience, source exit/return continuity and separately shareable historical listening journeys. Saved Listening, discoverability refinements, and Android installability follow as distinct decisions.
