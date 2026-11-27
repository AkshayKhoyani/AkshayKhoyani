# Finance Junction: roz ka schedule (scheduled tasks isi file ko follow karte hain)
User ka order (27 Nov 2026). Repo `AkshayKhoyani/AkshayKhoyani`, branch `claude/finance-videos-pz24zv` (sirf isi par push).

## Schedule (IST)
| Slot | Kab | Reel |
|---|---|---|
| A | Mon–Fri ~3:52 PM (market close ke baad), post ~4:30 PM | **"Aaj market mein kya hua"**: Sensex/Nifty close, sabse bade gainers/losers sector, 2–3 wajah, ek "aage kya" line |
| B | Mon–Thu ~6:41 PM, post ~7:15 PM | **"Kal market mein kya hoga"**: GIFT Nifty (agar mile), global cues, agle din ke events/results/data, levels nahi, prediction nahi |
| W | Fri ~6:41 PM (slot B ki jagah) | **"Agle hafte ke dhamake"**: agle hafte ki zaroori dates (data, RBI/Fed, results, IPO, expiry, chhuttiyan) |
| N | Tue–Sat ~2:51 AM (US close 2:30 AM IST ke baad) | **"America mein kya hua + India par asar"**: Dow/S&P/Nasdaq close, Europe close, crude, dollar, bade US stocks; India ke liye kya matlab (prediction nahi) |
| Subah / dopahar | abhi KHAALI | user baad mein batayega. Purani evergreen QUEUE.md wali reels **band** |

Chhutti: NSE band ho to slot A mat banao; agle din chhutti ho to slot B "agle trading day" ke baare mein. US market band ho to slot N mat banao.
Har run sirf apne slot ki EK reel banata hai.

## Har reel ke steps
1. `git pull`; `cd videos/engine && npm install` (pehli baar).
2. Research (WebSearch + jo sites khuli hon). Har number SOURCE RULES ke hisaab se. Closing data market band hone ke **baad** lo.
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

## Kabhi mat karo
- OpenAI / ChatGPT / Gemini ya koi aur paid AI API (images, voice, transcription). Sab visuals code se (NEWS CITY, mascot). Sirf ElevenLabs voice allowed.
- Guaranteed return, buy/sell advice, target price ki salah, "market kal pakka girega/chadhega" jaisi prediction.
- Bina source ka number. Asli bank/brand ka logo ya asli vyakti ki nakal.
- Ek slot mein ek se zyada post. 100 posts/24h IG limit.

## Insights se seekh (23 Nov: weekly calendar reel = 5,887 views, 80 follows, 81 saves, 52 shares)
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
