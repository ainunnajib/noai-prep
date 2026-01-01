import Foundation

// MARK: - AI/ML/DL: NLP Questions (50 questions)
// Subcategory: Text processing, word embeddings, RNNs, transformers, language models

let nlpQuestions: [Question] = [
    // Batch 1: Text Basics & Preprocessing (10 questions)
    Question(
        id: "nlp001",
        questionEN: "What is tokenization in NLP?",
        questionID: "Apa itu tokenisasi dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Splitting text into smaller units like words or subwords", textID: "Memecah teks menjadi unit lebih kecil seperti kata atau subkata"),
            QuestionOption(id: "b", textEN: "Converting text to images", textID: "Mengkonversi teks ke gambar"),
            QuestionOption(id: "c", textEN: "Translating text to another language", textID: "Menerjemahkan teks ke bahasa lain"),
            QuestionOption(id: "d", textEN: "Encrypting text for security", textID: "Mengenkripsi teks untuk keamanan")
        ],
        correctOptionId: "a",
        explanationEN: "Tokenization splits text into tokens (words, subwords, or characters) which are the basic units processed by NLP models.",
        explanationID: "Tokenisasi memecah teks menjadi token (kata, subkata, atau karakter) yang merupakan unit dasar yang diproses oleh model NLP.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp002",
        questionEN: "What is stemming?",
        questionID: "Apa itu stemming?",
        options: [
            QuestionOption(id: "a", textEN: "Reducing words to their root form by removing suffixes", textID: "Mereduksi kata menjadi bentuk akar dengan menghapus akhiran"),
            QuestionOption(id: "b", textEN: "Finding the meaning of words", textID: "Menemukan makna kata"),
            QuestionOption(id: "c", textEN: "Counting word frequencies", textID: "Menghitung frekuensi kata"),
            QuestionOption(id: "d", textEN: "Adding prefixes to words", textID: "Menambahkan awalan ke kata")
        ],
        correctOptionId: "a",
        explanationEN: "Stemming removes word endings to get the root form (e.g., 'running' → 'run', 'studies' → 'studi'). It's faster but less accurate than lemmatization.",
        explanationID: "Stemming menghapus akhiran kata untuk mendapatkan bentuk akar (misal 'running' → 'run', 'studies' → 'studi'). Ini lebih cepat tetapi kurang akurat dari lemmatization.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp003",
        questionEN: "What is the difference between stemming and lemmatization?",
        questionID: "Apa perbedaan antara stemming dan lemmatization?",
        options: [
            QuestionOption(id: "a", textEN: "Lemmatization uses vocabulary and morphology to return proper root words", textID: "Lemmatization menggunakan kosakata dan morfologi untuk mengembalikan kata akar yang tepat"),
            QuestionOption(id: "b", textEN: "They are exactly the same", textID: "Mereka persis sama"),
            QuestionOption(id: "c", textEN: "Stemming is more accurate", textID: "Stemming lebih akurat"),
            QuestionOption(id: "d", textEN: "Lemmatization is faster", textID: "Lemmatization lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Lemmatization considers vocabulary and morphological analysis to return the dictionary form (lemma). 'better' → 'good'. Stemming just chops endings.",
        explanationID: "Lemmatization mempertimbangkan kosakata dan analisis morfologi untuk mengembalikan bentuk kamus (lemma). 'better' → 'good'. Stemming hanya memotong akhiran.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp004",
        questionEN: "What are stop words?",
        questionID: "Apa itu stop words?",
        options: [
            QuestionOption(id: "a", textEN: "Common words (like 'the', 'is', 'at') often removed in preprocessing", textID: "Kata umum (seperti 'the', 'is', 'at') yang sering dihapus dalam preprocessing"),
            QuestionOption(id: "b", textEN: "Words that end sentences", textID: "Kata yang mengakhiri kalimat"),
            QuestionOption(id: "c", textEN: "Rare technical terms", textID: "Istilah teknis yang jarang"),
            QuestionOption(id: "d", textEN: "Words that indicate errors", textID: "Kata yang menunjukkan error")
        ],
        correctOptionId: "a",
        explanationEN: "Stop words are common words that carry little meaning and are often filtered out to focus on more informative words in tasks like search or classification.",
        explanationID: "Stop words adalah kata umum yang membawa sedikit makna dan sering disaring untuk fokus pada kata yang lebih informatif dalam tugas seperti pencarian atau klasifikasi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp005",
        questionEN: "What is Bag of Words (BoW)?",
        questionID: "Apa itu Bag of Words (BoW)?",
        options: [
            QuestionOption(id: "a", textEN: "A text representation counting word occurrences, ignoring order", textID: "Representasi teks yang menghitung kemunculan kata, mengabaikan urutan"),
            QuestionOption(id: "b", textEN: "A collection of vocabulary words", textID: "Kumpulan kata-kata kosakata"),
            QuestionOption(id: "c", textEN: "Words stored in a bag data structure", textID: "Kata-kata yang disimpan dalam struktur data bag"),
            QuestionOption(id: "d", textEN: "A translation technique", textID: "Teknik penerjemahan")
        ],
        correctOptionId: "a",
        explanationEN: "Bag of Words represents text as a vector of word counts. It ignores grammar and word order, treating documents as unordered collections of words.",
        explanationID: "Bag of Words merepresentasikan teks sebagai vektor hitungan kata. Ia mengabaikan tata bahasa dan urutan kata, memperlakukan dokumen sebagai kumpulan kata yang tidak berurutan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp006",
        questionEN: "What is TF-IDF?",
        questionID: "Apa itu TF-IDF?",
        options: [
            QuestionOption(id: "a", textEN: "Term Frequency × Inverse Document Frequency - weights words by importance", textID: "Term Frequency × Inverse Document Frequency - memberikan bobot kata berdasarkan kepentingan"),
            QuestionOption(id: "b", textEN: "A type of neural network", textID: "Jenis neural network"),
            QuestionOption(id: "c", textEN: "Text Format - Image Display Format", textID: "Text Format - Image Display Format"),
            QuestionOption(id: "d", textEN: "A tokenization method", textID: "Metode tokenisasi")
        ],
        correctOptionId: "a",
        explanationEN: "TF-IDF weights words by how often they appear in a document (TF) but penalizes words common across all documents (IDF), highlighting distinctive terms.",
        explanationID: "TF-IDF memberikan bobot kata berdasarkan seberapa sering mereka muncul dalam dokumen (TF) tetapi memberikan penalti pada kata yang umum di semua dokumen (IDF), menyoroti istilah yang khas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp007",
        questionEN: "What is n-gram?",
        questionID: "Apa itu n-gram?",
        options: [
            QuestionOption(id: "a", textEN: "A contiguous sequence of n items (words/characters) from text", textID: "Urutan bersebelahan dari n item (kata/karakter) dari teks"),
            QuestionOption(id: "b", textEN: "A text of exactly n words", textID: "Teks dengan tepat n kata"),
            QuestionOption(id: "c", textEN: "A neural network with n layers", textID: "Neural network dengan n layer"),
            QuestionOption(id: "d", textEN: "A weight of n grams", textID: "Bobot n gram")
        ],
        correctOptionId: "a",
        explanationEN: "N-grams are sequences of n consecutive tokens. Unigrams (n=1) are single words, bigrams (n=2) are pairs, trigrams (n=3) are triplets.",
        explanationID: "N-gram adalah urutan n token berturut-turut. Unigram (n=1) adalah kata tunggal, bigram (n=2) adalah pasangan, trigram (n=3) adalah triplet.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp008",
        questionEN: "What is Named Entity Recognition (NER)?",
        questionID: "Apa itu Named Entity Recognition (NER)?",
        options: [
            QuestionOption(id: "a", textEN: "Identifying and classifying named entities like persons, organizations, locations", textID: "Mengidentifikasi dan mengklasifikasikan entitas bernama seperti orang, organisasi, lokasi"),
            QuestionOption(id: "b", textEN: "Recognizing entity relationships in databases", textID: "Mengenali hubungan entitas dalam database"),
            QuestionOption(id: "c", textEN: "Naming variables in code", textID: "Memberi nama variabel dalam kode"),
            QuestionOption(id: "d", textEN: "Creating new entity types", textID: "Membuat tipe entitas baru")
        ],
        correctOptionId: "a",
        explanationEN: "NER extracts and classifies named entities from text into categories like PERSON, ORGANIZATION, LOCATION, DATE, etc.",
        explanationID: "NER mengekstrak dan mengklasifikasikan entitas bernama dari teks ke dalam kategori seperti PERSON, ORGANIZATION, LOCATION, DATE, dll.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp009",
        questionEN: "What is Part-of-Speech (POS) tagging?",
        questionID: "Apa itu Part-of-Speech (POS) tagging?",
        options: [
            QuestionOption(id: "a", textEN: "Labeling each word with its grammatical category (noun, verb, adjective, etc.)", textID: "Memberi label pada setiap kata dengan kategori tata bahasanya (noun, verb, adjective, dll.)"),
            QuestionOption(id: "b", textEN: "Splitting text into sentences", textID: "Memecah teks menjadi kalimat"),
            QuestionOption(id: "c", textEN: "Translating between languages", textID: "Menerjemahkan antar bahasa"),
            QuestionOption(id: "d", textEN: "Finding synonyms for words", textID: "Menemukan sinonim untuk kata")
        ],
        correctOptionId: "a",
        explanationEN: "POS tagging assigns grammatical categories (noun, verb, adjective, adverb, etc.) to each word in a sentence, useful for understanding sentence structure.",
        explanationID: "POS tagging menetapkan kategori tata bahasa (noun, verb, adjective, adverb, dll.) ke setiap kata dalam kalimat, berguna untuk memahami struktur kalimat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp010",
        questionEN: "What is sentiment analysis?",
        questionID: "Apa itu sentiment analysis?",
        options: [
            QuestionOption(id: "a", textEN: "Determining the emotional tone (positive, negative, neutral) of text", textID: "Menentukan nada emosional (positif, negatif, netral) dari teks"),
            QuestionOption(id: "b", textEN: "Counting the number of sentences", textID: "Menghitung jumlah kalimat"),
            QuestionOption(id: "c", textEN: "Finding similar documents", textID: "Menemukan dokumen serupa"),
            QuestionOption(id: "d", textEN: "Generating new text", textID: "Menghasilkan teks baru")
        ],
        correctOptionId: "a",
        explanationEN: "Sentiment analysis classifies text by its emotional polarity - positive, negative, or neutral. It's widely used for analyzing reviews, social media, and customer feedback.",
        explanationID: "Sentiment analysis mengklasifikasikan teks berdasarkan polaritas emosionalnya - positif, negatif, atau netral. Ini banyak digunakan untuk menganalisis ulasan, media sosial, dan umpan balik pelanggan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 2: Word Embeddings (10 questions)
    Question(
        id: "nlp011",
        questionEN: "What is a word embedding?",
        questionID: "Apa itu word embedding?",
        options: [
            QuestionOption(id: "a", textEN: "A dense vector representation of a word capturing semantic meaning", textID: "Representasi vektor padat dari kata yang menangkap makna semantik"),
            QuestionOption(id: "b", textEN: "A word placed inside another word", textID: "Kata yang ditempatkan di dalam kata lain"),
            QuestionOption(id: "c", textEN: "A method to embed images in text", textID: "Metode untuk menyematkan gambar dalam teks"),
            QuestionOption(id: "d", textEN: "A type of encryption", textID: "Jenis enkripsi")
        ],
        correctOptionId: "a",
        explanationEN: "Word embeddings map words to dense vectors in a continuous space where semantically similar words are close together (e.g., 'king' and 'queen').",
        explanationID: "Word embeddings memetakan kata ke vektor padat dalam ruang kontinu dimana kata yang mirip secara semantik berdekatan (misal 'king' dan 'queen').",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp012",
        questionEN: "What is Word2Vec?",
        questionID: "Apa itu Word2Vec?",
        options: [
            QuestionOption(id: "a", textEN: "A method to learn word embeddings from large text corpora", textID: "Metode untuk mempelajari word embeddings dari korpus teks besar"),
            QuestionOption(id: "b", textEN: "Converting words to images", textID: "Mengkonversi kata ke gambar"),
            QuestionOption(id: "c", textEN: "A database of word definitions", textID: "Database definisi kata"),
            QuestionOption(id: "d", textEN: "A translation service", textID: "Layanan penerjemahan")
        ],
        correctOptionId: "a",
        explanationEN: "Word2Vec (Google, 2013) trains shallow neural networks on large text to learn word vectors. It uses Skip-gram (predict context from word) or CBOW (predict word from context).",
        explanationID: "Word2Vec (Google, 2013) melatih neural network dangkal pada teks besar untuk mempelajari vektor kata. Ia menggunakan Skip-gram (prediksi konteks dari kata) atau CBOW (prediksi kata dari konteks).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp013",
        questionEN: "What is the famous Word2Vec analogy example?",
        questionID: "Apa contoh analogi Word2Vec yang terkenal?",
        options: [
            QuestionOption(id: "a", textEN: "king - man + woman ≈ queen", textID: "king - man + woman ≈ queen"),
            QuestionOption(id: "b", textEN: "cat + dog = pet", textID: "cat + dog = pet"),
            QuestionOption(id: "c", textEN: "1 + 1 = 2", textID: "1 + 1 = 2"),
            QuestionOption(id: "d", textEN: "red + blue = purple", textID: "red + blue = purple")
        ],
        correctOptionId: "a",
        explanationEN: "Word2Vec learned semantic relationships: vector(king) - vector(man) + vector(woman) ≈ vector(queen), showing it captures gender relationships.",
        explanationID: "Word2Vec mempelajari hubungan semantik: vector(king) - vector(man) + vector(woman) ≈ vector(queen), menunjukkan bahwa ia menangkap hubungan gender.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp014",
        questionEN: "What is GloVe?",
        questionID: "Apa itu GloVe?",
        options: [
            QuestionOption(id: "a", textEN: "Global Vectors - word embeddings trained on word co-occurrence statistics", textID: "Global Vectors - word embeddings yang dilatih pada statistik ko-occurrence kata"),
            QuestionOption(id: "b", textEN: "A type of glove for typing", textID: "Jenis sarung tangan untuk mengetik"),
            QuestionOption(id: "c", textEN: "A global vocabulary list", textID: "Daftar kosakata global"),
            QuestionOption(id: "d", textEN: "A translation model", textID: "Model penerjemahan")
        ],
        correctOptionId: "a",
        explanationEN: "GloVe (Stanford) learns embeddings by factorizing the word co-occurrence matrix. It combines global statistics with local context window methods.",
        explanationID: "GloVe (Stanford) mempelajari embeddings dengan memfaktorisasi matriks ko-occurrence kata. Ia menggabungkan statistik global dengan metode context window lokal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp015",
        questionEN: "What is the main limitation of Word2Vec and GloVe embeddings?",
        questionID: "Apa keterbatasan utama dari embeddings Word2Vec dan GloVe?",
        options: [
            QuestionOption(id: "a", textEN: "They produce the same vector for a word regardless of context (no polysemy)", textID: "Mereka menghasilkan vektor yang sama untuk kata terlepas dari konteks (tidak ada polisemi)"),
            QuestionOption(id: "b", textEN: "They are too slow to train", textID: "Mereka terlalu lambat untuk dilatih"),
            QuestionOption(id: "c", textEN: "They require labeled data", textID: "Mereka membutuhkan data berlabel"),
            QuestionOption(id: "d", textEN: "They only work for English", textID: "Mereka hanya bekerja untuk bahasa Inggris")
        ],
        correctOptionId: "a",
        explanationEN: "Word2Vec/GloVe give one static vector per word, so 'bank' (river) and 'bank' (financial) have the same embedding. Contextual models (BERT) solve this.",
        explanationID: "Word2Vec/GloVe memberikan satu vektor statis per kata, jadi 'bank' (sungai) dan 'bank' (keuangan) memiliki embedding yang sama. Model kontekstual (BERT) memecahkan ini.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp016",
        questionEN: "What is one-hot encoding for words?",
        questionID: "Apa itu one-hot encoding untuk kata?",
        options: [
            QuestionOption(id: "a", textEN: "A sparse vector with 1 at the word's index and 0 elsewhere", textID: "Vektor sparse dengan 1 di indeks kata dan 0 di tempat lain"),
            QuestionOption(id: "b", textEN: "Encoding words with temperature", textID: "Encoding kata dengan suhu"),
            QuestionOption(id: "c", textEN: "Converting words to binary numbers", textID: "Mengkonversi kata ke angka biner"),
            QuestionOption(id: "d", textEN: "A dense 100-dimensional vector", textID: "Vektor padat 100-dimensi")
        ],
        correctOptionId: "a",
        explanationEN: "One-hot encoding represents each word as a sparse vector of vocabulary size, with 1 at the word's position. It's simple but doesn't capture similarity.",
        explanationID: "One-hot encoding merepresentasikan setiap kata sebagai vektor sparse seukuran kosakata, dengan 1 di posisi kata. Ini sederhana tetapi tidak menangkap kesamaan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp017",
        questionEN: "Why are dense embeddings preferred over one-hot encoding?",
        questionID: "Mengapa dense embeddings lebih disukai daripada one-hot encoding?",
        options: [
            QuestionOption(id: "a", textEN: "Dense vectors capture semantic similarity and are memory-efficient", textID: "Vektor dense menangkap kesamaan semantik dan efisien memori"),
            QuestionOption(id: "b", textEN: "One-hot is always more accurate", textID: "One-hot selalu lebih akurat"),
            QuestionOption(id: "c", textEN: "Dense embeddings are faster to compute", textID: "Dense embeddings lebih cepat dihitung"),
            QuestionOption(id: "d", textEN: "They are the same thing", textID: "Mereka adalah hal yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "Dense embeddings (e.g., 300 dimensions) capture word similarities and are much smaller than one-hot vectors (vocabulary size, often 50,000+).",
        explanationID: "Dense embeddings (misal 300 dimensi) menangkap kesamaan kata dan jauh lebih kecil dari vektor one-hot (ukuran kosakata, sering 50,000+).",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp018",
        questionEN: "What is cosine similarity used for in NLP?",
        questionID: "Untuk apa cosine similarity digunakan dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring similarity between word/sentence vectors", textID: "Mengukur kesamaan antara vektor kata/kalimat"),
            QuestionOption(id: "b", textEN: "Calculating word frequencies", textID: "Menghitung frekuensi kata"),
            QuestionOption(id: "c", textEN: "Finding the length of sentences", textID: "Menemukan panjang kalimat"),
            QuestionOption(id: "d", textEN: "Tokenizing text", textID: "Tokenisasi teks")
        ],
        correctOptionId: "a",
        explanationEN: "Cosine similarity measures the angle between vectors: cos(θ) = (A·B)/(|A||B|). Values range from -1 to 1, with 1 meaning identical direction.",
        explanationID: "Cosine similarity mengukur sudut antar vektor: cos(θ) = (A·B)/(|A||B|). Nilai berkisar dari -1 sampai 1, dengan 1 berarti arah identik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp019",
        questionEN: "What is subword tokenization (e.g., BPE)?",
        questionID: "Apa itu tokenisasi subword (misal BPE)?",
        options: [
            QuestionOption(id: "a", textEN: "Breaking words into smaller units to handle rare/unknown words", textID: "Memecah kata menjadi unit lebih kecil untuk menangani kata langka/tidak dikenal"),
            QuestionOption(id: "b", textEN: "Only using the first letter of words", textID: "Hanya menggunakan huruf pertama kata"),
            QuestionOption(id: "c", textEN: "Removing all short words", textID: "Menghapus semua kata pendek"),
            QuestionOption(id: "d", textEN: "Adding more words to the vocabulary", textID: "Menambahkan lebih banyak kata ke kosakata")
        ],
        correctOptionId: "a",
        explanationEN: "Byte Pair Encoding (BPE) and similar methods split rare words into subwords (e.g., 'unhappiness' → 'un', 'happi', 'ness'), enabling open vocabulary.",
        explanationID: "Byte Pair Encoding (BPE) dan metode serupa memecah kata langka menjadi subkata (misal 'unhappiness' → 'un', 'happi', 'ness'), memungkinkan kosakata terbuka.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp020",
        questionEN: "What is the vocabulary size typically used in modern language models?",
        questionID: "Berapa ukuran kosakata yang biasanya digunakan dalam model bahasa modern?",
        options: [
            QuestionOption(id: "a", textEN: "30,000 to 50,000 subword tokens", textID: "30,000 sampai 50,000 token subword"),
            QuestionOption(id: "b", textEN: "100 words", textID: "100 kata"),
            QuestionOption(id: "c", textEN: "1 million words", textID: "1 juta kata"),
            QuestionOption(id: "d", textEN: "Only 26 letters", textID: "Hanya 26 huruf")
        ],
        correctOptionId: "a",
        explanationEN: "Modern models use ~30K-50K subword tokens (BPE/WordPiece). This balances vocabulary size with the ability to represent any word through subword combinations.",
        explanationID: "Model modern menggunakan ~30K-50K token subword (BPE/WordPiece). Ini menyeimbangkan ukuran kosakata dengan kemampuan merepresentasikan kata apapun melalui kombinasi subword.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 3: Sequence Models (10 questions)
    Question(
        id: "nlp021",
        questionEN: "What is a Recurrent Neural Network (RNN)?",
        questionID: "Apa itu Recurrent Neural Network (RNN)?",
        options: [
            QuestionOption(id: "a", textEN: "A neural network with loops that process sequences step by step", textID: "Neural network dengan loop yang memproses sekuens langkah demi langkah"),
            QuestionOption(id: "b", textEN: "A network that only runs once", textID: "Network yang hanya berjalan sekali"),
            QuestionOption(id: "c", textEN: "A network for image classification", textID: "Network untuk klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "A network without hidden layers", textID: "Network tanpa hidden layers")
        ],
        correctOptionId: "a",
        explanationEN: "RNNs have recurrent connections that maintain a hidden state, allowing them to process variable-length sequences by passing information across time steps.",
        explanationID: "RNN memiliki koneksi rekuren yang mempertahankan hidden state, memungkinkan mereka memproses sekuens panjang variabel dengan meneruskan informasi di seluruh langkah waktu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp022",
        questionEN: "What problem do RNNs face with long sequences?",
        questionID: "Masalah apa yang dihadapi RNN dengan sekuens panjang?",
        options: [
            QuestionOption(id: "a", textEN: "Vanishing/exploding gradients make learning long-term dependencies hard", textID: "Vanishing/exploding gradients membuat pembelajaran dependensi jangka panjang sulit"),
            QuestionOption(id: "b", textEN: "They run too fast", textID: "Mereka berjalan terlalu cepat"),
            QuestionOption(id: "c", textEN: "They use too little memory", textID: "Mereka menggunakan terlalu sedikit memori"),
            QuestionOption(id: "d", textEN: "They can only process short sequences", textID: "Mereka hanya dapat memproses sekuens pendek")
        ],
        correctOptionId: "a",
        explanationEN: "In long sequences, gradients get multiplied many times, causing them to vanish (become too small) or explode (become too large), hindering learning.",
        explanationID: "Dalam sekuens panjang, gradien dikalikan berkali-kali, menyebabkan mereka vanish (menjadi terlalu kecil) atau explode (menjadi terlalu besar), menghambat pembelajaran.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp023",
        questionEN: "What is LSTM (Long Short-Term Memory)?",
        questionID: "Apa itu LSTM (Long Short-Term Memory)?",
        options: [
            QuestionOption(id: "a", textEN: "An RNN variant with gates that control information flow to handle long-term dependencies", textID: "Varian RNN dengan gate yang mengontrol aliran informasi untuk menangani dependensi jangka panjang"),
            QuestionOption(id: "b", textEN: "A memory storage device", textID: "Perangkat penyimpanan memori"),
            QuestionOption(id: "c", textEN: "A short-term caching mechanism", textID: "Mekanisme caching jangka pendek"),
            QuestionOption(id: "d", textEN: "A type of attention mechanism", textID: "Jenis mekanisme attention")
        ],
        correctOptionId: "a",
        explanationEN: "LSTM uses forget, input, and output gates to selectively remember or forget information, solving the vanishing gradient problem for longer sequences.",
        explanationID: "LSTM menggunakan forget, input, dan output gate untuk secara selektif mengingat atau melupakan informasi, memecahkan masalah vanishing gradient untuk sekuens lebih panjang.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp024",
        questionEN: "What are the three gates in an LSTM cell?",
        questionID: "Apa tiga gate dalam sel LSTM?",
        options: [
            QuestionOption(id: "a", textEN: "Forget gate, input gate, output gate", textID: "Forget gate, input gate, output gate"),
            QuestionOption(id: "b", textEN: "AND gate, OR gate, NOT gate", textID: "AND gate, OR gate, NOT gate"),
            QuestionOption(id: "c", textEN: "Start gate, middle gate, end gate", textID: "Start gate, middle gate, end gate"),
            QuestionOption(id: "d", textEN: "Read gate, write gate, delete gate", textID: "Read gate, write gate, delete gate")
        ],
        correctOptionId: "a",
        explanationEN: "Forget gate decides what to discard from cell state. Input gate decides what new information to store. Output gate decides what to output based on cell state.",
        explanationID: "Forget gate memutuskan apa yang harus dibuang dari cell state. Input gate memutuskan informasi baru apa yang disimpan. Output gate memutuskan apa yang dioutput berdasarkan cell state.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp025",
        questionEN: "What is GRU (Gated Recurrent Unit)?",
        questionID: "Apa itu GRU (Gated Recurrent Unit)?",
        options: [
            QuestionOption(id: "a", textEN: "A simplified version of LSTM with only two gates (reset and update)", textID: "Versi sederhana dari LSTM dengan hanya dua gate (reset dan update)"),
            QuestionOption(id: "b", textEN: "A more complex version of LSTM", textID: "Versi lebih kompleks dari LSTM"),
            QuestionOption(id: "c", textEN: "A type of CNN", textID: "Jenis CNN"),
            QuestionOption(id: "d", textEN: "A graphics processing unit", textID: "Graphics processing unit")
        ],
        correctOptionId: "a",
        explanationEN: "GRU combines forget and input gates into an update gate, and merges cell and hidden states. It's simpler than LSTM but often performs similarly.",
        explanationID: "GRU menggabungkan forget dan input gate menjadi update gate, dan menggabungkan cell dan hidden state. Ini lebih sederhana dari LSTM tetapi sering berkinerja serupa.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp026",
        questionEN: "What is a bidirectional RNN?",
        questionID: "Apa itu bidirectional RNN?",
        options: [
            QuestionOption(id: "a", textEN: "An RNN that processes sequences in both forward and backward directions", textID: "RNN yang memproses sekuens dalam arah maju dan mundur"),
            QuestionOption(id: "b", textEN: "An RNN with two hidden layers", textID: "RNN dengan dua hidden layer"),
            QuestionOption(id: "c", textEN: "An RNN that can translate between two languages", textID: "RNN yang dapat menerjemahkan antara dua bahasa"),
            QuestionOption(id: "d", textEN: "An RNN that runs twice as fast", textID: "RNN yang berjalan dua kali lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Bidirectional RNNs process the sequence left-to-right and right-to-left, concatenating both outputs. This provides context from both past and future.",
        explanationID: "Bidirectional RNN memproses sekuens kiri-ke-kanan dan kanan-ke-kiri, menggabungkan kedua output. Ini memberikan konteks dari masa lalu dan masa depan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp027",
        questionEN: "What is sequence-to-sequence (seq2seq) architecture?",
        questionID: "Apa itu arsitektur sequence-to-sequence (seq2seq)?",
        options: [
            QuestionOption(id: "a", textEN: "An encoder-decoder model that transforms one sequence into another", textID: "Model encoder-decoder yang mengubah satu sekuens menjadi sekuens lain"),
            QuestionOption(id: "b", textEN: "A model that only outputs single values", textID: "Model yang hanya mengoutput nilai tunggal"),
            QuestionOption(id: "c", textEN: "A model for image classification", textID: "Model untuk klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "A database query system", textID: "Sistem query database")
        ],
        correctOptionId: "a",
        explanationEN: "Seq2seq uses an encoder RNN to compress input into a context vector, and a decoder RNN to generate the output sequence (used for translation, summarization).",
        explanationID: "Seq2seq menggunakan encoder RNN untuk mengkompresi input menjadi context vector, dan decoder RNN untuk menghasilkan sekuens output (digunakan untuk penerjemahan, summarization).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp028",
        questionEN: "What is teacher forcing in sequence generation?",
        questionID: "Apa itu teacher forcing dalam sequence generation?",
        options: [
            QuestionOption(id: "a", textEN: "Using ground-truth previous tokens as input during training instead of predictions", textID: "Menggunakan token sebelumnya ground-truth sebagai input selama training alih-alih prediksi"),
            QuestionOption(id: "b", textEN: "Having a teacher check the model's output", textID: "Memiliki guru memeriksa output model"),
            QuestionOption(id: "c", textEN: "Training the model for longer", textID: "Melatih model lebih lama"),
            QuestionOption(id: "d", textEN: "Using larger batch sizes", textID: "Menggunakan batch size lebih besar")
        ],
        correctOptionId: "a",
        explanationEN: "During training, teacher forcing feeds the correct previous token instead of the model's prediction, speeding up training but potentially causing exposure bias.",
        explanationID: "Selama training, teacher forcing memberikan token sebelumnya yang benar alih-alih prediksi model, mempercepat training tetapi berpotensi menyebabkan exposure bias.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "nlp029",
        questionEN: "What is beam search in text generation?",
        questionID: "Apa itu beam search dalam text generation?",
        options: [
            QuestionOption(id: "a", textEN: "Keeping top-k candidate sequences at each step instead of just the best one", textID: "Menyimpan k sekuens kandidat teratas di setiap langkah alih-alih hanya yang terbaik"),
            QuestionOption(id: "b", textEN: "Searching through a database of beams", textID: "Mencari melalui database balok"),
            QuestionOption(id: "c", textEN: "Using light beams to process text", textID: "Menggunakan sinar cahaya untuk memproses teks"),
            QuestionOption(id: "d", textEN: "A type of loss function", textID: "Jenis fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "Beam search maintains k best partial sequences (beam width), expanding each at every step and keeping the top k. It balances quality and computation.",
        explanationID: "Beam search mempertahankan k sekuens parsial terbaik (beam width), memperluas masing-masing di setiap langkah dan menyimpan k teratas. Ini menyeimbangkan kualitas dan komputasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp030",
        questionEN: "What is greedy decoding?",
        questionID: "Apa itu greedy decoding?",
        options: [
            QuestionOption(id: "a", textEN: "Always selecting the highest probability token at each step", textID: "Selalu memilih token dengan probabilitas tertinggi di setiap langkah"),
            QuestionOption(id: "b", textEN: "Selecting random tokens", textID: "Memilih token acak"),
            QuestionOption(id: "c", textEN: "Using all possible tokens", textID: "Menggunakan semua token yang mungkin"),
            QuestionOption(id: "d", textEN: "Decoding the entire sequence at once", textID: "Mendekode seluruh sekuens sekaligus")
        ],
        correctOptionId: "a",
        explanationEN: "Greedy decoding picks the most likely token at each step. It's fast but may miss better sequences that start with lower-probability tokens.",
        explanationID: "Greedy decoding memilih token paling mungkin di setiap langkah. Ini cepat tetapi mungkin melewatkan sekuens lebih baik yang dimulai dengan token probabilitas lebih rendah.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 4: Transformers & Attention (10 questions)
    Question(
        id: "nlp031",
        questionEN: "What is the attention mechanism in NLP?",
        questionID: "Apa itu mekanisme attention dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "A way to weigh the importance of different parts of input when producing output", textID: "Cara untuk menimbang kepentingan bagian berbeda dari input saat menghasilkan output"),
            QuestionOption(id: "b", textEN: "Making the model pay attention to training", textID: "Membuat model memperhatikan training"),
            QuestionOption(id: "c", textEN: "A type of loss function", textID: "Jenis fungsi loss"),
            QuestionOption(id: "d", textEN: "A data augmentation technique", textID: "Teknik data augmentation")
        ],
        correctOptionId: "a",
        explanationEN: "Attention allows models to focus on relevant parts of the input when generating each output element, creating weighted combinations of input representations.",
        explanationID: "Attention memungkinkan model untuk fokus pada bagian relevan dari input saat menghasilkan setiap elemen output, membuat kombinasi tertimbang dari representasi input.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp032",
        questionEN: "What is self-attention?",
        questionID: "Apa itu self-attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention where a sequence attends to itself to model relationships between positions", textID: "Attention dimana sekuens memperhatikan dirinya sendiri untuk memodelkan hubungan antar posisi"),
            QuestionOption(id: "b", textEN: "The model paying attention to its own errors", textID: "Model memperhatikan errornya sendiri"),
            QuestionOption(id: "c", textEN: "Attention that only uses one head", textID: "Attention yang hanya menggunakan satu head"),
            QuestionOption(id: "d", textEN: "A type of regularization", textID: "Jenis regularisasi")
        ],
        correctOptionId: "a",
        explanationEN: "Self-attention computes attention weights between all pairs of positions in a sequence, allowing each position to gather information from the entire sequence.",
        explanationID: "Self-attention menghitung bobot attention antara semua pasangan posisi dalam sekuens, memungkinkan setiap posisi mengumpulkan informasi dari seluruh sekuens.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp033",
        questionEN: "What are Query, Key, and Value in attention?",
        questionID: "Apa itu Query, Key, dan Value dalam attention?",
        options: [
            QuestionOption(id: "a", textEN: "Projections used to compute attention: Q asks, K matches, V provides content", textID: "Proyeksi yang digunakan untuk menghitung attention: Q bertanya, K mencocokkan, V menyediakan konten"),
            QuestionOption(id: "b", textEN: "Database terms unrelated to NLP", textID: "Istilah database yang tidak terkait NLP"),
            QuestionOption(id: "c", textEN: "Three different loss functions", textID: "Tiga fungsi loss berbeda"),
            QuestionOption(id: "d", textEN: "Types of tokens", textID: "Jenis token")
        ],
        correctOptionId: "a",
        explanationEN: "Query represents what we're looking for, Key represents what's available to match against, Value contains the actual information to aggregate based on attention scores.",
        explanationID: "Query merepresentasikan apa yang kita cari, Key merepresentasikan apa yang tersedia untuk dicocokkan, Value berisi informasi aktual untuk diagregasi berdasarkan skor attention.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp034",
        questionEN: "What is the Transformer architecture?",
        questionID: "Apa itu arsitektur Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "A model based entirely on attention mechanisms, without recurrence", textID: "Model yang sepenuhnya berdasarkan mekanisme attention, tanpa rekurensi"),
            QuestionOption(id: "b", textEN: "An improved version of RNN", textID: "Versi perbaikan dari RNN"),
            QuestionOption(id: "c", textEN: "A model for transforming images", textID: "Model untuk mentransformasi gambar"),
            QuestionOption(id: "d", textEN: "A CNN with special layers", textID: "CNN dengan layer khusus")
        ],
        correctOptionId: "a",
        explanationEN: "Transformers (\"Attention is All You Need\", 2017) replace recurrence with self-attention, enabling parallel processing and better long-range dependencies.",
        explanationID: "Transformer (\"Attention is All You Need\", 2017) menggantikan rekurensi dengan self-attention, memungkinkan pemrosesan paralel dan dependensi jarak jauh yang lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp035",
        questionEN: "What is multi-head attention?",
        questionID: "Apa itu multi-head attention?",
        options: [
            QuestionOption(id: "a", textEN: "Running multiple attention operations in parallel, each learning different relationships", textID: "Menjalankan beberapa operasi attention secara paralel, masing-masing mempelajari hubungan berbeda"),
            QuestionOption(id: "b", textEN: "Attention with multiple output layers", textID: "Attention dengan beberapa layer output"),
            QuestionOption(id: "c", textEN: "A model with multiple heads like Hydra", textID: "Model dengan banyak kepala seperti Hydra"),
            QuestionOption(id: "d", textEN: "Attention that looks at headers", textID: "Attention yang melihat header")
        ],
        correctOptionId: "a",
        explanationEN: "Multi-head attention runs h parallel attention operations with different learned projections, concatenates their outputs, allowing the model to attend to different aspects simultaneously.",
        explanationID: "Multi-head attention menjalankan h operasi attention paralel dengan proyeksi yang dipelajari berbeda, menggabungkan outputnya, memungkinkan model memperhatikan aspek berbeda secara bersamaan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp036",
        questionEN: "What is positional encoding in Transformers?",
        questionID: "Apa itu positional encoding dalam Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Adding position information since Transformers don't have built-in sequence order", textID: "Menambahkan informasi posisi karena Transformer tidak memiliki urutan sekuens bawaan"),
            QuestionOption(id: "b", textEN: "Encoding GPS coordinates", textID: "Encoding koordinat GPS"),
            QuestionOption(id: "c", textEN: "Numbering the layers", textID: "Menomori layer"),
            QuestionOption(id: "d", textEN: "A type of normalization", textID: "Jenis normalisasi")
        ],
        correctOptionId: "a",
        explanationEN: "Since self-attention is permutation-invariant, positional encodings (sinusoidal or learned) are added to input embeddings to inject sequence order information.",
        explanationID: "Karena self-attention invarian terhadap permutasi, positional encoding (sinusoidal atau dipelajari) ditambahkan ke embeddings input untuk menyuntikkan informasi urutan sekuens.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp037",
        questionEN: "What is BERT?",
        questionID: "Apa itu BERT?",
        options: [
            QuestionOption(id: "a", textEN: "Bidirectional Encoder Representations from Transformers - a pre-trained language model", textID: "Bidirectional Encoder Representations from Transformers - model bahasa pre-trained"),
            QuestionOption(id: "b", textEN: "A character from Sesame Street", textID: "Karakter dari Sesame Street"),
            QuestionOption(id: "c", textEN: "A translation system", textID: "Sistem penerjemahan"),
            QuestionOption(id: "d", textEN: "A search engine", textID: "Mesin pencari")
        ],
        correctOptionId: "a",
        explanationEN: "BERT (Google, 2018) is pre-trained on masked language modeling and next sentence prediction, providing powerful bidirectional contextualized embeddings for downstream tasks.",
        explanationID: "BERT (Google, 2018) di-pre-train pada masked language modeling dan next sentence prediction, memberikan embeddings kontekstual bidirectional yang kuat untuk tugas downstream.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp038",
        questionEN: "What is masked language modeling in BERT?",
        questionID: "Apa itu masked language modeling dalam BERT?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly masking some tokens and training the model to predict them", textID: "Secara acak menutupi beberapa token dan melatih model untuk memprediksinya"),
            QuestionOption(id: "b", textEN: "Hiding the model from users", textID: "Menyembunyikan model dari pengguna"),
            QuestionOption(id: "c", textEN: "Using masks on images", textID: "Menggunakan mask pada gambar"),
            QuestionOption(id: "d", textEN: "Translating masked words", textID: "Menerjemahkan kata yang di-mask")
        ],
        correctOptionId: "a",
        explanationEN: "BERT masks ~15% of input tokens and trains to predict them using bidirectional context. This pre-training task helps learn rich language representations.",
        explanationID: "BERT menutupi ~15% token input dan melatih untuk memprediksinya menggunakan konteks bidirectional. Tugas pre-training ini membantu mempelajari representasi bahasa yang kaya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp039",
        questionEN: "What is GPT?",
        questionID: "Apa itu GPT?",
        options: [
            QuestionOption(id: "a", textEN: "Generative Pre-trained Transformer - an autoregressive language model", textID: "Generative Pre-trained Transformer - model bahasa autoregressive"),
            QuestionOption(id: "b", textEN: "General Purpose Translation", textID: "General Purpose Translation"),
            QuestionOption(id: "c", textEN: "A type of CNN", textID: "Jenis CNN"),
            QuestionOption(id: "d", textEN: "Graphics Processing Tool", textID: "Graphics Processing Tool")
        ],
        correctOptionId: "a",
        explanationEN: "GPT (OpenAI) is a decoder-only transformer trained to predict the next token. It generates text autoregressively, one token at a time.",
        explanationID: "GPT (OpenAI) adalah transformer decoder-only yang dilatih untuk memprediksi token berikutnya. Ia menghasilkan teks secara autoregressive, satu token pada satu waktu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp040",
        questionEN: "What is the difference between BERT and GPT?",
        questionID: "Apa perbedaan antara BERT dan GPT?",
        options: [
            QuestionOption(id: "a", textEN: "BERT is bidirectional encoder for understanding; GPT is unidirectional decoder for generation", textID: "BERT adalah encoder bidirectional untuk pemahaman; GPT adalah decoder unidirectional untuk generasi"),
            QuestionOption(id: "b", textEN: "They are the same model", textID: "Mereka adalah model yang sama"),
            QuestionOption(id: "c", textEN: "BERT is for images, GPT for text", textID: "BERT untuk gambar, GPT untuk teks"),
            QuestionOption(id: "d", textEN: "GPT is smaller than BERT", textID: "GPT lebih kecil dari BERT")
        ],
        correctOptionId: "a",
        explanationEN: "BERT uses bidirectional attention (sees all tokens) for tasks like classification. GPT uses causal (left-to-right) attention for text generation.",
        explanationID: "BERT menggunakan attention bidirectional (melihat semua token) untuk tugas seperti klasifikasi. GPT menggunakan attention kausal (kiri-ke-kanan) untuk text generation.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 5: Advanced NLP Topics (10 questions)
    Question(
        id: "nlp041",
        questionEN: "What is fine-tuning in the context of language models?",
        questionID: "Apa itu fine-tuning dalam konteks model bahasa?",
        options: [
            QuestionOption(id: "a", textEN: "Further training a pre-trained model on task-specific data", textID: "Melanjutkan melatih model pre-trained pada data khusus tugas"),
            QuestionOption(id: "b", textEN: "Adjusting the model's temperature", textID: "Menyesuaikan suhu model"),
            QuestionOption(id: "c", textEN: "Making the model smaller", textID: "Membuat model lebih kecil"),
            QuestionOption(id: "d", textEN: "Training from scratch", textID: "Training dari awal")
        ],
        correctOptionId: "a",
        explanationEN: "Fine-tuning adapts a pre-trained model (BERT, GPT) to a specific task by continuing training on labeled task data, usually with a smaller learning rate.",
        explanationID: "Fine-tuning mengadaptasi model pre-trained (BERT, GPT) ke tugas spesifik dengan melanjutkan training pada data tugas berlabel, biasanya dengan learning rate lebih kecil.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp042",
        questionEN: "What is perplexity in language modeling?",
        questionID: "Apa itu perplexity dalam language modeling?",
        options: [
            QuestionOption(id: "a", textEN: "A measure of how well a model predicts a sample; lower is better", textID: "Ukuran seberapa baik model memprediksi sampel; lebih rendah lebih baik"),
            QuestionOption(id: "b", textEN: "How confused the model is", textID: "Seberapa bingung model"),
            QuestionOption(id: "c", textEN: "The complexity of the architecture", textID: "Kompleksitas arsitektur"),
            QuestionOption(id: "d", textEN: "The number of parameters", textID: "Jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Perplexity = 2^(cross-entropy loss). It represents the weighted average number of choices the model is uncertain about. Lower perplexity means better predictions.",
        explanationID: "Perplexity = 2^(cross-entropy loss). Ini merepresentasikan rata-rata tertimbang jumlah pilihan yang model tidak pasti. Perplexity lebih rendah berarti prediksi lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp043",
        questionEN: "What is machine translation?",
        questionID: "Apa itu machine translation?",
        options: [
            QuestionOption(id: "a", textEN: "Automatically translating text from one language to another", textID: "Secara otomatis menerjemahkan teks dari satu bahasa ke bahasa lain"),
            QuestionOption(id: "b", textEN: "Translating code to different programming languages", textID: "Menerjemahkan kode ke bahasa pemrograman berbeda"),
            QuestionOption(id: "c", textEN: "Converting speech to text", textID: "Mengkonversi suara ke teks"),
            QuestionOption(id: "d", textEN: "Moving machines between locations", textID: "Memindahkan mesin antar lokasi")
        ],
        correctOptionId: "a",
        explanationEN: "Machine translation uses NLP models (typically seq2seq or transformers) to translate text between languages, like Google Translate.",
        explanationID: "Machine translation menggunakan model NLP (biasanya seq2seq atau transformer) untuk menerjemahkan teks antar bahasa, seperti Google Translate.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp044",
        questionEN: "What is BLEU score used for?",
        questionID: "Untuk apa BLEU score digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Evaluating machine translation quality by comparing to reference translations", textID: "Mengevaluasi kualitas machine translation dengan membandingkan dengan terjemahan referensi"),
            QuestionOption(id: "b", textEN: "Measuring the color of text", textID: "Mengukur warna teks"),
            QuestionOption(id: "c", textEN: "Counting words in a sentence", textID: "Menghitung kata dalam kalimat"),
            QuestionOption(id: "d", textEN: "Training language models", textID: "Melatih model bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "BLEU (Bilingual Evaluation Understudy) measures n-gram overlap between generated and reference translations. Higher BLEU indicates better translation quality.",
        explanationID: "BLEU (Bilingual Evaluation Understudy) mengukur tumpang tindih n-gram antara terjemahan yang dihasilkan dan referensi. BLEU lebih tinggi menunjukkan kualitas terjemahan lebih baik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp045",
        questionEN: "What is question answering (QA) in NLP?",
        questionID: "Apa itu question answering (QA) dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Finding or generating answers to natural language questions from a context", textID: "Menemukan atau menghasilkan jawaban untuk pertanyaan bahasa alami dari konteks"),
            QuestionOption(id: "b", textEN: "Asking questions to users", textID: "Mengajukan pertanyaan kepada pengguna"),
            QuestionOption(id: "c", textEN: "Creating questionnaires", textID: "Membuat kuesioner"),
            QuestionOption(id: "d", textEN: "Answering emails automatically", textID: "Menjawab email secara otomatis")
        ],
        correctOptionId: "a",
        explanationEN: "QA systems take a question and context (or knowledge base) and return an answer. Extractive QA finds spans in text; generative QA produces new text.",
        explanationID: "Sistem QA mengambil pertanyaan dan konteks (atau knowledge base) dan mengembalikan jawaban. Extractive QA menemukan span dalam teks; generative QA menghasilkan teks baru.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp046",
        questionEN: "What is text summarization?",
        questionID: "Apa itu text summarization?",
        options: [
            QuestionOption(id: "a", textEN: "Condensing a document into a shorter version while keeping key information", textID: "Memampatkan dokumen menjadi versi lebih pendek sambil menjaga informasi kunci"),
            QuestionOption(id: "b", textEN: "Counting the number of sentences", textID: "Menghitung jumlah kalimat"),
            QuestionOption(id: "c", textEN: "Translating text to another language", textID: "Menerjemahkan teks ke bahasa lain"),
            QuestionOption(id: "d", textEN: "Finding keywords in text", textID: "Menemukan kata kunci dalam teks")
        ],
        correctOptionId: "a",
        explanationEN: "Summarization produces shorter versions of text. Extractive methods select important sentences; abstractive methods generate new summary text.",
        explanationID: "Summarization menghasilkan versi teks yang lebih pendek. Metode extractive memilih kalimat penting; metode abstractive menghasilkan teks ringkasan baru.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp047",
        questionEN: "What is zero-shot learning in NLP?",
        questionID: "Apa itu zero-shot learning dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Performing tasks without any task-specific training examples", textID: "Melakukan tugas tanpa contoh training khusus tugas apapun"),
            QuestionOption(id: "b", textEN: "Training with zero data", textID: "Training dengan nol data"),
            QuestionOption(id: "c", textEN: "A model that never makes mistakes", textID: "Model yang tidak pernah membuat kesalahan"),
            QuestionOption(id: "d", textEN: "Training for zero epochs", textID: "Training untuk nol epoch")
        ],
        correctOptionId: "a",
        explanationEN: "Zero-shot learning applies a pre-trained model to tasks it wasn't explicitly trained for, often using natural language prompts to describe the task.",
        explanationID: "Zero-shot learning menerapkan model pre-trained ke tugas yang tidak dilatih secara eksplisit, sering menggunakan prompt bahasa alami untuk mendeskripsikan tugas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp048",
        questionEN: "What is few-shot learning?",
        questionID: "Apa itu few-shot learning?",
        options: [
            QuestionOption(id: "a", textEN: "Learning to perform tasks with only a few examples provided in the prompt", textID: "Belajar melakukan tugas dengan hanya beberapa contoh yang diberikan dalam prompt"),
            QuestionOption(id: "b", textEN: "Training with a small dataset", textID: "Training dengan dataset kecil"),
            QuestionOption(id: "c", textEN: "Taking a few photos of text", textID: "Mengambil beberapa foto teks"),
            QuestionOption(id: "d", textEN: "A fast training method", textID: "Metode training cepat")
        ],
        correctOptionId: "a",
        explanationEN: "Few-shot learning provides a handful of examples in the prompt to help the model understand the task, without updating model weights (in-context learning).",
        explanationID: "Few-shot learning menyediakan beberapa contoh dalam prompt untuk membantu model memahami tugas, tanpa memperbarui bobot model (in-context learning).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "nlp049",
        questionEN: "What is prompt engineering?",
        questionID: "Apa itu prompt engineering?",
        options: [
            QuestionOption(id: "a", textEN: "Crafting input text to get desired outputs from language models", textID: "Menyusun teks input untuk mendapatkan output yang diinginkan dari model bahasa"),
            QuestionOption(id: "b", textEN: "Building hardware prompts", textID: "Membangun hardware prompt"),
            QuestionOption(id: "c", textEN: "Engineering software prompts", textID: "Engineering software prompt"),
            QuestionOption(id: "d", textEN: "Designing user interfaces", textID: "Merancang user interface")
        ],
        correctOptionId: "a",
        explanationEN: "Prompt engineering involves designing and optimizing the text prompts given to language models to elicit better, more accurate, or more useful responses.",
        explanationID: "Prompt engineering melibatkan perancangan dan optimisasi prompt teks yang diberikan ke model bahasa untuk memunculkan respons yang lebih baik, lebih akurat, atau lebih berguna.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "nlp050",
        questionEN: "What is hallucination in language models?",
        questionID: "Apa itu halusinasi dalam model bahasa?",
        options: [
            QuestionOption(id: "a", textEN: "When the model generates factually incorrect or nonsensical content confidently", textID: "Ketika model menghasilkan konten yang salah secara faktual atau tidak masuk akal dengan percaya diri"),
            QuestionOption(id: "b", textEN: "When the model sees images", textID: "Ketika model melihat gambar"),
            QuestionOption(id: "c", textEN: "When the model runs out of memory", textID: "Ketika model kehabisan memori"),
            QuestionOption(id: "d", textEN: "When the model dreams during training", textID: "Ketika model bermimpi selama training")
        ],
        correctOptionId: "a",
        explanationEN: "Hallucination refers to language models generating plausible-sounding but false or made-up information, a significant challenge in reliable AI systems.",
        explanationID: "Halusinasi merujuk pada model bahasa yang menghasilkan informasi yang terdengar masuk akal tetapi salah atau dibuat-buat, tantangan signifikan dalam sistem AI yang dapat diandalkan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
