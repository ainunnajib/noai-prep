/*
  A toy sentiment model shared by this lesson's visuals. Trained offline with scikit-learn 1.9 on the
  48 hawker-centre reviews below (24 positive, 24 negative):
    tokens  : lower-case runs of a-z/0-9, minus the STOP words, keeping words seen in >= 2 reviews (min_df=2)
    counts  : CountVectorizer + LogisticRegression(C=3)
    tf-idf  : TfidfVectorizer (smooth idf, L2-normalised rows) + LogisticRegression(C=10)
    avg-emb : mean of the hand-made 2-D embeddings EMB + LogisticRegression(C=10)
  The functions below reproduce scikit-learn's predict_proba exactly (checked in Python).
*/

export const TRAIN_POS: string[] = [
  "the laksa was delicious and the uncle was friendly",
  "shiok chicken rice, tender chicken and fragrant rice",
  "cheap and good, will come back again",
  "the queue was long but the char kway teow was worth it",
  "friendly auntie, generous portion, very good value",
  "best satay in the east, sweet and smoky sauce",
  "fresh fish soup, not oily at all",
  "the noodles were springy and the soup was rich",
  "great prawn mee, the soup is so shiok",
  "not bad for the price, decent portion and fast service",
  "love the crispy carrot cake, really good",
  "good food, fast service and clean tables",
  "the rojak was fresh and the sauce was tasty",
  "delicious nasi lemak, the sambal is amazing",
  "fast service, friendly uncle and fair price",
  "the duck rice was tender and fragrant, highly recommend",
  "generous portion of fresh prawns, worth every cent",
  "tasty and cheap, the best roti prata nearby",
  "not expensive and the portion is big",
  "great value, the chicken was juicy and tender, so good",
  "the fishball noodles were good and the chilli was shiok",
  "clean stall, friendly staff and delicious food",
  "the bak chor mee was amazing, not too salty",
  "worth the wait, the best hokkien mee i have had"
]
export const TRAIN_NEG: string[] = [
  "the laksa was cold and bland",
  "rude uncle and the rice was too salty",
  "expensive and small portion, not worth it",
  "waited forty minutes and the noodles were soggy",
  "the chicken was dry and the rice was oily",
  "dirty tables and slow service",
  "bland soup, not fresh and too expensive",
  "worst char kway teow, so oily and salty",
  "the auntie was rude and the food was cold",
  "not good, the fish was not fresh",
  "small portion for the price, very disappointing",
  "slow service and the satay was burnt",
  "the prawns were stale and the soup was bland",
  "bad food, rude staff, never coming back",
  "too oily, too salty and too expensive",
  "the duck was dry and the sauce was bad",
  "long queue and the mee pok was cold and soggy",
  "overpriced and the portion was tiny, bad value",
  "stale bread and bitter coffee, really bad",
  "the stall was dirty and the uncle was rude",
  "not tasty, the chicken was dry",
  "disappointing nasi lemak, the sambal was bland",
  "bad service, waited forever for cold food",
  "the soup was salty and the fishballs were not fresh"
]

export const VOCAB: string[] = ["amazing", "auntie", "back", "bad", "best", "bland", "char", "cheap", "chicken", "clean", "cold", "delicious", "dirty", "disappointing", "dry", "duck", "expensive", "fast", "fish", "food", "fragrant", "fresh", "friendly", "generous", "good", "great", "kway", "laksa", "lemak", "long", "mee", "nasi", "noodles", "not", "oily", "portion", "prawns", "price", "queue", "really", "rice", "rude", "salty", "sambal", "satay", "sauce", "service", "shiok", "slow", "small", "soggy", "soup", "staff", "stale", "stall", "tables", "tasty", "tender", "teow", "too", "uncle", "value", "waited", "worth"]
export const STOP = new Set<string>(["a", "again", "all", "an", "and", "are", "at", "be", "been", "but", "for", "had", "have", "i", "in", "is", "it", "its", "my", "of", "on", "so", "that", "the", "this", "to", "very", "was", "we", "were", "will", "with"])
export const IDF: number[] = [3.7932, 3.7932, 3.7932, 2.9459, 3.5055, 3.2824, 3.7932, 3.7932, 3.2824, 3.7932, 3.2824, 3.5055, 3.7932, 3.7932, 3.5055, 3.7932, 3.2824, 3.5055, 3.7932, 3.1001, 3.7932, 2.9459, 3.2824, 3.7932, 2.8124, 3.7932, 3.7932, 3.7932, 3.7932, 3.7932, 3.2824, 3.7932, 3.5055, 2.5892, 3.2824, 2.8124, 3.7932, 3.5055, 3.7932, 3.7932, 3.2824, 3.2824, 3.1001, 3.7932, 3.7932, 3.5055, 2.9459, 3.5055, 3.7932, 3.7932, 3.7932, 2.9459, 3.7932, 3.7932, 3.7932, 3.7932, 3.5055, 3.5055, 3.7932, 3.2824, 3.2824, 3.5055, 3.7932, 3.2824]
export const COUNT_W: number[] = [1.405, -0.052, 0.143, -1.229, 0.988, -1.42, 0.01, 0.71, -0.177, 0.505, -1.261, 0.893, -0.768, -0.923, -1.46, -0.018, -0.133, 1.316, 0.059, -0.138, 0.648, -0.099, 0.983, 0.621, 0.813, 0.533, 0.01, 0.115, -0.02, 0.139, 0.863, -0.02, 0.447, -0.506, -0.134, 0.581, -0.04, 0.447, 0.139, 0.26, 0.116, -1.138, -1.034, -0.02, -0.229, 0.755, 0.072, 0.736, -1.12, -1.525, -1.256, 0.596, -0.006, -0.917, -0.087, -0.176, 0.448, 1.015, 0.01, -0.365, -0.098, -0.339, -0.715, 0.578]
export const COUNT_B = 0.121
export const TFIDF_W: number[] = [2.614, -0.039, 0.224, -2.352, 1.841, -2.524, 0.024, 1.423, -0.201, 1.171, -2.198, 1.794, -1.441, -1.687, -2.749, -0.081, 0.04, 2.346, 0.139, -0.285, 1.357, -0.168, 1.948, 1.389, 1.627, 1.163, 0.024, 0.2, -0.037, 0.263, 1.504, -0.037, 1.065, -0.781, -0.286, 1.181, 0.052, 0.875, 0.263, 0.624, 0.319, -2.134, -1.936, -0.037, -0.307, 1.435, 0.157, 1.445, -2.007, -2.704, -2.23, 0.939, -0.055, -1.723, -0.104, -0.166, 0.802, 1.928, 0.024, -1.065, -0.105, -0.566, -1.387, 0.989]
export const TFIDF_B = 0.005
/** hand-made 2-D embeddings: [how positive, about the food (+) vs about service/price (−)] */
export const EMB: Record<string, [number, number]> = {
  "amazing": [0.85, 0.15],
  "auntie": [0.06, -0.62],
  "back": [0.12, -0.2],
  "bad": [-0.8, 0.0],
  "best": [0.8, 0.22],
  "bland": [-0.7, 0.62],
  "char": [-0.06, 0.66],
  "cheap": [0.45, -0.78],
  "chicken": [0.04, 0.92],
  "clean": [0.5, -0.5],
  "cold": [-0.55, 0.5],
  "delicious": [0.86, 0.68],
  "dirty": [-0.68, -0.45],
  "disappointing": [-0.82, 0.08],
  "dry": [-0.6, 0.72],
  "duck": [-0.1, 0.86],
  "expensive": [-0.5, -0.8],
  "fast": [0.52, -0.6],
  "fish": [0.1, 0.8],
  "food": [0.0, 0.45],
  "fragrant": [0.62, 0.8],
  "fresh": [0.58, 0.58],
  "friendly": [0.72, -0.66],
  "generous": [0.55, -0.4],
  "good": [0.7, 0.0],
  "great": [0.74, 0.08],
  "kway": [-0.02, 0.7],
  "laksa": [-0.08, 0.76],
  "lemak": [0.08, 0.66],
  "long": [-0.3, -0.48],
  "mee": [0.0, 0.84],
  "nasi": [0.04, 0.62],
  "noodles": [0.1, 0.92],
  "not": [-0.1, 0.02],
  "oily": [-0.5, 0.82],
  "portion": [0.0, -0.3],
  "prawns": [-0.12, 0.92],
  "price": [0.0, -0.75],
  "queue": [-0.15, -0.6],
  "really": [0.02, -0.04],
  "rice": [-0.04, 0.88],
  "rude": [-0.8, -0.66],
  "salty": [-0.42, 0.74],
  "sambal": [0.12, 0.72],
  "satay": [0.02, 0.76],
  "sauce": [0.06, 0.6],
  "service": [0.0, -0.7],
  "shiok": [0.86, 0.45],
  "slow": [-0.58, -0.62],
  "small": [-0.45, -0.32],
  "soggy": [-0.66, 0.84],
  "soup": [-0.04, 0.68],
  "staff": [0.04, -0.8],
  "stale": [-0.76, 0.66],
  "stall": [-0.04, -0.36],
  "tables": [0.0, -0.5],
  "tasty": [0.8, 0.76],
  "tender": [0.66, 0.68],
  "teow": [0.02, 0.58],
  "too": [-0.25, 0.04],
  "uncle": [-0.04, -0.62],
  "value": [0.4, -0.7],
  "waited": [-0.45, -0.56],
  "worth": [0.55, -0.5],
}
export const EMB_W: [number, number] = [7.073, -0.449]
export const EMB_B = 0.089
