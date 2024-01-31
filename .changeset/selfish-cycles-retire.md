---
"@latticexyz/std-contracts": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
---

Rename `MudV2Test` to `MudTest` and move from `@latticexyz/std-contracts` to `@latticexyz/store`.

```solidity
// old import
import { MudV2Test } from "@latticexyz/std-contracts/src/test/MudV2Test.t.sol";
// new import
import { MudTest } from "@latticexyz/store/src/MudTest.sol";
```

Refactor `StoreSwitch` to use a storage slot instead of `function isStore()` to determine which contract is Store:

- Previously `StoreSwitch` called `isStore()` on `msg.sender` to determine if `msg.sender` is a `Store` contract. If the call succeeded, the `Store` methods were called on `msg.sender`, otherwise the data was written to the own storage.
- With this change `StoreSwitch` instead checks for an `address` in a known storage slot. If the address equals the own address, data is written to the own storage. If it is an external address, `Store` methods are called on this address. If it is unset (`address(0)`), store methods are called on `msg.sender`.
- In practice this has the same effect as before: By default the `World` contracts sets its own address in `StoreSwitch`, while `System` contracts keep the Store address undefined, so `Systems` write to their caller (`World`) if they are executed via `call` or directly to the `World` storage if they are executed via `delegatecall`.
- Besides gas savings, this change has two additional benefits:
  1. it is now possible for `Systems` to explicitly set a `Store` address to make them exclusive to that `Store` and
  2. table libraries can now be used in tests without having to provide an explicit `Store` argument, because the `MudTest` base contract redirects reads and writes to the internal `World` contract.
