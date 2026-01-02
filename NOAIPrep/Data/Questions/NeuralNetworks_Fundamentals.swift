import Foundation

// MARK: - Neural Networks Fundamentals Questions (50 questions)
// Aligned with IOAI/NOAI Syllabus: Perceptrons, Gradient Descent, Backpropagation, Activation Functions, MLPs
let neuralNetworksFundamentalsQuestions: [Question] = [
    // Perceptrons and Basics
    Question(
        id: "nnf001",
        questionEN: "A single perceptron computes:",
        questionID: "Sebuah perceptron tunggal menghitung:",
        options: [
            QuestionOption(id: "a", textEN: "Weighted sum of inputs plus bias, then applies activation", textID: "Jumlah tertimbang input plus bias, lalu menerapkan aktivasi"),
            QuestionOption(id: "b", textEN: "Only multiplication of inputs", textID: "Hanya perkalian input"),
            QuestionOption(id: "c", textEN: "Random transformation", textID: "Transformasi acak"),
            QuestionOption(id: "d", textEN: "Division of inputs by weights", textID: "Pembagian input oleh bobot")
        ],
        correctOptionId: "a",
        explanationEN: "Perceptron: y = σ(wᵀx + b) where σ is activation function. Basic building block of neural networks.",
        explanationID: "Perceptron: y = σ(wᵀx + b) dimana σ adalah fungsi aktivasi. Blok dasar neural network.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf002",
        questionEN: "A single perceptron can learn:",
        questionID: "Perceptron tunggal dapat mempelajari:",
        options: [
            QuestionOption(id: "a", textEN: "Only linearly separable functions", textID: "Hanya fungsi yang dapat dipisahkan secara linear"),
            QuestionOption(id: "b", textEN: "Any function", textID: "Sembarang fungsi"),
            QuestionOption(id: "c", textEN: "Only XOR function", textID: "Hanya fungsi XOR"),
            QuestionOption(id: "d", textEN: "Only non-linear functions", textID: "Hanya fungsi non-linear")
        ],
        correctOptionId: "a",
        explanationEN: "Single perceptron creates linear decision boundary. Cannot learn XOR (not linearly separable). Need hidden layers.",
        explanationID: "Perceptron tunggal membuat decision boundary linear. Tidak dapat mempelajari XOR (tidak dapat dipisahkan linear). Butuh hidden layer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf003",
        questionEN: "Why is the XOR problem significant in neural network history?",
        questionID: "Mengapa masalah XOR signifikan dalam sejarah neural network?",
        options: [
            QuestionOption(id: "a", textEN: "It showed single perceptrons have limits, motivating multi-layer networks", textID: "Ia menunjukkan perceptron tunggal memiliki batasan, memotivasi jaringan multi-layer"),
            QuestionOption(id: "b", textEN: "It was the first problem solved by AI", textID: "Ini adalah masalah pertama yang diselesaikan oleh AI"),
            QuestionOption(id: "c", textEN: "It proved neural networks are useless", textID: "Ini membuktikan neural network tidak berguna"),
            QuestionOption(id: "d", textEN: "It required quantum computing", textID: "Ini memerlukan komputasi kuantum")
        ],
        correctOptionId: "a",
        explanationEN: "Minsky & Papert's 1969 book showed perceptron can't solve XOR. Led to AI winter. Solved by adding hidden layers.",
        explanationID: "Buku Minsky & Papert 1969 menunjukkan perceptron tidak dapat menyelesaikan XOR. Menyebabkan AI winter. Diselesaikan dengan menambah hidden layer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Activation Functions
    Question(
        id: "nnf004",
        questionEN: "The ReLU activation function is defined as:",
        questionID: "Fungsi aktivasi ReLU didefinisikan sebagai:",
        options: [
            QuestionOption(id: "a", textEN: "max(0, x)", textID: "max(0, x)"),
            QuestionOption(id: "b", textEN: "1 / (1 + e⁻ˣ)", textID: "1 / (1 + e⁻ˣ)"),
            QuestionOption(id: "c", textEN: "(eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)", textID: "(eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)"),
            QuestionOption(id: "d", textEN: "eˣ / Σeˣ", textID: "eˣ / Σeˣ")
        ],
        correctOptionId: "a",
        explanationEN: "ReLU(x) = max(0, x). Simple, fast, helps with vanishing gradients. Most popular for hidden layers.",
        explanationID: "ReLU(x) = max(0, x). Sederhana, cepat, membantu dengan vanishing gradients. Paling populer untuk hidden layer.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf005",
        questionEN: "The sigmoid function σ(x) = 1/(1+e⁻ˣ) outputs values in range:",
        questionID: "Fungsi sigmoid σ(x) = 1/(1+e⁻ˣ) menghasilkan nilai dalam rentang:",
        options: [
            QuestionOption(id: "a", textEN: "(0, 1)", textID: "(0, 1)"),
            QuestionOption(id: "b", textEN: "(-1, 1)", textID: "(-1, 1)"),
            QuestionOption(id: "c", textEN: "(0, ∞)", textID: "(0, ∞)"),
            QuestionOption(id: "d", textEN: "(-∞, ∞)", textID: "(-∞, ∞)")
        ],
        correctOptionId: "a",
        explanationEN: "Sigmoid squashes to (0,1). Good for binary classification output. Suffers from vanishing gradients in deep nets.",
        explanationID: "Sigmoid menekan ke (0,1). Bagus untuk output klasifikasi biner. Menderita vanishing gradients di jaringan dalam.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf006",
        questionEN: "Tanh activation outputs values in range:",
        questionID: "Aktivasi Tanh menghasilkan nilai dalam rentang:",
        options: [
            QuestionOption(id: "a", textEN: "(-1, 1)", textID: "(-1, 1)"),
            QuestionOption(id: "b", textEN: "(0, 1)", textID: "(0, 1)"),
            QuestionOption(id: "c", textEN: "(0, ∞)", textID: "(0, ∞)"),
            QuestionOption(id: "d", textEN: "(-∞, 0)", textID: "(-∞, 0)")
        ],
        correctOptionId: "a",
        explanationEN: "tanh(x) = (eˣ - e⁻ˣ)/(eˣ + e⁻ˣ). Zero-centered unlike sigmoid. Often used in RNNs.",
        explanationID: "tanh(x) = (eˣ - e⁻ˣ)/(eˣ + e⁻ˣ). Berpusat pada nol tidak seperti sigmoid. Sering digunakan di RNN.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf007",
        questionEN: "The 'dying ReLU' problem refers to:",
        questionID: "Masalah 'dying ReLU' mengacu pada:",
        options: [
            QuestionOption(id: "a", textEN: "Neurons stuck with zero output for all inputs", textID: "Neuron terjebak dengan output nol untuk semua input"),
            QuestionOption(id: "b", textEN: "ReLU being too slow", textID: "ReLU terlalu lambat"),
            QuestionOption(id: "c", textEN: "ReLU causing overflow", textID: "ReLU menyebabkan overflow"),
            QuestionOption(id: "d", textEN: "ReLU not being differentiable", textID: "ReLU tidak dapat diturunkan")
        ],
        correctOptionId: "a",
        explanationEN: "If weights push all inputs negative, gradient is 0 forever. Leaky ReLU (small negative slope) helps.",
        explanationID: "Jika bobot mendorong semua input negatif, gradien adalah 0 selamanya. Leaky ReLU (slope negatif kecil) membantu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf008",
        questionEN: "Leaky ReLU differs from ReLU by:",
        questionID: "Leaky ReLU berbeda dari ReLU dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Having small positive slope for negative inputs", textID: "Memiliki slope positif kecil untuk input negatif"),
            QuestionOption(id: "b", textEN: "Being bounded above", textID: "Dibatasi di atas"),
            QuestionOption(id: "c", textEN: "Being differentiable everywhere", textID: "Dapat diturunkan di mana-mana"),
            QuestionOption(id: "d", textEN: "Outputting only 0 or 1", textID: "Hanya menghasilkan 0 atau 1")
        ],
        correctOptionId: "a",
        explanationEN: "Leaky ReLU: max(αx, x) where α ≈ 0.01. Allows gradient flow for negative inputs, preventing dead neurons.",
        explanationID: "Leaky ReLU: max(αx, x) dimana α ≈ 0.01. Memungkinkan aliran gradien untuk input negatif, mencegah neuron mati.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf009",
        questionEN: "Why are non-linear activation functions necessary in neural networks?",
        questionID: "Mengapa fungsi aktivasi non-linear diperlukan dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Without them, stacked layers would still be a linear function", textID: "Tanpa mereka, layer bertumpuk tetap akan menjadi fungsi linear"),
            QuestionOption(id: "b", textEN: "They speed up training", textID: "Mereka mempercepat training"),
            QuestionOption(id: "c", textEN: "They reduce memory usage", textID: "Mereka mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "They are not necessary", textID: "Mereka tidak diperlukan")
        ],
        correctOptionId: "a",
        explanationEN: "Composition of linear functions is linear: f(g(x)) = Ax. Need non-linearity to learn complex patterns.",
        explanationID: "Komposisi fungsi linear adalah linear: f(g(x)) = Ax. Butuh non-linearitas untuk mempelajari pola kompleks.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf010",
        questionEN: "GELU (Gaussian Error Linear Unit) is used in Transformers because:",
        questionID: "GELU (Gaussian Error Linear Unit) digunakan dalam Transformer karena:",
        options: [
            QuestionOption(id: "a", textEN: "It's smooth and works well empirically in attention-based models", textID: "Ia halus dan bekerja baik secara empiris di model berbasis attention"),
            QuestionOption(id: "b", textEN: "It's faster than ReLU", textID: "Ia lebih cepat dari ReLU"),
            QuestionOption(id: "c", textEN: "It's required for attention", textID: "Ia diperlukan untuk attention"),
            QuestionOption(id: "d", textEN: "It prevents all gradient issues", textID: "Ia mencegah semua masalah gradien")
        ],
        correctOptionId: "a",
        explanationEN: "GELU ≈ x·Φ(x) where Φ is Gaussian CDF. Smooth approximation of ReLU. Default in BERT, GPT.",
        explanationID: "GELU ≈ x·Φ(x) dimana Φ adalah CDF Gaussian. Aproksimasi halus dari ReLU. Default di BERT, GPT.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Gradient Descent
    Question(
        id: "nnf011",
        questionEN: "Gradient descent updates weights by:",
        questionID: "Gradient descent memperbarui bobot dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Moving in the opposite direction of the gradient", textID: "Bergerak dalam arah berlawanan dari gradien"),
            QuestionOption(id: "b", textEN: "Moving in the direction of the gradient", textID: "Bergerak dalam arah gradien"),
            QuestionOption(id: "c", textEN: "Random perturbation", textID: "Perturbasi acak"),
            QuestionOption(id: "d", textEN: "Setting weights to gradient values", textID: "Mengatur bobot ke nilai gradien")
        ],
        correctOptionId: "a",
        explanationEN: "w = w - α∇L. Gradient points to steepest increase; we go opposite to minimize loss.",
        explanationID: "w = w - α∇L. Gradien menunjuk ke peningkatan tercuram; kita pergi berlawanan untuk meminimalkan loss.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf012",
        questionEN: "The learning rate α in gradient descent controls:",
        questionID: "Learning rate α dalam gradient descent mengontrol:",
        options: [
            QuestionOption(id: "a", textEN: "Step size of weight updates", textID: "Ukuran langkah pembaruan bobot"),
            QuestionOption(id: "b", textEN: "Number of layers", textID: "Jumlah layer"),
            QuestionOption(id: "c", textEN: "Batch size", textID: "Ukuran batch"),
            QuestionOption(id: "d", textEN: "Activation function", textID: "Fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Learning rate scales gradient: w = w - α∇L. Too large: diverge. Too small: slow convergence.",
        explanationID: "Learning rate menskalakan gradien: w = w - α∇L. Terlalu besar: divergen. Terlalu kecil: konvergensi lambat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf013",
        questionEN: "Stochastic Gradient Descent (SGD) differs from batch gradient descent by:",
        questionID: "Stochastic Gradient Descent (SGD) berbeda dari batch gradient descent dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Using one or few samples per update instead of entire dataset", textID: "Menggunakan satu atau beberapa sampel per update daripada seluruh dataset"),
            QuestionOption(id: "b", textEN: "Using a different loss function", textID: "Menggunakan fungsi loss berbeda"),
            QuestionOption(id: "c", textEN: "Not using gradients", textID: "Tidak menggunakan gradien"),
            QuestionOption(id: "d", textEN: "Using second-order derivatives", textID: "Menggunakan turunan orde dua")
        ],
        correctOptionId: "a",
        explanationEN: "SGD: update after each sample (noisy but fast). Mini-batch: compromise with small batches (e.g., 32).",
        explanationID: "SGD: update setelah setiap sampel (berisik tapi cepat). Mini-batch: kompromi dengan batch kecil (mis., 32).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf014",
        questionEN: "Mini-batch gradient descent with batch size 32 means:",
        questionID: "Mini-batch gradient descent dengan ukuran batch 32 berarti:",
        options: [
            QuestionOption(id: "a", textEN: "Gradient is averaged over 32 samples per update", textID: "Gradien dirata-ratakan atas 32 sampel per update"),
            QuestionOption(id: "b", textEN: "Only 32 updates total", textID: "Hanya 32 update total"),
            QuestionOption(id: "c", textEN: "32 epochs of training", textID: "32 epoch training"),
            QuestionOption(id: "d", textEN: "32 layers in the network", textID: "32 layer dalam jaringan")
        ],
        correctOptionId: "a",
        explanationEN: "Mini-batch: compute loss/gradient on 32 samples, update weights. Balance between SGD noise and batch stability.",
        explanationID: "Mini-batch: hitung loss/gradien pada 32 sampel, update bobot. Keseimbangan antara noise SGD dan stabilitas batch.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf015",
        questionEN: "Momentum in gradient descent helps by:",
        questionID: "Momentum dalam gradient descent membantu dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Accumulating past gradients to smooth updates and escape local minima", textID: "Mengakumulasi gradien masa lalu untuk memperhalus update dan keluar dari minima lokal"),
            QuestionOption(id: "b", textEN: "Reducing learning rate", textID: "Mengurangi learning rate"),
            QuestionOption(id: "c", textEN: "Increasing batch size", textID: "Meningkatkan ukuran batch"),
            QuestionOption(id: "d", textEN: "Adding regularization", textID: "Menambahkan regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "v = βv + ∇L; w = w - αv. Momentum β (e.g., 0.9) accelerates in consistent direction, dampens oscillations.",
        explanationID: "v = βv + ∇L; w = w - αv. Momentum β (mis., 0.9) mempercepat dalam arah konsisten, meredam osilasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf016",
        questionEN: "Adam optimizer combines:",
        questionID: "Optimizer Adam menggabungkan:",
        options: [
            QuestionOption(id: "a", textEN: "Momentum and adaptive learning rates (RMSprop)", textID: "Momentum dan learning rate adaptif (RMSprop)"),
            QuestionOption(id: "b", textEN: "Only momentum", textID: "Hanya momentum"),
            QuestionOption(id: "c", textEN: "Only learning rate decay", textID: "Hanya peluruhan learning rate"),
            QuestionOption(id: "d", textEN: "Batch normalization and dropout", textID: "Batch normalization dan dropout")
        ],
        correctOptionId: "a",
        explanationEN: "Adam: maintains running average of gradients (momentum) and squared gradients (adaptive lr). Default choice.",
        explanationID: "Adam: mempertahankan rata-rata berjalan dari gradien (momentum) dan gradien kuadrat (lr adaptif). Pilihan default.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf017",
        questionEN: "Learning rate scheduling typically:",
        questionID: "Penjadwalan learning rate biasanya:",
        options: [
            QuestionOption(id: "a", textEN: "Decreases learning rate during training", textID: "Mengurangi learning rate selama training"),
            QuestionOption(id: "b", textEN: "Increases learning rate", textID: "Meningkatkan learning rate"),
            QuestionOption(id: "c", textEN: "Keeps learning rate constant", textID: "Mempertahankan learning rate konstan"),
            QuestionOption(id: "d", textEN: "Randomly changes learning rate", textID: "Mengubah learning rate secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Start with larger lr for fast initial progress, then decrease for fine-tuning. Step, cosine, warmup schedules.",
        explanationID: "Mulai dengan lr lebih besar untuk kemajuan awal cepat, lalu kurangi untuk fine-tuning. Jadwal step, cosine, warmup.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Backpropagation
    Question(
        id: "nnf018",
        questionEN: "Backpropagation computes gradients by:",
        questionID: "Backpropagation menghitung gradien dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Applying chain rule from output layer backward to input", textID: "Menerapkan aturan rantai dari layer output mundur ke input"),
            QuestionOption(id: "b", textEN: "Random sampling of gradients", textID: "Pengambilan sampel acak gradien"),
            QuestionOption(id: "c", textEN: "Forward pass only", textID: "Hanya forward pass"),
            QuestionOption(id: "d", textEN: "Numerical differentiation", textID: "Diferensiasi numerik")
        ],
        correctOptionId: "a",
        explanationEN: "Backprop: ∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w. Chain rule propagates error gradients backward through layers.",
        explanationID: "Backprop: ∂L/∂w = ∂L/∂a × ∂a/∂z × ∂z/∂w. Aturan rantai mempropagasi gradien error mundur melalui layer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf019",
        questionEN: "The forward pass computes:",
        questionID: "Forward pass menghitung:",
        options: [
            QuestionOption(id: "a", textEN: "Activations from input to output, then the loss", textID: "Aktivasi dari input ke output, lalu loss"),
            QuestionOption(id: "b", textEN: "Gradients", textID: "Gradien"),
            QuestionOption(id: "c", textEN: "Weight updates", textID: "Pembaruan bobot"),
            QuestionOption(id: "d", textEN: "Learning rate", textID: "Learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "Forward pass: x → z₁ → a₁ → z₂ → ... → ŷ → L(y, ŷ). Computes predictions and loss.",
        explanationID: "Forward pass: x → z₁ → a₁ → z₂ → ... → ŷ → L(y, ŷ). Menghitung prediksi dan loss.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf020",
        questionEN: "The vanishing gradient problem occurs when:",
        questionID: "Masalah vanishing gradient terjadi ketika:",
        options: [
            QuestionOption(id: "a", textEN: "Gradients become extremely small in early layers during backprop", textID: "Gradien menjadi sangat kecil di layer awal selama backprop"),
            QuestionOption(id: "b", textEN: "Gradients become too large", textID: "Gradien menjadi terlalu besar"),
            QuestionOption(id: "c", textEN: "Learning rate is too high", textID: "Learning rate terlalu tinggi"),
            QuestionOption(id: "d", textEN: "Batch size is too small", textID: "Ukuran batch terlalu kecil")
        ],
        correctOptionId: "a",
        explanationEN: "Sigmoid/tanh derivatives < 1. Multiplied through many layers → near-zero gradients. Early layers don't learn.",
        explanationID: "Turunan Sigmoid/tanh < 1. Dikalikan melalui banyak layer → gradien mendekati nol. Layer awal tidak belajar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf021",
        questionEN: "The exploding gradient problem can be mitigated by:",
        questionID: "Masalah exploding gradient dapat dimitigasi dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Gradient clipping (capping gradient norm)", textID: "Gradient clipping (membatasi norm gradien)"),
            QuestionOption(id: "b", textEN: "Using more layers", textID: "Menggunakan lebih banyak layer"),
            QuestionOption(id: "c", textEN: "Increasing learning rate", textID: "Meningkatkan learning rate"),
            QuestionOption(id: "d", textEN: "Removing activation functions", textID: "Menghapus fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient clipping: if ||∇|| > threshold, scale ∇ = threshold × ∇/||∇||. Prevents NaN, especially in RNNs.",
        explanationID: "Gradient clipping: jika ||∇|| > threshold, skalakan ∇ = threshold × ∇/||∇||. Mencegah NaN, terutama di RNN.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf022",
        questionEN: "Computational graphs are useful in backprop because:",
        questionID: "Graf komputasi berguna dalam backprop karena:",
        options: [
            QuestionOption(id: "a", textEN: "They track operations for automatic gradient computation", textID: "Mereka melacak operasi untuk komputasi gradien otomatis"),
            QuestionOption(id: "b", textEN: "They reduce memory usage", textID: "Mereka mengurangi penggunaan memori"),
            QuestionOption(id: "c", textEN: "They speed up forward pass", textID: "Mereka mempercepat forward pass"),
            QuestionOption(id: "d", textEN: "They are not used in modern frameworks", textID: "Mereka tidak digunakan dalam framework modern")
        ],
        correctOptionId: "a",
        explanationEN: "Computational graph records operations. Autograd traverses backward to compute ∂L/∂w for all parameters.",
        explanationID: "Graf komputasi mencatat operasi. Autograd melintasi mundur untuk menghitung ∂L/∂w untuk semua parameter.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Loss Functions for Neural Networks
    Question(
        id: "nnf023",
        questionEN: "Cross-entropy loss for multi-class classification is:",
        questionID: "Cross-entropy loss untuk klasifikasi multi-class adalah:",
        options: [
            QuestionOption(id: "a", textEN: "-Σyᵢ log(pᵢ) where y is one-hot label", textID: "-Σyᵢ log(pᵢ) dimana y adalah label one-hot"),
            QuestionOption(id: "b", textEN: "Σ(y - p)²", textID: "Σ(y - p)²"),
            QuestionOption(id: "c", textEN: "max(0, 1 - yp)", textID: "max(0, 1 - yp)"),
            QuestionOption(id: "d", textEN: "|y - p|", textID: "|y - p|")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-entropy: H(y,p) = -Σyᵢlog(pᵢ). For one-hot y, simplifies to -log(p_correct). Used with softmax.",
        explanationID: "Cross-entropy: H(y,p) = -Σyᵢlog(pᵢ). Untuk y one-hot, disederhanakan menjadi -log(p_correct). Digunakan dengan softmax.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf024",
        questionEN: "Binary cross-entropy is used when:",
        questionID: "Binary cross-entropy digunakan ketika:",
        options: [
            QuestionOption(id: "a", textEN: "Output is a single probability for binary classification", textID: "Output adalah probabilitas tunggal untuk klasifikasi biner"),
            QuestionOption(id: "b", textEN: "Output is continuous", textID: "Output adalah kontinu"),
            QuestionOption(id: "c", textEN: "There are more than 2 classes", textID: "Ada lebih dari 2 kelas"),
            QuestionOption(id: "d", textEN: "Input is binary", textID: "Input adalah biner")
        ],
        correctOptionId: "a",
        explanationEN: "BCE: -[y·log(p) + (1-y)·log(1-p)]. Single sigmoid output for binary classification.",
        explanationID: "BCE: -[y·log(p) + (1-y)·log(1-p)]. Output sigmoid tunggal untuk klasifikasi biner.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf025",
        questionEN: "MSE loss is typically used for:",
        questionID: "MSE loss biasanya digunakan untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Regression problems with continuous outputs", textID: "Masalah regresi dengan output kontinu"),
            QuestionOption(id: "b", textEN: "Multi-class classification", textID: "Klasifikasi multi-class"),
            QuestionOption(id: "c", textEN: "Binary classification", textID: "Klasifikasi biner"),
            QuestionOption(id: "d", textEN: "Clustering", textID: "Clustering")
        ],
        correctOptionId: "a",
        explanationEN: "MSE = (1/n)Σ(y - ŷ)². Penalizes squared differences. Standard for regression tasks.",
        explanationID: "MSE = (1/n)Σ(y - ŷ)². Menghukum perbedaan kuadrat. Standar untuk tugas regresi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // Multi-Layer Perceptrons (MLPs)
    Question(
        id: "nnf026",
        questionEN: "An MLP with 2 hidden layers of 64 units each, input dim 10, output dim 3 has how many weight matrices?",
        questionID: "MLP dengan 2 hidden layer masing-masing 64 unit, dimensi input 10, dimensi output 3 memiliki berapa matriks bobot?",
        options: [
            QuestionOption(id: "a", textEN: "3 (input→hidden1, hidden1→hidden2, hidden2→output)", textID: "3 (input→hidden1, hidden1→hidden2, hidden2→output)"),
            QuestionOption(id: "b", textEN: "2", textID: "2"),
            QuestionOption(id: "c", textEN: "4", textID: "4"),
            QuestionOption(id: "d", textEN: "5", textID: "5")
        ],
        correctOptionId: "a",
        explanationEN: "Weights between consecutive layers: W₁(10×64), W₂(64×64), W₃(64×3). Plus 3 bias vectors.",
        explanationID: "Bobot antara layer berturutan: W₁(10×64), W₂(64×64), W₃(64×3). Plus 3 vektor bias.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf027",
        questionEN: "The total number of trainable parameters in a dense layer with 100 inputs and 50 outputs is:",
        questionID: "Total jumlah parameter yang dapat dilatih dalam layer dense dengan 100 input dan 50 output adalah:",
        options: [
            QuestionOption(id: "a", textEN: "5050 (100×50 weights + 50 biases)", textID: "5050 (100×50 bobot + 50 bias)"),
            QuestionOption(id: "b", textEN: "5000", textID: "5000"),
            QuestionOption(id: "c", textEN: "150", textID: "150"),
            QuestionOption(id: "d", textEN: "100", textID: "100")
        ],
        correctOptionId: "a",
        explanationEN: "Dense layer: W (100×50 = 5000) + b (50) = 5050 parameters. Each output unit connects to all inputs.",
        explanationID: "Layer dense: W (100×50 = 5000) + b (50) = 5050 parameter. Setiap unit output terhubung ke semua input.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf028",
        questionEN: "Universal approximation theorem states that an MLP can:",
        questionID: "Teorema aproksimasi universal menyatakan bahwa MLP dapat:",
        options: [
            QuestionOption(id: "a", textEN: "Approximate any continuous function given enough hidden units", textID: "Mendekati sembarang fungsi kontinu dengan cukup hidden unit"),
            QuestionOption(id: "b", textEN: "Learn any function with one neuron", textID: "Mempelajari sembarang fungsi dengan satu neuron"),
            QuestionOption(id: "c", textEN: "Only learn linear functions", textID: "Hanya mempelajari fungsi linear"),
            QuestionOption(id: "d", textEN: "Never overfit", textID: "Tidak pernah overfit")
        ],
        correctOptionId: "a",
        explanationEN: "Single hidden layer with enough neurons can approximate any continuous function. Doesn't guarantee learning it.",
        explanationID: "Satu hidden layer dengan cukup neuron dapat mendekati sembarang fungsi kontinu. Tidak menjamin mempelajarinya.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nnf029",
        questionEN: "Why do deep networks often work better than wide shallow ones?",
        questionID: "Mengapa jaringan dalam sering bekerja lebih baik daripada yang dangkal tapi lebar?",
        options: [
            QuestionOption(id: "a", textEN: "They learn hierarchical representations with fewer parameters", textID: "Mereka mempelajari representasi hierarkis dengan parameter lebih sedikit"),
            QuestionOption(id: "b", textEN: "They are always faster", textID: "Mereka selalu lebih cepat"),
            QuestionOption(id: "c", textEN: "They never overfit", textID: "Mereka tidak pernah overfit"),
            QuestionOption(id: "d", textEN: "They don't need activation functions", textID: "Mereka tidak memerlukan fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Depth enables compositional/hierarchical features (edges→shapes→objects). More expressive per parameter.",
        explanationID: "Kedalaman memungkinkan fitur komposisional/hierarkis (tepi→bentuk→objek). Lebih ekspresif per parameter.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nnf030",
        questionEN: "Dropout during training randomly:",
        questionID: "Dropout selama training secara acak:",
        options: [
            QuestionOption(id: "a", textEN: "Sets some neuron outputs to zero", textID: "Mengatur beberapa output neuron ke nol"),
            QuestionOption(id: "b", textEN: "Removes layers", textID: "Menghapus layer"),
            QuestionOption(id: "c", textEN: "Changes learning rate", textID: "Mengubah learning rate"),
            QuestionOption(id: "d", textEN: "Shuffles data", textID: "Mengacak data")
        ],
        correctOptionId: "a",
        explanationEN: "Dropout(p=0.5): randomly zero out 50% of activations. Prevents co-adaptation. Scale by 1/(1-p) at test.",
        explanationID: "Dropout(p=0.5): secara acak menolkan 50% aktivasi. Mencegah ko-adaptasi. Skalakan dengan 1/(1-p) saat tes.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Batch Normalization
    Question(
        id: "nnf031",
        questionEN: "Batch normalization normalizes activations to:",
        questionID: "Batch normalization menormalisasi aktivasi ke:",
        options: [
            QuestionOption(id: "a", textEN: "Zero mean and unit variance per feature, then scales/shifts", textID: "Mean nol dan variansi unit per fitur, lalu menskalakan/menggeser"),
            QuestionOption(id: "b", textEN: "Range [0, 1]", textID: "Rentang [0, 1]"),
            QuestionOption(id: "c", textEN: "Only positive values", textID: "Hanya nilai positif"),
            QuestionOption(id: "d", textEN: "Random values", textID: "Nilai acak")
        ],
        correctOptionId: "a",
        explanationEN: "BN: x̂ = (x - μ)/σ, then y = γx̂ + β. γ, β are learned. Stabilizes training, allows higher learning rates.",
        explanationID: "BN: x̂ = (x - μ)/σ, lalu y = γx̂ + β. γ, β dipelajari. Menstabilkan training, memungkinkan learning rate lebih tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf032",
        questionEN: "During inference, batch normalization uses:",
        questionID: "Selama inference, batch normalization menggunakan:",
        options: [
            QuestionOption(id: "a", textEN: "Running mean/variance computed during training", textID: "Mean/variansi berjalan yang dihitung selama training"),
            QuestionOption(id: "b", textEN: "Current batch statistics", textID: "Statistik batch saat ini"),
            QuestionOption(id: "c", textEN: "Random values", textID: "Nilai acak"),
            QuestionOption(id: "d", textEN: "No normalization", textID: "Tidak ada normalisasi")
        ],
        correctOptionId: "a",
        explanationEN: "At test: use exponential moving average of μ, σ² from training. Ensures deterministic inference.",
        explanationID: "Saat tes: gunakan rata-rata bergerak eksponensial dari μ, σ² dari training. Memastikan inference deterministik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf033",
        questionEN: "Layer normalization differs from batch normalization by:",
        questionID: "Layer normalization berbeda dari batch normalization dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing across features for each sample, not across batch", textID: "Menormalisasi melintasi fitur untuk setiap sampel, bukan melintasi batch"),
            QuestionOption(id: "b", textEN: "Being faster", textID: "Lebih cepat"),
            QuestionOption(id: "c", textEN: "Not having learned parameters", textID: "Tidak memiliki parameter yang dipelajari"),
            QuestionOption(id: "d", textEN: "Only working with CNNs", textID: "Hanya bekerja dengan CNN")
        ],
        correctOptionId: "a",
        explanationEN: "LayerNorm: normalize across features per sample. Works with batch size 1. Default in Transformers.",
        explanationID: "LayerNorm: normalisasi melintasi fitur per sampel. Bekerja dengan ukuran batch 1. Default di Transformer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Weight Initialization
    Question(
        id: "nnf034",
        questionEN: "Xavier/Glorot initialization sets weight variance to:",
        questionID: "Inisialisasi Xavier/Glorot mengatur variansi bobot ke:",
        options: [
            QuestionOption(id: "a", textEN: "2 / (fan_in + fan_out)", textID: "2 / (fan_in + fan_out)"),
            QuestionOption(id: "b", textEN: "1", textID: "1"),
            QuestionOption(id: "c", textEN: "fan_in", textID: "fan_in"),
            QuestionOption(id: "d", textEN: "0", textID: "0")
        ],
        correctOptionId: "a",
        explanationEN: "Xavier: Var(W) = 2/(n_in + n_out). Keeps variance stable for tanh/sigmoid. For ReLU, use He init.",
        explanationID: "Xavier: Var(W) = 2/(n_in + n_out). Menjaga variansi stabil untuk tanh/sigmoid. Untuk ReLU, gunakan He init.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf035",
        questionEN: "He initialization is preferred for ReLU because:",
        questionID: "Inisialisasi He lebih disukai untuk ReLU karena:",
        options: [
            QuestionOption(id: "a", textEN: "It accounts for ReLU zeroing half the activations", textID: "Ia memperhitungkan ReLU yang menolkan setengah aktivasi"),
            QuestionOption(id: "b", textEN: "It's faster to compute", textID: "Lebih cepat dihitung"),
            QuestionOption(id: "c", textEN: "It always converges", textID: "Selalu konvergen"),
            QuestionOption(id: "d", textEN: "It prevents dropout", textID: "Ia mencegah dropout")
        ],
        correctOptionId: "a",
        explanationEN: "He: Var(W) = 2/n_in. Compensates for ReLU killing negative half, maintaining activation variance.",
        explanationID: "He: Var(W) = 2/n_in. Mengkompensasi ReLU yang membunuh setengah negatif, mempertahankan variansi aktivasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf036",
        questionEN: "Why shouldn't all weights be initialized to zero?",
        questionID: "Mengapa semua bobot tidak boleh diinisialisasi ke nol?",
        options: [
            QuestionOption(id: "a", textEN: "All neurons would compute the same gradients (symmetry problem)", textID: "Semua neuron akan menghitung gradien yang sama (masalah simetri)"),
            QuestionOption(id: "b", textEN: "Training would be faster", textID: "Training akan lebih cepat"),
            QuestionOption(id: "c", textEN: "It would prevent overfitting", textID: "Ini akan mencegah overfitting"),
            QuestionOption(id: "d", textEN: "It's computationally expensive", textID: "Ini mahal secara komputasi")
        ],
        correctOptionId: "a",
        explanationEN: "Zero init → all neurons identical → all get same gradients → learn same thing. Need asymmetry (random init).",
        explanationID: "Init nol → semua neuron identik → semua mendapat gradien sama → mempelajari hal sama. Butuh asimetri (init acak).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Regularization
    Question(
        id: "nnf037",
        questionEN: "L2 regularization (weight decay) in neural networks:",
        questionID: "Regularisasi L2 (weight decay) dalam neural network:",
        options: [
            QuestionOption(id: "a", textEN: "Adds λ||w||² to loss, pushing weights toward zero", textID: "Menambahkan λ||w||² ke loss, mendorong bobot mendekati nol"),
            QuestionOption(id: "b", textEN: "Removes neurons", textID: "Menghapus neuron"),
            QuestionOption(id: "c", textEN: "Increases learning rate", textID: "Meningkatkan learning rate"),
            QuestionOption(id: "d", textEN: "Adds layers", textID: "Menambahkan layer")
        ],
        correctOptionId: "a",
        explanationEN: "L2: L_total = L + λΣwᵢ². Gradient: ∂L/∂w + 2λw. Shrinks weights, reducing overfitting.",
        explanationID: "L2: L_total = L + λΣwᵢ². Gradien: ∂L/∂w + 2λw. Menyusutkan bobot, mengurangi overfitting.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf038",
        questionEN: "Early stopping prevents overfitting by:",
        questionID: "Early stopping mencegah overfitting dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Stopping training when validation error starts increasing", textID: "Menghentikan training ketika error validasi mulai meningkat"),
            QuestionOption(id: "b", textEN: "Training for exactly 10 epochs", textID: "Training tepat 10 epoch"),
            QuestionOption(id: "c", textEN: "Using smaller batch sizes", textID: "Menggunakan ukuran batch lebih kecil"),
            QuestionOption(id: "d", textEN: "Removing layers", textID: "Menghapus layer")
        ],
        correctOptionId: "a",
        explanationEN: "Monitor validation loss; stop when it starts rising (overfitting begins). Use best model checkpoint.",
        explanationID: "Monitor loss validasi; berhenti ketika mulai naik (overfitting dimulai). Gunakan checkpoint model terbaik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf039",
        questionEN: "Data augmentation helps neural networks by:",
        questionID: "Augmentasi data membantu neural network dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Artificially increasing training data diversity", textID: "Secara artifisial meningkatkan keragaman data training"),
            QuestionOption(id: "b", textEN: "Reducing training data", textID: "Mengurangi data training"),
            QuestionOption(id: "c", textEN: "Speeding up training", textID: "Mempercepat training"),
            QuestionOption(id: "d", textEN: "Removing outliers", textID: "Menghapus outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Augmentation (flips, crops, rotations) creates varied training examples. Improves generalization.",
        explanationID: "Augmentasi (flip, crop, rotasi) membuat contoh training bervariasi. Meningkatkan generalisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Practical Training
    Question(
        id: "nnf040",
        questionEN: "An epoch in neural network training is:",
        questionID: "Satu epoch dalam training neural network adalah:",
        options: [
            QuestionOption(id: "a", textEN: "One complete pass through the entire training dataset", textID: "Satu lintasan lengkap melalui seluruh dataset training"),
            QuestionOption(id: "b", textEN: "One batch of data", textID: "Satu batch data"),
            QuestionOption(id: "c", textEN: "One weight update", textID: "Satu pembaruan bobot"),
            QuestionOption(id: "d", textEN: "One layer forward pass", textID: "Satu forward pass layer")
        ],
        correctOptionId: "a",
        explanationEN: "1 epoch = see all training samples once. Typical training: multiple epochs until convergence.",
        explanationID: "1 epoch = melihat semua sampel training sekali. Training tipikal: beberapa epoch sampai konvergensi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nnf041",
        questionEN: "If training loss decreases but validation loss increases, this indicates:",
        questionID: "Jika training loss menurun tapi validation loss meningkat, ini menunjukkan:",
        options: [
            QuestionOption(id: "a", textEN: "Overfitting", textID: "Overfitting"),
            QuestionOption(id: "b", textEN: "Underfitting", textID: "Underfitting"),
            QuestionOption(id: "c", textEN: "Good generalization", textID: "Generalisasi baik"),
            QuestionOption(id: "d", textEN: "Data error", textID: "Error data")
        ],
        correctOptionId: "a",
        explanationEN: "Diverging train/val loss = overfitting. Model memorizes training data, fails on new data. Add regularization.",
        explanationID: "Loss train/val yang divergen = overfitting. Model menghafal data training, gagal pada data baru. Tambahkan regularisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf042",
        questionEN: "GPU acceleration benefits neural network training by:",
        questionID: "Akselerasi GPU menguntungkan training neural network dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Parallelizing matrix multiplications across thousands of cores", textID: "Memparalelkan perkalian matriks di ribuan core"),
            QuestionOption(id: "b", textEN: "Using less memory", textID: "Menggunakan memori lebih sedikit"),
            QuestionOption(id: "c", textEN: "Improving accuracy", textID: "Meningkatkan akurasi"),
            QuestionOption(id: "d", textEN: "Reducing dataset size", textID: "Mengurangi ukuran dataset")
        ],
        correctOptionId: "a",
        explanationEN: "GPUs have thousands of cores for parallel computation. Matrix ops (most of DL) are highly parallelizable.",
        explanationID: "GPU memiliki ribuan core untuk komputasi paralel. Operasi matriks (sebagian besar DL) sangat dapat diparalelkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf043",
        questionEN: "Mixed precision training uses:",
        questionID: "Mixed precision training menggunakan:",
        options: [
            QuestionOption(id: "a", textEN: "FP16 for speed with FP32 for critical operations", textID: "FP16 untuk kecepatan dengan FP32 untuk operasi kritis"),
            QuestionOption(id: "b", textEN: "Only integers", textID: "Hanya integer"),
            QuestionOption(id: "c", textEN: "Only FP64", textID: "Hanya FP64"),
            QuestionOption(id: "d", textEN: "Random precision", textID: "Presisi acak")
        ],
        correctOptionId: "a",
        explanationEN: "FP16 (half precision) is faster and uses less memory. Keep master weights in FP32 for stability.",
        explanationID: "FP16 (presisi setengah) lebih cepat dan menggunakan memori lebih sedikit. Simpan bobot master dalam FP32 untuk stabilitas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Hyperparameter Tuning
    Question(
        id: "nnf044",
        questionEN: "Common hyperparameters to tune in neural networks include:",
        questionID: "Hyperparameter umum yang perlu disetel dalam neural network meliputi:",
        options: [
            QuestionOption(id: "a", textEN: "Learning rate, batch size, number of layers, hidden units", textID: "Learning rate, ukuran batch, jumlah layer, hidden unit"),
            QuestionOption(id: "b", textEN: "Only the activation function", textID: "Hanya fungsi aktivasi"),
            QuestionOption(id: "c", textEN: "Only the loss function", textID: "Hanya fungsi loss"),
            QuestionOption(id: "d", textEN: "Only the dataset size", textID: "Hanya ukuran dataset")
        ],
        correctOptionId: "a",
        explanationEN: "Key hyperparameters: learning rate (most important), batch size, architecture depth/width, regularization strength.",
        explanationID: "Hyperparameter kunci: learning rate (paling penting), ukuran batch, kedalaman/lebar arsitektur, kekuatan regularisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf045",
        questionEN: "Grid search for hyperparameter tuning:",
        questionID: "Grid search untuk penyetelan hyperparameter:",
        options: [
            QuestionOption(id: "a", textEN: "Tries all combinations of predefined hyperparameter values", textID: "Mencoba semua kombinasi nilai hyperparameter yang telah ditentukan"),
            QuestionOption(id: "b", textEN: "Uses gradients to find optimal hyperparameters", textID: "Menggunakan gradien untuk menemukan hyperparameter optimal"),
            QuestionOption(id: "c", textEN: "Only tests one hyperparameter", textID: "Hanya menguji satu hyperparameter"),
            QuestionOption(id: "d", textEN: "Randomly samples forever", textID: "Mengambil sampel secara acak selamanya")
        ],
        correctOptionId: "a",
        explanationEN: "Grid search: exhaustive search over specified parameter grid. Exponential cost. Random search often more efficient.",
        explanationID: "Grid search: pencarian menyeluruh atas grid parameter yang ditentukan. Biaya eksponensial. Random search seringkali lebih efisien.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Architecture Design
    Question(
        id: "nnf046",
        questionEN: "Residual connections (skip connections) help by:",
        questionID: "Residual connection (skip connection) membantu dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Allowing gradients to flow directly through, easing training of deep nets", textID: "Memungkinkan gradien mengalir langsung, memudahkan training jaringan dalam"),
            QuestionOption(id: "b", textEN: "Reducing number of parameters", textID: "Mengurangi jumlah parameter"),
            QuestionOption(id: "c", textEN: "Removing the need for activation functions", textID: "Menghapus kebutuhan fungsi aktivasi"),
            QuestionOption(id: "d", textEN: "Making networks shallower", textID: "Membuat jaringan lebih dangkal")
        ],
        correctOptionId: "a",
        explanationEN: "ResNet: y = F(x) + x. Identity shortcut lets gradients bypass layers. Enabled training of 100+ layer nets.",
        explanationID: "ResNet: y = F(x) + x. Shortcut identitas membiarkan gradien melewati layer. Memungkinkan training jaringan 100+ layer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nnf047",
        questionEN: "Bottleneck layers reduce computation by:",
        questionID: "Bottleneck layer mengurangi komputasi dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Reducing dimensionality before expensive operations, then expanding", textID: "Mengurangi dimensi sebelum operasi mahal, lalu memperluas"),
            QuestionOption(id: "b", textEN: "Removing layers", textID: "Menghapus layer"),
            QuestionOption(id: "c", textEN: "Using larger batch sizes", textID: "Menggunakan ukuran batch lebih besar"),
            QuestionOption(id: "d", textEN: "Skipping training", textID: "Melewatkan training")
        ],
        correctOptionId: "a",
        explanationEN: "Bottleneck: 1×1 conv to reduce channels, 3×3 conv, 1×1 conv to expand. Fewer parameters, same expressivity.",
        explanationID: "Bottleneck: conv 1×1 untuk mengurangi channel, conv 3×3, conv 1×1 untuk memperluas. Parameter lebih sedikit, ekspresivitas sama.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nnf048",
        questionEN: "The softmax temperature parameter τ in softmax(z/τ) controls:",
        questionID: "Parameter suhu softmax τ dalam softmax(z/τ) mengontrol:",
        options: [
            QuestionOption(id: "a", textEN: "Sharpness of the distribution (higher τ = more uniform)", textID: "Ketajaman distribusi (τ lebih tinggi = lebih seragam)"),
            QuestionOption(id: "b", textEN: "Number of classes", textID: "Jumlah kelas"),
            QuestionOption(id: "c", textEN: "Learning rate", textID: "Learning rate"),
            QuestionOption(id: "d", textEN: "Batch size", textID: "Ukuran batch")
        ],
        correctOptionId: "a",
        explanationEN: "τ→0: argmax (sharp). τ→∞: uniform. Used in knowledge distillation, sampling diversity.",
        explanationID: "τ→0: argmax (tajam). τ→∞: seragam. Digunakan dalam knowledge distillation, keragaman sampling.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nnf049",
        questionEN: "Label smoothing in classification:",
        questionID: "Label smoothing dalam klasifikasi:",
        options: [
            QuestionOption(id: "a", textEN: "Replaces hard 0/1 labels with soft labels like 0.1/0.9", textID: "Mengganti label keras 0/1 dengan label lunak seperti 0.1/0.9"),
            QuestionOption(id: "b", textEN: "Removes labels", textID: "Menghapus label"),
            QuestionOption(id: "c", textEN: "Adds more classes", textID: "Menambah lebih banyak kelas"),
            QuestionOption(id: "d", textEN: "Binarizes outputs", textID: "Membinerkan output")
        ],
        correctOptionId: "a",
        explanationEN: "Label smoothing: y = (1-ε)·one_hot + ε/K. Prevents overconfidence, improves calibration and generalization.",
        explanationID: "Label smoothing: y = (1-ε)·one_hot + ε/K. Mencegah kepercayaan berlebihan, meningkatkan kalibrasi dan generalisasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nnf050",
        questionEN: "Knowledge distillation trains a student network by:",
        questionID: "Knowledge distillation melatih jaringan student dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Matching the soft outputs of a larger teacher network", textID: "Mencocokkan output lunak dari jaringan teacher yang lebih besar"),
            QuestionOption(id: "b", textEN: "Copying teacher weights directly", textID: "Menyalin bobot teacher secara langsung"),
            QuestionOption(id: "c", textEN: "Using teacher as data augmentation", textID: "Menggunakan teacher sebagai augmentasi data"),
            QuestionOption(id: "d", textEN: "Removing teacher layers", textID: "Menghapus layer teacher")
        ],
        correctOptionId: "a",
        explanationEN: "Distillation: student learns from teacher's soft predictions (rich information in wrong class probs). Transfers knowledge.",
        explanationID: "Distillation: student belajar dari prediksi lunak teacher (informasi kaya dalam prob kelas salah). Mentransfer pengetahuan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
]
