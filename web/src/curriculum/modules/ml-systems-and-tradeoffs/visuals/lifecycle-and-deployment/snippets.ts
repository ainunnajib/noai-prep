/** Python snippets for <PyRunner> (kept in a .ts file so MDX leaves the indentation alone). */
export const SEED_DEMO = `from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
import warnings; warnings.filterwarnings("ignore")

X, y = make_moons(n_samples=300, noise=0.3, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.5, random_state=0)

for seed in [0, 1, 2, 0]:
    model = MLPClassifier(hidden_layer_sizes=(8,), max_iter=300, random_state=seed)
    model.fit(X_tr, y_tr)
    print(f"seed={seed}  test accuracy = {model.score(X_te, y_te):.3f}")
`
