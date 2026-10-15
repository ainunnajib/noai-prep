import { Figure, M } from '../../../../../kit'
import { Walkthrough, type WalkItem } from './walkthrough'
import s from './pp.module.css'

/*
  Seven real 2026 Prelim items (Q1–119 blocks), printed as in the paper, each with a target time.
  Answer under the clock, then reveal: the one fact, the fastest method, the misconception behind
  every wrong option, and the lesson that teaches it.
*/

const L = (m: string, l: string, label: string) => ({ href: `#/learn/${m}/${l}`, label })

const ITEMS: WalkItem[] = [
  {
    n: 1,
    tag: 'Shape of a product',
    topic: 'Linear algebra',
    target: 10,
    question: <>What is the result of multiplying a 3×2 matrix by a 2×4 matrix?</>,
    options: ['3×4 matrix', '2×2 matrix', '3×2 matrix', 'Cannot multiply'],
    answer: 0,
    notes: [
      <>Right: the inner 2s match and cancel, the outer numbers 3 and 4 survive.</>,
      <>The two inner numbers, which are exactly the ones that disappear.</>,
      <>Copies the first matrix’s shape, as if multiplying changed nothing.</>,
      <>Compares the wrong pair (3 against 4). Only the inner pair has to agree.</>,
    ],
    fact: (
      <>
        <M>{'(m \\times n)(n \\times p) = (m \\times p)'}</M>: the inner sizes must match, then they cancel.
      </>
    ),
    method: (
      <>
        Write the shapes side by side, <M>{'3\\times\\underline{2}\\;\\cdot\\;\\underline{2}\\times 4'}</M>. Inner pair 2 = 2, so it works. Cross out the inner pair and read what is left: <strong>3×4</strong>. About 5 seconds.
      </>
    ),
    lessons: [L('vectors-and-matrices', 'matrices-and-multiplication', 'Matrices, shapes and matrix multiplication')],
  },
  {
    n: 15,
    tag: 'Determinant, eigenvalues, singular',
    topic: 'Linear algebra',
    target: 15,
    question: <>If matrix A has eigenvalues [4, 2, 0], what can you conclude?</>,
    options: ['A is invertible', 'A is singular (non-invertible)', 'A is orthogonal', 'A is diagonal'],
    answer: 1,
    notes: [
      <>Invertible needs every eigenvalue to be non-zero. One zero is enough to break it.</>,
      <>Right: det(A) = 4 × 2 × 0 = 0, and a zero determinant means singular.</>,
      <>Orthogonal matrices keep lengths, so every eigenvalue has size 1. A 0 rules this out.</>,
      <>Eigenvalues do not tell you the layout of the entries. Many non-diagonal matrices have eigenvalues 4, 2, 0.</>,
    ],
    fact: (
      <>
        <M>{'\\det(A) = \\lambda_1 \\lambda_2 \\cdots \\lambda_n'}</M> (product of the eigenvalues), and <M>{'\\det(A)=0'}</M> ⇔ singular.
      </>
    ),
    method: (
      <>
        See the 0 in the list, multiply: <M>{'4\\times2\\times0=0'}</M>. Zero determinant → no inverse → <strong>singular</strong>. You never need the matrix itself.
      </>
    ),
    lessons: [
      L('linear-algebra-deeper', 'eigenvectors-eigenvalues', 'Eigenvectors and eigenvalues'),
      L('vectors-and-matrices', 'identity-inverse-determinant', 'Identity, inverse, determinant and trace'),
    ],
  },
  {
    n: 34,
    tag: 'Activation derivatives',
    topic: 'Calculus',
    target: 15,
    question: <>What is ∂/∂x of sigmoid σ(x) = 1/(1+e^(-x))?</>,
    options: ['σ(x)', 'σ(x)(1-σ(x))', 'e^(-x)', '-σ(x)'],
    answer: 1,
    notes: [
      <>
        That rule belongs to <M>{'e^x'}</M>, whose derivative is itself. At <M>{'x=0'}</M> it gives 0.5, not the true slope 0.25.
      </>,
      <>
        Right: <M>{'\\sigma(1-\\sigma)'}</M>, which is 0.5 × 0.5 = 0.25 at <M>{'x=0'}</M>.
      </>,
      <>Only part of the working: it is the top of the true derivative before you divide. At x = 0 it gives 1.</>,
      <>Sigmoid always goes up, so its slope is always positive. A minus sign cannot be right.</>,
    ],
    fact: (
      <>
        <M>{'\\sigma\'(x) = \\sigma(x)\\,(1-\\sigma(x))'}</M>, which peaks at <M>{'\\tfrac14'}</M> when <M>{'x = 0'}</M>.
      </>
    ),
    method: (
      <>
        If you remember it, 3 seconds. If not, <strong>plug in x = 0</strong>: <M>{'\\sigma(0)=\\tfrac12'}</M> and the true slope there is <M>{'\\tfrac14'}</M>. The options give 0.5, 0.25, 1 and −0.5, so only <M>{'\\sigma(1-\\sigma)'}</M> survives.
      </>
    ),
    lessons: [
      L('neural-networks', 'activation-functions', 'Activation functions and non-linearity'),
      L('calculus-and-gradient-descent', 'chain-rule', 'The chain rule'),
    ],
  },
  {
    n: 54,
    tag: 'z-scores and the normal curve',
    topic: 'Statistics',
    target: 15,
    question: <>A dataset has mean = 10, std = 2. What is the z-score of x = 14?</>,
    options: ['1', '2', '4', '7'],
    answer: 1,
    notes: [
      <>
        Divided by the variance (<M>{'2^2 = 4'}</M>) instead of the standard deviation: 4 ÷ 4 = 1.
      </>,
      <>Right: (14 − 10) ÷ 2 = 2 standard deviations above the mean.</>,
      <>Subtracted but forgot to divide: 14 − 10 = 4 is the distance in raw units.</>,
      <>Divided but forgot to subtract the mean: 14 ÷ 2 = 7.</>,
    ],
    fact: (
      <>
        <M>{'z = \\dfrac{x-\\mu}{\\sigma}'}</M>: how many standard deviations <M>{'x'}</M> sits from the mean.
      </>
    ),
    method: <>Subtract, then divide: 14 − 10 = 4, then 4 ÷ 2 = 2. Every wrong option is this formula with one step skipped or swapped.</>,
    lessons: [
      L('probability-and-statistics', 'distributions-and-clt', 'Distributions, the normal curve and the CLT'),
      L('data-and-features', 'scaling-and-normalisation', 'Scaling, normalisation and standardisation'),
    ],
  },
  {
    n: 74,
    tag: 'Hessian and Newton’s method',
    topic: 'Optimisation (computing block)',
    target: 30,
    question: (
      <>
        You implement Newton’s method for a small 3-layer network (10K parameters). Training is 100× slower than Adam despite better convergence. Profiling shows 95% of the time is spent in one operation. What could be this one operation?
      </>
    ),
    options: ['Matrix inversion of the 10K×10K Hessian matrix', 'Forward pass through the network', 'Computing gradients via backpropagation', 'Loading data from disk'],
    answer: 0,
    notes: [
      <>
        Right: the Hessian has <M>{'10^4\\times10^4=10^8'}</M> entries and inverting it takes about <M>{'n^3 = 10^{12}'}</M> operations, every step.
      </>,
      <>Adam runs the same forward pass. Something both optimisers do cannot make one of them 100× slower.</>,
      <>Adam needs these gradients too, and backprop costs only a small multiple of the forward pass.</>,
      <>Same data, same disk for both optimisers, so it cannot explain the gap.</>,
    ],
    fact: (
      <>
        Newton’s step is <M>{'w \\leftarrow w - H^{-1}\\nabla L'}</M>. For <M>{'n'}</M> parameters, <M>{'H'}</M> is <M>{'n\\times n'}</M>: <M>{'n^2'}</M> numbers to store and about <M>{'n^3'}</M> operations to invert.
      </>
    ),
    method: (
      <>
        Ask: <strong>what does Newton do that Adam does not?</strong> Only one option is Newton-specific. Then sanity-check the size: <M>{'n=10^4 \\Rightarrow n^3 = 10^{12}'}</M>, against roughly <M>{'10^4'}</M> per example for a forward pass.
      </>
    ),
    lessons: [
      L('calculus-and-gradient-descent', 'curvature-convexity', 'Curvature: second derivatives, convexity and the Hessian'),
      L('ml-systems-and-tradeoffs', 'cost-of-ml', 'The computational cost of ML operations'),
    ],
  },
  {
    n: 99,
    tag: 'pandas selection',
    topic: 'pandas',
    target: 15,
    question: (
      <>
        You have a Pandas DataFrame <code>df</code> with a column named <code>'total price'</code> (contains a space). Which is the ONLY valid way to select this column?
      </>
    ),
    options: [<code key="a">df.total price</code>, <code key="b">df('total price')</code>, <code key="c">df.loc['total price']</code>, <code key="d">df['total price']</code>],
    answer: 3,
    notes: [
      <>Dot access needs a valid Python name, and names cannot contain spaces: SyntaxError.</>,
      <>Round brackets call a function. A DataFrame is not callable: TypeError.</>,
      <>
        <code>.loc</code>’s first slot is the <em>row</em> label, so this hunts for a row called 'total price': KeyError. The column version is <code>df.loc[:, 'total price']</code>.
      </>,
      <>Right: square brackets with the name as a string work for any column name.</>,
    ],
    fact: (
      <>
        <code>df['name']</code> selects a column by its exact name; <code>df.loc[row, col]</code> puts rows first.
      </>
    ),
    method: <>Eliminate by error type: the space breaks dot access, round brackets mean “call”, and .loc starts with rows. One option is left.</>,
    caveat: (
      <>
        “ONLY” is true only among these four: <code>df.loc[:, 'total price']</code> also works.
      </>
    ),
    lessons: [L('pandas-and-plotting', 'dataframes-and-selection', 'DataFrames and selection')],
  },
  {
    n: 115,
    tag: 'Gradient accumulation',
    topic: 'PyTorch',
    target: 15,
    question: (
      <>
        What happens if you call <code>loss.backward()</code> twice without <code>zero_grad()</code>?
      </>
    ),
    options: ['Gradients accumulate (add up)', 'Error is raised', 'Second call overwrites first', "Only second call's gradients are kept"],
    answer: 0,
    notes: [
      <>
        Right: <code>backward()</code> does <code>grad += new_grad</code>. With loss = w², w = 2: 4, then 4 + 4 = 8.
      </>,
      <>
        Only if you reuse the very same graph without <code>retain_graph=True</code>. In a normal loop each backward has its own fresh forward pass, so there is no error.
      </>,
      <>“Overwrite” is the = versus += misconception.</>,
      <>Says the same thing as “overwrites”. Two options that mean the same cannot both be the single right answer, so both go.</>,
    ],
    fact: <>PyTorch adds new gradients into .grad instead of replacing them; that is why every training step starts with zero_grad().</>,
    method: <>Think “+=”. Then use the twin trick: “overwrites” and “only the second is kept” say the same thing, so neither can be the unique answer.</>,
    caveat: (
      <>
        Taken literally (the <em>same</em> <code>loss</code> twice), PyTorch raises “Trying to backward through the graph a second time”. The paper’s key reads it as two backward passes, and the lesson below runs both cases.
      </>
    ),
    lessons: [
      L('pytorch', 'autograd', 'Autograd: automatic gradients'),
      L('debugging-and-diagnosis', 'pytorch-gotchas', 'PyTorch gotchas and debugging tools'),
    ],
  },
]

export default function MathsComputingWalkthrough() {
  const totalTarget = ITEMS.reduce((a, x) => a + x.target, 0)
  return (
    <Figure
      title="Answer first, then reveal: seven 2026 items"
      caption={
        <>
          Press <strong>Start the clock</strong>, answer, then reveal the solution one step at a time. Notice how often the answer comes from <em>one fact</em>, and how every wrong option is that same fact with one step skipped or swapped. All seven together have a target of {totalTarget} s, under the {7 * 36} s that seven questions get at the 2027 pace.
        </>
      }
    >
      <Walkthrough items={ITEMS} storageKey="ppw-review-maths-computing" />
      <p className={s.small} style={{ margin: 0 }}>
        Options are printed in the paper’s order (A to D), with the paper’s wording.
      </p>
    </Figure>
  )
}
