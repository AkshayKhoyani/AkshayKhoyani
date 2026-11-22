// UPI payment kaise pahunchta hai? (Finance Junction 3D explainer)
// Facts: NPCI Oct 2026: 25.47 billion UPI transactions (~82.2 crore/day), 758 banks live.
// Flow is simplified: app -> NPCI -> payer bank (PIN/balance, debit) -> NPCI -> payee bank (credit) -> confirmation.
import * as FJ from '/engine/fj3d.js';
const { THREE, PAL } = FJ;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const fj = await FJ.boot();
const { L, E, A } = fj;
const T = fj.tl.total;

// --- world ---
const extraBanks = [[-180, -135], [120, -205], [-120, -275], [180, -65], [-240, 5], [240, -135], [60, -345],
  [-60, -205], [180, 145], [-180, 145], [120, 75], [-120, 75], [240, -275], [-240, -345], [0, -275], [-180, -415]];
FJ.buildCity(fj, {
  seed: 11,
  reserved: [
    { x: 0, z: 75, empty: true }, { x: -60, z: 5, r: 16 }, { x: 60, z: 5, r: 16 }, { x: 0, z: -65, r: 22 },
    ...extraBanks.map(([x, z]) => ({ x, z, r: 14 })),
  ],
});
const hub = FJ.addHub(fj, 0, -65, 70);
const bank1 = FJ.addBank(fj, -60, 5, 24);
const bank2 = FJ.addBank(fj, 60, 5, 24);
const others = extraBanks.map(([x, z], i) => FJ.addBank(fj, x, z, 14 + (i % 4) * 4, 14, 12));
FJ.addStall(fj, 3, 54, Math.PI);
const payer = FJ.addPerson(fj, -7, 47, PAL.navy);
const chaiwala = FJ.addPerson(fj, 3, 57.5, '#b4553a');

const P = V(-7, 6.5, 47), S = V(3, 7, 56), N = hub.top.clone(), B1 = bank1.top.clone(), B2 = bank2.top.clone();

// --- camera ---
FJ.cameraPath(fj, [
  { t: 0, pos: [0, 230, 330], at: [0, 0, -60] },
  { t: A(0, 0.6), pos: [-34, 24, 100], at: [-2, 4, 48] },
  { t: E(1), pos: [-52, 15, 74], at: [-2, 5, 48] },
  { t: A(2, 0.45), pos: [-24, 72, 125], at: [0, 25, -20] },
  { t: E(2), pos: [10, 88, 72], at: [0, 35, -52] },
  { t: A(3, 0.55), pos: [-125, 72, 72], at: [-40, 14, -20] },
  { t: A(4, 0.4), pos: [132, 72, 72], at: [40, 14, -20] },
  { t: E(4), pos: [36, 44, 125], at: [0, 8, 40] },
  { t: A(5, 0.55), pos: [0, 340, 300], at: [0, 0, -110] },
  { t: T, pos: [70, 380, 250], at: [0, 0, -130] },
]);

// --- data packets ---
FJ.arc(fj, P, N, A(2, 0.12), A(2, 0.55));
FJ.arc(fj, N, B1, A(3, 0.03), A(3, 0.3));
FJ.arc(fj, B1, N, A(3, 0.8), A(3, 0.98), { color: PAL.red });
FJ.arc(fj, N, B2, A(4, 0.03), A(4, 0.3));
FJ.arc(fj, N, S, A(4, 0.62), A(4, 0.88), { color: PAL.green });
FJ.arc(fj, N, P, A(4, 0.62), A(4, 0.88), { color: PAL.green });
// the whole country: many payments between banks through the hub
const nodes = [bank1, bank2, ...others].map(b => b.top);
for (let i = 0; i < 46; i++) {
  const a = nodes[(i * 7) % nodes.length], b = (i % 3 === 0) ? N : nodes[(i * 5 + 3) % nodes.length];
  if (a === b) continue;
  const t0 = A(5, 0.02 + (i / 46) * 0.8);
  FJ.arc(fj, a, b, t0, t0 + 1.1, { keep: 0.25, tube: 0.6, size: 9, color: i % 4 === 0 ? PAL.green : PAL.gold });
}

// --- overlays ---
FJ.callout(fj, P, 'Aap: ₹20 bhej rahe ho', A(0, 0.35), E(1), { dx: -40, dy: -330 });
FJ.callout(fj, S, 'Chai wala', A(0, 0.5), E(1), { dx: 170, dy: -200, dot: PAL.gold });
FJ.callout(fj, N, 'NPCI: UPI ka switch', A(2, 0.5), E(2), { dx: 0, dy: -230, dot: PAL.gold });
FJ.callout(fj, B1, 'Aapka bank', A(3, 0.12), E(3), { dx: 60, dy: -260, dot: PAL.gold });
FJ.callout(fj, B1, 'PIN ✓  Balance ✓', A(3, 0.45), E(3), { dx: -230, dy: -140, dot: PAL.green });
FJ.callout(fj, B2, 'Chai wale ka bank', A(4, 0.12), A(4, 0.62), { dx: -60, dy: -260, dot: PAL.gold });
FJ.callout(fj, S, '✓ ₹20 received', A(4, 0.9), E(4) + 0.3, { dx: 120, dy: -240, dot: PAL.green });
FJ.callout(fj, bank2.top, '758 banks UPI par live', A(5, 0.45), E(5), { dx: -120, dy: -300, dot: PAL.gold });
FJ.ping(fj, S, A(4, 0.88));
FJ.ping(fj, P, A(4, 0.88));
FJ.ping(fj, S, A(0, 0.75));

const bn = t => (25.47 * FJ.easeOut(FJ.prog(t, A(5, 0.25), A(5, 0.6)))).toFixed(2);
FJ.hud(fj, [
  { t0: A(0, 0.2), t1: E(1), value: '₹20', unit: 'UPI', label: 'chai payment', color: PAL.gold },
  { t0: L(2), t1: E(2), value: 'Request', unit: '→ NPCI', label: 'step 1', color: PAL.blue },
  { t0: L(3), t1: E(3), value: '−₹20', unit: 'debit', label: 'aapka bank', color: PAL.red },
  { t0: L(4), t1: E(4), value: '+₹20', unit: 'credit', label: 'chai wala', color: PAL.green },
  { t0: L(5), t1: E(5), value: t => bn(t) + ' bn', label: 'UPI · Oct 2026', color: PAL.gold },
]);
FJ.bigText(fj, '~82 crore / din', 540, 430, A(5, 0.62), E(5), { size: 72, color: PAL.navy, bg: 'rgba(251,250,247,0.92)' });
FJ.brandBadge(fj, E(1), L(6));
FJ.tag(fj, 'simplified');
FJ.endCard(fj, L(6), { note: 'Simplified illustration. Data: NPCI (October 2026).\nEducational purpose only.' });
FJ.captions(fj);
FJ.progressBar(fj);
FJ.ready(fj);
