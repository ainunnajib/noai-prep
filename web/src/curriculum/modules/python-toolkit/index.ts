import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "python-toolkit",
  order: 4,
  part: "code",
  domain: "computing",
  title: "Python power tools",
  tagline: "Read, reason about and fix code",
  summary: "The rest of the Python an AI programmer needs: dictionaries, tuples and sets, functions and scope, comprehensions, zip and generators, how names refer to objects (and the mutation traps examiners love), classes, inheritance and the fit/predict pattern, and exceptions and systematic debugging.",
  prerequisites: ["python-basics"],
  syllabus: ["NOAI Computing: Python, Debugging", "Dicts, tuples, sets and mutability", "Functions, scope, *args/**kwargs; comprehensions, zip, enumerate, generators", "Object references, is vs ==, mutating arguments", "Classes, __init__, methods, inheritance", "try/except/finally, common exceptions, tracebacks"],
  lessons: [
    {
      slug: "dicts-tuples-sets",
      title: "Dictionaries, tuples and sets",
      summary: "Look things up by key, use fixed tuples and unique sets, and know which types are mutable.",
      minutes: 30,
      objectives: ["You can create, update and look up dictionaries, using .get() to avoid a KeyError", "You can choose between list, tuple, dict and set for a task", "You can say which types are mutable and which can be dict keys"],
      load: () => import('./dicts-tuples-sets.mdx'),
    },
    {
      slug: "functions",
      title: "Functions: reusable recipes",
      summary: "Define functions with parameters, defaults and return values, and understand scope and *args/**kwargs.",
      minutes: 25,
      objectives: ["You can tell return from print and predict when a function gives back None", "You can call a function using default values and keyword arguments", "You can predict which variable a name refers to, using the LEGB scope rule", "You can explain what *args and **kwargs collect"],
      load: () => import('./functions.mdx'),
    },
    {
      slug: "iteration-tools",
      title: "Comprehensions, zip, enumerate and generators",
      summary: "Write compact loops with comprehensions, zip and enumerate, and produce values lazily with generators.",
      minutes: 35,
      objectives: ["You can predict the output of a list comprehension, including filters and two for clauses", "You can predict what zip and enumerate produce, including zip with lists of unequal length", "You can explain how a generator saves memory and why it can be used only once"],
      load: () => import('./iteration-tools.mdx'),
    },
    {
      slug: "references-mutability",
      title: "Names, references and surprises",
      summary: "Why changing one list can change 'another', is vs ==, and mutable default arguments.",
      minutes: 25,
      objectives: ["You can trace assignments with names-and-arrows diagrams, telling rebinding from mutation", "You can explain the difference between is and ==", "You can predict what happens when a function modifies a list argument", "You can explain why a mutable default argument such as items=[] keeps growing across calls"],
      load: () => import('./references-mutability.mdx'),
    },
    {
      slug: "classes-objects",
      title: "Classes and objects",
      summary: "Build your own types with attributes, methods, inheritance and abstract base classes, the pattern behind scikit-learn models and PyTorch modules.",
      minutes: 25,
      objectives: ["You can define a class with __init__ and methods, and explain what self is", "You can write a tiny model class with fit and predict", "You can explain inheritance, overriding and what super().__init__() does", "You can read an abstract base class and implement its abstract methods in a subclass"],
      load: () => import('./classes-objects.mdx'),
    },
    {
      slug: "exceptions-debugging",
      title: "Exceptions and debugging",
      summary: "Know the common exceptions, handle errors with try/except, and debug systematically.",
      minutes: 25,
      objectives: ["You can name the cause of IndexError, KeyError, TypeError, ValueError and ZeroDivisionError", "You can predict which parts of a try/except/else/finally statement run, and why a bare except is risky", "You can apply a step-by-step debugging routine"],
      load: () => import('./exceptions-debugging.mdx'),
    },
  ],
}

export default mod
