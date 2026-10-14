/* Code shown in the lesson. Kept here so the MDX stays readable. Outputs were produced by running the code locally (NumPy 2.5). */

export const TRAIN_CODE = `import numpy as np
rng = np.random.default_rng(0)

# data: two interleaving half-moons (D = 2 features, K = 2 classes)
N, D, H, K = 200, 2, 16, 2
y = np.arange(N) % 2                        # labels 0, 1, 0, 1, ...
t = rng.uniform(0, np.pi, N)
X = np.c_[np.cos(t), np.sin(t)]             # (N, 2), a half-circle
X[y == 1] = 1 - X[y == 1] - [0, 0.5]        # flip and shift class 1
X += rng.normal(0, 0.15, X.shape)           # a little noise
Y = np.eye(K)[y]                            # one-hot labels, (N, K)

# parameters, He initialisation
W1 = rng.normal(0, np.sqrt(2 / D), (D, H)); b1 = np.zeros(H)
W2 = rng.normal(0, np.sqrt(2 / H), (H, K)); b2 = np.zeros(K)

def softmax(Z):
    Z = Z - Z.max(axis=1, keepdims=True)    # stops exp() overflowing
    E = np.exp(Z)
    return E / E.sum(axis=1, keepdims=True)

lr = 0.5
for step in range(2001):
    # 1. forward pass
    Z1 = X @ W1 + b1                        # (N, H)
    A1 = np.maximum(Z1, 0)                  # (N, H)
    Z2 = A1 @ W2 + b2                       # (N, K)
    P = softmax(Z2)                         # (N, K)
    # 2. loss: average cross-entropy
    loss = -np.sum(Y * np.log(P)) / N
    # 3. backward pass
    dZ2 = (P - Y) / N                       # (N, K)
    dW2 = A1.T @ dZ2                        # (H, K)
    db2 = dZ2.sum(axis=0)                   # (K,)
    dA1 = dZ2 @ W2.T                        # (N, H)
    dZ1 = dA1 * (Z1 > 0)                    # (N, H)
    dW1 = X.T @ dZ1                         # (D, H)
    db1 = dZ1.sum(axis=0)                   # (H,)
    # 4. update
    W1 -= lr * dW1;  b1 -= lr * db1
    W2 -= lr * dW2;  b2 -= lr * db2
    if step % 400 == 0:
        acc = (P.argmax(axis=1) == y).mean()
        print(f"step {step:4d}  loss {loss:.4f}  accuracy {acc:.3f}")`

export const TRAIN_OUTPUT = `step    0  loss 0.8123  accuracy 0.440
step  400  loss 0.2575  accuracy 0.895
step  800  loss 0.0936  accuracy 0.960
step 1200  loss 0.0698  accuracy 0.970
step 1600  loss 0.0635  accuracy 0.975
step 2000  loss 0.0598  accuracy 0.985`

export const GRADCHECK_CODE = `import numpy as np
rng = np.random.default_rng(1)

N, D, H, K = 5, 3, 4, 3                     # tiny on purpose
X = rng.normal(size=(N, D))
Y = np.eye(K)[rng.integers(0, K, N)]
params = {"W1": rng.normal(size=(D, H)), "b1": rng.normal(size=H),
          "W2": rng.normal(size=(H, K)), "b2": rng.normal(size=K)}

def loss_and_grads(p):
    Z1 = X @ p["W1"] + p["b1"]
    A1 = np.maximum(Z1, 0)
    Z2 = A1 @ p["W2"] + p["b2"]
    E = np.exp(Z2 - Z2.max(axis=1, keepdims=True))
    P = E / E.sum(axis=1, keepdims=True)
    loss = -np.sum(Y * np.log(P)) / N
    dZ2 = (P - Y) / N
    dZ1 = (dZ2 @ p["W2"].T) * (Z1 > 0)
    grads = {"W1": X.T @ dZ1, "b1": dZ1.sum(axis=0),
             "W2": A1.T @ dZ2, "b2": dZ2.sum(axis=0)}
    return loss, grads

def grad_check(name, eps=1e-5):
    _, grads = loss_and_grads(params)
    A = params[name]                        # the array we nudge
    num = np.zeros_like(A)
    for i in np.ndindex(A.shape):           # every entry, one by one
        old = A[i]
        A[i] = old + eps
        L_plus, _ = loss_and_grads(params)
        A[i] = old - eps
        L_minus, _ = loss_and_grads(params)
        A[i] = old                          # put it back!
        num[i] = (L_plus - L_minus) / (2 * eps)
    ana = grads[name]
    rel = np.linalg.norm(ana - num) / max(np.linalg.norm(ana),
                                          np.linalg.norm(num))
    print(f"{name}: relative error {rel:.1e}")

for name in ["W1", "b1", "W2", "b2"]:
    grad_check(name)`

export const GRADCHECK_OUTPUT = `W1: relative error 9.2e-11
b1: relative error 9.9e-11
W2: relative error 7.9e-11
b2: relative error 4.9e-11`
