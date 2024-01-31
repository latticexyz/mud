---
"@latticexyz/world-modules": major
---

Modules now revert with `Module_AlreadyInstalled` if attempting to install more than once with the same calldata.

This is a temporary workaround for our deploy pipeline. We'll make these install steps more idempotent in the future.
