---
"@latticexyz/common": major
---

- Added events, structs and enums to `contractToInterface`'s return object.
- Added corresponding types: `ContractInterfaceEvent`, `ContractInterfaceStruct`, `ContractInterfaceEnum`
- Refactored `contractToInterface` to use the relevant contract's node for visiting functions, events, structs, enums.
- Fixed `contractToInterface` adding all errors within the file to the interface, not just the contract's errors.
