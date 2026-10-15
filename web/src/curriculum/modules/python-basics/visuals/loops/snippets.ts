/* Runnable code for the loops lesson (kept here so MDX does not strip the indentation). */

export const LOOP_BASICS = `for name in ["Ali", "Bala", "Chen"]:
    print("Hi", name)

print(list(range(2, 11, 3)))      # change the numbers

total = 0
for i in range(1, 5):
    total = total + i
    print("i =", i, "total =", total)
print("final total:", total)`

export const NUDGE_LOOP = `w = 0.0     # first guess
lr = 0.1    # learning rate: try 0.05, 0.3, 0.8 and 1.1
for step in range(15):
    prediction = 2 * w
    error = prediction - 6
    w = w - lr * error
    print(step, round(w, 3), round(error, 3))`
