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
      objectives: ["You can find the mean, median and mode of a small data set by hand", "You can predict how an outlier or a skewed shape moves the mean, median and mode", "You can compute the variance and standard deviation of a short list, and explain why the deviations are squared", "You can tell when NumPy and pandas divide by n and when by n − 1"],
      load: () => import('./describing-data.mdx'),
    },
    {
      slug: "probability-rules",
      title: "Probability rules and conditional probability",
      summary: "Counting outcomes, the 'and' and 'or' rules, independence versus mutually exclusive events, conditional probability and probability trees.",
      minutes: 25,
      objectives: ["You can find probabilities by counting equally likely outcomes, including for two dice", "You can use the addition rule for 'or' and the complement for 'at least one'", "You can tell mutually exclusive events from independent ones", "You can compute a conditional probability P(A | B) from counts or a table"],
      load: () => import('./probability-rules.mdx'),
    },
    {
      slug: "bayes-theorem",
      title: "Bayes' theorem",
      summary: "Updating beliefs with evidence, why a positive test for a rare condition is often a false alarm, and how Naive Bayes uses the same rule.",
      minutes: 25,
      objectives: ["You can name the prior, likelihood and posterior in Bayes' theorem and use it to compute P(A | B)", "You can solve a medical-test problem by counting people", "You can explain why a positive result for a rare condition is often a false alarm", "You can update a belief step by step, using each posterior as the next prior"],
      load: () => import('./bayes-theorem.mdx'),
    },
    {
      slug: "distributions-and-clt",
      title: "Distributions, the normal curve and the CLT",
      summary: "Random variables, expectation and variance, the normal distribution and z-scores, and why averages of many samples look normal.",
      minutes: 30,
      objectives: ["You can compute an expected value and explain it as a long-run average", "You can use z-scores and the 68-95-99.7 rule to estimate what share of a normal distribution lies in a range", "You can tell the standard deviation from the variance in N(μ, σ²) and in NumPy's normal sampler", "You can use the Central Limit Theorem to give the centre, spread and shape of sample means"],
      load: () => import('./distributions-and-clt.mdx'),
    },
    {
      slug: "correlation-and-testing",
      title: "Correlation and hypothesis tests",
      summary: "Whether two variables move together, how to tell a real effect from luck with p-values, and the two ways a test can be wrong.",
      minutes: 30,
      objectives: ["You can compute a covariance and a correlation, and say how changing units affects each", "You can explain why a correlation alone does not show cause and effect", "You can interpret a p-value and decide whether to reject the null hypothesis at a significance level α", "You can tell Type I from Type II errors and explain how lowering α trades one for the other"],
      load: () => import('./correlation-and-testing.mdx'),
    },
  ],
}

export default mod
