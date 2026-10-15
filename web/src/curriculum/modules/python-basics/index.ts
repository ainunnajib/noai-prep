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
      objectives: ["You can run a Python program and predict its printed output", "You can explain that code runs top to bottom, one line at a time", "You can read the last line of a traceback to find the error type and line number"],
      load: () => import('./first-program.mdx'),
    },
    {
      slug: "variables-types-arithmetic",
      title: "Variables, types and arithmetic",
      summary: "Store values in variables, meet int, float, str and bool, and calculate with Python's operators.",
      minutes: 25,
      objectives: ["You can assign and reassign variables and predict their values", "You can name the type of a value and convert between types", "You can evaluate expressions with //, %, ** and operator precedence"],
      load: () => import('./variables-types-arithmetic.mdx'),
    },
    {
      slug: "strings",
      title: "Working with text: strings",
      summary: "Index, slice and transform text, and format output with f-strings.",
      minutes: 25,
      objectives: ["You can index and slice strings, including with negative indices", "You can use common string methods and f-strings", "You can explain why strings are immutable"],
      load: () => import('./strings.mdx'),
    },
    {
      slug: "decisions",
      title: "Making decisions with if",
      summary: "Use comparisons, Boolean logic and if/elif/else to make programs choose.",
      minutes: 25,
      objectives: ["You can evaluate comparisons and and/or/not expressions", "You can trace which branch of an if/elif/else runs", "You can explain why branch order matters"],
      load: () => import('./decisions.mdx'),
    },
    {
      slug: "loops",
      title: "Repeating with loops",
      summary: "Use for and while loops, and write a loop that learns a number by nudging.",
      minutes: 30,
      objectives: ["You can predict the values produced by range()", "You can trace a loop's variables in a table", "You can write a loop that improves a guess step by step"],
      load: () => import('./loops.mdx'),
    },
    {
      slug: "lists",
      title: "Lists: ordered collections",
      summary: "Create, index, slice and change lists, and use nested lists as grids.",
      minutes: 20,
      objectives: ["You can index, slice, append to and concatenate lists", "You can explain an IndexError", "You can access grid[row][col] in a nested list"],
      load: () => import('./lists.mdx'),
    },
  ],
}

export default mod
