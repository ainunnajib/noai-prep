import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "vision-tasks",
  order: 25,
  part: "vision",
  domain: "ai_ml_dl",
  title: "Vision tasks: transfer learning, detection and segmentation",
  tagline: "Where things are, pixel by pixel",
  summary: "Using pretrained vision encoders through feature extraction and fine-tuning, image augmentation that keeps labels valid, the family of vision tasks, object detection with NMS and one- versus two-stage detectors (YOLO, SSD, Faster R-CNN, DETR), U-Net segmentation with skip connections and cropping, and mean IoU.",
  prerequisites: ["convolutional-networks", "model-evaluation"],
  syllabus: ["IOAI 3A5 Pre-trained Vision Encoders", "IOAI 3A6 Image Augmentation", "IOAI 2B13 Model Finetuning (full)", "IOAI 3A3 Object Detection (YOLO, SSD, DETR)", "IOAI 3A4 Image Segmentation (U-Net)", "NOAI 2026 Final Task 2: U-Net debugging and mean IoU", "Semantic vs instance segmentation, Mask R-CNN, NMS, anchors, transposed convolution"],
  lessons: [
    {
      slug: "transfer-learning-and-augmentation",
      title: "Transfer learning and image augmentation",
      summary: "Reusing a pretrained backbone as a feature extractor or fine-tuning it, and augmenting images without breaking their labels.",
      minutes: 30,
      objectives: ["You can choose between feature extraction and fine-tuning for a given dataset size", "You can explain why ImageNet-pretrained features transfer", "You can pick augmentations that keep the label valid"],
      load: () => import('./transfer-learning-and-augmentation.mdx'),
    },
    {
      slug: "vision-tasks-and-detection",
      title: "Vision tasks and object detection",
      summary: "Classification, detection and segmentation compared, then how detectors find boxes: anchors, one- and two-stage pipelines and non-maximum suppression.",
      minutes: 35,
      objectives: ["You can tell classification, detection, semantic, instance and panoptic segmentation apart", "You can run non-maximum suppression by hand", "You can compare one-stage (YOLO, SSD) and two-stage (R-CNN family) detectors and DETR"],
      load: () => import('./vision-tasks-and-detection.mdx'),
    },
    {
      slug: "u-net-segmentation",
      title: "U-Net segmentation",
      summary: "Encoder-decoder networks for pixel-wise prediction, upsampling with transposed convolutions, skip connections, and the cropping fix needed with valid padding.",
      minutes: 30,
      objectives: ["You can describe the encoder-decoder U shape", "You can compute transposed convolution output size", "You can explain why skip connections are concatenated", "You can fix a size mismatch with a centre crop"],
      load: () => import('./u-net-segmentation.mdx'),
    },
    {
      slug: "segmentation-metrics",
      title: "Measuring segmentation: IoU per class and mean IoU",
      summary: "Computing IoU from masks, averaging over classes, handling absent classes, Dice, and why pixel accuracy misleads.",
      minutes: 25,
      objectives: ["You can compute per-class IoU from predicted and true label maps", "You can compute mean IoU and handle classes absent from both", "You can explain why pixel accuracy is misleading when background dominates", "You can relate Dice to IoU"],
      load: () => import('./segmentation-metrics.mdx'),
    },
  ],
}

export default mod
