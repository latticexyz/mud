// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./IERC173.sol";

// The minimum requirement for a system is to have an `execute` function.
// For convenience having an `executeTyped` function with typed arguments is recommended.
interface ISystem is IERC173 {
  function execute(bytes memory args) external returns (bytes memory);
}
