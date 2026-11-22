# ReelKit: JSON se reel (Finance Junction daily reels)

Ek reel = ek folder + `spec.json`. Baaki sab ek command karti hai:
```bash
cd videos/engine && npm install            # pehli baar (render server ke liye three.js bhi yahin)
python3 videos/engine/make_reel.py <reel_dir> --preview 0,5,12   # PNG previews (<reel_dir>/p_*.png)
python3 videos/engine/make_reel.py <reel_dir>                     # voice + music + MP4 + checks
```
Output JSON line: `{"out": ..., "duration": ..., "voice": "el"|"oa", "flat_frames_at": []}`
(`flat_frames_at` khaali hona chahiye.)

## Voice
- ElevenLabs Jessica (word timestamps → karaoke captions) jab tak monthly quota bacha hai.
- Quota khatam → automatically OpenAI TTS (`nova`). `--force-openai` se zabardasti OpenAI.
- Har scene ka `voice` = tokens `tts|caption`. TTS Devanagari (sahi uchcharan), caption Roman Hinglish.
  `_` = space. Same word dono mein ho to bina `|` (jaise `UPI`, `SIP`).

## Reel rules (growth plan se)
- 16–30 sec. **Pehla scene `hook`** (first frame par poora text dikhta hai = cover).
- Aakhri scene `cta`, voice: "Finance Junction follow karo…" + **loop line** jo pehli line se jude.
- Har number ka source `sources` mein. Andaaza ho to "andaaza, guaranteed nahi" likho.
- Ek reel = ek idea.

## Scene types
| type | fields |
|---|---|
| `hook` | `tag`, `tagColor`, `lines` ([[text,color],…]), `emoji`, `sub`, `size` |
| `stat` | `tag`, `title`, `label`, `value`, `decimals`, `prefix`, `suffix`, `color`, `note`, `noteColor`, `chips` [..], `source` |
| `formula` | `tag`, `title`, `lines` (aakhri line highlight), `source` |
| `compare` | `title`, `subtitle`, `items` [{label, sub, value, display, color}], `winner` (index), `winnerText`, `source` |
| `list` | `title`, `items` [[head, sub],…] (max 4), `icons`, `colors`, `source` |
| `chart` | `title`, `series` [{label, color, points[], end}], `xticks` [[i,label]], `xlabel`, `ymax`, `source` |
| `phone` | `tag`, `title`, `header`, `bubbles` [[line,…],…], `stamp`, `stampColor`, `bottom`, `bottomColor` |
| `mythfact` | `title`, `myth`, `fact` (string ya lines), `source` |
| `cta` | `top`, `topSub`, `cta`, `disclaimer` |

Colors: `text gold gold2 green green2 red red2 blue cyan amber muted` ya hex.
Common: `min` (scene ki minimum length, sec).

Examples: `videos/daily/samples/*/spec.json`
