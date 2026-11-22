# Finance Junction 3D Explainer Engine

Aage ki saari Finance Junction videos isi style mein banti hain: low-poly 3D sheher, lagataar
smooth camera movement, callouts, karaoke captions, HUD widget aur brand overlays.
(Style reference: user ka diya hua 3D explainer video, rang Finance Junction ke navy + gold.)

## Style rules
| Element | Rule |
|---|---|
| World | Low-poly, flat shading, halke warm rang (cream ground, grey/beige buildings), door ka hissa haze/fog mein |
| Brand rang | Navy `#0b2545` / `#16325c` (banks, hub), Gold `#d4a62c` (road edges, money packets, highlights) |
| Camera | Ek hi world, koi hard cut nahi. Keyframes voiceover lines se bandhe (`L(i)`, `E(i)`, `A(i, f)`) |
| Callouts | Safed pill + kaali outline, elbow leader line, anchor dot (blue = log, gold = bank/hub, green = success) |
| Captions | Neeche dark pill, 3–4 shabd, karaoke (bola hua safed, aage ka grey), ElevenLabs word timings se |
| HUD | Captions ke upar dark box: rangeen bar + bada value + chhota label |
| Brand | Upar-left FJ badge (intro mein bada, phir chhota), upar-right `simplified` tag, end card mein full logo + "Follow karo 🔔" |
| Voice | ElevenLabs Jessica, 1.12x; last line hamesha "…Finance Junction ko follow karo!" |
| Facts | Har number ka source; end card ke note mein data source likho |

## Nayi video banane ke steps
```bash
cd videos/engine && npm install          # pehli baar (three.js)
mkdir videos/05-mera-topic                # index.html + script.json + scene.js (04 folder copy karo)
python3 videos/engine/voice.py videos/05-mera-topic          # voiceover + timeline.json + voice.wav
python3 videos/engine/music.py videos/05-mera-topic/music.wav <total>   # total = timeline.json
node videos/engine/render3d.js videos/05-mera-topic --preview 2,10,20  # PNG previews
node videos/engine/render3d.js videos/05-mera-topic                    # final MP4
```

### script.json
Har line ke tokens `tts|caption` format mein: TTS ke liye Devanagari (sahi uchcharan),
caption ke liye Roman Hinglish. `_` = space. Jo token dono mein same ho (jaise `UPI`), bina `|` ke likho.
`min` se kisi line ko animation ke liye lamba rakh sakte ho.

### scene.js building blocks (`engine/fj3d.js`)
- `buildCity`, `addBank`, `addHub`, `addStall`, `addPerson`: world
- `cameraPath(keys)`: smooth camera (Catmull-Rom)
- `arc(a, b, t0, t1)`: chamakta paisa/data packet jo arc par udta hai
- `callout`, `ping`, `hud`, `bigText`, `captions`, `brandBadge`, `tag`, `endCard`, `progressBar`: overlays
