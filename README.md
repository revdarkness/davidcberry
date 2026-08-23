# davidcberry.com

The practitioner site. Security incidents, AI governance, and running production
infrastructure with no team and no budget.

**Stack:** Astro 5, static output, no adapter. **Host:** Cloudflare Pages.
**Scaffolded:** 2026-08-22, replacing the two hand-written HTML pages built 2026-07-30.

---

## Why this is its own repo

It used to live inside `PersonalAssistant/projects/davidcberry-site/`, where the
deploy instructions carried a standing warning never to run a deploy from the repo
root, because that would publish context files, the decision log, and credential
references.

Splitting it out **removes that hazard structurally instead of relying on
discipline**. Nothing in this repo is private. Same call that was made for ANVIL.

---

## Local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview  # serve dist/ locally
```

Node 24, npm 11. No other tooling required.

**Commit identity is set repo-locally** to `14030456+revdarkness@users.noreply.github.com`.
GitHub rejects pushes that would publish the account's private email, and this repo
is public. If a commit here ever fails to push with `GH007`, the identity was
overridden somewhere; do not disable the protection, fix the address.

---

## Writing a post

Drop a markdown file in `src/content/writing/`. The filename is the URL:
`src/content/writing/my-post.md` becomes `/my-post/`.

Two templates are in there already, both marked `draft: true`:

| File | For |
|---|---|
| `template-essay.md` | The long pieces. Threat, decision, implementation, verification, residual risk. |
| `template-reading-note.md` | "I read something and want to think out loud." Three or four paragraphs is a complete note. |

Copy one, rename it, replace the frontmatter. The full field reference is in the
comment at the bottom of `template-reading-note.md`, and the schema that enforces
it is `src/content.config.ts`.

**Frontmatter that matters:**

- `topic` is required and must be one of `cyber`, `ai-governance`, `career`, `reading`. Adding a topic means editing `TOPICS` in `src/consts.ts`; nothing else needs to know.
- `kind` is `essay` or `note`, defaulting to `essay`. Notes get a "Reading note" label and can carry a `source` block.
- `draft: true` renders in `npm run dev` at the real URL so you can read it in place, and is **not built at all** by `npm run build`. That is deliberate: filtering drafts only out of the list pages would still have leaked them into the sitemap.

A bad `topic` or a missing `title` fails the build with the file name and the
field. That is the schema doing its job, not a bug.

---

## URLs

Posts sit at the **site root** (`/student-data-stays-local/`), not under `/writing/`.
That preserves the URLs already baked into the two original pieces, their canonical
tags, and the old sitemap, so nothing published before this rebuild had to move.

`/writing/` is the index. `/topics/<topic>/` filters. `/rss.xml` is the feed.

---

## The two ported articles

`student-data-stays-local.md` and `ai-classroom-policy.md` were converted from
hand-written HTML. **Their bodies are still HTML inside the markdown file**, on
purpose: markdown passes block-level HTML straight through, so the port was
lossless and the custom `.lede-rule` and `.callout` blocks survived without anyone
having to re-read 400 lines to check. New posts should be written as real markdown.

---

## Deploy: Cloudflare Pages

**LIVE at https://davidcberry.com since 2026-08-23.** Push to `main` rebuilds it.

Chosen over Vercel because Vercel's Hobby plan forbids commercial use and this
domain's long-term job is undecided on that point. Cloudflare Pages allows
commercial use on the free tier, has no bandwidth cap, and adds no server to
patch. Pages rather than Workers: current guidance puts blogs and marketing sites
on Pages and reserves Workers for dashboards and APIs.

**One-time setup, as actually performed 2026-08-23:**

1. ~~Push this repo to GitHub as `revdarkness/davidcberry`.~~ **Done 2026-08-22:** https://github.com/revdarkness/davidcberry (public, `main`).
2. Cloudflare dashboard, **Compute (Workers & Pages) > Create**. This now lands on
   a **Create a Worker** screen; Pages is no longer the default path. Click the
   **"Looking to deploy Pages? Get started"** link under the method cards, then
   **Import an existing Git repository**. Taking "Continue with GitHub" from the
   Worker screen builds a Worker with static assets instead, which is a different
   product with a different custom-domain and config path.
3. Pick the repo. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: set `NODE_VERSION` to `24` if the default is older.
4. Deploy. You get a `*.pages.dev` URL immediately.
5. **Custom domains** > add `davidcberry.com` and `www.davidcberry.com`. DNS is
   already on Cloudflare, so the records are created for you. **Add the apex
   explicitly and confirm it reaches *Active*.** On the first pass only `www`
   activated; the apex was left with no A/AAAA record at all, so the hostname
   resolved to nothing while the site looked live on `www`. See the trap below.
6. Pick one canonical host and redirect the other. **Use the apex**, since
   `astro.config.mjs` sets `site: 'https://davidcberry.com'` and the sitemap and
   RSS absolute URLs are generated from it. Do **not** carry over stemageddon's
   `www`-only convention. Rules > **Redirect Rules**: hostname equals
   `www.davidcberry.com`, dynamic redirect to
   `concat("https://davidcberry.com", http.request.uri.path)`, 301, preserve
   query string.

After that it is push-to-deploy, with a preview URL per branch.

**The trap, and why it is worse here than on most sites:** `site:` in
`astro.config.mjs` is baked into every canonical tag, every `sitemap-0.xml`
entry, and every `rss.xml` link at build time. A working `www` with a dead apex
is therefore not a cosmetic alias problem: the site serves fine to a human on
`www` while every machine-readable URL it publishes points at a hostname that
does not resolve. Verify the apex itself, not just "the site loads."

**Verification, 2026-08-23.** All 9 sitemap URLs 200 on the apex; `rss.xml` and
`robots.txt` 200; unknown paths 404; `public/_headers` confirmed applied in the
response (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
Permissions-Policy). Re-run anytime:

```bash
for u in $(curl -sS https://davidcberry.com/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'); do
  printf "%-58s %s\n" "$u" "$(curl -sS -o /dev/null -w '%{http_code}' "$u")"
done
```

**Free tier headroom:** 500 builds/month (this needs roughly 12 to 20),
unlimited bandwidth, 20,000 files per site.

### Canonical host: apex, enforced 2026-08-23

`www.davidcberry.com` stays attached as a Pages custom domain (removing it would
delete the DNS record, so `www` would stop resolving and never reach the edge at
all). A zone-level **Redirect Rule** intercepts it before Pages is consulted:

- Rules > **Overview** > Create rule > Redirect rule. Redirect Rules is no longer
  its own sidebar entry. **Page Rules, sitting right next to it, is the deprecated
  legacy product** — do not use it.
- Filter: `http.host eq "www.davidcberry.com"`
- Action type: **Dynamic**, expression
  `concat("https://davidcberry.com", http.request.uri.path)`
- 301, **Preserve query string** checked

**Type must be Dynamic.** Static redirects every request to one fixed URL, which
would flatten `www/about/` onto the homepage — breaking nine URLs to fix one.

Verified: `www/` and `www/about/` 301 to the matching apex path, query strings
survive, resolution is **single-hop**, and the apex itself does not redirect (no
loop).

```bash
curl -sSL -o /dev/null -w "final: %{url_effective}  hops: %{num_redirects}\n" \
  "https://www.davidcberry.com/writing/?a=1"
# expect: final: https://davidcberry.com/writing/?a=1  hops: 1
```

### Headers

`public/_headers` is the Cloudflare equivalent of the old `vercel.json`. It carries
the same four security headers, the same one-week cache on `/assets/*`, plus a CSP
and an immutable cache on Astro's fingerprinted `/_astro/*` output.

Clean URLs and trailing slashes needed rules on Vercel. They do not here: Astro
emits `/slug/index.html` directly via `build.format: 'directory'`.

---

## Still to wire

1. **Domain email.** `david@davidcberry.com` does not exist. Every `mailto:` on the site points at it, including the one on `/about/`. Registrar-level forwarding is a two-minute fix and should happen before anyone is sent here.
2. **A headshot.** `src/layouts/Article.astro` uses the arc-reactor mark in the byline. There is a slot for a real photo.
3. **Analytics, if wanted.** Cloudflare Web Analytics is free, cookieless, and needs no consent banner. Nothing is installed today, which is the correct default.

## Deliberately not here

- **No pricing card, membership CTA, or newsletter form.** The old landing page had all three. They were dropped in this rebuild: the brand rule puts membership, courses, and anything commercial on stemageddon.com, and this site's job is the practitioner identity. Their absence is also what keeps the hosting question simple.
- **No comments, search, or pagination.** Ten to twelve posts a year does not need any of it.
- **No analytics by default.** See above.

## Related

- Content plan and publishing schedule: `PersonalAssistant/projects/content-calendar-linkedin/README.md`
- Original hand-written site, kept for reference: `PersonalAssistant/projects/davidcberry-site/`
