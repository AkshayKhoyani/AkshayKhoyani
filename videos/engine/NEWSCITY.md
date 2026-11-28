# NEWS CITY template (Finance Junction ki main theme)

3D low-poly city + date gates ki "highway" + har news ke liye floating 3D prop + **Junction Bhai** cartoon anchor
(code se bana, AI image nahi) + karaoke captions + FOLLOW/REPOST footer. Example: `videos/daily/2026-11-27/04-agle-hafte-4-dhamake/`.

## Ek reel banane ke steps (folder `videos/daily/<date>/<NN-slug>/`)
1. `index.html`: example folder se copy (sirf `<title>` badlo).
2. `script.json`: Bunty voice, `eleven_v4`, emotion tags. Format `engine/voice.py` mein. Line 0 = hook, aakhri line = CTA.
   Har stop ke liye ek line. Kul 30–45 sec.
3. `spec.json`:
```json
{
 "seed": 27,
 "hook": [["BADA HOOK TEXT 💣"], ["chhota sub-hook", "#ffffff", "#0b2545"]],
 "hookSub": "optional gold pill",
 "stops": [
  {"line": 1, "gate": ["DIN", "DATE", "SUB TEXT 📊", "#4ade80"],
   "prop": {"type": "gdp|chart|bank|us|jobs|oil|msci|globe|exchange", "dir": "up|down", "text": "MSCI", "closed": false},
   "label": "BOARD TEXT", "labelBg": "#166534",
   "hud": {"value": "7%+", "label": "chhota label", "color": "green|red|blue|gold"},
   "callouts": [{"text": "pill text", "at": 0.3, "color": "green", "dx": -160, "dy": -260}]}
 ],
 "mascot": [{"line": 0, "mood": "shock"}, {"line": 6, "mood": "thumbs", "to": 0.5}, {"line": 6, "mood": "wave", "at": 0.5}],
 "cta": "Follow karo 🔔",
 "endNote": "Sources ki chhoti line\nNot investment advice."
}
```
   Props: `gdp` (badhte bars), `chart` (up/down blocks + arrow), `bank` (RBI/bank + % ring), `us` (US building + flag),
   `jobs` (log), `oil` (barrels), `msci` (cube with text), `globe` (duniya ke markets), `exchange` (stock exchange; `closed: true` = shutter).
   Mascot moods: `talk` (default), `wave`, `point`, `shock`, `think`, `happy`, `thumbs`, `worried`.
   Green/up news → happy/point; girawat → worried/shock; sawaal → think; CTA → thumbs + wave.
4. `SOURCES.md` (DAILY_RUN.md ke source rules).
5. Build (folder `videos/` se):
```
python3 engine/voice.py <dir>            # ElevenLabs quota khatam ho to:  python3 engine/voice.py <dir> --silent
python3 engine/amp.py <dir>              # mascot lip-sync
python3 engine/music.py <dir>/music.wav <total>
python3 engine/sfx.py <dir>/music.wav <dir>/sfx.json     # whoosh har line par, pop har stop par (example dekho)
PREVIEW_DIR=<scratch> node engine/render3d.js <dir> --preview 0,<mid>,<end>   # PNG dekho
node engine/render3d.js <dir> --out <dir>/<slug>.mp4
```
6. Check: pehla frame hook dikhaye, text kate nahi, mascot kisi zaroori text ko na dhake, freezedetect (d=2.5) khaali.
   MP4 20 MB se kam (jsDelivr limit). Zyada ho to: `ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -c:a copy -movflags +faststart out.mp4`.
