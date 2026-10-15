"""Estimate realistic lesson times from lesson content and (optionally) write them into each module's index.ts.

minutes = prose words / 150 + 1.5 per interactive visual + 1 per quick check or embedded past-paper question
          + 3 per runnable Python exercise + 4 for the 5-question checkpoint, rounded to the nearest 5 (min 10).
"""
import glob, json, os, re, sys
MODS = str(__import__('pathlib').Path(__file__).resolve().parent.parent / 'src' / 'curriculum' / 'modules')

def estimate(mdx):
    s = open(mdx).read()
    visuals = set(re.findall(r"^import (\w+) from '\./visuals/", s, re.M))
    n_vis = sum(len(re.findall(r'<%s\b' % v, s)) for v in visuals)
    n_qc = len(re.findall(r'<QuickCheck\b', s))
    n_pp = len(re.findall(r'<PastPaperQuestion\b', s))
    n_py = len(re.findall(r'<PyRunner\b', s))
    t = re.sub(r'^export const \w+ = `.*?(?<!\\)`[ \t]*;?[ \t]*$', '', s, flags=re.M | re.S)  # code strings for runners
    t = re.sub(r'^export const \w+ = [\[{(].*?^[\]})][^\n]*$', '', t, flags=re.M | re.S)  # multi-line arrays/objects
    t = re.sub(r'^(import|export) [^\n]*$', '', t, flags=re.M)
    t = re.sub(r'```.*?```', ' ', t, flags=re.S)
    t = re.sub(r'\$\$.*?\$\$', ' formula ', t, flags=re.S)
    t = re.sub(r'\$[^$\n]+\$', ' x ', t)
    t = re.sub(r'<QuickCheck\b.*?/>', ' ', t, flags=re.S)  # counted separately
    t = re.sub(r'<[^>]*>', ' ', t)
    t = re.sub(r'`[^`]*`', ' x ', t)
    words = len(re.findall(r"[A-Za-z0-9][A-Za-z0-9'’-]*", t))
    raw = words / 150 + 1.5 * n_vis + 1.0 * (n_qc + n_pp) + 3 * n_py + 4
    return {'words': words, 'visuals': n_vis, 'checks': n_qc + n_pp, 'py': n_py, 'raw': raw, 'minutes': max(10, int(5 * round(raw / 5)))}

def main():
    write = '--write' in sys.argv
    total_old = total_new = 0
    for idx in sorted(glob.glob(MODS + '/*/index.ts')):
        mod = idx.split('/')[-2]
        if mod.startswith('_'): continue
        src = open(idx).read()
        out = src
        for m in re.finditer(r'slug: "([^"]+)",\n\s+title: "(?:[^"\\]|\\.)*",\n\s+summary: "(?:[^"\\]|\\.)*",\n\s+minutes: (\d+),', src):
            slug, old = m.group(1), int(m.group(2))
            e = estimate(f'{MODS}/{mod}/{slug}.mdx')
            total_old += old; total_new += e['minutes']
            print(f"{mod}/{slug}: {old} -> {e['minutes']}  (words {e['words']}, visuals {e['visuals']}, checks {e['checks']}, py {e['py']}, raw {e['raw']:.1f})")
            block = m.group(0)
            out = out.replace(block, block[: block.rindex('minutes:')] + f"minutes: {e['minutes']},", 1)
        if write and out != src:
            open(idx, 'w').write(out)
    print('TOTAL hours', round(total_old / 60, 1), '->', round(total_new / 60, 1))

main()
