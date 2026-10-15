import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Figure, Segmented } from '../../../../../kit'
import { LINKS } from '../../../../../data/facts'
import s from './craft.module.css'

/*
  Past Singapore selection-test and camp tasks (2024, 2025; released by AI Singapore) and IOAI
  individual-contest tasks (2024–2026; github.com/ioai-official). Filter by where the task was set
  and by domain; open a card for what it asked, the skills it tested, a practice idea and the
  lessons in this course that prepare for it.
*/

type Domain = 'vision' | 'language' | 'tabular' | 'generative' | 'audio'
type Group = 'sg' | 'ioai'

interface Task {
  id: string
  group: Group
  stage: string
  domain: Domain
  name: string
  summary: string
  skills: string[]
  trap?: string
  practise: string
  lessons: [string, string][]
}

const DOMAINS: { id: Domain; label: string; colour: string }[] = [
  { id: 'vision', label: 'Vision', colour: 'var(--viz-1)' },
  { id: 'language', label: 'Language', colour: 'var(--viz-3)' },
  { id: 'tabular', label: 'Tabular ML', colour: 'var(--viz-6)' },
  { id: 'generative', label: 'Generative', colour: 'var(--viz-4)' },
  { id: 'audio', label: 'Audio & multimodal', colour: 'var(--viz-5)' },
]
const dom = (d: Domain) => DOMAINS.find((x) => x.id === d)!

const TASKS: Task[] = [
  {
    id: 'sg24-cv',
    group: 'sg',
    stage: 'Selection test 2024',
    domain: 'vision',
    name: 'CIFAR-10 with a ResNet-18',
    summary:
      'A warm-up notebook trains a simple network to about 35% accuracy. You fill in two augmentation lines (random crop with padding, horizontal flip), the three layers at the start of a ResNet and the loss, then improve the model as far as you can.',
    skills: ['data augmentation', 'ResNet building blocks', 'cross-entropy loss', 'tuning'],
    trap: 'Training images were scaled to [0, 1] but test images to [−1, 1].',
    practise: 'Train a ResNet-18 on CIFAR-10 in a free GPU notebook and log every change with its accuracy.',
    lessons: [
      ['CNN architectures and ResNets', 'convolutional-networks/cnn-architectures-and-resnets'],
      ['Transfer learning and augmentation', 'vision-tasks/transfer-learning-and-augmentation'],
      ['The training loop', 'pytorch/training-loop'],
    ],
  },
  {
    id: 'sg24-nlp',
    group: 'sg',
    stage: 'Selection test 2024',
    domain: 'language',
    name: 'Sentence sentiment with a CNN from a paper',
    summary:
      'Rebuild a convolutional sentence classifier for movie-review sentiment from a research paper sent a week before, then choose one improvement, such as pretrained word vectors, and justify it in writing.',
    skills: ['turning a paper into code', 'max-over-time pooling', 'dropout', 'word embeddings'],
    trap: 'The starter optimiser had no learning rate set, so PyTorch used its small default and the model barely learned.',
    practise: 'Read a short paper and list every setting it states (filter sizes, dropout, optimiser, batch size) before writing any code.',
    lessons: [
      ['Text classification', 'text-as-data/text-classification'],
      ['Word embeddings', 'text-as-data/word-embeddings'],
    ],
  },
  {
    id: 'sg24-camp-cv',
    group: 'sg',
    stage: 'Camp 2024',
    domain: 'vision',
    name: 'Transfer learning, CLIP and a long-tailed CIFAR-10',
    summary:
      'Load ImageNet weights into a custom ResNet and compare with training from scratch; classify CIFAR-10 with CLIP zero-shot and prompt ensembles; then rescue a deliberately imbalanced CIFAR-10 with balanced sampling and re-weighted losses.',
    skills: ['loading pretrained weights', 'CLIP zero-shot', 'class imbalance', 'per-class precision and recall'],
    practise: 'Delete most images of a few CIFAR-10 classes yourself, then see how far balanced sampling or a weighted loss brings the rare classes back.',
    lessons: [
      ['CLIP and zero-shot', 'multimodal-ai/clip-and-zero-shot'],
      ['Imbalanced data', 'model-evaluation/imbalanced-data'],
      ['Transfer learning and augmentation', 'vision-tasks/transfer-learning-and-augmentation'],
    ],
  },
  {
    id: 'sg24-camp-nlp',
    group: 'sg',
    stage: 'Camp 2024',
    domain: 'language',
    name: 'Named-entity recognition with a BiLSTM',
    summary:
      'Tag people, places and organisations in Dutch sentences with a bidirectional LSTM; fix the evaluation so padding is ignored and whole entities, not single words, are scored; then improve the model.',
    skills: ['sequence labelling', 'masking padding', 'entity-level F1', 'pretrained embeddings'],
    practise: 'Score one tagged sentence by hand both ways, word by word and entity by entity, and compare the two numbers.',
    lessons: [
      ['RNNs and LSTMs', 'text-as-data/rnns-and-lstms'],
      ['Confusion matrix and metrics', 'model-evaluation/confusion-matrix-and-metrics'],
    ],
  },
  {
    id: 'sg25-cv',
    group: 'sg',
    stage: 'Selection test 2025',
    domain: 'vision',
    name: 'U-Net segmentation on Pascal VOC',
    summary:
      'Label every pixel as background, person, car, dog, bicycle or chair. Fill in augmentation, a U-Net and a class-weighted loss, then plug in a pretrained ResNet-34 encoder with a smaller learning rate, add residual blocks and focal loss, and study the rare classes (100 marks, judged by mean IoU).',
    skills: ['U-Net skip connections', 'weighted cross-entropy', 'two learning rates', 'mean IoU'],
    trap: 'The starter code flipped and rotated each image and its mask with different random draws, so they no longer lined up.',
    practise: 'Write the U-Net from memory, then check every tensor shape on a dummy 256×256 input before training.',
    lessons: [
      ['U-Net segmentation', 'vision-tasks/u-net-segmentation'],
      ['Segmentation metrics', 'vision-tasks/segmentation-metrics'],
      ['Final lab: mean IoU', 'final-lab-pytorch/task-mean-iou'],
    ],
  },
  {
    id: 'sg25-ml',
    group: 'sg',
    stage: 'Selection test 2025',
    domain: 'tabular',
    name: 'Predicting depression from a survey',
    summary:
      'A 98,490-row survey table with 18 features. Predicting "no" for everyone already scores 81.8%; a good model reaches about 94%. Marks also went to the range of approaches tried and how clearly they were documented.',
    skills: ['exploring missing values', 'pipelines and encoding', 'gradient boosting', 'cross-validation'],
    trap: 'The instructions asked for the columns id,Depression, but the sample submission file used class.',
    practise: 'Compute the majority-class baseline first on every tabular task, then beat it with a pipeline scored by cross-validation.',
    lessons: [
      ['Missing data and outliers', 'data-and-features/missing-data-and-outliers'],
      ['Gradient boosting', 'trees-and-ensembles/gradient-boosting'],
      ['Cross-validation and tuning', 'model-evaluation/cross-validation-and-tuning'],
    ],
  },
  {
    id: 'sg25-nlp',
    group: 'sg',
    stage: 'Selection test 2025',
    domain: 'language',
    name: 'Implicit toxic comment detection',
    summary:
      'Classify comments as toxic when the toxicity is implied rather than stated. The baseline is a small recurrent network, and a file of unlabelled comments invites semi-supervised ideas such as pseudo-labelling.',
    skills: ['text pipelines', 'BiLSTM or BERT-style encoders', 'pretrained embeddings', 'pseudo-labelling'],
    practise: 'Add confident pseudo-labels from unlabelled data to a text classifier, and check on held-out labels whether they actually help.',
    lessons: [
      ['Text classification', 'text-as-data/text-classification'],
      ['Techniques that keep winning tasks', 'road-to-ioai/ioai-task-techniques'],
    ],
  },
  {
    id: 'sg25-gan',
    group: 'sg',
    stage: 'Camp 2025',
    domain: 'generative',
    name: 'A DCGAN that draws digits',
    summary: 'Write the generator, the discriminator and one training step of a DCGAN on MNIST handwritten digits, with only the PyTorch documentation allowed.',
    skills: ['transposed-convolution shapes', 'BatchNorm and LeakyReLU', '.detach() in the discriminator step', 'reading GAN loss curves'],
    practise: 'Work out by hand the layer sizes that grow a 1×1 input into a 28×28 image, then build and train it.',
    lessons: [['GANs', 'generative-models/gans']],
  },
  {
    id: 'sg25-style',
    group: 'sg',
    stage: 'Camp 2025',
    domain: 'generative',
    name: 'Editing smiles with StyleGAN',
    summary:
      "Train a one-layer classifier that tells smiling from non-smiling faces using their StyleGAN codes, then move a face's code along the classifier's weight vector to add or remove a smile.",
    skills: ['linear classifiers', 'latent directions', 'BCEWithLogitsLoss'],
    practise: 'On any 2-D dataset, check that a logistic-regression weight vector points across its decision boundary.',
    lessons: [
      ['GANs', 'generative-models/gans'],
      ['Logistic regression', 'classification/logistic-regression'],
    ],
  },
  {
    id: 'sg25-hdb',
    group: 'sg',
    stage: 'Camp 2025',
    domain: 'tabular',
    name: 'Recovering HDB storey ranges',
    summary:
      "HDB resale records have lost their storey range: 17 classes, the most common only 23%. Features matter more than the model: a flat's price compared with others in the same block gives away its floor.",
    skills: ['feature engineering with groupby', 'target encoding without leakage', 'gradient boosting', 'fixed seeds'],
    practise: 'Download HDB resale data from data.gov.sg and build "price relative to the same block" features with groupby and transform.',
    lessons: [
      ['Feature engineering', 'data-and-features/feature-engineering'],
      ['Groupby and merge', 'pandas-and-plotting/groupby-merge'],
      ['Gradient boosting', 'trees-and-ensembles/gradient-boosting'],
    ],
  },
  {
    id: 'sg25-xlmr',
    group: 'sg',
    stage: 'Camp 2025',
    domain: 'language',
    name: 'From English tweets to Spanish ones',
    summary:
      'Fine-tune xlm-roberta-base, the only model allowed, on labelled English tweets and classify Spanish tweets, with no translation tools or LLMs. Unlabelled Spanish tweets reward self-training; marks went to innovation, performance and efficiency.',
    skills: ['Hugging Face Trainer', 'multilingual transformers', 'self-training', 'batched inference'],
    practise: 'Fine-tune a small multilingual model with the Hugging Face Trainer, then compare one-at-a-time and batched prediction speed.',
    lessons: [
      ['Hugging Face in practice', 'pretrained-models-text-speech/hugging-face-in-practice'],
      ['BERT and GPT', 'pretrained-models-text-speech/bert-and-gpt'],
    ],
  },
  {
    id: 'io24-ml',
    group: 'ioai',
    stage: 'IOAI 2024',
    domain: 'tabular',
    name: '"Lost in a Hyperspace"',
    summary:
      'Predict three properties of a 5×5×5×6 array using only linear regression, at most 300 features and 5 minutes of CPU. The winning ideas: add the 6 axis swaps that do not change the answer as extra data, compress with PCA, and add one hand-made feature.',
    skills: ['feature engineering under constraints', 'symmetry as augmentation', 'PCA'],
    practise: 'Take a model you cannot change and improve it only through features: it trains exactly this kind of thinking.',
    lessons: [
      ['PCA', 'unsupervised-learning/pca'],
      ['Multiple and polynomial regression', 'linear-regression/multiple-and-polynomial'],
    ],
  },
  {
    id: 'io24-nlp',
    group: 'ioai',
    stage: 'IOAI 2024',
    domain: 'language',
    name: '"Help BOBAI"',
    summary:
      'Extend a frozen 5-class text classifier to 7 classes without any new learned parameters (averages and distances were allowed). A nearest-neighbour or nearest-centroid check in front of the frozen classifier did the job.',
    skills: ['embeddings as features', 'nearest centroids and k-NN', 'macro-F1'],
    practise: 'Classify sentence embeddings with nearest class centroids and compare with a trained logistic regression.',
    lessons: [
      ['k-NN and naive Bayes', 'classification/knn-and-naive-bayes'],
      ['Word embeddings', 'text-as-data/word-embeddings'],
    ],
  },
  {
    id: 'io24-cv',
    group: 'ioai',
    stage: 'IOAI 2024',
    domain: 'generative',
    name: '"Madarian Cow"',
    summary:
      'Make a text-to-image diffusion model draw a fire hydrant whenever a cow is requested, and never otherwise, by changing only the averaged text embedding and the starting noise. An object detector judged the pictures.',
    skills: ['the parts of a diffusion pipeline', 'embedding arithmetic', 'fast proxy validation'],
    practise: 'Run a small diffusion pipeline and change one input at a time (prompt, seed, guidance) to learn what each part controls.',
    lessons: [
      ['Diffusion models', 'generative-models/diffusion-models'],
      ['CLIP and zero-shot', 'multimodal-ai/clip-and-zero-shot'],
    ],
  },
  {
    id: 'io25-radar',
    group: 'ioai',
    stage: 'IOAI 2025',
    domain: 'vision',
    name: '"Radar"',
    summary: 'Turn indoor radar signals into a map of where people are: semantic segmentation, but on radar measurements instead of photos.',
    skills: ['segmentation', 'unusual input data', 'class imbalance'],
    practise: 'Apply a segmentation model to a non-photo grid of numbers, such as a heat map, and think about what the channels mean.',
    lessons: [
      ['U-Net segmentation', 'vision-tasks/u-net-segmentation'],
      ['Segmentation metrics', 'vision-tasks/segmentation-metrics'],
    ],
  },
  {
    id: 'io25-chicken',
    group: 'ioai',
    stage: 'IOAI 2025',
    domain: 'vision',
    name: '"Chicken Counting"',
    summary: 'Count Silkie chickens in farm photos by training a density-map decoder on top of a given pretrained feature extractor.',
    skills: ['density estimation', 'frozen pretrained features', 'regression losses'],
    practise: 'Freeze a pretrained backbone and train only a small head on its features: fast, and often strong.',
    lessons: [
      ['Vision tasks and detection', 'vision-tasks/vision-tasks-and-detection'],
      ['Transfer learning and augmentation', 'vision-tasks/transfer-learning-and-augmentation'],
    ],
  },
  {
    id: 'io25-antique',
    group: 'ioai',
    stage: 'IOAI 2025',
    domain: 'tabular',
    name: '"Antique Painting Authentication"',
    summary: 'Classify paintings as authentic or replica from five numeric features, when only a small part of the data is labelled: a semi-supervised task.',
    skills: ['semi-supervised learning', 'cluster structure', 'pseudo-labelling'],
    practise: 'Hide most labels of a small 2-D dataset and try to recover accuracy using the unlabelled points.',
    lessons: [
      ['K-means', 'unsupervised-learning/k-means'],
      ['Techniques that keep winning tasks', 'road-to-ioai/ioai-task-techniques'],
    ],
  },
  {
    id: 'io26-order',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'audio',
    name: '"Find the Order"',
    summary: 'Spoken dialogues are cut into one audio file per speaker turn and shuffled. Put the turns back in their original order.',
    skills: ['audio as data', 'speech models', 'ordering a sequence'],
    practise: 'Transcribe a short recording with a speech model and look at what information survives in the text.',
    lessons: [
      ['Audio as data', 'pretrained-models-text-speech/audio-as-data'],
      ['Speech models', 'pretrained-models-text-speech/speech-models'],
    ],
  },
  {
    id: 'io26-robot',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'audio',
    name: '"Robot Chasing"',
    summary: 'Six robots in 6×6 grid worlds follow English instructions such as "grab the blue key", each with its own habits. From a snapshot, predict the next action.',
    skills: ['linking language to a grid world', 'learning from examples', 'new combinations of phrases'],
    practise: 'Write a tiny grid world and a rule-based agent, then learn its behaviour back from logged examples.',
    lessons: [
      ['Word embeddings', 'text-as-data/word-embeddings'],
      ['Reinforcement learning', 'ml-fundamentals/reinforcement-learning'],
    ],
  },
  {
    id: 'io26-potato',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'language',
    name: '"Potato"',
    summary: 'Find a hidden word in at most 30 turns when the only feedback is which of two words is semantically closer to it.',
    skills: ['word embeddings', 'search strategies', 'similarity measures'],
    practise: 'Play the game yourself with any word-embedding model and count how many guesses a simple strategy needs.',
    lessons: [
      ['Word embeddings', 'text-as-data/word-embeddings'],
      ['Searching, sorting and hashing', 'algorithms-and-complexity/searching-sorting-hashing'],
    ],
  },
  {
    id: 'io26-agent',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'vision',
    name: '"Double Agent Dilemma"',
    summary:
      'A ResNet-18 and a ViT-Tiny both classify the same images perfectly. Add tiny pixel changes so that one model stays right and the other goes wrong, in both directions; smaller changes score higher.',
    skills: ['gradients with respect to the input', 'adversarial perturbations', 'CNNs versus vision transformers'],
    practise: 'Compute the gradient of the loss with respect to an input image and take one small step that raises the loss.',
    lessons: [
      ['Techniques that keep winning tasks', 'road-to-ioai/ioai-task-techniques'],
      ['Vision transformers', 'multimodal-ai/vision-transformers'],
    ],
  },
  {
    id: 'io26-ghost',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'language',
    name: '"Ghost of the Machine"',
    summary: 'Each passage starts human-written and switches to machine-generated text at one point. Find the character where the switch happens, with only a given text-embedding model.',
    skills: ['text embeddings', 'spotting machine-written text', 'locating a change point'],
    practise: 'Embed the sentences of a passage one by one and plot how similar each is to the next.',
    lessons: [
      ['How LLMs are built', 'large-language-models/how-llms-are-built'],
      ['Word embeddings', 'text-as-data/word-embeddings'],
    ],
  },
  {
    id: 'io26-field',
    group: 'ioai',
    stage: 'IOAI 2026',
    domain: 'generative',
    name: '"IOAI Field"',
    summary: 'Train a network from scratch, with no pretrained weights, to output a strange "field" value at every point of the IOAI logo, where each letter follows its own rule.',
    skills: ['fitting functions with neural networks', 'designing the loss', 'training from scratch'],
    practise: 'Fit an MLP to a 2-D function with sharp edges and see what the loss alone cannot fix.',
    lessons: [
      ['Multilayer perceptrons', 'neural-networks/multilayer-perceptrons'],
      ['Stability and scale', 'training-deep-networks/stability-and-scale'],
    ],
  },
]

export default function TaskGallery() {
  const [group, setGroup] = useState<'sg' | 'ioai' | 'all'>('sg')
  const [domain, setDomain] = useState<Domain | 'all'>('all')
  const [sel, setSel] = useState('sg25-cv')
  const list = TASKS.filter((t) => (group === 'all' || t.group === group) && (domain === 'all' || t.domain === domain))
  const task = TASKS.find((t) => t.id === sel)!
  const d = dom(task.domain)

  return (
    <Figure
      title="A gallery of past tasks"
      caption={
        <>
          Filter by where a task was set and by domain, then open a card. Notice how often the same skills come back: transfer learning, choosing the right metric, coping with imbalance or missing
          labels, and reading the rules carefully. Those are the skills to build next.
        </>
      }
      wide
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'center', width: '100%' }}>
        <Segmented
          label="Set by"
          value={group}
          onChange={setGroup}
          options={[
            { value: 'sg', label: 'Singapore selection' },
            { value: 'ioai', label: 'IOAI' },
            { value: 'all', label: 'All' },
          ]}
        />
        <Segmented
          label="Domain"
          value={domain}
          onChange={setDomain}
          options={[{ value: 'all' as const, label: 'All' }, ...DOMAINS.map((x) => ({ value: x.id, label: x.label }))]}
        />
      </div>

      <div className={s.detail} style={{ borderLeftColor: d.colour }} aria-live="polite">
        <div className={s.cardStage}>
          {task.stage} · <span style={{ color: d.colour }}>{d.label}</span>
        </div>
        <div className={s.detailHead}>{task.name}</div>
        <p>{task.summary}</p>
        <p>
          <span className={s.detailLabel}>Skills tested: </span>
          {task.skills.join(', ')}.
        </p>
        {task.trap && (
          <p>
            <span className={s.detailLabel}>Trap: </span>
            {task.trap}
          </p>
        )}
        <p>
          <span className={s.detailLabel}>Practise: </span>
          {task.practise}
        </p>
        <div className={s.links}>
          <span className={s.detailLabel}>In this course:</span>
          {task.lessons.map(([label, path]) => (
            <Link key={path} to={`/learn/${path}`}>
              {label}
            </Link>
          ))}
          {task.group === 'ioai' && (
            <a href={LINKS.ioaiGithub} target="_blank" rel="noreferrer">
              task statements and code (IOAI on GitHub)
            </a>
          )}
        </div>
      </div>

      <div className={s.count}>
        {list.length} task{list.length === 1 ? '' : 's'} shown
      </div>
      <div className={s.cards}>
        {list.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${s.card} ${t.id === sel ? s.cardOn : ''}`}
            style={{ borderTopColor: dom(t.domain).colour }}
            aria-pressed={t.id === sel}
            onClick={() => setSel(t.id)}
          >
            <span className={s.cardStage}>{t.stage}</span>
            <span className={s.cardName}>{t.name}</span>
            <span className={s.cardDomain} style={{ color: dom(t.domain).colour }}>
              {dom(t.domain).label}
            </span>
          </button>
        ))}
        {list.length === 0 && <p style={{ margin: 0, color: 'var(--ink-3)', fontSize: '0.85rem' }}>No task in this combination. Try another domain.</p>}
      </div>
    </Figure>
  )
}
