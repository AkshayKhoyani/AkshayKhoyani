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
eligibility (one of: high school, associate degree, bachelor degree, professional certificate, postgraduate degree), salary_min/max when known.
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
