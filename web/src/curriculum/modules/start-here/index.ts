import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "start-here",
  order: 1,
  part: "start",
  domain: "orientation",
  title: "Start here: NOAI, IOAI and how to prepare",
  tagline: "Your map from zero to finalist",
  summary: "What the National Olympiad in AI is, who can enter and how, how the Prelim and Final work and are scored, where it leads (NTU selection and IOAI 2027 in Singapore), and how to study this course efficiently.",
  prerequisites: [],
  syllabus: ["NOAI 2027 Preliminary Round: Fri 19 Feb 2027, 150 MCQs in 90 min, five domains, no calculator, no penalty", "NOAI 2027 Final: Fri 5 Mar 2027, 20 MCQs + 3 Python programming tasks (Theoretical Concept + Practical Implementation)", "Eligibility and school-based registration; direct-entry route for non-MOE students", "NTU IOAI selection and training; IOAI syllabus overview (Theory / Practice / Both)"],
  lessons: [
    {
      slug: "what-is-noai",
      title: "What NOAI is and where it leads",
      summary: "The four stages from your school's computer lab to IOAI 2027 in Singapore, who can enter, and how to register.",
      minutes: 14,
      objectives: ["You can describe the four stages from Prelim to IOAI", "You can state the key 2027 dates", "You know how you register (through your school, or by emailing AISG if you are not in an MOE school)"],
      load: () => import('./what-is-noai.mdx'),
    },
    {
      slug: "exam-format-and-strategy",
      title: "The exam format and how it is scored",
      summary: "Exactly what the Prelim and Final look like, and the scoring facts that should shape your strategy.",
      minutes: 15,
      objectives: ["You can describe the Prelim (150 MCQs, 90 minutes, about 36 s each, no calculator, no penalty)", "You can explain why you should answer every question", "You can describe the two sections of the Final"],
      load: () => import('./exam-format-and-strategy.mdx'),
    },
    {
      slug: "how-to-study",
      title: "How to study so it sticks",
      summary: "Retrieval practice, spacing and a personal plan to cover the course before 19 Feb 2027.",
      minutes: 13,
      objectives: ["You can explain why testing yourself beats re-reading", "You can schedule spaced reviews", "You can build a weekly plan that finishes the course before the Prelim"],
      load: () => import('./how-to-study.mdx'),
    },
  ],
}

export default mod
