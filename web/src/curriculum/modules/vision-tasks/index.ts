import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "vision-tasks",
  order: 25,
  part: "vision",
  domain: "ai_ml_dl",
  title: "Vision tasks: transfer learning, detection and segmentation",
  tagline: "Where things are, pixel by pixel",
  summary: "Reusing pretrained vision encoders through feature extraction and fine-tuning, image augmentation that keeps labels valid, the family of vision tasks, object detection (IoU, NMS, mAP, and how YOLO, SSD, Faster R-CNN and DETR find boxes), U-Net segmentation with skip connections and centre cropping, and scoring masks with mean IoU and Dice.",
  prerequisites: ["convolutional-networks", "model-evaluation"],
  syllabus: ["IOAI 3A5 Pre-trained Vision Encoders", "IOAI 3A6 Image Augmentation", "IOAI 2B13 Model Finetuning (full)", "IOAI 3A3 Object Detection (YOLO, SSD, DETR)", "IOAI 3A4 Image Segmentation (U-Net)", "NOAI 2026 Final Task 2: U-Net debugging and mean IoU", "Semantic vs instance segmentation, Mask R-CNN, NMS, anchors, transposed convolution"],
  lessons: [
    {
      slug: "transfer-learning-and-augmentation",
      title: "Transfer learning and image augmentation",
      summary: "Reusing a pretrained backbone as a feature extractor or fine-tuning it, and augmenting images without breaking their labels.",
      minutes: 30,
      objectives: ["You can choose between feature extraction and fine-tuning for a dataset, and explain why fine-tuning uses a small learning rate", "You can count the parameters a new head trains on a frozen backbone", "You can pick augmentations that keep the label true, and explain how they reduce overfitting"],
      load: () => import('./transfer-learning-and-augmentation.mdx'),
    },
    {
      slug: "vision-tasks-and-detection",
      title: "Vision tasks and object detection",
      summary: "The five vision tasks compared, then object detection: IoU, non-maximum suppression, scoring with AP and mAP, and how two-stage, one-stage and DETR detectors find boxes.",
      minutes: 35,
      objectives: ["You can tell classification, detection and semantic, instance and panoptic segmentation apart, and name a typical model for each", "You can run non-maximum suppression by hand and say which way to move its IoU threshold", "You can decide whether a predicted box counts as a hit when mAP@0.5 is computed", "You can contrast two-stage detectors (the R-CNN family), one-stage detectors (YOLO, SSD) and DETR"],
      load: () => import('./vision-tasks-and-detection.mdx'),
    },
    {
      slug: "u-net-segmentation",
      title: "U-Net segmentation",
      summary: "Encoder-decoder networks for pixel-wise prediction, skip connections, upsampling with transposed convolutions, and centre cropping to fix the size mismatches caused by valid padding and odd sizes.",
      minutes: 30,
      objectives: ["You can explain what the encoder, decoder and skip connections each contribute, and why the skips are concatenated", "You can compute the output size of a transposed convolution", "You can trace feature-map sizes through a U-Net and predict where a skip connection will fail", "You can fix a size mismatch by centre-cropping the skip map"],
      load: () => import('./u-net-segmentation.mdx'),
    },
    {
      slug: "segmentation-metrics",
      title: "Measuring segmentation: IoU per class and mean IoU",
      summary: "Computing per-class IoU from label maps, averaging it into mean IoU with a vectorised calculate_miou that skips absent classes, why pixel accuracy misleads, and Dice.",
      minutes: 25,
      objectives: ["You can compute per-class IoU from predicted and true label maps", "You can compute mean IoU and handle classes that are absent from both maps", "You can explain why pixel accuracy is misleading when background dominates", "You can compute a Dice score and convert it to and from IoU"],
      load: () => import('./segmentation-metrics.mdx'),
    },
  ],
}

export default mod
