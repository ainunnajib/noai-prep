import Foundation

// MARK: - NLP: Text Processing & Transformers Questions (50)
// Topics: Tokenization, Word Embeddings, Transformers, Attention, BERT, GPT
// Aligned with IOAI/NOAI Syllabus

let nlpTransformersQuestions: [Question] = [
    // MARK: - Text Processing Basics (Questions 1-10)
    Question(
        id: "nlp_trans_001",
        questionEN: "What is tokenization in NLP?",
        questionID: "Apa itu tokenisasi dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Breaking text into smaller units like words or subwords", textID: "Memecah teks menjadi unit yang lebih kecil seperti kata atau subword"),
            QuestionOption(id: "b", textEN: "Removing stop words from text", textID: "Menghapus stop words dari teks"),
            QuestionOption(id: "c", textEN: "Converting text to lowercase", textID: "Mengubah teks menjadi huruf kecil"),
            QuestionOption(id: "d", textEN: "Translating text between languages", textID: "Menerjemahkan teks antar bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "Tokenization is the process of breaking text into smaller units (tokens) such as words, subwords, or characters. It's a fundamental preprocessing step in NLP.",
        explanationID: "Tokenisasi adalah proses memecah teks menjadi unit yang lebih kecil (token) seperti kata, subword, atau karakter. Ini adalah langkah preprocessing fundamental dalam NLP.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_002",
        questionEN: "What is the difference between stemming and lemmatization?",
        questionID: "Apa perbedaan antara stemming dan lemmatization?",
        options: [
            QuestionOption(id: "a", textEN: "Stemming uses rules to chop word endings; lemmatization uses vocabulary to find base forms", textID: "Stemming menggunakan aturan untuk memotong akhiran kata; lemmatization menggunakan kosakata untuk menemukan bentuk dasar"),
            QuestionOption(id: "b", textEN: "They are exactly the same process", textID: "Keduanya adalah proses yang sama persis"),
            QuestionOption(id: "c", textEN: "Lemmatization is faster than stemming", textID: "Lemmatization lebih cepat dari stemming"),
            QuestionOption(id: "d", textEN: "Stemming produces valid words; lemmatization doesn't", textID: "Stemming menghasilkan kata valid; lemmatization tidak")
        ],
        correctOptionId: "a",
        explanationEN: "Stemming uses heuristic rules to remove word endings (e.g., 'running' → 'runn'), while lemmatization uses vocabulary and morphological analysis to find the proper base form (e.g., 'running' → 'run').",
        explanationID: "Stemming menggunakan aturan heuristik untuk menghapus akhiran kata (misal 'running' → 'runn'), sedangkan lemmatization menggunakan kosakata dan analisis morfologi untuk menemukan bentuk dasar yang tepat (misal 'running' → 'run').",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_003",
        questionEN: "What are stop words in NLP?",
        questionID: "Apa itu stop words dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Common words like 'the', 'is', 'at' that are often filtered out", textID: "Kata-kata umum seperti 'the', 'is', 'at' yang sering disaring"),
            QuestionOption(id: "b", textEN: "Words that indicate the end of a sentence", textID: "Kata-kata yang menunjukkan akhir kalimat"),
            QuestionOption(id: "c", textEN: "Words with negative sentiment", textID: "Kata-kata dengan sentimen negatif"),
            QuestionOption(id: "d", textEN: "Rare words that appear only once in a corpus", textID: "Kata-kata langka yang muncul hanya sekali dalam korpus")
        ],
        correctOptionId: "a",
        explanationEN: "Stop words are common words (like 'the', 'is', 'at', 'and') that occur frequently but carry little semantic meaning. They are often removed during preprocessing to reduce noise.",
        explanationID: "Stop words adalah kata-kata umum (seperti 'the', 'is', 'at', 'and') yang sering muncul tetapi memiliki sedikit makna semantik. Mereka sering dihapus selama preprocessing untuk mengurangi noise.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_004",
        questionEN: "What does TF-IDF stand for and measure?",
        questionID: "Apa kepanjangan TF-IDF dan apa yang diukurnya?",
        options: [
            QuestionOption(id: "a", textEN: "Term Frequency-Inverse Document Frequency; measures word importance in a document relative to corpus", textID: "Term Frequency-Inverse Document Frequency; mengukur pentingnya kata dalam dokumen relatif terhadap korpus"),
            QuestionOption(id: "b", textEN: "Text Format-Image Data Format; measures text-image alignment", textID: "Text Format-Image Data Format; mengukur keselarasan teks-gambar"),
            QuestionOption(id: "c", textEN: "Token Filtering-Index Document Frequency; counts unique tokens", textID: "Token Filtering-Index Document Frequency; menghitung token unik"),
            QuestionOption(id: "d", textEN: "Transfer Function-Internal Data Flow; measures data transfer rates", textID: "Transfer Function-Internal Data Flow; mengukur kecepatan transfer data")
        ],
        correctOptionId: "a",
        explanationEN: "TF-IDF (Term Frequency-Inverse Document Frequency) measures how important a word is to a document in a collection. TF measures word frequency in a document, while IDF reduces the weight of common words across all documents.",
        explanationID: "TF-IDF (Term Frequency-Inverse Document Frequency) mengukur seberapa penting sebuah kata terhadap dokumen dalam koleksi. TF mengukur frekuensi kata dalam dokumen, sementara IDF mengurangi bobot kata-kata umum di semua dokumen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_005",
        questionEN: "What is Byte-Pair Encoding (BPE) used for in NLP?",
        questionID: "Untuk apa Byte-Pair Encoding (BPE) digunakan dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "Subword tokenization that iteratively merges frequent character pairs", textID: "Tokenisasi subword yang secara iteratif menggabungkan pasangan karakter yang sering muncul"),
            QuestionOption(id: "b", textEN: "Compressing text files for storage", textID: "Mengompresi file teks untuk penyimpanan"),
            QuestionOption(id: "c", textEN: "Encrypting sensitive text data", textID: "Mengenkripsi data teks sensitif"),
            QuestionOption(id: "d", textEN: "Converting text to binary format", textID: "Mengubah teks ke format biner")
        ],
        correctOptionId: "a",
        explanationEN: "BPE is a subword tokenization algorithm that starts with characters and iteratively merges the most frequent pairs. This helps handle rare words and reduces vocabulary size while maintaining meaningful subword units.",
        explanationID: "BPE adalah algoritma tokenisasi subword yang dimulai dengan karakter dan secara iteratif menggabungkan pasangan yang paling sering muncul. Ini membantu menangani kata-kata langka dan mengurangi ukuran kosakata sambil mempertahankan unit subword yang bermakna.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_006",
        questionEN: "What is the bag-of-words (BoW) model?",
        questionID: "Apa itu model bag-of-words (BoW)?",
        options: [
            QuestionOption(id: "a", textEN: "A text representation that counts word occurrences, ignoring order", textID: "Representasi teks yang menghitung kemunculan kata, mengabaikan urutan"),
            QuestionOption(id: "b", textEN: "A model that groups similar words into bags", textID: "Model yang mengelompokkan kata-kata serupa ke dalam kantong"),
            QuestionOption(id: "c", textEN: "A neural network architecture for text", textID: "Arsitektur neural network untuk teks"),
            QuestionOption(id: "d", textEN: "A method for word translation", textID: "Metode untuk terjemahan kata")
        ],
        correctOptionId: "a",
        explanationEN: "Bag-of-words represents text as a vector of word counts or frequencies, ignoring grammar and word order. Each document becomes a fixed-length vector where each position represents a word from the vocabulary.",
        explanationID: "Bag-of-words merepresentasikan teks sebagai vektor dari jumlah atau frekuensi kata, mengabaikan tata bahasa dan urutan kata. Setiap dokumen menjadi vektor dengan panjang tetap di mana setiap posisi mewakili kata dari kosakata.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_007",
        questionEN: "What is N-gram in NLP?",
        questionID: "Apa itu N-gram dalam NLP?",
        options: [
            QuestionOption(id: "a", textEN: "A contiguous sequence of N items from text", textID: "Urutan berurutan dari N item dari teks"),
            QuestionOption(id: "b", textEN: "A weight measurement unit for text", textID: "Unit pengukuran berat untuk teks"),
            QuestionOption(id: "c", textEN: "A grammar rule for N languages", textID: "Aturan tata bahasa untuk N bahasa"),
            QuestionOption(id: "d", textEN: "A neural network with N layers", textID: "Neural network dengan N layer")
        ],
        correctOptionId: "a",
        explanationEN: "An N-gram is a contiguous sequence of N items (usually words or characters) from text. Unigrams (N=1) are single words, bigrams (N=2) are word pairs, trigrams (N=3) are word triplets, etc.",
        explanationID: "N-gram adalah urutan berurutan dari N item (biasanya kata atau karakter) dari teks. Unigram (N=1) adalah kata tunggal, bigram (N=2) adalah pasangan kata, trigram (N=3) adalah triplet kata, dll.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_008",
        questionEN: "What problem does subword tokenization solve?",
        questionID: "Masalah apa yang diselesaikan oleh subword tokenization?",
        options: [
            QuestionOption(id: "a", textEN: "Out-of-vocabulary (OOV) words by breaking rare words into known subwords", textID: "Kata out-of-vocabulary (OOV) dengan memecah kata langka menjadi subword yang dikenal"),
            QuestionOption(id: "b", textEN: "Grammar correction in text", textID: "Koreksi tata bahasa dalam teks"),
            QuestionOption(id: "c", textEN: "Sentiment analysis accuracy", textID: "Akurasi analisis sentimen"),
            QuestionOption(id: "d", textEN: "Text translation speed", textID: "Kecepatan terjemahan teks")
        ],
        correctOptionId: "a",
        explanationEN: "Subword tokenization (like BPE, WordPiece) addresses the OOV problem by breaking unknown words into smaller known subword units. This allows the model to handle rare or unseen words without a huge vocabulary.",
        explanationID: "Tokenisasi subword (seperti BPE, WordPiece) mengatasi masalah OOV dengan memecah kata-kata yang tidak dikenal menjadi unit subword yang lebih kecil dan dikenal. Ini memungkinkan model menangani kata-kata langka atau belum terlihat tanpa kosakata yang sangat besar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_009",
        questionEN: "What is Named Entity Recognition (NER)?",
        questionID: "Apa itu Named Entity Recognition (NER)?",
        options: [
            QuestionOption(id: "a", textEN: "Identifying and classifying named entities like persons, organizations, locations in text", textID: "Mengidentifikasi dan mengklasifikasikan entitas bernama seperti orang, organisasi, lokasi dalam teks"),
            QuestionOption(id: "b", textEN: "Recognizing the author's name from their writing style", textID: "Mengenali nama penulis dari gaya penulisan mereka"),
            QuestionOption(id: "c", textEN: "Finding entity-relationship diagrams in documents", textID: "Menemukan diagram entity-relationship dalam dokumen"),
            QuestionOption(id: "d", textEN: "Detecting plagiarism in named documents", textID: "Mendeteksi plagiarisme dalam dokumen bernama")
        ],
        correctOptionId: "a",
        explanationEN: "NER is a task that identifies and classifies named entities in text into predefined categories such as person names, organizations, locations, dates, monetary values, etc.",
        explanationID: "NER adalah tugas yang mengidentifikasi dan mengklasifikasikan entitas bernama dalam teks ke dalam kategori yang telah ditentukan seperti nama orang, organisasi, lokasi, tanggal, nilai moneter, dll.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_010",
        questionEN: "What is Part-of-Speech (POS) tagging?",
        questionID: "Apa itu Part-of-Speech (POS) tagging?",
        options: [
            QuestionOption(id: "a", textEN: "Assigning grammatical categories (noun, verb, adjective) to each word", textID: "Menetapkan kategori gramatikal (kata benda, kata kerja, kata sifat) ke setiap kata"),
            QuestionOption(id: "b", textEN: "Tagging important parts of a document", textID: "Menandai bagian penting dari dokumen"),
            QuestionOption(id: "c", textEN: "Identifying the speech patterns in audio", textID: "Mengidentifikasi pola bicara dalam audio"),
            QuestionOption(id: "d", textEN: "Marking positive and negative sentiment words", textID: "Menandai kata-kata sentimen positif dan negatif")
        ],
        correctOptionId: "a",
        explanationEN: "POS tagging assigns grammatical categories to each word in a text, such as noun, verb, adjective, adverb, etc. This helps understand the syntactic structure of sentences.",
        explanationID: "POS tagging menetapkan kategori gramatikal ke setiap kata dalam teks, seperti kata benda, kata kerja, kata sifat, kata keterangan, dll. Ini membantu memahami struktur sintaksis kalimat.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // MARK: - Word Embeddings (Questions 11-20)
    Question(
        id: "nlp_trans_011",
        questionEN: "What is a word embedding?",
        questionID: "Apa itu word embedding?",
        options: [
            QuestionOption(id: "a", textEN: "A dense vector representation of words where similar words have similar vectors", textID: "Representasi vektor padat dari kata di mana kata-kata serupa memiliki vektor yang serupa"),
            QuestionOption(id: "b", textEN: "A method to embed words into documents", textID: "Metode untuk menanamkan kata ke dalam dokumen"),
            QuestionOption(id: "c", textEN: "A technique to compress text files", textID: "Teknik untuk mengompresi file teks"),
            QuestionOption(id: "d", textEN: "A way to hide words in images", textID: "Cara untuk menyembunyikan kata dalam gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Word embeddings are dense vector representations of words in a continuous vector space. Words with similar meanings are mapped to nearby points, capturing semantic relationships.",
        explanationID: "Word embeddings adalah representasi vektor padat dari kata-kata dalam ruang vektor kontinu. Kata-kata dengan makna serupa dipetakan ke titik-titik terdekat, menangkap hubungan semantik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_012",
        questionEN: "In Word2Vec, what does the Skip-gram model predict?",
        questionID: "Dalam Word2Vec, apa yang diprediksi model Skip-gram?",
        options: [
            QuestionOption(id: "a", textEN: "Context words given a target word", textID: "Kata-kata konteks dari kata target yang diberikan"),
            QuestionOption(id: "b", textEN: "The target word given context words", textID: "Kata target dari kata-kata konteks yang diberikan"),
            QuestionOption(id: "c", textEN: "The next sentence in a document", textID: "Kalimat berikutnya dalam dokumen"),
            QuestionOption(id: "d", textEN: "Word sentiment", textID: "Sentimen kata")
        ],
        correctOptionId: "a",
        explanationEN: "Skip-gram predicts surrounding context words given a target center word. For example, given 'cat', it tries to predict words like 'the', 'sat', 'on' that might appear around it.",
        explanationID: "Skip-gram memprediksi kata-kata konteks sekitarnya dari kata target pusat yang diberikan. Misalnya, dari 'cat', ia mencoba memprediksi kata-kata seperti 'the', 'sat', 'on' yang mungkin muncul di sekitarnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_013",
        questionEN: "What does CBOW (Continuous Bag of Words) predict in Word2Vec?",
        questionID: "Apa yang diprediksi CBOW dalam Word2Vec?",
        options: [
            QuestionOption(id: "a", textEN: "The target word given surrounding context words", textID: "Kata target dari kata-kata konteks sekitarnya yang diberikan"),
            QuestionOption(id: "b", textEN: "Context words given a target word", textID: "Kata-kata konteks dari kata target yang diberikan"),
            QuestionOption(id: "c", textEN: "The document topic", textID: "Topik dokumen"),
            QuestionOption(id: "d", textEN: "Word frequency", textID: "Frekuensi kata")
        ],
        correctOptionId: "a",
        explanationEN: "CBOW predicts the target center word given its surrounding context words. It's the opposite of Skip-gram - given 'the', 'sat', 'on', 'mat', it predicts 'cat'.",
        explanationID: "CBOW memprediksi kata pusat target dari kata-kata konteks sekitarnya yang diberikan. Ini kebalikan dari Skip-gram - dari 'the', 'sat', 'on', 'mat', ia memprediksi 'cat'.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_014",
        questionEN: "What is a key property of word embeddings demonstrated by 'king - man + woman ≈ queen'?",
        questionID: "Sifat apa yang ditunjukkan word embeddings melalui 'king - man + woman ≈ queen'?",
        options: [
            QuestionOption(id: "a", textEN: "Embeddings capture semantic relationships through vector arithmetic", textID: "Embeddings menangkap hubungan semantik melalui aritmatika vektor"),
            QuestionOption(id: "b", textEN: "Embeddings store dictionary definitions", textID: "Embeddings menyimpan definisi kamus"),
            QuestionOption(id: "c", textEN: "Embeddings are random vectors", textID: "Embeddings adalah vektor acak"),
            QuestionOption(id: "d", textEN: "Embeddings only work for royal terminology", textID: "Embeddings hanya bekerja untuk terminologi kerajaan")
        ],
        correctOptionId: "a",
        explanationEN: "This famous example shows that word embeddings capture semantic relationships as vector directions. The 'gender' direction (man→woman) can be applied to other words, demonstrating that embeddings encode meaningful analogies.",
        explanationID: "Contoh terkenal ini menunjukkan bahwa word embeddings menangkap hubungan semantik sebagai arah vektor. Arah 'gender' (man→woman) dapat diterapkan ke kata-kata lain, menunjukkan bahwa embeddings mengkodekan analogi yang bermakna.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_015",
        questionEN: "How does GloVe differ from Word2Vec?",
        questionID: "Bagaimana GloVe berbeda dari Word2Vec?",
        options: [
            QuestionOption(id: "a", textEN: "GloVe uses global word co-occurrence statistics; Word2Vec uses local context windows", textID: "GloVe menggunakan statistik ko-occurrence kata global; Word2Vec menggunakan window konteks lokal"),
            QuestionOption(id: "b", textEN: "GloVe is faster to train", textID: "GloVe lebih cepat untuk dilatih"),
            QuestionOption(id: "c", textEN: "GloVe produces smaller vectors", textID: "GloVe menghasilkan vektor yang lebih kecil"),
            QuestionOption(id: "d", textEN: "Word2Vec is more accurate", textID: "Word2Vec lebih akurat")
        ],
        correctOptionId: "a",
        explanationEN: "GloVe (Global Vectors) trains on the entire word co-occurrence matrix from a corpus, while Word2Vec uses local context windows around each word. GloVe directly optimizes for co-occurrence statistics.",
        explanationID: "GloVe (Global Vectors) melatih pada seluruh matriks ko-occurrence kata dari korpus, sementara Word2Vec menggunakan window konteks lokal di sekitar setiap kata. GloVe langsung mengoptimalkan untuk statistik ko-occurrence.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_016",
        questionEN: "What is the dimensionality problem with one-hot encoding for words?",
        questionID: "Apa masalah dimensionalitas dengan one-hot encoding untuk kata?",
        options: [
            QuestionOption(id: "a", textEN: "Vector size equals vocabulary size, creating very sparse high-dimensional vectors", textID: "Ukuran vektor sama dengan ukuran kosakata, menciptakan vektor dimensi tinggi yang sangat sparse"),
            QuestionOption(id: "b", textEN: "Vectors are too small to represent meaning", textID: "Vektor terlalu kecil untuk merepresentasikan makna"),
            QuestionOption(id: "c", textEN: "One-hot encoding is too slow", textID: "One-hot encoding terlalu lambat"),
            QuestionOption(id: "d", textEN: "It only works for numbers", textID: "Hanya bekerja untuk angka")
        ],
        correctOptionId: "a",
        explanationEN: "One-hot encoding creates vectors where dimensionality equals vocabulary size (often 50,000+ words). Each word has a single 1 and rest zeros, making vectors extremely sparse and lacking semantic similarity information.",
        explanationID: "One-hot encoding membuat vektor di mana dimensionalitas sama dengan ukuran kosakata (sering 50.000+ kata). Setiap kata memiliki satu 1 dan sisanya nol, membuat vektor sangat sparse dan tidak memiliki informasi kesamaan semantik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_017",
        questionEN: "What is negative sampling in Word2Vec?",
        questionID: "Apa itu negative sampling dalam Word2Vec?",
        options: [
            QuestionOption(id: "a", textEN: "An efficient training technique that samples a few negative examples instead of all vocabulary words", textID: "Teknik pelatihan efisien yang mengambil sampel beberapa contoh negatif alih-alih semua kata kosakata"),
            QuestionOption(id: "b", textEN: "Removing negative sentiment words", textID: "Menghapus kata-kata sentimen negatif"),
            QuestionOption(id: "c", textEN: "Sampling words with negative meaning", textID: "Mengambil sampel kata dengan makna negatif"),
            QuestionOption(id: "d", textEN: "A technique to remove noise from embeddings", textID: "Teknik untuk menghapus noise dari embeddings")
        ],
        correctOptionId: "a",
        explanationEN: "Negative sampling makes Word2Vec training efficient by updating only a small number of randomly sampled 'negative' words (that shouldn't appear in context) rather than all vocabulary words for each training step.",
        explanationID: "Negative sampling membuat pelatihan Word2Vec efisien dengan hanya memperbarui sejumlah kecil kata 'negatif' yang diambil sampelnya secara acak (yang tidak seharusnya muncul dalam konteks) daripada semua kata kosakata untuk setiap langkah pelatihan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_018",
        questionEN: "What limitation do static word embeddings (Word2Vec, GloVe) have?",
        questionID: "Apa keterbatasan static word embeddings (Word2Vec, GloVe)?",
        options: [
            QuestionOption(id: "a", textEN: "Each word has only one embedding regardless of context (polysemy not handled)", textID: "Setiap kata hanya memiliki satu embedding terlepas dari konteks (polisemi tidak ditangani)"),
            QuestionOption(id: "b", textEN: "They can only embed English words", textID: "Mereka hanya dapat meng-embed kata-kata bahasa Inggris"),
            QuestionOption(id: "c", textEN: "They require GPUs to generate", textID: "Mereka memerlukan GPU untuk menghasilkan"),
            QuestionOption(id: "d", textEN: "They cannot handle long documents", textID: "Mereka tidak dapat menangani dokumen panjang")
        ],
        correctOptionId: "a",
        explanationEN: "Static embeddings give each word a single fixed vector regardless of context. The word 'bank' gets the same embedding whether referring to a river bank or financial bank - polysemy (multiple meanings) is not captured.",
        explanationID: "Static embeddings memberikan setiap kata vektor tetap tunggal terlepas dari konteks. Kata 'bank' mendapatkan embedding yang sama baik merujuk ke tepi sungai atau bank keuangan - polisemi (makna ganda) tidak ditangkap.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_019",
        questionEN: "What is the typical dimensionality of word embeddings?",
        questionID: "Berapa dimensionalitas tipikal word embeddings?",
        options: [
            QuestionOption(id: "a", textEN: "100-300 dimensions", textID: "100-300 dimensi"),
            QuestionOption(id: "b", textEN: "1-10 dimensions", textID: "1-10 dimensi"),
            QuestionOption(id: "c", textEN: "1,000-10,000 dimensions", textID: "1.000-10.000 dimensi"),
            QuestionOption(id: "d", textEN: "Exactly vocabulary size", textID: "Tepat ukuran kosakata")
        ],
        correctOptionId: "a",
        explanationEN: "Word embeddings typically have 100-300 dimensions. This provides enough capacity to capture semantic relationships while being computationally manageable. Common choices are 50, 100, 200, or 300 dimensions.",
        explanationID: "Word embeddings biasanya memiliki 100-300 dimensi. Ini menyediakan kapasitas yang cukup untuk menangkap hubungan semantik sambil dapat dikelola secara komputasi. Pilihan umum adalah 50, 100, 200, atau 300 dimensi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_020",
        questionEN: "What is cosine similarity used for in word embeddings?",
        questionID: "Untuk apa cosine similarity digunakan dalam word embeddings?",
        options: [
            QuestionOption(id: "a", textEN: "Measuring semantic similarity between word vectors", textID: "Mengukur kesamaan semantik antara vektor kata"),
            QuestionOption(id: "b", textEN: "Computing the angle of text on a page", textID: "Menghitung sudut teks pada halaman"),
            QuestionOption(id: "c", textEN: "Calculating word frequency", textID: "Menghitung frekuensi kata"),
            QuestionOption(id: "d", textEN: "Determining sentence length", textID: "Menentukan panjang kalimat")
        ],
        correctOptionId: "a",
        explanationEN: "Cosine similarity measures the angle between two vectors, ranging from -1 to 1. In word embeddings, higher cosine similarity indicates more semantically similar words. It's preferred over Euclidean distance as it's scale-invariant.",
        explanationID: "Cosine similarity mengukur sudut antara dua vektor, berkisar dari -1 hingga 1. Dalam word embeddings, cosine similarity yang lebih tinggi menunjukkan kata-kata yang lebih mirip secara semantik. Ini lebih disukai daripada jarak Euclidean karena invariant terhadap skala.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Attention Mechanism (Questions 21-30)
    Question(
        id: "nlp_trans_021",
        questionEN: "What is the attention mechanism in neural networks?",
        questionID: "Apa itu mekanisme attention dalam neural networks?",
        options: [
            QuestionOption(id: "a", textEN: "A mechanism that allows the model to focus on relevant parts of the input when producing output", textID: "Mekanisme yang memungkinkan model fokus pada bagian yang relevan dari input saat menghasilkan output"),
            QuestionOption(id: "b", textEN: "A technique to make users pay attention to the model", textID: "Teknik untuk membuat pengguna memperhatikan model"),
            QuestionOption(id: "c", textEN: "A method to reduce model parameters", textID: "Metode untuk mengurangi parameter model"),
            QuestionOption(id: "d", textEN: "A way to speed up training", textID: "Cara untuk mempercepat pelatihan")
        ],
        correctOptionId: "a",
        explanationEN: "Attention allows models to dynamically focus on different parts of the input sequence when generating each output element. It computes weighted combinations of input representations based on relevance.",
        explanationID: "Attention memungkinkan model untuk secara dinamis fokus pada bagian yang berbeda dari urutan input saat menghasilkan setiap elemen output. Ini menghitung kombinasi tertimbang dari representasi input berdasarkan relevansi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_022",
        questionEN: "What are Query (Q), Key (K), and Value (V) in attention?",
        questionID: "Apa itu Query (Q), Key (K), dan Value (V) dalam attention?",
        options: [
            QuestionOption(id: "a", textEN: "Q is what we're looking for, K is what we match against, V is what we retrieve", textID: "Q adalah apa yang kita cari, K adalah apa yang kita cocokkan, V adalah apa yang kita ambil"),
            QuestionOption(id: "b", textEN: "Three different neural network architectures", textID: "Tiga arsitektur neural network yang berbeda"),
            QuestionOption(id: "c", textEN: "Database query operations", textID: "Operasi query database"),
            QuestionOption(id: "d", textEN: "Different types of embeddings", textID: "Jenis embeddings yang berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "In attention: Query (Q) represents what information we're looking for, Key (K) represents what each position offers, and Value (V) is the actual information to retrieve. Attention scores are computed by matching Q with K, then used to weight V.",
        explanationID: "Dalam attention: Query (Q) mewakili informasi apa yang kita cari, Key (K) mewakili apa yang ditawarkan setiap posisi, dan Value (V) adalah informasi aktual yang diambil. Skor attention dihitung dengan mencocokkan Q dengan K, kemudian digunakan untuk membobot V.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_023",
        questionEN: "What is the formula for scaled dot-product attention?",
        questionID: "Apa rumus scaled dot-product attention?",
        options: [
            QuestionOption(id: "a", textEN: "softmax(QK^T / √d_k) × V", textID: "softmax(QK^T / √d_k) × V"),
            QuestionOption(id: "b", textEN: "Q + K + V", textID: "Q + K + V"),
            QuestionOption(id: "c", textEN: "Q × K × V", textID: "Q × K × V"),
            QuestionOption(id: "d", textEN: "softmax(Q + K) × V", textID: "softmax(Q + K) × V")
        ],
        correctOptionId: "a",
        explanationEN: "Scaled dot-product attention: Attention(Q,K,V) = softmax(QK^T / √d_k) × V. The scaling by √d_k prevents dot products from growing too large with high dimensions, which would push softmax into regions with tiny gradients.",
        explanationID: "Scaled dot-product attention: Attention(Q,K,V) = softmax(QK^T / √d_k) × V. Penskalaan dengan √d_k mencegah dot products tumbuh terlalu besar dengan dimensi tinggi, yang akan mendorong softmax ke daerah dengan gradien yang sangat kecil.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_024",
        questionEN: "Why do we scale by √d_k in attention?",
        questionID: "Mengapa kita membagi dengan √d_k dalam attention?",
        options: [
            QuestionOption(id: "a", textEN: "To prevent dot products from becoming too large, which would make softmax gradients vanishingly small", textID: "Untuk mencegah dot products menjadi terlalu besar, yang akan membuat gradien softmax sangat kecil"),
            QuestionOption(id: "b", textEN: "To make the computation faster", textID: "Untuk membuat komputasi lebih cepat"),
            QuestionOption(id: "c", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "It's an arbitrary constant", textID: "Ini adalah konstanta sembarang")
        ],
        correctOptionId: "a",
        explanationEN: "When d_k is large, dot products tend to grow in magnitude, pushing softmax outputs to extreme values where gradients are very small. Scaling by √d_k keeps the variance of dot products stable regardless of dimension.",
        explanationID: "Ketika d_k besar, dot products cenderung tumbuh dalam magnitudo, mendorong output softmax ke nilai ekstrem di mana gradien sangat kecil. Penskalaan dengan √d_k menjaga varians dot products tetap stabil terlepas dari dimensi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_025",
        questionEN: "What is multi-head attention?",
        questionID: "Apa itu multi-head attention?",
        options: [
            QuestionOption(id: "a", textEN: "Running multiple attention operations in parallel with different learned projections", textID: "Menjalankan beberapa operasi attention secara paralel dengan proyeksi yang dipelajari berbeda"),
            QuestionOption(id: "b", textEN: "Attention with multiple input sequences", textID: "Attention dengan beberapa urutan input"),
            QuestionOption(id: "c", textEN: "Using multiple GPUs for attention", textID: "Menggunakan beberapa GPU untuk attention"),
            QuestionOption(id: "d", textEN: "Attention that looks at multiple documents", textID: "Attention yang melihat beberapa dokumen")
        ],
        correctOptionId: "a",
        explanationEN: "Multi-head attention runs several attention operations in parallel, each with different learned projection matrices. This allows the model to jointly attend to information from different representation subspaces at different positions.",
        explanationID: "Multi-head attention menjalankan beberapa operasi attention secara paralel, masing-masing dengan matriks proyeksi yang dipelajari berbeda. Ini memungkinkan model untuk secara bersama-sama memperhatikan informasi dari subruang representasi yang berbeda pada posisi yang berbeda.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_026",
        questionEN: "What is self-attention?",
        questionID: "Apa itu self-attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention where Q, K, and V all come from the same sequence", textID: "Attention di mana Q, K, dan V semuanya berasal dari urutan yang sama"),
            QuestionOption(id: "b", textEN: "Attention that focuses on itself only", textID: "Attention yang fokus pada dirinya sendiri saja"),
            QuestionOption(id: "c", textEN: "A simplified version of attention", textID: "Versi attention yang disederhanakan"),
            QuestionOption(id: "d", textEN: "Attention without the softmax", textID: "Attention tanpa softmax")
        ],
        correctOptionId: "a",
        explanationEN: "Self-attention (also called intra-attention) is when Q, K, and V are all derived from the same input sequence. Each position can attend to all positions in the same sequence, capturing long-range dependencies.",
        explanationID: "Self-attention (juga disebut intra-attention) adalah ketika Q, K, dan V semuanya berasal dari urutan input yang sama. Setiap posisi dapat memperhatikan semua posisi dalam urutan yang sama, menangkap dependensi jarak jauh.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_027",
        questionEN: "What is cross-attention?",
        questionID: "Apa itu cross-attention?",
        options: [
            QuestionOption(id: "a", textEN: "Attention where Q comes from one sequence and K, V come from another sequence", textID: "Attention di mana Q berasal dari satu urutan dan K, V berasal dari urutan lain"),
            QuestionOption(id: "b", textEN: "Attention across multiple GPUs", textID: "Attention di beberapa GPU"),
            QuestionOption(id: "c", textEN: "A faster version of self-attention", textID: "Versi self-attention yang lebih cepat"),
            QuestionOption(id: "d", textEN: "Attention between different languages", textID: "Attention antara bahasa yang berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Cross-attention (or encoder-decoder attention) is when Q comes from one sequence (e.g., decoder) while K and V come from another (e.g., encoder). This allows the decoder to attend to relevant parts of the input.",
        explanationID: "Cross-attention (atau encoder-decoder attention) adalah ketika Q berasal dari satu urutan (misalnya decoder) sementara K dan V berasal dari urutan lain (misalnya encoder). Ini memungkinkan decoder untuk memperhatikan bagian yang relevan dari input.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_028",
        questionEN: "What is the computational complexity of self-attention with respect to sequence length n?",
        questionID: "Berapa kompleksitas komputasi self-attention terhadap panjang urutan n?",
        options: [
            QuestionOption(id: "a", textEN: "O(n²) because each position attends to all n positions", textID: "O(n²) karena setiap posisi memperhatikan semua n posisi"),
            QuestionOption(id: "b", textEN: "O(n) linear with sequence length", textID: "O(n) linear dengan panjang urutan"),
            QuestionOption(id: "c", textEN: "O(log n) logarithmic", textID: "O(log n) logaritmik"),
            QuestionOption(id: "d", textEN: "O(1) constant", textID: "O(1) konstan")
        ],
        correctOptionId: "a",
        explanationEN: "Self-attention has O(n²) complexity because computing attention requires comparing every position with every other position, creating an n×n attention matrix. This is a limitation for very long sequences.",
        explanationID: "Self-attention memiliki kompleksitas O(n²) karena menghitung attention memerlukan perbandingan setiap posisi dengan setiap posisi lainnya, menciptakan matriks attention n×n. Ini adalah batasan untuk urutan yang sangat panjang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_029",
        questionEN: "What is causal (masked) attention used for?",
        questionID: "Untuk apa causal (masked) attention digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Preventing positions from attending to future positions in autoregressive generation", textID: "Mencegah posisi memperhatikan posisi masa depan dalam generasi autoregressive"),
            QuestionOption(id: "b", textEN: "Finding the cause of errors in attention", textID: "Menemukan penyebab kesalahan dalam attention"),
            QuestionOption(id: "c", textEN: "Masking private information", textID: "Menyembunyikan informasi pribadi"),
            QuestionOption(id: "d", textEN: "Reducing attention computation", textID: "Mengurangi komputasi attention")
        ],
        correctOptionId: "a",
        explanationEN: "Causal/masked attention masks future positions so each position can only attend to itself and previous positions. This is essential for autoregressive models like GPT that generate tokens sequentially without seeing future tokens.",
        explanationID: "Causal/masked attention menyembunyikan posisi masa depan sehingga setiap posisi hanya dapat memperhatikan dirinya sendiri dan posisi sebelumnya. Ini penting untuk model autoregressive seperti GPT yang menghasilkan token secara berurutan tanpa melihat token masa depan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_030",
        questionEN: "How many attention heads are typically used in transformers like BERT-base?",
        questionID: "Berapa jumlah attention heads yang biasanya digunakan dalam transformer seperti BERT-base?",
        options: [
            QuestionOption(id: "a", textEN: "12 heads", textID: "12 heads"),
            QuestionOption(id: "b", textEN: "1 head", textID: "1 head"),
            QuestionOption(id: "c", textEN: "100 heads", textID: "100 heads"),
            QuestionOption(id: "d", textEN: "3 heads", textID: "3 heads")
        ],
        correctOptionId: "a",
        explanationEN: "BERT-base uses 12 attention heads with 768 hidden dimensions (64 dimensions per head). BERT-large uses 16 heads with 1024 dimensions. Multiple heads allow the model to capture different types of relationships.",
        explanationID: "BERT-base menggunakan 12 attention heads dengan 768 dimensi tersembunyi (64 dimensi per head). BERT-large menggunakan 16 heads dengan 1024 dimensi. Beberapa heads memungkinkan model menangkap berbagai jenis hubungan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - Transformer Architecture (Questions 31-40)
    Question(
        id: "nlp_trans_031",
        questionEN: "What is the main innovation of the Transformer architecture?",
        questionID: "Apa inovasi utama arsitektur Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Replacing recurrence with self-attention for parallel processing of sequences", textID: "Mengganti recurrence dengan self-attention untuk pemrosesan paralel urutan"),
            QuestionOption(id: "b", textEN: "Using convolutions for text", textID: "Menggunakan konvolusi untuk teks"),
            QuestionOption(id: "c", textEN: "Introducing recurrent neural networks", textID: "Memperkenalkan recurrent neural networks"),
            QuestionOption(id: "d", textEN: "Making models smaller", textID: "Membuat model lebih kecil")
        ],
        correctOptionId: "a",
        explanationEN: "The Transformer's key innovation is replacing recurrent connections (RNNs/LSTMs) with self-attention, allowing parallel processing of all positions. This dramatically speeds up training and better captures long-range dependencies.",
        explanationID: "Inovasi utama Transformer adalah mengganti koneksi recurrent (RNN/LSTM) dengan self-attention, memungkinkan pemrosesan paralel semua posisi. Ini secara dramatis mempercepat pelatihan dan lebih baik menangkap dependensi jarak jauh.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_032",
        questionEN: "What are the two main components of a Transformer encoder layer?",
        questionID: "Apa dua komponen utama layer encoder Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Multi-head self-attention and feed-forward network", textID: "Multi-head self-attention dan feed-forward network"),
            QuestionOption(id: "b", textEN: "Convolution and pooling", textID: "Konvolusi dan pooling"),
            QuestionOption(id: "c", textEN: "LSTM and GRU", textID: "LSTM dan GRU"),
            QuestionOption(id: "d", textEN: "Embedding and output", textID: "Embedding dan output")
        ],
        correctOptionId: "a",
        explanationEN: "Each Transformer encoder layer has two sub-layers: multi-head self-attention and a position-wise feed-forward network. Each sub-layer is wrapped with residual connections and layer normalization.",
        explanationID: "Setiap layer encoder Transformer memiliki dua sub-layer: multi-head self-attention dan position-wise feed-forward network. Setiap sub-layer dibungkus dengan residual connections dan layer normalization.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_033",
        questionEN: "Why are positional encodings needed in Transformers?",
        questionID: "Mengapa positional encodings diperlukan dalam Transformers?",
        options: [
            QuestionOption(id: "a", textEN: "Because self-attention is permutation-invariant and doesn't inherently capture position", textID: "Karena self-attention adalah permutation-invariant dan tidak secara inheren menangkap posisi"),
            QuestionOption(id: "b", textEN: "To make the model run faster", textID: "Untuk membuat model berjalan lebih cepat"),
            QuestionOption(id: "c", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "To handle multiple languages", textID: "Untuk menangani beberapa bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "Self-attention treats the input as a set with no inherent order. Positional encodings are added to input embeddings to inject information about token positions, allowing the model to understand sequence order.",
        explanationID: "Self-attention memperlakukan input sebagai set tanpa urutan inheren. Positional encodings ditambahkan ke input embeddings untuk menyuntikkan informasi tentang posisi token, memungkinkan model memahami urutan sequence.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_034",
        questionEN: "What is the purpose of residual connections in Transformers?",
        questionID: "Apa tujuan residual connections dalam Transformers?",
        options: [
            QuestionOption(id: "a", textEN: "To allow gradients to flow directly through layers, helping train deep networks", textID: "Untuk memungkinkan gradien mengalir langsung melalui layer, membantu melatih jaringan dalam"),
            QuestionOption(id: "b", textEN: "To store residual information", textID: "Untuk menyimpan informasi residual"),
            QuestionOption(id: "c", textEN: "To connect to previous models", textID: "Untuk terhubung ke model sebelumnya"),
            QuestionOption(id: "d", textEN: "To reduce the number of parameters", textID: "Untuk mengurangi jumlah parameter")
        ],
        correctOptionId: "a",
        explanationEN: "Residual (skip) connections add the input directly to the output of a layer: output = x + sublayer(x). This creates direct paths for gradient flow, preventing vanishing gradients in deep networks.",
        explanationID: "Residual (skip) connections menambahkan input langsung ke output layer: output = x + sublayer(x). Ini menciptakan jalur langsung untuk aliran gradien, mencegah vanishing gradients di jaringan dalam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_035",
        questionEN: "What is layer normalization in Transformers?",
        questionID: "Apa itu layer normalization dalam Transformers?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing activations across features for each sample independently", textID: "Menormalisasi aktivasi di seluruh fitur untuk setiap sampel secara independen"),
            QuestionOption(id: "b", textEN: "Normalizing across all samples in a batch", textID: "Menormalisasi di semua sampel dalam batch"),
            QuestionOption(id: "c", textEN: "Normalizing the number of layers", textID: "Menormalisasi jumlah layer"),
            QuestionOption(id: "d", textEN: "Removing unnecessary layers", textID: "Menghapus layer yang tidak perlu")
        ],
        correctOptionId: "a",
        explanationEN: "Layer normalization normalizes activations across the feature dimension for each sample independently (unlike batch norm which normalizes across batch). It stabilizes training and is applied after each sub-layer in Transformers.",
        explanationID: "Layer normalization menormalisasi aktivasi di seluruh dimensi fitur untuk setiap sampel secara independen (tidak seperti batch norm yang menormalisasi di seluruh batch). Ini menstabilkan pelatihan dan diterapkan setelah setiap sub-layer dalam Transformers.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_036",
        questionEN: "What is the feed-forward network in each Transformer layer?",
        questionID: "Apa itu feed-forward network dalam setiap layer Transformer?",
        options: [
            QuestionOption(id: "a", textEN: "Two linear transformations with a ReLU activation: FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂", textID: "Dua transformasi linear dengan aktivasi ReLU: FFN(x) = ReLU(xW₁ + b₁)W₂ + b₂"),
            QuestionOption(id: "b", textEN: "A convolutional neural network", textID: "Convolutional neural network"),
            QuestionOption(id: "c", textEN: "A recurrent neural network", textID: "Recurrent neural network"),
            QuestionOption(id: "d", textEN: "Just a single linear layer", textID: "Hanya satu layer linear")
        ],
        correctOptionId: "a",
        explanationEN: "The position-wise FFN applies two linear transformations with an activation (usually ReLU or GELU) in between. It processes each position independently and identically, typically expanding then contracting dimensions (e.g., 768→3072→768).",
        explanationID: "Position-wise FFN menerapkan dua transformasi linear dengan aktivasi (biasanya ReLU atau GELU) di antaranya. Ini memproses setiap posisi secara independen dan identik, biasanya memperluas lalu mengontraksi dimensi (misalnya 768→3072→768).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_037",
        questionEN: "What are the three types of attention in a full encoder-decoder Transformer?",
        questionID: "Apa tiga jenis attention dalam Transformer encoder-decoder penuh?",
        options: [
            QuestionOption(id: "a", textEN: "Encoder self-attention, masked decoder self-attention, encoder-decoder cross-attention", textID: "Encoder self-attention, masked decoder self-attention, encoder-decoder cross-attention"),
            QuestionOption(id: "b", textEN: "Input, output, and hidden attention", textID: "Input, output, dan hidden attention"),
            QuestionOption(id: "c", textEN: "Forward, backward, and bidirectional attention", textID: "Forward, backward, dan bidirectional attention"),
            QuestionOption(id: "d", textEN: "Single, double, and triple attention", textID: "Single, double, dan triple attention")
        ],
        correctOptionId: "a",
        explanationEN: "Full Transformers have: (1) encoder self-attention (bidirectional), (2) masked decoder self-attention (causal/unidirectional), and (3) encoder-decoder cross-attention (decoder attends to encoder outputs).",
        explanationID: "Transformer penuh memiliki: (1) encoder self-attention (bidirectional), (2) masked decoder self-attention (causal/unidirectional), dan (3) encoder-decoder cross-attention (decoder memperhatikan output encoder).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_038",
        questionEN: "What sinusoidal positional encoding formula is used in the original Transformer?",
        questionID: "Rumus positional encoding sinusoidal apa yang digunakan dalam Transformer asli?",
        options: [
            QuestionOption(id: "a", textEN: "PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(pos/10000^(2i/d))", textID: "PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(pos/10000^(2i/d))"),
            QuestionOption(id: "b", textEN: "PE(pos) = pos²", textID: "PE(pos) = pos²"),
            QuestionOption(id: "c", textEN: "PE(pos) = pos / max_len", textID: "PE(pos) = pos / max_len"),
            QuestionOption(id: "d", textEN: "PE(pos) = log(pos)", textID: "PE(pos) = log(pos)")
        ],
        correctOptionId: "a",
        explanationEN: "The original Transformer uses sinusoidal functions with different frequencies for each dimension. This allows the model to learn to attend by relative positions and generalize to sequence lengths not seen during training.",
        explanationID: "Transformer asli menggunakan fungsi sinusoidal dengan frekuensi yang berbeda untuk setiap dimensi. Ini memungkinkan model belajar memperhatikan berdasarkan posisi relatif dan menggeneralisasi ke panjang urutan yang tidak terlihat selama pelatihan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_039",
        questionEN: "What is the difference between pre-norm and post-norm in Transformers?",
        questionID: "Apa perbedaan antara pre-norm dan post-norm dalam Transformers?",
        options: [
            QuestionOption(id: "a", textEN: "Pre-norm applies LayerNorm before attention/FFN; post-norm applies it after", textID: "Pre-norm menerapkan LayerNorm sebelum attention/FFN; post-norm menerapkannya setelah"),
            QuestionOption(id: "b", textEN: "Pre-norm is faster to train", textID: "Pre-norm lebih cepat untuk dilatih"),
            QuestionOption(id: "c", textEN: "Post-norm uses more memory", textID: "Post-norm menggunakan lebih banyak memori"),
            QuestionOption(id: "d", textEN: "They produce identical results", textID: "Keduanya menghasilkan hasil yang identik")
        ],
        correctOptionId: "a",
        explanationEN: "In pre-norm (used by GPT-2, many modern models): y = x + Attn(LayerNorm(x)). In post-norm (original Transformer): y = LayerNorm(x + Attn(x)). Pre-norm often trains more stably without warmup.",
        explanationID: "Dalam pre-norm (digunakan oleh GPT-2, banyak model modern): y = x + Attn(LayerNorm(x)). Dalam post-norm (Transformer asli): y = LayerNorm(x + Attn(x)). Pre-norm sering berlatih lebih stabil tanpa warmup.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    Question(
        id: "nlp_trans_040",
        questionEN: "How many parameters does BERT-base have approximately?",
        questionID: "Berapa parameter yang dimiliki BERT-base kira-kira?",
        options: [
            QuestionOption(id: "a", textEN: "110 million parameters", textID: "110 juta parameter"),
            QuestionOption(id: "b", textEN: "1 million parameters", textID: "1 juta parameter"),
            QuestionOption(id: "c", textEN: "1 billion parameters", textID: "1 miliar parameter"),
            QuestionOption(id: "d", textEN: "10,000 parameters", textID: "10.000 parameter")
        ],
        correctOptionId: "a",
        explanationEN: "BERT-base has approximately 110 million parameters (12 layers, 768 hidden size, 12 attention heads). BERT-large has 340 million parameters (24 layers, 1024 hidden size, 16 heads).",
        explanationID: "BERT-base memiliki sekitar 110 juta parameter (12 layer, 768 hidden size, 12 attention heads). BERT-large memiliki 340 juta parameter (24 layer, 1024 hidden size, 16 heads).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - BERT (Questions 41-45)
    Question(
        id: "nlp_trans_041",
        questionEN: "What does BERT stand for?",
        questionID: "Apa kepanjangan BERT?",
        options: [
            QuestionOption(id: "a", textEN: "Bidirectional Encoder Representations from Transformers", textID: "Bidirectional Encoder Representations from Transformers"),
            QuestionOption(id: "b", textEN: "Basic Encoding Representation Technology", textID: "Basic Encoding Representation Technology"),
            QuestionOption(id: "c", textEN: "Binary Encoder Retrieval Transformer", textID: "Binary Encoder Retrieval Transformer"),
            QuestionOption(id: "d", textEN: "Batch Encoding Recursive Training", textID: "Batch Encoding Recursive Training")
        ],
        correctOptionId: "a",
        explanationEN: "BERT = Bidirectional Encoder Representations from Transformers. The 'bidirectional' aspect means it looks at both left and right context when encoding each word, unlike GPT which only looks left.",
        explanationID: "BERT = Bidirectional Encoder Representations from Transformers. Aspek 'bidirectional' berarti ia melihat konteks kiri dan kanan saat mengkodekan setiap kata, tidak seperti GPT yang hanya melihat kiri.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    Question(
        id: "nlp_trans_042",
        questionEN: "What are the two pre-training objectives of BERT?",
        questionID: "Apa dua tujuan pre-training BERT?",
        options: [
            QuestionOption(id: "a", textEN: "Masked Language Modeling (MLM) and Next Sentence Prediction (NSP)", textID: "Masked Language Modeling (MLM) dan Next Sentence Prediction (NSP)"),
            QuestionOption(id: "b", textEN: "Translation and Summarization", textID: "Terjemahan dan Ringkasan"),
            QuestionOption(id: "c", textEN: "Classification and Regression", textID: "Klasifikasi dan Regresi"),
            QuestionOption(id: "d", textEN: "Encoding and Decoding", textID: "Encoding dan Decoding")
        ],
        correctOptionId: "a",
        explanationEN: "BERT is pre-trained with: (1) MLM - predicting randomly masked tokens (15% of input), and (2) NSP - predicting whether two sentences are consecutive. This enables bidirectional context learning.",
        explanationID: "BERT di-pretrain dengan: (1) MLM - memprediksi token yang di-mask secara acak (15% input), dan (2) NSP - memprediksi apakah dua kalimat berurutan. Ini memungkinkan pembelajaran konteks bidirectional.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_043",
        questionEN: "What percentage of tokens are masked in BERT's MLM pre-training?",
        questionID: "Berapa persen token yang di-mask dalam pre-training MLM BERT?",
        options: [
            QuestionOption(id: "a", textEN: "15% of tokens", textID: "15% token"),
            QuestionOption(id: "b", textEN: "50% of tokens", textID: "50% token"),
            QuestionOption(id: "c", textEN: "100% of tokens", textID: "100% token"),
            QuestionOption(id: "d", textEN: "1% of tokens", textID: "1% token")
        ],
        correctOptionId: "a",
        explanationEN: "BERT masks 15% of input tokens. Of these masked positions: 80% are replaced with [MASK], 10% with random tokens, and 10% kept unchanged. This prevents the model from relying only on the [MASK] token.",
        explanationID: "BERT menyembunyikan 15% token input. Dari posisi yang di-mask ini: 80% diganti dengan [MASK], 10% dengan token acak, dan 10% tetap tidak berubah. Ini mencegah model hanya bergantung pada token [MASK].",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_044",
        questionEN: "What special tokens does BERT use?",
        questionID: "Token khusus apa yang digunakan BERT?",
        options: [
            QuestionOption(id: "a", textEN: "[CLS] at start, [SEP] between/after sentences, [MASK] for masking", textID: "[CLS] di awal, [SEP] antara/setelah kalimat, [MASK] untuk masking"),
            QuestionOption(id: "b", textEN: "Only [START] and [END]", textID: "Hanya [START] dan [END]"),
            QuestionOption(id: "c", textEN: "[BEGIN] and [FINISH]", textID: "[BEGIN] dan [FINISH]"),
            QuestionOption(id: "d", textEN: "No special tokens", textID: "Tidak ada token khusus")
        ],
        correctOptionId: "a",
        explanationEN: "[CLS] is added at the start (its output is used for classification). [SEP] separates sentences and marks the end. [MASK] replaces tokens during MLM pre-training. These special tokens serve specific roles in BERT.",
        explanationID: "[CLS] ditambahkan di awal (outputnya digunakan untuk klasifikasi). [SEP] memisahkan kalimat dan menandai akhir. [MASK] mengganti token selama pre-training MLM. Token khusus ini memiliki peran spesifik dalam BERT.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_045",
        questionEN: "How is BERT typically fine-tuned for classification tasks?",
        questionID: "Bagaimana BERT biasanya di-fine-tune untuk tugas klasifikasi?",
        options: [
            QuestionOption(id: "a", textEN: "Add a classification layer on top of the [CLS] token representation", textID: "Menambahkan layer klasifikasi di atas representasi token [CLS]"),
            QuestionOption(id: "b", textEN: "Retrain the entire model from scratch", textID: "Melatih ulang seluruh model dari awal"),
            QuestionOption(id: "c", textEN: "Only use the last layer", textID: "Hanya menggunakan layer terakhir"),
            QuestionOption(id: "d", textEN: "Remove all attention layers", textID: "Menghapus semua layer attention")
        ],
        correctOptionId: "a",
        explanationEN: "For classification, a linear layer is added on top of the [CLS] token's final hidden state. The entire model (BERT + classifier) is then fine-tuned end-to-end on the downstream task with task-specific labels.",
        explanationID: "Untuk klasifikasi, layer linear ditambahkan di atas hidden state akhir token [CLS]. Seluruh model (BERT + classifier) kemudian di-fine-tune secara end-to-end pada tugas downstream dengan label spesifik tugas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // MARK: - GPT and Generative Models (Questions 46-50)
    Question(
        id: "nlp_trans_046",
        questionEN: "What is the key architectural difference between BERT and GPT?",
        questionID: "Apa perbedaan arsitektur utama antara BERT dan GPT?",
        options: [
            QuestionOption(id: "a", textEN: "BERT is encoder-only (bidirectional); GPT is decoder-only (autoregressive/unidirectional)", textID: "BERT adalah encoder-only (bidirectional); GPT adalah decoder-only (autoregressive/unidirectional)"),
            QuestionOption(id: "b", textEN: "GPT is larger than BERT", textID: "GPT lebih besar dari BERT"),
            QuestionOption(id: "c", textEN: "BERT uses attention; GPT doesn't", textID: "BERT menggunakan attention; GPT tidak"),
            QuestionOption(id: "d", textEN: "They are identical architectures", textID: "Keduanya adalah arsitektur yang identik")
        ],
        correctOptionId: "a",
        explanationEN: "BERT uses the Transformer encoder with bidirectional attention (sees all tokens). GPT uses the Transformer decoder with masked/causal attention (only sees previous tokens), making it suitable for autoregressive generation.",
        explanationID: "BERT menggunakan encoder Transformer dengan attention bidirectional (melihat semua token). GPT menggunakan decoder Transformer dengan masked/causal attention (hanya melihat token sebelumnya), membuatnya cocok untuk generasi autoregressive.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_047",
        questionEN: "What is autoregressive language modeling?",
        questionID: "Apa itu autoregressive language modeling?",
        options: [
            QuestionOption(id: "a", textEN: "Predicting the next token given all previous tokens, one at a time", textID: "Memprediksi token berikutnya dari semua token sebelumnya, satu per satu"),
            QuestionOption(id: "b", textEN: "Predicting all tokens simultaneously", textID: "Memprediksi semua token secara bersamaan"),
            QuestionOption(id: "c", textEN: "Predicting masked tokens", textID: "Memprediksi token yang di-mask"),
            QuestionOption(id: "d", textEN: "Translating between languages", textID: "Menerjemahkan antar bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "Autoregressive LM predicts P(xₜ|x₁,...,xₜ₋₁) - the probability of the next token given all previous tokens. Generation proceeds token by token, each new token conditioned on all previously generated ones.",
        explanationID: "Autoregressive LM memprediksi P(xₜ|x₁,...,xₜ₋₁) - probabilitas token berikutnya dari semua token sebelumnya. Generasi berlangsung token demi token, setiap token baru dikondisikan pada semua token yang dihasilkan sebelumnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_048",
        questionEN: "What is temperature in text generation?",
        questionID: "Apa itu temperature dalam text generation?",
        options: [
            QuestionOption(id: "a", textEN: "A parameter that controls randomness - higher temperature = more random outputs", textID: "Parameter yang mengontrol keacakan - temperature lebih tinggi = output lebih acak"),
            QuestionOption(id: "b", textEN: "The GPU temperature during inference", textID: "Suhu GPU selama inferensi"),
            QuestionOption(id: "c", textEN: "The training speed", textID: "Kecepatan pelatihan"),
            QuestionOption(id: "d", textEN: "The model size", textID: "Ukuran model")
        ],
        correctOptionId: "a",
        explanationEN: "Temperature scales the logits before softmax. T=1 gives normal probabilities. T<1 makes distribution sharper (more deterministic). T>1 makes it flatter (more random). T→0 approaches greedy decoding.",
        explanationID: "Temperature menskalakan logits sebelum softmax. T=1 memberikan probabilitas normal. T<1 membuat distribusi lebih tajam (lebih deterministik). T>1 membuatnya lebih datar (lebih acak). T→0 mendekati greedy decoding.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_049",
        questionEN: "What is top-k sampling in text generation?",
        questionID: "Apa itu top-k sampling dalam text generation?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling only from the k most probable tokens at each step", textID: "Mengambil sampel hanya dari k token paling mungkin pada setiap langkah"),
            QuestionOption(id: "b", textEN: "Generating the top k sentences", textID: "Menghasilkan k kalimat teratas"),
            QuestionOption(id: "c", textEN: "Using k different models", textID: "Menggunakan k model berbeda"),
            QuestionOption(id: "d", textEN: "Training for k epochs", textID: "Melatih selama k epoch")
        ],
        correctOptionId: "a",
        explanationEN: "Top-k sampling restricts the next token selection to only the k highest probability tokens, then renormalizes and samples from this reduced set. This prevents very unlikely tokens from being selected.",
        explanationID: "Top-k sampling membatasi pemilihan token berikutnya hanya pada k token probabilitas tertinggi, kemudian menormalisasi ulang dan mengambil sampel dari set yang dikurangi ini. Ini mencegah token yang sangat tidak mungkin dipilih.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    Question(
        id: "nlp_trans_050",
        questionEN: "What is nucleus (top-p) sampling?",
        questionID: "Apa itu nucleus (top-p) sampling?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling from tokens whose cumulative probability exceeds threshold p", textID: "Mengambil sampel dari token yang probabilitas kumulatifnya melebihi threshold p"),
            QuestionOption(id: "b", textEN: "Sampling from the center of the distribution", textID: "Mengambil sampel dari pusat distribusi"),
            QuestionOption(id: "c", textEN: "Using p different samples", textID: "Menggunakan p sampel berbeda"),
            QuestionOption(id: "d", textEN: "A nuclear physics term", textID: "Istilah fisika nuklir")
        ],
        correctOptionId: "a",
        explanationEN: "Top-p (nucleus) sampling selects from the smallest set of tokens whose cumulative probability exceeds p (e.g., p=0.9). Unlike top-k, the number of tokens varies adaptively based on the probability distribution.",
        explanationID: "Top-p (nucleus) sampling memilih dari set terkecil token yang probabilitas kumulatifnya melebihi p (misalnya p=0.9). Tidak seperti top-k, jumlah token bervariasi secara adaptif berdasarkan distribusi probabilitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
