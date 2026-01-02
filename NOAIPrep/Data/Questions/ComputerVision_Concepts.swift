import Foundation

// MARK: - Computer Vision Concepts Questions (50)
// Topics: Image Processing, Object Detection, Segmentation, Data Augmentation, Transfer Learning
// Aligned with IOAI/NOAI Syllabus

let cvConceptsQuestions: [Question] = [
    // MARK: - Image Fundamentals (Questions 1-10)
    Question(
        id: "cv_concepts_001",
        questionEN: "How is a digital color image typically represented?",
        questionID: "Bagaimana gambar digital berwarna biasanya direpresentasikan?",
        options: [
            QuestionOption(id: "a", textEN: "A 3D tensor with height x width x channels (usually RGB)", textID: "Tensor 3D dengan tinggi x lebar x channel (biasanya RGB)"),
            QuestionOption(id: "b", textEN: "A 1D array of pixel values", textID: "Array 1D dari nilai piksel"),
            QuestionOption(id: "c", textEN: "A single matrix of values", textID: "Satu matriks nilai"),
            QuestionOption(id: "d", textEN: "A binary tree structure", textID: "Struktur binary tree")
        ],
        correctOptionId: "a",
        explanationEN: "Color images are typically 3D tensors with dimensions H x W x C, where C is usually 3 for RGB channels. Each pixel has intensity values for Red, Green, and Blue, typically ranging from 0-255.",
        explanationID: "Gambar berwarna biasanya tensor 3D dengan dimensi H x W x C, dimana C biasanya 3 untuk channel RGB. Setiap piksel memiliki nilai intensitas untuk Merah, Hijau, dan Biru, biasanya berkisar 0-255.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_002",
        questionEN: "What does image normalization typically do?",
        questionID: "Apa yang dilakukan normalisasi gambar?",
        options: [
            QuestionOption(id: "a", textEN: "Scales pixel values to a standard range like [0,1] or standardizes to zero mean and unit variance", textID: "Menskalakan nilai piksel ke rentang standar seperti [0,1] atau standarisasi ke mean nol dan variansi unit"),
            QuestionOption(id: "b", textEN: "Increases image resolution", textID: "Meningkatkan resolusi gambar"),
            QuestionOption(id: "c", textEN: "Removes noise from images", textID: "Menghapus noise dari gambar"),
            QuestionOption(id: "d", textEN: "Converts color to grayscale", textID: "Mengubah warna ke grayscale")
        ],
        correctOptionId: "a",
        explanationEN: "Image normalization scales pixel values to a standard range (e.g., dividing by 255 to get [0,1]) or standardizes using mean and std (e.g., ImageNet stats). This helps neural networks train more effectively.",
        explanationID: "Normalisasi gambar menskalakan nilai piksel ke rentang standar (misal, membagi 255 untuk mendapat [0,1]) atau standarisasi menggunakan mean dan std (misal, stats ImageNet). Ini membantu neural network berlatih lebih efektif.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_003",
        questionEN: "What is the purpose of a convolution operation in image processing?",
        questionID: "Apa tujuan operasi konvolusi dalam pemrosesan gambar?",
        options: [
            QuestionOption(id: "a", textEN: "To extract features by sliding a kernel/filter across the image", textID: "Mengekstrak fitur dengan menggeser kernel/filter melintasi gambar"),
            QuestionOption(id: "b", textEN: "To increase image size", textID: "Meningkatkan ukuran gambar"),
            QuestionOption(id: "c", textEN: "To convert images to text", textID: "Mengubah gambar ke teks"),
            QuestionOption(id: "d", textEN: "To remove all edges from images", textID: "Menghapus semua tepi dari gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Convolution slides a learnable kernel/filter across the image, computing element-wise multiplications and sums. Different kernels detect different features: edges, textures, shapes, etc.",
        explanationID: "Konvolusi menggeser kernel/filter yang dapat dipelajari melintasi gambar, menghitung perkalian dan penjumlahan element-wise. Kernel berbeda mendeteksi fitur berbeda: tepi, tekstur, bentuk, dll.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_004",
        questionEN: "What is a grayscale image?",
        questionID: "Apa itu gambar grayscale?",
        options: [
            QuestionOption(id: "a", textEN: "An image with only one channel representing intensity from black to white", textID: "Gambar dengan hanya satu channel yang merepresentasikan intensitas dari hitam ke putih"),
            QuestionOption(id: "b", textEN: "An image with only gray colors", textID: "Gambar dengan hanya warna abu-abu"),
            QuestionOption(id: "c", textEN: "A low-resolution image", textID: "Gambar resolusi rendah"),
            QuestionOption(id: "d", textEN: "An image with reduced file size", textID: "Gambar dengan ukuran file berkurang")
        ],
        correctOptionId: "a",
        explanationEN: "A grayscale image has a single channel where each pixel value represents intensity, typically from 0 (black) to 255 (white). It's a 2D matrix rather than a 3D tensor like RGB images.",
        explanationID: "Gambar grayscale memiliki satu channel dimana setiap nilai piksel merepresentasikan intensitas, biasanya dari 0 (hitam) sampai 255 (putih). Ini adalah matriks 2D bukan tensor 3D seperti gambar RGB.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_005",
        questionEN: "What is the receptive field in CNNs?",
        questionID: "Apa itu receptive field dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "The region of the input image that affects a particular feature in a layer", textID: "Region dari gambar input yang mempengaruhi fitur tertentu dalam suatu layer"),
            QuestionOption(id: "b", textEN: "The number of filters in a layer", textID: "Jumlah filter dalam suatu layer"),
            QuestionOption(id: "c", textEN: "The output size of the network", textID: "Ukuran output dari jaringan"),
            QuestionOption(id: "d", textEN: "The learning rate of the model", textID: "Learning rate dari model")
        ],
        correctOptionId: "a",
        explanationEN: "The receptive field is the region of the original input image that influences a particular neuron's activation. Deeper layers have larger receptive fields, allowing them to capture more global features.",
        explanationID: "Receptive field adalah region dari gambar input asli yang mempengaruhi aktivasi neuron tertentu. Layer yang lebih dalam memiliki receptive field lebih besar, memungkinkan mereka menangkap fitur yang lebih global.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_006",
        questionEN: "What edge detection kernel is commonly used in image processing?",
        questionID: "Kernel deteksi tepi apa yang umum digunakan dalam pemrosesan gambar?",
        options: [
            QuestionOption(id: "a", textEN: "Sobel kernel", textID: "Kernel Sobel"),
            QuestionOption(id: "b", textEN: "Identity kernel", textID: "Kernel identitas"),
            QuestionOption(id: "c", textEN: "Averaging kernel", textID: "Kernel rata-rata"),
            QuestionOption(id: "d", textEN: "Maximum kernel", textID: "Kernel maksimum")
        ],
        correctOptionId: "a",
        explanationEN: "The Sobel kernel is commonly used for edge detection. It computes gradients in x and y directions. Other edge detectors include Canny, Prewitt, and Laplacian filters.",
        explanationID: "Kernel Sobel umum digunakan untuk deteksi tepi. Ini menghitung gradien dalam arah x dan y. Detektor tepi lain termasuk filter Canny, Prewitt, dan Laplacian.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_007",
        questionEN: "What is an image histogram?",
        questionID: "Apa itu histogram gambar?",
        options: [
            QuestionOption(id: "a", textEN: "A distribution of pixel intensity values in an image", textID: "Distribusi nilai intensitas piksel dalam gambar"),
            QuestionOption(id: "b", textEN: "A type of image filter", textID: "Jenis filter gambar"),
            QuestionOption(id: "c", textEN: "A neural network architecture", textID: "Arsitektur neural network"),
            QuestionOption(id: "d", textEN: "A method to compress images", textID: "Metode untuk mengompres gambar")
        ],
        correctOptionId: "a",
        explanationEN: "An image histogram shows the distribution of pixel intensity values. It helps understand image characteristics like contrast, brightness, and exposure. Histogram equalization can improve contrast.",
        explanationID: "Histogram gambar menunjukkan distribusi nilai intensitas piksel. Ini membantu memahami karakteristik gambar seperti kontras, kecerahan, dan eksposur. Ekualisasi histogram dapat meningkatkan kontras.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_008",
        questionEN: "What is spatial invariance in CNNs?",
        questionID: "Apa itu spatial invariance dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "The ability to detect features regardless of their position in the image", textID: "Kemampuan mendeteksi fitur tanpa memandang posisinya dalam gambar"),
            QuestionOption(id: "b", textEN: "The fixed size of input images", textID: "Ukuran tetap gambar input"),
            QuestionOption(id: "c", textEN: "The number of spatial dimensions", textID: "Jumlah dimensi spasial"),
            QuestionOption(id: "d", textEN: "The resolution of feature maps", textID: "Resolusi feature maps")
        ],
        correctOptionId: "a",
        explanationEN: "Spatial/translation invariance means CNNs can recognize features regardless of where they appear in the image. This is achieved through weight sharing in convolutions and pooling operations.",
        explanationID: "Spatial/translation invariance berarti CNN dapat mengenali fitur tanpa memandang dimana mereka muncul dalam gambar. Ini dicapai melalui weight sharing dalam konvolusi dan operasi pooling.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_009",
        questionEN: "What is a feature map in CNNs?",
        questionID: "Apa itu feature map dalam CNN?",
        options: [
            QuestionOption(id: "a", textEN: "The output of a convolutional layer showing where specific features are detected", textID: "Output dari layer konvolusi yang menunjukkan dimana fitur spesifik terdeteksi"),
            QuestionOption(id: "b", textEN: "A map of the network architecture", textID: "Peta arsitektur jaringan"),
            QuestionOption(id: "c", textEN: "A list of all features in the dataset", textID: "Daftar semua fitur dalam dataset"),
            QuestionOption(id: "d", textEN: "The input image", textID: "Gambar input")
        ],
        correctOptionId: "a",
        explanationEN: "A feature map (activation map) is the output of applying a filter to the input. Each filter produces one feature map showing where that particular feature (edge, texture, etc.) is detected in the input.",
        explanationID: "Feature map (activation map) adalah output dari menerapkan filter ke input. Setiap filter menghasilkan satu feature map yang menunjukkan dimana fitur tertentu (tepi, tekstur, dll.) terdeteksi dalam input.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_010",
        questionEN: "What is the difference between valid and same padding in convolution?",
        questionID: "Apa perbedaan antara valid dan same padding dalam konvolusi?",
        options: [
            QuestionOption(id: "a", textEN: "Valid: no padding, output shrinks; Same: padding added to keep output size equal to input", textID: "Valid: tanpa padding, output menyusut; Same: padding ditambahkan untuk menjaga ukuran output sama dengan input"),
            QuestionOption(id: "b", textEN: "Valid is faster, Same is more accurate", textID: "Valid lebih cepat, Same lebih akurat"),
            QuestionOption(id: "c", textEN: "Valid uses zeros, Same uses ones", textID: "Valid menggunakan nol, Same menggunakan satu"),
            QuestionOption(id: "d", textEN: "They produce identical results", textID: "Mereka menghasilkan hasil identik")
        ],
        correctOptionId: "a",
        explanationEN: "Valid padding uses no padding, so output dimensions shrink. Same padding adds zeros around the input so that output dimensions equal input dimensions (when stride=1). Same padding preserves spatial information at edges.",
        explanationID: "Valid padding tidak menggunakan padding, jadi dimensi output menyusut. Same padding menambahkan nol di sekitar input sehingga dimensi output sama dengan dimensi input (ketika stride=1). Same padding mempertahankan informasi spasial di tepi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Object Detection (Questions 11-20)
    Question(
        id: "cv_concepts_011",
        questionEN: "What is object detection?",
        questionID: "Apa itu object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Identifying and localizing objects in images with bounding boxes and class labels", textID: "Mengidentifikasi dan melokalisasi objek dalam gambar dengan bounding box dan label kelas"),
            QuestionOption(id: "b", textEN: "Classifying the entire image into one category", textID: "Mengklasifikasikan seluruh gambar ke dalam satu kategori"),
            QuestionOption(id: "c", textEN: "Segmenting every pixel in the image", textID: "Mensegmentasi setiap piksel dalam gambar"),
            QuestionOption(id: "d", textEN: "Generating new images", textID: "Menghasilkan gambar baru")
        ],
        correctOptionId: "a",
        explanationEN: "Object detection identifies what objects are present in an image (classification) and where they are located (localization with bounding boxes). It outputs class labels and coordinates for each detected object.",
        explanationID: "Object detection mengidentifikasi objek apa yang ada dalam gambar (klasifikasi) dan dimana lokasinya (lokalisasi dengan bounding box). Menghasilkan label kelas dan koordinat untuk setiap objek yang terdeteksi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_012",
        questionEN: "What is IoU (Intersection over Union) used for?",
        questionID: "Untuk apa IoU (Intersection over Union) digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring overlap between predicted and ground truth bounding boxes", textID: "Mengukur overlap antara bounding box prediksi dan ground truth"),
            QuestionOption(id: "b", textEN: "Measuring image quality", textID: "Mengukur kualitas gambar"),
            QuestionOption(id: "c", textEN: "Calculating network depth", textID: "Menghitung kedalaman jaringan"),
            QuestionOption(id: "d", textEN: "Determining learning rate", textID: "Menentukan learning rate")
        ],
        correctOptionId: "a",
        explanationEN: "IoU = (Area of Intersection) / (Area of Union) between two boxes. It ranges from 0 (no overlap) to 1 (perfect overlap). IoU is used to evaluate object detection accuracy and in Non-Maximum Suppression.",
        explanationID: "IoU = (Area Irisan) / (Area Gabungan) antara dua kotak. Berkisar dari 0 (tidak ada overlap) sampai 1 (overlap sempurna). IoU digunakan untuk mengevaluasi akurasi deteksi objek dan dalam Non-Maximum Suppression.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_013",
        questionEN: "What is Non-Maximum Suppression (NMS)?",
        questionID: "Apa itu Non-Maximum Suppression (NMS)?",
        options: [
            QuestionOption(id: "a", textEN: "A technique to remove redundant overlapping bounding boxes, keeping only the best ones", textID: "Teknik untuk menghapus bounding box yang tumpang tindih berlebihan, hanya menyimpan yang terbaik"),
            QuestionOption(id: "b", textEN: "A method to increase detection confidence", textID: "Metode untuk meningkatkan confidence deteksi"),
            QuestionOption(id: "c", textEN: "A way to add more bounding boxes", textID: "Cara menambahkan lebih banyak bounding box"),
            QuestionOption(id: "d", textEN: "A training optimization technique", textID: "Teknik optimasi training")
        ],
        correctOptionId: "a",
        explanationEN: "NMS removes duplicate detections by keeping only the highest confidence box among overlapping boxes (IoU > threshold). This ensures each object is detected once, not multiple times with overlapping boxes.",
        explanationID: "NMS menghapus deteksi duplikat dengan hanya menyimpan kotak dengan confidence tertinggi di antara kotak yang tumpang tindih (IoU > threshold). Ini memastikan setiap objek terdeteksi sekali, bukan beberapa kali dengan kotak yang tumpang tindih.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_014",
        questionEN: "What is an anchor box in object detection?",
        questionID: "Apa itu anchor box dalam object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Pre-defined boxes of various shapes/sizes used as reference for predictions", textID: "Kotak yang telah ditentukan dengan berbagai bentuk/ukuran yang digunakan sebagai referensi untuk prediksi"),
            QuestionOption(id: "b", textEN: "The first bounding box detected", textID: "Bounding box pertama yang terdeteksi"),
            QuestionOption(id: "c", textEN: "A box that cannot be moved", textID: "Kotak yang tidak bisa dipindahkan"),
            QuestionOption(id: "d", textEN: "The largest box in the image", textID: "Kotak terbesar dalam gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Anchor boxes are pre-defined boxes of different aspect ratios and scales. The model predicts offsets relative to these anchors rather than absolute coordinates, making it easier to detect objects of varying shapes.",
        explanationID: "Anchor box adalah kotak yang telah ditentukan dengan rasio aspek dan skala berbeda. Model memprediksi offset relatif terhadap anchor ini daripada koordinat absolut, memudahkan deteksi objek dengan berbagai bentuk.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_015",
        questionEN: "What is the difference between one-stage and two-stage object detectors?",
        questionID: "Apa perbedaan antara detektor objek satu tahap dan dua tahap?",
        options: [
            QuestionOption(id: "a", textEN: "One-stage predicts directly; two-stage first proposes regions then classifies them", textID: "Satu tahap memprediksi langsung; dua tahap pertama mengusulkan region lalu mengklasifikasikannya"),
            QuestionOption(id: "b", textEN: "One-stage is older; two-stage is newer", textID: "Satu tahap lebih lama; dua tahap lebih baru"),
            QuestionOption(id: "c", textEN: "One-stage uses CPU; two-stage uses GPU", textID: "Satu tahap menggunakan CPU; dua tahap menggunakan GPU"),
            QuestionOption(id: "d", textEN: "They are identical in approach", textID: "Keduanya identik dalam pendekatan")
        ],
        correctOptionId: "a",
        explanationEN: "Two-stage detectors (R-CNN family) first generate region proposals, then classify them. One-stage detectors (YOLO, SSD) directly predict boxes and classes in a single pass, making them faster but sometimes less accurate.",
        explanationID: "Detektor dua tahap (keluarga R-CNN) pertama menghasilkan region proposals, lalu mengklasifikasikannya. Detektor satu tahap (YOLO, SSD) langsung memprediksi kotak dan kelas dalam satu pass, membuatnya lebih cepat tapi terkadang kurang akurat.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_016",
        questionEN: "What does YOLO stand for?",
        questionID: "Apa kepanjangan YOLO?",
        options: [
            QuestionOption(id: "a", textEN: "You Only Look Once", textID: "You Only Look Once"),
            QuestionOption(id: "b", textEN: "Your Object Localization Output", textID: "Your Object Localization Output"),
            QuestionOption(id: "c", textEN: "Yield Optimal Location Output", textID: "Yield Optimal Location Output"),
            QuestionOption(id: "d", textEN: "Yellow Object Label Optimizer", textID: "Yellow Object Label Optimizer")
        ],
        correctOptionId: "a",
        explanationEN: "YOLO (You Only Look Once) is a real-time object detection system that processes the entire image in a single forward pass, making it very fast. It divides the image into a grid and predicts boxes and classes simultaneously.",
        explanationID: "YOLO (You Only Look Once) adalah sistem deteksi objek real-time yang memproses seluruh gambar dalam satu forward pass, membuatnya sangat cepat. Membagi gambar menjadi grid dan memprediksi kotak dan kelas secara bersamaan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_017",
        questionEN: "What is mean Average Precision (mAP) in object detection?",
        questionID: "Apa itu mean Average Precision (mAP) dalam object detection?",
        options: [
            QuestionOption(id: "a", textEN: "The mean of Average Precision across all classes, measuring detection performance", textID: "Rata-rata Average Precision di semua kelas, mengukur performa deteksi"),
            QuestionOption(id: "b", textEN: "The maximum precision achieved", textID: "Presisi maksimum yang dicapai"),
            QuestionOption(id: "c", textEN: "The average image size", textID: "Ukuran gambar rata-rata"),
            QuestionOption(id: "d", textEN: "The mean number of predictions", textID: "Jumlah prediksi rata-rata")
        ],
        correctOptionId: "a",
        explanationEN: "mAP is the standard metric for object detection. AP is calculated for each class (area under precision-recall curve at different IoU thresholds), and mAP averages these across all classes.",
        explanationID: "mAP adalah metrik standar untuk deteksi objek. AP dihitung untuk setiap kelas (area di bawah kurva precision-recall pada threshold IoU berbeda), dan mAP merata-ratakan ini di semua kelas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_018",
        questionEN: "What is Feature Pyramid Network (FPN) used for?",
        questionID: "Untuk apa Feature Pyramid Network (FPN) digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Building multi-scale feature maps to detect objects of different sizes", textID: "Membangun feature map multi-skala untuk mendeteksi objek dengan ukuran berbeda"),
            QuestionOption(id: "b", textEN: "Creating pyramid-shaped images", textID: "Membuat gambar berbentuk piramida"),
            QuestionOption(id: "c", textEN: "Reducing network parameters", textID: "Mengurangi parameter jaringan"),
            QuestionOption(id: "d", textEN: "Generating synthetic images", textID: "Menghasilkan gambar sintetis")
        ],
        correctOptionId: "a",
        explanationEN: "FPN creates a pyramid of feature maps at different scales by combining low-resolution, semantically strong features with high-resolution, semantically weak features. This helps detect objects of various sizes effectively.",
        explanationID: "FPN membuat piramida feature map pada skala berbeda dengan menggabungkan fitur resolusi rendah yang kuat secara semantik dengan fitur resolusi tinggi yang lemah secara semantik. Ini membantu mendeteksi objek berbagai ukuran secara efektif.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_019",
        questionEN: "What is Region Proposal Network (RPN) in Faster R-CNN?",
        questionID: "Apa itu Region Proposal Network (RPN) dalam Faster R-CNN?",
        options: [
            QuestionOption(id: "a", textEN: "A network that proposes regions likely to contain objects", textID: "Jaringan yang mengusulkan region yang kemungkinan berisi objek"),
            QuestionOption(id: "b", textEN: "A network that removes regions", textID: "Jaringan yang menghapus region"),
            QuestionOption(id: "c", textEN: "A network for image classification", textID: "Jaringan untuk klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "A network for image generation", textID: "Jaringan untuk generasi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "RPN is a fully convolutional network that generates region proposals (potential object locations) with objectness scores. It shares features with the detection network, making Faster R-CNN much faster than earlier R-CNN versions.",
        explanationID: "RPN adalah fully convolutional network yang menghasilkan region proposals (lokasi objek potensial) dengan skor objectness. Berbagi fitur dengan jaringan deteksi, membuat Faster R-CNN jauh lebih cepat dari versi R-CNN sebelumnya.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_020",
        questionEN: "What IoU threshold is commonly used to define a positive detection?",
        questionID: "Ambang IoU berapa yang umum digunakan untuk mendefinisikan deteksi positif?",
        options: [
            QuestionOption(id: "a", textEN: "0.5 (a detection is correct if IoU >= 0.5 with ground truth)", textID: "0.5 (deteksi benar jika IoU >= 0.5 dengan ground truth)"),
            QuestionOption(id: "b", textEN: "0.1", textID: "0.1"),
            QuestionOption(id: "c", textEN: "0.9", textID: "0.9"),
            QuestionOption(id: "d", textEN: "1.0", textID: "1.0")
        ],
        correctOptionId: "a",
        explanationEN: "IoU >= 0.5 is the common threshold for considering a detection as correct (true positive). Some benchmarks use stricter thresholds like 0.75, or evaluate across multiple thresholds (mAP@0.5:0.95).",
        explanationID: "IoU >= 0.5 adalah ambang umum untuk menganggap deteksi benar (true positive). Beberapa benchmark menggunakan ambang lebih ketat seperti 0.75, atau mengevaluasi di berbagai ambang (mAP@0.5:0.95).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Image Segmentation (Questions 21-30)
    Question(
        id: "cv_concepts_021",
        questionEN: "What is semantic segmentation?",
        questionID: "Apa itu semantic segmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Classifying every pixel in an image into predefined categories", textID: "Mengklasifikasikan setiap piksel dalam gambar ke dalam kategori yang telah ditentukan"),
            QuestionOption(id: "b", textEN: "Detecting objects with bounding boxes", textID: "Mendeteksi objek dengan bounding box"),
            QuestionOption(id: "c", textEN: "Classifying the entire image", textID: "Mengklasifikasikan seluruh gambar"),
            QuestionOption(id: "d", textEN: "Removing background from images", textID: "Menghapus latar belakang dari gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Semantic segmentation assigns a class label to every pixel. All pixels of the same class get the same label regardless of instance (e.g., all 'car' pixels are labeled the same, even if there are multiple cars).",
        explanationID: "Semantic segmentation memberikan label kelas ke setiap piksel. Semua piksel dari kelas yang sama mendapat label yang sama tanpa memandang instance (misal, semua piksel 'mobil' dilabeli sama, bahkan jika ada beberapa mobil).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_022",
        questionEN: "What is instance segmentation?",
        questionID: "Apa itu instance segmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Segmenting and distinguishing individual object instances of the same class", textID: "Mensegmentasi dan membedakan instance objek individual dari kelas yang sama"),
            QuestionOption(id: "b", textEN: "Segmenting only one instance per image", textID: "Mensegmentasi hanya satu instance per gambar"),
            QuestionOption(id: "c", textEN: "The same as semantic segmentation", textID: "Sama dengan semantic segmentation"),
            QuestionOption(id: "d", textEN: "Detecting objects without segmentation", textID: "Mendeteksi objek tanpa segmentasi")
        ],
        correctOptionId: "a",
        explanationEN: "Instance segmentation combines object detection with semantic segmentation - it segments objects at the pixel level while distinguishing between different instances of the same class (e.g., car1, car2, car3).",
        explanationID: "Instance segmentation menggabungkan deteksi objek dengan semantic segmentation - mensegmentasi objek pada level piksel sambil membedakan antara instance berbeda dari kelas yang sama (misal, mobil1, mobil2, mobil3).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_023",
        questionEN: "What architecture is U-Net known for?",
        questionID: "Arsitektur apa yang dikenal dari U-Net?",
        options: [
            QuestionOption(id: "a", textEN: "Encoder-decoder with skip connections forming a U shape", textID: "Encoder-decoder dengan skip connections membentuk bentuk U"),
            QuestionOption(id: "b", textEN: "A very deep linear network", textID: "Jaringan linear yang sangat dalam"),
            QuestionOption(id: "c", textEN: "A recurrent network for images", textID: "Jaringan recurrent untuk gambar"),
            QuestionOption(id: "d", textEN: "A transformer-only architecture", textID: "Arsitektur hanya transformer")
        ],
        correctOptionId: "a",
        explanationEN: "U-Net has a contracting encoder path (downsampling) and an expansive decoder path (upsampling) connected by skip connections, forming a U shape. Skip connections help preserve fine-grained spatial details.",
        explanationID: "U-Net memiliki jalur encoder yang menyusut (downsampling) dan jalur decoder yang meluas (upsampling) yang dihubungkan oleh skip connections, membentuk bentuk U. Skip connections membantu mempertahankan detail spasial yang halus.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_024",
        questionEN: "What is the purpose of upsampling/transposed convolution in segmentation?",
        questionID: "Apa tujuan upsampling/transposed convolution dalam segmentasi?",
        options: [
            QuestionOption(id: "a", textEN: "To increase spatial resolution back to the original image size for pixel-wise predictions", textID: "Meningkatkan resolusi spasial kembali ke ukuran gambar asli untuk prediksi per piksel"),
            QuestionOption(id: "b", textEN: "To reduce the number of parameters", textID: "Mengurangi jumlah parameter"),
            QuestionOption(id: "c", textEN: "To make the model faster", textID: "Membuat model lebih cepat"),
            QuestionOption(id: "d", textEN: "To remove noise from features", textID: "Menghapus noise dari fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Upsampling (via transposed convolution, bilinear interpolation, etc.) increases spatial resolution. In segmentation, it restores the feature maps to input resolution so we can make pixel-wise predictions.",
        explanationID: "Upsampling (melalui transposed convolution, interpolasi bilinear, dll.) meningkatkan resolusi spasial. Dalam segmentasi, ini mengembalikan feature maps ke resolusi input sehingga kita dapat membuat prediksi per piksel.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_025",
        questionEN: "What is dilated (atrous) convolution?",
        questionID: "Apa itu dilated (atrous) convolution?",
        options: [
            QuestionOption(id: "a", textEN: "Convolution with gaps between kernel elements to increase receptive field without adding parameters", textID: "Konvolusi dengan jarak antara elemen kernel untuk meningkatkan receptive field tanpa menambah parameter"),
            QuestionOption(id: "b", textEN: "A faster version of standard convolution", textID: "Versi konvolusi standar yang lebih cepat"),
            QuestionOption(id: "c", textEN: "Convolution that reduces image size", textID: "Konvolusi yang mengurangi ukuran gambar"),
            QuestionOption(id: "d", textEN: "A convolution with more filters", textID: "Konvolusi dengan lebih banyak filter")
        ],
        correctOptionId: "a",
        explanationEN: "Dilated convolution inserts gaps (holes) between kernel elements, expanding the receptive field without increasing parameters or reducing resolution. Rate=2 means one gap between elements. Used in DeepLab for segmentation.",
        explanationID: "Dilated convolution menyisipkan jarak (lubang) antara elemen kernel, memperluas receptive field tanpa meningkatkan parameter atau mengurangi resolusi. Rate=2 berarti satu jarak antara elemen. Digunakan dalam DeepLab untuk segmentasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_026",
        questionEN: "What metric is commonly used to evaluate segmentation?",
        questionID: "Metrik apa yang umum digunakan untuk mengevaluasi segmentasi?",
        options: [
            QuestionOption(id: "a", textEN: "Intersection over Union (IoU) or Dice coefficient", textID: "Intersection over Union (IoU) atau koefisien Dice"),
            QuestionOption(id: "b", textEN: "Accuracy only", textID: "Hanya akurasi"),
            QuestionOption(id: "c", textEN: "F1 score only", textID: "Hanya F1 score"),
            QuestionOption(id: "d", textEN: "AUC-ROC", textID: "AUC-ROC")
        ],
        correctOptionId: "a",
        explanationEN: "IoU (Jaccard index) and Dice coefficient are standard for segmentation. Mean IoU (mIoU) averages IoU across classes. Dice = 2x|A n B|/(|A|+|B|) is similar to IoU but weights overlap differently.",
        explanationID: "IoU (indeks Jaccard) dan koefisien Dice adalah standar untuk segmentasi. Mean IoU (mIoU) merata-ratakan IoU di semua kelas. Dice = 2x|A n B|/(|A|+|B|) mirip dengan IoU tapi membobotkan overlap secara berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_027",
        questionEN: "What is panoptic segmentation?",
        questionID: "Apa itu panoptic segmentation?",
        options: [
            QuestionOption(id: "a", textEN: "Unified segmentation combining semantic and instance segmentation for all pixels", textID: "Segmentasi terpadu yang menggabungkan semantic dan instance segmentation untuk semua piksel"),
            QuestionOption(id: "b", textEN: "360-degree image segmentation", textID: "Segmentasi gambar 360 derajat"),
            QuestionOption(id: "c", textEN: "Segmentation of panoramic images", textID: "Segmentasi gambar panorama"),
            QuestionOption(id: "d", textEN: "A simpler version of semantic segmentation", textID: "Versi semantic segmentation yang lebih sederhana")
        ],
        correctOptionId: "a",
        explanationEN: "Panoptic segmentation unifies semantic segmentation (for 'stuff' like sky, road) and instance segmentation (for 'things' like cars, people). Every pixel gets both a class label and instance ID where applicable.",
        explanationID: "Panoptic segmentation menyatukan semantic segmentation (untuk 'stuff' seperti langit, jalan) dan instance segmentation (untuk 'things' seperti mobil, orang). Setiap piksel mendapat label kelas dan ID instance jika berlaku.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_028",
        questionEN: "What loss function is commonly used for segmentation?",
        questionID: "Fungsi loss apa yang umum digunakan untuk segmentasi?",
        options: [
            QuestionOption(id: "a", textEN: "Cross-entropy loss (pixel-wise) or Dice loss", textID: "Cross-entropy loss (per piksel) atau Dice loss"),
            QuestionOption(id: "b", textEN: "Mean squared error only", textID: "Hanya mean squared error"),
            QuestionOption(id: "c", textEN: "Hinge loss", textID: "Hinge loss"),
            QuestionOption(id: "d", textEN: "Contrastive loss", textID: "Contrastive loss")
        ],
        correctOptionId: "a",
        explanationEN: "Pixel-wise cross-entropy treats each pixel as a classification task. Dice loss optimizes the Dice coefficient directly and handles class imbalance better. Often they're combined: total_loss = CE + lambda x Dice.",
        explanationID: "Cross-entropy per piksel memperlakukan setiap piksel sebagai tugas klasifikasi. Dice loss mengoptimalkan koefisien Dice secara langsung dan menangani ketidakseimbangan kelas lebih baik. Sering digabungkan: total_loss = CE + lambda x Dice.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_029",
        questionEN: "What is Mask R-CNN used for?",
        questionID: "Untuk apa Mask R-CNN digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Instance segmentation - detecting objects and generating pixel-wise masks", textID: "Instance segmentation - mendeteksi objek dan menghasilkan mask per piksel"),
            QuestionOption(id: "b", textEN: "Semantic segmentation only", textID: "Hanya semantic segmentation"),
            QuestionOption(id: "c", textEN: "Image classification", textID: "Klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "Image generation", textID: "Generasi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Mask R-CNN extends Faster R-CNN by adding a branch for predicting segmentation masks on each detected object. It performs object detection and instance segmentation simultaneously.",
        explanationID: "Mask R-CNN memperluas Faster R-CNN dengan menambahkan cabang untuk memprediksi mask segmentasi pada setiap objek yang terdeteksi. Melakukan deteksi objek dan instance segmentation secara bersamaan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_030",
        questionEN: "What is the role of skip connections in segmentation networks like U-Net?",
        questionID: "Apa peran skip connections dalam jaringan segmentasi seperti U-Net?",
        options: [
            QuestionOption(id: "a", textEN: "To combine high-resolution features with semantic features for precise localization", textID: "Menggabungkan fitur resolusi tinggi dengan fitur semantik untuk lokalisasi yang tepat"),
            QuestionOption(id: "b", textEN: "To skip training certain layers", textID: "Melewati training layer tertentu"),
            QuestionOption(id: "c", textEN: "To make the network faster", textID: "Membuat jaringan lebih cepat"),
            QuestionOption(id: "d", textEN: "To reduce the number of parameters", textID: "Mengurangi jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Skip connections concatenate low-level, high-resolution features from the encoder with upsampled semantic features in the decoder. This helps the network make precise, well-localized predictions.",
        explanationID: "Skip connections menggabungkan fitur level rendah, resolusi tinggi dari encoder dengan fitur semantik yang di-upsample dalam decoder. Ini membantu jaringan membuat prediksi yang tepat dan terlokalisasi dengan baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Data Augmentation (Questions 31-40)
    Question(
        id: "cv_concepts_031",
        questionEN: "What is data augmentation in computer vision?",
        questionID: "Apa itu data augmentation dalam computer vision?",
        options: [
            QuestionOption(id: "a", textEN: "Artificially increasing training data by applying transformations to existing images", textID: "Meningkatkan data training secara artifisial dengan menerapkan transformasi pada gambar yang ada"),
            QuestionOption(id: "b", textEN: "Collecting more images from the internet", textID: "Mengumpulkan lebih banyak gambar dari internet"),
            QuestionOption(id: "c", textEN: "Removing bad images from the dataset", textID: "Menghapus gambar buruk dari dataset"),
            QuestionOption(id: "d", textEN: "Compressing image file sizes", textID: "Mengompres ukuran file gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Data augmentation creates variations of training images through transformations (flipping, rotation, scaling, etc.). This increases effective dataset size, reduces overfitting, and improves model generalization.",
        explanationID: "Data augmentation membuat variasi gambar training melalui transformasi (flipping, rotasi, scaling, dll.). Ini meningkatkan ukuran dataset efektif, mengurangi overfitting, dan meningkatkan generalisasi model.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_032",
        questionEN: "Which augmentation is NOT typically used for object detection?",
        questionID: "Augmentasi mana yang TIDAK biasanya digunakan untuk object detection?",
        options: [
            QuestionOption(id: "a", textEN: "Vertical flip (for natural images where objects don't appear upside down)", textID: "Vertical flip (untuk gambar natural dimana objek tidak muncul terbalik)"),
            QuestionOption(id: "b", textEN: "Horizontal flip", textID: "Horizontal flip"),
            QuestionOption(id: "c", textEN: "Random crop", textID: "Random crop"),
            QuestionOption(id: "d", textEN: "Color jitter", textID: "Color jitter")
        ],
        correctOptionId: "a",
        explanationEN: "Vertical flipping creates unrealistic images for many applications (cars upside down, people inverted). Horizontal flip, cropping, and color changes preserve natural image characteristics while providing useful variation.",
        explanationID: "Vertical flipping membuat gambar tidak realistis untuk banyak aplikasi (mobil terbalik, orang terbalik). Horizontal flip, cropping, dan perubahan warna mempertahankan karakteristik gambar natural sambil memberikan variasi yang berguna.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_033",
        questionEN: "What is Mixup augmentation?",
        questionID: "Apa itu augmentasi Mixup?",
        options: [
            QuestionOption(id: "a", textEN: "Creating new samples by linearly interpolating pairs of images and their labels", textID: "Membuat sampel baru dengan menginterpolasi linear pasangan gambar dan labelnya"),
            QuestionOption(id: "b", textEN: "Mixing different datasets together", textID: "Mencampur dataset berbeda bersama"),
            QuestionOption(id: "c", textEN: "Randomly shuffling pixels", textID: "Mengacak piksel secara acak"),
            QuestionOption(id: "d", textEN: "Combining two models", textID: "Menggabungkan dua model")
        ],
        correctOptionId: "a",
        explanationEN: "Mixup creates new training samples by taking weighted averages of pairs of images and their labels: x~ = lambda*x1 + (1-lambda)*x2, y~ = lambda*y1 + (1-lambda)*y2. This regularizes the model and improves generalization.",
        explanationID: "Mixup membuat sampel training baru dengan mengambil rata-rata berbobot dari pasangan gambar dan labelnya: x~ = lambda*x1 + (1-lambda)*x2, y~ = lambda*y1 + (1-lambda)*y2. Ini meregularisasi model dan meningkatkan generalisasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_034",
        questionEN: "What is CutMix augmentation?",
        questionID: "Apa itu augmentasi CutMix?",
        options: [
            QuestionOption(id: "a", textEN: "Cutting a patch from one image and pasting it onto another, mixing labels proportionally", textID: "Memotong patch dari satu gambar dan menempelkannya ke gambar lain, mencampur label secara proporsional"),
            QuestionOption(id: "b", textEN: "Cutting images into smaller pieces", textID: "Memotong gambar menjadi potongan lebih kecil"),
            QuestionOption(id: "c", textEN: "Removing objects from images", textID: "Menghapus objek dari gambar"),
            QuestionOption(id: "d", textEN: "Mixing colors in images", textID: "Mencampur warna dalam gambar")
        ],
        correctOptionId: "a",
        explanationEN: "CutMix cuts a rectangular region from one image and pastes it onto another. Labels are mixed proportionally to the area. This is more effective than Cutout as no pixels are wasted.",
        explanationID: "CutMix memotong region persegi panjang dari satu gambar dan menempelkannya ke gambar lain. Label dicampur secara proporsional terhadap area. Ini lebih efektif daripada Cutout karena tidak ada piksel yang terbuang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_035",
        questionEN: "What is Cutout augmentation?",
        questionID: "Apa itu augmentasi Cutout?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly masking out square regions of the input image during training", textID: "Secara acak menutupi region persegi dari gambar input selama training"),
            QuestionOption(id: "b", textEN: "Cutting images into smaller pieces", textID: "Memotong gambar menjadi potongan lebih kecil"),
            QuestionOption(id: "c", textEN: "Removing the background", textID: "Menghapus latar belakang"),
            QuestionOption(id: "d", textEN: "Cropping to the object only", textID: "Memotong hanya ke objek")
        ],
        correctOptionId: "a",
        explanationEN: "Cutout randomly masks out (sets to zero or mean) square regions of the training image. This forces the network to focus on a variety of features rather than relying on specific image regions.",
        explanationID: "Cutout secara acak menutupi (mengatur ke nol atau mean) region persegi dari gambar training. Ini memaksa jaringan untuk fokus pada berbagai fitur daripada mengandalkan region gambar tertentu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_036",
        questionEN: "What is random erasing?",
        questionID: "Apa itu random erasing?",
        options: [
            QuestionOption(id: "a", textEN: "Similar to Cutout - randomly selecting a rectangle and erasing with random values", textID: "Mirip Cutout - secara acak memilih persegi panjang dan menghapus dengan nilai acak"),
            QuestionOption(id: "b", textEN: "Deleting images from the dataset", textID: "Menghapus gambar dari dataset"),
            QuestionOption(id: "c", textEN: "Removing specific objects", textID: "Menghapus objek tertentu"),
            QuestionOption(id: "d", textEN: "Reducing image resolution", textID: "Mengurangi resolusi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Random erasing randomly selects a rectangle region and replaces it with random values (or mean pixel value). It's similar to Cutout but the replaced values can vary, adding more randomness.",
        explanationID: "Random erasing secara acak memilih region persegi panjang dan menggantinya dengan nilai acak (atau nilai piksel mean). Mirip Cutout tapi nilai yang diganti bisa bervariasi, menambahkan lebih banyak keacakan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_037",
        questionEN: "What is AutoAugment?",
        questionID: "Apa itu AutoAugment?",
        options: [
            QuestionOption(id: "a", textEN: "Using reinforcement learning or search to automatically find optimal augmentation policies", textID: "Menggunakan reinforcement learning atau pencarian untuk secara otomatis menemukan kebijakan augmentasi optimal"),
            QuestionOption(id: "b", textEN: "Automatic image enhancement", textID: "Peningkatan gambar otomatis"),
            QuestionOption(id: "c", textEN: "Automatically collecting more data", textID: "Mengumpulkan lebih banyak data secara otomatis"),
            QuestionOption(id: "d", textEN: "Augmentation without human involvement", textID: "Augmentasi tanpa keterlibatan manusia")
        ],
        correctOptionId: "a",
        explanationEN: "AutoAugment uses search algorithms (like reinforcement learning) to find optimal augmentation policies for a given dataset. It automatically determines which augmentations and what magnitudes work best.",
        explanationID: "AutoAugment menggunakan algoritma pencarian (seperti reinforcement learning) untuk menemukan kebijakan augmentasi optimal untuk dataset tertentu. Secara otomatis menentukan augmentasi mana dan magnitudo apa yang paling baik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_038",
        questionEN: "Why is color jitter used as augmentation?",
        questionID: "Mengapa color jitter digunakan sebagai augmentasi?",
        options: [
            QuestionOption(id: "a", textEN: "To make models robust to lighting and color variations", textID: "Untuk membuat model robust terhadap variasi pencahayaan dan warna"),
            QuestionOption(id: "b", textEN: "To make images more colorful", textID: "Untuk membuat gambar lebih berwarna"),
            QuestionOption(id: "c", textEN: "To convert images to grayscale", textID: "Untuk mengubah gambar ke grayscale"),
            QuestionOption(id: "d", textEN: "To reduce file size", textID: "Untuk mengurangi ukuran file")
        ],
        correctOptionId: "a",
        explanationEN: "Color jitter randomly changes brightness, contrast, saturation, and hue. This makes models robust to different lighting conditions, camera settings, and natural color variations in real-world images.",
        explanationID: "Color jitter secara acak mengubah kecerahan, kontras, saturasi, dan hue. Ini membuat model robust terhadap kondisi pencahayaan berbeda, pengaturan kamera, dan variasi warna natural dalam gambar dunia nyata.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_039",
        questionEN: "What is the purpose of random resized crop?",
        questionID: "Apa tujuan random resized crop?",
        options: [
            QuestionOption(id: "a", textEN: "To simulate different scales and provide scale invariance", textID: "Untuk mensimulasikan skala berbeda dan memberikan scale invariance"),
            QuestionOption(id: "b", textEN: "To reduce image file size", textID: "Untuk mengurangi ukuran file gambar"),
            QuestionOption(id: "c", textEN: "To focus only on the center", textID: "Untuk fokus hanya pada pusat"),
            QuestionOption(id: "d", textEN: "To make all images the same size", textID: "Untuk membuat semua gambar berukuran sama")
        ],
        correctOptionId: "a",
        explanationEN: "Random resized crop selects a random portion of the image and resizes it to the target size. This provides scale augmentation and helps the model learn to recognize objects at different scales and positions.",
        explanationID: "Random resized crop memilih porsi acak dari gambar dan mengubah ukurannya ke ukuran target. Ini memberikan augmentasi skala dan membantu model belajar mengenali objek pada skala dan posisi berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_040",
        questionEN: "Should augmentation be applied during validation/testing?",
        questionID: "Haruskah augmentasi diterapkan saat validasi/testing?",
        options: [
            QuestionOption(id: "a", textEN: "No, augmentation is only applied during training", textID: "Tidak, augmentasi hanya diterapkan saat training"),
            QuestionOption(id: "b", textEN: "Yes, always apply the same augmentation", textID: "Ya, selalu terapkan augmentasi yang sama"),
            QuestionOption(id: "c", textEN: "Yes, but only horizontal flip", textID: "Ya, tapi hanya horizontal flip"),
            QuestionOption(id: "d", textEN: "It doesn't matter", textID: "Tidak masalah")
        ],
        correctOptionId: "a",
        explanationEN: "Augmentation is typically applied only during training to create variations. At test time, we want to evaluate on the actual images (often center cropped/resized to standard size) for consistent and reproducible results.",
        explanationID: "Augmentasi biasanya hanya diterapkan saat training untuk membuat variasi. Saat test, kita ingin mengevaluasi pada gambar aktual (sering di-center crop/resize ke ukuran standar) untuk hasil yang konsisten dan dapat direproduksi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // MARK: - Transfer Learning & Pre-trained Models (Questions 41-50)
    Question(
        id: "cv_concepts_041",
        questionEN: "What is transfer learning in computer vision?",
        questionID: "Apa itu transfer learning dalam computer vision?",
        options: [
            QuestionOption(id: "a", textEN: "Using a model pre-trained on one task as a starting point for another task", textID: "Menggunakan model yang telah di-pretrain pada satu tugas sebagai titik awal untuk tugas lain"),
            QuestionOption(id: "b", textEN: "Transferring images between computers", textID: "Mentransfer gambar antar komputer"),
            QuestionOption(id: "c", textEN: "Moving models from GPU to CPU", textID: "Memindahkan model dari GPU ke CPU"),
            QuestionOption(id: "d", textEN: "Converting image formats", textID: "Mengubah format gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Transfer learning uses knowledge from a model trained on a large dataset (like ImageNet) as initialization for a new task. This allows achieving good results even with limited data for the new task.",
        explanationID: "Transfer learning menggunakan pengetahuan dari model yang dilatih pada dataset besar (seperti ImageNet) sebagai inisialisasi untuk tugas baru. Ini memungkinkan mencapai hasil baik bahkan dengan data terbatas untuk tugas baru.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_042",
        questionEN: "What is ImageNet pre-training?",
        questionID: "Apa itu ImageNet pre-training?",
        options: [
            QuestionOption(id: "a", textEN: "Training a model on the ImageNet dataset (millions of images, 1000 classes) as a starting point", textID: "Melatih model pada dataset ImageNet (jutaan gambar, 1000 kelas) sebagai titik awal"),
            QuestionOption(id: "b", textEN: "Creating images with neural networks", textID: "Membuat gambar dengan neural network"),
            QuestionOption(id: "c", textEN: "A specific image format", textID: "Format gambar tertentu"),
            QuestionOption(id: "d", textEN: "An image compression technique", textID: "Teknik kompresi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "ImageNet pre-training trains models on the ImageNet dataset (1.2M+ images, 1000 classes). These pre-trained weights learn general visual features that transfer well to many computer vision tasks.",
        explanationID: "ImageNet pre-training melatih model pada dataset ImageNet (1.2M+ gambar, 1000 kelas). Bobot pre-trained ini mempelajari fitur visual umum yang transfer dengan baik ke banyak tugas computer vision.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "cv_concepts_043",
        questionEN: "What is fine-tuning in transfer learning?",
        questionID: "Apa itu fine-tuning dalam transfer learning?",
        options: [
            QuestionOption(id: "a", textEN: "Training a pre-trained model on new data, typically with a lower learning rate", textID: "Melatih model pre-trained pada data baru, biasanya dengan learning rate lebih rendah"),
            QuestionOption(id: "b", textEN: "Making the model smaller", textID: "Membuat model lebih kecil"),
            QuestionOption(id: "c", textEN: "Only using the model for inference", textID: "Hanya menggunakan model untuk inferensi"),
            QuestionOption(id: "d", textEN: "Removing layers from the model", textID: "Menghapus layer dari model")
        ],
        correctOptionId: "a",
        explanationEN: "Fine-tuning adapts a pre-trained model to a new task by training on new data, usually with a lower learning rate to avoid destroying learned features. Often, early layers are frozen initially, then gradually unfrozen.",
        explanationID: "Fine-tuning mengadaptasi model pre-trained ke tugas baru dengan melatih pada data baru, biasanya dengan learning rate lebih rendah untuk menghindari menghancurkan fitur yang dipelajari. Sering, layer awal dibekukan awalnya, lalu secara bertahap dibuka.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_044",
        questionEN: "What is feature extraction in transfer learning?",
        questionID: "Apa itu feature extraction dalam transfer learning?",
        options: [
            QuestionOption(id: "a", textEN: "Using a pre-trained model as a fixed feature extractor without updating its weights", textID: "Menggunakan model pre-trained sebagai feature extractor tetap tanpa memperbarui bobotnya"),
            QuestionOption(id: "b", textEN: "Extracting edges from images", textID: "Mengekstrak tepi dari gambar"),
            QuestionOption(id: "c", textEN: "Compressing image features", textID: "Mengompres fitur gambar"),
            QuestionOption(id: "d", textEN: "Removing features from images", textID: "Menghapus fitur dari gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Feature extraction uses pre-trained layers as a frozen feature extractor. Only a new classifier head is trained on the extracted features. This is faster and works well when new data is limited or similar to pre-training data.",
        explanationID: "Feature extraction menggunakan layer pre-trained sebagai feature extractor yang dibekukan. Hanya classifier head baru yang dilatih pada fitur yang diekstrak. Ini lebih cepat dan bekerja baik ketika data baru terbatas atau mirip dengan data pre-training.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_045",
        questionEN: "Why are early CNN layers often frozen during fine-tuning?",
        questionID: "Mengapa layer CNN awal sering dibekukan saat fine-tuning?",
        options: [
            QuestionOption(id: "a", textEN: "Early layers learn generic features (edges, textures) that transfer well across tasks", textID: "Layer awal mempelajari fitur generik (tepi, tekstur) yang transfer dengan baik antar tugas"),
            QuestionOption(id: "b", textEN: "Early layers are faster to compute", textID: "Layer awal lebih cepat untuk dihitung"),
            QuestionOption(id: "c", textEN: "Early layers have no useful features", textID: "Layer awal tidak memiliki fitur berguna"),
            QuestionOption(id: "d", textEN: "It's required by the framework", textID: "Diperlukan oleh framework")
        ],
        correctOptionId: "a",
        explanationEN: "Early CNN layers learn generic, low-level features like edges and textures that are useful across many tasks. Later layers learn task-specific features. Freezing early layers preserves useful generic features while adapting task-specific layers.",
        explanationID: "Layer CNN awal mempelajari fitur generik, level rendah seperti tepi dan tekstur yang berguna di banyak tugas. Layer selanjutnya mempelajari fitur spesifik tugas. Membekukan layer awal mempertahankan fitur generik berguna sambil mengadaptasi layer spesifik tugas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_046",
        questionEN: "What is CLIP (Contrastive Language-Image Pre-training)?",
        questionID: "Apa itu CLIP (Contrastive Language-Image Pre-training)?",
        options: [
            QuestionOption(id: "a", textEN: "A model trained to match images with their text descriptions using contrastive learning", textID: "Model yang dilatih untuk mencocokkan gambar dengan deskripsi teksnya menggunakan contrastive learning"),
            QuestionOption(id: "b", textEN: "A video editing tool", textID: "Alat edit video"),
            QuestionOption(id: "c", textEN: "An image compression method", textID: "Metode kompresi gambar"),
            QuestionOption(id: "d", textEN: "A data augmentation technique", textID: "Teknik augmentasi data")
        ],
        correctOptionId: "a",
        explanationEN: "CLIP learns visual concepts from natural language supervision by training on 400M image-text pairs. It matches images and text descriptions in a shared embedding space, enabling zero-shot image classification.",
        explanationID: "CLIP mempelajari konsep visual dari supervisi bahasa natural dengan melatih pada 400M pasangan gambar-teks. Mencocokkan gambar dan deskripsi teks dalam ruang embedding bersama, memungkinkan klasifikasi gambar zero-shot.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_047",
        questionEN: "What is zero-shot classification in vision models?",
        questionID: "Apa itu zero-shot classification dalam model vision?",
        options: [
            QuestionOption(id: "a", textEN: "Classifying images into categories the model was never explicitly trained on", textID: "Mengklasifikasikan gambar ke dalam kategori yang tidak pernah dilatih secara eksplisit pada model"),
            QuestionOption(id: "b", textEN: "Classification with zero accuracy", textID: "Klasifikasi dengan akurasi nol"),
            QuestionOption(id: "c", textEN: "Classification that takes zero time", textID: "Klasifikasi yang tidak membutuhkan waktu"),
            QuestionOption(id: "d", textEN: "Training with zero images", textID: "Training dengan nol gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Zero-shot classification classifies images into novel categories not seen during training. Models like CLIP can do this by comparing image features with text embeddings of category names, without task-specific training.",
        explanationID: "Zero-shot classification mengklasifikasikan gambar ke dalam kategori novel yang tidak dilihat saat training. Model seperti CLIP dapat melakukan ini dengan membandingkan fitur gambar dengan embedding teks dari nama kategori, tanpa training spesifik tugas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_048",
        questionEN: "What is the typical approach when you have very limited data for a new CV task?",
        questionID: "Apa pendekatan tipikal ketika Anda memiliki data sangat terbatas untuk tugas CV baru?",
        options: [
            QuestionOption(id: "a", textEN: "Use transfer learning with frozen pre-trained features and train only a small classifier", textID: "Gunakan transfer learning dengan fitur pre-trained yang dibekukan dan latih hanya classifier kecil"),
            QuestionOption(id: "b", textEN: "Train from scratch with more epochs", textID: "Latih dari awal dengan lebih banyak epoch"),
            QuestionOption(id: "c", textEN: "Use a larger model", textID: "Gunakan model lebih besar"),
            QuestionOption(id: "d", textEN: "Ignore the problem", textID: "Abaikan masalahnya")
        ],
        correctOptionId: "a",
        explanationEN: "With very limited data, feature extraction (frozen pre-trained backbone + small trainable classifier) works best. Fine-tuning all layers risks overfitting. Data augmentation also helps maximize limited data.",
        explanationID: "Dengan data sangat terbatas, feature extraction (backbone pre-trained yang dibekukan + classifier yang dapat dilatih kecil) bekerja paling baik. Fine-tuning semua layer berisiko overfitting. Data augmentation juga membantu memaksimalkan data terbatas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "cv_concepts_049",
        questionEN: "What is Vision Transformer (ViT)?",
        questionID: "Apa itu Vision Transformer (ViT)?",
        options: [
            QuestionOption(id: "a", textEN: "A Transformer architecture applied to images by treating image patches as tokens", textID: "Arsitektur Transformer yang diterapkan pada gambar dengan memperlakukan patch gambar sebagai token"),
            QuestionOption(id: "b", textEN: "A transformer that only processes video", textID: "Transformer yang hanya memproses video"),
            QuestionOption(id: "c", textEN: "A CNN with attention layers", textID: "CNN dengan layer attention"),
            QuestionOption(id: "d", textEN: "An image generation model", textID: "Model generasi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "ViT divides an image into fixed-size patches (e.g., 16x16), linearly embeds them, adds position embeddings, and processes them with a standard Transformer encoder. It achieves excellent results when pre-trained on large data.",
        explanationID: "ViT membagi gambar menjadi patch berukuran tetap (misal, 16x16), mengembedkannya secara linear, menambahkan position embedding, dan memprosesnya dengan Transformer encoder standar. Mencapai hasil sangat baik ketika di-pretrain pada data besar.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "cv_concepts_050",
        questionEN: "What is domain shift in transfer learning?",
        questionID: "Apa itu domain shift dalam transfer learning?",
        options: [
            QuestionOption(id: "a", textEN: "When source and target data distributions differ, reducing transfer effectiveness", textID: "Ketika distribusi data sumber dan target berbeda, mengurangi efektivitas transfer"),
            QuestionOption(id: "b", textEN: "Moving the model to a different server", textID: "Memindahkan model ke server berbeda"),
            QuestionOption(id: "c", textEN: "Changing the programming language", textID: "Mengubah bahasa pemrograman"),
            QuestionOption(id: "d", textEN: "Shifting image pixels", textID: "Menggeser piksel gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Domain shift occurs when the source domain (pre-training data) differs from the target domain (new task data). Large domain shifts can reduce transfer learning effectiveness. Domain adaptation techniques help address this.",
        explanationID: "Domain shift terjadi ketika domain sumber (data pre-training) berbeda dari domain target (data tugas baru). Domain shift besar dapat mengurangi efektivitas transfer learning. Teknik domain adaptation membantu mengatasi ini.",
        topic: "aiMlDl",
        difficulty: .advanced
    )
]
