import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'road-to-ioai.ioai-task-techniques.1',
    prompt:
      'A training set has 800 examples of class A and 200 of class B. Using class weights $w_c = \\dfrac{N}{K\\,n_c}$ ($N$ examples, $K$ classes, $n_c$ examples in class $c$), what weight does class B get in `nn.CrossEntropyLoss(weight=...)`?',
    options: ['$2.5$', '$4$', '$0.625$', '$0.25$'],
    answer: 0,
    explanation:
      '$w_B = \\dfrac{1000}{2 \\times 200} = 2.5$ (and $w_A = \\dfrac{1000}{2 \\times 800} = 0.625$). Then $200 \\times 2.5 = 500$ matches $800 \\times 0.625 = 500$, so both classes carry equal total weight. $4$ is the raw ratio $800/200$, a different (also common) weighting, not this formula, and $0.25 = 200/800$ is the ratio upside down, which would weight the rare class less, not more.',
    difficulty: 'beginner',
  },
  {
    id: 'road-to-ioai.ioai-task-techniques.2',
    prompt:
      'Focal loss is $-(1 - p_t)^{\\gamma}\\ln p_t$, where $p_t$ is the probability of the true class. With $\\gamma = 2$, how does it treat an example the model already classifies correctly with $p_t = 0.9$?',
    options: [
      'Its cross-entropy is multiplied by $0.01$, so it barely adds to the loss',
      'Its cross-entropy is multiplied by $0.81$, so it keeps most of its loss',
      'Its cross-entropy is multiplied by $100$, because correct examples are rewarded',
      'It is unchanged, because focal loss only changes examples of the rare class',
    ],
    answer: 0,
    explanation:
      'The factor is $(1 - 0.9)^2 = 0.1^2 = 0.01$, so a confident, correct example is turned down a hundredfold and training focuses on the hard examples. $0.81 = 0.9^2$ squares $p_t$ instead of $1 - p_t$. Focal loss reweights by difficulty, not by class; class weights are the separate $\\alpha_t$ term.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.ioai-task-techniques.3',
    prompt:
      'You pseudo-label 50,000 unlabelled tweets with a model that is 80% accurate on validation. You lower the confidence threshold from $\\tau = 0.95$ to $\\tau = 0.6$. What is the most likely effect on the pseudo-labels you add?',
    options: [
      'Many more pseudo-labels, with a larger fraction of them wrong',
      'Fewer pseudo-labels, but each one more likely to be correct',
      'The same pseudo-labels, because the threshold only matters at test time',
      'Many more pseudo-labels, all of them correct, because they come from the model',
    ],
    answer: 0,
    explanation:
      'A lower threshold admits less confident predictions, so many more tweets pass, and less confident predictions are wrong more often. Retraining on those errors can reinforce them (confirmation bias). Raising $\\tau$ does the opposite: fewer but more reliable labels.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.ioai-task-techniques.4',
    prompt: 'This code is meant to build an FGSM adversarial image. What happens when it runs?',
    code: 'model.eval()\nx = images.clone()\nloss = F.cross_entropy(model(x), labels)\nloss.backward()\nx_adv = (x + 0.01 * x.grad.sign()).clamp(0, 1)',
    options: [
      'It crashes, because `x.grad` is `None`: gradients were never switched on for `x`',
      'It runs, but `x_adv` equals `x` because a step of `0.01` is rounded away',
      'It runs, but `loss.backward()` also updates the weights, so the model changes before the attack',
      'It crashes, because `x.grad` has the shape of the first layer’s weights, not the shape of `x`',
    ],
    answer: 0,
    explanation:
      'Autograd only fills `.grad` for tensors with `requires_grad=True`. Model weights have it by default but a cloned input does not, so `x.grad` is `None` and `.sign()` raises an error; add `x.requires_grad_(True)` before the forward pass. `backward()` only computes gradients (the optimiser step updates weights), and `x.grad` always has the shape of `x`.',
    difficulty: 'intermediate',
  },
  {
    id: 'road-to-ioai.ioai-task-techniques.5',
    prompt:
      'An IOAI-style task gives you a frozen 5-class text classifier and its cached embeddings. You must add 2 new classes, and the rules say: no new learned parameters (averages and distances are allowed). Which plan obeys the rules?',
    options: [
      'Average each new class’s embeddings into a centroid; send inputs near a centroid to that class, others to the frozen head',
      'Swap the final layer for a new 7-output linear layer and train only that layer on the cached embeddings of all seven classes',
      'Fine-tune the whole classifier on the old and new examples, using focal loss so that the two small new classes are not ignored',
      'Keep the classifier frozen, add small LoRA adapter matrices to its layers and train only those adapters on the new classes',
    ],
    answer: 0,
    explanation:
      'Averages (centroids) and distances create no learned parameters, so a nearest-neighbour (or nearest-centroid) gate on the cached embeddings, in front of the frozen head, is allowed; that is the idea that won IOAI 2024’s Help BOBAI task. A new linear layer, fine-tuning and LoRA adapters all train new or changed weights, which the rule forbids, however good they might score.',
    difficulty: 'advanced',
  },
]

export default questions
