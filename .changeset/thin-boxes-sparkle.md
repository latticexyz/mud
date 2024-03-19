---
"@latticexyz/cli": minor
---

`mud deploy` now supports public/linked libraries.

This helps with cases where system contracts would exceed the EVM bytecode size limit and logic would need to be split into many smaller systems.

Instead of the overhead and complexity of system-to-system calls, this logic can now be moved into public libraries that will be deployed alongside your systems and automatically `delegatecall`ed.
