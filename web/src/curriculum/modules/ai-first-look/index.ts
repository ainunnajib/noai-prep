import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "ai-first-look",
  order: 2,
  part: "start",
  domain: "ai_ml_dl",
  title: "How machines learn: a first look",
  tagline: "Train a model before writing code",
  summary: "A hands-on, no-code first look at machine learning: how AI, ML and deep learning relate, fitting a line by hand and measuring its loss, watching gradient descent roll downhill, classifying with boundaries and nearest neighbours, and why a model must be tested on new data.",
  prerequisites: ["start-here"],
  syllabus: ["AI vs ML vs DL; supervised, unsupervised and reinforcement learning", "Models as functions with parameters; loss (MSE) as a measure of wrongness", "Gradient descent and the learning rate (intuition)", "Decision boundaries, k-nearest neighbours and generalisation (intuition)"],
  lessons: [
    {
      slug: "what-is-ai",
      title: "AI, machine learning and deep learning",
      summary: "How AI, ML and DL relate, why learning from examples beats hand-written rules, and the three main ways a machine can learn.",
      minutes: 25,
      objectives: ["You can explain how AI, ML and DL nest inside each other", "You can explain why learning from labelled examples beats hand-written rules for messy problems", "You can describe a model as a function whose parameters are set by training", "You can classify a task as supervised, unsupervised or reinforcement learning"],
      load: () => import('./what-is-ai.mdx'),
    },
    {
      slug: "fit-a-line-by-hand",
      title: "Your first model: fitting a line by hand",
      summary: "Predict HDB resale prices with a straight line, measure how wrong it is with the mean squared error, and find the bottom of the loss curve.",
      minutes: 25,
      objectives: ["You can explain a model as a function whose knobs (parameters) training turns while the data stays fixed", "You can compute residuals and the mean squared error, and explain why the misses are squared", "You can link the best line to the lowest point of the loss curve"],
      load: () => import('./fit-a-line-by-hand.mdx'),
    },
    {
      slug: "let-the-computer-learn",
      title: "Letting the computer find the line",
      summary: "Gradient descent, the method that trains most models, introduced as rolling downhill: slopes, learning rates and the training loop.",
      minutes: 25,
      objectives: ["You can work out one step of gradient descent by hand, moving against the slope", "You can explain why the steps shrink near the bottom even though the learning rate is fixed", "You can predict what too small or too large a learning rate does to the loss", "You can put the four moves of the training loop in order: predict, measure, find the slope, nudge"],
      load: () => import('./let-the-computer-learn.mdx'),
    },
    {
      slug: "classify-with-boundaries",
      title: "Classifying: boundaries and neighbours",
      summary: "Separate two classes with a line, predict like your neighbours, and see why memorising fails.",
      minutes: 25,
      objectives: ["You can tell classification from regression and explain a decision boundary", "You can predict a class with k-nearest neighbours by hand and say how k changes the boundary", "You can spot overfitting from training and test accuracy, and explain why a model must be judged on new data"],
      load: () => import('./classify-with-boundaries.mdx'),
    },
  ],
}

export default mod
