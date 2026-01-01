import SwiftUI

struct VisualizationHomeView: View {
    @EnvironmentObject var languageManager: LanguageManager

    let visualizations: [VisualizationItem] = [
        VisualizationItem(
            id: "linear-regression",
            titleEN: "Linear Regression",
            titleID: "Regresi Linear",
            descriptionEN: "See how a line fits to data points",
            descriptionID: "Lihat bagaimana garis menyesuaikan titik data",
            icon: "chart.xyaxis.line",
            color: .primaryBlue
        ),
        VisualizationItem(
            id: "gradient-descent",
            titleEN: "Gradient Descent",
            titleID: "Gradient Descent",
            descriptionEN: "Watch the optimization process step by step",
            descriptionID: "Lihat proses optimisasi langkah demi langkah",
            icon: "arrow.down.to.line",
            color: .primaryPurple
        ),
        VisualizationItem(
            id: "neural-network",
            titleEN: "Neural Network",
            titleID: "Neural Network",
            descriptionEN: "Visualize forward pass through layers",
            descriptionID: "Visualisasikan forward pass melalui layer",
            icon: "network",
            color: .primaryGreen
        ),
        VisualizationItem(
            id: "kmeans",
            titleEN: "K-Means Clustering",
            titleID: "K-Means Clustering",
            descriptionEN: "Watch clusters form iteratively",
            descriptionID: "Lihat cluster terbentuk secara iteratif",
            icon: "circle.hexagongrid",
            color: .primaryOrange
        ),
        VisualizationItem(
            id: "activation-functions",
            titleEN: "Activation Functions",
            titleID: "Fungsi Aktivasi",
            descriptionEN: "Compare ReLU, Sigmoid, and Tanh",
            descriptionID: "Bandingkan ReLU, Sigmoid, dan Tanh",
            icon: "waveform.path.ecg",
            color: .primaryRed
        )
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text(languageManager.localized(
                            "viz_header",
                            en: "Interactive Visualizations",
                            id: "Visualisasi Interaktif"
                        ))
                        .font(.title2)
                        .fontWeight(.bold)

                        Text(languageManager.localized(
                            "viz_subheader",
                            en: "Learn AI concepts through animations",
                            id: "Pelajari konsep AI melalui animasi"
                        ))
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 8)

                    // Visualization Cards
                    ForEach(visualizations) { viz in
                        NavigationLink(destination: destinationView(for: viz.id)) {
                            VisualizationCard(item: viz)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .background(Color.secondaryBackground)
            .navigationTitle(languageManager.localized("visualizations", en: "Visualizations", id: "Visualisasi"))
        }
    }

    @ViewBuilder
    private func destinationView(for id: String) -> some View {
        switch id {
        case "linear-regression":
            LinearRegressionView()
        case "gradient-descent":
            GradientDescentView()
        case "neural-network":
            NeuralNetworkView()
        case "kmeans":
            KMeansView()
        case "activation-functions":
            ActivationFunctionsView()
        default:
            Text("Coming soon")
        }
    }
}

struct VisualizationItem: Identifiable {
    let id: String
    let titleEN: String
    let titleID: String
    let descriptionEN: String
    let descriptionID: String
    let icon: String
    let color: Color

    func title(_ language: AppLanguage) -> String {
        language == .english ? titleEN : titleID
    }

    func description(_ language: AppLanguage) -> String {
        language == .english ? descriptionEN : descriptionID
    }
}

struct VisualizationCard: View {
    let item: VisualizationItem
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: item.icon)
                .font(.title)
                .foregroundStyle(item.color)
                .frame(width: 60, height: 60)
                .background(item.color.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 12))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title(languageManager.currentLanguage))
                    .font(.headline)
                    .foregroundStyle(.primary)

                Text(item.description(languageManager.currentLanguage))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding()
        .background(Color.cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    VisualizationHomeView()
        .environmentObject(LanguageManager())
}
