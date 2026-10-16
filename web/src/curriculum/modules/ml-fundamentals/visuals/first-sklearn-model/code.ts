/*
  Python for the lesson's <PyRunner>s. Kept here (not inline in the .mdx) because MDX trims the
  indentation of continuation lines inside JSX attributes. Comments sit on their own lines so the
  code still reads correctly when a phone soft-wraps long lines. Outputs checked locally with
  scikit-learn.
*/

export const hdbCode = `from sklearn.linear_model import LinearRegression

# Training data: 6 HDB flats
# one row per flat: area (m²)
X_train = [[67], [73], [92], [95], [110], [122]]
# price ($k)
y_train = [420, 450, 530, 560, 610, 680]

# 1. create
model = LinearRegression()
# 2. fit: learn the parameters
model.fit(X_train, y_train)

print("w (coef_):", model.coef_)
print("b (intercept_):", model.intercept_)
# 3. predict
print("prediction for 100 m²:", model.predict([[100]]))

# 2 flats the model never saw
X_test = [[84], [104]]
y_test = [500, 585]
# 4. score
print("R² on test flats:", model.score(X_test, y_test))`

export const classifiersCode = `from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

# 12 students:
# [hours revised, hours slept]
X_train = [[1, 7], [2, 4], [2.5, 8], [3, 6],
           [3.5, 4.5], [5, 8], [6, 7], [7, 5],
           [8, 3.5], [8, 8], [4.5, 7.5], [9, 6]]
# label 1 = pass, 0 = fail
y_train = [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1]
X_test = [[2.2, 5.6], [5.6, 6.2], [7.4, 4.2], [3.6, 7.2]]
y_test = [0, 1, 0, 0]

for model in [KNeighborsClassifier(n_neighbors=3),
              DecisionTreeClassifier(max_depth=2)]:
    # same recipe for both
    model.fit(X_train, y_train)
    print(model)
    print("  new student [6, 5] ->", model.predict([[6, 5]]))
    print("  test accuracy:", model.score(X_test, y_test))`
