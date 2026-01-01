import Foundation

// MARK: - Problem Solving: Optimization Questions (50 questions)
// Topics: Algorithm Optimization, Code Efficiency, Performance Tuning, Mathematical Optimization

let optimizationProblemQuestions: [Question] = [
    // MARK: - Algorithm Optimization (15 questions)
    Question(
        id: "opt001",
        questionEN: "A naive algorithm runs in O(n³). After optimization, it runs in O(n²). If n = 1000, approximately how many times faster is the optimized version?",
        questionID: "Algoritma naif berjalan dalam O(n³). Setelah optimasi, berjalan dalam O(n²). Jika n = 1000, berapa kali lebih cepat versi yang dioptimasi?",
        options: [
            QuestionOption(id: "a", textEN: "10 times faster", textID: "10 kali lebih cepat"),
            QuestionOption(id: "b", textEN: "100 times faster", textID: "100 kali lebih cepat"),
            QuestionOption(id: "c", textEN: "1000 times faster", textID: "1000 kali lebih cepat"),
            QuestionOption(id: "d", textEN: "1,000,000 times faster", textID: "1.000.000 kali lebih cepat")
        ],
        correctOptionId: "c",
        explanationEN: "O(n³)/O(n²) = n = 1000 times faster. The cubic algorithm does 10⁹ operations while quadratic does 10⁶.",
        explanationID: "O(n³)/O(n²) = n = 1000 kali lebih cepat. Algoritma kubik melakukan 10⁹ operasi sedangkan kuadratik 10⁶.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt002",
        questionEN: "Which optimization technique converts this code?\n```python\n# Before\nfor i in range(n):\n    for j in range(n):\n        result += matrix[j][i]\n# After  \nfor i in range(n):\n    for j in range(n):\n        result += matrix[i][j]\n```",
        questionID: "Teknik optimasi apa yang mengubah kode ini?\n```python\n# Sebelum\nfor i in range(n):\n    for j in range(n):\n        result += matrix[j][i]\n# Sesudah  \nfor i in range(n):\n    for j in range(n):\n        result += matrix[i][j]\n```",
        options: [
            QuestionOption(id: "a", textEN: "Loop unrolling", textID: "Loop unrolling"),
            QuestionOption(id: "b", textEN: "Cache optimization (spatial locality)", textID: "Optimasi cache (spatial locality)"),
            QuestionOption(id: "c", textEN: "Strength reduction", textID: "Strength reduction"),
            QuestionOption(id: "d", textEN: "Dead code elimination", textID: "Eliminasi dead code")
        ],
        correctOptionId: "b",
        explanationEN: "Accessing matrix[i][j] in row-major order improves cache locality. Adjacent memory locations are accessed sequentially, reducing cache misses.",
        explanationID: "Mengakses matrix[i][j] dalam urutan row-major meningkatkan cache locality. Lokasi memori yang berdekatan diakses secara berurutan, mengurangi cache miss.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt003",
        questionEN: "What is the optimal time complexity for finding if an element exists in a sorted array?",
        questionID: "Berapa kompleksitas waktu optimal untuk menemukan apakah elemen ada dalam array terurut?",
        options: [
            QuestionOption(id: "a", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "b", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "c", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "d", textEN: "O(1)", textID: "O(1)")
        ],
        correctOptionId: "b",
        explanationEN: "Binary search achieves O(log n) by halving the search space in each step. This is optimal for sorted arrays without additional data structures.",
        explanationID: "Binary search mencapai O(log n) dengan membagi dua ruang pencarian di setiap langkah. Ini optimal untuk array terurut tanpa struktur data tambahan.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt004",
        questionEN: "Which data structure would optimize this operation: 'Find the kth smallest element repeatedly as elements are added'?",
        questionID: "Struktur data mana yang akan mengoptimalkan operasi ini: 'Temukan elemen terkecil ke-k berulang kali saat elemen ditambahkan'?",
        options: [
            QuestionOption(id: "a", textEN: "Sorted array", textID: "Array terurut"),
            QuestionOption(id: "b", textEN: "Min-heap of size k", textID: "Min-heap ukuran k"),
            QuestionOption(id: "c", textEN: "Max-heap of size k", textID: "Max-heap ukuran k"),
            QuestionOption(id: "d", textEN: "Hash table", textID: "Hash table")
        ],
        correctOptionId: "c",
        explanationEN: "A max-heap of size k maintains the k smallest elements seen so far. The root is the kth smallest. Insert: O(log k), Query: O(1).",
        explanationID: "Max-heap ukuran k mempertahankan k elemen terkecil yang terlihat sejauh ini. Root adalah yang terkecil ke-k. Insert: O(log k), Query: O(1).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt005",
        questionEN: "What technique optimizes the Fibonacci calculation from O(2ⁿ) to O(n)?",
        questionID: "Teknik apa yang mengoptimalkan perhitungan Fibonacci dari O(2ⁿ) ke O(n)?",
        options: [
            QuestionOption(id: "a", textEN: "Divide and conquer", textID: "Divide and conquer"),
            QuestionOption(id: "b", textEN: "Memoization/Dynamic Programming", textID: "Memoization/Dynamic Programming"),
            QuestionOption(id: "c", textEN: "Greedy algorithm", textID: "Algoritma greedy"),
            QuestionOption(id: "d", textEN: "Backtracking", textID: "Backtracking")
        ],
        correctOptionId: "b",
        explanationEN: "Memoization stores computed Fibonacci values to avoid redundant calculations. Each value is computed once, reducing exponential to linear time.",
        explanationID: "Memoization menyimpan nilai Fibonacci yang sudah dihitung untuk menghindari perhitungan berulang. Setiap nilai dihitung sekali, mengurangi waktu eksponensial ke linear.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt006",
        questionEN: "Which approach optimizes finding all pairs with sum equal to target in an array?",
        questionID: "Pendekatan mana yang mengoptimalkan pencarian semua pasangan dengan jumlah sama dengan target dalam array?",
        options: [
            QuestionOption(id: "a", textEN: "Nested loops O(n²)", textID: "Loop bersarang O(n²)"),
            QuestionOption(id: "b", textEN: "Sort + Two pointers O(n log n)", textID: "Sort + Two pointer O(n log n)"),
            QuestionOption(id: "c", textEN: "Hash set O(n)", textID: "Hash set O(n)"),
            QuestionOption(id: "d", textEN: "Binary search for each element O(n log n)", textID: "Binary search untuk setiap elemen O(n log n)")
        ],
        correctOptionId: "c",
        explanationEN: "Using a hash set, for each element x, check if (target - x) exists in the set. O(n) time with O(n) space, optimal for this problem.",
        explanationID: "Menggunakan hash set, untuk setiap elemen x, cek apakah (target - x) ada dalam set. Waktu O(n) dengan ruang O(n), optimal untuk masalah ini.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt007",
        questionEN: "What is the time complexity improvement when using matrix exponentiation for Fibonacci instead of DP?",
        questionID: "Apa peningkatan kompleksitas waktu saat menggunakan eksponensiasi matriks untuk Fibonacci dibanding DP?",
        options: [
            QuestionOption(id: "a", textEN: "O(n) → O(1)", textID: "O(n) → O(1)"),
            QuestionOption(id: "b", textEN: "O(n) → O(log n)", textID: "O(n) → O(log n)"),
            QuestionOption(id: "c", textEN: "O(n²) → O(n)", textID: "O(n²) → O(n)"),
            QuestionOption(id: "d", textEN: "O(n) → O(√n)", textID: "O(n) → O(√n)")
        ],
        correctOptionId: "b",
        explanationEN: "Matrix exponentiation computes [[1,1],[1,0]]ⁿ in O(log n) time using fast exponentiation. This gives the nth Fibonacci number directly.",
        explanationID: "Eksponensiasi matriks menghitung [[1,1],[1,0]]ⁿ dalam waktu O(log n) menggunakan eksponensiasi cepat. Ini memberikan bilangan Fibonacci ke-n secara langsung.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt008",
        questionEN: "Which optimization converts multiplication by a constant power of 2 to a faster operation?",
        questionID: "Optimasi mana yang mengubah perkalian dengan konstanta pangkat 2 menjadi operasi lebih cepat?",
        options: [
            QuestionOption(id: "a", textEN: "Loop unrolling", textID: "Loop unrolling"),
            QuestionOption(id: "b", textEN: "Strength reduction (bit shifting)", textID: "Strength reduction (bit shifting)"),
            QuestionOption(id: "c", textEN: "Common subexpression elimination", textID: "Eliminasi subekspresi umum"),
            QuestionOption(id: "d", textEN: "Dead code elimination", textID: "Eliminasi dead code")
        ],
        correctOptionId: "b",
        explanationEN: "x * 8 can be replaced with x << 3 (left shift by 3). Bit shifts are faster than multiplication on most processors.",
        explanationID: "x * 8 dapat diganti dengan x << 3 (geser kiri 3). Bit shift lebih cepat dari perkalian pada kebanyakan prosesor.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt009",
        questionEN: "To find the median in a stream of numbers efficiently, which data structure combination is optimal?",
        questionID: "Untuk menemukan median dalam stream angka secara efisien, kombinasi struktur data mana yang optimal?",
        options: [
            QuestionOption(id: "a", textEN: "Single sorted array", textID: "Satu array terurut"),
            QuestionOption(id: "b", textEN: "Two heaps (max-heap and min-heap)", textID: "Dua heap (max-heap dan min-heap)"),
            QuestionOption(id: "c", textEN: "Binary search tree", textID: "Binary search tree"),
            QuestionOption(id: "d", textEN: "Hash table", textID: "Hash table")
        ],
        correctOptionId: "b",
        explanationEN: "Use a max-heap for the lower half and min-heap for the upper half. Insert: O(log n), Find median: O(1). Balance heaps to differ by at most 1 element.",
        explanationID: "Gunakan max-heap untuk setengah bawah dan min-heap untuk setengah atas. Insert: O(log n), Cari median: O(1). Seimbangkan heap agar berbeda maksimal 1 elemen.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt010",
        questionEN: "What technique optimizes string concatenation in a loop from O(n²) to O(n)?",
        questionID: "Teknik apa yang mengoptimalkan penggabungan string dalam loop dari O(n²) ke O(n)?",
        options: [
            QuestionOption(id: "a", textEN: "Use StringBuilder/list then join", textID: "Gunakan StringBuilder/list lalu join"),
            QuestionOption(id: "b", textEN: "Use recursion", textID: "Gunakan rekursi"),
            QuestionOption(id: "c", textEN: "Use multiple threads", textID: "Gunakan multiple thread"),
            QuestionOption(id: "d", textEN: "Use string interning", textID: "Gunakan string interning")
        ],
        correctOptionId: "a",
        explanationEN: "String concatenation creates new strings each time O(n²) total. Using a list and join() at the end avoids copying, achieving O(n).",
        explanationID: "Penggabungan string membuat string baru setiap kali O(n²) total. Menggunakan list dan join() di akhir menghindari penyalinan, mencapai O(n).",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt011",
        questionEN: "Which algorithm provides optimal solution for the 0/1 Knapsack problem?",
        questionID: "Algoritma mana yang memberikan solusi optimal untuk masalah 0/1 Knapsack?",
        options: [
            QuestionOption(id: "a", textEN: "Greedy (by value/weight ratio)", textID: "Greedy (berdasarkan rasio nilai/berat)"),
            QuestionOption(id: "b", textEN: "Dynamic Programming", textID: "Dynamic Programming"),
            QuestionOption(id: "c", textEN: "Simple recursion", textID: "Rekursi sederhana"),
            QuestionOption(id: "d", textEN: "Sorting by value", textID: "Sorting berdasarkan nilai")
        ],
        correctOptionId: "b",
        explanationEN: "Greedy doesn't guarantee optimal for 0/1 Knapsack. DP builds solution bottom-up, considering all combinations in O(nW) time where W is capacity.",
        explanationID: "Greedy tidak menjamin optimal untuk 0/1 Knapsack. DP membangun solusi bottom-up, mempertimbangkan semua kombinasi dalam waktu O(nW) di mana W adalah kapasitas.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt012",
        questionEN: "How does the Union-Find with path compression and union by rank optimize graph connectivity queries?",
        questionID: "Bagaimana Union-Find dengan path compression dan union by rank mengoptimalkan query konektivitas graf?",
        options: [
            QuestionOption(id: "a", textEN: "O(n) per query → O(1)", textID: "O(n) per query → O(1)"),
            QuestionOption(id: "b", textEN: "O(n) per query → O(log n)", textID: "O(n) per query → O(log n)"),
            QuestionOption(id: "c", textEN: "O(n) per query → Nearly O(1) amortized", textID: "O(n) per query → Hampir O(1) amortized"),
            QuestionOption(id: "d", textEN: "No improvement", textID: "Tidak ada peningkatan")
        ],
        correctOptionId: "c",
        explanationEN: "With both optimizations, Union-Find achieves O(α(n)) amortized time per operation, where α is the inverse Ackermann function (nearly constant).",
        explanationID: "Dengan kedua optimasi, Union-Find mencapai waktu O(α(n)) amortized per operasi, di mana α adalah fungsi inverse Ackermann (hampir konstan).",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt013",
        questionEN: "What is loop invariant code motion?",
        questionID: "Apa itu loop invariant code motion?",
        options: [
            QuestionOption(id: "a", textEN: "Moving code that doesn't change inside the loop to outside", textID: "Memindahkan kode yang tidak berubah di dalam loop ke luar"),
            QuestionOption(id: "b", textEN: "Unrolling loop iterations", textID: "Membuka iterasi loop"),
            QuestionOption(id: "c", textEN: "Parallelizing loop iterations", textID: "Memparalelkan iterasi loop"),
            QuestionOption(id: "d", textEN: "Removing unused loop variables", textID: "Menghapus variabel loop yang tidak digunakan")
        ],
        correctOptionId: "a",
        explanationEN: "Loop invariant code motion moves computations that produce the same result each iteration outside the loop, reducing redundant calculations.",
        explanationID: "Loop invariant code motion memindahkan komputasi yang menghasilkan hasil sama setiap iterasi ke luar loop, mengurangi perhitungan berulang.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt014",
        questionEN: "Which approach optimizes checking if a number is prime?",
        questionID: "Pendekatan mana yang mengoptimalkan pengecekan apakah suatu bilangan prima?",
        options: [
            QuestionOption(id: "a", textEN: "Check divisibility up to n", textID: "Cek keterbagian sampai n"),
            QuestionOption(id: "b", textEN: "Check divisibility up to n/2", textID: "Cek keterbagian sampai n/2"),
            QuestionOption(id: "c", textEN: "Check divisibility up to √n", textID: "Cek keterbagian sampai √n"),
            QuestionOption(id: "d", textEN: "Check only even divisors", textID: "Cek hanya pembagi genap")
        ],
        correctOptionId: "c",
        explanationEN: "If n has a factor greater than √n, it must have a corresponding factor less than √n. So checking up to √n is sufficient, reducing O(n) to O(√n).",
        explanationID: "Jika n memiliki faktor lebih besar dari √n, pasti ada faktor yang sesuai kurang dari √n. Jadi cek sampai √n sudah cukup, mengurangi O(n) ke O(√n).",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt015",
        questionEN: "What is the benefit of tail recursion optimization?",
        questionID: "Apa manfaat dari optimasi tail recursion?",
        options: [
            QuestionOption(id: "a", textEN: "Faster execution of recursive calls", textID: "Eksekusi panggilan rekursif lebih cepat"),
            QuestionOption(id: "b", textEN: "Converts recursion to iteration, saving stack space", textID: "Mengubah rekursi ke iterasi, menghemat ruang stack"),
            QuestionOption(id: "c", textEN: "Allows infinite recursion", textID: "Memungkinkan rekursi tak terbatas"),
            QuestionOption(id: "d", textEN: "Improves cache performance", textID: "Meningkatkan performa cache")
        ],
        correctOptionId: "b",
        explanationEN: "Tail recursion optimization reuses the current stack frame for the recursive call, effectively converting recursion to iteration and preventing stack overflow.",
        explanationID: "Optimasi tail recursion menggunakan kembali stack frame saat ini untuk panggilan rekursif, secara efektif mengubah rekursi ke iterasi dan mencegah stack overflow.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // MARK: - Code Efficiency (15 questions)
    Question(
        id: "opt016",
        questionEN: "Which is more efficient for checking if a key exists in a dictionary?\n```python\n# Option A\nif key in dict.keys():\n# Option B  \nif key in dict:\n```",
        questionID: "Mana yang lebih efisien untuk memeriksa apakah key ada dalam dictionary?\n```python\n# Opsi A\nif key in dict.keys():\n# Opsi B  \nif key in dict:\n```",
        options: [
            QuestionOption(id: "a", textEN: "Option A is faster", textID: "Opsi A lebih cepat"),
            QuestionOption(id: "b", textEN: "Option B is faster", textID: "Opsi B lebih cepat"),
            QuestionOption(id: "c", textEN: "Both are the same", textID: "Keduanya sama"),
            QuestionOption(id: "d", textEN: "Depends on dictionary size", textID: "Tergantung ukuran dictionary")
        ],
        correctOptionId: "b",
        explanationEN: "dict.keys() creates a view object in Python 3. 'key in dict' directly checks the hash table in O(1) average time without creating intermediate objects.",
        explanationID: "dict.keys() membuat objek view di Python 3. 'key in dict' langsung memeriksa hash table dalam waktu rata-rata O(1) tanpa membuat objek perantara.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt017",
        questionEN: "What is the issue with this code?\n```python\nresult = []\nfor item in large_list:\n    if item not in result:\n        result.append(item)\n```",
        questionID: "Apa masalah dengan kode ini?\n```python\nresult = []\nfor item in large_list:\n    if item not in result:\n        result.append(item)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Memory leak", textID: "Memory leak"),
            QuestionOption(id: "b", textEN: "O(n²) due to 'in' check on list", textID: "O(n²) karena cek 'in' pada list"),
            QuestionOption(id: "c", textEN: "Syntax error", textID: "Syntax error"),
            QuestionOption(id: "d", textEN: "No issue, this is optimal", textID: "Tidak ada masalah, ini sudah optimal")
        ],
        correctOptionId: "b",
        explanationEN: "Checking 'item not in result' on a list is O(n). With n items, total is O(n²). Use a set for O(1) lookup: seen = set(); if item not in seen.",
        explanationID: "Memeriksa 'item not in result' pada list adalah O(n). Dengan n item, total O(n²). Gunakan set untuk O(1) lookup: seen = set(); if item not in seen.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt018",
        questionEN: "Which is more memory-efficient for iterating over a large range?\n```python\n# Option A\nfor i in range(1000000):\n# Option B\nfor i in list(range(1000000)):\n```",
        questionID: "Mana yang lebih hemat memori untuk iterasi pada rentang besar?\n```python\n# Opsi A\nfor i in range(1000000):\n# Opsi B\nfor i in list(range(1000000)):\n```",
        options: [
            QuestionOption(id: "a", textEN: "Option A - range is a generator", textID: "Opsi A - range adalah generator"),
            QuestionOption(id: "b", textEN: "Option B - list is pre-allocated", textID: "Opsi B - list sudah dialokasikan"),
            QuestionOption(id: "c", textEN: "Both use the same memory", textID: "Keduanya menggunakan memori sama"),
            QuestionOption(id: "d", textEN: "Option B with garbage collection", textID: "Opsi B dengan garbage collection")
        ],
        correctOptionId: "a",
        explanationEN: "range() returns an iterator that generates values on-demand (O(1) memory). list(range()) creates all values in memory at once (O(n) memory).",
        explanationID: "range() mengembalikan iterator yang menghasilkan nilai sesuai permintaan (memori O(1)). list(range()) membuat semua nilai dalam memori sekaligus (memori O(n)).",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt019",
        questionEN: "How can you optimize repeated regex pattern matching?",
        questionID: "Bagaimana cara mengoptimalkan pencocokan pola regex berulang?",
        options: [
            QuestionOption(id: "a", textEN: "Use longer patterns", textID: "Gunakan pola lebih panjang"),
            QuestionOption(id: "b", textEN: "Compile the pattern once with re.compile()", textID: "Compile pola sekali dengan re.compile()"),
            QuestionOption(id: "c", textEN: "Use string methods instead", textID: "Gunakan metode string sebagai gantinya"),
            QuestionOption(id: "d", textEN: "Add more capture groups", textID: "Tambahkan lebih banyak capture group")
        ],
        correctOptionId: "b",
        explanationEN: "re.compile() parses and compiles the regex pattern once. Using the compiled pattern object avoids recompilation overhead for each match operation.",
        explanationID: "re.compile() mengurai dan mengompilasi pola regex sekali. Menggunakan objek pola yang dikompilasi menghindari overhead rekompilasi untuk setiap operasi pencocokan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt020",
        questionEN: "What is the most efficient way to count occurrences in a list?\n```python\nfrom collections import Counter\ndata = ['a', 'b', 'a', 'c', 'a', 'b']\n```",
        questionID: "Apa cara paling efisien untuk menghitung kemunculan dalam list?\n```python\nfrom collections import Counter\ndata = ['a', 'b', 'a', 'c', 'a', 'b']\n```",
        options: [
            QuestionOption(id: "a", textEN: "Manual dict with loops", textID: "Dict manual dengan loop"),
            QuestionOption(id: "b", textEN: "list.count() for each unique item", textID: "list.count() untuk setiap item unik"),
            QuestionOption(id: "c", textEN: "Counter(data)", textID: "Counter(data)"),
            QuestionOption(id: "d", textEN: "sorted() then count consecutive", textID: "sorted() lalu hitung berurutan")
        ],
        correctOptionId: "c",
        explanationEN: "Counter is optimized for this task in O(n) time. list.count() for each item is O(n²). Counter also provides useful methods like most_common().",
        explanationID: "Counter dioptimalkan untuk tugas ini dalam waktu O(n). list.count() untuk setiap item adalah O(n²). Counter juga menyediakan metode berguna seperti most_common().",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt021",
        questionEN: "What's wrong with this NumPy code?\n```python\nresult = np.zeros(1000)\nfor i in range(1000):\n    result[i] = arr1[i] + arr2[i]\n```",
        questionID: "Apa yang salah dengan kode NumPy ini?\n```python\nresult = np.zeros(1000)\nfor i in range(1000):\n    result[i] = arr1[i] + arr2[i]\n```",
        options: [
            QuestionOption(id: "a", textEN: "Incorrect array initialization", textID: "Inisialisasi array tidak benar"),
            QuestionOption(id: "b", textEN: "Should use vectorized operation: result = arr1 + arr2", textID: "Harus menggunakan operasi tervektorisasi: result = arr1 + arr2"),
            QuestionOption(id: "c", textEN: "Index out of bounds", textID: "Index di luar batas"),
            QuestionOption(id: "d", textEN: "Need to specify dtype", textID: "Perlu menentukan dtype")
        ],
        correctOptionId: "b",
        explanationEN: "Python loops over NumPy arrays are slow. Vectorized operations like arr1 + arr2 use optimized C code and SIMD instructions, often 10-100x faster.",
        explanationID: "Loop Python pada array NumPy lambat. Operasi tervektorisasi seperti arr1 + arr2 menggunakan kode C teroptimasi dan instruksi SIMD, sering 10-100x lebih cepat.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt022",
        questionEN: "How do you efficiently concatenate many Pandas DataFrames?",
        questionID: "Bagaimana cara menggabungkan banyak Pandas DataFrame secara efisien?",
        options: [
            QuestionOption(id: "a", textEN: "Use df.append() in a loop", textID: "Gunakan df.append() dalam loop"),
            QuestionOption(id: "b", textEN: "Collect all in a list, then pd.concat() once", textID: "Kumpulkan semua dalam list, lalu pd.concat() sekali"),
            QuestionOption(id: "c", textEN: "Use df = df + new_df", textID: "Gunakan df = df + new_df"),
            QuestionOption(id: "d", textEN: "Use merge for each DataFrame", textID: "Gunakan merge untuk setiap DataFrame")
        ],
        correctOptionId: "b",
        explanationEN: "df.append() creates a new DataFrame each time (O(n²) total). Collecting in a list and using pd.concat() once is O(n) and avoids repeated memory allocation.",
        explanationID: "df.append() membuat DataFrame baru setiap kali (total O(n²)). Mengumpulkan dalam list dan menggunakan pd.concat() sekali adalah O(n) dan menghindari alokasi memori berulang.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt023",
        questionEN: "What is the purpose of using __slots__ in a Python class?",
        questionID: "Apa tujuan menggunakan __slots__ dalam class Python?",
        options: [
            QuestionOption(id: "a", textEN: "To define class methods", textID: "Untuk mendefinisikan method class"),
            QuestionOption(id: "b", textEN: "To reduce memory usage by avoiding __dict__", textID: "Untuk mengurangi penggunaan memori dengan menghindari __dict__"),
            QuestionOption(id: "c", textEN: "To make attributes private", textID: "Untuk membuat atribut private"),
            QuestionOption(id: "d", textEN: "To enable inheritance", textID: "Untuk mengaktifkan inheritance")
        ],
        correctOptionId: "b",
        explanationEN: "__slots__ tells Python to use a fixed-size array instead of a dict for attributes. This saves ~40-50% memory per instance for classes with few attributes.",
        explanationID: "__slots__ memberitahu Python untuk menggunakan array ukuran tetap alih-alih dict untuk atribut. Ini menghemat ~40-50% memori per instance untuk class dengan sedikit atribut.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt024",
        questionEN: "Which approach is faster for checking if any element in a list satisfies a condition?",
        questionID: "Pendekatan mana yang lebih cepat untuk memeriksa apakah ada elemen dalam list yang memenuhi kondisi?",
        options: [
            QuestionOption(id: "a", textEN: "any(x > 10 for x in lst)", textID: "any(x > 10 for x in lst)"),
            QuestionOption(id: "b", textEN: "len([x for x in lst if x > 10]) > 0", textID: "len([x for x in lst if x > 10]) > 0"),
            QuestionOption(id: "c", textEN: "bool([x for x in lst if x > 10])", textID: "bool([x for x in lst if x > 10])"),
            QuestionOption(id: "d", textEN: "All are equivalent", textID: "Semua sama saja")
        ],
        correctOptionId: "a",
        explanationEN: "any() short-circuits on first True value. List comprehensions process all elements before checking. For large lists with early matches, any() can be much faster.",
        explanationID: "any() berhenti pada nilai True pertama. List comprehension memproses semua elemen sebelum memeriksa. Untuk list besar dengan kecocokan awal, any() bisa jauh lebih cepat.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt025",
        questionEN: "How do you optimize this nested loop for matrix multiplication?\n```python\nfor i in range(n):\n    for j in range(n):\n        for k in range(n):\n            C[i][j] += A[i][k] * B[k][j]\n```",
        questionID: "Bagaimana cara mengoptimalkan nested loop ini untuk perkalian matriks?\n```python\nfor i in range(n):\n    for j in range(n):\n        for k in range(n):\n            C[i][j] += A[i][k] * B[k][j]\n```",
        options: [
            QuestionOption(id: "a", textEN: "Use NumPy: C = A @ B or np.dot(A, B)", textID: "Gunakan NumPy: C = A @ B atau np.dot(A, B)"),
            QuestionOption(id: "b", textEN: "Unroll the inner loop", textID: "Buka inner loop"),
            QuestionOption(id: "c", textEN: "Use recursion instead", textID: "Gunakan rekursi sebagai gantinya"),
            QuestionOption(id: "d", textEN: "This is already optimal", textID: "Ini sudah optimal")
        ],
        correctOptionId: "a",
        explanationEN: "NumPy uses highly optimized BLAS libraries for matrix operations. np.dot() or @ operator can be 100-1000x faster than Python loops.",
        explanationID: "NumPy menggunakan library BLAS yang sangat teroptimasi untuk operasi matriks. np.dot() atau operator @ bisa 100-1000x lebih cepat dari loop Python.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt026",
        questionEN: "What's the benefit of using `lru_cache` decorator in Python?",
        questionID: "Apa manfaat menggunakan decorator `lru_cache` di Python?",
        options: [
            QuestionOption(id: "a", textEN: "Faster function compilation", textID: "Kompilasi fungsi lebih cepat"),
            QuestionOption(id: "b", textEN: "Caches function results to avoid recomputation", textID: "Menyimpan hasil fungsi untuk menghindari perhitungan ulang"),
            QuestionOption(id: "c", textEN: "Reduces function parameters", textID: "Mengurangi parameter fungsi"),
            QuestionOption(id: "d", textEN: "Enables parallel execution", textID: "Mengaktifkan eksekusi paralel")
        ],
        correctOptionId: "b",
        explanationEN: "lru_cache memoizes function results based on arguments. Subsequent calls with same arguments return cached results in O(1) instead of recomputing.",
        explanationID: "lru_cache menyimpan hasil fungsi berdasarkan argumen. Panggilan berikutnya dengan argumen sama mengembalikan hasil cache dalam O(1) alih-alih menghitung ulang.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt027",
        questionEN: "Which list operation is O(1) in Python?",
        questionID: "Operasi list mana yang O(1) di Python?",
        options: [
            QuestionOption(id: "a", textEN: "list.insert(0, item)", textID: "list.insert(0, item)"),
            QuestionOption(id: "b", textEN: "list.pop(0)", textID: "list.pop(0)"),
            QuestionOption(id: "c", textEN: "list.append(item)", textID: "list.append(item)"),
            QuestionOption(id: "d", textEN: "list.remove(item)", textID: "list.remove(item)")
        ],
        correctOptionId: "c",
        explanationEN: "append() adds to the end in amortized O(1). insert(0), pop(0), and remove() require shifting elements, making them O(n). Use collections.deque for O(1) operations at both ends.",
        explanationID: "append() menambahkan ke akhir dalam O(1) amortized. insert(0), pop(0), dan remove() memerlukan pergeseran elemen, menjadi O(n). Gunakan collections.deque untuk operasi O(1) di kedua ujung.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt028",
        questionEN: "What does 'lazy evaluation' mean and how does it improve performance?",
        questionID: "Apa arti 'lazy evaluation' dan bagaimana meningkatkan performa?",
        options: [
            QuestionOption(id: "a", textEN: "Delaying computation until the result is needed", textID: "Menunda komputasi sampai hasilnya diperlukan"),
            QuestionOption(id: "b", textEN: "Running computations in background", textID: "Menjalankan komputasi di background"),
            QuestionOption(id: "c", textEN: "Caching all intermediate results", textID: "Menyimpan semua hasil perantara"),
            QuestionOption(id: "d", textEN: "Parallel computation of expressions", textID: "Komputasi paralel dari ekspresi")
        ],
        correctOptionId: "a",
        explanationEN: "Lazy evaluation computes values only when needed. This saves memory and time by avoiding unnecessary computations. Python generators and itertools use this pattern.",
        explanationID: "Lazy evaluation menghitung nilai hanya saat diperlukan. Ini menghemat memori dan waktu dengan menghindari komputasi yang tidak diperlukan. Generator Python dan itertools menggunakan pola ini.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt029",
        questionEN: "How would you optimize checking if two large lists have common elements?",
        questionID: "Bagaimana cara mengoptimalkan pengecekan apakah dua list besar memiliki elemen yang sama?",
        options: [
            QuestionOption(id: "a", textEN: "Nested loops checking each pair", textID: "Nested loop memeriksa setiap pasangan"),
            QuestionOption(id: "b", textEN: "Sort both lists and use two pointers", textID: "Urutkan kedua list dan gunakan two pointer"),
            QuestionOption(id: "c", textEN: "Convert to sets and check intersection", textID: "Ubah ke set dan cek intersection"),
            QuestionOption(id: "d", textEN: "Use binary search on each element", textID: "Gunakan binary search pada setiap elemen")
        ],
        correctOptionId: "c",
        explanationEN: "Set intersection is O(min(len(a), len(b))). Nested loops are O(n×m). For checking existence: bool(set(a) & set(b)) is fastest for large lists.",
        explanationID: "Set intersection adalah O(min(len(a), len(b))). Nested loop adalah O(n×m). Untuk memeriksa keberadaan: bool(set(a) & set(b)) tercepat untuk list besar.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt030",
        questionEN: "What's the time complexity difference between dict comprehension and loop-based dict creation?",
        questionID: "Apa perbedaan kompleksitas waktu antara dict comprehension dan pembuatan dict berbasis loop?",
        options: [
            QuestionOption(id: "a", textEN: "Comprehension is O(n), loop is O(n²)", textID: "Comprehension O(n), loop O(n²)"),
            QuestionOption(id: "b", textEN: "Same complexity, but comprehension has lower constant factors", textID: "Kompleksitas sama, tapi comprehension memiliki faktor konstan lebih rendah"),
            QuestionOption(id: "c", textEN: "Loop is faster due to optimization", textID: "Loop lebih cepat karena optimasi"),
            QuestionOption(id: "d", textEN: "Comprehension uses more memory", textID: "Comprehension menggunakan lebih banyak memori")
        ],
        correctOptionId: "b",
        explanationEN: "Both are O(n), but dict comprehensions are faster due to specialized bytecode (BUILD_MAP) and avoiding repeated method lookups in the loop.",
        explanationID: "Keduanya O(n), tapi dict comprehension lebih cepat karena bytecode khusus (BUILD_MAP) dan menghindari method lookup berulang dalam loop.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    // MARK: - ML/AI Optimization (10 questions)
    Question(
        id: "opt031",
        questionEN: "Which technique reduces neural network training time by using lower precision arithmetic?",
        questionID: "Teknik mana yang mengurangi waktu training neural network dengan menggunakan aritmatika presisi lebih rendah?",
        options: [
            QuestionOption(id: "a", textEN: "Dropout", textID: "Dropout"),
            QuestionOption(id: "b", textEN: "Mixed precision training (FP16/FP32)", textID: "Mixed precision training (FP16/FP32)"),
            QuestionOption(id: "c", textEN: "Batch normalization", textID: "Batch normalization"),
            QuestionOption(id: "d", textEN: "Weight decay", textID: "Weight decay")
        ],
        correctOptionId: "b",
        explanationEN: "Mixed precision uses FP16 for forward/backward passes and FP32 for weight updates. This reduces memory usage and speeds up computation on GPUs with Tensor Cores.",
        explanationID: "Mixed precision menggunakan FP16 untuk forward/backward pass dan FP32 untuk update bobot. Ini mengurangi penggunaan memori dan mempercepat komputasi pada GPU dengan Tensor Cores.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt032",
        questionEN: "What is gradient checkpointing used for?",
        questionID: "Untuk apa gradient checkpointing digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Faster gradient computation", textID: "Komputasi gradien lebih cepat"),
            QuestionOption(id: "b", textEN: "Trading computation for memory - recompute instead of store", textID: "Menukar komputasi dengan memori - hitung ulang alih-alih simpan"),
            QuestionOption(id: "c", textEN: "Preventing gradient explosion", textID: "Mencegah gradient explosion"),
            QuestionOption(id: "d", textEN: "Validating gradient correctness", textID: "Memvalidasi kebenaran gradien")
        ],
        correctOptionId: "b",
        explanationEN: "Gradient checkpointing saves memory by not storing all activations. It recomputes them during backward pass. Trades ~30% more compute for ~5x less memory.",
        explanationID: "Gradient checkpointing menghemat memori dengan tidak menyimpan semua aktivasi. Ini menghitung ulang saat backward pass. Menukar ~30% lebih banyak komputasi untuk ~5x lebih sedikit memori.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt033",
        questionEN: "How does batch size affect training optimization?",
        questionID: "Bagaimana batch size mempengaruhi optimasi training?",
        options: [
            QuestionOption(id: "a", textEN: "Larger batch = more memory, more GPU parallelism, but may need learning rate adjustment", textID: "Batch lebih besar = lebih banyak memori, lebih banyak paralelisme GPU, tapi mungkin perlu penyesuaian learning rate"),
            QuestionOption(id: "b", textEN: "Batch size doesn't affect training speed", textID: "Batch size tidak mempengaruhi kecepatan training"),
            QuestionOption(id: "c", textEN: "Smaller batch is always faster", textID: "Batch lebih kecil selalu lebih cepat"),
            QuestionOption(id: "d", textEN: "Batch size only affects accuracy, not speed", textID: "Batch size hanya mempengaruhi akurasi, bukan kecepatan")
        ],
        correctOptionId: "a",
        explanationEN: "Larger batches utilize GPU parallelism better, increasing throughput. But they require more memory and often need higher learning rates or warmup. There's a trade-off to optimize.",
        explanationID: "Batch lebih besar memanfaatkan paralelisme GPU lebih baik, meningkatkan throughput. Tapi memerlukan lebih banyak memori dan sering perlu learning rate lebih tinggi atau warmup. Ada trade-off yang perlu dioptimalkan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt034",
        questionEN: "What is the purpose of model quantization?",
        questionID: "Apa tujuan dari kuantisasi model?",
        options: [
            QuestionOption(id: "a", textEN: "Increase model accuracy", textID: "Meningkatkan akurasi model"),
            QuestionOption(id: "b", textEN: "Reduce model size and inference time by using lower precision weights", textID: "Mengurangi ukuran model dan waktu inferensi dengan menggunakan bobot presisi lebih rendah"),
            QuestionOption(id: "c", textEN: "Add more parameters to the model", textID: "Menambah lebih banyak parameter ke model"),
            QuestionOption(id: "d", textEN: "Convert model to different framework", textID: "Mengubah model ke framework berbeda")
        ],
        correctOptionId: "b",
        explanationEN: "Quantization converts weights from FP32 to INT8 or lower. This reduces model size by 4x and speeds up inference, with minimal accuracy loss when done carefully.",
        explanationID: "Kuantisasi mengubah bobot dari FP32 ke INT8 atau lebih rendah. Ini mengurangi ukuran model 4x dan mempercepat inferensi, dengan kehilangan akurasi minimal jika dilakukan dengan hati-hati.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt035",
        questionEN: "Which optimizer typically converges faster than vanilla SGD?",
        questionID: "Optimizer mana yang biasanya konvergen lebih cepat dari SGD vanilla?",
        options: [
            QuestionOption(id: "a", textEN: "SGD with momentum", textID: "SGD dengan momentum"),
            QuestionOption(id: "b", textEN: "Adam (Adaptive Moment Estimation)", textID: "Adam (Adaptive Moment Estimation)"),
            QuestionOption(id: "c", textEN: "Both A and B", textID: "Keduanya A dan B"),
            QuestionOption(id: "d", textEN: "Neither, vanilla SGD is fastest", textID: "Keduanya tidak, SGD vanilla tercepat")
        ],
        correctOptionId: "c",
        explanationEN: "Both momentum and Adam accelerate convergence. Momentum builds velocity in consistent directions. Adam adapts learning rates per parameter using first and second moment estimates.",
        explanationID: "Baik momentum maupun Adam mempercepat konvergensi. Momentum membangun kecepatan dalam arah konsisten. Adam menyesuaikan learning rate per parameter menggunakan estimasi momen pertama dan kedua.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt036",
        questionEN: "How does knowledge distillation optimize model deployment?",
        questionID: "Bagaimana knowledge distillation mengoptimalkan deployment model?",
        options: [
            QuestionOption(id: "a", textEN: "By training a smaller 'student' model to mimic a larger 'teacher' model", textID: "Dengan melatih model 'student' lebih kecil untuk meniru model 'teacher' lebih besar"),
            QuestionOption(id: "b", textEN: "By removing unused layers", textID: "Dengan menghapus layer yang tidak digunakan"),
            QuestionOption(id: "c", textEN: "By compressing weight matrices", textID: "Dengan mengkompresi matriks bobot"),
            QuestionOption(id: "d", textEN: "By using ensemble models", textID: "Dengan menggunakan model ensemble")
        ],
        correctOptionId: "a",
        explanationEN: "Knowledge distillation trains a smaller student network to match the soft outputs of a larger teacher. The student achieves comparable accuracy with fewer parameters.",
        explanationID: "Knowledge distillation melatih jaringan student yang lebih kecil untuk mencocokkan output soft dari teacher yang lebih besar. Student mencapai akurasi sebanding dengan parameter lebih sedikit.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt037",
        questionEN: "What is the benefit of using DataLoader with num_workers > 0 in PyTorch?",
        questionID: "Apa manfaat menggunakan DataLoader dengan num_workers > 0 di PyTorch?",
        options: [
            QuestionOption(id: "a", textEN: "Parallel data loading while GPU computes", textID: "Loading data paralel saat GPU menghitung"),
            QuestionOption(id: "b", textEN: "Faster model training", textID: "Training model lebih cepat"),
            QuestionOption(id: "c", textEN: "Better model accuracy", textID: "Akurasi model lebih baik"),
            QuestionOption(id: "d", textEN: "Reduced memory usage", textID: "Penggunaan memori lebih sedikit")
        ],
        correctOptionId: "a",
        explanationEN: "Multiple workers load and preprocess data in parallel processes while GPU trains on current batch. This hides data loading latency and improves GPU utilization.",
        explanationID: "Multiple worker memuat dan memproses data dalam proses paralel saat GPU melatih batch saat ini. Ini menyembunyikan latensi loading data dan meningkatkan utilisasi GPU.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt038",
        questionEN: "What is pruning in neural network optimization?",
        questionID: "Apa itu pruning dalam optimasi neural network?",
        options: [
            QuestionOption(id: "a", textEN: "Removing connections/neurons with low importance", textID: "Menghapus koneksi/neuron dengan kepentingan rendah"),
            QuestionOption(id: "b", textEN: "Adding more layers", textID: "Menambah lebih banyak layer"),
            QuestionOption(id: "c", textEN: "Increasing learning rate", textID: "Meningkatkan learning rate"),
            QuestionOption(id: "d", textEN: "Changing activation functions", textID: "Mengubah fungsi aktivasi")
        ],
        correctOptionId: "a",
        explanationEN: "Pruning removes weights close to zero or neurons with low activation. This reduces model size and computation while maintaining most of the accuracy.",
        explanationID: "Pruning menghapus bobot mendekati nol atau neuron dengan aktivasi rendah. Ini mengurangi ukuran model dan komputasi sambil mempertahankan sebagian besar akurasi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt039",
        questionEN: "How does early stopping optimize training?",
        questionID: "Bagaimana early stopping mengoptimalkan training?",
        options: [
            QuestionOption(id: "a", textEN: "Stops when loss reaches zero", textID: "Berhenti saat loss mencapai nol"),
            QuestionOption(id: "b", textEN: "Stops when validation performance stops improving, preventing overfitting", textID: "Berhenti saat performa validasi berhenti membaik, mencegah overfitting"),
            QuestionOption(id: "c", textEN: "Stops after fixed number of epochs", textID: "Berhenti setelah jumlah epoch tetap"),
            QuestionOption(id: "d", textEN: "Stops when GPU memory is full", textID: "Berhenti saat memori GPU penuh")
        ],
        correctOptionId: "b",
        explanationEN: "Early stopping monitors validation loss/accuracy and stops training when it stops improving for a patience period. This saves time and prevents overfitting.",
        explanationID: "Early stopping memantau loss/akurasi validasi dan menghentikan training saat berhenti membaik selama periode patience. Ini menghemat waktu dan mencegah overfitting.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt040",
        questionEN: "What's the purpose of learning rate warmup?",
        questionID: "Apa tujuan dari learning rate warmup?",
        options: [
            QuestionOption(id: "a", textEN: "Gradually increase LR at start to avoid early instability with large batches", textID: "Secara bertahap meningkatkan LR di awal untuk menghindari ketidakstabilan awal dengan batch besar"),
            QuestionOption(id: "b", textEN: "Increase temperature of GPU", textID: "Meningkatkan suhu GPU"),
            QuestionOption(id: "c", textEN: "Pre-train the optimizer", textID: "Pre-train optimizer"),
            QuestionOption(id: "d", textEN: "Initialize weights to warm state", textID: "Inisialisasi bobot ke state hangat")
        ],
        correctOptionId: "a",
        explanationEN: "Warmup starts with small LR and gradually increases. This stabilizes training in early epochs when gradients are noisy, especially important for large batch training.",
        explanationID: "Warmup dimulai dengan LR kecil dan meningkat bertahap. Ini menstabilkan training di epoch awal saat gradien berisik, terutama penting untuk training batch besar.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // MARK: - Mathematical Optimization (10 questions)
    Question(
        id: "opt041",
        questionEN: "What is the gradient descent update rule?",
        questionID: "Apa aturan update gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "θ = θ + α∇f(θ)", textID: "θ = θ + α∇f(θ)"),
            QuestionOption(id: "b", textEN: "θ = θ - α∇f(θ)", textID: "θ = θ - α∇f(θ)"),
            QuestionOption(id: "c", textEN: "θ = α∇f(θ)", textID: "θ = α∇f(θ)"),
            QuestionOption(id: "d", textEN: "θ = θ / ∇f(θ)", textID: "θ = θ / ∇f(θ)")
        ],
        correctOptionId: "b",
        explanationEN: "Gradient descent moves in the negative gradient direction (steepest descent). θ = θ - α∇f(θ) where α is the learning rate and ∇f(θ) is the gradient.",
        explanationID: "Gradient descent bergerak dalam arah gradien negatif (steepest descent). θ = θ - α∇f(θ) di mana α adalah learning rate dan ∇f(θ) adalah gradien.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt042",
        questionEN: "For a convex function, what can be said about local minima?",
        questionID: "Untuk fungsi konveks, apa yang bisa dikatakan tentang local minima?",
        options: [
            QuestionOption(id: "a", textEN: "There can be multiple local minima", textID: "Bisa ada beberapa local minima"),
            QuestionOption(id: "b", textEN: "Any local minimum is also a global minimum", textID: "Setiap local minimum juga adalah global minimum"),
            QuestionOption(id: "c", textEN: "Local minima don't exist", textID: "Local minima tidak ada"),
            QuestionOption(id: "d", textEN: "Local minima are always at boundaries", textID: "Local minima selalu di batas")
        ],
        correctOptionId: "b",
        explanationEN: "Convex functions have a single global minimum. Any local minimum found by gradient descent is guaranteed to be the global minimum - a key advantage in optimization.",
        explanationID: "Fungsi konveks memiliki satu global minimum. Setiap local minimum yang ditemukan oleh gradient descent dijamin menjadi global minimum - keuntungan utama dalam optimasi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt043",
        questionEN: "What problem does stochastic gradient descent (SGD) solve compared to batch gradient descent?",
        questionID: "Masalah apa yang dipecahkan stochastic gradient descent (SGD) dibanding batch gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "Better accuracy", textID: "Akurasi lebih baik"),
            QuestionOption(id: "b", textEN: "Faster iterations by using single/mini-batch samples", textID: "Iterasi lebih cepat dengan menggunakan sampel single/mini-batch"),
            QuestionOption(id: "c", textEN: "Guaranteed convergence", textID: "Konvergensi terjamin"),
            QuestionOption(id: "d", textEN: "No local minima", textID: "Tidak ada local minima")
        ],
        correctOptionId: "b",
        explanationEN: "Batch GD computes gradient over entire dataset per step. SGD uses single or mini-batch samples, making each iteration much faster. Noise can also help escape local minima.",
        explanationID: "Batch GD menghitung gradien pada seluruh dataset per langkah. SGD menggunakan sampel single atau mini-batch, membuat setiap iterasi jauh lebih cepat. Noise juga bisa membantu keluar dari local minima.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt044",
        questionEN: "What is the purpose of regularization in optimization?",
        questionID: "Apa tujuan regularisasi dalam optimasi?",
        options: [
            QuestionOption(id: "a", textEN: "Speed up training", textID: "Mempercepat training"),
            QuestionOption(id: "b", textEN: "Prevent overfitting by penalizing complex models", textID: "Mencegah overfitting dengan memberikan penalti pada model kompleks"),
            QuestionOption(id: "c", textEN: "Increase model capacity", textID: "Meningkatkan kapasitas model"),
            QuestionOption(id: "d", textEN: "Fix numerical instability", textID: "Memperbaiki ketidakstabilan numerik")
        ],
        correctOptionId: "b",
        explanationEN: "Regularization adds a penalty term (L1/L2) to the loss function that discourages large weights. This constrains model complexity and improves generalization.",
        explanationID: "Regularisasi menambahkan term penalti (L1/L2) ke fungsi loss yang menghindari bobot besar. Ini membatasi kompleksitas model dan meningkatkan generalisasi.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    Question(
        id: "opt045",
        questionEN: "What is the difference between L1 and L2 regularization?",
        questionID: "Apa perbedaan antara regularisasi L1 dan L2?",
        options: [
            QuestionOption(id: "a", textEN: "L1 produces sparse weights (feature selection), L2 produces small weights", textID: "L1 menghasilkan bobot sparse (seleksi fitur), L2 menghasilkan bobot kecil"),
            QuestionOption(id: "b", textEN: "L1 is faster, L2 is more accurate", textID: "L1 lebih cepat, L2 lebih akurat"),
            QuestionOption(id: "c", textEN: "L1 is for classification, L2 for regression", textID: "L1 untuk klasifikasi, L2 untuk regresi"),
            QuestionOption(id: "d", textEN: "They are mathematically equivalent", textID: "Keduanya secara matematis sama")
        ],
        correctOptionId: "a",
        explanationEN: "L1 (|w|) tends to push weights to exactly zero, creating sparse models. L2 (w²) shrinks weights toward zero but rarely makes them exactly zero. L1 acts as feature selection.",
        explanationID: "L1 (|w|) cenderung mendorong bobot ke tepat nol, menciptakan model sparse. L2 (w²) mengecilkan bobot mendekati nol tapi jarang membuatnya tepat nol. L1 bertindak sebagai seleksi fitur.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt046",
        questionEN: "What is a saddle point in optimization?",
        questionID: "Apa itu saddle point dalam optimasi?",
        options: [
            QuestionOption(id: "a", textEN: "A global minimum", textID: "Global minimum"),
            QuestionOption(id: "b", textEN: "A point where gradient is zero but it's neither min nor max", textID: "Titik di mana gradien nol tapi bukan min maupun max"),
            QuestionOption(id: "c", textEN: "A local maximum", textID: "Local maximum"),
            QuestionOption(id: "d", textEN: "An infeasible point", textID: "Titik tidak layak")
        ],
        correctOptionId: "b",
        explanationEN: "A saddle point has zero gradient (looks like a minimum in some directions and maximum in others). SGD's noise helps escape saddle points in high-dimensional optimization.",
        explanationID: "Saddle point memiliki gradien nol (terlihat seperti minimum di beberapa arah dan maksimum di arah lain). Noise SGD membantu keluar dari saddle point dalam optimasi dimensi tinggi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt047",
        questionEN: "How does Newton's method differ from gradient descent?",
        questionID: "Bagaimana Newton's method berbeda dari gradient descent?",
        options: [
            QuestionOption(id: "a", textEN: "Newton's uses first derivative only", textID: "Newton hanya menggunakan turunan pertama"),
            QuestionOption(id: "b", textEN: "Newton's uses second derivative (Hessian) for faster convergence", textID: "Newton menggunakan turunan kedua (Hessian) untuk konvergensi lebih cepat"),
            QuestionOption(id: "c", textEN: "Newton's is always slower", textID: "Newton selalu lebih lambat"),
            QuestionOption(id: "d", textEN: "They are the same algorithm", textID: "Keduanya algoritma yang sama")
        ],
        correctOptionId: "b",
        explanationEN: "Newton's method uses the Hessian (second derivative) to find better step directions. It converges quadratically near optimum but is expensive for high dimensions (O(n³) per step).",
        explanationID: "Newton's method menggunakan Hessian (turunan kedua) untuk menemukan arah langkah lebih baik. Konvergen kuadratik dekat optimum tapi mahal untuk dimensi tinggi (O(n³) per langkah).",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    Question(
        id: "opt048",
        questionEN: "What is the purpose of learning rate scheduling?",
        questionID: "Apa tujuan dari learning rate scheduling?",
        options: [
            QuestionOption(id: "a", textEN: "Keep learning rate constant throughout", textID: "Menjaga learning rate konstan"),
            QuestionOption(id: "b", textEN: "Decrease learning rate over time for fine-grained convergence", textID: "Menurunkan learning rate seiring waktu untuk konvergensi yang lebih halus"),
            QuestionOption(id: "c", textEN: "Increase learning rate to escape local minima", textID: "Meningkatkan learning rate untuk keluar dari local minima"),
            QuestionOption(id: "d", textEN: "Remove learning rate parameter", textID: "Menghapus parameter learning rate")
        ],
        correctOptionId: "b",
        explanationEN: "LR scheduling (step decay, cosine annealing) starts with high LR for fast progress and reduces it for fine-tuning near the optimum. This often improves final performance.",
        explanationID: "LR scheduling (step decay, cosine annealing) dimulai dengan LR tinggi untuk kemajuan cepat dan menguranginya untuk fine-tuning dekat optimum. Ini sering meningkatkan performa akhir.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt049",
        questionEN: "What is the vanishing gradient problem?",
        questionID: "Apa masalah vanishing gradient?",
        options: [
            QuestionOption(id: "a", textEN: "Gradients become too large", textID: "Gradien menjadi terlalu besar"),
            QuestionOption(id: "b", textEN: "Gradients become extremely small, preventing learning in early layers", textID: "Gradien menjadi sangat kecil, mencegah learning di layer awal"),
            QuestionOption(id: "c", textEN: "Gradients oscillate randomly", textID: "Gradien berosilasi secara acak"),
            QuestionOption(id: "d", textEN: "Gradients become negative", textID: "Gradien menjadi negatif")
        ],
        correctOptionId: "b",
        explanationEN: "In deep networks with sigmoid/tanh, gradients shrink exponentially through layers during backprop. Early layers barely update. ReLU, residual connections, and normalization help.",
        explanationID: "Di jaringan dalam dengan sigmoid/tanh, gradien menyusut secara eksponensial melalui layer saat backprop. Layer awal hampir tidak update. ReLU, residual connection, dan normalisasi membantu.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    Question(
        id: "opt050",
        questionEN: "What is the purpose of momentum in optimization?",
        questionID: "Apa tujuan momentum dalam optimasi?",
        options: [
            QuestionOption(id: "a", textEN: "Accumulate gradients to smooth updates and accelerate convergence", textID: "Mengakumulasi gradien untuk memperhalus update dan mempercepat konvergensi"),
            QuestionOption(id: "b", textEN: "Randomly perturb gradients", textID: "Mengganggu gradien secara acak"),
            QuestionOption(id: "c", textEN: "Clip large gradients", textID: "Memotong gradien besar"),
            QuestionOption(id: "d", textEN: "Normalize gradients", textID: "Menormalisasi gradien")
        ],
        correctOptionId: "a",
        explanationEN: "Momentum maintains a moving average of gradients: v = βv + ∇f(θ), θ = θ - αv. This smooths oscillations and accelerates movement in consistent gradient directions.",
        explanationID: "Momentum mempertahankan rata-rata bergerak dari gradien: v = βv + ∇f(θ), θ = θ - αv. Ini memperhalus osilasi dan mempercepat pergerakan dalam arah gradien yang konsisten.",
        topic: "problemSolving",
        difficulty: .intermediate
    )
]
