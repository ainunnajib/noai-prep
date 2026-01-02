import Foundation

// MARK: - Attention & Sequence Models Questions (50)
// Topics: RNNs, LSTMs, GRUs, Attention, Transformers
// Aligned with IOAI/NOAI Syllabus

let attentionSequenceQuestions: [Question] = [
    // MARK: - RNN Basics (1-10)
    Question(
        id: "seq_001",
        questionEN: "What is a Recurrent Neural Network (RNN)?",
        questionID: "Apa itu Recurrent Neural Network (RNN)?",
        options: [
            QuestionOption(id: "a", textEN: "A neural network with loops that process sequences by maintaining hidden state", textID: "Neural network dengan loop yang memproses urutan dengan mempertahankan hidden state"),
            QuestionOption(id: "b", textEN: "A feedforward network with extra layers", textID: "Network feedforward dengan layer tambahan"),
            QuestionOption(id: "c", textEN: "A network for image classification only", textID: "Network hanya untuk klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "A network without any memory", textID: "Network tanpa memori")
        ],
        correctOptionId: "a",
        explanationEN: "RNNs have recurrent connections that allow information to persist. The hidden state acts as memory, updated at each timestep: h_t = f(h_{t-1}, x_t).",
        explanationID: "RNN memiliki koneksi rekuren yang memungkinkan informasi bertahan. Hidden state bertindak sebagai memori, diperbarui di setiap timestep: h_t = f(h_{t-1}, x_t).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_002",
        questionEN: "What is the vanishing gradient problem in RNNs?",
        questionID: "Apa masalah vanishing gradient dalam RNN?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients become exponentially small through time, preventing long-term learning", textID: "Gradien menjadi sangat kecil secara eksponensial melalui waktu, mencegah pembelajaran jangka panjang"),
            QuestionOption(id: "b", textEN: "Gradients become too large", textID: "Gradien menjadi terlalu besar"),
            QuestionOption(id: "c", textEN: "The network runs out of memory", textID: "Network kehabisan memori"),
            QuestionOption(id: "d", textEN: "The loss function becomes zero", textID: "Fungsi loss menjadi nol")
        ],
        correctOptionId: "a",
        explanationEN: "During BPTT, gradients are multiplied repeatedly. With small weights or saturated activations, gradients shrink exponentially, making it hard to learn long-range dependencies.",
        explanationID: "Selama BPTT, gradien dikalikan berulang kali. Dengan bobot kecil atau aktivasi jenuh, gradien menyusut secara eksponensial, sulit mempelajari dependensi jarak jauh.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_003",
        questionEN: "What is Backpropagation Through Time (BPTT)?",
        questionID: "Apa itu Backpropagation Through Time (BPTT)?",
        options: [
            QuestionOption(id: "a", textEN: "Unrolling RNN through time and applying backpropagation", textID: "Membuka RNN melalui waktu dan menerapkan backpropagation"),
            QuestionOption(id: "b", textEN: "Training RNN in reverse order", textID: "Melatih RNN dalam urutan terbalik"),
            QuestionOption(id: "c", textEN: "Using future data for prediction", textID: "Menggunakan data masa depan untuk prediksi"),
            QuestionOption(id: "d", textEN: "Parallel training of RNN", textID: "Training paralel RNN")
        ],
        correctOptionId: "a",
        explanationEN: "BPTT treats the unrolled RNN as a deep feedforward network, computing gradients by summing contributions from each timestep, then updating shared weights.",
        explanationID: "BPTT memperlakukan RNN yang dibuka sebagai network feedforward dalam, menghitung gradien dengan menjumlahkan kontribusi dari setiap timestep.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_004",
        questionEN: "Why are LSTMs better than vanilla RNNs for long sequences?",
        questionID: "Mengapa LSTM lebih baik daripada RNN vanilla untuk urutan panjang?",
        options: [
            QuestionOption(id: "a", textEN: "Gating mechanisms control information flow, preventing vanishing gradients", textID: "Mekanisme gating mengontrol aliran informasi, mencegah vanishing gradient"),
            QuestionOption(id: "b", textEN: "LSTMs are faster to train", textID: "LSTM lebih cepat dilatih"),
            QuestionOption(id: "c", textEN: "LSTMs use less memory", textID: "LSTM menggunakan lebih sedikit memori"),
            QuestionOption(id: "d", textEN: "LSTMs have fewer parameters", textID: "LSTM memiliki lebih sedikit parameter")
        ],
        correctOptionId: "a",
        explanationEN: "LSTM's cell state provides a highway for gradients, and gates (forget, input, output) learn what to remember/forget. The additive cell update preserves gradients better.",
        explanationID: "Cell state LSTM menyediakan jalan pintas untuk gradien, dan gate (forget, input, output) belajar apa yang perlu diingat/dilupakan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_005",
        questionEN: "What are the three gates in an LSTM?",
        questionID: "Apa tiga gate dalam LSTM?",
        options: [
            QuestionOption(id: "a", textEN: "Forget gate, Input gate, Output gate", textID: "Forget gate, Input gate, Output gate"),
            QuestionOption(id: "b", textEN: "Read gate, Write gate, Reset gate", textID: "Read gate, Write gate, Reset gate"),
            QuestionOption(id: "c", textEN: "Start gate, Stop gate, Continue gate", textID: "Start gate, Stop gate, Continue gate"),
            QuestionOption(id: "d", textEN: "Open gate, Close gate, Memory gate", textID: "Open gate, Close gate, Memory gate")
        ],
        correctOptionId: "a",
        explanationEN: "Forget gate decides what to discard from cell state. Input gate decides what new info to store. Output gate decides what to output from cell state to hidden state.",
        explanationID: "Forget gate memutuskan apa yang dibuang dari cell state. Input gate memutuskan info baru apa yang disimpan. Output gate memutuskan apa yang dikeluarkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_006",
        questionEN: "What is a GRU (Gated Recurrent Unit)?",
        questionID: "Apa itu GRU (Gated Recurrent Unit)?",
        options: [
            QuestionOption(id: "a", textEN: "Simplified LSTM with two gates (reset, update) instead of three", textID: "LSTM yang disederhanakan dengan dua gate (reset, update) bukan tiga"),
            QuestionOption(id: "b", textEN: "A more complex version of LSTM", textID: "Versi LSTM yang lebih kompleks"),
            QuestionOption(id: "c", textEN: "A type of CNN for sequences", textID: "Jenis CNN untuk urutan"),
            QuestionOption(id: "d", textEN: "A gated version of feedforward networks", textID: "Versi gated dari network feedforward")
        ],
        correctOptionId: "a",
        explanationEN: "GRU merges cell and hidden state, uses reset gate (controls previous hidden state contribution) and update gate (balances old and new state). Often performs similarly to LSTM with fewer parameters.",
        explanationID: "GRU menggabungkan cell dan hidden state, menggunakan reset gate dan update gate. Sering berkinerja serupa dengan LSTM dengan lebih sedikit parameter.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_007",
        questionEN: "What is a bidirectional RNN?",
        questionID: "Apa itu RNN bidirectional?",
        options: [
            QuestionOption(id: "a", textEN: "Two RNNs processing sequence forward and backward, outputs concatenated", textID: "Dua RNN memproses urutan maju dan mundur, output digabungkan"),
            QuestionOption(id: "b", textEN: "An RNN that runs twice as fast", textID: "RNN yang berjalan dua kali lebih cepat"),
            QuestionOption(id: "c", textEN: "An RNN with two layers", textID: "RNN dengan dua layer"),
            QuestionOption(id: "d", textEN: "An RNN for binary classification", textID: "RNN untuk klasifikasi biner")
        ],
        correctOptionId: "a",
        explanationEN: "BiRNN uses both past (forward) and future (backward) context at each timestep. Hidden states are concatenated: h_t = [h_t_forward; h_t_backward]. Useful for NLP tasks like NER.",
        explanationID: "BiRNN menggunakan konteks masa lalu (forward) dan masa depan (backward) di setiap timestep. Hidden state digabungkan. Berguna untuk tugas NLP seperti NER.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_008",
        questionEN: "What is teacher forcing in RNN training?",
        questionID: "Apa itu teacher forcing dalam training RNN?",
        options: [
            QuestionOption(id: "a", textEN: "Using ground truth as input at each step instead of model's prediction", textID: "Menggunakan ground truth sebagai input di setiap langkah bukan prediksi model"),
            QuestionOption(id: "b", textEN: "Training with a teacher model", textID: "Training dengan model guru"),
            QuestionOption(id: "c", textEN: "Forcing the model to learn faster", textID: "Memaksa model untuk belajar lebih cepat"),
            QuestionOption(id: "d", textEN: "Using curriculum learning", textID: "Menggunakan curriculum learning")
        ],
        correctOptionId: "a",
        explanationEN: "Teacher forcing feeds ground truth y_{t-1} as input instead of predicted ŷ_{t-1}. Speeds up training but can cause exposure bias (train-test mismatch).",
        explanationID: "Teacher forcing memasukkan ground truth y_{t-1} sebagai input bukan prediksi ŷ_{t-1}. Mempercepat training tapi dapat menyebabkan exposure bias.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_009",
        questionEN: "What is the exploding gradient problem?",
        questionID: "Apa masalah exploding gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients grow exponentially large, causing unstable training", textID: "Gradien tumbuh sangat besar secara eksponensial, menyebabkan training tidak stabil"),
            QuestionOption(id: "b", textEN: "Too many parameters in the network", textID: "Terlalu banyak parameter dalam network"),
            QuestionOption(id: "c", textEN: "The loss function increases infinitely", textID: "Fungsi loss meningkat tanpa batas"),
            QuestionOption(id: "d", textEN: "Memory overflow during training", textID: "Overflow memori selama training")
        ],
        correctOptionId: "a",
        explanationEN: "With large weight values, gradients multiply and explode during BPTT. Solution: gradient clipping (cap gradients at a maximum norm) or careful initialization.",
        explanationID: "Dengan nilai bobot besar, gradien berkali-kali dan meledak selama BPTT. Solusi: gradient clipping (membatasi gradien pada norm maksimum).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_010",
        questionEN: "What is gradient clipping?",
        questionID: "Apa itu gradient clipping?",
        options: [
            QuestionOption(id: "a", textEN: "Scaling down gradients when their norm exceeds a threshold", textID: "Memperkecil gradien ketika normnya melebihi threshold"),
            QuestionOption(id: "b", textEN: "Removing gradients from certain layers", textID: "Menghapus gradien dari layer tertentu"),
            QuestionOption(id: "c", textEN: "Clipping the loss value", textID: "Memotong nilai loss"),
            QuestionOption(id: "d", textEN: "Setting gradients to zero", textID: "Mengatur gradien menjadi nol")
        ],
        correctOptionId: "a",
        explanationEN: "If ||g|| > threshold, rescale: g = threshold × g / ||g||. This prevents exploding gradients while preserving gradient direction. Common threshold: 1.0 or 5.0.",
        explanationID: "Jika ||g|| > threshold, skala ulang: g = threshold × g / ||g||. Ini mencegah exploding gradient sambil mempertahankan arah gradien.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Attention Mechanisms (11-25)
    Question(
        id: "seq_011",
        questionEN: "What is the core idea of attention in neural networks?",
        questionID: "Apa ide inti attention dalam neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Learning to weight different parts of input based on relevance to current output", textID: "Belajar memberi bobot pada bagian input berbeda berdasarkan relevansi dengan output saat ini"),
            QuestionOption(id: "b", textEN: "Making the network pay attention to training", textID: "Membuat network memperhatikan training"),
            QuestionOption(id: "c", textEN: "Focusing on the most recent input only", textID: "Fokus hanya pada input terbaru"),
            QuestionOption(id: "d", textEN: "Reducing the number of parameters", textID: "Mengurangi jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Attention computes relevance scores between query and keys, then uses these to weight values. This allows the model to focus on relevant parts regardless of distance.",
        explanationID: "Attention menghitung skor relevansi antara query dan key, lalu menggunakan ini untuk memberi bobot value. Memungkinkan model fokus pada bagian relevan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_012",
        questionEN: "What are Query, Key, and Value in attention?",
        questionID: "Apa itu Query, Key, dan Value dalam attention?",
        options: [
            QuestionOption(id: "a", textEN: "Query asks, Keys are matched against it, Values are retrieved based on match scores", textID: "Query bertanya, Key dicocokkan dengannya, Value diambil berdasarkan skor kecocokan"),
            QuestionOption(id: "b", textEN: "Three separate neural networks", textID: "Tiga neural network terpisah"),
            QuestionOption(id: "c", textEN: "Input, hidden state, output", textID: "Input, hidden state, output"),
            QuestionOption(id: "d", textEN: "Database concepts in ML", textID: "Konsep database dalam ML")
        ],
        correctOptionId: "a",
        explanationEN: "Q (what I'm looking for), K (what I have to offer), V (actual content). Attention(Q,K,V) = softmax(QK^T/√d)V. Scores come from Q-K similarity, weighted sum of Vs.",
        explanationID: "Q (apa yang saya cari), K (apa yang saya tawarkan), V (konten aktual). Attention(Q,K,V) = softmax(QK^T/√d)V.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_013",
        questionEN: "What is scaled dot-product attention?",
        questionID: "Apa itu scaled dot-product attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention(Q,K,V) = softmax(QK^T/√d_k)V, scaled by √d_k to prevent vanishing gradients in softmax", textID: "Attention(Q,K,V) = softmax(QK^T/√d_k)V, diskala dengan √d_k untuk mencegah vanishing gradient"),
            QuestionOption(id: "b", textEN: "Dot product without any scaling", textID: "Dot product tanpa scaling"),
            QuestionOption(id: "c", textEN: "Scaling the output by a constant", textID: "Menskala output dengan konstanta"),
            QuestionOption(id: "d", textEN: "Using cosine similarity instead of dot product", textID: "Menggunakan cosine similarity bukan dot product")
        ],
        correctOptionId: "a",
        explanationEN: "For large d_k, dot products grow large, pushing softmax into regions with tiny gradients. Dividing by √d_k keeps variance stable: Var(q·k) ≈ d_k → normalized to ~1.",
        explanationID: "Untuk d_k besar, dot product tumbuh besar, mendorong softmax ke wilayah dengan gradien kecil. Membagi dengan √d_k menjaga variansi stabil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_014",
        questionEN: "What is multi-head attention?",
        questionID: "Apa itu multi-head attention?",
        options: [
            QuestionOption(id: "a", textEN: "Running attention multiple times in parallel with different learned projections, then concatenating", textID: "Menjalankan attention beberapa kali secara paralel dengan proyeksi berbeda yang dipelajari, lalu digabung"),
            QuestionOption(id: "b", textEN: "Attention with multiple queries", textID: "Attention dengan beberapa query"),
            QuestionOption(id: "c", textEN: "Using multiple RNN heads", textID: "Menggunakan beberapa RNN head"),
            QuestionOption(id: "d", textEN: "Attention on multiple sequences", textID: "Attention pada beberapa urutan")
        ],
        correctOptionId: "a",
        explanationEN: "MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O where head_i = Attention(QW_i^Q, KW_i^K, VW_i^V). Allows attending to different representation subspaces.",
        explanationID: "MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O. Memungkinkan memperhatikan subspace representasi berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_015",
        questionEN: "What is self-attention?",
        questionID: "Apa itu self-attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention where Q, K, V all come from the same sequence", textID: "Attention dimana Q, K, V semuanya berasal dari urutan yang sama"),
            QuestionOption(id: "b", textEN: "Attention that focuses on itself only", textID: "Attention yang fokus pada dirinya sendiri saja"),
            QuestionOption(id: "c", textEN: "Automatic attention without learning", textID: "Attention otomatis tanpa pembelajaran"),
            QuestionOption(id: "d", textEN: "Attention between different modalities", textID: "Attention antara modalitas berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "In self-attention, each position attends to all positions in the same sequence. Enables learning relationships between all pairs of positions directly, regardless of distance.",
        explanationID: "Dalam self-attention, setiap posisi memperhatikan semua posisi dalam urutan yang sama. Memungkinkan pembelajaran hubungan antara semua pasangan posisi secara langsung.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_016",
        questionEN: "What is cross-attention?",
        questionID: "Apa itu cross-attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention where Q comes from one sequence, K and V from another", textID: "Attention dimana Q berasal dari satu urutan, K dan V dari yang lain"),
            QuestionOption(id: "b", textEN: "Attention across multiple batches", textID: "Attention di beberapa batch"),
            QuestionOption(id: "c", textEN: "Attention that crosses layer boundaries", textID: "Attention yang melintasi batas layer"),
            QuestionOption(id: "d", textEN: "Bidirectional attention", textID: "Attention bidirectional")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-attention allows one sequence to attend to another. Used in encoder-decoder architectures where decoder queries (Q) attend to encoder outputs (K, V).",
        explanationID: "Cross-attention memungkinkan satu urutan memperhatikan yang lain. Digunakan dalam arsitektur encoder-decoder dimana query decoder memperhatikan output encoder.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_017",
        questionEN: "Why is attention O(n²) in sequence length?",
        questionID: "Mengapa attention O(n²) dalam panjang urutan?",
        options: [
            QuestionOption(id: "a", textEN: "Every position attends to every other position, creating n×n attention matrix", textID: "Setiap posisi memperhatikan setiap posisi lain, menciptakan matriks attention n×n"),
            QuestionOption(id: "b", textEN: "It uses nested loops", textID: "Menggunakan loop bersarang"),
            QuestionOption(id: "c", textEN: "The model has n² parameters", textID: "Model memiliki n² parameter"),
            QuestionOption(id: "d", textEN: "The gradients are quadratic", textID: "Gradien berbentuk kuadrat")
        ],
        correctOptionId: "a",
        explanationEN: "Computing QK^T requires n×n operations and n×n memory for the attention matrix. This limits practical sequence lengths (2k-8k typically, or special techniques for longer).",
        explanationID: "Menghitung QK^T memerlukan n×n operasi dan memori n×n untuk matriks attention. Ini membatasi panjang urutan praktis.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_018",
        questionEN: "What is additive attention (Bahdanau attention)?",
        questionID: "Apa itu additive attention (Bahdanau attention)?",
        options: [
            QuestionOption(id: "a", textEN: "score = v^T tanh(W_q q + W_k k), using a learned feedforward layer", textID: "score = v^T tanh(W_q q + W_k k), menggunakan layer feedforward yang dipelajari"),
            QuestionOption(id: "b", textEN: "Adding attention scores together", textID: "Menjumlahkan skor attention"),
            QuestionOption(id: "c", textEN: "Adding attention to RNN output", textID: "Menambahkan attention ke output RNN"),
            QuestionOption(id: "d", textEN: "Simple addition of Q and K", textID: "Penjumlahan sederhana Q dan K")
        ],
        correctOptionId: "a",
        explanationEN: "Bahdanau attention uses a small neural network to compute compatibility. More expressive than dot-product but slower. Used in original seq2seq with attention.",
        explanationID: "Bahdanau attention menggunakan neural network kecil untuk menghitung kompatibilitas. Lebih ekspresif dari dot-product tapi lebih lambat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_019",
        questionEN: "What is masked attention?",
        questionID: "Apa itu masked attention?",
        options: [
            QuestionOption(id: "a", textEN: "Preventing attention to certain positions (e.g., future tokens in autoregressive models)", textID: "Mencegah attention ke posisi tertentu (misal: token masa depan dalam model autoregressive)"),
            QuestionOption(id: "b", textEN: "Attention with dropout", textID: "Attention dengan dropout"),
            QuestionOption(id: "c", textEN: "Hiding attention weights", textID: "Menyembunyikan bobot attention"),
            QuestionOption(id: "d", textEN: "Reducing attention computation", textID: "Mengurangi komputasi attention")
        ],
        correctOptionId: "a",
        explanationEN: "Causal mask sets future positions to -∞ before softmax, ensuring zero attention. Padding mask handles variable-length sequences. Essential for autoregressive generation.",
        explanationID: "Causal mask mengatur posisi masa depan ke -∞ sebelum softmax, memastikan attention nol. Padding mask menangani urutan panjang variabel.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_020",
        questionEN: "What is local/sliding window attention?",
        questionID: "Apa itu local/sliding window attention?",
        options: [
            QuestionOption(id: "a", textEN: "Each position only attends to nearby positions within a fixed window", textID: "Setiap posisi hanya memperhatikan posisi terdekat dalam jendela tetap"),
            QuestionOption(id: "b", textEN: "Attention on local variables only", textID: "Attention hanya pada variabel lokal"),
            QuestionOption(id: "c", textEN: "Moving attention through the sequence", textID: "Menggerakkan attention melalui urutan"),
            QuestionOption(id: "d", textEN: "Attention on sliding batches", textID: "Attention pada batch yang bergeser")
        ],
        correctOptionId: "a",
        explanationEN: "Reduces O(n²) to O(n×w) where w is window size. Used in Longformer, BigBird. Captures local context efficiently but needs global tokens for long-range dependencies.",
        explanationID: "Mengurangi O(n²) menjadi O(n×w) dimana w adalah ukuran jendela. Digunakan di Longformer, BigBird. Menangkap konteks lokal secara efisien.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_021",
        questionEN: "What is sparse attention?",
        questionID: "Apa itu sparse attention?",
        options: [
            QuestionOption(id: "a", textEN: "Only computing attention for a subset of position pairs, not all n²", textID: "Hanya menghitung attention untuk subset pasangan posisi, bukan semua n²"),
            QuestionOption(id: "b", textEN: "Attention with sparse weights", textID: "Attention dengan bobot sparse"),
            QuestionOption(id: "c", textEN: "Using sparse matrices for storage", textID: "Menggunakan matriks sparse untuk penyimpanan"),
            QuestionOption(id: "d", textEN: "Attention with low attention scores", textID: "Attention dengan skor attention rendah")
        ],
        correctOptionId: "a",
        explanationEN: "Sparse patterns (local + global, strided, random) reduce complexity from O(n²) to O(n√n) or O(n log n). Examples: Sparse Transformer, BigBird, Longformer.",
        explanationID: "Pola sparse (lokal + global, strided, random) mengurangi kompleksitas dari O(n²) ke O(n√n) atau O(n log n).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_022",
        questionEN: "What is Flash Attention?",
        questionID: "Apa itu Flash Attention?",
        options: [
            QuestionOption(id: "a", textEN: "IO-aware exact attention algorithm using tiling to minimize memory access", textID: "Algoritma attention eksak yang sadar IO menggunakan tiling untuk meminimalkan akses memori"),
            QuestionOption(id: "b", textEN: "Very fast approximate attention", textID: "Attention perkiraan yang sangat cepat"),
            QuestionOption(id: "c", textEN: "Attention with flash memory", textID: "Attention dengan flash memory"),
            QuestionOption(id: "d", textEN: "Single-pass attention", textID: "Attention satu kali lewat")
        ],
        correctOptionId: "a",
        explanationEN: "Flash Attention computes exact attention without materializing the n×n matrix in HBM. Uses tiling and recomputation in SRAM. 2-4x faster, saves significant memory.",
        explanationID: "Flash Attention menghitung attention eksak tanpa mewujudkan matriks n×n di HBM. Menggunakan tiling dan rekomputasi di SRAM. 2-4x lebih cepat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_023",
        questionEN: "What is linear attention?",
        questionID: "Apa itu linear attention?",
        options: [
            QuestionOption(id: "a", textEN: "Approximating softmax attention to achieve O(n) instead of O(n²)", textID: "Mendekati attention softmax untuk mencapai O(n) bukan O(n²)"),
            QuestionOption(id: "b", textEN: "Attention with linear layers only", textID: "Attention dengan layer linear saja"),
            QuestionOption(id: "c", textEN: "One-dimensional attention", textID: "Attention satu dimensi"),
            QuestionOption(id: "d", textEN: "Attention without nonlinearities", textID: "Attention tanpa nonlinearitas")
        ],
        correctOptionId: "a",
        explanationEN: "Using kernel methods: φ(Q)φ(K)^T ≈ QK^T. Computes (φ(K)^T V) first in O(d²n), then φ(Q) × result in O(nd²). Total: O(nd²) instead of O(n²d).",
        explanationID: "Menggunakan metode kernel: φ(Q)φ(K)^T ≈ QK^T. Menghitung (φ(K)^T V) dulu dalam O(d²n), lalu φ(Q) × hasil dalam O(nd²).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_024",
        questionEN: "What is the difference between soft and hard attention?",
        questionID: "Apa perbedaan antara soft dan hard attention?",
        options: [
            QuestionOption(id: "a", textEN: "Soft uses weighted average (differentiable), hard selects one position (sampling-based)", textID: "Soft menggunakan rata-rata tertimbang (differentiable), hard memilih satu posisi (berbasis sampling)"),
            QuestionOption(id: "b", textEN: "Soft is easier to train than hard", textID: "Soft lebih mudah dilatih dari hard"),
            QuestionOption(id: "c", textEN: "Soft uses more memory", textID: "Soft menggunakan lebih banyak memori"),
            QuestionOption(id: "d", textEN: "Hard is more accurate", textID: "Hard lebih akurat")
        ],
        correctOptionId: "a",
        explanationEN: "Soft attention: weighted sum using attention weights (differentiable, standard). Hard attention: categorical selection, requires REINFORCE/RL for training since argmax is non-differentiable.",
        explanationID: "Soft attention: jumlah tertimbang menggunakan bobot attention (differentiable). Hard attention: seleksi kategoris, memerlukan REINFORCE/RL untuk training.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_025",
        questionEN: "What is grouped query attention (GQA)?",
        questionID: "Apa itu grouped query attention (GQA)?",
        options: [
            QuestionOption(id: "a", textEN: "Sharing K and V heads across groups of Q heads to reduce memory", textID: "Berbagi K dan V head di antara grup Q head untuk mengurangi memori"),
            QuestionOption(id: "b", textEN: "Grouping queries by similarity", textID: "Mengelompokkan query berdasarkan kesamaan"),
            QuestionOption(id: "c", textEN: "Multiple queries per attention head", textID: "Beberapa query per attention head"),
            QuestionOption(id: "d", textEN: "Grouping attention layers", textID: "Mengelompokkan layer attention")
        ],
        correctOptionId: "a",
        explanationEN: "GQA is between MHA (all heads unique) and MQA (all heads share K,V). Uses fewer K,V heads than Q heads, reducing KV cache size during inference while maintaining quality.",
        explanationID: "GQA berada di antara MHA (semua head unik) dan MQA (semua head berbagi K,V). Menggunakan lebih sedikit K,V head dari Q head, mengurangi ukuran cache KV.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Transformers (26-40)
    Question(
        id: "seq_026",
        questionEN: "What is the Transformer architecture?",
        questionID: "Apa itu arsitektur Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Attention-based architecture without recurrence, using self-attention and feedforward layers", textID: "Arsitektur berbasis attention tanpa rekurensi, menggunakan self-attention dan layer feedforward"),
            QuestionOption(id: "b", textEN: "A new type of RNN", textID: "Jenis RNN baru"),
            QuestionOption(id: "c", textEN: "CNN for sequence processing", textID: "CNN untuk pemrosesan urutan"),
            QuestionOption(id: "d", textEN: "A combination of RNN and CNN", textID: "Kombinasi RNN dan CNN")
        ],
        correctOptionId: "a",
        explanationEN: "Transformer uses stacked self-attention and FFN layers. Parallelizable (no sequential recurrence), handles long-range dependencies better. Foundation of modern NLP.",
        explanationID: "Transformer menggunakan self-attention dan layer FFN yang ditumpuk. Dapat diparalelkan (tanpa rekurensi sekuensial), menangani dependensi jarak jauh lebih baik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_027",
        questionEN: "What are the components of a Transformer encoder layer?",
        questionID: "Apa komponen layer encoder Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Multi-head self-attention, Add&Norm, Feed-forward network, Add&Norm", textID: "Multi-head self-attention, Add&Norm, Feed-forward network, Add&Norm"),
            QuestionOption(id: "b", textEN: "Convolution and pooling", textID: "Konvolusi dan pooling"),
            QuestionOption(id: "c", textEN: "LSTM cells", textID: "Cell LSTM"),
            QuestionOption(id: "d", textEN: "Only attention layers", textID: "Hanya layer attention")
        ],
        correctOptionId: "a",
        explanationEN: "Each layer: 1) Multi-head self-attention 2) Residual + LayerNorm 3) Position-wise FFN (typically 4d_model hidden) 4) Residual + LayerNorm. Repeated N times.",
        explanationID: "Setiap layer: 1) Multi-head self-attention 2) Residual + LayerNorm 3) FFN position-wise 4) Residual + LayerNorm. Diulang N kali.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_028",
        questionEN: "Why are positional encodings needed in Transformers?",
        questionID: "Mengapa encoding posisi diperlukan dalam Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Self-attention is permutation-invariant; position info must be explicitly added", textID: "Self-attention bersifat permutation-invariant; info posisi harus ditambahkan secara eksplisit"),
            QuestionOption(id: "b", textEN: "To make the model faster", textID: "Untuk membuat model lebih cepat"),
            QuestionOption(id: "c", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "To encode semantic meaning", textID: "Untuk mengkodekan makna semantik")
        ],
        correctOptionId: "a",
        explanationEN: "Self-attention treats input as a set, not a sequence. Positional encodings inject order information so the model knows which position each token occupies.",
        explanationID: "Self-attention memperlakukan input sebagai set, bukan urutan. Encoding posisi menyuntikkan informasi urutan agar model tahu posisi setiap token.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_029",
        questionEN: "What is the formula for sinusoidal positional encoding?",
        questionID: "Apa rumus encoding posisi sinusoidal?",
        options: [
            QuestionOption(id: "a", textEN: "PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(pos/10000^(2i/d))", textID: "PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(pos/10000^(2i/d))"),
            QuestionOption(id: "b", textEN: "PE(pos) = pos / sequence_length", textID: "PE(pos) = pos / panjang_urutan"),
            QuestionOption(id: "c", textEN: "PE(pos) = one_hot(pos)", textID: "PE(pos) = one_hot(pos)"),
            QuestionOption(id: "d", textEN: "PE(pos) = learned_embedding[pos]", textID: "PE(pos) = learned_embedding[pos]")
        ],
        correctOptionId: "a",
        explanationEN: "Sinusoidal PE uses different frequencies for each dimension. Allows the model to easily learn relative positions since PE(pos+k) can be represented as a linear function of PE(pos).",
        explanationID: "PE sinusoidal menggunakan frekuensi berbeda untuk setiap dimensi. Memungkinkan model dengan mudah mempelajari posisi relatif.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_030",
        questionEN: "What is RoPE (Rotary Position Embedding)?",
        questionID: "Apa itu RoPE (Rotary Position Embedding)?",
        options: [
            QuestionOption(id: "a", textEN: "Encoding position by rotating the query and key vectors", textID: "Mengkodekan posisi dengan merotasi vektor query dan key"),
            QuestionOption(id: "b", textEN: "Using rope-like connections", textID: "Menggunakan koneksi seperti tali"),
            QuestionOption(id: "c", textEN: "Position embedding that wraps around", textID: "Embedding posisi yang membungkus"),
            QuestionOption(id: "d", textEN: "Random position embeddings", textID: "Embedding posisi acak")
        ],
        correctOptionId: "a",
        explanationEN: "RoPE applies position-dependent rotation to Q and K. Dot product naturally becomes position-relative: q_m · k_n depends on (m-n). Enables length extrapolation. Used in LLaMA, etc.",
        explanationID: "RoPE menerapkan rotasi bergantung posisi ke Q dan K. Dot product secara alami menjadi relatif posisi: q_m · k_n bergantung pada (m-n).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_031",
        questionEN: "What is a decoder-only Transformer?",
        questionID: "Apa itu Transformer decoder-only?",
        options: [
            QuestionOption(id: "a", textEN: "Transformer with only decoder layers, using causal (masked) self-attention", textID: "Transformer dengan hanya layer decoder, menggunakan self-attention kausal (masked)"),
            QuestionOption(id: "b", textEN: "Transformer without any encoder", textID: "Transformer tanpa encoder sama sekali"),
            QuestionOption(id: "c", textEN: "Transformer for decoding only", textID: "Transformer hanya untuk decoding"),
            QuestionOption(id: "d", textEN: "Simpler version of Transformer", textID: "Versi Transformer yang lebih sederhana")
        ],
        correctOptionId: "a",
        explanationEN: "GPT-style models use decoder-only architecture. Each token only attends to previous tokens (causal mask). Trained for next-token prediction. Used in GPT, LLaMA, Claude.",
        explanationID: "Model gaya GPT menggunakan arsitektur decoder-only. Setiap token hanya memperhatikan token sebelumnya (causal mask). Dilatih untuk prediksi token berikutnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_032",
        questionEN: "What is an encoder-only Transformer?",
        questionID: "Apa itu Transformer encoder-only?",
        options: [
            QuestionOption(id: "a", textEN: "Transformer with only encoder layers, using bidirectional self-attention", textID: "Transformer dengan hanya layer encoder, menggunakan self-attention bidirectional"),
            QuestionOption(id: "b", textEN: "Transformer for encoding input only", textID: "Transformer hanya untuk mengkodekan input"),
            QuestionOption(id: "c", textEN: "Transformer without output", textID: "Transformer tanpa output"),
            QuestionOption(id: "d", textEN: "Autoencoder Transformer", textID: "Transformer autoencoder")
        ],
        correctOptionId: "a",
        explanationEN: "BERT-style models. All tokens attend to all tokens (bidirectional). Good for understanding tasks (classification, NER, QA). Trained with masked language modeling.",
        explanationID: "Model gaya BERT. Semua token memperhatikan semua token (bidirectional). Bagus untuk tugas pemahaman (klasifikasi, NER, QA). Dilatih dengan masked language modeling.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_033",
        questionEN: "What is the purpose of the Feed-Forward Network (FFN) in Transformer?",
        questionID: "Apa tujuan Feed-Forward Network (FFN) dalam Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Add non-linearity and increase model capacity, processing each position independently", textID: "Menambah non-linearitas dan meningkatkan kapasitas model, memproses setiap posisi secara independen"),
            QuestionOption(id: "b", textEN: "To feed information forward only", textID: "Untuk meneruskan informasi ke depan saja"),
            QuestionOption(id: "c", textEN: "To reduce dimensionality", textID: "Untuk mengurangi dimensionalitas"),
            QuestionOption(id: "d", textEN: "To connect encoder and decoder", textID: "Untuk menghubungkan encoder dan decoder")
        ],
        correctOptionId: "a",
        explanationEN: "FFN: x → Linear(d→4d) → ReLU/GELU → Linear(4d→d). Applied independently to each position. Acts as a key-value memory storing knowledge.",
        explanationID: "FFN: x → Linear(d→4d) → ReLU/GELU → Linear(4d→d). Diterapkan secara independen ke setiap posisi. Bertindak sebagai memori key-value menyimpan pengetahuan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_034",
        questionEN: "What is Layer Normalization in Transformers?",
        questionID: "Apa itu Layer Normalization dalam Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing activations across feature dimension for each sample independently", textID: "Menormalisasi aktivasi di dimensi fitur untuk setiap sampel secara independen"),
            QuestionOption(id: "b", textEN: "Normalizing across batch dimension", textID: "Menormalisasi di dimensi batch"),
            QuestionOption(id: "c", textEN: "Normalizing weights", textID: "Menormalisasi bobot"),
            QuestionOption(id: "d", textEN: "Normalizing gradients", textID: "Menormalisasi gradien")
        ],
        correctOptionId: "a",
        explanationEN: "LayerNorm: y = γ(x - μ)/σ + β, computed per sample across features. Unlike BatchNorm (across batch), works with variable sequence lengths and small batches.",
        explanationID: "LayerNorm: y = γ(x - μ)/σ + β, dihitung per sampel di seluruh fitur. Berbeda dengan BatchNorm (di batch), bekerja dengan panjang urutan variabel dan batch kecil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_035",
        questionEN: "What is Pre-LN vs Post-LN Transformer?",
        questionID: "Apa perbedaan Transformer Pre-LN vs Post-LN?",
        options: [
            QuestionOption(id: "a", textEN: "Pre-LN applies LayerNorm before sublayer; Post-LN applies after (original paper)", textID: "Pre-LN menerapkan LayerNorm sebelum sublayer; Post-LN menerapkan setelah (paper asli)"),
            QuestionOption(id: "b", textEN: "Pre-LN is faster to train", textID: "Pre-LN lebih cepat dilatih"),
            QuestionOption(id: "c", textEN: "Post-LN uses more memory", textID: "Post-LN menggunakan lebih banyak memori"),
            QuestionOption(id: "d", textEN: "They produce identical results", textID: "Keduanya menghasilkan hasil identik")
        ],
        correctOptionId: "a",
        explanationEN: "Pre-LN: LN(x) → Sublayer → +x. Easier to train, more stable gradients. Post-LN (original): x → Sublayer → +x → LN. Needs warmup but sometimes better final performance.",
        explanationID: "Pre-LN: LN(x) → Sublayer → +x. Lebih mudah dilatih, gradien lebih stabil. Post-LN (asli): x → Sublayer → +x → LN. Perlu warmup tapi kadang performa akhir lebih baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_036",
        questionEN: "What is the KV cache in Transformer inference?",
        questionID: "Apa itu KV cache dalam inferensi Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Caching Key and Value matrices from previous tokens to avoid recomputation", textID: "Menyimpan matriks Key dan Value dari token sebelumnya untuk menghindari komputasi ulang"),
            QuestionOption(id: "b", textEN: "Caching model weights", textID: "Menyimpan bobot model"),
            QuestionOption(id: "c", textEN: "Keyboard-value pairs", textID: "Pasangan keyboard-value"),
            QuestionOption(id: "d", textEN: "Caching attention scores", textID: "Menyimpan skor attention")
        ],
        correctOptionId: "a",
        explanationEN: "During autoregressive generation, K and V for past tokens don't change. Caching them reduces per-token complexity from O(n²) to O(n). Major memory cost for long contexts.",
        explanationID: "Selama generasi autoregressive, K dan V untuk token sebelumnya tidak berubah. Menyimpannya mengurangi kompleksitas per token dari O(n²) ke O(n).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_037",
        questionEN: "What is MoE (Mixture of Experts) in Transformers?",
        questionID: "Apa itu MoE (Mixture of Experts) dalam Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Replacing FFN with multiple expert FFNs, routing each token to top-k experts", textID: "Mengganti FFN dengan beberapa expert FFN, merutekan setiap token ke top-k expert"),
            QuestionOption(id: "b", textEN: "Ensemble of Transformer models", textID: "Ensemble model Transformer"),
            QuestionOption(id: "c", textEN: "Multiple attention heads", textID: "Beberapa attention head"),
            QuestionOption(id: "d", textEN: "Expert-designed architectures", textID: "Arsitektur yang dirancang ahli")
        ],
        correctOptionId: "a",
        explanationEN: "MoE scales parameters without proportionally scaling compute. A router selects top-k experts per token. Mixtral, GPT-4 (rumored) use this. Challenges: load balancing, routing.",
        explanationID: "MoE menskala parameter tanpa menskala komputasi secara proporsional. Router memilih top-k expert per token. Mixtral, GPT-4 (rumor) menggunakan ini.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_038",
        questionEN: "What is the difference between BERT and GPT?",
        questionID: "Apa perbedaan antara BERT dan GPT?",
        options: [
            QuestionOption(id: "a", textEN: "BERT is encoder-only (bidirectional, MLM), GPT is decoder-only (causal, next-token)", textID: "BERT adalah encoder-only (bidirectional, MLM), GPT adalah decoder-only (kausal, token-berikutnya)"),
            QuestionOption(id: "b", textEN: "BERT is larger than GPT", textID: "BERT lebih besar dari GPT"),
            QuestionOption(id: "c", textEN: "GPT came before BERT", textID: "GPT muncul sebelum BERT"),
            QuestionOption(id: "d", textEN: "They use different attention mechanisms", textID: "Mereka menggunakan mekanisme attention berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "BERT: encoder, sees all tokens, trained with Masked LM, good for understanding. GPT: decoder, sees only past, trained with next-token prediction, good for generation.",
        explanationID: "BERT: encoder, melihat semua token, dilatih dengan Masked LM, bagus untuk pemahaman. GPT: decoder, melihat hanya masa lalu, dilatih dengan prediksi token berikutnya, bagus untuk generasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_039",
        questionEN: "What is T5's approach to NLP tasks?",
        questionID: "Apa pendekatan T5 untuk tugas NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Text-to-text: frame all tasks as text generation (translate, summarize, classify → text output)", textID: "Text-to-text: membingkai semua tugas sebagai generasi teks"),
            QuestionOption(id: "b", textEN: "Task-specific heads for each task", textID: "Head spesifik tugas untuk setiap tugas"),
            QuestionOption(id: "c", textEN: "Only classification tasks", textID: "Hanya tugas klasifikasi"),
            QuestionOption(id: "d", textEN: "Separate models per task", textID: "Model terpisah per tugas")
        ],
        correctOptionId: "a",
        explanationEN: "T5 (Text-to-Text Transfer Transformer) uses encoder-decoder architecture and frames every NLP task as generating text. Input: 'translate English to German: The house' Output: 'Das Haus'.",
        explanationID: "T5 menggunakan arsitektur encoder-decoder dan membingkai setiap tugas NLP sebagai menghasilkan teks.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_040",
        questionEN: "What is ALiBi (Attention with Linear Biases)?",
        questionID: "Apa itu ALiBi (Attention with Linear Biases)?",
        options: [
            QuestionOption(id: "a", textEN: "Adding position-dependent bias to attention scores instead of positional embeddings", textID: "Menambahkan bias bergantung posisi ke skor attention bukan embedding posisi"),
            QuestionOption(id: "b", textEN: "Linear attention with bias", textID: "Attention linear dengan bias"),
            QuestionOption(id: "c", textEN: "Aliasing in attention", textID: "Aliasing dalam attention"),
            QuestionOption(id: "d", textEN: "Automatic bias learning", textID: "Pembelajaran bias otomatis")
        ],
        correctOptionId: "a",
        explanationEN: "ALiBi adds -m|i-j| bias to attention scores (closer = higher attention). No learned position embeddings needed. Enables better length extrapolation than sinusoidal/learned PE.",
        explanationID: "ALiBi menambahkan bias -m|i-j| ke skor attention (lebih dekat = attention lebih tinggi). Tidak perlu embedding posisi yang dipelajari. Memungkinkan ekstrapolasi panjang lebih baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Applications & Advanced (41-50)
    Question(
        id: "seq_041",
        questionEN: "What is sequence-to-sequence (seq2seq) learning?",
        questionID: "Apa itu pembelajaran sequence-to-sequence (seq2seq)?",
        options: [
            QuestionOption(id: "a", textEN: "Mapping variable-length input sequence to variable-length output sequence", textID: "Memetakan urutan input panjang variabel ke urutan output panjang variabel"),
            QuestionOption(id: "b", textEN: "Processing sequences one at a time", textID: "Memproses urutan satu per satu"),
            QuestionOption(id: "c", textEN: "Converting sequences to fixed-length vectors", textID: "Mengonversi urutan ke vektor panjang tetap"),
            QuestionOption(id: "d", textEN: "Classifying sequences", textID: "Mengklasifikasikan urutan")
        ],
        correctOptionId: "a",
        explanationEN: "Seq2seq handles tasks like translation, summarization where input and output lengths differ. Encoder processes input; decoder generates output autoregressively.",
        explanationID: "Seq2seq menangani tugas seperti terjemahan, ringkasan dimana panjang input dan output berbeda. Encoder memproses input; decoder menghasilkan output secara autoregressive.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_042",
        questionEN: "What is beam search?",
        questionID: "Apa itu beam search?",
        options: [
            QuestionOption(id: "a", textEN: "Keeping top-k most likely partial sequences at each step, exploring multiple hypotheses", textID: "Menyimpan k urutan parsial paling mungkin di setiap langkah, mengeksplorasi beberapa hipotesis"),
            QuestionOption(id: "b", textEN: "Searching with a flashlight", textID: "Mencari dengan senter"),
            QuestionOption(id: "c", textEN: "Greedy decoding with backtracking", textID: "Decoding greedy dengan backtracking"),
            QuestionOption(id: "d", textEN: "Random sampling from output", textID: "Sampling acak dari output")
        ],
        correctOptionId: "a",
        explanationEN: "Beam search keeps top-k candidates (beam width). More thorough than greedy but not exhaustive. Trade-off: larger beam = better approximation but slower. Common: beam=4-5.",
        explanationID: "Beam search menyimpan k kandidat teratas (beam width). Lebih teliti dari greedy tapi tidak exhaustive. Trade-off: beam lebih besar = perkiraan lebih baik tapi lebih lambat.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_043",
        questionEN: "What is nucleus sampling (top-p sampling)?",
        questionID: "Apa itu nucleus sampling (top-p sampling)?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling from the smallest set of tokens whose cumulative probability exceeds p", textID: "Sampling dari set token terkecil yang probabilitas kumulatifnya melebihi p"),
            QuestionOption(id: "b", textEN: "Sampling from the top k tokens", textID: "Sampling dari k token teratas"),
            QuestionOption(id: "c", textEN: "Sampling from the nucleus of the model", textID: "Sampling dari inti model"),
            QuestionOption(id: "d", textEN: "Random uniform sampling", textID: "Sampling seragam acak")
        ],
        correctOptionId: "a",
        explanationEN: "Top-p dynamically selects from tokens until cumulative probability ≥ p. Adapts to distribution shape (flat vs peaked). Often p=0.9. More diverse than top-k.",
        explanationID: "Top-p secara dinamis memilih dari token sampai probabilitas kumulatif ≥ p. Beradaptasi dengan bentuk distribusi. Sering p=0.9. Lebih beragam dari top-k.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_044",
        questionEN: "What is temperature in text generation?",
        questionID: "Apa itu temperature dalam generasi teks?",
        options: [
            QuestionOption(id: "a", textEN: "Scaling factor for logits before softmax: higher = more random, lower = more deterministic", textID: "Faktor skala untuk logit sebelum softmax: lebih tinggi = lebih acak, lebih rendah = lebih deterministik"),
            QuestionOption(id: "b", textEN: "GPU temperature during training", textID: "Suhu GPU selama training"),
            QuestionOption(id: "c", textEN: "Learning rate multiplier", textID: "Pengali learning rate"),
            QuestionOption(id: "d", textEN: "Model size parameter", textID: "Parameter ukuran model")
        ],
        correctOptionId: "a",
        explanationEN: "P(token) = softmax(logits/T). T→0: greedy (peak at max). T=1: original distribution. T→∞: uniform. Controls creativity vs consistency trade-off.",
        explanationID: "P(token) = softmax(logits/T). T→0: greedy (puncak di max). T=1: distribusi asli. T→∞: seragam. Mengontrol trade-off kreativitas vs konsistensi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_045",
        questionEN: "What is causal language modeling?",
        questionID: "Apa itu causal language modeling?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting next token given previous tokens (autoregressive, left-to-right)", textID: "Memprediksi token berikutnya diberikan token sebelumnya (autoregressive, kiri-ke-kanan)"),
            QuestionOption(id: "b", textEN: "Modeling causal relationships", textID: "Memodelkan hubungan kausal"),
            QuestionOption(id: "c", textEN: "Predicting masked tokens", textID: "Memprediksi token yang dimasking"),
            QuestionOption(id: "d", textEN: "Bidirectional language modeling", textID: "Language modeling bidirectional")
        ],
        correctOptionId: "a",
        explanationEN: "CLM objective: maximize P(x_t | x_<t). Used by GPT-style models. Enables generation by sampling next token repeatedly. Foundation of modern LLMs.",
        explanationID: "Objektif CLM: maksimalkan P(x_t | x_<t). Digunakan oleh model gaya GPT. Memungkinkan generasi dengan sampling token berikutnya berulang kali.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "seq_046",
        questionEN: "What is masked language modeling (MLM)?",
        questionID: "Apa itu masked language modeling (MLM)?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting randomly masked tokens using bidirectional context", textID: "Memprediksi token yang dimasking secara acak menggunakan konteks bidirectional"),
            QuestionOption(id: "b", textEN: "Masking the model weights", textID: "Memasking bobot model"),
            QuestionOption(id: "c", textEN: "Next token prediction", textID: "Prediksi token berikutnya"),
            QuestionOption(id: "d", textEN: "Hiding model outputs", textID: "Menyembunyikan output model")
        ],
        correctOptionId: "a",
        explanationEN: "BERT's training objective: randomly mask 15% of tokens (80% [MASK], 10% random, 10% unchanged), predict original token. Uses full bidirectional context.",
        explanationID: "Objektif training BERT: secara acak memasking 15% token (80% [MASK], 10% acak, 10% tidak diubah), memprediksi token asli. Menggunakan konteks bidirectional penuh.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_047",
        questionEN: "What is prefix tuning?",
        questionID: "Apa itu prefix tuning?",
        options: [
            QuestionOption(id: "a", textEN: "Training only a learned prefix (virtual tokens) while freezing the model", textID: "Melatih hanya prefix yang dipelajari (token virtual) sambil membekukan model"),
            QuestionOption(id: "b", textEN: "Adding prefixes to input text", textID: "Menambahkan prefix ke teks input"),
            QuestionOption(id: "c", textEN: "Tuning the first layers only", textID: "Menyetel hanya layer pertama"),
            QuestionOption(id: "d", textEN: "Pre-training with prefixes", textID: "Pre-training dengan prefix")
        ],
        correctOptionId: "a",
        explanationEN: "Prefix tuning learns continuous task-specific prefixes prepended to keys/values at each layer. Only 0.1% parameters trained. Efficient for multi-task with shared base model.",
        explanationID: "Prefix tuning mempelajari prefix kontinu spesifik tugas yang ditambahkan ke key/value di setiap layer. Hanya 0.1% parameter yang dilatih.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_048",
        questionEN: "What is LoRA (Low-Rank Adaptation)?",
        questionID: "Apa itu LoRA (Low-Rank Adaptation)?",
        options: [
            QuestionOption(id: "a", textEN: "Adding trainable low-rank matrices to frozen model weights: W + AB where rank(AB) << rank(W)", textID: "Menambahkan matriks low-rank yang dapat dilatih ke bobot model beku: W + AB dimana rank(AB) << rank(W)"),
            QuestionOption(id: "b", textEN: "Low-resolution training", textID: "Training resolusi rendah"),
            QuestionOption(id: "c", textEN: "Reducing model layers", textID: "Mengurangi layer model"),
            QuestionOption(id: "d", textEN: "Local rank adaptation", textID: "Adaptasi rank lokal")
        ],
        correctOptionId: "a",
        explanationEN: "LoRA decomposes weight updates as ΔW = BA where B ∈ R^(d×r), A ∈ R^(r×k), r << min(d,k). Only ~0.1% new parameters. Efficient fine-tuning, merges at inference.",
        explanationID: "LoRA mendekomposisi pembaruan bobot sebagai ΔW = BA dimana B ∈ R^(d×r), A ∈ R^(r×k), r << min(d,k). Hanya ~0.1% parameter baru.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "seq_049",
        questionEN: "What is the purpose of the CLS token in BERT?",
        questionID: "Apa tujuan token CLS dalam BERT?",
        options: [
            QuestionOption(id: "a", textEN: "Special token whose final hidden state represents the entire sequence for classification", textID: "Token khusus yang hidden state akhirnya merepresentasikan seluruh urutan untuk klasifikasi"),
            QuestionOption(id: "b", textEN: "Token to close the sequence", textID: "Token untuk menutup urutan"),
            QuestionOption(id: "c", textEN: "Classification label", textID: "Label klasifikasi"),
            QuestionOption(id: "d", textEN: "Clustering token", textID: "Token clustering")
        ],
        correctOptionId: "a",
        explanationEN: "[CLS] is prepended to input. Its final representation aggregates sequence info via self-attention, used as input to classification head. For classification/regression tasks.",
        explanationID: "[CLS] ditambahkan di awal input. Representasi akhirnya mengagregasi info urutan via self-attention, digunakan sebagai input ke classification head.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "seq_050",
        questionEN: "What is speculative decoding?",
        questionID: "Apa itu speculative decoding?",
        options: [
            QuestionOption(id: "a", textEN: "Using a small model to draft tokens, large model to verify, accepting/rejecting in parallel", textID: "Menggunakan model kecil untuk membuat draft token, model besar untuk memverifikasi, menerima/menolak secara paralel"),
            QuestionOption(id: "b", textEN: "Guessing random tokens", textID: "Menebak token acak"),
            QuestionOption(id: "c", textEN: "Parallel beam search", textID: "Beam search paralel"),
            QuestionOption(id: "d", textEN: "Speculating about future tokens", textID: "Berspekulasi tentang token masa depan")
        ],
        correctOptionId: "a",
        explanationEN: "Draft model generates k tokens quickly. Target model verifies all k in one forward pass (parallel). Accept matching tokens, reject/resample from mismatch point. 2-3x speedup possible.",
        explanationID: "Model draft menghasilkan k token dengan cepat. Model target memverifikasi semua k dalam satu forward pass (paralel). Menerima token yang cocok, menolak/resample dari titik ketidakcocokan.",
        topic: "aiMlDl",
        difficulty: .advanced
    )
]
