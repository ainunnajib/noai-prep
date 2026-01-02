import Foundation

// MARK: - Python & PyTorch Programming Questions (50)
// Topics: Python basics, PyTorch tensors, autograd, nn.Module, DataLoader, training
// Aligned with IOAI/NOAI Syllabus

let pythonPyTorchQuestions: [Question] = [
    // MARK: - Python Basics for ML (Questions 1-10)
    Question(
        id: "py_torch_001",
        questionEN: "What is the output of: len([1, 2, 3, [4, 5]])?",
        questionID: "Berapa output dari: len([1, 2, 3, [4, 5]])?",
        options: [
            QuestionOption(id: "a", textEN: "4", textID: "4"),
            QuestionOption(id: "b", textEN: "5", textID: "5"),
            QuestionOption(id: "c", textEN: "3", textID: "3"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "The list has 4 elements: 1, 2, 3, and [4, 5] (a nested list counts as one element). len() counts top-level elements only.",
        explanationID: "List memiliki 4 elemen: 1, 2, 3, dan [4, 5] (nested list dihitung sebagai satu elemen). len() menghitung elemen tingkat atas saja.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_002",
        questionEN: "What does list slicing a[1:4] return for a = [0, 1, 2, 3, 4, 5]?",
        questionID: "Apa yang dikembalikan a[1:4] untuk a = [0, 1, 2, 3, 4, 5]?",
        options: [
            QuestionOption(id: "a", textEN: "[1, 2, 3]", textID: "[1, 2, 3]"),
            QuestionOption(id: "b", textEN: "[1, 2, 3, 4]", textID: "[1, 2, 3, 4]"),
            QuestionOption(id: "c", textEN: "[0, 1, 2, 3]", textID: "[0, 1, 2, 3]"),
            QuestionOption(id: "d", textEN: "[2, 3, 4]", textID: "[2, 3, 4]")
        ],
        correctOptionId: "a",
        explanationEN: "Slicing a[start:end] returns elements from index start up to but NOT including end. a[1:4] returns elements at indices 1, 2, 3: [1, 2, 3].",
        explanationID: "Slicing a[start:end] mengembalikan elemen dari indeks start sampai TIDAK termasuk end. a[1:4] mengembalikan elemen di indeks 1, 2, 3: [1, 2, 3].",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_003",
        questionEN: "What is a list comprehension in Python?",
        questionID: "Apa itu list comprehension di Python?",
        options: [
            QuestionOption(id: "a", textEN: "A concise way to create lists: [expression for item in iterable if condition]", textID: "Cara ringkas membuat list: [expression for item in iterable if condition]"),
            QuestionOption(id: "b", textEN: "A way to compress lists", textID: "Cara mengkompresi list"),
            QuestionOption(id: "c", textEN: "A method to read lists", textID: "Metode untuk membaca list"),
            QuestionOption(id: "d", textEN: "A type of loop", textID: "Jenis loop")
        ],
        correctOptionId: "a",
        explanationEN: "List comprehension is a compact syntax: [x**2 for x in range(5)] creates [0, 1, 4, 9, 16]. Optional condition: [x for x in nums if x > 0] filters positives.",
        explanationID: "List comprehension adalah sintaks kompak: [x**2 for x in range(5)] membuat [0, 1, 4, 9, 16]. Kondisi opsional: [x for x in nums if x > 0] memfilter positif.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_004",
        questionEN: "What is the difference between a Python list and a NumPy array?",
        questionID: "Apa perbedaan antara Python list dan NumPy array?",
        options: [
            QuestionOption(id: "a", textEN: "NumPy arrays are homogeneous, support vectorized operations, and are more efficient for numerical computation", textID: "NumPy array homogen, mendukung operasi vektorisasi, dan lebih efisien untuk komputasi numerik"),
            QuestionOption(id: "b", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "c", textEN: "Lists are faster for math", textID: "List lebih cepat untuk matematika"),
            QuestionOption(id: "d", textEN: "NumPy arrays can only hold integers", textID: "NumPy array hanya bisa menyimpan integer")
        ],
        correctOptionId: "a",
        explanationEN: "NumPy arrays must have same dtype, support element-wise operations (a + b), broadcasting, and are stored contiguously for efficiency. Lists are heterogeneous and require explicit loops.",
        explanationID: "NumPy array harus memiliki dtype sama, mendukung operasi element-wise (a + b), broadcasting, dan disimpan bersebelahan untuk efisiensi. List heterogen dan memerlukan loop eksplisit.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_005",
        questionEN: "What does the zip() function do in Python?",
        questionID: "Apa yang dilakukan fungsi zip() di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Combines multiple iterables element-wise into tuples", textID: "Menggabungkan beberapa iterable secara element-wise menjadi tuple"),
            QuestionOption(id: "b", textEN: "Compresses files", textID: "Mengkompresi file"),
            QuestionOption(id: "c", textEN: "Sorts lists", textID: "Mengurutkan list"),
            QuestionOption(id: "d", textEN: "Flattens nested lists", textID: "Meratakan nested list")
        ],
        correctOptionId: "a",
        explanationEN: "zip(a, b) pairs elements: zip([1,2], ['a','b']) yields [(1,'a'), (2,'b')]. Useful in data loading: for x, y in zip(features, labels).",
        explanationID: "zip(a, b) memasangkan elemen: zip([1,2], ['a','b']) menghasilkan [(1,'a'), (2,'b')]. Berguna dalam loading data: for x, y in zip(features, labels).",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_006",
        questionEN: "What is *args in a Python function definition?",
        questionID: "Apa itu *args dalam definisi fungsi Python?",
        options: [
            QuestionOption(id: "a", textEN: "Variable number of positional arguments packed into a tuple", textID: "Jumlah variabel argumen posisional yang dikemas menjadi tuple"),
            QuestionOption(id: "b", textEN: "Required arguments", textID: "Argumen wajib"),
            QuestionOption(id: "c", textEN: "Keyword arguments", textID: "Argumen keyword"),
            QuestionOption(id: "d", textEN: "A pointer to arguments", textID: "Pointer ke argumen")
        ],
        correctOptionId: "a",
        explanationEN: "def func(*args) accepts any number of positional arguments as a tuple. func(1, 2, 3) → args = (1, 2, 3). **kwargs does the same for keyword arguments as a dict.",
        explanationID: "def func(*args) menerima sejumlah argumen posisional sebagai tuple. func(1, 2, 3) → args = (1, 2, 3). **kwargs melakukan hal sama untuk keyword argument sebagai dict.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_007",
        questionEN: "What does enumerate() return?",
        questionID: "Apa yang dikembalikan enumerate()?",
        options: [
            QuestionOption(id: "a", textEN: "Pairs of (index, element) for an iterable", textID: "Pasangan (indeks, elemen) untuk iterable"),
            QuestionOption(id: "b", textEN: "Only indices", textID: "Hanya indeks"),
            QuestionOption(id: "c", textEN: "Only elements", textID: "Hanya elemen"),
            QuestionOption(id: "d", textEN: "The length of the iterable", textID: "Panjang iterable")
        ],
        correctOptionId: "a",
        explanationEN: "enumerate(['a', 'b', 'c']) yields (0, 'a'), (1, 'b'), (2, 'c'). Useful for: for i, item in enumerate(data). Optional start: enumerate(data, start=1).",
        explanationID: "enumerate(['a', 'b', 'c']) menghasilkan (0, 'a'), (1, 'b'), (2, 'c'). Berguna untuk: for i, item in enumerate(data). Start opsional: enumerate(data, start=1).",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_008",
        questionEN: "What is a lambda function in Python?",
        questionID: "Apa itu fungsi lambda di Python?",
        options: [
            QuestionOption(id: "a", textEN: "An anonymous inline function: lambda x: x**2", textID: "Fungsi anonim inline: lambda x: x**2"),
            QuestionOption(id: "b", textEN: "A special math function", textID: "Fungsi matematika khusus"),
            QuestionOption(id: "c", textEN: "A function with no return", textID: "Fungsi tanpa return"),
            QuestionOption(id: "d", textEN: "A recursive function", textID: "Fungsi rekursif")
        ],
        correctOptionId: "a",
        explanationEN: "Lambda creates small anonymous functions: lambda x: x**2 is equivalent to def f(x): return x**2. Useful for map, filter, sort key: sorted(data, key=lambda x: x[1]).",
        explanationID: "Lambda membuat fungsi anonim kecil: lambda x: x**2 setara dengan def f(x): return x**2. Berguna untuk map, filter, sort key: sorted(data, key=lambda x: x[1]).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_009",
        questionEN: "What does @ operator do with NumPy arrays or PyTorch tensors?",
        questionID: "Apa yang dilakukan operator @ dengan NumPy array atau PyTorch tensor?",
        options: [
            QuestionOption(id: "a", textEN: "Matrix multiplication", textID: "Perkalian matriks"),
            QuestionOption(id: "b", textEN: "Element-wise multiplication", textID: "Perkalian element-wise"),
            QuestionOption(id: "c", textEN: "Division", textID: "Pembagian"),
            QuestionOption(id: "d", textEN: "Concatenation", textID: "Penggabungan")
        ],
        correctOptionId: "a",
        explanationEN: "The @ operator performs matrix multiplication: A @ B is equivalent to np.matmul(A, B) or torch.matmul(A, B). For element-wise: use A * B.",
        explanationID: "Operator @ melakukan perkalian matriks: A @ B setara dengan np.matmul(A, B) atau torch.matmul(A, B). Untuk element-wise: gunakan A * B.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_010",
        questionEN: "What is broadcasting in NumPy/PyTorch?",
        questionID: "Apa itu broadcasting di NumPy/PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Automatically expanding dimensions to make shapes compatible for element-wise operations", textID: "Memperluas dimensi secara otomatis agar shape kompatibel untuk operasi element-wise"),
            QuestionOption(id: "b", textEN: "Sending data to multiple GPUs", textID: "Mengirim data ke beberapa GPU"),
            QuestionOption(id: "c", textEN: "Printing array values", textID: "Mencetak nilai array"),
            QuestionOption(id: "d", textEN: "Converting between types", textID: "Konversi antar tipe")
        ],
        correctOptionId: "a",
        explanationEN: "Broadcasting stretches smaller arrays to match larger ones: [1,2,3] + [[1],[2]] works by expanding to (2,3) shapes. Rules: trailing dimensions must match or be 1.",
        explanationID: "Broadcasting merentangkan array kecil untuk mencocokkan yang lebih besar: [1,2,3] + [[1],[2]] bekerja dengan memperluas ke shape (2,3). Aturan: dimensi trailing harus cocok atau 1.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // MARK: - PyTorch Tensors (Questions 11-20)
    Question(
        id: "py_torch_011",
        questionEN: "How do you create a PyTorch tensor from a Python list?",
        questionID: "Bagaimana cara membuat tensor PyTorch dari Python list?",
        options: [
            QuestionOption(id: "a", textEN: "torch.tensor([1, 2, 3])", textID: "torch.tensor([1, 2, 3])"),
            QuestionOption(id: "b", textEN: "torch.Tensor.from_list([1, 2, 3])", textID: "torch.Tensor.from_list([1, 2, 3])"),
            QuestionOption(id: "c", textEN: "PyTorch.create([1, 2, 3])", textID: "PyTorch.create([1, 2, 3])"),
            QuestionOption(id: "d", textEN: "tensor([1, 2, 3])", textID: "tensor([1, 2, 3])")
        ],
        correctOptionId: "a",
        explanationEN: "torch.tensor() creates a tensor from data: torch.tensor([1, 2, 3]) or torch.tensor([[1,2], [3,4]]). Alternatively: torch.FloatTensor([1, 2, 3]) for specific dtype.",
        explanationID: "torch.tensor() membuat tensor dari data: torch.tensor([1, 2, 3]) atau torch.tensor([[1,2], [3,4]]). Alternatif: torch.FloatTensor([1, 2, 3]) untuk dtype tertentu.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_012",
        questionEN: "What does tensor.shape return?",
        questionID: "Apa yang dikembalikan tensor.shape?",
        options: [
            QuestionOption(id: "a", textEN: "The dimensions of the tensor as a torch.Size object", textID: "Dimensi tensor sebagai objek torch.Size"),
            QuestionOption(id: "b", textEN: "The total number of elements", textID: "Jumlah total elemen"),
            QuestionOption(id: "c", textEN: "The data type", textID: "Tipe data"),
            QuestionOption(id: "d", textEN: "The memory address", textID: "Alamat memori")
        ],
        correctOptionId: "a",
        explanationEN: "tensor.shape (or tensor.size()) returns dimensions: torch.tensor([[1,2,3], [4,5,6]]).shape is torch.Size([2, 3]). This is crucial for debugging shape mismatches.",
        explanationID: "tensor.shape (atau tensor.size()) mengembalikan dimensi: torch.tensor([[1,2,3], [4,5,6]]).shape adalah torch.Size([2, 3]). Ini penting untuk debugging shape mismatch.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_013",
        questionEN: "What does tensor.view() do?",
        questionID: "Apa yang dilakukan tensor.view()?",
        options: [
            QuestionOption(id: "a", textEN: "Reshapes the tensor to specified dimensions without copying data", textID: "Mengubah shape tensor ke dimensi tertentu tanpa menyalin data"),
            QuestionOption(id: "b", textEN: "Displays the tensor", textID: "Menampilkan tensor"),
            QuestionOption(id: "c", textEN: "Creates a copy", textID: "Membuat salinan"),
            QuestionOption(id: "d", textEN: "Converts to numpy", textID: "Mengonversi ke numpy")
        ],
        correctOptionId: "a",
        explanationEN: "view() reshapes while sharing memory: x.view(2, 3) reshapes to 2×3. Use -1 for auto-inference: x.view(-1, 3) computes first dim automatically. Total elements must match.",
        explanationID: "view() mengubah shape sambil berbagi memori: x.view(2, 3) mengubah ke 2×3. Gunakan -1 untuk auto-inference: x.view(-1, 3) menghitung dim pertama otomatis. Total elemen harus cocok.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_014",
        questionEN: "What is the difference between view() and reshape() in PyTorch?",
        questionID: "Apa perbedaan antara view() dan reshape() di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "reshape() can handle non-contiguous tensors by copying; view() requires contiguous memory", textID: "reshape() dapat menangani tensor non-contiguous dengan menyalin; view() memerlukan memori contiguous"),
            QuestionOption(id: "b", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "c", textEN: "view() is faster always", textID: "view() selalu lebih cepat"),
            QuestionOption(id: "d", textEN: "reshape() only works on CPU", textID: "reshape() hanya bekerja di CPU")
        ],
        correctOptionId: "a",
        explanationEN: "view() requires contiguous memory and fails otherwise. reshape() works on any tensor - it returns a view if possible, or copies if necessary. Use reshape() for safety.",
        explanationID: "view() memerlukan memori contiguous dan gagal jika tidak. reshape() bekerja pada tensor apapun - mengembalikan view jika memungkinkan, atau menyalin jika perlu. Gunakan reshape() untuk keamanan.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_015",
        questionEN: "How do you move a tensor to GPU in PyTorch?",
        questionID: "Bagaimana cara memindahkan tensor ke GPU di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "tensor.to('cuda') or tensor.cuda()", textID: "tensor.to('cuda') atau tensor.cuda()"),
            QuestionOption(id: "b", textEN: "tensor.gpu()", textID: "tensor.gpu()"),
            QuestionOption(id: "c", textEN: "tensor.to_gpu()", textID: "tensor.to_gpu()"),
            QuestionOption(id: "d", textEN: "GPU(tensor)", textID: "GPU(tensor)")
        ],
        correctOptionId: "a",
        explanationEN: "tensor.to('cuda') or tensor.to(device) moves tensor to GPU. tensor.cuda() is a shorthand. Use torch.device('cuda' if torch.cuda.is_available() else 'cpu') for portability.",
        explanationID: "tensor.to('cuda') atau tensor.to(device) memindahkan tensor ke GPU. tensor.cuda() adalah singkatan. Gunakan torch.device('cuda' if torch.cuda.is_available() else 'cpu') untuk portabilitas.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_016",
        questionEN: "What does requires_grad=True do?",
        questionID: "Apa yang dilakukan requires_grad=True?",
        options: [
            QuestionOption(id: "a", textEN: "Tells PyTorch to track operations for automatic differentiation", textID: "Memberitahu PyTorch untuk melacak operasi untuk diferensiasi otomatis"),
            QuestionOption(id: "b", textEN: "Makes the tensor read-only", textID: "Membuat tensor hanya-baca"),
            QuestionOption(id: "c", textEN: "Requires a gradient value as input", textID: "Memerlukan nilai gradien sebagai input"),
            QuestionOption(id: "d", textEN: "Makes computation faster", textID: "Membuat komputasi lebih cepat")
        ],
        correctOptionId: "a",
        explanationEN: "requires_grad=True enables gradient tracking. All operations on this tensor are recorded for backpropagation. Use tensor.requires_grad_(True) to set in-place.",
        explanationID: "requires_grad=True mengaktifkan pelacakan gradien. Semua operasi pada tensor ini dicatat untuk backpropagation. Gunakan tensor.requires_grad_(True) untuk set in-place.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_017",
        questionEN: "What does torch.no_grad() context do?",
        questionID: "Apa yang dilakukan konteks torch.no_grad()?",
        options: [
            QuestionOption(id: "a", textEN: "Disables gradient computation, saving memory during inference", textID: "Menonaktifkan komputasi gradien, menghemat memori saat inference"),
            QuestionOption(id: "b", textEN: "Removes all gradients", textID: "Menghapus semua gradien"),
            QuestionOption(id: "c", textEN: "Sets all gradients to zero", textID: "Mengatur semua gradien ke nol"),
            QuestionOption(id: "d", textEN: "Prevents tensor creation", textID: "Mencegah pembuatan tensor")
        ],
        correctOptionId: "a",
        explanationEN: "with torch.no_grad(): disables autograd, reducing memory usage and speeding up inference. Use during evaluation/inference when gradients aren't needed.",
        explanationID: "with torch.no_grad(): menonaktifkan autograd, mengurangi penggunaan memori dan mempercepat inference. Gunakan saat evaluasi/inference ketika gradien tidak diperlukan.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_018",
        questionEN: "What does tensor.detach() do?",
        questionID: "Apa yang dilakukan tensor.detach()?",
        options: [
            QuestionOption(id: "a", textEN: "Returns a tensor detached from the computation graph (no gradient tracking)", textID: "Mengembalikan tensor yang dipisahkan dari computation graph (tanpa pelacakan gradien)"),
            QuestionOption(id: "b", textEN: "Removes the tensor from memory", textID: "Menghapus tensor dari memori"),
            QuestionOption(id: "c", textEN: "Disconnects from GPU", textID: "Memutuskan dari GPU"),
            QuestionOption(id: "d", textEN: "Splits the tensor", textID: "Memisahkan tensor")
        ],
        correctOptionId: "a",
        explanationEN: "detach() creates a tensor that shares data but isn't tracked by autograd. Useful when you want to use a value without affecting gradient computation, e.g., for targets in some losses.",
        explanationID: "detach() membuat tensor yang berbagi data tetapi tidak dilacak oleh autograd. Berguna ketika ingin menggunakan nilai tanpa mempengaruhi komputasi gradien, misalnya untuk target di beberapa loss.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_019",
        questionEN: "How do you convert a PyTorch tensor to NumPy array?",
        questionID: "Bagaimana cara mengonversi tensor PyTorch ke NumPy array?",
        options: [
            QuestionOption(id: "a", textEN: "tensor.numpy() (for CPU tensors)", textID: "tensor.numpy() (untuk tensor CPU)"),
            QuestionOption(id: "b", textEN: "np.array(tensor)", textID: "np.array(tensor)"),
            QuestionOption(id: "c", textEN: "tensor.to_numpy()", textID: "tensor.to_numpy()"),
            QuestionOption(id: "d", textEN: "numpy(tensor)", textID: "numpy(tensor)")
        ],
        correctOptionId: "a",
        explanationEN: "tensor.numpy() converts to NumPy (CPU only, shares memory). For GPU: tensor.cpu().numpy(). For gradient tensors: tensor.detach().cpu().numpy().",
        explanationID: "tensor.numpy() mengonversi ke NumPy (hanya CPU, berbagi memori). Untuk GPU: tensor.cpu().numpy(). Untuk tensor gradien: tensor.detach().cpu().numpy().",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_020",
        questionEN: "What does torch.stack() do vs torch.cat()?",
        questionID: "Apa yang dilakukan torch.stack() vs torch.cat()?",
        options: [
            QuestionOption(id: "a", textEN: "stack creates new dimension; cat concatenates along existing dimension", textID: "stack membuat dimensi baru; cat menggabungkan sepanjang dimensi yang ada"),
            QuestionOption(id: "b", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "c", textEN: "stack is for 1D, cat for 2D", textID: "stack untuk 1D, cat untuk 2D"),
            QuestionOption(id: "d", textEN: "cat creates new dimension", textID: "cat membuat dimensi baru")
        ],
        correctOptionId: "a",
        explanationEN: "torch.cat([a, b], dim=0) concatenates along dim 0. torch.stack([a, b], dim=0) creates new dimension. If a, b are (3,): cat gives (6,), stack gives (2, 3).",
        explanationID: "torch.cat([a, b], dim=0) menggabungkan sepanjang dim 0. torch.stack([a, b], dim=0) membuat dimensi baru. Jika a, b adalah (3,): cat menghasilkan (6,), stack menghasilkan (2, 3).",
        topic: "computing",
        difficulty: .intermediate
    ),

    // MARK: - PyTorch Autograd (Questions 21-30)
    Question(
        id: "py_torch_021",
        questionEN: "What does loss.backward() do?",
        questionID: "Apa yang dilakukan loss.backward()?",
        options: [
            QuestionOption(id: "a", textEN: "Computes gradients of loss with respect to all tensors with requires_grad=True", textID: "Menghitung gradien loss terhadap semua tensor dengan requires_grad=True"),
            QuestionOption(id: "b", textEN: "Decreases the loss", textID: "Mengurangi loss"),
            QuestionOption(id: "c", textEN: "Reverses the forward pass", textID: "Membalik forward pass"),
            QuestionOption(id: "d", textEN: "Saves the model", textID: "Menyimpan model")
        ],
        correctOptionId: "a",
        explanationEN: "backward() computes ∂loss/∂param for all parameters by traversing the computation graph. Gradients accumulate in .grad attributes. Must call optimizer.zero_grad() before to reset.",
        explanationID: "backward() menghitung ∂loss/∂param untuk semua parameter dengan menelusuri computation graph. Gradien terakumulasi di atribut .grad. Harus memanggil optimizer.zero_grad() sebelumnya untuk reset.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_022",
        questionEN: "Why do we call optimizer.zero_grad() before backward()?",
        questionID: "Mengapa kita memanggil optimizer.zero_grad() sebelum backward()?",
        options: [
            QuestionOption(id: "a", textEN: "Because gradients accumulate by default, and we want fresh gradients each iteration", textID: "Karena gradien terakumulasi secara default, dan kita ingin gradien baru setiap iterasi"),
            QuestionOption(id: "b", textEN: "To reset the learning rate", textID: "Untuk reset learning rate"),
            QuestionOption(id: "c", textEN: "To clear the loss", textID: "Untuk menghapus loss"),
            QuestionOption(id: "d", textEN: "It's optional", textID: "Ini opsional")
        ],
        correctOptionId: "a",
        explanationEN: "PyTorch accumulates gradients (useful for gradient accumulation). For standard training, call zero_grad() before backward() to reset gradients from the previous iteration.",
        explanationID: "PyTorch mengakumulasi gradien (berguna untuk gradient accumulation). Untuk training standar, panggil zero_grad() sebelum backward() untuk reset gradien dari iterasi sebelumnya.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_023",
        questionEN: "What does optimizer.step() do?",
        questionID: "Apa yang dilakukan optimizer.step()?",
        options: [
            QuestionOption(id: "a", textEN: "Updates parameters using the computed gradients: θ = θ - lr × ∇θ", textID: "Memperbarui parameter menggunakan gradien yang dihitung: θ = θ - lr × ∇θ"),
            QuestionOption(id: "b", textEN: "Computes the loss", textID: "Menghitung loss"),
            QuestionOption(id: "c", textEN: "Performs forward pass", textID: "Melakukan forward pass"),
            QuestionOption(id: "d", textEN: "Saves checkpoints", textID: "Menyimpan checkpoint")
        ],
        correctOptionId: "a",
        explanationEN: "step() applies the optimization algorithm (SGD, Adam, etc.) to update parameters using accumulated gradients. The typical order: zero_grad() → forward → loss → backward() → step().",
        explanationID: "step() menerapkan algoritma optimisasi (SGD, Adam, dll.) untuk memperbarui parameter menggunakan gradien yang terakumulasi. Urutan umum: zero_grad() → forward → loss → backward() → step().",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_024",
        questionEN: "What is retain_graph=True in backward() used for?",
        questionID: "Untuk apa retain_graph=True di backward()?",
        options: [
            QuestionOption(id: "a", textEN: "To keep the computation graph for multiple backward passes", textID: "Untuk menyimpan computation graph untuk multiple backward pass"),
            QuestionOption(id: "b", textEN: "To save memory", textID: "Untuk menghemat memori"),
            QuestionOption(id: "c", textEN: "To prevent gradient updates", textID: "Untuk mencegah update gradien"),
            QuestionOption(id: "d", textEN: "To retain model weights", textID: "Untuk menyimpan bobot model")
        ],
        correctOptionId: "a",
        explanationEN: "By default, backward() frees the computation graph after one pass. retain_graph=True keeps it for multiple backward calls (e.g., computing gradients w.r.t. different losses).",
        explanationID: "Secara default, backward() membebaskan computation graph setelah satu pass. retain_graph=True menyimpannya untuk multiple backward call (misalnya, menghitung gradien terhadap loss berbeda).",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_025",
        questionEN: "What is gradient clipping and how is it done in PyTorch?",
        questionID: "Apa itu gradient clipping dan bagaimana melakukannya di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Limiting gradient magnitude to prevent exploding gradients: torch.nn.utils.clip_grad_norm_()", textID: "Membatasi magnitudo gradien untuk mencegah exploding gradient: torch.nn.utils.clip_grad_norm_()"),
            QuestionOption(id: "b", textEN: "Removing gradients", textID: "Menghapus gradien"),
            QuestionOption(id: "c", textEN: "Copying gradients", textID: "Menyalin gradien"),
            QuestionOption(id: "d", textEN: "Setting gradients to 1", textID: "Mengatur gradien ke 1")
        ],
        correctOptionId: "a",
        explanationEN: "Gradient clipping prevents exploding gradients by scaling down if norm exceeds threshold. torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm) clips before optimizer.step().",
        explanationID: "Gradient clipping mencegah exploding gradient dengan scaling down jika norm melebihi threshold. torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm) melakukan clip sebelum optimizer.step().",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_026",
        questionEN: "What does .grad attribute of a tensor contain?",
        questionID: "Apa isi atribut .grad dari tensor?",
        options: [
            QuestionOption(id: "a", textEN: "The gradient of some scalar with respect to that tensor", textID: "Gradien dari suatu skalar terhadap tensor tersebut"),
            QuestionOption(id: "b", textEN: "The gradient function", textID: "Fungsi gradien"),
            QuestionOption(id: "c", textEN: "The original values", textID: "Nilai asli"),
            QuestionOption(id: "d", textEN: "The tensor shape", textID: "Shape tensor")
        ],
        correctOptionId: "a",
        explanationEN: "After backward(), tensor.grad contains ∂loss/∂tensor. It has the same shape as the tensor. Initially None until backward() is called.",
        explanationID: "Setelah backward(), tensor.grad berisi ∂loss/∂tensor. Memiliki shape yang sama dengan tensor. Awalnya None sampai backward() dipanggil.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_027",
        questionEN: "What is the difference between .grad and .grad_fn?",
        questionID: "Apa perbedaan antara .grad dan .grad_fn?",
        options: [
            QuestionOption(id: "a", textEN: ".grad stores gradient values; .grad_fn stores the function that created this tensor", textID: ".grad menyimpan nilai gradien; .grad_fn menyimpan fungsi yang membuat tensor ini"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: ".grad_fn stores gradient values", textID: ".grad_fn menyimpan nilai gradien"),
            QuestionOption(id: "d", textEN: ".grad stores the function", textID: ".grad menyimpan fungsi")
        ],
        correctOptionId: "a",
        explanationEN: ".grad holds the actual gradient tensor after backward(). .grad_fn references the operation that created this tensor (e.g., AddBackward0), used for graph traversal.",
        explanationID: ".grad menyimpan tensor gradien aktual setelah backward(). .grad_fn mereferensikan operasi yang membuat tensor ini (misalnya, AddBackward0), digunakan untuk traversal graph.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_028",
        questionEN: "How do you freeze a layer's parameters (no gradient updates)?",
        questionID: "Bagaimana cara membekukan parameter layer (tidak ada update gradien)?",
        options: [
            QuestionOption(id: "a", textEN: "Set requires_grad = False for each parameter in the layer", textID: "Set requires_grad = False untuk setiap parameter di layer"),
            QuestionOption(id: "b", textEN: "Delete the layer", textID: "Hapus layer"),
            QuestionOption(id: "c", textEN: "Set learning rate to 0", textID: "Set learning rate ke 0"),
            QuestionOption(id: "d", textEN: "Use a special layer type", textID: "Gunakan tipe layer khusus")
        ],
        correctOptionId: "a",
        explanationEN: "for param in layer.parameters(): param.requires_grad = False freezes parameters. They won't receive gradients or be updated. Useful for transfer learning.",
        explanationID: "for param in layer.parameters(): param.requires_grad = False membekukan parameter. Mereka tidak akan menerima gradien atau diperbarui. Berguna untuk transfer learning.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_029",
        questionEN: "What does torch.autograd.grad() do?",
        questionID: "Apa yang dilakukan torch.autograd.grad()?",
        options: [
            QuestionOption(id: "a", textEN: "Computes gradients of outputs with respect to inputs without using .backward()", textID: "Menghitung gradien output terhadap input tanpa menggunakan .backward()"),
            QuestionOption(id: "b", textEN: "Creates gradients", textID: "Membuat gradien"),
            QuestionOption(id: "c", textEN: "Zeros gradients", textID: "Menolkan gradien"),
            QuestionOption(id: "d", textEN: "The same as backward()", textID: "Sama dengan backward()")
        ],
        correctOptionId: "a",
        explanationEN: "torch.autograd.grad(outputs, inputs) returns gradients directly without accumulating in .grad. Useful for computing higher-order derivatives or custom gradient computations.",
        explanationID: "torch.autograd.grad(outputs, inputs) mengembalikan gradien langsung tanpa mengakumulasi di .grad. Berguna untuk menghitung turunan orde tinggi atau komputasi gradien kustom.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_030",
        questionEN: "What is create_graph=True in backward() used for?",
        questionID: "Untuk apa create_graph=True di backward()?",
        options: [
            QuestionOption(id: "a", textEN: "To compute higher-order derivatives (gradients of gradients)", textID: "Untuk menghitung turunan orde tinggi (gradien dari gradien)"),
            QuestionOption(id: "b", textEN: "To visualize the graph", textID: "Untuk memvisualisasi graph"),
            QuestionOption(id: "c", textEN: "To save the graph to disk", textID: "Untuk menyimpan graph ke disk"),
            QuestionOption(id: "d", textEN: "To create a new model", textID: "Untuk membuat model baru")
        ],
        correctOptionId: "a",
        explanationEN: "create_graph=True preserves the graph of the gradient computation itself, enabling higher-order derivatives like Hessian-vector products for second-order optimization.",
        explanationID: "create_graph=True mempertahankan graph dari komputasi gradien itu sendiri, memungkinkan turunan orde tinggi seperti Hessian-vector product untuk optimisasi orde dua.",
        topic: "computing",
        difficulty: .advanced
    ),

    // MARK: - nn.Module & Training (Questions 31-40)
    Question(
        id: "py_torch_031",
        questionEN: "How do you define a custom neural network in PyTorch?",
        questionID: "Bagaimana cara mendefinisikan neural network kustom di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Subclass nn.Module and implement __init__ and forward methods", textID: "Subclass nn.Module dan implementasikan method __init__ dan forward"),
            QuestionOption(id: "b", textEN: "Use a dictionary of layers", textID: "Gunakan dictionary dari layer"),
            QuestionOption(id: "c", textEN: "Just define functions", textID: "Cukup definisikan fungsi"),
            QuestionOption(id: "d", textEN: "Use only nn.Sequential", textID: "Hanya gunakan nn.Sequential")
        ],
        correctOptionId: "a",
        explanationEN: "class MyNet(nn.Module): def __init__(self): super().__init__(); self.fc = nn.Linear(10, 5); def forward(self, x): return self.fc(x). Register layers in __init__, computation in forward.",
        explanationID: "class MyNet(nn.Module): def __init__(self): super().__init__(); self.fc = nn.Linear(10, 5); def forward(self, x): return self.fc(x). Daftarkan layer di __init__, komputasi di forward.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_032",
        questionEN: "What is the purpose of model.train() vs model.eval()?",
        questionID: "Apa tujuan model.train() vs model.eval()?",
        options: [
            QuestionOption(id: "a", textEN: "train() enables dropout/batchnorm training behavior; eval() disables them for inference", textID: "train() mengaktifkan perilaku training dropout/batchnorm; eval() menonaktifkannya untuk inference"),
            QuestionOption(id: "b", textEN: "train() starts training; eval() evaluates loss", textID: "train() memulai training; eval() mengevaluasi loss"),
            QuestionOption(id: "c", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "d", textEN: "eval() enables dropout", textID: "eval() mengaktifkan dropout")
        ],
        correctOptionId: "a",
        explanationEN: "model.train() sets training mode: dropout active, batchnorm uses batch stats. model.eval() sets inference mode: dropout disabled, batchnorm uses running stats. Critical for proper behavior!",
        explanationID: "model.train() mengatur mode training: dropout aktif, batchnorm menggunakan statistik batch. model.eval() mengatur mode inference: dropout dinonaktifkan, batchnorm menggunakan running stats. Penting untuk perilaku yang benar!",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_033",
        questionEN: "What does model.parameters() return?",
        questionID: "Apa yang dikembalikan model.parameters()?",
        options: [
            QuestionOption(id: "a", textEN: "An iterator over all learnable parameters of the model", textID: "Iterator atas semua parameter yang dapat dipelajari dari model"),
            QuestionOption(id: "b", textEN: "A list of layer names", textID: "Daftar nama layer"),
            QuestionOption(id: "c", textEN: "The model architecture", textID: "Arsitektur model"),
            QuestionOption(id: "d", textEN: "The loss function", textID: "Fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "model.parameters() returns an iterator over all Parameters (weights, biases) that have requires_grad=True. Used to pass to optimizer: optimizer = torch.optim.Adam(model.parameters(), lr=0.001).",
        explanationID: "model.parameters() mengembalikan iterator atas semua Parameter (bobot, bias) yang memiliki requires_grad=True. Digunakan untuk dipass ke optimizer: optimizer = torch.optim.Adam(model.parameters(), lr=0.001).",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_034",
        questionEN: "How do you save and load a PyTorch model?",
        questionID: "Bagaimana cara menyimpan dan memuat model PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "torch.save(model.state_dict(), path) and model.load_state_dict(torch.load(path))", textID: "torch.save(model.state_dict(), path) dan model.load_state_dict(torch.load(path))"),
            QuestionOption(id: "b", textEN: "model.save(path) and model.load(path)", textID: "model.save(path) dan model.load(path)"),
            QuestionOption(id: "c", textEN: "pickle.dump and pickle.load", textID: "pickle.dump dan pickle.load"),
            QuestionOption(id: "d", textEN: "np.save and np.load", textID: "np.save dan np.load")
        ],
        correctOptionId: "a",
        explanationEN: "Save state_dict (recommended): torch.save(model.state_dict(), 'model.pth'). Load: model.load_state_dict(torch.load('model.pth')). This saves only weights, not model structure.",
        explanationID: "Simpan state_dict (disarankan): torch.save(model.state_dict(), 'model.pth'). Muat: model.load_state_dict(torch.load('model.pth')). Ini hanya menyimpan bobot, bukan struktur model.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_035",
        questionEN: "What is nn.Sequential used for?",
        questionID: "Untuk apa nn.Sequential digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Creating a simple sequential model where output of one layer feeds into the next", textID: "Membuat model sekuensial sederhana dimana output satu layer menjadi input layer berikutnya"),
            QuestionOption(id: "b", textEN: "Running operations in parallel", textID: "Menjalankan operasi secara paralel"),
            QuestionOption(id: "c", textEN: "Creating loops", textID: "Membuat loop"),
            QuestionOption(id: "d", textEN: "Defining loss functions", textID: "Mendefinisikan fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "nn.Sequential(nn.Linear(10, 20), nn.ReLU(), nn.Linear(20, 5)) chains layers. The forward pass flows sequentially through all layers. Simple but less flexible than custom modules.",
        explanationID: "nn.Sequential(nn.Linear(10, 20), nn.ReLU(), nn.Linear(20, 5)) merantai layer. Forward pass mengalir secara sekuensial melalui semua layer. Sederhana tapi kurang fleksibel dari modul kustom.",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_036",
        questionEN: "What does nn.Dropout(p=0.5) do?",
        questionID: "Apa yang dilakukan nn.Dropout(p=0.5)?",
        options: [
            QuestionOption(id: "a", textEN: "Randomly sets 50% of inputs to zero during training, scaling others by 1/(1-p)", textID: "Secara acak mengatur 50% input ke nol selama training, menskalakan yang lain dengan 1/(1-p)"),
            QuestionOption(id: "b", textEN: "Removes 50% of parameters", textID: "Menghapus 50% parameter"),
            QuestionOption(id: "c", textEN: "Reduces learning rate by 50%", textID: "Mengurangi learning rate sebesar 50%"),
            QuestionOption(id: "d", textEN: "Drops 50% of layers", textID: "Menghapus 50% layer")
        ],
        correctOptionId: "a",
        explanationEN: "Dropout randomly zeros elements with probability p during training (regularization). Remaining elements are scaled by 1/(1-p) so expected value stays the same. Inactive in eval() mode.",
        explanationID: "Dropout secara acak menolkan elemen dengan probabilitas p selama training (regularisasi). Elemen yang tersisa diskalakan dengan 1/(1-p) sehingga nilai harapan tetap sama. Tidak aktif dalam mode eval().",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_037",
        questionEN: "What is nn.BatchNorm1d(num_features) used for?",
        questionID: "Untuk apa nn.BatchNorm1d(num_features)?",
        options: [
            QuestionOption(id: "a", textEN: "Normalizing activations across the batch dimension, with learnable scale and shift", textID: "Menormalisasi aktivasi sepanjang dimensi batch, dengan skala dan shift yang dapat dipelajari"),
            QuestionOption(id: "b", textEN: "Normalizing the loss", textID: "Menormalisasi loss"),
            QuestionOption(id: "c", textEN: "Normalizing input data once", textID: "Menormalisasi data input sekali"),
            QuestionOption(id: "d", textEN: "Normalizing weights", textID: "Menormalisasi bobot")
        ],
        correctOptionId: "a",
        explanationEN: "BatchNorm normalizes: (x - mean) / std per feature, then applies learnable γ and β. Improves training stability and speed. Uses batch statistics in training, running statistics in eval.",
        explanationID: "BatchNorm menormalisasi: (x - mean) / std per fitur, lalu menerapkan γ dan β yang dapat dipelajari. Meningkatkan stabilitas dan kecepatan training. Menggunakan statistik batch saat training, running statistics saat eval.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_038",
        questionEN: "What is the output shape of nn.Conv2d(3, 64, kernel_size=3, padding=1) for input (N, 3, H, W)?",
        questionID: "Apa shape output nn.Conv2d(3, 64, kernel_size=3, padding=1) untuk input (N, 3, H, W)?",
        options: [
            QuestionOption(id: "a", textEN: "(N, 64, H, W) - same spatial dimensions due to padding=1", textID: "(N, 64, H, W) - dimensi spasial sama karena padding=1"),
            QuestionOption(id: "b", textEN: "(N, 64, H-2, W-2)", textID: "(N, 64, H-2, W-2)"),
            QuestionOption(id: "c", textEN: "(N, 3, H, W)", textID: "(N, 3, H, W)"),
            QuestionOption(id: "d", textEN: "(N, 64, H+2, W+2)", textID: "(N, 64, H+2, W+2)")
        ],
        correctOptionId: "a",
        explanationEN: "Conv2d(3, 64, 3, padding=1): 3 input channels, 64 output channels. With kernel_size=3 and padding=1, spatial dimensions are preserved: output_size = input_size - 3 + 2*1 + 1 = input_size.",
        explanationID: "Conv2d(3, 64, 3, padding=1): 3 channel input, 64 channel output. Dengan kernel_size=3 dan padding=1, dimensi spasial dipertahankan: output_size = input_size - 3 + 2*1 + 1 = input_size.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_039",
        questionEN: "What does nn.CrossEntropyLoss expect as input?",
        questionID: "Apa yang diharapkan nn.CrossEntropyLoss sebagai input?",
        options: [
            QuestionOption(id: "a", textEN: "Raw logits (not softmax) and integer class labels", textID: "Logit mentah (bukan softmax) dan label kelas integer"),
            QuestionOption(id: "b", textEN: "Probabilities and one-hot labels", textID: "Probabilitas dan label one-hot"),
            QuestionOption(id: "c", textEN: "Softmax outputs and float labels", textID: "Output softmax dan label float"),
            QuestionOption(id: "d", textEN: "Any format", textID: "Format apapun")
        ],
        correctOptionId: "a",
        explanationEN: "nn.CrossEntropyLoss combines LogSoftmax and NLLLoss. Input: raw scores/logits (N, C), target: class indices (N,) as LongTensor. Don't apply softmax before - it's done internally.",
        explanationID: "nn.CrossEntropyLoss menggabungkan LogSoftmax dan NLLLoss. Input: skor/logit mentah (N, C), target: indeks kelas (N,) sebagai LongTensor. Jangan terapkan softmax sebelumnya - dilakukan secara internal.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_040",
        questionEN: "What is the correct training loop order in PyTorch?",
        questionID: "Apa urutan training loop yang benar di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "optimizer.zero_grad() → output = model(x) → loss = criterion(output, y) → loss.backward() → optimizer.step()", textID: "optimizer.zero_grad() → output = model(x) → loss = criterion(output, y) → loss.backward() → optimizer.step()"),
            QuestionOption(id: "b", textEN: "loss.backward() → optimizer.step() → optimizer.zero_grad()", textID: "loss.backward() → optimizer.step() → optimizer.zero_grad()"),
            QuestionOption(id: "c", textEN: "model(x) → loss.backward() → optimizer.zero_grad()", textID: "model(x) → loss.backward() → optimizer.zero_grad()"),
            QuestionOption(id: "d", textEN: "optimizer.step() → loss.backward()", textID: "optimizer.step() → loss.backward()")
        ],
        correctOptionId: "a",
        explanationEN: "Standard order: 1) zero_grad to clear old gradients, 2) forward pass, 3) compute loss, 4) backward to compute gradients, 5) step to update weights. This order is critical!",
        explanationID: "Urutan standar: 1) zero_grad untuk menghapus gradien lama, 2) forward pass, 3) hitung loss, 4) backward untuk menghitung gradien, 5) step untuk memperbarui bobot. Urutan ini sangat penting!",
        topic: "computing",
        difficulty: .intermediate
    ),

    // MARK: - DataLoader & Advanced (Questions 41-50)
    Question(
        id: "py_torch_041",
        questionEN: "What is torch.utils.data.DataLoader used for?",
        questionID: "Untuk apa torch.utils.data.DataLoader digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Batching, shuffling, and parallel loading of dataset samples", textID: "Batching, shuffling, dan loading paralel sampel dataset"),
            QuestionOption(id: "b", textEN: "Downloading datasets", textID: "Mengunduh dataset"),
            QuestionOption(id: "c", textEN: "Saving data to disk", textID: "Menyimpan data ke disk"),
            QuestionOption(id: "d", textEN: "Data augmentation only", textID: "Hanya augmentasi data")
        ],
        correctOptionId: "a",
        explanationEN: "DataLoader wraps a Dataset and provides batching (batch_size), shuffling (shuffle=True), and parallel data loading (num_workers). Iterating yields batches for training.",
        explanationID: "DataLoader membungkus Dataset dan menyediakan batching (batch_size), shuffling (shuffle=True), dan loading data paralel (num_workers). Iterasi menghasilkan batch untuk training.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_042",
        questionEN: "How do you create a custom Dataset in PyTorch?",
        questionID: "Bagaimana cara membuat Dataset kustom di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Subclass torch.utils.data.Dataset and implement __len__ and __getitem__", textID: "Subclass torch.utils.data.Dataset dan implementasikan __len__ dan __getitem__"),
            QuestionOption(id: "b", textEN: "Just use a Python list", textID: "Cukup gunakan Python list"),
            QuestionOption(id: "c", textEN: "Use only DataLoader", textID: "Hanya gunakan DataLoader"),
            QuestionOption(id: "d", textEN: "Subclass nn.Module", textID: "Subclass nn.Module")
        ],
        correctOptionId: "a",
        explanationEN: "class MyDataset(Dataset): def __len__(self): return n; def __getitem__(self, idx): return self.data[idx], self.labels[idx]. __len__ returns size, __getitem__ returns one sample.",
        explanationID: "class MyDataset(Dataset): def __len__(self): return n; def __getitem__(self, idx): return self.data[idx], self.labels[idx]. __len__ mengembalikan ukuran, __getitem__ mengembalikan satu sampel.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_043",
        questionEN: "What does num_workers parameter in DataLoader do?",
        questionID: "Apa yang dilakukan parameter num_workers di DataLoader?",
        options: [
            QuestionOption(id: "a", textEN: "Specifies number of subprocesses for parallel data loading", textID: "Menentukan jumlah subproses untuk loading data paralel"),
            QuestionOption(id: "b", textEN: "Specifies number of GPUs", textID: "Menentukan jumlah GPU"),
            QuestionOption(id: "c", textEN: "Specifies number of training epochs", textID: "Menentukan jumlah epoch training"),
            QuestionOption(id: "d", textEN: "Specifies batch size", textID: "Menentukan batch size")
        ],
        correctOptionId: "a",
        explanationEN: "num_workers>0 spawns subprocesses for parallel data loading/preprocessing, speeding up training. num_workers=0 loads data in the main process. Use num_workers=4 as a starting point.",
        explanationID: "num_workers>0 membuat subproses untuk loading/preprocessing data paralel, mempercepat training. num_workers=0 memuat data di proses utama. Gunakan num_workers=4 sebagai titik awal.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_044",
        questionEN: "What is collate_fn in DataLoader?",
        questionID: "Apa itu collate_fn di DataLoader?",
        options: [
            QuestionOption(id: "a", textEN: "A function that defines how to batch samples together", textID: "Fungsi yang mendefinisikan cara menggabungkan sampel menjadi batch"),
            QuestionOption(id: "b", textEN: "A function to download data", textID: "Fungsi untuk mengunduh data"),
            QuestionOption(id: "c", textEN: "A function to split data", textID: "Fungsi untuk memisahkan data"),
            QuestionOption(id: "d", textEN: "A loss function", textID: "Fungsi loss")
        ],
        correctOptionId: "a",
        explanationEN: "collate_fn merges a list of samples into a batch. Default stacks tensors. Custom collate_fn is needed for variable-length sequences, complex data structures, or special padding.",
        explanationID: "collate_fn menggabungkan daftar sampel menjadi batch. Default menumpuk tensor. collate_fn kustom diperlukan untuk sekuens panjang variabel, struktur data kompleks, atau padding khusus.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_045",
        questionEN: "How do you use a learning rate scheduler in PyTorch?",
        questionID: "Bagaimana cara menggunakan learning rate scheduler di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Create scheduler(optimizer), call scheduler.step() after each epoch", textID: "Buat scheduler(optimizer), panggil scheduler.step() setelah setiap epoch"),
            QuestionOption(id: "b", textEN: "scheduler is called automatically", textID: "scheduler dipanggil secara otomatis"),
            QuestionOption(id: "c", textEN: "Change optimizer.lr directly", textID: "Ubah optimizer.lr langsung"),
            QuestionOption(id: "d", textEN: "Create new optimizer each epoch", textID: "Buat optimizer baru setiap epoch")
        ],
        correctOptionId: "a",
        explanationEN: "scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1). After optimizer.step(), call scheduler.step() (usually per epoch). Common: StepLR, CosineAnnealingLR.",
        explanationID: "scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1). Setelah optimizer.step(), panggil scheduler.step() (biasanya per epoch). Umum: StepLR, CosineAnnealingLR.",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_046",
        questionEN: "What is torch.nn.functional (F) used for?",
        questionID: "Untuk apa torch.nn.functional (F) digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Stateless functional versions of operations like F.relu, F.softmax, F.cross_entropy", textID: "Versi fungsional stateless dari operasi seperti F.relu, F.softmax, F.cross_entropy"),
            QuestionOption(id: "b", textEN: "Only for debugging", textID: "Hanya untuk debugging"),
            QuestionOption(id: "c", textEN: "Creating layers", textID: "Membuat layer"),
            QuestionOption(id: "d", textEN: "Saving models", textID: "Menyimpan model")
        ],
        correctOptionId: "a",
        explanationEN: "F contains functional versions of operations: F.relu(x), F.softmax(x, dim=1). Unlike nn.ReLU(), they're stateless (no learnable parameters). Use for flexibility in forward().",
        explanationID: "F berisi versi fungsional dari operasi: F.relu(x), F.softmax(x, dim=1). Berbeda dengan nn.ReLU(), mereka stateless (tidak ada parameter yang dipelajari). Gunakan untuk fleksibilitas di forward().",
        topic: "computing",
        difficulty: .intermediate
    ),

    Question(
        id: "py_torch_047",
        questionEN: "How do you check if CUDA is available in PyTorch?",
        questionID: "Bagaimana cara mengecek apakah CUDA tersedia di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "torch.cuda.is_available()", textID: "torch.cuda.is_available()"),
            QuestionOption(id: "b", textEN: "torch.gpu.available()", textID: "torch.gpu.available()"),
            QuestionOption(id: "c", textEN: "torch.check_cuda()", textID: "torch.check_cuda()"),
            QuestionOption(id: "d", textEN: "cuda.available()", textID: "cuda.available()")
        ],
        correctOptionId: "a",
        explanationEN: "torch.cuda.is_available() returns True if CUDA is available. Common pattern: device = torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model.to(device).",
        explanationID: "torch.cuda.is_available() mengembalikan True jika CUDA tersedia. Pola umum: device = torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model.to(device).",
        topic: "computing",
        difficulty: .beginner
    ),

    Question(
        id: "py_torch_048",
        questionEN: "What is mixed precision training (torch.cuda.amp)?",
        questionID: "Apa itu mixed precision training (torch.cuda.amp)?",
        options: [
            QuestionOption(id: "a", textEN: "Using both float16 and float32 to speed up training while maintaining accuracy", textID: "Menggunakan float16 dan float32 untuk mempercepat training sambil mempertahankan akurasi"),
            QuestionOption(id: "b", textEN: "Training with integers", textID: "Training dengan integer"),
            QuestionOption(id: "c", textEN: "Using multiple GPUs", textID: "Menggunakan beberapa GPU"),
            QuestionOption(id: "d", textEN: "Training with random precision", textID: "Training dengan presisi acak")
        ],
        correctOptionId: "a",
        explanationEN: "Automatic Mixed Precision (AMP) uses float16 for speed where safe, float32 for numerically sensitive ops. with torch.cuda.amp.autocast(): forward_pass; scaler.scale(loss).backward().",
        explanationID: "Automatic Mixed Precision (AMP) menggunakan float16 untuk kecepatan dimana aman, float32 untuk operasi sensitif numerik. with torch.cuda.amp.autocast(): forward_pass; scaler.scale(loss).backward().",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_049",
        questionEN: "What does torch.einsum do?",
        questionID: "Apa yang dilakukan torch.einsum?",
        options: [
            QuestionOption(id: "a", textEN: "Performs Einstein summation notation operations for flexible tensor contractions", textID: "Melakukan operasi notasi penjumlahan Einstein untuk kontraksi tensor yang fleksibel"),
            QuestionOption(id: "b", textEN: "Calculates eigenvalues", textID: "Menghitung eigenvalue"),
            QuestionOption(id: "c", textEN: "Sums all elements", textID: "Menjumlahkan semua elemen"),
            QuestionOption(id: "d", textEN: "Performs element-wise operations", textID: "Melakukan operasi element-wise")
        ],
        correctOptionId: "a",
        explanationEN: "torch.einsum('ij,jk->ik', A, B) does matrix multiplication. 'bij,bjk->bik' is batched matmul. Einstein notation is powerful for complex tensor operations in a single expression.",
        explanationID: "torch.einsum('ij,jk->ik', A, B) melakukan perkalian matriks. 'bij,bjk->bik' adalah batched matmul. Notasi Einstein powerful untuk operasi tensor kompleks dalam satu ekspresi.",
        topic: "computing",
        difficulty: .advanced
    ),

    Question(
        id: "py_torch_050",
        questionEN: "What is register_buffer in nn.Module?",
        questionID: "Apa itu register_buffer di nn.Module?",
        options: [
            QuestionOption(id: "a", textEN: "Registers a tensor that should be part of state_dict but is not a parameter (no gradients)", textID: "Mendaftarkan tensor yang harus menjadi bagian dari state_dict tetapi bukan parameter (tidak ada gradien)"),
            QuestionOption(id: "b", textEN: "Creates a new buffer for data", textID: "Membuat buffer baru untuk data"),
            QuestionOption(id: "c", textEN: "Registers a loss function", textID: "Mendaftarkan fungsi loss"),
            QuestionOption(id: "d", textEN: "Creates a memory cache", textID: "Membuat cache memori")
        ],
        correctOptionId: "a",
        explanationEN: "self.register_buffer('name', tensor) stores a tensor in state_dict (saved/loaded with model) but it's not a parameter (no gradient updates). Used for running statistics, fixed embeddings.",
        explanationID: "self.register_buffer('name', tensor) menyimpan tensor di state_dict (disimpan/dimuat dengan model) tetapi bukan parameter (tidak ada update gradien). Digunakan untuk running statistics, embedding tetap.",
        topic: "computing",
        difficulty: .advanced
    )
]
