# Earth to Ear — First Three Musical Journeys

**Implemented November 11, 2026**

The first phase of a public Musical Journeys section exists as a **standalone page** at https://earthtoear.com/journeys/. It does not replace the open world catalog or the optional How to Listen guide.

## Arc coverage

| Journey | Recorded listening anchors | Location | Editorial focus |
|---|---:|---|---|
| The Jazz Voice | 7 | United States | Blues and jazz vocal phrasing, swing, interpretive freedom, improvisation, contemporary reinterpretation |
| Jamaican Reggae | 5 | Jamaica | Early reggae naming, roots resistance and memory, bass/drum production, newer roots performance |
| Ghanaian Highlife | 6 | Ghana | Palm-wine guitar and guitar-band performance, local-language story, later highlife/Afro-funk branches |

**Eighteen new source-linked music_catalog records:** `NAM-0012`–`NAM-0023` (12 records) and `AFR-0032`–`AFR-0037` (6 records). Verified catalog count went from 52 to **70 active**, with **70 journal-registered records** and none missing in the contributor registry.

## Page package

Each phase links **directly to its provider** (artist’s official channel, government/cultural archive, commercial host, broadcaster, or explicitly identified independent historical upload) plus a stable Earth to Ear catalog deep link. Each includes a chronological/period label, a paragraph explaining what to listen for or what changed, and a brief artist biography. Twelve supporting artist-interview / biographical / historical source links are attached; **not all are first-person interviews** and must be described honestly.

The jazz vocal arc includes several *parallel*, not strictly inherited, practices. The reggae arc is deliberately a roots-oriented Jamaican slice, not all reggae, dub, lovers rock and dancehall. The Ghana arc concentrates on guitar-led highlife but includes later band branches. No overall universal or exhaustive music history is claimed.

Some historical examples are **modern uploads or reissues**, and source metadata distinguishes performance date from reissue date. Original release/recording years of E.K. Nyame’s `Obra` and Kwaa Mensah’s selection have not been firmly established. YouTube/archive provider availability remains subject to their terms and regional restrictions; **we do not download, host, or guarantee full free audio**.

## Rollout and testing

- Site page: `journeys/index.html`
- Public homepage and global nav: `assets/site.js`
- Cache versions on all public static index wrappers refreshed to `20261111-journeys-v1` so new navigation appears.
- Standalone About and contributor portal nav: linked to journeys
- Sitemap includes the canonical URL.
- The three arcs have 18 linked stops and 12 supporting interview/historical context links.
- Remaining QA: test on a real browser/device, verify third-party playback in the user’s region and check whether any archived links should be replaced by more playable or authoritative variants. Repository verification is **not** evidence of live browser deployment.

## Editorial next steps

Develop deeper journeys within a *single musical style, geographic context or performance practice* rather than assigning each genre one fixed master timeline. Future additions can add intermediate artists to each arc without changing the “open and growing” catalog principle. Do not confuse click counts with evidence of listening.

Additional context: `docs/musical-journeys-editorial-standard.md` and `docs/podcast-topic-and-guest-catalog.md`.
