"""More computed generators (answers are calculated, so always correct) + TOPIC_GENS: syllabus topic -> generators.
gen_topic(topic, seed, n) -> list of {q, o, a, e} or [] when the topic has no generator.
"""
import math
import random

import gen
from gen import _mcq


def m_mensuration(rng):
    k = rng.randint(0, 3)
    if k == 0:
        l, b = rng.randint(5, 30), rng.randint(3, 20)
        return _mcq(rng, 2 * (l + b), [l * b, l + b, 2 * l + b], f"Find the perimeter of a rectangle of length {l} m and breadth {b} m.", f"Perimeter = 2(l + b) = 2({l} + {b}) = {2 * (l + b)} m.")
    if k == 1:
        r = rng.choice([7, 14, 21, 28, 35])
        a = 22 * r * r // 7
        return _mcq(rng, a, [2 * 22 * r // 7, a + 22, a // 2], f"Find the area of a circle of radius {r} cm. (Take π = 22/7)", f"Area = πr² = 22/7 × {r} × {r} = {a} cm².")
    if k == 2:
        a = rng.randint(3, 15)
        return _mcq(rng, a ** 3, [6 * a * a, a * a, 3 * a ** 2], f"Find the volume of a cube of side {a} cm.", f"Volume = a³ = {a}³ = {a ** 3} cm³.")
    a, b = rng.choice([(3, 4), (6, 8), (5, 12), (9, 12), (8, 15), (12, 16), (7, 24)])
    c = int(math.hypot(a, b))
    return _mcq(rng, c, [a + b, c + 1, c - 2], f"The two perpendicular sides of a right triangle are {a} cm and {b} cm. Find its hypotenuse.", f"Hypotenuse = √({a}² + {b}²) = √{a * a + b * b} = {c} cm.")


def m_algebra(rng):
    if rng.random() < .5:
        a, b = rng.randint(2, 12), rng.randint(1, 10)
        s, p = a + b, a * b
        ans = s * s - 2 * p
        return _mcq(rng, ans, [s * s, s * s + 2 * p, ans - 4], f"If x + y = {s} and xy = {p}, find x² + y².", f"x² + y² = (x + y)² − 2xy = {s * s} − {2 * p} = {ans}.")
    a = rng.randint(2, 9)
    return _mcq(rng, a ** 3 + 3 * a, [a ** 3, a ** 3 + a, a ** 3 + 3], f"If x − 1/x = {a}, find x³ − 1/x³.", f"x³ − 1/x³ = (x − 1/x)³ + 3(x − 1/x) = {a ** 3} + {3 * a} = {a ** 3 + 3 * a}.")


TRIG = [("sin 30°", "1/2"), ("cos 60°", "1/2"), ("tan 45°", "1"), ("sin 90°", "1"), ("cos 0°", "1"), ("tan 60°", "√3"), ("sin 60°", "√3/2"), ("cos 30°", "√3/2"),
        ("tan 30°", "1/√3"), ("sin 45°", "1/√2"), ("cos 90°", "0"), ("sec 60°", "2"), ("cosec 30°", "2"), ("cot 45°", "1")]


def m_trig(rng):
    if rng.random() < .6:
        f, v = rng.choice(TRIG)
        wrong = list({x for _, x in TRIG if x != v})
        rng.shuffle(wrong)
        return _mcq(rng, v, wrong, f"What is the value of {f}?", f"Standard value: {f} = {v}.")
    t = rng.choice([20, 25, 35, 40, 50, 65, 70])
    return _mcq(rng, "1", ["0", "2", "√2"], f"Find the value of sin²{t}° + cos²{t}°.", "sin²θ + cos²θ = 1 for every angle θ.")


def m_pipes(rng):
    a, b, t = rng.choice([(10, 15, 6), (12, 24, 8), (20, 30, 12), (6, 12, 4), (15, 30, 10), (18, 36, 12), (20, 60, 15), (12, 36, 9)])
    return _mcq(rng, t, [t + 3, (a + b) // 2, t - 2], f"Pipe A can fill a tank in {a} hours and pipe B in {b} hours. If both are opened together, in how many hours will the tank be full?",
                f"Together = {a}×{b}/({a}+{b}) = {t} hours.")


def m_mixture(rng):
    total, p = rng.choice([40, 50, 60, 80, 100, 120]), rng.choice([10, 20, 25, 30, 40])
    milk, water = total * (100 - p) // 100, total * p // 100
    return _mcq(rng, milk, [water, total - milk // 2, milk + 5], f"A {total}-litre mixture of milk and water contains {p}% water. How many litres of milk does it contain?",
                f"Milk = {100 - p}% of {total} = {milk} litres.")


def m_di(rng):
    yrs = ["2021", "2022", "2023", "2024", "2025"]
    vals = [rng.randint(20, 90) * 10 for _ in yrs]
    tbl = ", ".join(f"{y}: {v}" for y, v in zip(yrs, vals))
    if rng.random() < .5:
        avg = sum(vals) / 5
        if avg != int(avg):
            vals[0] += 5 - sum(vals) % 5 if sum(vals) % 5 else 0
            tbl = ", ".join(f"{y}: {v}" for y, v in zip(yrs, vals))
        avg = sum(vals) // 5
        return _mcq(rng, avg, [avg + 10, max(vals), avg - 20], f"Production of a factory (units): {tbl}. What is the average production per year?", f"Total = {sum(vals)}; average = {sum(vals)}/5 = {avg}.")
    i = rng.randint(1, 4)
    diff = vals[i] - vals[i - 1]
    return _mcq(rng, diff, [vals[i] + vals[i - 1], -diff if diff else 10, diff + 10], f"Production of a factory (units): {tbl}. By how many units did production change from {yrs[i - 1]} to {yrs[i]}?",
                f"{vals[i]} − {vals[i - 1]} = {diff} (negative means a fall).")


REL = [("father's father", "Grandfather"), ("mother's mother", "Grandmother"), ("father's brother", "Uncle"), ("mother's brother", "Uncle (Mama)"),
       ("father's sister", "Aunt (Bua)"), ("brother's son", "Nephew"), ("sister's daughter", "Niece"), ("son's wife", "Daughter-in-law"),
       ("daughter's husband", "Son-in-law"), ("wife's father", "Father-in-law"), ("father's only son", "Himself / Brother"), ("mother's husband", "Father")]


def r_blood(rng):
    rel, ans = rng.choice(REL)
    name = rng.choice(["Ravi", "Amit", "Neha", "Pooja", "Kiran", "Suresh", "Meena"])
    wrong = [x for _, x in REL if x != ans]
    rng.shuffle(wrong)
    return _mcq(rng, ans, wrong, f"Pointing to a person, {name} says, \"He/She is my {rel}.\" How is that person related to {name}?", f"{name}'s {rel} is {name}'s {ans.lower()}.")


SYL = [("All cats are animals. All animals are living beings.", "All cats are living beings.", "Some living beings are not animals.", True),
       ("All pens are books. Some books are tables.", "Some tables are pens.", "All pens are books.", False),
       ("No dog is a cat. All cats are pets.", "Some pets are not dogs.", "All pets are cats.", True),
       ("All roses are flowers. No flower is a tree.", "No rose is a tree.", "Some trees are roses.", True),
       ("Some boys are players. All players are strong.", "Some boys are strong.", "All boys are strong.", True)]


def r_syllogism(rng):
    st, c1, c2, first_follows = rng.choice(SYL)
    ans = "Only conclusion I follows" if first_follows else "Only conclusion II follows"
    return _mcq(rng, ans, ["Only conclusion I follows", "Only conclusion II follows", "Both I and II follow", "Neither I nor II follows"],
                f"Statements: {st} Conclusions: I. {c1} II. {c2}", f"Draw the Venn diagram: {'I' if first_follows else 'II'} is definitely true; the other is not certain.")


TOPIC_GENS = {
    "Number Series": [gen.r_number_series], "Series": [gen.r_number_series, gen.r_letter_series], "Alphabet Series": [gen.r_letter_series, gen.r_alpha_pos],
    "Coding-Decoding": [gen.r_coding], "Classification": [gen.r_odd_one], "Odd One Out": [gen.r_odd_one], "Direction": [gen.r_direction],
    "Direction Sense": [gen.r_direction], "Ranking": [gen.r_rank], "Order & Ranking": [gen.r_rank], "Calendar": [gen.r_calendar], "Clock": [gen.r_clock],
    "Analogy": [gen.r_analogy], "Blood Relation": [r_blood], "Syllogism": [r_syllogism], "Age": [gen.r_age], "Problems on Age": [gen.r_age],
    "Percentage": [gen.m_percent], "Profit & Loss": [gen.m_profit, gen.m_discount], "Discount": [gen.m_discount], "Simple Interest": [gen.m_si],
    "Compound Interest": [gen.m_ci], "Ratio & Proportion": [gen.m_ratio], "Average": [gen.m_avg], "Time & Work": [gen.m_work, m_pipes],
    "Pipes & Cistern": [m_pipes], "Speed Time Distance": [gen.m_speed, gen.m_train], "Number System": [gen.m_lcm, gen.m_sqrt], "LCM & HCF": [gen.m_lcm],
    "Simplification": [gen.m_bodmas, gen.m_sqrt], "Mensuration": [m_mensuration], "Algebra": [m_algebra], "Trigonometry": [m_trig],
    "Mixture & Alligation": [m_mixture], "Data Interpretation": [m_di],
}


def gen_topic(topic, seed, n):
    funcs = TOPIC_GENS.get(topic)
    if not funcs or n <= 0:
        return []
    rng, out, tries = random.Random(seed), [], 0
    while len(out) < n and tries < n * 60:  # unique questions; cap attempts for topics with few variants
        tries += 1
        q = rng.choice(funcs)(rng)
        if all((q["q"], tuple(sorted(q["o"]))) != (x["q"], tuple(sorted(x["o"]))) for x in out):
            out.append(q)
    return out
