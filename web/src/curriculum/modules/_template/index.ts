import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: '_template',
  order: 1,
  part: 'start',
  domain: 'mathematics',
  title: 'Sample: vectors',
  tagline: 'Arrows you can add',
  summary: 'A reference module showing every lesson component.',
  prerequisites: [],
  syllabus: ['Linear algebra: vectors, norms, dot product'],
  lessons: [
    {
      slug: 'what-is-a-vector',
      title: 'What is a vector?',
      summary: 'A vector is a list of numbers that you can also draw as an arrow.',
      minutes: 12,
      objectives: ['Draw a 2-D vector as an arrow', 'Compute its length with Pythagoras', 'Recognise the L2 norm in exam questions'],
      load: () => import('./what-is-a-vector.mdx'),
    },
  ],
}
export default mod
