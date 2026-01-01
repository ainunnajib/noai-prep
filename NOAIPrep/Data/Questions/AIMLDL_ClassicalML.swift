import Foundation

// MARK: - AI/ML/DL: Classical ML Questions (50 questions)
// Subcategory: Supervised learning, unsupervised learning, model evaluation

let classicalMLQuestions: [Question] = [
    // Batch 1: ML Fundamentals (10 questions)
    Question(
        id: "ml001",
        questionEN: "What is the main difference between supervised and unsupervised learning?",
        questionID: "Apa perbedaan utama antara supervised dan unsupervised learning?",
        options: [
            QuestionOption(id: "a", textEN: "Supervised uses labeled data, unsupervised uses unlabeled data", textID: "Supervised menggunakan data berlabel, unsupervised menggunakan data tidak berlabel"),
            QuestionOption(id: "b", textEN: "Supervised is faster than unsupervised", textID: "Supervised lebih cepat dari unsupervised"),
            QuestionOption(id: "c", textEN: "Unsupervised requires more data", textID: "Unsupervised membutuhkan lebih banyak data"),
            QuestionOption(id: "d", textEN: "Supervised only works with images", textID: "Supervised hanya bekerja dengan gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Supervised learning uses labeled data (input-output pairs) to train models, while unsupervised learning finds patterns in unlabeled data without predefined outputs.",
        explanationID: "Supervised learning menggunakan data berlabel (pasangan input-output) untuk melatih model, sedangkan unsupervised learning menemukan pola dalam data tidak berlabel tanpa output yang telah ditentukan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml002",
        questionEN: "Which of the following is a supervised learning algorithm?",
        questionID: "Mana dari berikut ini yang merupakan algoritma supervised learning?",
        options: [
            QuestionOption(id: "a", textEN: "K-Means Clustering", textID: "K-Means Clustering"),
            QuestionOption(id: "b", textEN: "Principal Component Analysis (PCA)", textID: "Principal Component Analysis (PCA)"),
            QuestionOption(id: "c", textEN: "Linear Regression", textID: "Linear Regression"),
            QuestionOption(id: "d", textEN: "Hierarchical Clustering", textID: "Hierarchical Clustering")
        ],
        correctOptionId: "c",
        explanationEN: "Linear Regression is a supervised learning algorithm that predicts continuous outputs. K-Means, PCA, and Hierarchical Clustering are unsupervised methods.",
        explanationID: "Linear Regression adalah algoritma supervised learning yang memprediksi output kontinu. K-Means, PCA, dan Hierarchical Clustering adalah metode unsupervised.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml003",
        questionEN: "What is overfitting in machine learning?",
        questionID: "Apa itu overfitting dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Model performs poorly on training data", textID: "Model berkinerja buruk pada data training"),
            QuestionOption(id: "b", textEN: "Model memorizes training data and fails on new data", textID: "Model menghafalkan data training dan gagal pada data baru"),
            QuestionOption(id: "c", textEN: "Model is too simple to learn patterns", textID: "Model terlalu sederhana untuk mempelajari pola"),
            QuestionOption(id: "d", textEN: "Model requires too much memory", textID: "Model membutuhkan terlalu banyak memori")
        ],
        correctOptionId: "b",
        explanationEN: "Overfitting occurs when a model learns the training data too well, including noise, resulting in poor generalization to new, unseen data.",
        explanationID: "Overfitting terjadi ketika model mempelajari data training terlalu baik, termasuk noise, sehingga menghasilkan generalisasi yang buruk pada data baru yang belum pernah dilihat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml004",
        questionEN: "What is the purpose of a validation set?",
        questionID: "Apa tujuan dari validation set?",
        options: [
            QuestionOption(id: "a", textEN: "To train the model", textID: "Untuk melatih model"),
            QuestionOption(id: "b", textEN: "To tune hyperparameters and prevent overfitting", textID: "Untuk menyetel hyperparameter dan mencegah overfitting"),
            QuestionOption(id: "c", textEN: "To test final model performance", textID: "Untuk menguji performa model akhir"),
            QuestionOption(id: "d", textEN: "To generate new data", textID: "Untuk menghasilkan data baru")
        ],
        correctOptionId: "b",
        explanationEN: "The validation set is used to tune hyperparameters and monitor for overfitting during training, without touching the test set which is reserved for final evaluation.",
        explanationID: "Validation set digunakan untuk menyetel hyperparameter dan memantau overfitting selama training, tanpa menyentuh test set yang disimpan untuk evaluasi akhir.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml005",
        questionEN: "What does the bias-variance tradeoff describe?",
        questionID: "Apa yang dijelaskan oleh bias-variance tradeoff?",
        options: [
            QuestionOption(id: "a", textEN: "The tradeoff between model speed and accuracy", textID: "Tradeoff antara kecepatan dan akurasi model"),
            QuestionOption(id: "b", textEN: "The balance between underfitting (high bias) and overfitting (high variance)", textID: "Keseimbangan antara underfitting (high bias) dan overfitting (high variance)"),
            QuestionOption(id: "c", textEN: "The choice between training and test data", textID: "Pilihan antara data training dan test"),
            QuestionOption(id: "d", textEN: "The difference between classification and regression", textID: "Perbedaan antara classification dan regression")
        ],
        correctOptionId: "b",
        explanationEN: "The bias-variance tradeoff describes the balance between a model being too simple (high bias, underfitting) and too complex (high variance, overfitting).",
        explanationID: "Bias-variance tradeoff menjelaskan keseimbangan antara model yang terlalu sederhana (high bias, underfitting) dan terlalu kompleks (high variance, overfitting).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml006",
        questionEN: "What is cross-validation used for?",
        questionID: "Untuk apa cross-validation digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "To speed up model training", textID: "Untuk mempercepat training model"),
            QuestionOption(id: "b", textEN: "To get a more reliable estimate of model performance", textID: "Untuk mendapatkan estimasi performa model yang lebih andal"),
            QuestionOption(id: "c", textEN: "To reduce the size of the dataset", textID: "Untuk mengurangi ukuran dataset"),
            QuestionOption(id: "d", textEN: "To create new features", textID: "Untuk membuat fitur baru")
        ],
        correctOptionId: "b",
        explanationEN: "Cross-validation trains and validates the model on multiple splits of the data, providing a more robust estimate of how well the model generalizes.",
        explanationID: "Cross-validation melatih dan memvalidasi model pada beberapa pembagian data, memberikan estimasi yang lebih robust tentang seberapa baik model dapat digeneralisasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml007",
        questionEN: "In k-fold cross-validation with k=5, how many times is the model trained?",
        questionID: "Dalam k-fold cross-validation dengan k=5, berapa kali model dilatih?",
        options: [
            QuestionOption(id: "a", textEN: "1 time", textID: "1 kali"),
            QuestionOption(id: "b", textEN: "4 times", textID: "4 kali"),
            QuestionOption(id: "c", textEN: "5 times", textID: "5 kali"),
            QuestionOption(id: "d", textEN: "10 times", textID: "10 kali")
        ],
        correctOptionId: "c",
        explanationEN: "In k-fold cross-validation, the model is trained k times, each time using a different fold as the validation set and the remaining folds for training.",
        explanationID: "Dalam k-fold cross-validation, model dilatih sebanyak k kali, setiap kali menggunakan fold yang berbeda sebagai validation set dan fold sisanya untuk training.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml008",
        questionEN: "What is feature engineering?",
        questionID: "Apa itu feature engineering?",
        options: [
            QuestionOption(id: "a", textEN: "Automatically learning features from data", textID: "Mempelajari fitur secara otomatis dari data"),
            QuestionOption(id: "b", textEN: "Creating and selecting informative input variables from raw data", textID: "Membuat dan memilih variabel input yang informatif dari data mentah"),
            QuestionOption(id: "c", textEN: "Removing all features from the dataset", textID: "Menghapus semua fitur dari dataset"),
            QuestionOption(id: "d", textEN: "Testing the model on new data", textID: "Menguji model pada data baru")
        ],
        correctOptionId: "b",
        explanationEN: "Feature engineering is the process of using domain knowledge to create, transform, and select features from raw data to improve model performance.",
        explanationID: "Feature engineering adalah proses menggunakan pengetahuan domain untuk membuat, mentransformasi, dan memilih fitur dari data mentah untuk meningkatkan performa model.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml009",
        questionEN: "What is the difference between classification and regression?",
        questionID: "Apa perbedaan antara classification dan regression?",
        options: [
            QuestionOption(id: "a", textEN: "Classification predicts categories, regression predicts continuous values", textID: "Classification memprediksi kategori, regression memprediksi nilai kontinu"),
            QuestionOption(id: "b", textEN: "Classification is faster than regression", textID: "Classification lebih cepat dari regression"),
            QuestionOption(id: "c", textEN: "Regression only works with images", textID: "Regression hanya bekerja dengan gambar"),
            QuestionOption(id: "d", textEN: "Classification requires more data", textID: "Classification membutuhkan lebih banyak data")
        ],
        correctOptionId: "a",
        explanationEN: "Classification predicts discrete class labels (e.g., spam/not spam), while regression predicts continuous numerical values (e.g., house prices).",
        explanationID: "Classification memprediksi label kelas diskrit (misal spam/bukan spam), sedangkan regression memprediksi nilai numerik kontinu (misal harga rumah).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml010",
        questionEN: "What is a hyperparameter in machine learning?",
        questionID: "Apa itu hyperparameter dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Parameters learned from training data", textID: "Parameter yang dipelajari dari data training"),
            QuestionOption(id: "b", textEN: "Configuration settings set before training begins", textID: "Pengaturan konfigurasi yang ditetapkan sebelum training dimulai"),
            QuestionOption(id: "c", textEN: "The output of the model", textID: "Output dari model"),
            QuestionOption(id: "d", textEN: "The loss function value", textID: "Nilai fungsi loss")
        ],
        correctOptionId: "b",
        explanationEN: "Hyperparameters are settings configured before training (e.g., learning rate, number of trees) as opposed to model parameters which are learned during training.",
        explanationID: "Hyperparameter adalah pengaturan yang dikonfigurasi sebelum training (misal learning rate, jumlah trees) berbeda dengan parameter model yang dipelajari selama training.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 2: Linear Models (10 questions)
    Question(
        id: "ml011",
        questionEN: "In linear regression, what does the model try to minimize?",
        questionID: "Dalam linear regression, apa yang coba diminimalkan oleh model?",
        options: [
            QuestionOption(id: "a", textEN: "Sum of squared errors (residuals)", textID: "Jumlah kuadrat error (residual)"),
            QuestionOption(id: "b", textEN: "Number of features", textID: "Jumlah fitur"),
            QuestionOption(id: "c", textEN: "Training time", textID: "Waktu training"),
            QuestionOption(id: "d", textEN: "Number of data points", textID: "Jumlah titik data")
        ],
        correctOptionId: "a",
        explanationEN: "Linear regression minimizes the sum of squared differences between predicted and actual values (Mean Squared Error or MSE).",
        explanationID: "Linear regression meminimalkan jumlah kuadrat perbedaan antara nilai prediksi dan aktual (Mean Squared Error atau MSE).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml012",
        questionEN: "What is the equation for simple linear regression?",
        questionID: "Apa persamaan untuk simple linear regression?",
        options: [
            QuestionOption(id: "a", textEN: "y = mx + b", textID: "y = mx + b"),
            QuestionOption(id: "b", textEN: "y = x^2 + c", textID: "y = x^2 + c"),
            QuestionOption(id: "c", textEN: "y = log(x)", textID: "y = log(x)"),
            QuestionOption(id: "d", textEN: "y = 1/(1+e^-x)", textID: "y = 1/(1+e^-x)")
        ],
        correctOptionId: "a",
        explanationEN: "Simple linear regression models the relationship as y = mx + b, where m is the slope and b is the intercept.",
        explanationID: "Simple linear regression memodelkan hubungan sebagai y = mx + b, dimana m adalah kemiringan dan b adalah intersep.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml013",
        questionEN: "What is Ridge Regression?",
        questionID: "Apa itu Ridge Regression?",
        options: [
            QuestionOption(id: "a", textEN: "Linear regression with L2 regularization", textID: "Linear regression dengan regularisasi L2"),
            QuestionOption(id: "b", textEN: "A type of decision tree", textID: "Jenis decision tree"),
            QuestionOption(id: "c", textEN: "A clustering algorithm", textID: "Algoritma clustering"),
            QuestionOption(id: "d", textEN: "Linear regression with L1 regularization", textID: "Linear regression dengan regularisasi L1")
        ],
        correctOptionId: "a",
        explanationEN: "Ridge Regression adds L2 regularization (sum of squared coefficients) to linear regression to prevent overfitting by penalizing large weights.",
        explanationID: "Ridge Regression menambahkan regularisasi L2 (jumlah kuadrat koefisien) ke linear regression untuk mencegah overfitting dengan memberikan penalti pada bobot besar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml014",
        questionEN: "What is the difference between Lasso and Ridge regression?",
        questionID: "Apa perbedaan antara Lasso dan Ridge regression?",
        options: [
            QuestionOption(id: "a", textEN: "Lasso uses L1 penalty and can zero out coefficients, Ridge uses L2", textID: "Lasso menggunakan penalti L1 dan dapat menghilangkan koefisien, Ridge menggunakan L2"),
            QuestionOption(id: "b", textEN: "Ridge is faster than Lasso", textID: "Ridge lebih cepat dari Lasso"),
            QuestionOption(id: "c", textEN: "Lasso works only with categorical data", textID: "Lasso hanya bekerja dengan data kategorikal"),
            QuestionOption(id: "d", textEN: "There is no difference", textID: "Tidak ada perbedaan")
        ],
        correctOptionId: "a",
        explanationEN: "Lasso (L1) can shrink coefficients to exactly zero, performing feature selection. Ridge (L2) shrinks coefficients but rarely zeros them out.",
        explanationID: "Lasso (L1) dapat menyusutkan koefisien menjadi tepat nol, melakukan seleksi fitur. Ridge (L2) menyusutkan koefisien tetapi jarang menghilangkannya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml015",
        questionEN: "What does logistic regression predict?",
        questionID: "Apa yang diprediksi oleh logistic regression?",
        options: [
            QuestionOption(id: "a", textEN: "Continuous numerical values", textID: "Nilai numerik kontinu"),
            QuestionOption(id: "b", textEN: "Probability of belonging to a class", textID: "Probabilitas termasuk dalam suatu kelas"),
            QuestionOption(id: "c", textEN: "Cluster assignments", textID: "Penugasan cluster"),
            QuestionOption(id: "d", textEN: "Time series forecasts", textID: "Prediksi time series")
        ],
        correctOptionId: "b",
        explanationEN: "Despite its name, logistic regression is a classification algorithm that predicts the probability of an instance belonging to a particular class.",
        explanationID: "Meskipun namanya, logistic regression adalah algoritma klasifikasi yang memprediksi probabilitas suatu instance termasuk dalam kelas tertentu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml016",
        questionEN: "What is the sigmoid function used for in logistic regression?",
        questionID: "Untuk apa fungsi sigmoid digunakan dalam logistic regression?",
        options: [
            QuestionOption(id: "a", textEN: "To map outputs to probabilities between 0 and 1", textID: "Untuk memetakan output ke probabilitas antara 0 dan 1"),
            QuestionOption(id: "b", textEN: "To speed up training", textID: "Untuk mempercepat training"),
            QuestionOption(id: "c", textEN: "To reduce dimensionality", textID: "Untuk mengurangi dimensionalitas"),
            QuestionOption(id: "d", textEN: "To handle missing data", textID: "Untuk menangani data yang hilang")
        ],
        correctOptionId: "a",
        explanationEN: "The sigmoid function σ(x) = 1/(1+e^-x) squashes any real number into the range (0, 1), making it suitable for representing probabilities.",
        explanationID: "Fungsi sigmoid σ(x) = 1/(1+e^-x) menekan bilangan real apapun ke dalam rentang (0, 1), sehingga cocok untuk merepresentasikan probabilitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml017",
        questionEN: "What is multicollinearity and why is it a problem?",
        questionID: "Apa itu multikolinearitas dan mengapa itu menjadi masalah?",
        options: [
            QuestionOption(id: "a", textEN: "When features are highly correlated, making coefficient estimates unstable", textID: "Ketika fitur sangat berkorelasi, membuat estimasi koefisien tidak stabil"),
            QuestionOption(id: "b", textEN: "When the target has too many classes", textID: "Ketika target memiliki terlalu banyak kelas"),
            QuestionOption(id: "c", textEN: "When there are too many data points", textID: "Ketika ada terlalu banyak titik data"),
            QuestionOption(id: "d", textEN: "When features have different scales", textID: "Ketika fitur memiliki skala yang berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Multicollinearity occurs when independent variables are highly correlated, making it difficult to determine each variable's individual effect on the target.",
        explanationID: "Multikolinearitas terjadi ketika variabel independen sangat berkorelasi, sehingga sulit untuk menentukan efek individual setiap variabel terhadap target.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml018",
        questionEN: "What is R-squared (R²) in linear regression?",
        questionID: "Apa itu R-squared (R²) dalam linear regression?",
        options: [
            QuestionOption(id: "a", textEN: "The proportion of variance in the target explained by the model", textID: "Proporsi variansi pada target yang dijelaskan oleh model"),
            QuestionOption(id: "b", textEN: "The learning rate of the model", textID: "Learning rate dari model"),
            QuestionOption(id: "c", textEN: "The number of features used", textID: "Jumlah fitur yang digunakan"),
            QuestionOption(id: "d", textEN: "The regularization strength", textID: "Kekuatan regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "R² measures the proportion of variance in the dependent variable that is predictable from the independent variables. R²=1 means perfect fit, R²=0 means no explanatory power.",
        explanationID: "R² mengukur proporsi variansi dalam variabel dependen yang dapat diprediksi dari variabel independen. R²=1 berarti fit sempurna, R²=0 berarti tidak ada kekuatan penjelasan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml019",
        questionEN: "What is polynomial regression?",
        questionID: "Apa itu polynomial regression?",
        options: [
            QuestionOption(id: "a", textEN: "Regression with polynomial features (x², x³, etc.)", textID: "Regression dengan fitur polinomial (x², x³, dll.)"),
            QuestionOption(id: "b", textEN: "Regression with multiple target variables", textID: "Regression dengan banyak variabel target"),
            QuestionOption(id: "c", textEN: "Regression that only works on polynomials", textID: "Regression yang hanya bekerja pada polinomial"),
            QuestionOption(id: "d", textEN: "A type of neural network", textID: "Jenis neural network")
        ],
        correctOptionId: "a",
        explanationEN: "Polynomial regression extends linear regression by adding polynomial terms of the features (x², x³, etc.) to capture non-linear relationships.",
        explanationID: "Polynomial regression memperluas linear regression dengan menambahkan suku polinomial dari fitur (x², x³, dll.) untuk menangkap hubungan non-linear.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml020",
        questionEN: "What is the purpose of the intercept term in linear regression?",
        questionID: "Apa tujuan dari intercept term dalam linear regression?",
        options: [
            QuestionOption(id: "a", textEN: "To allow the line to not pass through the origin", textID: "Untuk memungkinkan garis tidak melewati titik asal"),
            QuestionOption(id: "b", textEN: "To increase model complexity", textID: "Untuk meningkatkan kompleksitas model"),
            QuestionOption(id: "c", textEN: "To handle missing values", textID: "Untuk menangani nilai yang hilang"),
            QuestionOption(id: "d", textEN: "To normalize the features", textID: "Untuk menormalisasi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "The intercept (bias term) allows the regression line to fit data that doesn't pass through the origin, providing a baseline prediction when all features are zero.",
        explanationID: "Intercept (bias term) memungkinkan garis regresi untuk menyesuaikan data yang tidak melewati titik asal, memberikan prediksi baseline ketika semua fitur bernilai nol.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 3: Tree-Based Models (10 questions)
    Question(
        id: "ml021",
        questionEN: "How does a decision tree make predictions?",
        questionID: "Bagaimana decision tree membuat prediksi?",
        options: [
            QuestionOption(id: "a", textEN: "By following a series of if-then rules from root to leaf", textID: "Dengan mengikuti serangkaian aturan if-then dari root ke leaf"),
            QuestionOption(id: "b", textEN: "By calculating weighted averages", textID: "Dengan menghitung rata-rata tertimbang"),
            QuestionOption(id: "c", textEN: "By clustering similar data points", textID: "Dengan mengelompokkan titik data yang serupa"),
            QuestionOption(id: "d", textEN: "By using gradient descent", textID: "Dengan menggunakan gradient descent")
        ],
        correctOptionId: "a",
        explanationEN: "Decision trees make predictions by traversing from the root node through decision nodes based on feature values until reaching a leaf node with the prediction.",
        explanationID: "Decision tree membuat prediksi dengan melintasi dari node root melalui node keputusan berdasarkan nilai fitur sampai mencapai node leaf dengan prediksi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml022",
        questionEN: "What is Gini impurity used for in decision trees?",
        questionID: "Untuk apa Gini impurity digunakan dalam decision trees?",
        options: [
            QuestionOption(id: "a", textEN: "To measure how mixed the classes are at a node for split selection", textID: "Untuk mengukur seberapa tercampur kelas-kelas di sebuah node untuk pemilihan split"),
            QuestionOption(id: "b", textEN: "To calculate the prediction probability", textID: "Untuk menghitung probabilitas prediksi"),
            QuestionOption(id: "c", textEN: "To determine the tree depth", textID: "Untuk menentukan kedalaman tree"),
            QuestionOption(id: "d", textEN: "To prune the tree", textID: "Untuk memangkas tree")
        ],
        correctOptionId: "a",
        explanationEN: "Gini impurity measures the probability of incorrectly classifying a random sample. Lower Gini means purer nodes. Trees split to minimize Gini impurity.",
        explanationID: "Gini impurity mengukur probabilitas salah mengklasifikasikan sampel acak. Gini lebih rendah berarti node lebih murni. Tree membelah untuk meminimalkan Gini impurity.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml023",
        questionEN: "What is the main advantage of Random Forest over a single decision tree?",
        questionID: "Apa keuntungan utama Random Forest dibanding single decision tree?",
        options: [
            QuestionOption(id: "a", textEN: "Reduces overfitting by averaging multiple trees", textID: "Mengurangi overfitting dengan merata-ratakan banyak tree"),
            QuestionOption(id: "b", textEN: "Faster training time", textID: "Waktu training lebih cepat"),
            QuestionOption(id: "c", textEN: "Requires less data", textID: "Membutuhkan lebih sedikit data"),
            QuestionOption(id: "d", textEN: "Easier to interpret", textID: "Lebih mudah diinterpretasi")
        ],
        correctOptionId: "a",
        explanationEN: "Random Forest combines many decision trees trained on random subsets of data and features, reducing overfitting through ensemble averaging.",
        explanationID: "Random Forest menggabungkan banyak decision tree yang dilatih pada subset acak dari data dan fitur, mengurangi overfitting melalui ensemble averaging.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml024",
        questionEN: "What is bagging in ensemble learning?",
        questionID: "Apa itu bagging dalam ensemble learning?",
        options: [
            QuestionOption(id: "a", textEN: "Training multiple models on bootstrap samples and averaging predictions", textID: "Melatih banyak model pada bootstrap samples dan merata-ratakan prediksi"),
            QuestionOption(id: "b", textEN: "Selecting the best features", textID: "Memilih fitur terbaik"),
            QuestionOption(id: "c", textEN: "Training models sequentially on errors", textID: "Melatih model secara sekuensial pada error"),
            QuestionOption(id: "d", textEN: "Reducing the number of trees", textID: "Mengurangi jumlah tree")
        ],
        correctOptionId: "a",
        explanationEN: "Bagging (Bootstrap Aggregating) trains multiple models on different bootstrap samples of the training data and aggregates their predictions to reduce variance.",
        explanationID: "Bagging (Bootstrap Aggregating) melatih banyak model pada bootstrap sample yang berbeda dari data training dan mengagregasi prediksi mereka untuk mengurangi variansi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml025",
        questionEN: "How does boosting differ from bagging?",
        questionID: "Bagaimana boosting berbeda dari bagging?",
        options: [
            QuestionOption(id: "a", textEN: "Boosting trains models sequentially, focusing on previous errors", textID: "Boosting melatih model secara sekuensial, fokus pada error sebelumnya"),
            QuestionOption(id: "b", textEN: "Boosting uses fewer trees", textID: "Boosting menggunakan lebih sedikit tree"),
            QuestionOption(id: "c", textEN: "Boosting only works with regression", textID: "Boosting hanya bekerja dengan regression"),
            QuestionOption(id: "d", textEN: "Boosting is always faster", textID: "Boosting selalu lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Boosting trains models sequentially, with each new model focusing on the errors made by previous models. Bagging trains models independently in parallel.",
        explanationID: "Boosting melatih model secara sekuensial, dengan setiap model baru fokus pada error yang dibuat oleh model sebelumnya. Bagging melatih model secara independen dan paralel.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml026",
        questionEN: "What is XGBoost?",
        questionID: "Apa itu XGBoost?",
        options: [
            QuestionOption(id: "a", textEN: "An efficient gradient boosting implementation with regularization", textID: "Implementasi gradient boosting yang efisien dengan regularisasi"),
            QuestionOption(id: "b", textEN: "A type of neural network", textID: "Jenis neural network"),
            QuestionOption(id: "c", textEN: "A clustering algorithm", textID: "Algoritma clustering"),
            QuestionOption(id: "d", textEN: "A dimensionality reduction technique", textID: "Teknik pengurangan dimensionalitas")
        ],
        correctOptionId: "a",
        explanationEN: "XGBoost (Extreme Gradient Boosting) is an optimized gradient boosting library with built-in regularization, parallel processing, and handling of missing values.",
        explanationID: "XGBoost (Extreme Gradient Boosting) adalah library gradient boosting yang dioptimasi dengan regularisasi bawaan, pemrosesan paralel, dan penanganan nilai yang hilang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml027",
        questionEN: "What is pruning in decision trees?",
        questionID: "Apa itu pruning dalam decision trees?",
        options: [
            QuestionOption(id: "a", textEN: "Removing branches that don't improve performance to prevent overfitting", textID: "Menghapus cabang yang tidak meningkatkan performa untuk mencegah overfitting"),
            QuestionOption(id: "b", textEN: "Adding more branches to the tree", textID: "Menambahkan lebih banyak cabang ke tree"),
            QuestionOption(id: "c", textEN: "Selecting which features to use", textID: "Memilih fitur mana yang akan digunakan"),
            QuestionOption(id: "d", textEN: "Training multiple trees", textID: "Melatih banyak tree")
        ],
        correctOptionId: "a",
        explanationEN: "Pruning removes parts of the tree that provide little predictive power, reducing complexity and overfitting while improving generalization.",
        explanationID: "Pruning menghapus bagian tree yang memberikan sedikit kekuatan prediksi, mengurangi kompleksitas dan overfitting sambil meningkatkan generalisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml028",
        questionEN: "What is entropy in the context of decision trees?",
        questionID: "Apa itu entropy dalam konteks decision trees?",
        options: [
            QuestionOption(id: "a", textEN: "A measure of disorder or uncertainty in the data", textID: "Ukuran ketidakteraturan atau ketidakpastian dalam data"),
            QuestionOption(id: "b", textEN: "The depth of the tree", textID: "Kedalaman tree"),
            QuestionOption(id: "c", textEN: "The number of leaf nodes", textID: "Jumlah node leaf"),
            QuestionOption(id: "d", textEN: "The learning rate", textID: "Learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "Entropy measures the impurity or disorder in a set of examples. Maximum entropy means maximum uncertainty (50-50 split), minimum entropy means all same class.",
        explanationID: "Entropy mengukur impurity atau ketidakteraturan dalam sekumpulan contoh. Entropy maksimum berarti ketidakpastian maksimum (pembagian 50-50), entropy minimum berarti semua kelas sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml029",
        questionEN: "What is information gain in decision trees?",
        questionID: "Apa itu information gain dalam decision trees?",
        options: [
            QuestionOption(id: "a", textEN: "The reduction in entropy after a split", textID: "Pengurangan entropy setelah split"),
            QuestionOption(id: "b", textEN: "The total number of features", textID: "Jumlah total fitur"),
            QuestionOption(id: "c", textEN: "The accuracy of the tree", textID: "Akurasi tree"),
            QuestionOption(id: "d", textEN: "The depth increase after split", textID: "Peningkatan kedalaman setelah split")
        ],
        correctOptionId: "a",
        explanationEN: "Information gain measures how much a feature reduces uncertainty (entropy) about the class. Trees choose splits that maximize information gain.",
        explanationID: "Information gain mengukur seberapa banyak sebuah fitur mengurangi ketidakpastian (entropy) tentang kelas. Tree memilih split yang memaksimalkan information gain.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml030",
        questionEN: "What is feature importance in Random Forest?",
        questionID: "Apa itu feature importance dalam Random Forest?",
        options: [
            QuestionOption(id: "a", textEN: "A ranking of how much each feature contributes to predictions", textID: "Peringkat seberapa banyak setiap fitur berkontribusi pada prediksi"),
            QuestionOption(id: "b", textEN: "The number of features selected", textID: "Jumlah fitur yang dipilih"),
            QuestionOption(id: "c", textEN: "The order features are added to the model", textID: "Urutan fitur ditambahkan ke model"),
            QuestionOption(id: "d", textEN: "The type of each feature", textID: "Tipe dari setiap fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Feature importance measures how much each feature decreases impurity across all trees in the forest, helping identify which features are most predictive.",
        explanationID: "Feature importance mengukur seberapa banyak setiap fitur mengurangi impurity di semua tree dalam forest, membantu mengidentifikasi fitur mana yang paling prediktif.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 4: Distance-Based & Instance-Based Learning (10 questions)
    Question(
        id: "ml031",
        questionEN: "How does K-Nearest Neighbors (KNN) make predictions?",
        questionID: "Bagaimana K-Nearest Neighbors (KNN) membuat prediksi?",
        options: [
            QuestionOption(id: "a", textEN: "By finding the k closest training examples and voting/averaging", textID: "Dengan menemukan k contoh training terdekat dan voting/averaging"),
            QuestionOption(id: "b", textEN: "By learning a set of rules", textID: "Dengan mempelajari sekumpulan aturan"),
            QuestionOption(id: "c", textEN: "By fitting a line to the data", textID: "Dengan menyesuaikan garis ke data"),
            QuestionOption(id: "d", textEN: "By clustering all data points", textID: "Dengan mengelompokkan semua titik data")
        ],
        correctOptionId: "a",
        explanationEN: "KNN predicts by finding the k nearest training examples to a query point and using majority voting (classification) or averaging (regression).",
        explanationID: "KNN memprediksi dengan menemukan k contoh training terdekat ke titik query dan menggunakan voting mayoritas (classification) atau averaging (regression).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml032",
        questionEN: "What happens when k=1 in KNN?",
        questionID: "Apa yang terjadi ketika k=1 dalam KNN?",
        options: [
            QuestionOption(id: "a", textEN: "The prediction is based on the single nearest neighbor", textID: "Prediksi didasarkan pada satu tetangga terdekat"),
            QuestionOption(id: "b", textEN: "The model averages all data points", textID: "Model merata-ratakan semua titik data"),
            QuestionOption(id: "c", textEN: "The model doesn't work", textID: "Model tidak bekerja"),
            QuestionOption(id: "d", textEN: "The model uses all neighbors equally", textID: "Model menggunakan semua tetangga secara merata")
        ],
        correctOptionId: "a",
        explanationEN: "When k=1, the prediction is simply the class (or value) of the single closest training example, which can lead to high variance and sensitivity to noise.",
        explanationID: "Ketika k=1, prediksi hanyalah kelas (atau nilai) dari satu contoh training terdekat, yang dapat menyebabkan variansi tinggi dan sensitif terhadap noise.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml033",
        questionEN: "Why is feature scaling important for KNN?",
        questionID: "Mengapa feature scaling penting untuk KNN?",
        options: [
            QuestionOption(id: "a", textEN: "Features with larger scales dominate distance calculations", textID: "Fitur dengan skala lebih besar mendominasi perhitungan jarak"),
            QuestionOption(id: "b", textEN: "KNN only works with scaled features", textID: "KNN hanya bekerja dengan fitur yang diskalakan"),
            QuestionOption(id: "c", textEN: "Scaling speeds up the algorithm", textID: "Scaling mempercepat algoritma"),
            QuestionOption(id: "d", textEN: "Scaling is not important for KNN", textID: "Scaling tidak penting untuk KNN")
        ],
        correctOptionId: "a",
        explanationEN: "Without scaling, features with larger numeric ranges dominate the distance calculation, making other features effectively irrelevant.",
        explanationID: "Tanpa scaling, fitur dengan rentang numerik lebih besar mendominasi perhitungan jarak, membuat fitur lain secara efektif tidak relevan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml034",
        questionEN: "What is the Euclidean distance formula between points (x₁, y₁) and (x₂, y₂)?",
        questionID: "Apa rumus jarak Euclidean antara titik (x₁, y₁) dan (x₂, y₂)?",
        options: [
            QuestionOption(id: "a", textEN: "√((x₂-x₁)² + (y₂-y₁)²)", textID: "√((x₂-x₁)² + (y₂-y₁)²)"),
            QuestionOption(id: "b", textEN: "|x₂-x₁| + |y₂-y₁|", textID: "|x₂-x₁| + |y₂-y₁|"),
            QuestionOption(id: "c", textEN: "(x₂-x₁) + (y₂-y₁)", textID: "(x₂-x₁) + (y₂-y₁)"),
            QuestionOption(id: "d", textEN: "max(|x₂-x₁|, |y₂-y₁|)", textID: "max(|x₂-x₁|, |y₂-y₁|)")
        ],
        correctOptionId: "a",
        explanationEN: "Euclidean distance is the straight-line distance: √((x₂-x₁)² + (y₂-y₁)²). Option b is Manhattan distance, option d is Chebyshev distance.",
        explanationID: "Jarak Euclidean adalah jarak garis lurus: √((x₂-x₁)² + (y₂-y₁)²). Opsi b adalah jarak Manhattan, opsi d adalah jarak Chebyshev.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml035",
        questionEN: "What is the curse of dimensionality?",
        questionID: "Apa itu curse of dimensionality?",
        options: [
            QuestionOption(id: "a", textEN: "As dimensions increase, data becomes sparse and distances less meaningful", textID: "Saat dimensi meningkat, data menjadi jarang dan jarak kurang bermakna"),
            QuestionOption(id: "b", textEN: "Too many features make training faster", textID: "Terlalu banyak fitur membuat training lebih cepat"),
            QuestionOption(id: "c", textEN: "High dimensions always improve accuracy", textID: "Dimensi tinggi selalu meningkatkan akurasi"),
            QuestionOption(id: "d", textEN: "More dimensions require less data", textID: "Lebih banyak dimensi membutuhkan lebih sedikit data")
        ],
        correctOptionId: "a",
        explanationEN: "In high dimensions, data points become equidistant, making distance-based algorithms like KNN less effective. The data space becomes increasingly sparse.",
        explanationID: "Dalam dimensi tinggi, titik data menjadi berjarak sama, membuat algoritma berbasis jarak seperti KNN kurang efektif. Ruang data menjadi semakin jarang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml036",
        questionEN: "What is Support Vector Machine (SVM) trying to find?",
        questionID: "Apa yang coba ditemukan oleh Support Vector Machine (SVM)?",
        options: [
            QuestionOption(id: "a", textEN: "The hyperplane that maximizes the margin between classes", textID: "Hyperplane yang memaksimalkan margin antara kelas"),
            QuestionOption(id: "b", textEN: "The closest data points", textID: "Titik data terdekat"),
            QuestionOption(id: "c", textEN: "The average of all data points", textID: "Rata-rata dari semua titik data"),
            QuestionOption(id: "d", textEN: "The deepest decision tree", textID: "Decision tree terdalam")
        ],
        correctOptionId: "a",
        explanationEN: "SVM finds the optimal hyperplane that separates classes with the maximum margin, using support vectors (the closest points to the boundary).",
        explanationID: "SVM menemukan hyperplane optimal yang memisahkan kelas dengan margin maksimum, menggunakan support vectors (titik terdekat ke batas).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml037",
        questionEN: "What is the kernel trick in SVM?",
        questionID: "Apa itu kernel trick dalam SVM?",
        options: [
            QuestionOption(id: "a", textEN: "Mapping data to higher dimensions to find linear separability", textID: "Memetakan data ke dimensi lebih tinggi untuk menemukan keterpisahan linear"),
            QuestionOption(id: "b", textEN: "Reducing the number of features", textID: "Mengurangi jumlah fitur"),
            QuestionOption(id: "c", textEN: "Speeding up training", textID: "Mempercepat training"),
            QuestionOption(id: "d", textEN: "Removing outliers", textID: "Menghapus outlier")
        ],
        correctOptionId: "a",
        explanationEN: "The kernel trick implicitly maps data to a higher-dimensional space where it becomes linearly separable, without explicitly computing the transformation.",
        explanationID: "Kernel trick secara implisit memetakan data ke ruang dimensi lebih tinggi dimana data menjadi dapat dipisahkan secara linear, tanpa secara eksplisit menghitung transformasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ml038",
        questionEN: "What is the RBF (Radial Basis Function) kernel commonly used for?",
        questionID: "Untuk apa RBF (Radial Basis Function) kernel biasanya digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Handling non-linearly separable data in SVM", textID: "Menangani data yang tidak dapat dipisahkan secara linear dalam SVM"),
            QuestionOption(id: "b", textEN: "Only for regression problems", textID: "Hanya untuk masalah regression"),
            QuestionOption(id: "c", textEN: "Text classification only", textID: "Klasifikasi teks saja"),
            QuestionOption(id: "d", textEN: "Reducing computation time", textID: "Mengurangi waktu komputasi")
        ],
        correctOptionId: "a",
        explanationEN: "The RBF kernel is a popular kernel for SVM that can handle complex, non-linear decision boundaries by measuring similarity based on distance from a center point.",
        explanationID: "RBF kernel adalah kernel populer untuk SVM yang dapat menangani batas keputusan non-linear yang kompleks dengan mengukur kesamaan berdasarkan jarak dari titik pusat.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml039",
        questionEN: "What is Naive Bayes 'naive' about?",
        questionID: "Apa yang 'naive' dari Naive Bayes?",
        options: [
            QuestionOption(id: "a", textEN: "It assumes all features are independent given the class", textID: "Ia mengasumsikan semua fitur independen mengingat kelasnya"),
            QuestionOption(id: "b", textEN: "It's a simple algorithm", textID: "Ini adalah algoritma sederhana"),
            QuestionOption(id: "c", textEN: "It requires little training data", textID: "Ini membutuhkan sedikit data training"),
            QuestionOption(id: "d", textEN: "It only works with binary classification", textID: "Ini hanya bekerja dengan klasifikasi biner")
        ],
        correctOptionId: "a",
        explanationEN: "Naive Bayes assumes conditional independence between features given the class label, which is often unrealistic but works well in practice, especially for text classification.",
        explanationID: "Naive Bayes mengasumsikan independensi bersyarat antar fitur mengingat label kelas, yang seringkali tidak realistis tetapi bekerja dengan baik dalam praktik, terutama untuk klasifikasi teks.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml040",
        questionEN: "What is Bayes' theorem?",
        questionID: "Apa itu teorema Bayes?",
        options: [
            QuestionOption(id: "a", textEN: "P(A|B) = P(B|A) × P(A) / P(B)", textID: "P(A|B) = P(B|A) × P(A) / P(B)"),
            QuestionOption(id: "b", textEN: "P(A|B) = P(A) + P(B)", textID: "P(A|B) = P(A) + P(B)"),
            QuestionOption(id: "c", textEN: "P(A|B) = P(A) × P(B)", textID: "P(A|B) = P(A) × P(B)"),
            QuestionOption(id: "d", textEN: "P(A|B) = P(A) / P(B)", textID: "P(A|B) = P(A) / P(B)")
        ],
        correctOptionId: "a",
        explanationEN: "Bayes' theorem relates conditional probabilities: P(A|B) = P(B|A) × P(A) / P(B), allowing us to update beliefs based on new evidence.",
        explanationID: "Teorema Bayes menghubungkan probabilitas bersyarat: P(A|B) = P(B|A) × P(A) / P(B), memungkinkan kita memperbarui keyakinan berdasarkan bukti baru.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 5: Clustering & Dimensionality Reduction (10 questions)
    Question(
        id: "ml041",
        questionEN: "What is K-Means clustering trying to minimize?",
        questionID: "Apa yang coba diminimalkan oleh K-Means clustering?",
        options: [
            QuestionOption(id: "a", textEN: "Within-cluster sum of squared distances", textID: "Jumlah kuadrat jarak dalam cluster"),
            QuestionOption(id: "b", textEN: "Number of clusters", textID: "Jumlah cluster"),
            QuestionOption(id: "c", textEN: "Distance between cluster centers", textID: "Jarak antara pusat cluster"),
            QuestionOption(id: "d", textEN: "Training time", textID: "Waktu training")
        ],
        correctOptionId: "a",
        explanationEN: "K-Means minimizes the sum of squared distances between each point and its assigned cluster centroid (within-cluster sum of squares or inertia).",
        explanationID: "K-Means meminimalkan jumlah kuadrat jarak antara setiap titik dan centroid cluster yang ditugaskan (within-cluster sum of squares atau inertia).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml042",
        questionEN: "What is the elbow method used for in K-Means?",
        questionID: "Untuk apa elbow method digunakan dalam K-Means?",
        options: [
            QuestionOption(id: "a", textEN: "Determining the optimal number of clusters", textID: "Menentukan jumlah cluster optimal"),
            QuestionOption(id: "b", textEN: "Initializing cluster centers", textID: "Menginisialisasi pusat cluster"),
            QuestionOption(id: "c", textEN: "Calculating cluster distances", textID: "Menghitung jarak cluster"),
            QuestionOption(id: "d", textEN: "Speeding up convergence", textID: "Mempercepat konvergensi")
        ],
        correctOptionId: "a",
        explanationEN: "The elbow method plots inertia vs. number of clusters. The 'elbow' point where the curve bends suggests the optimal k, balancing fit and complexity.",
        explanationID: "Elbow method memplot inertia vs jumlah cluster. Titik 'siku' dimana kurva membengkok menunjukkan k optimal, menyeimbangkan fit dan kompleksitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml043",
        questionEN: "What is hierarchical clustering?",
        questionID: "Apa itu hierarchical clustering?",
        options: [
            QuestionOption(id: "a", textEN: "Building a tree of clusters by merging or splitting", textID: "Membangun pohon cluster dengan menggabung atau memisah"),
            QuestionOption(id: "b", textEN: "Clustering based on distance to k centers", textID: "Clustering berdasarkan jarak ke k pusat"),
            QuestionOption(id: "c", textEN: "Clustering based on density", textID: "Clustering berdasarkan kepadatan"),
            QuestionOption(id: "d", textEN: "Random assignment of clusters", textID: "Penugasan cluster secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Hierarchical clustering creates a dendrogram (tree) by either starting with individual points and merging (agglomerative) or starting with one cluster and splitting (divisive).",
        explanationID: "Hierarchical clustering membuat dendrogram (pohon) dengan memulai dari titik individual dan menggabung (agglomerative) atau memulai dari satu cluster dan memisah (divisive).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml044",
        questionEN: "What is DBSCAN's main advantage over K-Means?",
        questionID: "Apa keuntungan utama DBSCAN dibanding K-Means?",
        options: [
            QuestionOption(id: "a", textEN: "Can find arbitrarily shaped clusters and identify outliers", textID: "Dapat menemukan cluster berbentuk bebas dan mengidentifikasi outlier"),
            QuestionOption(id: "b", textEN: "Faster computation", textID: "Komputasi lebih cepat"),
            QuestionOption(id: "c", textEN: "Works better with high dimensions", textID: "Bekerja lebih baik dengan dimensi tinggi"),
            QuestionOption(id: "d", textEN: "Requires fewer parameters", textID: "Membutuhkan lebih sedikit parameter")
        ],
        correctOptionId: "a",
        explanationEN: "DBSCAN (Density-Based Spatial Clustering) can discover clusters of arbitrary shape and automatically identifies outliers as noise, unlike K-Means which assumes spherical clusters.",
        explanationID: "DBSCAN (Density-Based Spatial Clustering) dapat menemukan cluster dengan bentuk bebas dan secara otomatis mengidentifikasi outlier sebagai noise, tidak seperti K-Means yang mengasumsikan cluster berbentuk bola.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml045",
        questionEN: "What does PCA (Principal Component Analysis) do?",
        questionID: "Apa yang dilakukan PCA (Principal Component Analysis)?",
        options: [
            QuestionOption(id: "a", textEN: "Reduces dimensions by projecting onto directions of maximum variance", textID: "Mengurangi dimensi dengan memproyeksi ke arah variansi maksimum"),
            QuestionOption(id: "b", textEN: "Clusters data into groups", textID: "Mengelompokkan data ke dalam grup"),
            QuestionOption(id: "c", textEN: "Classifies data points", textID: "Mengklasifikasikan titik data"),
            QuestionOption(id: "d", textEN: "Fills in missing values", textID: "Mengisi nilai yang hilang")
        ],
        correctOptionId: "a",
        explanationEN: "PCA finds orthogonal directions (principal components) that capture the most variance in the data, allowing dimensionality reduction while preserving important information.",
        explanationID: "PCA menemukan arah ortogonal (principal components) yang menangkap variansi terbanyak dalam data, memungkinkan pengurangan dimensionalitas sambil mempertahankan informasi penting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml046",
        questionEN: "What are eigenvectors in PCA?",
        questionID: "Apa itu eigenvector dalam PCA?",
        options: [
            QuestionOption(id: "a", textEN: "The principal component directions", textID: "Arah principal component"),
            QuestionOption(id: "b", textEN: "The original features", textID: "Fitur asli"),
            QuestionOption(id: "c", textEN: "The data points", textID: "Titik data"),
            QuestionOption(id: "d", textEN: "The cluster centers", textID: "Pusat cluster")
        ],
        correctOptionId: "a",
        explanationEN: "Eigenvectors of the covariance matrix define the principal component directions. Their corresponding eigenvalues indicate how much variance each component captures.",
        explanationID: "Eigenvector dari matriks kovarians mendefinisikan arah principal component. Eigenvalue yang sesuai menunjukkan berapa banyak variansi yang ditangkap setiap komponen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml047",
        questionEN: "What is t-SNE used for?",
        questionID: "Untuk apa t-SNE digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Visualizing high-dimensional data in 2D or 3D", textID: "Memvisualisasikan data dimensi tinggi dalam 2D atau 3D"),
            QuestionOption(id: "b", textEN: "Training classification models", textID: "Melatih model klasifikasi"),
            QuestionOption(id: "c", textEN: "Speeding up model training", textID: "Mempercepat training model"),
            QuestionOption(id: "d", textEN: "Finding missing values", textID: "Menemukan nilai yang hilang")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE (t-distributed Stochastic Neighbor Embedding) is a dimensionality reduction technique specifically designed for visualization, preserving local structure.",
        explanationID: "t-SNE (t-distributed Stochastic Neighbor Embedding) adalah teknik pengurangan dimensionalitas yang dirancang khusus untuk visualisasi, mempertahankan struktur lokal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml048",
        questionEN: "What is the silhouette score used to evaluate?",
        questionID: "Untuk apa silhouette score digunakan untuk mengevaluasi?",
        options: [
            QuestionOption(id: "a", textEN: "Quality of clustering (cohesion vs separation)", textID: "Kualitas clustering (kohesi vs separasi)"),
            QuestionOption(id: "b", textEN: "Classification accuracy", textID: "Akurasi klasifikasi"),
            QuestionOption(id: "c", textEN: "Regression error", textID: "Error regresi"),
            QuestionOption(id: "d", textEN: "Training speed", textID: "Kecepatan training")
        ],
        correctOptionId: "a",
        explanationEN: "Silhouette score measures how similar a point is to its own cluster compared to other clusters. Range is -1 to 1, with higher values indicating better-defined clusters.",
        explanationID: "Silhouette score mengukur seberapa mirip suatu titik dengan clusternya sendiri dibandingkan cluster lain. Rentang -1 sampai 1, dengan nilai lebih tinggi menunjukkan cluster yang lebih terdefinisi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ml049",
        questionEN: "What is feature selection?",
        questionID: "Apa itu feature selection?",
        options: [
            QuestionOption(id: "a", textEN: "Choosing a subset of relevant features for modeling", textID: "Memilih subset fitur yang relevan untuk pemodelan"),
            QuestionOption(id: "b", textEN: "Creating new features from existing ones", textID: "Membuat fitur baru dari yang ada"),
            QuestionOption(id: "c", textEN: "Scaling all features to same range", textID: "Menskalakan semua fitur ke rentang yang sama"),
            QuestionOption(id: "d", textEN: "Removing all features", textID: "Menghapus semua fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Feature selection identifies and keeps only the most relevant features, reducing dimensionality, improving model performance, and decreasing overfitting.",
        explanationID: "Feature selection mengidentifikasi dan hanya menyimpan fitur yang paling relevan, mengurangi dimensionalitas, meningkatkan performa model, dan mengurangi overfitting.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ml050",
        questionEN: "What is the difference between standardization and normalization?",
        questionID: "Apa perbedaan antara standardization dan normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Standardization uses mean/std, normalization scales to [0,1]", textID: "Standardization menggunakan mean/std, normalization menskalakan ke [0,1]"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Mereka adalah hal yang sama"),
            QuestionOption(id: "c", textEN: "Normalization is for text only", textID: "Normalization hanya untuk teks"),
            QuestionOption(id: "d", textEN: "Standardization removes outliers", textID: "Standardization menghapus outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Standardization transforms features to have zero mean and unit variance. Normalization (Min-Max) scales features to a fixed range, typically [0, 1].",
        explanationID: "Standardization mentransformasi fitur agar memiliki mean nol dan variansi satu. Normalization (Min-Max) menskalakan fitur ke rentang tetap, biasanya [0, 1].",
        topic: "aiMlDl",
        difficulty: .beginner
    )
]
