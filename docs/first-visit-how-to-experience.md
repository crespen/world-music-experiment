# Earth to Ear — First-Visit "How to Listen" Experience

**Implemented November 11, 2026.** This is a listener-facing product feature, not a participant requirement.

## Purpose

The music is the primary experience. Orient new visitors toward **active contemplation** without lectures, quizzes, ratings, ancestry assumptions, compulsory journaling, or forced exploration sequences. Visitors may follow a personal association or simply enjoy hearing a recording again. All six continent collections remain publicly browseable; contributors' private journals remain invitation-only.

## Behavior now deployed in repository

- The first time a visitor opens the **homepage** in that browser, a short, accessible welcome dialog offers **Encounter**, **Connection** and **Journey**, plus **Not now** and **I'd rather start listening**.
- The guide does **not** interrupt visitors who land on a deep-linked recording, continent collection, or the contributor journal.
- Dismissing or choosing an option records only `localStorage['e2e-first-visit-how-to-v1']='seen'` (session storage fallback where practical). No sign-in, tracking pixel, email address or server record is needed. The guide is not shown again automatically in that browser.
- Escape, the close control, or tapping the backdrop dismisses the native dialog. The new **How to Listen** navigation link permits revisiting the guide any time.
- The new canonical **https://earthtoear.com/how-to/** has three sections, each linking to **existing public catalog recordings** at `/explore/?recording=<catalog ID>`. IDs are verified against published catalog records. No downloads or copied/rehosted artist audio.
- The three sections introduce:
  - **Encounter:** notice unfamiliar sounds; initial selections: ASI-0001, AFR-0003, ASI-0003.
  - **Connection:** notice memories and associations without treating ancestry or familiarity as proven origins; NAM-0001, OCE-0001, NAM-0007.
  - **Journey:** compare recordings across time; NAM-0001, NAM-0003, NAM-0011. These are **three distinct American roots-related threads, not a claimed continuous style lineage or completed musical history**. Focused styles, including jazz, Jamaican roots reggae and Ghanaian highlife, have separate editorial work in progress.
- A concise explanation on the guide distinguishes optional contribution from open listening. The homepage link, global navigation, independent About page, signed-in contributor portal link and public sitemap now lead to the guide.
- Branding follows existing Earth to Ear website styles and adapts to narrow mobile screens. Accessibility includes a native dialog, Escape dismissal, labeled close control, keyboard-link destinations and an in-page guide usable independently of the first-visit dialog.

## Editorial upkeep

Replace starter recordings only with live catalog IDs and source links that work. Do not suggest that contrasting recordings necessarily have a historical or familial connection. When a genuine style-specific Musical Journey is published, the Journey section may link to that new page instead of or alongside this starter comparison.

Maintain the distinction between **a music discovery invitation** and **a private research journal**. Do not turn the first-time guide into a registration funnel.

## Verification and limitations

Repository code syntax checked, initial rendering template checked, all nine initial recording deep links matched known catalog IDs, and first-visit dismissal behavior simulated. All public page bundles updated to a new cache version and the canonical route added to the sitemap. **A real-browser/mobile visual and deployment check is still needed**; repository commits alone do not prove current CDN/site availability.

For QA without changing site data:
1. Open a private/incognito window and visit `https://earthtoear.com/`; the welcome guide should appear.
2. Choose **Encounter**; verify the guide page scrolls to the right section and at least one real recording opens in the library.
3. Return home in the same window: guide should no longer appear automatically; select **How to Listen** from navigation to reopen it manually.
4. Repeat on Android width and with keyboard Escape, menu navigation, mobile playback links, and invited contributor journal (no guide interruption on direct journal visit).
5. Confirm the page is readable when the catalog temporarily fails and that no private journal content becomes public.

## Source files

- `assets/site.js` — guided route and one-time homepage welcome behavior
- `assets/site.css` — responsive dialog and guide design
- `how-to/index.html` — canonical new page and crawler fallback
- `index.html` and other public listening pages — cache-busted client assets
- `about/index.html`, `contributor.html` — permanent navigation links
- `sitemap.xml` — canonical guide discovery
