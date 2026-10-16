import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "data-and-features",
  order: 12,
  part: "classical-ml",
  domain: "computing",
  title: "Data processing and feature engineering",
  tagline: "Clean data beats clever models",
  summary: "Handling missing data and outliers, scaling and normalisation, encoding categories and building vocabularies, engineering features (including sliding windows and summary statistics), and splitting data without leakage: the IOAI Data Processing and Feature Engineering topics.",
  prerequisites: ["ml-fundamentals"],
  syllabus: ["IOAI 1D7 Data Processing: imputation (mean/median/forward-fill), normalisation and standardisation, train/validation/test splitting", "IOAI 1D6 Feature Engineering: one-hot encoding, sliding windows, statistical moments, PCA and embeddings", "NOAI Computing: data preprocessing", "Data leakage and scikit-learn Pipelines", "Outliers and the IQR rule"],
  lessons: [
    {
      slug: "missing-data-and-outliers",
      title: "Missing data and outliers",
      summary: "Dropping or imputing missing values and what each choice does to the data, forward-fill and interpolation for time series, and spotting outliers with the IQR rule.",
      minutes: 30,
      objectives: ["You can work out how many rows dropna() keeps and choose between dropping, imputing and a model that accepts NaN", "You can explain how mean imputation shrinks the variance, and when to use the median or add a missing-indicator column", "You can choose forward-fill or interpolation for a time series, and fit an imputer on the training data only", "You can flag outliers with the IQR rule and decide whether to fix, cap or keep them"],
      load: () => import('./missing-data-and-outliers.mdx'),
    },
    {
      slug: "scaling-and-normalisation",
      title: "Scaling, normalisation and standardisation",
      summary: "Putting features on comparable scales with z-scores or min-max scaling, why it matters for distances and gradient descent but not for trees, and fitting the scaler on training data only.",
      minutes: 30,
      objectives: ["You can standardise (z-score) and min-max scale a feature by hand", "You can explain why k-NN, SVMs and gradient descent need scaled features but trees do not", "You can fit a scaler on the training data only and use it to transform the test data"],
      load: () => import('./scaling-and-normalisation.mdx'),
    },
    {
      slug: "encoding-categories",
      title: "Encoding categories and text",
      summary: "Turning categories into numbers with one-hot or ordinal encoding, handling columns with thousands of categories, and the first step for text: a vocabulary of word ids.",
      minutes: 25,
      objectives: ["You can explain why integer codes mislead a model about categories with no order, and when ordinal codes are right", "You can one-hot encode a categorical column and count the columns it makes", "You can handle a column with thousands of categories, such as postal codes", "You can build a vocabulary and encode a sentence with [UNK] and [PAD] tokens"],
      load: () => import('./encoding-categories.mdx'),
    },
    {
      slug: "feature-engineering",
      title: "Feature engineering",
      summary: "Creating informative features: squares, polynomials and interactions, ratios, date parts and bins, sliding-window statistics, and a first look at PCA and embeddings.",
      minutes: 25,
      objectives: ["You can explain how a new feature such as x squared lets a linear model separate classes it could not separate before", "You can count the columns that PolynomialFeatures creates", "You can build date-part and sliding-window features, and put clock time on a circle", "You can say how PCA and embeddings learn features from the data"],
      load: () => import('./feature-engineering.mdx'),
    },
    {
      slug: "splitting-and-leakage",
      title: "Splitting data and avoiding leakage",
      summary: "Random, stratified and time-based splits, fitting preprocessing on training data only, target leakage, and scikit-learn Pipelines.",
      minutes: 30,
      objectives: ["You can choose between random, stratified and time-based splits, and count the rare cases in a stratified split", "You can spot target leakage and preprocessing that was fitted before the split", "You can explain how a Pipeline keeps every preprocessing step inside the training folds of cross-validation"],
      load: () => import('./splitting-and-leakage.mdx'),
    },
  ],
}

export default mod
