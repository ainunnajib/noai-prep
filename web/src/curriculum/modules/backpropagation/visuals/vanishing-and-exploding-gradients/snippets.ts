/* Code shown in the lesson. Kept here so the MDX stays readable. Outputs were produced by running the code locally. */

export const GRAD_SIZES_CODE = `import numpy as np
rng = np.random.default_rng(0)

def grad_sizes(act, k, depth=20, n=32):
    # weights with std k / sqrt(n), a batch of 64 random inputs
    Ws = [rng.normal(0, k / np.sqrt(n), (n, n)) for _ in range(depth)]
    h = rng.normal(size=(64, n))
    zs = []
    for W in Ws:                         # forward pass
        z = h @ W
        zs.append(z)
        if act == "sigmoid":
            h = 1 / (1 + np.exp(-z))
        else:
            h = np.maximum(z, 0)         # ReLU
    g = rng.normal(size=h.shape)
    g = g / np.linalg.norm(g)            # the loss sends back size 1
    sizes = []
    for W, z in zip(reversed(Ws), reversed(zs)):   # backward pass
        sizes.append(np.linalg.norm(g))
        if act == "sigmoid":
            s = 1 / (1 + np.exp(-z))
            g = g * s * (1 - s)          # times sigmoid'(z)
        else:
            g = g * (z > 0)              # times ReLU'(z)
        g = g @ W.T                      # back through the weights
    return sizes[::-1]                   # sizes[0] is layer 1

for act, k in [("sigmoid", 1.0), ("relu", 1.0), ("relu", 2 ** 0.5),
               ("relu", 2.0)]:
    s = grad_sizes(act, k)
    print(f"{act:7s} k={k:.2f}  layer 1: {s[0]:.1e}  "
          f"layer 10: {s[9]:.1e}  layer 20: {s[-1]:.1e}")`

export const GRAD_SIZES_OUTPUT = `sigmoid k=1.00  layer 1: 7.1e-13  layer 10: 3.9e-07  layer 20: 1.0e+00
relu    k=1.00  layer 1: 1.6e-03  layer 10: 3.4e-02  layer 20: 1.0e+00
relu    k=1.41  layer 1: 1.1e+00  layer 10: 1.2e+00  layer 20: 1.0e+00
relu    k=2.00  layer 1: 1.3e+02  layer 10: 1.2e+01  layer 20: 1.0e+00`

export const TORCH_NORMS_CODE = `import torch
import torch.nn as nn

def deep_net(act, depth=20, width=32, gain=None):
    layers = []
    for _ in range(depth):
        lin = nn.Linear(width, width)
        if gain is not None:            # std = gain / sqrt(fan_in)
            nn.init.normal_(lin.weight, std=gain / width ** 0.5)
            nn.init.zeros_(lin.bias)
        layers += [lin, act()]
    return nn.Sequential(*layers, nn.Linear(width, 1))

torch.manual_seed(0)
x, y = torch.randn(64, 32), torch.randn(64, 1)
nets = {"sigmoid, default init": deep_net(nn.Sigmoid),
        "ReLU, He init        ": deep_net(nn.ReLU, gain=2 ** 0.5),
        "ReLU, std 3/sqrt(n)  ": deep_net(nn.ReLU, gain=3.0)}
for name, net in nets.items():
    loss = nn.functional.mse_loss(net(x), y)
    loss.backward()
    first = net[0].weight.grad.norm()   # layer 1
    last = net[38].weight.grad.norm()   # layer 20
    # clip_grad_norm_ returns the total norm BEFORE clipping
    before = nn.utils.clip_grad_norm_(net.parameters(), max_norm=1.0)
    grads = torch.cat([p.grad.flatten() for p in net.parameters()])
    print(f"{name} layer 1: {first:.1e}  layer 20: {last:.1e}  "
          f"clipped {before:.1e} -> {grads.norm():.2f}")`

export const TORCH_NORMS_OUTPUT = `sigmoid, default init layer 1: 7.2e-18  layer 20: 1.8e-01  clipped 1.6e+00 -> 1.00
ReLU, He init         layer 1: 1.4e-01  layer 20: 3.6e-02  clipped 5.2e-01 -> 0.52
ReLU, std 3/sqrt(n)   layer 1: 5.4e+11  layer 20: 2.3e+12  clipped 1.7e+13 -> 1.00`
