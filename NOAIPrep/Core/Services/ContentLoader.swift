import Foundation

@MainActor
class ContentLoader {
    static let shared = ContentLoader()

    private init() {}

    // MARK: - Load Topics
    func loadTopics() -> [Topic] {
        // For now, return sample data
        // Later, this will load from JSON files
        return Topic.sampleTopics
    }

    // MARK: - Load Questions
    func loadQuestions(for topic: String? = nil) -> [Question] {
        var questions = Question.sampleQuestions
        if let topic = topic {
            questions = questions.filter { $0.topic == topic }
        }
        return questions
    }

    // MARK: - Load Code Snippets
    func loadSnippets(for category: CodeSnippet.SnippetCategory? = nil) -> [CodeSnippet] {
        var snippets = CodeSnippet.sampleSnippets
        if let category = category {
            snippets = snippets.filter { $0.category == category }
        }
        return snippets
    }

    // MARK: - JSON Loading (for future use)
    private func loadJSON<T: Decodable>(_ filename: String) -> T? {
        guard let url = Bundle.main.url(forResource: filename, withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let decoded = try? JSONDecoder().decode(T.self, from: data) else {
            return nil
        }
        return decoded
    }
}

// MARK: - Sample Data
extension Topic {
    static let sampleTopics: [Topic] = [
        Topic(
            id: "ml-foundations",
            titleEN: "ML Foundations",
            titleID: "Dasar Machine Learning",
            descriptionEN: "Learn the fundamentals of Machine Learning",
            descriptionID: "Pelajari dasar-dasar Machine Learning",
            iconName: "brain",
            color: "blue",
            lessons: [
                Lesson(
                    id: "what-is-ml",
                    titleEN: "What is Machine Learning?",
                    titleID: "Apa itu Machine Learning?",
                    contentEN: """
                    # What is Machine Learning?

                    Machine Learning is a subset of Artificial Intelligence that enables computers to learn from data without being explicitly programmed.

                    ## Key Concepts

                    1. **Training Data**: The data used to teach the model
                    2. **Features**: The input variables used for prediction
                    3. **Labels**: The output we want to predict
                    4. **Model**: The algorithm that learns patterns

                    ## Types of Machine Learning

                    - **Supervised Learning**: Learning from labeled data
                    - **Unsupervised Learning**: Finding patterns in unlabeled data
                    - **Reinforcement Learning**: Learning through trial and error
                    """,
                    contentID: """
                    # Apa itu Machine Learning?

                    Machine Learning adalah cabang dari Kecerdasan Buatan yang memungkinkan komputer belajar dari data tanpa diprogram secara eksplisit.

                    ## Konsep Utama

                    1. **Data Training**: Data yang digunakan untuk mengajar model
                    2. **Fitur**: Variabel input yang digunakan untuk prediksi
                    3. **Label**: Output yang ingin diprediksi
                    4. **Model**: Algoritma yang mempelajari pola

                    ## Jenis Machine Learning

                    - **Supervised Learning**: Belajar dari data berlabel
                    - **Unsupervised Learning**: Menemukan pola dalam data tanpa label
                    - **Reinforcement Learning**: Belajar melalui trial and error
                    """,
                    difficulty: .beginner,
                    estimatedMinutes: 10,
                    codeExample: nil
                ),
                Lesson(
                    id: "linear-regression",
                    titleEN: "Linear Regression",
                    titleID: "Regresi Linear",
                    contentEN: """
                    # Linear Regression

                    Linear Regression is one of the simplest and most widely used ML algorithms.

                    ## The Model

                    The equation: **y = mx + b**

                    Where:
                    - y = predicted value
                    - m = slope (weight)
                    - x = input feature
                    - b = intercept (bias)

                    ## Cost Function

                    We use Mean Squared Error (MSE) to measure how well our model fits:

                    MSE = (1/n) * Σ(y_actual - y_predicted)²
                    """,
                    contentID: """
                    # Regresi Linear

                    Regresi Linear adalah salah satu algoritma ML paling sederhana dan banyak digunakan.

                    ## Model

                    Persamaannya: **y = mx + b**

                    Di mana:
                    - y = nilai prediksi
                    - m = kemiringan (weight)
                    - x = fitur input
                    - b = intercept (bias)

                    ## Fungsi Cost

                    Kita menggunakan Mean Squared Error (MSE) untuk mengukur seberapa baik model:

                    MSE = (1/n) * Σ(y_aktual - y_prediksi)²
                    """,
                    difficulty: .beginner,
                    estimatedMinutes: 15,
                    codeExample: """
                    import numpy as np
                    from sklearn.linear_model import LinearRegression

                    # Sample data
                    X = np.array([[1], [2], [3], [4], [5]])
                    y = np.array([2, 4, 6, 8, 10])

                    # Create and train model
                    model = LinearRegression()
                    model.fit(X, y)

                    # Make prediction
                    prediction = model.predict([[6]])
                    print(f"Prediction for x=6: {prediction[0]}")
                    """
                )
            ]
        ),
        Topic(
            id: "neural-networks",
            titleEN: "Neural Networks",
            titleID: "Jaringan Saraf Tiruan",
            descriptionEN: "Understanding artificial neural networks",
            descriptionID: "Memahami jaringan saraf tiruan",
            iconName: "network",
            color: "purple",
            lessons: [
                Lesson(
                    id: "perceptron",
                    titleEN: "The Perceptron",
                    titleID: "Perceptron",
                    contentEN: """
                    # The Perceptron

                    The perceptron is the simplest form of a neural network - a single neuron.

                    ## How It Works

                    1. Takes multiple inputs (x₁, x₂, ..., xₙ)
                    2. Multiplies each by a weight (w₁, w₂, ..., wₙ)
                    3. Sums them up and adds a bias
                    4. Applies an activation function

                    ## The Math

                    output = activation(Σ(wᵢ * xᵢ) + b)
                    """,
                    contentID: """
                    # Perceptron

                    Perceptron adalah bentuk paling sederhana dari jaringan saraf - satu neuron.

                    ## Cara Kerjanya

                    1. Menerima banyak input (x₁, x₂, ..., xₙ)
                    2. Mengalikan masing-masing dengan bobot (w₁, w₂, ..., wₙ)
                    3. Menjumlahkan dan menambahkan bias
                    4. Menerapkan fungsi aktivasi

                    ## Matematikanya

                    output = aktivasi(Σ(wᵢ * xᵢ) + b)
                    """,
                    difficulty: .intermediate,
                    estimatedMinutes: 20,
                    codeExample: nil
                )
            ]
        ),
        Topic(
            id: "computer-vision",
            titleEN: "Computer Vision",
            titleID: "Computer Vision",
            descriptionEN: "How computers see and understand images",
            descriptionID: "Bagaimana komputer melihat dan memahami gambar",
            iconName: "eye",
            color: "green",
            lessons: []
        ),
        Topic(
            id: "nlp",
            titleEN: "Natural Language Processing",
            titleID: "Pemrosesan Bahasa Alami",
            descriptionEN: "Teaching computers to understand text",
            descriptionID: "Mengajar komputer memahami teks",
            iconName: "text.bubble",
            color: "orange",
            lessons: []
        )
    ]
}

extension Question {
    static let sampleQuestions: [Question] = [
        // MARK: - ML Foundations (Beginner)
        Question(
            id: "q1",
            questionEN: "What type of machine learning uses labeled data for training?",
            questionID: "Jenis machine learning apa yang menggunakan data berlabel untuk training?",
            options: [
                QuestionOption(id: "a", textEN: "Unsupervised Learning", textID: "Unsupervised Learning"),
                QuestionOption(id: "b", textEN: "Supervised Learning", textID: "Supervised Learning"),
                QuestionOption(id: "c", textEN: "Reinforcement Learning", textID: "Reinforcement Learning"),
                QuestionOption(id: "d", textEN: "Transfer Learning", textID: "Transfer Learning")
            ],
            correctOptionId: "b",
            explanationEN: "Supervised Learning uses labeled data where the correct output is known during training.",
            explanationID: "Supervised Learning menggunakan data berlabel di mana output yang benar diketahui saat training.",
            topic: "ml-foundations",
            difficulty: .beginner
        ),
        Question(
            id: "q2",
            questionEN: "In linear regression, what does the slope (m) represent?",
            questionID: "Dalam regresi linear, apa yang diwakili oleh kemiringan (m)?",
            options: [
                QuestionOption(id: "a", textEN: "The y-intercept", textID: "Intercept y"),
                QuestionOption(id: "b", textEN: "The error rate", textID: "Tingkat error"),
                QuestionOption(id: "c", textEN: "The weight/coefficient", textID: "Bobot/koefisien"),
                QuestionOption(id: "d", textEN: "The learning rate", textID: "Learning rate")
            ],
            correctOptionId: "c",
            explanationEN: "The slope (m) represents the weight or coefficient that determines how much the output changes for each unit change in input.",
            explanationID: "Kemiringan (m) mewakili bobot atau koefisien yang menentukan seberapa besar perubahan output untuk setiap perubahan unit input.",
            topic: "ml-foundations",
            difficulty: .beginner
        ),
        Question(
            id: "q3",
            questionEN: "Which loss function is commonly used for binary classification?",
            questionID: "Fungsi loss apa yang umum digunakan untuk klasifikasi biner?",
            options: [
                QuestionOption(id: "a", textEN: "Mean Squared Error (MSE)", textID: "Mean Squared Error (MSE)"),
                QuestionOption(id: "b", textEN: "Binary Cross-Entropy", textID: "Binary Cross-Entropy"),
                QuestionOption(id: "c", textEN: "Mean Absolute Error (MAE)", textID: "Mean Absolute Error (MAE)"),
                QuestionOption(id: "d", textEN: "Huber Loss", textID: "Huber Loss")
            ],
            correctOptionId: "b",
            explanationEN: "Binary Cross-Entropy (or Log Loss) is the standard loss function for binary classification problems as it measures the difference between predicted probabilities and actual binary labels.",
            explanationID: "Binary Cross-Entropy (atau Log Loss) adalah fungsi loss standar untuk klasifikasi biner karena mengukur perbedaan antara probabilitas prediksi dan label biner aktual.",
            topic: "ml-foundations",
            difficulty: .beginner
        ),
        Question(
            id: "q4",
            questionEN: "What is the main difference between classification and regression?",
            questionID: "Apa perbedaan utama antara klasifikasi dan regresi?",
            options: [
                QuestionOption(id: "a", textEN: "Classification uses neural networks, regression doesn't", textID: "Klasifikasi menggunakan neural network, regresi tidak"),
                QuestionOption(id: "b", textEN: "Classification predicts categories, regression predicts continuous values", textID: "Klasifikasi memprediksi kategori, regresi memprediksi nilai kontinu"),
                QuestionOption(id: "c", textEN: "Regression is faster than classification", textID: "Regresi lebih cepat dari klasifikasi"),
                QuestionOption(id: "d", textEN: "Classification needs more data than regression", textID: "Klasifikasi membutuhkan lebih banyak data dari regresi")
            ],
            correctOptionId: "b",
            explanationEN: "Classification predicts discrete categories (e.g., spam/not spam), while regression predicts continuous numerical values (e.g., house prices).",
            explanationID: "Klasifikasi memprediksi kategori diskrit (misalnya spam/bukan spam), sedangkan regresi memprediksi nilai numerik kontinu (misalnya harga rumah).",
            topic: "ml-foundations",
            difficulty: .beginner
        ),
        Question(
            id: "q5",
            questionEN: "In K-Nearest Neighbors (KNN), what happens when K is too small?",
            questionID: "Dalam K-Nearest Neighbors (KNN), apa yang terjadi jika K terlalu kecil?",
            options: [
                QuestionOption(id: "a", textEN: "The model underfits", textID: "Model underfitting"),
                QuestionOption(id: "b", textEN: "The model overfits (sensitive to noise)", textID: "Model overfitting (sensitif terhadap noise)"),
                QuestionOption(id: "c", textEN: "Training becomes slower", textID: "Training menjadi lebih lambat"),
                QuestionOption(id: "d", textEN: "The model ignores all neighbors", textID: "Model mengabaikan semua tetangga")
            ],
            correctOptionId: "b",
            explanationEN: "When K is too small (e.g., K=1), the model becomes sensitive to noise and outliers, leading to overfitting. Larger K values provide smoother decision boundaries.",
            explanationID: "Ketika K terlalu kecil (misalnya K=1), model menjadi sensitif terhadap noise dan outlier, menyebabkan overfitting. Nilai K yang lebih besar memberikan batas keputusan yang lebih halus.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q6",
            questionEN: "What is the bias-variance tradeoff?",
            questionID: "Apa itu bias-variance tradeoff?",
            options: [
                QuestionOption(id: "a", textEN: "Choosing between speed and accuracy", textID: "Memilih antara kecepatan dan akurasi"),
                QuestionOption(id: "b", textEN: "Balancing model simplicity (high bias) vs complexity (high variance)", textID: "Menyeimbangkan kesederhanaan model (bias tinggi) vs kompleksitas (variance tinggi)"),
                QuestionOption(id: "c", textEN: "Trading training time for testing time", textID: "Menukar waktu training dengan waktu testing"),
                QuestionOption(id: "d", textEN: "Choosing between more features or more data", textID: "Memilih antara lebih banyak fitur atau lebih banyak data")
            ],
            correctOptionId: "b",
            explanationEN: "Bias-variance tradeoff: Simple models have high bias (underfit), complex models have high variance (overfit). The goal is finding the sweet spot that minimizes total error.",
            explanationID: "Bias-variance tradeoff: Model sederhana memiliki bias tinggi (underfit), model kompleks memiliki variance tinggi (overfit). Tujuannya adalah menemukan titik optimal yang meminimalkan total error.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q7",
            questionEN: "What is cross-validation used for?",
            questionID: "Untuk apa cross-validation digunakan?",
            options: [
                QuestionOption(id: "a", textEN: "To speed up training", textID: "Untuk mempercepat training"),
                QuestionOption(id: "b", textEN: "To estimate model performance on unseen data", textID: "Untuk memperkirakan performa model pada data yang belum dilihat"),
                QuestionOption(id: "c", textEN: "To reduce the number of features", textID: "Untuk mengurangi jumlah fitur"),
                QuestionOption(id: "d", textEN: "To convert categorical data to numerical", textID: "Untuk mengonversi data kategorikal ke numerik")
            ],
            correctOptionId: "b",
            explanationEN: "Cross-validation (e.g., K-fold) splits data into multiple train/test sets to get a more reliable estimate of how the model will perform on new, unseen data.",
            explanationID: "Cross-validation (misalnya K-fold) membagi data menjadi beberapa set train/test untuk mendapatkan estimasi yang lebih andal tentang bagaimana model akan bekerja pada data baru yang belum dilihat.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q8",
            questionEN: "In a Decision Tree, what is 'Information Gain' used for?",
            questionID: "Dalam Decision Tree, untuk apa 'Information Gain' digunakan?",
            options: [
                QuestionOption(id: "a", textEN: "To determine the depth of the tree", textID: "Untuk menentukan kedalaman pohon"),
                QuestionOption(id: "b", textEN: "To select the best feature to split on", textID: "Untuk memilih fitur terbaik untuk split"),
                QuestionOption(id: "c", textEN: "To prune the tree", textID: "Untuk memangkas pohon"),
                QuestionOption(id: "d", textEN: "To handle missing values", textID: "Untuk menangani nilai yang hilang")
            ],
            correctOptionId: "b",
            explanationEN: "Information Gain measures how much a feature reduces entropy (uncertainty). The feature with highest Information Gain is chosen for splitting at each node.",
            explanationID: "Information Gain mengukur seberapa besar suatu fitur mengurangi entropi (ketidakpastian). Fitur dengan Information Gain tertinggi dipilih untuk splitting di setiap node.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q9",
            questionEN: "What is the main advantage of Random Forest over a single Decision Tree?",
            questionID: "Apa keuntungan utama Random Forest dibanding satu Decision Tree?",
            options: [
                QuestionOption(id: "a", textEN: "Faster training time", textID: "Waktu training lebih cepat"),
                QuestionOption(id: "b", textEN: "Uses less memory", textID: "Menggunakan lebih sedikit memori"),
                QuestionOption(id: "c", textEN: "Reduces overfitting through ensemble averaging", textID: "Mengurangi overfitting melalui rata-rata ensemble"),
                QuestionOption(id: "d", textEN: "Easier to interpret", textID: "Lebih mudah diinterpretasi")
            ],
            correctOptionId: "c",
            explanationEN: "Random Forest combines multiple decision trees (trained on random subsets) and averages their predictions, which reduces overfitting and improves generalization.",
            explanationID: "Random Forest menggabungkan beberapa decision tree (dilatih pada subset acak) dan merata-ratakan prediksi mereka, yang mengurangi overfitting dan meningkatkan generalisasi.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q10",
            questionEN: "What does SVM (Support Vector Machine) try to find?",
            questionID: "Apa yang coba ditemukan oleh SVM (Support Vector Machine)?",
            options: [
                QuestionOption(id: "a", textEN: "The average of all data points", textID: "Rata-rata dari semua titik data"),
                QuestionOption(id: "b", textEN: "The hyperplane that maximizes margin between classes", textID: "Hyperplane yang memaksimalkan margin antar kelas"),
                QuestionOption(id: "c", textEN: "The nearest neighbors", textID: "Tetangga terdekat"),
                QuestionOption(id: "d", textEN: "The deepest decision tree", textID: "Decision tree terdalam")
            ],
            correctOptionId: "b",
            explanationEN: "SVM finds the optimal hyperplane that maximizes the margin (distance) between different classes. The data points closest to this hyperplane are called support vectors.",
            explanationID: "SVM menemukan hyperplane optimal yang memaksimalkan margin (jarak) antara kelas yang berbeda. Titik data yang paling dekat dengan hyperplane ini disebut support vector.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),

        // MARK: - Neural Networks
        Question(
            id: "q11",
            questionEN: "What is the purpose of an activation function in a neural network?",
            questionID: "Apa tujuan dari fungsi aktivasi dalam jaringan saraf?",
            options: [
                QuestionOption(id: "a", textEN: "To normalize the input data", textID: "Untuk normalisasi data input"),
                QuestionOption(id: "b", textEN: "To introduce non-linearity", textID: "Untuk memperkenalkan non-linearitas"),
                QuestionOption(id: "c", textEN: "To reduce overfitting", textID: "Untuk mengurangi overfitting"),
                QuestionOption(id: "d", textEN: "To speed up training", textID: "Untuk mempercepat training")
            ],
            correctOptionId: "b",
            explanationEN: "Activation functions introduce non-linearity, allowing neural networks to learn complex, non-linear patterns. Without them, the network would only learn linear transformations.",
            explanationID: "Fungsi aktivasi memperkenalkan non-linearitas, memungkinkan jaringan saraf mempelajari pola kompleks dan non-linear. Tanpa mereka, jaringan hanya akan mempelajari transformasi linear.",
            topic: "neural-networks",
            difficulty: .beginner
        ),
        Question(
            id: "q12",
            questionEN: "What is the 'vanishing gradient problem'?",
            questionID: "Apa itu masalah 'vanishing gradient'?",
            options: [
                QuestionOption(id: "a", textEN: "Gradients become too large during training", textID: "Gradien menjadi terlalu besar saat training"),
                QuestionOption(id: "b", textEN: "Gradients become very small, slowing learning in early layers", textID: "Gradien menjadi sangat kecil, memperlambat pembelajaran di layer awal"),
                QuestionOption(id: "c", textEN: "The model runs out of memory", textID: "Model kehabisan memori"),
                QuestionOption(id: "d", textEN: "The loss function becomes zero", textID: "Fungsi loss menjadi nol")
            ],
            correctOptionId: "b",
            explanationEN: "Vanishing gradient occurs when gradients become extremely small as they're backpropagated through many layers, making it hard for early layers to learn. ReLU activation helps mitigate this.",
            explanationID: "Vanishing gradient terjadi ketika gradien menjadi sangat kecil saat di-backpropagate melalui banyak layer, membuat layer awal sulit belajar. Aktivasi ReLU membantu mengatasi ini.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q13",
            questionEN: "Which activation function outputs values between 0 and 1?",
            questionID: "Fungsi aktivasi mana yang menghasilkan nilai antara 0 dan 1?",
            options: [
                QuestionOption(id: "a", textEN: "ReLU", textID: "ReLU"),
                QuestionOption(id: "b", textEN: "Tanh", textID: "Tanh"),
                QuestionOption(id: "c", textEN: "Sigmoid", textID: "Sigmoid"),
                QuestionOption(id: "d", textEN: "Leaky ReLU", textID: "Leaky ReLU")
            ],
            correctOptionId: "c",
            explanationEN: "Sigmoid function: σ(x) = 1/(1+e^(-x)) outputs values in range (0,1). It's often used in the output layer for binary classification to represent probabilities.",
            explanationID: "Fungsi Sigmoid: σ(x) = 1/(1+e^(-x)) menghasilkan nilai dalam rentang (0,1). Sering digunakan di layer output untuk klasifikasi biner untuk merepresentasikan probabilitas.",
            topic: "neural-networks",
            difficulty: .beginner
        ),
        Question(
            id: "q14",
            questionEN: "What is backpropagation?",
            questionID: "Apa itu backpropagation?",
            options: [
                QuestionOption(id: "a", textEN: "A method to initialize weights", textID: "Metode untuk menginisialisasi bobot"),
                QuestionOption(id: "b", textEN: "An algorithm to compute gradients for updating weights", textID: "Algoritma untuk menghitung gradien untuk memperbarui bobot"),
                QuestionOption(id: "c", textEN: "A technique to add more layers", textID: "Teknik untuk menambah lebih banyak layer"),
                QuestionOption(id: "d", textEN: "A way to reduce the learning rate", textID: "Cara untuk mengurangi learning rate")
            ],
            correctOptionId: "b",
            explanationEN: "Backpropagation uses the chain rule to efficiently compute gradients of the loss with respect to each weight, enabling gradient descent to update weights and minimize loss.",
            explanationID: "Backpropagation menggunakan aturan rantai untuk menghitung gradien loss terhadap setiap bobot secara efisien, memungkinkan gradient descent memperbarui bobot dan meminimalkan loss.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q15",
            questionEN: "What is the role of the learning rate in gradient descent?",
            questionID: "Apa peran learning rate dalam gradient descent?",
            options: [
                QuestionOption(id: "a", textEN: "It determines how many epochs to train", textID: "Menentukan berapa epoch untuk training"),
                QuestionOption(id: "b", textEN: "It controls the step size when updating weights", textID: "Mengontrol ukuran langkah saat memperbarui bobot"),
                QuestionOption(id: "c", textEN: "It sets the number of layers", textID: "Mengatur jumlah layer"),
                QuestionOption(id: "d", textEN: "It defines the batch size", textID: "Mendefinisikan ukuran batch")
            ],
            correctOptionId: "b",
            explanationEN: "Learning rate controls how much weights are updated in each step. Too high: overshooting, unstable training. Too low: slow convergence, may get stuck in local minima.",
            explanationID: "Learning rate mengontrol seberapa besar bobot diperbarui di setiap langkah. Terlalu tinggi: melampaui target, training tidak stabil. Terlalu rendah: konvergensi lambat, mungkin terjebak di local minima.",
            topic: "neural-networks",
            difficulty: .beginner
        ),
        Question(
            id: "q16",
            questionEN: "What is Dropout used for in neural networks?",
            questionID: "Untuk apa Dropout digunakan dalam neural network?",
            options: [
                QuestionOption(id: "a", textEN: "To speed up training", textID: "Untuk mempercepat training"),
                QuestionOption(id: "b", textEN: "To prevent overfitting by randomly disabling neurons", textID: "Untuk mencegah overfitting dengan menonaktifkan neuron secara acak"),
                QuestionOption(id: "c", textEN: "To reduce the number of parameters", textID: "Untuk mengurangi jumlah parameter"),
                QuestionOption(id: "d", textEN: "To increase model capacity", textID: "Untuk meningkatkan kapasitas model")
            ],
            correctOptionId: "b",
            explanationEN: "Dropout randomly sets a fraction of neurons to zero during training, preventing co-adaptation and acting as regularization to reduce overfitting.",
            explanationID: "Dropout secara acak mengatur sebagian neuron ke nol selama training, mencegah ko-adaptasi dan bertindak sebagai regularisasi untuk mengurangi overfitting.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q17",
            questionEN: "In a neural network, what is a 'hidden layer'?",
            questionID: "Dalam neural network, apa itu 'hidden layer'?",
            options: [
                QuestionOption(id: "a", textEN: "A layer that is not trained", textID: "Layer yang tidak dilatih"),
                QuestionOption(id: "b", textEN: "Any layer between input and output layers", textID: "Layer apa pun antara layer input dan output"),
                QuestionOption(id: "c", textEN: "A layer with zero weights", textID: "Layer dengan bobot nol"),
                QuestionOption(id: "d", textEN: "The output layer when it's not visible", textID: "Layer output ketika tidak terlihat")
            ],
            correctOptionId: "b",
            explanationEN: "Hidden layers are all layers between the input and output layers. They extract and transform features, enabling the network to learn complex representations.",
            explanationID: "Hidden layer adalah semua layer antara layer input dan output. Mereka mengekstrak dan mentransformasi fitur, memungkinkan jaringan mempelajari representasi kompleks.",
            topic: "neural-networks",
            difficulty: .beginner
        ),

        // MARK: - Deep Learning & Advanced
        Question(
            id: "q18",
            questionEN: "What is the main advantage of Convolutional Neural Networks (CNNs) for images?",
            questionID: "Apa keuntungan utama Convolutional Neural Networks (CNN) untuk gambar?",
            options: [
                QuestionOption(id: "a", textEN: "They require less training data", textID: "Mereka membutuhkan lebih sedikit data training"),
                QuestionOption(id: "b", textEN: "They capture spatial hierarchies and local patterns", textID: "Mereka menangkap hierarki spasial dan pola lokal"),
                QuestionOption(id: "c", textEN: "They are faster than other networks", textID: "Mereka lebih cepat dari jaringan lain"),
                QuestionOption(id: "d", textEN: "They don't need GPUs", textID: "Mereka tidak membutuhkan GPU")
            ],
            correctOptionId: "b",
            explanationEN: "CNNs use convolutional layers to detect local patterns (edges, textures) and pooling to build spatial hierarchies, making them ideal for image recognition tasks.",
            explanationID: "CNN menggunakan layer konvolusi untuk mendeteksi pola lokal (tepi, tekstur) dan pooling untuk membangun hierarki spasial, menjadikannya ideal untuk tugas pengenalan gambar.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q19",
            questionEN: "What does the 'Attention' mechanism in Transformers do?",
            questionID: "Apa yang dilakukan mekanisme 'Attention' dalam Transformers?",
            options: [
                QuestionOption(id: "a", textEN: "Reduces the model size", textID: "Mengurangi ukuran model"),
                QuestionOption(id: "b", textEN: "Allows the model to focus on relevant parts of the input", textID: "Memungkinkan model fokus pada bagian input yang relevan"),
                QuestionOption(id: "c", textEN: "Speeds up training", textID: "Mempercepat training"),
                QuestionOption(id: "d", textEN: "Removes noise from data", textID: "Menghilangkan noise dari data")
            ],
            correctOptionId: "b",
            explanationEN: "Attention computes weighted importance scores between all positions in a sequence, allowing the model to focus on relevant context regardless of distance in the sequence.",
            explanationID: "Attention menghitung skor kepentingan berbobot antara semua posisi dalam sequence, memungkinkan model fokus pada konteks yang relevan terlepas dari jarak dalam sequence.",
            topic: "neural-networks",
            difficulty: .advanced
        ),
        Question(
            id: "q20",
            questionEN: "What is 'Batch Normalization' used for?",
            questionID: "Untuk apa 'Batch Normalization' digunakan?",
            options: [
                QuestionOption(id: "a", textEN: "To reduce batch size", textID: "Untuk mengurangi ukuran batch"),
                QuestionOption(id: "b", textEN: "To normalize layer inputs, stabilizing and speeding up training", textID: "Untuk normalisasi input layer, menstabilkan dan mempercepat training"),
                QuestionOption(id: "c", textEN: "To increase the number of batches", textID: "Untuk meningkatkan jumlah batch"),
                QuestionOption(id: "d", textEN: "To sort data into batches", textID: "Untuk mengurutkan data ke dalam batch")
            ],
            correctOptionId: "b",
            explanationEN: "Batch Normalization normalizes the inputs of each layer to have zero mean and unit variance, reducing internal covariate shift and enabling faster, more stable training.",
            explanationID: "Batch Normalization menormalisasi input setiap layer untuk memiliki mean nol dan variance satu, mengurangi internal covariate shift dan memungkinkan training lebih cepat dan stabil.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),

        // MARK: - Unsupervised Learning
        Question(
            id: "q21",
            questionEN: "What does K-Means clustering algorithm try to minimize?",
            questionID: "Apa yang coba diminimalkan oleh algoritma clustering K-Means?",
            options: [
                QuestionOption(id: "a", textEN: "The number of clusters", textID: "Jumlah cluster"),
                QuestionOption(id: "b", textEN: "The within-cluster sum of squares (inertia)", textID: "Jumlah kuadrat dalam cluster (inertia)"),
                QuestionOption(id: "c", textEN: "The distance between clusters", textID: "Jarak antar cluster"),
                QuestionOption(id: "d", textEN: "The number of iterations", textID: "Jumlah iterasi")
            ],
            correctOptionId: "b",
            explanationEN: "K-Means minimizes the within-cluster sum of squares (WCSS/inertia) - the sum of squared distances between each point and its assigned cluster centroid.",
            explanationID: "K-Means meminimalkan within-cluster sum of squares (WCSS/inertia) - jumlah jarak kuadrat antara setiap titik dan centroid cluster yang ditugaskan.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),
        Question(
            id: "q22",
            questionEN: "What is Principal Component Analysis (PCA) used for?",
            questionID: "Untuk apa Principal Component Analysis (PCA) digunakan?",
            options: [
                QuestionOption(id: "a", textEN: "Classification", textID: "Klasifikasi"),
                QuestionOption(id: "b", textEN: "Dimensionality reduction", textID: "Pengurangan dimensi"),
                QuestionOption(id: "c", textEN: "Clustering", textID: "Clustering"),
                QuestionOption(id: "d", textEN: "Regression", textID: "Regresi")
            ],
            correctOptionId: "b",
            explanationEN: "PCA reduces dimensionality by finding principal components (directions of maximum variance) and projecting data onto fewer dimensions while preserving most information.",
            explanationID: "PCA mengurangi dimensi dengan menemukan komponen utama (arah variance maksimum) dan memproyeksikan data ke dimensi lebih sedikit sambil mempertahankan sebagian besar informasi.",
            topic: "ml-foundations",
            difficulty: .intermediate
        ),

        // MARK: - Practical & Coding
        Question(
            id: "q23",
            questionEN: "In PyTorch, what does 'model.eval()' do?",
            questionID: "Di PyTorch, apa fungsi 'model.eval()'?",
            options: [
                QuestionOption(id: "a", textEN: "Evaluates the model accuracy", textID: "Mengevaluasi akurasi model"),
                QuestionOption(id: "b", textEN: "Sets the model to evaluation mode (disables dropout, etc.)", textID: "Mengatur model ke mode evaluasi (menonaktifkan dropout, dll.)"),
                QuestionOption(id: "c", textEN: "Calculates the loss", textID: "Menghitung loss"),
                QuestionOption(id: "d", textEN: "Saves the model", textID: "Menyimpan model")
            ],
            correctOptionId: "b",
            explanationEN: "model.eval() sets the model to evaluation mode, which disables dropout and uses running statistics for batch normalization instead of batch statistics.",
            explanationID: "model.eval() mengatur model ke mode evaluasi, yang menonaktifkan dropout dan menggunakan statistik running untuk batch normalization daripada statistik batch.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q24",
            questionEN: "What is the purpose of 'optimizer.zero_grad()' in PyTorch?",
            questionID: "Apa tujuan 'optimizer.zero_grad()' di PyTorch?",
            options: [
                QuestionOption(id: "a", textEN: "To set learning rate to zero", textID: "Untuk mengatur learning rate ke nol"),
                QuestionOption(id: "b", textEN: "To clear accumulated gradients from previous iteration", textID: "Untuk membersihkan gradien yang terakumulasi dari iterasi sebelumnya"),
                QuestionOption(id: "c", textEN: "To reset all weights to zero", textID: "Untuk mereset semua bobot ke nol"),
                QuestionOption(id: "d", textEN: "To stop training", textID: "Untuk menghentikan training")
            ],
            correctOptionId: "b",
            explanationEN: "PyTorch accumulates gradients by default. zero_grad() clears old gradients before computing new ones in each training iteration to prevent incorrect gradient accumulation.",
            explanationID: "PyTorch mengakumulasi gradien secara default. zero_grad() membersihkan gradien lama sebelum menghitung yang baru di setiap iterasi training untuk mencegah akumulasi gradien yang salah.",
            topic: "neural-networks",
            difficulty: .intermediate
        ),
        Question(
            id: "q25",
            questionEN: "What does 'train_test_split' in scikit-learn do?",
            questionID: "Apa fungsi 'train_test_split' di scikit-learn?",
            options: [
                QuestionOption(id: "a", textEN: "Trains and tests the model automatically", textID: "Melatih dan menguji model secara otomatis"),
                QuestionOption(id: "b", textEN: "Splits data into training and testing sets", textID: "Membagi data menjadi set training dan testing"),
                QuestionOption(id: "c", textEN: "Removes outliers from data", textID: "Menghapus outlier dari data"),
                QuestionOption(id: "d", textEN: "Normalizes the data", textID: "Menormalisasi data")
            ],
            correctOptionId: "b",
            explanationEN: "train_test_split randomly divides data into training and testing sets (e.g., 80/20 split), ensuring the model is evaluated on data it hasn't seen during training.",
            explanationID: "train_test_split secara acak membagi data menjadi set training dan testing (misalnya split 80/20), memastikan model dievaluasi pada data yang belum dilihat selama training.",
            topic: "ml-foundations",
            difficulty: .beginner
        ),

        // MARK: - Computer Vision
        Question(
            id: "q26",
            questionEN: "What is a convolution operation in CNNs?",
            questionID: "Apa itu operasi konvolusi dalam CNN?",
            options: [
                QuestionOption(id: "a", textEN: "Adding all pixel values together", textID: "Menjumlahkan semua nilai piksel"),
                QuestionOption(id: "b", textEN: "Sliding a filter over the image to detect features", textID: "Menggeser filter di atas gambar untuk mendeteksi fitur"),
                QuestionOption(id: "c", textEN: "Resizing the image", textID: "Mengubah ukuran gambar"),
                QuestionOption(id: "d", textEN: "Converting image to grayscale", textID: "Mengonversi gambar ke grayscale")
            ],
            correctOptionId: "b",
            explanationEN: "Convolution slides a small filter (kernel) across the image, computing dot products at each position to detect local features like edges, textures, and patterns.",
            explanationID: "Konvolusi menggeser filter kecil (kernel) di seluruh gambar, menghitung dot product di setiap posisi untuk mendeteksi fitur lokal seperti tepi, tekstur, dan pola.",
            topic: "computer-vision",
            difficulty: .beginner
        ),
        Question(
            id: "q27",
            questionEN: "What is the purpose of pooling layers in CNNs?",
            questionID: "Apa tujuan layer pooling dalam CNN?",
            options: [
                QuestionOption(id: "a", textEN: "To add more features", textID: "Untuk menambah lebih banyak fitur"),
                QuestionOption(id: "b", textEN: "To reduce spatial dimensions and computation", textID: "Untuk mengurangi dimensi spasial dan komputasi"),
                QuestionOption(id: "c", textEN: "To increase image resolution", textID: "Untuk meningkatkan resolusi gambar"),
                QuestionOption(id: "d", textEN: "To add color to images", textID: "Untuk menambah warna ke gambar")
            ],
            correctOptionId: "b",
            explanationEN: "Pooling (e.g., max pooling) reduces spatial dimensions by taking the maximum or average value in each region, reducing computation and providing translation invariance.",
            explanationID: "Pooling (misalnya max pooling) mengurangi dimensi spasial dengan mengambil nilai maksimum atau rata-rata di setiap region, mengurangi komputasi dan memberikan translation invariance.",
            topic: "computer-vision",
            difficulty: .beginner
        ),
        Question(
            id: "q28",
            questionEN: "In image processing, what are RGB channels?",
            questionID: "Dalam pemrosesan gambar, apa itu channel RGB?",
            options: [
                QuestionOption(id: "a", textEN: "Three separate layers for Red, Green, and Blue colors", textID: "Tiga layer terpisah untuk warna Merah, Hijau, dan Biru"),
                QuestionOption(id: "b", textEN: "A compression algorithm", textID: "Algoritma kompresi"),
                QuestionOption(id: "c", textEN: "A type of neural network", textID: "Jenis neural network"),
                QuestionOption(id: "d", textEN: "Random Generated Batches", textID: "Random Generated Batches")
            ],
            correctOptionId: "a",
            explanationEN: "RGB represents the three color channels (Red, Green, Blue) that combine to create full-color images. Each channel is a 2D matrix of intensity values (0-255).",
            explanationID: "RGB mewakili tiga channel warna (Merah, Hijau, Biru) yang digabungkan untuk membuat gambar berwarna penuh. Setiap channel adalah matriks 2D dari nilai intensitas (0-255).",
            topic: "computer-vision",
            difficulty: .beginner
        ),
        Question(
            id: "q29",
            questionEN: "What is the difference between Max Pooling and Average Pooling?",
            questionID: "Apa perbedaan antara Max Pooling dan Average Pooling?",
            options: [
                QuestionOption(id: "a", textEN: "Max Pooling is faster", textID: "Max Pooling lebih cepat"),
                QuestionOption(id: "b", textEN: "Max Pooling takes maximum value, Average Pooling takes mean", textID: "Max Pooling mengambil nilai maksimum, Average Pooling mengambil rata-rata"),
                QuestionOption(id: "c", textEN: "Average Pooling uses more memory", textID: "Average Pooling menggunakan lebih banyak memori"),
                QuestionOption(id: "d", textEN: "They are exactly the same", textID: "Keduanya persis sama")
            ],
            correctOptionId: "b",
            explanationEN: "Max Pooling selects the maximum value in each pooling region (preserves strongest features), while Average Pooling computes the mean (smoother representation).",
            explanationID: "Max Pooling memilih nilai maksimum di setiap region pooling (mempertahankan fitur terkuat), sedangkan Average Pooling menghitung rata-rata (representasi lebih halus).",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q30",
            questionEN: "What is a kernel/filter in a convolutional layer?",
            questionID: "Apa itu kernel/filter dalam layer konvolusi?",
            options: [
                QuestionOption(id: "a", textEN: "The entire input image", textID: "Seluruh gambar input"),
                QuestionOption(id: "b", textEN: "A small matrix of learnable weights", textID: "Matriks kecil dari bobot yang dapat dipelajari"),
                QuestionOption(id: "c", textEN: "The output feature map", textID: "Feature map output"),
                QuestionOption(id: "d", textEN: "The activation function", textID: "Fungsi aktivasi")
            ],
            correctOptionId: "b",
            explanationEN: "A kernel is a small matrix (e.g., 3x3, 5x5) of learnable weights that slides across the input to detect specific features. Different kernels detect different patterns.",
            explanationID: "Kernel adalah matriks kecil (misalnya 3x3, 5x5) dari bobot yang dapat dipelajari yang bergeser melintasi input untuk mendeteksi fitur tertentu. Kernel berbeda mendeteksi pola berbeda.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q31",
            questionEN: "What is stride in a convolutional layer?",
            questionID: "Apa itu stride dalam layer konvolusi?",
            options: [
                QuestionOption(id: "a", textEN: "The size of the kernel", textID: "Ukuran kernel"),
                QuestionOption(id: "b", textEN: "The number of pixels the filter moves at each step", textID: "Jumlah piksel filter bergerak di setiap langkah"),
                QuestionOption(id: "c", textEN: "The depth of the network", textID: "Kedalaman jaringan"),
                QuestionOption(id: "d", textEN: "The learning rate", textID: "Learning rate")
            ],
            correctOptionId: "b",
            explanationEN: "Stride determines how many pixels the filter moves at each step. Stride=1 moves one pixel at a time; stride=2 skips every other pixel, reducing output size.",
            explanationID: "Stride menentukan berapa piksel filter bergerak di setiap langkah. Stride=1 bergerak satu piksel setiap kali; stride=2 melompati setiap piksel kedua, mengurangi ukuran output.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q32",
            questionEN: "What is padding in CNNs used for?",
            questionID: "Untuk apa padding digunakan dalam CNN?",
            options: [
                QuestionOption(id: "a", textEN: "To speed up training", textID: "Untuk mempercepat training"),
                QuestionOption(id: "b", textEN: "To preserve spatial dimensions after convolution", textID: "Untuk mempertahankan dimensi spasial setelah konvolusi"),
                QuestionOption(id: "c", textEN: "To reduce the number of parameters", textID: "Untuk mengurangi jumlah parameter"),
                QuestionOption(id: "d", textEN: "To normalize the input", textID: "Untuk normalisasi input")
            ],
            correctOptionId: "b",
            explanationEN: "Padding adds zeros around the input borders, allowing the output to maintain the same spatial dimensions as the input (same padding) or control output size.",
            explanationID: "Padding menambahkan nol di sekitar batas input, memungkinkan output mempertahankan dimensi spasial yang sama dengan input (same padding) atau mengontrol ukuran output.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q33",
            questionEN: "What is data augmentation in computer vision?",
            questionID: "Apa itu data augmentation dalam computer vision?",
            options: [
                QuestionOption(id: "a", textEN: "Collecting more data from the internet", textID: "Mengumpulkan lebih banyak data dari internet"),
                QuestionOption(id: "b", textEN: "Artificially expanding training data using transformations", textID: "Memperluas data training secara artifisial menggunakan transformasi"),
                QuestionOption(id: "c", textEN: "Removing duplicate images", textID: "Menghapus gambar duplikat"),
                QuestionOption(id: "d", textEN: "Compressing image files", textID: "Mengompresi file gambar")
            ],
            correctOptionId: "b",
            explanationEN: "Data augmentation creates new training samples by applying transformations like rotation, flipping, cropping, and color adjustments to existing images, reducing overfitting.",
            explanationID: "Data augmentation membuat sampel training baru dengan menerapkan transformasi seperti rotasi, flipping, cropping, dan penyesuaian warna pada gambar yang ada, mengurangi overfitting.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q34",
            questionEN: "What is transfer learning commonly used for in CV?",
            questionID: "Untuk apa transfer learning biasa digunakan dalam CV?",
            options: [
                QuestionOption(id: "a", textEN: "Training from scratch is always better", textID: "Training dari awal selalu lebih baik"),
                QuestionOption(id: "b", textEN: "Using pre-trained models and fine-tuning for new tasks", textID: "Menggunakan model pre-trained dan fine-tuning untuk tugas baru"),
                QuestionOption(id: "c", textEN: "Transferring images between devices", textID: "Mentransfer gambar antar perangkat"),
                QuestionOption(id: "d", textEN: "Converting models to different formats", textID: "Mengonversi model ke format berbeda")
            ],
            correctOptionId: "b",
            explanationEN: "Transfer learning uses models pre-trained on large datasets (e.g., ImageNet) as a starting point, then fine-tunes them for specific tasks with less data and training time.",
            explanationID: "Transfer learning menggunakan model yang di-pretrain pada dataset besar (misalnya ImageNet) sebagai titik awal, lalu fine-tune untuk tugas spesifik dengan lebih sedikit data dan waktu training.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),
        Question(
            id: "q35",
            questionEN: "What is object detection?",
            questionID: "Apa itu object detection?",
            options: [
                QuestionOption(id: "a", textEN: "Classifying the entire image into one category", textID: "Mengklasifikasikan seluruh gambar ke satu kategori"),
                QuestionOption(id: "b", textEN: "Finding and classifying multiple objects with bounding boxes", textID: "Menemukan dan mengklasifikasikan beberapa objek dengan bounding box"),
                QuestionOption(id: "c", textEN: "Removing objects from images", textID: "Menghapus objek dari gambar"),
                QuestionOption(id: "d", textEN: "Counting pixels in an image", textID: "Menghitung piksel dalam gambar")
            ],
            correctOptionId: "b",
            explanationEN: "Object detection identifies and localizes multiple objects in an image, providing both class labels and bounding box coordinates for each detected object.",
            explanationID: "Object detection mengidentifikasi dan melokalisasi beberapa objek dalam gambar, memberikan label kelas dan koordinat bounding box untuk setiap objek yang terdeteksi.",
            topic: "computer-vision",
            difficulty: .intermediate
        ),

        // MARK: - Natural Language Processing (NLP)
        Question(
            id: "q36",
            questionEN: "What is tokenization in NLP?",
            questionID: "Apa itu tokenisasi dalam NLP?",
            options: [
                QuestionOption(id: "a", textEN: "Encrypting text data", textID: "Mengenkripsi data teks"),
                QuestionOption(id: "b", textEN: "Breaking text into smaller units like words or subwords", textID: "Memecah teks menjadi unit lebih kecil seperti kata atau subkata"),
                QuestionOption(id: "c", textEN: "Translating text to another language", textID: "Menerjemahkan teks ke bahasa lain"),
                QuestionOption(id: "d", textEN: "Removing all punctuation", textID: "Menghapus semua tanda baca")
            ],
            correctOptionId: "b",
            explanationEN: "Tokenization splits text into tokens (words, subwords, or characters) that can be processed by NLP models. It's the first step in most NLP pipelines.",
            explanationID: "Tokenisasi memecah teks menjadi token (kata, subkata, atau karakter) yang dapat diproses oleh model NLP. Ini adalah langkah pertama di sebagian besar pipeline NLP.",
            topic: "nlp",
            difficulty: .beginner
        ),
        Question(
            id: "q37",
            questionEN: "What is a word embedding?",
            questionID: "Apa itu word embedding?",
            options: [
                QuestionOption(id: "a", textEN: "A dictionary of word definitions", textID: "Kamus definisi kata"),
                QuestionOption(id: "b", textEN: "A dense vector representation of words capturing semantic meaning", textID: "Representasi vektor padat dari kata yang menangkap makna semantik"),
                QuestionOption(id: "c", textEN: "A count of word frequencies", textID: "Hitungan frekuensi kata"),
                QuestionOption(id: "d", textEN: "A list of synonyms", textID: "Daftar sinonim")
            ],
            correctOptionId: "b",
            explanationEN: "Word embeddings map words to dense vectors where similar words have similar vectors. Models like Word2Vec learn these representations from large text corpora.",
            explanationID: "Word embedding memetakan kata ke vektor padat di mana kata-kata serupa memiliki vektor serupa. Model seperti Word2Vec mempelajari representasi ini dari korpus teks besar.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q38",
            questionEN: "What problem do RNNs (Recurrent Neural Networks) solve that feedforward networks cannot?",
            questionID: "Masalah apa yang dipecahkan RNN yang tidak bisa dipecahkan feedforward network?",
            options: [
                QuestionOption(id: "a", textEN: "Image classification", textID: "Klasifikasi gambar"),
                QuestionOption(id: "b", textEN: "Processing sequential data with memory of previous inputs", textID: "Memproses data sekuensial dengan memori input sebelumnya"),
                QuestionOption(id: "c", textEN: "Reducing model size", textID: "Mengurangi ukuran model"),
                QuestionOption(id: "d", textEN: "Faster training", textID: "Training lebih cepat")
            ],
            correctOptionId: "b",
            explanationEN: "RNNs have recurrent connections that allow them to maintain a hidden state across time steps, making them suitable for sequential data like text and time series.",
            explanationID: "RNN memiliki koneksi berulang yang memungkinkan mereka mempertahankan hidden state di seluruh time step, menjadikannya cocok untuk data sekuensial seperti teks dan time series.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q39",
            questionEN: "What advantage does LSTM have over vanilla RNN?",
            questionID: "Apa keuntungan LSTM dibanding RNN biasa?",
            options: [
                QuestionOption(id: "a", textEN: "LSTM is smaller and faster", textID: "LSTM lebih kecil dan cepat"),
                QuestionOption(id: "b", textEN: "LSTM can learn long-term dependencies better", textID: "LSTM dapat mempelajari dependensi jangka panjang lebih baik"),
                QuestionOption(id: "c", textEN: "LSTM doesn't need training", textID: "LSTM tidak perlu training"),
                QuestionOption(id: "d", textEN: "LSTM only works with images", textID: "LSTM hanya bekerja dengan gambar")
            ],
            correctOptionId: "b",
            explanationEN: "LSTM uses gate mechanisms (forget, input, output gates) to control information flow, solving the vanishing gradient problem and capturing long-term dependencies effectively.",
            explanationID: "LSTM menggunakan mekanisme gate (forget, input, output gate) untuk mengontrol aliran informasi, menyelesaikan masalah vanishing gradient dan menangkap dependensi jangka panjang secara efektif.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q40",
            questionEN: "What is the main innovation of Transformers over RNNs?",
            questionID: "Apa inovasi utama Transformers dibanding RNN?",
            options: [
                QuestionOption(id: "a", textEN: "Transformers use less memory", textID: "Transformer menggunakan lebih sedikit memori"),
                QuestionOption(id: "b", textEN: "Self-attention allows parallel processing and captures long-range dependencies", textID: "Self-attention memungkinkan pemrosesan paralel dan menangkap dependensi jarak jauh"),
                QuestionOption(id: "c", textEN: "Transformers are smaller models", textID: "Transformer adalah model yang lebih kecil"),
                QuestionOption(id: "d", textEN: "Transformers don't need training data", textID: "Transformer tidak membutuhkan data training")
            ],
            correctOptionId: "b",
            explanationEN: "Transformers use self-attention to process all positions in parallel (not sequentially like RNNs), enabling faster training and better modeling of long-range dependencies.",
            explanationID: "Transformer menggunakan self-attention untuk memproses semua posisi secara paralel (tidak sekuensial seperti RNN), memungkinkan training lebih cepat dan pemodelan dependensi jarak jauh yang lebih baik.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q41",
            questionEN: "In Transformers, what are Query, Key, and Value?",
            questionID: "Dalam Transformer, apa itu Query, Key, dan Value?",
            options: [
                QuestionOption(id: "a", textEN: "Different types of databases", textID: "Jenis database yang berbeda"),
                QuestionOption(id: "b", textEN: "Components of the attention mechanism for computing relevance", textID: "Komponen mekanisme attention untuk menghitung relevansi"),
                QuestionOption(id: "c", textEN: "Hyperparameters for training", textID: "Hyperparameter untuk training"),
                QuestionOption(id: "d", textEN: "Types of loss functions", textID: "Jenis fungsi loss")
            ],
            correctOptionId: "b",
            explanationEN: "In attention, Query asks 'what am I looking for?', Key answers 'what do I contain?', and Value provides 'what information do I give?'. Attention scores are computed from Q and K, then used to weight V.",
            explanationID: "Dalam attention, Query bertanya 'apa yang saya cari?', Key menjawab 'apa yang saya miliki?', dan Value memberikan 'informasi apa yang saya berikan?'. Skor attention dihitung dari Q dan K, lalu digunakan untuk memberi bobot V.",
            topic: "nlp",
            difficulty: .advanced
        ),
        Question(
            id: "q42",
            questionEN: "What is BERT primarily designed for?",
            questionID: "BERT terutama dirancang untuk apa?",
            options: [
                QuestionOption(id: "a", textEN: "Image generation", textID: "Generasi gambar"),
                QuestionOption(id: "b", textEN: "Bidirectional language understanding and representation", textID: "Pemahaman dan representasi bahasa bidirectional"),
                QuestionOption(id: "c", textEN: "Speech recognition only", textID: "Pengenalan suara saja"),
                QuestionOption(id: "d", textEN: "Video processing", textID: "Pemrosesan video")
            ],
            correctOptionId: "b",
            explanationEN: "BERT (Bidirectional Encoder Representations from Transformers) is pre-trained to understand context from both left and right sides, making it powerful for tasks like question answering and sentiment analysis.",
            explanationID: "BERT (Bidirectional Encoder Representations from Transformers) di-pretrain untuk memahami konteks dari sisi kiri dan kanan, membuatnya powerful untuk tugas seperti question answering dan analisis sentimen.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q43",
            questionEN: "What is the purpose of positional encoding in Transformers?",
            questionID: "Apa tujuan positional encoding dalam Transformer?",
            options: [
                QuestionOption(id: "a", textEN: "To reduce model size", textID: "Untuk mengurangi ukuran model"),
                QuestionOption(id: "b", textEN: "To provide information about token positions in the sequence", textID: "Untuk memberikan informasi tentang posisi token dalam sequence"),
                QuestionOption(id: "c", textEN: "To speed up training", textID: "Untuk mempercepat training"),
                QuestionOption(id: "d", textEN: "To handle multiple languages", textID: "Untuk menangani beberapa bahasa")
            ],
            correctOptionId: "b",
            explanationEN: "Since Transformers process all positions in parallel, positional encoding adds position information so the model knows the order of tokens in the sequence.",
            explanationID: "Karena Transformer memproses semua posisi secara paralel, positional encoding menambahkan informasi posisi sehingga model mengetahui urutan token dalam sequence.",
            topic: "nlp",
            difficulty: .intermediate
        ),
        Question(
            id: "q44",
            questionEN: "What is sentiment analysis?",
            questionID: "Apa itu analisis sentimen?",
            options: [
                QuestionOption(id: "a", textEN: "Translating text between languages", textID: "Menerjemahkan teks antar bahasa"),
                QuestionOption(id: "b", textEN: "Determining the emotional tone of text (positive, negative, neutral)", textID: "Menentukan nada emosional teks (positif, negatif, netral)"),
                QuestionOption(id: "c", textEN: "Counting words in a document", textID: "Menghitung kata dalam dokumen"),
                QuestionOption(id: "d", textEN: "Correcting grammar mistakes", textID: "Memperbaiki kesalahan tata bahasa")
            ],
            correctOptionId: "b",
            explanationEN: "Sentiment analysis classifies text based on emotional tone or opinion, commonly used for analyzing reviews, social media posts, and customer feedback.",
            explanationID: "Analisis sentimen mengklasifikasikan teks berdasarkan nada emosional atau opini, umumnya digunakan untuk menganalisis ulasan, posting media sosial, dan umpan balik pelanggan.",
            topic: "nlp",
            difficulty: .beginner
        ),
        Question(
            id: "q45",
            questionEN: "What is the difference between stemming and lemmatization?",
            questionID: "Apa perbedaan antara stemming dan lemmatization?",
            options: [
                QuestionOption(id: "a", textEN: "They are the same thing", textID: "Keduanya sama saja"),
                QuestionOption(id: "b", textEN: "Stemming cuts word endings, lemmatization finds the dictionary root form", textID: "Stemming memotong akhiran kata, lemmatization menemukan bentuk dasar kamus"),
                QuestionOption(id: "c", textEN: "Lemmatization is faster", textID: "Lemmatization lebih cepat"),
                QuestionOption(id: "d", textEN: "Stemming only works for English", textID: "Stemming hanya bekerja untuk bahasa Inggris")
            ],
            correctOptionId: "b",
            explanationEN: "Stemming uses rules to chop off endings (running→runn), while lemmatization uses vocabulary to find proper root forms (running→run, better→good).",
            explanationID: "Stemming menggunakan aturan untuk memotong akhiran (running→runn), sedangkan lemmatization menggunakan kosakata untuk menemukan bentuk dasar yang tepat (running→run, better→good).",
            topic: "nlp",
            difficulty: .intermediate
        )
    ]
}

extension CodeSnippet {
    static let sampleSnippets: [CodeSnippet] = [
        CodeSnippet(
            id: "numpy-basics",
            titleEN: "NumPy Array Basics",
            titleID: "Dasar Array NumPy",
            descriptionEN: "Creating and manipulating arrays with NumPy",
            descriptionID: "Membuat dan memanipulasi array dengan NumPy",
            code: """
            import numpy as np

            # Create arrays
            arr1 = np.array([1, 2, 3, 4, 5])
            arr2 = np.zeros((3, 3))
            arr3 = np.ones((2, 4))
            arr4 = np.arange(0, 10, 2)

            # Array operations
            print("Sum:", arr1.sum())
            print("Mean:", arr1.mean())
            print("Shape:", arr1.shape)

            # Matrix multiplication
            A = np.array([[1, 2], [3, 4]])
            B = np.array([[5, 6], [7, 8]])
            C = np.dot(A, B)
            print("Matrix product:\\n", C)
            """,
            language: "python",
            category: .numpy,
            colabURL: "https://colab.research.google.com/drive/1abc..."
        ),
        CodeSnippet(
            id: "pandas-dataframe",
            titleEN: "Pandas DataFrame Basics",
            titleID: "Dasar DataFrame Pandas",
            descriptionEN: "Working with DataFrames in Pandas",
            descriptionID: "Bekerja dengan DataFrame di Pandas",
            code: """
            import pandas as pd

            # Create DataFrame
            data = {
                'Name': ['Alice', 'Bob', 'Charlie'],
                'Age': [25, 30, 35],
                'Score': [85, 90, 78]
            }
            df = pd.DataFrame(data)

            # Basic operations
            print(df.head())
            print(df.describe())
            print(df['Age'].mean())

            # Filtering
            high_scores = df[df['Score'] > 80]
            print(high_scores)
            """,
            language: "python",
            category: .pandas,
            colabURL: nil
        ),
        CodeSnippet(
            id: "sklearn-classification",
            titleEN: "Simple Classification with Scikit-learn",
            titleID: "Klasifikasi Sederhana dengan Scikit-learn",
            descriptionEN: "Train a classifier using scikit-learn",
            descriptionID: "Melatih classifier menggunakan scikit-learn",
            code: """
            from sklearn.datasets import load_iris
            from sklearn.model_selection import train_test_split
            from sklearn.tree import DecisionTreeClassifier
            from sklearn.metrics import accuracy_score

            # Load data
            iris = load_iris()
            X, y = iris.data, iris.target

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            # Train model
            clf = DecisionTreeClassifier()
            clf.fit(X_train, y_train)

            # Evaluate
            y_pred = clf.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"Accuracy: {accuracy:.2f}")
            """,
            language: "python",
            category: .sklearn,
            colabURL: nil
        ),
        CodeSnippet(
            id: "pytorch-neural-net",
            titleEN: "Simple Neural Network with PyTorch",
            titleID: "Jaringan Saraf Sederhana dengan PyTorch",
            descriptionEN: "Build a basic neural network using PyTorch",
            descriptionID: "Membangun jaringan saraf dasar menggunakan PyTorch",
            code: """
            import torch
            import torch.nn as nn

            # Define a simple neural network
            class SimpleNN(nn.Module):
                def __init__(self, input_size, hidden_size, output_size):
                    super(SimpleNN, self).__init__()
                    self.layer1 = nn.Linear(input_size, hidden_size)
                    self.relu = nn.ReLU()
                    self.layer2 = nn.Linear(hidden_size, output_size)

                def forward(self, x):
                    x = self.layer1(x)
                    x = self.relu(x)
                    x = self.layer2(x)
                    return x

            # Create model
            model = SimpleNN(input_size=10, hidden_size=5, output_size=2)

            # Example forward pass
            x = torch.randn(1, 10)
            output = model(x)
            print("Output:", output)
            """,
            language: "python",
            category: .pytorch,
            colabURL: nil
        )
    ]
}
