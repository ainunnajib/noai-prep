import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "maths-foundations",
  order: 6,
  part: "toolkit",
  domain: "mathematics",
  title: "Maths warm-up: functions, powers, logs and Σ",
  tagline: "The notation every formula uses",
  summary: "The bridge from school algebra to ML maths: function notation and graphs, piecewise functions such as |x| and ReLU, exponent rules, scientific notation and e, logarithms and their rules, and reading Σ and Π notation, subscripts and hats. Every later formula (losses, sigmoid, softmax, cross-entropy, log n, the Final's update rules) is written in this language.",
  prerequisites: ["python-basics"],
  syllabus: ["NOAI Mathematics: the foundations assumed by linear algebra, calculus, probability and optimisation", "Function notation, composition and graphs; piecewise functions (|x|, max, ReLU, step)", "Exponent rules, scientific notation, exponential growth and decay, e and eˣ", "Logarithms: definition, product/quotient/power rules, ln versus log₂, anchor values for no-calculator work", "Σ and Π notation, subscripts, superscripts and hats; translating formulas into NumPy"],
  lessons: [
    {
      slug: "functions-and-graphs",
      title: "Functions and their graphs",
      summary: "Function notation, plugging in values, composing functions, and the lines, parabolas and kinked graphs (|x|, ReLU, steps) that ML formulas are built from.",
      minutes: 30,
      objectives: ["You can evaluate f(x) and a composition f(g(x)), working from the inside out", "You can find the slope and intercept of a line through two points, and the vertex of y = a(x − h)² + k", "You can compute |x| and ReLU(x) = max(0, x) and explain why ReLU is continuous but not differentiable at 0"],
      load: () => import('./functions-and-graphs.mdx'),
    },
    {
      slug: "powers-and-exponentials",
      title: "Powers, scientific notation and e",
      summary: "Exponent rules, numbers such as 3e-4 and 1e-8, repeated multiplication that explodes or vanishes, and the number e behind sigmoid and softmax.",
      minutes: 30,
      objectives: ["You can simplify expressions with the exponent rules, including zero and negative powers", "You can read and compare numbers in scientific notation such as 3e-4", "You can estimate repeated products such as 0.25¹⁰ ≈ 10⁻⁶ and link them to vanishing gradients", "You can explain why eˣ is always positive and why sigmoid and softmax are built from it"],
      load: () => import('./powers-and-exponentials.mdx'),
    },
    {
      slug: "logarithms",
      title: "Logarithms",
      summary: "Logs as \"which power?\", the rules that turn products into sums, ln versus log₂, why ML adds log-probabilities, and the anchor values behind the cost −ln p.",
      minutes: 30,
      objectives: ["You can evaluate logs such as log₂ 8, log₁₀ 1000 and ln 1 without a calculator", "You can use the product, quotient and power rules, such as log(aⁿ) = n log a", "You can explain why ML adds log-probabilities instead of multiplying probabilities", "You can use ln 2 ≈ 0.693 and ln 10 ≈ 2.303 to work out cross-entropy costs −ln p, such as ln K for a uniform guess"],
      load: () => import('./logarithms.mdx'),
    },
    {
      slug: "sigma-notation-and-subscripts",
      title: "Reading formulas: Σ, subscripts and hats",
      summary: "Σ and Π as loops, the subscripts, superscripts and hats that label examples, features and predictions, and translating a formula such as the 2025 Final's update rule into NumPy.",
      minutes: 30,
      objectives: ["You can evaluate Σ and Π expressions by hand and write them as Python loops (which index from 0)", "You can read xⱼ⁽ⁱ⁾ (feature j of example i), ŷ, θ, α and m in an ML formula", "You can translate a formula such as MSE into NumPy and check it on a tiny example"],
      load: () => import('./sigma-notation-and-subscripts.mdx'),
    },
  ],
}

export default mod
