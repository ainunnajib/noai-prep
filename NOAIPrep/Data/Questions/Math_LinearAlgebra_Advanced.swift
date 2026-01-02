import Foundation

// MARK: - Linear Algebra Advanced Questions (50 questions)
extension NOAIQuestionBank {
    var linearAlgebraAdvancedQuestions: [Question] {
        [
            // Advanced Matrix Theory
            Question(
                id: "laa001",
                questionEN: "What is the condition number of a matrix used for?",
                questionID: "Untuk apa condition number dari matriks digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Measuring numerical stability in solving linear systems", textID: "Mengukur stabilitas numerik dalam menyelesaikan sistem linear"),
                    QuestionOption(id: "b", textEN: "Counting the number of eigenvalues", textID: "Menghitung jumlah eigenvalue"),
                    QuestionOption(id: "c", textEN: "Determining matrix rank", textID: "Menentukan rank matriks"),
                    QuestionOption(id: "d", textEN: "Computing the inverse", textID: "Menghitung invers")
                ],
                correctOptionId: "a",
                explanationEN: "Condition number κ(A) = ||A|| × ||A⁻¹|| measures sensitivity to perturbations. High κ means ill-conditioned.",
                explanationID: "Condition number κ(A) = ||A|| × ||A⁻¹|| mengukur sensitivitas terhadap perturbasi. κ tinggi berarti ill-conditioned.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa002",
                questionEN: "In QR decomposition, Q is orthogonal and R is:",
                questionID: "Dalam dekomposisi QR, Q adalah orthogonal dan R adalah:",
                options: [
                    QuestionOption(id: "a", textEN: "Lower triangular", textID: "Segitiga bawah"),
                    QuestionOption(id: "b", textEN: "Upper triangular", textID: "Segitiga atas"),
                    QuestionOption(id: "c", textEN: "Diagonal", textID: "Diagonal"),
                    QuestionOption(id: "d", textEN: "Symmetric", textID: "Simetris")
                ],
                correctOptionId: "b",
                explanationEN: "QR decomposition: A = QR where Q is orthogonal and R is upper triangular. Used in least squares.",
                explanationID: "Dekomposisi QR: A = QR dimana Q orthogonal dan R adalah segitiga atas. Digunakan dalam least squares.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa003",
                questionEN: "What is the spectral radius of a matrix?",
                questionID: "Apa itu spectral radius dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Sum of all eigenvalues", textID: "Jumlah semua eigenvalue"),
                    QuestionOption(id: "b", textEN: "Maximum absolute value of eigenvalues", textID: "Nilai absolut maksimum dari eigenvalue"),
                    QuestionOption(id: "c", textEN: "Product of eigenvalues", textID: "Produk eigenvalue"),
                    QuestionOption(id: "d", textEN: "Average of eigenvalues", textID: "Rata-rata eigenvalue")
                ],
                correctOptionId: "b",
                explanationEN: "Spectral radius ρ(A) = max|λᵢ|. Important for convergence analysis of iterative methods.",
                explanationID: "Spectral radius ρ(A) = max|λᵢ|. Penting untuk analisis konvergensi metode iteratif.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa004",
                questionEN: "A matrix is called nilpotent if:",
                questionID: "Matriks disebut nilpotent jika:",
                options: [
                    QuestionOption(id: "a", textEN: "All eigenvalues are 1", textID: "Semua eigenvalue adalah 1"),
                    QuestionOption(id: "b", textEN: "Aᵏ = 0 for some positive integer k", textID: "Aᵏ = 0 untuk suatu bilangan bulat positif k"),
                    QuestionOption(id: "c", textEN: "A = Aᵀ", textID: "A = Aᵀ"),
                    QuestionOption(id: "d", textEN: "det(A) = 1", textID: "det(A) = 1")
                ],
                correctOptionId: "b",
                explanationEN: "Nilpotent matrix: Aᵏ = 0 for some k. All eigenvalues are 0. The smallest such k is the index.",
                explanationID: "Matriks nilpotent: Aᵏ = 0 untuk suatu k. Semua eigenvalue adalah 0. k terkecil disebut indeks.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa005",
                questionEN: "What is the Moore-Penrose pseudoinverse used for?",
                questionID: "Untuk apa Moore-Penrose pseudoinverse digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Solving overdetermined systems (least squares)", textID: "Menyelesaikan sistem overdetermined (least squares)"),
                    QuestionOption(id: "b", textEN: "Computing eigenvalues", textID: "Menghitung eigenvalue"),
                    QuestionOption(id: "c", textEN: "Finding determinants", textID: "Mencari determinan"),
                    QuestionOption(id: "d", textEN: "Matrix addition", textID: "Penjumlahan matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Pseudoinverse A⁺ generalizes inverse for non-square/singular matrices. x = A⁺b gives least squares solution.",
                explanationID: "Pseudoinverse A⁺ menggeneralisasi invers untuk matriks non-persegi/singular. x = A⁺b memberikan solusi least squares.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa006",
                questionEN: "The Cayley-Hamilton theorem states that:",
                questionID: "Teorema Cayley-Hamilton menyatakan bahwa:",
                options: [
                    QuestionOption(id: "a", textEN: "Every matrix satisfies its own characteristic equation", textID: "Setiap matriks memenuhi persamaan karakteristiknya sendiri"),
                    QuestionOption(id: "b", textEN: "All matrices are diagonalizable", textID: "Semua matriks dapat didiagonalkan"),
                    QuestionOption(id: "c", textEN: "Eigenvalues are always real", textID: "Eigenvalue selalu real"),
                    QuestionOption(id: "d", textEN: "Every matrix has an inverse", textID: "Setiap matriks memiliki invers")
                ],
                correctOptionId: "a",
                explanationEN: "If p(λ) = det(A - λI) is the characteristic polynomial, then p(A) = 0.",
                explanationID: "Jika p(λ) = det(A - λI) adalah polinomial karakteristik, maka p(A) = 0.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa007",
                questionEN: "What is the Kronecker product of matrices?",
                questionID: "Apa itu Kronecker product dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Element-wise multiplication", textID: "Perkalian elemen-wise"),
                    QuestionOption(id: "b", textEN: "Block matrix where each element aᵢⱼ is replaced by aᵢⱼB", textID: "Matriks blok dimana setiap elemen aᵢⱼ diganti dengan aᵢⱼB"),
                    QuestionOption(id: "c", textEN: "Standard matrix multiplication", textID: "Perkalian matriks standar"),
                    QuestionOption(id: "d", textEN: "Sum of matrices", textID: "Jumlah matriks")
                ],
                correctOptionId: "b",
                explanationEN: "Kronecker product A⊗B creates a block matrix. If A is m×n and B is p×q, result is mp×nq.",
                explanationID: "Kronecker product A⊗B membuat matriks blok. Jika A adalah m×n dan B adalah p×q, hasil adalah mp×nq.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa008",
                questionEN: "A Hermitian matrix H satisfies:",
                questionID: "Matriks Hermitian H memenuhi:",
                options: [
                    QuestionOption(id: "a", textEN: "H = Hᵀ", textID: "H = Hᵀ"),
                    QuestionOption(id: "b", textEN: "H = H* (conjugate transpose)", textID: "H = H* (conjugate transpose)"),
                    QuestionOption(id: "c", textEN: "H² = I", textID: "H² = I"),
                    QuestionOption(id: "d", textEN: "det(H) = 1", textID: "det(H) = 1")
                ],
                correctOptionId: "b",
                explanationEN: "Hermitian: H = H* where H* is conjugate transpose. All eigenvalues are real. Complex analog of symmetric.",
                explanationID: "Hermitian: H = H* dimana H* adalah conjugate transpose. Semua eigenvalue real. Analog kompleks dari simetris.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa009",
                questionEN: "What is the Jordan normal form used for?",
                questionID: "Untuk apa Jordan normal form digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Representing non-diagonalizable matrices in near-diagonal form", textID: "Merepresentasikan matriks non-diagonalizable dalam bentuk hampir diagonal"),
                    QuestionOption(id: "b", textEN: "Computing determinants", textID: "Menghitung determinan"),
                    QuestionOption(id: "c", textEN: "Solving linear systems", textID: "Menyelesaikan sistem linear"),
                    QuestionOption(id: "d", textEN: "Finding matrix rank", textID: "Mencari rank matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Jordan form handles defective matrices (repeated eigenvalues, insufficient eigenvectors) with Jordan blocks.",
                explanationID: "Jordan form menangani matriks defective (eigenvalue berulang, eigenvector tidak cukup) dengan blok Jordan.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa010",
                questionEN: "The Schur decomposition states that any square matrix A can be written as:",
                questionID: "Dekomposisi Schur menyatakan bahwa setiap matriks persegi A dapat ditulis sebagai:",
                options: [
                    QuestionOption(id: "a", textEN: "A = QTQ* where Q is unitary and T is upper triangular", textID: "A = QTQ* dimana Q unitary dan T segitiga atas"),
                    QuestionOption(id: "b", textEN: "A = LU where L and U are triangular", textID: "A = LU dimana L dan U adalah segitiga"),
                    QuestionOption(id: "c", textEN: "A = UΣVᵀ", textID: "A = UΣVᵀ"),
                    QuestionOption(id: "d", textEN: "A = PDP⁻¹", textID: "A = PDP⁻¹")
                ],
                correctOptionId: "a",
                explanationEN: "Schur: A = QTQ* with unitary Q and upper triangular T. Eigenvalues on diagonal of T.",
                explanationID: "Schur: A = QTQ* dengan Q unitary dan T segitiga atas. Eigenvalue pada diagonal T.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Matrix Norms and Operators
            Question(
                id: "laa011",
                questionEN: "What is the relationship between matrix 2-norm and singular values?",
                questionID: "Apa hubungan antara 2-norm matriks dan singular value?",
                options: [
                    QuestionOption(id: "a", textEN: "||A||₂ equals the largest singular value", textID: "||A||₂ sama dengan singular value terbesar"),
                    QuestionOption(id: "b", textEN: "||A||₂ equals sum of singular values", textID: "||A||₂ sama dengan jumlah singular value"),
                    QuestionOption(id: "c", textEN: "||A||₂ equals product of singular values", textID: "||A||₂ sama dengan produk singular value"),
                    QuestionOption(id: "d", textEN: "||A||₂ equals smallest singular value", textID: "||A||₂ sama dengan singular value terkecil")
                ],
                correctOptionId: "a",
                explanationEN: "Spectral norm ||A||₂ = σ₁ (largest singular value). Induced by L2 vector norm.",
                explanationID: "Spectral norm ||A||₂ = σ₁ (singular value terbesar). Diinduksi oleh L2 vector norm.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa012",
                questionEN: "What is the nuclear norm (trace norm) of a matrix?",
                questionID: "Apa itu nuclear norm (trace norm) dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Sum of singular values", textID: "Jumlah singular value"),
                    QuestionOption(id: "b", textEN: "Maximum singular value", textID: "Singular value maksimum"),
                    QuestionOption(id: "c", textEN: "Sum of diagonal elements", textID: "Jumlah elemen diagonal"),
                    QuestionOption(id: "d", textEN: "Frobenius norm squared", textID: "Frobenius norm dikuadratkan")
                ],
                correctOptionId: "a",
                explanationEN: "Nuclear norm ||A||* = Σσᵢ. Used in matrix completion and low-rank optimization.",
                explanationID: "Nuclear norm ||A||* = Σσᵢ. Digunakan dalam matrix completion dan optimasi low-rank.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa013",
                questionEN: "For matrices A and B, which norm property holds?",
                questionID: "Untuk matriks A dan B, sifat norm mana yang berlaku?",
                options: [
                    QuestionOption(id: "a", textEN: "||AB|| ≤ ||A|| × ||B|| (submultiplicative)", textID: "||AB|| ≤ ||A|| × ||B|| (submultiplicative)"),
                    QuestionOption(id: "b", textEN: "||AB|| = ||A|| + ||B||", textID: "||AB|| = ||A|| + ||B||"),
                    QuestionOption(id: "c", textEN: "||AB|| = ||A|| × ||B||", textID: "||AB|| = ||A|| × ||B||"),
                    QuestionOption(id: "d", textEN: "||AB|| ≥ ||A|| + ||B||", textID: "||AB|| ≥ ||A|| + ||B||")
                ],
                correctOptionId: "a",
                explanationEN: "Operator norms are submultiplicative: ||AB|| ≤ ||A|| × ||B||. Equality rarely holds.",
                explanationID: "Operator norm adalah submultiplicative: ||AB|| ≤ ||A|| × ||B||. Kesamaan jarang berlaku.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa014",
                questionEN: "What is the matrix exponential eᴬ?",
                questionID: "Apa itu matrix exponential eᴬ?",
                options: [
                    QuestionOption(id: "a", textEN: "Σ(Aⁿ/n!) for n from 0 to ∞", textID: "Σ(Aⁿ/n!) untuk n dari 0 sampai ∞"),
                    QuestionOption(id: "b", textEN: "Element-wise exponential", textID: "Eksponensial elemen-wise"),
                    QuestionOption(id: "c", textEN: "A raised to power e", textID: "A pangkat e"),
                    QuestionOption(id: "d", textEN: "log(A)", textID: "log(A)")
                ],
                correctOptionId: "a",
                explanationEN: "eᴬ = I + A + A²/2! + A³/3! + ... Used in solving differential equations ẋ = Ax.",
                explanationID: "eᴬ = I + A + A²/2! + A³/3! + ... Digunakan dalam menyelesaikan persamaan diferensial ẋ = Ax.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa015",
                questionEN: "What is the commutator [A, B] of matrices?",
                questionID: "Apa itu commutator [A, B] dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "AB - BA", textID: "AB - BA"),
                    QuestionOption(id: "b", textEN: "AB + BA", textID: "AB + BA"),
                    QuestionOption(id: "c", textEN: "A - B", textID: "A - B"),
                    QuestionOption(id: "d", textEN: "AᵀB", textID: "AᵀB")
                ],
                correctOptionId: "a",
                explanationEN: "[A, B] = AB - BA. If [A, B] = 0, matrices commute. Important in quantum mechanics.",
                explanationID: "[A, B] = AB - BA. Jika [A, B] = 0, matriks komutatif. Penting dalam mekanika kuantum.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Tensor and Multilinear Algebra
            Question(
                id: "laa016",
                questionEN: "What is a tensor in the context of multilinear algebra?",
                questionID: "Apa itu tensor dalam konteks aljabar multilinear?",
                options: [
                    QuestionOption(id: "a", textEN: "A multidimensional array with specific transformation properties", textID: "Array multidimensi dengan sifat transformasi tertentu"),
                    QuestionOption(id: "b", textEN: "Another name for matrix", textID: "Nama lain untuk matriks"),
                    QuestionOption(id: "c", textEN: "A type of vector", textID: "Jenis vektor"),
                    QuestionOption(id: "d", textEN: "A scalar value", textID: "Nilai skalar")
                ],
                correctOptionId: "a",
                explanationEN: "Tensors generalize vectors (order 1) and matrices (order 2) to higher orders with consistent transformation rules.",
                explanationID: "Tensor menggeneralisasi vektor (orde 1) dan matriks (orde 2) ke orde lebih tinggi dengan aturan transformasi konsisten.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa017",
                questionEN: "In Tucker decomposition of a tensor, what are the core tensor and factor matrices?",
                questionID: "Dalam dekomposisi Tucker dari tensor, apa itu core tensor dan factor matrices?",
                options: [
                    QuestionOption(id: "a", textEN: "Core captures interactions, factors capture mode-specific patterns", textID: "Core menangkap interaksi, factors menangkap pola spesifik mode"),
                    QuestionOption(id: "b", textEN: "Core is diagonal, factors are orthogonal", textID: "Core diagonal, factors orthogonal"),
                    QuestionOption(id: "c", textEN: "Core is the original tensor, factors are identity", textID: "Core adalah tensor asli, factors adalah identitas"),
                    QuestionOption(id: "d", textEN: "Core is always cubic, factors are square", textID: "Core selalu kubik, factors persegi")
                ],
                correctOptionId: "a",
                explanationEN: "Tucker: 𝒳 ≈ 𝒢 ×₁ A ×₂ B ×₃ C. Core 𝒢 is smaller, captures multiway interactions.",
                explanationID: "Tucker: 𝒳 ≈ 𝒢 ×₁ A ×₂ B ×₃ C. Core 𝒢 lebih kecil, menangkap interaksi multiway.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa018",
                questionEN: "What is CP (CANDECOMP/PARAFAC) tensor decomposition?",
                questionID: "Apa itu dekomposisi tensor CP (CANDECOMP/PARAFAC)?",
                options: [
                    QuestionOption(id: "a", textEN: "Sum of rank-1 tensors (outer products of vectors)", textID: "Jumlah tensor rank-1 (outer product vektor)"),
                    QuestionOption(id: "b", textEN: "Product of matrices", textID: "Produk matriks"),
                    QuestionOption(id: "c", textEN: "Eigendecomposition extended to tensors", textID: "Eigendecomposition diperluas ke tensor"),
                    QuestionOption(id: "d", textEN: "SVD for tensors", textID: "SVD untuk tensor")
                ],
                correctOptionId: "a",
                explanationEN: "CP: 𝒳 ≈ Σᵣ aᵣ ∘ bᵣ ∘ cᵣ. Decomposes into sum of rank-1 tensors (outer products).",
                explanationID: "CP: 𝒳 ≈ Σᵣ aᵣ ∘ bᵣ ∘ cᵣ. Menguraikan menjadi jumlah tensor rank-1 (outer product).",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa019",
                questionEN: "What is the mode-n unfolding (matricization) of a tensor?",
                questionID: "Apa itu mode-n unfolding (matricization) dari tensor?",
                options: [
                    QuestionOption(id: "a", textEN: "Reshaping tensor into matrix along mode n", textID: "Membentuk ulang tensor menjadi matriks sepanjang mode n"),
                    QuestionOption(id: "b", textEN: "Taking the nth slice", textID: "Mengambil slice ke-n"),
                    QuestionOption(id: "c", textEN: "Reducing tensor dimension by 1", textID: "Mengurangi dimensi tensor sebesar 1"),
                    QuestionOption(id: "d", textEN: "Transposing tensor modes", textID: "Transpose mode tensor")
                ],
                correctOptionId: "a",
                explanationEN: "Mode-n unfolding X₍ₙ₎ arranges mode-n fibers as columns. Essential for tensor algorithms.",
                explanationID: "Mode-n unfolding X₍ₙ₎ mengatur fiber mode-n sebagai kolom. Penting untuk algoritma tensor.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa020",
                questionEN: "What is the tensor rank?",
                questionID: "Apa itu tensor rank?",
                options: [
                    QuestionOption(id: "a", textEN: "Minimum number of rank-1 tensors needed to exactly represent it", textID: "Jumlah minimum tensor rank-1 yang diperlukan untuk merepresentasikannya"),
                    QuestionOption(id: "b", textEN: "Number of dimensions", textID: "Jumlah dimensi"),
                    QuestionOption(id: "c", textEN: "Size of the largest dimension", textID: "Ukuran dimensi terbesar"),
                    QuestionOption(id: "d", textEN: "Product of all dimensions", textID: "Produk semua dimensi")
                ],
                correctOptionId: "a",
                explanationEN: "Tensor rank = minimum R such that 𝒳 = Σᵣ aᵣ ∘ bᵣ ∘ cᵣ. Unlike matrices, finding tensor rank is NP-hard.",
                explanationID: "Tensor rank = minimum R sehingga 𝒳 = Σᵣ aᵣ ∘ bᵣ ∘ cᵣ. Berbeda dengan matriks, mencari tensor rank adalah NP-hard.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Advanced Eigenvalue Problems
            Question(
                id: "laa021",
                questionEN: "What is the generalized eigenvalue problem?",
                questionID: "Apa itu generalized eigenvalue problem?",
                options: [
                    QuestionOption(id: "a", textEN: "Find λ, v such that Av = λBv", textID: "Cari λ, v sehingga Av = λBv"),
                    QuestionOption(id: "b", textEN: "Find eigenvalues of A + B", textID: "Cari eigenvalue dari A + B"),
                    QuestionOption(id: "c", textEN: "Find eigenvalues of AB", textID: "Cari eigenvalue dari AB"),
                    QuestionOption(id: "d", textEN: "Find eigenvalues for non-square matrices", textID: "Cari eigenvalue untuk matriks non-persegi")
                ],
                correctOptionId: "a",
                explanationEN: "Generalized: Av = λBv. If B is SPD, equivalent to B⁻¹Av = λv. Used in PCA with constraints.",
                explanationID: "Generalized: Av = λBv. Jika B adalah SPD, ekuivalen dengan B⁻¹Av = λv. Digunakan dalam PCA dengan constraint.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa022",
                questionEN: "The power method converges to:",
                questionID: "Power method konvergen ke:",
                options: [
                    QuestionOption(id: "a", textEN: "The dominant eigenvector (largest |λ|)", textID: "Eigenvector dominan (|λ| terbesar)"),
                    QuestionOption(id: "b", textEN: "The smallest eigenvalue", textID: "Eigenvalue terkecil"),
                    QuestionOption(id: "c", textEN: "All eigenvectors simultaneously", textID: "Semua eigenvector secara bersamaan"),
                    QuestionOption(id: "d", textEN: "The matrix inverse", textID: "Invers matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Power iteration: xₖ₊₁ = Axₖ/||Axₖ|| converges to eigenvector of largest |λ|. Rate depends on |λ₁/λ₂|.",
                explanationID: "Power iteration: xₖ₊₁ = Axₖ/||Axₖ|| konvergen ke eigenvector |λ| terbesar. Laju bergantung pada |λ₁/λ₂|.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa023",
                questionEN: "What is deflation in eigenvalue computation?",
                questionID: "Apa itu deflation dalam komputasi eigenvalue?",
                options: [
                    QuestionOption(id: "a", textEN: "Removing computed eigenvalue to find the next one", textID: "Menghapus eigenvalue yang sudah dihitung untuk mencari yang berikutnya"),
                    QuestionOption(id: "b", textEN: "Reducing matrix size", textID: "Mengurangi ukuran matriks"),
                    QuestionOption(id: "c", textEN: "Compressing eigenvalue range", textID: "Mengkompresi rentang eigenvalue"),
                    QuestionOption(id: "d", textEN: "Normalizing eigenvectors", textID: "Menormalisasi eigenvector")
                ],
                correctOptionId: "a",
                explanationEN: "Deflation: After finding λ₁,v₁, form A₁ = A - λ₁v₁v₁ᵀ to find next eigenvalue.",
                explanationID: "Deflation: Setelah menemukan λ₁,v₁, bentuk A₁ = A - λ₁v₁v₁ᵀ untuk mencari eigenvalue berikutnya.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa024",
                questionEN: "The Rayleigh quotient R(x) = xᵀAx/xᵀx is useful because:",
                questionID: "Rayleigh quotient R(x) = xᵀAx/xᵀx berguna karena:",
                options: [
                    QuestionOption(id: "a", textEN: "It estimates eigenvalue and equals λ when x is an eigenvector", textID: "Memperkirakan eigenvalue dan sama dengan λ ketika x adalah eigenvector"),
                    QuestionOption(id: "b", textEN: "It always equals the determinant", textID: "Selalu sama dengan determinan"),
                    QuestionOption(id: "c", textEN: "It computes the inverse", textID: "Menghitung invers"),
                    QuestionOption(id: "d", textEN: "It finds the trace", textID: "Mencari trace")
                ],
                correctOptionId: "a",
                explanationEN: "Rayleigh quotient gives best eigenvalue estimate for approximate eigenvector. Converges quadratically near eigenvector.",
                explanationID: "Rayleigh quotient memberikan perkiraan eigenvalue terbaik untuk eigenvector aproksimasi. Konvergen kuadratik dekat eigenvector.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa025",
                questionEN: "What is the Lanczos algorithm used for?",
                questionID: "Untuk apa algoritma Lanczos digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Finding extremal eigenvalues of large sparse symmetric matrices", textID: "Mencari eigenvalue ekstrem dari matriks simetris sparse besar"),
                    QuestionOption(id: "b", textEN: "Computing matrix inverse", textID: "Menghitung invers matriks"),
                    QuestionOption(id: "c", textEN: "Solving linear systems", textID: "Menyelesaikan sistem linear"),
                    QuestionOption(id: "d", textEN: "Matrix multiplication", textID: "Perkalian matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Lanczos builds tridiagonal matrix from Krylov subspace. Efficiently finds largest/smallest eigenvalues for sparse matrices.",
                explanationID: "Lanczos membangun matriks tridiagonal dari Krylov subspace. Efisien menemukan eigenvalue terbesar/terkecil untuk matriks sparse.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Applications in ML/AI
            Question(
                id: "laa026",
                questionEN: "In PCA, why do we use eigendecomposition of the covariance matrix?",
                questionID: "Dalam PCA, mengapa kita menggunakan eigendecomposition dari matriks kovarians?",
                options: [
                    QuestionOption(id: "a", textEN: "Eigenvectors are directions of maximum variance", textID: "Eigenvector adalah arah variansi maksimum"),
                    QuestionOption(id: "b", textEN: "Eigenvalues give the mean", textID: "Eigenvalue memberikan mean"),
                    QuestionOption(id: "c", textEN: "To normalize the data", textID: "Untuk menormalisasi data"),
                    QuestionOption(id: "d", textEN: "To compute correlations", textID: "Untuk menghitung korelasi")
                ],
                correctOptionId: "a",
                explanationEN: "PCA: eigenvectors of Σ are principal components. λᵢ = variance along that direction. Σ = VΛVᵀ.",
                explanationID: "PCA: eigenvector dari Σ adalah komponen utama. λᵢ = variansi sepanjang arah itu. Σ = VΛVᵀ.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa027",
                questionEN: "What is the role of SVD in recommender systems?",
                questionID: "Apa peran SVD dalam sistem rekomendasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Low-rank approximation captures latent factors", textID: "Aproksimasi low-rank menangkap faktor laten"),
                    QuestionOption(id: "b", textEN: "Computing exact user-item scores", textID: "Menghitung skor user-item tepat"),
                    QuestionOption(id: "c", textEN: "Sorting recommendations", textID: "Mengurutkan rekomendasi"),
                    QuestionOption(id: "d", textEN: "Handling missing data directly", textID: "Menangani data hilang langsung")
                ],
                correctOptionId: "a",
                explanationEN: "SVD factorizes rating matrix R ≈ UΣVᵀ. U captures user factors, V captures item factors. Truncated SVD reduces noise.",
                explanationID: "SVD memfaktorkan matriks rating R ≈ UΣVᵀ. U menangkap faktor user, V menangkap faktor item. Truncated SVD mengurangi noise.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa028",
                questionEN: "Why are orthogonal weight initializations beneficial in deep learning?",
                questionID: "Mengapa inisialisasi bobot orthogonal bermanfaat dalam deep learning?",
                options: [
                    QuestionOption(id: "a", textEN: "Preserves gradient magnitude through layers", textID: "Menjaga magnitude gradien melalui layer"),
                    QuestionOption(id: "b", textEN: "Reduces memory usage", textID: "Mengurangi penggunaan memori"),
                    QuestionOption(id: "c", textEN: "Speeds up computation", textID: "Mempercepat komputasi"),
                    QuestionOption(id: "d", textEN: "Ensures positive weights", textID: "Memastikan bobot positif")
                ],
                correctOptionId: "a",
                explanationEN: "Orthogonal matrices preserve norms: ||Wx|| = ||x||. Helps prevent vanishing/exploding gradients in RNNs.",
                explanationID: "Matriks orthogonal menjaga norm: ||Wx|| = ||x||. Membantu mencegah vanishing/exploding gradients di RNN.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa029",
                questionEN: "What is the Hessian matrix in optimization?",
                questionID: "Apa itu matriks Hessian dalam optimasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Matrix of second partial derivatives", textID: "Matriks turunan parsial kedua"),
                    QuestionOption(id: "b", textEN: "Matrix of first derivatives", textID: "Matriks turunan pertama"),
                    QuestionOption(id: "c", textEN: "The gradient vector", textID: "Vektor gradien"),
                    QuestionOption(id: "d", textEN: "The loss function value", textID: "Nilai fungsi loss")
                ],
                correctOptionId: "a",
                explanationEN: "Hessian H[i,j] = ∂²f/∂xᵢ∂xⱼ. Its eigenvalues determine curvature and convergence rate of Newton's method.",
                explanationID: "Hessian H[i,j] = ∂²f/∂xᵢ∂xⱼ. Eigenvalue-nya menentukan kurvatur dan laju konvergensi metode Newton.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa030",
                questionEN: "In graph neural networks, what is the role of the graph Laplacian?",
                questionID: "Dalam graph neural networks, apa peran dari graph Laplacian?",
                options: [
                    QuestionOption(id: "a", textEN: "Captures graph structure for spectral convolutions", textID: "Menangkap struktur graph untuk konvolusi spektral"),
                    QuestionOption(id: "b", textEN: "Stores node features", textID: "Menyimpan fitur node"),
                    QuestionOption(id: "c", textEN: "Defines edge weights", textID: "Mendefinisikan bobot edge"),
                    QuestionOption(id: "d", textEN: "Counts graph nodes", textID: "Menghitung node graph")
                ],
                correctOptionId: "a",
                explanationEN: "Laplacian L = D - A (degree - adjacency). Eigenvectors define graph Fourier basis. Spectral GNNs filter in this basis.",
                explanationID: "Laplacian L = D - A (degree - adjacency). Eigenvector mendefinisikan basis Fourier graph. Spectral GNN memfilter dalam basis ini.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Numerical Methods
            Question(
                id: "laa031",
                questionEN: "What is the LU decomposition used for?",
                questionID: "Untuk apa dekomposisi LU digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Efficiently solving multiple linear systems with same A", textID: "Menyelesaikan beberapa sistem linear dengan A sama secara efisien"),
                    QuestionOption(id: "b", textEN: "Finding eigenvalues", textID: "Mencari eigenvalue"),
                    QuestionOption(id: "c", textEN: "Computing SVD", textID: "Menghitung SVD"),
                    QuestionOption(id: "d", textEN: "Matrix normalization", textID: "Normalisasi matriks")
                ],
                correctOptionId: "a",
                explanationEN: "LU: A = LU. Solve Ax = b via Ly = b then Ux = y. O(n³) once, then O(n²) per system.",
                explanationID: "LU: A = LU. Selesaikan Ax = b via Ly = b lalu Ux = y. O(n³) sekali, lalu O(n²) per sistem.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa032",
                questionEN: "What is Cholesky decomposition and when is it applicable?",
                questionID: "Apa itu dekomposisi Cholesky dan kapan dapat diterapkan?",
                options: [
                    QuestionOption(id: "a", textEN: "A = LLᵀ for symmetric positive definite matrices", textID: "A = LLᵀ untuk matriks simetris positive definite"),
                    QuestionOption(id: "b", textEN: "A = QR for any matrix", textID: "A = QR untuk semua matriks"),
                    QuestionOption(id: "c", textEN: "A = UΣVᵀ for rectangular matrices", textID: "A = UΣVᵀ untuk matriks persegi panjang"),
                    QuestionOption(id: "d", textEN: "A = PDP⁻¹ for diagonalizable matrices", textID: "A = PDP⁻¹ untuk matriks diagonalizable")
                ],
                correctOptionId: "a",
                explanationEN: "Cholesky: A = LLᵀ where L is lower triangular. Only for SPD matrices. Half the cost of LU.",
                explanationID: "Cholesky: A = LLᵀ dimana L adalah segitiga bawah. Hanya untuk matriks SPD. Setengah biaya LU.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa033",
                questionEN: "What is iterative refinement in solving linear systems?",
                questionID: "Apa itu iterative refinement dalam menyelesaikan sistem linear?",
                options: [
                    QuestionOption(id: "a", textEN: "Computing residual and correcting solution iteratively", textID: "Menghitung residual dan memperbaiki solusi secara iteratif"),
                    QuestionOption(id: "b", textEN: "Repeating LU decomposition", textID: "Mengulangi dekomposisi LU"),
                    QuestionOption(id: "c", textEN: "Using larger floating point precision", textID: "Menggunakan presisi floating point lebih besar"),
                    QuestionOption(id: "d", textEN: "Adding regularization", textID: "Menambahkan regularisasi")
                ],
                correctOptionId: "a",
                explanationEN: "Compute residual r = b - Ax̂, solve Aδ = r, update x̂ ← x̂ + δ. Improves accuracy with minimal cost.",
                explanationID: "Hitung residual r = b - Ax̂, selesaikan Aδ = r, update x̂ ← x̂ + δ. Meningkatkan akurasi dengan biaya minimal.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa034",
                questionEN: "The conjugate gradient method is optimal for:",
                questionID: "Metode conjugate gradient optimal untuk:",
                options: [
                    QuestionOption(id: "a", textEN: "Large sparse symmetric positive definite systems", textID: "Sistem simetris positive definite sparse besar"),
                    QuestionOption(id: "b", textEN: "Any linear system", textID: "Semua sistem linear"),
                    QuestionOption(id: "c", textEN: "Non-square systems", textID: "Sistem non-persegi"),
                    QuestionOption(id: "d", textEN: "Dense small systems", textID: "Sistem dense kecil")
                ],
                correctOptionId: "a",
                explanationEN: "CG minimizes ||x - x*||_A over Krylov subspace. O(n√κ) iterations where κ is condition number. Matrix-free.",
                explanationID: "CG meminimalkan ||x - x*||_A atas Krylov subspace. O(n√κ) iterasi dimana κ adalah condition number. Matrix-free.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa035",
                questionEN: "What is preconditioning in iterative methods?",
                questionID: "Apa itu preconditioning dalam metode iteratif?",
                options: [
                    QuestionOption(id: "a", textEN: "Transforming system to reduce condition number", textID: "Mentransformasi sistem untuk mengurangi condition number"),
                    QuestionOption(id: "b", textEN: "Initializing with good starting point", textID: "Menginisialisasi dengan titik awal yang baik"),
                    QuestionOption(id: "c", textEN: "Scaling the matrix", textID: "Menskalakan matriks"),
                    QuestionOption(id: "d", textEN: "Adding noise for stability", textID: "Menambahkan noise untuk stabilitas")
                ],
                correctOptionId: "a",
                explanationEN: "Preconditioner M ≈ A⁻¹. Solve M⁻¹Ax = M⁻¹b instead. Better conditioning → faster convergence.",
                explanationID: "Preconditioner M ≈ A⁻¹. Selesaikan M⁻¹Ax = M⁻¹b. Conditioning lebih baik → konvergensi lebih cepat.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Sparse Matrices
            Question(
                id: "laa036",
                questionEN: "What is the Compressed Sparse Row (CSR) format?",
                questionID: "Apa itu format Compressed Sparse Row (CSR)?",
                options: [
                    QuestionOption(id: "a", textEN: "Stores values, column indices, and row pointers", textID: "Menyimpan nilai, indeks kolom, dan pointer baris"),
                    QuestionOption(id: "b", textEN: "Stores all elements including zeros", textID: "Menyimpan semua elemen termasuk nol"),
                    QuestionOption(id: "c", textEN: "Only stores diagonal elements", textID: "Hanya menyimpan elemen diagonal"),
                    QuestionOption(id: "d", textEN: "Uses linked lists for each row", textID: "Menggunakan linked list untuk setiap baris")
                ],
                correctOptionId: "a",
                explanationEN: "CSR: values array, column_indices array, row_pointers array. Efficient for row operations and matrix-vector multiply.",
                explanationID: "CSR: array values, array column_indices, array row_pointers. Efisien untuk operasi baris dan perkalian matriks-vektor.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa037",
                questionEN: "Fill-in in sparse LU decomposition refers to:",
                questionID: "Fill-in dalam dekomposisi LU sparse mengacu pada:",
                options: [
                    QuestionOption(id: "a", textEN: "New non-zero elements created during decomposition", textID: "Elemen non-nol baru yang tercipta selama dekomposisi"),
                    QuestionOption(id: "b", textEN: "Zero elements being preserved", textID: "Elemen nol yang dipertahankan"),
                    QuestionOption(id: "c", textEN: "Missing matrix entries", textID: "Entri matriks yang hilang"),
                    QuestionOption(id: "d", textEN: "Padding for alignment", textID: "Padding untuk alignment")
                ],
                correctOptionId: "a",
                explanationEN: "Fill-in: zeros become non-zeros in L and U. Reordering (e.g., AMD) minimizes fill-in for efficiency.",
                explanationID: "Fill-in: nol menjadi non-nol di L dan U. Reordering (mis. AMD) meminimalkan fill-in untuk efisiensi.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa038",
                questionEN: "What is the benefit of banded matrices?",
                questionID: "Apa manfaat dari matriks banded?",
                options: [
                    QuestionOption(id: "a", textEN: "O(n) storage and efficient O(n) algorithms", textID: "Penyimpanan O(n) dan algoritma O(n) yang efisien"),
                    QuestionOption(id: "b", textEN: "Always have full rank", textID: "Selalu memiliki full rank"),
                    QuestionOption(id: "c", textEN: "Eigenvalues are easily computed", textID: "Eigenvalue mudah dihitung"),
                    QuestionOption(id: "d", textEN: "Can represent any matrix", textID: "Dapat merepresentasikan matriks apapun")
                ],
                correctOptionId: "a",
                explanationEN: "Banded matrix with bandwidth b: only O(nb) non-zeros. LU is O(nb²). Common in finite differences/elements.",
                explanationID: "Matriks banded dengan bandwidth b: hanya O(nb) non-nol. LU adalah O(nb²). Umum dalam finite differences/elements.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa039",
                questionEN: "What is the sparsity pattern of a matrix?",
                questionID: "Apa itu sparsity pattern dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "The locations of non-zero elements", textID: "Lokasi elemen non-nol"),
                    QuestionOption(id: "b", textEN: "The ratio of zeros to total elements", textID: "Rasio nol terhadap total elemen"),
                    QuestionOption(id: "c", textEN: "The distribution of eigenvalues", textID: "Distribusi eigenvalue"),
                    QuestionOption(id: "d", textEN: "The row sums", textID: "Jumlah baris")
                ],
                correctOptionId: "a",
                explanationEN: "Sparsity pattern is the set of (i,j) where aᵢⱼ ≠ 0. Determines storage and algorithm efficiency.",
                explanationID: "Sparsity pattern adalah himpunan (i,j) dimana aᵢⱼ ≠ 0. Menentukan penyimpanan dan efisiensi algoritma.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa040",
                questionEN: "Graph partitioning helps sparse matrix computations by:",
                questionID: "Graph partitioning membantu komputasi matriks sparse dengan:",
                options: [
                    QuestionOption(id: "a", textEN: "Minimizing communication in parallel algorithms", textID: "Meminimalkan komunikasi dalam algoritma paralel"),
                    QuestionOption(id: "b", textEN: "Increasing matrix size", textID: "Meningkatkan ukuran matriks"),
                    QuestionOption(id: "c", textEN: "Converting to dense format", textID: "Mengkonversi ke format dense"),
                    QuestionOption(id: "d", textEN: "Finding eigenvalues faster", textID: "Mencari eigenvalue lebih cepat")
                ],
                correctOptionId: "a",
                explanationEN: "Partitioning (METIS, etc.) groups related rows/columns. Reduces communication overhead in distributed SpMV.",
                explanationID: "Partitioning (METIS, dll.) mengelompokkan baris/kolom terkait. Mengurangi overhead komunikasi dalam SpMV terdistribusi.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Random Matrix Theory
            Question(
                id: "laa041",
                questionEN: "The Marchenko-Pastur distribution describes:",
                questionID: "Distribusi Marchenko-Pastur menggambarkan:",
                options: [
                    QuestionOption(id: "a", textEN: "Eigenvalue distribution of sample covariance matrices", textID: "Distribusi eigenvalue dari matriks kovarians sampel"),
                    QuestionOption(id: "b", textEN: "Singular values of any matrix", textID: "Singular value dari matriks apapun"),
                    QuestionOption(id: "c", textEN: "Distribution of matrix norms", textID: "Distribusi norm matriks"),
                    QuestionOption(id: "d", textEN: "Trace distribution", textID: "Distribusi trace")
                ],
                correctOptionId: "a",
                explanationEN: "MP law: for random X (n×p), eigenvalues of XᵀX/n follow MP distribution as n,p → ∞ with p/n → γ.",
                explanationID: "Hukum MP: untuk X random (n×p), eigenvalue dari XᵀX/n mengikuti distribusi MP saat n,p → ∞ dengan p/n → γ.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa042",
                questionEN: "What is the Tracy-Widom distribution?",
                questionID: "Apa itu distribusi Tracy-Widom?",
                options: [
                    QuestionOption(id: "a", textEN: "Distribution of largest eigenvalue of random matrices", textID: "Distribusi eigenvalue terbesar dari matriks random"),
                    QuestionOption(id: "b", textEN: "Distribution of matrix determinant", textID: "Distribusi determinan matriks"),
                    QuestionOption(id: "c", textEN: "Distribution of matrix rank", textID: "Distribusi rank matriks"),
                    QuestionOption(id: "d", textEN: "Normal distribution for matrices", textID: "Distribusi normal untuk matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Tracy-Widom describes fluctuations of largest eigenvalue around its mean. Used in PCA significance testing.",
                explanationID: "Tracy-Widom menggambarkan fluktuasi eigenvalue terbesar di sekitar mean-nya. Digunakan dalam pengujian signifikansi PCA.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa043",
                questionEN: "What is the effective rank of a matrix?",
                questionID: "Apa itu effective rank dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Sum of normalized singular values: Σσᵢ/σ₁ or entropy-based measure", textID: "Jumlah singular value ternormalisasi: Σσᵢ/σ₁ atau ukuran berbasis entropi"),
                    QuestionOption(id: "b", textEN: "Number of non-zero singular values", textID: "Jumlah singular value non-nol"),
                    QuestionOption(id: "c", textEN: "Largest singular value", textID: "Singular value terbesar"),
                    QuestionOption(id: "d", textEN: "Matrix dimension", textID: "Dimensi matriks")
                ],
                correctOptionId: "a",
                explanationEN: "Effective rank captures 'soft' rank considering singular value decay. erank = exp(entropy of normalized σᵢ²).",
                explanationID: "Effective rank menangkap rank 'soft' dengan mempertimbangkan peluruhan singular value. erank = exp(entropi dari σᵢ² ternormalisasi).",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa044",
                questionEN: "The Wishart distribution is:",
                questionID: "Distribusi Wishart adalah:",
                options: [
                    QuestionOption(id: "a", textEN: "Distribution of sample covariance matrices from Gaussian data", textID: "Distribusi matriks kovarians sampel dari data Gaussian"),
                    QuestionOption(id: "b", textEN: "Distribution of eigenvalues", textID: "Distribusi eigenvalue"),
                    QuestionOption(id: "c", textEN: "Distribution of matrix inverse", textID: "Distribusi invers matriks"),
                    QuestionOption(id: "d", textEN: "Uniform distribution on matrices", textID: "Distribusi uniform pada matriks")
                ],
                correctOptionId: "a",
                explanationEN: "If X ~ N(0,Σ) is n×p, then XᵀX ~ Wishart(n,Σ). Fundamental in multivariate statistics.",
                explanationID: "Jika X ~ N(0,Σ) adalah n×p, maka XᵀX ~ Wishart(n,Σ). Fundamental dalam statistik multivariat.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa045",
                questionEN: "What is the spiked covariance model?",
                questionID: "Apa itu model spiked covariance?",
                options: [
                    QuestionOption(id: "a", textEN: "Few large eigenvalues plus noise (signal + noise)", textID: "Beberapa eigenvalue besar plus noise (sinyal + noise)"),
                    QuestionOption(id: "b", textEN: "All eigenvalues are equal", textID: "Semua eigenvalue sama"),
                    QuestionOption(id: "c", textEN: "Monotonically decreasing eigenvalues", textID: "Eigenvalue menurun monoton"),
                    QuestionOption(id: "d", textEN: "Random eigenvalue structure", textID: "Struktur eigenvalue random")
                ],
                correctOptionId: "a",
                explanationEN: "Spiked model: Σ = I + Σsignal where Σsignal is low-rank. Phase transition: spikes detectable only if strong enough.",
                explanationID: "Model spiked: Σ = I + Σsignal dimana Σsignal adalah low-rank. Transisi fase: spike terdeteksi hanya jika cukup kuat.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Advanced Topics
            Question(
                id: "laa046",
                questionEN: "What is the relationship between trace and eigenvalues?",
                questionID: "Apa hubungan antara trace dan eigenvalue?",
                options: [
                    QuestionOption(id: "a", textEN: "tr(A) = sum of all eigenvalues", textID: "tr(A) = jumlah semua eigenvalue"),
                    QuestionOption(id: "b", textEN: "tr(A) = product of eigenvalues", textID: "tr(A) = produk eigenvalue"),
                    QuestionOption(id: "c", textEN: "tr(A) = largest eigenvalue", textID: "tr(A) = eigenvalue terbesar"),
                    QuestionOption(id: "d", textEN: "tr(A) = number of eigenvalues", textID: "tr(A) = jumlah eigenvalue")
                ],
                correctOptionId: "a",
                explanationEN: "Trace equals sum of eigenvalues: tr(A) = Σλᵢ. Also, det(A) = Πλᵢ (product of eigenvalues).",
                explanationID: "Trace sama dengan jumlah eigenvalue: tr(A) = Σλᵢ. Juga, det(A) = Πλᵢ (produk eigenvalue).",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa047",
                questionEN: "What is the matrix logarithm log(A)?",
                questionID: "Apa itu logaritma matriks log(A)?",
                options: [
                    QuestionOption(id: "a", textEN: "Matrix B such that eᴮ = A", textID: "Matriks B sehingga eᴮ = A"),
                    QuestionOption(id: "b", textEN: "Element-wise logarithm", textID: "Logaritma elemen-wise"),
                    QuestionOption(id: "c", textEN: "log of determinant", textID: "log dari determinan"),
                    QuestionOption(id: "d", textEN: "log of trace", textID: "log dari trace")
                ],
                correctOptionId: "a",
                explanationEN: "log(A) = B where eᴮ = A. For SPD matrices, log(A) = V log(Λ) Vᵀ using eigendecomposition.",
                explanationID: "log(A) = B dimana eᴮ = A. Untuk matriks SPD, log(A) = V log(Λ) Vᵀ menggunakan eigendecomposition.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa048",
                questionEN: "What is a Krylov subspace Kₖ(A, b)?",
                questionID: "Apa itu Krylov subspace Kₖ(A, b)?",
                options: [
                    QuestionOption(id: "a", textEN: "span{b, Ab, A²b, ..., Aᵏ⁻¹b}", textID: "span{b, Ab, A²b, ..., Aᵏ⁻¹b}"),
                    QuestionOption(id: "b", textEN: "Null space of A", textID: "Null space dari A"),
                    QuestionOption(id: "c", textEN: "Column space of A", textID: "Column space dari A"),
                    QuestionOption(id: "d", textEN: "Row space of A", textID: "Row space dari A")
                ],
                correctOptionId: "a",
                explanationEN: "Krylov subspace grows by applying A. Basis for CG, GMRES, Lanczos. Dimension ≤ min(k, grade of b).",
                explanationID: "Krylov subspace tumbuh dengan menerapkan A. Basis untuk CG, GMRES, Lanczos. Dimensi ≤ min(k, grade dari b).",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa049",
                questionEN: "What is the matrix square root A^(1/2)?",
                questionID: "Apa itu akar kuadrat matriks A^(1/2)?",
                options: [
                    QuestionOption(id: "a", textEN: "Matrix B such that B² = A", textID: "Matriks B sehingga B² = A"),
                    QuestionOption(id: "b", textEN: "Element-wise square root", textID: "Akar kuadrat elemen-wise"),
                    QuestionOption(id: "c", textEN: "A divided by 2", textID: "A dibagi 2"),
                    QuestionOption(id: "d", textEN: "Square root of determinant", textID: "Akar kuadrat determinan")
                ],
                correctOptionId: "a",
                explanationEN: "For SPD A: A^(1/2) = V Λ^(1/2) Vᵀ where Λ^(1/2) has √λᵢ on diagonal. Unique positive definite root.",
                explanationID: "Untuk SPD A: A^(1/2) = V Λ^(1/2) Vᵀ dimana Λ^(1/2) memiliki √λᵢ pada diagonal. Akar positive definite unik.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "laa050",
                questionEN: "What is the Perron-Frobenius theorem about?",
                questionID: "Tentang apa teorema Perron-Frobenius?",
                options: [
                    QuestionOption(id: "a", textEN: "Dominant eigenvalue of non-negative matrices is real and positive", textID: "Eigenvalue dominan matriks non-negatif adalah real dan positif"),
                    QuestionOption(id: "b", textEN: "All matrices are diagonalizable", textID: "Semua matriks dapat didiagonalkan"),
                    QuestionOption(id: "c", textEN: "Symmetric matrices have real eigenvalues", textID: "Matriks simetris memiliki eigenvalue real"),
                    QuestionOption(id: "d", textEN: "Orthogonal matrices preserve norms", textID: "Matriks orthogonal menjaga norm")
                ],
                correctOptionId: "a",
                explanationEN: "Perron-Frobenius: For A ≥ 0 irreducible, ρ(A) is a simple eigenvalue with positive eigenvector. Key for PageRank.",
                explanationID: "Perron-Frobenius: Untuk A ≥ 0 irreducible, ρ(A) adalah eigenvalue sederhana dengan eigenvector positif. Kunci untuk PageRank.",
                topic: "mathematics",
                difficulty: .advanced
            ),
        ]
    }
}
