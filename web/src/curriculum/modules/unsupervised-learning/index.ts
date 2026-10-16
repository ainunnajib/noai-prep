import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "unsupervised-learning",
  order: 19,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Unsupervised learning: clustering and dimensionality reduction",
  tagline: "Finding structure without labels",
  summary: "k-means (the 2025 Final task) and choosing k, hierarchical, DBSCAN and spectral clustering, PCA, and t-SNE/UMAP for visualisation, plus anomaly detection.",
  prerequisites: ["linear-algebra-deeper", "model-evaluation"],
  syllabus: ["IOAI 1C1 K-Means Clustering", "IOAI 1C2 Principal Component Analysis", "IOAI 1C3 t-SNE, UMAP", "IOAI 1C4 DBSCAN, Hierarchical and Spectral Clustering", "NOAI 2025 Final Q2: k-means from scratch", "Anomaly detection (one-class SVM)"],
  lessons: [
    {
      slug: "k-means",
      title: "k-means clustering",
      summary: "Assigning points to the nearest centroid and moving centroids to the mean, smarter starts with k-means++, choosing k with the elbow method, and the shapes k-means cannot handle.",
      minutes: 35,
      objectives: ["You can run one assign step and one update step of k-means by hand", "You can compute inertia and use the elbow, not the smallest inertia, to choose k", "You can explain why the starting centroids matter and how k-means++ and restarts help", "You can recognise data shapes, such as rings and moons, where k-means fails"],
      load: () => import('./k-means.mdx'),
    },
    {
      slug: "hierarchical-dbscan-spectral",
      title: "Hierarchical, DBSCAN and spectral clustering",
      summary: "Clustering by merging (dendrograms and linkage), by density (DBSCAN) and by graph connectivity (spectral clustering), for data k-means cannot handle.",
      minutes: 35,
      objectives: ["You can compare single, complete and average linkage, and cut a dendrogram into clusters", "You can label points as core, border or noise in DBSCAN and predict what changing eps or min_samples does", "You can explain spectral clustering and what the zero eigenvalues of the graph Laplacian tell you"],
      load: () => import('./hierarchical-dbscan-spectral.mdx'),
    },
    {
      slug: "pca",
      title: "Principal component analysis",
      summary: "Finding the directions of greatest variance, projecting onto them to reduce dimensions, reading explained variance, rebuilding data and standardising first.",
      minutes: 30,
      objectives: ["You can identify PC1 as the covariance eigenvector with the largest eigenvalue, the direction of greatest variance", "You can compute explained variance ratios and choose how many components to keep", "You can explain why features in different units must be standardised before PCA", "You can predict the shapes scikit-learn's PCA returns and explain why a linear method cannot unroll curved data"],
      load: () => import('./pca.mdx'),
    },
    {
      slug: "tsne-umap-and-anomalies",
      title: "t-SNE, UMAP and anomaly detection",
      summary: "Non-linear maps for visualising high-dimensional data, how to read them safely, and spotting unusual points.",
      minutes: 30,
      objectives: ["You can explain that t-SNE and UMAP preserve local neighbourhoods, and what perplexity controls", "You can avoid the common misreadings of a t-SNE map: cluster sizes, gaps and fake clusters", "You can explain why t-SNE coordinates make poor model features", "You can choose a one-class anomaly detector when only normal data is available"],
      load: () => import('./tsne-umap-and-anomalies.mdx'),
    },
  ],
}

export default mod
