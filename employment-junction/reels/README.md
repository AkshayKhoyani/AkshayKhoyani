# Employment Junction – Reels

Sarkari job updates ki vertical reels (1080×1920), Finance Junction wale pipeline jaisa: canvas motion graphics + ElevenLabs Hinglish voiceover + generated background music.

| # | Reel | Length |
|---|---|---|
| 01 | [RRC NR Apprentice – 4,651 posts](01-rrc-nr-apprentice/) | 65s |
| 02 | [DSSSB MTS & JE – 1,260 posts](02-dsssb-mts-je/) | 56s |

## Nayi reel kaise banayein
1. `01-rrc-nr-apprentice/` copy karein.
2. `script.json`: har scene ki voiceover line (`lines`) aur design length (`design`).
3. `scene.html`: `SCENES` array mein har scene ka `draw(t)`. Helpers `brand/ej.js` mein hain (`words`, `pill`, `card`, `counter`, `stamp`, `check`, `endCard`, …). Animation timings design length ke hisaab se likhein; voice lambi ho to engine unhe khud stretch kar deta hai.
4. `python3 brand/voice.py <dir>` → `python3 brand/music.py <dir>/music.wav <total>` → `node brand/render.js <dir>`
   (preview: `node brand/render.js <dir> --preview 2,10,20`)

## Comment-keyword CTA (every reel)
The last scene must be `commentCTA(t, 0.05, '<KEYWORD>', 300); endCard(t, 0.9);` and the last voice line must say
"… Comment में <KEYWORD> लिखो, link आपके DM में आ जाएगा …". Put `keyword` and `link` in script.json and add a row to `AUTO_REPLY.md`.
