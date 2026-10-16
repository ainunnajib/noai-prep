# IOAI syllabus and competition format: definitive reference

*Compiled Wednesday 14 October 2026 for the NOAI-prep website. All facts were checked against the primary IOAI documents (PDFs, the GitHub task repositories and the IOAI website) that were downloaded on this date.*

**Confidence tags**
- **[H]** stated verbatim in an official IOAI document
- **[M]** a direct reading of official task files or results tables
- **[L]** my inference, or an unofficial or second-hand source

**Why this matters for NOAI.**
- The NOAI 2026 FAQ told students to "review the IOAI 2026 syllabus".
- The NOAI 2027 FAQ (updated 14 Oct 2026) says: *"Students should review the IOAI syllabus and read extensively about each of the covered topics."*
- The current "IOAI syllabus" is the **IOAI 2026 Syllabus**. `https://ioai-official.org/syllabus` 301-redirects to that PDF (checked 14 Oct 2026). [H]

---

## 0. Bottom line (read this first)

1. **Use the IOAI 2026 Syllabus.** No IOAI 2027 syllabus had been published as of 14 Oct 2026.
   - I checked the IOAI WordPress media library. The newest PDFs are from 30 Sep 2026, and none of them is a syllabus.
   - The 2026 syllabus was uploaded on 1 Oct 2025, so a 2027 version could appear any time from now on. [H/L]
2. **Structure.** The syllabus has 4 sections, 11 topic groups and **60 subtopics**.
   - Each subtopic is labelled **Theory**, **Practice** or **Both**: **1 Theory-only, 24 Both, 35 Practice-only**.
   - There are **no levels or tiers**.
   - It does **not list any maths prerequisites**.
   - It states: **"Topics not listed are considered excluded"** and **"Breadth should be prioritized over depth."** [H]
3. **Competition format (2025 onwards).**
   - Scores are individual. The **Individual Contest** runs on **2 days × 6 h × 3 tasks**.
   - Day 1 tasks are linked to the 3 **at-home tasks**, which are practice only and released about 1 month before. Day 2 tasks are new.
   - Work is done in Python/Jupyter, on GPU, without open internet. torch and scikit-learn are the core libraries, plus Hugging Face libraries. TensorFlow and Keras are **not** available. A built-in small LLM assistant is provided.
   - Each task is scored 0–100, normalised against a baseline and a near-optimal solution.
   - Medal cut-offs: Gold for at least the top 1/12, Gold+Silver for at least 1/4, any medal for at least 1/2.
   - A separate **Team Challenge** (humanoid robots in 2025 and 2026) and the **GAITE** track do **not** affect medals. [H]
4. **2024 (Burgas) was different.** Scoring was by team. There was a **Scientific Round**: a 1-month at-home stage plus an 8-hour on-site stage, each with 3 tasks (NLP, ML, CV), on Google Colab. There was also a **Practical Round** of AI image and video generation (4 h). [H]
5. **Which topics recur most.** Across the 24 IOAI Scientific-Round and Individual tasks from 2024–2026 (at-home and on-site), these syllabus items appear most often:
   - fine-tuning pre-trained models
   - data processing
   - embeddings
   - feature engineering
   - evaluation metrics
   - loss functions

   Every task requires reading a baseline notebook, beating it, and writing an exact output format. [M]
6. **Correction to the brief.** IOAI 2026 was **not** held in Abu Dhabi. It moved to **Astana, Kazakhstan, 2–8 Aug 2026**; the move was announced 21 Mar 2026. **IOAI 2027 is in Singapore, 4–10 Jul 2027**, hosted by AISG and NTU. [H]

---

## 1. Which official syllabus documents exist

| Edition | Document | Published | Status (14 Oct 2026) | URL |
|---|---|---|---|---|
| 2024 Burgas | **No standalone syllabus found.** The 2024 press release says only "this year, the focus is on NLP, Machine Learning, and Computer Vision". The WP media library has only the two syllabus PDFs below; the Wayback Machine was unreachable. | – | – | https://ioai-official.org/the-worlds-best-students-in-ai-honoured-at-the-first-international-artificial-intelligence-olympiad-in-burgas-bulgaria/ [M] |
| 2025 Beijing | "IOAI 2025 Syllabus" (4 pp, made in Apple Pages; PDF created 11 Jan 2025, uploaded 23 Jun 2025) | Jun 2025 | Superseded. Its web page `/china-2025/syllabus-2025/` now returns 404, but the PDF is still online. | https://ioai-official.org/wp-content/uploads/2025/06/Syllabus-2025-Final.pdf [H] |
| 2026 Astana | **"IOAI 2026 Syllabus"** (3 pp, LaTeX; PDF created 1 Oct 2025) | 1 Oct 2025 | **Current.** `ioai-official.org/syllabus` redirects here. The IOAI Education Hub links to it as the "Official IOAI Syllabus". | https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf · page: https://ioai-official.org/republic-of-kazakhstan/syllabus-2026/ [H] |
| 2027 Singapore | **Not published yet.** | – | Watch `ioai-official.org/syllabus`. Each year "the IOAI International Scientific Committee (ISC) updates the official syllabus". | – [H] |

**Governance.**
- IOAI Regulations define the Syllabus as "the official academic framework approved by the ISC and the Board that outlines the scope of knowledge and skills expected for participation in the IOAI. It serves as a guideline for task development and team preparation."
- The ISC develops it. Any change needs Board approval.
- The Contest Rules state that "The tasks of the Individual Contest are designed in accordance with the IOAI Syllabus."
- The 2026 Call for Tasks required proposed tasks to "be aligned with the IOAI Syllabus".
- Questions go to **isc@ioai-official.org**. [H]

**How the ISC described the 2026 revision** (May 2026 community-meeting slides): *"IOAI 2026 Syllabus: Broader, Stricter, More Multimodal — From a list of ML tools to reusable AI concepts across data types."* [H]
- **Broader:** feature engineering, data processing, embeddings, attention and Transformers, audio models, diffusion models.
- **More strict:** "Not listed = excluded", less open-ended wording, fewer tool-specific items.
- **Multimodal:** text, tabular, image, audio, video, time-series.

---

## 2. The IOAI 2026 Syllabus: complete topic list (current)

### 2.1 Category definitions (verbatim, abridged only where marked …)
- **Theory (How it works)**: "Contestants should understand core concepts and theoretical underpinnings—the 'why' behind AI. This may involve studying textbooks, courses, and other resources to delve into the mechanics that power AI algorithms. **Breadth should be prioritized over depth** in covering all relevant topics."
- **Practice (What it does, when to use it, and how to implement it)**: "Contestants should develop practical skills necessary to implement AI methods in code. This includes knowing how to use library functions effectively, call the method on a particular data, and interpret outputs. *Example: While a contestant need not fully dissect the internal workings of the Adam optimizer, they should be able to decide when and how to employ it.*"
- **Both**: "Certain topics require knowledge of both theoretical principles and practical application."
- "**Topics not listed are considered excluded from the syllabus.** Questions can be directed to isc@ioai-official.org." [H]

Legend: **[T]** = Theory only · **[P]** = Practice only · **[B]** = Both. IDs (e.g. `1B3`) are my labels; the mapping table in §6 uses them.

### 2.2 Topic list

**1. Foundational Skills & Classical Machine Learning** (25 subtopics: 10 B, 14 P, 1 T)
- **1A Programming Fundamentals**
  - `1A1` Python Basics (Loops, Functions, etc.) **[P]**
  - `1A2` NumPy and Pandas for Data Handling **[P]**
  - `1A3` Matplotlib and Seaborn for Visualization **[P]**
  - `1A4` Scikit-learn for ML **[P]**
  - `1A5` PyTorch Basics **[P]**
  - `1A6` Tensor (Multi-dimensional Array) Manipulation **[P]**
  - `1A7` Training Models on CPU and GPU **[P]**
- **1B Supervised Learning**
  - `1B1` Linear Regression **[B]**
  - `1B2` Logistic Regression **[B]**
  - `1B3` L1 & L2 Regularization **[B]**
  - `1B4` K-Nearest Neighbors (K-NN) **[B]**
  - `1B5` Decision Trees **[B]**
  - `1B6` Model Ensembles (Gradient Boosting, Bagging, Random Forest) **[P]**
  - `1B7` Support Vector Machines (SVM) **[B]**
- **1C Unsupervised Learning**
  - `1C1` K-Means Clustering **[B]**
  - `1C2` Principal Component Analysis (PCA) **[B]**
  - `1C3` t-SNE, UMAP **[P]**
  - `1C4` DBSCAN, Hierarchical & Spectral Clustering **[P]**
- **1D Data Science Fundamentals**
  - `1D1` Model Evaluation Metrics (Accuracy, Precision, Recall, F1-Score, etc.) **[B]**
  - `1D2` Underfitting, Overfitting **[T]** ← the only Theory-only item in the whole syllabus
  - `1D3` Hyperparameter Tuning **[P]**
  - `1D4` Cross-Validation **[P]**
  - `1D5` Confusion Matrix and ROC Curves **[B]**
  - `1D6` Feature Engineering\* **[P]**
  - `1D7` Data Processing\*\* **[P]**

> \* *Feature Engineering* (verbatim footnote): "involves transforming raw, potentially high-dimensional data, categorical data, time series, or ragged data into a compact set of informative features. Techniques involve sliding windows, pooling operations, one-hot encoding, statistical moment-based features (average, standard deviation), PCA and neural-network-based embeddings."
>
> \*\* *Data Processing* (verbatim footnote): "concerns the handling of missing data and irregular data, including in sequence modeling settings. Techniques involve basic imputation strategies (mean/median/forward-fill for sequences) and padding for variable-length sequences. Covered here are also normalization and standardization techniques, train/validation/test splitting strategies, basic data augmentation (flipping, cropping, noise addition), tokenization and vocabulary building for text and audio and patching for images." [H]

**2. Neural Networks & Deep Learning** (18 subtopics: 11 B, 7 P)
- **2A Neural Networks**
  - `2A1` Perceptron Basics **[B]**
  - `2A2` Gradient Descent **[B]**
  - `2A3` Backpropagation **[B]**
  - `2A4` Activation Functions (ReLU, Sigmoid, Tanh) **[B]**
  - `2A5` Loss Functions (MSE, MAE, Cross Entropy, etc.) **[B]**
- **2B Deep Learning**
  - `2B1` Multi-Layer Perceptrons (MLP) **[B]**
  - `2B2` Data Embeddings (text, image, audio) **[B]**
  - `2B3` Pooling Techniques (Max, Average) **[B]**
  - `2B4` Attention Mechanism **[B]**
  - `2B5` Transformers **[B]**: "theory needed only for text and image". Transformer theory for audio is therefore excluded; audio Transformers are practice only.
  - `2B6` Autoencoders **[P]**
  - `2B7` SGD, Mini-Batch Gradient Descent **[B]**
  - `2B8` Momentum Methods (Adam, AdamW) **[P]**
  - `2B9` Convergence and Learning Rates **[P]**
  - `2B10` Regularization: Dropout, Early Stopping, Weight Decay **[P]**
  - `2B11` Weight Initialization **[P]**
  - `2B12` Batch Normalization **[P]**
  - `2B13` Model Finetuning (full and parameter-efficient) **[P]**

**3. Computer Vision** (10 subtopics: 1 B, 9 P)
- **3A Fundamentals**
  - `3A1` Convolutional Layers **[B]**
  - `3A2` Image Classification **[P]**
  - `3A3` Object Detection (YOLO, SSD, DERT [sic, = DETR]) **[P]**
  - `3A4` Image Segmentation (U-Net) **[P]**
  - `3A5` Pre-trained Vision Encoders (e.g. ResNet) **[P]**
  - `3A6` Image Augmentation **[P]**
  - `3A7` Generating Images with GANs **[P]**
  - `3A8` Self-Supervised Learning for Vision **[P]**
  - `3A9` Vision-text encoders (e.g. CLIP) **[P]**
  - `3A10` Diffusion Models **[P]**

**4. Natural Language Processing & Audio** (7 subtopics: 2 B, 5 P)
- **4A NLP**
  - `4A1` Text Classification **[P]**
  - `4A2` Pre-trained Text Encoders (e.g. BERT) **[B]**
  - `4A3` Language Modeling **[B]**
  - `4A4` Encoder-Decoder Models (e.g. for Machine Translation or Vision-Language Modeling) **[P]**
  - `4A5` Pre-trained Language Models (open-source and API-based ones) **[P]**
- **4B Audio Processing**
  - `4B1` Pre-trained Audio Encoders: HuBERT **[P]**
  - `4B2` Audio Models: Qwen-Audio, Whisper, Voxtral **[P]**

> **NB (verbatim):** "The data can be text, tabular, image, audio, video, and time-series, and should be processed with the methods above." [H]

**Totals.** I verified these by parsing the PDF text and checking against the rendered pages. [H]

| | Count |
|---|---|
| Subtopics | 60 |
| Theory only | 1 |
| Both | 24 |
| Practice only | 35 |

### 2.3 Theory-only and Both items: what can be examined conceptually

These are the 25 items an MCQ/theory paper such as the NOAI Prelim or Final Section 1 can legitimately probe "from the inside". [L]

| Section | Items |
|---|---|
| Classical ML | Linear regression · logistic regression · L1/L2 regularisation · k-NN · decision trees · SVM · k-means · PCA · evaluation metrics · confusion matrix and ROC · **under/overfitting (Theory)** |
| Neural networks | Perceptron · gradient descent · backpropagation · activations · loss functions |
| Deep learning | MLP · embeddings · pooling · attention · Transformers (text/image) · SGD/mini-batch |
| CV / NLP | Convolutional layers · pre-trained text encoders (BERT) · language modelling |

### 2.4 Tools and libraries

**Named in the syllabus:**
- Python
- NumPy
- Pandas
- Matplotlib
- Seaborn
- scikit-learn
- PyTorch
- Model names as examples: YOLO, SSD, DETR, U-Net, ResNet, CLIP, BERT, HuBERT, Qwen-Audio, Whisper and Voxtral

**Not named in the syllabus but provided in the 2026 contest image** (Technical Appendix v4, June 2026) [H]:

| Group | Libraries |
|---|---|
| Core AI/ML | torch, torchvision, torchaudio, transformers, accelerate, peft, trl, scikit-learn, xgboost, lightgbm, catboost, sentence-transformers, datasets, evaluate, spacy, nltk, gensim, fasttext |
| Data | numpy, pandas, scipy, polars, pyarrow, h5py |
| CV | opencv-python, Pillow, scikit-image, albumentations |
| Visualisation | matplotlib, seaborn, plotly |
| Utilities | tqdm, joblib, tensorboard, pytorch-lightning, pydantic, pyyaml |

**TensorFlow and Keras are not available.** No packages can be installed during the contest. [H]

In practice, Hugging Face (`transformers`, `datasets`, `peft`, `sentence-transformers`) is required for many tasks. Pre-trained weights are pre-cached, and the docs at `huggingface.co/docs` are whitelisted. [H/M]

### 2.5 Maths prerequisites: not listed by IOAI (my inference [L])

The IOAI syllabus lists **no mathematics**. However, the Theory and Both items cannot be understood without the maths below. NOAI, by contrast, **explicitly** assesses Mathematics: Linear Algebra, Calculus, Probability and Optimisation (see `official_facts.md`).

| Maths area | Needed for (syllabus IDs) |
|---|---|
| Vectors, dot product, matrix multiplication, norms | 1B1, 1B2, 1B7, 2A1, 2B1, 2B4 (QKᵀ/√d), 2B2 (cosine similarity), 3A1 |
| Eigenvectors and variance (PCA), distance metrics | 1C2, 1B4, 1C1, 1C4 |
| Derivatives, partial derivatives, chain rule, gradient | 2A2, 2A3, 2B7–2B9, 1B1 (closed form vs GD) |
| Probability, log, exp, softmax, sigmoid, entropy, cross-entropy | 1B2, 1B5 (Gini and entropy), 2A4, 2A5, 4A3 |
| Basic statistics (mean, std, standardisation), train/test logic | 1D1–1D7 |

---

## 3. What is explicitly or effectively excluded

**Explicit statements** [H]:
- "Topics not listed are considered excluded from the syllabus."
- Transformers: "theory needed only for text and image".
- Practice items, for example Adam: you "need not fully dissect the internal workings", but you must know when and how to use them.
- Contest environment: no TensorFlow or Keras, no package installs, no internet downloads of models, and no external LLM, copilot or API unless a task explicitly allows it.

**Listed in 2025 but dropped in 2026, so now excluded by the "not listed" rule** [H, from diffing the two PDFs]:
- **Experiment tracking:** Weights & Biases.
- **Reproducibility Basics** (seed, devices, inference). The tasks still demand deterministic notebooks.
- **Other dimensionality reduction methods.** The item narrowed to t-SNE and UMAP only.
- **Removed or merged regularisers and encoders:** Gaussian-noise regularisation, sparse encoders and "Adaptive Learning Rates" as a separate item.
- **Model names that disappeared:** MobileNet, and "Stable Diffusion, DALL·E" (now generic "Diffusion Models"). "Vision Transformers (ViT) Basics" is no longer a separate item, but ViT is covered by "Transformers (theory for text and image)".
- **Word2Vec and GloVe** word embeddings, replaced by generic "Data Embeddings".
- **LLM application topics:** Question Answering with pre-trained models, "Introduction to LLMs (e.g., GPT-4)", Building Simple Chatbots and **LLM Agents Basics**.

**Never listed in the 2025 or 2026 syllabus** (keyword-checked in both PDFs) [H]:
- Recurrent networks (RNN, LSTM, GRU)
- Reinforcement learning
- Naive Bayes and Bayesian methods
- Classical AI search and planning (BFS/DFS, A\*, minimax), and logic/knowledge representation
- Graph neural networks
- Recommender systems
- Classical time-series models such as ARIMA (time-series *data* is in scope)
- AI ethics

Note that the IOAI Education Hub blurb says the syllabus includes "AI ethics", but the PDF does not. Treat the PDF as authoritative.

**Caveat** [M]:
- "Excluded" means the task will not *require you to know* the topic. It does not mean a task can never touch it.
- Day-2 tasks combine listed building blocks in new ways. Examples from 2026:
  - adversarial pixel perturbations in *Double Agent Dilemma*, built from gradients with respect to the input
  - behaviour cloning of robots, framed as supervised classification rather than RL
  - an interactive 20-questions search
- **The NOAI papers go beyond this list.** The NOAI Prelim has Mathematics, Computing and Problem-Solving domains (for example algorithms, debugging and system design). NOAI Final tasks asked for from-scratch implementations of items that IOAI marks Practice-only, such as gradient boosting from scratch in 2026.

---

## 4. Changes from the 2025 to the 2026 syllabus

**IOAI 2025 Syllabus at a glance** (64 subtopics: 42 P, 21 B, 1 T; 4 sections) [H]:

| Section | Topic group | Subtopics (category) |
|---|---|---|
| 1 Foundational Skills & Classical ML | Programming Fundamentals | Python basics, NumPy/Pandas, Matplotlib/Seaborn, scikit-learn, PyTorch basics, tensor manipulation, **Reproducibility basics (seed, devices, inference)**, training on CPU/GPU, **Weights and Biases (experiment tracking)**: all P |
| | Supervised | Linear reg. B, Logistic reg. B, k-NN B, Decision Trees B, **Random Forests P**, **Gradient Boosting (e.g. XGBoost) P**, SVM B |
| | Unsupervised | K-Means B, PCA B, "t-SNE, MAP [sic], Other Dimensionality Reduction Methods" P, DBSCAN P, Hierarchical Clustering P |
| | **Evaluation** | Metrics B, Under/Overfitting T, Hyperparameter Tuning P, Cross-Validation P, Confusion Matrix & ROC Curve B |
| 2 Neural Networks & DL | Neural Networks | Perceptron B, GD B, Backprop B, Activations B, **Cost** Functions B |
| | Deep Learning | MLP B, SGD/Mini-batch B, Momentum (Adam, AdamW) P, **Adaptive Learning Rates P**, **Convergence and Learning Rates B**, Weight Regularization P, Early Stopping P, **Dropout, Gaussian Noise** P, Weight Init P, BatchNorm P, **Autoencoders and Sparse Encoders** P |
| 3 Computer Vision | Computer Vision | Fundamentals of Conv Layers B, **Pooling B**, **Basic Image Classification B**, Object Detection Basics (YOLO, SSD) P, Segmentation Basics (U-Net) P, **Transfer Learning (ResNet, MobileNet) P**, Augmentation P, **Feature Extraction Using Pre-Trained Models P**, Intro to GANs P, Intro to SSL for Vision P, **ViT Basics P**, **CLIP and Multimodal Learning P**, **Generative Models such as Stable Diffusion, DALL·E P** |
| 4 NLP | NLP | **Word Embeddings (Word2Vec, GloVe) P**, **Transformers Basics (Attention) B**, Text Classification P, **Intro to Pre-trained NLP Models (BERT, GPT) P**, **QA with Pre-trained Models P**, **Intro to LLMs (e.g., GPT-4) P**, **Building Simple Chatbots P**, **Model Fine-Tuning: Methods and Limitations (LoRA, Adapters) P**, **LLM Agents Basics P** |

**What changed from 2025 to 2026** [H]:

| Change | Detail |
|---|---|
| **Added** | L1 & L2 Regularization [B]; Bagging (inside Model Ensembles); Spectral Clustering; **Feature Engineering [P]** and **Data Processing [P]** (with detailed footnotes); **Data Embeddings (text, image, audio) [B]**; **Attention Mechanism [B]** as its own item; **Language Modeling [B]**; **Encoder-Decoder Models [P]**; **Audio Processing**: HuBERT, Whisper, Qwen-Audio, Voxtral [P]; the NB on six data modalities; the sentences "Breadth should be prioritized over depth" and "Topics not listed are considered excluded". |
| **Moved** | Pooling: CV → Deep Learning. Transformers: NLP → Deep Learning (theory for text and image). Fine-tuning: NLP → Deep Learning ("full and parameter-efficient"). |
| **Upgraded** | Pre-trained text encoders (BERT): P → **B**. |
| **Downgraded** | Image Classification: B → **P**. Convergence & Learning Rates: B → **P**. |
| **Renamed or merged** | "Evaluation" → "Data Science Fundamentals". "Cost" → "Loss" functions. Random Forests + Gradient Boosting → Model Ensembles. Weight reg. + Early stopping + Dropout → "Regularization: Dropout, Early Stopping, Weight Decay". Transfer learning + Feature extraction → "Pre-trained Vision Encoders (e.g. ResNet)". CLIP → "Vision-text encoders". Stable Diffusion/DALL·E → "Diffusion Models". Object detection now also names DETR (written "DERT"). Section 4 renamed "Natural Language Processing & Audio". |
| **Removed** | See §3: W&B, reproducibility, Gaussian noise, sparse encoders, adaptive LR, MobileNet, ViT basics as an item, Word2Vec/GloVe, QA, GPT-4, chatbots, LLM agents. |

---

## 5. Competition format

### 5.1 Edition-by-edition comparison

| | **2024 Burgas, Bulgaria** (9–15 Aug) | **2025 Beijing, China** (2–9 Aug) | **2026 Astana, Kazakhstan** (2–8 Aug) | **2027 Singapore** (4–10 Jul) |
|---|---|---|---|---|
| Scored unit | **Team** (teams of up to 4; 41 teams from 32 countries/territories) | **Individual** (284 ranked contestants) | **Individual** (440 ranked + 26 GAITE; 108 countries/territories) | Individual (presumed [L]). **One national team per country** (≤4 contestants) [H] |
| Main contest | **Scientific Round** = at-home stage (3 tasks, about 1 month) + on-site stage (3 tasks, **8 h**). One task each in NLP, ML and CV. The on-site tasks continued the at-home ones. | **Individual Contest**: at-home round (3 tasks, released 1 Jul 2025, about 1 month before; **educational only**). Day 1: 3 tasks that are "an extension and continuation of the at-home tasks", **6 h**. Day 2: "2 or 3" (in fact 3) novel tasks, **6 h**. | **Individual Contest**: at-home round 1–15 Jul 2026 on **Kaggle** (3 tasks, **educational only**; teachers may help). Day 1 (4 Aug, 10:00–16:00): 3 tasks, each "connected, in subject matter or method, to at least one of the at-home tasks". Day 2 (6 Aug, 09:00–15:00): 3 "new and previously unseen" tasks. **6 h each.** | Not yet published (2027 Contest Rules pending) |
| Creative / team round | **Practical Round**: 4 h, 2 tasks (AI image generation + AI video generation: album cover and music video for Maria Ilieva's "Love"). Scored by jury plus peer voting. | **Team Challenge** "Factory of the Future": programming **Galbot** humanoid robots, with a simulation stage and a real-robot final | **Team Challenge** with Galbot robots in 4 rounds: at-home (from 10 Jul), simulation round for all teams (3 Aug, 15:00–20:00), practice on robots (top 10, 4–6 Aug), final (top 10, 7 Aug) | TBA |
| Platform | Google Colab notebooks; L4 GPU stated in the constraints; models pushed to Hugging Face Hub | **Bohrium** (ioai.bohrium.com) web Jupyter + GPU (≥24 GB RAM); VSCode and PyCharm locally; Python 3.12.7 | **Yandex Contest** platform + web **JupyterLab** on GPU; laptops run Ubuntu with no GPU; VSCode offline; **Python 3.13** | TBA |
| GPU | Colab L4 | "identical GPU resources … minimum RAM of 24 GB" | NVIDIA **H200** split into 7 MIG slices. The appendix says the VRAM limit is "18GB"; task statements say "≈16 GB VRAM". 5 GB storage per task. | TBA |
| Built-in LLM | – | **GPT-4o-mini**, ≤4000 tokens/query (in Bohrium) | **Gemma 3**, ≤1000 output tokens/query (GAITE: Gemma 4, ≤2000) | TBA |
| Medals | 4 G / 7 S / 10 B to teams (Scientific); Singapore 2 = 3rd and Singapore 1 = 4th (both Gold) | 24 G / 47 S / 71 B | 37 G / 73 S / 110 B / 62 Honourable Mentions | TBA |

Sources: 2024 Tasks page, 2024 Results page, 2024 press release, 2025 Contest Rules v2.3/2.4, IOAI-2025 repo README, 2026 Contest Rules v4 + Technical Appendix v4, May/June 2026 community-meeting slides, 2026 schedule page, IOAI-2026 repo README, IOAI 2026 closing press release, and the Sept 2026 community meeting. [H]

**How 2024 at-home and on-site scores were combined.** The 2024 contest rules could not be found.
- A search-engine summary says teams got the at-home problems "6 weeks in advance" [L]. The official pages say "one month".
- The weighting of at-home vs on-site in the 2024 team score is **unconfirmed**.

### 5.2 Individual Contest rules in detail (IOAI 2026 Contest Rules v4, May 2026, + Technical Appendix v4, June 2026) [H]

**Eligibility**
- Contestants must be ≤20 on 1 July of the IOAI year; for 2027 that means born on or after 1 Jul 2007 [L: arithmetic].
- They must have been enrolled full-time in primary or secondary school on or after 1 Dec of the previous year.
- They must be a citizen, or a bona fide long-term resident with at least 1 year of education already done in the country and at least 2 years in total.
- "IOAI tourism" (attempting the selection of two countries in the same year) is banned.

**Contest schedule**
- At-home contest: 3 problems, "about one month before … for educational purposes, and the results … do not affect the final results".
- Practice session: mandatory, no score.
- Contest 1: 3 tasks, 6 h, linked to the at-home tasks.
- Contest 2: 3 tasks, 6 h, "new and previously unseen problems".

**Environment**
- Python in a Jupyter notebook. Core libraries are **torch and scikit-learn**. TensorFlow and Keras are not available.
- Identical machines. Tasks may require writing code, fitting models, and running inference.
- Contestants may have to submit **code, trained models and/or predictions**. There is **no extra training time after the end**.
- "Limited access to the Internet": contestants cannot download pretrained models or use external AI APIs. Only the pre-cached, task-listed models may be used.

**Whitelisted websites** (Technical Appendix)
- python.org
- pypi.org
- numpy.org
- pandas.pydata.org
- scikit-learn.org
- pytorch.org
- matplotlib.org
- scipy.org
- huggingface.co/docs
- a translation service

No log-in or posting is allowed, and screens may be monitored and recorded.

**Evaluation limits** (Technical Appendix)
- Default notebook runtime is **20 min per task** unless the task says otherwise. Task statements in 2026 set **5–12 min**.
- At most **60 submissions per task**. Submissions can be concurrent and are queued.

**2026 submission mechanics** (task statements)
- Submit `solution.ipynb` (usually ≤1 MB) by committing it through the JupyterLab Git tab and then pressing Submit.
- At grading, `dataset/test_public/` is replaced by the hidden `test_leaderboard_a` and `test_leaderboard_b` sets, so the notebook must run end-to-end on unseen data within the time limit. [M]

**Datasets and feedback**
- **Training** data comes with labels. **Validation** data has no labels and produces the live "Scoreboard A" (your own score plus the anonymous best score). **Test** data produces the hidden "Scoreboard B".
- **Official ranking and medals use Scoreboard B only.** No ranking is revealed until the closing ceremony.

**Scoring** (0–100 per task; a task's score is the sum of its subtasks)
- `Norm_Score = (Submission_Score − Min_Score) / (Max_Score − Min_Score) × 100`
- `Min_Score` is the baseline solution's score. `Max_Score = max(0.9 × SC_Solution, best contestant submission)`.
- Worked example from the rules: accuracy 85%, baseline 60%, SC solution 95%, best contestant 90%. Then Max = max(85.5%, 90%) = 90%, so Norm = 25/30 × 100 = **83.33** (I verified this in Python).
- Computed in double precision and displayed to 4 decimal places.
- Each day's maximum is 300, and the total maximum is **600**.

**Medals** (based solely on the Individual Contest total)
- Gold cut-off is "the highest score that ensures at least one-twelfth" of contestants get gold.
- Gold+Silver covers at least ¼ of contestants; any medal covers at least ½.
- **Honourable Mention** goes to a non-medallist who beat at least half of the contestants on at least one day.
- Trophies go to places 1–3.
- Python check against the official results: 2026 N=440 gives ≥37 / ≥110 / ≥220, and the actual counts were 37 / 110 / 220. 2025 N=284 gives 24 / 71 / 142, matching exactly.

**Other rules**
- Translation: the session starts 3 h before each contest, and the English original plus all translations are available to contestants.
- Clarification requests are answered Yes/No or with a section reference.
- Supplies: paper and pens are provided. Electronic devices, calculators, books and storage media are banned. You may bring your own keyboard or mouse if approved.
- Appeals are filed by team leaders only.

**GAITE** ("Global AI Talent Empowerment")
- An entry track for new IOAI countries. It uses the **same tasks** as the Individual Contest from 2026 (in 2025, Day 2 was simpler).
- Contestants get **hints** and a stronger LLM.
- It has a separate scoreboard and gives "Level One/Two/Three Awards", not medals.
- A country cannot enter both IOAI and GAITE. [H]

**Team Challenge**
- Team members sit together and may cooperate. Tools and computers are task-specific, and there is no translation.
- Trophies go to the top 3 teams. It has **no effect on medals**. [H]

**IOAI² AI Models Track** (new in 2026)
- 15 autonomous AI systems got 2 h each on the same 6 tasks (on Kaggle).
- All 15 reached the student gold-medal threshold or above, and 13 beat the top student total. IOAI notes the conditions were not equal.
- This is irrelevant for contestants but a useful talking point. [H]

### 5.3 At-home round
- **2025:** Published 1 Jul 2025, "exactly one month before the Individual Contest". Bohrium accounts with GPU were provided. Contestants were "expected to complete the At-Home Tasks individually"; team leaders could give "general guidance and hints". An ISC workshop on syllabus topics was held on 11 Jul 2025.
- **2026:** 1–15 Jul 2026 on Kaggle, with feedback and appeals until 17 Jul. "Contestants may seek help from their teachers." It is practice only. Notebooks were also published as Colab notebooks on GitHub. [H]
- **2027:** IOAI is a month earlier (4–10 Jul), so expect the at-home round around **early to mid June 2027**. The AISG timeline shows an "IOAI home task" in **Jun 2027**. [H/L]

---

## 6. Mapping past IOAI problems to the 2026 syllabus

IDs refer to §2.2. All task facts come from the official task notebooks and statements: local copies in `sources/` and the `IOAI-official/IOAI-2024`, `IOAI-2025` and `IOAI-2026` GitHub repositories. [M]

### 6.1 IOAI 2024 (Burgas): Scientific Round (team; Google Colab)

| Stage | Task | Domain | What you had to do | Constraints, models, metric | Syllabus items |
|---|---|---|---|---|---|
| At-home | **Save the Factory** | ML | Classify widgets (Ruby vs Sapphire) from a 187×8 signal array by engineering features | **Only** a DecisionTreeClassifier of limited depth (2 difficulty levels); ROC AUC; ≤5 min on CPU | 1D6, 1B5, 1D5, 1A2, 1D2 |
| At-home | **Help BOBAI: classify an unknown language** | NLP | Build a text classifier for an encrypted language that mBERT was never trained on, using a small labelled set and a large raw corpus | Must be based on mBERT; train in <8 h on L4; push the model to HF Hub | 4A2, 4A1, 4A3 (continued pre-training on raw text), 2B13, 1D7 (tokenisation) |
| At-home | **Lost in Translation** | CV / GenAI | Retrain **miniSD** (Stable Diffusion) so that "giraffe" draws a zebra and vice versa, leaving everything else unchanged | May update the UNet/VAE but not the text encoder or tokenizer; <3 h on L4 | 3A10, 2B13, 2B2, 1A5 |
| On-site (8 h) | **Lost in a Hyperspace** | ML | Predict 3 properties of a 5×5×5×6 "hypercube" with many symmetries | **Only** LinearRegression; ≤300 features; RMSE; ≤5 min on CPU; no supervised feature extractors or pretrained models. Winning ideas: axis-permutation augmentation + PCA + reusing a feature from the at-home task. | 1B1, 1D6, 1C2, 1D7, 1A6 |
| On-site | **Help BOBAI: more classification** | NLP | Extend a deployed 5-way linear classifier on cached mBERT pooled embeddings to 7 classes, **without changing it or adding learned parameters** | Only averages and distances allowed; F1; time limits on L4. Best solution: centroid/k-NN logic on standardised embeddings. | 2B2, 1B4, 1B2, 1D1 |
| On-site | **The Madarian Cow Mystery** | CV / GenAI | Make miniSD add a fire hydrant whenever a cow is drawn, and only then, by editing **only the mean text embedding and the initial latents** | No retraining; a DETR detector judged the outputs | 3A10, 2B2, 3A3, 1A5 |
| Practical (4 h) | Album cover + music video | Creative GenAI | Use existing AI image and video tools | Jury + peer vote | *outside the syllabus* |

### 6.2 IOAI 2025 (Beijing): Individual Contest (Bohrium)

| Stage | Task | Domain | What you had to do | Constraints, models, metric | Syllabus items |
|---|---|---|---|---|---|
| At-home | **Radar** | CV / signal | Find where humans are in radar heatmaps (tensors of 7×50×181) | Weighted accuracy | 3A4, 3A1, 1D7, 1A6, 2A5 |
| At-home | **Satellite Weather Forecasting** | CV | Produce a per-pixel rain/no-rain mask from GOES-16 imagery plus sun angle, time and location | Pretrained U-Net baseline | 3A4, 3A5, 2B13, 1D6 |
| At-home | **Chameleon** | NLP / multimodal | Guess a secret word from an ordered sequence of icons, returning up to 10 ranked guesses | Model <1B parameters; no APIs at inference; Hits/NDCG-style | 2B2, 4A2, 4A5, 1D1 |
| Day 1 | **Radar** (continued) | CV | Radar semantic segmentation | Weighted point score; SC 0.90 / baseline 0.67 | 3A4, 3A1, 2A5, 1D1, 1D7 |
| Day 1 | **Chicken Counting** (continues Weather) | CV | Count chickens by **density-map regression** | Pretrained 4-layer feature extractor + your own decoder (U-Net style); output 180×320 density map; score = exp(−mean relative error) | 3A5, 3A4, 2A5, 2B13, 3A6 |
| Day 1 | **Concepts** (continues Chameleon) | NLP / LLM | Generate clues (up to 4 icon sequences) so that an LLM guesser finds the secret word | Small LLMs (Qwen3-0.6B, Qwen2.5-0.5B …) and many embedding models; vLLM and unsloth available; 0.9·Hits@10 + 0.1·NDCG@10 | 4A5, 4A3, 2B2, 2B13, 1D1 |
| Day 2 | **Restroom Icon Matching** | CV | Given a cropped icon, retrieve the opposite-gender icon from the same restroom | 82 training restrooms; accuracy. Reference solution: partially fine-tuned CLIP ViT-B/32 + cosine retrieval. | 3A9, 2B2, 2B13, 3A6 |
| Day 2 | **Antique Painting Authentication** | ML | Classify paintings as authentic or replica using 5 features, where most labels are unknown (**semi-supervised**) | Accuracy. Reference solution: Spectral Clustering (RBF) → pseudo-labels → SVM. | 1C4, 1B7, 1C1, 1D7 |
| Day 2 | **Pixel Efficiency** (results page: "Pixel Parsimony") | CV / multimodal | Keep one rectangle with ≤6.25% of the pixels so that **CLIP ViT-L/14** zero-shot still classifies the animal (an "other" class is added) | Accuracy. Reference solution: search over patch masks using CLIP attention. | 3A9, 3A5, 2B4, 2B5 |
| Team Challenge | Factory of the Future (Galbot) | Robotics | Program a humanoid robot to tidy a warehouse | Simulation + real robot | *outside the syllabus* |
| GAITE only | e.g. Synthetic Speech Detector, Resonance Elf, Combinatorial Word Segmentation | Audio / NLP | — | — | 4B, 4A (audio appeared here a year before it entered the syllabus) |

Singapore's two gold medallists in 2025 (Kieran Chai, 2nd; Wang Jiayu, 3rd) scored 27.52 on Restroom but 80–92 on Concepts. That is an example of how one weak task can be offset elsewhere. [M]

### 6.3 IOAI 2026 (Astana): Individual Contest (Yandex Contest + JupyterLab)

| Stage | Task | Domain | What you had to do | Constraints, models, metric | Syllabus items |
|---|---|---|---|---|---|
| At-home 1 | **Operation Night Watch** | Audio | Teach a deployed **Audio Spectrogram Transformer** 13 new sound classes **without forgetting** its 16 old ones | Must start from the checkpoint; ~10 min GPU training; score = ½·acc_old + ½·acc_new | 4B1, 2B5, 2B13, 2B2, 1D7 (log-mel, patching), 1D1 |
| At-home 2 | **Robot Delivery Academy** | ML (imitation) | Use **behaviour cloning** on an 8×8 grid: observation → next action | No planning or search to make extra demos; episode success rate | 2B1, 3A1, 2A5, 1D6 |
| At-home 3 | **The Analytical Language of John Wilkins** | NLP / LLM | Play 20 questions: identify 1 of ~1,400 animals using ≤15 yes/no questions answered by a **Qwen2.5-3B-Instruct** oracle | Score = 1 − 0.02·queries. Winning idea: run the LLM locally to build an animal×question table, then pick questions that split the remaining candidates in half (log₂1400 ≈ 10.5 bits). | 4A5, 1B5 (information gain), 1D6 |
| Day 1 | **Find the Order** (↔ at-home 1) | Audio + NLP | Reorder the shuffled speaker-turn `.wav` files of a dialogue | wav2vec 2.0, Whisper (ASR/encoder), Qwen2.5-0.5B (zero-shot or fine-tuned); 10 min; pairwise ordering accuracy | 4B2, 4B1, 4A3, 4A5, 2B13 |
| Day 1 | **Robot Chasing** (↔ at-home 2) | ML + NLP | From an 8×8×2 grid, the robot's facing direction, a natural-language mission and what it is carrying, predict each of 6 robots' next action | 60k training rows; 5 min; mean per-robot accuracy | 1D6 (one-hot), 1D7 (tokenising missions), 2B1, 2B2, 1D1 |
| Day 1 | **Potato** (↔ at-home 3) | NLP / embeddings | Find a hidden word among 1,602 using only "which is semantically closer" comparisons, in ≤30 turns | Qwen3-Embedding-0.6B, bge-m3, public embeddings; interactive judge; score 1 − 0.02·max(0, t−10) | 2B2, 4A2 |
| Day 2 | **Double Agent Dilemma** | CV / robustness | Craft tiny perturbations so that **ResNet-18** and **ViT-Tiny** disagree (each one fooled while the other stays right) | Fixed preprocessing (Resize 256 → CenterCrop 224 → Normalize); success × norm-penalty factor; SC 96.99 | 3A5, 2B5, 3A1, 2A2, 2A3, 1D7 |
| Day 2 | **Ghost of the Machine** | NLP | Find the character index where human-written text switches to an LLM continuation | Only **bge-base-en-v1.5** (frozen or fine-tuned) + any classical ML; score exp(−\|p−t\|/100); baseline 28.6 / SC 93.41 | 4A2, 4A1, 1D6 (sliding windows), 2B13 |
| Day 2 | **IOAI Field** | DL fundamentals | Train an MLP **from scratch** (≤20,260 parameters, torch only) to reproduce a 2-D "logo field". It contains a 1e10-scale gradient, a spiral, a constant region and a region that must be random **through dropout**. | MAE-normalised per region; parameter penalty; 5 min | 2B1, 2A4, 2A5, 1D7 (scaling), 2B10, 2B9 |
| Team Challenge | Galbot robots | Robotics | Simulation round, then the top 10 on real robots | — | *outside the syllabus* |

### 6.4 Patterns across all 24 Scientific-Round and Individual tasks (2024–2026) [M]

**Most frequently required syllabus items** (number of tasks):

| Syllabus item | Tasks |
|---|---|
| `2B13` fine-tuning | 9 |
| `1D7` data processing | 9 |
| `2B2` embeddings | 9 |
| `1D6` feature engineering | 7 |
| `1D1` metrics | 6 |
| `2A5` loss functions | 5 |
| `3A4` segmentation | 4 |
| `3A5` pre-trained vision encoders | 4 |
| `3A1` convolutional layers | 4 |
| `4A2` pre-trained text encoders | 4 |
| `4A5` pre-trained LMs | 4 |

**Tasks touching each section:**

| Section | Tasks (of 24) |
|---|---|
| §1 Foundational & classical ML | 19 |
| §2 Neural networks & DL | 20 |
| §3 Computer vision | 10 |
| §4 NLP & audio | 8 |

**Recurring patterns:**
1. **Constrained modelling.** Many tasks restrict the model on purpose:
   - only a depth-limited decision tree, or only linear regression
   - no new learned parameters
   - <1B parameters, or ≤20,260 parameters
   - only listed pretrained models
   - 5–12 min runtime

   Success comes from feature engineering and understanding the method, not from a bigger model.
2. **Adapting pre-trained models** comes up again and again: mBERT, Stable Diffusion, CLIP, AST, Whisper, Qwen, bge. Examples include class-incremental learning (2024 NLP on-site, 2026 at-home 1), partial fine-tuning, and LoRA.
3. **Multimodality grows each year.** 2024 covered text, tabular and image. 2025 added radar signals and icons. 2026 added audio, robot grids and interactive games.
4. **Interactive and non-standard outputs** appear: dialogue ordering, games with a judge, perturbation tensors, density maps.
5. **Day 1 rewards doing the at-home tasks.** The 2024 ML on-site author solution says outright: "One of the features is from the previous task, gives biggest improvement, so home-task knowledge definitely helps."

---

## 7. Official IOAI learning resources

**IOAI Education Hub** — https://ioai-official.org/resources/ [H]

*Syllabus and past tasks*
- Official Syllabus (2026)
- IOAI 2024 and 2025 task repositories. The 2026 repository is also public: https://github.com/IOAI-official/IOAI-2026
- The IOAI-official GitHub organisation has 5 public repositories: IOAI-2024, IOAI-2025, IOAI-2026, IOAI-AI-Models-Track and translation. The IOAI-2024 description wrongly says "Sofia".

*National and regional olympiad task sets*
- APOAI 2025
- NEOAI 2025 (Northern Eurasia; Kaggle)
- China NOAI 2024/2025
- Georgia, Hungary (HAIO), India (INAIO), Japan (JOAI), Kazakhstan TST 2025, Malaysia TSP 2025, Poland (I/II OlimpiadaAI), Romania ONIA, Serbia, Tunisia, USA-NA AIO
- **Singapore National Selection 2024–2025** (selection tests and camp tasks: https://github.com/teodora-dimitrova/Singapore-Team-Selection.git)
- Aggregated list: https://github.com/open-cu/awesome-ioai-tasks

*Online courses*

| Resource | URL |
|---|---|
| fast.ai Practical Deep Learning | https://course.fast.ai/ |
| Google ML Crash Course | https://developers.google.com/machine-learning/crash-course |
| MIT 6.S191 | https://introtodeeplearning.com/ |
| Elements of AI | https://www.elementsofai.com/ |

*E-books*

| Resource | URL |
|---|---|
| Dive into Deep Learning | https://d2l.ai/ |
| Goodfellow et al., Deep Learning | https://www.deeplearningbook.org/ |
| Machine Learning Yearning | https://info.deeplearning.ai/machine-learning-yearning-book |
| Deep Learning with Python 3e | https://deeplearningwithpython.io/chapters/ |

*Notebooks and slides*

| Resource | URL |
|---|---|
| Kaggle Learn | https://www.kaggle.com/learn |
| PyTorch Tutorials | https://pytorch.org/tutorials/ |
| Stanford CS231n | https://cs231n.stanford.edu/ |
| Stanford CS224n | https://web.stanford.edu/class/cs224n/ |

**IOAI "Freely available educational resources" sheet** — https://docs.google.com/spreadsheets/d/15f4VzUCXrqz2m6hjilVkJVE2YFhjzKeOdY-5PVB2sds/edit (linked from the 2026 syllabus page). It has 29 rows, each with a level. The sheet was exported and parsed on 14 Oct 2026. [H]

| Level | Resource | URL |
|---|---|---|
| Beginner | AI Python for Beginners (Andrew Ng) | https://www.deeplearning.ai/short-courses/ai-python-for-beginners/ |
| Beginner | Elements of AI (Univ. Helsinki) | https://www.elementsofai.com/ |
| Beginner | Python for Everybody (U. Michigan) | https://www.coursera.org/specializations/python |
| Beginner | Data Analysis with Python (IBM) | https://www.coursera.org/learn/data-analysis-with-python |
| Beginner | Google's Python Class | https://developers.google.com/edu/python |
| Beginner | W3Schools NumPy | https://www.w3schools.com/python/numpy/ |
| Beginner | W3Schools Pandas | https://www.w3schools.com/python/pandas/ |
| Beginner | MIT 6.0001 Intro to CS and Programming in Python | https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/ |
| Beginner | Computer Vision Basics (Buffalo) | https://www.coursera.org/learn/computer-vision-basics |
| Beginner | Python Crash Course | https://www.nostarch.com/pythoncrashcourse2e |
| Beginner | Think Python 2e | https://greenteapress.com/wp/think-python-2e/ |
| Beginner | Automate the Boring Stuff | https://automatetheboringstuff.com/ |
| Beginner–Intermediate | CS50 AI with Python (Harvard) | https://www.edx.org/learn/artificial-intelligence/harvard-university-cs50-s-introduction-to-artificial-intelligence-with-python |
| Beginner–Intermediate | Hands-On Large Language Models (Alammar et al.) | https://www.amazon.com/Hands-Large-Language-Models-Understanding/dp/1098150961 |
| Beginner–Intermediate | Generative AI for Beginners (Microsoft) | https://microsoft.github.io/generative-ai-for-beginners/ |
| Beginner–Intermediate | Hugging Face Agents Course | https://huggingface.co/agents-course |
| Beginner–Intermediate | Machine Learning with Python (IBM) | https://www.coursera.org/learn/machine-learning-with-python |
| Beginner–Intermediate | NLTK book (NLP with Python) | https://www.nltk.org/book/ |
| Beginner–Intermediate | Introduction to ML with Python (Müller & Guido) | https://www.oreilly.com/library/view/introduction-to-machine/9781449369880/ |
| Intermediate | Machine Learning Specialization (Ng) | https://www.deeplearning.ai/courses/machine-learning-specialization/ |
| Intermediate | Deep Learning Specialization (Ng) | https://www.deeplearning.ai/courses/deep-learning-specialization/ |
| Intermediate | Deep Learning with Python (Chollet) | https://www.manning.com/books/deep-learning-with-python |
| Intermediate | Intro to Deep Learning with PyTorch (Udacity) | https://www.udacity.com/course/deep-learning-pytorch--ud188 |
| Intermediate | Introduction to Machine Learning notebooks (Sharifi-Zarchi, Sharif Univ.; he is an ISC member) | https://github.com/SharifiZarchi/Introduction_to_Machine_Learning |
| Intermediate | Neural Networks and Deep Learning (Nielsen) | http://neuralnetworksanddeeplearning.com/ |
| Intermediate–Advanced | MIT 6.036 Intro to ML | https://ocw.mit.edu/courses/6-036-introduction-to-machine-learning-fall-2020/ |
| Intermediate–Advanced | MIT 6.034 Artificial Intelligence | https://ocw.mit.edu/courses/6-034-artificial-intelligence-fall-2010/ |
| Intermediate–Advanced | Szeliski, Computer Vision: Algorithms and Applications | http://szeliski.org/Book/ |

The NOAI Learning Resources page draws on this same sheet (see `official_facts.md` §4).

**Other official preparation channels** [H]:
- Annual **ISC workshop** during the at-home round, with short lessons on syllabus topics (11 Jul 2025).
- **Community meetings** with published slides, which include syllabus and format briefings (20 May 2026, 30 Jun 2026, 15 Sep 2026).
- Contacting IOAI alumni through the Alumni chair.
- **EduSpace**: a free, unified 1st-round test that accredited countries may use. Its window is 20 Oct – 24 Nov 2026, and it is relevant to national selection, not to students directly.

---

## 8. Implications for NOAI 2027 preparation [L: my analysis]

1. **Teach the 25 Theory and Both items to depth.** They are what an MCQ can probe: the classical ML algorithms, the NN mechanics, attention/Transformers, embeddings, CNNs, BERT and language modelling. The 35 Practice items need "what it is, when to use it, how to call it" fluency, for example the PyTorch training loop, `sklearn` fit/predict, HF `from_pretrained`, and LoRA via `peft`.
2. **Add what NOAI adds.** NOAI explicitly tests the following, none of which is a section of the IOAI syllabus:
   - Mathematics: linear algebra, calculus, probability, optimisation
   - Computing: Python, NumPy/Pandas, PyTorch, debugging
   - Problem solving: algorithm design, debugging, optimisation, system design
   - Generative AI as its own domain
3. **NOAI Final tasks implement "Practice" items from scratch.**
   - 2025 NOAI: linear-regression gradient descent (1B1/2A2), K-means (1C1), RAG (4A5/2B2).
   - 2026 NOAI: gradient boosting from scratch (1B6), U-Net debugging + mean IoU (3A4/1D1), scaled dot-product and multi-head attention (2B4/2B5).

   So the curriculum should include NumPy/PyTorch from-scratch versions of the core algorithms, not only library calls.
4. **The NTU selection stage and IOAI itself are Kaggle-style notebook contests.**
   - Beat a baseline under time and model constraints, and write an exact output format.
   - Advanced modules should practise this on the public IOAI 2024–2026 tasks (CC-BY-4.0) and on the Singapore selection tasks.
5. **Watch for the IOAI 2027 syllabus.** If published, it overrides the 2026 list. The 2025 → 2026 change shows the ISC is willing to drop topics (LLM agents, chatbots) and add new ones (audio, embeddings, attention, feature engineering), so the site should keep the topic map data-driven.

---

## 9. Discrepancies and uncertainties

| # | Issue | Resolution |
|---|---|---|
| 1 | The brief says IOAI 2026 was in "Abu Dhabi". | It was relocated to **Astana, Kazakhstan, 2–8 Aug 2026**, announced 21 Mar 2026. The original host was MBZUAI, which stayed on as a partner. [H] |
| 2 | 2026 VRAM: the Technical Appendix says "VRAM limit: 18GB" (H200 split into 7 MIG slices); task statements and the repo README say "≈16 GB VRAM". | Both are official. Plan for ~16 GB. [H] |
| 3 | Notebook runtime: the appendix default is 20 min; task statements say 5–12 min. | The task statement overrides the default ("unless explicitly stated"). [H] |
| 4 | 2025 Contest Rules version: the file name says v2.3, the document says "Version 2.4 (August 3, 2025)". | Same file (identical MD5 to the local copy). [H] |
| 5 | 2025 syllabus lists "t-SNE, MAP"; 2026 lists "DERT". | Typos for UMAP and DETR. [H/L] |
| 6 | The Education Hub says the syllabus covers "AI ethics". | Not in the PDF. Follow the PDF. [H] |
| 7 | 2024 at-home lead time: "one month" (official pages) vs "6 weeks" (search-engine summary of an unlocated page). | Use "about one month". The 2024 scoring split is unknown. [L] |
| 8 | Field size 2026: 440 (ranked individual), 462 (repo README: "462 contestants from 103 delegations") and 466 (press release, including GAITE). | Different scopes; use 440 for medal maths. [H] |
| 9 | The IOAI-2024 GitHub description says "Sofia, Bulgaria". | The venue was **Burgas**. [H] |
| 10 | The 2025 Day 2 task is "Pixel Efficiency" in the repo but "Pixel Parsimony Challenge" on the results page. | Same task. [M] |
| 11 | IOAI 2027 format, syllabus and contest rules. | **Not yet published.** Known so far: dates 4–10 Jul 2027, hosts AISG + NTU, **one team per country**, national selection done by 1 Apr 2027, team final by 15 Apr 2027, registration from 2 Nov 2026. [H] |

---

## 10. Sources (all accessed 14 Oct 2026)

**Syllabus**
- IOAI 2026 Syllabus PDF: https://ioai-official.org/wp-content/uploads/2025/10/Syllabus.pdf (redirect target of https://ioai-official.org/syllabus)
- Syllabus page: https://ioai-official.org/republic-of-kazakhstan/syllabus-2026/
- IOAI 2025 Syllabus PDF: https://ioai-official.org/wp-content/uploads/2025/06/Syllabus-2025-Final.pdf

**Rules and regulations**
- IOAI 2026 Contest Rules v4 + Technical Appendix v4: https://ioai-official.org/wp-content/uploads/2026/06/IOAI2026-Contest-Rules-and-Tehnical-Appendix.pdf (page: https://ioai-official.org/republic-of-kazakhstan/2026-contest-rules/)
- IOAI 2025 Contest Rules: https://ioai-official.org/wp-content/uploads/2025/08/Contest-Rules-for-IOAI-2025-version-2.3-1.pdf (page: https://ioai-official.org/china-2025/2025-contest-rules/)
- IOAI Regulations: https://ioai-official.org/wp-content/uploads/2025/08/IOAI-regulations.pdf

**2024 (Burgas)**
- 2024 Tasks page and zips: https://ioai-official.org/2024-tasks/ — At-home, On-site, Best solutions (at-home and on-site), Practical round
- Results: https://ioai-official.org/bulgaria-2024/results/
- Press release: https://ioai-official.org/the-worlds-best-students-in-ai-honoured-at-the-first-international-artificial-intelligence-olympiad-in-burgas-bulgaria/

**Task repositories**
- https://github.com/IOAI-official/IOAI-2024
- https://github.com/IOAI-official/IOAI-2025
- https://github.com/IOAI-official/IOAI-2026

**2025 (Beijing)**
- Results: https://ioai-official.org/china-2025/results-2025/
- Team Challenge guide: https://ioai-official.org/wp-content/uploads/2025/06/2025-IOAI-Team-Challenge-Factory-of-the-Future-Grand-Challenge-.pdf
- At-home announcements: https://ioai-official.org/important-announcement-about-the-home-tasks-and-workshop/ and https://ioai-official.org/ioai-2025-at-home-round-has-now-officially-started/

**2026 (Astana)**
- Results: https://ioai-official.org/republic-of-kazakhstan/results-2026/
- Schedule: https://ioai-official.org/republic-of-kazakhstan/schedule/
- Closing press release: https://ioai-official.org/ioai-2026-concludes-in-astana-kazakhstan/
- IOAI² report: https://ioai-official.org/ai-models-track/ioai%c2%b2-2026-report/
- Call for tasks: https://ioai-official.org/call-for-tasks/

**Community meetings**
- 20 May 2026 slides: https://ioai-official.org/wp-content/uploads/2026/05/20260520_IOAI_Community-meeting.pptx.pdf
- 30 Jun 2026 slides: https://ioai-official.org/wp-content/uploads/2026/07/20260630_IOAI_Community-meeting.pdf
- 15 Sep 2026 slides: https://ioai-official.org/wp-content/uploads/2026/09/20260915_IOAI_Community-meeting.pdf
- Sep 2026 highlights page: https://ioai-official.org/ioai-community-meeting-highlights-september-2026/

**2027 (Singapore)**
- https://ioai-official.org/singapore-2027/
- Timeline: https://ioai-official.org/singapore-2027/ioai-2027-timeline/

**Learning resources**
- Education Hub: https://ioai-official.org/resources/
- Resource sheet: https://docs.google.com/spreadsheets/d/15f4VzUCXrqz2m6hjilVkJVE2YFhjzKeOdY-5PVB2sds/edit

**NOAI context**
- https://noai.aisingapore.org/faqs/ and https://noai.aisingapore.org/noai-2027/ (via `research/official_facts.md`)

**Local copies**
- `sources/ioai_syl/` — syllabi, rules, regulations, slides
- `sources/ioai_dl2/` — 15 Sep 2026 slides, the 2026 rules re-download, the resources sheet `ioai_resources.xlsx`
- `sources/gh_extract/` — 2025/2026 task statements
- `sources/text/ioai_*` — 2024 on-site problems and best solutions
- `sources/ioai_zip/athome/` — 2024 at-home problems
- Verification script: `work/ioai_syl_task/verify.py`
