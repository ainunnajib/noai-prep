import Foundation

// MARK: - Computing: Debugging Questions (50 questions)
// Subcategory: Error types, debugging techniques, code analysis

let debuggingQuestions: [Question] = [
    // Batch 1: Python Errors (10 questions)
    Question(
        id: "dbg001",
        questionEN: "What type of error is raised when you try to access an index that doesn't exist in a list?",
        questionID: "Jenis error apa yang muncul saat mencoba mengakses indeks yang tidak ada dalam list?",
        options: [
            QuestionOption(id: "a", textEN: "KeyError", textID: "KeyError"),
            QuestionOption(id: "b", textEN: "IndexError", textID: "IndexError"),
            QuestionOption(id: "c", textEN: "ValueError", textID: "ValueError"),
            QuestionOption(id: "d", textEN: "TypeError", textID: "TypeError")
        ],
        correctOptionId: "b",
        explanationEN: "IndexError is raised when a sequence index is out of range. KeyError is for dictionaries, ValueError for wrong values.",
        explanationID: "IndexError muncul ketika indeks sequence di luar rentang. KeyError untuk dictionary, ValueError untuk nilai yang salah.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg002",
        questionEN: "What causes a TypeError in Python?",
        questionID: "Apa yang menyebabkan TypeError di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Accessing undefined variable", textID: "Mengakses variabel yang tidak didefinisikan"),
            QuestionOption(id: "b", textEN: "Operation on incompatible types (e.g., '1' + 1)", textID: "Operasi pada tipe yang tidak kompatibel (misalnya '1' + 1)"),
            QuestionOption(id: "c", textEN: "Division by zero", textID: "Pembagian dengan nol"),
            QuestionOption(id: "d", textEN: "Syntax error in code", textID: "Kesalahan sintaks dalam kode")
        ],
        correctOptionId: "b",
        explanationEN: "TypeError occurs when an operation is applied to objects of inappropriate types, like adding a string to an integer.",
        explanationID: "TypeError terjadi ketika operasi diterapkan pada objek dengan tipe yang tidak sesuai, seperti menambahkan string ke integer.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg003",
        questionEN: "What error occurs when dividing by zero in Python?",
        questionID: "Error apa yang terjadi saat membagi dengan nol di Python?",
        options: [
            QuestionOption(id: "a", textEN: "ValueError", textID: "ValueError"),
            QuestionOption(id: "b", textEN: "ZeroDivisionError", textID: "ZeroDivisionError"),
            QuestionOption(id: "c", textEN: "ArithmeticError", textID: "ArithmeticError"),
            QuestionOption(id: "d", textEN: "MathError", textID: "MathError")
        ],
        correctOptionId: "b",
        explanationEN: "ZeroDivisionError is raised when the second argument of a division or modulo operation is zero.",
        explanationID: "ZeroDivisionError muncul ketika argumen kedua dari operasi pembagian atau modulo adalah nol.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg004",
        questionEN: "What is a NameError in Python?",
        questionID: "Apa itu NameError di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Using wrong function name format", textID: "Menggunakan format nama fungsi yang salah"),
            QuestionOption(id: "b", textEN: "Referencing a variable that hasn't been defined", textID: "Mereferensikan variabel yang belum didefinisikan"),
            QuestionOption(id: "c", textEN: "Naming a file incorrectly", textID: "Memberi nama file dengan salah"),
            QuestionOption(id: "d", textEN: "Using reserved keywords as names", textID: "Menggunakan kata kunci reserved sebagai nama")
        ],
        correctOptionId: "b",
        explanationEN: "NameError occurs when a name (variable, function, class) is used that doesn't exist in the current scope.",
        explanationID: "NameError terjadi ketika nama (variabel, fungsi, kelas) yang digunakan tidak ada dalam scope saat ini.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg005",
        questionEN: "What is the difference between a SyntaxError and a runtime error?",
        questionID: "Apa perbedaan antara SyntaxError dan runtime error?",
        options: [
            QuestionOption(id: "a", textEN: "SyntaxError occurs before code runs, runtime error during execution", textID: "SyntaxError terjadi sebelum kode berjalan, runtime error saat eksekusi"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "c", textEN: "Runtime error is more severe", textID: "Runtime error lebih parah"),
            QuestionOption(id: "d", textEN: "SyntaxError only occurs in functions", textID: "SyntaxError hanya terjadi dalam fungsi")
        ],
        correctOptionId: "a",
        explanationEN: "SyntaxError is detected during parsing before execution. Runtime errors (TypeError, ValueError, etc.) occur during program execution.",
        explanationID: "SyntaxError terdeteksi selama parsing sebelum eksekusi. Runtime error (TypeError, ValueError, dll.) terjadi selama eksekusi program.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg006",
        questionEN: "What is an AttributeError?",
        questionID: "Apa itu AttributeError?",
        options: [
            QuestionOption(id: "a", textEN: "Missing required function argument", textID: "Argumen fungsi yang diperlukan hilang"),
            QuestionOption(id: "b", textEN: "Accessing an attribute or method that doesn't exist on an object", textID: "Mengakses atribut atau method yang tidak ada pada objek"),
            QuestionOption(id: "c", textEN: "Wrong attribute type", textID: "Tipe atribut yang salah"),
            QuestionOption(id: "d", textEN: "Too many attributes defined", textID: "Terlalu banyak atribut didefinisikan")
        ],
        correctOptionId: "b",
        explanationEN: "AttributeError occurs when trying to access an attribute or method that doesn't exist on an object (e.g., calling .append() on a tuple).",
        explanationID: "AttributeError terjadi saat mencoba mengakses atribut atau method yang tidak ada pada objek (misalnya memanggil .append() pada tuple).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg007",
        questionEN: "What causes an ImportError?",
        questionID: "Apa yang menyebabkan ImportError?",
        options: [
            QuestionOption(id: "a", textEN: "Circular imports only", textID: "Hanya circular imports"),
            QuestionOption(id: "b", textEN: "Module or package not found, or specific name doesn't exist in module", textID: "Modul atau package tidak ditemukan, atau nama spesifik tidak ada dalam modul"),
            QuestionOption(id: "c", textEN: "Import statement is too long", textID: "Pernyataan import terlalu panjang"),
            QuestionOption(id: "d", textEN: "Importing too many modules", textID: "Mengimpor terlalu banyak modul")
        ],
        correctOptionId: "b",
        explanationEN: "ImportError occurs when a module cannot be found. ModuleNotFoundError (subclass) is specifically for missing modules.",
        explanationID: "ImportError terjadi ketika modul tidak dapat ditemukan. ModuleNotFoundError (subclass) khusus untuk modul yang hilang.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg008",
        questionEN: "What is a KeyError in Python?",
        questionID: "Apa itu KeyError di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Using wrong keyboard input", textID: "Menggunakan input keyboard yang salah"),
            QuestionOption(id: "b", textEN: "Accessing a dictionary key that doesn't exist", textID: "Mengakses key dictionary yang tidak ada"),
            QuestionOption(id: "c", textEN: "Encryption key error", textID: "Error kunci enkripsi"),
            QuestionOption(id: "d", textEN: "Primary key violation", textID: "Pelanggaran primary key")
        ],
        correctOptionId: "b",
        explanationEN: "KeyError occurs when accessing a dictionary with a key that doesn't exist. Use .get() method to avoid this.",
        explanationID: "KeyError terjadi saat mengakses dictionary dengan key yang tidak ada. Gunakan method .get() untuk menghindari ini.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg009",
        questionEN: "What is the purpose of try-except blocks?",
        questionID: "Apa tujuan blok try-except?",
        options: [
            QuestionOption(id: "a", textEN: "To try different solutions", textID: "Untuk mencoba solusi berbeda"),
            QuestionOption(id: "b", textEN: "To catch and handle exceptions gracefully", textID: "Untuk menangkap dan menangani exception dengan baik"),
            QuestionOption(id: "c", textEN: "To make code run faster", textID: "Untuk membuat kode berjalan lebih cepat"),
            QuestionOption(id: "d", textEN: "To skip problematic code", textID: "Untuk melewati kode bermasalah")
        ],
        correctOptionId: "b",
        explanationEN: "try-except allows handling exceptions without crashing the program, providing opportunity for error recovery or graceful failure.",
        explanationID: "try-except memungkinkan penanganan exception tanpa membuat program crash, memberikan kesempatan untuk pemulihan error atau kegagalan yang baik.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg010",
        questionEN: "What does the 'finally' clause do in try-except-finally?",
        questionID: "Apa yang dilakukan klausa 'finally' dalam try-except-finally?",
        options: [
            QuestionOption(id: "a", textEN: "Runs only if no exception occurs", textID: "Berjalan hanya jika tidak ada exception"),
            QuestionOption(id: "b", textEN: "Runs always, whether exception occurs or not", textID: "Selalu berjalan, apakah exception terjadi atau tidak"),
            QuestionOption(id: "c", textEN: "Runs only if exception occurs", textID: "Berjalan hanya jika exception terjadi"),
            QuestionOption(id: "d", textEN: "Ends the program", textID: "Mengakhiri program")
        ],
        correctOptionId: "b",
        explanationEN: "The finally clause always executes, regardless of whether an exception occurred. Used for cleanup operations like closing files.",
        explanationID: "Klausa finally selalu dieksekusi, terlepas dari apakah exception terjadi. Digunakan untuk operasi cleanup seperti menutup file.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 2: Code Analysis (10 questions)
    Question(
        id: "dbg011",
        questionEN: "What is wrong with: for i in range(len(list)): list.remove(list[i])?",
        questionID: "Apa yang salah dengan: for i in range(len(list)): list.remove(list[i])?",
        options: [
            QuestionOption(id: "a", textEN: "Nothing, it works correctly", textID: "Tidak ada, bekerja dengan benar"),
            QuestionOption(id: "b", textEN: "Modifying list while iterating causes IndexError", textID: "Memodifikasi list saat iterasi menyebabkan IndexError"),
            QuestionOption(id: "c", textEN: "Should use while loop", textID: "Harus menggunakan while loop"),
            QuestionOption(id: "d", textEN: "range() doesn't work with len()", textID: "range() tidak bekerja dengan len()")
        ],
        correctOptionId: "b",
        explanationEN: "Modifying a list while iterating over it changes its length, causing index to go out of bounds. Use list comprehension or iterate over a copy.",
        explanationID: "Memodifikasi list saat iterasi mengubah panjangnya, menyebabkan indeks keluar dari batas. Gunakan list comprehension atau iterasi atas salinan.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg012",
        questionEN: "What is the bug in: def add(a, b=[]): b.append(a); return b?",
        questionID: "Apa bug dalam: def add(a, b=[]): b.append(a); return b?",
        options: [
            QuestionOption(id: "a", textEN: "Missing return statement", textID: "Tidak ada pernyataan return"),
            QuestionOption(id: "b", textEN: "Mutable default argument persists across calls", textID: "Argumen default mutable bertahan di seluruh panggilan"),
            QuestionOption(id: "c", textEN: "append() doesn't work on lists", textID: "append() tidak bekerja pada list"),
            QuestionOption(id: "d", textEN: "No bug exists", textID: "Tidak ada bug")
        ],
        correctOptionId: "b",
        explanationEN: "Mutable default arguments (like []) are shared across function calls. Each call modifies the same list. Use None instead.",
        explanationID: "Argumen default mutable (seperti []) dibagikan di seluruh panggilan fungsi. Setiap panggilan memodifikasi list yang sama. Gunakan None sebagai gantinya.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg013",
        questionEN: "Why might 0.1 + 0.2 != 0.3 in Python?",
        questionID: "Mengapa 0.1 + 0.2 != 0.3 di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Python bug", textID: "Bug Python"),
            QuestionOption(id: "b", textEN: "Floating-point precision limitations", textID: "Keterbatasan presisi floating-point"),
            QuestionOption(id: "c", textEN: "Wrong operator used", textID: "Operator yang digunakan salah"),
            QuestionOption(id: "d", textEN: "Need to use math.add()", textID: "Perlu menggunakan math.add()")
        ],
        correctOptionId: "b",
        explanationEN: "Floating-point numbers have limited precision in binary representation. 0.1 + 0.2 = 0.30000000000000004. Use math.isclose() for comparison.",
        explanationID: "Angka floating-point memiliki presisi terbatas dalam representasi biner. 0.1 + 0.2 = 0.30000000000000004. Gunakan math.isclose() untuk perbandingan.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg014",
        questionEN: "What is an off-by-one error?",
        questionID: "Apa itu off-by-one error?",
        options: [
            QuestionOption(id: "a", textEN: "Being one line off in the code", textID: "Meleset satu baris dalam kode"),
            QuestionOption(id: "b", textEN: "Loop iterates one too many or one too few times", textID: "Loop beriterasi satu kali terlalu banyak atau terlalu sedikit"),
            QuestionOption(id: "c", textEN: "Using wrong variable", textID: "Menggunakan variabel yang salah"),
            QuestionOption(id: "d", textEN: "Missing one import", textID: "Kehilangan satu import")
        ],
        correctOptionId: "b",
        explanationEN: "Off-by-one errors occur when a loop iterates one time too many or too few, often due to wrong boundary conditions (< vs <=).",
        explanationID: "Off-by-one error terjadi ketika loop beriterasi satu kali terlalu banyak atau terlalu sedikit, sering karena kondisi batas yang salah (< vs <=).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg015",
        questionEN: "What is a stack trace/traceback?",
        questionID: "Apa itu stack trace/traceback?",
        options: [
            QuestionOption(id: "a", textEN: "Memory usage report", textID: "Laporan penggunaan memori"),
            QuestionOption(id: "b", textEN: "Chain of function calls leading to an error", textID: "Rantai panggilan fungsi yang mengarah ke error"),
            QuestionOption(id: "c", textEN: "List of all variables", textID: "Daftar semua variabel"),
            QuestionOption(id: "d", textEN: "Code execution history", textID: "Riwayat eksekusi kode")
        ],
        correctOptionId: "b",
        explanationEN: "A traceback shows the sequence of function calls that led to an error, with line numbers, helping locate where the error originated.",
        explanationID: "Traceback menunjukkan urutan panggilan fungsi yang mengarah ke error, dengan nomor baris, membantu menemukan di mana error berasal.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg016",
        questionEN: "What does 'None' being returned unexpectedly usually indicate?",
        questionID: "Apa yang biasanya ditunjukkan oleh 'None' yang dikembalikan secara tidak terduga?",
        options: [
            QuestionOption(id: "a", textEN: "Memory is full", textID: "Memori penuh"),
            QuestionOption(id: "b", textEN: "Function missing return statement or returns nothing", textID: "Fungsi tidak memiliki pernyataan return atau tidak mengembalikan apa-apa"),
            QuestionOption(id: "c", textEN: "Variable was deleted", textID: "Variabel dihapus"),
            QuestionOption(id: "d", textEN: "Internet connection lost", textID: "Koneksi internet terputus")
        ],
        correctOptionId: "b",
        explanationEN: "Functions without an explicit return statement return None. Check if your function has the correct return path for all cases.",
        explanationID: "Fungsi tanpa pernyataan return eksplisit mengembalikan None. Periksa apakah fungsi Anda memiliki jalur return yang benar untuk semua kasus.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg017",
        questionEN: "What is wrong with: if x = 5: print('five')?",
        questionID: "Apa yang salah dengan: if x = 5: print('five')?",
        options: [
            QuestionOption(id: "a", textEN: "Missing parentheses", textID: "Kurang tanda kurung"),
            QuestionOption(id: "b", textEN: "Using = instead of == for comparison", textID: "Menggunakan = daripada == untuk perbandingan"),
            QuestionOption(id: "c", textEN: "print() is deprecated", textID: "print() sudah usang"),
            QuestionOption(id: "d", textEN: "if statement needs else", textID: "Pernyataan if memerlukan else")
        ],
        correctOptionId: "b",
        explanationEN: "= is assignment, == is comparison. 'if x = 5' is a SyntaxError in Python. Should be 'if x == 5:'.",
        explanationID: "= adalah assignment, == adalah perbandingan. 'if x = 5' adalah SyntaxError di Python. Seharusnya 'if x == 5:'.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg018",
        questionEN: "What causes infinite recursion?",
        questionID: "Apa yang menyebabkan infinite recursion?",
        options: [
            QuestionOption(id: "a", textEN: "Calling a function too fast", textID: "Memanggil fungsi terlalu cepat"),
            QuestionOption(id: "b", textEN: "Recursive function without proper base case", textID: "Fungsi rekursif tanpa base case yang tepat"),
            QuestionOption(id: "c", textEN: "Using too many parameters", textID: "Menggunakan terlalu banyak parameter"),
            QuestionOption(id: "d", textEN: "Memory leak", textID: "Memory leak")
        ],
        correctOptionId: "b",
        explanationEN: "Infinite recursion occurs when a recursive function lacks a proper base case or the recursive calls don't progress toward the base case.",
        explanationID: "Infinite recursion terjadi ketika fungsi rekursif tidak memiliki base case yang tepat atau panggilan rekursif tidak menuju ke base case.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg019",
        questionEN: "What is the issue with: a = [1, 2]; b = a; b.append(3)?",
        questionID: "Apa masalah dengan: a = [1, 2]; b = a; b.append(3)?",
        options: [
            QuestionOption(id: "a", textEN: "append() doesn't work", textID: "append() tidak bekerja"),
            QuestionOption(id: "b", textEN: "Both a and b now contain [1, 2, 3] - they reference the same list", textID: "Baik a maupun b sekarang berisi [1, 2, 3] - keduanya mereferensikan list yang sama"),
            QuestionOption(id: "c", textEN: "b cannot be assigned from a", textID: "b tidak bisa di-assign dari a"),
            QuestionOption(id: "d", textEN: "No issue exists", textID: "Tidak ada masalah")
        ],
        correctOptionId: "b",
        explanationEN: "b = a creates a reference to the same list, not a copy. Changes to b affect a. Use b = a.copy() or b = list(a) for independent copy.",
        explanationID: "b = a membuat referensi ke list yang sama, bukan salinan. Perubahan pada b mempengaruhi a. Gunakan b = a.copy() atau b = list(a) untuk salinan independen.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg020",
        questionEN: "What is a logical error?",
        questionID: "Apa itu logical error?",
        options: [
            QuestionOption(id: "a", textEN: "Error in logic circuits", textID: "Error dalam sirkuit logika"),
            QuestionOption(id: "b", textEN: "Code runs but produces incorrect results due to flawed logic", textID: "Kode berjalan tapi menghasilkan hasil salah karena logika yang salah"),
            QuestionOption(id: "c", textEN: "Using wrong logical operators (and, or)", textID: "Menggunakan operator logika yang salah (and, or)"),
            QuestionOption(id: "d", textEN: "Error in if-else statements", textID: "Error dalam pernyataan if-else")
        ],
        correctOptionId: "b",
        explanationEN: "Logical errors don't cause crashes or exceptions, but the program produces wrong output because the algorithm or logic is flawed.",
        explanationID: "Logical error tidak menyebabkan crash atau exception, tapi program menghasilkan output yang salah karena algoritma atau logikanya cacat.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 3: Debugging Techniques (10 questions)
    Question(
        id: "dbg021",
        questionEN: "What is print debugging?",
        questionID: "Apa itu print debugging?",
        options: [
            QuestionOption(id: "a", textEN: "Printing code to paper", textID: "Mencetak kode ke kertas"),
            QuestionOption(id: "b", textEN: "Adding print statements to track variable values and flow", textID: "Menambahkan pernyataan print untuk melacak nilai variabel dan alur"),
            QuestionOption(id: "c", textEN: "Debugging print function", textID: "Debugging fungsi print"),
            QuestionOption(id: "d", textEN: "Using printer for debugging", textID: "Menggunakan printer untuk debugging")
        ],
        correctOptionId: "b",
        explanationEN: "Print debugging inserts print statements to display variable values and confirm code execution flow. Simple but effective for quick checks.",
        explanationID: "Print debugging menyisipkan pernyataan print untuk menampilkan nilai variabel dan mengkonfirmasi alur eksekusi kode. Sederhana tapi efektif untuk pemeriksaan cepat.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg022",
        questionEN: "What is a breakpoint in debugging?",
        questionID: "Apa itu breakpoint dalam debugging?",
        options: [
            QuestionOption(id: "a", textEN: "A point where code breaks", textID: "Titik di mana kode rusak"),
            QuestionOption(id: "b", textEN: "A marker where execution pauses to inspect state", textID: "Penanda di mana eksekusi berhenti untuk memeriksa state"),
            QuestionOption(id: "c", textEN: "A break statement in loops", textID: "Pernyataan break dalam loop"),
            QuestionOption(id: "d", textEN: "Point where program crashes", textID: "Titik di mana program crash")
        ],
        correctOptionId: "b",
        explanationEN: "Breakpoints pause execution at specific lines, allowing inspection of variables, call stack, and step-through execution in a debugger.",
        explanationID: "Breakpoint menjeda eksekusi pada baris tertentu, memungkinkan inspeksi variabel, call stack, dan eksekusi step-through di debugger.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg023",
        questionEN: "What does 'step over' mean in a debugger?",
        questionID: "Apa arti 'step over' di debugger?",
        options: [
            QuestionOption(id: "a", textEN: "Skip the current line", textID: "Melewati baris saat ini"),
            QuestionOption(id: "b", textEN: "Execute current line and move to next without entering functions", textID: "Eksekusi baris saat ini dan pindah ke berikutnya tanpa masuk ke fungsi"),
            QuestionOption(id: "c", textEN: "Jump over errors", textID: "Melompati error"),
            QuestionOption(id: "d", textEN: "Step backwards", textID: "Langkah mundur")
        ],
        correctOptionId: "b",
        explanationEN: "Step over executes the current line completely (including function calls) and stops at the next line. Step into enters called functions.",
        explanationID: "Step over mengeksekusi baris saat ini sepenuhnya (termasuk panggilan fungsi) dan berhenti di baris berikutnya. Step into masuk ke fungsi yang dipanggil.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg024",
        questionEN: "What is rubber duck debugging?",
        questionID: "Apa itu rubber duck debugging?",
        options: [
            QuestionOption(id: "a", textEN: "Using a special debugging tool", textID: "Menggunakan alat debugging khusus"),
            QuestionOption(id: "b", textEN: "Explaining code line-by-line to find bugs through verbalization", textID: "Menjelaskan kode baris demi baris untuk menemukan bug melalui verbalisasi"),
            QuestionOption(id: "c", textEN: "Testing in water-resistant conditions", textID: "Pengujian dalam kondisi tahan air"),
            QuestionOption(id: "d", textEN: "A type of unit test", textID: "Jenis unit test")
        ],
        correctOptionId: "b",
        explanationEN: "Rubber duck debugging involves explaining your code line-by-line (to a duck or anyone). The process of explanation often reveals the bug.",
        explanationID: "Rubber duck debugging melibatkan penjelasan kode Anda baris demi baris (ke bebek atau siapa pun). Proses penjelasan sering mengungkap bug.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg025",
        questionEN: "What is the purpose of assertions (assert statement)?",
        questionID: "Apa tujuan assertions (pernyataan assert)?",
        options: [
            QuestionOption(id: "a", textEN: "To make code run faster", textID: "Untuk membuat kode berjalan lebih cepat"),
            QuestionOption(id: "b", textEN: "To verify assumptions about code state during development", textID: "Untuk memverifikasi asumsi tentang state kode selama pengembangan"),
            QuestionOption(id: "c", textEN: "To handle exceptions", textID: "Untuk menangani exception"),
            QuestionOption(id: "d", textEN: "To document code", textID: "Untuk mendokumentasikan kode")
        ],
        correctOptionId: "b",
        explanationEN: "assert checks conditions that should always be true. If false, AssertionError is raised. Used for debugging and verifying invariants.",
        explanationID: "assert memeriksa kondisi yang seharusnya selalu benar. Jika salah, AssertionError muncul. Digunakan untuk debugging dan memverifikasi invarian.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg026",
        questionEN: "What is binary search debugging (bisection)?",
        questionID: "Apa itu binary search debugging (bisection)?",
        options: [
            QuestionOption(id: "a", textEN: "Searching for bugs in binary files", textID: "Mencari bug dalam file biner"),
            QuestionOption(id: "b", textEN: "Narrowing down bug location by repeatedly halving the search space", textID: "Mempersempit lokasi bug dengan berulang kali membagi dua ruang pencarian"),
            QuestionOption(id: "c", textEN: "Using two debuggers simultaneously", textID: "Menggunakan dua debugger secara bersamaan"),
            QuestionOption(id: "d", textEN: "Debugging only 0s and 1s", textID: "Debugging hanya 0 dan 1")
        ],
        correctOptionId: "b",
        explanationEN: "Binary search debugging systematically halves the code section being examined to quickly locate where a bug was introduced (like git bisect).",
        explanationID: "Binary search debugging secara sistematis membagi dua bagian kode yang diperiksa untuk menemukan dengan cepat di mana bug diperkenalkan (seperti git bisect).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg027",
        questionEN: "What is logging vs print debugging?",
        questionID: "Apa perbedaan logging vs print debugging?",
        options: [
            QuestionOption(id: "a", textEN: "They are the same thing", textID: "Keduanya sama"),
            QuestionOption(id: "b", textEN: "Logging provides levels, formatting, and can be easily enabled/disabled", textID: "Logging menyediakan level, formatting, dan dapat dengan mudah diaktifkan/dinonaktifkan"),
            QuestionOption(id: "c", textEN: "Print is more powerful", textID: "Print lebih powerful"),
            QuestionOption(id: "d", textEN: "Logging only works in production", textID: "Logging hanya bekerja di produksi")
        ],
        correctOptionId: "b",
        explanationEN: "Logging (Python's logging module) offers log levels (DEBUG, INFO, ERROR), timestamps, file output, and can be configured without code changes.",
        explanationID: "Logging (modul logging Python) menawarkan level log (DEBUG, INFO, ERROR), timestamp, output file, dan dapat dikonfigurasi tanpa perubahan kode.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg028",
        questionEN: "What is the purpose of unit tests in debugging?",
        questionID: "Apa tujuan unit test dalam debugging?",
        options: [
            QuestionOption(id: "a", textEN: "To find all bugs automatically", textID: "Untuk menemukan semua bug secara otomatis"),
            QuestionOption(id: "b", textEN: "To verify individual components work correctly and catch regressions", textID: "Untuk memverifikasi komponen individual bekerja dengan benar dan menangkap regresi"),
            QuestionOption(id: "c", textEN: "To test the entire program at once", textID: "Untuk menguji seluruh program sekaligus"),
            QuestionOption(id: "d", textEN: "To measure code performance", textID: "Untuk mengukur performa kode")
        ],
        correctOptionId: "b",
        explanationEN: "Unit tests test individual functions/methods in isolation. They catch bugs early and ensure changes don't break existing functionality.",
        explanationID: "Unit test menguji fungsi/method individual secara terisolasi. Mereka menangkap bug lebih awal dan memastikan perubahan tidak merusak fungsionalitas yang ada.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg029",
        questionEN: "What does the Python debugger command 'pdb.set_trace()' do?",
        questionID: "Apa yang dilakukan perintah Python debugger 'pdb.set_trace()'?",
        options: [
            QuestionOption(id: "a", textEN: "Traces all function calls", textID: "Melacak semua panggilan fungsi"),
            QuestionOption(id: "b", textEN: "Sets a breakpoint at that line and enters interactive debugger", textID: "Mengatur breakpoint pada baris itu dan masuk ke debugger interaktif"),
            QuestionOption(id: "c", textEN: "Prints stack trace", textID: "Mencetak stack trace"),
            QuestionOption(id: "d", textEN: "Sets up error tracing", textID: "Mengatur pelacakan error")
        ],
        correctOptionId: "b",
        explanationEN: "pdb.set_trace() (or breakpoint() in Python 3.7+) inserts a breakpoint, pausing execution and starting the interactive pdb debugger.",
        explanationID: "pdb.set_trace() (atau breakpoint() di Python 3.7+) menyisipkan breakpoint, menjeda eksekusi dan memulai debugger pdb interaktif.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg030",
        questionEN: "What is a watchpoint in debugging?",
        questionID: "Apa itu watchpoint dalam debugging?",
        options: [
            QuestionOption(id: "a", textEN: "A timer for debugging sessions", textID: "Timer untuk sesi debugging"),
            QuestionOption(id: "b", textEN: "Pauses execution when a specific variable changes", textID: "Menjeda eksekusi ketika variabel tertentu berubah"),
            QuestionOption(id: "c", textEN: "Watches for syntax errors", textID: "Mengawasi kesalahan sintaks"),
            QuestionOption(id: "d", textEN: "Monitors CPU usage", textID: "Memantau penggunaan CPU")
        ],
        correctOptionId: "b",
        explanationEN: "A watchpoint (or data breakpoint) triggers when a specific variable's value changes, helpful for tracking unexpected modifications.",
        explanationID: "Watchpoint (atau data breakpoint) terpicu ketika nilai variabel tertentu berubah, membantu melacak modifikasi yang tidak terduga.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 4: ML/DL Debugging (10 questions)
    Question(
        id: "dbg031",
        questionEN: "What might cause NaN values during neural network training?",
        questionID: "Apa yang mungkin menyebabkan nilai NaN selama training neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Too small learning rate", textID: "Learning rate terlalu kecil"),
            QuestionOption(id: "b", textEN: "Exploding gradients, division by zero, or bad input data", textID: "Exploding gradients, pembagian dengan nol, atau data input yang buruk"),
            QuestionOption(id: "c", textEN: "Too many epochs", textID: "Terlalu banyak epoch"),
            QuestionOption(id: "d", textEN: "Batch size too large", textID: "Ukuran batch terlalu besar")
        ],
        correctOptionId: "b",
        explanationEN: "NaN often results from numerical instability: very large gradients, log(0), division by zero, or NaN in input data. Check learning rate, gradients, and data.",
        explanationID: "NaN sering dihasilkan dari ketidakstabilan numerik: gradien sangat besar, log(0), pembagian dengan nol, atau NaN dalam data input. Periksa learning rate, gradien, dan data.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg032",
        questionEN: "What is gradient checking used for?",
        questionID: "Untuk apa gradient checking digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Checking gradient descent speed", textID: "Memeriksa kecepatan gradient descent"),
            QuestionOption(id: "b", textEN: "Verifying backpropagation implementation is correct", textID: "Memverifikasi implementasi backpropagation benar"),
            QuestionOption(id: "c", textEN: "Checking gradient colors in visualization", textID: "Memeriksa warna gradien dalam visualisasi"),
            QuestionOption(id: "d", textEN: "Counting number of gradients", textID: "Menghitung jumlah gradien")
        ],
        correctOptionId: "b",
        explanationEN: "Gradient checking compares analytical gradients from backprop with numerical gradients (finite differences) to verify the gradient computation is correct.",
        explanationID: "Gradient checking membandingkan gradien analitik dari backprop dengan gradien numerik (finite differences) untuk memverifikasi komputasi gradien benar.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "dbg033",
        questionEN: "What indicates overfitting during training?",
        questionID: "Apa yang menunjukkan overfitting selama training?",
        options: [
            QuestionOption(id: "a", textEN: "Training and validation loss both increase", textID: "Loss training dan validasi keduanya meningkat"),
            QuestionOption(id: "b", textEN: "Training loss decreases but validation loss increases", textID: "Loss training menurun tapi loss validasi meningkat"),
            QuestionOption(id: "c", textEN: "Both losses decrease together", textID: "Kedua loss menurun bersama"),
            QuestionOption(id: "d", textEN: "Training loss stays constant", textID: "Loss training tetap konstan")
        ],
        correctOptionId: "b",
        explanationEN: "Overfitting: model memorizes training data. Training loss keeps decreasing while validation loss starts increasing. Add regularization or more data.",
        explanationID: "Overfitting: model menghafal data training. Loss training terus menurun sementara loss validasi mulai meningkat. Tambahkan regularisasi atau lebih banyak data.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg034",
        questionEN: "What does it mean if loss doesn't decrease during training?",
        questionID: "Apa artinya jika loss tidak menurun selama training?",
        options: [
            QuestionOption(id: "a", textEN: "Model is perfect", textID: "Model sudah sempurna"),
            QuestionOption(id: "b", textEN: "Possible issues: wrong learning rate, bug in code, or bad data", textID: "Kemungkinan masalah: learning rate salah, bug dalam kode, atau data buruk"),
            QuestionOption(id: "c", textEN: "Need more epochs", textID: "Butuh lebih banyak epoch"),
            QuestionOption(id: "d", textEN: "Normal behavior", textID: "Perilaku normal")
        ],
        correctOptionId: "b",
        explanationEN: "Flat loss suggests: learning rate too low/high, vanishing gradients, incorrect loss function, data issues, or bugs in forward/backward pass.",
        explanationID: "Loss datar menunjukkan: learning rate terlalu rendah/tinggi, vanishing gradients, fungsi loss salah, masalah data, atau bug di forward/backward pass.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg035",
        questionEN: "What is a common cause of CUDA out of memory error?",
        questionID: "Apa penyebab umum error CUDA out of memory?",
        options: [
            QuestionOption(id: "a", textEN: "Too small model", textID: "Model terlalu kecil"),
            QuestionOption(id: "b", textEN: "Batch size too large for GPU memory", textID: "Ukuran batch terlalu besar untuk memori GPU"),
            QuestionOption(id: "c", textEN: "Learning rate too high", textID: "Learning rate terlalu tinggi"),
            QuestionOption(id: "d", textEN: "Wrong optimizer", textID: "Optimizer yang salah")
        ],
        correctOptionId: "b",
        explanationEN: "CUDA OOM often results from too large batch size. Solutions: reduce batch size, use gradient accumulation, or use mixed precision training.",
        explanationID: "CUDA OOM sering dihasilkan dari ukuran batch terlalu besar. Solusi: kurangi ukuran batch, gunakan gradient accumulation, atau gunakan mixed precision training.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg036",
        questionEN: "What is mode collapse in GANs?",
        questionID: "Apa itu mode collapse di GAN?",
        options: [
            QuestionOption(id: "a", textEN: "Generator crashes", textID: "Generator crash"),
            QuestionOption(id: "b", textEN: "Generator produces limited variety of outputs", textID: "Generator menghasilkan variasi output yang terbatas"),
            QuestionOption(id: "c", textEN: "Training mode fails", textID: "Mode training gagal"),
            QuestionOption(id: "d", textEN: "Model becomes too large", textID: "Model menjadi terlalu besar")
        ],
        correctOptionId: "b",
        explanationEN: "Mode collapse occurs when the generator learns to produce only a few types of outputs that fool the discriminator, ignoring input diversity.",
        explanationID: "Mode collapse terjadi ketika generator belajar menghasilkan hanya beberapa tipe output yang menipu discriminator, mengabaikan keragaman input.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "dbg037",
        questionEN: "What does torch.autograd.set_detect_anomaly(True) do?",
        questionID: "Apa yang dilakukan torch.autograd.set_detect_anomaly(True)?",
        options: [
            QuestionOption(id: "a", textEN: "Detects hardware anomalies", textID: "Mendeteksi anomali hardware"),
            QuestionOption(id: "b", textEN: "Enables error detection in autograd to find NaN sources", textID: "Mengaktifkan deteksi error di autograd untuk menemukan sumber NaN"),
            QuestionOption(id: "c", textEN: "Finds anomalies in data", textID: "Menemukan anomali dalam data"),
            QuestionOption(id: "d", textEN: "Detects unusual training patterns", textID: "Mendeteksi pola training yang tidak biasa")
        ],
        correctOptionId: "b",
        explanationEN: "Anomaly detection mode provides better error messages and stack traces when NaN or Inf values are produced during autograd operations.",
        explanationID: "Mode deteksi anomali menyediakan pesan error dan stack trace yang lebih baik ketika nilai NaN atau Inf dihasilkan selama operasi autograd.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg038",
        questionEN: "Why might a model have 0% accuracy on test data?",
        questionID: "Mengapa model mungkin memiliki akurasi 0% pada data test?",
        options: [
            QuestionOption(id: "a", textEN: "Model is too simple", textID: "Model terlalu sederhana"),
            QuestionOption(id: "b", textEN: "Labels might be wrong, class mapping mismatch, or data leak", textID: "Label mungkin salah, ketidakcocokan pemetaan kelas, atau data leak"),
            QuestionOption(id: "c", textEN: "Need more training", textID: "Butuh lebih banyak training"),
            QuestionOption(id: "d", textEN: "Batch size too small", textID: "Ukuran batch terlalu kecil")
        ],
        correctOptionId: "b",
        explanationEN: "0% accuracy often indicates bugs: label encoding mismatch between train/test, wrong output activation, or predicting wrong class indices.",
        explanationID: "Akurasi 0% sering menunjukkan bug: ketidakcocokan encoding label antara train/test, aktivasi output yang salah, atau memprediksi indeks kelas yang salah.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg039",
        questionEN: "What is the purpose of sanity checking with a small dataset?",
        questionID: "Apa tujuan sanity checking dengan dataset kecil?",
        options: [
            QuestionOption(id: "a", textEN: "To save training time", textID: "Untuk menghemat waktu training"),
            QuestionOption(id: "b", textEN: "To verify model can overfit small data (basic learning works)", textID: "Untuk memverifikasi model dapat overfit data kecil (pembelajaran dasar bekerja)"),
            QuestionOption(id: "c", textEN: "To test data loading", textID: "Untuk menguji pemuatan data"),
            QuestionOption(id: "d", textEN: "To reduce memory usage", textID: "Untuk mengurangi penggunaan memori")
        ],
        correctOptionId: "b",
        explanationEN: "A model should be able to memorize (overfit) a tiny dataset. If it can't, there's likely a bug in the model, loss, or training loop.",
        explanationID: "Model harus bisa menghafal (overfit) dataset kecil. Jika tidak bisa, kemungkinan ada bug di model, loss, atau loop training.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg040",
        questionEN: "What does 'shape mismatch' error typically indicate?",
        questionID: "Apa yang biasanya ditunjukkan oleh error 'shape mismatch'?",
        options: [
            QuestionOption(id: "a", textEN: "Wrong data type", textID: "Tipe data yang salah"),
            QuestionOption(id: "b", textEN: "Tensor dimensions don't match for the operation", textID: "Dimensi tensor tidak cocok untuk operasi"),
            QuestionOption(id: "c", textEN: "Model architecture is wrong", textID: "Arsitektur model salah"),
            QuestionOption(id: "d", textEN: "Learning rate mismatch", textID: "Ketidakcocokan learning rate")
        ],
        correctOptionId: "b",
        explanationEN: "Shape mismatch means tensor dimensions are incompatible for the operation (e.g., matrix multiplication requires matching inner dimensions).",
        explanationID: "Shape mismatch berarti dimensi tensor tidak kompatibel untuk operasi (misalnya perkalian matriks memerlukan dimensi dalam yang cocok).",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 5: More Debugging (10 questions)
    Question(
        id: "dbg041",
        questionEN: "What is a memory leak?",
        questionID: "Apa itu memory leak?",
        options: [
            QuestionOption(id: "a", textEN: "Data being stolen from memory", textID: "Data dicuri dari memori"),
            QuestionOption(id: "b", textEN: "Program continuously consuming more memory without releasing it", textID: "Program terus menggunakan lebih banyak memori tanpa melepaskannya"),
            QuestionOption(id: "c", textEN: "Memory becoming corrupted", textID: "Memori menjadi rusak"),
            QuestionOption(id: "d", textEN: "Memory working too slowly", textID: "Memori bekerja terlalu lambat")
        ],
        correctOptionId: "b",
        explanationEN: "Memory leak occurs when a program allocates memory but fails to release it when no longer needed, eventually exhausting available memory.",
        explanationID: "Memory leak terjadi ketika program mengalokasikan memori tapi gagal melepaskannya ketika tidak lagi diperlukan, akhirnya menghabiskan memori yang tersedia.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg042",
        questionEN: "What is a race condition?",
        questionID: "Apa itu race condition?",
        options: [
            QuestionOption(id: "a", textEN: "Code running too fast", textID: "Kode berjalan terlalu cepat"),
            QuestionOption(id: "b", textEN: "Bug where outcome depends on timing/order of thread execution", textID: "Bug di mana hasil bergantung pada timing/urutan eksekusi thread"),
            QuestionOption(id: "c", textEN: "Competition between variables", textID: "Kompetisi antara variabel"),
            QuestionOption(id: "d", textEN: "Racing to find bugs", textID: "Berlomba menemukan bug")
        ],
        correctOptionId: "b",
        explanationEN: "Race conditions occur in concurrent code when the result depends on the relative timing of events, leading to unpredictable behavior.",
        explanationID: "Race condition terjadi dalam kode concurrent ketika hasil bergantung pada timing relatif dari event, mengarah ke perilaku yang tidak dapat diprediksi.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "dbg043",
        questionEN: "What is defensive programming?",
        questionID: "Apa itu defensive programming?",
        options: [
            QuestionOption(id: "a", textEN: "Protecting code from hackers", textID: "Melindungi kode dari peretas"),
            QuestionOption(id: "b", textEN: "Writing code that anticipates and handles potential errors", textID: "Menulis kode yang mengantisipasi dan menangani potensi error"),
            QuestionOption(id: "c", textEN: "Defending code reviews", textID: "Mempertahankan review kode"),
            QuestionOption(id: "d", textEN: "Using security libraries", textID: "Menggunakan library keamanan")
        ],
        correctOptionId: "b",
        explanationEN: "Defensive programming involves validating inputs, checking preconditions, handling edge cases, and writing code that fails gracefully.",
        explanationID: "Defensive programming melibatkan validasi input, memeriksa prasyarat, menangani kasus tepi, dan menulis kode yang gagal dengan baik.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg044",
        questionEN: "What does 'IndentationError: unexpected indent' mean?",
        questionID: "Apa arti 'IndentationError: unexpected indent'?",
        options: [
            QuestionOption(id: "a", textEN: "Missing indentation", textID: "Indentasi hilang"),
            QuestionOption(id: "b", textEN: "Line is indented when it shouldn't be", textID: "Baris diindentasi padahal seharusnya tidak"),
            QuestionOption(id: "c", textEN: "Using tabs instead of spaces", textID: "Menggunakan tab daripada spasi"),
            QuestionOption(id: "d", textEN: "Wrong number of spaces", textID: "Jumlah spasi yang salah")
        ],
        correctOptionId: "b",
        explanationEN: "Unexpected indent means a line is indented where Python doesn't expect it. Usually caused by extra spaces or mixing tabs/spaces.",
        explanationID: "Unexpected indent berarti baris diindentasi di mana Python tidak mengharapkannya. Biasanya disebabkan oleh spasi ekstra atau mencampur tab/spasi.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg045",
        questionEN: "What is a segmentation fault?",
        questionID: "Apa itu segmentation fault?",
        options: [
            QuestionOption(id: "a", textEN: "Dividing code into segments", textID: "Membagi kode menjadi segmen"),
            QuestionOption(id: "b", textEN: "Accessing memory the program isn't allowed to access", textID: "Mengakses memori yang tidak diizinkan untuk diakses program"),
            QuestionOption(id: "c", textEN: "Network connection error", textID: "Error koneksi jaringan"),
            QuestionOption(id: "d", textEN: "File not found", textID: "File tidak ditemukan")
        ],
        correctOptionId: "b",
        explanationEN: "Segmentation fault occurs when a program tries to access memory it's not allowed to, often from dereferencing null pointers or buffer overflows.",
        explanationID: "Segmentation fault terjadi ketika program mencoba mengakses memori yang tidak diizinkan, sering dari dereferencing null pointer atau buffer overflow.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg046",
        questionEN: "What is the purpose of code review in debugging?",
        questionID: "Apa tujuan code review dalam debugging?",
        options: [
            QuestionOption(id: "a", textEN: "To criticize other programmers", textID: "Untuk mengkritik programmer lain"),
            QuestionOption(id: "b", textEN: "To have others find bugs and suggest improvements", textID: "Agar orang lain menemukan bug dan menyarankan perbaikan"),
            QuestionOption(id: "c", textEN: "To speed up code execution", textID: "Untuk mempercepat eksekusi kode"),
            QuestionOption(id: "d", textEN: "To reduce code size", textID: "Untuk mengurangi ukuran kode")
        ],
        correctOptionId: "b",
        explanationEN: "Code review catches bugs early through fresh eyes, shares knowledge, improves code quality, and helps identify issues the author missed.",
        explanationID: "Code review menangkap bug lebih awal melalui sudut pandang baru, berbagi pengetahuan, meningkatkan kualitas kode, dan membantu mengidentifikasi masalah yang terlewat oleh penulis.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg047",
        questionEN: "What does 'RecursionError: maximum recursion depth exceeded' indicate?",
        questionID: "Apa yang ditunjukkan oleh 'RecursionError: maximum recursion depth exceeded'?",
        options: [
            QuestionOption(id: "a", textEN: "Function is too complex", textID: "Fungsi terlalu kompleks"),
            QuestionOption(id: "b", textEN: "Recursive function called too many times without stopping", textID: "Fungsi rekursif dipanggil terlalu banyak kali tanpa berhenti"),
            QuestionOption(id: "c", textEN: "Python limit is too low", textID: "Batas Python terlalu rendah"),
            QuestionOption(id: "d", textEN: "Too many nested loops", textID: "Terlalu banyak loop bersarang")
        ],
        correctOptionId: "b",
        explanationEN: "This error means the recursive function exceeded Python's call stack limit (usually 1000). Fix by adding proper base case or use iteration.",
        explanationID: "Error ini berarti fungsi rekursif melebihi batas call stack Python (biasanya 1000). Perbaiki dengan menambahkan base case yang tepat atau gunakan iterasi.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg048",
        questionEN: "What is test-driven development (TDD)?",
        questionID: "Apa itu test-driven development (TDD)?",
        options: [
            QuestionOption(id: "a", textEN: "Testing after development is complete", textID: "Pengujian setelah pengembangan selesai"),
            QuestionOption(id: "b", textEN: "Writing tests before writing the actual code", textID: "Menulis test sebelum menulis kode sebenarnya"),
            QuestionOption(id: "c", textEN: "Testing while driving", textID: "Pengujian sambil berkendara"),
            QuestionOption(id: "d", textEN: "Development without any testing", textID: "Pengembangan tanpa pengujian apa pun")
        ],
        correctOptionId: "b",
        explanationEN: "TDD involves writing tests first that define expected behavior, then writing code to make tests pass, then refactoring.",
        explanationID: "TDD melibatkan penulisan test terlebih dahulu yang mendefinisikan perilaku yang diharapkan, lalu menulis kode agar test lulus, lalu refactoring.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "dbg049",
        questionEN: "What is the purpose of version control in debugging?",
        questionID: "Apa tujuan version control dalam debugging?",
        options: [
            QuestionOption(id: "a", textEN: "To track different Python versions", textID: "Untuk melacak versi Python yang berbeda"),
            QuestionOption(id: "b", textEN: "To track changes and revert to working versions", textID: "Untuk melacak perubahan dan kembali ke versi yang bekerja"),
            QuestionOption(id: "c", textEN: "To version the bugs", textID: "Untuk memversi bug"),
            QuestionOption(id: "d", textEN: "To control who accesses code", textID: "Untuk mengontrol siapa yang mengakses kode")
        ],
        correctOptionId: "b",
        explanationEN: "Version control (git) tracks all changes, allowing you to identify when bugs were introduced and revert to working code if needed.",
        explanationID: "Version control (git) melacak semua perubahan, memungkinkan Anda mengidentifikasi kapan bug diperkenalkan dan kembali ke kode yang bekerja jika diperlukan.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "dbg050",
        questionEN: "What is the 'minimum reproducible example' for bug reports?",
        questionID: "Apa itu 'minimum reproducible example' untuk laporan bug?",
        options: [
            QuestionOption(id: "a", textEN: "The smallest code sample that demonstrates the bug", textID: "Sampel kode terkecil yang menunjukkan bug"),
            QuestionOption(id: "b", textEN: "The original complete code", textID: "Kode lengkap asli"),
            QuestionOption(id: "c", textEN: "A screenshot of the error", textID: "Screenshot error"),
            QuestionOption(id: "d", textEN: "The minimum number of bug reports", textID: "Jumlah minimum laporan bug")
        ],
        correctOptionId: "a",
        explanationEN: "A minimum reproducible example is the smallest, self-contained code that reproduces the bug, making it easier for others to understand and fix.",
        explanationID: "Minimum reproducible example adalah kode terkecil dan mandiri yang mereproduksi bug, memudahkan orang lain untuk memahami dan memperbaiki.",
        topic: "computing",
        difficulty: .intermediate
    )
]
