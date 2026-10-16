import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, useNarrow, M } from '../../../../../kit'

/*
  The Stable Diffusion (v1) pipeline as clickable cards, with tensor shapes, and a switch between
  running the denoising loop on pixels or on the VAE's latents. Shapes are for 512 × 512 images.
*/

type Space = 'latent' | 'pixel'
type CardId = 'prompt' | 'text' | 'unet' | 'vae' | 'image'

const STEPS = 50

function shapes(space: Space) {
  return space === 'latent' ? { c: 4, h: 64, w: 64 } : { c: 3, h: 512, w: 512 }
}

interface Card {
  id: CardId
  title: string
  chip: (s: Space) => string
  detail: (s: Space) => ReactNode
}

const CARDS: Card[] = [
  {
    id: 'prompt',
    title: 'Prompt',
    chip: () => '"a cat asleep on an MRT seat"',
    detail: () => (
      <>
        The text you type. It is split into <b>tokens</b> (word pieces) and padded or cut to <b>77 tokens</b>, the text encoder's fixed length.
      </>
    ),
  },
  {
    id: 'text',
    title: 'Text encoder',
    chip: () => '77 × 768',
    detail: () => (
      <>
        A pretrained Transformer (the text half of <b>CLIP</b>, which you will meet in the multimodal module) turns the 77 tokens into 77 vectors of 768 numbers that
        capture what the prompt means. It is <b>frozen</b>: Stable Diffusion's training never changes it. It runs <b>once</b> per image.
      </>
    ),
  },
  {
    id: 'unet',
    title: `U-Net × ${STEPS} steps`,
    chip: (s) => {
      const { c, h, w } = shapes(s)
      return `${c} × ${h} × ${w}`
    },
    detail: (s) => {
      const { c, h, w } = shapes(s)
      return (
        <>
          The denoiser. It starts from random noise of shape {c} × {h} × {w} and is called once per step. Each call gets the noisy {s === 'latent' ? 'latent' : 'image'},
          the step number <M>t</M> and the text vectors, and predicts the noise. Inside, <b>cross-attention</b> layers let every position of the {s === 'latent' ? 'latent' : 'image'}{' '}
          look up the words that matter for it (queries from the image side, keys and values from the text). With classifier-free guidance it runs twice per step:
          with the prompt and with an empty prompt.
        </>
      )
    },
  },
  {
    id: 'vae',
    title: 'VAE decoder',
    chip: (s) => (s === 'latent' ? '4 × 64 × 64 →\n3 × 512 × 512' : 'not needed'),
    detail: (s) =>
      s === 'latent' ? (
        <>
          The decoder half of a variational autoencoder, trained beforehand to compress images 8× in height and width and rebuild them. It turns the final clean latent
          into pixels, <b>once</b>, at the very end. (During training, the VAE <i>encoder</i> turns every training image into a latent, so the U-Net only ever sees
          latents.)
        </>
      ) : (
        <>In pixel-space diffusion the U-Net already works on the full image, so no decoder is needed, but every one of the {STEPS} steps is far more expensive.</>
      ),
  },
  {
    id: 'image',
    title: 'Image',
    chip: () => '3 × 512 × 512',
    detail: () => (
      <>
        The final picture: 3 colour channels of 512 × 512 pixels, <M>{'3 \\times 512 \\times 512 = 786{,}432'}</M> numbers.
      </>
    ),
  },
]

export default function LatentPipeline() {
  const [space, setSpace] = useState<Space>('latent')
  const [sel, setSel] = useState<CardId>('unet')
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)
  const { c, h, w } = shapes(space)
  const perStep = c * h * w
  const total = perStep * STEPS * 2

  const cardStyle = (id: CardId, off: boolean): CSSProperties => ({
    minWidth: 0,
    padding: '0.55rem 0.5rem',
    borderRadius: 10,
    border: sel === id ? '2px solid var(--accent)' : '1px solid var(--rule)',
    background: sel === id ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))' : 'var(--surface)',
    color: 'var(--ink)',
    cursor: 'pointer',
    textAlign: 'center',
    opacity: off ? 0.45 : 1,
    font: 'inherit',
  })
  const arrow = (k: number) => (
    <div key={`arr${k}`} aria-hidden="true" style={{ alignSelf: 'center', justifySelf: 'center', color: 'var(--ink-3)', fontSize: '1.2rem', lineHeight: 1 }}>
      {narrow ? '↓' : '→'}
    </div>
  )
  const current = CARDS.find((cc) => cc.id === sel)!

  return (
    <Figure
      wide
      title="Inside Stable Diffusion"
      caption={
        <>
          Click each stage to see what it does and the shape of what flows through it. Then switch the denoising loop between <b>latents</b> and <b>pixels</b>:
          the loop runs {STEPS} times (twice per step with guidance), so shrinking what it works on is the single biggest saving.
        </>
      }
    >
      <div
        ref={ref}
        style={{
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : 'minmax(0,1fr) 18px minmax(0,1fr) 18px minmax(0,1.25fr) 18px minmax(0,1.2fr) 18px minmax(0,1fr)',
          gap: narrow ? 4 : 2,
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        {CARDS.flatMap((card, k) => {
          const off = card.id === 'vae' && space === 'pixel'
          const el = (
            <button key={card.id} type="button" aria-pressed={sel === card.id} onClick={() => setSel(card.id)} style={cardStyle(card.id, off)}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{card.title}</div>
              {card.id === 'unet' && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-3)', marginTop: 2 }}>{space === 'latent' ? 'in latent space' : 'in pixel space'}</div>
              )}
              <div className="tabular" style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--ink-2)', fontFamily: card.id === 'prompt' ? 'inherit' : 'var(--font-mono)', overflowWrap: 'anywhere', whiteSpace: 'pre-line' }}>
                {card.chip(space)}
              </div>
            </button>
          )
          return k < CARDS.length - 1 ? [el, arrow(k)] : [el]
        })}
      </div>
      <div
        style={{ marginTop: '0.6rem', padding: '0.6rem 0.8rem', borderRadius: 10, background: 'var(--surface-2)', fontSize: '0.9rem', color: 'var(--ink)', lineHeight: 1.5 }}
        aria-live="polite"
      >
        <b>{current.title}.</b> {current.detail(space)}
      </div>
      <Controls>
        <Segmented
          label="Denoising loop runs on"
          value={space}
          onChange={setSpace}
          options={[
            { value: 'latent', label: 'latents (Stable Diffusion)' },
            { value: 'pixel', label: 'pixels' },
          ]}
        />
        <Readout
          items={[
            ['input numbers per U-Net call', perStep.toLocaleString('en-GB')],
            [`over ${STEPS} steps × 2 calls`, total.toLocaleString('en-GB')],
            ['vs pixels', space === 'latent' ? `${(3 * 512 * 512) / perStep}× fewer` : '1×'],
          ]}
        />
      </Controls>
    </Figure>
  )
}
