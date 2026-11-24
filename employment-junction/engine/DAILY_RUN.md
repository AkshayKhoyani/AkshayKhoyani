# Content run – what the scheduled task does (3x daily: 07:43, 13:43, 18:43 IST)

Goal: everything new since the previous run (about 6–12 hours) goes on the site in this run.
Daily targets (across all runs): **5–10 new/updated pages in each section** — Jobs, Admit Card, Result, Answer Key, Syllabus/Exam Date.

1. `git fetch origin claude/employment-junction-website-p8ywzx && git checkout claude/employment-junction-website-p8ywzx && git pull`.
2. Read `SEO_PLAYBOOK.md` and `PENDING.md`. Do every PENDING item whose information is now out.
3. Scan everything since the previous run (≈ last 12 hours; first run of the day covers the night) (WebSearch, standard mode; several searches in parallel):
   new notifications, admit cards, results, answer keys, exam dates/schedules, syllabus, date extensions/corrigenda.
4. **Before writing anything**, list what the site already has (titles + slugs) for ej_job, ej_admit_card, ej_result, ej_answer_key, ej_syllabus, ej_schedule
   (`GET /wp-json/wp/v2/<type>?per_page=100&_fields=id,slug,title`). An earlier run may already have published the same item — never duplicate; update instead.
5. Publish what is new (aim for 6–12 pages per run, spread across all sections):
   - Jobs: full spec like `jobs/dsssb-je-mts-2026.json` → `python3 wp.py jobs/<f>.json --status publish`.
   - Admit card / result / answer key / syllabus: write `updates/<slug>.in.json` like the existing ones, `python3 updates/make.py updates/<slug>.in.json`, then `python3 wp.py updates/<slug>.json --status publish`.
   - When an admit card/result/answer key belongs to a job we already have, also add a "Latest Update: … (link)" line at the top of that job's spec intro and re-publish it with `--update <id>`.
6. Reel: one per run, for the biggest item since the previous run. Every reel ends with the comment-keyword CTA (see reels/README.md): pick a short UPPERCASE keyword, put `keyword` + the website `link` in script.json, add a row to `reels/AUTO_REPLY.md`, and put "Comment karo \"<KEYWORD>\" – link DM mein milega" in the caption README.
7. Add follow-ups to `PENDING.md`. Commit and push.
8. Report (Hinglish, short): published/updated links, reel, anything blocked. If nothing new was found, say so in one line.

Retention: never delete anything published less than 1 year ago. Pages older than 1 year may be moved to Trash (not permanently deleted), at most one batch per month, listed in the report.
