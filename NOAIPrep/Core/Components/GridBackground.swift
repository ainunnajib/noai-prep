import SwiftUI

struct GridBackground: View {
    var lineColor: Color = .gray.opacity(0.2)
    var gridSize: CGFloat = 30

    var body: some View {
        GeometryReader { geometry in
            Path { path in
                // Vertical lines
                let verticalLines = Int(geometry.size.width / gridSize)
                for i in 0...verticalLines {
                    let x = CGFloat(i) * gridSize
                    path.move(to: CGPoint(x: x, y: 0))
                    path.addLine(to: CGPoint(x: x, y: geometry.size.height))
                }

                // Horizontal lines
                let horizontalLines = Int(geometry.size.height / gridSize)
                for i in 0...horizontalLines {
                    let y = CGFloat(i) * gridSize
                    path.move(to: CGPoint(x: 0, y: y))
                    path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                }
            }
            .stroke(lineColor, lineWidth: 0.5)
        }
    }
}

#Preview {
    GridBackground()
        .frame(width: 300, height: 300)
        .background(Color(.systemGray6))
}
