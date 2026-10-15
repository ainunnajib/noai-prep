/** Runnable code for the lesson's PyRunner, kept here because MDX strips indentation inside JSX template literals. */
export const STANDARDISE_CODE = `import numpy as np

X = np.array([[170, 57, 1],
              [150, 49, 7],
              [165, 53, 4],
              [180, 61, 3],
              [160, 55, 5]])

mu = X.mean(axis=0)
sd = X.std(axis=0)
Z = (X - mu) / sd

print(mu, sd)
print(Z)
# every column: mean 0, std 1
print(Z.mean(axis=0), Z.std(axis=0))`
