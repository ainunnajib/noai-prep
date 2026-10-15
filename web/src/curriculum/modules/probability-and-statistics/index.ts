import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "probability-and-statistics",
  order: 9,
  part: "toolkit",
  domain: "mathematics",
  title: "Probability and statistics",
  tagline: "Reasoning with uncertainty and data",
  summary: "Describing data with centre and spread, probability rules and conditional probability, Bayes' theorem by counting, distributions, expectation and the central limit theorem, then correlation, hypothesis tests and p-values.",
  prerequisites: ["numpy", "maths-foundations"],
  syllabus: ["NOAI Mathematics: Probability", "Mean, median, mode, variance, standard deviation, skewness", "Independence, conditional probability, Bayes' theorem", "Expectation, normal distribution, z-scores, Central Limit Theorem", "Covariance and correlation, p-values, significance level, Type I and Type II errors"],
  lessons: [
    {
      slug: "describing-data",
      title: "Describing data: centre and spread",
      summary: "Mean, median, mode, variance and standard deviation, and how outliers and skew affect them.",
      minutes: 30,
      objectives: ["You can compute mean, median and mode by hand", "You can compute variance and standard deviation of a small list", "You can predict how an outlier or skew changes mean versus median"],
      load: () => import('./describing-data.mdx'),
    },
    {
      slug: "probability-rules",
      title: "Probability rules and conditional probability",
      summary: "Counting outcomes, the 'and' and 'or' rules, independence versus mutually exclusive events, and conditional probability.",
      minutes: 25,
      objectives: ["You can compute simple probabilities by counting", "You can tell independent from mutually exclusive events", "You can compute P(A and B) and P(A | B)"],
      load: () => import('./probability-rules.mdx'),
    },
    {
      slug: "bayes-theorem",
      title: "Bayes' theorem",
      summary: "Updating beliefs with evidence, and why a positive test for a rare condition is often a false alarm.",
      minutes: 25,
      objectives: ["You can state Bayes' theorem with prior, likelihood and posterior", "You can solve a medical-test style problem by counting", "You can explain the base-rate fallacy"],
      load: () => import('./bayes-theorem.mdx'),
    },
    {
      slug: "distributions-and-clt",
      title: "Distributions, the normal curve and the CLT",
      summary: "Random variables, expectation, the normal distribution and z-scores, and why averages of many samples look normal.",
      minutes: 25,
      objectives: ["You can compute an expected value", "You can use the 68-95-99.7 rule and z-scores", "You can explain the Central Limit Theorem in words"],
      load: () => import('./distributions-and-clt.mdx'),
    },
    {
      slug: "correlation-and-testing",
      title: "Correlation and hypothesis tests",
      summary: "Whether two variables move together, and how to tell a real effect from luck with p-values.",
      minutes: 30,
      objectives: ["You can tell covariance from correlation and read a correlation from a scatter plot", "You can explain what a p-value is and what a significance level α means", "You can tell Type I from Type II errors"],
      load: () => import('./correlation-and-testing.mdx'),
    },
  ],
}

export default mod
