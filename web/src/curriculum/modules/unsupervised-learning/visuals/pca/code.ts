/*
  Python for the lesson's <PyRunner>s. Kept here (not inline in the .mdx) because MDX trims the
  indentation of continuation lines inside JSX attributes. Comments sit on their own lines so the
  code stays readable on a phone. Outputs were checked locally with numpy 2.5 / scikit-learn 1.9.
*/

export const fromScratchCode = `import numpy as np

X = np.array([[1, 3], [3, 4], [4, 3], [4, 6]],
             dtype=float)

# 1. centre: subtract the mean point
mu = X.mean(axis=0)
Xc = X - mu

# 2. covariance matrix (divide by n - 1)
C = Xc.T @ Xc / (len(X) - 1)
print("covariance:\\n", C)

# 3. eigenvalues and eigenvectors (columns),
#    sorted largest eigenvalue first
vals, vecs = np.linalg.eigh(C)
order = np.argsort(vals)[::-1]
vals, vecs = vals[order], vecs[:, order]
print("eigenvalues:", vals)
# the sign may flip: -PC1 is the same line
print("PC1:", vecs[:, 0].round(3))
print("explained ratio:", vals / vals.sum())

# 4. scores on PC1: one number per point
v1 = vecs[:, :1]
Z = Xc @ v1
print("scores:", Z.ravel().round(3))

# 5. rebuild each point from its score
X_hat = mu + Z @ v1.T
print("rebuilt:\\n", X_hat)`

export const sklearnCode = `import numpy as np
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

# 1,797 images, 64 pixels each
X, y = load_digits(return_X_y=True)

# fit all 64 components
pca = PCA().fit(X)
ratios = pca.explained_variance_ratio_
print("first 5 ratios:", ratios[:5].round(3))
cum = np.cumsum(ratios)
print("for 95%:", np.argmax(cum >= 0.95) + 1)

# keep 10 components: fit, then project
pca10 = PCA(n_components=10)
Z = pca10.fit_transform(X)
print(X.shape, "->", Z.shape)
print("kept:", ratios[:10].sum().round(3))

# rebuild 64 pixels from 10 numbers
X_back = pca10.inverse_transform(Z)
print("rebuilt:", X_back.shape)`
