#!/usr/bin/env bash

git ls-files ../../templates | rsync --files-from=- ../../ dist

find ./dist/templates/* -name "package.json" -type f | while read -r file; do
  # GPT-4 recommended perl to edit-in-place rather than sed, because sed wasn't working on CI
  perl -pi -e 's/"\(@latticexyz\/.*\)": "link:.*"/"\1": "{{mud-version}}"/g' "$file"
done
