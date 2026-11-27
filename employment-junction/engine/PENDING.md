# Pending updates (the daily run checks this list first)

| Due | Page | What to update |
|---|---|---|
| 26 Nov 2026 | jobs/gujarat-police-lrd-recruitment-2026-3000-posts (ej_job 1908, spec jobs/gujarat-police-lrd-2026.json) | Detailed GPRB advertisement on OJAS: age limit + relaxation table, category-wise fee table, category/gender-wise vacancy, notification PDF link. Remove the "will be updated" lines. |
| when out | jobs/dsssb-je-mts-recruitment-2026-1260-posts (ej_job 1904) | Direct notification PDF link for Advt 06/2026; exam date / admit card. |
| when out | jobs/uksssc-constable-recruitment-2026-1694-posts (ej_job 1906) | Direct PDF link for Advt 84/UKSSSC/2026; post-wise vacancy table; exam date. |
| when out | jobs/rrc-nr-apprentice-recruitment-2026-4651-posts (ej_job 1888) | Category-wise seat matrix; merit list (expected Feb 2027) → publish as ej_result and link from job page. |

When an item is done, delete its row.

## Fact checks flagged by the notification-PDF research (27 Nov 2026)
- ej_job 1924 BHEL "415 posts": no official 2026 advertisement found (only the 2025 one with 400 posts). Verify on bhel.com, fix or retitle.
- ej_answer_key 1922 KEA KREIS: no official notice found for objections till 25 Nov. Verify.
- ej_job 1908 Gujarat Police LRD: page says 13,152 posts; other sources say 13,591. Verify on the official notification.
- ej_result 2203 OSSSC Nursing Officer: 8 Dec DV date not confirmed.
- ej_job 2178 BPSC AEDO 935 posts is Advt 87/2025 (Aug 2025), not a new 2026 advertisement — make the page say so.
- posts 125 (UPPCB) and posts 36 (UPSSSC Pharmacist) link PDFs on sarkariresults.org.in (aggregator) — replace with official links.
- Many Indian govt sites (RRB, GSSSB/OJAS, GPRB, RSSB, KEA, OSSSC, HPRCA, BSF, CPCL…) refuse connections from the cloud runner, so their PDFs could not be fetched; those posts link the official page. Retry in later runs.
- posts 26 (BSNL) links an aggregator (sarkariresults) — replace with official link.
- posts 130 Bihar Police says Constable (Driver) but Advt 02/2026 is Constable (Operator) — verify title/content.

## Mock test v2 – next steps (paused 27 Nov 2026 for usage limit)
- Publish PYQ papers: `python3 engine/mock/build_v2.py --only pyq` then `python3 engine/mock/hub_v2.py` (17 official papers ready in mock/data/pyq; one Gujarati file has a duplicate option — builder now drops such questions).
- Resume PYQ collection: Gujarat (GSSSB/GPSSB/LRB/GPSC sites block the cloud runner) and East/North states (WB, Odisha, Jharkhand, CG, Punjab, UK, HP, J&K) — partial files may exist.
- Verify the exam blueprints against official notifications (only IBPS PO/Clerk confirmed from the official PDF): mock/data/blueprints.json.
- Add more bank questions per topic (each GS topic has 30; full mocks reuse them across sets) and a "Current Affairs" monthly bank.
- Mock-test marketing: share cards / Instagram posts per exam mock, WhatsApp share text, "Daily Quiz" page.
