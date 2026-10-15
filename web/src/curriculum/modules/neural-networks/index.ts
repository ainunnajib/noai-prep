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
      objectives: ["You can compute a perceptron's output from its weights, bias and inputs", "You can apply one step of the perceptron learning rule, including the bias", "You can explain why one perceptron draws a straight boundary and so cannot learn XOR", "You can say what the convergence theorem promises for separable and non-separable data"],
      load: () => import('./perceptron.mdx'),
    },
    {
      slug: "activation-functions",
      title: "Activation functions and non-linearity",
      summary: "Why stacked linear layers collapse into one without activations, how sigmoid, tanh, ReLU, Leaky ReLU and GELU differ, and how saturation and dead ReLUs stall learning.",
      minutes: 30,
      objectives: ["You can show that two linear layers with no activation collapse into one", "You can state the ranges and slopes of sigmoid, tanh, ReLU and Leaky ReLU", "You can estimate how much a gradient shrinks through a stack of sigmoids", "You can explain dying ReLU and how Leaky ReLU and a smaller learning rate prevent it"],
      load: () => import('./activation-functions.mdx'),
    },
    {
      slug: "multilayer-perceptrons",
      title: "Multi-layer perceptrons",
      summary: "Stacking layers of neurons, the forward pass as matrix multiplication, counting parameters, watching a network learn curved boundaries, and what width and depth buy you.",
      minutes: 30,
      objectives: ["You can compute a forward pass through a small MLP and give each weight matrix's shape", "You can count the weights and biases of a fully connected network", "You can state what the universal approximation theorem does and does not promise", "You can tell when a network is too small for its data and needs more neurons or layers"],
      load: () => import('./multilayer-perceptrons.mdx'),
    },
    {
      slug: "outputs-and-losses",
      title: "Output layers and loss functions",
      summary: "Matching the output layer and loss to the task, why PyTorch's losses want raw logits, why MSE is a poor partner for a sigmoid, and the loss you should see at the start of training.",
      minutes: 30,
      objectives: ["You can choose the output layer and loss for regression, binary, multi-class and multi-label tasks", "You can explain why PyTorch's losses take raw logits and spot the double-softmax bug", "You can explain why MSE on a sigmoid learns slowly when the model is confidently wrong", "You can predict the first loss, ln K, of an untrained classifier with K balanced classes"],
      load: () => import('./outputs-and-losses.mdx'),
    },
  ],
}

export default mod
