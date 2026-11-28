# Employment Junction – automatic reels + Instagram (worker procedure)

Approved format = `04-dsssb-cast-sample` (owner: "ek number reel"). Copy its structure for every reel.

## A. Reel run (2 per day)
1. `git fetch origin claude/employment-junction-website-p8ywzx && git checkout claude/employment-junction-website-p8ywzx && git pull`.
2. Pick the topic: the newest high-interest item on employmentjunction.in that has no reel yet (check `POSTED.json`):
   big vacancy count, popular exam (SSC, Railway, Police, Bank, Teaching, state jobs), admit card/result of a big exam.
   Read the page (`/wp-json/wp/v2/<type>?slug=...`) — every fact in the reel must come from the page / official notification.
3. New folder `reels/NN-<slug>/` with `script.json` + `scene.html` (copy 04 and edit):
   - 30–38 sec, 5 scenes, ≤ 40 sec total. Hindi (Devanagari) + English words, numbers spelled the way they are spoken.
   - `speakers` = one cast member per scene; each speaks in its own voice (brand/voice.py `CAST_VOICES`):
     naukri_bhaiya (opens + CTA), exam_didi (eligibility/syllabus), anchor_rohan (fee/last date/alerts), mummy_ji (reminder),
     plus the job-category character when it fits: daroga_ji (police), fauji_bhai (army), bank_babu (bank), engineer_bhai (JE/PSU),
     nurse_didi (medical), station_master (railway). Never the robot or Result Chacha (owner removed them).
   - Per-scene 3D backgrounds: `theme: 'scene_park' | 'scene_tuition' | 'scene_news_studio' | 'scene_home' | 'scene_office' | …`
     (files in brand/backgrounds/). Text/cards only in the top half (y < 1000), characters stand in the lower half
     (`person(t, who, at, 540, 1880, 1.85, …)`) so faces are never covered.
   - Last scene: `commentCTA(t, 0.05, '<KEYWORD>', 300)` + `endCard` and the line "Comment में <KEYWORD> लिखो, link आपके DM में आ जाएगा".
     Put `keyword` and `link` (the website post URL) in script.json.
4. `python3 brand/voice.py <dir>` → `python3 brand/music.py <dir>/music.wav <secs>` → preview (`node brand/render.js <dir> --preview 2,9,17,25,33`)
   → look at the PNGs (faces visible? text readable?) → `node brand/render.js <dir>` (mp4 must be < 20 MB).
5. `caption.txt`: hook line, 4–5 fact bullets, "Comment mein <KEYWORD> likho, link DM mein", website, 8–10 hashtags.
6. Commit + push, then publish: `cd employment-junction/reels && python3 brand/ig_post.py <dir>/<mp4> <dir>/caption.txt --publish`
   (writes POSTED.json — commit + push again).
7. Report in Hinglish: reel name, IG link, any problem.

## B. Comment → DM run (every hour)
`cd employment-junction/reels && python3 brand/ig_comments.py` — answers new comments on reels from the last 7 days:
DM with the post link (private reply) + a short public reply. Report only if something was answered or failed.

## Accounts (keep separate — never mix)
- Employment Junction Instagram: id 17841404202078715, token on **graph-video.facebook.com** (brand/ig_post.py, ig_comments.py).
- Finance Junction: graph.facebook.com — do not touch.

## Rules
- Website images use the original 3D AI characters; the code cast is for reels only.
- No OpenAI/Gemini. ElevenLabs only for voices. Max 2 reels/day. Facts only from the website page / official notification.
