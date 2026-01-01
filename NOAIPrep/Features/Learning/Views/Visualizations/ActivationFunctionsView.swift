import SwiftUI

struct ActivationFunctionsView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var selectedFunction: ActivationFunction = .relu
    @State private var inputValue: Double = 0

    let canvasWidth: CGFloat = 320
    let canvasHeight: CGFloat = 200

    enum ActivationFunction: String, CaseIterable {
        case relu = "ReLU"
        case sigmoid = "Sigmoid"
        case tanh = "Tanh"
        case leakyRelu = "Leaky ReLU"

        var formula: String {
            switch self {
            case .relu: return "max(0, x)"
            case .sigmoid: return "1 / (1 + e^(-x))"
            case .tanh: return "(e^x - e^(-x)) / (e^x + e^(-x))"
            case .leakyRelu: return "max(0.1x, x)"
            }
        }

        var color: Color {
            switch self {
            case .relu: return .primaryBlue
            case .sigmoid: return .primaryPurple
            case .tanh: return .primaryGreen
            case .leakyRelu: return .primaryOrange
            }
        }

        func compute(_ x: Double) -> Double {
            switch self {
            case .relu: return max(0, x)
            case .sigmoid: return 1 / (1 + exp(-x))
            case .tanh: return Darwin.tanh(x)
            case .leakyRelu: return x > 0 ? x : 0.1 * x
            }
        }

        func derivative(_ x: Double) -> Double {
            switch self {
            case .relu: return x > 0 ? 1 : 0
            case .sigmoid:
                let s = compute(x)
                return s * (1 - s)
            case .tanh:
                let t = compute(x)
                return 1 - t * t
            case .leakyRelu: return x > 0 ? 1 : 0.1
            }
        }

        var rangeY: ClosedRange<Double> {
            switch self {
            case .relu, .leakyRelu: return -1...4
            case .sigmoid: return -0.5...1.5
            case .tanh: return -1.5...1.5
            }
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Explanation
                explanationSection

                // Function selector
                functionSelector

                // Graph
                graphSection

                // Input slider
                inputSection

                // Comparison
                comparisonSection
            }
            .padding()
        }
        .navigationTitle(languageManager.localized("activation", en: "Activation Functions", id: "Fungsi Aktivasi"))
    }

    private var explanationSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "act_explain",
                en: "Activation functions introduce non-linearity, allowing neural networks to learn complex patterns.",
                id: "Fungsi aktivasi memperkenalkan non-linearitas, memungkinkan neural network mempelajari pola kompleks."
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var functionSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(ActivationFunction.allCases, id: \.self) { func_ in
                    Button {
                        withAnimation {
                            selectedFunction = func_
                        }
                    } label: {
                        Text(func_.rawValue)
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(selectedFunction == func_ ? func_.color : Color.cardBackground)
                            .foregroundStyle(selectedFunction == func_ ? .white : .primary)
                            .clipShape(Capsule())
                    }
                }
            }
        }
    }

    private var graphSection: some View {
        VStack(spacing: 12) {
            ZStack {
                // Axes
                Path { path in
                    // X-axis
                    path.move(to: CGPoint(x: 0, y: canvasHeight / 2))
                    path.addLine(to: CGPoint(x: canvasWidth, y: canvasHeight / 2))
                    // Y-axis
                    path.move(to: CGPoint(x: canvasWidth / 2, y: 0))
                    path.addLine(to: CGPoint(x: canvasWidth / 2, y: canvasHeight))
                }
                .stroke(Color.gray.opacity(0.3), lineWidth: 1)

                // Function curve
                ActivationCurve(
                    function: selectedFunction,
                    width: canvasWidth,
                    height: canvasHeight
                )
                .stroke(selectedFunction.color, lineWidth: 3)

                // Current point
                let screenX = (inputValue + 4) / 8 * Double(canvasWidth)
                let outputValue = selectedFunction.compute(inputValue)
                let range = selectedFunction.rangeY
                let normalizedY = (outputValue - range.lowerBound) / (range.upperBound - range.lowerBound)
                let screenY = Double(canvasHeight) * (1 - normalizedY)

                Circle()
                    .fill(selectedFunction.color)
                    .frame(width: 14, height: 14)
                    .position(x: screenX, y: screenY)
                    .shadow(color: selectedFunction.color.opacity(0.5), radius: 4)

                // Value labels
                Text("x")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .position(x: canvasWidth - 10, y: canvasHeight / 2 - 15)

                Text("y")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .position(x: canvasWidth / 2 + 15, y: 10)
            }
            .frame(width: canvasWidth, height: canvasHeight)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 12))

            // Formula
            VStack(spacing: 4) {
                Text(selectedFunction.rawValue)
                    .font(.headline)
                    .foregroundStyle(selectedFunction.color)
                Text("f(x) = \(selectedFunction.formula)")
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var inputSection: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("x =")
                        .font(.system(.subheadline, design: .monospaced))
                    Text(String(format: "%.2f", inputValue))
                        .font(.system(.subheadline, design: .monospaced))
                        .fontWeight(.bold)
                    Spacer()
                    Text("f(x) =")
                        .font(.system(.subheadline, design: .monospaced))
                    Text(String(format: "%.4f", selectedFunction.compute(inputValue)))
                        .font(.system(.subheadline, design: .monospaced))
                        .fontWeight(.bold)
                        .foregroundStyle(selectedFunction.color)
                }

                Slider(value: $inputValue, in: -4...4, step: 0.1)
                    .tint(selectedFunction.color)
            }

            // Derivative
            HStack {
                Text("f'(x) =")
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
                Text(String(format: "%.4f", selectedFunction.derivative(inputValue)))
                    .font(.system(.caption, design: .monospaced))
                    .fontWeight(.medium)
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var comparisonSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("comparison", en: "Comparison", id: "Perbandingan"))
                .font(.headline)

            VStack(spacing: 8) {
                ComparisonRow(
                    title: "ReLU",
                    pros: languageManager.localized("relu_pro", en: "Fast, no vanishing gradient", id: "Cepat, tanpa vanishing gradient"),
                    cons: languageManager.localized("relu_con", en: "Dead neurons (output=0)", id: "Neuron mati (output=0)"),
                    color: .primaryBlue
                )

                ComparisonRow(
                    title: "Sigmoid",
                    pros: languageManager.localized("sig_pro", en: "Output 0-1, good for probability", id: "Output 0-1, baik untuk probabilitas"),
                    cons: languageManager.localized("sig_con", en: "Vanishing gradient", id: "Vanishing gradient"),
                    color: .primaryPurple
                )

                ComparisonRow(
                    title: "Tanh",
                    pros: languageManager.localized("tanh_pro", en: "Zero-centered output", id: "Output berpusat di nol"),
                    cons: languageManager.localized("tanh_con", en: "Vanishing gradient", id: "Vanishing gradient"),
                    color: .primaryGreen
                )

                ComparisonRow(
                    title: "Leaky ReLU",
                    pros: languageManager.localized("leaky_pro", en: "No dead neurons", id: "Tidak ada neuron mati"),
                    cons: languageManager.localized("leaky_con", en: "Extra hyperparameter", id: "Hyperparameter tambahan"),
                    color: .primaryOrange
                )
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Supporting Views

struct ActivationCurve: Shape {
    let function: ActivationFunctionsView.ActivationFunction
    let width: CGFloat
    let height: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()

        let steps = 100
        let range = function.rangeY

        for i in 0...steps {
            let x = Double(i) / Double(steps) * 8 - 4 // -4 to 4
            let y = function.compute(x)
            let screenX = CGFloat(i) / CGFloat(steps) * width
            let normalizedY = (y - range.lowerBound) / (range.upperBound - range.lowerBound)
            let screenY = height * (1 - CGFloat(normalizedY))

            if i == 0 {
                path.move(to: CGPoint(x: screenX, y: screenY))
            } else {
                path.addLine(to: CGPoint(x: screenX, y: screenY))
            }
        }

        return path
    }
}

struct ComparisonRow: View {
    let title: String
    let pros: String
    let cons: String
    let color: Color

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(color)
                .frame(width: 10, height: 10)
                .padding(.top, 4)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)

                HStack(spacing: 8) {
                    Label(pros, systemImage: "checkmark.circle.fill")
                        .font(.caption2)
                        .foregroundStyle(.green)

                    Label(cons, systemImage: "exclamationmark.circle.fill")
                        .font(.caption2)
                        .foregroundStyle(.orange)
                }
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        ActivationFunctionsView()
            .environmentObject(LanguageManager())
    }
}
