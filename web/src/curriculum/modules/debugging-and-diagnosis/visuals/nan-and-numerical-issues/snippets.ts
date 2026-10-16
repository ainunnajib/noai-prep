/*
  Code shown in the lesson, with the real output of each PyTorch snippet
  (PyTorch 2.14 on CPU; tracebacks shortened where marked with "...").
*/

export const SOFTMAX_NUMPY = `import numpy as np
np.seterr(all="ignore")   # hide NumPy's warnings so the output is easy to read

def softmax_naive(z):
    e = np.exp(z)
    return e / e.sum()

def softmax_stable(z):
    e = np.exp(z - z.max())   # largest exponent is now e^0 = 1
    return e / e.sum()

z = np.array([1000.0, 999.0, 998.0])
print("exp(z):        ", np.exp(z))
print("naive softmax: ", softmax_naive(z))
print("stable softmax:", softmax_stable(z))
print("small logits:  ", softmax_stable(np.array([2.0, 1.0, 0.0])))

# the special values follow fixed rules
inf = np.inf
print(inf - inf, 0 * inf, np.float64(0) / 0, np.log(0.0), np.sqrt(-1.0), np.nan + 1)`

export const LOG_SOFTMAX_CODE = `import torch
import torch.nn.functional as F

z = torch.tensor([[1000.0, 0.0, -1000.0]])   # logits for 3 classes
target = torch.tensor([2])                    # the true class is the third

print(torch.log(torch.softmax(z, dim=1)))     # two steps: softmax, then log
print(F.log_softmax(z, dim=1))                # one fused, stable step
print(F.cross_entropy(z, target))             # uses log_softmax inside`

export const LOG_SOFTMAX_OUTPUT = `tensor([[0., -inf, -inf]])
tensor([[    0., -1000., -2000.]])
tensor(2000.)`

export const ZERO_TIMES_LOG_CODE = `import torch

p = torch.tensor([0.0, 1.0])     # predicted probabilities
y = torch.tensor([0.0, 1.0])     # one-hot target
loss = -(y * torch.log(p)).sum()
print(torch.log(p))
print(loss)`

export const ANOMALY_CODE = `import torch

torch.autograd.set_detect_anomaly(True)

z = torch.tensor([3.0, -2.0, 120.0], requires_grad=True)  # logits from a model
y = torch.tensor([1.0, 0.0, 0.0])                         # true labels
p = torch.sigmoid(z)                                      # p[2] rounds to exactly 1.0
loss = -(y * torch.log(p) + (1 - y) * torch.log(1 - p)).mean()
print("loss:", loss.item())
loss.backward()`

export const ANOMALY_OUTPUT = `loss: inf
UserWarning: Error detected in SigmoidBackward0. Traceback of forward call that caused the error:
  File "train.py", line 7, in <module>
    p = torch.sigmoid(z)                                      # p[2] rounds to exactly 1.0
...
RuntimeError: Function 'SigmoidBackward0' returned nan values in its 0th output.`

export const BCE_FIX_CODE = `import torch
import torch.nn.functional as F

z = torch.tensor([3.0, -2.0, 120.0], requires_grad=True)
y = torch.tensor([1.0, 0.0, 0.0])
loss = F.binary_cross_entropy_with_logits(z, y)   # takes logits, never forms log(0)
loss.backward()
print("loss:", round(loss.item(), 4))
print("grad:", z.grad)`

export const BCE_FIX_OUTPUT = `loss: 40.0585
grad: tensor([-0.0158,  0.0397,  0.3333])`

export const GRAD_NORMS_CODE = `import torch
import torch.nn as nn

torch.manual_seed(0)
layers = []
for _ in range(10):
    layers += [nn.Linear(32, 32), nn.Sigmoid()]
model = nn.Sequential(*layers[:-1])        # 10 Linear layers with sigmoids between
x, y = torch.randn(64, 32), torch.randint(0, 32, (64,))

loss = nn.functional.cross_entropy(model(x), y)
loss.backward()
for name, p in model.named_parameters():
    if name.endswith("weight") and p.grad is not None:
        print(f"{name:9s} grad norm {p.grad.norm():.1e}")`

export const GRAD_NORMS_OUTPUT = `0.weight  grad norm 1.3e-08
2.weight  grad norm 4.7e-08
4.weight  grad norm 3.1e-07
6.weight  grad norm 2.7e-06
8.weight  grad norm 2.2e-05
10.weight grad norm 1.5e-04
12.weight grad norm 1.1e-03
14.weight grad norm 7.6e-03
16.weight grad norm 4.6e-02
18.weight grad norm 3.1e-01`
