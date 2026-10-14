/** Runnable code for the lesson's PyRunner, kept here because MDX strips indentation inside JSX template literals. */
export const KMEANS_CODE = `import numpy as np

X = np.array([[1.0, 1.0], [1.5, 2.0], [3.0, 4.0],
              [5.0, 7.0], [3.5, 5.0], [4.5, 5.0], [3.5, 4.5]])
C = X[:2].copy()                          # start from the first two points

for step in range(3):
    D = np.sqrt(((X[:, None, :] - C[None, :, :]) ** 2).sum(axis=-1))  # (7, 2)
    labels = D.argmin(axis=1)                                          # (7,)
    for j in range(len(C)):
        if np.any(labels == j):           # guard against an empty cluster
            C[j] = X[labels == j].mean(axis=0)
    print(step, labels, np.round(C, 4).tolist())`
