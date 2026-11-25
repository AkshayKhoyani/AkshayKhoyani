# HowToHindi: Production Rules (ported from Finance Junction, 25 Nov 2026)

Every HowToHindi reel follows these rules. They were learned on Finance Junction (see branch `claude/finance-videos-pz24zv`, `videos/daily/DAILY_RUN.md`) and adapted to the HowToHindi brand.

## Brand
- Colors: Dark Navy `#0B1A33` background, White text, Orange `#FF7A1A` highlights (`orange` / `orange2` in spec; `gold` is an alias of orange).
- Logo: `brand/logo-dark.png` (end card), `brand/mark-dark.png` + "HOW TO / HINDI" wordmark (top-left on every scene). Regenerate with `python3 brand/make_brand.py brand`.
- Voice: ElevenLabs Jessica at 1.12x (falls back to OpenAI `nova` when the quota runs out). The last line always says "…HowToHindi follow karo".
- Captions: karaoke, Roman Hinglish, synced to ElevenLabs word timings.

## Reel rules (from Finance Junction Insights)
1. **Length: 25–40 sec.** A 63-sec reel had an average watch time of only 20 sec.
2. **The biggest point or suspense goes in the first 2 seconds.** The first scene is always `hook`, and its first frame shows the full text (it doubles as the cover).
3. **Say dates, never "kal" or "aaj"** (for example "23 August 2023", "October 2026"), in both voice and on screen.
4. **End with an easy comment question:** "1 ya 2 comment karo".
5. **Loop ending:** the last line ties back to the first line so the video replays.
6. One reel = one idea. Utility and save-worthy content (lists, dates, how-it-works) performs best.

## SOURCE RULES (strict, apply to all content)
1. Verify fully **before** showing anything. Changing a number after showing a draft is not allowed.
2. Every number needs **2+ independent publishers** OR **1 official source** (RBI, NPCI, ISRO, PIB, SEBI, NSE/BSE, govt stats, company filing).
3. Official/primary sources come first. Blogs and aggregators are hints only; they never go in the script.
4. Every reel folder has a `SOURCES.md` table: claim → exact figure → publisher → URL → date. The script uses only that table.
5. Once a number is marked **FINAL**, it doesn't change. If an error is found, tell the user plainly: "this was wrong earlier, this is correct, per this source".
6. If it can't be verified, it stays out of the script. ⚠️ numbers never go in a reel.

## Never do
- Guaranteed-return / "pakka paisa" claims, or buy/sell advice naming a specific stock or fund.
- A number without a source.
- A real bank/brand/agency logo (ISRO, NPCI, RBI, etc.) or an imitation of a real person.
- Financial topics without the "Educational only. Financial advice nahi." line on the end card.

## Making a reel
```bash
mkdir howtohindi/reels/NN-slug             # write spec.json (format: engine/REELKIT.md) + SOURCES.md
python3 howtohindi/engine/make_reel.py howtohindi/reels/NN-slug --preview 0,8,16   # check PNGs: no cut-off text, hook on frame 0
python3 howtohindi/engine/make_reel.py howtohindi/reels/NN-slug                   # voice + music + MP4; "flat_frames_at" must be []
rm howtohindi/reels/NN-slug/p_*.png
```
Then add the caption block to `reels/CAPTIONS.md`.

## Posting checklist
- Post between 7 and 10 PM. After 2 weeks, check Insights for your own best time.
- On Instagram, add trending audio at about 5% volume so the voiceover stays clear.
- Cover = first frame (it already shows the hook).
- Reply to every comment in the first 30 minutes, and share the reel to your story.
- Post the same video to YouTube Shorts with #shorts in the title.
- After 2 weeks, collect views, average watch time, % watched fully, shares, saves and follows for each reel.
