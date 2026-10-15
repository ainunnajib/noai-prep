import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "maths-foundations",
  order: 6,
  part: "toolkit",
  domain: "mathematics",
  title: "Maths warm-up: functions, powers, logs and Σ",
  tagline: "The notation every formula uses",
  summary: "The bridge from school algebra to ML maths: function notation and graphs, piecewise functions such as |x| and ReLU, exponent rules, scientific notation and e, logarithms and their rules, and reading Σ notation, subscripts and hats. Every later formula (losses, sigmoid, softmax, cross-entropy, log n, the Final's update rules) is written in this language.",
  prerequisites: ["python-basics"],
  syllabus: ["NOAI Mathematics: the foundations assumed by linear algebra, calculus, probability and optimisation", "Function notation, composition and graphs; piecewise functions (|x|, max, ReLU, step)", "Exponent rules, scientific notation, exponential growth and decay, e and eˣ", "Logarithms: definition, product/quotient/power rules, ln versus log₂, anchor values for no-calculator work", "Σ and Π notation, subscripts, superscripts and hats; translating formulas into NumPy"],
  lessons: [
    {
      slug: "functions-and-graphs",
      title: "Functions and their graphs",
      summary: "Function notation, plugging in values, composing functions, and the lines, parabolas and kinked graphs that appear in every ML formula.",
      minutes: 30,
      objectives: ["You can evaluate f(x) and a composition f(g(x)) for given numbers", "You can read the slope and intercept of y = mx + c and the lowest point of a parabola", "You can sketch |x|, max(0, x) and a step function and say where each has a corner or a jump"],
      load: () => import('./functions-and-graphs.mdx'),
    },
    {
      slug: "powers-and-exponentials",
      title: "Powers, scientific notation and e",
      summary: "Exponent rules, numbers such as 3e-4 and 1e-8, repeated multiplication that explodes or vanishes, and the number e behind sigmoid and softmax.",
      minutes: 30,
      objectives: ["You can simplify expressions with the exponent rules, including zero and negative powers", "You can read and compare numbers in scientific notation such as 3e-4", "You can predict whether repeated multiplication by a factor grows or shrinks", "You can explain why eˣ is always positive and sketch e⁻ˣ"],
      load: () => import('./powers-and-exponentials.mdx'),
    },
    {
      slug: "logarithms",
      title: "Logarithms",
      summary: "Logs as \"which power?\", the rules that turn products into sums, ln versus log₂, and the anchor values used in no-calculator questions.",
      minutes: 30,
      objectives: ["You can evaluate log₂ 8, log₁₀ 1000 and ln 1 without a calculator", "You can use log(ab) = log a + log b and log(aⁿ) = n log a", "You can explain why ML adds log-probabilities instead of multiplying probabilities", "You can recall ln 2 ≈ 0.693 and ln 10 ≈ 2.303 and read −ln p as a cost"],
      load: () => import('./logarithms.mdx'),
    },
    {
      slug: "sigma-notation-and-subscripts",
      title: "Reading formulas: Σ, subscripts and hats",
      summary: "Σ and Π as loops, the subscripts and superscripts that index examples and features, and translating a formula such as the 2025 Final's update rule into NumPy.",
      minutes: 30,
      objectives: ["You can expand and evaluate a Σ expression and write it as a Python loop", "You can read xⱼ⁽ⁱ⁾ (feature j of example i), ŷ, θ, α and m in an ML formula", "You can translate a one-line formula into NumPy and check it on a tiny example"],
      load: () => import('./sigma-notation-and-subscripts.mdx'),
    },
  ],
}

export default mod
