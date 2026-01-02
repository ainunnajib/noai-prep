import Foundation
import SwiftData
import SwiftUI

// MARK: - Quiz Result Model (SwiftData)
@Model
final class QuizResult {
    var id: UUID
    var quizType: String
    var score: Int
    var totalQuestions: Int
    var timeTaken: TimeInterval
    var completedAt: Date
    var answers: [String: String]

    init(quizType: String, score: Int, totalQuestions: Int, timeTaken: TimeInterval, answers: [String: String]) {
        self.id = UUID()
        self.quizType = quizType
        self.score = score
        self.totalQuestions = totalQuestions
        self.timeTaken = timeTaken
        self.completedAt = Date()
        self.answers = answers
    }

    var percentage: Double {
        guard totalQuestions > 0 else { return 0 }
        return Double(score) / Double(totalQuestions) * 100
    }
}

// MARK: - User Progress Model (SwiftData) - Simplified for quiz tracking
@Model
final class UserProgress {
    var id: UUID
    var lastQuizDate: Date
    var totalTimeSpent: TimeInterval

    init() {
        self.id = UUID()
        self.lastQuizDate = Date()
        self.totalTimeSpent = 0
    }
}

// MARK: - Difficulty Enum
enum Difficulty: String, Codable {
    case beginner
    case intermediate
    case advanced

    var displayName: String {
        switch self {
        case .beginner: return "Beginner"
        case .intermediate: return "Intermediate"
        case .advanced: return "Advanced"
        }
    }

    var color: Color {
        switch self {
        case .beginner: return .success
        case .intermediate: return .warning
        case .advanced: return .error
        }
    }
}

// MARK: - Quiz Models
struct Question: Identifiable, Codable {
    let id: String
    let questionEN: String
    let questionID: String
    let options: [QuestionOption]
    let correctOptionId: String
    let explanationEN: String
    let explanationID: String
    let topic: String
    let difficulty: Difficulty

    func localizedQuestion(_ language: AppLanguage) -> String {
        language == .english ? questionEN : questionID
    }

    func localizedExplanation(_ language: AppLanguage) -> String {
        language == .english ? explanationEN : explanationID
    }
}

struct QuestionOption: Identifiable, Codable {
    let id: String
    let textEN: String
    let textID: String

    func localizedText(_ language: AppLanguage) -> String {
        language == .english ? textEN : textID
    }
}

// MARK: - Sample Questions (for previews)
extension Question {
    static let sampleQuestions: [Question] = [
        Question(
            id: "sample1",
            questionEN: "What is the primary goal of supervised learning?",
            questionID: "Apa tujuan utama dari supervised learning?",
            options: [
                QuestionOption(id: "a", textEN: "To find hidden patterns in data", textID: "Menemukan pola tersembunyi dalam data"),
                QuestionOption(id: "b", textEN: "To learn a mapping from inputs to outputs using labeled data", textID: "Mempelajari pemetaan dari input ke output menggunakan data berlabel"),
                QuestionOption(id: "c", textEN: "To maximize a reward signal", textID: "Memaksimalkan sinyal reward"),
                QuestionOption(id: "d", textEN: "To compress data efficiently", textID: "Mengompresi data secara efisien")
            ],
            correctOptionId: "b",
            explanationEN: "Supervised learning uses labeled data to learn a mapping function from inputs to outputs.",
            explanationID: "Supervised learning menggunakan data berlabel untuk mempelajari fungsi pemetaan dari input ke output.",
            topic: "ML Foundations",
            difficulty: .beginner
        )
    ]
}
