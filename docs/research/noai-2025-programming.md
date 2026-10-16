# NOAI 2025, Section 2 (Programming): analysis, verified walkthroughs, and how the format changed

*Compiled Wed 14 Oct 2026 for the NOAI prep website. The audience is beginners: Sec 3 to JC/Poly students who may never have written NumPy code.*

**Sources (local copies, all read in full)**

| Source | Local path | Notes |
|---|---|---|
| 2025 question notebook | `sources/unz/NOAI2025_Questions/NOAI2025_Questions/NOAI2025-Section_2_Questions.ipynb` (text: `sources/text/noai2025_section2_questions.txt`) | Contains the **marks** (15/25/40, total 80), the rule "Python 3.9 Standard Library and NumPy Library", the "DO NOT MAKE CHANGES" cells, and a Q3 "Share your thought process" cell |
| 2025 official solutions | `.../NOAI2025-Section2Solutions.ipynb` (text: `sources/text/noai2025_section2_solutions.txt`) | Executed with kernel Python **3.9.18**. It contains no marks and no rubric. |
| 2025 MCQs | `.../NOAI 2025 MCQ Assessment Questions.pdf` (text: `sources/text/noai2025_mcq.txt`) | 20 MCQs with answers. Marks are not printed. |
| Public repo | https://github.com/AISGNUSNOAI/NOAI-2025 ("Singapore's NOAI 2025 3 AI Programming Tasks in Jupyter Notebook") | It holds the same two notebooks and no README or marking scheme (checked via WebFetch on 14 Oct 2026) |
| 2026 Final notebooks and MCQ PDF | `sources/text/noai2026_final_question_{1,2,3}_v20022026.txt`, `sources/text/noai2026_final_section1_mcq.txt` | Used for the format comparison in section 6 |
| Official facts | `research/official_facts.md` | Dates, durations and the 2026/2027 formats |

**Verification.** I ran every official solution under Python 3.13, NumPy 2.5.3 and scikit-learn 1.9.1.
- I copied the solution code cells into my own script, `work/noai2025/official_cells.py`. They reproduce the notebook's printed outputs **exactly**.
- One cosmetic difference: NumPy ≥ 2 prints `np.float64(2.0)` instead of `2.0` (see Q2).
- I also re-implemented each question three ways: the official code, a beginner loop version, and an improved version where useful. I then cross-checked them against scikit-learn and against synthetic data.
- Scripts and their outputs are in `research/noai2025_solutions/` (see section 8). All assertions pass.

---

## 1. The NOAI 2025 paper at a glance

| Item | NOAI 2025 | Confidence |
|---|---|---|
| Rounds | **One round only**, the "Challenge Day". There was no preliminary round in 2025. | H (official_facts §3a) |
| Date / venue / time | Sat **8 Mar 2025**, NTU College of Computing & Data Science, **2.5 h** in total | H |
| Section 1 | **20 MCQs**, 4 options, one correct answer. The answer key is in the released PDF. | H |
| Section 1 marks | Not printed. Most likely 1 each = **20**, which with Section 2 gives a **100**-mark paper (same split as 2026). | M (inference) |
| Section 2 | **3 programming questions, 80 marks**: Q1 15, Q2 25, Q3 40. Delivered as a Jupyter notebook. | H (question notebook, cells 0, 2, 6, 10) |
| Allowed tools | "**Python 3.9 Standard Library and NumPy Library**". Links to the Python 3.9 and NumPy docs are given. No scikit-learn, no PyTorch, no LLM. | H |
| Marking scheme | **Not published.** Answers must be rounded to 4 d.p. and the protected "DO NOT MAKE CHANGES" cells call fixed function names. Both suggest that the output was checked against an exact expected value. | L (inference) |

### Section 1 (MCQ) topic map: four domains × five questions, all short definitional recall

| Q | Domain | Topic tested | Answer |
|---|---|---|---|
| 1 | Classical ML | Unsupervised algorithm = PCA | B |
| 2 | Classical ML | Bagging reduces variance | A |
| 3 | Classical ML | RL = learning from rewards and penalties | B |
| 4 | Classical ML | Underfitting = high train error and high validation error | C |
| 5 | Classical ML | Boosting = weak learners combined sequentially | A |
| 6 | DL training | Adam adapts the learning rate from past gradients | A |
| 7 | DL training | Vanishing gradients affect deep nets | B |
| 8 | DL training | Early stopping (validation-based regularisation) | B |
| 9 | DL training | Residual connections help gradient flow | B |
| 10 | DL training | Learning-rate schedule | B |
| 11 | CV | Pooling reduces spatial size | B |
| 12 | CV | YOLO = one-stage detection | C |
| 13 | CV | Faster R-CNN's RPN proposes regions | C |
| 14 | CV | Depthwise-separable conv uses fewer parameters | B |
| 15 | CV | Instance segmentation = Mask R-CNN | B |
| 16 | NLP | Attention focuses on relevant parts of the input | B |
| 17 | NLP | BERT for transfer learning | B |
| 18 | NLP | Beam search (decoding) | B |
| 19 | NLP | [CLS] token = pooled representation | B |
| 20 | NLP | GPT causal masking | A |

The programming section carried **80% of the marks**, so it decided the ranking. Its three tasks run through **classical ML → unsupervised ML → NLP/GenAI**. Each task is a textbook algorithm, implemented from a formula or a recipe using only NumPy.

**Suggested time budget for a 2.5 h paper** (my suggestion, not official). It gives each programming question roughly the same marks per minute, about 0.7–0.75:
- MCQs about 20 min
- Q1 about 20 min
- Q2 about 35 min
- Q3 about 55 min
- Check and "Restart & Run All" about 20 min

---

## 2. Question 1: Linear regression using gradient descent (15 marks)

### 2.1 What is asked
- Write `linear_regression_gradient_descent(X, y, alpha, iterations)`. It returns the coefficient vector θ as a NumPy array, **rounded to 4 d.p.** ("-0.0 is a valid result").
- `X` already contains "a column of values for the intercept". You must **not** add another one.
- Fixed exam input (a protected cell):
  ```python
  X = np.array([[2, 2], [2, 4], [2, 6]]); y = np.array([2, 4, 6]); alpha = 0.01; iterations = 1000
  ```
- Update rule given: θ_j := θ_j − α · (1/m) · Σ_i (h_θ(x⁽ⁱ⁾) − y⁽ⁱ⁾) · x_j⁽ⁱ⁾, where h_θ(x) = θ·x.
- **Official answer: `array([0.003 , 0.9987])`** (verified).

### 2.2 Skills and concepts needed
- **Python:** define a function with type hints, write a `for` loop, use `range`, `return`.
- **NumPy:**
  - `np.zeros`, `X.shape`, the matrix product `@`, transpose `.T`, `reshape(-1, 1)`, `flatten()`, `np.round`
  - **broadcasting rules**, which is the main trap here
- **Maths:**
  - linear model ŷ = θ₀x₀ + θ₁x₁
  - mean squared error
  - partial derivatives, which give the gradient (1/m)·Xᵀ(Xθ − y)
  - reading Σ notation
- **ML ideas:**
  - learning rate (too small means slow, too big means divergence)
  - iterations versus convergence
  - **simultaneous** updates of all weights
  - why gradient descent is used instead of the normal equation

### 2.3 Beginner walkthrough

**Intuition.**
- The cost J(θ) is a **bowl** over the (θ₀, θ₁) plane.
- The gradient points uphill, so we take a small step downhill: new θ = old θ − α × slope.
- After enough steps we reach the bottom of the bowl.

**Step 1: what the data says.** Every row is (2, x) with y = x. The perfect model is therefore θ = (0, 1), giving ŷ = 0·2 + 1·x = x. Gradient descent should head towards (0, 1).

**Step 2: one iteration by hand** (θ starts at 0; verified with Python).

| | row 1 (2,2) | row 2 (2,4) | row 3 (2,6) |
|---|---|---|---|
| prediction h = θ·x | 0 | 0 | 0 |
| error h − y | −2 | −4 | −6 |

- gradient₀ = (1/3)[(−2)(2) + (−4)(2) + (−6)(2)] = −24/3 = **−8**
- gradient₁ = (1/3)[(−2)(2) + (−4)(4) + (−6)(6)] = −56/3 = **−18.6667**
- θ ← θ − 0.01 × gradient = **(0.08, 0.1867)**
- Iteration 2 gives (0.1419, 0.3321). Iteration 3 gives (0.1896, 0.4454).

**Step 3: the same thing with matrices** (this is the official code). Shapes:

| Expression | Shape | Meaning |
|---|---|---|
| `X` | (3, 2) | m = 3 examples, n = 2 features |
| `theta` | (2, 1) | one weight per feature (a column vector) |
| `X @ theta` | (3, 1) | all predictions at once |
| `y.reshape(-1, 1)` | (3, 1) | y as a column, so the subtraction lines up |
| `errors` | (3, 1) | h − y |
| `X.T @ errors / m` | (2, 1) | **the whole gradient**, i.e. Σ over examples for every j at once |

**Step 4: how the answer evolves** (cost J = (1/2m)·Σ error²).

| iterations | θ | J |
|---|---|---|
| 0 | (0, 0) | 9.3333 |
| 10 | (0.3212, 0.7773) | 0.0970 |
| 100 | (0.2276, 0.8999) | 0.0149 |
| 500 | (0.0331, 0.9854) | 0.0003 |
| **1000** | **(0.0030, 0.9987)** | 0.000003 |
| 2000 | (0.0000, 1.0000) | ≈ 0 |

**Why θ₀ first rises and then slowly falls back.** The bowl is a long, thin valley.
- The eigenvalues of XᵀX/m are 0.48 and 22.19, a ratio of about 46.
- Gradient descent races down the steep direction and then crawls along the flat one.
- After 1000 steps the slow component has shrunk only to about 0.8% of its starting size ((1 − 0.01·0.48)¹⁰⁰⁰ ≈ 0.008). That is why the answer is (0.003, 0.9987) and not exactly (0, 1).
- Lesson: an exam answer depends on the **exact** α, iteration count and starting point.

**Step 5: the learning rate limit.** Gradient descent on MSE is stable only while α < 2/λ_max = 2/22.19 ≈ **0.0901**.

| α | θ after 1000 its |
|---|---|
| 0.001 | (0.2279, 0.8998), too slow |
| 0.01 | (0.0030, 0.9987), the exam setting |
| 0.05 / 0.07 / 0.08 | (0, 1) |
| **0.1** | **(−2.7e85, −6.0e85), diverges** |

### 2.4 Official solution, annotated
```python
def linear_regression_gradient_descent(X, y, alpha, iterations):
    m, n = X.shape                       # m examples, n features
    theta = np.zeros((n, 1))             # start at zero (the question never says so, see pitfalls)
    for _ in range(iterations):
        predictions = X @ theta          # (m,1)
        errors = predictions - y.reshape(-1, 1)   # (m,1); reshape is ESSENTIAL
        updates = X.T @ errors / m       # (n,1): the gradient for every theta_j at once
        theta -= alpha * updates         # simultaneous update of all weights
    return np.round(theta.flatten(), 4)  # back to shape (n,) and 4 d.p.
```
A beginner loop version that follows the Σ formula symbol by symbol is `gd_loops` in `q1_gradient_descent.py`. It gives the identical answer.

### 2.5 Pitfalls (each reproduced in the script)

1. **Forgetting `y.reshape(-1, 1)`.**
   - `(3,1) − (3,)` broadcasts to a **(3,3)** matrix without any error.
   - `theta -= ...` then crashes with *"non-broadcastable output operand with shape (2,1) doesn't match the broadcast shape (2,3)"*.
   - Writing `theta = theta - ...` instead silently turns θ into a (2,3) matrix.
   - Fix: keep everything 2-D with `reshape`, or keep everything 1-D (`theta = np.zeros(n)`).
2. **Non-simultaneous update.** Updating θ₀ and then using the new θ₀ to compute θ₁'s gradient gives **(0.0027, 0.9988)**. That is wrong at 4 d.p.
3. **Starting point.** The question never says "start from zeros", but the expected answer assumes it.
   - Starting from ones gives (0.0068, 0.997).
   - Starting from random values gives something else again.
   - Always start from `np.zeros` unless told otherwise.
4. **Adding your own intercept column.** X already has one (a column of 2s). Prepending 1s gives 3 coefficients, (0.0005, 0.0011, 0.9994), which is wrong.
5. **Using SGD instead of batch GD** (updating after every example). After 1000 epochs this gives (0, 1), which is not the requested batch-GD answer.
6. **Rounding.** Round once, at the end. `np.round(-0.00001, 4)` gives `-0.0`, which the question explicitly accepts.
7. **Off-by-one in the iteration count** does not matter here: 999 or 1001 iterations still round to (0.003, 0.9987). Do not rely on this, though.

**Wording quirks to warn students about.**
- The question says h_θ(xⁱ) is "the hypothesis function **at iteration i**". In fact i indexes the **training example**, not the iteration.
- The "intercept" column holds **2s, not 1s**. The real intercept is therefore 2·θ₀.

### 2.6 Visual explainer ideas for the website
- **Bowl and valley contour plot** of J(θ₀, θ₁) for the exam data. Animate the θ path with an iteration slider (0 → 1000), with a readout of θ and J.
- **Learning-rate slider** (0.001 → 0.12), showing the path converging, zig-zagging, and then exploding past 0.0901.
- **Shape-tracker diagram**: boxes labelled (3,2) @ (2,1) → (3,1), and a red "broadcast to (3,3)!" box for the reshape bug.
- **Hand-calculation table** (Step 2) with each cell highlighting the term of the Σ that it comes from.

---

## 3. Question 2: K-means clustering (25 marks)

### 3.1 What is asked
- Write `euclidean_distance(a, b)` (a helper; any design is allowed) and `k_means_clustering(points, k, initial_centroids, max_iterations)`. The function returns a **list of final centroids**, each coordinate **rounded to 4 d.p.**
- The recipe is given step by step:
  1. Initialise with the given centroids.
  2. Assign each point to its nearest centroid.
  3. Update each centroid to the mean of its points, handling **empty clusters** (e.g. keep the old centroid).
  4. Repeat until the centroids stop changing "significantly", or until `max_iterations` is reached.
- Fixed exam input:
  ```python
  points = [(2, 4), (2, 8), (2, 10), (10, 2), (10, 4), (10, 0)]; k = 2
  initial_centroids = [(2, 2), (10, 1)]; max_iterations = 10
  ```
- **Official answer: `[(2.0, 7.3333), (10.0, 2.0)]`** (verified; scikit-learn `KMeans` with the same init gives the same).

### 3.2 Skills and concepts needed
- **Python:** lists, tuples, nested loops, list comprehensions, `zip`, `min`/`index`, `round`, and helper functions.
- **NumPy:**
  - `np.array` from a list of tuples
  - `np.argmin(axis=0)`
  - **boolean masks** such as `points[assignments == i]`
  - `.mean(axis=0)`, `np.sqrt`, `.sum(axis=1)`, `np.all`/`np.allclose`
- **Maths:** Euclidean distance √(Σ(aᵢ−bᵢ)²), the mean (centroid) of a set of points, and 2-D coordinates.
- **ML ideas:**
  - unsupervised learning and clustering
  - the two alternating steps (assign, then update)
  - convergence and stopping criteria
  - sensitivity to initialisation and local optima
  - empty clusters
  - tie-breaking

### 3.3 Beginner walkthrough

**Iteration 1, assignment step** (distances verified):

| point | distance to C1 = (2,2) | distance to C2 = (10,1) | nearest |
|---|---|---|---|
| (2, 4) | 2.000 | 8.544 | C1 |
| (2, 8) | 6.000 | 10.630 | C1 |
| (2, 10) | 8.000 | 12.042 | C1 |
| (10, 2) | 8.000 | 1.000 | C2 |
| (10, 4) | 8.246 | 3.000 | C2 |
| (10, 0) | 8.246 | 1.000 | C2 |

**Iteration 1, update step.**
- C1 = mean of (2,4), (2,8), (2,10) = (2, 22/3) = **(2, 7.3333)**
- C2 = mean of (10,2), (10,4), (10,0) = **(10, 2)**

**Iteration 2.** Every point keeps its cluster, so the centroids do not move and the algorithm has **converged** after 2 iterations. Return the rounded centroids.

### 3.4 Official solution, annotated
```python
def euclidean_distance(a, b):                 # a: ALL points (n,d), b: ONE centroid (d,)
    return np.sqrt(((a - b) ** 2).sum(axis=1)) # broadcasting -> n distances at once

def k_means_clustering(points, k, initial_centroids, max_iterations):
    points = np.array(points)                  # list of tuples -> (n,d) array
    centroids = np.array(initial_centroids)    # (k,d)
    for iteration in range(max_iterations):
        distances = np.array([euclidean_distance(points, c) for c in centroids])  # (k,n)
        assignments = np.argmin(distances, axis=0)  # nearest centroid index per point (ties -> lowest index)
        new_centroids = np.array([points[assignments == i].mean(axis=0)          # mean of cluster i
                                  if len(points[assignments == i]) > 0
                                  else centroids[i]                              # empty cluster: keep old
                                  for i in range(k)])
        if np.all(centroids == new_centroids):  # converged?
            break
        centroids = new_centroids
        centroids = np.round(centroids, 4)
    return [tuple(centroid) for centroid in centroids]
```
- A pure-Python version uses only the standard library (`math.sqrt`, or `math.dist` in 3.8+). It is `k_means_beginner` in `q2_kmeans.py` and can print a trace of each iteration.
- I tested both versions on 300 synthetic points in 3 Gaussian blobs, on 3-D points, on 1-D points and on an empty-cluster case. Both agree with scikit-learn to 4 d.p.

### 3.5 Pitfalls and quirks

1. **Tuples cannot be subtracted.** `(2,4) - (2,2)` is a `TypeError`. Convert to `np.array` first, or loop over the coordinates with `zip`.
2. **The official early stop never fires on the exam data.**
   - The old centroids are rounded (7.3333) but the new ones are not (7.333…), so `==` is always False.
   - The loop runs all 10 iterations. This is harmless here, but a cleaner version compares with `np.allclose` (or a shift tolerance) and rounds **only at the end**.
3. **NumPy ≥ 2 output looks different.** It prints `[(np.float64(2.0), np.float64(7.3333)), ...]`. The values are identical, but convert with `float(v)` for clean output. The exam ran NumPy 1.x under Python 3.9, which printed `[(2.0, 7.3333), (10.0, 2.0)]`.
4. **Empty clusters.** Starting from `[(2,2), (100,100)]` leaves cluster 2 empty. The expected behaviour is to keep (100, 100), and both implementations return `[(6.0, 4.6667), (100.0, 100.0)]`. Taking `.mean()` of an empty array would give `nan` and a warning instead.
5. **Hard-coding 2-D.** Do not assume points are (x, y). The tests above include 1-D and 3-D points.
6. **Initialisation matters.**
   - Swapping the start to `[(2,4), (2,8)]` returns the same clusters in **swapped order**: `[(10.0, 2.0), (2.0, 7.3333)]`.
   - Order matters if the grader compares lists. Always keep centroid *i* tied to `initial_centroids[i]`.
7. The `k` parameter duplicates `len(initial_centroids)`. Use the given centroids.

### 3.6 Visual explainer ideas
- **Step-through animation** on a 12×12 grid with the 6 exam points: centroids as stars, dashed lines to the nearest star, colour by cluster, then the stars sliding to the cluster means. Buttons: "Assign", "Update", "Run to convergence".
- **Distance table** (above) that fills in as the user clicks each point.
- **Bad-start demo**: drag the initial centroids to see a different result, an empty cluster, or a local optimum.
- **Voronoi boundary** (perpendicular bisector between the two centroids) to show *why* each point goes where it does.

---

## 4. Question 3: Retrieval-Augmented Generation (40 marks, half of Section 2)

### 4.1 What is asked
- The setting is a story about "Ms. Sally". Build a "smart assistant" that answers **"How does machine learning work?"** using only 5 one-sentence documents, in two steps: **Retrieve → Generate**.
- **Required pieces** (question notebook):
  1. **Feature extraction**: vectorise the documents and query. TF-IDF is suggested as "a common approach".
  2. **Similarity scoring**, e.g. cosine similarity.
- **Interface contract.** The protected print cell uses the variables **`top_documents`** (a list of strings) and **`response`** (a string). Your code must create exactly these names.
- **Expected output:**
  - Retrieved documents: doc 2 "Machine learning is a subset of artificial intelligence." and doc 4 "Data science involves statistics and machine learning."
  - Generated response: *"Machine learning is a subset of artificial intelligence that enables systems to learn from data. It involves techniques like statistics and algorithms, often used in data science."*
- Cell 14 of the question notebook asks: **"Share your thought process on how you derive at your solution"**. So part of the 40 marks presumably rewarded the explanation [L: no rubric published].
- The task is **open-ended**: there is no function signature and many valid designs.

### 4.2 Skills and concepts needed
- **Python:**
  - string methods (`lower`, `split`) and building a vocabulary
  - dicts (word → index) and sets
  - `collections.Counter`, `re` (optional)
  - list comprehensions
- **NumPy:**
  - building vectors with `np.zeros` and indexing
  - `np.dot`, `np.linalg.norm(axis=1, keepdims=True)`
  - `argsort` (and the idiom `argsort()[-k:][::-1]` for top-k in descending order)
  - avoiding division by zero with `+ 1e-10`
- **Maths:** vectors, dot product, vector length, **cosine similarity** = a·b / (‖a‖‖b‖), and logarithms (for IDF).
- **NLP / GenAI ideas:**
  - tokenisation and punctuation
  - stop-words
  - bag-of-words and **TF** (term frequency)
  - **IDF** (rare words matter more)
  - the vector space model
  - top-k retrieval
  - what "augmented generation" means
  - why an LLM is normally the generator, and what to do when you cannot use one (template or extractive answer)
  - hallucination (adding facts not in the sources)

### 4.3 Beginner walkthrough of the official solution

1. **Vocabulary.**
   - Join all documents and the query, lower-case, then `split()` on spaces. That gives 35 distinct "words".
   - Punctuation stays attached: `"learning."`, `"work?"` and `"intelligence."` are separate tokens.
2. **TF vector** for each text: count each vocabulary word and divide by the number of words. The query becomes `[how, does, machine, learning, work?]`, each with weight 1/5.
3. **Cosine similarity** between each document vector and the query vector. (Dividing by length does not change cosine, so plain counts give the same scores.)

   | doc | words shared with the query | cosine |
   |---|---|---|
   | 1 AI is transforming industries. | none | 0 |
   | **2 ML is a subset of AI.** | machine, learning | 2/(√8·√5) = **0.3162** |
   | 3 Deep learning allows machines… | learning (`machines` ≠ `machine`) | 1/(√8·√5) = 0.1581 |
   | **4 Data science involves statistics and machine learning.** | machine only (its token is `learning.` with a full stop) | 1/(√7·√5) = **0.1690** |
   | 5 Neural networks… | none | 0 |

4. **Retrieve the top 2.** `similarities.flatten().argsort()[-2:][::-1]` gives docs 2 and 4.
5. **"Generate".** `infer_response` collects the words of the retrieved docs. If both `"machine"` and `"science"` appear, it returns the **hard-coded expected sentence**; otherwise it returns `"I don't know."`.
   - No language model is allowed (NumPy only), so the generator is a keyword rule or template.

### 4.4 Critical review (important for teaching; all verified in `q3_rag.py`)

1. **TF only, not TF-IDF.** The official solution never computes IDF, although the question names TF-IDF ("such as", so TF alone is acceptable).
2. **Doc 4 beats doc 3 by luck.** Each shares exactly one word with the query, and doc 4 wins only because it is **one word shorter** (0.1690 vs 0.1581). Punctuation stops doc 4 matching "learning".
3. **No stop-word removal.**
   - Query "What is deep learning?": the official pipeline retrieves doc 1 and doc 2 (the matching word is "is"), then answers "I don't know.".
   - The improved TF-IDF pipeline retrieves doc 3 (0.474) and doc 2 (0.202).
4. **The template fires on unrelated queries.** "Tell me about the human brain" retrieves doc 5 and doc 4. Doc 4 contains "machine" and "science", so the system answers with the *machine-learning* sentence.
5. **Top-k with no threshold.** The pipeline always returns 2 documents, even when the second scores 0. Example: "How do neural networks work?" returns doc 5 and a zero-score doc 4.
6. **The expected answer goes beyond the sources.** "enables systems to learn from data" and "algorithms" do not appear in any document. In real RAG a language model adds this paraphrase, and it is also how hallucination creeps in. This is a good discussion point for the "thought process" cell.
7. Cosine is described as ranging "from 0 to 1". That holds only for non-negative vectors such as TF/TF-IDF. In general cosine ranges from −1 to 1.

### 4.5 Improved, exam-legal version (NumPy + standard library; `q3_rag.py`)
- **Tokenise:** `re.findall(r"[a-z]+", text.lower())`, then drop a small stop-word list. The query becomes `[machine, learning, work]`.
- **TF-IDF:** raw count × smoothed IDF, where IDF = ln((1+N)/(1+df)) + 1. This is scikit-learn's default formula. Then L2-normalise so that a dot product equals cosine.
- **Cosine scores:** doc 1 = 0, **doc 2 = 0.5685**, doc 3 = 0.1684, **doc 4 = 0.4643**, doc 5 = 0. The top 2 are docs 2 and 4, now with a **clear margin**.
  - These scores match `sklearn.feature_extraction.text.TfidfVectorizer` with the same tokenizer to 1e-9.
- **Generate** (extractive template that never invents facts): "According to the documents: Machine learning is a subset of artificial intelligence. Data science involves statistics and machine learning."
  - To match the exam's expected text exactly, a student can still map the retrieved evidence to the given sentence, as the official solution does. Explain the trade-off in the thought-process cell.
- Other queries:

  | Query | Retrieved | Answer |
  |---|---|---|
  | "What is deep learning?" | doc 3, doc 2 | built from those two docs |
  | "Tell me about the human brain" | doc 5 only | built from doc 5 |
  | "What is quantum computing?" | nothing above 0 | "I don't know based on the given documents." |

### 4.6 Visual explainer ideas
- **Pipeline diagram:** Documents → Tokenise → Vectorise (TF / TF-IDF) → Cosine vs query → Top-k → Generator (template / LLM) → Answer. Each box can be clicked to show its intermediate output.
- **Word-overlap heat table:** documents × query words, with cells lit where they match. Toggle "keep punctuation / strip punctuation" and "stop-words on/off", and watch the ranking change, including the doc 3 vs doc 4 flip.
- **Angle picture:** two arrows in 2-D (query and document) with the angle θ, showing that a longer document vector does not change the angle.
- **IDF bar chart:** a rare word (data, 2.10) vs a common word (learning, 1.41).
- **"Hallucination spotter":** highlight the words of the expected answer that do not come from any retrieved document.

---

## 5. Skills checklist distilled from Section 2 (for curriculum mapping)

| Skill | Q1 | Q2 | Q3 | Suggested curriculum step |
|---|---|---|---|---|
| Python functions, loops, list comprehensions, tuples, dicts, sets, string methods | ✓ | ✓ | ✓ | Python foundations |
| NumPy arrays, shapes, `@`, `.T`, `reshape`, broadcasting | ✓ | ✓ | ✓ | NumPy essentials |
| Axis-wise operations (`sum/mean/argmin(axis=…)`), boolean masks, `argsort` top-k | | ✓ | ✓ | NumPy essentials |
| Vectors, dot product, norms, distance, cosine | | ✓ | ✓ | Maths: linear algebra |
| Derivative of MSE, gradient, Σ notation | ✓ | | | Maths: calculus and optimisation |
| Gradient descent, learning rate, convergence | ✓ | (✓ iterate-until-converge) | | ML: linear regression |
| Unsupervised clustering, init sensitivity, empty clusters | | ✓ | | ML: K-means |
| Tokenisation, bag-of-words, TF-IDF, retrieval, RAG concept | | | ✓ | NLP and GenAI: text as vectors, RAG |
| Exam craft: keep given names and signatures, do not edit protected cells, round only at the end, Restart & Run All, explain reasoning in markdown | ✓ | ✓ | ✓ | "How to sit the Final" page |

---

## 6. How the 2025 format differs from 2026 (and what is known for 2027)

| | **NOAI 2025** | **NOAI 2026** | **NOAI 2027** (announced; official_facts §3c) |
|---|---|---|---|
| Structure | **One round**: Challenge Day, Sat 8 Mar 2025, NTU, **2.5 h** | **Two rounds**: Prelim, then the top 150 sit the Final | Two rounds: Prelim, then the top 150 sit the Final |
| Preliminary round | none | Fri 20 Feb 2026. **300 MCQs in 3 h**, Google Form in school labs, 5 domains (Maths, Computing, AI/ML/DL, GenAI, Problem-Solving), no calculator, no negative marking | Fri 19 Feb 2027. **150 MCQs in 1.5 h**, same pace and domains |
| Final: date / length / marks | (the single round) 2.5 h, 100 marks if MCQs are 1 mark each | Fri 6 Mar 2026, NTU, **3 h, 100 marks** | Fri 5 Mar 2027. Duration and marks not yet stated (assume as 2026) |
| Final Section 1 | **20 MCQs, short definitional recall**, 4 domains × 5 (classical ML, DL training, CV, NLP) | **20 MCQs = 20 marks**, mostly **scenario / code-reading / debugging** stems with code snippets, e.g. "You're debugging a custom AdaBoost…", "You implement custom batch normalisation…". 5 domains incl. AI Problem-Solving. About 1.5 min each. | 20 MCQs |
| Final Section 2 | **3 questions, 80 marks (15 / 25 / 40)**. Each is one function or one open pipeline with a single toy example, **no test cells**, answers rounded to 4 d.p. | **3 tasks, 80 marks (25 / 20 / 35, incl. 10 bonus)**. Each is **multi-part and scaffolded**: numbered sub-questions worth 2–10 points, skeleton classes with `TODO`s, **self-check test cells**, a conceptual "no coding" part, and **debugging** parts | 3 AI programming questions in Python |
| Libraries | **Python 3.9 stdlib + NumPy only** | Task 1: NumPy + scikit-learn (`DecisionTreeRegressor`). Tasks 2–3: **PyTorch** (`torch`, `nn`, `F`) + NumPy. Task 2 **bans** scikit-learn and torchmetrics. | Not stated |
| Topics | Q1 batch gradient descent for linear regression. Q2 K-means. Q3 TF/TF-IDF + cosine retrieval and a template "RAG" | Task 1 **gradient boosting from scratch**: L1/L2 negative gradients, initial prediction, class `__init__`/`predict`/`fit`, bonus early stopping. Task 2 **U-Net "valid padding" bug fix** (centre-crop the skip connections) + **mean IoU** from scratch. Task 3 **scaled dot-product attention** (with mask), **multi-head attention**, **positional-encoding bug fix**, mean-pooled **classification head**, bonus | Not released (the 2026 style is the best guide) |
| Level | Introductory algorithms from a given formula or recipe; roughly 10–40 lines of code each | Larger code bases (skeleton cells of up to ~100 lines), OOP, tensor shapes `[B, H, S, d]`, reading and fixing someone else's code | |
| Scenario framing | Short (Q3 has a classroom story) | Each task has a "scenario" plus an analogy (golf for boosting, search engine for attention) and supplementary-reading links | |
| Results | Gold 3 / Silver 6 / Bronze 9 / **Merit 17** / Participation 81 (116) | Gold 12 / Silver 24 / Bronze 37 / Participation 73 (146), no Merit tier | Tier only, no scores |

**What this means for preparation.**
1. **2025 Section 2 is the right first rung for beginners.** It uses only NumPy, three classic algorithms, and one exact answer each. Every learner should be able to do all three from scratch before moving on.
2. **2026 raised the bar in three ways:**
   - **Frameworks:** scikit-learn estimators and PyTorch `nn.Module`/tensors.
   - **Debugging:** a broken U-Net and a broken positional encoding.
   - **Deep-learning architecture:** U-Net, attention, Transformers.

   A curriculum aimed at the 2027 Final must go beyond 2025 into PyTorch shapes, CNN/U-Net, IoU, attention and boosting.
3. **The 2026 MCQs test code reading**, not definitions. Practise "spot the bug" and "what does this snippet output" questions, not only glossary recall.
4. **The new Prelim (2026: 300 MCQs; 2027: 150 MCQs in 90 min, about 36 s each)** has no 2025 equivalent. It needs fast recall across maths, Python/NumPy/PyTorch, ML/DL/CV/NLP/GenAI and problem-solving, with no calculator.
   - The 2025 questions remain useful practice for the Prelim. Example: being able to compute one GD step, one K-means assignment or one cosine similarity by hand in under a minute.
5. **Exam craft carried over from 2025 to 2026.**
   - Keep the given function and variable names, and never edit protected or test cells.
   - Follow the given recipe exactly (zero init, batch updates, given iteration counts), because outputs are compared to fixed values or tests.
   - Explain your reasoning where asked. (2025 Q3 had a thought-process cell; 2026 Task 2 has a conceptual question.)

---

## 7. Verified practice variants (for the website's practice bank)

All of these were computed with the official functions; see `practice_variants.py` and `practice_variants_output.txt`.

**Q1-style (batch GD, θ starts at 0, rounded to 4 d.p.)**

| X | y | α | iterations | answer |
|---|---|---|---|---|
| exam data | [2,4,6] | 0.01 | **1** | [0.08, 0.1867] |
| [[1,1],[1,2],[1,3]] | [2,3,4] | 0.1 | 10 | [0.584, 1.1826] |
| [[1,1],[1,2],[1,3]] | [2,3,4] | 0.1 | 1000 | [1.0, 1.0] |
| [[1,0],[1,1],[1,2],[1,3]] | [1,3,5,7] | 0.05 | 2000 | [1.0, 2.0] |
| [[1,1],[1,2],[1,3]] | [2,3,4] | **0.5** | 50 | diverges (about −1.5e12, −3.3e12) |

**Q2-style (K-means, returned in the order of `initial_centroids`)**

| points | init | max_it | answer |
|---|---|---|---|
| exam points | [(2,10),(10,0)] | 10 | [(2.0, 7.3333), (10.0, 2.0)] |
| exam points | [(2,4),(2,8)] | 1 | [(8.0, 2.5), (2.0, 9.0)] (one iteration only) |
| exam points | [(2,4),(2,8)] | 10 | [(10.0, 2.0), (2.0, 7.3333)] (converges in 3 iterations; order swapped) |
| (1,1),(1.5,2),(3,4),(5,7),(3.5,5),(4.5,5),(3.5,4.5) | [(1,1),(5,7)] | 10 | [(1.25, 1.5), (3.9, 5.1)] (point (3,4) switches cluster in iteration 2) |
| 1-D: 1,2,3,10,11,12 | [(1,),(2,)] | 10 | [(2.0,), (11.0,)] |
| exam points | [(2,2),(100,100)] | 10 | [(6.0, 4.6667), (100.0, 100.0)] (empty cluster kept) |

**Q3-style (same 5 documents; official TF pipeline vs improved TF-IDF)**

| query | official TF cosine (doc 1..5) → top 2 | TF-IDF cosine → top 2 (score > 0) |
|---|---|---|
| How does machine learning work? | [0, .3162, .1581, .1690, 0] → 2, 4 | [0, .5685, .1684, .4643, 0] → 2, 4 |
| What is artificial intelligence? | [.4472, .3536, 0, 0, 0] → 1, 2 | [.6279, .6187, 0, 0, 0] → 1, 2 |
| How do neural networks work? | [0, 0, 0, 0, .3162] → 5, 4 (zero score) | [0, 0, 0, 0, .6325] → 5 |
| What does data science involve? | [0, 0, 0, .3381, 0] → 4, 5 (zero score) | [0, 0, 0, .6263, 0] → 4 |

---

## 8. Files produced

All paths are under ``.

| File | What it does |
|---|---|
| `research/noai2025_solutions/q1_gradient_descent.py` (+ `q1_output.txt`) | Official solution verbatim, loop version, trajectory, learning-rate stability, 2 bug demos, lstsq and scikit-learn checks, 200-point synthetic test |
| `research/noai2025_solutions/q2_kmeans.py` (+ `q2_output.txt`) | Official solution verbatim, pure-Python traced version, distance table, early-stop quirk, scikit-learn check, empty-cluster, 300-point 3-blob and 3-D tests |
| `research/noai2025_solutions/q3_rag.py` (+ `q3_output.txt`) | Official pipeline (as a function) with per-document diagnostics, failure cases, improved TF-IDF pipeline cross-checked against scikit-learn |
| `research/noai2025_solutions/practice_variants.py` (+ `practice_variants_output.txt`) | Verified answers for the variants in section 7 |
| `work/noai2025/official_cells.py` | The official notebook's code cells copied into a script; it reproduces the notebook outputs |

To run: `python3 -I <script>` from inside `research/noai2025_solutions/`. Only `practice_variants.py` imports the other three scripts.
