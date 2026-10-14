import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "ai-first-look",
  order: 2,
  part: "start",
  domain: "ai_ml_dl",
  title: "How machines learn: a first look",
  tagline: "Train a model before writing code",
  summary: "A hands-on, no-code first look at machine learning: how AI, ML and deep learning relate, fitting a line by hand and measuring its loss, watching gradient descent roll downhill, and classifying with boundaries and nearest neighbours.",
  prerequisites: ["start-here"],
  syllabus: ["AI vs ML vs DL; supervised, unsupervised and reinforcement learning", "Models as functions with parameters; loss (MSE) as a measure of wrongness", "Gradient descent and the learning rate (intuition)", "Decision boundaries, k-nearest neighbours and generalisation (intuition)"],
  lessons: [
    {
      slug: "what-is-ai",
      title: "AI, machine learning and deep learning",
      summary: "How AI, ML and DL relate, and the three main ways a machine can learn.",
      minutes: 12,
      objectives: ["You can explain how AI, ML and DL nest inside each other", "You can explain why learning from examples beats hand-written rules for messy problems", "You can classify a task as supervised, unsupervised or reinforcement learning"],
      load: () => import('./what-is-ai.mdx'),
    },
    {
      slug: "fit-a-line-by-hand",
      title: "Your first model: fitting a line by hand",
      summary: "Predict HDB resale prices with a straight line, and measure how wrong it is.",
      minutes: 15,
      objectives: ["You can explain a model as a function with adjustable knobs", "You can compute a residual and explain mean squared error", "You can link the best line to the lowest point of the loss curve"],
      load: () => import('./fit-a-line-by-hand.mdx'),
    },
    {
      slug: "let-the-computer-learn",
      title: "Letting the computer find the line",
      summary: "Gradient descent, the algorithm behind almost all of ML, introduced as rolling downhill.",
      minutes: 15,
      objectives: ["You can describe gradient descent as repeated small steps downhill", "You can predict what too small or too large a learning rate does", "You can list the predict-measure-nudge training loop"],
      load: () => import('./let-the-computer-learn.mdx'),
    },
    {
      slug: "classify-with-boundaries",
      title: "Classifying: boundaries and neighbours",
      summary: "Separate two classes with a line, predict like your neighbours, and see why memorising fails.",
      minutes: 15,
      objectives: ["You can explain classification as drawing a decision boundary", "You can predict a class with k-nearest neighbours by hand", "You can explain why a model must be judged on new data"],
      load: () => import('./classify-with-boundaries.mdx'),
    },
  ],
}

export default mod
