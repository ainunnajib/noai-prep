import SwiftUI

struct LinearRegressionView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var dataPoints: [CGPoint] = []
    @State private var slope: Double = 0.5
    @State private var intercept: Double = 150
    @State private var isAnimating = false
    @State private var showLine = true

    let canvasWidth: CGFloat = 300
    let canvasHeight: CGFloat = 300

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Explanation
                explanationSection

                // Interactive Canvas
                canvasSection

                // Controls
                controlsSection

                // Stats
                statsSection
            }
            .padding()
        }
        .navigationTitle(languageManager.localized("linear_reg", en: "Linear Regression", id: "Regresi Linear"))
        .onAppear {
            generateRandomData()
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "lr_explain",
                en: "Linear Regression finds the best-fit line through data points by minimizing the squared errors.",
                id: "Regresi Linear menemukan garis terbaik melalui titik data dengan meminimalkan error kuadrat."
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)

            Text("y = mx + b")
                .font(.system(.title2, design: .monospaced))
                .fontWeight(.bold)
                .foregroundStyle(Color.primaryBlue)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var canvasSection: some View {
        VStack {
            ZStack {
                // Grid
                GridBackground()

                // Data points
                ForEach(Array(dataPoints.enumerated()), id: \.offset) { _, point in
                    Circle()
                        .fill(Color.primaryBlue)
                        .frame(width: 12, height: 12)
                        .position(point)
                }

                // Regression line
                if showLine {
                    RegressionLine(
                        slope: slope,
                        intercept: intercept,
                        width: canvasWidth,
                        height: canvasHeight
                    )
                    .stroke(Color.primaryRed, lineWidth: 3)
                }

                // Error lines (residuals)
                ForEach(Array(dataPoints.enumerated()), id: \.offset) { _, point in
                    let predictedY = canvasHeight - (slope * point.x + intercept - canvasHeight/2)
                    Path { path in
                        path.move(to: point)
                        path.addLine(to: CGPoint(x: point.x, y: predictedY))
                    }
                    .stroke(Color.primaryGreen.opacity(0.5), lineWidth: 1)
                }
            }
            .frame(width: canvasWidth, height: canvasHeight)
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .onTapGesture { location in
                addPoint(at: location)
            }

            Text(languageManager.localized("tap_to_add", en: "Tap to add points", id: "Ketuk untuk menambah titik"))
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }

    private var controlsSection: some View {
        VStack(spacing: 16) {
            // Slope slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(languageManager.localized("slope", en: "Slope (m)", id: "Kemiringan (m)"))
                        .font(.subheadline)
                    Spacer()
                    Text(String(format: "%.2f", slope))
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Slider(value: $slope, in: -2...2, step: 0.1)
                    .tint(.primaryBlue)
            }

            // Intercept slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(languageManager.localized("intercept", en: "Intercept (b)", id: "Intercept (b)"))
                        .font(.subheadline)
                    Spacer()
                    Text(String(format: "%.0f", intercept))
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Slider(value: $intercept, in: 0...canvasHeight, step: 10)
                    .tint(.primaryPurple)
            }

            // Buttons
            HStack(spacing: 12) {
                Button {
                    fitLine()
                } label: {
                    Label(
                        languageManager.localized("fit_line", en: "Fit Line", id: "Fit Garis"),
                        systemImage: "wand.and.stars"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    generateRandomData()
                } label: {
                    Label(
                        languageManager.localized("new_data", en: "New Data", id: "Data Baru"),
                        systemImage: "arrow.clockwise"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.secondaryBackground)
                    .foregroundStyle(.primary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(languageManager.localized("stats", en: "Statistics", id: "Statistik"))
                .font(.headline)

            HStack {
                StatBox(
                    title: "MSE",
                    value: String(format: "%.1f", calculateMSE()),
                    color: .primaryOrange
                )
                StatBox(
                    title: languageManager.localized("points", en: "Points", id: "Titik"),
                    value: "\(dataPoints.count)",
                    color: .primaryBlue
                )
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Helper Functions

    private func generateRandomData() {
        dataPoints = (0..<10).map { _ in
            CGPoint(
                x: CGFloat.random(in: 30...(canvasWidth - 30)),
                y: CGFloat.random(in: 30...(canvasHeight - 30))
            )
        }
    }

    private func addPoint(at location: CGPoint) {
        guard location.x > 0, location.x < canvasWidth,
              location.y > 0, location.y < canvasHeight else { return }
        dataPoints.append(location)
    }

    private func fitLine() {
        guard dataPoints.count >= 2 else { return }

        // Simple linear regression calculation
        let n = Double(dataPoints.count)
        let sumX = dataPoints.reduce(0) { $0 + Double($1.x) }
        let sumY = dataPoints.reduce(0) { $0 + Double(canvasHeight - $1.y) } // Flip Y
        let sumXY = dataPoints.reduce(0) { $0 + Double($1.x) * Double(canvasHeight - $1.y) }
        let sumX2 = dataPoints.reduce(0) { $0 + Double($1.x) * Double($1.x) }

        let denominator = n * sumX2 - sumX * sumX
        guard denominator != 0 else { return }

        let newSlope = (n * sumXY - sumX * sumY) / denominator
        let newIntercept = (sumY - newSlope * sumX) / n

        withAnimation(.easeInOut(duration: 0.5)) {
            slope = newSlope
            intercept = newIntercept + canvasHeight / 2
        }
    }

    private func calculateMSE() -> Double {
        guard !dataPoints.isEmpty else { return 0 }

        let errors = dataPoints.map { point -> Double in
            let predictedY = slope * Double(point.x) + intercept - canvasHeight / 2
            let actualY = canvasHeight - Double(point.y)
            return pow(actualY - predictedY, 2)
        }

        return errors.reduce(0, +) / Double(dataPoints.count)
    }
}

// MARK: - Supporting Views

struct RegressionLine: Shape {
    let slope: Double
    let intercept: Double
    let width: CGFloat
    let height: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()

        let y1 = height - (slope * 0 + intercept - height / 2)
        let y2 = height - (slope * Double(width) + intercept - height / 2)

        path.move(to: CGPoint(x: 0, y: y1))
        path.addLine(to: CGPoint(x: width, y: y2))

        return path
    }
}

#Preview {
    NavigationStack {
        LinearRegressionView()
            .environmentObject(LanguageManager())
    }
}
