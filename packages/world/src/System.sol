// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldContextConsumer } from "./WorldContext.sol";

/**
 * @title System
 * @dev The System contract currently acts as an alias for `WorldContextConsumer`.
 * This structure is chosen for potential extensions in the future, where default functionality might be added to the System.
 * The purpose of the System contract is to be a base layer, representing core functionalities within the ecosystem.
 */

contract System is WorldContextConsumer {
  // Currently, no additional functionality is added. Future enhancements can be introduced here.
}
