import Foundation

// MARK: - Calculus Questions (50 questions)
extension NOAIQuestionBank {
    var calculusQuestions: [Question] {
        [
            // Batch 1: Questions 1-10
            Question(
                id: "calc001",
                questionEN: "What is the derivative of f(x) = x³?",
                questionID: "Berapa turunan dari f(x) = x³?",
                options: [
                    QuestionOption(id: "a", textEN: "3x²", textID: "3x²"),
                    QuestionOption(id: "b", textEN: "x²", textID: "x²"),
                    QuestionOption(id: "c", textEN: "3x³", textID: "3x³"),
                    QuestionOption(id: "d", textEN: "x⁴/4", textID: "x⁴/4")
                ],
                correctOptionId: "a",
                explanationEN: "Power rule: d/dx(xⁿ) = nxⁿ⁻¹. So d/dx(x³) = 3x².",
                explanationID: "Aturan pangkat: d/dx(xⁿ) = nxⁿ⁻¹. Jadi d/dx(x³) = 3x².",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc002",
                questionEN: "What is ∫x² dx?",
                questionID: "Berapa ∫x² dx?",
                options: [
                    QuestionOption(id: "a", textEN: "2x", textID: "2x"),
                    QuestionOption(id: "b", textEN: "x³/3 + C", textID: "x³/3 + C"),
                    QuestionOption(id: "c", textEN: "x³", textID: "x³"),
                    QuestionOption(id: "d", textEN: "3x²", textID: "3x²")
                ],
                correctOptionId: "b",
                explanationEN: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C. So ∫x² dx = x³/3 + C.",
                explanationID: "∫xⁿ dx = xⁿ⁺¹/(n+1) + C. Jadi ∫x² dx = x³/3 + C.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc003",
                questionEN: "What is the chain rule for d/dx[f(g(x))]?",
                questionID: "Apa aturan rantai untuk d/dx[f(g(x))]?",
                options: [
                    QuestionOption(id: "a", textEN: "f'(x) + g'(x)", textID: "f'(x) + g'(x)"),
                    QuestionOption(id: "b", textEN: "f'(g(x)) × g'(x)", textID: "f'(g(x)) × g'(x)"),
                    QuestionOption(id: "c", textEN: "f(x) × g(x)", textID: "f(x) × g(x)"),
                    QuestionOption(id: "d", textEN: "f'(x) × g'(x)", textID: "f'(x) × g'(x)")
                ],
                correctOptionId: "b",
                explanationEN: "Chain rule: d/dx[f(g(x))] = f'(g(x)) × g'(x). Derivative of outer times derivative of inner.",
                explanationID: "Aturan rantai: d/dx[f(g(x))] = f'(g(x)) × g'(x). Turunan luar kali turunan dalam.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc004",
                questionEN: "What is the derivative of e^x?",
                questionID: "Berapa turunan dari e^x?",
                options: [
                    QuestionOption(id: "a", textEN: "xe^(x-1)", textID: "xe^(x-1)"),
                    QuestionOption(id: "b", textEN: "e^x", textID: "e^x"),
                    QuestionOption(id: "c", textEN: "e^(x-1)", textID: "e^(x-1)"),
                    QuestionOption(id: "d", textEN: "x × e^x", textID: "x × e^x")
                ],
                correctOptionId: "b",
                explanationEN: "e^x is its own derivative: d/dx(e^x) = e^x. This is a unique property of e.",
                explanationID: "e^x adalah turunan dari dirinya sendiri: d/dx(e^x) = e^x. Ini properti unik dari e.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc005",
                questionEN: "What is the derivative of ln(x)?",
                questionID: "Berapa turunan dari ln(x)?",
                options: [
                    QuestionOption(id: "a", textEN: "1/x", textID: "1/x"),
                    QuestionOption(id: "b", textEN: "x", textID: "x"),
                    QuestionOption(id: "c", textEN: "e^x", textID: "e^x"),
                    QuestionOption(id: "d", textEN: "ln(x)/x", textID: "ln(x)/x")
                ],
                correctOptionId: "a",
                explanationEN: "d/dx(ln(x)) = 1/x for x > 0.",
                explanationID: "d/dx(ln(x)) = 1/x untuk x > 0.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc006",
                questionEN: "What is a partial derivative?",
                questionID: "Apa itu turunan parsial?",
                options: [
                    QuestionOption(id: "a", textEN: "Derivative with respect to one variable while holding others constant", textID: "Turunan terhadap satu variabel sambil menahan variabel lain konstan"),
                    QuestionOption(id: "b", textEN: "Half of the total derivative", textID: "Setengah dari turunan total"),
                    QuestionOption(id: "c", textEN: "Derivative of a partial function", textID: "Turunan dari fungsi parsial"),
                    QuestionOption(id: "d", textEN: "The incomplete derivative", textID: "Turunan yang tidak lengkap")
                ],
                correctOptionId: "a",
                explanationEN: "Partial derivative ∂f/∂x treats all other variables as constants. Essential for multivariable calculus.",
                explanationID: "Turunan parsial ∂f/∂x memperlakukan semua variabel lain sebagai konstanta. Penting untuk kalkulus multivariabel.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc007",
                questionEN: "What is the gradient of a function f(x,y)?",
                questionID: "Apa gradien dari fungsi f(x,y)?",
                options: [
                    QuestionOption(id: "a", textEN: "∂f/∂x + ∂f/∂y", textID: "∂f/∂x + ∂f/∂y"),
                    QuestionOption(id: "b", textEN: "[∂f/∂x, ∂f/∂y]", textID: "[∂f/∂x, ∂f/∂y]"),
                    QuestionOption(id: "c", textEN: "∂²f/∂x∂y", textID: "∂²f/∂x∂y"),
                    QuestionOption(id: "d", textEN: "f(x) × f(y)", textID: "f(x) × f(y)")
                ],
                correctOptionId: "b",
                explanationEN: "The gradient ∇f is a vector of all partial derivatives: [∂f/∂x, ∂f/∂y]. Points in direction of steepest ascent.",
                explanationID: "Gradien ∇f adalah vektor dari semua turunan parsial: [∂f/∂x, ∂f/∂y]. Menunjuk ke arah kenaikan tercuram.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc008",
                questionEN: "What does the gradient point towards?",
                questionID: "Ke arah mana gradien menunjuk?",
                options: [
                    QuestionOption(id: "a", textEN: "Direction of steepest descent", textID: "Arah penurunan tercuram"),
                    QuestionOption(id: "b", textEN: "Direction of steepest ascent", textID: "Arah kenaikan tercuram"),
                    QuestionOption(id: "c", textEN: "Perpendicular to the surface", textID: "Tegak lurus terhadap permukaan"),
                    QuestionOption(id: "d", textEN: "Parallel to the x-axis", textID: "Sejajar sumbu x")
                ],
                correctOptionId: "b",
                explanationEN: "The gradient points in the direction of steepest ascent. Negative gradient points to steepest descent (used in gradient descent).",
                explanationID: "Gradien menunjuk ke arah kenaikan tercuram. Gradien negatif menunjuk ke penurunan tercuram (digunakan dalam gradient descent).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc009",
                questionEN: "What is the Jacobian matrix?",
                questionID: "Apa itu matriks Jacobian?",
                options: [
                    QuestionOption(id: "a", textEN: "Matrix of all second derivatives", textID: "Matriks semua turunan kedua"),
                    QuestionOption(id: "b", textEN: "Matrix of all first-order partial derivatives of a vector function", textID: "Matriks semua turunan parsial orde pertama dari fungsi vektor"),
                    QuestionOption(id: "c", textEN: "The inverse of the gradient", textID: "Invers dari gradien"),
                    QuestionOption(id: "d", textEN: "A diagonal matrix", textID: "Matriks diagonal")
                ],
                correctOptionId: "b",
                explanationEN: "Jacobian J contains all first partial derivatives: Jᵢⱼ = ∂fᵢ/∂xⱼ. Used for transformations and neural network backprop.",
                explanationID: "Jacobian J berisi semua turunan parsial pertama: Jᵢⱼ = ∂fᵢ/∂xⱼ. Digunakan untuk transformasi dan backprop neural network.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "calc010",
                questionEN: "What is the Hessian matrix?",
                questionID: "Apa itu matriks Hessian?",
                options: [
                    QuestionOption(id: "a", textEN: "Matrix of all second-order partial derivatives", textID: "Matriks semua turunan parsial orde kedua"),
                    QuestionOption(id: "b", textEN: "The gradient squared", textID: "Gradien kuadrat"),
                    QuestionOption(id: "c", textEN: "Matrix of first derivatives", textID: "Matriks turunan pertama"),
                    QuestionOption(id: "d", textEN: "The inverse of Jacobian", textID: "Invers dari Jacobian")
                ],
                correctOptionId: "a",
                explanationEN: "Hessian H contains second partial derivatives: Hᵢⱼ = ∂²f/∂xᵢ∂xⱼ. Describes curvature, used in optimization.",
                explanationID: "Hessian H berisi turunan parsial kedua: Hᵢⱼ = ∂²f/∂xᵢ∂xⱼ. Mendeskripsikan kelengkungan, digunakan dalam optimisasi.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            // Batch 2: Questions 11-20
            Question(
                id: "calc011",
                questionEN: "What is the product rule for derivatives?",
                questionID: "Apa aturan perkalian untuk turunan?",
                options: [
                    QuestionOption(id: "a", textEN: "d/dx[f×g] = f'×g + f×g'", textID: "d/dx[f×g] = f'×g + f×g'"),
                    QuestionOption(id: "b", textEN: "d/dx[f×g] = f'×g'", textID: "d/dx[f×g] = f'×g'"),
                    QuestionOption(id: "c", textEN: "d/dx[f×g] = f×g'", textID: "d/dx[f×g] = f×g'"),
                    QuestionOption(id: "d", textEN: "d/dx[f×g] = f'+g'", textID: "d/dx[f×g] = f'+g'")
                ],
                correctOptionId: "a",
                explanationEN: "Product rule: (fg)' = f'g + fg'. The derivative of a product is not simply the product of derivatives.",
                explanationID: "Aturan perkalian: (fg)' = f'g + fg'. Turunan perkalian bukan hanya perkalian turunan.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc012",
                questionEN: "What is the quotient rule?",
                questionID: "Apa aturan pembagian?",
                options: [
                    QuestionOption(id: "a", textEN: "d/dx[f/g] = (f'g - fg')/g²", textID: "d/dx[f/g] = (f'g - fg')/g²"),
                    QuestionOption(id: "b", textEN: "d/dx[f/g] = f'/g'", textID: "d/dx[f/g] = f'/g'"),
                    QuestionOption(id: "c", textEN: "d/dx[f/g] = (f'g + fg')/g²", textID: "d/dx[f/g] = (f'g + fg')/g²"),
                    QuestionOption(id: "d", textEN: "d/dx[f/g] = f' - g'", textID: "d/dx[f/g] = f' - g'")
                ],
                correctOptionId: "a",
                explanationEN: "Quotient rule: (f/g)' = (f'g - fg')/g². Remember: 'low d-high minus high d-low over low squared'.",
                explanationID: "Aturan pembagian: (f/g)' = (f'g - fg')/g². Ingat: 'rendah d-tinggi minus tinggi d-rendah atas rendah kuadrat'.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc013",
                questionEN: "What is the derivative of sin(x)?",
                questionID: "Berapa turunan dari sin(x)?",
                options: [
                    QuestionOption(id: "a", textEN: "cos(x)", textID: "cos(x)"),
                    QuestionOption(id: "b", textEN: "-cos(x)", textID: "-cos(x)"),
                    QuestionOption(id: "c", textEN: "-sin(x)", textID: "-sin(x)"),
                    QuestionOption(id: "d", textEN: "tan(x)", textID: "tan(x)")
                ],
                correctOptionId: "a",
                explanationEN: "d/dx(sin(x)) = cos(x). And d/dx(cos(x)) = -sin(x).",
                explanationID: "d/dx(sin(x)) = cos(x). Dan d/dx(cos(x)) = -sin(x).",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc014",
                questionEN: "What is a critical point of a function?",
                questionID: "Apa itu titik kritis dari suatu fungsi?",
                options: [
                    QuestionOption(id: "a", textEN: "Where f(x) = 0", textID: "Dimana f(x) = 0"),
                    QuestionOption(id: "b", textEN: "Where f'(x) = 0 or undefined", textID: "Dimana f'(x) = 0 atau tidak terdefinisi"),
                    QuestionOption(id: "c", textEN: "Where f(x) is maximum", textID: "Dimana f(x) maksimum"),
                    QuestionOption(id: "d", textEN: "The endpoints of domain", textID: "Titik ujung domain")
                ],
                correctOptionId: "b",
                explanationEN: "Critical points occur where the derivative is zero or undefined. These are candidates for local max/min.",
                explanationID: "Titik kritis terjadi dimana turunan nol atau tidak terdefinisi. Ini adalah kandidat untuk max/min lokal.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc015",
                questionEN: "If f''(x) > 0 at a critical point, what type of point is it?",
                questionID: "Jika f''(x) > 0 pada titik kritis, jenis titik apa itu?",
                options: [
                    QuestionOption(id: "a", textEN: "Local maximum", textID: "Maksimum lokal"),
                    QuestionOption(id: "b", textEN: "Local minimum", textID: "Minimum lokal"),
                    QuestionOption(id: "c", textEN: "Inflection point", textID: "Titik belok"),
                    QuestionOption(id: "d", textEN: "Saddle point", textID: "Titik pelana")
                ],
                correctOptionId: "b",
                explanationEN: "Second derivative test: f'' > 0 means concave up, so it's a local minimum. f'' < 0 means local maximum.",
                explanationID: "Tes turunan kedua: f'' > 0 berarti cekung ke atas, jadi minimum lokal. f'' < 0 berarti maksimum lokal.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc016",
                questionEN: "What is the Taylor series expansion of e^x around x=0?",
                questionID: "Apa ekspansi deret Taylor dari e^x di sekitar x=0?",
                options: [
                    QuestionOption(id: "a", textEN: "1 + x + x²/2! + x³/3! + ...", textID: "1 + x + x²/2! + x³/3! + ..."),
                    QuestionOption(id: "b", textEN: "x + x² + x³ + ...", textID: "x + x² + x³ + ..."),
                    QuestionOption(id: "c", textEN: "1 - x + x² - x³ + ...", textID: "1 - x + x² - x³ + ..."),
                    QuestionOption(id: "d", textEN: "x - x³/3! + x⁵/5! - ...", textID: "x - x³/3! + x⁵/5! - ...")
                ],
                correctOptionId: "a",
                explanationEN: "e^x = Σ(xⁿ/n!) = 1 + x + x²/2! + x³/3! + ... This converges for all x.",
                explanationID: "e^x = Σ(xⁿ/n!) = 1 + x + x²/2! + x³/3! + ... Ini konvergen untuk semua x.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc017",
                questionEN: "What is the fundamental theorem of calculus?",
                questionID: "Apa teorema dasar kalkulus?",
                options: [
                    QuestionOption(id: "a", textEN: "Differentiation and integration are inverse operations", textID: "Diferensiasi dan integrasi adalah operasi invers"),
                    QuestionOption(id: "b", textEN: "All functions are continuous", textID: "Semua fungsi kontinu"),
                    QuestionOption(id: "c", textEN: "Limits always exist", textID: "Limit selalu ada"),
                    QuestionOption(id: "d", textEN: "Derivatives are always positive", textID: "Turunan selalu positif")
                ],
                correctOptionId: "a",
                explanationEN: "FTC connects differentiation and integration: d/dx[∫f(t)dt] = f(x) and ∫f'(x)dx = f(x) + C.",
                explanationID: "FTC menghubungkan diferensiasi dan integrasi: d/dx[∫f(t)dt] = f(x) dan ∫f'(x)dx = f(x) + C.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "calc018",
                questionEN: "What is ∫e^x dx?",
                questionID: "Berapa ∫e^x dx?",
                options: [
                    QuestionOption(id: "a", textEN: "e^x + C", textID: "e^x + C"),
                    QuestionOption(id: "b", textEN: "xe^x + C", textID: "xe^x + C"),
                    QuestionOption(id: "c", textEN: "e^(x+1) + C", textID: "e^(x+1) + C"),
                    QuestionOption(id: "d", textEN: "ln(e^x) + C", textID: "ln(e^x) + C")
                ],
                correctOptionId: "a",
                explanationEN: "Since d/dx(e^x) = e^x, the integral is also ∫e^x dx = e^x + C.",
                explanationID: "Karena d/dx(e^x) = e^x, integralnya juga ∫e^x dx = e^x + C.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "calc019",
                questionEN: "What is the Laplacian operator ∇²?",
                questionID: "Apa operator Laplacian ∇²?",
                options: [
                    QuestionOption(id: "a", textEN: "Sum of second partial derivatives", textID: "Jumlah turunan parsial kedua"),
                    QuestionOption(id: "b", textEN: "Product of gradients", textID: "Perkalian gradien"),
                    QuestionOption(id: "c", textEN: "First derivative squared", textID: "Turunan pertama kuadrat"),
                    QuestionOption(id: "d", textEN: "Inverse of gradient", textID: "Invers gradien")
                ],
                correctOptionId: "a",
                explanationEN: "Laplacian ∇²f = ∂²f/∂x² + ∂²f/∂y² + ... Sum of unmixed second partials.",
                explanationID: "Laplacian ∇²f = ∂²f/∂x² + ∂²f/∂y² + ... Jumlah turunan parsial kedua tidak campuran.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "calc020",
                questionEN: "What is L'Hôpital's rule used for?",
                questionID: "Untuk apa aturan L'Hôpital digunakan?",
                options: [
                    QuestionOption(id: "a", textEN: "Finding integrals", textID: "Menemukan integral"),
                    QuestionOption(id: "b", textEN: "Evaluating limits of indeterminate forms like 0/0", textID: "Mengevaluasi limit bentuk tak tentu seperti 0/0"),
                    QuestionOption(id: "c", textEN: "Solving differential equations", textID: "Menyelesaikan persamaan diferensial"),
                    QuestionOption(id: "d", textEN: "Finding critical points", textID: "Menemukan titik kritis")
                ],
                correctOptionId: "b",
                explanationEN: "L'Hôpital's rule: if lim f/g = 0/0 or ∞/∞, then lim f/g = lim f'/g' (if the latter exists).",
                explanationID: "Aturan L'Hôpital: jika lim f/g = 0/0 atau ∞/∞, maka lim f/g = lim f'/g' (jika yang terakhir ada).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
        ]
    }
}
