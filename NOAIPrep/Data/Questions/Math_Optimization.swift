import Foundation

// MARK: - Optimization Questions (50 questions)
extension NOAIQuestionBank {
    var optimizationQuestions: [Question] {
        [
            // Batch 1: Questions 1-10
            Question(
                id: "opt001",
                questionEN: "What is the goal of gradient descent?",
                questionID: "Apa tujuan gradient descent?",
                options: [
                    QuestionOption(id: "a", textEN: "Find parameters that minimize a loss function", textID: "Menemukan parameter yang meminimalkan fungsi loss"),
                    QuestionOption(id: "b", textEN: "Maximize the gradient", textID: "Memaksimalkan gradien"),
                    QuestionOption(id: "c", textEN: "Find the largest eigenvalue", textID: "Menemukan eigenvalue terbesar"),
                    QuestionOption(id: "d", textEN: "Compute the Hessian", textID: "Menghitung Hessian")
                ],
                correctOptionId: "a",
                explanationEN: "Gradient descent iteratively updates parameters: θ = θ - α∇L(θ) to find minimum of loss function.",
                explanationID: "Gradient descent secara iteratif memperbarui parameter: θ = θ - α∇L(θ) untuk menemukan minimum fungsi loss.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "opt002",
                questionEN: "What is the update rule for gradient descent?",
                questionID: "Apa aturan update untuk gradient descent?",
                options: [
                    QuestionOption(id: "a", textEN: "θ = θ + α∇L", textID: "θ = θ + α∇L"),
                    QuestionOption(id: "b", textEN: "θ = θ - α∇L", textID: "θ = θ - α∇L"),
                    QuestionOption(id: "c", textEN: "θ = θ × α∇L", textID: "θ = θ × α∇L"),
                    QuestionOption(id: "d", textEN: "θ = θ / α∇L", textID: "θ = θ / α∇L")
                ],
                correctOptionId: "b",
                explanationEN: "θ = θ - α∇L. We subtract the gradient (times learning rate) to move towards minimum.",
                explanationID: "θ = θ - α∇L. Kita mengurangi gradien (kali learning rate) untuk bergerak menuju minimum.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "opt003",
                questionEN: "What happens if learning rate is too high?",
                questionID: "Apa yang terjadi jika learning rate terlalu tinggi?",
                options: [
                    QuestionOption(id: "a", textEN: "Training is very slow", textID: "Training sangat lambat"),
                    QuestionOption(id: "b", textEN: "Optimization may overshoot and diverge", textID: "Optimisasi mungkin melampaui target dan divergen"),
                    QuestionOption(id: "c", textEN: "Model underfits", textID: "Model underfit"),
                    QuestionOption(id: "d", textEN: "Gradient becomes zero", textID: "Gradien menjadi nol")
                ],
                correctOptionId: "b",
                explanationEN: "High learning rate can cause overshooting the minimum, oscillation, or divergence (loss explodes).",
                explanationID: "Learning rate tinggi dapat menyebabkan melampaui minimum, osilasi, atau divergensi (loss meledak).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt004",
                questionEN: "What is Stochastic Gradient Descent (SGD)?",
                questionID: "Apa itu Stochastic Gradient Descent (SGD)?",
                options: [
                    QuestionOption(id: "a", textEN: "Updates using gradient of single/mini-batch samples", textID: "Update menggunakan gradien dari sampel tunggal/mini-batch"),
                    QuestionOption(id: "b", textEN: "Uses random learning rate", textID: "Menggunakan learning rate acak"),
                    QuestionOption(id: "c", textEN: "Only works for convex functions", textID: "Hanya bekerja untuk fungsi konveks"),
                    QuestionOption(id: "d", textEN: "Requires second derivatives", textID: "Membutuhkan turunan kedua")
                ],
                correctOptionId: "a",
                explanationEN: "SGD computes gradient on random subset (mini-batch) rather than full dataset. Faster, adds noise that can help escape local minima.",
                explanationID: "SGD menghitung gradien pada subset acak (mini-batch) daripada seluruh dataset. Lebih cepat, menambahkan noise yang dapat membantu keluar dari local minima.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt005",
                questionEN: "What is the main idea behind momentum in optimization?",
                questionID: "Apa ide utama di balik momentum dalam optimisasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Accumulate past gradients to smooth updates", textID: "Mengakumulasi gradien masa lalu untuk memperhalus update"),
                    QuestionOption(id: "b", textEN: "Increase learning rate over time", textID: "Meningkatkan learning rate seiring waktu"),
                    QuestionOption(id: "c", textEN: "Use second-order derivatives", textID: "Menggunakan turunan orde kedua"),
                    QuestionOption(id: "d", textEN: "Normalize gradients", textID: "Menormalisasi gradien")
                ],
                correctOptionId: "a",
                explanationEN: "Momentum: v = βv - α∇L, θ = θ + v. Accumulates velocity to accelerate through flat regions and dampen oscillations.",
                explanationID: "Momentum: v = βv - α∇L, θ = θ + v. Mengakumulasi kecepatan untuk mempercepat melalui daerah datar dan meredam osilasi.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt006",
                questionEN: "What does Adam optimizer combine?",
                questionID: "Apa yang dikombinasikan optimizer Adam?",
                options: [
                    QuestionOption(id: "a", textEN: "Momentum and adaptive learning rates (RMSprop)", textID: "Momentum dan learning rate adaptif (RMSprop)"),
                    QuestionOption(id: "b", textEN: "SGD and Newton's method", textID: "SGD dan metode Newton"),
                    QuestionOption(id: "c", textEN: "L1 and L2 regularization", textID: "Regularisasi L1 dan L2"),
                    QuestionOption(id: "d", textEN: "Batch and online learning", textID: "Pembelajaran batch dan online")
                ],
                correctOptionId: "a",
                explanationEN: "Adam = Adaptive Moment Estimation. Combines momentum (first moment) with RMSprop (second moment) for per-parameter adaptive learning rates.",
                explanationID: "Adam = Adaptive Moment Estimation. Menggabungkan momentum (momen pertama) dengan RMSprop (momen kedua) untuk learning rate adaptif per-parameter.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt007",
                questionEN: "What is a convex function?",
                questionID: "Apa itu fungsi konveks?",
                options: [
                    QuestionOption(id: "a", textEN: "Any local minimum is also global minimum", textID: "Setiap minimum lokal juga minimum global"),
                    QuestionOption(id: "b", textEN: "Function with multiple local minima", textID: "Fungsi dengan beberapa minimum lokal"),
                    QuestionOption(id: "c", textEN: "Function that always increases", textID: "Fungsi yang selalu meningkat"),
                    QuestionOption(id: "d", textEN: "Non-differentiable function", textID: "Fungsi non-diferensiabel")
                ],
                correctOptionId: "a",
                explanationEN: "Convex function: line segment between any two points lies above the curve. Every local minimum is global.",
                explanationID: "Fungsi konveks: segmen garis antara dua titik berada di atas kurva. Setiap minimum lokal adalah global.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt008",
                questionEN: "What is L2 regularization (Ridge)?",
                questionID: "Apa itu regularisasi L2 (Ridge)?",
                options: [
                    QuestionOption(id: "a", textEN: "Add λ||w||² to loss function", textID: "Menambahkan λ||w||² ke fungsi loss"),
                    QuestionOption(id: "b", textEN: "Add λ||w|| to loss function", textID: "Menambahkan λ||w|| ke fungsi loss"),
                    QuestionOption(id: "c", textEN: "Multiply weights by λ", textID: "Mengalikan bobot dengan λ"),
                    QuestionOption(id: "d", textEN: "Set small weights to zero", textID: "Mengatur bobot kecil ke nol")
                ],
                correctOptionId: "a",
                explanationEN: "L2 regularization adds λΣwᵢ² to loss. Penalizes large weights, encourages small weights, prevents overfitting.",
                explanationID: "Regularisasi L2 menambahkan λΣwᵢ² ke loss. Menghukum bobot besar, mendorong bobot kecil, mencegah overfitting.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt009",
                questionEN: "What is L1 regularization (Lasso)?",
                questionID: "Apa itu regularisasi L1 (Lasso)?",
                options: [
                    QuestionOption(id: "a", textEN: "Add λΣ|wᵢ| to loss, promotes sparsity", textID: "Menambahkan λΣ|wᵢ| ke loss, mempromosikan sparsity"),
                    QuestionOption(id: "b", textEN: "Add λΣwᵢ² to loss", textID: "Menambahkan λΣwᵢ² ke loss"),
                    QuestionOption(id: "c", textEN: "Remove features randomly", textID: "Menghapus fitur secara acak"),
                    QuestionOption(id: "d", textEN: "Scale all weights equally", textID: "Menskalakan semua bobot sama")
                ],
                correctOptionId: "a",
                explanationEN: "L1 adds λΣ|wᵢ| to loss. Can drive weights exactly to zero, performing automatic feature selection.",
                explanationID: "L1 menambahkan λΣ|wᵢ| ke loss. Dapat mendorong bobot tepat ke nol, melakukan seleksi fitur otomatis.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt010",
                questionEN: "What is a saddle point?",
                questionID: "Apa itu titik pelana?",
                options: [
                    QuestionOption(id: "a", textEN: "Point that is minimum in one direction, maximum in another", textID: "Titik yang minimum di satu arah, maksimum di arah lain"),
                    QuestionOption(id: "b", textEN: "Global minimum", textID: "Minimum global"),
                    QuestionOption(id: "c", textEN: "Local maximum", textID: "Maksimum lokal"),
                    QuestionOption(id: "d", textEN: "Inflection point", textID: "Titik belok")
                ],
                correctOptionId: "a",
                explanationEN: "Saddle point: gradient = 0 but it's min in some directions, max in others. Common problem in high-dimensional optimization.",
                explanationID: "Titik pelana: gradien = 0 tapi minimum di beberapa arah, maksimum di arah lain. Masalah umum dalam optimisasi dimensi tinggi.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            // Batch 2: Questions 11-20
            Question(
                id: "opt011",
                questionEN: "What is Newton's method for optimization?",
                questionID: "Apa metode Newton untuk optimisasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Uses second derivatives (Hessian) for faster convergence", textID: "Menggunakan turunan kedua (Hessian) untuk konvergensi lebih cepat"),
                    QuestionOption(id: "b", textEN: "Uses random search", textID: "Menggunakan pencarian acak"),
                    QuestionOption(id: "c", textEN: "Same as gradient descent", textID: "Sama dengan gradient descent"),
                    QuestionOption(id: "d", textEN: "Only works for linear functions", textID: "Hanya bekerja untuk fungsi linear")
                ],
                correctOptionId: "a",
                explanationEN: "Newton's method: θ = θ - H⁻¹∇L. Uses Hessian for quadratic convergence but expensive to compute.",
                explanationID: "Metode Newton: θ = θ - H⁻¹∇L. Menggunakan Hessian untuk konvergensi kuadratik tapi mahal untuk dihitung.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "opt012",
                questionEN: "What is learning rate scheduling?",
                questionID: "Apa itu penjadwalan learning rate?",
                options: [
                    QuestionOption(id: "a", textEN: "Changing learning rate during training", textID: "Mengubah learning rate selama training"),
                    QuestionOption(id: "b", textEN: "Setting fixed learning rate", textID: "Mengatur learning rate tetap"),
                    QuestionOption(id: "c", textEN: "Removing learning rate", textID: "Menghapus learning rate"),
                    QuestionOption(id: "d", textEN: "Doubling learning rate each epoch", textID: "Menggandakan learning rate setiap epoch")
                ],
                correctOptionId: "a",
                explanationEN: "Learning rate scheduling adjusts α during training (e.g., decay, warmup, cosine annealing) for better convergence.",
                explanationID: "Penjadwalan learning rate menyesuaikan α selama training (misalnya decay, warmup, cosine annealing) untuk konvergensi lebih baik.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt013",
                questionEN: "What is batch size in SGD?",
                questionID: "Apa itu batch size dalam SGD?",
                options: [
                    QuestionOption(id: "a", textEN: "Number of samples used to compute one gradient update", textID: "Jumlah sampel yang digunakan untuk menghitung satu update gradien"),
                    QuestionOption(id: "b", textEN: "Total number of training samples", textID: "Total jumlah sampel training"),
                    QuestionOption(id: "c", textEN: "Number of epochs", textID: "Jumlah epoch"),
                    QuestionOption(id: "d", textEN: "Number of layers", textID: "Jumlah layer")
                ],
                correctOptionId: "a",
                explanationEN: "Batch size = number of samples per gradient update. Larger = more stable but slower, smaller = noisy but faster.",
                explanationID: "Batch size = jumlah sampel per update gradien. Lebih besar = lebih stabil tapi lambat, lebih kecil = noisy tapi cepat.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "opt014",
                questionEN: "What is an epoch?",
                questionID: "Apa itu epoch?",
                options: [
                    QuestionOption(id: "a", textEN: "One complete pass through entire training dataset", textID: "Satu pass lengkap melalui seluruh dataset training"),
                    QuestionOption(id: "b", textEN: "One gradient update", textID: "Satu update gradien"),
                    QuestionOption(id: "c", textEN: "One batch of data", textID: "Satu batch data"),
                    QuestionOption(id: "d", textEN: "One training sample", textID: "Satu sampel training")
                ],
                correctOptionId: "a",
                explanationEN: "One epoch = all training samples have been used once. Multiple epochs are typically needed for convergence.",
                explanationID: "Satu epoch = semua sampel training telah digunakan sekali. Beberapa epoch biasanya diperlukan untuk konvergensi.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "opt015",
                questionEN: "What is the difference between local and global minimum?",
                questionID: "Apa perbedaan antara minimum lokal dan global?",
                options: [
                    QuestionOption(id: "a", textEN: "Local is lowest in neighborhood, global is lowest everywhere", textID: "Lokal terendah di sekitar, global terendah di mana saja"),
                    QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
                    QuestionOption(id: "c", textEN: "Local is always higher", textID: "Lokal selalu lebih tinggi"),
                    QuestionOption(id: "d", textEN: "Global is in one dimension only", textID: "Global hanya dalam satu dimensi")
                ],
                correctOptionId: "a",
                explanationEN: "Local minimum: lowest in neighborhood. Global minimum: lowest value overall. Gradient descent may get stuck in local minima.",
                explanationID: "Minimum lokal: terendah di sekitar. Minimum global: nilai terendah secara keseluruhan. Gradient descent mungkin terjebak di minimum lokal.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "opt016",
                questionEN: "What is RMSprop?",
                questionID: "Apa itu RMSprop?",
                options: [
                    QuestionOption(id: "a", textEN: "Divides learning rate by moving average of squared gradients", textID: "Membagi learning rate dengan rata-rata bergerak gradien kuadrat"),
                    QuestionOption(id: "b", textEN: "Multiplies gradients by momentum", textID: "Mengalikan gradien dengan momentum"),
                    QuestionOption(id: "c", textEN: "Uses second derivatives", textID: "Menggunakan turunan kedua"),
                    QuestionOption(id: "d", textEN: "Random gradient sampling", textID: "Sampling gradien acak")
                ],
                correctOptionId: "a",
                explanationEN: "RMSprop: adaptive learning rate using running average of squared gradients. Helps with varying gradient scales.",
                explanationID: "RMSprop: learning rate adaptif menggunakan rata-rata berjalan gradien kuadrat. Membantu dengan skala gradien yang bervariasi.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt017",
                questionEN: "What is early stopping?",
                questionID: "Apa itu early stopping?",
                options: [
                    QuestionOption(id: "a", textEN: "Stop training when validation loss stops improving", textID: "Menghentikan training ketika validation loss berhenti membaik"),
                    QuestionOption(id: "b", textEN: "Train for fewer epochs", textID: "Train untuk epoch lebih sedikit"),
                    QuestionOption(id: "c", textEN: "Reduce learning rate to zero", textID: "Mengurangi learning rate ke nol"),
                    QuestionOption(id: "d", textEN: "Stop after first epoch", textID: "Berhenti setelah epoch pertama")
                ],
                correctOptionId: "a",
                explanationEN: "Early stopping: monitor validation loss, stop when it starts increasing. Prevents overfitting to training data.",
                explanationID: "Early stopping: monitor validation loss, berhenti ketika mulai meningkat. Mencegah overfitting ke data training.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt018",
                questionEN: "What is gradient clipping?",
                questionID: "Apa itu gradient clipping?",
                options: [
                    QuestionOption(id: "a", textEN: "Limiting gradient magnitude to prevent explosion", textID: "Membatasi magnitude gradien untuk mencegah ledakan"),
                    QuestionOption(id: "b", textEN: "Removing small gradients", textID: "Menghapus gradien kecil"),
                    QuestionOption(id: "c", textEN: "Averaging gradients", textID: "Merata-ratakan gradien"),
                    QuestionOption(id: "d", textEN: "Normalizing inputs", textID: "Menormalisasi input")
                ],
                correctOptionId: "a",
                explanationEN: "Gradient clipping caps gradient norm to prevent exploding gradients, especially in RNNs.",
                explanationID: "Gradient clipping membatasi norm gradien untuk mencegah gradien meledak, terutama dalam RNN.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt019",
                questionEN: "What is weight decay?",
                questionID: "Apa itu weight decay?",
                options: [
                    QuestionOption(id: "a", textEN: "Same as L2 regularization in most cases", textID: "Sama dengan regularisasi L2 dalam kebanyakan kasus"),
                    QuestionOption(id: "b", textEN: "Weights decrease automatically over time", textID: "Bobot menurun otomatis seiring waktu"),
                    QuestionOption(id: "c", textEN: "Removing unused weights", textID: "Menghapus bobot yang tidak digunakan"),
                    QuestionOption(id: "d", textEN: "Gradient vanishing", textID: "Gradien menghilang")
                ],
                correctOptionId: "a",
                explanationEN: "Weight decay: θ = θ(1-λα) - α∇L. Equivalent to L2 regularization for SGD, slightly different for Adam.",
                explanationID: "Weight decay: θ = θ(1-λα) - α∇L. Ekuivalen dengan regularisasi L2 untuk SGD, sedikit berbeda untuk Adam.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "opt020",
                questionEN: "What is the vanishing gradient problem in optimization?",
                questionID: "Apa masalah vanishing gradient dalam optimisasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Gradients become very small, slowing learning", textID: "Gradien menjadi sangat kecil, memperlambat pembelajaran"),
                    QuestionOption(id: "b", textEN: "Gradients become too large", textID: "Gradien menjadi terlalu besar"),
                    QuestionOption(id: "c", textEN: "Gradients become negative", textID: "Gradien menjadi negatif"),
                    QuestionOption(id: "d", textEN: "Gradients oscillate", textID: "Gradien berosilasi")
                ],
                correctOptionId: "a",
                explanationEN: "Vanishing gradient: gradients shrink exponentially through layers, making early layers learn very slowly.",
                explanationID: "Vanishing gradient: gradien menyusut secara eksponensial melalui layer, membuat layer awal belajar sangat lambat.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
        ]
    }
}
