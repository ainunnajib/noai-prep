import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'convolutional-networks.cnn-architectures-and-resnets.1',
    prompt: 'The input is `torch.randn(8, 3, 32, 32)`. What number must replace `???` so that the model runs?',
    code: 'model = nn.Sequential(\n    nn.Conv2d(3, 32, kernel_size=3),    # no padding\n    nn.ReLU(),\n    nn.MaxPool2d(2),\n    nn.Conv2d(32, 64, kernel_size=3),   # no padding\n    nn.ReLU(),\n    nn.MaxPool2d(2),\n    nn.Flatten(),\n    nn.Linear(???, 10),\n)',
    options: ['2304', '4096', '3136', '18432'],
    answer: 0,
    explanation:
      'Without padding each 3×3 conv loses 2 pixels: $32 \\to 30$, pool $\\to 15$, conv $\\to 13$, pool $\\to \\lfloor 13/2 \\rfloor = 6$. Flatten gives $64 \\times 6 \\times 6 = 2304$ per image. 4096 $= 64 \\times 8 \\times 8$ assumes padding 1; 3136 $= 64 \\times 7 \\times 7$ rounds $13/2$ up instead of down; 18432 wrongly multiplies in the batch size of 8.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.cnn-architectures-and-resnets.2',
    prompt:
      "A CNN's last conv block outputs maps of shape $(512, 7, 7)$ and there are 10 classes. Ignoring biases, how many weights does the final linear layer need after `Flatten`, and how many after global average pooling?",
    options: ['250,880 after Flatten; 5,120 after pooling', '250,880 after Flatten; 35,840 after pooling', '25,088 after Flatten; 512 after pooling', '5,120 after Flatten; 250,880 after pooling'],
    answer: 0,
    explanation:
      'Flatten gives $512 \\times 7 \\times 7 = 25{,}088$ features, so the layer needs $25{,}088 \\times 10 = 250{,}880$ weights. Global average pooling averages each $7 \\times 7$ map to one number, leaving 512 features and $512 \\times 10 = 5{,}120$ weights. 35,840 $= 512 \\times 7 \\times 10$ averages only one direction; 25,088 and 512 forget the 10 output classes.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.cnn-architectures-and-resnets.3',
    prompt:
      'You fine-tune an ImageNet-pretrained CNN to classify chest X-rays, with only 2,000 labelled images. Which part of the pretrained network is most useful to keep (freeze) as it is?',
    options: [
      'The early layers, since edge and texture detectors are useful for almost any kind of image',
      'The last conv layers, since the most complex features always transfer best to a new task',
      'The final dense layer, since it stores which ImageNet classes the photos belonged to',
      'Nothing, since pretrained features only help when the new images contain ImageNet classes',
    ],
    answer: 0,
    explanation:
      'CNNs learn a hierarchy: early layers detect generic edges, colours and textures, which appear in X-rays as much as in photos, so they transfer well. The last layers are the most task-specific (dogs, cars), so they are the ones usually retrained. The final dense layer is replaced, because the classes are different, and pretraining helps even with completely new classes.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.cnn-architectures-and-resnets.4',
    prompt:
      "A residual block computes $y = F(x) + x$ (ignore the final ReLU). At the start of training, the last layer of $F$ is set so that $F$ outputs 0 for every input. What are $y$ and $\\frac{\\partial y}{\\partial x}$?",
    options: ['$y = x$ and $\\frac{\\partial y}{\\partial x} = 1$', '$y = 0$ and $\\frac{\\partial y}{\\partial x} = 0$', '$y = x$ and $\\frac{\\partial y}{\\partial x} = 0$', '$y = 2x$ and $\\frac{\\partial y}{\\partial x} = 2$'],
    answer: 0,
    explanation:
      'With $F(x) = 0$ everywhere, $y = 0 + x = x$: the block is an identity mapping. Since $F$ is constant, $\\frac{\\partial F}{\\partial x} = 0$, so $\\frac{\\partial y}{\\partial x} = 0 + 1 = 1$: the gradient passes straight through. A plain block with the same zero layers would give $y = 0$ and gradient 0. (Starting residual branches at zero is a real trick for training very deep ResNets.)',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.cnn-architectures-and-resnets.5',
    prompt:
      'A team trains plain CNNs (no skip connections) of 18 and 34 layers on the same data with the same settings. The 34-layer network ends with a higher **training** error than the 18-layer one. What is the best explanation and fix?',
    options: [
      'An optimisation problem (degradation): add residual connections so extra layers can easily act as identity',
      'Overfitting, because the deeper network has more parameters: add dropout and stronger weight decay',
      'Underfitting, because 34 layers are not enough capacity: make the plain network deeper still',
      'The receptive field became too large for the images: replace the 3×3 convolutions with 1×1 ones',
    ],
    answer: 0,
    explanation:
      'A 34-layer network could copy the 18-layer one and make its extra layers identity mappings, so its best possible training error is no worse. Higher training error therefore means the optimiser fails to find good weights: the degradation problem that ResNet fixed with $F(x) + x$ blocks. Overfitting would show low training error with high test error, so dropout targets the wrong problem; going deeper without skips makes degradation worse.',
    difficulty: 'intermediate',
  },
]

export default questions
