import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "classification",
  order: 15,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Classification models",
  tagline: "Drawing boundaries between classes",
  summary: "Predicting categories with logistic regression, the likelihood and entropy ideas behind cross-entropy loss, softmax for many classes, k-nearest neighbours and Naive Bayes, and support vector machines with soft margins and kernels.",
  prerequisites: ["linear-regression", "probability-and-statistics"],
  syllabus: ["IOAI 1B2 Logistic Regression", "IOAI 1B4 K-Nearest Neighbors", "IOAI 1B7 Support Vector Machines", "IOAI 2A5 Cross Entropy loss", "Maximum likelihood, entropy, cross-entropy and KL divergence", "NOAI AI/ML: softmax, multi-class vs multi-label, Naive Bayes and Laplace smoothing"],
  lessons: [
    {
      slug: "logistic-regression",
      title: "Logistic regression",
      summary: "Squashing a linear score into a probability with the sigmoid, drawing a decision boundary, and the log loss.",
      minutes: 20,
      objectives: ["You can compute σ(z) for simple z and interpret it as a probability", "You can describe the decision boundary wᵀx + b = 0", "You can compute binary cross-entropy and explain why it punishes confident mistakes"],
      load: () => import('./logistic-regression.mdx'),
    },
    {
      slug: "likelihood-and-entropy",
      title: "Likelihood, entropy and cross-entropy",
      summary: "Why classifiers are trained with cross-entropy: maximum likelihood, and the information-theory view of surprise.",
      minutes: 20,
      objectives: ["You can explain maximum likelihood and why we maximise the log-likelihood", "You can compute entropy and cross-entropy for small distributions", "You can explain why minimising cross-entropy is maximum likelihood, and that KL divergence is not symmetric"],
      load: () => import('./likelihood-and-entropy.mdx'),
    },
    {
      slug: "softmax-and-multiclass",
      title: "Softmax, cross-entropy and multi-class problems",
      summary: "Extending to many classes with softmax, the cross-entropy loss, and the difference between multi-class and multi-label.",
      minutes: 18,
      objectives: ["You can compute softmax for small logits", "You can compute cross-entropy for a one-hot target", "You can choose softmax+CE for multi-class and sigmoid+BCE for multi-label"],
      load: () => import('./softmax-and-multiclass.mdx'),
    },
    {
      slug: "knn-and-naive-bayes",
      title: "k-nearest neighbours and Naive Bayes",
      summary: "Two simple classifiers: vote of the nearest neighbours, and Bayes' theorem with a bold independence assumption.",
      minutes: 22,
      objectives: ["You can classify a point with k-NN and explain how k and the distance metric change the boundary", "You can compute a Naive Bayes score from priors and word likelihoods", "You can explain why Laplace smoothing is needed"],
      load: () => import('./knn-and-naive-bayes.mdx'),
    },
    {
      slug: "support-vector-machines",
      title: "Support vector machines and kernels",
      summary: "The widest-street classifier, soft margins controlled by C, and the kernel trick for curved boundaries.",
      minutes: 22,
      objectives: ["You can explain the maximum-margin idea and support vectors", "You can predict the effect of C on the margin", "You can explain the kernel trick and the RBF kernel's gamma"],
      load: () => import('./support-vector-machines.mdx'),
    },
  ],
}

export default mod
