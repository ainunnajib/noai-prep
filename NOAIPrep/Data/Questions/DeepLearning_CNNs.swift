import Foundation

// MARK: - Deep Learning: CNNs & Architectures Questions (50 questions)
// Aligned with IOAI/NOAI Syllabus: Convolutional Neural Networks, Pooling, Architectures (ResNet, VGG, etc.)
let cnnArchitectureQuestions: [Question] = [
    // Convolution Basics
    Question(
        id: "cnn001",
        questionEN: "A convolution operation in CNNs computes:",
        questionID: "Operasi konvolusi dalam CNN menghitung:",
        options: [
            QuestionOption(id: "a", textEN: "Element-wise multiplication of kernel with input patch, then sum", textID: "Perkalian elemen-wise kernel dengan patch input, lalu jumlah"),
            QuestionOption(id: "b", textEN: "Matrix multiplication of entire input", textID: "Perkalian matriks seluruh input"),
            QuestionOption(id: "c", textEN: "Division of input by kernel", textID: "Pembagian input oleh kernel"),
            QuestionOption(id: "d", textEN: "Random sampling of input", textID: "Pengambilan sampel acak input")
        ],
        correctOptionId: "a",
        explanationEN: "Conv: slide kernel over input, compute dot product at each position. Output = Σ(input patch × kernel).",
        explanationID: "Conv: geser kernel over input, hitung dot product di setiap posisi. Output = Σ(patch input × kernel).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn002",
        questionEN: "For input 32×32×3 with 64 filters of size 3×3, stride 1, padding 'same', output shape is:",
        questionID: "Untuk input 32×32×3 dengan 64 filter ukuran 3×3, stride 1, padding 'same', bentuk output adalah:",
        options: [
            QuestionOption(id: "a", textEN: "32×32×64", textID: "32×32×64"),
            QuestionOption(id: "b", textEN: "30×30×64", textID: "30×30×64"),
            QuestionOption(id: "c", textEN: "32×32×3", textID: "32×32×3"),
            QuestionOption(id: "d", textEN: "64×64×3", textID: "64×64×3")
        ],
        correctOptionId: "a",
        explanationEN: "Same padding preserves spatial dimensions. 64 filters → 64 output channels. Result: 32×32×64.",
        explanationID: "Same padding mempertahankan dimensi spasial. 64 filter → 64 channel output. Hasil: 32×32×64.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn003",
        questionEN: "The formula for output size with no padding is:",
        questionID: "Rumus untuk ukuran output tanpa padding adalah:",
        options: [
            QuestionOption(id: "a", textEN: "(W - K) / S + 1, where W=input, K=kernel, S=stride", textID: "(W - K) / S + 1, dimana W=input, K=kernel, S=stride"),
            QuestionOption(id: "b", textEN: "W × K × S", textID: "W × K × S"),
            QuestionOption(id: "c", textEN: "W + K + S", textID: "W + K + S"),
            QuestionOption(id: "d", textEN: "W / K", textID: "W / K")
        ],
        correctOptionId: "a",
        explanationEN: "Output size = floor((W - K + 2P) / S) + 1. With P=0 (no padding): (W - K) / S + 1.",
        explanationID: "Ukuran output = floor((W - K + 2P) / S) + 1. Dengan P=0 (tanpa padding): (W - K) / S + 1.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn004",
        questionEN: "A 3×3 convolution on a 224×224×3 input with 64 filters has how many parameters?",
        questionID: "Konvolusi 3×3 pada input 224×224×3 dengan 64 filter memiliki berapa parameter?",
        options: [
            QuestionOption(id: "a", textEN: "1792 (3×3×3×64 + 64 biases)", textID: "1792 (3×3×3×64 + 64 bias)"),
            QuestionOption(id: "b", textEN: "576", textID: "576"),
            QuestionOption(id: "c", textEN: "1728", textID: "1728"),
            QuestionOption(id: "d", textEN: "224×224×64", textID: "224×224×64")
        ],
        correctOptionId: "a",
        explanationEN: "Each filter: 3×3×3 = 27 weights + 1 bias = 28. Total: 64 filters × 27 + 64 biases = 1728 + 64 = 1792.",
        explanationID: "Setiap filter: 3×3×3 = 27 bobot + 1 bias = 28. Total: 64 filter × 27 + 64 bias = 1728 + 64 = 1792.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn005",
        questionEN: "Parameter sharing in convolutions means:",
        questionID: "Parameter sharing dalam konvolusi berarti:",
        options: [
            QuestionOption(id: "a", textEN: "Same kernel weights are used across all spatial positions", textID: "Bobot kernel yang sama digunakan di semua posisi spasial"),
            QuestionOption(id: "b", textEN: "Weights are shared between different layers", textID: "Bobot dibagi antara layer berbeda"),
            QuestionOption(id: "c", textEN: "All channels share the same filter", textID: "Semua channel berbagi filter yang sama"),
            QuestionOption(id: "d", textEN: "Parameters are copied during training", textID: "Parameter disalin selama training")
        ],
        correctOptionId: "a",
        explanationEN: "One kernel scans entire image. Reduces parameters vs fully connected. Assumes translation equivariance.",
        explanationID: "Satu kernel memindai seluruh gambar. Mengurangi parameter vs fully connected. Mengasumsikan ekuivariansi translasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn006",
        questionEN: "Stride in convolution controls:",
        questionID: "Stride dalam konvolusi mengontrol:",
        options: [
            QuestionOption(id: "a", textEN: "How many pixels the kernel moves between applications", textID: "Berapa piksel kernel bergerak antara aplikasi"),
            QuestionOption(id: "b", textEN: "The size of the kernel", textID: "Ukuran kernel"),
            QuestionOption(id: "c", textEN: "The number of filters", textID: "Jumlah filter"),
            QuestionOption(id: "d", textEN: "The activation function", textID: "Fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Stride = step size. Stride 2 → output half the size (downsampling). Stride 1 → output similar size.",
        explanationID: "Stride = ukuran langkah. Stride 2 → output setengah ukuran (downsampling). Stride 1 → output ukuran serupa.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn007",
        questionEN: "Dilated (atrous) convolution increases receptive field by:",
        questionID: "Konvolusi dilated (atrous) meningkatkan receptive field dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Inserting gaps between kernel elements", textID: "Menyisipkan celah antara elemen kernel"),
            QuestionOption(id: "b", textEN: "Using larger kernels", textID: "Menggunakan kernel lebih besar"),
            QuestionOption(id: "c", textEN: "Increasing stride", textID: "Meningkatkan stride"),
            QuestionOption(id: "d", textEN: "Adding more layers", textID: "Menambahkan lebih banyak layer")
        ],
        correctOptionId: "a",
        explanationEN: "Dilation rate r: kernel elements spaced r pixels apart. Same parameters, larger receptive field.",
        explanationID: "Dilation rate r: elemen kernel berjarak r piksel. Parameter sama, receptive field lebih besar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn008",
        questionEN: "1×1 convolutions are useful for:",
        questionID: "Konvolusi 1×1 berguna untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Changing number of channels without affecting spatial dimensions", textID: "Mengubah jumlah channel tanpa mempengaruhi dimensi spasial"),
            QuestionOption(id: "b", textEN: "Increasing spatial resolution", textID: "Meningkatkan resolusi spasial"),
            QuestionOption(id: "c", textEN: "Detecting edges", textID: "Mendeteksi tepi"),
            QuestionOption(id: "d", textEN: "Pooling operations", textID: "Operasi pooling")
        ],
        correctOptionId: "a",
        explanationEN: "1×1 conv = channel-wise linear combination. Reduces/expands channels. Used in bottleneck, Inception.",
        explanationID: "Conv 1×1 = kombinasi linear channel-wise. Mengurangi/memperluas channel. Digunakan dalam bottleneck, Inception.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn009",
        questionEN: "Depthwise separable convolution consists of:",
        questionID: "Konvolusi depthwise separable terdiri dari:",
        options: [
            QuestionOption(id: "a", textEN: "Depthwise conv (per-channel) followed by 1×1 pointwise conv", textID: "Conv depthwise (per-channel) diikuti conv pointwise 1×1"),
            QuestionOption(id: "b", textEN: "Two 3×3 convolutions", textID: "Dua konvolusi 3×3"),
            QuestionOption(id: "c", textEN: "Pooling then convolution", textID: "Pooling lalu konvolusi"),
            QuestionOption(id: "d", textEN: "Only 1×1 convolutions", textID: "Hanya konvolusi 1×1")
        ],
        correctOptionId: "a",
        explanationEN: "Depthwise: one filter per input channel. Pointwise: 1×1 to mix channels. Much fewer parameters.",
        explanationID: "Depthwise: satu filter per channel input. Pointwise: 1×1 untuk mencampur channel. Parameter jauh lebih sedikit.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn010",
        questionEN: "Transposed convolution (deconvolution) is used for:",
        questionID: "Transposed convolution (deconvolution) digunakan untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Upsampling / increasing spatial dimensions", textID: "Upsampling / meningkatkan dimensi spasial"),
            QuestionOption(id: "b", textEN: "Downsampling", textID: "Downsampling"),
            QuestionOption(id: "c", textEN: "Channel reduction", textID: "Pengurangan channel"),
            QuestionOption(id: "d", textEN: "Inverting the network", textID: "Membalikkan jaringan")
        ],
        correctOptionId: "a",
        explanationEN: "Transposed conv goes from small to large spatial size. Used in decoders, GANs, segmentation.",
        explanationID: "Transposed conv pergi dari ukuran spasial kecil ke besar. Digunakan dalam decoder, GAN, segmentasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Pooling
    Question(
        id: "cnn011",
        questionEN: "Max pooling with 2×2 window and stride 2:",
        questionID: "Max pooling dengan window 2×2 dan stride 2:",
        options: [
            QuestionOption(id: "a", textEN: "Reduces spatial dimensions by half, keeps max value per region", textID: "Mengurangi dimensi spasial setengah, menyimpan nilai maks per wilayah"),
            QuestionOption(id: "b", textEN: "Doubles spatial dimensions", textID: "Menggandakan dimensi spasial"),
            QuestionOption(id: "c", textEN: "Averages all values", textID: "Merata-ratakan semua nilai"),
            QuestionOption(id: "d", textEN: "Adds channels", textID: "Menambahkan channel")
        ],
        correctOptionId: "a",
        explanationEN: "Max pool 2×2 stride 2: take max of each 2×2 region. Output is half the size. Provides translation invariance.",
        explanationID: "Max pool 2×2 stride 2: ambil maks dari setiap wilayah 2×2. Output setengah ukuran. Memberikan invariansi translasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn012",
        questionEN: "Average pooling differs from max pooling by:",
        questionID: "Average pooling berbeda dari max pooling dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Computing mean instead of maximum of the pooling region", textID: "Menghitung mean bukan maksimum dari wilayah pooling"),
            QuestionOption(id: "b", textEN: "Using larger windows", textID: "Menggunakan window lebih besar"),
            QuestionOption(id: "c", textEN: "Not reducing dimensions", textID: "Tidak mengurangi dimensi"),
            QuestionOption(id: "d", textEN: "Requiring more parameters", textID: "Memerlukan lebih banyak parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Avg pool computes mean. Max pool is more common in classification; avg pool often used at end (global).",
        explanationID: "Avg pool menghitung mean. Max pool lebih umum dalam klasifikasi; avg pool sering digunakan di akhir (global).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn013",
        questionEN: "Global average pooling at the end of a CNN:",
        questionID: "Global average pooling di akhir CNN:",
        options: [
            QuestionOption(id: "a", textEN: "Reduces each channel to a single value (average over spatial dims)", textID: "Mengurangi setiap channel menjadi nilai tunggal (rata-rata atas dimensi spasial)"),
            QuestionOption(id: "b", textEN: "Increases spatial resolution", textID: "Meningkatkan resolusi spasial"),
            QuestionOption(id: "c", textEN: "Adds more layers", textID: "Menambahkan lebih banyak layer"),
            QuestionOption(id: "d", textEN: "Is used only for segmentation", textID: "Hanya digunakan untuk segmentasi")
        ],
        correctOptionId: "a",
        explanationEN: "GAP: H×W×C → 1×1×C. Replaces fully connected layers. Fewer parameters, works with any input size.",
        explanationID: "GAP: H×W×C → 1×1×C. Menggantikan fully connected layer. Parameter lebih sedikit, bekerja dengan ukuran input apapun.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn014",
        questionEN: "Pooling layers have:",
        questionID: "Layer pooling memiliki:",
        options: [
            QuestionOption(id: "a", textEN: "No learnable parameters", textID: "Tidak ada parameter yang dapat dipelajari"),
            QuestionOption(id: "b", textEN: "Same parameters as convolution", textID: "Parameter sama dengan konvolusi"),
            QuestionOption(id: "c", textEN: "Only bias parameters", textID: "Hanya parameter bias"),
            QuestionOption(id: "d", textEN: "More parameters than fully connected", textID: "Parameter lebih banyak dari fully connected")
        ],
        correctOptionId: "a",
        explanationEN: "Pooling (max/avg) uses fixed operation, no learned weights. Reduces spatial size and provides invariance.",
        explanationID: "Pooling (max/avg) menggunakan operasi tetap, tidak ada bobot yang dipelajari. Mengurangi ukuran spasial dan memberikan invariansi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // CNN Architectures
    Question(
        id: "cnn015",
        questionEN: "VGGNet's key design principle is:",
        questionID: "Prinsip desain kunci VGGNet adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Using only 3×3 convolutions stacked deeply", textID: "Menggunakan hanya konvolusi 3×3 yang ditumpuk dalam"),
            QuestionOption(id: "b", textEN: "Using large 11×11 filters", textID: "Menggunakan filter besar 11×11"),
            QuestionOption(id: "c", textEN: "Skip connections", textID: "Skip connection"),
            QuestionOption(id: "d", textEN: "Inception modules", textID: "Modul Inception")
        ],
        correctOptionId: "a",
        explanationEN: "VGG: simple architecture with 3×3 convs (two 3×3 = one 5×5 receptive field, fewer params). 16/19 layers.",
        explanationID: "VGG: arsitektur sederhana dengan conv 3×3 (dua 3×3 = satu receptive field 5×5, parameter lebih sedikit). 16/19 layer.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn016",
        questionEN: "The key innovation in ResNet is:",
        questionID: "Inovasi kunci dalam ResNet adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Residual (skip) connections that add input to output", textID: "Residual (skip) connection yang menambahkan input ke output"),
            QuestionOption(id: "b", textEN: "Larger filters", textID: "Filter lebih besar"),
            QuestionOption(id: "c", textEN: "Removing pooling", textID: "Menghapus pooling"),
            QuestionOption(id: "d", textEN: "Using only 1×1 convolutions", textID: "Hanya menggunakan konvolusi 1×1")
        ],
        correctOptionId: "a",
        explanationEN: "ResNet: y = F(x) + x. Identity shortcut enables training very deep nets (50, 101, 152 layers).",
        explanationID: "ResNet: y = F(x) + x. Shortcut identitas memungkinkan training jaringan sangat dalam (50, 101, 152 layer).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn017",
        questionEN: "Why do residual connections help train deeper networks?",
        questionID: "Mengapa residual connection membantu melatih jaringan lebih dalam?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients can flow directly through the shortcut, avoiding vanishing", textID: "Gradien dapat mengalir langsung melalui shortcut, menghindari vanishing"),
            QuestionOption(id: "b", textEN: "They add more parameters", textID: "Mereka menambahkan lebih banyak parameter"),
            QuestionOption(id: "c", textEN: "They replace activation functions", textID: "Mereka menggantikan fungsi aktivasi"),
            QuestionOption(id: "d", textEN: "They reduce computation", textID: "Mereka mengurangi komputasi")
        ],
        correctOptionId: "a",
        explanationEN: "Skip connections provide gradient highway. ∂y/∂x = ∂F/∂x + 1. Even if ∂F/∂x ≈ 0, gradient still flows.",
        explanationID: "Skip connection menyediakan jalan raya gradien. ∂y/∂x = ∂F/∂x + 1. Bahkan jika ∂F/∂x ≈ 0, gradien tetap mengalir.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn018",
        questionEN: "Inception/GoogLeNet uses:",
        questionID: "Inception/GoogLeNet menggunakan:",
        options: [
            QuestionOption(id: "a", textEN: "Parallel convolutions of different sizes concatenated together", textID: "Konvolusi paralel dengan ukuran berbeda yang digabungkan"),
            QuestionOption(id: "b", textEN: "Only 3×3 convolutions", textID: "Hanya konvolusi 3×3"),
            QuestionOption(id: "c", textEN: "Residual connections", textID: "Residual connection"),
            QuestionOption(id: "d", textEN: "Recurrent layers", textID: "Layer rekuren")
        ],
        correctOptionId: "a",
        explanationEN: "Inception module: 1×1, 3×3, 5×5 convs and pooling in parallel, then concatenate. Multi-scale features.",
        explanationID: "Modul Inception: conv 1×1, 3×3, 5×5 dan pooling secara paralel, lalu gabungkan. Fitur multi-skala.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn019",
        questionEN: "DenseNet connects each layer to:",
        questionID: "DenseNet menghubungkan setiap layer ke:",
        options: [
            QuestionOption(id: "a", textEN: "All subsequent layers (dense connections)", textID: "Semua layer berikutnya (koneksi padat)"),
            QuestionOption(id: "b", textEN: "Only the next layer", textID: "Hanya layer berikutnya"),
            QuestionOption(id: "c", textEN: "Only the output layer", textID: "Hanya layer output"),
            QuestionOption(id: "d", textEN: "Random layers", textID: "Layer acak")
        ],
        correctOptionId: "a",
        explanationEN: "DenseNet: each layer receives features from all preceding layers. Encourages feature reuse, fewer parameters.",
        explanationID: "DenseNet: setiap layer menerima fitur dari semua layer sebelumnya. Mendorong penggunaan ulang fitur, parameter lebih sedikit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn020",
        questionEN: "EfficientNet scales networks by:",
        questionID: "EfficientNet menskalakan jaringan dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Compound scaling of depth, width, and resolution together", textID: "Penskalaan gabungan kedalaman, lebar, dan resolusi bersama"),
            QuestionOption(id: "b", textEN: "Only increasing depth", textID: "Hanya meningkatkan kedalaman"),
            QuestionOption(id: "c", textEN: "Only increasing width", textID: "Hanya meningkatkan lebar"),
            QuestionOption(id: "d", textEN: "Removing layers", textID: "Menghapus layer")
        ],
        correctOptionId: "a",
        explanationEN: "EfficientNet uses neural architecture search to find compound scaling coefficients. Balanced scaling is key.",
        explanationID: "EfficientNet menggunakan neural architecture search untuk menemukan koefisien penskalaan gabungan. Penskalaan seimbang adalah kunci.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Object Detection
    Question(
        id: "cnn021",
        questionEN: "Region-based CNNs (R-CNN) for object detection:",
        questionID: "Region-based CNN (R-CNN) untuk deteksi objek:",
        options: [
            QuestionOption(id: "a", textEN: "Extract region proposals, then classify each with CNN", textID: "Ekstrak proposal wilayah, lalu klasifikasikan masing-masing dengan CNN"),
            QuestionOption(id: "b", textEN: "Process entire image in one pass", textID: "Memproses seluruh gambar dalam satu lintasan"),
            QuestionOption(id: "c", textEN: "Use only fully connected layers", textID: "Hanya menggunakan fully connected layer"),
            QuestionOption(id: "d", textEN: "Detect only one object", textID: "Hanya mendeteksi satu objek")
        ],
        correctOptionId: "a",
        explanationEN: "R-CNN: selective search → CNN features per region → SVM classification. Slow. Faster R-CNN shares computation.",
        explanationID: "R-CNN: selective search → fitur CNN per wilayah → klasifikasi SVM. Lambat. Faster R-CNN berbagi komputasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn022",
        questionEN: "YOLO (You Only Look Once) differs from R-CNN by:",
        questionID: "YOLO (You Only Look Once) berbeda dari R-CNN dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Processing entire image in single forward pass", textID: "Memproses seluruh gambar dalam satu forward pass"),
            QuestionOption(id: "b", textEN: "Being more accurate but slower", textID: "Lebih akurat tapi lebih lambat"),
            QuestionOption(id: "c", textEN: "Using region proposals", textID: "Menggunakan proposal wilayah"),
            QuestionOption(id: "d", textEN: "Only detecting faces", textID: "Hanya mendeteksi wajah")
        ],
        correctOptionId: "a",
        explanationEN: "YOLO: single CNN predicts all boxes and classes at once. Real-time speed, end-to-end training.",
        explanationID: "YOLO: CNN tunggal memprediksi semua kotak dan kelas sekaligus. Kecepatan real-time, training end-to-end.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn023",
        questionEN: "Anchor boxes in object detection are:",
        questionID: "Anchor box dalam deteksi objek adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Predefined boxes of various sizes/ratios that predictions are relative to", textID: "Kotak yang telah ditentukan dengan berbagai ukuran/rasio yang prediksi relatif terhadapnya"),
            QuestionOption(id: "b", textEN: "Ground truth bounding boxes", textID: "Bounding box ground truth"),
            QuestionOption(id: "c", textEN: "Pooling regions", textID: "Wilayah pooling"),
            QuestionOption(id: "d", textEN: "Classification labels", textID: "Label klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Anchors: reference boxes at each position. Network predicts offsets from anchors. Different scales/ratios.",
        explanationID: "Anchor: kotak referensi di setiap posisi. Jaringan memprediksi offset dari anchor. Skala/rasio berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn024",
        questionEN: "Non-maximum suppression (NMS) in detection removes:",
        questionID: "Non-maximum suppression (NMS) dalam deteksi menghapus:",
        options: [
            QuestionOption(id: "a", textEN: "Overlapping boxes, keeping highest confidence", textID: "Kotak yang tumpang tindih, menyimpan kepercayaan tertinggi"),
            QuestionOption(id: "b", textEN: "All boxes", textID: "Semua kotak"),
            QuestionOption(id: "c", textEN: "Background regions only", textID: "Hanya wilayah latar belakang"),
            QuestionOption(id: "d", textEN: "Low resolution features", textID: "Fitur resolusi rendah")
        ],
        correctOptionId: "a",
        explanationEN: "NMS: sort by confidence, remove boxes with IoU > threshold with higher-scoring boxes. Post-processing step.",
        explanationID: "NMS: urutkan berdasarkan kepercayaan, hapus kotak dengan IoU > threshold dengan kotak skor lebih tinggi. Langkah post-processing.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn025",
        questionEN: "IoU (Intersection over Union) measures:",
        questionID: "IoU (Intersection over Union) mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Overlap between predicted and ground truth boxes", textID: "Tumpang tindih antara kotak prediksi dan ground truth"),
            QuestionOption(id: "b", textEN: "Classification accuracy", textID: "Akurasi klasifikasi"),
            QuestionOption(id: "c", textEN: "Training speed", textID: "Kecepatan training"),
            QuestionOption(id: "d", textEN: "Number of objects", textID: "Jumlah objek")
        ],
        correctOptionId: "a",
        explanationEN: "IoU = Area(intersection) / Area(union). Range [0,1]. IoU > 0.5 often considered correct detection.",
        explanationID: "IoU = Luas(irisan) / Luas(gabungan). Rentang [0,1]. IoU > 0.5 sering dianggap deteksi benar.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // Semantic Segmentation
    Question(
        id: "cnn026",
        questionEN: "Semantic segmentation assigns:",
        questionID: "Segmentasi semantik menetapkan:",
        options: [
            QuestionOption(id: "a", textEN: "A class label to every pixel in the image", textID: "Label kelas ke setiap piksel dalam gambar"),
            QuestionOption(id: "b", textEN: "One label to entire image", textID: "Satu label ke seluruh gambar"),
            QuestionOption(id: "c", textEN: "Bounding boxes only", textID: "Hanya bounding box"),
            QuestionOption(id: "d", textEN: "Edge detection results", textID: "Hasil deteksi tepi")
        ],
        correctOptionId: "a",
        explanationEN: "Segmentation: dense prediction. Each pixel gets class label. Output same spatial size as input.",
        explanationID: "Segmentasi: prediksi padat. Setiap piksel mendapat label kelas. Output ukuran spasial sama dengan input.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn027",
        questionEN: "Fully Convolutional Networks (FCN) for segmentation:",
        questionID: "Fully Convolutional Network (FCN) untuk segmentasi:",
        options: [
            QuestionOption(id: "a", textEN: "Replace FC layers with convolutions, use upsampling for dense output", textID: "Mengganti layer FC dengan konvolusi, gunakan upsampling untuk output padat"),
            QuestionOption(id: "b", textEN: "Use only pooling layers", textID: "Hanya menggunakan layer pooling"),
            QuestionOption(id: "c", textEN: "Have no convolution layers", textID: "Tidak memiliki layer konvolusi"),
            QuestionOption(id: "d", textEN: "Only work on small images", textID: "Hanya bekerja pada gambar kecil")
        ],
        correctOptionId: "a",
        explanationEN: "FCN: all layers are convolutional. Accept any input size. Upsample (transposed conv) to original resolution.",
        explanationID: "FCN: semua layer adalah konvolusional. Menerima ukuran input apapun. Upsample (transposed conv) ke resolusi asli.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn028",
        questionEN: "U-Net architecture has:",
        questionID: "Arsitektur U-Net memiliki:",
        options: [
            QuestionOption(id: "a", textEN: "Encoder-decoder with skip connections between corresponding layers", textID: "Encoder-decoder dengan skip connection antara layer yang bersesuaian"),
            QuestionOption(id: "b", textEN: "Only encoder", textID: "Hanya encoder"),
            QuestionOption(id: "c", textEN: "Only decoder", textID: "Hanya decoder"),
            QuestionOption(id: "d", textEN: "No skip connections", textID: "Tidak ada skip connection")
        ],
        correctOptionId: "a",
        explanationEN: "U-Net: symmetric encoder-decoder. Skip connections concatenate encoder features to decoder for fine details.",
        explanationID: "U-Net: encoder-decoder simetris. Skip connection menggabungkan fitur encoder ke decoder untuk detail halus.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn029",
        questionEN: "Instance segmentation differs from semantic segmentation by:",
        questionID: "Segmentasi instans berbeda dari segmentasi semantik dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Distinguishing different instances of the same class", textID: "Membedakan instans berbeda dari kelas yang sama"),
            QuestionOption(id: "b", textEN: "Using fewer classes", textID: "Menggunakan lebih sedikit kelas"),
            QuestionOption(id: "c", textEN: "Being faster", textID: "Lebih cepat"),
            QuestionOption(id: "d", textEN: "Not using CNNs", textID: "Tidak menggunakan CNN")
        ],
        correctOptionId: "a",
        explanationEN: "Instance seg: separate masks for each object instance. Semantic: all objects of same class have same label.",
        explanationID: "Seg instans: mask terpisah untuk setiap instans objek. Semantik: semua objek dari kelas sama memiliki label sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn030",
        questionEN: "Mask R-CNN extends Faster R-CNN by adding:",
        questionID: "Mask R-CNN memperluas Faster R-CNN dengan menambahkan:",
        options: [
            QuestionOption(id: "a", textEN: "A branch for predicting segmentation masks", textID: "Cabang untuk memprediksi mask segmentasi"),
            QuestionOption(id: "b", textEN: "More anchor boxes", textID: "Lebih banyak anchor box"),
            QuestionOption(id: "c", textEN: "Depth estimation", textID: "Estimasi kedalaman"),
            QuestionOption(id: "d", textEN: "Pose estimation only", textID: "Hanya estimasi pose")
        ],
        correctOptionId: "a",
        explanationEN: "Mask R-CNN: detection head + mask head in parallel. Predicts per-instance binary masks using RoIAlign.",
        explanationID: "Mask R-CNN: head deteksi + head mask secara paralel. Memprediksi mask biner per-instans menggunakan RoIAlign.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Feature Extraction
    Question(
        id: "cnn031",
        questionEN: "Early CNN layers typically learn:",
        questionID: "Layer CNN awal biasanya mempelajari:",
        options: [
            QuestionOption(id: "a", textEN: "Low-level features like edges and textures", textID: "Fitur tingkat rendah seperti tepi dan tekstur"),
            QuestionOption(id: "b", textEN: "High-level semantic concepts", textID: "Konsep semantik tingkat tinggi"),
            QuestionOption(id: "c", textEN: "Object classifications", textID: "Klasifikasi objek"),
            QuestionOption(id: "d", textEN: "Language features", textID: "Fitur bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "Hierarchical features: early layers → edges, textures. Middle → parts, shapes. Late → objects, semantics.",
        explanationID: "Fitur hierarkis: layer awal → tepi, tekstur. Tengah → bagian, bentuk. Akhir → objek, semantik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn032",
        questionEN: "Feature maps in a CNN are:",
        questionID: "Feature map dalam CNN adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Outputs of convolutional layers showing detected features spatially", textID: "Output dari layer konvolusional yang menunjukkan fitur terdeteksi secara spasial"),
            QuestionOption(id: "b", textEN: "Input images only", textID: "Hanya gambar input"),
            QuestionOption(id: "c", textEN: "Kernel weights", textID: "Bobot kernel"),
            QuestionOption(id: "d", textEN: "Classification probabilities", textID: "Probabilitas klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Feature maps: 3D tensors (H×W×C) output by conv layers. Each channel responds to a learned pattern.",
        explanationID: "Feature map: tensor 3D (H×W×C) output dari layer conv. Setiap channel merespons pola yang dipelajari.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn033",
        questionEN: "Transfer learning with CNNs typically involves:",
        questionID: "Transfer learning dengan CNN biasanya melibatkan:",
        options: [
            QuestionOption(id: "a", textEN: "Using pretrained weights and fine-tuning on new task", textID: "Menggunakan bobot pretrained dan fine-tuning pada tugas baru"),
            QuestionOption(id: "b", textEN: "Training from scratch always", textID: "Selalu training dari awal"),
            QuestionOption(id: "c", textEN: "Removing all layers", textID: "Menghapus semua layer"),
            QuestionOption(id: "d", textEN: "Using random weights", textID: "Menggunakan bobot acak")
        ],
        correctOptionId: "a",
        explanationEN: "Transfer: pretrain on ImageNet → fine-tune on target. Early layers often frozen; later layers adapted.",
        explanationID: "Transfer: pretrain pada ImageNet → fine-tune pada target. Layer awal sering dibekukan; layer akhir diadaptasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn034",
        questionEN: "The receptive field of a neuron is:",
        questionID: "Receptive field dari neuron adalah:",
        options: [
            QuestionOption(id: "a", textEN: "The input region that influences that neuron's output", textID: "Wilayah input yang mempengaruhi output neuron tersebut"),
            QuestionOption(id: "b", textEN: "The output size", textID: "Ukuran output"),
            QuestionOption(id: "c", textEN: "The number of parameters", textID: "Jumlah parameter"),
            QuestionOption(id: "d", textEN: "The activation function", textID: "Fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Receptive field grows with depth. Stacking 3×3 convs: each layer adds 2 to RF. Deeper = larger RF.",
        explanationID: "Receptive field tumbuh dengan kedalaman. Menumpuk conv 3×3: setiap layer menambah 2 ke RF. Lebih dalam = RF lebih besar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn035",
        questionEN: "Feature pyramid networks (FPN) help detection by:",
        questionID: "Feature pyramid network (FPN) membantu deteksi dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Creating multi-scale feature maps with high-level semantics at all scales", textID: "Membuat feature map multi-skala dengan semantik tingkat tinggi di semua skala"),
            QuestionOption(id: "b", textEN: "Using only one scale", textID: "Hanya menggunakan satu skala"),
            QuestionOption(id: "c", textEN: "Removing pooling layers", textID: "Menghapus layer pooling"),
            QuestionOption(id: "d", textEN: "Using larger images", textID: "Menggunakan gambar lebih besar")
        ],
        correctOptionId: "a",
        explanationEN: "FPN: top-down pathway with lateral connections. High-res features get semantic info from deeper layers.",
        explanationID: "FPN: jalur top-down dengan koneksi lateral. Fitur resolusi tinggi mendapat info semantik dari layer lebih dalam.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // Practical CNN Training
    Question(
        id: "cnn036",
        questionEN: "Data augmentation for images commonly includes:",
        questionID: "Augmentasi data untuk gambar umumnya meliputi:",
        options: [
            QuestionOption(id: "a", textEN: "Random crops, flips, rotations, color jitter", textID: "Crop acak, flip, rotasi, jitter warna"),
            QuestionOption(id: "b", textEN: "Only resizing", textID: "Hanya mengubah ukuran"),
            QuestionOption(id: "c", textEN: "Removing pixels", textID: "Menghapus piksel"),
            QuestionOption(id: "d", textEN: "Converting to text", textID: "Mengkonversi ke teks")
        ],
        correctOptionId: "a",
        explanationEN: "Augmentation: transforms that preserve label. Horizontal flip, random crop, color/brightness changes, cutout, mixup.",
        explanationID: "Augmentasi: transformasi yang mempertahankan label. Flip horizontal, crop acak, perubahan warna/kecerahan, cutout, mixup.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn037",
        questionEN: "Batch normalization in CNNs normalizes across:",
        questionID: "Batch normalization dalam CNN menormalisasi melintasi:",
        options: [
            QuestionOption(id: "a", textEN: "Batch and spatial dimensions, per channel", textID: "Dimensi batch dan spasial, per channel"),
            QuestionOption(id: "b", textEN: "Only the batch dimension", textID: "Hanya dimensi batch"),
            QuestionOption(id: "c", textEN: "Only spatial dimensions", textID: "Hanya dimensi spasial"),
            QuestionOption(id: "d", textEN: "Only channels", textID: "Hanya channel")
        ],
        correctOptionId: "a",
        explanationEN: "In CNNs, BN computes mean/var per channel over (N, H, W). Each channel normalized independently.",
        explanationID: "Dalam CNN, BN menghitung mean/var per channel atas (N, H, W). Setiap channel dinormalisasi secara independen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn038",
        questionEN: "ImageNet contains approximately:",
        questionID: "ImageNet berisi kira-kira:",
        options: [
            QuestionOption(id: "a", textEN: "1.2 million training images with 1000 classes", textID: "1.2 juta gambar training dengan 1000 kelas"),
            QuestionOption(id: "b", textEN: "100 images with 10 classes", textID: "100 gambar dengan 10 kelas"),
            QuestionOption(id: "c", textEN: "10 million images with 100 classes", textID: "10 juta gambar dengan 100 kelas"),
            QuestionOption(id: "d", textEN: "1 million images with 10000 classes", textID: "1 juta gambar dengan 10000 kelas")
        ],
        correctOptionId: "a",
        explanationEN: "ImageNet ILSVRC: ~1.2M training, 50K validation, 1000 classes. Standard benchmark for image classification.",
        explanationID: "ImageNet ILSVRC: ~1.2M training, 50K validasi, 1000 kelas. Benchmark standar untuk klasifikasi gambar.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn039",
        questionEN: "Top-5 accuracy means:",
        questionID: "Top-5 accuracy berarti:",
        options: [
            QuestionOption(id: "a", textEN: "Correct if true label is among top 5 predicted classes", textID: "Benar jika label sebenarnya ada di antara 5 kelas teratas yang diprediksi"),
            QuestionOption(id: "b", textEN: "Using only top 5 classes", textID: "Hanya menggunakan 5 kelas teratas"),
            QuestionOption(id: "c", textEN: "Training for 5 epochs", textID: "Training selama 5 epoch"),
            QuestionOption(id: "d", textEN: "Accuracy of top 5 images", textID: "Akurasi dari 5 gambar teratas")
        ],
        correctOptionId: "a",
        explanationEN: "Top-5: prediction correct if true label in top 5 highest probability classes. Easier than top-1.",
        explanationID: "Top-5: prediksi benar jika label sebenarnya ada di 5 kelas probabilitas tertinggi. Lebih mudah dari top-1.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cnn040",
        questionEN: "Cutout augmentation:",
        questionID: "Augmentasi Cutout:",
        options: [
            QuestionOption(id: "a", textEN: "Randomly masks out rectangular regions of input", textID: "Secara acak menutupi wilayah persegi panjang dari input"),
            QuestionOption(id: "b", textEN: "Removes entire images", textID: "Menghapus seluruh gambar"),
            QuestionOption(id: "c", textEN: "Only works on edges", textID: "Hanya bekerja pada tepi"),
            QuestionOption(id: "d", textEN: "Increases image size", textID: "Meningkatkan ukuran gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Cutout: zero out random square patches. Forces network to use more of the image. Related: CutMix, MixUp.",
        explanationID: "Cutout: nolkan patch persegi acak. Memaksa jaringan menggunakan lebih banyak gambar. Terkait: CutMix, MixUp.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Mobile & Efficient Architectures
    Question(
        id: "cnn041",
        questionEN: "MobileNet uses depthwise separable convolutions to:",
        questionID: "MobileNet menggunakan konvolusi depthwise separable untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Reduce computation and parameters for mobile devices", textID: "Mengurangi komputasi dan parameter untuk perangkat mobile"),
            QuestionOption(id: "b", textEN: "Increase accuracy", textID: "Meningkatkan akurasi"),
            QuestionOption(id: "c", textEN: "Add more layers", textID: "Menambahkan lebih banyak layer"),
            QuestionOption(id: "d", textEN: "Handle larger images", textID: "Menangani gambar lebih besar")
        ],
        correctOptionId: "a",
        explanationEN: "Depthwise separable: ~8-9× fewer operations than standard conv. Designed for efficiency on mobile.",
        explanationID: "Depthwise separable: ~8-9× lebih sedikit operasi dari conv standar. Dirancang untuk efisiensi di mobile.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cnn042",
        questionEN: "FLOPs (floating point operations) in a 3×3 conv layer with C_in input channels, C_out output channels, and H×W output is:",
        questionID: "FLOPs (floating point operations) dalam layer conv 3×3 dengan C_in channel input, C_out channel output, dan output H×W adalah:",
        options: [
            QuestionOption(id: "a", textEN: "2 × 9 × C_in × C_out × H × W", textID: "2 × 9 × C_in × C_out × H × W"),
            QuestionOption(id: "b", textEN: "C_in × C_out", textID: "C_in × C_out"),
            QuestionOption(id: "c", textEN: "H × W × 9", textID: "H × W × 9"),
            QuestionOption(id: "d", textEN: "C_out only", textID: "Hanya C_out")
        ],
        correctOptionId: "a",
        explanationEN: "Each output position: 9×C_in multiply-adds = 2×9×C_in FLOPs. Total: 2×9×C_in×C_out×H×W.",
        explanationID: "Setiap posisi output: 9×C_in multiply-add = 2×9×C_in FLOPs. Total: 2×9×C_in×C_out×H×W.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn043",
        questionEN: "Squeeze-and-Excitation (SE) blocks:",
        questionID: "Blok Squeeze-and-Excitation (SE):",
        options: [
            QuestionOption(id: "a", textEN: "Recalibrate channel-wise feature responses using attention", textID: "Mengkalibrasi ulang respons fitur channel-wise menggunakan attention"),
            QuestionOption(id: "b", textEN: "Reduce spatial dimensions", textID: "Mengurangi dimensi spasial"),
            QuestionOption(id: "c", textEN: "Add skip connections", textID: "Menambahkan skip connection"),
            QuestionOption(id: "d", textEN: "Replace convolutions", textID: "Menggantikan konvolusi")
        ],
        correctOptionId: "a",
        explanationEN: "SE: global avg pool → FC → ReLU → FC → sigmoid → channel-wise multiply. Learns channel importance.",
        explanationID: "SE: global avg pool → FC → ReLU → FC → sigmoid → multiply channel-wise. Mempelajari kepentingan channel.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn044",
        questionEN: "Neural Architecture Search (NAS) aims to:",
        questionID: "Neural Architecture Search (NAS) bertujuan untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Automatically find optimal network architecture", textID: "Secara otomatis menemukan arsitektur jaringan optimal"),
            QuestionOption(id: "b", textEN: "Train networks faster", textID: "Melatih jaringan lebih cepat"),
            QuestionOption(id: "c", textEN: "Reduce training data", textID: "Mengurangi data training"),
            QuestionOption(id: "d", textEN: "Find optimal learning rates", textID: "Menemukan learning rate optimal")
        ],
        correctOptionId: "a",
        explanationEN: "NAS: search over architectures using RL/evolution/gradient. Found EfficientNet, NASNet, etc.",
        explanationID: "NAS: pencarian atas arsitektur menggunakan RL/evolusi/gradien. Menemukan EfficientNet, NASNet, dll.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn045",
        questionEN: "Model pruning reduces network size by:",
        questionID: "Model pruning mengurangi ukuran jaringan dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Removing unimportant weights or neurons", textID: "Menghapus bobot atau neuron yang tidak penting"),
            QuestionOption(id: "b", textEN: "Adding more layers", textID: "Menambahkan lebih banyak layer"),
            QuestionOption(id: "c", textEN: "Using larger filters", textID: "Menggunakan filter lebih besar"),
            QuestionOption(id: "d", textEN: "Training longer", textID: "Training lebih lama")
        ],
        correctOptionId: "a",
        explanationEN: "Pruning: remove small-magnitude weights (unstructured) or entire filters (structured). Then fine-tune.",
        explanationID: "Pruning: hapus bobot dengan magnitude kecil (unstructured) atau seluruh filter (structured). Lalu fine-tune.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Advanced Topics
    Question(
        id: "cnn046",
        questionEN: "Group convolution divides channels into groups to:",
        questionID: "Group convolution membagi channel menjadi grup untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Reduce computation by having each group convolve independently", textID: "Mengurangi komputasi dengan membuat setiap grup berkonvolusi secara independen"),
            QuestionOption(id: "b", textEN: "Increase accuracy", textID: "Meningkatkan akurasi"),
            QuestionOption(id: "c", textEN: "Add non-linearity", textID: "Menambahkan non-linearitas"),
            QuestionOption(id: "d", textEN: "Enable recurrent processing", textID: "Memungkinkan pemrosesan rekuren")
        ],
        correctOptionId: "a",
        explanationEN: "Group conv with G groups: G separate convolutions. G=C gives depthwise. Used in ResNeXt, ShuffleNet.",
        explanationID: "Group conv dengan G grup: G konvolusi terpisah. G=C memberikan depthwise. Digunakan dalam ResNeXt, ShuffleNet.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn047",
        questionEN: "Vision Transformers (ViT) process images by:",
        questionID: "Vision Transformer (ViT) memproses gambar dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Splitting into patches, embedding, then applying transformer", textID: "Membagi menjadi patch, embedding, lalu menerapkan transformer"),
            QuestionOption(id: "b", textEN: "Using only convolutions", textID: "Hanya menggunakan konvolusi"),
            QuestionOption(id: "c", textEN: "Applying RNN to pixels", textID: "Menerapkan RNN ke piksel"),
            QuestionOption(id: "d", textEN: "Random sampling", textID: "Pengambilan sampel acak")
        ],
        correctOptionId: "a",
        explanationEN: "ViT: split image into 16×16 patches, linear embed, add position encoding, apply transformer encoder.",
        explanationID: "ViT: bagi gambar menjadi patch 16×16, embed linear, tambahkan position encoding, terapkan transformer encoder.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn048",
        questionEN: "Spatial attention mechanisms in CNNs learn:",
        questionID: "Mekanisme spatial attention dalam CNN mempelajari:",
        options: [
            QuestionOption(id: "a", textEN: "Which spatial locations are more important", textID: "Lokasi spasial mana yang lebih penting"),
            QuestionOption(id: "b", textEN: "Which channels to use", textID: "Channel mana yang digunakan"),
            QuestionOption(id: "c", textEN: "Optimal learning rate", textID: "Learning rate optimal"),
            QuestionOption(id: "d", textEN: "Kernel sizes", textID: "Ukuran kernel")
        ],
        correctOptionId: "a",
        explanationEN: "Spatial attention: weight map over H×W positions. Focus on relevant regions (e.g., object vs background).",
        explanationID: "Spatial attention: peta bobot atas posisi H×W. Fokus pada wilayah relevan (mis., objek vs latar belakang).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn049",
        questionEN: "Deformable convolutions learn:",
        questionID: "Konvolusi deformable mempelajari:",
        options: [
            QuestionOption(id: "a", textEN: "Offsets for sampling locations, allowing adaptive receptive fields", textID: "Offset untuk lokasi sampling, memungkinkan receptive field adaptif"),
            QuestionOption(id: "b", textEN: "Fixed kernel shapes", textID: "Bentuk kernel tetap"),
            QuestionOption(id: "c", textEN: "Only vertical offsets", textID: "Hanya offset vertikal"),
            QuestionOption(id: "d", textEN: "Color transformations", textID: "Transformasi warna")
        ],
        correctOptionId: "a",
        explanationEN: "Deformable conv: learn 2D offsets for each kernel position. Adaptively sample around objects of varying shapes.",
        explanationID: "Deformable conv: mempelajari offset 2D untuk setiap posisi kernel. Secara adaptif mengambil sampel di sekitar objek dengan berbagai bentuk.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cnn050",
        questionEN: "Knowledge distillation for CNN compression:",
        questionID: "Knowledge distillation untuk kompresi CNN:",
        options: [
            QuestionOption(id: "a", textEN: "Trains small student network to match large teacher's outputs", textID: "Melatih jaringan student kecil untuk mencocokkan output teacher besar"),
            QuestionOption(id: "b", textEN: "Removes layers randomly", textID: "Menghapus layer secara acak"),
            QuestionOption(id: "c", textEN: "Uses only teacher network", textID: "Hanya menggunakan jaringan teacher"),
            QuestionOption(id: "d", textEN: "Increases model size", textID: "Meningkatkan ukuran model")
        ],
        correctOptionId: "a",
        explanationEN: "Distillation: student learns from teacher's soft probabilities (dark knowledge). Smaller model, similar accuracy.",
        explanationID: "Distillation: student belajar dari probabilitas lunak teacher (dark knowledge). Model lebih kecil, akurasi serupa.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
]
