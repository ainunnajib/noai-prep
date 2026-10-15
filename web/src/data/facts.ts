/*
  Verified NOAI facts. Checked against the official NOAI microsite on 14 Oct 2026:
  https://noai.aisingapore.org/noai-2027/ and https://noai.aisingapore.org/faqs/
  Update this file when AI Singapore publishes changes; every page reads from here.
*/

export const FACTS_CHECKED_ON = '14 October 2026'

export const LINKS = {
  noai2027: 'https://noai.aisingapore.org/noai-2027/',
  faqs: 'https://noai.aisingapore.org/faqs/',
  resources: 'https://noai.aisingapore.org/learning-resources/',
  selfAssessment: 'https://noai.aisingapore.org/preliminary-trial/',
  about: 'https://noai.aisingapore.org/about-noai/',
  ioaiPage: 'https://noai.aisingapore.org/ioai/',
  ioaiSyllabus: 'https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf',
  ioai2027: 'https://ioai-official.org/singapore-2027/',
  final2026Repo: 'https://github.com/AISGNUSNOAI/NOAI-2026',
  noai2025Repo: 'https://github.com/AISGNUSNOAI/NOAI-2025',
  ioaiGithub: 'https://github.com/ioai-official',
  aicc: 'https://aicc-official.org/',
  /** this site's source code and issue tracker */
  siteIssues: 'https://github.com/ainunnajib/noai-prep/issues',
  prelim2026Pdf: 'https://aisingapore.org/wp-content/uploads/2026/04/NOAI-2026-Preliminary-Round-Assessment-300-MCQs-Google-Forms.pdf',
  final2026Pdf: 'https://aisingapore.org/wp-content/uploads/2026/04/NOAI-2026-Final-Assessment-Section-1-MCQs-Google-Forms.pdf',
}

export const CONTACT_EMAIL = 'noai@aisingapore.org'

/** Prelim 2027 */
export const PRELIM = {
  date: '2027-02-19T09:30:00+08:00',
  dateLabel: 'Friday 19 February 2027, 9:30 am',
  questions: 150,
  minutes: 90,
  secondsPerQuestion: 36,
  admin: '5 minutes for admin before the start',
  mode: 'Online Google Form quiz in your school computer lab, proctored on site',
  marking: '1 mark per correct answer, no deduction for wrong answers',
  materials: 'Pen and paper for rough work only. No calculator, notes, textbooks, AI tools or websites.',
  advance: 'Top 150 go to the Final (school seat quotas apply; no fixed cut-off)',
}

export const FINAL = {
  date: '2027-03-05T09:30:00+08:00',
  dateLabel: 'Friday 5 March 2027',
  format: 'Section 1: 20 MCQs on concepts and algorithms. Section 2: 3 Python programming tasks in Jupyter.',
  lastYear: 'In 2026 the Final was 3 hours at NTU, 100 marks (20 for MCQs, 80 for programming), with no internet.',
  results: 'Early April 2027: Gold, Silver, Bronze or Participation (tier only, no scores).',
}

export interface TimelineItem {
  date: string
  iso: string
  title: string
  detail: string
  key?: boolean
}

export const TIMELINE: TimelineItem[] = [
  { date: '1 Aug 2026 – 15 Jan 2027', iso: '2027-01-15', title: 'Schools register interest', detail: 'Ask your school’s NOAI teacher representative. Individual sign-ups from MOE students are not accepted.' },
  { date: 'by 27 Nov 2026', iso: '2026-11-27', title: 'Direct write-ins close', detail: 'Only for home-schooled SC/PR, students between schools, and private/international school students (case by case).' },
  { date: 'Fri 19 Feb 2027', iso: '2027-02-19', title: 'Preliminary Round', detail: '150 MCQs in 90 minutes at your school.', key: true },
  { date: 'Fri 5 Mar 2027', iso: '2027-03-05', title: 'Final Assessment', detail: 'Top 150: 20 MCQs + 3 Python programming tasks.', key: true },
  { date: 'Early Apr 2027', iso: '2027-04-10', title: 'Results', detail: 'Award tiers for finalists.' },
  { date: 'Sat 8 May 2027', iso: '2027-05-08', title: 'NTU Selection Test', detail: 'About the top 60 finalists are invited.' },
  { date: '22 May – 12 Jun 2027', iso: '2027-06-12', title: 'Weekend training at NTU', detail: 'Four Saturday sessions.' },
  { date: '14 – 18 Jun 2027', iso: '2027-06-18', title: 'Residential camp', detail: 'One week during the June holidays; final team selection.' },
  { date: '4 – 10 Jul 2027', iso: '2027-07-10', title: 'IOAI 2027 in Singapore', detail: 'The International Olympiad in AI, hosted by AI Singapore and NTU.', key: true },
]

export const FUNNEL = [
  { n: 'Open', label: 'Any eligible student whose school registers (no cap on prelim entries)' },
  { n: '150', label: 'Finalists from the Preliminary Round' },
  { n: '~60', label: 'Invited to the NTU Selection Test' },
  { n: '~10', label: 'Residential training camp (2026: 10 students)' },
  { n: '4–8', label: 'Singapore’s IOAI team' },
]

export const DOMAINS = [
  {
    domain: 'mathematics' as const,
    title: 'Mathematics',
    items: ['Linear algebra', 'Calculus', 'Probability', 'Optimisation'],
    share2026: 60,
  },
  {
    domain: 'computing' as const,
    title: 'Computing',
    items: ['Python', 'NumPy / Pandas', 'PyTorch', 'Debugging'],
    share2026: 59,
  },
  {
    domain: 'ai_ml_dl' as const,
    title: 'AI / ML / DL',
    items: ['Classical ML', 'Neural networks', 'Computer vision', 'NLP', 'GenAI'],
    share2026: 59,
  },
  {
    domain: 'generative_ai' as const,
    title: 'Generative AI',
    items: [],
    share2026: 59,
  },
  {
    domain: 'problem_solving' as const,
    title: 'Problem solving',
    items: ['Algorithm design', 'Debugging', 'Optimisation', 'System design'],
    share2026: 63,
  },
]

export const FORMAT_HISTORY = [
  { year: 'NOAI 2025', prelim: 'None (single round)', final: 'Sat 8 Mar 2025 at NTU, 2.5 h: 20 MCQs + 3 NumPy programming tasks (80 marks)', note: '116 awardees' },
  { year: 'NOAI 2026', prelim: 'Fri 20 Feb 2026: 300 MCQs in 3 h', final: 'Fri 6 Mar 2026 at NTU, 3 h: 20 MCQs (20 marks) + 3 Python tasks (80 marks)', note: '146 finalists awarded' },
  { year: 'NOAI 2027', prelim: 'Fri 19 Feb 2027: 150 MCQs in 1.5 h', final: 'Fri 5 Mar 2027: 20 MCQs + 3 Python programming tasks', note: 'Current cycle' },
]

export const IOAI_RESULTS = [
  { year: 'IOAI 2024 · Burgas, Bulgaria', result: '2 Gold (team Scientific Round)' },
  { year: 'IOAI 2025 · Beijing, China', result: '2 Gold, 5 Silver; 2nd and 3rd place overall' },
  { year: 'IOAI 2026 · Astana, Kazakhstan', result: '1 Gold, 3 Silver, 3 Bronze' },
  { year: 'IOAI 2027 · Singapore', result: 'Host country, 4–10 July 2027' },
]

/** Whole calendar days from today to the date, counted in Singapore time: 0 means today, 1 means tomorrow. */
export function daysUntil(iso: string, now = new Date()): number {
  const sgDay = (d: Date) => Math.floor((d.getTime() + 8 * 3600000) / 86400000)
  return sgDay(new Date(iso)) - sgDay(now)
}

/** "1 day", "2 days" */
export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export interface Milestone {
  name: string
  iso: string
  dateLabel: string
}

/** Dated milestones in order, for countdowns. */
export const MILESTONES: Milestone[] = [
  { name: 'Preliminary Round', iso: '2027-02-19T09:30:00+08:00', dateLabel: 'Friday 19 February 2027' },
  { name: 'Final Assessment', iso: '2027-03-05T09:30:00+08:00', dateLabel: 'Friday 5 March 2027' },
  { name: 'NTU Selection Test', iso: '2027-05-08T09:00:00+08:00', dateLabel: 'Saturday 8 May 2027' },
  { name: 'IOAI 2027 in Singapore', iso: '2027-07-04T09:00:00+08:00', dateLabel: '4–10 July 2027' },
]

/** The next milestone that is today or later, with the days left (0 = today). */
export function nextMilestone(now = new Date()): (Milestone & { days: number }) | null {
  for (const m of MILESTONES) {
    const days = daysUntil(m.iso, now)
    if (days >= 0) return { ...m, days }
  }
  return null
}
