import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "model-evaluation",
  order: 16,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Evaluating models honestly",
  tagline: "Metrics that tell the truth",
  summary: "Confusion matrices, precision, recall and F1, the accuracy paradox and remedies for imbalanced classes, ROC and PR curves, cross-validation and hyperparameter tuning without leakage, and metrics for regression and segmentation including IoU.",
  prerequisites: ["classification"],
  syllabus: ["IOAI 1D1 Model Evaluation Metrics (Accuracy, Precision, Recall, F1)", "IOAI 1D3 Hyperparameter Tuning", "IOAI 1D4 Cross-Validation", "IOAI 1D5 Confusion Matrix and ROC Curves", "IoU and mean IoU, R², MAE/RMSE, macro vs micro averaging", "Class imbalance: class weights, resampling, SMOTE, cost-based thresholds"],
  lessons: [
    {
      slug: "confusion-matrix-and-metrics",
      title: "Confusion matrix, precision, recall and F1",
      summary: "Counting the four kinds of right and wrong, the metrics built from them, and choosing the metric that matches the cost of errors.",
      minutes: 30,
      objectives: ["You can fill a confusion matrix from predictions and a threshold", "You can compute accuracy, precision, recall and F1 from counts", "You can choose precision or recall for a given application"],
      load: () => import('./confusion-matrix-and-metrics.mdx'),
    },
    {
      slug: "imbalanced-data",
      title: "Imbalanced classes",
      summary: "Why accuracy lies when positives are rare, and the standard remedies.",
      minutes: 30,
      objectives: ["You can explain the accuracy paradox", "You can compare class weights, oversampling, SMOTE and undersampling", "You can choose metrics for fraud and medical scenarios"],
      load: () => import('./imbalanced-data.mdx'),
    },
    {
      slug: "roc-and-pr-curves",
      title: "ROC and precision-recall curves",
      summary: "Seeing performance across all thresholds at once, AUC, and why PR curves are better for rare positives.",
      minutes: 25,
      objectives: ["You can plot TPR against FPR for several thresholds", "You can interpret AUC (0.5 random, 1 perfect)", "You can explain when to prefer a PR curve"],
      load: () => import('./roc-and-pr-curves.mdx'),
    },
    {
      slug: "cross-validation-and-tuning",
      title: "Cross-validation and hyperparameter tuning",
      summary: "k-fold cross-validation, grid and random search, and keeping preprocessing and feature selection inside the folds.",
      minutes: 40,
      objectives: ["You can explain k-fold cross-validation and report mean ± standard deviation", "You can compare grid search and random search", "You can explain why feature selection must happen inside each fold", "You can explain why repeatedly tuning on the test set inflates the reported score"],
      load: () => import('./cross-validation-and-tuning.mdx'),
    },
    {
      slug: "regression-and-overlap-metrics",
      title: "Regression metrics, IoU and averaging",
      summary: "MAE, MSE, RMSE and R² for numbers; IoU (the Jaccard index) for boxes; macro versus micro averaging.",
      minutes: 35,
      objectives: ["You can compute MAE, RMSE and R² for a small set", "You can compute IoU for two boxes", "You can tell macro from micro averaging"],
      load: () => import('./regression-and-overlap-metrics.mdx'),
    },
  ],
}

export default mod
