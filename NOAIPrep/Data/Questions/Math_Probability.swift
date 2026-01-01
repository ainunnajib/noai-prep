import Foundation

// MARK: - Probability Questions (50 questions)
extension NOAIQuestionBank {
    var probabilityQuestions: [Question] {
        [
            // Batch 1: Questions 1-10
            Question(
                id: "prob001",
                questionEN: "What is P(A ∪ B) for mutually exclusive events?",
                questionID: "Berapa P(A ∪ B) untuk kejadian yang saling eksklusif?",
                options: [
                    QuestionOption(id: "a", textEN: "P(A) × P(B)", textID: "P(A) × P(B)"),
                    QuestionOption(id: "b", textEN: "P(A) + P(B)", textID: "P(A) + P(B)"),
                    QuestionOption(id: "c", textEN: "P(A) + P(B) - P(A∩B)", textID: "P(A) + P(B) - P(A∩B)"),
                    QuestionOption(id: "d", textEN: "P(A) / P(B)", textID: "P(A) / P(B)")
                ],
                correctOptionId: "b",
                explanationEN: "For mutually exclusive events, P(A∩B) = 0, so P(A∪B) = P(A) + P(B).",
                explanationID: "Untuk kejadian saling eksklusif, P(A∩B) = 0, jadi P(A∪B) = P(A) + P(B).",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "prob002",
                questionEN: "What is Bayes' theorem?",
                questionID: "Apa teorema Bayes?",
                options: [
                    QuestionOption(id: "a", textEN: "P(A|B) = P(B|A)P(A)/P(B)", textID: "P(A|B) = P(B|A)P(A)/P(B)"),
                    QuestionOption(id: "b", textEN: "P(A|B) = P(A)P(B)", textID: "P(A|B) = P(A)P(B)"),
                    QuestionOption(id: "c", textEN: "P(A|B) = P(A) + P(B)", textID: "P(A|B) = P(A) + P(B)"),
                    QuestionOption(id: "d", textEN: "P(A|B) = P(A)/P(B)", textID: "P(A|B) = P(A)/P(B)")
                ],
                correctOptionId: "a",
                explanationEN: "Bayes' theorem: P(A|B) = P(B|A)P(A)/P(B). Fundamental for updating beliefs with new evidence.",
                explanationID: "Teorema Bayes: P(A|B) = P(B|A)P(A)/P(B). Fundamental untuk memperbarui keyakinan dengan bukti baru.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob003",
                questionEN: "What is the expected value E[X] of a discrete random variable?",
                questionID: "Berapa nilai ekspektasi E[X] dari variabel acak diskrit?",
                options: [
                    QuestionOption(id: "a", textEN: "Σ xᵢ × P(xᵢ)", textID: "Σ xᵢ × P(xᵢ)"),
                    QuestionOption(id: "b", textEN: "Σ P(xᵢ)", textID: "Σ P(xᵢ)"),
                    QuestionOption(id: "c", textEN: "max(xᵢ)", textID: "max(xᵢ)"),
                    QuestionOption(id: "d", textEN: "Σ xᵢ / n", textID: "Σ xᵢ / n")
                ],
                correctOptionId: "a",
                explanationEN: "Expected value E[X] = Σ xᵢ × P(xᵢ), the probability-weighted average of all possible values.",
                explanationID: "Nilai ekspektasi E[X] = Σ xᵢ × P(xᵢ), rata-rata tertimbang probabilitas dari semua nilai yang mungkin.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob004",
                questionEN: "What is the variance Var(X)?",
                questionID: "Apa itu variance Var(X)?",
                options: [
                    QuestionOption(id: "a", textEN: "E[X²] - (E[X])²", textID: "E[X²] - (E[X])²"),
                    QuestionOption(id: "b", textEN: "E[X] - E[X²]", textID: "E[X] - E[X²]"),
                    QuestionOption(id: "c", textEN: "(E[X])²", textID: "(E[X])²"),
                    QuestionOption(id: "d", textEN: "E[X]/n", textID: "E[X]/n")
                ],
                correctOptionId: "a",
                explanationEN: "Var(X) = E[X²] - (E[X])² = E[(X - μ)²]. Measures spread around the mean.",
                explanationID: "Var(X) = E[X²] - (E[X])² = E[(X - μ)²]. Mengukur penyebaran di sekitar mean.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob005",
                questionEN: "What is the standard deviation?",
                questionID: "Apa itu standar deviasi?",
                options: [
                    QuestionOption(id: "a", textEN: "Variance squared", textID: "Variance kuadrat"),
                    QuestionOption(id: "b", textEN: "Square root of variance", textID: "Akar kuadrat dari variance"),
                    QuestionOption(id: "c", textEN: "Mean squared", textID: "Mean kuadrat"),
                    QuestionOption(id: "d", textEN: "Variance divided by n", textID: "Variance dibagi n")
                ],
                correctOptionId: "b",
                explanationEN: "Standard deviation σ = √Var(X). It's in the same units as the original data.",
                explanationID: "Standar deviasi σ = √Var(X). Dalam satuan yang sama dengan data asli.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "prob006",
                questionEN: "For a normal distribution N(μ, σ²), approximately what % of data is within μ ± σ?",
                questionID: "Untuk distribusi normal N(μ, σ²), kira-kira berapa % data dalam μ ± σ?",
                options: [
                    QuestionOption(id: "a", textEN: "50%", textID: "50%"),
                    QuestionOption(id: "b", textEN: "68%", textID: "68%"),
                    QuestionOption(id: "c", textEN: "95%", textID: "95%"),
                    QuestionOption(id: "d", textEN: "99.7%", textID: "99.7%")
                ],
                correctOptionId: "b",
                explanationEN: "68-95-99.7 rule: ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ.",
                explanationID: "Aturan 68-95-99.7: ~68% dalam 1σ, ~95% dalam 2σ, ~99.7% dalam 3σ.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "prob007",
                questionEN: "What is a Bernoulli distribution?",
                questionID: "Apa itu distribusi Bernoulli?",
                options: [
                    QuestionOption(id: "a", textEN: "Distribution with two outcomes (success/failure)", textID: "Distribusi dengan dua hasil (sukses/gagal)"),
                    QuestionOption(id: "b", textEN: "Distribution of means", textID: "Distribusi mean"),
                    QuestionOption(id: "c", textEN: "Continuous distribution", textID: "Distribusi kontinu"),
                    QuestionOption(id: "d", textEN: "Distribution over integers", textID: "Distribusi atas integer")
                ],
                correctOptionId: "a",
                explanationEN: "Bernoulli distribution: P(X=1) = p, P(X=0) = 1-p. Single trial with two outcomes.",
                explanationID: "Distribusi Bernoulli: P(X=1) = p, P(X=0) = 1-p. Percobaan tunggal dengan dua hasil.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "prob008",
                questionEN: "The binomial distribution models:",
                questionID: "Distribusi binomial memodelkan:",
                options: [
                    QuestionOption(id: "a", textEN: "Number of successes in n independent Bernoulli trials", textID: "Jumlah sukses dalam n percobaan Bernoulli independen"),
                    QuestionOption(id: "b", textEN: "Time until first success", textID: "Waktu sampai sukses pertama"),
                    QuestionOption(id: "c", textEN: "Number of events in fixed time", textID: "Jumlah kejadian dalam waktu tetap"),
                    QuestionOption(id: "d", textEN: "Continuous random variable", textID: "Variabel acak kontinu")
                ],
                correctOptionId: "a",
                explanationEN: "Binomial(n,p): number of successes in n independent trials, each with probability p.",
                explanationID: "Binomial(n,p): jumlah sukses dalam n percobaan independen, masing-masing dengan probabilitas p.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob009",
                questionEN: "What does the Poisson distribution model?",
                questionID: "Apa yang dimodelkan distribusi Poisson?",
                options: [
                    QuestionOption(id: "a", textEN: "Number of events in a fixed interval given average rate", textID: "Jumlah kejadian dalam interval tetap dengan rata-rata tertentu"),
                    QuestionOption(id: "b", textEN: "Continuous probability", textID: "Probabilitas kontinu"),
                    QuestionOption(id: "c", textEN: "Success/failure outcomes", textID: "Hasil sukses/gagal"),
                    QuestionOption(id: "d", textEN: "Normal distribution", textID: "Distribusi normal")
                ],
                correctOptionId: "a",
                explanationEN: "Poisson(λ): counts number of events in interval when events occur at constant average rate λ.",
                explanationID: "Poisson(λ): menghitung jumlah kejadian dalam interval ketika kejadian terjadi pada rata-rata konstan λ.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob010",
                questionEN: "What is conditional probability P(A|B)?",
                questionID: "Apa itu probabilitas kondisional P(A|B)?",
                options: [
                    QuestionOption(id: "a", textEN: "Probability of A given that B occurred", textID: "Probabilitas A dengan syarat B terjadi"),
                    QuestionOption(id: "b", textEN: "Probability of A and B", textID: "Probabilitas A dan B"),
                    QuestionOption(id: "c", textEN: "Probability of A or B", textID: "Probabilitas A atau B"),
                    QuestionOption(id: "d", textEN: "Probability of A times B", textID: "Probabilitas A kali B")
                ],
                correctOptionId: "a",
                explanationEN: "P(A|B) = P(A∩B)/P(B). The probability of A occurring given that B has already occurred.",
                explanationID: "P(A|B) = P(A∩B)/P(B). Probabilitas A terjadi dengan syarat B sudah terjadi.",
                topic: "mathematics",
                difficulty: .beginner
            ),
            // Batch 2: Questions 11-20
            Question(
                id: "prob011",
                questionEN: "Two events are independent if:",
                questionID: "Dua kejadian adalah independen jika:",
                options: [
                    QuestionOption(id: "a", textEN: "P(A∩B) = P(A) × P(B)", textID: "P(A∩B) = P(A) × P(B)"),
                    QuestionOption(id: "b", textEN: "P(A∩B) = 0", textID: "P(A∩B) = 0"),
                    QuestionOption(id: "c", textEN: "P(A) = P(B)", textID: "P(A) = P(B)"),
                    QuestionOption(id: "d", textEN: "P(A|B) = 0", textID: "P(A|B) = 0")
                ],
                correctOptionId: "a",
                explanationEN: "Independent events: P(A∩B) = P(A)×P(B), or equivalently P(A|B) = P(A).",
                explanationID: "Kejadian independen: P(A∩B) = P(A)×P(B), atau ekuivalen P(A|B) = P(A).",
                topic: "mathematics",
                difficulty: .beginner
            ),
            Question(
                id: "prob012",
                questionEN: "What is the law of total probability?",
                questionID: "Apa hukum probabilitas total?",
                options: [
                    QuestionOption(id: "a", textEN: "P(A) = Σ P(A|Bᵢ)P(Bᵢ) for partition {Bᵢ}", textID: "P(A) = Σ P(A|Bᵢ)P(Bᵢ) untuk partisi {Bᵢ}"),
                    QuestionOption(id: "b", textEN: "P(A) = 1 - P(A')", textID: "P(A) = 1 - P(A')"),
                    QuestionOption(id: "c", textEN: "P(A) + P(B) = 1", textID: "P(A) + P(B) = 1"),
                    QuestionOption(id: "d", textEN: "P(A) = P(B)", textID: "P(A) = P(B)")
                ],
                correctOptionId: "a",
                explanationEN: "Law of total probability: P(A) = Σ P(A|Bᵢ)P(Bᵢ) where {Bᵢ} is a partition of sample space.",
                explanationID: "Hukum probabilitas total: P(A) = Σ P(A|Bᵢ)P(Bᵢ) dimana {Bᵢ} adalah partisi ruang sampel.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob013",
                questionEN: "What is the covariance Cov(X,Y)?",
                questionID: "Apa itu kovarian Cov(X,Y)?",
                options: [
                    QuestionOption(id: "a", textEN: "E[XY] - E[X]E[Y]", textID: "E[XY] - E[X]E[Y]"),
                    QuestionOption(id: "b", textEN: "E[X] + E[Y]", textID: "E[X] + E[Y]"),
                    QuestionOption(id: "c", textEN: "Var(X) + Var(Y)", textID: "Var(X) + Var(Y)"),
                    QuestionOption(id: "d", textEN: "E[X]/E[Y]", textID: "E[X]/E[Y]")
                ],
                correctOptionId: "a",
                explanationEN: "Cov(X,Y) = E[XY] - E[X]E[Y] = E[(X-μₓ)(Y-μᵧ)]. Measures linear relationship.",
                explanationID: "Cov(X,Y) = E[XY] - E[X]E[Y] = E[(X-μₓ)(Y-μᵧ)]. Mengukur hubungan linear.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob014",
                questionEN: "What is the correlation coefficient ρ?",
                questionID: "Apa koefisien korelasi ρ?",
                options: [
                    QuestionOption(id: "a", textEN: "Cov(X,Y) / (σₓσᵧ)", textID: "Cov(X,Y) / (σₓσᵧ)"),
                    QuestionOption(id: "b", textEN: "Cov(X,Y) × σₓσᵧ", textID: "Cov(X,Y) × σₓσᵧ"),
                    QuestionOption(id: "c", textEN: "Var(X) / Var(Y)", textID: "Var(X) / Var(Y)"),
                    QuestionOption(id: "d", textEN: "E[X] × E[Y]", textID: "E[X] × E[Y]")
                ],
                correctOptionId: "a",
                explanationEN: "Correlation ρ = Cov(X,Y)/(σₓσᵧ). Normalized to [-1, 1]. Measures linear relationship strength.",
                explanationID: "Korelasi ρ = Cov(X,Y)/(σₓσᵧ). Dinormalisasi ke [-1, 1]. Mengukur kekuatan hubungan linear.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob015",
                questionEN: "What is a probability density function (PDF)?",
                questionID: "Apa itu fungsi kepadatan probabilitas (PDF)?",
                options: [
                    QuestionOption(id: "a", textEN: "Function where area under curve = probability for continuous variables", textID: "Fungsi dimana luas di bawah kurva = probabilitas untuk variabel kontinu"),
                    QuestionOption(id: "b", textEN: "Same as probability mass function", textID: "Sama dengan fungsi massa probabilitas"),
                    QuestionOption(id: "c", textEN: "Cumulative distribution function", textID: "Fungsi distribusi kumulatif"),
                    QuestionOption(id: "d", textEN: "The mean of the distribution", textID: "Mean dari distribusi")
                ],
                correctOptionId: "a",
                explanationEN: "PDF f(x) for continuous variables: P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx. Area under curve gives probability.",
                explanationID: "PDF f(x) untuk variabel kontinu: P(a ≤ X ≤ b) = ∫ₐᵇ f(x)dx. Luas di bawah kurva memberikan probabilitas.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob016",
                questionEN: "What is the CDF (Cumulative Distribution Function)?",
                questionID: "Apa itu CDF (Fungsi Distribusi Kumulatif)?",
                options: [
                    QuestionOption(id: "a", textEN: "F(x) = P(X ≤ x)", textID: "F(x) = P(X ≤ x)"),
                    QuestionOption(id: "b", textEN: "F(x) = P(X = x)", textID: "F(x) = P(X = x)"),
                    QuestionOption(id: "c", textEN: "F(x) = P(X > x)", textID: "F(x) = P(X > x)"),
                    QuestionOption(id: "d", textEN: "F(x) = E[X]", textID: "F(x) = E[X]")
                ],
                correctOptionId: "a",
                explanationEN: "CDF F(x) = P(X ≤ x). It's non-decreasing, ranges from 0 to 1, and F'(x) = f(x) (the PDF).",
                explanationID: "CDF F(x) = P(X ≤ x). Non-decreasing, rentang 0 sampai 1, dan F'(x) = f(x) (PDF).",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob017",
                questionEN: "For exponential distribution Exp(λ), what is E[X]?",
                questionID: "Untuk distribusi eksponensial Exp(λ), berapa E[X]?",
                options: [
                    QuestionOption(id: "a", textEN: "1/λ", textID: "1/λ"),
                    QuestionOption(id: "b", textEN: "λ", textID: "λ"),
                    QuestionOption(id: "c", textEN: "λ²", textID: "λ²"),
                    QuestionOption(id: "d", textEN: "e^λ", textID: "e^λ")
                ],
                correctOptionId: "a",
                explanationEN: "Exponential distribution: E[X] = 1/λ, Var(X) = 1/λ². Models time between events.",
                explanationID: "Distribusi eksponensial: E[X] = 1/λ, Var(X) = 1/λ². Memodelkan waktu antar kejadian.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob018",
                questionEN: "What is the Central Limit Theorem (CLT)?",
                questionID: "Apa Teorema Limit Pusat (CLT)?",
                options: [
                    QuestionOption(id: "a", textEN: "Sample means approach normal distribution as n→∞", textID: "Mean sampel mendekati distribusi normal saat n→∞"),
                    QuestionOption(id: "b", textEN: "All distributions are normal", textID: "Semua distribusi adalah normal"),
                    QuestionOption(id: "c", textEN: "Variance decreases with sample size", textID: "Variance menurun dengan ukuran sampel"),
                    QuestionOption(id: "d", textEN: "Probabilities sum to 1", textID: "Probabilitas berjumlah 1")
                ],
                correctOptionId: "a",
                explanationEN: "CLT: The distribution of sample means approaches normal as sample size increases, regardless of population distribution.",
                explanationID: "CLT: Distribusi mean sampel mendekati normal saat ukuran sampel meningkat, terlepas dari distribusi populasi.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
            Question(
                id: "prob019",
                questionEN: "What is maximum likelihood estimation (MLE)?",
                questionID: "Apa itu estimasi maximum likelihood (MLE)?",
                options: [
                    QuestionOption(id: "a", textEN: "Finding parameters that maximize probability of observed data", textID: "Menemukan parameter yang memaksimalkan probabilitas data yang diamati"),
                    QuestionOption(id: "b", textEN: "Finding the most likely outcome", textID: "Menemukan hasil paling mungkin"),
                    QuestionOption(id: "c", textEN: "Maximizing the variance", textID: "Memaksimalkan variance"),
                    QuestionOption(id: "d", textEN: "Minimizing the mean", textID: "Meminimalkan mean")
                ],
                correctOptionId: "a",
                explanationEN: "MLE finds parameter θ that maximizes L(θ|data) = P(data|θ). Common estimation method in ML.",
                explanationID: "MLE menemukan parameter θ yang memaksimalkan L(θ|data) = P(data|θ). Metode estimasi umum dalam ML.",
                topic: "mathematics",
                difficulty: .advanced
            ),
            Question(
                id: "prob020",
                questionEN: "What is a prior probability in Bayesian inference?",
                questionID: "Apa probabilitas prior dalam inferensi Bayesian?",
                options: [
                    QuestionOption(id: "a", textEN: "Probability before observing evidence", textID: "Probabilitas sebelum mengamati bukti"),
                    QuestionOption(id: "b", textEN: "Probability after observing evidence", textID: "Probabilitas setelah mengamati bukti"),
                    QuestionOption(id: "c", textEN: "The likelihood function", textID: "Fungsi likelihood"),
                    QuestionOption(id: "d", textEN: "The evidence probability", textID: "Probabilitas bukti")
                ],
                correctOptionId: "a",
                explanationEN: "Prior P(θ) represents our belief about parameter before seeing data. Updated to posterior after evidence.",
                explanationID: "Prior P(θ) mewakili keyakinan kita tentang parameter sebelum melihat data. Diperbarui ke posterior setelah bukti.",
                topic: "mathematics",
                difficulty: .intermediate
            ),
        ]
    }
}
