import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prompting-and-rag.prompt-engineering.1',
    prompt: 'A student sends this prompt to an LLM. What kind of prompt is it?',
    code: 'Translate English to Malay.\nGood morning -> Selamat pagi\nThank you ->',
    codeLang: 'text',
    options: ['One-shot', 'Zero-shot', 'Few-shot', 'Fine-tuning'],
    answer: 0,
    explanation:
      'There is exactly one solved example (Good morning → Selamat pagi); "Thank you →" is the new input the model must complete, not an example. Zero-shot would have the instruction only, few-shot needs several examples, and fine-tuning is not a prompt at all: it updates the weights.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.prompt-engineering.2',
    prompt: 'Which statement correctly compares few-shot prompting with fine-tuning?',
    options: [
      'Few-shot prompting puts examples in the input and leaves the weights unchanged; fine-tuning updates the weights by further training.',
      'Few-shot prompting nudges the weights a little for each example; fine-tuning nudges them a lot using many examples.',
      'Few-shot prompting needs thousands of labelled examples; fine-tuning needs only two or three examples placed in the prompt.',
      'Both change the weights permanently, but few-shot prompting is faster because it uses a much smaller learning rate.',
    ],
    answer: 0,
    explanation:
      'In-context learning computes $P_\\theta(y \\mid \\text{examples}, x)$ with the same $\\theta$: nothing is trained, and the effect vanishes when the examples leave the prompt. Fine-tuning runs gradient descent on task data and changes $\\theta$. The "nudges the weights a little" option is the classic misconception that prompting is a mini training run.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.prompt-engineering.3',
    prompt: 'Why does adding "Let\'s think step by step" often make an LLM more accurate on multi-step maths word problems?',
    options: [
      'The written steps put intermediate results into the context, so later tokens can build on them instead of doing everything in one step.',
      'The phrase starts a short fine-tuning run on maths problems, so the weights are better suited to the question before it answers.',
      'The phrase raises the sampling temperature, so the model tries out more possible answers before choosing the final one.',
      'The phrase enlarges the context window, so the model can see more of the question at once while it is answering.',
    ],
    answer: 0,
    explanation:
      'This is chain-of-thought prompting. Each token gets one fixed-size pass through the network, so answering immediately squeezes every step into one pass; writing the working gives the model scratch paper it can read back. The phrase changes neither the weights, the temperature nor the context window size.',
    difficulty: 'intermediate',
  },
  {
    id: 'prompting-and-rag.prompt-engineering.4',
    prompt:
      'A Python script must read an LLM\'s grade for each essay, but the replies vary: "Grade: B", "I\'d give this a B+ because…", "B". Which change to the prompt fixes this best?',
    options: [
      'Specify the exact output, e.g. JSON with one key "grade", and show one example reply',
      'Add the role "You are a strict and very experienced English teacher"',
      'Raise the sampling temperature so that the model sounds more decisive',
      'Add "Let\'s think step by step" so the model explains every grade',
    ],
    answer: 0,
    explanation:
      'When code reads the answer, the format is the problem to solve: state it exactly and show an example, then parse it with `json.loads` (and still check it). A role changes tone, not shape; a higher temperature makes replies more varied, not less; and chain-of-thought adds even more free text before the grade.',
    difficulty: 'beginner',
  },
  {
    id: 'prompting-and-rag.prompt-engineering.5',
    prompt: 'What does this code print, and what kind of prompt does it build?',
    code: String.raw`examples = [("cold noodles, rude uncle", "negative"),
            ("shiok laksa!", "positive")]
prompt = "Classify the sentiment.\n"
for text, label in examples:
    prompt += f"Review: {text}\nSentiment: {label}\n"
prompt += "Review: worth the queue\nSentiment:"
print(prompt.count("Sentiment:"))`,
    options: ['`3`, and it is a two-shot (few-shot) prompt', '`2`, and it is a two-shot (few-shot) prompt', '`3`, and it is a three-shot (few-shot) prompt', '`2`, and it is a one-shot prompt'],
    answer: 0,
    explanation:
      'The loop adds "Sentiment:" once per example (2 times) and the last line adds it once more for the new review, so the count is 3. Only the 2 solved examples are shots; the third "Sentiment:" is left unfinished for the model to complete, so this is a two-shot prompt.',
    difficulty: 'intermediate',
  },
]

export default questions
