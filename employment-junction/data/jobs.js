// ✏️ Saari job updates is file mein hain. Nayi update add karne ke liye ek naya { ... } block copy karke upar paste karein.
//
// type:  "job" | "admit" | "result" | "answer" | "syllabus"
// qualification: "10th" | "12th" | "ITI" | "Diploma" | "Graduate" | "Post Graduate"
// Dates: "YYYY-MM-DD"
//
// ⚠️ Neeche diye gaye entries SAMPLE hain (sample: true) – sirf design dikhane ke liye.
// Publish karne se pehle inhe asli notifications se replace karein aur "sample" line hata dein.
window.EJ_JOBS = [
  {
    id: "ssc-cgl-sample", sample: true, type: "job",
    title: "SSC Combined Graduate Level (CGL) Exam", org: "Staff Selection Commission",
    category: "SSC", state: "All India", qualification: "Graduate",
    posts: 15000, posted: "2026-11-20", startDate: "2026-11-20", lastDate: "2026-12-20",
    age: "18 – 32 years", fee: "Gen/OBC ₹100 · SC/ST/Female ₹0",
    officialLink: "https://ssc.gov.in"
  },
  {
    id: "rrb-ntpc-sample", sample: true, type: "job",
    title: "RRB NTPC Graduate & Undergraduate Posts", org: "Railway Recruitment Board",
    category: "Railway", state: "All India", qualification: "12th",
    posts: 11000, posted: "2026-11-18", startDate: "2026-11-18", lastDate: "2026-12-10",
    age: "18 – 33 years", fee: "Gen/OBC ₹500 · SC/ST ₹250",
    officialLink: "https://indianrailways.gov.in"
  },
  {
    id: "ibps-po-sample", sample: true, type: "job",
    title: "IBPS Probationary Officer (PO)", org: "Institute of Banking Personnel Selection",
    category: "Bank", state: "All India", qualification: "Graduate",
    posts: 4500, posted: "2026-11-15", startDate: "2026-11-15", lastDate: "2026-11-30",
    age: "20 – 30 years", fee: "Gen/OBC ₹850 · SC/ST ₹175",
    officialLink: "https://www.ibps.in"
  },
  {
    id: "gsssb-sample", sample: true, type: "job",
    title: "Gujarat Police Lok Rakshak (LRD) Bharti", org: "Gujarat Police Recruitment Board",
    category: "Police", state: "Gujarat", qualification: "12th",
    posts: 12000, posted: "2026-11-12", startDate: "2026-11-12", lastDate: "2026-12-05",
    age: "18 – 33 years", fee: "Gen ₹100 · Reserved ₹0",
    officialLink: "https://ojas.gujarat.gov.in"
  },
  {
    id: "army-agniveer-sample", sample: true, type: "job",
    title: "Indian Army Agniveer Rally Bharti", org: "Indian Army",
    category: "Defence", state: "All India", qualification: "10th",
    posts: 25000, posted: "2026-11-10", startDate: "2026-11-10", lastDate: "2026-12-15",
    age: "17.5 – 21 years", fee: "₹250 (sabhi ke liye)",
    officialLink: "https://joinindianarmy.nic.in"
  },
  {
    id: "kvs-sample", sample: true, type: "job",
    title: "KVS Teacher Recruitment (PGT / TGT / PRT)", org: "Kendriya Vidyalaya Sangathan",
    category: "Teaching", state: "All India", qualification: "Post Graduate",
    posts: 6000, posted: "2026-11-08", startDate: "2026-11-08", lastDate: "2026-11-28",
    age: "Max 30 – 40 years (post anusaar)", fee: "₹1500 · SC/ST/PwD ₹0",
    officialLink: "https://kvsangathan.nic.in"
  },
  {
    id: "iti-apprentice-sample", sample: true, type: "job",
    title: "Railway Apprentice (ITI) Bharti", org: "Railway Recruitment Cell",
    category: "Railway", state: "Maharashtra", qualification: "ITI",
    posts: 2400, posted: "2026-11-05", startDate: "2026-11-05", lastDate: "2026-11-25",
    age: "15 – 24 years", fee: "₹100 · SC/ST/Female ₹0",
    officialLink: "https://indianrailways.gov.in"
  },
  {
    id: "ssc-gd-admit-sample", sample: true, type: "admit",
    title: "SSC GD Constable Admit Card", org: "Staff Selection Commission",
    category: "SSC", state: "All India", qualification: "10th",
    posted: "2026-11-19", officialLink: "https://ssc.gov.in"
  },
  {
    id: "upsc-pre-admit-sample", sample: true, type: "admit",
    title: "UPSC Civil Services Mains Admit Card", org: "Union Public Service Commission",
    category: "UPSC", state: "All India", qualification: "Graduate",
    posted: "2026-11-14", officialLink: "https://upsc.gov.in"
  },
  {
    id: "sbi-clerk-result-sample", sample: true, type: "result",
    title: "SBI Clerk Prelims Result", org: "State Bank of India",
    category: "Bank", state: "All India", qualification: "Graduate",
    posted: "2026-11-17", officialLink: "https://sbi.co.in/web/careers"
  },
  {
    id: "rpsc-result-sample", sample: true, type: "result",
    title: "RPSC RAS Pre Result", org: "Rajasthan Public Service Commission",
    category: "State PSC", state: "Rajasthan", qualification: "Graduate",
    posted: "2026-11-09", officialLink: "https://rpsc.rajasthan.gov.in"
  },
  {
    id: "ctet-answer-sample", sample: true, type: "answer",
    title: "CTET Answer Key", org: "Central Board of Secondary Education",
    category: "Teaching", state: "All India", qualification: "Graduate",
    posted: "2026-11-16", officialLink: "https://ctet.nic.in"
  },
  {
    id: "rrb-group-d-syllabus-sample", sample: true, type: "syllabus",
    title: "RRB Group D Syllabus & Exam Pattern", org: "Railway Recruitment Board",
    category: "Railway", state: "All India", qualification: "10th",
    posted: "2026-11-11", officialLink: "https://indianrailways.gov.in"
  }
];
