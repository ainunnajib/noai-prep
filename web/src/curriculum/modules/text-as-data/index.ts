import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "text-as-data",
  order: 26,
  part: "language-audio",
  domain: "ai_ml_dl",
  title: "Text as data: tokens, vectors and sequences",
  tagline: "Turning words into numbers",
  summary: "Tokenisation (word, character, subword BPE), padding and special tokens, bag-of-words and TF-IDF with cosine retrieval (the 2025 Final RAG task), word embeddings, a text-classification pipeline with macro-F1, and recurrent networks (RNN, LSTM, the seq2seq bottleneck) as the pre-Transformer approach.",
  prerequisites: ["training-deep-networks", "data-and-features"],
  syllabus: ["IOAI 1D7 tokenization and vocabulary building, padding for variable-length sequences", "IOAI 2B2 Data Embeddings (text)", "IOAI 4A1 Text Classification", "NOAI 2025 Final Q3: TF-IDF and cosine similarity retrieval", "NOAI Prelim: Word2Vec, RNNs, LSTMs, subword tokenisation"],
  lessons: [
    {
      slug: "tokenisation",
      title: "Tokenisation, vocabularies and padding",
      summary: "Splitting text into word, character or subword (BPE) tokens, special tokens, padding with attention masks, and getting end markers and padding labels right.",
      minutes: 30,
      objectives: ["You can compare word, character and subword tokenisation and say which suits a task", "You can run BPE merges by hand on a small corpus and tokenise a new word", "You can explain [CLS], [SEP], [PAD] and [UNK] and write the attention mask of a padded batch", "You can spot the truncation bug that cuts off the end marker and explain why padding labels are −100"],
      load: () => import('./tokenisation.mdx'),
    },
    {
      slug: "bag-of-words-and-tfidf",
      title: "Bag of words, TF-IDF and cosine retrieval",
      summary: "Representing documents as word-count vectors, down-weighting common words with TF-IDF, and retrieving the most similar document with cosine similarity.",
      minutes: 30,
      objectives: ["You can build bag-of-words count vectors and say what they lose", "You can compute TF-IDF weights by hand and explain why words in every document get weight 0", "You can rank documents against a query by cosine similarity", "You can implement TF-IDF retrieval in NumPy, as in the 2025 Final"],
      load: () => import('./bag-of-words-and-tfidf.mdx'),
    },
    {
      slug: "word-embeddings",
      title: "Word embeddings",
      summary: "Dense vectors that place similar words near each other, how Word2Vec learns them from context, and embedding layers as lookup tables.",
      minutes: 30,
      objectives: ["You can contrast one-hot vectors with dense, learned embeddings", "You can explain how Word2Vec learns from context and list skip-gram or CBOW training pairs", "You can explain an embedding layer as a lookup table and predict its output shape", "You can solve analogy questions with vector arithmetic"],
      load: () => import('./word-embeddings.mdx'),
    },
    {
      slug: "text-classification",
      title: "Text classification",
      summary: "The pipeline from raw text to a label, from bag-of-words with logistic regression to averaged embeddings and fine-tuned encoders, and macro-F1 for imbalanced classes.",
      minutes: 25,
      objectives: ["You can describe the tokenise, vectorise and classify stages of a text classifier", "You can score a review by hand with a linear bag-of-words model and explain why it misses negation", "You can choose an approach for a given amount of labelled data", "You can compute macro-F1 and explain why accuracy misleads on imbalanced classes"],
      load: () => import('./text-classification.mdx'),
    },
    {
      slug: "rnns-and-lstms",
      title: "Recurrent networks and LSTMs",
      summary: "Reading sequences one step at a time with a hidden state, vanishing gradients through time, LSTM gates, and the seq2seq bottleneck that motivated attention.",
      minutes: 30,
      objectives: ["You can describe how an RNN updates its hidden state with shared weights", "You can explain why gradients vanish or explode through time", "You can compute an LSTM cell-state update and say what each gate does", "You can explain the encoder–decoder bottleneck and how attention removes it"],
      load: () => import('./rnns-and-lstms.mdx'),
    },
  ],
}

export default mod
