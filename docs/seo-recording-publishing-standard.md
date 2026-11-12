# Earth to Ear — automated recording SEO publication

**Status:** The first 70 active recording pages and updated sitemap are committed as a static snapshot. The reusable generator and custom GitHub Pages workflow are in the repository. A one-time GitHub Pages source change is required for the ongoing autonomous deployments.

## What gets indexed

- One **public**, crawler-readable HTML document per **active** record in Supabase `public.music_catalog` at `/recording/<lowercase-id>/`. Pages are useful without JavaScript.
- Independent, source-derived metadata: title, musician or ensemble, geographic context, tradition, curated explanation, listening access, source credits, canonical URL, Open Graph summary, and a modest MusicRecording structured-data object.
- An original-source listening link that opens with the provider. **No audio, album art, lyrics, or third-party recording files are downloaded or redistributed.**
- Small contextual links to other active recordings, plus optional Saved Listening and a private journal link.
- Site sitemap always contains **only active recording URLs** and 12 stable public section URLs. Private account pages and local Saved Listening are not included.
- The legacy link format `/recording/?id=AFR-0028` remains available, but marked `noindex`; all new internal links use `/recording/afr-0028/`.

## Automatic maintenance

`scripts/generate-recording-pages.mjs` queries only the **public, active** catalog through Supabase's publishable key. There is no service-role credential in the build.

The GitHub workflow `.github/workflows/publish-with-recording-seo.yml`:

1. Runs on a push to `main`, on manual request, and approximately every six hours (GitHub schedules may be delayed).
2. Reads the current approved active catalog and rejects empty or invalid payloads.
3. Generates public HTML and a fresh sitemap in `_site/`.
4. Copies the existing public static website into the artifact. The old record snapshots are **not** copied: only `recording/index.html` is retained for legacy links, then active pages are regenerated.
5. Uploads the artifact and deploys it to GitHub Pages. An archived recording automatically disappears from the next successful build and its sitemap entry is removed. Journal history stays in Supabase and is unaffected.

This is scheduled synchronization, **not an instantaneous database-change webhook**. Editors can manually run the workflow in GitHub Actions after an urgent catalog change.

## One-time setup required

The site currently uses GitHub Pages **Deploy from a branch**. GitHub's documented behavior is that commits made by a workflow using its default `GITHUB_TOKEN` will not trigger a branch-based Pages build. We therefore use a direct artifact deployment workflow.

In `crespen/world-music-experiment`:
- Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
- Open **Actions → Publish Earth to Ear with recording SEO pages → Run workflow** on `main`.
- Verify both **build** and **deploy** succeed and that `https://earthtoear.com/recording/afr-0028/` shows the actual archival content.
- Submit `https://earthtoear.com/sitemap.xml` in Google Search Console after validating domain ownership. Sitemap submission requests crawling; it cannot guarantee indexing.

Until the Pages setting is changed, the committed HTML snapshot is still published by the existing branch source, but **future automatic rebuilds are not guaranteed to deploy**. Do not call ongoing SEO fully operational until the GitHub Actions deployment passes.

## Quality and privacy gates

- Only source records with `active=true`, a valid recording ID, title, performer credit, country, contextual description, and HTTP(S) source URL are accepted.
- Catalog data is HTML-escaped and JSON-LD script characters are escaped; no private contributor tables are queried.
- Automated tests are at `scripts/test-recording-pages.mjs` and run before every deployment.
- Each recording's distinct context must remain original and credible. Do not fabricate musician identities or imply endorsement by an external host.
- Periodically verify source links and search behavior. Static page publication does not establish a legal right to reproduce the original audio.

## Future additions

New approved recording in `music_catalog` → next successful workflow → new crawlable page and sitemap entry. Updated record → page content and metadata refresh. Inactivated record → page excluded and sitemap entry removed on next Actions deployment.

Individual artist profiles and historic musical journeys can receive their own structured search pages when justified by substantive original content; they are **not** automatically created from names alone.

## References

- GitHub Pages publishing sources: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Custom Pages workflow: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
