import Foundation

// MARK: - Probability & Statistics for ML Questions (50)
// Topics: Probability, Distributions, Bayes, MLE/MAP, Information Theory
// Aligned with IOAI/NOAI Syllabus

let probabilityStatsQuestions: [Question] = [
    // MARK: - Basic Probability (Questions 1-10)
    Question(
        id: "prob_stats_001",
        questionEN: "If P(A) = 0.3 and P(B) = 0.4, and A and B are independent, what is P(A ∩ B)?",
        questionID: "Jika P(A) = 0.3 dan P(B) = 0.4, dan A serta B independen, berapa P(A ∩ B)?",
        options: [
            QuestionOption(id: "a", textEN: "0.12", textID: "0.12"),
            QuestionOption(id: "b", textEN: "0.7", textID: "0.7"),
            QuestionOption(id: "c", textEN: "0.1", textID: "0.1"),
            QuestionOption(id: "d", textEN: "0.35", textID: "0.35")
        ],
        correctOptionId: "a",
        explanationEN: "For independent events: P(A ∩ B) = P(A) × P(B) = 0.3 × 0.4 = 0.12. Independence means one event doesn't affect the other.",
        explanationID: "Untuk kejadian independen: P(A ∩ B) = P(A) × P(B) = 0.3 × 0.4 = 0.12. Independensi berarti satu kejadian tidak mempengaruhi yang lain.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_002",
        questionEN: "What is Bayes' theorem?",
        questionID: "Apa itu teorema Bayes?",
        options: [
            QuestionOption(id: "a", textEN: "P(A|B) = P(B|A)P(A) / P(B)", textID: "P(A|B) = P(B|A)P(A) / P(B)"),
            QuestionOption(id: "b", textEN: "P(A|B) = P(A)P(B)", textID: "P(A|B) = P(A)P(B)"),
            QuestionOption(id: "c", textEN: "P(A|B) = P(A) + P(B)", textID: "P(A|B) = P(A) + P(B)"),
            QuestionOption(id: "d", textEN: "P(A|B) = P(A) / P(B)", textID: "P(A|B) = P(A) / P(B)")
        ],
        correctOptionId: "a",
        explanationEN: "Bayes' theorem: P(A|B) = P(B|A)P(A)/P(B). It relates conditional probabilities and is fundamental to Bayesian inference and many ML algorithms.",
        explanationID: "Teorema Bayes: P(A|B) = P(B|A)P(A)/P(B). Menghubungkan probabilitas kondisional dan fundamental untuk inferensi Bayesian dan banyak algoritma ML.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_003",
        questionEN: "What is the difference between P(A|B) and P(B|A)?",
        questionID: "Apa perbedaan antara P(A|B) dan P(B|A)?",
        options: [
            QuestionOption(id: "a", textEN: "They are generally different - probability of A given B vs B given A", textID: "Umumnya berbeda - probabilitas A diberikan B vs B diberikan A"),
            QuestionOption(id: "b", textEN: "They are always equal", textID: "Selalu sama"),
            QuestionOption(id: "c", textEN: "They always sum to 1", textID: "Selalu berjumlah 1"),
            QuestionOption(id: "d", textEN: "One is the inverse of the other", textID: "Satu adalah kebalikan yang lain")
        ],
        correctOptionId: "a",
        explanationEN: "P(A|B) is the probability of A occurring given that B has occurred, while P(B|A) is the probability of B given A. They are generally different unless A and B are independent and equal.",
        explanationID: "P(A|B) adalah probabilitas A terjadi diberikan B sudah terjadi, sementara P(B|A) adalah probabilitas B diberikan A. Umumnya berbeda kecuali A dan B independen dan sama.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_004",
        questionEN: "What does P(A ∪ B) = P(A) + P(B) - P(A ∩ B) represent?",
        questionID: "Apa yang direpresentasikan P(A ∪ B) = P(A) + P(B) - P(A ∩ B)?",
        options: [
            QuestionOption(id: "a", textEN: "The inclusion-exclusion principle for probability of A or B", textID: "Prinsip inklusi-eksklusi untuk probabilitas A atau B"),
            QuestionOption(id: "b", textEN: "The independence formula", textID: "Rumus independensi"),
            QuestionOption(id: "c", textEN: "Bayes' theorem", textID: "Teorema Bayes"),
            QuestionOption(id: "d", textEN: "The chain rule of probability", textID: "Aturan rantai probabilitas")
        ],
        correctOptionId: "a",
        explanationEN: "The inclusion-exclusion principle: P(A ∪ B) = P(A) + P(B) - P(A ∩ B). We subtract the intersection to avoid double-counting elements in both A and B.",
        explanationID: "Prinsip inklusi-eksklusi: P(A ∪ B) = P(A) + P(B) - P(A ∩ B). Kita kurangi irisan untuk menghindari penghitungan ganda elemen di A dan B.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_005",
        questionEN: "What is a random variable?",
        questionID: "Apa itu variabel acak?",
        options: [
            QuestionOption(id: "a", textEN: "A variable whose value is determined by the outcome of a random experiment", textID: "Variabel yang nilainya ditentukan oleh hasil eksperimen acak"),
            QuestionOption(id: "b", textEN: "A variable that changes randomly during training", textID: "Variabel yang berubah acak selama training"),
            QuestionOption(id: "c", textEN: "Any variable in a computer program", textID: "Variabel apapun dalam program komputer"),
            QuestionOption(id: "d", textEN: "A variable with no fixed value", textID: "Variabel tanpa nilai tetap")
        ],
        correctOptionId: "a",
        explanationEN: "A random variable is a function that assigns numerical values to outcomes of a random experiment. It can be discrete (countable values) or continuous (any value in a range).",
        explanationID: "Variabel acak adalah fungsi yang menetapkan nilai numerik ke hasil eksperimen acak. Bisa diskrit (nilai terhitung) atau kontinu (nilai apapun dalam rentang).",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_006",
        questionEN: "What is the expected value E[X] of a discrete random variable?",
        questionID: "Apa itu nilai ekspektasi E[X] dari variabel acak diskrit?",
        options: [
            QuestionOption(id: "a", textEN: "E[X] = Σxᵢ P(X = xᵢ) - sum of values weighted by their probabilities", textID: "E[X] = Σxᵢ P(X = xᵢ) - jumlah nilai yang diboboti probabilitas"),
            QuestionOption(id: "b", textEN: "E[X] = max(X)", textID: "E[X] = max(X)"),
            QuestionOption(id: "c", textEN: "E[X] = X/n", textID: "E[X] = X/n"),
            QuestionOption(id: "d", textEN: "E[X] = P(X)", textID: "E[X] = P(X)")
        ],
        correctOptionId: "a",
        explanationEN: "Expected value E[X] = Σxᵢ P(X = xᵢ) is the probability-weighted average of all possible values. It represents the 'center' or 'mean' of the distribution.",
        explanationID: "Nilai ekspektasi E[X] = Σxᵢ P(X = xᵢ) adalah rata-rata berbobot probabilitas dari semua nilai yang mungkin. Merepresentasikan 'pusat' atau 'mean' distribusi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_007",
        questionEN: "What is the variance Var(X)?",
        questionID: "Apa itu variansi Var(X)?",
        options: [
            QuestionOption(id: "a", textEN: "E[(X - E[X])²] = E[X²] - (E[X])²", textID: "E[(X - E[X])²] = E[X²] - (E[X])²"),
            QuestionOption(id: "b", textEN: "E[X] - E[X²]", textID: "E[X] - E[X²]"),
            QuestionOption(id: "c", textEN: "E[X]²", textID: "E[X]²"),
            QuestionOption(id: "d", textEN: "E[X] / n", textID: "E[X] / n")
        ],
        correctOptionId: "a",
        explanationEN: "Variance Var(X) = E[(X - μ)²] = E[X²] - (E[X])² measures the spread of a distribution around its mean. Standard deviation is √Var(X).",
        explanationID: "Variansi Var(X) = E[(X - μ)²] = E[X²] - (E[X])² mengukur sebaran distribusi di sekitar mean-nya. Standar deviasi adalah √Var(X).",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_008",
        questionEN: "If X and Y are independent, what is Var(X + Y)?",
        questionID: "Jika X dan Y independen, berapa Var(X + Y)?",
        options: [
            QuestionOption(id: "a", textEN: "Var(X) + Var(Y)", textID: "Var(X) + Var(Y)"),
            QuestionOption(id: "b", textEN: "Var(X) × Var(Y)", textID: "Var(X) × Var(Y)"),
            QuestionOption(id: "c", textEN: "(Var(X) + Var(Y))²", textID: "(Var(X) + Var(Y))²"),
            QuestionOption(id: "d", textEN: "Var(X) - Var(Y)", textID: "Var(X) - Var(Y)")
        ],
        correctOptionId: "a",
        explanationEN: "For independent random variables: Var(X + Y) = Var(X) + Var(Y). Variances add, not multiply! Note: for non-independent variables, we need the covariance term.",
        explanationID: "Untuk variabel acak independen: Var(X + Y) = Var(X) + Var(Y). Variansi dijumlahkan, bukan dikalikan! Catatan: untuk variabel tidak independen, perlu term kovariansi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_009",
        questionEN: "What is covariance Cov(X, Y)?",
        questionID: "Apa itu kovariansi Cov(X, Y)?",
        options: [
            QuestionOption(id: "a", textEN: "E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]E[Y]", textID: "E[(X - E[X])(Y - E[Y])] = E[XY] - E[X]E[Y]"),
            QuestionOption(id: "b", textEN: "E[X]E[Y]", textID: "E[X]E[Y]"),
            QuestionOption(id: "c", textEN: "E[X + Y]", textID: "E[X + Y]"),
            QuestionOption(id: "d", textEN: "E[X]²E[Y]²", textID: "E[X]²E[Y]²")
        ],
        correctOptionId: "a",
        explanationEN: "Covariance measures how two variables vary together: Cov(X,Y) = E[(X-μₓ)(Y-μᵧ)]. Positive = they increase together, negative = one increases as other decreases, zero = no linear relationship.",
        explanationID: "Kovariansi mengukur bagaimana dua variabel bervariasi bersama: Cov(X,Y) = E[(X-μₓ)(Y-μᵧ)]. Positif = naik bersama, negatif = satu naik lainnya turun, nol = tidak ada hubungan linear.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_010",
        questionEN: "What is the correlation coefficient ρ(X,Y)?",
        questionID: "Apa itu koefisien korelasi ρ(X,Y)?",
        options: [
            QuestionOption(id: "a", textEN: "Cov(X,Y) / (σₓσᵧ) - normalized covariance between -1 and 1", textID: "Cov(X,Y) / (σₓσᵧ) - kovariansi ternormalisasi antara -1 dan 1"),
            QuestionOption(id: "b", textEN: "Cov(X,Y) × σₓσᵧ", textID: "Cov(X,Y) × σₓσᵧ"),
            QuestionOption(id: "c", textEN: "Cov(X,Y) + σₓ + σᵧ", textID: "Cov(X,Y) + σₓ + σᵧ"),
            QuestionOption(id: "d", textEN: "Cov(X,Y)²", textID: "Cov(X,Y)²")
        ],
        correctOptionId: "a",
        explanationEN: "Correlation ρ = Cov(X,Y)/(σₓσᵧ) is standardized covariance, ranging from -1 (perfect negative) to +1 (perfect positive). ρ=0 means no linear relationship.",
        explanationID: "Korelasi ρ = Cov(X,Y)/(σₓσᵧ) adalah kovariansi terstandarisasi, berkisar dari -1 (negatif sempurna) sampai +1 (positif sempurna). ρ=0 berarti tidak ada hubungan linear.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    // MARK: - Probability Distributions (Questions 11-20)
    Question(
        id: "prob_stats_011",
        questionEN: "What is the PDF of the standard normal distribution N(0,1)?",
        questionID: "Apa PDF dari distribusi normal standar N(0,1)?",
        options: [
            QuestionOption(id: "a", textEN: "f(x) = (1/√2π) exp(-x²/2)", textID: "f(x) = (1/√2π) exp(-x²/2)"),
            QuestionOption(id: "b", textEN: "f(x) = exp(-x)", textID: "f(x) = exp(-x)"),
            QuestionOption(id: "c", textEN: "f(x) = 1/x", textID: "f(x) = 1/x"),
            QuestionOption(id: "d", textEN: "f(x) = x²", textID: "f(x) = x²")
        ],
        correctOptionId: "a",
        explanationEN: "The standard normal PDF is f(x) = (1/√2π)exp(-x²/2). It's symmetric around 0, with mean 0 and variance 1. The bell curve is ubiquitous in statistics and ML.",
        explanationID: "PDF normal standar adalah f(x) = (1/√2π)exp(-x²/2). Simetris di sekitar 0, dengan mean 0 dan variansi 1. Kurva lonceng ada di mana-mana dalam statistik dan ML.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_012",
        questionEN: "For a Bernoulli distribution with probability p, what is E[X] and Var(X)?",
        questionID: "Untuk distribusi Bernoulli dengan probabilitas p, berapa E[X] dan Var(X)?",
        options: [
            QuestionOption(id: "a", textEN: "E[X] = p, Var(X) = p(1-p)", textID: "E[X] = p, Var(X) = p(1-p)"),
            QuestionOption(id: "b", textEN: "E[X] = p², Var(X) = p", textID: "E[X] = p², Var(X) = p"),
            QuestionOption(id: "c", textEN: "E[X] = 1, Var(X) = p²", textID: "E[X] = 1, Var(X) = p²"),
            QuestionOption(id: "d", textEN: "E[X] = 0.5, Var(X) = 0.25", textID: "E[X] = 0.5, Var(X) = 0.25")
        ],
        correctOptionId: "a",
        explanationEN: "For Bernoulli(p): E[X] = 0×(1-p) + 1×p = p. Var(X) = E[X²] - (E[X])² = p - p² = p(1-p). Maximum variance is at p=0.5.",
        explanationID: "Untuk Bernoulli(p): E[X] = 0×(1-p) + 1×p = p. Var(X) = E[X²] - (E[X])² = p - p² = p(1-p). Variansi maksimum di p=0.5.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_013",
        questionEN: "What distribution describes the number of successes in n independent Bernoulli trials?",
        questionID: "Distribusi apa yang mendeskripsikan jumlah sukses dalam n percobaan Bernoulli independen?",
        options: [
            QuestionOption(id: "a", textEN: "Binomial distribution", textID: "Distribusi Binomial"),
            QuestionOption(id: "b", textEN: "Normal distribution", textID: "Distribusi Normal"),
            QuestionOption(id: "c", textEN: "Poisson distribution", textID: "Distribusi Poisson"),
            QuestionOption(id: "d", textEN: "Exponential distribution", textID: "Distribusi Eksponensial")
        ],
        correctOptionId: "a",
        explanationEN: "The Binomial(n,p) distribution models the number of successes in n independent trials with success probability p. P(X=k) = C(n,k)pᵏ(1-p)ⁿ⁻ᵏ.",
        explanationID: "Distribusi Binomial(n,p) memodelkan jumlah sukses dalam n percobaan independen dengan probabilitas sukses p. P(X=k) = C(n,k)pᵏ(1-p)ⁿ⁻ᵏ.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_014",
        questionEN: "What is the Poisson distribution used for?",
        questionID: "Untuk apa distribusi Poisson digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Modeling count of events in a fixed interval when events occur independently at a constant rate", textID: "Memodelkan jumlah kejadian dalam interval tetap ketika kejadian terjadi independen pada laju konstan"),
            QuestionOption(id: "b", textEN: "Modeling continuous variables", textID: "Memodelkan variabel kontinu"),
            QuestionOption(id: "c", textEN: "Modeling time between events", textID: "Memodelkan waktu antar kejadian"),
            QuestionOption(id: "d", textEN: "Modeling binary outcomes", textID: "Memodelkan hasil biner")
        ],
        correctOptionId: "a",
        explanationEN: "Poisson(λ) models the number of events in an interval: P(X=k) = λᵏe⁻λ/k!. Used for rare events: number of customers, defects, etc. E[X] = Var(X) = λ.",
        explanationID: "Poisson(λ) memodelkan jumlah kejadian dalam interval: P(X=k) = λᵏe⁻λ/k!. Digunakan untuk kejadian langka: jumlah pelanggan, cacat, dll. E[X] = Var(X) = λ.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_015",
        questionEN: "What does the Central Limit Theorem state?",
        questionID: "Apa yang dinyatakan Teorema Limit Pusat?",
        options: [
            QuestionOption(id: "a", textEN: "The sum of many independent random variables approaches a normal distribution", textID: "Jumlah banyak variabel acak independen mendekati distribusi normal"),
            QuestionOption(id: "b", textEN: "All distributions are normal", textID: "Semua distribusi adalah normal"),
            QuestionOption(id: "c", textEN: "The mean is always in the center", textID: "Mean selalu di tengah"),
            QuestionOption(id: "d", textEN: "Large samples are always accurate", textID: "Sampel besar selalu akurat")
        ],
        correctOptionId: "a",
        explanationEN: "CLT: For n large, the sample mean of iid random variables is approximately normal, regardless of the original distribution. This justifies using normal distributions in many statistical methods.",
        explanationID: "CLT: Untuk n besar, rata-rata sampel dari variabel acak iid mendekati normal, terlepas dari distribusi asli. Ini membenarkan penggunaan distribusi normal dalam banyak metode statistik.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_016",
        questionEN: "What is the Law of Large Numbers?",
        questionID: "Apa itu Hukum Bilangan Besar?",
        options: [
            QuestionOption(id: "a", textEN: "Sample average converges to the expected value as sample size increases", textID: "Rata-rata sampel konvergen ke nilai ekspektasi seiring bertambahnya ukuran sampel"),
            QuestionOption(id: "b", textEN: "Large numbers are more likely to occur", textID: "Bilangan besar lebih mungkin terjadi"),
            QuestionOption(id: "c", textEN: "Probability increases with sample size", textID: "Probabilitas meningkat dengan ukuran sampel"),
            QuestionOption(id: "d", textEN: "Variance increases with n", textID: "Variansi meningkat dengan n")
        ],
        correctOptionId: "a",
        explanationEN: "LLN: As n→∞, the sample mean X̄ₙ converges to E[X]. This justifies using sample averages to estimate population means and underlies Monte Carlo methods.",
        explanationID: "LLN: Saat n→∞, rata-rata sampel X̄ₙ konvergen ke E[X]. Ini membenarkan penggunaan rata-rata sampel untuk mengestimasi mean populasi dan mendasari metode Monte Carlo.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_017",
        questionEN: "What is the exponential distribution used for?",
        questionID: "Untuk apa distribusi eksponensial digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Modeling time between events in a Poisson process", textID: "Memodelkan waktu antar kejadian dalam proses Poisson"),
            QuestionOption(id: "b", textEN: "Modeling count of events", textID: "Memodelkan jumlah kejadian"),
            QuestionOption(id: "c", textEN: "Modeling discrete outcomes", textID: "Memodelkan hasil diskrit"),
            QuestionOption(id: "d", textEN: "Modeling bounded random variables", textID: "Memodelkan variabel acak terbatas")
        ],
        correctOptionId: "a",
        explanationEN: "Exponential(λ) models time between Poisson events: f(x) = λe⁻λˣ for x≥0. It's memoryless: P(X>s+t|X>s) = P(X>t). E[X] = 1/λ, Var(X) = 1/λ².",
        explanationID: "Eksponensial(λ) memodelkan waktu antar kejadian Poisson: f(x) = λe⁻λˣ untuk x≥0. Tanpa memori: P(X>s+t|X>s) = P(X>t). E[X] = 1/λ, Var(X) = 1/λ².",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_018",
        questionEN: "What is the uniform distribution U(a,b)?",
        questionID: "Apa itu distribusi seragam U(a,b)?",
        options: [
            QuestionOption(id: "a", textEN: "All values between a and b are equally likely: f(x) = 1/(b-a)", textID: "Semua nilai antara a dan b sama kemungkinannya: f(x) = 1/(b-a)"),
            QuestionOption(id: "b", textEN: "The most common distribution", textID: "Distribusi paling umum"),
            QuestionOption(id: "c", textEN: "A distribution with one mode", textID: "Distribusi dengan satu modus"),
            QuestionOption(id: "d", textEN: "A normal distribution with special parameters", textID: "Distribusi normal dengan parameter khusus")
        ],
        correctOptionId: "a",
        explanationEN: "Uniform(a,b) has constant density f(x) = 1/(b-a) for a≤x≤b. E[X] = (a+b)/2, Var(X) = (b-a)²/12. Used for random sampling and initialization.",
        explanationID: "Uniform(a,b) memiliki densitas konstan f(x) = 1/(b-a) untuk a≤x≤b. E[X] = (a+b)/2, Var(X) = (b-a)²/12. Digunakan untuk sampling acak dan inisialisasi.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_019",
        questionEN: "What is the categorical distribution?",
        questionID: "Apa itu distribusi kategorikal?",
        options: [
            QuestionOption(id: "a", textEN: "A generalization of Bernoulli to k outcomes with probabilities p₁, p₂, ..., pₖ", textID: "Generalisasi Bernoulli ke k hasil dengan probabilitas p₁, p₂, ..., pₖ"),
            QuestionOption(id: "b", textEN: "A continuous distribution", textID: "Distribusi kontinu"),
            QuestionOption(id: "c", textEN: "A two-outcome distribution", textID: "Distribusi dua hasil"),
            QuestionOption(id: "d", textEN: "The same as normal distribution", textID: "Sama dengan distribusi normal")
        ],
        correctOptionId: "a",
        explanationEN: "Categorical (Multinoulli) is a single trial over k categories with P(X=i) = pᵢ where Σpᵢ = 1. It generalizes Bernoulli (k=2). Used in classification outputs.",
        explanationID: "Kategorikal (Multinoulli) adalah percobaan tunggal atas k kategori dengan P(X=i) = pᵢ dimana Σpᵢ = 1. Menggeneralisasi Bernoulli (k=2). Digunakan dalam output klasifikasi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_020",
        questionEN: "What is the softmax function's relationship to probability distributions?",
        questionID: "Apa hubungan fungsi softmax dengan distribusi probabilitas?",
        options: [
            QuestionOption(id: "a", textEN: "It converts logits to a valid categorical probability distribution (sums to 1, all positive)", textID: "Mengonversi logit ke distribusi probabilitas kategorikal valid (berjumlah 1, semua positif)"),
            QuestionOption(id: "b", textEN: "It's unrelated to probability", textID: "Tidak berhubungan dengan probabilitas"),
            QuestionOption(id: "c", textEN: "It only works for binary classification", textID: "Hanya bekerja untuk klasifikasi biner"),
            QuestionOption(id: "d", textEN: "It produces negative probabilities", textID: "Menghasilkan probabilitas negatif")
        ],
        correctOptionId: "a",
        explanationEN: "Softmax transforms logits z to probabilities: p_i = exp(z_i)/Σexp(z_j). Output is a valid categorical distribution: all p_i > 0 and Σp_i = 1. Used in multi-class classification.",
        explanationID: "Softmax mentransformasi logit z ke probabilitas: p_i = exp(z_i)/Σexp(z_j). Output adalah distribusi kategorikal valid: semua p_i > 0 dan Σp_i = 1. Digunakan dalam klasifikasi multi-kelas.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    // MARK: - Bayesian Inference (Questions 21-30)
    Question(
        id: "prob_stats_021",
        questionEN: "In Bayesian inference, what is the prior P(θ)?",
        questionID: "Dalam inferensi Bayesian, apa itu prior P(θ)?",
        options: [
            QuestionOption(id: "a", textEN: "Our belief about parameter θ before seeing any data", textID: "Keyakinan kita tentang parameter θ sebelum melihat data apapun"),
            QuestionOption(id: "b", textEN: "The probability of the data", textID: "Probabilitas data"),
            QuestionOption(id: "c", textEN: "The probability after seeing data", textID: "Probabilitas setelah melihat data"),
            QuestionOption(id: "d", textEN: "The likelihood of the model", textID: "Likelihood model")
        ],
        correctOptionId: "a",
        explanationEN: "The prior P(θ) represents our initial beliefs about the parameter before observing data. It encodes domain knowledge or assumptions about likely parameter values.",
        explanationID: "Prior P(θ) merepresentasikan keyakinan awal tentang parameter sebelum mengamati data. Mengenkode pengetahuan domain atau asumsi tentang nilai parameter yang mungkin.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_022",
        questionEN: "What is the likelihood P(D|θ)?",
        questionID: "Apa itu likelihood P(D|θ)?",
        options: [
            QuestionOption(id: "a", textEN: "The probability of observing data D given parameter θ", textID: "Probabilitas mengamati data D diberikan parameter θ"),
            QuestionOption(id: "b", textEN: "The probability of θ given data", textID: "Probabilitas θ diberikan data"),
            QuestionOption(id: "c", textEN: "The prior probability", textID: "Probabilitas prior"),
            QuestionOption(id: "d", textEN: "The posterior probability", textID: "Probabilitas posterior")
        ],
        correctOptionId: "a",
        explanationEN: "The likelihood P(D|θ) measures how probable the observed data is under different parameter values. In MLE, we find θ that maximizes this likelihood.",
        explanationID: "Likelihood P(D|θ) mengukur seberapa mungkin data yang diamati di bawah nilai parameter berbeda. Dalam MLE, kita mencari θ yang memaksimalkan likelihood ini.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_023",
        questionEN: "What is the posterior P(θ|D)?",
        questionID: "Apa itu posterior P(θ|D)?",
        options: [
            QuestionOption(id: "a", textEN: "Our updated belief about θ after seeing data: P(θ|D) ∝ P(D|θ)P(θ)", textID: "Keyakinan terperbarui tentang θ setelah melihat data: P(θ|D) ∝ P(D|θ)P(θ)"),
            QuestionOption(id: "b", textEN: "The prior belief", textID: "Keyakinan prior"),
            QuestionOption(id: "c", textEN: "The likelihood only", textID: "Hanya likelihood"),
            QuestionOption(id: "d", textEN: "The evidence", textID: "Evidence")
        ],
        correctOptionId: "a",
        explanationEN: "The posterior P(θ|D) = P(D|θ)P(θ)/P(D) combines prior beliefs with observed evidence. It's our updated knowledge about θ after seeing the data.",
        explanationID: "Posterior P(θ|D) = P(D|θ)P(θ)/P(D) menggabungkan keyakinan prior dengan bukti yang diamati. Ini pengetahuan terperbarui tentang θ setelah melihat data.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_024",
        questionEN: "What is Maximum Likelihood Estimation (MLE)?",
        questionID: "Apa itu Maximum Likelihood Estimation (MLE)?",
        options: [
            QuestionOption(id: "a", textEN: "Finding parameter θ that maximizes P(D|θ) - makes observed data most probable", textID: "Mencari parameter θ yang memaksimalkan P(D|θ) - membuat data yang diamati paling mungkin"),
            QuestionOption(id: "b", textEN: "Finding the maximum of the prior", textID: "Mencari maksimum prior"),
            QuestionOption(id: "c", textEN: "Finding the most likely data", textID: "Mencari data paling mungkin"),
            QuestionOption(id: "d", textEN: "Maximizing the posterior", textID: "Memaksimalkan posterior")
        ],
        correctOptionId: "a",
        explanationEN: "MLE finds θ* = argmax P(D|θ). It asks: 'which parameter value makes the observed data most likely?' MLE is equivalent to minimizing negative log-likelihood.",
        explanationID: "MLE mencari θ* = argmax P(D|θ). Bertanya: 'nilai parameter mana yang membuat data yang diamati paling mungkin?' MLE setara dengan meminimalkan negative log-likelihood.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_025",
        questionEN: "What is Maximum A Posteriori (MAP) estimation?",
        questionID: "Apa itu estimasi Maximum A Posteriori (MAP)?",
        options: [
            QuestionOption(id: "a", textEN: "Finding parameter θ that maximizes P(θ|D) ∝ P(D|θ)P(θ)", textID: "Mencari parameter θ yang memaksimalkan P(θ|D) ∝ P(D|θ)P(θ)"),
            QuestionOption(id: "b", textEN: "Finding the maximum likelihood only", textID: "Mencari maximum likelihood saja"),
            QuestionOption(id: "c", textEN: "Ignoring the prior", textID: "Mengabaikan prior"),
            QuestionOption(id: "d", textEN: "The same as MLE always", textID: "Selalu sama dengan MLE")
        ],
        correctOptionId: "a",
        explanationEN: "MAP finds θ* = argmax P(θ|D) = argmax P(D|θ)P(θ). Unlike MLE, MAP includes the prior. With uniform prior, MAP equals MLE. With Gaussian prior, MAP equals L2-regularized MLE.",
        explanationID: "MAP mencari θ* = argmax P(θ|D) = argmax P(D|θ)P(θ). Berbeda dengan MLE, MAP menyertakan prior. Dengan prior uniform, MAP sama dengan MLE. Dengan prior Gaussian, MAP sama dengan MLE ter-regularisasi L2.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_026",
        questionEN: "How does a Gaussian prior on weights relate to L2 regularization?",
        questionID: "Bagaimana prior Gaussian pada bobot berhubungan dengan regularisasi L2?",
        options: [
            QuestionOption(id: "a", textEN: "A Gaussian prior N(0, σ²) leads to L2 regularization in MAP estimation", textID: "Prior Gaussian N(0, σ²) mengarah ke regularisasi L2 dalam estimasi MAP"),
            QuestionOption(id: "b", textEN: "They are unrelated", textID: "Tidak berhubungan"),
            QuestionOption(id: "c", textEN: "It leads to L1 regularization", textID: "Mengarah ke regularisasi L1"),
            QuestionOption(id: "d", textEN: "It removes all regularization", textID: "Menghapus semua regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "With prior θ ~ N(0, σ²I), log P(θ) includes -||θ||²/(2σ²). Maximizing log-posterior = log-likelihood + log-prior is equivalent to minimizing loss + λ||θ||² (L2 regularization).",
        explanationID: "Dengan prior θ ~ N(0, σ²I), log P(θ) menyertakan -||θ||²/(2σ²). Memaksimalkan log-posterior = log-likelihood + log-prior setara dengan meminimalkan loss + λ||θ||² (regularisasi L2).",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_027",
        questionEN: "How does a Laplace prior on weights relate to L1 regularization?",
        questionID: "Bagaimana prior Laplace pada bobot berhubungan dengan regularisasi L1?",
        options: [
            QuestionOption(id: "a", textEN: "A Laplace prior leads to L1 regularization in MAP estimation", textID: "Prior Laplace mengarah ke regularisasi L1 dalam estimasi MAP"),
            QuestionOption(id: "b", textEN: "They are unrelated", textID: "Tidak berhubungan"),
            QuestionOption(id: "c", textEN: "It leads to L2 regularization", textID: "Mengarah ke regularisasi L2"),
            QuestionOption(id: "d", textEN: "It doubles the regularization", textID: "Menggandakan regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "The Laplace prior has log-density proportional to -|θ|. MAP with Laplace prior is equivalent to minimizing loss + λ||θ||₁ (L1 regularization), promoting sparsity.",
        explanationID: "Prior Laplace memiliki log-densitas proporsional terhadap -|θ|. MAP dengan prior Laplace setara dengan meminimalkan loss + λ||θ||₁ (regularisasi L1), mendorong sparsity.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_028",
        questionEN: "What is the evidence P(D) in Bayesian inference?",
        questionID: "Apa itu evidence P(D) dalam inferensi Bayesian?",
        options: [
            QuestionOption(id: "a", textEN: "The marginal likelihood: P(D) = ∫P(D|θ)P(θ)dθ", textID: "Marginal likelihood: P(D) = ∫P(D|θ)P(θ)dθ"),
            QuestionOption(id: "b", textEN: "The likelihood", textID: "Likelihood"),
            QuestionOption(id: "c", textEN: "The prior", textID: "Prior"),
            QuestionOption(id: "d", textEN: "The posterior", textID: "Posterior")
        ],
        correctOptionId: "a",
        explanationEN: "The evidence P(D) = ∫P(D|θ)P(θ)dθ is the probability of data averaged over all possible parameter values. It's used for model comparison (Bayes factor).",
        explanationID: "Evidence P(D) = ∫P(D|θ)P(θ)dθ adalah probabilitas data dirata-ratakan atas semua nilai parameter yang mungkin. Digunakan untuk perbandingan model (Bayes factor).",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_029",
        questionEN: "What is conjugate prior?",
        questionID: "Apa itu prior konjugat?",
        options: [
            QuestionOption(id: "a", textEN: "A prior that, combined with a likelihood, gives a posterior in the same family as the prior", textID: "Prior yang, digabungkan dengan likelihood, memberikan posterior dalam keluarga yang sama dengan prior"),
            QuestionOption(id: "b", textEN: "Any prior distribution", textID: "Distribusi prior apapun"),
            QuestionOption(id: "c", textEN: "The opposite of the prior", textID: "Kebalikan dari prior"),
            QuestionOption(id: "d", textEN: "A prior that equals the posterior", textID: "Prior yang sama dengan posterior")
        ],
        correctOptionId: "a",
        explanationEN: "Conjugate priors make Bayesian computation tractable. E.g., Beta is conjugate to Binomial, Gaussian is conjugate to Gaussian likelihood. Posterior is in the same family with updated parameters.",
        explanationID: "Prior konjugat membuat komputasi Bayesian dapat dilakukan. Misal, Beta konjugat terhadap Binomial, Gaussian konjugat terhadap likelihood Gaussian. Posterior dalam keluarga yang sama dengan parameter terperbarui.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_030",
        questionEN: "In Naive Bayes classification, what is assumed about features?",
        questionID: "Dalam klasifikasi Naive Bayes, apa yang diasumsikan tentang fitur?",
        options: [
            QuestionOption(id: "a", textEN: "Features are conditionally independent given the class label", textID: "Fitur independen kondisional diberikan label kelas"),
            QuestionOption(id: "b", textEN: "Features are perfectly correlated", textID: "Fitur berkorelasi sempurna"),
            QuestionOption(id: "c", textEN: "Features have no relationship to the class", textID: "Fitur tidak ada hubungan dengan kelas"),
            QuestionOption(id: "d", textEN: "There is only one feature", textID: "Hanya ada satu fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Naive Bayes assumes P(x₁,x₂,...|C) = ∏P(xᵢ|C) - features are conditionally independent given class. This 'naive' assumption simplifies computation and often works well in practice.",
        explanationID: "Naive Bayes mengasumsikan P(x₁,x₂,...|C) = ∏P(xᵢ|C) - fitur independen kondisional diberikan kelas. Asumsi 'naif' ini menyederhanakan komputasi dan sering bekerja baik dalam praktik.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    // MARK: - Information Theory (Questions 31-40)
    Question(
        id: "prob_stats_031",
        questionEN: "What is entropy H(X) of a discrete random variable?",
        questionID: "Apa itu entropi H(X) dari variabel acak diskrit?",
        options: [
            QuestionOption(id: "a", textEN: "H(X) = -Σ p(x) log p(x) - average information/uncertainty", textID: "H(X) = -Σ p(x) log p(x) - informasi/ketidakpastian rata-rata"),
            QuestionOption(id: "b", textEN: "H(X) = Σ p(x)", textID: "H(X) = Σ p(x)"),
            QuestionOption(id: "c", textEN: "H(X) = max p(x)", textID: "H(X) = max p(x)"),
            QuestionOption(id: "d", textEN: "H(X) = p(x)²", textID: "H(X) = p(x)²")
        ],
        correctOptionId: "a",
        explanationEN: "Entropy H(X) = -Σ p(x) log p(x) measures the average uncertainty or information content. Maximum entropy is achieved by uniform distribution; minimum (0) by a deterministic outcome.",
        explanationID: "Entropi H(X) = -Σ p(x) log p(x) mengukur ketidakpastian atau konten informasi rata-rata. Entropi maksimum dicapai oleh distribusi seragam; minimum (0) oleh hasil deterministik.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_032",
        questionEN: "What is the entropy of a fair coin flip?",
        questionID: "Berapa entropi lemparan koin adil?",
        options: [
            QuestionOption(id: "a", textEN: "1 bit (log₂(2) = 1)", textID: "1 bit (log₂(2) = 1)"),
            QuestionOption(id: "b", textEN: "0.5 bits", textID: "0.5 bit"),
            QuestionOption(id: "c", textEN: "2 bits", textID: "2 bit"),
            QuestionOption(id: "d", textEN: "0 bits", textID: "0 bit")
        ],
        correctOptionId: "a",
        explanationEN: "For a fair coin: H = -0.5log₂(0.5) - 0.5log₂(0.5) = -log₂(0.5) = log₂(2) = 1 bit. A fair coin is maximally uncertain for binary outcomes.",
        explanationID: "Untuk koin adil: H = -0.5log₂(0.5) - 0.5log₂(0.5) = -log₂(0.5) = log₂(2) = 1 bit. Koin adil memiliki ketidakpastian maksimal untuk hasil biner.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_033",
        questionEN: "What is cross-entropy H(P, Q)?",
        questionID: "Apa itu cross-entropy H(P, Q)?",
        options: [
            QuestionOption(id: "a", textEN: "H(P, Q) = -Σ p(x) log q(x) - expected log-likelihood under Q when true distribution is P", textID: "H(P, Q) = -Σ p(x) log q(x) - log-likelihood ekspektasi di bawah Q ketika distribusi sebenarnya adalah P"),
            QuestionOption(id: "b", textEN: "H(P, Q) = H(P) + H(Q)", textID: "H(P, Q) = H(P) + H(Q)"),
            QuestionOption(id: "c", textEN: "H(P, Q) = H(P) × H(Q)", textID: "H(P, Q) = H(P) × H(Q)"),
            QuestionOption(id: "d", textEN: "H(P, Q) = H(P) - H(Q)", textID: "H(P, Q) = H(P) - H(Q)")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-entropy H(P,Q) = -Σ p(x) log q(x) measures the average bits needed to encode samples from P using a code optimized for Q. It's the loss function for classification.",
        explanationID: "Cross-entropy H(P,Q) = -Σ p(x) log q(x) mengukur bit rata-rata yang dibutuhkan untuk mengenkode sampel dari P menggunakan kode yang dioptimalkan untuk Q. Ini fungsi loss untuk klasifikasi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_034",
        questionEN: "What is KL divergence D_KL(P||Q)?",
        questionID: "Apa itu divergensi KL D_KL(P||Q)?",
        options: [
            QuestionOption(id: "a", textEN: "D_KL(P||Q) = Σ p(x) log(p(x)/q(x)) - measures difference between distributions", textID: "D_KL(P||Q) = Σ p(x) log(p(x)/q(x)) - mengukur perbedaan antara distribusi"),
            QuestionOption(id: "b", textEN: "D_KL(P||Q) = |P - Q|", textID: "D_KL(P||Q) = |P - Q|"),
            QuestionOption(id: "c", textEN: "D_KL(P||Q) = H(P) - H(Q)", textID: "D_KL(P||Q) = H(P) - H(Q)"),
            QuestionOption(id: "d", textEN: "D_KL(P||Q) = max(P) - max(Q)", textID: "D_KL(P||Q) = max(P) - max(Q)")
        ],
        correctOptionId: "a",
        explanationEN: "KL divergence D_KL(P||Q) = Σ p(x) log(p(x)/q(x)) = H(P,Q) - H(P). It measures how P differs from Q, always ≥ 0, equals 0 iff P = Q. Note: it's not symmetric.",
        explanationID: "Divergensi KL D_KL(P||Q) = Σ p(x) log(p(x)/q(x)) = H(P,Q) - H(P). Mengukur bagaimana P berbeda dari Q, selalu ≥ 0, sama dengan 0 jika dan hanya jika P = Q. Catatan: tidak simetris.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_035",
        questionEN: "Why is KL divergence not a true distance metric?",
        questionID: "Mengapa divergensi KL bukan metrik jarak sebenarnya?",
        options: [
            QuestionOption(id: "a", textEN: "It's not symmetric: D_KL(P||Q) ≠ D_KL(Q||P)", textID: "Tidak simetris: D_KL(P||Q) ≠ D_KL(Q||P)"),
            QuestionOption(id: "b", textEN: "It can be negative", textID: "Bisa negatif"),
            QuestionOption(id: "c", textEN: "It violates triangle inequality only", textID: "Hanya melanggar ketidaksamaan segitiga"),
            QuestionOption(id: "d", textEN: "It's always zero", textID: "Selalu nol")
        ],
        correctOptionId: "a",
        explanationEN: "KL divergence is asymmetric: D_KL(P||Q) ≠ D_KL(Q||P). It also doesn't satisfy the triangle inequality. It's a directed measure of how P differs from Q.",
        explanationID: "Divergensi KL asimetris: D_KL(P||Q) ≠ D_KL(Q||P). Juga tidak memenuhi ketidaksamaan segitiga. Ini ukuran terarah bagaimana P berbeda dari Q.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_036",
        questionEN: "What is the relationship between cross-entropy and KL divergence?",
        questionID: "Apa hubungan antara cross-entropy dan divergensi KL?",
        options: [
            QuestionOption(id: "a", textEN: "H(P, Q) = H(P) + D_KL(P||Q)", textID: "H(P, Q) = H(P) + D_KL(P||Q)"),
            QuestionOption(id: "b", textEN: "H(P, Q) = D_KL(P||Q)", textID: "H(P, Q) = D_KL(P||Q)"),
            QuestionOption(id: "c", textEN: "H(P, Q) = H(P) - D_KL(P||Q)", textID: "H(P, Q) = H(P) - D_KL(P||Q)"),
            QuestionOption(id: "d", textEN: "They are unrelated", textID: "Tidak berhubungan")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-entropy = entropy + KL divergence: H(P,Q) = H(P) + D_KL(P||Q). Minimizing cross-entropy is equivalent to minimizing KL divergence since H(P) is constant for fixed P.",
        explanationID: "Cross-entropy = entropi + divergensi KL: H(P,Q) = H(P) + D_KL(P||Q). Meminimalkan cross-entropy setara dengan meminimalkan divergensi KL karena H(P) konstan untuk P tetap.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_037",
        questionEN: "What is mutual information I(X; Y)?",
        questionID: "Apa itu informasi mutual I(X; Y)?",
        options: [
            QuestionOption(id: "a", textEN: "I(X; Y) = H(X) - H(X|Y) = D_KL(P(X,Y) || P(X)P(Y))", textID: "I(X; Y) = H(X) - H(X|Y) = D_KL(P(X,Y) || P(X)P(Y))"),
            QuestionOption(id: "b", textEN: "I(X; Y) = H(X) + H(Y)", textID: "I(X; Y) = H(X) + H(Y)"),
            QuestionOption(id: "c", textEN: "I(X; Y) = H(X) × H(Y)", textID: "I(X; Y) = H(X) × H(Y)"),
            QuestionOption(id: "d", textEN: "I(X; Y) = 0 always", textID: "I(X; Y) = 0 selalu")
        ],
        correctOptionId: "a",
        explanationEN: "Mutual information I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) measures the information shared between X and Y. Zero if independent, equals H(X) if Y determines X completely.",
        explanationID: "Informasi mutual I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X) mengukur informasi yang dibagikan antara X dan Y. Nol jika independen, sama dengan H(X) jika Y menentukan X sepenuhnya.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_038",
        questionEN: "What is conditional entropy H(Y|X)?",
        questionID: "Apa itu entropi kondisional H(Y|X)?",
        options: [
            QuestionOption(id: "a", textEN: "H(Y|X) = -Σ p(x,y) log p(y|x) - uncertainty in Y given X", textID: "H(Y|X) = -Σ p(x,y) log p(y|x) - ketidakpastian dalam Y diberikan X"),
            QuestionOption(id: "b", textEN: "H(Y|X) = H(Y) always", textID: "H(Y|X) = H(Y) selalu"),
            QuestionOption(id: "c", textEN: "H(Y|X) = H(Y)/H(X)", textID: "H(Y|X) = H(Y)/H(X)"),
            QuestionOption(id: "d", textEN: "H(Y|X) = 0 always", textID: "H(Y|X) = 0 selalu")
        ],
        correctOptionId: "a",
        explanationEN: "Conditional entropy H(Y|X) = -Σ p(x,y) log p(y|x) = H(X,Y) - H(X). It's the remaining uncertainty in Y after observing X. H(Y|X) ≤ H(Y), with equality when X and Y are independent.",
        explanationID: "Entropi kondisional H(Y|X) = -Σ p(x,y) log p(y|x) = H(X,Y) - H(X). Ini ketidakpastian yang tersisa dalam Y setelah mengamati X. H(Y|X) ≤ H(Y), sama jika X dan Y independen.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_039",
        questionEN: "Why is cross-entropy used as a loss function for classification?",
        questionID: "Mengapa cross-entropy digunakan sebagai fungsi loss untuk klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "It measures the average bits needed to encode true labels with predicted probabilities", textID: "Mengukur bit rata-rata yang dibutuhkan untuk mengenkode label sebenarnya dengan probabilitas prediksi"),
            QuestionOption(id: "b", textEN: "It's the only possible loss function", textID: "Ini satu-satunya fungsi loss yang mungkin"),
            QuestionOption(id: "c", textEN: "It's always differentiable", textID: "Selalu dapat didiferensiasi"),
            QuestionOption(id: "d", textEN: "It equals accuracy", textID: "Sama dengan akurasi")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-entropy L = -Σ yᵢlog(pᵢ) penalizes predictions that assign low probability to the true class. It's equivalent to negative log-likelihood, connecting to MLE.",
        explanationID: "Cross-entropy L = -Σ yᵢlog(pᵢ) memberikan penalti pada prediksi yang menetapkan probabilitas rendah ke kelas sebenarnya. Setara dengan negative log-likelihood, terhubung ke MLE.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_040",
        questionEN: "What is the Jensen-Shannon divergence?",
        questionID: "Apa itu divergensi Jensen-Shannon?",
        options: [
            QuestionOption(id: "a", textEN: "A symmetric version of KL divergence: JS(P||Q) = ½D_KL(P||M) + ½D_KL(Q||M) where M = ½(P+Q)", textID: "Versi simetris dari divergensi KL: JS(P||Q) = ½D_KL(P||M) + ½D_KL(Q||M) dimana M = ½(P+Q)"),
            QuestionOption(id: "b", textEN: "The same as KL divergence", textID: "Sama dengan divergensi KL"),
            QuestionOption(id: "c", textEN: "The product of two entropies", textID: "Hasil kali dua entropi"),
            QuestionOption(id: "d", textEN: "Always equals 1", textID: "Selalu sama dengan 1")
        ],
        correctOptionId: "a",
        explanationEN: "JS divergence is a symmetric, bounded (0 to 1) measure: JS(P||Q) = ½D_KL(P||M) + ½D_KL(Q||M) where M = ½(P+Q). Used in GANs and distribution comparison.",
        explanationID: "Divergensi JS adalah ukuran simetris, terbatas (0 sampai 1): JS(P||Q) = ½D_KL(P||M) + ½D_KL(Q||M) dimana M = ½(P+Q). Digunakan dalam GAN dan perbandingan distribusi.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    // MARK: - Statistics for ML (Questions 41-50)
    Question(
        id: "prob_stats_041",
        questionEN: "What is a confidence interval?",
        questionID: "Apa itu interval kepercayaan?",
        options: [
            QuestionOption(id: "a", textEN: "A range of values that likely contains the true parameter with a certain probability", textID: "Rentang nilai yang kemungkinan berisi parameter sebenarnya dengan probabilitas tertentu"),
            QuestionOption(id: "b", textEN: "The probability of being correct", textID: "Probabilitas benar"),
            QuestionOption(id: "c", textEN: "The accuracy of the model", textID: "Akurasi model"),
            QuestionOption(id: "d", textEN: "The variance of estimates", textID: "Variansi estimasi")
        ],
        correctOptionId: "a",
        explanationEN: "A 95% confidence interval means: if we repeated the experiment many times, 95% of intervals would contain the true parameter. It quantifies uncertainty in parameter estimates.",
        explanationID: "Interval kepercayaan 95% berarti: jika kita mengulangi eksperimen berkali-kali, 95% interval akan berisi parameter sebenarnya. Mengkuantifikasi ketidakpastian dalam estimasi parameter.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_042",
        questionEN: "What is a p-value?",
        questionID: "Apa itu p-value?",
        options: [
            QuestionOption(id: "a", textEN: "Probability of observing data as extreme as what we got, assuming the null hypothesis is true", textID: "Probabilitas mengamati data seekstrem yang kita dapat, dengan asumsi hipotesis nol benar"),
            QuestionOption(id: "b", textEN: "Probability that the null hypothesis is true", textID: "Probabilitas bahwa hipotesis nol benar"),
            QuestionOption(id: "c", textEN: "Probability of the alternative hypothesis", textID: "Probabilitas hipotesis alternatif"),
            QuestionOption(id: "d", textEN: "The test statistic", textID: "Statistik uji")
        ],
        correctOptionId: "a",
        explanationEN: "The p-value is P(data this extreme | H₀). Small p-value (< α) suggests the data is unlikely under H₀, leading us to reject it. It's NOT the probability that H₀ is true.",
        explanationID: "P-value adalah P(data seekstrem ini | H₀). P-value kecil (< α) menunjukkan data tidak mungkin di bawah H₀, mengarahkan kita untuk menolaknya. Ini BUKAN probabilitas bahwa H₀ benar.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_043",
        questionEN: "What is the difference between Type I and Type II errors?",
        questionID: "Apa perbedaan antara kesalahan Tipe I dan Tipe II?",
        options: [
            QuestionOption(id: "a", textEN: "Type I: rejecting true H₀ (false positive); Type II: failing to reject false H₀ (false negative)", textID: "Tipe I: menolak H₀ benar (false positive); Tipe II: gagal menolak H₀ salah (false negative)"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Type I is worse than Type II always", textID: "Tipe I selalu lebih buruk dari Tipe II"),
            QuestionOption(id: "d", textEN: "Type II is about confidence intervals", textID: "Tipe II tentang interval kepercayaan")
        ],
        correctOptionId: "a",
        explanationEN: "Type I (α): Rejecting H₀ when it's true - false alarm. Type II (β): Not rejecting H₀ when it's false - missed detection. Power = 1 - β is probability of correctly rejecting false H₀.",
        explanationID: "Tipe I (α): Menolak H₀ ketika benar - alarm palsu. Tipe II (β): Tidak menolak H₀ ketika salah - deteksi terlewat. Power = 1 - β adalah probabilitas menolak H₀ salah dengan benar.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_044",
        questionEN: "What is bias in an estimator?",
        questionID: "Apa itu bias dalam estimator?",
        options: [
            QuestionOption(id: "a", textEN: "Bias = E[θ̂] - θ: difference between expected estimate and true value", textID: "Bias = E[θ̂] - θ: perbedaan antara estimasi ekspektasi dan nilai sebenarnya"),
            QuestionOption(id: "b", textEN: "The variance of the estimator", textID: "Variansi estimator"),
            QuestionOption(id: "c", textEN: "The error on training data", textID: "Error pada data training"),
            QuestionOption(id: "d", textEN: "The MSE", textID: "MSE")
        ],
        correctOptionId: "a",
        explanationEN: "Bias measures systematic error: Bias(θ̂) = E[θ̂] - θ. An unbiased estimator has E[θ̂] = θ. Low bias doesn't guarantee accuracy - variance matters too (bias-variance tradeoff).",
        explanationID: "Bias mengukur error sistematis: Bias(θ̂) = E[θ̂] - θ. Estimator unbiased memiliki E[θ̂] = θ. Bias rendah tidak menjamin akurasi - variansi juga penting (tradeoff bias-variansi).",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_045",
        questionEN: "What is the bias-variance decomposition of MSE?",
        questionID: "Apa itu dekomposisi bias-variansi dari MSE?",
        options: [
            QuestionOption(id: "a", textEN: "MSE = Bias² + Variance", textID: "MSE = Bias² + Variansi"),
            QuestionOption(id: "b", textEN: "MSE = Bias + Variance", textID: "MSE = Bias + Variansi"),
            QuestionOption(id: "c", textEN: "MSE = Bias / Variance", textID: "MSE = Bias / Variansi"),
            QuestionOption(id: "d", textEN: "MSE = Bias × Variance", textID: "MSE = Bias × Variansi")
        ],
        correctOptionId: "a",
        explanationEN: "MSE(θ̂) = E[(θ̂ - θ)²] = Bias²(θ̂) + Var(θ̂). Total error has two sources: systematic error (bias²) and random fluctuation (variance). This is the bias-variance tradeoff.",
        explanationID: "MSE(θ̂) = E[(θ̂ - θ)²] = Bias²(θ̂) + Var(θ̂). Error total memiliki dua sumber: error sistematis (bias²) dan fluktuasi acak (variansi). Ini adalah tradeoff bias-variansi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_046",
        questionEN: "What is bootstrapping?",
        questionID: "Apa itu bootstrapping?",
        options: [
            QuestionOption(id: "a", textEN: "Resampling with replacement from the data to estimate sampling distribution", textID: "Resampling dengan pengembalian dari data untuk mengestimasi distribusi sampling"),
            QuestionOption(id: "b", textEN: "Starting training from scratch", textID: "Memulai training dari awal"),
            QuestionOption(id: "c", textEN: "Using ensemble methods", textID: "Menggunakan metode ensemble"),
            QuestionOption(id: "d", textEN: "Gradient computation", textID: "Komputasi gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Bootstrap resamples n points with replacement from the original n points, creating many synthetic datasets. Statistics computed on these give confidence intervals and uncertainty estimates without assumptions.",
        explanationID: "Bootstrap meresampling n titik dengan pengembalian dari n titik asli, membuat banyak dataset sintetis. Statistik yang dihitung pada ini memberikan interval kepercayaan dan estimasi ketidakpastian tanpa asumsi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_047",
        questionEN: "What is the standard error of the mean?",
        questionID: "Apa itu standar error dari mean?",
        options: [
            QuestionOption(id: "a", textEN: "SE = σ/√n - standard deviation of the sampling distribution of the mean", textID: "SE = σ/√n - standar deviasi dari distribusi sampling mean"),
            QuestionOption(id: "b", textEN: "SE = σ × n", textID: "SE = σ × n"),
            QuestionOption(id: "c", textEN: "SE = σ²/n", textID: "SE = σ²/n"),
            QuestionOption(id: "d", textEN: "SE = σ", textID: "SE = σ")
        ],
        correctOptionId: "a",
        explanationEN: "Standard error SE = σ/√n estimates how much the sample mean varies across samples. It decreases with √n - more data gives more precise mean estimates.",
        explanationID: "Standar error SE = σ/√n mengestimasi seberapa banyak rata-rata sampel bervariasi antar sampel. Menurun dengan √n - lebih banyak data memberikan estimasi mean lebih presisi.",
        topic: "mathematics",
        difficulty: .intermediate
    ),

    Question(
        id: "prob_stats_048",
        questionEN: "What is a sufficient statistic?",
        questionID: "Apa itu statistik cukup?",
        options: [
            QuestionOption(id: "a", textEN: "A statistic that captures all information in the data about the parameter", textID: "Statistik yang menangkap semua informasi dalam data tentang parameter"),
            QuestionOption(id: "b", textEN: "A statistic that is good enough", textID: "Statistik yang cukup baik"),
            QuestionOption(id: "c", textEN: "The mean of the data", textID: "Mean dari data"),
            QuestionOption(id: "d", textEN: "Any summary of the data", textID: "Ringkasan apapun dari data")
        ],
        correctOptionId: "a",
        explanationEN: "T(X) is sufficient for θ if P(X|T,θ) doesn't depend on θ. Once we know T, the raw data gives no more information about θ. E.g., for Normal with known σ², the sample mean is sufficient for μ.",
        explanationID: "T(X) cukup untuk θ jika P(X|T,θ) tidak bergantung pada θ. Setelah kita tahu T, data mentah tidak memberikan informasi lebih tentang θ. Misal, untuk Normal dengan σ² diketahui, rata-rata sampel cukup untuk μ.",
        topic: "mathematics",
        difficulty: .advanced
    ),

    Question(
        id: "prob_stats_049",
        questionEN: "What is the difference between population and sample statistics?",
        questionID: "Apa perbedaan antara statistik populasi dan sampel?",
        options: [
            QuestionOption(id: "a", textEN: "Population parameters are fixed truths; sample statistics are estimates from data", textID: "Parameter populasi adalah kebenaran tetap; statistik sampel adalah estimasi dari data"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Population is always smaller", textID: "Populasi selalu lebih kecil"),
            QuestionOption(id: "d", textEN: "Sample is always more accurate", textID: "Sampel selalu lebih akurat")
        ],
        correctOptionId: "a",
        explanationEN: "Population parameters (μ, σ) describe the entire population - usually unknown. Sample statistics (x̄, s) are computed from observed data and estimate the population parameters with some uncertainty.",
        explanationID: "Parameter populasi (μ, σ) mendeskripsikan seluruh populasi - biasanya tidak diketahui. Statistik sampel (x̄, s) dihitung dari data yang diamati dan mengestimasi parameter populasi dengan beberapa ketidakpastian.",
        topic: "mathematics",
        difficulty: .beginner
    ),

    Question(
        id: "prob_stats_050",
        questionEN: "What is Monte Carlo estimation?",
        questionID: "Apa itu estimasi Monte Carlo?",
        options: [
            QuestionOption(id: "a", textEN: "Approximating expectations by averaging samples: E[f(X)] ≈ (1/n)Σf(xᵢ)", textID: "Mengaproksimasi ekspektasi dengan merata-ratakan sampel: E[f(X)] ≈ (1/n)Σf(xᵢ)"),
            QuestionOption(id: "b", textEN: "A gambling strategy", textID: "Strategi judi"),
            QuestionOption(id: "c", textEN: "Exact integration", textID: "Integrasi eksak"),
            QuestionOption(id: "d", textEN: "A neural network architecture", textID: "Arsitektur neural network")
        ],
        correctOptionId: "a",
        explanationEN: "Monte Carlo estimates E[f(X)] = ∫f(x)p(x)dx by sampling xᵢ ~ p(x) and computing (1/n)Σf(xᵢ). By LLN, this converges to the true expectation. Used when integrals are intractable.",
        explanationID: "Monte Carlo mengestimasi E[f(X)] = ∫f(x)p(x)dx dengan sampling xᵢ ~ p(x) dan menghitung (1/n)Σf(xᵢ). Dengan LLN, ini konvergen ke ekspektasi sebenarnya. Digunakan ketika integral intractable.",
        topic: "mathematics",
        difficulty: .advanced
    )
]
