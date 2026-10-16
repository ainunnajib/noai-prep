#!/usr/bin/env python3
"""Compute summary statistics of the solved 2026 prelim into src/data/paperStats.json."""
import collections
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent / 'src' / 'data'
qs = []
for f in sorted((root / 'papers').glob('prelim2026_chunk*.json')):
    qs += json.loads(f.read_text(encoding='utf-8'))['questions']
stats = {
    'total': len(qs),
    'subtopics': collections.Counter(q['subtopic'] for q in qs).most_common(),
    'styles': collections.Counter(q['style'] for q in qs).most_common(),
    'difficulty': collections.Counter(q['difficulty'] for q in qs).most_common(),
}


def cues(qs):
    """How often two answer-format cues pointed at the key: the uniquely longest option, and options starting with an absolute word."""
    clean = lambda o: re.sub(r'\s+', ' ', o).strip()
    longest = {'right': 0, 'of': 0, 'byDomain': {}, 'lastThirty': {'right': 0, 'of': 0}}
    for q in qs:
        lens = [len(clean(o)) for o in q['options']]
        if lens.count(max(lens)) != 1:
            continue  # ties: no single longest option
        ok = int(lens.index(max(lens)) == q['answer'])
        longest['right'] += ok
        longest['of'] += 1
        d = longest['byDomain'].setdefault(q['domain'], {'right': 0, 'of': 0})
        d['right'] += ok
        d['of'] += 1
        if q['n'] >= 271:
            longest['lastThirty']['right'] += ok
            longest['lastThirty']['of'] += 1
    words = ['always', 'never', 'only', 'cannot', 'all', 'none']
    pat = re.compile(r'^\W*(%s)\b' % '|'.join(words), re.I)
    absolute = {'words': words, 'right': 0, 'of': 0}
    for q in qs:
        for i, o in enumerate(q['options']):
            if pat.search(o):
                absolute['of'] += 1
                absolute['right'] += int(i == q['answer'])
    return {'longest': longest, 'absoluteStart': absolute}


stats['cues'] = cues(qs)
(root / 'paperStats.json').write_text(json.dumps(stats, indent=1), encoding='utf-8')
print(stats['total'], 'questions;', stats['styles'])
