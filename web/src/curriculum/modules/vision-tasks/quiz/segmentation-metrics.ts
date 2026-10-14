import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vision-tasks.segmentation-metrics.1',
    prompt:
      'A 3×3 image has two classes (0 = background, 1 = object).\n\ntrue = `[[1,1,0],[1,1,0],[0,0,0]]`\n\npred = `[[1,1,1],[1,0,0],[0,0,0]]`\n\nWhat is the mean IoU over the two classes?',
    options: ['0.63', '0.78', '0.60', '0.39'],
    answer: 0,
    explanation:
      'Class 1: true has 4 pixels, pred has 4, and 3 are shared, so IoU $= 3/(4 + 4 - 3) = 3/5 = 0.6$. Class 0: 5 and 5 pixels with 4 shared, so IoU $= 4/6 = 0.667$. Mean $= (0.6 + 0.667)/2 = 0.63$. 0.78 is the pixel accuracy ($7/9$), 0.60 is the object class alone, and 0.39 comes from dividing by $|P| + |T|$ without subtracting the overlap.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.segmentation-metrics.2',
    prompt: 'What does this print? (The truth is all background; the model predicts class 2 in one corner pixel. Class 1 appears nowhere.)',
    code:
      'import numpy as np\n\ndef calculate_miou(pred, true, num_classes):\n    ious = []\n    for c in range(num_classes):\n        p, t = (pred == c), (true == c)\n        inter, union = (p & t).sum(), (p | t).sum()\n        if union == 0:\n            continue\n        ious.append(inter / union)\n    return round(float(np.mean(ious)), 3)\n\ntrue = np.zeros((3, 3), dtype=int)\npred = np.array([[0, 0, 0], [0, 0, 0], [0, 0, 2]])\nprint(calculate_miou(pred, true, num_classes=3))',
    options: ['`0.444`', '`0.889`', '`0.63`', '`0.296`'],
    answer: 0,
    explanation:
      'Class 0: intersection 8, union 9, IoU $= 0.889$. Class 1 is in neither map (union 0), so it is skipped. Class 2 is predicted once but never true: union 1, intersection 0, IoU 0. Mean of the two counted classes $= (0.889 + 0)/2 = 0.444$. 0.889 wrongly drops class 2 as well, 0.63 counts class 1 as 1, and 0.296 counts it as 0.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.segmentation-metrics.3',
    prompt: "For the class 'tumour', the predicted mask has 10 pixels, the true mask has 14 pixels, and 8 pixels are in both. What is the Dice score?",
    options: ['0.67', '0.50', '0.80', '0.57'],
    answer: 0,
    explanation:
      'Dice $= 2|P \\cap T|/(|P| + |T|) = 16/24 = 0.67$. 0.50 is the IoU ($8/(10 + 14 - 8) = 8/16$), 0.80 is the precision ($8/10$) and 0.57 is the recall ($8/14$). As always, Dice $= 2(0.5)/(1 + 0.5) = 0.67$ is at least as large as IoU.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.segmentation-metrics.4',
    prompt:
      "In a satellite dataset, 98% of pixels are 'not building' and 2% are 'building'. A model predicts 'not building' for every pixel. What are its pixel accuracy and its mean IoU over the two classes?",
    options: ['Accuracy 0.98, mean IoU 0.49', 'Accuracy 0.98, mean IoU 0.98', 'Accuracy 0.98, mean IoU 0', 'Accuracy 0.50, mean IoU 0.49'],
    answer: 0,
    explanation:
      "Accuracy counts correct pixels: $0.98$. For 'not building', intersection = 98% and union = 100% of pixels, so IoU = 0.98. For 'building', intersection = 0, so IoU = 0. Mean IoU $= (0.98 + 0)/2 = 0.49$. Mean IoU is not 0, because the background class is genuinely well segmented; it is the average with the missed class that exposes the lazy model.",
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.segmentation-metrics.5',
    prompt: 'Why can a model not score a high per-class IoU on a small object class by predicting background everywhere, when it can score high pixel accuracy that way?',
    options: [
      "A class's IoU ignores true negatives, so it can only be high if that class's pixels are actually found",
      "A class's IoU weights every pixel by how rare its class is, so small objects count more",
      "A class's IoU is computed only on the boundary pixels of each object, where background guesses fail",
      "A class's IoU squares each pixel error, so missing a small object costs more than in accuracy",
    ],
    answer: 0,
    explanation:
      "$\\text{IoU}_c = TP/(TP + FP + FN)$: the many correctly-ignored background pixels (true negatives) do not appear, so predicting background everywhere gives TP = 0 and IoU = 0 for the object class. Pixel accuracy includes those true negatives, which is why it is dominated by the background. Mean IoU does give each class an equal vote, but not by weighting pixels, and IoU uses whole regions, not just boundaries or squared errors.",
    difficulty: 'intermediate',
  },
]

export default questions
