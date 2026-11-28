# Employment Junction – SEO Playbook

Every page the engine publishes must meet this list. The publisher (`wp.py`) enforces the structural parts.

## Where content goes
| Content | Post type | URL | Schema |
|---|---|---|---|
| New recruitment | `ej_job` | /jobs/… | JobPosting (Google for Jobs) |
| Result | `ej_result` | /results/… | Article |
| Admit card | `ej_admit_card` | | Article |
| Answer key | `ej_answer_key` | | Article |
| Syllabus / exam pattern | `ej_syllabus` | | Article |

One recruitment = one main URL. When the admit card, answer key or result comes out, publish it on its own page **and** add an "Latest Update" line + link at the top of the job page (and update `modified`), so both pages stay fresh and interlinked.

## Title & meta
- Title: `<Org> <Post> Recruitment 2026 – Apply Online for <N> Posts` (put the year, number and "Apply Online"; ≤ 65 chars for the SEO title).
- SEO title ends with `| Employment Junction`.
- Meta description ≤ 160 chars: posts, qualification, selection, last date.
- Focus keyword = how people search: `<short org> <post> Recruitment 2026`.
- Slug: short, keyword-first, no dates beyond the year.

## Page structure (one H1 only — the theme prints the title)
1. Summary lines (post date, organization, advt no, job type, mode)
2. 2 intro paragraphs with the keyword in the first 100 words
3. Overview table
4. Vacancy details (category-wise UR/OBC/SC/ST/EWS when the PDF is available)
5. Eligibility
6. Age limit + **category-wise relaxation table**
7. **Category-wise application fee table** + payment mode
8. **Important dates table**
9. Selection process
10. How to apply (numbered)
11. **Important Links table**: Apply Online, Official Notification PDF, Official Website
12. FAQ (6–10 real search questions)
13. Final words with Instagram link + disclaimer

## JobPosting fields (must be filled on every `ej_job`)
org_name, post_name, vacancies, employment_type (FULL_TIME / TEMPORARY for apprentices), date_posted, start_date, last_date,
valid_through (YYYY-MM-DD; expired jobs drop out of Google for Jobs), location, state_name, apply_url, notification_url,
eligibility (one of: high school, associate degree, bachelor degree, professional certificate, postgraduate degree), **salary_min / salary_max (monthly ₹) whenever the pay level or pay scale is confirmed** — Google recommends baseSalary and shows it in Google for Jobs (schema audit 25 Nov 2026: 18 of 28 job pages lacked it).
`schema_description` = full plain description (eligibility, selection, fee, dates) — Google needs the full job text.

## Accuracy rules
- Never guess fees, ages or vacancies. If a figure is not confirmed by the official PDF or ≥ 2 independent sources, write "see official notification".
- Always link the official PDF, never a mirror.

## Freshness
- Publish within hours of a notification; update the same URL for corrigenda / date extensions and say so at the top ("Updated on …").
- Featured image 1536×1024 (Discover needs ≥ 1200 px wide; robots meta already allows large previews).

## Old posts – retention rule (owner's decision, 23 Nov 2026)
- Posts/jobs **less than 1 year old: keep**, even if the last date has passed (they still bring search traffic). Do not delete or rewrite them.
- Posts/jobs **more than 1 year old** (by publish date) **may be moved to Trash**. Prefer keeping any that still get traffic or have a newer cycle we can link to.
- Expired jobs drop out of Google for Jobs automatically via `valid_through`; the page itself stays.

## Schema setup (cleaned 23 Nov 2026)
- Single source of structured data: **EmploymentJunction SEO Suite** (Organization, WebSite, BreadcrumbList, JobPosting, Article, FAQ).
- Schema Pro plugin: **deactivated** (it emitted an invalid "News Media Organization" type and empty blocks).
- Rank Math: schema ("rich-snippet") module **off**; Rank Math still handles titles, meta descriptions and sitemaps.
- Do not re-enable either without checking for duplicate schema.

## Speed (25 Nov 2026)
- Featured images are **JPEG q82** (~100 KB), never PNG (old PNGs were ~1.4 MB each; 81 converted).
- Site logo uses the optimized 18 KB PNG (media 2105); the old logo media is kept for rollback.
- After bulk media changes, purge the whole WP Rocket cache by re-saving a menu (`POST /wp/v2/menus/56 {"name":"Main Menu Header"}`), then check pages for broken images.
- Ad Inserter Pro: **deactivated** 25 Nov 2026 (no ads were running; it injected 78 KB of inline JS on every page). Re-activate only when ads go live.
- Open items for the owner (plugin settings not reachable by API): two GA4 tags + a GTM container load on every page (Site Kit analytics-4 `GT-5D4X6LR9`/`G-F7TTYZX49J` and tagmanager `GTM-NP78SP9S`) — check GA4 for double-counted page views; WP Rocket lazy-loads the LCP featured image — add `wp-post-image` to LazyLoad excluded images.

## Featured images (premium, from 27 Nov 2026)
- Template `featured.html`: dark navy premium layout + a **3D cartoon character** matching the post (`assets/characters/*.webp`, made once with OpenAI gpt-image-1.5, transparent).
- Characters: engineer, police, railway, teacher, medical, bank, office, defence, apprentice, student_result, admit_card, answer_key.
- `wp.py` picks the character automatically from post type and title keywords (see `CHAR_RULES`); override with `"image": {"character": "police"}` in the spec. Accent colour follows the character (`THEME`), or set `"theme"`: gold / green / sky / rose / violet.
- Keep the headline short (2 lines) so it does not run into the character; max 4 chips.

## Hub pages & internal links (27 Nov 2026)
- `hubs.py` builds and refreshes: qualification hubs (`/10th-pass-govt-jobs/` … `/post-graduate-govt-jobs/`), state hubs (`/<state>-govt-jobs-2026/`, `/central-govt-jobs/`),
  a "Related Updates" box on every content page (same organisation: job ↔ admit card ↔ answer key ↔ result) and a Hindi summary on every job page.
- Footer menu (id 162, location `footer`) links the six sections, the qualification hubs, the main state hubs and the legal pages.
- Legal pages for AdSense: /privacy-policy/, /disclaimer/, /terms-and-conditions/.
- Rank Math sitemap file cache is disabled by the mu-plugin `wp-content/mu-plugins/ej-sitemap-fresh.php` (added 27 Nov 2026) – the cache never refreshed for REST-created posts. Keep it.

## Mock tests (27 Nov 2026)
- Engine: `mock/quiz.js` + `mock/quiz.css`; tests built and published by `python3 mock/build_tests.py` (post type ej_test, URL /mock-test/<slug>/). JS and data are base64-embedded because WordPress auto-paragraphs break inline scripts.
- Reasoning & Maths questions are generated by `mock/gen.py` (answers computed); GK/Science/Polity/Gujarat/Computer/English/Hindi come from `mock/banks.py` (hand-checked static facts only).
- `hubs.py` adds the animated "FREE MOCK TEST AVAILABLE" banner (top), a compact CTA (bottom) and a floating button to every job/admit card/answer key/syllabus/exam date/post page, matched to the exam by `mock/highlight.py` rules, and rebuilds the hub page /free-mock-test/.
- Header menu (id 56) has a highlighted 🎯 Free Mock Test item; featured images of job pages show a MOCK TEST FREE ribbon.
- To add tests: extend banks/generators and the SECTIONAL/FULL/EXAMS catalog in build_tests.py, run it, then run hubs.py.

## Cost rule (owner, 27 Nov 2026) – STRICT
- **Never call OpenAI, Gemini or any other paid AI/image API** (api.openai.com, generativelanguage.googleapis.com, etc.). No new AI images, no AI text generation, no AI voice.
- Featured images are rendered locally from `featured.html` with the existing character library in `assets/characters/` only.

## Premium page & image design (27 Nov 2026)
- `wp.py render()` outputs the premium layout: Quick Summary card (6 key tiles + Apply / Notification / WhatsApp buttons), styled tables (`.ejp-t`), icon H2s, Important Links buttons, share box. All CSS is one inline line (`PCSS`).
- `featured.html` v2: bold thumbnail style – sunburst rays, yellow slash, NEW VACANCY / RESULT OUT sticker, big POSTS burst, APPLY NOW button, 3 white chips (last date red), mock-test badge, character with white outline.
- `upgrade.py` converts older pages to this layout and re-renders their images from their own data.

## Network (27 Nov 2026)
- The cloud environment now has unrestricted internet. **Read the official notification / official website directly first** (curl or Playwright), then use aggregators only to cross-check. Some state portals (e.g. ojas.gujarat.gov.in) still refuse foreign servers – fall back to ≥2 secondary sources there.
- Hostinger file access is available through the Hostinger connector in interactive sessions (account u311135737, site root public_html) for mu-plugins/theme files; scheduled runs must not change plugins/themes/settings.

## Official notification links (owner rule, 27 Nov 2026)
- Every "official notification / notice / advertisement" mention in a post links to the **official notification PDF itself**, never just the board homepage.
- Spec `links` must contain a `Notification` entry whose URL is the direct official PDF (verify: file starts with `%PDF`). `wp.py` mirrors it into our media library (`notif.mirror_pdf`) and adds a "📥 Notification PDF Download" button; `render()` auto-links every mention (`notif.link_notifications`).
- If the official site has no direct link (only a listing page / blocked), download the PDF wherever the board publishes it, put its local path in spec `notification_pdf`, and the mirror becomes the link.
- `engine/notif_apply.py` re-applies this to already-published posts from research results.

## Featured images
- Every image carries the **official Employment Junction logo** (`engine/assets/logo.webp`, top-left on a white card). Never the old "EJ" box.

## Homepage / theme
- Theme files patched (backups in `theme-patch/orig/`): `front-page.php` (newest-first across all sections, live ticker, last-date countdown, tabs, mock-test banner, hubs), `single.php` (related = same section), `sidebar.php` (CPT-based), `inc/breadcrumbs.php` (Home › Section › Title instead of "Archives"). Upload with `theme-patch/up.sh` after `php -l`.
