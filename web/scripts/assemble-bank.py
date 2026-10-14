#!/usr/bin/env python3
"""Merge verified question-bank batches into src/data/bank/bank.json.

Usage: python3 scripts/assemble-bank.py <dir with batchNN.json files>
Drops questions an editor marked "drop", keeps only fields the site uses, and validates.
"""
import json
import sys
from pathlib import Path

SUBTOPICS = {
    'mathematics': ['linear-algebra', 'calculus', 'probability-statistics', 'optimisation'],
    'computing': ['python', 'numpy', 'pandas', 'pytorch', 'data-preprocessing', 'code-debugging'],
    'ai_ml_dl': ['ml-fundamentals', 'regression', 'classification', 'trees-ensembles', 'unsupervised', 'model-evaluation', 'neural-networks',
                 'training-regularisation', 'cnn-vision', 'sequence-models', 'nlp-transformers', 'reinforcement-learning'],
    'generative_ai': ['llms', 'generative-models', 'multimodal', 'prompting-rag', 'ai-ethics-safety'],
    'problem_solving': ['algorithms-complexity', 'ml-debugging-diagnosis', 'ml-system-design', 'optimisation-tradeoffs'],
}
SUB2DOM = {s: d for d, subs in SUBTOPICS.items() for s in subs}
KEEP = ['id', 'domain', 'subtopic', 'difficulty', 'prompt', 'options', 'answer', 'explanation']


def main():
    src = Path(sys.argv[1])
    out, dropped, problems = [], [], []
    files = sorted(src.glob('batch*.json'))
    for f in files:
        for q in json.loads(f.read_text(encoding='utf-8')):
            if q.get('drop'):
                dropped.append((q['id'], q.get('drop_reason', '')))
                continue
            q['domain'] = SUB2DOM.get(q.get('subtopic'), q.get('domain'))
            item = {k: q[k] for k in KEEP}
            if item['subtopic'] not in SUB2DOM:
                problems.append(f"{q['id']}: bad subtopic {item['subtopic']}")
            if item['difficulty'] not in ('beginner', 'intermediate', 'advanced'):
                problems.append(f"{q['id']}: bad difficulty {item['difficulty']}")
            if not (isinstance(item['answer'], int) and 0 <= item['answer'] < len(item['options'])):
                problems.append(f"{q['id']}: answer out of range")
            if len(set(item['options'])) != len(item['options']):
                problems.append(f"{q['id']}: duplicate options")
            out.append(item)
    ids = [q['id'] for q in out]
    if len(set(ids)) != len(ids):
        problems.append('duplicate ids')
    dest = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'bank' / 'bank.json'
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'{len(files)} batch files -> {len(out)} questions kept, {len(dropped)} dropped')
    for i, r in dropped:
        print(f'  dropped {i}: {r}')
    if problems:
        print('PROBLEMS:')
        for p in problems:
            print('  ' + p)
        sys.exit(1)


if __name__ == '__main__':
    main()
