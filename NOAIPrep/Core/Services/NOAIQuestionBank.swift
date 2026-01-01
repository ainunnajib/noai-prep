import Foundation

// MARK: - NOAI Preliminary Question Bank
// Target: 1000+ MCQ questions across 4 categories
// Format: 300 MCQ in 3 hours

enum NOAICategory: String, CaseIterable, Codable {
    case mathematics = "Mathematics"
    case computing = "Computing"
    case aiMlDl = "AI/ML/DL"
    case problemSolving = "Problem Solving"

    var icon: String {
        switch self {
        case .mathematics: return "function"
        case .computing: return "chevron.left.forwardslash.chevron.right"
        case .aiMlDl: return "brain.head.profile"
        case .problemSolving: return "puzzlepiece"
        }
    }

    var color: String {
        switch self {
        case .mathematics: return "blue"
        case .computing: return "green"
        case .aiMlDl: return "purple"
        case .problemSolving: return "orange"
        }
    }

    var subcategories: [String] {
        switch self {
        case .mathematics:
            return ["Linear Algebra", "Calculus", "Probability", "Optimization"]
        case .computing:
            return ["Python", "NumPy", "Pandas", "PyTorch", "Debugging"]
        case .aiMlDl:
            return ["Classical ML", "Neural Networks", "Computer Vision", "NLP", "GenAI"]
        case .problemSolving:
            return ["Algorithm Design", "Debugging", "Optimization", "System Design"]
        }
    }
}

// MARK: - Question Bank Storage
@MainActor
class NOAIQuestionBank {
    static let shared = NOAIQuestionBank()

    private init() {}

    func getAllQuestions() -> [Question] {
        var all: [Question] = []
        all.append(contentsOf: mathematicsQuestions)
        all.append(contentsOf: computingQuestions)
        all.append(contentsOf: aiMlDlQuestions)
        all.append(contentsOf: problemSolvingQuestions)
        return all
    }

    func getQuestions(for category: NOAICategory) -> [Question] {
        switch category {
        case .mathematics: return mathematicsQuestions
        case .computing: return computingQuestions
        case .aiMlDl: return aiMlDlQuestions
        case .problemSolving: return problemSolvingQuestions
        }
    }

    func getRandomQuestions(count: Int) -> [Question] {
        let all = getAllQuestions()
        return Array(all.shuffled().prefix(count))
    }

    func getBalancedQuestions(count: Int) -> [Question] {
        // Get equal questions from each category
        let perCategory = count / 4
        var result: [Question] = []

        for category in NOAICategory.allCases {
            let questions = getQuestions(for: category).shuffled()
            result.append(contentsOf: questions.prefix(perCategory))
        }

        // Fill remaining with random questions
        let remaining = count - result.count
        if remaining > 0 {
            let all = getAllQuestions().filter { q in !result.contains { $0.id == q.id } }
            result.append(contentsOf: all.shuffled().prefix(remaining))
        }

        return result.shuffled()
    }

    // MARK: - Mathematics Questions (250+)
    var mathematicsQuestions: [Question] {
        var questions: [Question] = []
        questions.append(contentsOf: linearAlgebraQuestions)
        questions.append(contentsOf: calculusQuestions)
        questions.append(contentsOf: probabilityQuestions)
        questions.append(contentsOf: optimizationQuestions)
        return questions
    }

    // MARK: - Computing Questions (250+)
    var computingQuestions: [Question] {
        var questions: [Question] = []
        questions.append(contentsOf: pythonQuestions)
        questions.append(contentsOf: numpyQuestions)
        questions.append(contentsOf: pandasQuestions)
        questions.append(contentsOf: pytorchQuestions)
        questions.append(contentsOf: debuggingQuestions)
        return questions
    }

    // MARK: - AI/ML/DL Questions (250+)
    var aiMlDlQuestions: [Question] {
        var questions: [Question] = []
        questions.append(contentsOf: classicalMLQuestions)
        questions.append(contentsOf: neuralNetworkQuestions)
        questions.append(contentsOf: computerVisionQuestions)
        questions.append(contentsOf: nlpQuestions)
        questions.append(contentsOf: genAIQuestions)
        return questions
    }

    // MARK: - Problem Solving Questions (250+)
    var problemSolvingQuestions: [Question] {
        var questions: [Question] = []
        questions.append(contentsOf: algorithmDesignQuestions)
        questions.append(contentsOf: debuggingProblemQuestions)
        questions.append(contentsOf: optimizationProblemQuestions)
        questions.append(contentsOf: systemDesignQuestions)
        return questions
    }

    // MARK: - Placeholder Arrays (to be filled with more questions)
    // Computing subcategories - now linked to actual question files
    // numpyQuestions, pandasQuestions, pytorchQuestions, debuggingQuestions are defined in their respective files

    // AI/ML/DL subcategories
    // classicalMLQuestions is defined in AIMLDL_ClassicalML.swift
    // neuralNetworkQuestions is defined in AIMLDL_NeuralNetworks.swift
    // computerVisionQuestions is defined in AIMLDL_ComputerVision.swift
    // nlpQuestions is defined in AIMLDL_NLP.swift
    // genAIQuestions is defined in AIMLDL_GenAI.swift

    // Problem Solving subcategories
    // algorithmDesignQuestions is defined in ProblemSolving_AlgorithmDesign.swift
    // debuggingProblemQuestions is defined in ProblemSolving_Debugging.swift
    // optimizationProblemQuestions is defined in ProblemSolving_Optimization.swift
    // systemDesignQuestions is defined in ProblemSolving_SystemDesign.swift
}
