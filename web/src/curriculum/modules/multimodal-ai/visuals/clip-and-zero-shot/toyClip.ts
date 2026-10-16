/*
  A tiny, hand-built stand-in for CLIP's joint embedding space, used by the visuals in the
  "CLIP: one space for images and words" lesson.

  - Every embedding is a vector over a few dozen "concept" directions (cat, rail, noodle, sunset …).
    Real CLIP vectors have 512+ unnamed dimensions; naming ours keeps the toy easy to inspect.
  - Images: hand-set concept weights for each drawn thumbnail (what a trained image encoder
    would output), then L2-normalised.
  - Text: a toy encoder that adds up word vectors and L2-normalises the sum. Like a real
    Transformer text encoder, it lets context words choose the meaning of an ambiguous word
    ("jaguar" the animal or the car; "mouse" the animal or the computer gadget).
  All similarities are real cosine similarities computed from these vectors.
*/

export const AXES = [
  'animal', 'pet', 'wild', 'feline', 'bigcat', 'spots', 'stripes', 'mane', 'jaguar', 'dog', 'bird', 'rodent',
  'vehicle', 'rail', 'car', 'bicycle', 'road',
  'food', 'noodle', 'rice', 'spicy', 'chicken',
  'sea', 'sky', 'sunset', 'tree',
  'computer', 'desk',
  'play', 'ball', 'sleep', 'sofa', 'home',
  'red', 'orange', 'blue',
  'photo', 'drawing', 'blur', 'closeup',
] as const
export type Axis = (typeof AXES)[number]
type Concept = Partial<Record<Axis, number>>
export type Vec = number[]

const IDX: Record<string, number> = Object.fromEntries(AXES.map((a, i) => [a, i]))

export function vec(c: Concept): Vec {
  const v = new Array(AXES.length).fill(0)
  for (const [k, w] of Object.entries(c)) v[IDX[k]] += w as number
  return v
}
export const add = (a: Vec, b: Vec, s = 1) => a.map((x, i) => x + s * b[i])
export const dot = (a: Vec, b: Vec) => a.reduce((t, x, i) => t + x * b[i], 0)
export const norm = (a: Vec) => Math.sqrt(dot(a, a))
export function normalise(a: Vec): Vec {
  const n = norm(a)
  return n < 1e-9 ? a.map(() => 0) : a.map((x) => x / n)
}
export const cosine = (a: Vec, b: Vec) => {
  const na = norm(a)
  const nb = norm(b)
  return na < 1e-9 || nb < 1e-9 ? 0 : dot(a, b) / (na * nb)
}
export function softmax(z: number[]): number[] {
  const m = Math.max(...z)
  const e = z.map((x) => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / s)
}

// ---------------------------------------------------------------- images

export type ImageId = 'cat' | 'dog' | 'bird' | 'train' | 'bicycle' | 'laksa' | 'chickenrice' | 'sunset' | 'jaguar' | 'mouse'

export const IMAGES: Record<ImageId, { name: string; label: string; concept: Concept }> = {
  cat: { name: 'cat on a sofa', label: 'cat', concept: { feline: 1, pet: 0.6, animal: 0.5, sleep: 0.6, sofa: 0.5, home: 0.3, orange: 0.4, photo: 0.35 } },
  dog: { name: 'dog with a ball', label: 'dog', concept: { dog: 1, pet: 0.6, animal: 0.5, ball: 0.6, play: 0.6, tree: 0.15, photo: 0.35 } },
  bird: { name: 'bird on a branch', label: 'bird', concept: { bird: 1, animal: 0.5, tree: 0.5, sky: 0.3, blue: 0.3, photo: 0.35 } },
  train: { name: 'MRT train', label: 'train', concept: { rail: 1, vehicle: 0.6, red: 0.25, photo: 0.35 } },
  bicycle: { name: 'red bicycle', label: 'bicycle', concept: { bicycle: 1, vehicle: 0.4, road: 0.3, red: 0.6, photo: 0.35 } },
  laksa: { name: 'bowl of laksa', label: 'laksa', concept: { noodle: 1, spicy: 0.6, food: 0.6, orange: 0.5, photo: 0.35 } },
  chickenrice: { name: 'chicken rice', label: 'chicken rice', concept: { rice: 1, chicken: 0.7, food: 0.6, photo: 0.35 } },
  sunset: { name: 'sunset over the sea', label: 'sunset', concept: { sunset: 1, sea: 0.8, sky: 0.5, orange: 0.6, photo: 0.35 } },
  jaguar: { name: 'jaguar', label: 'jaguar', concept: { bigcat: 1, feline: 0.5, spots: 0.8, jaguar: 0.8, wild: 0.6, animal: 0.5, tree: 0.3, orange: 0.4, photo: 0.35 } },
  mouse: { name: 'computer mouse', label: 'mouse', concept: { computer: 1, desk: 0.4, photo: 0.35 } },
}

const imageCache = new Map<ImageId, Vec>()
export function imageEmbedding(id: ImageId): Vec {
  let v = imageCache.get(id)
  if (!v) {
    v = normalise(vec(IMAGES[id].concept))
    imageCache.set(id, v)
  }
  return v
}

// ---------------------------------------------------------------- text encoder

const STOP = new Set(
  'a an the of on in at with and or is are was this that these those some very by to its it for from up my our your his her their one there here something thing things type kind looking look into over under near next beside sitting parked lying being has have just'.split(
    ' ',
  ),
)
// note: "over", "near", "sitting" etc. are treated as filler words by this toy.

const W: Record<string, Concept> = {}
const def = (words: string, c: Concept) => words.split(' ').forEach((w) => (W[w] = c))

// animals
def('cat cats kitten kittens kitty', { feline: 1, pet: 0.6, animal: 0.5 })
def('dog dogs puppy puppies doggy', { dog: 1, pet: 0.6, animal: 0.5 })
def('bird birds sparrow mynah pigeon', { bird: 1, animal: 0.5 })
def('tiger tigers', { bigcat: 1, feline: 0.5, stripes: 0.9, wild: 0.6, animal: 0.5 })
def('lion lions', { bigcat: 1, feline: 0.5, mane: 0.9, wild: 0.6, animal: 0.5 })
def('leopard leopards', { bigcat: 1, feline: 0.5, spots: 0.8, wild: 0.6, animal: 0.5 })
def('cheetah cheetahs', { bigcat: 0.9, feline: 0.5, spots: 0.8, wild: 0.6, animal: 0.5 })
def('hamster hamsters', { rodent: 1, pet: 0.6, animal: 0.5 })
def('rat rats', { rodent: 1, animal: 0.5 })
def('animal animals creature wildlife', { animal: 1 })
def('pet pets', { pet: 1, animal: 0.4 })
def('wild jungle forest', { wild: 1, animal: 0.2, tree: 0.3 })
def('zoo', { wild: 0.6, animal: 0.6 })
def('spotted spots', { spots: 1 })
def('striped stripes', { stripes: 1 })
def('mane', { mane: 1 })
def('fluffy furry fur', { pet: 0.4, animal: 0.4 })
def('sleeping asleep sleepy nap napping sleeps', { sleep: 1 })
def('sofa couch cushion', { sofa: 1, home: 0.4 })
def('home house indoors', { home: 1 })
def('ball', { ball: 1, play: 0.5 })
def('playing play plays chasing chase chases fetch running', { play: 1 })
def('branch tree trees garden park', { tree: 1 })
def('flying fly', { sky: 0.7, bird: 0.3 })
// vehicles
def('train trains mrt lrt railway rail station', { rail: 1, vehicle: 0.6 })
def('car cars taxi', { car: 1, vehicle: 0.6, road: 0.4 })
def('bus', { vehicle: 0.8, road: 0.7 })
def('bicycle bicycles bike bikes cycling', { bicycle: 1, vehicle: 0.4, road: 0.3 })
def('wheels wheel', { vehicle: 0.6, bicycle: 0.3, car: 0.3 })
def('road street', { road: 1 })
def('vehicle vehicles transport', { vehicle: 1 })
def('drive driving', { car: 0.6, road: 0.5, vehicle: 0.3 })
// food
def('laksa', { noodle: 1, spicy: 0.6, food: 0.6 })
def('noodles noodle mee ramen', { noodle: 1, food: 0.6 })
def('soup bowl', { noodle: 0.4, food: 0.5 })
def('spicy chilli curry', { spicy: 1, food: 0.3 })
def('rice', { rice: 1, food: 0.6 })
def('chicken', { chicken: 1, food: 0.4 })
def('food meal lunch dinner breakfast eat eating hungry dish hawker delicious tasty', { food: 1 })
def('plate', { food: 0.5, rice: 0.2 })
// scenery
def('sea ocean waves water coast', { sea: 1 })
def('beach', { sea: 0.8, sunset: 0.2 })
def('sunset sunrise dusk evening', { sunset: 1, sky: 0.5 })
def('sun', { sunset: 0.7, sky: 0.5 })
def('sky clouds', { sky: 1 })
// gadgets
def('computer laptop pc keyboard click wireless office', { computer: 1 })
def('desk table', { desk: 1, computer: 0.3 })
// colours
def('red', { red: 1 })
def('orange ginger', { orange: 1 })
def('blue', { blue: 1 })
// style words (what kind of picture it is)
def('photo photos photograph picture image snapshot', { photo: 0.5 })
def('drawing sketch cartoon illustration painting doodle', { drawing: 0.5 })
def('blurry blurred fuzzy', { blur: 0.5 })
def('close closeup', { closeup: 0.5 })

/** Ambiguous words: each sense has cue words that select it; with no cue, the meanings are averaged. */
const SENSES: Record<string, { sense: string; c: Concept; cues: string[] }[]> = {
  jaguar: [
    { sense: 'the big cat', c: { bigcat: 1, feline: 0.5, spots: 0.8, jaguar: 0.9, wild: 0.6, animal: 0.5 }, cues: ['animal', 'animals', 'wild', 'wildlife', 'jungle', 'forest', 'zoo', 'cat', 'cats', 'big', 'spotted', 'spots', 'pet', 'pets', 'creature', 'fur', 'furry'] },
    { sense: 'the car', c: { car: 1, vehicle: 0.6, road: 0.4 }, cues: ['car', 'cars', 'drive', 'driving', 'vehicle', 'vehicles', 'road', 'street', 'wheels', 'engine', 'luxury'] },
  ],
  jaguars: [],
  mouse: [
    { sense: 'the animal', c: { rodent: 1, animal: 0.5, pet: 0.3 }, cues: ['animal', 'animals', 'wild', 'wildlife', 'pet', 'pets', 'cheese', 'tail', 'rodent', 'creature', 'fur', 'furry', 'zoo'] },
    { sense: 'the computer gadget', c: { computer: 1, desk: 0.3 }, cues: ['computer', 'laptop', 'pc', 'click', 'desk', 'wireless', 'keyboard', 'office', 'gadget', 'accessory'] },
  ],
  mice: [],
}
SENSES.jaguars = SENSES.jaguar
SENSES.mice = SENSES.mouse

/** Number of words the toy text encoder knows (not counting filler words). */
export const vocabSize = () => Object.keys(W).length + Object.keys(SENSES).length

export interface Token {
  word: string
  kind: 'known' | 'stop' | 'unknown' | 'ambiguous'
  /** for ambiguous words: which meaning the context picked (or a 50/50 mix of both) */
  sense?: string
}

const tokenise = (text: string) => (text.toLowerCase().match(/[a-z]+/g) ?? []).slice(0, 24)

function lookup(w: string): Concept | undefined {
  if (W[w]) return W[w]
  if (w.endsWith('es') && W[w.slice(0, -2)]) return W[w.slice(0, -2)]
  if (w.endsWith('s') && W[w.slice(0, -1)]) return W[w.slice(0, -1)]
  return undefined
}

/** Encode a sentence: sum of word vectors (ambiguous words resolved by context), L2-normalised. */
export function encodeText(text: string): { v: Vec; tokens: Token[]; known: number } {
  const words = tokenise(text)
  const set = new Set(words)
  let sum = new Array(AXES.length).fill(0) as Vec
  const tokens: Token[] = []
  let known = 0
  for (const w of words) {
    if (STOP.has(w)) {
      tokens.push({ word: w, kind: 'stop' })
      continue
    }
    const senses = SENSES[w]
    if (senses && senses.length) {
      const hit = senses.filter((s) => s.cues.some((c) => set.has(c)))
      const use = hit.length === 1 ? hit : senses
      for (const s of use) sum = add(sum, vec(s.c), 1 / use.length)
      tokens.push({ word: w, kind: 'ambiguous', sense: use.length === 1 ? use[0].sense : `a 50/50 mix of ${senses.map((x) => x.sense).join(' and ')}` })
      known++
      continue
    }
    const c = lookup(w)
    if (c) {
      sum = add(sum, vec(c))
      tokens.push({ word: w, kind: 'known' })
      known++
    } else tokens.push({ word: w, kind: 'unknown' })
  }
  return { v: normalise(sum), tokens, known }
}

// ---------------------------------------------------------------- a flat map of the space

/*
  To draw the space on a page we place each vector between named landmarks ("cat", "rail", …):
  its position is the average of the landmarks' positions, weighted by the square of how much of
  that concept the vector contains. Nearness on the map is only approximate; similarity numbers
  are always computed in the full space.
*/
const ANCHOR: Partial<Record<Axis, [number, number]>> = {
  animal: [-0.62, 0.42],
  pet: [-0.55, 0.6],
  wild: [-0.95, 0.25],
  feline: [-0.82, 0.62],
  bigcat: [-0.98, 0.45],
  spots: [-1, 0.35],
  stripes: [-1, 0.35],
  mane: [-1, 0.35],
  jaguar: [-1, 0.35],
  dog: [-0.38, 0.86],
  bird: [-0.85, 0.05],
  rodent: [-0.5, 0.25],
  sleep: [-1, 0.85],
  sofa: [-0.95, 0.95],
  home: [-0.9, 0.95],
  play: [-0.12, 0.92],
  ball: [-0.1, 0.98],
  tree: [-0.75, -0.1],
  vehicle: [0.62, 0.5],
  rail: [0.9, 0.55],
  car: [0.88, 0.25],
  bicycle: [0.45, 0.9],
  road: [0.6, 0.75],
  food: [-0.55, -0.62],
  noodle: [-0.85, -0.5],
  spicy: [-0.95, -0.7],
  rice: [-0.35, -0.92],
  chicken: [-0.25, -0.95],
  sea: [0.55, -0.75],
  sunset: [0.88, -0.5],
  sky: [0.35, -0.3],
  computer: [0.95, -0.05],
  desk: [0.9, -0.15],
}

export function mapPosition(v: Vec): [number, number] | null {
  let sx = 0
  let sy = 0
  let sw = 0
  AXES.forEach((a, i) => {
    const p = ANCHOR[a]
    if (!p || v[i] <= 0) return
    const w = v[i] * v[i]
    sx += w * p[0]
    sy += w * p[1]
    sw += w
  })
  return sw < 1e-9 ? null : [sx / sw, sy / sw]
}

export const REGIONS: { label: string; at: [number, number] }[] = [
  { label: 'animals', at: [-0.7, 1.12] },
  { label: 'vehicles', at: [0.7, 1.12] },
  { label: 'food', at: [-0.7, -1.12] },
  { label: 'scenery', at: [0.7, -1.12] },
]
