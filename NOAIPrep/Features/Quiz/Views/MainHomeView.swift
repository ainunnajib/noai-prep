import SwiftUI
import SwiftData

struct MainHomeView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \QuizResult.completedAt, order: .reverse) private var quizResults: [QuizResult]

    @State private var showQuizSession = false
    @State private var showSettings = false
    @State private var selectedMode: QuizMode = .practice
    @State private var selectedCategory: NOAICategory? = nil

    var averageScore: Int {
        guard !quizResults.isEmpty else { return 0 }
        let total = quizResults.reduce(0) { $0 + $1.score }
        let totalQuestions = quizResults.reduce(0) { $0 + $1.totalQuestions }
        guard totalQuestions > 0 else { return 0 }
        return Int(Double(total) / Double(totalQuestions) * 100)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header with Settings
                headerSection

                // Stats Section
                statsSection

                // Quick Start Button
                quickStartSection

                // Category Selection
                categorySection

                // Quiz Mode Selection
                modeSection

                // Recent Results
                recentResultsSection
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(Color(.systemGroupedBackground))
        .navigationBarHidden(true)
        .fullScreenCover(isPresented: $showQuizSession) {
            QuizSessionView(mode: selectedMode, category: selectedCategory)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
    }

    // MARK: - Header Section
    private var headerSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(languageManager.localized("welcome", en: "NOAI Prep", id: "NOAI Prep"))
                    .font(.heroTitle)
                    .foregroundStyle(.primary)

                Text(languageManager.localized("tagline", en: "Master AI Olympiad", id: "Kuasai Olimpiade AI"))
                    .font(.bodyMedium)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                showSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.title2)
                    .foregroundStyle(Color.brandPrimary)
                    .frame(width: 44, height: 44)
                    .background(Color.brandPrimary.opacity(0.1))
                    .clipShape(Circle())
            }
        }
        .padding(.top, 16)
    }

    // MARK: - Stats Section
    private var statsSection: some View {
        HStack(spacing: 12) {
            StatBox(
                icon: "checkmark.seal.fill",
                value: "\(quizResults.count)",
                label: languageManager.localized("quizzes", en: "Quizzes", id: "Kuis"),
                color: .brandPrimary
            )

            StatBox(
                icon: "chart.line.uptrend.xyaxis",
                value: "\(averageScore)%",
                label: languageManager.localized("avg_score", en: "Avg Score", id: "Rata-rata"),
                color: .success
            )

            StatBox(
                icon: "flame.fill",
                value: "\(calculateStreak())",
                label: languageManager.localized("streak", en: "Streak", id: "Streak"),
                color: .warning
            )
        }
    }

    // MARK: - Quick Start Section
    private var quickStartSection: some View {
        Button {
            showQuizSession = true
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(languageManager.localized("start_quiz", en: "Start Quiz", id: "Mulai Kuis"))
                        .font(.cardTitle)

                    Text(selectedMode == .practice ?
                         languageManager.localized("practice_desc", en: "20 questions, no time limit", id: "20 soal, tanpa batas waktu") :
                         languageManager.localized("timed_desc", en: "45 questions, 2.5 hours", id: "45 soal, 2.5 jam"))
                        .font(.caption)
                        .opacity(0.8)
                }

                Spacer()

                Image(systemName: "play.circle.fill")
                    .font(.system(size: 44))
            }
            .foregroundStyle(.white)
            .padding(20)
            .background(Color.heroGradient)
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .shadow(color: Color.brandPrimary.opacity(0.3), radius: 16, x: 0, y: 8)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Category Section
    private var categorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("categories", en: "Categories", id: "Kategori"))
                .font(.sectionTitle)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    CategoryChip(
                        title: languageManager.localized("all", en: "All", id: "Semua"),
                        icon: "square.grid.2x2",
                        color: .brandPrimary,
                        isSelected: selectedCategory == nil
                    ) {
                        withAnimation { selectedCategory = nil }
                    }

                    CategoryChip(
                        title: languageManager.localized("math", en: "Math", id: "Matematika"),
                        icon: "function",
                        color: .categoryMath,
                        isSelected: selectedCategory == .mathematics
                    ) {
                        withAnimation { selectedCategory = .mathematics }
                    }

                    CategoryChip(
                        title: languageManager.localized("computing", en: "Computing", id: "Komputasi"),
                        icon: "chevron.left.forwardslash.chevron.right",
                        color: .categoryComputing,
                        isSelected: selectedCategory == .computing
                    ) {
                        withAnimation { selectedCategory = .computing }
                    }

                    CategoryChip(
                        title: languageManager.localized("ai_ml", en: "AI/ML", id: "AI/ML"),
                        icon: "brain.head.profile",
                        color: .categoryAI,
                        isSelected: selectedCategory == .aiMlDl
                    ) {
                        withAnimation { selectedCategory = .aiMlDl }
                    }

                    CategoryChip(
                        title: languageManager.localized("problem", en: "Problem", id: "Problem"),
                        icon: "puzzlepiece.fill",
                        color: .categoryProblem,
                        isSelected: selectedCategory == .problemSolving
                    ) {
                        withAnimation { selectedCategory = .problemSolving }
                    }
                }
                .padding(.horizontal, 2)
            }
        }
    }

    // MARK: - Mode Section
    private var modeSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("mode", en: "Quiz Mode", id: "Mode Kuis"))
                .font(.sectionTitle)

            HStack(spacing: 12) {
                ModeCard(
                    mode: .practice,
                    isSelected: selectedMode == .practice,
                    action: { withAnimation { selectedMode = .practice } }
                )

                ModeCard(
                    mode: .timed,
                    isSelected: selectedMode == .timed,
                    action: { withAnimation { selectedMode = .timed } }
                )
            }
        }
    }

    // MARK: - Recent Results Section
    private var recentResultsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("recent", en: "Recent Results", id: "Hasil Terbaru"))
                .font(.sectionTitle)

            if quizResults.isEmpty {
                emptyResultsView
            } else {
                VStack(spacing: 8) {
                    ForEach(quizResults.prefix(3)) { result in
                        RecentResultRow(result: result)
                    }
                }
            }
        }
    }

    private var emptyResultsView: some View {
        VStack(spacing: 12) {
            Image(systemName: "chart.bar.doc.horizontal")
                .font(.system(size: 40))
                .foregroundStyle(Color.textTertiary)

            Text(languageManager.localized("no_results", en: "No quiz results yet", id: "Belum ada hasil kuis"))
                .font(.bodyMedium)
                .foregroundStyle(.secondary)

            Text(languageManager.localized("start_first", en: "Start your first quiz!", id: "Mulai kuis pertamamu!"))
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func calculateStreak() -> Int {
        guard !quizResults.isEmpty else { return 0 }
        let calendar = Calendar.current
        var streak = 0
        var checkDate = Date()

        for result in quizResults {
            if calendar.isDate(result.completedAt, inSameDayAs: checkDate) {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else if calendar.isDate(result.completedAt, inSameDayAs: calendar.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate) {
                checkDate = result.completedAt
                streak += 1
            } else {
                break
            }
        }
        return max(streak, quizResults.isEmpty ? 0 : 1)
    }
}

// MARK: - Quiz Mode Enum
enum QuizMode: String, CaseIterable {
    case practice
    case timed

    func title(for language: AppLanguage) -> String {
        switch self {
        case .practice:
            return language == .english ? "Practice" : "Latihan"
        case .timed:
            return language == .english ? "Timed" : "Waktu"
        }
    }

    func description(for language: AppLanguage) -> String {
        switch self {
        case .practice:
            return language == .english ? "20 questions, no limit" : "20 soal, tanpa batas"
        case .timed:
            return language == .english ? "45 questions, 2.5 hrs" : "45 soal, 2.5 jam"
        }
    }

    var iconName: String {
        switch self {
        case .practice: return "book.closed.fill"
        case .timed: return "timer"
        }
    }

    var color: Color {
        switch self {
        case .practice: return .success
        case .timed: return .warning
        }
    }

    var questionCount: Int {
        switch self {
        case .practice: return 20
        case .timed: return 45
        }
    }
}

// MARK: - Stat Box Component
struct StatBox: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(color.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Category Chip Component
struct CategoryChip: View {
    let title: String
    let icon: String
    let color: Color
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 14, weight: .semibold))

                Text(title)
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
            }
            .foregroundStyle(isSelected ? .white : color)
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isSelected ? color : color.opacity(0.12))
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .scaleEffect(isSelected ? 1.02 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
    }
}

// MARK: - Mode Card Component
struct ModeCard: View {
    let mode: QuizMode
    let isSelected: Bool
    let action: () -> Void
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                Image(systemName: mode.iconName)
                    .font(.system(size: 28))
                    .foregroundStyle(isSelected ? .white : mode.color)
                    .frame(width: 56, height: 56)
                    .background(isSelected ? mode.color : mode.color.opacity(0.12))
                    .clipShape(Circle())

                VStack(spacing: 4) {
                    Text(mode.title(for: languageManager.currentLanguage))
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                        .foregroundStyle(.primary)

                    Text(mode.description(for: languageManager.currentLanguage))
                        .font(.system(size: 12, design: .rounded))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(isSelected ? mode.color : Color.clear, lineWidth: 2)
            )
            .shadow(color: isSelected ? mode.color.opacity(0.2) : .black.opacity(0.04), radius: isSelected ? 12 : 8, x: 0, y: 4)
        }
        .buttonStyle(.plain)
        .scaleEffect(isSelected ? 0.98 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
    }
}

// MARK: - Recent Result Row
struct RecentResultRow: View {
    let result: QuizResult
    @EnvironmentObject var languageManager: LanguageManager

    var scoreColor: Color {
        let percentage = Double(result.score) / Double(result.totalQuestions) * 100
        if percentage >= 80 { return .success }
        if percentage >= 60 { return .warning }
        return .error
    }

    var body: some View {
        HStack(spacing: 12) {
            // Score Badge
            Text("\(Int(Double(result.score) / Double(result.totalQuestions) * 100))%")
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(width: 52, height: 52)
                .background(scoreColor)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text("\(result.score)/\(result.totalQuestions) " +
                     languageManager.localized("correct", en: "correct", id: "benar"))
                    .font(.system(size: 15, weight: .medium, design: .rounded))

                Text(result.completedAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            // Mode indicator
            Image(systemName: result.quizType == "practice" ? "book.closed.fill" : "timer")
                .font(.system(size: 16))
                .foregroundStyle(.tertiary)
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

#Preview {
    NavigationStack {
        MainHomeView()
    }
    .environmentObject(LanguageManager())
}
