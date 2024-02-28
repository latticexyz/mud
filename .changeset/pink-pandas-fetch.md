---
"@latticexyz/store": major
---

Moved Solidity custom errors (e.g. `Store_TableNotFound`) from `IStoreErrors` interface to file-level errors in `errors.sol`. If you were using these errors before, you may need to update your imports.
