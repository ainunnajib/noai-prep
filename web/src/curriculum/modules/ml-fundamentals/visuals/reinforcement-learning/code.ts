/*
  Python for the lesson's <PyRunner>. Kept here (not inline in the .mdx) because MDX trims the
  indentation of continuation lines inside JSX attributes. Output checked locally with NumPy.
*/

export const banditCode = `import numpy as np

# hidden from the diner
true_means = np.array([6, 4, 8, 5])
rng = np.random.default_rng(0)

def lunch(epsilon, meals=100):
    # running average per stall
    Q = np.zeros(4)
    # meals eaten at each stall
    N = np.zeros(4)
    total = 0.0
    for t in range(meals):
        if rng.random() < epsilon:
            # explore: any stall
            a = rng.integers(4)
        else:
            # exploit: best so far
            a = np.argmax(Q)
        # this meal's score
        r = rng.normal(true_means[a], 2)
        N[a] += 1
        # update running average
        Q[a] += (r - Q[a]) / N[a]
        total += r
    return total

for eps in [0, 0.1, 0.5, 1]:
    avg = np.mean([lunch(eps) for _ in range(200)])
    print(f"epsilon = {eps}: average total "
          f"over 100 meals = {avg:.0f}")`
