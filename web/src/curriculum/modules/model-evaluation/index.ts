import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "model-evaluation",
  order: 16,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Evaluating models honestly",
  tagline: "Metrics that tell the truth",
  summary: "Confusion matrices, precision, recall and F1, the accuracy paradox and remedies for imbalanced classes, ROC and PR curves, cross-validation and hyperparameter tuning without leakage, regression metrics (MAE, RMSE, R²), IoU for boxes, and macro versus micro averaging.",
  prerequisites: ["classification"],
  syllabus: ["IOAI 1D1 Model Evaluation Metrics (Accuracy, Precision, Recall, F1)", "IOAI 1D3 Hyperparameter Tuning", "IOAI 1D4 Cross-Validation", "IOAI 1D5 Confusion Matrix and ROC Curves", "IoU and mean IoU, R², MAE/RMSE, macro vs micro averaging", "Class imbalance: class weights, resampling, SMOTE, cost-based thresholds"],
  lessons: [
    {
      slug: "confusion-matrix-and-metrics",
      title: "Confusion matrix, precision, recall and F1",
      summary: "Counting the four kinds of right and wrong, the metrics built from them, and choosing the metric that matches the cost of errors.",
      minutes: 30,
      objectives: ["You can fill in a confusion matrix from labels, scores and a threshold, and read scikit-learn's layout (rows actual, columns predicted)", "You can compute accuracy, precision, recall and F1 from the four counts", "You can predict how raising or lowering the threshold changes precision and recall", "You can choose between precision and recall from the cost of each kind of mistake"],
      load: () => import('./confusion-matrix-and-metrics.mdx'),
    },
    {
      slug: "imbalanced-data",
      title: "Imbalanced classes",
      summary: "Why accuracy lies when positives are rare, the standard remedies (class weights, resampling, SMOTE, a lower threshold), and choosing a threshold from the cost of each mistake.",
      minutes: 35,
      objectives: ["You can explain the accuracy paradox and judge a model by its recall and precision on the rare class", "You can compare class weights, random oversampling, SMOTE and undersampling, and compute a SMOTE point by hand", "You can explain why resampling must happen after the train/test split, on the training set only", "You can find the cheapest threshold from the cost of a false alarm and the cost of a miss"],
      load: () => import('./imbalanced-data.mdx'),
    },
    {
      slug: "roc-and-pr-curves",
      title: "ROC and precision-recall curves",
      summary: "Seeing performance across all thresholds at once, AUC, and why PR curves are better for rare positives.",
      minutes: 25,
      objectives: ["You can compute TPR and FPR and trace an ROC curve by lowering the threshold", "You can compute AUC by counting correctly ranked pairs, and read 0.5 as random and 1 as perfect", "You can explain why a precision-recall curve exposes false alarms that ROC-AUC hides when positives are rare"],
      load: () => import('./roc-and-pr-curves.mdx'),
    },
    {
      slug: "cross-validation-and-tuning",
      title: "Cross-validation and hyperparameter tuning",
      summary: "k-fold cross-validation, grid and random search, keeping every fitted step inside the folds, and why tuning on the test set inflates the score.",
      minutes: 40,
      objectives: ["You can run k-fold cross-validation and report the mean ± standard deviation of the fold scores", "You can compare grid search and random search for the same budget", "You can explain why feature selection and every other fitted step must happen inside each fold", "You can explain why the best of many test scores is biased upwards, and how nested cross-validation avoids it"],
      load: () => import('./cross-validation-and-tuning.mdx'),
    },
    {
      slug: "regression-and-overlap-metrics",
      title: "Regression metrics, IoU and averaging",
      summary: "MAE, MSE, RMSE and R² for numbers; IoU (the Jaccard index) for boxes; macro versus micro averaging.",
      minutes: 35,
      objectives: ["You can compute MAE, MSE, RMSE and R² for a small set and interpret a negative R²", "You can compute the IoU of two boxes", "You can choose between macro and micro averaging and compute both for a few classes"],
      load: () => import('./regression-and-overlap-metrics.mdx'),
    },
  ],
}

export default mod
