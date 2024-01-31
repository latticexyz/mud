---
"@latticexyz/store": patch
---

Fixed M-04 Memory Corruption on Load From Storage
It only affected external use of `Storage.load` with a `memoryPointer` argument
