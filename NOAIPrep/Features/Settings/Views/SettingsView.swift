import SwiftUI
import SwiftData

struct SettingsView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query private var quizResults: [QuizResult]

    @State private var showResetConfirm = false

    var body: some View {
        NavigationStack {
            List {
                // Language Section
                Section {
                    languageRow
                } header: {
                    Text(languageManager.localized("language", en: "Language", id: "Bahasa"))
                }

                // Stats Section
                Section {
                    statsRow(
                        icon: "checkmark.seal.fill",
                        title: languageManager.localized("total_quizzes", en: "Total Quizzes", id: "Total Kuis"),
                        value: "\(quizResults.count)"
                    )

                    statsRow(
                        icon: "chart.line.uptrend.xyaxis",
                        title: languageManager.localized("questions_answered", en: "Questions Answered", id: "Soal Dijawab"),
                        value: "\(quizResults.reduce(0) { $0 + $1.totalQuestions })"
                    )
                } header: {
                    Text(languageManager.localized("statistics", en: "Statistics", id: "Statistik"))
                }

                // Data Section
                Section {
                    Button(role: .destructive) {
                        showResetConfirm = true
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                                .foregroundStyle(.red)
                            Text(languageManager.localized("reset_progress", en: "Reset All Progress", id: "Reset Semua Progres"))
                                .foregroundStyle(.red)
                        }
                    }
                } header: {
                    Text(languageManager.localized("data", en: "Data", id: "Data"))
                }

                // About Section
                Section {
                    aboutRow(
                        title: languageManager.localized("version", en: "Version", id: "Versi"),
                        value: "1.0.0"
                    )

                    aboutRow(
                        title: languageManager.localized("questions_bank", en: "Question Bank", id: "Bank Soal"),
                        value: "\(ContentLoader.shared.getTotalQuestionCount())+"
                    )
                } header: {
                    Text(languageManager.localized("about", en: "About", id: "Tentang"))
                } footer: {
                    Text(languageManager.localized("about_footer", en: "NOAI Prep helps you prepare for the National Olympiad of Artificial Intelligence.", id: "NOAI Prep membantumu mempersiapkan Olimpiade Nasional Kecerdasan Buatan."))
                }
            }
            .navigationTitle(languageManager.localized("settings", en: "Settings", id: "Pengaturan"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Text(languageManager.localized("done", en: "Done", id: "Selesai"))
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundStyle(Color.brandPrimary)
                    }
                }
            }
            .alert(
                languageManager.localized("reset_title", en: "Reset Progress?", id: "Reset Progres?"),
                isPresented: $showResetConfirm
            ) {
                Button(languageManager.localized("cancel", en: "Cancel", id: "Batal"), role: .cancel) {}
                Button(languageManager.localized("reset", en: "Reset", id: "Reset"), role: .destructive) {
                    resetProgress()
                }
            } message: {
                Text(languageManager.localized("reset_message", en: "This will delete all your quiz history. This action cannot be undone.", id: "Ini akan menghapus semua riwayat kuismu. Tindakan ini tidak dapat dibatalkan."))
            }
        }
    }

    // MARK: - Language Row
    private var languageRow: some View {
        HStack {
            Image(systemName: "globe")
                .font(.system(size: 20))
                .foregroundStyle(Color.brandPrimary)
                .frame(width: 32)

            Text(languageManager.localized("app_language", en: "App Language", id: "Bahasa Aplikasi"))

            Spacer()

            Menu {
                Button {
                    languageManager.currentLanguage = .english
                } label: {
                    HStack {
                        Text("English")
                        if languageManager.currentLanguage == .english {
                            Image(systemName: "checkmark")
                        }
                    }
                }

                Button {
                    languageManager.currentLanguage = .indonesian
                } label: {
                    HStack {
                        Text("Indonesia")
                        if languageManager.currentLanguage == .indonesian {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            } label: {
                HStack(spacing: 4) {
                    Text(languageManager.currentLanguage == .english ? "English" : "Indonesia")
                        .foregroundStyle(.secondary)
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 12))
                        .foregroundStyle(.tertiary)
                }
            }
        }
    }

    // MARK: - Stats Row
    private func statsRow(icon: String, title: String, value: String) -> some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Color.brandPrimary)
                .frame(width: 32)

            Text(title)

            Spacer()

            Text(value)
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - About Row
    private func aboutRow(title: String, value: String) -> some View {
        HStack {
            Text(title)

            Spacer()

            Text(value)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Reset Progress
    private func resetProgress() {
        for result in quizResults {
            modelContext.delete(result)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(LanguageManager())
}
