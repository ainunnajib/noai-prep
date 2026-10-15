import { useState } from 'react'
import { Figure, Controls, Readout, Slider, NeuralNet } from '../../../../../kit'

/** Add hidden layers to a small network and watch it become "deep" (and its number of weights grow). */
export default function DeepNetSlider() {
  const [hidden, setHidden] = useState(1)
  const layers = [3, ...Array.from({ length: hidden }, () => 4), 2]
  const labels = ['in', ...Array.from({ length: hidden }, (_, i) => `h${i + 1}`), 'out']
  let weights = 0
  for (let l = 0; l < layers.length - 1; l++) weights += layers[l] * layers[l + 1]
  const kind = hidden === 0 ? 'no hidden layer: shallow' : hidden === 1 ? 'one hidden layer: shallow' : `${hidden} hidden layers: deep`

  return (
    <Figure
      title="What makes a neural network “deep”?"
      caption={
        <>
          The input circles just hold the input numbers. Every circle after them is a <strong>neuron</strong>: a tiny unit that multiplies each incoming number
          by a weight, adds them up with a bias, passes the total through a simple non-linear function (an <em>activation</em>) and sends the result on. Each line
          is a <strong>weight</strong>, a number the network learns from data. This network is shallow: slide to add hidden layers between input and output. With
          more than one hidden layer, a network is usually called <em>deep</em>. Real ones are far bigger: GPT-3 has 96 layers and about 175 billion learned numbers.
        </>
      }
    >
      <NeuralNet layers={layers} layerLabels={labels} width={420} height={250} ariaLabel={`Neural network with ${hidden} hidden layers and ${weights} weights`} />
      <Controls>
        <Slider label="hidden layers" value={hidden} min={0} max={4} step={1} onChange={setHidden} />
        <Readout
          items={[
            ['layers of weights', String(layers.length - 1)],
            ['weights to learn', String(weights)],
            ['verdict', kind],
          ]}
        />
      </Controls>
    </Figure>
  )
}
