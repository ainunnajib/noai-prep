/*
  Practice tasks for the practice-set lesson. GENERATED from a Python source in which every task was
  verified: the model solution passes all visible and hidden tests, and the starter code fails them.
  Each test is a small Python function; DRIVER runs the learner's code and the tests in Pyodide.
*/

export interface PracticeTest {
  name: string
  call: string
  expect: string
}

export interface PracticeTask {
  id: string
  title: string
  lib: string
  brief: string
  hand: string
  stub: string
  solution: string
  visible: PracticeTest[]
  hidden: PracticeTest[]
  visibleCode: string
  hiddenCode: string
}

export const DRIVER = "\nimport json\nimport numpy as np\n\ndef _fmt(x):\n    try:\n        a = np.asarray(x, dtype=float)\n    except Exception:\n        return repr(x)\n    if a.ndim == 0:\n        return f\"{float(a):.4f}\"\n    return np.array2string(np.round(a, 4), separator=\", \")\n\ndef expect_close(got, want, tol=1e-4):\n    if got is None:\n        raise AssertionError(\"your function returned None (is a return statement missing?)\")\n    try:\n        g = np.asarray(got, dtype=float)\n    except Exception:\n        raise AssertionError(f\"expected {_fmt(want)}, got {got!r}\")\n    w = np.asarray(want, dtype=float)\n    if g.shape != w.shape:\n        raise AssertionError(f\"expected shape {w.shape}, got shape {g.shape}: {_fmt(g)}\")\n    if not np.all(np.isfinite(g)):\n        raise AssertionError(f\"got nan or inf: {_fmt(g)}\")\n    if not np.allclose(g, w, atol=tol, rtol=0):\n        raise AssertionError(f\"expected {_fmt(w)}, got {_fmt(g)}\")\n\ndef expect_true(cond, msg):\n    if not cond:\n        raise AssertionError(msg)\n\ndef _run(user_code, test_code):\n    ns = {\"np\": np, \"__name__\": \"__main__\", \"expect_close\": expect_close, \"expect_true\": expect_true, \"USER_SOURCE\": user_code}\n    try:\n        exec(user_code, ns)\n    except Exception as e:\n        return json.dumps({\"error\": f\"{type(e).__name__}: {e}\", \"results\": []})\n    try:\n        exec(test_code, ns)\n    except Exception as e:\n        return json.dumps({\"error\": f\"{type(e).__name__} while setting up the tests: {e}\", \"results\": []})\n    out = []\n    for name, fn in ns[\"TESTS\"]:\n        try:\n            fn()\n            out.append([name, True, \"\"])\n        except AssertionError as e:\n            out.append([name, False, str(e) or \"assertion failed\"])\n        except Exception as e:\n            out.append([name, False, f\"{type(e).__name__}: {e}\"])\n    return json.dumps({\"error\": None, \"results\": out})\n"

export const TASKS: PracticeTask[] = [
  {
    "id": "prf1",
    "title": "Precision, recall and F1",
    "lib": "NumPy",
    "brief": "Binary labels (0 or 1). Return precision, recall and F1 as Python floats. If a denominator is 0, that score is 0.0.",
    "hand": "y_true = [1, 0, 1, 1, 0], y_pred = [1, 1, 0, 1, 0]: TP = 2 (positions 0 and 3), FP = 1 (position 1), FN = 1 (position 2). Precision = 2/3, recall = 2/3, F1 = 2/3.",
    "stub": "import numpy as np\n\ndef precision_recall_f1(y_true, y_pred):\n    y_true = np.asarray(y_true)\n    y_pred = np.asarray(y_pred)\n    # count TP, FP and FN with boolean masks, then guard every division\n    ...\n",
    "solution": "import numpy as np\n\ndef precision_recall_f1(y_true, y_pred):\n    y_true = np.asarray(y_true)\n    y_pred = np.asarray(y_pred)\n    tp = np.sum((y_pred == 1) & (y_true == 1))\n    fp = np.sum((y_pred == 1) & (y_true == 0))\n    fn = np.sum((y_pred == 0) & (y_true == 1))\n    precision = tp / (tp + fp) if tp + fp > 0 else 0.0\n    recall = tp / (tp + fn) if tp + fn > 0 else 0.0\n    f1 = 2 * precision * recall / (precision + recall) if precision + recall > 0 else 0.0\n    return float(precision), float(recall), float(f1)\n",
    "visible": [
      {
        "name": "the hand example",
        "call": "precision_recall_f1([1, 0, 1, 1, 0], [1, 1, 0, 1, 0])",
        "expect": "(0.6667, 0.6667, 0.6667)"
      },
      {
        "name": "a perfect classifier",
        "call": "precision_recall_f1([0, 1, 1], [0, 1, 1])",
        "expect": "(1.0, 1.0, 1.0)"
      }
    ],
    "hidden": [
      {
        "name": "no positive predictions (0 / 0)",
        "call": "precision_recall_f1([1, 1, 0], [0, 0, 0])",
        "expect": "(0.0, 0.0, 0.0)"
      },
      {
        "name": "returns Python floats",
        "call": "type of each returned value",
        "expect": "float"
      },
      {
        "name": "a bigger random case",
        "call": "200 random labels",
        "expect": "matches the formula"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(precision_recall_f1([1, 0, 1, 1, 0], [1, 1, 0, 1, 0]), (2/3, 2/3, 2/3))\ndef _t1():\n    expect_close(precision_recall_f1([0, 1, 1], [0, 1, 1]), (1, 1, 1))\nTESTS = [('the hand example', _t0), ('a perfect classifier', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(precision_recall_f1([1, 1, 0], [0, 0, 0]), (0, 0, 0))\ndef _t1():\n    expect_true(all(type(v) is float for v in precision_recall_f1([1, 0], [1, 1])), \"return Python floats, e.g. float(precision)\")\ndef _t2():\n    _r = np.random.default_rng(1); _t = _r.integers(0, 2, 200); _p = _r.integers(0, 2, 200); _tp = ((_t == 1) & (_p == 1)).sum(); _P = _tp / (_p == 1).sum(); _R = _tp / (_t == 1).sum(); expect_close(precision_recall_f1(_t, _p), (_P, _R, 2 * _P * _R / (_P + _R)))\nTESTS = [('no positive predictions (0 / 0)', _t0), ('returns Python floats', _t1), ('a bigger random case', _t2)]\n"
  },
  {
    "id": "softmax_ce",
    "title": "Softmax cross-entropy",
    "lib": "NumPy",
    "brief": "logits has shape (N, C) and labels holds N class indices. Return the mean cross-entropy as a float. It must not overflow for huge logits such as 1000.",
    "hand": "One sample with logits [0, 0, 0, 0]: every class gets probability 1/4, so the loss is −ln(1/4) = ln 4 ≈ 1.3863.",
    "stub": "import numpy as np\n\ndef softmax_cross_entropy(logits, labels):\n    logits = np.asarray(logits, dtype=float)\n    labels = np.asarray(labels)\n    # subtract each row's maximum first, then use log-sum-exp\n    ...\n",
    "solution": "import numpy as np\n\ndef softmax_cross_entropy(logits, labels):\n    logits = np.asarray(logits, dtype=float)\n    labels = np.asarray(labels)\n    # subtract each row's max: the largest entry becomes 0\n    z = logits - logits.max(axis=1, keepdims=True)\n    log_probs = z - np.log(np.exp(z).sum(axis=1, keepdims=True))\n    return float(-log_probs[np.arange(len(labels)), labels].mean())\n",
    "visible": [
      {
        "name": "equal logits",
        "call": "softmax_cross_entropy([[0, 0, 0, 0]], [2])",
        "expect": "1.3863 (= ln 4)"
      },
      {
        "name": "two samples",
        "call": "softmax_cross_entropy([[2, 0], [0, 2]], [0, 0])",
        "expect": "1.1269"
      }
    ],
    "hidden": [
      {
        "name": "huge logits, right class",
        "call": "softmax_cross_entropy([[1000, 0]], [0])",
        "expect": "0.0, not nan"
      },
      {
        "name": "huge logits, wrong class",
        "call": "softmax_cross_entropy([[1000, 0]], [1])",
        "expect": "1000.0, not inf"
      },
      {
        "name": "N = 3, C = 5",
        "call": "random logits",
        "expect": "matches the formula"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(softmax_cross_entropy([[0, 0, 0, 0]], [2]), np.log(4))\ndef _t1():\n    expect_close(softmax_cross_entropy([[2, 0], [0, 2]], [0, 0]), (np.log(1 + np.exp(-2)) + np.log(1 + np.exp(2))) / 2)\nTESTS = [('equal logits', _t0), ('two samples', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(softmax_cross_entropy([[1000, 0]], [0]), 0.0)\ndef _t1():\n    expect_close(softmax_cross_entropy([[1000, 0]], [1]), 1000.0)\ndef _t2():\n    _r = np.random.default_rng(2); _L = _r.normal(size=(3, 5)); _y = np.array([4, 0, 2]); _p = np.exp(_L) / np.exp(_L).sum(1, keepdims=True); expect_close(softmax_cross_entropy(_L, _y), -np.log(_p[np.arange(3), _y]).mean())\nTESTS = [('huge logits, right class', _t0), ('huge logits, wrong class', _t1), ('N = 3, C = 5', _t2)]\n"
  },
  {
    "id": "knn",
    "title": "k-nearest neighbours",
    "lib": "NumPy",
    "brief": "Euclidean distance. Each test point takes a majority vote among its k nearest training points; break a tied vote by choosing the smallest label. Return an integer array of shape (n_test,).",
    "hand": "Training points (0, 0), (1, 0), (0, 1) with labels 0, 0, 1 and a test point (0.2, 0.2), k = 3: all three are neighbours and the vote is two 0s against one 1, so the prediction is 0.",
    "stub": "import numpy as np\n\ndef knn_predict(X_train, y_train, X_test, k):\n    X_train = np.asarray(X_train, dtype=float)\n    y_train = np.asarray(y_train)\n    X_test = np.asarray(X_test, dtype=float)\n    # distances (n_test, n_train), the k smallest per row, then a vote\n    ...\n",
    "solution": "import numpy as np\n\ndef knn_predict(X_train, y_train, X_test, k):\n    X_train = np.asarray(X_train, dtype=float)\n    y_train = np.asarray(y_train)\n    X_test = np.asarray(X_test, dtype=float)\n    # squared distances, shape (n_test, n_train)\n    d = ((X_test[:, None, :] - X_train[None, :, :]) ** 2).sum(axis=-1)\n    # indices of the k nearest, shape (n_test, k)\n    nearest = np.argsort(d, axis=1, kind='stable')[:, :k]\n    votes = y_train[nearest].astype(np.intp)   # bincount wants this int type\n    # bincount counts each label; argmax picks the smallest label on a tie\n    return np.array([np.bincount(v).argmax() for v in votes])\n",
    "visible": [
      {
        "name": "1-D, k = 1",
        "call": "knn_predict([[0], [10]], [0, 1], [[2], [9]], 1)",
        "expect": "[0, 1]"
      },
      {
        "name": "the hand example, k = 3",
        "call": "knn_predict([[0, 0], [1, 0], [0, 1], [5, 5], [6, 5]], [0, 0, 1, 1, 1], [[0.2, 0.2]], 3)",
        "expect": "[0]"
      }
    ],
    "hidden": [
      {
        "name": "a tied vote picks the smallest label",
        "call": "knn_predict([[0], [1]], [1, 0], [[0.4]], 2)",
        "expect": "[0]"
      },
      {
        "name": "returns integers",
        "call": "dtype of the result",
        "expect": "an integer type"
      },
      {
        "name": "many test points at once",
        "call": "50 random test points",
        "expect": "matches a slow loop"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(knn_predict([[0], [10]], [0, 1], [[2], [9]], 1), [0, 1])\ndef _t1():\n    expect_close(knn_predict([[0, 0], [1, 0], [0, 1], [5, 5], [6, 5]], [0, 0, 1, 1, 1], [[0.2, 0.2]], 3), [0])\nTESTS = [('1-D, k = 1', _t0), ('the hand example, k = 3', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(knn_predict([[0], [1]], [1, 0], [[0.4]], 2), [0])\ndef _t1():\n    expect_true(np.issubdtype(np.asarray(knn_predict([[0], [1]], [0, 1], [[0.9]], 1)).dtype, np.integer), \"return integer labels, not floats\")\ndef _t2():\n    _r = np.random.default_rng(3); _X = _r.normal(size=(40, 2)); _y = _r.integers(0, 3, 40).astype(np.intp); _T = _r.normal(size=(50, 2)); _slow = [np.bincount(_y[np.argsort(((_X - t) ** 2).sum(1), kind=\"stable\")[:5]], minlength=3).argmax() for t in _T]; expect_close(knn_predict(_X, _y, _T, 5), _slow)\nTESTS = [('a tied vote picks the smallest label', _t0), ('returns integers', _t1), ('many test points at once', _t2)]\n"
  },
  {
    "id": "pca",
    "title": "PCA with covariance eigenvectors",
    "lib": "NumPy",
    "brief": "Centre X (n, d), take the eigenvectors of its covariance matrix and keep the n_components with the largest eigenvalues. Return (X_projected of shape (n, n_components), components of shape (n_components, d)), components sorted by decreasing variance, each of length 1. The sign of a component may be either way.",
    "hand": "Points (1, 2), (2, 4), (3, 6), (4, 8) all lie on the line y = 2x, so the first component points along [1, 2] / √5 ≈ [0.447, 0.894] (or its negative).",
    "stub": "import numpy as np\n\ndef pca(X, n_components):\n    X = np.asarray(X, dtype=float)\n    # centre, covariance, np.linalg.eigh, sort by eigenvalue (largest first)\n    ...\n",
    "solution": "import numpy as np\n\ndef pca(X, n_components):\n    X = np.asarray(X, dtype=float)\n    Xc = X - X.mean(axis=0)\n    cov = Xc.T @ Xc / (len(X) - 1)                  # (d, d)\n    # eigenvalues in ascending order, eigenvectors in columns\n    values, vectors = np.linalg.eigh(cov)\n    order = np.argsort(values)[::-1][:n_components]\n    components = vectors[:, order].T                # (n_components, d)\n    return Xc @ components.T, components\n",
    "visible": [
      {
        "name": "points on y = 2x",
        "call": "pca([[1, 2], [2, 4], [3, 6], [4, 8]], 1)[1]",
        "expect": "±[[0.4472, 0.8944]]"
      },
      {
        "name": "shapes",
        "call": "X of shape (10, 3), n_components = 2",
        "expect": "(10, 2) and (2, 3)"
      }
    ],
    "hidden": [
      {
        "name": "components have length 1 and are perpendicular",
        "call": "W @ W.T",
        "expect": "the identity"
      },
      {
        "name": "sorted by variance",
        "call": "variance of each projected column",
        "expect": "the largest eigenvalues, largest first"
      },
      {
        "name": "the projection is centred",
        "call": "column means of X_projected",
        "expect": "0"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(np.abs(pca([[1, 2], [2, 4], [3, 6], [4, 8]], 1)[1]), [[1 / np.sqrt(5), 2 / np.sqrt(5)]])\ndef _t1():\n    _P, _W = pca(np.random.default_rng(4).normal(size=(10, 3)), 2); expect_true(np.shape(_P) == (10, 2) and np.shape(_W) == (2, 3), f\"got shapes {np.shape(_P)} and {np.shape(_W)}\")\nTESTS = [('points on y = 2x', _t0), ('shapes', _t1)]\n",
    "hiddenCode": "def _t0():\n    _W = pca(np.random.default_rng(5).normal(size=(30, 4)), 3)[1]; expect_close(np.asarray(_W) @ np.asarray(_W).T, np.eye(3))\ndef _t1():\n    _X = np.random.default_rng(6).normal(size=(50, 3)) * [3, 1, 0.5]; _P = np.asarray(pca(_X, 3)[0]); expect_close(_P.var(axis=0, ddof=1), np.sort(np.linalg.eigvalsh(np.cov(_X, rowvar=False)))[::-1])\ndef _t2():\n    _P = np.asarray(pca(np.random.default_rng(7).normal(size=(20, 3)) + 10, 2)[0]); expect_close(_P.mean(axis=0), [0, 0])\nTESTS = [('components have length 1 and are perpendicular', _t0), ('sorted by variance', _t1), ('the projection is centred', _t2)]\n"
  },
  {
    "id": "layernorm",
    "title": "Layer normalisation",
    "lib": "NumPy",
    "brief": "x has shape (N, D). Normalise each row to mean 0 and variance 1, using the biased variance (divide by D, as PyTorch does) plus eps, then multiply by gamma (D,) and add beta (D,).",
    "hand": "Row [1, 2, 3]: mean 2, variance ((−1)² + 0² + 1²) / 3 = 2/3, so with eps = 0 the result is [−1, 0, 1] / √(2/3) ≈ [−1.2247, 0, 1.2247].",
    "stub": "import numpy as np\n\ndef layer_norm(x, gamma, beta, eps=1e-5):\n    x = np.asarray(x, dtype=float)\n    # mean and variance over the LAST axis, keepdims=True\n    ...\n",
    "solution": "import numpy as np\n\ndef layer_norm(x, gamma, beta, eps=1e-5):\n    x = np.asarray(x, dtype=float)\n    mean = x.mean(axis=-1, keepdims=True)           # (N, 1)\n    var = x.var(axis=-1, keepdims=True)             # biased: divides by D\n    return gamma * (x - mean) / np.sqrt(var + eps) + beta\n",
    "visible": [
      {
        "name": "one row",
        "call": "layer_norm([[1, 2, 3]], np.ones(3), np.zeros(3), eps=0)",
        "expect": "[[-1.2247, 0, 1.2247]]"
      },
      {
        "name": "gamma and beta",
        "call": "layer_norm([[1, 3]], np.array([2, 2]), np.array([1, 1]), eps=0)",
        "expect": "[[-1, 3]]"
      }
    ],
    "hidden": [
      {
        "name": "each row on its own",
        "call": "rows [1, 2, 3] and [100, 200, 300]",
        "expect": "the same normalised row twice"
      },
      {
        "name": "a constant row",
        "call": "layer_norm([[5, 5, 5]], np.ones(3), np.zeros(3))",
        "expect": "[[0, 0, 0]], not nan"
      },
      {
        "name": "biased variance with eps",
        "call": "random (4, 6) input",
        "expect": "matches nn.LayerNorm"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(layer_norm([[1, 2, 3]], np.ones(3), np.zeros(3), eps=0), [[-np.sqrt(1.5), 0, np.sqrt(1.5)]])\ndef _t1():\n    expect_close(layer_norm([[1, 3]], np.array([2, 2]), np.array([1, 1]), eps=0), [[-1, 3]])\nTESTS = [('one row', _t0), ('gamma and beta', _t1)]\n",
    "hiddenCode": "def _t0():\n    _o = layer_norm([[1, 2, 3], [100, 200, 300]], np.ones(3), np.zeros(3), eps=0); expect_close(_o, [[-np.sqrt(1.5), 0, np.sqrt(1.5)]] * 2)\ndef _t1():\n    expect_close(layer_norm([[5, 5, 5]], np.ones(3), np.zeros(3)), [[0, 0, 0]])\ndef _t2():\n    _x = np.random.default_rng(8).normal(size=(4, 6)); expect_close(layer_norm(_x, np.ones(6), np.zeros(6)), (_x - _x.mean(1, keepdims=True)) / np.sqrt(_x.var(1, keepdims=True) + 1e-5))\nTESTS = [('each row on its own', _t0), ('a constant row', _t1), ('biased variance with eps', _t2)]\n"
  },
  {
    "id": "conv2d",
    "title": "conv2d forward pass",
    "lib": "NumPy",
    "brief": "image (H, W) and a square kernel (k, k). Cross-correlation, as in PyTorch (do not flip the kernel). Pad with zeros, then slide with the given stride. Each output side is (H + 2·padding − k) // stride + 1.",
    "hand": "Image [[1, 2, 3], [4, 5, 6], [7, 8, 9]] and kernel [[1, 0], [0, 1]]: each output adds a window's top-left and bottom-right, giving [[1 + 5, 2 + 6], [4 + 8, 5 + 9]] = [[6, 8], [12, 14]].",
    "stub": "import numpy as np\n\ndef conv2d(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding)\n    kernel = np.asarray(kernel, dtype=float)\n    # output size, then loop over output positions\n    ...\n",
    "solution": "import numpy as np\n\ndef conv2d(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding)\n    kernel = np.asarray(kernel, dtype=float)\n    k = kernel.shape[0]\n    H, W = image.shape          # already padded\n    out_h = (H - k) // stride + 1\n    out_w = (W - k) // stride + 1\n    out = np.zeros((out_h, out_w))\n    for i in range(out_h):\n        for j in range(out_w):\n            r, c = i * stride, j * stride\n            patch = image[r:r + k, c:c + k]\n            out[i, j] = np.sum(patch * kernel)\n    return out\n",
    "visible": [
      {
        "name": "the hand example",
        "call": "conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]])",
        "expect": "[[6, 8], [12, 14]]"
      },
      {
        "name": "output size",
        "call": "conv2d(np.ones((5, 5)), np.ones((3, 3)))",
        "expect": "a (3, 3) array of 9s"
      }
    ],
    "hidden": [
      {
        "name": "stride 2",
        "call": "conv2d(np.arange(25).reshape(5, 5), np.ones((3, 3)), stride=2)",
        "expect": "[[54, 72], [144, 162]]"
      },
      {
        "name": "padding 1 keeps a 4 × 4 size",
        "call": "conv2d(np.ones((4, 4)), np.ones((3, 3)), padding=1)",
        "expect": "corners 4, edges 6, centre 9"
      },
      {
        "name": "the kernel is not flipped",
        "call": "conv2d([[1, 0], [0, 0]], [[1, 2], [3, 4]])",
        "expect": "[[1]]"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]]), [[6, 8], [12, 14]])\ndef _t1():\n    expect_close(conv2d(np.ones((5, 5)), np.ones((3, 3))), np.full((3, 3), 9.0))\nTESTS = [('the hand example', _t0), ('output size', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(conv2d(np.arange(25).reshape(5, 5), np.ones((3, 3)), stride=2), [[54, 72], [144, 162]])\ndef _t1():\n    expect_close(conv2d(np.ones((4, 4)), np.ones((3, 3)), padding=1), [[4, 6, 6, 4], [6, 9, 9, 6], [6, 9, 9, 6], [4, 6, 6, 4]])\ndef _t2():\n    expect_close(conv2d([[1, 0], [0, 0]], [[1, 2], [3, 4]]), [[1]])\nTESTS = [('stride 2', _t0), ('padding 1 keeps a 4 × 4 size', _t1), ('the kernel is not flipped', _t2)]\n"
  },
  {
    "id": "conv2d_fast",
    "title": "conv2d without loops (stretch)",
    "lib": "NumPy",
    "brief": "The conv2d task again (cross-correlation, zero padding, stride, same output size), but vectorised: no Python for loop, while loop or comprehension anywhere. Build the patch matrix with sliding_window_view and use one matrix-vector product. A hidden test reads your code to check for loops.",
    "hand": "Image [[1, 2, 3], [4, 5, 6], [7, 8, 9]] and kernel [[1, 0], [0, 1]]: the four 2 × 2 windows, read row by row, are [1, 2, 4, 5], [2, 3, 5, 6], [4, 5, 7, 8] and [5, 6, 8, 9]. Stacked as rows they form a 4 × 4 patch matrix; times the flattened kernel [1, 0, 0, 1] it gives [6, 8, 12, 14], which reshapes to [[6, 8], [12, 14]].",
    "stub": "import numpy as np\nfrom numpy.lib.stride_tricks import sliding_window_view\n\ndef conv2d_fast(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding)\n    kernel = np.asarray(kernel, dtype=float)\n    k = kernel.shape[0]\n    # sliding_window_view(image, (k, k)) has shape\n    # (H - k + 1, W - k + 1, k, k): one k x k window per position.\n    # Keep every stride-th window, reshape to (windows, k * k),\n    # multiply by the flattened kernel, reshape to the output.\n    ...\n",
    "solution": "import numpy as np\nfrom numpy.lib.stride_tricks import sliding_window_view\n\ndef conv2d_fast(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding)\n    kernel = np.asarray(kernel, dtype=float)\n    k = kernel.shape[0]\n    # every k x k window, then every stride-th one\n    windows = sliding_window_view(image, (k, k))[::stride, ::stride]\n    out_h, out_w = windows.shape[:2]\n    # the patch matrix: one window per row\n    patches = windows.reshape(out_h * out_w, k * k)\n    return (patches @ kernel.reshape(-1)).reshape(out_h, out_w)\n",
    "visible": [
      {
        "name": "the hand example",
        "call": "conv2d_fast([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]])",
        "expect": "[[6, 8], [12, 14]]"
      },
      {
        "name": "matches the loop version",
        "call": "random 8 × 8 image, 3 × 3 kernel",
        "expect": "the same as a loop conv2d"
      }
    ],
    "hidden": [
      {
        "name": "stride 2 and padding 1",
        "call": "random 9 × 9 image, stride=2, padding=1",
        "expect": "the same as a loop conv2d"
      },
      {
        "name": "a non-square image",
        "call": "random 5 × 8 image, 2 × 2 kernel",
        "expect": "a (4, 7) result that matches"
      },
      {
        "name": "no Python loops",
        "call": "your code",
        "expect": "no for, while or comprehension"
      }
    ],
    "visibleCode": "def _slow(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding); kernel = np.asarray(kernel, dtype=float); k = len(kernel)\n    oh = (image.shape[0] - k) // stride + 1; ow = (image.shape[1] - k) // stride + 1\n    return np.array([[np.sum(image[i * stride:i * stride + k, j * stride:j * stride + k] * kernel) for j in range(ow)] for i in range(oh)])\ndef _t0():\n    expect_close(conv2d_fast([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]]), [[6, 8], [12, 14]])\ndef _t1():\n    _r = np.random.default_rng(10); _x = _r.normal(size=(8, 8)); _k = _r.normal(size=(3, 3)); expect_close(conv2d_fast(_x, _k), _slow(_x, _k))\nTESTS = [('the hand example', _t0), ('matches the loop version', _t1)]\n",
    "hiddenCode": "import ast as _ast\ndef _slow(image, kernel, stride=1, padding=0):\n    image = np.pad(np.asarray(image, dtype=float), padding); kernel = np.asarray(kernel, dtype=float); k = len(kernel)\n    oh = (image.shape[0] - k) // stride + 1; ow = (image.shape[1] - k) // stride + 1\n    return np.array([[np.sum(image[i * stride:i * stride + k, j * stride:j * stride + k] * kernel) for j in range(ow)] for i in range(oh)])\ndef _t0():\n    _r = np.random.default_rng(11); _x = _r.normal(size=(9, 9)); _k = _r.normal(size=(3, 3)); expect_close(conv2d_fast(_x, _k, stride=2, padding=1), _slow(_x, _k, stride=2, padding=1))\ndef _t1():\n    _r = np.random.default_rng(12); _x = _r.normal(size=(5, 8)); _k = _r.normal(size=(2, 2)); expect_close(conv2d_fast(_x, _k), _slow(_x, _k))\ndef _t2():\n    expect_close(conv2d_fast([[1, 2], [3, 4]], [[2]]), [[2, 4], [6, 8]])\n    _names = {_ast.For: 'a for loop', _ast.AsyncFor: 'a for loop', _ast.While: 'a while loop', _ast.comprehension: 'a comprehension'}\n    _found = [_names[type(n)] for n in _ast.walk(_ast.parse(USER_SOURCE)) if type(n) in _names]\n    expect_true(not _found, f\"your code still has {_found[0] if _found else ''}: replace it with array operations\")\nTESTS = [('stride 2 and padding 1', _t0), ('a non-square image', _t1), ('no Python loops', _t2)]\n"
  },
  {
    "id": "logreg",
    "title": "Logistic regression gradient with L2",
    "lib": "NumPy",
    "brief": "Loss = mean binary cross-entropy of p = sigmoid(X @ w + b), plus (lam / 2)·sum(w²). Return the gradients (dw, db). The bias b is not regularised.",
    "hand": "w = [0, 0], b = 0: every p = 0.5. With X = [[1, 2], [3, 4]] and y = [1, 0], p − y = [−0.5, 0.5], so dw = Xᵀ(p − y) / 2 = [0.5, 0.5] and db = mean(p − y) = 0.",
    "stub": "import numpy as np\n\ndef logistic_grad(w, b, X, y, lam):\n    w = np.asarray(w, dtype=float)\n    X = np.asarray(X, dtype=float)\n    y = np.asarray(y, dtype=float)\n    # p = sigmoid(X @ w + b); dw = X.T @ (p - y) / n + lam * w; db = mean(p - y)\n    ...\n",
    "solution": "import numpy as np\n\ndef logistic_grad(w, b, X, y, lam):\n    w = np.asarray(w, dtype=float)\n    X = np.asarray(X, dtype=float)\n    y = np.asarray(y, dtype=float)\n    p = 1 / (1 + np.exp(-(X @ w + b)))\n    # the L2 term goes on the weights only, not on b\n    dw = X.T @ (p - y) / len(y) + lam * w\n    db = np.mean(p - y)\n    return dw, float(db)\n",
    "visible": [
      {
        "name": "the hand example",
        "call": "logistic_grad([0, 0], 0, [[1, 2], [3, 4]], [1, 0], 0)",
        "expect": "([0.5, 0.5], 0.0)"
      },
      {
        "name": "the L2 term",
        "call": "logistic_grad([1, -1], 0, [[0, 0]], [1], 0.1)",
        "expect": "([0.1, -0.1], -0.5)"
      }
    ],
    "hidden": [
      {
        "name": "the bias is not regularised",
        "call": "db with lam = 100",
        "expect": "the same as with lam = 0"
      },
      {
        "name": "matches a numerical gradient",
        "call": "finite differences on random data",
        "expect": "agree to 1e-4"
      }
    ],
    "visibleCode": "def _t0():\n    _dw, _db = logistic_grad([0, 0], 0, [[1, 2], [3, 4]], [1, 0], 0); expect_close(_dw, [0.5, 0.5]); expect_close(_db, 0.0)\ndef _t1():\n    _dw, _db = logistic_grad([1, -1], 0, [[0, 0]], [1], 0.1); expect_close(_dw, [0.1, -0.1]); expect_close(_db, -0.5)\nTESTS = [('the hand example', _t0), ('the L2 term', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(logistic_grad([1, 2], 3, [[1, 0], [0, 1]], [1, 0], 100)[1], logistic_grad([1, 2], 3, [[1, 0], [0, 1]], [1, 0], 0)[1])\ndef _t1():\n    _r = np.random.default_rng(9); _X = _r.normal(size=(20, 3)); _y = _r.integers(0, 2, 20); _w = _r.normal(size=3); _b = 0.3\n    def _loss(w, b):\n        p = 1 / (1 + np.exp(-(_X @ w + b)))\n        return -np.mean(_y * np.log(p) + (1 - _y) * np.log(1 - p)) + 0.05 * np.sum(w ** 2)\n    _h = 1e-6; _num = [(_loss(_w + _h * e, _b) - _loss(_w - _h * e, _b)) / (2 * _h) for e in np.eye(3)]; expect_close(logistic_grad(_w, _b, _X, _y, 0.1)[0], _num)\nTESTS = [('the bias is not regularised', _t0), ('matches a numerical gradient', _t1)]\n"
  },
  {
    "id": "dice",
    "title": "Dice loss",
    "lib": "NumPy",
    "brief": "pred holds probabilities in [0, 1] and target a 0/1 mask of the same shape. Dice = (2·sum(pred·target) + eps) / (sum(pred) + sum(target) + eps). Return 1 − Dice as a float.",
    "hand": "pred = [1, 1, 0, 0], target = [1, 0, 1, 0]: overlap 1, sums 2 and 2, so Dice = 2·1 / (2 + 2) = 0.5 and the loss is 0.5.",
    "stub": "import numpy as np\n\ndef dice_loss(pred, target, eps=1e-6):\n    pred = np.asarray(pred, dtype=float)\n    target = np.asarray(target, dtype=float)\n    ...\n",
    "solution": "import numpy as np\n\ndef dice_loss(pred, target, eps=1e-6):\n    pred = np.asarray(pred, dtype=float)\n    target = np.asarray(target, dtype=float)\n    overlap = np.sum(pred * target)\n    dice = (2 * overlap + eps) / (pred.sum() + target.sum() + eps)\n    return float(1 - dice)\n",
    "visible": [
      {
        "name": "the hand example",
        "call": "dice_loss([1, 1, 0, 0], [1, 0, 1, 0])",
        "expect": "0.5"
      },
      {
        "name": "perfect overlap",
        "call": "dice_loss([[0, 1], [1, 1]], [[0, 1], [1, 1]])",
        "expect": "0.0"
      }
    ],
    "hidden": [
      {
        "name": "both masks empty",
        "call": "dice_loss([0, 0], [0, 0])",
        "expect": "0.0, not nan"
      },
      {
        "name": "soft predictions",
        "call": "dice_loss([0.5, 0.5], [1, 0])",
        "expect": "0.5"
      },
      {
        "name": "no overlap at all",
        "call": "dice_loss([1, 0], [0, 1])",
        "expect": "almost 1"
      }
    ],
    "visibleCode": "def _t0():\n    expect_close(dice_loss([1, 1, 0, 0], [1, 0, 1, 0]), 0.5)\ndef _t1():\n    expect_close(dice_loss([[0, 1], [1, 1]], [[0, 1], [1, 1]]), 0.0)\nTESTS = [('the hand example', _t0), ('perfect overlap', _t1)]\n",
    "hiddenCode": "def _t0():\n    expect_close(dice_loss([0, 0], [0, 0]), 0.0)\ndef _t1():\n    expect_close(dice_loss([0.5, 0.5], [1, 0]), 0.5)\ndef _t2():\n    expect_close(dice_loss([1, 0], [0, 1]), 1.0)\nTESTS = [('both masks empty', _t0), ('soft predictions', _t1), ('no overlap at all', _t2)]\n"
  }
]
