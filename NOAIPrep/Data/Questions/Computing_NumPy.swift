import Foundation

// MARK: - Computing: NumPy Questions (50 questions)
// Subcategory: NumPy arrays, operations, broadcasting, linear algebra

let numpyQuestions: [Question] = [
    // Batch 1: Basic NumPy (10 questions)
    Question(
        id: "np001",
        questionEN: "What is the correct way to create a NumPy array from a Python list?",
        questionID: "Apa cara yang benar untuk membuat array NumPy dari list Python?",
        options: [
            QuestionOption(id: "a", textEN: "np.array([1, 2, 3])", textID: "np.array([1, 2, 3])"),
            QuestionOption(id: "b", textEN: "np.list([1, 2, 3])", textID: "np.list([1, 2, 3])"),
            QuestionOption(id: "c", textEN: "np.create([1, 2, 3])", textID: "np.create([1, 2, 3])"),
            QuestionOption(id: "d", textEN: "np.make([1, 2, 3])", textID: "np.make([1, 2, 3])")
        ],
        correctOptionId: "a",
        explanationEN: "np.array() is the standard function to create a NumPy array from a Python list or other array-like objects.",
        explanationID: "np.array() adalah fungsi standar untuk membuat array NumPy dari list Python atau objek array-like lainnya.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np002",
        questionEN: "What does np.zeros((3, 4)) create?",
        questionID: "Apa yang dibuat oleh np.zeros((3, 4))?",
        options: [
            QuestionOption(id: "a", textEN: "A 1D array with 12 zeros", textID: "Array 1D dengan 12 nol"),
            QuestionOption(id: "b", textEN: "A 3x4 matrix filled with zeros", textID: "Matriks 3x4 berisi nol"),
            QuestionOption(id: "c", textEN: "A 4x3 matrix filled with zeros", textID: "Matriks 4x3 berisi nol"),
            QuestionOption(id: "d", textEN: "An error because tuple is invalid", textID: "Error karena tuple tidak valid")
        ],
        correctOptionId: "b",
        explanationEN: "np.zeros((3, 4)) creates a 2D array (matrix) with 3 rows and 4 columns, all filled with zeros.",
        explanationID: "np.zeros((3, 4)) membuat array 2D (matriks) dengan 3 baris dan 4 kolom, semua berisi nol.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np003",
        questionEN: "What is the output of np.arange(0, 10, 2)?",
        questionID: "Apa output dari np.arange(0, 10, 2)?",
        options: [
            QuestionOption(id: "a", textEN: "[0, 2, 4, 6, 8]", textID: "[0, 2, 4, 6, 8]"),
            QuestionOption(id: "b", textEN: "[0, 2, 4, 6, 8, 10]", textID: "[0, 2, 4, 6, 8, 10]"),
            QuestionOption(id: "c", textEN: "[2, 4, 6, 8, 10]", textID: "[2, 4, 6, 8, 10]"),
            QuestionOption(id: "d", textEN: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]", textID: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]")
        ],
        correctOptionId: "a",
        explanationEN: "np.arange(start, stop, step) creates an array from start to stop (exclusive) with the given step. So 0, 2, 4, 6, 8 (10 is excluded).",
        explanationID: "np.arange(start, stop, step) membuat array dari start ke stop (eksklusif) dengan step yang diberikan. Jadi 0, 2, 4, 6, 8 (10 tidak termasuk).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np004",
        questionEN: "How do you get the shape of a NumPy array 'arr'?",
        questionID: "Bagaimana cara mendapatkan shape dari array NumPy 'arr'?",
        options: [
            QuestionOption(id: "a", textEN: "arr.shape()", textID: "arr.shape()"),
            QuestionOption(id: "b", textEN: "arr.shape", textID: "arr.shape"),
            QuestionOption(id: "c", textEN: "np.shape(arr)()", textID: "np.shape(arr)()"),
            QuestionOption(id: "d", textEN: "arr.size()", textID: "arr.size()")
        ],
        correctOptionId: "b",
        explanationEN: "shape is an attribute (not a method) of NumPy arrays that returns a tuple representing the dimensions of the array.",
        explanationID: "shape adalah atribut (bukan method) dari array NumPy yang mengembalikan tuple yang merepresentasikan dimensi array.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np005",
        questionEN: "What does arr.reshape(2, 6) do to a 1D array of 12 elements?",
        questionID: "Apa yang dilakukan arr.reshape(2, 6) pada array 1D dengan 12 elemen?",
        options: [
            QuestionOption(id: "a", textEN: "Creates a 2x6 matrix", textID: "Membuat matriks 2x6"),
            QuestionOption(id: "b", textEN: "Creates a 6x2 matrix", textID: "Membuat matriks 6x2"),
            QuestionOption(id: "c", textEN: "Raises an error", textID: "Menghasilkan error"),
            QuestionOption(id: "d", textEN: "Creates a 12x1 matrix", textID: "Membuat matriks 12x1")
        ],
        correctOptionId: "a",
        explanationEN: "reshape(2, 6) transforms the array into a 2D array with 2 rows and 6 columns. The total elements (2*6=12) must match the original.",
        explanationID: "reshape(2, 6) mentransformasi array menjadi array 2D dengan 2 baris dan 6 kolom. Total elemen (2*6=12) harus sama dengan aslinya.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np006",
        questionEN: "What is the difference between np.array.copy() and simple assignment (b = a)?",
        questionID: "Apa perbedaan antara np.array.copy() dan assignment sederhana (b = a)?",
        options: [
            QuestionOption(id: "a", textEN: "No difference, both create independent copies", textID: "Tidak ada perbedaan, keduanya membuat copy independen"),
            QuestionOption(id: "b", textEN: "copy() creates a deep copy, assignment creates a reference", textID: "copy() membuat deep copy, assignment membuat referensi"),
            QuestionOption(id: "c", textEN: "Assignment is faster and creates a copy", textID: "Assignment lebih cepat dan membuat copy"),
            QuestionOption(id: "d", textEN: "copy() only works for 1D arrays", textID: "copy() hanya bekerja untuk array 1D")
        ],
        correctOptionId: "b",
        explanationEN: "Simple assignment (b = a) creates a reference to the same array. Changes to b will affect a. copy() creates an independent copy.",
        explanationID: "Assignment sederhana (b = a) membuat referensi ke array yang sama. Perubahan pada b akan mempengaruhi a. copy() membuat copy independen.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np007",
        questionEN: "What does np.linspace(0, 1, 5) return?",
        questionID: "Apa yang dikembalikan np.linspace(0, 1, 5)?",
        options: [
            QuestionOption(id: "a", textEN: "[0, 0.2, 0.4, 0.6, 0.8]", textID: "[0, 0.2, 0.4, 0.6, 0.8]"),
            QuestionOption(id: "b", textEN: "[0, 0.25, 0.5, 0.75, 1.0]", textID: "[0, 0.25, 0.5, 0.75, 1.0]"),
            QuestionOption(id: "c", textEN: "[0, 1, 2, 3, 4]", textID: "[0, 1, 2, 3, 4]"),
            QuestionOption(id: "d", textEN: "[0.2, 0.4, 0.6, 0.8, 1.0]", textID: "[0.2, 0.4, 0.6, 0.8, 1.0]")
        ],
        correctOptionId: "b",
        explanationEN: "np.linspace(start, stop, num) returns num evenly spaced values from start to stop (inclusive). 5 values from 0 to 1: [0, 0.25, 0.5, 0.75, 1.0].",
        explanationID: "np.linspace(start, stop, num) mengembalikan num nilai dengan jarak sama dari start ke stop (inklusif). 5 nilai dari 0 ke 1: [0, 0.25, 0.5, 0.75, 1.0].",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np008",
        questionEN: "What is the default data type (dtype) when creating np.array([1, 2, 3])?",
        questionID: "Apa tipe data default (dtype) saat membuat np.array([1, 2, 3])?",
        options: [
            QuestionOption(id: "a", textEN: "float64", textID: "float64"),
            QuestionOption(id: "b", textEN: "int32 or int64 (platform dependent)", textID: "int32 atau int64 (tergantung platform)"),
            QuestionOption(id: "c", textEN: "object", textID: "object"),
            QuestionOption(id: "d", textEN: "uint8", textID: "uint8")
        ],
        correctOptionId: "b",
        explanationEN: "When creating an array from integers, NumPy uses int32 or int64 depending on the platform (32-bit vs 64-bit system).",
        explanationID: "Saat membuat array dari integer, NumPy menggunakan int32 atau int64 tergantung platform (sistem 32-bit vs 64-bit).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np009",
        questionEN: "How do you select the element at row 1, column 2 in a 2D array 'arr'?",
        questionID: "Bagaimana cara memilih elemen di baris 1, kolom 2 dalam array 2D 'arr'?",
        options: [
            QuestionOption(id: "a", textEN: "arr[1][2]", textID: "arr[1][2]"),
            QuestionOption(id: "b", textEN: "arr[1, 2]", textID: "arr[1, 2]"),
            QuestionOption(id: "c", textEN: "Both A and B work", textID: "A dan B keduanya bekerja"),
            QuestionOption(id: "d", textEN: "arr.get(1, 2)", textID: "arr.get(1, 2)")
        ],
        correctOptionId: "c",
        explanationEN: "Both arr[1][2] and arr[1, 2] work in NumPy. However, arr[1, 2] is preferred as it's more efficient (single indexing operation).",
        explanationID: "arr[1][2] dan arr[1, 2] keduanya bekerja di NumPy. Namun, arr[1, 2] lebih disukai karena lebih efisien (operasi indexing tunggal).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np010",
        questionEN: "What does arr[:, 0] select from a 2D array?",
        questionID: "Apa yang dipilih arr[:, 0] dari array 2D?",
        options: [
            QuestionOption(id: "a", textEN: "First row", textID: "Baris pertama"),
            QuestionOption(id: "b", textEN: "First column", textID: "Kolom pertama"),
            QuestionOption(id: "c", textEN: "Last column", textID: "Kolom terakhir"),
            QuestionOption(id: "d", textEN: "All elements", textID: "Semua elemen")
        ],
        correctOptionId: "b",
        explanationEN: "arr[:, 0] selects all rows (:) and the first column (0). This returns the first column as a 1D array.",
        explanationID: "arr[:, 0] memilih semua baris (:) dan kolom pertama (0). Ini mengembalikan kolom pertama sebagai array 1D.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 2: NumPy Operations (10 questions)
    Question(
        id: "np011",
        questionEN: "What is the result of np.array([1, 2, 3]) + np.array([4, 5, 6])?",
        questionID: "Apa hasil dari np.array([1, 2, 3]) + np.array([4, 5, 6])?",
        options: [
            QuestionOption(id: "a", textEN: "[1, 2, 3, 4, 5, 6]", textID: "[1, 2, 3, 4, 5, 6]"),
            QuestionOption(id: "b", textEN: "[5, 7, 9]", textID: "[5, 7, 9]"),
            QuestionOption(id: "c", textEN: "[[1, 2, 3], [4, 5, 6]]", textID: "[[1, 2, 3], [4, 5, 6]]"),
            QuestionOption(id: "d", textEN: "Error: cannot add arrays", textID: "Error: tidak bisa menambah array")
        ],
        correctOptionId: "b",
        explanationEN: "NumPy performs element-wise addition. Each element in the first array is added to the corresponding element in the second array.",
        explanationID: "NumPy melakukan penjumlahan element-wise. Setiap elemen di array pertama ditambahkan dengan elemen yang bersesuaian di array kedua.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np012",
        questionEN: "What does np.dot(A, B) compute for 2D arrays A and B?",
        questionID: "Apa yang dihitung np.dot(A, B) untuk array 2D A dan B?",
        options: [
            QuestionOption(id: "a", textEN: "Element-wise multiplication", textID: "Perkalian element-wise"),
            QuestionOption(id: "b", textEN: "Matrix multiplication", textID: "Perkalian matriks"),
            QuestionOption(id: "c", textEN: "Dot product (scalar)", textID: "Dot product (skalar)"),
            QuestionOption(id: "d", textEN: "Cross product", textID: "Cross product")
        ],
        correctOptionId: "b",
        explanationEN: "For 2D arrays, np.dot() performs matrix multiplication. For 1D arrays, it computes the inner product (scalar).",
        explanationID: "Untuk array 2D, np.dot() melakukan perkalian matriks. Untuk array 1D, ini menghitung inner product (skalar).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np013",
        questionEN: "What is the difference between A * B and A @ B for 2D arrays?",
        questionID: "Apa perbedaan antara A * B dan A @ B untuk array 2D?",
        options: [
            QuestionOption(id: "a", textEN: "* is matrix multiplication, @ is element-wise", textID: "* adalah perkalian matriks, @ adalah element-wise"),
            QuestionOption(id: "b", textEN: "* is element-wise multiplication, @ is matrix multiplication", textID: "* adalah perkalian element-wise, @ adalah perkalian matriks"),
            QuestionOption(id: "c", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "d", textEN: "@ is only for 1D arrays", textID: "@ hanya untuk array 1D")
        ],
        correctOptionId: "b",
        explanationEN: "* performs element-wise (Hadamard) multiplication. @ (Python 3.5+) and np.matmul() perform matrix multiplication.",
        explanationID: "* melakukan perkalian element-wise (Hadamard). @ (Python 3.5+) dan np.matmul() melakukan perkalian matriks.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np014",
        questionEN: "What does np.sum(arr, axis=0) do for a 2D array?",
        questionID: "Apa yang dilakukan np.sum(arr, axis=0) untuk array 2D?",
        options: [
            QuestionOption(id: "a", textEN: "Sum all elements", textID: "Jumlahkan semua elemen"),
            QuestionOption(id: "b", textEN: "Sum along rows (result: column sums)", textID: "Jumlahkan sepanjang baris (hasil: jumlah kolom)"),
            QuestionOption(id: "c", textEN: "Sum along columns (result: row sums)", textID: "Jumlahkan sepanjang kolom (hasil: jumlah baris)"),
            QuestionOption(id: "d", textEN: "Return the first element", textID: "Kembalikan elemen pertama")
        ],
        correctOptionId: "b",
        explanationEN: "axis=0 means sum along the first axis (rows), collapsing rows into a single row. The result is the sum of each column.",
        explanationID: "axis=0 berarti jumlahkan sepanjang axis pertama (baris), menciutkan baris menjadi satu baris. Hasilnya adalah jumlah setiap kolom.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np015",
        questionEN: "What is broadcasting in NumPy?",
        questionID: "Apa itu broadcasting di NumPy?",
        options: [
            QuestionOption(id: "a", textEN: "Sending arrays to multiple processes", textID: "Mengirim array ke beberapa proses"),
            QuestionOption(id: "b", textEN: "Automatic expansion of arrays to compatible shapes for operations", textID: "Ekspansi otomatis array ke shape yang kompatibel untuk operasi"),
            QuestionOption(id: "c", textEN: "Converting arrays to different data types", textID: "Mengonversi array ke tipe data berbeda"),
            QuestionOption(id: "d", textEN: "Printing arrays to console", textID: "Mencetak array ke konsol")
        ],
        correctOptionId: "b",
        explanationEN: "Broadcasting allows NumPy to perform operations on arrays of different shapes by virtually expanding smaller arrays to match larger ones without copying data.",
        explanationID: "Broadcasting memungkinkan NumPy melakukan operasi pada array dengan shape berbeda dengan memperluas array lebih kecil secara virtual untuk mencocokkan yang lebih besar tanpa menyalin data.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np016",
        questionEN: "What is the result of np.array([[1, 2], [3, 4]]) + np.array([10, 20])?",
        questionID: "Apa hasil dari np.array([[1, 2], [3, 4]]) + np.array([10, 20])?",
        options: [
            QuestionOption(id: "a", textEN: "[[11, 22], [13, 24]]", textID: "[[11, 22], [13, 24]]"),
            QuestionOption(id: "b", textEN: "[[11, 12], [23, 24]]", textID: "[[11, 12], [23, 24]]"),
            QuestionOption(id: "c", textEN: "Error: incompatible shapes", textID: "Error: shape tidak kompatibel"),
            QuestionOption(id: "d", textEN: "[[11, 22], [33, 44]]", textID: "[[11, 22], [33, 44]]")
        ],
        correctOptionId: "a",
        explanationEN: "Broadcasting: [10, 20] is broadcast across each row. Row 1: [1+10, 2+20]=[11, 22]. Row 2: [3+10, 4+20]=[13, 24].",
        explanationID: "Broadcasting: [10, 20] di-broadcast ke setiap baris. Baris 1: [1+10, 2+20]=[11, 22]. Baris 2: [3+10, 4+20]=[13, 24].",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np017",
        questionEN: "What does np.mean(arr) compute?",
        questionID: "Apa yang dihitung np.mean(arr)?",
        options: [
            QuestionOption(id: "a", textEN: "Median of all elements", textID: "Median dari semua elemen"),
            QuestionOption(id: "b", textEN: "Mode of all elements", textID: "Modus dari semua elemen"),
            QuestionOption(id: "c", textEN: "Arithmetic mean of all elements", textID: "Rata-rata aritmatika dari semua elemen"),
            QuestionOption(id: "d", textEN: "Geometric mean of all elements", textID: "Rata-rata geometrik dari semua elemen")
        ],
        correctOptionId: "c",
        explanationEN: "np.mean() computes the arithmetic mean (average) by summing all elements and dividing by the count.",
        explanationID: "np.mean() menghitung rata-rata aritmatika dengan menjumlahkan semua elemen dan membagi dengan jumlahnya.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np018",
        questionEN: "What does np.argmax(arr) return?",
        questionID: "Apa yang dikembalikan np.argmax(arr)?",
        options: [
            QuestionOption(id: "a", textEN: "The maximum value in the array", textID: "Nilai maksimum dalam array"),
            QuestionOption(id: "b", textEN: "The index of the maximum value", textID: "Indeks dari nilai maksimum"),
            QuestionOption(id: "c", textEN: "All indices where the max value occurs", textID: "Semua indeks di mana nilai maks terjadi"),
            QuestionOption(id: "d", textEN: "The count of maximum values", textID: "Jumlah nilai maksimum")
        ],
        correctOptionId: "b",
        explanationEN: "np.argmax() returns the index of the first occurrence of the maximum value in the flattened array.",
        explanationID: "np.argmax() mengembalikan indeks dari kemunculan pertama nilai maksimum dalam array yang di-flatten.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np019",
        questionEN: "What is the purpose of np.transpose(arr) or arr.T?",
        questionID: "Apa tujuan np.transpose(arr) atau arr.T?",
        options: [
            QuestionOption(id: "a", textEN: "Reverse the array elements", textID: "Membalik elemen array"),
            QuestionOption(id: "b", textEN: "Swap rows and columns", textID: "Menukar baris dan kolom"),
            QuestionOption(id: "c", textEN: "Sort the array", textID: "Mengurutkan array"),
            QuestionOption(id: "d", textEN: "Flatten the array", textID: "Meratakan array")
        ],
        correctOptionId: "b",
        explanationEN: "Transpose swaps rows and columns. For a matrix of shape (m, n), the transpose has shape (n, m). Element at [i, j] moves to [j, i].",
        explanationID: "Transpose menukar baris dan kolom. Untuk matriks dengan shape (m, n), transpose memiliki shape (n, m). Elemen di [i, j] pindah ke [j, i].",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np020",
        questionEN: "What does np.concatenate([arr1, arr2], axis=0) do?",
        questionID: "Apa yang dilakukan np.concatenate([arr1, arr2], axis=0)?",
        options: [
            QuestionOption(id: "a", textEN: "Stack arrays horizontally (side by side)", textID: "Menumpuk array secara horizontal (berdampingan)"),
            QuestionOption(id: "b", textEN: "Stack arrays vertically (on top of each other)", textID: "Menumpuk array secara vertikal (di atas satu sama lain)"),
            QuestionOption(id: "c", textEN: "Merge arrays element-wise", textID: "Menggabungkan array element-wise"),
            QuestionOption(id: "d", textEN: "Create a 3D array", textID: "Membuat array 3D")
        ],
        correctOptionId: "b",
        explanationEN: "axis=0 concatenates along the first axis (rows), stacking arrays vertically. axis=1 would stack horizontally.",
        explanationID: "axis=0 menggabungkan sepanjang axis pertama (baris), menumpuk array secara vertikal. axis=1 akan menumpuk secara horizontal.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 3: NumPy Advanced (10 questions)
    Question(
        id: "np021",
        questionEN: "What does np.where(arr > 5) return?",
        questionID: "Apa yang dikembalikan np.where(arr > 5)?",
        options: [
            QuestionOption(id: "a", textEN: "Elements greater than 5", textID: "Elemen yang lebih besar dari 5"),
            QuestionOption(id: "b", textEN: "Indices where elements are greater than 5", textID: "Indeks di mana elemen lebih besar dari 5"),
            QuestionOption(id: "c", textEN: "Count of elements greater than 5", textID: "Jumlah elemen yang lebih besar dari 5"),
            QuestionOption(id: "d", textEN: "Boolean mask", textID: "Boolean mask")
        ],
        correctOptionId: "b",
        explanationEN: "np.where(condition) returns a tuple of arrays containing the indices where the condition is True.",
        explanationID: "np.where(condition) mengembalikan tuple dari array yang berisi indeks di mana kondisi True.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np022",
        questionEN: "What is boolean indexing in NumPy?",
        questionID: "Apa itu boolean indexing di NumPy?",
        options: [
            QuestionOption(id: "a", textEN: "Indexing with True/False strings", textID: "Indexing dengan string True/False"),
            QuestionOption(id: "b", textEN: "Using a boolean array to select elements", textID: "Menggunakan array boolean untuk memilih elemen"),
            QuestionOption(id: "c", textEN: "Converting array to boolean type", textID: "Mengonversi array ke tipe boolean"),
            QuestionOption(id: "d", textEN: "Checking if array exists", textID: "Memeriksa apakah array ada")
        ],
        correctOptionId: "b",
        explanationEN: "Boolean indexing uses a boolean array of the same shape to select elements where True. Example: arr[arr > 0] selects positive elements.",
        explanationID: "Boolean indexing menggunakan array boolean dengan shape sama untuk memilih elemen di mana True. Contoh: arr[arr > 0] memilih elemen positif.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np023",
        questionEN: "What is the result of arr[arr > 3] where arr = np.array([1, 2, 3, 4, 5])?",
        questionID: "Apa hasil dari arr[arr > 3] di mana arr = np.array([1, 2, 3, 4, 5])?",
        options: [
            QuestionOption(id: "a", textEN: "[True, True]", textID: "[True, True]"),
            QuestionOption(id: "b", textEN: "[4, 5]", textID: "[4, 5]"),
            QuestionOption(id: "c", textEN: "[3, 4, 5]", textID: "[3, 4, 5]"),
            QuestionOption(id: "d", textEN: "[False, False, False, True, True]", textID: "[False, False, False, True, True]")
        ],
        correctOptionId: "b",
        explanationEN: "arr > 3 creates a boolean mask [False, False, False, True, True]. Using this to index arr returns only the True elements: [4, 5].",
        explanationID: "arr > 3 membuat boolean mask [False, False, False, True, True]. Menggunakan ini untuk indexing arr mengembalikan hanya elemen True: [4, 5].",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np024",
        questionEN: "What does np.random.seed(42) do?",
        questionID: "Apa yang dilakukan np.random.seed(42)?",
        options: [
            QuestionOption(id: "a", textEN: "Generates 42 random numbers", textID: "Menghasilkan 42 angka acak"),
            QuestionOption(id: "b", textEN: "Sets the random number generator to a fixed state for reproducibility", textID: "Mengatur generator angka acak ke state tetap untuk reprodusibilitas"),
            QuestionOption(id: "c", textEN: "Limits random numbers to range 0-42", textID: "Membatasi angka acak ke rentang 0-42"),
            QuestionOption(id: "d", textEN: "Creates 42 random seeds", textID: "Membuat 42 seed acak")
        ],
        correctOptionId: "b",
        explanationEN: "Setting a seed ensures the random number generator produces the same sequence of numbers each time, making experiments reproducible.",
        explanationID: "Mengatur seed memastikan generator angka acak menghasilkan urutan angka yang sama setiap kali, membuat eksperimen dapat direproduksi.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np025",
        questionEN: "What does np.random.randn(3, 3) generate?",
        questionID: "Apa yang dihasilkan np.random.randn(3, 3)?",
        options: [
            QuestionOption(id: "a", textEN: "3x3 matrix with random integers", textID: "Matriks 3x3 dengan integer acak"),
            QuestionOption(id: "b", textEN: "3x3 matrix with random floats from standard normal distribution", textID: "Matriks 3x3 dengan float acak dari distribusi normal standar"),
            QuestionOption(id: "c", textEN: "3x3 matrix with random floats from 0 to 1", textID: "Matriks 3x3 dengan float acak dari 0 ke 1"),
            QuestionOption(id: "d", textEN: "3x3 identity matrix", textID: "Matriks identitas 3x3")
        ],
        correctOptionId: "b",
        explanationEN: "np.random.randn() generates samples from the standard normal distribution (mean=0, std=1). np.random.rand() generates uniform [0,1).",
        explanationID: "np.random.randn() menghasilkan sampel dari distribusi normal standar (mean=0, std=1). np.random.rand() menghasilkan uniform [0,1).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np026",
        questionEN: "What is np.linalg.inv(A) used for?",
        questionID: "Untuk apa np.linalg.inv(A) digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Compute the inverse of matrix A", textID: "Menghitung invers dari matriks A"),
            QuestionOption(id: "b", textEN: "Invert the order of elements in A", textID: "Membalik urutan elemen di A"),
            QuestionOption(id: "c", textEN: "Compute the inverse of each element", textID: "Menghitung invers dari setiap elemen"),
            QuestionOption(id: "d", textEN: "Check if A is invertible", textID: "Memeriksa apakah A invertible")
        ],
        correctOptionId: "a",
        explanationEN: "np.linalg.inv() computes the multiplicative inverse of a square matrix A, such that A @ A⁻¹ = I (identity matrix).",
        explanationID: "np.linalg.inv() menghitung invers perkalian dari matriks persegi A, sehingga A @ A⁻¹ = I (matriks identitas).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np027",
        questionEN: "What does np.linalg.eig(A) return?",
        questionID: "Apa yang dikembalikan np.linalg.eig(A)?",
        options: [
            QuestionOption(id: "a", textEN: "Only eigenvalues", textID: "Hanya eigenvalue"),
            QuestionOption(id: "b", textEN: "Only eigenvectors", textID: "Hanya eigenvector"),
            QuestionOption(id: "c", textEN: "Tuple of (eigenvalues, eigenvectors)", textID: "Tuple dari (eigenvalue, eigenvector)"),
            QuestionOption(id: "d", textEN: "The determinant", textID: "Determinan")
        ],
        correctOptionId: "c",
        explanationEN: "np.linalg.eig() returns a tuple: (eigenvalues as 1D array, eigenvectors as columns of a 2D array).",
        explanationID: "np.linalg.eig() mengembalikan tuple: (eigenvalue sebagai array 1D, eigenvector sebagai kolom dari array 2D).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np028",
        questionEN: "What does np.flatten() do to a multi-dimensional array?",
        questionID: "Apa yang dilakukan np.flatten() pada array multi-dimensi?",
        options: [
            QuestionOption(id: "a", textEN: "Removes all zero elements", textID: "Menghapus semua elemen nol"),
            QuestionOption(id: "b", textEN: "Converts to 1D array", textID: "Mengonversi ke array 1D"),
            QuestionOption(id: "c", textEN: "Reduces dimensions by 1", textID: "Mengurangi dimensi sebanyak 1"),
            QuestionOption(id: "d", textEN: "Sorts the array", textID: "Mengurutkan array")
        ],
        correctOptionId: "b",
        explanationEN: "flatten() returns a copy of the array collapsed into one dimension. ravel() does the same but returns a view when possible.",
        explanationID: "flatten() mengembalikan copy dari array yang diciutkan menjadi satu dimensi. ravel() melakukan hal sama tapi mengembalikan view jika memungkinkan.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np029",
        questionEN: "What is the difference between np.vstack() and np.hstack()?",
        questionID: "Apa perbedaan antara np.vstack() dan np.hstack()?",
        options: [
            QuestionOption(id: "a", textEN: "vstack stacks vertically, hstack stacks horizontally", textID: "vstack menumpuk vertikal, hstack menumpuk horizontal"),
            QuestionOption(id: "b", textEN: "vstack stacks horizontally, hstack stacks vertically", textID: "vstack menumpuk horizontal, hstack menumpuk vertikal"),
            QuestionOption(id: "c", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "d", textEN: "vstack is for vectors, hstack is for matrices", textID: "vstack untuk vektor, hstack untuk matriks")
        ],
        correctOptionId: "a",
        explanationEN: "vstack (vertical stack) stacks arrays on top of each other (axis=0). hstack (horizontal stack) stacks arrays side by side (axis=1).",
        explanationID: "vstack (vertical stack) menumpuk array di atas satu sama lain (axis=0). hstack (horizontal stack) menumpuk array berdampingan (axis=1).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np030",
        questionEN: "What does np.clip(arr, 0, 1) do?",
        questionID: "Apa yang dilakukan np.clip(arr, 0, 1)?",
        options: [
            QuestionOption(id: "a", textEN: "Selects elements between 0 and 1", textID: "Memilih elemen antara 0 dan 1"),
            QuestionOption(id: "b", textEN: "Limits values to range [0, 1], capping values outside", textID: "Membatasi nilai ke rentang [0, 1], memotong nilai di luar"),
            QuestionOption(id: "c", textEN: "Removes values outside [0, 1]", textID: "Menghapus nilai di luar [0, 1]"),
            QuestionOption(id: "d", textEN: "Normalizes array to [0, 1]", textID: "Menormalisasi array ke [0, 1]")
        ],
        correctOptionId: "b",
        explanationEN: "np.clip() limits values to the given range. Values below 0 become 0, values above 1 become 1. Values within range are unchanged.",
        explanationID: "np.clip() membatasi nilai ke rentang yang diberikan. Nilai di bawah 0 menjadi 0, nilai di atas 1 menjadi 1. Nilai dalam rentang tidak berubah.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 4: NumPy for ML (10 questions)
    Question(
        id: "np031",
        questionEN: "How do you normalize an array to have values between 0 and 1?",
        questionID: "Bagaimana cara normalisasi array agar nilainya antara 0 dan 1?",
        options: [
            QuestionOption(id: "a", textEN: "(arr - arr.min()) / (arr.max() - arr.min())", textID: "(arr - arr.min()) / (arr.max() - arr.min())"),
            QuestionOption(id: "b", textEN: "arr / arr.max()", textID: "arr / arr.max()"),
            QuestionOption(id: "c", textEN: "arr / arr.sum()", textID: "arr / arr.sum()"),
            QuestionOption(id: "d", textEN: "np.normalize(arr)", textID: "np.normalize(arr)")
        ],
        correctOptionId: "a",
        explanationEN: "Min-max normalization: (x - min) / (max - min) scales values to [0, 1]. This is commonly used in ML for feature scaling.",
        explanationID: "Normalisasi min-max: (x - min) / (max - min) menskala nilai ke [0, 1]. Ini umum digunakan di ML untuk feature scaling.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np032",
        questionEN: "How do you standardize an array (z-score normalization)?",
        questionID: "Bagaimana cara standardisasi array (normalisasi z-score)?",
        options: [
            QuestionOption(id: "a", textEN: "(arr - arr.min()) / arr.max()", textID: "(arr - arr.min()) / arr.max()"),
            QuestionOption(id: "b", textEN: "(arr - arr.mean()) / arr.std()", textID: "(arr - arr.mean()) / arr.std()"),
            QuestionOption(id: "c", textEN: "arr / arr.mean()", textID: "arr / arr.mean()"),
            QuestionOption(id: "d", textEN: "np.standardize(arr)", textID: "np.standardize(arr)")
        ],
        correctOptionId: "b",
        explanationEN: "Z-score standardization: (x - mean) / std. This transforms data to have mean=0 and std=1, commonly used in ML.",
        explanationID: "Standardisasi Z-score: (x - mean) / std. Ini mentransformasi data agar memiliki mean=0 dan std=1, umum digunakan di ML.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np033",
        questionEN: "What is np.exp(arr) commonly used for in ML?",
        questionID: "Untuk apa np.exp(arr) umum digunakan di ML?",
        options: [
            QuestionOption(id: "a", textEN: "Computing exponential moving average", textID: "Menghitung exponential moving average"),
            QuestionOption(id: "b", textEN: "Computing softmax, sigmoid, and other activation functions", textID: "Menghitung softmax, sigmoid, dan fungsi aktivasi lainnya"),
            QuestionOption(id: "c", textEN: "Increasing array size exponentially", textID: "Meningkatkan ukuran array secara eksponensial"),
            QuestionOption(id: "d", textEN: "Computing expected value", textID: "Menghitung expected value")
        ],
        correctOptionId: "b",
        explanationEN: "np.exp() computes e^x element-wise, used in softmax (exp(x)/sum(exp(x))), sigmoid (1/(1+exp(-x))), and many probability calculations.",
        explanationID: "np.exp() menghitung e^x element-wise, digunakan di softmax (exp(x)/sum(exp(x))), sigmoid (1/(1+exp(-x))), dan banyak perhitungan probabilitas.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np034",
        questionEN: "How do you compute softmax for an array in NumPy?",
        questionID: "Bagaimana cara menghitung softmax untuk array di NumPy?",
        options: [
            QuestionOption(id: "a", textEN: "np.softmax(arr)", textID: "np.softmax(arr)"),
            QuestionOption(id: "b", textEN: "np.exp(arr) / np.sum(np.exp(arr))", textID: "np.exp(arr) / np.sum(np.exp(arr))"),
            QuestionOption(id: "c", textEN: "arr / np.sum(arr)", textID: "arr / np.sum(arr)"),
            QuestionOption(id: "d", textEN: "np.max(arr) / arr", textID: "np.max(arr) / arr")
        ],
        correctOptionId: "b",
        explanationEN: "Softmax: exp(x_i) / sum(exp(x_j)). This converts logits to probabilities that sum to 1. For numerical stability, subtract max(arr) first.",
        explanationID: "Softmax: exp(x_i) / sum(exp(x_j)). Ini mengonversi logit ke probabilitas yang berjumlah 1. Untuk stabilitas numerik, kurangi max(arr) terlebih dahulu.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np035",
        questionEN: "What does np.einsum('ij,jk->ik', A, B) compute?",
        questionID: "Apa yang dihitung np.einsum('ij,jk->ik', A, B)?",
        options: [
            QuestionOption(id: "a", textEN: "Element-wise multiplication", textID: "Perkalian element-wise"),
            QuestionOption(id: "b", textEN: "Matrix multiplication (same as A @ B)", textID: "Perkalian matriks (sama dengan A @ B)"),
            QuestionOption(id: "c", textEN: "Outer product", textID: "Outer product"),
            QuestionOption(id: "d", textEN: "Trace of the matrix", textID: "Trace dari matriks")
        ],
        correctOptionId: "b",
        explanationEN: "einsum with 'ij,jk->ik' performs matrix multiplication: sum over j (the shared index), resulting in output with indices i,k.",
        explanationID: "einsum dengan 'ij,jk->ik' melakukan perkalian matriks: jumlahkan atas j (indeks bersama), menghasilkan output dengan indeks i,k.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "np036",
        questionEN: "What is the purpose of np.newaxis?",
        questionID: "Apa tujuan np.newaxis?",
        options: [
            QuestionOption(id: "a", textEN: "Create a new array", textID: "Membuat array baru"),
            QuestionOption(id: "b", textEN: "Add a new dimension to an array", textID: "Menambah dimensi baru ke array"),
            QuestionOption(id: "c", textEN: "Remove a dimension from an array", textID: "Menghapus dimensi dari array"),
            QuestionOption(id: "d", textEN: "Change the axis direction", textID: "Mengubah arah axis")
        ],
        correctOptionId: "b",
        explanationEN: "np.newaxis (or None) adds a new axis when indexing. arr[:, np.newaxis] converts (n,) to (n, 1). Useful for broadcasting.",
        explanationID: "np.newaxis (atau None) menambah axis baru saat indexing. arr[:, np.newaxis] mengonversi (n,) ke (n, 1). Berguna untuk broadcasting.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np037",
        questionEN: "What does np.allclose(a, b) check?",
        questionID: "Apa yang diperiksa np.allclose(a, b)?",
        options: [
            QuestionOption(id: "a", textEN: "If arrays have the same shape", textID: "Apakah array memiliki shape yang sama"),
            QuestionOption(id: "b", textEN: "If all elements are approximately equal within tolerance", textID: "Apakah semua elemen kira-kira sama dalam toleransi"),
            QuestionOption(id: "c", textEN: "If arrays are sorted in the same order", textID: "Apakah array diurutkan dalam urutan yang sama"),
            QuestionOption(id: "d", textEN: "If arrays have the same data type", textID: "Apakah array memiliki tipe data yang sama")
        ],
        correctOptionId: "b",
        explanationEN: "np.allclose() returns True if two arrays are element-wise equal within a tolerance (default rtol=1e-5, atol=1e-8). Useful for comparing floating-point results.",
        explanationID: "np.allclose() mengembalikan True jika dua array sama element-wise dalam toleransi (default rtol=1e-5, atol=1e-8). Berguna untuk membandingkan hasil floating-point.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np038",
        questionEN: "How do you compute the L2 norm of a vector using NumPy?",
        questionID: "Bagaimana cara menghitung norm L2 dari vektor menggunakan NumPy?",
        options: [
            QuestionOption(id: "a", textEN: "np.linalg.norm(v)", textID: "np.linalg.norm(v)"),
            QuestionOption(id: "b", textEN: "np.sum(v)", textID: "np.sum(v)"),
            QuestionOption(id: "c", textEN: "np.abs(v).sum()", textID: "np.abs(v).sum()"),
            QuestionOption(id: "d", textEN: "np.max(np.abs(v))", textID: "np.max(np.abs(v))")
        ],
        correctOptionId: "a",
        explanationEN: "np.linalg.norm(v) computes the L2 (Euclidean) norm by default: sqrt(sum(v_i^2)). You can specify ord=1 for L1 norm, ord=np.inf for max norm.",
        explanationID: "np.linalg.norm(v) menghitung norm L2 (Euclidean) secara default: sqrt(sum(v_i^2)). Anda bisa menentukan ord=1 untuk norm L1, ord=np.inf untuk norm max.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np039",
        questionEN: "What does np.outer(a, b) compute?",
        questionID: "Apa yang dihitung np.outer(a, b)?",
        options: [
            QuestionOption(id: "a", textEN: "Inner product (dot product)", textID: "Inner product (dot product)"),
            QuestionOption(id: "b", textEN: "Outer product: matrix where element [i,j] = a[i] * b[j]", textID: "Outer product: matriks di mana elemen [i,j] = a[i] * b[j]"),
            QuestionOption(id: "c", textEN: "Cross product", textID: "Cross product"),
            QuestionOption(id: "d", textEN: "Concatenation of a and b", textID: "Penggabungan a dan b")
        ],
        correctOptionId: "b",
        explanationEN: "np.outer(a, b) computes the outer product of two vectors, resulting in a matrix where the element at position [i, j] is a[i] * b[j].",
        explanationID: "np.outer(a, b) menghitung outer product dari dua vektor, menghasilkan matriks di mana elemen pada posisi [i, j] adalah a[i] * b[j].",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np040",
        questionEN: "What is vectorization in NumPy?",
        questionID: "Apa itu vectorization di NumPy?",
        options: [
            QuestionOption(id: "a", textEN: "Converting images to vectors", textID: "Mengonversi gambar ke vektor"),
            QuestionOption(id: "b", textEN: "Using array operations instead of loops for better performance", textID: "Menggunakan operasi array daripada loop untuk performa lebih baik"),
            QuestionOption(id: "c", textEN: "Creating vector graphics", textID: "Membuat grafik vektor"),
            QuestionOption(id: "d", textEN: "Parallel processing across CPUs", textID: "Pemrosesan paralel di seluruh CPU")
        ],
        correctOptionId: "b",
        explanationEN: "Vectorization means using NumPy's array operations instead of Python loops. It's faster because operations are implemented in optimized C code.",
        explanationID: "Vectorization berarti menggunakan operasi array NumPy daripada loop Python. Ini lebih cepat karena operasi diimplementasikan dalam kode C yang dioptimasi.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 5: More NumPy (10 questions)
    Question(
        id: "np041",
        questionEN: "What does np.unique(arr) return?",
        questionID: "Apa yang dikembalikan np.unique(arr)?",
        options: [
            QuestionOption(id: "a", textEN: "Removes duplicate elements and returns sorted unique values", textID: "Menghapus elemen duplikat dan mengembalikan nilai unik terurut"),
            QuestionOption(id: "b", textEN: "Returns True if all elements are unique", textID: "Mengembalikan True jika semua elemen unik"),
            QuestionOption(id: "c", textEN: "Returns indices of unique elements only", textID: "Mengembalikan indeks elemen unik saja"),
            QuestionOption(id: "d", textEN: "Creates a set from the array", textID: "Membuat set dari array")
        ],
        correctOptionId: "a",
        explanationEN: "np.unique() returns sorted unique elements. With return_counts=True, it also returns how many times each value appears.",
        explanationID: "np.unique() mengembalikan elemen unik terurut. Dengan return_counts=True, juga mengembalikan berapa kali setiap nilai muncul.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np042",
        questionEN: "What does np.argsort(arr) return?",
        questionID: "Apa yang dikembalikan np.argsort(arr)?",
        options: [
            QuestionOption(id: "a", textEN: "Sorted array", textID: "Array terurut"),
            QuestionOption(id: "b", textEN: "Indices that would sort the array", textID: "Indeks yang akan mengurutkan array"),
            QuestionOption(id: "c", textEN: "Arguments passed to the sort function", textID: "Argumen yang diteruskan ke fungsi sort"),
            QuestionOption(id: "d", textEN: "Number of swaps needed to sort", textID: "Jumlah pertukaran yang diperlukan untuk mengurutkan")
        ],
        correctOptionId: "b",
        explanationEN: "np.argsort() returns the indices that would sort the array. arr[np.argsort(arr)] gives the sorted array.",
        explanationID: "np.argsort() mengembalikan indeks yang akan mengurutkan array. arr[np.argsort(arr)] memberikan array terurut.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np043",
        questionEN: "What is the result of np.eye(3)?",
        questionID: "Apa hasil dari np.eye(3)?",
        options: [
            QuestionOption(id: "a", textEN: "3x3 matrix of ones", textID: "Matriks 3x3 berisi satu"),
            QuestionOption(id: "b", textEN: "3x3 identity matrix", textID: "Matriks identitas 3x3"),
            QuestionOption(id: "c", textEN: "1D array [1, 1, 1]", textID: "Array 1D [1, 1, 1]"),
            QuestionOption(id: "d", textEN: "3x3 matrix of zeros", textID: "Matriks 3x3 berisi nol")
        ],
        correctOptionId: "b",
        explanationEN: "np.eye(n) creates an n×n identity matrix with 1s on the diagonal and 0s elsewhere. Essential for linear algebra operations.",
        explanationID: "np.eye(n) membuat matriks identitas n×n dengan 1 pada diagonal dan 0 di tempat lain. Penting untuk operasi aljabar linear.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np044",
        questionEN: "What does np.diag(arr) do when arr is a 1D array?",
        questionID: "Apa yang dilakukan np.diag(arr) ketika arr adalah array 1D?",
        options: [
            QuestionOption(id: "a", textEN: "Extracts diagonal elements", textID: "Mengekstrak elemen diagonal"),
            QuestionOption(id: "b", textEN: "Creates a diagonal matrix with arr as the diagonal", textID: "Membuat matriks diagonal dengan arr sebagai diagonal"),
            QuestionOption(id: "c", textEN: "Returns the trace", textID: "Mengembalikan trace"),
            QuestionOption(id: "d", textEN: "Raises an error", textID: "Menghasilkan error")
        ],
        correctOptionId: "b",
        explanationEN: "For 1D input, np.diag() creates a 2D diagonal matrix. For 2D input, it extracts the diagonal elements as a 1D array.",
        explanationID: "Untuk input 1D, np.diag() membuat matriks diagonal 2D. Untuk input 2D, ini mengekstrak elemen diagonal sebagai array 1D.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np045",
        questionEN: "What is np.nan used for?",
        questionID: "Untuk apa np.nan digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Representing negative numbers", textID: "Merepresentasikan bilangan negatif"),
            QuestionOption(id: "b", textEN: "Representing 'Not a Number' for missing or undefined values", textID: "Merepresentasikan 'Not a Number' untuk nilai yang hilang atau tidak terdefinisi"),
            QuestionOption(id: "c", textEN: "Representing infinity", textID: "Merepresentasikan infinity"),
            QuestionOption(id: "d", textEN: "Representing zero", textID: "Merepresentasikan nol")
        ],
        correctOptionId: "b",
        explanationEN: "np.nan (Not a Number) represents missing or undefined floating-point values. Use np.isnan() to check for NaN values.",
        explanationID: "np.nan (Not a Number) merepresentasikan nilai floating-point yang hilang atau tidak terdefinisi. Gunakan np.isnan() untuk memeriksa nilai NaN.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np046",
        questionEN: "How do you handle NaN values when computing mean?",
        questionID: "Bagaimana cara menangani nilai NaN saat menghitung mean?",
        options: [
            QuestionOption(id: "a", textEN: "np.mean() automatically ignores NaN", textID: "np.mean() otomatis mengabaikan NaN"),
            QuestionOption(id: "b", textEN: "Use np.nanmean() to ignore NaN values", textID: "Gunakan np.nanmean() untuk mengabaikan nilai NaN"),
            QuestionOption(id: "c", textEN: "NaN values are treated as zero", textID: "Nilai NaN diperlakukan sebagai nol"),
            QuestionOption(id: "d", textEN: "Must remove NaN manually first", textID: "Harus menghapus NaN secara manual terlebih dahulu")
        ],
        correctOptionId: "b",
        explanationEN: "np.nanmean(), np.nansum(), np.nanstd(), etc. ignore NaN values in calculations. Regular np.mean() returns NaN if any value is NaN.",
        explanationID: "np.nanmean(), np.nansum(), np.nanstd(), dll. mengabaikan nilai NaN dalam perhitungan. np.mean() biasa mengembalikan NaN jika ada nilai NaN.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np047",
        questionEN: "What does np.meshgrid(x, y) create?",
        questionID: "Apa yang dibuat np.meshgrid(x, y)?",
        options: [
            QuestionOption(id: "a", textEN: "A single 2D array combining x and y", textID: "Satu array 2D menggabungkan x dan y"),
            QuestionOption(id: "b", textEN: "Two 2D arrays representing coordinate matrices", textID: "Dua array 2D merepresentasikan matriks koordinat"),
            QuestionOption(id: "c", textEN: "A mesh network object", textID: "Objek mesh network"),
            QuestionOption(id: "d", textEN: "The Cartesian product as a 1D array", textID: "Produk Cartesian sebagai array 1D")
        ],
        correctOptionId: "b",
        explanationEN: "np.meshgrid() creates coordinate matrices from coordinate vectors, useful for evaluating functions over a grid of points.",
        explanationID: "np.meshgrid() membuat matriks koordinat dari vektor koordinat, berguna untuk mengevaluasi fungsi pada grid titik.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np048",
        questionEN: "What is the purpose of np.save() and np.load()?",
        questionID: "Apa tujuan np.save() dan np.load()?",
        options: [
            QuestionOption(id: "a", textEN: "Save and load arrays to/from text files", textID: "Menyimpan dan memuat array ke/dari file teks"),
            QuestionOption(id: "b", textEN: "Save and load arrays to/from binary .npy files", textID: "Menyimpan dan memuat array ke/dari file biner .npy"),
            QuestionOption(id: "c", textEN: "Save and load arrays to/from CSV files", textID: "Menyimpan dan memuat array ke/dari file CSV"),
            QuestionOption(id: "d", textEN: "Save and load arrays to database", textID: "Menyimpan dan memuat array ke database")
        ],
        correctOptionId: "b",
        explanationEN: "np.save() saves arrays in binary .npy format (fast, preserves dtype). np.savez() saves multiple arrays. np.savetxt() is for text files.",
        explanationID: "np.save() menyimpan array dalam format biner .npy (cepat, mempertahankan dtype). np.savez() menyimpan beberapa array. np.savetxt() untuk file teks.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "np049",
        questionEN: "What does np.squeeze(arr) do?",
        questionID: "Apa yang dilakukan np.squeeze(arr)?",
        options: [
            QuestionOption(id: "a", textEN: "Compresses array data", textID: "Mengompresi data array"),
            QuestionOption(id: "b", textEN: "Removes axes of length 1", textID: "Menghapus axis dengan panjang 1"),
            QuestionOption(id: "c", textEN: "Reduces array to 1D", textID: "Mengurangi array menjadi 1D"),
            QuestionOption(id: "d", textEN: "Removes NaN values", textID: "Menghapus nilai NaN")
        ],
        correctOptionId: "b",
        explanationEN: "np.squeeze() removes single-dimensional entries from array shape. Shape (1, 3, 1) becomes (3,). Useful after operations that add unnecessary dimensions.",
        explanationID: "np.squeeze() menghapus entri berdimensi tunggal dari shape array. Shape (1, 3, 1) menjadi (3,). Berguna setelah operasi yang menambah dimensi tidak perlu.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "np050",
        questionEN: "What does np.tile(arr, (2, 3)) do?",
        questionID: "Apa yang dilakukan np.tile(arr, (2, 3))?",
        options: [
            QuestionOption(id: "a", textEN: "Reshapes array to 2x3", textID: "Mengubah bentuk array menjadi 2x3"),
            QuestionOption(id: "b", textEN: "Repeats arr in a 2x3 tile pattern", textID: "Mengulangi arr dalam pola tile 2x3"),
            QuestionOption(id: "c", textEN: "Selects 2x3 subset from arr", textID: "Memilih subset 2x3 dari arr"),
            QuestionOption(id: "d", textEN: "Creates 6 copies of arr", textID: "Membuat 6 copy dari arr")
        ],
        correctOptionId: "b",
        explanationEN: "np.tile() constructs an array by repeating the input. (2, 3) means 2 repetitions vertically and 3 horizontally.",
        explanationID: "np.tile() membuat array dengan mengulangi input. (2, 3) berarti 2 pengulangan vertikal dan 3 horizontal.",
        topic: "computing",
        difficulty: .intermediate
    )
]
