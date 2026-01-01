import Foundation

// MARK: - AI/ML/DL: Generative AI Questions (50 questions)
// Subcategory: LLMs, GANs, VAEs, diffusion models, RLHF, AI ethics

let genAIQuestions: [Question] = [
    // Batch 1: Large Language Models (10 questions)
    Question(
        id: "gen001",
        questionEN: "What is a Large Language Model (LLM)?",
        questionID: "Apa itu Large Language Model (LLM)?",
        options: [
            QuestionOption(id: "a", textEN: "A neural network with billions of parameters trained on massive text data", textID: "Neural network dengan miliaran parameter yang dilatih pada data teks masif"),
            QuestionOption(id: "b", textEN: "A model that translates large documents", textID: "Model yang menerjemahkan dokumen besar"),
            QuestionOption(id: "c", textEN: "A database of language rules", textID: "Database aturan bahasa"),
            QuestionOption(id: "d", textEN: "A model that only processes long sentences", textID: "Model yang hanya memproses kalimat panjang")
        ],
        correctOptionId: "a",
        explanationEN: "LLMs like GPT-4, Claude, and LLaMA are transformer-based models with billions of parameters, pre-trained on internet-scale text data to understand and generate language.",
        explanationID: "LLM seperti GPT-4, Claude, dan LLaMA adalah model berbasis transformer dengan miliaran parameter, di-pre-train pada data teks skala internet untuk memahami dan menghasilkan bahasa.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen002",
        questionEN: "What is autoregressive generation in LLMs?",
        questionID: "Apa itu autoregressive generation dalam LLM?",
        options: [
            QuestionOption(id: "a", textEN: "Generating text one token at a time, each conditioned on all previous tokens", textID: "Menghasilkan teks satu token pada satu waktu, masing-masing dikondisikan pada semua token sebelumnya"),
            QuestionOption(id: "b", textEN: "Generating all tokens simultaneously", textID: "Menghasilkan semua token secara bersamaan"),
            QuestionOption(id: "c", textEN: "Automatically correcting grammar", textID: "Secara otomatis mengoreksi tata bahasa"),
            QuestionOption(id: "d", textEN: "Generating tokens in reverse order", textID: "Menghasilkan token dalam urutan terbalik")
        ],
        correctOptionId: "a",
        explanationEN: "Autoregressive models generate one token at a time, using all previous tokens as context. Each new token becomes part of the context for the next prediction.",
        explanationID: "Model autoregressive menghasilkan satu token pada satu waktu, menggunakan semua token sebelumnya sebagai konteks. Setiap token baru menjadi bagian dari konteks untuk prediksi berikutnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen003",
        questionEN: "What is temperature in LLM sampling?",
        questionID: "Apa itu temperature dalam sampling LLM?",
        options: [
            QuestionOption(id: "a", textEN: "A parameter controlling randomness: higher = more random, lower = more deterministic", textID: "Parameter yang mengontrol keacakan: lebih tinggi = lebih acak, lebih rendah = lebih deterministik"),
            QuestionOption(id: "b", textEN: "The GPU temperature during inference", textID: "Suhu GPU selama inference"),
            QuestionOption(id: "c", textEN: "The training duration", textID: "Durasi training"),
            QuestionOption(id: "d", textEN: "The model's memory usage", textID: "Penggunaan memori model")
        ],
        correctOptionId: "a",
        explanationEN: "Temperature scales the logits before softmax. T=0 is greedy (always picks highest prob), T>1 increases randomness, T<1 makes distribution sharper.",
        explanationID: "Temperature menskalakan logit sebelum softmax. T=0 adalah greedy (selalu memilih prob tertinggi), T>1 meningkatkan keacakan, T<1 membuat distribusi lebih tajam.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen004",
        questionEN: "What is top-k sampling?",
        questionID: "Apa itu top-k sampling?",
        options: [
            QuestionOption(id: "a", textEN: "Only sampling from the k most probable tokens at each step", textID: "Hanya sampling dari k token paling mungkin di setiap langkah"),
            QuestionOption(id: "b", textEN: "Training for k epochs", textID: "Training untuk k epoch"),
            QuestionOption(id: "c", textEN: "Using k different models", textID: "Menggunakan k model berbeda"),
            QuestionOption(id: "d", textEN: "Generating k sentences at once", textID: "Menghasilkan k kalimat sekaligus")
        ],
        correctOptionId: "a",
        explanationEN: "Top-k sampling restricts the token selection to the k highest probability tokens, then samples from this reduced set. It balances diversity and quality.",
        explanationID: "Top-k sampling membatasi pemilihan token ke k token dengan probabilitas tertinggi, lalu melakukan sampling dari set yang dikurangi ini. Ini menyeimbangkan keragaman dan kualitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen005",
        questionEN: "What is top-p (nucleus) sampling?",
        questionID: "Apa itu top-p (nucleus) sampling?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling from the smallest set of tokens whose cumulative probability exceeds p", textID: "Sampling dari set token terkecil yang probabilitas kumulatifnya melebihi p"),
            QuestionOption(id: "b", textEN: "Sampling from p percent of tokens", textID: "Sampling dari p persen token"),
            QuestionOption(id: "c", textEN: "Using probability p for each token", textID: "Menggunakan probabilitas p untuk setiap token"),
            QuestionOption(id: "d", textEN: "Generating p paragraphs", textID: "Menghasilkan p paragraf")
        ],
        correctOptionId: "a",
        explanationEN: "Top-p sampling dynamically selects the minimum set of tokens whose cumulative probability reaches p (e.g., 0.9), adapting to the probability distribution.",
        explanationID: "Top-p sampling secara dinamis memilih set token minimum yang probabilitas kumulatifnya mencapai p (misal 0.9), beradaptasi dengan distribusi probabilitas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen006",
        questionEN: "What is a context window in LLMs?",
        questionID: "Apa itu context window dalam LLM?",
        options: [
            QuestionOption(id: "a", textEN: "The maximum number of tokens the model can process at once", textID: "Jumlah maksimum token yang dapat diproses model sekaligus"),
            QuestionOption(id: "b", textEN: "A window displaying context information", textID: "Jendela yang menampilkan informasi konteks"),
            QuestionOption(id: "c", textEN: "The training data size", textID: "Ukuran data training"),
            QuestionOption(id: "d", textEN: "The number of layers in the model", textID: "Jumlah layer dalam model")
        ],
        correctOptionId: "a",
        explanationEN: "Context window is the maximum sequence length (in tokens) an LLM can handle. GPT-4 has 128K tokens, Claude has 200K tokens. Longer context = more memory.",
        explanationID: "Context window adalah panjang sekuens maksimum (dalam token) yang dapat ditangani LLM. GPT-4 memiliki 128K token, Claude memiliki 200K token. Konteks lebih panjang = lebih banyak memori.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen007",
        questionEN: "What is token in the context of LLMs?",
        questionID: "Apa itu token dalam konteks LLM?",
        options: [
            QuestionOption(id: "a", textEN: "A piece of text (word, subword, or character) that the model processes as a unit", textID: "Potongan teks (kata, subkata, atau karakter) yang diproses model sebagai unit"),
            QuestionOption(id: "b", textEN: "A cryptocurrency used to pay for API access", textID: "Cryptocurrency yang digunakan untuk membayar akses API"),
            QuestionOption(id: "c", textEN: "A security authentication code", textID: "Kode autentikasi keamanan"),
            QuestionOption(id: "d", textEN: "The model's internal memory", textID: "Memori internal model")
        ],
        correctOptionId: "a",
        explanationEN: "Tokens are the basic units LLMs work with. A token can be a word, part of a word, or punctuation. 'Tokenizer' converts text to tokens and vice versa.",
        explanationID: "Token adalah unit dasar yang digunakan LLM. Sebuah token bisa berupa kata, bagian dari kata, atau tanda baca. 'Tokenizer' mengkonversi teks ke token dan sebaliknya.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen008",
        questionEN: "What is RLHF (Reinforcement Learning from Human Feedback)?",
        questionID: "Apa itu RLHF (Reinforcement Learning from Human Feedback)?",
        options: [
            QuestionOption(id: "a", textEN: "Training LLMs using human preferences to align outputs with human values", textID: "Melatih LLM menggunakan preferensi manusia untuk menyelaraskan output dengan nilai manusia"),
            QuestionOption(id: "b", textEN: "Learning from reinforcement materials", textID: "Belajar dari materi penguatan"),
            QuestionOption(id: "c", textEN: "Training robots with human help", textID: "Melatih robot dengan bantuan manusia"),
            QuestionOption(id: "d", textEN: "A feedback form for users", textID: "Formulir feedback untuk pengguna")
        ],
        correctOptionId: "a",
        explanationEN: "RLHF uses human rankings of model outputs to train a reward model, then optimizes the LLM to produce outputs that score high on this reward model.",
        explanationID: "RLHF menggunakan peringkat manusia dari output model untuk melatih reward model, lalu mengoptimalkan LLM untuk menghasilkan output yang mendapat skor tinggi pada reward model ini.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen009",
        questionEN: "What is instruction tuning?",
        questionID: "Apa itu instruction tuning?",
        options: [
            QuestionOption(id: "a", textEN: "Fine-tuning LLMs on instruction-following datasets to improve task completion", textID: "Fine-tuning LLM pada dataset instruction-following untuk meningkatkan penyelesaian tugas"),
            QuestionOption(id: "b", textEN: "Tuning musical instruments", textID: "Menyetel instrumen musik"),
            QuestionOption(id: "c", textEN: "Writing better instructions", textID: "Menulis instruksi yang lebih baik"),
            QuestionOption(id: "d", textEN: "Reading instruction manuals", textID: "Membaca manual instruksi")
        ],
        correctOptionId: "a",
        explanationEN: "Instruction tuning trains models on (instruction, response) pairs, teaching them to follow diverse instructions. It's key to making base LLMs useful assistants.",
        explanationID: "Instruction tuning melatih model pada pasangan (instruksi, respons), mengajarkan mereka untuk mengikuti instruksi beragam. Ini kunci untuk membuat LLM dasar menjadi asisten yang berguna.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen010",
        questionEN: "What is a system prompt?",
        questionID: "Apa itu system prompt?",
        options: [
            QuestionOption(id: "a", textEN: "Instructions that define the AI's behavior, role, and constraints", textID: "Instruksi yang mendefinisikan perilaku, peran, dan batasan AI"),
            QuestionOption(id: "b", textEN: "A prompt displayed by the operating system", textID: "Prompt yang ditampilkan oleh sistem operasi"),
            QuestionOption(id: "c", textEN: "An error message from the system", textID: "Pesan error dari sistem"),
            QuestionOption(id: "d", textEN: "The first message in a conversation", textID: "Pesan pertama dalam percakapan")
        ],
        correctOptionId: "a",
        explanationEN: "System prompts set the AI's persona, rules, and behavior guidelines. They're typically hidden from users and persist throughout the conversation.",
        explanationID: "System prompt mengatur persona, aturan, dan pedoman perilaku AI. Mereka biasanya tersembunyi dari pengguna dan bertahan sepanjang percakapan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),

    // Batch 2: Generative Image Models (10 questions)
    Question(
        id: "gen011",
        questionEN: "What is a Generative Adversarial Network (GAN)?",
        questionID: "Apa itu Generative Adversarial Network (GAN)?",
        options: [
            QuestionOption(id: "a", textEN: "Two networks (generator and discriminator) trained in competition to generate realistic data", textID: "Dua network (generator dan discriminator) yang dilatih dalam kompetisi untuk menghasilkan data realistis"),
            QuestionOption(id: "b", textEN: "A network for generating advertisements", textID: "Network untuk menghasilkan iklan"),
            QuestionOption(id: "c", textEN: "An adversarial attack on networks", textID: "Serangan adversarial pada network"),
            QuestionOption(id: "d", textEN: "A network with adversarial training only", textID: "Network dengan adversarial training saja")
        ],
        correctOptionId: "a",
        explanationEN: "GANs consist of a generator creating fake data and a discriminator trying to distinguish real from fake. They're trained adversarially until the generator fools the discriminator.",
        explanationID: "GAN terdiri dari generator yang membuat data palsu dan discriminator yang mencoba membedakan yang asli dari yang palsu. Mereka dilatih secara adversarial sampai generator menipu discriminator.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen012",
        questionEN: "What does the generator in a GAN do?",
        questionID: "Apa yang dilakukan generator dalam GAN?",
        options: [
            QuestionOption(id: "a", textEN: "Creates fake data from random noise to fool the discriminator", textID: "Membuat data palsu dari noise acak untuk menipu discriminator"),
            QuestionOption(id: "b", textEN: "Generates electricity for the model", textID: "Menghasilkan listrik untuk model"),
            QuestionOption(id: "c", textEN: "Classifies real vs fake data", textID: "Mengklasifikasikan data asli vs palsu"),
            QuestionOption(id: "d", textEN: "Stores training data", textID: "Menyimpan data training")
        ],
        correctOptionId: "a",
        explanationEN: "The generator takes random noise (latent vector) as input and transforms it into synthetic data (images, audio, etc.) that should look like real data.",
        explanationID: "Generator mengambil noise acak (latent vector) sebagai input dan mentransformasinya menjadi data sintetis (gambar, audio, dll.) yang seharusnya terlihat seperti data asli.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen013",
        questionEN: "What does the discriminator in a GAN do?",
        questionID: "Apa yang dilakukan discriminator dalam GAN?",
        options: [
            QuestionOption(id: "a", textEN: "Tries to distinguish between real and generated data", textID: "Mencoba membedakan antara data asli dan yang dihasilkan"),
            QuestionOption(id: "b", textEN: "Generates new data samples", textID: "Menghasilkan sampel data baru"),
            QuestionOption(id: "c", textEN: "Discriminates between different classes", textID: "Membedakan antara kelas yang berbeda"),
            QuestionOption(id: "d", textEN: "Encodes data to latent space", textID: "Mengenkode data ke latent space")
        ],
        correctOptionId: "a",
        explanationEN: "The discriminator is a classifier that learns to tell real data from fake generated data. It provides feedback to the generator to improve.",
        explanationID: "Discriminator adalah classifier yang belajar membedakan data asli dari data palsu yang dihasilkan. Ia memberikan feedback ke generator untuk meningkat.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen014",
        questionEN: "What is mode collapse in GANs?",
        questionID: "Apa itu mode collapse dalam GAN?",
        options: [
            QuestionOption(id: "a", textEN: "When the generator produces limited variety, generating only a few types of outputs", textID: "Ketika generator menghasilkan variasi terbatas, hanya menghasilkan beberapa jenis output"),
            QuestionOption(id: "b", textEN: "When the model crashes", textID: "Ketika model crash"),
            QuestionOption(id: "c", textEN: "When the discriminator becomes perfect", textID: "Ketika discriminator menjadi sempurna"),
            QuestionOption(id: "d", textEN: "When training takes too long", textID: "Ketika training terlalu lama")
        ],
        correctOptionId: "a",
        explanationEN: "Mode collapse happens when the generator finds a few outputs that consistently fool the discriminator and keeps producing only those, ignoring data diversity.",
        explanationID: "Mode collapse terjadi ketika generator menemukan beberapa output yang secara konsisten menipu discriminator dan terus menghasilkan hanya itu, mengabaikan keragaman data.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen015",
        questionEN: "What is a Variational Autoencoder (VAE)?",
        questionID: "Apa itu Variational Autoencoder (VAE)?",
        options: [
            QuestionOption(id: "a", textEN: "An autoencoder that learns a continuous latent space for generating new samples", textID: "Autoencoder yang mempelajari latent space kontinu untuk menghasilkan sampel baru"),
            QuestionOption(id: "b", textEN: "An encoder with variable length", textID: "Encoder dengan panjang variabel"),
            QuestionOption(id: "c", textEN: "A variable-speed autoencoder", textID: "Autoencoder kecepatan variabel"),
            QuestionOption(id: "d", textEN: "An autoencoder for videos", textID: "Autoencoder untuk video")
        ],
        correctOptionId: "a",
        explanationEN: "VAEs encode inputs to a latent distribution (not just a point), then sample from this distribution to decode. This enables smooth interpolation and generation.",
        explanationID: "VAE mengenkode input ke distribusi latent (bukan hanya titik), lalu melakukan sampling dari distribusi ini untuk mendecode. Ini memungkinkan interpolasi dan generasi yang mulus.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen016",
        questionEN: "What is a diffusion model?",
        questionID: "Apa itu diffusion model?",
        options: [
            QuestionOption(id: "a", textEN: "A generative model that learns to reverse a gradual noising process", textID: "Model generatif yang belajar membalik proses penambahan noise secara bertahap"),
            QuestionOption(id: "b", textEN: "A model for simulating heat diffusion", textID: "Model untuk mensimulasikan difusi panas"),
            QuestionOption(id: "c", textEN: "A model that spreads information across the network", textID: "Model yang menyebarkan informasi di seluruh network"),
            QuestionOption(id: "d", textEN: "A slow training method", textID: "Metode training lambat")
        ],
        correctOptionId: "a",
        explanationEN: "Diffusion models add noise to data step by step, then learn to reverse this process. At generation time, they start from pure noise and denoise to create images.",
        explanationID: "Diffusion model menambahkan noise ke data langkah demi langkah, lalu belajar membalik proses ini. Saat generasi, mereka mulai dari noise murni dan mengurangi noise untuk membuat gambar.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen017",
        questionEN: "What is Stable Diffusion?",
        questionID: "Apa itu Stable Diffusion?",
        options: [
            QuestionOption(id: "a", textEN: "A text-to-image diffusion model that works in latent space for efficiency", textID: "Model difusi text-to-image yang bekerja di latent space untuk efisiensi"),
            QuestionOption(id: "b", textEN: "A stable version of neural networks", textID: "Versi stabil dari neural networks"),
            QuestionOption(id: "c", textEN: "A diffusion model for chemistry", textID: "Model difusi untuk kimia"),
            QuestionOption(id: "d", textEN: "A model for predicting stock prices", textID: "Model untuk memprediksi harga saham")
        ],
        correctOptionId: "a",
        explanationEN: "Stable Diffusion (Stability AI) is a latent diffusion model that generates images from text prompts. It's open-source and can run on consumer hardware.",
        explanationID: "Stable Diffusion (Stability AI) adalah model latent diffusion yang menghasilkan gambar dari prompt teks. Ini open-source dan dapat berjalan di hardware konsumen.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen018",
        questionEN: "What is DALL-E?",
        questionID: "Apa itu DALL-E?",
        options: [
            QuestionOption(id: "a", textEN: "OpenAI's text-to-image model that creates images from natural language descriptions", textID: "Model text-to-image OpenAI yang membuat gambar dari deskripsi bahasa alami"),
            QuestionOption(id: "b", textEN: "A database of images", textID: "Database gambar"),
            QuestionOption(id: "c", textEN: "An image classification model", textID: "Model klasifikasi gambar"),
            QuestionOption(id: "d", textEN: "A robotic artist named Dali", textID: "Seniman robotik bernama Dali")
        ],
        correctOptionId: "a",
        explanationEN: "DALL-E (named after Dalí + WALL-E) generates images from text prompts. DALL-E 2 and 3 use diffusion models for high-quality image generation.",
        explanationID: "DALL-E (dinamai dari Dalí + WALL-E) menghasilkan gambar dari prompt teks. DALL-E 2 dan 3 menggunakan diffusion model untuk generasi gambar berkualitas tinggi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen019",
        questionEN: "What is image inpainting?",
        questionID: "Apa itu image inpainting?",
        options: [
            QuestionOption(id: "a", textEN: "Filling in missing or masked regions of an image with plausible content", textID: "Mengisi area yang hilang atau di-mask dari gambar dengan konten yang masuk akal"),
            QuestionOption(id: "b", textEN: "Painting images by hand", textID: "Melukis gambar dengan tangan"),
            QuestionOption(id: "c", textEN: "Adding paint effects to images", textID: "Menambahkan efek cat ke gambar"),
            QuestionOption(id: "d", textEN: "Converting images to paintings", textID: "Mengkonversi gambar menjadi lukisan")
        ],
        correctOptionId: "a",
        explanationEN: "Inpainting uses generative models to fill in selected areas of an image. Users can mask parts to remove or replace them with AI-generated content.",
        explanationID: "Inpainting menggunakan model generatif untuk mengisi area terpilih dari gambar. Pengguna dapat me-mask bagian untuk menghapus atau menggantinya dengan konten yang dihasilkan AI.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen020",
        questionEN: "What is img2img (image-to-image) generation?",
        questionID: "Apa itu img2img (image-to-image) generation?",
        options: [
            QuestionOption(id: "a", textEN: "Using an input image as a starting point for generating a modified version", textID: "Menggunakan gambar input sebagai titik awal untuk menghasilkan versi yang dimodifikasi"),
            QuestionOption(id: "b", textEN: "Copying images to another folder", textID: "Menyalin gambar ke folder lain"),
            QuestionOption(id: "c", textEN: "Converting image formats", textID: "Mengkonversi format gambar"),
            QuestionOption(id: "d", textEN: "Compressing images", textID: "Mengkompresi gambar")
        ],
        correctOptionId: "a",
        explanationEN: "Img2img takes an existing image and a text prompt, then generates a new image that combines elements of both, useful for style transfer and editing.",
        explanationID: "Img2img mengambil gambar yang ada dan prompt teks, lalu menghasilkan gambar baru yang menggabungkan elemen keduanya, berguna untuk style transfer dan editing.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 3: Multimodal & Retrieval (10 questions)
    Question(
        id: "gen021",
        questionEN: "What is a multimodal AI model?",
        questionID: "Apa itu model AI multimodal?",
        options: [
            QuestionOption(id: "a", textEN: "A model that can process and generate multiple types of data (text, images, audio)", textID: "Model yang dapat memproses dan menghasilkan beberapa jenis data (teks, gambar, audio)"),
            QuestionOption(id: "b", textEN: "A model with multiple training modes", textID: "Model dengan beberapa mode training"),
            QuestionOption(id: "c", textEN: "A model that runs on multiple devices", textID: "Model yang berjalan di beberapa perangkat"),
            QuestionOption(id: "d", textEN: "A model with multiple output layers", textID: "Model dengan beberapa layer output")
        ],
        correctOptionId: "a",
        explanationEN: "Multimodal models like GPT-4V can understand and generate across different modalities - text, images, audio, video - enabling rich cross-modal understanding.",
        explanationID: "Model multimodal seperti GPT-4V dapat memahami dan menghasilkan di berbagai modalitas - teks, gambar, audio, video - memungkinkan pemahaman cross-modal yang kaya.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen022",
        questionEN: "What is CLIP (Contrastive Language-Image Pre-training)?",
        questionID: "Apa itu CLIP (Contrastive Language-Image Pre-training)?",
        options: [
            QuestionOption(id: "a", textEN: "A model trained to associate images with text descriptions using contrastive learning", textID: "Model yang dilatih untuk mengasosiasikan gambar dengan deskripsi teks menggunakan contrastive learning"),
            QuestionOption(id: "b", textEN: "A video editing tool", textID: "Alat editing video"),
            QuestionOption(id: "c", textEN: "A model for clipping images", textID: "Model untuk memotong gambar"),
            QuestionOption(id: "d", textEN: "A clipboard manager", textID: "Manajer clipboard")
        ],
        correctOptionId: "a",
        explanationEN: "CLIP (OpenAI) learns joint embeddings of images and text. It can classify images using natural language descriptions without task-specific training.",
        explanationID: "CLIP (OpenAI) mempelajari embeddings gabungan dari gambar dan teks. Ia dapat mengklasifikasikan gambar menggunakan deskripsi bahasa alami tanpa training khusus tugas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen023",
        questionEN: "What is RAG (Retrieval-Augmented Generation)?",
        questionID: "Apa itu RAG (Retrieval-Augmented Generation)?",
        options: [
            QuestionOption(id: "a", textEN: "Combining LLMs with external knowledge retrieval to improve accuracy and reduce hallucination", textID: "Menggabungkan LLM dengan retrieval pengetahuan eksternal untuk meningkatkan akurasi dan mengurangi halusinasi"),
            QuestionOption(id: "b", textEN: "A type of cloth material", textID: "Jenis bahan kain"),
            QuestionOption(id: "c", textEN: "Randomly generated content", textID: "Konten yang dihasilkan secara acak"),
            QuestionOption(id: "d", textEN: "A garbage collection algorithm", textID: "Algoritma garbage collection")
        ],
        correctOptionId: "a",
        explanationEN: "RAG retrieves relevant documents from a knowledge base and includes them in the prompt, grounding the LLM's response in factual information.",
        explanationID: "RAG mengambil dokumen relevan dari knowledge base dan memasukkannya dalam prompt, mendasarkan respons LLM pada informasi faktual.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen024",
        questionEN: "What is an embedding in the context of RAG?",
        questionID: "Apa itu embedding dalam konteks RAG?",
        options: [
            QuestionOption(id: "a", textEN: "A vector representation of text used for semantic search and retrieval", textID: "Representasi vektor dari teks yang digunakan untuk pencarian dan retrieval semantik"),
            QuestionOption(id: "b", textEN: "A piece of code embedded in HTML", textID: "Potongan kode yang di-embed dalam HTML"),
            QuestionOption(id: "c", textEN: "An image placed inside text", textID: "Gambar yang ditempatkan di dalam teks"),
            QuestionOption(id: "d", textEN: "A file attachment", textID: "Lampiran file")
        ],
        correctOptionId: "a",
        explanationEN: "Embeddings convert text chunks into dense vectors that capture meaning. Similar texts have similar vectors, enabling semantic search for relevant documents.",
        explanationID: "Embeddings mengkonversi potongan teks menjadi vektor padat yang menangkap makna. Teks yang mirip memiliki vektor yang mirip, memungkinkan pencarian semantik untuk dokumen relevan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen025",
        questionEN: "What is a vector database?",
        questionID: "Apa itu vector database?",
        options: [
            QuestionOption(id: "a", textEN: "A database optimized for storing and searching high-dimensional vectors (embeddings)", textID: "Database yang dioptimalkan untuk menyimpan dan mencari vektor dimensi tinggi (embeddings)"),
            QuestionOption(id: "b", textEN: "A database of mathematical vectors", textID: "Database vektor matematika"),
            QuestionOption(id: "c", textEN: "A graphics database", textID: "Database grafis"),
            QuestionOption(id: "d", textEN: "A database with arrow icons", textID: "Database dengan ikon panah")
        ],
        correctOptionId: "a",
        explanationEN: "Vector databases like Pinecone, Weaviate, and ChromaDB efficiently store embeddings and enable fast similarity search for RAG applications.",
        explanationID: "Vector database seperti Pinecone, Weaviate, dan ChromaDB secara efisien menyimpan embeddings dan memungkinkan pencarian kesamaan cepat untuk aplikasi RAG.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen026",
        questionEN: "What is semantic search?",
        questionID: "Apa itu semantic search?",
        options: [
            QuestionOption(id: "a", textEN: "Search based on meaning similarity rather than keyword matching", textID: "Pencarian berdasarkan kesamaan makna daripada pencocokan kata kunci"),
            QuestionOption(id: "b", textEN: "Searching for semantic errors", textID: "Mencari error semantik"),
            QuestionOption(id: "c", textEN: "A search engine for semantics", textID: "Mesin pencari untuk semantik"),
            QuestionOption(id: "d", textEN: "Keyword-based search", textID: "Pencarian berbasis kata kunci")
        ],
        correctOptionId: "a",
        explanationEN: "Semantic search uses embeddings to find content that's conceptually similar to the query, even without exact keyword matches. 'car repair' finds 'automotive maintenance'.",
        explanationID: "Semantic search menggunakan embeddings untuk menemukan konten yang secara konseptual mirip dengan query, bahkan tanpa kecocokan kata kunci persis. 'car repair' menemukan 'automotive maintenance'.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen027",
        questionEN: "What is chunking in RAG systems?",
        questionID: "Apa itu chunking dalam sistem RAG?",
        options: [
            QuestionOption(id: "a", textEN: "Splitting documents into smaller pieces for embedding and retrieval", textID: "Memecah dokumen menjadi potongan lebih kecil untuk embedding dan retrieval"),
            QuestionOption(id: "b", textEN: "Deleting chunks of data", textID: "Menghapus potongan data"),
            QuestionOption(id: "c", textEN: "Combining documents together", textID: "Menggabungkan dokumen bersama"),
            QuestionOption(id: "d", textEN: "Compressing documents", textID: "Mengkompresi dokumen")
        ],
        correctOptionId: "a",
        explanationEN: "Chunking divides documents into smaller segments that fit embedding model limits and improve retrieval precision. Strategies include fixed-size, sentence-based, or semantic splitting.",
        explanationID: "Chunking membagi dokumen menjadi segmen lebih kecil yang sesuai dengan batas model embedding dan meningkatkan presisi retrieval. Strategi termasuk ukuran tetap, berbasis kalimat, atau pemisahan semantik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen028",
        questionEN: "What is a vision-language model?",
        questionID: "Apa itu vision-language model?",
        options: [
            QuestionOption(id: "a", textEN: "A model that can understand and reason about both images and text together", textID: "Model yang dapat memahami dan bernalar tentang gambar dan teks bersama"),
            QuestionOption(id: "b", textEN: "A model for visually impaired users", textID: "Model untuk pengguna tunanetra"),
            QuestionOption(id: "c", textEN: "A model that generates captions only", textID: "Model yang hanya menghasilkan caption"),
            QuestionOption(id: "d", textEN: "A translation model for sign language", textID: "Model penerjemahan untuk bahasa isyarat")
        ],
        correctOptionId: "a",
        explanationEN: "Vision-language models like GPT-4V and Claude can analyze images, answer questions about them, and reason across visual and textual information.",
        explanationID: "Vision-language model seperti GPT-4V dan Claude dapat menganalisis gambar, menjawab pertanyaan tentangnya, dan bernalar di seluruh informasi visual dan tekstual.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen029",
        questionEN: "What is function calling (tool use) in LLMs?",
        questionID: "Apa itu function calling (tool use) dalam LLM?",
        options: [
            QuestionOption(id: "a", textEN: "LLMs generating structured calls to external APIs or functions based on user requests", textID: "LLM menghasilkan panggilan terstruktur ke API atau fungsi eksternal berdasarkan permintaan pengguna"),
            QuestionOption(id: "b", textEN: "Calling functions in Python", textID: "Memanggil fungsi di Python"),
            QuestionOption(id: "c", textEN: "Using a phone to call support", textID: "Menggunakan telepon untuk menghubungi support"),
            QuestionOption(id: "d", textEN: "Scheduling function appointments", textID: "Menjadwalkan janji fungsi")
        ],
        correctOptionId: "a",
        explanationEN: "Function calling allows LLMs to output structured requests to external tools (search, calculator, APIs), then incorporate the results into their responses.",
        explanationID: "Function calling memungkinkan LLM mengoutput permintaan terstruktur ke alat eksternal (pencarian, kalkulator, API), lalu memasukkan hasilnya ke dalam respons mereka.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen030",
        questionEN: "What is an AI agent?",
        questionID: "Apa itu AI agent?",
        options: [
            QuestionOption(id: "a", textEN: "An AI system that can plan and execute multi-step tasks autonomously using tools", textID: "Sistem AI yang dapat merencanakan dan mengeksekusi tugas multi-langkah secara otonom menggunakan alat"),
            QuestionOption(id: "b", textEN: "A person who sells AI products", textID: "Orang yang menjual produk AI"),
            QuestionOption(id: "c", textEN: "An AI customer service chatbot only", textID: "Chatbot layanan pelanggan AI saja"),
            QuestionOption(id: "d", textEN: "A robot that looks like a human", textID: "Robot yang terlihat seperti manusia")
        ],
        correctOptionId: "a",
        explanationEN: "AI agents are LLM-powered systems that can break down goals into steps, use tools, browse the web, write code, and take actions to accomplish complex tasks.",
        explanationID: "AI agent adalah sistem bertenaga LLM yang dapat memecah tujuan menjadi langkah, menggunakan alat, menjelajah web, menulis kode, dan mengambil tindakan untuk menyelesaikan tugas kompleks.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),

    // Batch 4: Safety & Ethics (10 questions)
    Question(
        id: "gen031",
        questionEN: "What is AI alignment?",
        questionID: "Apa itu AI alignment?",
        options: [
            QuestionOption(id: "a", textEN: "Ensuring AI systems behave according to human values and intentions", textID: "Memastikan sistem AI berperilaku sesuai dengan nilai dan niat manusia"),
            QuestionOption(id: "b", textEN: "Aligning text in documents", textID: "Menyelaraskan teks dalam dokumen"),
            QuestionOption(id: "c", textEN: "Positioning AI hardware correctly", textID: "Memposisikan hardware AI dengan benar"),
            QuestionOption(id: "d", textEN: "Organizing AI research teams", textID: "Mengorganisir tim penelitian AI")
        ],
        correctOptionId: "a",
        explanationEN: "AI alignment research focuses on making AI systems understand and follow human intentions, avoid harmful behaviors, and remain under human control.",
        explanationID: "Penelitian AI alignment fokus pada membuat sistem AI memahami dan mengikuti niat manusia, menghindari perilaku berbahaya, dan tetap di bawah kontrol manusia.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen032",
        questionEN: "What is a jailbreak in the context of LLMs?",
        questionID: "Apa itu jailbreak dalam konteks LLM?",
        options: [
            QuestionOption(id: "a", textEN: "Prompt techniques that try to bypass the model's safety guidelines", textID: "Teknik prompt yang mencoba melewati pedoman keamanan model"),
            QuestionOption(id: "b", textEN: "Breaking out of a virtual prison game", textID: "Keluar dari game penjara virtual"),
            QuestionOption(id: "c", textEN: "Removing software restrictions on phones", textID: "Menghapus batasan software pada telepon"),
            QuestionOption(id: "d", textEN: "A security vulnerability in hardware", textID: "Kerentanan keamanan dalam hardware")
        ],
        correctOptionId: "a",
        explanationEN: "Jailbreaks are adversarial prompts designed to make LLMs ignore their safety training and produce harmful, unethical, or restricted content.",
        explanationID: "Jailbreak adalah prompt adversarial yang dirancang untuk membuat LLM mengabaikan training keamanan mereka dan menghasilkan konten berbahaya, tidak etis, atau terbatas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen033",
        questionEN: "What is prompt injection?",
        questionID: "Apa itu prompt injection?",
        options: [
            QuestionOption(id: "a", textEN: "Malicious input that hijacks an LLM's instructions through user-provided content", textID: "Input berbahaya yang membajak instruksi LLM melalui konten yang disediakan pengguna"),
            QuestionOption(id: "b", textEN: "Adding prompts to a database", textID: "Menambahkan prompt ke database"),
            QuestionOption(id: "c", textEN: "Injecting medicine through a prompt", textID: "Menyuntikkan obat melalui prompt"),
            QuestionOption(id: "d", textEN: "A type of SQL injection", textID: "Jenis SQL injection")
        ],
        correctOptionId: "a",
        explanationEN: "Prompt injection attacks embed instructions in user input that override the system prompt, potentially causing the LLM to ignore its guidelines or leak information.",
        explanationID: "Serangan prompt injection menyematkan instruksi dalam input pengguna yang menimpa system prompt, berpotensi menyebabkan LLM mengabaikan pedomannya atau membocorkan informasi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen034",
        questionEN: "What is bias in AI systems?",
        questionID: "Apa itu bias dalam sistem AI?",
        options: [
            QuestionOption(id: "a", textEN: "Systematic errors that lead to unfair outcomes for certain groups", textID: "Error sistematis yang menyebabkan hasil tidak adil untuk kelompok tertentu"),
            QuestionOption(id: "b", textEN: "A model's preference for certain inputs", textID: "Preferensi model untuk input tertentu"),
            QuestionOption(id: "c", textEN: "The angle of a neural network", textID: "Sudut neural network"),
            QuestionOption(id: "d", textEN: "A training technique", textID: "Teknik training")
        ],
        correctOptionId: "a",
        explanationEN: "AI bias can reflect and amplify societal biases present in training data, leading to discrimination based on race, gender, or other protected characteristics.",
        explanationID: "Bias AI dapat mencerminkan dan memperkuat bias masyarakat yang ada dalam data training, menyebabkan diskriminasi berdasarkan ras, gender, atau karakteristik yang dilindungi lainnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen035",
        questionEN: "What is deepfake?",
        questionID: "Apa itu deepfake?",
        options: [
            QuestionOption(id: "a", textEN: "AI-generated synthetic media that realistically depicts people doing/saying things they didn't", textID: "Media sintetis yang dihasilkan AI yang secara realistis menggambarkan orang melakukan/mengatakan hal yang tidak mereka lakukan"),
            QuestionOption(id: "b", textEN: "A very deep neural network", textID: "Neural network yang sangat dalam"),
            QuestionOption(id: "c", textEN: "Fake news about AI", textID: "Berita palsu tentang AI"),
            QuestionOption(id: "d", textEN: "A type of phishing attack", textID: "Jenis serangan phishing")
        ],
        correctOptionId: "a",
        explanationEN: "Deepfakes use AI (often GANs or diffusion models) to create convincing fake videos or audio of real people, raising concerns about misinformation and fraud.",
        explanationID: "Deepfake menggunakan AI (sering GAN atau diffusion model) untuk membuat video atau audio palsu yang meyakinkan dari orang nyata, menimbulkan kekhawatiran tentang misinformasi dan penipuan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen036",
        questionEN: "What is responsible AI?",
        questionID: "Apa itu responsible AI?",
        options: [
            QuestionOption(id: "a", textEN: "Developing and deploying AI systems that are fair, transparent, accountable, and safe", textID: "Mengembangkan dan menerapkan sistem AI yang adil, transparan, akuntabel, dan aman"),
            QuestionOption(id: "b", textEN: "AI that takes responsibility for its actions", textID: "AI yang bertanggung jawab atas tindakannya"),
            QuestionOption(id: "c", textEN: "AI that responds quickly", textID: "AI yang merespons dengan cepat"),
            QuestionOption(id: "d", textEN: "AI with limited capabilities", textID: "AI dengan kemampuan terbatas")
        ],
        correctOptionId: "a",
        explanationEN: "Responsible AI encompasses ethical practices including fairness, transparency, privacy protection, accountability, and ensuring AI benefits humanity while minimizing harm.",
        explanationID: "Responsible AI mencakup praktik etis termasuk keadilan, transparansi, perlindungan privasi, akuntabilitas, dan memastikan AI bermanfaat bagi umat manusia sambil meminimalkan bahaya.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen037",
        questionEN: "What is explainability (interpretability) in AI?",
        questionID: "Apa itu explainability (interpretability) dalam AI?",
        options: [
            QuestionOption(id: "a", textEN: "The ability to understand why an AI system made a particular decision", textID: "Kemampuan untuk memahami mengapa sistem AI membuat keputusan tertentu"),
            QuestionOption(id: "b", textEN: "The AI explaining itself to users", textID: "AI menjelaskan dirinya kepada pengguna"),
            QuestionOption(id: "c", textEN: "Making AI documentation clear", textID: "Membuat dokumentasi AI jelas"),
            QuestionOption(id: "d", textEN: "Training AI to give explanations", textID: "Melatih AI untuk memberikan penjelasan")
        ],
        correctOptionId: "a",
        explanationEN: "Explainable AI (XAI) techniques help humans understand model reasoning, which is crucial for trust, debugging, and ensuring fair decision-making in high-stakes domains.",
        explanationID: "Teknik Explainable AI (XAI) membantu manusia memahami penalaran model, yang penting untuk kepercayaan, debugging, dan memastikan pengambilan keputusan yang adil dalam domain berisiko tinggi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen038",
        questionEN: "What is data privacy in AI?",
        questionID: "Apa itu data privacy dalam AI?",
        options: [
            QuestionOption(id: "a", textEN: "Protecting personal information used in training or inference from unauthorized access", textID: "Melindungi informasi pribadi yang digunakan dalam training atau inference dari akses tidak sah"),
            QuestionOption(id: "b", textEN: "Keeping AI models secret", textID: "Menjaga model AI tetap rahasia"),
            QuestionOption(id: "c", textEN: "Hiding AI from users", textID: "Menyembunyikan AI dari pengguna"),
            QuestionOption(id: "d", textEN: "Private AI training", textID: "Training AI pribadi")
        ],
        correctOptionId: "a",
        explanationEN: "Data privacy concerns include training data containing PII, models memorizing sensitive information, and protecting user interactions from exposure.",
        explanationID: "Kekhawatiran privasi data termasuk data training yang berisi PII, model yang menghafalkan informasi sensitif, dan melindungi interaksi pengguna dari paparan.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen039",
        questionEN: "What is model watermarking?",
        questionID: "Apa itu model watermarking?",
        options: [
            QuestionOption(id: "a", textEN: "Embedding hidden markers in AI outputs to identify their synthetic origin", textID: "Menyematkan penanda tersembunyi dalam output AI untuk mengidentifikasi asal sintetisnya"),
            QuestionOption(id: "b", textEN: "Adding water effects to images", textID: "Menambahkan efek air ke gambar"),
            QuestionOption(id: "c", textEN: "Protecting models from water damage", textID: "Melindungi model dari kerusakan air"),
            QuestionOption(id: "d", textEN: "A cooling technique for GPUs", textID: "Teknik pendinginan untuk GPU")
        ],
        correctOptionId: "a",
        explanationEN: "Watermarking embeds detectable patterns in AI-generated content (text, images) to help identify synthetic media and trace its origin.",
        explanationID: "Watermarking menyematkan pola yang dapat dideteksi dalam konten yang dihasilkan AI (teks, gambar) untuk membantu mengidentifikasi media sintetis dan melacak asalnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen040",
        questionEN: "What is constitutional AI?",
        questionID: "Apa itu constitutional AI?",
        options: [
            QuestionOption(id: "a", textEN: "Training AI to follow a set of principles (constitution) for self-improvement and safety", textID: "Melatih AI untuk mengikuti seperangkat prinsip (konstitusi) untuk peningkatan diri dan keamanan"),
            QuestionOption(id: "b", textEN: "AI that follows legal constitutions", textID: "AI yang mengikuti konstitusi hukum"),
            QuestionOption(id: "c", textEN: "Government-regulated AI", textID: "AI yang diatur pemerintah"),
            QuestionOption(id: "d", textEN: "AI for legal document analysis", textID: "AI untuk analisis dokumen hukum")
        ],
        correctOptionId: "a",
        explanationEN: "Constitutional AI (Anthropic) trains models to evaluate and revise their own outputs based on a set of principles, reducing reliance on human feedback for safety.",
        explanationID: "Constitutional AI (Anthropic) melatih model untuk mengevaluasi dan merevisi output mereka sendiri berdasarkan seperangkat prinsip, mengurangi ketergantungan pada feedback manusia untuk keamanan.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // Batch 5: Practical Applications & Future (10 questions)
    Question(
        id: "gen041",
        questionEN: "What is fine-tuning vs prompting for customizing LLM behavior?",
        questionID: "Apa perbedaan fine-tuning vs prompting untuk menyesuaikan perilaku LLM?",
        options: [
            QuestionOption(id: "a", textEN: "Fine-tuning updates model weights; prompting only changes the input", textID: "Fine-tuning memperbarui bobot model; prompting hanya mengubah input"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Mereka adalah hal yang sama"),
            QuestionOption(id: "c", textEN: "Prompting is more permanent", textID: "Prompting lebih permanen"),
            QuestionOption(id: "d", textEN: "Fine-tuning is always better", textID: "Fine-tuning selalu lebih baik")
        ],
        correctOptionId: "a",
        explanationEN: "Prompting customizes behavior at inference time without changing the model. Fine-tuning trains the model on new data, permanently updating its weights.",
        explanationID: "Prompting menyesuaikan perilaku saat inference tanpa mengubah model. Fine-tuning melatih model pada data baru, secara permanen memperbarui bobotnya.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen042",
        questionEN: "What is LoRA (Low-Rank Adaptation)?",
        questionID: "Apa itu LoRA (Low-Rank Adaptation)?",
        options: [
            QuestionOption(id: "a", textEN: "An efficient fine-tuning method that trains small adapter layers instead of the full model", textID: "Metode fine-tuning efisien yang melatih layer adapter kecil daripada model penuh"),
            QuestionOption(id: "b", textEN: "A new language model", textID: "Model bahasa baru"),
            QuestionOption(id: "c", textEN: "A radio communication protocol", textID: "Protokol komunikasi radio"),
            QuestionOption(id: "d", textEN: "A compression algorithm", textID: "Algoritma kompresi")
        ],
        correctOptionId: "a",
        explanationEN: "LoRA freezes the original model and trains small low-rank matrices that modify the model's behavior. It's memory-efficient and enables multiple task-specific adapters.",
        explanationID: "LoRA membekukan model asli dan melatih matriks low-rank kecil yang memodifikasi perilaku model. Ini efisien memori dan memungkinkan beberapa adapter khusus tugas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "gen043",
        questionEN: "What is quantization in the context of LLMs?",
        questionID: "Apa itu quantization dalam konteks LLM?",
        options: [
            QuestionOption(id: "a", textEN: "Reducing model precision (e.g., 32-bit to 4-bit) to decrease size and increase speed", textID: "Mengurangi presisi model (misal 32-bit ke 4-bit) untuk mengurangi ukuran dan meningkatkan kecepatan"),
            QuestionOption(id: "b", textEN: "Counting the number of parameters", textID: "Menghitung jumlah parameter"),
            QuestionOption(id: "c", textEN: "Measuring model quality", textID: "Mengukur kualitas model"),
            QuestionOption(id: "d", textEN: "Dividing the model into parts", textID: "Membagi model menjadi bagian")
        ],
        correctOptionId: "a",
        explanationEN: "Quantization reduces the precision of model weights (from float32 to int8 or int4), dramatically reducing memory and compute requirements with minimal quality loss.",
        explanationID: "Quantization mengurangi presisi bobot model (dari float32 ke int8 atau int4), secara dramatis mengurangi kebutuhan memori dan komputasi dengan kehilangan kualitas minimal.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen044",
        questionEN: "What is chain-of-thought (CoT) prompting?",
        questionID: "Apa itu chain-of-thought (CoT) prompting?",
        options: [
            QuestionOption(id: "a", textEN: "Encouraging the model to show step-by-step reasoning before giving the final answer", textID: "Mendorong model untuk menunjukkan penalaran langkah demi langkah sebelum memberikan jawaban akhir"),
            QuestionOption(id: "b", textEN: "Linking multiple prompts together", textID: "Menghubungkan beberapa prompt bersama"),
            QuestionOption(id: "c", textEN: "A type of blockchain", textID: "Jenis blockchain"),
            QuestionOption(id: "d", textEN: "Thinking about chains", textID: "Berpikir tentang rantai")
        ],
        correctOptionId: "a",
        explanationEN: "CoT prompting (e.g., \"Let's think step by step\") improves reasoning performance by having the model explicitly work through the problem before answering.",
        explanationID: "CoT prompting (misal \"Let's think step by step\") meningkatkan performa penalaran dengan membuat model secara eksplisit mengerjakan masalah sebelum menjawab.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen045",
        questionEN: "What is text-to-speech (TTS) using AI?",
        questionID: "Apa itu text-to-speech (TTS) menggunakan AI?",
        options: [
            QuestionOption(id: "a", textEN: "Converting written text into natural-sounding spoken audio using neural networks", textID: "Mengkonversi teks tertulis menjadi audio yang terdengar alami menggunakan neural networks"),
            QuestionOption(id: "b", textEN: "Typing while speaking", textID: "Mengetik sambil berbicara"),
            QuestionOption(id: "c", textEN: "Translating speech to text", textID: "Menerjemahkan suara ke teks"),
            QuestionOption(id: "d", textEN: "Recording voice messages", textID: "Merekam pesan suara")
        ],
        correctOptionId: "a",
        explanationEN: "Modern TTS systems like ElevenLabs and OpenAI's TTS use deep learning to generate highly realistic speech with controllable voice, emotion, and style.",
        explanationID: "Sistem TTS modern seperti ElevenLabs dan TTS OpenAI menggunakan deep learning untuk menghasilkan suara yang sangat realistis dengan suara, emosi, dan gaya yang dapat dikontrol.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen046",
        questionEN: "What is speech-to-text (STT) or automatic speech recognition (ASR)?",
        questionID: "Apa itu speech-to-text (STT) atau automatic speech recognition (ASR)?",
        options: [
            QuestionOption(id: "a", textEN: "Converting spoken audio into written text using AI models", textID: "Mengkonversi audio yang diucapkan menjadi teks tertulis menggunakan model AI"),
            QuestionOption(id: "b", textEN: "Reading text out loud", textID: "Membaca teks dengan keras"),
            QuestionOption(id: "c", textEN: "Recording audio files", textID: "Merekam file audio"),
            QuestionOption(id: "d", textEN: "Translating between languages", textID: "Menerjemahkan antar bahasa")
        ],
        correctOptionId: "a",
        explanationEN: "ASR systems like Whisper (OpenAI) transcribe audio to text with high accuracy across languages and accents, enabling voice interfaces and transcription.",
        explanationID: "Sistem ASR seperti Whisper (OpenAI) mentranskripsikan audio ke teks dengan akurasi tinggi di berbagai bahasa dan aksen, memungkinkan antarmuka suara dan transkripsi.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen047",
        questionEN: "What is code generation AI?",
        questionID: "Apa itu AI code generation?",
        options: [
            QuestionOption(id: "a", textEN: "AI systems that can write, complete, and explain programming code", textID: "Sistem AI yang dapat menulis, melengkapi, dan menjelaskan kode pemrograman"),
            QuestionOption(id: "b", textEN: "Generating QR codes", textID: "Menghasilkan kode QR"),
            QuestionOption(id: "c", textEN: "Creating barcodes", textID: "Membuat barcode"),
            QuestionOption(id: "d", textEN: "Encoding data for transmission", textID: "Mengenkode data untuk transmisi")
        ],
        correctOptionId: "a",
        explanationEN: "Code generation models like GitHub Copilot, Claude, and GPT can write code from natural language, complete partially written code, explain code, and fix bugs.",
        explanationID: "Model code generation seperti GitHub Copilot, Claude, dan GPT dapat menulis kode dari bahasa alami, melengkapi kode yang ditulis sebagian, menjelaskan kode, dan memperbaiki bug.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen048",
        questionEN: "What is model distillation?",
        questionID: "Apa itu model distillation?",
        options: [
            QuestionOption(id: "a", textEN: "Training a smaller model to mimic a larger model's behavior", textID: "Melatih model lebih kecil untuk meniru perilaku model lebih besar"),
            QuestionOption(id: "b", textEN: "Purifying water in a data center", textID: "Memurnikan air di data center"),
            QuestionOption(id: "c", textEN: "Removing parts of a model", textID: "Menghapus bagian dari model"),
            QuestionOption(id: "d", textEN: "Combining multiple models", textID: "Menggabungkan beberapa model")
        ],
        correctOptionId: "a",
        explanationEN: "Knowledge distillation trains a smaller 'student' model to reproduce the outputs of a larger 'teacher' model, creating efficient models that retain much of the teacher's capability.",
        explanationID: "Knowledge distillation melatih model 'student' yang lebih kecil untuk mereproduksi output dari model 'teacher' yang lebih besar, membuat model efisien yang mempertahankan banyak kemampuan teacher.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "gen049",
        questionEN: "What is AGI (Artificial General Intelligence)?",
        questionID: "Apa itu AGI (Artificial General Intelligence)?",
        options: [
            QuestionOption(id: "a", textEN: "Hypothetical AI with human-level ability to learn and perform any intellectual task", textID: "AI hipotetis dengan kemampuan level manusia untuk belajar dan melakukan tugas intelektual apapun"),
            QuestionOption(id: "b", textEN: "The most advanced current AI system", textID: "Sistem AI paling canggih saat ini"),
            QuestionOption(id: "c", textEN: "AI for general users", textID: "AI untuk pengguna umum"),
            QuestionOption(id: "d", textEN: "A government AI initiative", textID: "Inisiatif AI pemerintah")
        ],
        correctOptionId: "a",
        explanationEN: "AGI refers to AI that can understand, learn, and apply knowledge across any domain like humans, as opposed to current 'narrow AI' that excels at specific tasks.",
        explanationID: "AGI merujuk pada AI yang dapat memahami, belajar, dan menerapkan pengetahuan di domain apapun seperti manusia, berbeda dengan 'narrow AI' saat ini yang unggul dalam tugas spesifik.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "gen050",
        questionEN: "What are foundation models?",
        questionID: "Apa itu foundation models?",
        options: [
            QuestionOption(id: "a", textEN: "Large pre-trained models that can be adapted to many downstream tasks", textID: "Model pre-trained besar yang dapat diadaptasi ke banyak tugas downstream"),
            QuestionOption(id: "b", textEN: "Models that form the foundation of buildings", textID: "Model yang membentuk fondasi bangunan"),
            QuestionOption(id: "c", textEN: "The first AI models ever created", textID: "Model AI pertama yang pernah dibuat"),
            QuestionOption(id: "d", textEN: "Simple baseline models", textID: "Model baseline sederhana")
        ],
        correctOptionId: "a",
        explanationEN: "Foundation models (like GPT-4, Claude, DALL-E) are trained on broad data and can be adapted via fine-tuning or prompting to many specific applications.",
        explanationID: "Foundation model (seperti GPT-4, Claude, DALL-E) dilatih pada data luas dan dapat diadaptasi melalui fine-tuning atau prompting ke banyak aplikasi spesifik.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
