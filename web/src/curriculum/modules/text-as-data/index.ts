import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "text-as-data",
  order: 26,
  part: "language-audio",
  domain: "ai_ml_dl",
  title: "Text as data: tokens, vectors and sequences",
  tagline: "Turning words into numbers",
  summary: "Tokenisation (word, character, subword BPE), padding and special tokens, bag-of-words and TF-IDF with cosine retrieval (the 2025 Final RAG task), word embeddings, a text-classification pipeline, and recurrent networks (RNN, LSTM) as the pre-Transformer approach.",
  prerequisites: ["training-deep-networks", "data-and-features"],
  syllabus: ["IOAI 1D7 tokenization and vocabulary building, padding for variable-length sequences", "IOAI 2B2 Data Embeddings (text)", "IOAI 4A1 Text Classification", "NOAI 2025 Final Q3: TF-IDF and cosine similarity retrieval", "NOAI Prelim: Word2Vec, RNNs, LSTMs, subword tokenisation"],
  lessons: [
    {
      slug: "tokenisation",
      title: "Tokenisation, vocabularies and padding",
      summary: "Splitting text into word, character or subword tokens, special tokens, and padding with attention masks.",
      minutes: 18,
      objectives: ["You can compare word, character and subword tokenisation", "You can explain how BPE builds subwords by merging frequent pairs", "You can explain [CLS], [SEP], [PAD], [UNK] and attention masks"],
      load: () => import('./tokenisation.mdx'),
    },
    {
      slug: "bag-of-words-and-tfidf",
      title: "Bag of words, TF-IDF and cosine retrieval",
      summary: "Representing documents as word-count vectors, down-weighting common words with TF-IDF, and retrieving the most similar document with cosine similarity.",
      minutes: 22,
      objectives: ["You can build count vectors for small documents", "You can compute TF-IDF weights", "You can rank documents against a query by cosine similarity", "You can implement this retrieval in NumPy as in the 2025 Final"],
      load: () => import('./bag-of-words-and-tfidf.mdx'),
    },
    {
      slug: "word-embeddings",
      title: "Word embeddings",
      summary: "Dense vectors that place similar words near each other, how Word2Vec learns them from context, and embedding layers as lookup tables.",
      minutes: 20,
      objectives: ["You can contrast one-hot vectors with dense embeddings", "You can explain the distributional hypothesis and Word2Vec's skip-gram/CBOW", "You can explain an embedding layer as a lookup (one-hot × matrix)", "You can perform analogy arithmetic on vectors"],
      load: () => import('./word-embeddings.mdx'),
    },
    {
      slug: "text-classification",
      title: "Text classification",
      summary: "The pipeline from raw text to a label, from bag-of-words with logistic regression to averaged embeddings and fine-tuned encoders.",
      minutes: 18,
      objectives: ["You can describe the stages of a text-classification pipeline", "You can interpret word weights in a linear text classifier", "You can choose an approach for a given data size", "You can evaluate with macro-F1 on imbalanced classes"],
      load: () => import('./text-classification.mdx'),
    },
    {
      slug: "rnns-and-lstms",
      title: "Recurrent networks and LSTMs",
      summary: "Reading sequences one step at a time with a hidden state, vanishing gradients through time, LSTM gates, and the seq2seq bottleneck that motivated attention.",
      minutes: 20,
      objectives: ["You can describe how an RNN updates its hidden state", "You can explain vanishing gradients through time", "You can describe what LSTM gates do", "You can explain the encoder-decoder bottleneck"],
      load: () => import('./rnns-and-lstms.mdx'),
    },
  ],
}

export default mod
