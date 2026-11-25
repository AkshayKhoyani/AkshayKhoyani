# HowToHindi — Production Packages, Vol. 1

**3 explainer videos · 9:16 vertical · 40–45 sec each · Hinglish**
Prepared: 25 Nov 2026

| # | Topic | Runtime | Review level |
|---|-------|---------|--------------|
| 1 | UPI kaise kaam karta hai? | ~42 sec | Low (stats only) |
| 2 | Credit Score kya hai? | ~44 sec | **High (financial)** |
| 3 | Chandrayaan-3 ki kahani | ~43 sec | Low–Medium (cost figure) |

> **Rendered reels:** Tight ~31-sec MP4 versions of all three are in `reels/`. They follow the Finance Junction rules in `RULES.md` (hook on frame 0, under 40 sec, easy "1 ya 2" comment ending, loop line, a SOURCES.md for every reel). The longer 42–44 sec scripts below are the full-length documentary versions. Unverified figures (such as the Chandrayaan-3 cost) are left out of the rendered reels.

### Global brand & visual system (applies to all three)

- **Palette:** Dark Navy `#0B1A33` (background), White `#FFFFFF` (primary text), Orange `#FF7A1A` (highlights, key numbers, underlines). Muted navy `#1C2E4F` for cards.
- **Type:** Bold geometric sans (Montserrat ExtraBold or Poppins Bold) for headlines; Devanagari support via Noto Sans Devanagari. Max 6 words per on-screen line.
- **Safe zone:** Keep text between 15% and 75% of frame height (avoids IG/YT UI overlays at top and bottom).
- **Motion language:** Numbers count up, orange underline wipes left-to-right, cards slide in with 6-frame ease-out. No spinning or 3D text.
- **Logo bug:** "HowToHindi" small white wordmark, top-left, 60% opacity.
- **Audio:** Low-tempo cinematic pulse bed (-18 LUFS under VO), one "whoosh" per transition max, VO at -14 LUFS integrated.
- **VO pace:** ~2.6 words/sec in Hinglish. Each script below is 105–115 words.
- **AI prompt suffix (append to every image/video prompt):**
  `vertical 9:16, cinematic documentary lighting, deep navy and warm orange color grade, photorealistic, shallow depth of field, high detail, no text, no watermark`

---
---

# VIDEO 1 — UPI kaise kaam karta hai?

## Task 1 — Research

### Verified facts
| # | Fact | Source |
|---|------|--------|
| F1 | UPI was launched by NPCI on **11 April 2016** (pilot with 21 member banks), presented by then-RBI Governor Raghuram Rajan. | NPCI press release (11 Apr 2016): https://www.npci.org.in/PDF/npci/press-releases/2016/UPI_Launch_Press_Release_April_11_2016.pdf |
| F2 | UPI runs on top of NPCI's **IMPS** real-time payment rail. | NPCI product overview: https://www.npci.org.in/what-we-do/upi/product-overview ; Arthapedia (Indian Economic Service): https://ies.gov.in/index.php/arthapedia/concept/unified-payments-interface-upi |
| F3 | A **VPA / UPI ID** (e.g. name@bank) replaces account number + IFSC; payment is authorised with a **UPI PIN**. Works 24×7 including holidays. | NPCI product overview (above) |
| F4 | **October 2026:** ~**25.47 billion** transactions worth **₹31.53 lakh crore** — a record. | NPCI monthly data, reported by Free Press Journal: https://www.freepressjournal.in/business/upi-transactions-hit-2547-billion-in-october-value-soars-to-3153-lakh-crore |
| F5 | Oct 2026 average: ~**822 million (≈82 crore) transactions per day**; average daily value crossed **₹1 lakh crore** for the first time. | StartupTalky: https://startuptalky.com/news/upi-payments-set-new-record-in-october/ ; Outlook Money: https://www.outlookmoney.com/banking/upi-average-daily-transaction-value-crosses-rs-1-lakh-crore-for-first-time-ever-in-october |

**Primary source to re-check before publishing:** NPCI UPI Product Statistics page — https://www.npci.org.in/what-we-do/upi/product-statistics

### Opinion / not used
- "UPI is the world's best payment system" — opinion, not used.
- MDR / merchant charges on UPI — rules are in flux (NPCI postponed the Oct 2026 MDR rollout), so the video does not mention it.

## Task 2 — Script

### Three hooks
1. "Aapne ₹10 ki chai ke liye QR scan kiya — aur 2 second mein paisa ek bank se doosre bank pahunch gaya. Par actually hua kya?"
2. "Sirf ek mahine mein Indians ne 2,500 crore se zyada UPI payments kiye. Yeh system chalta kaise hai?"
3. "Aapke phone mein account number nahi, IFSC nahi — phir bhi paisa sahi jagah kaise jaata hai?"

### ✅ Selected hook: #1
Why: it opens on a moment every viewer has lived, and it ends on a question. Hook #2's number is used later as the payoff.

### Final narration (~110 words · ~42 sec)

> **[S1]** Aapne ₹10 ki chai ke liye QR scan kiya — aur 2 second mein paisa ek bank se doosre bank pahunch gaya. Par actually hua kya?
> **[S2]** Yeh hai UPI — Unified Payments Interface. Ise 2016 mein NPCI ne launch kiya tha.
> **[S3]** Aapki UPI ID, jaise naam@bank, ek nickname hai. Iske peeche aapka bank account chhupa hota hai — account number aur IFSC dene ki zaroorat hi nahi.
> **[S4]** Jab aap PIN daalte ho, aapka app request NPCI ko bhejta hai. NPCI dukaandaar ka bank dhoondhta hai, aapke bank se paisa katta hai, aur unke account mein jud jaata hai — IMPS ke real-time rails par.
> **[S5]** Aur scale dekhiye — October 2026 mein, sirf ek mahine mein, 2,547 crore transactions. Yaani roz lagbhag 82 crore.
> **[S6]** Ek baat yaad rakhiye: paisa *receive* karne ke liye PIN kabhi nahi lagta.
> **[S7]** Aap din mein kitni baar UPI use karte ho? Comment mein batao.

**Transitions used:** "Par actually hua kya?" → explanation; "Aur scale dekhiye" → stats; "Ek baat yaad rakhiye" → safety payoff.

## Task 3 — Storyboard

| Scene | Duration | Voiceover | Visual description | AI image/video prompt | Camera | On-screen text | Transition |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:05 | Hook (S1) | Close-up: hand holds phone over a chai-stall QR stand, steam rising from a glass. Tap, then the green tick. | `Close-up of an Indian man's hand scanning a QR code at a roadside chai stall at dusk, steaming glass of tea in foreground, phone screen glowing, warm orange street light` | Slow push-in | **₹10. 2 second. Kaise?** | Hard cut on the tick sound |
| 2 | 0:05–0:09 | S2 | Navy card animates: "UPI = Unified Payments Interface", NPCI logo placeholder, "2016" counts up. | Motion graphic (no AI). Optional BG: `Abstract dark navy digital grid with faint glowing orange data lines, minimal` | Static, slight parallax | **UPI · NPCI · 2016** | Orange line wipe |
| 3 | 0:09–0:16 | S3 | A UPI ID tag "rahul@bank" flips over to reveal a bank-account card behind it. Account number + IFSC fields get crossed out in orange. | `Stylized 3D floating ID tag made of frosted glass with a glowing orange edge, dark navy studio background, soft rim light` | Slow orbit 15° | **UPI ID = aapke account ka nickname** | Card flip |
| 4 | 0:16–0:26 | S4 | Animated flow diagram: Phone → NPCI hub (glowing node) → Your bank (₹ minus) → Shop's bank (₹ plus). Each node lights in sequence with the VO. | `Cinematic isometric illustration of glowing data packets flowing between three bank building icons through a central hub, dark navy background, orange light trails` | Top-down, slow pan following packet | **Aapka App → NPCI → Aapka Bank → Dukaandaar ka Bank** | Zoom out into scene 5 |
| 5 | 0:26–0:34 | S5 | Night aerial of an Indian city; thousands of tiny orange light pulses rise from rooftops. Counter rolls up to "2,547 crore". | `Aerial night view of a dense Indian city, thousands of tiny orange light particles rising from buildings into the sky like data, cinematic, moody navy sky` | Slow drone rise | **2,547 crore transactions · Oct 2026** then **≈82 crore / din** | Dip to navy |
| 6 | 0:34–0:39 | S6 | Phone screen showing "Enter PIN to RECEIVE ₹5000" with a large orange ✕ stamped over it. | `Close-up of a smartphone on a dark wooden table, screen showing a blurred payment request, dramatic side light, tense mood` (add the UI and ✕ in edit) | Static, tiny shake on the ✕ | **Receive karne ke liye PIN = SCAM** | Quick fade |
| 7 | 0:39–0:42 | S7 | Brand end card: navy BG, question in white, HowToHindi logo, follow CTA. | Motion graphic | Static | **Aap din mein kitni baar UPI use karte ho? 👇** | — |

## Task 5 — Publishing package

- **SEO title:** UPI Kaise Kaam Karta Hai? 2 Second Mein Paisa Kaise Pahunchta Hai | HowToHindi
- **YouTube Shorts title:** UPI ke 2 second ke peeche ka poora system 🇮🇳 #Shorts
- **Instagram caption:**
  ₹10 ki chai se ₹10,000 ke rent tak — sab UPI par. Par jab aap PIN daalte ho, tab peeche kya hota hai? 🤔
  UPI ID asal mein ek nickname hai, NPCI beech ka "traffic police" hai, aur sirf October 2026 mein 2,547 crore transactions hue! 🤯
  ⚠️ Yaad rakho: paisa receive karne ke liye PIN kabhi nahi lagta.
  Save karo, family ke saath share karo 🙏
  Follow @howtohindi.official for simple explainers.
- **Hashtags:** #UPI #DigitalIndia #NPCI #UPIPayments #HowToHindi #HindiExplainer #FinanceInHindi #Fintech #OnlinePayments #CyberSafety #LearnInHindi #Reels #Shorts
- **YouTube description:**
  UPI (Unified Payments Interface) kaise kaam karta hai — UPI ID, PIN aur NPCI ka role, 40 second mein.
  📊 October 2026: 2,547 crore transactions, ₹31.53 lakh crore value (NPCI data).
  ⚠️ Safety tip: Paisa receive karne ke liye UPI PIN kabhi nahi dalna padta.
  Sources: NPCI (npci.org.in) — UPI product overview and monthly statistics.
  #UPI #DigitalIndia #HowToHindi
- **Thumbnail text:** "2 SECOND MEIN PAISA KAISE?" (orange "2 SECOND")
- **Pinned comment:** "Quick quiz 🧠: Paisa RECEIVE karne ke liye UPI PIN lagta hai — haan ya naa? Galat jawab dene wale ko yeh video zaroor bhejo 😄 Agla topic kya ho? 👇"

## Task 6 — QC notes
- ✅ All numbers trace to NPCI data (F4, F5). "2,547 crore" = 25.47 billion ✔. "82 crore/din" = 822 million ✔.
- ✅ "2 second" in the hook describes the viewer's experience, not an official NPCI speed claim. Keep it phrased that way.
- ⚠️ **Human review:** Re-check the Oct 2026 figures on NPCI's statistics page on publishing day. If November 2026 data is out, decide whether to update.
- ⚠️ The S4 flow is simplified (it skips the PSP/payer-app bank layer). That is acceptable for a 40-sec explainer, but don't call it "the complete architecture".
- ✅ Safety line (S6) matches standard bank and NPCI fraud advisories.

---
---

# VIDEO 2 — Credit Score kya hai?

## Task 1 — Research

### Verified facts
| # | Fact | Source |
|---|------|--------|
| F1 | A CIBIL score ranges from **300 to 900**; higher means more creditworthy. TransUnion CIBIL is one of India's RBI-regulated Credit Information Companies (CICs). Others include Experian, Equifax and CRIF High Mark. | TransUnion CIBIL: https://www.cibil.com/ ; Axis Bank explainer: https://www.axis.bank.in/blogs/credit-score/cibil-score-ranges |
| F2 | **Payment history** (paying EMIs and card bills on time) is the single biggest factor. Credit utilisation, credit history length, credit mix and new credit enquiries also matter. | Bajaj Finserv: https://www.bajajfinserv.in/insights/how-is-your-cibil-score-calculated ; Paytm: https://paytm.com/blog/credit-score/how-cibil-score-is-calculated-key-factors-determining-your-creditworthiness-2/ |
| F3 | Every individual is entitled to **one free full credit report (with score) per calendar year from each CIC**. | RBI circular (2016, effective 1 Jan 2017): https://rbi.org.in/Scripts/NotificationUser.aspx?Id=10590 ; Equifax FAQ: https://www.equifax.co.in/en/help/ |
| F4 | Since **1 Jan 2025**, lenders must report credit data to CICs **every fortnight** (previously monthly), so changes show up faster. | RBI notification, 8 Aug 2024: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12718 |

### Uncertain / opinion — deliberately NOT stated as fact
- **Exact percentage weightings** (35% / 30% etc.): sources disagree, and CIBIL doesn't publish an official formula. The script says only "sabse bada factor".
- **"Keep card usage under 30% of limit"**: a widely used industry guideline, not an official rule. The script frames it as "experts suggest".
- **"750+ is a good score"**: common lender rule of thumb, not a regulation. Framed as "aam taur par".

## Task 2 — Script

### Three hooks
1. "Ek 3-digit number decide karta hai ki bank aapko loan dega ya nahi — aur kitne interest par."
2. "Aapne kabhi loan nahi liya? Toh ho sakta hai aapka credit score hai hi nahi — aur yeh bhi problem hai."
3. "Sirf ek credit card bill late bharna aapke saalon ke plans ko slow kar sakta hai."

### ✅ Selected hook: #1
Why: it states the stakes (loan + interest) in one line and makes the viewer want to know the number. Hook #2 is a strong idea for a follow-up video.

### Final narration (~112 words · ~44 sec)

> **[S1]** Ek 3-digit number decide karta hai ki bank aapko loan dega ya nahi — aur kitne interest par.
> **[S2]** Yeh hai aapka credit score. CIBIL jaisi RBI-regulated companies ise 300 se 900 ke beech calculate karti hain. Jitna zyada, utna behtar.
> **[S3]** Sabse bada factor? Time par payment. Har EMI, har credit card bill — late hua, toh score girta hai.
> **[S4]** Doosra — aap apni credit limit ka kitna hissa use karte ho. Experts kehte hain, limit ka 30% se kam use karna safe hai.
> **[S5]** Aur haan, baar-baar naye loan ya card ke liye apply karna bhi score ko hurt kar sakta hai.
> **[S6]** Good news: RBI ke rule ke hisaab se, har credit bureau se saal mein ek full credit report free milti hai. Toh check zaroor karo.
> **[S7]** Aapne apna credit score last kab check kiya tha? Comment mein batao.

**Transitions used:** "Sabse bada factor?" → "Doosra" → "Aur haan" → "Good news" (a numbered list feel, with a positive turn at the end).

## Task 3 — Storyboard

| Scene | Duration | Voiceover | Visual description | AI image/video prompt | Camera | On-screen text | Transition |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:05 | S1 | A bank officer's desk; a loan file lands; a glowing 3-digit number "???" hovers over it. | `Indian bank loan officer's desk, closed file folder in center, a glowing holographic three-digit number hovering above it, moody navy office, warm orange desk lamp` | Slow push-in to the number | **Yeh number = Loan YES ya NO** | Number "flips" into a gauge |
| 2 | 0:05–0:12 | S2 | Semicircle gauge 300→900, needle sweeps up, color goes navy→orange. Label "CIBIL / Experian / Equifax / CRIF" fades under it. | Motion graphic (no AI) | Static | **300 ———— 900** · **Zyada = Behtar** | Needle snap |
| 3 | 0:12–0:19 | S3 | A calendar with EMI dates; each date gets a white tick. One date gets an orange "LATE" stamp, and the gauge needle drops. | `Close-up of a wall calendar on a dark desk with several dates circled, cinematic shallow focus, navy shadows, single orange highlight` (add ticks and stamp in edit) | Slow pan left→right across dates | **#1 Time par payment** | Stamp impact cut |
| 4 | 0:19–0:26 | S4 | A credit card's limit shown as a bar; it fills to 30% in orange, then beyond into red-orange with a warning pulse. | `Premium matte black credit card floating at an angle over a dark navy background, soft studio rim light, cinematic reflections` (bar graphic overlaid) | Slow rotate 10° | **#2 Limit ka < 30% use (expert tip)** | Bar wipes out |
| 5 | 0:26–0:32 | S5 | Multiple "Apply Now" loan app notifications stack up on a phone; the gauge needle ticks down with each. | `Smartphone on a desk at night, screen covered with stacked generic notification cards, blue glow on face of a young Indian woman looking worried, cinematic` | Static with stacking motion | **#3 Baar-baar apply = ❌** | Notifications swipe away |
| 6 | 0:32–0:40 | S6 | A calm user on a sofa opens a free credit report; an RBI building silhouette fades into the BG; "FREE · 1× / saal / bureau" badge. | `Young Indian man relaxing on a sofa in a softly lit living room, reading a document on a tablet, calm expression, warm orange lamp, navy evening light through the window` | Slow dolly-in | **Har bureau se 1 FREE report / saal (RBI)** | Dip to navy |
| 7 | 0:40–0:44 | S7 | End card with a gauge icon and the question. | Motion graphic | Static | **Last kab check kiya? 👇** | — |

## Task 5 — Publishing package

- **SEO title:** Credit Score Kya Hai? CIBIL Score Kaise Badhta Aur Girta Hai | HowToHindi
- **YouTube Shorts title:** Yeh 3-digit number aapka loan decide karta hai 😳 #Shorts
- **Instagram caption:**
  Loan milega ya nahi? Interest kitna lagega? 🤔 Bahut kuch ek 3-digit number par depend karta hai — aapka Credit Score.
  ✅ Time par EMI aur card bill
  ✅ Limit ka kam hissa use karo
  ❌ Baar-baar loan ke liye apply mat karo
  🎁 RBI rule: har credit bureau se saal mein 1 full report FREE.
  ℹ️ Yeh educational content hai, financial advice nahi.
  Save karo aur us dost ko bhejo jo har mahine bill late bharta hai 😅
- **Hashtags:** #CreditScore #CIBIL #CIBILScore #PersonalFinance #FinanceInHindi #MoneyTips #HowToHindi #HindiExplainer #Loan #CreditCard #FinancialLiteracy #Reels #Shorts
- **YouTube description:**
  Credit score (CIBIL score) kya hai, 300–900 range ka matlab, aur kaunsi aadatein ise affect karti hain — 45 second mein.
  📌 RBI ke rule ke mutabik har Credit Information Company se saal mein ek free full credit report milti hai.
  📌 1 Jan 2025 se lenders har 15 din mein credit data update karte hain (RBI).
  ⚠️ Disclaimer: Yeh video sirf educational purpose ke liye hai, financial advice nahi. Koi bhi financial decision lene se pehle apne bank ya certified advisor se baat karein.
  Sources: RBI circulars (rbi.org.in), TransUnion CIBIL (cibil.com).
  #CreditScore #CIBIL #HowToHindi
- **Thumbnail text:** "LOAN MILEGA YA NAHI?" with a gauge graphic and "300–900" in orange
- **Pinned comment:** "Myth ya Fact? 👉 'Apna credit score khud check karne se score girta hai.' Comment mein MYTH ya FACT likho — answer agle video mein! 📉📈"
  *(Note: checking your own score is a "soft enquiry" and is generally understood not to lower it. Verify on cibil.com before the answer video.)*

## Task 6 — QC notes
- ✅ 300–900 range, RBI-regulated CICs, free annual report, and fortnightly reporting are all backed by RBI or CIBIL sources.
- ✅ No exact factor percentages are stated, because the sources conflict.
- ⚠️ **HUMAN REVIEW REQUIRED (financial content):**
  - S4 "30% se kam" is framed as an expert tip. Keep that framing; don't present it as an official rule.
  - Confirm the RBI free-report rule wording is current before publishing.
  - Keep the "not financial advice" disclaimer in the caption and description.
  - Don't name or show specific lenders or loan apps in the visuals (S5 uses generic notifications).
- ✅ Timing: 112 words ≈ 43–44 sec at 2.6 w/s.

---
---

# VIDEO 3 — Chandrayaan-3 ki kahani

## Task 1 — Research

### Verified facts
| # | Fact | Source |
|---|------|--------|
| F1 | Launched **14 July 2023** on ISRO's **LVM3** rocket from Satish Dhawan Space Centre, Sriharikota. | ISRO mission page: https://www.isro.gov.in/Chandrayaan3_Details.html ; Space.com guide: https://www.space.com/chandrayaan-3-indian-moon-mission-rover |
| F2 | The Vikram lander soft-landed on **23 August 2023 at ~6:03 PM IST** near the lunar south pole. India became the **4th country to soft-land on the Moon** and the **first near the south pole**. | Scientific American: https://www.scientificamerican.com/article/chandrayaan-3-makes-historic-touchdown-on-the-moon/ ; All India Radio: https://www.newsonair.gov.in/chandrayaan-3-completes-two-years-today-india-marks-historic-lunar-mission-and-first-soft-landing-near-moons-south-pole |
| F3 | The landing site was named **"Shiv Shakti Point"** by PM Narendra Modi. | Wikipedia (with cited refs): https://en.wikipedia.org/wiki/Chandrayaan-3 ; PIB New India Samachar: https://newindiasamachar.pib.gov.in/WriteReadData/flipbook/2023/Sep/2nd/English/files/basic-html/page16.html |
| F4 | Chandrayaan-2's lander **crashed in 2019**; Chandrayaan-3 was the follow-up attempt. | Space.com (above) |
| F5 | The Pragyan rover's LIBS instrument made the **first in-situ confirmation of sulphur** near the south pole. It also detected Al, Ca, Fe, Cr, Ti, Mn, Si and O. | All India Radio: https://www.newsonair.gov.in/chandrayaan-3s-pragyan-rover-confirms-presence-of-sulphur-in-lunar-surface-near-south-pole ; Live Science: https://www.livescience.com/space/the-moon/indias-lunar-rover-finds-1st-evidence-of-sulfur-near-the-moons-south-pole |
| F6 | The mission was designed for about **one lunar day (~14 Earth days)**. | Space.com (above) |
| F7 | 23 August is observed as **National Space Day** in India. | PIB / Govt of India (verify): https://pib.gov.in |

### Uncertain — flagged
- **Cost:** the widely quoted figure is **~₹615 crore** (the approved budget, reported 2020). The government has cited "around ₹600 crore", and international outlets give US$74–90 million. The figure probably excludes earlier R&D. The script says "lagbhag ₹600 crore" and calls it the reported budget.
- **"Cheaper than a Hollywood movie"**: a popular comparison, but movie budgets are unverified estimates. **Not used.**

## Task 2 — Script

### Three hooks
1. "2019 mein India ka lander Chaand par crash ho gaya. 4 saal baad, wahi team wapas gayi — aur itihaas bana diya."
2. "Chaand ke south pole par aaj tak koi nahi utra tha. Phir 23 August 2023 aaya."
3. "Lagbhag ₹600 crore ka mission — aur India duniya ka pehla desh ban gaya jo Chaand ke south pole ke paas utra."

### ✅ Selected hook: #1
Why: a comeback story (failure → redemption) is the strongest emotional arc and keeps people watching for the payoff. Hooks #2 and #3 are woven into the body.

### Final narration (~108 words · ~43 sec)

> **[S1]** 2019 mein India ka lander Chaand par crash ho gaya. 4 saal baad, wahi team wapas gayi — aur itihaas bana diya.
> **[S2]** 14 July 2023 — ISRO ka LVM3 rocket Sriharikota se Chandrayaan-3 lekar udaa.
> **[S3]** Lagbhag 40 din ka safar. Phir 23 August, shaam 6 baj ke 3 minute — Vikram lander ne Chaand ke south pole ke paas soft landing ki.
> **[S4]** India bana Chaand par utarne wala chautha desh — aur south pole ke paas pahunchne wala pehla.
> **[S5]** Pragyan rover ne wahan pehli baar seedhe zameen par sulphur confirm kiya. Kyun important? Kyunki south pole par paani ki barf hone ki ummeed hai — future Moon bases ke liye.
> **[S6]** Aur yeh sab, reported budget lagbhag ₹600 crore mein.
> **[S7]** Aapko us raat ka landing moment yaad hai? Aap kahan the? Comment mein batao.

**Transitions used:** "4 saal baad" (time jump) → dates as chapter markers → "Kyun important?" (curiosity) → "Aur yeh sab..." (payoff).

## Task 3 — Storyboard

| Scene | Duration | Voiceover | Visual description | AI image/video prompt | Camera | On-screen text | Transition |
|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:06 | S1 | A dark mission-control room; a red "SIGNAL LOST" glow; engineers frozen. Then it cuts to the same room in 2023, lit warmer. | `Indian space mission control room at night, rows of engineers silhouetted against large screens, one screen glowing red, tense atmosphere, cinematic navy and orange lighting` | Slow push-in | **2019: Crash ❌** → **2023: ?** | Hard cut to black, then rocket ignition sound |
| 2 | 0:06–0:11 | S2 | A heavy-lift rocket lifts off from a coastal launch pad at dawn, with orange exhaust. | `Heavy-lift rocket launching from a coastal launch pad at dawn, massive orange exhaust plume, ocean and palm trees in the distance, epic documentary wide shot` | Low-angle tilt up following the rocket | **14 July 2023 · LVM3 · Sriharikota** | Smoke wipe |
| 3 | 0:11–0:19 | S3 | Animated Earth-to-Moon trajectory loop; a "40 DIN" counter; the lander descends over a cratered grey surface, dust kicks up. | `Spacecraft lander with four legs descending over the cratered grey lunar south pole, long shadows, thrusters firing, dust rising, Earth small in the black sky` | Tracking shot descending with the lander | **23 Aug 2023 · 6:03 PM IST** | Dust fills frame → white flash |
| 4 | 0:19–0:25 | S4 | A globe-style infographic: 3 dots (USSR, USA, China) light up, then India in orange with a "South Pole – #1" badge. | Motion graphic (flag icons + Moon outline) | Static, slow zoom | **Chautha desh 🇮🇳 · South Pole: PEHLA** | Moon outline zooms in |
| 5 | 0:25–0:35 | S5 | A six-wheeled rover rolls on lunar soil; a laser-spectrum graphic shows an "S" (sulphur) peak; a shadowed crater glints with ice. | `Small six-wheeled lunar rover driving slowly across grey lunar regolith leaving wheel tracks, harsh sunlight, deep black shadows, a permanently shadowed crater in background with faint icy glint` | Low tracking alongside the rover | **Sulphur ✔ (first in-situ)** → **Paani ki barf? = Future Moon Base** | Cross-dissolve |
| 6 | 0:35–0:39 | S6 | A wide shot of the lander standing alone on the Moon, "₹600 cr*" in orange. Small footnote: "*reported budget". | `Lone spacecraft lander standing on the lunar surface, Earth rising on the horizon, majestic wide shot, quiet and proud mood` | Slow pull-back | **Reported budget ≈ ₹600 crore** | Dip to navy |
| 7 | 0:39–0:43 | S7 | End card: Moon silhouette, question, logo. | Motion graphic | Static | **Landing ke time aap kahan the? 👇** | — |

**Visual note:** Use AI-generated "inspired-by" spacecraft. Don't recreate ISRO's logo or official mission imagery. If you want real ISRO footage, check ISRO's media-use terms first.

## Task 5 — Publishing package

- **SEO title:** Chandrayaan-3 Ki Poori Kahani: Crash Se South Pole Tak | HowToHindi
- **YouTube Shorts title:** 2019 mein crash, 2023 mein itihaas 🇮🇳🌕 #Shorts
- **Instagram caption:**
  2019 — signal lost. 💔
  2023 — "India, I reached my destination." 🌕🇮🇳
  Chandrayaan-3 ne India ko Chaand par utarne wala 4th desh aur south pole ke paas utarne wala PEHLA desh bana diya. Pragyan ne wahan sulphur bhi confirm kiya! 🔬
  Landing ke waqt aap kahan the? 👇
  Follow @howtohindi.official for science stories in simple Hindi.
- **Hashtags:** #Chandrayaan3 #ISRO #IndiaOnTheMoon #ShivShaktiPoint #SpaceScience #ProudIndian #HowToHindi #HindiExplainer #ScienceInHindi #Moon #NationalSpaceDay #Reels #Shorts
- **YouTube description:**
  Chandrayaan-3 ki kahani 45 second mein: 2019 ke Chandrayaan-2 crash se lekar 23 August 2023 ki historic south-pole landing tak.
  🚀 Launch: 14 July 2023, LVM3, Sriharikota
  🌕 Landing: 23 Aug 2023, ~6:03 PM IST — Shiv Shakti Point
  🔬 Pragyan rover: first in-situ confirmation of sulphur near the lunar south pole
  Sources: ISRO (isro.gov.in), All India Radio News, Scientific American.
  #Chandrayaan3 #ISRO #HowToHindi
- **Thumbnail text:** "CRASH ➜ HISTORY" (orange "HISTORY") over a lander-on-Moon image
- **Pinned comment:** "🇮🇳 Fun fact: Landing site ka naam 'Shiv Shakti Point' rakha gaya. Agla space video kis par chahiye — Gaganyaan ya Aditya-L1? Vote karo 👇"

> ⚠️ The caption quote "India, I reached my destination" was the message posted from ISRO's official account after the landing. Confirm the exact wording against ISRO's X/Twitter post before publishing, or remove the quote marks.

## Task 6 — QC notes
- ✅ Launch date, landing date/time, "4th country / first near south pole", and the sulphur finding are cross-checked across ISRO, AIR and international outlets.
- ✅ "Lagbhag 40 din" matches 14 Jul → 23 Aug (40 days) ✔.
- ⚠️ **Human review:** Cost is stated as "reported budget ≈ ₹600 crore" with an on-screen asterisk. Don't upgrade it to "total cost".
- ⚠️ S5 "paani ki barf hone ki ummeed" is phrased as a hope or hypothesis, not a confirmed finding. Keep it that way.
- ⚠️ The ISRO quote in the caption needs a wording check (see note above).
- ✅ Not political: the PM naming the site appears only as a factual note in research, not in the VO.

---
---

## Cross-video QC checklist

| Check | V1 UPI | V2 Credit | V3 Chandrayaan |
|---|---|---|---|
| Every number has a source | ✅ | ✅ | ✅ |
| Opinions separated from facts | ✅ | ✅ | ✅ |
| Runtime in 30–50 sec | ✅ ~42s | ✅ ~44s | ✅ ~43s |
| No repeated sentences | ✅ | ✅ | ✅ |
| Simple Hinglish (no heavy Hindi/English jargon) | ✅ | ✅ | ✅ |
| Every scene's visual matches its VO line | ✅ | ✅ | ✅ |
| No generic intro or motivational filler | ✅ | ✅ | ✅ |
| Needs human review before publishing | Stats refresh | **Yes — financial** | Cost + quote wording |

## Suggested posting order
1. **Chandrayaan-3** (broad emotional appeal, good for reach)
2. **UPI** (high relatability, very shareable safety tip)
3. **Credit Score** (after human financial review; strongest save/share potential)
