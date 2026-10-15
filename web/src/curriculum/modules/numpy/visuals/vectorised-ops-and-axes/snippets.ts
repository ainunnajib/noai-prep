/** Runnable code for the lesson's PyRunner, kept here because MDX strips indentation inside JSX template literals. */
export const AXES_CODE = `import numpy as np

marks = np.array([[6, 4,  6, 8],
                  [8, 8, 10, 6],
                  [7, 9,  8, 4]])

# all 12 marks
print(np.mean(marks))
# one total per subject (column)
print(marks.sum(axis=0))
# one average per student (row)
print(marks.mean(axis=1))
# each student's best subject
print(marks.argmax(axis=1))
m = marks.mean(axis=1, keepdims=True)
print(m.shape)

# marks relative to own average
print(marks - m)`
