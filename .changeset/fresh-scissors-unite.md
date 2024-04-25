---
"@latticexyz/common": patch
---

Minor fix to resolving user types: `solc` doesn't like relative imports without `./`, but is fine with relative imports from `./../`, so we always append `./` to the relative path.
