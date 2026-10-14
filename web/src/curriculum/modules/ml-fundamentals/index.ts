import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "ml-fundamentals",
  order: 11,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Machine learning foundations",
  tagline: "Models, data, generalisation and overfitting",
  summary: "The scikit-learn fit/predict recipe on real data, why we hold out validation and test data, underfitting, overfitting and the bias-variance trade-off, learning curves, the curse of dimensionality, and how reinforcement learning differs from learning from labels.",
  prerequisites: ["ai-first-look", "pandas-and-plotting"],
  syllabus: ["NOAI AI/ML/DL: Classical ML", "IOAI 1A4 Scikit-learn for ML", "IOAI 1D2 Underfitting, Overfitting", "Train/validation/test splits; bias-variance trade-off; learning curves", "Curse of dimensionality", "Reinforcement learning: agent, environment, reward, exploration vs exploitation"],
  lessons: [
    {
      slug: "first-sklearn-model",
      title: "Your first scikit-learn model",
      summary: "The vocabulary of ML (features, labels, parameters, hyperparameters) and the fit/predict recipe that every scikit-learn model follows.",
      minutes: 15,
      objectives: ["You can name the features, label, parameters and hyperparameters in a problem", "You can train and use a model with the scikit-learn fit/predict pattern"],
      load: () => import('./first-sklearn-model.mdx'),
    },
    {
      slug: "generalisation-and-overfitting",
      title: "Generalisation, overfitting and bias-variance",
      summary: "Why we split data three ways, how model complexity trades underfitting against overfitting, and how learning curves tell you which problem you have.",
      minutes: 24,
      objectives: ["You can explain the roles of training, validation and test sets", "You can recognise underfitting and overfitting from train and validation errors", "You can explain bias and variance and read a learning curve"],
      load: () => import('./generalisation-and-overfitting.mdx'),
    },
    {
      slug: "curse-of-dimensionality",
      title: "The curse of dimensionality",
      summary: "Why data becomes sparse and distances become meaningless as the number of features grows.",
      minutes: 14,
      objectives: ["You can explain why high-dimensional space is mostly empty", "You can explain distance concentration and its effect on k-NN", "You can explain the danger of more features than samples (p > n)"],
      load: () => import('./curse-of-dimensionality.mdx'),
    },
    {
      slug: "reinforcement-learning",
      title: "Reinforcement learning: learning from rewards",
      summary: "An agent acting in an environment, learning from rewards rather than labels, and the exploration-exploitation dilemma.",
      minutes: 14,
      objectives: ["You can name the agent, environment, state, action and reward in an RL problem", "You can explain the exploration-exploitation trade-off"],
      load: () => import('./reinforcement-learning.mdx'),
    },
  ],
}

export default mod
