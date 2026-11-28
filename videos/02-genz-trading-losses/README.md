# Short #2: Gen Z traders F&O mein paisa kyun haar rahe hain?

Vertical (1080×1920), ~63 sec, Hinglish, ElevenLabs voice "Jessica" (1.12x speed).

## Upload ke liye

**Title:** 10 mein se 9 young traders paisa haar rahe hain 😳 | SEBI Study #shorts

**Description:**
SEBI ki FY26 study ke mutabik 30 saal se kam umar ke 88.5% F&O traders loss mein the.
Individual traders ka kul nuksaan ₹91,685 crore raha, aur 92% nuksaan options trading se aaya.
ClearTax ke data mein bhi 25 se kam umar ke 37% investors (capital gain/loss dikhane wale) loss mein the.
Trading se pehle seekho, aur long-term wealth ke liye SIP / index funds socho.

⚠️ Educational purpose only. Ye investment advice nahi hai. Derivatives trading mein high risk hota hai.

Sources:
- SEBI study: Profitability of individual traders in equity derivatives (FY26), Aug 2026
- ClearTax: How India Filed 2026 (AY 2026-27), Nov 2026

**Hashtags:** #shorts #stockmarket #fno #optionstrading #sebi #genz #personalfinance #investing #sip #moneytips

## Facts used (cross-checked across multiple news reports)
| Fact | Source |
|---|---|
| 88.5% of individual F&O traders under 30 made losses (FY26) | SEBI study, reported by PTI / Business Today / Free Press Journal |
| 87.7% of individual traders made net losses (FY26), vs 90.9% FY25 | SEBI study |
| Aggregate net loss ₹91,685 crore (FY26), vs ₹1,11,788 crore FY25 | SEBI study |
| Under-30 traders = 43% of individual traders (FY26) | SEBI study |
| Options = 92% of aggregate losses | SEBI study (Business Today) |
| Loss share among self-filers reporting capital gains/losses: <25: 37%, 25–30: 29%, 60+: 21% | ClearTax "How India Filed 2026" |

Note: the SEBI PDF itself could not be opened from the build environment (sebi.gov.in blocked),
so figures were taken only where several independent reports agreed.

## Rebuild
```bash
python3 voiceover.py                    # needs ElevenLabs key (proxy-injected)
python3 music.py music.wav 62.8         # total from timeline.json
node render.js
```
