import Foundation

// MARK: - Classical ML: Supervised Learning Questions (50 questions)
// Aligned with IOAI/NOAI Syllabus: Linear Regression, Logistic Regression, SVM, Decision Trees, kNN, Ensemble Learning
let supervisedLearningQuestions: [Question] = [
    // Linear Regression
    Question(
        id: "sl001",
        questionEN: "In linear regression, what does the closed-form solution β = (XᵀX)⁻¹Xᵀy represent?",
        questionID: "Dalam regresi linear, apa yang direpresentasikan solusi closed-form β = (XᵀX)⁻¹Xᵀy?",
        options: [
            QuestionOption(id: "a", textEN: "Ordinary Least Squares (OLS) estimator", textID: "Estimator Ordinary Least Squares (OLS)"),
            QuestionOption(id: "b", textEN: "Maximum likelihood estimator only", textID: "Estimator maximum likelihood saja"),
            QuestionOption(id: "c", textEN: "Ridge regression solution", textID: "Solusi ridge regression"),
            QuestionOption(id: "d", textEN: "Gradient descent result", textID: "Hasil gradient descent")
        ],
        correctOptionId: "a",
        explanationEN: "The normal equation β = (XᵀX)⁻¹Xᵀy gives the OLS estimator that minimizes the sum of squared residuals.",
        explanationID: "Persamaan normal β = (XᵀX)⁻¹Xᵀy memberikan estimator OLS yang meminimalkan jumlah kuadrat residual.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl002",
        questionEN: "What is the purpose of the bias term (intercept) in linear regression?",
        questionID: "Apa tujuan bias term (intercept) dalam regresi linear?",
        options: [
            QuestionOption(id: "a", textEN: "To allow the line to not pass through the origin", textID: "Agar garis tidak harus melewati titik origin"),
            QuestionOption(id: "b", textEN: "To reduce overfitting", textID: "Untuk mengurangi overfitting"),
            QuestionOption(id: "c", textEN: "To normalize the features", textID: "Untuk menormalisasi fitur"),
            QuestionOption(id: "d", textEN: "To increase model complexity", textID: "Untuk meningkatkan kompleksitas model")
        ],
        correctOptionId: "a",
        explanationEN: "The bias/intercept term allows the regression line to shift up or down, not forcing it through (0,0).",
        explanationID: "Bias/intercept memungkinkan garis regresi bergeser naik atau turun, tidak memaksanya melewati (0,0).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl003",
        questionEN: "In Ridge regression, the regularization term λ||β||² is added to prevent:",
        questionID: "Dalam Ridge regression, term regularisasi λ||β||² ditambahkan untuk mencegah:",
        options: [
            QuestionOption(id: "a", textEN: "Overfitting by shrinking coefficients", textID: "Overfitting dengan menyusutkan koefisien"),
            QuestionOption(id: "b", textEN: "Underfitting", textID: "Underfitting"),
            QuestionOption(id: "c", textEN: "Data preprocessing", textID: "Preprocessing data"),
            QuestionOption(id: "d", textEN: "Feature extraction", textID: "Ekstraksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Ridge regression adds L2 penalty λ||β||² to shrink coefficients toward zero, reducing overfitting.",
        explanationID: "Ridge regression menambahkan L2 penalty λ||β||² untuk menyusutkan koefisien mendekati nol, mengurangi overfitting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl004",
        questionEN: "Lasso regression (L1 regularization) differs from Ridge because it can:",
        questionID: "Lasso regression (regularisasi L1) berbeda dari Ridge karena dapat:",
        options: [
            QuestionOption(id: "a", textEN: "Set some coefficients exactly to zero (feature selection)", textID: "Mengatur beberapa koefisien tepat ke nol (seleksi fitur)"),
            QuestionOption(id: "b", textEN: "Always produce better results", textID: "Selalu menghasilkan hasil lebih baik"),
            QuestionOption(id: "c", textEN: "Work without regularization parameter", textID: "Bekerja tanpa parameter regularisasi"),
            QuestionOption(id: "d", textEN: "Handle only categorical variables", textID: "Hanya menangani variabel kategorikal")
        ],
        correctOptionId: "a",
        explanationEN: "L1 penalty ||β||₁ can drive coefficients to exactly zero, effectively performing feature selection.",
        explanationID: "L1 penalty ||β||₁ dapat mendorong koefisien ke tepat nol, secara efektif melakukan seleksi fitur.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl005",
        questionEN: "What does R² (coefficient of determination) measure in regression?",
        questionID: "Apa yang diukur R² (koefisien determinasi) dalam regresi?",
        options: [
            QuestionOption(id: "a", textEN: "Proportion of variance explained by the model", textID: "Proporsi variansi yang dijelaskan oleh model"),
            QuestionOption(id: "b", textEN: "The correlation between features", textID: "Korelasi antara fitur"),
            QuestionOption(id: "c", textEN: "The number of features", textID: "Jumlah fitur"),
            QuestionOption(id: "d", textEN: "The bias in predictions", textID: "Bias dalam prediksi")
        ],
        correctOptionId: "a",
        explanationEN: "R² = 1 - (SS_res/SS_tot) measures the proportion of variance in y explained by the model.",
        explanationID: "R² = 1 - (SS_res/SS_tot) mengukur proporsi variansi dalam y yang dijelaskan oleh model.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // Logistic Regression
    Question(
        id: "sl006",
        questionEN: "Logistic regression uses the sigmoid function σ(z) = 1/(1+e⁻ᶻ) to:",
        questionID: "Regresi logistik menggunakan fungsi sigmoid σ(z) = 1/(1+e⁻ᶻ) untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Map outputs to probabilities between 0 and 1", textID: "Memetakan output ke probabilitas antara 0 dan 1"),
            QuestionOption(id: "b", textEN: "Increase model capacity", textID: "Meningkatkan kapasitas model"),
            QuestionOption(id: "c", textEN: "Handle multi-class problems only", textID: "Hanya menangani masalah multi-class"),
            QuestionOption(id: "d", textEN: "Reduce training time", textID: "Mengurangi waktu training")
        ],
        correctOptionId: "a",
        explanationEN: "Sigmoid squashes any real number to (0,1), interpretable as probability of positive class.",
        explanationID: "Sigmoid menekan bilangan real apapun ke (0,1), dapat diinterpretasikan sebagai probabilitas kelas positif.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl007",
        questionEN: "The loss function for logistic regression is:",
        questionID: "Fungsi loss untuk regresi logistik adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Binary cross-entropy (log loss)", textID: "Binary cross-entropy (log loss)"),
            QuestionOption(id: "b", textEN: "Mean squared error", textID: "Mean squared error"),
            QuestionOption(id: "c", textEN: "Hinge loss", textID: "Hinge loss"),
            QuestionOption(id: "d", textEN: "Huber loss", textID: "Huber loss")
        ],
        correctOptionId: "a",
        explanationEN: "Log loss: -Σ[y·log(p) + (1-y)·log(1-p)]. Derived from maximum likelihood for Bernoulli distribution.",
        explanationID: "Log loss: -Σ[y·log(p) + (1-y)·log(1-p)]. Diturunkan dari maximum likelihood untuk distribusi Bernoulli.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl008",
        questionEN: "In multi-class classification, softmax regression outputs:",
        questionID: "Dalam klasifikasi multi-class, softmax regression menghasilkan:",
        options: [
            QuestionOption(id: "a", textEN: "Probability distribution over all classes (sum to 1)", textID: "Distribusi probabilitas atas semua kelas (jumlah = 1)"),
            QuestionOption(id: "b", textEN: "Independent probabilities for each class", textID: "Probabilitas independen untuk setiap kelas"),
            QuestionOption(id: "c", textEN: "Binary predictions only", textID: "Hanya prediksi biner"),
            QuestionOption(id: "d", textEN: "Continuous values", textID: "Nilai kontinu")
        ],
        correctOptionId: "a",
        explanationEN: "Softmax: σ(zᵢ) = e^zᵢ / Σe^zⱼ ensures outputs form a valid probability distribution.",
        explanationID: "Softmax: σ(zᵢ) = e^zᵢ / Σe^zⱼ memastikan output membentuk distribusi probabilitas valid.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl009",
        questionEN: "Why is logistic regression called 'regression' when it's used for classification?",
        questionID: "Mengapa regresi logistik disebut 'regresi' padahal digunakan untuk klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "It regresses log-odds of class probability", textID: "Ia meregresikan log-odds dari probabilitas kelas"),
            QuestionOption(id: "b", textEN: "It was named incorrectly", textID: "Diberi nama secara salah"),
            QuestionOption(id: "c", textEN: "It predicts continuous values", textID: "Ia memprediksi nilai kontinu"),
            QuestionOption(id: "d", textEN: "It uses regression loss", textID: "Ia menggunakan loss regresi")
        ],
        correctOptionId: "a",
        explanationEN: "Logistic regression models log(p/(1-p)) = wᵀx, regressing the log-odds (logit) of probability.",
        explanationID: "Regresi logistik memodelkan log(p/(1-p)) = wᵀx, meregresikan log-odds (logit) dari probabilitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl010",
        questionEN: "The decision boundary in logistic regression is:",
        questionID: "Decision boundary dalam regresi logistik adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Linear (a hyperplane in feature space)", textID: "Linear (sebuah hyperplane dalam ruang fitur)"),
            QuestionOption(id: "b", textEN: "Always circular", textID: "Selalu berbentuk lingkaran"),
            QuestionOption(id: "c", textEN: "Non-linear by default", textID: "Non-linear secara default"),
            QuestionOption(id: "d", textEN: "Determined by k neighbors", textID: "Ditentukan oleh k tetangga")
        ],
        correctOptionId: "a",
        explanationEN: "Logistic regression decision boundary is where wᵀx + b = 0, forming a linear hyperplane.",
        explanationID: "Decision boundary regresi logistik adalah dimana wᵀx + b = 0, membentuk hyperplane linear.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Support Vector Machines
    Question(
        id: "sl011",
        questionEN: "What does SVM maximize to find the optimal hyperplane?",
        questionID: "Apa yang dimaksimalkan SVM untuk menemukan hyperplane optimal?",
        options: [
            QuestionOption(id: "a", textEN: "The margin between classes", textID: "Margin antara kelas"),
            QuestionOption(id: "b", textEN: "The number of support vectors", textID: "Jumlah support vector"),
            QuestionOption(id: "c", textEN: "The training accuracy", textID: "Akurasi training"),
            QuestionOption(id: "d", textEN: "The model complexity", textID: "Kompleksitas model")
        ],
        correctOptionId: "a",
        explanationEN: "SVM finds the hyperplane with maximum margin (distance to nearest points from each class).",
        explanationID: "SVM menemukan hyperplane dengan margin maksimum (jarak ke titik terdekat dari setiap kelas).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl012",
        questionEN: "Support vectors in SVM are:",
        questionID: "Support vector dalam SVM adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Data points closest to the decision boundary", textID: "Titik data terdekat dengan decision boundary"),
            QuestionOption(id: "b", textEN: "All training examples", textID: "Semua contoh training"),
            QuestionOption(id: "c", textEN: "Points farthest from the boundary", textID: "Titik terjauh dari boundary"),
            QuestionOption(id: "d", textEN: "Randomly selected points", textID: "Titik yang dipilih secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Support vectors lie on the margin boundaries. Only these points determine the hyperplane.",
        explanationID: "Support vector terletak pada batas margin. Hanya titik-titik ini yang menentukan hyperplane.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl013",
        questionEN: "The kernel trick in SVM allows:",
        questionID: "Kernel trick dalam SVM memungkinkan:",
        options: [
            QuestionOption(id: "a", textEN: "Implicit mapping to high-dimensional space without computing coordinates", textID: "Pemetaan implisit ke ruang berdimensi tinggi tanpa menghitung koordinat"),
            QuestionOption(id: "b", textEN: "Faster training on small datasets", textID: "Training lebih cepat pada dataset kecil"),
            QuestionOption(id: "c", textEN: "Reducing the number of features", textID: "Mengurangi jumlah fitur"),
            QuestionOption(id: "d", textEN: "Linear classification only", textID: "Hanya klasifikasi linear")
        ],
        correctOptionId: "a",
        explanationEN: "Kernels compute K(x,y) = φ(x)ᵀφ(y) without explicitly computing the high-dimensional mapping φ.",
        explanationID: "Kernel menghitung K(x,y) = φ(x)ᵀφ(y) tanpa secara eksplisit menghitung pemetaan dimensi tinggi φ.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "sl014",
        questionEN: "The RBF (Gaussian) kernel K(x,y) = exp(-γ||x-y||²) creates:",
        questionID: "Kernel RBF (Gaussian) K(x,y) = exp(-γ||x-y||²) membuat:",
        options: [
            QuestionOption(id: "a", textEN: "Non-linear decision boundaries in input space", textID: "Decision boundary non-linear dalam ruang input"),
            QuestionOption(id: "b", textEN: "Linear decision boundaries", textID: "Decision boundary linear"),
            QuestionOption(id: "c", textEN: "Polynomial features only", textID: "Hanya fitur polinomial"),
            QuestionOption(id: "d", textEN: "Circular boundaries only", textID: "Hanya boundary melingkar")
        ],
        correctOptionId: "a",
        explanationEN: "RBF kernel maps to infinite-dimensional space, enabling complex non-linear boundaries in original space.",
        explanationID: "Kernel RBF memetakan ke ruang berdimensi tak hingga, memungkinkan boundary non-linear kompleks di ruang asli.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "sl015",
        questionEN: "A kernel function K(x,y) is valid if and only if it is:",
        questionID: "Fungsi kernel K(x,y) valid jika dan hanya jika ia:",
        options: [
            QuestionOption(id: "a", textEN: "Symmetric and positive semi-definite (Mercer's condition)", textID: "Simetris dan positive semi-definite (kondisi Mercer)"),
            QuestionOption(id: "b", textEN: "Any continuous function", textID: "Sembarang fungsi kontinu"),
            QuestionOption(id: "c", textEN: "A polynomial function", textID: "Sebuah fungsi polinomial"),
            QuestionOption(id: "d", textEN: "An increasing function", textID: "Sebuah fungsi naik")
        ],
        correctOptionId: "a",
        explanationEN: "Mercer's theorem: K is a valid kernel if the kernel matrix is positive semi-definite for any data.",
        explanationID: "Teorema Mercer: K adalah kernel valid jika matriks kernel adalah positive semi-definite untuk sembarang data.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Decision Trees
    Question(
        id: "sl016",
        questionEN: "Information Gain in decision trees measures:",
        questionID: "Information Gain dalam decision tree mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Reduction in entropy after splitting", textID: "Pengurangan entropi setelah splitting"),
            QuestionOption(id: "b", textEN: "Number of leaves", textID: "Jumlah daun"),
            QuestionOption(id: "c", textEN: "Tree depth", textID: "Kedalaman pohon"),
            QuestionOption(id: "d", textEN: "Training accuracy", textID: "Akurasi training")
        ],
        correctOptionId: "a",
        explanationEN: "IG = H(parent) - Σ(weighted H(children)). Higher IG means better split for classification.",
        explanationID: "IG = H(parent) - Σ(weighted H(children)). IG lebih tinggi berarti split lebih baik untuk klasifikasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl017",
        questionEN: "Gini impurity for a node with class probabilities [0.6, 0.4] is:",
        questionID: "Gini impurity untuk node dengan probabilitas kelas [0.6, 0.4] adalah:",
        options: [
            QuestionOption(id: "a", textEN: "0.48", textID: "0.48"),
            QuestionOption(id: "b", textEN: "0.36", textID: "0.36"),
            QuestionOption(id: "c", textEN: "0.64", textID: "0.64"),
            QuestionOption(id: "d", textEN: "1.0", textID: "1.0")
        ],
        correctOptionId: "a",
        explanationEN: "Gini = 1 - Σpᵢ² = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 0.48",
        explanationID: "Gini = 1 - Σpᵢ² = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 0.48",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl018",
        questionEN: "Pruning a decision tree helps to:",
        questionID: "Pruning decision tree membantu untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Reduce overfitting by removing subtrees", textID: "Mengurangi overfitting dengan menghapus subtree"),
            QuestionOption(id: "b", textEN: "Increase tree depth", textID: "Meningkatkan kedalaman pohon"),
            QuestionOption(id: "c", textEN: "Add more features", textID: "Menambah lebih banyak fitur"),
            QuestionOption(id: "d", textEN: "Speed up training", textID: "Mempercepat training")
        ],
        correctOptionId: "a",
        explanationEN: "Pruning removes branches that don't improve generalization, preventing overfitting to training noise.",
        explanationID: "Pruning menghapus cabang yang tidak meningkatkan generalisasi, mencegah overfitting pada noise training.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl019",
        questionEN: "The entropy of a perfectly pure node (all same class) is:",
        questionID: "Entropi dari node yang sempurna murni (semua kelas sama) adalah:",
        options: [
            QuestionOption(id: "a", textEN: "0", textID: "0"),
            QuestionOption(id: "b", textEN: "1", textID: "1"),
            QuestionOption(id: "c", textEN: "0.5", textID: "0.5"),
            QuestionOption(id: "d", textEN: "Undefined", textID: "Tidak terdefinisi")
        ],
        correctOptionId: "a",
        explanationEN: "Entropy H = -Σpᵢlog(pᵢ). With only one class (p=1), H = -1×log(1) = 0.",
        explanationID: "Entropi H = -Σpᵢlog(pᵢ). Dengan hanya satu kelas (p=1), H = -1×log(1) = 0.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl020",
        questionEN: "Decision trees are prone to high variance because:",
        questionID: "Decision tree rentan terhadap variansi tinggi karena:",
        options: [
            QuestionOption(id: "a", textEN: "Small changes in data can create very different trees", textID: "Perubahan kecil pada data dapat membuat pohon yang sangat berbeda"),
            QuestionOption(id: "b", textEN: "They always underfit", textID: "Mereka selalu underfit"),
            QuestionOption(id: "c", textEN: "They use too few features", textID: "Mereka menggunakan terlalu sedikit fitur"),
            QuestionOption(id: "d", textEN: "They cannot handle numerical data", textID: "Mereka tidak dapat menangani data numerik")
        ],
        correctOptionId: "a",
        explanationEN: "Decision trees are unstable: slight data variations can lead to different splits and tree structures.",
        explanationID: "Decision tree tidak stabil: variasi data sedikit dapat menyebabkan split dan struktur pohon berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // k-Nearest Neighbors
    Question(
        id: "sl021",
        questionEN: "In kNN classification, what happens when k increases?",
        questionID: "Dalam klasifikasi kNN, apa yang terjadi ketika k bertambah?",
        options: [
            QuestionOption(id: "a", textEN: "Decision boundary becomes smoother (less variance)", textID: "Decision boundary menjadi lebih halus (variansi lebih rendah)"),
            QuestionOption(id: "b", textEN: "Decision boundary becomes more complex", textID: "Decision boundary menjadi lebih kompleks"),
            QuestionOption(id: "c", textEN: "Training time increases significantly", textID: "Waktu training meningkat signifikan"),
            QuestionOption(id: "d", textEN: "Accuracy always improves", textID: "Akurasi selalu meningkat")
        ],
        correctOptionId: "a",
        explanationEN: "Larger k averages more neighbors, creating smoother boundaries. Trade-off: lower variance but higher bias.",
        explanationID: "k lebih besar merata-ratakan lebih banyak tetangga, membuat boundary lebih halus. Trade-off: variansi lebih rendah tapi bias lebih tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl022",
        questionEN: "Why should features be normalized before using kNN?",
        questionID: "Mengapa fitur harus dinormalisasi sebelum menggunakan kNN?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent features with larger scales from dominating distance", textID: "Untuk mencegah fitur dengan skala lebih besar mendominasi jarak"),
            QuestionOption(id: "b", textEN: "To speed up training", textID: "Untuk mempercepat training"),
            QuestionOption(id: "c", textEN: "To reduce the number of neighbors", textID: "Untuk mengurangi jumlah tetangga"),
            QuestionOption(id: "d", textEN: "It's optional and has no effect", textID: "Opsional dan tidak berpengaruh")
        ],
        correctOptionId: "a",
        explanationEN: "kNN uses distance metrics. Without normalization, features with large ranges dominate the distance calculation.",
        explanationID: "kNN menggunakan metrik jarak. Tanpa normalisasi, fitur dengan rentang besar mendominasi perhitungan jarak.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl023",
        questionEN: "The time complexity of brute-force kNN prediction for n training points is:",
        questionID: "Kompleksitas waktu prediksi kNN brute-force untuk n titik training adalah:",
        options: [
            QuestionOption(id: "a", textEN: "O(n) per query (plus O(d) for each distance)", textID: "O(n) per query (plus O(d) untuk setiap jarak)"),
            QuestionOption(id: "b", textEN: "O(1)", textID: "O(1)"),
            QuestionOption(id: "c", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "d", textEN: "O(k)", textID: "O(k)")
        ],
        correctOptionId: "a",
        explanationEN: "Brute-force kNN computes distance to all n points. KD-trees can reduce this to O(log n) in low dimensions.",
        explanationID: "kNN brute-force menghitung jarak ke semua n titik. KD-tree dapat mengurangi ini ke O(log n) di dimensi rendah.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl024",
        questionEN: "Which distance metric is most commonly used in kNN?",
        questionID: "Metrik jarak mana yang paling sering digunakan dalam kNN?",
        options: [
            QuestionOption(id: "a", textEN: "Euclidean distance (L2 norm)", textID: "Jarak Euclidean (L2 norm)"),
            QuestionOption(id: "b", textEN: "Hamming distance", textID: "Jarak Hamming"),
            QuestionOption(id: "c", textEN: "Cosine similarity", textID: "Kesamaan kosinus"),
            QuestionOption(id: "d", textEN: "Jaccard distance", textID: "Jarak Jaccard")
        ],
        correctOptionId: "a",
        explanationEN: "Euclidean distance d(x,y) = √Σ(xᵢ-yᵢ)² is the default for continuous features in kNN.",
        explanationID: "Jarak Euclidean d(x,y) = √Σ(xᵢ-yᵢ)² adalah default untuk fitur kontinu dalam kNN.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl025",
        questionEN: "kNN is called a 'lazy learner' because:",
        questionID: "kNN disebut 'lazy learner' karena:",
        options: [
            QuestionOption(id: "a", textEN: "It stores training data and defers computation to prediction time", textID: "Ia menyimpan data training dan menunda komputasi ke waktu prediksi"),
            QuestionOption(id: "b", textEN: "It learns slowly", textID: "Ia belajar dengan lambat"),
            QuestionOption(id: "c", textEN: "It uses simple algorithms", textID: "Ia menggunakan algoritma sederhana"),
            QuestionOption(id: "d", textEN: "It requires minimal data", textID: "Ia membutuhkan data minimal")
        ],
        correctOptionId: "a",
        explanationEN: "Lazy learning: no explicit training phase. All work happens during prediction by comparing with stored examples.",
        explanationID: "Lazy learning: tidak ada fase training eksplisit. Semua pekerjaan terjadi saat prediksi dengan membandingkan dengan contoh tersimpan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Ensemble Methods
    Question(
        id: "sl026",
        questionEN: "Bagging (Bootstrap Aggregating) reduces prediction variance by:",
        questionID: "Bagging (Bootstrap Aggregating) mengurangi variansi prediksi dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Training multiple models on bootstrap samples and averaging", textID: "Melatih beberapa model pada sampel bootstrap dan merata-ratakan"),
            QuestionOption(id: "b", textEN: "Using a single deep model", textID: "Menggunakan satu model dalam"),
            QuestionOption(id: "c", textEN: "Increasing regularization", textID: "Meningkatkan regularisasi"),
            QuestionOption(id: "d", textEN: "Feature selection", textID: "Seleksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Bagging creates B bootstrap samples, trains B models, averages predictions. Reduces variance of unstable learners.",
        explanationID: "Bagging membuat B sampel bootstrap, melatih B model, merata-ratakan prediksi. Mengurangi variansi learner tidak stabil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl027",
        questionEN: "Random Forest improves upon bagging by also:",
        questionID: "Random Forest memperbaiki bagging dengan juga:",
        options: [
            QuestionOption(id: "a", textEN: "Using random subset of features at each split", textID: "Menggunakan subset acak dari fitur di setiap split"),
            QuestionOption(id: "b", textEN: "Using deeper trees", textID: "Menggunakan pohon lebih dalam"),
            QuestionOption(id: "c", textEN: "Weighted voting", textID: "Voting berbobot"),
            QuestionOption(id: "d", textEN: "Sequential training", textID: "Training sekuensial")
        ],
        correctOptionId: "a",
        explanationEN: "Random Forest decorrelates trees by randomly selecting √p features (classification) at each split.",
        explanationID: "Random Forest mendekorerelasikan pohon dengan secara acak memilih √p fitur (klasifikasi) di setiap split.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl028",
        questionEN: "Boosting differs from bagging because it:",
        questionID: "Boosting berbeda dari bagging karena ia:",
        options: [
            QuestionOption(id: "a", textEN: "Trains models sequentially, focusing on previous errors", textID: "Melatih model secara sekuensial, fokus pada kesalahan sebelumnya"),
            QuestionOption(id: "b", textEN: "Trains models in parallel", textID: "Melatih model secara paralel"),
            QuestionOption(id: "c", textEN: "Uses the same data for all models", textID: "Menggunakan data yang sama untuk semua model"),
            QuestionOption(id: "d", textEN: "Only works with decision trees", textID: "Hanya bekerja dengan decision tree")
        ],
        correctOptionId: "a",
        explanationEN: "Boosting is sequential: each model focuses on examples the previous model got wrong. Reduces bias.",
        explanationID: "Boosting adalah sekuensial: setiap model fokus pada contoh yang salah diprediksi model sebelumnya. Mengurangi bias.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl029",
        questionEN: "In AdaBoost, misclassified examples are:",
        questionID: "Dalam AdaBoost, contoh yang salah diklasifikasikan:",
        options: [
            QuestionOption(id: "a", textEN: "Given higher weights for the next iteration", textID: "Diberi bobot lebih tinggi untuk iterasi berikutnya"),
            QuestionOption(id: "b", textEN: "Removed from training", textID: "Dihapus dari training"),
            QuestionOption(id: "c", textEN: "Duplicated", textID: "Diduplikasi"),
            QuestionOption(id: "d", textEN: "Given lower weights", textID: "Diberi bobot lebih rendah")
        ],
        correctOptionId: "a",
        explanationEN: "AdaBoost increases weights of misclassified samples, forcing next weak learner to focus on hard examples.",
        explanationID: "AdaBoost meningkatkan bobot sampel yang salah diklasifikasikan, memaksa weak learner berikutnya fokus pada contoh sulit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl030",
        questionEN: "Gradient Boosting minimizes the loss by:",
        questionID: "Gradient Boosting meminimalkan loss dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Fitting new models to the negative gradient of the loss", textID: "Menyesuaikan model baru ke gradien negatif dari loss"),
            QuestionOption(id: "b", textEN: "Using random subsets of features", textID: "Menggunakan subset acak dari fitur"),
            QuestionOption(id: "c", textEN: "Averaging all predictions equally", textID: "Merata-ratakan semua prediksi secara sama"),
            QuestionOption(id: "d", textEN: "Maximizing information gain", textID: "Memaksimalkan information gain")
        ],
        correctOptionId: "a",
        explanationEN: "Each new tree fits the residuals (negative gradient). Prediction is sum of all trees scaled by learning rate.",
        explanationID: "Setiap pohon baru menyesuaikan residual (gradien negatif). Prediksi adalah jumlah semua pohon yang diskalakan oleh learning rate.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Bias-Variance Tradeoff
    Question(
        id: "sl031",
        questionEN: "The bias-variance decomposition of expected squared error is:",
        questionID: "Dekomposisi bias-variance dari expected squared error adalah:",
        options: [
            QuestionOption(id: "a", textEN: "E[(y - ŷ)²] = Bias² + Variance + Irreducible Error", textID: "E[(y - ŷ)²] = Bias² + Variance + Irreducible Error"),
            QuestionOption(id: "b", textEN: "E[(y - ŷ)²] = Bias + Variance", textID: "E[(y - ŷ)²] = Bias + Variance"),
            QuestionOption(id: "c", textEN: "E[(y - ŷ)²] = Bias² × Variance", textID: "E[(y - ŷ)²] = Bias² × Variance"),
            QuestionOption(id: "d", textEN: "E[(y - ŷ)²] = Bias / Variance", textID: "E[(y - ŷ)²] = Bias / Variance")
        ],
        correctOptionId: "a",
        explanationEN: "Expected error = (E[ŷ] - f(x))² + E[(ŷ - E[ŷ])²] + σ². Bias² + Variance + Noise.",
        explanationID: "Expected error = (E[ŷ] - f(x))² + E[(ŷ - E[ŷ])²] + σ². Bias² + Variance + Noise.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "sl032",
        questionEN: "A model with high bias and low variance is likely:",
        questionID: "Model dengan bias tinggi dan variansi rendah kemungkinan:",
        options: [
            QuestionOption(id: "a", textEN: "Underfitting (too simple)", textID: "Underfitting (terlalu sederhana)"),
            QuestionOption(id: "b", textEN: "Overfitting", textID: "Overfitting"),
            QuestionOption(id: "c", textEN: "Perfectly fitted", textID: "Pas secara sempurna"),
            QuestionOption(id: "d", textEN: "Highly flexible", textID: "Sangat fleksibel")
        ],
        correctOptionId: "a",
        explanationEN: "High bias = model too simple to capture patterns. Low variance = consistent across datasets. Underfitting.",
        explanationID: "Bias tinggi = model terlalu sederhana untuk menangkap pola. Variansi rendah = konsisten di seluruh dataset. Underfitting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl033",
        questionEN: "As model complexity increases:",
        questionID: "Ketika kompleksitas model meningkat:",
        options: [
            QuestionOption(id: "a", textEN: "Bias decreases and variance increases", textID: "Bias menurun dan variansi meningkat"),
            QuestionOption(id: "b", textEN: "Both bias and variance decrease", textID: "Baik bias maupun variansi menurun"),
            QuestionOption(id: "c", textEN: "Both bias and variance increase", textID: "Baik bias maupun variansi meningkat"),
            QuestionOption(id: "d", textEN: "Bias increases and variance decreases", textID: "Bias meningkat dan variansi menurun")
        ],
        correctOptionId: "a",
        explanationEN: "Complex models fit data better (lower bias) but are sensitive to training data (higher variance).",
        explanationID: "Model kompleks menyesuaikan data lebih baik (bias lebih rendah) tapi sensitif terhadap data training (variansi lebih tinggi).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl034",
        questionEN: "The optimal model complexity is found at:",
        questionID: "Kompleksitas model optimal ditemukan pada:",
        options: [
            QuestionOption(id: "a", textEN: "The point where total error (bias² + variance) is minimized", textID: "Titik dimana total error (bias² + variance) diminimalkan"),
            QuestionOption(id: "b", textEN: "Maximum training accuracy", textID: "Akurasi training maksimum"),
            QuestionOption(id: "c", textEN: "Maximum model parameters", textID: "Parameter model maksimum"),
            QuestionOption(id: "d", textEN: "Zero training error", textID: "Error training nol")
        ],
        correctOptionId: "a",
        explanationEN: "Optimal complexity balances bias and variance. Found via cross-validation on generalization error.",
        explanationID: "Kompleksitas optimal menyeimbangkan bias dan variansi. Ditemukan via cross-validation pada error generalisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl035",
        questionEN: "Regularization primarily helps by:",
        questionID: "Regularisasi terutama membantu dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Reducing variance at the cost of slightly higher bias", textID: "Mengurangi variansi dengan biaya bias sedikit lebih tinggi"),
            QuestionOption(id: "b", textEN: "Reducing bias only", textID: "Hanya mengurangi bias"),
            QuestionOption(id: "c", textEN: "Increasing model complexity", textID: "Meningkatkan kompleksitas model"),
            QuestionOption(id: "d", textEN: "Speeding up training", textID: "Mempercepat training")
        ],
        correctOptionId: "a",
        explanationEN: "Regularization constrains model, reducing variance (overfitting) but may increase bias slightly.",
        explanationID: "Regularisasi membatasi model, mengurangi variansi (overfitting) tapi mungkin sedikit meningkatkan bias.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Cross-Validation
    Question(
        id: "sl036",
        questionEN: "In k-fold cross-validation, what is the purpose of the folds?",
        questionID: "Dalam k-fold cross-validation, apa tujuan dari fold?",
        options: [
            QuestionOption(id: "a", textEN: "Each fold serves as validation set once while others train", textID: "Setiap fold menjadi set validasi sekali sementara yang lain melatih"),
            QuestionOption(id: "b", textEN: "To increase training data", textID: "Untuk meningkatkan data training"),
            QuestionOption(id: "c", textEN: "To create k separate models for production", textID: "Untuk membuat k model terpisah untuk produksi"),
            QuestionOption(id: "d", textEN: "To test on multiple test sets", textID: "Untuk menguji pada beberapa set tes")
        ],
        correctOptionId: "a",
        explanationEN: "K-fold: split data into k parts, train on k-1, validate on 1, rotate k times. Average gives robust estimate.",
        explanationID: "K-fold: bagi data menjadi k bagian, latih pada k-1, validasi pada 1, rotasi k kali. Rata-rata memberikan estimasi robust.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl037",
        questionEN: "Leave-One-Out Cross-Validation (LOOCV) has:",
        questionID: "Leave-One-Out Cross-Validation (LOOCV) memiliki:",
        options: [
            QuestionOption(id: "a", textEN: "Low bias but high variance in the estimate", textID: "Bias rendah tapi variansi tinggi dalam estimasi"),
            QuestionOption(id: "b", textEN: "High bias but low variance", textID: "Bias tinggi tapi variansi rendah"),
            QuestionOption(id: "c", textEN: "Both low bias and low variance", textID: "Baik bias rendah maupun variansi rendah"),
            QuestionOption(id: "d", textEN: "Cannot be computed", textID: "Tidak dapat dihitung")
        ],
        correctOptionId: "a",
        explanationEN: "LOOCV uses n-1 samples for training (low bias) but estimates are highly correlated (high variance).",
        explanationID: "LOOCV menggunakan n-1 sampel untuk training (bias rendah) tapi estimasi sangat berkorelasi (variansi tinggi).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "sl038",
        questionEN: "Stratified k-fold is important for:",
        questionID: "Stratified k-fold penting untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Maintaining class proportions in each fold", textID: "Mempertahankan proporsi kelas di setiap fold"),
            QuestionOption(id: "b", textEN: "Reducing computation time", textID: "Mengurangi waktu komputasi"),
            QuestionOption(id: "c", textEN: "Handling missing values", textID: "Menangani nilai yang hilang"),
            QuestionOption(id: "d", textEN: "Feature scaling", textID: "Penskalaan fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Stratified sampling ensures each fold has the same class distribution as the full dataset. Critical for imbalanced data.",
        explanationID: "Stratified sampling memastikan setiap fold memiliki distribusi kelas sama dengan dataset penuh. Kritis untuk data tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl039",
        questionEN: "Why shouldn't you tune hyperparameters on the test set?",
        questionID: "Mengapa Anda tidak boleh menyetel hyperparameter pada set tes?",
        options: [
            QuestionOption(id: "a", textEN: "It leads to overfitting on test set, invalidating final evaluation", textID: "Ini menyebabkan overfitting pada set tes, membatalkan evaluasi akhir"),
            QuestionOption(id: "b", textEN: "Test sets are too small", textID: "Set tes terlalu kecil"),
            QuestionOption(id: "c", textEN: "It takes too long", textID: "Terlalu lama"),
            QuestionOption(id: "d", textEN: "The test set has different distribution", textID: "Set tes memiliki distribusi berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Using test set for tuning leaks information, making test performance optimistically biased.",
        explanationID: "Menggunakan set tes untuk tuning membocorkan informasi, membuat performa tes bias secara optimistis.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl040",
        questionEN: "The typical split for train/validation/test is:",
        questionID: "Split tipikal untuk train/validation/test adalah:",
        options: [
            QuestionOption(id: "a", textEN: "60%/20%/20% or 70%/15%/15%", textID: "60%/20%/20% atau 70%/15%/15%"),
            QuestionOption(id: "b", textEN: "50%/50%/0%", textID: "50%/50%/0%"),
            QuestionOption(id: "c", textEN: "90%/5%/5%", textID: "90%/5%/5%"),
            QuestionOption(id: "d", textEN: "33%/33%/33%", textID: "33%/33%/33%")
        ],
        correctOptionId: "a",
        explanationEN: "Common splits balance having enough training data with reliable validation/test estimates.",
        explanationID: "Split umum menyeimbangkan memiliki cukup data training dengan estimasi validasi/tes yang andal.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // Loss Functions
    Question(
        id: "sl041",
        questionEN: "Mean Squared Error (MSE) vs Mean Absolute Error (MAE): MSE is:",
        questionID: "Mean Squared Error (MSE) vs Mean Absolute Error (MAE): MSE adalah:",
        options: [
            QuestionOption(id: "a", textEN: "More sensitive to outliers due to squaring", textID: "Lebih sensitif terhadap outlier karena pengkuadratan"),
            QuestionOption(id: "b", textEN: "Less sensitive to outliers", textID: "Kurang sensitif terhadap outlier"),
            QuestionOption(id: "c", textEN: "Always better than MAE", textID: "Selalu lebih baik dari MAE"),
            QuestionOption(id: "d", textEN: "Not differentiable", textID: "Tidak dapat diturunkan")
        ],
        correctOptionId: "a",
        explanationEN: "MSE squares errors, making large errors contribute much more. MAE is more robust to outliers.",
        explanationID: "MSE mengkuadratkan error, membuat error besar berkontribusi jauh lebih banyak. MAE lebih robust terhadap outlier.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl042",
        questionEN: "Hinge loss is used in:",
        questionID: "Hinge loss digunakan dalam:",
        options: [
            QuestionOption(id: "a", textEN: "Support Vector Machines for classification", textID: "Support Vector Machines untuk klasifikasi"),
            QuestionOption(id: "b", textEN: "Linear regression", textID: "Regresi linear"),
            QuestionOption(id: "c", textEN: "Logistic regression", textID: "Regresi logistik"),
            QuestionOption(id: "d", textEN: "k-means clustering", textID: "Pengelompokan k-means")
        ],
        correctOptionId: "a",
        explanationEN: "Hinge loss max(0, 1 - y·f(x)) is the loss function for SVM, penalizing violations of the margin.",
        explanationID: "Hinge loss max(0, 1 - y·f(x)) adalah fungsi loss untuk SVM, menghukum pelanggaran margin.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl043",
        questionEN: "Cross-entropy loss for classification penalizes:",
        questionID: "Cross-entropy loss untuk klasifikasi menghukum:",
        options: [
            QuestionOption(id: "a", textEN: "Confident wrong predictions more heavily", textID: "Prediksi salah yang yakin lebih berat"),
            QuestionOption(id: "b", textEN: "All errors equally", textID: "Semua error secara sama"),
            QuestionOption(id: "c", textEN: "Only misclassifications", textID: "Hanya kesalahan klasifikasi"),
            QuestionOption(id: "d", textEN: "Large weights", textID: "Bobot besar")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-entropy -log(p) is high when confident but wrong. Encourages calibrated probabilities.",
        explanationID: "Cross-entropy -log(p) tinggi ketika yakin tapi salah. Mendorong probabilitas terkalibrasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl044",
        questionEN: "Huber loss combines MSE and MAE by:",
        questionID: "Huber loss menggabungkan MSE dan MAE dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Using MSE for small errors and MAE for large errors", textID: "Menggunakan MSE untuk error kecil dan MAE untuk error besar"),
            QuestionOption(id: "b", textEN: "Averaging MSE and MAE", textID: "Merata-ratakan MSE dan MAE"),
            QuestionOption(id: "c", textEN: "Using only MSE", textID: "Hanya menggunakan MSE"),
            QuestionOption(id: "d", textEN: "Using only MAE", textID: "Hanya menggunakan MAE")
        ],
        correctOptionId: "a",
        explanationEN: "Huber loss is quadratic for |error| < δ and linear for |error| > δ. Robust to outliers while smooth.",
        explanationID: "Huber loss adalah kuadratik untuk |error| < δ dan linear untuk |error| > δ. Robust terhadap outlier sambil halus.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl045",
        questionEN: "The 0-1 loss in classification is:",
        questionID: "0-1 loss dalam klasifikasi adalah:",
        options: [
            QuestionOption(id: "a", textEN: "1 if prediction ≠ true label, 0 otherwise", textID: "1 jika prediksi ≠ label sebenarnya, 0 jika tidak"),
            QuestionOption(id: "b", textEN: "Always 0", textID: "Selalu 0"),
            QuestionOption(id: "c", textEN: "The squared error", textID: "Error kuadrat"),
            QuestionOption(id: "d", textEN: "The log loss", textID: "Log loss")
        ],
        correctOptionId: "a",
        explanationEN: "0-1 loss directly counts misclassifications. Not smooth, so surrogates like log loss are used for optimization.",
        explanationID: "0-1 loss langsung menghitung kesalahan klasifikasi. Tidak halus, jadi surrogate seperti log loss digunakan untuk optimasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Practical Considerations
    Question(
        id: "sl046",
        questionEN: "Feature scaling (standardization) transforms features to have:",
        questionID: "Feature scaling (standardization) mentransformasi fitur untuk memiliki:",
        options: [
            QuestionOption(id: "a", textEN: "Mean 0 and standard deviation 1", textID: "Mean 0 dan standar deviasi 1"),
            QuestionOption(id: "b", textEN: "Range [0, 1]", textID: "Rentang [0, 1]"),
            QuestionOption(id: "c", textEN: "All positive values", textID: "Semua nilai positif"),
            QuestionOption(id: "d", textEN: "Integer values", textID: "Nilai integer")
        ],
        correctOptionId: "a",
        explanationEN: "Standardization: z = (x - μ) / σ. Centering and scaling to unit variance. Important for gradient-based methods.",
        explanationID: "Standardization: z = (x - μ) / σ. Pemusatan dan penskalaan ke variansi unit. Penting untuk metode berbasis gradien.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl047",
        questionEN: "One-hot encoding for categorical variables creates:",
        questionID: "One-hot encoding untuk variabel kategorikal membuat:",
        options: [
            QuestionOption(id: "a", textEN: "Binary columns, one per category", textID: "Kolom biner, satu per kategori"),
            QuestionOption(id: "b", textEN: "Single numerical column", textID: "Satu kolom numerik"),
            QuestionOption(id: "c", textEN: "Normalized values", textID: "Nilai ternormalisasi"),
            QuestionOption(id: "d", textEN: "Ordinal rankings", textID: "Peringkat ordinal")
        ],
        correctOptionId: "a",
        explanationEN: "One-hot creates k binary features for k categories. Avoids imposing ordinal relationships.",
        explanationID: "One-hot membuat k fitur biner untuk k kategori. Menghindari pemaksaan hubungan ordinal.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl048",
        questionEN: "Class imbalance in classification can be addressed by:",
        questionID: "Ketidakseimbangan kelas dalam klasifikasi dapat diatasi dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Oversampling minority, undersampling majority, or class weights", textID: "Oversampling minoritas, undersampling mayoritas, atau bobot kelas"),
            QuestionOption(id: "b", textEN: "Using only accuracy as metric", textID: "Hanya menggunakan akurasi sebagai metrik"),
            QuestionOption(id: "c", textEN: "Removing all minority examples", textID: "Menghapus semua contoh minoritas"),
            QuestionOption(id: "d", textEN: "Ignoring the imbalance", textID: "Mengabaikan ketidakseimbangan")
        ],
        correctOptionId: "a",
        explanationEN: "SMOTE, undersampling, class weights, and threshold tuning address class imbalance.",
        explanationID: "SMOTE, undersampling, bobot kelas, dan penyetelan threshold mengatasi ketidakseimbangan kelas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "sl049",
        questionEN: "Precision = TP/(TP+FP) measures:",
        questionID: "Precision = TP/(TP+FP) mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Of predicted positives, how many are actually positive", textID: "Dari prediksi positif, berapa banyak yang benar-benar positif"),
            QuestionOption(id: "b", textEN: "Of actual positives, how many are predicted positive", textID: "Dari positif sebenarnya, berapa banyak yang diprediksi positif"),
            QuestionOption(id: "c", textEN: "Overall accuracy", textID: "Akurasi keseluruhan"),
            QuestionOption(id: "d", textEN: "Total correct predictions", textID: "Total prediksi benar")
        ],
        correctOptionId: "a",
        explanationEN: "Precision: among predicted positives, fraction truly positive. High precision = few false alarms.",
        explanationID: "Precision: di antara prediksi positif, fraksi yang benar-benar positif. Precision tinggi = sedikit alarm palsu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "sl050",
        questionEN: "The F1 score is the harmonic mean of:",
        questionID: "F1 score adalah rata-rata harmonik dari:",
        options: [
            QuestionOption(id: "a", textEN: "Precision and Recall", textID: "Precision dan Recall"),
            QuestionOption(id: "b", textEN: "Accuracy and Precision", textID: "Akurasi dan Precision"),
            QuestionOption(id: "c", textEN: "AUC and Accuracy", textID: "AUC dan Akurasi"),
            QuestionOption(id: "d", textEN: "True positives and True negatives", textID: "True positive dan True negative")
        ],
        correctOptionId: "a",
        explanationEN: "F1 = 2×(Precision×Recall)/(Precision+Recall). Balances precision and recall, especially for imbalanced data.",
        explanationID: "F1 = 2×(Precision×Recall)/(Precision+Recall). Menyeimbangkan precision dan recall, terutama untuk data tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
]
