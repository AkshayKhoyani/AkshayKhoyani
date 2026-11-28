# Employment Junction – Brand Characters (Character Bible)

Four recurring mascots appear on every featured image, mock test, homepage block and reel, so people recognise the brand at a glance (same idea as the Finance Junction reel characters).
Colours always follow the brand: royal blue `#0b3d91`, orange `#ff7a00`, white, with a small orange badge on the chest.

| Character | Who | Personality / catchphrase | Appears on |
|---|---|---|---|
| **Naukri Bhaiya** (Raju) | Friendly 25-year-old, light-blue shirt, backpack, phone in hand | Energetic big brother who brings every new vacancy first. *"Nayi bharti aa gayi! Jaldi apply karo!"* | New jobs (ej_job), homepage hero, reels intro |
| **Exam Didi** (Priya) | 27-year-old teacher type, round glasses, blue kurta + orange dupatta, book & pencil | Calm, smart guide for preparation. *"Syllabus samjho, mock test do, selection pakka!"* | Mock tests, syllabus, exam dates, study tips |
| **Result Chacha** | Jolly 60-year-old, grey moustache, kurta + navy Nehru jacket, newspaper | Warm elder who announces results & answer keys. *"Result aa gaya beta, abhi check karo!"* | Results, answer keys, cut-offs, merit lists |
| **Junction Bot** | Cute white-blue robot, screen face, signpost antenna (from the logo), megaphone | The alert system — reminders and countdowns. *"Last date paas hai! ⏰"* | Admit cards, last-date reminders, alerts, notifications |

## Rules
- One lead character per image/reel; a second may appear small (e.g. Junction Bot with a countdown).
- Same outfit and colours every time — never redesign. Poses/expressions may change.
- Section → character mapping is in `engine/wp.py` (`BRAND_CAST`), used automatically by `featured_image()`.
- Files: `engine/assets/cast/<name>.webp` (transparent, made once in Canva AI — no OpenAI/Gemini). Extra poses: generate in Canva with the base image as reference.
- Reels: the same cast as animated SVG cut-outs (`reels/brand/cast.js`) so they can blink, wave and talk for free.
