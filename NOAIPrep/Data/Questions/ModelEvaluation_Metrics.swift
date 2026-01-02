import Foundation

// MARK: - Model Evaluation & Metrics Questions (50)
// Topics: Metrics, Confusion Matrix, ROC/AUC, Cross-Validation, Overfitting
// Aligned with IOAI/NOAI Syllabus

let modelEvaluationQuestions: [Question] = [
    // MARK: - Classification Metrics (Questions 1-15)
    Question(
        id: "eval_001",
        questionEN: "What is accuracy in classification?",
        questionID: "Apa itu akurasi dalam klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "Number of correct predictions divided by total predictions", textID: "Jumlah prediksi benar dibagi total prediksi"),
            QuestionOption(id: "b", textEN: "Number of true positives only", textID: "Jumlah true positive saja"),
            QuestionOption(id: "c", textEN: "The precision of the model", textID: "Presisi model"),
            QuestionOption(id: "d", textEN: "The recall of the model", textID: "Recall model")
        ],
        correctOptionId: "a",
        explanationEN: "Accuracy = (TP + TN) / (TP + TN + FP + FN) = correct predictions / total predictions. Simple but can be misleading for imbalanced datasets.",
        explanationID: "Akurasi = (TP + TN) / (TP + TN + FP + FN) = prediksi benar / total prediksi. Sederhana tapi bisa menyesatkan untuk dataset tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_002",
        questionEN: "What is precision?",
        questionID: "Apa itu presisi?",
        options: [
            QuestionOption(id: "a", textEN: "TP / (TP + FP) - of predicted positives, how many are actually positive", textID: "TP / (TP + FP) - dari prediksi positif, berapa yang benar positif"),
            QuestionOption(id: "b", textEN: "TP / (TP + FN)", textID: "TP / (TP + FN)"),
            QuestionOption(id: "c", textEN: "TN / (TN + FP)", textID: "TN / (TN + FP)"),
            QuestionOption(id: "d", textEN: "(TP + TN) / Total", textID: "(TP + TN) / Total")
        ],
        correctOptionId: "a",
        explanationEN: "Precision = TP / (TP + FP). It answers: 'Of all predicted positives, what fraction are truly positive?' High precision means few false positives.",
        explanationID: "Presisi = TP / (TP + FP). Menjawab: 'Dari semua prediksi positif, berapa fraksi yang benar-benar positif?' Presisi tinggi berarti sedikit false positive.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_003",
        questionEN: "What is recall (sensitivity)?",
        questionID: "Apa itu recall (sensitivitas)?",
        options: [
            QuestionOption(id: "a", textEN: "TP / (TP + FN) - of actual positives, how many were correctly identified", textID: "TP / (TP + FN) - dari positif aktual, berapa yang teridentifikasi benar"),
            QuestionOption(id: "b", textEN: "TP / (TP + FP)", textID: "TP / (TP + FP)"),
            QuestionOption(id: "c", textEN: "TN / (TN + FN)", textID: "TN / (TN + FN)"),
            QuestionOption(id: "d", textEN: "FP / (FP + TN)", textID: "FP / (FP + TN)")
        ],
        correctOptionId: "a",
        explanationEN: "Recall = TP / (TP + FN). It answers: 'Of all actual positives, what fraction did we correctly identify?' High recall means few false negatives.",
        explanationID: "Recall = TP / (TP + FN). Menjawab: 'Dari semua positif aktual, berapa fraksi yang kita identifikasi dengan benar?' Recall tinggi berarti sedikit false negative.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_004",
        questionEN: "What is the F1 score?",
        questionID: "Apa itu F1 score?",
        options: [
            QuestionOption(id: "a", textEN: "Harmonic mean of precision and recall: 2 × (P × R) / (P + R)", textID: "Rata-rata harmonik presisi dan recall: 2 × (P × R) / (P + R)"),
            QuestionOption(id: "b", textEN: "Arithmetic mean of precision and recall: (P + R) / 2", textID: "Rata-rata aritmatika presisi dan recall: (P + R) / 2"),
            QuestionOption(id: "c", textEN: "Geometric mean of precision and recall", textID: "Rata-rata geometrik presisi dan recall"),
            QuestionOption(id: "d", textEN: "The maximum of precision and recall", textID: "Maksimum dari presisi dan recall")
        ],
        correctOptionId: "a",
        explanationEN: "F1 = 2PR/(P+R) is the harmonic mean. It balances precision and recall - high F1 requires both to be high. More useful than accuracy for imbalanced classes.",
        explanationID: "F1 = 2PR/(P+R) adalah rata-rata harmonik. Menyeimbangkan presisi dan recall - F1 tinggi membutuhkan keduanya tinggi. Lebih berguna daripada akurasi untuk kelas tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_005",
        questionEN: "In a confusion matrix for binary classification, what does the top-left cell represent?",
        questionID: "Dalam confusion matrix untuk klasifikasi biner, apa yang direpresentasikan sel kiri atas?",
        options: [
            QuestionOption(id: "a", textEN: "True Negatives (TN) - correctly predicted negatives", textID: "True Negatives (TN) - negatif yang diprediksi benar"),
            QuestionOption(id: "b", textEN: "True Positives (TP)", textID: "True Positives (TP)"),
            QuestionOption(id: "c", textEN: "False Positives (FP)", textID: "False Positives (FP)"),
            QuestionOption(id: "d", textEN: "False Negatives (FN)", textID: "False Negatives (FN)")
        ],
        correctOptionId: "a",
        explanationEN: "Standard confusion matrix: rows = actual, columns = predicted. Top-left = actual negative, predicted negative = True Negative (TN). Some conventions swap this.",
        explanationID: "Confusion matrix standar: baris = aktual, kolom = prediksi. Kiri atas = negatif aktual, prediksi negatif = True Negative (TN). Beberapa konvensi menukarnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_006",
        questionEN: "What is a False Positive (Type I error)?",
        questionID: "Apa itu False Positive (kesalahan Tipe I)?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting positive when the actual class is negative", textID: "Memprediksi positif ketika kelas aktual negatif"),
            QuestionOption(id: "b", textEN: "Predicting negative when actual is positive", textID: "Memprediksi negatif ketika aktual positif"),
            QuestionOption(id: "c", textEN: "Correctly predicting positive", textID: "Memprediksi positif dengan benar"),
            QuestionOption(id: "d", textEN: "Correctly predicting negative", textID: "Memprediksi negatif dengan benar")
        ],
        correctOptionId: "a",
        explanationEN: "False Positive (FP) = predicting positive for an actually negative sample. Type I error. Example: healthy patient diagnosed with disease (false alarm).",
        explanationID: "False Positive (FP) = memprediksi positif untuk sampel yang sebenarnya negatif. Kesalahan Tipe I. Contoh: pasien sehat didiagnosis penyakit (alarm palsu).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_007",
        questionEN: "What is a False Negative (Type II error)?",
        questionID: "Apa itu False Negative (kesalahan Tipe II)?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting negative when the actual class is positive", textID: "Memprediksi negatif ketika kelas aktual positif"),
            QuestionOption(id: "b", textEN: "Predicting positive when actual is negative", textID: "Memprediksi positif ketika aktual negatif"),
            QuestionOption(id: "c", textEN: "Correctly predicting negative", textID: "Memprediksi negatif dengan benar"),
            QuestionOption(id: "d", textEN: "Correctly predicting positive", textID: "Memprediksi positif dengan benar")
        ],
        correctOptionId: "a",
        explanationEN: "False Negative (FN) = predicting negative for an actually positive sample. Type II error. Example: missing a disease diagnosis in a sick patient.",
        explanationID: "False Negative (FN) = memprediksi negatif untuk sampel yang sebenarnya positif. Kesalahan Tipe II. Contoh: tidak mendiagnosis penyakit pada pasien yang sakit.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_008",
        questionEN: "What is specificity (True Negative Rate)?",
        questionID: "Apa itu specificity (True Negative Rate)?",
        options: [
            QuestionOption(id: "a", textEN: "TN / (TN + FP) - of actual negatives, how many were correctly identified", textID: "TN / (TN + FP) - dari negatif aktual, berapa yang teridentifikasi benar"),
            QuestionOption(id: "b", textEN: "TP / (TP + FN)", textID: "TP / (TP + FN)"),
            QuestionOption(id: "c", textEN: "TP / (TP + FP)", textID: "TP / (TP + FP)"),
            QuestionOption(id: "d", textEN: "FN / (FN + TP)", textID: "FN / (FN + TP)")
        ],
        correctOptionId: "a",
        explanationEN: "Specificity = TN / (TN + FP). It answers: 'Of all actual negatives, what fraction did we correctly identify as negative?' 1 - Specificity = False Positive Rate.",
        explanationID: "Specificity = TN / (TN + FP). Menjawab: 'Dari semua negatif aktual, berapa fraksi yang kita identifikasi dengan benar sebagai negatif?' 1 - Specificity = False Positive Rate.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_009",
        questionEN: "What is the ROC curve?",
        questionID: "Apa itu kurva ROC?",
        options: [
            QuestionOption(id: "a", textEN: "Plot of True Positive Rate vs False Positive Rate at various thresholds", textID: "Plot True Positive Rate vs False Positive Rate pada berbagai threshold"),
            QuestionOption(id: "b", textEN: "Plot of precision vs recall", textID: "Plot presisi vs recall"),
            QuestionOption(id: "c", textEN: "Plot of accuracy vs threshold", textID: "Plot akurasi vs threshold"),
            QuestionOption(id: "d", textEN: "Plot of loss vs epochs", textID: "Plot loss vs epoch")
        ],
        correctOptionId: "a",
        explanationEN: "ROC (Receiver Operating Characteristic) plots TPR (recall) vs FPR (1-specificity) at different classification thresholds. A good classifier has the curve toward the top-left corner.",
        explanationID: "ROC (Receiver Operating Characteristic) memplot TPR (recall) vs FPR (1-specificity) pada threshold klasifikasi berbeda. Classifier yang baik memiliki kurva mendekati sudut kiri atas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_010",
        questionEN: "What does AUC-ROC measure?",
        questionID: "Apa yang diukur AUC-ROC?",
        options: [
            QuestionOption(id: "a", textEN: "Area under the ROC curve - probability that a random positive is ranked higher than a random negative", textID: "Area di bawah kurva ROC - probabilitas bahwa positif acak diberi ranking lebih tinggi dari negatif acak"),
            QuestionOption(id: "b", textEN: "The accuracy of the model", textID: "Akurasi model"),
            QuestionOption(id: "c", textEN: "The precision at recall=0.5", textID: "Presisi pada recall=0.5"),
            QuestionOption(id: "d", textEN: "The F1 score", textID: "F1 score")
        ],
        correctOptionId: "a",
        explanationEN: "AUC-ROC ranges from 0 to 1. AUC = 0.5 is random guessing (diagonal line). AUC = 1 is perfect classification. It measures ranking ability regardless of threshold choice.",
        explanationID: "AUC-ROC berkisar dari 0 sampai 1. AUC = 0.5 adalah tebakan acak (garis diagonal). AUC = 1 adalah klasifikasi sempurna. Mengukur kemampuan ranking tanpa tergantung pilihan threshold.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_011",
        questionEN: "Why is accuracy misleading for imbalanced datasets?",
        questionID: "Mengapa akurasi menyesatkan untuk dataset tidak seimbang?",
        options: [
            QuestionOption(id: "a", textEN: "A classifier predicting only the majority class achieves high accuracy but is useless", textID: "Classifier yang hanya memprediksi kelas mayoritas mendapat akurasi tinggi tapi tidak berguna"),
            QuestionOption(id: "b", textEN: "Accuracy can be greater than 1", textID: "Akurasi bisa lebih besar dari 1"),
            QuestionOption(id: "c", textEN: "Accuracy is always 50%", textID: "Akurasi selalu 50%"),
            QuestionOption(id: "d", textEN: "Imbalanced datasets have higher accuracy", textID: "Dataset tidak seimbang memiliki akurasi lebih tinggi")
        ],
        correctOptionId: "a",
        explanationEN: "With 99% negative samples, always predicting negative gives 99% accuracy but 0% recall for positives. Use precision, recall, F1, or AUC for imbalanced datasets.",
        explanationID: "Dengan 99% sampel negatif, selalu memprediksi negatif memberikan akurasi 99% tapi 0% recall untuk positif. Gunakan presisi, recall, F1, atau AUC untuk dataset tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_012",
        questionEN: "What is the precision-recall curve?",
        questionID: "Apa itu kurva precision-recall?",
        options: [
            QuestionOption(id: "a", textEN: "Plot of precision vs recall at various thresholds, useful for imbalanced datasets", textID: "Plot presisi vs recall pada berbagai threshold, berguna untuk dataset tidak seimbang"),
            QuestionOption(id: "b", textEN: "The same as ROC curve", textID: "Sama dengan kurva ROC"),
            QuestionOption(id: "c", textEN: "Plot of accuracy vs F1", textID: "Plot akurasi vs F1"),
            QuestionOption(id: "d", textEN: "Plot of loss vs epochs", textID: "Plot loss vs epoch")
        ],
        correctOptionId: "a",
        explanationEN: "PR curve plots precision (y) vs recall (x) at different thresholds. More informative than ROC for imbalanced data since it doesn't include TN (which dominate in imbalanced cases).",
        explanationID: "Kurva PR memplot presisi (y) vs recall (x) pada threshold berbeda. Lebih informatif daripada ROC untuk data tidak seimbang karena tidak menyertakan TN (yang mendominasi dalam kasus tidak seimbang).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_013",
        questionEN: "What is macro-averaged F1 for multi-class classification?",
        questionID: "Apa itu macro-averaged F1 untuk klasifikasi multi-kelas?",
        options: [
            QuestionOption(id: "a", textEN: "Average of per-class F1 scores, treating all classes equally", textID: "Rata-rata skor F1 per kelas, memperlakukan semua kelas sama"),
            QuestionOption(id: "b", textEN: "F1 computed on all samples together", textID: "F1 dihitung pada semua sampel bersama"),
            QuestionOption(id: "c", textEN: "F1 weighted by class size", textID: "F1 berbobot berdasarkan ukuran kelas"),
            QuestionOption(id: "d", textEN: "Maximum F1 across classes", textID: "F1 maksimum di seluruh kelas")
        ],
        correctOptionId: "a",
        explanationEN: "Macro F1 = (F1_class1 + F1_class2 + ... + F1_classK) / K. Each class contributes equally regardless of size. Good when all classes are equally important.",
        explanationID: "Macro F1 = (F1_kelas1 + F1_kelas2 + ... + F1_kelasK) / K. Setiap kelas berkontribusi sama tanpa memandang ukuran. Baik ketika semua kelas sama pentingnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_014",
        questionEN: "What is weighted F1 for multi-class classification?",
        questionID: "Apa itu weighted F1 untuk klasifikasi multi-kelas?",
        options: [
            QuestionOption(id: "a", textEN: "F1 scores weighted by the number of samples in each class", textID: "Skor F1 berbobot berdasarkan jumlah sampel di setiap kelas"),
            QuestionOption(id: "b", textEN: "F1 with adjusted weights", textID: "F1 dengan bobot yang disesuaikan"),
            QuestionOption(id: "c", textEN: "Macro F1 multiplied by accuracy", textID: "Macro F1 dikalikan akurasi"),
            QuestionOption(id: "d", textEN: "F1 for weighted data", textID: "F1 untuk data berbobot")
        ],
        correctOptionId: "a",
        explanationEN: "Weighted F1 = Σ(n_class × F1_class) / Σn_class. Classes with more samples contribute more. Good when class proportions matter.",
        explanationID: "Weighted F1 = Σ(n_kelas × F1_kelas) / Σn_kelas. Kelas dengan lebih banyak sampel berkontribusi lebih besar. Baik ketika proporsi kelas penting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_015",
        questionEN: "What is micro-averaged precision?",
        questionID: "Apa itu micro-averaged precision?",
        options: [
            QuestionOption(id: "a", textEN: "Total TP / (Total TP + Total FP) - aggregating across all classes first", textID: "Total TP / (Total TP + Total FP) - mengagregasi semua kelas terlebih dahulu"),
            QuestionOption(id: "b", textEN: "Average precision per class", textID: "Rata-rata presisi per kelas"),
            QuestionOption(id: "c", textEN: "Minimum precision", textID: "Presisi minimum"),
            QuestionOption(id: "d", textEN: "Precision for the largest class", textID: "Presisi untuk kelas terbesar")
        ],
        correctOptionId: "a",
        explanationEN: "Micro precision aggregates all TPs and FPs first, then computes precision. In multi-class, micro precision = micro recall = micro F1 = accuracy.",
        explanationID: "Micro precision mengagregasi semua TP dan FP terlebih dahulu, kemudian menghitung presisi. Dalam multi-kelas, micro precision = micro recall = micro F1 = akurasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Regression Metrics (Questions 16-22)
    Question(
        id: "eval_016",
        questionEN: "What is Mean Squared Error (MSE)?",
        questionID: "Apa itu Mean Squared Error (MSE)?",
        options: [
            QuestionOption(id: "a", textEN: "MSE = (1/n) Σ(yᵢ - ŷᵢ)² - average of squared differences", textID: "MSE = (1/n) Σ(yᵢ - ŷᵢ)² - rata-rata selisih kuadrat"),
            QuestionOption(id: "b", textEN: "MSE = (1/n) Σ|yᵢ - ŷᵢ|", textID: "MSE = (1/n) Σ|yᵢ - ŷᵢ|"),
            QuestionOption(id: "c", textEN: "MSE = max(yᵢ - ŷᵢ)", textID: "MSE = max(yᵢ - ŷᵢ)"),
            QuestionOption(id: "d", textEN: "MSE = Σ(yᵢ - ŷᵢ)", textID: "MSE = Σ(yᵢ - ŷᵢ)")
        ],
        correctOptionId: "a",
        explanationEN: "MSE = (1/n)Σ(y - ŷ)² is the average squared error. It penalizes large errors more due to squaring. Units are squared units of y.",
        explanationID: "MSE = (1/n)Σ(y - ŷ)² adalah rata-rata kesalahan kuadrat. Menghukum kesalahan besar lebih karena pengkuadratan. Satuannya adalah satuan kuadrat dari y.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_017",
        questionEN: "What is RMSE and why is it often preferred over MSE?",
        questionID: "Apa itu RMSE dan mengapa sering lebih disukai daripada MSE?",
        options: [
            QuestionOption(id: "a", textEN: "√MSE - it has the same units as the target variable", textID: "√MSE - memiliki satuan yang sama dengan variabel target"),
            QuestionOption(id: "b", textEN: "MSE / 2 - it's smaller", textID: "MSE / 2 - lebih kecil"),
            QuestionOption(id: "c", textEN: "MSE² - it penalizes more", textID: "MSE² - menghukum lebih"),
            QuestionOption(id: "d", textEN: "log(MSE) - it's always positive", textID: "log(MSE) - selalu positif")
        ],
        correctOptionId: "a",
        explanationEN: "RMSE = √MSE has the same units as y, making it more interpretable. If predicting house prices in dollars, RMSE is in dollars, while MSE is in dollars².",
        explanationID: "RMSE = √MSE memiliki satuan yang sama dengan y, membuatnya lebih mudah diinterpretasi. Jika memprediksi harga rumah dalam dolar, RMSE dalam dolar, sedangkan MSE dalam dolar².",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_018",
        questionEN: "What is Mean Absolute Error (MAE)?",
        questionID: "Apa itu Mean Absolute Error (MAE)?",
        options: [
            QuestionOption(id: "a", textEN: "MAE = (1/n) Σ|yᵢ - ŷᵢ| - average of absolute differences", textID: "MAE = (1/n) Σ|yᵢ - ŷᵢ| - rata-rata selisih absolut"),
            QuestionOption(id: "b", textEN: "MAE = (1/n) Σ(yᵢ - ŷᵢ)²", textID: "MAE = (1/n) Σ(yᵢ - ŷᵢ)²"),
            QuestionOption(id: "c", textEN: "MAE = max|yᵢ - ŷᵢ|", textID: "MAE = max|yᵢ - ŷᵢ|"),
            QuestionOption(id: "d", textEN: "MAE = Σ(yᵢ - ŷᵢ)", textID: "MAE = Σ(yᵢ - ŷᵢ)")
        ],
        correctOptionId: "a",
        explanationEN: "MAE = (1/n)Σ|y - ŷ| is the average absolute error. Unlike MSE, it doesn't square errors, making it more robust to outliers. Same units as y.",
        explanationID: "MAE = (1/n)Σ|y - ŷ| adalah rata-rata kesalahan absolut. Tidak seperti MSE, tidak mengkuadratkan kesalahan, membuatnya lebih robust terhadap outlier. Satuan sama dengan y.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_019",
        questionEN: "What is R² (coefficient of determination)?",
        questionID: "Apa itu R² (koefisien determinasi)?",
        options: [
            QuestionOption(id: "a", textEN: "R² = 1 - SS_res/SS_tot - proportion of variance explained by the model", textID: "R² = 1 - SS_res/SS_tot - proporsi variansi yang dijelaskan oleh model"),
            QuestionOption(id: "b", textEN: "R² = MSE × n", textID: "R² = MSE × n"),
            QuestionOption(id: "c", textEN: "R² = correlation coefficient", textID: "R² = koefisien korelasi"),
            QuestionOption(id: "d", textEN: "R² = accuracy for regression", textID: "R² = akurasi untuk regresi")
        ],
        correctOptionId: "a",
        explanationEN: "R² = 1 - Σ(y-ŷ)²/Σ(y-ȳ)² measures how much variance the model explains. R²=1 is perfect. R²=0 means model is as good as predicting the mean. Can be negative if worse than mean.",
        explanationID: "R² = 1 - Σ(y-ŷ)²/Σ(y-ȳ)² mengukur berapa banyak variansi yang dijelaskan model. R²=1 sempurna. R²=0 berarti model sama baiknya dengan memprediksi rata-rata. Bisa negatif jika lebih buruk dari rata-rata.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_020",
        questionEN: "What is the difference between MSE and MAE sensitivity to outliers?",
        questionID: "Apa perbedaan sensitivitas MSE dan MAE terhadap outlier?",
        options: [
            QuestionOption(id: "a", textEN: "MSE penalizes outliers more heavily due to squaring; MAE is more robust", textID: "MSE menghukum outlier lebih berat karena pengkuadratan; MAE lebih robust"),
            QuestionOption(id: "b", textEN: "MAE penalizes outliers more", textID: "MAE menghukum outlier lebih"),
            QuestionOption(id: "c", textEN: "They are equally sensitive", textID: "Keduanya sama sensitifnya"),
            QuestionOption(id: "d", textEN: "Neither is affected by outliers", textID: "Keduanya tidak terpengaruh outlier")
        ],
        correctOptionId: "a",
        explanationEN: "MSE squares errors, so large errors (outliers) have disproportionate impact. MAE uses absolute values, treating all errors linearly. For outlier-prone data, MAE or robust metrics are preferred.",
        explanationID: "MSE mengkuadratkan kesalahan, jadi kesalahan besar (outlier) memiliki dampak tidak proporsional. MAE menggunakan nilai absolut, memperlakukan semua kesalahan secara linear. Untuk data rawan outlier, MAE atau metrik robust lebih disukai.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_021",
        questionEN: "What is MAPE (Mean Absolute Percentage Error)?",
        questionID: "Apa itu MAPE (Mean Absolute Percentage Error)?",
        options: [
            QuestionOption(id: "a", textEN: "MAPE = (100/n) Σ|yᵢ - ŷᵢ|/|yᵢ| - average percentage error", textID: "MAPE = (100/n) Σ|yᵢ - ŷᵢ|/|yᵢ| - rata-rata kesalahan persentase"),
            QuestionOption(id: "b", textEN: "MAPE = MAE × 100", textID: "MAPE = MAE × 100"),
            QuestionOption(id: "c", textEN: "MAPE = MSE in percentage", textID: "MAPE = MSE dalam persentase"),
            QuestionOption(id: "d", textEN: "MAPE = |MAE/mean(y)|", textID: "MAPE = |MAE/mean(y)|")
        ],
        correctOptionId: "a",
        explanationEN: "MAPE = (100%/n)Σ|y-ŷ|/|y| expresses error as a percentage. It's scale-independent but undefined when y=0 and symmetric issues exist. Use sMAPE for improvements.",
        explanationID: "MAPE = (100%/n)Σ|y-ŷ|/|y| mengekspresikan kesalahan sebagai persentase. Tidak bergantung skala tapi tidak terdefinisi ketika y=0 dan ada masalah simetri. Gunakan sMAPE untuk perbaikan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_022",
        questionEN: "What is Huber loss and when is it useful?",
        questionID: "Apa itu Huber loss dan kapan berguna?",
        options: [
            QuestionOption(id: "a", textEN: "A loss that is quadratic for small errors and linear for large errors - robust to outliers while differentiable", textID: "Loss yang kuadratik untuk kesalahan kecil dan linear untuk kesalahan besar - robust terhadap outlier sambil dapat didiferensiasikan"),
            QuestionOption(id: "b", textEN: "Always quadratic loss", textID: "Selalu loss kuadratik"),
            QuestionOption(id: "c", textEN: "Always linear loss", textID: "Selalu loss linear"),
            QuestionOption(id: "d", textEN: "Binary cross-entropy", textID: "Binary cross-entropy")
        ],
        correctOptionId: "a",
        explanationEN: "Huber loss: L(y,ŷ) = ½(y-ŷ)² if |y-ŷ| ≤ δ, else δ|y-ŷ| - δ²/2. It combines MSE's smooth gradient for small errors with MAE's robustness for large errors.",
        explanationID: "Huber loss: L(y,ŷ) = ½(y-ŷ)² jika |y-ŷ| ≤ δ, selainnya δ|y-ŷ| - δ²/2. Menggabungkan gradien halus MSE untuk kesalahan kecil dengan robustness MAE untuk kesalahan besar.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Train/Val/Test & Overfitting (Questions 23-32)
    Question(
        id: "eval_023",
        questionEN: "Why do we split data into train, validation, and test sets?",
        questionID: "Mengapa kita membagi data menjadi set train, validation, dan test?",
        options: [
            QuestionOption(id: "a", textEN: "Train for learning, validation for tuning hyperparameters, test for final unbiased evaluation", textID: "Train untuk belajar, validation untuk tuning hyperparameter, test untuk evaluasi final yang tidak bias"),
            QuestionOption(id: "b", textEN: "More data means better accuracy", textID: "Lebih banyak data berarti akurasi lebih baik"),
            QuestionOption(id: "c", textEN: "It's required by the algorithm", textID: "Diperlukan oleh algoritma"),
            QuestionOption(id: "d", textEN: "To speed up training", textID: "Untuk mempercepat pelatihan")
        ],
        correctOptionId: "a",
        explanationEN: "Training set: fit model parameters. Validation set: tune hyperparameters, model selection. Test set: final evaluation on unseen data. Never use test set for any decisions during development!",
        explanationID: "Training set: fit parameter model. Validation set: tune hyperparameter, pemilihan model. Test set: evaluasi final pada data yang belum dilihat. Jangan pernah gunakan test set untuk keputusan apapun selama pengembangan!",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_024",
        questionEN: "What is overfitting?",
        questionID: "Apa itu overfitting?",
        options: [
            QuestionOption(id: "a", textEN: "Model performs well on training data but poorly on unseen data", textID: "Model berkinerja baik pada data training tapi buruk pada data yang belum dilihat"),
            QuestionOption(id: "b", textEN: "Model performs poorly on all data", textID: "Model berkinerja buruk pada semua data"),
            QuestionOption(id: "c", textEN: "Model is too simple", textID: "Model terlalu sederhana"),
            QuestionOption(id: "d", textEN: "Model trains too slowly", textID: "Model berlatih terlalu lambat")
        ],
        correctOptionId: "a",
        explanationEN: "Overfitting = high variance. The model memorizes training data including noise, failing to generalize. Signs: large gap between train and validation performance, training loss keeps decreasing while val loss increases.",
        explanationID: "Overfitting = variansi tinggi. Model menghafal data training termasuk noise, gagal menggeneralisasi. Tanda: gap besar antara performa train dan validation, loss training terus menurun sementara loss val meningkat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_025",
        questionEN: "What is underfitting?",
        questionID: "Apa itu underfitting?",
        options: [
            QuestionOption(id: "a", textEN: "Model is too simple to capture the underlying pattern - poor performance on both train and test", textID: "Model terlalu sederhana untuk menangkap pola dasar - performa buruk pada train dan test"),
            QuestionOption(id: "b", textEN: "Model performs too well", textID: "Model berkinerja terlalu baik"),
            QuestionOption(id: "c", textEN: "Model trains too long", textID: "Model berlatih terlalu lama"),
            QuestionOption(id: "d", textEN: "Model has too many parameters", textID: "Model memiliki terlalu banyak parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Underfitting = high bias. The model is too simple to capture data patterns. Signs: poor performance on both training and validation data. Solution: more complex model, more features.",
        explanationID: "Underfitting = bias tinggi. Model terlalu sederhana untuk menangkap pola data. Tanda: performa buruk pada data training dan validation. Solusi: model lebih kompleks, lebih banyak fitur.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_026",
        questionEN: "What is the bias-variance tradeoff?",
        questionID: "Apa itu tradeoff bias-variance?",
        options: [
            QuestionOption(id: "a", textEN: "Simple models have high bias/low variance; complex models have low bias/high variance", textID: "Model sederhana memiliki bias tinggi/variansi rendah; model kompleks memiliki bias rendah/variansi tinggi"),
            QuestionOption(id: "b", textEN: "Bias and variance always decrease together", textID: "Bias dan variansi selalu menurun bersamaan"),
            QuestionOption(id: "c", textEN: "They are independent", textID: "Keduanya independen"),
            QuestionOption(id: "d", textEN: "More data increases both", textID: "Lebih banyak data meningkatkan keduanya")
        ],
        correctOptionId: "a",
        explanationEN: "Bias: error from simplifying assumptions (underfitting). Variance: error from sensitivity to training data (overfitting). Total error = bias² + variance + noise. Finding the sweet spot is key.",
        explanationID: "Bias: kesalahan dari asumsi penyederhanaan (underfitting). Variance: kesalahan dari sensitivitas terhadap data training (overfitting). Total error = bias² + variance + noise. Menemukan titik optimal adalah kunci.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_027",
        questionEN: "What is k-fold cross-validation?",
        questionID: "Apa itu k-fold cross-validation?",
        options: [
            QuestionOption(id: "a", textEN: "Splitting data into k folds, training on k-1 folds and validating on 1, rotating k times", textID: "Membagi data menjadi k fold, training pada k-1 fold dan validasi pada 1, berputar k kali"),
            QuestionOption(id: "b", textEN: "Training k different models", textID: "Melatih k model berbeda"),
            QuestionOption(id: "c", textEN: "Using k test sets", textID: "Menggunakan k set test"),
            QuestionOption(id: "d", textEN: "Repeating training k times with same split", textID: "Mengulangi training k kali dengan split yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "K-fold CV: divide data into k folds, use each fold as validation once while training on the rest. Average results over k runs. Common: 5-fold, 10-fold. More reliable than single train/val split.",
        explanationID: "K-fold CV: bagi data menjadi k fold, gunakan setiap fold sebagai validation sekali sambil training pada sisanya. Rata-ratakan hasil dari k run. Umum: 5-fold, 10-fold. Lebih andal daripada satu split train/val.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_028",
        questionEN: "What is stratified cross-validation?",
        questionID: "Apa itu stratified cross-validation?",
        options: [
            QuestionOption(id: "a", textEN: "K-fold where each fold preserves the class distribution of the original data", textID: "K-fold dimana setiap fold mempertahankan distribusi kelas dari data asli"),
            QuestionOption(id: "b", textEN: "Using more folds", textID: "Menggunakan lebih banyak fold"),
            QuestionOption(id: "c", textEN: "Random splitting", textID: "Pembagian acak"),
            QuestionOption(id: "d", textEN: "Only for regression", textID: "Hanya untuk regresi")
        ],
        correctOptionId: "a",
        explanationEN: "Stratified k-fold ensures each fold has roughly the same percentage of samples for each class. Essential for imbalanced datasets where random splits might create folds with missing classes.",
        explanationID: "Stratified k-fold memastikan setiap fold memiliki persentase sampel yang kurang lebih sama untuk setiap kelas. Penting untuk dataset tidak seimbang dimana split acak mungkin membuat fold dengan kelas yang hilang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_029",
        questionEN: "What is leave-one-out cross-validation (LOOCV)?",
        questionID: "Apa itu leave-one-out cross-validation (LOOCV)?",
        options: [
            QuestionOption(id: "a", textEN: "K-fold where k = n (each sample is a test set once)", textID: "K-fold dimana k = n (setiap sampel menjadi test set sekali)"),
            QuestionOption(id: "b", textEN: "Removing one feature", textID: "Menghapus satu fitur"),
            QuestionOption(id: "c", textEN: "Using one sample for training", textID: "Menggunakan satu sampel untuk training"),
            QuestionOption(id: "d", textEN: "Dropping one class", textID: "Menghapus satu kelas")
        ],
        correctOptionId: "a",
        explanationEN: "LOOCV: train on n-1 samples, test on 1, repeat n times. Maximum use of data but computationally expensive and high variance in estimates. Use when data is very limited.",
        explanationID: "LOOCV: train pada n-1 sampel, test pada 1, ulangi n kali. Penggunaan data maksimal tapi mahal secara komputasi dan variansi tinggi dalam estimasi. Gunakan ketika data sangat terbatas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_030",
        questionEN: "What is data leakage?",
        questionID: "Apa itu data leakage?",
        options: [
            QuestionOption(id: "a", textEN: "When information from test data inadvertently influences training, leading to overly optimistic results", textID: "Ketika informasi dari data test secara tidak sengaja mempengaruhi training, menghasilkan hasil yang terlalu optimis"),
            QuestionOption(id: "b", textEN: "Losing data during preprocessing", textID: "Kehilangan data selama preprocessing"),
            QuestionOption(id: "c", textEN: "Data security breach", textID: "Pelanggaran keamanan data"),
            QuestionOption(id: "d", textEN: "Corrupted data files", textID: "File data yang rusak")
        ],
        correctOptionId: "a",
        explanationEN: "Data leakage occurs when future information leaks into training (time-series), or when preprocessing uses test data (fit scaler on all data). Results look good but model fails on truly new data.",
        explanationID: "Data leakage terjadi ketika informasi masa depan bocor ke training (time-series), atau ketika preprocessing menggunakan data test (fit scaler pada semua data). Hasil terlihat bagus tapi model gagal pada data yang benar-benar baru.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_031",
        questionEN: "What is early stopping?",
        questionID: "Apa itu early stopping?",
        options: [
            QuestionOption(id: "a", textEN: "Stopping training when validation performance stops improving to prevent overfitting", textID: "Menghentikan training ketika performa validation berhenti meningkat untuk mencegah overfitting"),
            QuestionOption(id: "b", textEN: "Stopping training early to save time", textID: "Menghentikan training lebih awal untuk menghemat waktu"),
            QuestionOption(id: "c", textEN: "Reducing learning rate", textID: "Mengurangi learning rate"),
            QuestionOption(id: "d", textEN: "Using fewer epochs", textID: "Menggunakan lebih sedikit epoch")
        ],
        correctOptionId: "a",
        explanationEN: "Early stopping monitors validation loss/metric. Training stops when val performance hasn't improved for 'patience' epochs. It's a form of regularization that prevents overfitting without modifying the model.",
        explanationID: "Early stopping memonitor loss/metrik validation. Training berhenti ketika performa val tidak meningkat selama 'patience' epoch. Ini adalah bentuk regularisasi yang mencegah overfitting tanpa memodifikasi model.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_032",
        questionEN: "What is the typical train/validation/test split ratio?",
        questionID: "Berapa rasio split train/validation/test yang umum?",
        options: [
            QuestionOption(id: "a", textEN: "60-80% train, 10-20% validation, 10-20% test (varies by data size)", textID: "60-80% train, 10-20% validation, 10-20% test (bervariasi berdasarkan ukuran data)"),
            QuestionOption(id: "b", textEN: "33% each", textID: "33% masing-masing"),
            QuestionOption(id: "c", textEN: "90% train, 5% val, 5% test always", textID: "90% train, 5% val, 5% test selalu"),
            QuestionOption(id: "d", textEN: "50% train, 50% test only", textID: "50% train, 50% test saja")
        ],
        correctOptionId: "a",
        explanationEN: "Common splits: 70/15/15, 80/10/10. With very large data (millions), even 1% test can be sufficient. With small data, use cross-validation. Always keep test set truly held out.",
        explanationID: "Split umum: 70/15/15, 80/10/10. Dengan data sangat besar (jutaan), bahkan 1% test bisa cukup. Dengan data kecil, gunakan cross-validation. Selalu jaga test set benar-benar terpisah.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // MARK: - Hyperparameter Tuning (Questions 33-40)
    Question(
        id: "eval_033",
        questionEN: "What are hyperparameters?",
        questionID: "Apa itu hyperparameter?",
        options: [
            QuestionOption(id: "a", textEN: "Parameters set before training that control the learning process (learning rate, layers, etc.)", textID: "Parameter yang diset sebelum training yang mengontrol proses pembelajaran (learning rate, layers, dll.)"),
            QuestionOption(id: "b", textEN: "Parameters learned during training", textID: "Parameter yang dipelajari selama training"),
            QuestionOption(id: "c", textEN: "The model weights", textID: "Bobot model"),
            QuestionOption(id: "d", textEN: "The input features", textID: "Fitur input")
        ],
        correctOptionId: "a",
        explanationEN: "Hyperparameters are set before training: learning rate, number of layers, batch size, regularization strength, etc. Unlike model parameters (weights), they're not learned from data.",
        explanationID: "Hyperparameter diset sebelum training: learning rate, jumlah layer, batch size, kekuatan regularisasi, dll. Tidak seperti parameter model (bobot), mereka tidak dipelajari dari data.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "eval_034",
        questionEN: "What is grid search?",
        questionID: "Apa itu grid search?",
        options: [
            QuestionOption(id: "a", textEN: "Exhaustively searching all combinations of specified hyperparameter values", textID: "Mencari secara menyeluruh semua kombinasi nilai hyperparameter yang ditentukan"),
            QuestionOption(id: "b", textEN: "Searching in a grid pattern on a map", textID: "Mencari dalam pola grid pada peta"),
            QuestionOption(id: "c", textEN: "Random selection of parameters", textID: "Pemilihan parameter secara acak"),
            QuestionOption(id: "d", textEN: "Gradient-based search", textID: "Pencarian berbasis gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Grid search tries every combination in a predefined grid. E.g., lr ∈ {0.1, 0.01, 0.001}, layers ∈ {2, 3} tries all 6 combinations. Exhaustive but expensive exponentially with more hyperparameters.",
        explanationID: "Grid search mencoba setiap kombinasi dalam grid yang telah ditentukan. Misal, lr ∈ {0.1, 0.01, 0.001}, layers ∈ {2, 3} mencoba semua 6 kombinasi. Menyeluruh tapi mahal secara eksponensial dengan lebih banyak hyperparameter.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_035",
        questionEN: "What is random search for hyperparameters?",
        questionID: "Apa itu random search untuk hyperparameter?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly sampling hyperparameter combinations from specified distributions", textID: "Mengambil sampel kombinasi hyperparameter secara acak dari distribusi yang ditentukan"),
            QuestionOption(id: "b", textEN: "Randomly initializing weights", textID: "Menginisialisasi bobot secara acak"),
            QuestionOption(id: "c", textEN: "Random data splitting", textID: "Pembagian data secara acak"),
            QuestionOption(id: "d", textEN: "Randomly selecting features", textID: "Memilih fitur secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Random search samples random combinations. Often more efficient than grid search - covers more of the important dimensions in the same time budget. Sample lr ~ loguniform(1e-5, 1e-1).",
        explanationID: "Random search mengambil sampel kombinasi acak. Sering lebih efisien daripada grid search - mencakup lebih banyak dimensi penting dalam budget waktu yang sama. Sampel lr ~ loguniform(1e-5, 1e-1).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_036",
        questionEN: "Why is random search often better than grid search?",
        questionID: "Mengapa random search sering lebih baik dari grid search?",
        options: [
            QuestionOption(id: "a", textEN: "It samples more values along each dimension, better exploring important hyperparameters", textID: "Mengambil sampel lebih banyak nilai di setiap dimensi, lebih baik mengeksplorasi hyperparameter penting"),
            QuestionOption(id: "b", textEN: "It's always faster", textID: "Selalu lebih cepat"),
            QuestionOption(id: "c", textEN: "It guarantees finding the optimum", textID: "Menjamin menemukan optimum"),
            QuestionOption(id: "d", textEN: "It uses less memory", textID: "Menggunakan lebih sedikit memori")
        ],
        correctOptionId: "a",
        explanationEN: "If some hyperparameters matter more than others, grid search wastes trials on unimportant ones. Random search samples more unique values along each dimension, better covering important parameters.",
        explanationID: "Jika beberapa hyperparameter lebih penting dari yang lain, grid search membuang percobaan pada yang tidak penting. Random search mengambil sampel nilai unik lebih banyak di setiap dimensi, lebih baik mencakup parameter penting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_037",
        questionEN: "What is Bayesian optimization for hyperparameters?",
        questionID: "Apa itu optimasi Bayesian untuk hyperparameter?",
        options: [
            QuestionOption(id: "a", textEN: "Using a probabilistic model to guide the search, balancing exploration and exploitation", textID: "Menggunakan model probabilistik untuk memandu pencarian, menyeimbangkan eksplorasi dan eksploitasi"),
            QuestionOption(id: "b", textEN: "Using Bayes' theorem for classification", textID: "Menggunakan teorema Bayes untuk klasifikasi"),
            QuestionOption(id: "c", textEN: "Random sampling with Bayesian priors", textID: "Pengambilan sampel acak dengan prior Bayesian"),
            QuestionOption(id: "d", textEN: "Training a Bayesian neural network", textID: "Melatih neural network Bayesian")
        ],
        correctOptionId: "a",
        explanationEN: "Bayesian optimization builds a surrogate model (e.g., Gaussian Process) of the objective function, using it to select promising hyperparameters. More sample-efficient than grid/random search for expensive evaluations.",
        explanationID: "Optimasi Bayesian membangun model surrogate (misal, Gaussian Process) dari fungsi objektif, menggunakannya untuk memilih hyperparameter yang menjanjikan. Lebih efisien sampel daripada grid/random search untuk evaluasi mahal.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_038",
        questionEN: "What should you tune on: training set, validation set, or test set?",
        questionID: "Pada set mana hyperparameter harus di-tune: training, validation, atau test?",
        options: [
            QuestionOption(id: "a", textEN: "Validation set - never touch the test set until final evaluation", textID: "Validation set - jangan pernah sentuh test set sampai evaluasi final"),
            QuestionOption(id: "b", textEN: "Test set for best results", textID: "Test set untuk hasil terbaik"),
            QuestionOption(id: "c", textEN: "Training set", textID: "Training set"),
            QuestionOption(id: "d", textEN: "All three sets", textID: "Ketiga set")
        ],
        correctOptionId: "a",
        explanationEN: "Always tune hyperparameters on the validation set. The test set must remain completely untouched during development to provide an unbiased estimate of real-world performance.",
        explanationID: "Selalu tune hyperparameter pada validation set. Test set harus tetap benar-benar tidak tersentuh selama pengembangan untuk memberikan estimasi yang tidak bias dari performa dunia nyata.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_039",
        questionEN: "What is learning rate as a hyperparameter and why is it important?",
        questionID: "Apa itu learning rate sebagai hyperparameter dan mengapa penting?",
        options: [
            QuestionOption(id: "a", textEN: "It controls step size in gradient descent - too high causes divergence, too low is slow", textID: "Mengontrol ukuran langkah dalam gradient descent - terlalu tinggi menyebabkan divergensi, terlalu rendah lambat"),
            QuestionOption(id: "b", textEN: "It's the rate at which the model learns new classes", textID: "Kecepatan model mempelajari kelas baru"),
            QuestionOption(id: "c", textEN: "It determines the model architecture", textID: "Menentukan arsitektur model"),
            QuestionOption(id: "d", textEN: "It sets the number of epochs", textID: "Menentukan jumlah epoch")
        ],
        correctOptionId: "a",
        explanationEN: "Learning rate α scales gradient updates. Too high: oscillation or divergence. Too low: very slow convergence, may get stuck. Often the most important hyperparameter to tune. Common to use schedules.",
        explanationID: "Learning rate α menskalakan pembaruan gradien. Terlalu tinggi: osilasi atau divergensi. Terlalu rendah: konvergensi sangat lambat, mungkin terjebak. Sering menjadi hyperparameter paling penting untuk di-tune. Umum menggunakan schedule.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_040",
        questionEN: "What is nested cross-validation?",
        questionID: "Apa itu nested cross-validation?",
        options: [
            QuestionOption(id: "a", textEN: "Outer CV for model evaluation, inner CV for hyperparameter tuning - gives unbiased performance estimate", textID: "CV luar untuk evaluasi model, CV dalam untuk tuning hyperparameter - memberikan estimasi performa yang tidak bias"),
            QuestionOption(id: "b", textEN: "Using two different k values", textID: "Menggunakan dua nilai k berbeda"),
            QuestionOption(id: "c", textEN: "CV inside CV for speed", textID: "CV di dalam CV untuk kecepatan"),
            QuestionOption(id: "d", textEN: "The same as regular CV", textID: "Sama dengan CV biasa")
        ],
        correctOptionId: "a",
        explanationEN: "Nested CV: outer loop for final evaluation (e.g., 5-fold), inner loop for hyperparameter selection (e.g., 3-fold within each outer fold). Prevents overfitting to the validation set during tuning.",
        explanationID: "Nested CV: loop luar untuk evaluasi final (misal, 5-fold), loop dalam untuk pemilihan hyperparameter (misal, 3-fold di dalam setiap fold luar). Mencegah overfitting ke validation set selama tuning.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Advanced Evaluation (Questions 41-50)
    Question(
        id: "eval_041",
        questionEN: "What is the log loss (binary cross-entropy) formula?",
        questionID: "Apa rumus log loss (binary cross-entropy)?",
        options: [
            QuestionOption(id: "a", textEN: "L = -(1/n) Σ[yᵢlog(pᵢ) + (1-yᵢ)log(1-pᵢ)]", textID: "L = -(1/n) Σ[yᵢlog(pᵢ) + (1-yᵢ)log(1-pᵢ)]"),
            QuestionOption(id: "b", textEN: "L = (1/n) Σ(yᵢ - pᵢ)²", textID: "L = (1/n) Σ(yᵢ - pᵢ)²"),
            QuestionOption(id: "c", textEN: "L = (1/n) Σ|yᵢ - pᵢ|", textID: "L = (1/n) Σ|yᵢ - pᵢ|"),
            QuestionOption(id: "d", textEN: "L = max(log(pᵢ))", textID: "L = max(log(pᵢ))")
        ],
        correctOptionId: "a",
        explanationEN: "Log loss = -Σ[y log(p) + (1-y)log(1-p)] penalizes confident wrong predictions heavily. It's the standard loss for binary classification with probability outputs.",
        explanationID: "Log loss = -Σ[y log(p) + (1-y)log(1-p)] menghukum berat prediksi salah yang percaya diri. Ini adalah loss standar untuk klasifikasi biner dengan output probabilitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_042",
        questionEN: "What is calibration in classification?",
        questionID: "Apa itu kalibrasi dalam klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "When predicted probabilities match actual frequencies - a 70% prediction should be correct 70% of the time", textID: "Ketika probabilitas prediksi cocok dengan frekuensi aktual - prediksi 70% harus benar 70% dari waktu"),
            QuestionOption(id: "b", textEN: "Setting the right threshold", textID: "Mengatur threshold yang tepat"),
            QuestionOption(id: "c", textEN: "Normalizing features", textID: "Menormalisasi fitur"),
            QuestionOption(id: "d", textEN: "Adjusting class weights", textID: "Menyesuaikan bobot kelas")
        ],
        correctOptionId: "a",
        explanationEN: "A well-calibrated model's probability predictions reflect true likelihoods. If we predict 0.8 probability for many samples, ~80% should actually be positive. Reliability diagrams visualize calibration.",
        explanationID: "Prediksi probabilitas model yang terkalibrasi dengan baik mencerminkan kemungkinan sebenarnya. Jika kita memprediksi probabilitas 0.8 untuk banyak sampel, ~80% harus benar-benar positif. Diagram reliabilitas memvisualisasikan kalibrasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_043",
        questionEN: "What is the Brier score?",
        questionID: "Apa itu Brier score?",
        options: [
            QuestionOption(id: "a", textEN: "MSE for probability predictions: (1/n) Σ(pᵢ - yᵢ)²", textID: "MSE untuk prediksi probabilitas: (1/n) Σ(pᵢ - yᵢ)²"),
            QuestionOption(id: "b", textEN: "F1 score for regression", textID: "F1 score untuk regresi"),
            QuestionOption(id: "c", textEN: "AUC for multi-class", textID: "AUC untuk multi-kelas"),
            QuestionOption(id: "d", textEN: "Accuracy × Precision", textID: "Accuracy × Precision")
        ],
        correctOptionId: "a",
        explanationEN: "Brier score = (1/n)Σ(p - y)² where p is predicted probability and y is 0 or 1. It measures both calibration and refinement. Lower is better, ranges from 0 (perfect) to 1.",
        explanationID: "Brier score = (1/n)Σ(p - y)² dimana p adalah probabilitas prediksi dan y adalah 0 atau 1. Mengukur kalibrasi dan refinement. Lebih rendah lebih baik, berkisar dari 0 (sempurna) sampai 1.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_044",
        questionEN: "What is Cohen's Kappa?",
        questionID: "Apa itu Cohen's Kappa?",
        options: [
            QuestionOption(id: "a", textEN: "A metric that accounts for agreement occurring by chance: κ = (p₀ - pₑ)/(1 - pₑ)", textID: "Metrik yang memperhitungkan kesepakatan yang terjadi secara kebetulan: κ = (p₀ - pₑ)/(1 - pₑ)"),
            QuestionOption(id: "b", textEN: "The same as accuracy", textID: "Sama dengan akurasi"),
            QuestionOption(id: "c", textEN: "A measure of precision", textID: "Ukuran presisi"),
            QuestionOption(id: "d", textEN: "A correlation metric", textID: "Metrik korelasi")
        ],
        correctOptionId: "a",
        explanationEN: "Kappa measures agreement between predictions and labels above what would occur by chance. κ = (observed - expected)/(1 - expected). κ=1 is perfect, κ=0 is chance-level. Useful for imbalanced data.",
        explanationID: "Kappa mengukur kesepakatan antara prediksi dan label di atas apa yang akan terjadi secara kebetulan. κ = (observed - expected)/(1 - expected). κ=1 sempurna, κ=0 adalah level kebetulan. Berguna untuk data tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_045",
        questionEN: "What is Matthews Correlation Coefficient (MCC)?",
        questionID: "Apa itu Matthews Correlation Coefficient (MCC)?",
        options: [
            QuestionOption(id: "a", textEN: "A balanced measure using all four confusion matrix values: (TP×TN - FP×FN) / √[(TP+FP)(TP+FN)(TN+FP)(TN+FN)]", textID: "Ukuran seimbang menggunakan keempat nilai confusion matrix: (TP×TN - FP×FN) / √[(TP+FP)(TP+FN)(TN+FP)(TN+FN)]"),
            QuestionOption(id: "b", textEN: "Pearson correlation between predictions and labels", textID: "Korelasi Pearson antara prediksi dan label"),
            QuestionOption(id: "c", textEN: "F1 score divided by accuracy", textID: "F1 score dibagi akurasi"),
            QuestionOption(id: "d", textEN: "AUC multiplied by accuracy", textID: "AUC dikalikan akurasi")
        ],
        correctOptionId: "a",
        explanationEN: "MCC ranges from -1 to +1 using all confusion matrix values. It's considered a balanced measure even for imbalanced data. MCC = 0 is random, +1 is perfect, -1 is perfect inverse.",
        explanationID: "MCC berkisar dari -1 sampai +1 menggunakan semua nilai confusion matrix. Dianggap ukuran seimbang bahkan untuk data tidak seimbang. MCC = 0 adalah acak, +1 sempurna, -1 adalah kebalikan sempurna.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_046",
        questionEN: "What is top-k accuracy?",
        questionID: "Apa itu top-k accuracy?",
        options: [
            QuestionOption(id: "a", textEN: "Sample is correct if the true class is among the k highest predicted probabilities", textID: "Sampel benar jika kelas sebenarnya termasuk dalam k probabilitas prediksi tertinggi"),
            QuestionOption(id: "b", textEN: "Accuracy on the top k samples", textID: "Akurasi pada k sampel teratas"),
            QuestionOption(id: "c", textEN: "Accuracy with k classes", textID: "Akurasi dengan k kelas"),
            QuestionOption(id: "d", textEN: "k times the regular accuracy", textID: "k kali akurasi biasa")
        ],
        correctOptionId: "a",
        explanationEN: "Top-5 accuracy (common in ImageNet): prediction is correct if true label is in the top 5 predicted classes. Useful when classes are similar or there's inherent ambiguity.",
        explanationID: "Top-5 accuracy (umum di ImageNet): prediksi benar jika label sebenarnya ada di 5 kelas prediksi teratas. Berguna ketika kelas mirip atau ada ambiguitas inheren.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_047",
        questionEN: "What is perplexity in language models?",
        questionID: "Apa itu perplexity dalam language model?",
        options: [
            QuestionOption(id: "a", textEN: "2^(cross-entropy) or exp(cross-entropy) - how 'surprised' the model is by the data", textID: "2^(cross-entropy) atau exp(cross-entropy) - seberapa 'terkejut' model terhadap data"),
            QuestionOption(id: "b", textEN: "The accuracy of text generation", textID: "Akurasi generasi teks"),
            QuestionOption(id: "c", textEN: "Number of unique words predicted", textID: "Jumlah kata unik yang diprediksi"),
            QuestionOption(id: "d", textEN: "Length of generated text", textID: "Panjang teks yang dihasilkan")
        ],
        correctOptionId: "a",
        explanationEN: "Perplexity = exp(H) where H is cross-entropy. Lower perplexity means the model is less 'perplexed' by the data. If perplexity = 10, it's as uncertain as choosing from 10 equally likely words.",
        explanationID: "Perplexity = exp(H) dimana H adalah cross-entropy. Perplexity lebih rendah berarti model lebih tidak 'bingung' dengan data. Jika perplexity = 10, model tidak yakin seperti memilih dari 10 kata yang sama kemungkinannya.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_048",
        questionEN: "What is the difference between online and offline evaluation?",
        questionID: "Apa perbedaan evaluasi online dan offline?",
        options: [
            QuestionOption(id: "a", textEN: "Offline uses held-out data before deployment; online evaluates in production with real users", textID: "Offline menggunakan data held-out sebelum deployment; online mengevaluasi di produksi dengan pengguna nyata"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Online uses training data", textID: "Online menggunakan data training"),
            QuestionOption(id: "d", textEN: "Offline uses production data", textID: "Offline menggunakan data produksi")
        ],
        correctOptionId: "a",
        explanationEN: "Offline evaluation: test on held-out data before deployment (metrics, A/B test simulation). Online evaluation: deploy and measure real impact (A/B tests, user engagement). Both are important.",
        explanationID: "Evaluasi offline: test pada data held-out sebelum deployment (metrik, simulasi A/B test). Evaluasi online: deploy dan ukur dampak nyata (A/B test, engagement pengguna). Keduanya penting.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "eval_049",
        questionEN: "What is A/B testing in ML?",
        questionID: "Apa itu A/B testing dalam ML?",
        options: [
            QuestionOption(id: "a", textEN: "Comparing two model versions on real users by randomly assigning users to each version", textID: "Membandingkan dua versi model pada pengguna nyata dengan mengassign pengguna secara acak ke setiap versi"),
            QuestionOption(id: "b", textEN: "Testing model A and B simultaneously on same data", textID: "Menguji model A dan B secara bersamaan pada data yang sama"),
            QuestionOption(id: "c", textEN: "Choosing between two hyperparameters", textID: "Memilih antara dua hyperparameter"),
            QuestionOption(id: "d", textEN: "Testing on datasets A and B", textID: "Menguji pada dataset A dan B")
        ],
        correctOptionId: "a",
        explanationEN: "A/B testing: randomly split users into groups, show each group a different model version, measure real-world metrics (clicks, conversions, engagement). Gold standard for production evaluation.",
        explanationID: "A/B testing: membagi pengguna secara acak ke dalam grup, menunjukkan setiap grup versi model berbeda, mengukur metrik dunia nyata (klik, konversi, engagement). Standar emas untuk evaluasi produksi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "eval_050",
        questionEN: "What is the curse of dimensionality in evaluation?",
        questionID: "Apa itu curse of dimensionality dalam evaluasi?",
        options: [
            QuestionOption(id: "a", textEN: "In high dimensions, data becomes sparse and distance metrics become less meaningful", textID: "Dalam dimensi tinggi, data menjadi sparse dan metrik jarak menjadi kurang bermakna"),
            QuestionOption(id: "b", textEN: "Having too many metrics", textID: "Memiliki terlalu banyak metrik"),
            QuestionOption(id: "c", textEN: "Too many dimensions in output", textID: "Terlalu banyak dimensi di output"),
            QuestionOption(id: "d", textEN: "Slow computation with many features", textID: "Komputasi lambat dengan banyak fitur")
        ],
        correctOptionId: "a",
        explanationEN: "In high dimensions, distances between points become similar, making nearest-neighbor methods less effective. Volume grows exponentially - need exponentially more data to maintain density.",
        explanationID: "Dalam dimensi tinggi, jarak antar titik menjadi mirip, membuat metode nearest-neighbor kurang efektif. Volume tumbuh eksponensial - perlu data eksponensial lebih banyak untuk mempertahankan kepadatan.",
        topic: "aiMlDl",
        difficulty: .advanced
    )
]
