import SwiftUI

// MARK: - Hex Color Initializer
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Modern Color Palette
extension Color {
    // MARK: - Brand Colors
    static let brandPrimary = Color(hex: "6366F1")      // Indigo
    static let brandSecondary = Color(hex: "8B5CF6")    // Purple
    static let brandAccent = Color(hex: "06B6D4")       // Cyan

    // MARK: - Semantic Colors
    static let success = Color(hex: "10B981")           // Emerald
    static let error = Color(hex: "EF4444")             // Red
    static let warning = Color(hex: "F59E0B")           // Amber

    // MARK: - Text Colors
    static let textPrimary = Color(hex: "18181B")
    static let textSecondary = Color(hex: "71717A")
    static let textTertiary = Color(hex: "A1A1AA")

    // MARK: - Category Colors (NOAI Quiz)
    static let categoryMath = Color(hex: "3B82F6")       // Blue
    static let categoryComputing = Color(hex: "10B981") // Emerald
    static let categoryAI = Color(hex: "8B5CF6")        // Purple
    static let categoryProblem = Color(hex: "F59E0B")   // Amber

    // MARK: - Gradients
    static let heroGradient = LinearGradient(
        colors: [Color(hex: "6366F1"), Color(hex: "8B5CF6")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let successGradient = LinearGradient(
        colors: [Color(hex: "10B981"), Color(hex: "06B6D4")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let warmGradient = LinearGradient(
        colors: [Color(hex: "F59E0B"), Color(hex: "EF4444")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let subtleGradient = LinearGradient(
        colors: [Color(hex: "6366F1").opacity(0.1), Color(hex: "8B5CF6").opacity(0.05)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Glassmorphism View Modifiers
extension View {
    func glassCard(cornerRadius: CGFloat = 24) -> some View {
        self
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.08), radius: 20, x: 0, y: 10)
    }

    func modernCard(padding: CGFloat = 20, cornerRadius: CGFloat = 20) -> some View {
        self
            .padding(padding)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .shadow(color: .black.opacity(0.06), radius: 16, x: 0, y: 8)
    }

    func primaryButton() -> some View {
        self
            .font(.system(size: 17, weight: .semibold, design: .rounded))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(Color.heroGradient)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .shadow(color: Color.brandPrimary.opacity(0.3), radius: 12, x: 0, y: 6)
    }

    func secondaryButton() -> some View {
        self
            .font(.system(size: 17, weight: .medium, design: .rounded))
            .foregroundStyle(Color.brandPrimary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(Color.brandPrimary.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    func categoryChip(isSelected: Bool, color: Color) -> some View {
        self
            .font(.system(size: 14, weight: .semibold, design: .rounded))
            .foregroundStyle(isSelected ? .white : color)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? color : color.opacity(0.1))
            .clipShape(Capsule())
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
    }

    func optionButton(isSelected: Bool, isCorrect: Bool? = nil) -> some View {
        self
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                if let isCorrect = isCorrect {
                    isCorrect ? Color.success.opacity(0.15) : Color.error.opacity(0.15)
                } else if isSelected {
                    Color.brandPrimary.opacity(0.1)
                } else {
                    Color(.systemBackground)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(
                        isSelected ? Color.brandPrimary : Color(.systemGray4),
                        lineWidth: isSelected ? 2 : 1
                    )
            )
            .scaleEffect(isSelected ? 0.98 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
    }
}

// MARK: - Typography Helpers
extension Font {
    static let heroTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let sectionTitle = Font.system(size: 24, weight: .semibold, design: .rounded)
    static let cardTitle = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let bodyLarge = Font.system(size: 17, weight: .regular, design: .rounded)
    static let bodyMedium = Font.system(size: 15, weight: .medium, design: .rounded)
    static let caption = Font.system(size: 13, weight: .regular, design: .rounded)
}
