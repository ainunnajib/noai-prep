import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "neural-networks",
  order: 20,
  part: "deep-learning",
  domain: "ai_ml_dl",
  title: "Neural networks from the perceptron up",
  tagline: "Neurons, layers and non-linearity",
  summary: "The perceptron and its limits, activation functions and why non-linearity matters, multi-layer perceptrons in a TensorFlow-Playground-style sandbox, parameter counting, and matching output layers to loss functions.",
  prerequisites: ["classification", "calculus-and-gradient-descent"],
  syllabus: ["IOAI 2A1 Perceptron Basics", "IOAI 2A4 Activation Functions (ReLU, Sigmoid, Tanh)", "IOAI 2A5 Loss Functions (MSE, MAE, Cross Entropy)", "IOAI 2B1 Multi-Layer Perceptrons", "Parameter counts of dense layers, softmax outputs, BCEWithLogits"],
  lessons: [
    {
      slug: "perceptron",
      title: "The perceptron",
      summary: "A single artificial neuron: weighted sum, threshold, a learning rule, and the famous XOR problem it cannot solve.",
      minutes: 30,
      objectives: ["You can compute a perceptron's output for given weights", "You can apply one step of the perceptron learning rule", "You can explain why a single perceptron cannot learn XOR"],
      load: () => import('./perceptron.mdx'),
    },
    {
      slug: "activation-functions",
      title: "Activation functions and non-linearity",
      summary: "Why stacking linear layers is pointless without activations, and how sigmoid, tanh, ReLU, Leaky ReLU and GELU differ.",
      minutes: 30,
      objectives: ["You can show that two linear layers collapse into one", "You can state the ranges and derivatives of sigmoid, tanh and ReLU", "You can explain saturation and dying ReLU and how Leaky ReLU helps"],
      load: () => import('./activation-functions.mdx'),
    },
    {
      slug: "multilayer-perceptrons",
      title: "Multi-layer perceptrons",
      summary: "Stacking layers of neurons, the forward pass as matrix multiplication, counting parameters, and watching a network learn curved boundaries.",
      minutes: 30,
      objectives: ["You can compute a forward pass through a small MLP", "You can count the parameters of a dense network", "You can predict how width and depth affect what a network can learn"],
      load: () => import('./multilayer-perceptrons.mdx'),
    },
    {
      slug: "outputs-and-losses",
      title: "Output layers and loss functions",
      summary: "Matching the output layer and loss to the task, logits, BCEWithLogits, and the loss you should see at the start of training.",
      minutes: 30,
      objectives: ["You can choose the output activation and loss for regression, binary, multi-class and multi-label tasks", "You can explain why frameworks combine softmax with cross-entropy", "You can predict the initial loss ln K for K balanced classes"],
      load: () => import('./outputs-and-losses.mdx'),
    },
  ],
}

export default mod
