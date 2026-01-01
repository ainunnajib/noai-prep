import SwiftUI

struct NeuralNetworkView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var inputValues: [Double] = [0.5, 0.8]
    @State private var hiddenActivations: [Double] = [0, 0, 0]
    @State private var outputValue: Double = 0
    @State private var isAnimating = false
    @State private var animationStep = 0

    // Simple weights (fixed for visualization)
    let weights1: [[Double]] = [
        [0.5, 0.3, -0.2],
        [0.4, -0.5, 0.6]
    ]
    let weights2: [Double] = [0.7, -0.4, 0.5]
    let bias1: [Double] = [0.1, -0.1, 0.2]
    let bias2: Double = 0.1

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Explanation
                explanationSection

                // Network visualization
                networkCanvas

                // Input controls
                inputSection

                // Forward pass button
                controlSection

                // Output display
                outputSection
            }
            .padding()
        }
        .navigationTitle("Neural Network")
        .onAppear {
            calculateForwardPass()
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "nn_explain",
                en: "A neural network transforms inputs through layers of connected neurons, applying weights and activation functions.",
                id: "Neural network mentransformasi input melalui layer neuron yang terhubung, menerapkan bobot dan fungsi aktivasi."
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                LegendItem(color: .primaryBlue, label: "Input")
                LegendItem(color: .primaryPurple, label: "Hidden")
                LegendItem(color: .primaryGreen, label: "Output")
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var networkCanvas: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height: CGFloat = 250

            ZStack {
                // Draw connections
                ForEach(0..<2, id: \.self) { i in
                    ForEach(0..<3, id: \.self) { j in
                        let startX = width * 0.15
                        let startY = height * CGFloat(0.35 + Double(i) * 0.3)
                        let endX = width * 0.5
                        let endY = height * CGFloat(0.25 + Double(j) * 0.25)

                        Path { path in
                            path.move(to: CGPoint(x: startX, y: startY))
                            path.addLine(to: CGPoint(x: endX, y: endY))
                        }
                        .stroke(
                            connectionColor(weight: weights1[i][j], step: animationStep, targetStep: 1),
                            lineWidth: abs(weights1[i][j]) * 3 + 1
                        )
                    }
                }

                ForEach(0..<3, id: \.self) { j in
                    let startX = width * 0.5
                    let startY = height * CGFloat(0.25 + Double(j) * 0.25)
                    let endX = width * 0.85
                    let endY = height * 0.5

                    Path { path in
                        path.move(to: CGPoint(x: startX, y: startY))
                        path.addLine(to: CGPoint(x: endX, y: endY))
                    }
                    .stroke(
                        connectionColor(weight: weights2[j], step: animationStep, targetStep: 2),
                        lineWidth: abs(weights2[j]) * 3 + 1
                    )
                }

                // Input layer
                ForEach(0..<2, id: \.self) { i in
                    NeuronView(
                        value: inputValues[i],
                        color: .primaryBlue,
                        isActive: animationStep >= 0
                    )
                    .position(x: width * 0.15, y: height * CGFloat(0.35 + Double(i) * 0.3))
                }

                // Hidden layer
                ForEach(0..<3, id: \.self) { i in
                    NeuronView(
                        value: hiddenActivations[i],
                        color: .primaryPurple,
                        isActive: animationStep >= 1
                    )
                    .position(x: width * 0.5, y: height * CGFloat(0.25 + Double(i) * 0.25))
                }

                // Output layer
                NeuronView(
                    value: outputValue,
                    color: .primaryGreen,
                    isActive: animationStep >= 2
                )
                .position(x: width * 0.85, y: height * 0.5)

                // Layer labels
                Text("Input")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .position(x: width * 0.15, y: height * 0.1)

                Text("Hidden")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .position(x: width * 0.5, y: height * 0.1)

                Text("Output")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .position(x: width * 0.85, y: height * 0.1)
            }
        }
        .frame(height: 250)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var inputSection: some View {
        VStack(spacing: 16) {
            Text(languageManager.localized("inputs", en: "Input Values", id: "Nilai Input"))
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            ForEach(0..<2, id: \.self) { i in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("x\(i + 1)")
                            .font(.system(.subheadline, design: .monospaced))
                        Spacer()
                        Text(String(format: "%.2f", inputValues[i]))
                            .font(.system(.subheadline, design: .monospaced))
                            .foregroundStyle(.secondary)
                    }
                    Slider(value: $inputValues[i], in: 0...1, step: 0.1)
                        .tint(.primaryBlue)
                        .onChange(of: inputValues[i]) { _, _ in
                            calculateForwardPass()
                        }
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var controlSection: some View {
        HStack(spacing: 12) {
            Button {
                runAnimation()
            } label: {
                Label(
                    languageManager.localized("forward_pass", en: "Forward Pass", id: "Forward Pass"),
                    systemImage: "play.fill"
                )
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.primaryBlue)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isAnimating)

            Button {
                resetAnimation()
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .padding()
                    .background(Color.secondaryBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    private var outputSection: some View {
        VStack(spacing: 12) {
            Text(languageManager.localized("computation", en: "Computation", id: "Komputasi"))
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .leading, spacing: 8) {
                Text(languageManager.localized("hidden_layer", en: "Hidden Layer (ReLU)", id: "Hidden Layer (ReLU)"))
                    .font(.caption)
                    .foregroundStyle(.secondary)

                ForEach(Array(0..<3), id: \.self) { i in
                    HStack {
                        Text("h\(i + 1)")
                            .font(.system(.caption, design: .monospaced))
                        Text("=")
                        Text("ReLU(\(String(format: "%.2f", rawHidden(i))))")
                            .font(.system(.caption, design: .monospaced))
                        Text("=")
                        Text(String(format: "%.3f", hiddenActivations[i]))
                            .font(.system(.caption, design: .monospaced))
                            .fontWeight(.bold)
                            .foregroundStyle(Color.primaryPurple)
                    }
                }
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text(languageManager.localized("output_layer", en: "Output (Sigmoid)", id: "Output (Sigmoid)"))
                    .font(.caption)
                    .foregroundStyle(.secondary)

                HStack {
                    Text("y")
                        .font(.system(.subheadline, design: .monospaced))
                    Text("=")
                    Text("σ(\(String(format: "%.2f", rawOutput())))")
                        .font(.system(.subheadline, design: .monospaced))
                    Text("=")
                    Text(String(format: "%.4f", outputValue))
                        .font(.system(.subheadline, design: .monospaced))
                        .fontWeight(.bold)
                        .foregroundStyle(Color.primaryGreen)
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Helper Functions

    private func relu(_ x: Double) -> Double {
        return max(0, x)
    }

    private func sigmoid(_ x: Double) -> Double {
        return 1 / (1 + exp(-x))
    }

    private func rawHidden(_ index: Int) -> Double {
        var sum = bias1[index]
        for i in 0..<inputValues.count {
            sum += inputValues[i] * weights1[i][index]
        }
        return sum
    }

    private func rawOutput() -> Double {
        var sum = bias2
        for i in 0..<hiddenActivations.count {
            sum += hiddenActivations[i] * weights2[i]
        }
        return sum
    }

    private func calculateForwardPass() {
        // Hidden layer
        for j in 0..<3 {
            hiddenActivations[j] = relu(rawHidden(j))
        }

        // Output layer
        outputValue = sigmoid(rawOutput())
    }

    private func connectionColor(weight: Double, step: Int, targetStep: Int) -> Color {
        let baseColor = weight > 0 ? Color.blue : Color.red
        let opacity = step >= targetStep ? 0.8 : 0.2
        return baseColor.opacity(opacity)
    }

    private func runAnimation() {
        isAnimating = true
        animationStep = 0

        withAnimation(.easeInOut(duration: 0.5)) {
            animationStep = 1
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            withAnimation(.easeInOut(duration: 0.5)) {
                animationStep = 2
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            isAnimating = false
        }
    }

    private func resetAnimation() {
        animationStep = 0
        inputValues = [Double.random(in: 0...1), Double.random(in: 0...1)]
        calculateForwardPass()
    }
}

// MARK: - Supporting Views

struct NeuronView: View {
    let value: Double
    let color: Color
    let isActive: Bool

    var body: some View {
        ZStack {
            Circle()
                .fill(isActive ? color : color.opacity(0.3))
                .frame(width: 50, height: 50)
                .shadow(color: isActive ? color.opacity(0.5) : .clear, radius: 5)

            Text(String(format: "%.2f", value))
                .font(.system(.caption2, design: .monospaced))
                .foregroundStyle(.white)
                .fontWeight(.bold)
        }
    }
}

struct LegendItem: View {
    let color: Color
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(color)
                .frame(width: 12, height: 12)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}

#Preview {
    NavigationStack {
        NeuralNetworkView()
            .environmentObject(LanguageManager())
    }
}
