import SwiftUI

struct KMeansView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var dataPoints: [DataPoint] = []
    @State private var centroids: [Centroid] = []
    @State private var k: Int = 3
    @State private var iteration = 0
    @State private var isAnimating = false
    @State private var hasConverged = false

    let canvasSize: CGFloat = 300
    let colors: [Color] = [.primaryBlue, .primaryRed, .primaryGreen, .primaryOrange, .primaryPurple]

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Explanation
                explanationSection

                // Canvas
                canvasSection

                // Controls
                controlsSection

                // Info
                infoSection
            }
            .padding()
        }
        .navigationTitle("K-Means Clustering")
        .onAppear {
            generateData()
        }
    }

    private var explanationSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "kmeans_explain",
                en: "K-Means groups data points into K clusters by iteratively updating cluster centers (centroids).",
                id: "K-Means mengelompokkan titik data menjadi K cluster dengan memperbarui pusat cluster (centroid) secara iteratif."
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)

            Text(languageManager.localized(
                "kmeans_steps",
                en: "1. Initialize centroids → 2. Assign points → 3. Update centroids → Repeat",
                id: "1. Inisialisasi centroid → 2. Assign titik → 3. Update centroid → Ulangi"
            ))
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var canvasSection: some View {
        ZStack {
            // Grid
            GridBackground()

            // Data points
            ForEach(dataPoints) { point in
                Circle()
                    .fill(point.cluster >= 0 ? colors[point.cluster % colors.count] : .gray)
                    .frame(width: 12, height: 12)
                    .position(point.position)
            }

            // Centroids
            ForEach(Array(centroids.enumerated()), id: \.element.id) { index, centroid in
                ZStack {
                    // Centroid marker
                    Image(systemName: "star.fill")
                        .font(.title2)
                        .foregroundStyle(colors[index % colors.count])
                        .position(centroid.position)

                    // Centroid ring
                    Circle()
                        .stroke(colors[index % colors.count], lineWidth: 2)
                        .frame(width: 30, height: 30)
                        .position(centroid.position)
                }
            }
        }
        .frame(width: canvasSize, height: canvasSize)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var controlsSection: some View {
        VStack(spacing: 16) {
            // K slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("K (\(languageManager.localized("clusters", en: "clusters", id: "cluster")))")
                        .font(.subheadline)
                    Spacer()
                    Text("\(k)")
                        .font(.system(.subheadline, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Slider(value: Binding(
                    get: { Double(k) },
                    set: { k = Int($0) }
                ), in: 2...5, step: 1)
                .tint(.primaryBlue)
                .disabled(isAnimating)
            }

            // Buttons
            HStack(spacing: 12) {
                Button {
                    stepOnce()
                } label: {
                    Label(
                        languageManager.localized("step", en: "Step", id: "Langkah"),
                        systemImage: "forward.frame"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(hasConverged ? Color.gray : Color.primaryBlue)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(isAnimating || hasConverged)

                Button {
                    runToConvergence()
                } label: {
                    Label(
                        languageManager.localized("run_all", en: "Run All", id: "Jalankan Semua"),
                        systemImage: "play.fill"
                    )
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(hasConverged ? Color.gray : Color.primaryGreen)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(isAnimating || hasConverged)

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

    private var infoSection: some View {
        VStack(spacing: 12) {
            HStack {
                StatBox(
                    title: languageManager.localized("iteration", en: "Iteration", id: "Iterasi"),
                    value: "\(iteration)",
                    color: .primaryBlue
                )
                StatBox(
                    title: languageManager.localized("points", en: "Points", id: "Titik"),
                    value: "\(dataPoints.count)",
                    color: .primaryPurple
                )
                StatBox(
                    title: languageManager.localized("status", en: "Status", id: "Status"),
                    value: hasConverged ?
                        languageManager.localized("done", en: "Done", id: "Selesai") :
                        languageManager.localized("running", en: "Running", id: "Berjalan"),
                    color: hasConverged ? .primaryGreen : .primaryOrange
                )
            }
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - K-Means Algorithm

    private func generateData() {
        dataPoints = (0..<30).map { _ in
            DataPoint(
                position: CGPoint(
                    x: CGFloat.random(in: 30...(canvasSize - 30)),
                    y: CGFloat.random(in: 30...(canvasSize - 30))
                ),
                cluster: -1
            )
        }
        initializeCentroids()
    }

    private func initializeCentroids() {
        centroids = (0..<k).map { _ in
            Centroid(
                position: CGPoint(
                    x: CGFloat.random(in: 50...(canvasSize - 50)),
                    y: CGFloat.random(in: 50...(canvasSize - 50))
                )
            )
        }
        iteration = 0
        hasConverged = false
    }

    private func stepOnce() {
        let oldAssignments = dataPoints.map { $0.cluster }

        // Assign points to nearest centroid
        assignPoints()

        // Update centroids
        updateCentroids()

        iteration += 1

        // Check convergence
        let newAssignments = dataPoints.map { $0.cluster }
        if oldAssignments == newAssignments {
            hasConverged = true
        }
    }

    private func assignPoints() {
        withAnimation(.easeInOut(duration: 0.3)) {
            for i in 0..<dataPoints.count {
                var minDist = Double.infinity
                var minCluster = 0

                for (j, centroid) in centroids.enumerated() {
                    let dist = distance(dataPoints[i].position, centroid.position)
                    if dist < minDist {
                        minDist = dist
                        minCluster = j
                    }
                }

                dataPoints[i].cluster = minCluster
            }
        }
    }

    private func updateCentroids() {
        withAnimation(.easeInOut(duration: 0.3)) {
            for i in 0..<centroids.count {
                let clusterPoints = dataPoints.filter { $0.cluster == i }
                if !clusterPoints.isEmpty {
                    let avgX = clusterPoints.map { $0.position.x }.reduce(0, +) / CGFloat(clusterPoints.count)
                    let avgY = clusterPoints.map { $0.position.y }.reduce(0, +) / CGFloat(clusterPoints.count)
                    centroids[i].position = CGPoint(x: avgX, y: avgY)
                }
            }
        }
    }

    private func runToConvergence() {
        isAnimating = true
        runStep()
    }

    private func runStep() {
        guard !hasConverged else {
            isAnimating = false
            return
        }

        stepOnce()

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            runStep()
        }
    }

    private func reset() {
        isAnimating = false
        generateData()
    }

    private func distance(_ a: CGPoint, _ b: CGPoint) -> Double {
        let dx = a.x - b.x
        let dy = a.y - b.y
        return sqrt(Double(dx * dx + dy * dy))
    }
}

// MARK: - Data Models

struct DataPoint: Identifiable {
    let id = UUID()
    var position: CGPoint
    var cluster: Int
}

struct Centroid: Identifiable {
    let id = UUID()
    var position: CGPoint
}

#Preview {
    NavigationStack {
        KMeansView()
            .environmentObject(LanguageManager())
    }
}
