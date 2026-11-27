"""Build engine/mock/data/blueprints.json (exam blueprints + master topic list)."""
import json, sys

OUT = "/home/user/AkshayKhoyani/employment-junction/engine/mock/data/blueprints.json"
EST = "estimated from recent papers"
OFF = "official"

SSC_LANGS = ["English", "Hindi", "Assamese", "Bengali", "Gujarati", "Kannada", "Konkani",
             "Malayalam", "Manipuri", "Marathi", "Odia", "Punjabi", "Tamil", "Telugu", "Urdu"]
RRB_LANGS = SSC_LANGS  # RRB CBTs are offered in the same 15 languages

# ---- topic -> family --------------------------------------------------------
FAMILY = {}
def fam(family, *topics):
    for t in topics:
        FAMILY[t] = family

fam("Quantitative Aptitude",
    "Number System", "Simplification", "Approximation", "HCF & LCM", "Surds & Indices", "Percentage",
    "Profit & Loss", "Discount", "Ratio & Proportion", "Partnership", "Average", "Ages", "Simple Interest",
    "Compound Interest", "Time & Work", "Pipes & Cisterns", "Speed Time Distance", "Boats & Streams",
    "Mixture & Alligation", "Mensuration", "Geometry", "Coordinate Geometry", "Algebra", "Trigonometry",
    "Height & Distance", "Statistics", "Probability", "Permutation & Combination", "Data Interpretation",
    "Data Sufficiency", "Number Series", "Quadratic Equations", "Arithmetic Word Problems", "Calendar & Clock")
fam("Reasoning",
    "Analogy", "Classification", "Series", "Coding-Decoding", "Blood Relation", "Direction", "Syllogism",
    "Venn Diagram", "Order & Ranking", "Seating Arrangement", "Puzzle", "Inequality", "Alphanumeric Series",
    "Mathematical Operations", "Missing Number", "Dictionary Order", "Statement & Conclusion",
    "Paper Folding & Cutting", "Mirror & Water Image", "Embedded Figures", "Counting Figures",
    "Pattern Completion", "Dice & Cube", "Calendar", "Clock", "Logical Deduction", "Matrix",
    "Non-Verbal Reasoning", "Decision Making", "Critical Reasoning")
fam("English",
    "Reading Comprehension", "Cloze Test", "Error Spotting", "Sentence Improvement", "Fill in the Blanks",
    "Synonyms", "Antonyms", "One Word Substitution", "Idioms & Phrases", "Spelling Correction",
    "Para Jumbles", "Active Passive Voice", "Direct Indirect Speech", "Word Usage", "Grammar", "Vocabulary")
fam("Hindi",
    "Hindi Grammar", "Sandhi", "Samas", "Muhavare & Lokoktiyan", "Paryayvachi", "Vilom Shabd",
    "Tatsam Tadbhav", "Vakya Shuddhi", "Ras Chhand Alankar", "Hindi Sahitya", "Hindi Reading Comprehension",
    "Upsarg Pratyay", "Anekarthi & Ek Shabd")
fam("Gujarati",
    "Gujarati Grammar", "Gujarati Vocabulary", "Gujarati Reading Comprehension", "Gujarati Sahitya",
    "Gujarati Idioms & Proverbs", "Gujarati Sandhi & Samas", "Gujarati Spelling (Jodani)")
fam("General Awareness",
    "Ancient History", "Medieval History", "Modern History", "Art & Culture", "Polity", "Indian Geography",
    "World Geography", "Economy", "Environment & Ecology", "Static GK", "Current Affairs", "Sports",
    "Awards & Honours", "Books & Authors", "Important Days", "International Relations", "Government Schemes",
    "Banking Awareness", "Railways GK", "Science & Technology", "Public Administration", "Rights & RTI",
    "Social Issues", "Disaster Management")
fam("General Science", "Physics", "Chemistry", "Biology")
fam("Computer", "Computer")
fam("Regional GK",
    "Gujarat History", "Gujarat Geography", "Gujarat Culture", "Gujarat Current Affairs", "Gujarat Economy",
    "Gujarat Panchayati Raj", "Uttar Pradesh GK", "Bihar GK", "Delhi GK", "State GK")
fam("Pedagogy",
    "Child Development & Pedagogy", "Inclusive Education", "Learning & Pedagogy", "Language Pedagogy",
    "Mathematics Pedagogy", "EVS Pedagogy", "Science Pedagogy", "Social Studies Pedagogy")
fam("Teaching Subject Content",
    "Mathematics Content", "EVS Content", "Science Content", "History Content", "Geography Content",
    "Social & Political Life Content", "Language Comprehension")

# ---- reusable section templates ------------------------------------------
def S(name, questions, topics, basis=EST, **kw):
    d = {"name": name, "questions": questions, "topics": topics, "weight_basis": basis}
    d.update(kw)
    return d

SSC_REASONING_25 = {"Analogy": 3, "Classification": 3, "Series": 3, "Coding-Decoding": 2,
    "Mathematical Operations": 2, "Missing Number": 1, "Blood Relation": 1, "Direction": 1,
    "Syllogism": 1, "Venn Diagram": 1, "Order & Ranking": 1, "Seating Arrangement": 1,
    "Dictionary Order": 1, "Paper Folding & Cutting": 1, "Mirror & Water Image": 1,
    "Embedded Figures": 1, "Counting Figures": 1}
SSC_GA_25 = {"Ancient History": 1, "Medieval History": 1, "Modern History": 2, "Art & Culture": 2,
    "Polity": 3, "Indian Geography": 2, "World Geography": 1, "Economy": 2, "Physics": 1,
    "Chemistry": 1, "Biology": 2, "Static GK": 2, "Sports": 1, "Awards & Honours": 1,
    "Current Affairs": 3}
CGL_QUANT_25 = {"Number System": 2, "Simplification": 1, "HCF & LCM": 1, "Percentage": 1,
    "Profit & Loss": 2, "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 1, "Speed Time Distance": 1, "Algebra": 2,
    "Geometry": 3, "Mensuration": 2, "Trigonometry": 2, "Height & Distance": 1,
    "Statistics": 1, "Data Interpretation": 1}
CGL_ENG_25 = {"Reading Comprehension": 5, "Cloze Test": 5, "Error Spotting": 2,
    "Sentence Improvement": 2, "Fill in the Blanks": 2, "Synonyms": 1, "Antonyms": 1,
    "One Word Substitution": 2, "Idioms & Phrases": 2, "Spelling Correction": 2, "Para Jumbles": 1}
CHSL_QUANT_25 = {"Number System": 2, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 2, "Discount": 1, "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 1, "Speed Time Distance": 1, "Algebra": 2, "Geometry": 2,
    "Mensuration": 2, "Trigonometry": 2, "Data Interpretation": 1}
CHSL_ENG_25 = {"Reading Comprehension": 5, "Cloze Test": 5, "Error Spotting": 2,
    "Sentence Improvement": 1, "Fill in the Blanks": 2, "Synonyms": 1, "Antonyms": 1,
    "One Word Substitution": 2, "Idioms & Phrases": 2, "Spelling Correction": 1,
    "Active Passive Voice": 1, "Direct Indirect Speech": 1, "Para Jumbles": 1}

MTS_QUANT_20 = {"Number System": 2, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 2, "Ratio & Proportion": 1, "Average": 2, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 2, "Speed Time Distance": 1, "Mensuration": 2,
    "Data Interpretation": 1}
MTS_REAS_20 = {"Analogy": 2, "Classification": 2, "Series": 3, "Coding-Decoding": 2,
    "Mathematical Operations": 2, "Missing Number": 1, "Blood Relation": 1, "Direction": 1,
    "Order & Ranking": 1, "Venn Diagram": 1, "Paper Folding & Cutting": 1,
    "Mirror & Water Image": 1, "Embedded Figures": 1, "Counting Figures": 1}
MTS_GA_25 = {"Ancient History": 1, "Medieval History": 1, "Modern History": 2, "Art & Culture": 2,
    "Polity": 3, "Indian Geography": 2, "World Geography": 1, "Economy": 2, "Physics": 2,
    "Chemistry": 2, "Biology": 2, "Static GK": 2, "Sports": 1, "Current Affairs": 2}
MTS_ENG_25 = {"Reading Comprehension": 5, "Cloze Test": 5, "Error Spotting": 2,
    "Sentence Improvement": 2, "Fill in the Blanks": 2, "Synonyms": 2, "Antonyms": 2,
    "One Word Substitution": 2, "Idioms & Phrases": 1, "Spelling Correction": 2}

GD_REAS_20 = {"Analogy": 3, "Classification": 3, "Series": 3, "Coding-Decoding": 2,
    "Mathematical Operations": 1, "Missing Number": 1, "Blood Relation": 1, "Direction": 1,
    "Order & Ranking": 1, "Venn Diagram": 1, "Paper Folding & Cutting": 1, "Mirror & Water Image": 1,
    "Counting Figures": 1}
GD_GK_20 = {"Ancient History": 1, "Medieval History": 1, "Modern History": 2, "Art & Culture": 1,
    "Polity": 2, "Indian Geography": 2, "World Geography": 1, "Economy": 1, "Physics": 1,
    "Chemistry": 1, "Biology": 2, "Static GK": 1, "Sports": 1, "Current Affairs": 3}
GD_MATH_20 = {"Number System": 2, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 2, "Discount": 1, "Ratio & Proportion": 1, "Average": 2, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 2, "Speed Time Distance": 1, "Mensuration": 2}
GD_ENG_20 = {"Reading Comprehension": 5, "Cloze Test": 5, "Error Spotting": 1,
    "Fill in the Blanks": 2, "Synonyms": 2, "Antonyms": 2, "One Word Substitution": 1,
    "Idioms & Phrases": 1, "Spelling Correction": 1}
GD_HIN_20 = {"Hindi Reading Comprehension": 5, "Hindi Grammar": 3, "Sandhi": 1, "Samas": 1,
    "Paryayvachi": 2, "Vilom Shabd": 2, "Muhavare & Lokoktiyan": 2, "Tatsam Tadbhav": 1,
    "Vakya Shuddhi": 2, "Anekarthi & Ek Shabd": 1}

CPO_REAS_50 = {"Analogy": 5, "Classification": 5, "Series": 5, "Coding-Decoding": 4,
    "Mathematical Operations": 3, "Missing Number": 3, "Blood Relation": 2, "Direction": 2,
    "Syllogism": 2, "Venn Diagram": 2, "Order & Ranking": 2, "Seating Arrangement": 2,
    "Dictionary Order": 1, "Statement & Conclusion": 2, "Paper Folding & Cutting": 2,
    "Mirror & Water Image": 2, "Embedded Figures": 2, "Counting Figures": 2, "Pattern Completion": 2}
CPO_GA_50 = {"Ancient History": 3, "Medieval History": 3, "Modern History": 4, "Art & Culture": 3,
    "Polity": 6, "Indian Geography": 4, "World Geography": 2, "Economy": 4, "Physics": 3,
    "Chemistry": 3, "Biology": 4, "Static GK": 3, "Sports": 2, "Awards & Honours": 1,
    "Books & Authors": 1, "Current Affairs": 4}
CPO_QUANT_50 = {"Number System": 3, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 3, "Discount": 1, "Ratio & Proportion": 2, "Partnership": 1, "Average": 2,
    "Simple Interest": 1, "Compound Interest": 1, "Time & Work": 2, "Pipes & Cisterns": 1,
    "Speed Time Distance": 2, "Boats & Streams": 1, "Mixture & Alligation": 1, "Algebra": 5,
    "Geometry": 6, "Mensuration": 4, "Trigonometry": 4, "Height & Distance": 1, "Statistics": 1,
    "Data Interpretation": 3}
CPO_ENG_50 = {"Reading Comprehension": 10, "Cloze Test": 5, "Error Spotting": 5,
    "Sentence Improvement": 5, "Fill in the Blanks": 4, "Synonyms": 2, "Antonyms": 2,
    "One Word Substitution": 3, "Idioms & Phrases": 3, "Spelling Correction": 2,
    "Active Passive Voice": 3, "Direct Indirect Speech": 3, "Para Jumbles": 3}

NTPC_MATH_30 = {"Number System": 3, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 2, "Ratio & Proportion": 2, "Average": 2, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 2, "Speed Time Distance": 2, "Algebra": 2, "Geometry": 2,
    "Mensuration": 2, "Trigonometry": 1, "Statistics": 1, "Data Interpretation": 1, "Ages": 1}
NTPC_REAS_30 = {"Analogy": 2, "Classification": 2, "Series": 3, "Coding-Decoding": 3,
    "Mathematical Operations": 2, "Missing Number": 1, "Blood Relation": 2, "Direction": 2,
    "Syllogism": 2, "Venn Diagram": 1, "Order & Ranking": 1, "Seating Arrangement": 2, "Puzzle": 2,
    "Statement & Conclusion": 2, "Data Sufficiency": 1, "Calendar": 1, "Dictionary Order": 1}
NTPC_GA_40 = {"Ancient History": 2, "Medieval History": 2, "Modern History": 3, "Art & Culture": 2,
    "Polity": 4, "Indian Geography": 3, "World Geography": 1, "Economy": 3, "Physics": 2,
    "Chemistry": 2, "Biology": 2, "Computer": 2, "Static GK": 3, "Sports": 1,
    "Awards & Honours": 1, "Government Schemes": 1, "Environment & Ecology": 1, "Current Affairs": 5}
GRD_MATH_25 = {"Number System": 2, "Simplification": 2, "HCF & LCM": 1, "Percentage": 2,
    "Profit & Loss": 2, "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 2, "Pipes & Cisterns": 1, "Speed Time Distance": 2,
    "Algebra": 1, "Geometry": 1, "Mensuration": 2, "Trigonometry": 1, "Ages": 1, "Calendar & Clock": 1}
GRD_REAS_30 = {"Analogy": 3, "Classification": 3, "Series": 3, "Coding-Decoding": 3,
    "Mathematical Operations": 3, "Missing Number": 1, "Blood Relation": 2, "Direction": 2,
    "Syllogism": 2, "Venn Diagram": 2, "Order & Ranking": 1, "Seating Arrangement": 1,
    "Statement & Conclusion": 2, "Data Sufficiency": 1, "Calendar": 1}
GRD_GS_25 = {"Physics": 9, "Chemistry": 8, "Biology": 8}
GRD_GA_20 = {"Modern History": 2, "Ancient History": 1, "Art & Culture": 1, "Polity": 2,
    "Indian Geography": 2, "Economy": 2, "Static GK": 2, "Sports": 1, "Computer": 1,
    "Government Schemes": 1, "Current Affairs": 5}
ALP_MATH_20 = {"Number System": 2, "Simplification": 1, "HCF & LCM": 1, "Percentage": 1,
    "Profit & Loss": 1, "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1,
    "Compound Interest": 1, "Time & Work": 1, "Pipes & Cisterns": 1, "Speed Time Distance": 1,
    "Algebra": 1, "Geometry": 1, "Mensuration": 2, "Trigonometry": 1, "Ages": 1, "Statistics": 1}
ALP_REAS_25 = {"Analogy": 2, "Classification": 2, "Series": 3, "Coding-Decoding": 2,
    "Mathematical Operations": 2, "Blood Relation": 2, "Direction": 2, "Syllogism": 2,
    "Venn Diagram": 1, "Seating Arrangement": 2, "Puzzle": 1, "Statement & Conclusion": 2,
    "Data Sufficiency": 1, "Calendar": 1}
ALP_GS_20 = {"Physics": 8, "Chemistry": 6, "Biology": 6}
ALP_GA_10 = {"Polity": 1, "Indian Geography": 1, "Modern History": 1, "Economy": 1,
    "Static GK": 1, "Computer": 1, "Current Affairs": 4}

BANK_ENG_30_PO = {"Reading Comprehension": 10, "Cloze Test": 5, "Para Jumbles": 5,
    "Fill in the Blanks": 4, "Error Spotting": 3, "Word Usage": 3}
BANK_ENG_30_CLERK = {"Reading Comprehension": 8, "Cloze Test": 5, "Para Jumbles": 4,
    "Fill in the Blanks": 5, "Error Spotting": 5, "Word Usage": 3}
PO_QUANT_35 = {"Data Interpretation": 12, "Number Series": 5, "Quadratic Equations": 5,
    "Approximation": 3, "Profit & Loss": 2, "Percentage": 1, "Ratio & Proportion": 1,
    "Time & Work": 1, "Speed Time Distance": 1, "Simple Interest": 1, "Average": 1,
    "Mixture & Alligation": 1, "Probability": 1}
PO_REAS_35 = {"Puzzle": 10, "Seating Arrangement": 8, "Syllogism": 3, "Inequality": 3,
    "Blood Relation": 2, "Direction": 2, "Coding-Decoding": 2, "Order & Ranking": 2,
    "Alphanumeric Series": 3}
CLERK_QUANT_35 = {"Simplification": 10, "Approximation": 2, "Number Series": 5,
    "Data Interpretation": 8, "Quadratic Equations": 0, "Percentage": 1, "Profit & Loss": 2,
    "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1, "Time & Work": 1,
    "Speed Time Distance": 1, "Ages": 1, "Mixture & Alligation": 1}
CLERK_REAS_35 = {"Puzzle": 10, "Seating Arrangement": 6, "Syllogism": 3, "Inequality": 3,
    "Blood Relation": 3, "Direction": 2, "Coding-Decoding": 3, "Order & Ranking": 2,
    "Alphanumeric Series": 3}

def drop_zero(d):
    return {k: v for k, v in d.items() if v}

B = {}

# ---------------- SSC ----------------
B["ssc-cgl-tier-1"] = {
    "exam": "SSC CGL Tier 1",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Combined Graduate Level Examination 2025 (Scheme of Examination, Tier-I)",
    "duration_min": 60, "negative": 0.5, "marks_per_q": 2, "total_questions": 100, "total_marks": 200,
    "languages": SSC_LANGS,
    "sections": [
        S("General Intelligence & Reasoning", 25, SSC_REASONING_25),
        S("General Awareness", 25, SSC_GA_25),
        S("Quantitative Aptitude", 25, CGL_QUANT_25, note="Basic arithmetical skill"),
        S("English Comprehension", 25, CGL_ENG_25, languages=["English"]),
    ],
    "notes": "Section question counts, 2 marks/Q, 0.50 negative and 60 min are official (scribe: 80 min). "
             "English section is in English only; other sections in English, Hindi and 13 regional languages. "
             "Topic weights within sections are estimated from 2024-2025 Tier-1 shifts.",
}
B["ssc-chsl-tier-1"] = {
    "exam": "SSC CHSL Tier 1",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Combined Higher Secondary (10+2) Level Examination 2025, Tier-I scheme",
    "duration_min": 60, "negative": 0.5, "marks_per_q": 2, "total_questions": 100, "total_marks": 200,
    "languages": SSC_LANGS,
    "sections": [
        S("English Language (Basic Knowledge)", 25, CHSL_ENG_25, languages=["English"]),
        S("General Intelligence", 25, SSC_REASONING_25),
        S("Quantitative Aptitude (Basic Arithmetic Skill)", 25, CHSL_QUANT_25),
        S("General Awareness", 25, SSC_GA_25),
    ],
    "notes": "Pattern official (4 x 25 Q, 2 marks each, -0.50, 60 min). Topic weights estimated from 2024-2025 Tier-1 papers.",
}
B["ssc-mts"] = {
    "exam": "SSC MTS (Non-Technical) & Havaldar CBE",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination 2025",
    "duration_min": 90, "negative": 1, "marks_per_q": 3, "total_questions": 90, "total_marks": 270,
    "languages": SSC_LANGS,
    "sessions": [
        {"session": "Session-I", "duration_min": 45, "negative": 0, "sections": ["Numerical and Mathematical Ability", "Reasoning Ability and Problem Solving"]},
        {"session": "Session-II", "duration_min": 45, "negative": 1, "sections": ["General Awareness", "English Language and Comprehension"]},
    ],
    "sections": [
        S("Numerical and Mathematical Ability", 20, MTS_QUANT_20, session="Session-I", negative=0),
        S("Reasoning Ability and Problem Solving", 20, MTS_REAS_20, session="Session-I", negative=0),
        S("General Awareness", 25, MTS_GA_25, session="Session-II", negative=1),
        S("English Language and Comprehension", 25, MTS_ENG_25, session="Session-II", negative=1, languages=["English"]),
    ],
    "notes": "Two sessions of 45 min each, both compulsory; 3 marks per question. No negative marking in Session-I; "
             "1 mark deducted per wrong answer in Session-II (section-level 'negative' overrides the top-level value). "
             "Havaldar candidates additionally take PET/PST. Topic weights estimated from 2023-2025 papers.",
}
B["ssc-gd-constable"] = {
    "exam": "SSC GD Constable",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Constables (GD) in CAPFs, SSF, Rifleman (GD) in Assam Rifles and Sepoy in NCB Examination, 2026",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 2, "total_questions": 80, "total_marks": 160,
    "languages": SSC_LANGS,
    "sections": [
        S("General Intelligence and Reasoning", 20, GD_REAS_20),
        S("General Knowledge and General Awareness", 20, GD_GK_20),
        S("Elementary Mathematics", 20, GD_MATH_20),
        S("English / Hindi", 20, GD_ENG_20, alt_topics={"Hindi": GD_HIN_20},
          note="Candidate attempts either English or Hindi; 'topics' is the English variant, 'alt_topics.Hindi' the Hindi variant."),
    ],
    "notes": "80 Q x 2 marks, 60 min, 0.25 marks negative per wrong answer (official). Language part: English or Hindi. Topic weights estimated.",
}
B["ssc-cpo-paper-1"] = {
    "exam": "SSC CPO (SI in Delhi Police & CAPFs) Paper 1",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Sub-Inspector in Delhi Police and Central Armed Police Forces Examination 2025",
    "duration_min": 120, "negative": 0.25, "marks_per_q": 1, "total_questions": 200, "total_marks": 200,
    "languages": ["English", "Hindi"],
    "sections": [
        S("General Intelligence and Reasoning", 50, CPO_REAS_50),
        S("General Knowledge and General Awareness", 50, CPO_GA_50),
        S("Quantitative Aptitude", 50, CPO_QUANT_50),
        S("English Comprehension", 50, CPO_ENG_50, languages=["English"]),
    ],
    "notes": "Paper-I: 4 x 50 Q, 1 mark each, -0.25, 2 hours (official). Topic weights estimated from 2023-2025 papers.",
}

# ---------------- RRB ----------------
B["rrb-ntpc-graduate-cbt-1"] = {
    "exam": "RRB NTPC (Graduate) CBT 1",
    "source": "https://www.rrbcdg.gov.in/",
    "source_doc": "RRB Centralised Employment Notice CEN 06/2025 (NTPC Graduate), Annexure: Scheme of Examination",
    "duration_min": 90, "negative": 0.3333, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": RRB_LANGS,
    "sections": [
        S("General Awareness", 40, NTPC_GA_40),
        S("Mathematics", 30, NTPC_MATH_30),
        S("General Intelligence and Reasoning", 30, NTPC_REAS_30),
    ],
    "notes": "100 Q, 90 min (120 min for PwBD with scribe), 1/3 negative (official). CBT-1 is qualifying/screening. Topic weights estimated from 2024-2025 CBT-1 shifts.",
}
B["rrb-ntpc-undergraduate-cbt-1"] = {
    "exam": "RRB NTPC (Undergraduate) CBT 1",
    "source": "https://www.rrbcdg.gov.in/",
    "source_doc": "RRB Centralised Employment Notice CEN 07/2025 (NTPC Undergraduate), Annexure: Scheme of Examination",
    "duration_min": 90, "negative": 0.3333, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": RRB_LANGS,
    "sections": [
        S("General Awareness", 40, NTPC_GA_40),
        S("Mathematics", 30, NTPC_MATH_30),
        S("General Intelligence and Reasoning", 30, NTPC_REAS_30),
    ],
    "notes": "Same scheme as Graduate CBT-1; difficulty pitched at 10+2 level. Topic weights estimated.",
}
B["rrb-group-d"] = {
    "exam": "RRB Group D (Level 1) CBT",
    "source": "https://www.rrbcdg.gov.in/",
    "source_doc": "RRB Centralised Employment Notice CEN 08/2024 (Level-1), Scheme of CBT",
    "duration_min": 90, "negative": 0.3333, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": RRB_LANGS,
    "sections": [
        S("General Science", 25, GRD_GS_25, note="Physics, Chemistry, Life Sciences at 10th (CBSE) level"),
        S("Mathematics", 25, GRD_MATH_25),
        S("General Intelligence and Reasoning", 30, GRD_REAS_30),
        S("General Awareness and Current Affairs", 20, GRD_GA_20),
    ],
    "notes": "Section counts, 90 min, 1/3 negative are official. Topic weights estimated from 2022 and 2025 CBT papers.",
}
B["rrb-alp-cbt-1"] = {
    "exam": "RRB ALP CBT 1",
    "source": "https://www.rrbcdg.gov.in/",
    "source_doc": "RRB Centralised Employment Notice CEN 01/2025 (Assistant Loco Pilot), Scheme of CBT-1",
    "duration_min": 60, "negative": 0.3333, "marks_per_q": 1, "total_questions": 75, "total_marks": 75,
    "languages": RRB_LANGS,
    "sections": [
        S("Mathematics", 20, ALP_MATH_20),
        S("General Intelligence and Reasoning", 25, ALP_REAS_25),
        S("Basic Science and Engineering", 20, ALP_GS_20, note="Physics/Chemistry/Biology plus engineering drawing, units, measurement, work-power-energy, heat; mapped to Physics/Chemistry/Biology"),
        S("General Awareness on Current Affairs", 10, ALP_GA_10),
    ],
    "notes": "75 Q, 60 min, 1/3 negative (official). CBT-1 is qualifying. Topic weights estimated.",
}

# ---------------- Banking ----------------
B["ibps-po-prelims"] = {
    "exam": "IBPS PO Prelims (CRP PO/MT-XVI)",
    "source": "https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "negative_rule": "0.25 of the marks assigned to the question",
    "languages": ["English", "Hindi"],
    "sectional_timing": True,
    "sections": [
        S("English Language", 30, BANK_ENG_30_PO, max_marks=30, marks_per_q=1, duration_min=20, languages=["English"]),
        S("Quantitative Aptitude", 35, PO_QUANT_35, max_marks=30, marks_per_q=round(30/35, 4), duration_min=20),
        S("Reasoning Ability", 35, PO_REAS_35, max_marks=40, marks_per_q=round(40/35, 4), duration_min=20),
    ],
    "notes": "Official (CRP PO/MT-XVI, 2026): English 30Q/30M, Quant 35Q/30M, Reasoning 35Q/40M, each 20 min separately timed. "
             "Marks per question therefore differ by section (section-level marks_per_q overrides top level). "
             "Penalty = 1/4 of that question's marks. Topic weights estimated from 2024-2025 prelims.",
}
B["ibps-clerk-prelims"] = {
    "exam": "IBPS Clerk Prelims (CRP CSA-XV)",
    "source": "https://www.ibps.in/wp-content/uploads/DetailedNotification_CRP_CSA_XV_Final_for_Website_12.9.2025.pdf",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["English", "Hindi", "Assamese", "Bengali", "Gujarati", "Kannada", "Konkani", "Malayalam",
                  "Manipuri", "Marathi", "Odia", "Punjabi", "Tamil", "Telugu", "Urdu"],
    "sectional_timing": True,
    "sections": [
        S("English Language", 30, BANK_ENG_30_CLERK, duration_min=20, languages=["English"]),
        S("Numerical Ability", 35, drop_zero(CLERK_QUANT_35), duration_min=20),
        S("Reasoning Ability", 35, CLERK_REAS_35, duration_min=20),
    ],
    "notes": "Official CSA-XV (2025) scheme: 30/35/35 Q, 1 mark each, 20 min per section, -0.25. Numerical & Reasoning offered in English, Hindi and regional languages. "
             "CSA-XVI (2026) detailed notification was not found on ibps.in at time of writing; re-check. Topic weights estimated.",
}
B["sbi-clerk-prelims"] = {
    "exam": "SBI Clerk (Junior Associate) Prelims",
    "source": "https://sbi.bank.in/web/careers/current-openings",
    "source_doc": "SBI Advt. CRPD/CR/2025-26/06 (Junior Associates - Customer Support & Sales)",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["English", "Hindi", "regional languages as per SBI advertisement"],
    "sectional_timing": True,
    "sections": [
        S("English Language", 30, BANK_ENG_30_CLERK, duration_min=20, languages=["English"]),
        S("Numerical Ability", 35, drop_zero(CLERK_QUANT_35), duration_min=20),
        S("Reasoning Ability", 35, CLERK_REAS_35, duration_min=20),
    ],
    "notes": "30/35/35 Q, 20 min each, -0.25 per wrong answer per SBI 2025 JA scheme (as reported; the SBI PDF itself could not be fetched, so confirm). Topic weights estimated.",
}

# ---------------- Gujarat ----------------
B["gujarat-police-lrd"] = {
    "exam": "Gujarat Police Lokrakshak (LRD) Written Exam",
    "source": "https://gprb.gujarat.gov.in/",
    "source_doc": "Gujarat Police Recruitment Board - Lokrakshak cadre recruitment rules/notification (2025 scheme: Part A 80 + Part B 120)",
    "duration_min": 180, "negative": 0.25, "marks_per_q": 1, "total_questions": 200, "total_marks": 200,
    "languages": ["Gujarati"],
    "parts": {"Part A": 80, "Part B": 120},
    "sections": [
        S("Reasoning & Data Interpretation", 30, {"Analogy": 2, "Classification": 2, "Series": 3,
            "Coding-Decoding": 3, "Blood Relation": 2, "Direction": 2, "Syllogism": 2, "Venn Diagram": 1,
            "Order & Ranking": 2, "Seating Arrangement": 2, "Puzzle": 2, "Statement & Conclusion": 2,
            "Calendar": 1, "Clock": 1, "Data Interpretation": 3}, part="Part A"),
        S("Quantitative Aptitude", 30, {"Number System": 2, "Simplification": 2, "HCF & LCM": 1,
            "Percentage": 2, "Profit & Loss": 2, "Discount": 1, "Ratio & Proportion": 2, "Partnership": 1,
            "Average": 2, "Ages": 1, "Simple Interest": 2, "Compound Interest": 1, "Time & Work": 2,
            "Pipes & Cisterns": 1, "Speed Time Distance": 2, "Mixture & Alligation": 1, "Mensuration": 3,
            "Probability": 1, "Algebra": 1}, part="Part A"),
        S("Gujarati Language Comprehension", 20, {"Gujarati Reading Comprehension": 5,
            "Gujarati Grammar": 6, "Gujarati Vocabulary": 3, "Gujarati Idioms & Proverbs": 2,
            "Gujarati Sandhi & Samas": 2, "Gujarati Spelling (Jodani)": 2}, part="Part A"),
        S("The Constitution of India", 30, {"Polity": 26, "Rights & RTI": 2, "Public Administration": 2},
          part="Part B", note="Preamble, FR/DPSP/FD, Union & State executive/legislature/judiciary, Panchayati Raj, constitutional bodies, amendments"),
        S("Current Affairs, Science & Technology", 40, {"Current Affairs": 12, "Gujarat Current Affairs": 6,
            "Physics": 4, "Chemistry": 4, "Biology": 4, "Science & Technology": 4, "Computer": 3,
            "Environment & Ecology": 1, "Sports": 1, "Government Schemes": 1}, part="Part B"),
        S("History, Cultural Heritage & Geography", 50, {"Ancient History": 4, "Medieval History": 4,
            "Modern History": 7, "Gujarat History": 8, "Art & Culture": 4, "Gujarat Culture": 8,
            "Indian Geography": 6, "Gujarat Geography": 6, "World Geography": 3}, part="Part B"),
    ],
    "notes": "200 MCQ, 1 mark each, Part A 80 and Part B 120; minimum 40% required separately in each Part; "
             "-0.25 per wrong answer; option 'E' (not attempted) carries no penalty. Duration taken as 3 hours. "
             "Section marks per Part are from the GPRB 2025 scheme as reproduced by Gujarati exam portals - the GPRB PDF itself was not retrieved, so confirm. "
             "Topic weights estimated from the 2025 LRD paper and earlier GPRB papers.",
}
B["gsssb-cce-prelims"] = {
    "exam": "GSSSB CCE (Class-3 Group A & B) Preliminary",
    "source": "https://gsssb.gujarat.gov.in/",
    "source_doc": "GSSSB Advt. No. 212/2023-24 Combined Competitive Examination (Group A & Group B) - Preliminary test scheme",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["Gujarati", "English (English section)"],
    "sections": [
        S("Reasoning & Data Interpretation", 40, {"Analogy": 3, "Classification": 3, "Series": 4,
            "Coding-Decoding": 3, "Blood Relation": 3, "Direction": 3, "Syllogism": 3, "Venn Diagram": 2,
            "Order & Ranking": 2, "Seating Arrangement": 3, "Puzzle": 3, "Statement & Conclusion": 2,
            "Calendar": 1, "Clock": 1, "Data Interpretation": 4}),
        S("Quantitative Aptitude", 30, {"Number System": 2, "Simplification": 2, "HCF & LCM": 1,
            "Percentage": 2, "Profit & Loss": 2, "Discount": 1, "Ratio & Proportion": 2, "Partnership": 1,
            "Average": 2, "Ages": 1, "Simple Interest": 2, "Compound Interest": 1, "Time & Work": 2,
            "Pipes & Cisterns": 1, "Speed Time Distance": 2, "Boats & Streams": 1, "Mensuration": 3,
            "Probability": 1, "Algebra": 1}),
        S("English Language", 15, {"Grammar": 4, "Error Spotting": 2, "Fill in the Blanks": 2,
            "Synonyms": 1, "Antonyms": 1, "One Word Substitution": 1, "Idioms & Phrases": 1,
            "Active Passive Voice": 1, "Reading Comprehension": 2}, languages=["English"]),
        S("Gujarati Language", 15, {"Gujarati Grammar": 5, "Gujarati Vocabulary": 2,
            "Gujarati Idioms & Proverbs": 2, "Gujarati Sandhi & Samas": 2, "Gujarati Spelling (Jodani)": 2,
            "Gujarati Reading Comprehension": 2}, languages=["Gujarati"]),
    ],
    "notes": "Prelim is qualifying (100 MCQ / 100 marks / 60 min / -0.25), per the 2023-24 CCE scheme; final merit is from Mains "
             "(Group A 350 marks descriptive, Group B 200 MCQ). Some secondary sources describe a 150-mark prelim for the next cycle - "
             "NOT confirmed from a GSSSB PDF; re-check the next CCE advertisement. Topic weights estimated from the 2024 CCE prelim papers.",
}
B["gpssb-talati-cum-mantri"] = {
    "exam": "GPSSB Talati cum Mantri (Panchayat Secretary) Written",
    "source": "https://gpssb.gujarat.gov.in/",
    "source_doc": "GPSSB Advt. No. 10/2021-22 Talati cum Mantri, scheme of written examination (last held 7 May 2023)",
    "duration_min": 60, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["Gujarati", "English (English section)"],
    "sections": [
        S("General Awareness & General Knowledge", 50, {"Gujarat History": 4, "Gujarat Geography": 4,
            "Gujarat Culture": 5, "Ancient History": 2, "Medieval History": 2, "Modern History": 4,
            "Indian Geography": 3, "Polity": 5, "Gujarat Panchayati Raj": 4, "Economy": 2,
            "Physics": 2, "Chemistry": 1, "Biology": 2, "Computer": 2, "Current Affairs": 5,
            "Gujarat Current Affairs": 3}, basis=EST),
        S("Gujarati Language & Grammar", 20, {"Gujarati Grammar": 7, "Gujarati Vocabulary": 3,
            "Gujarati Idioms & Proverbs": 3, "Gujarati Sandhi & Samas": 3, "Gujarati Spelling (Jodani)": 2,
            "Gujarati Sahitya": 2}),
        S("English Language & Grammar", 20, {"Grammar": 5, "Error Spotting": 2, "Fill in the Blanks": 3,
            "Synonyms": 2, "Antonyms": 2, "One Word Substitution": 2, "Idioms & Phrases": 1,
            "Active Passive Voice": 1, "Direct Indirect Speech": 1, "Spelling Correction": 1},
          languages=["English"]),
        S("Mathematics (Quantitative)", 10, {"Number System": 1, "Percentage": 1, "Profit & Loss": 1,
            "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1, "Time & Work": 1,
            "Speed Time Distance": 1, "Mensuration": 1, "Ages": 1}),
    ],
    "notes": "Sections 50/20/20/10, 100 marks, 1 hour (GPSSB 2021-22 scheme). -0.25 negative as applied by GPSSB since 2022. "
             "Revenue Talati has since moved to GSSSB with a separate prelim+mains scheme, and Panchayat Talati cum Mantri has not been re-advertised; "
             "use this blueprint for Panchayat-cadre practice and re-check if GPSSB issues a new advertisement.",
}

# ---------------- State police ----------------
B["up-police-constable"] = {
    "exam": "UP Police Constable (Civil Police) Written",
    "source": "https://uppbpb.gov.in/",
    "source_doc": "UPPRPB Constable Civil Police direct recruitment notification - written exam scheme",
    "duration_min": 120, "negative": 0.5, "marks_per_q": 2, "total_questions": 150, "total_marks": 300,
    "languages": ["Hindi", "English"],
    "sections": [
        S("General Knowledge", 38, {"Ancient History": 2, "Medieval History": 2, "Modern History": 4,
            "Art & Culture": 2, "Polity": 4, "Indian Geography": 3, "World Geography": 1, "Economy": 3,
            "Physics": 2, "Chemistry": 1, "Biology": 2, "Computer": 2, "Uttar Pradesh GK": 4,
            "Current Affairs": 4, "Static GK": 2}),
        S("General Hindi", 37, {"Hindi Grammar": 4, "Sandhi": 3, "Samas": 3, "Muhavare & Lokoktiyan": 4,
            "Paryayvachi": 3, "Vilom Shabd": 3, "Tatsam Tadbhav": 3, "Vakya Shuddhi": 3,
            "Ras Chhand Alankar": 3, "Hindi Sahitya": 4, "Upsarg Pratyay": 2, "Anekarthi & Ek Shabd": 2},
          languages=["Hindi"]),
        S("Numerical & Mental Ability", 38, {"Number System": 3, "Simplification": 3, "HCF & LCM": 2,
            "Percentage": 3, "Profit & Loss": 3, "Discount": 1, "Ratio & Proportion": 3, "Partnership": 1,
            "Average": 3, "Ages": 1, "Simple Interest": 2, "Compound Interest": 2, "Time & Work": 3,
            "Speed Time Distance": 3, "Mensuration": 3, "Data Interpretation": 2}),
        S("Mental Aptitude, IQ & Reasoning", 37, {"Analogy": 4, "Classification": 3, "Series": 4,
            "Coding-Decoding": 3, "Blood Relation": 3, "Direction": 2, "Syllogism": 2, "Venn Diagram": 2,
            "Order & Ranking": 2, "Seating Arrangement": 2, "Mathematical Operations": 2,
            "Statement & Conclusion": 2, "Decision Making": 2, "Mirror & Water Image": 1,
            "Paper Folding & Cutting": 1, "Embedded Figures": 1, "Counting Figures": 1}),
    ],
    "notes": "150 Q x 2 marks = 300, 2 hours, -0.5 per wrong answer (official 2024 scheme; minimum 35% per subject in some cycles). "
             "Section counts 38/37/38/37 follow the 2024 exam. Topic weights estimated from Feb & Aug 2024 papers.",
}
B["delhi-police-constable"] = {
    "exam": "Delhi Police Constable (Executive)",
    "source": "https://ssc.gov.in/",
    "source_doc": "SSC Notice: Constable (Executive) Male and Female in Delhi Police Examination 2025",
    "duration_min": 90, "negative": 0.25, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["English", "Hindi"],
    "sections": [
        S("General Knowledge / Current Affairs", 50, {"Ancient History": 3, "Medieval History": 3,
            "Modern History": 5, "Art & Culture": 3, "Polity": 6, "Indian Geography": 4, "World Geography": 2,
            "Economy": 4, "Physics": 2, "Chemistry": 2, "Biology": 3, "Static GK": 3, "Sports": 2,
            "Delhi GK": 1, "Current Affairs": 7}),
        S("Reasoning", 25, SSC_REASONING_25),
        S("Numerical Ability", 15, {"Number System": 1, "Simplification": 1, "HCF & LCM": 1,
            "Percentage": 1, "Profit & Loss": 2, "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1,
            "Compound Interest": 1, "Time & Work": 1, "Speed Time Distance": 1, "Mensuration": 2,
            "Data Interpretation": 1}),
        S("Computer Fundamentals, MS Excel, MS Word, Communication, Internet, WWW and Web Browsers etc.", 10,
          {"Computer": 10}),
    ],
    "notes": "100 Q, 1 mark each, 90 min, -0.25 (official). Topic weights estimated from 2023 and 2025 papers.",
}
B["bihar-police-constable"] = {
    "exam": "Bihar Police Constable (CSBC) Written",
    "source": "https://csbc.bihar.gov.in/",
    "source_doc": "CSBC Advt. No. 01/2025 Constable recruitment - written exam scheme",
    "duration_min": 120, "negative": 0, "marks_per_q": 1, "total_questions": 100, "total_marks": 100,
    "languages": ["Hindi", "English"],
    "sections": [
        S("Hindi", 12, {"Hindi Grammar": 3, "Sandhi": 1, "Samas": 1, "Paryayvachi": 1, "Vilom Shabd": 1,
            "Muhavare & Lokoktiyan": 2, "Hindi Sahitya": 2, "Vakya Shuddhi": 1}, languages=["Hindi"]),
        S("English", 8, {"Grammar": 2, "Synonyms": 1, "Antonyms": 1, "Fill in the Blanks": 1,
            "One Word Substitution": 1, "Idioms & Phrases": 1, "Spelling Correction": 1}, languages=["English"]),
        S("Mathematics", 12, {"Number System": 1, "Simplification": 1, "Percentage": 1, "Profit & Loss": 1,
            "Ratio & Proportion": 1, "Average": 1, "Simple Interest": 1, "Time & Work": 1,
            "Speed Time Distance": 1, "Mensuration": 1, "Algebra": 1, "Ages": 1}),
        S("Science", 18, {"Physics": 6, "Chemistry": 6, "Biology": 6}),
        S("Social Science", 25, {"Ancient History": 3, "Medieval History": 3, "Modern History": 5,
            "Polity": 5, "Indian Geography": 4, "World Geography": 1, "Economy": 3, "Bihar GK": 1}),
        S("General Knowledge & Current Affairs", 25, {"Bihar GK": 5, "Current Affairs": 8, "Static GK": 3,
            "Sports": 2, "Awards & Honours": 2, "Art & Culture": 2, "Environment & Ecology": 1,
            "Government Schemes": 2}),
    ],
    "notes": "Official: 100 MCQ, 100 marks, 2 hours, Matric (10th) standard, subjects Hindi, English, Maths, Social Science, Science, GK & Current Affairs; "
             "minimum 30% to qualify; no negative marking. The notification does NOT give per-subject question counts - section counts here are estimated from 2023-2025 papers.",
    "section_counts_basis": EST,
}

# ---------------- Teaching ----------------
CDP_30 = {"Child Development & Pedagogy": 15, "Inclusive Education": 5, "Learning & Pedagogy": 10}
LANG_30 = {"Language Comprehension": 15, "Language Pedagogy": 15}
CTET_SRC = "https://ctet.nic.in/"
B["ctet-paper-1"] = {
    "exam": "CTET Paper 1 (Classes I-V)",
    "source": CTET_SRC, "source_doc": "CBSE CTET Information Bulletin (Feb 2026 session), Scheme & Syllabus Paper I",
    "duration_min": 150, "negative": 0, "marks_per_q": 1, "total_questions": 150, "total_marks": 150,
    "languages": ["English", "Hindi", "Language I/II chosen from the 20 CTET languages"],
    "sections": [
        S("Child Development and Pedagogy", 30, CDP_30, basis=OFF),
        S("Language I", 30, LANG_30, basis=OFF, note="Comprehension of unseen prose/poem + language pedagogy"),
        S("Language II", 30, LANG_30, basis=OFF),
        S("Mathematics", 30, {"Mathematics Content": 15, "Mathematics Pedagogy": 15}, basis=OFF),
        S("Environmental Studies", 30, {"EVS Content": 15, "EVS Pedagogy": 15}, basis=OFF),
    ],
    "notes": "5 x 30 Q, 1 mark each, 150 min, no negative marking (official). Content/pedagogy and CDP sub-splits are as printed in the CTET syllabus.",
}
B["ctet-paper-2-maths-science"] = {
    "exam": "CTET Paper 2 (Classes VI-VIII) - Mathematics & Science",
    "source": CTET_SRC, "source_doc": "CBSE CTET Information Bulletin (Feb 2026 session), Scheme & Syllabus Paper II",
    "duration_min": 150, "negative": 0, "marks_per_q": 1, "total_questions": 150, "total_marks": 150,
    "languages": ["English", "Hindi", "Language I/II chosen from the 20 CTET languages"],
    "sections": [
        S("Child Development and Pedagogy", 30, CDP_30, basis=OFF),
        S("Language I", 30, LANG_30, basis=OFF),
        S("Language II", 30, LANG_30, basis=OFF),
        S("Mathematics and Science", 60, {"Mathematics Content": 20, "Mathematics Pedagogy": 10,
            "Science Content": 20, "Science Pedagogy": 10}, basis=OFF),
    ],
    "notes": "For Maths & Science teachers. Official splits: Maths 30 (20 content + 10 pedagogy), Science 30 (20 + 10). No negative marking.",
}
B["ctet-paper-2-social-studies"] = {
    "exam": "CTET Paper 2 (Classes VI-VIII) - Social Studies/Social Science",
    "source": CTET_SRC, "source_doc": "CBSE CTET Information Bulletin (Feb 2026 session), Scheme & Syllabus Paper II",
    "duration_min": 150, "negative": 0, "marks_per_q": 1, "total_questions": 150, "total_marks": 150,
    "languages": ["English", "Hindi", "Language I/II chosen from the 20 CTET languages"],
    "sections": [
        S("Child Development and Pedagogy", 30, CDP_30, basis=OFF),
        S("Language I", 30, LANG_30, basis=OFF),
        S("Language II", 30, LANG_30, basis=OFF),
        S("Social Studies/Social Science", 60, {"History Content": 14, "Geography Content": 13,
            "Social & Political Life Content": 13, "Social Studies Pedagogy": 20}, basis=EST,
          note="Official: 40 content + 20 pedagogy; the 40 content split across History/Geography/SPL is estimated."),
    ],
    "notes": "For Social Studies teachers. No negative marking. Content-vs-pedagogy (40/20) is official; sub-split of content estimated.",
}

# ---------------- UPSC / State PSC ----------------
B["upsc-cse-prelims-gs-1"] = {
    "exam": "UPSC CSE Prelims GS Paper I",
    "source": "https://upsc.gov.in/examinations/active-exams",
    "source_doc": "UPSC Civil Services (Preliminary) Examination 2026 Notice, Appendix I (Scheme & Syllabus)",
    "duration_min": 120, "negative": 0.6667, "marks_per_q": 2, "total_questions": 100, "total_marks": 200,
    "languages": ["English", "Hindi"],
    "sections": [
        S("General Studies", 100, {"Polity": 15, "Economy": 14, "Environment & Ecology": 15,
            "Ancient History": 3, "Medieval History": 3, "Modern History": 10, "Art & Culture": 5,
            "Indian Geography": 8, "World Geography": 4, "Science & Technology": 10,
            "International Relations": 5, "Government Schemes": 3, "Current Affairs": 5}),
    ],
    "notes": "100 Q, 200 marks, 2 hours, 1/3 of the question's marks (0.66) deducted per wrong answer (official). "
             "GS-II (CSAT) is qualifying at 33% and is not covered here. Topic weights estimated from 2022-2025 papers.",
}
B["state-psc-prelims-generic"] = {
    "exam": "State PSC Prelims - General Studies (generic)",
    "source": "n/a (generic template)",
    "duration_min": 120, "negative": 0.3333, "marks_per_q": 1, "total_questions": 150, "total_marks": 150,
    "languages": ["English", "State official language"],
    "sections": [
        S("General Studies", 150, {"Ancient History": 6, "Medieval History": 6, "Modern History": 12,
            "Art & Culture": 6, "State GK": 20, "Polity": 15, "Economy": 12, "Indian Geography": 10,
            "World Geography": 4, "Environment & Ecology": 8, "Science & Technology": 10, "Physics": 2,
            "Chemistry": 2, "Biology": 3, "Current Affairs": 14, "Government Schemes": 4,
            "International Relations": 2, "Data Interpretation": 4, "Logical Deduction": 4,
            "Statement & Conclusion": 2, "Static GK": 4}),
    ],
    "notes": "Generic template - no single official source. Approximates GPSC/UPPSC/BPSC/RPSC/MPPSC GS papers (150 Q common; GPSC uses 200 marks over 2 papers, "
             "UPPSC 150 Q/200 marks with CSAT, BPSC 150 Q with 1/3 negative). Adjust per commission. 'State GK' should be expanded to that state's history/geography/culture.",
}

# ---------------- validation ----------------
errors = []
for slug, bp in B.items():
    tq = 0
    for s in bp["sections"]:
        tot = sum(s["topics"].values())
        if tot != s["questions"]:
            errors.append(f"{slug} / {s['name']}: topics sum {tot} != {s['questions']}")
        for alt, d in s.get("alt_topics", {}).items():
            if sum(d.values()) != s["questions"]:
                errors.append(f"{slug} / {s['name']} alt {alt}: {sum(d.values())}")
        for t in list(s["topics"]) + [t for d in s.get("alt_topics", {}).values() for t in d]:
            if t not in FAMILY:
                errors.append(f"{slug}: topic '{t}' has no family")
        tq += s["questions"]
    if tq != bp["total_questions"]:
        errors.append(f"{slug}: section total {tq} != total_questions {bp['total_questions']}")
if errors:
    print("\n".join(errors)); sys.exit(1)

used = {}
for slug, bp in B.items():
    for s in bp["sections"]:
        for t in list(s["topics"]) + [t for d in s.get("alt_topics", {}).values() for t in d]:
            used.setdefault(t, set()).add(slug)
topics = {t: {"family": FAMILY[t], "exams": sorted(used[t])} for t in sorted(used, key=lambda x: (FAMILY[x], x))}

out = {"_meta": {"generated": "2026-11-27",
                 "schema": "slug -> {exam, source, duration_min, negative (marks deducted per wrong answer), marks_per_q, sections[{name, questions, topics{topic:count}, weight_basis}], notes}. "
                           "Section-level negative / marks_per_q / duration_min override the exam-level values when present.",
                 "weight_basis_values": [OFF, EST]},
       "_topics": topics}
out.update(B)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("ok", len(B), "exams", len(topics), "topics")
