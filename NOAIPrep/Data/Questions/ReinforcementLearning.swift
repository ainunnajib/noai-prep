import Foundation

// MARK: - Reinforcement Learning Questions (50)
// Topics: MDP, Q-Learning, Policy Gradient, Actor-Critic, Exploration
// Aligned with IOAI/NOAI Syllabus

let reinforcementLearningQuestions: [Question] = [
    // MARK: - RL Fundamentals (1-15)
    Question(
        id: "rl_001",
        questionEN: "What are the key elements of a Reinforcement Learning problem?",
        questionID: "Apa elemen kunci dari masalah Reinforcement Learning?",
        options: [
            QuestionOption(id: "a", textEN: "Agent, Environment, State, Action, Reward", textID: "Agen, Lingkungan, State, Aksi, Reward"),
            QuestionOption(id: "b", textEN: "Input, Output, Loss, Optimizer", textID: "Input, Output, Loss, Optimizer"),
            QuestionOption(id: "c", textEN: "Features, Labels, Model, Prediction", textID: "Fitur, Label, Model, Prediksi"),
            QuestionOption(id: "d", textEN: "Training, Validation, Test, Deploy", textID: "Training, Validasi, Uji, Deploy")
        ],
        correctOptionId: "a",
        explanationEN: "RL involves an agent interacting with an environment, observing states, taking actions, and receiving rewards. The goal is to maximize cumulative reward.",
        explanationID: "RL melibatkan agen yang berinteraksi dengan lingkungan, mengamati state, mengambil aksi, dan menerima reward. Tujuannya adalah memaksimalkan reward kumulatif.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "rl_002",
        questionEN: "What is a Markov Decision Process (MDP)?",
        questionID: "Apa itu Markov Decision Process (MDP)?",
        options: [
            QuestionOption(id: "a", textEN: "Mathematical framework for sequential decision making where future depends only on current state", textID: "Kerangka matematika untuk pengambilan keputusan berurutan dimana masa depan hanya bergantung pada state saat ini"),
            QuestionOption(id: "b", textEN: "A type of neural network", textID: "Jenis neural network"),
            QuestionOption(id: "c", textEN: "A supervised learning algorithm", textID: "Algoritma supervised learning"),
            QuestionOption(id: "d", textEN: "A clustering method", textID: "Metode clustering")
        ],
        correctOptionId: "a",
        explanationEN: "MDP is defined by (S, A, P, R, γ): States, Actions, Transition Probabilities P(s'|s,a), Reward function R(s,a), and discount factor γ. Markov property: P(s'|s,a) independent of history.",
        explanationID: "MDP didefinisikan oleh (S, A, P, R, γ): State, Aksi, Probabilitas Transisi P(s'|s,a), fungsi Reward R(s,a), dan faktor diskon γ.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_003",
        questionEN: "What is the Markov property?",
        questionID: "Apa itu properti Markov?",
        options: [
            QuestionOption(id: "a", textEN: "The future is independent of the past given the present state", textID: "Masa depan independen dari masa lalu jika diberikan state saat ini"),
            QuestionOption(id: "b", textEN: "All states have equal probability", textID: "Semua state memiliki probabilitas sama"),
            QuestionOption(id: "c", textEN: "Rewards are always positive", textID: "Reward selalu positif"),
            QuestionOption(id: "d", textEN: "Actions are deterministic", textID: "Aksi bersifat deterministik")
        ],
        correctOptionId: "a",
        explanationEN: "Markov property: P(s_{t+1}|s_t, a_t) = P(s_{t+1}|s_t, a_t, s_{t-1}, ...). The current state contains all information needed to predict the future.",
        explanationID: "Properti Markov: P(s_{t+1}|s_t, a_t) = P(s_{t+1}|s_t, a_t, s_{t-1}, ...). State saat ini mengandung semua informasi untuk memprediksi masa depan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_004",
        questionEN: "What is the discount factor γ (gamma) in RL?",
        questionID: "Apa itu faktor diskon γ (gamma) dalam RL?",
        options: [
            QuestionOption(id: "a", textEN: "A value (0-1) that determines how much future rewards are valued vs immediate rewards", textID: "Nilai (0-1) yang menentukan seberapa besar nilai reward masa depan vs reward segera"),
            QuestionOption(id: "b", textEN: "The learning rate", textID: "Learning rate"),
            QuestionOption(id: "c", textEN: "The exploration parameter", textID: "Parameter eksplorasi"),
            QuestionOption(id: "d", textEN: "The reward scaling factor", textID: "Faktor skala reward")
        ],
        correctOptionId: "a",
        explanationEN: "γ ∈ [0,1] discounts future rewards: G = r_1 + γr_2 + γ²r_3 + ... γ=0 means myopic (only immediate reward), γ=1 values all future rewards equally.",
        explanationID: "γ ∈ [0,1] mendiskon reward masa depan: G = r_1 + γr_2 + γ²r_3 + ... γ=0 berarti myopic (hanya reward segera), γ=1 menilai semua reward masa depan sama.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "rl_005",
        questionEN: "What is a policy in reinforcement learning?",
        questionID: "Apa itu policy dalam reinforcement learning?",
        options: [
            QuestionOption(id: "a", textEN: "A mapping from states to actions (or action probabilities)", textID: "Pemetaan dari state ke aksi (atau probabilitas aksi)"),
            QuestionOption(id: "b", textEN: "The reward function", textID: "Fungsi reward"),
            QuestionOption(id: "c", textEN: "The transition model", textID: "Model transisi"),
            QuestionOption(id: "d", textEN: "The state representation", textID: "Representasi state")
        ],
        correctOptionId: "a",
        explanationEN: "Policy π(a|s) defines behavior. Deterministic: π(s) = a. Stochastic: π(a|s) = P(action=a|state=s). The goal is to find the optimal policy π* that maximizes expected return.",
        explanationID: "Policy π(a|s) mendefinisikan perilaku. Deterministik: π(s) = a. Stokastik: π(a|s) = P(aksi=a|state=s). Tujuannya adalah menemukan policy optimal π*.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "rl_006",
        questionEN: "What is the value function V(s)?",
        questionID: "Apa itu fungsi nilai V(s)?",
        options: [
            QuestionOption(id: "a", textEN: "Expected cumulative discounted reward starting from state s following policy π", textID: "Ekspektasi reward diskon kumulatif mulai dari state s mengikuti policy π"),
            QuestionOption(id: "b", textEN: "The immediate reward at state s", textID: "Reward langsung di state s"),
            QuestionOption(id: "c", textEN: "The probability of reaching state s", textID: "Probabilitas mencapai state s"),
            QuestionOption(id: "d", textEN: "The action taken at state s", textID: "Aksi yang diambil di state s")
        ],
        correctOptionId: "a",
        explanationEN: "V^π(s) = E[G_t | s_t = s] = E[Σγ^k r_{t+k} | s_t = s] under policy π. It measures how good it is to be in a particular state.",
        explanationID: "V^π(s) = E[G_t | s_t = s] = E[Σγ^k r_{t+k} | s_t = s] di bawah policy π. Mengukur seberapa bagus berada di state tertentu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_007",
        questionEN: "What is the action-value function Q(s, a)?",
        questionID: "Apa itu fungsi nilai aksi Q(s, a)?",
        options: [
            QuestionOption(id: "a", textEN: "Expected return starting from state s, taking action a, then following policy π", textID: "Return yang diharapkan mulai dari state s, mengambil aksi a, lalu mengikuti policy π"),
            QuestionOption(id: "b", textEN: "The quality of the state", textID: "Kualitas state"),
            QuestionOption(id: "c", textEN: "The number of actions available", textID: "Jumlah aksi yang tersedia"),
            QuestionOption(id: "d", textEN: "The transition probability", textID: "Probabilitas transisi")
        ],
        correctOptionId: "a",
        explanationEN: "Q^π(s,a) = E[G_t | s_t=s, a_t=a]. Measures the value of taking action a in state s. Optimal Q*: Q*(s,a) = max_π Q^π(s,a). π*(s) = argmax_a Q*(s,a).",
        explanationID: "Q^π(s,a) = E[G_t | s_t=s, a_t=a]. Mengukur nilai mengambil aksi a di state s. Q* optimal: Q*(s,a) = max_π Q^π(s,a).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_008",
        questionEN: "What is the Bellman equation?",
        questionID: "Apa itu persamaan Bellman?",
        options: [
            QuestionOption(id: "a", textEN: "V(s) = R(s) + γ Σ P(s'|s,a) V(s'), recursive relationship for value functions", textID: "V(s) = R(s) + γ Σ P(s'|s,a) V(s'), hubungan rekursif untuk fungsi nilai"),
            QuestionOption(id: "b", textEN: "The loss function for RL", textID: "Fungsi loss untuk RL"),
            QuestionOption(id: "c", textEN: "The policy update rule", textID: "Aturan pembaruan policy"),
            QuestionOption(id: "d", textEN: "The reward scaling equation", textID: "Persamaan skala reward")
        ],
        correctOptionId: "a",
        explanationEN: "Bellman equation: V(s) = E[r + γV(s')]. Expresses value as immediate reward plus discounted future value. Foundation of dynamic programming and RL algorithms.",
        explanationID: "Persamaan Bellman: V(s) = E[r + γV(s')]. Menyatakan nilai sebagai reward langsung plus nilai masa depan yang didiskon. Dasar algoritma DP dan RL.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_009",
        questionEN: "What is the difference between model-based and model-free RL?",
        questionID: "Apa perbedaan antara RL berbasis model dan bebas model?",
        options: [
            QuestionOption(id: "a", textEN: "Model-based learns/uses environment dynamics; model-free learns directly from experience", textID: "Berbasis model mempelajari/menggunakan dinamika lingkungan; bebas model belajar langsung dari pengalaman"),
            QuestionOption(id: "b", textEN: "Model-based is faster than model-free", textID: "Berbasis model lebih cepat dari bebas model"),
            QuestionOption(id: "c", textEN: "Model-free requires more memory", textID: "Bebas model membutuhkan lebih banyak memori"),
            QuestionOption(id: "d", textEN: "Model-based uses neural networks", textID: "Berbasis model menggunakan neural network")
        ],
        correctOptionId: "a",
        explanationEN: "Model-based: learns P(s'|s,a) and R(s,a), can plan ahead. Model-free: learns value/policy directly from experience without explicit model. Q-learning is model-free.",
        explanationID: "Berbasis model: mempelajari P(s'|s,a) dan R(s,a), dapat merencanakan ke depan. Bebas model: mempelajari nilai/policy langsung dari pengalaman tanpa model eksplisit.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_010",
        questionEN: "What is the exploration vs exploitation tradeoff?",
        questionID: "Apa tradeoff eksplorasi vs eksploitasi?",
        options: [
            QuestionOption(id: "a", textEN: "Balancing trying new actions (exploration) vs using known good actions (exploitation)", textID: "Menyeimbangkan mencoba aksi baru (eksplorasi) vs menggunakan aksi baik yang diketahui (eksploitasi)"),
            QuestionOption(id: "b", textEN: "Training vs testing tradeoff", textID: "Tradeoff training vs testing"),
            QuestionOption(id: "c", textEN: "Speed vs accuracy tradeoff", textID: "Tradeoff kecepatan vs akurasi"),
            QuestionOption(id: "d", textEN: "Memory vs computation tradeoff", textID: "Tradeoff memori vs komputasi")
        ],
        correctOptionId: "a",
        explanationEN: "Exploration: try new actions to discover better strategies. Exploitation: use current best knowledge. Too much exploration wastes time; too little may miss optimal solutions.",
        explanationID: "Eksplorasi: mencoba aksi baru untuk menemukan strategi lebih baik. Eksploitasi: menggunakan pengetahuan terbaik saat ini. Terlalu banyak eksplorasi membuang waktu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "rl_011",
        questionEN: "What is ε-greedy exploration?",
        questionID: "Apa itu eksplorasi ε-greedy?",
        options: [
            QuestionOption(id: "a", textEN: "With probability ε take random action, otherwise take best known action", textID: "Dengan probabilitas ε ambil aksi acak, jika tidak ambil aksi terbaik yang diketahui"),
            QuestionOption(id: "b", textEN: "Always take the best action", textID: "Selalu ambil aksi terbaik"),
            QuestionOption(id: "c", textEN: "Always take random action", textID: "Selalu ambil aksi acak"),
            QuestionOption(id: "d", textEN: "Take action proportional to value", textID: "Ambil aksi proporsional dengan nilai")
        ],
        correctOptionId: "a",
        explanationEN: "ε-greedy: argmax_a Q(s,a) with probability 1-ε, random action with probability ε. Simple but effective. ε often decays over time (more exploitation later).",
        explanationID: "ε-greedy: argmax_a Q(s,a) dengan probabilitas 1-ε, aksi acak dengan probabilitas ε. Sederhana tapi efektif. ε sering menurun seiring waktu.",
        topic: "aiMlDl",
        difficulty: .beginner
    ),
    Question(
        id: "rl_012",
        questionEN: "What is temporal difference (TD) learning?",
        questionID: "Apa itu pembelajaran temporal difference (TD)?",
        options: [
            QuestionOption(id: "a", textEN: "Learning from difference between predicted and actual value estimates at successive timesteps", textID: "Belajar dari perbedaan antara perkiraan nilai yang diprediksi dan aktual pada timestep berurutan"),
            QuestionOption(id: "b", textEN: "Learning from time series data", textID: "Belajar dari data time series"),
            QuestionOption(id: "c", textEN: "Learning with different time intervals", textID: "Belajar dengan interval waktu berbeda"),
            QuestionOption(id: "d", textEN: "Learning from differences in rewards", textID: "Belajar dari perbedaan reward")
        ],
        correctOptionId: "a",
        explanationEN: "TD updates: V(s) ← V(s) + α[r + γV(s') - V(s)]. TD error = r + γV(s') - V(s). Combines Monte Carlo (sampling) with dynamic programming (bootstrapping).",
        explanationID: "Pembaruan TD: V(s) ← V(s) + α[r + γV(s') - V(s)]. TD error = r + γV(s') - V(s). Menggabungkan Monte Carlo (sampling) dengan dynamic programming (bootstrapping).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_013",
        questionEN: "What is Monte Carlo vs TD learning?",
        questionID: "Apa perbedaan Monte Carlo vs pembelajaran TD?",
        options: [
            QuestionOption(id: "a", textEN: "MC waits for episode end to update; TD updates after each step (bootstraps)", textID: "MC menunggu akhir episode untuk memperbarui; TD memperbarui setelah setiap langkah (bootstrap)"),
            QuestionOption(id: "b", textEN: "MC is model-based; TD is model-free", textID: "MC berbasis model; TD bebas model"),
            QuestionOption(id: "c", textEN: "MC uses neural networks; TD uses tables", textID: "MC menggunakan neural network; TD menggunakan tabel"),
            QuestionOption(id: "d", textEN: "MC is faster than TD", textID: "MC lebih cepat dari TD")
        ],
        correctOptionId: "a",
        explanationEN: "MC: V(s) ← V(s) + α[G - V(s)] after episode. TD: V(s) ← V(s) + α[r + γV(s') - V(s)] after each step. TD has lower variance but some bias.",
        explanationID: "MC: V(s) ← V(s) + α[G - V(s)] setelah episode. TD: V(s) ← V(s) + α[r + γV(s') - V(s)] setelah setiap langkah. TD memiliki variansi lebih rendah tapi sedikit bias.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_014",
        questionEN: "What is on-policy vs off-policy learning?",
        questionID: "Apa perbedaan pembelajaran on-policy vs off-policy?",
        options: [
            QuestionOption(id: "a", textEN: "On-policy learns about the policy being used; off-policy learns about a different target policy", textID: "On-policy belajar tentang policy yang digunakan; off-policy belajar tentang policy target yang berbeda"),
            QuestionOption(id: "b", textEN: "On-policy is online; off-policy is batch", textID: "On-policy adalah online; off-policy adalah batch"),
            QuestionOption(id: "c", textEN: "On-policy uses policy gradient; off-policy uses value-based", textID: "On-policy menggunakan policy gradient; off-policy menggunakan value-based"),
            QuestionOption(id: "d", textEN: "On-policy is deterministic; off-policy is stochastic", textID: "On-policy deterministik; off-policy stokastik")
        ],
        correctOptionId: "a",
        explanationEN: "On-policy (SARSA): learns Q for behavior policy. Off-policy (Q-learning): learns Q* regardless of behavior policy. Off-policy can use experience replay.",
        explanationID: "On-policy (SARSA): mempelajari Q untuk policy perilaku. Off-policy (Q-learning): mempelajari Q* terlepas dari policy perilaku. Off-policy dapat menggunakan experience replay.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_015",
        questionEN: "What is the advantage function A(s,a)?",
        questionID: "Apa itu fungsi advantage A(s,a)?",
        options: [
            QuestionOption(id: "a", textEN: "A(s,a) = Q(s,a) - V(s), how much better action a is than average", textID: "A(s,a) = Q(s,a) - V(s), seberapa lebih baik aksi a dari rata-rata"),
            QuestionOption(id: "b", textEN: "The advantage of using RL", textID: "Keuntungan menggunakan RL"),
            QuestionOption(id: "c", textEN: "The maximum Q value", textID: "Nilai Q maksimum"),
            QuestionOption(id: "d", textEN: "The policy improvement step", textID: "Langkah perbaikan policy")
        ],
        correctOptionId: "a",
        explanationEN: "Advantage A(s,a) = Q(s,a) - V(s) measures relative value of action a. Used in actor-critic methods. Reduces variance in policy gradients since E[A(s,a)] = 0.",
        explanationID: "Advantage A(s,a) = Q(s,a) - V(s) mengukur nilai relatif aksi a. Digunakan dalam metode actor-critic. Mengurangi variansi dalam policy gradient karena E[A(s,a)] = 0.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Q-Learning (16-25)
    Question(
        id: "rl_016",
        questionEN: "What is Q-learning?",
        questionID: "Apa itu Q-learning?",
        options: [
            QuestionOption(id: "a", textEN: "Off-policy TD algorithm that learns optimal Q* directly: Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]", textID: "Algoritma TD off-policy yang mempelajari Q* secara langsung: Q(s,a) ← Q(s,a) + α[r + γ max Q(s',a') - Q(s,a)]"),
            QuestionOption(id: "b", textEN: "A supervised learning method", textID: "Metode supervised learning"),
            QuestionOption(id: "c", textEN: "A clustering algorithm", textID: "Algoritma clustering"),
            QuestionOption(id: "d", textEN: "A feature extraction technique", textID: "Teknik ekstraksi fitur")
        ],
        correctOptionId: "a",
        explanationEN: "Q-learning update uses max over next actions, learning Q* regardless of exploration policy. Converges to optimal Q* under certain conditions (sufficient exploration, learning rate decay).",
        explanationID: "Pembaruan Q-learning menggunakan max atas aksi berikutnya, mempelajari Q* terlepas dari policy eksplorasi. Konvergen ke Q* optimal dengan kondisi tertentu.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_017",
        questionEN: "What is SARSA?",
        questionID: "Apa itu SARSA?",
        options: [
            QuestionOption(id: "a", textEN: "On-policy TD: Q(s,a) ← Q(s,a) + α[r + γQ(s',a') - Q(s,a)] where a' is actually taken", textID: "TD on-policy: Q(s,a) ← Q(s,a) + α[r + γQ(s',a') - Q(s,a)] dimana a' benar-benar diambil"),
            QuestionOption(id: "b", textEN: "State-Action-Reward-State algorithm", textID: "Algoritma State-Action-Reward-State"),
            QuestionOption(id: "c", textEN: "A model-based RL method", textID: "Metode RL berbasis model"),
            QuestionOption(id: "d", textEN: "A neural network architecture", textID: "Arsitektur neural network")
        ],
        correctOptionId: "a",
        explanationEN: "SARSA: State, Action, Reward, State', Action'. Uses actual next action a' (from policy). More conservative than Q-learning, learns Q^π not Q*.",
        explanationID: "SARSA: State, Action, Reward, State', Action'. Menggunakan aksi berikutnya a' yang sebenarnya (dari policy). Lebih konservatif dari Q-learning, mempelajari Q^π bukan Q*.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_018",
        questionEN: "What is Deep Q-Network (DQN)?",
        questionID: "Apa itu Deep Q-Network (DQN)?",
        options: [
            QuestionOption(id: "a", textEN: "Q-learning with neural network function approximation, plus experience replay and target network", textID: "Q-learning dengan aproksimasi fungsi neural network, plus experience replay dan target network"),
            QuestionOption(id: "b", textEN: "A very deep neural network", textID: "Neural network yang sangat dalam"),
            QuestionOption(id: "c", textEN: "Q-learning with deep features", textID: "Q-learning dengan fitur dalam"),
            QuestionOption(id: "d", textEN: "Double Q-learning", textID: "Double Q-learning")
        ],
        correctOptionId: "a",
        explanationEN: "DQN uses CNN to approximate Q(s,a) from pixels. Key innovations: experience replay (breaks correlation), target network (stabilizes learning). First to achieve human-level Atari.",
        explanationID: "DQN menggunakan CNN untuk mengaproksimasi Q(s,a) dari piksel. Inovasi kunci: experience replay (memutus korelasi), target network (menstabilkan pembelajaran).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_019",
        questionEN: "Why is experience replay important in DQN?",
        questionID: "Mengapa experience replay penting dalam DQN?",
        options: [
            QuestionOption(id: "a", textEN: "Breaks temporal correlation, enables data reuse, and stabilizes training", textID: "Memutus korelasi temporal, memungkinkan penggunaan ulang data, dan menstabilkan training"),
            QuestionOption(id: "b", textEN: "Makes training faster", textID: "Membuat training lebih cepat"),
            QuestionOption(id: "c", textEN: "Reduces memory usage", textID: "Mengurangi penggunaan memori"),
            QuestionOption(id: "d", textEN: "Improves exploration", textID: "Meningkatkan eksplorasi")
        ],
        correctOptionId: "a",
        explanationEN: "Consecutive experiences are correlated, causing unstable learning. Replay buffer stores (s,a,r,s') tuples, randomly sampled for training. Also enables off-policy learning.",
        explanationID: "Pengalaman berurutan berkorelasi, menyebabkan pembelajaran tidak stabil. Replay buffer menyimpan tuple (s,a,r,s'), disampling acak untuk training.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_020",
        questionEN: "What is the target network in DQN?",
        questionID: "Apa itu target network dalam DQN?",
        options: [
            QuestionOption(id: "a", textEN: "A separate network with frozen weights used to compute TD targets, updated periodically", textID: "Network terpisah dengan bobot beku digunakan untuk menghitung target TD, diperbarui secara berkala"),
            QuestionOption(id: "b", textEN: "The main Q network", textID: "Q network utama"),
            QuestionOption(id: "c", textEN: "The network that sets targets for training", textID: "Network yang menetapkan target untuk training"),
            QuestionOption(id: "d", textEN: "The policy network", textID: "Network policy")
        ],
        correctOptionId: "a",
        explanationEN: "Target Q values computed with frozen θ⁻: y = r + γ max_a' Q(s',a';θ⁻). Without target network, Q values chase moving targets, causing oscillation/divergence.",
        explanationID: "Nilai Q target dihitung dengan θ⁻ beku: y = r + γ max_a' Q(s',a';θ⁻). Tanpa target network, nilai Q mengejar target yang bergerak, menyebabkan osilasi/divergensi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_021",
        questionEN: "What is Double DQN?",
        questionID: "Apa itu Double DQN?",
        options: [
            QuestionOption(id: "a", textEN: "Uses online network to select action, target network to evaluate, reducing overestimation", textID: "Menggunakan network online untuk memilih aksi, target network untuk mengevaluasi, mengurangi overestimasi"),
            QuestionOption(id: "b", textEN: "Uses two DQN networks in parallel", textID: "Menggunakan dua network DQN secara paralel"),
            QuestionOption(id: "c", textEN: "DQN with double the layers", textID: "DQN dengan layer dua kali lipat"),
            QuestionOption(id: "d", textEN: "DQN with double learning rate", textID: "DQN dengan learning rate dua kali lipat")
        ],
        correctOptionId: "a",
        explanationEN: "Double DQN: y = r + γQ(s', argmax_a' Q(s',a';θ); θ⁻). Decouples action selection and evaluation, addressing max operator's positive bias.",
        explanationID: "Double DQN: y = r + γQ(s', argmax_a' Q(s',a';θ); θ⁻). Memisahkan seleksi aksi dan evaluasi, mengatasi bias positif dari operator max.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_022",
        questionEN: "What is Prioritized Experience Replay?",
        questionID: "Apa itu Prioritized Experience Replay?",
        options: [
            QuestionOption(id: "a", textEN: "Sampling transitions with high TD error more frequently for more efficient learning", textID: "Mengambil sampel transisi dengan TD error tinggi lebih sering untuk pembelajaran lebih efisien"),
            QuestionOption(id: "b", textEN: "Storing experiences in priority order", textID: "Menyimpan pengalaman dalam urutan prioritas"),
            QuestionOption(id: "c", textEN: "Prioritizing recent experiences", textID: "Memprioritaskan pengalaman terbaru"),
            QuestionOption(id: "d", textEN: "Removing low-priority experiences", textID: "Menghapus pengalaman prioritas rendah")
        ],
        correctOptionId: "a",
        explanationEN: "PER samples proportional to |TD error|^α. Experiences where model prediction is worst are sampled more. Importance sampling weights correct for bias.",
        explanationID: "PER mengambil sampel proporsional dengan |TD error|^α. Pengalaman dimana prediksi model terburuk disampling lebih banyak. Bobot importance sampling memperbaiki bias.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_023",
        questionEN: "What is Dueling DQN?",
        questionID: "Apa itu Dueling DQN?",
        options: [
            QuestionOption(id: "a", textEN: "Separates Q into V(s) and A(s,a): Q(s,a) = V(s) + A(s,a) - mean(A)", textID: "Memisahkan Q menjadi V(s) dan A(s,a): Q(s,a) = V(s) + A(s,a) - mean(A)"),
            QuestionOption(id: "b", textEN: "Two DQNs competing", textID: "Dua DQN yang bersaing"),
            QuestionOption(id: "c", textEN: "DQN for competitive games", textID: "DQN untuk game kompetitif"),
            QuestionOption(id: "d", textEN: "DQN with adversarial training", textID: "DQN dengan training adversarial")
        ],
        correctOptionId: "a",
        explanationEN: "Dueling architecture has two streams: V(s) (state value) and A(s,a) (advantage). Combined: Q = V + (A - mean(A)). Better generalization when actions don't matter much.",
        explanationID: "Arsitektur dueling memiliki dua stream: V(s) (nilai state) dan A(s,a) (advantage). Digabungkan: Q = V + (A - mean(A)). Generalisasi lebih baik saat aksi tidak terlalu penting.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_024",
        questionEN: "What is the deadly triad in deep RL?",
        questionID: "Apa itu deadly triad dalam deep RL?",
        options: [
            QuestionOption(id: "a", textEN: "Function approximation + bootstrapping + off-policy can cause instability", textID: "Aproksimasi fungsi + bootstrapping + off-policy dapat menyebabkan ketidakstabilan"),
            QuestionOption(id: "b", textEN: "Three types of errors in RL", textID: "Tiga jenis error dalam RL"),
            QuestionOption(id: "c", textEN: "Three competing objectives", textID: "Tiga objektif yang bersaing"),
            QuestionOption(id: "d", textEN: "Three hyperparameters to tune", textID: "Tiga hyperparameter untuk ditune")
        ],
        correctOptionId: "a",
        explanationEN: "The combination of: (1) function approximation (neural net), (2) bootstrapping (TD), (3) off-policy (different behavior and target policies) can lead to divergence.",
        explanationID: "Kombinasi dari: (1) aproksimasi fungsi (neural net), (2) bootstrapping (TD), (3) off-policy (policy perilaku dan target berbeda) dapat menyebabkan divergensi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_025",
        questionEN: "What is Rainbow DQN?",
        questionID: "Apa itu Rainbow DQN?",
        options: [
            QuestionOption(id: "a", textEN: "Combination of multiple DQN improvements: Double, Dueling, PER, n-step, Distributional, Noisy", textID: "Kombinasi beberapa perbaikan DQN: Double, Dueling, PER, n-step, Distributional, Noisy"),
            QuestionOption(id: "b", textEN: "DQN for colorful environments", textID: "DQN untuk lingkungan berwarna"),
            QuestionOption(id: "c", textEN: "DQN with rainbow rewards", textID: "DQN dengan reward rainbow"),
            QuestionOption(id: "d", textEN: "Multi-agent DQN", textID: "DQN multi-agen")
        ],
        correctOptionId: "a",
        explanationEN: "Rainbow combines 6 DQN extensions. Each addresses different issues: Double (overestimation), PER (sample efficiency), Dueling (state/action value), etc. State-of-the-art on Atari.",
        explanationID: "Rainbow menggabungkan 6 ekstensi DQN. Masing-masing mengatasi masalah berbeda: Double (overestimasi), PER (efisiensi sampel), Dueling (nilai state/aksi), dll.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Policy Gradient Methods (26-40)
    Question(
        id: "rl_026",
        questionEN: "What is policy gradient?",
        questionID: "Apa itu policy gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Directly optimizing parameterized policy by gradient ascent on expected return", textID: "Mengoptimalkan policy berparameter secara langsung dengan gradient ascent pada return yang diharapkan"),
            QuestionOption(id: "b", textEN: "Computing gradients of the value function", textID: "Menghitung gradien dari fungsi nilai"),
            QuestionOption(id: "c", textEN: "Using gradients to update state", textID: "Menggunakan gradien untuk memperbarui state"),
            QuestionOption(id: "d", textEN: "Policy iteration with gradients", textID: "Iterasi policy dengan gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Policy gradient directly parameterizes policy π_θ(a|s). Update: θ ← θ + α∇_θ J(θ). Policy Gradient Theorem: ∇J = E[∇log π_θ(a|s) Q^π(s,a)].",
        explanationID: "Policy gradient secara langsung memparameterisasi policy π_θ(a|s). Pembaruan: θ ← θ + α∇_θ J(θ). Teorema Policy Gradient: ∇J = E[∇log π_θ(a|s) Q^π(s,a)].",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_027",
        questionEN: "What is REINFORCE algorithm?",
        questionID: "Apa itu algoritma REINFORCE?",
        options: [
            QuestionOption(id: "a", textEN: "Monte Carlo policy gradient: θ ← θ + α G_t ∇log π_θ(a_t|s_t)", textID: "Policy gradient Monte Carlo: θ ← θ + α G_t ∇log π_θ(a_t|s_t)"),
            QuestionOption(id: "b", textEN: "Reinforcement of good behaviors", textID: "Penguatan perilaku baik"),
            QuestionOption(id: "c", textEN: "A value-based method", textID: "Metode berbasis nilai"),
            QuestionOption(id: "d", textEN: "A model-based algorithm", textID: "Algoritma berbasis model")
        ],
        correctOptionId: "a",
        explanationEN: "REINFORCE uses full episode return G_t to update policy. Unbiased but high variance. Often uses baseline (V(s)) to reduce variance: θ ← θ + α(G_t - b)∇log π.",
        explanationID: "REINFORCE menggunakan return episode penuh G_t untuk memperbarui policy. Tidak bias tapi variansi tinggi. Sering menggunakan baseline (V(s)) untuk mengurangi variansi.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_028",
        questionEN: "What is Actor-Critic?",
        questionID: "Apa itu Actor-Critic?",
        options: [
            QuestionOption(id: "a", textEN: "Actor learns policy, Critic learns value function to guide the actor", textID: "Actor mempelajari policy, Critic mempelajari fungsi nilai untuk membimbing actor"),
            QuestionOption(id: "b", textEN: "Two agents competing", textID: "Dua agen yang bersaing"),
            QuestionOption(id: "c", textEN: "Actor network and critic loss", textID: "Network actor dan loss critic"),
            QuestionOption(id: "d", textEN: "Human evaluation of RL agents", textID: "Evaluasi manusia terhadap agen RL")
        ],
        correctOptionId: "a",
        explanationEN: "Actor: policy network π_θ(a|s). Critic: value network V_φ(s) or Q_φ(s,a). Actor updates using policy gradient with advantage from critic. Reduces variance vs pure policy gradient.",
        explanationID: "Actor: network policy π_θ(a|s). Critic: network nilai V_φ(s) atau Q_φ(s,a). Actor memperbarui menggunakan policy gradient dengan advantage dari critic.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_029",
        questionEN: "What is A2C (Advantage Actor-Critic)?",
        questionID: "Apa itu A2C (Advantage Actor-Critic)?",
        options: [
            QuestionOption(id: "a", textEN: "Actor-Critic using advantage A(s,a) = Q(s,a) - V(s) for lower variance updates", textID: "Actor-Critic menggunakan advantage A(s,a) = Q(s,a) - V(s) untuk pembaruan variansi lebih rendah"),
            QuestionOption(id: "b", textEN: "Two actor networks", textID: "Dua network actor"),
            QuestionOption(id: "c", textEN: "Asynchronous actor-critic", textID: "Actor-critic asinkron"),
            QuestionOption(id: "d", textEN: "Second-order actor-critic", textID: "Actor-critic orde kedua")
        ],
        correctOptionId: "a",
        explanationEN: "A2C uses advantage: ∇J ≈ E[A(s,a)∇log π(a|s)]. Critic estimates V(s), advantage is TD error: A ≈ r + γV(s') - V(s). Lower variance than using returns directly.",
        explanationID: "A2C menggunakan advantage: ∇J ≈ E[A(s,a)∇log π(a|s)]. Critic mengestimasi V(s), advantage adalah TD error: A ≈ r + γV(s') - V(s).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_030",
        questionEN: "What is A3C (Asynchronous Advantage Actor-Critic)?",
        questionID: "Apa itu A3C (Asynchronous Advantage Actor-Critic)?",
        options: [
            QuestionOption(id: "a", textEN: "Multiple parallel actors collecting experience asynchronously, updating shared model", textID: "Beberapa actor paralel mengumpulkan pengalaman secara asinkron, memperbarui model bersama"),
            QuestionOption(id: "b", textEN: "Three actor networks", textID: "Tiga network actor"),
            QuestionOption(id: "c", textEN: "A2C with three critics", textID: "A2C dengan tiga critic"),
            QuestionOption(id: "d", textEN: "Third-order actor-critic", textID: "Actor-critic orde ketiga")
        ],
        correctOptionId: "a",
        explanationEN: "A3C runs multiple actor-learners in parallel on different environment instances. No experience replay needed (diverse experience from parallel actors). Faster training on CPU.",
        explanationID: "A3C menjalankan beberapa actor-learner secara paralel pada instance lingkungan berbeda. Tidak perlu experience replay (pengalaman beragam dari actor paralel).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_031",
        questionEN: "What is PPO (Proximal Policy Optimization)?",
        questionID: "Apa itu PPO (Proximal Policy Optimization)?",
        options: [
            QuestionOption(id: "a", textEN: "Constrains policy updates to be small using clipping: min(r*A, clip(r,1-ε,1+ε)*A)", textID: "Membatasi pembaruan policy menjadi kecil menggunakan clipping: min(r*A, clip(r,1-ε,1+ε)*A)"),
            QuestionOption(id: "b", textEN: "Proximal gradient descent", textID: "Gradient descent proksimal"),
            QuestionOption(id: "c", textEN: "Optimizing nearby policies", textID: "Mengoptimalkan policy terdekat"),
            QuestionOption(id: "d", textEN: "Policy optimization with proximity constraint", textID: "Optimisasi policy dengan kendala kedekatan")
        ],
        correctOptionId: "a",
        explanationEN: "PPO clips the probability ratio r = π_new/π_old to [1-ε, 1+ε]. Prevents too large policy updates. Simpler than TRPO, state-of-the-art for many tasks.",
        explanationID: "PPO memotong rasio probabilitas r = π_new/π_old ke [1-ε, 1+ε]. Mencegah pembaruan policy terlalu besar. Lebih sederhana dari TRPO, state-of-the-art untuk banyak tugas.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_032",
        questionEN: "What is TRPO (Trust Region Policy Optimization)?",
        questionID: "Apa itu TRPO (Trust Region Policy Optimization)?",
        options: [
            QuestionOption(id: "a", textEN: "Constrains policy updates using KL divergence: max J(θ) s.t. KL(π_old, π_new) ≤ δ", textID: "Membatasi pembaruan policy menggunakan KL divergence: max J(θ) s.t. KL(π_old, π_new) ≤ δ"),
            QuestionOption(id: "b", textEN: "Training in a trusted environment", textID: "Training di lingkungan tepercaya"),
            QuestionOption(id: "c", textEN: "Optimizing trust in the policy", textID: "Mengoptimalkan kepercayaan pada policy"),
            QuestionOption(id: "d", textEN: "Regional policy optimization", textID: "Optimisasi policy regional")
        ],
        correctOptionId: "a",
        explanationEN: "TRPO uses KL constraint to limit policy change, ensuring monotonic improvement. Solves constrained optimization with conjugate gradient. More complex than PPO but theoretically grounded.",
        explanationID: "TRPO menggunakan kendala KL untuk membatasi perubahan policy, memastikan perbaikan monoton. Menyelesaikan optimisasi terkendala dengan conjugate gradient.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_033",
        questionEN: "What is SAC (Soft Actor-Critic)?",
        questionID: "Apa itu SAC (Soft Actor-Critic)?",
        options: [
            QuestionOption(id: "a", textEN: "Off-policy actor-critic that maximizes entropy + return for better exploration", textID: "Actor-critic off-policy yang memaksimalkan entropi + return untuk eksplorasi lebih baik"),
            QuestionOption(id: "b", textEN: "Smooth actor-critic updates", textID: "Pembaruan actor-critic yang mulus"),
            QuestionOption(id: "c", textEN: "Actor-critic with soft targets", textID: "Actor-critic dengan target lunak"),
            QuestionOption(id: "d", textEN: "Conservative actor-critic", textID: "Actor-critic konservatif")
        ],
        correctOptionId: "a",
        explanationEN: "SAC objective: J = E[Σ(r + α H(π))] where H is entropy. Encourages exploration, more robust. Uses twin critics (min of two Q estimates) to reduce overestimation.",
        explanationID: "Objektif SAC: J = E[Σ(r + α H(π))] dimana H adalah entropi. Mendorong eksplorasi, lebih robust. Menggunakan twin critic (min dari dua estimasi Q) untuk mengurangi overestimasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_034",
        questionEN: "What is the entropy bonus in policy gradient?",
        questionID: "Apa itu bonus entropi dalam policy gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Adding H(π) to objective encourages exploration by preventing premature convergence", textID: "Menambahkan H(π) ke objektif mendorong eksplorasi dengan mencegah konvergensi prematur"),
            QuestionOption(id: "b", textEN: "Bonus for random actions", textID: "Bonus untuk aksi acak"),
            QuestionOption(id: "c", textEN: "Reward for information gain", textID: "Reward untuk perolehan informasi"),
            QuestionOption(id: "d", textEN: "Penalizing low entropy", textID: "Menghukum entropi rendah")
        ],
        correctOptionId: "a",
        explanationEN: "Entropy H(π) = -Σπ(a|s)log π(a|s). High entropy = more random policy. Adding αH to objective keeps policy stochastic, improving exploration and robustness.",
        explanationID: "Entropi H(π) = -Σπ(a|s)log π(a|s). Entropi tinggi = policy lebih acak. Menambahkan αH ke objektif menjaga policy stokastik, meningkatkan eksplorasi dan ketahanan.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_035",
        questionEN: "What is DDPG (Deep Deterministic Policy Gradient)?",
        questionID: "Apa itu DDPG (Deep Deterministic Policy Gradient)?",
        options: [
            QuestionOption(id: "a", textEN: "Off-policy actor-critic for continuous actions using deterministic policy", textID: "Actor-critic off-policy untuk aksi kontinu menggunakan policy deterministik"),
            QuestionOption(id: "b", textEN: "Double deep policy gradient", textID: "Double deep policy gradient"),
            QuestionOption(id: "c", textEN: "DQN for policy gradient", textID: "DQN untuk policy gradient"),
            QuestionOption(id: "d", textEN: "Distributed policy gradient", textID: "Policy gradient terdistribusi")
        ],
        correctOptionId: "a",
        explanationEN: "DDPG: DPG + DQN techniques. Deterministic actor μ(s) for continuous actions. Uses experience replay, target networks. Critic learns Q(s,a), actor maximizes Q via ∂Q/∂a.",
        explanationID: "DDPG: DPG + teknik DQN. Actor deterministik μ(s) untuk aksi kontinu. Menggunakan experience replay, target network. Critic mempelajari Q(s,a), actor memaksimalkan Q via ∂Q/∂a.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_036",
        questionEN: "What is TD3 (Twin Delayed DDPG)?",
        questionID: "Apa itu TD3 (Twin Delayed DDPG)?",
        options: [
            QuestionOption(id: "a", textEN: "DDPG with twin critics, delayed policy updates, and target policy smoothing", textID: "DDPG dengan twin critic, pembaruan policy tertunda, dan smoothing policy target"),
            QuestionOption(id: "b", textEN: "Three DDPG networks", textID: "Tiga network DDPG"),
            QuestionOption(id: "c", textEN: "DDPG with three delays", textID: "DDPG dengan tiga delay"),
            QuestionOption(id: "d", textEN: "Triple delayed DDPG", textID: "Triple delayed DDPG")
        ],
        correctOptionId: "a",
        explanationEN: "TD3 addresses DDPG's overestimation: (1) Twin critics (use min Q), (2) Delayed actor updates, (3) Target policy smoothing (add noise to target action). More stable than DDPG.",
        explanationID: "TD3 mengatasi overestimasi DDPG: (1) Twin critic (gunakan min Q), (2) Pembaruan actor tertunda, (3) Smoothing policy target (tambah noise ke aksi target).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_037",
        questionEN: "What is the policy gradient variance problem?",
        questionID: "Apa masalah variansi policy gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Monte Carlo returns have high variance, leading to unstable learning", textID: "Return Monte Carlo memiliki variansi tinggi, menyebabkan pembelajaran tidak stabil"),
            QuestionOption(id: "b", textEN: "Policies have variable gradients", textID: "Policy memiliki gradien variabel"),
            QuestionOption(id: "c", textEN: "Different states have different variances", textID: "State berbeda memiliki variansi berbeda"),
            QuestionOption(id: "d", textEN: "Variance in action selection", textID: "Variansi dalam pemilihan aksi")
        ],
        correctOptionId: "a",
        explanationEN: "Using Σr as gradient weight has high variance because returns vary greatly across episodes. Solutions: baseline subtraction, actor-critic (TD instead of MC), GAE.",
        explanationID: "Menggunakan Σr sebagai bobot gradien memiliki variansi tinggi karena return sangat bervariasi antar episode. Solusi: pengurangan baseline, actor-critic (TD bukan MC), GAE.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_038",
        questionEN: "What is GAE (Generalized Advantage Estimation)?",
        questionID: "Apa itu GAE (Generalized Advantage Estimation)?",
        options: [
            QuestionOption(id: "a", textEN: "Exponentially-weighted average of n-step advantage estimates to balance bias-variance", textID: "Rata-rata tertimbang eksponensial dari estimasi advantage n-step untuk menyeimbangkan bias-variansi"),
            QuestionOption(id: "b", textEN: "General advantage function", textID: "Fungsi advantage umum"),
            QuestionOption(id: "c", textEN: "Generalized actor estimation", textID: "Estimasi actor umum"),
            QuestionOption(id: "d", textEN: "Global advantage estimation", textID: "Estimasi advantage global")
        ],
        correctOptionId: "a",
        explanationEN: "GAE: A^GAE = Σ(γλ)^l δ_{t+l} where δ is TD error. λ=0: one-step TD (low variance, high bias). λ=1: Monte Carlo (high variance, no bias). λ∈(0,1) trades off.",
        explanationID: "GAE: A^GAE = Σ(γλ)^l δ_{t+l} dimana δ adalah TD error. λ=0: TD satu langkah (variansi rendah, bias tinggi). λ=1: Monte Carlo (variansi tinggi, tanpa bias).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_039",
        questionEN: "What is the importance sampling ratio in off-policy policy gradient?",
        questionID: "Apa itu rasio importance sampling dalam policy gradient off-policy?",
        options: [
            QuestionOption(id: "a", textEN: "π_θ(a|s)/π_β(a|s), corrects for using data from different policy β", textID: "π_θ(a|s)/π_β(a|s), memperbaiki penggunaan data dari policy β yang berbeda"),
            QuestionOption(id: "b", textEN: "Ratio of important samples", textID: "Rasio sampel penting"),
            QuestionOption(id: "c", textEN: "Sample importance weight", textID: "Bobot pentingnya sampel"),
            QuestionOption(id: "d", textEN: "Policy importance ratio", textID: "Rasio pentingnya policy")
        ],
        correctOptionId: "a",
        explanationEN: "When learning π_θ from data collected by π_β, weight by ρ = π_θ/π_β. High ρ means current policy more likely to take that action. PPO clips this ratio for stability.",
        explanationID: "Saat mempelajari π_θ dari data yang dikumpulkan oleh π_β, beri bobot dengan ρ = π_θ/π_β. ρ tinggi berarti policy saat ini lebih mungkin mengambil aksi itu.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_040",
        questionEN: "What is natural policy gradient?",
        questionID: "Apa itu natural policy gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Uses Fisher information matrix to account for policy geometry: θ ← θ + αF⁻¹∇J", textID: "Menggunakan matriks informasi Fisher untuk memperhitungkan geometri policy: θ ← θ + αF⁻¹∇J"),
            QuestionOption(id: "b", textEN: "Gradient in natural coordinates", textID: "Gradien dalam koordinat natural"),
            QuestionOption(id: "c", textEN: "Natural language policy gradient", textID: "Policy gradient bahasa natural"),
            QuestionOption(id: "d", textEN: "Biologically-inspired gradient", textID: "Gradien terinspirasi biologis")
        ],
        correctOptionId: "a",
        explanationEN: "Natural gradient uses Fisher information F = E[∇log π ∇log π^T] to weight gradients by curvature of probability manifold. Makes updates independent of parameterization.",
        explanationID: "Natural gradient menggunakan informasi Fisher F = E[∇log π ∇log π^T] untuk memberi bobot gradien berdasarkan kelengkungan manifold probabilitas.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),

    // MARK: - Advanced Topics (41-50)
    Question(
        id: "rl_041",
        questionEN: "What is imitation learning?",
        questionID: "Apa itu imitation learning?",
        options: [
            QuestionOption(id: "a", textEN: "Learning policy from expert demonstrations without explicit reward", textID: "Mempelajari policy dari demonstrasi ahli tanpa reward eksplisit"),
            QuestionOption(id: "b", textEN: "Copying other agents' behavior", textID: "Menyalin perilaku agen lain"),
            QuestionOption(id: "c", textEN: "Learning to imitate rewards", textID: "Belajar meniru reward"),
            QuestionOption(id: "d", textEN: "Transfer learning in RL", textID: "Transfer learning dalam RL")
        ],
        correctOptionId: "a",
        explanationEN: "Behavioral cloning: supervised learning on (s,a) pairs. DAgger: iteratively query expert. Inverse RL: infer reward function. GAIL: adversarial imitation learning.",
        explanationID: "Behavioral cloning: supervised learning pada pasangan (s,a). DAgger: query ahli secara iteratif. Inverse RL: menyimpulkan fungsi reward. GAIL: imitation learning adversarial.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_042",
        questionEN: "What is inverse reinforcement learning (IRL)?",
        questionID: "Apa itu inverse reinforcement learning (IRL)?",
        options: [
            QuestionOption(id: "a", textEN: "Learning the reward function from expert demonstrations", textID: "Mempelajari fungsi reward dari demonstrasi ahli"),
            QuestionOption(id: "b", textEN: "Reversing the RL process", textID: "Membalikkan proses RL"),
            QuestionOption(id: "c", textEN: "Learning inverse policies", textID: "Mempelajari policy inverse"),
            QuestionOption(id: "d", textEN: "Negative reinforcement learning", textID: "Reinforcement learning negatif")
        ],
        correctOptionId: "a",
        explanationEN: "IRL assumes expert is optimal and finds reward R such that expert policy is optimal for R. Ill-posed (many rewards explain same behavior). MaxEnt IRL uses entropy regularization.",
        explanationID: "IRL mengasumsikan ahli optimal dan menemukan reward R sehingga policy ahli optimal untuk R. Ill-posed (banyak reward menjelaskan perilaku sama).",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_043",
        questionEN: "What is reward shaping?",
        questionID: "Apa itu reward shaping?",
        options: [
            QuestionOption(id: "a", textEN: "Adding auxiliary rewards to guide learning while preserving optimal policy", textID: "Menambahkan reward tambahan untuk membimbing pembelajaran sambil mempertahankan policy optimal"),
            QuestionOption(id: "b", textEN: "Changing the shape of reward function", textID: "Mengubah bentuk fungsi reward"),
            QuestionOption(id: "c", textEN: "Normalizing rewards", textID: "Menormalisasi reward"),
            QuestionOption(id: "d", textEN: "Clipping rewards", textID: "Memotong reward")
        ],
        correctOptionId: "a",
        explanationEN: "Potential-based shaping: F(s,a,s') = γΦ(s') - Φ(s) guarantees same optimal policy. Can dramatically speed up learning by providing intermediate guidance.",
        explanationID: "Shaping berbasis potensial: F(s,a,s') = γΦ(s') - Φ(s) menjamin policy optimal yang sama. Dapat mempercepat pembelajaran dengan memberikan panduan antara.",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_044",
        questionEN: "What is hierarchical reinforcement learning?",
        questionID: "Apa itu hierarchical reinforcement learning?",
        options: [
            QuestionOption(id: "a", textEN: "Decomposing tasks into hierarchy of subtasks/options with different time scales", textID: "Mendekomposisi tugas menjadi hierarki subtugas/opsi dengan skala waktu berbeda"),
            QuestionOption(id: "b", textEN: "RL with hierarchical rewards", textID: "RL dengan reward hierarkis"),
            QuestionOption(id: "c", textEN: "Multi-level neural networks for RL", textID: "Neural network multi-level untuk RL"),
            QuestionOption(id: "d", textEN: "Prioritized task learning", textID: "Pembelajaran tugas yang diprioritaskan")
        ],
        correctOptionId: "a",
        explanationEN: "HRL uses temporal abstraction. Options framework: high-level policy selects options (macro-actions), low-level executes. Addresses credit assignment over long horizons.",
        explanationID: "HRL menggunakan abstraksi temporal. Framework opsi: policy tingkat tinggi memilih opsi (aksi makro), tingkat rendah mengeksekusi. Mengatasi credit assignment jangka panjang.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_045",
        questionEN: "What is multi-agent reinforcement learning?",
        questionID: "Apa itu multi-agent reinforcement learning?",
        options: [
            QuestionOption(id: "a", textEN: "Multiple agents learning and interacting in shared environment", textID: "Beberapa agen belajar dan berinteraksi dalam lingkungan bersama"),
            QuestionOption(id: "b", textEN: "One agent learning multiple tasks", textID: "Satu agen mempelajari beberapa tugas"),
            QuestionOption(id: "c", textEN: "Distributed training of single agent", textID: "Training terdistribusi dari satu agen"),
            QuestionOption(id: "d", textEN: "Ensemble of RL agents", textID: "Ensemble agen RL")
        ],
        correctOptionId: "a",
        explanationEN: "MARL: agents may cooperate, compete, or both. Non-stationarity challenge: other agents' policies change. Approaches: independent learners, centralized training, communication.",
        explanationID: "MARL: agen dapat bekerja sama, bersaing, atau keduanya. Tantangan non-stasioneritas: policy agen lain berubah. Pendekatan: learner independen, training terpusat, komunikasi.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_046",
        questionEN: "What is sim-to-real transfer in RL?",
        questionID: "Apa itu transfer sim-to-real dalam RL?",
        options: [
            QuestionOption(id: "a", textEN: "Training in simulation and deploying to real world, addressing the reality gap", textID: "Training di simulasi dan deploy ke dunia nyata, mengatasi kesenjangan realitas"),
            QuestionOption(id: "b", textEN: "Converting simulation to real environment", textID: "Mengonversi simulasi ke lingkungan nyata"),
            QuestionOption(id: "c", textEN: "Real-time simulation", textID: "Simulasi real-time"),
            QuestionOption(id: "d", textEN: "Simulating real scenarios", textID: "Mensimulasikan skenario nyata")
        ],
        correctOptionId: "a",
        explanationEN: "Reality gap: policies trained in simulation may fail in real world. Solutions: domain randomization (vary simulation parameters), system identification, domain adaptation.",
        explanationID: "Kesenjangan realitas: policy yang dilatih di simulasi mungkin gagal di dunia nyata. Solusi: randomisasi domain, identifikasi sistem, adaptasi domain.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_047",
        questionEN: "What is curriculum learning in RL?",
        questionID: "Apa itu curriculum learning dalam RL?",
        options: [
            QuestionOption(id: "a", textEN: "Gradually increasing task difficulty during training", textID: "Secara bertahap meningkatkan kesulitan tugas selama training"),
            QuestionOption(id: "b", textEN: "Learning from a curriculum of experts", textID: "Belajar dari kurikulum ahli"),
            QuestionOption(id: "c", textEN: "School-based learning", textID: "Pembelajaran berbasis sekolah"),
            QuestionOption(id: "d", textEN: "Structured lesson plans", textID: "Rencana pelajaran terstruktur")
        ],
        correctOptionId: "a",
        explanationEN: "Start with easier tasks, progressively harder. Helps with sparse rewards and complex tasks. Can be manual or automatic (based on agent progress).",
        explanationID: "Mulai dengan tugas lebih mudah, secara progresif lebih sulit. Membantu dengan reward sparse dan tugas kompleks. Dapat manual atau otomatis (berdasarkan kemajuan agen).",
        topic: "aiMlDl",
        difficulty: .intermediate
    ),
    Question(
        id: "rl_048",
        questionEN: "What is curiosity-driven exploration?",
        questionID: "Apa itu eksplorasi berbasis rasa ingin tahu?",
        options: [
            QuestionOption(id: "a", textEN: "Intrinsic reward based on prediction error or novelty to encourage exploration", textID: "Reward intrinsik berdasarkan error prediksi atau kebaruan untuk mendorong eksplorasi"),
            QuestionOption(id: "b", textEN: "Exploring out of curiosity", textID: "Mengeksplorasi karena rasa ingin tahu"),
            QuestionOption(id: "c", textEN: "Random exploration", textID: "Eksplorasi acak"),
            QuestionOption(id: "d", textEN: "Expert-guided exploration", textID: "Eksplorasi yang dipandu ahli")
        ],
        correctOptionId: "a",
        explanationEN: "ICM (Intrinsic Curiosity Module): reward = |f(s') - f̂(s,a)|. High prediction error = novel state = intrinsic reward. Helps in sparse reward environments.",
        explanationID: "ICM (Intrinsic Curiosity Module): reward = |f(s') - f̂(s,a)|. Error prediksi tinggi = state baru = reward intrinsik. Membantu di lingkungan reward sparse.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_049",
        questionEN: "What is offline/batch RL?",
        questionID: "Apa itu offline/batch RL?",
        options: [
            QuestionOption(id: "a", textEN: "Learning from fixed dataset without further environment interaction", textID: "Belajar dari dataset tetap tanpa interaksi lingkungan lebih lanjut"),
            QuestionOption(id: "b", textEN: "Training in batches", textID: "Training dalam batch"),
            QuestionOption(id: "c", textEN: "RL without online updates", textID: "RL tanpa pembaruan online"),
            QuestionOption(id: "d", textEN: "Delayed training", textID: "Training tertunda")
        ],
        correctOptionId: "a",
        explanationEN: "Offline RL learns from logged data only (no exploration). Challenge: distribution shift between data and learned policy. Solutions: conservative Q-learning, behavior regularization.",
        explanationID: "Offline RL belajar dari data log saja (tanpa eksplorasi). Tantangan: pergeseran distribusi antara data dan policy yang dipelajari. Solusi: Q-learning konservatif, regularisasi perilaku.",
        topic: "aiMlDl",
        difficulty: .advanced
    ),
    Question(
        id: "rl_050",
        questionEN: "What is RLHF (Reinforcement Learning from Human Feedback)?",
        questionID: "Apa itu RLHF (Reinforcement Learning from Human Feedback)?",
        options: [
            QuestionOption(id: "a", textEN: "Training reward model from human preferences, then using it for RL", textID: "Melatih model reward dari preferensi manusia, lalu menggunakannya untuk RL"),
            QuestionOption(id: "b", textEN: "Humans providing rewards directly", textID: "Manusia memberikan reward secara langsung"),
            QuestionOption(id: "c", textEN: "Human in the loop training", textID: "Training dengan manusia dalam loop"),
            QuestionOption(id: "d", textEN: "Feedback-based learning", textID: "Pembelajaran berbasis feedback")
        ],
        correctOptionId: "a",
        explanationEN: "RLHF: (1) Collect human comparisons, (2) Train reward model on preferences, (3) Optimize policy with RL (usually PPO). Key technique for aligning LLMs (ChatGPT, Claude).",
        explanationID: "RLHF: (1) Kumpulkan perbandingan manusia, (2) Latih model reward pada preferensi, (3) Optimalkan policy dengan RL (biasanya PPO). Teknik kunci untuk menyelaraskan LLM.",
        topic: "aiMlDl",
        difficulty: .intermediate
    )
]
