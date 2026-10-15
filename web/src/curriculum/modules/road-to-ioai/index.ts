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
      summary: "The timeline from April to July 2027, who can represent Singapore, what the NTU selection stage looks like, and how the IOAI Individual Contest is run and scored.",
      minutes: 25,
      objectives: ["You can list the milestones from NOAI results to IOAI 2027 in order, with their dates", "You can describe what the NTU Selection Test asks: complete a baseline notebook, improve it and explain your choices", "You can compute an IOAI task score from the baseline, expert and best results, and count medals from the cut-offs", "You can say who is eligible to represent Singapore at IOAI 2027"],
      load: () => import('./after-noai.mdx'),
    },
    {
      slug: "baseline-to-better",
      title: "From baseline to better: competition craft",
      summary: "Reading a baseline and its rules, setting up trustworthy validation, changing one thing at a time, logging experiments, avoiding leaderboard overfitting and learning from past tasks.",
      minutes: 35,
      objectives: ["You can set up a validation scheme that is new to the model in the same way as the test set", "You can run one-change-at-a-time experiments over several seeds, keep a log and use an ablation", "You can estimate a public leaderboard's noise with the standard error and explain leaderboard overfitting", "You can read a task's rules and output format before choosing a plan"],
      load: () => import('./baseline-to-better.mdx'),
    },
    {
      slug: "ioai-task-techniques",
      title: "Techniques that keep winning tasks",
      summary: "Handling imbalance (class-weighted loss, balanced sampling, focal loss), pseudo-labels for unlabelled data, cheap strong baselines from frozen pretrained embeddings under the task rules, and input gradients for adversarial examples and saliency maps.",
      minutes: 30,
      objectives: ["You can compute class weights and focal-loss factors for an imbalanced task", "You can explain how the confidence threshold trades the number of pseudo-labels against their correctness", "You can build strong, cheap baselines from frozen embeddings (k-NN, nearest centroid, linear probe) within a task's rules", "You can compute an input gradient in PyTorch and turn it into an FGSM adversarial example"],
      load: () => import('./ioai-task-techniques.mdx'),
    },
    {
      slug: "study-roadmap",
      title: "Your study roadmap beyond NOAI",
      summary: "A skills ladder from Prelim recall to IOAI open-ended modelling, practice sources and project ideas, a weekly plan from March to July, and an IOAI syllabus coverage map.",
      minutes: 25,
      objectives: ["You can place your skills on the ladder from Prelim recall to IOAI invention and pick the lowest rung to practise next", "You can choose practice sources for each rung (past notebooks, IOAI tasks, AICC contests, Kaggle)", "You can budget a weekly plan from March to July 2027 in 2-hour blocks", "You can use the IOAI syllabus's Theory and Practice labels to find your gaps"],
      load: () => import('./study-roadmap.mdx'),
    },
  ],
}

export default mod
