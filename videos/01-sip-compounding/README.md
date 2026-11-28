# Short #1 — ₹5,000 SIP, 20 saal mein kitna?

Vertical (1080×1920) ~47-second Hinglish finance Short.

- `scene.html` — saari animation (canvas, time-based). Text/numbers yahin edit karo.
- `music.py` — royalty-free background music generate karta hai.
- `voiceover.py` — ElevenLabs (Jessica) se har scene ka Hinglish voiceover + `timeline.json`.
- `render.js` — frame-by-frame render + ffmpeg se MP4.

```bash
python3 voiceover.py                 # vo/*.mp3, timeline.json, voice.wav
python3 music.py music.wav 47.18      # duration = timeline.json ka total
node render.js                       # -> sip-compounding-short.mp4
node render.js --preview 5,14,27     # sirf kuch frames ki PNG preview
```
