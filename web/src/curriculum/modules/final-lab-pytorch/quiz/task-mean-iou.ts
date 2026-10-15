import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.task-mean-iou.1',
    prompt:
      'Two classes. `pred = [[1, 1], [0, 1]]` and `true = [[1, 0], [0, 1]]`. Using the rule "skip a class only when its union is 0", what is the mean IoU?',
    options: ['$7/12 \\approx 0.583$', '$3/4 = 0.75$', '$2/3 \\approx 0.667$', '$5/6 \\approx 0.833$'],
    answer: 0,
    explanation:
      'Flatten: pred $[1, 1, 0, 1]$, true $[1, 0, 0, 1]$. Class 0: predicted at position 2, true at positions 1 and 2, so intersection 1 and union 2, IoU $1/2$. Class 1: predicted at 0, 1, 3, true at 0, 3, so intersection 2 and union 3, IoU $2/3$. Mean $= (1/2 + 2/3)/2 = 7/12 \\approx 0.583$. $3/4$ is the pixel accuracy, which is not the same thing.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.task-mean-iou.2',
    prompt: 'In `calculate_miou`, class 2 appears in neither `pred_mask` nor `true_mask`. What should happen to class 2?',
    options: [
      'Skip it: its union is 0, so it is left out of the average',
      'Score it 1.0, because the model correctly predicted no class-2 pixels',
      'Score it 0.0, to penalise the model for a class it never found',
      'Score it `nan`, then remove `nan` values with `np.nanmean` at the end',
    ],
    answer: 0,
    explanation:
      'With intersection 0 and union 0, IoU is $0/0$, undefined, so the task says to skip the class. Scoring it 1.0 would hand out free marks for every absent class and inflate the mean; scoring it 0.0 punishes the model for being right. Producing `nan` first breaks the rule "check union == 0 BEFORE dividing".',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.task-mean-iou.3',
    prompt:
      'The notebook\'s extra check uses `pred = [[0, 0], [0, 1]]` and an all-zero `true`, with `num_classes=2`, and expects 0.75. What does a correct implementation of the written rule ("skip a class when its union is 0") return?',
    options: ['0.375', '0.75', '0.5', '1.0'],
    answer: 0,
    explanation:
      'Class 0: intersection 3, union 4, IoU 0.75. Class 1 is predicted once, so its union is 1, not 0: it is not skipped and scores $0/1 = 0$. Mean $(0.75 + 0)/2 = 0.375$. The expected 0.75 only comes from averaging the classes present in the ground truth, a different rule; the official solution also returns 0.375 here.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-mean-iou.4',
    prompt: 'What does `inter` hold after this code runs?',
    code: 'pred = torch.tensor([0, 1, 1, 2, 1])\ntrue = torch.tensor([1, 1, 0, 2, 1])\np = (pred == 1)\nt = (true == 1)\ninter = (p & t).sum().item()',
    options: ['`2`, a Python int', '`tensor(2)`, a 0-d tensor', '`3`, a Python int', '`tensor([False, True, False, False, True])`'],
    answer: 0,
    explanation:
      '`p` is True at positions 1, 2, 4 and `t` at positions 0, 1, 4; both are True at positions 1 and 4, so the sum is 2. `.item()` turns the 0-d tensor `tensor(2)` into the plain Python int 2. 3 is the size of `p` alone (or of the union minus one); the boolean tensor is `p & t` before `.sum()`.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.task-mean-iou.5',
    prompt:
      'A student\'s `calculate_miou` returns `nan` on the grader\'s test, where both masks are all zeros and `num_classes=2`. Which change fixes it?',
    code: 'for cls in range(num_classes):\n    p = (pred_flat == cls)\n    t = (true_flat == cls)\n    inter = (p & t).sum()\n    union = (p | t).sum()\n    ious.append(inter / union)\nreturn torch.stack(ious).mean().item()',
    options: [
      'Check `if union == 0: continue` before the division',
      'Replace `&` and `|` with `and` and `or`',
      'Call `.float()` on `inter` and `union` before dividing',
      'Divide by `union + 1` so the denominator is never 0',
    ],
    answer: 0,
    explanation:
      'Class 1 is in neither map, so its union is 0 and `0 / 0` gives `tensor(nan)`, which makes the whole mean `nan`. Skipping classes with union 0 leaves only class 0 (IoU 1.0), the expected answer. `and`/`or` raise an error on tensors, `.float()` still gives $0/0$, and adding 1 to every union changes every IoU (class 0 would score 4/5).',
    difficulty: 'intermediate',
  },
]

export default questions
