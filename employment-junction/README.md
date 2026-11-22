# Employment Junction – Website

Sarkari naukri (government jobs) ki information website: Latest Jobs, Admit Card, Result, Answer Key, Syllabus.
Plain HTML/CSS/JS hai, koi build step nahi. `index.html` ko browser mein kholte hi chal jaati hai.

## Kya edit karna hai

| File | Kya hai |
|---|---|
| `data/config.js` | WhatsApp number, WhatsApp channel, Telegram, email, city. **Pehle ye bharein.** |
| `data/jobs.js` | Saari job updates. Nayi update = ek `{ ... }` block copy karke upar paste karein. |

`data/jobs.js` ki abhi wali entries **sample** hain (card par "Sample" likha aata hai). Live karne se pehle inhe asli notifications se replace karein aur `sample: true` hata dein.

## Features
- Search (job, department, qualification), department / state / qualification filters
- Type tabs, "NEW" badge (3 din), last-date countdown
- Har job ka details popup + Official link + WhatsApp share (`#job=<id>` link share ho sakta hai)
- Upar scrolling news ticker, Admit Card / Result / Answer Key boards
- Mobile-friendly, WhatsApp contact form, disclaimer

## Host kaise karein
- **GitHub Pages:** repo Settings → Pages → branch select karein, folder `/employment-junction` ke liye root ya `docs` mein copy karein.
- Ya Netlify / Hostinger par ye folder upload kar dein, aur `employmentjunction.in` domain point kar dein.
