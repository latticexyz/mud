---
"@latticexyz/world": minor
---

The `World` has a new `callFrom` entry point which allows systems to be called on behalf of other addresses if those addresses have registered a delegation.
If there is a delegation, the call is forwarded to the system with `delegator` as `msgSender`.

```solidity
interface IBaseWorld {
  function callFrom(
    address delegator,
    bytes32 resourceSelector,
    bytes memory funcSelectorAndArgs
  ) external payable virtual returns (bytes memory);
}
```

A delegation can be registered via the `World`'s `registerDelegation` function.
If `delegatee` is `address(0)`, the delegation is considered to be a "fallback" delegation and is used in `callFrom` if there is no delegation is found for the specific caller.
Otherwise the delegation is registered for the specific `delegatee`.

```solidity
interface IBaseWorld {
  function registerDelegation(
    address delegatee,
    bytes32 delegationControl,
    bytes memory initFuncSelectorAndArgs
  ) external;
}
```

The `delegationControl` refers to the resource selector of a `DelegationControl` system that must have been registered beforehand.
As part of registering the delegation, the `DelegationControl` system is called with the provided `initFuncSelectorAndArgs`.
This can be used to initialize data in the given `DelegationControl` system.

The `DelegationControl` system must implement the `IDelegationControl` interface:

```solidity
interface IDelegationControl {
  function verify(address delegator, bytes32 systemId, bytes calldata funcSelectorAndArgs) external returns (bool);
}
```

When `callFrom` is called, the `World` checks if a delegation is registered for the given caller, and if so calls the delegation control's `verify` function with the same same arguments as `callFrom`.
If the call to `verify` is successful and returns `true`, the delegation is valid and the call is forwarded to the system with `delegator` as `msgSender`.

Note: if `UNLIMITED_DELEGATION` (from `@latticexyz/world/src/constants.sol`) is passed as `delegationControl`, the external call to the delegation control contract is skipped and the delegation is considered valid.

For examples of `DelegationControl` systems, check out the `CallboundDelegationControl` or `TimeboundDelegationControl` systems in the `std-delegations` module.
See `StandardDelegations.t.sol` for usage examples.
