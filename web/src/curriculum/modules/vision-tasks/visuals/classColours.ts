/*
  One colour token per class, shared by every visual in this module, so that a class looks the same from lesson to lesson
  (a car is orange in the vision-tasks scene and in the IoU painter). Visuals may tint these for large "stuff" regions.
*/
export const CLASS_COLOUR = {
  background: 'var(--viz-muted)',
  building: 'var(--viz-muted)',
  sky: 'var(--viz-1)',
  road: 'var(--viz-6)',
  car: 'var(--viz-2)',
  person: 'var(--viz-4)',
  bicycle: 'var(--viz-5)',
} as const
