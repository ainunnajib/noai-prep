import Foundation

// MARK: - AI/ML/DL: Neural Networks Questions (50 questions)
// Subcategory: Perceptrons, MLPs, backpropagation, activation functions, optimization

let neuralNetworkQuestions: [Question] = [
    // Batch 1: Fundamentals (10 questions)
    Question(
        id: "nn001",
        questionEN: "What is a perceptron?",
        questionID: "Apa itu perceptron?",
        options: [
            QuestionOption(id: "a", textEN: "A single-layer neural network unit for binary classification", textID: "Unit neural network satu layer untuk klasifikasi biner"),
            QuestionOption(id: "b", textEN: "A type of activation function", textID: "Jenis fungsi aktivasi"),
            QuestionOption(id: "c", textEN: "A loss function", textID: "Fungsi loss"),
            QuestionOption(id: "d", textEN: "A regularization technique", textID: "Teknik regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "A perceptron is the simplest neural network - a single neuron that computes a weighted sum of inputs, adds a bias, and applies a threshold function.",
        explanationID: "Perceptron adalah neural network paling sederhana - satu neuron yang menghitung weighted sum dari input, menambahkan bias, dan menerapkan fungsi threshold.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn002",
        questionEN: "What does a neuron in a neural network compute?",
        questionID: "Apa yang dihitung oleh neuron dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Weighted sum of inputs + bias, then activation function", textID: "Weighted sum dari input + bias, lalu fungsi aktivasi"),
            QuestionOption(id: "b", textEN: "Average of all inputs", textID: "Rata-rata semua input"),
            QuestionOption(id: "c", textEN: "Maximum of all inputs", textID: "Maksimum dari semua input"),
            QuestionOption(id: "d", textEN: "Product of all inputs", textID: "Perkalian semua input")
        ],
        correctOptionId: "a",
        explanationEN: "A neuron computes: output = activation(Σ(weight_i × input_i) + bias). It's a weighted sum passed through a non-linear activation function.",
        explanationID: "Neuron menghitung: output = activation(Σ(weight_i × input_i) + bias). Ini adalah weighted sum yang melewati fungsi aktivasi non-linear.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn003",
        questionEN: "Why do neural networks need non-linear activation functions?",
        questionID: "Mengapa neural network membutuhkan fungsi aktivasi non-linear?",
        options: [
            QuestionOption(id: "a", textEN: "To learn complex, non-linear patterns in data", textID: "Untuk mempelajari pola kompleks non-linear dalam data"),
            QuestionOption(id: "b", textEN: "To speed up training", textID: "Untuk mempercepat training"),
            QuestionOption(id: "c", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "To prevent overfitting", textID: "Untuk mencegah overfitting")
        ],
        correctOptionId: "a",
        explanationEN: "Without non-linear activations, multiple layers would collapse to a single linear transformation. Non-linearity enables learning complex decision boundaries.",
        explanationID: "Tanpa aktivasi non-linear, beberapa layer akan menjadi satu transformasi linear. Non-linearitas memungkinkan pembelajaran batas keputusan yang kompleks.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn004",
        questionEN: "What is the ReLU activation function?",
        questionID: "Apa itu fungsi aktivasi ReLU?",
        options: [
            QuestionOption(id: "a", textEN: "f(x) = max(0, x)", textID: "f(x) = max(0, x)"),
            QuestionOption(id: "b", textEN: "f(x) = 1/(1+e^-x)", textID: "f(x) = 1/(1+e^-x)"),
            QuestionOption(id: "c", textEN: "f(x) = tanh(x)", textID: "f(x) = tanh(x)"),
            QuestionOption(id: "d", textEN: "f(x) = x^2", textID: "f(x) = x^2")
        ],
        correctOptionId: "a",
        explanationEN: "ReLU (Rectified Linear Unit) returns x if x > 0, else 0. It's computationally efficient and helps mitigate vanishing gradients.",
        explanationID: "ReLU (Rectified Linear Unit) mengembalikan x jika x > 0, jika tidak 0. Ini efisien secara komputasi dan membantu mengurangi vanishing gradients.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn005",
        questionEN: "What is the output range of the sigmoid activation function?",
        questionID: "Apa rentang output dari fungsi aktivasi sigmoid?",
        options: [
            QuestionOption(id: "a", textEN: "(0, 1)", textID: "(0, 1)"),
            QuestionOption(id: "b", textEN: "(-1, 1)", textID: "(-1, 1)"),
            QuestionOption(id: "c", textEN: "(0, infinity)", textID: "(0, infinity)"),
            QuestionOption(id: "d", textEN: "(-infinity, infinity)", textID: "(-infinity, infinity)")
        ],
        correctOptionId: "a",
        explanationEN: "Sigmoid σ(x) = 1/(1+e^-x) squashes outputs to (0, 1). It's useful for binary classification output but can cause vanishing gradients.",
        explanationID: "Sigmoid σ(x) = 1/(1+e^-x) menekan output ke (0, 1). Berguna untuk output klasifikasi biner tetapi dapat menyebabkan vanishing gradients.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn006",
        questionEN: "What is the output range of the tanh activation function?",
        questionID: "Apa rentang output dari fungsi aktivasi tanh?",
        options: [
            QuestionOption(id: "a", textEN: "(-1, 1)", textID: "(-1, 1)"),
            QuestionOption(id: "b", textEN: "(0, 1)", textID: "(0, 1)"),
            QuestionOption(id: "c", textEN: "(0, infinity)", textID: "(0, infinity)"),
            QuestionOption(id: "d", textEN: "(-infinity, 0)", textID: "(-infinity, 0)")
        ],
        correctOptionId: "a",
        explanationEN: "Tanh (hyperbolic tangent) outputs values between -1 and 1. It's zero-centered, making optimization easier than sigmoid in hidden layers.",
        explanationID: "Tanh (hyperbolic tangent) menghasilkan nilai antara -1 dan 1. Ia berpusat di nol, membuat optimisasi lebih mudah dari sigmoid di hidden layers.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn007",
        questionEN: "What is a Multi-Layer Perceptron (MLP)?",
        questionID: "Apa itu Multi-Layer Perceptron (MLP)?",
        options: [
            QuestionOption(id: "a", textEN: "A neural network with multiple fully-connected layers", textID: "Neural network dengan beberapa fully-connected layer"),
            QuestionOption(id: "b", textEN: "A single perceptron with multiple outputs", textID: "Satu perceptron dengan banyak output"),
            QuestionOption(id: "c", textEN: "A convolutional neural network", textID: "Convolutional neural network"),
            QuestionOption(id: "d", textEN: "A recurrent neural network", textID: "Recurrent neural network")
        ],
        correctOptionId: "a",
        explanationEN: "An MLP consists of an input layer, one or more hidden layers, and an output layer. Each layer is fully connected to the next.",
        explanationID: "MLP terdiri dari input layer, satu atau lebih hidden layer, dan output layer. Setiap layer fully connected ke layer berikutnya.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn008",
        questionEN: "What is the purpose of the bias term in neural networks?",
        questionID: "Apa tujuan dari bias term dalam neural networks?",
        options: [
            QuestionOption(id: "a", textEN: "To shift the activation function for better fitting", textID: "Untuk menggeser fungsi aktivasi untuk fitting yang lebih baik"),
            QuestionOption(id: "b", textEN: "To speed up training", textID: "Untuk mempercepat training"),
            QuestionOption(id: "c", textEN: "To prevent overfitting", textID: "Untuk mencegah overfitting"),
            QuestionOption(id: "d", textEN: "To reduce the number of parameters", textID: "Untuk mengurangi jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Bias allows the activation function to be shifted left or right, enabling the neuron to better fit the data regardless of input values.",
        explanationID: "Bias memungkinkan fungsi aktivasi digeser ke kiri atau kanan, memungkinkan neuron untuk lebih cocok dengan data terlepas dari nilai input.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn009",
        questionEN: "What is a hidden layer in a neural network?",
        questionID: "Apa itu hidden layer dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "A layer between input and output that learns intermediate representations", textID: "Layer antara input dan output yang mempelajari representasi antara"),
            QuestionOption(id: "b", textEN: "A layer that is not trained", textID: "Layer yang tidak dilatih"),
            QuestionOption(id: "c", textEN: "The final output layer", textID: "Layer output akhir"),
            QuestionOption(id: "d", textEN: "A layer that only contains biases", textID: "Layer yang hanya berisi bias")
        ],
        correctOptionId: "a",
        explanationEN: "Hidden layers are internal layers that transform inputs into increasingly abstract representations. They're 'hidden' because their outputs aren't directly observed.",
        explanationID: "Hidden layers adalah layer internal yang mentransformasi input menjadi representasi yang semakin abstrak. Mereka 'hidden' karena outputnya tidak diamati secara langsung.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn010",
        questionEN: "What is the softmax function used for?",
        questionID: "Untuk apa fungsi softmax digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Converting logits to probabilities for multi-class classification", textID: "Mengubah logit menjadi probabilitas untuk klasifikasi multi-kelas"),
            QuestionOption(id: "b", textEN: "Normalizing input data", textID: "Menormalisasi data input"),
            QuestionOption(id: "c", textEN: "Regularizing weights", textID: "Meregularisasi bobot"),
            QuestionOption(id: "d", textEN: "Preventing gradient explosion", textID: "Mencegah gradient explosion")
        ],
        correctOptionId: "a",
        explanationEN: "Softmax converts a vector of real numbers into a probability distribution. Each output is between 0 and 1, and all outputs sum to 1.",
        explanationID: "Softmax mengubah vektor bilangan real menjadi distribusi probabilitas. Setiap output antara 0 dan 1, dan semua output berjumlah 1.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 2: Backpropagation & Training (10 questions)
    Question(
        id: "nn011",
        questionEN: "What is backpropagation?",
        questionID: "Apa itu backpropagation?",
        options: [
            QuestionOption(id: "a", textEN: "An algorithm to compute gradients by propagating errors backward", textID: "Algoritma untuk menghitung gradien dengan mempropagasi error ke belakang"),
            QuestionOption(id: "b", textEN: "A method to initialize weights", textID: "Metode untuk menginisialisasi bobot"),
            QuestionOption(id: "c", textEN: "A regularization technique", textID: "Teknik regularisasi"),
            QuestionOption(id: "d", textEN: "A type of activation function", textID: "Jenis fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Backpropagation computes the gradient of the loss with respect to each weight by applying the chain rule, propagating errors from output to input layers.",
        explanationID: "Backpropagation menghitung gradien loss terhadap setiap bobot dengan menerapkan aturan rantai, mempropagasi error dari layer output ke input.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn012",
        questionEN: "What is gradient descent?",
        questionID: "Apa itu gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "An optimization algorithm that updates weights in the direction of negative gradient", textID: "Algoritma optimisasi yang memperbarui bobot ke arah gradien negatif"),
            QuestionOption(id: "b", textEN: "A method to compute activations", textID: "Metode untuk menghitung aktivasi"),
            QuestionOption(id: "c", textEN: "A way to initialize neural networks", textID: "Cara menginisialisasi neural networks"),
            QuestionOption(id: "d", textEN: "A type of loss function", textID: "Jenis fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient descent iteratively adjusts weights by moving in the direction that most decreases the loss function: w = w - learning_rate × gradient.",
        explanationID: "Gradient descent secara iteratif menyesuaikan bobot dengan bergerak ke arah yang paling mengurangi fungsi loss: w = w - learning_rate × gradient.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn013",
        questionEN: "What is the learning rate in neural network training?",
        questionID: "Apa itu learning rate dalam training neural network?",
        options: [
            QuestionOption(id: "a", textEN: "A hyperparameter controlling the step size of weight updates", textID: "Hyperparameter yang mengontrol ukuran langkah pembaruan bobot"),
            QuestionOption(id: "b", textEN: "The number of training epochs", textID: "Jumlah epoch training"),
            QuestionOption(id: "c", textEN: "The size of the hidden layer", textID: "Ukuran hidden layer"),
            QuestionOption(id: "d", textEN: "The accuracy of the model", textID: "Akurasi model")
        ],
        correctOptionId: "a",
        explanationEN: "Learning rate determines how much to update weights based on gradients. Too high causes overshooting, too low causes slow convergence.",
        explanationID: "Learning rate menentukan seberapa banyak memperbarui bobot berdasarkan gradien. Terlalu tinggi menyebabkan overshooting, terlalu rendah menyebabkan konvergensi lambat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn014",
        questionEN: "What is the difference between batch, mini-batch, and stochastic gradient descent?",
        questionID: "Apa perbedaan antara batch, mini-batch, dan stochastic gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "They differ in how many samples are used per weight update", textID: "Mereka berbeda dalam berapa banyak sampel yang digunakan per pembaruan bobot"),
            QuestionOption(id: "b", textEN: "They use different loss functions", textID: "Mereka menggunakan fungsi loss yang berbeda"),
            QuestionOption(id: "c", textEN: "They have different activation functions", textID: "Mereka memiliki fungsi aktivasi yang berbeda"),
            QuestionOption(id: "d", textEN: "They differ in network architecture", textID: "Mereka berbeda dalam arsitektur network")
        ],
        correctOptionId: "a",
        explanationEN: "Batch GD uses all samples, stochastic uses 1 sample, mini-batch uses a subset. Mini-batch balances computational efficiency and gradient stability.",
        explanationID: "Batch GD menggunakan semua sampel, stochastic menggunakan 1 sampel, mini-batch menggunakan subset. Mini-batch menyeimbangkan efisiensi komputasi dan stabilitas gradien.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn015",
        questionEN: "What is the vanishing gradient problem?",
        questionID: "Apa itu masalah vanishing gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients become too small in deep networks, slowing learning", textID: "Gradien menjadi terlalu kecil di jaringan dalam, memperlambat pembelajaran"),
            QuestionOption(id: "b", textEN: "Gradients become infinitely large", textID: "Gradien menjadi sangat besar"),
            QuestionOption(id: "c", textEN: "The network has too few parameters", textID: "Network memiliki terlalu sedikit parameter"),
            QuestionOption(id: "d", textEN: "Training data is too small", textID: "Data training terlalu kecil")
        ],
        correctOptionId: "a",
        explanationEN: "When gradients are repeatedly multiplied by small values (e.g., sigmoid derivatives), they shrink exponentially, preventing early layers from learning.",
        explanationID: "Ketika gradien berulang kali dikalikan dengan nilai kecil (misal turunan sigmoid), mereka menyusut secara eksponensial, mencegah layer awal untuk belajar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn016",
        questionEN: "Why is ReLU preferred over sigmoid in hidden layers?",
        questionID: "Mengapa ReLU lebih disukai daripada sigmoid di hidden layers?",
        options: [
            QuestionOption(id: "a", textEN: "ReLU doesn't saturate for positive values, reducing vanishing gradients", textID: "ReLU tidak jenuh untuk nilai positif, mengurangi vanishing gradients"),
            QuestionOption(id: "b", textEN: "ReLU outputs are always positive", textID: "Output ReLU selalu positif"),
            QuestionOption(id: "c", textEN: "ReLU is differentiable everywhere", textID: "ReLU dapat diturunkan di mana saja"),
            QuestionOption(id: "d", textEN: "ReLU prevents all overfitting", textID: "ReLU mencegah semua overfitting")
        ],
        correctOptionId: "a",
        explanationEN: "ReLU has a gradient of 1 for positive inputs (doesn't saturate), making training faster. Sigmoid saturates at extreme values, causing vanishing gradients.",
        explanationID: "ReLU memiliki gradien 1 untuk input positif (tidak jenuh), membuat training lebih cepat. Sigmoid jenuh pada nilai ekstrem, menyebabkan vanishing gradients.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn017",
        questionEN: "What is the 'dying ReLU' problem?",
        questionID: "Apa itu masalah 'dying ReLU'?",
        options: [
            QuestionOption(id: "a", textEN: "Neurons output 0 for all inputs and stop learning", textID: "Neuron menghasilkan 0 untuk semua input dan berhenti belajar"),
            QuestionOption(id: "b", textEN: "ReLU becomes too slow", textID: "ReLU menjadi terlalu lambat"),
            QuestionOption(id: "c", textEN: "ReLU causes memory overflow", textID: "ReLU menyebabkan overflow memori"),
            QuestionOption(id: "d", textEN: "ReLU outputs become infinite", textID: "Output ReLU menjadi tak hingga")
        ],
        correctOptionId: "a",
        explanationEN: "If a ReLU neuron's input is always negative, it always outputs 0 and has 0 gradient, so it never updates and is 'dead'. Leaky ReLU fixes this.",
        explanationID: "Jika input neuron ReLU selalu negatif, ia selalu menghasilkan 0 dan memiliki gradien 0, jadi tidak pernah diperbarui dan 'mati'. Leaky ReLU memperbaiki ini.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn018",
        questionEN: "What is Leaky ReLU?",
        questionID: "Apa itu Leaky ReLU?",
        options: [
            QuestionOption(id: "a", textEN: "f(x) = x if x > 0, else αx (small positive α)", textID: "f(x) = x jika x > 0, jika tidak αx (α positif kecil)"),
            QuestionOption(id: "b", textEN: "f(x) = max(0, x)", textID: "f(x) = max(0, x)"),
            QuestionOption(id: "c", textEN: "f(x) = tanh(x)", textID: "f(x) = tanh(x)"),
            QuestionOption(id: "d", textEN: "f(x) = sigmoid(x)", textID: "f(x) = sigmoid(x)")
        ],
        correctOptionId: "a",
        explanationEN: "Leaky ReLU allows a small gradient when x < 0 (typically α = 0.01), preventing the dying ReLU problem by keeping neurons alive.",
        explanationID: "Leaky ReLU memungkinkan gradien kecil ketika x < 0 (biasanya α = 0.01), mencegah masalah dying ReLU dengan menjaga neuron tetap aktif.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn019",
        questionEN: "What is an epoch in neural network training?",
        questionID: "Apa itu epoch dalam training neural network?",
        options: [
            QuestionOption(id: "a", textEN: "One complete pass through the entire training dataset", textID: "Satu kali melewati seluruh dataset training secara lengkap"),
            QuestionOption(id: "b", textEN: "One weight update", textID: "Satu pembaruan bobot"),
            QuestionOption(id: "c", textEN: "One batch of data", textID: "Satu batch data"),
            QuestionOption(id: "d", textEN: "One layer forward pass", textID: "Satu forward pass layer")
        ],
        correctOptionId: "a",
        explanationEN: "An epoch is one full iteration over all training samples. Multiple epochs are typically needed for the model to converge.",
        explanationID: "Epoch adalah satu iterasi penuh atas semua sampel training. Beberapa epoch biasanya diperlukan agar model konvergen.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn020",
        questionEN: "What is the purpose of shuffling training data between epochs?",
        questionID: "Apa tujuan mengacak data training antar epoch?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent the model from learning the order of samples", textID: "Untuk mencegah model mempelajari urutan sampel"),
            QuestionOption(id: "b", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "c", textEN: "To increase the learning rate", textID: "Untuk meningkatkan learning rate"),
            QuestionOption(id: "d", textEN: "To decrease the batch size", textID: "Untuk mengurangi batch size")
        ],
        correctOptionId: "a",
        explanationEN: "Shuffling ensures each mini-batch is different across epochs, making gradient updates more varied and helping the model generalize better.",
        explanationID: "Shuffling memastikan setiap mini-batch berbeda di setiap epoch, membuat pembaruan gradien lebih bervariasi dan membantu model menggeneralisasi lebih baik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 3: Loss Functions & Optimization (10 questions)
    Question(
        id: "nn021",
        questionEN: "What loss function is typically used for binary classification?",
        questionID: "Fungsi loss apa yang biasanya digunakan untuk klasifikasi biner?",
        options: [
            QuestionOption(id: "a", textEN: "Binary Cross-Entropy (BCE)", textID: "Binary Cross-Entropy (BCE)"),
            QuestionOption(id: "b", textEN: "Mean Squared Error (MSE)", textID: "Mean Squared Error (MSE)"),
            QuestionOption(id: "c", textEN: "Mean Absolute Error (MAE)", textID: "Mean Absolute Error (MAE)"),
            QuestionOption(id: "d", textEN: "Hinge Loss", textID: "Hinge Loss")
        ],
        correctOptionId: "a",
        explanationEN: "Binary Cross-Entropy measures the difference between predicted probabilities and true binary labels. It's the standard loss for binary classification.",
        explanationID: "Binary Cross-Entropy mengukur perbedaan antara probabilitas prediksi dan label biner sebenarnya. Ini adalah loss standar untuk klasifikasi biner.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn022",
        questionEN: "What loss function is used for multi-class classification?",
        questionID: "Fungsi loss apa yang digunakan untuk klasifikasi multi-kelas?",
        options: [
            QuestionOption(id: "a", textEN: "Categorical Cross-Entropy", textID: "Categorical Cross-Entropy"),
            QuestionOption(id: "b", textEN: "Mean Squared Error", textID: "Mean Squared Error"),
            QuestionOption(id: "c", textEN: "Binary Cross-Entropy", textID: "Binary Cross-Entropy"),
            QuestionOption(id: "d", textEN: "Huber Loss", textID: "Huber Loss")
        ],
        correctOptionId: "a",
        explanationEN: "Categorical Cross-Entropy (or its variant with softmax) compares predicted probability distributions with one-hot encoded true labels.",
        explanationID: "Categorical Cross-Entropy (atau variannya dengan softmax) membandingkan distribusi probabilitas prediksi dengan label sebenarnya yang di-one-hot encode.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn023",
        questionEN: "What is the Adam optimizer?",
        questionID: "Apa itu optimizer Adam?",
        options: [
            QuestionOption(id: "a", textEN: "An optimizer combining momentum and adaptive learning rates", textID: "Optimizer yang menggabungkan momentum dan adaptive learning rates"),
            QuestionOption(id: "b", textEN: "A type of loss function", textID: "Jenis fungsi loss"),
            QuestionOption(id: "c", textEN: "A regularization method", textID: "Metode regularisasi"),
            QuestionOption(id: "d", textEN: "An activation function", textID: "Fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Adam (Adaptive Moment Estimation) maintains per-parameter learning rates using estimates of first and second moments of gradients. It's widely used and robust.",
        explanationID: "Adam (Adaptive Moment Estimation) mempertahankan learning rate per-parameter menggunakan estimasi momen pertama dan kedua dari gradien. Ini banyak digunakan dan robust.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn024",
        questionEN: "What is momentum in optimization?",
        questionID: "Apa itu momentum dalam optimisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulating past gradients to accelerate learning in consistent directions", textID: "Mengakumulasi gradien masa lalu untuk mempercepat pembelajaran ke arah yang konsisten"),
            QuestionOption(id: "b", textEN: "Increasing the learning rate over time", textID: "Meningkatkan learning rate seiring waktu"),
            QuestionOption(id: "c", textEN: "Decreasing the batch size", textID: "Mengurangi batch size"),
            QuestionOption(id: "d", textEN: "Adding noise to gradients", textID: "Menambahkan noise ke gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Momentum adds a fraction of the previous update to the current one, helping accelerate through flat regions and dampen oscillations.",
        explanationID: "Momentum menambahkan sebagian dari pembaruan sebelumnya ke yang sekarang, membantu mempercepat melalui daerah datar dan meredam osilasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn025",
        questionEN: "What is learning rate decay?",
        questionID: "Apa itu learning rate decay?",
        options: [
            QuestionOption(id: "a", textEN: "Gradually decreasing the learning rate during training", textID: "Secara bertahap mengurangi learning rate selama training"),
            QuestionOption(id: "b", textEN: "Increasing the learning rate over time", textID: "Meningkatkan learning rate seiring waktu"),
            QuestionOption(id: "c", textEN: "Keeping the learning rate constant", textID: "Menjaga learning rate konstan"),
            QuestionOption(id: "d", textEN: "Randomly changing the learning rate", textID: "Mengubah learning rate secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Learning rate decay reduces the learning rate over time, allowing large steps initially and smaller, more precise steps as training progresses.",
        explanationID: "Learning rate decay mengurangi learning rate seiring waktu, memungkinkan langkah besar di awal dan langkah lebih kecil dan presisi saat training berlanjut.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn026",
        questionEN: "What is the purpose of gradient clipping?",
        questionID: "Apa tujuan dari gradient clipping?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent exploding gradients by limiting their magnitude", textID: "Untuk mencegah exploding gradients dengan membatasi magnitudenya"),
            QuestionOption(id: "b", textEN: "To increase training speed", textID: "Untuk meningkatkan kecepatan training"),
            QuestionOption(id: "c", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "To improve accuracy", textID: "Untuk meningkatkan akurasi")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient clipping caps gradient values at a threshold, preventing exploding gradients that can destabilize training, especially in RNNs.",
        explanationID: "Gradient clipping membatasi nilai gradien pada threshold tertentu, mencegah exploding gradients yang dapat mengganggu training, terutama di RNN.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn027",
        questionEN: "What is weight initialization and why is it important?",
        questionID: "Apa itu weight initialization dan mengapa itu penting?",
        options: [
            QuestionOption(id: "a", textEN: "Setting initial weight values; poor initialization can prevent learning", textID: "Mengatur nilai bobot awal; inisialisasi buruk dapat mencegah pembelajaran"),
            QuestionOption(id: "b", textEN: "Saving weights to disk", textID: "Menyimpan bobot ke disk"),
            QuestionOption(id: "c", textEN: "Resetting weights after each epoch", textID: "Mereset bobot setelah setiap epoch"),
            QuestionOption(id: "d", textEN: "Copying weights from another model", textID: "Menyalin bobot dari model lain")
        ],
        correctOptionId: "a",
        explanationEN: "Weight initialization determines starting values. Methods like Xavier/Glorot or He initialization help gradients flow properly and prevent vanishing/exploding gradients.",
        explanationID: "Weight initialization menentukan nilai awal. Metode seperti Xavier/Glorot atau He initialization membantu gradien mengalir dengan baik dan mencegah vanishing/exploding gradients.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn028",
        questionEN: "What is Xavier/Glorot initialization?",
        questionID: "Apa itu inisialisasi Xavier/Glorot?",
        options: [
            QuestionOption(id: "a", textEN: "Initializing weights based on the number of input and output neurons", textID: "Menginisialisasi bobot berdasarkan jumlah neuron input dan output"),
            QuestionOption(id: "b", textEN: "Setting all weights to zero", textID: "Mengatur semua bobot menjadi nol"),
            QuestionOption(id: "c", textEN: "Setting all weights to one", textID: "Mengatur semua bobot menjadi satu"),
            QuestionOption(id: "d", textEN: "Randomly setting weights from 0 to 100", textID: "Mengatur bobot secara acak dari 0 sampai 100")
        ],
        correctOptionId: "a",
        explanationEN: "Xavier initialization draws weights from a distribution with variance 2/(fan_in + fan_out), keeping signal variance stable across layers for sigmoid/tanh.",
        explanationID: "Inisialisasi Xavier mengambil bobot dari distribusi dengan variansi 2/(fan_in + fan_out), menjaga variansi sinyal stabil di seluruh layer untuk sigmoid/tanh.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nn029",
        questionEN: "What is He initialization best suited for?",
        questionID: "Untuk apa inisialisasi He paling cocok?",
        options: [
            QuestionOption(id: "a", textEN: "Networks using ReLU activation functions", textID: "Network yang menggunakan fungsi aktivasi ReLU"),
            QuestionOption(id: "b", textEN: "Networks using sigmoid activation", textID: "Network yang menggunakan aktivasi sigmoid"),
            QuestionOption(id: "c", textEN: "Networks with no activation functions", textID: "Network tanpa fungsi aktivasi"),
            QuestionOption(id: "d", textEN: "Recurrent neural networks only", textID: "Recurrent neural networks saja")
        ],
        correctOptionId: "a",
        explanationEN: "He initialization uses variance 2/fan_in, which accounts for ReLU zeroing out negative values. It's the standard initialization for ReLU networks.",
        explanationID: "Inisialisasi He menggunakan variansi 2/fan_in, yang memperhitungkan ReLU yang menghilangkan nilai negatif. Ini adalah inisialisasi standar untuk network ReLU.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nn030",
        questionEN: "What happens if you initialize all weights to zero?",
        questionID: "Apa yang terjadi jika semua bobot diinisialisasi menjadi nol?",
        options: [
            QuestionOption(id: "a", textEN: "All neurons learn the same thing (symmetry problem)", textID: "Semua neuron mempelajari hal yang sama (masalah simetri)"),
            QuestionOption(id: "b", textEN: "The network learns faster", textID: "Network belajar lebih cepat"),
            QuestionOption(id: "c", textEN: "The network becomes more accurate", textID: "Network menjadi lebih akurat"),
            QuestionOption(id: "d", textEN: "Nothing special happens", textID: "Tidak terjadi apa-apa")
        ],
        correctOptionId: "a",
        explanationEN: "With zero weights, all neurons compute the same gradients and updates, so they remain identical. This 'symmetry' prevents the network from learning diverse features.",
        explanationID: "Dengan bobot nol, semua neuron menghitung gradien dan pembaruan yang sama, jadi mereka tetap identik. 'Simetri' ini mencegah network mempelajari fitur yang beragam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 4: Regularization & Generalization (10 questions)
    Question(
        id: "nn031",
        questionEN: "What is dropout in neural networks?",
        questionID: "Apa itu dropout dalam neural networks?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly setting neurons to zero during training to prevent overfitting", textID: "Mengatur neuron secara acak menjadi nol selama training untuk mencegah overfitting"),
            QuestionOption(id: "b", textEN: "Removing the last layer of the network", textID: "Menghapus layer terakhir dari network"),
            QuestionOption(id: "c", textEN: "Reducing the learning rate", textID: "Mengurangi learning rate"),
            QuestionOption(id: "d", textEN: "Increasing batch size", textID: "Meningkatkan batch size")
        ],
        correctOptionId: "a",
        explanationEN: "Dropout randomly sets a fraction of neurons to zero during training, forcing the network to learn redundant representations and reducing co-adaptation.",
        explanationID: "Dropout secara acak mengatur sebagian neuron menjadi nol selama training, memaksa network mempelajari representasi redundan dan mengurangi ko-adaptasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn032",
        questionEN: "What is batch normalization?",
        questionID: "Apa itu batch normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing layer inputs within each mini-batch to stabilize training", textID: "Menormalisasi input layer dalam setiap mini-batch untuk menstabilkan training"),
            QuestionOption(id: "b", textEN: "Shuffling the training data", textID: "Mengacak data training"),
            QuestionOption(id: "c", textEN: "Reducing batch size", textID: "Mengurangi batch size"),
            QuestionOption(id: "d", textEN: "Increasing the number of layers", textID: "Meningkatkan jumlah layer")
        ],
        correctOptionId: "a",
        explanationEN: "Batch normalization normalizes activations to have zero mean and unit variance within each batch, reducing internal covariate shift and allowing higher learning rates.",
        explanationID: "Batch normalization menormalisasi aktivasi agar memiliki mean nol dan variansi satu dalam setiap batch, mengurangi internal covariate shift dan memungkinkan learning rate lebih tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn033",
        questionEN: "What is L2 regularization (weight decay) in neural networks?",
        questionID: "Apa itu regularisasi L2 (weight decay) dalam neural networks?",
        options: [
            QuestionOption(id: "a", textEN: "Adding squared weight magnitudes to the loss function", textID: "Menambahkan kuadrat magnitude bobot ke fungsi loss"),
            QuestionOption(id: "b", textEN: "Removing half of the weights", textID: "Menghapus setengah dari bobot"),
            QuestionOption(id: "c", textEN: "Setting weights to zero", textID: "Mengatur bobot menjadi nol"),
            QuestionOption(id: "d", textEN: "Doubling the learning rate", textID: "Menggandakan learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "L2 regularization adds λ × Σw² to the loss, penalizing large weights and encouraging the model to use smaller, more distributed weights.",
        explanationID: "Regularisasi L2 menambahkan λ × Σw² ke loss, memberikan penalti pada bobot besar dan mendorong model menggunakan bobot yang lebih kecil dan terdistribusi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn034",
        questionEN: "What is early stopping?",
        questionID: "Apa itu early stopping?",
        options: [
            QuestionOption(id: "a", textEN: "Stopping training when validation loss stops improving", textID: "Menghentikan training ketika validation loss berhenti membaik"),
            QuestionOption(id: "b", textEN: "Training for a fixed number of epochs", textID: "Training untuk jumlah epoch tetap"),
            QuestionOption(id: "c", textEN: "Stopping after the first epoch", textID: "Berhenti setelah epoch pertama"),
            QuestionOption(id: "d", textEN: "Reducing the dataset size", textID: "Mengurangi ukuran dataset")
        ],
        correctOptionId: "a",
        explanationEN: "Early stopping monitors validation loss and stops training when it starts increasing (indicating overfitting), restoring the best weights.",
        explanationID: "Early stopping memantau validation loss dan menghentikan training ketika mulai meningkat (menunjukkan overfitting), mengembalikan bobot terbaik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn035",
        questionEN: "What is data augmentation?",
        questionID: "Apa itu data augmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Creating modified versions of training data to increase diversity", textID: "Membuat versi modifikasi dari data training untuk meningkatkan keragaman"),
            QuestionOption(id: "b", textEN: "Removing duplicate data points", textID: "Menghapus titik data duplikat"),
            QuestionOption(id: "c", textEN: "Reducing the training set size", textID: "Mengurangi ukuran training set"),
            QuestionOption(id: "d", textEN: "Normalizing the data", textID: "Menormalisasi data")
        ],
        correctOptionId: "a",
        explanationEN: "Data augmentation artificially expands the training set by applying transformations (rotation, flipping, cropping) to existing samples, improving generalization.",
        explanationID: "Data augmentation secara artifisial memperluas training set dengan menerapkan transformasi (rotasi, pembalikan, cropping) pada sampel yang ada, meningkatkan generalisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn036",
        questionEN: "What is transfer learning?",
        questionID: "Apa itu transfer learning?",
        options: [
            QuestionOption(id: "a", textEN: "Using a pre-trained model as a starting point for a new task", textID: "Menggunakan model pre-trained sebagai titik awal untuk tugas baru"),
            QuestionOption(id: "b", textEN: "Copying data between datasets", textID: "Menyalin data antar dataset"),
            QuestionOption(id: "c", textEN: "Moving the model to a different computer", textID: "Memindahkan model ke komputer lain"),
            QuestionOption(id: "d", textEN: "Training multiple models in parallel", textID: "Melatih banyak model secara paralel")
        ],
        correctOptionId: "a",
        explanationEN: "Transfer learning leverages knowledge from a model trained on a large dataset (e.g., ImageNet) to solve a related task with less data.",
        explanationID: "Transfer learning memanfaatkan pengetahuan dari model yang dilatih pada dataset besar (misal ImageNet) untuk menyelesaikan tugas terkait dengan data lebih sedikit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn037",
        questionEN: "What is fine-tuning in transfer learning?",
        questionID: "Apa itu fine-tuning dalam transfer learning?",
        options: [
            QuestionOption(id: "a", textEN: "Continuing to train a pre-trained model on new data with a low learning rate", textID: "Melanjutkan melatih model pre-trained pada data baru dengan learning rate rendah"),
            QuestionOption(id: "b", textEN: "Only training the last layer", textID: "Hanya melatih layer terakhir"),
            QuestionOption(id: "c", textEN: "Freezing all layers", textID: "Membekukan semua layer"),
            QuestionOption(id: "d", textEN: "Training from scratch", textID: "Training dari awal")
        ],
        correctOptionId: "a",
        explanationEN: "Fine-tuning unfreezes some or all layers of a pre-trained model and continues training on new data, typically with a smaller learning rate to preserve learned features.",
        explanationID: "Fine-tuning membuka beberapa atau semua layer dari model pre-trained dan melanjutkan training pada data baru, biasanya dengan learning rate lebih kecil untuk mempertahankan fitur yang dipelajari.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn038",
        questionEN: "What does it mean to 'freeze' layers in a neural network?",
        questionID: "Apa artinya 'membekukan' layer dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Preventing weight updates in those layers during training", textID: "Mencegah pembaruan bobot di layer tersebut selama training"),
            QuestionOption(id: "b", textEN: "Deleting those layers", textID: "Menghapus layer tersebut"),
            QuestionOption(id: "c", textEN: "Setting all weights to zero", textID: "Mengatur semua bobot menjadi nol"),
            QuestionOption(id: "d", textEN: "Adding more neurons to those layers", textID: "Menambahkan lebih banyak neuron ke layer tersebut")
        ],
        correctOptionId: "a",
        explanationEN: "Freezing layers keeps their weights fixed during training, useful in transfer learning to preserve pre-learned features while training only new layers.",
        explanationID: "Membekukan layer menjaga bobot mereka tetap selama training, berguna dalam transfer learning untuk mempertahankan fitur yang sudah dipelajari sambil hanya melatih layer baru.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn039",
        questionEN: "What is the training-validation-test split typically used for?",
        questionID: "Untuk apa pembagian training-validation-test biasanya digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Training the model, tuning hyperparameters, and final evaluation", textID: "Melatih model, menyetel hyperparameter, dan evaluasi akhir"),
            QuestionOption(id: "b", textEN: "Only training the model three times", textID: "Hanya melatih model tiga kali"),
            QuestionOption(id: "c", textEN: "Creating three different models", textID: "Membuat tiga model berbeda"),
            QuestionOption(id: "d", textEN: "Data augmentation", textID: "Data augmentation")
        ],
        correctOptionId: "a",
        explanationEN: "Training set trains the model, validation set tunes hyperparameters and monitors overfitting, test set provides final unbiased performance evaluation.",
        explanationID: "Training set melatih model, validation set menyetel hyperparameter dan memantau overfitting, test set memberikan evaluasi performa akhir yang tidak bias.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn040",
        questionEN: "Why shouldn't you tune hyperparameters on the test set?",
        questionID: "Mengapa tidak boleh menyetel hyperparameter pada test set?",
        options: [
            QuestionOption(id: "a", textEN: "It would bias the final evaluation and overestimate performance", textID: "Ini akan membias evaluasi akhir dan melebih-lebihkan performa"),
            QuestionOption(id: "b", textEN: "The test set is too small", textID: "Test set terlalu kecil"),
            QuestionOption(id: "c", textEN: "It would slow down training", textID: "Ini akan memperlambat training"),
            QuestionOption(id: "d", textEN: "It's technically not possible", textID: "Secara teknis tidak mungkin")
        ],
        correctOptionId: "a",
        explanationEN: "Using the test set for any decision-making 'leaks' information into model selection, making the final evaluation optimistically biased and unreliable.",
        explanationID: "Menggunakan test set untuk pengambilan keputusan apapun 'membocorkan' informasi ke dalam pemilihan model, membuat evaluasi akhir bias secara optimistis dan tidak dapat diandalkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 5: Model Evaluation & Advanced Topics (10 questions)
    Question(
        id: "nn041",
        questionEN: "What is accuracy as a metric?",
        questionID: "Apa itu akurasi sebagai metrik?",
        options: [
            QuestionOption(id: "a", textEN: "Percentage of correctly classified samples", textID: "Persentase sampel yang diklasifikasikan dengan benar"),
            QuestionOption(id: "b", textEN: "Average loss value", textID: "Nilai loss rata-rata"),
            QuestionOption(id: "c", textEN: "Training time", textID: "Waktu training"),
            QuestionOption(id: "d", textEN: "Number of parameters", textID: "Jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Accuracy = (correct predictions) / (total predictions). It's intuitive but can be misleading for imbalanced datasets.",
        explanationID: "Akurasi = (prediksi benar) / (total prediksi). Ini intuitif tetapi dapat menyesatkan untuk dataset yang tidak seimbang.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn042",
        questionEN: "What is precision in classification?",
        questionID: "Apa itu presisi dalam klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "True Positives / (True Positives + False Positives)", textID: "True Positives / (True Positives + False Positives)"),
            QuestionOption(id: "b", textEN: "True Positives / (True Positives + False Negatives)", textID: "True Positives / (True Positives + False Negatives)"),
            QuestionOption(id: "c", textEN: "Correct / Total", textID: "Benar / Total"),
            QuestionOption(id: "d", textEN: "False Positives / Total", textID: "False Positives / Total")
        ],
        correctOptionId: "a",
        explanationEN: "Precision measures what fraction of positive predictions were actually correct. High precision means few false positives.",
        explanationID: "Presisi mengukur berapa fraksi dari prediksi positif yang benar-benar akurat. Presisi tinggi berarti sedikit false positive.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn043",
        questionEN: "What is recall (sensitivity) in classification?",
        questionID: "Apa itu recall (sensitivitas) dalam klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "True Positives / (True Positives + False Negatives)", textID: "True Positives / (True Positives + False Negatives)"),
            QuestionOption(id: "b", textEN: "True Positives / (True Positives + False Positives)", textID: "True Positives / (True Positives + False Positives)"),
            QuestionOption(id: "c", textEN: "True Negatives / Total", textID: "True Negatives / Total"),
            QuestionOption(id: "d", textEN: "False Negatives / Total", textID: "False Negatives / Total")
        ],
        correctOptionId: "a",
        explanationEN: "Recall measures what fraction of actual positives were correctly identified. High recall means few false negatives.",
        explanationID: "Recall mengukur berapa fraksi dari positif aktual yang diidentifikasi dengan benar. Recall tinggi berarti sedikit false negative.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn044",
        questionEN: "What is the F1 score?",
        questionID: "Apa itu F1 score?",
        options: [
            QuestionOption(id: "a", textEN: "Harmonic mean of precision and recall", textID: "Rata-rata harmonis dari presisi dan recall"),
            QuestionOption(id: "b", textEN: "Average of precision and recall", textID: "Rata-rata dari presisi dan recall"),
            QuestionOption(id: "c", textEN: "Product of precision and recall", textID: "Perkalian dari presisi dan recall"),
            QuestionOption(id: "d", textEN: "Difference between precision and recall", textID: "Perbedaan antara presisi dan recall")
        ],
        correctOptionId: "a",
        explanationEN: "F1 = 2 × (precision × recall) / (precision + recall). It balances precision and recall, useful when you need both to be high.",
        explanationID: "F1 = 2 × (presisi × recall) / (presisi + recall). Ini menyeimbangkan presisi dan recall, berguna ketika keduanya perlu tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn045",
        questionEN: "What is a confusion matrix?",
        questionID: "Apa itu confusion matrix?",
        options: [
            QuestionOption(id: "a", textEN: "A table showing predicted vs actual class counts", textID: "Tabel yang menunjukkan jumlah kelas prediksi vs aktual"),
            QuestionOption(id: "b", textEN: "A measure of model uncertainty", textID: "Ukuran ketidakpastian model"),
            QuestionOption(id: "c", textEN: "A type of loss function", textID: "Jenis fungsi loss"),
            QuestionOption(id: "d", textEN: "A neural network layer", textID: "Layer neural network")
        ],
        correctOptionId: "a",
        explanationEN: "A confusion matrix shows TP, TN, FP, FN for each class, providing a complete picture of classification performance beyond single metrics.",
        explanationID: "Confusion matrix menunjukkan TP, TN, FP, FN untuk setiap kelas, memberikan gambaran lengkap performa klasifikasi di luar metrik tunggal.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nn046",
        questionEN: "What is the ROC curve?",
        questionID: "Apa itu kurva ROC?",
        options: [
            QuestionOption(id: "a", textEN: "A plot of True Positive Rate vs False Positive Rate at various thresholds", textID: "Plot True Positive Rate vs False Positive Rate pada berbagai threshold"),
            QuestionOption(id: "b", textEN: "A plot of loss vs epochs", textID: "Plot loss vs epoch"),
            QuestionOption(id: "c", textEN: "A plot of accuracy vs learning rate", textID: "Plot akurasi vs learning rate"),
            QuestionOption(id: "d", textEN: "A plot of weights vs biases", textID: "Plot bobot vs bias")
        ],
        correctOptionId: "a",
        explanationEN: "ROC (Receiver Operating Characteristic) curve plots sensitivity vs (1-specificity) for different classification thresholds, showing the tradeoff.",
        explanationID: "Kurva ROC (Receiver Operating Characteristic) memplot sensitivitas vs (1-spesifisitas) untuk threshold klasifikasi berbeda, menunjukkan tradeoff.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn047",
        questionEN: "What does AUC-ROC measure?",
        questionID: "Apa yang diukur oleh AUC-ROC?",
        options: [
            QuestionOption(id: "a", textEN: "The model's ability to distinguish between classes", textID: "Kemampuan model untuk membedakan antara kelas"),
            QuestionOption(id: "b", textEN: "Training speed", textID: "Kecepatan training"),
            QuestionOption(id: "c", textEN: "Memory usage", textID: "Penggunaan memori"),
            QuestionOption(id: "d", textEN: "Number of epochs", textID: "Jumlah epoch")
        ],
        correctOptionId: "a",
        explanationEN: "AUC (Area Under the ROC Curve) represents the probability that the model ranks a random positive higher than a random negative. AUC=1 is perfect, AUC=0.5 is random.",
        explanationID: "AUC (Area Under the ROC Curve) merepresentasikan probabilitas bahwa model meranking positif acak lebih tinggi dari negatif acak. AUC=1 sempurna, AUC=0.5 acak.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nn048",
        questionEN: "What is a residual connection (skip connection)?",
        questionID: "Apa itu residual connection (skip connection)?",
        options: [
            QuestionOption(id: "a", textEN: "Adding the input of a layer directly to its output", textID: "Menambahkan input dari sebuah layer langsung ke outputnya"),
            QuestionOption(id: "b", textEN: "Skipping training for certain layers", textID: "Melewatkan training untuk layer tertentu"),
            QuestionOption(id: "c", textEN: "Removing connections between layers", textID: "Menghapus koneksi antar layer"),
            QuestionOption(id: "d", textEN: "Connecting only odd-numbered layers", textID: "Menghubungkan hanya layer bernomor ganjil")
        ],
        correctOptionId: "a",
        explanationEN: "Residual connections add the input x to the output F(x), forming y = F(x) + x. This helps gradients flow through deep networks (used in ResNet).",
        explanationID: "Residual connections menambahkan input x ke output F(x), membentuk y = F(x) + x. Ini membantu gradien mengalir melalui network dalam (digunakan di ResNet).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nn049",
        questionEN: "What is the purpose of layer normalization?",
        questionID: "Apa tujuan dari layer normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing across features for each sample independently", textID: "Menormalisasi di seluruh fitur untuk setiap sampel secara independen"),
            QuestionOption(id: "b", textEN: "Normalizing across samples in a batch", textID: "Menormalisasi di seluruh sampel dalam batch"),
            QuestionOption(id: "c", textEN: "Removing layers from the network", textID: "Menghapus layer dari network"),
            QuestionOption(id: "d", textEN: "Increasing the number of layers", textID: "Meningkatkan jumlah layer")
        ],
        correctOptionId: "a",
        explanationEN: "Layer normalization normalizes across the feature dimension for each sample, unlike batch norm which normalizes across the batch. It's useful for RNNs and transformers.",
        explanationID: "Layer normalization menormalisasi di seluruh dimensi fitur untuk setiap sampel, tidak seperti batch norm yang menormalisasi di seluruh batch. Berguna untuk RNN dan transformer.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nn050",
        questionEN: "What is the difference between a generative and discriminative model?",
        questionID: "Apa perbedaan antara model generatif dan diskriminatif?",
        options: [
            QuestionOption(id: "a", textEN: "Generative learns P(x|y) and P(y), discriminative learns P(y|x) directly", textID: "Generatif mempelajari P(x|y) dan P(y), diskriminatif mempelajari P(y|x) secara langsung"),
            QuestionOption(id: "b", textEN: "Generative is always faster", textID: "Generatif selalu lebih cepat"),
            QuestionOption(id: "c", textEN: "Discriminative can generate new data", textID: "Diskriminatif dapat menghasilkan data baru"),
            QuestionOption(id: "d", textEN: "They are the same", textID: "Mereka sama")
        ],
        correctOptionId: "a",
        explanationEN: "Generative models (e.g., Naive Bayes, GANs) model the data distribution to generate samples. Discriminative models (e.g., logistic regression, neural nets) directly model the decision boundary.",
        explanationID: "Model generatif (misal Naive Bayes, GANs) memodelkan distribusi data untuk menghasilkan sampel. Model diskriminatif (misal logistic regression, neural nets) langsung memodelkan batas keputusan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
