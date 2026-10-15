import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'large-language-models.fine-tuning-and-lora.1',
    prompt: 'A pretrained weight matrix $W$ has size $1024 \\times 512$. How many trainable parameters does LoRA with rank $r = 4$ add for this matrix?',
    options: ['6,144', '524,288', '2,097,152', '4,096'],
    answer: 0,
    explanation:
      'LoRA trains $B$ ($1024 \\times 4$) and $A$ ($4 \\times 512$): $r(d + k) = 4 \\times (1024 + 512) = 4 \\times 1536 = 6{,}144$. The value 524,288 is $d \\times k$, what full fine-tuning would train; 2,097,152 wrongly multiplies $d \\times k \\times r$; 4,096 counts only $B$.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.fine-tuning-and-lora.2',
    prompt: 'In LoRA, $W\' = W + BA$. Why is $B$ initialised to all zeros while $A$ gets small random values?',
    options: [
      'So that $BA = 0$ and training starts from the pretrained model, while $B$ can still learn at once',
      'So that $B$ never needs a gradient during training, which halves the memory the optimiser has to use',
      'So that the rank of $BA$ stays at 0 for the whole of training, which stops the adapter from overfitting',
      'So that the frozen $W$ can be updated freely during the first epoch, before $B$ and $A$ take over',
    ],
    answer: 0,
    explanation:
      'With $B = 0$ the product $BA$ is zero, so at step 0 the model behaves exactly like the pretrained one. $B$\'s gradient depends on $Ax$, which is non-zero because $A$ is random, so $B$ starts learning at once. $B$ does not stay zero (it is trained), and $W$ is frozen throughout, never updated.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.fine-tuning-and-lora.3',
    prompt: 'A student writes a LoRA layer but initialises **both** matrices to zero. What happens during training?',
    code: 'self.A = nn.Parameter(torch.zeros(r, k))\nself.B = nn.Parameter(torch.zeros(d, r))\n# forward: self.base(x) + x @ self.A.T @ self.B.T',
    options: [
      'Both gradients are zero, so $A$ and $B$ never change and the model stays the pretrained one',
      'Training works normally, because the optimiser adds momentum that moves $A$ and $B$ away from zero',
      'The frozen weights $W$ start updating instead, because $A$ and $B$ have no gradient',
      'PyTorch raises an error, because a parameter is not allowed to be all zeros',
    ],
    answer: 0,
    explanation:
      'The side path is $B(Ax)$. The gradient for $B$ is proportional to $Ax = 0$, and the gradient for $A$ is proportional to $B = 0$, so both are zero at every step. Adam\'s momentum builds only from gradients, so it stays zero too. $W$ has `requires_grad = False`, so it cannot start training, and PyTorch happily accepts zero tensors.',
    difficulty: 'advanced',
  },
  {
    id: 'large-language-models.fine-tuning-and-lora.4',
    prompt: 'With $B$ of size $4096 \\times 8$ and $A$ of size $8 \\times 4096$, which statement about the update $\\Delta W = BA$ is true?',
    options: [
      'It is $4096 \\times 4096$ like $W$, but its rank is at most 8',
      'It is $8 \\times 8$, so it can only change 64 of the weights in $W$',
      'It is $4096 \\times 4096$ and has rank 4096, like any matrix of that size',
      'It is $4096 \\times 4096$ but only its first 8 rows can be non-zero',
    ],
    answer: 0,
    explanation:
      '$(4096 \\times 8)(8 \\times 4096)$ gives a $4096 \\times 4096$ matrix, the same shape as $W$, so every weight can change. But $BA = b_1a_1^\\top + \\dots + b_8a_8^\\top$ is a sum of 8 outer products, so its rank is at most 8. All its rows can be non-zero; they are just combinations of the 8 rows of $A$.',
    difficulty: 'intermediate',
  },
  {
    id: 'large-language-models.fine-tuning-and-lora.5',
    prompt:
      'A hospital fully fine-tunes a general chatbot on 50,000 medical notes with a large learning rate for many epochs. It now summarises notes well, but it often fails at simple arithmetic and everyday questions it used to answer. What is the best explanation and fix?',
    options: [
      'Catastrophic forgetting; train more gently (LoRA or a smaller learning rate) and mix in general data',
      'Overfitting to the medical notes; add more medical notes until the validation loss on notes stops falling',
      'The context window is too short for long notes; switch to a model with a much longer window',
      'Hallucination caused by a high sampling temperature; set the temperature to 0 when answering',
    ],
    answer: 0,
    explanation:
      'The model got better at the new task but worse at old ones: that is catastrophic forgetting, caused by large updates driven only by the new task\'s loss. Freezing the original weights (LoRA), gentler training and replaying general data all reduce the damage to old skills. Overfitting would show as poor performance on *new medical notes*, not on unrelated old skills.',
    difficulty: 'intermediate',
  },
]

export default questions
