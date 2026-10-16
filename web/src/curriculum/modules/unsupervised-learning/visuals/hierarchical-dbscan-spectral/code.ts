/*
  Python for the hierarchical / DBSCAN / spectral lesson's <PyRunner>s. Kept here (not inline in the
  .mdx) so the indentation is safe, with short lines and comments on their own lines so the code stays
  readable on a phone. Outputs were checked locally with numpy 2.5 / scikit-learn 1.9.
*/

export const spectralCode = `import numpy as np
from sklearn.datasets import make_circles
from sklearn.cluster import KMeans

X, y = make_circles(n_samples=200, factor=0.4,
                    noise=0.05, random_state=0)

# 1. similarity graph: connect points
#    closer than r = 0.3
diff = X[:, None, :] - X[None, :, :]
dist = np.linalg.norm(diff, axis=2)
W = ((dist < 0.3) & (dist > 0)).astype(float)

# 2. Laplacian L = D - W
#    (degrees on the diagonal)
L = np.diag(W.sum(axis=1)) - W

# 3. eigenvalues (ascending), eigenvectors
vals, vecs = np.linalg.eigh(L)
# rounding can give -0.0
vals = np.clip(vals, 0, None)
print("smallest eigenvalues:",
      np.round(vals[:4], 3))

# 4. k-means on the rows of the
#    first 2 eigenvectors
U = vecs[:, :2]
km = KMeans(n_clusters=2, n_init=10,
            random_state=0)
labels = km.fit_predict(U)
acc = max((labels == y).mean(),
          (labels != y).mean())
print(f"spectral: {acc:.2f} of points",
      "in the right ring")

# for comparison: k-means on the raw points
raw = km.fit_predict(X)
acc = max((raw == y).mean(),
          (raw != y).mean())
print(f"k-means on raw points: {acc:.2f}")`

export const compareCode = `from sklearn.datasets import make_moons
from sklearn.cluster import (
    KMeans, AgglomerativeClustering,
    DBSCAN, SpectralClustering)
from sklearn.metrics import adjusted_rand_score

X, y = make_moons(n_samples=200, noise=0.06,
                  random_state=0)

models = {
    "k-means": KMeans(
        n_clusters=2, n_init=10,
        random_state=0),
    "Agglomerative (single)":
        AgglomerativeClustering(
            n_clusters=2, linkage="single"),
    "Agglomerative (ward)":
        AgglomerativeClustering(
            n_clusters=2, linkage="ward"),
    "DBSCAN": DBSCAN(eps=0.2, min_samples=5),
    "Spectral": SpectralClustering(
        n_clusters=2,
        affinity="nearest_neighbors",
        n_neighbors=10, random_state=0),
}
for name, model in models.items():
    labels = model.fit_predict(X)
    ari = adjusted_rand_score(y, labels)
    noise = int((labels == -1).sum())
    print(f"{name:24s} ARI = {ari:.2f}",
          f"  noise points: {noise}")`
