import SwiftUI

extension Color {
    // MARK: - Primary Colors
    static let appPrimary = Color("AppPrimary", bundle: nil)
    static let appSecondary = Color("AppSecondary", bundle: nil)
    static let appAccent = Color("AppAccent", bundle: nil)

    // MARK: - Fallback Colors (if Assets not set)
    static let primaryBlue = Color(red: 0.0, green: 0.478, blue: 1.0)         // #007AFF
    static let primaryPurple = Color(red: 0.686, green: 0.322, blue: 0.871)   // #AF52DE
    static let primaryGreen = Color(red: 0.204, green: 0.780, blue: 0.349)    // #34C759
    static let primaryOrange = Color(red: 1.0, green: 0.584, blue: 0.0)       // #FF9500
    static let primaryRed = Color(red: 1.0, green: 0.231, blue: 0.188)        // #FF3B30

    // MARK: - Category Colors
    static let mlFoundations = Color(red: 0.0, green: 0.478, blue: 1.0)       // Blue
    static let neuralNetworks = Color(red: 0.686, green: 0.322, blue: 0.871)  // Purple
    static let computerVision = Color(red: 0.204, green: 0.780, blue: 0.349)  // Green
    static let nlpBasics = Color(red: 1.0, green: 0.584, blue: 0.0)           // Orange

    // MARK: - Background Colors
    static let cardBackground = Color(.systemBackground)
    static let secondaryBackground = Color(.secondarySystemBackground)
    static let tertiaryBackground = Color(.tertiarySystemBackground)

    // MARK: - Gradient Presets
    static let learningGradient = LinearGradient(
        colors: [.primaryBlue, .primaryPurple],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let quizGradient = LinearGradient(
        colors: [.primaryGreen, .primaryBlue],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let playgroundGradient = LinearGradient(
        colors: [.primaryOrange, .primaryRed],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - View Extensions for Theming
extension View {
    func cardStyle() -> some View {
        self
            .padding()
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)
    }

    func primaryButtonStyle() -> some View {
        self
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.primaryBlue)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
