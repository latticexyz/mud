#!/usr/bin/env bash
git ls-files ../../templates | rsync --files-from=- ../../ dist
find ./dist/templates/* -name "package.json" -type f -exec sed -i '' 's/"\(@latticexyz\/.*\)": "link:.*"/"\1": "{{mud-version}}"/g' {} +
