"""Programmatic question generators: every answer and explanation is computed, so it is always correct.
gen_reasoning(seed, n) / gen_maths(seed, n) -> list of {q, o[4], a, e}
"""
import datetime
import math
import random
import string

L = string.ascii_uppercase


def _mcq(rng, correct, wrongs, q, e):
    opts, seen = [str(correct)], {str(correct)}
    for w in wrongs:
        w = str(w)
        if w not in seen:
            opts.append(w); seen.add(w)
        if len(opts) == 4:
            break
    k = 1
    while len(opts) < 4:  # numeric fallback distractors
        try:
            cand = str(int(correct) + k * rng.choice([1, -1]) * rng.randint(1, 3))
        except ValueError:
            cand = str(correct) + "'" * k
        if cand not in seen:
            opts.append(cand); seen.add(cand)
        k += 1
    rng.shuffle(opts)
    return {"q": q, "o": opts, "a": opts.index(str(correct)), "e": e}


# ---------------- Reasoning ----------------
def r_number_series(rng):
    kind = rng.choice(["ap", "gp", "sq", "diff"])
    if kind == "ap":
        a, d = rng.randint(2, 40), rng.randint(3, 15)
        s = [a + i * d for i in range(6)]; e = f"Each term increases by {d}."
    elif kind == "gp":
        a, r = rng.randint(2, 6), rng.choice([2, 3])
        s = [a * r ** i for i in range(6)]; e = f"Each term is multiplied by {r}."
    elif kind == "sq":
        b = rng.randint(2, 7)
        s = [(b + i) ** 2 for i in range(6)]; e = f"The series is squares: {b}², {b+1}², {b+2}² …"
    else:
        a, d = rng.randint(1, 20), rng.randint(1, 4)
        s = [a]
        for i in range(5):
            s.append(s[-1] + d * (i + 1))
        e = f"Differences increase by {d}: +{d}, +{2*d}, +{3*d} …"
    ans = s[-1]
    q = "Find the next number in the series: " + ", ".join(map(str, s[:-1])) + ", ?"
    return _mcq(rng, ans, [ans + rng.randint(1, 5), ans - rng.randint(1, 5), ans + 10, s[-2] * 2], q, e)


def r_letter_series(rng):
    step, start = rng.randint(2, 5), rng.randint(0, 6)
    s = [L[(start + i * step) % 26] for i in range(5)]
    ans = s[-1]
    q = "Find the next letter: " + ", ".join(s[:-1]) + ", ?"
    w = [L[(L.index(ans) + k) % 26] for k in (1, -1, 2)]
    return _mcq(rng, ans, w, q, f"Each letter moves {step} places forward in the alphabet.")


def r_coding(rng):
    words = ["TRAIN", "POLICE", "MOTHER", "BANK", "PAPER", "WATER", "INDIA", "CLERK", "GUARD", "OFFICE", "STATION", "NATION"]
    w1, w2 = rng.sample(words, 2)
    k = rng.choice([1, 2, 3, -1])
    enc = lambda w: "".join(L[(L.index(c) + k) % 26] for c in w)
    q = f"If {w1} is written as {enc(w1)} in a certain code, how is {w2} written in that code?"
    ans = enc(w2)
    wr = ["".join(L[(L.index(c) + k + 1) % 26] for c in w2), "".join(L[(L.index(c) - k) % 26] for c in w2), ans[::-1]]
    e = f"Each letter is shifted {abs(k)} place{'s' if abs(k) > 1 else ''} {'forward' if k > 0 else 'backward'}: {w2} → {ans}."
    return _mcq(rng, ans, wr, q, e)


def r_alpha_pos(rng):
    n = rng.randint(4, 22)
    if rng.random() < .5:
        q = f"Which letter is {n}th from the left end of the English alphabet?"
        ans = L[n - 1]; e = f"A=1, B=2 … so the {n}th letter is {ans}."
    else:
        q = f"Which letter is {n}th from the right end of the English alphabet?"
        ans = L[26 - n]; e = f"{n}th from right = {27 - n}th from left = {ans}."
    return _mcq(rng, ans, [L[(L.index(ans) + 1) % 26], L[(L.index(ans) - 1) % 26], L[(L.index(ans) + 2) % 26]], q, e)


def r_odd_one(rng):
    kind = rng.choice(["prime", "square", "even"])
    if kind == "prime":
        good = rng.sample([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37], 3); odd = rng.choice([9, 15, 21, 25, 27, 33, 35, 39])
        e = f"All others are prime numbers; {odd} is not prime."
    elif kind == "square":
        good = [x * x for x in rng.sample(range(4, 16), 3)]; odd = rng.choice([50, 60, 75, 90, 110, 130, 150])
        e = f"All others are perfect squares; {odd} is not."
    else:
        good = [2 * x for x in rng.sample(range(5, 50), 3)]; odd = 2 * rng.randint(5, 49) + 1
        e = f"All others are even numbers; {odd} is odd."
    opts = [str(x) for x in good] + [str(odd)]
    rng.shuffle(opts)
    return {"q": "Find the odd one out:", "o": opts, "a": opts.index(str(odd)), "e": e}


DIRS = ["North", "East", "South", "West"]


def r_direction(rng):
    d = 0; x = y = 0; parts = []
    steps = rng.randint(2, 4)
    for i in range(steps):
        dist = rng.randint(2, 12)
        if i:
            turn = rng.choice(["left", "right"]); d = (d + (1 if turn == "right" else -1)) % 4
            parts.append(f"turns {turn} and walks {dist} km")
        else:
            d = rng.randint(0, 3); parts.append(f"walks {dist} km towards {DIRS[d]}")
        x += [0, 1, 0, -1][d] * dist; y += [1, 0, -1, 0][d] * dist
    q = "Ravi " + ", then ".join(parts) + f". In which direction is he facing now?"
    ans = DIRS[d]
    return _mcq(rng, ans, [z for z in DIRS if z != ans], q, f"Tracking each turn, his final facing direction is {ans}.")


def r_rank(rng):
    n = rng.randint(20, 60); l = rng.randint(3, n - 3)
    q = f"In a row of {n} students, Amit is {l}th from the left. What is his position from the right?"
    ans = n - l + 1
    return _mcq(rng, ans, [n - l, n - l + 2, l], q, f"Position from right = Total − left position + 1 = {n} − {l} + 1 = {ans}.")


DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def r_calendar(rng):
    d0 = datetime.date(2026, 1, 1) + datetime.timedelta(days=rng.randint(0, 300))
    k = rng.randint(10, 120)
    d1 = d0 + datetime.timedelta(days=k)
    q = f"If {d0.strftime('%d %B %Y')} is a {DAYS[d0.weekday()]}, what day of the week will it be after {k} days?"
    ans = DAYS[d1.weekday()]
    return _mcq(rng, ans, [z for z in DAYS if z != ans][:3], q, f"{k} days = {k // 7} weeks + {k % 7} odd days. {DAYS[d0.weekday()]} + {k % 7} = {ans}.")


def r_clock(rng):
    h, m = rng.randint(1, 11), rng.choice([0, 10, 15, 20, 30, 40, 45, 50])
    ang = abs(30 * h - 5.5 * m)
    ang = 360 - ang if ang > 180 else ang
    a = int(ang) if ang == int(ang) else ang
    q = f"What is the angle between the hour hand and the minute hand of a clock at {h}:{m:02d}?"
    return _mcq(rng, f"{a}°", [f"{a + 15}°", f"{abs(a - 10)}°", f"{a + 30}°"], q, f"Angle = |30×H − 5.5×M| = |30×{h} − 5.5×{m}| = {a}°.")


def r_analogy(rng):
    a = rng.randint(2, 12); f = rng.choice(["sq", "cube", "double"])
    fn = {"sq": lambda x: x * x, "cube": lambda x: x ** 3, "double": lambda x: 2 * x + 1}[f]
    b = rng.randint(2, 12)
    while b == a:
        b = rng.randint(2, 12)
    ans = fn(b)
    rule = {"sq": "square", "cube": "cube", "double": "2×n + 1"}[f]
    return _mcq(rng, ans, [ans + 1, ans - 2, fn(b + 1)], f"{a} : {fn(a)} :: {b} : ?", f"The relation is {rule}: {b} → {ans}.")


def r_age(rng):
    a, diff = rng.randint(8, 25), rng.randint(20, 32)
    f = a + diff; k = rng.randint(3, 10)
    q = f"The present age of a son is {a} years and his father is {diff} years older. What will be the father's age after {k} years?"
    return _mcq(rng, f + k, [f, f + k + 2, a + k], q, f"Father now = {a} + {diff} = {f}. After {k} years = {f + k}.")


REASONING = [r_number_series, r_letter_series, r_coding, r_alpha_pos, r_odd_one, r_direction, r_rank, r_calendar, r_clock, r_analogy, r_age]


# ---------------- Maths ----------------
def m_percent(rng):
    p, n = rng.choice([5, 10, 12, 15, 20, 25, 30, 40, 45, 60, 75]), rng.randint(2, 40) * 20
    ans = p * n // 100
    return _mcq(rng, ans, [ans + 10, ans - 5, p * n // 10], f"What is {p}% of {n}?", f"{p}% of {n} = {p}/100 × {n} = {ans}.")


def m_profit(rng):
    cp = rng.randint(4, 40) * 25; p = rng.choice([10, 12, 15, 20, 25, 30])
    sp = cp * (100 + p) // 100
    return _mcq(rng, sp, [cp + p, sp + 25, cp * (100 - p) // 100], f"An article bought for ₹{cp} is sold at a profit of {p}%. What is the selling price?",
                f"SP = CP × (100 + P)/100 = {cp} × {100 + p}/100 = ₹{sp}.")


def m_si(rng):
    pr, r, t = rng.randint(2, 30) * 500, rng.choice([4, 5, 6, 8, 10, 12]), rng.randint(2, 5)
    si = pr * r * t // 100
    return _mcq(rng, si, [si + 100, pr * r // 100, si * 2], f"Find the simple interest on ₹{pr} at {r}% per annum for {t} years.",
                f"SI = P×R×T/100 = {pr}×{r}×{t}/100 = ₹{si}.")


def m_ci(rng):
    # combinations chosen so that the amount is a whole number of rupees
    pr, r = rng.choice([(4000, 5), (8000, 5), (12000, 5), (1000, 10), (2000, 10), (5000, 10), (1000, 20), (2500, 20), (5000, 20)])
    amt = pr * (100 + r) ** 2 // 10000; ci = amt - pr
    return _mcq(rng, ci, [pr * r * 2 // 100, ci + 50, ci - 25], f"Find the compound interest on ₹{pr} at {r}% per annum for 2 years (compounded annually).",
                f"A = {pr}×(1 + {r}/100)² = ₹{int(amt)}; CI = {int(amt)} − {pr} = ₹{ci}.")


def m_ratio(rng):
    a, b, k = rng.randint(1, 7), rng.randint(1, 7), rng.randint(5, 60) * 10
    tot = (a + b) * k
    return _mcq(rng, a * k, [b * k, a * k + k, tot // 2], f"₹{tot} is divided between A and B in the ratio {a}:{b}. What is A's share?",
                f"A's share = {a}/({a}+{b}) × {tot} = ₹{a * k}.")


def m_avg(rng):
    nums = [rng.randint(10, 99) for _ in range(rng.randint(4, 6))]
    s = sum(nums); r = s % len(nums)
    nums[0] -= r; s -= r
    ans = s // len(nums)
    return _mcq(rng, ans, [ans + 2, ans - 3, ans + 5], "Find the average of: " + ", ".join(map(str, nums)), f"Sum = {s}, count = {len(nums)}, average = {ans}.")


def m_work(rng):
    pairs = [(10, 15, 6), (12, 24, 8), (20, 30, 12), (6, 12, 4), (15, 30, 10), (18, 36, 12), (20, 60, 15), (12, 36, 9), (24, 40, 15), (10, 40, 8)]
    a, b, t = rng.choice(pairs)
    return _mcq(rng, t, [t + 2, (a + b) // 2, t - 1], f"A can finish a work in {a} days and B in {b} days. In how many days can they finish it together?",
                f"Together = (a×b)/(a+b) = ({a}×{b})/({a}+{b}) = {t} days.")


def m_speed(rng):
    s, t = rng.choice([30, 36, 40, 45, 48, 54, 60, 72, 80]), rng.randint(2, 6)
    return _mcq(rng, s * t, [s * t + 10, s + t, s * (t + 1)], f"A bus runs at {s} km/h. How much distance will it cover in {t} hours?",
                f"Distance = speed × time = {s} × {t} = {s * t} km.")


def m_train(rng):
    kmph = rng.choice([36, 54, 72, 90, 108]); ms = kmph * 5 // 18; t = rng.randint(8, 20)
    return _mcq(rng, ms * t, [kmph * t, ms * t + 20, ms * (t - 2)], f"A train running at {kmph} km/h crosses a pole in {t} seconds. What is the length of the train (in metres)?",
                f"{kmph} km/h = {kmph}×5/18 = {ms} m/s; length = {ms} × {t} = {ms * t} m.")


def m_lcm(rng):
    a, b = rng.sample([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24], 2)
    if rng.random() < .5:
        ans = a * b // math.gcd(a, b)
        return _mcq(rng, ans, [a * b, math.gcd(a, b), ans // 2 if ans % 2 == 0 else ans + 2], f"Find the LCM of {a} and {b}.", f"LCM({a}, {b}) = {a}×{b}/HCF = {ans}.")
    ans = math.gcd(a, b)
    return _mcq(rng, ans, [ans * 2, ans + 1, min(a, b)], f"Find the HCF of {a} and {b}.", f"The highest common factor of {a} and {b} is {ans}.")


def m_bodmas(rng):
    a, b, c, d = rng.randint(10, 60), rng.randint(2, 9), rng.randint(2, 9), rng.randint(1, 20)
    ans = a + b * c - d
    return _mcq(rng, ans, [(a + b) * c - d, a + b * (c - d), ans + 10], f"Simplify: {a} + {b} × {c} − {d}", f"Multiplication first: {b}×{c} = {b * c}; {a} + {b * c} − {d} = {ans}.")


def m_sqrt(rng):
    n = rng.randint(11, 35)
    return _mcq(rng, n, [n + 1, n - 1, n + 2], f"Find the square root of {n * n}.", f"{n} × {n} = {n * n}, so √{n * n} = {n}.")


def m_discount(rng):
    mp, d = rng.randint(4, 40) * 50, rng.choice([10, 15, 20, 25, 30])
    sp = mp * (100 - d) // 100
    return _mcq(rng, sp, [mp - d, sp - 50, mp * d // 100], f"The marked price of a watch is ₹{mp}. It is sold at a discount of {d}%. Find the selling price.",
                f"SP = {mp} × (100 − {d})/100 = ₹{sp}.")


MATHS = [m_percent, m_profit, m_si, m_ci, m_ratio, m_avg, m_work, m_speed, m_train, m_lcm, m_bodmas, m_sqrt, m_discount]


def _gen(funcs, seed, n):
    rng = random.Random(seed)
    out, order = [], []
    while len(out) < n:
        if not order:
            order = funcs[:]; rng.shuffle(order)
        q = order.pop()(rng)
        if all(q["q"] != x["q"] for x in out):
            out.append(q)
    return out


def gen_reasoning(seed, n=25):
    return _gen(REASONING, seed, n)


def gen_maths(seed, n=25):
    return _gen(MATHS, seed, n)
