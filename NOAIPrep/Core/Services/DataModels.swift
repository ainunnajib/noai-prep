import Foundation
import SwiftData

// MARK: - User Progress Model (SwiftData)
@Model
final class UserProgress {
    var id: UUID
    var topicId: String
    var lessonsCompleted: [String]
    var lastAccessedAt: Date
    var totalTimeSpent: TimeInterval

    init(topicId: String) {
        self.id = UUID()
        self.topicId = topicId
        self.lessonsCompleted = []
        self.lastAccessedAt = Date()
        self.totalTimeSpent = 0
    }

    func markLessonCompleted(_ lessonId: String) {
        if !lessonsCompleted.contains(lessonId) {
            lessonsCompleted.append(lessonId)
        }
        lastAccessedAt = Date()
    }
}

// MARK: - Quiz Result Model (SwiftData)
@Model
final class QuizResult {
    var id: UUID
    var quizType: String
    var score: Int
    var totalQuestions: Int
    var timeTaken: TimeInterval
    var completedAt: Date
    var answers: [String: String] // questionId: selectedAnswer

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

// MARK: - Content Models (JSON Decodable)
struct Topic: Identifiable, Codable {
    let id: String
    let titleEN: String
    let titleID: String
    let descriptionEN: String
    let descriptionID: String
    let iconName: String
    let color: String
    let lessons: [Lesson]

    func localizedTitle(_ language: AppLanguage) -> String {
        language == .english ? titleEN : titleID
    }

    func localizedDescription(_ language: AppLanguage) -> String {
        language == .english ? descriptionEN : descriptionID
    }
}

struct Lesson: Identifiable, Codable {
    let id: String
    let titleEN: String
    let titleID: String
    let contentEN: String
    let contentID: String
    let difficulty: Difficulty
    let estimatedMinutes: Int
    let codeExample: String?

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

        var color: String {
            switch self {
            case .beginner: return "green"
            case .intermediate: return "orange"
            case .advanced: return "red"
            }
        }
    }

    func localizedTitle(_ language: AppLanguage) -> String {
        language == .english ? titleEN : titleID
    }

    func localizedContent(_ language: AppLanguage) -> String {
        language == .english ? contentEN : contentID
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
    let difficulty: Lesson.Difficulty

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

// MARK: - Code Snippet Models
struct CodeSnippet: Identifiable, Codable {
    let id: String
    let titleEN: String
    let titleID: String
    let descriptionEN: String
    let descriptionID: String
    let code: String
    let language: String
    let category: SnippetCategory
    let colabURL: String?

    enum SnippetCategory: String, Codable, CaseIterable {
        case numpy
        case pandas
        case sklearn
        case pytorch

        var displayName: String {
            switch self {
            case .numpy: return "NumPy"
            case .pandas: return "Pandas"
            case .sklearn: return "Scikit-learn"
            case .pytorch: return "PyTorch"
            }
        }

        var iconName: String {
            switch self {
            case .numpy: return "number.square"
            case .pandas: return "tablecells"
            case .sklearn: return "brain.head.profile"
            case .pytorch: return "flame"
            }
        }
    }

    func localizedTitle(_ language: AppLanguage) -> String {
        language == .english ? titleEN : titleID
    }

    func localizedDescription(_ language: AppLanguage) -> String {
        language == .english ? descriptionEN : descriptionID
    }
}
