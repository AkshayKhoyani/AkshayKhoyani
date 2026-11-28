# Finance Junction: roz ka schedule (scheduled tasks isi file ko follow karte hain)
User ka order (27 Nov 2026). Repo `AkshayKhoyani/AkshayKhoyani`, branch `claude/finance-videos-pz24zv` (sirf isi par push).

## Schedule (IST): din mein max 2 reels, views ke hisaab se timing
| Slot | Run shuru | Post (lagbhag) | Reel |
|---|---|---|---|
| A | Mon–Fri 4:41 PM | ~5:30 PM (office se ghar, commute scroll) | **"Aaj market mein kya hua"**: Sensex/Nifty close, sector winners/losers, 2–3 wajah, ek "aage kya" line |
| B | Mon–Thu 7:51 PM | ~8:30–9 PM (prime time) | **"Kal market mein kya dekhna hai"**: agle trading din ke events/data/results, global cues (US futures, crude, dollar); prediction nahi |
| W | Sunday 7:51 PM | ~8:30–9 PM | **"Agle hafte ke dhamake"**: agle hafte ki zaroori dates + hafte ka recap. Agar is hafte ka weekly reel pehle hi post ho chuka (LOG.md dekho), to skip |
| N, subah, dopahar | BAND | | user baad mein batayega |

**Timing review (har Sunday W run ke saath):** `GET graph.facebook.com/v21.0/17841415627923533/media?fields=timestamp,like_count,comments_count` se
pichle 2 hafte ke posts ka IST time vs likes/comments dekho. Koi slot lagatar kam chale aur doosra time behtar dikhe, to LOG.md mein likho aur final report mein user ko suggest karo (trigger khud mat badlo).

Chhutti: NSE band ho to slot A mat banao; agle din chhutti ho to slot B "agle trading day" ke baare mein. US market band ho to slot N mat banao.
Har run sirf apne slot ki EK reel banata hai. **Din mein sirf 2 reels** (slot A + slot B/W). Slot B mein US futures / pichli raat ke US close ka ek point daal sakte ho.

## Har reel ke steps
1. `git pull`; `cd videos/engine && npm install` (pehli baar).
2. Research: internet ab khula hai. Official pages (RBI, MoSPI, PIB, BSE) aur badi news sites seedha padho; jo site block kare use chhod do, doosra source lo. Index closes: Yahoo Finance chart API (query1.finance.yahoo.com) + 1 news site se match. Har number SOURCE RULES ke hisaab se. Closing data market band hone ke **baad** lo.
3. Folder `videos/daily/<YYYY-MM-DD>/<NN-slot-slug>/` mein **NEWS CITY template** se reel banao: `videos/engine/NEWSCITY.md` padho, example `videos/daily/2026-11-27/04-agle-hafte-4-dhamake/`.
   - Theme: hamesha NEWS CITY (3D city + gates + Junction Bhai cartoon). Purani 2D "reelkit"/evergreen theme mat use karo.
   - Voice: **Bunty** (`7b9mYhmnp0y2qSH1FnBL`, `eleven_v4`, emotion tags). Script chhota: kul TTS text ~350–450 characters (ElevenLabs Starter: 30k/month).
     Pehle quota check: `curl -s https://api.elevenlabs.io/v1/user/subscription -H "xi-api-key: proxy-injected"`. Agar (limit − count) < 1500 to `voice.py --silent` (bina awaaz, text + music) aur report mein batao.
   - 30–45 sec. Pehle 2 sec mein sabse badi baat (number/shock). Date bolo ("27 November"), "aaj/kal" nahi. End: aasaan comment sawaal (1/2/3 ya emoji) + "Finance Junction follow karo".
4. Preview PNG dekho, theek karo, final MP4, freezedetect check, MP4 < 20 MB.
5. `SOURCES.md` + `caption.txt` (pehli line hook, data bullets, comment sawaal, "Not investment advice. Sources: ...", 8–10 hashtags) reel folder mein.
6. Commit + push. Phir **Instagram par seedha post** (user ne har reel ke liye approval hata diya hai):
   `cd videos && python3 engine/ig_post.py <videos/... mp4 path> <caption.txt> --publish`. Error 2207076 aaye to 2 min baad ek baar retry.
7. `videos/daily/LOG.md` mein ek line (slot, reel, IG link, voice/silent, dikkat). Commit + push.
8. Final message Hinglish mein: kaunsi reel, IG link, koi dikkat.


## ElevenLabs SAFETY (28 Nov 2026: ElevenLabs ne "Fraudulent, predatory" warning email bheja)
Wajah ka andaaza: skit ki line "₹1 lakh se har mahine ₹40,000" jaisi paisa-guna-karne wali baat, jo automated filter ko scam/get-rich-quick jaisi lagi.
Repeat violation par account suspend ho sakta hai, isliye VOICE (TTS) text mein ye KABHI mat daalo:
- Paisa double/guna karne, pakka/fixed munafa, "har mahine ₹X kamao" jaise daave. Numbers zaroori hon to "maan lo / example" ke saath, aur bade claims sirf SCREEN par likho, voice mein nahi.
- Scammer ki zubaan: "OTP batao", "paise bhejo", "account band ho jayega", dhamki, kisi ko dhokha dene ke steps. Scam reels mein voice sirf narrator / victim / Junction Bhai ki ho; scammer ki baatein screen par text bubble mein.
- Loan/udhaar se darana ya kisi ko pressure dena.
Shak ho to line ko neutral, educational tone mein likho ("Business mein paisa ghoomta kaise hai?").

## Kabhi mat karo
- OpenAI / ChatGPT / Gemini ya koi aur paid AI API (images, voice, transcription). Sab visuals code se (NEWS CITY, mascot). Sirf ElevenLabs voice allowed.
- Guaranteed return, buy/sell advice, target price ki salah, "market kal pakka girega/chadhega" jaisi prediction.
- Bina source ka number. Asli bank/brand ka logo ya asli vyakti ki nakal.
- Ek slot mein ek se zyada post. 100 posts/24h IG limit.

## AUDIENCE DATA (Instagram insights, 28 Nov 2026, 598 followers)
- Umar: 35–44 = 40%, 25–34 = 33%, 45–54 = 16%, 18–24 = sirf 5%. Gender: purush 71%, mahila 7%, unknown 22%.
- Shehar: Mumbai 15%, Surat 12%, Delhi 8%, Ahmedabad 7%, Bengaluru 6%, Indore, Pune, Jaipur. (Gujarat ~19%)
- Matlab: 25–44 saal ke kamaane wale purush, investors/traders/business owners. Content inke liye: market dates, RBI/tax/GDP ka asar, business ke paise ki baatein. College/teen wale topics nahi.
- Reel data: weekly "dates" reels = 34,288 views (460 saves, 485 shares) aur 9,683 views; baaki market news ~2.2–2.8k views; evergreen (SIP/scam/F&O) 274–761 views.
  Avg watch time ~20 sec (dates reels), 11–16 sec (baaki). Sabse zaroori baat pehle 10 sec mein.
- Har Sunday: `media?fields=...` + `/{id}/insights?metric=views,reach,saved,shares,ig_reels_avg_watch_time` aur `follower_demographics` dekh kar LOG.md mein 3 line likho.

## Insights se seekh
- 27 Nov raat 9:37 PM: NEWS CITY + Junction Bhai weekly reel ("Agle hafte 4 dhamake") = 3 ghante mein 115 likes; 12 ghante mein 268 likes, followers 242 → 435 (+80%). VIRAL. Yahi format (dates list + cartoon + save karo) sabse best.

### 23 Nov: weekly calendar reel = 5,887 views, 80 follows, 81 saves, 52 shares
- "Kal / aaj" mat bolo, **date bolo** (jaise "23 November 2026 ko"). Voice aur screen dono par.
- Reel **≤ 35–40 sec**. 63 sec wali reel ka average watch 20 sec tha.
- **Pehle 2 sec mein sabse badi baat / suspense** (shuru ke 5–6 sec mein ~50% drop tha).
- End mein **aasaan comment sawaal** ("1, 2 ya 3 comment karo"); comments 0 the.
- Utility / save-worthy content (calendar, list, dates) sabse achha chalta hai.

## SOURCE RULES (user ki request, 23 Nov 2026), har content par lagu
1. User ko dikhane se **pehle** poora verify karo. Pehle draft dikhaakar baad mein number badalna mana hai.
2. Har number ke liye: **2+ alag publishers** (ek hi article copy karne wale nahi) YA 1 official source (NSE/BSE, RBI, PIB, govt stats, exchange, company filing).
3. Official/primary source sabse upar: China customs, NBS, LME, RBI, NSE/BSE. Blog/aggregator (SteelOnTheNet, accio, etc.) sirf hint hain, script mein nahi.
4. Har reel folder mein `SOURCES.md`: number → exact figure → publisher → URL → date. Script sirf isi table se.
5. Number ek baar **FINAL** mark ho gaya to badalna nahi. Agar galti mile to user ko saaf batao: "ye pehle galat tha, ye sahi hai, is source se".
6. Jo verify na ho, woh script se bahar. ⚠️ wale numbers reel mein nahi jaate.

## Instagram
- Account: financejunction.in (IG id 17841415627923533). Token: system-user, never expires, proxy graph.facebook.com par inject karta hai.
- Video URL jsDelivr se (commit SHA pinned), isliye post se pehle push zaroori.
