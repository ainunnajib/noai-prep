/* Runnable code for the decisions lesson (kept here so MDX does not strip the indentation). */

export const AI_DECISIONS = `p_spam = 0.83          # try 0.2, 0.5 and 0.49
if p_spam >= 0.5:
    label = "spam"
else:
    label = "not spam"
print(p_spam, "->", label)

x = -2.5               # try 3, 0 and -0.1
y = x if x > 0 else 0  # ReLU on one line
print(f"relu({x}) = {y}")`
