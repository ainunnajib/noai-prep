import Foundation

// MARK: - Computing: PyTorch Questions (50 questions)
// Subcategory: Tensors, autograd, neural networks, training

let pytorchQuestions: [Question] = [
    // Batch 1: Basic PyTorch (10 questions)
    Question(
        id: "pt001",
        questionEN: "What is the fundamental data structure in PyTorch?",
        questionID: "Apa struktur data fundamental di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Array", textID: "Array"),
            QuestionOption(id: "b", textEN: "Tensor", textID: "Tensor"),
            QuestionOption(id: "c", textEN: "Matrix", textID: "Matrix"),
            QuestionOption(id: "d", textEN: "DataFrame", textID: "DataFrame")
        ],
        correctOptionId: "b",
        explanationEN: "Tensor is PyTorch's fundamental data structure, similar to NumPy arrays but with GPU support and automatic differentiation capabilities.",
        explanationID: "Tensor adalah struktur data fundamental PyTorch, mirip array NumPy tapi dengan dukungan GPU dan kemampuan diferensiasi otomatis.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt002",
        questionEN: "How do you create a tensor from a Python list?",
        questionID: "Bagaimana cara membuat tensor dari list Python?",
        options: [
            QuestionOption(id: "a", textEN: "torch.tensor([1, 2, 3])", textID: "torch.tensor([1, 2, 3])"),
            QuestionOption(id: "b", textEN: "torch.array([1, 2, 3])", textID: "torch.array([1, 2, 3])"),
            QuestionOption(id: "c", textEN: "torch.list([1, 2, 3])", textID: "torch.list([1, 2, 3])"),
            QuestionOption(id: "d", textEN: "torch.create([1, 2, 3])", textID: "torch.create([1, 2, 3])")
        ],
        correctOptionId: "a",
        explanationEN: "torch.tensor() creates a tensor from data. torch.Tensor() also works but torch.tensor() is preferred as it infers dtype.",
        explanationID: "torch.tensor() membuat tensor dari data. torch.Tensor() juga bekerja tapi torch.tensor() lebih disukai karena menyimpulkan dtype.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt003",
        questionEN: "What does requires_grad=True do when creating a tensor?",
        questionID: "Apa yang dilakukan requires_grad=True saat membuat tensor?",
        options: [
            QuestionOption(id: "a", textEN: "Requires gradient descent for optimization", textID: "Memerlukan gradient descent untuk optimisasi"),
            QuestionOption(id: "b", textEN: "Enables automatic gradient computation for this tensor", textID: "Mengaktifkan komputasi gradien otomatis untuk tensor ini"),
            QuestionOption(id: "c", textEN: "Requires a graphics card", textID: "Memerlukan kartu grafis"),
            QuestionOption(id: "d", textEN: "Enables parallel computation", textID: "Mengaktifkan komputasi paralel")
        ],
        correctOptionId: "b",
        explanationEN: "requires_grad=True tells PyTorch to track operations on the tensor for automatic differentiation (autograd) during backpropagation.",
        explanationID: "requires_grad=True memberitahu PyTorch untuk melacak operasi pada tensor untuk diferensiasi otomatis (autograd) selama backpropagation.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt004",
        questionEN: "How do you move a tensor to GPU in PyTorch?",
        questionID: "Bagaimana cara memindahkan tensor ke GPU di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "tensor.gpu()", textID: "tensor.gpu()"),
            QuestionOption(id: "b", textEN: "tensor.to('cuda') or tensor.cuda()", textID: "tensor.to('cuda') atau tensor.cuda()"),
            QuestionOption(id: "c", textEN: "gpu(tensor)", textID: "gpu(tensor)"),
            QuestionOption(id: "d", textEN: "tensor.move('gpu')", textID: "tensor.move('gpu')")
        ],
        correctOptionId: "b",
        explanationEN: "tensor.to('cuda'), tensor.cuda(), or tensor.to(device) moves tensors to GPU. Use 'cpu' to move back to CPU.",
        explanationID: "tensor.to('cuda'), tensor.cuda(), atau tensor.to(device) memindahkan tensor ke GPU. Gunakan 'cpu' untuk kembali ke CPU.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt005",
        questionEN: "What does torch.zeros(3, 4) create?",
        questionID: "Apa yang dibuat torch.zeros(3, 4)?",
        options: [
            QuestionOption(id: "a", textEN: "A list of zeros with 3 and 4", textID: "List nol dengan 3 dan 4"),
            QuestionOption(id: "b", textEN: "A 3x4 tensor filled with zeros", textID: "Tensor 3x4 berisi nol"),
            QuestionOption(id: "c", textEN: "A 4x3 tensor filled with zeros", textID: "Tensor 4x3 berisi nol"),
            QuestionOption(id: "d", textEN: "A 1D tensor with 7 zeros", textID: "Tensor 1D dengan 7 nol")
        ],
        correctOptionId: "b",
        explanationEN: "torch.zeros(3, 4) creates a 3x4 (3 rows, 4 columns) tensor filled with zeros. Similar to np.zeros((3, 4)).",
        explanationID: "torch.zeros(3, 4) membuat tensor 3x4 (3 baris, 4 kolom) berisi nol. Mirip dengan np.zeros((3, 4)).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt006",
        questionEN: "How do you convert a NumPy array to a PyTorch tensor?",
        questionID: "Bagaimana cara mengonversi array NumPy ke tensor PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "torch.from_numpy(arr)", textID: "torch.from_numpy(arr)"),
            QuestionOption(id: "b", textEN: "torch.numpy(arr)", textID: "torch.numpy(arr)"),
            QuestionOption(id: "c", textEN: "arr.to_tensor()", textID: "arr.to_tensor()"),
            QuestionOption(id: "d", textEN: "torch.convert(arr)", textID: "torch.convert(arr)")
        ],
        correctOptionId: "a",
        explanationEN: "torch.from_numpy() converts NumPy array to tensor (shares memory). torch.tensor(arr) creates a copy instead.",
        explanationID: "torch.from_numpy() mengonversi array NumPy ke tensor (berbagi memori). torch.tensor(arr) membuat copy sebagai gantinya.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt007",
        questionEN: "What does tensor.shape return?",
        questionID: "Apa yang dikembalikan tensor.shape?",
        options: [
            QuestionOption(id: "a", textEN: "Total number of elements", textID: "Total jumlah elemen"),
            QuestionOption(id: "b", textEN: "torch.Size object with dimensions", textID: "Objek torch.Size dengan dimensi"),
            QuestionOption(id: "c", textEN: "Data type of tensor", textID: "Tipe data tensor"),
            QuestionOption(id: "d", textEN: "Memory size in bytes", textID: "Ukuran memori dalam bytes")
        ],
        correctOptionId: "b",
        explanationEN: "tensor.shape (or tensor.size()) returns a torch.Size object showing dimensions. For a 3x4 tensor, returns torch.Size([3, 4]).",
        explanationID: "tensor.shape (atau tensor.size()) mengembalikan objek torch.Size yang menunjukkan dimensi. Untuk tensor 3x4, mengembalikan torch.Size([3, 4]).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt008",
        questionEN: "What is the difference between tensor.view() and tensor.reshape()?",
        questionID: "Apa perbedaan antara tensor.view() dan tensor.reshape()?",
        options: [
            QuestionOption(id: "a", textEN: "view requires contiguous memory, reshape doesn't", textID: "view memerlukan memori bersebelahan, reshape tidak"),
            QuestionOption(id: "b", textEN: "They are exactly the same", textID: "Keduanya persis sama"),
            QuestionOption(id: "c", textEN: "reshape is faster", textID: "reshape lebih cepat"),
            QuestionOption(id: "d", textEN: "view creates a copy, reshape doesn't", textID: "view membuat copy, reshape tidak")
        ],
        correctOptionId: "a",
        explanationEN: "view() requires contiguous memory and returns a view. reshape() works on non-contiguous tensors and may return a copy if needed.",
        explanationID: "view() memerlukan memori bersebelahan dan mengembalikan view. reshape() bekerja pada tensor non-bersebelahan dan mungkin mengembalikan copy jika diperlukan.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt009",
        questionEN: "What does tensor.unsqueeze(0) do?",
        questionID: "Apa yang dilakukan tensor.unsqueeze(0)?",
        options: [
            QuestionOption(id: "a", textEN: "Removes dimension at index 0", textID: "Menghapus dimensi pada indeks 0"),
            QuestionOption(id: "b", textEN: "Adds a new dimension at index 0", textID: "Menambah dimensi baru pada indeks 0"),
            QuestionOption(id: "c", textEN: "Squeezes all dimensions", textID: "Menciutkan semua dimensi"),
            QuestionOption(id: "d", textEN: "Sets first element to 0", textID: "Mengatur elemen pertama ke 0")
        ],
        correctOptionId: "b",
        explanationEN: "unsqueeze(dim) inserts a new dimension of size 1 at the specified position. Shape (3, 4) becomes (1, 3, 4) with unsqueeze(0).",
        explanationID: "unsqueeze(dim) menyisipkan dimensi baru berukuran 1 pada posisi yang ditentukan. Shape (3, 4) menjadi (1, 3, 4) dengan unsqueeze(0).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt010",
        questionEN: "What is the @ operator in PyTorch?",
        questionID: "Apa operator @ di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Element-wise multiplication", textID: "Perkalian element-wise"),
            QuestionOption(id: "b", textEN: "Matrix multiplication", textID: "Perkalian matriks"),
            QuestionOption(id: "c", textEN: "Power operation", textID: "Operasi pangkat"),
            QuestionOption(id: "d", textEN: "Concatenation", textID: "Penggabungan")
        ],
        correctOptionId: "b",
        explanationEN: "@ performs matrix multiplication (same as torch.matmul()). * performs element-wise multiplication.",
        explanationID: "@ melakukan perkalian matriks (sama dengan torch.matmul()). * melakukan perkalian element-wise.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 2: Autograd & Backpropagation (10 questions)
    Question(
        id: "pt011",
        questionEN: "What is autograd in PyTorch?",
        questionID: "Apa itu autograd di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Automatic graph visualization", textID: "Visualisasi grafik otomatis"),
            QuestionOption(id: "b", textEN: "Automatic differentiation engine for computing gradients", textID: "Mesin diferensiasi otomatis untuk menghitung gradien"),
            QuestionOption(id: "c", textEN: "Automatic grade computation for students", textID: "Komputasi nilai otomatis untuk siswa"),
            QuestionOption(id: "d", textEN: "Automatic data augmentation", textID: "Augmentasi data otomatis")
        ],
        correctOptionId: "b",
        explanationEN: "Autograd is PyTorch's automatic differentiation engine that records operations and computes gradients for backpropagation.",
        explanationID: "Autograd adalah mesin diferensiasi otomatis PyTorch yang merekam operasi dan menghitung gradien untuk backpropagation.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt012",
        questionEN: "What does loss.backward() do?",
        questionID: "Apa yang dilakukan loss.backward()?",
        options: [
            QuestionOption(id: "a", textEN: "Moves loss computation backward in time", textID: "Memindahkan komputasi loss mundur dalam waktu"),
            QuestionOption(id: "b", textEN: "Computes gradients of loss with respect to all tensors with requires_grad=True", textID: "Menghitung gradien loss terhadap semua tensor dengan requires_grad=True"),
            QuestionOption(id: "c", textEN: "Reverses the loss value", textID: "Membalik nilai loss"),
            QuestionOption(id: "d", textEN: "Deletes the loss from memory", textID: "Menghapus loss dari memori")
        ],
        correctOptionId: "b",
        explanationEN: "backward() computes gradients by backpropagating through the computational graph, storing gradients in .grad attribute of tensors.",
        explanationID: "backward() menghitung gradien dengan backpropagating melalui grafik komputasi, menyimpan gradien di atribut .grad dari tensor.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt013",
        questionEN: "Why do we call optimizer.zero_grad() before backward()?",
        questionID: "Mengapa kita memanggil optimizer.zero_grad() sebelum backward()?",
        options: [
            QuestionOption(id: "a", textEN: "To set learning rate to zero", textID: "Untuk mengatur learning rate ke nol"),
            QuestionOption(id: "b", textEN: "To clear accumulated gradients from previous iteration", textID: "Untuk membersihkan gradien yang terakumulasi dari iterasi sebelumnya"),
            QuestionOption(id: "c", textEN: "To initialize weights to zero", textID: "Untuk menginisialisasi bobot ke nol"),
            QuestionOption(id: "d", textEN: "To reset the optimizer", textID: "Untuk mereset optimizer")
        ],
        correctOptionId: "b",
        explanationEN: "PyTorch accumulates gradients by default. zero_grad() clears old gradients before computing new ones to prevent incorrect accumulation.",
        explanationID: "PyTorch mengakumulasi gradien secara default. zero_grad() membersihkan gradien lama sebelum menghitung yang baru untuk mencegah akumulasi yang salah.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt014",
        questionEN: "What does optimizer.step() do?",
        questionID: "Apa yang dilakukan optimizer.step()?",
        options: [
            QuestionOption(id: "a", textEN: "Computes the gradients", textID: "Menghitung gradien"),
            QuestionOption(id: "b", textEN: "Updates model parameters using computed gradients", textID: "Memperbarui parameter model menggunakan gradien yang dihitung"),
            QuestionOption(id: "c", textEN: "Moves to next epoch", textID: "Berpindah ke epoch berikutnya"),
            QuestionOption(id: "d", textEN: "Steps through the data loader", textID: "Melangkah melalui data loader")
        ],
        correctOptionId: "b",
        explanationEN: "step() updates the model parameters based on the current gradients and the optimization algorithm (SGD, Adam, etc.).",
        explanationID: "step() memperbarui parameter model berdasarkan gradien saat ini dan algoritma optimisasi (SGD, Adam, dll.).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt015",
        questionEN: "What is the purpose of torch.no_grad()?",
        questionID: "Apa tujuan torch.no_grad()?",
        options: [
            QuestionOption(id: "a", textEN: "Prevents model from learning", textID: "Mencegah model belajar"),
            QuestionOption(id: "b", textEN: "Disables gradient computation for inference/evaluation", textID: "Menonaktifkan komputasi gradien untuk inferensi/evaluasi"),
            QuestionOption(id: "c", textEN: "Removes gradients from tensors", textID: "Menghapus gradien dari tensor"),
            QuestionOption(id: "d", textEN: "Sets all gradients to zero", textID: "Mengatur semua gradien ke nol")
        ],
        correctOptionId: "b",
        explanationEN: "torch.no_grad() context manager disables gradient tracking, reducing memory usage and speeding up inference when gradients aren't needed.",
        explanationID: "torch.no_grad() context manager menonaktifkan pelacakan gradien, mengurangi penggunaan memori dan mempercepat inferensi saat gradien tidak diperlukan.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt016",
        questionEN: "Where are gradients stored after calling backward()?",
        questionID: "Di mana gradien disimpan setelah memanggil backward()?",
        options: [
            QuestionOption(id: "a", textEN: "In the loss tensor", textID: "Di tensor loss"),
            QuestionOption(id: "b", textEN: "In the .grad attribute of tensors with requires_grad=True", textID: "Di atribut .grad dari tensor dengan requires_grad=True"),
            QuestionOption(id: "c", textEN: "In the optimizer", textID: "Di optimizer"),
            QuestionOption(id: "d", textEN: "In a separate gradient tensor", textID: "Di tensor gradien terpisah")
        ],
        correctOptionId: "b",
        explanationEN: "After backward(), gradients are stored in the .grad attribute of each leaf tensor that has requires_grad=True.",
        explanationID: "Setelah backward(), gradien disimpan di atribut .grad dari setiap tensor leaf yang memiliki requires_grad=True.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt017",
        questionEN: "What does tensor.detach() do?",
        questionID: "Apa yang dilakukan tensor.detach()?",
        options: [
            QuestionOption(id: "a", textEN: "Removes tensor from GPU", textID: "Menghapus tensor dari GPU"),
            QuestionOption(id: "b", textEN: "Returns a tensor detached from the computation graph", textID: "Mengembalikan tensor yang terlepas dari grafik komputasi"),
            QuestionOption(id: "c", textEN: "Deletes the tensor", textID: "Menghapus tensor"),
            QuestionOption(id: "d", textEN: "Converts tensor to NumPy", textID: "Mengonversi tensor ke NumPy")
        ],
        correctOptionId: "b",
        explanationEN: "detach() returns a new tensor that shares data but is not part of the computation graph. No gradients will flow through it.",
        explanationID: "detach() mengembalikan tensor baru yang berbagi data tapi bukan bagian dari grafik komputasi. Tidak ada gradien yang mengalir melaluinya.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt018",
        questionEN: "What is retain_graph=True used for in backward()?",
        questionID: "Untuk apa retain_graph=True digunakan di backward()?",
        options: [
            QuestionOption(id: "a", textEN: "Saves the computation graph for visualization", textID: "Menyimpan grafik komputasi untuk visualisasi"),
            QuestionOption(id: "b", textEN: "Keeps the graph for multiple backward passes", textID: "Menyimpan grafik untuk beberapa backward pass"),
            QuestionOption(id: "c", textEN: "Retains gradients in memory permanently", textID: "Menyimpan gradien di memori secara permanen"),
            QuestionOption(id: "d", textEN: "Keeps the graph between epochs", textID: "Menyimpan grafik antar epoch")
        ],
        correctOptionId: "b",
        explanationEN: "By default, backward() frees the computation graph. retain_graph=True keeps it for calling backward() multiple times.",
        explanationID: "Secara default, backward() membebaskan grafik komputasi. retain_graph=True menyimpannya untuk memanggil backward() beberapa kali.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "pt019",
        questionEN: "What does .item() do on a scalar tensor?",
        questionID: "Apa yang dilakukan .item() pada tensor skalar?",
        options: [
            QuestionOption(id: "a", textEN: "Returns the first item of any tensor", textID: "Mengembalikan item pertama dari tensor apa pun"),
            QuestionOption(id: "b", textEN: "Returns Python number from single-element tensor", textID: "Mengembalikan angka Python dari tensor satu elemen"),
            QuestionOption(id: "c", textEN: "Returns all items as a list", textID: "Mengembalikan semua item sebagai list"),
            QuestionOption(id: "d", textEN: "Counts items in tensor", textID: "Menghitung item di tensor")
        ],
        correctOptionId: "b",
        explanationEN: ".item() extracts a Python scalar from a single-element tensor. Useful for logging loss values during training.",
        explanationID: ".item() mengekstrak skalar Python dari tensor satu elemen. Berguna untuk logging nilai loss selama training.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt020",
        questionEN: "What is a leaf tensor in PyTorch?",
        questionID: "Apa itu leaf tensor di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "A tensor created by the user, not from operations", textID: "Tensor yang dibuat oleh user, bukan dari operasi"),
            QuestionOption(id: "b", textEN: "A very small tensor", textID: "Tensor yang sangat kecil"),
            QuestionOption(id: "c", textEN: "A tensor at the end of the graph", textID: "Tensor di akhir grafik"),
            QuestionOption(id: "d", textEN: "A tensor with no gradients", textID: "Tensor tanpa gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Leaf tensors are directly created (not results of operations). Only leaf tensors with requires_grad=True accumulate gradients in .grad.",
        explanationID: "Tensor leaf dibuat langsung (bukan hasil operasi). Hanya tensor leaf dengan requires_grad=True yang mengakumulasi gradien di .grad.",
        topic: "computing",
        difficulty: .advanced
    ),

    // Batch 3: Neural Network Modules (10 questions)
    Question(
        id: "pt021",
        questionEN: "What is nn.Module in PyTorch?",
        questionID: "Apa itu nn.Module di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "A single neuron", textID: "Satu neuron"),
            QuestionOption(id: "b", textEN: "Base class for all neural network components", textID: "Kelas dasar untuk semua komponen neural network"),
            QuestionOption(id: "c", textEN: "A Python module for importing", textID: "Modul Python untuk mengimpor"),
            QuestionOption(id: "d", textEN: "A training loop component", textID: "Komponen loop training")
        ],
        correctOptionId: "b",
        explanationEN: "nn.Module is the base class for all neural network layers and models. Custom networks inherit from it.",
        explanationID: "nn.Module adalah kelas dasar untuk semua layer dan model neural network. Network kustom mewarisi darinya.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt022",
        questionEN: "What must be defined in a class inheriting from nn.Module?",
        questionID: "Apa yang harus didefinisikan dalam kelas yang mewarisi nn.Module?",
        options: [
            QuestionOption(id: "a", textEN: "__init__ and backward methods", textID: "method __init__ dan backward"),
            QuestionOption(id: "b", textEN: "__init__ and forward methods", textID: "method __init__ dan forward"),
            QuestionOption(id: "c", textEN: "train and test methods", textID: "method train dan test"),
            QuestionOption(id: "d", textEN: "Only __init__ method", textID: "Hanya method __init__")
        ],
        correctOptionId: "b",
        explanationEN: "__init__ defines layers/parameters, forward() defines the computation. Backward is handled automatically by autograd.",
        explanationID: "__init__ mendefinisikan layer/parameter, forward() mendefinisikan komputasi. Backward ditangani otomatis oleh autograd.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt023",
        questionEN: "What does nn.Linear(10, 5) create?",
        questionID: "Apa yang dibuat nn.Linear(10, 5)?",
        options: [
            QuestionOption(id: "a", textEN: "A linear layer with 10 outputs and 5 inputs", textID: "Layer linear dengan 10 output dan 5 input"),
            QuestionOption(id: "b", textEN: "A linear layer with 10 inputs and 5 outputs", textID: "Layer linear dengan 10 input dan 5 output"),
            QuestionOption(id: "c", textEN: "10 linear layers with 5 neurons each", textID: "10 layer linear dengan 5 neuron masing-masing"),
            QuestionOption(id: "d", textEN: "A 10x5 weight matrix only", textID: "Hanya matriks bobot 10x5")
        ],
        correctOptionId: "b",
        explanationEN: "nn.Linear(in_features, out_features) creates a fully connected layer. Input size is 10, output size is 5.",
        explanationID: "nn.Linear(in_features, out_features) membuat layer fully connected. Ukuran input 10, ukuran output 5.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt024",
        questionEN: "What does model.train() do?",
        questionID: "Apa yang dilakukan model.train()?",
        options: [
            QuestionOption(id: "a", textEN: "Starts training the model", textID: "Memulai training model"),
            QuestionOption(id: "b", textEN: "Sets model to training mode (enables dropout, batch norm training)", textID: "Mengatur model ke mode training (mengaktifkan dropout, batch norm training)"),
            QuestionOption(id: "c", textEN: "Trains for one epoch", textID: "Train untuk satu epoch"),
            QuestionOption(id: "d", textEN: "Loads training data", textID: "Memuat data training")
        ],
        correctOptionId: "b",
        explanationEN: "model.train() sets the model to training mode where dropout is active and batch norm uses batch statistics.",
        explanationID: "model.train() mengatur model ke mode training di mana dropout aktif dan batch norm menggunakan statistik batch.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt025",
        questionEN: "What does model.eval() do?",
        questionID: "Apa yang dilakukan model.eval()?",
        options: [
            QuestionOption(id: "a", textEN: "Evaluates model accuracy", textID: "Mengevaluasi akurasi model"),
            QuestionOption(id: "b", textEN: "Sets model to evaluation mode (disables dropout, uses running stats)", textID: "Mengatur model ke mode evaluasi (menonaktifkan dropout, menggunakan running stats)"),
            QuestionOption(id: "c", textEN: "Computes the loss", textID: "Menghitung loss"),
            QuestionOption(id: "d", textEN: "Runs evaluation metrics", textID: "Menjalankan metrik evaluasi")
        ],
        correctOptionId: "b",
        explanationEN: "model.eval() sets evaluation mode: dropout is disabled, batch norm uses running statistics instead of batch statistics.",
        explanationID: "model.eval() mengatur mode evaluasi: dropout dinonaktifkan, batch norm menggunakan statistik running daripada statistik batch.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt026",
        questionEN: "What is nn.ReLU() in PyTorch?",
        questionID: "Apa itu nn.ReLU() di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "A regularization layer", textID: "Layer regularisasi"),
            QuestionOption(id: "b", textEN: "Rectified Linear Unit activation function", textID: "Fungsi aktivasi Rectified Linear Unit"),
            QuestionOption(id: "c", textEN: "A recurrent layer", textID: "Layer recurrent"),
            QuestionOption(id: "d", textEN: "A loss function", textID: "Fungsi loss")
        ],
        correctOptionId: "b",
        explanationEN: "ReLU (Rectified Linear Unit) activation: f(x) = max(0, x). Returns 0 for negative inputs, x for positive inputs.",
        explanationID: "Aktivasi ReLU (Rectified Linear Unit): f(x) = max(0, x). Mengembalikan 0 untuk input negatif, x untuk input positif.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt027",
        questionEN: "What does nn.Dropout(0.5) do during training?",
        questionID: "Apa yang dilakukan nn.Dropout(0.5) selama training?",
        options: [
            QuestionOption(id: "a", textEN: "Reduces learning rate by 50%", textID: "Mengurangi learning rate sebesar 50%"),
            QuestionOption(id: "b", textEN: "Randomly zeros 50% of neurons to prevent overfitting", textID: "Secara acak menolkan 50% neuron untuk mencegah overfitting"),
            QuestionOption(id: "c", textEN: "Drops 50% of training data", textID: "Menghapus 50% data training"),
            QuestionOption(id: "d", textEN: "Removes 50% of model parameters", textID: "Menghapus 50% parameter model")
        ],
        correctOptionId: "b",
        explanationEN: "Dropout randomly sets 50% of input elements to zero during training, acting as regularization. Disabled during eval().",
        explanationID: "Dropout secara acak mengatur 50% elemen input ke nol selama training, bertindak sebagai regularisasi. Dinonaktifkan selama eval().",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt028",
        questionEN: "What does nn.BatchNorm1d do?",
        questionID: "Apa yang dilakukan nn.BatchNorm1d?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizes input batch to have mean 0 and variance 1", textID: "Menormalisasi batch input agar memiliki mean 0 dan variance 1"),
            QuestionOption(id: "b", textEN: "Batches the input data", textID: "Mem-batch data input"),
            QuestionOption(id: "c", textEN: "Normalizes only the first dimension", textID: "Menormalisasi hanya dimensi pertama"),
            QuestionOption(id: "d", textEN: "Reduces batch size", textID: "Mengurangi ukuran batch")
        ],
        correctOptionId: "a",
        explanationEN: "BatchNorm normalizes layer inputs across the batch dimension, stabilizing training and allowing higher learning rates.",
        explanationID: "BatchNorm menormalisasi input layer di seluruh dimensi batch, menstabilkan training dan memungkinkan learning rate lebih tinggi.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt029",
        questionEN: "What does model.parameters() return?",
        questionID: "Apa yang dikembalikan model.parameters()?",
        options: [
            QuestionOption(id: "a", textEN: "Dictionary of hyperparameters", textID: "Dictionary hyperparameter"),
            QuestionOption(id: "b", textEN: "Iterator over all learnable parameters", textID: "Iterator atas semua parameter yang dapat dipelajari"),
            QuestionOption(id: "c", textEN: "List of layer names", textID: "Daftar nama layer"),
            QuestionOption(id: "d", textEN: "Number of parameters", textID: "Jumlah parameter")
        ],
        correctOptionId: "b",
        explanationEN: "model.parameters() yields all learnable parameters (weights, biases). Used to pass parameters to optimizers.",
        explanationID: "model.parameters() menghasilkan semua parameter yang dapat dipelajari (bobot, bias). Digunakan untuk meneruskan parameter ke optimizer.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt030",
        questionEN: "What is nn.Sequential used for?",
        questionID: "Untuk apa nn.Sequential digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Processing data sequentially", textID: "Memproses data secara sekuensial"),
            QuestionOption(id: "b", textEN: "Creating a model by stacking layers in order", textID: "Membuat model dengan menumpuk layer secara berurutan"),
            QuestionOption(id: "c", textEN: "Running operations in sequence", textID: "Menjalankan operasi secara berurutan"),
            QuestionOption(id: "d", textEN: "Sequential data processing like time series", textID: "Pemrosesan data sekuensial seperti time series")
        ],
        correctOptionId: "b",
        explanationEN: "nn.Sequential is a container that chains modules together. Input flows through each layer in the order they're added.",
        explanationID: "nn.Sequential adalah container yang merantai modul bersama. Input mengalir melalui setiap layer dalam urutan ditambahkan.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 4: Training & Optimization (10 questions)
    Question(
        id: "pt031",
        questionEN: "What is the typical training loop order in PyTorch?",
        questionID: "Apa urutan loop training yang umum di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "backward → forward → zero_grad → step", textID: "backward → forward → zero_grad → step"),
            QuestionOption(id: "b", textEN: "zero_grad → forward → loss → backward → step", textID: "zero_grad → forward → loss → backward → step"),
            QuestionOption(id: "c", textEN: "forward → step → backward → zero_grad", textID: "forward → step → backward → zero_grad"),
            QuestionOption(id: "d", textEN: "step → zero_grad → forward → backward", textID: "step → zero_grad → forward → backward")
        ],
        correctOptionId: "b",
        explanationEN: "Correct order: 1) zero_grad() clears gradients, 2) forward pass, 3) compute loss, 4) backward() computes gradients, 5) step() updates weights.",
        explanationID: "Urutan benar: 1) zero_grad() membersihkan gradien, 2) forward pass, 3) hitung loss, 4) backward() menghitung gradien, 5) step() memperbarui bobot.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt032",
        questionEN: "What does torch.optim.SGD do?",
        questionID: "Apa yang dilakukan torch.optim.SGD?",
        options: [
            QuestionOption(id: "a", textEN: "Standard Gradient Descent optimizer", textID: "Optimizer Standard Gradient Descent"),
            QuestionOption(id: "b", textEN: "Stochastic Gradient Descent optimizer", textID: "Optimizer Stochastic Gradient Descent"),
            QuestionOption(id: "c", textEN: "Super Gradient Descent optimizer", textID: "Optimizer Super Gradient Descent"),
            QuestionOption(id: "d", textEN: "Sequential Gradient Descent optimizer", textID: "Optimizer Sequential Gradient Descent")
        ],
        correctOptionId: "b",
        explanationEN: "SGD (Stochastic Gradient Descent) updates parameters using gradients. Supports momentum for faster convergence.",
        explanationID: "SGD (Stochastic Gradient Descent) memperbarui parameter menggunakan gradien. Mendukung momentum untuk konvergensi lebih cepat.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt033",
        questionEN: "What is the advantage of Adam optimizer over SGD?",
        questionID: "Apa keuntungan optimizer Adam dibanding SGD?",
        options: [
            QuestionOption(id: "a", textEN: "Adam is always faster", textID: "Adam selalu lebih cepat"),
            QuestionOption(id: "b", textEN: "Adam adapts learning rate per parameter using momentum and RMSprop", textID: "Adam menyesuaikan learning rate per parameter menggunakan momentum dan RMSprop"),
            QuestionOption(id: "c", textEN: "Adam uses less memory", textID: "Adam menggunakan lebih sedikit memori"),
            QuestionOption(id: "d", textEN: "Adam doesn't need learning rate", textID: "Adam tidak memerlukan learning rate")
        ],
        correctOptionId: "b",
        explanationEN: "Adam combines momentum and RMSprop, maintaining adaptive learning rates for each parameter. Often works well with default settings.",
        explanationID: "Adam menggabungkan momentum dan RMSprop, mempertahankan learning rate adaptif untuk setiap parameter. Sering bekerja baik dengan pengaturan default.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt034",
        questionEN: "What is nn.CrossEntropyLoss used for?",
        questionID: "Untuk apa nn.CrossEntropyLoss digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Regression problems", textID: "Masalah regresi"),
            QuestionOption(id: "b", textEN: "Multi-class classification problems", textID: "Masalah klasifikasi multi-kelas"),
            QuestionOption(id: "c", textEN: "Binary classification only", textID: "Hanya klasifikasi biner"),
            QuestionOption(id: "d", textEN: "Clustering problems", textID: "Masalah clustering")
        ],
        correctOptionId: "b",
        explanationEN: "CrossEntropyLoss combines LogSoftmax and NLLLoss. Used for multi-class classification. Takes raw logits, not probabilities.",
        explanationID: "CrossEntropyLoss menggabungkan LogSoftmax dan NLLLoss. Digunakan untuk klasifikasi multi-kelas. Mengambil logit mentah, bukan probabilitas.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt035",
        questionEN: "What loss function is typically used for regression?",
        questionID: "Fungsi loss apa yang biasanya digunakan untuk regresi?",
        options: [
            QuestionOption(id: "a", textEN: "nn.CrossEntropyLoss", textID: "nn.CrossEntropyLoss"),
            QuestionOption(id: "b", textEN: "nn.MSELoss", textID: "nn.MSELoss"),
            QuestionOption(id: "c", textEN: "nn.NLLLoss", textID: "nn.NLLLoss"),
            QuestionOption(id: "d", textEN: "nn.BCELoss", textID: "nn.BCELoss")
        ],
        correctOptionId: "b",
        explanationEN: "MSELoss (Mean Squared Error) is standard for regression: (prediction - target)². L1Loss (MAE) is an alternative.",
        explanationID: "MSELoss (Mean Squared Error) adalah standar untuk regresi: (prediksi - target)². L1Loss (MAE) adalah alternatif.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt036",
        questionEN: "What is a DataLoader in PyTorch?",
        questionID: "Apa itu DataLoader di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Loads data from disk", textID: "Memuat data dari disk"),
            QuestionOption(id: "b", textEN: "Wraps dataset to provide batching, shuffling, and parallel loading", textID: "Membungkus dataset untuk menyediakan batching, shuffling, dan loading paralel"),
            QuestionOption(id: "c", textEN: "Converts data to tensors", textID: "Mengonversi data ke tensor"),
            QuestionOption(id: "d", textEN: "Downloads datasets", textID: "Mengunduh dataset")
        ],
        correctOptionId: "b",
        explanationEN: "DataLoader provides an iterable over a dataset with automatic batching, shuffling, and multiprocess data loading.",
        explanationID: "DataLoader menyediakan iterable atas dataset dengan batching otomatis, shuffling, dan loading data multiproses.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt037",
        questionEN: "What does shuffle=True in DataLoader do?",
        questionID: "Apa yang dilakukan shuffle=True di DataLoader?",
        options: [
            QuestionOption(id: "a", textEN: "Shuffles data within each batch", textID: "Mengacak data dalam setiap batch"),
            QuestionOption(id: "b", textEN: "Randomizes the order of batches each epoch", textID: "Mengacak urutan batch setiap epoch"),
            QuestionOption(id: "c", textEN: "Shuffles model parameters", textID: "Mengacak parameter model"),
            QuestionOption(id: "d", textEN: "Randomizes feature order", textID: "Mengacak urutan fitur")
        ],
        correctOptionId: "b",
        explanationEN: "shuffle=True randomizes the order of samples each epoch, helping prevent the model from learning the order of training data.",
        explanationID: "shuffle=True mengacak urutan sampel setiap epoch, membantu mencegah model mempelajari urutan data training.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt038",
        questionEN: "What is transfer learning in PyTorch?",
        questionID: "Apa itu transfer learning di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Transferring model between GPUs", textID: "Mentransfer model antar GPU"),
            QuestionOption(id: "b", textEN: "Using pretrained models and fine-tuning for new tasks", textID: "Menggunakan model pretrained dan fine-tuning untuk tugas baru"),
            QuestionOption(id: "c", textEN: "Transferring data between datasets", textID: "Mentransfer data antar dataset"),
            QuestionOption(id: "d", textEN: "Moving tensors between devices", textID: "Memindahkan tensor antar perangkat")
        ],
        correctOptionId: "b",
        explanationEN: "Transfer learning uses pretrained models (e.g., ResNet, BERT) and adapts them to new tasks, requiring less data and training time.",
        explanationID: "Transfer learning menggunakan model pretrained (misalnya ResNet, BERT) dan mengadaptasinya untuk tugas baru, membutuhkan lebih sedikit data dan waktu training.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt039",
        questionEN: "How do you save a trained model in PyTorch?",
        questionID: "Bagaimana cara menyimpan model yang sudah dilatih di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "model.save('model.pt')", textID: "model.save('model.pt')"),
            QuestionOption(id: "b", textEN: "torch.save(model.state_dict(), 'model.pt')", textID: "torch.save(model.state_dict(), 'model.pt')"),
            QuestionOption(id: "c", textEN: "model.export('model.pt')", textID: "model.export('model.pt')"),
            QuestionOption(id: "d", textEN: "torch.dump(model, 'model.pt')", textID: "torch.dump(model, 'model.pt')")
        ],
        correctOptionId: "b",
        explanationEN: "torch.save(model.state_dict(), path) saves model parameters. Load with model.load_state_dict(torch.load(path)).",
        explanationID: "torch.save(model.state_dict(), path) menyimpan parameter model. Muat dengan model.load_state_dict(torch.load(path)).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt040",
        questionEN: "What is gradient clipping used for?",
        questionID: "Untuk apa gradient clipping digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Speeding up training", textID: "Mempercepat training"),
            QuestionOption(id: "b", textEN: "Preventing exploding gradients by limiting gradient magnitude", textID: "Mencegah exploding gradients dengan membatasi magnitude gradien"),
            QuestionOption(id: "c", textEN: "Reducing model size", textID: "Mengurangi ukuran model"),
            QuestionOption(id: "d", textEN: "Clipping input data", textID: "Memotong data input")
        ],
        correctOptionId: "b",
        explanationEN: "Gradient clipping (torch.nn.utils.clip_grad_norm_) limits gradient magnitude to prevent exploding gradients, especially in RNNs.",
        explanationID: "Gradient clipping (torch.nn.utils.clip_grad_norm_) membatasi magnitude gradien untuk mencegah exploding gradients, terutama di RNN.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 5: Advanced PyTorch (10 questions)
    Question(
        id: "pt041",
        questionEN: "What is nn.Conv2d used for?",
        questionID: "Untuk apa nn.Conv2d digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "1D convolution on sequences", textID: "Konvolusi 1D pada sequence"),
            QuestionOption(id: "b", textEN: "2D convolution for image processing", textID: "Konvolusi 2D untuk pemrosesan gambar"),
            QuestionOption(id: "c", textEN: "Converting 2D to 1D", textID: "Mengonversi 2D ke 1D"),
            QuestionOption(id: "d", textEN: "Double convolution", textID: "Konvolusi ganda")
        ],
        correctOptionId: "b",
        explanationEN: "Conv2d applies 2D convolution over input with multiple channels, commonly used for image feature extraction in CNNs.",
        explanationID: "Conv2d menerapkan konvolusi 2D atas input dengan beberapa channel, umumnya digunakan untuk ekstraksi fitur gambar di CNN.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt042",
        questionEN: "What are the parameters of nn.Conv2d(3, 64, kernel_size=3)?",
        questionID: "Apa parameter dari nn.Conv2d(3, 64, kernel_size=3)?",
        options: [
            QuestionOption(id: "a", textEN: "3 output channels, 64 input channels, 3x3 kernel", textID: "3 channel output, 64 channel input, kernel 3x3"),
            QuestionOption(id: "b", textEN: "3 input channels, 64 output channels, 3x3 kernel", textID: "3 channel input, 64 channel output, kernel 3x3"),
            QuestionOption(id: "c", textEN: "3 layers, 64 neurons, 3x3 image size", textID: "3 layer, 64 neuron, ukuran gambar 3x3"),
            QuestionOption(id: "d", textEN: "3x64 filters, kernel size 3", textID: "Filter 3x64, ukuran kernel 3")
        ],
        correctOptionId: "b",
        explanationEN: "Conv2d(in_channels, out_channels, kernel_size): 3 input channels (e.g., RGB), 64 output feature maps, 3x3 convolution kernel.",
        explanationID: "Conv2d(in_channels, out_channels, kernel_size): 3 channel input (misalnya RGB), 64 feature map output, kernel konvolusi 3x3.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt043",
        questionEN: "What does nn.MaxPool2d(2) do?",
        questionID: "Apa yang dilakukan nn.MaxPool2d(2)?",
        options: [
            QuestionOption(id: "a", textEN: "Doubles the image size", textID: "Menggandakan ukuran gambar"),
            QuestionOption(id: "b", textEN: "Reduces spatial dimensions by taking max in 2x2 regions", textID: "Mengurangi dimensi spasial dengan mengambil max dalam region 2x2"),
            QuestionOption(id: "c", textEN: "Applies 2 pooling operations", textID: "Menerapkan 2 operasi pooling"),
            QuestionOption(id: "d", textEN: "Limits values to maximum of 2", textID: "Membatasi nilai ke maksimum 2")
        ],
        correctOptionId: "b",
        explanationEN: "MaxPool2d(2) takes the maximum value in each 2x2 window, reducing height and width by half while keeping important features.",
        explanationID: "MaxPool2d(2) mengambil nilai maksimum di setiap window 2x2, mengurangi tinggi dan lebar setengah sambil menyimpan fitur penting.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt044",
        questionEN: "What is nn.Embedding used for?",
        questionID: "Untuk apa nn.Embedding digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Embedding images in documents", textID: "Menyisipkan gambar dalam dokumen"),
            QuestionOption(id: "b", textEN: "Converting discrete indices to dense vectors", textID: "Mengonversi indeks diskrit ke vektor padat"),
            QuestionOption(id: "c", textEN: "Reducing model size", textID: "Mengurangi ukuran model"),
            QuestionOption(id: "d", textEN: "Combining multiple models", textID: "Menggabungkan beberapa model")
        ],
        correctOptionId: "b",
        explanationEN: "nn.Embedding maps discrete indices (like word IDs) to dense vectors. Essential for NLP tasks with vocabulary lookup.",
        explanationID: "nn.Embedding memetakan indeks diskrit (seperti ID kata) ke vektor padat. Penting untuk tugas NLP dengan pencarian kosakata.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt045",
        questionEN: "What is nn.LSTM used for?",
        questionID: "Untuk apa nn.LSTM digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Image classification", textID: "Klasifikasi gambar"),
            QuestionOption(id: "b", textEN: "Processing sequential data with long-term dependencies", textID: "Memproses data sekuensial dengan dependensi jangka panjang"),
            QuestionOption(id: "c", textEN: "Clustering", textID: "Clustering"),
            QuestionOption(id: "d", textEN: "Dimensionality reduction", textID: "Pengurangan dimensi")
        ],
        correctOptionId: "b",
        explanationEN: "LSTM (Long Short-Term Memory) is a recurrent layer that handles sequential data, addressing vanishing gradients with gate mechanisms.",
        explanationID: "LSTM (Long Short-Term Memory) adalah layer recurrent yang menangani data sekuensial, mengatasi vanishing gradients dengan mekanisme gate.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt046",
        questionEN: "What does nn.Softmax(dim=1) compute?",
        questionID: "Apa yang dihitung nn.Softmax(dim=1)?",
        options: [
            QuestionOption(id: "a", textEN: "Maximum values along dimension 1", textID: "Nilai maksimum sepanjang dimensi 1"),
            QuestionOption(id: "b", textEN: "Probability distribution along dimension 1 (rows)", textID: "Distribusi probabilitas sepanjang dimensi 1 (baris)"),
            QuestionOption(id: "c", textEN: "Soft maximum of all elements", textID: "Soft maximum dari semua elemen"),
            QuestionOption(id: "d", textEN: "First dimension values", textID: "Nilai dimensi pertama")
        ],
        correctOptionId: "b",
        explanationEN: "Softmax converts logits to probabilities that sum to 1 along the specified dimension. dim=1 normalizes each row.",
        explanationID: "Softmax mengonversi logit ke probabilitas yang berjumlah 1 sepanjang dimensi yang ditentukan. dim=1 menormalisasi setiap baris.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt047",
        questionEN: "What is torch.cat used for?",
        questionID: "Untuk apa torch.cat digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Categorizing tensors", textID: "Mengkategorikan tensor"),
            QuestionOption(id: "b", textEN: "Concatenating tensors along a dimension", textID: "Menggabungkan tensor sepanjang dimensi"),
            QuestionOption(id: "c", textEN: "Catching errors in tensors", textID: "Menangkap error di tensor"),
            QuestionOption(id: "d", textEN: "Creating categorical tensors", textID: "Membuat tensor kategorikal")
        ],
        correctOptionId: "b",
        explanationEN: "torch.cat concatenates tensors along an existing dimension. torch.stack creates a new dimension.",
        explanationID: "torch.cat menggabungkan tensor sepanjang dimensi yang ada. torch.stack membuat dimensi baru.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt048",
        questionEN: "What is the purpose of learning rate scheduler?",
        questionID: "Apa tujuan learning rate scheduler?",
        options: [
            QuestionOption(id: "a", textEN: "Schedules when to train", textID: "Menjadwalkan kapan train"),
            QuestionOption(id: "b", textEN: "Adjusts learning rate during training", textID: "Menyesuaikan learning rate selama training"),
            QuestionOption(id: "c", textEN: "Schedules GPU usage", textID: "Menjadwalkan penggunaan GPU"),
            QuestionOption(id: "d", textEN: "Determines batch schedule", textID: "Menentukan jadwal batch")
        ],
        correctOptionId: "b",
        explanationEN: "Learning rate schedulers (StepLR, ReduceLROnPlateau) adjust learning rate during training, often reducing it as training progresses.",
        explanationID: "Learning rate scheduler (StepLR, ReduceLROnPlateau) menyesuaikan learning rate selama training, sering menguranginya seiring training berlanjut.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pt049",
        questionEN: "What does torch.cuda.is_available() return?",
        questionID: "Apa yang dikembalikan torch.cuda.is_available()?",
        options: [
            QuestionOption(id: "a", textEN: "Number of available GPUs", textID: "Jumlah GPU yang tersedia"),
            QuestionOption(id: "b", textEN: "Boolean indicating if CUDA/GPU is available", textID: "Boolean yang menunjukkan apakah CUDA/GPU tersedia"),
            QuestionOption(id: "c", textEN: "GPU memory available", textID: "Memori GPU yang tersedia"),
            QuestionOption(id: "d", textEN: "CUDA version", textID: "Versi CUDA")
        ],
        correctOptionId: "b",
        explanationEN: "torch.cuda.is_available() returns True if CUDA is available. Use torch.cuda.device_count() to get number of GPUs.",
        explanationID: "torch.cuda.is_available() mengembalikan True jika CUDA tersedia. Gunakan torch.cuda.device_count() untuk mendapatkan jumlah GPU.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pt050",
        questionEN: "What is weight initialization important for?",
        questionID: "Mengapa inisialisasi bobot penting?",
        options: [
            QuestionOption(id: "a", textEN: "Reducing model file size", textID: "Mengurangi ukuran file model"),
            QuestionOption(id: "b", textEN: "Enabling proper gradient flow and stable training", textID: "Memungkinkan aliran gradien yang tepat dan training stabil"),
            QuestionOption(id: "c", textEN: "Increasing model accuracy", textID: "Meningkatkan akurasi model"),
            QuestionOption(id: "d", textEN: "Reducing memory usage", textID: "Mengurangi penggunaan memori")
        ],
        correctOptionId: "b",
        explanationEN: "Proper initialization (Xavier, He) ensures gradients flow well and prevents vanishing/exploding gradients at the start of training.",
        explanationID: "Inisialisasi yang tepat (Xavier, He) memastikan gradien mengalir dengan baik dan mencegah vanishing/exploding gradients di awal training.",
        topic: "computing",
        difficulty: .intermediate
    )
]
