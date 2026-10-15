import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "data-and-features",
  order: 12,
  part: "classical-ml",
  domain: "computing",
  title: "Data processing and feature engineering",
  tagline: "Clean data beats clever models",
  summary: "Handling missing data and outliers, scaling and normalisation, encoding categories and building vocabularies, engineering features (including sliding windows and summary statistics), and splitting data without leakage, the IOAI Data Processing and Feature Engineering topics.",
  prerequisites: ["ml-fundamentals"],
  syllabus: ["IOAI 1D7 Data Processing: imputation (mean/median/forward-fill), normalisation and standardisation, train/validation/test splitting", "IOAI 1D6 Feature Engineering: one-hot encoding, sliding windows, statistical moments, PCA and embeddings", "NOAI Computing: data preprocessing", "Data leakage and scikit-learn Pipelines", "Outliers and the IQR rule"],
  lessons: [
    {
      slug: "missing-data-and-outliers",
      title: "Missing data and outliers",
      summary: "Imputing missing values without distorting the data, forward-fill for sequences, and spotting outliers with the IQR rule.",
      minutes: 35,
      objectives: ["You can choose between dropping rows, imputing and a NaN-tolerant model, including forward-fill for time series", "You can explain how mean imputation shrinks variance and when to add a missing-indicator feature", "You can flag outliers with the IQR rule and decide whether to keep, cap or remove them"],
      load: () => import('./missing-data-and-outliers.mdx'),
    },
    {
      slug: "scaling-and-normalisation",
      title: "Scaling, normalisation and standardisation",
      summary: "Putting features on comparable scales with z-scores or min-max, and why it matters for distances and gradient descent.",
      minutes: 30,
      objectives: ["You can standardise (z-score) and min-max scale a feature by hand", "You can explain why k-NN, SVM and gradient descent need scaled features", "You can explain why trees do not", "You can avoid fitting the scaler on test data"],
      load: () => import('./scaling-and-normalisation.mdx'),
    },
    {
      slug: "encoding-categories",
      title: "Encoding categories and text",
      summary: "Turning categories into numbers with one-hot or ordinal encoding, and the first step for text: a vocabulary.",
      minutes: 30,
      objectives: ["You can one-hot encode a categorical column", "You can explain when ordinal encoding is wrong", "You can build a vocabulary and map words to ids"],
      load: () => import('./encoding-categories.mdx'),
    },
    {
      slug: "feature-engineering",
      title: "Feature engineering",
      summary: "Creating informative features: interactions, polynomials, binning, statistics over windows, date parts and learned embeddings.",
      minutes: 30,
      objectives: ["You can create polynomial and interaction features", "You can build sliding-window features for time series", "You can explain how a good feature can make a simple model succeed"],
      load: () => import('./feature-engineering.mdx'),
    },
    {
      slug: "splitting-and-leakage",
      title: "Splitting data and avoiding leakage",
      summary: "Random, stratified and time-based splits, fitting preprocessing on training data only, target leakage, and scikit-learn Pipelines.",
      minutes: 30,
      objectives: ["You can choose random, stratified or time-based splits", "You can spot data leakage in a workflow", "You can explain why a Pipeline prevents preprocessing leakage"],
      load: () => import('./splitting-and-leakage.mdx'),
    },
  ],
}

export default mod
