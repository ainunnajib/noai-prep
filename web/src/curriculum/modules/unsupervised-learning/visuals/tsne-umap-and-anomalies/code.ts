/*
  Python for the lesson's <PyRunner>s (kept out of the .mdx so indentation survives).
  Checked locally with scikit-learn 1.9: the t-SNE snippet printed trustworthiness 0.857 (PCA) and
  0.993 (t-SNE); the anomaly snippet printed [ 1 -1 -1] for both detectors.
*/

export const tsneCode = `from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, trustworthiness

# 500 images, 64 pixels each
X, y = load_digits(return_X_y=True)
X, y = X[:500], y[:500]

Y_pca = PCA(n_components=2).fit_transform(X)
tsne = TSNE(n_components=2, perplexity=30,
            init="pca", random_state=0)
# fit_transform only: no .transform() for new points
Y_tsne = tsne.fit_transform(X)
print("map shape:", Y_tsne.shape)

# 1.0 = every map neighbour is a real neighbour
for name, Y in [("PCA", Y_pca), ("t-SNE", Y_tsne)]:
    t = trustworthiness(X, Y, n_neighbors=10)
    print(f"{name:6s} trustworthiness: {t:.3f}")`

export const anomalyCode = `import numpy as np
from sklearn.svm import OneClassSVM
from sklearn.ensemble import IsolationForest

rng = np.random.default_rng(0)
# training data: NORMAL examples only
X_train = rng.normal(0, 1, (300, 2))
X_new = np.array([[0.2, -0.1], [2.5, 2.5], [-4.0, 0.5]])

svm = OneClassSVM(kernel="rbf", gamma=0.5, nu=0.05)
svm.fit(X_train)
# +1 = looks normal, -1 = anomaly
print("one-class SVM:", svm.predict(X_new))

iso = IsolationForest(random_state=0).fit(X_train)
print("isolation forest:", iso.predict(X_new))

# k-NN distance score, from scratch
def knn_score(x, X, k=5):
    d = np.sqrt(((X - x) ** 2).sum(axis=1))
    return np.sort(d)[:k].mean()

for x in X_new:
    print(x, "k-NN score:", round(knn_score(x, X_train), 2))`
