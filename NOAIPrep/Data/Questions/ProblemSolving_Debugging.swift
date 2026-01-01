import Foundation

// MARK: - Problem Solving: Debugging Questions (50 questions)
// Subcategory: Code analysis, bug finding, error identification, ML debugging

let debuggingProblemQuestions: [Question] = [
    // Batch 1: Code Logic Bugs (10 questions)
    Question(
        id: "dbgp001",
        questionEN: "What is wrong with this code?\n```python\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n)\n```",
        questionID: "Apa yang salah dengan kode ini?\n```python\ndef factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Infinite recursion - should be factorial(n-1)", textID: "Rekursi tak hingga - seharusnya factorial(n-1)"),
            QuestionOption(id: "b", textEN: "Missing return statement", textID: "Return statement hilang"),
            QuestionOption(id: "c", textEN: "Wrong base case", textID: "Base case salah"),
            QuestionOption(id: "d", textEN: "Syntax error", textID: "Syntax error")
        ],
        correctOptionId: "a",
        explanationEN: "The recursive call uses factorial(n) instead of factorial(n-1), so n never decreases and the function never reaches the base case.",
        explanationID: "Panggilan rekursif menggunakan factorial(n) bukan factorial(n-1), jadi n tidak pernah berkurang dan fungsi tidak pernah mencapai base case.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp002",
        questionEN: "What is wrong with this code?\n```python\ndef get_max(arr):\n    max_val = 0\n    for x in arr:\n        if x > max_val:\n            max_val = x\n    return max_val\n```",
        questionID: "Apa yang salah dengan kode ini?\n```python\ndef get_max(arr):\n    max_val = 0\n    for x in arr:\n        if x > max_val:\n            max_val = x\n    return max_val\n```",
        options: [
            QuestionOption(id: "a", textEN: "Fails for arrays with only negative numbers", textID: "Gagal untuk array dengan hanya bilangan negatif"),
            QuestionOption(id: "b", textEN: "Wrong loop syntax", textID: "Syntax loop salah"),
            QuestionOption(id: "c", textEN: "Missing return", textID: "Return hilang"),
            QuestionOption(id: "d", textEN: "No errors", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "Initializing max_val to 0 fails for arrays like [-5, -3, -1] which returns 0 instead of -1. Should initialize with arr[0] or float('-inf').",
        explanationID: "Menginisialisasi max_val ke 0 gagal untuk array seperti [-5, -3, -1] yang mengembalikan 0 bukan -1. Seharusnya inisialisasi dengan arr[0] atau float('-inf').",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp003",
        questionEN: "What is the output?\n```python\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)\n```",
        questionID: "Apa outputnya?\n```python\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)\n```",
        options: [
            QuestionOption(id: "a", textEN: "[1, 2, 3, 4]", textID: "[1, 2, 3, 4]"),
            QuestionOption(id: "b", textEN: "[1, 2, 3]", textID: "[1, 2, 3]"),
            QuestionOption(id: "c", textEN: "[4]", textID: "[4]"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "b = a creates a reference to the same list, not a copy. Both a and b point to the same list object, so changes through b affect a.",
        explanationID: "b = a membuat referensi ke list yang sama, bukan salinan. Baik a dan b menunjuk ke objek list yang sama, jadi perubahan melalui b mempengaruhi a.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp004",
        questionEN: "What is the bug?\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr)\n    while left < right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid\n        else:\n            right = mid\n    return -1\n```",
        questionID: "Apa bugnya?\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr)\n    while left < right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid\n        else:\n            right = mid\n    return -1\n```",
        options: [
            QuestionOption(id: "a", textEN: "left = mid should be left = mid + 1 (infinite loop possible)", textID: "left = mid seharusnya left = mid + 1 (infinite loop mungkin)"),
            QuestionOption(id: "b", textEN: "Wrong mid calculation", textID: "Perhitungan mid salah"),
            QuestionOption(id: "c", textEN: "Missing base case", textID: "Base case hilang"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "When arr[mid] < target, setting left = mid can cause infinite loop because mid might equal left. Should be left = mid + 1 to make progress.",
        explanationID: "Ketika arr[mid] < target, mengatur left = mid bisa menyebabkan infinite loop karena mid mungkin sama dengan left. Seharusnya left = mid + 1 untuk membuat kemajuan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp005",
        questionEN: "What is the output?\n```python\ndef foo(x=[]):\n    x.append(1)\n    return x\n\nprint(foo())\nprint(foo())\n```",
        questionID: "Apa outputnya?\n```python\ndef foo(x=[]):\n    x.append(1)\n    return x\n\nprint(foo())\nprint(foo())\n```",
        options: [
            QuestionOption(id: "a", textEN: "[1]\\n[1, 1]", textID: "[1]\\n[1, 1]"),
            QuestionOption(id: "b", textEN: "[1]\\n[1]", textID: "[1]\\n[1]"),
            QuestionOption(id: "c", textEN: "[]\\n[]", textID: "[]\\n[]"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "Mutable default arguments are shared across calls. The same list object is reused, accumulating values. Fix: use x=None, then x = [] if x is None.",
        explanationID: "Argumen default mutable dibagi di seluruh panggilan. Objek list yang sama digunakan kembali, mengakumulasi nilai. Perbaikan: gunakan x=None, lalu x = [] if x is None.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp006",
        questionEN: "What is the bug?\n```python\nfor i in range(10):\n    if i = 5:\n        print('Found')\n```",
        questionID: "Apa bugnya?\n```python\nfor i in range(10):\n    if i = 5:\n        print('Found')\n```",
        options: [
            QuestionOption(id: "a", textEN: "Using = instead of == for comparison", textID: "Menggunakan = bukan == untuk perbandingan"),
            QuestionOption(id: "b", textEN: "Wrong range", textID: "Range salah"),
            QuestionOption(id: "c", textEN: "Missing colon", textID: "Titik dua hilang"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "Single = is assignment, == is comparison. Python will raise a SyntaxError because assignment is not allowed in if conditions (unlike C).",
        explanationID: "Satu = adalah penugasan, == adalah perbandingan. Python akan menghasilkan SyntaxError karena penugasan tidak diizinkan dalam kondisi if (tidak seperti C).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp007",
        questionEN: "What is the output?\n```python\nx = 10\ndef func():\n    print(x)\n    x = 20\nfunc()\n```",
        questionID: "Apa outputnya?\n```python\nx = 10\ndef func():\n    print(x)\n    x = 20\nfunc()\n```",
        options: [
            QuestionOption(id: "a", textEN: "UnboundLocalError", textID: "UnboundLocalError"),
            QuestionOption(id: "b", textEN: "10", textID: "10"),
            QuestionOption(id: "c", textEN: "20", textID: "20"),
            QuestionOption(id: "d", textEN: "None", textID: "None")
        ],
        correctOptionId: "a",
        explanationEN: "Because x is assigned later in the function, Python treats x as local throughout. The print tries to use x before it's assigned, causing UnboundLocalError.",
        explanationID: "Karena x ditetapkan nanti dalam fungsi, Python memperlakukan x sebagai lokal di seluruh fungsi. Print mencoba menggunakan x sebelum ditetapkan, menyebabkan UnboundLocalError.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp008",
        questionEN: "What is the bug?\n```python\ndef sum_list(lst):\n    total = 0\n    for i in range(len(lst)):\n        total += lst[i+1]\n    return total\n```",
        questionID: "Apa bugnya?\n```python\ndef sum_list(lst):\n    total = 0\n    for i in range(len(lst)):\n        total += lst[i+1]\n    return total\n```",
        options: [
            QuestionOption(id: "a", textEN: "IndexError - lst[i+1] goes out of bounds", textID: "IndexError - lst[i+1] keluar dari batas"),
            QuestionOption(id: "b", textEN: "Missing return", textID: "Return hilang"),
            QuestionOption(id: "c", textEN: "Wrong initialization", textID: "Inisialisasi salah"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "When i = len(lst) - 1 (last iteration), lst[i+1] = lst[len(lst)] which is out of bounds. Should use lst[i] or range(1, len(lst)).",
        explanationID: "Ketika i = len(lst) - 1 (iterasi terakhir), lst[i+1] = lst[len(lst)] yang keluar dari batas. Seharusnya menggunakan lst[i] atau range(1, len(lst)).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp009",
        questionEN: "What does this code print?\n```python\nprint(0.1 + 0.2 == 0.3)\n```",
        questionID: "Apa yang dicetak kode ini?\n```python\nprint(0.1 + 0.2 == 0.3)\n```",
        options: [
            QuestionOption(id: "a", textEN: "False", textID: "False"),
            QuestionOption(id: "b", textEN: "True", textID: "True"),
            QuestionOption(id: "c", textEN: "Error", textID: "Error"),
            QuestionOption(id: "d", textEN: "0.3", textID: "0.3")
        ],
        correctOptionId: "a",
        explanationEN: "Due to floating-point representation, 0.1 + 0.2 = 0.30000000000000004, not exactly 0.3. Use math.isclose() or round() for float comparisons.",
        explanationID: "Karena representasi floating-point, 0.1 + 0.2 = 0.30000000000000004, bukan tepat 0.3. Gunakan math.isclose() atau round() untuk perbandingan float.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp010",
        questionEN: "What is the bug?\n```python\ndef reverse_string(s):\n    for i in range(len(s)//2):\n        s[i], s[-i-1] = s[-i-1], s[i]\n    return s\n```",
        questionID: "Apa bugnya?\n```python\ndef reverse_string(s):\n    for i in range(len(s)//2):\n        s[i], s[-i-1] = s[-i-1], s[i]\n    return s\n```",
        options: [
            QuestionOption(id: "a", textEN: "Strings are immutable in Python - can't modify in place", textID: "String tidak dapat diubah di Python - tidak bisa dimodifikasi di tempat"),
            QuestionOption(id: "b", textEN: "Wrong index calculation", textID: "Perhitungan indeks salah"),
            QuestionOption(id: "c", textEN: "Missing return", textID: "Return hilang"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "Python strings are immutable - you can't assign to s[i]. This will raise TypeError. Use s = list(s), swap, then ''.join(s), or use s[::-1].",
        explanationID: "String Python tidak dapat diubah - tidak bisa menetapkan ke s[i]. Ini akan menghasilkan TypeError. Gunakan s = list(s), tukar, lalu ''.join(s), atau gunakan s[::-1].",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // Batch 2: Off-by-One and Loop Errors (10 questions)
    Question(
        id: "dbgp011",
        questionEN: "What values does this loop print?\n```python\nfor i in range(1, 5):\n    print(i)\n```",
        questionID: "Nilai apa yang dicetak loop ini?\n```python\nfor i in range(1, 5):\n    print(i)\n```",
        options: [
            QuestionOption(id: "a", textEN: "1, 2, 3, 4", textID: "1, 2, 3, 4"),
            QuestionOption(id: "b", textEN: "1, 2, 3, 4, 5", textID: "1, 2, 3, 4, 5"),
            QuestionOption(id: "c", textEN: "0, 1, 2, 3, 4", textID: "0, 1, 2, 3, 4"),
            QuestionOption(id: "d", textEN: "0, 1, 2, 3, 4, 5", textID: "0, 1, 2, 3, 4, 5")
        ],
        correctOptionId: "a",
        explanationEN: "range(1, 5) produces [1, 2, 3, 4]. The end value (5) is exclusive. To include 5, use range(1, 6).",
        explanationID: "range(1, 5) menghasilkan [1, 2, 3, 4]. Nilai akhir (5) eksklusif. Untuk menyertakan 5, gunakan range(1, 6).",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp012",
        questionEN: "What is wrong with this code?\n```python\narr = [1, 2, 3, 4, 5]\nfor i in range(len(arr)):\n    if arr[i] % 2 == 0:\n        arr.remove(arr[i])\n```",
        questionID: "Apa yang salah dengan kode ini?\n```python\narr = [1, 2, 3, 4, 5]\nfor i in range(len(arr)):\n    if arr[i] % 2 == 0:\n        arr.remove(arr[i])\n```",
        options: [
            QuestionOption(id: "a", textEN: "Modifying list while iterating causes index errors or skipped elements", textID: "Memodifikasi list saat iterasi menyebabkan error indeks atau elemen terlewat"),
            QuestionOption(id: "b", textEN: "Wrong modulo operator", textID: "Operator modulo salah"),
            QuestionOption(id: "c", textEN: "Missing break statement", textID: "Statement break hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "Removing elements while iterating changes indices, causing IndexError or skipping elements. Use list comprehension: [x for x in arr if x % 2 != 0].",
        explanationID: "Menghapus elemen saat iterasi mengubah indeks, menyebabkan IndexError atau melewati elemen. Gunakan list comprehension: [x for x in arr if x % 2 != 0].",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp013",
        questionEN: "What is the off-by-one error?\n```python\ndef count_pairs(n):\n    count = 0\n    for i in range(n):\n        for j in range(i, n):\n            count += 1\n    return count\n```\nFor n=3, expected pairs: (0,1), (0,2), (1,2) = 3 pairs",
        questionID: "Apa off-by-one error?\n```python\ndef count_pairs(n):\n    count = 0\n    for i in range(n):\n        for j in range(i, n):\n            count += 1\n    return count\n```\nUntuk n=3, pasangan yang diharapkan: (0,1), (0,2), (1,2) = 3 pasangan",
        options: [
            QuestionOption(id: "a", textEN: "Inner loop should start at i+1, not i (counts (i,i) pairs)", textID: "Loop dalam seharusnya dimulai dari i+1, bukan i (menghitung pasangan (i,i))"),
            QuestionOption(id: "b", textEN: "Outer loop is wrong", textID: "Loop luar salah"),
            QuestionOption(id: "c", textEN: "Count initialization wrong", textID: "Inisialisasi count salah"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "range(i, n) includes i, counting pairs like (0,0), (1,1), (2,2). For distinct pairs, use range(i+1, n). Current code returns 6, not 3.",
        explanationID: "range(i, n) menyertakan i, menghitung pasangan seperti (0,0), (1,1), (2,2). Untuk pasangan berbeda, gunakan range(i+1, n). Kode saat ini mengembalikan 6, bukan 3.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp014",
        questionEN: "What is the output?\n```python\ni = 0\nwhile i < 5:\n    print(i)\n    if i == 2:\n        continue\n    i += 1\n```",
        questionID: "Apa outputnya?\n```python\ni = 0\nwhile i < 5:\n    print(i)\n    if i == 2:\n        continue\n    i += 1\n```",
        options: [
            QuestionOption(id: "a", textEN: "Infinite loop printing 2 forever", textID: "Infinite loop mencetak 2 selamanya"),
            QuestionOption(id: "b", textEN: "0, 1, 2, 3, 4", textID: "0, 1, 2, 3, 4"),
            QuestionOption(id: "c", textEN: "0, 1, 3, 4", textID: "0, 1, 3, 4"),
            QuestionOption(id: "d", textEN: "0, 1, 2", textID: "0, 1, 2")
        ],
        correctOptionId: "a",
        explanationEN: "When i=2, continue skips i += 1, so i stays 2 forever. The increment should be before the continue check or in a for loop.",
        explanationID: "Ketika i=2, continue melewati i += 1, jadi i tetap 2 selamanya. Increment seharusnya sebelum pemeriksaan continue atau dalam for loop.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp015",
        questionEN: "What is wrong?\n```python\ndef find_index(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n        return -1\n```",
        questionID: "Apa yang salah?\n```python\ndef find_index(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n        return -1\n```",
        options: [
            QuestionOption(id: "a", textEN: "return -1 is inside the loop - should be outside (wrong indentation)", textID: "return -1 ada di dalam loop - seharusnya di luar (indentasi salah)"),
            QuestionOption(id: "b", textEN: "Wrong comparison operator", textID: "Operator perbandingan salah"),
            QuestionOption(id: "c", textEN: "Missing break", textID: "Break hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "return -1 is indented inside the loop, so it returns -1 after checking only the first element. Dedent it to be at the same level as the for loop.",
        explanationID: "return -1 diindentasi di dalam loop, jadi ia mengembalikan -1 setelah memeriksa hanya elemen pertama. Kurangi indentasi agar sejajar dengan for loop.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp016",
        questionEN: "What is wrong?\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(50))\n```",
        questionID: "Apa yang salah?\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(50))\n```",
        options: [
            QuestionOption(id: "a", textEN: "Exponential time complexity - will be extremely slow without memoization", textID: "Kompleksitas waktu eksponensial - akan sangat lambat tanpa memoization"),
            QuestionOption(id: "b", textEN: "Wrong base case", textID: "Base case salah"),
            QuestionOption(id: "c", textEN: "Stack overflow", textID: "Stack overflow"),
            QuestionOption(id: "d", textEN: "Syntax error", textID: "Syntax error")
        ],
        correctOptionId: "a",
        explanationEN: "This naive recursive implementation has O(2^n) time complexity. For n=50, it will take an extremely long time. Use memoization or iteration.",
        explanationID: "Implementasi rekursif naif ini memiliki kompleksitas waktu O(2^n). Untuk n=50, akan memakan waktu sangat lama. Gunakan memoization atau iterasi.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp017",
        questionEN: "What is the output?\n```python\nx = [1, 2, 3]\nfor item in x:\n    item = item * 2\nprint(x)\n```",
        questionID: "Apa outputnya?\n```python\nx = [1, 2, 3]\nfor item in x:\n    item = item * 2\nprint(x)\n```",
        options: [
            QuestionOption(id: "a", textEN: "[1, 2, 3]", textID: "[1, 2, 3]"),
            QuestionOption(id: "b", textEN: "[2, 4, 6]", textID: "[2, 4, 6]"),
            QuestionOption(id: "c", textEN: "[1, 2, 3, 2, 4, 6]", textID: "[1, 2, 3, 2, 4, 6]"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "item = item * 2 rebinds the local variable item to a new value but doesn't modify the list. Use x[i] = x[i] * 2 or x = [item * 2 for item in x].",
        explanationID: "item = item * 2 mengikat ulang variabel lokal item ke nilai baru tetapi tidak memodifikasi list. Gunakan x[i] = x[i] * 2 atau x = [item * 2 for item in x].",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp018",
        questionEN: "What is wrong with this loop?\n```python\nwhile True:\n    user_input = input('Enter q to quit: ')\n    if user_input == 'q':\n        break\n    process(user_input)\n```",
        questionID: "Apa yang salah dengan loop ini?\n```python\nwhile True:\n    user_input = input('Enter q to quit: ')\n    if user_input == 'q':\n        break\n    process(user_input)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Case sensitivity - 'Q' won't quit. Use user_input.lower() == 'q'", textID: "Sensitivitas huruf besar/kecil - 'Q' tidak akan quit. Gunakan user_input.lower() == 'q'"),
            QuestionOption(id: "b", textEN: "Missing else clause", textID: "Klausa else hilang"),
            QuestionOption(id: "c", textEN: "Infinite loop", textID: "Infinite loop"),
            QuestionOption(id: "d", textEN: "No issue", textID: "Tidak ada masalah")
        ],
        correctOptionId: "a",
        explanationEN: "The condition only checks for lowercase 'q'. User entering 'Q' won't quit. Also consider stripping whitespace: user_input.strip().lower().",
        explanationID: "Kondisi hanya memeriksa huruf kecil 'q'. Pengguna yang memasukkan 'Q' tidak akan quit. Pertimbangkan juga untuk strip whitespace: user_input.strip().lower().",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp019",
        questionEN: "What is the bug?\n```python\ndef merge_sorted(a, b):\n    result = []\n    i, j = 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] < b[j]:\n            result.append(a[i])\n            i += 1\n        else:\n            result.append(b[j])\n            j += 1\n    return result\n```",
        questionID: "Apa bugnya?\n```python\ndef merge_sorted(a, b):\n    result = []\n    i, j = 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] < b[j]:\n            result.append(a[i])\n            i += 1\n        else:\n            result.append(b[j])\n            j += 1\n    return result\n```",
        options: [
            QuestionOption(id: "a", textEN: "Missing remaining elements after the loop ends", textID: "Elemen sisa hilang setelah loop berakhir"),
            QuestionOption(id: "b", textEN: "Wrong comparison", textID: "Perbandingan salah"),
            QuestionOption(id: "c", textEN: "Index error", textID: "Index error"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "When one array is exhausted, remaining elements from the other are not added. Need: result.extend(a[i:]) and result.extend(b[j:]) after the loop.",
        explanationID: "Ketika satu array habis, elemen sisa dari yang lain tidak ditambahkan. Perlu: result.extend(a[i:]) dan result.extend(b[j:]) setelah loop.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp020",
        questionEN: "What is the bug?\n```python\ndef is_palindrome(s):\n    return s == s.reverse()\n```",
        questionID: "Apa bugnya?\n```python\ndef is_palindrome(s):\n    return s == s.reverse()\n```",
        options: [
            QuestionOption(id: "a", textEN: "Strings don't have reverse() method, use s[::-1]", textID: "String tidak memiliki metode reverse(), gunakan s[::-1]"),
            QuestionOption(id: "b", textEN: "Missing parentheses", textID: "Tanda kurung hilang"),
            QuestionOption(id: "c", textEN: "Wrong return type", textID: "Tipe return salah"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "Strings don't have a reverse() method. Use s[::-1] for reversed string. Lists have reverse() but it's in-place and returns None.",
        explanationID: "String tidak memiliki metode reverse(). Gunakan s[::-1] untuk string terbalik. List memiliki reverse() tetapi in-place dan mengembalikan None.",
        topic: "problemSolving",
        difficulty: .beginner
    ),

    // Batch 3: Type and None Errors (10 questions)
    Question(
        id: "dbgp021",
        questionEN: "What is the output?\n```python\ndef add(a, b):\n    print(a + b)\n\nresult = add(2, 3)\nprint(result * 2)\n```",
        questionID: "Apa outputnya?\n```python\ndef add(a, b):\n    print(a + b)\n\nresult = add(2, 3)\nprint(result * 2)\n```",
        options: [
            QuestionOption(id: "a", textEN: "5 then TypeError (None * 2)", textID: "5 lalu TypeError (None * 2)"),
            QuestionOption(id: "b", textEN: "5 then 10", textID: "5 lalu 10"),
            QuestionOption(id: "c", textEN: "10", textID: "10"),
            QuestionOption(id: "d", textEN: "5", textID: "5")
        ],
        correctOptionId: "a",
        explanationEN: "add() prints 5 but returns None (no return statement). result is None, and None * 2 raises TypeError. Use return a + b instead of print.",
        explanationID: "add() mencetak 5 tetapi mengembalikan None (tidak ada return statement). result adalah None, dan None * 2 menghasilkan TypeError. Gunakan return a + b bukan print.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp022",
        questionEN: "What is the bug?\n```python\ndef safe_divide(a, b):\n    if b != 0:\n        return a / b\n\nresult = safe_divide(10, 0)\nprint(result + 1)\n```",
        questionID: "Apa bugnya?\n```python\ndef safe_divide(a, b):\n    if b != 0:\n        return a / b\n\nresult = safe_divide(10, 0)\nprint(result + 1)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Returns None when b=0, causing TypeError on result + 1", textID: "Mengembalikan None ketika b=0, menyebabkan TypeError pada result + 1"),
            QuestionOption(id: "b", textEN: "Division by zero", textID: "Pembagian dengan nol"),
            QuestionOption(id: "c", textEN: "Syntax error", textID: "Syntax error"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "When b=0, the function returns None (no else clause). None + 1 raises TypeError. Add an else clause returning 0, None, or raising an exception.",
        explanationID: "Ketika b=0, fungsi mengembalikan None (tidak ada klausa else). None + 1 menghasilkan TypeError. Tambahkan klausa else yang mengembalikan 0, None, atau menghasilkan exception.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp023",
        questionEN: "What is wrong?\n```python\ndata = {'name': 'Alice', 'age': 25}\nprint(data['height'])\n```",
        questionID: "Apa yang salah?\n```python\ndata = {'name': 'Alice', 'age': 25}\nprint(data['height'])\n```",
        options: [
            QuestionOption(id: "a", textEN: "KeyError - 'height' key doesn't exist", textID: "KeyError - kunci 'height' tidak ada"),
            QuestionOption(id: "b", textEN: "TypeError", textID: "TypeError"),
            QuestionOption(id: "c", textEN: "Prints None", textID: "Mencetak None"),
            QuestionOption(id: "d", textEN: "Prints empty string", textID: "Mencetak string kosong")
        ],
        correctOptionId: "a",
        explanationEN: "Accessing a non-existent dictionary key raises KeyError. Use data.get('height') to get None, or data.get('height', 0) for a default value.",
        explanationID: "Mengakses kunci dictionary yang tidak ada menghasilkan KeyError. Gunakan data.get('height') untuk mendapatkan None, atau data.get('height', 0) untuk nilai default.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp024",
        questionEN: "What is the output?\n```python\ndef greet(name=None):\n    if name:\n        return f'Hello, {name}'\n    return 'Hello, Guest'\n\nprint(greet(''))\n```",
        questionID: "Apa outputnya?\n```python\ndef greet(name=None):\n    if name:\n        return f'Hello, {name}'\n    return 'Hello, Guest'\n\nprint(greet(''))\n```",
        options: [
            QuestionOption(id: "a", textEN: "Hello, Guest", textID: "Hello, Guest"),
            QuestionOption(id: "b", textEN: "Hello, ", textID: "Hello, "),
            QuestionOption(id: "c", textEN: "Hello, None", textID: "Hello, None"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "Empty string '' is falsy in Python, so if name: evaluates to False. If you want to distinguish '' from None, use if name is not None:.",
        explanationID: "String kosong '' adalah falsy di Python, jadi if name: dievaluasi False. Jika ingin membedakan '' dari None, gunakan if name is not None:.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp025",
        questionEN: "What is the bug?\n```python\nnumbers = [1, 2, 3]\nresult = numbers.sort()\nprint(result[0])\n```",
        questionID: "Apa bugnya?\n```python\nnumbers = [1, 2, 3]\nresult = numbers.sort()\nprint(result[0])\n```",
        options: [
            QuestionOption(id: "a", textEN: "sort() returns None (sorts in-place), causing TypeError on None[0]", textID: "sort() mengembalikan None (sort in-place), menyebabkan TypeError pada None[0]"),
            QuestionOption(id: "b", textEN: "IndexError", textID: "IndexError"),
            QuestionOption(id: "c", textEN: "Print 1", textID: "Mencetak 1"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "list.sort() sorts in-place and returns None. Use sorted(numbers) to get a new sorted list, or just call numbers.sort() then use numbers[0].",
        explanationID: "list.sort() melakukan sort in-place dan mengembalikan None. Gunakan sorted(numbers) untuk mendapatkan list terurut baru, atau panggil numbers.sort() lalu gunakan numbers[0].",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp026",
        questionEN: "What is wrong?\n```python\ndef calculate(x, y):\n    total = x + y\n\nprint(calculate(5, 3) + 10)\n```",
        questionID: "Apa yang salah?\n```python\ndef calculate(x, y):\n    total = x + y\n\nprint(calculate(5, 3) + 10)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Function doesn't return total, returns None", textID: "Fungsi tidak mengembalikan total, mengembalikan None"),
            QuestionOption(id: "b", textEN: "Wrong variable name", textID: "Nama variabel salah"),
            QuestionOption(id: "c", textEN: "Missing parameter", textID: "Parameter hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "The function calculates total but doesn't return it. Python functions return None by default. Add return total at the end.",
        explanationID: "Fungsi menghitung total tetapi tidak mengembalikannya. Fungsi Python mengembalikan None secara default. Tambahkan return total di akhir.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp027",
        questionEN: "What is the output?\n```python\nprint(type(1/2))\nprint(type(1//2))\n```",
        questionID: "Apa outputnya?\n```python\nprint(type(1/2))\nprint(type(1//2))\n```",
        options: [
            QuestionOption(id: "a", textEN: "<class 'float'>\\n<class 'int'>", textID: "<class 'float'>\\n<class 'int'>"),
            QuestionOption(id: "b", textEN: "<class 'int'>\\n<class 'int'>", textID: "<class 'int'>\\n<class 'int'>"),
            QuestionOption(id: "c", textEN: "<class 'float'>\\n<class 'float'>", textID: "<class 'float'>\\n<class 'float'>"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "/ is true division (always returns float). // is floor division (returns int for int operands). 1/2=0.5, 1//2=0.",
        explanationID: "/ adalah pembagian sejati (selalu mengembalikan float). // adalah pembagian floor (mengembalikan int untuk operan int). 1/2=0.5, 1//2=0.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp028",
        questionEN: "What is wrong?\n```python\nclass Counter:\n    count = 0\n    def increment(self):\n        count += 1\n\nc = Counter()\nc.increment()\n```",
        questionID: "Apa yang salah?\n```python\nclass Counter:\n    count = 0\n    def increment(self):\n        count += 1\n\nc = Counter()\nc.increment()\n```",
        options: [
            QuestionOption(id: "a", textEN: "UnboundLocalError - should use self.count or Counter.count", textID: "UnboundLocalError - seharusnya menggunakan self.count atau Counter.count"),
            QuestionOption(id: "b", textEN: "Missing __init__", textID: "__init__ hilang"),
            QuestionOption(id: "c", textEN: "Wrong class syntax", textID: "Syntax class salah"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "Inside increment(), count refers to a local variable. Use self.count for instance attribute or Counter.count for class attribute.",
        explanationID: "Di dalam increment(), count merujuk ke variabel lokal. Gunakan self.count untuk atribut instance atau Counter.count untuk atribut class.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp029",
        questionEN: "What is the output?\n```python\ndef f(x, y=x):\n    return x + y\nprint(f(5))\n```",
        questionID: "Apa outputnya?\n```python\ndef f(x, y=x):\n    return x + y\nprint(f(5))\n```",
        options: [
            QuestionOption(id: "a", textEN: "NameError - x is not defined when setting y=x", textID: "NameError - x tidak didefinisikan saat mengatur y=x"),
            QuestionOption(id: "b", textEN: "10", textID: "10"),
            QuestionOption(id: "c", textEN: "5", textID: "5"),
            QuestionOption(id: "d", textEN: "None", textID: "None")
        ],
        correctOptionId: "a",
        explanationEN: "Default argument values are evaluated at function definition time, not call time. x doesn't exist when the default is set. Use y=None, then y = y or x.",
        explanationID: "Nilai argumen default dievaluasi saat definisi fungsi, bukan saat pemanggilan. x tidak ada saat default diatur. Gunakan y=None, lalu y = y or x.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp030",
        questionEN: "What is wrong?\n```python\nimport json\ndata = json.loads('{\"name\": \"Alice\", \"age\": null}')\nif data['age'] == 'null':\n    print('No age')\n```",
        questionID: "Apa yang salah?\n```python\nimport json\ndata = json.loads('{\"name\": \"Alice\", \"age\": null}')\nif data['age'] == 'null':\n    print('No age')\n```",
        options: [
            QuestionOption(id: "a", textEN: "JSON null becomes Python None, not string 'null'", textID: "JSON null menjadi Python None, bukan string 'null'"),
            QuestionOption(id: "b", textEN: "Invalid JSON", textID: "JSON tidak valid"),
            QuestionOption(id: "c", textEN: "Missing import", textID: "Import hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "JSON null is converted to Python None. Compare with is None: if data['age'] is None: print('No age').",
        explanationID: "JSON null dikonversi ke Python None. Bandingkan dengan is None: if data['age'] is None: print('No age').",
        topic: "problemSolving",
        difficulty: .intermediate
    ),

    // Batch 4: ML/Data Debugging (10 questions)
    Question(
        id: "dbgp031",
        questionEN: "A model achieves 99% training accuracy but only 60% test accuracy. What is likely the problem?",
        questionID: "Model mencapai akurasi training 99% tetapi hanya akurasi test 60%. Apa yang mungkin menjadi masalah?",
        options: [
            QuestionOption(id: "a", textEN: "Overfitting - model memorized training data instead of generalizing", textID: "Overfitting - model menghafalkan data training alih-alih menggeneralisasi"),
            QuestionOption(id: "b", textEN: "Underfitting", textID: "Underfitting"),
            QuestionOption(id: "c", textEN: "Perfect model", textID: "Model sempurna"),
            QuestionOption(id: "d", textEN: "Data is too clean", textID: "Data terlalu bersih")
        ],
        correctOptionId: "a",
        explanationEN: "Large gap between training and test accuracy indicates overfitting. Solutions: more data, regularization, dropout, simpler model, cross-validation.",
        explanationID: "Kesenjangan besar antara akurasi training dan test menunjukkan overfitting. Solusi: lebih banyak data, regularisasi, dropout, model lebih sederhana, cross-validation.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp032",
        questionEN: "A model has 50% accuracy on both training and test sets for a binary classification. What is the likely issue?",
        questionID: "Model memiliki akurasi 50% pada training dan test set untuk klasifikasi biner. Apa masalahnya?",
        options: [
            QuestionOption(id: "a", textEN: "Model is not learning - performance is random chance level", textID: "Model tidak belajar - performa pada level peluang acak"),
            QuestionOption(id: "b", textEN: "Perfect model", textID: "Model sempurna"),
            QuestionOption(id: "c", textEN: "Overfitting", textID: "Overfitting"),
            QuestionOption(id: "d", textEN: "Data is balanced", textID: "Data seimbang")
        ],
        correctOptionId: "a",
        explanationEN: "50% accuracy on binary classification is random guessing. Check: features are informative, labels are correct, model architecture is appropriate, learning rate isn't too high/low.",
        explanationID: "Akurasi 50% pada klasifikasi biner adalah menebak acak. Periksa: fitur informatif, label benar, arsitektur model sesuai, learning rate tidak terlalu tinggi/rendah.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp033",
        questionEN: "Your neural network loss is NaN after a few epochs. What could be the cause?",
        questionID: "Loss neural network Anda adalah NaN setelah beberapa epoch. Apa penyebabnya?",
        options: [
            QuestionOption(id: "a", textEN: "Exploding gradients - learning rate too high or missing normalization", textID: "Exploding gradients - learning rate terlalu tinggi atau normalisasi hilang"),
            QuestionOption(id: "b", textEN: "Perfect convergence", textID: "Konvergensi sempurna"),
            QuestionOption(id: "c", textEN: "Not enough epochs", textID: "Epoch tidak cukup"),
            QuestionOption(id: "d", textEN: "Model too simple", textID: "Model terlalu sederhana")
        ],
        correctOptionId: "a",
        explanationEN: "NaN loss usually means exploding gradients. Solutions: lower learning rate, gradient clipping, batch normalization, check for division by zero or log(0).",
        explanationID: "Loss NaN biasanya berarti exploding gradients. Solusi: learning rate lebih rendah, gradient clipping, batch normalization, periksa pembagian dengan nol atau log(0).",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp034",
        questionEN: "Your model has 95% accuracy but F1 score is 0.1. What is happening?",
        questionID: "Model Anda memiliki akurasi 95% tetapi F1 score adalah 0.1. Apa yang terjadi?",
        options: [
            QuestionOption(id: "a", textEN: "Imbalanced dataset - model predicts majority class almost always", textID: "Dataset tidak seimbang - model memprediksi kelas mayoritas hampir selalu"),
            QuestionOption(id: "b", textEN: "Bug in F1 calculation", textID: "Bug dalam perhitungan F1"),
            QuestionOption(id: "c", textEN: "Perfect model", textID: "Model sempurna"),
            QuestionOption(id: "d", textEN: "Not enough training", textID: "Training tidak cukup")
        ],
        correctOptionId: "a",
        explanationEN: "High accuracy with low F1 indicates class imbalance. If 95% of data is class A, predicting all A gives 95% accuracy but fails on minority class. Use class weights, SMOTE, or different metrics.",
        explanationID: "Akurasi tinggi dengan F1 rendah menunjukkan ketidakseimbangan kelas. Jika 95% data adalah kelas A, memprediksi semua A memberikan akurasi 95% tetapi gagal pada kelas minoritas. Gunakan class weights, SMOTE, atau metrik berbeda.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp035",
        questionEN: "Training loss decreases but validation loss increases after a few epochs. What should you do?",
        questionID: "Training loss menurun tetapi validation loss meningkat setelah beberapa epoch. Apa yang harus dilakukan?",
        options: [
            QuestionOption(id: "a", textEN: "Use early stopping to stop training when validation loss starts increasing", textID: "Gunakan early stopping untuk menghentikan training saat validation loss mulai meningkat"),
            QuestionOption(id: "b", textEN: "Train for more epochs", textID: "Train lebih banyak epoch"),
            QuestionOption(id: "c", textEN: "Remove validation set", textID: "Hapus validation set"),
            QuestionOption(id: "d", textEN: "Use a larger model", textID: "Gunakan model lebih besar")
        ],
        correctOptionId: "a",
        explanationEN: "Diverging training/validation loss indicates overfitting. Early stopping saves the model at the best validation loss. Also consider regularization, dropout, or more data.",
        explanationID: "Training/validation loss yang menyimpang menunjukkan overfitting. Early stopping menyimpan model pada validation loss terbaik. Pertimbangkan juga regularisasi, dropout, atau lebih banyak data.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp036",
        questionEN: "What is wrong with this data preparation?\n```python\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.fit_transform(X_test)\n```",
        questionID: "Apa yang salah dengan persiapan data ini?\n```python\nfrom sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_train_scaled = scaler.fit_transform(X_train)\nX_test_scaled = scaler.fit_transform(X_test)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Test set should use transform(), not fit_transform() - data leakage", textID: "Test set seharusnya menggunakan transform(), bukan fit_transform() - kebocoran data"),
            QuestionOption(id: "b", textEN: "Should use MinMaxScaler", textID: "Seharusnya menggunakan MinMaxScaler"),
            QuestionOption(id: "c", textEN: "Missing import", textID: "Import hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "fit_transform on test data uses test statistics, causing data leakage. Fit only on training data, then transform test data using the same fitted scaler.",
        explanationID: "fit_transform pada data test menggunakan statistik test, menyebabkan kebocoran data. Fit hanya pada data training, lalu transform data test menggunakan scaler yang sudah di-fit.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp037",
        questionEN: "Your image classification model works well on training data but fails on real photos. What could be wrong?",
        questionID: "Model klasifikasi gambar Anda bekerja baik pada data training tetapi gagal pada foto nyata. Apa yang bisa salah?",
        options: [
            QuestionOption(id: "a", textEN: "Distribution shift - real photos differ from training data (lighting, angles, quality)", textID: "Pergeseran distribusi - foto nyata berbeda dari data training (pencahayaan, sudut, kualitas)"),
            QuestionOption(id: "b", textEN: "Model too simple", textID: "Model terlalu sederhana"),
            QuestionOption(id: "c", textEN: "Not enough training epochs", textID: "Epoch training tidak cukup"),
            QuestionOption(id: "d", textEN: "Wrong loss function", textID: "Fungsi loss salah")
        ],
        correctOptionId: "a",
        explanationEN: "Real-world images may have different characteristics than training data. Use data augmentation, collect more diverse training data, or fine-tune on real examples.",
        explanationID: "Gambar dunia nyata mungkin memiliki karakteristik berbeda dari data training. Gunakan data augmentation, kumpulkan data training yang lebih beragam, atau fine-tune pada contoh nyata.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp038",
        questionEN: "What is wrong with this code?\n```python\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_train)\naccuracy = accuracy_score(y_train, y_pred)\nprint(f'Model accuracy: {accuracy}')\n```",
        questionID: "Apa yang salah dengan kode ini?\n```python\nmodel.fit(X_train, y_train)\ny_pred = model.predict(X_train)\naccuracy = accuracy_score(y_train, y_pred)\nprint(f'Model accuracy: {accuracy}')\n```",
        options: [
            QuestionOption(id: "a", textEN: "Evaluating on training data - gives overoptimistic results, use test data", textID: "Mengevaluasi pada data training - memberikan hasil terlalu optimis, gunakan data test"),
            QuestionOption(id: "b", textEN: "Wrong metric", textID: "Metrik salah"),
            QuestionOption(id: "c", textEN: "Missing model.compile", textID: "model.compile hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "Evaluating on training data gives biased, optimistic estimates. Always evaluate on held-out test data that the model hasn't seen during training.",
        explanationID: "Mengevaluasi pada data training memberikan estimasi yang bias dan optimis. Selalu evaluasi pada data test yang dipisahkan yang belum pernah dilihat model selama training.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp039",
        questionEN: "Your model gives the same prediction for all inputs. What could be wrong?",
        questionID: "Model Anda memberikan prediksi yang sama untuk semua input. Apa yang bisa salah?",
        options: [
            QuestionOption(id: "a", textEN: "Model collapsed - check initialization, learning rate, and if features are properly normalized", textID: "Model kolaps - periksa inisialisasi, learning rate, dan apakah fitur dinormalisasi dengan benar"),
            QuestionOption(id: "b", textEN: "Perfect generalization", textID: "Generalisasi sempurna"),
            QuestionOption(id: "c", textEN: "Too many epochs", textID: "Epoch terlalu banyak"),
            QuestionOption(id: "d", textEN: "Model is too complex", textID: "Model terlalu kompleks")
        ],
        correctOptionId: "a",
        explanationEN: "Constant predictions indicate the model isn't learning. Check: dead neurons (ReLU dying), vanishing gradients, incorrect loss function, learning rate too high/low, all features are same value.",
        explanationID: "Prediksi konstan menunjukkan model tidak belajar. Periksa: neuron mati (ReLU dying), vanishing gradients, fungsi loss salah, learning rate terlalu tinggi/rendah, semua fitur bernilai sama.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp040",
        questionEN: "What is the issue with this cross-validation?\n```python\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nscores = cross_val_score(model, X_scaled, y, cv=5)\n```",
        questionID: "Apa masalah dengan cross-validation ini?\n```python\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nscores = cross_val_score(model, X_scaled, y, cv=5)\n```",
        options: [
            QuestionOption(id: "a", textEN: "Data leakage - scaling uses info from validation folds, use Pipeline instead", textID: "Kebocoran data - scaling menggunakan info dari fold validasi, gunakan Pipeline sebagai gantinya"),
            QuestionOption(id: "b", textEN: "Wrong cv value", textID: "Nilai cv salah"),
            QuestionOption(id: "c", textEN: "Missing random_state", textID: "random_state hilang"),
            QuestionOption(id: "d", textEN: "No issue", textID: "Tidak ada masalah")
        ],
        correctOptionId: "a",
        explanationEN: "Scaling before CV leaks validation data statistics into training. Use sklearn Pipeline to ensure scaling is done within each fold using only training data.",
        explanationID: "Scaling sebelum CV membocorkan statistik data validasi ke training. Gunakan sklearn Pipeline untuk memastikan scaling dilakukan dalam setiap fold hanya menggunakan data training.",
        topic: "problemSolving",
        difficulty: .advanced
    ),

    // Batch 5: General Problem Solving (10 questions)
    Question(
        id: "dbgp041",
        questionEN: "What is the output?\n```python\nprint([x for x in range(5) if x % 2])\n```",
        questionID: "Apa outputnya?\n```python\nprint([x for x in range(5) if x % 2])\n```",
        options: [
            QuestionOption(id: "a", textEN: "[1, 3]", textID: "[1, 3]"),
            QuestionOption(id: "b", textEN: "[0, 2, 4]", textID: "[0, 2, 4]"),
            QuestionOption(id: "c", textEN: "[0, 1, 2, 3, 4]", textID: "[0, 1, 2, 3, 4]"),
            QuestionOption(id: "d", textEN: "[]", textID: "[]")
        ],
        correctOptionId: "a",
        explanationEN: "x % 2 is truthy for odd numbers (1, 3) and falsy (0) for even numbers. So only odd numbers pass the filter.",
        explanationID: "x % 2 adalah truthy untuk bilangan ganjil (1, 3) dan falsy (0) untuk bilangan genap. Jadi hanya bilangan ganjil yang lolos filter.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp042",
        questionEN: "What is the output?\n```python\na = [1, 2, 3]\nb = a[:]\nb.append(4)\nprint(a, b)\n```",
        questionID: "Apa outputnya?\n```python\na = [1, 2, 3]\nb = a[:]\nb.append(4)\nprint(a, b)\n```",
        options: [
            QuestionOption(id: "a", textEN: "[1, 2, 3] [1, 2, 3, 4]", textID: "[1, 2, 3] [1, 2, 3, 4]"),
            QuestionOption(id: "b", textEN: "[1, 2, 3, 4] [1, 2, 3, 4]", textID: "[1, 2, 3, 4] [1, 2, 3, 4]"),
            QuestionOption(id: "c", textEN: "[1, 2, 3] [4]", textID: "[1, 2, 3] [4]"),
            QuestionOption(id: "d", textEN: "Error", textID: "Error")
        ],
        correctOptionId: "a",
        explanationEN: "a[:] creates a shallow copy of the list. b is a new list, so appending to b doesn't affect a. This is different from b = a.",
        explanationID: "a[:] membuat salinan dangkal dari list. b adalah list baru, jadi menambahkan ke b tidak mempengaruhi a. Ini berbeda dari b = a.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp043",
        questionEN: "What is wrong?\n```python\nimport numpy as np\narr = np.array([1, 2, 3])\narr.append(4)\n```",
        questionID: "Apa yang salah?\n```python\nimport numpy as np\narr = np.array([1, 2, 3])\narr.append(4)\n```",
        options: [
            QuestionOption(id: "a", textEN: "NumPy arrays don't have append method - use np.append(arr, 4)", textID: "Array NumPy tidak memiliki metode append - gunakan np.append(arr, 4)"),
            QuestionOption(id: "b", textEN: "Wrong import", textID: "Import salah"),
            QuestionOption(id: "c", textEN: "Missing dtype", textID: "dtype hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "NumPy arrays are fixed-size. Use np.append(arr, 4) which returns a new array. For efficiency, pre-allocate arrays when possible.",
        explanationID: "Array NumPy berukuran tetap. Gunakan np.append(arr, 4) yang mengembalikan array baru. Untuk efisiensi, pra-alokasikan array jika memungkinkan.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp044",
        questionEN: "What is the output?\n```python\nprint(bool([]))\nprint(bool([0]))\nprint(bool([False]))\n```",
        questionID: "Apa outputnya?\n```python\nprint(bool([]))\nprint(bool([0]))\nprint(bool([False]))\n```",
        options: [
            QuestionOption(id: "a", textEN: "False\\nTrue\\nTrue", textID: "False\\nTrue\\nTrue"),
            QuestionOption(id: "b", textEN: "False\\nFalse\\nFalse", textID: "False\\nFalse\\nFalse"),
            QuestionOption(id: "c", textEN: "True\\nTrue\\nTrue", textID: "True\\nTrue\\nTrue"),
            QuestionOption(id: "d", textEN: "False\\nTrue\\nFalse", textID: "False\\nTrue\\nFalse")
        ],
        correctOptionId: "a",
        explanationEN: "Only empty sequences are falsy. [0] and [False] are non-empty lists (length 1), so they're truthy regardless of their contents.",
        explanationID: "Hanya sequence kosong yang falsy. [0] dan [False] adalah list tidak kosong (panjang 1), jadi mereka truthy terlepas dari isinya.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp045",
        questionEN: "What is the output?\n```python\nx = {1, 2, 3}\ny = {3, 4, 5}\nprint(x & y)\nprint(x | y)\n```",
        questionID: "Apa outputnya?\n```python\nx = {1, 2, 3}\ny = {3, 4, 5}\nprint(x & y)\nprint(x | y)\n```",
        options: [
            QuestionOption(id: "a", textEN: "{3}\\n{1, 2, 3, 4, 5}", textID: "{3}\\n{1, 2, 3, 4, 5}"),
            QuestionOption(id: "b", textEN: "{1, 2, 3, 4, 5}\\n{3}", textID: "{1, 2, 3, 4, 5}\\n{3}"),
            QuestionOption(id: "c", textEN: "Error", textID: "Error"),
            QuestionOption(id: "d", textEN: "{1, 2, 4, 5}\\n{3}", textID: "{1, 2, 4, 5}\\n{3}")
        ],
        correctOptionId: "a",
        explanationEN: "& is set intersection (elements in both). | is set union (elements in either). {3} is in both; {1,2,3,4,5} is the union.",
        explanationID: "& adalah intersection set (elemen di keduanya). | adalah union set (elemen di salah satu). {3} ada di keduanya; {1,2,3,4,5} adalah union.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp046",
        questionEN: "What is the bug?\n```python\ndef count_occurrences(lst, target):\n    count = 0\n    for item in lst:\n        if item is target:\n            count += 1\n    return count\n\nprint(count_occurrences([1, 1, 2, 1], 1))\n```",
        questionID: "Apa bugnya?\n```python\ndef count_occurrences(lst, target):\n    count = 0\n    for item in lst:\n        if item is target:\n            count += 1\n    return count\n\nprint(count_occurrences([1, 1, 2, 1], 1))\n```",
        options: [
            QuestionOption(id: "a", textEN: "Should use == not 'is' for value comparison (may work for small ints but not reliably)", textID: "Seharusnya menggunakan == bukan 'is' untuk perbandingan nilai (mungkin bekerja untuk int kecil tetapi tidak andal)"),
            QuestionOption(id: "b", textEN: "Wrong loop", textID: "Loop salah"),
            QuestionOption(id: "c", textEN: "Missing return", textID: "Return hilang"),
            QuestionOption(id: "d", textEN: "No bug", textID: "Tidak ada bug")
        ],
        correctOptionId: "a",
        explanationEN: "'is' checks object identity, not value equality. It may work for small integers due to Python's caching, but fails for larger numbers or other types. Use == for value comparison.",
        explanationID: "'is' memeriksa identitas objek, bukan kesamaan nilai. Mungkin bekerja untuk integer kecil karena caching Python, tetapi gagal untuk angka lebih besar atau tipe lain. Gunakan == untuk perbandingan nilai.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp047",
        questionEN: "What is the output?\n```python\ndef outer():\n    x = 1\n    def inner():\n        x = 2\n    inner()\n    print(x)\nouter()\n```",
        questionID: "Apa outputnya?\n```python\ndef outer():\n    x = 1\n    def inner():\n        x = 2\n    inner()\n    print(x)\nouter()\n```",
        options: [
            QuestionOption(id: "a", textEN: "1", textID: "1"),
            QuestionOption(id: "b", textEN: "2", textID: "2"),
            QuestionOption(id: "c", textEN: "Error", textID: "Error"),
            QuestionOption(id: "d", textEN: "None", textID: "None")
        ],
        correctOptionId: "a",
        explanationEN: "x = 2 in inner() creates a new local variable, it doesn't modify outer's x. To modify the enclosing x, use 'nonlocal x' in inner().",
        explanationID: "x = 2 di inner() membuat variabel lokal baru, tidak memodifikasi x milik outer. Untuk memodifikasi x yang melingkupi, gunakan 'nonlocal x' di inner().",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp048",
        questionEN: "What is wrong?\n```python\nimport pandas as pd\ndf = pd.DataFrame({'A': [1, 2, 3]})\nfor row in df:\n    print(row['A'])\n```",
        questionID: "Apa yang salah?\n```python\nimport pandas as pd\ndf = pd.DataFrame({'A': [1, 2, 3]})\nfor row in df:\n    print(row['A'])\n```",
        options: [
            QuestionOption(id: "a", textEN: "Iterating df gives column names, not rows. Use df.iterrows() for rows", textID: "Iterasi df memberikan nama kolom, bukan baris. Gunakan df.iterrows() untuk baris"),
            QuestionOption(id: "b", textEN: "Wrong DataFrame creation", textID: "Pembuatan DataFrame salah"),
            QuestionOption(id: "c", textEN: "Missing index", textID: "Indeks hilang"),
            QuestionOption(id: "d", textEN: "No error", textID: "Tidak ada error")
        ],
        correctOptionId: "a",
        explanationEN: "for row in df iterates over column names (strings), not rows. Use for index, row in df.iterrows() or df.itertuples() for rows.",
        explanationID: "for row in df beriterasi pada nama kolom (string), bukan baris. Gunakan for index, row in df.iterrows() atau df.itertuples() untuk baris.",
        topic: "problemSolving",
        difficulty: .intermediate
    ),
    Question(
        id: "dbgp049",
        questionEN: "What is the output?\n```python\ntry:\n    x = 1/0\nexcept:\n    print('Error')\nfinally:\n    print('Done')\n```",
        questionID: "Apa outputnya?\n```python\ntry:\n    x = 1/0\nexcept:\n    print('Error')\nfinally:\n    print('Done')\n```",
        options: [
            QuestionOption(id: "a", textEN: "Error\\nDone", textID: "Error\\nDone"),
            QuestionOption(id: "b", textEN: "Error", textID: "Error"),
            QuestionOption(id: "c", textEN: "Done", textID: "Done"),
            QuestionOption(id: "d", textEN: "ZeroDivisionError", textID: "ZeroDivisionError")
        ],
        correctOptionId: "a",
        explanationEN: "except catches the ZeroDivisionError and prints 'Error'. finally always runs regardless of exceptions, printing 'Done'.",
        explanationID: "except menangkap ZeroDivisionError dan mencetak 'Error'. finally selalu berjalan terlepas dari exception, mencetak 'Done'.",
        topic: "problemSolving",
        difficulty: .beginner
    ),
    Question(
        id: "dbgp050",
        questionEN: "What is the bug?\n```python\ndef get_user_data():\n    user = {'name': 'Alice'}\n    return user\n\nuser = get_user_data()\nuser['age'] = 25\nprint(get_user_data())\n```",
        questionID: "Apa bugnya?\n```python\ndef get_user_data():\n    user = {'name': 'Alice'}\n    return user\n\nuser = get_user_data()\nuser['age'] = 25\nprint(get_user_data())\n```",
        options: [
            QuestionOption(id: "a", textEN: "No bug - each call creates a new dict, prints {'name': 'Alice'}", textID: "Tidak ada bug - setiap panggilan membuat dict baru, mencetak {'name': 'Alice'}"),
            QuestionOption(id: "b", textEN: "Prints {'name': 'Alice', 'age': 25}", textID: "Mencetak {'name': 'Alice', 'age': 25}"),
            QuestionOption(id: "c", textEN: "KeyError", textID: "KeyError"),
            QuestionOption(id: "d", textEN: "Syntax error", textID: "Syntax error")
        ],
        correctOptionId: "a",
        explanationEN: "Each call to get_user_data() creates a new dictionary object. Modifying the returned dict doesn't affect future calls. This is correct behavior.",
        explanationID: "Setiap panggilan ke get_user_data() membuat objek dictionary baru. Memodifikasi dict yang dikembalikan tidak mempengaruhi panggilan di masa depan. Ini adalah perilaku yang benar.",
        topic: "problemSolving",
        difficulty: .intermediate
    )
]
