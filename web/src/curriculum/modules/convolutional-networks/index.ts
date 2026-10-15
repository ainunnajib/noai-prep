import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "convolutional-networks",
  order: 24,
  part: "vision",
  domain: "ai_ml_dl",
  title: "Convolutional neural networks",
  tagline: "Seeing with sliding filters",
  summary: "Images as tensors, the convolution operation, padding, stride and the output-size formula, multi-channel convolutions and parameter counts, pooling and receptive fields, and CNN architectures from LeNet and VGG to ResNet's residual blocks.",
  prerequisites: ["training-deep-networks"],
  syllabus: ["IOAI 3A1 Convolutional Layers", "IOAI 2B3 Pooling Techniques (Max, Average)", "IOAI 3A2 Image Classification", "Output size ⌊(n + 2p − k)/s⌋ + 1, parameter counts, 1×1 and depthwise separable convolutions", "Receptive field, 3×3 stacks (VGG)", "IOAI 3A5 Pre-trained Vision Encoders (ResNet): residual blocks and the degradation problem"],
  lessons: [
    {
      slug: "images-as-tensors",
      title: "Images as tensors",
      summary: "Pixels, channels and PyTorch's (N, C, H, W) layout, counting the numbers in an image, why flattening it into a dense layer is a poor fit, and normalising inputs with training-set statistics.",
      minutes: 35,
      objectives: ["You can write an image's shape in PyTorch's (C, H, W) and (N, C, H, W) layouts and convert it from (H, W, C)", "You can count the numbers in an image and the weights a dense layer needs to take it in", "You can explain why flattening an image into a dense layer wastes weights and ignores which pixels are neighbours", "You can explain why dataset-wide z-scoring beats both min-max scaling and per-image standardisation"],
      load: () => import('./images-as-tensors.mdx'),
    },
    {
      slug: "convolution",
      title: "The convolution operation",
      summary: "Sliding a small filter over an image and multiplying and adding at each position, classic edge, blur and sharpen filters, and how weight sharing makes convolution translation equivariant.",
      minutes: 30,
      objectives: ["You can compute one output of a convolution by hand and with a NumPy loop", "You can predict what edge, blur and sharpen filters output, including on a flat region", "You can explain that a CNN learns its kernel weights by gradient descent", "You can explain weight sharing and why it makes a convolution translation equivariant"],
      load: () => import('./convolution.mdx'),
    },
    {
      slug: "padding-stride-shapes",
      title: "Padding, stride, channels and parameter counts",
      summary: "The output-size formula, 'same' padding, stride for downsampling, multi-channel kernels, and counting parameters including 1×1 and depthwise separable convolutions.",
      minutes: 25,
      objectives: ["You can compute a convolution's output height and width from its kernel size, padding and stride", "You can choose the padding that keeps the output the same size as the input", "You can count the weights and biases of a convolutional layer, including a 1 × 1 one", "You can compare the weights of a standard and a depthwise separable convolution"],
      load: () => import('./padding-stride-shapes.mdx'),
    },
    {
      slug: "pooling-and-receptive-field",
      title: "Pooling and receptive fields",
      summary: "Max and average pooling, tolerance to small shifts, global average pooling, how the receptive field grows with depth, and why stacks of 3×3 convolutions are popular.",
      minutes: 30,
      objectives: ["You can compute max and average pooling outputs and their shapes", "You can compute the receptive field of a stack of convolution and pooling layers", "You can explain why two stacked 3 × 3 convolutions beat one 5 × 5", "You can explain how global average pooling saves weights and lets a network accept any image size"],
      load: () => import('./pooling-and-receptive-field.mdx'),
    },
    {
      slug: "cnn-architectures-and-resnets",
      title: "CNN architectures and ResNets",
      summary: "Tracing shapes through a complete CNN, the feature hierarchy from edges to objects, landmark networks from LeNet to ResNet, the degradation problem, and how residual blocks fix it.",
      minutes: 30,
      objectives: ["You can trace tensor shapes through a small CNN to find the first dense layer's input size", "You can use the feature hierarchy, from edges to objects, to decide which pretrained layers to reuse", "You can explain the degradation problem and why it is not overfitting", "You can explain how a residual block, F(x) + x, makes doing nothing easy and keeps gradients flowing"],
      load: () => import('./cnn-architectures-and-resnets.mdx'),
    },
  ],
}

export default mod
