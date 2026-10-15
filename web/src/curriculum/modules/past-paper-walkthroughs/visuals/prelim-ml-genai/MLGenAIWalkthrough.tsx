import { Figure, M } from '../../../../../kit'
import { Walkthrough, type WalkItem } from '../prelim-maths-computing/walkthrough'
import s from '../prelim-maths-computing/pp.module.css'

/*
  One real 2026 Prelim item per concept cluster, printed as in the paper. Answer, then reveal the
  key fact, the confusable pair behind the distractors (the right side is ticked), what each wrong
  option gets wrong, and the lesson that teaches it. Misses are logged under their cluster.
*/

const L = (m: string, l: string, label: string) => ({ href: `#/learn/${m}/${l}`, label })

const ITEMS: WalkItem[] = [
  {
    n: 155,
    tag: 'Ensembles',
    topic: 'Ensembles',
    target: 10,
    question: <>Boosting reduces:</>,
    options: ['Variance only', 'Both equally', 'Neither', 'Bias'],
    answer: 3,
    notes: [
      <>Bagging’s answer with an “only” added: the classic twin swap.</>,
      <>A hedge. Boosting can trim variance a little, but its main effect, and the textbook answer, is on bias.</>,
      <>Filler: boosting clearly changes the error.</>,
      <>Right: each weak learner fixes what the ensemble still gets wrong, so the bias falls step by step.</>,
    ],
    fact: <>Boosting adds weak, high-bias learners one after another, each correcting the errors left so far. That mainly lowers bias.</>,
    method: <>Recall the pair, not the definition: bagging ↔ variance, boosting ↔ bias. Then cross out the twin (“Variance only”) and the filler (“Neither”).</>,
    pair: {
      title: 'bagging vs boosting',
      sides: [
        { name: 'Bagging (e.g. random forest)', points: ['Trains many models independently, in parallel', 'Each on a bootstrap sample (rows drawn with replacement)', 'Deep trees: low bias, high variance', 'Averages them → cuts variance'] },
        { name: 'Boosting (e.g. AdaBoost, gradient boosting)', isAnswer: true, points: ['Trains models one after another', 'Each focuses on the current errors (reweighted points or residuals)', 'Shallow trees or stumps: high bias', 'Adds them up → cuts bias'] },
      ],
    },
    lessons: [L('trees-and-ensembles', 'boosting-adaboost', 'Boosting and AdaBoost'), L('trees-and-ensembles', 'bagging-and-random-forests', 'Bagging and random forests')],
  },
  {
    n: 176,
    tag: 'NN parts and training tricks',
    topic: 'Initialisation',
    target: 10,
    question: <>Xavier/Glorot initialisation is designed for:</>,
    options: ['ReLU activations', 'No activations', 'Tanh and sigmoid activations', 'Output layers only'],
    answer: 2,
    notes: [
      <>
        That is He initialisation’s job: <M>{'\\operatorname{Var}(W) = 2/n_{\\text{in}}'}</M> for ReLU.
      </>,
      <>Half-true at best: the derivation treats the activation as roughly straight near 0, but the design target is tanh and sigmoid.</>,
      <>Right: the weights are scaled so that signals keep their size through zero-centred activations such as tanh.</>,
      <>Overclaim: it is used for every layer, not only the output.</>,
    ],
    fact: (
      <>
        Xavier draws weights with <M>{'\\operatorname{Var}(W) = \\dfrac{2}{n_{\\text{in}} + n_{\\text{out}}}'}</M>, which keeps the signal’s spread steady through tanh-like layers. <M>{'n_{\\text{in}}'}</M> and <M>{'n_{\\text{out}}'}</M> are the numbers of inputs and outputs of the layer.
      </>
    ),
    pair: {
      title: 'Xavier vs He',
      sides: [
        { name: 'Xavier / Glorot', isAnswer: true, points: [<M key="x">{'\\operatorname{Var}(W) = 2/(n_{\\text{in}} + n_{\\text{out}})'}</M>, 'For zero-centred activations: tanh, roughly sigmoid', 'Keeps signal size steady forwards and backwards'] },
        { name: 'He / Kaiming', points: [<M key="h">{'\\operatorname{Var}(W) = 2/n_{\\text{in}}'}</M>, 'For ReLU and its relatives', 'The extra factor makes up for ReLU zeroing about half its inputs'] },
      ],
    },
    lessons: [L('training-deep-networks', 'initialisation-and-normalisation', 'Initialisation, BatchNorm and LayerNorm')],
  },
  {
    n: 204,
    tag: 'CNNs and vision',
    topic: 'CNNs',
    target: 15,
    question: <>Why do modern CNNs use 3×3 convolutions instead of larger filters?</>,
    options: ['3×3 is faster only', 'Required by hardware', 'Stacking 3×3 achieves same receptive field with fewer parameters', 'No particular reason'],
    answer: 2,
    notes: [
      <>Speed is a side effect, and “only” overclaims. The design reason is parameters and depth.</>,
      <>A made-up cause: it is a design choice popularised by VGGNet, not a hardware rule.</>,
      <>
        Right: two 3×3 layers see a 5×5 patch with <M>{'18C^2'}</M> weights instead of <M>{'25C^2'}</M>.
      </>,
      <>Filler: there is a very particular reason.</>,
    ],
    fact: (
      <>
        Two stacked 3×3 layers see a 5×5 patch of the input, three see 7×7. With <M>{'C'}</M> channels in and out, the weights are <M>{'2 \\times 9C^2 = 18C^2'}</M> against <M>{'25C^2'}</M>, and <M>{'27C^2'}</M> against <M>{'49C^2'}</M>.
      </>
    ),
    pair: {
      title: 'one big kernel vs stacked small ones',
      sides: [
        { name: 'One 5×5 convolution', points: ['Sees a 5×5 patch', <span key="a">{'25'}<M>{'C^2'}</M> weights</span>, 'One non-linearity'] },
        { name: 'Two stacked 3×3 convolutions', isAnswer: true, points: ['Also sees a 5×5 patch', <span key="b">{'18'}<M>{'C^2'}</M> weights (28% fewer)</span>, 'Two non-linearities: more expressive'] },
      ],
    },
    lessons: [L('convolutional-networks', 'pooling-and-receptive-field', 'Pooling and receptive fields'), L('convolutional-networks', 'cnn-architectures-and-resnets', 'CNN architectures and ResNets')],
  },
  {
    n: 213,
    tag: 'NLP and Transformers',
    topic: 'Transformers',
    target: 10,
    question: <>What is the key difference between BERT and GPT?</>,
    options: ['They are identical', 'BERT is for vision', 'BERT = bidirectional encoder, GPT = autoregressive decoder', 'GPT is older'],
    answer: 2,
    notes: [
      <>Filler: they are built differently.</>,
      <>Wrong modality: BERT reads text. Its image cousin is the Vision Transformer.</>,
      <>Right: an encoder that reads both ways against a decoder that writes left to right.</>,
      <>True for GPT-1 (June 2018, BERT October 2018), but a date is not a difference in how they work.</>,
    ],
    fact: <>BERT is a Transformer encoder that sees both sides of every word; GPT is a decoder with a causal mask that predicts the next token.</>,
    pair: {
      title: 'encoder vs decoder',
      sides: [
        { name: 'BERT: encoder', points: ['Each token attends to both sides', 'Trained to fill in masked tokens', 'Good at understanding: classification, tagging'] },
        { name: 'GPT: decoder', points: ['Causal mask: each token sees only earlier tokens', 'Trained to predict the next token', 'Good at generating text'] },
      ],
    },
    lessons: [L('pretrained-models-text-speech', 'bert-and-gpt', 'BERT and GPT')],
  },
  {
    n: 235,
    tag: 'LLMs',
    topic: 'LLMs',
    target: 10,
    question: <>LoRA (Low-Rank Adaptation) enables:</>,
    options: ['Faster inference', 'Efficient fine-tuning by training low-rank weight adapters', 'Larger models', 'Data augmentation'],
    answer: 1,
    notes: [
      <>A benefit LoRA does not give: inference is at best as fast as the base model, once the adapter is merged in.</>,
      <>
        Right: freeze <M>{'W'}</M>, train the small matrices <M>{'B'}</M> and <M>{'A'}</M>.
      </>,
      <>The wrong direction: LoRA adds a sliver of weights so that adapting a model gets smaller and cheaper.</>,
      <>Filler: nothing to do with the data.</>,
    ],
    fact: (
      <>
        LoRA freezes a weight matrix <M>{'W'}</M> (<M>{'d \\times k'}</M>) and learns <M>{'\\Delta W = BA'}</M>, where <M>{'B'}</M> is <M>{'d \\times r'}</M> and <M>{'A'}</M> is <M>{'r \\times k'}</M> with a small rank <M>{'r'}</M>.
      </>
    ),
    pair: {
      title: 'LoRA vs full fine-tuning',
      sides: [
        { name: 'Full fine-tuning', points: [<span key="a">Updates all <M>{'d \\times k'}</M> weights</span>, '4096 × 4096 layer: 16,777,216 numbers', 'A full copy of the model per task'] },
        { name: 'LoRA', isAnswer: true, points: [<span key="b">Trains only <M>{'r(d + k)'}</M> numbers</span>, 'Same layer at r = 8: 65,536 numbers (0.39%)', 'A tiny adapter per task'] },
      ],
    },
    lessons: [L('large-language-models', 'fine-tuning-and-lora', 'Fine-tuning and LoRA')],
  },
  {
    n: 245,
    tag: 'Diffusion and generative',
    topic: 'Diffusion',
    target: 10,
    question: <>DDPM (Denoising Diffusion Probabilistic Model) defines diffusion as:</>,
    options: ['Single-step generation', 'Deterministic process', 'Markov Chain with learnt reverse process', 'Classification task'],
    answer: 2,
    notes: [
      <>The opposite of diffusion: generating in one step is what a GAN does.</>,
      <>That is DDIM, a later deterministic sampler. DDPM draws fresh random noise at every step.</>,
      <>Right: a fixed noising chain forwards, a learnt denoising chain backwards.</>,
      <>Filler: diffusion generates images.</>,
    ],
    fact: (
      <>
        A <em>Markov chain</em> is a sequence of steps where each state depends only on the one before. DDPM’s forward chain adds a little Gaussian noise per step (fixed, nothing learnt); a network learns the reverse chain that removes it.
      </>
    ),
    pair: {
      title: 'DDPM vs DDIM',
      sides: [
        { name: 'DDPM', isAnswer: true, points: ['Forward: fixed chain adds noise step by step', 'Reverse: learnt chain removes it', 'Random: fresh noise at every reverse step', 'Original paper: 1,000 steps'] },
        { name: 'DDIM', points: ['Same trained network, different sampler', 'Deterministic: no fresh noise', 'Can skip steps, so needs fewer'] },
      ],
    },
    lessons: [L('generative-models', 'diffusion-models', 'Diffusion models')],
  },
  {
    n: 254,
    tag: 'Multimodal',
    topic: 'Multimodal',
    target: 10,
    question: <>Cross-attention in multimodal models:</>,
    options: ['Speeds up training', 'Only within same modality', 'Allows one modality to attend to another', 'Removes attention'],
    answer: 2,
    notes: [
      <>Wrong reason: cross-attention adds computation. It is there to mix information, not to save time.</>,
      <>That describes self-attention, the twin. “Only” is the giveaway.</>,
      <>Right: queries from one modality, keys and values from the other.</>,
      <>Filler: it is attention.</>,
    ],
    fact: (
      <>
        In attention, queries <M>{'Q'}</M> ask, keys <M>{'K'}</M> are matched against them, and values <M>{'V'}</M> are what gets passed on. Cross-attention takes <M>{'Q'}</M> from one sequence (say text) and <M>{'K, V'}</M> from another (say image patches).
      </>
    ),
    pair: {
      title: 'self-attention vs cross-attention',
      sides: [
        { name: 'Self-attention', points: ['Q, K and V all from the same sequence', 'Tokens look at other tokens of the same input'] },
        { name: 'Cross-attention', isAnswer: true, points: ['Q from one sequence, K and V from another', 'Text tokens can look at image patches', 'Used in Flamingo and in Stable Diffusion’s text conditioning'] },
      ],
    },
    lessons: [L('multimodal-ai', 'vision-language-models', 'Vision-language models'), L('attention-and-transformers', 'scaled-dot-product-attention', 'Scaled dot-product attention')],
  },
]

export default function MLGenAIWalkthrough() {
  return (
    <Figure
      title="One question per cluster, solved"
      caption={
        <>
          Answer first (start the clock if you like: these are 10-second recall items), then reveal the steps. Watch the confusable-pair step: every question is decided by telling apart <em>two</em> ideas, and the most tempting wrong option is usually the other half of the pair. Misses are filed in the error log under their cluster.
        </>
      }
    >
      <Walkthrough items={ITEMS} storageKey="ppw-review-ml-genai" stepNames={{ fact: 'The key fact', group: 'cluster', traps: 'What each wrong option gets wrong' }} />
      <p className={s.small} style={{ margin: 0 }}>
        Options are printed in the paper’s order (A to D), with the paper’s wording.
      </p>
    </Figure>
  )
}
