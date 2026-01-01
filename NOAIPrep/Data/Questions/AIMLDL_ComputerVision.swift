import Foundation

// MARK: - AI/ML/DL: Computer Vision Questions (50 questions)
// Subcategory: CNNs, image processing, object detection, image classification

let computerVisionQuestions: [Question] = [
    // Batch 1: Image Basics & CNNs (10 questions)
    Question(
        id: "cv001",
        questionEN: "How is a grayscale image represented in a computer?",
        questionID: "Bagaimana gambar grayscale direpresentasikan dalam komputer?",
        options: [
            QuestionOption(id: "a", textEN: "A 2D array of pixel intensity values (0-255)", textID: "Array 2D dari nilai intensitas piksel (0-255)"),
            QuestionOption(id: "b", textEN: "A single number", textID: "Satu angka"),
            QuestionOption(id: "c", textEN: "A 3D array with RGB channels", textID: "Array 3D dengan channel RGB"),
            QuestionOption(id: "d", textEN: "A list of coordinates", textID: "Daftar koordinat")
        ],
        correctOptionId: "a",
        explanationEN: "A grayscale image is a 2D array where each pixel has an intensity value from 0 (black) to 255 (white).",
        explanationID: "Gambar grayscale adalah array 2D dimana setiap piksel memiliki nilai intensitas dari 0 (hitam) sampai 255 (putih).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv002",
        questionEN: "What is the shape of a color (RGB) image with height H and width W?",
        questionID: "Apa bentuk gambar berwarna (RGB) dengan tinggi H dan lebar W?",
        options: [
            QuestionOption(id: "a", textEN: "(H, W, 3)", textID: "(H, W, 3)"),
            QuestionOption(id: "b", textEN: "(H, W)", textID: "(H, W)"),
            QuestionOption(id: "c", textEN: "(3, H, W)", textID: "(3, H, W)"),
            QuestionOption(id: "d", textEN: "(H × W × 3,)", textID: "(H × W × 3,)")
        ],
        correctOptionId: "a",
        explanationEN: "An RGB image has 3 color channels (Red, Green, Blue), so its shape is (Height, Width, 3) in most frameworks.",
        explanationID: "Gambar RGB memiliki 3 channel warna (Red, Green, Blue), sehingga bentuknya adalah (Height, Width, 3) di sebagian besar framework.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv003",
        questionEN: "What is a Convolutional Neural Network (CNN)?",
        questionID: "Apa itu Convolutional Neural Network (CNN)?",
        options: [
            QuestionOption(id: "a", textEN: "A neural network using convolution operations to extract spatial features", textID: "Neural network yang menggunakan operasi konvolusi untuk mengekstrak fitur spasial"),
            QuestionOption(id: "b", textEN: "A network for processing sequences", textID: "Network untuk memproses sekuens"),
            QuestionOption(id: "c", textEN: "A fully connected neural network", textID: "Neural network fully connected"),
            QuestionOption(id: "d", textEN: "A network that generates text", textID: "Network yang menghasilkan teks")
        ],
        correctOptionId: "a",
        explanationEN: "CNNs use convolutional layers with learnable filters that slide over input images to detect spatial patterns like edges, textures, and objects.",
        explanationID: "CNN menggunakan layer konvolusi dengan filter yang dapat dipelajari yang meluncur di atas gambar input untuk mendeteksi pola spasial seperti tepi, tekstur, dan objek.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv004",
        questionEN: "What does a convolution operation do in CNNs?",
        questionID: "Apa yang dilakukan operasi konvolusi dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "Slides a filter over the image, computing dot products at each position", textID: "Meluncurkan filter di atas gambar, menghitung dot product di setiap posisi"),
            QuestionOption(id: "b", textEN: "Flattens the image into a 1D vector", textID: "Meratakan gambar menjadi vektor 1D"),
            QuestionOption(id: "c", textEN: "Removes noise from the image", textID: "Menghapus noise dari gambar"),
            QuestionOption(id: "d", textEN: "Increases the image resolution", textID: "Meningkatkan resolusi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Convolution slides a kernel (filter) across the image, computing element-wise products and summing them to produce feature maps that detect patterns.",
        explanationID: "Konvolusi meluncurkan kernel (filter) di atas gambar, menghitung produk elemen per elemen dan menjumlahkannya untuk menghasilkan feature maps yang mendeteksi pola.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv005",
        questionEN: "What is the purpose of pooling layers in CNNs?",
        questionID: "Apa tujuan dari pooling layers dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "To reduce spatial dimensions while retaining important features", textID: "Untuk mengurangi dimensi spasial sambil mempertahankan fitur penting"),
            QuestionOption(id: "b", textEN: "To add more parameters to the model", textID: "Untuk menambahkan lebih banyak parameter ke model"),
            QuestionOption(id: "c", textEN: "To increase image resolution", textID: "Untuk meningkatkan resolusi gambar"),
            QuestionOption(id: "d", textEN: "To apply activation functions", textID: "Untuk menerapkan fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Pooling (e.g., max pooling) reduces spatial dimensions by taking the maximum or average over local regions, making the model more efficient and translation-invariant.",
        explanationID: "Pooling (misal max pooling) mengurangi dimensi spasial dengan mengambil maksimum atau rata-rata dari area lokal, membuat model lebih efisien dan invarian terhadap translasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv006",
        questionEN: "What is max pooling with a 2×2 kernel and stride 2?",
        questionID: "Apa itu max pooling dengan kernel 2×2 dan stride 2?",
        options: [
            QuestionOption(id: "a", textEN: "Takes the maximum value from each 2×2 non-overlapping region", textID: "Mengambil nilai maksimum dari setiap area 2×2 yang tidak tumpang tindih"),
            QuestionOption(id: "b", textEN: "Averages values in each 2×2 region", textID: "Merata-ratakan nilai di setiap area 2×2"),
            QuestionOption(id: "c", textEN: "Doubles the image size", textID: "Menggandakan ukuran gambar"),
            QuestionOption(id: "d", textEN: "Applies a 2×2 convolution", textID: "Menerapkan konvolusi 2×2")
        ],
        correctOptionId: "a",
        explanationEN: "Max pooling 2×2 with stride 2 reduces each dimension by half, taking the maximum value from each 2×2 block of the input.",
        explanationID: "Max pooling 2×2 dengan stride 2 mengurangi setiap dimensi menjadi setengah, mengambil nilai maksimum dari setiap blok 2×2 dari input.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv007",
        questionEN: "What is stride in convolutional layers?",
        questionID: "Apa itu stride dalam layer konvolusi?",
        options: [
            QuestionOption(id: "a", textEN: "The number of pixels the filter moves at each step", textID: "Jumlah piksel yang filter bergerak di setiap langkah"),
            QuestionOption(id: "b", textEN: "The size of the filter", textID: "Ukuran filter"),
            QuestionOption(id: "c", textEN: "The number of filters", textID: "Jumlah filter"),
            QuestionOption(id: "d", textEN: "The depth of the layer", textID: "Kedalaman layer")
        ],
        correctOptionId: "a",
        explanationEN: "Stride determines how much the filter moves between applications. Stride 1 moves one pixel at a time; stride 2 moves two pixels, reducing output size.",
        explanationID: "Stride menentukan seberapa jauh filter bergerak antar aplikasi. Stride 1 bergerak satu piksel setiap kali; stride 2 bergerak dua piksel, mengurangi ukuran output.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv008",
        questionEN: "What is padding in CNNs?",
        questionID: "Apa itu padding dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "Adding pixels (usually zeros) around the image border", textID: "Menambahkan piksel (biasanya nol) di sekitar batas gambar"),
            QuestionOption(id: "b", textEN: "Removing pixels from the image", textID: "Menghapus piksel dari gambar"),
            QuestionOption(id: "c", textEN: "Increasing pixel values", textID: "Meningkatkan nilai piksel"),
            QuestionOption(id: "d", textEN: "Rotating the image", textID: "Memutar gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Padding adds extra pixels around the input (usually zeros) to control output dimensions. 'Same' padding keeps output size equal to input; 'valid' uses no padding.",
        explanationID: "Padding menambahkan piksel ekstra di sekitar input (biasanya nol) untuk mengontrol dimensi output. Padding 'same' menjaga ukuran output sama dengan input; 'valid' tanpa padding.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv009",
        questionEN: "If an input image is 32×32 and we apply a 5×5 filter with stride 1 and no padding, what is the output size?",
        questionID: "Jika gambar input 32×32 dan kita menerapkan filter 5×5 dengan stride 1 dan tanpa padding, berapa ukuran outputnya?",
        options: [
            QuestionOption(id: "a", textEN: "28×28", textID: "28×28"),
            QuestionOption(id: "b", textEN: "32×32", textID: "32×32"),
            QuestionOption(id: "c", textEN: "27×27", textID: "27×27"),
            QuestionOption(id: "d", textEN: "36×36", textID: "36×36")
        ],
        correctOptionId: "a",
        explanationEN: "Output size = (Input - Filter + 1) / Stride = (32 - 5 + 1) / 1 = 28. Each dimension shrinks by (filter_size - 1) without padding.",
        explanationID: "Ukuran output = (Input - Filter + 1) / Stride = (32 - 5 + 1) / 1 = 28. Setiap dimensi menyusut sebesar (ukuran_filter - 1) tanpa padding.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv010",
        questionEN: "What do early layers in a CNN typically learn?",
        questionID: "Apa yang biasanya dipelajari layer awal dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "Low-level features like edges and textures", textID: "Fitur tingkat rendah seperti tepi dan tekstur"),
            QuestionOption(id: "b", textEN: "High-level concepts like faces and objects", textID: "Konsep tingkat tinggi seperti wajah dan objek"),
            QuestionOption(id: "c", textEN: "Classification labels", textID: "Label klasifikasi"),
            QuestionOption(id: "d", textEN: "Random patterns", textID: "Pola acak")
        ],
        correctOptionId: "a",
        explanationEN: "Early CNN layers detect simple patterns (edges, colors, textures). Deeper layers combine these into increasingly complex features (shapes, parts, objects).",
        explanationID: "Layer CNN awal mendeteksi pola sederhana (tepi, warna, tekstur). Layer yang lebih dalam menggabungkan ini menjadi fitur yang semakin kompleks (bentuk, bagian, objek).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 2: CNN Architectures (10 questions)
    Question(
        id: "cv011",
        questionEN: "What is LeNet-5 known for?",
        questionID: "Untuk apa LeNet-5 dikenal?",
        options: [
            QuestionOption(id: "a", textEN: "One of the first successful CNNs, used for digit recognition", textID: "Salah satu CNN sukses pertama, digunakan untuk pengenalan digit"),
            QuestionOption(id: "b", textEN: "The deepest neural network ever built", textID: "Neural network terdalam yang pernah dibuat"),
            QuestionOption(id: "c", textEN: "A generative model for images", textID: "Model generatif untuk gambar"),
            QuestionOption(id: "d", textEN: "A language model", textID: "Model bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "LeNet-5, created by Yann LeCun in 1998, pioneered CNNs for handwritten digit recognition (MNIST) with conv-pool-conv-pool-fc architecture.",
        explanationID: "LeNet-5, dibuat oleh Yann LeCun pada 1998, merintis CNN untuk pengenalan digit tulisan tangan (MNIST) dengan arsitektur conv-pool-conv-pool-fc.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv012",
        questionEN: "What made AlexNet significant in 2012?",
        questionID: "Apa yang membuat AlexNet signifikan pada 2012?",
        options: [
            QuestionOption(id: "a", textEN: "Won ImageNet with a large margin, sparking the deep learning revolution", textID: "Memenangkan ImageNet dengan selisih besar, memicu revolusi deep learning"),
            QuestionOption(id: "b", textEN: "Was the smallest CNN ever", textID: "Merupakan CNN terkecil yang pernah ada"),
            QuestionOption(id: "c", textEN: "First network to use pooling", textID: "Network pertama yang menggunakan pooling"),
            QuestionOption(id: "d", textEN: "Invented the ReLU activation", textID: "Menemukan aktivasi ReLU")
        ],
        correctOptionId: "a",
        explanationEN: "AlexNet won the 2012 ImageNet challenge by a large margin, demonstrating the power of deep CNNs trained on GPUs and popularizing deep learning.",
        explanationID: "AlexNet memenangkan tantangan ImageNet 2012 dengan selisih besar, mendemonstrasikan kekuatan CNN dalam yang dilatih pada GPU dan mempopulerkan deep learning.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv013",
        questionEN: "What is the key innovation of VGGNet?",
        questionID: "Apa inovasi kunci dari VGGNet?",
        options: [
            QuestionOption(id: "a", textEN: "Using very small (3×3) convolution filters throughout the network", textID: "Menggunakan filter konvolusi yang sangat kecil (3×3) di seluruh network"),
            QuestionOption(id: "b", textEN: "Using no pooling layers", textID: "Tidak menggunakan pooling layers"),
            QuestionOption(id: "c", textEN: "Having only one layer", textID: "Hanya memiliki satu layer"),
            QuestionOption(id: "d", textEN: "Using 11×11 filters", textID: "Menggunakan filter 11×11")
        ],
        correctOptionId: "a",
        explanationEN: "VGGNet showed that using small 3×3 filters consistently throughout the network achieves strong performance while being simpler. VGG-16 and VGG-19 are common variants.",
        explanationID: "VGGNet menunjukkan bahwa menggunakan filter 3×3 kecil secara konsisten di seluruh network mencapai performa kuat sambil lebih sederhana. VGG-16 dan VGG-19 adalah varian umum.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv014",
        questionEN: "What is the main innovation of ResNet?",
        questionID: "Apa inovasi utama dari ResNet?",
        options: [
            QuestionOption(id: "a", textEN: "Skip connections (residual connections) that enable very deep networks", textID: "Skip connections (residual connections) yang memungkinkan network sangat dalam"),
            QuestionOption(id: "b", textEN: "Using only 1×1 convolutions", textID: "Hanya menggunakan konvolusi 1×1"),
            QuestionOption(id: "c", textEN: "Removing all pooling layers", textID: "Menghapus semua pooling layers"),
            QuestionOption(id: "d", textEN: "Using larger filters", textID: "Menggunakan filter yang lebih besar")
        ],
        correctOptionId: "a",
        explanationEN: "ResNet introduced residual connections (y = F(x) + x) that allow gradients to flow directly, enabling training of networks with 100+ layers without degradation.",
        explanationID: "ResNet memperkenalkan residual connections (y = F(x) + x) yang memungkinkan gradien mengalir langsung, memungkinkan training network dengan 100+ layer tanpa degradasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv015",
        questionEN: "What is the Inception module in GoogLeNet?",
        questionID: "Apa itu modul Inception dalam GoogLeNet?",
        options: [
            QuestionOption(id: "a", textEN: "Parallel convolutions with different filter sizes concatenated together", textID: "Konvolusi paralel dengan ukuran filter berbeda yang digabungkan bersama"),
            QuestionOption(id: "b", textEN: "A single very deep convolution", textID: "Satu konvolusi yang sangat dalam"),
            QuestionOption(id: "c", textEN: "A recurrent connection", textID: "Koneksi recurrent"),
            QuestionOption(id: "d", textEN: "A type of pooling", textID: "Jenis pooling")
        ],
        correctOptionId: "a",
        explanationEN: "Inception modules apply 1×1, 3×3, 5×5 convolutions and max pooling in parallel, then concatenate outputs. This captures multi-scale features efficiently.",
        explanationID: "Modul Inception menerapkan konvolusi 1×1, 3×3, 5×5 dan max pooling secara paralel, lalu menggabungkan output. Ini menangkap fitur multi-skala secara efisien.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv016",
        questionEN: "What is the purpose of 1×1 convolutions?",
        questionID: "Apa tujuan dari konvolusi 1×1?",
        options: [
            QuestionOption(id: "a", textEN: "To reduce or increase the number of channels (dimensionality reduction)", textID: "Untuk mengurangi atau menambah jumlah channel (pengurangan dimensionalitas)"),
            QuestionOption(id: "b", textEN: "To detect edges", textID: "Untuk mendeteksi tepi"),
            QuestionOption(id: "c", textEN: "To increase spatial dimensions", textID: "Untuk meningkatkan dimensi spasial"),
            QuestionOption(id: "d", textEN: "To apply pooling", textID: "Untuk menerapkan pooling")
        ],
        correctOptionId: "a",
        explanationEN: "1×1 convolutions act on each spatial position independently to change the number of channels. They're used for dimensionality reduction in Inception and ResNet.",
        explanationID: "Konvolusi 1×1 bekerja pada setiap posisi spasial secara independen untuk mengubah jumlah channel. Mereka digunakan untuk pengurangan dimensionalitas di Inception dan ResNet.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv017",
        questionEN: "What is global average pooling?",
        questionID: "Apa itu global average pooling?",
        options: [
            QuestionOption(id: "a", textEN: "Taking the average of each feature map across all spatial locations", textID: "Mengambil rata-rata dari setiap feature map di semua lokasi spasial"),
            QuestionOption(id: "b", textEN: "Taking the maximum value from each feature map", textID: "Mengambil nilai maksimum dari setiap feature map"),
            QuestionOption(id: "c", textEN: "Averaging pixel values across channels", textID: "Merata-ratakan nilai piksel di seluruh channel"),
            QuestionOption(id: "d", textEN: "A type of data augmentation", textID: "Jenis data augmentation")
        ],
        correctOptionId: "a",
        explanationEN: "Global average pooling averages each feature map to a single value, reducing parameters compared to fully connected layers and providing spatial invariance.",
        explanationID: "Global average pooling merata-ratakan setiap feature map menjadi satu nilai, mengurangi parameter dibandingkan fully connected layers dan memberikan invariansi spasial.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv018",
        questionEN: "What is depthwise separable convolution used in MobileNet?",
        questionID: "Apa itu depthwise separable convolution yang digunakan di MobileNet?",
        options: [
            QuestionOption(id: "a", textEN: "Separating spatial and channel convolutions to reduce computation", textID: "Memisahkan konvolusi spasial dan channel untuk mengurangi komputasi"),
            QuestionOption(id: "b", textEN: "A deeper version of standard convolution", textID: "Versi lebih dalam dari konvolusi standar"),
            QuestionOption(id: "c", textEN: "Convolution only in the depth direction", textID: "Konvolusi hanya di arah kedalaman"),
            QuestionOption(id: "d", textEN: "A type of pooling operation", textID: "Jenis operasi pooling")
        ],
        correctOptionId: "a",
        explanationEN: "Depthwise separable convolution first applies a spatial filter per channel (depthwise), then combines with 1×1 (pointwise), greatly reducing parameters and computation.",
        explanationID: "Depthwise separable convolution pertama menerapkan filter spasial per channel (depthwise), lalu menggabungkan dengan 1×1 (pointwise), sangat mengurangi parameter dan komputasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv019",
        questionEN: "What is the bottleneck design in ResNet?",
        questionID: "Apa itu desain bottleneck dalam ResNet?",
        options: [
            QuestionOption(id: "a", textEN: "1×1 → 3×3 → 1×1 convolutions to reduce then expand dimensions", textID: "Konvolusi 1×1 → 3×3 → 1×1 untuk mengurangi lalu memperluas dimensi"),
            QuestionOption(id: "b", textEN: "Using only 1×1 convolutions", textID: "Hanya menggunakan konvolusi 1×1"),
            QuestionOption(id: "c", textEN: "A narrow middle layer", textID: "Layer tengah yang sempit"),
            QuestionOption(id: "d", textEN: "Maximum pooling only", textID: "Hanya maximum pooling")
        ],
        correctOptionId: "a",
        explanationEN: "Bottleneck blocks use 1×1 to reduce dimensions, 3×3 for the main convolution, then 1×1 to restore dimensions. This reduces computation while maintaining capacity.",
        explanationID: "Blok bottleneck menggunakan 1×1 untuk mengurangi dimensi, 3×3 untuk konvolusi utama, lalu 1×1 untuk mengembalikan dimensi. Ini mengurangi komputasi sambil mempertahankan kapasitas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv020",
        questionEN: "What is EfficientNet's key innovation?",
        questionID: "Apa inovasi kunci dari EfficientNet?",
        options: [
            QuestionOption(id: "a", textEN: "Compound scaling of depth, width, and resolution together", textID: "Compound scaling dari kedalaman, lebar, dan resolusi bersama"),
            QuestionOption(id: "b", textEN: "Using only residual connections", textID: "Hanya menggunakan residual connections"),
            QuestionOption(id: "c", textEN: "Removing all pooling layers", textID: "Menghapus semua pooling layers"),
            QuestionOption(id: "d", textEN: "Using random filter sizes", textID: "Menggunakan ukuran filter acak")
        ],
        correctOptionId: "a",
        explanationEN: "EfficientNet uses neural architecture search to find optimal compound scaling coefficients for network depth, width, and input resolution simultaneously.",
        explanationID: "EfficientNet menggunakan neural architecture search untuk menemukan koefisien compound scaling optimal untuk kedalaman network, lebar, dan resolusi input secara bersamaan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // Batch 3: Object Detection & Segmentation (10 questions)
    Question(
        id: "cv021",
        questionEN: "What is the difference between image classification and object detection?",
        questionID: "Apa perbedaan antara image classification dan object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Classification labels the whole image; detection finds and localizes objects with bounding boxes", textID: "Classification memberi label pada seluruh gambar; detection menemukan dan melokalisasi objek dengan bounding box"),
            QuestionOption(id: "b", textEN: "They are the same task", textID: "Mereka adalah tugas yang sama"),
            QuestionOption(id: "c", textEN: "Detection is faster than classification", textID: "Detection lebih cepat dari classification"),
            QuestionOption(id: "d", textEN: "Classification requires more data", textID: "Classification membutuhkan lebih banyak data")
        ],
        correctOptionId: "a",
        explanationEN: "Classification assigns a single label to an image. Object detection identifies multiple objects, classifies each, and draws bounding boxes around them.",
        explanationID: "Classification menetapkan satu label ke gambar. Object detection mengidentifikasi beberapa objek, mengklasifikasikan masing-masing, dan menggambar bounding box di sekitarnya.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv022",
        questionEN: "What is semantic segmentation?",
        questionID: "Apa itu semantic segmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Classifying every pixel in an image into categories", textID: "Mengklasifikasikan setiap piksel dalam gambar ke dalam kategori"),
            QuestionOption(id: "b", textEN: "Drawing bounding boxes around objects", textID: "Menggambar bounding box di sekitar objek"),
            QuestionOption(id: "c", textEN: "Classifying the entire image", textID: "Mengklasifikasikan seluruh gambar"),
            QuestionOption(id: "d", textEN: "Generating captions for images", textID: "Menghasilkan caption untuk gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Semantic segmentation assigns a class label to every pixel, creating a dense prediction map. All instances of the same class get the same label.",
        explanationID: "Semantic segmentation menetapkan label kelas ke setiap piksel, membuat peta prediksi padat. Semua instance dari kelas yang sama mendapat label yang sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv023",
        questionEN: "What is instance segmentation?",
        questionID: "Apa itu instance segmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Segmentation that distinguishes between different instances of the same class", textID: "Segmentasi yang membedakan antara instance berbeda dari kelas yang sama"),
            QuestionOption(id: "b", textEN: "Same as semantic segmentation", textID: "Sama dengan semantic segmentation"),
            QuestionOption(id: "c", textEN: "Only detecting one object", textID: "Hanya mendeteksi satu objek"),
            QuestionOption(id: "d", textEN: "Bounding box detection only", textID: "Hanya deteksi bounding box")
        ],
        correctOptionId: "a",
        explanationEN: "Instance segmentation combines object detection and segmentation - it not only classifies each pixel but also separates different instances of the same class.",
        explanationID: "Instance segmentation menggabungkan object detection dan segmentation - tidak hanya mengklasifikasikan setiap piksel tetapi juga memisahkan instance berbeda dari kelas yang sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv024",
        questionEN: "What is IoU (Intersection over Union)?",
        questionID: "Apa itu IoU (Intersection over Union)?",
        options: [
            QuestionOption(id: "a", textEN: "A metric measuring overlap between predicted and ground truth boxes", textID: "Metrik yang mengukur tumpang tindih antara box prediksi dan ground truth"),
            QuestionOption(id: "b", textEN: "A type of loss function", textID: "Jenis fungsi loss"),
            QuestionOption(id: "c", textEN: "A network architecture", textID: "Arsitektur network"),
            QuestionOption(id: "d", textEN: "A data augmentation technique", textID: "Teknik data augmentation")
        ],
        correctOptionId: "a",
        explanationEN: "IoU = Area of Intersection / Area of Union. It measures how well predicted bounding boxes match ground truth. IoU > 0.5 is often considered a correct detection.",
        explanationID: "IoU = Area Intersection / Area Union. Ini mengukur seberapa baik bounding box prediksi cocok dengan ground truth. IoU > 0.5 sering dianggap deteksi yang benar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv025",
        questionEN: "What is the R-CNN approach to object detection?",
        questionID: "Apa pendekatan R-CNN untuk object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Generate region proposals, then classify each with a CNN", textID: "Menghasilkan region proposals, lalu mengklasifikasikan masing-masing dengan CNN"),
            QuestionOption(id: "b", textEN: "Single forward pass through the network", textID: "Satu forward pass melalui network"),
            QuestionOption(id: "c", textEN: "Only uses fully connected layers", textID: "Hanya menggunakan fully connected layers"),
            QuestionOption(id: "d", textEN: "Generates images from text", textID: "Menghasilkan gambar dari teks")
        ],
        correctOptionId: "a",
        explanationEN: "R-CNN (Regions with CNN) first extracts region proposals (~2000), then applies CNN to each region for classification and bounding box regression.",
        explanationID: "R-CNN (Regions with CNN) pertama mengekstrak region proposals (~2000), lalu menerapkan CNN ke setiap region untuk classification dan bounding box regression.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv026",
        questionEN: "What improvement did Fast R-CNN make over R-CNN?",
        questionID: "Perbaikan apa yang dibuat Fast R-CNN dibanding R-CNN?",
        options: [
            QuestionOption(id: "a", textEN: "Processes the entire image once with CNN, then pools features for each region", textID: "Memproses seluruh gambar sekali dengan CNN, lalu pools fitur untuk setiap region"),
            QuestionOption(id: "b", textEN: "Uses smaller images", textID: "Menggunakan gambar yang lebih kecil"),
            QuestionOption(id: "c", textEN: "Uses fewer region proposals", textID: "Menggunakan lebih sedikit region proposals"),
            QuestionOption(id: "d", textEN: "Removes the classification step", textID: "Menghapus langkah classification")
        ],
        correctOptionId: "a",
        explanationEN: "Fast R-CNN runs CNN once on the full image and uses RoI pooling to extract features for each proposal, avoiding redundant computation.",
        explanationID: "Fast R-CNN menjalankan CNN sekali pada gambar penuh dan menggunakan RoI pooling untuk mengekstrak fitur untuk setiap proposal, menghindari komputasi berulang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv027",
        questionEN: "What is Faster R-CNN's main contribution?",
        questionID: "Apa kontribusi utama Faster R-CNN?",
        options: [
            QuestionOption(id: "a", textEN: "Region Proposal Network (RPN) to generate proposals using the CNN itself", textID: "Region Proposal Network (RPN) untuk menghasilkan proposal menggunakan CNN itu sendiri"),
            QuestionOption(id: "b", textEN: "Using deeper networks", textID: "Menggunakan network yang lebih dalam"),
            QuestionOption(id: "c", textEN: "Removing pooling layers", textID: "Menghapus pooling layers"),
            QuestionOption(id: "d", textEN: "Using smaller filters", textID: "Menggunakan filter yang lebih kecil")
        ],
        correctOptionId: "a",
        explanationEN: "Faster R-CNN introduces the Region Proposal Network (RPN) that shares convolutions with the detection network, making proposals very fast.",
        explanationID: "Faster R-CNN memperkenalkan Region Proposal Network (RPN) yang berbagi konvolusi dengan detection network, membuat proposal sangat cepat.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv028",
        questionEN: "What is YOLO (You Only Look Once)?",
        questionID: "Apa itu YOLO (You Only Look Once)?",
        options: [
            QuestionOption(id: "a", textEN: "A real-time object detection system using a single neural network pass", textID: "Sistem object detection real-time menggunakan satu pass neural network"),
            QuestionOption(id: "b", textEN: "A two-stage detector like R-CNN", textID: "Detektor dua tahap seperti R-CNN"),
            QuestionOption(id: "c", textEN: "An image classification model", textID: "Model image classification"),
            QuestionOption(id: "d", textEN: "A segmentation model", textID: "Model segmentasi")
        ],
        correctOptionId: "a",
        explanationEN: "YOLO divides the image into a grid and predicts bounding boxes and class probabilities for each cell in a single forward pass, enabling real-time detection.",
        explanationID: "YOLO membagi gambar menjadi grid dan memprediksi bounding box serta probabilitas kelas untuk setiap sel dalam satu forward pass, memungkinkan deteksi real-time.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv029",
        questionEN: "What is the U-Net architecture used for?",
        questionID: "Untuk apa arsitektur U-Net digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Image segmentation, especially in biomedical applications", textID: "Image segmentation, terutama dalam aplikasi biomedis"),
            QuestionOption(id: "b", textEN: "Object detection only", textID: "Hanya object detection"),
            QuestionOption(id: "c", textEN: "Image classification", textID: "Image classification"),
            QuestionOption(id: "d", textEN: "Text generation", textID: "Text generation")
        ],
        correctOptionId: "a",
        explanationEN: "U-Net has an encoder-decoder structure with skip connections, making it excellent for segmentation tasks, particularly medical image analysis.",
        explanationID: "U-Net memiliki struktur encoder-decoder dengan skip connections, membuatnya sangat baik untuk tugas segmentasi, terutama analisis gambar medis.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv030",
        questionEN: "What is Non-Maximum Suppression (NMS)?",
        questionID: "Apa itu Non-Maximum Suppression (NMS)?",
        options: [
            QuestionOption(id: "a", textEN: "A technique to remove redundant overlapping bounding boxes", textID: "Teknik untuk menghapus bounding box yang tumpang tindih berlebihan"),
            QuestionOption(id: "b", textEN: "A type of pooling operation", textID: "Jenis operasi pooling"),
            QuestionOption(id: "c", textEN: "A training technique", textID: "Teknik training"),
            QuestionOption(id: "d", textEN: "An activation function", textID: "Fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "NMS keeps only the highest-confidence box among overlapping detections, removing duplicates. It's essential for post-processing in object detection.",
        explanationID: "NMS hanya menyimpan box dengan confidence tertinggi di antara deteksi yang tumpang tindih, menghapus duplikat. Ini penting untuk post-processing dalam object detection.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 4: Image Processing & Data Augmentation (10 questions)
    Question(
        id: "cv031",
        questionEN: "What is image normalization typically done before training?",
        questionID: "Apa normalisasi gambar yang biasanya dilakukan sebelum training?",
        options: [
            QuestionOption(id: "a", textEN: "Scaling pixel values to [0,1] or standardizing to mean=0, std=1", textID: "Menskalakan nilai piksel ke [0,1] atau menstandardisasi ke mean=0, std=1"),
            QuestionOption(id: "b", textEN: "Increasing image resolution", textID: "Meningkatkan resolusi gambar"),
            QuestionOption(id: "c", textEN: "Converting to grayscale", textID: "Mengkonversi ke grayscale"),
            QuestionOption(id: "d", textEN: "Rotating all images by 90 degrees", textID: "Memutar semua gambar 90 derajat")
        ],
        correctOptionId: "a",
        explanationEN: "Normalization typically divides pixels by 255 (for [0,1]) or subtracts mean and divides by std. This helps training stability and convergence.",
        explanationID: "Normalisasi biasanya membagi piksel dengan 255 (untuk [0,1]) atau mengurangi mean dan membagi dengan std. Ini membantu stabilitas dan konvergensi training.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv032",
        questionEN: "What is data augmentation in computer vision?",
        questionID: "Apa itu data augmentation dalam computer vision?",
        options: [
            QuestionOption(id: "a", textEN: "Applying random transformations to training images to increase diversity", textID: "Menerapkan transformasi acak pada gambar training untuk meningkatkan keragaman"),
            QuestionOption(id: "b", textEN: "Collecting more images from the internet", textID: "Mengumpulkan lebih banyak gambar dari internet"),
            QuestionOption(id: "c", textEN: "Removing duplicate images", textID: "Menghapus gambar duplikat"),
            QuestionOption(id: "d", textEN: "Compressing images", textID: "Mengkompresi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Data augmentation artificially expands the training set by applying transformations (flipping, rotating, cropping, color jittering) to existing images.",
        explanationID: "Data augmentation secara artifisial memperluas training set dengan menerapkan transformasi (flipping, rotating, cropping, color jittering) pada gambar yang ada.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv033",
        questionEN: "Which of these is a common data augmentation technique?",
        questionID: "Mana dari ini yang merupakan teknik data augmentation umum?",
        options: [
            QuestionOption(id: "a", textEN: "Random horizontal flip", textID: "Random horizontal flip"),
            QuestionOption(id: "b", textEN: "Converting to text", textID: "Mengkonversi ke teks"),
            QuestionOption(id: "c", textEN: "Removing all colors", textID: "Menghapus semua warna"),
            QuestionOption(id: "d", textEN: "Deleting random pixels", textID: "Menghapus piksel acak")
        ],
        correctOptionId: "a",
        explanationEN: "Random horizontal flip is a simple but effective augmentation. Other common ones include rotation, scaling, cropping, and color adjustments.",
        explanationID: "Random horizontal flip adalah augmentasi sederhana tetapi efektif. Yang umum lainnya termasuk rotasi, scaling, cropping, dan penyesuaian warna.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv034",
        questionEN: "What is a convolution kernel/filter that detects vertical edges?",
        questionID: "Apa kernel/filter konvolusi yang mendeteksi tepi vertikal?",
        options: [
            QuestionOption(id: "a", textEN: "[[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]", textID: "[[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]"),
            QuestionOption(id: "b", textEN: "[[1, 1, 1], [0, 0, 0], [-1, -1, -1]]", textID: "[[1, 1, 1], [0, 0, 0], [-1, -1, -1]]"),
            QuestionOption(id: "c", textEN: "[[1, 1, 1], [1, 1, 1], [1, 1, 1]]", textID: "[[1, 1, 1], [1, 1, 1], [1, 1, 1]]"),
            QuestionOption(id: "d", textEN: "[[0, 0, 0], [0, 1, 0], [0, 0, 0]]", textID: "[[0, 0, 0], [0, 1, 0], [0, 0, 0]]")
        ],
        correctOptionId: "a",
        explanationEN: "The vertical edge detector has -1s on the left, 0s in the middle, and 1s on the right. It responds strongly where there's a horizontal intensity change (vertical edge).",
        explanationID: "Detektor tepi vertikal memiliki -1 di kiri, 0 di tengah, dan 1 di kanan. Ia merespons kuat di mana ada perubahan intensitas horizontal (tepi vertikal).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv035",
        questionEN: "What is the Sobel operator used for?",
        questionID: "Untuk apa operator Sobel digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Edge detection by computing image gradients", textID: "Deteksi tepi dengan menghitung gradien gambar"),
            QuestionOption(id: "b", textEN: "Image compression", textID: "Kompresi gambar"),
            QuestionOption(id: "c", textEN: "Color conversion", textID: "Konversi warna"),
            QuestionOption(id: "d", textEN: "Image resizing", textID: "Resizing gambar")
        ],
        correctOptionId: "a",
        explanationEN: "The Sobel operator uses convolution kernels to compute horizontal and vertical gradients, which are combined to detect edges in images.",
        explanationID: "Operator Sobel menggunakan kernel konvolusi untuk menghitung gradien horizontal dan vertikal, yang digabungkan untuk mendeteksi tepi dalam gambar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv036",
        questionEN: "What is Cutout augmentation?",
        questionID: "Apa itu augmentasi Cutout?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly masking out square regions of the image", textID: "Secara acak menutup area persegi dari gambar"),
            QuestionOption(id: "b", textEN: "Cutting the image in half", textID: "Memotong gambar menjadi dua"),
            QuestionOption(id: "c", textEN: "Removing the background", textID: "Menghapus latar belakang"),
            QuestionOption(id: "d", textEN: "Cropping to the center", textID: "Memotong ke tengah")
        ],
        correctOptionId: "a",
        explanationEN: "Cutout randomly masks out a square patch of the image, forcing the model to learn from partial information and improving robustness.",
        explanationID: "Cutout secara acak menutup patch persegi dari gambar, memaksa model untuk belajar dari informasi parsial dan meningkatkan ketahanan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv037",
        questionEN: "What is Mixup augmentation?",
        questionID: "Apa itu augmentasi Mixup?",
        options: [
            QuestionOption(id: "a", textEN: "Blending two training images and their labels together", textID: "Mencampur dua gambar training dan labelnya bersama"),
            QuestionOption(id: "b", textEN: "Shuffling pixels randomly", textID: "Mengacak piksel secara acak"),
            QuestionOption(id: "c", textEN: "Changing image colors", textID: "Mengubah warna gambar"),
            QuestionOption(id: "d", textEN: "Rotating images randomly", textID: "Memutar gambar secara acak")
        ],
        correctOptionId: "a",
        explanationEN: "Mixup creates new training examples by linearly interpolating between pairs of images and their labels: x' = λx₁ + (1-λ)x₂.",
        explanationID: "Mixup membuat contoh training baru dengan menginterpolasi secara linear antara pasangan gambar dan labelnya: x' = λx₁ + (1-λ)x₂.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv038",
        questionEN: "What is the purpose of image resizing/rescaling?",
        questionID: "Apa tujuan dari resizing/rescaling gambar?",
        options: [
            QuestionOption(id: "a", textEN: "To make all input images the same size for the network", textID: "Untuk membuat semua gambar input berukuran sama untuk network"),
            QuestionOption(id: "b", textEN: "To reduce file size only", textID: "Hanya untuk mengurangi ukuran file"),
            QuestionOption(id: "c", textEN: "To improve image quality", textID: "Untuk meningkatkan kualitas gambar"),
            QuestionOption(id: "d", textEN: "To add noise to images", textID: "Untuk menambahkan noise ke gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Neural networks typically require fixed input sizes. Resizing ensures all images have the same dimensions for batch processing.",
        explanationID: "Neural networks biasanya membutuhkan ukuran input tetap. Resizing memastikan semua gambar memiliki dimensi yang sama untuk batch processing.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv039",
        questionEN: "What is center cropping?",
        questionID: "Apa itu center cropping?",
        options: [
            QuestionOption(id: "a", textEN: "Extracting a fixed-size region from the center of an image", textID: "Mengekstrak area berukuran tetap dari tengah gambar"),
            QuestionOption(id: "b", textEN: "Removing the center of an image", textID: "Menghapus tengah gambar"),
            QuestionOption(id: "c", textEN: "Rotating around the center", textID: "Memutar di sekitar tengah"),
            QuestionOption(id: "d", textEN: "Adding a border to the center", textID: "Menambahkan batas ke tengah")
        ],
        correctOptionId: "a",
        explanationEN: "Center cropping extracts a square or rectangular region from the middle of an image, commonly used during inference to get a standard-sized input.",
        explanationID: "Center cropping mengekstrak region persegi atau persegi panjang dari tengah gambar, biasanya digunakan selama inference untuk mendapatkan input berukuran standar.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv040",
        questionEN: "What is color jittering?",
        questionID: "Apa itu color jittering?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly changing brightness, contrast, saturation, or hue", textID: "Secara acak mengubah brightness, contrast, saturation, atau hue"),
            QuestionOption(id: "b", textEN: "Converting to grayscale", textID: "Mengkonversi ke grayscale"),
            QuestionOption(id: "c", textEN: "Adding colored noise", textID: "Menambahkan noise berwarna"),
            QuestionOption(id: "d", textEN: "Inverting colors", textID: "Membalik warna")
        ],
        correctOptionId: "a",
        explanationEN: "Color jittering augmentation randomly adjusts image properties like brightness, contrast, saturation, and hue to make models robust to lighting variations.",
        explanationID: "Augmentasi color jittering secara acak menyesuaikan properti gambar seperti brightness, contrast, saturation, dan hue untuk membuat model tahan terhadap variasi pencahayaan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 5: Advanced Topics (10 questions)
    Question(
        id: "cv041",
        questionEN: "What is feature map in a CNN?",
        questionID: "Apa itu feature map dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "The output of applying a filter/kernel to an input", textID: "Output dari penerapan filter/kernel ke input"),
            QuestionOption(id: "b", textEN: "The input image itself", textID: "Gambar input itu sendiri"),
            QuestionOption(id: "c", textEN: "The weights of the network", textID: "Bobot dari network"),
            QuestionOption(id: "d", textEN: "The loss function value", textID: "Nilai fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "A feature map is the 2D output produced when a convolutional filter is applied to an input. Each filter produces one feature map detecting specific patterns.",
        explanationID: "Feature map adalah output 2D yang dihasilkan ketika filter konvolusi diterapkan ke input. Setiap filter menghasilkan satu feature map yang mendeteksi pola tertentu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv042",
        questionEN: "What is receptive field in CNNs?",
        questionID: "Apa itu receptive field dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "The region of input that affects a particular neuron's output", textID: "Area input yang mempengaruhi output neuron tertentu"),
            QuestionOption(id: "b", textEN: "The size of the filter", textID: "Ukuran filter"),
            QuestionOption(id: "c", textEN: "The number of output channels", textID: "Jumlah channel output"),
            QuestionOption(id: "d", textEN: "The batch size", textID: "Batch size")
        ],
        correctOptionId: "a",
        explanationEN: "Receptive field is the input region that contributes to a neuron's activation. Deeper layers have larger receptive fields, seeing more context.",
        explanationID: "Receptive field adalah region input yang berkontribusi pada aktivasi neuron. Layer yang lebih dalam memiliki receptive field lebih besar, melihat lebih banyak konteks.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv043",
        questionEN: "What is transposed convolution (deconvolution)?",
        questionID: "Apa itu transposed convolution (deconvolution)?",
        options: [
            QuestionOption(id: "a", textEN: "An operation that upsamples feature maps to increase spatial dimensions", textID: "Operasi yang meng-upsample feature maps untuk meningkatkan dimensi spasial"),
            QuestionOption(id: "b", textEN: "The reverse of applying a convolution to reduce size", textID: "Kebalikan dari menerapkan konvolusi untuk mengurangi ukuran"),
            QuestionOption(id: "c", textEN: "A transpose of the weight matrix", textID: "Transpose dari matriks bobot"),
            QuestionOption(id: "d", textEN: "Removing convolution layers", textID: "Menghapus layer konvolusi")
        ],
        correctOptionId: "a",
        explanationEN: "Transposed convolution (also called fractionally strided convolution) increases spatial dimensions, used in decoder networks for segmentation and generation.",
        explanationID: "Transposed convolution (juga disebut fractionally strided convolution) meningkatkan dimensi spasial, digunakan dalam decoder networks untuk segmentasi dan generasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv044",
        questionEN: "What is the purpose of anchor boxes in object detection?",
        questionID: "Apa tujuan dari anchor boxes dalam object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Pre-defined box shapes at each location to help detect objects of various sizes/ratios", textID: "Bentuk box yang telah didefinisikan di setiap lokasi untuk membantu mendeteksi objek berbagai ukuran/rasio"),
            QuestionOption(id: "b", textEN: "To fix the boxes in place", textID: "Untuk memperbaiki box di tempatnya"),
            QuestionOption(id: "c", textEN: "To reduce the number of detections", textID: "Untuk mengurangi jumlah deteksi"),
            QuestionOption(id: "d", textEN: "To anchor the network to the ground", textID: "Untuk menambatkan network ke tanah")
        ],
        correctOptionId: "a",
        explanationEN: "Anchor boxes are predefined bounding boxes of various aspect ratios and scales. The network predicts offsets from these anchors rather than absolute coordinates.",
        explanationID: "Anchor boxes adalah bounding box yang telah didefinisikan dengan berbagai rasio aspek dan skala. Network memprediksi offset dari anchor ini daripada koordinat absolut.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "cv045",
        questionEN: "What is mAP (mean Average Precision)?",
        questionID: "Apa itu mAP (mean Average Precision)?",
        options: [
            QuestionOption(id: "a", textEN: "A common evaluation metric for object detection averaging AP across classes", textID: "Metrik evaluasi umum untuk object detection yang merata-ratakan AP di seluruh kelas"),
            QuestionOption(id: "b", textEN: "The maximum precision achieved", textID: "Presisi maksimum yang dicapai"),
            QuestionOption(id: "c", textEN: "A type of loss function", textID: "Jenis fungsi loss"),
            QuestionOption(id: "d", textEN: "The mapping between classes", textID: "Pemetaan antar kelas")
        ],
        correctOptionId: "a",
        explanationEN: "mAP computes Average Precision (area under precision-recall curve) for each class, then averages across all classes. It's the standard metric for detection.",
        explanationID: "mAP menghitung Average Precision (area di bawah kurva precision-recall) untuk setiap kelas, lalu merata-ratakan di semua kelas. Ini adalah metrik standar untuk detection.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv046",
        questionEN: "What is style transfer in computer vision?",
        questionID: "Apa itu style transfer dalam computer vision?",
        options: [
            QuestionOption(id: "a", textEN: "Applying the artistic style of one image to the content of another", textID: "Menerapkan gaya artistik dari satu gambar ke konten gambar lain"),
            QuestionOption(id: "b", textEN: "Transferring images between devices", textID: "Mentransfer gambar antar perangkat"),
            QuestionOption(id: "c", textEN: "Converting image formats", textID: "Mengkonversi format gambar"),
            QuestionOption(id: "d", textEN: "Compressing images", textID: "Mengkompresi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Neural style transfer uses CNNs to separate and recombine content (structure) and style (textures, colors) from different images to create artistic effects.",
        explanationID: "Neural style transfer menggunakan CNN untuk memisahkan dan menggabungkan kembali konten (struktur) dan gaya (tekstur, warna) dari gambar berbeda untuk membuat efek artistik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv047",
        questionEN: "What is the difference between classification top-1 and top-5 accuracy?",
        questionID: "Apa perbedaan antara akurasi top-1 dan top-5 classification?",
        options: [
            QuestionOption(id: "a", textEN: "Top-1 checks if the highest prediction is correct; top-5 checks if correct class is in top 5 predictions", textID: "Top-1 memeriksa apakah prediksi tertinggi benar; top-5 memeriksa apakah kelas benar ada di 5 prediksi teratas"),
            QuestionOption(id: "b", textEN: "Top-5 only considers 5 classes", textID: "Top-5 hanya mempertimbangkan 5 kelas"),
            QuestionOption(id: "c", textEN: "Top-1 uses the first layer only", textID: "Top-1 hanya menggunakan layer pertama"),
            QuestionOption(id: "d", textEN: "They are the same", textID: "Mereka sama")
        ],
        correctOptionId: "a",
        explanationEN: "Top-1 accuracy requires the single highest-confidence prediction to be correct. Top-5 is correct if the true label is among the 5 highest predictions.",
        explanationID: "Akurasi top-1 membutuhkan prediksi dengan confidence tertinggi tunggal yang benar. Top-5 benar jika label sebenarnya ada di antara 5 prediksi tertinggi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "cv048",
        questionEN: "What is image captioning?",
        questionID: "Apa itu image captioning?",
        options: [
            QuestionOption(id: "a", textEN: "Generating a text description of an image using vision and language models", textID: "Menghasilkan deskripsi teks dari gambar menggunakan model vision dan language"),
            QuestionOption(id: "b", textEN: "Adding subtitles to videos", textID: "Menambahkan subtitle ke video"),
            QuestionOption(id: "c", textEN: "Classifying images into categories", textID: "Mengklasifikasikan gambar ke dalam kategori"),
            QuestionOption(id: "d", textEN: "Detecting objects in images", textID: "Mendeteksi objek dalam gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Image captioning combines a CNN encoder to extract visual features with a language model (often RNN/Transformer) to generate descriptive sentences.",
        explanationID: "Image captioning menggabungkan encoder CNN untuk mengekstrak fitur visual dengan model bahasa (sering RNN/Transformer) untuk menghasilkan kalimat deskriptif.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv049",
        questionEN: "What is Visual Question Answering (VQA)?",
        questionID: "Apa itu Visual Question Answering (VQA)?",
        options: [
            QuestionOption(id: "a", textEN: "Answering natural language questions about an image", textID: "Menjawab pertanyaan bahasa alami tentang gambar"),
            QuestionOption(id: "b", textEN: "Asking questions to improve image quality", textID: "Mengajukan pertanyaan untuk meningkatkan kualitas gambar"),
            QuestionOption(id: "c", textEN: "Validating image authenticity", textID: "Memvalidasi keaslian gambar"),
            QuestionOption(id: "d", textEN: "Generating questions about videos", textID: "Menghasilkan pertanyaan tentang video")
        ],
        correctOptionId: "a",
        explanationEN: "VQA requires understanding both image content and a text question to produce an answer, combining computer vision and natural language processing.",
        explanationID: "VQA membutuhkan pemahaman konten gambar dan pertanyaan teks untuk menghasilkan jawaban, menggabungkan computer vision dan natural language processing.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "cv050",
        questionEN: "What is Vision Transformer (ViT)?",
        questionID: "Apa itu Vision Transformer (ViT)?",
        options: [
            QuestionOption(id: "a", textEN: "Applying transformer architecture directly to image patches for classification", textID: "Menerapkan arsitektur transformer langsung ke patch gambar untuk classification"),
            QuestionOption(id: "b", textEN: "A CNN with attention layers", textID: "CNN dengan layer attention"),
            QuestionOption(id: "c", textEN: "Converting images to text", textID: "Mengkonversi gambar ke teks"),
            QuestionOption(id: "d", textEN: "A vision-only model without language", textID: "Model vision-only tanpa bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "ViT divides an image into fixed-size patches, treats them as tokens, and applies a standard transformer encoder. It achieves state-of-the-art results when trained on large datasets.",
        explanationID: "ViT membagi gambar menjadi patch berukuran tetap, memperlakukan mereka sebagai token, dan menerapkan encoder transformer standar. Ini mencapai hasil state-of-the-art ketika dilatih pada dataset besar.",
        topic: "aiMlDl",
        difficulty: .advanced
    )
]
