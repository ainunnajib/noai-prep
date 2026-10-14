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
      summary: "Residuals, mean squared error, and the line that makes the total squared error smallest.",
      minutes: 18,
      objectives: ["You can compute residuals and MSE for a small dataset", "You can explain why squared errors are used", "You can describe the loss surface over w and b"],
      load: () => import('./least-squares.mdx'),
    },
    {
      slug: "regression-by-gradient-descent",
      title: "Regression by gradient descent (from scratch)",
      summary: "Deriving the MSE gradients and implementing the training loop in NumPy, exactly the 2025 Final Question 1.",
      minutes: 22,
      objectives: ["You can write the gradients of MSE with respect to w and b", "You can implement a vectorised gradient descent loop in NumPy", "You can check convergence with the loss history"],
      load: () => import('./regression-by-gradient-descent.mdx'),
    },
    {
      slug: "multiple-and-polynomial",
      title: "Multiple and polynomial regression",
      summary: "Many features in matrix form, the normal equation, and curves from polynomial features.",
      minutes: 18,
      objectives: ["You can write predictions for many features as Xw", "You can state the normal equation w = (XᵀX)⁻¹Xᵀy and when it fails", "You can fit curves with polynomial features"],
      load: () => import('./multiple-and-polynomial.mdx'),
    },
    {
      slug: "regularisation",
      title: "L1 and L2 regularisation",
      summary: "Penalising large weights to reduce overfitting; why L2 shrinks weights smoothly and L1 sets some exactly to zero; MSE versus MAE.",
      minutes: 20,
      objectives: ["You can write the ridge (L2) and lasso (L1) losses", "You can explain why L1 produces sparse weights", "You can predict the effect of increasing λ (and of scikit-learn's C)", "You can compare MSE and MAE on outliers"],
      load: () => import('./regularisation.mdx'),
    },
  ],
}

export default mod
