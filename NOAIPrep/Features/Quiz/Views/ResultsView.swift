import SwiftUI

struct ResultsView: View {
    let questions: [Question]
    let answers: [String: String]
    let timeTaken: TimeInterval
    let mode: QuizMode

    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss
    @State private var showReview = false
    @State private var animateScore = false

    var score: Int {
        questions.filter { question in
            answers[question.id] == question.correctOptionId
        }.count
    }

    var percentage: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(score) / Double(questions.count) * 100
    }

    var formattedTime: String {
        let minutes = Int(timeTaken) / 60
        let seconds = Int(timeTaken) % 60
        if minutes >= 60 {
            let hours = minutes / 60
            let remainingMinutes = minutes % 60
            return String(format: "%dh %dm", hours, remainingMinutes)
        }
        return String(format: "%dm %ds", minutes, seconds)
    }

    var gradeColor: Color {
        if percentage >= 80 { return .success }
        if percentage >= 60 { return .warning }
        return .error
    }

    var body: some View {
        NavigationStack {
            ZStack {
                // Background
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 32) {
                        // Score Circle
                        scoreCircle
                            .padding(.top, 24)

                        // Stats Row
                        statsRow

                        // Message
                        messageSection

                        // Action Buttons
                        actionButtons
                    }
                    .padding(20)
                }
            }
            .navigationTitle(languageManager.localized("results", en: "Results", id: "Hasil"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .frame(width: 36, height: 36)
                            .background(Color(.systemBackground))
                            .clipShape(Circle())
                    }
                }
            }
            .sheet(isPresented: $showReview) {
                ReviewView(questions: questions, answers: answers)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.6).delay(0.2)) {
                animateScore = true
            }
        }
    }

    // MARK: - Score Circle
    private var scoreCircle: some View {
        ZStack {
            // Background Circle
            Circle()
                .stroke(gradeColor.opacity(0.15), lineWidth: 24)
                .frame(width: 200, height: 200)

            // Progress Circle
            Circle()
                .trim(from: 0, to: animateScore ? percentage / 100 : 0)
                .stroke(
                    gradeColor,
                    style: StrokeStyle(lineWidth: 24, lineCap: .round)
                )
                .frame(width: 200, height: 200)
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 1.0, dampingFraction: 0.7), value: animateScore)

            // Score Text
            VStack(spacing: 4) {
                Text("\(Int(percentage))%")
                    .font(.system(size: 52, weight: .bold, design: .rounded))
                    .foregroundStyle(gradeColor)

                Text("\(score)/\(questions.count)")
                    .font(.system(size: 18, weight: .medium, design: .rounded))
                    .foregroundStyle(.secondary)
            }
        }
        .shadow(color: gradeColor.opacity(0.2), radius: 20, x: 0, y: 10)
    }

    // MARK: - Stats Row
    private var statsRow: some View {
        HStack(spacing: 16) {
            ResultStatCard(
                icon: "checkmark.circle.fill",
                value: "\(score)",
                label: languageManager.localized("correct", en: "Correct", id: "Benar"),
                color: .success
            )

            ResultStatCard(
                icon: "xmark.circle.fill",
                value: "\(questions.count - score)",
                label: languageManager.localized("wrong", en: "Wrong", id: "Salah"),
                color: .error
            )

            ResultStatCard(
                icon: "clock.fill",
                value: formattedTime,
                label: languageManager.localized("time", en: "Time", id: "Waktu"),
                color: .brandPrimary
            )
        }
    }

    // MARK: - Message Section
    private var messageSection: some View {
        VStack(spacing: 8) {
            Text(resultMessage)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text(resultSubtitle)
                .font(.system(size: 15, weight: .regular, design: .rounded))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding(.vertical, 8)
    }

    // MARK: - Action Buttons
    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button {
                showReview = true
            } label: {
                HStack {
                    Image(systemName: "doc.text.magnifyingglass")
                    Text(languageManager.localized("review", en: "Review Answers", id: "Review Jawaban"))
                }
                .primaryButton()
            }

            Button {
                dismiss()
            } label: {
                Text(languageManager.localized("done", en: "Done", id: "Selesai"))
                    .secondaryButton()
            }
        }
    }

    private var resultMessage: String {
        if percentage >= 80 {
            return languageManager.localized("excellent", en: "Excellent!", id: "Luar Biasa!")
        } else if percentage >= 60 {
            return languageManager.localized("good", en: "Good Job!", id: "Bagus!")
        } else {
            return languageManager.localized("keep_going", en: "Keep Going!", id: "Terus Semangat!")
        }
    }

    private var resultSubtitle: String {
        if percentage >= 80 {
            return languageManager.localized("excellent_sub", en: "You're well prepared for NOAI!", id: "Kamu sudah siap untuk NOAI!")
        } else if percentage >= 60 {
            return languageManager.localized("good_sub", en: "Review the topics you missed.", id: "Review topik yang salah.")
        } else {
            return languageManager.localized("keep_going_sub", en: "Practice makes perfect!", id: "Latihan membuat sempurna!")
        }
    }
}

// MARK: - Result Stat Card
struct ResultStatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundStyle(color)

            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)

            Text(label)
                .font(.system(size: 12, weight: .medium, design: .rounded))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(color.opacity(0.2), lineWidth: 1)
        )
    }
}

// MARK: - Review View
struct ReviewView: View {
    let questions: [Question]
    let answers: [String: String]
    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                ForEach(Array(questions.enumerated()), id: \.element.id) { index, question in
                    ReviewQuestionRow(
                        index: index + 1,
                        question: question,
                        selectedAnswerId: answers[question.id],
                        isCorrect: answers[question.id] == question.correctOptionId
                    )
                }
            }
            .listStyle(.plain)
            .navigationTitle(languageManager.localized("review", en: "Review", id: "Review"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(languageManager.localized("done", en: "Done", id: "Selesai")) {
                        dismiss()
                    }
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundStyle(Color.brandPrimary)
                }
            }
        }
    }
}

// MARK: - Review Question Row
struct ReviewQuestionRow: View {
    let index: Int
    let question: Question
    let selectedAnswerId: String?
    let isCorrect: Bool
    @EnvironmentObject var languageManager: LanguageManager
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Question header
            HStack(spacing: 12) {
                Text("Q\(index)")
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(isCorrect ? Color.success : Color.error)
                    .clipShape(Capsule())

                Text(question.localizedQuestion(languageManager.currentLanguage))
                    .font(.system(size: 15, weight: .medium, design: .rounded))
                    .lineLimit(isExpanded ? nil : 2)

                Spacer()

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                VStack(alignment: .leading, spacing: 12) {
                    // Your answer
                    if let answerId = selectedAnswerId,
                       let answer = question.options.first(where: { $0.id == answerId }) {
                        HStack(alignment: .top, spacing: 8) {
                            Text(languageManager.localized("your_answer", en: "Your answer:", id: "Jawabanmu:"))
                                .font(.system(size: 13, weight: .medium, design: .rounded))
                                .foregroundStyle(.secondary)

                            Text(answer.localizedText(languageManager.currentLanguage))
                                .font(.system(size: 13, weight: .medium, design: .rounded))
                                .foregroundStyle(isCorrect ? Color.success : Color.error)
                        }
                    }

                    // Correct answer
                    if !isCorrect,
                       let correct = question.options.first(where: { $0.id == question.correctOptionId }) {
                        HStack(alignment: .top, spacing: 8) {
                            Text(languageManager.localized("correct_answer", en: "Correct:", id: "Benar:"))
                                .font(.system(size: 13, weight: .medium, design: .rounded))
                                .foregroundStyle(.secondary)

                            Text(correct.localizedText(languageManager.currentLanguage))
                                .font(.system(size: 13, weight: .medium, design: .rounded))
                                .foregroundStyle(Color.success)
                        }
                    }

                    // Explanation
                    VStack(alignment: .leading, spacing: 4) {
                        Text(languageManager.localized("explanation", en: "Explanation:", id: "Penjelasan:"))
                            .font(.system(size: 13, weight: .medium, design: .rounded))
                            .foregroundStyle(.secondary)

                        Text(question.localizedExplanation(languageManager.currentLanguage))
                            .font(.system(size: 13, design: .rounded))
                            .foregroundStyle(.primary)
                    }
                    .padding(.top, 4)
                }
                .padding(.leading, 52)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    ResultsView(
        questions: [],
        answers: [:],
        timeTaken: 300,
        mode: .practice
    )
    .environmentObject(LanguageManager())
}
