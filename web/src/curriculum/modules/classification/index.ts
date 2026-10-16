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
      summary: "Squashing a linear score into a probability with the sigmoid, the straight decision boundary, the log loss and why it beats squared error, and training by gradient descent.",
      minutes: 30,
      objectives: ["You can estimate σ(z) for simple scores from a few anchor values and read it as a probability", "You can turn a score into a class with the z ≥ 0 rule and tell which side of the boundary wᵀx + b = 0 a point is on", "You can compute the binary cross-entropy (log loss) of a prediction", "You can explain why squared error trains a sigmoid model badly while log loss does not"],
      load: () => import('./logistic-regression.mdx'),
    },
    {
      slug: "likelihood-and-entropy",
      title: "Likelihood, entropy and cross-entropy",
      summary: "Why classifiers are trained with cross-entropy: maximum likelihood (and MAP), entropy as average surprise, cross-entropy and the KL divergence.",
      minutes: 30,
      objectives: ["You can find a maximum-likelihood estimate and explain why we maximise the log-likelihood instead", "You can compute entropy and cross-entropy for small distributions", "You can get the KL divergence as cross-entropy minus entropy and explain why it is not symmetric", "You can match a loss to the noise model it comes from: squared error to Gaussian noise, cross-entropy to yes/no outcomes"],
      load: () => import('./likelihood-and-entropy.mdx'),
    },
    {
      slug: "softmax-and-multiclass",
      title: "Softmax, cross-entropy and multi-class problems",
      summary: "Extending to many classes with softmax, the cross-entropy loss and label smoothing, the difference between multi-class and multi-label, and the matching PyTorch losses.",
      minutes: 25,
      objectives: ["You can compute softmax for small logits and explain why adding the same number to every logit changes nothing", "You can compute the cross-entropy loss for a one-hot target and predict the first loss of an untrained model (about ln K)", "You can choose softmax with cross-entropy for multi-class problems and a sigmoid per label with binary cross-entropy for multi-label ones", "You can spot the classic PyTorch bug of applying softmax before nn.CrossEntropyLoss"],
      load: () => import('./softmax-and-multiclass.mdx'),
    },
    {
      slug: "k-nearest-neighbours",
      title: "k-nearest neighbours",
      summary: "Classifying by a vote of the most similar training examples: choosing k, choosing a distance metric, and why the features must be scaled.",
      minutes: 20,
      objectives: ["You can classify a point by a k-NN vote and explain why a very small k overfits and a very large k underfits", "You can compute Euclidean, Manhattan and cosine distance and explain why they can disagree", "You can explain why k-NN needs scaled features and is slow at prediction time"],
      load: () => import('./k-nearest-neighbours.mdx'),
    },
    {
      slug: "naive-bayes",
      title: "Naive Bayes and Laplace smoothing",
      summary: "Bayes' theorem with a bold independence assumption: counting words to classify messages, adding one to every count, and adding logs to avoid underflow.",
      minutes: 20,
      objectives: ["You can compute Naive Bayes scores from priors and word likelihoods and pick the winning class", "You can explain what is naive about Naive Bayes and why it still classifies well", "You can apply Laplace smoothing and explain why it is needed", "You can explain why real implementations add log probabilities instead of multiplying"],
      load: () => import('./naive-bayes.mdx'),
    },
    {
      slug: "support-vector-machines",
      title: "Support vector machines and kernels",
      summary: "The widest-street classifier and its support vectors, soft margins controlled by C, and the kernel trick, with the RBF kernel's γ, for curved boundaries.",
      minutes: 35,
      objectives: ["You can explain the maximum-margin idea, compute the margin width 2/‖w‖ and say which points are support vectors", "You can compute a point's slack and predict how raising or lowering C changes the street", "You can evaluate a simple kernel and explain why the kernel trick never builds the big feature space", "You can decide whether to raise or lower the RBF kernel's γ when a model overfits or underfits"],
      load: () => import('./support-vector-machines.mdx'),
    },
  ],
}

export default mod
