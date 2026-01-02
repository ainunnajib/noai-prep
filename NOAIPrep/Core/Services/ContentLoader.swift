import Foundation

@MainActor
class ContentLoader {
    static let shared = ContentLoader()

    private init() {}

    // MARK: - Load Questions
    func loadQuestions(for topic: String? = nil, count: Int = 20, randomized: Bool = true) -> [Question] {
        let questionBank = NOAIQuestionBank.shared

        if randomized {
            return questionBank.getBalancedQuestions(count: count)
        } else {
            var questions = questionBank.getAllQuestions()
            if let topic = topic {
                questions = questions.filter { $0.topic == topic }
            }
            return questions
        }
    }

    // MARK: - Load Questions by Category
    func loadQuestions(for category: NOAICategory, count: Int = 20) -> [Question] {
        let questionBank = NOAIQuestionBank.shared
        let categoryQuestions = questionBank.getQuestions(for: category)
        return Array(categoryQuestions.shuffled().prefix(count))
    }

    // MARK: - Get Total Question Count
    func getTotalQuestionCount() -> Int {
        return NOAIQuestionBank.shared.getAllQuestions().count
    }
}
