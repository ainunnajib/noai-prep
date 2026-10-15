import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "trees-and-ensembles",
  order: 17,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Decision trees and ensembles",
  tagline: "Many weak trees, one strong model",
  summary: "How decision trees split data using Gini or entropy, then bagging, random forests and feature importance, AdaBoost, and gradient boosting built up to the from-scratch implementation in the 2026 Final, plus the boosting libraries that win on tabular data.",
  prerequisites: ["model-evaluation"],
  syllabus: ["IOAI 1B5 Decision Trees", "IOAI 1B6 Model Ensembles (Gradient Boosting, Bagging, Random Forest)", "NOAI 2026 Final Task 1: gradient boosting from scratch", "Gini, entropy, information gain, out-of-bag error, AdaBoost", "Feature importance; XGBoost, LightGBM, CatBoost"],
  lessons: [
    {
      slug: "decision-trees",
      title: "Decision trees",
      summary: "Asking yes/no questions to split data, measuring impurity with Gini or entropy, scoring splits by information gain, and limiting depth to avoid overfitting.",
      minutes: 30,
      objectives: ["You can compute the Gini impurity and entropy of a node from its class fractions", "You can work out the information gain of a split, weighting each side by its size", "You can explain why a full-depth tree overfits and how max_depth or min_samples_leaf helps", "You can explain why trees cut the space into rectangles and need no feature scaling"],
      load: () => import('./decision-trees.mdx'),
    },
    {
      slug: "bagging-and-random-forests",
      title: "Bagging and random forests",
      summary: "Training many trees on bootstrap samples and averaging them to reduce variance; random feature subsets, out-of-bag error and feature importance.",
      minutes: 30,
      objectives: ["You can describe a bootstrap sample and why about 63% of its rows are distinct", "You can calculate how much averaging correlated trees lowers the variance, and why it has a floor", "You can explain how a random forest picks features at each split and how out-of-bag error works", "You can predict the effect of adding more trees and spot misleading feature importances"],
      load: () => import('./bagging-and-random-forests.mdx'),
    },
    {
      slug: "boosting-adaboost",
      title: "Boosting and AdaBoost",
      summary: "Building a strong model from weak learners trained one after another: AdaBoost's weighted vote, its re-weighting of the examples it got wrong, and why it can chase noisy labels.",
      minutes: 30,
      objectives: ["You can contrast boosting (sequential, mainly reduces bias) with bagging (parallel, mainly reduces variance)", "You can compute a learner's say α = ½ ln((1 − ε)/ε) and explain why its error must stay below 0.5", "You can re-weight and normalise the examples after a round, by hand or in NumPy", "You can explain why AdaBoost overfits mislabelled examples and how to choose the number of rounds"],
      load: () => import('./boosting-adaboost.mdx'),
    },
    {
      slug: "gradient-boosting",
      title: "Gradient boosting",
      summary: "Fitting each new tree to the negative gradient of the loss (the residuals, for squared error), with the starting constant, shrinkage and early stopping as in the 2026 Final, a note on classification, and the boosting libraries that win on tabular data.",
      minutes: 35,
      objectives: ["You can compute a prediction as the starting constant plus the learning rate times each tree's output", "You can work out the pseudo-residuals (negative gradients) for L2, L1 and log-loss", "You can choose the starting constant: the mean for L2 and the median for L1", "You can explain the learning-rate trade-off and run early stopping with patience"],
      load: () => import('./gradient-boosting.mdx'),
    },
  ],
}

export default mod
