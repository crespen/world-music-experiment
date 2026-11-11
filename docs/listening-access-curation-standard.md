# Earth to Ear — Listening Access and Source Curation Standard

Adopted November 11, 2026. Applies to every newly curated recording, every historical journey, and periodic source audits.

## Default: full listening without payment

Prefer **legitimate, full-length, freely accessible recordings** from the actual performers, rights holders, official labels, public broadcasters, museums, universities, archives, and other authorized sources. A 30-second preview does **not** satisfy the default standard. Provider subscription rights are separate from Earth to Ear contributor sign-in.

## Source-selection hierarchy

1. Exact intended recording or performance; authorized original source; full recording accessible without payment.
2. Exact intended recording at an authorized source, with clearly disclosed limits (repeat-play cap, provider membership, purchase, regional restrictions, or not-yet-verified browser playback).
3. Rare or historically distinctive exact recording available only as a short preview; retain only with documented editorial rationale and conspicuous “30-second preview” label.
4. A different performance of a similar piece or musical tradition must be created as a **separate catalog record**, not silently substituted for an archival recording.

Do not link to unauthorized copies or bypass access restrictions. Do not host/copy third-party audio. Retain provenance, context, performers, and recording edition.

## Acceptance checks before marking a recording verified

- Confirm the **exact title, performers, period, provenance, and recording**; do not confuse an album page with a direct track.
- Prefer direct audio/video destination over promotional pages. Confirm link destination and source credibility.
- Use a real browser to play through the track: establish whether the **full duration** plays without payment, an external account, or subscription. The provider's page title, duration and play button alone cannot establish playable access.
- Check desktop/mobile return flow, country restrictions, repeat-play caps and accessibility of the external source.
- Populate catalog `access` with a truthful, readable access statement; update `source_credit` if changing the linked host. Label playback restrictions in Explore, regional cards, and recording details.
- If access cannot be established, say **“playback not independently tested”** rather than asserting full free listening.
- Review reports from Earth to Ear's “Report link issue” feature, and periodically recheck sources.

## Access terms

- **Free full recording/performance — verified**: only after direct real-world playback confirmation.
- **Full-track page — playback unverified**: an exact source page exists but actual accessible playback is not confirmed.
- **Archive audio — playback unverified**: matching archival item and audio indication found; browser playback not confirmed.
- **Free short performance clip**: the entire short video is available, but it is an excerpt, not a complete concert or necessarily a whole composition.
- **30-second preview**: full playback separately requires provider membership or purchase where available, and this restriction must be visible before visitors follow the link.

## November 11, 2026 — Smithsonian Folkways source audit

Audited all **15** records then linking to `folkways.si.edu`. Updated playback notes for all 15 records in Supabase. Three exact-source links were redirected:

- `AFR-0001` — Bouba Diedhiou, *Aduna Esore*, official Smithsonian Folkways Bandcamp recording.
- `AFR-0002` — *Gambian Griot Kora Duets*, label-linked official Bandcamp album of the original recording.
- `AFR-0026` — Kyomile Kabanyolekile with Haya men, *Nkingulila ngende*, historical matching audio listed at the South African Music Archive Project (university archive).

Folkways videos `AFR-0024` (4:13 filmed Ghanaian performance) and `ASI-0001` (1:17 Tuvan clip) are labeled as such; other Folkways audio/album pages carry documented public preview limitations. The two Bandcamp pages and the archive offer promising alternative access but **full playback has not been independently tested**. No claim of complete hands-on playback QA is made.

Documentation:
- https://folkways.si.edu/download-streaming-support
- https://folkways.si.edu/faq
- https://smithsonianfolkways.bandcamp.com/track/aduna-esore
- https://alhajibaikontedembokontemalaminijobate.bandcamp.com/album/gambian-griot-kora-duets
- https://samap.ukzn.ac.za/audio-relation/ac0223

Continue to apply this hierarchy to every future addition. A curator's preference for a particular tradition never justifies silently substituting a different performance.
