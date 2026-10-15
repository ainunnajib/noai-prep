import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "python-basics",
  order: 3,
  part: "code",
  domain: "computing",
  title: "Python from zero",
  tagline: "Your first programs, step by step",
  summary: "Your very first lines of Python: running and reading programs, variables, types and operators, strings, decisions with if, for and while loops (including a tiny loop that learns), and lists, all traced visually line by line.",
  prerequisites: ["start-here"],
  syllabus: ["NOAI Computing: Python", "IOAI 1A1 Python Basics (Loops, Functions, etc.)", "Tracebacks, variables, int/float/str/bool, operators //, %, ** and precedence", "String indexing and slicing, f-strings, if/elif/else, for/while, range(), lists and nested lists"],
  lessons: [
    {
      slug: "first-program",
      title: "Your first program (and your first error)",
      summary: "Run print statements, follow the order in which code executes, and decode a traceback.",
      minutes: 20,
      objectives: ["You can predict what a short program prints, including quoted text, calculations and comments", "You can read a traceback from the bottom up to find the error type and the line number", "You can tell a SyntaxError, which stops the whole program, from errors that stop at the bad line"],
      load: () => import('./first-program.mdx'),
    },
    {
      slug: "variables-types-arithmetic",
      title: "Variables, types and arithmetic",
      summary: "Store values in variables, meet int, float, str and bool, and calculate with Python's operators.",
      minutes: 25,
      objectives: ["You can trace assignments and reassignments in a table and predict each variable's value", "You can name the type of a value and predict what happens when types are mixed or converted", "You can evaluate expressions with /, //, %, ** and Python's order of operations by hand"],
      load: () => import('./variables-types-arithmetic.mdx'),
    },
    {
      slug: "strings",
      title: "Working with text: strings",
      summary: "Index, slice and transform text, and format output with f-strings.",
      minutes: 25,
      objectives: ["You can index and slice strings, including negative indices and the excluded stop", "You can predict the result of chained string methods such as strip, lower and replace", "You can explain why a string method never changes the original string", "You can format numbers in f-strings, for example to 2 decimal places"],
      load: () => import('./strings.mdx'),
    },
    {
      slug: "decisions",
      title: "Making decisions with if",
      summary: "Use comparisons, Boolean logic and if/elif/else to make programs choose.",
      minutes: 25,
      objectives: ["You can evaluate comparisons and and/or/not expressions, with and without brackets", "You can trace which branch of an if/elif/else chain runs, and explain why branch order matters", "You can tell = from ==, and separate if statements from an elif chain"],
      load: () => import('./decisions.mdx'),
    },
    {
      slug: "loops",
      title: "Repeating with loops",
      summary: "Use for and while loops, and write a loop that learns a number by nudging.",
      minutes: 30,
      objectives: ["You can predict the values range() produces and count them, even with a step", "You can trace a for or while loop's variables in a table", "You can spot why a while loop never ends", "You can explain how a loop improves a guess step by step, and what the learning rate does"],
      load: () => import('./loops.mdx'),
    },
    {
      slug: "lists",
      title: "Lists: ordered collections",
      summary: "Create, index, slice and change lists, build them with loops, and use nested lists as grids.",
      minutes: 25,
      objectives: ["You can index, slice and change a list with append, insert and pop, and join lists with +", "You can explain when an IndexError happens and how to avoid it", "You can read grid[row][col] in a nested list", "You can explain why a list can be changed in place but a string cannot"],
      load: () => import('./lists.mdx'),
    },
  ],
}

export default mod
