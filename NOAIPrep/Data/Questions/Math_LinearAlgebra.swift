import Foundation

// MARK: - Linear Algebra Questions (Batch 1-5: 50 questions)
extension NOAIQuestionBank {
    var linearAlgebraQuestions: [Question] {
        [
            // Batch 1: Questions 1-10
            Question(
                id: "la001",
                questionEN: "What is the result of multiplying a 3×2 matrix by a 2×4 matrix?",
                questionID: "Apa hasil perkalian matriks 3×2 dengan matriks 2×4?",
                options: [
                    QuestionOption(id: "a", textEN: "3×4 matrix", textID: "Matriks 3×4"),
                    QuestionOption(id: "b", textEN: "2×2 matrix", textID: "Matriks 2×2"),
                    QuestionOption(id: "c", textEN: "4×3 matrix", textID: "Matriks 4×3"),
                    QuestionOption(id: "d", textEN: "Cannot be multiplied", textID: "Tidak dapat dikalikan")
                ],
                correctOptionId: "a",
                explanationEN: "Matrix multiplication (m×n) × (n×p) = (m×p). So (3×2) × (2×4) = 3×4 matrix.",
                explanationID: "Perkalian matriks (m×n) × (n×p) = (m×p). Jadi (3×2) × (2×4) = matriks 3×4.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la002",
                questionEN: "What is the determinant of matrix [[2, 3], [1, 4]]?",
                questionID: "Berapa determinan matriks [[2, 3], [1, 4]]?",
                options: [
                    QuestionOption(id: "a", textEN: "5", textID: "5"),
                    QuestionOption(id: "b", textEN: "11", textID: "11"),
                    QuestionOption(id: "c", textEN: "-5", textID: "-5"),
                    QuestionOption(id: "d", textEN: "8", textID: "8")
                ],
                correctOptionId: "a",
                explanationEN: "For 2×2 matrix [[a,b],[c,d]], det = ad - bc = (2×4) - (3×1) = 8 - 3 = 5",
                explanationID: "Untuk matriks 2×2 [[a,b],[c,d]], det = ad - bc = (2×4) - (3×1) = 8 - 3 = 5",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la003",
                questionEN: "What is an eigenvalue?",
                questionID: "Apa itu eigenvalue?",
                options: [
                    QuestionOption(id: "a", textEN: "The determinant of a matrix", textID: "Determinan suatu matriks"),
                    QuestionOption(id: "b", textEN: "A scalar λ where Av = λv for some vector v", textID: "Skalar λ dimana Av = λv untuk vektor v tertentu"),
                    QuestionOption(id: "c", textEN: "The trace of a matrix", textID: "Trace dari matriks"),
                    QuestionOption(id: "d", textEN: "The inverse of a matrix", textID: "Invers dari matriks")
                ],
                correctOptionId: "b",
                explanationEN: "An eigenvalue λ is a scalar where Av = λv. The vector v is called an eigenvector.",
                explanationID: "Eigenvalue λ adalah skalar dimana Av = λv. Vektor v disebut eigenvector.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la004",
                questionEN: "What is the dot product of vectors [1, 2, 3] and [4, 5, 6]?",
                questionID: "Berapa dot product vektor [1, 2, 3] dan [4, 5, 6]?",
                options: [
                    QuestionOption(id: "a", textEN: "32", textID: "32"),
                    QuestionOption(id: "b", textEN: "21", textID: "21"),
                    QuestionOption(id: "c", textEN: "15", textID: "15"),
                    QuestionOption(id: "d", textEN: "27", textID: "27")
                ],
                correctOptionId: "a",
                explanationEN: "Dot product = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32",
                explanationID: "Dot product = (1×4) + (2×5) + (3×6) = 4 + 10 + 18 = 32",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la005",
                questionEN: "What is the transpose of matrix [[1, 2], [3, 4], [5, 6]]?",
                questionID: "Apa transpose dari matriks [[1, 2], [3, 4], [5, 6]]?",
                options: [
                    QuestionOption(id: "a", textEN: "[[1, 3, 5], [2, 4, 6]]", textID: "[[1, 3, 5], [2, 4, 6]]"),
                    QuestionOption(id: "b", textEN: "[[6, 5], [4, 3], [2, 1]]", textID: "[[6, 5], [4, 3], [2, 1]]"),
                    QuestionOption(id: "c", textEN: "[[1, 2, 3], [4, 5, 6]]", textID: "[[1, 2, 3], [4, 5, 6]]"),
                    QuestionOption(id: "d", textEN: "[[2, 1], [4, 3], [6, 5]]", textID: "[[2, 1], [4, 3], [6, 5]]")
                ],
                correctOptionId: "a",
                explanationEN: "Transpose swaps rows and columns. A 3×2 matrix becomes 2×3: [[1,3,5], [2,4,6]]",
                explanationID: "Transpose menukar baris dan kolom. Matriks 3×2 menjadi 2×3: [[1,3,5], [2,4,6]]",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la006",
                questionEN: "If A is an invertible matrix, what is A × A⁻¹?",
                questionID: "Jika A adalah matriks invertible, apa hasil A × A⁻¹?",
                options: [
                    QuestionOption(id: "a", textEN: "Zero matrix", textID: "Matriks nol"),
                    QuestionOption(id: "b", textEN: "Identity matrix", textID: "Matriks identitas"),
                    QuestionOption(id: "c", textEN: "A itself", textID: "A itu sendiri"),
                    QuestionOption(id: "d", textEN: "A²", textID: "A²")
                ],
                correctOptionId: "b",
                explanationEN: "By definition, A × A⁻¹ = A⁻¹ × A = I (identity matrix).",
                explanationID: "Secara definisi, A × A⁻¹ = A⁻¹ × A = I (matriks identitas).",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la007",
                questionEN: "What is the rank of a matrix?",
                questionID: "Apa itu rank dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "The number of rows", textID: "Jumlah baris"),
                    QuestionOption(id: "b", textEN: "The number of linearly independent rows or columns", textID: "Jumlah baris atau kolom yang linear independent"),
                    QuestionOption(id: "c", textEN: "The determinant value", textID: "Nilai determinan"),
                    QuestionOption(id: "d", textEN: "The trace of the matrix", textID: "Trace dari matriks")
                ],
                correctOptionId: "b",
                explanationEN: "Rank is the maximum number of linearly independent row or column vectors.",
                explanationID: "Rank adalah jumlah maksimum vektor baris atau kolom yang linear independent.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la008",
                questionEN: "What is the L2 norm (Euclidean norm) of vector [3, 4]?",
                questionID: "Berapa L2 norm (Euclidean norm) dari vektor [3, 4]?",
                options: [
                    QuestionOption(id: "a", textEN: "7", textID: "7"),
                    QuestionOption(id: "b", textEN: "5", textID: "5"),
                    QuestionOption(id: "c", textEN: "12", textID: "12"),
                    QuestionOption(id: "d", textEN: "25", textID: "25")
                ],
                correctOptionId: "b",
                explanationEN: "L2 norm = √(3² + 4²) = √(9 + 16) = √25 = 5",
                explanationID: "L2 norm = √(3² + 4²) = √(9 + 16) = √25 = 5",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la009",
                questionEN: "Two vectors are orthogonal when their dot product equals:",
                questionID: "Dua vektor orthogonal ketika dot product mereka sama dengan:",
                options: [
                    QuestionOption(id: "a", textEN: "1", textID: "1"),
                    QuestionOption(id: "b", textEN: "0", textID: "0"),
                    QuestionOption(id: "c", textEN: "-1", textID: "-1"),
                    QuestionOption(id: "d", textEN: "Their sum", textID: "Jumlah mereka")
                ],
                correctOptionId: "b",
                explanationEN: "Orthogonal vectors are perpendicular, and their dot product equals 0.",
                explanationID: "Vektor orthogonal adalah tegak lurus, dan dot product mereka sama dengan 0.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la010",
                questionEN: "What is the trace of matrix [[1, 2, 3], [4, 5, 6], [7, 8, 9]]?",
                questionID: "Berapa trace dari matriks [[1, 2, 3], [4, 5, 6], [7, 8, 9]]?",
                options: [
                    QuestionOption(id: "a", textEN: "45", textID: "45"),
                    QuestionOption(id: "b", textEN: "15", textID: "15"),
                    QuestionOption(id: "c", textEN: "6", textID: "6"),
                    QuestionOption(id: "d", textEN: "18", textID: "18")
                ],
                correctOptionId: "b",
                explanationEN: "Trace is the sum of diagonal elements: 1 + 5 + 9 = 15",
                explanationID: "Trace adalah jumlah elemen diagonal: 1 + 5 + 9 = 15",
                topic: "mathematics",
                difficulty: .beginner
            ),
            // Batch 2: Questions 11-20
            Question(
                id: "la011",
                questionEN: "A matrix A is symmetric if:",
                questionID: "Matriks A adalah simetris jika:",
                options: [
                    QuestionOption(id: "a", textEN: "A = -A", textID: "A = -A"),
                    QuestionOption(id: "b", textEN: "A = Aᵀ", textID: "A = Aᵀ"),
                    QuestionOption(id: "c", textEN: "A = A⁻¹", textID: "A = A⁻¹"),
                    QuestionOption(id: "d", textEN: "det(A) = 0", textID: "det(A) = 0")
                ],
                correctOptionId: "b",
                explanationEN: "A symmetric matrix equals its transpose: A = Aᵀ, meaning aᵢⱼ = aⱼᵢ for all i,j.",
                explanationID: "Matriks simetris sama dengan transpose-nya: A = Aᵀ, artinya aᵢⱼ = aⱼᵢ untuk semua i,j.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la012",
                questionEN: "What is a singular matrix?",
                questionID: "Apa itu matriks singular?",
                options: [
                    QuestionOption(id: "a", textEN: "A matrix with determinant = 0", textID: "Matriks dengan determinan = 0"),
                    QuestionOption(id: "b", textEN: "A matrix with only one row", textID: "Matriks dengan hanya satu baris"),
                    QuestionOption(id: "c", textEN: "A diagonal matrix", textID: "Matriks diagonal"),
                    QuestionOption(id: "d", textEN: "A matrix with all positive values", textID: "Matriks dengan semua nilai positif")
                ],
                correctOptionId: "a",
                explanationEN: "A singular matrix has determinant = 0 and is not invertible.",
                explanationID: "Matriks singular memiliki determinan = 0 dan tidak dapat diinverskan.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la013",
                questionEN: "In SVD (Singular Value Decomposition), A = UΣVᵀ. What are U and V?",
                questionID: "Dalam SVD, A = UΣVᵀ. Apa itu U dan V?",
                options: [
                    QuestionOption(id: "a", textEN: "Diagonal matrices", textID: "Matriks diagonal"),
                    QuestionOption(id: "b", textEN: "Orthogonal matrices", textID: "Matriks orthogonal"),
                    QuestionOption(id: "c", textEN: "Symmetric matrices", textID: "Matriks simetris"),
                    QuestionOption(id: "d", textEN: "Triangular matrices", textID: "Matriks segitiga")
                ],
                correctOptionId: "b",
                explanationEN: "U and V are orthogonal matrices (UᵀU = I, VᵀV = I). Σ is diagonal with singular values.",
                explanationID: "U dan V adalah matriks orthogonal (UᵀU = I, VᵀV = I). Σ adalah diagonal dengan singular value.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "la014",
                questionEN: "What is the null space of a matrix?",
                questionID: "Apa itu null space dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Set of all vectors v where Av = 0", textID: "Himpunan semua vektor v dimana Av = 0"),
                    QuestionOption(id: "b", textEN: "Set of all zero matrices", textID: "Himpunan semua matriks nol"),
                    QuestionOption(id: "c", textEN: "The inverse of the matrix", textID: "Invers dari matriks"),
                    QuestionOption(id: "d", textEN: "The determinant space", textID: "Ruang determinan")
                ],
                correctOptionId: "a",
                explanationEN: "The null space (kernel) is the set of all vectors x such that Ax = 0.",
                explanationID: "Null space (kernel) adalah himpunan semua vektor x sehingga Ax = 0.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la015",
                questionEN: "If matrix A is 4×3 and B is 3×2, what is the dimension of AB?",
                questionID: "Jika matriks A adalah 4×3 dan B adalah 3×2, berapa dimensi AB?",
                options: [
                    QuestionOption(id: "a", textEN: "4×2", textID: "4×2"),
                    QuestionOption(id: "b", textEN: "3×3", textID: "3×3"),
                    QuestionOption(id: "c", textEN: "4×3", textID: "4×3"),
                    QuestionOption(id: "d", textEN: "3×2", textID: "3×2")
                ],
                correctOptionId: "a",
                explanationEN: "(4×3) × (3×2) = 4×2. The inner dimensions (3) must match, result has outer dimensions.",
                explanationID: "(4×3) × (3×2) = 4×2. Dimensi dalam (3) harus cocok, hasil memiliki dimensi luar.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la016",
                questionEN: "What is the span of vectors {[1,0], [0,1]}?",
                questionID: "Apa span dari vektor {[1,0], [0,1]}?",
                options: [
                    QuestionOption(id: "a", textEN: "A line", textID: "Sebuah garis"),
                    QuestionOption(id: "b", textEN: "The entire R² plane", textID: "Seluruh bidang R²"),
                    QuestionOption(id: "c", textEN: "A point", textID: "Sebuah titik"),
                    QuestionOption(id: "d", textEN: "R³ space", textID: "Ruang R³")
                ],
                correctOptionId: "b",
                explanationEN: "These are standard basis vectors. Any vector in R² can be written as linear combination of them.",
                explanationID: "Ini adalah vektor basis standar. Setiap vektor di R² dapat ditulis sebagai kombinasi linear dari mereka.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la017",
                questionEN: "What is the cross product of [1,0,0] and [0,1,0]?",
                questionID: "Berapa cross product dari [1,0,0] dan [0,1,0]?",
                options: [
                    QuestionOption(id: "a", textEN: "[0,0,1]", textID: "[0,0,1]"),
                    QuestionOption(id: "b", textEN: "[0,0,-1]", textID: "[0,0,-1]"),
                    QuestionOption(id: "c", textEN: "[1,1,0]", textID: "[1,1,0]"),
                    QuestionOption(id: "d", textEN: "0", textID: "0")
                ],
                correctOptionId: "a",
                explanationEN: "i × j = k. Cross product of [1,0,0] and [0,1,0] gives [0,0,1].",
                explanationID: "i × j = k. Cross product dari [1,0,0] dan [0,1,0] menghasilkan [0,0,1].",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la018",
                questionEN: "A positive definite matrix has:",
                questionID: "Matriks positive definite memiliki:",
                options: [
                    QuestionOption(id: "a", textEN: "All eigenvalues > 0", textID: "Semua eigenvalue > 0"),
                    QuestionOption(id: "b", textEN: "All eigenvalues < 0", textID: "Semua eigenvalue < 0"),
                    QuestionOption(id: "c", textEN: "Determinant = 0", textID: "Determinan = 0"),
                    QuestionOption(id: "d", textEN: "All elements > 0", textID: "Semua elemen > 0")
                ],
                correctOptionId: "a",
                explanationEN: "A positive definite matrix has all eigenvalues > 0, and xᵀAx > 0 for all non-zero x.",
                explanationID: "Matriks positive definite memiliki semua eigenvalue > 0, dan xᵀAx > 0 untuk semua x tidak nol.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "la019",
                questionEN: "What is the inverse of [[1,2],[3,4]]?",
                questionID: "Berapa invers dari [[1,2],[3,4]]?",
                options: [
                    QuestionOption(id: "a", textEN: "[[-2,1],[1.5,-0.5]]", textID: "[[-2,1],[1.5,-0.5]]"),
                    QuestionOption(id: "b", textEN: "[[4,2],[3,1]]", textID: "[[4,2],[3,1]]"),
                    QuestionOption(id: "c", textEN: "[[1,3],[2,4]]", textID: "[[1,3],[2,4]]"),
                    QuestionOption(id: "d", textEN: "Does not exist", textID: "Tidak ada")
                ],
                correctOptionId: "a",
                explanationEN: "det = 4-6 = -2. A⁻¹ = (1/det)[[d,-b],[-c,a]] = (-1/2)[[4,-2],[-3,1]] = [[-2,1],[1.5,-0.5]]",
                explanationID: "det = 4-6 = -2. A⁻¹ = (1/det)[[d,-b],[-c,a]] = (-1/2)[[4,-2],[-3,1]] = [[-2,1],[1.5,-0.5]]",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la020",
                questionEN: "What does it mean for vectors to be linearly dependent?",
                questionID: "Apa artinya vektor-vektor linear dependent?",
                options: [
                    QuestionOption(id: "a", textEN: "One vector can be written as combination of others", textID: "Satu vektor dapat ditulis sebagai kombinasi vektor lain"),
                    QuestionOption(id: "b", textEN: "All vectors are perpendicular", textID: "Semua vektor tegak lurus"),
                    QuestionOption(id: "c", textEN: "All vectors have the same length", textID: "Semua vektor memiliki panjang sama"),
                    QuestionOption(id: "d", textEN: "Vectors are in different dimensions", textID: "Vektor berada di dimensi berbeda")
                ],
                correctOptionId: "a",
                explanationEN: "Linearly dependent means at least one vector can be expressed as a linear combination of others.",
                explanationID: "Linear dependent berarti setidaknya satu vektor dapat dinyatakan sebagai kombinasi linear dari vektor lain.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            // Batch 3: Questions 21-30
            Question(
                id: "la021",
                questionEN: "What is the outer product of vectors u and v?",
                questionID: "Apa outer product dari vektor u dan v?",
                options: [
                    QuestionOption(id: "a", textEN: "A scalar value", textID: "Nilai skalar"),
                    QuestionOption(id: "b", textEN: "A matrix uvᵀ", textID: "Matriks uvᵀ"),
                    QuestionOption(id: "c", textEN: "A vector perpendicular to both", textID: "Vektor tegak lurus terhadap keduanya"),
                    QuestionOption(id: "d", textEN: "The sum of u and v", textID: "Jumlah u dan v")
                ],
                correctOptionId: "b",
                explanationEN: "Outer product uvᵀ creates a matrix where each element (i,j) = uᵢvⱼ.",
                explanationID: "Outer product uvᵀ membuat matriks dimana setiap elemen (i,j) = uᵢvⱼ.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la022",
                questionEN: "The identity matrix I multiplied by any matrix A gives:",
                questionID: "Matriks identitas I dikalikan dengan matriks A menghasilkan:",
                options: [
                    QuestionOption(id: "a", textEN: "Zero matrix", textID: "Matriks nol"),
                    QuestionOption(id: "b", textEN: "A itself", textID: "A itu sendiri"),
                    QuestionOption(id: "c", textEN: "Aᵀ", textID: "Aᵀ"),
                    QuestionOption(id: "d", textEN: "A⁻¹", textID: "A⁻¹")
                ],
                correctOptionId: "b",
                explanationEN: "The identity matrix is the multiplicative identity: IA = AI = A.",
                explanationID: "Matriks identitas adalah identitas perkalian: IA = AI = A.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "la023",
                questionEN: "What is the Frobenius norm of a matrix?",
                questionID: "Apa itu Frobenius norm dari matriks?",
                options: [
                    QuestionOption(id: "a", textEN: "Square root of sum of squared elements", textID: "Akar kuadrat dari jumlah elemen kuadrat"),
                    QuestionOption(id: "b", textEN: "Maximum eigenvalue", textID: "Eigenvalue maksimum"),
                    QuestionOption(id: "c", textEN: "Sum of diagonal elements", textID: "Jumlah elemen diagonal"),
                    QuestionOption(id: "d", textEN: "Product of eigenvalues", textID: "Produk eigenvalue")
                ],
                correctOptionId: "a",
                explanationEN: "Frobenius norm = √(Σᵢⱼ aᵢⱼ²), similar to L2 norm but for matrices.",
                explanationID: "Frobenius norm = √(Σᵢⱼ aᵢⱼ²), mirip dengan L2 norm tapi untuk matriks.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la024",
                questionEN: "For a diagonal matrix D, what is D²?",
                questionID: "Untuk matriks diagonal D, apa itu D²?",
                options: [
                    QuestionOption(id: "a", textEN: "Diagonal with squared diagonal entries", textID: "Diagonal dengan entri diagonal dikuadratkan"),
                    QuestionOption(id: "b", textEN: "2D", textID: "2D"),
                    QuestionOption(id: "c", textEN: "D + D", textID: "D + D"),
                    QuestionOption(id: "d", textEN: "Identity matrix", textID: "Matriks identitas")
                ],
                correctOptionId: "a",
                explanationEN: "Diagonal matrices multiply by squaring each diagonal entry: diag(d₁², d₂², ...).",
                explanationID: "Matriks diagonal dikalikan dengan mengkuadratkan setiap entri diagonal: diag(d₁², d₂², ...).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la025",
                questionEN: "What is a Hadamard product (element-wise multiplication)?",
                questionID: "Apa itu Hadamard product (perkalian elemen-wise)?",
                options: [
                    QuestionOption(id: "a", textEN: "Standard matrix multiplication", textID: "Perkalian matriks standar"),
                    QuestionOption(id: "b", textEN: "Multiplying corresponding elements: (A⊙B)ᵢⱼ = AᵢⱼBᵢⱼ", textID: "Mengalikan elemen yang bersesuaian: (A⊙B)ᵢⱼ = AᵢⱼBᵢⱼ"),
                    QuestionOption(id: "c", textEN: "Cross product of matrices", textID: "Cross product matriks"),
                    QuestionOption(id: "d", textEN: "Dot product of matrices", textID: "Dot product matriks")
                ],
                correctOptionId: "b",
                explanationEN: "Hadamard product multiplies element by element: (A⊙B)ᵢⱼ = AᵢⱼBᵢⱼ. Requires same dimensions.",
                explanationID: "Hadamard product mengalikan elemen per elemen: (A⊙B)ᵢⱼ = AᵢⱼBᵢⱼ. Membutuhkan dimensi yang sama.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la026",
                questionEN: "An orthonormal matrix Q satisfies:",
                questionID: "Matriks orthonormal Q memenuhi:",
                options: [
                    QuestionOption(id: "a", textEN: "QᵀQ = QQᵀ = I", textID: "QᵀQ = QQᵀ = I"),
                    QuestionOption(id: "b", textEN: "Q = Qᵀ", textID: "Q = Qᵀ"),
                    QuestionOption(id: "c", textEN: "det(Q) = 0", textID: "det(Q) = 0"),
                    QuestionOption(id: "d", textEN: "Q² = Q", textID: "Q² = Q")
                ],
                correctOptionId: "a",
                explanationEN: "Orthonormal matrices have orthonormal columns, so QᵀQ = I. For square matrices, Qᵀ = Q⁻¹.",
                explanationID: "Matriks orthonormal memiliki kolom orthonormal, jadi QᵀQ = I. Untuk matriks persegi, Qᵀ = Q⁻¹.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la027",
                questionEN: "What is the column space of a matrix A?",
                questionID: "Apa itu column space dari matriks A?",
                options: [
                    QuestionOption(id: "a", textEN: "Set of all linear combinations of A's columns", textID: "Himpunan semua kombinasi linear dari kolom A"),
                    QuestionOption(id: "b", textEN: "The number of columns", textID: "Jumlah kolom"),
                    QuestionOption(id: "c", textEN: "The transpose of A", textID: "Transpose dari A"),
                    QuestionOption(id: "d", textEN: "All vectors x where Ax = 0", textID: "Semua vektor x dimana Ax = 0")
                ],
                correctOptionId: "a",
                explanationEN: "Column space (range) is all possible outputs Ax, spanned by column vectors of A.",
                explanationID: "Column space (range) adalah semua output Ax yang mungkin, di-span oleh vektor kolom A.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la028",
                questionEN: "If det(A) = 5 and det(B) = 3, what is det(AB)?",
                questionID: "Jika det(A) = 5 dan det(B) = 3, berapa det(AB)?",
                options: [
                    QuestionOption(id: "a", textEN: "8", textID: "8"),
                    QuestionOption(id: "b", textEN: "15", textID: "15"),
                    QuestionOption(id: "c", textEN: "2", textID: "2"),
                    QuestionOption(id: "d", textEN: "-15", textID: "-15")
                ],
                correctOptionId: "b",
                explanationEN: "det(AB) = det(A) × det(B) = 5 × 3 = 15.",
                explanationID: "det(AB) = det(A) × det(B) = 5 × 3 = 15.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la029",
                questionEN: "What happens to the determinant when you swap two rows?",
                questionID: "Apa yang terjadi pada determinan ketika menukar dua baris?",
                options: [
                    QuestionOption(id: "a", textEN: "It doubles", textID: "Menjadi dua kali lipat"),
                    QuestionOption(id: "b", textEN: "It changes sign", textID: "Berubah tanda"),
                    QuestionOption(id: "c", textEN: "It stays the same", textID: "Tetap sama"),
                    QuestionOption(id: "d", textEN: "It becomes zero", textID: "Menjadi nol")
                ],
                correctOptionId: "b",
                explanationEN: "Swapping two rows multiplies the determinant by -1 (changes sign).",
                explanationID: "Menukar dua baris mengalikan determinan dengan -1 (berubah tanda).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "la030",
                questionEN: "What is the geometric interpretation of the determinant of a 2×2 matrix?",
                questionID: "Apa interpretasi geometris dari determinan matriks 2×2?",
                options: [
                    QuestionOption(id: "a", textEN: "The area of parallelogram formed by column vectors", textID: "Luas jajar genjang yang dibentuk oleh vektor kolom"),
                    QuestionOption(id: "b", textEN: "The length of diagonal", textID: "Panjang diagonal"),
                    QuestionOption(id: "c", textEN: "The angle between vectors", textID: "Sudut antara vektor"),
                    QuestionOption(id: "d", textEN: "The sum of vector lengths", textID: "Jumlah panjang vektor")
                ],
                correctOptionId: "a",
                explanationEN: "The absolute value of det gives the area scaling factor - area of parallelogram formed by columns.",
                explanationID: "Nilai absolut det memberikan faktor skala luas - luas jajar genjang yang dibentuk oleh kolom.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
        ]
    }
}
