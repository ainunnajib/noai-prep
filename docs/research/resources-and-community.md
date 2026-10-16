# NOAI prep: learning resources, student insights and visual-explainer inspiration

*Compiled Wed 14 Oct 2026 for a free beginner-friendly NOAI 2027 study site. Companion to `official_facts.md` (format facts are not repeated here).*

**NOAI 2027 at a glance** (verified in `official_facts.md`)
- **Prelim:** Fri 19 Feb 2027. 150 MCQs in 90 minutes, about 36 s each. No calculator, no negative marking.
- **Final:** Fri 5 Mar 2027. 20 MCQs plus 3 Python programming tasks in Jupyter.

**Confidence tags**
- **[V]** I verified it myself on the live page or file today.
- **[S]** It comes from a single secondary source.
- **[I]** It is my inference.
- **[A]** It is my own analysis of official past papers. The scripts and data are in `work/rc/`.

---

## 0. Ten takeaways for the curriculum and website

1. **The official list is a starting point, not a path.**
   - The NOAI page levels the resources (Beginner to Advanced), but it does not sequence them, map them to the five Prelim domains, or cover the Prelim's GenAI and Problem-Solving content well.
   - Three of its links are also mislabelled (§1d).
2. **Several flagship resources teach TensorFlow/Keras.** These are Andrew Ng's ML and DL Specializations and the CS50 AI neural-network projects.
   - The NOAI 2026 Final tasks used NumPy and PyTorch only (sklearn was banned in Task 2).
   - IOAI 2026 rules state "TensorFlow and Keras are NOT available".
   - So the site should pair the concept videos with PyTorch practice. [V]
3. **The 2026 Prelim was mostly fast conceptual recall, not calculation.** [A]
   - The median question, stem plus all four options, was only 138 characters.
   - Only 11 of 300 questions had all-numeric options, and all of those were one-step mental maths: dot product, L2 norm, z-score, mean and median.
   - Only about 11 involved reading code.
   - Train **breadth plus instant recall**: flashcards, spaced repetition, and timed sets.
4. **The 2026 Prelim ran in domain blocks, and the last block was slow.** [A]
   - Q1–60 Maths, Q61–119 Computing, Q120–178 AI/ML/DL, Q179–237 GenAI, Q238–300 Problem-Solving.
   - Q271–300 were long scenario questions, with a median of 430 characters (26 of 30 over 300 characters).
   - Students who pace evenly run out of time exactly where reading load peaks.
5. **NOAI Finals reward implementing classic algorithms from scratch in NumPy or PyTorch inside a scaffolded notebook.**
   - 2025: gradient-descent linear regression, K-means, RAG.
   - 2026: gradient boosting, U-Net padding fix and mean IoU, attention.
   - Every core module should end in a "from scratch, with tests" exercise.
6. **First-hand NOAI write-ups are very scarce.** I found one finalist blog, quotes from NTU, NYP and MOE articles, and accounts from other countries' IOAI teams. No r/SGExams or LinkedIn threads could be retrieved (§3.1).
   - The site's strategy advice must lean on past-paper evidence.
7. **The most effective visual explainers share five traits:**
   - direct manipulation;
   - instant feedback;
   - linked views (formula ↔ picture ↔ numbers);
   - a real model or real data;
   - step-through controls.
   - We should build small widgets in that style for every NOAI-tested algorithm (§4).
8. **Test-wiseness pattern in 2026, to avoid in our own question bank.** [A]
   - In the official self-assessment answer key, the uniquely longest option was correct **80%** of the time (221/276). It was 95% in GenAI.
   - Options starting with absolute words ("Always", "Never", "Only", "Cannot", …) were correct only **1 time in 69**.
   - The 2025 MCQs showed the same bias (10/14).
   - Our mock questions should balance option lengths so students learn content, not cues.
9. **The best free practice beyond the past papers:**
   - AICC (monthly IOAI-style contests run by IOAI alumni, endorsed on the NOAI page);
   - the IOAI Education Hub's archive of national-olympiad problems;
   - open-cu/awesome-ioai-tasks.
10. **Plan the calendar.** There are 18 weeks to the Prelim, and the year-end school holidays are the main study block (§2). Show a week-by-week plan with checkpoints.

---

## 1. Official resources

### 1a. NOAI "Learning Resources" page list

Source: https://noai.aisingapore.org/learning-resources/, modified 13 Oct 2026. The page says the resources are "illustrative rather than exhaustive" and "abstracted from" the IOAI sheet. Lengths and details were checked on each provider's page on 14 Oct 2026 [V] unless tagged.

**Python foundations**

**AI Python for Beginners** (DeepLearning.AI, Andrew Ng)
- **NOAI level:** Beginner.
- **Covers:** Python fundamentals taught alongside an AI chatbot helper. Variables, lists, dictionaries, loops, functions, files, data analysis and visualisation, and calling LLM APIs.
- **Length / format / cost:** 11 h 30 min. 35 video lessons, 27 code examples, 8 graded assignments. Free to enrol; the certificate needs Pro.
- **Framework:** Python, in-browser notebooks.
- **Real entry level:** Absolute beginner.
- **Fits at:** Stage 0, first contact with code.
- **Caveat:** It leans on an AI assistant, but NOAI bans AI tools. Students must redo the exercises unaided.

**Google's Python Class** (Google for Education)
- **NOAI level:** Beginner.
- **Covers:** Strings, lists, sorting, dicts and files, regular expressions, utilities.
- **Length / format / cost:** About 2 days of material: written lessons, 7 lecture videos (1.1–2.4), and 4 exercise sets (Basic, Baby Names, Copy Special, Log Puzzle). Free.
- **Framework:** Python 3. The docs say the "videos predate Python 3", so check the docs when video code fails.
- **Real entry level:** "Some programming experience". Not a true zero start.
- **Fits at:** Stage 0, fast track for students who already code.
- **Caveat:** Dated videos. Strong on string/list idioms, which helps with "what is the output" MCQs.

**MIT 6.0001 Intro to CS and Programming in Python** (Fall 2016; Bell, Grimson, Guttag)
- **NOAI level:** Beginner.
- **Covers:** Computation, branching and iteration, bisection, functions, tuples/lists and aliasing/mutability, recursion and dicts, testing/debugging/exceptions, OOP, classes and inheritance, Big-O efficiency, searching and sorting.
- **Length / format / cost:** 12 lectures plus Problem Sets 0–5, with slides, code and in-class questions. Free (OCW).
- **Framework:** Python 3.5.
- **Real entry level:** "Little or no programming experience".
- **Fits at:** Stage 0–1. The best zero-start option with computer-science depth.
- **Caveat:** University pace. Lectures 5, 7 and 10–12 map directly to the Prelim's Computing and Debugging questions (aliasing, exceptions, complexity).

**W3Schools Python** (also NumPy and Pandas tutorials, per the IOAI sheet)
- **NOAI level:** Beginner.
- **Covers:** Syntax reference with "Try it Yourself" editors, exercises and quizzes.
- **Length / format / cost:** Short pages, self-paced. Free.
- **Framework:** Python, NumPy, Pandas.
- **Real entry level:** Absolute beginner.
- **Fits at:** Every stage, as a quick look-up.
- **Caveat:** Reference, not a course. Good for Prelim items like `df['total price']` and `np.arange`.

**Broad AI and GenAI**

**CS50's Introduction to AI with Python** (Harvard; Malan, Yu)
- **NOAI level:** Beginner to Intermediate.
- **Covers:** Seven weeks: Search, Knowledge, Uncertainty, Optimization, Learning, Neural Networks, Language. Each week is a lecture plus projects (e.g. Minesweeper, PageRank, Traffic, Attention).
- **Length / format / cost:** 7 weeks at 10–30 h/week, self-paced. Free audit; the edX certificate costs USD 299.
- **Framework:** Python. The Traffic project uses **TensorFlow**; the Attention project uses HF transformers (BERT).
- **Real entry level:** Prerequisite is "CS50x or at least one year of experience with Python". So it is really Intermediate for our users.
- **Fits at:** Stage 2–3. A broad AI survey that is strong on search, probability and optimisation for the Problem-Solving domain.
- **Caveat:** Heavy workload. Use selected weeks (0, 2, 4, 5, 6) rather than all projects.

**Generative AI for Beginners** (Microsoft)
- **NOAI level:** Beginner to Intermediate.
- **Covers:** 21 lessons plus setup, split into "Learn" (concept) and "Build" (code) lessons:
  - intro to GenAI and LLMs, comparing LLMs, responsible AI;
  - prompt engineering, basic and advanced;
  - text and chat apps, embeddings and vector search, image generation;
  - function calling, UX, security, LLMOps;
  - RAG, open-source models and HF, agents, fine-tuning, SLMs, Mistral and Meta models.
- **Length / format / cost:** 21 short lessons (videos plus README). Free (GitHub).
- **Framework:** Python and TypeScript. The Build lessons need an API (Azure OpenAI, OpenAI, or Microsoft Foundry); the README notes "GitHub Models is retiring at the end of July 2026".
- **Real entry level:** Beginner for the Learn lessons; the Build lessons need API keys.
- **Fits at:** Stage 4, GenAI domain. Read Learn lessons 01–05, 08, 13, 15 and 18 for Prelim recall; skip app-building.
- **Caveat:** App-builder oriented. Not much on GANs or diffusion, which do appear in the Prelim.

**Hugging Face Agents Course**
- **NOAI level:** Beginner to Intermediate.
- **Covers:**
  - Unit 0: onboarding.
  - Unit 1: intro to agents (tools, thought-action-observation).
  - Unit 2: frameworks (smolagents, LlamaIndex, LangGraph).
  - Unit 3: agentic RAG.
  - Unit 4: final project.
  - Bonus units: function-calling fine-tuning, observability, Pokémon agents.
- **Length / format / cost:** Self-paced units. Free, with optional certification.
- **Framework:** Python, HF.
- **Real entry level:** Needs basic Python plus basic LLM knowledge.
- **Fits at:** Stage 4, optional.
- **Caveat:** Lowest NOAI value; agents are not in the IOAI syllabus. Unit 1 concepts are enough for GenAI MCQs.

**Classical ML and deep learning**

**Machine Learning Specialization** (DeepLearning.AI and Stanford, Andrew Ng)
- **NOAI level:** Intermediate.
- **Covers:**
  - C1: linear and logistic regression, gradient descent, overfitting and regularisation.
  - C2: neural networks, activations, multiclass, bias/variance, ML development process, decision trees, tree ensembles (random forest, XGBoost).
  - C3: clustering (K-means), anomaly detection, recommenders, PCA, reinforcement learning.
- **Length / format / cost:** 3 courses, listed as 94 h 58 min, 151 video lessons. At 5 h/week, about 3 + 4 + 3 = 10 weeks. Free audit (no certificate). The outline shows "End of Access to Lab Notebooks" items, so audit lab access may be limited.
- **Framework:** NumPy, scikit-learn, **TensorFlow**.
- **Real entry level:** Beginner-friendly maths.
- **Fits at:** Stage 2. **The best single fit for NOAI Final-style tasks** (GD regression, K-means, trees, ensembles).
- **Caveat:** Re-implement every lab in NumPy and PyTorch.

**Deep Learning Specialization** (Ng, Katanforoosh, Bensouda Mourri)
- **NOAI level:** Intermediate.
- **Covers:**
  - C1: neural networks and DL.
  - C2: improving DNNs (initialisation, regularisation, dropout, BatchNorm, optimisers, tuning).
  - C3: structuring ML projects.
  - C4: CNNs (ResNet, detection/YOLO, U-Net, face recognition, neural style transfer).
  - C5: sequence models (RNN, LSTM, word embeddings, attention, Transformers).
- **Length / format / cost:** 5 courses, listed as 127 h 29 min, 194 video lessons. At 5 h/week, about 5 weeks per course and 4 for C3, roughly 24 weeks. Free audit.
- **Framework:** NumPy, **TensorFlow/Keras**.
- **Real entry level:** Needs Python and basic ML.
- **Fits at:** Stage 3–4. C1, C2, C4 and C5 map onto NN/DL, CV and NLP.
- **Caveat:** Too long to finish before Feb 2027 alongside school. Watch selectively at 1.5x and practise in PyTorch.

**University-level ML and AI**

**MIT 6.034 Artificial Intelligence** (Fall 2010, Patrick Winston)
- **NOAI level:** Intermediate to Advanced.
- **Covers:** Rule-based systems, search (DFS/BFS, A*), games (minimax, alpha-beta), constraints, identification trees, nearest neighbours, neural nets, genetic algorithms, SVMs, boosting, probabilistic inference.
- **Length / format / cost:** About 23 lectures plus "mega-recitations", tutorials, quizzes and exams. Free (OCW). Lecture count per OCW listing [S].
- **Framework:** Python (problem sets).
- **Real entry level:** Gentle concepts, but 2010-era.
- **Fits at:** Stage 2 supplement for the Problem-Solving and Algorithms domain. Also the Final MCQ "AI Problem-Solving" theme.
- **Caveat:** Dated (no deep learning era). Use the search, games, trees and boosting lectures only.

**MIT 6.036 Intro to Machine Learning** (Fall 2020; Kaelbling, Lozano-Pérez, Chuang, Boning)
- **NOAI level:** Intermediate to Advanced.
- **Covers:** Formulating learning problems, linear classifiers and the perceptron, features, logistic regression, gradient descent, regression and regularisation, neural nets, CNNs, sequential models/RNNs, RL, trees and nearest neighbours, clustering.
- **Length / format / cost:** A full-semester course in the Open Learning Library; usable without enrolling. Free. The current MIT successor, 6.390, has open notes at https://introml.mit.edu/notes/.
- **Framework:** Python, NumPy.
- **Real entry level:** Needs vectors, matrices and derivatives.
- **Fits at:** Stage 4–5. Mathematical depth for top Final and IOAI candidates.
- **Caveat:** Math-heavy. Best for students who already finished the Stage 2 ML material.

**Practice**

**AI Community Contest (AICC)**, listed on the NOAI page as extra practice
- **NOAI level:** All levels.
- **Covers:** Monthly IOAI-style contests with community tasks, a practice-task archive, and a roadmap with 11 sections:
  - getting started, PyTorch, how to approach a task, validation, practice tips;
  - ML foundations, deep learning, NLP, CV, audio, advanced topics.
- **Length / format / cost:** Ongoing. Free, no registration. Founded by IOAI alumni including former Team Singapore members.
- **Framework:** PyTorch, scikit-learn.
- **Real entry level:** Intermediate and up.
- **Fits at:** Stage 5 onwards, and the NTU/IOAI stage.
- **Caveat:** The roadmap pages are short. A few of its links are broken or mislabelled, e.g. a Medium "leaderboard shake-up" URL and the "First Create a Baseline" link [V].

**Official past papers**
- **What there is:** 2026 Prelim (300 MCQs, plus an interactive self-assessment tool with an answer key and explanations), 2026 Final (20 MCQs and 3 notebooks), and 2025 (20 MCQs and 3 notebooks).
- **Free:** Yes.
- **Framework:** NumPy, PyTorch, sklearn (per task).
- **Fits at:** Stage 5–6.
- **Use them for:** the mock-exam engine, and as the anchor of every module ("this is how it was asked").

### 1b. IOAI "Educational Resources" sheet

Source: local copy `sources/text/ioai_educational_resources.txt`, i.e. the Google Sheet linked from the NOAI page. The sheet lists 29 items. Where each fits is my recommendation.

**Python**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| AI Python for Beginners (Ng) | Python basics, API programming | Beginner | Stage 0 (see 1a) |
| Python for Everybody (U Michigan), free at py4e.com | Python basics, data structures, web scraping, databases | Beginner | Stage 0 alternative to 6.0001. Slower and friendlier. |
| Google's Python Class | Strings, lists, sorting, dicts, files, regex | Beginner | Stage 0 fast track |
| MIT 6.0001 | Python, computational thinking | Beginner | Stage 0–1 |
| Python Crash Course (Matthes) | Python basics, data structures, file I/O | Beginner | Stage 0. Sample chapters only are free. |
| Think Python (Downey), free | Python, algorithms, debugging | Beginner | Stage 0–1. Its debugging chapters help the Prelim "Debugging" area. |
| Automate the Boring Stuff (Sweigart), free online | Practical Python | Beginner | Stage 0 for motivation. Low exam yield. |

**Data handling**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| W3Schools NumPy and Pandas tutorials | Arrays, operations, dataframes | Beginner | Stage 1 |
| IBM Data Analysis with Python (Coursera, audit) | NumPy, Pandas data analysis | Beginner | Stage 1, optional |

**Classical ML**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| Machine Learning Specialization (Ng, audit) | Supervised and unsupervised learning, best practices | Intermediate | Stage 2 core |
| IBM Machine Learning with Python (Coursera, audit) | scikit-learn: classification, regression, clustering | Beginner–Intermediate | Stage 2 alternative |
| Introduction to ML with Python (Müller & Guido) | scikit-learn | Beginner–Intermediate | Stage 2 reference. Not reliably free. |
| MIT OCW Introduction to Machine Learning | Lecture notes, assignments | Intermediate–Advanced | Stage 4–5 |

**Deep learning**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| Deep Learning Specialization (Ng, audit) | Deep learning | Intermediate | Stage 3–4 |
| Deep Learning with Python (Chollet) | DL concepts, Keras | Intermediate | Concept reading only, since it uses Keras. The 3rd edition chapters are free at deeplearningwithpython.io (listed on the IOAI Education Hub). |
| Intro to Deep Learning with PyTorch (Udacity/Facebook) | DL fundamentals in PyTorch | Intermediate | Stage 3. One of the few PyTorch-first items. Udacity catalogue availability changes, so check. |
| Neural Networks and Deep Learning (Nielsen), free online | NN fundamentals, backprop | Intermediate | Stage 3. Chapter 4 is an interactive slider-based "visual proof" of universality (see §4). |

**Broad AI and GenAI**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| CS50 AI (Harvard) | Search, knowledge, ML, neural networks | Beginner–Intermediate | Stage 2–3 |
| MIT OCW Artificial Intelligence (6.034) | Lecture notes, assignments | Intermediate–Advanced | Stage 2 supplement |
| Elements of AI (U Helsinki) | Non-technical intro to AI, methods, ethics | Beginner | Stage 0 orientation. Its ethics content helps Problem-Solving MCQs. |
| Hands-On Large Language Models (Alammar & Grootendorst) | LLM basics with very visual explanations | Beginner–Intermediate | Stage 4. The book is paid; the code and Alammar's blog are free. |
| Generative AI for Beginners (Microsoft) | GenAI intro | Beginner–Intermediate | Stage 4 |
| HF Agents Course | Agents | Beginner–Intermediate | Stage 4, optional |

**Computer vision and NLP**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| Computer Vision Basics (U Buffalo, Coursera audit) | Image processing, feature detection, matching | Beginner | Stage 3 optional (classical CV) |
| Computer Vision: Algorithms and Applications (Szeliski) | Image processing, recognition | Intermediate–Advanced | Reference only. Free draft. |
| NLTK book (Bird et al.), free | Text processing, classification, tagging, parsing | Beginner–Intermediate | Stage 4 for tokenisation and preprocessing basics. Pre-transformer. |
| Natural Language Processing with Python (NLTK tutorial) | Text processing | Beginner–Intermediate | Same as the NLTK book |

**Mixed: ML, DL, CV and NLP**

| Resource | What it covers | Sheet level | Where it fits / note |
|---|---|---|---|
| Intro to ML notebooks and slides (Ali Sharifi, Sharif Univ.) | Classical ML, DL, CV, NLP | Intermediate | Stage 2–4 notebook practice |

### 1c. Extra official and semi-official hubs worth linking

**IOAI Education Hub**, https://ioai-official.org/resources/ [V]
- The IOAI syllabus, plus the IOAI 2024 and 2025 task repositories.
- Free courses: fast.ai, Google ML Crash Course, MIT 6.S191, Elements of AI, d2l.ai, the Goodfellow DL book, Machine Learning Yearning, Kaggle Learn, PyTorch tutorials, and CS231n/CS224n slides.
- **An archive of other countries' national-olympiad problems.** This includes:
  - Russia's NEOAI tasks on Kaggle and GitHub;
  - Poland's OAI 2024–25, Hungary's HAIO, and Romania's ROAI with a solutions guide;
  - Malaysia's TSP 2025 lab repo, Kazakhstan's TST solutions, and China NOAI 2024 tasks;
  - Benin, Bangladesh BdAIO, Japan JOAI, Serbia, Tunisia, and USA-NA-AIO;
  - a "Singapore Team Selection" repo for IOAI 2024 and 2025.
- This is the richest free source of IOAI-style practice.

**IOAI 2026 task repo**, https://github.com/IOAI-official/IOAI-2026
- 3 at-home and 6 on-site tasks (per open-cu/awesome-ioai-tasks).

**open-cu/awesome-ioai-tasks**, https://github.com/open-cu/awesome-ioai-tasks
- IOAI tasks by year, with solutions and team-selection tasks.

**IOAI Australia resources**, https://ioai.org.au/index.php/resources/
- A compact 10-link list: Python, PyTorch, CS229 lectures, the Deep Learning Specialization, Jurafsky SLP3, word2vec, UvA DL transformer notebooks, minGPT, CS231n, and UvA DL notebooks.

### 1d. Problems spotted in the official list (fix these on our site)

- **The NOAI page has mislabelled links** [V].
  - The second "AI Python for Beginners" entry links to MIT 6.0001.
  - "Introduction to CS and Programming in Python | MIT" links to W3Schools.
  - A second "Google's Python Class" entry also links to W3Schools.
  - Our site should use the correct URLs listed in §1a.
- **Framework mismatch.** ML Spec, DL Spec, CS50 AI (Traffic project) and Chollet all use TensorFlow/Keras. NOAI Finals use NumPy and PyTorch, and IOAI forbids TF/Keras. Add a "PyTorch translation" box to each module.
- **Prerequisites are understated.**
  - CS50 AI needs about a year of Python.
  - The Google Python Class assumes prior programming.
  - The MIT 6.036 and 6.034 courses are university level.
- **Prelim domains are poorly covered by the list.**
  - **Mathematics:** no maths resource is listed at all.
  - **GenAI:** GANs, diffusion and evaluation metrics have little coverage.
  - **Problem-Solving:** training-debugging scenarios are not covered (NaN loss, OOM, LR warmup, data drift, gradient accumulation; see 2026 Q271–300).
  - Add 3Blue1Brown and Seeing Theory for maths.
  - Add Karpathy's "A Recipe for Training Neural Networks" (https://karpathy.github.io/2019/04/25/recipe/) and Google's Deep Learning Tuning Playbook (https://developers.google.com/machine-learning/guides/deep-learning-tuning-playbook) for debugging scenarios.
- **Free audit limits.** DeepLearning.AI and Coursera audit is free, but certificates (and possibly some graded labs) are paid. Tell students they do not need certificates.

---

## 2. Recommended learning path using free resources

**Design principles**
- Each stage has five parts:
  1. one primary resource, to reduce choice overload;
  2. one visual explainer;
  3. one from-scratch coding output;
  4. a timed MCQ check;
  5. an exit test.
- Two entry tracks:
  - **Zero track:** never coded before. Starts at Stage 0.
  - **Coder track:** already comfortable with Python. Skims Stage 0 and starts Stage 1 in week 2.
- Weekly hours:
  - 4–6 h during term (secondary and JC students have Oct exams and promos);
  - 10–15 h in the year-end holidays (late Nov–Dec);
  - 6–8 h in Jan–Feb.
- There are 128 days (about 18 weeks) from 14 Oct 2026 to the Prelim, then 14 days to the Final. The weeks below start on Mondays.

### Stage table

**Stage 0: Start coding** (Wk 1–3, 19 Oct–8 Nov)
- **Goal:** Write and trace basic Python unaided: types, lists and dicts, loops, functions, slicing, aliasing, exceptions.
- **Primary resource:**
  - Zero track: AI Python for Beginners, then MIT 6.0001 Lectures 1–7.
  - Coder track: Google's Python Class.
  - W3Schools for look-ups.
- **Visual explainers:** Python Tutor (step-through memory diagrams); VisuAlgo for sorting.
- **Output:** 20 "predict the output" snippets, done without running them. FizzBuzz-level functions.
- **Exit check:** 15 Computing MCQs in 9 minutes.

**Stage 1: Data tools plus maths for ML** (Wk 3–6, 2–29 Nov)
- **Goal:**
  - NumPy arrays, shapes, broadcasting, indexing; Pandas selection and groupby.
  - Vectors, dot product, norms, matrix multiplication, shapes, transpose, rank, determinant, eigen-intuition.
  - Derivatives, the chain rule, the sigmoid derivative.
  - Probability, Bayes, mean/median/variance, z-scores, normal 68-95-99.7.
  - Entropy and cross-entropy.
- **Primary resource:**
  - W3Schools NumPy/Pandas, Kaggle Learn Pandas, Jay Alammar's Visual NumPy.
  - 3Blue1Brown *Essence of Linear Algebra* and *Essence of Calculus*.
  - Seeing Theory chapters 1–3 and 5.
  - colah's Visual Information Theory.
- **Visual explainers:** Pandas Tutor; setosa.io eigenvectors and PCA; 3b1b; Seeing Theory; matrixmultiplication.xyz.
- **Output:**
  - A NumPy notebook: implement mean, var, z-score, cosine similarity, softmax and matrix multiply by hand, then check against NumPy.
  - A mental-maths drill sheet.
- **Exit check:** 30 Maths MCQs in 15 minutes with no calculator.

**Stage 2: Classical ML** (Wk 6–10, 23 Nov–27 Dec, holidays)
- **Goal:**
  - Supervised vs unsupervised learning.
  - Linear and logistic regression with gradient descent.
  - Losses, train/val/test splits, cross-validation, over- and underfitting, regularisation.
  - kNN, decision trees, random forests, boosting, SVM idea.
  - K-means, DBSCAN, PCA, t-SNE.
  - Metrics: confusion matrix, precision, recall, F1, ROC-AUC.
- **Primary resource:**
  - ML Specialization C1–C3 (audit), or Google ML Crash Course for speed.
  - Kaggle Learn Intro and Intermediate ML.
  - CS50 AI weeks 0, 2 and 4 for search, uncertainty and learning.
- **Visual explainers:** MLU-Explain (linear and logistic regression, trees, random forest, bias-variance, CV, precision-recall, ROC); R2D3; Naftali Harris k-means and DBSCAN; Rogozhnikov's gradient-boosting demo; distill t-SNE.
- **Output:** From scratch in NumPy, with tests:
  - GD linear regression (NOAI 2025 Q1);
  - logistic regression;
  - kNN;
  - K-means (NOAI 2025 Q2);
  - a depth-limited decision stump;
  - gradient boosting using a sklearn `DecisionTreeRegressor` (NOAI 2026 Task 1);
  - confusion-matrix metrics.
- **Exit check:** 30 AI/ML MCQs in 15 minutes, plus the NOAI 2025 Q1 and Q2 notebooks, timed.

**Stage 3: Neural networks and PyTorch** (Wk 10–13, 21 Dec–17 Jan)
- **Goal:**
  - Perceptron and MLP, activations, forward pass, backprop and the chain rule, losses (MSE, BCE, CE).
  - Optimisers: SGD, momentum, Adam/AdamW; LR schedules and warmup.
  - Initialisation, BatchNorm, dropout, early stopping.
  - PyTorch tensors, autograd, `nn.Module`, the training loop, `zero_grad`, devices.
  - CNNs: convolution, padding and stride arithmetic, pooling, ResNet skip connections, U-Net, IoU, augmentation.
- **Primary resource:**
  - PyTorch "Learn the Basics" and the 60-Minute Blitz.
  - d2l.ai chapters 2–8 (each does it from scratch, then the concise way).
  - DL Specialization C1, C2 and C4 videos (concepts only).
  - Karpathy's micrograd / Zero to Hero lecture 1.
- **Visual explainers:** TensorFlow Playground; 3b1b Neural Networks (chapters on gradient descent and backprop); distill Momentum; CNN Explainer; setosa image kernels; conv_arithmetic GIFs; Adam Harley's 3D CNN visualisation.
- **Output:**
  - An MLP from scratch in NumPy, including backprop.
  - The same MLP in PyTorch.
  - A tiny CNN on MNIST/CIFAR on CPU.
  - `center_crop` for U-Net skip connections plus mean IoU without sklearn (NOAI 2026 Task 2).
- **Exit check:** 30 NN/DL/CV MCQs in 15 minutes, plus the 2026 Task 2 notebook, timed.

**Stage 4: NLP, Transformers and GenAI** (Wk 13–15, 11–31 Jan)
- **Goal:**
  - Tokenisation (BPE/WordPiece), embeddings (word2vec, cosine similarity), RNN/LSTM idea.
  - Attention: Q/K/V, scaled dot-product, masking, multi-head, positional encoding.
  - BERT vs GPT, pre-training vs fine-tuning (full and PEFT/LoRA).
  - Decoding: temperature, top-k, top-p.
  - RAG and vector search; prompt engineering.
  - LLM evaluation: perplexity, BLEU/ROUGE, hallucination.
  - GANs, VAEs, diffusion (forward and reverse, classifier-free guidance), CLIP and ViT.
  - Audio basics: spectrogram, Whisper idea.
- **Primary resource:**
  - Jay Alammar's Illustrated Word2vec, Transformer, BERT, GPT-2 and Stable Diffusion.
  - The HF LLM Course chapters 1–3.
  - Microsoft GenAI for Beginners Learn lessons.
  - DL Specialization C5 (attention videos).
  - 3b1b attention and transformer lessons.
- **Visual explainers:** Transformer Explainer; bbycroft LLM viz; Embedding Projector; tiktokenizer; GAN Lab; Diffusion Explainer; Chrome Music Lab Spectrogram.
- **Output:**
  - Scaled dot-product and multi-head attention in PyTorch with a causal mask (NOAI 2026 Task 3).
  - NumPy-only TF-IDF/embedding retrieval plus prompt assembly, i.e. RAG (NOAI 2025 Q3).
- **Exit check:** 30 GenAI MCQs in 15 minutes, plus the 2026 Task 3 and 2025 Q3 notebooks, timed.

**Stage 5: Exam mode for the Prelim** (Wk 15–18, 25 Jan–19 Feb)
- **Goal:**
  - Problem-Solving scenarios: diagnose training failures, choose metrics for imbalance, data leakage and drift, OOM fixes, LR schedules, ethics and bias.
  - Full timed mocks.
- **Primary resource:**
  - The official 2026 Prelim self-assessment tool, done as two timed halves of 150.
  - Our mocks.
  - Karpathy's training recipe; the Google Tuning Playbook.
  - MLU-Explain Equality of Odds; PAIR explorables (fairness).
- **Visual explainers:** A "pacing coach" widget on our site (§3.4).
- **Output:**
  - 2 full 150-in-90 mocks per week.
  - An error log, re-drilled with spaced repetition.
- **Exit check:** Score at least 70% on unseen mocks with 5+ minutes to spare. This target is my guess at what is competitive [I].

**Stage 6: Final prep** (20 Feb–5 Mar)
- **Goal:** The 3-hour format: 20 MCQs in about 30 minutes, then 3 notebooks in about 150 minutes, offline, with no AI autocomplete.
- **Primary resource:** The NOAI 2025 and 2026 Final notebooks (github.com/AISGNUSNOAI) and the 2026 Final 20-MCQ PDF.
- **Visual explainers:** Our widgets for review.
- **Output:** Two full timed Final simulations.
- **Exit check:** All three tasks attempted, with marks banked in every part.

**Stage 7: After NOAI, if top 60** (Apr–Jun 2027)
- **Goal:**
  - IOAI level: fine-tuning, PEFT, CLIP, diffusion, detection (YOLO/DETR), self-supervised learning, audio (HuBERT, Whisper).
  - Kaggle-style experimentation and validation discipline.
- **Primary resource:**
  - The IOAI syllabus, IOAI 2024–26 tasks, AICC contests, and the IOAI Education Hub national-olympiad archive.
  - CS231n and CS224n; MIT 6.390 notes; HF Audio and CV courses.
- **Visual explainers:** distill Feature Visualization and Activation Atlas.
- **Output:** One AICC contest per month; one IOAI past task per week.
- **Exit check:** NTU Selection Test, 8 May 2027.

### Domain → best free resource map for the Prelim

There are five domains, about 30 questions each if the 2026 split holds [I].

**Mathematics**
- **Prelim focus seen in 2026** [A]: matrix shapes, transpose, rank, determinant, eigenvalues and singularity; norms and dot products; derivatives including sigmoid, the chain rule and gradients; Hessians and convexity; Newton's method; mean, median, variance, z-score, normal %; Bayes and independence; F1; entropy.
- **Learn from:** 3b1b Linear Algebra and Calculus; Seeing Theory; Khan Academy-level drills; colah's Visual Information Theory; d2l ch. 2.
- **Practise with:** 2026 Q1–60; our mental-maths drills.

**Computing**
- **Prelim focus seen in 2026:** Python types and outputs, complexity, data structures, SQL/DB basics, NumPy (arange, broadcasting, vectorisation), Pandas (column selection, groupby, missing values), PyTorch (`requires_grad`, `.to(device)`, `backward`, `zero_grad`).
- **Learn from:** MIT 6.0001; W3Schools; Kaggle Pandas; PyTorch Learn the Basics; Python Tutor; Pandas Tutor.
- **Practise with:** 2026 Q61–119; Tensor Puzzles.

**AI/ML/DL**
- **Prelim focus seen in 2026:** algorithm choice, overfitting, metrics, CNN layers, RNNs, NLP basics, backprop purpose.
- **Learn from:** ML Spec C1–C3; MLU-Explain; CNN Explainer; d2l.
- **Practise with:** 2026 Q120–178; 2025 MCQs; 2026 Final MCQs.

**Generative AI**
- **Prelim focus seen in 2026:** LLM basics, BERT vs GPT, tokenisation, positional encoding, fine-tuning, decoding, diffusion (latent, forward/reverse, CFG), GANs, ViT, CLIP, multimodal cross-attention, evaluation.
- **Learn from:** Jay Alammar; Transformer Explainer; HF LLM Course; MS GenAI Learn lessons; GAN Lab; Diffusion Explainer.
- **Practise with:** 2026 Q179–237.

**Problem-Solving**
- **Prelim focus seen in 2026:** long scenarios on imbalanced metrics, class weights and confusion matrices, LR schedules and warmup, batch size vs accuracy, gradient accumulation, NaN/OOM/oscillating loss, train/val/test drift, CPU-vs-GPU shape bugs, preprocessing choices, ethics.
- **Learn from:** Karpathy's recipe; Google Tuning Playbook; Ng's "Structuring ML Projects" (DL Spec C3); MLU bias-variance and precision-recall.
- **Practise with:** 2026 Q238–300 (the slowest block).

### "From scratch" checklist (every item has been, or is very close to, a NOAI Final task)

- Linear regression by GD.
- K-means.
- RAG retrieval with NumPy only.
- Gradient boosting: L2 and L1 negative gradients, init with mean or median, the fit/predict loop with learning rate, early stopping as a bonus.
- U-Net shape debugging: `center_crop` for valid-padding skip connections.
- Mean IoU without sklearn.
- Scaled dot-product attention.
- Multi-head attention and masking.

Close relatives worth adding:
- logistic regression;
- kNN;
- softmax and cross-entropy;
- the MLP backprop step;
- 2D convolution output size;
- PCA via SVD;
- a precision/recall/F1 calculator;
- TF-IDF;
- cosine-similarity top-k.

---

## 3. Student insights and exam strategy tips

### 3.1 What first-hand material exists (search log, so the site does not over-claim)

**Searched and found**
- **One NOAI 2026 finalist blog:** Altaf, https://altafcreator.com/events/noai/ (Bronze). The URL in the brief, https://altafcreator.com/event/noai/, returns 404; the working path is `/events/noai/`.
- **NTU, NYP and MOE articles quoting Singapore team members:**
  - NTU CCDS boot camp, 14 Jul 2026;
  - NTU, 8 Aug 2025;
  - NYP, Chong Jia Shuo (IOAI 2024 Gold team);
  - NSCC on NUS High's GPU access.
- **IOAI accounts from other countries:**
  - Hungary: Tamás Takács's IOAI 2025 blog;
  - Netherlands: Tilburg.ai;
  - Belarus: regional government article;
  - Malaysia: Sunway College, Khor Kai Jie, Bronze.
- **Organiser- or alumni-written prep guidance:** the AICC roadmap; the unofficial OpenIntelligence IOAI Guide; the USAAIO syllabus; the Beaver-Edge USAAIO forum; the IOAI Australia resources page.

**Searched but not retrievable**
- **r/SGExams:** reddit.com is blocked for fetching from this environment (HTTP 403 via curl; WebFetch refuses reddit). Web searches for "NOAI SGExams" returned no Reddit threads.
- **LinkedIn posts by NOAI or IOAI participants:** none were indexed by search.
- **Straits Times or CNA interviews about IOAI training:** none surfaced. Medal reports exist (MOE press releases, 27 Aug 2025 and 2 Sep 2026), but they have no prep detail.

**Action:** a human should skim r/SGExams and LinkedIn manually before launch. Until then, attribute strategy tips to past-paper analysis, not to "students say".

### 3.2 What participants and coaches actually said

**Altaf** (altaf-creator), NOAI 2026 finalist, Bronze
- **Said:** "first round … 300 questions MCQ test about AI programming including theory questions and debugging … final round consisting of a 20 question MCQ test and 5 programming tasks." "I'm still scratching the surface."
- **Lesson for our site:**
  - The Prelim includes debugging and theory questions.
  - "5 programming tasks" probably counts sub-parts; officially there are 3 tasks with multiple parts.
  - Even medallists felt their knowledge was shallow, which supports a breadth-first curriculum.
- **Source:** https://altafcreator.com/events/noai/

**Braven Seet Ti Jin** (VJC, NOAI Silver, 2026 IOAI camp)
- **Said:** without the lessons, "I'd get lost in the code and not really understand it."
- **Lesson:** Code-reading fluency is a real bottleneck. Add guided code walk-throughs.
- **Source:** [NTU CCDS boot camp](https://www.ntu.edu.sg/computing/news-events/news/detail/preparing-singapore's-ioai-team--inside-the-ccds-boot-camp)

**Swaagat Bikash Saikia** (RI, NOAI Bronze, later IOAI 2026 Bronze)
- **Said:** the professors "give us the rigour they'd give a university student"; the camp was "exciting and extremely fulfilling".
- **Lesson:** A NOAI Bronze can still make the team. Motivate students who miss Gold.
- **Source:** same NTU article

**NTU CCDS on the 2026 camp**
- **Said:** training stressed "analytical judgment, tolerance for technical ambiguity, and choosing the architecture best suited to a given problem". Domains were ML, CV, NLP and **audio**.
- **Lesson:** Add "which model and why" scenario drills, and a small audio module for the post-NOAI stage.
- **Source:** same NTU article

**Shine Xu** (IOAI 2025 Silver)
- **Said:** "The NTU professors taught us many concepts from within their own specialties" (ML, CV, NLP).
- **Lesson:** The NTU stage widens topics beyond the NOAI syllabus.
- **Source:** [NTU, 8 Aug 2025](https://www.ntu.edu.sg/news/detail/ntu-trained-high-schoolers-win-big-at-international-olympiad-in-ai)

**Chong Jia Shuo** (NYP, IOAI 2024 Gold team)
- **Said:** the class prepared for the NTU selection test "with support from lecturers and coursemates". At IOAI he saw "the need to understand more niche machine-learning techniques". The Scientific Round meant solving with "real-world datasets – all within 8 hours".
- **Lesson:**
  - Study with peers; add a study-group guide.
  - Go wider than core algorithms once the basics are solid.
- **Source:** [NYP story](https://www.nyp.edu.sg/student/study/schools/engineering/stories/jia-shuo-international-olympiad-artificial-intelligence-ioai-competition-winner)

**Tamás Takács** (Hungarian delegation, IOAI 2025)
- **Said:**
  - Tasks covered semi-supervised fake-antiquities detection, radar data, density estimation, multi-label segmentation, and an API-based clue-generation game.
  - The platform had crashes and long upload queues.
  - The scores were normalised, so "anyone who got the baseline … scored zero".
  - The national qualifier's 2-hour coding window was too short for most students.
- **Lesson:**
  - Beat the baseline decisively.
  - Practise under platform friction and time pressure.
  - Test the environment early.
- **Source:** https://www.tamastheactual.com/blog/ioai2025/

**Belarus team** (IOAI 2026 medallists)
- **Said:** "The hardest part for me was probably managing the nerves". Advice: "Don't be afraid of making seemingly foolish decisions". The team leader credited "a solid foundation in mathematics, good practical programming skills".
- **Lesson:**
  - Run full mock days to build composure.
  - Maths plus coding are the foundation.
- **Source:** [Belarus article](https://tolochin.vitebsk-region.gov.by/en/region1-en/view/medals-in-ai-how-belarus-prepares-winners-of-international-olympiads-30074-2026/)

**Khor Kai Jie** (Malaysia, IOAI 2025 Bronze)
- **Said:** "Don't be afraid to start, even if it feels intimidating … be consistent." AI is "more than just coding".
- **Lesson:** Beginner-reassurance messaging; consistency streaks.
- **Source:** [Sunway College](https://sunwaycollege.edu.my/news-events/a-level-student-khor-kai-jie-earns-bronze-at-international-ai-olympiad)

**AICC roadmap** (written by IOAI alumni)
- **Said:**
  - "Intuition over memorization", "Code early, code often … implementing it is transformative."
  - "Build a baseline first … If you can't beat a simple baseline, a bigger model won't help."
  - "Deliberate practice beats random participation."
  - "Trust your CV more than small leaderboard movements."
- **Lesson:** Use these as module mottos. Teach a baseline-first workflow in the Final and NTU stages.
- **Source:** https://aicc-official.org/roadmap (text extracted from the site bundle)

**OpenIntelligence IOAI Guide** (unofficial)
- **Said:** the at-home round "is not optional practice". Use the contest LLM "for documentation lookups and debugging". "Chasing the last fraction of accuracy often costs too much time." Use PyTorch and sklearn, not TF/Keras.
- **Lesson:** Time-boxing; tool discipline.
- **Source:** https://ioai.openintelligence.dev/

**USAAIO prep guide and forum**
- **Said:**
  - Work past problems "in Google Colab under timed conditions, writing both the typeset theory answers and the code".
  - A forum user: IOAI problems "after like problems #1 or #2, get really advanced for beginners".
- **Lesson:** Graduate the difficulty. Practise written explanations as well as code.
- **Sources:** https://www.omegalearn.org/usaaio, https://forum.beaver-edge.ai/t/preparing-for-usa-na-aio/42

**AISG FAQ for 2027** (official, but it reflects the setters' intent)
- **Said:**
  - "Internalised knowledge enables fast, accurate responses. This distinguishes deep understanding from surface knowledge."
  - "The rigor is intentional."
  - "No prior AI experience is required for the Preliminary Round … students should be passionate and motivated to work through the available learning resources on their own."
- **Lesson:** Speed comes from understanding plus recall. The site should train both.
- **Source:** https://noai.aisingapore.org/faqs/

### 3.3 What the official past papers reveal [A]

Data: the 2026 Prelim self-assessment tool (https://noai.aisingapore.org/preliminary-trial/), which embeds all 300 questions, topic tags, the answer key and explanations, plus the 2025 MCQ PDF and the 2025/2026 Final notebooks. The scripts and parsed data are in `work/rc/quizparse.py`, `prelim_quiz.json` and `prelim_answers.json`.

**Domain blocks.** Questions appeared in order:

| Questions | Domain | Count |
|---|---|---|
| 1–60 | Maths | 60 |
| 61–119 | Computing | 59 |
| 120–178 | AI/ML/DL | 59 |
| 179–237 | GenAI | 59 |
| 238–300 | Problem-Solving | 63 |

The tool's *subtopic* tags are unreliable. For example, "Databases" is attached to PyTorch questions and "Ethics" to ViT/CLIP questions. Re-tag questions ourselves.

**Reading load rises sharply at the end.** Characters are stem plus all options.

| Questions | Median characters |
|---|---|
| Q1–60 | 107–117 |
| Q61–240 | 129–141 |
| Q241–270 | 152 |
| **Q271–300** | **430** (26 of 30 are over 300 characters) |

Overall, 97 of 300 questions are under 120 characters and 38 are over 300.

**Calculation is light.**
- Only 11 questions have all-numeric options (10 of them Maths). Examples:
  - L2 norm of [3,4];
  - dot product [1,2,3]·[4,5,6];
  - the determinant of I;
  - the maximum rank of a 100×50 matrix;
  - z-score;
  - mean and median;
  - the 68% rule;
  - `np.zeros((3,4)).shape`.
- Harder numeric reasoning appears inside Problem-Solving scenarios instead. Example: "TP=180, FP=294, TN=9506, FN=20 … which is right?"

**Code reading is light but present.** About 11 questions involve `print(...)`, NumPy, Pandas, PyTorch or `.shape`. Most Computing questions are "what does X do" or "which syntax is correct".

**Answer-key cues** (2026 answer key; option order checked against the PDF):
- **Longest option correct when it is uniquely longest:** 221/276 = **80%** overall.

  | Domain | Hit rate |
  |---|---|
  | Maths | 56% |
  | Computing | 75% |
  | AI/ML/DL | 82% |
  | GenAI | 95% |
  | Problem-Solving | 87% |

- **Options starting with an absolute word** (Always/Never/Only/Cannot/All/None/Must/Guarantees/Eliminates/Completely): correct 1/69 times.
- **The 2025 MCQs:** the longest option was correct 10/14 times.
- **Correct-letter distribution:**
  - Overall: A 76, B 69, C 91, D 64.
  - Maths was heavily A/B (51 of 60).
  - AI/ML/DL leaned to D (27/59).
  - GenAI leaned to C (31/59).
- **Use these as last-resort guessing rules only.** AISG may fix them in 2027. Our own bank must not reproduce them.

**Final notebook style (2025 and 2026)**
- Story-wrapped scenarios ("Lead Engineer at OrbitalVision…").
- `# DO NOT EDIT` setup cells, with `### QUESTION x START/END` regions to fill in.
- Marks per sub-question; built-in test cells; explicit allowed and banned libraries.
- Hints in the markdown, e.g. "use `np.sign(y_true - y_pred)`" and "Do not forget to multiply the tree's prediction by the `learning_rate`!".
- Bonus parts worth 5 marks. "QUESTION 1.6 MUST BE COMPLETED FIRST" dependencies.
- 2025 allowed only the Python 3.9 standard library plus NumPy.

### 3.4 Prelim strategy tips (for the 2027 format: 150 MCQs in 90 minutes)

1. **Answer every question.** There is no penalty, and the 2027 FAQ says "Yes" to attempting all 150. Never leave a blank. Ties may be broken on time taken, so submit when done rather than idling.
2. **Use a two-speed pace, not a flat 36 s.** If 2027 mirrors 2026, the last ~10% are long scenarios. Plan for about 30 s on short items and about 60 s on the final ~15 long ones: 135 × 30 s + 15 × 60 s = 82.5 min, leaving 7.5 min of buffer. Checkpoints [I]:

   | Question | Elapsed time |
   |---|---|
   | Q30 | 15:00 |
   | Q60 | 30:00 |
   | Q90 | 45:00 |
   | Q120 | 60:00 |
   | Q135 | 67:30 |
   | Q150 | 82:30 |

   If you are more than 2 minutes behind at a checkpoint, start the 10-second rule (tip 3).
3. **Use the 10-second rule.** If you cannot see the path to an answer within about 10 s, eliminate what you can, pick one, note the number on scrap paper, and move on. Return only with leftover time. Google Forms should let you go back before submitting [I], but the 2026 form warned "Once submitted, you CANNOT change your answers".
4. **Do not abandon the end.** The slow Problem-Solving block is worth the same 1 mark per question. With 3–4 minutes left, sweep down and fill every blank.
5. **Do "no-calculator" maths fluently.** Know these cold:
   - matrix-shape rules and transpose shapes;
   - the maximum rank, min(m, n);
   - det(I) = 1, and a zero eigenvalue means a singular matrix;
   - ‖[3,4]‖ = 5;
   - σ′ = σ(1−σ);
   - d/dx of ReLU, tanh and x²;
   - 68-95-99.7;
   - z = (x−μ)/σ;
   - Bayes' rule;
   - precision = TP/(TP+FP), recall = TP/(TP+FN), F1 = harmonic mean;
   - entropy of a fair coin = 1 bit;
   - convolution output = ⌊(n + 2p − k)/s⌋ + 1;
   - softmax properties.
6. **Learn the "classic contrasts"** that dominate the conceptual items:
   - bagging vs boosting (variance vs bias);
   - L1 vs L2;
   - BERT (bidirectional, MLM) vs GPT (autoregressive);
   - generative vs discriminative;
   - GAN vs diffusion vs VAE;
   - SGD vs Adam;
   - batch vs layer norm;
   - precision vs recall under imbalance;
   - under- vs overfitting signatures in train/val curves;
   - data drift vs overfitting (e.g. "train 99.8%, val 92%, test 64% with 2025 test data");
   - k-means vs DBSCAN (variable density).
7. **Scenario-reading technique.** Read the *question line* first. Then underline the numbers that discriminate (train vs val gap, class ratio, epoch at which NaN appears, GPU memory). Most scenarios test one named concept: warmup, gradient accumulation, the 1cycle schedule, class weights, data leakage, or distribution shift.
8. **Use elimination heuristics only when you genuinely don't know.** Absolute-word options were almost never right in 2026. Precise, qualified statements usually beat vague ones. Distrust options that merely restate the question.
9. **Rehearse the environment.**
   - Google Form in a school lab; pen and paper only; no AI.
   - Practise on a desktop browser with the self-assessment tool.
   - Do at least 4 full 150-in-90 mocks.
   - Do the last mock on a Friday at 9:30 am, the actual slot.
10. **Do spaced-repetition flashcards daily in the final 6 weeks.** Recall speed is what the FAQ says the format tests.

### 3.5 Final strategy tips (20 MCQs plus 3 notebooks; 2026 was 3 h and 100 marks)

1. **MCQs first, time-boxed.** About 30 minutes, roughly 1.5 min each (the 2026 header recommended this). Bank them, then move on.
2. **Budget notebook time by marks,** about 1.9 min per mark. Using the 2026 weights:

   | Task | Marks | Time |
   |---|---|---|
   | Task 1 | 25 | ≈ 47 min |
   | Task 2 | 20 | ≈ 38 min |
   | Task 3 | 35 | ≈ 66 min |

3. **Skim all three notebooks for 5 minutes first.**
   - Note the easy, early marks, e.g. the 4-mark negative-gradient one-liners in 2026 Task 1.
   - Note the dependencies, e.g. "1.6 MUST BE COMPLETED FIRST".
   - Note the banned libraries.
4. **Code against the provided tests.**
   - Run the test cell after every function.
   - Use `assert x.shape == ...` liberally; shape bugs were the theme of 2026 Task 2.
5. **Secure partial credit.** Each sub-question is marked separately, so a correct small function beats an ambitious broken one. Attempt bonus parts only after the core parts pass.
6. **No internet and no AI help** (2026 rules: "No internet except for submission. No AI assistants"). Practise in Jupyter with autocomplete AI turned off. Memorise the core NumPy and PyTorch API: `np.argmin(axis=)`, broadcasting, `torch.matmul`/`@`, `F.softmax(dim=-1)`, `masked_fill`, `view`/`reshape`/`transpose`, `nn.Module.__init__`/`forward`.
7. **Submit early, then improve.**
   - Use the same email as the Prelim.
   - Submissions close at 12:30 sharp.
   - Keep an "already-submitted" safe version.

### 3.6 What students wish they had studied / common gaps (synthesised)

- **Reading other people's code.** Braven: "get lost in the code". Chong: "niche ML techniques". These suggest daily code-tracing, plus a "what does this PyTorch block do" drill.
- **Maths fluency without a calculator.** This is an inference from the paper (60/300 Maths questions) and from the Belarus coach's "solid foundation in mathematics".
- **PyTorch specifically**, not just Keras. Rules-driven: NOAI Final and IOAI.
- **Debugging and training diagnostics.** These are the Prelim's long scenarios and the Final's U-Net bug, and the NTU camp stressed "troubleshooting under tight timelines".
- **Composure and environment.** Hungary and Netherlands: platform crashes, extra hours added. Belarus: nerves. Run full mock days.
- **Validation discipline and baselines** for the NTU and IOAI stage (AICC; Hungarian normalisation story).

### 3.7 Beyond NOAI (for the top 60)

**IOAI 2026 contest environment** (useful to mirror in later practice) [V, IOAI 2026 Contest Rules]
- Python 3.13 in JupyterLab.
- torch and scikit-learn as the core libraries. "TensorFlow and Keras will NOT be available".
- A whitelist of documentation sites (python.org, numpy, pandas, scikit-learn, pytorch.org, matplotlib, scipy, huggingface.co/docs).
- An official in-platform LLM (Gemma 3, at most 1000 output tokens per query, for the Individual Contest). External copilots are banned.
- GPU slices: H200 MIG, 18 GB VRAM limit.
- Two 6-hour contest days of 3 tasks each. Day 1 is linked to the at-home tasks.

**NTU training** (2026): weekend sessions, then a residential camp with ML, CV, NLP and audio, then IOAI at-home tasks (NTU CCDS).

---

## 4. Inspiration: great visual explainers

### 4.1 What makes the best explainers work for beginners (design rules to copy)

1. **Direct manipulation with immediate feedback.** TensorFlow Playground, distill's Momentum, and setosa's PCA let you drag or slide and see the model change at once. Learners form and test hypotheses ("what if I add a layer?") instead of reading claims.
2. **Overview → detail, with the same visual vocabulary.** CNN Explainer starts with the whole network and lets you click a neuron to expand the convolution animation and then the formula. Transformer Explainer does the same for Q/K/V and attention.
3. **Linked representations.** Show the picture, the numbers and the formula side by side and highlight the same element in each. Examples: setosa image kernels (hover a pixel, see the 3×3 multiply) and Seeing Theory (simulation, histogram and formula).
4. **A real model and real data, small enough to run in the browser.**
   - Transformer Explainer runs GPT-2 small (124M) live with temperature, top-k and top-p controls.
   - CNN Explainer uses a real TinyVGG.
   - GAN Lab trains live.
   - Authenticity motivates; small scale keeps it fast.
5. **Step-through time controls.**
   - Naftali Harris's k-means has "update centroids" and "reassign points" buttons.
   - GAN Lab has a step mode.
   - Python Tutor steps through code.
   - Algorithms become sequences you can pause and predict.
6. **Scrollytelling with one running example.**
   - R2D3 builds a decision tree on SF-vs-NY homes as you scroll.
   - MLU-Explain uses one dataset per article.
   - This keeps cognitive load low: a single dataset and a single question.
7. **Intuition before notation.** 3Blue1Brown and Jay Alammar show *what* the operation does geometrically or through a story before introducing symbols.
8. **Let learners use their own input.** Your own sentence (Transformer Explainer, tiktokenizer), your own image (CNN Explainer, Teachable Machine), your own drawing (Adam Harley's CNN vis, Jezzamon's Fourier).
9. **Predict-then-reveal.** Explorable explanations (Bret Victor; distill) ask the reader to guess before showing. For an exam-prep site, a quick MCQ at each widget turns watching into retrieval practice.

**Implementation note for our site**
- Build lightweight vanilla JS, SVG or Canvas widgets (or D3) that run offline.
- Avoid heavy in-browser model downloads.
- Embed-or-link the external flagships rather than copying them.
- Every widget should have:
  - a "Try this" challenge;
  - a "What NOAI asked" link to a real past question;
  - a "Now code it" NumPy/PyTorch snippet. Pyodide could run NumPy in the browser [I].

### 4.2 Per-topic explainer catalogue

All URLs were checked with HTTP 200 today unless noted. GitHub links return 403 only because of this sandbox; they are public.

#### Python and computing

**Python execution, aliasing, recursion**
- **Explainer:** Python Tutor, https://pythontutor.com/
- **Idea:** Steps through code showing frames, objects and arrows (references).
- **Why it works:** It makes invisible state visible. Aliasing and mutability (6.0001 Lecture 5) "click" instantly.
- **Build on our site:** An "Output predictor": show a snippet, ask for the output, then animate a memory diagram. Use it for all "what is printed" MCQs.

**NumPy arrays and broadcasting**
- **Explainers:** Jay Alammar, A Visual Intro to NumPy, https://jalammar.github.io/visual-numpy/. Tensor Puzzles (21 puzzles), https://github.com/srush/Tensor-Puzzles
- **Idea:** Arrays drawn as coloured blocks; puzzles reimplement NumPy functions with broadcasting only.
- **Why it works:** Shape becomes geometry. The puzzles force first-principles fluency, which is exactly what from-scratch Final tasks need.
- **Build on our site:** A "Shape tracer" widget: type ops like `(3,1)+(1,4)` or `A@B` and see block diagrams and the resulting shape or an error.

**Pandas operations**
- **Explainer:** Pandas Tutor, https://pandastutor.com/
- **Idea:** Visualises how groupby, filter and sort transform a dataframe, with arrows.
- **Why it works:** Before/after tables with highlighted rows show *what moved where*.
- **Build on our site:** Mini dataframe animations for `df['col']`, `.loc`, `groupby().mean()`, `fillna`/`dropna`.

**Algorithms, complexity, data structures**
- **Explainer:** VisuAlgo, https://visualgo.net/en
- **Idea:** Animated sorting, searching and graph algorithms with an e-lecture mode and quizzes.
- **Why it works:** Step controls plus live pseudocode highlighting.
- **Build on our site:** Big-O "race" bars (n vs n log n vs n²), and BFS/DFS/A* on a grid. A* supports CS50 AI and 6.034 search.

#### Mathematics

**Vectors, matrices, linear maps**
- **Explainers:** 3Blue1Brown *Essence of Linear Algebra*, https://www.3blue1brown.com/topics/linear-algebra. Interactive Linear Algebra (Margalit & Rabinoff), https://textbooks.math.gatech.edu/ila/
- **Idea:** Matrices as transformations of the grid; determinant as area scaling; eigenvectors as directions that stay on their span.
- **Why it works:** Geometry first gives meaning to rank, determinant and singularity, which are frequent Prelim items.
- **Build on our site:** A 2×2 matrix sandbox: drag the basis vectors, then see the grid warp, the det as signed area, and when det = 0 (singular).

**Matrix multiplication and shapes**
- **Explainer:** http://matrixmultiplication.xyz/ (http only)
- **Idea:** Animates rows sliding over columns.
- **Why it works:** Shows why (3×2)(2×4) → 3×4 and why (3×3) ÷ (3×3) is invalid.
- **Build on our site:** A shape-rule quiz plus animation.

**Eigenvectors and PCA**
- **Explainers:** setosa.io Eigenvectors & Eigenvalues, https://setosa.io/ev/eigenvectors-and-eigenvalues/. setosa.io PCA, https://setosa.io/ev/principal-component-analysis/
- **Idea:** Drag points or vectors and watch the transformation repeat or the principal axes update.
- **Why it works:** Direct manipulation plus a familiar 2D scatter.
- **Build on our site:** PCA widget: drag points, see PC1 and PC2 and the explained variance %. Link to t-SNE pitfalls.

**Calculus, derivatives, the chain rule**
- **Explainers:** 3Blue1Brown *Essence of Calculus*, https://www.3blue1brown.com/topics/calculus. colah, Calculus on Computational Graphs: Backpropagation, https://colah.github.io/posts/2015-08-Backprop/
- **Idea:** The derivative as "nudge" sensitivity; the chain rule as paths through a computational graph.
- **Why it works:** The graph view makes backprop an extension of the chain rule rather than magic.
- **Build on our site:** A computational-graph stepper: enter x, see the forward values and backward gradients on each edge, e.g. for σ(wx+b).

**Probability and statistics**
- **Explainers:** Seeing Theory (Brown Univ.), https://seeing-theory.brown.edu/ (6 chapters: basic and compound probability, distributions, frequentist and Bayesian inference, regression; site archived but working). setosa Conditional Probability, https://setosa.io/conditional/. 3b1b Bayes, https://www.3blue1brown.com/lessons/bayes-theorem
- **Idea:** Coin and dice simulations converge to expectations; the CLT builds up live; Bayes as a shrinking area.
- **Why it works:** Simulation makes abstract laws observable, and the area model makes Bayes arithmetic easy without a calculator.
- **Build on our site:** A Bayes grid (100 people, test sensitivity and specificity sliders); a normal curve with ±1/2/3σ shading; a z-score calculator.

**Information theory: entropy, cross-entropy, KL**
- **Explainer:** colah, Visual Information Theory, https://colah.github.io/posts/2015-09-Visual-Information/
- **Idea:** Code lengths drawn as areas, so cross-entropy is "using the wrong code".
- **Why it works:** Turns log formulas into a picture. This underpins the cross-entropy loss.
- **Build on our site:** An entropy bar: drag class probabilities and see H(p), and CE vs a predicted q.

**Optimisation: GD, momentum, learning rate, Adam**
- **Explainers:** distill, Why Momentum Really Works, https://distill.pub/2017/momentum/. 3b1b gradient descent lesson, https://www.3blue1brown.com/lessons/gradient-descent
- **Idea:** Step-size and momentum sliders on a quadratic valley; watch zig-zag vs smooth convergence.
- **Why it works:** Shows divergence when the LR is too high, oscillation, and why momentum helps. These are direct analogues of the Prelim's "loss oscillates / NaN" scenarios.
- **Build on our site:** An optimiser race on a 2D loss surface (SGD vs momentum vs Adam) with LR and warmup sliders, and a "make it diverge" challenge.

#### Classical ML

**Linear and logistic regression**
- **Explainers:** MLU-Explain Linear Regression, https://mlu-explain.github.io/linear-regression/ and Logistic Regression, https://mlu-explain.github.io/logistic-regression/
- **Idea:** Scrollytelling with live fits; residuals drawn as segments; the sigmoid decision boundary.
- **Why it works:** One dataset throughout; the formula is introduced after the picture.
- **Build on our site:** A GD regression stepper: press "step" to see the line move, the loss curve fall, and the gradient values. Its code twin is NOAI 2025 Q1.

**kNN and linear classifiers**
- **Explainer:** Stanford CS231n demos, http://vision.stanford.edu/teaching/cs231n-demos/knn/ and http://vision.stanford.edu/teaching/cs231n-demos/linear-classify/ (http only)
- **Idea:** Change k or the metric and see the decision regions; drag weights and see hinge or softmax loss update.
- **Why it works:** Immediate feedback on hyperparameters.
- **Build on our site:** A kNN board: click to add points, choose k, L1 or L2.

**Decision trees, bias-variance**
- **Explainers:** R2D3, A Visual Introduction to ML parts 1 and 2, https://r2d3.us/visual-intro-to-machine-learning-part-1/ (use the non-www host; www returned 522 today). MLU-Explain Decision Tree, Random Forest and Bias-Variance.
- **Idea:** Scroll-driven tree growth on real housing data; overfitting shown as a tree that grows too deep.
- **Why it works:** The narrative plus animation are widely considered a gold standard.
- **Build on our site:** A tree-depth slider showing train vs test accuracy curves, plus Gini/entropy split calculators.

**Gradient boosting**
- **Explainers:** Alex Rogozhnikov, Gradient Boosting Explained (interactive), https://arogozhnikov.github.io/2016/06/24/gradient_boosting_explained.html, and the playground, https://arogozhnikov.github.io/2016/07/05/gradient_boosting_playground.html. explained.ai (Parr & Howard), https://explained.ai/gradient-boosting/
- **Idea:** Sliders for the number of trees, depth and learning rate. Each tree fits the residual; the sum of trees is the model.
- **Why it works:** Makes "fit the negative gradient" concrete. This was **exactly NOAI 2026 Task 1**.
- **Build on our site:** A boosting stepper: show the residuals, add tree k, shrink by the LR. Toggle L2 (residual) vs L1 (sign) negative gradients.

**Clustering: K-means and DBSCAN**
- **Explainers:** Naftali Harris, Visualizing K-Means, https://www.naftaliharris.com/blog/visualizing-k-means-clustering/, and Visualizing DBSCAN, https://www.naftaliharris.com/blog/visualizing-dbscan-clustering/
- **Idea:** Pick a dataset shape and initialisation, then press update or reassign step by step. For DBSCAN, set eps and minPoints.
- **Why it works:** Exposes failure modes (bad initialisation, non-convex shapes) that MCQs ask about ("variable density → DBSCAN").
- **Build on our site:** A K-means stepper with an inertia readout (code twin: NOAI 2025 Q2), plus a "smiley face" failure case.

**t-SNE and UMAP pitfalls**
- **Explainer:** distill, How to Use t-SNE Effectively, https://distill.pub/2016/misread-tsne/
- **Idea:** A perplexity slider shows that cluster sizes and distances can mislead.
- **Why it works:** Teaches skepticism by experiment.
- **Build on our site:** Link out, with 2 MCQs.

**Evaluation: splits, CV, metrics**
- **Explainers:** MLU-Explain Train/Test/Validation, Cross-Validation, Precision & Recall, ROC & AUC, https://mlu-explain.github.io/
- **Idea:** Live model plus threshold sliders that update the confusion matrix and curves.
- **Why it works:** The threshold slider links one number to the whole confusion matrix.
- **Build on our site:** A confusion-matrix lab: slide the threshold on an imbalanced dataset (1% positive) and watch accuracy stay at 99% while recall collapses. This mirrors 2026 Q263–265.

#### Neural networks and deep learning

**Neural networks: decision boundaries, capacity**
- **Explainers:** TensorFlow Playground, https://playground.tensorflow.org/. Nielsen ch. 4 visual universality proof, http://neuralnetworksanddeeplearning.com/chap4.html
- **Idea:** Choose a dataset (circle, XOR, Gaussian, spiral), features, layers, activation, LR, regularisation and noise; watch the boundary and the per-neuron heatmaps.
- **Why it works:** The most effective "aha" for capacity, non-linearity and overfitting. Zero setup.
- **Build on our site:** Embed a link with guided missions ("solve the spiral with the fewest neurons", "make it overfit with noise 50"). Add our own 1-hidden-layer stepper that shows the actual numbers.

**Backprop and autograd**
- **Explainers:** 3b1b backprop lesson, https://www.3blue1brown.com/lessons/backpropagation. Karpathy, micrograd and Neural Networks: Zero to Hero, https://github.com/karpathy/micrograd and https://karpathy.ai/zero-to-hero.html
- **Idea:** Build an autograd engine of about 100 lines; visualise the graph of `Value` nodes.
- **Why it works:** Learners write the thing they are learning. This matches the "from scratch" Final.
- **Build on our site:** A "Mini-autograd" walkthrough with a graph render of a 2-neuron network.

**CNNs and convolution**
- **Explainers:**
  - CNN Explainer, https://poloclub.github.io/cnn-explainer/
  - setosa Image Kernels, https://setosa.io/ev/image-kernels/
  - Adam Harley's 3D CNN, https://adamharley.com/nn_vis/cnn/3d.html
  - ConvNetJS demos, https://cs.stanford.edu/people/karpathy/convnetjs/
- **Idea:** Click a neuron to see the kernel sliding and the dot product, then ReLU, pooling and softmax. Hover pixels to see the 3×3 multiply. Draw a digit and watch activations flow.
- **Why it works:** Overview-to-detail plus your own input. Convolution becomes arithmetic you can check.
- **Build on our site:** A kernel playground (blur, sharpen, Sobel, custom) on a small image, with the output-size formula live.

**Padding, stride, transposed conv** (U-Net)
- **Explainer:** conv_arithmetic GIFs (Dumoulin & Visin), https://github.com/vdumoulin/conv_arithmetic
- **Idea:** Animated grids for padding, strides, dilation and transposed convolution.
- **Why it works:** Exactly the geometry behind 2026 Task 2 (valid padding shrinks maps, so the skip connection mismatches).
- **Build on our site:** A U-Net shape tracer: set padding to 0 or 1 and see each encoder and decoder size, where the mismatch appears, and the `center_crop` fix.

**Segmentation metrics (IoU / mIoU)**
- **Explainer:** No great interactive one found. The 2026 notebook linked V7's static guide.
- **Idea:** Overlapping masks with intersection and union shaded.
- **Why it works:** The gap is our opportunity.
- **Build on our site:** An IoU painter: paint the predicted vs true mask on a grid, see IoU per class and mean IoU, with a NumPy code twin.

**What CNNs learn**
- **Explainers:** distill Feature Visualization, https://distill.pub/2017/feature-visualization/, and Activation Atlas, https://distill.pub/2019/activation-atlas/
- **Idea:** Optimised images showing what neurons detect.
- **Why it works:** Gives awe and intuition (edges → textures → objects).
- **Build on our site:** Link for enrichment.

**RNN and LSTM**
- **Explainer:** colah, Understanding LSTM Networks, https://colah.github.io/posts/2015-08-Understanding-LSTMs/
- **Idea:** Step-by-step gate diagrams.
- **Why it works:** Consistent visual grammar, introduced incrementally.
- **Build on our site:** A static diagram with hover-to-explain each gate.

#### NLP, Transformers and GenAI

**Tokenisation**
- **Explainer:** Tiktokenizer, https://tiktokenizer.vercel.app/
- **Idea:** Type text and see coloured tokens and IDs.
- **Why it works:** Instantly shows subwords, spaces and why "tokens ≠ words".
- **Build on our site:** A toy BPE merge stepper on a tiny corpus.

**Word embeddings**
- **Explainers:** TensorFlow Embedding Projector, https://projector.tensorflow.org/. Jay Alammar, Illustrated Word2vec, https://jalammar.github.io/illustrated-word2vec/
- **Idea:** Search a word and see its neighbours in 3D (PCA, t-SNE, UMAP); embeddings shown as colour strips.
- **Why it works:** Similarity becomes distance. It prepares students for cosine similarity in RAG.
- **Build on our site:** A cosine-similarity sandbox with 2D toy vectors (king − man + woman).

**Attention and Transformers**
- **Explainers:**
  - Transformer Explainer, https://poloclub.github.io/transformer-explainer/
  - Jay Alammar, Illustrated Transformer, https://jalammar.github.io/illustrated-transformer/, plus BERT and GPT-2
  - 3b1b attention lesson, https://www.3blue1brown.com/lessons/attention
  - bertviz, https://github.com/jessevig/bertviz
- **Idea:** Live GPT-2 small with your text. Expand embedding, Q/K/V, masked self-attention, MLP and next-token probabilities, with temperature, top-k and top-p sliders.
- **Why it works:** A real model, the user's input, and progressive disclosure. Sampling sliders make decoding MCQs trivial.
- **Build on our site:** An attention calculator: 3 tokens with 2-D Q/K/V you can edit. See QKᵀ, ÷√d, the mask, softmax and the weighted V, in numbers. Code twin: NOAI 2026 Task 3.

**Inside an LLM, end to end**
- **Explainer:** Brendan Bycroft, LLM Visualization, https://bbycroft.net/llm
- **Idea:** A 3D walkthrough of every matrix operation in a GPT, scaled from tiny to large.
- **Why it works:** Scale and structure at a glance; narrated steps.
- **Build on our site:** Link for enrichment.

**RAG**
- **Explainers:** Jay Alammar, Illustrated Retrieval Transformer, https://jalammar.github.io/illustrated-retrieval-transformer/. No good interactive RAG demo was found.
- **Idea:** Show query embedding → nearest chunks → prompt assembly.
- **Why it works:** The gap is our opportunity.
- **Build on our site:** A RAG pipeline widget: type a question, see TF-IDF or embedding scores per chunk, top-k selected, then the final prompt. Code twin: NOAI 2025 Q3 (NumPy only).

**GANs**
- **Explainer:** GAN Lab, https://poloclub.github.io/ganlab/
- **Idea:** Train a GAN live on 2D distributions; see the generator's mapping and the discriminator's heatmap; step mode.
- **Why it works:** Makes the adversarial game visible; mode collapse can be observed.
- **Build on our site:** Link plus MCQs (mode collapse, discriminator role).

**Diffusion**
- **Explainers:** Diffusion Explainer, https://poloclub.github.io/diffusion-explainer/. Jay Alammar, Illustrated Stable Diffusion, https://jalammar.github.io/illustrated-stable-diffusion/
- **Idea:** See latent denoising over timesteps; change the prompt, seed and guidance scale.
- **Why it works:** Connects the forward-noise and reverse-denoise vocabulary to images.
- **Build on our site:** A 1-D "noise then denoise" slider with a classifier-free-guidance (CFG) strength slider.

**Hook for absolute beginners**
- **Explainer:** Teachable Machine, https://teachablemachine.withgoogle.com/
- **Idea:** Train an image, sound or pose classifier with a webcam in minutes, with no code.
- **Why it works:** An instant win and motivation; it introduces data, labels and training.
- **Build on our site:** Day-1 "train your first model" activity.

#### Audio and ethics

**Audio and spectrograms** (IOAI syllabus, NTU camp)
- **Explainers:** Chrome Music Lab Spectrogram, https://musiclab.chromeexperiments.com/Spectrogram/. Jez Swanson, An Interactive Introduction to Fourier Transforms, https://www.jezzamon.com/fourier/
- **Idea:** Live microphone to spectrogram; draw a shape and see its Fourier epicycles.
- **Why it works:** Uses the learner's own voice; sound becomes image, which is why CNNs work on audio.
- **Build on our site:** Link plus a short module in the post-NOAI stage.

**Fairness and ethics**
- **Explainers:** MLU-Explain Equality of Odds, https://mlu-explain.github.io/equality-of-odds/. Google PAIR Explorables, e.g. Measuring Fairness, https://pair.withgoogle.com/explorables/measuring-fairness/
- **Idea:** Adjust thresholds per group and see the fairness metrics trade off.
- **Why it works:** Shows that fairness definitions conflict, a common MCQ theme.
- **Build on our site:** A threshold-per-group widget.

#### Whole-course references with good visuals

**Dive into Deep Learning**, https://d2l.ai/
- Every concept is done "from scratch", then "concise", with runnable PyTorch.
- Borrow its two-panel pattern ("from scratch" and "with library") for every module.

**Understanding Deep Learning** (Prince), https://udlbook.github.io/udlbook/
- A free book with exceptionally clear figures and Python notebooks.

**Kaggle Learn**, https://www.kaggle.com/learn
- Short micro-courses with in-browser notebooks and auto-checked exercises. The catalogue is JS-rendered, so the course list is not verified here [S].
- Borrow its "lesson → exercise with instant check" loop and its progress badges.

**MLU-Explain**, https://mlu-explain.github.io/
- A consistent scrollytelling house style.
- Borrow the house-style consistency: one colour per concept across the whole site.

### 4.3 Other olympiad-AI prep sites and curricula worldwide (what to borrow)

**AICC**, https://aicc-official.org
- **What it is:** IOAI alumni community; monthly contests, a task archive, an 11-section roadmap, a Discord.
- **Borrow:** The baseline-first "how to approach a task" checklist; monthly challenge cadence; a "practice tips" page.

**OpenIntelligence IOAI Guide** (unofficial), https://ioai.openintelligence.dev/
- **What it is:** Season timeline, 18 curriculum modules in 6 divisions, a round archive, a "Contest Craft" module.
- **Borrow:** The season timeline UI (our version: interest window → Prelim → Final → NTU → IOAI 2027 Singapore); a dedicated "contest craft" module.

**USAAIO**, https://www.usaaio.org/syllabus and https://www.usaaio.org/past-problems
- **What it is:** Syllabus explicitly says PyTorch only, "thorough understanding of transformers", and by-hand forward and backprop; Colab plus Markdown maths answers; past problems.
- **Borrow:** "By-hand computation" exercises (forward and backward on paper), which suit the no-calculator Prelim.

**IOAI Australia**, https://ioai.org.au/index.php/resources/
- **What it is:** A minimal 10-link skills list.
- **Borrow:** The brevity: one best link per skill.

**IOAI Education Hub**, https://ioai-official.org/resources/
- **What it is:** Official links to syllabus, tasks and free courses, plus about 15 countries' national-round problems.
- **Borrow:** A "World problem archive" page that links tasks by topic (CV, NLP, ML, tabular).

**open-cu/awesome-ioai-tasks**, https://github.com/open-cu/awesome-ioai-tasks
- **What it is:** IOAI 2024–26 tasks and solutions, with short task summaries.
- **Borrow:** One-line task summaries plus "try it" links.

**Poland OAI**, https://github.com/OlimpiadaAI/II-OlimpiadaAI
- **What it is:** A 3-stage national olympiad with an online stage of 5 tasks: coin detection, hallucination detection, ECG anomalies, noisy labels, hidden subsequences. Finals include INR inpainting, unlearning and more.
- **Borrow:** A graded difficulty ladder from online to regional to final.

**Hungary HAIO**, https://github.com/Hungarian-AI-Olympiad/HAIO-Hungarian-AI-Olympiad
- **What it is:** 21 tasks across CV, NLP, ML and RL; a Kaggle-based online round; a national final with theory plus practice.
- **Borrow:** Kaggle-style leaderboards for motivation.

**Malaysia IOAI TSP 2025 labs**, https://github.com/jaredliw/ioai-tsp-2025
- **What it is:** The lab repository of Malaysia's training and selection programme. The README is only a title; I did not explore the contents.
- **Borrow:** A regional peer example of a structured lab sequence.

### 4.4 Gaps where we should build our own widgets (no good free interactive found)

1. **IoU and mean-IoU mask painter** (2026 Final Task 2).
2. **U-Net or CNN shape tracer** with padding and stride toggles.
3. **Attention-by-numbers calculator** with masking (2026 Task 3).
4. **RAG pipeline step-through** with NumPy TF-IDF and cosine (2025 Q3).
5. **Gradient-boosting residual stepper** (2026 Task 1). Rogozhnikov's exists, but it has no code twin and no L1/L2 toggle.
6. **Confusion-matrix and threshold lab** on imbalanced data (2026 Q263–265).
7. **Training-failure simulator.** Pick a symptom (NaN at epoch 23, oscillating loss, val stuck at 10%, OOM) and choose the fix. This covers 2026 Q271–300.
8. **Prelim pacing coach.** A timed 150-question runner with checkpoint markers (§3.4), a flag list, and an end-of-test blank sweep.
9. **Mental-maths speed drill** for shapes, norms, dot products, derivatives, z-scores and metrics, with no calculator.

---

## Appendix: key sources

**Official**
- https://noai.aisingapore.org/learning-resources/
- https://noai.aisingapore.org/faqs/
- https://noai.aisingapore.org/preliminary-trial/
- https://ioai-official.org/resources/
- IOAI 2026 Contest Rules (local copy: `sources/ioai_syl/IOAI2026-Contest-Rules.txt`)
- IOAI Educational Resources sheet (local copy: `sources/text/ioai_educational_resources.txt`)

**Course pages** (all checked 14 Oct 2026)
- deeplearning.ai: AI Python for Beginners, ML Specialization, DL Specialization
- developers.google.com/edu/python
- ocw.mit.edu: 6.0001, 6.034, 6.036
- pll.harvard.edu and cs50.harvard.edu/ai (including the projects for weeks 5 and 6)
- github.com/microsoft/generative-ai-for-beginners (README)
- huggingface.co/learn/agents-course

**Community**
- altafcreator.com/events/noai/
- NTU CCDS (14 Jul 2026) and NTU (8 Aug 2025)
- NYP (Chong Jia Shuo)
- NSCC
- tamastheactual.com/blog/ioai2025
- chatbot.tilburg.ai (IOAI 2025)
- tolochin.vitebsk-region.gov.by (Belarus)
- sunwaycollege.edu.my (Khor Kai Jie)
- aicc-official.org/roadmap
- ioai.openintelligence.dev
- omegalearn.org/usaaio
- forum.beaver-edge.ai
- ioai.org.au
- eclatinstitute.sg (commercial; generic 12-week plan only, not used for facts)

**Analysis data:** `work/rc/prelim_quiz.json` (300 questions with topics) and `prelim_answers.json` (the official self-assessment answer key, indices 0–3).
