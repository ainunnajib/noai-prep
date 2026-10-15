# NOAI Prep: final curriculum

**39 modules · 181 lessons · 498 concepts (each with its own visual) · about 85 hours of lessons** (re-estimated from the finished lessons: the design aimed for about 57)

Synthesised from three designs: **A** (beginner pedagogy), **B** (exam coverage) and **C2** (IOAI syllabus, visual-first). The sequencing comes from A, most concept content and visual specs from C2, and the exam part (drills, past-paper walkthroughs, separate NumPy and PyTorch Final labs) from B. A completeness critic pass then audited it against every past-paper question, the IOAI 2026 syllabus and the six Final tasks and made 43 changes (listed near the end). Details are in the rationale and scorecard at the end.

Legend: lesson lines show *minutes · code mode · number of concepts*. Code modes: `runnable` (Pyodide), `torch-shown` (PyTorch code with recorded output), `snippet`, `none`.


## Part 0: Start here

What NOAI and IOAI are, how the exams work, how to study, and a hands-on, no-code first look at how machines learn. *(2 modules, 7 lessons, about 1.6 h)*


### M1. Start here: NOAI, IOAI and how to prepare (`start-here`)

*Your map from zero to finalist* · domain `orientation` · prerequisites: none

What the National Olympiad in AI is, who can enter and how, how the Prelim and Final work and are scored, where it leads (NTU selection and IOAI 2027 in Singapore), and how to study this course efficiently.

1. **What NOAI is and where it leads** (`what-is-noai`) 14 min · none · 3 concepts. The four stages from your school's computer lab to IOAI 2027 in Singapore, who can enter, and how to register.
2. **The exam format and how it is scored** (`exam-format-and-strategy`) 15 min · none · 3 concepts. Exactly what the Prelim and Final look like, and the scoring facts that should shape your strategy.
3. **How to study so it sticks** (`how-to-study`) 13 min · none · 3 concepts. Retrieval practice, spacing and a personal plan to cover the course before 19 Feb 2027.


### M2. How machines learn: a first look (`ai-first-look`)

*Train a model before writing code* · domain `ai_ml_dl` · prerequisites: start-here

A hands-on, no-code first look at machine learning: how AI, ML and deep learning relate, fitting a line by hand and measuring its loss, watching gradient descent roll downhill, and classifying with boundaries and nearest neighbours.

Paper subtopics: ml-fundamentals, regression, classification, optimisation

1. **AI, machine learning and deep learning** (`what-is-ai`) 12 min · none · 3 concepts. How AI, ML and DL relate, and the three main ways a machine can learn.
2. **Your first model: fitting a line by hand** (`fit-a-line-by-hand`) 15 min · none · 3 concepts. Predict HDB resale prices with a straight line, and measure how wrong it is.
3. **Letting the computer find the line** (`let-the-computer-learn`) 15 min · none · 3 concepts. Gradient descent, the algorithm behind almost all of ML, introduced as rolling downhill.
4. **Classifying: boundaries and neighbours** (`classify-with-boundaries`) 15 min · none · 3 concepts. Separate two classes with a line, predict like your neighbours, and see why memorising fails.


## Part 1: Code from zero

Python from your very first line to classes and debugging, plus the algorithmic thinking behind efficient code. *(3 modules, 15 lessons, about 4.5 h)*


### M3. Python from zero (`python-basics`)

*Your first programs, step by step* · domain `computing` · prerequisites: start-here

Your very first lines of Python: running and reading programs, variables, types and operators, strings, decisions with if, for and while loops (including a tiny loop that learns), and lists, all traced visually line by line.

Paper subtopics: python, code-debugging

1. **Your first program (and your first error)** (`first-program`) 12 min · runnable · 2 concepts. Run print statements, follow the order in which code executes, and decode a traceback.
2. **Variables, types and arithmetic** (`variables-types-arithmetic`) 18 min · runnable · 3 concepts. Store values in variables, meet int, float, str and bool, and calculate with Python's operators.
3. **Working with text: strings** (`strings`) 15 min · runnable · 2 concepts. Index, slice and transform text, and format output with f-strings.
4. **Making decisions with if** (`decisions`) 15 min · runnable · 2 concepts. Use comparisons, Boolean logic and if/elif/else to make programs choose.
5. **Repeating with loops** (`loops`) 18 min · runnable · 3 concepts. Use for and while loops, and write a loop that learns a number by nudging.
6. **Lists: ordered collections** (`lists`) 15 min · runnable · 2 concepts. Create, index, slice and change lists, and use nested lists as grids.


### M4. Python power tools (`python-toolkit`)

*Read, reason about and fix code* · domain `computing` · prerequisites: python-basics

The rest of the Python an AI programmer needs: dictionaries, tuples and sets, functions and scope, comprehensions, zip and generators, how names refer to objects (and the mutation traps examiners love), classes and the fit/predict pattern, and exceptions and systematic debugging.

Paper subtopics: python, code-debugging

1. **Dictionaries, tuples and sets** (`dicts-tuples-sets`) 18 min · runnable · 3 concepts. Look things up by key, use fixed tuples and unique sets, and know which types are mutable.
2. **Functions: reusable recipes** (`functions`) 18 min · runnable · 3 concepts. Define functions with parameters, defaults and return values, and understand scope and *args/**kwargs.
3. **Comprehensions, zip, enumerate and generators** (`iteration-tools`) 18 min · runnable · 3 concepts. Write compact loops and produce values lazily.
4. **Names, references and surprises** (`references-mutability`) 18 min · runnable · 4 concepts. Why changing one list can change 'another', is vs ==, and mutable default arguments.
5. **Classes and objects** (`classes-objects`) 24 min · runnable · 4 concepts. Build your own types with attributes and methods, the pattern behind scikit-learn models and PyTorch modules.
6. **Exceptions and debugging** (`exceptions-debugging`) 18 min · runnable · 3 concepts. Know the common exceptions, handle errors with try/except, and debug systematically.


### M5. Algorithms and complexity (`algorithms-and-complexity`)

*Thinking about cost before coding* · domain `problem_solving` · prerequisites: python-toolkit

Big-O notation and counting steps in code, binary search, sorting, hashing and heaps, then recursion, memoisation, dynamic programming and graph search, the algorithm-design toolkit behind the Problem Solving domain.

Paper subtopics: algorithms-complexity, python

1. **Big-O: how cost grows** (`big-o`) 18 min · runnable · 2 concepts. Counting steps as input grows, the common complexity classes, and reading complexity off code.
2. **Searching, sorting, hashing and heaps** (`searching-sorting-hashing`) 22 min · runnable · 4 concepts. Binary search halves the problem, sorting algorithms trade simplicity for speed, hash tables give constant-time lookup and heaps give the top k cheaply.
3. **Recursion, dynamic programming and graph search** (`recursion-dp-graphs`) 22 min · runnable · 3 concepts. Solving problems by breaking them into subproblems, remembering answers to avoid repeated work, and exploring graphs breadth-first or depth-first.


## Part 2: The maths and data toolkit

A maths warm-up (functions, powers, logs and Σ notation), then vectors and matrices, NumPy, probability and statistics, and pandas: the maths and tools every model is built on. *(5 modules, 23 lessons, about 6.6 h)*


### M6. Maths warm-up: functions, powers, logs and Σ (`maths-foundations`)

*The notation every formula uses* · domain `mathematics` · prerequisites: python-basics

The bridge from school algebra to ML maths: function notation and graphs, piecewise functions such as |x| and ReLU, exponent rules, scientific notation and e, logarithms and their rules, and reading Σ notation, subscripts and hats. Every later formula (losses, sigmoid, softmax, cross-entropy, log n, the Final's update rules) is written in this language.

Paper subtopics: calculus, probability-statistics

1. **Functions and their graphs** (`functions-and-graphs`) 16 min · runnable · 3 concepts. Function notation, plugging in values, composing functions, and the lines, parabolas and kinked graphs that appear in every ML formula.
2. **Powers, scientific notation and e** (`powers-and-exponentials`) 16 min · runnable · 3 concepts. Exponent rules, numbers such as 3e-4 and 1e-8, repeated multiplication that explodes or vanishes, and the number e behind sigmoid and softmax.
3. **Logarithms** (`logarithms`) 18 min · runnable · 3 concepts. Logs as "which power?", the rules that turn products into sums, ln versus log₂, and the anchor values used in no-calculator questions.
4. **Reading formulas: Σ, subscripts and hats** (`sigma-notation-and-subscripts`) 16 min · runnable · 3 concepts. Σ and Π as loops, the subscripts and superscripts that index examples and features, and translating a formula such as the 2025 Final's update rule into NumPy.


### M7. Vectors and matrices (`vectors-and-matrices`)

*The language every model speaks* · domain `mathematics` · prerequisites: python-toolkit, maths-foundations

Vectors as arrows and lists of numbers, the dot product, norms and cosine similarity, matrix shapes and multiplication, and the special matrices (identity, inverse, determinant) that NOAI asks about.

Paper subtopics: linear-algebra

1. **Vectors: arrows and lists of numbers** (`vectors`) 14 min · snippet · 2 concepts. A vector is both an arrow in space and a list of numbers; adding and scaling work the same way in both pictures.
2. **Dot product, norms and cosine similarity** (`dot-product-and-norms`) 18 min · runnable · 3 concepts. How to measure length, distance and 'how much two vectors point the same way'.
3. **Matrices, shapes and matrix multiplication** (`matrices-and-multiplication`) 20 min · runnable · 3 concepts. Matrices as tables of numbers, the shape rule for multiplication and how each entry is a row-times-column dot product.
4. **Identity, inverse, determinant and trace** (`identity-inverse-determinant`) 18 min · snippet · 3 concepts. The special matrices and single numbers that describe what a matrix does, including when it cannot be undone.


### M8. NumPy: thinking in arrays (`numpy`)

*Whole arrays at full speed* · domain `computing` · prerequisites: vectors-and-matrices

Why arrays beat lists, creating and reshaping arrays, indexing and boolean masks, element-wise versus matrix products and axis reductions, broadcasting and its silent bugs, and the handful of NumPy moves that every from-scratch Final task uses.

Paper subtopics: numpy, python, linear-algebra

1. **Why NumPy? Arrays vs lists** (`why-numpy`) 18 min · runnable · 3 concepts. Contiguous memory, vectorisation, and what happens under Python's hood.
2. **Arrays, shape and dtype** (`arrays-and-shapes`) 18 min · runnable · 4 concepts. Create arrays, read their shape and dtype, reshape them, and join them with concatenate or stack.
3. **Indexing, slicing and boolean masks** (`indexing-and-masks`) 20 min · runnable · 4 concepts. Pick out rows, columns and elements, and filter with conditions.
4. **Element-wise operations, matrix products and axes** (`vectorised-ops-and-axes`) 14 min · runnable · 2 concepts. Tell * from @ and np.dot, and reduce arrays along an axis.
5. **Broadcasting** (`broadcasting`) 15 min · runnable · 3 concepts. Combine arrays of different shapes safely and spot the silent bugs.
6. **NumPy patterns for from-scratch ML** (`from-scratch-patterns`) 18 min · runnable · 3 concepts. The ten NumPy moves that build K-means, kNN, metrics and boosting in the Final.


### M9. Probability and statistics (`probability-and-statistics`)

*Reasoning with uncertainty and data* · domain `mathematics` · prerequisites: numpy, maths-foundations

Describing data with centre and spread, probability rules and conditional probability, Bayes' theorem by counting, distributions, expectation and the central limit theorem, then correlation, hypothesis tests and p-values.

Paper subtopics: probability-statistics

1. **Describing data: centre and spread** (`describing-data`) 16 min · runnable · 2 concepts. Mean, median, mode, variance and standard deviation, and how outliers and skew affect them.
2. **Probability rules and conditional probability** (`probability-rules`) 18 min · none · 3 concepts. Counting outcomes, the 'and' and 'or' rules, independence versus mutually exclusive events, and conditional probability.
3. **Bayes' theorem** (`bayes-theorem`) 18 min · runnable · 2 concepts. Updating beliefs with evidence, and why a positive test for a rare condition is often a false alarm.
4. **Distributions, the normal curve and the CLT** (`distributions-and-clt`) 20 min · runnable · 3 concepts. Random variables, expectation, the normal distribution and z-scores, and why averages of many samples look normal.
5. **Correlation and hypothesis tests** (`correlation-and-testing`) 18 min · runnable · 2 concepts. Whether two variables move together, and how to tell a real effect from luck with p-values.


### M10. pandas and plotting (`pandas-and-plotting`)

*Tables you can question* · domain `computing` · prerequisites: numpy, probability-and-statistics

Loading and inspecting tables with pandas, selecting rows and columns with loc, iloc and boolean filters, cleaning missing values, types and duplicates, grouping, merging and adding columns, and choosing and drawing the right plot with matplotlib and seaborn.

Paper subtopics: pandas, data-preprocessing

1. **DataFrames: inspect, select and filter** (`dataframes-and-selection`) 20 min · runnable · 4 concepts. Load a table, get a quick picture of it, and pull out exactly the rows and columns you need.
2. **Cleaning data: missing values, types and duplicates** (`cleaning-data`) 16 min · runnable · 3 concepts. Finding and handling missing values with isna, dropna, fillna, ffill and interpolate, fixing column types, and removing duplicates before any model sees the data.
3. **groupby, aggregation and merging** (`groupby-merge`) 15 min · runnable · 3 concepts. Split-apply-combine summaries and joining tables on keys.
4. **Plotting data with matplotlib and seaborn** (`plotting-data`) 16 min · runnable · 2 concepts. Choose the plot that answers your question, then draw it with the figure-axes recipe.


## Part 3: Classical machine learning

Train, evaluate and understand regression, classifiers, trees, ensembles and clustering, with calculus and deeper linear algebra taught just before they are needed. *(9 modules, 41 lessons, about 13.2 h)*


### M11. Machine learning foundations (`ml-fundamentals`)

*Models, data, generalisation and overfitting* · domain `ai_ml_dl` · prerequisites: ai-first-look, pandas-and-plotting

The scikit-learn fit/predict recipe on real data, why we hold out validation and test data, underfitting, overfitting and the bias-variance trade-off, learning curves, the curse of dimensionality, and how reinforcement learning differs from learning from labels.

Paper subtopics: ml-fundamentals, model-evaluation, reinforcement-learning

1. **Your first scikit-learn model** (`first-sklearn-model`) 15 min · runnable · 2 concepts. The vocabulary of ML (features, labels, parameters, hyperparameters) and the fit/predict recipe that every scikit-learn model follows.
2. **Generalisation, overfitting and bias-variance** (`generalisation-and-overfitting`) 24 min · runnable · 4 concepts. Why we split data three ways, how model complexity trades underfitting against overfitting, and how learning curves tell you which problem you have.
3. **The curse of dimensionality** (`curse-of-dimensionality`) 14 min · runnable · 2 concepts. Why data becomes sparse and distances become meaningless as the number of features grows.
4. **Reinforcement learning: learning from rewards** (`reinforcement-learning`) 14 min · none · 2 concepts. An agent acting in an environment, learning from rewards rather than labels, and the exploration-exploitation dilemma.


### M12. Data processing and feature engineering (`data-and-features`)

*Clean data beats clever models* · domain `computing` · prerequisites: ml-fundamentals

Handling missing data and outliers, scaling and normalisation, encoding categories and building vocabularies, engineering features (including sliding windows and summary statistics), and splitting data without leakage, the IOAI Data Processing and Feature Engineering topics.

Paper subtopics: data-preprocessing, pandas, model-evaluation

1. **Missing data and outliers** (`missing-data-and-outliers`) 22 min · runnable · 4 concepts. Imputing missing values without distorting the data, forward-fill for sequences, and spotting outliers with the IQR rule.
2. **Scaling, normalisation and standardisation** (`scaling-and-normalisation`) 16 min · runnable · 2 concepts. Putting features on comparable scales with z-scores or min-max, and why it matters for distances and gradient descent.
3. **Encoding categories and text** (`encoding-categories`) 15 min · runnable · 2 concepts. Turning categories into numbers with one-hot or ordinal encoding, and the first step for text: a vocabulary.
4. **Feature engineering** (`feature-engineering`) 18 min · runnable · 2 concepts. Creating informative features: interactions, polynomials, binning, statistics over windows, date parts and learned embeddings.
5. **Splitting data and avoiding leakage** (`splitting-and-leakage`) 18 min · runnable · 2 concepts. Random, stratified and time-based splits, fitting preprocessing on training data only, target leakage, and scikit-learn Pipelines.


### M13. Calculus and gradient descent (`calculus-and-gradient-descent`)

*Slopes that tell models where to go* · domain `mathematics` · prerequisites: vectors-and-matrices, ai-first-look, maths-foundations

Derivatives as slopes, the rules you need without a calculator (including sigmoid and ReLU), the chain rule behind backpropagation, partial derivatives and gradients, gradient descent on loss landscapes, and curvature: convexity, the Hessian, saddle points and Newton's method.

Paper subtopics: calculus, optimisation, linear-algebra

1. **Derivatives are slopes** (`derivatives-as-slopes`) 15 min · none · 2 concepts. The derivative is the slope of the tangent line, found by zooming in until a curve looks straight.
2. **Derivative rules you must know cold** (`derivative-rules`) 22 min · snippet · 4 concepts. Power, constant, sum, exponential and log rules, plus the sigmoid and ReLU derivatives that appear in NOAI questions.
3. **The chain rule** (`chain-rule`) 18 min · snippet · 3 concepts. How to differentiate a function inside a function by multiplying rates, the engine of backpropagation.
4. **Partial derivatives and the gradient** (`partial-derivatives-gradients`) 20 min · runnable · 3 concepts. Slopes for functions of many inputs, combined into the gradient vector that points uphill.
5. **Gradient descent on a loss landscape** (`gradient-descent`) 20 min · runnable · 3 concepts. The loss as a landscape over the parameters, the update rule w ← w − η∇L, and why long narrow valleys make gradient descent zig-zag.
6. **Curvature: second derivatives, convexity and the Hessian** (`curvature-convexity`) 18 min · snippet · 3 concepts. How curvature tells minima from maxima and saddles, and how Newton's method uses it.


### M14. Linear regression and regularisation (`linear-regression`)

*Fitting lines, planes and curves* · domain `ai_ml_dl` · prerequisites: data-and-features, calculus-and-gradient-descent

Linear regression from residuals to the normal equation, implementing it with gradient descent exactly as in the 2025 Final, multiple and polynomial regression, MSE versus MAE, and L1/L2 regularisation.

Paper subtopics: regression, optimisation, training-regularisation, numpy

1. **Linear regression and least squares** (`least-squares`) 18 min · runnable · 2 concepts. Residuals, mean squared error, and the line that makes the total squared error smallest.
2. **Regression by gradient descent (from scratch)** (`regression-by-gradient-descent`) 22 min · runnable · 3 concepts. Deriving the MSE gradients and implementing the training loop in NumPy, exactly the 2025 Final Question 1.
3. **Multiple and polynomial regression** (`multiple-and-polynomial`) 18 min · runnable · 2 concepts. Many features in matrix form, the normal equation, and curves from polynomial features.
4. **L1 and L2 regularisation** (`regularisation`) 20 min · runnable · 3 concepts. Penalising large weights to reduce overfitting; why L2 shrinks weights smoothly and L1 sets some exactly to zero; MSE versus MAE.


### M15. Classification models (`classification`)

*Drawing boundaries between classes* · domain `ai_ml_dl` · prerequisites: linear-regression, probability-and-statistics

Predicting categories with logistic regression, the likelihood and entropy ideas behind cross-entropy loss, softmax for many classes, k-nearest neighbours and Naive Bayes, and support vector machines with soft margins and kernels.

Paper subtopics: classification, probability-statistics, calculus

1. **Logistic regression** (`logistic-regression`) 20 min · runnable · 3 concepts. Squashing a linear score into a probability with the sigmoid, drawing a decision boundary, and the log loss.
2. **Likelihood, entropy and cross-entropy** (`likelihood-and-entropy`) 20 min · runnable · 3 concepts. Why classifiers are trained with cross-entropy: maximum likelihood, and the information-theory view of surprise.
3. **Softmax, cross-entropy and multi-class problems** (`softmax-and-multiclass`) 18 min · runnable · 2 concepts. Extending to many classes with softmax, the cross-entropy loss, and the difference between multi-class and multi-label.
4. **k-nearest neighbours** (`k-nearest-neighbours`) 25 min · runnable · 2 concepts. Classifying by a vote of the most similar training examples: choosing k, choosing a distance metric, and why the features must be scaled.
5. **Naive Bayes and Laplace smoothing** (`naive-bayes`) 20 min · runnable · 2 concepts. Bayes' theorem with a bold independence assumption: counting words to classify messages, and adding one to every count.
6. **Support vector machines and kernels** (`support-vector-machines`) 22 min · runnable · 3 concepts. The widest-street classifier, soft margins controlled by C, and the kernel trick for curved boundaries.


### M16. Evaluating models honestly (`model-evaluation`)

*Metrics that tell the truth* · domain `ai_ml_dl` · prerequisites: classification

Confusion matrices, precision, recall and F1, the accuracy paradox and remedies for imbalanced classes, ROC and PR curves, cross-validation and hyperparameter tuning without leakage, and metrics for regression and segmentation including IoU.

Paper subtopics: model-evaluation, classification, data-preprocessing, ml-debugging-diagnosis

1. **Confusion matrix, precision, recall and F1** (`confusion-matrix-and-metrics`) 20 min · runnable · 3 concepts. Counting the four kinds of right and wrong, the metrics built from them, and choosing the metric that matches the cost of errors.
2. **Imbalanced classes** (`imbalanced-data`) 18 min · runnable · 3 concepts. Why accuracy lies when positives are rare, and the standard remedies.
3. **ROC and precision-recall curves** (`roc-and-pr-curves`) 18 min · runnable · 2 concepts. Seeing performance across all thresholds at once, AUC, and why PR curves are better for rare positives.
4. **Cross-validation and hyperparameter tuning** (`cross-validation-and-tuning`) 24 min · runnable · 4 concepts. k-fold cross-validation, grid and random search, and keeping preprocessing and feature selection inside the folds.
5. **Regression metrics, IoU and averaging** (`regression-and-overlap-metrics`) 18 min · runnable · 3 concepts. MAE, MSE, RMSE and R² for numbers; IoU (the Jaccard index) for boxes; macro versus micro averaging.


### M17. Decision trees and ensembles (`trees-and-ensembles`)

*Many weak trees, one strong model* · domain `ai_ml_dl` · prerequisites: model-evaluation

How decision trees split data using Gini or entropy, then bagging, random forests and feature importance, AdaBoost, and gradient boosting built up to the from-scratch implementation in the 2026 Final, plus the boosting libraries that win on tabular data.

Paper subtopics: trees-ensembles, regression, classification

1. **Decision trees** (`decision-trees`) 20 min · runnable · 3 concepts. Asking yes/no questions to split data, measuring purity with Gini or entropy, and controlling depth to avoid overfitting.
2. **Bagging and random forests** (`bagging-and-random-forests`) 20 min · runnable · 3 concepts. Training many trees on bootstrap samples and averaging them to reduce variance; random feature subsets, out-of-bag error and feature importance.
3. **Boosting and AdaBoost** (`boosting-adaboost`) 16 min · runnable · 2 concepts. Building a strong model sequentially from weak learners by focusing on the examples previous models got wrong.
4. **Gradient boosting** (`gradient-boosting`) 25 min · runnable · 4 concepts. Fitting each new tree to the negative gradient of the loss (the residuals), with shrinkage, initialisation and early stopping as in the 2026 Final, and the boosting libraries that win on tabular data.


### M18. Matrices as transformations: rank, eigenvectors and SVD (`linear-algebra-deeper`)

*Watching matrices bend space* · domain `mathematics` · prerequisites: vectors-and-matrices, numpy, probability-and-statistics

Seeing a matrix as a warp of space explains rank, linear independence and conditioning, eigenvectors and eigenvalues, covariance matrices and SVD, the ideas behind PCA and many deeper NOAI maths questions.

Paper subtopics: linear-algebra, unsupervised

1. **A matrix is a transformation of space** (`linear-transformations`) 16 min · none · 2 concepts. Every matrix stretches, rotates, shears or squashes the whole grid, and multiplying matrices chains the moves.
2. **Span, linear independence and rank** (`span-rank-independence`) 20 min · snippet · 3 concepts. How many truly different directions a set of vectors or a matrix has, why rank limits what a matrix can do, and what 'nearly singular' means.
3. **Eigenvectors and eigenvalues** (`eigenvectors-eigenvalues`) 20 min · runnable · 3 concepts. The special directions a matrix only stretches, never turns, and the numbers that say by how much.
4. **Covariance and PCA** (`covariance-and-pca`) 20 min · runnable · 1 concept. The shape of a data cloud captured in a matrix, and PCA: its eigenvectors are the directions of greatest spread.
5. **SVD and special matrices** (`svd-and-special-matrices`) 35 min · runnable · 3 concepts. Orthogonal matrices, the turn-stretch-turn view of any matrix, low-rank approximation, positive definite matrices, QR and the Frobenius norm.


### M19. Unsupervised learning: clustering and dimensionality reduction (`unsupervised-learning`)

*Finding structure without labels* · domain `ai_ml_dl` · prerequisites: linear-algebra-deeper, model-evaluation

K-means (the 2025 Final task) and choosing k, hierarchical, DBSCAN and spectral clustering, PCA, and t-SNE/UMAP for visualisation, plus anomaly detection.

Paper subtopics: unsupervised, linear-algebra, numpy

1. **K-means clustering** (`k-means`) 20 min · runnable · 3 concepts. Alternating between assigning points to the nearest centroid and moving centroids to the mean, choosing k with the elbow method, and its limits.
2. **Hierarchical, DBSCAN and spectral clustering** (`hierarchical-dbscan-spectral`) 22 min · runnable · 3 concepts. Clustering by merging, by density, and by graph connectivity, for data K-means cannot handle.
3. **Principal component analysis** (`pca`) 20 min · runnable · 2 concepts. Finding the directions of greatest variance, projecting onto them to reduce dimensions, and reading explained variance.
4. **t-SNE, UMAP and anomaly detection** (`tsne-umap-and-anomalies`) 18 min · runnable · 3 concepts. Non-linear maps for visualising high-dimensional data, how to read them safely, and spotting unusual points.


## Part 4: Neural networks and deep learning

From a single perceptron to training deep networks in PyTorch, with backpropagation understood by hand and the optimisers and tricks that make training work. *(4 modules, 19 lessons, about 6.4 h)*


### M20. Neural networks from the perceptron up (`neural-networks`)

*Neurons, layers and non-linearity* · domain `ai_ml_dl` · prerequisites: classification, calculus-and-gradient-descent

The perceptron and its limits, activation functions and why non-linearity matters, multi-layer perceptrons in a TensorFlow-Playground-style sandbox, parameter counting, and matching output layers to loss functions.

Paper subtopics: neural-networks, classification, linear-algebra

1. **The perceptron** (`perceptron`) 16 min · runnable · 2 concepts. A single artificial neuron: weighted sum, threshold, a learning rule, and the famous XOR problem it cannot solve.
2. **Activation functions and non-linearity** (`activation-functions`) 18 min · runnable · 3 concepts. Why stacking linear layers is pointless without activations, and how sigmoid, tanh, ReLU, Leaky ReLU and GELU differ.
3. **Multi-layer perceptrons** (`multilayer-perceptrons`) 22 min · runnable · 3 concepts. Stacking layers of neurons, the forward pass as matrix multiplication, counting parameters, and watching a network learn curved boundaries.
4. **Output layers and loss functions** (`outputs-and-losses`) 16 min · torch-shown · 2 concepts. Matching the output layer and loss to the task, logits, BCEWithLogits, and the loss you should see at the start of training.


### M21. Backpropagation by hand and in NumPy (`backpropagation`)

*How networks learn from errors* · domain `ai_ml_dl` · prerequisites: neural-networks

Computational graphs, the backward pass as repeated chain rule, vanishing and exploding gradients, and a complete neural network trained from scratch in NumPy with gradient checking.

Paper subtopics: neural-networks, calculus, training-regularisation, numpy

1. **Computational graphs** (`computational-graphs`) 15 min · none · 2 concepts. Breaking any calculation into small nodes so that values flow forward and gradients flow backward.
2. **Backprop step by step** (`backprop-step-by-step`) 22 min · snippet · 2 concepts. Running the backward pass through a small network, multiplying local gradients, and summing where paths branch.
3. **Vanishing and exploding gradients** (`vanishing-and-exploding-gradients`) 18 min · snippet · 2 concepts. Why gradients shrink or blow up in deep networks and the fixes: ReLU, good initialisation, normalisation, residual connections and clipping.
4. **A neural network from scratch in NumPy** (`network-from-scratch`) 25 min · runnable · 3 concepts. Implementing the forward pass, loss, backward pass and update for a small classifier, and verifying gradients numerically.


### M22. PyTorch: tensors to training loops (`pytorch`)

*The tool every IOAI task uses* · domain `computing` · prerequisites: backpropagation, numpy

Tensors and shape surgery including batched matrix products and choosing dim, autograd and why gradients accumulate, nn.Module, layers and saving with state_dict, the standard training loop with DataLoader and train/eval modes, devices, GPU memory and freezing layers.

Paper subtopics: pytorch, code-debugging, neural-networks

1. **Tensors and shape surgery** (`tensors`) 24 min · torch-shown · 4 concepts. Creating tensors, dtypes, reshaping and transposing, batched matrix products and choosing the right dim.
2. **Autograd: automatic gradients** (`autograd`) 20 min · torch-shown · 3 concepts. requires_grad, the recorded graph, backward(), accumulating .grad, zeroing gradients, no_grad and detach.
3. **nn.Module, layers and saving models** (`modules-and-layers`) 24 min · torch-shown · 4 concepts. Writing a model class with __init__ and forward, nn.Linear shapes, nn.Sequential, parameters and state_dict.
4. **The training loop** (`training-loop`) 22 min · torch-shown · 3 concepts. Dataset and DataLoader, the five essential lines of every training step, and train versus eval mode.
5. **GPUs, devices and common PyTorch errors** (`devices-and-common-errors`) 20 min · torch-shown · 3 concepts. Moving models and data to a device, device-mismatch and shape errors, CUDA out-of-memory, freezing layers, and reading PyTorch error messages.


### M23. Optimisers and training deep networks well (`training-deep-networks`)

*Tricks that make deep learning work* · domain `ai_ml_dl` · prerequisites: pytorch, calculus-and-gradient-descent

Stochastic and mini-batch gradient descent, momentum, RMSProp, Adam and AdamW, weight initialisation, BatchNorm and LayerNorm, dropout, weight decay and early stopping, learning-rate warm-up and schedules, and stability tools: gradient clipping, mixed precision and gradient accumulation.

Paper subtopics: optimisation, training-regularisation, optimisation-tradeoffs, neural-networks, pytorch

1. **Stochastic and mini-batch gradient descent** (`sgd-and-mini-batches`) 20 min · snippet · 3 concepts. Using small random batches to estimate the gradient cheaply, and the vocabulary of epochs, iterations and batch size.
2. **Momentum, RMSProp and Adam** (`momentum-and-adam`) 20 min · snippet · 3 concepts. Smoothing gradients with moving averages and giving each parameter its own step size.
3. **Initialisation, BatchNorm and LayerNorm** (`initialisation-and-normalisation`) 22 min · torch-shown · 3 concepts. Starting weights at the right scale, and normalising activations so deep networks train stably.
4. **Dropout, weight decay, early stopping and augmentation** (`regularising-deep-networks`) 18 min · torch-shown · 3 concepts. Keeping big networks from memorising the training set.
5. **Learning-rate schedules and warm-up** (`learning-rate-warmup-schedules`) 20 min · torch-shown · 3 concepts. Finding a good learning rate, warm-up for Adam and Transformers, and reading what schedules do to the loss curve.
6. **Gradient clipping, mixed precision and accumulation** (`stability-and-scale`) 20 min · torch-shown · 3 concepts. Tools for stable and memory-efficient training: clipping exploding gradients, FP16/BF16 with loss scaling, and simulating big batches.


## Part 5: Computer vision

Convolutions, CNN architectures and ResNets, transfer learning and augmentation, detection, U-Net segmentation and mean IoU. *(2 modules, 9 lessons, about 3.2 h)*


### M24. Convolutional neural networks (`convolutional-networks`)

*Seeing with sliding filters* · domain `ai_ml_dl` · prerequisites: training-deep-networks

Images as tensors, the convolution operation, padding, stride and the output-size formula, multi-channel convolutions and parameter counts, pooling and receptive fields, and CNN architectures from LeNet and VGG to ResNet's residual blocks.

Paper subtopics: cnn-vision, neural-networks

1. **Images as tensors** (`images-as-tensors`) 20 min · runnable · 3 concepts. Pixels, channels and the (C, H, W) layout, normalisation, and why plain MLPs are a poor fit for images.
2. **The convolution operation** (`convolution`) 20 min · runnable · 2 concepts. Sliding a small filter over an image, computing a dot product at each position, and building feature maps.
3. **Padding, stride, channels and parameter counts** (`padding-stride-shapes`) 22 min · torch-shown · 3 concepts. The output-size formula, 'same' padding, stride for downsampling, multi-channel kernels, and counting parameters including 1×1 and depthwise separable convolutions.
4. **Pooling and receptive fields** (`pooling-and-receptive-field`) 18 min · runnable · 2 concepts. Downsampling with max and average pooling, small-shift robustness, how the receptive field grows with depth, and why stacks of 3×3 convolutions are popular.
5. **CNN architectures and ResNets** (`cnn-architectures-and-resnets`) 24 min · torch-shown · 4 concepts. How classic CNNs stack convolutions into feature hierarchies, why plain deep networks degrade, and how residual blocks fix it.


### M25. Vision tasks: transfer learning, detection and segmentation (`vision-tasks`)

*Where things are, pixel by pixel* · domain `ai_ml_dl` · prerequisites: convolutional-networks, model-evaluation

Using pretrained vision encoders through feature extraction and fine-tuning, image augmentation that keeps labels valid, the family of vision tasks, object detection with NMS and one- versus two-stage detectors (YOLO, SSD, Faster R-CNN, DETR), U-Net segmentation with skip connections and cropping, and mean IoU.

Paper subtopics: cnn-vision, model-evaluation, pytorch

1. **Transfer learning and image augmentation** (`transfer-learning-and-augmentation`) 22 min · torch-shown · 4 concepts. Reusing a pretrained backbone as a feature extractor or fine-tuning it, and augmenting images without breaking their labels.
2. **Vision tasks and object detection** (`vision-tasks-and-detection`) 22 min · snippet · 3 concepts. Classification, detection and segmentation compared, then how detectors find boxes: anchors, one- and two-stage pipelines and non-maximum suppression.
3. **U-Net segmentation** (`u-net-segmentation`) 24 min · torch-shown · 3 concepts. Encoder-decoder networks for pixel-wise prediction, upsampling with transposed convolutions, skip connections, and the cropping fix needed with valid padding.
4. **Measuring segmentation: IoU per class and mean IoU** (`segmentation-metrics`) 18 min · runnable · 2 concepts. Computing IoU from masks, averaging over classes, handling absent classes, Dice, and why pixel accuracy misleads.


## Part 6: Language and audio

Turning text and sound into numbers, attention and Transformers, and pretrained models such as BERT, GPT, HuBERT and Whisper. *(3 modules, 14 lessons, about 4.8 h)*


### M26. Text as data: tokens, vectors and sequences (`text-as-data`)

*Turning words into numbers* · domain `ai_ml_dl` · prerequisites: training-deep-networks, data-and-features

Tokenisation (word, character, subword BPE), padding and special tokens, bag-of-words and TF-IDF with cosine retrieval (the 2025 Final RAG task), word embeddings, a text-classification pipeline, and recurrent networks (RNN, LSTM) as the pre-Transformer approach.

Paper subtopics: nlp-transformers, sequence-models, data-preprocessing

1. **Tokenisation, vocabularies and padding** (`tokenisation`) 18 min · runnable · 3 concepts. Splitting text into word, character or subword tokens, special tokens, and padding with attention masks.
2. **Bag of words, TF-IDF and cosine retrieval** (`bag-of-words-and-tfidf`) 22 min · runnable · 2 concepts. Representing documents as word-count vectors, down-weighting common words with TF-IDF, and retrieving the most similar document with cosine similarity.
3. **Word embeddings** (`word-embeddings`) 20 min · runnable · 3 concepts. Dense vectors that place similar words near each other, how Word2Vec learns them from context, and embedding layers as lookup tables.
4. **Text classification** (`text-classification`) 18 min · runnable · 2 concepts. The pipeline from raw text to a label, from bag-of-words with logistic regression to averaged embeddings and fine-tuned encoders.
5. **Recurrent networks and LSTMs** (`rnns-and-lstms`) 20 min · torch-shown · 3 concepts. Reading sequences one step at a time with a hidden state, vanishing gradients through time, LSTM gates, and the seq2seq bottleneck that motivated attention.


### M27. Attention and Transformers (`attention-and-transformers`)

*Every token looks at every token* · domain `ai_ml_dl` · prerequisites: text-as-data, pytorch

Attention as a soft dictionary lookup, scaled dot-product attention with masks, multi-head attention with its reshapes, positional encoding, and the full Transformer block, all as needed for the 2026 Final Task 3.

Paper subtopics: nlp-transformers, linear-algebra, pytorch

1. **Attention as a soft lookup** (`attention-intuition`) 18 min · runnable · 2 concepts. Queries, keys and values: matching a question against labels to blend the answers.
2. **Scaled dot-product attention and masks** (`scaled-dot-product-attention`) 24 min · torch-shown · 3 concepts. The formula softmax(QKᵀ/√d_k)V step by step with shapes, why we divide by √d_k, and padding and causal masks.
3. **Multi-head attention** (`multi-head-attention`) 20 min · torch-shown · 2 concepts. Running several attention heads in parallel on slices of the embedding, the view/transpose reshapes, concatenation and output projection.
4. **Positional encoding and the Transformer block** (`positional-encoding-and-blocks`) 24 min · torch-shown · 4 concepts. Why attention needs position information, sinusoidal and learned encodings, and how attention, feed-forward layers, residuals and LayerNorm form a block.


### M28. Pretrained models for text and speech (`pretrained-models-text-speech`)

*BERT, GPT, Whisper and friends* · domain `ai_ml_dl` · prerequisites: attention-and-transformers

Encoder-only (BERT), decoder-only (GPT) and encoder-decoder models, language modelling, using and fine-tuning models with Hugging Face, sound as data (waveforms, sampling, spectrograms), and speech models HuBERT, Whisper and audio-LLMs.

Paper subtopics: nlp-transformers, llms, multimodal, pytorch

1. **BERT, GPT and language modelling** (`bert-and-gpt`) 24 min · torch-shown · 4 concepts. Encoder-only models pretrained by filling in masked words, decoder-only models that predict the next token, and how their attention masks differ.
2. **Encoder-decoder models** (`encoder-decoder-models`) 18 min · torch-shown · 2 concepts. Sequence-to-sequence Transformers for translation, summarisation, captioning and speech recognition, with cross-attention linking the two halves.
3. **Using and fine-tuning models with Hugging Face** (`hugging-face-in-practice`) 20 min · torch-shown · 2 concepts. Pipelines, tokenizers and AutoModels, what the tokenizer outputs, fine-tuning with labels and -100, and calling API-based models.
4. **Sound as data: waveforms and spectrograms** (`audio-as-data`) 20 min · runnable · 2 concepts. Sampling rate and the Nyquist limit, waveforms, the short-time Fourier transform, spectrograms and the mel scale.
5. **Speech models: HuBERT, Whisper and audio LLMs** (`speech-models`) 20 min · torch-shown · 3 concepts. Self-supervised audio encoders like HuBERT, encoder-decoder speech recognition with Whisper, and audio-language models such as Qwen-Audio and Voxtral.


## Part 7: Generative AI

How LLMs are built and used, prompting and RAG, autoencoders, GANs and diffusion, and multimodal models from ViT to CLIP and vision-language models. *(4 modules, 17 lessons, about 5.3 h)*


### M29. Large language models (`large-language-models`)

*How ChatGPT-style models really work* · domain `generative_ai` · prerequisites: pretrained-models-text-speech

How LLMs are pretrained, instruction-tuned and aligned, how decoding settings (greedy, beam, temperature, top-k, top-p) shape outputs, context windows and the KV cache, fine-tuning with LoRA and other parameter-efficient methods, and their limits and risks.

Paper subtopics: llms, ai-ethics-safety, nlp-transformers, reinforcement-learning

1. **How LLMs are built** (`how-llms-are-built`) 18 min · none · 2 concepts. Pretraining on next-token prediction, instruction tuning, preference alignment (RLHF), and what scale changes.
2. **Decoding: greedy, beam search, temperature, top-k and top-p** (`decoding-and-sampling`) 20 min · runnable · 3 concepts. How an LLM turns next-token probabilities into text, and how each setting trades accuracy against creativity.
3. **Context windows, the KV cache and cost** (`context-and-cost`) 15 min · none · 2 concepts. What the context window is, why long contexts are expensive, and how caching keys and values speeds up generation.
4. **Fine-tuning and LoRA** (`fine-tuning-and-lora`) 18 min · torch-shown · 2 concepts. Full fine-tuning versus parameter-efficient methods, the low-rank idea behind LoRA, and catastrophic forgetting.
5. **Limits, risks and responsible use of AI** (`limits-and-responsible-ai`) 16 min · none · 3 concepts. Hallucination, bias, privacy, prompt injection and misuse, and how they are evaluated and governed, including Singapore's approach.


### M30. Prompting and retrieval-augmented generation (`prompting-and-rag`)

*Getting reliable answers from LLMs* · domain `generative_ai` · prerequisites: large-language-models, text-as-data

Prompt engineering (zero-, one- and few-shot, chain-of-thought, structured output), the RAG pipeline from chunking to grounded answers, building a RAG retriever from scratch in NumPy (2025 Final Q3), and tool-using agents.

Paper subtopics: prompting-rag, llms, numpy

1. **Prompt engineering** (`prompt-engineering`) 16 min · none · 2 concepts. Writing clear instructions, using examples (few-shot), asking for step-by-step reasoning, and requesting structured output.
2. **The RAG pipeline** (`rag-pipeline`) 22 min · none · 3 concepts. Why LLMs need retrieval, the steps (chunk, embed, store, retrieve, augment, generate), and when to choose prompting, RAG or fine-tuning.
3. **Building a RAG retriever from scratch** (`rag-from-scratch`) 22 min · runnable · 2 concepts. Implementing vectorisation, cosine similarity and top-k retrieval in NumPy and assembling an answer, as in the 2025 Final.
4. **Tool use and agents** (`tools-and-agents`) 15 min · none · 2 concepts. Letting LLMs call functions and tools in a loop of thinking, acting and observing, and how such systems are evaluated.


### M31. Generative models: autoencoders, GANs and diffusion (`generative-models`)

*Machines that create new data* · domain `generative_ai` · prerequisites: convolutional-networks, probability-and-statistics, large-language-models

Generative versus discriminative models, autoencoders and VAEs with latent spaces, GANs and their training game, and diffusion models from forward noising to latent diffusion and classifier-free guidance.

Paper subtopics: generative-models, unsupervised, probability-statistics

1. **Generative versus discriminative models** (`generative-vs-discriminative`) 14 min · runnable · 2 concepts. Modelling P(y | x) to classify versus modelling P(x) to generate new samples.
2. **Autoencoders and variational autoencoders** (`autoencoders-and-vaes`) 22 min · torch-shown · 2 concepts. Compressing data through a bottleneck and reconstructing it, latent spaces, denoising and anomaly detection, and VAEs that make latent spaces smooth enough to sample from.
3. **Generative adversarial networks** (`gans`) 18 min · torch-shown · 2 concepts. A generator and a discriminator locked in a game, how training proceeds, and failure modes like mode collapse.
4. **Diffusion models** (`diffusion-models`) 24 min · torch-shown · 3 concepts. Gradually adding noise, learning to remove it, sampling step by step, latent diffusion (Stable Diffusion) and classifier-free guidance.


### M32. Multimodal AI: ViT, self-supervision, CLIP and VLMs (`multimodal-ai`)

*Connecting images, text and more* · domain `generative_ai` · prerequisites: attention-and-transformers, vision-tasks, large-language-models, generative-models

Vision Transformers that treat image patches as tokens, self-supervised learning for vision (contrastive and masked objectives), CLIP's contrastive training on image-text pairs with zero-shot classification, and vision-language models that feed image features into LLMs (Flamingo, LLaVA, GPT-4V style).

Paper subtopics: multimodal, cnn-vision, nlp-transformers, generative-models

1. **Vision Transformers** (`vision-transformers`) 18 min · torch-shown · 2 concepts. Treating an image as a sequence of patches with position embeddings and a class token, and how ViTs compare with CNNs.
2. **Self-supervised learning for vision** (`self-supervised-vision`) 18 min · snippet · 2 concepts. Learning visual features without labels through pretext tasks, contrastive learning (SimCLR) and masked image modelling (MAE).
3. **CLIP: one space for images and words** (`clip-and-zero-shot`) 22 min · torch-shown · 3 concepts. Contrastive training on image-caption pairs builds a joint embedding space, which turns text prompts into zero-shot classifiers.
4. **Vision-language models** (`vision-language-models`) 18 min · none · 2 concepts. How models like Flamingo, LLaVA and GPT-4V let an LLM see: vision encoders, projections, and cross-attention versus token concatenation.


## Part 8: Problem solving

Diagnosing broken models and code, and designing ML systems under real compute, memory and deployment constraints. *(2 modules, 9 lessons, about 3.1 h)*


### M33. Debugging and diagnosing ML models (`debugging-and-diagnosis`)

*From symptom to cause to fix* · domain `problem_solving` · prerequisites: training-deep-networks, model-evaluation

Reading loss curves, a systematic debugging routine with shape checks, the PyTorch gotchas examiners love, numerical problems (NaN, overflow, vanishing and exploding gradients) and data problems (label bugs, leakage, distribution shift), in the scenario style of the Prelim and the code-reading style of the Final.

Paper subtopics: ml-debugging-diagnosis, code-debugging, training-regularisation, pytorch

1. **Reading loss curves** (`reading-loss-curves`) 18 min · none · 2 concepts. What healthy, underfitting, overfitting, too-high and too-low learning-rate curves look like, and what to do about each.
2. **Systematic debugging and shape bugs** (`systematic-debugging`) 24 min · torch-shown · 4 concepts. A debugging decision tree, overfitting one batch, decoding shape errors and catching silent broadcasting and wrong-dim bugs.
3. **PyTorch gotchas and debugging tools** (`pytorch-gotchas`) 22 min · torch-shown · 4 concepts. The bugs examiners love: zero_grad, eval mode, devices, graphs and optimiser registration.
4. **NaNs, numerical issues and gradient diagnostics** (`nan-and-numerical-issues`) 20 min · runnable · 3 concepts. Overflow in exp, log of zero, division by zero, exploding and vanishing gradients, the standard fixes, and per-layer gradient norms to locate the failing layer.
5. **Data bugs, leakage and distribution shift** (`data-bugs-and-shift`) 18 min · runnable · 2 concepts. Label and preprocessing bugs, chance-level accuracy, train/test mismatch, covariate and concept drift, and validating on the right data.


### M34. ML systems and trade-offs (`ml-systems-and-tradeoffs`)

*Designing models for the real world* · domain `problem_solving` · prerequisites: debugging-and-diagnosis, attention-and-transformers, algorithms-and-complexity

The ML lifecycle, deployment and monitoring for drift, what fills GPU memory and how to feed and scale training, counting the compute cost of ML operations, and choosing and compressing models under latency, memory and accuracy constraints.

Paper subtopics: ml-system-design, optimisation-tradeoffs, algorithms-complexity, data-preprocessing

1. **The ML lifecycle, deployment and monitoring** (`lifecycle-and-deployment`) 24 min · none · 4 concepts. From problem framing to monitoring in production: the lifecycle loop, batch versus real-time serving, and catching data and concept drift.
2. **Compute and memory trade-offs in training** (`compute-and-memory-tradeoffs`) 20 min · none · 3 concepts. What fills GPU memory, how batch size, precision and accumulation trade speed for memory, and scaling across GPUs.
3. **The computational cost of ML operations** (`cost-of-ml`) 18 min · snippet · 2 concepts. Counting the work in matrix multiplication, dense and conv layers, k-NN, trees and attention, at training and at inference.
4. **Designing an ML solution under constraints** (`designing-ml-solutions`) 20 min · none · 2 concepts. Framing the problem, picking a baseline and a model family for the data type, and trading accuracy against latency, size and cost with quantisation and distillation.


## Part 9: Exam practice and beyond

Prelim strategy and no-calculator speed drills, past-paper walkthroughs, every past Final programming task rebuilt in NumPy and PyTorch, and the road to IOAI 2027. *(5 modules, 24 lessons, about 8.5 h)*


### M35. Prelim strategy and speed drills (`prelim-speed-toolkit`)

*150 questions, 90 minutes, no calculator* · domain `exam` · prerequisites: ml-systems-and-tradeoffs, multimodal-ai

A pacing and elimination method for 36-second MCQs, timed no-calculator drills for linear algebra, calculus, probability, metrics, conv arithmetic and parameter counts, speed code reading and keyword triggers, and full mock Prelims with an error log.

Paper subtopics: linear-algebra, calculus, probability-statistics, optimisation, python, numpy, pytorch, model-evaluation, cnn-vision, neural-networks, nlp-transformers, algorithms-complexity, ml-debugging-diagnosis

1. **Pacing, triage and elimination** (`pacing-and-elimination`) 16 min · none · 3 concepts. A two-pass plan for 150 questions, where the questions come from, and the elimination heuristics that work on NOAI options.
2. **Speed drills: shapes, dot products, norms and determinants** (`drill-linear-algebra`) 15 min · none · 3 concepts. Mental shortcuts for the most common linear-algebra computations.
3. **Speed drills: derivatives, probabilities, metrics and anchor values** (`drill-calculus-probability`) 18 min · none · 3 concepts. Instant recall of derivative facts, quick probabilities, z-scores and classification metrics, and a dozen anchor values that replace a calculator.
4. **Speed drills: conv sizes and parameter counts** (`drill-conv-and-params`) 25 min · snippet · 2 concepts. Deep-learning arithmetic done in seconds: conv output sizes, parameter counts and the cost of common operations, without a calculator.
5. **Speed drills: shapes and code traps** (`drill-shapes-and-code`) 25 min · snippet · 2 concepts. Reading Python, NumPy and PyTorch code at speed: writing the shape on every line and spotting the dozen traps that recur in past papers.
6. **Mock Prelims and the review loop** (`mock-prelim-and-review`) 25 min · none · 3 concepts. Sit a timed 150-question mock, then turn every miss into a targeted fix and track your projected score.


### M36. Past-paper walkthroughs (`past-paper-walkthroughs`)

*Every real question, explained* · domain `exam` · prerequisites: prelim-speed-toolkit

Guided walkthroughs of the 2026 Prelim by domain, its long problem-solving scenarios, the code-reading MCQs of the 2026 Final, and the 2025 MCQs, with the pattern behind each question and the anatomy of its distractors.

Paper subtopics: linear-algebra, calculus, probability-statistics, optimisation, python, numpy, pandas, pytorch, code-debugging, ml-fundamentals, classification, trees-ensembles, unsupervised, model-evaluation, neural-networks, training-regularisation, cnn-vision, sequence-models, nlp-transformers, llms, generative-models, multimodal, prompting-rag, ml-debugging-diagnosis, ml-system-design, optimisation-tradeoffs

1. **2026 Prelim: Mathematics and Computing** (`prelim-maths-computing`) 22 min · none · 2 concepts. Every question pattern from the maths and computing sections, solved with the fastest method.
2. **2026 Prelim: AI/ML/DL and Generative AI** (`prelim-ml-genai`) 22 min · none · 3 concepts. Definitions, architectures and model-behaviour questions from the AI and GenAI sections, and how their distractors are built.
3. **2026 Prelim: Problem-solving scenarios** (`prelim-problem-solving`) 22 min · none · 3 concepts. Long scenario questions about training logs, metrics and systems, with a reading method that saves time.
4. **2026 Final MCQs and the 2025 paper** (`final-mcqs-and-trends`) 25 min · torch-shown · 3 concepts. The 20 code-reading MCQs of the 2026 Final, the 20 definition-level 2025 MCQs, and what the trend says about 2027.


### M37. Final lab I: from scratch in NumPy (`final-lab-numpy`)

*Rebuild every classic-ML Final task* · domain `exam` · prerequisites: linear-regression, unsupervised-learning, trees-and-ensembles, prompting-and-rag

How the Final's Jupyter notebooks work and how to plan three hours, then full rebuilds of the four NumPy tasks: 2025 linear regression by gradient descent, 2025 K-means, 2025 TF-IDF retrieval-augmented generation, and 2026 gradient boosting with early stopping.

Paper subtopics: numpy, regression, unsupervised, prompting-rag, trees-ensembles

1. **Working in the exam notebook and planning three hours** (`exam-notebook-skills`) 20 min · runnable · 4 concepts. Read stubs, respect DO-NOT-EDIT cells, test as you go, avoid kernel-state traps, format outputs exactly, and split three hours across the MCQs and tasks.
2. **2025 Task 1: Linear regression by gradient descent** (`task-linear-regression-gd`) 20 min · runnable · 2 concepts. Rebuild the 15-mark task and check your answer against the expected output.
3. **2025 Task 2: K-means from scratch** (`task-kmeans`) 22 min · runnable · 3 concepts. Rebuild the 25-mark K-means task with distance helper, assignment, update and convergence.
4. **2025 Task 3: Retrieval-augmented generation with TF-IDF** (`task-rag-tfidf`) 25 min · runnable · 2 concepts. Build the 40-mark RAG pipeline in NumPy: vocabulary, TF-IDF, cosine retrieval and response generation.
5. **2026 Task 1: Gradient boosting from scratch** (`task-gradient-boosting`) 25 min · runnable · 3 concepts. Rebuild the 25-mark task: gradients, initial predictions, the class, the fit loop and early stopping.


### M38. Final lab II: deep-learning tasks in PyTorch (`final-lab-pytorch`)

*Rebuild the U-Net and attention tasks* · domain `exam` · prerequisites: final-lab-numpy, vision-tasks, attention-and-transformers, debugging-and-diagnosis

Shape-first PyTorch habits for the Final, the 2026 U-Net debugging task (centre crop) and mean IoU with absent classes, the 2026 attention task (scaled dot-product and multi-head attention, positional-encoding bug, classifier head and causal mask), and a self-checking practice set of likely 2027 tasks.

Paper subtopics: pytorch, cnn-vision, nlp-transformers, code-debugging, model-evaluation

1. **PyTorch patterns for the Final** (`torch-exam-patterns`) 15 min · torch-shown · 2 concepts. Shape-first coding, NumPy-to-torch translation and test-cell habits.
2. **2026 Task 2 Part 1: Fixing U-Net with center crop** (`task-unet-center-crop`) 24 min · torch-shown · 3 concepts. Implement center_crop to align encoder and decoder feature maps.
3. **2026 Task 2 Part 2: Mean IoU from scratch** (`task-mean-iou`) 22 min · runnable · 3 concepts. Implement mIoU without sklearn or torchmetrics, including the missing-class edge case.
4. **2026 Task 3 Parts 1-2: Attention and multi-head attention** (`task-attention`) 25 min · torch-shown · 3 concepts. Implement scaled dot-product attention and a multi-head attention module, and explain the sqrt(d_k) scaling.
5. **2026 Task 3 Parts 3-5: Positional encoding, classifier head and causal mask** (`task-pe-classifier-mask`) 20 min · torch-shown · 3 concepts. Fix the div_term bug, build the classification head with masked mean pooling, and create a causal mask.
6. **Practice set: likely 2027 tasks** (`practice-set`) 25 min · runnable · 3 concepts. New from-scratch tasks in the Final's style, from logistic regression and PCA in NumPy to a conv2d, normalisation layer or loss in PyTorch, with self-checking tests.


### M39. Beyond NOAI: the road to IOAI 2027 (`road-to-ioai`)

*From finalist to national team* · domain `exam` · prerequisites: final-lab-pytorch

What happens after NOAI (NTU selection test, training, camp, IOAI 2027 in Singapore), how IOAI tasks are scored, how practical tasks differ from MCQs, the competition craft of improving a baseline, techniques that keep winning tasks, and a study roadmap mapped to the IOAI syllabus.

Paper subtopics: ml-system-design, ml-debugging-diagnosis, cnn-vision, nlp-transformers, llms, multimodal, training-regularisation, model-evaluation

1. **After NOAI: NTU selection and the IOAI format** (`after-noai`) 18 min · none · 3 concepts. The timeline from April to July 2027, what the NTU selection stage looks like, and how the IOAI Individual Contest is run and scored.
2. **From baseline to better: competition craft** (`baseline-to-better`) 20 min · torch-shown · 3 concepts. Reading a baseline, setting up trustworthy validation, changing one thing at a time, logging experiments and avoiding leaderboard overfitting.
3. **Techniques that keep winning tasks** (`ioai-task-techniques`) 24 min · torch-shown · 4 concepts. Handling imbalance (weighted loss, focal loss, balanced sampling), transfer learning, pseudo-labels for unlabelled data, cheap clever ideas under constraints, and input gradients for adversarial and saliency tasks.
4. **Your study roadmap beyond NOAI** (`study-roadmap`) 18 min · none · 3 concepts. A skills ladder from Prelim recall to IOAI open-ended modelling, project ideas, practice sources and a weekly plan from March to July.


## Final programming tasks: where each one is taught and rebuilt

Each line lists the prerequisite lessons first and the Final-lab rebuild last.

- **2025 Q1 Linear regression by gradient descent (15 marks)**: M6 maths-foundations › sigma-notation-and-subscripts; M14 linear-regression › regression-by-gradient-descent; M37 final-lab-numpy › task-linear-regression-gd
- **2025 Q2 K-means clustering (25 marks)**: M8 numpy › from-scratch-patterns; M19 unsupervised-learning › k-means; M37 final-lab-numpy › task-kmeans
- **2025 Q3 Retrieval-augmented generation with TF-IDF (40 marks)**: M26 text-as-data › bag-of-words-and-tfidf; M30 prompting-and-rag › rag-from-scratch; M37 final-lab-numpy › task-rag-tfidf
- **2026 Task 1 Gradient boosting from scratch (25 marks)**: M4 python-toolkit › classes-objects; M13 calculus-and-gradient-descent › derivative-rules; M17 trees-and-ensembles › gradient-boosting; M37 final-lab-numpy › task-gradient-boosting
- **2026 Task 2 U-Net debugging and mean IoU (20 marks)**: M24 convolutional-networks › padding-stride-shapes; M25 vision-tasks › u-net-segmentation; M25 vision-tasks › segmentation-metrics; M38 final-lab-pytorch › task-unet-center-crop; M38 final-lab-pytorch › task-mean-iou
- **2026 Task 3 Attention, multi-head attention, positional encoding (35 marks)**: M9 probability-and-statistics › distributions-and-clt; M22 pytorch › modules-and-layers; M27 attention-and-transformers › scaled-dot-product-attention; M27 attention-and-transformers › multi-head-attention; M38 final-lab-pytorch › task-attention; M38 final-lab-pytorch › task-pe-classifier-mask

## IOAI 2026 syllabus coverage (all 60 items)

| IOAI item | Lessons |
|---|---|
| 1A1 Python basics | M3 python-basics › loops; M4 python-toolkit › functions |
| 1A2 NumPy and pandas | M8 numpy › arrays-and-shapes; M10 pandas-and-plotting › dataframes-and-selection; M10 pandas-and-plotting › cleaning-data |
| 1A3 Matplotlib and Seaborn | M10 pandas-and-plotting › plotting-data |
| 1A4 scikit-learn | M11 ml-fundamentals › first-sklearn-model; M12 data-and-features › splitting-and-leakage |
| 1A5 PyTorch basics | M4 python-toolkit › classes-objects; M22 pytorch › autograd; M22 pytorch › modules-and-layers; M22 pytorch › training-loop |
| 1A6 Tensor manipulation | M8 numpy › broadcasting; M22 pytorch › tensors |
| 1A7 Training on CPU and GPU | M22 pytorch › devices-and-common-errors; M34 ml-systems-and-tradeoffs › compute-and-memory-tradeoffs |
| 1B1 Linear regression | M14 linear-regression › least-squares; M14 linear-regression › regression-by-gradient-descent |
| 1B2 Logistic regression | M15 classification › logistic-regression |
| 1B3 L1 and L2 regularisation | M14 linear-regression › regularisation |
| 1B4 k-NN | M15 classification › k-nearest-neighbours |
| 1B5 Decision trees | M17 trees-and-ensembles › decision-trees |
| 1B6 Ensembles | M17 trees-and-ensembles › bagging-and-random-forests; M17 trees-and-ensembles › gradient-boosting |
| 1B7 SVM | M15 classification › support-vector-machines |
| 1C1 K-means | M19 unsupervised-learning › k-means; M37 final-lab-numpy › task-kmeans |
| 1C2 PCA | M18 linear-algebra-deeper › covariance-and-pca; M19 unsupervised-learning › pca |
| 1C3 t-SNE, UMAP | M19 unsupervised-learning › tsne-umap-and-anomalies |
| 1C4 DBSCAN, hierarchical, spectral | M19 unsupervised-learning › hierarchical-dbscan-spectral |
| 1D1 Evaluation metrics | M16 model-evaluation › confusion-matrix-and-metrics; M16 model-evaluation › regression-and-overlap-metrics |
| 1D2 Underfitting, overfitting (Theory) | M11 ml-fundamentals › generalisation-and-overfitting |
| 1D3 Hyperparameter tuning | M16 model-evaluation › cross-validation-and-tuning |
| 1D4 Cross-validation | M16 model-evaluation › cross-validation-and-tuning |
| 1D5 Confusion matrix and ROC | M16 model-evaluation › confusion-matrix-and-metrics; M16 model-evaluation › roc-and-pr-curves |
| 1D6 Feature engineering | M12 data-and-features › feature-engineering; M12 data-and-features › encoding-categories |
| 1D7 Data processing | M12 data-and-features › missing-data-and-outliers; M10 pandas-and-plotting › cleaning-data; M12 data-and-features › scaling-and-normalisation; M12 data-and-features › splitting-and-leakage; M26 text-as-data › tokenisation; M32 multimodal-ai › vision-transformers; M24 convolutional-networks › images-as-tensors |
| 2A1 Perceptron | M20 neural-networks › perceptron |
| 2A2 Gradient descent | M13 calculus-and-gradient-descent › gradient-descent |
| 2A3 Backpropagation | M21 backpropagation › backprop-step-by-step; M21 backpropagation › network-from-scratch |
| 2A4 Activation functions | M20 neural-networks › activation-functions |
| 2A5 Loss functions | M20 neural-networks › outputs-and-losses; M15 classification › likelihood-and-entropy |
| 2B1 MLP | M20 neural-networks › multilayer-perceptrons |
| 2B2 Embeddings (text, image, audio) | M26 text-as-data › word-embeddings; M25 vision-tasks › transfer-learning-and-augmentation; M28 pretrained-models-text-speech › speech-models |
| 2B3 Pooling | M24 convolutional-networks › pooling-and-receptive-field |
| 2B4 Attention | M27 attention-and-transformers › scaled-dot-product-attention |
| 2B5 Transformers (text and image) | M27 attention-and-transformers › positional-encoding-and-blocks; M32 multimodal-ai › vision-transformers |
| 2B6 Autoencoders | M31 generative-models › autoencoders-and-vaes |
| 2B7 SGD, mini-batch | M23 training-deep-networks › sgd-and-mini-batches |
| 2B8 Momentum, Adam, AdamW | M23 training-deep-networks › momentum-and-adam |
| 2B9 Convergence and learning rates | M23 training-deep-networks › learning-rate-warmup-schedules |
| 2B10 Dropout, early stopping, weight decay | M23 training-deep-networks › regularising-deep-networks |
| 2B11 Weight initialisation | M23 training-deep-networks › initialisation-and-normalisation |
| 2B12 Batch normalisation | M23 training-deep-networks › initialisation-and-normalisation |
| 2B13 Fine-tuning (full and PEFT) | M25 vision-tasks › transfer-learning-and-augmentation; M29 large-language-models › fine-tuning-and-lora |
| 3A1 Convolutional layers | M24 convolutional-networks › convolution; M24 convolutional-networks › padding-stride-shapes |
| 3A2 Image classification | M24 convolutional-networks › cnn-architectures-and-resnets |
| 3A3 Object detection (YOLO, SSD, DETR) | M25 vision-tasks › vision-tasks-and-detection |
| 3A4 Image segmentation (U-Net) | M25 vision-tasks › u-net-segmentation; M38 final-lab-pytorch › task-unet-center-crop |
| 3A5 Pretrained vision encoders (ResNet) | M24 convolutional-networks › cnn-architectures-and-resnets; M25 vision-tasks › transfer-learning-and-augmentation |
| 3A6 Image augmentation | M25 vision-tasks › transfer-learning-and-augmentation |
| 3A7 GANs | M31 generative-models › gans |
| 3A8 Self-supervised learning for vision | M32 multimodal-ai › self-supervised-vision |
| 3A9 Vision-text encoders (CLIP) | M32 multimodal-ai › clip-and-zero-shot |
| 3A10 Diffusion models | M31 generative-models › diffusion-models |
| 4A1 Text classification | M26 text-as-data › text-classification |
| 4A2 Pretrained text encoders (BERT) | M28 pretrained-models-text-speech › bert-and-gpt |
| 4A3 Language modelling | M28 pretrained-models-text-speech › bert-and-gpt; M29 large-language-models › how-llms-are-built |
| 4A4 Encoder-decoder models | M28 pretrained-models-text-speech › encoder-decoder-models; M32 multimodal-ai › vision-language-models |
| 4A5 Pretrained LMs (open-source and API) | M28 pretrained-models-text-speech › hugging-face-in-practice; M29 large-language-models › decoding-and-sampling |
| 4B1 Pretrained audio encoders (HuBERT) | M28 pretrained-models-text-speech › speech-models |
| 4B2 Audio models (Qwen-Audio, Whisper, Voxtral) | M28 pretrained-models-text-speech › audio-as-data; M28 pretrained-models-text-speech › speech-models |

## NOAI assessed areas

- **Mathematics**: notation warm-up (M6), linear algebra (M7, M18), calculus and optimisation (M13, M23), probability and statistics (M9, M15 likelihood and entropy).
- **Computing**: Python (M3, M4), NumPy (M8), pandas (M10), PyTorch (M22), debugging (M4, M33), data preprocessing (M12).
- **AI/ML/DL**: classical ML (M11 to M19), neural networks (M20 to M23), computer vision (M24, M25), NLP (M26 to M28).
- **Generative AI**: LLMs (M29), prompting and RAG (M30), generative models (M31), multimodal (M32).
- **Problem solving**: algorithm design (M5), debugging and diagnosis (M33), optimisation and system design (M23, M34).
- **Exam**: Prelim strategy and no-calculator drills (M35), past-paper walkthroughs (M36), Final labs for all six past tasks (M37, M38), road to IOAI (M39).

## Critic pass: changes made

An adversarial completeness audit compared the curriculum with all 340 past-paper questions (2025 MCQ, 2026 Prelim, 2026 Final MCQ), the 60 IOAI 2026 syllabus items, the official NOAI areas and the six Final programming tasks, then checked structure (prerequisites, sizing, duplication, visual quality). Every change below is also stored in `critic_changes` in curriculum.json.

| # | Type | Target | Change | Why |
|---|---|---|---|---|
| 1 | new-module | maths-foundations (4 lessons, 12 concepts) | Added a maths warm-up module at the start of the toolkit part: functions-and-graphs, powers-and-exponentials, logarithms, sigma-notation-and-subscripts. Made it a prerequisite of vectors-and-matrices, calculus-and-gradient-descent and probability-and-statistics, and updated the toolkit part summary. | A Sec 3 beginner with school algebra had no lesson on f(x) notation and composition, exponent rules, e, logarithms or Σ/subscript notation, yet these are used from the first maths module onwards (ln K initial loss, log-likelihood, cross-entropy, TF-IDF, log n, the 2025 Final update rule written in Σ notation, Prelim items on composite functions, eˣ and the sigmoid). |
| 2 | new-lesson | pandas-and-plotting/cleaning-data | Added a 16-minute runnable lesson (3 concepts: finding missing values, dropna/fillna/ffill/interpolate, types and duplicates) as lesson 2 of the pandas module. | No lesson taught pandas missing-value handling (2026 Prelim Q101 asks exactly fillna/dropna/interpolate), and data-and-features only treated imputation conceptually. |
| 3 | new-concept | python-toolkit/classes-objects: Abstract base classes | Added a fourth concept (minutes 20 to 24) on abc.ABC and @abstractmethod with an interactive template visual. | The 2026 Final Task 1 scaffold is an abstract base class (research skills matrix lists 'abc.ABC/@abstractmethod' as required), but no lesson taught it. |
| 4 | new-concept | pytorch/modules-and-layers: Parameters versus buffers | Added a fourth concept (minutes 20 to 24) on nn.Parameter vs register_buffer vs plain attributes. | register_buffer appears in the 2026 Final MCQ 8 (custom BatchNorm running statistics) and in Final Task 3 (positional encoding must move to the GPU), and was not taught anywhere. |
| 5 | new-concept | data-and-features/missing-data-and-outliers: Drop, impute or let the model cope | Added a fourth concept (minutes 18 to 22) with the (1 − p)^d complete-row calculation and which model families accept NaN; first objective broadened. | 2026 Prelim Q259 hinges on complete-case analysis and on trees handling missing values natively; neither was taught. |
| 6 | new-concept | convolutional-networks/images-as-tensors: Normalising image inputs | Added a third concept (minutes 15 to 20) on zero-centring versus min-max scaling, dataset-wide versus per-image statistics, medical-image intensity and video tensors (T, C, H, W). | 2026 Prelim Q296 (X-ray preprocessing: zero-centring beats min-max, per-image scaling loses signal) and Final MCQ 11 (brightness jitter on X-rays) were not taught; the IOAI syllabus also lists video as a data type. |
| 7 | new-concept | calculus-and-gradient-descent/derivative-rules: Product and quotient rules | Added a fourth concept (minutes 18 to 22) covering the product rule, quotient rule, the derivation of σ′ and the subgradient of \|x\|. | The sigmoid derivative (2026 Prelim Q34) was stated but never derived, the quotient and product rules were absent, and subgradients (Prelim Q36, Final Task 1 L1 gradient) were only implied. |
| 8 | new-concept | backpropagation/network-from-scratch: The backward pass in matrix form | Added the explicit batched backward pass (seven lines with shapes) between the training-cycle and gradient-checking concepts; minutes unchanged at 25. | The lesson promised a from-scratch NumPy network in 25 minutes but only had two short concepts (lowest explanation density in the curriculum) and never showed the matrix-form gradients students must code. |
| 9 | new-concept | linear-regression/regression-by-gradient-descent: Simultaneous updates and the ½ convention | Added a third concept with verified numbers for the 2025 Final data (1/m gives [0.003, 0.9987], 2/m gives [0.0, 1.0], sequential updates give [0.0027, 0.9988]). | This lesson is the precursor of 2025 Final Q1 but used the 2/n convention without warning that the task uses 1/m, and never addressed simultaneous updates or the intercept column (both listed as required skills in the task analysis). |
| 10 | new-concept | final-lab-pytorch/task-unet-center-crop: Crop, pad or interpolate? (Q2.1b) | Added the written-answer part of Task 2 (minutes 20 to 24) including the notebook-premise correction, and added the four centre-crop pitfalls to the implementation concept. | Q2.1b (the manual trade-off answer) and the documented crop pitfalls were missing from the walkthrough. |
| 11 | new-concept | final-lab-numpy/task-gradient-boosting: Reading the scaffold and avoiding the traps | Added a scaffold/traps concept (ABC hierarchy, mislabelled Q1.5 slot, four costly traps, why L1 looks poor) and rewrote the early-stopping concept with the real signature (patience, min_delta) and the m + 1 rule. | The walkthrough used a wrong parameter name (n_iter_no_change) and omitted the errata and pitfalls documented in the task analysis. |
| 12 | replace-concept | final-lab-pytorch/task-mean-iou | Replaced 'Mean IoU with absent classes' (a near-copy of the lesson's implementation walkthrough and of vision-tasks/segmentation-metrics) with 'When a self-check disagrees with the specification' (the documented 0.75 vs 0.375 erratum); added the vectorisation and float rules. | Removes duplicated content and teaches the real Task 2 trap that even the official solution fails. |
| 13 | new-concept | road-to-ioai/ioai-task-techniques: Gradients with respect to the input | Added a fourth concept (minutes 20 to 24) on input gradients, FGSM and saliency maps. | IOAI 2026 Day 2 (Double Agent Dilemma) required gradient-based input perturbations; the curriculum never computed a gradient with respect to the input. |
| 14 | edit-concept | training-deep-networks/momentum-and-adam: Optimizer race | Extended the explanation: Adagrad, an earlier method, divides each step by the square root of the sum of all past squared gradients, so its step sizes only ever shrink and can stall; RMSProp fixes this by using a moving average instead. | Adagrad and RMSProp (2025 MCQ Q6) were not distinguished. |
| 15 | edit-concept | training-deep-networks/stability-and-scale: Mixed precision and loss scaling | Extended the explanation: In PyTorch this is torch.autocast, which runs matrix multiplications in FP16 or BF16 on the GPU's Tensor Cores (often 1.5 to 3 times faster), together with a GradScaler; call scaler.unscale_(optimizer) before clipping so the threshold applies to real gradient sizes. | torch.amp autocast and Tensor Cores (2026 Prelim Q124, Q289; Final MCQ 15) were not named. |
| 16 | edit-concept | training-deep-networks/stability-and-scale: Gradient accumulation and big batches | Extended the explanation: Beyond a few thousand examples per batch, accuracy often drops even with linear scaling. Layer-wise adaptive optimisers such as LARS (for SGD) and LAMB (for Adam) scale each layer's step by the ratio of its weight norm to its gradient norm, and are combined with warm-up and label smoothing to train very large batches stably. | LARS and large-batch generalisation (2026 Prelim Q284) were missing. |
| 17 | edit-concept | training-deep-networks/learning-rate-warmup-schedules: Learning-rate schedules | Extended the explanation: Cosine decay from a base rate to a minimum follows lr = min + ½(base − min)(1 + cos(π·t/T)), so halfway through (t = T/2) the rate is exactly midway between the two. The 1cycle policy rises to a high rate and then anneals far below the start: the high-rate phase explores and escapes sharp minima, the low-rate phase settles. ReduceLROnPlateau instead cuts the rate (for example by 10×) whenever the validation loss stops improving. | The cosine formula (Final MCQ 9), 1cycle (Prelim Q282) and ReduceLROnPlateau (2025 MCQ Q10) were missing. |
| 18 | edit-concept | training-deep-networks/initialisation-and-normalisation: Initial weights set the signal scale | Extended the explanation: Orthogonal initialisation (a random orthogonal matrix) preserves vector lengths exactly, which helps very deep and recurrent networks. Initialise the output layer's bias sensibly too, at zero or at the log of each class's frequency: a bias set far too low for some classes can stop them ever being predicted. | Orthogonal initialisation (Prelim Q18) and output-bias initialisation (Prelim Q278) were missing. |
| 19 | edit-concept | training-deep-networks/initialisation-and-normalisation: BatchNorm step by step | Extended the explanation: In a custom implementation the running statistics are buffers updated in place inside torch.no_grad(). Dropout placed just before BatchNorm makes the variance it sees differ between training and evaluation, one reason the two can conflict. | Custom BatchNorm buffers (Final MCQ 8) and the BatchNorm-dropout conflict (Prelim Q184) were missing. |
| 20 | edit-concept | text-as-data/tokenisation: Padding and attention masks | Extended the explanation: Generative models also wrap sequences in <BOS> and <EOS> tokens. When truncating, cut the content first and then add <EOS>; truncating after adding it silently removes the end marker. Label positions that are padding are set to −100 so the loss ignores them, while the input keeps the pad id. | Special-token truncation (Final MCQ 18) was only named in an exam walkthrough, never taught. |
| 21 | edit-concept | ml-systems-and-tradeoffs/lifecycle-and-deployment: The drift dashboard | Extended the explanation: When labels are delayed, a proxy such as the approval rate is the earliest warning: an error rate computed on the few labels that have arrived can look steady while the decisions being made collapse. | Proxy metrics under delayed ground truth (Prelim Q299) were missing. |
| 22 | edit-concept | pytorch/autograd: Gradients accumulate | Extended the explanation: With a fresh forward pass each time, gradients simply add up. Calling backward() twice through the same graph usually raises an error ('Trying to backward through the graph a second time'), because the values saved for the backward pass are freed after the first call, unless you pass retain_graph=True. | retain_graph and the difference between two backward calls on one graph versus two forward passes were missing. |
| 23 | edit-concept | backpropagation/network-from-scratch: Gradient checking | Extended the explanation: Use the central difference with ε around 1e-5 in float64: a larger ε adds truncation error from curvature, and a smaller one adds rounding error from subtracting nearly equal numbers. PyTorch's torch.autograd.gradcheck does exactly this. | Truncation versus rounding error in finite differences (Prelim Q280) was only implied by the visual. |
| 24 | edit-concept | probability-and-statistics/describing-data: Mean as balance point, median as middle | Extended the explanation: The mode is the most common value. In right-skewed data, such as incomes with a long tail of large values, the tail drags the mean furthest, so typically mean > median > mode. | The mode and the skew ordering (Prelim Q58) were in the objectives but not explained. |
| 25 | edit-concept | probability-and-statistics/distributions-and-clt: Expectation is the long-run average | Extended the explanation: For independent variables, variances add: Var(X + Y) = Var(X) + Var(Y). So a dot product of two d-dimensional vectors with independent unit-variance entries has variance d, the reason attention divides by √d. | Variance of a sum is required for the Final Task 3 √d_k written answer and was never taught in the probability module. |
| 26 | edit-concept | vectors-and-matrices/identity-inverse-determinant: Identity and inverse undo each other | Extended the explanation: There is no matrix division: 'A ÷ B' is not defined, and you multiply by B⁻¹ instead when it exists. | Prelim Q3 asks which matrix operation is not valid (A ÷ B). |
| 27 | edit-concept | trees-and-ensembles/boosting-adaboost: Learning from mistakes in sequence | Extended the explanation: Concretely, each sample weight is multiplied by e^α if it was misclassified and by e^−α if it was correct (weights *= np.exp(alpha * (2 * incorrect - 1))), then all weights are renormalised to sum to 1. This is the exponential-loss update. | The AdaBoost weight-update rule tested in Final MCQ 5 was missing. |
| 28 | edit-concept | neural-networks/outputs-and-losses: Match the head to the task | Extended the explanation: MSE on a sigmoid output is a poor choice for classification: when the sigmoid saturates, MSE's gradient is multiplied by σ′ ≈ 0 and learning stalls, while binary cross-entropy cancels σ′ and leaves a gradient of p − y. | Vanishing gradients with MSE on sigmoid outputs (Prelim Q262) were missing. |
| 29 | edit-concept | large-language-models/fine-tuning-and-lora: Low-rank updates | Extended the explanation: Full fine-tuning is costly and can cause catastrophic forgetting of general abilities, which LoRA reduces by leaving W frozen. In practice the Hugging Face peft library adds LoRA adapters to a model in a few lines. | Catastrophic forgetting moved here when the prompting/RAG/fine-tuning chooser moved to the RAG module; the IOAI contest image ships peft. |
| 30 | edit-concept | final-lab-pytorch/task-attention: Scaled dot-product attention | Extended the explanation: Mask with mask == 0 (1 means keep). On a fully masked row −inf gives NaN after softmax, while −1e9 gives a harmless uniform row and still makes masked weights exactly 0 in float32; softmax must run over dim=-1. | Mask polarity and −inf versus −1e9 are documented Task 3 pitfalls. |
| 31 | edit-concept | final-lab-pytorch/task-attention: Multi-head attention module | Extended the explanation: Skipping transpose(1, 2) gives the right shape but the wrong numbers (tokens mix across heads), which only hidden value tests catch; .view after .transpose needs .contiguous() first, or use .reshape. | The silent head-mixing bug and the contiguous error are documented Task 3 pitfalls. |
| 32 | edit-concept | final-lab-pytorch/task-pe-classifier-mask: Fixing positional encoding | Extended the explanation: Store the table with self.register_buffer('pe', pe) so it moves to the GPU with the model and is saved, but is never trained; a plain attribute stays on the CPU and fails the notebook's GPU-transfer test. | register_buffer is required by Task 3 and was not mentioned in its walkthrough. |
| 33 | edit-concept | final-lab-pytorch/task-pe-classifier-mask: Classifier head and mask conversion | Extended the explanation: Handle attention_mask=None too, because the tests also call model(input_ids). Plain mean pooling (as in the official solution) also averages padding tokens; masked mean pooling, (x * m).sum(1) / m.sum(1), does not. | The None-mask path and the padding-in-mean-pooling issue are documented Task 3 pitfalls. |
| 34 | edit-concept | pretrained-models-text-speech/bert-and-gpt: Next-token probabilities | Extended the explanation: Generating text one token at a time, each conditioned on all the tokens before it, is called autoregressive generation, so GPT is an autoregressive decoder while BERT is a bidirectional encoder. | The term 'autoregressive' (2025 MCQ Q20, 2026 Prelim Q213, Q220, Q228) never appeared in the curriculum although the idea was taught. |
| 35 | edit-concept | text-as-data/rnns-and-lstms: LSTM gates | Extended the explanation: This is why LSTMs (and GRUs, a simpler two-gate variant) capture long-term dependencies that plain RNNs forget; Transformers go further by attending directly to any earlier position. | 'Long-term dependencies' (Prelim Q209, Q267) was not named as the problem LSTMs solve. |
| 36 | edit-concept | convolutional-networks/pooling-and-receptive-field: Pooling summarises neighbourhoods | Extended the explanation: This is called approximate translation invariance; convolution itself is translation equivariant (a shifted input gives a shifted feature map). | Translation invariance versus equivariance (Prelim Q188) was described but not named. |
| 37 | edit-concept | text-as-data/word-embeddings: The embedding space | Extended the explanation: Cosine similarity between two embeddings is the standard measure of semantic similarity. | 'Semantic similarity' (Prelim Q206) was not named. |
| 38 | move-concept | large-language-models/fine-tuning-and-lora -> prompting-and-rag/rag-pipeline: 'Prompting, RAG or fine-tuning?' | Moved the chooser concept (with its AdaptationChooser visual) into the RAG pipeline lesson; fine-tuning-and-lora is now 18 min with 2 concepts and rag-pipeline 22 min with 3. | Prerequisite order: the concept asked students to choose RAG one module before RAG was taught. |
| 39 | dedupe | model-evaluation/regression-and-overlap-metrics | Narrowed the IoU concept to box IoU and the Jaccard index (with the A + B − overlap method and a threshold slider); removed the mask tab, mean IoU and the absent-class rule, which now live only in vision-tasks/segmentation-metrics and the Final lab. | Mask IoU, mean IoU and the 0/0 rule were taught in three places (model-evaluation, vision-tasks, final-lab-pytorch). |
| 40 | dedupe | ml-systems-and-tradeoffs/compute-and-memory-tradeoffs | Rewrote 'What fills the GPU' as 'Choosing the cheapest out-of-memory fix' (component GPUMemoryStack renamed OOMFixTradeoffs) so it builds on pytorch/devices-and-common-errors instead of repeating its memory budget; added activation checkpointing cost. | The two concepts had the highest cross-module overlap in the curriculum (Jaccard 0.37), and Prelim Q274 needs the ranking of OOM fixes, not the list of what fills memory. |
| 41 | sharpen-visuals | past-paper-walkthroughs (4 lessons), prelim-speed-toolkit/drill-linear-algebra, final-lab-pytorch/practice-set | Renamed the three identical 'Worked walkthroughs' concepts and specified exactly which real questions each embeds (7 maths/computing, 7 AI/GenAI, 5 Final MCQs, 6 scenarios; every number checked against the paper data), gave TrendHeatmap real counts, made PatternCards and the dot/norm drill concrete (TimedDrill renamed DotNormDrill), and replaced the PredictionMatrix of invented probabilities with an evidence matrix. | These were the vaguest visual specs in the curriculum (generic steppers with no named content), three concepts shared one name, and one visual implied made-up likelihoods. |
| 42 | fix-references | 12 lessons in ai-first-look, python-basics, python-toolkit, numpy, calculus-and-gradient-descent | Renumbered 32 past-paper question numbers (31 references) in checkpoint_focus (for example "IndexError causes (cf. Q137)" is now Q126); every new number was checked against the question text. | They used the Google-Form item numbers (assessment number + 11), so on the site they would point at the wrong 2026 Prelim questions. |
| 43 | rename | final-lab-numpy: two concepts named "Implementation walkthrough" | Renamed them 'Gradient descent implementation walkthrough' and 'K-means implementation walkthrough'. | Concept names are used as headings and anchors and must be unique within a module. |

## Scorecard of the three source designs

| Criterion | A | B | C2 |
|---|---|---|---|
| Beginner accessibility | 9 | 6 | 7 |
| NOAI exam coverage | 7 | 9 | 8 |
| IOAI syllabus coverage | 7 | 7 | 10 |
| Visual specs (insight and implementability) | 8 | 7 | 9 |
| Sequencing and prerequisites | 9 | 7 | 7 |
| Lesson sizing | 8 | 8 | 9 |
| **Total (out of 60)** | **48** | **44** | **50** |

- **Beginner accessibility.** A: no-code "first look" module before any code, then Python in small steps and maths just in time. B: Python, NumPy and six maths modules before the first model, with terse explanations and ASCII maths (theta, lambda). C2: excellent visual-first explanations, but opens with five maths modules before any code or ML.
- **NOAI exam coverage.** Share of past-paper concept phrases (340 questions, 2025 to 2026) matched inside a single lesson: A 0.770, B 0.807, C2 0.804. Questions with every concept matched: A 0.47, B 0.52, C2 0.53. B adds timed drills for each domain, walkthroughs paper by paper, a code-debugging module and separate NumPy and PyTorch Final labs. A and C2 each fit all six Final tasks into one module, and C2 fits all three 2025 tasks into one lesson.
- **IOAI syllabus coverage.** C2 maps every IOAI 2026 item: HuBERT, Whisper, Qwen-Audio and Voxtral; self-supervised vision; YOLO, SSD and DETR; Hugging Face; forward-fill; sliding windows; patching. A has one audio lesson and no self-supervised vision. B covers audio in two concepts, mentions self-supervision only inside a ViT concept, and has little hands-on toolkit material.
- **Visual specs (insight and implementability).** C2 specs are the most concrete: linked panels, exact toy numbers, and a stated "aha" that each visual earns. B reuses generic drill and walkthrough components. A and B each repeat one component three times inside a single exam module (PastPaperExplorer, PastPaperWalkthrough).
- **Sequencing and prerequisites.** A teaches maths just before it is used: vectors before NumPy, calculus before regression, deeper linear algebra before PCA. B teaches six maths modules (including eigenvectors, SVD and second-order methods) before any ML, and only introduces pandas and preprocessing after the first regression module. C2 front-loads all the maths, teaches ViT before attention, and places algorithms after Transformers because of one lesson.
- **Lesson sizing.** All three designs use 10 to 25 minutes and 2 to 4 concepts per lesson. C2 has the most even granularity. B packs 3 to 4 concepts into many 12 to 15 minute lessons (456 concepts in total). A overloads its exam lessons, and all three use digits in some lesson slugs.

## Rationale

VERDICT. C2 is the strongest base. It has the best concept content, the most implementable visual specs, and complete IOAI 2026 syllabus coverage. It also has two weaknesses: a maths-first order that delays any code or ML for five modules, and a thin exam part. A has the best order for a complete beginner, and B has the best exam part. The final curriculum therefore uses A's sequencing, C2's content and B's exam machinery. It was assembled programmatically by copying lessons and concepts from the three designs and then editing them: 112 lessons come from C2, 22 from B and 18 from A, and 21 merge pieces of several designs. Of the 473 concepts, 317 are C2's, 81 are B's and 54 are A's. SEQUENCE. (0) Orientation, then a no-code first look at how machines learn: fit a line by hand, roll down a loss curve, classify with neighbours. (1) Python from the first print statement to classes and debugging, then algorithms and Big-O. (2) Maths and tools in the order they are used: vectors and matrices just before NumPy, probability just before pandas. (3) Classical ML. ML foundations and data processing come first, then calculus and gradient descent just before regression. Likelihood and entropy are taught inside classification, where cross-entropy needs them, and deeper linear algebra (rank, eigenvectors, SVD) just before PCA and clustering. (4) Neural networks, backprop by hand, PyTorch, then optimisers (SGD, Adam, schedules) and training tricks, where they are used. (5) Vision. ResNets are folded into the CNN module, and transfer learning, augmentation, detection, U-Net and mean IoU follow. (6) Text, attention and pretrained text and speech models. (7) GenAI: LLMs, prompting and RAG, generative models, then multimodal. ViT and self-supervised vision moved here from C2's vision part, so they now come after attention. (8) Debugging (C2's diagnosis lessons plus B's shape, PyTorch-gotcha and gradient-norm material) and ML systems, including the compute cost of ML operations. (9) Exam. Prelim pacing, elimination and no-calculator drills by domain, with anchor values, conv and parameter arithmetic, code reading and mocks. Then walkthroughs of the 2026 Prelim, the 2026 Final MCQs and the 2025 paper. Then two Final labs that rebuild all six past tasks one lesson each: 2025 GD regression, K-means and RAG, and 2026 gradient boosting, U-Net centre-crop, mean IoU, attention, and positional encoding with the causal mask. The labs end with a practice set and lead into a road-to-IOAI module. Every prerequisite points to an earlier module. The Final labs list only content prerequisites, so students can start them before the Prelim. This matters because the Final comes only two weeks after the Prelim. GRAFTS AND FIXES. Added to fill past-paper gaps: eligibility and registration; the mutable-default trap; strides; multiprocessing vs the GIL; outliers and the IQR rule; plotting with matplotlib and seaborn (a new concept); Laplace smoothing; losses as negative log-likelihoods; F1 as a harmonic mean; the accuracy paradox; tuning on the test set; feature importance; XGBoost, LightGBM and CatBoost; QR and Frobenius norms; batched matmul and choosing dim; gradient accumulation and state_dict; flat vs sharp minima; Adam's first and second moments; label smoothing; universal approximation; DDPM as a Markov chain; TorchScript; versioning and registries; "no free lunch". Other fixes: the 2026 positional-encoding note now names the real intended bug (a missing log, which makes 253 of 256 frequencies underflow to zero); cross-references that pointed to modules that no longer exist were rewritten; every slug is free of digits; all 473 visual component names are unique across the whole course, not just within each module. TOTALS (after the critic pass below): 39 modules, 178 lessons, 498 concepts, about 57 hours. That is about 3.2 hours a week over the 18 weeks to the Prelim. Validated: schema, contiguous orders, prerequisite order, taxonomy slugs, 10 to 25 minutes, 2 to 4 concepts and 2 to 4 objectives per lesson, and unique component names. Matched past-paper concept phrases rise to 0.820, and questions with every concept matched to 0.55. CRITIC PASS. An adversarial completeness audit then checked the curriculum against all 340 past-paper questions (concept tags and stems), the 60 IOAI 2026 syllabus items, the official NOAI areas and the six Final programming tasks, and fixed what it found; every change is listed in critic_changes. The biggest gap was beginner maths notation: nothing taught f(x), exponent rules, e, logarithms or Σ notation, so a maths warm-up module now opens the toolkit part. Other gaps closed: pandas cleaning (fillna, dropna, interpolate); abstract base classes and register_buffer (both required by the 2026 Final); complete-case analysis; image normalisation; product and quotient rules; the matrix-form backward pass; simultaneous updates and the 1/m convention for the 2025 Final; Adagrad, LARS, autocast, 1cycle, ReduceLROnPlateau, orthogonal and output-bias initialisation, special-token truncation, proxy metrics; the Q2.1b written answer, the broken mIoU self-check and the gradient-boosting scaffold traps; and input gradients for IOAI-style adversarial tasks. Structural fixes: the prompting/RAG/fine-tuning chooser moved after RAG, IoU and GPU-memory duplication removed, vague exam visuals made concrete, and 32 past-paper question numbers corrected (they used Google-Form item numbers, 11 higher than the assessment numbers). On the critic's phrase matcher (lesson text including visual specs), past-paper concept phrases matched inside one lesson rose from 0.827 to 0.857 and fully matched questions from 0.57 to 0.63; the remaining unmatched phrases were reviewed by hand and are taught under different wording.
