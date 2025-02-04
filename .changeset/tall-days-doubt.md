---
"@latticexyz/store-sync": patch
---

Since Postgres doesn't support `\x00` bytes in strings, the decoded postgres indexer now removes `\x00` bytes from decoded strings.
