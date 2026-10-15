/*
  Python snippets for the lesson's <PyRunner>s. They live here (not inline in the .mdx) because
  MDX trims the indentation of continuation lines inside JSX attributes, which would turn
  Python's 4-space blocks into 2-space ones. Outputs were checked locally with numpy/scikit-learn.
*/

export const distanceCode = `import numpy as np

rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    # 500 points, d features each
    X = rng.uniform(0, 1, (500, d))
    # one query point
    q = rng.uniform(0, 1, d)
    dist = np.sqrt(((X - q) ** 2).sum(axis=1))
    near, far = dist.min(), dist.max()
    print(f"d = {d:4d}: nearest {near:5.2f}, "
          f"farthest {far:5.2f}, ratio {near / far:.2f}")`

export const knnCode = `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
n = 200
# labels: 0 or 1
y = rng.integers(0, 2, n)
# 2 useful features; class 1
# is shifted by 2
X_useful = rng.normal(0, 1, (n, 2))
X_useful += 2 * y.reshape(-1, 1)

for extra in [0, 5, 20, 100, 500]:
    # pure-noise features
    noise = rng.normal(0, 1, (n, extra))
    # glue columns side by side
    X = np.hstack([X_useful, noise])
    model = KNeighborsClassifier(n_neighbors=5)
    # train/test on 5 splits,
    # then average the accuracies
    acc = cross_val_score(model, X, y, cv=5).mean()
    print(f"{X.shape[1]:4d} features -> "
          f"k-NN accuracy {acc:.2f}")`
