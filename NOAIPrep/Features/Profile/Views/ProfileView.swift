import SwiftUI
import SwiftData

struct ProfileView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @Query private var quizResults: [QuizResult]
    @Query private var userProgress: [UserProgress]

    var totalQuizzes: Int { quizResults.count }
    var averageScore: Double {
        guard !quizResults.isEmpty else { return 0 }
        return quizResults.map { $0.percentage }.reduce(0, +) / Double(quizResults.count)
    }
    var totalLessonsCompleted: Int {
        userProgress.reduce(0) { $0 + $1.lessonsCompleted.count }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    profileHeader

                    // Stats Cards
                    statsSection

                    // Settings
                    settingsSection
                }
                .padding()
            }
            .background(Color.secondaryBackground)
            .navigationTitle(languageManager.localized("profile", en: "Profile", id: "Profil"))
        }
    }

    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            Image(systemName: "person.crop.circle.fill")
                .font(.system(size: 80))
                .foregroundStyle(.linearGradient(
                    colors: [.primaryBlue, .primaryPurple],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ))

            // Name (could be customizable later)
            Text(languageManager.localized("noai_student", en: "NOAI Student", id: "Siswa NOAI"))
                .font(.title2)
                .fontWeight(.bold)

            // Level badge
            HStack {
                Image(systemName: "star.fill")
                    .foregroundStyle(.yellow)
                Text(currentLevel)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.cardBackground)
            .clipShape(Capsule())
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }

    private var currentLevel: String {
        if totalLessonsCompleted >= 20 {
            return languageManager.localized("level_expert", en: "Expert", id: "Ahli")
        } else if totalLessonsCompleted >= 10 {
            return languageManager.localized("level_advanced", en: "Advanced", id: "Mahir")
        } else if totalLessonsCompleted >= 5 {
            return languageManager.localized("level_intermediate", en: "Intermediate", id: "Menengah")
        }
        return languageManager.localized("level_beginner", en: "Beginner", id: "Pemula")
    }

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(languageManager.localized("your_progress", en: "Your Progress", id: "Progressmu"))
                .font(.headline)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 16) {
                ProgressStatCard(
                    icon: "book.closed.fill",
                    value: "\(totalLessonsCompleted)",
                    label: languageManager.localized("lessons_done", en: "Lessons Done", id: "Pelajaran Selesai"),
                    color: .primaryBlue
                )

                ProgressStatCard(
                    icon: "checkmark.circle.fill",
                    value: "\(totalQuizzes)",
                    label: languageManager.localized("quizzes_taken", en: "Quizzes Taken", id: "Kuis Dikerjakan"),
                    color: .primaryGreen
                )

                ProgressStatCard(
                    icon: "chart.line.uptrend.xyaxis",
                    value: String(format: "%.0f%%", averageScore),
                    label: languageManager.localized("avg_score", en: "Avg. Score", id: "Rata-rata"),
                    color: .primaryPurple
                )

                ProgressStatCard(
                    icon: "flame.fill",
                    value: "0",
                    label: languageManager.localized("streak", en: "Day Streak", id: "Hari Beruntun"),
                    color: .primaryOrange
                )
            }
        }
    }

    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(languageManager.localized("settings", en: "Settings", id: "Pengaturan"))
                .font(.headline)

            VStack(spacing: 0) {
                // Language Toggle
                SettingsRow(
                    icon: "globe",
                    title: languageManager.localized("language", en: "Language", id: "Bahasa"),
                    color: .primaryBlue
                ) {
                    HStack {
                        Text(languageManager.currentLanguage.flag)
                        Text(languageManager.currentLanguage.displayName)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .onTapGesture {
                        languageManager.toggle()
                    }
                }

                Divider()
                    .padding(.leading, 56)

                // About
                SettingsRow(
                    icon: "info.circle",
                    title: languageManager.localized("about", en: "About NOAI Prep", id: "Tentang NOAI Prep"),
                    color: .primaryPurple
                ) {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }

                Divider()
                    .padding(.leading, 56)

                // Reset Progress
                SettingsRow(
                    icon: "arrow.counterclockwise",
                    title: languageManager.localized("reset", en: "Reset Progress", id: "Reset Progress"),
                    color: .primaryRed
                ) {
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }
}

// MARK: - Progress Stat Card
struct ProgressStatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)

            Text(value)
                .font(.title2)
                .fontWeight(.bold)

            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

// MARK: - Settings Row
struct SettingsRow<Content: View>: View {
    let icon: String
    let title: String
    let color: Color
    @ViewBuilder let trailing: Content

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(color)
                .frame(width: 28, height: 28)
                .background(color.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 6))

            Text(title)
                .font(.body)

            Spacer()

            trailing
        }
        .padding()
    }
}

#Preview {
    ProfileView()
        .environmentObject(LanguageManager())
        .modelContainer(for: [QuizResult.self, UserProgress.self])
}
