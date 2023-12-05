#!/usr/bin/env bash

# Usage example: `./script/test-templates.sh template1 template2`

# Exit on error and print commands
set -ex

# Create a temporary directory and remove it at the end of this script regardless of the result.
# This ensures that created projects work properly in user environments since the temporary
# directory is outside of this repository. TypeScript can resolve types by looking
# up in ancestor directories' `node_modules`. Hence, if a created project is in this repository,
# it might miss errors.
tmp_dir="$(mktemp -d)"
trap 'test -d "$tmp_dir" && pnpm rimraf "$tmp_dir"' EXIT

# Test each template specified as an argument
for template_name in "$@"; do
  project_path="$tmp_dir/$template_name"

  pnpm ./dist/cli.js "$project_path" --mud-version main --template "$template_name"
  pnpm --dir "$project_path" --filter contracts run build # abi files necessary for client
  pnpm --dir "$project_path" --filter contracts --filter client exec tsc --noEmit
done
