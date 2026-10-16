/* Runnable code for the lists lesson (kept here so MDX does not strip the indentation). */

export const LIST_PLAYGROUND = `marks = [72, 85, 64, 90]
print(marks[0], marks[-1], marks[1:3], len(marks))

marks.append(88)        # change the list in place
marks.insert(1, 50)
last = marks.pop()      # removes and returns the last item
print(marks, "popped:", last)

grid = [[1, 2, 3],
        [4, 5, 6]]
print(grid[1], grid[1][2])

squares = [x ** 2 for x in range(5)]
print(squares)

# print(marks[10])     # remove the # and run again: read the last line of the error`
