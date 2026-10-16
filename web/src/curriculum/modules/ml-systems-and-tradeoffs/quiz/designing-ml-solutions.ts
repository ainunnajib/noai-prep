import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-systems-and-tradeoffs.designing-ml-solutions.1',
    prompt:
      'A bank has 50,000 past loans, each described by 30 numeric and categorical columns (income, age, employment type, ...), and wants to predict which new loans will default. After a logistic-regression baseline, what should the team try first?',
    options: [
      'Gradient-boosted trees such as XGBoost or LightGBM',
      'A Transformer pretrained on text, fine-tuned on each row written out as a sentence',
      'A CNN trained from scratch, treating the table of columns as an image',
      'k-NN on the raw columns, with k chosen by trial and error',
    ],
    answer: 0,
    explanation:
      'This is tabular data of moderate size, where gradient-boosted trees are the strong default: they capture non-linear effects and interactions between columns and cope with mixed types and missing values. A table has no word order or pixel grid for a Transformer or CNN to exploit, and k-NN on unscaled columns of very different ranges is dominated by whichever column has the biggest numbers.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.designing-ml-solutions.2',
    prompt: 'A screening model for a disease that affects 2% of patients reports 98% accuracy on the test set. Why is this not yet evidence that the model is useful?',
    options: [
      'Always predicting "healthy" also scores 98%, so the model must beat that baseline on recall or precision',
      'Accuracy above 95% on a test set usually means test data leaked into training, so the true accuracy is much lower',
      'Accuracy cannot be computed for medical data, because the cost of a mistake differs from patient to patient',
      'A 2% error rate is too high for medical use, so the model should reach 99.9% accuracy before it is deployed',
    ],
    answer: 0,
    explanation:
      'With 2% positives, the do-nothing baseline that always says "healthy" is right 98% of the time while catching no one. The model might be doing exactly that. Compare it with the baseline on recall (how many sick patients it finds) and precision, which expose a useless model at once. A high accuracy alone does not imply leakage, and accuracy can be computed for any labelled test set; it is just the wrong yardstick here.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.designing-ml-solutions.3',
    prompt: 'A model has 50 million parameters stored as 32-bit floats. Roughly how large is it after quantising every weight to 8-bit integers?',
    options: ['50 MB', '100 MB', '200 MB', '25 MB'],
    answer: 0,
    explanation:
      'At 32 bits (4 bytes) per weight the model takes $50 \\text{ million} \\times 4 = 200$ MB. At 8 bits (1 byte) it takes $50 \\text{ million} \\times 1 = 50$ MB, 4 times smaller. 200 MB forgets that each parameter gets smaller even though the number of parameters stays the same; 100 MB would be 16-bit weights and 25 MB would need 4-bit weights.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-systems-and-tradeoffs.designing-ml-solutions.4',
    prompt: 'Which of these describes knowledge distillation?',
    options: [
      'Training a small student network to match the softened output probabilities of a large teacher network, as well as the true labels',
      'Setting the trained network\'s weights that are closest to zero to exactly zero, then fine-tuning the weights that remain',
      'Storing each trained weight as an 8-bit integer plus one shared scale per layer, instead of storing it as a 32-bit float',
      'Training the large network on a smaller, cleaner subset of the training data so that it converges in far fewer update steps',
    ],
    answer: 0,
    explanation:
      "Distillation trains a smaller model (the student) to imitate a bigger one (the teacher), using the teacher's soft probabilities, which show how similar the wrong classes are, as extra targets. Setting small weights to zero is pruning, and storing weights as 8-bit integers is quantisation: both shrink the same network instead of training a new, smaller one.",
    difficulty: 'intermediate',
  },
  {
    id: 'ml-systems-and-tradeoffs.designing-ml-solutions.5',
    prompt:
      'A camera app must classify each photo within 30 ms. The candidates are P (92% accurate, 120 ms), Q (89%, 28 ms), R (87%, 35 ms) and S (84%, 9 ms). Which model should be deployed?',
    options: ['Q (89%, 28 ms)', 'P (92%, 120 ms)', 'S (84%, 9 ms)', 'R (87%, 35 ms)'],
    answer: 0,
    explanation:
      'Only Q and S meet the 30 ms budget, and Q is the more accurate of the two, so Q is the best point on the frontier for this requirement. P is the most accurate but four times too slow. R is dominated: Q is both faster and more accurate, so R is never worth choosing.',
    difficulty: 'intermediate',
  },
]

export default questions
