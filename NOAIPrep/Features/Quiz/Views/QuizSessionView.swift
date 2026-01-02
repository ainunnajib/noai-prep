import SwiftUI
import SwiftData

struct QuizSessionView: View {
    let mode: QuizMode
    let category: NOAICategory?

    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext

    @State private var questions: [Question] = []
    @State private var currentIndex = 0
    @State private var selectedAnswers: [String: String] = [:]
    @State private var showResults = false
    @State private var showExitConfirm = false
    @State private var timeRemaining: TimeInterval = 2.5 * 60 * 60
    @State private var timer: Timer?

    var currentQuestion: Question? {
        guard currentIndex < questions.count else { return nil }
        return questions[currentIndex]
    }

    var progress: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(currentIndex + 1) / Double(questions.count)
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Progress Header
                    progressHeader

                    // Question Content
                    if let question = currentQuestion {
                        ScrollView {
                            VStack(spacing: 24) {
                                questionCard(question)
                                optionsView(question)
                            }
                            .padding(20)
                        }
                    }

                    Spacer()

                    // Navigation
                    navigationButtons
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showExitConfirm = true
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .frame(width: 36, height: 36)
                            .background(Color(.systemBackground))
                            .clipShape(Circle())
                    }
                }

                ToolbarItem(placement: .principal) {
                    Text("\(currentIndex + 1) / \(questions.count)")
                        .font(.system(size: 16, weight: .semibold, design: .rounded))
                }

                if mode == .timed {
                    ToolbarItem(placement: .topBarTrailing) {
                        timerBadge
                    }
                }
            }
            .alert(
                languageManager.localized("exit_quiz", en: "Exit Quiz?", id: "Keluar Kuis?"),
                isPresented: $showExitConfirm
            ) {
                Button(languageManager.localized("cancel", en: "Cancel", id: "Batal"), role: .cancel) {}
                Button(languageManager.localized("exit", en: "Exit", id: "Keluar"), role: .destructive) {
                    timer?.invalidate()
                    dismiss()
                }
            } message: {
                Text(languageManager.localized("exit_warning", en: "Your progress will be lost.", id: "Progresmu akan hilang."))
            }
            .fullScreenCover(isPresented: $showResults) {
                ResultsView(
                    questions: questions,
                    answers: selectedAnswers,
                    timeTaken: (2.5 * 60 * 60) - timeRemaining,
                    mode: mode
                )
            }
        }
        .onAppear {
            loadQuestions()
            if mode == .timed {
                startTimer()
            }
        }
        .onDisappear {
            timer?.invalidate()
        }
    }

    // MARK: - Progress Header
    private var progressHeader: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Rectangle()
                    .fill(Color.brandPrimary.opacity(0.1))

                Rectangle()
                    .fill(Color.heroGradient)
                    .frame(width: geometry.size.width * progress)
                    .animation(.spring(response: 0.4, dampingFraction: 0.8), value: progress)
            }
        }
        .frame(height: 4)
    }

    // MARK: - Timer Badge
    private var timerBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: "timer")
                .font(.system(size: 12, weight: .semibold))

            Text(formattedTime)
                .font(.system(size: 14, weight: .semibold, design: .monospaced))
        }
        .foregroundStyle(timerColor)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(timerColor.opacity(0.12))
        .clipShape(Capsule())
    }

    private var formattedTime: String {
        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }

    private var timerColor: Color {
        if timeRemaining < 300 { return .error }
        if timeRemaining < 900 { return .warning }
        return .brandPrimary
    }

    // MARK: - Question Card
    private func questionCard(_ question: Question) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Difficulty Badge
            HStack {
                Text(question.difficulty.displayName)
                    .font(.system(size: 12, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(question.difficulty.color)
                    .clipShape(Capsule())

                Spacer()

                Text(question.topic)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            // Question Text
            Text(question.localizedQuestion(languageManager.currentLanguage))
                .font(.system(size: 18, weight: .medium, design: .rounded))
                .foregroundStyle(.primary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.white.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - Options View
    private func optionsView(_ question: Question) -> some View {
        VStack(spacing: 12) {
            ForEach(question.options) { option in
                OptionButton(
                    option: option,
                    isSelected: selectedAnswers[question.id] == option.id,
                    onSelect: {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            selectedAnswers[question.id] = option.id
                        }
                    }
                )
            }
        }
    }

    // MARK: - Navigation Buttons
    private var navigationButtons: some View {
        HStack(spacing: 12) {
            // Previous Button
            Button {
                withAnimation {
                    if currentIndex > 0 {
                        currentIndex -= 1
                    }
                }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(currentIndex == 0 ? .tertiary : .primary)
                    .frame(width: 56, height: 56)
                    .background(Color(.systemBackground))
                    .clipShape(Circle())
                    .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
            }
            .disabled(currentIndex == 0)

            // Next / Submit Button
            if currentIndex < questions.count - 1 {
                Button {
                    withAnimation {
                        currentIndex += 1
                    }
                } label: {
                    HStack {
                        Text(languageManager.localized("next", en: "Next", id: "Lanjut"))
                        Image(systemName: "chevron.right")
                    }
                    .primaryButton()
                }
            } else {
                Button {
                    timer?.invalidate()
                    saveResult()
                    showResults = true
                } label: {
                    HStack {
                        Text(languageManager.localized("submit", en: "Submit", id: "Kirim"))
                        Image(systemName: "checkmark")
                    }
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(Color.successGradient)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .shadow(color: Color.success.opacity(0.3), radius: 12, x: 0, y: 6)
                }
            }
        }
        .padding(20)
        .background(Color(.systemBackground))
    }

    // MARK: - Functions
    private func loadQuestions() {
        let questionCount = mode.questionCount
        if let category = category {
            questions = NOAIQuestionBank.shared.getQuestions(for: category).shuffled().prefix(questionCount).map { $0 }
        } else {
            questions = ContentLoader.shared.loadQuestions(count: questionCount, randomized: true)
        }
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [self] _ in
            Task { @MainActor in
                if timeRemaining > 0 {
                    timeRemaining -= 1
                } else {
                    timer?.invalidate()
                    saveResult()
                    showResults = true
                }
            }
        }
    }

    private func saveResult() {
        let score = questions.filter { selectedAnswers[$0.id] == $0.correctOptionId }.count
        let result = QuizResult(
            quizType: mode.rawValue,
            score: score,
            totalQuestions: questions.count,
            timeTaken: (2.5 * 60 * 60) - timeRemaining,
            answers: selectedAnswers
        )
        modelContext.insert(result)
    }
}

// MARK: - Option Button
struct OptionButton: View {
    let option: QuestionOption
    let isSelected: Bool
    let onSelect: () -> Void
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 14) {
                // Letter Badge
                Text(option.id.uppercased())
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(isSelected ? .white : Color.brandPrimary)
                    .frame(width: 40, height: 40)
                    .background(isSelected ? Color.brandPrimary : Color.brandPrimary.opacity(0.1))
                    .clipShape(Circle())

                // Option Text
                Text(option.localizedText(languageManager.currentLanguage))
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer()

                // Checkmark
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(Color.brandPrimary)
                }
            }
            .padding(16)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(isSelected ? Color.brandPrimary : Color(.systemGray4), lineWidth: isSelected ? 2 : 1)
            )
            .shadow(color: isSelected ? Color.brandPrimary.opacity(0.15) : .black.opacity(0.03), radius: isSelected ? 8 : 4, x: 0, y: 2)
        }
        .buttonStyle(.plain)
        .scaleEffect(isSelected ? 0.98 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
    }
}

#Preview {
    QuizSessionView(mode: .practice, category: nil)
        .environmentObject(LanguageManager())
}
