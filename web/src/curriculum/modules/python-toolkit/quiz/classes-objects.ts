import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.classes-objects.1',
    prompt: 'What does this code print?',
    code: 'class Account:\n    def __init__(self, balance):\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\na = Account(10)\nb = Account(10)\na.deposit(5)\nb.deposit(a.deposit(1))\nprint(a.balance, b.balance)',
    options: ['`16 26`', '`16 16`', '`15 25`', '`16 11`'],
    answer: 0,
    explanation:
      'Each object keeps its own `balance`. `a` goes $10 \\to 15$, then `a.deposit(1)` makes it $16$ and **returns** 16. That 16 is passed to `b.deposit`, so `b` goes $10 \\to 26$. `16 11` would treat `a.deposit(1)` as returning the amount deposited rather than the new balance.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.classes-objects.2',
    prompt: 'In the call `s1.passed()`, where `passed` is defined as `def passed(self): ...` inside `class Student`, what is `self`?',
    options: [
      'The class `Student` that `passed` was defined in',
      'The object `s1` that the method was called on',
      'A fresh copy of `s1` made just for this call',
      'The value returned earlier by `__init__`',
    ],
    answer: 1,
    explanation:
      '`s1.passed()` is run as `Student.passed(s1)`: the object before the dot is passed in as the first parameter, `self`. No copy is made, so if the method changed `self.score`, `s1.score` would change. (`__init__` itself returns `None`; Python hands back the new object, not `__init__`\'s return value.)',
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.classes-objects.3',
    prompt:
      'Using `class MeanPredictor` with `fit(self, y)`, which sets `self.mean_ = sum(y) / len(y)`, and `predict(self, X)`, which returns `[self.mean_ for x in X]`, the code `model = MeanPredictor(); model.predict([1, 2])` raises `AttributeError`. Why?',
    options: [
      '`predict` must be given the object explicitly, as in `model.predict(model, [1, 2])`',
      '`mean_` ends in an underscore, which makes it private and unreadable from `predict`',
      '`self.mean_` is only created when `fit` runs, so the object has no `mean_` yet',
      'Methods defined after `fit` in a class cannot run until `fit` has run first',
    ],
    answer: 2,
    explanation:
      'Attributes exist only once some code assigns them. `MeanPredictor` has no `__init__`, so a new object starts with no attributes; `fit` creates `self.mean_`. Reading it before `fit` raises `AttributeError: \'MeanPredictor\' object has no attribute \'mean_\'`. The trailing underscore is only a scikit-learn naming habit for learned attributes, not a privacy rule.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.classes-objects.4',
    prompt: 'A PyTorch model starts `class Net(nn.Module):` and its `__init__` begins with `super().__init__()`. What does that line do?',
    options: [
      'Calls `forward` once so that the network is ready to make its predictions',
      'Copies pretrained weights from the parent class into the new network',
      'Runs `nn.Module`\'s own set-up, so it can register the layers you assign',
      'Declares `Net` as a subclass, which Python needs before any methods',
    ],
    answer: 2,
    explanation:
      '`super().__init__()` runs the parent\'s `__init__` (its set-up code) on this object. `nn.Module` uses it to create the internal records that let `self.layer = nn.Linear(...)` be registered, so `net.parameters()` can find the weights. Without it PyTorch raises `AttributeError: cannot assign module before Module.__init__() call`. Inheriting is declared by `class Net(nn.Module)`, not by `super()`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.classes-objects.5',
    prompt: 'A scaffold gives the classes below. What happens when you run `L2Booster()`?',
    code: 'from abc import ABC, abstractmethod\n\nclass BaseBooster(ABC):\n    def predict(self, X):\n        ...   # shared code\n\n    @abstractmethod\n    def negative_gradient(self, y, p): ...\n\nclass L1Booster(BaseBooster):\n    def negative_gradient(self, y, p):\n        return (y > p) - (y < p)  # sign of y - p\n\nclass L2Booster(BaseBooster):\n    pass',
    options: [
      '`TypeError` at once, because `negative_gradient` is still abstract',
      'It works, and `negative_gradient` returns `None` when called',
      'It works, but calling `predict` later raises `NotImplementedError`',
      '`SyntaxError`, because a class body cannot be just `pass`',
    ],
    answer: 0,
    explanation:
      '`L2Booster` inherits the abstract `negative_gradient` without filling it in, so Python refuses to create the object and raises `TypeError: Can\'t instantiate abstract class L2Booster ...` immediately. A body of just `pass` is perfectly legal. `L1Booster()` would work, because it implements the only abstract method.',
    difficulty: 'intermediate',
  },
]

export default questions
