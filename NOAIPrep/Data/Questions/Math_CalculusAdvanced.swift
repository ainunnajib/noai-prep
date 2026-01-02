import Foundation

// MARK: - Advanced Calculus for Machine Learning Questions (50)
// Topics: Gradients, Chain Rule, Optimization, Jacobians, Hessians, Backpropagation
// Aligned with IOAI/NOAI Syllabus

let calculusAdvancedQuestions: [Question] = [
    // MARK: - Activation Function Derivatives (Questions 1-10)
    Question(
        id: "calc_adv_001",
        questionEN: "What is the derivative of the sigmoid function σ(x) = 1/(1+e⁻ˣ)?",
        questionID: "Apa turunan dari fungsi sigmoid σ(x) = 1/(1+e⁻ˣ)?",
        options: [
            QuestionOption(id: "a", textEN: "σ'(x) = σ(x)(1 - σ(x))", textID: "σ'(x) = σ(x)(1 - σ(x))"),
            QuestionOption(id: "b", textEN: "σ'(x) = σ(x)²", textID: "σ'(x) = σ(x)²"),
            QuestionOption(id: "c", textEN: "σ'(x) = 1 - σ(x)", textID: "σ'(x) = 1 - σ(x)"),
            QuestionOption(id: "d", textEN: "σ'(x) = e⁻ˣ", textID: "σ'(x) = e⁻ˣ")
        ],
        correctOptionId: "a",
        explanationEN: "The sigmoid derivative is σ(x)(1-σ(x)), which can be expressed purely in terms of σ(x) itself. This elegant property simplifies backpropagation computations.",
        explanationID: "Turunan sigmoid adalah σ(x)(1-σ(x)), yang dapat diekspresikan murni dalam bentuk σ(x) itu sendiri. Properti elegan ini menyederhanakan komputasi backpropagation.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_002",
        questionEN: "What is the derivative of tanh(x)?",
        questionID: "Apa turunan dari tanh(x)?",
        options: [
            QuestionOption(id: "a", textEN: "1 - tanh²(x) = sech²(x)", textID: "1 - tanh²(x) = sech²(x)"),
            QuestionOption(id: "b", textEN: "tanh(x)", textID: "tanh(x)"),
            QuestionOption(id: "c", textEN: "tanh²(x)", textID: "tanh²(x)"),
            QuestionOption(id: "d", textEN: "1 + tanh²(x)", textID: "1 + tanh²(x)")
        ],
        correctOptionId: "a",
        explanationEN: "d/dx(tanh(x)) = 1 - tanh²(x) = sech²(x). This ranges from 0 to 1, with maximum at x=0. Important for backpropagation through tanh activations.",
        explanationID: "d/dx(tanh(x)) = 1 - tanh²(x) = sech²(x). Ini berkisar dari 0 hingga 1, dengan maksimum di x=0. Penting untuk backpropagation melalui aktivasi tanh.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_003",
        questionEN: "What is the derivative of ReLU(x) = max(0, x)?",
        questionID: "Apa turunan dari ReLU(x) = max(0, x)?",
        options: [
            QuestionOption(id: "a", textEN: "1 if x > 0, 0 if x < 0, undefined at x = 0", textID: "1 jika x > 0, 0 jika x < 0, tidak terdefinisi di x = 0"),
            QuestionOption(id: "b", textEN: "Always 1", textID: "Selalu 1"),
            QuestionOption(id: "c", textEN: "Always 0", textID: "Selalu 0"),
            QuestionOption(id: "d", textEN: "x", textID: "x")
        ],
        correctOptionId: "a",
        explanationEN: "ReLU derivative is 1 for x > 0 and 0 for x < 0. At x = 0, it's technically undefined but typically set to 0 or 1 in practice. This sparse gradient helps train deep networks.",
        explanationID: "Turunan ReLU adalah 1 untuk x > 0 dan 0 untuk x < 0. Pada x = 0, secara teknis tidak terdefinisi tetapi biasanya diatur ke 0 atau 1 dalam praktik. Gradien sparse ini membantu melatih jaringan dalam.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_004",
        questionEN: "What is the derivative of Leaky ReLU(x) = max(αx, x) where α < 1?",
        questionID: "Apa turunan dari Leaky ReLU(x) = max(αx, x) di mana α < 1?",
        options: [
            QuestionOption(id: "a", textEN: "1 if x > 0, α if x ≤ 0", textID: "1 jika x > 0, α jika x ≤ 0"),
            QuestionOption(id: "b", textEN: "1 if x > 0, 0 if x ≤ 0", textID: "1 jika x > 0, 0 jika x ≤ 0"),
            QuestionOption(id: "c", textEN: "α for all x", textID: "α untuk semua x"),
            QuestionOption(id: "d", textEN: "1 for all x", textID: "1 untuk semua x")
        ],
        correctOptionId: "a",
        explanationEN: "Leaky ReLU has derivative 1 for x > 0 and α (typically 0.01) for x ≤ 0. Unlike ReLU, it allows gradients to flow for negative inputs, avoiding dead neurons.",
        explanationID: "Leaky ReLU memiliki turunan 1 untuk x > 0 dan α (biasanya 0.01) untuk x ≤ 0. Tidak seperti ReLU, ini memungkinkan gradien mengalir untuk input negatif, menghindari neuron mati.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_005",
        questionEN: "What is the maximum value of the sigmoid derivative σ'(x)?",
        questionID: "Berapa nilai maksimum dari turunan sigmoid σ'(x)?",
        options: [
            QuestionOption(id: "a", textEN: "0.25 (at x = 0)", textID: "0.25 (pada x = 0)"),
            QuestionOption(id: "b", textEN: "1.0 (at x = 0)", textID: "1.0 (pada x = 0)"),
            QuestionOption(id: "c", textEN: "0.5 (at x = 0)", textID: "0.5 (pada x = 0)"),
            QuestionOption(id: "d", textEN: "0 (at x = 0)", textID: "0 (pada x = 0)")
        ],
        correctOptionId: "a",
        explanationEN: "σ'(x) = σ(x)(1-σ(x)) is maximized when σ(x) = 0.5, which occurs at x = 0. σ'(0) = 0.5 × 0.5 = 0.25. This small maximum contributes to vanishing gradients.",
        explanationID: "σ'(x) = σ(x)(1-σ(x)) dimaksimalkan ketika σ(x) = 0.5, yang terjadi pada x = 0. σ'(0) = 0.5 × 0.5 = 0.25. Maksimum kecil ini berkontribusi pada vanishing gradients.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_006",
        questionEN: "Why does sigmoid cause vanishing gradients in deep networks?",
        questionID: "Mengapa sigmoid menyebabkan vanishing gradients di jaringan dalam?",
        options: [
            QuestionOption(id: "a", textEN: "Its derivative is always ≤ 0.25, so gradients shrink exponentially through layers", textID: "Turunannya selalu ≤ 0.25, sehingga gradien menyusut secara eksponensial melalui layer"),
            QuestionOption(id: "b", textEN: "Its derivative is always > 1", textID: "Turunannya selalu > 1"),
            QuestionOption(id: "c", textEN: "It has no derivative", textID: "Tidak memiliki turunan"),
            QuestionOption(id: "d", textEN: "Its output is always 0", textID: "Outputnya selalu 0")
        ],
        correctOptionId: "a",
        explanationEN: "Since σ'(x) ≤ 0.25 everywhere, multiplying gradients through many sigmoid layers causes exponential decay: 0.25ⁿ → 0 as n increases. This is why ReLU became popular.",
        explanationID: "Karena σ'(x) ≤ 0.25 di mana-mana, mengalikan gradien melalui banyak layer sigmoid menyebabkan peluruhan eksponensial: 0.25ⁿ → 0 saat n meningkat. Inilah mengapa ReLU menjadi populer.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_007",
        questionEN: "What is the derivative of softplus(x) = ln(1 + eˣ)?",
        questionID: "Apa turunan dari softplus(x) = ln(1 + eˣ)?",
        options: [
            QuestionOption(id: "a", textEN: "σ(x) = 1/(1 + e⁻ˣ) (the sigmoid function)", textID: "σ(x) = 1/(1 + e⁻ˣ) (fungsi sigmoid)"),
            QuestionOption(id: "b", textEN: "eˣ/(1 + eˣ)²", textID: "eˣ/(1 + eˣ)²"),
            QuestionOption(id: "c", textEN: "1/(1 + eˣ)", textID: "1/(1 + eˣ)"),
            QuestionOption(id: "d", textEN: "eˣ", textID: "eˣ")
        ],
        correctOptionId: "a",
        explanationEN: "d/dx(ln(1 + eˣ)) = eˣ/(1 + eˣ) = 1/(1 + e⁻ˣ) = σ(x). Softplus is a smooth approximation to ReLU, and its derivative is the sigmoid function.",
        explanationID: "d/dx(ln(1 + eˣ)) = eˣ/(1 + eˣ) = 1/(1 + e⁻ˣ) = σ(x). Softplus adalah aproksimasi halus dari ReLU, dan turunannya adalah fungsi sigmoid.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_008",
        questionEN: "What is the derivative of GELU(x) = x × Φ(x), approximately?",
        questionID: "Apa turunan dari GELU(x) = x × Φ(x), secara aproksimasi?",
        options: [
            QuestionOption(id: "a", textEN: "Φ(x) + x × φ(x), where Φ is CDF and φ is PDF of standard normal", textID: "Φ(x) + x × φ(x), di mana Φ adalah CDF dan φ adalah PDF dari normal standar"),
            QuestionOption(id: "b", textEN: "Just Φ(x)", textID: "Hanya Φ(x)"),
            QuestionOption(id: "c", textEN: "Just x × φ(x)", textID: "Hanya x × φ(x)"),
            QuestionOption(id: "d", textEN: "1", textID: "1")
        ],
        correctOptionId: "a",
        explanationEN: "By product rule: d/dx(xΦ(x)) = Φ(x) + xφ(x), where Φ is the standard normal CDF and φ is the PDF. GELU is used in BERT and GPT models.",
        explanationID: "Dengan aturan perkalian: d/dx(xΦ(x)) = Φ(x) + xφ(x), di mana Φ adalah CDF normal standar dan φ adalah PDF. GELU digunakan dalam model BERT dan GPT.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_009",
        questionEN: "What is the derivative of the softmax function ∂sᵢ/∂zⱼ?",
        questionID: "Apa turunan dari fungsi softmax ∂sᵢ/∂zⱼ?",
        options: [
            QuestionOption(id: "a", textEN: "sᵢ(δᵢⱼ - sⱼ), where δᵢⱼ is Kronecker delta", textID: "sᵢ(δᵢⱼ - sⱼ), di mana δᵢⱼ adalah delta Kronecker"),
            QuestionOption(id: "b", textEN: "sᵢ × sⱼ always", textID: "sᵢ × sⱼ selalu"),
            QuestionOption(id: "c", textEN: "sᵢ - sⱼ", textID: "sᵢ - sⱼ"),
            QuestionOption(id: "d", textEN: "1/n where n is number of classes", textID: "1/n di mana n adalah jumlah kelas")
        ],
        correctOptionId: "a",
        explanationEN: "Softmax derivative: ∂sᵢ/∂zⱼ = sᵢ(1 - sⱼ) if i = j, and -sᵢsⱼ if i ≠ j. This can be written compactly as sᵢ(δᵢⱼ - sⱼ) using Kronecker delta.",
        explanationID: "Turunan softmax: ∂sᵢ/∂zⱼ = sᵢ(1 - sⱼ) jika i = j, dan -sᵢsⱼ jika i ≠ j. Ini dapat ditulis secara ringkas sebagai sᵢ(δᵢⱼ - sⱼ) menggunakan delta Kronecker.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_010",
        questionEN: "What is the combined gradient of softmax cross-entropy loss with respect to logits?",
        questionID: "Apa gradien gabungan dari softmax cross-entropy loss terhadap logits?",
        options: [
            QuestionOption(id: "a", textEN: "pᵢ - yᵢ (predicted probability minus true label)", textID: "pᵢ - yᵢ (probabilitas prediksi dikurangi label sebenarnya)"),
            QuestionOption(id: "b", textEN: "yᵢ/pᵢ", textID: "yᵢ/pᵢ"),
            QuestionOption(id: "c", textEN: "-log(pᵢ)", textID: "-log(pᵢ)"),
            QuestionOption(id: "d", textEN: "yᵢ × pᵢ", textID: "yᵢ × pᵢ")
        ],
        correctOptionId: "a",
        explanationEN: "The gradient of cross-entropy with softmax simplifies elegantly to (predicted - target): ∂L/∂zᵢ = pᵢ - yᵢ. This cancellation makes softmax cross-entropy efficient to compute.",
        explanationID: "Gradien cross-entropy dengan softmax menyederhanakan secara elegan menjadi (prediksi - target): ∂L/∂zᵢ = pᵢ - yᵢ. Pembatalan ini membuat softmax cross-entropy efisien untuk dihitung.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    // MARK: - Chain Rule & Backpropagation (Questions 11-20)
    Question(
        id: "calc_adv_011",
        questionEN: "Using chain rule, if y = f(u) and u = g(x), what is dy/dx?",
        questionID: "Menggunakan aturan rantai, jika y = f(u) dan u = g(x), apa dy/dx?",
        options: [
            QuestionOption(id: "a", textEN: "dy/dx = (dy/du)(du/dx)", textID: "dy/dx = (dy/du)(du/dx)"),
            QuestionOption(id: "b", textEN: "dy/dx = dy/du + du/dx", textID: "dy/dx = dy/du + du/dx"),
            QuestionOption(id: "c", textEN: "dy/dx = dy/du - du/dx", textID: "dy/dx = dy/du - du/dx"),
            QuestionOption(id: "d", textEN: "dy/dx = (dy/du)/(du/dx)", textID: "dy/dx = (dy/du)/(du/dx)")
        ],
        correctOptionId: "a",
        explanationEN: "The chain rule in Leibniz notation: dy/dx = (dy/du)(du/dx). Gradients multiply along the chain of composed functions, forming the basis of backpropagation.",
        explanationID: "Aturan rantai dalam notasi Leibniz: dy/dx = (dy/du)(du/dx). Gradien dikalikan sepanjang rantai fungsi komposit, membentuk dasar backpropagation.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_012",
        questionEN: "In a neural network with layers y = f(g(h(x))), how is ∂y/∂x computed?",
        questionID: "Dalam jaringan saraf dengan layer y = f(g(h(x))), bagaimana ∂y/∂x dihitung?",
        options: [
            QuestionOption(id: "a", textEN: "∂y/∂x = (∂f/∂g)(∂g/∂h)(∂h/∂x) - multiply local gradients", textID: "∂y/∂x = (∂f/∂g)(∂g/∂h)(∂h/∂x) - kalikan gradien lokal"),
            QuestionOption(id: "b", textEN: "∂y/∂x = ∂f/∂g + ∂g/∂h + ∂h/∂x", textID: "∂y/∂x = ∂f/∂g + ∂g/∂h + ∂h/∂x"),
            QuestionOption(id: "c", textEN: "∂y/∂x = ∂f/∂x directly", textID: "∂y/∂x = ∂f/∂x secara langsung"),
            QuestionOption(id: "d", textEN: "∂y/∂x = (∂f/∂g)/(∂g/∂h)", textID: "∂y/∂x = (∂f/∂g)/(∂g/∂h)")
        ],
        correctOptionId: "a",
        explanationEN: "Backpropagation applies the chain rule: multiply local gradients from output to input. Each layer computes its local gradient and passes the product backward.",
        explanationID: "Backpropagation menerapkan aturan rantai: kalikan gradien lokal dari output ke input. Setiap layer menghitung gradien lokalnya dan meneruskan produk ke belakang.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_013",
        questionEN: "What is the gradient of MSE loss L = (1/n)Σ(yᵢ - ŷᵢ)² with respect to ŷ?",
        questionID: "Apa gradien dari MSE loss L = (1/n)Σ(yᵢ - ŷᵢ)² terhadap ŷ?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂ŷᵢ = (2/n)(ŷᵢ - yᵢ)", textID: "∂L/∂ŷᵢ = (2/n)(ŷᵢ - yᵢ)"),
            QuestionOption(id: "b", textEN: "∂L/∂ŷᵢ = (yᵢ - ŷᵢ)", textID: "∂L/∂ŷᵢ = (yᵢ - ŷᵢ)"),
            QuestionOption(id: "c", textEN: "∂L/∂ŷᵢ = 2(yᵢ - ŷᵢ)²", textID: "∂L/∂ŷᵢ = 2(yᵢ - ŷᵢ)²"),
            QuestionOption(id: "d", textEN: "∂L/∂ŷᵢ = 1/n", textID: "∂L/∂ŷᵢ = 1/n")
        ],
        correctOptionId: "a",
        explanationEN: "For MSE, ∂L/∂ŷᵢ = (2/n)(ŷᵢ - yᵢ). The gradient points in the direction of the prediction error, pushing predictions toward true values during training.",
        explanationID: "Untuk MSE, ∂L/∂ŷᵢ = (2/n)(ŷᵢ - yᵢ). Gradien menunjuk ke arah error prediksi, mendorong prediksi menuju nilai sebenarnya selama pelatihan.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_014",
        questionEN: "What is the gradient of cross-entropy loss L = -Σyᵢlog(pᵢ) with respect to pᵢ?",
        questionID: "Apa gradien dari cross-entropy loss L = -Σyᵢlog(pᵢ) terhadap pᵢ?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂pᵢ = -yᵢ/pᵢ", textID: "∂L/∂pᵢ = -yᵢ/pᵢ"),
            QuestionOption(id: "b", textEN: "∂L/∂pᵢ = yᵢ × pᵢ", textID: "∂L/∂pᵢ = yᵢ × pᵢ"),
            QuestionOption(id: "c", textEN: "∂L/∂pᵢ = -log(yᵢ)", textID: "∂L/∂pᵢ = -log(yᵢ)"),
            QuestionOption(id: "d", textEN: "∂L/∂pᵢ = pᵢ - yᵢ", textID: "∂L/∂pᵢ = pᵢ - yᵢ")
        ],
        correctOptionId: "a",
        explanationEN: "The gradient of cross-entropy with respect to predictions is -yᵢ/pᵢ. For the true class (yᵢ=1), this pushes pᵢ higher. Combined with softmax, this simplifies to pᵢ - yᵢ.",
        explanationID: "Gradien cross-entropy terhadap prediksi adalah -yᵢ/pᵢ. Untuk kelas sebenarnya (yᵢ=1), ini mendorong pᵢ lebih tinggi. Digabungkan dengan softmax, ini menyederhanakan menjadi pᵢ - yᵢ.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_015",
        questionEN: "In backprop, what does the upstream gradient represent?",
        questionID: "Dalam backprop, apa yang direpresentasikan gradien upstream?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂output - how the loss changes with respect to this layer's output", textID: "∂L/∂output - bagaimana loss berubah terhadap output layer ini"),
            QuestionOption(id: "b", textEN: "The learning rate", textID: "Learning rate"),
            QuestionOption(id: "c", textEN: "The weight initialization", textID: "Inisialisasi bobot"),
            QuestionOption(id: "d", textEN: "The batch size", textID: "Ukuran batch")
        ],
        correctOptionId: "a",
        explanationEN: "The upstream gradient ∂L/∂output tells us how much the loss would change if we changed this layer's output. We multiply it by the local gradient to get ∂L/∂input.",
        explanationID: "Gradien upstream ∂L/∂output memberi tahu kita seberapa banyak loss akan berubah jika kita mengubah output layer ini. Kita mengalikannya dengan gradien lokal untuk mendapatkan ∂L/∂input.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_016",
        questionEN: "For a layer y = Wx + b, what is ∂L/∂W?",
        questionID: "Untuk layer y = Wx + b, apa ∂L/∂W?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂W = (∂L/∂y)xᵀ - outer product of upstream gradient and input", textID: "∂L/∂W = (∂L/∂y)xᵀ - outer product dari gradien upstream dan input"),
            QuestionOption(id: "b", textEN: "∂L/∂W = ∂L/∂y × W", textID: "∂L/∂W = ∂L/∂y × W"),
            QuestionOption(id: "c", textEN: "∂L/∂W = x × ∂L/∂y", textID: "∂L/∂W = x × ∂L/∂y"),
            QuestionOption(id: "d", textEN: "∂L/∂W = W × x", textID: "∂L/∂W = W × x")
        ],
        correctOptionId: "a",
        explanationEN: "For y = Wx, the gradient ∂L/∂W = (∂L/∂y)xᵀ is the outer product of the upstream gradient and the input. Each weight wᵢⱼ gradient depends on how much changing yᵢ affects loss × xⱼ.",
        explanationID: "Untuk y = Wx, gradien ∂L/∂W = (∂L/∂y)xᵀ adalah outer product dari gradien upstream dan input. Gradien setiap bobot wᵢⱼ bergantung pada seberapa besar mengubah yᵢ mempengaruhi loss × xⱼ.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_017",
        questionEN: "For a layer y = Wx + b, what is ∂L/∂x (to pass to previous layer)?",
        questionID: "Untuk layer y = Wx + b, apa ∂L/∂x (untuk diteruskan ke layer sebelumnya)?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂x = Wᵀ(∂L/∂y) - transpose of W times upstream gradient", textID: "∂L/∂x = Wᵀ(∂L/∂y) - transpose W dikali gradien upstream"),
            QuestionOption(id: "b", textEN: "∂L/∂x = W(∂L/∂y)", textID: "∂L/∂x = W(∂L/∂y)"),
            QuestionOption(id: "c", textEN: "∂L/∂x = ∂L/∂y × x", textID: "∂L/∂x = ∂L/∂y × x"),
            QuestionOption(id: "d", textEN: "∂L/∂x = ∂L/∂y only", textID: "∂L/∂x = ∂L/∂y saja")
        ],
        correctOptionId: "a",
        explanationEN: "The gradient passed to the previous layer is ∂L/∂x = Wᵀ(∂L/∂y). The transposed weight matrix transforms the upstream gradient back to input space.",
        explanationID: "Gradien yang diteruskan ke layer sebelumnya adalah ∂L/∂x = Wᵀ(∂L/∂y). Matriks bobot yang ditranspose mentransformasi gradien upstream kembali ke ruang input.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_018",
        questionEN: "What is the gradient of ∂L/∂b for bias b in y = Wx + b?",
        questionID: "Apa gradien ∂L/∂b untuk bias b dalam y = Wx + b?",
        options: [
            QuestionOption(id: "a", textEN: "∂L/∂b = ∂L/∂y (upstream gradient directly)", textID: "∂L/∂b = ∂L/∂y (gradien upstream langsung)"),
            QuestionOption(id: "b", textEN: "∂L/∂b = ∂L/∂y × x", textID: "∂L/∂b = ∂L/∂y × x"),
            QuestionOption(id: "c", textEN: "∂L/∂b = Wᵀ × ∂L/∂y", textID: "∂L/∂b = Wᵀ × ∂L/∂y"),
            QuestionOption(id: "d", textEN: "∂L/∂b = 0", textID: "∂L/∂b = 0")
        ],
        correctOptionId: "a",
        explanationEN: "Since y = Wx + b, ∂y/∂b = 1 (identity). So ∂L/∂b = ∂L/∂y × 1 = ∂L/∂y. The bias gradient equals the upstream gradient.",
        explanationID: "Karena y = Wx + b, ∂y/∂b = 1 (identitas). Jadi ∂L/∂b = ∂L/∂y × 1 = ∂L/∂y. Gradien bias sama dengan gradien upstream.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_019",
        questionEN: "What happens to gradients at an addition node z = x + y?",
        questionID: "Apa yang terjadi pada gradien di node penjumlahan z = x + y?",
        options: [
            QuestionOption(id: "a", textEN: "The upstream gradient is distributed equally: ∂L/∂x = ∂L/∂y = ∂L/∂z", textID: "Gradien upstream didistribusikan sama rata: ∂L/∂x = ∂L/∂y = ∂L/∂z"),
            QuestionOption(id: "b", textEN: "Gradients are multiplied", textID: "Gradien dikalikan"),
            QuestionOption(id: "c", textEN: "Gradients are divided", textID: "Gradien dibagi"),
            QuestionOption(id: "d", textEN: "Only one path gets gradient", textID: "Hanya satu jalur yang mendapat gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Since ∂z/∂x = ∂z/∂y = 1, the upstream gradient ∂L/∂z is passed unchanged to both inputs. Addition distributes gradients equally (gradient distributor).",
        explanationID: "Karena ∂z/∂x = ∂z/∂y = 1, gradien upstream ∂L/∂z diteruskan tanpa perubahan ke kedua input. Penjumlahan mendistribusikan gradien secara merata (distributor gradien).",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_020",
        questionEN: "What happens to gradients at a multiplication node z = x × y?",
        questionID: "Apa yang terjadi pada gradien di node perkalian z = x × y?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients swap: ∂L/∂x = y × ∂L/∂z, ∂L/∂y = x × ∂L/∂z", textID: "Gradien bertukar: ∂L/∂x = y × ∂L/∂z, ∂L/∂y = x × ∂L/∂z"),
            QuestionOption(id: "b", textEN: "Both get the same gradient", textID: "Keduanya mendapat gradien yang sama"),
            QuestionOption(id: "c", textEN: "Gradients are added", textID: "Gradien dijumlahkan"),
            QuestionOption(id: "d", textEN: "Only x gets gradient", textID: "Hanya x yang mendapat gradien")
        ],
        correctOptionId: "a",
        explanationEN: "For z = xy: ∂z/∂x = y, ∂z/∂y = x. The upstream gradient is multiplied by the 'other' input. This is why multiply is a gradient 'switcher'.",
        explanationID: "Untuk z = xy: ∂z/∂x = y, ∂z/∂y = x. Gradien upstream dikalikan dengan input 'lainnya'. Inilah mengapa perkalian adalah 'switcher' gradien.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    // MARK: - Optimization Theory (Questions 21-30)
    Question(
        id: "calc_adv_021",
        questionEN: "What is the gradient descent update rule?",
        questionID: "Apa aturan update gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "θ = θ - α∇L(θ)", textID: "θ = θ - α∇L(θ)"),
            QuestionOption(id: "b", textEN: "θ = θ + α∇L(θ)", textID: "θ = θ + α∇L(θ)"),
            QuestionOption(id: "c", textEN: "θ = α∇L(θ)", textID: "θ = α∇L(θ)"),
            QuestionOption(id: "d", textEN: "θ = θ × α∇L(θ)", textID: "θ = θ × α∇L(θ)")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient descent: θ = θ - α∇L(θ). We subtract the gradient (times learning rate) because the gradient points uphill, and we want to minimize loss by going downhill.",
        explanationID: "Gradient descent: θ = θ - α∇L(θ). Kita mengurangi gradien (dikali learning rate) karena gradien menunjuk ke atas, dan kita ingin meminimalkan loss dengan turun ke bawah.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "calc_adv_022",
        questionEN: "What condition indicates a local minimum for f(x)?",
        questionID: "Kondisi apa yang menunjukkan minimum lokal untuk f(x)?",
        options: [
            QuestionOption(id: "a", textEN: "f'(x) = 0 and f''(x) > 0 (zero gradient, positive curvature)", textID: "f'(x) = 0 dan f''(x) > 0 (gradien nol, kelengkungan positif)"),
            QuestionOption(id: "b", textEN: "f'(x) = 0 and f''(x) < 0", textID: "f'(x) = 0 dan f''(x) < 0"),
            QuestionOption(id: "c", textEN: "f'(x) > 0 and f''(x) = 0", textID: "f'(x) > 0 dan f''(x) = 0"),
            QuestionOption(id: "d", textEN: "f'(x) = 0 only", textID: "f'(x) = 0 saja")
        ],
        correctOptionId: "a",
        explanationEN: "At a local minimum: first derivative is zero (critical point) and second derivative is positive (concave up/curves upward). This is the second derivative test.",
        explanationID: "Pada minimum lokal: turunan pertama adalah nol (titik kritis) dan turunan kedua adalah positif (cekung ke atas/melengkung ke atas). Ini adalah tes turunan kedua.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_023",
        questionEN: "What is a saddle point?",
        questionID: "Apa itu titik sadel?",
        options: [
            QuestionOption(id: "a", textEN: "A point where gradient is zero but it's a minimum in some directions and maximum in others", textID: "Titik di mana gradien nol tetapi merupakan minimum di beberapa arah dan maksimum di arah lain"),
            QuestionOption(id: "b", textEN: "The global minimum", textID: "Minimum global"),
            QuestionOption(id: "c", textEN: "A point where gradient is very large", textID: "Titik di mana gradien sangat besar"),
            QuestionOption(id: "d", textEN: "The average of all critical points", textID: "Rata-rata dari semua titik kritis")
        ],
        correctOptionId: "a",
        explanationEN: "A saddle point has zero gradient but is neither min nor max - it curves up in some directions and down in others. Common in high-dimensional neural network loss landscapes.",
        explanationID: "Titik sadel memiliki gradien nol tetapi bukan minimum maupun maksimum - melengkung ke atas di beberapa arah dan ke bawah di arah lain. Umum dalam landscape loss jaringan saraf dimensi tinggi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_024",
        questionEN: "What is a convex function?",
        questionID: "Apa itu fungsi konveks?",
        options: [
            QuestionOption(id: "a", textEN: "A function where the line between any two points lies above or on the curve", textID: "Fungsi di mana garis antara dua titik manapun berada di atas atau pada kurva"),
            QuestionOption(id: "b", textEN: "A function with only positive values", textID: "Fungsi dengan nilai positif saja"),
            QuestionOption(id: "c", textEN: "A function that only increases", textID: "Fungsi yang hanya meningkat"),
            QuestionOption(id: "d", textEN: "A function with multiple local minima", textID: "Fungsi dengan banyak minimum lokal")
        ],
        correctOptionId: "a",
        explanationEN: "Convex: f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y). The chord lies above the curve. Any local minimum of a convex function is also the global minimum.",
        explanationID: "Konveks: f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y). Tali busur berada di atas kurva. Setiap minimum lokal dari fungsi konveks juga merupakan minimum global.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_025",
        questionEN: "What is Newton's method for optimization?",
        questionID: "Apa metode Newton untuk optimisasi?",
        options: [
            QuestionOption(id: "a", textEN: "θ = θ - H⁻¹∇f (using inverse Hessian for better steps)", textID: "θ = θ - H⁻¹∇f (menggunakan invers Hessian untuk langkah yang lebih baik)"),
            QuestionOption(id: "b", textEN: "θ = θ - α∇f (gradient descent)", textID: "θ = θ - α∇f (gradient descent)"),
            QuestionOption(id: "c", textEN: "θ = θ + H∇f", textID: "θ = θ + H∇f"),
            QuestionOption(id: "d", textEN: "θ = θ - α", textID: "θ = θ - α")
        ],
        correctOptionId: "a",
        explanationEN: "Newton's method: θ = θ - H⁻¹∇f uses second-order curvature information. It converges faster near the minimum but is impractical for large neural networks due to O(n²) storage and O(n³) inversion.",
        explanationID: "Metode Newton: θ = θ - H⁻¹∇f menggunakan informasi kelengkungan orde kedua. Konvergen lebih cepat dekat minimum tetapi tidak praktis untuk jaringan saraf besar karena penyimpanan O(n²) dan inversi O(n³).",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_026",
        questionEN: "What does a positive definite Hessian indicate at a critical point?",
        questionID: "Apa yang ditunjukkan Hessian definit positif pada titik kritis?",
        options: [
            QuestionOption(id: "a", textEN: "The critical point is a local minimum (curves up in all directions)", textID: "Titik kritis adalah minimum lokal (melengkung ke atas di semua arah)"),
            QuestionOption(id: "b", textEN: "The critical point is a local maximum", textID: "Titik kritis adalah maksimum lokal"),
            QuestionOption(id: "c", textEN: "The critical point is a saddle point", textID: "Titik kritis adalah titik sadel"),
            QuestionOption(id: "d", textEN: "The function is linear", textID: "Fungsi tersebut linear")
        ],
        correctOptionId: "a",
        explanationEN: "A positive definite Hessian (all eigenvalues > 0) means the function curves upward in all directions at that point - it's a local minimum. Negative definite means local maximum.",
        explanationID: "Hessian definit positif (semua eigenvalue > 0) berarti fungsi melengkung ke atas di semua arah pada titik tersebut - ini adalah minimum lokal. Definit negatif berarti maksimum lokal.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_027",
        questionEN: "What is the condition number of the Hessian κ(H)?",
        questionID: "Apa condition number dari Hessian κ(H)?",
        options: [
            QuestionOption(id: "a", textEN: "λmax/λmin - ratio of largest to smallest eigenvalue", textID: "λmax/λmin - rasio eigenvalue terbesar ke terkecil"),
            QuestionOption(id: "b", textEN: "Sum of all eigenvalues", textID: "Jumlah semua eigenvalue"),
            QuestionOption(id: "c", textEN: "Determinant of Hessian", textID: "Determinan Hessian"),
            QuestionOption(id: "d", textEN: "Trace of Hessian", textID: "Trace Hessian")
        ],
        correctOptionId: "a",
        explanationEN: "Condition number κ = λmax/λmin measures how 'stretched' the loss landscape is. High κ (ill-conditioned) means very different curvatures in different directions, making gradient descent converge slowly.",
        explanationID: "Condition number κ = λmax/λmin mengukur seberapa 'terentang' landscape loss. κ tinggi (ill-conditioned) berarti kelengkungan sangat berbeda di arah berbeda, membuat gradient descent konvergen lambat.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_028",
        questionEN: "What is the first-order Taylor approximation of f(x) near point a?",
        questionID: "Apa aproksimasi Taylor orde pertama dari f(x) dekat titik a?",
        options: [
            QuestionOption(id: "a", textEN: "f(x) ≈ f(a) + f'(a)(x-a) - the tangent line", textID: "f(x) ≈ f(a) + f'(a)(x-a) - garis singgung"),
            QuestionOption(id: "b", textEN: "f(x) ≈ f(a) only", textID: "f(x) ≈ f(a) saja"),
            QuestionOption(id: "c", textEN: "f(x) ≈ f'(a) only", textID: "f(x) ≈ f'(a) saja"),
            QuestionOption(id: "d", textEN: "f(x) ≈ f(a)²", textID: "f(x) ≈ f(a)²")
        ],
        correctOptionId: "a",
        explanationEN: "First-order Taylor: f(x) ≈ f(a) + f'(a)(x-a) is the tangent line approximation. Gradient descent uses this local linear approximation - it assumes the loss is locally linear.",
        explanationID: "Taylor orde pertama: f(x) ≈ f(a) + f'(a)(x-a) adalah aproksimasi garis singgung. Gradient descent menggunakan aproksimasi linear lokal ini - mengasumsikan loss linear secara lokal.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_029",
        questionEN: "What is the second-order Taylor approximation?",
        questionID: "Apa aproksimasi Taylor orde kedua?",
        options: [
            QuestionOption(id: "a", textEN: "f(x) ≈ f(a) + ∇f(a)ᵀ(x-a) + ½(x-a)ᵀH(a)(x-a)", textID: "f(x) ≈ f(a) + ∇f(a)ᵀ(x-a) + ½(x-a)ᵀH(a)(x-a)"),
            QuestionOption(id: "b", textEN: "f(x) ≈ f(a) + f'(a)(x-a)", textID: "f(x) ≈ f(a) + f'(a)(x-a)"),
            QuestionOption(id: "c", textEN: "f(x) ≈ H(a)(x-a)", textID: "f(x) ≈ H(a)(x-a)"),
            QuestionOption(id: "d", textEN: "f(x) ≈ f(a) × f'(a)", textID: "f(x) ≈ f(a) × f'(a)")
        ],
        correctOptionId: "a",
        explanationEN: "Second-order Taylor includes curvature via the Hessian: f(x) ≈ f(a) + ∇f(a)ᵀ(x-a) + ½(x-a)ᵀH(a)(x-a). This quadratic approximation is the basis for Newton's method.",
        explanationID: "Taylor orde kedua mencakup kelengkungan via Hessian: f(x) ≈ f(a) + ∇f(a)ᵀ(x-a) + ½(x-a)ᵀH(a)(x-a). Aproksimasi kuadratik ini adalah dasar metode Newton.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_030",
        questionEN: "What is the Lipschitz condition for gradients?",
        questionID: "Apa kondisi Lipschitz untuk gradien?",
        options: [
            QuestionOption(id: "a", textEN: "||∇f(x) - ∇f(y)|| ≤ L||x - y|| - gradient can't change too fast", textID: "||∇f(x) - ∇f(y)|| ≤ L||x - y|| - gradien tidak bisa berubah terlalu cepat"),
            QuestionOption(id: "b", textEN: "∇f(x) = ∇f(y) always", textID: "∇f(x) = ∇f(y) selalu"),
            QuestionOption(id: "c", textEN: "||∇f(x)|| ≤ L", textID: "||∇f(x)|| ≤ L"),
            QuestionOption(id: "d", textEN: "∇f(x) ≥ 0", textID: "∇f(x) ≥ 0")
        ],
        correctOptionId: "a",
        explanationEN: "L-smooth gradients satisfy ||∇f(x) - ∇f(y)|| ≤ L||x - y||. This bounds how quickly the gradient can change, ensuring convergence with learning rate α ≤ 1/L.",
        explanationID: "Gradien L-smooth memenuhi ||∇f(x) - ∇f(y)|| ≤ L||x - y||. Ini membatasi seberapa cepat gradien dapat berubah, memastikan konvergensi dengan learning rate α ≤ 1/L.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    // MARK: - Jacobians & Matrix Calculus (Questions 31-40)
    Question(
        id: "calc_adv_031",
        questionEN: "What is the Jacobian of f: Rⁿ → Rᵐ?",
        questionID: "Apa itu Jacobian dari f: Rⁿ → Rᵐ?",
        options: [
            QuestionOption(id: "a", textEN: "An m × n matrix where J[i,j] = ∂fᵢ/∂xⱼ", textID: "Matriks m × n di mana J[i,j] = ∂fᵢ/∂xⱼ"),
            QuestionOption(id: "b", textEN: "An n × n matrix of second derivatives", textID: "Matriks n × n dari turunan kedua"),
            QuestionOption(id: "c", textEN: "A scalar value", textID: "Nilai skalar"),
            QuestionOption(id: "d", textEN: "A vector of length n", textID: "Vektor dengan panjang n")
        ],
        correctOptionId: "a",
        explanationEN: "The Jacobian is an m × n matrix of first partial derivatives: J[i,j] = ∂fᵢ/∂xⱼ. It describes how each output changes with each input, generalizing the derivative to vector functions.",
        explanationID: "Jacobian adalah matriks m × n dari turunan parsial pertama: J[i,j] = ∂fᵢ/∂xⱼ. Ini menggambarkan bagaimana setiap output berubah dengan setiap input, menggeneralisasi turunan ke fungsi vektor.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_032",
        questionEN: "What is the Hessian of a scalar function f: Rⁿ → R?",
        questionID: "Apa itu Hessian dari fungsi skalar f: Rⁿ → R?",
        options: [
            QuestionOption(id: "a", textEN: "An n × n matrix where H[i,j] = ∂²f/∂xᵢ∂xⱼ", textID: "Matriks n × n di mana H[i,j] = ∂²f/∂xᵢ∂xⱼ"),
            QuestionOption(id: "b", textEN: "A vector of first derivatives", textID: "Vektor dari turunan pertama"),
            QuestionOption(id: "c", textEN: "A scalar value", textID: "Nilai skalar"),
            QuestionOption(id: "d", textEN: "An n × 1 matrix", textID: "Matriks n × 1")
        ],
        correctOptionId: "a",
        explanationEN: "The Hessian is an n × n matrix of second partial derivatives: H[i,j] = ∂²f/∂xᵢ∂xⱼ. It describes the curvature of f and is symmetric for smooth functions.",
        explanationID: "Hessian adalah matriks n × n dari turunan parsial kedua: H[i,j] = ∂²f/∂xᵢ∂xⱼ. Ini menggambarkan kelengkungan f dan simetris untuk fungsi halus.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_033",
        questionEN: "Why is the Hessian symmetric for smooth functions?",
        questionID: "Mengapa Hessian simetris untuk fungsi halus?",
        options: [
            QuestionOption(id: "a", textEN: "Because ∂²f/∂x∂y = ∂²f/∂y∂x (mixed partials are equal)", textID: "Karena ∂²f/∂x∂y = ∂²f/∂y∂x (turunan parsial campuran sama)"),
            QuestionOption(id: "b", textEN: "By definition", textID: "Berdasarkan definisi"),
            QuestionOption(id: "c", textEN: "It's not always symmetric", textID: "Tidak selalu simetris"),
            QuestionOption(id: "d", textEN: "Because eigenvalues are real", textID: "Karena eigenvalue adalah riil")
        ],
        correctOptionId: "a",
        explanationEN: "By Clairaut's/Schwarz's theorem, for twice continuously differentiable functions, mixed partials are equal: ∂²f/∂xᵢ∂xⱼ = ∂²f/∂xⱼ∂xᵢ, making H = Hᵀ.",
        explanationID: "Berdasarkan teorema Clairaut/Schwarz, untuk fungsi yang dua kali dapat diturunkan secara kontinu, turunan parsial campuran sama: ∂²f/∂xᵢ∂xⱼ = ∂²f/∂xⱼ∂xᵢ, membuat H = Hᵀ.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_034",
        questionEN: "What is the derivative of ||x||₂² (squared L2 norm)?",
        questionID: "Apa turunan dari ||x||₂² (norm L2 kuadrat)?",
        options: [
            QuestionOption(id: "a", textEN: "∇(||x||₂²) = 2x", textID: "∇(||x||₂²) = 2x"),
            QuestionOption(id: "b", textEN: "∇(||x||₂²) = x/||x||", textID: "∇(||x||₂²) = x/||x||"),
            QuestionOption(id: "c", textEN: "∇(||x||₂²) = x²", textID: "∇(||x||₂²) = x²"),
            QuestionOption(id: "d", textEN: "∇(||x||₂²) = ||x||", textID: "∇(||x||₂²) = ||x||")
        ],
        correctOptionId: "a",
        explanationEN: "∇(||x||₂²) = ∇(xᵀx) = 2x. This is why L2 regularization λ||w||₂² adds 2λw to the gradient, equivalent to weight decay in gradient descent.",
        explanationID: "∇(||x||₂²) = ∇(xᵀx) = 2x. Inilah mengapa regularisasi L2 λ||w||₂² menambahkan 2λw ke gradien, setara dengan weight decay dalam gradient descent.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_035",
        questionEN: "What is the derivative of ||x||₂ (L2 norm, not squared)?",
        questionID: "Apa turunan dari ||x||₂ (norm L2, tidak dikuadratkan)?",
        options: [
            QuestionOption(id: "a", textEN: "∇(||x||₂) = x/||x||₂ - unit vector in direction of x", textID: "∇(||x||₂) = x/||x||₂ - vektor satuan dalam arah x"),
            QuestionOption(id: "b", textEN: "∇(||x||₂) = 2x", textID: "∇(||x||₂) = 2x"),
            QuestionOption(id: "c", textEN: "∇(||x||₂) = x", textID: "∇(||x||₂) = x"),
            QuestionOption(id: "d", textEN: "∇(||x||₂) = 1", textID: "∇(||x||₂) = 1")
        ],
        correctOptionId: "a",
        explanationEN: "∇(||x||₂) = x/||x||₂, the unit vector pointing in the direction of x. The gradient points radially outward with unit magnitude (undefined at x = 0).",
        explanationID: "∇(||x||₂) = x/||x||₂, vektor satuan yang menunjuk ke arah x. Gradien menunjuk secara radial ke luar dengan magnitudo satuan (tidak terdefinisi pada x = 0).",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_036",
        questionEN: "What is the gradient of f(x) = aᵀx (linear function)?",
        questionID: "Apa gradien dari f(x) = aᵀx (fungsi linear)?",
        options: [
            QuestionOption(id: "a", textEN: "∇(aᵀx) = a", textID: "∇(aᵀx) = a"),
            QuestionOption(id: "b", textEN: "∇(aᵀx) = x", textID: "∇(aᵀx) = x"),
            QuestionOption(id: "c", textEN: "∇(aᵀx) = aᵀ", textID: "∇(aᵀx) = aᵀ"),
            QuestionOption(id: "d", textEN: "∇(aᵀx) = 0", textID: "∇(aᵀx) = 0")
        ],
        correctOptionId: "a",
        explanationEN: "For f(x) = aᵀx = Σaᵢxᵢ, the gradient ∂f/∂xᵢ = aᵢ, so ∇f = a. The gradient of a linear function is just the coefficient vector.",
        explanationID: "Untuk f(x) = aᵀx = Σaᵢxᵢ, gradien ∂f/∂xᵢ = aᵢ, jadi ∇f = a. Gradien dari fungsi linear hanyalah vektor koefisien.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_037",
        questionEN: "What is the gradient of f(x) = xᵀAx (quadratic form)?",
        questionID: "Apa gradien dari f(x) = xᵀAx (bentuk kuadratik)?",
        options: [
            QuestionOption(id: "a", textEN: "∇(xᵀAx) = (A + Aᵀ)x, which equals 2Ax if A is symmetric", textID: "∇(xᵀAx) = (A + Aᵀ)x, yang sama dengan 2Ax jika A simetris"),
            QuestionOption(id: "b", textEN: "∇(xᵀAx) = Ax", textID: "∇(xᵀAx) = Ax"),
            QuestionOption(id: "c", textEN: "∇(xᵀAx) = A", textID: "∇(xᵀAx) = A"),
            QuestionOption(id: "d", textEN: "∇(xᵀAx) = x²", textID: "∇(xᵀAx) = x²")
        ],
        correctOptionId: "a",
        explanationEN: "For quadratic form xᵀAx, the gradient is (A + Aᵀ)x. If A is symmetric (A = Aᵀ), this simplifies to 2Ax. This appears in ridge regression and many ML problems.",
        explanationID: "Untuk bentuk kuadratik xᵀAx, gradiennya adalah (A + Aᵀ)x. Jika A simetris (A = Aᵀ), ini menyederhanakan menjadi 2Ax. Ini muncul dalam ridge regression dan banyak masalah ML.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_038",
        questionEN: "What is the Jacobian determinant used for?",
        questionID: "Untuk apa determinan Jacobian digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring volume scaling in transformations; used in change of variables for integrals", textID: "Mengukur penskalaan volume dalam transformasi; digunakan dalam substitusi variabel untuk integral"),
            QuestionOption(id: "b", textEN: "Finding matrix inverse", textID: "Mencari invers matriks"),
            QuestionOption(id: "c", textEN: "Computing eigenvalues", textID: "Menghitung eigenvalue"),
            QuestionOption(id: "d", textEN: "Solving linear equations", textID: "Menyelesaikan persamaan linear")
        ],
        correctOptionId: "a",
        explanationEN: "|det(J)| measures how a transformation scales volumes. For change of variables in integrals: ∫f(g(x))|det(J)|dx. Used in normalizing flows for density estimation.",
        explanationID: "|det(J)| mengukur bagaimana transformasi menskalakan volume. Untuk substitusi variabel dalam integral: ∫f(g(x))|det(J)|dx. Digunakan dalam normalizing flows untuk estimasi densitas.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_039",
        questionEN: "In the expression ∂L/∂W for matrix W, what shape is the gradient?",
        questionID: "Dalam ekspresi ∂L/∂W untuk matriks W, apa bentuk gradiennya?",
        options: [
            QuestionOption(id: "a", textEN: "Same shape as W", textID: "Bentuk yang sama dengan W"),
            QuestionOption(id: "b", textEN: "Transpose of W", textID: "Transpose dari W"),
            QuestionOption(id: "c", textEN: "A scalar", textID: "Skalar"),
            QuestionOption(id: "d", textEN: "A vector", textID: "Vektor")
        ],
        correctOptionId: "a",
        explanationEN: "The gradient ∂L/∂W has the same shape as W. Each entry (∂L/∂W)ᵢⱼ tells us how much L changes when Wᵢⱼ changes. This is essential for weight updates.",
        explanationID: "Gradien ∂L/∂W memiliki bentuk yang sama dengan W. Setiap entri (∂L/∂W)ᵢⱼ memberi tahu kita seberapa banyak L berubah ketika Wᵢⱼ berubah. Ini penting untuk update bobot.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_040",
        questionEN: "What is the Hessian-vector product Hv useful for?",
        questionID: "Untuk apa Hessian-vector product Hv berguna?",
        options: [
            QuestionOption(id: "a", textEN: "Computing curvature in direction v without storing the full Hessian (O(n) vs O(n²))", textID: "Menghitung kelengkungan dalam arah v tanpa menyimpan Hessian penuh (O(n) vs O(n²))"),
            QuestionOption(id: "b", textEN: "Finding eigenvalues of H", textID: "Mencari eigenvalue dari H"),
            QuestionOption(id: "c", textEN: "Inverting H", textID: "Menginvers H"),
            QuestionOption(id: "d", textEN: "Computing the trace of H", textID: "Menghitung trace dari H")
        ],
        correctOptionId: "a",
        explanationEN: "Hv can be computed in O(n) time using autodiff without forming the O(n²) Hessian. Used in conjugate gradient methods and for curvature analysis in neural network training.",
        explanationID: "Hv dapat dihitung dalam waktu O(n) menggunakan autodiff tanpa membentuk Hessian O(n²). Digunakan dalam metode conjugate gradient dan untuk analisis kelengkungan dalam pelatihan jaringan saraf.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    // MARK: - Advanced Topics (Questions 41-50)
    Question(
        id: "calc_adv_041",
        questionEN: "What is automatic differentiation (autodiff)?",
        questionID: "Apa itu diferensiasi otomatis (autodiff)?",
        options: [
            QuestionOption(id: "a", textEN: "Computing exact derivatives by applying chain rule to elementary operations automatically", textID: "Menghitung turunan eksak dengan menerapkan aturan rantai ke operasi elementer secara otomatis"),
            QuestionOption(id: "b", textEN: "Numerically approximating derivatives with finite differences", textID: "Mengaproksimasi turunan secara numerik dengan finite differences"),
            QuestionOption(id: "c", textEN: "Symbolically simplifying derivatives", textID: "Menyederhanakan turunan secara simbolis"),
            QuestionOption(id: "d", textEN: "Manual derivative computation", textID: "Komputasi turunan manual")
        ],
        correctOptionId: "a",
        explanationEN: "Autodiff decomposes functions into elementary operations and applies the chain rule automatically to compute exact numerical derivatives. Used by PyTorch, TensorFlow for efficient gradient computation.",
        explanationID: "Autodiff memecah fungsi menjadi operasi elementer dan menerapkan aturan rantai secara otomatis untuk menghitung turunan numerik yang eksak. Digunakan oleh PyTorch, TensorFlow untuk komputasi gradien yang efisien.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_042",
        questionEN: "What is the difference between forward-mode and reverse-mode autodiff?",
        questionID: "Apa perbedaan antara forward-mode dan reverse-mode autodiff?",
        options: [
            QuestionOption(id: "a", textEN: "Forward: efficient for few inputs, many outputs. Reverse: efficient for many inputs, few outputs (like neural networks)", textID: "Forward: efisien untuk sedikit input, banyak output. Reverse: efisien untuk banyak input, sedikit output (seperti jaringan saraf)"),
            QuestionOption(id: "b", textEN: "They produce different results", textID: "Mereka menghasilkan hasil yang berbeda"),
            QuestionOption(id: "c", textEN: "Forward is more accurate", textID: "Forward lebih akurat"),
            QuestionOption(id: "d", textEN: "Reverse is faster always", textID: "Reverse selalu lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Forward-mode computes Jacobian columns (one input at a time). Reverse-mode computes Jacobian rows (one output at a time). Neural networks have many weights (inputs) and one loss (output), so reverse-mode (backprop) is efficient.",
        explanationID: "Forward-mode menghitung kolom Jacobian (satu input sekaligus). Reverse-mode menghitung baris Jacobian (satu output sekaligus). Jaringan saraf memiliki banyak bobot (input) dan satu loss (output), jadi reverse-mode (backprop) efisien.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_043",
        questionEN: "What is a subgradient?",
        questionID: "Apa itu subgradien?",
        options: [
            QuestionOption(id: "a", textEN: "A generalization of gradient for non-differentiable convex functions", textID: "Generalisasi gradien untuk fungsi konveks yang tidak dapat diturunkan"),
            QuestionOption(id: "b", textEN: "A smaller version of gradient", textID: "Versi gradien yang lebih kecil"),
            QuestionOption(id: "c", textEN: "The gradient divided by 2", textID: "Gradien dibagi 2"),
            QuestionOption(id: "d", textEN: "A gradient in a subspace", textID: "Gradien dalam subruang")
        ],
        correctOptionId: "a",
        explanationEN: "For non-differentiable convex functions (like |x| at x=0), a subgradient g satisfies f(y) ≥ f(x) + gᵀ(y-x). Used for L1 regularization and other non-smooth optimization.",
        explanationID: "Untuk fungsi konveks yang tidak dapat diturunkan (seperti |x| di x=0), subgradien g memenuhi f(y) ≥ f(x) + gᵀ(y-x). Digunakan untuk regularisasi L1 dan optimisasi non-smooth lainnya.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_044",
        questionEN: "What is the reparameterization trick?",
        questionID: "Apa itu trik reparameterisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Writing z ~ N(μ,σ²) as z = μ + σε where ε ~ N(0,1), enabling gradients through sampling", textID: "Menulis z ~ N(μ,σ²) sebagai z = μ + σε di mana ε ~ N(0,1), memungkinkan gradien melalui sampling"),
            QuestionOption(id: "b", textEN: "Changing parameter names", textID: "Mengubah nama parameter"),
            QuestionOption(id: "c", textEN: "Reducing parameters", textID: "Mengurangi parameter"),
            QuestionOption(id: "d", textEN: "Normalizing parameters", textID: "Menormalisasi parameter")
        ],
        correctOptionId: "a",
        explanationEN: "The reparameterization trick moves randomness outside the gradient path: z = μ + σε with fixed ε ~ N(0,1). Now ∂z/∂μ = 1 and ∂z/∂σ = ε, enabling backprop through stochastic nodes (VAEs).",
        explanationID: "Trik reparameterisasi memindahkan keacakan ke luar jalur gradien: z = μ + σε dengan ε ~ N(0,1) tetap. Sekarang ∂z/∂μ = 1 dan ∂z/∂σ = ε, memungkinkan backprop melalui node stokastik (VAE).",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_045",
        questionEN: "What is the gradient of log(det(A)) with respect to A?",
        questionID: "Apa gradien dari log(det(A)) terhadap A?",
        options: [
            QuestionOption(id: "a", textEN: "A⁻ᵀ (transpose of inverse)", textID: "A⁻ᵀ (transpose dari invers)"),
            QuestionOption(id: "b", textEN: "det(A)", textID: "det(A)"),
            QuestionOption(id: "c", textEN: "log(A)", textID: "log(A)"),
            QuestionOption(id: "d", textEN: "A", textID: "A")
        ],
        correctOptionId: "a",
        explanationEN: "∂log(det(A))/∂A = A⁻ᵀ = (A⁻¹)ᵀ. This appears in maximum likelihood estimation for Gaussian distributions and normalizing flows.",
        explanationID: "∂log(det(A))/∂A = A⁻ᵀ = (A⁻¹)ᵀ. Ini muncul dalam estimasi maximum likelihood untuk distribusi Gaussian dan normalizing flows.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_046",
        questionEN: "What is the gradient of trace(AB) with respect to A?",
        questionID: "Apa gradien dari trace(AB) terhadap A?",
        options: [
            QuestionOption(id: "a", textEN: "Bᵀ", textID: "Bᵀ"),
            QuestionOption(id: "b", textEN: "B", textID: "B"),
            QuestionOption(id: "c", textEN: "AB", textID: "AB"),
            QuestionOption(id: "d", textEN: "trace(B)", textID: "trace(B)")
        ],
        correctOptionId: "a",
        explanationEN: "∂trace(AB)/∂A = Bᵀ. The trace gradient follows from ∂(ΣᵢΣⱼAᵢⱼBⱼᵢ)/∂Aᵢⱼ = Bⱼᵢ = (Bᵀ)ᵢⱼ. Useful in matrix factorization problems.",
        explanationID: "∂trace(AB)/∂A = Bᵀ. Gradien trace mengikuti dari ∂(ΣᵢΣⱼAᵢⱼBⱼᵢ)/∂Aᵢⱼ = Bⱼᵢ = (Bᵀ)ᵢⱼ. Berguna dalam masalah faktorisasi matriks.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_047",
        questionEN: "What is batch gradient in terms of individual sample gradients?",
        questionID: "Apa itu batch gradient dalam hal gradien sampel individual?",
        options: [
            QuestionOption(id: "a", textEN: "Average of gradients: ∇L = (1/n)Σᵢ∇Lᵢ", textID: "Rata-rata gradien: ∇L = (1/n)Σᵢ∇Lᵢ"),
            QuestionOption(id: "b", textEN: "Sum of gradients without averaging", textID: "Jumlah gradien tanpa rata-rata"),
            QuestionOption(id: "c", textEN: "Maximum gradient", textID: "Gradien maksimum"),
            QuestionOption(id: "d", textEN: "Minimum gradient", textID: "Gradien minimum")
        ],
        correctOptionId: "a",
        explanationEN: "For batch loss L = (1/n)ΣLᵢ, the gradient is the average of individual gradients: ∇L = (1/n)Σ∇Lᵢ. Mini-batch SGD uses subsets to estimate this average efficiently.",
        explanationID: "Untuk batch loss L = (1/n)ΣLᵢ, gradiennya adalah rata-rata gradien individual: ∇L = (1/n)Σ∇Lᵢ. Mini-batch SGD menggunakan subset untuk memperkirakan rata-rata ini secara efisien.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_048",
        questionEN: "What is the gradient of the max function max(x₁, x₂, ..., xₙ)?",
        questionID: "Apa gradien dari fungsi max max(x₁, x₂, ..., xₙ)?",
        options: [
            QuestionOption(id: "a", textEN: "1 for the maximum element, 0 for all others", textID: "1 untuk elemen maksimum, 0 untuk yang lainnya"),
            QuestionOption(id: "b", textEN: "1/n for all elements", textID: "1/n untuk semua elemen"),
            QuestionOption(id: "c", textEN: "n for the maximum", textID: "n untuk maksimum"),
            QuestionOption(id: "d", textEN: "All ones", textID: "Semua satu")
        ],
        correctOptionId: "a",
        explanationEN: "The gradient of max is 1 for the argmax element and 0 elsewhere. This is used in max pooling gradients - only the maximum element's gradient passes through.",
        explanationID: "Gradien max adalah 1 untuk elemen argmax dan 0 di tempat lain. Ini digunakan dalam gradien max pooling - hanya gradien elemen maksimum yang diteruskan.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "calc_adv_049",
        questionEN: "What is the straight-through estimator?",
        questionID: "Apa itu straight-through estimator?",
        options: [
            QuestionOption(id: "a", textEN: "Passing gradients through non-differentiable operations by using identity gradient", textID: "Meneruskan gradien melalui operasi non-differentiable dengan menggunakan gradien identitas"),
            QuestionOption(id: "b", textEN: "A faster gradient computation method", textID: "Metode komputasi gradien yang lebih cepat"),
            QuestionOption(id: "c", textEN: "An exact gradient method", textID: "Metode gradien eksak"),
            QuestionOption(id: "d", textEN: "A gradient-free method", textID: "Metode bebas gradien")
        ],
        correctOptionId: "a",
        explanationEN: "The straight-through estimator uses identity for backward pass through non-differentiable ops (like discretization). Forward: y = round(x), Backward: ∂L/∂x = ∂L/∂y. Used in quantized networks.",
        explanationID: "Straight-through estimator menggunakan identitas untuk backward pass melalui operasi non-differentiable (seperti diskretisasi). Forward: y = round(x), Backward: ∂L/∂x = ∂L/∂y. Digunakan dalam jaringan terkuantisasi.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "calc_adv_050",
        questionEN: "What is gradient checkpointing used for?",
        questionID: "Untuk apa gradient checkpointing digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Trading computation for memory by recomputing activations during backward pass instead of storing them", textID: "Menukar komputasi dengan memori dengan menghitung ulang aktivasi selama backward pass alih-alih menyimpannya"),
            QuestionOption(id: "b", textEN: "Saving gradients to disk", textID: "Menyimpan gradien ke disk"),
            QuestionOption(id: "c", textEN: "Checking gradients for errors", textID: "Memeriksa gradien untuk kesalahan"),
            QuestionOption(id: "d", textEN: "Visualizing gradients", textID: "Memvisualisasikan gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient checkpointing stores only some activations and recomputes others during backprop. This reduces memory from O(n) to O(√n) at the cost of one extra forward pass. Essential for training very deep networks.",
        explanationID: "Gradient checkpointing hanya menyimpan beberapa aktivasi dan menghitung ulang yang lain selama backprop. Ini mengurangi memori dari O(n) ke O(√n) dengan biaya satu forward pass ekstra. Penting untuk melatih jaringan yang sangat dalam.",
        topic: "mathematics",
        difficulty: .advanced
    )
]
