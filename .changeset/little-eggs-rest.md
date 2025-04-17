---
"@latticexyz/entrykit": patch
---

EntryKit's `SessionClient` now automatically routes `sendUserOperation` through `callFrom` like it does with `writeContract` calls.
