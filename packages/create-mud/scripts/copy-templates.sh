#!/usr/bin/env bash

# Find git-aware template files (ignores things like node_modules, etc.)
# and copy them to dist/templates
git ls-files ../../templates | rsync --files-from=- ../../ dist

# Replace all MUD package links with mustache placeholder used by create-create-app
# that will be replaced with the latest MUD version number when the template is used
find ./dist/templates/* -name "package.json" -type f | while read -r file; do
  echo "Before replacement in $file:"
  cat "$file"
  # GPT-4 recommended perl to edit-in-place rather than sed, because sed wasn't working on CI
  perl -pi -e 's|"(?=@latticexyz)([^"]+)":\s*"link:[^"]+"|"\1": "{{mud-version}}"|g' "$file"
  echo "After replacement in $file:"
  cat "$file"
  echo
done

# Check if any files still have "link:" dependencies
if grep -r -E 'link:' ./dist/templates; then
  echo "Linked dependencies found in dist/templates"
  exit 1
fi
