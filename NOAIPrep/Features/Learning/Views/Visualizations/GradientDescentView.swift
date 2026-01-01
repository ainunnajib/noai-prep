import SwiftUI

struct GradientDescentView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var currentX: Double = -2.0
    @State private var learningRate: Double = 0.1
    @State private var isAnimating = false
    @State private var history: [Double] = []
    @State private var stepCount = 0

    let canvasWidth: CGFloat = 320
    let canvasHeight: CGFloat = 200

    // Simple quadratic function: f(x) = x^2
    func f(_ x: Double) -> Double {
        return x * x
    }

    // Derivative: f'(x) = 2x
    func derivative(_ x: Double) -> Double {
        return 2 * x
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Explanation
                explanationSection

                // Function visualization
                functionCanvas

                // Current position info
                positionInfo

                // Controls
                controlsSection

                // History
                historySection
            }
            .padding()
        }
        .navigationTitle("Gradient Descent")
        .onAppear {
            history = [currentX]
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized(
                "gd_explain",
                en: "Gradient Descent finds the minimum of a function by repeatedly moving in the direction of steepest descent.",
                id: "Gradient Descent menemukan minimum fungsi dengan bergerak berulang kali ke arah penurunan tercuram."
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 4) {
                Text(languageManager.localized("function", en: "Function", id: "Fungsi"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("f(x) = x²")
                    .font(.system(.title3, design: .monospaced))
                    .fontWeight(.bold)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(languageManager.localized("update_rule", en: "Update Rule", id: "Aturan Update"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("x = x - α × f'(x)")
                    .font(.system(.subheadline, design: .monospaced))
                    .fontWeight(.medium)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var functionCanvas: some View {
        ZStack {
            // Draw the function curve
            FunctionCurve(width: canvasWidth, height: canvasHeight, function: { x in x * x })
                .stroke(Color.primaryBlue, lineWidth: 3)

            // Draw history path
            if history.count > 1 {
                Path { path in
                    for (index, x) in history.enumerated() {
                        let screenX = xToScreen(x)
                        let screenY = yToScreen(f(x))
                        if index == 0 {
                            path.move(to: CGPoint(x: screenX, y: screenY))
                        } else {
                            path.addLine(to: CGPoint(x: screenX, y: screenY))
                        }
                    }
                }
                .stroke(Color.primaryOrange.opacity(0.5), lineWidth: 2)
            }

            // Draw current position
            Circle()
                .fill(Color.primaryRed)
                .frame(width: 16, height: 16)
                .position(
                    x: xToScreen(currentX),
                    y: yToScreen(f(currentX))
                )
                .shadow(color: .primaryRed.opacity(0.5), radius: 4)

            // Draw gradient arrow
            let gradient = derivative(currentX)
            let arrowLength: CGFloat = min(abs(gradient) * 20, 40)
            let arrowDirection: CGFloat = gradient > 0 ? -1 : 1

            Path { path in
                let startX = xToScreen(currentX)
                let startY = yToScreen(f(currentX)) - 20
                path.move(to: CGPoint(x: startX, y: startY))
                path.addLine(to: CGPoint(x: startX + arrowDirection * arrowLength, y: startY))
            }
            .stroke(Color.primaryGreen, style: StrokeStyle(lineWidth: 3, lineCap: .round))

            // Arrow head
            let arrowX = xToScreen(currentX) + arrowDirection * arrowLength
            let arrowY = yToScreen(f(currentX)) - 20
            Path { path in
                path.move(to: CGPoint(x: arrowX, y: arrowY))
                path.addLine(to: CGPoint(x: arrowX - arrowDirection * 8, y: arrowY - 5))
                path.addLine(to: CGPoint(x: arrowX - arrowDirection * 8, y: arrowY + 5))
                path.closeSubpath()
            }
            .fill(Color.primaryGreen)
        }
        .frame(width: canvasWidth, height: canvasHeight)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var positionInfo: some View {
        HStack(spacing: 16) {
            InfoBox(
                label: "x",
                value: String(format: "%.3f", currentX),
                color: .primaryBlue
            )
            InfoBox(
                label: "f(x)",
                value: String(format: "%.3f", f(currentX)),
                color: .primaryPurple
            )
            InfoBox(
                label: "f'(x)",
                value: String(format: "%.3f", derivative(currentX)),
                color: .primaryGreen
            )
            InfoBox(
                label: languageManager.localized("steps", en: "Steps", id: "Langkah"),
                value: "\(stepCount)",
                color: .primaryOrange
            )
        }
    }

    private var controlsSection: some View {
        VStack(spacing: 16) {
            // Learning rate slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(languageManager.localized("learning_rate", en: "Learning Rate (α)", id: "Learning Rate (α)"))
                        .font(.subheadline)
                    Spacer()
                    Text(String(format: "%.2f", learningRate))
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Slider(value: $learningRate, in: 0.01...0.5, step: 0.01)
                    .tint(.primaryPurple)
            }

            // Starting position slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(languageManager.localized("start_pos", en: "Starting Position", id: "Posisi Awal"))
                        .font(.subheadline)
                    Spacer()
                    Text(String(format: "%.1f", currentX))
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Slider(value: $currentX, in: -3...3, step: 0.1)
                    .tint(.primaryBlue)
                    .disabled(isAnimating)
            }

            // Buttons
            HStack(spacing: 12) {
                Button {
                    takeStep()
                } label: {
                    Label(
                        languageManager.localized("step", en: "Step", id: "Langkah"),
                        systemImage: "arrow.forward"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(isAnimating)

                Button {
                    toggleAutoRun()
                } label: {
                    Label(
                        isAnimating ?
                            languageManager.localized("stop", en: "Stop", id: "Berhenti") :
                            languageManager.localized("auto", en: "Auto Run", id: "Otomatis"),
                        systemImage: isAnimating ? "stop.fill" : "play.fill"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isAnimating ? Color.primaryRed : Color.primaryGreen)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    reset()
                } label: {
                    Image(systemName: "arrow.counterclockwise")
                        .padding()
                        .background(Color.secondaryBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("loss_history", en: "Loss History", id: "Riwayat Loss"))
                .font(.headline)

            if history.count > 1 {
                LossChart(values: history.map { f($0) })
                    .frame(height: 100)
            } else {
                Text(languageManager.localized("start_to_see", en: "Start to see history", id: "Mulai untuk melihat riwayat"))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
                    .padding()
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Helper Functions

    private func xToScreen(_ x: Double) -> CGFloat {
        // Map x from [-3, 3] to [0, canvasWidth]
        return CGFloat((x + 3) / 6) * canvasWidth
    }

    private func yToScreen(_ y: Double) -> CGFloat {
        // Map y from [0, 9] to [canvasHeight, 0]
        let normalized = min(y / 9, 1)
        return canvasHeight - CGFloat(normalized) * (canvasHeight - 20) - 10
    }

    private func takeStep() {
        let gradient = derivative(currentX)
        withAnimation(.easeInOut(duration: 0.3)) {
            currentX = currentX - learningRate * gradient
            currentX = max(-3, min(3, currentX)) // Clamp to bounds
        }
        history.append(currentX)
        stepCount += 1
    }

    private func toggleAutoRun() {
        isAnimating.toggle()
        if isAnimating {
            runAutoSteps()
        }
    }

    private func runAutoSteps() {
        guard isAnimating else { return }
        guard abs(derivative(currentX)) > 0.001 else {
            isAnimating = false
            return
        }

        takeStep()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            runAutoSteps()
        }
    }

    private func reset() {
        isAnimating = false
        currentX = Double.random(in: -2.5...2.5)
        history = [currentX]
        stepCount = 0
    }
}

// MARK: - Supporting Views

struct FunctionCurve: Shape {
    let width: CGFloat
    let height: CGFloat
    let function: @Sendable (Double) -> Double

    func path(in rect: CGRect) -> Path {
        var path = Path()

        let steps = 100
        for i in 0...steps {
            let x = Double(i) / Double(steps) * 6 - 3 // -3 to 3
            let y = function(x)
            let screenX = CGFloat(i) / CGFloat(steps) * width
            let screenY = height - CGFloat(min(y / 9, 1)) * (height - 20) - 10

            if i == 0 {
                path.move(to: CGPoint(x: screenX, y: screenY))
            } else {
                path.addLine(to: CGPoint(x: screenX, y: screenY))
            }
        }

        return path
    }
}

struct InfoBox: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(.caption, design: .monospaced))
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct LossChart: View {
    let values: [Double]

    var body: some View {
        GeometryReader { geometry in
            let maxValue = values.max() ?? 1
            let minValue = values.min() ?? 0
            let range = max(maxValue - minValue, 0.001)

            Path { path in
                for (index, value) in values.enumerated() {
                    let x = CGFloat(index) / CGFloat(max(values.count - 1, 1)) * geometry.size.width
                    let y = geometry.size.height - CGFloat((value - minValue) / range) * geometry.size.height

                    if index == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
            }
            .stroke(Color.primaryBlue, lineWidth: 2)
        }
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

#Preview {
    NavigationStack {
        GradientDescentView()
            .environmentObject(LanguageManager())
    }
}
