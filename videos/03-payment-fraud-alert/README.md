# Reel #3: Payment Fraud Alert 🚨 (motion-graphics style)

Vertical (1080×1920), ~58 sec, Hinglish, ElevenLabs voice "Jessica" (1.12x).

Motion elements: phone mockup jo bajta aur hilta hai, typing wale chat bubbles, stamp-slam ke saath screen shake,
glitch title, word-by-word (kinetic) text, slot-machine 1930 digits, typewriter URL, zoom transitions + flash,
floating particles, scanlines, vignette.

## Upload ke liye

**Title / caption:** Ye call aaye toh turant kaat do! 🚨 3 scams jo sabse zyada paisa loot rahe hain #shorts

**Description:**
3 payment scams se bacho:
1️⃣ Digital arrest: police kabhi video call pe arrest nahi karti. Jan–Aug 2026 mein 21,900+ complaints aur ₹647 crore ka nuksaan.
2️⃣ UPI PIN: paisa LENE ke liye PIN kabhi nahi lagta.
3️⃣ Fake KYC link + OTP: link pe click mat karo, OTP kisi ko mat batao.

Fraud ho gaya? Turant 1930 pe call karo ya cybercrime.gov.in pe complaint karo.
Is system se ab tak ₹11,158 crore+ bachaye ja chuke hain (30 June 2026 tak).

Educational purpose only. Kisi bhi shak mein apne bank se official number par hi sampark karein.

Sources:
- I4C / MHA status report to the Supreme Court (digital arrest, 1 Jan – 31 Aug 2026)
- PIB / I4C CFCFRMS data (amount saved till 30.06.2026)

**Hashtags:** #shorts #scamalert #cyberfraud #digitalarrest #upi #1930 #onlinefraud #moneytips #personalfinance #cybersafety

## Facts used
| Fact | Source |
|---|---|
| Digital arrest: 21,900+ complaints, ₹647 crore, 1 Jan – 31 Aug 2026 | I4C/MHA report to Supreme Court (Free Press Journal, The420) |
| ₹11,158 crore+ saved in 32.8 lakh+ complaints till 30.06.2026 | PIB (I4C CFCFRMS) |
| 1930 helpline, cybercrime.gov.in | I4C / MHA |

## Rebuild
```bash
python3 voiceover.py
python3 music.py music.wav 57.6
node render.js
```
