import Foundation

// MARK: - Problem Solving: System Design Questions (50 questions)
// Topics: ML System Design, Data Pipelines, Scalability, Architecture Patterns, Model Deployment

let systemDesignQuestions: [Question] = [
    // MARK: - ML System Design (15 questions)
    Question(
        id: "sys001",
        questionEN: "What is the typical order of components in an ML pipeline?",
        questionID: "Apa urutan tipikal komponen dalam ML pipeline?",
        options: [
            QuestionOption(id: "a", textEN: "Model → Data → Training → Deployment", textID: "Model → Data → Training → Deployment"),
            QuestionOption(id: "b", textEN: "Data Collection → Preprocessing → Training → Evaluation → Deployment", textID: "Data Collection → Preprocessing → Training → Evaluation → Deployment"),
            QuestionOption(id: "c", textEN: "Deployment → Training → Data → Evaluation", textID: "Deployment → Training → Data → Evaluation"),
            QuestionOption(id: "d", textEN: "Training → Data → Model → Testing", textID: "Training → Data → Model → Testing")
        ],
        correctOptionId: "b",
        explanationEN: "ML pipelines follow: data collection → preprocessing/cleaning → feature engineering → model training → evaluation → deployment. Each stage feeds into the next.",
        explanationID: "ML pipeline mengikuti: data collection → preprocessing/cleaning → feature engineering → model training → evaluation → deployment. Setiap tahap mengalir ke tahap berikutnya.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys002",
        questionEN: "What is feature store in ML system design?",
        questionID: "Apa itu feature store dalam desain sistem ML?",
        options: [
            QuestionOption(id: "a", textEN: "A database for storing model weights", textID: "Database untuk menyimpan bobot model"),
            QuestionOption(id: "b", textEN: "A centralized repository for storing and serving ML features", textID: "Repositori terpusat untuk menyimpan dan menyajikan fitur ML"),
            QuestionOption(id: "c", textEN: "A shop for buying ML models", textID: "Toko untuk membeli model ML"),
            QuestionOption(id: "d", textEN: "A version control system", textID: "Sistem version control")
        ],
        correctOptionId: "b",
        explanationEN: "Feature store centralizes feature definitions, ensures consistency between training and serving, enables feature reuse across models, and provides versioning and lineage tracking.",
        explanationID: "Feature store memusatkan definisi fitur, memastikan konsistensi antara training dan serving, memungkinkan penggunaan ulang fitur antar model, dan menyediakan versioning dan lineage tracking.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys003",
        questionEN: "What is the purpose of A/B testing in ML deployment?",
        questionID: "Apa tujuan A/B testing dalam deployment ML?",
        options: [
            QuestionOption(id: "a", textEN: "To test model accuracy on validation set", textID: "Untuk menguji akurasi model pada validation set"),
            QuestionOption(id: "b", textEN: "To compare new model performance against current model with real users", textID: "Untuk membandingkan performa model baru dengan model saat ini dengan pengguna nyata"),
            QuestionOption(id: "c", textEN: "To train two models simultaneously", textID: "Untuk melatih dua model secara bersamaan"),
            QuestionOption(id: "d", textEN: "To backup model checkpoints", textID: "Untuk backup checkpoint model")
        ],
        correctOptionId: "b",
        explanationEN: "A/B testing routes portion of traffic to new model (B) while keeping current model (A). This measures real-world impact on metrics before full rollout.",
        explanationID: "A/B testing mengarahkan sebagian traffic ke model baru (B) sambil mempertahankan model saat ini (A). Ini mengukur dampak dunia nyata pada metrik sebelum rollout penuh.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys004",
        questionEN: "What is model serving latency and why does it matter?",
        questionID: "Apa itu model serving latency dan mengapa itu penting?",
        options: [
            QuestionOption(id: "a", textEN: "Time to train the model - affects cost", textID: "Waktu untuk melatih model - mempengaruhi biaya"),
            QuestionOption(id: "b", textEN: "Time from receiving request to returning prediction - affects user experience", textID: "Waktu dari menerima request sampai mengembalikan prediksi - mempengaruhi pengalaman pengguna"),
            QuestionOption(id: "c", textEN: "Time to deploy model - affects release cycle", textID: "Waktu untuk deploy model - mempengaruhi siklus rilis"),
            QuestionOption(id: "d", textEN: "Time between retraining - affects freshness", textID: "Waktu antara retraining - mempengaruhi kesegaran")
        ],
        correctOptionId: "b",
        explanationEN: "Serving latency is end-to-end prediction time. High latency degrades user experience (e.g., recommendation should be <100ms). Trade-offs include model complexity, batch size, and hardware.",
        explanationID: "Serving latency adalah waktu prediksi end-to-end. Latency tinggi menurunkan pengalaman pengguna (misalnya, rekomendasi harus <100ms). Trade-off termasuk kompleksitas model, batch size, dan hardware.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys005",
        questionEN: "What is data drift in ML systems?",
        questionID: "Apa itu data drift dalam sistem ML?",
        options: [
            QuestionOption(id: "a", textEN: "Data loss during transmission", textID: "Kehilangan data saat transmisi"),
            QuestionOption(id: "b", textEN: "Change in input data distribution over time", textID: "Perubahan distribusi data input dari waktu ke waktu"),
            QuestionOption(id: "c", textEN: "Moving data to different storage", textID: "Memindahkan data ke penyimpanan berbeda"),
            QuestionOption(id: "d", textEN: "Incorrect data labeling", textID: "Pelabelan data yang salah")
        ],
        correctOptionId: "b",
        explanationEN: "Data drift occurs when production data distribution differs from training data. This causes model performance degradation. Monitoring and retraining strategies are needed to address it.",
        explanationID: "Data drift terjadi saat distribusi data produksi berbeda dari data training. Ini menyebabkan degradasi performa model. Strategi monitoring dan retraining diperlukan untuk mengatasinya.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys006",
        questionEN: "What is the difference between batch and real-time inference?",
        questionID: "Apa perbedaan antara batch dan real-time inference?",
        options: [
            QuestionOption(id: "a", textEN: "Batch is faster, real-time is slower", textID: "Batch lebih cepat, real-time lebih lambat"),
            QuestionOption(id: "b", textEN: "Batch processes many inputs at once offline, real-time responds to individual requests immediately", textID: "Batch memproses banyak input sekaligus offline, real-time merespon request individual segera"),
            QuestionOption(id: "c", textEN: "They are the same thing", textID: "Keduanya hal yang sama"),
            QuestionOption(id: "d", textEN: "Batch is for training, real-time is for testing", textID: "Batch untuk training, real-time untuk testing")
        ],
        correctOptionId: "b",
        explanationEN: "Batch inference runs periodically on accumulated data (e.g., nightly recommendations). Real-time serves individual predictions immediately (e.g., fraud detection). Different infrastructure needs.",
        explanationID: "Batch inference berjalan periodik pada data terakumulasi (misalnya, rekomendasi malam hari). Real-time menyajikan prediksi individual segera (misalnya, deteksi fraud). Kebutuhan infrastruktur berbeda.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys007",
        questionEN: "What is model versioning and why is it important?",
        questionID: "Apa itu model versioning dan mengapa itu penting?",
        options: [
            QuestionOption(id: "a", textEN: "Tracking different versions of models for reproducibility and rollback", textID: "Melacak versi berbeda dari model untuk reproducibility dan rollback"),
            QuestionOption(id: "b", textEN: "Counting how many models exist", textID: "Menghitung berapa banyak model yang ada"),
            QuestionOption(id: "c", textEN: "Naming models with numbers", textID: "Memberi nama model dengan angka"),
            QuestionOption(id: "d", textEN: "Updating model weights", textID: "Memperbarui bobot model")
        ],
        correctOptionId: "a",
        explanationEN: "Model versioning tracks model artifacts, hyperparameters, training data, and code. It enables reproducibility, comparison between versions, and safe rollback if new model underperforms.",
        explanationID: "Model versioning melacak artifact model, hyperparameter, data training, dan kode. Ini memungkinkan reproducibility, perbandingan antar versi, dan rollback aman jika model baru berkinerja buruk.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys008",
        questionEN: "What is the purpose of a model registry?",
        questionID: "Apa tujuan dari model registry?",
        options: [
            QuestionOption(id: "a", textEN: "To store raw training data", textID: "Untuk menyimpan data training mentah"),
            QuestionOption(id: "b", textEN: "Central repository to manage model lifecycle, versions, and metadata", textID: "Repositori pusat untuk mengelola siklus hidup model, versi, dan metadata"),
            QuestionOption(id: "c", textEN: "To register new ML engineers", textID: "Untuk mendaftarkan ML engineer baru"),
            QuestionOption(id: "d", textEN: "To compute model metrics", textID: "Untuk menghitung metrik model")
        ],
        correctOptionId: "b",
        explanationEN: "Model registry (e.g., MLflow Model Registry) stores model versions with metadata, manages stage transitions (staging → production), and provides model lineage and governance.",
        explanationID: "Model registry (misalnya, MLflow Model Registry) menyimpan versi model dengan metadata, mengelola transisi tahap (staging → production), dan menyediakan lineage dan governance model.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys009",
        questionEN: "What is CI/CD for ML (MLOps)?",
        questionID: "Apa itu CI/CD untuk ML (MLOps)?",
        options: [
            QuestionOption(id: "a", textEN: "Continuous model training without validation", textID: "Training model terus-menerus tanpa validasi"),
            QuestionOption(id: "b", textEN: "Automated pipeline for testing, validating, and deploying ML models", textID: "Pipeline otomatis untuk testing, validasi, dan deploy model ML"),
            QuestionOption(id: "c", textEN: "Manual deployment of models", textID: "Deployment model manual"),
            QuestionOption(id: "d", textEN: "Cloud infrastructure for ML", textID: "Infrastruktur cloud untuk ML")
        ],
        correctOptionId: "b",
        explanationEN: "MLOps CI/CD automates: data validation, model training, evaluation against baselines, model validation, and deployment. Includes monitoring and automated retraining triggers.",
        explanationID: "MLOps CI/CD mengotomatisasi: validasi data, training model, evaluasi terhadap baseline, validasi model, dan deployment. Termasuk monitoring dan trigger retraining otomatis.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys010",
        questionEN: "What is the training-serving skew problem?",
        questionID: "Apa masalah training-serving skew?",
        options: [
            QuestionOption(id: "a", textEN: "Model performing differently in production vs training due to feature or data inconsistencies", textID: "Model berkinerja berbeda di produksi vs training karena inkonsistensi fitur atau data"),
            QuestionOption(id: "b", textEN: "Training data is too small", textID: "Data training terlalu kecil"),
            QuestionOption(id: "c", textEN: "Server is slower than training machine", textID: "Server lebih lambat dari mesin training"),
            QuestionOption(id: "d", textEN: "Model weights are different", textID: "Bobot model berbeda")
        ],
        correctOptionId: "a",
        explanationEN: "Training-serving skew occurs when feature computation, data preprocessing, or data sources differ between training and serving. Feature stores and shared preprocessing code help prevent this.",
        explanationID: "Training-serving skew terjadi saat komputasi fitur, preprocessing data, atau sumber data berbeda antara training dan serving. Feature store dan kode preprocessing bersama membantu mencegah ini.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys011",
        questionEN: "How do you handle model prediction latency requirements of <10ms?",
        questionID: "Bagaimana cara menangani kebutuhan latency prediksi model <10ms?",
        options: [
            QuestionOption(id: "a", textEN: "Use larger, more accurate models", textID: "Gunakan model lebih besar dan akurat"),
            QuestionOption(id: "b", textEN: "Use model optimization (quantization, distillation), caching, and efficient serving infrastructure", textID: "Gunakan optimasi model (kuantisasi, distillation), caching, dan infrastruktur serving efisien"),
            QuestionOption(id: "c", textEN: "Increase server memory", textID: "Tingkatkan memori server"),
            QuestionOption(id: "d", textEN: "Run predictions in batch only", textID: "Jalankan prediksi dalam batch saja")
        ],
        correctOptionId: "b",
        explanationEN: "Low latency requires: model compression (pruning, quantization, distillation), efficient frameworks (ONNX, TensorRT), result caching, and optimized infrastructure (GPUs, edge deployment).",
        explanationID: "Latency rendah memerlukan: kompresi model (pruning, kuantisasi, distillation), framework efisien (ONNX, TensorRT), caching hasil, dan infrastruktur teroptimasi (GPU, edge deployment).",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys012",
        questionEN: "What is shadow mode deployment?",
        questionID: "Apa itu shadow mode deployment?",
        options: [
            QuestionOption(id: "a", textEN: "Deploying model in dark data centers", textID: "Deploy model di data center gelap"),
            QuestionOption(id: "b", textEN: "Running new model alongside production, comparing outputs without affecting users", textID: "Menjalankan model baru bersamaan dengan produksi, membandingkan output tanpa mempengaruhi pengguna"),
            QuestionOption(id: "c", textEN: "Hiding model from users", textID: "Menyembunyikan model dari pengguna"),
            QuestionOption(id: "d", textEN: "Running model at night only", textID: "Menjalankan model hanya di malam hari")
        ],
        correctOptionId: "b",
        explanationEN: "Shadow mode runs new model in parallel with production. Both receive same inputs but only production model's output is used. New model's predictions are logged for comparison and validation.",
        explanationID: "Shadow mode menjalankan model baru secara paralel dengan produksi. Keduanya menerima input yang sama tapi hanya output model produksi yang digunakan. Prediksi model baru dicatat untuk perbandingan dan validasi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys013",
        questionEN: "What is canary deployment for ML models?",
        questionID: "Apa itu canary deployment untuk model ML?",
        options: [
            QuestionOption(id: "a", textEN: "Deploying model to test with birds", textID: "Deploy model untuk diuji dengan burung"),
            QuestionOption(id: "b", textEN: "Gradually rolling out new model to small percentage of users first", textID: "Secara bertahap meluncurkan model baru ke persentase kecil pengguna terlebih dahulu"),
            QuestionOption(id: "c", textEN: "Yellow-colored deployment servers", textID: "Server deployment berwarna kuning"),
            QuestionOption(id: "d", textEN: "Testing in isolated environment", textID: "Testing di lingkungan terisolasi")
        ],
        correctOptionId: "b",
        explanationEN: "Canary deployment routes small percentage (1-5%) of traffic to new model. If metrics are good, gradually increase to 100%. Allows catching issues before full rollout.",
        explanationID: "Canary deployment mengarahkan persentase kecil (1-5%) traffic ke model baru. Jika metrik baik, tingkatkan secara bertahap ke 100%. Memungkinkan menangkap masalah sebelum rollout penuh.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys014",
        questionEN: "What should an ML monitoring system track?",
        questionID: "Apa yang harus dilacak sistem monitoring ML?",
        options: [
            QuestionOption(id: "a", textEN: "Only model accuracy", textID: "Hanya akurasi model"),
            QuestionOption(id: "b", textEN: "Input data distribution, prediction distribution, model performance, and system metrics", textID: "Distribusi data input, distribusi prediksi, performa model, dan metrik sistem"),
            QuestionOption(id: "c", textEN: "Only server CPU usage", textID: "Hanya penggunaan CPU server"),
            QuestionOption(id: "d", textEN: "Only training time", textID: "Hanya waktu training")
        ],
        correctOptionId: "b",
        explanationEN: "ML monitoring tracks: data quality and drift, feature distributions, prediction distributions, business metrics, model staleness, and infrastructure metrics (latency, throughput, errors).",
        explanationID: "Monitoring ML melacak: kualitas dan drift data, distribusi fitur, distribusi prediksi, metrik bisnis, keusangan model, dan metrik infrastruktur (latency, throughput, error).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys015",
        questionEN: "What triggers model retraining in production?",
        questionID: "Apa yang memicu retraining model di produksi?",
        options: [
            QuestionOption(id: "a", textEN: "Only manual decision", textID: "Hanya keputusan manual"),
            QuestionOption(id: "b", textEN: "Data drift, performance degradation, scheduled retraining, or new data availability", textID: "Data drift, degradasi performa, retraining terjadwal, atau ketersediaan data baru"),
            QuestionOption(id: "c", textEN: "Only when bugs are found", textID: "Hanya saat bug ditemukan"),
            QuestionOption(id: "d", textEN: "Never - models don't need retraining", textID: "Tidak pernah - model tidak perlu dilatih ulang")
        ],
        correctOptionId: "b",
        explanationEN: "Retraining triggers include: detected data/concept drift, metric degradation below threshold, scheduled intervals (daily/weekly), and significant new data accumulation.",
        explanationID: "Trigger retraining termasuk: data/concept drift terdeteksi, degradasi metrik di bawah threshold, interval terjadwal (harian/mingguan), dan akumulasi data baru yang signifikan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // MARK: - Data Pipeline Design (10 questions)
    Question(
        id: "sys016",
        questionEN: "What is ETL in data pipelines?",
        questionID: "Apa itu ETL dalam data pipeline?",
        options: [
            QuestionOption(id: "a", textEN: "Extract, Transform, Load - process to move and process data", textID: "Extract, Transform, Load - proses untuk memindahkan dan memproses data"),
            QuestionOption(id: "b", textEN: "Execute, Test, Launch", textID: "Execute, Test, Launch"),
            QuestionOption(id: "c", textEN: "Evaluate, Train, Learn", textID: "Evaluate, Train, Learn"),
            QuestionOption(id: "d", textEN: "Error, Timeout, Latency", textID: "Error, Timeout, Latency")
        ],
        correctOptionId: "a",
        explanationEN: "ETL: Extract data from sources, Transform (clean, aggregate, enrich), Load into destination (data warehouse, feature store). Core pattern for data engineering.",
        explanationID: "ETL: Extract data dari sumber, Transform (bersihkan, agregasi, enrich), Load ke destinasi (data warehouse, feature store). Pola inti untuk data engineering.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys017",
        questionEN: "What is the difference between batch and streaming data processing?",
        questionID: "Apa perbedaan antara batch dan streaming data processing?",
        options: [
            QuestionOption(id: "a", textEN: "Batch processes all data at once periodically, streaming processes data continuously as it arrives", textID: "Batch memproses semua data sekaligus secara periodik, streaming memproses data terus-menerus saat tiba"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Streaming is always slower", textID: "Streaming selalu lebih lambat"),
            QuestionOption(id: "d", textEN: "Batch is for ML, streaming is for analytics", textID: "Batch untuk ML, streaming untuk analytics")
        ],
        correctOptionId: "a",
        explanationEN: "Batch processes accumulated data (hourly/daily jobs). Streaming processes events in real-time (sub-second latency). Choice depends on latency requirements and data volume.",
        explanationID: "Batch memproses data terakumulasi (job per jam/hari). Streaming memproses event secara real-time (latency sub-detik). Pilihan tergantung pada kebutuhan latency dan volume data.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys018",
        questionEN: "What is data partitioning and why is it important?",
        questionID: "Apa itu data partitioning dan mengapa itu penting?",
        options: [
            QuestionOption(id: "a", textEN: "Splitting data into subsets for parallel processing and efficient queries", textID: "Membagi data menjadi subset untuk pemrosesan paralel dan query efisien"),
            QuestionOption(id: "b", textEN: "Duplicating data for backup", textID: "Menduplikasi data untuk backup"),
            QuestionOption(id: "c", textEN: "Encrypting sensitive data", textID: "Mengenkripsi data sensitif"),
            QuestionOption(id: "d", textEN: "Compressing data to save space", textID: "Mengompresi data untuk menghemat ruang")
        ],
        correctOptionId: "a",
        explanationEN: "Partitioning splits data by key (date, user_id) for parallel processing and query optimization. Query on partition key avoids scanning entire dataset. Common in big data systems.",
        explanationID: "Partitioning membagi data berdasarkan key (tanggal, user_id) untuk pemrosesan paralel dan optimasi query. Query pada partition key menghindari scanning seluruh dataset. Umum di sistem big data.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys019",
        questionEN: "What is data validation in ML pipelines?",
        questionID: "Apa itu validasi data dalam ML pipeline?",
        options: [
            QuestionOption(id: "a", textEN: "Checking model accuracy", textID: "Memeriksa akurasi model"),
            QuestionOption(id: "b", textEN: "Verifying data quality, schema, and statistics before model training", textID: "Memverifikasi kualitas data, skema, dan statistik sebelum training model"),
            QuestionOption(id: "c", textEN: "Labeling data correctly", textID: "Melabeli data dengan benar"),
            QuestionOption(id: "d", textEN: "Splitting data into train/test", textID: "Membagi data menjadi train/test")
        ],
        correctOptionId: "b",
        explanationEN: "Data validation checks: schema compliance, value ranges, missing values, statistical distributions, and data freshness. Catches data issues before they affect model quality. Tools: Great Expectations, TFX.",
        explanationID: "Validasi data memeriksa: kepatuhan skema, rentang nilai, missing value, distribusi statistik, dan kesegaran data. Menangkap masalah data sebelum mempengaruhi kualitas model. Tools: Great Expectations, TFX.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys020",
        questionEN: "What is the lambda architecture for data processing?",
        questionID: "Apa itu lambda architecture untuk data processing?",
        options: [
            QuestionOption(id: "a", textEN: "Using only AWS Lambda functions", textID: "Hanya menggunakan fungsi AWS Lambda"),
            QuestionOption(id: "b", textEN: "Combining batch layer for accurate results and speed layer for real-time results", textID: "Menggabungkan batch layer untuk hasil akurat dan speed layer untuk hasil real-time"),
            QuestionOption(id: "c", textEN: "Processing data in functional programming style", textID: "Memproses data dengan gaya pemrograman fungsional"),
            QuestionOption(id: "d", textEN: "Anonymous data processing", textID: "Pemrosesan data anonim")
        ],
        correctOptionId: "b",
        explanationEN: "Lambda architecture has: batch layer (accurate, slow), speed layer (real-time, approximate), and serving layer that merges both. Handles both historical analysis and real-time queries.",
        explanationID: "Lambda architecture memiliki: batch layer (akurat, lambat), speed layer (real-time, perkiraan), dan serving layer yang menggabungkan keduanya. Menangani analisis historis dan query real-time.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys021",
        questionEN: "What is data lineage tracking?",
        questionID: "Apa itu data lineage tracking?",
        options: [
            QuestionOption(id: "a", textEN: "Tracking data ancestry and transformations from source to destination", textID: "Melacak leluhur dan transformasi data dari sumber ke destinasi"),
            QuestionOption(id: "b", textEN: "Tracking data size over time", textID: "Melacak ukuran data dari waktu ke waktu"),
            QuestionOption(id: "c", textEN: "Tracking user access to data", textID: "Melacak akses pengguna ke data"),
            QuestionOption(id: "d", textEN: "Tracking data storage costs", textID: "Melacak biaya penyimpanan data")
        ],
        correctOptionId: "a",
        explanationEN: "Data lineage tracks data flow: sources, transformations applied, destinations. Enables debugging issues, compliance auditing, and understanding data dependencies. Critical for MLOps governance.",
        explanationID: "Data lineage melacak aliran data: sumber, transformasi yang diterapkan, destinasi. Memungkinkan debugging masalah, audit kepatuhan, dan memahami dependensi data. Kritis untuk governance MLOps.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys022",
        questionEN: "How do you handle late-arriving data in streaming pipelines?",
        questionID: "Bagaimana cara menangani data yang terlambat tiba dalam streaming pipeline?",
        options: [
            QuestionOption(id: "a", textEN: "Ignore it completely", textID: "Abaikan sepenuhnya"),
            QuestionOption(id: "b", textEN: "Use watermarks and allowed lateness windows", textID: "Gunakan watermark dan window keterlambatan yang diizinkan"),
            QuestionOption(id: "c", textEN: "Restart the entire pipeline", textID: "Restart seluruh pipeline"),
            QuestionOption(id: "d", textEN: "Store in separate database", textID: "Simpan di database terpisah")
        ],
        correctOptionId: "b",
        explanationEN: "Watermarks track event time progress. Allowed lateness defines how long to accept late data. Late data within window updates results; data beyond is dropped or sent to side output.",
        explanationID: "Watermark melacak kemajuan waktu event. Allowed lateness mendefinisikan berapa lama menerima data terlambat. Data terlambat dalam window memperbarui hasil; data di luar dibuang atau dikirim ke side output.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys023",
        questionEN: "What is idempotency in data pipelines and why is it important?",
        questionID: "Apa itu idempotency dalam data pipeline dan mengapa itu penting?",
        options: [
            QuestionOption(id: "a", textEN: "Running pipeline multiple times produces same result - enables safe retries", textID: "Menjalankan pipeline beberapa kali menghasilkan hasil yang sama - memungkinkan retry yang aman"),
            QuestionOption(id: "b", textEN: "Pipeline runs faster each time", textID: "Pipeline berjalan lebih cepat setiap kali"),
            QuestionOption(id: "c", textEN: "Pipeline uses less memory", textID: "Pipeline menggunakan lebih sedikit memori"),
            QuestionOption(id: "d", textEN: "Pipeline is independent of input data", textID: "Pipeline independen dari data input")
        ],
        correctOptionId: "a",
        explanationEN: "Idempotent pipelines produce same output regardless of how many times they run. Essential for handling failures and retries without creating duplicates or incorrect data.",
        explanationID: "Pipeline idempoten menghasilkan output yang sama terlepas dari berapa kali dijalankan. Penting untuk menangani kegagalan dan retry tanpa membuat duplikat atau data tidak benar.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys024",
        questionEN: "What is the purpose of a message queue (Kafka, RabbitMQ) in ML systems?",
        questionID: "Apa tujuan message queue (Kafka, RabbitMQ) dalam sistem ML?",
        options: [
            QuestionOption(id: "a", textEN: "Store model weights", textID: "Menyimpan bobot model"),
            QuestionOption(id: "b", textEN: "Decouple producers and consumers, buffer data, enable async processing", textID: "Memisahkan producer dan consumer, buffer data, memungkinkan pemrosesan async"),
            QuestionOption(id: "c", textEN: "Train models faster", textID: "Melatih model lebih cepat"),
            QuestionOption(id: "d", textEN: "Visualize data flow", textID: "Memvisualisasikan aliran data")
        ],
        correctOptionId: "b",
        explanationEN: "Message queues decouple systems (ingestion from processing), buffer during load spikes, enable replay for reprocessing, and allow multiple consumers. Foundation of event-driven ML systems.",
        explanationID: "Message queue memisahkan sistem (ingestion dari processing), buffer saat lonjakan beban, memungkinkan replay untuk reprocessing, dan mengizinkan multiple consumer. Fondasi sistem ML event-driven.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys025",
        questionEN: "How do you ensure data quality in production ML systems?",
        questionID: "Bagaimana cara memastikan kualitas data dalam sistem ML produksi?",
        options: [
            QuestionOption(id: "a", textEN: "Manual inspection of all data", textID: "Inspeksi manual semua data"),
            QuestionOption(id: "b", textEN: "Automated checks, schema validation, anomaly detection, and data contracts", textID: "Pemeriksaan otomatis, validasi skema, deteksi anomali, dan data contract"),
            QuestionOption(id: "c", textEN: "Only use high-quality sources", textID: "Hanya gunakan sumber berkualitas tinggi"),
            QuestionOption(id: "d", textEN: "Ignore data quality issues", textID: "Abaikan masalah kualitas data")
        ],
        correctOptionId: "b",
        explanationEN: "Data quality requires: automated validation checks, schema enforcement, statistical monitoring, anomaly detection, clear data contracts between teams, and alerts on quality degradation.",
        explanationID: "Kualitas data memerlukan: pemeriksaan validasi otomatis, enforcement skema, monitoring statistik, deteksi anomali, data contract yang jelas antar tim, dan alert saat degradasi kualitas.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // MARK: - Scalability & Architecture (15 questions)
    Question(
        id: "sys026",
        questionEN: "What is horizontal vs vertical scaling?",
        questionID: "Apa perbedaan horizontal vs vertical scaling?",
        options: [
            QuestionOption(id: "a", textEN: "Horizontal adds more machines; vertical adds more power to existing machines", textID: "Horizontal menambah lebih banyak mesin; vertical menambah lebih banyak daya ke mesin yang ada"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Keduanya hal yang sama"),
            QuestionOption(id: "c", textEN: "Horizontal is cheaper, vertical is free", textID: "Horizontal lebih murah, vertical gratis"),
            QuestionOption(id: "d", textEN: "Horizontal is for storage, vertical for compute", textID: "Horizontal untuk storage, vertical untuk compute")
        ],
        correctOptionId: "a",
        explanationEN: "Vertical scaling (scale up): add CPU/RAM to server. Horizontal scaling (scale out): add more servers. Horizontal is preferred for large scale but needs distributed architecture.",
        explanationID: "Vertical scaling (scale up): tambah CPU/RAM ke server. Horizontal scaling (scale out): tambah lebih banyak server. Horizontal lebih disukai untuk skala besar tapi butuh arsitektur terdistribusi.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys027",
        questionEN: "What is a load balancer and why is it needed for ML serving?",
        questionID: "Apa itu load balancer dan mengapa diperlukan untuk serving ML?",
        options: [
            QuestionOption(id: "a", textEN: "Distributes incoming requests across multiple model servers", textID: "Mendistribusikan request masuk ke beberapa server model"),
            QuestionOption(id: "b", textEN: "Reduces model weight size", textID: "Mengurangi ukuran bobot model"),
            QuestionOption(id: "c", textEN: "Balances training data distribution", textID: "Menyeimbangkan distribusi data training"),
            QuestionOption(id: "d", textEN: "Loads model into memory", textID: "Memuat model ke memori")
        ],
        correctOptionId: "a",
        explanationEN: "Load balancer distributes prediction requests across multiple model replicas. Provides high availability, handles traffic spikes, and enables zero-downtime deployments.",
        explanationID: "Load balancer mendistribusikan request prediksi ke beberapa replika model. Menyediakan ketersediaan tinggi, menangani lonjakan traffic, dan memungkinkan deployment tanpa downtime.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys028",
        questionEN: "What is the purpose of caching in ML serving?",
        questionID: "Apa tujuan caching dalam serving ML?",
        options: [
            QuestionOption(id: "a", textEN: "Store model weights permanently", textID: "Menyimpan bobot model secara permanen"),
            QuestionOption(id: "b", textEN: "Store prediction results for repeated queries to reduce latency and compute", textID: "Menyimpan hasil prediksi untuk query berulang untuk mengurangi latency dan compute"),
            QuestionOption(id: "c", textEN: "Cache training data for faster access", textID: "Cache data training untuk akses lebih cepat"),
            QuestionOption(id: "d", textEN: "Cache model code for faster deployment", textID: "Cache kode model untuk deployment lebih cepat")
        ],
        correctOptionId: "b",
        explanationEN: "Prediction caching stores results for identical inputs. Reduces latency (cache hit is sub-millisecond) and compute costs. Important for systems with repeated queries like recommendation.",
        explanationID: "Prediction caching menyimpan hasil untuk input identik. Mengurangi latency (cache hit sub-milidetik) dan biaya compute. Penting untuk sistem dengan query berulang seperti rekomendasi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys029",
        questionEN: "What is model parallelism?",
        questionID: "Apa itu model parallelism?",
        options: [
            QuestionOption(id: "a", textEN: "Training same model on multiple datasets", textID: "Melatih model yang sama pada beberapa dataset"),
            QuestionOption(id: "b", textEN: "Splitting model across multiple devices because it's too large for one", textID: "Membagi model ke beberapa device karena terlalu besar untuk satu"),
            QuestionOption(id: "c", textEN: "Running multiple different models", textID: "Menjalankan beberapa model berbeda"),
            QuestionOption(id: "d", textEN: "Training in parallel epochs", textID: "Training dalam epoch paralel")
        ],
        correctOptionId: "b",
        explanationEN: "Model parallelism splits model layers across devices. Used for very large models (GPT-3, LLaMA) that don't fit on single GPU. Contrasts with data parallelism which splits data.",
        explanationID: "Model parallelism membagi layer model ke beberapa device. Digunakan untuk model sangat besar (GPT-3, LLaMA) yang tidak muat di satu GPU. Berbeda dengan data parallelism yang membagi data.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys030",
        questionEN: "What is data parallelism in distributed training?",
        questionID: "Apa itu data parallelism dalam distributed training?",
        options: [
            QuestionOption(id: "a", textEN: "Each device has full model copy and processes different data batches", textID: "Setiap device memiliki salinan model penuh dan memproses batch data berbeda"),
            QuestionOption(id: "b", textEN: "Data is processed sequentially on one device", textID: "Data diproses secara berurutan pada satu device"),
            QuestionOption(id: "c", textEN: "Only model weights are parallelized", textID: "Hanya bobot model yang diparalelkan"),
            QuestionOption(id: "d", textEN: "Different models process same data", textID: "Model berbeda memproses data yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "Data parallelism replicates model on each device. Each processes different mini-batch, computes gradients, then gradients are synchronized (averaged). Scales training with more GPUs.",
        explanationID: "Data parallelism mereplikasi model di setiap device. Masing-masing memproses mini-batch berbeda, menghitung gradien, lalu gradien disinkronkan (dirata-ratakan). Menskalakan training dengan lebih banyak GPU.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys031",
        questionEN: "What is auto-scaling in ML serving infrastructure?",
        questionID: "Apa itu auto-scaling dalam infrastruktur serving ML?",
        options: [
            QuestionOption(id: "a", textEN: "Automatically adjusting number of model server instances based on load", textID: "Secara otomatis menyesuaikan jumlah instance server model berdasarkan beban"),
            QuestionOption(id: "b", textEN: "Automatically adjusting model weights", textID: "Secara otomatis menyesuaikan bobot model"),
            QuestionOption(id: "c", textEN: "Automatically scaling input data", textID: "Secara otomatis menskalakan data input"),
            QuestionOption(id: "d", textEN: "Scaling model accuracy automatically", textID: "Menskalakan akurasi model secara otomatis")
        ],
        correctOptionId: "a",
        explanationEN: "Auto-scaling adds/removes server instances based on metrics (CPU, latency, queue length). Handles traffic spikes efficiently while minimizing costs during low traffic.",
        explanationID: "Auto-scaling menambah/menghapus instance server berdasarkan metrik (CPU, latency, panjang queue). Menangani lonjakan traffic secara efisien sambil meminimalkan biaya saat traffic rendah.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys032",
        questionEN: "What is the microservices architecture pattern?",
        questionID: "Apa pola arsitektur microservices?",
        options: [
            QuestionOption(id: "a", textEN: "Single large application handling everything", textID: "Satu aplikasi besar yang menangani semuanya"),
            QuestionOption(id: "b", textEN: "Application divided into small, independently deployable services", textID: "Aplikasi dibagi menjadi layanan kecil yang dapat di-deploy secara independen"),
            QuestionOption(id: "c", textEN: "Using very small servers", textID: "Menggunakan server yang sangat kecil"),
            QuestionOption(id: "d", textEN: "Running services for micro-seconds", textID: "Menjalankan layanan selama mikro-detik")
        ],
        correctOptionId: "b",
        explanationEN: "Microservices breaks application into small, focused services. Each handles one capability, can scale independently, and be deployed without affecting others. Common in ML platforms.",
        explanationID: "Microservices memecah aplikasi menjadi layanan kecil dan fokus. Masing-masing menangani satu kemampuan, dapat diskalakan secara independen, dan di-deploy tanpa mempengaruhi yang lain. Umum di platform ML.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys033",
        questionEN: "What is an API gateway in ML serving?",
        questionID: "Apa itu API gateway dalam serving ML?",
        options: [
            QuestionOption(id: "a", textEN: "Entry point that routes requests, handles auth, rate limiting, and monitoring", textID: "Titik masuk yang mengarahkan request, menangani auth, rate limiting, dan monitoring"),
            QuestionOption(id: "b", textEN: "A physical gateway to the data center", textID: "Gateway fisik ke data center"),
            QuestionOption(id: "c", textEN: "A tool for API documentation", textID: "Alat untuk dokumentasi API"),
            QuestionOption(id: "d", textEN: "A database for API keys", textID: "Database untuk API key")
        ],
        correctOptionId: "a",
        explanationEN: "API gateway is single entry point handling: request routing, authentication, rate limiting, caching, logging, and load balancing. Decouples clients from backend services.",
        explanationID: "API gateway adalah titik masuk tunggal yang menangani: routing request, autentikasi, rate limiting, caching, logging, dan load balancing. Memisahkan client dari layanan backend.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys034",
        questionEN: "What is blue-green deployment?",
        questionID: "Apa itu blue-green deployment?",
        options: [
            QuestionOption(id: "a", textEN: "Maintain two identical environments, switch traffic instantly for zero-downtime updates", textID: "Memelihara dua lingkungan identik, beralih traffic secara instan untuk update tanpa downtime"),
            QuestionOption(id: "b", textEN: "Color-coding server rooms", textID: "Memberi kode warna ruang server"),
            QuestionOption(id: "c", textEN: "Testing with blue and green data", textID: "Testing dengan data biru dan hijau"),
            QuestionOption(id: "d", textEN: "Deploying only during daytime (green) and night (blue)", textID: "Deploy hanya saat siang (hijau) dan malam (biru)")
        ],
        correctOptionId: "a",
        explanationEN: "Blue-green has two production environments. Deploy to idle one (green), test, then switch traffic from blue to green. Enables instant rollback by switching back.",
        explanationID: "Blue-green memiliki dua lingkungan produksi. Deploy ke yang idle (green), test, lalu alihkan traffic dari blue ke green. Memungkinkan rollback instan dengan beralih kembali.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys035",
        questionEN: "What is edge deployment for ML models?",
        questionID: "Apa itu edge deployment untuk model ML?",
        options: [
            QuestionOption(id: "a", textEN: "Deploying models to edge devices (phones, IoT) instead of cloud", textID: "Deploy model ke edge device (ponsel, IoT) bukan ke cloud"),
            QuestionOption(id: "b", textEN: "Deploying at the edge of data centers", textID: "Deploy di tepi data center"),
            QuestionOption(id: "c", textEN: "Using Microsoft Edge browser", textID: "Menggunakan browser Microsoft Edge"),
            QuestionOption(id: "d", textEN: "Running experimental models", textID: "Menjalankan model eksperimental")
        ],
        correctOptionId: "a",
        explanationEN: "Edge deployment runs models on local devices (mobile, IoT, embedded). Benefits: low latency, works offline, privacy (data stays on device). Requires model optimization for limited resources.",
        explanationID: "Edge deployment menjalankan model di device lokal (mobile, IoT, embedded). Manfaat: latency rendah, bekerja offline, privasi (data tetap di device). Memerlukan optimasi model untuk resource terbatas.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys036",
        questionEN: "What is a sidecar pattern in containerized ML deployments?",
        questionID: "Apa pola sidecar dalam deployment ML terkontainerisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Auxiliary container running alongside main model container for logging, monitoring, etc.", textID: "Container tambahan yang berjalan bersamaan dengan container model utama untuk logging, monitoring, dll."),
            QuestionOption(id: "b", textEN: "Backup model container", textID: "Container model backup"),
            QuestionOption(id: "c", textEN: "Container for storing training data", textID: "Container untuk menyimpan data training"),
            QuestionOption(id: "d", textEN: "A motorcycle-shaped server", textID: "Server berbentuk motor")
        ],
        correctOptionId: "a",
        explanationEN: "Sidecar runs alongside main container in same pod. Handles cross-cutting concerns: logging, monitoring, service mesh proxy. Keeps main container focused on ML serving.",
        explanationID: "Sidecar berjalan bersamaan dengan container utama dalam pod yang sama. Menangani concern lintas-bidang: logging, monitoring, proxy service mesh. Menjaga container utama fokus pada serving ML.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys037",
        questionEN: "How do you handle failover for ML model serving?",
        questionID: "Bagaimana cara menangani failover untuk serving model ML?",
        options: [
            QuestionOption(id: "a", textEN: "Only deploy one model server", textID: "Hanya deploy satu server model"),
            QuestionOption(id: "b", textEN: "Multiple replicas, health checks, automatic failover to healthy instances", textID: "Beberapa replika, health check, failover otomatis ke instance yang sehat"),
            QuestionOption(id: "c", textEN: "Manual intervention for each failure", textID: "Intervensi manual untuk setiap kegagalan"),
            QuestionOption(id: "d", textEN: "Ignore failures", textID: "Abaikan kegagalan")
        ],
        correctOptionId: "b",
        explanationEN: "High availability requires: multiple replicas across availability zones, health checks, automatic failover, circuit breakers, and fallback strategies (cached results, simpler model).",
        explanationID: "Ketersediaan tinggi memerlukan: beberapa replika di zona ketersediaan, health check, failover otomatis, circuit breaker, dan strategi fallback (hasil cache, model lebih sederhana).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys038",
        questionEN: "What is eventual consistency in distributed ML systems?",
        questionID: "Apa itu eventual consistency dalam sistem ML terdistribusi?",
        options: [
            QuestionOption(id: "a", textEN: "All replicas will have same data eventually, but not immediately", textID: "Semua replika akan memiliki data yang sama akhirnya, tapi tidak segera"),
            QuestionOption(id: "b", textEN: "Data is always consistent immediately", textID: "Data selalu konsisten segera"),
            QuestionOption(id: "c", textEN: "Data is never consistent", textID: "Data tidak pernah konsisten"),
            QuestionOption(id: "d", textEN: "Consistency check at the end of training", textID: "Pemeriksaan konsistensi di akhir training")
        ],
        correctOptionId: "a",
        explanationEN: "Eventual consistency trades immediate consistency for availability and partition tolerance (CAP theorem). Updates propagate asynchronously. Common in distributed feature stores and model registries.",
        explanationID: "Eventual consistency menukar konsistensi langsung dengan ketersediaan dan toleransi partisi (teorema CAP). Update menyebar secara asinkron. Umum di feature store dan model registry terdistribusi.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "sys039",
        questionEN: "What is rate limiting in ML APIs?",
        questionID: "Apa itu rate limiting dalam API ML?",
        options: [
            QuestionOption(id: "a", textEN: "Limiting learning rate in training", textID: "Membatasi learning rate dalam training"),
            QuestionOption(id: "b", textEN: "Limiting number of requests per user/time to protect system", textID: "Membatasi jumlah request per pengguna/waktu untuk melindungi sistem"),
            QuestionOption(id: "c", textEN: "Limiting model prediction rate", textID: "Membatasi tingkat prediksi model"),
            QuestionOption(id: "d", textEN: "Limiting data ingestion speed", textID: "Membatasi kecepatan ingesti data")
        ],
        correctOptionId: "b",
        explanationEN: "Rate limiting controls requests per user/IP/API key over time window. Prevents abuse, ensures fair usage, protects backend from overload. Common: token bucket, sliding window algorithms.",
        explanationID: "Rate limiting mengontrol request per pengguna/IP/API key selama jendela waktu. Mencegah penyalahgunaan, memastikan penggunaan yang adil, melindungi backend dari overload. Umum: algoritma token bucket, sliding window.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys040",
        questionEN: "What is the purpose of a service mesh (like Istio) in ML platforms?",
        questionID: "Apa tujuan service mesh (seperti Istio) dalam platform ML?",
        options: [
            QuestionOption(id: "a", textEN: "Handle service-to-service communication, security, and observability", textID: "Menangani komunikasi service-to-service, keamanan, dan observability"),
            QuestionOption(id: "b", textEN: "Store model weights in a mesh network", textID: "Menyimpan bobot model dalam jaringan mesh"),
            QuestionOption(id: "c", textEN: "Create neural network meshes", textID: "Membuat mesh neural network"),
            QuestionOption(id: "d", textEN: "Physical networking of servers", textID: "Jaringan fisik server")
        ],
        correctOptionId: "a",
        explanationEN: "Service mesh provides: secure service communication (mTLS), traffic management, observability, retries/timeouts. Handles cross-cutting concerns without application code changes.",
        explanationID: "Service mesh menyediakan: komunikasi service yang aman (mTLS), manajemen traffic, observability, retry/timeout. Menangani concern lintas-bidang tanpa perubahan kode aplikasi.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    // MARK: - API & Interface Design (10 questions)
    Question(
        id: "sys041",
        questionEN: "What are the key components of a well-designed ML prediction API?",
        questionID: "Apa komponen kunci dari API prediksi ML yang dirancang dengan baik?",
        options: [
            QuestionOption(id: "a", textEN: "Clear input/output schema, versioning, error handling, and documentation", textID: "Skema input/output yang jelas, versioning, penanganan error, dan dokumentasi"),
            QuestionOption(id: "b", textEN: "Complex nested JSON only", textID: "Hanya JSON bersarang kompleks"),
            QuestionOption(id: "c", textEN: "No schema, flexible inputs", textID: "Tanpa skema, input fleksibel"),
            QuestionOption(id: "d", textEN: "Only binary response format", textID: "Hanya format respons biner")
        ],
        correctOptionId: "a",
        explanationEN: "Good ML APIs have: versioned endpoints, typed request/response schemas, meaningful error codes, rate limiting info, latency SLAs, and OpenAPI documentation.",
        explanationID: "API ML yang baik memiliki: endpoint berversi, skema request/response bertipe, kode error yang bermakna, info rate limiting, SLA latency, dan dokumentasi OpenAPI.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys042",
        questionEN: "Why is API versioning important for ML services?",
        questionID: "Mengapa versioning API penting untuk layanan ML?",
        options: [
            QuestionOption(id: "a", textEN: "To track which version of model is fastest", textID: "Untuk melacak versi model mana yang tercepat"),
            QuestionOption(id: "b", textEN: "To allow model updates without breaking existing clients", textID: "Untuk memungkinkan update model tanpa merusak client yang ada"),
            QuestionOption(id: "c", textEN: "To number API endpoints sequentially", textID: "Untuk memberi nomor endpoint API secara berurutan"),
            QuestionOption(id: "d", textEN: "Not important for ML services", textID: "Tidak penting untuk layanan ML")
        ],
        correctOptionId: "b",
        explanationEN: "API versioning (v1/, v2/) allows deploying new models with different input/output formats while maintaining old versions. Clients can migrate at their own pace.",
        explanationID: "API versioning (v1/, v2/) memungkinkan deploy model baru dengan format input/output berbeda sambil mempertahankan versi lama. Client dapat bermigrasi sesuai kecepatan mereka sendiri.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys043",
        questionEN: "What is gRPC and why use it for ML serving?",
        questionID: "Apa itu gRPC dan mengapa menggunakannya untuk serving ML?",
        options: [
            QuestionOption(id: "a", textEN: "High-performance RPC framework with binary protocol - lower latency than REST", textID: "Framework RPC performa tinggi dengan protokol biner - latency lebih rendah dari REST"),
            QuestionOption(id: "b", textEN: "A type of GPU for ML", textID: "Jenis GPU untuk ML"),
            QuestionOption(id: "c", textEN: "Graph-based prediction cache", textID: "Cache prediksi berbasis graf"),
            QuestionOption(id: "d", textEN: "Google's REST alternative", textID: "Alternatif REST Google")
        ],
        correctOptionId: "a",
        explanationEN: "gRPC uses Protocol Buffers for efficient serialization, supports streaming, and has lower latency than JSON/REST. Ideal for high-throughput ML serving with strongly typed contracts.",
        explanationID: "gRPC menggunakan Protocol Buffers untuk serialisasi efisien, mendukung streaming, dan memiliki latency lebih rendah dari JSON/REST. Ideal untuk serving ML throughput tinggi dengan kontrak bertipe kuat.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys044",
        questionEN: "How should errors be handled in ML prediction APIs?",
        questionID: "Bagaimana seharusnya error ditangani dalam API prediksi ML?",
        options: [
            QuestionOption(id: "a", textEN: "Return 200 OK with error in body", textID: "Kembalikan 200 OK dengan error dalam body"),
            QuestionOption(id: "b", textEN: "Use appropriate HTTP status codes with detailed error messages", textID: "Gunakan kode status HTTP yang sesuai dengan pesan error detail"),
            QuestionOption(id: "c", textEN: "Crash the server on any error", textID: "Crash server pada error apapun"),
            QuestionOption(id: "d", textEN: "Return random predictions on error", textID: "Kembalikan prediksi acak pada error")
        ],
        correctOptionId: "b",
        explanationEN: "Use HTTP codes: 400 for invalid input, 429 for rate limit, 500 for server errors. Include error type, message, and request ID for debugging. Don't expose internal details.",
        explanationID: "Gunakan kode HTTP: 400 untuk input tidak valid, 429 untuk rate limit, 500 untuk error server. Sertakan tipe error, pesan, dan request ID untuk debugging. Jangan ekspos detail internal.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys045",
        questionEN: "What is batch prediction API design pattern?",
        questionID: "Apa pola desain API batch prediction?",
        options: [
            QuestionOption(id: "a", textEN: "Accept array of inputs, return array of predictions in single request", textID: "Terima array input, kembalikan array prediksi dalam satu request"),
            QuestionOption(id: "b", textEN: "Process one input at a time", textID: "Proses satu input pada satu waktu"),
            QuestionOption(id: "c", textEN: "Store predictions in batch file", textID: "Simpan prediksi dalam file batch"),
            QuestionOption(id: "d", textEN: "Use only for training", textID: "Gunakan hanya untuk training")
        ],
        correctOptionId: "a",
        explanationEN: "Batch API accepts multiple inputs in single request. More efficient for bulk predictions - reduces network overhead and enables better GPU utilization. Set reasonable size limits.",
        explanationID: "Batch API menerima beberapa input dalam satu request. Lebih efisien untuk prediksi massal - mengurangi overhead jaringan dan memungkinkan utilisasi GPU lebih baik. Tetapkan batas ukuran yang wajar.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "sys046",
        questionEN: "What is async prediction pattern and when to use it?",
        questionID: "Apa pola prediksi async dan kapan menggunakannya?",
        options: [
            QuestionOption(id: "a", textEN: "Submit request, get job ID, poll/webhook for result - for long-running predictions", textID: "Submit request, dapat job ID, poll/webhook untuk hasil - untuk prediksi berjalan lama"),
            QuestionOption(id: "b", textEN: "Always wait for result synchronously", textID: "Selalu tunggu hasil secara sinkron"),
            QuestionOption(id: "c", textEN: "Predict asynchronously without results", textID: "Prediksi secara asinkron tanpa hasil"),
            QuestionOption(id: "d", textEN: "Use async only for training", textID: "Gunakan async hanya untuk training")
        ],
        correctOptionId: "a",
        explanationEN: "Async pattern: submit → job ID → poll/callback for status. Use when prediction takes >seconds (video processing, complex models). Prevents HTTP timeouts and improves user experience.",
        explanationID: "Pola async: submit → job ID → poll/callback untuk status. Gunakan saat prediksi memakan waktu >detik (pemrosesan video, model kompleks). Mencegah timeout HTTP dan meningkatkan pengalaman pengguna.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys047",
        questionEN: "What should ML API documentation include?",
        questionID: "Apa yang harus disertakan dalam dokumentasi API ML?",
        options: [
            QuestionOption(id: "a", textEN: "Only endpoint URLs", textID: "Hanya URL endpoint"),
            QuestionOption(id: "b", textEN: "Input/output schemas, examples, error codes, rate limits, and model info", textID: "Skema input/output, contoh, kode error, rate limit, dan info model"),
            QuestionOption(id: "c", textEN: "Only authentication methods", textID: "Hanya metode autentikasi"),
            QuestionOption(id: "d", textEN: "Source code of the model", textID: "Kode sumber model")
        ],
        correctOptionId: "b",
        explanationEN: "Good ML API docs include: input/output schemas with examples, error handling, rate limits, latency expectations, model version/date, intended use cases, and known limitations.",
        explanationID: "Dokumentasi API ML yang baik mencakup: skema input/output dengan contoh, penanganan error, rate limit, ekspektasi latency, versi/tanggal model, use case yang dimaksud, dan keterbatasan yang diketahui.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys048",
        questionEN: "What is the purpose of health check endpoints in ML services?",
        questionID: "Apa tujuan endpoint health check dalam layanan ML?",
        options: [
            QuestionOption(id: "a", textEN: "Check if model is trained well", textID: "Memeriksa apakah model terlatih dengan baik"),
            QuestionOption(id: "b", textEN: "Report service readiness and liveness for orchestration systems", textID: "Melaporkan kesiapan dan keaktifan layanan untuk sistem orkestrasi"),
            QuestionOption(id: "c", textEN: "Monitor user health data", textID: "Memantau data kesehatan pengguna"),
            QuestionOption(id: "d", textEN: "Test prediction accuracy", textID: "Menguji akurasi prediksi")
        ],
        correctOptionId: "b",
        explanationEN: "Health endpoints (/health, /ready) report if service can accept traffic. Kubernetes uses these to manage pods. Liveness: service running. Readiness: model loaded, ready to serve.",
        explanationID: "Endpoint health (/health, /ready) melaporkan apakah layanan dapat menerima traffic. Kubernetes menggunakan ini untuk mengelola pod. Liveness: layanan berjalan. Readiness: model dimuat, siap melayani.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys049",
        questionEN: "What is feature flagging for ML models?",
        questionID: "Apa itu feature flagging untuk model ML?",
        options: [
            QuestionOption(id: "a", textEN: "Marking important features in dataset", textID: "Menandai fitur penting dalam dataset"),
            QuestionOption(id: "b", textEN: "Controlling which model version or features are enabled without deployment", textID: "Mengontrol versi model atau fitur mana yang diaktifkan tanpa deployment"),
            QuestionOption(id: "c", textEN: "Flagging bad predictions", textID: "Menandai prediksi buruk"),
            QuestionOption(id: "d", textEN: "Selecting features for training", textID: "Memilih fitur untuk training")
        ],
        correctOptionId: "b",
        explanationEN: "Feature flags enable toggling model versions or capabilities at runtime. Useful for gradual rollouts, A/B testing, and quick rollbacks without redeployment.",
        explanationID: "Feature flag memungkinkan pengalihan versi model atau kemampuan saat runtime. Berguna untuk rollout bertahap, A/B testing, dan rollback cepat tanpa redeployment.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "sys050",
        questionEN: "What is the request-response pattern vs publish-subscribe for ML?",
        questionID: "Apa perbedaan pola request-response vs publish-subscribe untuk ML?",
        options: [
            QuestionOption(id: "a", textEN: "Req-res is synchronous point-to-point; pub-sub decouples via message broker", textID: "Req-res adalah point-to-point sinkron; pub-sub memisahkan via message broker"),
            QuestionOption(id: "b", textEN: "They are the same thing", textID: "Keduanya hal yang sama"),
            QuestionOption(id: "c", textEN: "Pub-sub is only for publishing models", textID: "Pub-sub hanya untuk mempublikasikan model"),
            QuestionOption(id: "d", textEN: "Req-res is for batch, pub-sub for streaming", textID: "Req-res untuk batch, pub-sub untuk streaming")
        ],
        correctOptionId: "a",
        explanationEN: "Request-response: client waits for server's prediction. Pub-sub: client publishes to topic, subscribers (possibly multiple models) process independently. Pub-sub better for event-driven, decoupled systems.",
        explanationID: "Request-response: client menunggu prediksi server. Pub-sub: client mempublikasikan ke topik, subscriber (mungkin beberapa model) memproses secara independen. Pub-sub lebih baik untuk sistem event-driven yang terpisah.",
        topic: "problemSolving",
        difficulty: .advanced
    )
]
