import SwiftUI

struct ResultsView: View {
    let questions: [Question]
    let answers: [String: String]
    let timeTaken: TimeInterval

    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss
    @State private var showReview = false

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
        return String(format: "%d min %d sec", minutes, seconds)
    }

    var gradeColor: Color {
        if percentage >= 80 { return .primaryGreen }
        if percentage >= 60 { return .primaryOrange }
        return .primaryRed
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Score Circle
                    ZStack {
                        Circle()
                            .stroke(gradeColor.opacity(0.2), lineWidth: 20)
                            .frame(width: 180, height: 180)

                        Circle()
                            .trim(from: 0, to: percentage / 100)
                            .stroke(gradeColor, style: StrokeStyle(lineWidth: 20, lineCap: .round))
                            .frame(width: 180, height: 180)
                            .rotationEffect(.degrees(-90))

                        VStack(spacing: 4) {
                            Text("\(Int(percentage))%")
                                .font(.system(size: 48, weight: .bold))
                                .foregroundStyle(gradeColor)

                            Text("\(score)/\(questions.count)")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.top, 32)

                    // Stats
                    HStack(spacing: 24) {
                        StatCard(
                            icon: "checkmark.circle.fill",
                            value: "\(score)",
                            label: languageManager.localized("correct", en: "Correct", id: "Benar"),
                            color: .primaryGreen
                        )

                        StatCard(
                            icon: "xmark.circle.fill",
                            value: "\(questions.count - score)",
                            label: languageManager.localized("wrong", en: "Wrong", id: "Salah"),
                            color: .primaryRed
                        )

                        StatCard(
                            icon: "clock.fill",
                            value: formattedTime,
                            label: languageManager.localized("time", en: "Time", id: "Waktu"),
                            color: .primaryBlue
                        )
                    }

                    // Message
                    VStack(spacing: 8) {
                        Text(resultMessage)
                            .font(.title3)
                            .fontWeight(.semibold)

                        Text(resultSubtitle)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()

                    // Action Buttons
                    VStack(spacing: 12) {
                        Button {
                            showReview = true
                        } label: {
                            Label(
                                languageManager.localized("review", en: "Review Answers", id: "Review Jawaban"),
                                systemImage: "doc.text.magnifyingglass"
                            )
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.primaryBlue)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        Button {
                            dismiss()
                        } label: {
                            Text(languageManager.localized("done", en: "Done", id: "Selesai"))
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.secondaryBackground)
                                .foregroundStyle(.primary)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(languageManager.localized("results", en: "Results", id: "Hasil"))
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showReview) {
                ReviewView(questions: questions, answers: answers)
            }
        }
    }

    private var resultMessage: String {
        if percentage >= 80 {
            return languageManager.localized("excellent", en: "Excellent!", id: "Luar Biasa!")
        } else if percentage >= 60 {
            return languageManager.localized("good", en: "Good Job!", id: "Bagus!")
        } else {
            return languageManager.localized("keep_learning", en: "Keep Learning!", id: "Terus Belajar!")
        }
    }

    private var resultSubtitle: String {
        if percentage >= 80 {
            return languageManager.localized("excellent_sub", en: "You're well prepared for NOAI!", id: "Kamu sudah siap untuk NOAI!")
        } else if percentage >= 60 {
            return languageManager.localized("good_sub", en: "Review the topics you missed and try again.", id: "Review topik yang salah dan coba lagi.")
        } else {
            return languageManager.localized("keep_learning_sub", en: "Study more lessons and practice regularly.", id: "Pelajari lebih banyak materi dan latihan rutin.")
        }
    }
}

// MARK: - Stat Card
struct StatCard: View {
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
                .font(.headline)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
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
            .navigationTitle(languageManager.localized("review", en: "Review", id: "Review"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(languageManager.localized("done", en: "Done", id: "Selesai")) {
                        dismiss()
                    }
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
            HStack {
                Text("Q\(index)")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(isCorrect ? Color.primaryGreen : Color.primaryRed)
                    .clipShape(Capsule())

                Text(question.localizedQuestion(languageManager.currentLanguage))
                    .font(.subheadline)
                    .lineLimit(isExpanded ? nil : 2)

                Spacer()

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundStyle(.tertiary)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation {
                    isExpanded.toggle()
                }
            }

            if isExpanded {
                VStack(alignment: .leading, spacing: 8) {
                    // Your answer
                    if let answerId = selectedAnswerId,
                       let answer = question.options.first(where: { $0.id == answerId }) {
                        HStack {
                            Text(languageManager.localized("your_answer", en: "Your answer:", id: "Jawabanmu:"))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(answer.localizedText(languageManager.currentLanguage))
                                .font(.caption)
                                .foregroundStyle(isCorrect ? .green : .red)
                        }
                    }

                    // Correct answer
                    if let correct = question.options.first(where: { $0.id == question.correctOptionId }) {
                        HStack {
                            Text(languageManager.localized("correct_answer", en: "Correct:", id: "Benar:"))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text(correct.localizedText(languageManager.currentLanguage))
                                .font(.caption)
                                .foregroundStyle(.green)
                        }
                    }

                    // Explanation
                    Text(question.localizedExplanation(languageManager.currentLanguage))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(.top, 4)
                }
                .padding(.leading, 40)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ResultsView(
        questions: Question.sampleQuestions,
        answers: ["q1": "b", "q2": "a"],
        timeTaken: 300
    )
    .environmentObject(LanguageManager())
}
