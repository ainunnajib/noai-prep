import SwiftUI

struct StatBox: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.system(.headline, design: .monospaced))
                .fontWeight(.bold)
                .foregroundStyle(color)

            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

#Preview {
    HStack {
        StatBox(title: "Iteration", value: "5", color: .blue)
        StatBox(title: "Points", value: "30", color: .purple)
        StatBox(title: "Status", value: "Running", color: .orange)
    }
    .padding()
}
