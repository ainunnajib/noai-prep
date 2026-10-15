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
      summary: "Asking yes/no questions to split data, measuring purity with Gini or entropy, and controlling depth to avoid overfitting.",
      minutes: 30,
      objectives: ["You can compute Gini impurity and entropy for a node", "You can choose the best split by information gain", "You can explain why deep trees overfit and how max_depth helps"],
      load: () => import('./decision-trees.mdx'),
    },
    {
      slug: "bagging-and-random-forests",
      title: "Bagging and random forests",
      summary: "Training many trees on bootstrap samples and averaging them to reduce variance; random feature subsets, out-of-bag error and feature importance.",
      minutes: 30,
      objectives: ["You can explain bootstrap sampling and the ~63% unique rule", "You can explain why averaging reduces variance", "You can explain random feature subsets and out-of-bag error", "You can read feature importances and predict the effect of adding more trees"],
      load: () => import('./bagging-and-random-forests.mdx'),
    },
    {
      slug: "boosting-adaboost",
      title: "Boosting and AdaBoost",
      summary: "Building a strong model sequentially from weak learners by focusing on the examples previous models got wrong.",
      minutes: 30,
      objectives: ["You can contrast boosting (sequential, reduces bias) with bagging (parallel, reduces variance)", "You can describe AdaBoost's sample re-weighting", "You can compute a learner weight α = ½ ln((1 − ε)/ε)"],
      load: () => import('./boosting-adaboost.mdx'),
    },
    {
      slug: "gradient-boosting",
      title: "Gradient boosting",
      summary: "Fitting each new tree to the negative gradient of the loss (the residuals), with shrinkage, initialisation and early stopping as in the 2026 Final, and the boosting libraries that win on tabular data.",
      minutes: 40,
      objectives: ["You can explain gradient boosting as fitting residuals", "You can derive the negative gradient for L2 (residual) and L1 (sign) losses", "You can choose the initial prediction (mean for L2, median for L1)", "You can explain the learning rate and early stopping"],
      load: () => import('./gradient-boosting.mdx'),
    },
  ],
}

export default mod
