# Employment Junction – Instagram auto-posting + comment → DM setup (step by step)

Ye kaam ek hi baar karna hai. Finance Junction wali hi Meta app use karenge, bas Employment Junction ka Instagram account usme jodna hai.

---

## Step 0 – Pehle check (2 minute)
1. Phone par **Instagram app** kholo, **employmentjunction.in** account par jao.
2. **Settings → Account type and tools** → account **Professional (Business ya Creator)** hona chahiye.
   Agar "Switch to professional account" dikh raha hai to use dabao, **Business** chuno, category "Education" ya "Website" rakh lo.

## Step 1 – Meta Developer app kholo
1. Computer par **developers.facebook.com** kholo, wahi Facebook ID se login karo jisse Finance Junction ki app banayi thi.
2. Upar **My Apps** dabao, Finance Junction wali app kholo.

## Step 2 – Employment Junction ko app me "tester" banao
(App abhi Development mode me hai, isliye account ko app ka role dena zaroori hai.)
1. Left menu me **App roles → Roles** kholo.
2. **Add People** dabao, **Instagram Tester** chuno, username likho: `employmentjunction.in`, Submit.
3. Ab phone par Instagram (employmentjunction.in) kholo:
   **Settings → Website permissions → Apps and websites → Tester invites** me invite dikhega, **Accept** karo.
   (Agar ye menu na mile to computer par instagram.com → Settings → Apps and websites → Tester invites.)

## Step 3 – Account jodo aur token banao
1. Developer app me left menu: **Use cases → Manage messaging & content on Instagram → Customize**
   (naam thoda alag ho sakta hai: "API setup with Instagram login").
2. **Permissions** me ye 4 tick/add karo:
   - `instagram_business_basic`
   - `instagram_business_content_publish` (reel post karne ke liye)
   - `instagram_business_manage_comments` (comments padhne ke liye)
   - `instagram_business_manage_messages` (DM bhejne ke liye)
3. **API setup with Instagram login → Section 2: Generate access tokens → Add account**
   → Instagram login khulega → **employmentjunction.in** se login karo → sab permissions **Allow** karo.
4. List me employmentjunction.in ke saamne **Generate token** dabao → token **copy** karo.
   ⚠️ Token kisi ko chat/WhatsApp me mat bhejna.

## Step 4 – Token Claude ko do (secure form se)
1. Claude ko likho: **"token ready hai"**.
2. Claude ek **secure form** kholega (host: graph.instagram.com) → token usme paste karke **Save**.
   Token kabhi chat me paste mat karna. Form wala tarika hi safe hai.
3. Claude test karega: account ka naam aur followers dikhenge → matlab sab sahi.

✅ Iske baad: reel banna aur **automatic post** hona shuru (Finance Junction jaisa).

---

## Step 5 – Comment karne walon ko automatic DM (link bhejna)
Ye Meta ki taraf se thoda extra hai, kyunki anjaan logon ko DM bhejne ke liye app ko **Live** karna padta hai:
1. Developer app → **App Review → Permissions and features** → `instagram_business_manage_messages` aur
   `instagram_business_manage_comments` ke saamne **Request advanced access**.
2. Meta ek chhota form poochega (app kya karti hai). Likh sakte ho:
   *"When a user comments a keyword (for example DSSSB) on our reel, we send them one private reply with the link to the job post on our website employmentjunction.in."*
   Ek screen recording maangi ja sakti hai — Claude bana ke dega.
3. **Privacy Policy URL**: `https://employmentjunction.in/privacy-policy/` (already bani hui hai).
4. Approve hone ke baad app ko **Live** mode me karo (upar toggle "Development → Live").
   Meta ka review aam taur par kuch din leta hai.

Tab tak: Claude har ghante naye comments check karke **comment ka reply** kar sakta hai ("Link DM / bio me hai"),
aur jo log pehle se aapko DM kar chuke hain unko DM me link bhej sakta hai.

**Jaldi chahiye to doosra raasta:** ManyChat (manychat.com, free plan) — Instagram jodo → "Comment keyword → DM" automation
→ keyword `DSSSB` → message me post ka link. Ye 10 minute me chalu ho jata hai, App Review nahi lagta.

---

## Yaad rakhne wali baatein
- Token ~60 din chalta hai. Expire hone se pehle Claude bata dega; tab sirf **Step 3.4 + Step 4** dobara karna hai.
- Finance Junction ka token alag hai (graph.facebook.com). Employment Junction ka token graph.instagram.com par rahega — dono aapas me nahi takrayenge.
