import SwiftUI

struct ContentView: View {
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        NavigationStack {
            MainHomeView()
        }
        .tint(Color.brandPrimary)
    }
}

#Preview {
    ContentView()
        .environmentObject(LanguageManager())
}
