# Earth to Ear — Africa 26: Playback and journal preflight audit

**Date:** 2026-11-09  
**Scope:** All 26 existing Africa recordings, before external invitations.  
**Evidence standard:** Source metadata/page retrieval ≠ successful audio/video playback. A 403, timeout, or cache miss in an automated client is **not evidence** that the link fails in a normal browser.

## Technical validation already passed

- [x] All 26 catalog IDs are unique.
- [x] All 26 music source URLs are nonempty HTTPS links; all 26 are distinct.
- [x] All 26 journal URLs include the expected prefill field `entry.2035918381`.
- [x] Every prefill value decodes to the exact `Recording ID | Recording title` shown in the catalog.
- [ ] Audio/video playback verified on an ordinary mobile browser for every selection.
- [ ] Audio/video playback verified on a desktop browser for every selection.
- [ ] The full journal flow verified for a newly registered, non-founder contributor.
- [ ] Playback descriptions reconciled to the actual duration/access found.

## Verification ledger

| ID | Recording | Source | Page/metadata check | Live playback | Journal prefill |
|---|---|---|---|---|---|
| AFR-0001 | Aduna Esore (The World Is Dispersed) | [Folkways](https://folkways.si.edu/bouba-diedhiou/aduna-esore) | Automated retrieval unavailable (cache miss) | Not independently played | Structure valid; submission not tested |
| AFR-0002 | Gambian Griot Kora Duets | [Folkways](https://folkways.si.edu/alhaji-bai-konte/dembo-konte/ma-lamini-jobate/gambian-griot-kora-duets) | Source page opened; album identified | Not independently played | Structure valid; submission not tested |
| AFR-0003 | Eci ameya (horns) / Eci ameya (voices) | [Folkways](https://folkways.si.edu/central-african-republic-banda-polyphony/world/music/album/smithsonian) | Source page opened; album identified | Not independently played | Structure valid; submission not tested |
| AFR-0004 | Ambasel | [Folkways](https://folkways.si.edu/alemayehu-fantay/ambasel/music/track/smithsonian) | Source page opened; track identified | Not independently played | Structure valid; submission not tested |
| AFR-0005 | Chopi timbila orchestral performance | [Folkways](https://folkways.si.edu/music-from-mozambique-vol-2-chopi-timbila-two-orchestral-performances/world/album/smithsonian) | Automated retrieval 403 (not proof link broken) | Not independently played | Structure valid; submission not tested |
| AFR-0006 | Al-warda as-sghira (The Young Rose) | [Folkways](https://folkways.si.edu/morocco-arabic-traditional-music/world/music/album/smithsonian) | Automated retrieval 403 (not proof link broken) | Not independently played | Structure valid; submission not tested |
| AFR-0007 | Zaza bitiky manambady | [Folkways](https://folkways.si.edu/madagascar-land-of-the-betsimisaraka/world/music/album/smithsonian) | Automated retrieval 403 (not proof link broken) | Not independently played | Structure valid; submission not tested |
| AFR-0008 | Highlife | [Folkways](https://folkways.si.edu/yiadom-boakye-and-manhyia-tete-nwomkoro/highlife/world/music/track/smithsonian) | Source page opened; track identified | Not independently played | Structure valid; submission not tested |
| AFR-0009 | Water No Get Enemy | [Bandcamp](https://felakuti.bandcamp.com/track/water-no-get-enemy) | Source page opened; Bandcamp track identified | Not independently played | Structure valid; submission not tested |
| AFR-0010 | Ambassel | [Folkways](https://folkways.si.edu/meklit/ambassel) | Automated retrieval timed out (not proof link broken) | Not independently played | Structure valid; submission not tested |
| AFR-0011 | Diphiri tsa Amapiano | [YouTube](https://www.youtube.com/watch?v=cL0R5P6bUMM) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0012 | Last Last | [YouTube](https://www.youtube.com/watch?v=421w1j87fEM) | Video ID corroborated by independent source | Not independently played | Structure valid; submission not tested |
| AFR-0013 | Mdou Moctar — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=52CZVfiiMpY) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0014 | Tinariwen — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=kGJwMhVICg0) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0015 | Sauti Sol — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=Ua4o4dwNbWM) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0016 | WITCH — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=YM0CMGGFETU) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0017 | Jupiter & Okwess — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=5Xz8TjsbtU4) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0018 | Ladysmith Black Mambazo — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=FclwRECHoWc) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0019 | Noura Mint Seymali — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=T0YmoJuTbGU) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0020 | Blick Bassy — Live on KEXP | [YouTube](https://www.youtube.com/watch?v=OWv7ns1Y0YQ) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0021 | Angélique Kidjo — Tiny Desk Concert | [YouTube](https://www.youtube.com/watch?v=7rzGNL28Js0) | Video ID corroborated by independent source | Not independently played | Structure valid; submission not tested |
| AFR-0022 | Sampa the Great — Tiny Desk (Home) Concert | [YouTube](https://www.youtube.com/watch?v=svxhRbzGpMU) | YouTube video link present; automated player test unavailable | Not independently played | Structure valid; submission not tested |
| AFR-0023 | Bombino — Live on KEXP (2023) | [YouTube](https://www.youtube.com/watch?v=7pvCINz3N6Y) | Video ID corroborated by independent source | Not independently played | Structure valid; submission not tested |
| AFR-0024 | La Drivers Union Por Por Group — M.V. Labadi | [Folkways](https://folkways.si.edu/la-drivers-union-por-group-perform-mv-labadi/world/music/video/smithsonian) | Source page opened; video page identified | Not independently played | Structure valid; submission not tested |
| AFR-0025 | Ulimba: Mama Wo | [Folkways](https://folkways.si.edu/UNES08265_101URL) | Source page opened; track identified | Not independently played | Structure valid; submission not tested |
| AFR-0026 | Nkingulila ngende | [Folkways](https://folkways.si.edu/kyomile-kabanyolekile-with-haya-men/nkingulila-ngende/track/smithsonian) | Automated retrieval unavailable (cache miss) | Not independently played | Structure valid; submission not tested |

## What a human playback check must capture

For each selection, open from `https://earthtoear.com/#/africa` in a normal browser and record: (1) did the source page open; (2) did playable audio/video actually start; (3) was it the intended recording; (4) free full playback vs short preview vs paywall; (5) if unavailable, precise error, browser, and region. Record the results in the private archive's **Playback Verification** tab, not in this public source file if they contain private information.

For journals, the link structure is correct, but clicking into a Google Form and receiving a successful private submission are **separate** tests; contributor authorization is being redesigned. **Do not invite users to submit journals until that end-to-end flow is verified.**

## Source-check evidence

The page/metadata statuses above come from publicly retrievable source pages or independent mentions, not automated playback. Smithsonian Folkways may return an automated 403 while still working in a normal browser. YouTube playback generally could not be confirmed by the automated text-only retrieval route. No audio/video file has been copied or hosted by Earth to Ear.
