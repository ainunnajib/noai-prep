import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "road-to-ioai",
  order: 39,
  part: "exam",
  domain: "exam",
  title: "Beyond NOAI: the road to IOAI 2027",
  tagline: "From finalist to national team",
  summary: "What happens after NOAI (NTU selection test, training, camp, IOAI 2027 in Singapore), how IOAI tasks are scored, how practical tasks differ from MCQs, the competition craft of improving a baseline, techniques that keep winning tasks, and a study roadmap mapped to the IOAI syllabus.",
  prerequisites: ["final-lab-pytorch"],
  syllabus: ["NTU IOAI Selection Test (8 May 2027) and training (May to June 2027)", "IOAI 2027 Singapore, 4 to 10 July 2027: Individual Contest format and scoring", "IOAI syllabus (all sections, practice items)", "Hugging Face transformers, datasets, peft; torchvision", "Imbalance handling, transfer learning, pseudo-labelling, leaderboard discipline"],
  lessons: [
    {
      slug: "after-noai",
      title: "After NOAI: NTU selection and the IOAI format",
      summary: "The timeline from April to July 2027, what the NTU selection stage looks like, and how the IOAI Individual Contest is run and scored.",
      minutes: 25,
      objectives: ["You can list the post-NOAI milestones and their dates", "You can describe the NTU selection test style (baseline notebook to improve)", "You can explain IOAI task scoring and medal cut-offs", "You can state eligibility to represent Singapore"],
      load: () => import('./after-noai.mdx'),
    },
    {
      slug: "baseline-to-better",
      title: "From baseline to better: competition craft",
      summary: "Reading a baseline, setting up trustworthy validation, changing one thing at a time, logging experiments and avoiding leaderboard overfitting.",
      minutes: 35,
      objectives: ["You can set up a validation scheme that matches the test set", "You can run controlled experiments and keep an experiment log", "You can explain public versus private leaderboard overfitting", "You can respect output format requirements exactly"],
      load: () => import('./baseline-to-better.mdx'),
    },
    {
      slug: "ioai-task-techniques",
      title: "Techniques that keep winning tasks",
      summary: "Handling imbalance (weighted loss, focal loss, balanced sampling), transfer learning, pseudo-labels for unlabelled data, cheap clever ideas under constraints, and input gradients for adversarial and saliency tasks.",
      minutes: 30,
      objectives: ["You can apply class-weighted and focal losses", "You can explain pseudo-labelling with a confidence threshold", "You can use embeddings plus simple models (k-NN, logistic regression) as strong baselines", "You can craft a small adversarial perturbation from the input gradient and reason about task constraints"],
      load: () => import('./ioai-task-techniques.mdx'),
    },
    {
      slug: "study-roadmap",
      title: "Your study roadmap beyond NOAI",
      summary: "A skills ladder from Prelim recall to IOAI open-ended modelling, project ideas, practice sources and a weekly plan from March to July.",
      minutes: 25,
      objectives: ["You can place your skills on the ladder from recall to open-ended modelling", "You can choose practice sources (IOAI past tasks, AICC contests, Kaggle)", "You can draft a weekly plan from March to July 2027", "You can use the IOAI syllabus coverage map to find and fill your gaps"],
      load: () => import('./study-roadmap.mdx'),
    },
  ],
}

export default mod
