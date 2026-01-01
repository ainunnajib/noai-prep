import SwiftUI

struct LessonView: View {
    let lesson: Lesson
    @EnvironmentObject var languageManager: LanguageManager
    @State private var showCode = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Lesson metadata
                HStack(spacing: 12) {
                    DifficultyBadge(difficulty: lesson.difficulty)

                    Label("\(lesson.estimatedMinutes) min", systemImage: "clock")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Spacer()
                }

                // Content
                MarkdownText(lesson.localizedContent(languageManager.currentLanguage))

                // Code Example (if available)
                if let code = lesson.codeExample {
                    codeExampleSection(code: code)
                }

                Spacer(minLength: 40)
            }
            .padding()
        }
        .navigationTitle(lesson.localizedTitle(languageManager.currentLanguage))
        .navigationBarTitleDisplayMode(.large)
    }

    @ViewBuilder
    private func codeExampleSection(code: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label(
                    languageManager.localized("code_example", en: "Code Example", id: "Contoh Kode"),
                    systemImage: "chevron.left.forwardslash.chevron.right"
                )
                .font(.headline)

                Spacer()

                Button {
                    UIPasteboard.general.string = code
                } label: {
                    Label(
                        languageManager.localized("copy", en: "Copy", id: "Salin"),
                        systemImage: "doc.on.doc"
                    )
                    .font(.caption)
                }
                .buttonStyle(.bordered)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                Text(code)
                    .font(.system(.caption, design: .monospaced))
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

// MARK: - Difficulty Badge
struct DifficultyBadge: View {
    let difficulty: Lesson.Difficulty

    var color: Color {
        switch difficulty {
        case .beginner: return .green
        case .intermediate: return .orange
        case .advanced: return .red
        }
    }

    var body: some View {
        Text(difficulty.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(color.opacity(0.15))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}

// MARK: - Simple Markdown Text Renderer
struct MarkdownText: View {
    let text: String

    init(_ text: String) {
        self.text = text
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(Array(text.components(separatedBy: "\n\n").enumerated()), id: \.offset) { _, paragraph in
                renderParagraph(paragraph)
            }
        }
    }

    @ViewBuilder
    private func renderParagraph(_ paragraph: String) -> some View {
        let trimmed = paragraph.trimmingCharacters(in: .whitespacesAndNewlines)

        if trimmed.hasPrefix("# ") {
            // H1
            Text(trimmed.dropFirst(2))
                .font(.title)
                .fontWeight(.bold)
        } else if trimmed.hasPrefix("## ") {
            // H2
            Text(trimmed.dropFirst(3))
                .font(.title2)
                .fontWeight(.semibold)
                .padding(.top, 8)
        } else if trimmed.hasPrefix("### ") {
            // H3
            Text(trimmed.dropFirst(4))
                .font(.title3)
                .fontWeight(.medium)
        } else if trimmed.hasPrefix("- ") || trimmed.hasPrefix("* ") {
            // Bullet list
            VStack(alignment: .leading, spacing: 4) {
                ForEach(Array(trimmed.components(separatedBy: "\n").enumerated()), id: \.offset) { _, line in
                    if line.hasPrefix("- ") || line.hasPrefix("* ") {
                        HStack(alignment: .top, spacing: 8) {
                            Text("•")
                            Text(renderInlineMarkdown(String(line.dropFirst(2))))
                        }
                    }
                }
            }
        } else if trimmed.hasPrefix("1.") {
            // Numbered list
            VStack(alignment: .leading, spacing: 4) {
                ForEach(Array(trimmed.components(separatedBy: "\n").enumerated()), id: \.offset) { index, line in
                    HStack(alignment: .top, spacing: 8) {
                        Text("\(index + 1).")
                            .foregroundStyle(.secondary)
                        Text(renderInlineMarkdown(line.replacingOccurrences(of: "^\\d+\\.\\s*", with: "", options: .regularExpression)))
                    }
                }
            }
        } else {
            // Regular paragraph
            Text(renderInlineMarkdown(trimmed))
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func renderInlineMarkdown(_ text: String) -> AttributedString {
        var result = AttributedString(text)

        // Bold: **text**
        if let boldRange = text.range(of: "\\*\\*(.+?)\\*\\*", options: .regularExpression) {
            let match = String(text[boldRange])
            let content = match.replacingOccurrences(of: "**", with: "")
            if let attrRange = result.range(of: match) {
                result.replaceSubrange(attrRange, with: AttributedString(content))
            }
        }

        return result
    }
}

#Preview {
    NavigationStack {
        LessonView(lesson: Topic.sampleTopics[0].lessons[0])
            .environmentObject(LanguageManager())
    }
}
