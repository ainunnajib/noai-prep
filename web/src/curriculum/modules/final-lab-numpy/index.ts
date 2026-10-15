import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "final-lab-numpy",
  order: 37,
  part: "exam",
  domain: "exam",
  title: "Final lab I: from scratch in NumPy",
  tagline: "Rebuild every NumPy task from the 2025 and 2026 Finals",
  summary: "How the Final's Jupyter notebooks work and how to plan three hours, then full rebuilds of the four NumPy tasks: 2025 linear regression by gradient descent, 2025 K-means, 2025 TF-IDF retrieval-augmented generation, and 2026 gradient boosting with early stopping.",
  prerequisites: ["linear-regression", "unsupervised-learning", "trees-and-ensembles", "text-as-data", "prompting-and-rag"],
  syllabus: ["NOAI Final Section 2: 3 Python programming tasks in Jupyter (80 marks in 2025 and 2026)", "2025 Q1 (15 marks): linear regression by gradient descent; Q2 (25): K-means; Q3 (40): RAG with TF-IDF and cosine similarity (standard library + NumPy)", "2026 Task 1 (25 marks incl. 5 bonus): gradient boosting from scratch with L1/L2 losses and early stopping (NumPy + sklearn trees)"],
  lessons: [
    {
      slug: "exam-notebook-skills",
      title: "Working in the exam notebook and planning three hours",
      summary: "Read stubs, respect DO-NOT-EDIT cells, test as you go, read error messages, avoid kernel-state traps, format outputs exactly, and split three hours across the MCQs and tasks.",
      minutes: 30,
      objectives: ["You can read a task's stub, data and test cells and keep every name and parameter exactly as given", "You can test each function on tiny hand-checked cases and print or return values in the requested format", "You can explain why the kernel may run older code than the page shows, and fix it by re-running cells", "You can rank unfinished parts by expected marks per minute to plan the three hours"],
      load: () => import('./exam-notebook-skills.mdx'),
    },
    {
      slug: "task-linear-regression-gd",
      title: "2025 Task 1: Linear regression by gradient descent",
      summary: "Rebuild the 15-mark task in three vectorised lines and prove the answer is right with your own checks, since the notebook gave no expected output.",
      minutes: 25,
      objectives: ["You can turn the task's update rule into vectorised NumPy and do one step by hand", "You can check the answer without a key, against one hand step and the least-squares solution", "You can interpret the coefficients when the intercept column holds 2s, and recognise each classic mistake from its output"],
      load: () => import('./task-linear-regression-gd.mdx'),
    },
    {
      slug: "task-kmeans",
      title: "2025 Task 2: K-means from scratch",
      summary: "Rebuild the 25-mark K-means task: distance helper, assignment, update, empty clusters and convergence, then the same algorithm vectorised.",
      minutes: 25,
      objectives: ["You can write euclidean_distance and k_means_clustering to match the notebook's recipe and output format", "You can trace an assign-and-update round by hand and vectorise it with broadcasting and argmin", "You can guard against empty clusters and stop at convergence without rounding too early"],
      load: () => import('./task-kmeans.mdx'),
    },
    {
      slug: "task-rag-tfidf",
      title: "2025 Task 3: Retrieval-augmented generation with TF-IDF",
      summary: "Build the 40-mark RAG pipeline in NumPy: vocabulary, TF-IDF, cosine retrieval, response generation and the thought-process answer.",
      minutes: 30,
      objectives: ["You can build TF-IDF vectors for the documents and the query in the same vector space", "You can rank documents by cosine similarity and keep the top k, best first", "You can generate an honest response from the retrieved documents and explain your choices"],
      load: () => import('./task-rag-tfidf.mdx'),
    },
    {
      slug: "task-gradient-boosting",
      title: "2026 Task 1: Gradient boosting from scratch",
      summary: "Rebuild the 25-mark task: gradients, initial predictions, the class, the fit loop and early stopping.",
      minutes: 35,
      objectives: ["You can write the L1 and L2 negative gradients and start from the median or the mean", "You can write fit and predict so that every tree updates every row, scaled by the learning rate", "You can add early stopping with patience and keep the right number of trees"],
      load: () => import('./task-gradient-boosting.mdx'),
    },
  ],
}

export default mod
