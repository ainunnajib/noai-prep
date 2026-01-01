import Foundation

// MARK: - Python Questions (50 questions)
extension NOAIQuestionBank {
    var pythonQuestions: [Question] {
        [
            // Batch 1: Questions 1-10
            Question(
                id: "py001",
                questionEN: "What is the output of: print(type([1, 2, 3]))?",
                questionID: "Apa output dari: print(type([1, 2, 3]))?",
                options: [
                    QuestionOption(id: "a", textEN: "<class 'list'>", textID: "<class 'list'>"),
                    QuestionOption(id: "b", textEN: "<class 'tuple'>", textID: "<class 'tuple'>"),
                    QuestionOption(id: "c", textEN: "<class 'array'>", textID: "<class 'array'>"),
                    QuestionOption(id: "d", textEN: "<class 'set'>", textID: "<class 'set'>")
                ],
                correctOptionId: "a",
                explanationEN: "[1, 2, 3] creates a list. Square brackets denote lists in Python.",
                explanationID: "[1, 2, 3] membuat list. Kurung siku menandakan list di Python.",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py002",
                questionEN: "What does 'len()' function return for a string 'Hello'?",
                questionID: "Apa yang dikembalikan fungsi 'len()' untuk string 'Hello'?",
                options: [
                    QuestionOption(id: "a", textEN: "4", textID: "4"),
                    QuestionOption(id: "b", textEN: "5", textID: "5"),
                    QuestionOption(id: "c", textEN: "6", textID: "6"),
                    QuestionOption(id: "d", textEN: "Error", textID: "Error")
                ],
                correctOptionId: "b",
                explanationEN: "len('Hello') = 5. Counts the number of characters in the string.",
                explanationID: "len('Hello') = 5. Menghitung jumlah karakter dalam string.",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py003",
                questionEN: "What is list slicing a[1:4] for a = [0,1,2,3,4,5]?",
                questionID: "Apa hasil slicing list a[1:4] untuk a = [0,1,2,3,4,5]?",
                options: [
                    QuestionOption(id: "a", textEN: "[1, 2, 3]", textID: "[1, 2, 3]"),
                    QuestionOption(id: "b", textEN: "[1, 2, 3, 4]", textID: "[1, 2, 3, 4]"),
                    QuestionOption(id: "c", textEN: "[0, 1, 2, 3]", textID: "[0, 1, 2, 3]"),
                    QuestionOption(id: "d", textEN: "[2, 3, 4]", textID: "[2, 3, 4]")
                ],
                correctOptionId: "a",
                explanationEN: "a[1:4] returns elements at index 1, 2, 3 (end index is exclusive): [1, 2, 3].",
                explanationID: "a[1:4] mengembalikan elemen pada indeks 1, 2, 3 (indeks akhir eksklusif): [1, 2, 3].",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py004",
                questionEN: "What is the difference between '==' and 'is' in Python?",
                questionID: "Apa perbedaan antara '==' dan 'is' di Python?",
                options: [
                    QuestionOption(id: "a", textEN: "'==' compares values, 'is' compares identity (memory)", textID: "'==' membandingkan nilai, 'is' membandingkan identitas (memori)"),
                    QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
                    QuestionOption(id: "c", textEN: "'is' is for strings only", textID: "'is' hanya untuk string"),
                    QuestionOption(id: "d", textEN: "'==' is for numbers only", textID: "'==' hanya untuk angka")
                ],
                correctOptionId: "a",
                explanationEN: "'==' checks value equality, 'is' checks if two variables point to same object in memory.",
                explanationID: "'==' memeriksa kesamaan nilai, 'is' memeriksa apakah dua variabel menunjuk ke objek yang sama di memori.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py005",
                questionEN: "What is a list comprehension?",
                questionID: "Apa itu list comprehension?",
                options: [
                    QuestionOption(id: "a", textEN: "Concise way to create lists: [expr for item in iterable]", textID: "Cara ringkas membuat list: [expr for item in iterable]"),
                    QuestionOption(id: "b", textEN: "A type of loop", textID: "Jenis loop"),
                    QuestionOption(id: "c", textEN: "Method to understand lists", textID: "Metode untuk memahami list"),
                    QuestionOption(id: "d", textEN: "A list sorting algorithm", textID: "Algoritma pengurutan list")
                ],
                correctOptionId: "a",
                explanationEN: "List comprehension: [x**2 for x in range(5)] creates [0, 1, 4, 9, 16]. Compact syntax for list creation.",
                explanationID: "List comprehension: [x**2 for x in range(5)] membuat [0, 1, 4, 9, 16]. Sintaks ringkas untuk pembuatan list.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py006",
                questionEN: "What does 'lambda x: x*2' create?",
                questionID: "Apa yang dibuat oleh 'lambda x: x*2'?",
                options: [
                    QuestionOption(id: "a", textEN: "Anonymous function that doubles input", textID: "Fungsi anonim yang menggandakan input"),
                    QuestionOption(id: "b", textEN: "A variable named lambda", textID: "Variabel bernama lambda"),
                    QuestionOption(id: "c", textEN: "A loop", textID: "Sebuah loop"),
                    QuestionOption(id: "d", textEN: "An error", textID: "Error")
                ],
                correctOptionId: "a",
                explanationEN: "Lambda creates anonymous functions. lambda x: x*2 is equivalent to def f(x): return x*2",
                explanationID: "Lambda membuat fungsi anonim. lambda x: x*2 ekuivalen dengan def f(x): return x*2",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py007",
                questionEN: "What is the output of: print(3 // 2)?",
                questionID: "Apa output dari: print(3 // 2)?",
                options: [
                    QuestionOption(id: "a", textEN: "1.5", textID: "1.5"),
                    QuestionOption(id: "b", textEN: "1", textID: "1"),
                    QuestionOption(id: "c", textEN: "2", textID: "2"),
                    QuestionOption(id: "d", textEN: "Error", textID: "Error")
                ],
                correctOptionId: "b",
                explanationEN: "// is integer division (floor division). 3 // 2 = 1 (rounds down).",
                explanationID: "// adalah pembagian integer (pembagian floor). 3 // 2 = 1 (dibulatkan ke bawah).",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py008",
                questionEN: "What is the purpose of 'if __name__ == \"__main__\":'?",
                questionID: "Apa tujuan dari 'if __name__ == \"__main__\":'?",
                options: [
                    QuestionOption(id: "a", textEN: "Run code only when script is executed directly, not imported", textID: "Jalankan kode hanya ketika script dieksekusi langsung, bukan diimpor"),
                    QuestionOption(id: "b", textEN: "Define the main function", textID: "Mendefinisikan fungsi main"),
                    QuestionOption(id: "c", textEN: "Check if file exists", textID: "Memeriksa apakah file ada"),
                    QuestionOption(id: "d", textEN: "Import main module", textID: "Mengimpor modul main")
                ],
                correctOptionId: "a",
                explanationEN: "When a script is run directly, __name__ == '__main__'. When imported, __name__ equals the module name.",
                explanationID: "Ketika script dijalankan langsung, __name__ == '__main__'. Ketika diimpor, __name__ sama dengan nama modul.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py009",
                questionEN: "What is a dictionary in Python?",
                questionID: "Apa itu dictionary di Python?",
                options: [
                    QuestionOption(id: "a", textEN: "Key-value pair collection: {'a': 1, 'b': 2}", textID: "Koleksi pasangan kunci-nilai: {'a': 1, 'b': 2}"),
                    QuestionOption(id: "b", textEN: "Ordered list of words", textID: "Daftar kata terurut"),
                    QuestionOption(id: "c", textEN: "Same as a list", textID: "Sama dengan list"),
                    QuestionOption(id: "d", textEN: "A type of string", textID: "Jenis string")
                ],
                correctOptionId: "a",
                explanationEN: "Dictionary stores key-value pairs. Access values by key: d['a'] returns 1. Keys must be hashable.",
                explanationID: "Dictionary menyimpan pasangan kunci-nilai. Akses nilai dengan kunci: d['a'] mengembalikan 1. Kunci harus hashable.",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py010",
                questionEN: "What does 'try-except' do?",
                questionID: "Apa yang dilakukan 'try-except'?",
                options: [
                    QuestionOption(id: "a", textEN: "Handles exceptions/errors gracefully", textID: "Menangani exception/error dengan baik"),
                    QuestionOption(id: "b", textEN: "Tries to run code faster", textID: "Mencoba menjalankan kode lebih cepat"),
                    QuestionOption(id: "c", textEN: "Tests if code is correct", textID: "Menguji apakah kode benar"),
                    QuestionOption(id: "d", textEN: "Creates a backup of variables", textID: "Membuat backup variabel")
                ],
                correctOptionId: "a",
                explanationEN: "try-except catches exceptions. Code in 'try' runs; if error occurs, 'except' block handles it.",
                explanationID: "try-except menangkap exception. Kode di 'try' berjalan; jika error terjadi, blok 'except' menanganinya.",
                topic: "computing",
                difficulty: .beginner
            ),
            // Batch 2: Questions 11-20
            Question(
                id: "py011",
                questionEN: "What is the output of: list(range(0, 10, 2))?",
                questionID: "Apa output dari: list(range(0, 10, 2))?",
                options: [
                    QuestionOption(id: "a", textEN: "[0, 2, 4, 6, 8]", textID: "[0, 2, 4, 6, 8]"),
                    QuestionOption(id: "b", textEN: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]", textID: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"),
                    QuestionOption(id: "c", textEN: "[2, 4, 6, 8, 10]", textID: "[2, 4, 6, 8, 10]"),
                    QuestionOption(id: "d", textEN: "[0, 2, 4, 6, 8, 10]", textID: "[0, 2, 4, 6, 8, 10]")
                ],
                correctOptionId: "a",
                explanationEN: "range(start, stop, step) = range(0, 10, 2) gives 0, 2, 4, 6, 8 (stop is exclusive).",
                explanationID: "range(start, stop, step) = range(0, 10, 2) memberikan 0, 2, 4, 6, 8 (stop eksklusif).",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py012",
                questionEN: "What is *args in a function definition?",
                questionID: "Apa itu *args dalam definisi fungsi?",
                options: [
                    QuestionOption(id: "a", textEN: "Allows variable number of positional arguments", textID: "Memungkinkan jumlah argumen posisi yang bervariasi"),
                    QuestionOption(id: "b", textEN: "Multiplies arguments", textID: "Mengalikan argumen"),
                    QuestionOption(id: "c", textEN: "Makes arguments optional", textID: "Membuat argumen opsional"),
                    QuestionOption(id: "d", textEN: "Pointer to arguments", textID: "Pointer ke argumen")
                ],
                correctOptionId: "a",
                explanationEN: "*args collects extra positional arguments into a tuple. def f(*args): can accept any number of arguments.",
                explanationID: "*args mengumpulkan argumen posisi tambahan ke dalam tuple. def f(*args): dapat menerima berapa pun argumen.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py013",
                questionEN: "What is **kwargs?",
                questionID: "Apa itu **kwargs?",
                options: [
                    QuestionOption(id: "a", textEN: "Allows variable number of keyword arguments as dict", textID: "Memungkinkan jumlah argumen keyword bervariasi sebagai dict"),
                    QuestionOption(id: "b", textEN: "Double pointer", textID: "Double pointer"),
                    QuestionOption(id: "c", textEN: "Keyword validation", textID: "Validasi keyword"),
                    QuestionOption(id: "d", textEN: "Same as *args", textID: "Sama dengan *args")
                ],
                correctOptionId: "a",
                explanationEN: "**kwargs collects extra keyword arguments into a dictionary. def f(**kwargs): accepts name=value pairs.",
                explanationID: "**kwargs mengumpulkan argumen keyword tambahan ke dalam dictionary. def f(**kwargs): menerima pasangan name=value.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py014",
                questionEN: "What is a generator in Python?",
                questionID: "Apa itu generator di Python?",
                options: [
                    QuestionOption(id: "a", textEN: "Function that yields values lazily using 'yield'", textID: "Fungsi yang menghasilkan nilai secara lazy menggunakan 'yield'"),
                    QuestionOption(id: "b", textEN: "Function that generates random numbers", textID: "Fungsi yang menghasilkan angka acak"),
                    QuestionOption(id: "c", textEN: "Tool to create classes", textID: "Alat untuk membuat class"),
                    QuestionOption(id: "d", textEN: "Loop construct", textID: "Konstruksi loop")
                ],
                correctOptionId: "a",
                explanationEN: "Generators use 'yield' to produce values one at a time, saving memory for large datasets.",
                explanationID: "Generator menggunakan 'yield' untuk menghasilkan nilai satu per satu, menghemat memori untuk dataset besar.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py015",
                questionEN: "What is the difference between append() and extend() for lists?",
                questionID: "Apa perbedaan antara append() dan extend() untuk list?",
                options: [
                    QuestionOption(id: "a", textEN: "append adds one element, extend adds elements from iterable", textID: "append menambah satu elemen, extend menambah elemen dari iterable"),
                    QuestionOption(id: "b", textEN: "They are the same", textID: "Keduanya sama"),
                    QuestionOption(id: "c", textEN: "extend is faster", textID: "extend lebih cepat"),
                    QuestionOption(id: "d", textEN: "append works with numbers only", textID: "append hanya bekerja dengan angka")
                ],
                correctOptionId: "a",
                explanationEN: "[1].append([2,3]) → [1, [2,3]]. [1].extend([2,3]) → [1, 2, 3]. Append adds as single item.",
                explanationID: "[1].append([2,3]) → [1, [2,3]]. [1].extend([2,3]) → [1, 2, 3]. Append menambah sebagai item tunggal.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py016",
                questionEN: "What does enumerate() do?",
                questionID: "Apa yang dilakukan enumerate()?",
                options: [
                    QuestionOption(id: "a", textEN: "Returns index and value pairs from iterable", textID: "Mengembalikan pasangan indeks dan nilai dari iterable"),
                    QuestionOption(id: "b", textEN: "Counts elements", textID: "Menghitung elemen"),
                    QuestionOption(id: "c", textEN: "Sorts the list", textID: "Mengurutkan list"),
                    QuestionOption(id: "d", textEN: "Creates numbered list", textID: "Membuat list bernomor")
                ],
                correctOptionId: "a",
                explanationEN: "for i, val in enumerate(['a','b']): gives (0,'a'), (1,'b'). Useful for index tracking in loops.",
                explanationID: "for i, val in enumerate(['a','b']): memberikan (0,'a'), (1,'b'). Berguna untuk pelacakan indeks dalam loop.",
                topic: "computing",
                difficulty: .beginner
            ),
            Question(
                id: "py017",
                questionEN: "What is a decorator in Python?",
                questionID: "Apa itu decorator di Python?",
                options: [
                    QuestionOption(id: "a", textEN: "Function that modifies behavior of another function", textID: "Fungsi yang memodifikasi perilaku fungsi lain"),
                    QuestionOption(id: "b", textEN: "Comments for functions", textID: "Komentar untuk fungsi"),
                    QuestionOption(id: "c", textEN: "UI styling", textID: "Styling UI"),
                    QuestionOption(id: "d", textEN: "Type annotation", textID: "Anotasi tipe")
                ],
                correctOptionId: "a",
                explanationEN: "@decorator syntax wraps a function to extend its behavior without modifying it directly.",
                explanationID: "Sintaks @decorator membungkus fungsi untuk memperluas perilakunya tanpa memodifikasinya langsung.",
                topic: "computing",
                difficulty: .advanced
            ),
            Question(
                id: "py018",
                questionEN: "What is the output of: 'hello'.split('l')?",
                questionID: "Apa output dari: 'hello'.split('l')?",
                options: [
                    QuestionOption(id: "a", textEN: "['he', '', 'o']", textID: "['he', '', 'o']"),
                    QuestionOption(id: "b", textEN: "['heo']", textID: "['heo']"),
                    QuestionOption(id: "c", textEN: "['hello']", textID: "['hello']"),
                    QuestionOption(id: "d", textEN: "['h', 'e', 'o']", textID: "['h', 'e', 'o']")
                ],
                correctOptionId: "a",
                explanationEN: "split('l') splits at each 'l'. 'hello' has two consecutive 'l's, creating empty string between.",
                explanationID: "split('l') memisahkan di setiap 'l'. 'hello' memiliki dua 'l' berurutan, membuat string kosong di antara.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py019",
                questionEN: "What does zip() do?",
                questionID: "Apa yang dilakukan zip()?",
                options: [
                    QuestionOption(id: "a", textEN: "Pairs elements from multiple iterables", textID: "Memasangkan elemen dari beberapa iterable"),
                    QuestionOption(id: "b", textEN: "Compresses files", textID: "Mengompres file"),
                    QuestionOption(id: "c", textEN: "Joins strings", textID: "Menggabungkan string"),
                    QuestionOption(id: "d", textEN: "Sorts lists", textID: "Mengurutkan list")
                ],
                correctOptionId: "a",
                explanationEN: "zip([1,2], ['a','b']) → [(1,'a'), (2,'b')]. Pairs corresponding elements from iterables.",
                explanationID: "zip([1,2], ['a','b']) → [(1,'a'), (2,'b')]. Memasangkan elemen yang bersesuaian dari iterable.",
                topic: "computing",
                difficulty: .intermediate
            ),
            Question(
                id: "py020",
                questionEN: "What is the time complexity of list.append() in Python?",
                questionID: "Berapa kompleksitas waktu dari list.append() di Python?",
                options: [
                    QuestionOption(id: "a", textEN: "O(1) amortized", textID: "O(1) teramortisasi"),
                    QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
                    QuestionOption(id: "c", textEN: "O(log n)", textID: "O(log n)"),
                    QuestionOption(id: "d", textEN: "O(n²)", textID: "O(n²)")
                ],
                correctOptionId: "a",
                explanationEN: "Python lists are dynamic arrays. append() is O(1) amortized - occasionally resizes but averages constant time.",
                explanationID: "List Python adalah array dinamis. append() adalah O(1) teramortisasi - kadang resize tapi rata-rata waktu konstan.",
                topic: "computing",
                difficulty: .intermediate
            ),
        ]
    }
}
