import SwiftUI

struct QuizHomeView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var showQuizSession = false
    @State private var selectedMode: QuizMode = .practice

    enum QuizMode: String, CaseIterable {
        case practice
        case timed

        func title(for language: AppLanguage) -> String {
            switch self {
            case .practice:
                return language == .english ? "Practice Mode" : "Mode Latihan"
            case .timed:
                return language == .english ? "Timed Mode" : "Mode Waktu"
            }
        }

        func description(for language: AppLanguage) -> String {
            switch self {
            case .practice:
                return language == .english ? "No time limit. Review answers anytime." : "Tanpa batas waktu. Review jawaban kapan saja."
            case .timed:
                return language == .english ? "2.5 hours like real NOAI exam." : "2.5 jam seperti ujian NOAI sesungguhnya."
            }
        }

        var iconName: String {
            switch self {
            case .practice: return "book.closed"
            case .timed: return "timer"
            }
        }

        var color: Color {
            switch self {
            case .practice: return .primaryGreen
            case .timed: return .primaryOrange
            }
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(languageManager.localized(
                            "quiz_header",
                            en: "Test Your Knowledge",
                            id: "Uji Pengetahuanmu"
                        ))
                        .font(.title2)
                        .fontWeight(.bold)

                        Text(languageManager.localized(
                            "quiz_subheader",
                            en: "20 MCQ questions just like NOAI format",
                            id: "20 soal MCQ seperti format NOAI"
                        ))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    // Quiz Mode Selection
                    VStack(spacing: 16) {
                        ForEach(QuizMode.allCases, id: \.self) { mode in
                            QuizModeCard(
                                mode: mode,
                                isSelected: selectedMode == mode,
                                action: { selectedMode = mode }
                            )
                        }
                    }

                    // Start Button
                    Button {
                        showQuizSession = true
                    } label: {
                        Text(languageManager.localized("start_quiz", en: "Start Quiz", id: "Mulai Kuis"))
                            .primaryButtonStyle()
                    }

                    // Recent Results
                    RecentResultsSection()
                }
                .padding()
            }
            .background(Color.secondaryBackground)
            .navigationTitle(languageManager.localized("quiz", en: "Quiz", id: "Kuis"))
            .fullScreenCover(isPresented: $showQuizSession) {
                QuizSessionView(mode: selectedMode)
            }
        }
    }
}

// MARK: - Quiz Mode Card
struct QuizModeCard: View {
    let mode: QuizHomeView.QuizMode
    let isSelected: Bool
    let action: () -> Void
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: mode.iconName)
                    .font(.title2)
                    .foregroundStyle(mode.color)
                    .frame(width: 50, height: 50)
                    .background(mode.color.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                VStack(alignment: .leading, spacing: 4) {
                    Text(mode.title(for: languageManager.currentLanguage))
                        .font(.headline)
                        .foregroundStyle(.primary)

                    Text(mode.description(for: languageManager.currentLanguage))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(mode.color)
                        .font(.title2)
                }
            }
            .padding()
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? mode.color : .clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Recent Results Section
struct RecentResultsSection: View {
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("recent_results", en: "Recent Results", id: "Hasil Terbaru"))
                .font(.headline)

            // Placeholder for empty state
            VStack(spacing: 8) {
                Image(systemName: "chart.bar.doc.horizontal")
                    .font(.largeTitle)
                    .foregroundStyle(.tertiary)

                Text(languageManager.localized(
                    "no_results",
                    en: "No quiz results yet",
                    id: "Belum ada hasil kuis"
                ))
                .font(.subheadline)
                .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 32)
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

#Preview {
    QuizHomeView()
        .environmentObject(LanguageManager())
}
