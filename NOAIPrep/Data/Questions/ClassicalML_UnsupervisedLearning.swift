import Foundation

// MARK: - Classical ML: Unsupervised Learning Questions (50 questions)
// Aligned with IOAI/NOAI Syllabus: K-Means, PCA, t-SNE, DBSCAN, Hierarchical Clustering
let unsupervisedLearningQuestions: [Question] = [
    // K-Means Clustering
    Question(
        id: "ul001",
        questionEN: "K-means clustering aims to minimize:",
        questionID: "K-means clustering bertujuan meminimalkan:",
        options: [
            QuestionOption(id: "a", textEN: "Within-cluster sum of squared distances to centroids", textID: "Jumlah jarak kuadrat dalam cluster ke centroid"),
            QuestionOption(id: "b", textEN: "Number of clusters", textID: "Jumlah cluster"),
            QuestionOption(id: "c", textEN: "Between-cluster distance", textID: "Jarak antar cluster"),
            QuestionOption(id: "d", textEN: "Maximum distance in each cluster", textID: "Jarak maksimum di setiap cluster")
        ],
        correctOptionId: "a",
        explanationEN: "K-means minimizes Σᵢ Σₓ∈Cᵢ ||x - μᵢ||², the total within-cluster variance (inertia).",
        explanationID: "K-means meminimalkan Σᵢ Σₓ∈Cᵢ ||x - μᵢ||², total variansi dalam cluster (inertia).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul002",
        questionEN: "The k-means algorithm alternates between which two steps?",
        questionID: "Algoritma k-means bergantian antara dua langkah mana?",
        options: [
            QuestionOption(id: "a", textEN: "Assignment (assign points to nearest centroid) and Update (recalculate centroids)", textID: "Assignment (tetapkan titik ke centroid terdekat) dan Update (hitung ulang centroid)"),
            QuestionOption(id: "b", textEN: "Feature extraction and classification", textID: "Ekstraksi fitur dan klasifikasi"),
            QuestionOption(id: "c", textEN: "Training and testing", textID: "Training dan testing"),
            QuestionOption(id: "d", textEN: "Gradient computation and weight update", textID: "Komputasi gradien dan update bobot")
        ],
        correctOptionId: "a",
        explanationEN: "K-means: (1) Assign each point to nearest centroid. (2) Update centroids as mean of assigned points. Repeat.",
        explanationID: "K-means: (1) Tetapkan setiap titik ke centroid terdekat. (2) Update centroid sebagai mean titik yang ditetapkan. Ulangi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ul003",
        questionEN: "K-means is guaranteed to converge but may find:",
        questionID: "K-means dijamin konvergen tetapi mungkin menemukan:",
        options: [
            QuestionOption(id: "a", textEN: "A local minimum, not necessarily global", textID: "Minimum lokal, tidak harus global"),
            QuestionOption(id: "b", textEN: "The global optimum always", textID: "Optimum global selalu"),
            QuestionOption(id: "c", textEN: "No solution", textID: "Tidak ada solusi"),
            QuestionOption(id: "d", textEN: "Infinite clusters", textID: "Cluster tak hingga")
        ],
        correctOptionId: "a",
        explanationEN: "K-means converges to local minimum. Run multiple times with different initializations (k-means++).",
        explanationID: "K-means konvergen ke minimum lokal. Jalankan beberapa kali dengan inisialisasi berbeda (k-means++).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul004",
        questionEN: "K-means++ initialization improves k-means by:",
        questionID: "Inisialisasi K-means++ memperbaiki k-means dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Choosing initial centroids spread apart probabilistically", textID: "Memilih centroid awal yang tersebar probabilistik"),
            QuestionOption(id: "b", textEN: "Using more clusters", textID: "Menggunakan lebih banyak cluster"),
            QuestionOption(id: "c", textEN: "Running for more iterations", textID: "Menjalankan lebih banyak iterasi"),
            QuestionOption(id: "d", textEN: "Using different distance metrics", textID: "Menggunakan metrik jarak berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "K-means++ selects centroids with probability proportional to D(x)², spreading them out for better convergence.",
        explanationID: "K-means++ memilih centroid dengan probabilitas proporsional terhadap D(x)², menyebarkannya untuk konvergensi lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul005",
        questionEN: "The Elbow method for choosing k looks for:",
        questionID: "Metode Elbow untuk memilih k mencari:",
        options: [
            QuestionOption(id: "a", textEN: "Point where adding clusters yields diminishing returns in inertia reduction", textID: "Titik dimana menambah cluster menghasilkan penurunan inertia yang berkurang"),
            QuestionOption(id: "b", textEN: "Maximum number of clusters", textID: "Jumlah cluster maksimum"),
            QuestionOption(id: "c", textEN: "Minimum inertia", textID: "Inertia minimum"),
            QuestionOption(id: "d", textEN: "Highest silhouette score", textID: "Skor silhouette tertinggi")
        ],
        correctOptionId: "a",
        explanationEN: "Plot inertia vs k. The 'elbow' point is where the rate of decrease sharply changes - a good k.",
        explanationID: "Plot inertia vs k. Titik 'elbow' adalah dimana laju penurunan berubah tajam - k yang baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul006",
        questionEN: "The Silhouette score measures:",
        questionID: "Skor Silhouette mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "How similar a point is to its own cluster vs other clusters", textID: "Seberapa mirip sebuah titik dengan clusternya vs cluster lain"),
            QuestionOption(id: "b", textEN: "Number of clusters", textID: "Jumlah cluster"),
            QuestionOption(id: "c", textEN: "Training time", textID: "Waktu training"),
            QuestionOption(id: "d", textEN: "Distance between centroids", textID: "Jarak antar centroid")
        ],
        correctOptionId: "a",
        explanationEN: "Silhouette s(i) = (b(i) - a(i)) / max(a(i), b(i)). Range [-1, 1]. Higher is better clustering.",
        explanationID: "Silhouette s(i) = (b(i) - a(i)) / max(a(i), b(i)). Rentang [-1, 1]. Lebih tinggi berarti clustering lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul007",
        questionEN: "K-means assumes clusters are:",
        questionID: "K-means mengasumsikan cluster adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Spherical and roughly equal-sized", textID: "Berbentuk bola dan kira-kira berukuran sama"),
            QuestionOption(id: "b", textEN: "Any arbitrary shape", textID: "Sembarang bentuk arbitrer"),
            QuestionOption(id: "c", textEN: "Hierarchical", textID: "Hierarkis"),
            QuestionOption(id: "d", textEN: "Density-based", textID: "Berbasis kepadatan")
        ],
        correctOptionId: "a",
        explanationEN: "K-means uses Euclidean distance to centroids, implicitly assuming spherical, equally-sized clusters.",
        explanationID: "K-means menggunakan jarak Euclidean ke centroid, secara implisit mengasumsikan cluster berbentuk bola dan berukuran sama.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul008",
        questionEN: "What is the time complexity of k-means per iteration?",
        questionID: "Apa kompleksitas waktu k-means per iterasi?",
        options: [
            QuestionOption(id: "a", textEN: "O(n × k × d) where n=samples, k=clusters, d=dimensions", textID: "O(n × k × d) dimana n=sampel, k=cluster, d=dimensi"),
            QuestionOption(id: "b", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "c", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "d", textEN: "O(k²)", textID: "O(k²)")
        ],
        correctOptionId: "a",
        explanationEN: "Each iteration: compute distance from n points to k centroids (O(nkd)), then update k centroids.",
        explanationID: "Setiap iterasi: hitung jarak dari n titik ke k centroid (O(nkd)), lalu update k centroid.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul009",
        questionEN: "Mini-batch k-means differs from standard k-means by:",
        questionID: "Mini-batch k-means berbeda dari k-means standar dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Using random subsets of data for each update step", textID: "Menggunakan subset acak data untuk setiap langkah update"),
            QuestionOption(id: "b", textEN: "Using more clusters", textID: "Menggunakan lebih banyak cluster"),
            QuestionOption(id: "c", textEN: "Running for more iterations", textID: "Menjalankan lebih banyak iterasi"),
            QuestionOption(id: "d", textEN: "Using different distance metrics", textID: "Menggunakan metrik jarak berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Mini-batch k-means samples a random batch each iteration for faster convergence on large datasets.",
        explanationID: "Mini-batch k-means mengambil sampel batch acak setiap iterasi untuk konvergensi lebih cepat pada dataset besar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul010",
        questionEN: "K-means cannot handle which type of data well?",
        questionID: "K-means tidak dapat menangani tipe data apa dengan baik?",
        options: [
            QuestionOption(id: "a", textEN: "Non-convex/irregularly shaped clusters", textID: "Cluster non-convex/berbentuk tidak teratur"),
            QuestionOption(id: "b", textEN: "Numerical data", textID: "Data numerik"),
            QuestionOption(id: "c", textEN: "High-dimensional data", textID: "Data berdimensi tinggi"),
            QuestionOption(id: "d", textEN: "Standardized features", textID: "Fitur terstandarisasi")
        ],
        correctOptionId: "a",
        explanationEN: "K-means uses Euclidean distance to centroids, failing for non-convex shapes like crescents or rings.",
        explanationID: "K-means menggunakan jarak Euclidean ke centroid, gagal untuk bentuk non-convex seperti bulan sabit atau cincin.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Principal Component Analysis (PCA)
    Question(
        id: "ul011",
        questionEN: "PCA finds directions that:",
        questionID: "PCA menemukan arah yang:",
        options: [
            QuestionOption(id: "a", textEN: "Maximize variance of projected data", textID: "Memaksimalkan variansi data yang diproyeksikan"),
            QuestionOption(id: "b", textEN: "Minimize variance", textID: "Meminimalkan variansi"),
            QuestionOption(id: "c", textEN: "Maximize number of features", textID: "Memaksimalkan jumlah fitur"),
            QuestionOption(id: "d", textEN: "Classify data points", textID: "Mengklasifikasikan titik data")
        ],
        correctOptionId: "a",
        explanationEN: "PCA finds orthogonal directions (principal components) that capture maximum variance in the data.",
        explanationID: "PCA menemukan arah orthogonal (komponen utama) yang menangkap variansi maksimum dalam data.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul012",
        questionEN: "Principal components are the eigenvectors of:",
        questionID: "Komponen utama adalah eigenvector dari:",
        options: [
            QuestionOption(id: "a", textEN: "The covariance matrix of the data", textID: "Matriks kovarians dari data"),
            QuestionOption(id: "b", textEN: "The data matrix itself", textID: "Matriks data itu sendiri"),
            QuestionOption(id: "c", textEN: "The identity matrix", textID: "Matriks identitas"),
            QuestionOption(id: "d", textEN: "The distance matrix", textID: "Matriks jarak")
        ],
        correctOptionId: "a",
        explanationEN: "PCA: eigenvectors of covariance Σ = XᵀX/(n-1). Eigenvalues give variance explained by each component.",
        explanationID: "PCA: eigenvector dari kovarians Σ = XᵀX/(n-1). Eigenvalue memberikan variansi yang dijelaskan oleh setiap komponen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul013",
        questionEN: "If we keep components explaining 95% of variance, we're doing:",
        questionID: "Jika kita menyimpan komponen yang menjelaskan 95% variansi, kita melakukan:",
        options: [
            QuestionOption(id: "a", textEN: "Dimensionality reduction while preserving most information", textID: "Pengurangan dimensi sambil mempertahankan sebagian besar informasi"),
            QuestionOption(id: "b", textEN: "Losing all important information", textID: "Kehilangan semua informasi penting"),
            QuestionOption(id: "c", textEN: "Increasing dimensionality", textID: "Meningkatkan dimensi"),
            QuestionOption(id: "d", textEN: "Classification", textID: "Klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Keeping top k components with cumulative variance ≥ 95% reduces dimensions while preserving most signal.",
        explanationID: "Menyimpan k komponen teratas dengan variansi kumulatif ≥ 95% mengurangi dimensi sambil mempertahankan sebagian besar sinyal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul014",
        questionEN: "Before applying PCA, data should be:",
        questionID: "Sebelum menerapkan PCA, data harus:",
        options: [
            QuestionOption(id: "a", textEN: "Centered (mean subtracted) and optionally scaled", textID: "Dipusatkan (mean dikurangi) dan opsional diskalakan"),
            QuestionOption(id: "b", textEN: "Left as raw values", textID: "Dibiarkan sebagai nilai mentah"),
            QuestionOption(id: "c", textEN: "Converted to categorical", textID: "Dikonversi ke kategorikal"),
            QuestionOption(id: "d", textEN: "Randomly shuffled", textID: "Diacak secara random")
        ],
        correctOptionId: "a",
        explanationEN: "Centering is required (PCA assumes zero mean). Scaling ensures equal contribution if features have different scales.",
        explanationID: "Pemusatan diperlukan (PCA mengasumsikan mean nol). Penskalaan memastikan kontribusi sama jika fitur memiliki skala berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul015",
        questionEN: "PCA is a linear transformation, meaning:",
        questionID: "PCA adalah transformasi linear, artinya:",
        options: [
            QuestionOption(id: "a", textEN: "It can only capture linear relationships in data", textID: "Ia hanya dapat menangkap hubungan linear dalam data"),
            QuestionOption(id: "b", textEN: "It works only on linear data", textID: "Ia hanya bekerja pada data linear"),
            QuestionOption(id: "c", textEN: "It creates non-linear features", textID: "Ia membuat fitur non-linear"),
            QuestionOption(id: "d", textEN: "It requires linear regression", textID: "Ia memerlukan regresi linear")
        ],
        correctOptionId: "a",
        explanationEN: "PCA projects onto linear subspace. Kernel PCA or autoencoders are needed for non-linear structure.",
        explanationID: "PCA memproyeksikan ke subspace linear. Kernel PCA atau autoencoder diperlukan untuk struktur non-linear.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul016",
        questionEN: "The scree plot in PCA shows:",
        questionID: "Scree plot dalam PCA menunjukkan:",
        options: [
            QuestionOption(id: "a", textEN: "Eigenvalues (variance) for each principal component", textID: "Eigenvalue (variansi) untuk setiap komponen utama"),
            QuestionOption(id: "b", textEN: "Cluster assignments", textID: "Penetapan cluster"),
            QuestionOption(id: "c", textEN: "Classification accuracy", textID: "Akurasi klasifikasi"),
            QuestionOption(id: "d", textEN: "Training loss", textID: "Training loss")
        ],
        correctOptionId: "a",
        explanationEN: "Scree plot: eigenvalues vs component number. Look for 'elbow' to choose number of components to keep.",
        explanationID: "Scree plot: eigenvalue vs nomor komponen. Cari 'elbow' untuk memilih jumlah komponen yang disimpan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul017",
        questionEN: "If data has 100 features and we project to 10 PCs, the loadings matrix has shape:",
        questionID: "Jika data memiliki 100 fitur dan kita proyeksikan ke 10 PC, matriks loading memiliki bentuk:",
        options: [
            QuestionOption(id: "a", textEN: "100 × 10", textID: "100 × 10"),
            QuestionOption(id: "b", textEN: "10 × 100", textID: "10 × 100"),
            QuestionOption(id: "c", textEN: "10 × 10", textID: "10 × 10"),
            QuestionOption(id: "d", textEN: "100 × 100", textID: "100 × 100")
        ],
        correctOptionId: "a",
        explanationEN: "Loading matrix W is d × k (100 × 10). Each column is a principal component (100-d vector).",
        explanationID: "Matriks loading W adalah d × k (100 × 10). Setiap kolom adalah komponen utama (vektor 100-d).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul018",
        questionEN: "PCA can be computed using SVD because:",
        questionID: "PCA dapat dihitung menggunakan SVD karena:",
        options: [
            QuestionOption(id: "a", textEN: "Right singular vectors of centered data are principal components", textID: "Vektor singular kanan dari data terpusat adalah komponen utama"),
            QuestionOption(id: "b", textEN: "SVD is faster", textID: "SVD lebih cepat"),
            QuestionOption(id: "c", textEN: "They are unrelated methods", textID: "Mereka adalah metode yang tidak terkait"),
            QuestionOption(id: "d", textEN: "SVD only works on square matrices", textID: "SVD hanya bekerja pada matriks persegi")
        ],
        correctOptionId: "a",
        explanationEN: "For centered X, SVD gives X = UΣVᵀ. V columns are eigenvectors of XᵀX, i.e., principal components.",
        explanationID: "Untuk X terpusat, SVD memberikan X = UΣVᵀ. Kolom V adalah eigenvector dari XᵀX, yaitu komponen utama.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul019",
        questionEN: "Whitening in PCA refers to:",
        questionID: "Whitening dalam PCA mengacu pada:",
        options: [
            QuestionOption(id: "a", textEN: "Scaling components to have unit variance", textID: "Menskalakan komponen agar memiliki variansi unit"),
            QuestionOption(id: "b", textEN: "Removing outliers", textID: "Menghapus outlier"),
            QuestionOption(id: "c", textEN: "Converting to binary", textID: "Mengkonversi ke biner"),
            QuestionOption(id: "d", textEN: "Adding noise", textID: "Menambahkan noise")
        ],
        correctOptionId: "a",
        explanationEN: "Whitening: project and divide by √λ to get uncorrelated, unit-variance components. Useful preprocessing.",
        explanationID: "Whitening: proyeksikan dan bagi dengan √λ untuk mendapatkan komponen uncorrelated, variansi unit. Preprocessing yang berguna.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul020",
        questionEN: "Reconstruction error in PCA measures:",
        questionID: "Reconstruction error dalam PCA mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "How much information is lost when projecting to fewer dimensions", textID: "Seberapa banyak informasi hilang saat memproyeksikan ke dimensi lebih sedikit"),
            QuestionOption(id: "b", textEN: "Classification accuracy", textID: "Akurasi klasifikasi"),
            QuestionOption(id: "c", textEN: "Number of outliers", textID: "Jumlah outlier"),
            QuestionOption(id: "d", textEN: "Training time", textID: "Waktu training")
        ],
        correctOptionId: "a",
        explanationEN: "Reconstruction error ||X - X̂||² where X̂ = XWWᵀ. Equals sum of discarded eigenvalues.",
        explanationID: "Reconstruction error ||X - X̂||² dimana X̂ = XWWᵀ. Sama dengan jumlah eigenvalue yang dibuang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // t-SNE
    Question(
        id: "ul021",
        questionEN: "t-SNE is primarily used for:",
        questionID: "t-SNE terutama digunakan untuk:",
        options: [
            QuestionOption(id: "a", textEN: "Visualizing high-dimensional data in 2D or 3D", textID: "Memvisualisasikan data berdimensi tinggi dalam 2D atau 3D"),
            QuestionOption(id: "b", textEN: "Classification", textID: "Klasifikasi"),
            QuestionOption(id: "c", textEN: "Clustering large datasets", textID: "Clustering dataset besar"),
            QuestionOption(id: "d", textEN: "Feature selection", textID: "Seleksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE creates low-dimensional embeddings that preserve local neighborhood structure. Great for visualization.",
        explanationID: "t-SNE membuat embedding berdimensi rendah yang mempertahankan struktur neighborhood lokal. Bagus untuk visualisasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul022",
        questionEN: "t-SNE uses t-distribution in low-dimensional space because:",
        questionID: "t-SNE menggunakan distribusi-t di ruang berdimensi rendah karena:",
        options: [
            QuestionOption(id: "a", textEN: "Heavy tails allow dissimilar points to stay far apart", textID: "Ekor berat memungkinkan titik berbeda tetap berjauhan"),
            QuestionOption(id: "b", textEN: "It's faster to compute", textID: "Lebih cepat dihitung"),
            QuestionOption(id: "c", textEN: "Gaussian doesn't work", textID: "Gaussian tidak bekerja"),
            QuestionOption(id: "d", textEN: "For normalization purposes", textID: "Untuk tujuan normalisasi")
        ],
        correctOptionId: "a",
        explanationEN: "t-distribution's heavy tails alleviate the 'crowding problem', allowing better separation of dissimilar points.",
        explanationID: "Ekor berat distribusi-t mengurangi 'crowding problem', memungkinkan pemisahan lebih baik dari titik berbeda.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul023",
        questionEN: "The perplexity parameter in t-SNE roughly controls:",
        questionID: "Parameter perplexity dalam t-SNE kira-kira mengontrol:",
        options: [
            QuestionOption(id: "a", textEN: "Number of effective neighbors considered", textID: "Jumlah efektif tetangga yang dipertimbangkan"),
            QuestionOption(id: "b", textEN: "Output dimensionality", textID: "Dimensi output"),
            QuestionOption(id: "c", textEN: "Learning rate", textID: "Learning rate"),
            QuestionOption(id: "d", textEN: "Number of clusters", textID: "Jumlah cluster")
        ],
        correctOptionId: "a",
        explanationEN: "Perplexity ≈ k in k-NN. Typical values 5-50. Higher perplexity considers more neighbors (more global structure).",
        explanationID: "Perplexity ≈ k dalam k-NN. Nilai tipikal 5-50. Perplexity lebih tinggi mempertimbangkan lebih banyak tetangga (struktur lebih global).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul024",
        questionEN: "Why can't t-SNE be used to embed new data points?",
        questionID: "Mengapa t-SNE tidak dapat digunakan untuk menyematkan titik data baru?",
        options: [
            QuestionOption(id: "a", textEN: "It's a non-parametric method without an explicit mapping function", textID: "Ia adalah metode non-parametrik tanpa fungsi pemetaan eksplisit"),
            QuestionOption(id: "b", textEN: "It's too slow", textID: "Terlalu lambat"),
            QuestionOption(id: "c", textEN: "It only works once", textID: "Hanya bekerja sekali"),
            QuestionOption(id: "d", textEN: "New data breaks the algorithm", textID: "Data baru merusak algoritma")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE optimizes point positions directly, not a transformation. No learned function to apply to new data.",
        explanationID: "t-SNE mengoptimalkan posisi titik secara langsung, bukan transformasi. Tidak ada fungsi yang dipelajari untuk diterapkan ke data baru.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul025",
        questionEN: "t-SNE preserves primarily:",
        questionID: "t-SNE terutama mempertahankan:",
        options: [
            QuestionOption(id: "a", textEN: "Local structure (nearby points stay nearby)", textID: "Struktur lokal (titik terdekat tetap terdekat)"),
            QuestionOption(id: "b", textEN: "Global distances accurately", textID: "Jarak global secara akurat"),
            QuestionOption(id: "c", textEN: "Linear relationships", textID: "Hubungan linear"),
            QuestionOption(id: "d", textEN: "Cluster sizes proportionally", textID: "Ukuran cluster secara proporsional")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE focuses on preserving local neighborhoods. Global distances and cluster sizes can be misleading.",
        explanationID: "t-SNE fokus pada mempertahankan neighborhood lokal. Jarak global dan ukuran cluster bisa menyesatkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul026",
        questionEN: "Compared to PCA, t-SNE:",
        questionID: "Dibandingkan dengan PCA, t-SNE:",
        options: [
            QuestionOption(id: "a", textEN: "Can reveal non-linear structure but is much slower", textID: "Dapat mengungkap struktur non-linear tetapi jauh lebih lambat"),
            QuestionOption(id: "b", textEN: "Is always faster", textID: "Selalu lebih cepat"),
            QuestionOption(id: "c", textEN: "Produces the same results", textID: "Menghasilkan hasil yang sama"),
            QuestionOption(id: "d", textEN: "Only works on small datasets", textID: "Hanya bekerja pada dataset kecil")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE is O(n²) vs PCA's O(nd²). t-SNE captures non-linear manifolds; PCA only linear projections.",
        explanationID: "t-SNE adalah O(n²) vs O(nd²) PCA. t-SNE menangkap manifold non-linear; PCA hanya proyeksi linear.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul027",
        questionEN: "UMAP is similar to t-SNE but offers:",
        questionID: "UMAP mirip dengan t-SNE tetapi menawarkan:",
        options: [
            QuestionOption(id: "a", textEN: "Better preservation of global structure and faster runtime", textID: "Preservasi struktur global lebih baik dan runtime lebih cepat"),
            QuestionOption(id: "b", textEN: "Worse visualizations", textID: "Visualisasi lebih buruk"),
            QuestionOption(id: "c", textEN: "Only 1D projections", textID: "Hanya proyeksi 1D"),
            QuestionOption(id: "d", textEN: "Identical results to t-SNE", textID: "Hasil identik dengan t-SNE")
        ],
        correctOptionId: "a",
        explanationEN: "UMAP uses different mathematical framework, scales better O(n log n), and preserves more global structure.",
        explanationID: "UMAP menggunakan kerangka matematika berbeda, berskala lebih baik O(n log n), dan mempertahankan lebih banyak struktur global.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul028",
        questionEN: "t-SNE's KL divergence loss measures:",
        questionID: "KL divergence loss t-SNE mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Difference between high-D and low-D similarity distributions", textID: "Perbedaan antara distribusi kesamaan dimensi tinggi dan rendah"),
            QuestionOption(id: "b", textEN: "Classification error", textID: "Error klasifikasi"),
            QuestionOption(id: "c", textEN: "Cluster purity", textID: "Kemurnian cluster"),
            QuestionOption(id: "d", textEN: "Euclidean distance", textID: "Jarak Euclidean")
        ],
        correctOptionId: "a",
        explanationEN: "t-SNE minimizes KL(P||Q) where P is high-D pairwise similarities, Q is low-D. KL = 0 means perfect match.",
        explanationID: "t-SNE meminimalkan KL(P||Q) dimana P adalah kesamaan berpasangan dimensi tinggi, Q adalah dimensi rendah. KL = 0 berarti cocok sempurna.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    // DBSCAN
    Question(
        id: "ul029",
        questionEN: "DBSCAN defines clusters based on:",
        questionID: "DBSCAN mendefinisikan cluster berdasarkan:",
        options: [
            QuestionOption(id: "a", textEN: "Density-connected regions with minimum points within epsilon", textID: "Wilayah terhubung kepadatan dengan titik minimum dalam epsilon"),
            QuestionOption(id: "b", textEN: "Distance to centroids", textID: "Jarak ke centroid"),
            QuestionOption(id: "c", textEN: "Hierarchical merging", textID: "Penggabungan hierarkis"),
            QuestionOption(id: "d", textEN: "Feature similarity only", textID: "Kesamaan fitur saja")
        ],
        correctOptionId: "a",
        explanationEN: "DBSCAN: a core point has ≥ minPts within radius ε. Clusters are density-connected core points + border points.",
        explanationID: "DBSCAN: titik core memiliki ≥ minPts dalam radius ε. Cluster adalah titik core terhubung kepadatan + titik border.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul030",
        questionEN: "DBSCAN's parameters are:",
        questionID: "Parameter DBSCAN adalah:",
        options: [
            QuestionOption(id: "a", textEN: "ε (epsilon/radius) and minPts (minimum points)", textID: "ε (epsilon/radius) dan minPts (titik minimum)"),
            QuestionOption(id: "b", textEN: "k (number of clusters)", textID: "k (jumlah cluster)"),
            QuestionOption(id: "c", textEN: "Learning rate and epochs", textID: "Learning rate dan epochs"),
            QuestionOption(id: "d", textEN: "Tree depth and leaf size", textID: "Kedalaman pohon dan ukuran daun")
        ],
        correctOptionId: "a",
        explanationEN: "ε defines neighborhood size, minPts defines density threshold for core points. No need to specify k!",
        explanationID: "ε mendefinisikan ukuran neighborhood, minPts mendefinisikan threshold kepadatan untuk titik core. Tidak perlu menentukan k!",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ul031",
        questionEN: "Unlike k-means, DBSCAN can:",
        questionID: "Berbeda dengan k-means, DBSCAN dapat:",
        options: [
            QuestionOption(id: "a", textEN: "Find arbitrarily shaped clusters and identify noise/outliers", textID: "Menemukan cluster berbentuk arbitrer dan mengidentifikasi noise/outlier"),
            QuestionOption(id: "b", textEN: "Only find spherical clusters", textID: "Hanya menemukan cluster berbentuk bola"),
            QuestionOption(id: "c", textEN: "Guarantee global optimum", textID: "Menjamin optimum global"),
            QuestionOption(id: "d", textEN: "Work without any parameters", textID: "Bekerja tanpa parameter apapun")
        ],
        correctOptionId: "a",
        explanationEN: "DBSCAN follows density, finding any shape. Points not reachable from any cluster are labeled as noise (-1).",
        explanationID: "DBSCAN mengikuti kepadatan, menemukan bentuk apapun. Titik yang tidak dapat dijangkau dari cluster manapun dilabeli sebagai noise (-1).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul032",
        questionEN: "A core point in DBSCAN is a point that:",
        questionID: "Titik core dalam DBSCAN adalah titik yang:",
        options: [
            QuestionOption(id: "a", textEN: "Has at least minPts neighbors within distance ε", textID: "Memiliki setidaknya minPts tetangga dalam jarak ε"),
            QuestionOption(id: "b", textEN: "Is in the center of the dataset", textID: "Berada di pusat dataset"),
            QuestionOption(id: "c", textEN: "Has exactly one neighbor", textID: "Memiliki tepat satu tetangga"),
            QuestionOption(id: "d", textEN: "Is an outlier", textID: "Adalah outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Core point: |{x' : d(x, x') ≤ ε}| ≥ minPts. Core points form the foundation of clusters.",
        explanationID: "Titik core: |{x' : d(x, x') ≤ ε}| ≥ minPts. Titik core membentuk fondasi cluster.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul033",
        questionEN: "The k-distance graph helps choose ε in DBSCAN by:",
        questionID: "Grafik k-distance membantu memilih ε dalam DBSCAN dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Showing the distance to the kth nearest neighbor, look for 'elbow'", textID: "Menunjukkan jarak ke tetangga terdekat ke-k, cari 'elbow'"),
            QuestionOption(id: "b", textEN: "Counting clusters", textID: "Menghitung cluster"),
            QuestionOption(id: "c", textEN: "Computing centroids", textID: "Menghitung centroid"),
            QuestionOption(id: "d", textEN: "Removing outliers", textID: "Menghapus outlier")
        ],
        correctOptionId: "a",
        explanationEN: "Plot sorted k-distances (k ≈ minPts). Sharp increase indicates noise boundary, giving good ε value.",
        explanationID: "Plot jarak-k terurut (k ≈ minPts). Peningkatan tajam menunjukkan batas noise, memberikan nilai ε yang baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul034",
        questionEN: "DBSCAN's time complexity is approximately:",
        questionID: "Kompleksitas waktu DBSCAN adalah kira-kira:",
        options: [
            QuestionOption(id: "a", textEN: "O(n²) without spatial indexing, O(n log n) with", textID: "O(n²) tanpa spatial indexing, O(n log n) dengan"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(n³)", textID: "O(n³)"),
            QuestionOption(id: "d", textEN: "O(k × n)", textID: "O(k × n)")
        ],
        correctOptionId: "a",
        explanationEN: "Without index: O(n²) for neighbor queries. With KD-tree or ball tree: O(n log n) in low dimensions.",
        explanationID: "Tanpa index: O(n²) untuk query tetangga. Dengan KD-tree atau ball tree: O(n log n) di dimensi rendah.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul035",
        questionEN: "DBSCAN struggles with:",
        questionID: "DBSCAN kesulitan dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Clusters of varying densities", textID: "Cluster dengan kepadatan bervariasi"),
            QuestionOption(id: "b", textEN: "Non-spherical clusters", textID: "Cluster non-spherical"),
            QuestionOption(id: "c", textEN: "Outlier detection", textID: "Deteksi outlier"),
            QuestionOption(id: "d", textEN: "Unknown number of clusters", textID: "Jumlah cluster tidak diketahui")
        ],
        correctOptionId: "a",
        explanationEN: "Single ε can't capture different density clusters. HDBSCAN extends DBSCAN to handle varying densities.",
        explanationID: "ε tunggal tidak dapat menangkap cluster kepadatan berbeda. HDBSCAN memperluas DBSCAN untuk menangani kepadatan bervariasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Hierarchical Clustering
    Question(
        id: "ul036",
        questionEN: "Agglomerative hierarchical clustering starts with:",
        questionID: "Agglomerative hierarchical clustering dimulai dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Each point as its own cluster, then merges", textID: "Setiap titik sebagai clusternya sendiri, lalu menggabungkan"),
            QuestionOption(id: "b", textEN: "All points in one cluster, then splits", textID: "Semua titik dalam satu cluster, lalu memisah"),
            QuestionOption(id: "c", textEN: "K random clusters", textID: "K cluster acak"),
            QuestionOption(id: "d", textEN: "No initial clusters", textID: "Tidak ada cluster awal")
        ],
        correctOptionId: "a",
        explanationEN: "Agglomerative (bottom-up): start with n clusters, merge closest pairs until one remains. Divisive is top-down.",
        explanationID: "Agglomerative (bottom-up): mulai dengan n cluster, gabungkan pasangan terdekat sampai satu tersisa. Divisive adalah top-down.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "ul037",
        questionEN: "The dendrogram in hierarchical clustering shows:",
        questionID: "Dendrogram dalam hierarchical clustering menunjukkan:",
        options: [
            QuestionOption(id: "a", textEN: "The sequence of merges and distances at which they occur", textID: "Urutan penggabungan dan jarak saat terjadinya"),
            QuestionOption(id: "b", textEN: "Final cluster assignments only", textID: "Hanya penetapan cluster akhir"),
            QuestionOption(id: "c", textEN: "Feature importances", textID: "Kepentingan fitur"),
            QuestionOption(id: "d", textEN: "Classification boundaries", textID: "Batas klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Dendrogram: tree showing merge order. Height = distance at merge. Cut at desired level for clusters.",
        explanationID: "Dendrogram: pohon menunjukkan urutan penggabungan. Tinggi = jarak saat penggabungan. Potong pada level yang diinginkan untuk cluster.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul038",
        questionEN: "Single linkage defines cluster distance as:",
        questionID: "Single linkage mendefinisikan jarak cluster sebagai:",
        options: [
            QuestionOption(id: "a", textEN: "Minimum distance between any pair of points", textID: "Jarak minimum antara pasangan titik manapun"),
            QuestionOption(id: "b", textEN: "Maximum distance between points", textID: "Jarak maksimum antara titik"),
            QuestionOption(id: "c", textEN: "Average distance", textID: "Jarak rata-rata"),
            QuestionOption(id: "d", textEN: "Distance between centroids", textID: "Jarak antar centroid")
        ],
        correctOptionId: "a",
        explanationEN: "Single linkage: d(A,B) = min{d(a,b) : a∈A, b∈B}. Can create 'chaining' effect with elongated clusters.",
        explanationID: "Single linkage: d(A,B) = min{d(a,b) : a∈A, b∈B}. Dapat membuat efek 'chaining' dengan cluster memanjang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul039",
        questionEN: "Complete linkage uses:",
        questionID: "Complete linkage menggunakan:",
        options: [
            QuestionOption(id: "a", textEN: "Maximum distance between any pair of points in clusters", textID: "Jarak maksimum antara pasangan titik manapun dalam cluster"),
            QuestionOption(id: "b", textEN: "Minimum distance", textID: "Jarak minimum"),
            QuestionOption(id: "c", textEN: "Mean of all distances", textID: "Mean dari semua jarak"),
            QuestionOption(id: "d", textEN: "Variance of distances", textID: "Variansi jarak")
        ],
        correctOptionId: "a",
        explanationEN: "Complete linkage: d(A,B) = max{d(a,b)}. Tends to create compact, similar-diameter clusters.",
        explanationID: "Complete linkage: d(A,B) = max{d(a,b)}. Cenderung membuat cluster kompak dengan diameter serupa.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul040",
        questionEN: "Ward's method minimizes:",
        questionID: "Metode Ward meminimalkan:",
        options: [
            QuestionOption(id: "a", textEN: "Within-cluster variance (like k-means objective)", textID: "Variansi dalam cluster (seperti objektif k-means)"),
            QuestionOption(id: "b", textEN: "Maximum distance", textID: "Jarak maksimum"),
            QuestionOption(id: "c", textEN: "Number of clusters", textID: "Jumlah cluster"),
            QuestionOption(id: "d", textEN: "Time complexity", textID: "Kompleksitas waktu")
        ],
        correctOptionId: "a",
        explanationEN: "Ward's method: merge clusters that minimize increase in total within-cluster variance. Most similar to k-means.",
        explanationID: "Metode Ward: gabungkan cluster yang meminimalkan peningkatan total variansi dalam cluster. Paling mirip dengan k-means.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul041",
        questionEN: "The time complexity of agglomerative clustering is:",
        questionID: "Kompleksitas waktu agglomerative clustering adalah:",
        options: [
            QuestionOption(id: "a", textEN: "O(n³) naive, O(n² log n) with efficient data structures", textID: "O(n³) naif, O(n² log n) dengan struktur data efisien"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "d", textEN: "O(k × n)", textID: "O(k × n)")
        ],
        correctOptionId: "a",
        explanationEN: "Need O(n²) to compute all pairwise distances. n-1 merges, updating distances. Heap can reduce to O(n² log n).",
        explanationID: "Perlu O(n²) untuk menghitung semua jarak berpasangan. n-1 penggabungan, memperbarui jarak. Heap dapat mengurangi ke O(n² log n).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul042",
        questionEN: "Cutting a dendrogram at a certain height gives:",
        questionID: "Memotong dendrogram pada ketinggian tertentu memberikan:",
        options: [
            QuestionOption(id: "a", textEN: "A specific number of clusters", textID: "Jumlah cluster tertentu"),
            QuestionOption(id: "b", textEN: "Only two clusters", textID: "Hanya dua cluster"),
            QuestionOption(id: "c", textEN: "One cluster always", textID: "Selalu satu cluster"),
            QuestionOption(id: "d", textEN: "N clusters always", textID: "Selalu N cluster")
        ],
        correctOptionId: "a",
        explanationEN: "Cutting dendrogram horizontally at height h yields k clusters where k depends on h. Flexible clustering.",
        explanationID: "Memotong dendrogram secara horizontal pada ketinggian h menghasilkan k cluster dimana k bergantung pada h. Clustering fleksibel.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    // Additional Dimensionality Reduction
    Question(
        id: "ul043",
        questionEN: "Kernel PCA differs from standard PCA by:",
        questionID: "Kernel PCA berbeda dari PCA standar dengan:",
        options: [
            QuestionOption(id: "a", textEN: "Using kernel trick to capture non-linear structure", textID: "Menggunakan kernel trick untuk menangkap struktur non-linear"),
            QuestionOption(id: "b", textEN: "Being faster", textID: "Lebih cepat"),
            QuestionOption(id: "c", textEN: "Using only linear kernels", textID: "Hanya menggunakan kernel linear"),
            QuestionOption(id: "d", textEN: "Reducing to more dimensions", textID: "Mengurangi ke lebih banyak dimensi")
        ],
        correctOptionId: "a",
        explanationEN: "Kernel PCA applies kernel to implicitly project to high-D space, then does PCA. Captures non-linear manifolds.",
        explanationID: "Kernel PCA menerapkan kernel untuk secara implisit memproyeksikan ke ruang dimensi tinggi, lalu melakukan PCA. Menangkap manifold non-linear.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul044",
        questionEN: "LDA (Linear Discriminant Analysis) for dimensionality reduction maximizes:",
        questionID: "LDA (Linear Discriminant Analysis) untuk pengurangan dimensi memaksimalkan:",
        options: [
            QuestionOption(id: "a", textEN: "Between-class variance relative to within-class variance", textID: "Variansi antar kelas relatif terhadap variansi dalam kelas"),
            QuestionOption(id: "b", textEN: "Total variance like PCA", textID: "Total variansi seperti PCA"),
            QuestionOption(id: "c", textEN: "Reconstruction error", textID: "Reconstruction error"),
            QuestionOption(id: "d", textEN: "Number of features", textID: "Jumlah fitur")
        ],
        correctOptionId: "a",
        explanationEN: "LDA is supervised. Finds projection maximizing class separation: max(Sᵦ/Sᵥ) where Sᵦ is between-class, Sᵥ within-class scatter.",
        explanationID: "LDA adalah supervised. Menemukan proyeksi yang memaksimalkan pemisahan kelas: max(Sᵦ/Sᵥ) dimana Sᵦ adalah scatter antar kelas, Sᵥ dalam kelas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul045",
        questionEN: "Independent Component Analysis (ICA) assumes:",
        questionID: "Independent Component Analysis (ICA) mengasumsikan:",
        options: [
            QuestionOption(id: "a", textEN: "Data is a linear mixture of statistically independent sources", textID: "Data adalah campuran linear dari sumber yang independen secara statistik"),
            QuestionOption(id: "b", textEN: "Data is Gaussian", textID: "Data adalah Gaussian"),
            QuestionOption(id: "c", textEN: "Data is clustered", textID: "Data dikelompokkan"),
            QuestionOption(id: "d", textEN: "Data is low-dimensional", textID: "Data berdimensi rendah")
        ],
        correctOptionId: "a",
        explanationEN: "ICA: X = AS where S are independent non-Gaussian sources. Find A⁻¹ to recover sources. Used in signal separation.",
        explanationID: "ICA: X = AS dimana S adalah sumber non-Gaussian independen. Cari A⁻¹ untuk memulihkan sumber. Digunakan dalam pemisahan sinyal.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul046",
        questionEN: "Autoencoders for dimensionality reduction learn:",
        questionID: "Autoencoder untuk pengurangan dimensi mempelajari:",
        options: [
            QuestionOption(id: "a", textEN: "Non-linear encoding to bottleneck then decoding back", textID: "Encoding non-linear ke bottleneck lalu decoding kembali"),
            QuestionOption(id: "b", textEN: "Only linear projections", textID: "Hanya proyeksi linear"),
            QuestionOption(id: "c", textEN: "Cluster assignments", textID: "Penetapan cluster"),
            QuestionOption(id: "d", textEN: "Classification labels", textID: "Label klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "Autoencoders: neural network that compresses input to latent code (encoding) then reconstructs (decoding). Minimizes reconstruction error.",
        explanationID: "Autoencoder: neural network yang mengompresi input ke kode laten (encoding) lalu merekonstruksi (decoding). Meminimalkan reconstruction error.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    // Clustering Evaluation
    Question(
        id: "ul047",
        questionEN: "The Adjusted Rand Index (ARI) measures:",
        questionID: "Adjusted Rand Index (ARI) mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Agreement between clusterings, adjusted for chance", textID: "Kesepakatan antar clustering, disesuaikan untuk peluang"),
            QuestionOption(id: "b", textEN: "Cluster compactness", textID: "Kekompakan cluster"),
            QuestionOption(id: "c", textEN: "Number of clusters", textID: "Jumlah cluster"),
            QuestionOption(id: "d", textEN: "Training time", textID: "Waktu training")
        ],
        correctOptionId: "a",
        explanationEN: "ARI compares clustering to ground truth. Range [-1, 1], 0 = random, 1 = perfect match. Adjusted for random agreement.",
        explanationID: "ARI membandingkan clustering dengan ground truth. Rentang [-1, 1], 0 = acak, 1 = cocok sempurna. Disesuaikan untuk kesepakatan acak.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul048",
        questionEN: "Normalized Mutual Information (NMI) between clusterings:",
        questionID: "Normalized Mutual Information (NMI) antara clustering:",
        options: [
            QuestionOption(id: "a", textEN: "Measures shared information, normalized to [0, 1]", textID: "Mengukur informasi bersama, dinormalisasi ke [0, 1]"),
            QuestionOption(id: "b", textEN: "Counts matching pairs", textID: "Menghitung pasangan yang cocok"),
            QuestionOption(id: "c", textEN: "Measures cluster sizes", textID: "Mengukur ukuran cluster"),
            QuestionOption(id: "d", textEN: "Counts outliers", textID: "Menghitung outlier")
        ],
        correctOptionId: "a",
        explanationEN: "NMI = 2×I(U,V) / (H(U) + H(V)). Measures how much knowing one clustering tells about another. 0 = independent, 1 = identical.",
        explanationID: "NMI = 2×I(U,V) / (H(U) + H(V)). Mengukur seberapa banyak mengetahui satu clustering memberitahu tentang yang lain. 0 = independen, 1 = identik.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "ul049",
        questionEN: "The Davies-Bouldin Index measures:",
        questionID: "Davies-Bouldin Index mengukur:",
        options: [
            QuestionOption(id: "a", textEN: "Average similarity between clusters (lower is better)", textID: "Kesamaan rata-rata antar cluster (lebih rendah lebih baik)"),
            QuestionOption(id: "b", textEN: "Training accuracy", textID: "Akurasi training"),
            QuestionOption(id: "c", textEN: "Number of features", textID: "Jumlah fitur"),
            QuestionOption(id: "d", textEN: "Classification error", textID: "Error klasifikasi")
        ],
        correctOptionId: "a",
        explanationEN: "DB index = average worst-case ratio of within-cluster scatter to between-cluster separation. Lower = better defined clusters.",
        explanationID: "DB index = rata-rata rasio kasus terburuk dari scatter dalam cluster terhadap pemisahan antar cluster. Lebih rendah = cluster lebih terdefinisi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "ul050",
        questionEN: "Calinski-Harabasz Index (Variance Ratio Criterion) is:",
        questionID: "Calinski-Harabasz Index (Variance Ratio Criterion) adalah:",
        options: [
            QuestionOption(id: "a", textEN: "Ratio of between-cluster to within-cluster variance (higher is better)", textID: "Rasio variansi antar cluster terhadap dalam cluster (lebih tinggi lebih baik)"),
            QuestionOption(id: "b", textEN: "Always equal to 1", textID: "Selalu sama dengan 1"),
            QuestionOption(id: "c", textEN: "Negative for good clusters", textID: "Negatif untuk cluster bagus"),
            QuestionOption(id: "d", textEN: "Independent of number of clusters", textID: "Independen dari jumlah cluster")
        ],
        correctOptionId: "a",
        explanationEN: "CH = [B/(k-1)] / [W/(n-k)] where B = between-cluster, W = within-cluster dispersion. Higher = denser, well-separated clusters.",
        explanationID: "CH = [B/(k-1)] / [W/(n-k)] dimana B = antar cluster, W = dispersi dalam cluster. Lebih tinggi = cluster lebih padat, terpisah baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
]
