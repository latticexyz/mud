#!/bin/bash

# List all changed files between the current commit and the main branch 
changed_files=$(git diff --name-only origin/main...HEAD)

# Initialize a flag to indicate if changes are found outside the 'docs/' directory
changes_outside_docs=0

# Loop through the list of changed files
for file in $changed_files; do
    # Check if the file path does not start with 'docs/'
    if [[ $file != docs/* ]]; then
        changes_outside_docs=1
        break
    fi
done

# Based on the flag, perform actions or set outputs
if [ $changes_outside_docs -eq 1 ]; then
    echo "Changes detected outside the 'docs/' directory."
    # Set an output for GitHub Actions 
    echo "::set-output name=changes_outside_docs::true"
else
    echo "No changes detected outside the 'docs/' directory."
    # Set an output for GitHub Actions 
    echo "::set-output name=changes_outside_docs::false"
fi
