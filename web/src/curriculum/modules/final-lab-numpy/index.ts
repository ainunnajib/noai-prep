import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "final-lab-numpy",
  order: 37,
  part: "exam",
  domain: "exam",
  title: "Final lab I: from scratch in NumPy",
  tagline: "Rebuild every classic-ML Final task",
  summary: "How the Final's Jupyter notebooks work and how to plan three hours, then full rebuilds of the four NumPy tasks: 2025 linear regression by gradient descent, 2025 K-means, 2025 TF-IDF retrieval-augmented generation, and 2026 gradient boosting with early stopping.",
  prerequisites: ["linear-regression", "unsupervised-learning", "trees-and-ensembles", "prompting-and-rag"],
  syllabus: ["NOAI Final Section 2: 3 Python programming tasks in Jupyter (80 marks in 2025 and 2026)", "2025 Q1 (15 marks): linear regression by gradient descent; Q2 (25): K-means; Q3 (40): RAG with TF-IDF and cosine similarity (standard library + NumPy)", "2026 Task 1 (25 marks incl. 5 bonus): gradient boosting from scratch with L1/L2 losses and early stopping (NumPy + sklearn trees)"],
  lessons: [
    {
      slug: "exam-notebook-skills",
      title: "Working in the exam notebook and planning three hours",
      summary: "Read stubs, respect DO-NOT-EDIT cells, test as you go, avoid kernel-state traps, format outputs exactly, and split three hours across the MCQs and tasks.",
      minutes: 20,
      objectives: ["You can identify what each notebook cell expects", "You can test functions with small hand-checked inputs", "You can avoid common formatting and signature mistakes", "You can plan your time across the MCQs and three tasks to bank partial marks"],
      load: () => import('./exam-notebook-skills.mdx'),
    },
    {
      slug: "task-linear-regression-gd",
      title: "2025 Task 1: Linear regression by gradient descent",
      summary: "Rebuild the 15-mark task and check your answer against the expected output.",
      minutes: 20,
      objectives: ["You can implement vectorised gradient descent for linear regression", "You can verify convergence and round the coefficients"],
      load: () => import('./task-linear-regression-gd.mdx'),
    },
    {
      slug: "task-kmeans",
      title: "2025 Task 2: K-means from scratch",
      summary: "Rebuild the 25-mark K-means task with distance helper, assignment, update and convergence.",
      minutes: 22,
      objectives: ["You can implement euclidean_distance and k_means_clustering", "You can handle empty clusters and convergence correctly"],
      load: () => import('./task-kmeans.mdx'),
    },
    {
      slug: "task-rag-tfidf",
      title: "2025 Task 3: Retrieval-augmented generation with TF-IDF",
      summary: "Build the 40-mark RAG pipeline in NumPy: vocabulary, TF-IDF, cosine retrieval and response generation.",
      minutes: 25,
      objectives: ["You can build TF-IDF vectors for documents and a query in NumPy", "You can retrieve the top documents by cosine similarity", "You can generate a response from retrieved documents and explain your approach"],
      load: () => import('./task-rag-tfidf.mdx'),
    },
    {
      slug: "task-gradient-boosting",
      title: "2026 Task 1: Gradient boosting from scratch",
      summary: "Rebuild the 25-mark task: gradients, initial predictions, the class, the fit loop and early stopping.",
      minutes: 25,
      objectives: ["You can implement L1/L2 negative gradients and initial predictions", "You can implement fit and predict with subsampling", "You can add early stopping for the bonus"],
      load: () => import('./task-gradient-boosting.mdx'),
    },
  ],
}

export default mod
