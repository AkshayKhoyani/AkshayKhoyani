# Employment Junction – Brand Characters (Character Bible)

Four recurring mascots appear on every featured image, mock test, homepage block and reel, so people recognise the brand at a glance (same idea as the Finance Junction reel characters).
Colours always follow the brand: royal blue `#0b3d91`, orange `#ff7a00`, white, with a small orange badge on the chest.

| Character | Who | Personality / catchphrase | Appears on |
|---|---|---|---|
| **Naukri Bhaiya** (Raju) | Friendly 25-year-old, light-blue shirt, backpack, phone in hand | Energetic big brother who brings every new vacancy first. *"Nayi bharti aa gayi! Jaldi apply karo!"* | New jobs (ej_job), homepage hero, reels intro |
| **Exam Didi** (Priya) | 27-year-old teacher type, round glasses, blue kurta + orange dupatta, book & pencil | Calm, smart guide for preparation. *"Syllabus samjho, mock test do, selection pakka!"* | Mock tests, syllabus, exam dates, study tips |
| **Result Chacha** | Jolly 60-year-old, grey moustache, kurta + navy Nehru jacket, newspaper | Warm elder who announces results & answer keys. *"Result aa gaya beta, abhi check karo!"* | Results, answer keys, cut-offs, merit lists |
| **Junction Bot** | Cute white-blue robot, screen face, signpost antenna (from the logo), megaphone | The alert system — reminders and countdowns. *"Last date paas hai! ⏰"* | Admit cards, last-date reminders, alerts, notifications |

### Job-category cast (same style, brand badge)
| Character | Who | Catchphrase | Used for |
|---|---|---|---|
| **Daroga Ji** | Police inspector, khaki uniform, saluting | *"Desh seva ka mauka, form bharo!"* | Police, constable, SI, jail, home guard, fire |
| **Fauji Bhai** | Army jawan, camouflage + beret, thumbs up | *"Jai Hind! Bharti shuru!"* | Army, Navy, Air Force, Agniveer, CAPF, NDA/CDS |
| **Bank Babu** | Bank officer, white shirt + blue tie, laptop & notes | *"Bank ki naukri, pakki salary!"* | SBI, IBPS, RBI, NABARD, bank clerk/PO |
| **Engineer Bhai** | Hard hat + safety vest, blueprint | *"JE/AE ki vacancy aa gayi!"* | JE, AE, PSU trainee, ITI/apprentice, technical |
| **Nurse Didi** | Nurse uniform, stethoscope, clipboard | *"Health sector me sarkari naukri!"* | Nursing, medical, pharmacist, AIIMS, paramedical |
| **Station Master Sharma Ji** | Railway uniform, green flag, whistle | *"Railway ki gaadi chhootne na paaye!"* | RRB, RRC, NTPC, Group D, ALP, railway apprentice |
| Exam Didi | (above) | | Teaching jobs too (TET, KVS, NVS) |

## Rules
- One lead character per image/reel; a second may appear small (e.g. Junction Bot with a countdown).
- Same outfit and colours every time — never redesign. Poses/expressions may change.
- Mapping lives in `engine/wp.py` (`TYPE_CHAR` by section, `CAST_FOR` by job category, `BRAND_CAST`), used automatically by `featured_image()`.
- Files: `engine/assets/characters/cast_<name>.webp` (transparent). Made once in Canva AI (no OpenAI/Gemini); Canva export saved in `assets/cast_src/`, cut out locally with `python3 engine/cutout.py <png> <name>`. Extra poses: generate in Canva with the base image as reference.
- Reels: `cast()` and `bubble()` in `reels/brand/ej.js` animate the same cut-outs (entrance, breathing, bob while talking, speech bubbles) for free.
