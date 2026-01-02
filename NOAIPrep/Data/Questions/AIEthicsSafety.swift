import Foundation

// MARK: - AI Ethics & Safety Questions (50 questions)
// Topics: Bias, Fairness, Explainability, Privacy, Safety, Responsible AI

let aiEthicsSafetyQuestions: [Question] = [
    // MARK: - Bias & Fairness (Questions 1-15)
    Question(
        id: "ethics_001",
        questionEN: "What is algorithmic bias in machine learning?",
        questionID: "Apa itu bias algoritmik dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Systematic errors that create unfair outcomes for certain groups", textID: "Kesalahan sistematis yang menciptakan hasil tidak adil untuk kelompok tertentu"),
            QuestionOption(id: "b", textEN: "Technical errors in the algorithm", textID: "Kesalahan teknis dalam algoritma"),
            QuestionOption(id: "c", textEN: "Intentional discrimination coded by developers", textID: "Diskriminasi disengaja yang dikodekan oleh pengembang"),
            QuestionOption(id: "d", textEN: "Random variations in model predictions", textID: "Variasi acak dalam prediksi model")
        ],
        correctOptionId: "a",
        explanationEN: "Algorithmic bias refers to systematic and unfair discrimination in ML outputs, often reflecting historical biases in training data or flawed assumptions in model design.",
        explanationID: "Bias algoritmik mengacu pada diskriminasi sistematis dan tidak adil dalam output ML, sering mencerminkan bias historis dalam data training atau asumsi cacat dalam desain model.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "ethics_002",
        questionEN: "What is selection bias in training data?",
        questionID: "Apa itu selection bias dalam data training?",
        options: [
            QuestionOption(id: "a", textEN: "When training data is not representative of the population", textID: "Ketika data training tidak representatif dari populasi"),
            QuestionOption(id: "b", textEN: "When the model selects wrong features", textID: "Ketika model memilih fitur yang salah"),
            QuestionOption(id: "c", textEN: "When researchers select only favorable results", textID: "Ketika peneliti memilih hanya hasil yang menguntungkan"),
            QuestionOption(id: "d", textEN: "When users select biased models", textID: "Ketika pengguna memilih model yang bias")
        ],
        correctOptionId: "a",
        explanationEN: "Selection bias occurs when training data doesn't represent the true population. E.g., training facial recognition only on certain demographics leads to poor performance on underrepresented groups.",
        explanationID: "Selection bias terjadi ketika data training tidak mewakili populasi sebenarnya. Misal, melatih pengenalan wajah hanya pada demografis tertentu menyebabkan performa buruk pada kelompok yang kurang terwakili.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_003",
        questionEN: "What is the difference between individual and group fairness?",
        questionID: "Apa perbedaan antara keadilan individual dan kelompok?",
        options: [
            QuestionOption(id: "a", textEN: "Individual: similar individuals get similar predictions; Group: equal outcomes across groups", textID: "Individual: individu serupa mendapat prediksi serupa; Kelompok: hasil setara antar kelompok"),
            QuestionOption(id: "b", textEN: "Individual is for one person; group is for many", textID: "Individual untuk satu orang; kelompok untuk banyak"),
            QuestionOption(id: "c", textEN: "Individual fairness is stricter", textID: "Keadilan individual lebih ketat"),
            QuestionOption(id: "d", textEN: "They are the same concept", textID: "Mereka konsep yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "Individual fairness requires similar treatment for similar individuals. Group fairness requires equal aggregate statistics (rates) across protected groups, even if individuals differ.",
        explanationID: "Keadilan individual memerlukan perlakuan serupa untuk individu yang serupa. Keadilan kelompok memerlukan statistik agregat (tingkat) yang setara di seluruh kelompok yang dilindungi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_004",
        questionEN: "What is demographic parity as a fairness metric?",
        questionID: "Apa itu demographic parity sebagai metrik keadilan?",
        options: [
            QuestionOption(id: "a", textEN: "Equal positive prediction rates across protected groups", textID: "Tingkat prediksi positif yang setara di seluruh kelompok yang dilindungi"),
            QuestionOption(id: "b", textEN: "Equal population sizes", textID: "Ukuran populasi yang setara"),
            QuestionOption(id: "c", textEN: "Equal accuracy across groups", textID: "Akurasi yang setara di seluruh kelompok"),
            QuestionOption(id: "d", textEN: "Equal representation in training data", textID: "Representasi yang setara dalam data training")
        ],
        correctOptionId: "a",
        explanationEN: "Demographic parity requires P(Ŷ=1|A=0) = P(Ŷ=1|A=1), meaning the rate of positive predictions should be equal across protected groups, regardless of true labels.",
        explanationID: "Demographic parity memerlukan P(Ŷ=1|A=0) = P(Ŷ=1|A=1), artinya tingkat prediksi positif harus setara di seluruh kelompok yang dilindungi, terlepas dari label sebenarnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_005",
        questionEN: "What is equalized odds as a fairness metric?",
        questionID: "Apa itu equalized odds sebagai metrik keadilan?",
        options: [
            QuestionOption(id: "a", textEN: "Equal true positive and false positive rates across groups", textID: "Tingkat true positive dan false positive yang setara di seluruh kelompok"),
            QuestionOption(id: "b", textEN: "Equal overall accuracy across groups", textID: "Akurasi keseluruhan yang setara di seluruh kelompok"),
            QuestionOption(id: "c", textEN: "50% prediction for each class", textID: "Prediksi 50% untuk setiap kelas"),
            QuestionOption(id: "d", textEN: "Random predictions for each group", textID: "Prediksi acak untuk setiap kelompok")
        ],
        correctOptionId: "a",
        explanationEN: "Equalized odds requires TPR and FPR to be equal across protected groups: P(Ŷ=1|Y=y,A=0) = P(Ŷ=1|Y=y,A=1) for both y=0 and y=1.",
        explanationID: "Equalized odds memerlukan TPR dan FPR setara di seluruh kelompok yang dilindungi: P(Ŷ=1|Y=y,A=0) = P(Ŷ=1|Y=y,A=1) untuk y=0 dan y=1.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_006",
        questionEN: "Why is fairness difficult to achieve in ML models?",
        questionID: "Mengapa keadilan sulit dicapai dalam model ML?",
        options: [
            QuestionOption(id: "a", textEN: "Different fairness definitions can be mathematically incompatible", textID: "Definisi keadilan berbeda dapat tidak kompatibel secara matematis"),
            QuestionOption(id: "b", textEN: "Models are inherently unfair", textID: "Model secara inheren tidak adil"),
            QuestionOption(id: "c", textEN: "Fairness cannot be measured", textID: "Keadilan tidak dapat diukur"),
            QuestionOption(id: "d", textEN: "Data is always biased", textID: "Data selalu bias")
        ],
        correctOptionId: "a",
        explanationEN: "The impossibility theorem shows that demographic parity, equalized odds, and calibration cannot all be satisfied simultaneously (except in trivial cases). Trade-offs must be made.",
        explanationID: "Teorema ketidakmungkinan menunjukkan bahwa demographic parity, equalized odds, dan kalibrasi tidak dapat semuanya dipenuhi secara bersamaan (kecuali dalam kasus trivial). Trade-off harus dibuat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_007",
        questionEN: "What is historical bias in training data?",
        questionID: "Apa itu historical bias dalam data training?",
        options: [
            QuestionOption(id: "a", textEN: "Data reflects past societal biases and discriminatory practices", textID: "Data mencerminkan bias masyarakat masa lalu dan praktik diskriminatif"),
            QuestionOption(id: "b", textEN: "Using old data for training", textID: "Menggunakan data lama untuk training"),
            QuestionOption(id: "c", textEN: "Bias in historical records only", textID: "Bias dalam catatan sejarah saja"),
            QuestionOption(id: "d", textEN: "Data collected in the past", textID: "Data dikumpulkan di masa lalu")
        ],
        correctOptionId: "a",
        explanationEN: "Historical bias occurs when data reflects existing prejudices. E.g., if past hiring was discriminatory, training on that data perpetuates discrimination even with a 'fair' algorithm.",
        explanationID: "Historical bias terjadi ketika data mencerminkan prasangka yang ada. Misal, jika perekrutan masa lalu diskriminatif, training pada data itu melanggengkan diskriminasi bahkan dengan algoritma 'adil'.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_008",
        questionEN: "What is measurement bias in ML?",
        questionID: "Apa itu measurement bias dalam ML?",
        options: [
            QuestionOption(id: "a", textEN: "Using proxies that don't equally measure the outcome across groups", textID: "Menggunakan proxy yang tidak mengukur hasil secara setara di seluruh kelompok"),
            QuestionOption(id: "b", textEN: "Incorrect measurements in data collection", textID: "Pengukuran yang salah dalam pengumpulan data"),
            QuestionOption(id: "c", textEN: "Using the wrong evaluation metrics", textID: "Menggunakan metrik evaluasi yang salah"),
            QuestionOption(id: "d", textEN: "Measuring model performance incorrectly", textID: "Mengukur performa model secara tidak benar")
        ],
        correctOptionId: "a",
        explanationEN: "Measurement bias occurs when proxies for the target variable work differently across groups. E.g., using arrest rates as proxy for crime rates may disadvantage over-policed communities.",
        explanationID: "Measurement bias terjadi ketika proxy untuk variabel target bekerja berbeda di seluruh kelompok. Misal, menggunakan tingkat penangkapan sebagai proxy untuk tingkat kejahatan dapat merugikan komunitas yang diawasi berlebihan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_009",
        questionEN: "How can you mitigate bias in training data?",
        questionID: "Bagaimana cara mengurangi bias dalam data training?",
        options: [
            QuestionOption(id: "a", textEN: "Collect diverse data, oversample minorities, remove sensitive features carefully", textID: "Kumpulkan data beragam, oversample minoritas, hapus fitur sensitif dengan hati-hati"),
            QuestionOption(id: "b", textEN: "Only use synthetic data", textID: "Hanya gunakan data sintetis"),
            QuestionOption(id: "c", textEN: "Remove all demographic information", textID: "Hapus semua informasi demografis"),
            QuestionOption(id: "d", textEN: "Use larger datasets only", textID: "Gunakan dataset yang lebih besar saja")
        ],
        correctOptionId: "a",
        explanationEN: "Mitigation includes: diverse data collection, oversampling underrepresented groups, reweighting samples, and careful feature engineering. Simply removing sensitive features often doesn't work due to proxies.",
        explanationID: "Mitigasi meliputi: pengumpulan data beragam, oversampling kelompok yang kurang terwakili, reweighting sampel, dan feature engineering yang hati-hati. Menghapus fitur sensitif saja sering tidak berhasil karena proxy.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_010",
        questionEN: "What is the problem with removing sensitive attributes to achieve fairness?",
        questionID: "Apa masalah dengan menghapus atribut sensitif untuk mencapai keadilan?",
        options: [
            QuestionOption(id: "a", textEN: "Other features can serve as proxies for sensitive attributes", textID: "Fitur lain dapat berfungsi sebagai proxy untuk atribut sensitif"),
            QuestionOption(id: "b", textEN: "It always works perfectly", textID: "Selalu bekerja dengan sempurna"),
            QuestionOption(id: "c", textEN: "Models can't learn without sensitive attributes", textID: "Model tidak dapat belajar tanpa atribut sensitif"),
            QuestionOption(id: "d", textEN: "It's illegal to remove attributes", textID: "Ilegal untuk menghapus atribut")
        ],
        correctOptionId: "a",
        explanationEN: "Fairness through unawareness fails because other features (ZIP code, name, income) can correlate with protected attributes. The model can learn to discriminate through these proxies.",
        explanationID: "Keadilan melalui ketidaksadaran gagal karena fitur lain (kode pos, nama, pendapatan) dapat berkorelasi dengan atribut yang dilindungi. Model dapat belajar mendiskriminasi melalui proxy ini.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_011",
        questionEN: "What is disparate impact in AI systems?",
        questionID: "Apa itu disparate impact dalam sistem AI?",
        options: [
            QuestionOption(id: "a", textEN: "When a neutral policy disproportionately affects a protected group", textID: "Ketika kebijakan netral secara tidak proporsional mempengaruhi kelompok yang dilindungi"),
            QuestionOption(id: "b", textEN: "Intentional discrimination", textID: "Diskriminasi disengaja"),
            QuestionOption(id: "c", textEN: "Different feature importance", textID: "Pentingnya fitur berbeda"),
            QuestionOption(id: "d", textEN: "Impact of different algorithms", textID: "Dampak algoritma berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Disparate impact is unintentional discrimination where a seemingly neutral criterion disproportionately harms a protected group. The 80% rule is often used: if selection rate for minority is <80% of majority, there may be disparate impact.",
        explanationID: "Disparate impact adalah diskriminasi tidak disengaja di mana kriteria yang tampaknya netral secara tidak proporsional merugikan kelompok yang dilindungi. Aturan 80% sering digunakan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_012",
        questionEN: "What is calibration in the context of fairness?",
        questionID: "Apa itu kalibrasi dalam konteks keadilan?",
        options: [
            QuestionOption(id: "a", textEN: "Predicted probabilities reflect true likelihoods equally across groups", textID: "Probabilitas yang diprediksi mencerminkan kemungkinan sebenarnya secara setara di seluruh kelompok"),
            QuestionOption(id: "b", textEN: "Adjusting model parameters", textID: "Menyesuaikan parameter model"),
            QuestionOption(id: "c", textEN: "Measuring model accuracy", textID: "Mengukur akurasi model"),
            QuestionOption(id: "d", textEN: "Tuning hyperparameters fairly", textID: "Menyetel hyperparameter secara adil")
        ],
        correctOptionId: "a",
        explanationEN: "A calibrated model's prediction of 70% should correspond to 70% actual positive rate across all subgroups. Calibration is important for fair decision-making when thresholds are used.",
        explanationID: "Prediksi model yang terkalibrasi 70% harus sesuai dengan tingkat positif aktual 70% di semua subkelompok. Kalibrasi penting untuk pengambilan keputusan yang adil ketika threshold digunakan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_013",
        questionEN: "What is the fairness-accuracy trade-off?",
        questionID: "Apa itu trade-off keadilan-akurasi?",
        options: [
            QuestionOption(id: "a", textEN: "Improving fairness may reduce overall predictive accuracy", textID: "Meningkatkan keadilan dapat mengurangi akurasi prediktif keseluruhan"),
            QuestionOption(id: "b", textEN: "Fair models are always less accurate", textID: "Model yang adil selalu kurang akurat"),
            QuestionOption(id: "c", textEN: "Accurate models are always fair", textID: "Model yang akurat selalu adil"),
            QuestionOption(id: "d", textEN: "There is no trade-off", textID: "Tidak ada trade-off")
        ],
        correctOptionId: "a",
        explanationEN: "Optimizing for fairness constraints often reduces accuracy because it prevents the model from exploiting correlations with protected attributes. The trade-off severity depends on the specific case.",
        explanationID: "Mengoptimalkan untuk batasan keadilan sering mengurangi akurasi karena mencegah model mengeksploitasi korelasi dengan atribut yang dilindungi. Tingkat keparahan trade-off tergantung pada kasus spesifik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_014",
        questionEN: "What is counterfactual fairness?",
        questionID: "Apa itu counterfactual fairness?",
        options: [
            QuestionOption(id: "a", textEN: "Prediction would be the same if protected attribute was different", textID: "Prediksi akan sama jika atribut yang dilindungi berbeda"),
            QuestionOption(id: "b", textEN: "Counting fair and unfair predictions", textID: "Menghitung prediksi adil dan tidak adil"),
            QuestionOption(id: "c", textEN: "Using factual data only", textID: "Menggunakan data faktual saja"),
            QuestionOption(id: "d", textEN: "Predicting counterfactual outcomes", textID: "Memprediksi hasil counterfactual")
        ],
        correctOptionId: "a",
        explanationEN: "Counterfactual fairness asks: would this individual get the same prediction in a counterfactual world where their protected attribute was different? It requires causal modeling.",
        explanationID: "Counterfactual fairness bertanya: apakah individu ini akan mendapatkan prediksi yang sama di dunia counterfactual di mana atribut yang dilindungi berbeda? Ini memerlukan pemodelan kausal.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_015",
        questionEN: "What is the role of protected attributes in fairness?",
        questionID: "Apa peran atribut yang dilindungi dalam keadilan?",
        options: [
            QuestionOption(id: "a", textEN: "Characteristics like race, gender, age that shouldn't influence decisions", textID: "Karakteristik seperti ras, gender, usia yang tidak boleh mempengaruhi keputusan"),
            QuestionOption(id: "b", textEN: "Features that protect the model from bias", textID: "Fitur yang melindungi model dari bias"),
            QuestionOption(id: "c", textEN: "Encrypted features in the data", textID: "Fitur terenkripsi dalam data"),
            QuestionOption(id: "d", textEN: "Features that are protected from deletion", textID: "Fitur yang dilindungi dari penghapusan")
        ],
        correctOptionId: "a",
        explanationEN: "Protected attributes are sensitive characteristics (race, gender, religion, age, disability) that, legally or ethically, should not be used for discriminatory decisions.",
        explanationID: "Atribut yang dilindungi adalah karakteristik sensitif (ras, gender, agama, usia, disabilitas) yang, secara hukum atau etis, tidak boleh digunakan untuk keputusan diskriminatif.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // MARK: - Explainability (Questions 16-25)
    Question(
        id: "ethics_016",
        questionEN: "What is the difference between interpretable and explainable AI?",
        questionID: "Apa perbedaan antara AI yang interpretable dan explainable?",
        options: [
            QuestionOption(id: "a", textEN: "Interpretable: inherently understandable; Explainable: post-hoc explanations for complex models", textID: "Interpretable: dapat dipahami secara inheren; Explainable: penjelasan post-hoc untuk model kompleks"),
            QuestionOption(id: "b", textEN: "They are exactly the same", textID: "Mereka persis sama"),
            QuestionOption(id: "c", textEN: "Interpretable is for simple models only", textID: "Interpretable hanya untuk model sederhana"),
            QuestionOption(id: "d", textEN: "Explainable means better accuracy", textID: "Explainable berarti akurasi lebih baik")
        ],
        correctOptionId: "a",
        explanationEN: "Interpretable models (linear regression, decision trees) are understandable by design. Explainable AI uses techniques (LIME, SHAP) to explain black-box models post-hoc.",
        explanationID: "Model interpretable (regresi linear, decision trees) dapat dipahami secara desain. Explainable AI menggunakan teknik (LIME, SHAP) untuk menjelaskan model black-box secara post-hoc.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_017",
        questionEN: "What is LIME (Local Interpretable Model-agnostic Explanations)?",
        questionID: "Apa itu LIME (Local Interpretable Model-agnostic Explanations)?",
        options: [
            QuestionOption(id: "a", textEN: "Explains individual predictions by fitting local interpretable models", textID: "Menjelaskan prediksi individual dengan memfit model interpretable lokal"),
            QuestionOption(id: "b", textEN: "A type of neural network", textID: "Jenis neural network"),
            QuestionOption(id: "c", textEN: "A global explanation method", textID: "Metode penjelasan global"),
            QuestionOption(id: "d", textEN: "A data preprocessing tool", textID: "Alat preprocessing data")
        ],
        correctOptionId: "a",
        explanationEN: "LIME perturbs input features, observes prediction changes, and fits a simple interpretable model (like linear regression) locally to explain how features contribute to that specific prediction.",
        explanationID: "LIME mengganggu fitur input, mengamati perubahan prediksi, dan memfit model interpretable sederhana (seperti regresi linear) secara lokal untuk menjelaskan bagaimana fitur berkontribusi pada prediksi spesifik tersebut.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_018",
        questionEN: "What are SHAP values?",
        questionID: "Apa itu nilai SHAP?",
        options: [
            QuestionOption(id: "a", textEN: "Feature importance based on game-theoretic Shapley values", textID: "Pentingnya fitur berdasarkan nilai Shapley teori permainan"),
            QuestionOption(id: "b", textEN: "Shape of the decision boundary", textID: "Bentuk batas keputusan"),
            QuestionOption(id: "c", textEN: "Sharp predictions from the model", textID: "Prediksi tajam dari model"),
            QuestionOption(id: "d", textEN: "Importance of sharp features", textID: "Pentingnya fitur tajam")
        ],
        correctOptionId: "a",
        explanationEN: "SHAP (SHapley Additive exPlanations) uses Shapley values from cooperative game theory to fairly distribute the prediction among features, providing consistent and theoretically grounded explanations.",
        explanationID: "SHAP (SHapley Additive exPlanations) menggunakan nilai Shapley dari teori permainan kooperatif untuk mendistribusikan prediksi secara adil di antara fitur, memberikan penjelasan yang konsisten dan berdasar teori.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_019",
        questionEN: "What is the right to explanation in AI regulation?",
        questionID: "Apa itu hak atas penjelasan dalam regulasi AI?",
        options: [
            QuestionOption(id: "a", textEN: "Individuals' right to understand how automated decisions affect them", textID: "Hak individu untuk memahami bagaimana keputusan otomatis mempengaruhi mereka"),
            QuestionOption(id: "b", textEN: "Companies must explain their algorithms publicly", textID: "Perusahaan harus menjelaskan algoritma mereka secara publik"),
            QuestionOption(id: "c", textEN: "Right to modify AI models", textID: "Hak untuk memodifikasi model AI"),
            QuestionOption(id: "d", textEN: "Right to opt out of AI systems", textID: "Hak untuk keluar dari sistem AI")
        ],
        correctOptionId: "a",
        explanationEN: "GDPR and similar regulations grant individuals the right to meaningful information about automated decision-making logic, especially for decisions with significant effects.",
        explanationID: "GDPR dan regulasi serupa memberikan individu hak atas informasi bermakna tentang logika pengambilan keputusan otomatis, terutama untuk keputusan dengan efek signifikan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_020",
        questionEN: "What are saliency maps in explainability?",
        questionID: "Apa itu saliency maps dalam explainability?",
        options: [
            QuestionOption(id: "a", textEN: "Visual highlight of important input regions for the prediction", textID: "Sorotan visual dari wilayah input penting untuk prediksi"),
            QuestionOption(id: "b", textEN: "Maps showing model performance", textID: "Peta yang menunjukkan performa model"),
            QuestionOption(id: "c", textEN: "Geographic maps of model usage", textID: "Peta geografis penggunaan model"),
            QuestionOption(id: "d", textEN: "Colorful model visualizations", textID: "Visualisasi model berwarna")
        ],
        correctOptionId: "a",
        explanationEN: "Saliency maps highlight which parts of input (e.g., image pixels) most influenced the prediction. Methods include gradient-based approaches, GradCAM, and integrated gradients.",
        explanationID: "Saliency maps menyoroti bagian input mana (misal, piksel gambar) yang paling mempengaruhi prediksi. Metode termasuk pendekatan berbasis gradien, GradCAM, dan integrated gradients.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_021",
        questionEN: "What is attention visualization in transformer models?",
        questionID: "Apa itu visualisasi attention dalam model transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Showing which tokens the model focuses on for predictions", textID: "Menunjukkan token mana yang model fokuskan untuk prediksi"),
            QuestionOption(id: "b", textEN: "Measuring human attention to the model", textID: "Mengukur perhatian manusia terhadap model"),
            QuestionOption(id: "c", textEN: "Visualizing training attention", textID: "Memvisualisasikan perhatian training"),
            QuestionOption(id: "d", textEN: "Attention to model architecture", textID: "Perhatian terhadap arsitektur model")
        ],
        correctOptionId: "a",
        explanationEN: "Attention weights can be visualized to show which input tokens influence each output. However, attention doesn't always reflect true importance and should be interpreted carefully.",
        explanationID: "Bobot attention dapat divisualisasikan untuk menunjukkan token input mana yang mempengaruhi setiap output. Namun, attention tidak selalu mencerminkan pentingnya yang sebenarnya dan harus diinterpretasikan dengan hati-hati.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_022",
        questionEN: "What is feature importance in tree-based models?",
        questionID: "Apa itu feature importance dalam model berbasis pohon?",
        options: [
            QuestionOption(id: "a", textEN: "Ranking features by how much they improve splits in the tree", textID: "Memberi peringkat fitur berdasarkan seberapa banyak mereka memperbaiki split dalam pohon"),
            QuestionOption(id: "b", textEN: "Importance of using tree models", textID: "Pentingnya menggunakan model pohon"),
            QuestionOption(id: "c", textEN: "Features selected before training", textID: "Fitur yang dipilih sebelum training"),
            QuestionOption(id: "d", textEN: "Number of features used", textID: "Jumlah fitur yang digunakan")
        ],
        correctOptionId: "a",
        explanationEN: "Tree-based models measure feature importance by information gain or impurity decrease from splits. Random Forest averages importance across trees. However, this can be biased for correlated features.",
        explanationID: "Model berbasis pohon mengukur pentingnya fitur dengan information gain atau penurunan impurity dari split. Random Forest merata-ratakan importance di seluruh pohon. Namun, ini bisa bias untuk fitur yang berkorelasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_023",
        questionEN: "What is permutation importance?",
        questionID: "Apa itu permutation importance?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring performance drop when feature values are randomly shuffled", textID: "Mengukur penurunan performa ketika nilai fitur diacak secara acak"),
            QuestionOption(id: "b", textEN: "Importance of permutation order", textID: "Pentingnya urutan permutasi"),
            QuestionOption(id: "c", textEN: "Shuffling model predictions", textID: "Mengacak prediksi model"),
            QuestionOption(id: "d", textEN: "Changing feature order in data", textID: "Mengubah urutan fitur dalam data")
        ],
        correctOptionId: "a",
        explanationEN: "Permutation importance shuffles one feature at a time and measures model performance drop. A large drop indicates the feature is important. It's model-agnostic and works on test data.",
        explanationID: "Permutation importance mengacak satu fitur pada satu waktu dan mengukur penurunan performa model. Penurunan besar menunjukkan fitur itu penting. Ini model-agnostic dan bekerja pada data test.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_024",
        questionEN: "Why might explanations be misleading?",
        questionID: "Mengapa penjelasan bisa menyesatkan?",
        options: [
            QuestionOption(id: "a", textEN: "They may oversimplify complex model behavior or be unfaithful to actual reasoning", textID: "Mereka mungkin menyederhanakan perilaku model kompleks atau tidak setia pada reasoning sebenarnya"),
            QuestionOption(id: "b", textEN: "Explanations are always accurate", textID: "Penjelasan selalu akurat"),
            QuestionOption(id: "c", textEN: "Only bad models have misleading explanations", textID: "Hanya model buruk yang memiliki penjelasan menyesatkan"),
            QuestionOption(id: "d", textEN: "Users don't understand explanations", textID: "Pengguna tidak memahami penjelasan")
        ],
        correctOptionId: "a",
        explanationEN: "Post-hoc explanations approximate complex model behavior with simpler models. They may not capture all reasoning, be sensitive to perturbation methods, or give false confidence about model behavior.",
        explanationID: "Penjelasan post-hoc mengaproksimasi perilaku model kompleks dengan model lebih sederhana. Mereka mungkin tidak menangkap semua reasoning, sensitif terhadap metode perturbasi, atau memberikan kepercayaan palsu tentang perilaku model.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_025",
        questionEN: "What is concept bottleneck in interpretable AI?",
        questionID: "Apa itu concept bottleneck dalam AI interpretable?",
        options: [
            QuestionOption(id: "a", textEN: "Model first predicts human-understandable concepts, then final output", textID: "Model pertama memprediksi konsep yang dapat dipahami manusia, lalu output akhir"),
            QuestionOption(id: "b", textEN: "Limitation in model understanding", textID: "Keterbatasan dalam pemahaman model"),
            QuestionOption(id: "c", textEN: "Bottleneck in concept learning", textID: "Bottleneck dalam pembelajaran konsep"),
            QuestionOption(id: "d", textEN: "Reducing concept complexity", textID: "Mengurangi kompleksitas konsep")
        ],
        correctOptionId: "a",
        explanationEN: "Concept bottleneck models predict interpretable intermediate concepts (e.g., 'has stripes', 'has wings') before the final classification. This enables understanding and intervention at the concept level.",
        explanationID: "Model concept bottleneck memprediksi konsep antara yang interpretable (misal, 'memiliki garis', 'memiliki sayap') sebelum klasifikasi akhir. Ini memungkinkan pemahaman dan intervensi di tingkat konsep.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Privacy (Questions 26-35)
    Question(
        id: "ethics_026",
        questionEN: "What is differential privacy in machine learning?",
        questionID: "Apa itu differential privacy dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Mathematical guarantee that individual data points don't significantly affect outputs", textID: "Jaminan matematis bahwa titik data individu tidak secara signifikan mempengaruhi output"),
            QuestionOption(id: "b", textEN: "Different privacy levels for different users", textID: "Tingkat privasi berbeda untuk pengguna berbeda"),
            QuestionOption(id: "c", textEN: "Privacy for different data types", textID: "Privasi untuk tipe data berbeda"),
            QuestionOption(id: "d", textEN: "Differential treatment of private data", textID: "Perlakuan diferensial terhadap data privat")
        ],
        correctOptionId: "a",
        explanationEN: "Differential privacy adds calibrated noise to ensure that model outputs are nearly identical whether any individual's data is included or not, protecting individual privacy with mathematical guarantees.",
        explanationID: "Differential privacy menambahkan noise terkalibrasi untuk memastikan output model hampir identik apakah data individu manapun disertakan atau tidak, melindungi privasi individu dengan jaminan matematis.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_027",
        questionEN: "What is the privacy-utility trade-off?",
        questionID: "Apa itu trade-off privasi-utilitas?",
        options: [
            QuestionOption(id: "a", textEN: "More privacy protection typically reduces model accuracy or data utility", textID: "Lebih banyak perlindungan privasi biasanya mengurangi akurasi model atau utilitas data"),
            QuestionOption(id: "b", textEN: "Privacy and utility are always aligned", textID: "Privasi dan utilitas selalu selaras"),
            QuestionOption(id: "c", textEN: "More privacy means more utility", textID: "Lebih banyak privasi berarti lebih banyak utilitas"),
            QuestionOption(id: "d", textEN: "There is no trade-off", textID: "Tidak ada trade-off")
        ],
        correctOptionId: "a",
        explanationEN: "Stronger privacy (more noise, less data access) typically reduces model performance. Choosing epsilon in differential privacy involves balancing privacy guarantees against model utility.",
        explanationID: "Privasi lebih kuat (lebih banyak noise, lebih sedikit akses data) biasanya mengurangi performa model. Memilih epsilon dalam differential privacy melibatkan keseimbangan jaminan privasi terhadap utilitas model.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_028",
        questionEN: "What is federated learning?",
        questionID: "Apa itu federated learning?",
        options: [
            QuestionOption(id: "a", textEN: "Training on decentralized data without sharing raw data", textID: "Training pada data terdesentralisasi tanpa berbagi data mentah"),
            QuestionOption(id: "b", textEN: "Learning in a federation of countries", textID: "Belajar dalam federasi negara"),
            QuestionOption(id: "c", textEN: "Federal government AI systems", textID: "Sistem AI pemerintah federal"),
            QuestionOption(id: "d", textEN: "Combining multiple models into one", textID: "Menggabungkan beberapa model menjadi satu")
        ],
        correctOptionId: "a",
        explanationEN: "Federated learning trains models across multiple devices/servers with local data, sharing only model updates (not data). This preserves privacy while enabling collaborative learning.",
        explanationID: "Federated learning melatih model di berbagai perangkat/server dengan data lokal, hanya berbagi update model (bukan data). Ini mempertahankan privasi sambil memungkinkan pembelajaran kolaboratif.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_029",
        questionEN: "What is a membership inference attack?",
        questionID: "Apa itu serangan membership inference?",
        options: [
            QuestionOption(id: "a", textEN: "Determining if a specific data point was in the training set", textID: "Menentukan apakah titik data tertentu ada dalam training set"),
            QuestionOption(id: "b", textEN: "Attacking group membership", textID: "Menyerang keanggotaan kelompok"),
            QuestionOption(id: "c", textEN: "Inferring member relationships", textID: "Menyimpulkan hubungan anggota"),
            QuestionOption(id: "d", textEN: "Joining a membership program", textID: "Bergabung dengan program keanggotaan")
        ],
        correctOptionId: "a",
        explanationEN: "Membership inference attacks exploit model behavior (confidence, predictions) to determine if a specific record was used for training, potentially revealing sensitive information about individuals.",
        explanationID: "Serangan membership inference mengeksploitasi perilaku model (confidence, prediksi) untuk menentukan apakah rekaman tertentu digunakan untuk training, berpotensi mengungkapkan informasi sensitif tentang individu.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_030",
        questionEN: "What is model inversion attack?",
        questionID: "Apa itu serangan model inversion?",
        options: [
            QuestionOption(id: "a", textEN: "Reconstructing training data features from model outputs", textID: "Merekonstruksi fitur data training dari output model"),
            QuestionOption(id: "b", textEN: "Inverting the model architecture", textID: "Membalikkan arsitektur model"),
            QuestionOption(id: "c", textEN: "Training the model backwards", textID: "Melatih model secara terbalik"),
            QuestionOption(id: "d", textEN: "Reversing model predictions", textID: "Membalikkan prediksi model")
        ],
        correctOptionId: "a",
        explanationEN: "Model inversion attacks use model outputs to reconstruct sensitive training data features, like recovering faces from face recognition models. It's a serious privacy concern.",
        explanationID: "Serangan model inversion menggunakan output model untuk merekonstruksi fitur data training yang sensitif, seperti memulihkan wajah dari model pengenalan wajah. Ini adalah masalah privasi yang serius.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_031",
        questionEN: "What is data anonymization?",
        questionID: "Apa itu anonimisasi data?",
        options: [
            QuestionOption(id: "a", textEN: "Removing or obfuscating personally identifiable information", textID: "Menghapus atau mengaburkan informasi yang dapat mengidentifikasi secara pribadi"),
            QuestionOption(id: "b", textEN: "Making data anonymous to models", textID: "Membuat data anonim untuk model"),
            QuestionOption(id: "c", textEN: "Anonymous data collection", textID: "Pengumpulan data anonim"),
            QuestionOption(id: "d", textEN: "Hiding data from researchers", textID: "Menyembunyikan data dari peneliti")
        ],
        correctOptionId: "a",
        explanationEN: "Anonymization removes identifiers to prevent re-identification. However, quasi-identifiers (ZIP, birthdate) can enable re-identification through linkage attacks.",
        explanationID: "Anonimisasi menghapus identifier untuk mencegah identifikasi ulang. Namun, quasi-identifier (kode pos, tanggal lahir) dapat memungkinkan identifikasi ulang melalui serangan linkage.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "ethics_032",
        questionEN: "What is k-anonymity?",
        questionID: "Apa itu k-anonymity?",
        options: [
            QuestionOption(id: "a", textEN: "Each record is indistinguishable from at least k-1 other records", textID: "Setiap rekaman tidak dapat dibedakan dari setidaknya k-1 rekaman lainnya"),
            QuestionOption(id: "b", textEN: "Keeping k records anonymous", textID: "Menjaga k rekaman anonim"),
            QuestionOption(id: "c", textEN: "Anonymous for k users", textID: "Anonim untuk k pengguna"),
            QuestionOption(id: "d", textEN: "Anonymity level of k percent", textID: "Tingkat anonimitas k persen")
        ],
        correctOptionId: "a",
        explanationEN: "K-anonymity ensures each record shares quasi-identifier values with at least k-1 others, making individual identification harder. It has weaknesses like homogeneity and background knowledge attacks.",
        explanationID: "K-anonymity memastikan setiap rekaman berbagi nilai quasi-identifier dengan setidaknya k-1 lainnya, membuat identifikasi individu lebih sulit. Ini memiliki kelemahan seperti serangan homogenitas dan pengetahuan latar belakang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_033",
        questionEN: "What is secure multi-party computation (MPC)?",
        questionID: "Apa itu secure multi-party computation (MPC)?",
        options: [
            QuestionOption(id: "a", textEN: "Multiple parties jointly compute function without revealing their private inputs", textID: "Beberapa pihak bersama-sama menghitung fungsi tanpa mengungkapkan input privat mereka"),
            QuestionOption(id: "b", textEN: "Secure computation across multiple computers", textID: "Komputasi aman di beberapa komputer"),
            QuestionOption(id: "c", textEN: "Political party data security", textID: "Keamanan data partai politik"),
            QuestionOption(id: "d", textEN: "Multi-party authentication", textID: "Autentikasi multi-pihak")
        ],
        correctOptionId: "a",
        explanationEN: "MPC enables multiple parties to jointly compute a function over their inputs while keeping those inputs private. Useful for privacy-preserving ML on sensitive distributed data.",
        explanationID: "MPC memungkinkan beberapa pihak untuk bersama-sama menghitung fungsi atas input mereka sambil menjaga input tersebut tetap privat. Berguna untuk ML yang melindungi privasi pada data terdistribusi sensitif.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_034",
        questionEN: "What is homomorphic encryption for ML?",
        questionID: "Apa itu enkripsi homomorfik untuk ML?",
        options: [
            QuestionOption(id: "a", textEN: "Performing computations on encrypted data without decryption", textID: "Melakukan komputasi pada data terenkripsi tanpa dekripsi"),
            QuestionOption(id: "b", textEN: "Encrypting ML models", textID: "Mengenkripsi model ML"),
            QuestionOption(id: "c", textEN: "Same encryption for all data", textID: "Enkripsi yang sama untuk semua data"),
            QuestionOption(id: "d", textEN: "Homogeneous encryption methods", textID: "Metode enkripsi homogen")
        ],
        correctOptionId: "a",
        explanationEN: "Homomorphic encryption allows computation on encrypted data. The encrypted result decrypts to the same answer as computing on plaintext. Enables privacy-preserving inference.",
        explanationID: "Enkripsi homomorfik memungkinkan komputasi pada data terenkripsi. Hasil terenkripsi mendekripsi ke jawaban yang sama seperti komputasi pada plaintext. Memungkinkan inferensi yang melindungi privasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_035",
        questionEN: "What is the epsilon parameter in differential privacy?",
        questionID: "Apa itu parameter epsilon dalam differential privacy?",
        options: [
            QuestionOption(id: "a", textEN: "Privacy budget that controls trade-off between privacy and accuracy", textID: "Anggaran privasi yang mengontrol trade-off antara privasi dan akurasi"),
            QuestionOption(id: "b", textEN: "Error rate of the model", textID: "Tingkat kesalahan model"),
            QuestionOption(id: "c", textEN: "Small positive number for training", textID: "Angka positif kecil untuk training"),
            QuestionOption(id: "d", textEN: "Encryption strength parameter", textID: "Parameter kekuatan enkripsi")
        ],
        correctOptionId: "a",
        explanationEN: "Epsilon (ε) is the privacy loss parameter. Smaller ε means stronger privacy but more noise/less accuracy. Values like ε<1 are considered strong privacy; ε>10 may be weak.",
        explanationID: "Epsilon (ε) adalah parameter kehilangan privasi. ε lebih kecil berarti privasi lebih kuat tetapi lebih banyak noise/kurang akurasi. Nilai seperti ε<1 dianggap privasi kuat; ε>10 mungkin lemah.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Safety & Responsibility (Questions 36-50)
    Question(
        id: "ethics_036",
        questionEN: "What is AI alignment?",
        questionID: "Apa itu AI alignment?",
        options: [
            QuestionOption(id: "a", textEN: "Ensuring AI systems pursue goals aligned with human values", textID: "Memastikan sistem AI mengejar tujuan yang selaras dengan nilai-nilai manusia"),
            QuestionOption(id: "b", textEN: "Aligning model weights properly", textID: "Menyelaraskan bobot model dengan benar"),
            QuestionOption(id: "c", textEN: "Formatting AI code correctly", textID: "Memformat kode AI dengan benar"),
            QuestionOption(id: "d", textEN: "Aligning training data", textID: "Menyelaraskan data training")
        ],
        correctOptionId: "a",
        explanationEN: "AI alignment is ensuring AI systems understand, adopt, and pursue goals that are beneficial to humans. Misaligned AI could pursue goals that are harmful or unintended.",
        explanationID: "AI alignment adalah memastikan sistem AI memahami, mengadopsi, dan mengejar tujuan yang bermanfaat bagi manusia. AI yang tidak selaras dapat mengejar tujuan yang berbahaya atau tidak diinginkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_037",
        questionEN: "What is the specification problem in AI safety?",
        questionID: "Apa itu masalah spesifikasi dalam keamanan AI?",
        options: [
            QuestionOption(id: "a", textEN: "Difficulty in fully specifying what we want AI to optimize", textID: "Kesulitan dalam sepenuhnya menentukan apa yang kita ingin AI optimalkan"),
            QuestionOption(id: "b", textEN: "Writing model specifications", textID: "Menulis spesifikasi model"),
            QuestionOption(id: "c", textEN: "Hardware specification issues", textID: "Masalah spesifikasi hardware"),
            QuestionOption(id: "d", textEN: "API specification problems", textID: "Masalah spesifikasi API")
        ],
        correctOptionId: "a",
        explanationEN: "The specification problem is that it's hard to fully specify human values. Reward functions may be gamed, and objectives might have unintended consequences when optimized too literally.",
        explanationID: "Masalah spesifikasi adalah bahwa sulit untuk sepenuhnya menentukan nilai-nilai manusia. Fungsi reward dapat dimanipulasi, dan tujuan mungkin memiliki konsekuensi tidak diinginkan ketika dioptimalkan terlalu literal.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_038",
        questionEN: "What is adversarial robustness?",
        questionID: "Apa itu ketahanan adversarial?",
        options: [
            QuestionOption(id: "a", textEN: "Model's resistance to carefully crafted inputs designed to cause errors", textID: "Ketahanan model terhadap input yang dibuat dengan hati-hati untuk menyebabkan kesalahan"),
            QuestionOption(id: "b", textEN: "Training against an adversary", textID: "Training melawan musuh"),
            QuestionOption(id: "c", textEN: "Competitive model performance", textID: "Performa model kompetitif"),
            QuestionOption(id: "d", textEN: "Robust training data", textID: "Data training yang robust")
        ],
        correctOptionId: "a",
        explanationEN: "Adversarial robustness is the model's ability to maintain correct predictions when inputs are perturbed by adversarial attacks (small changes designed to cause misclassification).",
        explanationID: "Ketahanan adversarial adalah kemampuan model untuk mempertahankan prediksi yang benar ketika input diganggu oleh serangan adversarial (perubahan kecil yang dirancang untuk menyebabkan kesalahan klasifikasi).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_039",
        questionEN: "What is RLHF (Reinforcement Learning from Human Feedback)?",
        questionID: "Apa itu RLHF (Reinforcement Learning from Human Feedback)?",
        options: [
            QuestionOption(id: "a", textEN: "Training models using human preference rankings as reward signal", textID: "Melatih model menggunakan peringkat preferensi manusia sebagai sinyal reward"),
            QuestionOption(id: "b", textEN: "Humans learning from reinforcement", textID: "Manusia belajar dari reinforcement"),
            QuestionOption(id: "c", textEN: "Human feedback on model outputs", textID: "Umpan balik manusia pada output model"),
            QuestionOption(id: "d", textEN: "Reinforcing human learning", textID: "Memperkuat pembelajaran manusia")
        ],
        correctOptionId: "a",
        explanationEN: "RLHF trains a reward model from human preferences, then uses RL to optimize the main model against this reward. Used to make LLMs helpful, harmless, and honest.",
        explanationID: "RLHF melatih model reward dari preferensi manusia, kemudian menggunakan RL untuk mengoptimalkan model utama terhadap reward ini. Digunakan untuk membuat LLM membantu, tidak berbahaya, dan jujur.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_040",
        questionEN: "What is constitutional AI?",
        questionID: "Apa itu constitutional AI?",
        options: [
            QuestionOption(id: "a", textEN: "Training AI with a set of principles (constitution) to self-critique and revise", textID: "Melatih AI dengan seperangkat prinsip (konstitusi) untuk mengkritik diri sendiri dan merevisi"),
            QuestionOption(id: "b", textEN: "AI for legal systems", textID: "AI untuk sistem hukum"),
            QuestionOption(id: "c", textEN: "Government-regulated AI", textID: "AI yang diatur pemerintah"),
            QuestionOption(id: "d", textEN: "AI that follows country laws", textID: "AI yang mengikuti hukum negara")
        ],
        correctOptionId: "a",
        explanationEN: "Constitutional AI provides AI with a set of principles to follow. The model critiques its own outputs against these principles and revises them, reducing need for extensive human feedback.",
        explanationID: "Constitutional AI menyediakan AI dengan seperangkat prinsip untuk diikuti. Model mengkritik outputnya sendiri terhadap prinsip-prinsip ini dan merevisinya, mengurangi kebutuhan umpan balik manusia yang ekstensif.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "ethics_041",
        questionEN: "What is model monitoring in production?",
        questionID: "Apa itu pemantauan model dalam produksi?",
        options: [
            QuestionOption(id: "a", textEN: "Tracking model performance, data drift, and fairness over time", textID: "Melacak performa model, drift data, dan keadilan dari waktu ke waktu"),
            QuestionOption(id: "b", textEN: "Watching models train", textID: "Mengamati model berlatih"),
            QuestionOption(id: "c", textEN: "Monitoring GPU usage", textID: "Memantau penggunaan GPU"),
            QuestionOption(id: "d", textEN: "Human oversight of AI", textID: "Pengawasan manusia terhadap AI")
        ],
        correctOptionId: "a",
        explanationEN: "Model monitoring tracks prediction quality, input data distribution changes, and fairness metrics over time to detect degradation, drift, or emerging bias in deployed models.",
        explanationID: "Pemantauan model melacak kualitas prediksi, perubahan distribusi data input, dan metrik keadilan dari waktu ke waktu untuk mendeteksi degradasi, drift, atau bias yang muncul dalam model yang di-deploy.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_042",
        questionEN: "What is data drift?",
        questionID: "Apa itu data drift?",
        options: [
            QuestionOption(id: "a", textEN: "Changes in input data distribution compared to training data", textID: "Perubahan distribusi data input dibandingkan dengan data training"),
            QuestionOption(id: "b", textEN: "Data moving between servers", textID: "Data berpindah antar server"),
            QuestionOption(id: "c", textEN: "Missing data over time", textID: "Data hilang dari waktu ke waktu"),
            QuestionOption(id: "d", textEN: "Database migration issues", textID: "Masalah migrasi database")
        ],
        correctOptionId: "a",
        explanationEN: "Data drift occurs when production data differs from training data distribution. This can degrade model performance and requires monitoring and retraining.",
        explanationID: "Data drift terjadi ketika data produksi berbeda dari distribusi data training. Ini dapat menurunkan performa model dan memerlukan pemantauan dan retraining.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_043",
        questionEN: "What is concept drift?",
        questionID: "Apa itu concept drift?",
        options: [
            QuestionOption(id: "a", textEN: "The relationship between inputs and target changes over time", textID: "Hubungan antara input dan target berubah dari waktu ke waktu"),
            QuestionOption(id: "b", textEN: "Changes in model concepts", textID: "Perubahan dalam konsep model"),
            QuestionOption(id: "c", textEN: "Drifting model weights", textID: "Bobot model yang drift"),
            QuestionOption(id: "d", textEN: "Changes in data storage", textID: "Perubahan dalam penyimpanan data")
        ],
        correctOptionId: "a",
        explanationEN: "Concept drift occurs when the underlying relationship between features and target changes. E.g., what constitutes fraud changes as fraudsters adapt. Requires model updates.",
        explanationID: "Concept drift terjadi ketika hubungan mendasar antara fitur dan target berubah. Misal, apa yang merupakan penipuan berubah saat penipu beradaptasi. Memerlukan pembaruan model.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_044",
        questionEN: "What is model documentation (model cards)?",
        questionID: "Apa itu dokumentasi model (model cards)?",
        options: [
            QuestionOption(id: "a", textEN: "Standardized reports on model training, performance, intended use, and limitations", textID: "Laporan standar tentang training model, performa, penggunaan yang dimaksudkan, dan keterbatasan"),
            QuestionOption(id: "b", textEN: "Code documentation", textID: "Dokumentasi kode"),
            QuestionOption(id: "c", textEN: "Physical cards describing models", textID: "Kartu fisik yang menjelaskan model"),
            QuestionOption(id: "d", textEN: "Model parameter lists", textID: "Daftar parameter model")
        ],
        correctOptionId: "a",
        explanationEN: "Model cards document intended uses, performance across demographics, ethical considerations, and limitations. They promote transparency and responsible use.",
        explanationID: "Model cards mendokumentasikan penggunaan yang dimaksudkan, performa di berbagai demografis, pertimbangan etis, dan keterbatasan. Mereka mempromosikan transparansi dan penggunaan yang bertanggung jawab.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_045",
        questionEN: "What is AI governance?",
        questionID: "Apa itu tata kelola AI?",
        options: [
            QuestionOption(id: "a", textEN: "Policies, processes, and structures for responsible AI development and deployment", textID: "Kebijakan, proses, dan struktur untuk pengembangan dan penyebaran AI yang bertanggung jawab"),
            QuestionOption(id: "b", textEN: "Government control of AI", textID: "Kontrol pemerintah terhadap AI"),
            QuestionOption(id: "c", textEN: "AI governing humans", textID: "AI yang mengatur manusia"),
            QuestionOption(id: "d", textEN: "Political AI systems", textID: "Sistem AI politik")
        ],
        correctOptionId: "a",
        explanationEN: "AI governance includes organizational policies, oversight mechanisms, risk assessment procedures, and accountability structures for responsible AI development and use.",
        explanationID: "Tata kelola AI mencakup kebijakan organisasi, mekanisme pengawasan, prosedur penilaian risiko, dan struktur akuntabilitas untuk pengembangan dan penggunaan AI yang bertanggung jawab.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_046",
        questionEN: "What is the EU AI Act classification system?",
        questionID: "Apa itu sistem klasifikasi EU AI Act?",
        options: [
            QuestionOption(id: "a", textEN: "Risk-based tiers: unacceptable, high, limited, minimal risk", textID: "Tingkatan berbasis risiko: tidak dapat diterima, tinggi, terbatas, risiko minimal"),
            QuestionOption(id: "b", textEN: "Classification of AI accuracy", textID: "Klasifikasi akurasi AI"),
            QuestionOption(id: "c", textEN: "Types of AI models", textID: "Jenis model AI"),
            QuestionOption(id: "d", textEN: "European AI companies", textID: "Perusahaan AI Eropa")
        ],
        correctOptionId: "a",
        explanationEN: "The EU AI Act classifies AI by risk: unacceptable (banned, e.g., social scoring), high-risk (strict requirements), limited risk (transparency needs), minimal risk (no restrictions).",
        explanationID: "EU AI Act mengklasifikasikan AI berdasarkan risiko: tidak dapat diterima (dilarang, misal, social scoring), risiko tinggi (persyaratan ketat), risiko terbatas (kebutuhan transparansi), risiko minimal (tanpa batasan).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_047",
        questionEN: "What are AI red teams?",
        questionID: "Apa itu red teams AI?",
        options: [
            QuestionOption(id: "a", textEN: "Teams that try to find failures, biases, and safety issues in AI systems", textID: "Tim yang mencoba menemukan kegagalan, bias, dan masalah keamanan dalam sistem AI"),
            QuestionOption(id: "b", textEN: "Teams using red-colored tools", textID: "Tim yang menggunakan alat berwarna merah"),
            QuestionOption(id: "c", textEN: "Emergency response teams", textID: "Tim tanggap darurat"),
            QuestionOption(id: "d", textEN: "Competitive AI development teams", textID: "Tim pengembangan AI kompetitif")
        ],
        correctOptionId: "a",
        explanationEN: "AI red teams adversarially test AI systems to discover vulnerabilities, failure modes, harmful outputs, and bias issues before deployment. Essential for responsible AI.",
        explanationID: "Red teams AI menguji sistem AI secara adversarial untuk menemukan kerentanan, mode kegagalan, output berbahaya, dan masalah bias sebelum penyebaran. Penting untuk AI yang bertanggung jawab.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_048",
        questionEN: "What is the principle of human oversight in AI?",
        questionID: "Apa itu prinsip pengawasan manusia dalam AI?",
        options: [
            QuestionOption(id: "a", textEN: "Humans should monitor, intervene, and override AI decisions when needed", textID: "Manusia harus memantau, mengintervensi, dan mengesampingkan keputusan AI ketika diperlukan"),
            QuestionOption(id: "b", textEN: "AI should oversee humans", textID: "AI harus mengawasi manusia"),
            QuestionOption(id: "c", textEN: "Only humans can use AI", textID: "Hanya manusia yang dapat menggunakan AI"),
            QuestionOption(id: "d", textEN: "Human approval for every AI action", textID: "Persetujuan manusia untuk setiap tindakan AI")
        ],
        correctOptionId: "a",
        explanationEN: "Human oversight means maintaining meaningful human control over AI systems, including ability to monitor, understand, intervene in, and override AI decisions, especially for high-stakes applications.",
        explanationID: "Pengawasan manusia berarti mempertahankan kontrol manusia yang bermakna atas sistem AI, termasuk kemampuan untuk memantau, memahami, mengintervensi, dan mengesampingkan keputusan AI, terutama untuk aplikasi berisiko tinggi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "ethics_049",
        questionEN: "What is AI impact assessment?",
        questionID: "Apa itu penilaian dampak AI?",
        options: [
            QuestionOption(id: "a", textEN: "Systematic evaluation of potential positive and negative effects of AI system", textID: "Evaluasi sistematis tentang potensi efek positif dan negatif dari sistem AI"),
            QuestionOption(id: "b", textEN: "Measuring AI performance impact", textID: "Mengukur dampak performa AI"),
            QuestionOption(id: "c", textEN: "Impact of AI on company profits", textID: "Dampak AI pada keuntungan perusahaan"),
            QuestionOption(id: "d", textEN: "Environmental impact of training", textID: "Dampak lingkungan dari training")
        ],
        correctOptionId: "a",
        explanationEN: "AI impact assessment evaluates potential societal effects including privacy, fairness, safety, and human rights implications before deploying AI systems. Required for high-risk AI in many regulations.",
        explanationID: "Penilaian dampak AI mengevaluasi potensi efek sosial termasuk implikasi privasi, keadilan, keamanan, dan hak asasi manusia sebelum menyebarkan sistem AI. Diperlukan untuk AI berisiko tinggi dalam banyak regulasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "ethics_050",
        questionEN: "What are the key principles of responsible AI?",
        questionID: "Apa prinsip-prinsip utama AI yang bertanggung jawab?",
        options: [
            QuestionOption(id: "a", textEN: "Fairness, transparency, privacy, safety, accountability, and human control", textID: "Keadilan, transparansi, privasi, keamanan, akuntabilitas, dan kontrol manusia"),
            QuestionOption(id: "b", textEN: "Only accuracy and speed", textID: "Hanya akurasi dan kecepatan"),
            QuestionOption(id: "c", textEN: "Profit and efficiency", textID: "Keuntungan dan efisiensi"),
            QuestionOption(id: "d", textEN: "Technical excellence only", textID: "Hanya keunggulan teknis")
        ],
        correctOptionId: "a",
        explanationEN: "Responsible AI principles include: fairness (no discrimination), transparency (explainability), privacy protection, safety (robustness), accountability (clear responsibility), and human oversight.",
        explanationID: "Prinsip AI yang bertanggung jawab meliputi: keadilan (tanpa diskriminasi), transparansi (explainability), perlindungan privasi, keamanan (ketahanan), akuntabilitas (tanggung jawab yang jelas), dan pengawasan manusia.",
        topic: "aiMlDl",
        difficulty: .beginner
    )
]
