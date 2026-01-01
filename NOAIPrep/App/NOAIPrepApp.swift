import SwiftUI
import SwiftData

@main
struct NOAIPrepApp: App {
    @StateObject private var languageManager = LanguageManager()

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            UserProgress.self,
            QuizResult.self
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(languageManager)
        }
        .modelContainer(sharedModelContainer)
    }
}
