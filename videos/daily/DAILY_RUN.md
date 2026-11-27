# Daily run: roz ki 3–4 reels (scheduled task yahi follow karta hai)

Repo: `AkshayKhoyani/AkshayKhoyani`, branch `claude/finance-videos-pz24zv`.

## Steps
1. Repo + branch checkout karo, `git pull`. `cd videos/engine && npm install`.
2. `videos/daily/QUEUE.md` se **status `todo` wale pehle 3 topics** lo (agar ElevenLabs + OpenAI dono chal rahe hain aur sab smooth hai to 4).
3. Har topic ke liye:
   - **Research:** jo number reel mein jayega uska taaza, bharosemand source dhoondo (RBI, SEBI, NPCI, PIB, I4C, Income Tax dept, ya 2+ badi news sites jo match karein).
     Number pakka na ho to reel mein mat daalo, ya "andaaza" likho. Calculation wale topics (Rule of 72, compounding) mein assumption saaf likho.
   - `videos/daily/<YYYY-MM-DD>/<NN-slug>/spec.json` likho (format: `videos/engine/REELKIT.md`, examples: `videos/daily/samples/`).
     Rules: 16–30 sec, pehla scene `hook`, aakhri `cta` with "Finance Junction follow karo" + loop line, ek reel = ek idea, Hinglish.
   - `python3 videos/engine/make_reel.py <dir> --preview 0,<mid>,<end-1>` → PNG dekho (text kat to nahi raha, overlap to nahi, pehla frame hook dikhata hai). Theek karo.
   - `python3 videos/engine/make_reel.py <dir>` → `flat_frames_at` khaali hona chahiye.
   - Preview PNGs delete karo (`rm <dir>/p_*.png`).
4. `videos/daily/<YYYY-MM-DD>/CAPTIONS.md` likho: har reel ka IG caption (pehli line hook), 5–10 hashtags, YouTube title (#shorts), sources.
5. `QUEUE.md` mein un topics ka status `done (<date>)` karo. Agar `todo` 15 se kam bache hon, 15 naye topics jodo
   (trending Indian personal-finance news + evergreen; scams, tax, SIP, loans, insurance, UPI, budgeting).
6. `videos/daily/LOG.md` mein ek line: date, reels, voice (el/oa), koi dikkat.
7. Commit + push to `claude/finance-videos-pz24zv` (koi aur branch nahi). Draft PR pehle se open hai.
8. Final message (user ke phone par notification): Hinglish mein kaunsi reels bani, kahan mili (GitHub path), aaj ka posting time
   suggestion (subah 9, dopahar 1, shaam 7, raat 9), koi source/voice issue.

## Insights se seekh (23 Nov: weekly calendar reel = 5,887 views, 80 follows, 81 saves, 52 shares)
- "Kal / aaj" mat bolo, **date bolo** (jaise "23 November 2026 ko"). Voice aur screen dono par.
- Reel **≤ 35–40 sec**. 63 sec wali reel ka average watch 20 sec tha.
- **Pehle 2 sec mein sabse badi baat / suspense** (shuru ke 5–6 sec mein ~50% drop tha).
- End mein **aasaan comment sawaal** ("1, 2 ya 3 comment karo"); comments 0 the.
- Utility / save-worthy content (calendar, list, dates) sabse achha chalta hai.

## Kabhi mat karo
- Guaranteed return / "pakka paisa" jaisi baatein, kisi stock/fund ka naam leke buy/sell advice.
- Bina source ka number.
- Kisi asli bank/brand ka logo ya asli vyakti ki nakal.

## SOURCE RULES (user ki request, 23 Nov 2026), har content par lagu
1. User ko dikhane se **pehle** poora verify karo. Pehle draft dikhaakar baad mein number badalna mana hai.
2. Har number ke liye: **2+ alag publishers** (ek hi article copy karne wale nahi) YA 1 official source (NSE/BSE, RBI, PIB, govt stats, exchange, company filing).
3. Official/primary source sabse upar: China customs, NBS, LME, RBI, NSE/BSE. Blog/aggregator (SteelOnTheNet, accio, etc.) sirf hint hain, script mein nahi.
4. Har reel folder mein `SOURCES.md`: number → exact figure → publisher → URL → date. Script sirf isi table se.
5. Number ek baar **FINAL** mark ho gaya to badalna nahi. Agar galti mile to user ko saaf batao: "ye pehle galat tha, ye sahi hai, is source se".
6. Jo verify na ho, woh script se bahar. ⚠️ wale numbers reel mein nahi jaate.

## INSTAGRAM AUTO-POST (setup 27 Nov 2026)
- Account: financejunction.in (IG id 17841415627923533). Token: system-user, never expires, proxy injects it for graph.facebook.com.
- Post: commit + push the mp4, write caption to a .txt, then `python3 engine/ig_post.py <videos/...mp4> <caption.txt> --publish`.
- Rule: **user ka OK milne ke baad hi --publish.** Bina OK sirf upload test (no --publish). Limit 100 posts/24h.
