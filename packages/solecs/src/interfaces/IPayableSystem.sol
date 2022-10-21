// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./IOwned.sol";

// The minimum requirement for a system is to have an `execute` function.
// For convenience having an `executeTyped` function with typed arguments is recommended.
interface IPayableSystem is IOwned {
  function execute(bytes memory arguments) external payable returns (bytes memory);
}
