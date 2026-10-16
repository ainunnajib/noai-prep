import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "linear-regression",
  order: 14,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Linear regression and regularisation",
  tagline: "Fitting lines, planes and curves",
  summary: "Linear regression from residuals to the normal equation, implementing it with gradient descent exactly as in the 2025 Final, multiple and polynomial regression, MSE versus MAE, and L1/L2 regularisation.",
  prerequisites: ["data-and-features", "calculus-and-gradient-descent"],
  syllabus: ["IOAI 1B1 Linear Regression", "IOAI 1B3 L1 and L2 Regularization", "IOAI 2A5 Loss Functions (MSE, MAE)", "NOAI 2025 Final Q1: linear regression by gradient descent", "Normal equations and pseudoinverse"],
  lessons: [
    {
      slug: "least-squares",
      title: "Linear regression and least squares",
      summary: "Residuals, mean squared error, the least-squares line, and the bowl-shaped loss over w and b.",
      minutes: 25,
      objectives: ["You can compute the residuals and MSE of a line on a small dataset by hand", "You can explain why least squares squares the residuals instead of adding them", "You can interpret the slope and intercept of a fitted line", "You can describe the MSE over w and b as a convex bowl with one lowest point"],
      load: () => import('./least-squares.mdx'),
    },
    {
      slug: "regression-by-gradient-descent",
      title: "Regression by gradient descent (from scratch)",
      summary: "Deriving the MSE gradients and implementing the training loop in NumPy, exactly as in Question 1 of the 2025 Final.",
      minutes: 30,
      objectives: ["You can derive the MSE gradients for w and b and take one gradient descent step by hand", "You can write a vectorised gradient descent loop in NumPy that updates all parameters together", "You can read a loss history to spot convergence or a learning rate that is too high"],
      load: () => import('./regression-by-gradient-descent.mdx'),
    },
    {
      slug: "multiple-and-polynomial",
      title: "Multiple and polynomial regression",
      summary: "Many features in matrix form, the normal equation and when it fails, and polynomial features for fitting curves, including how too high a degree overfits.",
      minutes: 35,
      objectives: ["You can write the predictions for many features as one matrix product and check the shapes", "You can solve for the weights with the normal equation and explain when it fails", "You can explain why polynomial regression is still linear in the weights", "You can say when gradient descent is a better choice than the normal equation"],
      load: () => import('./multiple-and-polynomial.mdx'),
    },
    {
      slug: "regularisation",
      title: "L1 and L2 regularisation",
      summary: "Penalising large weights to reduce overfitting; why L2 shrinks weights smoothly and L1 sets some exactly to zero; MSE versus MAE.",
      minutes: 35,
      objectives: ["You can compute the ridge (L2) and lasso (L1) penalties, leaving the bias out", "You can explain why L1 sets some weights exactly to zero while L2 only shrinks them", "You can predict what raising λ, or lowering scikit-learn's C, does to a model", "You can explain why MAE is more robust to outliers than MSE"],
      load: () => import('./regularisation.mdx'),
    },
  ],
}

export default mod
