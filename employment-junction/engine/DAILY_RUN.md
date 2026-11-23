# Daily run – what the scheduled task does

1. `git fetch origin claude/employment-junction-website-p8ywzx && git checkout claude/employment-junction-website-p8ywzx` (all engine code lives on this branch).
2. Read `SEO_PLAYBOOK.md` and `PENDING.md`.
3. Do every PENDING item whose information is now available (update the existing page with `python3 wp.py jobs/<spec>.json --status publish --update <id>`; never create a duplicate).
4. Research what came out in the last ~24 hours (WebSearch, standard first): new recruitment notifications, admit cards, results, answer keys, exam dates, date extensions/corrigenda. Prioritise big all-India and Gujarat/UP/Bihar/Rajasthan/MP/Delhi/Uttarakhand state jobs.
5. List what is already on the site before writing: `GET /wp-json/wp/v2/ej_job?per_page=100&_fields=id,slug,title` (and ej_result, ej_admit_card, ej_answer_key, ej_syllabus). Skip anything already covered; update instead.
6. Publish 3–6 new pages per run following the playbook (facts confirmed by ≥2 sources; anything unconfirmed says "see official notification"). Results/admit cards/answer keys go to their own post types and must be linked from the job page ("Latest Update" line at the top).
7. For the 1 biggest new item, make a reel in `employment-junction/reels/` with the existing engine (voice.py → music.py → render.js) and write its caption README.
8. Add new follow-ups to `PENDING.md`.
9. Commit and push to the branch. End with a short Hinglish report: what was published (links), what was updated, which reel was made, anything blocked.

Retention: never delete anything published less than 1 year ago. Pages older than 1 year may be moved to Trash (not permanently deleted), one batch per month at most, and listed in the report.
