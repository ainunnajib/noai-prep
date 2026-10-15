/*
  Python for the K-means lesson's <PyRunner>s. Kept here (not inline in the .mdx) so the indentation
  is safe, with short lines and comments on their own lines so the code stays readable on a phone.
  Outputs were checked locally with numpy 2.5 / scikit-learn 1.9 and are printed in the lesson.
*/

export const scratchCode = `import numpy as np

def kmeans(X, C, max_iter=10):
    X = np.asarray(X, dtype=float)
    C = np.asarray(C, dtype=float)
    for it in range(max_iter):
        # assign: squared distances,
        # shape (n, k)
        diff = X[:, None, :] - C[None, :, :]
        D = (diff ** 2).sum(axis=2)
        labels = D.argmin(axis=1)
        # update: centroid j moves to the
        # mean of its points (if any)
        new_C = C.copy()
        for j in range(len(C)):
            if np.any(labels == j):
                pts = X[labels == j]
                new_C[j] = pts.mean(axis=0)
        err = X - new_C[labels]
        inertia = (err ** 2).sum()
        print(it + 1, labels,
              new_C.round(4).tolist(),
              round(inertia, 2))
        # stop when nothing moved
        if np.allclose(new_C, C):
            break
        C = new_C
    return C, labels

points = [(2, 4), (2, 8), (2, 10),
          (10, 2), (10, 4), (10, 0)]
start = [(2, 4), (2, 8)]
C, labels = kmeans(points, start)`

export const sklearnCode = `from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=4,
                  cluster_std=0.8,
                  random_state=0)

for k in range(1, 8):
    km = KMeans(n_clusters=k,
                init="k-means++",
                n_init=10,
                random_state=0).fit(X)
    I = km.inertia_
    print(f"k = {k}: inertia = {I:7.1f}")`
