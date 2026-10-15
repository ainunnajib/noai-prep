/* Python shown in the lesson's runnable cells. Kept in a .ts file so MDX does not strip the indentation. */

export const RETRIEVER_CODE = `import re
import numpy as np

documents = [
    "The library is open on Friday.",
    "The canteen is open on Monday and closed on Friday.",
    "Exam week: the library is open on Friday, and the exam hall is closed.",
    "The hall is closed on Monday.",
]
STOP = {"a", "an", "the", "is", "are", "on", "in", "at", "of", "and", "to",
        "for", "it", "when", "where", "what", "how", "does", "do"}

def tokenise(text):
    """Lower-case, keep letters only, drop stop words."""
    return [w for w in re.findall(r"[a-z]+", text.lower()) if w not in STOP]

# 1. Vocabulary: learnt from the DOCUMENTS only
tokens = [tokenise(d) for d in documents]
vocab = sorted({w for t in tokens for w in t})
index = {w: j for j, w in enumerate(vocab)}

# 2. Count vectors in that vocabulary
def vectorise(text):
    v = np.zeros(len(vocab))
    for w in tokenise(text):
        if w in index:                  # unknown words are ignored
            v[index[w]] += 1
    return v

D = np.array([vectorise(d) for d in documents])
print("vocab:", vocab)
print("D shape:", D.shape)

# 3. Cosine scores for all documents at once, then the top k
def retrieve(query, k=2, min_score=0.0):
    q = vectorise(query)
    norms = np.linalg.norm(D, axis=1) * np.linalg.norm(q)
    scores = D @ q / (norms + 1e-10)    # epsilon: no 0/0 = nan
    top = np.argsort(-scores, kind="stable")[:k]
    top = [int(i) for i in top if scores[i] > min_score]
    return top, scores

# 4. Augment + generate (template: no LLM allowed)
def answer(query, k=2, min_score=0.0):
    top, scores = retrieve(query, k, min_score)
    top_documents = [documents[i] for i in top]
    if not top_documents:
        return top_documents, "I don't know: the handbook does not say."
    return top_documents, "According to the handbook: " + " ".join(top_documents)

for query in ["Is the library open on Friday?",
              "When is the exam hall closed?",
              "Is there a swimming pool?"]:
    top, scores = retrieve(query)
    top_documents, response = answer(query)
    print()
    print("Q:", query)
    print("scores:", scores.round(3), "-> top:", top)
    print("response:", response)`
