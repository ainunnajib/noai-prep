import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'text-as-data.text-classification.1',
    prompt:
      'A bag-of-words logistic regression has bias $b = +0.5$ and word weights good $+1.5$, not $-0.5$, bad $-2.0$. What score $z$ does it give the review *not bad*, and what does it predict?',
    options: [
      '$z = -2.0$, so it predicts negative',
      '$z = +2.0$, so it predicts positive',
      '$z = -2.5$, so it predicts negative',
      '$z = +1.5$, so it predicts positive',
    ],
    answer: 0,
    explanation:
      'A linear bag-of-words model just adds the bias and the weights of the words present: $z = 0.5 + (-0.5) + (-2.0) = -2.0 < 0$, so it predicts negative ($\\sigma(-2) \\approx 0.12$). It cannot let "not" flip "bad", which is why it gets this review wrong. $-2.5$ forgets the bias; $+2.0$ and $+1.5$ pretend the model can negate or multiply weights.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.text-classification.2',
    prompt:
      'A TF-IDF + logistic regression model gives exactly the same probability to *the plot was good but the acting was bad* and *the plot was bad but the acting was good*. Why?',
    options: [
      'They contain exactly the same words, and a TF-IDF vector does not record word order',
      'TF-IDF gives every common word, including "good" and "bad", a weight of exactly zero',
      'Logistic regression always outputs 0.5 for any review that mixes positive and negative words',
      'Both have the same number of tokens, and a TF-IDF vector stores only the length of the text',
    ],
    answer: 0,
    explanation:
      'TF-IDF, like any bag of words, has one slot per vocabulary word holding a weighted count. Both sentences have identical counts, so they get identical vectors and therefore identical predictions. IDF only shrinks words that appear in almost every document, and the model\'s output depends on which words appear, not on the review being "mixed" or on its length.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.text-classification.3',
    prompt:
      'A hospital has 50,000 labelled patient-feedback messages to sort into 6 topics and has a GPU. Which approach is most likely to give the highest accuracy?',
    options: [
      'Fine-tune a pretrained encoder such as BERT, with a linear classification head on its [CLS] vector',
      'TF-IDF with logistic regression, because a linear model cannot overfit and so is always the most accurate',
      'Train a large Transformer from random initial weights using only the 50,000 hospital messages',
      'Average randomly initialised word embeddings that are frozen, then train a logistic regression on top',
    ],
    answer: 0,
    explanation:
      'With thousands of labelled examples, fine-tuning a pretrained encoder usually wins: it starts out knowing the language from billions of words and it reads words in context, word order included. TF-IDF + logistic regression is a strong, fast baseline but ignores word order, and linear models can overfit too. Training from scratch throws away all that pretrained knowledge, and frozen random embeddings carry no meaning at all.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.text-classification.4',
    prompt:
      'A 3-class classifier is tested on 100 messages. Its per-class F1 scores are 0.90 (80 messages), 0.60 (15 messages) and 0.30 (5 messages). What is its macro-F1?',
    options: ['0.60', '0.825', '0.90', '0.30'],
    answer: 0,
    explanation:
      'Macro-F1 is the plain average of the per-class F1 scores, so each class gets an equal vote: $(0.90 + 0.60 + 0.30)/3 = 1.80/3 = 0.60$. Weighting by class size gives the weighted-F1, $0.90 \\times 0.80 + 0.60 \\times 0.15 + 0.30 \\times 0.05 = 0.825$, which is dominated by the big class and hides the weak rare one.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.text-classification.5',
    prompt: 'This is the forward pass of a text classifier, where `emb` is an `nn.Embedding` and `fc` is an `nn.Linear`. Which statement about it is true?',
    code: '# ids has shape (batch, seq_len)\nvecs = emb(ids)\navg = vecs.mean(dim=1)\nlogits = fc(avg)',
    options: [
      'Reordering the words in a sentence never changes its logits',
      '`fc` needs one input weight for every word in the vocabulary',
      'It only works on sentences as long as its training sentences',
      '`avg` has shape `(batch, seq_len)`, one number per word',
    ],
    answer: 0,
    explanation:
      '`vecs` has shape `(batch, seq_len, dim)`, and averaging over `dim=1` (the positions) gives `(batch, dim)`. An average does not care about order, so any shuffle of the same words gives the same `avg` and the same logits. `fc` therefore has `dim` inputs, not one per vocabulary word, and averaging works for any sentence length.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.text-classification.6',
    prompt:
      'A hawker association has only 300 labelled reviews (positive or negative) and wants the most accurate sentiment classifier it can get. Which plan is most likely to reach the highest accuracy?',
    options: [
      'Reuse a pretrained encoder, either as frozen features for logistic regression or fine-tuned gently',
      'Train a 3-layer LSTM from random weights, because only a sequence model can understand word order',
      'Use TF-IDF with logistic regression only, because pretrained models need thousands of labelled reviews',
      'Cluster the reviews into two groups with k-means, because 300 labels are too few for supervised learning',
    ],
    answer: 0,
    explanation:
      'Pretrained knowledge is what makes small datasets workable: the encoder already knows that "tasty" and "delicious" are similar and reads words in context, so 300 labels are enough to train a small head on its embeddings or to nudge its weights with a small learning rate. TF-IDF + logistic regression is the right first baseline, but it usually loses to a pretrained encoder even at this size; "pretrained models need thousands of labels" is a myth. A from-scratch LSTM has far more parameters than 300 examples and overfits, and k-means throws away the labels you have.',
    difficulty: 'intermediate',
  },
]

export default questions
