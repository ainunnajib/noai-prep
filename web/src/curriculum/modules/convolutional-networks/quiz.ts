import type { ModuleQuiz } from '../../types'
import q0 from './quiz/images-as-tensors'
import q1 from './quiz/convolution'
import q2 from './quiz/padding-stride-shapes'
import q3 from './quiz/pooling-and-receptive-field'
import q4 from './quiz/cnn-architectures-and-resnets'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "images-as-tensors": q0,
  "convolution": q1,
  "padding-stride-shapes": q2,
  "pooling-and-receptive-field": q3,
  "cnn-architectures-and-resnets": q4,
}

export default quiz
