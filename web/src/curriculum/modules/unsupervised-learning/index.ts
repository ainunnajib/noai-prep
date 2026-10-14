import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "unsupervised-learning",
  order: 19,
  part: "classical-ml",
  domain: "ai_ml_dl",
  title: "Unsupervised learning: clustering and dimensionality reduction",
  tagline: "Finding structure without labels",
  summary: "K-means (the 2025 Final task) and choosing k, hierarchical, DBSCAN and spectral clustering, PCA, and t-SNE/UMAP for visualisation, plus anomaly detection.",
  prerequisites: ["linear-algebra-deeper", "model-evaluation"],
  syllabus: ["IOAI 1C1 K-Means Clustering", "IOAI 1C2 Principal Component Analysis", "IOAI 1C3 t-SNE, UMAP", "IOAI 1C4 DBSCAN, Hierarchical and Spectral Clustering", "NOAI 2025 Final Q2: K-means from scratch", "Anomaly detection (one-class SVM)"],
  lessons: [
    {
      slug: "k-means",
      title: "K-means clustering",
      summary: "Alternating between assigning points to the nearest centroid and moving centroids to the mean, choosing k with the elbow method, and its limits.",
      minutes: 20,
      objectives: ["You can run K-means by hand for one iteration", "You can explain inertia and the elbow method", "You can explain why initialisation matters (k-means++)", "You can recognise data where K-means fails"],
      load: () => import('./k-means.mdx'),
    },
    {
      slug: "hierarchical-dbscan-spectral",
      title: "Hierarchical, DBSCAN and spectral clustering",
      summary: "Clustering by merging, by density, and by graph connectivity, for data K-means cannot handle.",
      minutes: 22,
      objectives: ["You can read a dendrogram and cut it into clusters", "You can explain DBSCAN's eps and min_samples and its core, border and noise points", "You can explain spectral clustering as clustering a similarity graph"],
      load: () => import('./hierarchical-dbscan-spectral.mdx'),
    },
    {
      slug: "pca",
      title: "Principal component analysis",
      summary: "Finding the directions of greatest variance, projecting onto them to reduce dimensions, and reading explained variance.",
      minutes: 20,
      objectives: ["You can explain PC1 as the direction of maximum variance", "You can read an explained-variance chart and choose the number of components", "You can explain why to standardise before PCA", "You can reconstruct data from k components"],
      load: () => import('./pca.mdx'),
    },
    {
      slug: "tsne-umap-and-anomalies",
      title: "t-SNE, UMAP and anomaly detection",
      summary: "Non-linear maps for visualising high-dimensional data, how to read them safely, and spotting unusual points.",
      minutes: 18,
      objectives: ["You can explain what t-SNE and UMAP preserve (local neighbourhoods)", "You can avoid common misreadings (cluster sizes and distances)", "You can describe one-class and density-based anomaly detection"],
      load: () => import('./tsne-umap-and-anomalies.mdx'),
    },
  ],
}

export default mod
