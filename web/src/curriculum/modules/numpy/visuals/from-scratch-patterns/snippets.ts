/*
  Code kept here because MDX strips indentation inside JSX template literals.
  Runnable lines stay at 33 characters or fewer so that they fit a 360 px phone without wrapping (the cheat sheet, shown without line numbers, allows 37).
*/

/** Runnable k-means for the lesson's PyRunner (moves 1, 2, 3 and 5). */
export const KMEANS_CODE = `import numpy as np

X = np.array([
    [1.0, 1.0], [1.5, 2.0],
    [3.0, 4.0], [5.0, 7.0],
    [3.5, 5.0], [4.5, 5.0],
    [3.5, 4.5]])
# start from the first two points
C = X[:2].copy()

def assign(X, C):
    A = X[:, None, :]  # (7, 1, 2)
    B = C[None, :, :]  # (1, 2, 2)
    diff = A - B       # (7, 2, 2)
    sq = (diff ** 2).sum(axis=-1)
    D = np.sqrt(sq)    # (7, 2)
    # (7,): the nearest centroid
    return D.argmin(axis=1)

for step in range(3):
    labels = assign(X, C)
    for j in range(len(C)):
        pts = X[labels == j]
        # empty: keep the old C[j]
        if len(pts) == 0:
            continue
        C[j] = pts.mean(axis=0)
    print(step, labels)
    print(np.round(C, 4).tolist())`

/** The cheat sheet that closes the lesson: one comment and one or two lines per move. */
export const CHEAT_SHEET_CODE = `# 1. every difference, (n, k, d)
diff = X[:, None, :] - C[None, :, :]
# 2. the distance matrix, (n, k)
D = np.sqrt((diff ** 2).sum(axis=-1))
# 3. nearest centroid per row, (n,)
labels = D.argmin(axis=1)
# 4. the k nearest per row, (m, k)
idx = np.argsort(D, axis=1)[:, :k]
# 5. new centroid: mean of a cluster
C[j] = X[labels == j].mean(axis=0)
# 6. count classes, majority vote
vals, counts = np.unique(
    y, return_counts=True)
top = np.bincount(y).argmax()
# 7. choose element by element
pred = np.where(p >= 0.5, 1, 0)
# 8. nudge direction, median, clip
nudge = np.sign(y - guess)
c = np.median(y)
p = np.clip(p, 1e-7, 1 - 1e-7)
# 9. metrics in one line
acc = (pred == y).mean()
mse = ((pred - y) ** 2).mean()
# 10. exactly the format asked for
score = round(float(x), 4)
rows = np.round(A, 4).tolist()`
