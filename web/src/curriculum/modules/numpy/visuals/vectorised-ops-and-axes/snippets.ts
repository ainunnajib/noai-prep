/** Runnable code for the lesson's PyRunner, kept here because MDX strips indentation inside JSX template literals. */
export const AXES_CODE = `import numpy as np

marks = np.array([[6, 4,  6, 8],
                  [8, 8, 10, 6],
                  [7, 9,  8, 4]])

print(np.mean(marks))           # all 12 marks
print(marks.sum(axis=0))        # one total per subject (column)
print(marks.mean(axis=1))       # one average per student (row)
print(marks.argmax(axis=1))     # each student's best subject: a position
print(marks.mean(axis=1, keepdims=True).shape)

# each student's marks relative to their own average
print(marks - marks.mean(axis=1, keepdims=True))`
