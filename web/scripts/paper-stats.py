#!/usr/bin/env python3
"""Compute summary statistics of the solved 2026 prelim into src/data/paperStats.json."""
import collections
import json
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
(root / 'paperStats.json').write_text(json.dumps(stats, indent=1), encoding='utf-8')
print(stats['total'], 'questions;', stats['styles'])
