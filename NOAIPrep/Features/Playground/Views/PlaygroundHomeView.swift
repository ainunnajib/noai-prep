import SwiftUI
import WebKit

struct PlaygroundHomeView: View {
    @EnvironmentObject var languageManager: LanguageManager
    @State private var selectedCategory: CodeSnippet.SnippetCategory?
    @State private var snippets: [CodeSnippet] = []
    @State private var showColab = false
    @State private var selectedSnippet: CodeSnippet?

    var filteredSnippets: [CodeSnippet] {
        if let category = selectedCategory {
            return snippets.filter { $0.category == category }
        }
        return snippets
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    headerSection

                    // Open Colab Button
                    colabButton

                    // Category Filter
                    categoryFilter

                    // Snippets List
                    LazyVStack(spacing: 12) {
                        ForEach(filteredSnippets) { snippet in
                            SnippetCard(snippet: snippet) {
                                selectedSnippet = snippet
                            }
                        }
                    }
                }
                .padding()
            }
            .background(Color.secondaryBackground)
            .navigationTitle(languageManager.localized("playground", en: "Playground", id: "Playground"))
            .sheet(item: $selectedSnippet) { snippet in
                CodeDetailView(snippet: snippet)
            }
            .fullScreenCover(isPresented: $showColab) {
                ColabWebView(url: URL(string: "https://colab.research.google.com")!)
            }
        }
        .onAppear {
            snippets = ContentLoader.shared.loadSnippets()
        }
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(languageManager.localized(
                "code_header",
                en: "Practice Python Code",
                id: "Latihan Kode Python"
            ))
            .font(.title2)
            .fontWeight(.bold)

            Text(languageManager.localized(
                "code_subheader",
                en: "Code snippets for NumPy, Pandas, scikit-learn, and PyTorch",
                id: "Kode snippet untuk NumPy, Pandas, scikit-learn, dan PyTorch"
            ))
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var colabButton: some View {
        Button {
            showColab = true
        } label: {
            HStack {
                Image(systemName: "play.circle.fill")
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(languageManager.localized("open_colab", en: "Open Google Colab", id: "Buka Google Colab"))
                        .font(.headline)

                    Text(languageManager.localized("run_code", en: "Run Python code in your browser", id: "Jalankan kode Python di browser"))
                        .font(.caption)
                        .opacity(0.9)
                }

                Spacer()

                Image(systemName: "arrow.up.forward")
            }
            .foregroundStyle(.white)
            .padding()
            .background(
                LinearGradient(
                    colors: [.primaryOrange, .primaryRed],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                CategoryPill(
                    title: languageManager.localized("all", en: "All", id: "Semua"),
                    isSelected: selectedCategory == nil,
                    action: { selectedCategory = nil }
                )

                ForEach(CodeSnippet.SnippetCategory.allCases, id: \.self) { category in
                    CategoryPill(
                        title: category.displayName,
                        icon: category.iconName,
                        isSelected: selectedCategory == category,
                        action: { selectedCategory = category }
                    )
                }
            }
        }
    }
}

// MARK: - Category Pill
struct CategoryPill: View {
    let title: String
    var icon: String? = nil
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.caption)
                }
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? Color.primaryBlue : Color.cardBackground)
            .foregroundStyle(isSelected ? .white : .primary)
            .clipShape(Capsule())
        }
    }
}

// MARK: - Snippet Card
struct SnippetCard: View {
    let snippet: CodeSnippet
    let onTap: () -> Void
    @EnvironmentObject var languageManager: LanguageManager

    var categoryColor: Color {
        switch snippet.category {
        case .numpy: return .primaryBlue
        case .pandas: return .primaryGreen
        case .sklearn: return .primaryPurple
        case .pytorch: return .primaryOrange
        }
    }

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    // Category badge
                    Label(snippet.category.displayName, systemImage: snippet.category.iconName)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(categoryColor)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(categoryColor.opacity(0.15))
                        .clipShape(Capsule())

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }

                Text(snippet.localizedTitle(languageManager.currentLanguage))
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)

                Text(snippet.localizedDescription(languageManager.currentLanguage))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)

                // Code preview
                Text(snippet.code.prefix(100) + "...")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .padding()
            .background(Color.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Code Detail View
struct CodeDetailView: View {
    let snippet: CodeSnippet
    @EnvironmentObject var languageManager: LanguageManager
    @Environment(\.dismiss) private var dismiss
    @State private var copied = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Description
                    Text(snippet.localizedDescription(languageManager.currentLanguage))
                        .font(.body)
                        .foregroundStyle(.secondary)

                    // Code block
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Python")
                                .font(.caption)
                                .fontWeight(.medium)
                                .foregroundStyle(.secondary)

                            Spacer()

                            Button {
                                UIPasteboard.general.string = snippet.code
                                copied = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    copied = false
                                }
                            } label: {
                                Label(
                                    copied ?
                                        languageManager.localized("copied", en: "Copied!", id: "Disalin!") :
                                        languageManager.localized("copy", en: "Copy", id: "Salin"),
                                    systemImage: copied ? "checkmark" : "doc.on.doc"
                                )
                                .font(.caption)
                            }
                            .buttonStyle(.bordered)
                        }

                        ScrollView(.horizontal, showsIndicators: false) {
                            Text(snippet.code)
                                .font(.system(.caption, design: .monospaced))
                                .padding()
                        }
                        .background(Color(.systemGray6))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    // Open in Colab button
                    if let urlString = snippet.colabURL, let url = URL(string: urlString) {
                        Link(destination: url) {
                            Label(
                                languageManager.localized("run_in_colab", en: "Run in Google Colab", id: "Jalankan di Google Colab"),
                                systemImage: "play.circle.fill"
                            )
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.primaryOrange)
                            .foregroundStyle(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(snippet.localizedTitle(languageManager.currentLanguage))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(languageManager.localized("done", en: "Done", id: "Selesai")) {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Colab WebView
struct ColabWebView: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var languageManager: LanguageManager

    var body: some View {
        NavigationStack {
            WebView(url: url)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle("Google Colab")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarLeading) {
                        Button(languageManager.localized("close", en: "Close", id: "Tutup")) {
                            dismiss()
                        }
                    }

                    ToolbarItem(placement: .topBarTrailing) {
                        Link(destination: url) {
                            Image(systemName: "safari")
                        }
                    }
                }
        }
    }
}

// MARK: - WebView Wrapper
struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

#Preview {
    PlaygroundHomeView()
        .environmentObject(LanguageManager())
}
