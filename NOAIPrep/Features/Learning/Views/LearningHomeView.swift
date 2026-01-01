import SwiftUI

struct LearningHomeView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var topics: [Topic] = []
    @State private var searchText = ""

    var filteredTopics: [Topic] {
        if searchText.isEmpty {
            return topics
        }
        return topics.filter { topic in
            topic.localizedTitle(languageManager.currentLanguage)
                .localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    headerSection

                    // Visualizations Banner
                    visualizationsBanner

                    // Topics Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(filteredTopics) { topic in
                            NavigationLink(destination: TopicDetailView(topic: topic)) {
                                TopicCard(topic: topic)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding()
            }
            .background(Color.secondaryBackground)
            .navigationTitle(languageManager.localized("learn", en: "Learn", id: "Belajar"))
            .searchable(
                text: $searchText,
                prompt: languageManager.localized("search", en: "Search topics...", id: "Cari topik...")
            )
        }
        .onAppear {
            topics = ContentLoader.shared.loadTopics()
        }
    }

    private var visualizationsBanner: some View {
        NavigationLink(destination: VisualizationHomeView()) {
            HStack(spacing: 16) {
                Image(systemName: "play.circle.fill")
                    .font(.largeTitle)
                    .foregroundStyle(.white)

                VStack(alignment: .leading, spacing: 4) {
                    Text(languageManager.localized(
                        "interactive_viz",
                        en: "Interactive Visualizations",
                        id: "Visualisasi Interaktif"
                    ))
                    .font(.headline)
                    .foregroundStyle(.white)

                    Text(languageManager.localized(
                        "viz_desc",
                        en: "Learn algorithms through animations",
                        id: "Pelajari algoritma melalui animasi"
                    ))
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.9))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundStyle(.white.opacity(0.8))
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [.primaryPurple, .primaryBlue],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "welcome",
                en: "Welcome to NOAI Prep!",
                id: "Selamat Datang di NOAI Prep!"
            ))
            .font(.title2)
            .fontWeight(.bold)

            Text(languageManager.localized(
                "subtitle",
                en: "Master AI concepts for the olympiad",
                id: "Kuasai konsep AI untuk olimpiade"
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Topic Card
struct TopicCard: View {
    let topic: Topic
    @EnvironmentObject var languageManager: LanguageManager

    var topicColor: Color {
        switch topic.color {
        case "blue": return .mlFoundations
        case "purple": return .neuralNetworks
        case "green": return .computerVision
        case "orange": return .nlpBasics
        default: return .primaryBlue
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Icon
            Image(systemName: topic.iconName)
                .font(.title)
                .foregroundStyle(topicColor)
                .frame(width: 50, height: 50)
                .background(topicColor.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 12))

            // Title
            Text(topic.localizedTitle(languageManager.currentLanguage))
                .font(.headline)
                .foregroundStyle(.primary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            // Lesson count
            Text("\(topic.lessons.count) \(languageManager.localized("lessons", en: "lessons", id: "pelajaran"))")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .topLeading)
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
}

// MARK: - Topic Detail View
struct TopicDetailView: View {
    let topic: Topic
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        List {
            Section {
                Text(topic.localizedDescription(languageManager.currentLanguage))
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Section(header: Text(languageManager.localized("lessons", en: "Lessons", id: "Pelajaran"))) {
                ForEach(topic.lessons) { lesson in
                    NavigationLink(destination: LessonView(lesson: lesson)) {
                        LessonRow(lesson: lesson)
                    }
                }
            }
        }
        .navigationTitle(topic.localizedTitle(languageManager.currentLanguage))
    }
}

// MARK: - Lesson Row
struct LessonRow: View {
    let lesson: Lesson
    @EnvironmentObject var languageManager: LanguageManager

    var difficultyColor: Color {
        switch lesson.difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .advanced: return .red
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.localizedTitle(languageManager.currentLanguage))
                    .font(.headline)

                HStack(spacing: 8) {
                    // Difficulty badge
                    Text(lesson.difficulty.displayName)
                        .font(.caption2)
                        .fontWeight(.medium)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(difficultyColor.opacity(0.15))
                        .foregroundStyle(difficultyColor)
                        .clipShape(Capsule())

                    // Time estimate
                    Label("\(lesson.estimatedMinutes) min", systemImage: "clock")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    LearningHomeView()
        .environmentObject(LanguageManager())
}
