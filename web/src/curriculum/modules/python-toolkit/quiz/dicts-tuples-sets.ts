import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.dicts-tuples-sets.1',
    prompt: 'Which of these objects can be changed in place after it has been created?',
    options: ["`{'a': 1}`", "`('a', 1)`", "`'abc'`", '`3.14`'],
    answer: 0,
    explanation:
      "Dicts are mutable: `d['b'] = 2` changes the same dict. The tuple `('a', 1)` holds similar items and looks like a list, but it is immutable (`t[0] = 'b'` raises a `TypeError`), and so are strings and floats: operations on them build new objects instead.",
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.dicts-tuples-sets.2',
    prompt: 'What does this code print?',
    code: 'x = {}\nprint(type(x))',
    options: ["`<class 'dict'>`", "`<class 'set'>`", "`<class 'list'>`", "`<class 'tuple'>`"],
    answer: 0,
    explanation:
      "Empty curly braces make an empty **dict**. Sets also use curly braces when they have items (`{1, 2}`), but `{}` was already taken by dict, so an empty set must be written `set()`. An empty list is `[]` and an empty tuple is `()`.",
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.dicts-tuples-sets.3',
    prompt: 'What does this code print?',
    code: "counts = {}\nfor w in ['a', 'b', 'a', 'c', 'a']:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts['a'], len(counts))",
    options: ['`3 3`', '`3 5`', '`1 3`', "`KeyError: 'a'`"],
    answer: 0,
    explanation:
      "`counts.get(w, 0)` returns 0 for a new word, so no `KeyError`. 'a' is counted three times, giving `counts['a'] = 3`. `len(counts)` is the number of **distinct keys** ('a', 'b', 'c'), which is 3, not the 5 words in the list.",
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.dicts-tuples-sets.4',
    prompt: 'Why can the tuple `(2, 3)` be used as a dictionary key while the list `[2, 3]` cannot?',
    options: [
      'A tuple is immutable, so its hash, which picks its slot in the table, can never change',
      'A tuple takes less memory than a list, and dictionary keys must fit in one slot',
      'A list may contain duplicates, and dictionary keys must not contain duplicates',
      'A tuple stores its items in order, and dictionaries need keys whose items are in order',
    ],
    answer: 0,
    explanation:
      "A dict stores each key in the slot given by its hash. If a key could be changed after being stored, its hash would change and Python would look in the wrong slot, so Python only accepts **hashable** keys: `{[2, 3]: 1}` raises `TypeError: unhashable type: 'list'`. A tuple is hashable only if everything inside it is, so `(2, [3])` would fail too. Lists are ordered as well, and duplicates inside a key are fine, e.g. the key `(2, 2)`.",
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.dicts-tuples-sets.5',
    prompt:
      'A dataset has 100,000 image labels stored in a list called `labels`. You want to know which different classes appear in it, each listed once. Which expression does that most directly?',
    options: ['`set(labels)`', '`tuple(labels)`', '`dict(labels)`', '`sorted(labels)`'],
    answer: 0,
    explanation:
      "`set(labels)` keeps one copy of each distinct label, e.g. `{'cat', 'dog', 'bird'}`. `tuple(labels)` and `sorted(labels)` still contain all 100,000 entries, duplicates included, and `dict(labels)` expects `(key, value)` pairs, so it fails on plain labels such as `'cat'`.",
    difficulty: 'beginner',
  },
]

export default questions
