import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vision-tasks.transfer-learning-and-augmentation.1',
    prompt:
      'You have 200 labelled photos of four kinds of local fruit, and an ImageNet-pretrained ResNet (ImageNet already contains many fruit photos). What is the most sensible first approach?',
    options: [
      'Freeze the backbone and train only a new 4-class head on its features',
      'Train the same ResNet from random weights on the 200 photos',
      'Fine-tune every layer with a large learning rate so the new head learns fast',
      'Keep the 1,000-class ImageNet head and retrain just the first conv layer',
    ],
    answer: 0,
    explanation:
      'Small data that looks like ImageNet is the textbook case for **feature extraction**: the frozen backbone already describes fruit well, and a new head has few enough weights to fit from 200 images. Training from scratch or fine-tuning everything would overfit badly, a large learning rate would wipe out the pretrained features, and the old 1,000-class head cannot output your 4 fruit classes.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.transfer-learning-and-augmentation.2',
    prompt: 'Why is fine-tuning a pretrained backbone usually done with a small learning rate?',
    options: [
      'Big updates would overwrite the useful pretrained features the network already has',
      'A small learning rate is what lets gradients reach the frozen backbone layers',
      'A small learning rate makes each training epoch finish faster on a GPU',
      "The optimiser skips the new head's weights unless the learning rate is small",
    ],
    answer: 0,
    explanation:
      'The pretrained weights are already good, so they only need small adjustments. Big steps, especially while the new random head still produces large, noisy gradients, destroy what the network learned on ImageNet: this is called catastrophic forgetting. The learning rate does not change the time per epoch, frozen layers (`requires_grad = False`) get no gradients at any learning rate, and the learning rate has no say in which parameters the optimiser updates.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.transfer-learning-and-augmentation.3',
    prompt:
      'A ResNet-50 backbone produces 2,048 features per image. You freeze the whole backbone and add `nn.Linear(2048, 4)` as the new head. How many parameters are trained?',
    options: ['8,196', '8,192', '2,052', '23,516,228'],
    answer: 0,
    explanation:
      'The head has $2048 \\times 4 = 8192$ weights plus $4$ biases, so $8196$ trainable parameters. 8,192 forgets the biases, 2,052 adds instead of multiplying, and 23,516,228 is the size of the whole model, which would be trained only if nothing were frozen.',
    difficulty: 'beginner',
  },
  {
    id: 'vision-tasks.transfer-learning-and-augmentation.4',
    prompt: 'This pipeline is used to train a handwritten-digit classifier (classes 0 to 9). What is the main problem?',
    code: 'train_tf = transforms.Compose([\n    transforms.RandomRotation(10),\n    transforms.RandomVerticalFlip(p=0.5),\n    transforms.ToTensor(),\n])',
    options: [
      'Vertical flips can make a 6 look like a 9, so some labels become wrong',
      '`RandomRotation(10)` turns each image by exactly 10 degrees, not a random angle',
      '`ToTensor()` has to come before the random transformations, not after them',
      'The same random pipeline should also be applied to the test images',
    ],
    answer: 0,
    explanation:
      'Flipping a 6 top-to-bottom puts its loop at the top, so it looks like a (back-to-front) 9 while still carrying the label 6 (a 180° rotation would give an exact 9): the augmentation breaks the label. `RandomRotation(10)` picks a random angle between −10° and 10°, the order shown is the usual one (`ToTensor()` after the image transformations), and random augmentation belongs on the training set only.',
    difficulty: 'intermediate',
  },
  {
    id: 'vision-tasks.transfer-learning-and-augmentation.5',
    prompt:
      'A model trained on 600 images reaches 99% training accuracy but 72% validation accuracy. Which change is most likely to narrow the gap?',
    options: [
      'Add random flips, crops and colour jitter to the training images only',
      'Train for more epochs until the validation accuracy catches up with training',
      'Apply the same random flips and crops to the validation images',
      'Unfreeze the whole backbone and double the learning rate to learn faster',
    ],
    answer: 0,
    explanation:
      'A large gap between training and validation accuracy is overfitting. Augmentation is a regulariser: it shows a different version of every image each epoch, so the model cannot memorise exact pixels. More epochs usually widen the gap, randomising the validation set only makes its score noisy, and unfreezing more weights with a bigger learning rate adds capacity to overfit and risks wiping out the pretrained features.',
    difficulty: 'beginner',
  },
]

export default questions
