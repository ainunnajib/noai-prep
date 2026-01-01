import Foundation

// MARK: - Problem Solving: Algorithm Design Questions (50 questions)
// Subcategory: Data structures, algorithms, complexity analysis, problem-solving strategies

let algorithmDesignQuestions: [Question] = [
    // Batch 1: Complexity Analysis (10 questions)
    Question(
        id: "algo001",
        questionEN: "What is Big O notation used for?",
        questionID: "Untuk apa notasi Big O digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Describing the upper bound of algorithm time/space complexity", textID: "Menjelaskan batas atas kompleksitas waktu/ruang algoritma"),
            QuestionOption(id: "b", textEN: "Counting the exact number of operations", textID: "Menghitung jumlah operasi yang tepat"),
            QuestionOption(id: "c", textEN: "Measuring code quality", textID: "Mengukur kualitas kode"),
            QuestionOption(id: "d", textEN: "Determining the minimum runtime", textID: "Menentukan runtime minimum")
        ],
        correctOptionId: "a",
        explanationEN: "Big O notation describes the upper bound of an algorithm's growth rate, showing how runtime/space scales with input size in the worst case.",
        explanationID: "Notasi Big O menjelaskan batas atas tingkat pertumbuhan algoritma, menunjukkan bagaimana runtime/ruang berskala dengan ukuran input dalam kasus terburuk.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo002",
        questionEN: "What is the time complexity of accessing an element in an array by index?",
        questionID: "Berapa kompleksitas waktu mengakses elemen dalam array berdasarkan indeks?",
        options: [
            QuestionOption(id: "a", textEN: "O(1)", textID: "O(1)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "d", textEN: "O(n²)", textID: "O(n²)")
        ],
        correctOptionId: "a",
        explanationEN: "Array access by index is O(1) constant time because the memory location can be calculated directly from the base address and index.",
        explanationID: "Akses array berdasarkan indeks adalah O(1) waktu konstan karena lokasi memori dapat dihitung langsung dari alamat dasar dan indeks.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo003",
        questionEN: "What is the time complexity of linear search in an unsorted array of n elements?",
        questionID: "Berapa kompleksitas waktu pencarian linear dalam array tidak terurut dengan n elemen?",
        options: [
            QuestionOption(id: "a", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "b", textEN: "O(1)", textID: "O(1)"),
            QuestionOption(id: "c", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "d", textEN: "O(n log n)", textID: "O(n log n)")
        ],
        correctOptionId: "a",
        explanationEN: "Linear search checks each element one by one, so in the worst case (element at end or not present), it checks all n elements: O(n).",
        explanationID: "Pencarian linear memeriksa setiap elemen satu per satu, jadi dalam kasus terburuk (elemen di akhir atau tidak ada), ia memeriksa semua n elemen: O(n).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo004",
        questionEN: "What is the time complexity of binary search in a sorted array?",
        questionID: "Berapa kompleksitas waktu pencarian biner dalam array terurut?",
        options: [
            QuestionOption(id: "a", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(1)", textID: "O(1)"),
            QuestionOption(id: "d", textEN: "O(n²)", textID: "O(n²)")
        ],
        correctOptionId: "a",
        explanationEN: "Binary search halves the search space each step. After k steps, we have n/2^k elements. When n/2^k = 1, k = log₂(n).",
        explanationID: "Pencarian biner membagi ruang pencarian menjadi dua setiap langkah. Setelah k langkah, kita memiliki n/2^k elemen. Ketika n/2^k = 1, k = log₂(n).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo005",
        questionEN: "Which of the following represents the fastest growing complexity?",
        questionID: "Mana dari berikut ini yang mewakili kompleksitas dengan pertumbuhan tercepat?",
        options: [
            QuestionOption(id: "a", textEN: "O(2^n)", textID: "O(2^n)"),
            QuestionOption(id: "b", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "c", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "d", textEN: "O(n³)", textID: "O(n³)")
        ],
        correctOptionId: "a",
        explanationEN: "Exponential O(2^n) grows fastest. Order from slowest to fastest: O(n log n) < O(n²) < O(n³) < O(2^n).",
        explanationID: "Eksponensial O(2^n) tumbuh paling cepat. Urutan dari paling lambat ke paling cepat: O(n log n) < O(n²) < O(n³) < O(2^n).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo006",
        questionEN: "What is the time complexity of nested loops where both iterate n times?",
        questionID: "Berapa kompleksitas waktu loop bersarang dimana keduanya beriterasi n kali?",
        options: [
            QuestionOption(id: "a", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(2n)", textID: "O(2n)"),
            QuestionOption(id: "d", textEN: "O(n + n)", textID: "O(n + n)")
        ],
        correctOptionId: "a",
        explanationEN: "When one loop runs n times and contains another loop that also runs n times, the total operations are n × n = n².",
        explanationID: "Ketika satu loop berjalan n kali dan berisi loop lain yang juga berjalan n kali, total operasi adalah n × n = n².",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo007",
        questionEN: "What is space complexity?",
        questionID: "Apa itu kompleksitas ruang?",
        options: [
            QuestionOption(id: "a", textEN: "The amount of memory an algorithm uses relative to input size", textID: "Jumlah memori yang digunakan algoritma relatif terhadap ukuran input"),
            QuestionOption(id: "b", textEN: "The physical space the code takes", textID: "Ruang fisik yang diambil kode"),
            QuestionOption(id: "c", textEN: "The distance between data centers", textID: "Jarak antara data center"),
            QuestionOption(id: "d", textEN: "The number of lines of code", textID: "Jumlah baris kode")
        ],
        correctOptionId: "a",
        explanationEN: "Space complexity measures the total memory (including auxiliary space) an algorithm needs as a function of input size.",
        explanationID: "Kompleksitas ruang mengukur total memori (termasuk ruang auxiliary) yang dibutuhkan algoritma sebagai fungsi dari ukuran input.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo008",
        questionEN: "What is the time complexity of this code: for i in range(n): for j in range(i): print(i,j)?",
        questionID: "Berapa kompleksitas waktu kode ini: for i in range(n): for j in range(i): print(i,j)?",
        options: [
            QuestionOption(id: "a", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "d", textEN: "O(n³)", textID: "O(n³)")
        ],
        correctOptionId: "a",
        explanationEN: "The inner loop runs 0+1+2+...+(n-1) = n(n-1)/2 times total, which is O(n²). The triangular pattern is still quadratic.",
        explanationID: "Loop dalam berjalan total 0+1+2+...+(n-1) = n(n-1)/2 kali, yang merupakan O(n²). Pola segitiga tetap kuadratik.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo009",
        questionEN: "What is amortized time complexity?",
        questionID: "Apa itu kompleksitas waktu teramortisasi?",
        options: [
            QuestionOption(id: "a", textEN: "Average time per operation over a sequence of operations", textID: "Waktu rata-rata per operasi selama serangkaian operasi"),
            QuestionOption(id: "b", textEN: "The worst case time", textID: "Waktu kasus terburuk"),
            QuestionOption(id: "c", textEN: "The best case time", textID: "Waktu kasus terbaik"),
            QuestionOption(id: "d", textEN: "The exact running time", textID: "Waktu berjalan yang tepat")
        ],
        correctOptionId: "a",
        explanationEN: "Amortized analysis averages the cost over a sequence. E.g., dynamic array append is O(1) amortized because expensive resize operations are rare.",
        explanationID: "Analisis teramortisasi merata-ratakan biaya selama serangkaian operasi. Misal, append dynamic array adalah O(1) teramortisasi karena operasi resize yang mahal jarang terjadi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo010",
        questionEN: "What is the time complexity of the best comparison-based sorting algorithms?",
        questionID: "Berapa kompleksitas waktu algoritma sorting berbasis perbandingan terbaik?",
        options: [
            QuestionOption(id: "a", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "d", textEN: "O(log n)", textID: "O(log n)")
        ],
        correctOptionId: "a",
        explanationEN: "O(n log n) is the theoretical lower bound for comparison-based sorting. Merge sort, heap sort, and quicksort (average) achieve this.",
        explanationID: "O(n log n) adalah batas bawah teoretis untuk sorting berbasis perbandingan. Merge sort, heap sort, dan quicksort (rata-rata) mencapai ini.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // Batch 2: Data Structures (10 questions)
    Question(
        id: "algo011",
        questionEN: "What is the main advantage of a hash table?",
        questionID: "Apa keuntungan utama dari hash table?",
        options: [
            QuestionOption(id: "a", textEN: "O(1) average time for insert, delete, and lookup", textID: "Waktu rata-rata O(1) untuk insert, delete, dan lookup"),
            QuestionOption(id: "b", textEN: "Maintains sorted order", textID: "Mempertahankan urutan terurut"),
            QuestionOption(id: "c", textEN: "Uses least memory", textID: "Menggunakan memori paling sedikit"),
            QuestionOption(id: "d", textEN: "Guaranteed O(1) for all operations", textID: "Dijamin O(1) untuk semua operasi")
        ],
        correctOptionId: "a",
        explanationEN: "Hash tables provide O(1) average case for insert, delete, and lookup by using a hash function to map keys to array indices. Worst case is O(n) due to collisions.",
        explanationID: "Hash table memberikan kasus rata-rata O(1) untuk insert, delete, dan lookup dengan menggunakan fungsi hash untuk memetakan kunci ke indeks array. Kasus terburuk adalah O(n) karena collision.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo012",
        questionEN: "What is a stack data structure?",
        questionID: "Apa itu struktur data stack?",
        options: [
            QuestionOption(id: "a", textEN: "LIFO (Last In, First Out) - like a stack of plates", textID: "LIFO (Last In, First Out) - seperti tumpukan piring"),
            QuestionOption(id: "b", textEN: "FIFO (First In, First Out) - like a queue", textID: "FIFO (First In, First Out) - seperti antrian"),
            QuestionOption(id: "c", textEN: "Random access structure", textID: "Struktur akses acak"),
            QuestionOption(id: "d", textEN: "Sorted collection", textID: "Koleksi terurut")
        ],
        correctOptionId: "a",
        explanationEN: "A stack follows LIFO - the last element pushed is the first to be popped. Operations: push (add to top), pop (remove from top), peek (view top).",
        explanationID: "Stack mengikuti LIFO - elemen terakhir yang di-push adalah yang pertama di-pop. Operasi: push (tambah ke atas), pop (hapus dari atas), peek (lihat atas).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo013",
        questionEN: "What is a queue data structure?",
        questionID: "Apa itu struktur data queue?",
        options: [
            QuestionOption(id: "a", textEN: "FIFO (First In, First Out) - like a line at a store", textID: "FIFO (First In, First Out) - seperti antrian di toko"),
            QuestionOption(id: "b", textEN: "LIFO (Last In, First Out)", textID: "LIFO (Last In, First Out)"),
            QuestionOption(id: "c", textEN: "Random access", textID: "Akses acak"),
            QuestionOption(id: "d", textEN: "Priority-based access", textID: "Akses berbasis prioritas")
        ],
        correctOptionId: "a",
        explanationEN: "A queue follows FIFO - the first element enqueued is the first to be dequeued. Like a line where people are served in order of arrival.",
        explanationID: "Queue mengikuti FIFO - elemen pertama yang di-enqueue adalah yang pertama di-dequeue. Seperti antrian dimana orang dilayani sesuai urutan kedatangan.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo014",
        questionEN: "What is the time complexity of inserting at the beginning of a linked list?",
        questionID: "Berapa kompleksitas waktu menyisipkan di awal linked list?",
        options: [
            QuestionOption(id: "a", textEN: "O(1)", textID: "O(1)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(log n)", textID: "O(log n)"),
            QuestionOption(id: "d", textEN: "O(n²)", textID: "O(n²)")
        ],
        correctOptionId: "a",
        explanationEN: "Inserting at the head of a linked list is O(1) because we just create a new node and update the head pointer. No shifting required.",
        explanationID: "Menyisipkan di head linked list adalah O(1) karena kita hanya membuat node baru dan memperbarui pointer head. Tidak perlu pergeseran.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo015",
        questionEN: "What is a binary search tree (BST)?",
        questionID: "Apa itu binary search tree (BST)?",
        options: [
            QuestionOption(id: "a", textEN: "A tree where left children are smaller and right children are larger than the parent", textID: "Tree dimana anak kiri lebih kecil dan anak kanan lebih besar dari parent"),
            QuestionOption(id: "b", textEN: "A tree with exactly two nodes", textID: "Tree dengan tepat dua node"),
            QuestionOption(id: "c", textEN: "A tree used only for binary search", textID: "Tree yang hanya digunakan untuk pencarian biner"),
            QuestionOption(id: "d", textEN: "A balanced tree with equal heights", textID: "Tree seimbang dengan tinggi sama")
        ],
        correctOptionId: "a",
        explanationEN: "In a BST, for every node: all left subtree values are smaller, all right subtree values are larger. This enables O(log n) search in balanced trees.",
        explanationID: "Dalam BST, untuk setiap node: semua nilai subtree kiri lebih kecil, semua nilai subtree kanan lebih besar. Ini memungkinkan pencarian O(log n) di tree seimbang.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo016",
        questionEN: "What is a heap data structure?",
        questionID: "Apa itu struktur data heap?",
        options: [
            QuestionOption(id: "a", textEN: "A complete binary tree where parent is always greater (max) or smaller (min) than children", textID: "Binary tree lengkap dimana parent selalu lebih besar (max) atau lebih kecil (min) dari children"),
            QuestionOption(id: "b", textEN: "A sorted array", textID: "Array terurut"),
            QuestionOption(id: "c", textEN: "A stack-like structure", textID: "Struktur seperti stack"),
            QuestionOption(id: "d", textEN: "A random collection", textID: "Koleksi acak")
        ],
        correctOptionId: "a",
        explanationEN: "A heap maintains the heap property: in a max-heap, every parent >= children. Heaps support O(1) find-max and O(log n) insert/extract-max.",
        explanationID: "Heap mempertahankan properti heap: dalam max-heap, setiap parent >= children. Heap mendukung find-max O(1) dan insert/extract-max O(log n).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo017",
        questionEN: "What is a priority queue typically implemented with?",
        questionID: "Priority queue biasanya diimplementasikan dengan apa?",
        options: [
            QuestionOption(id: "a", textEN: "A heap", textID: "Heap"),
            QuestionOption(id: "b", textEN: "A sorted array", textID: "Array terurut"),
            QuestionOption(id: "c", textEN: "A linked list", textID: "Linked list"),
            QuestionOption(id: "d", textEN: "A hash table", textID: "Hash table")
        ],
        correctOptionId: "a",
        explanationEN: "A heap provides O(log n) insert and O(log n) extract-min/max, making it ideal for priority queues where we frequently access the highest priority element.",
        explanationID: "Heap menyediakan insert O(log n) dan extract-min/max O(log n), membuatnya ideal untuk priority queue dimana kita sering mengakses elemen prioritas tertinggi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo018",
        questionEN: "What is the difference between an array and a linked list?",
        questionID: "Apa perbedaan antara array dan linked list?",
        options: [
            QuestionOption(id: "a", textEN: "Arrays have O(1) access but O(n) insert; linked lists have O(n) access but O(1) insert at head", textID: "Array memiliki akses O(1) tapi insert O(n); linked list memiliki akses O(n) tapi insert O(1) di head"),
            QuestionOption(id: "b", textEN: "They are the same", textID: "Mereka sama"),
            QuestionOption(id: "c", textEN: "Arrays are always faster", textID: "Array selalu lebih cepat"),
            QuestionOption(id: "d", textEN: "Linked lists use less memory", textID: "Linked list menggunakan lebih sedikit memori")
        ],
        correctOptionId: "a",
        explanationEN: "Arrays provide constant-time random access but require shifting for insertion. Linked lists allow O(1) insertion at known positions but require traversal for access.",
        explanationID: "Array menyediakan akses acak waktu konstan tetapi memerlukan pergeseran untuk penyisipan. Linked list memungkinkan penyisipan O(1) di posisi yang diketahui tetapi memerlukan traversal untuk akses.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo019",
        questionEN: "What is a graph data structure?",
        questionID: "Apa itu struktur data graph?",
        options: [
            QuestionOption(id: "a", textEN: "A collection of nodes (vertices) connected by edges", textID: "Kumpulan node (vertex) yang terhubung oleh edge"),
            QuestionOption(id: "b", textEN: "A type of chart for data visualization", textID: "Jenis chart untuk visualisasi data"),
            QuestionOption(id: "c", textEN: "A special type of tree", textID: "Jenis khusus dari tree"),
            QuestionOption(id: "d", textEN: "A linear data structure", textID: "Struktur data linear")
        ],
        correctOptionId: "a",
        explanationEN: "A graph G = (V, E) consists of vertices V and edges E connecting them. Graphs can be directed/undirected, weighted/unweighted, cyclic/acyclic.",
        explanationID: "Graph G = (V, E) terdiri dari vertex V dan edge E yang menghubungkannya. Graph bisa directed/undirected, weighted/unweighted, cyclic/acyclic.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo020",
        questionEN: "What is the difference between BFS and DFS?",
        questionID: "Apa perbedaan antara BFS dan DFS?",
        options: [
            QuestionOption(id: "a", textEN: "BFS explores level by level (uses queue); DFS goes deep first (uses stack/recursion)", textID: "BFS mengeksplorasi level demi level (menggunakan queue); DFS masuk ke dalam dulu (menggunakan stack/rekursi)"),
            QuestionOption(id: "b", textEN: "BFS is faster than DFS", textID: "BFS lebih cepat dari DFS"),
            QuestionOption(id: "c", textEN: "DFS uses more memory", textID: "DFS menggunakan lebih banyak memori"),
            QuestionOption(id: "d", textEN: "They produce the same traversal", textID: "Mereka menghasilkan traversal yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "BFS (Breadth-First Search) visits all neighbors before going deeper. DFS (Depth-First Search) explores as far as possible along each branch before backtracking.",
        explanationID: "BFS (Breadth-First Search) mengunjungi semua tetangga sebelum masuk lebih dalam. DFS (Depth-First Search) mengeksplorasi sejauh mungkin di setiap cabang sebelum backtracking.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // Batch 3: Sorting & Searching (10 questions)
    Question(
        id: "algo021",
        questionEN: "How does bubble sort work?",
        questionID: "Bagaimana cara kerja bubble sort?",
        options: [
            QuestionOption(id: "a", textEN: "Repeatedly swapping adjacent elements if they're in wrong order", textID: "Berulang kali menukar elemen yang berdekatan jika urutan mereka salah"),
            QuestionOption(id: "b", textEN: "Dividing array and conquering", textID: "Membagi array dan menaklukkan"),
            QuestionOption(id: "c", textEN: "Selecting minimum each time", textID: "Memilih minimum setiap kali"),
            QuestionOption(id: "d", textEN: "Inserting into correct position", textID: "Menyisipkan ke posisi yang benar")
        ],
        correctOptionId: "a",
        explanationEN: "Bubble sort compares adjacent pairs and swaps if out of order, 'bubbling' larger elements to the end. Time: O(n²), Space: O(1).",
        explanationID: "Bubble sort membandingkan pasangan yang berdekatan dan menukar jika tidak berurutan, 'menggelembungkan' elemen lebih besar ke akhir. Waktu: O(n²), Ruang: O(1).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo022",
        questionEN: "How does merge sort work?",
        questionID: "Bagaimana cara kerja merge sort?",
        options: [
            QuestionOption(id: "a", textEN: "Divide array in half, recursively sort each half, then merge the sorted halves", textID: "Membagi array menjadi dua, secara rekursif mengurutkan setiap bagian, lalu menggabungkan bagian yang terurut"),
            QuestionOption(id: "b", textEN: "Select minimum and swap to front", textID: "Pilih minimum dan tukar ke depan"),
            QuestionOption(id: "c", textEN: "Compare adjacent elements", textID: "Bandingkan elemen yang berdekatan"),
            QuestionOption(id: "d", textEN: "Build a heap and extract elements", textID: "Bangun heap dan ekstrak elemen")
        ],
        correctOptionId: "a",
        explanationEN: "Merge sort is a divide-and-conquer algorithm. It divides the array, recursively sorts both halves, and merges them. Time: O(n log n), Space: O(n).",
        explanationID: "Merge sort adalah algoritma divide-and-conquer. Ia membagi array, secara rekursif mengurutkan kedua bagian, dan menggabungkannya. Waktu: O(n log n), Ruang: O(n).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo023",
        questionEN: "How does quicksort work?",
        questionID: "Bagaimana cara kerja quicksort?",
        options: [
            QuestionOption(id: "a", textEN: "Choose a pivot, partition array around it, recursively sort partitions", textID: "Pilih pivot, partisi array di sekitarnya, secara rekursif urutkan partisi"),
            QuestionOption(id: "b", textEN: "Merge two sorted arrays", textID: "Gabungkan dua array terurut"),
            QuestionOption(id: "c", textEN: "Build a heap first", textID: "Bangun heap terlebih dahulu"),
            QuestionOption(id: "d", textEN: "Insert elements one by one", textID: "Sisipkan elemen satu per satu")
        ],
        correctOptionId: "a",
        explanationEN: "Quicksort picks a pivot, partitions elements (smaller left, larger right), then recursively sorts partitions. Average: O(n log n), Worst: O(n²).",
        explanationID: "Quicksort memilih pivot, mempartisi elemen (lebih kecil kiri, lebih besar kanan), lalu secara rekursif mengurutkan partisi. Rata-rata: O(n log n), Terburuk: O(n²).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo024",
        questionEN: "What is the worst case for quicksort and when does it occur?",
        questionID: "Apa kasus terburuk untuk quicksort dan kapan itu terjadi?",
        options: [
            QuestionOption(id: "a", textEN: "O(n²), when pivot is always the smallest or largest element", textID: "O(n²), ketika pivot selalu elemen terkecil atau terbesar"),
            QuestionOption(id: "b", textEN: "O(n log n), always", textID: "O(n log n), selalu"),
            QuestionOption(id: "c", textEN: "O(n), for sorted arrays", textID: "O(n), untuk array terurut"),
            QuestionOption(id: "d", textEN: "O(2^n), for random data", textID: "O(2^n), untuk data acak")
        ],
        correctOptionId: "a",
        explanationEN: "When the pivot is always the min or max (e.g., sorted array with first/last pivot), partitions are extremely unbalanced, leading to O(n²).",
        explanationID: "Ketika pivot selalu min atau max (misal array terurut dengan pivot pertama/terakhir), partisi sangat tidak seimbang, menyebabkan O(n²).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo025",
        questionEN: "Which sorting algorithm is stable?",
        questionID: "Algoritma sorting mana yang stabil?",
        options: [
            QuestionOption(id: "a", textEN: "Merge sort", textID: "Merge sort"),
            QuestionOption(id: "b", textEN: "Quicksort (standard implementation)", textID: "Quicksort (implementasi standar)"),
            QuestionOption(id: "c", textEN: "Heap sort", textID: "Heap sort"),
            QuestionOption(id: "d", textEN: "Selection sort", textID: "Selection sort")
        ],
        correctOptionId: "a",
        explanationEN: "A stable sort maintains the relative order of equal elements. Merge sort is stable; quicksort and heap sort are typically not.",
        explanationID: "Sort stabil mempertahankan urutan relatif dari elemen yang sama. Merge sort stabil; quicksort dan heap sort biasanya tidak.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo026",
        questionEN: "What is counting sort and when is it useful?",
        questionID: "Apa itu counting sort dan kapan berguna?",
        options: [
            QuestionOption(id: "a", textEN: "Counts occurrences of each value; useful when value range is small", textID: "Menghitung kemunculan setiap nilai; berguna ketika rentang nilai kecil"),
            QuestionOption(id: "b", textEN: "Counts comparisons made; always fastest", textID: "Menghitung perbandingan yang dilakukan; selalu tercepat"),
            QuestionOption(id: "c", textEN: "Works for any data type", textID: "Bekerja untuk tipe data apapun"),
            QuestionOption(id: "d", textEN: "Uses divide and conquer", textID: "Menggunakan divide and conquer")
        ],
        correctOptionId: "a",
        explanationEN: "Counting sort counts occurrences of each value and uses counts to place elements. O(n + k) where k is the value range. Not comparison-based.",
        explanationID: "Counting sort menghitung kemunculan setiap nilai dan menggunakan hitungan untuk menempatkan elemen. O(n + k) dimana k adalah rentang nilai. Bukan berbasis perbandingan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo027",
        questionEN: "What is the binary search requirement?",
        questionID: "Apa persyaratan pencarian biner?",
        options: [
            QuestionOption(id: "a", textEN: "The array must be sorted", textID: "Array harus terurut"),
            QuestionOption(id: "b", textEN: "The array must have unique elements", textID: "Array harus memiliki elemen unik"),
            QuestionOption(id: "c", textEN: "The array must have even length", textID: "Array harus memiliki panjang genap"),
            QuestionOption(id: "d", textEN: "No requirements", textID: "Tidak ada persyaratan")
        ],
        correctOptionId: "a",
        explanationEN: "Binary search requires a sorted array because it relies on the ordering to eliminate half the search space at each step.",
        explanationID: "Pencarian biner membutuhkan array terurut karena ia bergantung pada urutan untuk mengeliminasi setengah ruang pencarian di setiap langkah.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo028",
        questionEN: "How do you find the middle index in binary search without overflow?",
        questionID: "Bagaimana cara menemukan indeks tengah dalam pencarian biner tanpa overflow?",
        options: [
            QuestionOption(id: "a", textEN: "mid = left + (right - left) // 2", textID: "mid = left + (right - left) // 2"),
            QuestionOption(id: "b", textEN: "mid = (left + right) / 2", textID: "mid = (left + right) / 2"),
            QuestionOption(id: "c", textEN: "mid = right / 2", textID: "mid = right / 2"),
            QuestionOption(id: "d", textEN: "mid = left * right / 2", textID: "mid = left * right / 2")
        ],
        correctOptionId: "a",
        explanationEN: "Using left + (right - left) // 2 avoids integer overflow that could occur with (left + right) / 2 when left and right are very large.",
        explanationID: "Menggunakan left + (right - left) // 2 menghindari overflow integer yang bisa terjadi dengan (left + right) / 2 ketika left dan right sangat besar.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo029",
        questionEN: "What algorithm finds the shortest path in an unweighted graph?",
        questionID: "Algoritma apa yang menemukan jalur terpendek dalam graph tidak berbobot?",
        options: [
            QuestionOption(id: "a", textEN: "BFS (Breadth-First Search)", textID: "BFS (Breadth-First Search)"),
            QuestionOption(id: "b", textEN: "DFS (Depth-First Search)", textID: "DFS (Depth-First Search)"),
            QuestionOption(id: "c", textEN: "Binary Search", textID: "Binary Search"),
            QuestionOption(id: "d", textEN: "Quicksort", textID: "Quicksort")
        ],
        correctOptionId: "a",
        explanationEN: "BFS explores nodes level by level, so the first time it reaches a node is via the shortest path (in terms of edge count) in an unweighted graph.",
        explanationID: "BFS mengeksplorasi node level demi level, jadi pertama kali mencapai sebuah node adalah melalui jalur terpendek (dalam hal jumlah edge) di graph tidak berbobot.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo030",
        questionEN: "What algorithm finds the shortest path in a weighted graph with non-negative weights?",
        questionID: "Algoritma apa yang menemukan jalur terpendek dalam graph berbobot dengan bobot non-negatif?",
        options: [
            QuestionOption(id: "a", textEN: "Dijkstra's algorithm", textID: "Algoritma Dijkstra"),
            QuestionOption(id: "b", textEN: "BFS", textID: "BFS"),
            QuestionOption(id: "c", textEN: "DFS", textID: "DFS"),
            QuestionOption(id: "d", textEN: "Bubble sort", textID: "Bubble sort")
        ],
        correctOptionId: "a",
        explanationEN: "Dijkstra's algorithm finds shortest paths from a source to all vertices in a weighted graph with non-negative edge weights, using a priority queue.",
        explanationID: "Algoritma Dijkstra menemukan jalur terpendek dari sumber ke semua vertex dalam graph berbobot dengan bobot edge non-negatif, menggunakan priority queue.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // Batch 4: Recursion & Dynamic Programming (10 questions)
    Question(
        id: "algo031",
        questionEN: "What are the two essential parts of a recursive function?",
        questionID: "Apa dua bagian penting dari fungsi rekursif?",
        options: [
            QuestionOption(id: "a", textEN: "Base case and recursive case", textID: "Base case dan recursive case"),
            QuestionOption(id: "b", textEN: "Loop and condition", textID: "Loop dan kondisi"),
            QuestionOption(id: "c", textEN: "Input and output", textID: "Input dan output"),
            QuestionOption(id: "d", textEN: "Start and end", textID: "Mulai dan akhir")
        ],
        correctOptionId: "a",
        explanationEN: "Every recursive function needs: 1) Base case - when to stop recursing, 2) Recursive case - how to reduce the problem and call itself.",
        explanationID: "Setiap fungsi rekursif membutuhkan: 1) Base case - kapan berhenti merekursi, 2) Recursive case - cara mereduksi masalah dan memanggil dirinya sendiri.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo032",
        questionEN: "What is the time complexity of naive recursive Fibonacci?",
        questionID: "Berapa kompleksitas waktu Fibonacci rekursif naif?",
        options: [
            QuestionOption(id: "a", textEN: "O(2^n)", textID: "O(2^n)"),
            QuestionOption(id: "b", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "c", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "d", textEN: "O(log n)", textID: "O(log n)")
        ],
        correctOptionId: "a",
        explanationEN: "Naive recursive Fibonacci has exponential time O(2^n) because it recomputes the same subproblems many times (overlapping subproblems).",
        explanationID: "Fibonacci rekursif naif memiliki waktu eksponensial O(2^n) karena ia menghitung ulang submasalah yang sama berkali-kali (submasalah yang tumpang tindih).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo033",
        questionEN: "What is memoization?",
        questionID: "Apa itu memoization?",
        options: [
            QuestionOption(id: "a", textEN: "Caching results of expensive function calls to avoid recomputation", textID: "Menyimpan hasil panggilan fungsi yang mahal untuk menghindari perhitungan ulang"),
            QuestionOption(id: "b", textEN: "Memorizing the algorithm steps", textID: "Menghafalkan langkah-langkah algoritma"),
            QuestionOption(id: "c", textEN: "Writing notes about the code", textID: "Menulis catatan tentang kode"),
            QuestionOption(id: "d", textEN: "A memory allocation technique", textID: "Teknik alokasi memori")
        ],
        correctOptionId: "a",
        explanationEN: "Memoization stores computed results (usually in a dictionary/array) so if the same inputs occur again, the cached result is returned instead of recomputing.",
        explanationID: "Memoization menyimpan hasil yang dihitung (biasanya dalam dictionary/array) sehingga jika input yang sama terjadi lagi, hasil yang di-cache dikembalikan alih-alih menghitung ulang.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo034",
        questionEN: "What is dynamic programming?",
        questionID: "Apa itu dynamic programming?",
        options: [
            QuestionOption(id: "a", textEN: "Breaking problems into overlapping subproblems and storing solutions to avoid recomputation", textID: "Memecah masalah menjadi submasalah yang tumpang tindih dan menyimpan solusi untuk menghindari perhitungan ulang"),
            QuestionOption(id: "b", textEN: "Programming that changes dynamically at runtime", textID: "Pemrograman yang berubah secara dinamis saat runtime"),
            QuestionOption(id: "c", textEN: "Using dynamic memory allocation", textID: "Menggunakan alokasi memori dinamis"),
            QuestionOption(id: "d", textEN: "Programming interactive applications", textID: "Memprogram aplikasi interaktif")
        ],
        correctOptionId: "a",
        explanationEN: "DP solves problems by breaking them into overlapping subproblems with optimal substructure, storing solutions to avoid redundant work.",
        explanationID: "DP memecahkan masalah dengan memecahnya menjadi submasalah yang tumpang tindih dengan substruktur optimal, menyimpan solusi untuk menghindari pekerjaan yang berlebihan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo035",
        questionEN: "What is the difference between top-down and bottom-up DP?",
        questionID: "Apa perbedaan antara DP top-down dan bottom-up?",
        options: [
            QuestionOption(id: "a", textEN: "Top-down uses recursion with memoization; bottom-up builds solution iteratively", textID: "Top-down menggunakan rekursi dengan memoization; bottom-up membangun solusi secara iteratif"),
            QuestionOption(id: "b", textEN: "They solve different problems", textID: "Mereka memecahkan masalah berbeda"),
            QuestionOption(id: "c", textEN: "Top-down is always faster", textID: "Top-down selalu lebih cepat"),
            QuestionOption(id: "d", textEN: "Bottom-up uses more memory", textID: "Bottom-up menggunakan lebih banyak memori")
        ],
        correctOptionId: "a",
        explanationEN: "Top-down (memoization) starts from the main problem and recurses down. Bottom-up (tabulation) starts from the smallest subproblems and builds up.",
        explanationID: "Top-down (memoization) dimulai dari masalah utama dan merekursi ke bawah. Bottom-up (tabulasi) dimulai dari submasalah terkecil dan membangun ke atas.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo036",
        questionEN: "What is the time complexity of Fibonacci with memoization?",
        questionID: "Berapa kompleksitas waktu Fibonacci dengan memoization?",
        options: [
            QuestionOption(id: "a", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "b", textEN: "O(2^n)", textID: "O(2^n)"),
            QuestionOption(id: "c", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "d", textEN: "O(n log n)", textID: "O(n log n)")
        ],
        correctOptionId: "a",
        explanationEN: "With memoization, each Fibonacci number is computed only once, so we have n subproblems each taking O(1) work, giving O(n) total.",
        explanationID: "Dengan memoization, setiap bilangan Fibonacci dihitung hanya sekali, jadi kita memiliki n submasalah yang masing-masing membutuhkan kerja O(1), memberikan total O(n).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo037",
        questionEN: "What properties indicate a problem can be solved with DP?",
        questionID: "Properti apa yang menunjukkan masalah dapat diselesaikan dengan DP?",
        options: [
            QuestionOption(id: "a", textEN: "Overlapping subproblems and optimal substructure", textID: "Submasalah yang tumpang tindih dan substruktur optimal"),
            QuestionOption(id: "b", textEN: "Linear structure only", textID: "Hanya struktur linear"),
            QuestionOption(id: "c", textEN: "No recursion possible", textID: "Tidak ada rekursi yang mungkin"),
            QuestionOption(id: "d", textEN: "Fixed input size", textID: "Ukuran input tetap")
        ],
        correctOptionId: "a",
        explanationEN: "DP applies when: 1) Overlapping subproblems - same subproblems are solved multiple times, 2) Optimal substructure - optimal solution contains optimal solutions to subproblems.",
        explanationID: "DP berlaku ketika: 1) Submasalah tumpang tindih - submasalah yang sama diselesaikan berkali-kali, 2) Substruktur optimal - solusi optimal berisi solusi optimal untuk submasalah.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo038",
        questionEN: "What is the knapsack problem?",
        questionID: "Apa itu masalah knapsack?",
        options: [
            QuestionOption(id: "a", textEN: "Selecting items with values and weights to maximize value within a weight limit", textID: "Memilih item dengan nilai dan bobot untuk memaksimalkan nilai dalam batas berat"),
            QuestionOption(id: "b", textEN: "Packing items into a bag", textID: "Mengemas item ke dalam tas"),
            QuestionOption(id: "c", textEN: "Finding the shortest path", textID: "Menemukan jalur terpendek"),
            QuestionOption(id: "d", textEN: "Sorting items by weight", textID: "Mengurutkan item berdasarkan berat")
        ],
        correctOptionId: "a",
        explanationEN: "The 0/1 knapsack problem: given items with weights and values, find the combination that maximizes total value without exceeding capacity. Classic DP problem.",
        explanationID: "Masalah knapsack 0/1: diberikan item dengan berat dan nilai, temukan kombinasi yang memaksimalkan nilai total tanpa melebihi kapasitas. Masalah DP klasik.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo039",
        questionEN: "What is the greedy algorithm approach?",
        questionID: "Apa itu pendekatan algoritma greedy?",
        options: [
            QuestionOption(id: "a", textEN: "Making the locally optimal choice at each step, hoping for global optimum", textID: "Membuat pilihan optimal lokal di setiap langkah, berharap untuk optimum global"),
            QuestionOption(id: "b", textEN: "Trying all possible solutions", textID: "Mencoba semua solusi yang mungkin"),
            QuestionOption(id: "c", textEN: "Using recursion always", textID: "Selalu menggunakan rekursi"),
            QuestionOption(id: "d", textEN: "Sorting before processing", textID: "Mengurutkan sebelum memproses")
        ],
        correctOptionId: "a",
        explanationEN: "Greedy algorithms make the locally best choice at each step. They don't always find the optimal solution but are often efficient and work for specific problems.",
        explanationID: "Algoritma greedy membuat pilihan terbaik lokal di setiap langkah. Mereka tidak selalu menemukan solusi optimal tetapi sering efisien dan bekerja untuk masalah tertentu.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo040",
        questionEN: "When does a greedy approach guarantee the optimal solution?",
        questionID: "Kapan pendekatan greedy menjamin solusi optimal?",
        options: [
            QuestionOption(id: "a", textEN: "When the problem has the greedy choice property and optimal substructure", textID: "Ketika masalah memiliki properti pilihan greedy dan substruktur optimal"),
            QuestionOption(id: "b", textEN: "Always", textID: "Selalu"),
            QuestionOption(id: "c", textEN: "Never", textID: "Tidak pernah"),
            QuestionOption(id: "d", textEN: "Only for sorting problems", textID: "Hanya untuk masalah sorting")
        ],
        correctOptionId: "a",
        explanationEN: "Greedy works optimally when: 1) Greedy choice property - local optimal leads to global optimal, 2) Optimal substructure - optimal solution contains optimal sub-solutions.",
        explanationID: "Greedy bekerja optimal ketika: 1) Properti pilihan greedy - optimal lokal mengarah ke optimal global, 2) Substruktur optimal - solusi optimal berisi sub-solusi optimal.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    // Batch 5: Problem-Solving Strategies (10 questions)
    Question(
        id: "algo041",
        questionEN: "What is divide and conquer?",
        questionID: "Apa itu divide and conquer?",
        options: [
            QuestionOption(id: "a", textEN: "Breaking a problem into smaller subproblems, solving them, and combining results", textID: "Memecah masalah menjadi submasalah yang lebih kecil, menyelesaikannya, dan menggabungkan hasil"),
            QuestionOption(id: "b", textEN: "Dividing work among team members", textID: "Membagi pekerjaan di antara anggota tim"),
            QuestionOption(id: "c", textEN: "Running algorithms in parallel", textID: "Menjalankan algoritma secara paralel"),
            QuestionOption(id: "d", textEN: "Splitting input data into files", textID: "Memisahkan data input ke dalam file")
        ],
        correctOptionId: "a",
        explanationEN: "Divide and conquer: 1) Divide problem into subproblems, 2) Conquer (solve) subproblems recursively, 3) Combine solutions. Examples: merge sort, quicksort, binary search.",
        explanationID: "Divide and conquer: 1) Membagi masalah menjadi submasalah, 2) Menaklukkan (menyelesaikan) submasalah secara rekursif, 3) Menggabungkan solusi. Contoh: merge sort, quicksort, binary search.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo042",
        questionEN: "What is backtracking?",
        questionID: "Apa itu backtracking?",
        options: [
            QuestionOption(id: "a", textEN: "Exploring all possibilities, abandoning paths that can't lead to valid solutions", textID: "Mengeksplorasi semua kemungkinan, meninggalkan jalur yang tidak bisa mengarah ke solusi valid"),
            QuestionOption(id: "b", textEN: "Going back to the start of the algorithm", textID: "Kembali ke awal algoritma"),
            QuestionOption(id: "c", textEN: "Reversing a sorted array", textID: "Membalik array terurut"),
            QuestionOption(id: "d", textEN: "Undoing all changes", textID: "Membatalkan semua perubahan")
        ],
        correctOptionId: "a",
        explanationEN: "Backtracking builds solutions incrementally and abandons (backtracks from) partial solutions that cannot lead to valid complete solutions. Used in N-Queens, Sudoku.",
        explanationID: "Backtracking membangun solusi secara bertahap dan meninggalkan (backtrack dari) solusi parsial yang tidak bisa mengarah ke solusi lengkap yang valid. Digunakan dalam N-Queens, Sudoku.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo043",
        questionEN: "What is the two-pointer technique?",
        questionID: "Apa itu teknik two-pointer?",
        options: [
            QuestionOption(id: "a", textEN: "Using two indices that move through the array to solve problems efficiently", textID: "Menggunakan dua indeks yang bergerak melalui array untuk menyelesaikan masalah secara efisien"),
            QuestionOption(id: "b", textEN: "Using two different arrays", textID: "Menggunakan dua array berbeda"),
            QuestionOption(id: "c", textEN: "Pointing to two memory locations", textID: "Menunjuk ke dua lokasi memori"),
            QuestionOption(id: "d", textEN: "Having two programmers work together", textID: "Memiliki dua programmer bekerja bersama")
        ],
        correctOptionId: "a",
        explanationEN: "Two-pointer technique uses two indices (often start/end or slow/fast) to traverse an array, often reducing O(n²) to O(n). Used for sorted arrays, linked lists.",
        explanationID: "Teknik two-pointer menggunakan dua indeks (sering start/end atau slow/fast) untuk menelusuri array, sering mengurangi O(n²) menjadi O(n). Digunakan untuk array terurut, linked list.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo044",
        questionEN: "What is the sliding window technique?",
        questionID: "Apa itu teknik sliding window?",
        options: [
            QuestionOption(id: "a", textEN: "Maintaining a subset (window) of elements that slides through the array", textID: "Mempertahankan subset (window) dari elemen yang bergeser melalui array"),
            QuestionOption(id: "b", textEN: "Moving a physical window", textID: "Memindahkan jendela fisik"),
            QuestionOption(id: "c", textEN: "Displaying data in a GUI window", textID: "Menampilkan data di jendela GUI"),
            QuestionOption(id: "d", textEN: "Scrolling through a document", textID: "Menggulir melalui dokumen")
        ],
        correctOptionId: "a",
        explanationEN: "Sliding window maintains a window of elements (fixed or variable size) that slides over the array. Useful for substring/subarray problems like max sum subarray.",
        explanationID: "Sliding window mempertahankan window dari elemen (ukuran tetap atau variabel) yang bergeser di atas array. Berguna untuk masalah substring/subarray seperti max sum subarray.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo045",
        questionEN: "What does 'in-place' algorithm mean?",
        questionID: "Apa arti algoritma 'in-place'?",
        options: [
            QuestionOption(id: "a", textEN: "The algorithm uses only a constant amount of extra space", textID: "Algoritma hanya menggunakan jumlah ruang ekstra yang konstan"),
            QuestionOption(id: "b", textEN: "The algorithm runs on the same computer", textID: "Algoritma berjalan di komputer yang sama"),
            QuestionOption(id: "c", textEN: "The algorithm doesn't move data", textID: "Algoritma tidak memindahkan data"),
            QuestionOption(id: "d", textEN: "The algorithm runs very fast", textID: "Algoritma berjalan sangat cepat")
        ],
        correctOptionId: "a",
        explanationEN: "An in-place algorithm transforms input using only O(1) auxiliary space. Example: in-place quicksort modifies the array without creating a copy.",
        explanationID: "Algoritma in-place mentransformasi input hanya menggunakan ruang auxiliary O(1). Contoh: quicksort in-place memodifikasi array tanpa membuat salinan.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo046",
        questionEN: "What is a hash collision and how is it resolved?",
        questionID: "Apa itu hash collision dan bagaimana cara mengatasinya?",
        options: [
            QuestionOption(id: "a", textEN: "When two keys hash to the same index; resolved by chaining or open addressing", textID: "Ketika dua kunci hash ke indeks yang sama; diatasi dengan chaining atau open addressing"),
            QuestionOption(id: "b", textEN: "When a hash table runs out of memory", textID: "Ketika hash table kehabisan memori"),
            QuestionOption(id: "c", textEN: "When two hash tables merge", textID: "Ketika dua hash table bergabung"),
            QuestionOption(id: "d", textEN: "It cannot be resolved", textID: "Tidak dapat diatasi")
        ],
        correctOptionId: "a",
        explanationEN: "Collision: different keys produce the same hash. Chaining: store collisions in a linked list. Open addressing: find another slot (linear/quadratic probing).",
        explanationID: "Collision: kunci berbeda menghasilkan hash yang sama. Chaining: simpan collision dalam linked list. Open addressing: temukan slot lain (linear/quadratic probing).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo047",
        questionEN: "What is the time complexity of building a heap from an array?",
        questionID: "Berapa kompleksitas waktu membangun heap dari array?",
        options: [
            QuestionOption(id: "a", textEN: "O(n)", textID: "O(n)"),
            QuestionOption(id: "b", textEN: "O(n log n)", textID: "O(n log n)"),
            QuestionOption(id: "c", textEN: "O(n²)", textID: "O(n²)"),
            QuestionOption(id: "d", textEN: "O(log n)", textID: "O(log n)")
        ],
        correctOptionId: "a",
        explanationEN: "Building a heap with heapify from bottom-up is O(n), not O(n log n). Most elements are near the leaves and require few swaps.",
        explanationID: "Membangun heap dengan heapify dari bottom-up adalah O(n), bukan O(n log n). Sebagian besar elemen berada dekat daun dan memerlukan sedikit swap.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo048",
        questionEN: "What is topological sorting used for?",
        questionID: "Untuk apa topological sorting digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Ordering vertices in a DAG so that all edges go from earlier to later vertices", textID: "Mengurutkan vertex dalam DAG sehingga semua edge pergi dari vertex awal ke vertex belakangan"),
            QuestionOption(id: "b", textEN: "Sorting geographical locations", textID: "Mengurutkan lokasi geografis"),
            QuestionOption(id: "c", textEN: "Arranging topics in a document", textID: "Menyusun topik dalam dokumen"),
            QuestionOption(id: "d", textEN: "Sorting by topology only", textID: "Mengurutkan berdasarkan topologi saja")
        ],
        correctOptionId: "a",
        explanationEN: "Topological sort orders a DAG (Directed Acyclic Graph) so dependencies come before dependents. Used for task scheduling, build systems, course prerequisites.",
        explanationID: "Topological sort mengurutkan DAG (Directed Acyclic Graph) sehingga dependensi datang sebelum yang bergantung. Digunakan untuk penjadwalan tugas, sistem build, prasyarat kursus.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "algo049",
        questionEN: "What is the difference between a tree and a graph?",
        questionID: "Apa perbedaan antara tree dan graph?",
        options: [
            QuestionOption(id: "a", textEN: "A tree is a connected acyclic graph with n-1 edges for n nodes", textID: "Tree adalah graph terhubung asiklik dengan n-1 edge untuk n node"),
            QuestionOption(id: "b", textEN: "Trees can have cycles", textID: "Tree bisa memiliki siklus"),
            QuestionOption(id: "c", textEN: "Graphs always have fewer edges", textID: "Graph selalu memiliki lebih sedikit edge"),
            QuestionOption(id: "d", textEN: "They are the same", textID: "Mereka sama")
        ],
        correctOptionId: "a",
        explanationEN: "A tree is a special graph that is connected (path between any two nodes) and acyclic (no cycles). It has exactly n-1 edges for n nodes.",
        explanationID: "Tree adalah graph khusus yang terhubung (jalur antara dua node apapun) dan asiklik (tidak ada siklus). Ia memiliki tepat n-1 edge untuk n node.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "algo050",
        questionEN: "What is the master theorem used for?",
        questionID: "Untuk apa master theorem digunakan?",
        options: [
            QuestionOption(id: "a", textEN: "Analyzing time complexity of divide-and-conquer recurrences", textID: "Menganalisis kompleksitas waktu dari rekurensi divide-and-conquer"),
            QuestionOption(id: "b", textEN: "Mastering programming skills", textID: "Menguasai keterampilan pemrograman"),
            QuestionOption(id: "c", textEN: "Proving algorithm correctness", textID: "Membuktikan kebenaran algoritma"),
            QuestionOption(id: "d", textEN: "Finding optimal solutions", textID: "Menemukan solusi optimal")
        ],
        correctOptionId: "a",
        explanationEN: "The master theorem provides solutions for recurrences of the form T(n) = aT(n/b) + f(n), common in divide-and-conquer algorithms.",
        explanationID: "Master theorem menyediakan solusi untuk rekurensi berbentuk T(n) = aT(n/b) + f(n), umum dalam algoritma divide-and-conquer.",
        topic: "problemSolving",
        difficulty: .advanced
    )
]
