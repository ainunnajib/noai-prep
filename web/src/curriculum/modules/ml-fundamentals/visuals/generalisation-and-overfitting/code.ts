/*
  Python for the lesson's <PyRunner>. Kept here (not inline in the .mdx) because MDX trims the
  indentation of continuation lines inside JSX attributes. Comments sit on their own lines so the
  code still reads correctly when a phone soft-wraps long lines.

  Output checked locally with scikit-learn 1.6.1, the version Pyodide 0.27.7 (the in-browser
  runner) ships. Newer scikit-learn versions cut off tiny singular values in LinearRegression, so
  they print different numbers for the ill-conditioned degree-9 and degree-15 fits only.
*/

export const workflowCode = `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
x = rng.uniform(0, 1, 60)
# hidden curve + noise
y = np.sin(2.5 * np.pi * x) + rng.normal(0, 0.3, 60)
X = x.reshape(-1, 1)

# 60% train, 20% val, 20% test
X_train, X_rest, y_train, y_rest = train_test_split(
    X, y, test_size=0.4, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(
    X_rest, y_rest, test_size=0.5, random_state=0)
print("sizes:", len(X_train), len(X_val), len(X_test))

def poly_model(deg):
    return make_pipeline(PolynomialFeatures(deg),
                         LinearRegression())

best_deg, best_val = None, float("inf")
for deg in [1, 3, 5, 9, 15]:
    model = poly_model(deg)
    model.fit(X_train, y_train)
    tr = mean_squared_error(y_train, model.predict(X_train))
    va = mean_squared_error(y_val, model.predict(X_val))
    print(f"degree {deg:2d}: train MSE {tr:.3f}   "
          f"validation MSE {va:.3f}")
    if va < best_val:
        best_deg, best_val = deg, va

# open the test set once
final = poly_model(best_deg).fit(X_train, y_train)
test = mean_squared_error(y_test, final.predict(X_test))
print("chosen degree:", best_deg)
print(f"test MSE (reported once): {test:.3f}")`
