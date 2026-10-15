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
      summary: "The four stages from your school's computer lab to IOAI 2027 in Singapore, the skill each one rewards, the key dates, who can enter and how to register.",
      minutes: 25,
      objectives: ["You can describe the four stages from the Prelim to the IOAI team and the skill each one rewards", "You can state the key 2027 dates and work out that the Final is two weeks after the Prelim", "You can explain how to register: through your school, or by emailing AI Singapore if you are not in an MOE school", "You can say who can enter NOAI and who can be picked for the IOAI team"],
      load: () => import('./what-is-noai.mdx'),
    },
    {
      slug: "exam-format-and-strategy",
      title: "The exam format and how it is scored",
      summary: "What the Prelim and the Final look like, and how the time limit and no-penalty marking should shape your strategy.",
      minutes: 25,
      objectives: ["You can describe the Prelim: 150 MCQs in 90 minutes, about 36 seconds each, no calculator and no penalty for wrong answers", "You can use pace checkpoints to tell when you are behind, and cap your time on questions that are going nowhere", "You can work out the expected marks from guessing and explain why you should answer every question", "You can describe the two sections of the Final and what its programming tasks ask you to do"],
      load: () => import('./exam-format-and-strategy.mdx'),
    },
    {
      slug: "how-to-study",
      title: "How to study so it sticks",
      summary: "Retrieval practice, spaced reviews, a personal plan to cover the course before 19 Feb 2027, and how to use each part of a lesson.",
      minutes: 25,
      objectives: ["You can explain why testing yourself beats re-reading", "You can use the half-life model of forgetting to work out what is left and to space your reviews", "You can work out how many hours a week your plan needs to finish the course before the Prelim", "You can use each part of a lesson actively, starting by predicting before you move a visual"],
      load: () => import('./how-to-study.mdx'),
    },
  ],
}

export default mod
