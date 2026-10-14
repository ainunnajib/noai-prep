/*
  Python snippets for the lesson's <PyRunner>s. They live here (not inline in the .mdx) because
  MDX trims the indentation of continuation lines inside JSX attributes, which would turn
  Python's 4-space blocks into 2-space ones. Outputs were checked locally with numpy/scikit-learn.
*/

export const distanceCode = `import numpy as np

rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    X = rng.uniform(0, 1, (500, d))   # 500 random points with d features
    q = rng.uniform(0, 1, d)          # one query point
    dist = np.sqrt(((X - q) ** 2).sum(axis=1))
    near, far = dist.min(), dist.max()
    print(f"d = {d:4d}: nearest {near:5.2f}, farthest {far:5.2f}, ratio {near / far:.2f}")`

export const knnCode = `import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(0)
n = 200
y = rng.integers(0, 2, n)                     # labels: 0 or 1
X_useful = rng.normal(0, 1, (n, 2))           # 2 useful features ...
X_useful += 2 * y[:, None]                    # ... shifted by 2 for class 1

for extra in [0, 5, 20, 100, 500]:
    noise = rng.normal(0, 1, (n, extra))      # features unrelated to the label
    X = np.hstack([X_useful, noise])
    model = KNeighborsClassifier(n_neighbors=5)
    # average accuracy over 5 different train/test splits
    acc = cross_val_score(model, X, y, cv=5).mean()
    print(f"{X.shape[1]:4d} features -> k-NN accuracy {acc:.2f}")`
