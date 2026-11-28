# Employment Junction – automatic reels + Instagram (worker procedure)

Format = **skit** like `06-afcat-skit` (copy its script.json + scene.html for every reel).
Owner feedback (28 Nov): "नमस्ते दोस्तों" style openings kill the reel (high skip rate, low views) and the photo backgrounds looked wrong.
So: a hook in the first second, a small story between characters, and live clay-3D backgrounds that match the story.

## A. Reel run (2 per day)
1. `git fetch origin claude/employment-junction-website-p8ywzx && git checkout claude/employment-junction-website-p8ywzx && git pull`.
2. Pick the topic: the newest high-interest item on employmentjunction.in that has no reel yet (check `POSTED.json`):
   big vacancy count, popular exam (SSC, Railway, Police, Bank, Teaching, state jobs), admit card/result of a big exam.
   Read the page (`/wp-json/wp/v2/<type>?slug=...`) — every fact in the reel must come from the page / official notification.
3. New folder `reels/NN-<slug>/` with `script.json` + `scene.html` (copy 04 and edit):
   - **≤ 39 sec total**, 6–8 short scenes (one speaker turn each, 1–2 sentences). Hindi (Devanagari) + English words,
     numbers spelled the way they are spoken. `"model": "eleven_v4"`, `"speed": 1.2`.
   - **Hook (scene 1, first 1–2 sec)**: NEVER "नमस्ते दोस्तों" / "आज हम बात करेंगे" / channel intro. Open on a shock line from a
     character + the biggest number on screen (salary, posts, "10th pass", last date), e.g.
     "[shocked] माँ! सिर्फ graduation पे... छप्पन हज़ार की salary?!" or "[whispers] सिर्फ तीन दिन बचे हैं और किसी को पता ही नहीं..."
   - **Story**: doubt → answer → facts → twist → CTA. Example: student shocked → mummy doubts ("सिफ़ारिश लगती है") →
     job character answers (posts) → exam_didi (eligibility) → anchor_rohan (fee + last date, urgency) → mummy flips
     ("तो बैठा क्यों है? Form भर!") → student CTA. Vary the pair (dost-dost, papa-beta, didi-bhai, teacher-student) so reels don't repeat.
   - Emotion tags at the start of a line: [shocked] [laughs] [excited] [whispers] [sighs] — 3–4 per reel, not every line.
   - `speakers` = one per scene (brand/voice.py `CAST_VOICES`): student, mummy_ji, naukri_bhaiya, exam_didi, anchor_rohan,
     plus the job-category character: daroga_ji (police), fauji_bhai (army), airforce, navy_sailor, bank_babu / bank_madam (bank),
     engineer_bhai (JE/PSU), nurse_didi / doctor (medical), station_master / tt_babu (railway), teacher_sir (TET/KVS),
     clerk_babu (SSC/clerk), forest_guard, postman (India Post/GDS), patwari (revenue/talati), anganwadi_didi, fireman, pilot,
     judge (judiciary), scientist (DRDO/ISRO), lady_constable (mahila police), computer_operator, driver, sarkari_officer (UPSC/PSC).
     Never the robot or Result Chacha (owner removed them).
   - Dialogue scenes: 2 characters on screen (`person(t, a, 0, 330, 1880, 1.6, …)` + `person(t, b, 0, 760, 1880, 1.6, {flip: true, …})`),
     only the speaker has `talk`, the other reacts with a mood (shock / worried / happy / think / point / thumbs). Fact scenes: one character
     centred at scale 1.85. Text/cards only in the top half (y < 1000) so faces are never covered.
   - **Backgrounds = live clay 3D** (brand/clay3d.js), matched to the story, per scene `theme: 'clay_<key>'`:
     home, street, classroom, exam_hall, police_station, railway, bank, govt_office, hospital, army_camp.
     Use 3–4 different ones per reel; the job's own world for the "answer" scene (police → police_station, railway → railway, bank → bank,
     defence → army_camp, teaching → classroom, medical → hospital, others → govt_office). Old `scene_*` photo backgrounds: don't use.
   - Last scene: `commentCTA(t, 0.05, '<KEYWORD>', 300)` + `endCard` and the line "Comment में <KEYWORD> लिखो, link सीधा आपके DM में!"
     Put `keyword` and `link` (the website post URL) in script.json; give the last scene `design` ≥ 6.2 so the end card shows after the line.
4. `python3 brand/voice.py <dir>` (total must be ≤ 39 s, else shorten lines) → `python3 brand/music.py <dir>/music.wav <secs>` →
   preview (`node brand/render.js <dir> --preview 1.5,7,13,19,25,31,36`) → look at the PNGs (faces visible? text readable?) →
   `node brand/render.js <dir>` (live 3D = slow, ~30–40 min: run it in the background; mp4 must be < 20 MB).
5. `caption.txt`: the same hook as the reel's first line (no "Namaste"), 4–5 fact bullets, "Comment mein <KEYWORD> likho, link DM mein", website, 8–10 hashtags.
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
