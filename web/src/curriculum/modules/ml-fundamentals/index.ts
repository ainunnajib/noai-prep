import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "ml-fundamentals",
  order: 11,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Machine learning foundations",
  tagline: "Models, data, generalisation and overfitting",
  summary: "The vocabulary of machine learning and the scikit-learn fit/predict recipe, why we hold out validation and test data, underfitting, overfitting and the bias-variance trade-off, learning curves, the curse of dimensionality, and how reinforcement learning learns from rewards instead of labels.",
  prerequisites: ["ai-first-look", "pandas-and-plotting"],
  syllabus: ["NOAI AI/ML/DL: Classical ML", "IOAI 1A4 Scikit-learn for ML", "IOAI 1D2 Underfitting, Overfitting", "Train/validation/test splits; bias-variance trade-off; learning curves", "Curse of dimensionality", "Reinforcement learning: agent, environment, reward, exploration vs exploitation"],
  lessons: [
    {
      slug: "first-sklearn-model",
      title: "Your first scikit-learn model",
      summary: "The vocabulary of ML (features, labels, parameters, hyperparameters) and the fit/predict recipe that every scikit-learn model follows.",
      minutes: 30,
      objectives: ["You can name the features, label, parameters and hyperparameters in a problem", "You can train and use a model with the scikit-learn create, fit, predict and score recipe", "You can work out what a short scikit-learn program prints and what each model stores after fit"],
      load: () => import('./first-sklearn-model.mdx'),
    },
    {
      slug: "generalisation-and-overfitting",
      title: "Generalisation, overfitting and bias-variance",
      summary: "Why we split data three ways, how model complexity trades underfitting (bias) against overfitting (variance), and how learning curves tell you which problem you have.",
      minutes: 30,
      objectives: ["You can explain the jobs of the training, validation and test sets, and why tuning on the test set inflates its score", "You can recognise underfitting and overfitting from training and validation errors", "You can compute bias², variance and expected error from a few retrained predictions", "You can read a learning curve and choose a remedy for high bias or high variance"],
      load: () => import('./generalisation-and-overfitting.mdx'),
    },
    {
      slug: "curse-of-dimensionality",
      title: "The curse of dimensionality",
      summary: "Why data becomes sparse, distances stop telling points apart and models overfit as the number of features grows, and how to fight back.",
      minutes: 30,
      objectives: ["You can work out how much of the data a neighbourhood holds as features are added, and explain why high-dimensional data is sparse", "You can explain distance concentration and why it hurts k-nearest neighbours", "You can diagnose overfitting when features outnumber examples (p > n) and choose a fix"],
      load: () => import('./curse-of-dimensionality.mdx'),
    },
    {
      slug: "reinforcement-learning",
      title: "Reinforcement learning: learning from rewards",
      summary: "An agent acting in an environment and learning from rewards rather than labels: discounted returns, state values, Q-learning in a maze and the exploration-exploitation dilemma.",
      minutes: 25,
      objectives: ["You can explain how reinforcement learning differs from supervised and unsupervised learning", "You can name the agent, environment, state, action, reward and policy in an RL scenario", "You can compute a discounted return by hand", "You can explain exploration versus exploitation and work out epsilon-greedy choice probabilities"],
      load: () => import('./reinforcement-learning.mdx'),
    },
  ],
}

export default mod
