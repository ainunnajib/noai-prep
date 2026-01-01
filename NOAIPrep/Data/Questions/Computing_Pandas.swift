import Foundation

// MARK: - Computing: Pandas Questions (50 questions)
// Subcategory: DataFrames, Series, data manipulation, analysis

let pandasQuestions: [Question] = [
    // Batch 1: Basic Pandas (10 questions)
    Question(
        id: "pd001",
        questionEN: "What is the primary data structure in Pandas for 2D tabular data?",
        questionID: "Apa struktur data utama di Pandas untuk data tabel 2D?",
        options: [
            QuestionOption(id: "a", textEN: "Series", textID: "Series"),
            QuestionOption(id: "b", textEN: "DataFrame", textID: "DataFrame"),
            QuestionOption(id: "c", textEN: "Array", textID: "Array"),
            QuestionOption(id: "d", textEN: "Matrix", textID: "Matrix")
        ],
        correctOptionId: "b",
        explanationEN: "DataFrame is Pandas' primary 2D data structure with labeled rows and columns. Series is for 1D labeled data.",
        explanationID: "DataFrame adalah struktur data 2D utama Pandas dengan baris dan kolom berlabel. Series untuk data 1D berlabel.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd002",
        questionEN: "How do you read a CSV file into a DataFrame?",
        questionID: "Bagaimana cara membaca file CSV ke DataFrame?",
        options: [
            QuestionOption(id: "a", textEN: "pd.read_csv('file.csv')", textID: "pd.read_csv('file.csv')"),
            QuestionOption(id: "b", textEN: "pd.load_csv('file.csv')", textID: "pd.load_csv('file.csv')"),
            QuestionOption(id: "c", textEN: "pd.open_csv('file.csv')", textID: "pd.open_csv('file.csv')"),
            QuestionOption(id: "d", textEN: "pd.DataFrame.csv('file.csv')", textID: "pd.DataFrame.csv('file.csv')")
        ],
        correctOptionId: "a",
        explanationEN: "pd.read_csv() is the standard function to read CSV files. It supports many parameters like sep, header, index_col, etc.",
        explanationID: "pd.read_csv() adalah fungsi standar untuk membaca file CSV. Mendukung banyak parameter seperti sep, header, index_col, dll.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd003",
        questionEN: "What does df.head() return?",
        questionID: "Apa yang dikembalikan df.head()?",
        options: [
            QuestionOption(id: "a", textEN: "First row only", textID: "Baris pertama saja"),
            QuestionOption(id: "b", textEN: "First 5 rows by default", textID: "5 baris pertama secara default"),
            QuestionOption(id: "c", textEN: "Column headers", textID: "Header kolom"),
            QuestionOption(id: "d", textEN: "Summary statistics", textID: "Statistik ringkasan")
        ],
        correctOptionId: "b",
        explanationEN: "df.head() returns the first 5 rows by default. Use df.head(n) to get first n rows. df.tail() gets last rows.",
        explanationID: "df.head() mengembalikan 5 baris pertama secara default. Gunakan df.head(n) untuk mendapatkan n baris pertama. df.tail() mendapatkan baris terakhir.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd004",
        questionEN: "What does df.shape return?",
        questionID: "Apa yang dikembalikan df.shape?",
        options: [
            QuestionOption(id: "a", textEN: "Number of rows only", textID: "Jumlah baris saja"),
            QuestionOption(id: "b", textEN: "Number of columns only", textID: "Jumlah kolom saja"),
            QuestionOption(id: "c", textEN: "Tuple of (rows, columns)", textID: "Tuple dari (baris, kolom)"),
            QuestionOption(id: "d", textEN: "Total number of elements", textID: "Total jumlah elemen")
        ],
        correctOptionId: "c",
        explanationEN: "df.shape returns a tuple (number_of_rows, number_of_columns). For a 100x5 DataFrame, shape is (100, 5).",
        explanationID: "df.shape mengembalikan tuple (jumlah_baris, jumlah_kolom). Untuk DataFrame 100x5, shape adalah (100, 5).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd005",
        questionEN: "How do you select a single column 'name' from DataFrame df?",
        questionID: "Bagaimana cara memilih satu kolom 'name' dari DataFrame df?",
        options: [
            QuestionOption(id: "a", textEN: "df['name'] or df.name", textID: "df['name'] atau df.name"),
            QuestionOption(id: "b", textEN: "df.column('name')", textID: "df.column('name')"),
            QuestionOption(id: "c", textEN: "df.get_column('name')", textID: "df.get_column('name')"),
            QuestionOption(id: "d", textEN: "df.select('name')", textID: "df.select('name')")
        ],
        correctOptionId: "a",
        explanationEN: "Both df['name'] and df.name work for column selection. df['name'] is preferred as it works for column names with spaces.",
        explanationID: "df['name'] dan df.name keduanya bekerja untuk pemilihan kolom. df['name'] lebih disukai karena bekerja untuk nama kolom dengan spasi.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd006",
        questionEN: "What is the difference between df.loc[] and df.iloc[]?",
        questionID: "Apa perbedaan antara df.loc[] dan df.iloc[]?",
        options: [
            QuestionOption(id: "a", textEN: "loc uses labels, iloc uses integer positions", textID: "loc menggunakan label, iloc menggunakan posisi integer"),
            QuestionOption(id: "b", textEN: "loc uses integers, iloc uses labels", textID: "loc menggunakan integer, iloc menggunakan label"),
            QuestionOption(id: "c", textEN: "They are the same", textID: "Keduanya sama"),
            QuestionOption(id: "d", textEN: "loc is for rows, iloc is for columns", textID: "loc untuk baris, iloc untuk kolom")
        ],
        correctOptionId: "a",
        explanationEN: "loc[] uses label-based indexing (row/column names). iloc[] uses integer-based positional indexing (0, 1, 2...).",
        explanationID: "loc[] menggunakan indexing berbasis label (nama baris/kolom). iloc[] menggunakan indexing posisional berbasis integer (0, 1, 2...).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd007",
        questionEN: "What does df.info() display?",
        questionID: "Apa yang ditampilkan df.info()?",
        options: [
            QuestionOption(id: "a", textEN: "First few rows of data", textID: "Beberapa baris pertama data"),
            QuestionOption(id: "b", textEN: "Summary info: dtypes, non-null counts, memory usage", textID: "Info ringkasan: dtype, jumlah non-null, penggunaan memori"),
            QuestionOption(id: "c", textEN: "Statistical summary", textID: "Ringkasan statistik"),
            QuestionOption(id: "d", textEN: "Column names only", textID: "Nama kolom saja")
        ],
        correctOptionId: "b",
        explanationEN: "df.info() shows index dtype, column dtypes, non-null counts, and memory usage. Great for understanding data structure.",
        explanationID: "df.info() menunjukkan dtype index, dtype kolom, jumlah non-null, dan penggunaan memori. Bagus untuk memahami struktur data.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd008",
        questionEN: "What does df.describe() return?",
        questionID: "Apa yang dikembalikan df.describe()?",
        options: [
            QuestionOption(id: "a", textEN: "Data types of each column", textID: "Tipe data setiap kolom"),
            QuestionOption(id: "b", textEN: "Statistical summary (count, mean, std, min, max, quartiles)", textID: "Ringkasan statistik (count, mean, std, min, max, kuartil)"),
            QuestionOption(id: "c", textEN: "Column descriptions/labels", textID: "Deskripsi/label kolom"),
            QuestionOption(id: "d", textEN: "Missing value counts", textID: "Jumlah nilai yang hilang")
        ],
        correctOptionId: "b",
        explanationEN: "df.describe() generates descriptive statistics: count, mean, std, min, 25%, 50%, 75%, max for numeric columns.",
        explanationID: "df.describe() menghasilkan statistik deskriptif: count, mean, std, min, 25%, 50%, 75%, max untuk kolom numerik.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd009",
        questionEN: "How do you check for missing values in a DataFrame?",
        questionID: "Bagaimana cara memeriksa nilai yang hilang dalam DataFrame?",
        options: [
            QuestionOption(id: "a", textEN: "df.missing()", textID: "df.missing()"),
            QuestionOption(id: "b", textEN: "df.isnull() or df.isna()", textID: "df.isnull() atau df.isna()"),
            QuestionOption(id: "c", textEN: "df.null_count()", textID: "df.null_count()"),
            QuestionOption(id: "d", textEN: "df.empty()", textID: "df.empty()")
        ],
        correctOptionId: "b",
        explanationEN: "df.isnull() and df.isna() return boolean DataFrame. Use df.isnull().sum() to count missing values per column.",
        explanationID: "df.isnull() dan df.isna() mengembalikan DataFrame boolean. Gunakan df.isnull().sum() untuk menghitung nilai yang hilang per kolom.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd010",
        questionEN: "What does df.dropna() do?",
        questionID: "Apa yang dilakukan df.dropna()?",
        options: [
            QuestionOption(id: "a", textEN: "Fills missing values with 0", textID: "Mengisi nilai yang hilang dengan 0"),
            QuestionOption(id: "b", textEN: "Removes rows containing any missing values", textID: "Menghapus baris yang mengandung nilai yang hilang"),
            QuestionOption(id: "c", textEN: "Removes only completely empty rows", textID: "Menghapus hanya baris yang sepenuhnya kosong"),
            QuestionOption(id: "d", textEN: "Counts missing values", textID: "Menghitung nilai yang hilang")
        ],
        correctOptionId: "b",
        explanationEN: "df.dropna() removes rows with any NaN values. Use how='all' to drop only if all values are NaN. Use axis=1 for columns.",
        explanationID: "df.dropna() menghapus baris dengan nilai NaN. Gunakan how='all' untuk menghapus hanya jika semua nilai NaN. Gunakan axis=1 untuk kolom.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 2: Data Manipulation (10 questions)
    Question(
        id: "pd011",
        questionEN: "What does df.fillna(0) do?",
        questionID: "Apa yang dilakukan df.fillna(0)?",
        options: [
            QuestionOption(id: "a", textEN: "Replaces all values with 0", textID: "Mengganti semua nilai dengan 0"),
            QuestionOption(id: "b", textEN: "Replaces NaN values with 0", textID: "Mengganti nilai NaN dengan 0"),
            QuestionOption(id: "c", textEN: "Fills empty strings with 0", textID: "Mengisi string kosong dengan 0"),
            QuestionOption(id: "d", textEN: "Adds 0 to all values", textID: "Menambah 0 ke semua nilai")
        ],
        correctOptionId: "b",
        explanationEN: "df.fillna(value) replaces NaN with the specified value. Can also use method='ffill' (forward fill) or 'bfill' (backward fill).",
        explanationID: "df.fillna(value) mengganti NaN dengan nilai yang ditentukan. Bisa juga gunakan method='ffill' (forward fill) atau 'bfill' (backward fill).",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd012",
        questionEN: "How do you filter rows where column 'age' is greater than 25?",
        questionID: "Bagaimana cara memfilter baris di mana kolom 'age' lebih besar dari 25?",
        options: [
            QuestionOption(id: "a", textEN: "df.filter(age > 25)", textID: "df.filter(age > 25)"),
            QuestionOption(id: "b", textEN: "df[df['age'] > 25]", textID: "df[df['age'] > 25]"),
            QuestionOption(id: "c", textEN: "df.where('age' > 25)", textID: "df.where('age' > 25)"),
            QuestionOption(id: "d", textEN: "df.query(age > 25)", textID: "df.query(age > 25)")
        ],
        correctOptionId: "b",
        explanationEN: "Boolean indexing: df[condition] returns rows where condition is True. df.query('age > 25') is an alternative.",
        explanationID: "Boolean indexing: df[condition] mengembalikan baris di mana kondisi True. df.query('age > 25') adalah alternatif.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd013",
        questionEN: "How do you combine two conditions in Pandas filtering?",
        questionID: "Bagaimana cara menggabungkan dua kondisi dalam filtering Pandas?",
        options: [
            QuestionOption(id: "a", textEN: "df[(df['a'] > 1) and (df['b'] < 5)]", textID: "df[(df['a'] > 1) and (df['b'] < 5)]"),
            QuestionOption(id: "b", textEN: "df[(df['a'] > 1) & (df['b'] < 5)]", textID: "df[(df['a'] > 1) & (df['b'] < 5)]"),
            QuestionOption(id: "c", textEN: "df[df['a'] > 1 && df['b'] < 5]", textID: "df[df['a'] > 1 && df['b'] < 5]"),
            QuestionOption(id: "d", textEN: "df.filter(a > 1, b < 5)", textID: "df.filter(a > 1, b < 5)")
        ],
        correctOptionId: "b",
        explanationEN: "Use & for AND, | for OR (not 'and'/'or'). Each condition must be in parentheses: (cond1) & (cond2).",
        explanationID: "Gunakan & untuk AND, | untuk OR (bukan 'and'/'or'). Setiap kondisi harus dalam tanda kurung: (cond1) & (cond2).",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd014",
        questionEN: "What does df.sort_values('column', ascending=False) do?",
        questionID: "Apa yang dilakukan df.sort_values('column', ascending=False)?",
        options: [
            QuestionOption(id: "a", textEN: "Sorts by column in ascending order", textID: "Mengurutkan berdasarkan kolom secara ascending"),
            QuestionOption(id: "b", textEN: "Sorts by column in descending order", textID: "Mengurutkan berdasarkan kolom secara descending"),
            QuestionOption(id: "c", textEN: "Removes duplicate values in column", textID: "Menghapus nilai duplikat di kolom"),
            QuestionOption(id: "d", textEN: "Reverses the row order", textID: "Membalik urutan baris")
        ],
        correctOptionId: "b",
        explanationEN: "sort_values() sorts by specified column(s). ascending=False means descending (highest first). Default is ascending=True.",
        explanationID: "sort_values() mengurutkan berdasarkan kolom yang ditentukan. ascending=False berarti descending (tertinggi dulu). Default adalah ascending=True.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd015",
        questionEN: "What does df.groupby('category').mean() do?",
        questionID: "Apa yang dilakukan df.groupby('category').mean()?",
        options: [
            QuestionOption(id: "a", textEN: "Calculates mean of all numeric columns per category", textID: "Menghitung mean semua kolom numerik per kategori"),
            QuestionOption(id: "b", textEN: "Groups data but doesn't calculate anything", textID: "Mengelompokkan data tapi tidak menghitung apa-apa"),
            QuestionOption(id: "c", textEN: "Returns the mean of the category column", textID: "Mengembalikan mean dari kolom category"),
            QuestionOption(id: "d", textEN: "Creates category means as new rows", textID: "Membuat mean kategori sebagai baris baru")
        ],
        correctOptionId: "a",
        explanationEN: "groupby() groups rows by column values, then aggregation functions (mean, sum, count, etc.) are applied to each group.",
        explanationID: "groupby() mengelompokkan baris berdasarkan nilai kolom, lalu fungsi agregasi (mean, sum, count, dll.) diterapkan ke setiap grup.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd016",
        questionEN: "What does df.value_counts() do on a Series?",
        questionID: "Apa yang dilakukan df.value_counts() pada Series?",
        options: [
            QuestionOption(id: "a", textEN: "Counts total number of values", textID: "Menghitung total jumlah nilai"),
            QuestionOption(id: "b", textEN: "Counts occurrences of each unique value", textID: "Menghitung kemunculan setiap nilai unik"),
            QuestionOption(id: "c", textEN: "Validates value types", textID: "Memvalidasi tipe nilai"),
            QuestionOption(id: "d", textEN: "Returns True/False for each value", textID: "Mengembalikan True/False untuk setiap nilai")
        ],
        correctOptionId: "b",
        explanationEN: "value_counts() returns a Series with counts of unique values, sorted by frequency descending. Useful for categorical data.",
        explanationID: "value_counts() mengembalikan Series dengan jumlah nilai unik, diurutkan berdasarkan frekuensi descending. Berguna untuk data kategorikal.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd017",
        questionEN: "How do you rename columns in a DataFrame?",
        questionID: "Bagaimana cara mengganti nama kolom di DataFrame?",
        options: [
            QuestionOption(id: "a", textEN: "df.columns = ['new1', 'new2']", textID: "df.columns = ['new1', 'new2']"),
            QuestionOption(id: "b", textEN: "df.rename(columns={'old': 'new'})", textID: "df.rename(columns={'old': 'new'})"),
            QuestionOption(id: "c", textEN: "Both A and B work", textID: "A dan B keduanya bekerja"),
            QuestionOption(id: "d", textEN: "df.set_columns(['new1', 'new2'])", textID: "df.set_columns(['new1', 'new2'])")
        ],
        correctOptionId: "c",
        explanationEN: "Both methods work: df.columns = [...] replaces all column names; df.rename(columns={...}) renames specific columns.",
        explanationID: "Kedua metode bekerja: df.columns = [...] mengganti semua nama kolom; df.rename(columns={...}) mengganti nama kolom tertentu.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd018",
        questionEN: "What does df.drop('column_name', axis=1) do?",
        questionID: "Apa yang dilakukan df.drop('column_name', axis=1)?",
        options: [
            QuestionOption(id: "a", textEN: "Drops a row with that name", textID: "Menghapus baris dengan nama itu"),
            QuestionOption(id: "b", textEN: "Drops the specified column", textID: "Menghapus kolom yang ditentukan"),
            QuestionOption(id: "c", textEN: "Sets column values to null", textID: "Mengatur nilai kolom ke null"),
            QuestionOption(id: "d", textEN: "Moves column to the end", textID: "Memindahkan kolom ke akhir")
        ],
        correctOptionId: "b",
        explanationEN: "df.drop() removes rows (axis=0) or columns (axis=1). Use inplace=True to modify the original DataFrame.",
        explanationID: "df.drop() menghapus baris (axis=0) atau kolom (axis=1). Gunakan inplace=True untuk memodifikasi DataFrame asli.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd019",
        questionEN: "What does df.apply(func) do?",
        questionID: "Apa yang dilakukan df.apply(func)?",
        options: [
            QuestionOption(id: "a", textEN: "Applies function to each element", textID: "Menerapkan fungsi ke setiap elemen"),
            QuestionOption(id: "b", textEN: "Applies function to each column (or row with axis=1)", textID: "Menerapkan fungsi ke setiap kolom (atau baris dengan axis=1)"),
            QuestionOption(id: "c", textEN: "Applies function only to numeric columns", textID: "Menerapkan fungsi hanya ke kolom numerik"),
            QuestionOption(id: "d", textEN: "Applies function to the entire DataFrame at once", textID: "Menerapkan fungsi ke seluruh DataFrame sekaligus")
        ],
        correctOptionId: "b",
        explanationEN: "df.apply() applies a function along an axis: axis=0 applies to each column, axis=1 applies to each row. Use applymap() for element-wise.",
        explanationID: "df.apply() menerapkan fungsi sepanjang axis: axis=0 diterapkan ke setiap kolom, axis=1 diterapkan ke setiap baris. Gunakan applymap() untuk element-wise.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd020",
        questionEN: "How do you add a new column 'total' to df?",
        questionID: "Bagaimana cara menambah kolom baru 'total' ke df?",
        options: [
            QuestionOption(id: "a", textEN: "df.add_column('total', values)", textID: "df.add_column('total', values)"),
            QuestionOption(id: "b", textEN: "df['total'] = values", textID: "df['total'] = values"),
            QuestionOption(id: "c", textEN: "df.insert('total', values)", textID: "df.insert('total', values)"),
            QuestionOption(id: "d", textEN: "df.new('total', values)", textID: "df.new('total', values)")
        ],
        correctOptionId: "b",
        explanationEN: "Simply assign to a new column name: df['new_col'] = values. The values can be a scalar, list, Series, or computed from other columns.",
        explanationID: "Cukup assign ke nama kolom baru: df['new_col'] = values. Nilai bisa skalar, list, Series, atau dihitung dari kolom lain.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 3: Advanced Operations (10 questions)
    Question(
        id: "pd021",
        questionEN: "What does pd.merge(df1, df2, on='key') do?",
        questionID: "Apa yang dilakukan pd.merge(df1, df2, on='key')?",
        options: [
            QuestionOption(id: "a", textEN: "Concatenates df1 and df2 vertically", textID: "Menggabungkan df1 dan df2 secara vertikal"),
            QuestionOption(id: "b", textEN: "Joins df1 and df2 on matching 'key' values", textID: "Menggabungkan df1 dan df2 pada nilai 'key' yang cocok"),
            QuestionOption(id: "c", textEN: "Replaces df1 values with df2", textID: "Mengganti nilai df1 dengan df2"),
            QuestionOption(id: "d", textEN: "Appends df2 columns to df1", textID: "Menambahkan kolom df2 ke df1")
        ],
        correctOptionId: "b",
        explanationEN: "pd.merge() performs SQL-like joins on DataFrames. Use how='left', 'right', 'inner', 'outer' for different join types.",
        explanationID: "pd.merge() melakukan join seperti SQL pada DataFrame. Gunakan how='left', 'right', 'inner', 'outer' untuk tipe join berbeda.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd022",
        questionEN: "What is the difference between pd.concat() and pd.merge()?",
        questionID: "Apa perbedaan antara pd.concat() dan pd.merge()?",
        options: [
            QuestionOption(id: "a", textEN: "concat stacks DataFrames, merge joins on keys", textID: "concat menumpuk DataFrame, merge menggabungkan pada key"),
            QuestionOption(id: "b", textEN: "They are the same function", textID: "Keduanya fungsi yang sama"),
            QuestionOption(id: "c", textEN: "merge stacks DataFrames, concat joins on keys", textID: "merge menumpuk DataFrame, concat menggabungkan pada key"),
            QuestionOption(id: "d", textEN: "concat is for Series only", textID: "concat hanya untuk Series")
        ],
        correctOptionId: "a",
        explanationEN: "concat() stacks DataFrames vertically (axis=0) or horizontally (axis=1). merge() joins DataFrames based on common columns.",
        explanationID: "concat() menumpuk DataFrame secara vertikal (axis=0) atau horizontal (axis=1). merge() menggabungkan DataFrame berdasarkan kolom umum.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd023",
        questionEN: "What does df.pivot_table(values='sales', index='region', columns='product', aggfunc='sum') create?",
        questionID: "Apa yang dibuat df.pivot_table(values='sales', index='region', columns='product', aggfunc='sum')?",
        options: [
            QuestionOption(id: "a", textEN: "A table with regions as rows, products as columns, sum of sales as values", textID: "Tabel dengan region sebagai baris, product sebagai kolom, jumlah sales sebagai nilai"),
            QuestionOption(id: "b", textEN: "A simple filtered DataFrame", textID: "DataFrame yang difilter sederhana"),
            QuestionOption(id: "c", textEN: "A transposed version of the DataFrame", textID: "Versi transpose dari DataFrame"),
            QuestionOption(id: "d", textEN: "A list of unique sales values", textID: "Daftar nilai sales unik")
        ],
        correctOptionId: "a",
        explanationEN: "Pivot tables reshape data: rows are defined by index, columns by columns parameter, and values are aggregated using aggfunc.",
        explanationID: "Pivot table mengubah bentuk data: baris didefinisikan oleh index, kolom oleh parameter columns, dan nilai diagregasi menggunakan aggfunc.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd024",
        questionEN: "What does df.melt() do?",
        questionID: "Apa yang dilakukan df.melt()?",
        options: [
            QuestionOption(id: "a", textEN: "Combines all columns into one", textID: "Menggabungkan semua kolom menjadi satu"),
            QuestionOption(id: "b", textEN: "Unpivots DataFrame from wide to long format", textID: "Unpivot DataFrame dari format wide ke long"),
            QuestionOption(id: "c", textEN: "Removes duplicate rows", textID: "Menghapus baris duplikat"),
            QuestionOption(id: "d", textEN: "Flattens nested data", textID: "Meratakan data bersarang")
        ],
        correctOptionId: "b",
        explanationEN: "melt() converts wide-format data to long-format. Columns become values in a 'variable' column, with their values in a 'value' column.",
        explanationID: "melt() mengonversi data format wide ke long. Kolom menjadi nilai dalam kolom 'variable', dengan nilainya di kolom 'value'.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd025",
        questionEN: "What does df.agg({'col1': 'sum', 'col2': 'mean'}) do?",
        questionID: "Apa yang dilakukan df.agg({'col1': 'sum', 'col2': 'mean'})?",
        options: [
            QuestionOption(id: "a", textEN: "Applies sum to col1 and mean to col2", textID: "Menerapkan sum ke col1 dan mean ke col2"),
            QuestionOption(id: "b", textEN: "Applies both sum and mean to all columns", textID: "Menerapkan sum dan mean ke semua kolom"),
            QuestionOption(id: "c", textEN: "Renames columns to sum and mean", textID: "Mengganti nama kolom menjadi sum dan mean"),
            QuestionOption(id: "d", textEN: "Creates new columns sum_col1 and mean_col2", textID: "Membuat kolom baru sum_col1 dan mean_col2")
        ],
        correctOptionId: "a",
        explanationEN: "agg() allows applying different aggregation functions to different columns. Can also pass a list to apply multiple functions per column.",
        explanationID: "agg() memungkinkan menerapkan fungsi agregasi berbeda ke kolom berbeda. Bisa juga meneruskan list untuk menerapkan beberapa fungsi per kolom.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd026",
        questionEN: "What does df.duplicated() return?",
        questionID: "Apa yang dikembalikan df.duplicated()?",
        options: [
            QuestionOption(id: "a", textEN: "Count of duplicate rows", textID: "Jumlah baris duplikat"),
            QuestionOption(id: "b", textEN: "Boolean Series indicating duplicate rows", textID: "Series boolean yang menunjukkan baris duplikat"),
            QuestionOption(id: "c", textEN: "DataFrame with duplicates removed", textID: "DataFrame dengan duplikat dihapus"),
            QuestionOption(id: "d", textEN: "List of duplicate values", textID: "Daftar nilai duplikat")
        ],
        correctOptionId: "b",
        explanationEN: "duplicated() returns boolean Series where True indicates a duplicate row. Use df.drop_duplicates() to remove duplicates.",
        explanationID: "duplicated() mengembalikan Series boolean di mana True menunjukkan baris duplikat. Gunakan df.drop_duplicates() untuk menghapus duplikat.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd027",
        questionEN: "How do you convert a column to datetime type?",
        questionID: "Bagaimana cara mengonversi kolom ke tipe datetime?",
        options: [
            QuestionOption(id: "a", textEN: "df['date'].to_datetime()", textID: "df['date'].to_datetime()"),
            QuestionOption(id: "b", textEN: "pd.to_datetime(df['date'])", textID: "pd.to_datetime(df['date'])"),
            QuestionOption(id: "c", textEN: "df['date'].astype('datetime')", textID: "df['date'].astype('datetime')"),
            QuestionOption(id: "d", textEN: "datetime(df['date'])", textID: "datetime(df['date'])")
        ],
        correctOptionId: "b",
        explanationEN: "pd.to_datetime() converts strings/numbers to datetime. Supports various formats and the format parameter for custom parsing.",
        explanationID: "pd.to_datetime() mengonversi string/angka ke datetime. Mendukung berbagai format dan parameter format untuk parsing kustom.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd028",
        questionEN: "What does df.set_index('column') do?",
        questionID: "Apa yang dilakukan df.set_index('column')?",
        options: [
            QuestionOption(id: "a", textEN: "Adds a new index column", textID: "Menambah kolom index baru"),
            QuestionOption(id: "b", textEN: "Sets the specified column as the DataFrame index", textID: "Mengatur kolom yang ditentukan sebagai index DataFrame"),
            QuestionOption(id: "c", textEN: "Sorts the DataFrame by that column", textID: "Mengurutkan DataFrame berdasarkan kolom itu"),
            QuestionOption(id: "d", textEN: "Resets the index to default", textID: "Mereset index ke default")
        ],
        correctOptionId: "b",
        explanationEN: "set_index() makes a column the row index. Use reset_index() to convert index back to a regular column.",
        explanationID: "set_index() menjadikan kolom sebagai index baris. Gunakan reset_index() untuk mengonversi index kembali ke kolom biasa.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd029",
        questionEN: "What does df.astype({'col1': 'int', 'col2': 'float'}) do?",
        questionID: "Apa yang dilakukan df.astype({'col1': 'int', 'col2': 'float'})?",
        options: [
            QuestionOption(id: "a", textEN: "Checks if columns have those types", textID: "Memeriksa apakah kolom memiliki tipe tersebut"),
            QuestionOption(id: "b", textEN: "Converts column data types as specified", textID: "Mengonversi tipe data kolom sesuai yang ditentukan"),
            QuestionOption(id: "c", textEN: "Filters rows by data type", textID: "Memfilter baris berdasarkan tipe data"),
            QuestionOption(id: "d", textEN: "Creates new columns with those types", textID: "Membuat kolom baru dengan tipe tersebut")
        ],
        correctOptionId: "b",
        explanationEN: "astype() converts column data types. Can convert to int, float, str, category, datetime64, etc.",
        explanationID: "astype() mengonversi tipe data kolom. Bisa mengonversi ke int, float, str, category, datetime64, dll.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd030",
        questionEN: "What is the purpose of df.copy()?",
        questionID: "Apa tujuan df.copy()?",
        options: [
            QuestionOption(id: "a", textEN: "Creates a deep copy of the DataFrame", textID: "Membuat deep copy dari DataFrame"),
            QuestionOption(id: "b", textEN: "Copies data to clipboard", textID: "Menyalin data ke clipboard"),
            QuestionOption(id: "c", textEN: "Duplicates all rows", textID: "Menduplikasi semua baris"),
            QuestionOption(id: "d", textEN: "Creates a reference to the same DataFrame", textID: "Membuat referensi ke DataFrame yang sama")
        ],
        correctOptionId: "a",
        explanationEN: "df.copy() creates an independent copy. Without it, df2 = df creates a reference where changes to df2 affect df.",
        explanationID: "df.copy() membuat copy independen. Tanpanya, df2 = df membuat referensi di mana perubahan pada df2 mempengaruhi df.",
        topic: "computing",
        difficulty: .intermediate
    ),

    // Batch 4: Data Analysis (10 questions)
    Question(
        id: "pd031",
        questionEN: "What does df.corr() compute?",
        questionID: "Apa yang dihitung df.corr()?",
        options: [
            QuestionOption(id: "a", textEN: "Correlation matrix between all numeric columns", textID: "Matriks korelasi antara semua kolom numerik"),
            QuestionOption(id: "b", textEN: "Corrections needed for data errors", textID: "Koreksi yang diperlukan untuk error data"),
            QuestionOption(id: "c", textEN: "Corresponding values between columns", textID: "Nilai yang bersesuaian antara kolom"),
            QuestionOption(id: "d", textEN: "Count of correct values", textID: "Jumlah nilai yang benar")
        ],
        correctOptionId: "a",
        explanationEN: "corr() computes pairwise Pearson correlation coefficients between numeric columns. Values range from -1 to 1.",
        explanationID: "corr() menghitung koefisien korelasi Pearson berpasangan antara kolom numerik. Nilai berkisar dari -1 sampai 1.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd032",
        questionEN: "What does df.sample(n=10) do?",
        questionID: "Apa yang dilakukan df.sample(n=10)?",
        options: [
            QuestionOption(id: "a", textEN: "Returns first 10 rows", textID: "Mengembalikan 10 baris pertama"),
            QuestionOption(id: "b", textEN: "Returns 10 random rows", textID: "Mengembalikan 10 baris acak"),
            QuestionOption(id: "c", textEN: "Returns every 10th row", textID: "Mengembalikan setiap baris ke-10"),
            QuestionOption(id: "d", textEN: "Returns 10% of rows", textID: "Mengembalikan 10% baris")
        ],
        correctOptionId: "b",
        explanationEN: "sample() returns random rows. Use frac=0.1 for 10% of rows. Use random_state for reproducibility.",
        explanationID: "sample() mengembalikan baris acak. Gunakan frac=0.1 untuk 10% baris. Gunakan random_state untuk reprodusibilitas.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd033",
        questionEN: "What does df.nlargest(5, 'column') return?",
        questionID: "Apa yang dikembalikan df.nlargest(5, 'column')?",
        options: [
            QuestionOption(id: "a", textEN: "5 rows with largest values in 'column'", textID: "5 baris dengan nilai terbesar di 'column'"),
            QuestionOption(id: "b", textEN: "5 largest columns", textID: "5 kolom terbesar"),
            QuestionOption(id: "c", textEN: "Top 5% of values", textID: "5% nilai teratas"),
            QuestionOption(id: "d", textEN: "5 non-null values", textID: "5 nilai non-null")
        ],
        correctOptionId: "a",
        explanationEN: "nlargest() returns n rows with the largest values in the specified column. nsmallest() does the opposite.",
        explanationID: "nlargest() mengembalikan n baris dengan nilai terbesar di kolom yang ditentukan. nsmallest() melakukan sebaliknya.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd034",
        questionEN: "What does df.cumsum() compute?",
        questionID: "Apa yang dihitung df.cumsum()?",
        options: [
            QuestionOption(id: "a", textEN: "Total sum of all values", textID: "Total jumlah semua nilai"),
            QuestionOption(id: "b", textEN: "Cumulative sum along each column", textID: "Jumlah kumulatif sepanjang setiap kolom"),
            QuestionOption(id: "c", textEN: "Custom sum function", textID: "Fungsi jumlah kustom"),
            QuestionOption(id: "d", textEN: "Sum of each row", textID: "Jumlah setiap baris")
        ],
        correctOptionId: "b",
        explanationEN: "cumsum() computes cumulative sum: each value is the sum of all previous values plus itself. Useful for running totals.",
        explanationID: "cumsum() menghitung jumlah kumulatif: setiap nilai adalah jumlah semua nilai sebelumnya ditambah dirinya sendiri. Berguna untuk total berjalan.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd035",
        questionEN: "How do you get the percentage change between rows?",
        questionID: "Bagaimana cara mendapatkan persentase perubahan antar baris?",
        options: [
            QuestionOption(id: "a", textEN: "df.percent_change()", textID: "df.percent_change()"),
            QuestionOption(id: "b", textEN: "df.pct_change()", textID: "df.pct_change()"),
            QuestionOption(id: "c", textEN: "df.diff() / df", textID: "df.diff() / df"),
            QuestionOption(id: "d", textEN: "df.change_pct()", textID: "df.change_pct()")
        ],
        correctOptionId: "b",
        explanationEN: "pct_change() computes the percentage change from the previous row. First row becomes NaN. Useful for time series.",
        explanationID: "pct_change() menghitung persentase perubahan dari baris sebelumnya. Baris pertama menjadi NaN. Berguna untuk time series.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd036",
        questionEN: "What does df.rolling(window=3).mean() compute?",
        questionID: "Apa yang dihitung df.rolling(window=3).mean()?",
        options: [
            QuestionOption(id: "a", textEN: "Mean of every 3rd row", textID: "Mean setiap baris ke-3"),
            QuestionOption(id: "b", textEN: "Rolling/moving average with window size 3", textID: "Rata-rata bergerak dengan ukuran window 3"),
            QuestionOption(id: "c", textEN: "Mean of first 3 rows", textID: "Mean dari 3 baris pertama"),
            QuestionOption(id: "d", textEN: "Rounds mean to 3 decimal places", textID: "Membulatkan mean ke 3 desimal")
        ],
        correctOptionId: "b",
        explanationEN: "rolling() creates a moving window. Combined with aggregation, it computes statistics over a sliding window of specified size.",
        explanationID: "rolling() membuat window bergerak. Dikombinasikan dengan agregasi, ini menghitung statistik pada window geser dengan ukuran tertentu.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd037",
        questionEN: "What does pd.cut(df['age'], bins=[0, 18, 35, 60, 100]) do?",
        questionID: "Apa yang dilakukan pd.cut(df['age'], bins=[0, 18, 35, 60, 100])?",
        options: [
            QuestionOption(id: "a", textEN: "Removes values outside those ranges", textID: "Menghapus nilai di luar rentang tersebut"),
            QuestionOption(id: "b", textEN: "Bins age values into categorical ranges", textID: "Mengelompokkan nilai age ke dalam rentang kategorikal"),
            QuestionOption(id: "c", textEN: "Limits ages to those values", textID: "Membatasi age ke nilai-nilai tersebut"),
            QuestionOption(id: "d", textEN: "Sorts ages into 4 equal groups", textID: "Mengurutkan age menjadi 4 grup sama")
        ],
        correctOptionId: "b",
        explanationEN: "pd.cut() segments continuous values into discrete bins/categories. Useful for creating age groups, price ranges, etc.",
        explanationID: "pd.cut() membagi nilai kontinu menjadi bin/kategori diskrit. Berguna untuk membuat kelompok usia, rentang harga, dll.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd038",
        questionEN: "What does df.str.contains('pattern') do on a string column?",
        questionID: "Apa yang dilakukan df.str.contains('pattern') pada kolom string?",
        options: [
            QuestionOption(id: "a", textEN: "Replaces matches with 'pattern'", textID: "Mengganti yang cocok dengan 'pattern'"),
            QuestionOption(id: "b", textEN: "Returns boolean Series where True means pattern found", textID: "Mengembalikan Series boolean di mana True berarti pattern ditemukan"),
            QuestionOption(id: "c", textEN: "Counts occurrences of pattern", textID: "Menghitung kemunculan pattern"),
            QuestionOption(id: "d", textEN: "Extracts pattern matches", textID: "Mengekstrak kecocokan pattern")
        ],
        correctOptionId: "b",
        explanationEN: "str.contains() checks if pattern exists in each string, returning boolean. Supports regex by default.",
        explanationID: "str.contains() memeriksa apakah pattern ada di setiap string, mengembalikan boolean. Mendukung regex secara default.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd039",
        questionEN: "How do you select multiple columns ['A', 'B', 'C'] from df?",
        questionID: "Bagaimana cara memilih beberapa kolom ['A', 'B', 'C'] dari df?",
        options: [
            QuestionOption(id: "a", textEN: "df['A', 'B', 'C']", textID: "df['A', 'B', 'C']"),
            QuestionOption(id: "b", textEN: "df[['A', 'B', 'C']]", textID: "df[['A', 'B', 'C']]"),
            QuestionOption(id: "c", textEN: "df.columns('A', 'B', 'C')", textID: "df.columns('A', 'B', 'C')"),
            QuestionOption(id: "d", textEN: "df.select(['A', 'B', 'C'])", textID: "df.select(['A', 'B', 'C'])")
        ],
        correctOptionId: "b",
        explanationEN: "Use double brackets df[['col1', 'col2']] to select multiple columns. Single brackets df['col'] returns a Series.",
        explanationID: "Gunakan bracket ganda df[['col1', 'col2']] untuk memilih beberapa kolom. Bracket tunggal df['col'] mengembalikan Series.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd040",
        questionEN: "What does df.nunique() return?",
        questionID: "Apa yang dikembalikan df.nunique()?",
        options: [
            QuestionOption(id: "a", textEN: "All unique values in the DataFrame", textID: "Semua nilai unik di DataFrame"),
            QuestionOption(id: "b", textEN: "Count of unique values for each column", textID: "Jumlah nilai unik untuk setiap kolom"),
            QuestionOption(id: "c", textEN: "Boolean indicating if all values are unique", textID: "Boolean yang menunjukkan apakah semua nilai unik"),
            QuestionOption(id: "d", textEN: "Rows that are unique", textID: "Baris yang unik")
        ],
        correctOptionId: "b",
        explanationEN: "nunique() counts the number of distinct values in each column. Useful for understanding cardinality of categorical features.",
        explanationID: "nunique() menghitung jumlah nilai berbeda di setiap kolom. Berguna untuk memahami kardinalitas fitur kategorikal.",
        topic: "computing",
        difficulty: .beginner
    ),

    // Batch 5: More Pandas (10 questions)
    Question(
        id: "pd041",
        questionEN: "What does df.to_csv('file.csv', index=False) do?",
        questionID: "Apa yang dilakukan df.to_csv('file.csv', index=False)?",
        options: [
            QuestionOption(id: "a", textEN: "Saves DataFrame without row index column", textID: "Menyimpan DataFrame tanpa kolom index baris"),
            QuestionOption(id: "b", textEN: "Saves only column names, no data", textID: "Menyimpan hanya nama kolom, tanpa data"),
            QuestionOption(id: "c", textEN: "Saves without column headers", textID: "Menyimpan tanpa header kolom"),
            QuestionOption(id: "d", textEN: "Saves in binary format", textID: "Menyimpan dalam format biner")
        ],
        correctOptionId: "a",
        explanationEN: "to_csv() exports DataFrame to CSV. index=False prevents writing the row index as a column in the output file.",
        explanationID: "to_csv() mengekspor DataFrame ke CSV. index=False mencegah penulisan index baris sebagai kolom di file output.",
        topic: "computing",
        difficulty: .beginner
    ),
    Question(
        id: "pd042",
        questionEN: "What does df.query('age > 25 and salary < 50000') do?",
        questionID: "Apa yang dilakukan df.query('age > 25 and salary < 50000')?",
        options: [
            QuestionOption(id: "a", textEN: "Updates rows matching the condition", textID: "Memperbarui baris yang cocok dengan kondisi"),
            QuestionOption(id: "b", textEN: "Filters rows using SQL-like syntax", textID: "Memfilter baris menggunakan sintaks seperti SQL"),
            QuestionOption(id: "c", textEN: "Creates a database query", textID: "Membuat query database"),
            QuestionOption(id: "d", textEN: "Returns count of matching rows", textID: "Mengembalikan jumlah baris yang cocok")
        ],
        correctOptionId: "b",
        explanationEN: "query() filters DataFrame using a string expression. More readable than boolean indexing for complex conditions.",
        explanationID: "query() memfilter DataFrame menggunakan ekspresi string. Lebih mudah dibaca daripada boolean indexing untuk kondisi kompleks.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd043",
        questionEN: "What is a MultiIndex in Pandas?",
        questionID: "Apa itu MultiIndex di Pandas?",
        options: [
            QuestionOption(id: "a", textEN: "Multiple DataFrames combined", textID: "Beberapa DataFrame digabungkan"),
            QuestionOption(id: "b", textEN: "Hierarchical indexing with multiple levels", textID: "Indexing hierarkis dengan beberapa level"),
            QuestionOption(id: "c", textEN: "Multiple column types", textID: "Beberapa tipe kolom"),
            QuestionOption(id: "d", textEN: "Parallel index access", textID: "Akses index paralel")
        ],
        correctOptionId: "b",
        explanationEN: "MultiIndex allows hierarchical row/column labels with multiple levels. Created by set_index() with multiple columns or groupby().",
        explanationID: "MultiIndex memungkinkan label baris/kolom hierarkis dengan beberapa level. Dibuat oleh set_index() dengan beberapa kolom atau groupby().",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "pd044",
        questionEN: "What does df.explode('list_column') do?",
        questionID: "Apa yang dilakukan df.explode('list_column')?",
        options: [
            QuestionOption(id: "a", textEN: "Removes the column", textID: "Menghapus kolom"),
            QuestionOption(id: "b", textEN: "Expands list elements into separate rows", textID: "Memperluas elemen list menjadi baris terpisah"),
            QuestionOption(id: "c", textEN: "Splits column into multiple columns", textID: "Membagi kolom menjadi beberapa kolom"),
            QuestionOption(id: "d", textEN: "Aggregates list elements", textID: "Mengagregasi elemen list")
        ],
        correctOptionId: "b",
        explanationEN: "explode() transforms list-like elements in a column into separate rows, duplicating index values for each element.",
        explanationID: "explode() mentransformasi elemen seperti list di kolom menjadi baris terpisah, menduplikasi nilai index untuk setiap elemen.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd045",
        questionEN: "What is the difference between df.transform() and df.apply()?",
        questionID: "Apa perbedaan antara df.transform() dan df.apply()?",
        options: [
            QuestionOption(id: "a", textEN: "transform must return same-shape output, apply can aggregate", textID: "transform harus mengembalikan output shape sama, apply bisa agregasi"),
            QuestionOption(id: "b", textEN: "They are identical", textID: "Keduanya identik"),
            QuestionOption(id: "c", textEN: "apply is faster", textID: "apply lebih cepat"),
            QuestionOption(id: "d", textEN: "transform only works on groups", textID: "transform hanya bekerja pada grup")
        ],
        correctOptionId: "a",
        explanationEN: "transform() must return output with same shape as input (element-wise). apply() can return aggregated results of different shape.",
        explanationID: "transform() harus mengembalikan output dengan shape sama dengan input (element-wise). apply() bisa mengembalikan hasil agregasi dengan shape berbeda.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "pd046",
        questionEN: "What does pd.get_dummies(df['category']) create?",
        questionID: "Apa yang dibuat pd.get_dummies(df['category'])?",
        options: [
            QuestionOption(id: "a", textEN: "Dummy/placeholder values for missing data", textID: "Nilai dummy/placeholder untuk data yang hilang"),
            QuestionOption(id: "b", textEN: "One-hot encoded columns for each category", textID: "Kolom one-hot encoded untuk setiap kategori"),
            QuestionOption(id: "c", textEN: "Random sample data", textID: "Data sampel acak"),
            QuestionOption(id: "d", textEN: "Category codes as integers", textID: "Kode kategori sebagai integer")
        ],
        correctOptionId: "b",
        explanationEN: "get_dummies() performs one-hot encoding, creating binary columns for each unique category. Essential for ML with categorical data.",
        explanationID: "get_dummies() melakukan one-hot encoding, membuat kolom biner untuk setiap kategori unik. Penting untuk ML dengan data kategorikal.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd047",
        questionEN: "What does df.memory_usage() return?",
        questionID: "Apa yang dikembalikan df.memory_usage()?",
        options: [
            QuestionOption(id: "a", textEN: "CPU usage during operations", textID: "Penggunaan CPU selama operasi"),
            QuestionOption(id: "b", textEN: "Memory consumption of each column in bytes", textID: "Konsumsi memori setiap kolom dalam bytes"),
            QuestionOption(id: "c", textEN: "Optimal memory settings", textID: "Pengaturan memori optimal"),
            QuestionOption(id: "d", textEN: "History of memory allocations", textID: "Riwayat alokasi memori")
        ],
        correctOptionId: "b",
        explanationEN: "memory_usage() returns memory used by each column. Use deep=True for accurate size of object dtype columns.",
        explanationID: "memory_usage() mengembalikan memori yang digunakan oleh setiap kolom. Gunakan deep=True untuk ukuran akurat kolom dtype object.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd048",
        questionEN: "What does df.pipe(custom_function) do?",
        questionID: "Apa yang dilakukan df.pipe(custom_function)?",
        options: [
            QuestionOption(id: "a", textEN: "Pipes data to external process", textID: "Menyalurkan data ke proses eksternal"),
            QuestionOption(id: "b", textEN: "Applies function to DataFrame, enabling method chaining", textID: "Menerapkan fungsi ke DataFrame, memungkinkan method chaining"),
            QuestionOption(id: "c", textEN: "Creates a data pipeline object", textID: "Membuat objek data pipeline"),
            QuestionOption(id: "d", textEN: "Connects to database", textID: "Menghubungkan ke database")
        ],
        correctOptionId: "b",
        explanationEN: "pipe() applies a function that takes DataFrame as first argument, enabling clean method chaining for custom operations.",
        explanationID: "pipe() menerapkan fungsi yang mengambil DataFrame sebagai argumen pertama, memungkinkan method chaining yang bersih untuk operasi kustom.",
        topic: "computing",
        difficulty: .advanced
    ),
    Question(
        id: "pd049",
        questionEN: "What does df.between_time('09:00', '17:00') do on datetime-indexed DataFrame?",
        questionID: "Apa yang dilakukan df.between_time('09:00', '17:00') pada DataFrame dengan index datetime?",
        options: [
            QuestionOption(id: "a", textEN: "Calculates time difference between rows", textID: "Menghitung selisih waktu antar baris"),
            QuestionOption(id: "b", textEN: "Filters rows between those times (regardless of date)", textID: "Memfilter baris antara waktu tersebut (terlepas dari tanggal)"),
            QuestionOption(id: "c", textEN: "Converts times to that range", textID: "Mengonversi waktu ke rentang tersebut"),
            QuestionOption(id: "d", textEN: "Counts rows in time range", textID: "Menghitung baris dalam rentang waktu")
        ],
        correctOptionId: "b",
        explanationEN: "between_time() selects rows with times between start and end times, useful for filtering business hours data.",
        explanationID: "between_time() memilih baris dengan waktu antara waktu mulai dan akhir, berguna untuk memfilter data jam kerja.",
        topic: "computing",
        difficulty: .intermediate
    ),
    Question(
        id: "pd050",
        questionEN: "What is the difference between a view and a copy in Pandas?",
        questionID: "Apa perbedaan antara view dan copy di Pandas?",
        options: [
            QuestionOption(id: "a", textEN: "View is read-only, copy allows modifications", textID: "View hanya baca, copy memungkinkan modifikasi"),
            QuestionOption(id: "b", textEN: "View references original data, copy is independent", textID: "View mereferensi data asli, copy independen"),
            QuestionOption(id: "c", textEN: "They are the same thing", textID: "Keduanya sama"),
            QuestionOption(id: "d", textEN: "Copy is faster than view", textID: "Copy lebih cepat dari view")
        ],
        correctOptionId: "b",
        explanationEN: "A view shares memory with the original DataFrame; changes affect both. A copy is independent. Use .copy() to ensure a copy.",
        explanationID: "View berbagi memori dengan DataFrame asli; perubahan mempengaruhi keduanya. Copy independen. Gunakan .copy() untuk memastikan copy.",
        topic: "computing",
        difficulty: .intermediate
    )
]
