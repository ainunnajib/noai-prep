import Foundation

// MARK: - Ensemble Methods Questions (50)
// Topics: Bagging, Boosting, Random Forest, XGBoost, Stacking
// Aligned with IOAI/NOAI Syllabus

let ensembleMethodsQuestions: [Question] = [
    // MARK: - Ensemble Basics (1-10)
    Question(
        id: "ensemble_001",
        questionEN: "What is an ensemble method in machine learning?",
        questionID: "Apa itu metode ensemble dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Combining multiple models to produce better predictions", textID: "Menggabungkan beberapa model untuk menghasilkan prediksi yang lebih baik"),
            QuestionOption(id: "b", textEN: "Training one large model", textID: "Melatih satu model besar"),
            QuestionOption(id: "c", textEN: "Using multiple datasets", textID: "Menggunakan beberapa dataset"),
            QuestionOption(id: "d", textEN: "Training models sequentially without combination", textID: "Melatih model secara berurutan tanpa kombinasi")
        ],
        correctOptionId: "a",
        explanationEN: "Ensemble methods combine predictions from multiple models (base learners) to improve accuracy and robustness, often outperforming individual models.",
        explanationID: "Metode ensemble menggabungkan prediksi dari beberapa model untuk meningkatkan akurasi dan ketahanan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ensemble_002",
        questionEN: "Why do ensemble methods often outperform single models?",
        questionID: "Mengapa metode ensemble sering mengungguli model tunggal?",
        options: [
            QuestionOption(id: "a", textEN: "Different models make different errors that can cancel out", textID: "Model yang berbeda membuat kesalahan berbeda yang dapat saling menghilangkan"),
            QuestionOption(id: "b", textEN: "More models always mean better accuracy", textID: "Lebih banyak model selalu berarti akurasi lebih baik"),
            QuestionOption(id: "c", textEN: "Ensembles use more data", textID: "Ensemble menggunakan lebih banyak data"),
            QuestionOption(id: "d", textEN: "Ensembles are faster to train", textID: "Ensemble lebih cepat dilatih")
        ],
        correctOptionId: "a",
        explanationEN: "Ensemble diversity is key. If models make uncorrelated errors, combining them reduces overall error through the 'wisdom of crowds' effect.",
        explanationID: "Diversitas ensemble adalah kunci. Jika model membuat kesalahan yang tidak berkorelasi, menggabungkannya mengurangi kesalahan keseluruhan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_003",
        questionEN: "What are the main types of ensemble methods?",
        questionID: "Apa saja jenis utama metode ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "Bagging (reduces variance), Boosting (reduces bias), Stacking", textID: "Bagging (mengurangi variansi), Boosting (mengurangi bias), Stacking"),
            QuestionOption(id: "b", textEN: "Fast and slow ensembles", textID: "Ensemble cepat dan lambat"),
            QuestionOption(id: "c", textEN: "Linear and nonlinear ensembles", textID: "Ensemble linear dan nonlinear"),
            QuestionOption(id: "d", textEN: "Deep and shallow ensembles", textID: "Ensemble dalam dan dangkal")
        ],
        correctOptionId: "a",
        explanationEN: "Bagging trains models in parallel on bootstrap samples (reduces variance), Boosting trains sequentially focusing on errors (reduces bias), Stacking uses meta-learning.",
        explanationID: "Bagging melatih model secara paralel pada sampel bootstrap, Boosting melatih secara berurutan fokus pada kesalahan, Stacking menggunakan meta-learning.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_004",
        questionEN: "What is bootstrap sampling?",
        questionID: "Apa itu sampling bootstrap?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling with replacement from the original dataset", textID: "Pengambilan sampel dengan pengembalian dari dataset asli"),
            QuestionOption(id: "b", textEN: "Removing outliers from the dataset", textID: "Menghapus outlier dari dataset"),
            QuestionOption(id: "c", textEN: "Splitting data into train and test sets", textID: "Membagi data menjadi set latih dan uji"),
            QuestionOption(id: "d", textEN: "Normalizing the data", textID: "Menormalisasi data")
        ],
        correctOptionId: "a",
        explanationEN: "Bootstrap sampling draws samples with replacement, so some instances appear multiple times while others are left out (~37% on average). This creates diverse training sets.",
        explanationID: "Sampling bootstrap mengambil sampel dengan pengembalian, sehingga beberapa instance muncul beberapa kali sementara yang lain ditinggalkan (~37%).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_005",
        questionEN: "What percentage of data is typically left out in bootstrap sampling?",
        questionID: "Berapa persen data yang biasanya tidak termasuk dalam sampling bootstrap?",
        options: [
            QuestionOption(id: "a", textEN: "About 37% (Out-of-Bag samples)", textID: "Sekitar 37% (sampel Out-of-Bag)"),
            QuestionOption(id: "b", textEN: "About 50%", textID: "Sekitar 50%"),
            QuestionOption(id: "c", textEN: "About 20%", textID: "Sekitar 20%"),
            QuestionOption(id: "d", textEN: "About 10%", textID: "Sekitar 10%")
        ],
        correctOptionId: "a",
        explanationEN: "Each sample has probability (1-1/n)^n ≈ 1/e ≈ 0.368 of not being selected. These Out-of-Bag samples can be used for validation.",
        explanationID: "Setiap sampel memiliki probabilitas (1-1/n)^n ≈ 1/e ≈ 0.368 untuk tidak terpilih. Sampel OOB ini dapat digunakan untuk validasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_006",
        questionEN: "How does bagging reduce variance?",
        questionID: "Bagaimana bagging mengurangi variansi?",
        options: [
            QuestionOption(id: "a", textEN: "By averaging predictions from models trained on different bootstrap samples", textID: "Dengan merata-ratakan prediksi dari model yang dilatih pada sampel bootstrap berbeda"),
            QuestionOption(id: "b", textEN: "By using simpler models", textID: "Dengan menggunakan model yang lebih sederhana"),
            QuestionOption(id: "c", textEN: "By removing features", textID: "Dengan menghapus fitur"),
            QuestionOption(id: "d", textEN: "By increasing training time", textID: "Dengan meningkatkan waktu pelatihan")
        ],
        correctOptionId: "a",
        explanationEN: "Averaging independent predictions reduces variance by factor of 1/n. For n models with variance σ², the ensemble variance is σ²/n (assuming independence).",
        explanationID: "Merata-ratakan prediksi independen mengurangi variansi dengan faktor 1/n. Untuk n model dengan variansi σ², variansi ensemble adalah σ²/n.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_007",
        questionEN: "What is the key difference between bagging and boosting?",
        questionID: "Apa perbedaan utama antara bagging dan boosting?",
        options: [
            QuestionOption(id: "a", textEN: "Bagging trains models in parallel; boosting trains sequentially focusing on errors", textID: "Bagging melatih model secara paralel; boosting melatih secara berurutan fokus pada kesalahan"),
            QuestionOption(id: "b", textEN: "Bagging uses decision trees; boosting uses neural networks", textID: "Bagging menggunakan decision tree; boosting menggunakan neural network"),
            QuestionOption(id: "c", textEN: "Bagging is faster than boosting", textID: "Bagging lebih cepat dari boosting"),
            QuestionOption(id: "d", textEN: "Bagging works only for classification", textID: "Bagging hanya untuk klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Bagging trains models independently on bootstrap samples (parallel, reduces variance). Boosting trains sequentially, each model correcting previous errors (reduces bias).",
        explanationID: "Bagging melatih model secara independen pada sampel bootstrap (paralel, mengurangi variansi). Boosting melatih secara berurutan, setiap model memperbaiki kesalahan sebelumnya (mengurangi bias).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_008",
        questionEN: "What is voting in ensemble methods?",
        questionID: "Apa itu voting dalam metode ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "Combining predictions by majority vote (hard) or averaging probabilities (soft)", textID: "Menggabungkan prediksi dengan suara mayoritas (hard) atau rata-rata probabilitas (soft)"),
            QuestionOption(id: "b", textEN: "Selecting the best model", textID: "Memilih model terbaik"),
            QuestionOption(id: "c", textEN: "Training models to vote on features", textID: "Melatih model untuk voting pada fitur"),
            QuestionOption(id: "d", textEN: "Removing underperforming models", textID: "Menghapus model berkinerja buruk")
        ],
        correctOptionId: "a",
        explanationEN: "Hard voting takes the majority class prediction. Soft voting averages class probabilities, often performing better when models provide calibrated probabilities.",
        explanationID: "Hard voting mengambil prediksi kelas mayoritas. Soft voting merata-ratakan probabilitas kelas, sering lebih baik saat model memberikan probabilitas terkalibrasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ensemble_009",
        questionEN: "When is soft voting preferred over hard voting?",
        questionID: "Kapan soft voting lebih disukai daripada hard voting?",
        options: [
            QuestionOption(id: "a", textEN: "When models provide well-calibrated probability estimates", textID: "Ketika model memberikan estimasi probabilitas yang terkalibrasi dengan baik"),
            QuestionOption(id: "b", textEN: "When models are very fast", textID: "Ketika model sangat cepat"),
            QuestionOption(id: "c", textEN: "When there are few classes", textID: "Ketika ada sedikit kelas"),
            QuestionOption(id: "d", textEN: "When training data is small", textID: "Ketika data latih kecil")
        ],
        correctOptionId: "a",
        explanationEN: "Soft voting uses probability information, which is more informative than discrete predictions. It works best when model probabilities are well-calibrated.",
        explanationID: "Soft voting menggunakan informasi probabilitas, yang lebih informatif dari prediksi diskrit. Bekerja terbaik saat probabilitas model terkalibrasi dengan baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_010",
        questionEN: "What is the bias-variance decomposition of ensemble error?",
        questionID: "Apa dekomposisi bias-variansi dari error ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "Error = Bias² + Variance + Irreducible noise", textID: "Error = Bias² + Variansi + Noise tidak dapat direduksi"),
            QuestionOption(id: "b", textEN: "Error = Bias + Variance", textID: "Error = Bias + Variansi"),
            QuestionOption(id: "c", textEN: "Error = Bias × Variance", textID: "Error = Bias × Variansi"),
            QuestionOption(id: "d", textEN: "Error = Bias / Variance", textID: "Error = Bias / Variansi")
        ],
        correctOptionId: "a",
        explanationEN: "Total error decomposes into squared bias (systematic error), variance (sensitivity to training data), and irreducible noise. Ensembles typically reduce variance.",
        explanationID: "Total error terdekomposisi menjadi bias kuadrat (error sistematis), variansi (sensitivitas terhadap data latih), dan noise tidak dapat direduksi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Random Forest (11-20)
    Question(
        id: "ensemble_011",
        questionEN: "What is Random Forest?",
        questionID: "Apa itu Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "Bagging with decision trees plus random feature selection at each split", textID: "Bagging dengan decision tree ditambah seleksi fitur acak di setiap split"),
            QuestionOption(id: "b", textEN: "A single deep decision tree", textID: "Satu decision tree yang dalam"),
            QuestionOption(id: "c", textEN: "Boosting with trees", textID: "Boosting dengan tree"),
            QuestionOption(id: "d", textEN: "K-means with trees", textID: "K-means dengan tree")
        ],
        correctOptionId: "a",
        explanationEN: "Random Forest combines bagging (bootstrap samples) with random feature subsets at each split, creating diverse, decorrelated trees that reduce variance when averaged.",
        explanationID: "Random Forest menggabungkan bagging (sampel bootstrap) dengan subset fitur acak di setiap split, menciptakan tree yang beragam dan tidak berkorelasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ensemble_012",
        questionEN: "How many features are typically considered at each split in Random Forest for classification?",
        questionID: "Berapa fitur yang biasanya dipertimbangkan di setiap split dalam Random Forest untuk klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "√p where p is total features", textID: "√p dimana p adalah total fitur"),
            QuestionOption(id: "b", textEN: "All features", textID: "Semua fitur"),
            QuestionOption(id: "c", textEN: "Half of features", textID: "Setengah dari fitur"),
            QuestionOption(id: "d", textEN: "One feature only", textID: "Hanya satu fitur")
        ],
        correctOptionId: "a",
        explanationEN: "The default for classification is √p features per split. For regression, it's p/3. This creates diversity among trees while maintaining predictive power.",
        explanationID: "Default untuk klasifikasi adalah √p fitur per split. Untuk regresi, p/3. Ini menciptakan keragaman antar tree sambil mempertahankan kekuatan prediktif.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_013",
        questionEN: "What is feature importance in Random Forest?",
        questionID: "Apa itu feature importance dalam Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "Measure of how much each feature contributes to predictions (e.g., via impurity decrease)", textID: "Ukuran seberapa besar kontribusi setiap fitur pada prediksi (misal: via penurunan impurity)"),
            QuestionOption(id: "b", textEN: "The number of times a feature appears", textID: "Jumlah kemunculan fitur"),
            QuestionOption(id: "c", textEN: "The correlation of features", textID: "Korelasi fitur"),
            QuestionOption(id: "d", textEN: "The size of features", textID: "Ukuran fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Feature importance can be measured by: (1) Mean decrease in impurity (Gini importance), or (2) Permutation importance (accuracy drop when feature is shuffled).",
        explanationID: "Feature importance dapat diukur dengan: (1) Penurunan rata-rata impurity (Gini importance), atau (2) Permutation importance (penurunan akurasi saat fitur diacak).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_014",
        questionEN: "Why does Random Forest rarely overfit with more trees?",
        questionID: "Mengapa Random Forest jarang overfit dengan lebih banyak tree?",
        options: [
            QuestionOption(id: "a", textEN: "More trees reduce variance without increasing bias; error plateaus", textID: "Lebih banyak tree mengurangi variansi tanpa meningkatkan bias; error mencapai plateau"),
            QuestionOption(id: "b", textEN: "Trees become simpler with more trees", textID: "Tree menjadi lebih sederhana dengan lebih banyak tree"),
            QuestionOption(id: "c", textEN: "Random Forest uses regularization", textID: "Random Forest menggunakan regularisasi"),
            QuestionOption(id: "d", textEN: "Trees cancel each other out", textID: "Tree saling menghilangkan")
        ],
        correctOptionId: "a",
        explanationEN: "Adding more trees only reduces variance (averaging more predictions). Unlike boosting, it doesn't increase model complexity, so error converges to a stable value.",
        explanationID: "Menambah lebih banyak tree hanya mengurangi variansi (merata-ratakan lebih banyak prediksi). Berbeda dengan boosting, tidak meningkatkan kompleksitas model.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_015",
        questionEN: "What is Out-of-Bag (OOB) error in Random Forest?",
        questionID: "Apa itu error Out-of-Bag (OOB) dalam Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "Error estimated using samples not in the bootstrap sample for each tree", textID: "Error yang diestimasi menggunakan sampel yang tidak ada dalam sampel bootstrap untuk setiap tree"),
            QuestionOption(id: "b", textEN: "Error on the test set", textID: "Error pada test set"),
            QuestionOption(id: "c", textEN: "Training error", textID: "Training error"),
            QuestionOption(id: "d", textEN: "Cross-validation error", textID: "Error cross-validation")
        ],
        correctOptionId: "a",
        explanationEN: "OOB error uses the ~37% samples left out during bootstrap. Each sample is predicted by trees that didn't train on it, providing free validation without a separate set.",
        explanationID: "OOB error menggunakan ~37% sampel yang tidak termasuk selama bootstrap. Setiap sampel diprediksi oleh tree yang tidak melatihnya, memberikan validasi gratis.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_016",
        questionEN: "How does Random Forest handle missing values?",
        questionID: "Bagaimana Random Forest menangani nilai yang hilang?",
        options: [
            QuestionOption(id: "a", textEN: "Using surrogate splits or proximity-based imputation", textID: "Menggunakan split pengganti atau imputasi berbasis proximity"),
            QuestionOption(id: "b", textEN: "Deleting rows with missing values", textID: "Menghapus baris dengan nilai hilang"),
            QuestionOption(id: "c", textEN: "Replacing with zeros", textID: "Mengganti dengan nol"),
            QuestionOption(id: "d", textEN: "Cannot handle missing values", textID: "Tidak dapat menangani nilai hilang")
        ],
        correctOptionId: "a",
        explanationEN: "RF can use surrogate splits (alternative features with similar splits) or proximity-based imputation using the trained forest to fill missing values.",
        explanationID: "RF dapat menggunakan split pengganti (fitur alternatif dengan split serupa) atau imputasi berbasis proximity menggunakan forest terlatih untuk mengisi nilai hilang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_017",
        questionEN: "What is the computational complexity of training Random Forest?",
        questionID: "Apa kompleksitas komputasi melatih Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "O(n × m × log(n) × T) where T is number of trees", textID: "O(n × m × log(n) × T) dimana T adalah jumlah tree"),
            QuestionOption(id: "b", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "c", textEN: "O(n × m)", textID: "O(n × m)"),
            QuestionOption(id: "d", textEN: "O(T)", textID: "O(T)")
        ],
        correctOptionId: "a",
        explanationEN: "Each tree: O(n × m × log(n)) for n samples, m features considered per split. With T trees and parallelization, training is efficient.",
        explanationID: "Setiap tree: O(n × m × log(n)) untuk n sampel, m fitur yang dipertimbangkan per split. Dengan T tree dan paralelisasi, training efisien.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_018",
        questionEN: "What is the main hyperparameter to tune in Random Forest?",
        questionID: "Apa hyperparameter utama yang perlu di-tune dalam Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "max_features (features per split) and max_depth", textID: "max_features (fitur per split) dan max_depth"),
            QuestionOption(id: "b", textEN: "Only learning rate", textID: "Hanya learning rate"),
            QuestionOption(id: "c", textEN: "Only number of trees", textID: "Hanya jumlah tree"),
            QuestionOption(id: "d", textEN: "Kernel type", textID: "Jenis kernel")
        ],
        correctOptionId: "a",
        explanationEN: "max_features controls tree correlation (lower = more diverse trees). max_depth controls individual tree complexity. n_estimators matters less (more is generally better).",
        explanationID: "max_features mengontrol korelasi tree (lebih rendah = tree lebih beragam). max_depth mengontrol kompleksitas tree individual.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_019",
        questionEN: "What is Extra Trees (Extremely Randomized Trees)?",
        questionID: "Apa itu Extra Trees (Extremely Randomized Trees)?",
        options: [
            QuestionOption(id: "a", textEN: "Like Random Forest but with random split thresholds (not optimal splits)", textID: "Seperti Random Forest tapi dengan threshold split acak (bukan split optimal)"),
            QuestionOption(id: "b", textEN: "Random Forest with more trees", textID: "Random Forest dengan lebih banyak tree"),
            QuestionOption(id: "c", textEN: "Random Forest with extra features", textID: "Random Forest dengan fitur tambahan"),
            QuestionOption(id: "d", textEN: "Random Forest with deeper trees", textID: "Random Forest dengan tree lebih dalam")
        ],
        correctOptionId: "a",
        explanationEN: "Extra Trees uses random split thresholds instead of finding optimal splits, making it faster and sometimes more robust, with higher bias but lower variance.",
        explanationID: "Extra Trees menggunakan threshold split acak alih-alih mencari split optimal, membuatnya lebih cepat dan kadang lebih robust.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_020",
        questionEN: "When might Random Forest underperform compared to gradient boosting?",
        questionID: "Kapan Random Forest mungkin berkinerja lebih buruk dibanding gradient boosting?",
        options: [
            QuestionOption(id: "a", textEN: "When data has complex patterns requiring sequential error correction", textID: "Ketika data memiliki pola kompleks yang memerlukan koreksi error berurutan"),
            QuestionOption(id: "b", textEN: "When data is very large", textID: "Ketika data sangat besar"),
            QuestionOption(id: "c", textEN: "When there are many features", textID: "Ketika ada banyak fitur"),
            QuestionOption(id: "d", textEN: "When speed is important", textID: "Ketika kecepatan penting")
        ],
        correctOptionId: "a",
        explanationEN: "RF reduces variance but not bias. For complex patterns where bias matters, boosting's sequential error correction often achieves better accuracy.",
        explanationID: "RF mengurangi variansi tapi bukan bias. Untuk pola kompleks dimana bias penting, koreksi error berurutan boosting sering mencapai akurasi lebih baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Boosting Methods (21-35)
    Question(
        id: "ensemble_021",
        questionEN: "What is the core idea of boosting?",
        questionID: "Apa ide inti dari boosting?",
        options: [
            QuestionOption(id: "a", textEN: "Train weak learners sequentially, each focusing on previous errors", textID: "Melatih weak learner secara berurutan, masing-masing fokus pada kesalahan sebelumnya"),
            QuestionOption(id: "b", textEN: "Train strong learners in parallel", textID: "Melatih strong learner secara paralel"),
            QuestionOption(id: "c", textEN: "Use one very complex model", textID: "Menggunakan satu model sangat kompleks"),
            QuestionOption(id: "d", textEN: "Average many random predictions", textID: "Merata-ratakan banyak prediksi acak")
        ],
        correctOptionId: "a",
        explanationEN: "Boosting builds an ensemble sequentially. Each new model focuses on the mistakes of the combined ensemble so far, reducing bias over iterations.",
        explanationID: "Boosting membangun ensemble secara berurutan. Setiap model baru fokus pada kesalahan ensemble gabungan sejauh ini, mengurangi bias selama iterasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ensemble_022",
        questionEN: "What is AdaBoost (Adaptive Boosting)?",
        questionID: "Apa itu AdaBoost (Adaptive Boosting)?",
        options: [
            QuestionOption(id: "a", textEN: "Boosting that reweights samples based on classification errors", textID: "Boosting yang memberi bobot ulang sampel berdasarkan kesalahan klasifikasi"),
            QuestionOption(id: "b", textEN: "Boosting with adaptive learning rate", textID: "Boosting dengan learning rate adaptif"),
            QuestionOption(id: "c", textEN: "Boosting with neural networks", textID: "Boosting dengan neural network"),
            QuestionOption(id: "d", textEN: "Boosting with random features", textID: "Boosting dengan fitur acak")
        ],
        correctOptionId: "a",
        explanationEN: "AdaBoost increases weights on misclassified samples after each iteration, forcing the next weak learner to focus on hard examples. Models are weighted by accuracy.",
        explanationID: "AdaBoost meningkatkan bobot pada sampel yang salah klasifikasi setelah setiap iterasi, memaksa weak learner berikutnya fokus pada contoh sulit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_023",
        questionEN: "What is Gradient Boosting?",
        questionID: "Apa itu Gradient Boosting?",
        options: [
            QuestionOption(id: "a", textEN: "Boosting that fits new models to the gradient (residuals) of the loss function", textID: "Boosting yang memfit model baru ke gradien (residual) dari fungsi loss"),
            QuestionOption(id: "b", textEN: "Boosting with gradient descent optimizer", textID: "Boosting dengan optimizer gradient descent"),
            QuestionOption(id: "c", textEN: "AdaBoost with gradients", textID: "AdaBoost dengan gradien"),
            QuestionOption(id: "d", textEN: "Neural network boosting", textID: "Boosting neural network")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient Boosting fits each new tree to the negative gradient of the loss function, effectively performing gradient descent in function space to minimize loss.",
        explanationID: "Gradient Boosting memfit setiap tree baru ke gradien negatif dari fungsi loss, secara efektif melakukan gradient descent dalam ruang fungsi untuk meminimalkan loss.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_024",
        questionEN: "What is XGBoost?",
        questionID: "Apa itu XGBoost?",
        options: [
            QuestionOption(id: "a", textEN: "Optimized gradient boosting with regularization and efficient implementation", textID: "Gradient boosting yang dioptimasi dengan regularisasi dan implementasi efisien"),
            QuestionOption(id: "b", textEN: "Extra gradient boosting", textID: "Extra gradient boosting"),
            QuestionOption(id: "c", textEN: "A neural network framework", textID: "Framework neural network"),
            QuestionOption(id: "d", textEN: "Random forest variant", textID: "Varian random forest")
        ],
        correctOptionId: "a",
        explanationEN: "XGBoost (eXtreme Gradient Boosting) adds L1/L2 regularization to the objective, uses second-order gradients (Newton method), and has efficient parallelized implementation.",
        explanationID: "XGBoost menambahkan regularisasi L1/L2 ke objektif, menggunakan gradien orde kedua (metode Newton), dan memiliki implementasi paralel yang efisien.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_025",
        questionEN: "What is the learning rate (shrinkage) in gradient boosting?",
        questionID: "Apa itu learning rate (shrinkage) dalam gradient boosting?",
        options: [
            QuestionOption(id: "a", textEN: "A factor (0-1) that scales each tree's contribution, preventing overfitting", textID: "Faktor (0-1) yang menskala kontribusi setiap tree, mencegah overfitting"),
            QuestionOption(id: "b", textEN: "The speed of training", textID: "Kecepatan training"),
            QuestionOption(id: "c", textEN: "The number of iterations", textID: "Jumlah iterasi"),
            QuestionOption(id: "d", textEN: "The depth of trees", textID: "Kedalaman tree")
        ],
        correctOptionId: "a",
        explanationEN: "Learning rate η scales each tree's contribution: F(x) += η × h(x). Lower values (0.01-0.1) need more trees but often generalize better by taking smaller steps.",
        explanationID: "Learning rate η menskala kontribusi setiap tree: F(x) += η × h(x). Nilai lebih rendah (0.01-0.1) butuh lebih banyak tree tapi sering generalisasi lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_026",
        questionEN: "What is LightGBM's key innovation?",
        questionID: "Apa inovasi kunci LightGBM?",
        options: [
            QuestionOption(id: "a", textEN: "Gradient-based One-Side Sampling (GOSS) and Exclusive Feature Bundling (EFB)", textID: "Gradient-based One-Side Sampling (GOSS) dan Exclusive Feature Bundling (EFB)"),
            QuestionOption(id: "b", textEN: "Deeper trees", textID: "Tree lebih dalam"),
            QuestionOption(id: "c", textEN: "More regularization", textID: "Lebih banyak regularisasi"),
            QuestionOption(id: "d", textEN: "Neural network integration", textID: "Integrasi neural network")
        ],
        correctOptionId: "a",
        explanationEN: "LightGBM uses GOSS (keeps high-gradient samples, randomly samples low-gradient) and EFB (bundles sparse features) for faster training with similar accuracy.",
        explanationID: "LightGBM menggunakan GOSS (menyimpan sampel gradien tinggi, sampling acak gradien rendah) dan EFB (menggabungkan fitur sparse) untuk training lebih cepat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_027",
        questionEN: "What is CatBoost's main feature?",
        questionID: "Apa fitur utama CatBoost?",
        options: [
            QuestionOption(id: "a", textEN: "Efficient handling of categorical features with ordered target statistics", textID: "Penanganan efisien fitur kategoris dengan statistik target terurut"),
            QuestionOption(id: "b", textEN: "Faster than all other boosting methods", textID: "Lebih cepat dari semua metode boosting lain"),
            QuestionOption(id: "c", textEN: "Built-in neural networks", textID: "Neural network bawaan"),
            QuestionOption(id: "d", textEN: "Automatic hyperparameter tuning", textID: "Tuning hyperparameter otomatis")
        ],
        correctOptionId: "a",
        explanationEN: "CatBoost handles categorical features natively using ordered target statistics (prevents target leakage) and uses ordered boosting to reduce prediction shift.",
        explanationID: "CatBoost menangani fitur kategoris secara native menggunakan statistik target terurut (mencegah target leakage) dan menggunakan ordered boosting.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_028",
        questionEN: "Why might gradient boosting overfit more easily than Random Forest?",
        questionID: "Mengapa gradient boosting mungkin lebih mudah overfit dibanding Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "It keeps adding complexity by fitting residuals, can memorize noise", textID: "Terus menambah kompleksitas dengan memfit residual, dapat menghafalkan noise"),
            QuestionOption(id: "b", textEN: "It uses deeper trees", textID: "Menggunakan tree lebih dalam"),
            QuestionOption(id: "c", textEN: "It trains for longer", textID: "Melatih lebih lama"),
            QuestionOption(id: "d", textEN: "It uses more features", textID: "Menggunakan lebih banyak fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Boosting reduces bias by iteratively fitting residuals. With too many iterations, it can fit noise. RF just averages trees, so more trees don't increase complexity.",
        explanationID: "Boosting mengurangi bias dengan memfit residual secara iteratif. Dengan terlalu banyak iterasi, dapat memfit noise. RF hanya merata-ratakan tree.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_029",
        questionEN: "What is early stopping in gradient boosting?",
        questionID: "Apa itu early stopping dalam gradient boosting?",
        options: [
            QuestionOption(id: "a", textEN: "Stop training when validation error stops improving to prevent overfitting", textID: "Berhenti melatih ketika error validasi berhenti membaik untuk mencegah overfitting"),
            QuestionOption(id: "b", textEN: "Training with fewer trees from the start", textID: "Training dengan lebih sedikit tree dari awal"),
            QuestionOption(id: "c", textEN: "Stopping when training error reaches zero", textID: "Berhenti ketika training error mencapai nol"),
            QuestionOption(id: "d", textEN: "Using faster algorithms", textID: "Menggunakan algoritma lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Early stopping monitors validation loss and stops when it hasn't improved for n rounds. This prevents overfitting and serves as implicit regularization.",
        explanationID: "Early stopping memantau loss validasi dan berhenti ketika tidak membaik selama n iterasi. Ini mencegah overfitting dan berfungsi sebagai regularisasi implisit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_030",
        questionEN: "What is subsampling (stochastic gradient boosting)?",
        questionID: "Apa itu subsampling (stochastic gradient boosting)?",
        options: [
            QuestionOption(id: "a", textEN: "Training each tree on a random subset of data (like bagging within boosting)", textID: "Melatih setiap tree pada subset acak data (seperti bagging dalam boosting)"),
            QuestionOption(id: "b", textEN: "Using smaller trees", textID: "Menggunakan tree lebih kecil"),
            QuestionOption(id: "c", textEN: "Reducing the learning rate", textID: "Mengurangi learning rate"),
            QuestionOption(id: "d", textEN: "Removing outliers", textID: "Menghapus outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Subsampling uses a random fraction (e.g., 0.8) of training data for each tree, adding randomness that reduces variance and speeds up training.",
        explanationID: "Subsampling menggunakan fraksi acak (misal 0.8) dari data latih untuk setiap tree, menambah keacakan yang mengurangi variansi dan mempercepat training.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_031",
        questionEN: "What is the objective function in XGBoost?",
        questionID: "Apa fungsi objektif dalam XGBoost?",
        options: [
            QuestionOption(id: "a", textEN: "Loss + γT + ½λΣw² (loss + tree complexity regularization)", textID: "Loss + γT + ½λΣw² (loss + regularisasi kompleksitas tree)"),
            QuestionOption(id: "b", textEN: "Only the loss function", textID: "Hanya fungsi loss"),
            QuestionOption(id: "c", textEN: "MSE only", textID: "Hanya MSE"),
            QuestionOption(id: "d", textEN: "Accuracy score", textID: "Skor akurasi")
        ],
        correctOptionId: "a",
        explanationEN: "XGBoost objective = Σl(yᵢ, ŷᵢ) + Σ[γT + ½λ||w||²] where T is number of leaves and w are leaf weights. This regularization prevents overfitting.",
        explanationID: "Objektif XGBoost = Σl(yᵢ, ŷᵢ) + Σ[γT + ½λ||w||²] dimana T adalah jumlah daun dan w adalah bobot daun. Regularisasi ini mencegah overfitting.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_032",
        questionEN: "Why does XGBoost use second-order derivatives?",
        questionID: "Mengapa XGBoost menggunakan turunan orde kedua?",
        options: [
            QuestionOption(id: "a", textEN: "Newton's method converges faster than gradient descent (first-order)", textID: "Metode Newton konvergen lebih cepat dari gradient descent (orde pertama)"),
            QuestionOption(id: "b", textEN: "To compute feature importance", textID: "Untuk menghitung feature importance"),
            QuestionOption(id: "c", textEN: "For faster splitting", textID: "Untuk splitting lebih cepat"),
            QuestionOption(id: "d", textEN: "To handle missing values", textID: "Untuk menangani nilai hilang")
        ],
        correctOptionId: "a",
        explanationEN: "XGBoost uses both gradient (g) and Hessian (h) for a second-order Taylor expansion of loss. Newton's method uses curvature information for faster, better convergence.",
        explanationID: "XGBoost menggunakan gradien (g) dan Hessian (h) untuk ekspansi Taylor orde kedua dari loss. Metode Newton menggunakan informasi kelengkungan untuk konvergensi lebih cepat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_033",
        questionEN: "What is histogram-based gradient boosting?",
        questionID: "Apa itu histogram-based gradient boosting?",
        options: [
            QuestionOption(id: "a", textEN: "Binning continuous features into discrete bins to speed up split finding", textID: "Membuat bin fitur kontinu menjadi bin diskrit untuk mempercepat pencarian split"),
            QuestionOption(id: "b", textEN: "Visualizing the boosting process", textID: "Memvisualisasikan proses boosting"),
            QuestionOption(id: "c", textEN: "Using histogram features", textID: "Menggunakan fitur histogram"),
            QuestionOption(id: "d", textEN: "Plotting learning curves", textID: "Memplot kurva pembelajaran")
        ],
        correctOptionId: "a",
        explanationEN: "LightGBM and HistGradientBoosting bin features into 256 discrete values, making split finding O(bins) instead of O(n), dramatically faster for large datasets.",
        explanationID: "LightGBM dan HistGradientBoosting membuat bin fitur menjadi 256 nilai diskrit, membuat pencarian split O(bins) bukan O(n), jauh lebih cepat untuk dataset besar.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_034",
        questionEN: "What tree depth is typically used in gradient boosting vs Random Forest?",
        questionID: "Kedalaman tree apa yang biasanya digunakan dalam gradient boosting vs Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "Shallow trees (3-8) for boosting; full-depth trees for RF", textID: "Tree dangkal (3-8) untuk boosting; tree kedalaman penuh untuk RF"),
            QuestionOption(id: "b", textEN: "Same depth for both", textID: "Kedalaman sama untuk keduanya"),
            QuestionOption(id: "c", textEN: "Deep trees for boosting; shallow for RF", textID: "Tree dalam untuk boosting; dangkal untuk RF"),
            QuestionOption(id: "d", textEN: "One level trees for both", textID: "Tree satu level untuk keduanya")
        ],
        correctOptionId: "a",
        explanationEN: "Boosting uses shallow trees (weak learners) that are improved iteratively. RF uses full-depth trees for individual accuracy, relying on averaging for variance reduction.",
        explanationID: "Boosting menggunakan tree dangkal (weak learner) yang diperbaiki secara iteratif. RF menggunakan tree kedalaman penuh untuk akurasi individual.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_035",
        questionEN: "What is the effect of max_depth in XGBoost?",
        questionID: "Apa efek max_depth dalam XGBoost?",
        options: [
            QuestionOption(id: "a", textEN: "Controls tree complexity; higher values can lead to overfitting", textID: "Mengontrol kompleksitas tree; nilai lebih tinggi dapat menyebabkan overfitting"),
            QuestionOption(id: "b", textEN: "Controls number of trees", textID: "Mengontrol jumlah tree"),
            QuestionOption(id: "c", textEN: "Controls learning rate", textID: "Mengontrol learning rate"),
            QuestionOption(id: "d", textEN: "Controls training speed only", textID: "Hanya mengontrol kecepatan training")
        ],
        correctOptionId: "a",
        explanationEN: "max_depth limits tree depth. Deeper trees can capture complex interactions but may overfit. Typical values: 3-10. Use with learning_rate and n_estimators.",
        explanationID: "max_depth membatasi kedalaman tree. Tree lebih dalam dapat menangkap interaksi kompleks tapi mungkin overfit. Nilai tipikal: 3-10.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Stacking & Advanced (36-50)
    Question(
        id: "ensemble_036",
        questionEN: "What is stacking (stacked generalization)?",
        questionID: "Apa itu stacking (stacked generalization)?",
        options: [
            QuestionOption(id: "a", textEN: "Training a meta-model on base model predictions", textID: "Melatih meta-model pada prediksi model dasar"),
            QuestionOption(id: "b", textEN: "Stacking multiple datasets", textID: "Menumpuk beberapa dataset"),
            QuestionOption(id: "c", textEN: "Training models in sequence", textID: "Melatih model secara berurutan"),
            QuestionOption(id: "d", textEN: "Averaging model weights", textID: "Merata-ratakan bobot model")
        ],
        correctOptionId: "a",
        explanationEN: "Stacking uses base models' predictions as features for a meta-learner. Base models (level-0) make predictions; meta-model (level-1) learns to combine them optimally.",
        explanationID: "Stacking menggunakan prediksi model dasar sebagai fitur untuk meta-learner. Model dasar (level-0) membuat prediksi; meta-model (level-1) belajar menggabungkannya secara optimal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_037",
        questionEN: "Why use cross-validation in stacking?",
        questionID: "Mengapa menggunakan cross-validation dalam stacking?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent information leakage when generating meta-features", textID: "Untuk mencegah kebocoran informasi saat menghasilkan meta-fitur"),
            QuestionOption(id: "b", textEN: "To speed up training", textID: "Untuk mempercepat training"),
            QuestionOption(id: "c", textEN: "To reduce the number of base models", textID: "Untuk mengurangi jumlah model dasar"),
            QuestionOption(id: "d", textEN: "To select features", textID: "Untuk memilih fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Using K-fold CV, each sample's meta-feature comes from a model that didn't train on it. This prevents overfitting to base model predictions.",
        explanationID: "Menggunakan K-fold CV, meta-fitur setiap sampel berasal dari model yang tidak melatihnya. Ini mencegah overfitting pada prediksi model dasar.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_038",
        questionEN: "What is blending vs stacking?",
        questionID: "Apa perbedaan blending vs stacking?",
        options: [
            QuestionOption(id: "a", textEN: "Blending uses a holdout set for meta-features; stacking uses cross-validation", textID: "Blending menggunakan holdout set untuk meta-fitur; stacking menggunakan cross-validation"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Blending is for classification only", textID: "Blending hanya untuk klasifikasi"),
            QuestionOption(id: "d", textEN: "Blending uses more models", textID: "Blending menggunakan lebih banyak model")
        ],
        correctOptionId: "a",
        explanationEN: "Blending is simpler: split data, train base models on one part, generate meta-features on holdout. Stacking uses K-fold CV for all data. Stacking uses data more efficiently.",
        explanationID: "Blending lebih sederhana: bagi data, latih model dasar pada satu bagian, hasilkan meta-fitur pada holdout. Stacking menggunakan K-fold CV untuk semua data.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_039",
        questionEN: "What makes a good set of base models for stacking?",
        questionID: "Apa yang membuat set model dasar yang baik untuk stacking?",
        options: [
            QuestionOption(id: "a", textEN: "Diverse models that make different types of errors", textID: "Model yang beragam yang membuat jenis kesalahan berbeda"),
            QuestionOption(id: "b", textEN: "All the same type of model", textID: "Semua jenis model yang sama"),
            QuestionOption(id: "c", textEN: "Only the best performing models", textID: "Hanya model dengan performa terbaik"),
            QuestionOption(id: "d", textEN: "Only fast models", textID: "Hanya model cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Diversity is key. Models with different inductive biases (trees, linear, neural) make uncorrelated errors that the meta-learner can exploit.",
        explanationID: "Keragaman adalah kunci. Model dengan inductive bias berbeda (tree, linear, neural) membuat kesalahan tidak berkorelasi yang dapat dieksploitasi meta-learner.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_040",
        questionEN: "What is a common meta-learner for stacking?",
        questionID: "Apa meta-learner umum untuk stacking?",
        options: [
            QuestionOption(id: "a", textEN: "Logistic/Linear Regression (simple, prevents overfitting)", textID: "Regresi Logistik/Linear (sederhana, mencegah overfitting)"),
            QuestionOption(id: "b", textEN: "Deep neural network", textID: "Deep neural network"),
            QuestionOption(id: "c", textEN: "Complex ensemble", textID: "Ensemble kompleks"),
            QuestionOption(id: "d", textEN: "SVM with RBF kernel", textID: "SVM dengan kernel RBF")
        ],
        correctOptionId: "a",
        explanationEN: "Simple meta-learners like logistic regression prevent overfitting on the small meta-feature space. The base models provide complexity; meta-learner just combines.",
        explanationID: "Meta-learner sederhana seperti regresi logistik mencegah overfitting pada ruang meta-fitur yang kecil. Model dasar menyediakan kompleksitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_041",
        questionEN: "What is model averaging?",
        questionID: "Apa itu model averaging?",
        options: [
            QuestionOption(id: "a", textEN: "Combining predictions by taking their mean (possibly weighted)", textID: "Menggabungkan prediksi dengan mengambil rata-ratanya (mungkin tertimbang)"),
            QuestionOption(id: "b", textEN: "Averaging model weights", textID: "Merata-ratakan bobot model"),
            QuestionOption(id: "c", textEN: "Training on averaged data", textID: "Training pada data rata-rata"),
            QuestionOption(id: "d", textEN: "Selecting the average model", textID: "Memilih model rata-rata")
        ],
        correctOptionId: "a",
        explanationEN: "Simple averaging: ŷ = (1/n)Σŷᵢ. Weighted averaging: ŷ = Σwᵢŷᵢ where weights can be based on CV performance. Simple but effective.",
        explanationID: "Rata-rata sederhana: ŷ = (1/n)Σŷᵢ. Rata-rata tertimbang: ŷ = Σwᵢŷᵢ dimana bobot dapat berdasarkan performa CV. Sederhana tapi efektif.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ensemble_042",
        questionEN: "What is snapshot ensemble?",
        questionID: "Apa itu snapshot ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "Saving model checkpoints during training with cyclic learning rate", textID: "Menyimpan checkpoint model selama training dengan learning rate siklis"),
            QuestionOption(id: "b", textEN: "Taking pictures of the model", textID: "Mengambil gambar model"),
            QuestionOption(id: "c", textEN: "Training very quickly", textID: "Training sangat cepat"),
            QuestionOption(id: "d", textEN: "Ensemble of small models", textID: "Ensemble model kecil")
        ],
        correctOptionId: "a",
        explanationEN: "Snapshot ensemble uses cyclic learning rates to converge to different local minima. Checkpoints at each cycle form an ensemble, giving diversity at low cost.",
        explanationID: "Snapshot ensemble menggunakan learning rate siklis untuk konvergen ke local minima berbeda. Checkpoint di setiap siklus membentuk ensemble.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_043",
        questionEN: "What is dropout as an implicit ensemble?",
        questionID: "Apa itu dropout sebagai ensemble implisit?",
        options: [
            QuestionOption(id: "a", textEN: "Each forward pass trains a different subnetwork; inference averages them", textID: "Setiap forward pass melatih subnetwork berbeda; inferensi merata-ratakannya"),
            QuestionOption(id: "b", textEN: "Dropping entire networks", textID: "Menghapus seluruh network"),
            QuestionOption(id: "c", textEN: "Training multiple networks separately", textID: "Melatih beberapa network terpisah"),
            QuestionOption(id: "d", textEN: "Removing bad features", textID: "Menghapus fitur buruk")
        ],
        correctOptionId: "a",
        explanationEN: "Dropout randomly zeros neurons, creating 2^n possible subnetworks. At inference, using all neurons with scaled weights approximates averaging all subnetworks.",
        explanationID: "Dropout secara acak membuat neuron bernilai nol, menciptakan 2^n subnetwork yang mungkin. Saat inferensi, menggunakan semua neuron dengan bobot terskala mendekati rata-rata semua subnetwork.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_044",
        questionEN: "What is Bayesian Model Averaging (BMA)?",
        questionID: "Apa itu Bayesian Model Averaging (BMA)?",
        options: [
            QuestionOption(id: "a", textEN: "Weighting models by their posterior probability given the data", textID: "Memberi bobot model berdasarkan probabilitas posterior diberikan data"),
            QuestionOption(id: "b", textEN: "Using Bayes' theorem for classification", textID: "Menggunakan teorema Bayes untuk klasifikasi"),
            QuestionOption(id: "c", textEN: "Averaging priors", textID: "Merata-ratakan prior"),
            QuestionOption(id: "d", textEN: "Bayesian neural networks", textID: "Neural network Bayesian")
        ],
        correctOptionId: "a",
        explanationEN: "BMA: P(y|D) = ΣP(y|Mᵢ,D)P(Mᵢ|D). Models are weighted by how well they explain the data (posterior probability), providing principled uncertainty estimates.",
        explanationID: "BMA: P(y|D) = ΣP(y|Mᵢ,D)P(Mᵢ|D). Model diberi bobot berdasarkan seberapa baik mereka menjelaskan data (probabilitas posterior).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_045",
        questionEN: "What is the difference between model selection and model averaging?",
        questionID: "Apa perbedaan antara model selection dan model averaging?",
        options: [
            QuestionOption(id: "a", textEN: "Selection picks one best model; averaging combines all models", textID: "Selection memilih satu model terbaik; averaging menggabungkan semua model"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Selection is faster", textID: "Selection lebih cepat"),
            QuestionOption(id: "d", textEN: "Averaging requires more data", textID: "Averaging membutuhkan lebih banyak data")
        ],
        correctOptionId: "a",
        explanationEN: "Model selection discards all but the best model (high variance in selection). Averaging keeps all models, often providing more stable, robust predictions.",
        explanationID: "Model selection membuang semua kecuali model terbaik (variansi tinggi dalam seleksi). Averaging menyimpan semua model, sering memberikan prediksi lebih stabil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_046",
        questionEN: "How does ensemble size affect performance?",
        questionID: "Bagaimana ukuran ensemble mempengaruhi performa?",
        options: [
            QuestionOption(id: "a", textEN: "Improvement with diminishing returns; error typically plateaus", textID: "Perbaikan dengan diminishing returns; error biasanya mencapai plateau"),
            QuestionOption(id: "b", textEN: "Linear improvement with size", textID: "Perbaikan linear dengan ukuran"),
            QuestionOption(id: "c", textEN: "Performance always decreases with more models", textID: "Performa selalu menurun dengan lebih banyak model"),
            QuestionOption(id: "d", textEN: "No relationship", textID: "Tidak ada hubungan")
        ],
        correctOptionId: "a",
        explanationEN: "Error decreases as O(1/√n) for independent models. Beyond ~50-100 models, improvements are marginal. Computation cost increases linearly with ensemble size.",
        explanationID: "Error menurun sebagai O(1/√n) untuk model independen. Setelah ~50-100 model, perbaikan minimal. Biaya komputasi meningkat linear dengan ukuran ensemble.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_047",
        questionEN: "What is negative correlation learning?",
        questionID: "Apa itu negative correlation learning?",
        options: [
            QuestionOption(id: "a", textEN: "Training ensemble members to make negatively correlated errors", textID: "Melatih anggota ensemble untuk membuat kesalahan berkorelasi negatif"),
            QuestionOption(id: "b", textEN: "Removing correlated features", textID: "Menghapus fitur berkorelasi"),
            QuestionOption(id: "c", textEN: "Training with negative samples", textID: "Training dengan sampel negatif"),
            QuestionOption(id: "d", textEN: "Using negative learning rate", textID: "Menggunakan learning rate negatif")
        ],
        correctOptionId: "a",
        explanationEN: "NCL adds a penalty encouraging individual networks to make errors that cancel out when combined, explicitly promoting diversity for better ensemble performance.",
        explanationID: "NCL menambahkan penalti yang mendorong network individual untuk membuat kesalahan yang saling menghilangkan saat digabungkan, secara eksplisit mempromosikan keragaman.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_048",
        questionEN: "What is mixture of experts?",
        questionID: "Apa itu mixture of experts?",
        options: [
            QuestionOption(id: "a", textEN: "A gating network routes inputs to specialized expert networks", textID: "Jaringan gating mengarahkan input ke jaringan expert khusus"),
            QuestionOption(id: "b", textEN: "Simple averaging of experts", textID: "Rata-rata sederhana dari expert"),
            QuestionOption(id: "c", textEN: "Training experts separately", textID: "Melatih expert secara terpisah"),
            QuestionOption(id: "d", textEN: "Voting among experts", textID: "Voting di antara expert")
        ],
        correctOptionId: "a",
        explanationEN: "MoE uses a learned gating network to softly assign inputs to expert networks. Each expert specializes in different regions of input space. Enables efficient scaling.",
        explanationID: "MoE menggunakan jaringan gating yang dipelajari untuk menetapkan input ke jaringan expert secara soft. Setiap expert mengkhususkan diri dalam wilayah berbeda dari ruang input.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ensemble_049",
        questionEN: "How do you handle class imbalance in ensemble methods?",
        questionID: "Bagaimana menangani ketidakseimbangan kelas dalam metode ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "Use balanced sampling, class weights, or specialized methods like EasyEnsemble", textID: "Gunakan sampling seimbang, bobot kelas, atau metode khusus seperti EasyEnsemble"),
            QuestionOption(id: "b", textEN: "Use more trees", textID: "Gunakan lebih banyak tree"),
            QuestionOption(id: "c", textEN: "Ignore the imbalance", textID: "Abaikan ketidakseimbangan"),
            QuestionOption(id: "d", textEN: "Use deeper models", textID: "Gunakan model lebih dalam")
        ],
        correctOptionId: "a",
        explanationEN: "EasyEnsemble trains multiple classifiers on balanced subsets (undersample majority). BalancedRandomForest uses balanced bootstrap. Class weights in loss function also help.",
        explanationID: "EasyEnsemble melatih beberapa classifier pada subset seimbang (undersample mayoritas). BalancedRandomForest menggunakan bootstrap seimbang. Bobot kelas dalam fungsi loss juga membantu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ensemble_050",
        questionEN: "When should you NOT use ensembles?",
        questionID: "Kapan Anda TIDAK harus menggunakan ensemble?",
        options: [
            QuestionOption(id: "a", textEN: "When interpretability, low latency, or model simplicity is critical", textID: "Ketika interpretabilitas, latensi rendah, atau kesederhanaan model sangat penting"),
            QuestionOption(id: "b", textEN: "When you have lots of data", textID: "Ketika Anda memiliki banyak data"),
            QuestionOption(id: "c", textEN: "When accuracy matters", textID: "Ketika akurasi penting"),
            QuestionOption(id: "d", textEN: "When training time is long", textID: "Ketika waktu training lama")
        ],
        correctOptionId: "a",
        explanationEN: "Ensembles sacrifice interpretability (black box), increase inference time (multiple models), and add complexity. For edge deployment or explainable AI, single models may be preferred.",
        explanationID: "Ensemble mengorbankan interpretabilitas (black box), meningkatkan waktu inferensi (beberapa model), dan menambah kompleksitas. Untuk deployment edge atau AI yang dapat dijelaskan, model tunggal mungkin lebih disukai.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
