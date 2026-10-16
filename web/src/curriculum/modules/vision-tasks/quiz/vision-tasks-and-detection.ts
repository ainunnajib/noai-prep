import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vision-tasks.vision-tasks-and-detection.1',
    prompt:
      'A model takes a 256 × 256 street photo and outputs a 256 × 256 array in which every entry is a class id (0 = road, 1 = car, 2 = person, ...). Two touching cars get the same id. Which task is this?',
    options: ['Semantic segmentation', 'Instance segmentation', 'Object detection', 'Image classification'],
    answer: 0,
    explanation:
      'One class id per pixel, with objects of the same class sharing an id, is **semantic segmentation**. Instance segmentation would give each car its own mask, detection would output a list of boxes, and classification a single label for the whole image.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.vision-tasks-and-detection.2',
    prompt:
      'Four boxes of the same class have scores W = 0.9, X = 0.85, Y = 0.7, Z = 0.6. Their IoUs are: W–X 0.7, W–Y 0.2, W–Z 0.1, X–Y 0.1, X–Z 0.6, Y–Z 0.3. Which boxes does NMS keep with an IoU threshold of 0.5?',
    options: ['W, Y and Z', 'W and Y', 'W and X', 'W, X and Y'],
    answer: 0,
    explanation:
      'Keep W; X overlaps it by 0.7 > 0.5, so X is suppressed, while Y (0.2) and Z (0.1) stay. Keep Y; Y–Z is 0.3 ≤ 0.5, so Z stays and is kept last. "W and Y" wrongly lets the already-suppressed X delete Z (suppressed boxes never suppress anything), and "W and X" gets the direction backwards: boxes are removed when their IoU is *above* the threshold, not below it.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.vision-tasks-and-detection.3',
    prompt: 'Which statement correctly contrasts R-CNN with YOLO?',
    options: [
      'R-CNN classifies about 2,000 proposed regions one by one; YOLO predicts all boxes in a single pass over a grid',
      'R-CNN predicts all boxes in a single pass over a grid; YOLO classifies about 2,000 proposed regions one by one',
      'R-CNN labels each pixel with a class through a mask branch; YOLO outputs a single label for the whole image',
      'R-CNN needs no NMS thanks to one-to-one matching; YOLO turns learned object queries into boxes with a Transformer',
    ],
    answer: 0,
    explanation:
      'R-CNN is a two-stage detector: selective search proposes about 2,000 regions and a CNN classifies each, which is accurate but slow. YOLO is one-stage: one forward pass predicts boxes and classes for every grid cell at once, fast enough for real time. One-to-one matching and object queries describe DETR, a mask branch belongs to Mask R-CNN, and a single label for the whole image is classification.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.vision-tasks-and-detection.4',
    prompt:
      'A shopping-mall camera must count shoppers and outline each person separately, even when people overlap. Which model is the standard choice?',
    options: ['Mask R-CNN', 'U-Net', 'YOLO', 'ResNet-50 classifier'],
    answer: 0,
    explanation:
      'Separate outlines for overlapping people is **instance segmentation**, and Mask R-CNN (Faster R-CNN plus a mask for each detected box) is the classic model for it. U-Net does semantic segmentation, which would merge overlapping people into one region; classic YOLO gives boxes, not outlines (newer -seg versions add masks, but Mask R-CNN is the textbook instance-segmentation model); a classifier gives one label per image.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.vision-tasks-and-detection.5',
    prompt:
      'A detector on a crowded MRT platform often reports two people standing shoulder to shoulder as a single person. Its NMS uses an IoU threshold of 0.3. Which change is most likely to help?',
    options: [
      'Raise the NMS IoU threshold to about 0.6',
      'Lower the NMS IoU threshold to about 0.1',
      'Raise the confidence cut-off to about 0.9',
      'Merge the classes into a single NMS pass',
    ],
    answer: 0,
    explanation:
      'Boxes of two neighbouring people overlap, and with a threshold of 0.3 the higher-scoring one deletes the other. Raising the threshold means only near-identical boxes count as duplicates. Lowering it would delete even more neighbours, a higher confidence cut-off removes boxes rather than recovering them, and merging the classes into one NMS pass can only add suppression (the two people are the same class anyway).',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.vision-tasks-and-detection.6',
    prompt:
      'A detector draws one box on a dog, and that box has IoU 0.45 with the true dog box. No other box overlaps the dog. When **mAP@0.5** is computed, how is this prediction counted?',
    options: [
      'As a false positive, and the dog also counts as a missed object',
      'As a true positive, because any overlap with an object of the right class counts',
      'As 0.45 of a true positive, because AP weights each box by its IoU',
      'It is ignored, because NMS deletes boxes whose IoU is below 0.5',
    ],
    answer: 0,
    explanation:
      'For mAP@0.5 a prediction is a true positive only when its IoU with an unmatched true box of the same class is **at least 0.5**. Here 0.45 falls short, so the box is a false positive and the dog stays unmatched (a false negative). AP counts hits and misses; it does not give partial credit by IoU. NMS compares predicted boxes with each other, not with the ground truth, and removes boxes whose IoU is *above* its threshold.',
    difficulty: 'intermediate',
  },
]

export default questions
