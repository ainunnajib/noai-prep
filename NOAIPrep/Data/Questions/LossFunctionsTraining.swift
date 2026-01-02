import Foundation

// MARK: - Loss Functions & Training Questions (50 questions)
// Topics: Loss functions, Training dynamics, Learning rate, Weight initialization

let lossFunctionsTrainingQuestions: [Question] = [
    // MARK: - Classification Losses (Questions 1-10)
    Question(
        id: "loss_001",
        questionEN: "What is the cross-entropy loss formula for binary classification?",
        questionID: "Apa rumus cross-entropy loss untuk klasifikasi biner?",
        options: [
            QuestionOption(id: "a", textEN: "L = -[y*log(p) + (1-y)*log(1-p)]", textID: "L = -[y*log(p) + (1-y)*log(1-p)]"),
            QuestionOption(id: "b", textEN: "L = (y - p)^2", textID: "L = (y - p)^2"),
            QuestionOption(id: "c", textEN: "L = |y - p|", textID: "L = |y - p|"),
            QuestionOption(id: "d", textEN: "L = max(0, 1 - y*p)", textID: "L = max(0, 1 - y*p)")
        ],
        correctOptionId: "a",
        explanationEN: "Binary cross-entropy measures the difference between true labels y (0 or 1) and predicted probabilities p. It penalizes confident wrong predictions heavily due to the logarithm.",
        explanationID: "Binary cross-entropy mengukur perbedaan antara label sebenarnya y (0 atau 1) dan probabilitas prediksi p. Penalti untuk prediksi salah yang percaya diri sangat besar karena logaritma.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_002",
        questionEN: "What is categorical cross-entropy loss for multi-class classification?",
        questionID: "Apa itu categorical cross-entropy loss untuk klasifikasi multi-class?",
        options: [
            QuestionOption(id: "a", textEN: "L = -Σ y_i * log(p_i) summing over all classes", textID: "L = -Σ y_i * log(p_i) dijumlahkan untuk semua kelas"),
            QuestionOption(id: "b", textEN: "L = Σ (y_i - p_i)^2", textID: "L = Σ (y_i - p_i)^2"),
            QuestionOption(id: "c", textEN: "L = max(p_i) - y_i", textID: "L = max(p_i) - y_i"),
            QuestionOption(id: "d", textEN: "L = -log(max(p_i))", textID: "L = -log(max(p_i))")
        ],
        correctOptionId: "a",
        explanationEN: "Categorical cross-entropy sums over all classes, where y_i is 1 for the true class and 0 otherwise, and p_i is the predicted probability for class i.",
        explanationID: "Categorical cross-entropy menjumlahkan semua kelas, di mana y_i adalah 1 untuk kelas yang benar dan 0 untuk yang lain, dan p_i adalah probabilitas prediksi untuk kelas i.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_003",
        questionEN: "What is the relationship between softmax and cross-entropy?",
        questionID: "Apa hubungan antara softmax dan cross-entropy?",
        options: [
            QuestionOption(id: "a", textEN: "Softmax converts logits to probabilities, cross-entropy measures loss", textID: "Softmax mengubah logits ke probabilitas, cross-entropy mengukur loss"),
            QuestionOption(id: "b", textEN: "They are the same function", textID: "Mereka adalah fungsi yang sama"),
            QuestionOption(id: "c", textEN: "Softmax is the derivative of cross-entropy", textID: "Softmax adalah turunan dari cross-entropy"),
            QuestionOption(id: "d", textEN: "Cross-entropy converts logits to probabilities", textID: "Cross-entropy mengubah logits ke probabilitas")
        ],
        correctOptionId: "a",
        explanationEN: "Softmax normalizes logits into a probability distribution. Cross-entropy then measures how different this distribution is from the true label distribution. They're often combined for numerical stability.",
        explanationID: "Softmax menormalisasi logits menjadi distribusi probabilitas. Cross-entropy kemudian mengukur seberapa berbeda distribusi ini dari distribusi label sebenarnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_004",
        questionEN: "Why is log-sum-exp numerically more stable than separate softmax + cross-entropy?",
        questionID: "Mengapa log-sum-exp lebih stabil secara numerik daripada softmax + cross-entropy terpisah?",
        options: [
            QuestionOption(id: "a", textEN: "It avoids computing exp() on large values which can overflow", textID: "Menghindari perhitungan exp() pada nilai besar yang bisa overflow"),
            QuestionOption(id: "b", textEN: "It uses less memory", textID: "Menggunakan lebih sedikit memori"),
            QuestionOption(id: "c", textEN: "It's faster to compute", textID: "Lebih cepat untuk dihitung"),
            QuestionOption(id: "d", textEN: "It gives more accurate gradients", textID: "Memberikan gradien yang lebih akurat")
        ],
        correctOptionId: "a",
        explanationEN: "Computing softmax separately can cause overflow for large logits (exp(1000) = infinity). Log-sum-exp trick avoids this by subtracting the max logit first.",
        explanationID: "Menghitung softmax secara terpisah dapat menyebabkan overflow untuk logits besar (exp(1000) = infinity). Trik log-sum-exp menghindari ini dengan mengurangi logit maksimum terlebih dahulu.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_005",
        questionEN: "What problem is focal loss designed to address?",
        questionID: "Masalah apa yang dirancang untuk diatasi oleh focal loss?",
        options: [
            QuestionOption(id: "a", textEN: "Class imbalance by down-weighting easy examples", textID: "Ketidakseimbangan kelas dengan menurunkan bobot contoh mudah"),
            QuestionOption(id: "b", textEN: "Improving training speed", textID: "Meningkatkan kecepatan training"),
            QuestionOption(id: "c", textEN: "Handling continuous outputs", textID: "Menangani output kontinu"),
            QuestionOption(id: "d", textEN: "Reducing overfitting", textID: "Mengurangi overfitting")
        ],
        correctOptionId: "a",
        explanationEN: "Focal loss adds (1-p_t)^γ factor to cross-entropy, down-weighting easy examples (high p_t) and focusing on hard examples.",
        explanationID: "Focal loss menambahkan faktor (1-p_t)^γ pada cross-entropy, menurunkan bobot contoh mudah (p_t tinggi) dan fokus pada contoh sulit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_006",
        questionEN: "What is the hinge loss formula used in SVMs?",
        questionID: "Apa rumus hinge loss yang digunakan dalam SVM?",
        options: [
            QuestionOption(id: "a", textEN: "L = max(0, 1 - y*f(x))", textID: "L = max(0, 1 - y*f(x))"),
            QuestionOption(id: "b", textEN: "L = -y*log(f(x))", textID: "L = -y*log(f(x))"),
            QuestionOption(id: "c", textEN: "L = (y - f(x))^2", textID: "L = (y - f(x))^2"),
            QuestionOption(id: "d", textEN: "L = |y - f(x)|", textID: "L = |y - f(x)|")
        ],
        correctOptionId: "a",
        explanationEN: "Hinge loss is max(0, 1 - y*f(x)) where y ∈ {-1, +1}. It's zero when classification is correct with margin ≥1, otherwise linear penalty.",
        explanationID: "Hinge loss adalah max(0, 1 - y*f(x)) di mana y ∈ {-1, +1}. Nilainya nol ketika klasifikasi benar dengan margin ≥1, jika tidak ada penalti linear.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_007",
        questionEN: "What is label smoothing and why is it used?",
        questionID: "Apa itu label smoothing dan mengapa digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Softening hard labels to prevent overconfident predictions", textID: "Melembutkan label keras untuk mencegah prediksi terlalu percaya diri"),
            QuestionOption(id: "b", textEN: "Applying Gaussian blur to labels", textID: "Menerapkan Gaussian blur pada label"),
            QuestionOption(id: "c", textEN: "Interpolating between training examples", textID: "Interpolasi antara contoh training"),
            QuestionOption(id: "d", textEN: "Removing noise from labels", textID: "Menghapus noise dari label")
        ],
        correctOptionId: "a",
        explanationEN: "Label smoothing replaces one-hot labels with soft labels (e.g., 0.9 for true class, 0.1/(K-1) for others). This regularizes the model and prevents overconfidence.",
        explanationID: "Label smoothing mengganti label one-hot dengan label lembut (misal, 0.9 untuk kelas benar, 0.1/(K-1) untuk yang lain). Ini meregularisasi model dan mencegah kepercayaan berlebihan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_008",
        questionEN: "What is the KL divergence loss measuring?",
        questionID: "Apa yang diukur oleh KL divergence loss?",
        options: [
            QuestionOption(id: "a", textEN: "How different one probability distribution is from another", textID: "Seberapa berbeda satu distribusi probabilitas dari yang lain"),
            QuestionOption(id: "b", textEN: "The absolute difference between predictions and labels", textID: "Perbedaan absolut antara prediksi dan label"),
            QuestionOption(id: "c", textEN: "The variance of the predictions", textID: "Varians dari prediksi"),
            QuestionOption(id: "d", textEN: "The entropy of the true distribution", textID: "Entropi dari distribusi sebenarnya")
        ],
        correctOptionId: "a",
        explanationEN: "KL divergence D_KL(P||Q) = Σ P(x) log(P(x)/Q(x)) measures how probability distribution Q differs from reference distribution P. It's asymmetric.",
        explanationID: "KL divergence D_KL(P||Q) = Σ P(x) log(P(x)/Q(x)) mengukur seberapa berbeda distribusi probabilitas Q dari distribusi referensi P. Ini asimetris.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_009",
        questionEN: "What is the relationship between cross-entropy and KL divergence?",
        questionID: "Apa hubungan antara cross-entropy dan KL divergence?",
        options: [
            QuestionOption(id: "a", textEN: "Cross-entropy = Entropy(P) + KL(P||Q)", textID: "Cross-entropy = Entropy(P) + KL(P||Q)"),
            QuestionOption(id: "b", textEN: "They are exactly the same", textID: "Mereka persis sama"),
            QuestionOption(id: "c", textEN: "Cross-entropy = KL(P||Q) / 2", textID: "Cross-entropy = KL(P||Q) / 2"),
            QuestionOption(id: "d", textEN: "KL divergence is the derivative of cross-entropy", textID: "KL divergence adalah turunan dari cross-entropy")
        ],
        correctOptionId: "a",
        explanationEN: "H(P,Q) = H(P) + D_KL(P||Q). When minimizing cross-entropy with fixed P, we're minimizing KL divergence since H(P) is constant.",
        explanationID: "H(P,Q) = H(P) + D_KL(P||Q). Ketika meminimalkan cross-entropy dengan P tetap, kita meminimalkan KL divergence karena H(P) konstan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_010",
        questionEN: "What is sparse categorical cross-entropy?",
        questionID: "Apa itu sparse categorical cross-entropy?",
        options: [
            QuestionOption(id: "a", textEN: "Cross-entropy that takes integer class labels instead of one-hot", textID: "Cross-entropy yang mengambil label kelas integer bukan one-hot"),
            QuestionOption(id: "b", textEN: "Cross-entropy for sparse data", textID: "Cross-entropy untuk data sparse"),
            QuestionOption(id: "c", textEN: "A regularized version of cross-entropy", textID: "Versi teregularisasi dari cross-entropy"),
            QuestionOption(id: "d", textEN: "Cross-entropy with dropout", textID: "Cross-entropy dengan dropout")
        ],
        correctOptionId: "a",
        explanationEN: "Sparse categorical cross-entropy is computationally equivalent to categorical cross-entropy but accepts integer labels (e.g., 3) instead of one-hot vectors ([0,0,0,1,0]).",
        explanationID: "Sparse categorical cross-entropy secara komputasi setara dengan categorical cross-entropy tetapi menerima label integer (misal, 3) bukan vektor one-hot ([0,0,0,1,0]).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // MARK: - Regression Losses (Questions 11-20)
    Question(
        id: "loss_011",
        questionEN: "What is Mean Squared Error (MSE) loss?",
        questionID: "Apa itu Mean Squared Error (MSE) loss?",
        options: [
            QuestionOption(id: "a", textEN: "L = (1/n) Σ (y_i - ŷ_i)^2", textID: "L = (1/n) Σ (y_i - ŷ_i)^2"),
            QuestionOption(id: "b", textEN: "L = (1/n) Σ |y_i - ŷ_i|", textID: "L = (1/n) Σ |y_i - ŷ_i|"),
            QuestionOption(id: "c", textEN: "L = max(y_i - ŷ_i)", textID: "L = max(y_i - ŷ_i)"),
            QuestionOption(id: "d", textEN: "L = Σ log(y_i / ŷ_i)", textID: "L = Σ log(y_i / ŷ_i)")
        ],
        correctOptionId: "a",
        explanationEN: "MSE calculates the average of squared differences between predictions and targets. It heavily penalizes large errors due to squaring.",
        explanationID: "MSE menghitung rata-rata perbedaan kuadrat antara prediksi dan target. MSE sangat menghukum kesalahan besar karena pengkuadratan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_012",
        questionEN: "What is Mean Absolute Error (MAE) loss?",
        questionID: "Apa itu Mean Absolute Error (MAE) loss?",
        options: [
            QuestionOption(id: "a", textEN: "L = (1/n) Σ |y_i - ŷ_i|", textID: "L = (1/n) Σ |y_i - ŷ_i|"),
            QuestionOption(id: "b", textEN: "L = (1/n) Σ (y_i - ŷ_i)^2", textID: "L = (1/n) Σ (y_i - ŷ_i)^2"),
            QuestionOption(id: "c", textEN: "L = median(|y_i - ŷ_i|)", textID: "L = median(|y_i - ŷ_i|)"),
            QuestionOption(id: "d", textEN: "L = max(|y_i - ŷ_i|)", textID: "L = max(|y_i - ŷ_i|)")
        ],
        correctOptionId: "a",
        explanationEN: "MAE calculates the average of absolute differences. Unlike MSE, it's more robust to outliers as it doesn't square the errors.",
        explanationID: "MAE menghitung rata-rata perbedaan absolut. Berbeda dengan MSE, MAE lebih robust terhadap outlier karena tidak mengkuadratkan error.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_013",
        questionEN: "When would you prefer MAE over MSE for regression?",
        questionID: "Kapan Anda lebih memilih MAE daripada MSE untuk regresi?",
        options: [
            QuestionOption(id: "a", textEN: "When the dataset has many outliers", textID: "Ketika dataset memiliki banyak outlier"),
            QuestionOption(id: "b", textEN: "When you need smooth gradients everywhere", textID: "Ketika Anda membutuhkan gradien halus di mana-mana"),
            QuestionOption(id: "c", textEN: "When all errors should be weighted equally regardless of magnitude", textID: "Ketika semua error harus diberi bobot sama terlepas dari besarnya"),
            QuestionOption(id: "d", textEN: "Both A and C", textID: "Baik A dan C")
        ],
        correctOptionId: "d",
        explanationEN: "MAE is preferred when data has outliers (which MSE overweights due to squaring) and when you want equal penalty regardless of error magnitude.",
        explanationID: "MAE lebih dipilih ketika data memiliki outlier (yang MSE berlebihan karena pengkuadratan) dan ketika Anda ingin penalti sama terlepas dari besarnya error.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_014",
        questionEN: "What is Huber loss and when is it used?",
        questionID: "Apa itu Huber loss dan kapan digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Combines MSE for small errors and MAE for large errors", textID: "Menggabungkan MSE untuk error kecil dan MAE untuk error besar"),
            QuestionOption(id: "b", textEN: "A loss for classification problems", textID: "Loss untuk masalah klasifikasi"),
            QuestionOption(id: "c", textEN: "A loss that always uses absolute values", textID: "Loss yang selalu menggunakan nilai absolut"),
            QuestionOption(id: "d", textEN: "A loss specifically for time series", textID: "Loss khusus untuk time series")
        ],
        correctOptionId: "a",
        explanationEN: "Huber loss is quadratic for small errors (|y-ŷ| ≤ δ) and linear for large errors. It combines MSE's smooth gradients near zero with MAE's robustness to outliers.",
        explanationID: "Huber loss bersifat kuadratik untuk error kecil (|y-ŷ| ≤ δ) dan linear untuk error besar. Menggabungkan gradien halus MSE di dekat nol dengan ketahanan MAE terhadap outlier.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_015",
        questionEN: "What is quantile loss used for?",
        questionID: "Untuk apa quantile loss digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting specific percentiles of the target distribution", textID: "Memprediksi persentil tertentu dari distribusi target"),
            QuestionOption(id: "b", textEN: "Classification with quantized labels", textID: "Klasifikasi dengan label terkuantisasi"),
            QuestionOption(id: "c", textEN: "Reducing the number of parameters", textID: "Mengurangi jumlah parameter"),
            QuestionOption(id: "d", textEN: "Training on quantum computers", textID: "Training pada komputer kuantum")
        ],
        correctOptionId: "a",
        explanationEN: "Quantile loss allows training models to predict specific percentiles (e.g., median, 90th percentile) by asymmetrically penalizing over and under-predictions.",
        explanationID: "Quantile loss memungkinkan training model untuk memprediksi persentil tertentu (misal, median, persentil ke-90) dengan menghukum prediksi berlebih dan kurang secara asimetris.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_016",
        questionEN: "What does the log-cosh loss combine?",
        questionID: "Apa yang dikombinasikan oleh log-cosh loss?",
        options: [
            QuestionOption(id: "a", textEN: "Smoothness of MSE with robustness approaching MAE for large errors", textID: "Kehalusan MSE dengan ketahanan mendekati MAE untuk error besar"),
            QuestionOption(id: "b", textEN: "Classification and regression losses", textID: "Loss klasifikasi dan regresi"),
            QuestionOption(id: "c", textEN: "Multiple output predictions", textID: "Prediksi multiple output"),
            QuestionOption(id: "d", textEN: "Temporal and spatial information", textID: "Informasi temporal dan spasial")
        ],
        correctOptionId: "a",
        explanationEN: "Log-cosh loss is log(cosh(y-ŷ)). It's approximately (y-ŷ)²/2 for small errors and |y-ŷ|-log(2) for large errors, providing smooth gradients everywhere.",
        explanationID: "Log-cosh loss adalah log(cosh(y-ŷ)). Sekitar (y-ŷ)²/2 untuk error kecil dan |y-ŷ|-log(2) untuk error besar, memberikan gradien halus di mana-mana.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_017",
        questionEN: "What is the purpose of MAPE (Mean Absolute Percentage Error)?",
        questionID: "Apa tujuan dari MAPE (Mean Absolute Percentage Error)?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring error as a percentage of actual values for interpretability", textID: "Mengukur error sebagai persentase dari nilai aktual untuk interpretabilitas"),
            QuestionOption(id: "b", textEN: "Penalizing percentage classifications wrong", textID: "Menghukum persentase klasifikasi yang salah"),
            QuestionOption(id: "c", textEN: "Computing gradients more efficiently", textID: "Menghitung gradien lebih efisien"),
            QuestionOption(id: "d", textEN: "Handling missing values", textID: "Menangani nilai yang hilang")
        ],
        correctOptionId: "a",
        explanationEN: "MAPE = (100/n) Σ |y_i - ŷ_i| / |y_i|. It expresses error as a percentage, making it interpretable, but is undefined when y_i = 0.",
        explanationID: "MAPE = (100/n) Σ |y_i - ŷ_i| / |y_i|. Mengekspresikan error sebagai persentase untuk interpretabilitas, tetapi tidak terdefinisi ketika y_i = 0.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_018",
        questionEN: "Why might MSE gradient be problematic at the start of training?",
        questionID: "Mengapa gradien MSE bisa bermasalah di awal training?",
        options: [
            QuestionOption(id: "a", textEN: "Large errors produce very large gradients that can cause instability", textID: "Error besar menghasilkan gradien sangat besar yang dapat menyebabkan ketidakstabilan"),
            QuestionOption(id: "b", textEN: "The gradient is always zero", textID: "Gradien selalu nol"),
            QuestionOption(id: "c", textEN: "It requires too much memory", textID: "Memerlukan terlalu banyak memori"),
            QuestionOption(id: "d", textEN: "It's not differentiable", textID: "Tidak dapat didiferensiasi")
        ],
        correctOptionId: "a",
        explanationEN: "MSE gradient is 2(ŷ-y), proportional to error magnitude. Large initial errors can cause exploding gradients. Gradient clipping or learning rate warmup can help.",
        explanationID: "Gradien MSE adalah 2(ŷ-y), proporsional dengan besarnya error. Error awal yang besar dapat menyebabkan exploding gradients. Gradient clipping atau learning rate warmup dapat membantu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_019",
        questionEN: "What problem does MAE gradient have at zero?",
        questionID: "Masalah apa yang dimiliki gradien MAE di nol?",
        options: [
            QuestionOption(id: "a", textEN: "It's not differentiable (undefined gradient)", textID: "Tidak dapat didiferensiasi (gradien tidak terdefinisi)"),
            QuestionOption(id: "b", textEN: "The gradient is too large", textID: "Gradien terlalu besar"),
            QuestionOption(id: "c", textEN: "It causes memory overflow", textID: "Menyebabkan memory overflow"),
            QuestionOption(id: "d", textEN: "It always produces negative values", textID: "Selalu menghasilkan nilai negatif")
        ],
        correctOptionId: "a",
        explanationEN: "MAE = |y-ŷ| has a non-differentiable point at y=ŷ. In practice, subgradient methods or smooth approximations (like Huber loss) are used.",
        explanationID: "MAE = |y-ŷ| memiliki titik yang tidak dapat didiferensiasi di y=ŷ. Dalam praktik, metode subgradien atau aproksimasi halus (seperti Huber loss) digunakan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_020",
        questionEN: "What is the assumption underlying MSE as a loss function?",
        questionID: "Apa asumsi yang mendasari MSE sebagai fungsi loss?",
        options: [
            QuestionOption(id: "a", textEN: "Errors are normally distributed with constant variance", textID: "Error terdistribusi normal dengan varians konstan"),
            QuestionOption(id: "b", textEN: "Errors follow a uniform distribution", textID: "Error mengikuti distribusi uniform"),
            QuestionOption(id: "c", textEN: "Errors are always positive", textID: "Error selalu positif"),
            QuestionOption(id: "d", textEN: "No assumptions are made", textID: "Tidak ada asumsi yang dibuat")
        ],
        correctOptionId: "a",
        explanationEN: "Minimizing MSE is equivalent to maximum likelihood estimation when errors are Gaussian with constant variance (homoscedastic).",
        explanationID: "Meminimalkan MSE setara dengan estimasi maximum likelihood ketika error berdistribusi Gaussian dengan varians konstan (homoskedastik).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Learning Rate (Questions 21-30)
    Question(
        id: "loss_021",
        questionEN: "What happens if the learning rate is too high?",
        questionID: "Apa yang terjadi jika learning rate terlalu tinggi?",
        options: [
            QuestionOption(id: "a", textEN: "Training may diverge or oscillate around the minimum", textID: "Training dapat divergen atau berosilasi di sekitar minimum"),
            QuestionOption(id: "b", textEN: "Training converges faster to better solutions", textID: "Training konvergen lebih cepat ke solusi yang lebih baik"),
            QuestionOption(id: "c", textEN: "The model uses less memory", textID: "Model menggunakan lebih sedikit memori"),
            QuestionOption(id: "d", textEN: "Gradients become zero", textID: "Gradien menjadi nol")
        ],
        correctOptionId: "a",
        explanationEN: "A high learning rate causes large parameter updates that can overshoot the minimum, leading to oscillation or divergence (loss increasing over time).",
        explanationID: "Learning rate tinggi menyebabkan update parameter besar yang dapat melampaui minimum, menyebabkan osilasi atau divergensi (loss meningkat seiring waktu).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_022",
        questionEN: "What happens if the learning rate is too low?",
        questionID: "Apa yang terjadi jika learning rate terlalu rendah?",
        options: [
            QuestionOption(id: "a", textEN: "Training converges very slowly and may get stuck in local minima", textID: "Training konvergen sangat lambat dan mungkin terjebak di local minima"),
            QuestionOption(id: "b", textEN: "The model performs better", textID: "Model berkinerja lebih baik"),
            QuestionOption(id: "c", textEN: "Training becomes unstable", textID: "Training menjadi tidak stabil"),
            QuestionOption(id: "d", textEN: "Memory usage increases", textID: "Penggunaan memori meningkat")
        ],
        correctOptionId: "a",
        explanationEN: "A very low learning rate makes tiny updates, requiring many epochs to converge and potentially getting stuck in suboptimal local minima.",
        explanationID: "Learning rate sangat rendah membuat update kecil, memerlukan banyak epoch untuk konvergen dan berpotensi terjebak di local minima suboptimal.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_023",
        questionEN: "What is learning rate warmup?",
        questionID: "Apa itu learning rate warmup?",
        options: [
            QuestionOption(id: "a", textEN: "Starting with a small LR and gradually increasing it", textID: "Memulai dengan LR kecil dan secara bertahap meningkatkannya"),
            QuestionOption(id: "b", textEN: "Using a constant high learning rate", textID: "Menggunakan learning rate tinggi yang konstan"),
            QuestionOption(id: "c", textEN: "Pre-training the model on easier tasks", textID: "Pre-training model pada tugas yang lebih mudah"),
            QuestionOption(id: "d", textEN: "Warming up the GPU before training", textID: "Memanaskan GPU sebelum training")
        ],
        correctOptionId: "a",
        explanationEN: "Warmup starts with a small learning rate and increases it linearly over initial steps. This helps stabilize training when batch statistics are noisy early on.",
        explanationID: "Warmup dimulai dengan learning rate kecil dan meningkatkannya secara linear selama langkah awal. Ini membantu menstabilkan training ketika statistik batch noisy di awal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_024",
        questionEN: "What is cosine annealing learning rate schedule?",
        questionID: "Apa itu jadwal cosine annealing learning rate?",
        options: [
            QuestionOption(id: "a", textEN: "LR decreases following a cosine curve from max to min", textID: "LR menurun mengikuti kurva cosinus dari max ke min"),
            QuestionOption(id: "b", textEN: "LR increases following a cosine curve", textID: "LR meningkat mengikuti kurva cosinus"),
            QuestionOption(id: "c", textEN: "LR stays constant", textID: "LR tetap konstan"),
            QuestionOption(id: "d", textEN: "LR oscillates randomly", textID: "LR berosilasi secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Cosine annealing smoothly decreases LR from initial value to near zero following a cosine curve: LR_t = LR_min + 0.5*(LR_max - LR_min)*(1 + cos(πt/T)).",
        explanationID: "Cosine annealing menurunkan LR dengan halus dari nilai awal ke mendekati nol mengikuti kurva cosinus: LR_t = LR_min + 0.5*(LR_max - LR_min)*(1 + cos(πt/T)).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_025",
        questionEN: "What is the purpose of learning rate scheduling?",
        questionID: "Apa tujuan dari penjadwalan learning rate?",
        options: [
            QuestionOption(id: "a", textEN: "To use larger steps initially and smaller steps for fine-tuning", textID: "Menggunakan langkah lebih besar di awal dan langkah lebih kecil untuk fine-tuning"),
            QuestionOption(id: "b", textEN: "To save memory during training", textID: "Menghemat memori selama training"),
            QuestionOption(id: "c", textEN: "To speed up backward pass computation", textID: "Mempercepat komputasi backward pass"),
            QuestionOption(id: "d", textEN: "To reduce the model size", textID: "Mengurangi ukuran model")
        ],
        correctOptionId: "a",
        explanationEN: "LR scheduling allows fast initial convergence with large LR, then fine-tuning with smaller LR for better final performance.",
        explanationID: "Penjadwalan LR memungkinkan konvergensi awal yang cepat dengan LR besar, kemudian fine-tuning dengan LR lebih kecil untuk performa akhir yang lebih baik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_026",
        questionEN: "What is the step decay learning rate schedule?",
        questionID: "Apa itu jadwal step decay learning rate?",
        options: [
            QuestionOption(id: "a", textEN: "Reduce LR by a factor at fixed epoch intervals", textID: "Mengurangi LR dengan faktor pada interval epoch tetap"),
            QuestionOption(id: "b", textEN: "Reduce LR after each batch", textID: "Mengurangi LR setelah setiap batch"),
            QuestionOption(id: "c", textEN: "Increase LR at each step", textID: "Meningkatkan LR pada setiap langkah"),
            QuestionOption(id: "d", textEN: "Keep LR constant throughout", textID: "Menjaga LR konstan sepanjang waktu")
        ],
        correctOptionId: "a",
        explanationEN: "Step decay reduces LR by a factor (e.g., 0.1) every N epochs. For example: LR = 0.1 for epochs 1-30, then 0.01 for epochs 31-60, etc.",
        explanationID: "Step decay mengurangi LR dengan faktor (misal, 0.1) setiap N epoch. Contoh: LR = 0.1 untuk epoch 1-30, lalu 0.01 untuk epoch 31-60, dst.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_027",
        questionEN: "What is exponential decay learning rate schedule?",
        questionID: "Apa itu jadwal exponential decay learning rate?",
        options: [
            QuestionOption(id: "a", textEN: "LR_t = LR_0 * decay_rate^(t/decay_steps)", textID: "LR_t = LR_0 * decay_rate^(t/decay_steps)"),
            QuestionOption(id: "b", textEN: "LR_t = LR_0 / t", textID: "LR_t = LR_0 / t"),
            QuestionOption(id: "c", textEN: "LR_t = LR_0 - decay_rate * t", textID: "LR_t = LR_0 - decay_rate * t"),
            QuestionOption(id: "d", textEN: "LR_t = exp(LR_0 * t)", textID: "LR_t = exp(LR_0 * t)")
        ],
        correctOptionId: "a",
        explanationEN: "Exponential decay multiplies LR by a constant factor (<1) at regular intervals, causing exponential decrease over time.",
        explanationID: "Exponential decay mengalikan LR dengan faktor konstan (<1) pada interval teratur, menyebabkan penurunan eksponensial seiring waktu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_028",
        questionEN: "What is ReduceLROnPlateau scheduler?",
        questionID: "Apa itu scheduler ReduceLROnPlateau?",
        options: [
            QuestionOption(id: "a", textEN: "Reduce LR when validation metric stops improving", textID: "Mengurangi LR ketika metrik validasi berhenti membaik"),
            QuestionOption(id: "b", textEN: "Reduce LR at fixed intervals", textID: "Mengurangi LR pada interval tetap"),
            QuestionOption(id: "c", textEN: "Increase LR when loss plateaus", textID: "Meningkatkan LR ketika loss mendatar"),
            QuestionOption(id: "d", textEN: "Keep LR constant during plateau", textID: "Menjaga LR konstan selama plateau")
        ],
        correctOptionId: "a",
        explanationEN: "ReduceLROnPlateau monitors a metric (usually validation loss) and reduces LR by a factor when the metric hasn't improved for 'patience' epochs.",
        explanationID: "ReduceLROnPlateau memantau metrik (biasanya validation loss) dan mengurangi LR dengan faktor ketika metrik belum membaik selama 'patience' epoch.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_029",
        questionEN: "What is cyclical learning rate (CLR)?",
        questionID: "Apa itu cyclical learning rate (CLR)?",
        options: [
            QuestionOption(id: "a", textEN: "LR oscillates between min and max values cyclically", textID: "LR berosilasi antara nilai min dan max secara siklis"),
            QuestionOption(id: "b", textEN: "LR only decreases in cycles", textID: "LR hanya menurun dalam siklus"),
            QuestionOption(id: "c", textEN: "LR is set based on cycle count", textID: "LR ditetapkan berdasarkan jumlah siklus"),
            QuestionOption(id: "d", textEN: "LR follows CPU cycles", textID: "LR mengikuti siklus CPU")
        ],
        correctOptionId: "a",
        explanationEN: "CLR varies LR between bounds cyclically. This can help escape saddle points and local minima, and acts as a form of regularization.",
        explanationID: "CLR memvariasikan LR antara batas secara siklis. Ini dapat membantu keluar dari saddle points dan local minima, dan bertindak sebagai bentuk regularisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_030",
        questionEN: "What is the 1cycle learning rate policy?",
        questionID: "Apa itu kebijakan learning rate 1cycle?",
        options: [
            QuestionOption(id: "a", textEN: "One cycle of LR increasing then decreasing over training", textID: "Satu siklus LR meningkat lalu menurun selama training"),
            QuestionOption(id: "b", textEN: "Using exactly one learning rate value", textID: "Menggunakan tepat satu nilai learning rate"),
            QuestionOption(id: "c", textEN: "Training for exactly one epoch", textID: "Training selama tepat satu epoch"),
            QuestionOption(id: "d", textEN: "Only updating weights once per cycle", textID: "Hanya memperbarui bobot sekali per siklus")
        ],
        correctOptionId: "a",
        explanationEN: "1cycle policy increases LR from min to max in first half, then decreases to below min in second half. Often enables training with larger max LR and faster convergence.",
        explanationID: "Kebijakan 1cycle meningkatkan LR dari min ke max di setengah pertama, lalu menurun ke bawah min di setengah kedua. Sering memungkinkan training dengan max LR lebih besar dan konvergensi lebih cepat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Weight Initialization (Questions 31-40)
    Question(
        id: "loss_031",
        questionEN: "Why is proper weight initialization important in neural networks?",
        questionID: "Mengapa inisialisasi bobot yang tepat penting dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent vanishing/exploding gradients and enable effective learning", textID: "Untuk mencegah vanishing/exploding gradients dan memungkinkan pembelajaran efektif"),
            QuestionOption(id: "b", textEN: "To reduce model size", textID: "Untuk mengurangi ukuran model"),
            QuestionOption(id: "c", textEN: "To make inference faster", textID: "Untuk membuat inferensi lebih cepat"),
            QuestionOption(id: "d", textEN: "To improve data loading speed", textID: "Untuk meningkatkan kecepatan pemuatan data")
        ],
        correctOptionId: "a",
        explanationEN: "Good initialization keeps activations and gradients in reasonable ranges throughout the network, enabling effective backpropagation without vanishing or exploding.",
        explanationID: "Inisialisasi yang baik menjaga aktivasi dan gradien dalam rentang yang wajar di seluruh jaringan, memungkinkan backpropagation efektif tanpa vanishing atau exploding.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_032",
        questionEN: "What happens if all weights are initialized to zero?",
        questionID: "Apa yang terjadi jika semua bobot diinisialisasi ke nol?",
        options: [
            QuestionOption(id: "a", textEN: "All neurons learn the same thing (symmetry problem)", textID: "Semua neuron mempelajari hal yang sama (masalah simetri)"),
            QuestionOption(id: "b", textEN: "Training converges faster", textID: "Training konvergen lebih cepat"),
            QuestionOption(id: "c", textEN: "The network becomes more robust", textID: "Jaringan menjadi lebih robust"),
            QuestionOption(id: "d", textEN: "Gradients become very large", textID: "Gradien menjadi sangat besar")
        ],
        correctOptionId: "a",
        explanationEN: "Zero initialization causes all neurons in a layer to compute identical gradients and make identical updates, so they remain identical (symmetry breaking fails).",
        explanationID: "Inisialisasi nol menyebabkan semua neuron dalam layer menghitung gradien identik dan membuat update identik, sehingga tetap identik (pemecahan simetri gagal).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_033",
        questionEN: "What is Xavier/Glorot initialization?",
        questionID: "Apa itu inisialisasi Xavier/Glorot?",
        options: [
            QuestionOption(id: "a", textEN: "Weights ~ N(0, 2/(n_in + n_out)) or U(-√(6/(n_in+n_out)), √(6/(n_in+n_out)))", textID: "Bobot ~ N(0, 2/(n_in + n_out)) atau U(-√(6/(n_in+n_out)), √(6/(n_in+n_out)))"),
            QuestionOption(id: "b", textEN: "Weights = 1 / n_in", textID: "Bobot = 1 / n_in"),
            QuestionOption(id: "c", textEN: "Weights ~ N(0, 1)", textID: "Bobot ~ N(0, 1)"),
            QuestionOption(id: "d", textEN: "Weights = 0", textID: "Bobot = 0")
        ],
        correctOptionId: "a",
        explanationEN: "Xavier initialization scales weights by both input and output dimensions to maintain variance of activations and gradients. Works well with tanh and sigmoid activations.",
        explanationID: "Inisialisasi Xavier menskalakan bobot berdasarkan dimensi input dan output untuk mempertahankan varians aktivasi dan gradien. Bekerja baik dengan aktivasi tanh dan sigmoid.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_034",
        questionEN: "What is He/Kaiming initialization?",
        questionID: "Apa itu inisialisasi He/Kaiming?",
        options: [
            QuestionOption(id: "a", textEN: "Weights ~ N(0, 2/n_in) designed for ReLU activations", textID: "Bobot ~ N(0, 2/n_in) dirancang untuk aktivasi ReLU"),
            QuestionOption(id: "b", textEN: "Weights ~ N(0, 1/n_out)", textID: "Bobot ~ N(0, 1/n_out)"),
            QuestionOption(id: "c", textEN: "Weights = 2 / n_in", textID: "Bobot = 2 / n_in"),
            QuestionOption(id: "d", textEN: "Weights ~ N(0, 0.01)", textID: "Bobot ~ N(0, 0.01)")
        ],
        correctOptionId: "a",
        explanationEN: "He initialization uses Var(W) = 2/n_in to account for ReLU zeroing half the inputs. It maintains proper activation variance in deep ReLU networks.",
        explanationID: "Inisialisasi He menggunakan Var(W) = 2/n_in untuk memperhitungkan ReLU yang menolkan setengah input. Mempertahankan varians aktivasi yang tepat dalam jaringan ReLU dalam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_035",
        questionEN: "Why is He initialization preferred for ReLU networks over Xavier?",
        questionID: "Mengapa inisialisasi He lebih disukai untuk jaringan ReLU daripada Xavier?",
        options: [
            QuestionOption(id: "a", textEN: "ReLU zeros half the outputs, so variance needs 2x compensation", textID: "ReLU menolkan setengah output, jadi varians perlu kompensasi 2x"),
            QuestionOption(id: "b", textEN: "He initialization is faster to compute", textID: "Inisialisasi He lebih cepat dihitung"),
            QuestionOption(id: "c", textEN: "Xavier doesn't work with ReLU at all", textID: "Xavier tidak bekerja dengan ReLU sama sekali"),
            QuestionOption(id: "d", textEN: "He initialization uses less memory", textID: "Inisialisasi He menggunakan lebih sedikit memori")
        ],
        correctOptionId: "a",
        explanationEN: "ReLU outputs zero for negative inputs (half the values on average), reducing output variance by half. He initialization doubles the variance to compensate.",
        explanationID: "ReLU menghasilkan nol untuk input negatif (setengah nilai rata-rata), mengurangi varians output menjadi setengah. Inisialisasi He menggandakan varians untuk mengompensasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_036",
        questionEN: "What is orthogonal initialization?",
        questionID: "Apa itu inisialisasi ortogonal?",
        options: [
            QuestionOption(id: "a", textEN: "Weight matrix is initialized as an orthogonal matrix", textID: "Matriks bobot diinisialisasi sebagai matriks ortogonal"),
            QuestionOption(id: "b", textEN: "Weights are all perpendicular to inputs", textID: "Bobot semua tegak lurus dengan input"),
            QuestionOption(id: "c", textEN: "Each layer has orthogonal dimensions", textID: "Setiap layer memiliki dimensi ortogonal"),
            QuestionOption(id: "d", textEN: "Weights are initialized from orthogonal polynomials", textID: "Bobot diinisialisasi dari polinomial ortogonal")
        ],
        correctOptionId: "a",
        explanationEN: "Orthogonal initialization sets W such that W^T W = I. This preserves norm of vectors during forward pass, helping with gradient flow in deep networks.",
        explanationID: "Inisialisasi ortogonal menetapkan W sehingga W^T W = I. Ini mempertahankan norm vektor selama forward pass, membantu aliran gradien dalam jaringan dalam.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_037",
        questionEN: "How should biases typically be initialized?",
        questionID: "Bagaimana bias biasanya harus diinisialisasi?",
        options: [
            QuestionOption(id: "a", textEN: "To zero in most cases", textID: "Ke nol dalam kebanyakan kasus"),
            QuestionOption(id: "b", textEN: "Same as weights using Xavier", textID: "Sama dengan bobot menggunakan Xavier"),
            QuestionOption(id: "c", textEN: "To large random values", textID: "Ke nilai acak besar"),
            QuestionOption(id: "d", textEN: "To the mean of the target", textID: "Ke mean dari target")
        ],
        correctOptionId: "a",
        explanationEN: "Biases are typically initialized to zero since weight initialization already breaks symmetry. Exception: for ReLU, small positive bias (0.01) can help avoid dead neurons.",
        explanationID: "Bias biasanya diinisialisasi ke nol karena inisialisasi bobot sudah memecah simetri. Pengecualian: untuk ReLU, bias positif kecil (0.01) dapat membantu menghindari dead neurons.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_038",
        questionEN: "What is LSUV (Layer-Sequential Unit-Variance) initialization?",
        questionID: "Apa itu inisialisasi LSUV (Layer-Sequential Unit-Variance)?",
        options: [
            QuestionOption(id: "a", textEN: "Initialize then rescale each layer to have unit variance output", textID: "Inisialisasi lalu skalakan ulang setiap layer untuk memiliki output varians unit"),
            QuestionOption(id: "b", textEN: "Initialize all layers simultaneously", textID: "Inisialisasi semua layer secara bersamaan"),
            QuestionOption(id: "c", textEN: "Use sequential random numbers", textID: "Menggunakan angka acak berurutan"),
            QuestionOption(id: "d", textEN: "Initialize based on layer sequence number", textID: "Inisialisasi berdasarkan nomor urut layer")
        ],
        correctOptionId: "a",
        explanationEN: "LSUV first initializes with orthogonal weights, then layer-by-layer scales weights so each layer's output has unit variance. Works well for very deep networks.",
        explanationID: "LSUV pertama menginisialisasi dengan bobot ortogonal, kemudian layer-per-layer menskalakan bobot sehingga output setiap layer memiliki varians unit. Bekerja baik untuk jaringan sangat dalam.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_039",
        questionEN: "How should LSTM forget gate bias be initialized?",
        questionID: "Bagaimana bias forget gate LSTM harus diinisialisasi?",
        options: [
            QuestionOption(id: "a", textEN: "To 1 or higher to encourage remembering at start", textID: "Ke 1 atau lebih tinggi untuk mendorong mengingat di awal"),
            QuestionOption(id: "b", textEN: "To 0 like other biases", textID: "Ke 0 seperti bias lainnya"),
            QuestionOption(id: "c", textEN: "To -1 to encourage forgetting", textID: "Ke -1 untuk mendorong melupakan"),
            QuestionOption(id: "d", textEN: "Randomly between -1 and 1", textID: "Secara acak antara -1 dan 1")
        ],
        correctOptionId: "a",
        explanationEN: "Setting forget gate bias to 1+ makes sigmoid output close to 1, so the LSTM remembers information by default initially. This helps with learning long-term dependencies.",
        explanationID: "Mengatur bias forget gate ke 1+ membuat output sigmoid mendekati 1, sehingga LSTM mengingat informasi secara default di awal. Ini membantu pembelajaran dependensi jangka panjang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_040",
        questionEN: "What is the purpose of batch normalization in relation to initialization?",
        questionID: "Apa tujuan batch normalization terkait inisialisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Makes network less sensitive to initialization by normalizing activations", textID: "Membuat jaringan kurang sensitif terhadap inisialisasi dengan menormalisasi aktivasi"),
            QuestionOption(id: "b", textEN: "Replaces the need for any initialization", textID: "Menggantikan kebutuhan inisialisasi apapun"),
            QuestionOption(id: "c", textEN: "Initializes weights automatically", textID: "Menginisialisasi bobot secara otomatis"),
            QuestionOption(id: "d", textEN: "Removes all weights from the network", textID: "Menghapus semua bobot dari jaringan")
        ],
        correctOptionId: "a",
        explanationEN: "BatchNorm normalizes layer inputs to zero mean and unit variance during training, reducing dependence on careful initialization and allowing higher learning rates.",
        explanationID: "BatchNorm menormalisasi input layer ke mean nol dan varians unit selama training, mengurangi ketergantungan pada inisialisasi yang hati-hati dan memungkinkan learning rate lebih tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Training Dynamics (Questions 41-50)
    Question(
        id: "loss_041",
        questionEN: "What is gradient clipping and why is it used?",
        questionID: "Apa itu gradient clipping dan mengapa digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Limiting gradient magnitude to prevent exploding gradients", textID: "Membatasi magnitude gradien untuk mencegah exploding gradients"),
            QuestionOption(id: "b", textEN: "Removing gradients below a threshold", textID: "Menghapus gradien di bawah threshold"),
            QuestionOption(id: "c", textEN: "Compressing gradients for storage", textID: "Mengompresi gradien untuk penyimpanan"),
            QuestionOption(id: "d", textEN: "Clipping weights instead of gradients", textID: "Memotong bobot bukan gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient clipping scales down gradients when their norm exceeds a threshold. This prevents exploding gradients, especially important in RNNs and deep networks.",
        explanationID: "Gradient clipping menurunkan skala gradien ketika norm-nya melebihi threshold. Ini mencegah exploding gradients, terutama penting dalam RNN dan jaringan dalam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_042",
        questionEN: "What is the difference between gradient norm clipping and gradient value clipping?",
        questionID: "Apa perbedaan antara gradient norm clipping dan gradient value clipping?",
        options: [
            QuestionOption(id: "a", textEN: "Norm clipping scales entire gradient vector; value clipping clips individual elements", textID: "Norm clipping menskalakan seluruh vektor gradien; value clipping memotong elemen individual"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Mereka adalah hal yang sama"),
            QuestionOption(id: "c", textEN: "Norm clipping is faster", textID: "Norm clipping lebih cepat"),
            QuestionOption(id: "d", textEN: "Value clipping only works on biases", textID: "Value clipping hanya bekerja pada bias")
        ],
        correctOptionId: "a",
        explanationEN: "Norm clipping computes ||g||, and if > threshold, scales g ← g * (threshold/||g||). Value clipping independently clips each gradient element to [-threshold, threshold].",
        explanationID: "Norm clipping menghitung ||g||, dan jika > threshold, menskalakan g ← g * (threshold/||g||). Value clipping secara independen memotong setiap elemen gradien ke [-threshold, threshold].",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_043",
        questionEN: "What is the vanishing gradient problem?",
        questionID: "Apa itu masalah vanishing gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients become exponentially small in deep networks, stopping learning", textID: "Gradien menjadi sangat kecil secara eksponensial di jaringan dalam, menghentikan pembelajaran"),
            QuestionOption(id: "b", textEN: "Gradients disappear from memory", textID: "Gradien menghilang dari memori"),
            QuestionOption(id: "c", textEN: "Gradients become invisible in visualizations", textID: "Gradien menjadi tidak terlihat dalam visualisasi"),
            QuestionOption(id: "d", textEN: "Gradients are computed incorrectly", textID: "Gradien dihitung secara tidak benar")
        ],
        correctOptionId: "a",
        explanationEN: "In deep networks with sigmoid/tanh, gradients are multiplied through many layers. Since sigmoid derivative max is 0.25, gradients shrink exponentially, preventing early layer updates.",
        explanationID: "Dalam jaringan dalam dengan sigmoid/tanh, gradien dikalikan melalui banyak layer. Karena turunan sigmoid maksimal 0.25, gradien menyusut secara eksponensial, mencegah update layer awal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_044",
        questionEN: "How do residual connections (skip connections) help with gradient flow?",
        questionID: "Bagaimana residual connections (skip connections) membantu aliran gradien?",
        options: [
            QuestionOption(id: "a", textEN: "They provide direct gradient paths bypassing many layers", textID: "Mereka menyediakan jalur gradien langsung melewati banyak layer"),
            QuestionOption(id: "b", textEN: "They double the gradient magnitude", textID: "Mereka menggandakan magnitude gradien"),
            QuestionOption(id: "c", textEN: "They remove the need for backpropagation", textID: "Mereka menghilangkan kebutuhan backpropagation"),
            QuestionOption(id: "d", textEN: "They store gradients for later use", textID: "Mereka menyimpan gradien untuk penggunaan nanti")
        ],
        correctOptionId: "a",
        explanationEN: "Skip connections add identity shortcuts: y = F(x) + x. Gradients flow directly through '+', bypassing potential vanishing through F(x), enabling training of very deep networks.",
        explanationID: "Skip connections menambahkan shortcut identitas: y = F(x) + x. Gradien mengalir langsung melalui '+', melewati potensi vanishing melalui F(x), memungkinkan training jaringan sangat dalam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_045",
        questionEN: "What is early stopping in training?",
        questionID: "Apa itu early stopping dalam training?",
        options: [
            QuestionOption(id: "a", textEN: "Stop training when validation performance stops improving", textID: "Berhenti training ketika performa validasi berhenti membaik"),
            QuestionOption(id: "b", textEN: "Stop training after a fixed number of epochs", textID: "Berhenti training setelah jumlah epoch tetap"),
            QuestionOption(id: "c", textEN: "Stop training when loss reaches zero", textID: "Berhenti training ketika loss mencapai nol"),
            QuestionOption(id: "d", textEN: "Stop training immediately after starting", textID: "Berhenti training segera setelah dimulai")
        ],
        correctOptionId: "a",
        explanationEN: "Early stopping monitors validation metrics and stops training when they stop improving for 'patience' epochs. It's a form of regularization that prevents overfitting.",
        explanationID: "Early stopping memantau metrik validasi dan menghentikan training ketika berhenti membaik selama 'patience' epoch. Ini adalah bentuk regularisasi yang mencegah overfitting.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "loss_046",
        questionEN: "What is gradient accumulation?",
        questionID: "Apa itu gradient accumulation?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulating gradients over multiple mini-batches before updating", textID: "Mengakumulasi gradien selama beberapa mini-batch sebelum update"),
            QuestionOption(id: "b", textEN: "Adding all gradients together permanently", textID: "Menambahkan semua gradien bersama secara permanen"),
            QuestionOption(id: "c", textEN: "Storing gradients in a database", textID: "Menyimpan gradien dalam database"),
            QuestionOption(id: "d", textEN: "Computing gradients faster", textID: "Menghitung gradien lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient accumulation sums gradients over N steps before applying update, effectively simulating larger batch size when GPU memory is limited.",
        explanationID: "Gradient accumulation menjumlahkan gradien selama N langkah sebelum menerapkan update, secara efektif mensimulasikan batch size lebih besar ketika memori GPU terbatas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_047",
        questionEN: "What is mixed precision training?",
        questionID: "Apa itu mixed precision training?",
        options: [
            QuestionOption(id: "a", textEN: "Using FP16 for forward/backward pass and FP32 for weight updates", textID: "Menggunakan FP16 untuk forward/backward pass dan FP32 untuk update bobot"),
            QuestionOption(id: "b", textEN: "Training with different learning rates", textID: "Training dengan learning rate berbeda"),
            QuestionOption(id: "c", textEN: "Mixing different model architectures", textID: "Mencampur arsitektur model berbeda"),
            QuestionOption(id: "d", textEN: "Using different loss functions", textID: "Menggunakan fungsi loss berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Mixed precision uses FP16 for most operations (faster, less memory) but maintains FP32 master weights and uses loss scaling to prevent underflow in FP16 gradients.",
        explanationID: "Mixed precision menggunakan FP16 untuk sebagian besar operasi (lebih cepat, lebih sedikit memori) tetapi mempertahankan bobot master FP32 dan menggunakan loss scaling untuk mencegah underflow dalam gradien FP16.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_048",
        questionEN: "What is loss scaling in mixed precision training?",
        questionID: "Apa itu loss scaling dalam mixed precision training?",
        options: [
            QuestionOption(id: "a", textEN: "Multiplying loss by large factor to prevent FP16 gradient underflow", textID: "Mengalikan loss dengan faktor besar untuk mencegah underflow gradien FP16"),
            QuestionOption(id: "b", textEN: "Normalizing loss to [0, 1] range", textID: "Menormalisasi loss ke rentang [0, 1]"),
            QuestionOption(id: "c", textEN: "Reducing loss magnitude", textID: "Mengurangi magnitude loss"),
            QuestionOption(id: "d", textEN: "Converting loss to different units", textID: "Mengonversi loss ke unit berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "FP16 has limited range and small gradients may underflow to zero. Loss scaling multiplies loss by a large factor (e.g., 1024) before backward pass, then unscales gradients before optimizer step.",
        explanationID: "FP16 memiliki rentang terbatas dan gradien kecil mungkin underflow ke nol. Loss scaling mengalikan loss dengan faktor besar (misal, 1024) sebelum backward pass, lalu unscale gradien sebelum langkah optimizer.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "loss_049",
        questionEN: "What is the role of the momentum term in SGD?",
        questionID: "Apa peran term momentum dalam SGD?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulate past gradients to smooth updates and escape local minima", textID: "Mengakumulasi gradien masa lalu untuk menghaluskan update dan keluar dari local minima"),
            QuestionOption(id: "b", textEN: "Increase learning rate automatically", textID: "Meningkatkan learning rate secara otomatis"),
            QuestionOption(id: "c", textEN: "Reduce memory usage", textID: "Mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "Normalize gradients", textID: "Menormalisasi gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Momentum adds fraction (β) of previous update to current: v_t = βv_{t-1} + g_t. This accelerates consistent gradient directions and dampens oscillations.",
        explanationID: "Momentum menambahkan fraksi (β) dari update sebelumnya ke saat ini: v_t = βv_{t-1} + g_t. Ini mempercepat arah gradien yang konsisten dan meredam osilasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "loss_050",
        questionEN: "What determines if training converges to a good solution?",
        questionID: "Apa yang menentukan apakah training konvergen ke solusi yang baik?",
        options: [
            QuestionOption(id: "a", textEN: "Combination of learning rate, initialization, architecture, and data", textID: "Kombinasi learning rate, inisialisasi, arsitektur, dan data"),
            QuestionOption(id: "b", textEN: "Only the learning rate", textID: "Hanya learning rate"),
            QuestionOption(id: "c", textEN: "Only the model architecture", textID: "Hanya arsitektur model"),
            QuestionOption(id: "d", textEN: "Only the amount of data", textID: "Hanya jumlah data")
        ],
        correctOptionId: "a",
        explanationEN: "Successful training depends on many interacting factors: appropriate learning rate schedule, good initialization, suitable architecture for the task, sufficient quality data, and proper regularization.",
        explanationID: "Training yang sukses bergantung pada banyak faktor yang berinteraksi: jadwal learning rate yang sesuai, inisialisasi yang baik, arsitektur yang cocok untuk tugas, data berkualitas yang cukup, dan regularisasi yang tepat.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
