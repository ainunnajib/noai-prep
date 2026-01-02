import Foundation

// MARK: - Regularization & Optimization Questions (50)
// Topics: L1/L2, Dropout, BatchNorm, Optimizers, Learning Rate, Weight Decay
// Aligned with IOAI/NOAI Syllabus

let regularizationOptimizationQuestions: [Question] = [
    // MARK: - Regularization Basics (Questions 1-15)
    Question(
        id: "reg_opt_001",
        questionEN: "What is regularization in machine learning?",
        questionID: "Apa itu regularisasi dalam machine learning?",
        options: [
            QuestionOption(id: "a", textEN: "Techniques to prevent overfitting by adding constraints or penalties to the model", textID: "Teknik untuk mencegah overfitting dengan menambahkan batasan atau penalti pada model"),
            QuestionOption(id: "b", textEN: "Making the model more regular (uniform)", textID: "Membuat model lebih teratur (seragam)"),
            QuestionOption(id: "c", textEN: "Standardizing input features", textID: "Menstandarisasi fitur input"),
            QuestionOption(id: "d", textEN: "Fixing bugs in the model", textID: "Memperbaiki bug dalam model")
        ],
        correctOptionId: "a",
        explanationEN: "Regularization adds constraints/penalties to reduce model complexity, preventing overfitting. It trades slightly higher training error for much better generalization to unseen data.",
        explanationID: "Regularisasi menambahkan batasan/penalti untuk mengurangi kompleksitas model, mencegah overfitting. Ini menukar sedikit error training yang lebih tinggi untuk generalisasi yang jauh lebih baik pada data baru.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_002",
        questionEN: "What is L2 regularization (Ridge)?",
        questionID: "Apa itu regularisasi L2 (Ridge)?",
        options: [
            QuestionOption(id: "a", textEN: "Adding λ||w||₂² = λΣwᵢ² to the loss, penalizing large weights", textID: "Menambahkan λ||w||₂² = λΣwᵢ² ke loss, memberikan penalti pada bobot besar"),
            QuestionOption(id: "b", textEN: "Adding λ||w||₁ to the loss", textID: "Menambahkan λ||w||₁ ke loss"),
            QuestionOption(id: "c", textEN: "Removing 50% of weights", textID: "Menghapus 50% bobot"),
            QuestionOption(id: "d", textEN: "Doubling the learning rate", textID: "Menggandakan learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "L2/Ridge adds λ||w||² = λΣwᵢ² to loss. It shrinks weights toward zero but rarely makes them exactly zero. Mathematically equivalent to Gaussian prior on weights.",
        explanationID: "L2/Ridge menambahkan λ||w||² = λΣwᵢ² ke loss. Ini menyusutkan bobot menuju nol tetapi jarang membuatnya tepat nol. Secara matematis setara dengan prior Gaussian pada bobot.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_003",
        questionEN: "What is L1 regularization (Lasso)?",
        questionID: "Apa itu regularisasi L1 (Lasso)?",
        options: [
            QuestionOption(id: "a", textEN: "Adding λ||w||₁ = λΣ|wᵢ| to the loss, promoting sparsity", textID: "Menambahkan λ||w||₁ = λΣ|wᵢ| ke loss, mendorong sparsity"),
            QuestionOption(id: "b", textEN: "Adding λ||w||₂² to the loss", textID: "Menambahkan λ||w||₂² ke loss"),
            QuestionOption(id: "c", textEN: "Using only layer 1", textID: "Menggunakan hanya layer 1"),
            QuestionOption(id: "d", textEN: "Training for 1 epoch", textID: "Training selama 1 epoch")
        ],
        correctOptionId: "a",
        explanationEN: "L1/Lasso adds λΣ|wᵢ| to loss. It drives some weights exactly to zero, performing feature selection. Useful when you expect many features to be irrelevant.",
        explanationID: "L1/Lasso menambahkan λΣ|wᵢ| ke loss. Ini mendorong beberapa bobot menjadi tepat nol, melakukan seleksi fitur. Berguna ketika banyak fitur diperkirakan tidak relevan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_004",
        questionEN: "Why does L1 regularization produce sparse weights while L2 doesn't?",
        questionID: "Mengapa regularisasi L1 menghasilkan bobot sparse sementara L2 tidak?",
        options: [
            QuestionOption(id: "a", textEN: "L1 gradient is constant regardless of weight magnitude, pushing small weights to exactly zero", textID: "Gradien L1 konstan terlepas dari magnitudo bobot, mendorong bobot kecil ke tepat nol"),
            QuestionOption(id: "b", textEN: "L1 is stronger than L2", textID: "L1 lebih kuat dari L2"),
            QuestionOption(id: "c", textEN: "L2 increases weights", textID: "L2 meningkatkan bobot"),
            QuestionOption(id: "d", textEN: "They both produce sparse weights", textID: "Keduanya menghasilkan bobot sparse")
        ],
        correctOptionId: "a",
        explanationEN: "L1 gradient is ±λ (constant), so small weights receive the same push toward zero as large weights. L2 gradient is 2λw (proportional to w), so small weights get smaller pushes and just shrink, never reaching zero.",
        explanationID: "Gradien L1 adalah ±λ (konstan), jadi bobot kecil menerima dorongan yang sama menuju nol seperti bobot besar. Gradien L2 adalah 2λw (proporsional terhadap w), jadi bobot kecil mendapat dorongan lebih kecil dan hanya menyusut, tidak pernah mencapai nol.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_005",
        questionEN: "What is Elastic Net regularization?",
        questionID: "Apa itu regularisasi Elastic Net?",
        options: [
            QuestionOption(id: "a", textEN: "Combination of L1 and L2: λ₁||w||₁ + λ₂||w||₂²", textID: "Kombinasi L1 dan L2: λ₁||w||₁ + λ₂||w||₂²"),
            QuestionOption(id: "b", textEN: "A type of neural network", textID: "Jenis neural network"),
            QuestionOption(id: "c", textEN: "Regularization for elastic materials", textID: "Regularisasi untuk material elastis"),
            QuestionOption(id: "d", textEN: "Only L1 regularization", textID: "Hanya regularisasi L1")
        ],
        correctOptionId: "a",
        explanationEN: "Elastic Net combines L1 and L2: λ₁||w||₁ + λ₂||w||₂². It provides sparsity (L1) while handling correlated features better than pure L1 (L2 component).",
        explanationID: "Elastic Net menggabungkan L1 dan L2: λ₁||w||₁ + λ₂||w||₂². Ini memberikan sparsity (L1) sambil menangani fitur berkorelasi lebih baik dari L1 murni (komponen L2).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_006",
        questionEN: "What is dropout?",
        questionID: "Apa itu dropout?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly setting neurons to zero during training with probability p", textID: "Secara acak mengatur neuron ke nol selama training dengan probabilitas p"),
            QuestionOption(id: "b", textEN: "Removing layers from the network", textID: "Menghapus layer dari network"),
            QuestionOption(id: "c", textEN: "Dropping out of training early", textID: "Keluar dari training lebih awal"),
            QuestionOption(id: "d", textEN: "Removing outliers from data", textID: "Menghapus outlier dari data")
        ],
        correctOptionId: "a",
        explanationEN: "Dropout randomly zeros out neurons with probability p (e.g., 0.5) during training. Remaining neurons are scaled by 1/(1-p). This prevents co-adaptation and provides regularization.",
        explanationID: "Dropout secara acak menolkan neuron dengan probabilitas p (misal 0.5) selama training. Neuron yang tersisa diskalakan dengan 1/(1-p). Ini mencegah ko-adaptasi dan memberikan regularisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_007",
        questionEN: "Why is dropout disabled during inference?",
        questionID: "Mengapa dropout dinonaktifkan saat inferensi?",
        options: [
            QuestionOption(id: "a", textEN: "We want the full network capacity and consistent outputs for predictions", textID: "Kita ingin kapasitas network penuh dan output konsisten untuk prediksi"),
            QuestionOption(id: "b", textEN: "It's too slow", textID: "Terlalu lambat"),
            QuestionOption(id: "c", textEN: "It increases accuracy", textID: "Meningkatkan akurasi"),
            QuestionOption(id: "d", textEN: "It causes memory issues", textID: "Menyebabkan masalah memori")
        ],
        correctOptionId: "a",
        explanationEN: "During inference, we use all neurons (no dropout) to get the expected output of the trained ensemble. The scaling factor during training ensures outputs have the same expected magnitude.",
        explanationID: "Selama inferensi, kita menggunakan semua neuron (tanpa dropout) untuk mendapatkan output yang diharapkan dari ensemble yang dilatih. Faktor skala selama training memastikan output memiliki magnitudo yang diharapkan sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_008",
        questionEN: "What is weight decay?",
        questionID: "Apa itu weight decay?",
        options: [
            QuestionOption(id: "a", textEN: "Directly reducing weights each step: w = w - α(∇L + λw)", textID: "Mengurangi bobot langsung setiap langkah: w = w - α(∇L + λw)"),
            QuestionOption(id: "b", textEN: "Weights automatically decreasing over time", textID: "Bobot berkurang secara otomatis seiring waktu"),
            QuestionOption(id: "c", textEN: "Removing unused weights", textID: "Menghapus bobot yang tidak digunakan"),
            QuestionOption(id: "d", textEN: "Decay of learning rate", textID: "Penurunan learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "Weight decay subtracts λw from weights each step, equivalent to L2 regularization for vanilla SGD. For Adam, weight decay and L2 differ slightly (AdamW decouples weight decay).",
        explanationID: "Weight decay mengurangi λw dari bobot setiap langkah, setara dengan regularisasi L2 untuk SGD vanilla. Untuk Adam, weight decay dan L2 sedikit berbeda (AdamW memisahkan weight decay).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_009",
        questionEN: "What is data augmentation as regularization?",
        questionID: "Apa itu augmentasi data sebagai regularisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Creating variations of training data to increase effective dataset size and reduce overfitting", textID: "Membuat variasi data training untuk meningkatkan ukuran dataset efektif dan mengurangi overfitting"),
            QuestionOption(id: "b", textEN: "Collecting more data", textID: "Mengumpulkan lebih banyak data"),
            QuestionOption(id: "c", textEN: "Removing data points", textID: "Menghapus titik data"),
            QuestionOption(id: "d", textEN: "Normalizing data", textID: "Menormalisasi data")
        ],
        correctOptionId: "a",
        explanationEN: "Data augmentation (flipping, rotating, cropping images) creates more training examples artificially. This increases data diversity, reduces overfitting without changing the model architecture.",
        explanationID: "Augmentasi data (membalik, memutar, memotong gambar) membuat lebih banyak contoh training secara artifisial. Ini meningkatkan keragaman data, mengurangi overfitting tanpa mengubah arsitektur model.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_010",
        questionEN: "What is early stopping?",
        questionID: "Apa itu early stopping?",
        options: [
            QuestionOption(id: "a", textEN: "Stopping training when validation performance stops improving", textID: "Menghentikan training ketika performa validasi berhenti membaik"),
            QuestionOption(id: "b", textEN: "Stopping training after 1 epoch", textID: "Menghentikan training setelah 1 epoch"),
            QuestionOption(id: "c", textEN: "Stopping training when loss reaches zero", textID: "Menghentikan training ketika loss mencapai nol"),
            QuestionOption(id: "d", textEN: "Stopping training randomly", textID: "Menghentikan training secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Early stopping monitors validation loss/metric and stops when it stops improving for 'patience' epochs. It's implicit regularization - training less prevents overfitting.",
        explanationID: "Early stopping memantau loss/metrik validasi dan berhenti ketika berhenti membaik selama 'patience' epoch. Ini adalah regularisasi implisit - training lebih sedikit mencegah overfitting.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_011",
        questionEN: "What is batch normalization?",
        questionID: "Apa itu batch normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing activations across a batch: (x - μ_batch) / σ_batch, with learnable scale and shift", textID: "Menormalisasi aktivasi sepanjang batch: (x - μ_batch) / σ_batch, dengan skala dan shift yang dapat dipelajari"),
            QuestionOption(id: "b", textEN: "Normalizing the batch size", textID: "Menormalisasi ukuran batch"),
            QuestionOption(id: "c", textEN: "Sorting batches", textID: "Mengurutkan batch"),
            QuestionOption(id: "d", textEN: "Removing batches with outliers", textID: "Menghapus batch dengan outlier")
        ],
        correctOptionId: "a",
        explanationEN: "BatchNorm normalizes layer inputs: x̂ = (x - μ)/σ per feature, then applies learned γ and β. It stabilizes training, allows higher learning rates, and provides some regularization.",
        explanationID: "BatchNorm menormalisasi input layer: x̂ = (x - μ)/σ per fitur, lalu menerapkan γ dan β yang dipelajari. Ini menstabilkan training, memungkinkan learning rate lebih tinggi, dan memberikan regularisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_012",
        questionEN: "Why does batch normalization help training?",
        questionID: "Mengapa batch normalization membantu training?",
        options: [
            QuestionOption(id: "a", textEN: "It reduces internal covariate shift, allowing higher learning rates and faster convergence", textID: "Mengurangi internal covariate shift, memungkinkan learning rate lebih tinggi dan konvergensi lebih cepat"),
            QuestionOption(id: "b", textEN: "It adds more parameters", textID: "Menambahkan lebih banyak parameter"),
            QuestionOption(id: "c", textEN: "It increases model capacity", textID: "Meningkatkan kapasitas model"),
            QuestionOption(id: "d", textEN: "It removes noise from data", textID: "Menghapus noise dari data")
        ],
        correctOptionId: "a",
        explanationEN: "BatchNorm stabilizes the distribution of layer inputs, reducing sensitivity to initialization and allowing higher learning rates. It also has a regularizing effect due to batch-level noise.",
        explanationID: "BatchNorm menstabilkan distribusi input layer, mengurangi sensitivitas terhadap inisialisasi dan memungkinkan learning rate lebih tinggi. Ini juga memiliki efek regularisasi karena noise level batch.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_013",
        questionEN: "What is layer normalization and when is it preferred over batch normalization?",
        questionID: "Apa itu layer normalization dan kapan lebih dipilih daripada batch normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizes across features for each sample; preferred for RNNs/Transformers where batch stats are unreliable", textID: "Menormalisasi sepanjang fitur untuk setiap sampel; dipilih untuk RNN/Transformer dimana statistik batch tidak reliabel"),
            QuestionOption(id: "b", textEN: "Only normalizes the last layer", textID: "Hanya menormalisasi layer terakhir"),
            QuestionOption(id: "c", textEN: "Identical to batch norm", textID: "Identik dengan batch norm"),
            QuestionOption(id: "d", textEN: "Normalizes layer weights", textID: "Menormalisasi bobot layer")
        ],
        correctOptionId: "a",
        explanationEN: "LayerNorm normalizes across features for each sample independently (not across batch). Preferred in RNNs/Transformers where sequence length varies and batch statistics are unstable.",
        explanationID: "LayerNorm menormalisasi sepanjang fitur untuk setiap sampel secara independen (bukan sepanjang batch). Dipilih di RNN/Transformer dimana panjang sekuens bervariasi dan statistik batch tidak stabil.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_014",
        questionEN: "What is label smoothing?",
        questionID: "Apa itu label smoothing?",
        options: [
            QuestionOption(id: "a", textEN: "Replacing hard labels (0, 1) with soft labels (ε, 1-ε) to prevent overconfidence", textID: "Mengganti label keras (0, 1) dengan label lunak (ε, 1-ε) untuk mencegah overconfidence"),
            QuestionOption(id: "b", textEN: "Averaging labels", textID: "Merata-ratakan label"),
            QuestionOption(id: "c", textEN: "Removing noisy labels", textID: "Menghapus label berisik"),
            QuestionOption(id: "d", textEN: "Smoothing the loss curve", textID: "Memuluskan kurva loss")
        ],
        correctOptionId: "a",
        explanationEN: "Label smoothing changes targets from [0, 0, 1, 0] to [0.025, 0.025, 0.925, 0.025] (with ε=0.1). This prevents the model from becoming overconfident and improves generalization.",
        explanationID: "Label smoothing mengubah target dari [0, 0, 1, 0] menjadi [0.025, 0.025, 0.925, 0.025] (dengan ε=0.1). Ini mencegah model menjadi terlalu percaya diri dan meningkatkan generalisasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_015",
        questionEN: "What is the effect of increasing regularization strength (λ)?",
        questionID: "Apa efek meningkatkan kekuatan regularisasi (λ)?",
        options: [
            QuestionOption(id: "a", textEN: "Increases bias (simpler model), decreases variance (less overfitting)", textID: "Meningkatkan bias (model lebih sederhana), mengurangi varians (kurang overfitting)"),
            QuestionOption(id: "b", textEN: "Increases both bias and variance", textID: "Meningkatkan bias dan varians"),
            QuestionOption(id: "c", textEN: "Decreases both bias and variance", textID: "Mengurangi bias dan varians"),
            QuestionOption(id: "d", textEN: "No effect on bias-variance", textID: "Tidak berpengaruh pada bias-varians")
        ],
        correctOptionId: "a",
        explanationEN: "Higher λ penalizes complexity more, shrinking weights and simplifying the model. This increases bias (underfitting risk) but decreases variance (overfitting risk). The optimal λ balances both.",
        explanationID: "λ lebih tinggi memberikan penalti lebih pada kompleksitas, menyusutkan bobot dan menyederhanakan model. Ini meningkatkan bias (risiko underfitting) tetapi mengurangi varians (risiko overfitting). λ optimal menyeimbangkan keduanya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Optimization Algorithms (Questions 16-30)
    Question(
        id: "reg_opt_016",
        questionEN: "What is the vanilla SGD update rule?",
        questionID: "Apa aturan update vanilla SGD?",
        options: [
            QuestionOption(id: "a", textEN: "w = w - α × ∇L(w)", textID: "w = w - α × ∇L(w)"),
            QuestionOption(id: "b", textEN: "w = w + α × ∇L(w)", textID: "w = w + α × ∇L(w)"),
            QuestionOption(id: "c", textEN: "w = w - ∇L(w)", textID: "w = w - ∇L(w)"),
            QuestionOption(id: "d", textEN: "w = α × ∇L(w)", textID: "w = α × ∇L(w)")
        ],
        correctOptionId: "a",
        explanationEN: "SGD updates: w = w - α∇L(w). Subtract gradient (times learning rate) because gradient points uphill, and we want to minimize loss by going downhill.",
        explanationID: "SGD memperbarui: w = w - α∇L(w). Kurangi gradien (dikali learning rate) karena gradien menunjuk ke atas, dan kita ingin meminimalkan loss dengan turun.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_017",
        questionEN: "What is momentum in SGD?",
        questionID: "Apa itu momentum dalam SGD?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulating past gradients to smooth updates: v = βv + ∇L; w = w - αv", textID: "Mengakumulasi gradien masa lalu untuk memperhalus update: v = βv + ∇L; w = w - αv"),
            QuestionOption(id: "b", textEN: "Increasing learning rate over time", textID: "Meningkatkan learning rate seiring waktu"),
            QuestionOption(id: "c", textEN: "Using larger batches", textID: "Menggunakan batch lebih besar"),
            QuestionOption(id: "d", textEN: "Momentum is physical mass", textID: "Momentum adalah massa fisik")
        ],
        correctOptionId: "a",
        explanationEN: "Momentum accumulates gradient history: v = βv + ∇L (β typically 0.9). It smooths noisy gradients, accelerates in consistent directions, and helps escape local minima/saddle points.",
        explanationID: "Momentum mengakumulasi riwayat gradien: v = βv + ∇L (β biasanya 0.9). Ini memperhalus gradien berisik, mempercepat arah konsisten, dan membantu keluar dari minima lokal/saddle point.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_018",
        questionEN: "What is Nesterov momentum?",
        questionID: "Apa itu Nesterov momentum?",
        options: [
            QuestionOption(id: "a", textEN: "Computing gradient at the look-ahead position: v = βv + ∇L(w - αβv); w = w - αv", textID: "Menghitung gradien di posisi look-ahead: v = βv + ∇L(w - αβv); w = w - αv"),
            QuestionOption(id: "b", textEN: "Momentum with larger β", textID: "Momentum dengan β lebih besar"),
            QuestionOption(id: "c", textEN: "Negative momentum", textID: "Momentum negatif"),
            QuestionOption(id: "d", textEN: "Double momentum", textID: "Momentum ganda")
        ],
        correctOptionId: "a",
        explanationEN: "Nesterov momentum computes the gradient after taking a momentum step, not at the current position. This 'look-ahead' provides faster convergence and better final solutions.",
        explanationID: "Nesterov momentum menghitung gradien setelah mengambil langkah momentum, bukan di posisi saat ini. 'Look-ahead' ini memberikan konvergensi lebih cepat dan solusi akhir lebih baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_019",
        questionEN: "What is AdaGrad?",
        questionID: "Apa itu AdaGrad?",
        options: [
            QuestionOption(id: "a", textEN: "Adaptive learning rate that decreases for frequently updated parameters: w = w - α/√(Σg²) × g", textID: "Learning rate adaptif yang menurun untuk parameter yang sering diupdate: w = w - α/√(Σg²) × g"),
            QuestionOption(id: "b", textEN: "Gradient with adaptation", textID: "Gradien dengan adaptasi"),
            QuestionOption(id: "c", textEN: "Automatic gradient computation", textID: "Komputasi gradien otomatis"),
            QuestionOption(id: "d", textEN: "Adding gradients", textID: "Menambahkan gradien")
        ],
        correctOptionId: "a",
        explanationEN: "AdaGrad accumulates squared gradients and divides learning rate by √(sum). Parameters with large gradients get smaller learning rates. Problem: learning rate monotonically decreases, eventually becoming too small.",
        explanationID: "AdaGrad mengakumulasi gradien kuadrat dan membagi learning rate dengan √(sum). Parameter dengan gradien besar mendapat learning rate lebih kecil. Masalah: learning rate menurun monoton, akhirnya menjadi terlalu kecil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_020",
        questionEN: "What is RMSprop?",
        questionID: "Apa itu RMSprop?",
        options: [
            QuestionOption(id: "a", textEN: "Like AdaGrad but uses exponential moving average of squared gradients: v = βv + (1-β)g²", textID: "Seperti AdaGrad tetapi menggunakan rata-rata bergerak eksponensial dari gradien kuadrat: v = βv + (1-β)g²"),
            QuestionOption(id: "b", textEN: "Removing small props", textID: "Menghapus props kecil"),
            QuestionOption(id: "c", textEN: "Root mean square of parameters", textID: "Root mean square dari parameter"),
            QuestionOption(id: "d", textEN: "Random momentum selection", textID: "Pemilihan momentum acak")
        ],
        correctOptionId: "a",
        explanationEN: "RMSprop fixes AdaGrad's decaying learning rate by using an exponential moving average of squared gradients instead of the sum. This keeps the learning rate from shrinking too much.",
        explanationID: "RMSprop memperbaiki learning rate AdaGrad yang menurun dengan menggunakan rata-rata bergerak eksponensial dari gradien kuadrat alih-alih jumlah. Ini menjaga learning rate tidak menyusut terlalu banyak.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_021",
        questionEN: "What is Adam optimizer?",
        questionID: "Apa itu optimizer Adam?",
        options: [
            QuestionOption(id: "a", textEN: "Combines momentum and adaptive learning rates: maintains first (m) and second (v) moment estimates", textID: "Menggabungkan momentum dan learning rate adaptif: mempertahankan estimasi momen pertama (m) dan kedua (v)"),
            QuestionOption(id: "b", textEN: "A person who invented the algorithm", textID: "Orang yang menemukan algoritma"),
            QuestionOption(id: "c", textEN: "Automatic damping", textID: "Damping otomatis"),
            QuestionOption(id: "d", textEN: "Advanced momentum", textID: "Momentum lanjutan")
        ],
        correctOptionId: "a",
        explanationEN: "Adam (Adaptive Moment Estimation) combines momentum (first moment m) and RMSprop (second moment v). m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g². Updates: w -= α × m̂/√v̂ with bias correction.",
        explanationID: "Adam (Adaptive Moment Estimation) menggabungkan momentum (momen pertama m) dan RMSprop (momen kedua v). m = β₁m + (1-β₁)g, v = β₂v + (1-β₂)g². Update: w -= α × m̂/√v̂ dengan koreksi bias.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_022",
        questionEN: "What are typical hyperparameters for Adam?",
        questionID: "Apa hyperparameter umum untuk Adam?",
        options: [
            QuestionOption(id: "a", textEN: "β₁ = 0.9, β₂ = 0.999, ε = 1e-8, learning rate ≈ 1e-3", textID: "β₁ = 0.9, β₂ = 0.999, ε = 1e-8, learning rate ≈ 1e-3"),
            QuestionOption(id: "b", textEN: "β₁ = 0.5, β₂ = 0.5, ε = 1", textID: "β₁ = 0.5, β₂ = 0.5, ε = 1"),
            QuestionOption(id: "c", textEN: "Only learning rate matters", textID: "Hanya learning rate yang penting"),
            QuestionOption(id: "d", textEN: "β₁ = 0.999, β₂ = 0.9", textID: "β₁ = 0.999, β₂ = 0.9")
        ],
        correctOptionId: "a",
        explanationEN: "Default Adam: β₁ = 0.9 (momentum), β₂ = 0.999 (RMSprop), ε = 1e-8 (numerical stability). Learning rate ~1e-3 works well for many tasks. These defaults rarely need changing.",
        explanationID: "Default Adam: β₁ = 0.9 (momentum), β₂ = 0.999 (RMSprop), ε = 1e-8 (stabilitas numerik). Learning rate ~1e-3 bekerja baik untuk banyak tugas. Default ini jarang perlu diubah.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_023",
        questionEN: "What is AdamW?",
        questionID: "Apa itu AdamW?",
        options: [
            QuestionOption(id: "a", textEN: "Adam with decoupled weight decay: applies weight decay directly, not as L2 regularization in gradient", textID: "Adam dengan weight decay terpisah: menerapkan weight decay langsung, bukan sebagai regularisasi L2 dalam gradien"),
            QuestionOption(id: "b", textEN: "Adam for Windows", textID: "Adam untuk Windows"),
            QuestionOption(id: "c", textEN: "Weighted Adam", textID: "Adam berbobot"),
            QuestionOption(id: "d", textEN: "Adam with warmup only", textID: "Adam dengan warmup saja")
        ],
        correctOptionId: "a",
        explanationEN: "AdamW decouples weight decay from the gradient-based update. Instead of adding λw to gradient (which interacts with Adam's scaling), it subtracts λw directly from weights. Often works better than Adam + L2.",
        explanationID: "AdamW memisahkan weight decay dari update berbasis gradien. Alih-alih menambahkan λw ke gradien (yang berinteraksi dengan scaling Adam), ini mengurangi λw langsung dari bobot. Sering bekerja lebih baik dari Adam + L2.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_024",
        questionEN: "What is learning rate warmup?",
        questionID: "Apa itu learning rate warmup?",
        options: [
            QuestionOption(id: "a", textEN: "Gradually increasing learning rate from a small value at the start of training", textID: "Secara bertahap meningkatkan learning rate dari nilai kecil di awal training"),
            QuestionOption(id: "b", textEN: "Warming up the GPU", textID: "Memanaskan GPU"),
            QuestionOption(id: "c", textEN: "Starting with a high learning rate", textID: "Memulai dengan learning rate tinggi"),
            QuestionOption(id: "d", textEN: "Training on warm data", textID: "Training pada data hangat")
        ],
        correctOptionId: "a",
        explanationEN: "Warmup starts with a small learning rate (e.g., 0.01 of target) and linearly increases to the target over several epochs. This helps stabilize early training when gradients are large and noisy.",
        explanationID: "Warmup dimulai dengan learning rate kecil (misal 0.01 dari target) dan meningkat linear ke target selama beberapa epoch. Ini membantu menstabilkan training awal ketika gradien besar dan berisik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_025",
        questionEN: "What is cosine annealing?",
        questionID: "Apa itu cosine annealing?",
        options: [
            QuestionOption(id: "a", textEN: "Decreasing learning rate following a cosine curve: α_t = α_min + ½(α_max - α_min)(1 + cos(πt/T))", textID: "Menurunkan learning rate mengikuti kurva kosinus: α_t = α_min + ½(α_max - α_min)(1 + cos(πt/T))"),
            QuestionOption(id: "b", textEN: "Rotating features", textID: "Memutar fitur"),
            QuestionOption(id: "c", textEN: "Annealing with heat", textID: "Annealing dengan panas"),
            QuestionOption(id: "d", textEN: "Cosine activation function", textID: "Fungsi aktivasi kosinus")
        ],
        correctOptionId: "a",
        explanationEN: "Cosine annealing smoothly decreases learning rate from max to min following a cosine shape. It's gentler than step decay and often achieves better final performance.",
        explanationID: "Cosine annealing menurunkan learning rate dengan mulus dari max ke min mengikuti bentuk kosinus. Lebih lembut dari step decay dan sering mencapai performa akhir lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_026",
        questionEN: "What is step decay for learning rate?",
        questionID: "Apa itu step decay untuk learning rate?",
        options: [
            QuestionOption(id: "a", textEN: "Reducing learning rate by a factor at specified epochs: e.g., α = α₀ × 0.1 every 30 epochs", textID: "Mengurangi learning rate dengan faktor pada epoch tertentu: misal α = α₀ × 0.1 setiap 30 epoch"),
            QuestionOption(id: "b", textEN: "One step per epoch", textID: "Satu langkah per epoch"),
            QuestionOption(id: "c", textEN: "Decaying weight step by step", textID: "Menurunkan bobot langkah demi langkah"),
            QuestionOption(id: "d", textEN: "Reducing batch size", textID: "Mengurangi ukuran batch")
        ],
        correctOptionId: "a",
        explanationEN: "Step decay multiplies learning rate by a factor (e.g., 0.1) at specific epochs (e.g., epochs 30, 60, 90). Simple but effective - allows fine-tuning after initial learning.",
        explanationID: "Step decay mengalikan learning rate dengan faktor (misal 0.1) pada epoch tertentu (misal epoch 30, 60, 90). Sederhana tapi efektif - memungkinkan fine-tuning setelah pembelajaran awal.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_027",
        questionEN: "What is the difference between batch gradient descent and stochastic gradient descent?",
        questionID: "Apa perbedaan antara batch gradient descent dan stochastic gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "Batch uses entire dataset per update; SGD uses one sample; mini-batch uses a subset", textID: "Batch menggunakan seluruh dataset per update; SGD menggunakan satu sampel; mini-batch menggunakan subset"),
            QuestionOption(id: "b", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "c", textEN: "Batch is faster", textID: "Batch lebih cepat"),
            QuestionOption(id: "d", textEN: "SGD uses the entire dataset", textID: "SGD menggunakan seluruh dataset")
        ],
        correctOptionId: "a",
        explanationEN: "Batch GD: gradient over all data, slow but stable. SGD: gradient from one sample, fast but noisy. Mini-batch (typical 32-256): balance of speed and stability, efficient on GPUs.",
        explanationID: "Batch GD: gradien atas semua data, lambat tapi stabil. SGD: gradien dari satu sampel, cepat tapi berisik. Mini-batch (tipikal 32-256): keseimbangan kecepatan dan stabilitas, efisien di GPU.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "reg_opt_028",
        questionEN: "Why is SGD with momentum sometimes preferred over Adam?",
        questionID: "Mengapa SGD dengan momentum terkadang lebih dipilih daripada Adam?",
        options: [
            QuestionOption(id: "a", textEN: "SGD+momentum can generalize better and find flatter minima on some tasks", textID: "SGD+momentum dapat generalisasi lebih baik dan menemukan minima lebih datar pada beberapa tugas"),
            QuestionOption(id: "b", textEN: "Adam is always better", textID: "Adam selalu lebih baik"),
            QuestionOption(id: "c", textEN: "SGD is faster", textID: "SGD lebih cepat"),
            QuestionOption(id: "d", textEN: "Adam doesn't converge", textID: "Adam tidak konvergen")
        ],
        correctOptionId: "a",
        explanationEN: "SGD+momentum often finds 'flatter' minima that generalize better, especially for image classification. Adam converges faster initially but may settle in sharper minima. Task-dependent choice.",
        explanationID: "SGD+momentum sering menemukan minima 'lebih datar' yang generalisasi lebih baik, terutama untuk klasifikasi gambar. Adam konvergen lebih cepat awalnya tapi mungkin menetap di minima lebih tajam. Pilihan tergantung tugas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_029",
        questionEN: "What is gradient accumulation?",
        questionID: "Apa itu gradient accumulation?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulating gradients over multiple mini-batches before updating, simulating larger batch size", textID: "Mengakumulasi gradien atas beberapa mini-batch sebelum update, mensimulasikan batch size lebih besar"),
            QuestionOption(id: "b", textEN: "Adding all gradients together", textID: "Menambahkan semua gradien bersama"),
            QuestionOption(id: "c", textEN: "Storing gradients for later", textID: "Menyimpan gradien untuk nanti"),
            QuestionOption(id: "d", textEN: "Increasing gradient magnitude", textID: "Meningkatkan magnitudo gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient accumulation: sum gradients over K batches before optimizer.step(). Effective batch size = K × batch_size. Useful when GPU memory is limited but larger batches are desired.",
        explanationID: "Gradient accumulation: jumlahkan gradien atas K batch sebelum optimizer.step(). Batch size efektif = K × batch_size. Berguna ketika memori GPU terbatas tapi batch lebih besar diinginkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_030",
        questionEN: "What is the learning rate finder method?",
        questionID: "Apa itu metode learning rate finder?",
        options: [
            QuestionOption(id: "a", textEN: "Exponentially increasing learning rate during a short training run and plotting loss to find optimal range", textID: "Meningkatkan learning rate secara eksponensial selama training singkat dan memplot loss untuk menemukan rentang optimal"),
            QuestionOption(id: "b", textEN: "Trying random learning rates", textID: "Mencoba learning rate acak"),
            QuestionOption(id: "c", textEN: "Using the default learning rate", textID: "Menggunakan learning rate default"),
            QuestionOption(id: "d", textEN: "Letting the model find its own rate", textID: "Membiarkan model menemukan rate-nya sendiri")
        ],
        correctOptionId: "a",
        explanationEN: "LR finder trains with exponentially increasing LR, plotting loss vs LR. Choose LR where loss decreases rapidly (not minimum - that's often too high). Typically one order of magnitude before divergence.",
        explanationID: "LR finder melatih dengan LR meningkat eksponensial, memplot loss vs LR. Pilih LR dimana loss menurun cepat (bukan minimum - itu sering terlalu tinggi). Biasanya satu orde magnitudo sebelum divergen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Advanced Topics (Questions 31-50)
    Question(
        id: "reg_opt_031",
        questionEN: "What is the vanishing gradient problem?",
        questionID: "Apa itu masalah vanishing gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients becoming very small in early layers, preventing them from learning", textID: "Gradien menjadi sangat kecil di layer awal, mencegah mereka belajar"),
            QuestionOption(id: "b", textEN: "Gradients disappearing from memory", textID: "Gradien menghilang dari memori"),
            QuestionOption(id: "c", textEN: "Too few gradients", textID: "Gradien terlalu sedikit"),
            QuestionOption(id: "d", textEN: "Gradients being exactly zero", textID: "Gradien tepat nol")
        ],
        correctOptionId: "a",
        explanationEN: "In deep networks, gradients can shrink exponentially through layers (sigmoid has max gradient 0.25). Early layers barely update. Solutions: ReLU, residual connections, careful initialization, BatchNorm.",
        explanationID: "Dalam network dalam, gradien dapat menyusut eksponensial melalui layer (sigmoid memiliki gradien max 0.25). Layer awal hampir tidak update. Solusi: ReLU, residual connections, inisialisasi hati-hati, BatchNorm.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_032",
        questionEN: "What is the exploding gradient problem?",
        questionID: "Apa itu masalah exploding gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients becoming very large, causing unstable updates or NaN", textID: "Gradien menjadi sangat besar, menyebabkan update tidak stabil atau NaN"),
            QuestionOption(id: "b", textEN: "GPU overheating", textID: "GPU kepanasan"),
            QuestionOption(id: "c", textEN: "Too many gradients", textID: "Gradien terlalu banyak"),
            QuestionOption(id: "d", textEN: "Gradients exploding in size on disk", textID: "Gradien meledak ukurannya di disk")
        ],
        correctOptionId: "a",
        explanationEN: "Gradients can grow exponentially through layers, causing huge updates that destabilize training or produce NaN. Solutions: gradient clipping, careful initialization, smaller learning rate.",
        explanationID: "Gradien dapat tumbuh eksponensial melalui layer, menyebabkan update besar yang mendestabilisasi training atau menghasilkan NaN. Solusi: gradient clipping, inisialisasi hati-hati, learning rate lebih kecil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_033",
        questionEN: "What is gradient clipping?",
        questionID: "Apa itu gradient clipping?",
        options: [
            QuestionOption(id: "a", textEN: "Limiting gradient magnitude: if ||g|| > threshold, g = threshold × g/||g||", textID: "Membatasi magnitudo gradien: jika ||g|| > threshold, g = threshold × g/||g||"),
            QuestionOption(id: "b", textEN: "Cutting off gradients", textID: "Memotong gradien"),
            QuestionOption(id: "c", textEN: "Removing small gradients", textID: "Menghapus gradien kecil"),
            QuestionOption(id: "d", textEN: "Copying gradients", textID: "Menyalin gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient clipping rescales gradients when their norm exceeds a threshold. clip_grad_norm(params, max_norm) in PyTorch. Prevents exploding gradients while preserving direction.",
        explanationID: "Gradient clipping menskalakan ulang gradien ketika norm-nya melebihi threshold. clip_grad_norm(params, max_norm) di PyTorch. Mencegah exploding gradient sambil mempertahankan arah.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_034",
        questionEN: "What is Xavier/Glorot initialization?",
        questionID: "Apa itu inisialisasi Xavier/Glorot?",
        options: [
            QuestionOption(id: "a", textEN: "Initializing weights from N(0, 2/(n_in + n_out)) to maintain activation variance", textID: "Menginisialisasi bobot dari N(0, 2/(n_in + n_out)) untuk mempertahankan varians aktivasi"),
            QuestionOption(id: "b", textEN: "Random initialization", textID: "Inisialisasi acak"),
            QuestionOption(id: "c", textEN: "All zeros initialization", textID: "Inisialisasi semua nol"),
            QuestionOption(id: "d", textEN: "All ones initialization", textID: "Inisialisasi semua satu")
        ],
        correctOptionId: "a",
        explanationEN: "Xavier init: W ~ N(0, 2/(fan_in + fan_out)). Designed for tanh/sigmoid activations to keep variance stable across layers. Prevents vanishing/exploding activations at initialization.",
        explanationID: "Inisialisasi Xavier: W ~ N(0, 2/(fan_in + fan_out)). Dirancang untuk aktivasi tanh/sigmoid untuk menjaga varians stabil sepanjang layer. Mencegah aktivasi vanishing/exploding saat inisialisasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_035",
        questionEN: "What is He/Kaiming initialization?",
        questionID: "Apa itu inisialisasi He/Kaiming?",
        options: [
            QuestionOption(id: "a", textEN: "Initializing weights from N(0, 2/n_in) designed for ReLU activations", textID: "Menginisialisasi bobot dari N(0, 2/n_in) dirancang untuk aktivasi ReLU"),
            QuestionOption(id: "b", textEN: "Half of Xavier", textID: "Setengah dari Xavier"),
            QuestionOption(id: "c", textEN: "Named after He who invented it", textID: "Dinamai dari He yang menemukannya"),
            QuestionOption(id: "d", textEN: "High-energy initialization", textID: "Inisialisasi energi tinggi")
        ],
        correctOptionId: "a",
        explanationEN: "He init: W ~ N(0, 2/fan_in). Designed for ReLU which kills half the variance (negative values). The factor of 2 compensates for this. Default for most modern CNNs.",
        explanationID: "Inisialisasi He: W ~ N(0, 2/fan_in). Dirancang untuk ReLU yang membunuh setengah varians (nilai negatif). Faktor 2 mengkompensasi ini. Default untuk kebanyakan CNN modern.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_036",
        questionEN: "What are residual connections and how do they help optimization?",
        questionID: "Apa itu residual connections dan bagaimana mereka membantu optimisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Skip connections that add input to output: y = F(x) + x, allowing gradient to flow directly", textID: "Skip connections yang menambahkan input ke output: y = F(x) + x, memungkinkan gradien mengalir langsung"),
            QuestionOption(id: "b", textEN: "Connections between residual layers", textID: "Koneksi antara layer residual"),
            QuestionOption(id: "c", textEN: "Leftover connections", textID: "Koneksi sisa"),
            QuestionOption(id: "d", textEN: "Removing connections", textID: "Menghapus koneksi")
        ],
        correctOptionId: "a",
        explanationEN: "Residual connections: y = F(x) + x. The identity path provides a direct gradient highway, solving vanishing gradients. Enables training very deep networks (100+ layers). Key to ResNet success.",
        explanationID: "Residual connections: y = F(x) + x. Jalur identitas menyediakan jalan langsung gradien, menyelesaikan vanishing gradient. Memungkinkan training network sangat dalam (100+ layer). Kunci sukses ResNet.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_037",
        questionEN: "What is mixed precision training?",
        questionID: "Apa itu mixed precision training?",
        options: [
            QuestionOption(id: "a", textEN: "Using float16 for most operations and float32 for numerically sensitive parts", textID: "Menggunakan float16 untuk sebagian besar operasi dan float32 untuk bagian sensitif numerik"),
            QuestionOption(id: "b", textEN: "Training on mixed data types", textID: "Training pada tipe data campuran"),
            QuestionOption(id: "c", textEN: "Mixing different precisions randomly", textID: "Mencampur presisi berbeda secara acak"),
            QuestionOption(id: "d", textEN: "Using integers and floats", textID: "Menggunakan integer dan float")
        ],
        correctOptionId: "a",
        explanationEN: "Mixed precision uses float16 for forward/backward (faster, less memory) and float32 for loss scaling and master weights. Requires dynamic loss scaling to prevent underflow. 2x+ speedup on modern GPUs.",
        explanationID: "Mixed precision menggunakan float16 untuk forward/backward (lebih cepat, lebih sedikit memori) dan float32 untuk loss scaling dan master weight. Memerlukan dynamic loss scaling untuk mencegah underflow. 2x+ speedup di GPU modern.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_038",
        questionEN: "What is stochastic weight averaging (SWA)?",
        questionID: "Apa itu stochastic weight averaging (SWA)?",
        options: [
            QuestionOption(id: "a", textEN: "Averaging weights from multiple points during training for better generalization", textID: "Merata-ratakan bobot dari beberapa titik selama training untuk generalisasi lebih baik"),
            QuestionOption(id: "b", textEN: "Random weight selection", textID: "Pemilihan bobot acak"),
            QuestionOption(id: "c", textEN: "Weighted averaging of samples", textID: "Rata-rata berbobot dari sampel"),
            QuestionOption(id: "d", textEN: "Averaging gradients", textID: "Merata-ratakan gradien")
        ],
        correctOptionId: "a",
        explanationEN: "SWA averages model weights from multiple epochs (typically late training with cyclic LR). The averaged weights often find flatter minima that generalize better than any single checkpoint.",
        explanationID: "SWA merata-ratakan bobot model dari beberapa epoch (biasanya training akhir dengan LR siklik). Bobot rata-rata sering menemukan minima lebih datar yang generalisasi lebih baik dari checkpoint tunggal manapun.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_039",
        questionEN: "What is the lottery ticket hypothesis?",
        questionID: "Apa itu hipotesis tiket lotre?",
        options: [
            QuestionOption(id: "a", textEN: "Dense networks contain sparse subnetworks that can match full network performance when trained alone", textID: "Network padat berisi subnetwork sparse yang dapat menyamai performa network penuh ketika dilatih sendiri"),
            QuestionOption(id: "b", textEN: "Training is like a lottery", textID: "Training seperti lotre"),
            QuestionOption(id: "c", textEN: "Some weights win the training lottery", textID: "Beberapa bobot memenangkan lotre training"),
            QuestionOption(id: "d", textEN: "Random initialization determines success", textID: "Inisialisasi acak menentukan keberhasilan")
        ],
        correctOptionId: "a",
        explanationEN: "The lottery ticket hypothesis (Frankle & Carlin 2019): dense networks contain sparse 'winning ticket' subnetworks that, when initialized properly, can train to full performance. Motivates pruning research.",
        explanationID: "Hipotesis tiket lotre (Frankle & Carlin 2019): network padat berisi subnetwork 'tiket pemenang' sparse yang, ketika diinisialisasi dengan benar, dapat melatih ke performa penuh. Memotivasi penelitian pruning.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_040",
        questionEN: "What is DropConnect?",
        questionID: "Apa itu DropConnect?",
        options: [
            QuestionOption(id: "a", textEN: "Dropping individual weight connections (not entire neurons) during training", textID: "Menjatuhkan koneksi bobot individual (bukan seluruh neuron) selama training"),
            QuestionOption(id: "b", textEN: "Disconnecting dropout", textID: "Memutuskan dropout"),
            QuestionOption(id: "c", textEN: "Connecting dropped neurons", textID: "Menghubungkan neuron yang dijatuhkan"),
            QuestionOption(id: "d", textEN: "Dropout for connections to the network", textID: "Dropout untuk koneksi ke network")
        ],
        correctOptionId: "a",
        explanationEN: "DropConnect randomly zeros individual weights instead of entire neuron outputs. More fine-grained regularization than dropout. Less commonly used but can be effective for some architectures.",
        explanationID: "DropConnect secara acak menolkan bobot individual alih-alih output neuron keseluruhan. Regularisasi lebih halus dari dropout. Kurang umum digunakan tetapi bisa efektif untuk beberapa arsitektur.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_041",
        questionEN: "What is spectral normalization?",
        questionID: "Apa itu spectral normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Constraining the spectral norm (largest singular value) of weight matrices to be 1", textID: "Membatasi spectral norm (nilai singular terbesar) dari matriks bobot menjadi 1"),
            QuestionOption(id: "b", textEN: "Normalizing frequency spectra", textID: "Menormalisasi spektrum frekuensi"),
            QuestionOption(id: "c", textEN: "FFT-based normalization", textID: "Normalisasi berbasis FFT"),
            QuestionOption(id: "d", textEN: "Audio normalization", textID: "Normalisasi audio")
        ],
        correctOptionId: "a",
        explanationEN: "Spectral normalization divides weights by their spectral norm (largest singular value), ensuring each layer is 1-Lipschitz. Originally for GANs but useful for stable training of deep networks.",
        explanationID: "Spectral normalization membagi bobot dengan spectral norm-nya (nilai singular terbesar), memastikan setiap layer adalah 1-Lipschitz. Awalnya untuk GAN tetapi berguna untuk training stabil network dalam.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_042",
        questionEN: "What is one-cycle learning rate policy?",
        questionID: "Apa itu kebijakan learning rate one-cycle?",
        options: [
            QuestionOption(id: "a", textEN: "One cycle of: warmup to max LR, then decay to low LR with momentum doing the opposite", textID: "Satu siklus dari: warmup ke LR max, lalu decay ke LR rendah dengan momentum melakukan sebaliknya"),
            QuestionOption(id: "b", textEN: "Training for one epoch", textID: "Training selama satu epoch"),
            QuestionOption(id: "c", textEN: "Using one learning rate value", textID: "Menggunakan satu nilai learning rate"),
            QuestionOption(id: "d", textEN: "Cycling through one optimizer", textID: "Bersiklus melalui satu optimizer")
        ],
        correctOptionId: "a",
        explanationEN: "One-cycle: warmup from low to high LR (first ~30% of training), then decay to very low. Meanwhile, momentum does the opposite. Often achieves great results in fewer epochs.",
        explanationID: "One-cycle: warmup dari LR rendah ke tinggi (~30% pertama training), lalu decay ke sangat rendah. Sementara itu, momentum melakukan sebaliknya. Sering mencapai hasil bagus dalam epoch lebih sedikit.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_043",
        questionEN: "What is the impact of batch size on training?",
        questionID: "Apa dampak batch size pada training?",
        options: [
            QuestionOption(id: "a", textEN: "Larger batches: more stable gradients, can use higher LR, may generalize worse. Smaller batches: noisier, may generalize better", textID: "Batch lebih besar: gradien lebih stabil, bisa gunakan LR lebih tinggi, mungkin generalisasi lebih buruk. Batch lebih kecil: lebih berisik, mungkin generalisasi lebih baik"),
            QuestionOption(id: "b", textEN: "Batch size doesn't matter", textID: "Batch size tidak penting"),
            QuestionOption(id: "c", textEN: "Larger is always better", textID: "Lebih besar selalu lebih baik"),
            QuestionOption(id: "d", textEN: "Smaller is always better", textID: "Lebih kecil selalu lebih baik")
        ],
        correctOptionId: "a",
        explanationEN: "Large batches give stable gradients but may find sharper minima. Small batches are noisy (implicit regularization) and may find flatter minima. Linear scaling rule: increase LR proportionally with batch size.",
        explanationID: "Batch besar memberikan gradien stabil tetapi mungkin menemukan minima lebih tajam. Batch kecil berisik (regularisasi implisit) dan mungkin menemukan minima lebih datar. Aturan scaling linear: tingkatkan LR proporsional dengan batch size.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_044",
        questionEN: "What is group normalization?",
        questionID: "Apa itu group normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing across groups of channels for each sample, works with small batch sizes", textID: "Menormalisasi sepanjang grup channel untuk setiap sampel, bekerja dengan batch size kecil"),
            QuestionOption(id: "b", textEN: "Normalizing group assignments", textID: "Menormalisasi penugasan grup"),
            QuestionOption(id: "c", textEN: "Grouping normalized layers", textID: "Mengelompokkan layer yang dinormalisasi"),
            QuestionOption(id: "d", textEN: "Normal distribution for groups", textID: "Distribusi normal untuk grup")
        ],
        correctOptionId: "a",
        explanationEN: "GroupNorm divides channels into groups and normalizes within each group per sample. Independent of batch size, so works for small batches (batch size 1) where BatchNorm fails. Used in detection, segmentation.",
        explanationID: "GroupNorm membagi channel menjadi grup dan menormalisasi dalam setiap grup per sampel. Independen dari batch size, jadi bekerja untuk batch kecil (batch size 1) dimana BatchNorm gagal. Digunakan di deteksi, segmentasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_045",
        questionEN: "What is instance normalization?",
        questionID: "Apa itu instance normalization?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing each channel of each sample independently (used in style transfer)", textID: "Menormalisasi setiap channel dari setiap sampel secara independen (digunakan di style transfer)"),
            QuestionOption(id: "b", textEN: "Normalizing one instance only", textID: "Menormalisasi satu instance saja"),
            QuestionOption(id: "c", textEN: "Instance-based learning normalization", textID: "Normalisasi pembelajaran berbasis instance"),
            QuestionOption(id: "d", textEN: "Single sample normalization", textID: "Normalisasi sampel tunggal")
        ],
        correctOptionId: "a",
        explanationEN: "Instance normalization normalizes each channel of each sample independently (across spatial dimensions only). Popular in style transfer - removes instance-specific contrast information.",
        explanationID: "Instance normalization menormalisasi setiap channel dari setiap sampel secara independen (sepanjang dimensi spasial saja). Populer di style transfer - menghapus informasi kontras spesifik instance.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_046",
        questionEN: "What is LAMB optimizer?",
        questionID: "Apa itu optimizer LAMB?",
        options: [
            QuestionOption(id: "a", textEN: "Layer-wise Adaptive Moments for Batch training - Adam with per-layer learning rate scaling", textID: "Layer-wise Adaptive Moments untuk training Batch - Adam dengan scaling learning rate per-layer"),
            QuestionOption(id: "b", textEN: "Lambda optimizer", textID: "Optimizer Lambda"),
            QuestionOption(id: "c", textEN: "Lightweight Adam", textID: "Adam ringan"),
            QuestionOption(id: "d", textEN: "Learning Algorithm for ML Batches", textID: "Algoritma Learning untuk ML Batch")
        ],
        correctOptionId: "a",
        explanationEN: "LAMB adapts learning rate per layer based on the ratio of weight norm to update norm. Enables training with very large batch sizes (e.g., 32K for BERT) without degradation.",
        explanationID: "LAMB mengadaptasi learning rate per layer berdasarkan rasio norm bobot terhadap norm update. Memungkinkan training dengan batch size sangat besar (misal 32K untuk BERT) tanpa degradasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_047",
        questionEN: "What is lookahead optimizer?",
        questionID: "Apa itu optimizer lookahead?",
        options: [
            QuestionOption(id: "a", textEN: "Maintains slow and fast weights; periodically updates slow weights towards fast weights", textID: "Mempertahankan bobot lambat dan cepat; secara periodik memperbarui bobot lambat menuju bobot cepat"),
            QuestionOption(id: "b", textEN: "Looking ahead in the data", textID: "Melihat ke depan di data"),
            QuestionOption(id: "c", textEN: "Predicting future gradients", textID: "Memprediksi gradien masa depan"),
            QuestionOption(id: "d", textEN: "Faster version of Adam", textID: "Versi lebih cepat dari Adam")
        ],
        correctOptionId: "a",
        explanationEN: "Lookahead wraps any optimizer. It maintains 'slow' weights that are periodically updated toward the 'fast' weights (from base optimizer). Improves convergence and reduces variance.",
        explanationID: "Lookahead membungkus optimizer apapun. Ini mempertahankan bobot 'lambat' yang diperbarui secara periodik menuju bobot 'cepat' (dari optimizer dasar). Meningkatkan konvergensi dan mengurangi varians.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_048",
        questionEN: "What is sharpness-aware minimization (SAM)?",
        questionID: "Apa itu sharpness-aware minimization (SAM)?",
        options: [
            QuestionOption(id: "a", textEN: "Optimizer that seeks parameters where neighbors also have low loss (flat minima)", textID: "Optimizer yang mencari parameter dimana tetangga juga memiliki loss rendah (minima datar)"),
            QuestionOption(id: "b", textEN: "Sharpening image quality", textID: "Mempertajam kualitas gambar"),
            QuestionOption(id: "c", textEN: "Sharp gradient updates", textID: "Update gradien tajam"),
            QuestionOption(id: "d", textEN: "Awareness of sharp edges", textID: "Kesadaran tepi tajam")
        ],
        correctOptionId: "a",
        explanationEN: "SAM seeks parameters w where the entire neighborhood has low loss, not just w itself. It adds a perturbation step before the gradient step. Finds flatter minima that generalize better.",
        explanationID: "SAM mencari parameter w dimana seluruh lingkungan memiliki loss rendah, bukan hanya w sendiri. Ini menambahkan langkah perturbasi sebelum langkah gradien. Menemukan minima lebih datar yang generalisasi lebih baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "reg_opt_049",
        questionEN: "What is the dead ReLU problem?",
        questionID: "Apa itu masalah dead ReLU?",
        options: [
            QuestionOption(id: "a", textEN: "ReLU neurons outputting zero for all inputs, never recovering because gradient is also zero", textID: "Neuron ReLU mengoutputkan nol untuk semua input, tidak pernah pulih karena gradien juga nol"),
            QuestionOption(id: "b", textEN: "ReLU being slow", textID: "ReLU lambat"),
            QuestionOption(id: "c", textEN: "ReLU causing memory issues", textID: "ReLU menyebabkan masalah memori"),
            QuestionOption(id: "d", textEN: "ReLU dying after training", textID: "ReLU mati setelah training")
        ],
        correctOptionId: "a",
        explanationEN: "If a ReLU neuron's input is always negative (e.g., large negative bias), output is always 0 and gradient is 0 - it never updates. Solutions: Leaky ReLU, careful initialization, lower learning rate.",
        explanationID: "Jika input neuron ReLU selalu negatif (misal bias negatif besar), output selalu 0 dan gradien 0 - tidak pernah update. Solusi: Leaky ReLU, inisialisasi hati-hati, learning rate lebih rendah.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "reg_opt_050",
        questionEN: "What is the typical order of operations in a neural network layer?",
        questionID: "Apa urutan operasi yang umum dalam layer neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Linear → BatchNorm → Activation (or Linear → Activation → BatchNorm, both used)", textID: "Linear → BatchNorm → Aktivasi (atau Linear → Aktivasi → BatchNorm, keduanya digunakan)"),
            QuestionOption(id: "b", textEN: "Activation → Linear → BatchNorm", textID: "Aktivasi → Linear → BatchNorm"),
            QuestionOption(id: "c", textEN: "BatchNorm → Activation → Linear", textID: "BatchNorm → Aktivasi → Linear"),
            QuestionOption(id: "d", textEN: "Only Linear matters", textID: "Hanya Linear yang penting")
        ],
        correctOptionId: "a",
        explanationEN: "Common orders: Conv → BN → ReLU (original ResNet) or Conv → ReLU → BN. Pre-activation ResNet uses BN → ReLU → Conv. The 'best' order depends on architecture and is debated.",
        explanationID: "Urutan umum: Conv → BN → ReLU (ResNet asli) atau Conv → ReLU → BN. Pre-activation ResNet menggunakan BN → ReLU → Conv. Urutan 'terbaik' tergantung arsitektur dan masih diperdebatkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
