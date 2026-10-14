# Beyond NOAI: what Singapore's IOAI selection tests and IOAI 2024 on-site tasks demand

*Compiled 14 Oct 2026 for the NOAI-prep site. Scope: the 11 Singapore IOAI pre-selection, selection and residential-camp task notebooks (2024 and 2025 cycles, plus 2 released solution notebooks) released by AI Singapore, plus the three IOAI 2024 on-site Scientific-Round problems and their published best solutions. Context from IOAI 2025/2026 rules and task lists is added for the top rung of the ladder.*

**How to read this file**
- Facts taken from a notebook are marked with that notebook (file list in §8). Everything about durations is **not stated in any notebook** unless noted. Time figures marked **[est.]** are my estimates.
- Numbers marked **(verified)** were recomputed with Python 3 (numpy/pandas/sklearn/torch CPU) in `work/ioai_verify/`. Only student-facing files were read; every file marked "DO NOT SHARE WITH STUDENTS" was skipped.
- Two IOAI 2024 notebooks contain a hard-coded Hugging Face access token. **Do not republish those notebooks verbatim on the website.** Link to the official IOAI zips instead.

---

## 0. Executive summary

1. **The Singapore selection stage is a different sport from NOAI.**
   - NOAI Final: implement a known algorithm *from scratch* in NumPy/PyTorch on CPU in 3 hours (gradient descent, K-means, RAG retrieval, gradient boosting, attention, mIoU, a U-Net shape fix).
   - NTU selection tests and camp tasks: take a **runnable baseline notebook** for a real dataset, **fill in 1–7 missing lines** (augmentation, layers, loss, training step), and then **improve the model open-endedly** with pretrained models on a GPU. Students submit the notebook, a prediction file and/or weights, and short written reports of up to 200–300 words.
2. **The domains match IOAI: CV, NLP and tabular ML in every year.**
   - CV is the heaviest: 5 of 11 SG task notebooks. It ranges from ResNet on CIFAR-10 through CLIP, U-Net, DCGAN and StyleGAN latent editing.
   - NLP covers CNN-for-sentences, BiLSTM NER, RNN toxicity and XLM-R cross-lingual transfer.
   - ML covers tabular classification (mental-health survey, HDB storey range) with sklearn, gradient boosting and feature engineering.
3. **Recurring "hidden" skills:**
   - reading a paper and turning its hyper-parameters into code (ResNet, Kim CNN, CLIP §3.1.4, U-Net, focal loss, DCGAN);
   - handling **class imbalance** (weighted CE, balanced sampling, focal loss, balanced softmax);
   - choosing the **right metric** (per-class P/R, confusion matrix, mIoU, entity-level F1, macro-F1, RMSE);
   - **transfer learning** (partial `state_dict` loading, new head, lower LR for the backbone);
   - **using unlabelled data** (pseudo-labels, domain adaptation);
   - **debugging the starter code**, which itself contains bugs (§3).
4. **IOAI on-site 2024 adds a further layer:**
   - an unusual constraint (only linear regression with at most 300 features; no new learned parameters; may only edit the text-embedding mean and the initial latent of a diffusion model);
   - an automated judge (a DETR detector, RMSE leaderboard, macro-F1);
   - and the winning ideas are **cheap and clever, not big**: symmetry augmentation + PCA + one domain feature; a kNN/centroid gate in front of a frozen classifier; an MLP that detects "cow" prompts plus a handcrafted starting latent.
5. **Consequence for the curriculum.** The NOAI core teaches the fundamentals: maths, NumPy, from-scratch algorithms. A separate **"Beyond NOAI / Selection-ready" track** should teach:
   - the PyTorch training-loop template;
   - torchvision and Hugging Face transfer learning;
   - CLIP and embeddings;
   - imbalance handling;
   - the segmentation and NER metrics;
   - the GAN/latent-space basics;
   - leaderboard hygiene.

   The bridge between the two tracks is already visible: NOAI 2026 Final Q2 (U-Net + mIoU) mirrors the 2025 SG Selection CV test.

---

## 1. Inventory: one row per test or problem

Difficulty scale (relative):
- ★ NOAI Prelim recall
- ★★ NOAI Final (implement a known algorithm, small)
- ★★★ SG selection test (complete a real pipeline, then improve it)
- ★★★★ SG camp (new model families, papers, GPU training, ranked open-ended parts)
- ★★★★★ IOAI on-site (novel constrained problem, approach not scaffolded)

| # | Stage / year | Domain | Task | Dataset | Metric | Libraries / models | Key techniques | Marks | Diff. | Time |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 2024 SG Selection Test | CV | CIFAR-10 classification with ResNet-18 | CIFAR-10 (50k/10k, 32×32, 10 classes) | Test accuracy | torch, torchvision (datasets, transforms), tqdm | augmentation (RandomCrop pad 4, HFlip); build a ResNet stem; `nn.CrossEntropyLoss`; then deeper ResNet, tuning, dropout | not stated | ★★★ | not stated; ~2–3 h [est.] |
| S2 | 2024 SG Selection Test | NLP | Sentence sentiment with Kim (2014) CNN; reproduce the paper, then improve | MR / Rotten Tomatoes (HF `jeffnyman/rotten_tomatoes_reviews`) | Accuracy (val for model choice, test reported) | torch, torchtext (tokenizer, vocab), HF `datasets` | read the paper sent a week before; add dropout 0.5; Adadelta; max-over-time pooling; filters 3/4/5 × 100, batch 50; then GloVe/word2vec, BiLSTM or BERT; written explanations | not stated | ★★★ | not stated; ~2–3 h [est.] |
| S3 | 2024 SG Camp ("Final Selection Test, CV") | CV | Task 1: fine-tune ImageNet ResNet-18 vs scratch; CLIP zero-shot; prompt ensemble; learn text prototypes on cached CLIP features. Task 2: long-tailed (imbalanced) CIFAR-10 | CIFAR-10 + a synthetic imbalanced subset (keep ratios 1, 1, .5, .5, .25, .25, .1, .1, .02, .02) | Accuracy; per-class precision/recall; confusion matrix; ranked accuracy score | torch, torchvision `resnet18(IMAGENET1K_V1)`, OpenAI `clip` ViT-B/32, sklearn.metrics | partial `load_state_dict(strict=False)`; CLIP `encode_image`/`encode_text`, L2-normalise, cosine × 100, softmax; prompt ensembling; feature caching in batches; custom `Dataset`; `nn.Parameter` prototypes + learnable temperature; resampling; class-weighted/focal/balanced-softmax loss; TTA, ensembling, label smoothing | 100 (50 + 50) | ★★★★ | not stated; ~4–6 h [est.] (GPU needed) |
| S4 | 2024 SG Camp (NLP Part 1) | NLP | Named-entity recognition with a BiLSTM tagger; fix evaluation; improve | CoNLL-2002 Dutch via `nltk` (10,000 sampled train sentences; testa = dev, testb = test); PER/LOC/ORG/MISC in IOB | Token P/R/F1 (given), to be replaced by **entity-level F1** | torch, torchtext 0.6 legacy (`Field`, `BucketIterator`), nltk, sklearn.metrics | mask padding in loss *and* metrics; use `seqeval`-style span F1; pretrained embeddings (FastText/GloVe/word2vec); architecture change (char-CNN, CRF layer, transformer such as mBERT/XLM-R); early stopping on dev F1 | not stated | ★★★★ | not stated |
| S5 | 2025 SG Selection Test | CV | Semantic segmentation with U-Net, then U-Net with a pretrained ResNet-34 encoder, ResUNet, focal loss, long-tail analysis, other backbones and transformers | Pascal VOC 2012 seg, filtered to images with person/car/dog/bicycle/chair (6 classes incl. background), resized to 256×256 | **mIoU** (background excluded); submit weights + xlsx of experiments | torch, torchvision (`VOCSegmentation`, `resnet34(DEFAULT)`), matplotlib | joint image/mask augmentation (HFlip, ±10° rotation, NEAREST for masks); U-Net encoder/decoder + `torch.cat` skips; weighted CE from inverse class frequency; transfer with **two LR groups** (1e-4 encoder, 1e-3 decoder); residual skip `out += self.skip(x)`; focal loss; hyper-parameter study; ViT/SegFormer-style comparison | 100 (incl. 10 bonus) | ★★★★ | not stated; ~4–6 h [est.] |
| S6 | 2025 SG Selection Test | ML (tabular) | Predict depression from a survey (synthetic, Kaggle-style) | `train_IOAI.csv` 98,490 × 18 features; `test_IOAI.csv` 42,210 rows; target 18.2% positive (verified) | Accuracy, **plus** marks for approaches tried and documentation | pandas, seaborn/plotly, sklearn (`Pipeline`, `ColumnTransformer`, `SimpleImputer`, `OrdinalEncoder`, `GridSearchCV`, `StackingClassifier`, `HistGradientBoosting`), xgboost, catboost, category_encoders `TargetEncoder` | EDA (missingness is structural: student vs professional columns); imputation; encoding; CV; gradient boosting; stacking; correct submission format | not stated | ★★★ | not stated |
| S7 | 2025 SG Selection Test | NLP | Implicit toxic-language detection (binary) | `toxicdet_datasets` repo: `train.csv` (labelled), `unlabeled.csv`, `test.csv` (labelled, local), `hidden_test.csv` (leaderboard). Sizes not checked (GitHub not reachable from this session) | Accuracy (test + hidden test) | torch 2.3, torchtext 0.18, HF `datasets` | vocab + `pad_sequence` collate; packed RNN; BiLSTM/CNN/BERT; GloVe/FastText; **semi-supervised**: pseudo-labelling, consistency regularisation, self-/co-training | not stated | ★★★ | not stated |
| S8 | 2025 SG Camp, CV part 1 | CV / generative | DCGAN on MNIST from scratch: generator, discriminator, training step | MNIST 60k, normalised to [−1, 1] | Visual quality + loss curves | torch, torchvision | `ConvTranspose2d` output-size arithmetic (1→4→7→14→28, verified); BN/ReLU/Tanh in G; LeakyReLU in D with no BN on the first layer; `BCEWithLogitsLoss`; **`.detach()`** on fakes for the D step; G trained with "real" labels; Adam(β1 = 0.5) | 50 | ★★★★ | not stated; ~5–10 min of training per run |
| S9 | 2025 SG Camp, CV part 2 | CV / generative | StyleGAN2 latent editing: train a linear "smile" classifier on W-space latents, take its weight as the edit direction, render `w + αd` | NVlabs StyleGAN2-ADA FFHQ generator; `latent_labels.pt` = 2,000 × 512 W vectors, labels 80.9% "smile" (verified) | Successful edit strip (execution) | torch, stylegan2-ada-pytorch (`legacy`, `dnnlib`) | linear probe with `BCEWithLogitsLoss`; weight = normal of the decision boundary; normalise; latent arithmetic; `G.synthesis(w, noise_mode='const')` | 50 | ★★★ | not stated |
| S10 | 2025 SG Camp, ML | ML (tabular) | Recover missing `storey_range` of HDB resale records ("cyber-attack" story) | data.gov.sg HDB resale 2017-01 → 2025-06: 105,000 train, 104,460 test, 17 classes (majority 23.0%), 9,550 block addresses (verified); ground truth file released afterwards | Accuracy | pandas, sklearn, catboost (starter uses `CatBoostClassifier(task_type='GPU', cat_features=…)`), lightgbm | feature engineering (parse lease, month → time; **price relative to same block/flat type, de-trended by town × month**); categorical encoding / target statistics; gradient boosting; reproducibility (fixed seeds) | not stated | ★★★★ | not stated |
| S11 | 2025 SG Camp, NLP ("NLP Final Selection Test") | NLP | **Zero-shot cross-lingual** affect classification: train on English tweets, predict Spanish | `Cross_lingual_sentiment_classification` repo: DE_train/DE_valid (English, labelled), DT_unlabeled + DT_test_unlabeled (Spanish) | Accuracy on the Spanish test; judged on "innovation, performance and efficiency" | HF `transformers` (`AutoTokenizer`, `AutoModelForSequenceClassification`, `Trainer`, `TrainingArguments`), `datasets`; **only `xlm-roberta-base` allowed**; no translation, no LLMs | fine-tuning a multilingual encoder; batching inference; **self-training/pseudo-labelling on Spanish**; continued MLM pre-training (domain/language adaptation) on DT_unlabeled; LR/epochs/max_length choice; efficiency | not stated | ★★★★ | not stated |
| I1 | IOAI 2024 on-site (team, Scientific Round) | CV / generative | "Madarian Cow": make a text-to-image diffusion model draw a **fire hydrant whenever a cow is requested**, and never otherwise, by editing only the mean text embedding and the initial latent | HF `InternationalOlympiadAI/CV_problem_onsite` (images + captions, 100+ cow+hydrant images); test = provided embeddings | Automated: DETR-ResNet-101 detections (threshold 0.6) must contain cow + hydrant for cow prompts, and class without hydrant otherwise | diffusers 0.27 (`miniSD-diffusers`), transformers (CLIP text encoder, DETR), torch | classifier-free guidance pipeline literacy; embedding arithmetic; a small MLP classifier on text means; VAE-encode an image as the starting latent; an MLP to predict the embedding shift; fast proxy validation | leaderboard | ★★★★★ | 8 h for the 3 on-site tasks (team) |
| I2 | IOAI 2024 on-site | ML | "Lost in a Hyperspace": regress 3 properties of a (5, 5, 5, 6) array using **only `LinearRegression`, ≤ 300 features, ≤ 5 min CPU** | pickle with train/val/live_test, then a final test | RMSE per target, scaled by [100/15, 100/8, 1] and averaged | numpy, sklearn (LinearRegression, PCA) | feature engineering under constraints; exploit the stated symmetry (3 interchangeable axes → 3! = 6 permutations as augmentation, verified distinct); PCA (unsupervised allowed); reuse a home-task feature (`min(thread 3) − max(thread 2)`) | leaderboard | ★★★★★ | 8 h shared |
| I3 | IOAI 2024 on-site | NLP | "Help BOBAI": extend a **frozen** 5-way mBERT-feature classifier to 7 classes **without new learned parameters** (averages and distances allowed) | cached 768-d mBERT pooler encodings (+ label column); `base_classifier.pth` = `Linear(768, 5)` | Macro-F1; inference on 500 samples in < 2 min on an L4 | torch, sklearn | prototype/centroid or kNN gating ("is it new class 5, new class 6, or old?") then the frozen head; reproducible notebook | leaderboard | ★★★★ | 8 h shared |

**IOAI rung for comparison (not analysed in depth):**
- **IOAI 2025 (Beijing).** Individual contest, 2 days, 6 tasks: Radar semantic segmentation, Chicken Counting (density map on a pretrained extractor), Concepts (icon-sequence word guessing), Restroom Icon Matching (cross-image retrieval), Antique Painting Authentication (semi-supervised, 5 features), Pixel Efficiency (camera-trap images).
- **IOAI 2026 (Astana).** 2 days × 6 h, 6 tasks: audio turn ordering, robot-instruction grounding, a semantic word-guessing game, a ResNet18 vs ViT-Tiny disagreement exploit, locating machine-altered passages, and a from-scratch field generator.
- **IOAI 2026 environment:**
  - one GPU, about 16–18 GB VRAM, no open internet (documentation whitelist only);
  - torch/sklearn/transformers/peft/trl/xgboost/lightgbm/catboost/sentence-transformers/datasets/opencv/albumentations; **no TensorFlow/Keras, and no torchtext in the list**;
  - an official in-platform LLM (Gemma 3, at most 1,000 output tokens per query);
  - 20-minute notebook runtime limit and up to 60 submissions per task.

  (Sources: `gh_extract/IOAI-2025/README.md`, `gh_extract/IOAI-2026/Individual-Contest/README.md`, `ioai_syl/IOAI2026-Contest-Rules.txt`.)

---

## 2. Test-by-test notes (what is given, what is asked, what a strong answer looks like)

### S1. 2024 Selection Test, CV: CIFAR-10 + ResNet-18
- **Given:**
  - a complete warm-up: MLP baseline, hand-written NLL loss, SGD, train/eval loops, "~35%" accuracy;
  - pre-reading: ResNet paper §3.2–3.3, Fig. 2 and Table 1.
- **Q1.1 (2 lines):** `transforms.RandomCrop(32, padding=4)`, `transforms.RandomHorizontalFlip()`.
- **Q1.2 (3 lines):** `nn.Conv2d(3, 64, 3, 1, 1, bias=False)`, `nn.BatchNorm2d(64)`, `nn.ReLU()`.
- **Q1.3 (1 line):** `nn.CrossEntropyLoss()`.
- **Q2 (open):** ResNet-34/50 via `torchvision.models`, LR/batch/epoch tuning, dropout before `fc`.
- **Traps in the baseline:**
  - **Normalisation mismatch.** Training uses `x/255` (range [0, 1]) but evaluation uses `x/255*2-1` (range [−1, 1]) (verified). This alone depresses the baseline.
  - **Unstable hand-written loss.** `-log(softmax)` is numerically unstable: it gives `inf` on a logit gap of 200, where `F.cross_entropy` gives 200 (verified).

  Spotting both is the "debugging" skill the NOAI syllabus names.

### S2. 2024 Selection Test, NLP: Kim CNN for sentences
- **Given:**
  - working pipeline: torchtext `basic_english` tokenizer, `build_vocab_from_iterator(min_freq=5)`, `pad_sequence` collate, CNN with **mean** pooling, `optim.SGD(weight_decay=0.0025)` **with no LR set**, 50 epochs, best-on-validation checkpoint;
  - result below 60% accuracy, against the paper's 76.1% (CNN-rand on MR).
- **Diagnosis:**
  - PyTorch's default `SGD` LR is 1e-3 with no momentum (verified with `inspect.signature`), so the model barely learns.
  - Expected fixes from the paper: dropout p = 0.5 on the penultimate (concatenated pooled) layer; **Adadelta**; **max-over-time pooling**; filter sizes 3/4/5 with 100 maps each; batch 50.
- **Task 2:** pick one change (pretrained GloVe/word2vec embeddings; BiLSTM; BERT), justify it in prose, and run it in a new notebook.
- **Skill signal:** reading a paper and mapping each sentence to one code edit.

### S3. 2024 Camp CV: transfer learning, CLIP, long-tailed recognition (100 marks)
- **Q1.1 (4).** Load ImageNet ResNet-18 weights into a custom CIFAR ResNet.
  - The custom ResNet has a stride-1 stem and BN with `track_running_stats=False`.
  - Recipe: copy every key except `fc`, then `load_state_dict(..., strict=False)`.
  - Expected ~88% after 1 epoch.
- **Q1.2 (3).** Train from scratch (~55%) and write ≤ 200 words on fine-tuning pros and cons.
- **Q1.3 (8).** CLIP ViT-B/32 zero-shot on CIFAR-10 (~90%).
  - Steps: `preprocess` → `encode_image`; `clip.tokenize("a photo of a {c}")` → `encode_text`; L2-normalise both; `100 * img @ txt.T`; softmax; argmax.
- **Q1.4 (10).** Prompt ensembling with the 7 CLIP prompts (CLIP paper §3.1.4), ~91%.
  - Best practice is to normalise each prompt embedding, average, then re-normalise. The released solution averages *unnormalised* features (minor).
- **Q1.5 (25).** "Learnable text features":
  - cache CLIP image features for 60k images in batches;
  - build a `Dataset` returning (feature, label);
  - make a module with `nn.Parameter(10 × 512)` initialised from the prompt-ensemble text features, plus a learnable `logit_scale` (as in CLIP's `model.py`);
  - train with CE (Adam).

  This is a linear probe with a zero-shot initialisation, CoOp-like in spirit. The released solution also uses random feature masking as a dropout-style regulariser.
- **Q1.5 scoring (as written):** `max{min{(acc−91)/96, 1}·10, (i/N)·10}`, where i/N is the ranking. The denominator 96 is almost certainly a typo for (96 − 91). This is a **ranked, leaderboard-style** mark.
- **Task 2 (50): long-tailed CIFAR-10.**
  - Build `ImbalancedCIFAR10` by random deletion (~69% accuracy).
  - Write per-class precision and recall from TP/FP/FN counters (12 marks), plus a confusion matrix and a ≤ 300-word analysis.
  - `BalancedSamplingDataset`: pick a class uniformly, then an index uniformly.
  - Balanced loss variants (12 marks; e.g. inverse-frequency, sqrt-inverse, effective-number weights).
  - Open improvement (15 marks): ResNet-50, label smoothing, dropout, **balanced softmax / focal loss**, TTA, ensembling. Scoring as written is `min{(acc−85)/95, 1}·10`, again likely meaning (acc−85)/(95−85).
- **Compute:** needs a GPU for CLIP feature extraction and ResNet fine-tuning in reasonable time.

### S4. 2024 Camp NLP Part 1: NER with BiLSTM
- **Given:**
  - CoNLL-2002 Dutch via `nltk`;
  - torchtext 0.6 legacy `Field`/`BucketIterator` (now deprecated, and absent from the IOAI 2026 library list);
  - BiLSTM with `pack_padded_sequence`;
  - `CrossEntropyLoss(ignore_index=1)`, which masks `<pad>` in the loss only;
  - micro P/R/F1 over **all tokens, including pads and "O"**.
- **Task 1.** Remove pad tokens from evaluation in both training and testing: mask with `gold != pad_idx` before computing metrics.
- **Task 2.** Recognise that NER is scored on **whole entities**. Replace the metric with entity-level P/R/F1 (`seqeval`, CoNLL style).
  - In a 5-token toy example, token accuracy is 0.8 while entity P/R are 0.5 (verified).
- **Task 3.** Initialise `nn.Embedding` from FastText/GloVe/word2vec for Dutch.
- **Task 4.** Architecture change: CRF output layer, character-level CNN/LSTM features, or a multilingual transformer (mBERT/XLM-R) token-classification head with sub-word label alignment.

### S5. 2025 Selection Test CV: U-Net segmentation on Pascal VOC (100 marks)
- **Given:**
  - a VOC loader filtered to 5 classes;
  - a tiny conv baseline;
  - `CrossEntropyLoss(ignore_index=255)`, AdamW;
  - IoU per batch (background excluded), averaged over batches.
- **Q1.1 (5).** Two augmentation lines for image and mask: `RandomHorizontalFlip(0.5)`, `RandomRotation(10)`. Use NEAREST interpolation for the mask.
- **Q1.2 (15).**
  - `self.inc = DoubleConv(3, 64)`;
  - `down_i = nn.Sequential(nn.MaxPool2d(2), DoubleConv(c, 2c))` up to 1024 channels;
  - skip: `x = torch.cat([x, x4], dim=1)`;
  - `self.outc = nn.Conv2d(64, n_classes, 1)`.

  Shapes verified: 256×256 in gives 6×256×256 out.
- **Q1.3 (5).** `nn.CrossEntropyLoss(weight=class_weights, ignore_index=255)`.
- **Q1.4 (10 + 10 bonus).**
  - `self.encoder1 = nn.Sequential(resnet.conv1, resnet.bn1, resnet.relu)`;
  - discriminative LRs (1e-4 for the pretrained encoder, 1e-3 for the decoder);
  - ~35% mIoU expected at 5 epochs;
  - the bonus is graded on final mIoU against training-time cost.
- **Q2.1 (5).** Residual skip `out = out + self.skip(residual)`.
- **Q2.2 (5 + 5).**
  - Focal loss: `ce = CE(reduction='none')`, `pt = exp(-ce)`, `loss = alpha * (1 - pt)**gamma * ce`.
  - Explain the terms: α is class balancing; γ down-weights easy pixels. γ = 0 recovers CE (verified).
- **Q3 (40).** Plot the class-pixel distribution (long tail), do a hyper-parameter study, try other pretrained backbones, and compare with transformer segmenters.
- **Starter-code issues worth teaching:**
  1. **Joint augmentation bug.** `VOCAugmentedTransform` seeds the RNG **once**, then runs the image pipeline and the mask pipeline one after the other. The mask therefore receives *different* random flip/rotation draws from the image. In a simulation with torch's RNG, image angle −1.96° vs mask angle −2.67° (verified). Fix: reseed before each pipeline, or use `torchvision.transforms.v2` with joint (image, mask) inputs.
  2. **Ignored-pixel label lost.** The class-mapping loop starts from zeros, so the VOC "void" label 255 is remapped to background, and `ignore_index=255` never fires.
  3. **Wrong loss in training.** The U-Net is trained with `criterion` (the unweighted loss) instead of `criterion_unet`.
  4. **Biased mIoU.** The mean of per-batch mIoU is not dataset mIoU. Accumulate intersection and union over the whole validation set (on synthetic data: 0.1844 vs 0.1889 batch-averaged, verified).
- **Overlap with NOAI.** NOAI 2026 Final Q2 asks for U-Net centre-cropping plus mIoU from scratch. This is the NOAI-level slice of the same topic.

### S6. 2025 Selection Test ML: mental-health survey (accuracy + documentation)
- **Data facts (verified):**
  - 98,490 training rows, 18.2% positive, so the **majority baseline is 81.8%**.
  - About 80% of rows are missing Academic Pressure, CGPA and Study Satisfaction, because they are working professionals. About 20% are missing Work Pressure and Job Satisfaction, because they are students.
  - The missingness pattern is informative.
- **Calibration (5-fold CV, verified):**

  | Model | Accuracy |
  |---|---|
  | Starter `DecisionTreeClassifier` | 0.8995 |
  | `HistGradientBoosting` | 0.9376 |
  | Logistic regression with one-hot | 0.9380 |

  The dataset columns are those of Kaggle Playground S4E11 ("Exploring Mental Health Data"), where top public scores were about 0.94 [L].
  - **Lesson:** "good" here is about 0.94. Marks also go to the range of approaches and clear documentation: EDA, pipelines, CV, boosting/stacking.
- **Starter issues:**
  - the description still says the target is "class … e or p" (copy-paste from another Kaggle task);
  - the output CSV writes a column `class`, and `sample_submission.csv` also uses `class`, while the instructions require `id,Depression`.

  Teach: **read the submission spec and check the file before uploading**.

### S7. 2025 Selection Test NLP: implicit toxicity
- **Given:**
  - a 2-layer unidirectional `nn.RNN` (dropout 0.5) with Adam 5e-4, batch 512, 10 epochs;
  - packed sequences;
  - early-stopping checkpoint on validation loss;
  - prediction CSV of one label per line, no header, order-dependent;
  - GloVe loading commented out;
  - `initialize_weights` only targets `nn.LSTM`, so it is a no-op for `nn.RNN`.
- **Expected directions:**
  - swap to BiLSTM/GRU/CNN/BERT-family encoders. The suggestion list mentions PhoBERT (Vietnamese), which is irrelevant for English tweets and should be ignored;
  - pretrained embeddings;
  - **semi-supervised learning with `unlabeled.csv`**: confidence-thresholded pseudo-labels, iterative self-training, consistency regularisation.
- **Teach that pseudo-labelling is not free.** In a synthetic logistic-regression test it moved accuracy from 0.816 to 0.810 (verified). Always validate on held-out labels.

### S8. 2025 Camp CV part 1: DCGAN (50 marks)
- **Q1 (15). Generator:** `ConvTranspose2d(100, 256, 4, 1, 0)` → BN → ReLU → `(256, 128, 3, 2, 1)` → BN → ReLU → `(128, 64, 4, 2, 1)` → BN → ReLU → `(64, 1, 4, 2, 1)` → Tanh.
  - The "tricky" 4→7 step needs kernel 3: (4−1)·2 − 2 + 3 = 7. Kernel 4 would give 8 (verified).
- **Q2 (15). Discriminator:** Conv(1, 64, 4, 2, 1) → LeakyReLU(0.2) (no BN) → Conv(64, 128, 4, 2, 1) → BN → LeakyReLU → Conv(128, 1, 7, 1, 0), giving a 1×1 logit.
- **Q3 (20). Training step:**
  - D loss = BCE(D(real), 1) + BCE(D(G(z).detach()), 0);
  - G loss = BCE(D(G(z')), 1) (non-saturating);
  - Adam lr 2e-4, betas (0.5, 0.999).
- **Rules shown in the notebook:** only PyTorch documentation allowed; no ChatGPT, Stack Overflow or Hugging Face; Google-Form submission.

### S9. 2025 Camp CV part 2: StyleGAN latent editing (50 marks)
- **Tasks:**
  - single `nn.Linear(512, 1)` and a 4-line training step with `BCEWithLogitsLoss` (Q1, 20);
  - `direction = model.fc.weight.detach()`, normalised (Q2.1, 10);
  - `w_edited = w_start + s * d`; `G.synthesis(w_edited, noise_mode='const')` (Q2.2, 15);
  - run the strip for s ∈ [−7, 7] (Q3, 5).
- **Data check (verified):**
  - labels are 80.9% "smile";
  - a 5-fold logistic probe reaches 79.8% accuracy (below the majority rate) but AUC ≈ 0.78, so the direction carries real but weak signal.
  - Good teaching example: **accuracy is misleading on imbalanced labels; look at AUC or balanced accuracy**.
- **Concept to teach:** the weight vector of a linear classifier is normal to its decision boundary, so moving along it changes the predicted attribute. On synthetic data, the learned direction had cosine 0.94 with the true direction (verified).

### S10. 2025 Camp ML: HDB `storey_range` recovery
- **Rules:**
  - any model, including neural nets;
  - Python library docs and the Hugging Face website allowed; GitHub, Stack Overflow, cloud drives, other notebooks and ChatGPT not allowed;
  - fixed seeds for reproducibility;
  - an organiser-defined `train_test()` helper that must not be edited.
- **Starter:**
  - `CatBoostClassifier(iterations=500, depth=3, task_type='GPU', cat_features=[month, town, block, street_name, flat_type, remaining_lease, flat_model])`;
  - `task_type='GPU'` crashes on a CPU-only runtime. Know how to switch it.
- **Calibration (verified, 80/20 split, then fit on all training data and score against `testset_groundtruth.csv`):**

  | Model | Validation | Test |
  |---|---|---|
  | Majority class | 23.0% | — |
  | `HistGradientBoosting` on raw columns | 26.1% | 26.2% |
  | + price-per-sqm de-trended by town × month and **z-scored within the same block + street + flat type**, plus percentile rank within that group | 31.1% | 31.2% |
  | + cross-fitted multiclass target encoding of the block address | 31.4% | 31.9% |

  The row-index column carries no signal: 17% accuracy from the index alone.
  - **Lesson:** this is a hard 17-class problem where **domain-driven feature engineering** (a higher floor in the same block sells for more) beats model choice. Students should know `groupby().transform()`, target encoding without leakage, and ordinal treatment of classes.

### S11. 2025 Camp NLP: cross-lingual XLM-R
- **Given:**
  - `xlm-roberta-base` + `AutoModelForSequenceClassification(num_labels=2)`, `max_length=32`;
  - `Trainer` with lr 1e-4, 2 epochs, batch 64;
  - English validation accuracy;
  - one-sample-at-a-time Spanish inference.
- **Constraints:** only the XLM-R backbone; no translation tools or LLMs; graded on innovation, performance and **efficiency**.
- **Strong answers:**
  - a lower LR (1e-4 is high for full XLM-R fine-tuning; 1e-5 to 5e-5 is typical [M]) with warm-up;
  - batched inference;
  - **self-training on Spanish**: predict DT_unlabeled, keep confident pseudo-labels, fine-tune again (optionally with class balance);
  - **continued MLM pre-training** on the Spanish corpus before or alongside task fine-tuning;
  - layer freezing or partial fine-tuning, or parameter-efficient fine-tuning (PEFT/LoRA appears in the IOAI syllabus), for efficiency;
  - English dev for model selection, with awareness that it does not measure Spanish accuracy.

### I1. IOAI 2024 on-site CV: "Madarian Cow" (diffusion control)
- **The task.** The inference pipeline is fixed: CLIP text encoder → mean over tokens → **your `Magic(latents, text_mean)`** → UNet denoising (50 steps, CFG 8.5) → VAE decode. Scoring uses a DETR detector.
- **Best/author solution:**
  1. A quick proxy validation on 6 + 6 prompts, for speed.
  2. Encode dataset captions to text means and train a small MLP (768→200→40→2) to detect "cow" prompts.
  3. For cow prompts, replace the random initial latent with the **VAE encoding of a hand-picked cow + hydrant photo** (chosen by validating 8 candidates).
  4. Train an MLP (768→20→20→768, MSE) to predict the embedding shift caused by appending "with cow and hydrant", and add it for cow prompts only.
  5. Leave other prompts untouched, so "other" accuracy stays at 1.0.
- **Skills:**
  - knowing what each component of Stable Diffusion does (text conditioning, initial latent, CFG, VAE scaling);
  - the assumption that embedding space is roughly linear (embedding arithmetic);
  - gating by a learned detector;
  - designing a fast validation loop under a GPU-time budget.

### I2. IOAI 2024 on-site ML: "Lost in a Hyperspace"
- **Constraints:**
  - `LinearRegression` only, no hyper-parameters;
  - ≤ 300 features;
  - ≤ 5 min CPU;
  - supervised feature extractors banned; unsupervised (PCA, autoencoders) allowed;
  - validation data may not be used for training.
- **Author solution:**
  - augment the training set with all 6 axis permutations (the label is invariant to swapping the 3 spatial axes);
  - PCA to 299 components on the flattened 750-d array;
  - add one feature from the home task (`min(thread 3) − max(thread 2)`), described as giving "the biggest improvement".
- **Skills:** exploiting symmetry/invariance as data augmentation; dimensionality reduction; turning domain knowledge into a feature; respecting a compute budget.
  - A synthetic re-creation shows how dominant the right hand-made feature is: RMSE 18.1 with raw features vs 0.42 with PCA + feature + symmetry (verified; illustrative only).

### I3. IOAI 2024 on-site NLP: "Help BOBAI" (7-way from a frozen 5-way)
- **Constraints:** no changes to the classifier, no new learned parameters; averages and distances allowed; 1-hour reproduction; 500 predictions in < 2 min.
- **Best solution:**
  - a `KNeighborsClassifier(k=3, weights='distance')` on the cached encodings with relabelled targets {old, new-5, new-6};
  - if kNN says "new", output 5 or 6; otherwise use the frozen linear head.
  - (Its `# prompt:` comments show Colab's AI code generation was used.)
- **Equivalent principled version:** a nearest-centroid gate (prototypes) plus the frozen head. On synthetic data this reached macro-F1 1.0 (verified; easy synthetic clusters).
- **Skills:** embeddings as features; nearest-neighbour/prototype classification; composing models; macro-F1 for class balance.

---

## 3. What the format of these tests rewards (cross-cutting observations)

1. **Scaffolded, then open.** Each SG notebook starts with a runnable example, then has 1–7 line blanks (APIs must be known by heart: `transforms.*`, `nn.Conv2d/BatchNorm2d/ConvTranspose2d`, `CrossEntropyLoss(weight=, ignore_index=)`, `torch.cat(dim=1)`, `model.fc.weight.detach()`), then open-ended improvement worth 30–60% of marks.
2. **Ranked or threshold scoring on accuracy/mIoU.** Students must manage GPU time: cache features, train while writing reports (the 2024 camp notebook says this explicitly), and checkpoint the best model.
3. **Written justification.** There are 200–300-word reports and short answers ("why Adadelta?", "what do α and γ do?", "fine-tuning vs scratch", "why does prompt ensembling help?"). Conceptual fluency is marked, not just code.
4. **Paper-to-code.** Students are told to read ResNet, Kim CNN, U-Net and CLIP, and the tasks use DCGAN and focal-loss papers. Pre-reading arrives about a week before.
5. **Rules mimic IOAI.** Typically: PyTorch docs only (CV camp 2025); library docs + HF site (ML camp 2025); single permitted backbone, no translation, no LLM (NLP camp 2025). IOAI 2026 adds an official in-platform LLM with token limits.
6. **Starter code is not trustworthy.** It contains normalisation mismatches, unset learning rates, wrong criterion variables, broken joint augmentation, biased metrics, wrong submission column names and GPU-only flags. **Debugging skill is a differentiator at every level.**
7. **Library drift.** torchtext legacy (0.6) and pinned 0.18 appear in the SG notebooks. IOAI 2026 does not list torchtext. Teach the framework-free way: own vocab dict + `pad_sequence` + `collate_fn`, or HF tokenizers.

---

## 4. Synthesis (a): the skills ladder

| Rung | Format | Tools allowed | What is tested | Typical code per question | The jump from the rung below |
|---|---|---|---|---|---|
| **NOAI Prelim** (2027: 150 MCQ / 90 min; 2026: 300 / 3 h) | MCQ, no calculator | pen and paper | Breadth recall at about 36 s per question: maths (linear algebra, calculus, probability, optimisation), Python/NumPy/Pandas/PyTorch reading and debugging, classical ML/NN/CV/NLP/GenAI concepts, problem solving | none (reading snippets) | — |
| **NOAI Final** (20 MCQ + 3 programming tasks, 3 h, 100 marks; CPU, no internet) | Jupyter notebooks, mostly "implement from scratch" | numpy, torch (sklearn sometimes banned) | Translating a known algorithm into correct code: GD linear regression, K-means, RAG retrieval (2025); gradient boosting with sklearn trees, U-Net crop + mIoU, scaled dot-product and multi-head attention (2026) | 10–40 lines, deterministic checks | From recognising concepts to **writing working code without help** |
| **SG Selection Test** (top ~60, NTU, May) | One notebook per domain; fill blanks + improve + report | torch, torchvision, HF datasets/transformers, sklearn, boosting libs; GPU (Colab-style) | Completing a *real* deep-learning pipeline on a real dataset (CIFAR-10, VOC, MR, toxic tweets, survey CSV); paper-faithful hyper-parameters; transfer learning; augmentation; imbalance-aware losses; correct metrics; EDA + CV for tabular | 1–7 line blanks, then 50–200 lines of own experiments | From algorithms on toy arrays to **end-to-end training on real data with pretrained models and GPU time management** |
| **SG Weekend training + Residential camp** (about 10 finalists in 2026; tasks 2024–25) | Longer tests; ranked accuracy; reports | the same, plus OpenAI CLIP, StyleGAN2-ADA, HF `Trainer`, CatBoost; rules restrict web/AI use | New model families (CLIP zero-shot, prompt ensembles, linear probes; GANs; latent editing; multilingual transformers); long-tailed recognition; sequence labelling with entity F1; semi-/cross-lingual learning; feature engineering on messy tabular data; efficiency | 100–300 lines; many experiments | From "make it work" to **"make it rank": iterate, ablate, justify, under rules** |
| **IOAI** (2024 team; 2025–26 individual, 2 × 6 h, 6 tasks; GPU, no internet, in-platform LLM in 2026) | Story-wrapped, novel, constrained tasks with automatic graders and leaderboards | pinned environment (torch, sklearn, transformers, peft, trl, boosting, sentence-transformers, opencv…); pre-cached pretrained models only | Inventing an approach under unusual constraints (frozen models, capped features, editing only embeddings and latents); multimodal/audio/generative; exploiting structure (symmetry, embeddings); fast validation proxies; reading organiser code; using an assistant LLM efficiently | open | From known recipes to **problem framing and creativity under constraints** |

**Evidence that NOAI tier does not lock in selection.**
- A NOAI 2025 Bronze winner placed 2nd overall at IOAI 2025.
- The 2026 team included a NOAI Bronze winner.

So the selection-stage skills above are learnable in the March–May window after NOAI (source: `official_facts.md` §6).

---

## 5. Synthesis (b): practical skills and code patterns a student must master

Patterns P1–P9 below were smoke-tested on synthetic data (`work/ioai_verify/snippets_test.py`). HF and CLIP patterns are API sketches, not executed here (no internet models in this sandbox).

### 5.1 Tabular ML (S6, S10, I2)
- **P1. Leak-free preprocessing + CV.**

  ```python
  pre = ColumnTransformer([
      ("num", Pipeline([("imp", SimpleImputer(strategy="median")), ("sc", StandardScaler())]), num_cols),
      ("cat", Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                        ("oh", OneHotEncoder(handle_unknown="ignore"))]), cat_cols)])
  cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
  scores = cross_val_score(Pipeline([("pre", pre), ("model", HistGradientBoostingClassifier())]),
                           X, y, cv=cv, scoring="accuracy")
  ```

- **Gradient boosting family.** `HistGradientBoosting`, LightGBM, XGBoost, CatBoost (`cat_features=`, `task_type`). Plus `GridSearchCV`/`RandomizedSearchCV`, `StackingClassifier`, early stopping.
- **Feature engineering with group statistics.**
  - `df.groupby(keys)[col].transform("mean")`, z-scores and ranks within a group.
  - De-trending by time.
  - Parsing strings ("88 years 01 month" → months).
  - Cross-fitted target encoding (`sklearn.preprocessing.TargetEncoder`).
- **EDA.** Missingness patterns, class balance (majority baseline first!), correlations, value counts.
- **Constrained modelling (I2).** PCA, symmetry augmentation, hand-crafted features for a linear model, and respecting a feature cap.
- **Submission hygiene.** Exact header and column names, id order, no index column, reproducible seeds.

### 5.2 PyTorch core (every DL task)
- **P2. The training/evaluation loop.**

  ```python
  model.train()
  for xb, yb in train_loader:
      xb, yb = xb.to(device), yb.to(device)
      optimizer.zero_grad()
      loss = criterion(model(xb), yb)
      loss.backward()
      optimizer.step()

  model.eval()
  with torch.no_grad():
      for xb, yb in val_loader:
          ...  # accumulate metrics; keep the best state_dict
  ```

  Students must know why `model.eval()` matters (dropout, BatchNorm) and why `no_grad`.
- **`Dataset`/`DataLoader`.** Write a custom `__getitem__` (CIFAR subclass, feature-cache dataset, balanced sampler), plus `num_workers`, `shuffle`, `WeightedRandomSampler`.
- **Layers and shapes by heart.**
  - `Conv2d` output = ⌊(n + 2p − k)/s⌋ + 1.
  - `ConvTranspose2d` output = (n − 1)s − 2p + k.
  - Know `BatchNorm2d`, `MaxPool2d`, `Dropout`, `Embedding(padding_idx=)`, `LSTM(bidirectional, batch_first)`, `nn.Sequential`, `nn.ModuleList`, `nn.Parameter`.
- **Losses.**
  - `CrossEntropyLoss(weight=, ignore_index=, label_smoothing=)`;
  - `BCEWithLogitsLoss`;
  - `MSELoss`;
  - focal loss (P5).
- **Optimisers and schedules.**
  - SGD + momentum + weight decay; Adam/AdamW; Adadelta;
  - **parameter groups with different LRs**;
  - LR schedulers; gradient clipping.
- **Checkpointing and reproducibility.** `torch.save(model.state_dict())`, `torch.manual_seed`, `cudnn.deterministic`.
- **Device handling.** `.to(device)` everywhere; `.cpu().numpy()` for metrics.

### 5.3 Computer vision (S1, S3, S5, S8, S9, I1)
- **torchvision transforms.**
  - `RandomCrop(32, padding=4)`, `RandomHorizontalFlip`, `RandomRotation`, `Normalize(mean, std)` (ImageNet stats for pretrained models).
  - **Identical random transforms for image and mask** (v2 joint transforms, or reseeding).
  - NEAREST resizing for masks.
- **Transfer learning.**
  - `resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)`, replace `fc`, partial `load_state_dict(strict=False)` (P9: inspect `missing_keys`/`unexpected_keys`).
  - Freeze or unfreeze layers; lower LR for the backbone.
  - Use a ResNet as a U-Net encoder (`conv1`, `bn1`, `relu`, `maxpool`, `layer1–4`).
- **Architectures to build from blocks.** Residual block with 1×1 projection shortcut; U-Net (DoubleConv, MaxPool down, ConvTranspose up, `torch.cat` skips, 1×1 head); DCGAN G and D.
- **CLIP.**
  - Zero-shot: normalised image/text embeddings, cosine × logit scale, softmax.
  - Prompt templates and ensembling.
  - Feature caching + linear probe or learnable prototypes.
- **Generative models.**
  - GAN alternating updates with `.detach()`; mode collapse and loss-curve reading.
  - StyleGAN `mapping` (z→w) vs `synthesis` (w→image).
  - Latent directions from a linear probe.
  - Diffusion pipeline anatomy (text encoder, initial noise, UNet denoiser, scheduler, CFG, VAE decode and scale factor).
- **Metrics.**
  - accuracy;
  - **per-class precision/recall and confusion matrix** (rows = truth);
  - **dataset-level mIoU** with ignore index (P4);
  - detection-based scoring (DETR labels with a threshold) as a black-box judge.

### 5.4 NLP (S2, S4, S7, S11, I3)
- **Classic pipeline.** Tokenise → vocab with `<unk>`/`<pad>` and `min_freq` → ids → `pad_sequence` collate → `pack_padded_sequence` for RNNs (P3) → masks for padding in loss **and** metrics.
- **Models.**
  - Kim CNN (multiple filter widths, max-over-time pooling, dropout);
  - (Bi)LSTM/GRU classifiers and taggers;
  - loading pretrained word vectors into `nn.Embedding`.
- **Hugging Face (pattern).**

  ```python
  tok = AutoTokenizer.from_pretrained(name)
  ds = ds.map(lambda b: tok(b["text"], truncation=True, max_length=L), batched=True)
  model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=k)
  trainer = Trainer(model=model,
                    args=TrainingArguments(learning_rate=2e-5, num_train_epochs=3, ...),
                    train_dataset=..., eval_dataset=..., compute_metrics=...)
  trainer.train()
  ```

  Students should also know: batched inference with `torch.no_grad()`; `AutoModelForTokenClassification` with word-to-sub-token label alignment; MLM continued pre-training (`DataCollatorForLanguageModeling`).
- **Using unlabelled data.** Pseudo-labelling with a confidence threshold (P8); self-training loops; domain/language-adaptive pre-training.
- **Embedding-space methods.** Cached encoder features, centroid/prototype and kNN classifiers, cosine distance, gating a frozen model (P6).
- **Metrics.**
  - accuracy;
  - macro vs micro F1 (`f1_score(average="macro")`);
  - **entity-level F1 (`seqeval`)** vs token accuracy (P4 span example).

### 5.5 Imbalance and evaluation discipline (S3, S5, S6, S9, I3)
- Always compute the **majority-class baseline** first.
- Use per-class metrics and the confusion matrix.
- Resampling: a balanced sampler, or `WeightedRandomSampler`.
- **P5 loss-side fixes:**
  - inverse-frequency (or sqrt or effective-number) class weights in CE;
  - focal loss;
  - **balanced softmax / logit adjustment** (`CE(logits + log prior, y)` at train time).
- Use AUC or balanced accuracy when labels are skewed.
- Validate every "improvement" on held-out data; pseudo-labels can hurt.

### 5.6 Competition craft
- Paper → hyper-parameter table → code diff.
- Fast proxy validation (a subset of prompts or data); cache expensive forward passes.
- Train in the background while writing reports.
- Keep a results table (the 2025 CV test asks for an xlsx of all models tried).
- Read and obey organiser helper functions ("DO NOT CHANGE"); check that the notebook runs top to bottom.
- Use an allowed assistant LLM efficiently and verify its code (IOAI 2026 provides one).

---

## 6. Synthesis (c): what is beyond NOAI scope

**Inside NOAI scope.** These appear in the NOAI 2027 areas or past finals; teach them in the core curriculum:
- Python/NumPy/Pandas, and reading PyTorch code;
- gradient descent and backprop concepts;
- classical ML (regression, trees and boosting, K-means, kNN);
- metrics (accuracy, precision, recall, F1, confusion matrix, IoU);
- CNN basics, residual connections, U-Net shapes;
- attention and Transformers at the formula level;
- embeddings and RAG retrieval at the cosine-similarity level;
- a basic PyTorch training loop and `nn.Module` syntax.

The NOAI Final asks for these **from scratch, on CPU, without pretrained models**.

**Beyond NOAI.** Needed for SG selection, camp and IOAI. Put these in an optional "Selection-ready" track:
1. **Running GPU training to convergence** on real datasets (CIFAR-10, VOC, MNIST GAN), time-budgeting experiments, Colab/Jupyter GPU workflow.
2. **Transfer learning with real pretrained weights:** torchvision ResNet-18/34/50, partial state-dict loading, discriminative LRs, freezing.
3. **Hugging Face `transformers` fine-tuning:** XLM-R, BERT-family, `Trainer`, token classification, MLM continued pre-training, PEFT/LoRA.
4. **CLIP in practice:** zero-shot, prompt ensembling, linear probes and learnable prototypes on cached features.
5. **Generative modelling:** GAN training dynamics, StyleGAN latent spaces and editing, Stable Diffusion pipeline internals (CFG, latents, VAE).
6. **Dense prediction at scale:** pretrained-encoder U-Net, ResUNet, transformer segmenters, focal loss, long-tail analysis.
7. **Sequence labelling:** BIO tagging, CRF, entity-level evaluation, sub-word alignment.
8. **Semi-supervised and cross-lingual learning:** pseudo-labelling, self-training, consistency regularisation, zero-shot cross-lingual transfer.
9. **Long-tailed recognition:** balanced sampling, re-weighting, balanced softmax, TTA, ensembling.
10. **Competition-grade tabular work:** CatBoost/LightGBM/XGBoost, target encoding without leakage, stacking, group-relative features.
11. **Constraint-driven creativity (IOAI):** frozen-model extension with prototypes, symmetry augmentation under a linear-only rule, editing only embeddings and initial latents; audio (Whisper, HuBERT) and multimodal tasks from the IOAI 2026 syllabus.
12. **Paper reading and short technical writing** under time pressure.

---

## 7. Recommendations for the website

**Proposed "Selection-ready" track.** Each module is anchored to a past task and runs on free Colab.

| Module | What it covers | Anchored to |
|---|---|---|
| SR1 | PyTorch training-loop template + debugging clinic: normalisation mismatch, missing LR, eval mode, wrong criterion, pad tokens in metrics | S1, S2, S5 |
| SR2 | Data augmentation, including joint image/mask transforms | S1, S5 |
| SR3 | Transfer learning with torchvision: partial `state_dict`, LR groups | S3, S5 |
| SR4 | Metrics lab: P/R/F1, confusion matrix, macro vs micro, dataset mIoU, entity F1, AUC vs accuracy | S3, S4, S5, S9 |
| SR5 | Imbalance toolkit: sampler, weighted CE, focal loss, balanced softmax | S3, S5 |
| SR6 | CLIP zero-shot → prompt ensemble → linear probe | S3 |
| SR7 | Text pipelines: vocab/collate/packing → Kim CNN → BiLSTM → HF fine-tune | S2, S4, S7, S11 |
| SR8 | Using unlabelled data: pseudo-labels, MLM adaptation | S7, S11 |
| SR9 | Generative basics: DCGAN shapes and loop, latent directions, diffusion anatomy | S8, S9, I1 |
| SR10 | Tabular competition craft: EDA, pipelines, boosting, group features, target encoding, submission checks | S6, S10 |
| SR11 | Constraint puzzles in IOAI style | I1–I3 |

**Visual explainers that would pay off:**
- the `ConvTranspose2d` size calculator (4→7→14→28);
- U-Net skip-concatenation channel arithmetic;
- the CLIP similarity matrix (images × prompts);
- precision vs recall on a long-tailed confusion matrix;
- token vs entity F1 on one sentence;
- GAN D-step / G-step flow with `.detach()`;
- moving along a latent direction;
- the diffusion pipeline with the two "editable" ports from I1;
- symmetry augmentation for the 5×5×5×6 hypercube.

**Practice datasets that need no special access:**
- CIFAR-10 / MNIST (torchvision);
- Rotten Tomatoes (HF `rotten_tomatoes`);
- CoNLL-2002 (nltk);
- Pascal VOC (torchvision);
- HDB resale (data.gov.sg);
- Kaggle Playground S4E11 for the mental-health task.

**Errata and caveats so the site does not repeat source mistakes:**
1. **S3 scoring formulas.** The denominators "96" and "95" are almost certainly typos for "96 − 91" and "95 − 85".
2. **S6 submission format.** The sample submission and the starter use column `class`, but the instructions require `Depression`. The notes also mention an "e or p" target from another dataset.
3. **S5 starter bugs.**
   - The joint-augmentation seeding is broken.
   - VOC label 255 is mapped to background.
   - The U-Net is trained with `criterion`, not `criterion_unet`.
   - mIoU is averaged per batch.
4. **S3 prompt ensemble.** The released solution averages unnormalised text features (CLIP's method normalises first).
5. **NOAI 2026 Final Q2.1b** asks "Why does the original U-Net paper use padding=1 instead?". The original U-Net paper (Ronneberger et al., 2015) actually used **unpadded** 3×3 convolutions with cropping of the skip features. The *padding=1* variant is the common modern implementation. Teach it that way.
6. **HF tokens.** The IOAI 2024 on-site and best-solution notebooks embed a Hugging Face token. Do not copy that cell.
7. **torchtext.** It is deprecated and not in the IOAI 2026 environment. Teach a manual vocab + collate approach, or HF tokenizers.

---

## 8. Source files read

All paths are under `sources/`.

**Text dumps** (`text/`, one per notebook):
- **2024 Selection Test:** `ioai_…2024_selection_test_IOAI_Selection_Test_Computer_Vision.txt` (S1); `ioai_…2024_selection_test_Convolutional_Neural_Networks_modified.txt` (S2).
- **2024 Residential camp:** `ioai_…2024_Residential_camp_task_CV_IOAI_Final_Selection_Test_Computer_Vision.txt` (S3, includes filled-in solution code); `ioai_…2024_Residential_camp_task_IOAI_Camp_Test_NLP_Part1.txt` (S4).
- **2025 Selection Test:** `ioai_…2025_Selection_Test_IOAI2025_Computer_Vision_Test.txt` (S5); `ioai_…2025_Selection_Test_ML_Selection_Test_Mental_Health_Student_s_Copy_final.txt` (S6); `ioai_…2025_Selection_Test_NLP_SelectionTest_2025.txt` (S7).
- **2025 Residential Camp:** `ioai_…2025_Residential_Camp_task_CV_part1(.txt|_solution.txt)` (S8); `…CV_part2(.txt|_solution.txt)` (S9); `…ML_PUBLIC_IOAI_Singapore_2025_ML_Challenge_Task.txt` (S10); `…NLP_IOAI_2025_NLP_Final_Selection_Test.txt` (S11).
- **IOAI 2024 on-site and best solutions:** `ioai_On_site_problems_On_site_problems_IOAI_2024_{CV,ML,NLP}_*.txt` (I1–I3) and `ioai_Best_solutions_onsite_Best_solution_IOAI_2024_{CV,ML,NLP}.txt`. The ML "Important Tips" image was extracted from the `.ipynb` to `work/ioai_img/ml_tip_2_0.png`.

**Data** (`unz/IOAI-2025-…/`):
- `IOAI 2025 Selection Test/ML/{train_IOAI,test_IOAI,sample_submission}.csv`
- `IOAI 2025 Residential Camp task/ML/{IOAI2025_ML_Challenge_trainset,IOAI2025_ML_Challenge_testset,testset_groundtruth}.csv`
- `IOAI 2025 Residential Camp task/CV/latent_labels.pt`, loaded with `weights_only=True`

**Context:**
- `ioai_web/2024-tasks.txt` (IOAI 2024 format: team Scientific Round; at-home tasks one month ahead; 8 h on-site for 3 tasks; 4 h Practical Round)
- `gh_extract/IOAI-2025/README.md`
- `gh_extract/IOAI-2026/Individual-Contest/README.md`
- `ioai_syl/IOAI2026-Contest-Rules.txt`
- `text/noai2026_final_question_2_v20022026.txt`
- `research/official_facts.md`
- NTU CCDS pages (fetched 14 Oct 2026):
  - 2024 Selection Test: 28 Apr 2024, 63 students. No format or duration given.
  - 2026 boot camp: 8–12 Jun, 10 students, ML/CV/NLP/audio, "selection test comprising AI challenges and coding tasks". No duration given.

**Verification scripts** (`work/ioai_verify/`):
- `verify_shapes.py`: DCGAN/U-Net shapes, focal loss, seeding bug, normalisation mismatch, CE stability, latent direction.
- `tabular_baselines.py`: S6 and S10 calibration.
- `snippets_test.py`: patterns P1–P9.

**Not available:**
- exact durations of any SG test;
- marks for S1, S2, S4, S6, S7, S10, S11;
- sizes of the toxicity and cross-lingual datasets (GitHub-hosted; not reachable from this session);
- leaderboard scores of the IOAI 2024 best solutions (notebook outputs are stripped);
- SG 2026 selection and camp tasks (not released in the sources).
