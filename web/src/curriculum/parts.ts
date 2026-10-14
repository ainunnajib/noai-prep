/** Course parts, in order. Modules reference a part by id. Generated from the curriculum spec. */
export interface PartDef {
  id: string
  order: number
  title: string
  summary: string
}

export const parts: PartDef[] = [
  { id: "start", order: 0, title: "Start here", summary: "What NOAI and IOAI are, how the exams work, how to study, and a hands-on, no-code first look at how machines learn." },
  { id: "code", order: 1, title: "Code from zero", summary: "Python from your very first line to classes and debugging, plus the algorithmic thinking behind efficient code." },
  { id: "toolkit", order: 2, title: "The maths and data toolkit", summary: "A maths warm-up (functions, powers, logs and Σ notation), then vectors and matrices, NumPy, probability and statistics, and pandas: the maths and tools every model is built on." },
  { id: "classical-ml", order: 3, title: "Classical machine learning", summary: "Train, evaluate and understand regression, classifiers, trees, ensembles and clustering, with calculus and deeper linear algebra taught just before they are needed." },
  { id: "deep-learning", order: 4, title: "Neural networks and deep learning", summary: "From a single perceptron to training deep networks in PyTorch, with backpropagation understood by hand and the optimisers and tricks that make training work." },
  { id: "vision", order: 5, title: "Computer vision", summary: "Convolutions, CNN architectures and ResNets, transfer learning and augmentation, detection, U-Net segmentation and mean IoU." },
  { id: "language-audio", order: 6, title: "Language and audio", summary: "Turning text and sound into numbers, attention and Transformers, and pretrained models such as BERT, GPT, HuBERT and Whisper." },
  { id: "generative-ai", order: 7, title: "Generative AI", summary: "How LLMs are built and used, prompting and RAG, autoencoders, GANs and diffusion, and multimodal models from ViT to CLIP and vision-language models." },
  { id: "problem-solving", order: 8, title: "Problem solving", summary: "Diagnosing broken models and code, and designing ML systems under real compute, memory and deployment constraints." },
  { id: "exam", order: 9, title: "Exam practice and beyond", summary: "Prelim strategy and no-calculator speed drills, past-paper walkthroughs, every past Final programming task rebuilt in NumPy and PyTorch, and the road to IOAI 2027." },
]
