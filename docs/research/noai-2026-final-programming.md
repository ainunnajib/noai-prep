# NOAI 2026 Final Assessment, Section 2 (Programming): task breakdown, reference solutions, beginner walkthroughs

*Compiled Wed 14 Oct 2026 for the NOAI prep website. Audience: beginners (Sec 3 to JC/Poly). Every number in this file was produced by running the scripts in `research/final2026_solutions/` (Python 3.13, torch 2.14 CPU, scikit-learn 1.9.1, numpy 2.5).*

## 0. Sources and what was verified

| Source | What it is | Notes |
|---|---|---|
| `sources/raw/question_{1,2,3}_v20022026.ipynb` (text dumps in `sources/text/noai2026_final_question_*`) | The released **student** notebooks, timestamp 20 Feb 2026 | Built with **otter-grader** (`otter-assign`). The metadata holds the test suites, and answer cells are tagged `otter_answer_cell`. |
| `sources/gh/NOAI-2026/` (shallow clone of https://github.com/AISGNUSNOAI/NOAI-2026, HEAD `36555a1`, 29 Sep 2026) | Same three student notebooks + **official solutions** `question_{1,2,3}_solution.ipynb` | Student notebooks are identical to the local copies except for 1–2 extra "Supplementary Reading" links. Q3's solution was saved with its outputs; Q1 and Q2 were not. |
| `sources/unet_paper/unet_1505.04597.pdf` | Ronneberger et al. 2015, the original U-Net paper | Used to check a factual claim in Task 2 (see §4.8). |
| `research/official_facts.md` | Format facts | Final 2026 was 3 h with 100 marks: 20 MCQ + 80 programming. NOAI 2027 Final is Fri 5 Mar 2027 with "20 MCQ + 3 programming questions". Its duration and marks are not yet published. |

**Reference solutions (all run end-to-end on CPU and pass every visible check and every visible otter doctest):**

| Script | Runtime | Output log |
|---|---|---|
| `research/final2026_solutions/task1.py` | ~11 s | `task1_output.txt` |
| `research/final2026_solutions/task2.py` | ~26 s | `task2_output.txt` |
| `research/final2026_solutions/task3.py` | ~14 s | `task3_output.txt` |

No dataset download was needed. Task 1 uses `sklearn.datasets.make_regression`, and Tasks 2 and 3 use random tensors. The extra demos make their own synthetic data: blob "forest" images in Task 2 and an order-dependent token task in Task 3. Each script has four parts:

- **A:** the answer code, matching the official solution;
- **B:** the notebook's own test cells;
- **C:** the otter doctests from the metadata;
- **D:** extra verification and pitfall demos.

---

## 1. The paper at a glance

Section 2 has **3 Jupyter notebooks worth 80 marks**. The task totals 25 + 20 + 35 *include* 10 marks of "bonus" parts. Section 1 (20 MCQs, 20 marks) shares the same **3 hours**.

| | Task 1 | Task 2 | Task 3 |
|---|---|---|---|
| Title | **Gradient Boosting from Scratch** | **The Segmentation Fracture (Debugging U-Net)** | **The Attention Mechanism (Building the "Brain")** |
| Domain | Classical ML, regression | Deep learning, computer vision (semantic segmentation) | Deep learning, NLP (Transformer encoder) |
| Scenario | Low-power environmental sensor that cannot run XGBoost or LightGBM | *OrbitalVision* satellite images: Urban (0) vs Forest (1). An intern removed the padding and the network crashes. | *LinguaTech* lightweight language model for ancient text fragments |
| Marks | 25 = 8 + 12 + **5 bonus** | 20 = 10 + 10 (+ an unmarked system check) | 35 = 10 + 10 + 5 + 5 + **5 bonus** |
| Libraries | `numpy` + `sklearn.tree.DecisionTreeRegressor`. The test cells use `make_regression`, `train_test_split` and `mean_squared_error`. No external boosting library. | **Allowed:** `torch`, `torch.nn`, `torch.nn.functional`, `numpy`. **Banned:** `sklearn`, `torchmetrics`, any metric wrapper. | `torch`, `nn`, `F`, `math`, `numpy` (setup cell). No explicit ban list. |
| You write | 4 one-line functions, a `predict` loop, the boosting `fit` loop, and an early-stopping `fit` | `center_crop` + 1 line in `forward`, `calculate_miou`, and a 2–3 sentence design answer | Attention function, MHA layers + forward, *fix* PE, classifier head + forward, causal mask, and a 2–4 sentence answer |
| Code volume (official solution, approx.) | ~45 lines | ~25 lines | ~45 lines |
| Suggested time* | 40 min | 30 min | 60 min |

\*Suggested split for a 3 h paper: about 30 min for the 20 MCQs, 130 min for the tasks (roughly 1.6 min per mark), and 20 min to re-run every cell top-to-bottom and check that nothing crashes.

**Style compared with 2025.** In 2025 the tasks were three from-scratch NumPy functions with no tests; see `noai2025_programming.md` §6. The 2026 tasks are instead **fill-in-the-blank scaffolds**:

- you read and complete someone else's class, often an `nn.Module`;
- **debugging** is a graded skill (the crashing U-Net, the "buggy" positional encoding);
- two of the three tasks need **PyTorch tensor-shape fluency**;
- there are short **written explanations** (Q2.1b and Q3.2).

---

## 2. How the notebooks are graded (otter-grader)

- Each notebook's metadata has `"otter": {"OK_FORMAT": true, "tests": {...}}`. Each test is a **doctest suite**. Every `"points"` value is `null`, so the real points and the **hidden** test cases live in the organisers' autograder.
- **Visible doctests** (copied into Part C of each script):

| Test | What it checks |
|---|---|
| `q1.5_6` | `GradientBoostingRegressor(n_estimators=10, criterion='l2').fit(X, y)` on random 50×3 data leaves `len(gb.trees) == 10`. |
| `q1.7` | `GBREarlyStop(n_estimators=500, criterion='l2').fit(..., patience=10)` on `make_regression(300, 5, noise=5, random_state=42)` stops early (`len(trees) < 500`), and `predict` returns shape `(60,)`. |
| `q2.1a` | The fixed U-Net outputs **2 channels** for a 256×256 input, **and also works for a 128×128 input**. A hard-coded crop size fails this. |
| `q2.2` | A class absent from both prediction and target is skipped: an all-zero `pred` and `true` gives mIoU = **1.0**. |
| `q1.1`–`q1.4`, `q2.3`, all `q3.*` | **0 visible cases.** These suites are entirely hidden. |

- Answer cells carry the tag `otter_answer_cell`, and every other cell is `"editable": false`. **Keep every given name and signature exactly** (`l1_negative_gradient`, `self.trees`, `self.init_prediction`, `center_crop(layer, target_shape)`, `calculate_miou(...)`, `W_q/W_k/W_v/W_o`, `create_causal_mask(seq_len, device)`, etc.), because the hidden tests call them by name.
- The written answers, Q2.1b and Q3.2, sit between `<!-- BEGIN QUESTION -->` and `<!-- END QUESTION -->` markers. That is otter's marker for **manually graded** responses.
- Self-check cells print ✅/❌ but are not themselves the grade. One of them (Q2.2 "missing class") is **wrong**; see §4.6.
- Results are released only as award tiers: no scores and no breakdown (official_facts).

---

## 3. Task 1: Gradient Boosting from Scratch (25 marks)

### 3.1 Sub-parts, marks and exactly what to write

| Q | Marks | Code to write | One-line answer |
|---|---|---|---|
| 1.1 | 2 | `l1_negative_gradient(y, y_pred) -> np.ndarray` | `return np.sign(y - y_pred)` |
| 1.2 | 2 | `l2_negative_gradient(y, y_pred) -> np.ndarray` | `return y - y_pred` |
| 1.3 | 2 | `l1_initial_prediction(y) -> np.float64` | `return np.float64(np.median(y))` |
| 1.4 | 2 | `l2_initial_prediction(y) -> np.float64` | `return np.float64(np.mean(y))` |
| 1.5 | 4 | The markdown says "implement `__init__`", but `__init__` is already given. The empty slot marked *QUESTION 1.5* is **`BaseGradientBoosting.predict(X)`**. | Start from `np.full(X.shape[0], self.init_prediction)`, then add `self.learning_rate * tree.predict(X)` for every tree. |
| 1.6a | 8 (with 1.6b) | The body of `GradientBoostingRegressor.fit` loop: steps a–e | See §3.3 |
| 1.6b | — | `GradientBoostingRegressor.predict(X)` (same as 1.5) | Same loop |
| 1.7 | **5 bonus** | `GBREarlyStop.fit(X_train, y_train, X_val, y_val, patience=10, min_delta=1e-4)`: the loop body with validation tracking and the stop rule | See §3.3 |

### 3.2 Concepts needed

- **Residuals and the negative gradient.**
  - For L2 loss ½(y−ŷ)², −∂L/∂ŷ = y − ŷ, which is exactly the residual.
  - For L1 loss |y−ŷ|, −∂L/∂ŷ = sign(y−ŷ). At 0 we use a sub-gradient, and `np.sign` returns 0 there.
- **Best constant prediction.**
  - The **mean** minimises MSE. The **median** minimises MAE.
  - Verified by grid search on y = [3, 1, 2, 10]: MSE is minimised at 4.00, which is the mean. MAE is flat on [2, 3], an interval that contains the median 2.5.
- **Boosting as gradient descent in "function space".** Each tree is one small step downhill: F_m = F_{m−1} + η·h_m(x).
- **Learning rate (shrinkage), tree depth and number of trees** trade bias against variance.
- **Stochastic gradient boosting.** Each tree sees a random `subsample` of the rows, drawn without replacement.
- **Early stopping with a validation set.** It uses patience and `min_delta`, then keeps the best number of trees.
- **Python skills:**
  - classes, inheritance and `abc.ABC`/`@abstractmethod`;
  - `self.` attributes;
  - NumPy broadcasting, `np.full` and fancy indexing `X[idx]`;
  - the scikit-learn `fit`/`predict` API.

### 3.3 Step-by-step walkthrough (for a beginner)

**Golf picture.** Your first shot is the average. Every later shot aims at *where the ball still is*, not at the hole, and you only swing at 10% strength, which is the learning rate.

**Worked example (verified).** Take x = [1, 2, 3, 4], y = [3, 1, 2, 10], L2 loss, depth-1 trees, η = 0.1.

1. **F₀ = mean = 4.0** for everyone. MSE = 12.5.
2. **Residuals** r = y − F₀ = [−1, −3, −2, 6].
3. **Tree 1** learns r. Its best split is x ≤ 3.5, which predicts −2 on the left and +6 on the right.
4. **Update** F₁ = F₀ + 0.1·tree = [3.8, 3.8, 3.8, 4.6]. MSE = 10.22.
5. Repeat: new residuals [−0.8, −2.8, −1.8, 5.4] give F₂ = [3.62, 3.62, 3.62, 5.14] and MSE 8.37.
6. After 100 stumps the predictions are [2.88, 1.24, 1.98, 9.90], already close to y.

**The code, in the order you write it:**

```python
# Q1.1-1.4: the four helpers (one line each)
np.sign(y - y_pred);  y - y_pred;  np.float64(np.median(y));  np.float64(np.mean(y))

# Q1.6a: inside fit(), after the given initialisation
for m in range(self.n_estimators):
    residuals = self._compute_negative_gradient(y, current_pred)    # a. what is still wrong
    indices   = self._subsample_indices(n_samples, rng)             # b. rows this tree sees
    tree = DecisionTreeRegressor(max_depth=self.max_depth,
                                 random_state=rng.randint(0, 10000))
    tree.fit(X[indices], residuals[indices])                        # c. learn the residuals
    current_pred += self.learning_rate * tree.predict(X)            # d. small step, ALL rows
    self.trees.append(tree)                                         # e. remember it
return self

# Q1.5 / Q1.6b: predict() replays the same steps
pred = np.full(X.shape[0], self.init_prediction)
for tree in self.trees:
    pred += self.learning_rate * tree.predict(X)
return pred
```

**Bonus 1.7, early stopping.** Inside the loop:

1. Fit the tree exactly as above.
2. Update **both** `F_train` and `F_val` with `+= lr * tree.predict(...)`.
3. Compute the validation loss: MSE for `'l2'`, MAE for `'l1'`.
4. Check whether it improved:
   - if `val_loss < best_val_loss - min_delta`, store the new best, set `best_n_estimators = m + 1` and reset `patience_counter = 0`;
   - otherwise add 1 to `patience_counter`.
5. If `patience_counter >= patience`, `break`.

The given code then trims `self.trees = self.trees[:best_n_estimators]`.

**Results from the notebook's test cells** (`task1.py`, identical code to the official solution):

| Model (100 trees, depth 3, η 0.1) | Test MSE |
|---|---|
| Always predict the mean (baseline) | 17,109.5 |
| Ours, `criterion='l1'` | 15,986.0 |
| Ours, `'l1'`, `subsample=0.8` | 15,990.2 |
| **Ours, `criterion='l2'`** | **1,267.8** |
| `sklearn.ensemble.GradientBoostingRegressor` | 1,268.7 |
| Early stopping (`'l2'`, 500 max, patience=1) | 1,229.9 with 124 trees kept (stopped at tree 125) |

Our L2 booster reproduces scikit-learn's **training** predictions to 1e-13. Test predictions differ slightly only because trees break exact ties between equivalent split features using their `random_state`.

### 3.4 Why the L1 model looks terrible (teach this, it is not a bug)

The L1 trees are fitted to **signs**, values in [−1, 1], so each round moves a prediction by at most η·1 = 0.1. In 100 rounds that is at most **10 units**, but the targets have standard deviation **132.5**. The L1 model has barely left the median.

Real LAD boosting (scikit-learn `loss='absolute_error'`) adds a **line search**: each leaf's value is replaced by the *median of the raw residuals* in that leaf. Doing that in `task1.py` D4 drops the test MSE from 15,986 to **1,779**, close to scikit-learn's 1,952. The exam does not ask for this. It is good extension material.

### 3.5 Pitfalls (those with numbers are reproduced in `task1.py` Part D)

1. **Forgetting `learning_rate` in `predict`** while using it in `fit`. Test MSE explodes from 1,268 to **959,123**.
2. **With `subsample < 1`, updating only the sampled rows** (`cur[idx] += ...`). MSE goes from 859 to **7,102**. Step d says "update predictions for ALL samples".
3. **Fitting the tree to `y` instead of the residuals**, or recomputing residuals from `F₀` every round. That is just one tree repeated.
4. **`np.median(y, axis=0)`** on a 2-D test array returns an array, not the single `np.float64` the docstring asks for. The tests for 1.3 and 1.4 use `np.random.rand(3, 5)`.
5. **Sign mistakes:** `y_pred - y` is the *gradient*, not the *negative* gradient. The model would walk uphill.
6. **Not resetting `self.trees`.** Calling `fit` twice on the same object keeps the old trees. The official solution has this quirk, and our version resets the list.
7. **Early stopping:**
   - `best_n_estimators` must be `m + 1`, a count of trees, not `m`;
   - update `F_val` with the *same* tree;
   - if `best_n_estimators` is never updated, the trim leaves 0 trees. That still passes the `< 500` doctest but is wrong.
   - **`>=` vs `>`.** The comment says "exceeds", the text says "does not improve for `patience` iterations", and the official solution uses `>=`. They differ in practice. With patience = 1, `>=` stops at tree 125 (best 124), but `>` stops at tree 249 (best 247).
8. **Changing given signatures or defaults.** `criterion` defaults to `'l2'` in `GradientBoostingRegressor` but `'l1'` in `GBREarlyStop`. Leave both as given.

### 3.6 Notebook errata to warn students about

- Q1.5's markdown asks for `__init__`, but the answer slot is `predict` (`__init__` is already provided).
- The cell titled "Testing MSE Loss" actually trains `criterion="l1"`.
- The Q1.6 pseudocode omits subsampling, but the scaffold's Step b requires it.

### 3.7 Visual-explainer ideas

- A "golf" animation: the ball moves toward the hole by 10% of the remaining distance per shot.
- Residual bars shrinking tree by tree, using the 4-point example above.
- A 1-D scatter with the staircase prediction F_m(x) after 1, 5, 20 and 100 trees.
- Train vs validation loss curves with the early-stop point marked. In `task1.py`, validation MSE after 1, 10, 50 and 125 trees is 19,354, 9,664, 2,675 and 1,440.
- An L1-vs-L2 "step size" toggle that shows why sign residuals move so slowly.

---

## 4. Task 2: The Segmentation Fracture, Debugging U-Net (20 marks)

### 4.1 Sub-parts, marks and exactly what to write

| Q | Marks | What to do |
|---|---|---|
| 2.1 | 10 | Implement `BrokenUNet.center_crop(self, layer, target_shape)` and replace `x2_cropped = x2` in `forward` with `x2_cropped = self.center_crop(x2, d1.shape)` |
| 2.1b | (part of Part 1; manual) | 2–3 sentences on the trade-offs of centre cropping vs padding vs interpolation |
| 2.2 | 10 | `calculate_miou(pred_mask, true_mask, num_classes=2) -> float`. Vectorised: you may loop over classes but **not over pixels or batches**. Skip classes whose union is 0. Return the mean. |
| 2.3 / Part 3 | 0 | "Final integrity check": the forward pass must not crash |

The official solution's headers say "(15 pts)" for 2.1 and 2.2. The student notebook says 10 + 10 = 20, so use 20.

### 4.2 Concepts needed

- **Convolution output size:** out = (in + 2·padding − kernel)/stride + 1.
  - A 3×3 "valid" convolution (padding 0) loses 2 pixels per layer.
  - `MaxPool2d(2)` halves the size, rounding down.
  - `ConvTranspose2d(k=2, s=2)` doubles it.
- **U-Net:**
  - an encoder that goes down and a decoder that goes up;
  - **skip connections** that concatenate encoder features (`torch.cat(..., dim=1)`, the channel axis), which requires equal H and W;
  - channel bookkeeping: 128 + 128 = 256 must match `dec1_1`'s `in_channels`.
- **Tensor slicing** `t[:, :, a:b, c:d]` on (B, C, H, W) tensors.
- **IoU / Jaccard:** TP/(TP+FP+FN), with boolean masks, `&` and `|`, `.sum()` and `.item()`. **Mean IoU** averages over classes.
- **Why IoU beats accuracy on imbalanced maps.** Take a map that is 90% forest and a lazy model that always says "forest". Its accuracy is **0.90** but its **mIoU is 0.45**: urban IoU 0, forest IoU 0.90 (verified).

### 4.3 Shape trace you should be able to derive by hand (256×256 input, verified)

| Layer | Output (B, C, H, W) |
|---|---|
| enc1_1 → enc1_2 | 64×254×254 → 64×**252**×252 |
| pool1 | 64×126×126 |
| enc2_1 → enc2_2 = **x2 (skip)** | 128×124×124 → 128×**122**×122 |
| pool2 | 128×61×61 |
| bot1 → bot2 | 256×59×59 → 256×57×57 |
| upconv1 = **d1** | 128×**114**×114 |
| center_crop(x2) | 128×114×114 (offset (122−114)//2 = 4, rows 4:118) |
| cat | **256**×114×114 |
| dec1_1 → dec1_2 → final | 128×112 → 64×110 → **2×110×110** |

The notebook text says the output will be "e.g. 196×196". The real answer is **110×110**, and a 128×128 input gives 46×46. (The 2015 paper's 572×572 input would give 268×268 with this 2-level net.)

### 4.4 Step-by-step walkthrough

1. **Read the error.** `torch.cat` complains "Sizes of tensors must match" because `x2` is 122×122 but `d1` is 114×114.
2. **Decide who gets cropped.** The *bigger* encoder map (`x2`) is cropped to the *smaller* decoder map (`d1`). Never crop the decoder.
3. **Write `center_crop`:**
   ```python
   _, _, h, w = layer.shape
   th, tw = target_shape[2], target_shape[3]
   top, left = (h - th) // 2, (w - tw) // 2
   return layer[:, :, top:top + th, left:left + tw]   # slice by START + LENGTH
   ```
4. **Use it in `forward`:** `x2_cropped = self.center_crop(x2, d1.shape)`. The concatenation then has 128 + 128 = 256 channels, which matches `dec1_1`.
5. **Write `calculate_miou`.** Flatten both tensors (`.reshape(-1)` or `.view(-1)`). Then for each class c:
   1. `p = pred == c` and `t = true == c`;
   2. `inter = (p & t).sum().item()` and `union = (p | t).sum().item()`;
   3. skip the class if `union == 0`, otherwise append `inter / union`.

   Return the average, or `0.0` if the list is empty.
6. **Worked example (the notebook's).** pred = [[0,0],[1,1]] and true = [[0,1],[1,1]].
   - Class 0: intersection 1, union 2, IoU 0.5.
   - Class 1: intersection 2, union 3, IoU 0.667.
   - mIoU = **0.5833**.

### 4.5 Q2.1b model answer (2–3 sentences)

> Cropping throws away the outer ring of each skip feature map. Border detail and context never reach the decoder, and the output (110×110 for a 256×256 input) has no prediction near the edges, so large images must be processed as overlapping tiles, which adds compute. "Same" padding (padding=1 for a 3×3 conv) keeps every map the same size, so the skip and decoder maps align without cropping and the output matches the input. It costs a little more compute, and the zero-padded borders are less reliable. Resizing the decoder map with `F.interpolate` or `F.pad` also makes the shapes match, but it stretches or invents values instead of keeping only real ones.

**Correction for teachers.** The question's prompt asks "Why does the original U-Net paper use padding=1 instead?", and the official model answer repeats it. Both are **factually wrong**. The 2015 paper says: "repeated application of two 3x3 convolutions (unpadded convolutions)…", "The cropping is necessary due to the loss of border pixels in every convolution", and "Due to the unpadded convolutions, the output image is smaller than the input" (572×572 → 388×388, with an overlap-tile strategy). Padding=1 is the common *modern* variant. A strong student answer can say so.

### 4.6 The broken self-check: "missing class handling"

The notebook's extra check uses pred = [[0,0],[0,1]] and true = all 0, and expects **0.75**. Following the notebook's *own* rule (skip only when union = 0) gives a different result:

- class 0 has IoU 3/4 = 0.75;
- class 1 is predicted once, so its union is 1, not 0, and its IoU is 0/1 = 0;
- mIoU = (0.75 + 0)/2 = **0.375**.

The **official solution uses the union = 0 rule**, so it also prints "❌ Missing class handling failed". The value 0.75 only comes from a different convention: average only the classes present in the ground truth. `task2.py` implements that as `calculate_miou_gt_classes`, clearly labelled as *not* the exam answer.

The visible otter doctest (class absent from **both** → 1.0) passes under either rule.

> **Exam advice:** implement the written specification (skip when union == 0). If a self-check disagrees with a clearly stated rule, the self-check may be wrong. Spend 30 seconds computing the example by hand, then move on.

### 4.7 Pitfalls (those with numbers are reproduced in `task2.py` Part D)

1. **Hard-coding the crop** (e.g. `layer[:, :, 4:118, 4:118]`). It passes the 256×256 check but fails the visible 128×128 otter doctest (`q2.1a`). Always compute the crop from `layer.shape` and `target_shape`.
2. **The negative-index crop `layer[:, :, d:-d, d:-d]`.**
   - It breaks whenever the size difference is **odd**. With this network the difference is 9 whenever the skip map has odd size.
   - Of the input sizes 40–139, it crashes on **50**, e.g. 42, 43, 46 and 47.
   - It would also return an empty tensor if d = 0.
   - Use start + length instead.
3. **Cropping the wrong axes.** Dims 0 and 1 are batch and channel. Only crop dims 2 and 3. Pass `d1.shape`, not `d1` itself.
4. **Concatenating on `dim=0`** (the batch axis) instead of `dim=1` (channels).
5. **"Fixing" by editing the architecture.** For example, setting padding=1 everywhere also stops the crash, but it is not what Q2.1 asks for: "Implement `center_crop`".
6. **mIoU:**
   - dividing before checking `union == 0` gives `nan`;
   - looping over pixels with Python `for` loops breaks the vectorisation rule and is very slow;
   - forgetting `.item()` returns a tensor instead of a float (usually harmless, but the docstring says float);
   - computing accuracy instead of IoU;
   - using sklearn or torchmetrics is **banned**.
7. **When training valid-padding nets, crop the labels too.** The output is smaller than the label. In `task2.py` D6, an un-cropped 64×64 label against a 14×14 output raises "size mismatch". After centre-cropping the labels, 60 Adam steps reach validation mIoU **0.78** on synthetic blob images.
8. Smallest input this network accepts: **40×40**. Every size from 40 to 139 works with the correct crop.

### 4.8 Notebook errata

- "e.g. 196×196" should be **110×110**.
- The "padding=1 in the original U-Net" premise is wrong (see §4.5).
- The missing-class expected value (see §4.6).
- The comment "TODO: UNCOMMENT the line below" refers to a line that only exists in the solution notebook.
- Marks are 10 + 10 in the student notebook but "15 pts" in the solution headers.

### 4.9 Visual-explainer ideas

- An interactive "shape ladder" for the table in §4.3: drag the input size and watch every layer update. Highlight the odd-size case (input 42 → skip 15, up 6, difference 9).
- A centre-crop overlay: the 122×122 skip map with the 114×114 window and a 4-px border.
- IoU Venn and pixel-grid widgets: click pixels to toggle prediction and target, and show the TP/FP/FN counts plus the accuracy-vs-IoU trap (0.90 vs 0.45).
- Valid vs same padding: a 3×3 kernel sliding with and without a zero border.

---

## 5. Task 3: The Attention Mechanism (35 marks)

### 5.1 Sub-parts, marks and exactly what to write

| Q | Marks | Code / answer |
|---|---|---|
| 3.1 | 8 | `scaled_dot_product_attention(query, key, value, mask=None, dropout=None) -> (output, attention_weights)` |
| 3.2 | 2 (manual) | `answer_3_2` string: why divide by √d_k |
| 3.3 | 5 | `MultiHeadAttention.__init__`: `self.W_q`, `self.W_k`, `self.W_v`, `self.W_o` = `nn.Linear(d_model, d_model)`, plus `self.dropout = nn.Dropout(dropout)` |
| 3.4 | 5 | `MultiHeadAttention.forward(query, key, value, mask=None) -> (output (B,L,d_model), attn (B,h,L,L))` |
| 3.5 | 5 (cell header says "10 pts") | "Fix the bug" in `PositionalEncoding.__init__`'s `div_term` (see §5.5: in the released notebook the line is already correct) |
| 3.6 | 2 | `self.classifier = nn.Sequential(LayerNorm, Linear(d,d), ReLU, Dropout, Linear(d, num_classes))` |
| 3.7 | 3 | `TransformerClassifier.forward(input_ids, attention_mask=None)`: embed × √d_model → PE → mask to (B,1,1,L) → encoder layers → mean over dim 1 → classifier |
| 3.8 | **5 bonus** | `create_causal_mask(seq_len, device='cpu')` returns `torch.tril(torch.ones(L, L))` with shape (1, 1, L, L) |

`TransformerEncoderLayer` (post-norm: attention → residual → LayerNorm → FFN → residual → LayerNorm) is **given**.

### 5.2 Concepts needed

- **Attention as a soft lookup:** Attention(Q, K, V) = softmax(QKᵀ/√d_k)·V. Each row of weights sums to 1.
- **Matrix shapes and batched matmul.** `torch.matmul` on (B, h, L, d_k) × (B, h, d_k, L) gives (B, h, L, L). `transpose(-2, -1)`.
- **Masking:**
  - `masked_fill(mask == 0, -1e9)` *before* the softmax;
  - padding masks have shape (B, 1, 1, L) and causal masks (1, 1, L, L);
  - masks broadcast over heads and rows.
- **Multi-head attention:** project, then split d_model into h heads of d_k = d_model/h (`view` + `transpose(1, 2)`), attend, merge back (`transpose` + `contiguous` + `view`), and apply the output projection.
- **Sinusoidal positional encoding:**
  - PE(pos, 2i) = sin(pos/10000^(2i/d)) and PE(pos, 2i+1) = cos(pos/10000^(2i/d));
  - computed in log space with `exp`;
  - stored with `register_buffer` so it moves with `.to(device)` and is not trained.
- **The Transformer encoder for classification:** embeddings scaled by √d_model, residual connections + LayerNorm, mean pooling over the sequence, and an MLP head.
- **Causal (look-ahead) masks** for language modelling.
- **The softmax saturation argument** (Q3.2) and variance arithmetic: if qᵢ and kᵢ are independent with variance 1, then Var(q·k) = d_k.

### 5.3 Step-by-step walkthrough

**3.1 Attention in 5 lines:**
```python
scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)   # (B,h,L,L)
if mask is not None:
    scores = scores.masked_fill(mask == 0, -1e9)                        # hide = 0
attention_weights = F.softmax(scores, dim=-1)                           # rows sum to 1
if dropout is not None:
    attention_weights = dropout(attention_weights)
output = torch.matmul(attention_weights, value)                         # (B,h,L,d_v)
```

**Worked example (verified).** Two tokens with Q = K = [[1,0],[0,1]], V = [[1,2],[3,4]], and d_k = 2.

- Scores = I/√2, so each row is [0.707, 0].
- Softmax gives weights [0.670, 0.330].
- Token 0's output = 0.670·[1,2] + 0.330·[3,4] = **[1.66, 2.66]**.

The notebook's own numerical test uses Q = K = all ones. Every score is equal, so the weights are uniform (⅓ each) and every output row equals the column means of V, [4, 5, 6, 7].

**3.3/3.4 Multi-head ("a committee of h small attentions"):**
```python
Q = self.W_q(query).view(B, -1, self.num_heads, self.d_k).transpose(1, 2)   # (B,h,L,d_k)
# same for K and V
out, attn = scaled_dot_product_attention(Q, K, V, mask=mask, dropout=self.dropout)
out = out.transpose(1, 2).contiguous().view(B, -1, self.d_model)            # (B,L,d_model)
return self.W_o(out), attn
```
Verified: with the same weights copied in, this equals `nn.MultiheadAttention(batch_first=True)` exactly (max difference 0.0).

**3.5 Positional encoding.** For d_model = 4, the frequencies (`div_term`) are [1, 0.01].

| | PE values |
|---|---|
| Position 0 | [0, 1, 0, 1] |
| Position 1 | [sin 1, cos 1, sin 0.01, cos 0.01] = [0.841, 0.540, 0.010, 1.000] |
| Position 2 | [0.909, −0.416, 0.020, 1.000] |

Each position gets a unique "barcode". Our matrix matches the textbook formula to 7e-6.

**3.6/3.7 Classifier:**
```python
x = self.token_embedding(input_ids) * math.sqrt(self.d_model)
x = self.pos_encoding(x)
mask = attention_mask.unsqueeze(1).unsqueeze(2) if attention_mask is not None else None  # (B,1,1,L)
for layer in self.encoder_layers:
    x = layer(x, mask)
return self.classifier(x.mean(dim=1))       # official: plain mean over the sequence
```

**3.8 Causal mask:** `torch.tril(torch.ones(L, L, device=device)).unsqueeze(0).unsqueeze(0)`. Keep it **float**: the test compares it with `torch.allclose` against a float `tril`.

### 5.4 Q3.2 model answer (verified numerically)

> If the entries of q and k have mean 0 and variance 1, their dot product is a sum of d_k such terms. Its variance is d_k and its typical size grows like √d_k: about 22.6 when d_k = 512. Large scores push softmax into saturation, where nearly all the weight goes to one key. The softmax gradient (pᵢ(1−pᵢ) and −pᵢpⱼ) then becomes almost zero, so the Q and K projections barely learn and training is slow or unstable. Dividing by √d_k brings the variance of the scores back to about 1, keeping softmax in its useful, non-saturated range.

Numbers from `task3.py` D5 (10 keys, random N(0,1) vectors):

| d_k | std(q·k) | Unscaled: mean max weight / mean abs grad | Scaled: mean max weight / mean abs grad |
|---|---|---|---|
| 4 | 2.03 | 0.49 / 0.0129 | 0.31 / 0.0162 |
| 64 | 7.93 | 0.87 / 0.0040 | 0.32 / 0.0162 |
| 512 | 22.59 | **0.95 / 0.0013** | 0.32 / 0.0160 |

### 5.5 Q3.5's "bug" was already fixed in the released notebook

The official solution keeps the original buggy line as a comment:

```python
div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-10000.0 / d_model))   # intended bug
div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))  # correct
```

The released student notebook (`v20022026`, both the local copy and GitHub) **already contains the correct second line**, so there was nothing to fix. That is a trap in itself: a student who "fixes" a correct line breaks it.

The intended bug is a **missing log**, not an "indexing error" as the prompt claims. Its effect (D4): `div_term` = [1, 1.1e-17, 1.2e-34, 0, …]. **253 of 256 frequencies underflow to 0**, so those columns are sin 0 = 0 and cos 0 = 1 for every position, and word order is lost.

Common wrong "fixes":
- `arange(0, d_model)` instead of `arange(0, d_model, 2)` produces twice as many frequencies and **crashes** on the `pe[:, 0::2] =` assignment;
- writing `math.log(10000.0) / d_model` without the minus sign makes the "frequencies" grow exponentially;
- swapping `0::2`/`1::2` exchanges sin and cos.

**Exam advice:** check a suspicious line against the formula in the comment, using a tiny case (d_model = 4, pos = 1, as in §5.3). If it already matches, leave it. A sentence in a comment saying "verified: already correct" helps a manual grader.

### 5.6 Pitfalls (those with numbers are reproduced in `task3.py` Part D)

1. **Skipping `transpose(1, 2)`.** Doing `view(B, h, L, d_k)` directly on (B, L, d) gives the **right shape but wrong numbers**: tokens get mixed across heads. Shape-only tests cannot catch this, so hidden tests that compare values would.
2. **`.view` after `.transpose` without `.contiguous()`** raises a `RuntimeError` ("view size is not compatible…"). `.reshape` also works.
3. **Mask polarity.** The convention is 1 = keep and 0 = hide, so use `masked_fill(mask == 0, …)`. Writing `mask == 1` puts **100%** of the weight on the padding.
4. **`-inf` vs `-1e9`.** On a fully masked row, `-inf` gives `[nan, nan, nan, nan]`, while `-1e9` gives a harmless uniform [0.25 × 4]. With `-1e9`, the masked weights still come out *exactly* 0.0 in float32, which the test requires.
5. **Softmax over the wrong dimension.** `dim=-2` makes columns sum to 1, which fails the row-sum assertion.
6. **Forgetting the √d_k scale or the √d_model embedding scale.** Shapes are still fine, so only hidden value tests catch it. Remember: the scale is `math.sqrt(d_k)`, not `d_k`.
7. **Mask shape for the classifier.** (B, L) must become **(B, 1, 1, L)** so it broadcasts over heads and query rows. Remember the `attention_mask=None` path: the test also calls `model(input_ids)`.
8. **Plain mean pooling also averages the padding tokens.**
   - The official solution does this, so it is "correct" for the exam.
   - In D8, changing *only* the pad token ids changes the logits by 0.24.
   - Masked mean pooling, `(x*m).sum(1)/m.sum(1)` (an option in `task3.py`), changes them by exactly 0.
9. **Storing PE as a plain attribute** instead of `register_buffer`. The PE then stays on the CPU when the model moves to the GPU; the notebook's "GPU transfer" test targets this.
10. **Causal mask:**
    - a bool or `int` dtype can fail the float `allclose`;
    - `triu` instead of `tril` hides the past instead of the future;
    - the result must be 4-D (1, 1, L, L).
11. **Notebook state.** Later test cells reuse `batch`, `heads`, `seq_len`, `Q`, `K` and `V` from the Q3.1 test cell. Run the cells in order, or the classifier and causal tests raise `NameError`.

### 5.7 Why positional encoding matters (great demo for the website)

`task3.py` D9 trains a tiny classifier (d_model 32, 2 layers, 400 Adam steps) on "does token 1 come before token 2?", a task that depends only on word order.

| Model | Accuracy on 1,000 fresh sequences |
|---|---|
| With positional encoding | **1.000** |
| Without positional encoding | **0.489** (chance) |

Without PE, self-attention plus mean pooling is permutation-invariant, the "dog bit man = man bit dog" problem from the notebook's own intro.

### 5.8 Notebook errata

- Q3.5 header says "(10 pts)", but Part 3 is 5 marks.
- The "bug" line is already correct, and the prompt calls it an "indexing error".
- The Q3.6 comment offers a [CLS]-token option, while the markdown requires mean pooling. Use the mean.
- The solution's Part 5 title has the typo "Casual Masking".

### 5.9 Visual-explainer ideas

- An attention heat-map playground: type a sentence, see the L×L weights, and toggle the padding mask and causal mask.
- A "search engine" analogy animation: the query matches keys, and values are blended by the weights. Use the 2-token example above.
- A √d_k slider: as d_k grows, the softmax bars collapse to one-hot unless the scale is on (table in §5.4).
- A multi-head reshape diagram (B, L, 512) → (B, L, 8, 64) → (B, 8, L, 64), showing what goes wrong without the transpose.
- A positional-encoding "barcode" heat map (positions × dimensions), plus the buggy version, which is all flat stripes.
- The order task (§5.7): accuracy with vs without PE.

---

## 6. Skills matrix (what the 2026 programming section actually tested)

● = required to score, ○ = helpful, blank = not used.

| Skill / concept | T1 Boosting | T2 U-Net + IoU | T3 Attention | Where in the curriculum |
|---|---|---|---|---|
| Python functions, return types, reading docstrings | ● | ● | ● | Python basics |
| Classes, `self`, inheritance, abstract base classes | ● | ○ | ● | Python OOP |
| NumPy vector ops, `np.sign`/`mean`/`median`/`full`, fancy indexing | ● | ○ | ○ | NumPy |
| scikit-learn estimator API (`fit`/`predict`, `random_state`) | ● | | | Classical ML tooling |
| Loss functions (MSE, MAE), gradients, sub-gradients | ● | | ○ | Calculus for ML |
| Mean vs median as optimal constants | ● | | | Statistics |
| Decision trees (regression) | ● | | | Classical ML |
| Ensembles: boosting, shrinkage, subsampling | ● | | | Classical ML |
| Train/validation split, overfitting, early stopping | ● | | | ML workflow |
| PyTorch tensors: shape, `view`/`reshape`, `transpose`, `contiguous`, slicing | | ● | ● | PyTorch |
| `nn.Module`: `__init__` layers vs `forward` | | ● | ● | PyTorch |
| `nn.Linear`, `nn.Dropout`, `nn.LayerNorm`, `nn.Embedding`, `nn.Sequential` | | | ● | PyTorch layers |
| CNN arithmetic: kernel, padding, stride, pooling, transposed conv | | ● | | CV |
| Encoder–decoder with skip connections (U-Net) | | ● | | CV |
| Segmentation metrics: IoU, mIoU, why not accuracy | | ● | | CV evaluation |
| Boolean masks, `&`/`|`, `.sum()`, `.item()`, vectorisation | | ● | ● | PyTorch |
| Matrix multiplication and batched matmul | | | ● | Linear algebra |
| Softmax, numerical stability, masking with large negatives | | | ● | DL maths |
| Variance of a sum (why √d_k) | | | ● | Probability |
| Self-attention, multi-head attention | | | ● | NLP / Transformers |
| Sinusoidal positional encoding, `register_buffer`, devices | | | ● | NLP / Transformers |
| Pooling and classification heads, padding masks | | | ● | NLP |
| Causal masks / autoregressive LMs | | | ● (bonus) | GenAI |
| Debugging someone else's code from a crash message or spec | ○ | ● | ● | Problem solving |
| Explaining design trade-offs in 2–4 sentences | | ● | ● | Communication |

**Takeaways for a beginner curriculum aimed at NOAI 2027:**

1. **PyTorch shape fluency is the single biggest lever.** Most of Tasks 2 and 3 (55 of the 80 marks) is "make the shapes line up". Drill "what shape comes out of this layer?" until it is automatic.
2. **Classical ML is tested through implementation**, not definitions: write `fit` and `predict` loops around a scikit-learn primitive.
3. **Debugging tasks reward checking against the formula.** Two of the three tasks had a "bug". In one, the shipped code was actually correct, and in Task 2 one of the provided checks was itself wrong.
4. **Bonus marks reward "finish the idea" extensions:** early stopping and causal masks. They are short if the core is solid.
5. **Exam craft:**
   - never rename given identifiers;
   - re-run the notebook top-to-bottom before submitting;
   - visible tests check shapes, hidden tests likely check values;
   - when in doubt, follow the written specification.

---

## 7. Consolidated errata found in the released 2026 notebooks

| # | Task | Issue | What to do |
|---|---|---|---|
| 1 | T1 Q1.5 | Text says "implement `__init__`". The empty slot is `BaseGradientBoosting.predict`. | Implement `predict`. |
| 2 | T1 cell 24 | Titled "Testing MSE Loss" but trains `criterion='l1'` | Cosmetic. |
| 3 | T1 Q1.7 | Comment says "exceeds patience" (`>`). The prose and the official solution mean `>=`. | Use `>=`. |
| 4 | T2 | "e.g. 196×196" output | Actual output is 110×110 (256 input) or 46×46 (128 input). |
| 5 | T2 Q2.1b | Claims the original U-Net used padding=1 | The 2015 paper used unpadded convs + cropping (572 → 388). |
| 6 | T2 Q2.2 | "Missing class" self-check expects 0.75. The stated rule and the official solution give 0.375. | Follow the stated rule. |
| 7 | T2 | "UNCOMMENT the line below" refers to a line that is not there; solution headers say 15 pts per part | Cosmetic. |
| 8 | T3 Q3.5 | The "buggy" `div_term` is already correct in the student notebook. The intended bug was `-10000.0/d_model`. The header says 10 pts (Part = 5 marks). | Verify against the formula; leave the correct line. |
| 9 | T3 Q3.7 | The official solution mean-pools over padding tokens too | Acceptable for the exam; teach masked mean. |

---

## 8. Files

- `research/final2026_programming.md`: this document.
- `research/final2026_solutions/task1.py` and `task1_output.txt`: gradient boosting answer, notebook checks, otter doctests, and 7 verification/pitfall demos.
- `research/final2026_solutions/task2.py` and `task2_output.txt`: U-Net crop and mIoU answer, notebook checks, otter doctests, and 6 demos (shape trace, odd-crop sweep, confusion-matrix cross-check, accuracy-vs-IoU, mini training run).
- `research/final2026_solutions/task3.py` and `task3_output.txt`: attention, MHA, PE, classifier and causal-mask answer, notebook checks, and 9 demos. The demos include cross-checks against `F.scaled_dot_product_attention` and `nn.MultiheadAttention`, the PE-bug effect, the √d_k table, and with/without-PE training.
- Sources:
  - `sources/gh/NOAI-2026/` (official notebooks + solutions);
  - `sources/raw/question_*_v20022026.ipynb`;
  - `sources/unet_paper/unet.txt` (extracted text of arXiv:1505.04597, pp. 1–4).
- Scratch: `work/final2026/` (solution text dumps `sol{1,2,3}.txt`, `worked_examples.py`).
