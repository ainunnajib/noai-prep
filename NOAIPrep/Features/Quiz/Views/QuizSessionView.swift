import SwiftUI

struct QuizSessionView: View {
    let mode: QuizHomeView.QuizMode
    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss

    @State private var questions: [Question] = []
    @State private var currentIndex = 0
    @State private var selectedAnswers: [String: String] = [:]
    @State private var showResults = false
    @State private var timeRemaining: TimeInterval = 2.5 * 60 * 60 // 2.5 hours
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
            VStack(spacing: 0) {
                // Progress Bar
                ProgressView(value: progress)
                    .tint(.primaryBlue)

                // Timer (for timed mode)
                if mode == .timed {
                    TimerView(timeRemaining: $timeRemaining)
                        .padding()
                }

                // Question Content
                if let question = currentQuestion {
                    ScrollView {
                        QuestionView(
                            question: question,
                            selectedAnswerId: selectedAnswers[question.id],
                            onSelect: { answerId in
                                selectedAnswers[question.id] = answerId
                            }
                        )
                        .padding()
                    }
                }

                Spacer()

                // Navigation Buttons
                navigationButtons
            }
            .navigationTitle("\(currentIndex + 1) / \(questions.count)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Text(languageManager.localized("exit", en: "Exit", id: "Keluar"))
                    }
                }
            }
            .fullScreenCover(isPresented: $showResults) {
                ResultsView(
                    questions: questions,
                    answers: selectedAnswers,
                    timeTaken: (2.5 * 60 * 60) - timeRemaining
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

    private var navigationButtons: some View {
        HStack(spacing: 16) {
            // Previous Button
            Button {
                if currentIndex > 0 {
                    currentIndex -= 1
                }
            } label: {
                Label(
                    languageManager.localized("prev", en: "Previous", id: "Sebelumnya"),
                    systemImage: "chevron.left"
                )
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.secondaryBackground)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(currentIndex == 0)

            // Next / Submit Button
            if currentIndex < questions.count - 1 {
                Button {
                    currentIndex += 1
                } label: {
                    Label(
                        languageManager.localized("next", en: "Next", id: "Selanjutnya"),
                        systemImage: "chevron.right"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            } else {
                Button {
                    timer?.invalidate()
                    showResults = true
                } label: {
                    Text(languageManager.localized("submit", en: "Submit", id: "Kirim"))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.primaryGreen)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
    }

    private func loadQuestions() {
        questions = ContentLoader.shared.loadQuestions()
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if timeRemaining > 0 {
                timeRemaining -= 1
            } else {
                timer?.invalidate()
                showResults = true
            }
        }
    }
}

// MARK: - Timer View
struct TimerView: View {
    @Binding var timeRemaining: TimeInterval

    var formattedTime: String {
        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60
        let seconds = Int(timeRemaining) % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }

    var timerColor: Color {
        if timeRemaining < 300 { // Less than 5 minutes
            return .primaryRed
        } else if timeRemaining < 900 { // Less than 15 minutes
            return .primaryOrange
        }
        return .primaryBlue
    }

    var body: some View {
        HStack {
            Image(systemName: "timer")
            Text(formattedTime)
                .font(.system(.headline, design: .monospaced))
        }
        .foregroundStyle(timerColor)
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(timerColor.opacity(0.15))
        .clipShape(Capsule())
    }
}

// MARK: - Question View
struct QuestionView: View {
    let question: Question
    let selectedAnswerId: String?
    let onSelect: (String) -> Void
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Question Text
            Text(question.localizedQuestion(languageManager.currentLanguage))
                .font(.title3)
                .fontWeight(.medium)

            // Options
            VStack(spacing: 12) {
                ForEach(question.options) { option in
                    OptionButton(
                        option: option,
                        isSelected: selectedAnswerId == option.id,
                        onSelect: { onSelect(option.id) }
                    )
                }
            }
        }
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
            HStack {
                // Option letter
                Text(option.id.uppercased())
                    .font(.headline)
                    .foregroundStyle(isSelected ? .white : .primary)
                    .frame(width: 36, height: 36)
                    .background(isSelected ? Color.primaryBlue : Color.secondaryBackground)
                    .clipShape(Circle())

                // Option text
                Text(option.localizedText(languageManager.currentLanguage))
                    .font(.body)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)

                Spacer()
            }
            .padding()
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.primaryBlue : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    QuizSessionView(mode: .practice)
        .environmentObject(LanguageManager())
}
