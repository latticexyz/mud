// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { WorldContextConsumer } from "./WorldContext.sol";

/**
 * @title System
 * @author MUD
 * @dev The System contract currently acts as an alias for `WorldContextConsumer`.
 * This structure is chosen for potential extensions in the future, where default functionality might be added to the System.
 */

contract System is WorldContextConsumer {
  // Currently, no additional functionality is added. Future enhancements can be introduced here.
}
