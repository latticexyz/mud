// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IERC173 } from "./IERC173.sol";

// The minimum requirement for a system is to have an `execute` function.
// For convenience having an `executeTyped` function with typed arguments is recommended.
interface IPayableSystem is IERC173 {
  function execute(bytes memory args) external payable returns (bytes memory);
}
