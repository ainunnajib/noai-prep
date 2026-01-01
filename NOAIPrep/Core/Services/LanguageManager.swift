import SwiftUI

enum AppLanguage: String, CaseIterable {
    case indonesian = "id"
    case english = "en"

    var displayName: String {
        switch self {
        case .indonesian: return "Bahasa Indonesia"
        case .english: return "English"
        }
    }

    var flag: String {
        switch self {
        case .indonesian: return "🇮🇩"
        case .english: return "🇬🇧"
        }
    }
}

@MainActor
class LanguageManager: ObservableObject {
    @Published var currentLanguage: AppLanguage {
        didSet {
            UserDefaults.standard.set(currentLanguage.rawValue, forKey: "appLanguage")
        }
    }

    init() {
        let savedLanguage = UserDefaults.standard.string(forKey: "appLanguage") ?? "en"
        self.currentLanguage = AppLanguage(rawValue: savedLanguage) ?? .english
    }

    func localized(_ key: String, en: String, id: String) -> String {
        switch currentLanguage {
        case .english: return en
        case .indonesian: return id
        }
    }

    func toggle() {
        currentLanguage = currentLanguage == .indonesian ? .english : .indonesian
    }
}

// MARK: - Localized Content Protocol
protocol LocalizedContent {
    var titleEN: String { get }
    var titleID: String { get }
    var descriptionEN: String { get }
    var descriptionID: String { get }
}

extension LocalizedContent {
    func localizedTitle(for language: AppLanguage) -> String {
        language == .english ? titleEN : titleID
    }

    func localizedDescription(for language: AppLanguage) -> String {
        language == .english ? descriptionEN : descriptionID
    }
}
