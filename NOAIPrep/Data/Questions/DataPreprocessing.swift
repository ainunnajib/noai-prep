import Foundation

// MARK: - Data Preprocessing & Feature Engineering Questions (50 questions)
// Topics: Data cleaning, Feature scaling, Encoding, Feature selection, Data leakage

let dataPreprocessingQuestions: [Question] = [
    // MARK: - Data Cleaning (Questions 1-10)
    Question(
        id: "preproc_001",
        questionEN: "What is the most common approach to handle missing values in numerical data?",
        questionID: "Apa pendekatan paling umum untuk menangani nilai yang hilang dalam data numerik?",
        options: [
            QuestionOption(id: "a", textEN: "Imputation using mean, median, or mode", textID: "Imputasi menggunakan mean, median, atau modus"),
            QuestionOption(id: "b", textEN: "Always delete rows with missing values", textID: "Selalu hapus baris dengan nilai yang hilang"),
            QuestionOption(id: "c", textEN: "Set all missing values to zero", textID: "Atur semua nilai yang hilang ke nol"),
            QuestionOption(id: "d", textEN: "Leave missing values as-is", textID: "Biarkan nilai yang hilang apa adanya")
        ],
        correctOptionId: "a",
        explanationEN: "Imputation replaces missing values with estimated values. Mean is used for normally distributed data, median for skewed data. KNN imputation and model-based methods are more sophisticated alternatives.",
        explanationID: "Imputasi mengganti nilai yang hilang dengan nilai estimasi. Mean digunakan untuk data terdistribusi normal, median untuk data skewed. Imputasi KNN dan metode berbasis model adalah alternatif yang lebih canggih.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_002",
        questionEN: "When should you delete rows with missing values instead of imputing?",
        questionID: "Kapan Anda harus menghapus baris dengan nilai hilang alih-alih mengimputasi?",
        options: [
            QuestionOption(id: "a", textEN: "When missing data is small (<5%) and Missing Completely At Random", textID: "Ketika data hilang kecil (<5%) dan Missing Completely At Random"),
            QuestionOption(id: "b", textEN: "Always when any data is missing", textID: "Selalu ketika ada data yang hilang"),
            QuestionOption(id: "c", textEN: "Only when using neural networks", textID: "Hanya ketika menggunakan neural networks"),
            QuestionOption(id: "d", textEN: "Never, always impute", textID: "Tidak pernah, selalu imputasi")
        ],
        correctOptionId: "a",
        explanationEN: "Deletion is appropriate when missingness is MCAR and the amount is small. If data is MAR or MNAR, deletion can introduce bias.",
        explanationID: "Penghapusan sesuai ketika kehilangan adalah MCAR dan jumlahnya kecil. Jika data MAR atau MNAR, penghapusan dapat memperkenalkan bias.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_003",
        questionEN: "What is multivariate imputation (MICE)?",
        questionID: "Apa itu imputasi multivariat (MICE)?",
        options: [
            QuestionOption(id: "a", textEN: "Imputing each variable using information from other variables iteratively", textID: "Mengimputasi setiap variabel menggunakan informasi dari variabel lain secara iteratif"),
            QuestionOption(id: "b", textEN: "Imputing multiple datasets simultaneously", textID: "Mengimputasi beberapa dataset secara bersamaan"),
            QuestionOption(id: "c", textEN: "Using multiple imputation values per cell", textID: "Menggunakan beberapa nilai imputasi per sel"),
            QuestionOption(id: "d", textEN: "Imputing only multivariate data", textID: "Mengimputasi hanya data multivariat")
        ],
        correctOptionId: "a",
        explanationEN: "MICE (Multiple Imputation by Chained Equations) imputes each variable conditionally on others, cycling through variables until convergence. It captures variable relationships better than simple imputation.",
        explanationID: "MICE (Multiple Imputation by Chained Equations) mengimputasi setiap variabel secara kondisional pada yang lain, berputar melalui variabel sampai konvergen. Ini menangkap hubungan variabel lebih baik daripada imputasi sederhana.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "preproc_004",
        questionEN: "How should you detect outliers in numerical data?",
        questionID: "Bagaimana cara mendeteksi outlier dalam data numerik?",
        options: [
            QuestionOption(id: "a", textEN: "IQR method, Z-score, or domain knowledge", textID: "Metode IQR, Z-score, atau pengetahuan domain"),
            QuestionOption(id: "b", textEN: "Only visual inspection", textID: "Hanya inspeksi visual"),
            QuestionOption(id: "c", textEN: "Remove all values outside the mean", textID: "Hapus semua nilai di luar mean"),
            QuestionOption(id: "d", textEN: "Outliers should never be detected", textID: "Outlier tidak boleh dideteksi")
        ],
        correctOptionId: "a",
        explanationEN: "IQR method flags values beyond 1.5*IQR from quartiles. Z-score flags values beyond 2-3 standard deviations. Domain knowledge helps distinguish valid extreme values from errors.",
        explanationID: "Metode IQR menandai nilai di luar 1.5*IQR dari kuartil. Z-score menandai nilai di luar 2-3 standar deviasi. Pengetahuan domain membantu membedakan nilai ekstrem yang valid dari kesalahan.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_005",
        questionEN: "What should you do after detecting outliers?",
        questionID: "Apa yang harus Anda lakukan setelah mendeteksi outlier?",
        options: [
            QuestionOption(id: "a", textEN: "Investigate cause, then decide: keep, transform, cap, or remove", textID: "Selidiki penyebab, lalu putuskan: simpan, transformasi, batasi, atau hapus"),
            QuestionOption(id: "b", textEN: "Always remove them immediately", textID: "Selalu hapus segera"),
            QuestionOption(id: "c", textEN: "Always keep them", textID: "Selalu simpan"),
            QuestionOption(id: "d", textEN: "Replace with the mean", textID: "Ganti dengan mean")
        ],
        correctOptionId: "a",
        explanationEN: "Outliers may be valid extreme values, data entry errors, or measurement issues. Understanding the cause informs whether to keep (valid), remove (error), transform (log), or cap (winsorize).",
        explanationID: "Outlier mungkin nilai ekstrem yang valid, kesalahan entri data, atau masalah pengukuran. Memahami penyebab menginformasikan apakah harus simpan (valid), hapus (kesalahan), transformasi (log), atau batasi (winsorize).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_006",
        questionEN: "What is data leakage in machine learning?",
        questionID: "Apa itu data leakage dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Using information during training that wouldn't be available at prediction time", textID: "Menggunakan informasi saat training yang tidak tersedia saat prediksi"),
            QuestionOption(id: "b", textEN: "When data is lost during processing", textID: "Ketika data hilang selama pemrosesan"),
            QuestionOption(id: "c", textEN: "When model weights leak to public", textID: "Ketika bobot model bocor ke publik"),
            QuestionOption(id: "d", textEN: "When training data is too small", textID: "Ketika data training terlalu kecil")
        ],
        correctOptionId: "a",
        explanationEN: "Data leakage causes overly optimistic performance estimates. Common sources: using test data for preprocessing decisions, including future information, or target-correlated features that won't exist at inference.",
        explanationID: "Data leakage menyebabkan estimasi performa yang terlalu optimis. Sumber umum: menggunakan data test untuk keputusan preprocessing, menyertakan informasi masa depan, atau fitur berkorelasi target yang tidak akan ada saat inferensi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_007",
        questionEN: "How do you prevent data leakage when preprocessing?",
        questionID: "Bagaimana cara mencegah data leakage saat preprocessing?",
        options: [
            QuestionOption(id: "a", textEN: "Fit preprocessing on training data only, then transform test data", textID: "Fit preprocessing hanya pada data training, lalu transformasi data test"),
            QuestionOption(id: "b", textEN: "Fit on the entire dataset before splitting", textID: "Fit pada seluruh dataset sebelum split"),
            QuestionOption(id: "c", textEN: "Use different preprocessing for train and test", textID: "Gunakan preprocessing berbeda untuk train dan test"),
            QuestionOption(id: "d", textEN: "Never preprocess data", textID: "Jangan pernah preprocess data")
        ],
        correctOptionId: "a",
        explanationEN: "Always split data first, then fit scalers/encoders on training set only. Use sklearn's Pipeline to ensure fit_transform on train and transform only on test. This simulates production conditions.",
        explanationID: "Selalu split data dulu, lalu fit scaler/encoder hanya pada training set. Gunakan Pipeline sklearn untuk memastikan fit_transform pada train dan transform saja pada test. Ini mensimulasikan kondisi produksi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_008",
        questionEN: "What is the difference between missing data types: MCAR, MAR, and MNAR?",
        questionID: "Apa perbedaan antara tipe data hilang: MCAR, MAR, dan MNAR?",
        options: [
            QuestionOption(id: "a", textEN: "MCAR: random; MAR: depends on observed data; MNAR: depends on missing value itself", textID: "MCAR: acak; MAR: tergantung data teramati; MNAR: tergantung nilai hilang itu sendiri"),
            QuestionOption(id: "b", textEN: "They are all the same", textID: "Semuanya sama"),
            QuestionOption(id: "c", textEN: "MCAR is worst, MNAR is best", textID: "MCAR paling buruk, MNAR paling baik"),
            QuestionOption(id: "d", textEN: "Only MCAR can be imputed", textID: "Hanya MCAR yang bisa diimputasi")
        ],
        correctOptionId: "a",
        explanationEN: "MCAR: completely random missingness. MAR: missingness depends on observed values (e.g., older people less likely to report income). MNAR: missingness depends on the missing value itself (e.g., high earners hide income).",
        explanationID: "MCAR: kehilangan benar-benar acak. MAR: kehilangan tergantung nilai teramati (misal, orang tua kurang mungkin melaporkan pendapatan). MNAR: kehilangan tergantung nilai hilang itu sendiri (misal, pendapatan tinggi menyembunyikan pendapatan).",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "preproc_009",
        questionEN: "What is duplicate detection and why is it important?",
        questionID: "Apa itu deteksi duplikat dan mengapa penting?",
        options: [
            QuestionOption(id: "a", textEN: "Finding identical or near-identical rows that can bias training", textID: "Menemukan baris identik atau hampir identik yang dapat membias training"),
            QuestionOption(id: "b", textEN: "Finding duplicate column names", textID: "Menemukan nama kolom duplikat"),
            QuestionOption(id: "c", textEN: "Copying data for backup", textID: "Menyalin data untuk backup"),
            QuestionOption(id: "d", textEN: "Duplicating features for model", textID: "Menduplikasi fitur untuk model")
        ],
        correctOptionId: "a",
        explanationEN: "Duplicates can inflate model performance if same record appears in train and test. They also bias learning toward duplicated samples. Remove exact duplicates; for near-duplicates, keep one or investigate.",
        explanationID: "Duplikat dapat meningkatkan performa model jika rekaman sama muncul di train dan test. Mereka juga membias pembelajaran ke sampel duplikat. Hapus duplikat eksak; untuk hampir duplikat, simpan satu atau selidiki.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_010",
        questionEN: "What is data type conversion and when is it needed?",
        questionID: "Apa itu konversi tipe data dan kapan dibutuhkan?",
        options: [
            QuestionOption(id: "a", textEN: "Converting columns to appropriate types for analysis (e.g., string dates to datetime)", textID: "Mengonversi kolom ke tipe yang sesuai untuk analisis (misal, tanggal string ke datetime)"),
            QuestionOption(id: "b", textEN: "Converting all data to strings", textID: "Mengonversi semua data ke string"),
            QuestionOption(id: "c", textEN: "Only needed for neural networks", textID: "Hanya dibutuhkan untuk neural networks"),
            QuestionOption(id: "d", textEN: "Converting data to binary", textID: "Mengonversi data ke biner")
        ],
        correctOptionId: "a",
        explanationEN: "Proper data types enable correct operations. Dates as datetime allow time-based operations; categorical columns as category save memory; numeric strings as float enable math operations.",
        explanationID: "Tipe data yang tepat memungkinkan operasi yang benar. Tanggal sebagai datetime memungkinkan operasi berbasis waktu; kolom kategoris sebagai category menghemat memori; string numerik sebagai float memungkinkan operasi matematika.",
        topic: "computing",
        difficulty: .beginner
    ),

    // MARK: - Feature Scaling (Questions 11-20)
    Question(
        id: "preproc_011",
        questionEN: "What is the difference between normalization and standardization?",
        questionID: "Apa perbedaan antara normalisasi dan standardisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Normalization scales to [0,1]; standardization scales to mean=0, std=1", textID: "Normalisasi menskala ke [0,1]; standardisasi menskala ke mean=0, std=1"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Normalization is for neural networks only", textID: "Normalisasi hanya untuk neural networks"),
            QuestionOption(id: "d", textEN: "Standardization is for categorical data", textID: "Standardisasi untuk data kategoris")
        ],
        correctOptionId: "a",
        explanationEN: "Min-Max normalization: (x-min)/(max-min) → [0,1]. Z-score standardization: (x-mean)/std → mean=0, std=1. Choice depends on algorithm and data distribution.",
        explanationID: "Normalisasi Min-Max: (x-min)/(max-min) → [0,1]. Standardisasi Z-score: (x-mean)/std → mean=0, std=1. Pilihan tergantung algoritma dan distribusi data.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_012",
        questionEN: "Which algorithms require feature scaling?",
        questionID: "Algoritma mana yang memerlukan penskalaan fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Distance-based (KNN, SVM), gradient-based (neural nets, logistic regression)", textID: "Berbasis jarak (KNN, SVM), berbasis gradien (neural nets, logistic regression)"),
            QuestionOption(id: "b", textEN: "All algorithms require scaling", textID: "Semua algoritma memerlukan penskalaan"),
            QuestionOption(id: "c", textEN: "No algorithms require scaling", textID: "Tidak ada algoritma yang memerlukan penskalaan"),
            QuestionOption(id: "d", textEN: "Only tree-based algorithms", textID: "Hanya algoritma berbasis pohon")
        ],
        correctOptionId: "a",
        explanationEN: "Distance-based algorithms are affected by feature magnitudes. Gradient-based methods converge faster with scaled features. Tree-based algorithms (RF, XGBoost) are scale-invariant.",
        explanationID: "Algoritma berbasis jarak dipengaruhi oleh magnitude fitur. Metode berbasis gradien konvergen lebih cepat dengan fitur yang diskalakan. Algoritma berbasis pohon (RF, XGBoost) invariant terhadap skala.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_013",
        questionEN: "When should you use RobustScaler instead of StandardScaler?",
        questionID: "Kapan Anda harus menggunakan RobustScaler daripada StandardScaler?",
        options: [
            QuestionOption(id: "a", textEN: "When data has many outliers", textID: "Ketika data memiliki banyak outlier"),
            QuestionOption(id: "b", textEN: "When data is normally distributed", textID: "Ketika data terdistribusi normal"),
            QuestionOption(id: "c", textEN: "When data has no outliers", textID: "Ketika data tidak memiliki outlier"),
            QuestionOption(id: "d", textEN: "For all categorical data", textID: "Untuk semua data kategoris")
        ],
        correctOptionId: "a",
        explanationEN: "RobustScaler uses median and IQR instead of mean and std, making it robust to outliers. StandardScaler's mean and std are heavily affected by extreme values.",
        explanationID: "RobustScaler menggunakan median dan IQR bukan mean dan std, membuatnya robust terhadap outlier. Mean dan std StandardScaler sangat dipengaruhi oleh nilai ekstrem.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_014",
        questionEN: "What is MaxAbsScaler used for?",
        questionID: "Untuk apa MaxAbsScaler digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Scaling sparse data while preserving zero entries", textID: "Menskalakan data sparse sambil mempertahankan entri nol"),
            QuestionOption(id: "b", textEN: "Only for positive data", textID: "Hanya untuk data positif"),
            QuestionOption(id: "c", textEN: "Converting to absolute values", textID: "Mengonversi ke nilai absolut"),
            QuestionOption(id: "d", textEN: "Finding maximum values", textID: "Mencari nilai maksimum")
        ],
        correctOptionId: "a",
        explanationEN: "MaxAbsScaler divides by max absolute value, scaling to [-1, 1]. Unlike other scalers, it doesn't shift data, preserving sparsity which is important for sparse matrices.",
        explanationID: "MaxAbsScaler membagi dengan nilai absolut maksimum, menskalakan ke [-1, 1]. Berbeda dengan scaler lain, tidak menggeser data, mempertahankan sparsity yang penting untuk matriks sparse.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_015",
        questionEN: "What is log transformation used for?",
        questionID: "Untuk apa transformasi log digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Making right-skewed distributions more normal and handling large ranges", textID: "Membuat distribusi miring kanan lebih normal dan menangani rentang besar"),
            QuestionOption(id: "b", textEN: "Only for negative values", textID: "Hanya untuk nilai negatif"),
            QuestionOption(id: "c", textEN: "Making data categorical", textID: "Membuat data kategoris"),
            QuestionOption(id: "d", textEN: "Removing all outliers", textID: "Menghapus semua outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Log transform reduces right skew and compresses large values. Common for income, prices, counts. Use log1p for data with zeros. Box-Cox is a generalized power transform.",
        explanationID: "Transformasi log mengurangi skew kanan dan mengompresi nilai besar. Umum untuk pendapatan, harga, hitungan. Gunakan log1p untuk data dengan nol. Box-Cox adalah transformasi pangkat yang digeneralisasi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_016",
        questionEN: "What is the Box-Cox transformation?",
        questionID: "Apa itu transformasi Box-Cox?",
        options: [
            QuestionOption(id: "a", textEN: "A parametric transformation that finds optimal power to make data more normal", textID: "Transformasi parametrik yang menemukan pangkat optimal untuk membuat data lebih normal"),
            QuestionOption(id: "b", textEN: "A method to box data into categories", textID: "Metode untuk mengelompokkan data ke kategori"),
            QuestionOption(id: "c", textEN: "Only for Cox regression", textID: "Hanya untuk regresi Cox"),
            QuestionOption(id: "d", textEN: "A feature selection method", textID: "Metode seleksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Box-Cox transform: y = (x^λ - 1)/λ for λ≠0, log(x) for λ=0. The optimal λ is found to maximize normality. Requires positive data; Yeo-Johnson extends to negative values.",
        explanationID: "Transformasi Box-Cox: y = (x^λ - 1)/λ untuk λ≠0, log(x) untuk λ=0. λ optimal ditemukan untuk memaksimalkan normalitas. Memerlukan data positif; Yeo-Johnson memperluas ke nilai negatif.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "preproc_017",
        questionEN: "What is QuantileTransformer?",
        questionID: "Apa itu QuantileTransformer?",
        options: [
            QuestionOption(id: "a", textEN: "Transforms features to follow uniform or normal distribution using quantiles", textID: "Mentransformasi fitur untuk mengikuti distribusi uniform atau normal menggunakan kuantil"),
            QuestionOption(id: "b", textEN: "Selects top quantiles of data", textID: "Memilih kuantil teratas data"),
            QuestionOption(id: "c", textEN: "Only for quantile regression", textID: "Hanya untuk regresi kuantil"),
            QuestionOption(id: "d", textEN: "Removes quantile outliers", textID: "Menghapus outlier kuantil")
        ],
        correctOptionId: "a",
        explanationEN: "QuantileTransformer maps data to a uniform or Gaussian distribution using empirical quantiles. It's robust to outliers but can distort relationships between features.",
        explanationID: "QuantileTransformer memetakan data ke distribusi uniform atau Gaussian menggunakan kuantil empiris. Robust terhadap outlier tetapi dapat mendistorsi hubungan antar fitur.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "preproc_018",
        questionEN: "Should you scale the target variable in regression?",
        questionID: "Haruskah Anda menskalakan variabel target dalam regresi?",
        options: [
            QuestionOption(id: "a", textEN: "Often yes for numerical stability, but inverse transform predictions", textID: "Sering ya untuk stabilitas numerik, tapi inverse transform prediksi"),
            QuestionOption(id: "b", textEN: "Never scale the target", textID: "Jangan pernah menskalakan target"),
            QuestionOption(id: "c", textEN: "Always scale to [0,1]", textID: "Selalu skalakan ke [0,1]"),
            QuestionOption(id: "d", textEN: "Only for classification", textID: "Hanya untuk klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Scaling targets can help neural network training stability. Log-transforming targets is common for skewed distributions. Always inverse transform predictions for interpretability.",
        explanationID: "Menskalakan target dapat membantu stabilitas training neural network. Log-transformasi target umum untuk distribusi skewed. Selalu inverse transform prediksi untuk interpretabilitas.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_019",
        questionEN: "What is PowerTransformer in scikit-learn?",
        questionID: "Apa itu PowerTransformer di scikit-learn?",
        options: [
            QuestionOption(id: "a", textEN: "Applies Box-Cox or Yeo-Johnson to make data more Gaussian-like", textID: "Menerapkan Box-Cox atau Yeo-Johnson untuk membuat data lebih seperti Gaussian"),
            QuestionOption(id: "b", textEN: "Raises data to a fixed power", textID: "Menaikkan data ke pangkat tetap"),
            QuestionOption(id: "c", textEN: "Only for power consumption data", textID: "Hanya untuk data konsumsi daya"),
            QuestionOption(id: "d", textEN: "A GPU acceleration tool", textID: "Alat akselerasi GPU")
        ],
        correctOptionId: "a",
        explanationEN: "PowerTransformer supports both Box-Cox (positive data only) and Yeo-Johnson (handles zero and negative). It standardizes data after transformation by default.",
        explanationID: "PowerTransformer mendukung Box-Cox (hanya data positif) dan Yeo-Johnson (menangani nol dan negatif). Secara default menstandardisasi data setelah transformasi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_020",
        questionEN: "When should you NOT scale features?",
        questionID: "Kapan Anda TIDAK boleh menskalakan fitur?",
        options: [
            QuestionOption(id: "a", textEN: "When using tree-based algorithms like Random Forest or XGBoost", textID: "Ketika menggunakan algoritma berbasis pohon seperti Random Forest atau XGBoost"),
            QuestionOption(id: "b", textEN: "When using neural networks", textID: "Ketika menggunakan neural networks"),
            QuestionOption(id: "c", textEN: "When using SVM", textID: "Ketika menggunakan SVM"),
            QuestionOption(id: "d", textEN: "When using K-means", textID: "Ketika menggunakan K-means")
        ],
        correctOptionId: "a",
        explanationEN: "Tree-based algorithms split on thresholds and are invariant to monotonic transformations. Scaling doesn't affect their performance and can be skipped.",
        explanationID: "Algoritma berbasis pohon membelah pada threshold dan invariant terhadap transformasi monoton. Penskalaan tidak mempengaruhi performa mereka dan dapat dilewati.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // MARK: - Encoding (Questions 21-30)
    Question(
        id: "preproc_021",
        questionEN: "What is one-hot encoding?",
        questionID: "Apa itu one-hot encoding?",
        options: [
            QuestionOption(id: "a", textEN: "Creating binary columns for each category value", textID: "Membuat kolom biner untuk setiap nilai kategori"),
            QuestionOption(id: "b", textEN: "Converting to temperature values", textID: "Mengonversi ke nilai suhu"),
            QuestionOption(id: "c", textEN: "Encoding as sequential integers", textID: "Mengkodekan sebagai integer berurutan"),
            QuestionOption(id: "d", textEN: "Using one column for all categories", textID: "Menggunakan satu kolom untuk semua kategori")
        ],
        correctOptionId: "a",
        explanationEN: "One-hot encoding creates K binary columns for K categories, with exactly one column being 1 per row. It prevents ordinal relationships between categories but increases dimensionality.",
        explanationID: "One-hot encoding membuat K kolom biner untuk K kategori, dengan tepat satu kolom menjadi 1 per baris. Mencegah hubungan ordinal antar kategori tetapi meningkatkan dimensionalitas.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_022",
        questionEN: "What is the problem with one-hot encoding high cardinality features?",
        questionID: "Apa masalah dengan one-hot encoding fitur kardinalitas tinggi?",
        options: [
            QuestionOption(id: "a", textEN: "Creates too many sparse columns, increasing memory and computation", textID: "Membuat terlalu banyak kolom sparse, meningkatkan memori dan komputasi"),
            QuestionOption(id: "b", textEN: "It doesn't work for high cardinality", textID: "Tidak bekerja untuk kardinalitas tinggi"),
            QuestionOption(id: "c", textEN: "Results become too accurate", textID: "Hasil menjadi terlalu akurat"),
            QuestionOption(id: "d", textEN: "There are no problems", textID: "Tidak ada masalah")
        ],
        correctOptionId: "a",
        explanationEN: "A feature with 10,000 categories creates 10,000 columns. This wastes memory, slows training, and can cause overfitting. Use target encoding, embeddings, or grouping instead.",
        explanationID: "Fitur dengan 10.000 kategori membuat 10.000 kolom. Ini membuang memori, memperlambat training, dan dapat menyebabkan overfitting. Gunakan target encoding, embeddings, atau pengelompokan sebagai gantinya.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_023",
        questionEN: "What is label encoding?",
        questionID: "Apa itu label encoding?",
        options: [
            QuestionOption(id: "a", textEN: "Assigning each category a unique integer", textID: "Menetapkan setiap kategori integer unik"),
            QuestionOption(id: "b", textEN: "Encoding labels as text", textID: "Mengkodekan label sebagai teks"),
            QuestionOption(id: "c", textEN: "Creating labels for unlabeled data", textID: "Membuat label untuk data tanpa label"),
            QuestionOption(id: "d", textEN: "Same as one-hot encoding", textID: "Sama dengan one-hot encoding")
        ],
        correctOptionId: "a",
        explanationEN: "Label encoding maps categories to integers (e.g., red=0, blue=1, green=2). It implies ordinal relationships, which may be inappropriate for nominal categories with linear models.",
        explanationID: "Label encoding memetakan kategori ke integer (misal, merah=0, biru=1, hijau=2). Ini menyiratkan hubungan ordinal, yang mungkin tidak tepat untuk kategori nominal dengan model linear.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_024",
        questionEN: "What is target encoding (mean encoding)?",
        questionID: "Apa itu target encoding (mean encoding)?",
        options: [
            QuestionOption(id: "a", textEN: "Replacing categories with mean of target for that category", textID: "Mengganti kategori dengan mean target untuk kategori tersebut"),
            QuestionOption(id: "b", textEN: "Encoding only the target variable", textID: "Mengkodekan hanya variabel target"),
            QuestionOption(id: "c", textEN: "One-hot encoding the target", textID: "One-hot encoding target"),
            QuestionOption(id: "d", textEN: "Predicting the target first", textID: "Memprediksi target terlebih dahulu")
        ],
        correctOptionId: "a",
        explanationEN: "Target encoding replaces each category with the mean target value for that category. It handles high cardinality well but risks data leakage and overfitting without regularization.",
        explanationID: "Target encoding mengganti setiap kategori dengan nilai target rata-rata untuk kategori tersebut. Menangani kardinalitas tinggi dengan baik tetapi berisiko data leakage dan overfitting tanpa regularisasi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_025",
        questionEN: "How do you prevent target encoding from causing data leakage?",
        questionID: "Bagaimana cara mencegah target encoding menyebabkan data leakage?",
        options: [
            QuestionOption(id: "a", textEN: "Use leave-one-out or K-fold encoding within training set", textID: "Gunakan encoding leave-one-out atau K-fold dalam training set"),
            QuestionOption(id: "b", textEN: "Encode test set first", textID: "Encode test set terlebih dahulu"),
            QuestionOption(id: "c", textEN: "Use random values", textID: "Gunakan nilai acak"),
            QuestionOption(id: "d", textEN: "No prevention needed", textID: "Tidak perlu pencegahan")
        ],
        correctOptionId: "a",
        explanationEN: "Leave-one-out encoding computes target mean excluding the current row. K-fold encoding uses out-of-fold predictions. Both prevent using a row's own target in its encoding.",
        explanationID: "Encoding leave-one-out menghitung mean target tidak termasuk baris saat ini. Encoding K-fold menggunakan prediksi out-of-fold. Keduanya mencegah penggunaan target baris sendiri dalam encodingnya.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "preproc_026",
        questionEN: "What is ordinal encoding and when should it be used?",
        questionID: "Apa itu ordinal encoding dan kapan harus digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Integer encoding where order matters (e.g., low=1, medium=2, high=3)", textID: "Encoding integer di mana urutan penting (misal, rendah=1, sedang=2, tinggi=3)"),
            QuestionOption(id: "b", textEN: "For any categorical variable", textID: "Untuk variabel kategoris apa saja"),
            QuestionOption(id: "c", textEN: "Same as one-hot encoding", textID: "Sama dengan one-hot encoding"),
            QuestionOption(id: "d", textEN: "Only for numerical data", textID: "Hanya untuk data numerik")
        ],
        correctOptionId: "a",
        explanationEN: "Ordinal encoding assigns integers respecting natural order. Use for ordinal categories (education level, ratings). Don't use for nominal categories where order is meaningless.",
        explanationID: "Ordinal encoding menetapkan integer yang menghormati urutan alami. Gunakan untuk kategori ordinal (tingkat pendidikan, rating). Jangan gunakan untuk kategori nominal di mana urutan tidak bermakna.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_027",
        questionEN: "What is binary encoding?",
        questionID: "Apa itu binary encoding?",
        options: [
            QuestionOption(id: "a", textEN: "Encoding categories as binary representations of integers", textID: "Mengkodekan kategori sebagai representasi biner dari integer"),
            QuestionOption(id: "b", textEN: "Encoding as 0 or 1 only", textID: "Mengkodekan sebagai 0 atau 1 saja"),
            QuestionOption(id: "c", textEN: "Same as one-hot encoding", textID: "Sama dengan one-hot encoding"),
            QuestionOption(id: "d", textEN: "For binary classification only", textID: "Hanya untuk klasifikasi biner")
        ],
        correctOptionId: "a",
        explanationEN: "Binary encoding converts category numbers to binary, then splits digits into columns. 8 categories need only 3 columns (2^3=8) vs 8 for one-hot. Good for medium cardinality.",
        explanationID: "Binary encoding mengonversi nomor kategori ke biner, lalu membagi digit ke kolom. 8 kategori hanya butuh 3 kolom (2^3=8) vs 8 untuk one-hot. Baik untuk kardinalitas sedang.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_028",
        questionEN: "What is frequency encoding?",
        questionID: "Apa itu frequency encoding?",
        options: [
            QuestionOption(id: "a", textEN: "Replacing categories with their frequency or count in the data", textID: "Mengganti kategori dengan frekuensi atau jumlahnya dalam data"),
            QuestionOption(id: "b", textEN: "Encoding sound frequencies", textID: "Mengkodekan frekuensi suara"),
            QuestionOption(id: "c", textEN: "How often the model is trained", textID: "Seberapa sering model ditraining"),
            QuestionOption(id: "d", textEN: "Only for time series", textID: "Hanya untuk time series")
        ],
        correctOptionId: "a",
        explanationEN: "Frequency encoding replaces each category with its occurrence count or proportion. Simple and handles high cardinality. May lose information if frequencies are similar across categories.",
        explanationID: "Frequency encoding mengganti setiap kategori dengan jumlah kejadian atau proporsinya. Sederhana dan menangani kardinalitas tinggi. Mungkin kehilangan informasi jika frekuensi serupa antar kategori.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_029",
        questionEN: "How do you handle unseen categories in test data?",
        questionID: "Bagaimana cara menangani kategori yang tidak terlihat dalam data test?",
        options: [
            QuestionOption(id: "a", textEN: "Map to 'unknown' category or use default encoding value", textID: "Petakan ke kategori 'unknown' atau gunakan nilai encoding default"),
            QuestionOption(id: "b", textEN: "Delete rows with unseen categories", textID: "Hapus baris dengan kategori yang tidak terlihat"),
            QuestionOption(id: "c", textEN: "This never happens", textID: "Ini tidak pernah terjadi"),
            QuestionOption(id: "d", textEN: "Retrain the entire model", textID: "Latih ulang seluruh model")
        ],
        correctOptionId: "a",
        explanationEN: "Use handle_unknown='ignore' in sklearn encoders or add an 'unknown' category during training. For target encoding, use global mean as default for unseen categories.",
        explanationID: "Gunakan handle_unknown='ignore' di encoder sklearn atau tambahkan kategori 'unknown' selama training. Untuk target encoding, gunakan mean global sebagai default untuk kategori tidak terlihat.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_030",
        questionEN: "What is embedding encoding for categorical variables?",
        questionID: "Apa itu embedding encoding untuk variabel kategoris?",
        options: [
            QuestionOption(id: "a", textEN: "Learning dense vector representations through neural network training", textID: "Mempelajari representasi vektor padat melalui training neural network"),
            QuestionOption(id: "b", textEN: "Embedding categories in text", textID: "Menyematkan kategori dalam teks"),
            QuestionOption(id: "c", textEN: "Same as one-hot encoding", textID: "Sama dengan one-hot encoding"),
            QuestionOption(id: "d", textEN: "Using pre-trained word embeddings", textID: "Menggunakan word embeddings pra-training")
        ],
        correctOptionId: "a",
        explanationEN: "Entity embeddings learn dense representations where similar categories have similar vectors. Effective for high cardinality in neural networks. Can be pre-trained and transferred.",
        explanationID: "Entity embeddings mempelajari representasi padat di mana kategori serupa memiliki vektor serupa. Efektif untuk kardinalitas tinggi dalam neural networks. Dapat dipra-training dan ditransfer.",
        topic: "computing",
        difficulty: .advanced
    ),

    // MARK: - Feature Selection (Questions 31-40)
    Question(
        id: "preproc_031",
        questionEN: "What are the three main types of feature selection methods?",
        questionID: "Apa tiga jenis utama metode seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Filter, Wrapper, and Embedded methods", textID: "Metode Filter, Wrapper, dan Embedded"),
            QuestionOption(id: "b", textEN: "Manual, Automatic, and Semi-automatic", textID: "Manual, Otomatis, dan Semi-otomatis"),
            QuestionOption(id: "c", textEN: "Forward, Backward, and Random", textID: "Forward, Backward, dan Random"),
            QuestionOption(id: "d", textEN: "Statistical, Machine Learning, and Deep Learning", textID: "Statistik, Machine Learning, dan Deep Learning")
        ],
        correctOptionId: "a",
        explanationEN: "Filter: statistical tests independent of model. Wrapper: use model performance to select (expensive). Embedded: selection during model training (e.g., L1 regularization).",
        explanationID: "Filter: uji statistik independen dari model. Wrapper: gunakan performa model untuk memilih (mahal). Embedded: seleksi selama training model (misal, regularisasi L1).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_032",
        questionEN: "What is the variance threshold method for feature selection?",
        questionID: "Apa itu metode variance threshold untuk seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Remove features with variance below a threshold", textID: "Hapus fitur dengan varians di bawah threshold"),
            QuestionOption(id: "b", textEN: "Select features with highest variance", textID: "Pilih fitur dengan varians tertinggi"),
            QuestionOption(id: "c", textEN: "Normalize variance across features", textID: "Normalisasi varians di seluruh fitur"),
            QuestionOption(id: "d", textEN: "Threshold based on model variance", textID: "Threshold berdasarkan varians model")
        ],
        correctOptionId: "a",
        explanationEN: "VarianceThreshold removes features with low variance (e.g., near-constant features). A feature with 0 variance provides no discriminative information.",
        explanationID: "VarianceThreshold menghapus fitur dengan varians rendah (misal, fitur hampir konstan). Fitur dengan varians 0 tidak memberikan informasi diskriminatif.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_033",
        questionEN: "What is correlation-based feature selection?",
        questionID: "Apa itu seleksi fitur berbasis korelasi?",
        options: [
            QuestionOption(id: "a", textEN: "Remove highly correlated features that provide redundant information", textID: "Hapus fitur berkorelasi tinggi yang memberikan informasi redundan"),
            QuestionOption(id: "b", textEN: "Select only correlated features", textID: "Pilih hanya fitur yang berkorelasi"),
            QuestionOption(id: "c", textEN: "Create new correlated features", textID: "Buat fitur berkorelasi baru"),
            QuestionOption(id: "d", textEN: "Increase correlation between features", textID: "Meningkatkan korelasi antar fitur")
        ],
        correctOptionId: "a",
        explanationEN: "When features are highly correlated (e.g., r > 0.9), they carry similar information. Keeping only one reduces dimensionality without losing much information.",
        explanationID: "Ketika fitur sangat berkorelasi (misal, r > 0.9), mereka membawa informasi serupa. Menyimpan hanya satu mengurangi dimensionalitas tanpa kehilangan banyak informasi.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_034",
        questionEN: "What is Recursive Feature Elimination (RFE)?",
        questionID: "Apa itu Recursive Feature Elimination (RFE)?",
        options: [
            QuestionOption(id: "a", textEN: "Iteratively remove least important features based on model weights", textID: "Secara iteratif menghapus fitur paling tidak penting berdasarkan bobot model"),
            QuestionOption(id: "b", textEN: "Remove features randomly", textID: "Menghapus fitur secara acak"),
            QuestionOption(id: "c", textEN: "Add features recursively", textID: "Menambah fitur secara rekursif"),
            QuestionOption(id: "d", textEN: "A deep learning technique", textID: "Teknik deep learning")
        ],
        correctOptionId: "a",
        explanationEN: "RFE trains model, removes least important feature(s), and repeats until desired count. It's a wrapper method. Cross-validation (RFECV) can find optimal number automatically.",
        explanationID: "RFE melatih model, menghapus fitur paling tidak penting, dan mengulang sampai jumlah yang diinginkan. Ini metode wrapper. Cross-validation (RFECV) dapat menemukan jumlah optimal secara otomatis.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_035",
        questionEN: "How does L1 regularization (Lasso) help with feature selection?",
        questionID: "Bagaimana regularisasi L1 (Lasso) membantu seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Drives unimportant feature weights exactly to zero", textID: "Mendorong bobot fitur tidak penting tepat ke nol"),
            QuestionOption(id: "b", textEN: "Makes all weights equal", textID: "Membuat semua bobot sama"),
            QuestionOption(id: "c", textEN: "Increases all feature weights", textID: "Meningkatkan semua bobot fitur"),
            QuestionOption(id: "d", textEN: "Only works for classification", textID: "Hanya bekerja untuk klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "L1 penalty (|w|) produces sparse solutions where many weights become exactly zero. Non-zero weights indicate selected features. This is embedded feature selection.",
        explanationID: "Penalti L1 (|w|) menghasilkan solusi sparse di mana banyak bobot menjadi tepat nol. Bobot non-nol menunjukkan fitur yang dipilih. Ini adalah seleksi fitur embedded.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_036",
        questionEN: "What is mutual information for feature selection?",
        questionID: "Apa itu mutual information untuk seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Measures how much knowing a feature reduces uncertainty about target", textID: "Mengukur berapa banyak mengetahui fitur mengurangi ketidakpastian tentang target"),
            QuestionOption(id: "b", textEN: "How features share information with each other", textID: "Bagaimana fitur berbagi informasi satu sama lain"),
            QuestionOption(id: "c", textEN: "Only for text data", textID: "Hanya untuk data teks"),
            QuestionOption(id: "d", textEN: "Same as correlation", textID: "Sama dengan korelasi")
        ],
        correctOptionId: "a",
        explanationEN: "Mutual information I(X;Y) measures dependency between feature X and target Y. Unlike correlation, it captures non-linear relationships. Higher MI = more relevant feature.",
        explanationID: "Mutual information I(X;Y) mengukur dependensi antara fitur X dan target Y. Berbeda dengan korelasi, menangkap hubungan non-linear. MI lebih tinggi = fitur lebih relevan.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_037",
        questionEN: "What is chi-squared test for feature selection?",
        questionID: "Apa itu uji chi-squared untuk seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Tests independence between categorical features and target", textID: "Menguji independensi antara fitur kategoris dan target"),
            QuestionOption(id: "b", textEN: "Tests for normal distribution", textID: "Menguji distribusi normal"),
            QuestionOption(id: "c", textEN: "Only for numerical features", textID: "Hanya untuk fitur numerik"),
            QuestionOption(id: "d", textEN: "Tests model accuracy", textID: "Menguji akurasi model")
        ],
        correctOptionId: "a",
        explanationEN: "Chi-squared tests whether categorical feature and target are independent. Higher chi-squared = stronger relationship. Requires non-negative features (often used after one-hot encoding).",
        explanationID: "Chi-squared menguji apakah fitur kategoris dan target independen. Chi-squared lebih tinggi = hubungan lebih kuat. Memerlukan fitur non-negatif (sering digunakan setelah one-hot encoding).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_038",
        questionEN: "What is the curse of dimensionality?",
        questionID: "Apa itu curse of dimensionality?",
        options: [
            QuestionOption(id: "a", textEN: "High-dimensional spaces become increasingly sparse, hurting model performance", textID: "Ruang dimensi tinggi menjadi semakin sparse, merusak performa model"),
            QuestionOption(id: "b", textEN: "Too few dimensions cause overfitting", textID: "Terlalu sedikit dimensi menyebabkan overfitting"),
            QuestionOption(id: "c", textEN: "Dimensions are always bad", textID: "Dimensi selalu buruk"),
            QuestionOption(id: "d", textEN: "Only affects neural networks", textID: "Hanya mempengaruhi neural networks")
        ],
        correctOptionId: "a",
        explanationEN: "In high dimensions, data becomes sparse, distance metrics lose meaning, and more data is needed. Feature selection/extraction helps combat this by reducing dimensionality.",
        explanationID: "Dalam dimensi tinggi, data menjadi sparse, metrik jarak kehilangan makna, dan lebih banyak data diperlukan. Seleksi/ekstraksi fitur membantu melawan ini dengan mengurangi dimensionalitas.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_039",
        questionEN: "What is forward selection in feature selection?",
        questionID: "Apa itu forward selection dalam seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Start with no features, add one at a time based on performance improvement", textID: "Mulai tanpa fitur, tambahkan satu per satu berdasarkan peningkatan performa"),
            QuestionOption(id: "b", textEN: "Select all features at once", textID: "Pilih semua fitur sekaligus"),
            QuestionOption(id: "c", textEN: "Remove features one at a time", textID: "Hapus fitur satu per satu"),
            QuestionOption(id: "d", textEN: "Use only the first features", textID: "Gunakan hanya fitur pertama")
        ],
        correctOptionId: "a",
        explanationEN: "Forward selection is greedy: start empty, add feature that most improves performance, repeat. Simpler than exhaustive search but may miss optimal combination.",
        explanationID: "Forward selection bersifat greedy: mulai kosong, tambah fitur yang paling meningkatkan performa, ulangi. Lebih sederhana dari pencarian exhaustive tetapi mungkin melewatkan kombinasi optimal.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_040",
        questionEN: "What is backward elimination in feature selection?",
        questionID: "Apa itu backward elimination dalam seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Start with all features, remove least important one at a time", textID: "Mulai dengan semua fitur, hapus yang paling tidak penting satu per satu"),
            QuestionOption(id: "b", textEN: "Select features from the back of dataset", textID: "Pilih fitur dari belakang dataset"),
            QuestionOption(id: "c", textEN: "Add features from the end", textID: "Tambah fitur dari akhir"),
            QuestionOption(id: "d", textEN: "Same as forward selection", textID: "Sama dengan forward selection")
        ],
        correctOptionId: "a",
        explanationEN: "Backward elimination starts with all features, removes the one whose removal least hurts performance, and repeats. Computationally expensive for many features.",
        explanationID: "Backward elimination mulai dengan semua fitur, menghapus satu yang penghapusannya paling sedikit merusak performa, dan mengulang. Mahal secara komputasi untuk banyak fitur.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // MARK: - Feature Engineering (Questions 41-50)
    Question(
        id: "preproc_041",
        questionEN: "What is feature engineering?",
        questionID: "Apa itu feature engineering?",
        options: [
            QuestionOption(id: "a", textEN: "Creating new features from existing data to improve model performance", textID: "Membuat fitur baru dari data yang ada untuk meningkatkan performa model"),
            QuestionOption(id: "b", textEN: "Engineering the model architecture", textID: "Merekayasa arsitektur model"),
            QuestionOption(id: "c", textEN: "Collecting new data", textID: "Mengumpulkan data baru"),
            QuestionOption(id: "d", textEN: "Only selecting features", textID: "Hanya memilih fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Feature engineering transforms raw data into informative features. Examples: extracting day of week from date, creating interaction terms, binning continuous variables.",
        explanationID: "Feature engineering mentransformasi data mentah menjadi fitur informatif. Contoh: mengekstrak hari dalam minggu dari tanggal, membuat term interaksi, binning variabel kontinu.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_042",
        questionEN: "What are interaction features?",
        questionID: "Apa itu fitur interaksi?",
        options: [
            QuestionOption(id: "a", textEN: "New features created by combining two or more features (e.g., multiplication)", textID: "Fitur baru yang dibuat dengan menggabungkan dua atau lebih fitur (misal, perkalian)"),
            QuestionOption(id: "b", textEN: "Features that interact with the user", textID: "Fitur yang berinteraksi dengan pengguna"),
            QuestionOption(id: "c", textEN: "Only for interactive applications", textID: "Hanya untuk aplikasi interaktif"),
            QuestionOption(id: "d", textEN: "Same as feature selection", textID: "Sama dengan seleksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Interaction features capture relationships between features. Example: price * quantity = total. PolynomialFeatures in sklearn creates interactions and polynomial terms.",
        explanationID: "Fitur interaksi menangkap hubungan antar fitur. Contoh: harga * kuantitas = total. PolynomialFeatures di sklearn membuat interaksi dan term polinomial.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_043",
        questionEN: "What is binning (discretization)?",
        questionID: "Apa itu binning (diskretisasi)?",
        options: [
            QuestionOption(id: "a", textEN: "Converting continuous variables into categorical bins", textID: "Mengonversi variabel kontinu menjadi bin kategoris"),
            QuestionOption(id: "b", textEN: "Removing data from bins", textID: "Menghapus data dari bin"),
            QuestionOption(id: "c", textEN: "Creating binary features", textID: "Membuat fitur biner"),
            QuestionOption(id: "d", textEN: "Compressing data into files", textID: "Mengompresi data ke file")
        ],
        correctOptionId: "a",
        explanationEN: "Binning groups continuous values into discrete bins. Methods: equal-width (fixed ranges), equal-frequency (equal counts per bin), or domain-specific boundaries.",
        explanationID: "Binning mengelompokkan nilai kontinu ke bin diskrit. Metode: equal-width (rentang tetap), equal-frequency (jumlah sama per bin), atau batas spesifik domain.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_044",
        questionEN: "What is PCA (Principal Component Analysis)?",
        questionID: "Apa itu PCA (Principal Component Analysis)?",
        options: [
            QuestionOption(id: "a", textEN: "Dimensionality reduction that finds orthogonal directions of maximum variance", textID: "Reduksi dimensionalitas yang menemukan arah ortogonal varians maksimum"),
            QuestionOption(id: "b", textEN: "A classification algorithm", textID: "Algoritma klasifikasi"),
            QuestionOption(id: "c", textEN: "Feature selection method", textID: "Metode seleksi fitur"),
            QuestionOption(id: "d", textEN: "Data cleaning technique", textID: "Teknik pembersihan data")
        ],
        correctOptionId: "a",
        explanationEN: "PCA projects data onto principal components (eigenvectors of covariance matrix) that capture most variance. It's unsupervised feature extraction, not selection.",
        explanationID: "PCA memproyeksikan data ke komponen utama (eigenvector dari matriks kovarians) yang menangkap varians terbanyak. Ini ekstraksi fitur unsupervised, bukan seleksi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_045",
        questionEN: "What is the difference between feature extraction and feature selection?",
        questionID: "Apa perbedaan antara ekstraksi fitur dan seleksi fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Extraction creates new features (PCA); selection chooses existing ones", textID: "Ekstraksi membuat fitur baru (PCA); seleksi memilih yang sudah ada"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Extraction is for images only", textID: "Ekstraksi hanya untuk gambar"),
            QuestionOption(id: "d", textEN: "Selection creates new features", textID: "Seleksi membuat fitur baru")
        ],
        correctOptionId: "a",
        explanationEN: "Feature selection keeps a subset of original features. Feature extraction creates new features by transforming/combining originals (PCA, autoencoders, embeddings).",
        explanationID: "Seleksi fitur menyimpan subset fitur asli. Ekstraksi fitur membuat fitur baru dengan mentransformasi/menggabungkan yang asli (PCA, autoencoder, embeddings).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_046",
        questionEN: "What are common datetime feature engineering techniques?",
        questionID: "Apa teknik feature engineering datetime yang umum?",
        options: [
            QuestionOption(id: "a", textEN: "Extract year, month, day, hour, day of week, is_weekend, etc.", textID: "Ekstrak tahun, bulan, hari, jam, hari dalam minggu, is_weekend, dll."),
            QuestionOption(id: "b", textEN: "Convert to unix timestamp only", textID: "Konversi ke unix timestamp saja"),
            QuestionOption(id: "c", textEN: "Delete datetime columns", textID: "Hapus kolom datetime"),
            QuestionOption(id: "d", textEN: "Only use the year", textID: "Hanya gunakan tahun")
        ],
        correctOptionId: "a",
        explanationEN: "Datetime features can capture cyclical patterns: hour (time of day), day_of_week (weekly patterns), month (seasonal). Cyclical encoding (sin/cos) preserves continuity.",
        explanationID: "Fitur datetime dapat menangkap pola siklis: jam (waktu hari), day_of_week (pola mingguan), bulan (musiman). Encoding siklis (sin/cos) mempertahankan kontinuitas.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "preproc_047",
        questionEN: "What is cyclical encoding for features like hour or day of week?",
        questionID: "Apa itu cyclical encoding untuk fitur seperti jam atau hari dalam minggu?",
        options: [
            QuestionOption(id: "a", textEN: "Use sin and cos transformations to preserve cyclical continuity", textID: "Gunakan transformasi sin dan cos untuk mempertahankan kontinuitas siklis"),
            QuestionOption(id: "b", textEN: "Use one-hot encoding", textID: "Gunakan one-hot encoding"),
            QuestionOption(id: "c", textEN: "Use simple integer encoding", textID: "Gunakan encoding integer sederhana"),
            QuestionOption(id: "d", textEN: "Only use the raw values", textID: "Hanya gunakan nilai mentah")
        ],
        correctOptionId: "a",
        explanationEN: "sin(2π*x/period) and cos(2π*x/period) create two features that preserve the fact that hour 23 is close to hour 0, or day 6 is close to day 0.",
        explanationID: "sin(2π*x/period) dan cos(2π*x/period) membuat dua fitur yang mempertahankan fakta bahwa jam 23 dekat dengan jam 0, atau hari 6 dekat dengan hari 0.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_048",
        questionEN: "What is text feature engineering?",
        questionID: "Apa itu feature engineering teks?",
        options: [
            QuestionOption(id: "a", textEN: "Creating numerical features from text: length, word count, TF-IDF, embeddings", textID: "Membuat fitur numerik dari teks: panjang, jumlah kata, TF-IDF, embeddings"),
            QuestionOption(id: "b", textEN: "Only counting words", textID: "Hanya menghitung kata"),
            QuestionOption(id: "c", textEN: "Deleting all text columns", textID: "Menghapus semua kolom teks"),
            QuestionOption(id: "d", textEN: "Converting text to images", textID: "Mengonversi teks ke gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Text features include: basic stats (length, word count), bag-of-words, TF-IDF vectors, word embeddings (Word2Vec, BERT). Choice depends on task and data size.",
        explanationID: "Fitur teks meliputi: statistik dasar (panjang, jumlah kata), bag-of-words, vektor TF-IDF, word embeddings (Word2Vec, BERT). Pilihan tergantung tugas dan ukuran data.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_049",
        questionEN: "What are aggregation features in feature engineering?",
        questionID: "Apa itu fitur agregasi dalam feature engineering?",
        options: [
            QuestionOption(id: "a", textEN: "Statistical summaries grouped by category: mean, count, max per group", textID: "Ringkasan statistik dikelompokkan berdasarkan kategori: mean, count, max per grup"),
            QuestionOption(id: "b", textEN: "Combining all data into one row", textID: "Menggabungkan semua data ke satu baris"),
            QuestionOption(id: "c", textEN: "Only for time series", textID: "Hanya untuk time series"),
            QuestionOption(id: "d", textEN: "Removing aggregated data", textID: "Menghapus data teragregasi")
        ],
        correctOptionId: "a",
        explanationEN: "Aggregation features summarize related records. Example: for customer prediction, add features like 'average purchase amount', 'total orders', 'days since last purchase' per customer.",
        explanationID: "Fitur agregasi meringkas rekaman terkait. Contoh: untuk prediksi pelanggan, tambahkan fitur seperti 'rata-rata jumlah pembelian', 'total pesanan', 'hari sejak pembelian terakhir' per pelanggan.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "preproc_050",
        questionEN: "What is the importance of domain knowledge in feature engineering?",
        questionID: "Apa pentingnya pengetahuan domain dalam feature engineering?",
        options: [
            QuestionOption(id: "a", textEN: "Enables creating meaningful features that algorithms can't discover automatically", textID: "Memungkinkan pembuatan fitur bermakna yang algoritma tidak dapat temukan secara otomatis"),
            QuestionOption(id: "b", textEN: "Domain knowledge is not important", textID: "Pengetahuan domain tidak penting"),
            QuestionOption(id: "c", textEN: "Only matters for simple models", textID: "Hanya penting untuk model sederhana"),
            QuestionOption(id: "d", textEN: "Algorithms always find optimal features", textID: "Algoritma selalu menemukan fitur optimal")
        ],
        correctOptionId: "a",
        explanationEN: "Domain experts can create features capturing business logic, physical laws, or domain-specific patterns that pure data-driven approaches might miss. It often provides the biggest performance gains.",
        explanationID: "Ahli domain dapat membuat fitur yang menangkap logika bisnis, hukum fisika, atau pola spesifik domain yang pendekatan murni berbasis data mungkin lewatkan. Ini sering memberikan peningkatan performa terbesar.",
        topic: "computing",
        difficulty: .beginner
    )
]
