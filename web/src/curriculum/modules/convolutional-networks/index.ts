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
      summary: "Pixels, channels and the (C, H, W) layout, normalisation, and why plain MLPs are a poor fit for images.",
      minutes: 20,
      objectives: ["You can describe a colour image as a C×H×W tensor", "You can count the values in an image and in a batch", "You can explain why flattening an image into an MLP wastes parameters and spatial structure", "You can explain why zero-centred, dataset-wide normalisation beats min-max and per-image scaling"],
      load: () => import('./images-as-tensors.mdx'),
    },
    {
      slug: "convolution",
      title: "The convolution operation",
      summary: "Sliding a small filter over an image, computing a dot product at each position, and building feature maps.",
      minutes: 20,
      objectives: ["You can compute one output value of a convolution by hand", "You can explain what edge, blur and sharpen filters do", "You can explain weight sharing and why it gives translation equivariance"],
      load: () => import('./convolution.mdx'),
    },
    {
      slug: "padding-stride-shapes",
      title: "Padding, stride, channels and parameter counts",
      summary: "The output-size formula, 'same' padding, stride for downsampling, multi-channel kernels, and counting parameters including 1×1 and depthwise separable convolutions.",
      minutes: 22,
      objectives: ["You can compute output size with ⌊(n + 2p − k)/s⌋ + 1", "You can choose padding for 'same' output size", "You can count parameters of a conv layer", "You can compare standard and depthwise separable convolution costs"],
      load: () => import('./padding-stride-shapes.mdx'),
    },
    {
      slug: "pooling-and-receptive-field",
      title: "Pooling and receptive fields",
      summary: "Downsampling with max and average pooling, small-shift robustness, how the receptive field grows with depth, and why stacks of 3×3 convolutions are popular.",
      minutes: 18,
      objectives: ["You can compute max and average pooling outputs", "You can explain how pooling adds tolerance to small shifts", "You can compute the receptive field of stacked layers", "You can explain why two 3×3 convs beat one 5×5"],
      load: () => import('./pooling-and-receptive-field.mdx'),
    },
    {
      slug: "cnn-architectures-and-resnets",
      title: "CNN architectures and ResNets",
      summary: "How classic CNNs stack convolutions into feature hierarchies, why plain deep networks degrade, and how residual blocks fix it.",
      minutes: 24,
      objectives: ["You can trace tensor shapes through a small CNN", "You can describe the feature hierarchy from edges to objects", "You can name landmark architectures (LeNet, AlexNet, VGG, ResNet) and their key idea", "You can explain the degradation problem and how a residual block (F(x) + x) fixes it"],
      load: () => import('./cnn-architectures-and-resnets.mdx'),
    },
  ],
}

export default mod
