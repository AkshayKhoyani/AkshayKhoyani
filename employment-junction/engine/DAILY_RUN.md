# Content run – what the scheduled task does (every 4 hours, 24×7)

Goal: everything new since the previous run (about 4 hours) goes on the site in this run, and the site never sits idle.
Daily targets (across all runs): **5–10 new/updated pages in each section** — Jobs, Admit Card, Result, Answer Key, Syllabus/Exam Date.

1. `git fetch origin claude/employment-junction-website-p8ywzx && git checkout claude/employment-junction-website-p8ywzx && git pull`.
2. Read `SEO_PLAYBOOK.md` and `PENDING.md`. Do every PENDING item whose information is now out.
3. Scan everything since the previous run (≈ last 12 hours; first run of the day covers the night) (WebSearch, standard mode; several searches in parallel):
   new notifications, admit cards, results, answer keys, exam dates/schedules, syllabus, date extensions/corrigenda.
4. **Before writing anything**, list what the site already has (titles + slugs) for ej_job, ej_admit_card, ej_result, ej_answer_key, ej_syllabus, ej_schedule
   (`GET /wp-json/wp/v2/<type>?per_page=100&_fields=id,slug,title`). An earlier run may already have published the same item — never duplicate; update instead.
5. Publish what is new — aim for 8–12 pages per run, and **at least 1–2 in every section** (Jobs, Admit Card, Result, Answer Key, Syllabus/Exam Date) whenever something exists for it. Spend the time saved from reels on more and better pages, and on updating existing pages (date extensions, admit card/result links added to job pages):
   - Jobs: full spec like `jobs/dsssb-je-mts-2026.json` → `python3 wp.py jobs/<f>.json --status publish`.
   - Admit card / result / answer key / syllabus: write `updates/<slug>.in.json` like the existing ones, `python3 updates/make.py updates/<slug>.in.json`, then `python3 wp.py updates/<slug>.json --status publish`.
   - When an admit card/result/answer key belongs to a job we already have, also add a "Latest Update: … (link)" line at the top of that job's spec intro and re-publish it with `--update <id>`.
6. No reels. (Owner decision 25 Nov 2026: put the whole effort into the website.)
6b. **Saturdays (first run of the day):** update the evergreen page `/employment-news-this-week/` (page id 2336) with the new Employment News issue – top jobs table (org, posts, vacancies, last date, link to our page or official site). Create full job pages for the biggest new ones. Use aggregator lists (e.g. schools360.in/employment-news-of-this-week) for the job list; never re-host the Employment News PDF (copyrighted).
7. Run `python3 hubs.py` (takes ~5 min): refreshes the qualification hubs (10th/12th/ITI/Diploma/Graduate/PG), state hubs, the "Related Updates" box on every page and the Hindi summary on every job page. New states get their page automatically. Then add follow-ups to `PENDING.md`. Commit and push.
8. Report (Hinglish, short): published/updated links per section, anything blocked. If nothing new was found, say so in one line.

Retention: never delete anything published less than 1 year ago. Pages older than 1 year may be moved to Trash (not permanently deleted), at most one batch per month, listed in the report.


## When there is little or no new government-job news in this run
Never end a run with nothing done. Pick from this list (top first) until the run has 6–10 useful changes:
1. Update existing pages: date extensions, corrigenda, admit card / answer key / result links added as "Latest Update" on the job page, expired last dates noted.
2. Fill "see official notification" gaps (fee, age, category-wise vacancy) on recent job pages now that official sites are reachable.
3. Add new mock tests: new Reasoning/Maths sectional tests with new generator seeds (answers are computed, always safe), and new full mocks for exams that have open jobs but no full mock yet (add to SECTIONAL / FULL / EXAMS in mock/build_tests.py, run it, then hubs.py). Only add GK/Science/Polity questions to mock/banks.py if they are well-established static facts.
4. Syllabus / exam-pattern pages for open recruitments that do not have one yet.
5. Previous-year cut-off pages for big exams (official figures only).
Then run hubs.py for the changed pages and report.
