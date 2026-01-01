import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        TabView(selection: $selectedTab) {
            LearningHomeView()
                .tabItem {
                    Label(
                        languageManager.localized("learn", en: "Learn", id: "Belajar"),
                        systemImage: "book.fill"
                    )
                }
                .tag(0)

            QuizHomeView()
                .tabItem {
                    Label(
                        languageManager.localized("quiz", en: "Quiz", id: "Kuis"),
                        systemImage: "questionmark.circle.fill"
                    )
                }
                .tag(1)

            PlaygroundHomeView()
                .tabItem {
                    Label(
                        languageManager.localized("playground", en: "Playground", id: "Playground"),
                        systemImage: "chevron.left.forwardslash.chevron.right"
                    )
                }
                .tag(2)

            ProfileView()
                .tabItem {
                    Label(
                        languageManager.localized("profile", en: "Profile", id: "Profil"),
                        systemImage: "person.fill"
                    )
                }
                .tag(3)
        }
        .tint(Color.appPrimary)
    }
}

#Preview {
    ContentView()
        .environmentObject(LanguageManager())
}
