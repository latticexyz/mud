---
"@latticexyz/world": minor
---

`registerRootFunctionSelector` now expects a `systemFunctionSignature` instead of a `systemFunctionSelector`. Internally, we compute the selector from the signature. This allows us to track system function signatures that are registered at the root so we can later generate ABIs for these systems.
