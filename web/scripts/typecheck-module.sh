#!/usr/bin/env bash
# Typecheck a single course module (and whatever it imports) without touching shared build info.
# Usage: scripts/typecheck-module.sh <module-slug>
set -euo pipefail
slug="${1:?usage: scripts/typecheck-module.sh <module-slug>}"
web="$(cd "$(dirname "$0")/.." && pwd)"
dir="$web/src/curriculum/modules/$slug"
[ -d "$dir" ] || { echo "no module folder: $dir" >&2; exit 2; }
cfg="$web/.tsconfig.module.$slug.$$.json"
trap 'rm -f "$cfg"' EXIT
cat > "$cfg" <<JSON
{
  "extends": "$web/tsconfig.json",
  "compilerOptions": { "noEmit": true, "incremental": false },
  "include": ["$dir/**/*.ts", "$dir/**/*.tsx", "$web/src/vite-env.d.ts"]
}
JSON
cd "$web" && npx tsc -p "$cfg" && echo "typecheck OK: $slug"
