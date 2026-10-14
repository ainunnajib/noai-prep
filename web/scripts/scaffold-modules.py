#!/usr/bin/env python3
"""Generate module folders from a curriculum spec (curriculum.json).

Usage: python3 scripts/scaffold-modules.py <curriculum.json> [--force]

Writes src/curriculum/parts.ts and, for each module, src/curriculum/modules/<slug>/index.ts
plus stub lesson .mdx files (only where none exist yet). Existing lesson files and quiz/<lesson>.ts files
are never overwritten; quiz.ts (an index of those files) is always regenerated. With --force, index.ts files are regenerated.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'src' / 'curriculum'


def ts(v):
    return json.dumps(v, ensure_ascii=False)


def main():
    spec = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    force = '--force' in sys.argv
    parts = sorted(spec['parts'], key=lambda p: p['order'])
    lines = [
        '/** Course parts, in order. Modules reference a part by id. Generated from the curriculum spec. */',
        'export interface PartDef {', '  id: string', '  order: number', '  title: string', '  summary: string', '}', '',
        'export const parts: PartDef[] = [',
    ]
    for p in parts:
        lines.append(f"  {{ id: {ts(p['id'])}, order: {p['order']}, title: {ts(p['title'])}, summary: {ts(p['summary'])} }},")
    lines.append(']')
    (ROOT / 'parts.ts').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    for m in spec['modules']:
        d = ROOT / 'modules' / m['slug']
        d.mkdir(parents=True, exist_ok=True)
        (d / 'visuals').mkdir(exist_ok=True)
        idx = d / 'index.ts'
        if force or not idx.exists():
            les = []
            for l in m['lessons']:
                les.append(
                    '    {\n'
                    f"      slug: {ts(l['slug'])},\n"
                    f"      title: {ts(l['title'])},\n"
                    f"      summary: {ts(l['summary'])},\n"
                    f"      minutes: {int(l['minutes'])},\n"
                    f"      objectives: {ts(l['objectives'])},\n"
                    f"      load: () => import('./{l['slug']}.mdx'),\n"
                    '    },'
                )
            body = (
                "import type { ModuleDef } from '../../types'\n\n"
                'const mod: ModuleDef = {\n'
                f"  slug: {ts(m['slug'])},\n"
                f"  order: {int(m['order'])},\n"
                f"  part: {ts(m['part'])},\n"
                f"  domain: {ts(m['domain'])},\n"
                f"  title: {ts(m['title'])},\n"
                f"  tagline: {ts(m['tagline'])},\n"
                f"  summary: {ts(m['summary'])},\n"
                f"  prerequisites: {ts(m.get('prerequisites', []))},\n"
                f"  syllabus: {ts(m.get('syllabus', []))},\n"
                '  lessons: [\n' + '\n'.join(les) + '\n  ],\n'
                '}\n\nexport default mod\n'
            )
            idx.write_text(body, encoding='utf-8')
        (d / 'quiz').mkdir(exist_ok=True)
        imports, entries = [], []
        for i, l in enumerate(m['lessons']):
            f = d / f"{l['slug']}.mdx"
            if not f.exists():
                f.write_text(f"{{/* stub: lesson '{l['title']}' is being written */}}\n\nThis lesson is being written.\n", encoding='utf-8')
            (d / 'visuals' / l['slug']).mkdir(parents=True, exist_ok=True)
            qf = d / 'quiz' / f"{l['slug']}.ts"
            if not qf.exists():
                qf.write_text("import type { QuizQuestion } from '../../../types'\n\nconst questions: QuizQuestion[] = []\n\nexport default questions\n", encoding='utf-8')
            imports.append(f"import q{i} from './quiz/{l['slug']}'")
            entries.append(f"  {ts(l['slug'])}: q{i},")
        (d / 'quiz.ts').write_text(
            "import type { ModuleQuiz } from '../../types'\n" + '\n'.join(imports) +
            "\n\n/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */\nconst quiz: ModuleQuiz = {\n" +
            '\n'.join(entries) + "\n}\n\nexport default quiz\n", encoding='utf-8')
        (d / '.spec.json').write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"parts: {len(parts)}, modules: {len(spec['modules'])}, lessons: {sum(len(m['lessons']) for m in spec['modules'])}")


if __name__ == '__main__':
    main()
